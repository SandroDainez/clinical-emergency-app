/**
 * KIT VISUAL DA SUPERFÍCIE A — ⚠️ novo, ⛔ e ⛔ **não** um patch no compartilhado.
 *
 * ⚠️⚠️ POR QUE ESTES COMPONENTES SÃO NOVOS EM VEZ DE UMA EDIÇÃO.
 *
 * ⛔ `campos-clinicos.tsx` é consumido por **oito** superfícies. Mudá-lo para
 * dar à A a linguagem nova mudaria B–G no mesmo commit — ⛔ e a instrução é
 * ⛔ não tocar B–G. ⚠️ O kit vive à parte até a linguagem ser aprovada; se ela
 * virar padrão, o caminho é migrar superfície a superfície, ⛔ e ⛔ não trocar o
 * chão de todas de uma vez.
 *
 * ── ⚠️⚠️ O QUE ESTE KIT ⛔ NÃO PODE MUDAR ────────────────────────────────────
 *
 * ⛔ **⛔ Nenhum contrato de ausência.** Campo intocado continua **⛔ não
 * informado**; ⛔ nenhum valor nasce preenchido; ⛔ zero ⛔ nunca aparece por
 * descuido. ⚠️ A linguagem é outra; a semântica é a mesma.
 */
import { Feather } from "@expo/vector-icons";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { valorDaOpcao } from "../../../avc/conteudo/campo";
import { useEstilosDoTema, type Tema } from "../../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA } from "../../../design-system/tokens";
import { useTr } from "../../../lib/use-tr";

/* ────────────────────────────────────────────────────────────────────────────
 * 1 · ÍCONES — uma biblioteca só, ⛔ e ⛔ NENHUM emoji
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ O VOCABULÁRIO DE ÍCONES É DECLARADO, ⛔ e ⛔ não escolhido no JSX.
 *
 * ⛔ Emoji renderiza diferente em cada plataforma, ⛔ não herda a cor do tema
 * ⛔ e dá cara de protótipo. ⚠️ Feather tem traço fino e uniforme — **uma**
 * linguagem, ⛔ e ⛔ não cinco estilos misturados.
 *
 * ⚠️ Nomear aqui força o ícone a ser **reconhecimento**, ⛔ e ⛔ não decoração:
 * quem precisar de um novo tem de batizá-lo antes de usá-lo.
 */
export const ICONE = {
  chegada: "log-in",
  ultimaVezBem: "check-circle",
  inicioObservado: "eye",
  reconhecimento: "bell",
  meioDoSono: "moon",
  viaAerea: "wind",
  respiracao: "activity",
  circulacao: "heart",
  glicemia: "droplet",
  peso: "anchor",
  crise: "zap",
  paciente: "user",
  laboratorio: "thermometer",
  estabilizar: "shield",
  neuro: "cpu",
  imagem: "image",
  seguranca: "alert-triangle",
  reperfusao: "crosshair",
  destino: "home",
  adiante: "chevron-right",
  informacao: "info",
} as const;

export type NomeDeIcone = keyof typeof ICONE;

