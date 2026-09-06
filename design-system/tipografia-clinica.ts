/**
 * PAPÉIS TIPOGRÁFICOS DO SISTEMA CLÍNICO — o design system do AVC.
 *
 * ── ⚠️⚠️ POR QUE ISTO ⛔ NÃO É `TIPOGRAFIA` ─────────────────────────────────
 *
 * `design-system/tokens.ts` guarda a escala **antiga do aplicativo**
 * (`display/title/step/body/caption/micro`), consumida por ~111 arquivos de 30
 * módulos. ⛔ Mexer nos valores dela mudaria a aparência de todos ao mesmo
 * tempo — o que o autor pediu explicitamente para ⛔ não fazer nesta fase.
 *
 * ⚠️⚠️ **E a limitação do código antigo ⛔ não pode ditar a tipografia do novo
 * AVC** (autor, 2026-09-05). Então os papéis abaixo nascem **calibrados**, ⛔ e
 * ⛔ não herdados: eles descrevem **função na tela**, ⛔ não tamanho.
 *
 * ⚠️ Quando o AVC for aprovado, decide-se se estes papéis substituem ou
 * reorganizam a escala global. Até lá as duas convivem, ⛔ e ⛔ nenhuma tela do
 * AVC novo consome a antiga.
 *
 * ── ⚠️ A CALIBRAGEM ────────────────────────────────────────────────────────
 *
 * Sete tamanhos, ⛔ e ⛔ não dez: **11 · 13 · 14 · 16 · 17 · 22 · 26**. A
 * hierarquia que sobra vem de **peso**, ⛔ não de mais um tamanho — é assim que
 * as referências separam "título de seção" de "texto principal" sem inflar a
 * escala.
 *
 * ⚠️ O texto principal caiu de 18 para **16**: 18 é confortável ⛔ e custa
 * scroll, ⛔ e o autor pediu que a decisão clínica apareça sem rolagem em tela
 * de celular. 16 continua muito acima do piso de legibilidade.
 *
 * ── ⚠️⚠️ NÚMERO CLÍNICO É TABULAR, SEMPRE ──────────────────────────────────
 *
 * `metrica` ⛔ e `dose` carregam `fontVariant: tabular-nums`. ⛔ Sem isso os
 * dígitos mudam de largura ⛔ e o número "pula" quando atualiza — numa dose por
 * peso, ⛔ isso é leitura errada esperando acontecer.
 */
import type { TextStyle } from "react-native";

/**
 * ⚠️ Os sete tamanhos. ⛔ Nenhum papel abaixo usa valor fora desta lista, ⛔ e a
 * trava `valida-tipografia-clinica` reprova quem tentar.
 */
export const TAMANHO = {
  micro: 11,
  caption: 13,
  secundario: 14,
  primario: 16,
  secao: 17,
  destaque: 22,
  tela: 26,
} as const;

/** ⚠️ Dígitos de largura fixa — obrigatório em número clínico. */
const TABULAR: TextStyle = { fontVariant: ["tabular-nums"] };

/**
 * OS PAPÉIS. ⚠️ Cada um responde **"que função este texto cumpre?"**, ⛔ e
 * ⛔ nunca "que tamanho eu quero aqui".
 *
 * ⛔ Cor ⛔ NÃO entra: ela vem do tema (`tema.cores`), porque muda entre claro e
 * escuro ⛔ e o papel ⛔ não. Misturar as duas coisas foi o que produziu, no
 * código antigo, dezenas de combinações de tamanho+peso+cor por tela.
 */
export const PAPEL = {
  /** ⚠️ Título do módulo no cabeçalho. Um por tela, ⛔ nunca dois. */
  tituloDaTela: {
    fontSize: TAMANHO.tela,
    lineHeight: 32,
    fontWeight: "800",
  } satisfies TextStyle,

  /**
   * ⚠️⚠️ A PERGUNTA QUE A TELA FAZ — o herói da superfície de decisão.
   *
   * ⛔ Menor que o título da tela de propósito: o módulo é o contexto, a
   * **decisão** é o assunto. Empatá-los faria as duas competirem.
   */
  tituloDaDecisao: {
    fontSize: TAMANHO.destaque,
    lineHeight: 28,
    fontWeight: "800",
  } satisfies TextStyle,

  /** ⚠️ Cabeçalho de seção. ⛔ Separa por PESO do texto principal, ⛔ não por tamanho. */
  tituloDeSecao: {
    fontSize: TAMANHO.secao,
    lineHeight: 22,
    fontWeight: "700",
  } satisfies TextStyle,

  /** ⚠️ O texto que o médico lê para decidir. */
  textoPrincipal: {
    fontSize: TAMANHO.primario,
    lineHeight: 22,
    fontWeight: "400",
  } satisfies TextStyle,

  /** ⚠️ Apoio, explicação, contexto. ⛔ Nunca carrega decisão sozinho. */
  textoSecundario: {
    fontSize: TAMANHO.secundario,
    lineHeight: 19,
    fontWeight: "400",
  } satisfies TextStyle,

  /** ⚠️ Valor medido — PA, glicemia, NIHSS, peso. ⛔ Tabular. */
  metrica: {
    fontSize: TAMANHO.destaque,
    lineHeight: 26,
    fontWeight: "700",
    ...TABULAR,
  } satisfies TextStyle,

  /**
   * ⚠️⚠️ DOSE — mesmo tamanho da métrica, **peso maior**.
   *
   * ⛔ Ela ⛔ não é "mais um número": é o que vai na veia do paciente. O peso
   * extra ⛔ não é enfeite — é o que a separa de uma pressão arterial ao lado.
   */
  dose: {
    fontSize: TAMANHO.destaque,
    lineHeight: 26,
    fontWeight: "800",
    ...TABULAR,
  } satisfies TextStyle,

  /** ⚠️ Rótulo do valor medido ("PA", "NIHSS"). ⛔ Curto, ⛔ e acima do número. */
  rotuloDeMetrica: {
    fontSize: TAMANHO.caption,
    lineHeight: 16,
    fontWeight: "600",
  } satisfies TextStyle,

  /** ⚠️ Legenda, horário, procedência. */
  legenda: {
    fontSize: TAMANHO.caption,
    lineHeight: 17,
    fontWeight: "500",
  } satisfies TextStyle,

  /** ⚠️ O menor degrau — selo, aba, marcador. ⛔ Nunca para conteúdo clínico. */
  micro: {
    fontSize: TAMANHO.micro,
    lineHeight: 14,
    fontWeight: "600",
  } satisfies TextStyle,
} as const;

export type NomeDePapel = keyof typeof PAPEL;
