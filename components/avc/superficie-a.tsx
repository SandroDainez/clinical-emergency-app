/**
 * SUPERFÍCIE A · Entrada e estabilização — a tela.
 *
 * ⛔ NENHUMA medicina nasce aqui. Campos vêm de `avc/conteudo/superficie-a.ts`,
 * leituras vêm de `avc/nucleo/derivacoes.ts`, e esta camada só desenha (E-29).
 *
 * ⚠️ O que a tela precisa mostrar sem inventar:
 *   · os três estados de resposta distinguíveis (E-37);
 *   · toda leitura com os insumos e a fonte que a produziram (E-22, E-30);
 *   · ⛔ nenhum campo obrigatório (E-49) — a superfície não trava nada.
 *
 * ── O QUE OS TESTES VISUAIS DE 2026-08-28 MUDARAM AQUI ─────────────────────
 *
 * A lógica estava certa e a tela estava errada, que é uma combinação perigosa
 * porque passa nos testes. Sete defeitos, todos da mesma família — a tela
 * mostrava o que o SISTEMA sabe, na ordem em que o sistema pensa:
 *
 *   1. `1787922516903` aparecia como "horário". Timestamp cru ⛔ nunca chega ao
 *      médico: agora tudo passa por `horaDeExibicao` (`avc/nucleo/formato.ts`).
 *   2. Grandeza só tinha −/+. Um médico não chega a 240 mmHg tocando 100 vezes;
 *      agora usa `NumericStepper` (barra + valor + −/+), o controle único do app.
 *   3. Cada relógio ocupava um cartão inteiro. Viraram linhas de uma linha.
 *   4. `consciencia_rebaixada`, `spo2`, `F-23` competiam com a conduta pelo
 *      mesmo espaço. Rastreabilidade ⛔ não desapareceu — foi para trás do ⓘ.
 *   5. A ordem dos blocos passou a ser clínica, e mora no CONTEÚDO (`GRUPOS_A`),
 *      ⛔ não aqui: prioridade clínica ⛔ não é decisão de layout.
 */
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  GRUPOS_A,
  TODOS_OS_CAMPOS_A,
  opcaoDoValor,
  valorDaOpcao,
  type CampoA,
} from "../../avc/conteudo/superficie-a";
import { leiturasDaSuperficieA, type Leitura } from "../../avc/nucleo/derivacoes";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import { horaDeExibicao } from "../../avc/nucleo/formato";
import { NumericStepper } from "../ui-v2/numeric-stepper";
import SeletorDeHora from "./seletor-de-hora";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Props = {
  estado: EstadoAvc;
  /** "Agora", lido pelo dono pela porta única de Q-01. ⛔ Nenhum relógio aqui. */
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
};

/**
 * ⚠️ O SÍMBOLO SEGUE O `tom`, ⛔ NÃO A CONCLUSÃO — e o símbolo acompanha sempre
 * a cor, porque significado ⛔ nunca pode depender só dela (E-39).
 */
const SIMBOLO: Record<Leitura["tom"], string> = {
  atencao: "⚠",
  pendente: "?",
  informativo: "·",
};

/** ⚠️ Atenção primeiro, pendência depois, informação por último (§7.3). */
const PESO_DO_TOM: Record<Leitura["tom"], number> = {
  atencao: 0,
  pendente: 1,
  informativo: 2,
};

