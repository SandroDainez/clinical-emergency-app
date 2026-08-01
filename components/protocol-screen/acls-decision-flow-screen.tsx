import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { DecisionTreeEngine } from "../../core/decision-tree/engine";
import type { DecisionTreeDefinition, FrontendTreeStep } from "../../core/decision-tree/types";
import StepHeaderBar from "./template/StepHeaderBar";
import DecisionGrid from "./template/DecisionGrid";
import StabilizationFirstCard from "./stabilization-first-card";
import CalculadoraEmbutida from "./calculadora-embutida";
import { useTr } from "../../lib/use-tr";
import { faixaDeEntradaDe } from "../../lib/faixas-de-entrada";
import { guardarNoContexto, lerDoContexto } from "../../lib/contexto-do-paciente";
import { useUiV2Enabled } from "../../lib/ui-v2-flag";
import { Card, Header, InstrucaoResumida, NumericStepper, Tag } from "../ui-v2";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { useFadeDeEtapa } from "../../design-system/motion";
import {
  descartarSessaoDeFluxo,
  lerSessaoDeFluxo,
  salvarSessaoDeFluxo,
  type SessaoDeFluxo,
} from "../../lib/flow-session";

type AclsDecisionFlowScreenProps = {
  tree: DecisionTreeDefinition;
  /** Rótulo curto exibido no topo (ex.: "Bradicardia ACLS"). */
  protocolLabel: string;
  /** Subtítulo opcional sob o título. */
  intro?: string;
  /** Fonte/rodapé (ex.: "Baseado em AHA ACLS 2025"). */
  source?: string;
  /** Título grande do cabeçalho (default "ACLS · Emergência"). */
  headerTitle?: string;
  /** Slug do módulo atual — remove o atalho de auto-referência no card de estabilização. */
  currentModuleSlug?: string;
  /** Conteúdo opcional fixo no topo (ex.: configurador da VM), sempre visível. */
  topContent?: ReactNode;
};

const DISPOSITION_META: Record<
  FrontendTreeStep extends { kind: "transition" } ? string : string,
  { label: string; color: string; bg: string; border: string }
> = {
  discharge: { label: "Alta / observação domiciliar", color: "#86efac", bg: "#052e16", border: "#166534" },
  observation: { label: "Observação monitorizada", color: "#fdba74", bg: "#431407", border: "#c2410c" },
  icu: { label: "UTI / cuidado intensivo", color: "#c4b5fd", bg: "#2e1065", border: "#6d28d9" },
  other_module: { label: "Transição de guia", color: "#93c5fd", bg: "#1e3a5f", border: "#2563eb" },
};