export function Icone({
  nome,
  tamanho = 16,
  cor,
}: {
  nome: NomeDeIcone;
  tamanho?: number;
  cor?: string;
}) {
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Feather
      name={ICONE[nome]}
      size={tamanho}
      color={cor ?? e.corPadraoDeIcone.color}
      /** ⚠️ Decorativo: o rótulo ao lado é quem nomeia — ⛔ o leitor ⛔ não lê duas vezes. */
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2 · SEÇÃO — filete, ⛔ e ⛔ NÃO barra preenchida
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️ A barra roxa cheia dava a cada bloco o peso de um título de tela. ⛔ Com
 * seis blocos, ⛔ nenhum deles era hierarquia — eram seis pesos iguais.
 */
export function Secao({ titulo, testID }: { titulo: string; testID?: string }) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={e.secao} testID={testID}>
      <Text style={e.secaoTitulo}>{tr(titulo)}</Text>
      <View style={e.secaoFilete} />
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3 · SEGMENTADO — Sim / Não / Incerto
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ ⛔ NENHUMA OPÇÃO NASCE MARCADA. ⚠️ `valor` vazio é estado legítimo, ⛔ e o
 * controle mostra os três sem escolher por ⛔ ninguém (E-02).
 */
export function Segmentado({
  campo,
  opcoes,
  valor,
  onEscolher,
  onDesfazer,
  daEscala,
  divergente,
}: {
  campo: string;
  opcoes: readonly string[];
  /** ⚠️ O valor EFETIVO — quem resolve manual × derivado é o núcleo. */
  valor: string;
  onEscolher: (campo: string, valor: string) => void;
  onDesfazer: (campo: string) => void;
  /**
   * ⚠️⚠️ PROCEDÊNCIA: o valor veio da escala, ⛔ e ⛔ não do dedo do médico.
   *
   * ⛔ Sem a marca, um achado preenchido pelo NIHSS parece resposta dele — ⛔ e
   * a primeira coisa que ele faz é desconfiar da tela. ⚠️ A **regra** de quem
   * vence vive em `valorEfetivo`, no núcleo: aqui ⛔ só se mostra de onde veio.
   */
  daEscala?: boolean;
  /** ⚠️ O médico respondeu diferente do que a escala derivou. ⛔ Nenhum apaga o outro. */
  divergente?: boolean;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    /**
     * ⚠️⚠️ O `testID` É O CONTRATO — `avc-opcao-<campo>-<valor gravado>`.
     *
     * ⛔ A primeira versão inventou `avc-seg-*`. ⚠️ Trocar o nome faria a suíte
     * inteira de escolhas parar de verificar esta tela **justo na reescrita**, ⛔ e
     * o verde continuaria — medindo ⛔ nada. ⚠️ O sufixo é `valorDaOpcao`, que é
     * o que o estado realmente guarda: rótulo ⛔ nunca chega ao estado.
     */
    <View style={e.seg} testID={`avc-campo-${campo}-opcoes`}>
      {opcoes.map((op, i) => {
        /**
         * ⚠️⚠️ O ESTADO GUARDA O **SLUG**, ⛔ e ⛔ NUNCA O RÓTULO.
         *
         * ⛔ A primeira versão gravava `"Sim"` ⛔ e comparava contra o rótulo. O
         * estado passou a guardar rótulo onde toda derivação do módulo espera
         * `"sim"` — ⛔ e ⛔ nenhuma escolha voltava a aparecer marcada, porque a
         * comparação também era contra o rótulo: **errado dos dois lados, ⛔ e
         * por isso silencioso**.
         *
         * ⚠️ É o defeito rótulo × slug que a varredura de alcançabilidade já
         * pegou uma vez neste módulo. ⛔ Reintroduzi-lo numa reescrita de tela é
         * exatamente o que a suíte existe para impedir.
         */
        const gravado = valorDaOpcao(op);
        const marcada = valor === gravado;
        return (
          <Pressable
            key={op}
            style={[e.segItem, i > 0 ? e.segDivisor : null, marcada ? e.segAtivo : null]}
            accessibilityRole="radio"
            /**
             * ⚠️⚠️ `aria-checked`, ⛔ e ⛔ NÃO `selected`.
             *
             * ⛔ `accessibilityState.selected` vira `aria-selected` no RN Web —
             * ⛔ e um `role="radio"` sem `aria-checked` ⛔ não anuncia estado a
             * leitor de tela ⛔ nenhum. ⚠️ ⛔ Não é detalhe de teste: é a
             * propriedade que diz se a opção está marcada.
             */
            accessibilityState={{ checked: marcada }}
            aria-checked={marcada}
            testID={`avc-opcao-${campo}-${gravado}`}
            /** ⚠️ Tocar na marcada DESFAZ — o gesto que todo mundo já tenta (§7.16). */
            onPress={() => (marcada ? onDesfazer(campo) : onEscolher(campo, gravado))}
          >
            {/**
              * ⚠️⚠️ O ✓ ANUNCIA A ESCOLHA **SEM DEPENDER DE COR**.
              *
              * ⛔ Fundo colorido sozinho ⛔ não serve: quem ⛔ não distingue a cor
              * ⛔ não sabe o que está marcado. ⚠️ Defeito que eu introduzi na
              * migração ⛔ e que a suíte de B pegou — ⛔ e ele valia para A também.
              */}
            <Text style={[e.segTexto, marcada ? e.segTextoAtivo : null]}>
              {marcada ? "✓ " : ""}
              {tr(op)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * ⚠️ A etiqueta de procedência — ⛔ uma linha, ⛔ e ⛔ nunca um cartão.
 *
 * ⚠️⚠️ OS TRÊS `testID` SÃO OS ORIGINAIS, ⛔ e os textos também: eles são a
 * superfície onde a suíte afirma **de onde veio o valor**. ⛔ Renomeá-los na
 * migração desligaria a prova da procedência — que é o contrato que mais
 * importa aqui, porque um achado derivado com cara de resposta do médico é
 * exatamente o que faz ⛔ ele desconfiar da tela.
 */
export function Procedencia({ campo, daEscala, divergente, manual }: {
  campo: string;
  daEscala?: boolean;
  divergente?: boolean;
  /** ⚠️ Respondido pelo médico, ⛔ e ⛔ sem derivação a contradizer. */
  manual?: boolean;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  if (divergente) {
    return (
      <Text
        style={[e.procedencia, e.procedenciaDivergente]}
        testID={`avc-divergencia-${campo}`}
      >
        {tr("Registro do médico, diferente do que a escala deriva")}
      </Text>
    );
  }
  if (daEscala) {
    return (
      <Text style={e.procedencia} testID={`avc-origem-${campo}`}>
        {tr("Vindo do NIHSS")}
      </Text>
    );
  }
  /**
   * ⚠️⚠️ REGISTRO DO MÉDICO QUE **COINCIDE** COM A ESCALA ⛔ NÃO FICA SEM
   * ETIQUETA — ⛔ senão vira resposta manual anônima.
   *
   * ⛔ A primeira versão só marcava manual quando ⛔ não havia derivação. ⚠️ As
   * três procedências precisam se distinguir SEMPRE: vindo da escala, registro
   * do médico, ⛔ e registro do médico divergente.
   */
  if (manual) {
    return (
      <Text style={e.procedencia} testID={`avc-origem-manual-${campo}`}>
        {tr("Registro do médico")}
      </Text>
    );
  }
  return null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4 · NÚMERO — digitável, com o teclado do SISTEMA
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ O CONTRATO DE AUSÊNCIA, INTEIRO, NUM CONTROLE NOVO.
 *
 *   ⛔ campo intocado mostra **—**, ⛔ e ⛔ não o piso da faixa;
 *   ⛔ apagar o texto **desfaz**, ⛔ e ⛔ não grava zero;
 *   ⛔ `−/+` ficam inertes ⛔ enquanto ⛔ não houver valor: ⛔ sem número
 *     registrado, ⛔ eles ⛔ não têm de onde partir (§0.2).
 *
 * ⚠️⚠️ E O DEFEITO QUE O RASCUNHO EVITA: digitando **178**, os estados
 * intermediários são `1` e `17`. ⛔ Gravar cada tecla registraria uma PAS de 1 e
 * de 17 — valores que ⛔ ninguém mediu, na trilha clínica. ⚠️ Por isso só se
 * registra o que **cai dentro da faixa**; o resto vive no rascunho ⛔ e ⛔ não
 * chega ao estado.
 */
export function Numero({
  campo,
  rotulo,
  unidade,
  faixa,
  gravado,
  onMedir,
  onDesfazer,
  alerta,
  testID,
}: {
  campo: string;
  rotulo: string;
  unidade?: string;
  faixa: { readonly min: number; readonly max: number; readonly passo: number };
  gravado: number | undefined;
  onMedir: (campo: string, valor: number) => void;
  onDesfazer: (campo: string) => void;
  /** ⚠️ Pintado ⛔ só quando um valor MEDIDO cruzou limite — ⛔ nunca por vazio. */
  alerta?: boolean;
  testID?: string;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const [rascunho, setRascunho] = useState<string | undefined>(undefined);

  /** ⚠️ Correção vinda de fora (desfazer, nova medida) limpa o rascunho. */
  useEffect(() => {
    if (gravado === undefined) setRascunho(undefined);
  }, [gravado]);

  const texto = rascunho ?? (gravado === undefined ? "" : String(gravado));
  const dentroDaFaixa = (n: number) => n >= faixa.min && n <= faixa.max;

  function digitou(bruto: string) {
    /** ⚠️ ⛔ Só dígitos: ⛔ nada de sinal, espaço ⛔ ou letra num campo clínico. */
    const limpo = bruto.replace(/[^0-9]/g, "");
    setRascunho(limpo);

    /**
     * ⚠️⚠️ APAGAR ⛔ NÃO É ZERO — é **desfazer**. ⛔ Gravar 0 aqui poria uma
     * glicemia de 0 mg/dL na trilha porque ⛔ alguém limpou o campo.
     */
    if (limpo === "") {
      if (gravado !== undefined) onDesfazer(campo);
      return;
    }
    const n = Number(limpo);
    if (Number.isFinite(n) && dentroDaFaixa(n) && n !== gravado) onMedir(campo, n);
  }

  /** ⚠️ Ao sair, rascunho fora da faixa ⛔ não vira valor — ele simplesmente some. */
  function saiu() {
    setRascunho(undefined);
  }

  const ajustar = (d: number) => {
    if (gravado === undefined) return;
    const alvo = Math.min(faixa.max, Math.max(faixa.min, gravado + d));
    if (alvo !== gravado) onMedir(campo, alvo);
  };

  return (
    <View style={e.num} testID={testID ?? `avc-num-${campo}`}>
      <Text style={e.numRotulo}>{tr(rotulo)}</Text>
      <View style={e.numGrupo}>
        <TextInput
          style={[e.numCaixa, alerta ? e.numCaixaAlerta : null]}
          value={texto}
          onChangeText={digitou}
          onBlur={saiu}
          /** ⚠️⚠️ TECLADO DO SISTEMA — ⛔ e ⛔ nenhum teclado próprio. */
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={String(faixa.max).length}
          placeholder="—"
          placeholderTextColor={e.corPlaceholder.color}
          accessibilityLabel={tr(rotulo)}
          testID={`avc-num-caixa-${campo}`}
        />
        {unidade ? <Text style={e.numUnidade}>{tr(unidade)}</Text> : null}
        {/**
          * ⚠️ Ajuste SECUNDÁRIO — e inerte ⛔ sem valor registrado: ⛔ um "+"
          * partindo do nada gravaria o piso da faixa como se fosse medida.
          */}
        <View style={e.numPasso}>
          <Pressable
            style={[e.numPassoBotao, gravado === undefined ? e.numPassoInerte : null]}
            accessibilityRole="button"
            disabled={gravado === undefined}
            testID={`avc-num-mais-${campo}`}
            onPress={() => ajustar(faixa.passo)}
          >
            <Text style={e.numPassoTexto}>+</Text>
          </Pressable>
          <Pressable
            style={[e.numPassoBotao, gravado === undefined ? e.numPassoInerte : null]}
            accessibilityRole="button"
            disabled={gravado === undefined}
            testID={`avc-num-menos-${campo}`}
            onPress={() => ajustar(-faixa.passo)}
          >
            <Text style={e.numPassoTexto}>−</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3b · LINHA DE ACHADO — três estados, ⛔ e ⛔ NÃO uma caixa de seleção
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ ⛔ CHECKBOX ⛔ NÃO SERVE AQUI, ⛔ e a razão é clínica.
 *
 * ⛔ Numa caixa de seleção, **⛔ não marcado vira "Não"** — ⛔ e a diferença entre
 * *"o paciente ⛔ não tem"* ⛔ e *"⛔ ainda ⛔ não avaliei"* desaparece. ⚠️ É o E-02,
 * ⛔ e é justamente o que este módulo inteiro existe para proteger.
 *
 * ⚠️⚠️ DÍVIDA VISUAL REGISTRADA (autor, 2026-09-01) — ⛔ NÃO bloqueante:
 * a **definição longa** pode migrar para o ⓘ, deixando ⛔ só uma frase curta na
 * primeira camada. ⛔ Algumas linhas ainda ficam altas por causa dela. ⚠️ É
 * redução de rolagem, ⛔ e ⛔ nada clínico muda.
 *
 * ⚠️ Por isso a linha carrega um segmented **estreito** com os três estados,
 * ⛔ em vez do controle de largura cheia: onze achados de 90 px seriam 990 px
 * de rolagem.
 *
 * ⚠️⚠️ ⛔ NENHUMA REGRA CLÍNICA AQUI. Quem decide o valor efetivo, a procedência
 * ⛔ e a divergência é o núcleo — este componente ⛔ só desenha o que recebe.
 */
export function LinhaDeAchado({
  campo,
  rotulo,
  definicao,
  opcoes,
  valor,
  daEscala,
  divergente,
  manual,
  opcoesDaEscala,
  detalheAberto,
  onAlternarDetalhe,
  onEscolher,
  onDesfazer,
  children,
}: {
  campo: string;
  rotulo: string;
  /** ⚠️ A definição curta fica VISÍVEL; categorias e teste vão para o ⓘ. */
  definicao?: string;
  opcoes: readonly string[];
  valor: string;
  daEscala?: boolean;
  divergente?: boolean;
  manual?: boolean;
  /** ⚠️ O que a escala chama assim — vem do conteúdo, ⛔ não escrito de memória. */
  opcoesDaEscala?: readonly string[];
  detalheAberto: boolean;
  onAlternarDetalhe: () => void;
  onEscolher: (campo: string, valor: string) => void;
  onDesfazer: (campo: string) => void;
  children?: ReactNode;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={e.achadoBloco} testID={`avc-campo-${campo}`}>
      <View style={e.achadoTopo}>
        <View style={e.achadoNome}>
          <Text style={e.achadoRotulo}>{tr(rotulo)}</Text>
          {definicao ? (
            <Text style={e.achadoDefinicao} testID={`avc-definicao-${campo}`}>
              {tr(definicao)}
            </Text>
          ) : null}
        </View>
        <View style={e.segEstreito}>
          {opcoes.map((op, i) => {
            const gravado = valorDaOpcao(op);
            const marcada = valor === gravado;
            return (
              <Pressable
                key={op}
                style={[e.segItemEstreito, i > 0 ? e.segDivisor : null, marcada ? e.segAtivo : null]}
                accessibilityRole="radio"
                accessibilityState={{ checked: marcada }}
                aria-checked={marcada}
                testID={`avc-opcao-${campo}-${gravado}`}
                onPress={() => (marcada ? onDesfazer(campo) : onEscolher(campo, gravado))}
              >
                <Text style={[e.segTextoEstreito, marcada ? e.segTextoAtivo : null]}>
                  {marcada ? "✓ " : ""}
                  {tr(op)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          style={e.info}
          accessibilityRole="button"
          accessibilityLabel={tr("Ver critério")}
          testID={`avc-info-${campo}`}
          onPress={onAlternarDetalhe}
        >
          <Icone nome="informacao" tamanho={13} />
        </Pressable>
      </View>
      <Procedencia campo={campo} daEscala={daEscala} divergente={divergente} manual={manual} />
      {/**
        * ⚠️⚠️ ⛔ RECOLHER ⛔ NÃO APAGA CONTEÚDO DA FONTE. As categorias que a
        * escala conta ficam atrás do ⓘ — ⛔ e ⛔ não desaparecem.
        */}
      {detalheAberto ? (
        <View testID={`avc-info-texto-${campo}`}>
          {children}
          {opcoesDaEscala && opcoesDaEscala.length > 0 ? (
            <Text style={e.achadoDefinicao} testID={`avc-glossario-${campo}`}>
              {tr("Na escala do NIHSS conta como isto")}:{" "}
              {opcoesDaEscala.map((o) => tr(o)).join(" · ")}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4b · ACHADOS — linhas compactas, ⛔ e ⛔ NÃO um cartão por opção
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ ⛔ SÓ A APRESENTAÇÃO MUDA. As regras de exclusividade continuam em
 * `alternarItem` — ⛔ este componente ⛔ não sabe o que é "Nenhum desses", ⛔ e
 * ⛔ não pode saber: elas nasceram de defeito real ⛔ e vivem encapsuladas.
 *
 * ⛔ Sete cartões enormes com caixa de seleção ocupavam meia tela para uma
 * pergunta de contexto. ⚠️ Sete linhas compactas dizem o mesmo, ⛔ e o bloco
 * inteiro cabe onde antes cabiam duas opções.
 */
export function Achados({
  campo,
  opcoes,
  selecionados,
  onAlternar,
}: {
  campo: string;
  opcoes: readonly string[];
  selecionados: readonly string[];
  /** ⚠️ Recebe a OPÇÃO tocada — quem aplica a regra é quem chama. */
  onAlternar: (opcao: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View style={e.achados} testID={`avc-achados-${campo}`}>
      {opcoes.map((op) => {
        const marcado = selecionados.includes(op);
        return (
          <Pressable
            key={op}
            style={e.achadoLinha}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: marcado }}
            aria-checked={marcado}
            testID={`avc-item-${campo}-${op}`}
            onPress={() => onAlternar(op)}
          >
            <View style={[e.achadoMarca, marcado ? e.achadoMarcaOn : null]}>
              {marcado ? <Feather name="check" size={11} color={e.corSobreMarca.color} /> : null}
            </View>
            <Text style={[e.achadoTexto, marcado ? e.achadoTextoOn : null]}>{tr(op)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5 · LINHA DE RELÓGIO — compacta
 * ────────────────────────────────────────────────────────────────────────── */

export function LinhaDeRelogio({
  campo,
  icone,
  rotulo,
  valor,
  estado,
  destaque,
  onPress,
}: {
  campo: string;
  icone: NomeDeIcone;
  rotulo: string;
  /** ⚠️ Já formatado por quem sabe formatar — ⛔ o kit ⛔ não conhece relógio. */
  valor: string;
  estado: "registrado" | "vazio" | "desconhecido";
  /** ⚠️ Recém-revelado pelo contexto — ⛔ dura ⛔ só enquanto estiver vazio. */
  destaque?: boolean;
  onPress: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <Pressable
      style={[e.rel, destaque ? e.relDestaque : null]}
      accessibilityRole="button"
      /**
       * ⚠️⚠️ O `testID` É O CONTRATO — `avc-hora-<campo>`, como sempre foi.
       *
       * ⛔ A primeira versão inventou `avc-rel-*` ⛔ e derrubou 29 conferências
       * da Superfície A de uma vez. ⚠️ Renomear a superfície de contrato numa
       * reescrita **desliga a suíte justo quando ela é mais necessária** — ⛔ e o
       * defeito ⛔ não teria aparecido se ela tivesse continuado verde por sorte.
       */
      testID={`avc-hora-${campo}`}
      onPress={onPress}
    >
      <Icone nome={icone} tamanho={15} />
      <Text style={e.relNome}>{tr(rotulo)}</Text>
      <Text
        style={[
          e.relValor,
          estado === "vazio" ? e.relValorVazio : null,
          estado === "desconhecido" ? e.relValorDesconhecido : null,
        ]}
        testID={`avc-hora-valor-${campo}`}
      >
        {estado === "registrado" ? valor : tr(valor)}
      </Text>
    </Pressable>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5b · LEITURAS — três blocos, ⛔ e ⛔ NÃO uma parede
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ TRÊS BLOCOS, ⛔ E A DIVISÃO VEM DO **TOM QUE O MODELO JÁ DECLARA**.
 *
 *   · `atencao`     → situação clínica verdadeira. **Única com cor forte.**
 *   · `pendente`    → falta responder. Neutro — ⛔ campo vazio ⛔ não é alerta.
 *   · `informativo` → já respondido, ⛔ sem consequência. Recolhido.
 *
 * ⚠️⚠️ DÍVIDA VISUAL REGISTRADA (autor, 2026-09-01) — ⛔ NÃO implementar ainda:
 * `Falta responder · N` pode passar a mostrar **2–3 itens + "Ver todos"**. ⛔ Isso
 * é progressive disclosure de lista, ⛔ e ⛔ não classificação de bloqueio —
 * ⛔ nada de semântica muda. ⚠️ E `Registrado` pode um dia separar "agora" de
 * "antigo". ⛔ Nenhum dos dois entra nesta rodada.
 *
 * ⚠️⚠️ ⛔ O QUE ⛔ NÃO DÁ PARA FAZER AQUI: separar *"precisa para decidir"* de
 * *"pode completar depois"*. ⛔ Isso exigiria saber **qual pendência trava qual
 * decisão**, ⛔ e o modelo ⛔ não declara isso. ⚠️ Inventar a divisão na tela
 * seria a apresentação decidindo o que é bloqueante — exatamente o que este
 * módulo ⛔ não deixa a tela fazer.
 */
export function LeiturasEmBlocos({
  leituras,
  aberto,
  onAlternar,
  renderItem,
}: {
  leituras: readonly { id: string; tom: "atencao" | "pendente" | "informativo" }[];
  aberto: boolean;
  onAlternar: () => void;
  renderItem: (id: string) => ReactNode;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const por = (t: string) => leituras.filter((l) => l.tom === t);
  const atencao = por("atencao");
  const pendente = por("pendente");
  const info = por("informativo");

  return (
    <View style={e.blocos} testID="avc-grupo-alertas">
      {atencao.length > 0 ? (
        <View style={e.blocoAtencao} testID="avc-bloco-atencao">
          <Text style={e.blocoTituloAtencao}>{tr("Atenção")}</Text>
          {atencao.map((l) => renderItem(l.id))}
        </View>
      ) : null}

      {pendente.length > 0 ? (
        <View style={e.blocoNeutro} testID="avc-bloco-falta">
          <Text style={e.blocoTitulo}>
            {tr("Falta responder")} · {pendente.length}
          </Text>
          {pendente.map((l) => renderItem(l.id))}
        </View>
      ) : null}

      {info.length > 0 ? (
        <View style={e.blocoNeutro} testID="avc-bloco-registrado">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: aberto }}
            testID="avc-bloco-registrado-abrir"
            onPress={onAlternar}
          >
            <Text style={e.blocoTitulo}>
              {tr("Registrado")} · {info.length} {aberto ? "⌃" : "⌄"}
            </Text>
          </Pressable>
          {aberto ? info.map((l) => renderItem(l.id)) : null}
        </View>
      ) : null}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 6 · INFORMAÇÃO RECOLHIDA
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ RECOLHER ⛔ NÃO É APAGAR. ⚠️ O texto da diretriz continua inteiro, a um
 * toque — ⛔ e ⛔ fora da camada que o médico atravessa a cada atendimento.
 */
export function Recolhido({
  id,
  texto,
  aberto,
  onAlternar,
  children,
}: {
  id: string;
  texto?: string;
  aberto: boolean;
  onAlternar: () => void;
  /**
   * ⚠️⚠️ O DETALHE RICO — fonte, verbatim, rastreabilidade.
   *
   * ⛔ A primeira versão aceitava **uma string só** ⛔ e escolhia entre `nota` e
   * `ajuda` com `??`. ⚠️ Resultado: uma das duas sumia da tela, ⛔ e o
   * `DetalheDoCampo` — que carrega a **fonte da afirmação** (E-30) — ⛔ nunca
   * chegava a ser renderizado. ⛔ Recolher ⛔ não é apagar; ⛔ escolher entre dois
   * textos **é** apagar um deles.
   */
  children?: ReactNode;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  return (
    <View>
      <Pressable
        style={e.info}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        accessibilityLabel={tr("Ver critério")}
        testID={`avc-info-${id}`}
        onPress={onAlternar}
      >
        <Icone nome="informacao" tamanho={13} />
      </Pressable>
      {aberto ? (
        <View testID={`avc-info-texto-${id}`}>
          {texto ? <Text style={e.infoTexto}>{tr(texto)}</Text> : null}
          {children}
        </View>
      ) : null}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * estilos
 * ────────────────────────────────────────────────────────────────────────── */

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    corPadraoDeIcone: { color: tema.cores.textSecondary },
    corPlaceholder: { color: tema.cores.textSecondary },

    secao: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm, marginTop: ESPACO.md },
    secaoTitulo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    secaoFilete: { flex: 1, height: 1, backgroundColor: tema.cores.border },

    seg: {
      flexDirection: "row",
      borderWidth: 2,
      borderColor: tema.cores.border,
      borderRadius: RAIO.botao,
      overflow: "hidden",
    },
    /** ⚠️ Alvo de DEDO, ⛔ e ⛔ não de mouse: 44 px é o piso. */
    segItem: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 44 },
    segDivisor: { borderLeftWidth: 1, borderLeftColor: tema.cores.border },
    segAtivo: { backgroundColor: tema.cores.primary },
    segTexto: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    segTextoAtivo: { color: tema.cores.onPrimary, fontWeight: "700" },

    achadoBloco: { paddingVertical: ESPACO.xs },
    achadoTopo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    achadoNome: { flex: 1, minWidth: 0 },
    achadoRotulo: { color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    achadoDefinicao: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
    },
    /** ⚠️ Estreito: onze achados de largura cheia seriam 990 px de rolagem. */
    segEstreito: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: tema.cores.border,
      borderRadius: RAIO.botao,
      overflow: "hidden",
      flexShrink: 0,
    },
    /** ⚠️ Estreito na LARGURA, ⛔ e ⛔ nunca na altura — o dedo ⛔ não encolhe. */
    segItemEstreito: {
      paddingHorizontal: ESPACO.xs,
      minWidth: 46,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    segTextoEstreito: { color: tema.cores.text, fontSize: TIPOGRAFIA.micro.fontSize },

    procedencia: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      paddingTop: 2,
    },
    procedenciaDivergente: { color: tema.cores.warning },

    achados: { gap: 1 },
    achadoLinha: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      paddingVertical: ESPACO.xs,
      minHeight: 44,
    },
    achadoMarca: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: tema.cores.border,
      alignItems: "center",
      justifyContent: "center",
    },
    achadoMarcaOn: { backgroundColor: tema.cores.primary, borderColor: tema.cores.primary },
    corSobreMarca: { color: tema.cores.onPrimary },
    achadoTexto: { flex: 1, color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    achadoTextoOn: { fontWeight: "700" },

    num: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs, paddingVertical: ESPACO.xs },
    numRotulo: { flex: 1, minWidth: 0, color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    numGrupo: { flexDirection: "row", alignItems: "center", gap: ESPACO.xs },
    numCaixa: {
      backgroundColor: tema.cores.bg,
      borderWidth: 2,
      borderColor: tema.cores.border,
      borderRadius: RAIO.botao,
      paddingVertical: ESPACO.xs,
      paddingHorizontal: ESPACO.sm,
      /**
       * ⚠️ LARGURA FIXA — ⛔ e ⛔ não `flex`. ⛔ Esticada, a caixa empurrava a
       * unidade para fora da tela: `mmHg` chegava **cortado**, ⛔ e unidade
       * cortada num campo clínico ⛔ não é detalhe estético.
       */
      width: 92,
      flexGrow: 0,
      flexShrink: 0,
      textAlign: "center",
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.step.fontSize,
      fontWeight: "700",
    },
    numCaixaAlerta: { borderColor: tema.cores.critical, color: tema.cores.critical },
    numUnidade: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      minWidth: 42,
      flexShrink: 0,
    },
    numPasso: { gap: 2 },
    numPassoBotao: {
      backgroundColor: tema.cores.surface,
      borderWidth: 1,
      borderColor: tema.cores.border,
      borderRadius: RAIO.botao,
      width: 30,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    numPassoInerte: { opacity: 0.35 },
    numPassoTexto: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },

    rel: {
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.sm,
      backgroundColor: tema.cores.surface,
      borderWidth: 2,
      borderColor: tema.cores.border,
      borderRadius: RAIO.botao,
      paddingVertical: ESPACO.sm,
      paddingHorizontal: ESPACO.sm,
      marginBottom: ESPACO.xs,
    },
    relDestaque: { borderColor: tema.cores.primary },
    relNome: { flex: 1, color: tema.cores.text, fontSize: TIPOGRAFIA.caption.fontSize },
    relValor: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "700" },
    relValorVazio: {
      color: tema.cores.primary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "400",
    },
    relValorDesconhecido: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      fontWeight: "400",
    },

    blocos: { gap: ESPACO.sm },
    blocoAtencao: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.warning,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    blocoNeutro: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.botao,
      borderWidth: 2,
      borderColor: tema.cores.border,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    blocoTituloAtencao: {
      color: tema.cores.warning,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    blocoTitulo: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },

    info: {
      width: 22,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: tema.cores.border,
      borderRadius: 11,
    },
    infoTexto: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.caption.fontSize,
      marginTop: ESPACO.xs,
    },
  });