export default function SuperficieA({ estado, agora, onEscolher, onMedir, onHora }: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const leituras = leiturasDaSuperficieA(estado);

  /**
   * ⚠️⚠️ O RASCUNHO EXISTE PARA NÃO SUJAR A TRILHA, e isso ⛔ não é detalhe.
   *
   * A trilha é APPEND-ONLY (§3.1): gravar a cada `onValueChange` da barra
   * escreveria quarenta "medidas" para um gesto só, e a auditoria — que existe
   * para reconstituir o que o médico sabia e quando — viraria ruído ilegível.
   *
   * A barra move o rascunho; **soltar** grava UM fato. É por isso que
   * `NumericStepper` tem `onConfirmar` separado de `onChange`.
   */
  const [rascunho, setRascunho] = useState<Record<string, number>>({});

  /** O horário sendo editado, antes de virar fato. ⛔ Nada é gravado até confirmar. */
  const [editandoHora, setEditandoHora] = useState<{ campo: string; instante: number } | null>(null);

  /** Quais ⓘ estão abertos. ⚠️ Fechado por padrão: rastreabilidade ⛔ não disputa espaço. */
  const [detalhes, setDetalhes] = useState<readonly string[]>([]);

  const rotuloDoCampo = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of TODOS_OS_CAMPOS_A) m[c.id] = c.rotulo;
    return m;
  }, []);

  const abrirDetalhe = (id: string) =>
    setDetalhes((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  function numeroGravado(id: string): number | undefined {
    const f = valorAtual(estado, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  function instanteGravado(id: string): number | undefined {
    const f = valorAtual(estado, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  /** ⚠️ O botão ⓘ. Pequeno, mas ⛔ nunca menor que o alvo mínimo de toque. */
  function Info({ id }: { id: string }) {
    return (
      <Pressable
        style={e.info}
        accessibilityRole="button"
        accessibilityLabel={tr("Fonte e rastreabilidade")}
        testID={`avc-info-${id}`}
        onPress={() => abrirDetalhe(id)}
      >
        <Text style={e.infoTexto}>ⓘ</Text>
      </Pressable>
    );
  }

  // ── RELÓGIO: uma linha, ⛔ nunca um cartão ────────────────────────────────
  function LinhaDeRelogio({ campo }: { campo: CampoA }) {
    const gravado = instanteGravado(campo.id);
    const editando = editandoHora?.campo === campo.id;
    return (
      <View style={e.relogioBloco} testID={`avc-campo-${campo.id}`}>
        <View style={e.relogioLinha}>
          {/**
           * ⚠️ ATÉ DUAS LINHAS, ⛔ NUNCA UMA COM RETICÊNCIAS.
           *
           * A primeira versão compacta usava `numberOfLines={1}`, e a captura
           * mostrou o resultado: "Última vez ...", "Início obser...",
           * "Reconheci...". Os quatro marcos desta superfície ⛔ existem
           * justamente porque são DIFERENTES ENTRE SI — truncados, viram quatro
           * linhas indistinguíveis, e o médico carimba o marco errado.
           *
           * ⚠️ Compactar ⛔ nunca pode custar a identidade do campo. Duas linhas
           * curtas continuam sendo linha, ⛔ não cartão.
           */}
          <Text style={e.relogioRotulo} numberOfLines={2}>
            {tr(campo.rotulo)}
          </Text>
          {/**
           * ⚠️ VALOR E AÇÃO SÃO O MESMO ALVO, e a fusão foi medida, não
           * suposta: com rótulo + valor + botão + ⓘ disputando 388 px, os
           * quatro nomes de marco truncavam mesmo em duas linhas. Fundidos,
           * sobram ~240 px para o rótulo — e o alvo de toque fica MAIOR, que é
           * o que se quer de um controle usado com luva.
           *
           * ⚠️ ⛔ NUNCA `String(instante)`: era daqui que saía o
           * `1787922516903`. Tudo passa por `horaDeExibicao`.
           *
           * ⚠️ Vazio diz "registrar", ⛔ não "não informado": aqui a ausência já
           * é evidente pela falta do número, e o que o médico precisa é do
           * convite à ação. Na GRANDEZA é o oposto — lá a barra desenha um
           * número mesmo intocada, e por isso lá a frase "não informado" é
           * obrigatória (§0.2).
           */}
          <Pressable
            style={e.relogioAcao}
            accessibilityRole="button"
            accessibilityLabel={`${tr(campo.rotulo)}: ${
              gravado === undefined ? tr("não informado") : horaDeExibicao(gravado, agora)
            }`}
            testID={`avc-hora-${campo.id}`}
            onPress={() =>
              setEditandoHora(
                editando ? null : { campo: campo.id, instante: gravado ?? agora }
              )
            }
          >
            <Text
              style={[e.relogioValor, gravado === undefined && e.vazio]}
              testID={`avc-hora-valor-${campo.id}`}
            >
              {gravado === undefined ? tr("registrar") : `${horaDeExibicao(gravado, agora)} ✎`}
            </Text>
          </Pressable>
          <Info id={campo.id} />
        </View>

        {detalhes.includes(campo.id) ? <Detalhe campo={campo} /> : null}

        {editando ? (
          <SeletorDeHora
            rotulo={campo.rotulo}
            instante={editandoHora.instante}
            agora={agora}
            onMudar={(i) => setEditandoHora({ campo: campo.id, instante: i })}
            onConfirmar={() => {
              onHora(campo.id, editandoHora.instante, campo.relogio);
              setEditandoHora(null);
            }}
            onCancelar={() => setEditandoHora(null)}
          />
        ) : null}
      </View>
    );
  }

  function Detalhe({ campo }: { campo: CampoA }) {
    return (
      <View style={e.detalhe} testID={`avc-detalhe-${campo.id}`}>
        {campo.nota ? <Text style={e.detalheTexto}>{tr(campo.nota)}</Text> : null}
        <Text style={e.detalheTexto}>
          {tr("Fonte")}: {campo.fonte}
        </Text>
      </View>
    );
  }

  // ── ESCOLHA ───────────────────────────────────────────────────────────────
  function CampoDeEscolha({ campo }: { campo: CampoA }) {
    const bruto = String(valorAtual(estado, campo.id)?.valor ?? "");
    const escolhido = opcaoDoValor(campo, bruto);
    return (
      <View style={e.campo} testID={`avc-campo-${campo.id}`}>
        <View style={e.campoTopo}>
          <Text style={e.campoRotulo}>{tr(campo.rotulo)}</Text>
          <Info id={campo.id} />
        </View>

        {/* ⚠️ `ajuda` é permanente porque muda a RESPOSTA; `nota` é fidelidade e
            fica atrás do ⓘ. Trocar os dois de lugar enche a tela de texto que o
            médico já sabe e esconde o que ele precisa ler antes de responder. */}
        {campo.ajuda ? <Text style={e.campoAjuda}>{tr(campo.ajuda)}</Text> : null}

        {detalhes.includes(campo.id) ? <Detalhe campo={campo} /> : null}

        {/**
         * ⚠️⚠️ `radiogroup` + `radio` + `aria-checked`, ⛔ NÃO `button`.
         *
         * ── O DEFEITO QUE ISTO CORRIGE (medido em 2026-08-28) ───────────────
         *
         * A versão anterior era `accessibilityRole="button"` com
         * `accessibilityState={{ selected }}`. O `Pressable` do
         * react-native-web ⛔ **não lê `accessibilityState`** — só o
         * `TouchableWithoutFeedback` lê. Resultado medido: o botão saía no DOM
         * sem atributo ARIA nenhum, e a opção escolhida se distinguia da não
         * escolhida **apenas pela cor de fundo**.
         *
         * ⚠️ Isso ⛔ não é detalhe de acessibilidade: E-37 exige que os três
         * vazios sejam distinguíveis, e para quem usa leitor de tela — ou vê a
         * tela sob sol forte — "fundo mais claro" ⛔ não é distinção nenhuma.
         * `aria-checked` é booleano de verdade e sai como `"false"` quando
         * falso, que é o que torna a ausência de escolha **afirmável**.
         */}
        <View style={e.opcoes} accessibilityRole="radiogroup">
          {(campo.opcoes ?? []).map((op) => {
            const valor = valorDaOpcao(op);
            const ativa = escolhido === op;
            return (
              <Pressable
                key={op}
                style={[e.opcao, ativa && e.opcaoAtiva]}
                accessibilityRole="radio"
                aria-checked={ativa}
                testID={`avc-opcao-${campo.id}-${valor}`}
                onPress={() => onEscolher(campo.id, valor)}
              >
                <Text style={[e.opcaoTexto, ativa && e.opcaoTextoAtivo]}>{tr(op)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // ── GRANDEZA ──────────────────────────────────────────────────────────────
  function CampoDeGrandeza({ campo }: { campo: CampoA }) {
    const faixa = campo.faixa;
    if (!faixa) return null;
    const gravado = numeroGravado(campo.id);
    const emRascunho = rascunho[campo.id];
    /**
     * ⚠️ TRÊS ESTADOS, ⛔ NÃO DOIS: gravado / em gesto / intocado. O intocado
     * mostra **não informado** mesmo com a barra desenhada numa posição — é a
     * regra §0.2, e é a mesma que impede um peso de 70 kg que ninguém mediu de
     * alimentar dose lá na frente.
     */
    const naoInformado = gravado === undefined && emRascunho === undefined;
    const valor = emRascunho ?? gravado ?? faixa.partida;

    return (
      <View style={e.campo} testID={`avc-campo-${campo.id}`}>
        <View style={e.campoTopo}>
          <Text style={e.campoRotulo}>{tr(campo.rotulo)}</Text>
          <Info id={campo.id} />
        </View>

        {campo.ajuda ? <Text style={e.campoAjuda}>{tr(campo.ajuda)}</Text> : null}
        {detalhes.includes(campo.id) ? <Detalhe campo={campo} /> : null}

        <NumericStepper
          valor={valor}
          min={faixa.min}
          max={faixa.max}
          passo={faixa.passo}
          unidade={campo.unidade}
          naoInformado={naoInformado}
          // ⚠️ Já traduzido: o componente é `ui-v2` puro e ⛔ não tem `tr()`.
          textoAusente={tr("não informado")}
          onChange={(v) => setRascunho((r) => ({ ...r, [campo.id]: v }))}
          onConfirmar={(v) => {
            setRascunho((r) => {
              const { [campo.id]: _, ...resto } = r;
              return resto;
            });
            onMedir(campo.id, v);
          }}
          testID={`avc-grandeza-${campo.id}`}
        />
      </View>
    );
  }

  return (
    <View style={e.raiz} testID="avc-superficie-a-conteudo">
      {GRUPOS_A.map((grupo) => (
        <View key={grupo.id} style={e.grupo} testID={`avc-grupo-${grupo.id}`}>
          <Text style={e.grupoTitulo}>{tr(grupo.titulo).toUpperCase()}</Text>
          {grupo.campos.map((campo) =>
            campo.tipo === "hora" ? (
              <LinhaDeRelogio key={campo.id} campo={campo} />
            ) : campo.tipo === "grandeza" ? (
              <CampoDeGrandeza key={campo.id} campo={campo} />
            ) : (
              <CampoDeEscolha key={campo.id} campo={campo} />
            )
          )}
        </View>
      ))}

      {/* ── LEITURAS DO SISTEMA ────────────────────────────────────────────
          ⚠️ E-46: são APOIO ao julgamento, ⛔ nunca veredito.
          ⚠️ Na tela vai só a frase curta. Os insumos e o slot de fonte que
          E-22/E-30 exigem ⛔ não sumiram — estão a um toque, no ⓘ. */}
      <View style={e.grupo} testID="avc-grupo-alertas">
        <Text style={e.grupoTitulo}>{tr("Alertas").toUpperCase()}</Text>
        {[...leituras]
          .sort((a, b) => PESO_DO_TOM[a.tom] - PESO_DO_TOM[b.tom])
          .map((l) => (
            <View key={l.id} style={[e.leitura, e[l.tom]]} testID={`avc-leitura-${l.id}`}>
              <View style={e.leituraLinha}>
                <Text
                  style={[e.leituraTexto, l.tom === "informativo" && e.leituraFraca]}
                  testID={`avc-leitura-curto-${l.id}`}
                >
                  {SIMBOLO[l.tom]} {tr(l.curto)}
                </Text>
                <Info id={`leitura-${l.id}`} />
              </View>
              {detalhes.includes(`leitura-${l.id}`) ? (
                <View style={e.detalhe} testID={`avc-detalhe-leitura-${l.id}`}>
                  <Text style={e.detalheTexto}>{tr(l.texto)}</Text>
                  <Text style={e.detalheTexto}>
                    {tr("a partir de")}:{" "}
                    {l.insumos.map((i) => tr(rotuloDoCampo[i] ?? i)).join(", ")} · {l.fonte}
                  </Text>
                  <Text style={e.detalheTexto}>
                    {tr("Apoio ao julgamento clínico. A decisão permanece do médico.")}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
      </View>
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    grupo: { gap: ESPACO.xs },
    grupoTitulo: {
      color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "700", letterSpacing: 1, marginTop: ESPACO.xs,
    },

    // ── relógio: linha, não cartão ──────────────────────────────────────────
    relogioBloco: { gap: ESPACO.xs },
    relogioLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs, minHeight: TOQUE.minimo },
    relogioRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, flex: 1, minWidth: 120 },
    // ⚠️ `flexShrink` no VALOR e não no rótulo: entre encurtar "não informado"
    // e encurtar o nome do marco, quem cede é o texto genérico.
    relogioValor: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700", flexShrink: 1 },
    vazio: { color: tema.cores.textSecondary, fontWeight: "400", fontStyle: "italic" },
    relogioAcao: {
      minHeight: TOQUE.minimo, justifyContent: "center", paddingHorizontal: ESPACO.sm,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
    },

    campo: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: ESPACO.xs,
      borderWidth: 1, borderColor: tema.cores.border,
    },
    campoTopo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    campoRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, flex: 1 },
    campoAjuda: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    // ⚠️ Alvo mínimo de toque mesmo sendo um glifo pequeno (§7.18).
    info: { minWidth: TOQUE.minimo, minHeight: TOQUE.minimo, alignItems: "center", justifyContent: "center" },
    infoTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    detalhe: {
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      padding: ESPACO.sm, gap: 2,
    },
    detalheTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },

    opcoes: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    opcao: {
      paddingVertical: ESPACO.sm, paddingHorizontal: ESPACO.sm,
      minHeight: TOQUE.minimo, justifyContent: "center",
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
    },
    opcaoAtiva: { backgroundColor: tema.cores.primary },
    opcaoTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize },
    opcaoTextoAtivo: { color: tema.cores.onPrimary, fontWeight: "700" },

    leitura: {
      backgroundColor: tema.cores.bg, borderRadius: RAIO.botao,
      paddingHorizontal: ESPACO.sm, gap: 2,
      borderLeftWidth: 3, borderLeftColor: tema.cores.border,
    },
    leituraLinha: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    /**
     * ⚠️ A COR É REFORÇO, ⛔ NUNCA O PORTADOR DO SIGNIFICADO (E-39) — o símbolo
     * já diz tudo sozinho, e é ele que sobrevive ao daltonismo e ao brilho de
     * uma tela ao sol.
     */
    atencao: { borderLeftColor: tema.cores.warning },
    pendente: { borderLeftColor: tema.cores.textSecondary },
    informativo: { borderLeftColor: tema.cores.border },
    leituraTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, flex: 1 },
    leituraFraca: { color: tema.cores.textSecondary },
  });