export default function AclsDecisionFlowScreen({
  tree,
  protocolLabel,
  intro,
  source,
  headerTitle,
  currentModuleSlug,
  topContent,
}: AclsDecisionFlowScreenProps) {
  const tr = useTr();
  const router = useRouter();

  // Fase 7: a flag é por MÓDULO, mesmo o shell sendo um só. Os 19 chamadores já
  // passam `currentModuleSlug`, então dá para habilitar a UI 2.0 num módulo sem
  // arrastar os outros 18 junto — validação incremental num arquivo compartilhado.
  const emV2 = useUiV2Enabled(currentModuleSlug ?? "");

  const engineRef = useRef<DecisionTreeEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new DecisionTreeEngine(tree);
  }
  const engine = engineRef.current;

  const [step, setStep] = useState<FrontendTreeStep>(() => engine.toFrontendStep());
  const [canGoBack, setCanGoBack] = useState<boolean>(() => engine.canGoBack());
  const [trail, setTrail] = useState<string[]>(() => [engine.toFrontendStep().title]);

  // ───────────────────────────────────────────────────────────────────────────
  // Retomada de fluxo (defeito relatado: sair para consultar outro protocolo
  // fazia perder o progresso). O que a tela guarda é o que a tela já sabe —
  // caminho de nós e valores digitados. `engine.ts` não foi tocado: `history` e
  // `values` seguem privados. Ver lib/flow-session.ts.
  // ───────────────────────────────────────────────────────────────────────────
  const caminhoRef = useRef<string[]>([engine.getCurrentNode().id]);
  const valoresRef = useRef<Record<string, string>>({});

  const [ofertaDeRetomada, setOfertaDeRetomada] = useState<SessaoDeFluxo | undefined>(undefined);

  // Leitura em efeito, não no render: o primeiro render do cliente tem de bater
  // com o do build estático. Foi essa disciplina que resolveu o L-001. O ref
  // garante leitura única — o efeito de salvamento roda depois e sobrescreve o
  // que está no mapa.
  const jaLeuSessao = useRef(false);
  useEffect(() => {
    if (jaLeuSessao.current) return;
    jaLeuSessao.current = true;
    const salva = lerSessaoDeFluxo(currentModuleSlug, Date.now());
    if (salva) setOfertaDeRetomada(salva);
  }, [currentModuleSlug]);

  // Salva a cada etapa, não ao desmontar.
  //
  // Salvar na limpeza do efeito parecia mais elegante e estava ERRADO: quando o
  // retorno passa por `router.replace` (é o que o "← Anafilaxia" do módulo de
  // destino faz), a tela nova monta e LÊ o mapa antes de a antiga desmontar e
  // gravar — a oferta nunca aparecia. Medido, não deduzido: o teste de sonda
  // voltava ao passo 1 sem barra nenhuma.
  //
  // Gravando a cada etapa, o mapa está sempre atualizado e a ordem de
  // montagem deixa de importar. É uma escrita em `Map` por toque: irrelevante.
  useEffect(() => {
    salvarSessaoDeFluxo(currentModuleSlug, {
      caminho: [...caminhoRef.current],
      valores: { ...valoresRef.current },
      trilha: [...trail],
      salvoEm: Date.now(),
    });
  }, [currentModuleSlug, step, trail]);

  /**
   * Abre outro módulo marcando de onde veio.
   *
   * O `from_module` já era o mecanismo do app (o PCR usa nos atalhos de causas
   * reversíveis) e faz o destino mostrar a volta para a origem. Os atalhos deste
   * shell empurravam a rota crua, então o destino não tinha como saber que havia
   * um protocolo em andamento atrás dele — metade do defeito relatado.
   */
  const abrirOutroModulo = (slug: string) => {
    const origem = currentModuleSlug ? `?from_module=${currentModuleSlug}` : "";
    router.push(`/modulos/${slug}${origem}` as never);
  };

  const comecarDoInicio = () => {
    setOfertaDeRetomada(undefined);
    descartarSessaoDeFluxo(currentModuleSlug);
  };

  const retomar = () => {
    const salva = ofertaDeRetomada;
    if (!salva) return;

    const destino = salva.caminho[salva.caminho.length - 1];
    let chegou = false;
    try {
      engine.reset();
      for (const nodeId of salva.caminho.slice(1)) {
        engine.goToNode(nodeId);
      }
      for (const [campo, valor] of Object.entries(salva.valores)) {
        engine.setValue(campo, valor);
      }
      chegou = engine.getCurrentNode().id === destino;
    } catch {
      // Árvore mudou entre o salvamento e a volta (deploy novo, nó renomeado).
      chegou = false;
    }

    if (!chegou) {
      // Melhor recomeçar limpo do que mostrar um passo que não corresponde ao
      // que ele estava fazendo. Em tela clínica, posição errada é pior que
      // posição nenhuma.
      engine.reset();
      caminhoRef.current = [engine.getCurrentNode().id];
      valoresRef.current = {};
      sync(undefined, [engine.toFrontendStep().title]);
      comecarDoInicio();
      return;
    }

    caminhoRef.current = [...salva.caminho];
    valoresRef.current = { ...salva.valores };
    sync(undefined, salva.trilha);
    comecarDoInicio();
  };

  const sync = (pushTitle?: string, replaceTrail?: string[]) => {
    const next = engine.toFrontendStep();
    setStep(next);
    setCanGoBack(engine.canGoBack());
    if (replaceTrail) {
      setTrail(replaceTrail);
    } else if (pushTitle !== undefined) {
      setTrail((current) => [...current, pushTitle]);
    }
  };

  const handleChoose = (optionId: string) => {
    const next = engine.choose(optionId);
    caminhoRef.current.push(next.id);
    sync(next.title);
  };

  const handleAdvance = () => {
    const next = engine.advance();
    caminhoRef.current.push(next.id);
    sync(next.title);
  };

  const handleSetValue = (fieldId: string, value: string) => {
    engine.setValue(fieldId, value);
    valoresRef.current[fieldId] = value;
    // Guarda o que NÃO muda durante o atendimento (peso, altura, sexo, idade)
    // para os outros módulos não perguntarem de novo. Sinal vital não entra —
    // ver a justificativa em lib/contexto-do-paciente.ts.
    guardarNoContexto(fieldId, value, currentModuleSlug ?? "");
    // Mexeu no campo: o valor passou a ser dele, não herdado.
    herdadosRef.current.delete(fieldId);
    // Re-renderiza o passo atual (sem alterar a trilha) para refletir o valor.
    setStep(engine.toFrontendStep());
  };

  // Quais campos deste passo vieram do contexto, e não do usuário. Sem isto o
  // aviso "aproveitado" aparecia também quando ELE acabara de informar o valor
  // — porque o valor digitado é idêntico ao guardado, já que guardar acontece
  // ao informar. Além de mentir, o texto surgindo empurrava o layout no meio da
  // interação.
  const herdadosRef = useRef<Set<string>>(new Set());

  // Pré-preenche o que o app já sabe deste paciente. Roda a cada passo de
  // entrada: se o campo ainda está vazio e o contexto tem o valor, ele entra
  // sozinho — e o passo mostra de onde veio, para o usuário poder discordar.
  useEffect(() => {
    if (step.kind !== "input") return;
    herdadosRef.current = new Set();
    for (const field of step.fields) {
      if (step.values[field.id] !== undefined) continue;
      const guardado = lerDoContexto(field.id);
      if (!guardado) continue;
      engine.setValue(field.id, guardado.valor);
      valoresRef.current[field.id] = guardado.valor;
      herdadosRef.current.add(field.id);
    }
    setStep(engine.toFrontendStep());
    // `step.id` como dependência: reexecuta ao TROCAR de passo, não a cada
    // digitação — senão o pré-preenchimento brigaria com o que o usuário digita.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const handleBack = () => {
    if (!engine.canGoBack()) return;
    engine.goBack();
    if (caminhoRef.current.length > 1) caminhoRef.current.pop();
    setTrail((current) => (current.length > 1 ? current.slice(0, -1) : current));
    setStep(engine.toFrontendStep());
    setCanGoBack(engine.canGoBack());
  };

  const handleReset = () => {
    engine.reset();
    caminhoRef.current = [engine.getCurrentNode().id];
    valoresRef.current = {};
    // Reiniciar é declarar que o fluxo anterior não interessa mais — a sessão
    // salva vai junto, senão a oferta de retomar reapareceria depois.
    descartarSessaoDeFluxo(currentModuleSlug);
    sync(undefined, [engine.toFrontendStep().title]);
  };

  const stepCount = trail.length;

  // Fase 8: fade de entrada na troca de etapa. O conteúdo já está montado e
  // tocável no primeiro frame — anima só a opacidade, de 0,4 para 1. Não parte
  // de zero de propósito: texto clínico invisível, ainda que por 200 ms, é pior
  // que transição nenhuma.
  const opacidadeDaEtapa = useFadeDeEtapa(emV2 ? step.id ?? stepCount : "sem-animacao");

  return (
    <View style={styles.screen}>
      {/* Cabeçalho compacto (Fase 7). Mesmo ganho medido na Fase 4: o cromado do
          módulo (61 px) e o StepHeaderBar (66 px) diziam a mesma coisa.
          O título usa `headerTitle` ("Anafilaxia · Emergência"), que é o rótulo
          informativo que o StepHeaderBar exibia — usar só `protocolLabel`
          perderia o contexto, e o teste de travessia pegou isso.
          O voltar é a MESMA ação: router.back(). */}
      {emV2 ? (
        <Header
          // Nome do MÓDULO, não o rótulo curto de contexto.
          //
          // Antes eu usava `headerTitle` ("TEP · Emergência", "SCA · Emergência")
          // e, na falta dele, o default "ACLS · Emergência" — que é simplesmente
          // errado num módulo de TEP ou de EAP. O que identifica onde o médico
          // está é o nome que ele tocou no hub.
          titulo={tr(protocolLabel)}
          etapa={`${tr("Passo")} ${stepCount}`}
          onVoltar={() => router.back()}
        />
      ) : null}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {emV2 ? null : (
          <StepHeaderBar protocolLabel={tr(protocolLabel)} onBack={() => router.back()} title={headerTitle ? tr(headerTitle) : undefined} />
        )}

        {ofertaDeRetomada ? (
          <BarraDeRetomada
            passo={ofertaDeRetomada.trilha.length}
            titulo={ofertaDeRetomada.trilha[ofertaDeRetomada.trilha.length - 1] ?? ""}
            onContinuar={retomar}
            onComecarDoInicio={comecarDoInicio}
          />
        ) : null}

        <StabilizationFirstCard
          compacto={emV2}
          defaultExpanded={stepCount === 1}
          currentModuleSlug={currentModuleSlug}
          onOpenModule={(slug) => abrirOutroModulo(slug)}
        />

        {topContent}

        {intro && stepCount === 1 && emV2 ? (
          // Descrição do módulo em 2 linhas, com o texto completo a um toque.
          // São 120 px que ficavam entre o card de estabilização e a decisão
          // clínica — e o texto é orientação de uso, não conduta.
          <InstrucaoResumida
            resumo={tr(intro)}
            completo={tr(intro)}
            tituloCompleto={tr(protocolLabel)}
          />
        ) : null}
        {intro && stepCount === 1 && !emV2 ? (
          <View style={styles.introCard}>
            <Text style={styles.introText}>{tr(intro)}</Text>
          </View>
        ) : null}

        {/* Trilha de progresso */}
        <View style={styles.trailRow}>
          <View style={styles.trailBadge}>
            <Text style={styles.trailBadgeText}>{tr("Passo")} {stepCount}</Text>
          </View>
          <Text style={styles.trailText} numberOfLines={1}>
            {tr(trail[trail.length - 1])}
          </Text>
        </View>

        <Animated.View style={emV2 ? { opacity: opacidadeDaEtapa } : undefined}>
        {step.kind === "decision" ? (
          <DecisionStep step={step} onChoose={handleChoose} emV2={emV2} />
        ) : step.kind === "action" ? (
          <ActionStep step={step} onAdvance={handleAdvance} emV2={emV2} />
        ) : step.kind === "input" ? (
          <InputStep
            step={step}
            onSetValue={handleSetValue}
            onAdvance={handleAdvance}
            herdados={herdadosRef.current}
          />
        ) : (
          <TransitionStep
            step={step}
            onOpenModule={(moduleId) => abrirOutroModulo(moduleId.replace(/_/g, "-"))}
          />
        )}
        </Animated.View>

        {/* Controles */}
        <View style={styles.controlsRow}>
          <Pressable
            style={[styles.controlButton, !canGoBack && styles.controlButtonDisabled]}
            onPress={handleBack}
            disabled={!canGoBack}>
            <Text style={[styles.controlButtonText, !canGoBack && styles.controlButtonTextDisabled]}>
              {tr("‹ Voltar")}
            </Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={handleReset}>
            <Text style={styles.controlButtonText}>{tr("↺ Recomeçar")}</Text>
          </Pressable>
        </View>

        {source ? <Text style={styles.sourceText}>{tr(source)}</Text> : null}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

/**
 * Lista de critérios do passo de decisão, recolhida por padrão.
 *
 * ── POR QUE RECOLHER ─────────────────────────────────────────────────────────
 *
 * Cada nó de decisão exibia a lista inteira de evidências aberta. Num passo
 * como "há sinais de instabilidade?" são cinco linhas de texto corrido antes de
 * chegar aos botões — e isso se repete em 19 árvores. Somado ao pedido do
 * usuário de "deixar o melhor possível sem muita poluição de tela", a lista
 * aberta é o maior consumidor de altura do fluxo.
 *
 * Recolhida, o passo cabe na tela: pergunta, botões, e os critérios a um toque
 * de distância para quem quiser conferir.
 *
 * ── POR QUE NÃO SUMIR COM ELA ────────────────────────────────────────────────
 *
 * Os critérios são a justificativa clínica da pergunta. Escondê-los de vez
 * transformaria o passo num comando sem fundamento — e é justamente o que
 * distingue este app de um fluxograma impresso. Ficam a um toque.
 *
 * Listas curtas (até dois itens) continuam abertas: recolher duas linhas custa
 * um toque e não devolve altura nenhuma.
 */
function ListaDeCriterios({
  itens,
  estilos,
}: {
  itens: string[];
  estilos: {
    lista: StyleProp<ViewStyle>;
    linha: StyleProp<ViewStyle>;
    marcador: StyleProp<ViewStyle>;
    texto: StyleProp<TextStyle>;
    alternar: StyleProp<TextStyle>;
  };
}) {
  const tr = useTr();
  const curta = itens.length <= 2;
  const [aberto, setAberto] = useState(curta);

  if (!itens.length) return null;

  return (
    <>
      {curta ? null : (
        <Pressable
          onPress={() => setAberto((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: aberto }}
          hitSlop={8}>
          <Text style={estilos.alternar}>
            {aberto
              ? `${tr("Ocultar critérios")} ▴`
              : `${tr("Ver critérios")} (${itens.length}) ▾`}
          </Text>
        </Pressable>
      )}

      {aberto ? (
        <View style={estilos.lista}>
          {itens.map((item, index) => (
            <View key={index} style={estilos.linha}>
              <View style={estilos.marcador} />
              <Text style={estilos.texto}>{tr(item)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}

function DecisionStep({
  step,
  onChoose,
  emV2,
}: {
  step: Extract<FrontendTreeStep, { kind: "decision" }>;
  onChoose: (id: string) => void;
  emV2?: boolean;
}) {
  const tr = useTr();
  const v = useEstilosDoTema(criarEstilosV2);

  if (emV2) {
    return (
      <View style={styles.stepStack}>
        <Card tom="primary" style={v.cartao}>
          <Tag label={tr("Decisão clínica")} />
          <Text style={v.titulo}>{tr(step.title)}</Text>
          <Text style={v.texto}>{tr(step.question)}</Text>
          {step.summary ? <Text style={v.resumo}>{tr(step.summary)}</Text> : null}
          <ListaDeCriterios
            itens={step.evidence}
            estilos={{
              lista: v.lista,
              linha: v.linha,
              marcador: v.marcador,
              texto: v.itemTexto,
              alternar: v.alternarCriterios,
            }}
          />
        </Card>
        <DecisionGrid
          options={step.options.map((o) => ({ id: o.id, label: tr(o.label) }))}
          onSelect={onChoose}
          title={tr("Toque para decidir")}
        />
      </View>
    );
  }

  return (
    <View style={styles.stepStack}>
      <View style={styles.questionCard}>
        <Text style={styles.questionEyebrow}>{tr("Decisão clínica")}</Text>
        <Text style={styles.questionTitle}>{tr(step.title)}</Text>
        <Text style={styles.questionText}>{tr(step.question)}</Text>
        {step.summary ? <Text style={styles.questionSummary}>{tr(step.summary)}</Text> : null}
        <ListaDeCriterios
          itens={step.evidence}
          estilos={{
            lista: styles.evidenceList,
            linha: styles.evidenceRow,
            marcador: styles.evidenceDot,
            texto: styles.evidenceText,
            alternar: styles.evidenceToggle,
          }}
        />
      </View>
      <DecisionGrid
        options={step.options.map((o) => ({ id: o.id, label: tr(o.label) }))}
        onSelect={onChoose}
        title={tr("Toque para decidir")}
      />
    </View>
  );
}

function ActionStep({
  step,
  onAdvance,
  emV2,
}: {
  step: Extract<FrontendTreeStep, { kind: "action" }>;
  onAdvance: () => void;
  emV2?: boolean;
}) {
  const tr = useTr();
  const v = useEstilosDoTema(criarEstilosV2);

  if (emV2) {
    return (
      <View style={styles.stepStack}>
        <Card tom="critical" style={v.cartao}>
          <Tag label={tr("Conduta — fazer agora")} />
          <Text style={v.titulo}>{tr(step.title)}</Text>
          {step.summary ? <Text style={v.resumo}>{tr(step.summary)}</Text> : null}
          <View style={v.lista}>
            {step.actions.map((item, index) => (
              <View key={index} style={v.linhaNumerada}>
                <View style={v.numero}>
                  <Text style={v.numeroTexto}>{index + 1}</Text>
                </View>
                <Text style={v.itemTexto}>{tr(item)}</Text>
              </View>
            ))}
          </View>
        </Card>
        <Pressable
          accessibilityRole="button"
          onPress={onAdvance}
          style={({ pressed }) => [v.botaoAvancar, pressed && v.botaoPressionado]}
        >
          <Text style={v.botaoTexto}>{tr("Feito — continuar ›")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.stepStack}>
      <View style={styles.actionCard}>
        <Text style={styles.actionEyebrow}>{tr("Conduta — fazer agora")}</Text>
        <Text style={styles.actionTitle}>{tr(step.title)}</Text>
        {step.summary ? <Text style={styles.actionSummary}>{tr(step.summary)}</Text> : null}
        <View style={styles.actionList}>
          {step.actions.map((item, index) => (
            <View key={index} style={styles.actionItemRow}>
              <View style={styles.actionCheck}>
                <Text style={styles.actionCheckText}>{index + 1}</Text>
              </View>
              <Text style={styles.actionItemText}>{tr(item)}</Text>
            </View>
          ))}
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.advanceButton, pressed && styles.advanceButtonPressed]}
        onPress={onAdvance}>
        <Text style={styles.advanceButtonText}>{tr("Feito — continuar ›")}</Text>
      </Pressable>
    </View>
  );
}

/**
 * Faixa do slider de um campo, DERIVADA dos presets do próprio protocolo.
 *
 * Nada de limite inventado aqui. Se a árvore de ventilação oferece alturas de 150
 * a 190 cm, o slider vai de 150 a 190 — porque essa é a faixa que o conteúdo
 * clínico declarou, não uma que eu tenha achado razoável. Inventar mínimo e
 * máximo de peso, altura ou dose seria criar regra clínica na camada de
 * apresentação.
 *
 * Valor fora da faixa continua alcançável pelo "Outro…", que permanece no lugar.
 * Por isso derivar é seguro: estreitar o slider não torna nada inatingível.
 *
 * Devolve `undefined` quando o campo não é numérico ou tem menos de dois presets
 * numéricos — sem dois pontos não há faixa, e um slider de um ponto só é enfeite.
 */
/**
 * Limites da barra de arrastar de um campo numérico.
 *
 * A primeira versão derivava min e max dos PRESETS. Como os presets são valores
 * curados pelo protocolo (peso 50, 60, 70, 80, 90, 100), a barra ia de 50 a
 * 100 kg — e a senhora de 45 kg e o paciente de 120 kg ficavam fora do alcance
 * do controle rápido. Mesma coisa na sepse com PAS 60, na SpO₂ de 100%, na
 * hipoglicemia de 30 e no NIHSS acima de 25.
 *
 * Agora os limites vêm da GRANDEZA, em lib/faixas-de-entrada.ts, que é uma
 * tabela de limites de ENTRADA — não de normalidade nem de gravidade. Os
 * presets continuam iguais e continuam sendo o toque mais rápido; a barra passa
 * a alcançar o que está fora deles.
 *
 * Campo sem faixa declarada volta ao comportamento antigo, derivando dos
 * presets. O script de validação cobra que todo campo numérico tenha faixa, de
 * modo que esse retorno é rede de segurança e não caminho normal.
 */
function faixaNumerica(field: {
  id: string;
  presets: { value: string }[];
  customKeyboard?: "numeric" | "default";
}): { min: number; max: number; passo: number } | undefined {
  if (field.customKeyboard !== "numeric") return undefined;

  const declarada = faixaDeEntradaDe(field.id);
  if (declarada) {
    return { min: declarada.min, max: declarada.max, passo: declarada.passo };
  }

  const numeros = field.presets
    .map((p) => Number(p.value.replace(",", ".")))
    .filter((n) => Number.isFinite(n));
  if (numeros.length < 2) return undefined;

  const min = Math.min(...numeros);
  const max = Math.max(...numeros);
  if (min === max) return undefined;

  // Passo pela precisão dos presets: valores inteiros andam de 1 em 1; se o
  // protocolo escreve "0,5", o slider anda de 0,5. Decisão de apresentação, não
  // clínica — a granularidade que o conteúdo usa é a que o controle oferece.
  const maisCasas = Math.max(
    ...field.presets.map((p) => {
      const parte = p.value.replace(",", ".").split(".")[1];
      return parte ? parte.length : 0;
    })
  );
  const passo = maisCasas === 0 ? 1 : Number((10 ** -maisCasas).toFixed(maisCasas));

  return { min, max, passo };
}

function InputStep({
  step,
  onSetValue,
  onAdvance,
  herdados,
}: {
  step: Extract<FrontendTreeStep, { kind: "input" }>;
  onSetValue: (fieldId: string, value: string) => void;
  onAdvance: () => void;
  /** Campos preenchidos pelo contexto do paciente, não pelo usuário. */
  herdados: Set<string>;
}) {
  const tr = useTr();
  const [customOpen, setCustomOpen] = useState<Record<string, boolean>>({});
  const [customText, setCustomText] = useState<Record<string, string>>({});

  return (
    <View style={styles.stepStack}>
      {/* testID para o E2E conseguir ESCOPO. Sem ele, um `hasText: /^160$/`
          casava também com o configurador de ventilação que fica no topo da
          mesma tela (`topContent`) — o teste clicava no elemento errado e
          acusava defeito onde não havia. */}
      <View style={styles.inputCard} testID="passo-de-entrada">
        <Text style={styles.inputEyebrow}>{tr("Informar — toque no valor")}</Text>
        <Text style={styles.inputTitle}>{tr(step.title)}</Text>
        {step.intro ? <Text style={styles.inputIntro}>{tr(step.intro)}</Text> : null}

        {step.fields.map((field) => {
          const current = step.values[field.id];
          const isPreset = field.presets.some((p) => p.value === current);
          const showingCustom = customOpen[field.id] || (current !== undefined && !isPreset);
          const faixa = faixaNumerica(field);
          const valorNumerico = current !== undefined ? Number(current.replace(",", ".")) : undefined;
          return (
            <View key={field.id} style={styles.inputField}>
              <View style={styles.inputFieldHeader}>
                <Text style={styles.inputFieldLabel}>
                  {tr(field.label)}
                  {field.unit ? <Text style={styles.inputUnit}> ({field.unit})</Text> : null}
                </Text>
                {current !== undefined ? (
                  <Text style={styles.inputFieldValue}>
                    {/* O RÓTULO do preset, não o valor gravado. Num campo Sim/Não
                        o valor é "nao" e era isso que aparecia na tela — dado
                        cru vazando para a interface. */}
                    {field.presets.find((p) => p.value === current)?.label ?? current}
                    {field.unit ? ` ${field.unit}` : ""}
                  </Text>
                ) : null}
              </View>

              {/* Barra de arrastar para campo numérico — pedido explícito do
                  usuário: "onde se tem dados para preencher tipo peso, altura
                  ... pedi uma barra de arrastar para selecionar e ainda
                  permanece os cards para preencher".

                  O NumericStepper (slider + botões −/+) já existia desde a Fase
                  2 e só nunca foi ligado aqui. Os presets CONTINUAM: são valores
                  curados pelo protocolo e continuam sendo o toque mais rápido —
                  o slider é para o que está entre eles. Arrastar com luva é mais
                  rápido e menos sujeito a erro que teclado numérico. */}
              {faixa ? (
                <NumericStepper
                  valor={
                    valorNumerico !== undefined && Number.isFinite(valorNumerico)
                      ? valorNumerico
                      : // Sem valor escolhido o controle parte do MEIO da faixa,
                        // não de um número que pareça sugestão clínica. E só grava
                        // quando ele arrasta: nada é preenchido por conta própria.
                        Number(((faixa.min + faixa.max) / 2).toFixed(0))
                  }
                  onChange={(n) => {
                    onSetValue(field.id, String(n));
                    setCustomOpen((s) => ({ ...s, [field.id]: false }));
                  }}
                  min={faixa.min}
                  max={faixa.max}
                  passo={faixa.passo}
                  unidade={field.unit}
                  testID={`slider-${field.id}`}
                />
              ) : null}

              {/* Valor herdado de outro módulo — dito em voz alta.
                  Preencher sozinho e ficar calado seria pior que perguntar: o
                  usuário veria um número, não teria por que duvidar dele, e não
                  saberia que ninguém mediu agora. */}
              {herdados.has(field.id) ? (
                <Text style={styles.herdadoAviso}>
                  {tr("Aproveitado do que você já informou neste atendimento — confira e ajuste se mudou.")}
                </Text>
              ) : null}

              {/* Calculadora embutida, quando o campo declara uma. Fica ANTES
                  da barra: quem não sabe o valor calcula aqui e o total cai no
                  campo; quem sabe ignora e arrasta. */}
              {field.calculadora ? (
                <CalculadoraEmbutida
                  calculadoraId={field.calculadora}
                  valorAtual={current}
                  onTotal={(n) => onSetValue(field.id, String(n))}
                />
              ) : null}

              {/* Campo NUMÉRICO: só a barra.
                  Pedido do usuário — "só devemos ter as barras para seleção em
                  todo o app, nada de caixas". Os chips de preset e o "Outro…"
                  saíram: com a barra ancorada na faixa da grandeza (e não mais
                  nos presets), qualquer valor plausível é alcançável
                  arrastando, e os botões −/+ dão o ajuste fino de 1 em 1 (ou
                  0,1 / 0,01 conforme a grandeza). Não sobrou nada que só o
                  chip alcançasse.

                  Campo CATEGÓRICO (sexo, janela de tempo, início dos sintomas)
                  continua em botão: não é número, não tem barra possível. */}
              {faixa ? null : (
                <>
                  <View style={styles.presetWrap}>
                    {field.presets.map((preset) => {
                      const active = current === preset.value;
                      return (
                        <Pressable
                          key={preset.value}
                          onPress={() => {
                            onSetValue(field.id, preset.value);
                            setCustomOpen((s) => ({ ...s, [field.id]: false }));
                          }}
                          style={({ pressed }) => [
                            styles.presetChip,
                            active && styles.presetChipActive,
                            pressed && styles.presetChipPressed,
                          ]}>
                          <Text style={[styles.presetChipText, active && styles.presetChipTextActive]}>
                            {preset.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                    {field.allowCustom ? (
                      <Pressable
                        onPress={() => setCustomOpen((s) => ({ ...s, [field.id]: !showingCustom }))}
                        style={({ pressed }) => [
                          styles.presetChip,
                          styles.presetChipOther,
                          showingCustom && styles.presetChipActive,
                          pressed && styles.presetChipPressed,
                        ]}>
                        <Text style={[styles.presetChipText, showingCustom && styles.presetChipTextActive]}>
                          {tr("Outro…")}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>

                  {field.allowCustom && showingCustom ? (
                    <View style={styles.customRow}>
                      <TextInput
                        value={customText[field.id] ?? (isPreset ? "" : current ?? "")}
                        onChangeText={(t) => setCustomText((s) => ({ ...s, [field.id]: t }))}
                        placeholder={field.customLabel ? tr(field.customLabel) : tr("Digitar valor")}
                        placeholderTextColor="#64748b"
                        keyboardType={field.customKeyboard === "numeric" ? "numeric" : "default"}
                        style={styles.customInput}
                        returnKeyType="done"
                        onSubmitEditing={() => {
                          const v = (customText[field.id] ?? "").trim();
                          if (v) onSetValue(field.id, v);
                        }}
                      />
                      <Pressable
                        onPress={() => {
                          const v = (customText[field.id] ?? "").trim();
                          if (v) onSetValue(field.id, v);
                        }}
                        style={({ pressed }) => [styles.customAdd, pressed && { opacity: 0.85 }]}>
                        <Text style={styles.customAddText}>OK</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </>
              )}
            </View>
          );
        })}
      </View>

      <Pressable
        disabled={!step.canContinue}
        style={({ pressed }) => [
          styles.advanceButton,
          !step.canContinue && styles.advanceButtonDisabled,
          pressed && step.canContinue && styles.advanceButtonPressed,
        ]}
        onPress={onAdvance}>
        <Text style={[styles.advanceButtonText, !step.canContinue && styles.advanceButtonTextDisabled]}>
          {step.canContinue
            ? tr("Confirmar — continuar ›")
            : (() => {
                // "Preencha os campos" não diz QUAL falta. No passo guiado, com
                // cinco campos, o usuário fica sem saber o que o app espera —
                // e o campo numérico é o que mais passa despercebido, porque a
                // barra JÁ mostra um número (o meio da faixa) sem tê-lo gravado.
                // Isso é de propósito: o app não inventa valor clínico. Mas
                // então ele precisa dizer que está esperando um toque.
                const faltando = step.fields.filter(
                  (f) => !f.optional && step.values[f.id] === undefined
                );
                if (faltando.length === 1) {
                  return `${tr("Falta informar")}: ${tr(faltando[0].label)}`;
                }
                return `${tr("Faltam")} ${faltando.length} ${tr("campos")}`;
              })()}
        </Text>
      </Pressable>
    </View>
  );
}

function TransitionStep({
  step,
  onOpenModule,
}: {
  step: Extract<FrontendTreeStep, { kind: "transition" }>;
  onOpenModule: (moduleId: string) => void;
}) {
  const tr = useTr();
  const meta = DISPOSITION_META[step.disposition] ?? DISPOSITION_META.observation;
  return (
    <View style={styles.stepStack}>
      <View style={[styles.transitionCard, { backgroundColor: meta.bg, borderColor: meta.border }]}>
        <View style={[styles.dispositionBadge, { borderColor: meta.border }]}>
          <Text style={[styles.dispositionBadgeText, { color: meta.color }]}>{tr(meta.label)}</Text>
        </View>
        <Text style={styles.transitionTitle}>{tr(step.title)}</Text>
        {step.summary ? <Text style={styles.transitionSummary}>{tr(step.summary)}</Text> : null}
        {step.exitCriteria.length > 0 ? (
          <View style={styles.evidenceList}>
            {step.exitCriteria.map((item, index) => (
              <View key={index} style={styles.evidenceRow}>
                <View style={[styles.evidenceDot, { backgroundColor: meta.color }]} />
                <Text style={styles.evidenceText}>{tr(item)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      {step.targets.map((target) => (
        <Pressable
          key={target.moduleId}
          style={({ pressed }) => [styles.targetCard, pressed && styles.targetCardPressed]}
          onPress={() => onOpenModule(target.moduleId)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.targetLabel}>{tr(target.label)}</Text>
            <Text style={styles.targetReason}>{tr(target.reason)}</Text>
          </View>
          <Text style={styles.targetChevron}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

/**
 * Estilos da UI 2.0 para os passos migrados.
 *
 * Derivados do tema dentro do componente (`useEstilosDoTema`) porque
 * `StyleSheet.create` no topo do arquivo congelaria a cor no tema do import —
 * a armadilha documentada em design-system/theme.ts.
 */
const criarEstilosV2 = (t: Tema) => {
  const c = t.cores;
  return StyleSheet.create({
    cartao: { gap: ESPACO.sm },
    titulo: { ...TIPOGRAFIA.step, color: c.text },
    texto: { ...TIPOGRAFIA.caption, color: c.text, fontWeight: "400" },
    resumo: { ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },
    lista: { gap: ESPACO.xs, marginTop: ESPACO.xs },
    linha: { flexDirection: "row", alignItems: "baseline", gap: ESPACO.sm },
    linhaNumerada: { flexDirection: "row", alignItems: "flex-start", gap: ESPACO.sm },
    marcador: {
      width: 6,
      height: 6,
      borderRadius: RAIO.badge,
      backgroundColor: c.primary,
    },
    numero: {
      minWidth: 22,
      height: 22,
      borderRadius: RAIO.badge,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.critical,
    },
    numeroTexto: { ...TIPOGRAFIA.micro, color: c.onCritical },
    itemTexto: { flex: 1, ...TIPOGRAFIA.micro, color: c.textSecondary, fontWeight: "400" },
    alternarCriterios: { ...TIPOGRAFIA.caption, color: c.primary, fontWeight: "700" },
    // Ação de avançar: altura de botão crítico, porque é o toque que move o caso.
    botaoAvancar: {
      minHeight: TOQUE.critico,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      backgroundColor: TEMAS_FILL_PRIMARIO,
      paddingHorizontal: ESPACO.lg,
    },
    botaoPressionado: { opacity: 0.88, transform: [{ scale: 0.98 }] },
    botaoTexto: { ...TIPOGRAFIA.caption, color: "#ffffff", fontWeight: "800" },
  });
};

/**
 * Barra de retomada.
 *
 * Aparece só quando existe progresso salvo deste módulo. Uma linha, dois toques
 * possíveis, e nenhuma decisão tomada por conta própria: "Continuar" recoloca no
 * ponto, "Começar do início" descarta. Ignorar também é seguro — sem toque, o
 * fluxo segue do começo, que é o comportamento de sempre.
 *
 * Fica ACIMA do card de estabilização de propósito. A regra "estabilização
 * primeiro" governa CONDUTA, e isto não é conduta: é o botão de voltar ao ponto
 * que o médico pediu, e ele precisa ser a primeira coisa visível ao retornar de
 * uma consulta. O card de estabilização continua antes de qualquer passo clínico.
 */
function BarraDeRetomada({
  passo,
  titulo,
  onContinuar,
  onComecarDoInicio,
}: {
  passo: number;
  titulo: string;
  onContinuar: () => void;
  onComecarDoInicio: () => void;
}) {
  const tr = useTr();
  const r = useEstilosDoTema(criarEstilosRetomada);

  return (
    <View style={r.barra}>
      <View style={r.textos}>
        <Text style={r.rotulo}>{tr("Você estava aqui")}</Text>
        <Text style={r.detalhe} numberOfLines={1}>
          {tr("Passo")} {passo} · {tr(titulo)}
        </Text>
      </View>
      <View style={r.acoes}>
        <Pressable
          style={({ pressed }) => [r.continuar, pressed && r.pressionado]}
          onPress={onContinuar}
          accessibilityRole="button"
        >
          <Text style={r.continuarTexto}>{tr("Continuar")}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [r.descartar, pressed && r.pressionado]}
          onPress={onComecarDoInicio}
          accessibilityRole="button"
        >
          <Text style={r.descartarTexto}>{tr("Começar do início")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const criarEstilosRetomada = (t: Tema) => {
  const c = t.cores;
  return StyleSheet.create({
    barra: {
      backgroundColor: c.surface,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: c.primary,
      padding: ESPACO.md,
      gap: ESPACO.sm,
    },
    textos: { gap: 2 },
    rotulo: {
      ...TIPOGRAFIA.micro,
      color: c.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    detalhe: { ...TIPOGRAFIA.caption, color: c.text },
    acoes: { flexDirection: "row", gap: ESPACO.sm },
    continuar: {
      flex: 1,
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      backgroundColor: TEMAS_FILL_PRIMARIO,
      paddingHorizontal: ESPACO.md,
    },
    continuarTexto: { ...TIPOGRAFIA.caption, color: "#ffffff", fontWeight: "800" },
    descartar: {
      minHeight: TOQUE.minimo,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: ESPACO.md,
    },
    descartarTexto: { ...TIPOGRAFIA.caption, color: c.textSecondary, fontWeight: "600" },
    pressionado: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  });
};

/**
 * Azul de PREENCHIMENTO (o primary do tema claro). O primary do tema escuro é
 * claro demais para receber texto branco — daria 2,x:1. Mesma escolha do resto
 * do app (ver scripts/aplicar-paleta-v2.cjs).
 */
const TEMAS_FILL_PRIMARIO = "#1e6fd9";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#292e38" },
  content: { padding: 16, gap: 14 },
  introCard: {
    backgroundColor: "#383e4a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#565e6c",
    padding: 16,
  },
  introText: { fontSize: 14, lineHeight: 20, color: "#aab6c6" },
  trailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trailBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(77,154,255,0.18)",
    borderWidth: 1,
    borderColor: "#7fb3ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  trailBadgeText: { fontSize: 12, fontWeight: "800", color: "#7fb3ff" },
  trailText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#aab6c6" },
  stepStack: { gap: 14 },

  questionCard: {
    backgroundColor: "#383e4a",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#565e6c",
    padding: 18,
    gap: 8,
  },
  questionEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#aab6c6",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  questionTitle: { fontSize: 22, fontWeight: "800", color: "#f1f5f9", lineHeight: 28, letterSpacing: -0.3 },
  questionText: { fontSize: 15, lineHeight: 21, color: "#cbd5e1", fontWeight: "500" },
  questionSummary: { fontSize: 13, lineHeight: 19, color: "#aab6c6" },
  evidenceList: { gap: 8, marginTop: 4 },
  evidenceRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  evidenceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4d9aff", marginTop: 7, flexShrink: 0 },
  evidenceToggle: { fontSize: 12.5, fontWeight: "700", color: "#7fb3ff", letterSpacing: 0.2 },
  evidenceText: { flex: 1, fontSize: 13, lineHeight: 19, color: "#aab6c6" },

  actionCard: {
    backgroundColor: "#383e4a",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#2563eb",
    padding: 18,
    gap: 10,
  },
  actionEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#93c5fd",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  actionTitle: { fontSize: 22, fontWeight: "800", color: "#ffffff", lineHeight: 28, letterSpacing: -0.3 },
  actionSummary: { fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.78)" },
  actionList: { gap: 10, marginTop: 4 },
  actionItemRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  actionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actionCheckText: { fontSize: 12, fontWeight: "800", color: "#ffffff" },
  actionItemText: { flex: 1, fontSize: 14.5, lineHeight: 21, color: "#e2e8f0", fontWeight: "500" },
  advanceButton: {
    minHeight: 64,
    borderRadius: 18,
    backgroundColor: "#1d4ed8",
    borderWidth: 2,
    borderColor: "#93c5fd",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  advanceButtonPressed: { backgroundColor: "#1e40af", shadowOpacity: 0 },
  advanceButtonText: { fontSize: 18, fontWeight: "800", color: "#ffffff", letterSpacing: -0.2 },
  advanceButtonDisabled: { backgroundColor: "#383e4a", borderColor: "#565e6c", shadowOpacity: 0, elevation: 0 },
  advanceButtonTextDisabled: { color: "#aab6c6" },

  // ── Input (valor por toque) ───────────────────────────────────────────────
  inputCard: {
    backgroundColor: "#383e4a",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#565e6c",
    padding: 18,
    gap: 14,
  },
  inputEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#aab6c6",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  inputTitle: { fontSize: 21, fontWeight: "800", color: "#f1f5f9", lineHeight: 27, letterSpacing: -0.3 },
  inputIntro: { fontSize: 13.5, lineHeight: 19, color: "#aab6c6", marginTop: -6 },
  inputField: { gap: 8, borderTopWidth: 1, borderTopColor: "#565e6c", paddingTop: 12 },
  inputFieldHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  herdadoAviso: { fontSize: 11.5, lineHeight: 16, color: "#7fb3ff", fontWeight: "600" },
  inputFieldLabel: { fontSize: 14, fontWeight: "700", color: "#cbd5e1" },
  inputUnit: { fontSize: 12, fontWeight: "500", color: "#aab6c6" },
  inputFieldValue: { fontSize: 14, fontWeight: "800", color: "#7fb3ff" },
  presetWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  presetChip: {
    minWidth: 52,
    // 44 px é o mínimo do plano UI 2.0. Antes ficava em ~38 px, e é aqui que se
    // toca para INFORMAR VALOR CLÍNICO (peso, dose, parâmetro) — errar o chip ao
    // lado troca dado do caso. Correção fora da flag: é segurança de toque nos
    // 19 módulos, não escolha visual.
    minHeight: TOQUE.minimo,
    borderRadius: 12,
    backgroundColor: "#383e4a",
    borderWidth: 1.5,
    borderColor: "#565e6c",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  presetChipActive: { backgroundColor: "#1e6fd9", borderColor: "#7fb3ff" },
  presetChipPressed: { opacity: 0.8 },
  presetChipOther: { borderStyle: "dashed", borderColor: "#565e6c" },
  presetChipText: { fontSize: 14, fontWeight: "700", color: "#cbd5e1" },
  presetChipTextActive: { color: "#ffffff" },
  customRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  customInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#292e38",
    borderWidth: 1,
    borderColor: "#565e6c",
    paddingHorizontal: 14,
    color: "#f1f5f9",
    fontSize: 15,
  },
  customAdd: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#1e6fd9",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  customAddText: { fontSize: 14, fontWeight: "800", color: "#ffffff" },

  transitionCard: { borderRadius: 22, borderWidth: 1.5, padding: 18, gap: 10 },
  dispositionBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  dispositionBadgeText: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  transitionTitle: { fontSize: 21, fontWeight: "800", color: "#f8fafc", lineHeight: 27 },
  transitionSummary: { fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.78)" },
  targetCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#383e4a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#565e6c",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  targetCardPressed: { backgroundColor: "#383e4a", borderColor: "#7fb3ff" },
  targetLabel: { fontSize: 15, fontWeight: "700", color: "#e2e8f0" },
  targetReason: { fontSize: 12, fontWeight: "500", color: "#aab6c6", marginTop: 2, lineHeight: 16 },
  targetChevron: { fontSize: 22, fontWeight: "700", color: "#7fb3ff" },

  controlsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  controlButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#383e4a",
    borderWidth: 1,
    borderColor: "#565e6c",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonDisabled: { opacity: 0.4 },
  controlButtonText: { fontSize: 14, fontWeight: "700", color: "#cbd5e1" },
  controlButtonTextDisabled: { color: "#aab6c6" },
  sourceText: { fontSize: 11, color: "#aab6c6", textAlign: "center", marginTop: 8, fontWeight: "500" },
});
