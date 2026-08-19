/**
 * TRAÇADOS DE ECG — desenhados em código, para reconhecimento de padrão.
 *
 * ── ⚠️ POR QUE ESTES DESENHOS EXISTEM, E POR QUE SÓ ESTES ───────────────────
 *
 * O ramo mais letal do renal pedia ao usuário que traduzisse uma FRASE numa
 * IMAGEM: "ECG com ondas T apiculadas". Reconhecer padrão de traçado é tarefa
 * de olho; descrevê-la em texto transfere para quem não tem experiência
 * justamente a tradução mais difícil do fluxo.
 *
 * A regra que impede isto virar enfeite é do médico e é dura: **uma imagem só
 * entra numa tela se muda a resposta da pergunta daquela tela.** Aqui muda —
 * a pergunta é "o ECG do seu paciente se parece com algum destes?", e sem os
 * desenhos ela é irrespondível. Anatomia ilustrativa, ícone decorativo e
 * esquema "educativo" continuam fora.
 *
 * ── POR QUE VETOR EM CÓDIGO, E NÃO IMAGEM IMPORTADA ─────────────────────────
 *
 * Mesma decisão dos 31 desenhos do hub, e pelas mesmas razões medidas lá: sem
 * questão de licença ou procedência (estes traçados são desenhados aqui, não
 * copiados de lugar nenhum), praticamente sem peso, nítido em qualquer
 * densidade, funciona offline e obedece à paleta — a cor entra por parâmetro,
 * nunca hexadecimal fixo (`test:paleta`).
 *
 * ── ⚠️ O QUE ESTES DESENHOS SÃO E O QUE NÃO SÃO ────────────────────────────
 *
 * São ESQUEMAS DE PADRÃO, não traçados de paciente e não escala de papel de
 * ECG. Não têm quadriculado, não medem milissegundos e não servem para medir
 * intervalo nenhum: servem para o olho comparar a FORMA do que está no monitor
 * com a forma do que a hipercalemia faz.
 *
 * A progressão desenhada — T alta e estreita → PR alargando e P sumindo com
 * QRS alargando → onda larga fundida (sinusoidal) — é a sequência clássica
 * descrita para a hipercalemia. ⚠️ ELA NÃO É CRONOLOGIA GARANTIDA NEM ESCADA
 * DE VALOR: os achados não aparecem em ordem obrigatória, não correspondem a
 * faixas fixas de potássio, e a ausência deles NÃO exclui hipercalemia grave —
 * o que a tela que os usa diz com todas as letras.
 */

/** Geometria comum: a faixa em que todos os traçados são desenhados. */
const L = 260;
const A = 84;
/** Linha de base — o "zero" elétrico. */
const B = 52;

/**
 * Monta o SVG de um traçado.
 *
 * `cor` entra por parâmetro porque o design system decide a cor do texto e da
 * linha conforme o tema; um hexadecimal aqui seria a quarta fonte de cor do app
 * e a trava de paleta reprova (com razão).
 */
function svg(caminho: string, cor: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" width="${L}" height="${A}">` +
    `<path d="${caminho}" fill="none" stroke="${cor}" stroke-width="2.4" ` +
    `stroke-linecap="round" stroke-linejoin="round"/>` +
    `</svg>`
  );
}

/**
 * Um batimento, desenhado a partir de `x`.
 *
 * ⚠️ FUNÇÃO DE DESLOCAMENTO, e não string reescrita por expressão regular: a
 * primeira versão duplicava o batimento reescrevendo as coordenadas do próprio
 * path com regex, e isso quebra em silêncio no primeiro comando de curva que
 * não casar o padrão — desenho torto que ninguém vê num diff.
 */
type Batimento = (x: number) => string;

/** Normal: P baixa e arredondada, QRS estreito, T modesta. */
const NORMAL: Batimento = (x) =>
  `M${x} ${B} L${x + 18} ${B} ` +
  `Q${x + 26} ${B - 9} ${x + 34} ${B} ` +
  `L${x + 46} ${B} ` +
  `L${x + 50} ${B + 5} L${x + 56} ${B - 30} L${x + 62} ${B + 8} L${x + 66} ${B} ` +
  `L${x + 82} ${B} ` +
  `Q${x + 96} ${B - 14} ${x + 110} ${B} ` +
  `L${x + 130} ${B}`;

/** T alta, estreita e pontiaguda — o resto do batimento ainda normal. */
const T_APICULADA: Batimento = (x) =>
  `M${x} ${B} L${x + 18} ${B} ` +
  `Q${x + 26} ${B - 9} ${x + 34} ${B} ` +
  `L${x + 46} ${B} ` +
  `L${x + 50} ${B + 5} L${x + 56} ${B - 30} L${x + 62} ${B + 8} L${x + 66} ${B} ` +
  `L${x + 84} ${B} ` +
  `L${x + 98} ${B - 44} L${x + 112} ${B} ` +
  `L${x + 130} ${B}`;

/** P que sumiu, PR indistinguível e QRS alargado, com T ainda alta. */
const QRS_LARGO: Batimento = (x) =>
  `M${x} ${B} L${x + 34} ${B} ` +
  `L${x + 40} ${B + 4} L${x + 52} ${B - 26} L${x + 70} ${B + 6} L${x + 80} ${B} ` +
  `L${x + 92} ${B} ` +
  `L${x + 106} ${B - 38} L${x + 120} ${B} ` +
  `L${x + 130} ${B}`;

/** Onda larga, contínua, sem separar QRS de T — a forma de pré-parada. */
const SINUSOIDAL =
  `M0 ${B} ` +
  `Q16 ${B - 30} 32 ${B} Q48 ${B + 30} 64 ${B} ` +
  `Q80 ${B - 30} 96 ${B} Q112 ${B + 30} 128 ${B} ` +
  `Q144 ${B - 30} 160 ${B} Q176 ${B + 30} 192 ${B} ` +
  `Q208 ${B - 30} 224 ${B} Q240 ${B + 30} 256 ${B}`;

/** Dois batimentos: um só vira figura, dois viram ritmo. */
const dois = (b: Batimento) => `${b(0)} ${b(130)}`;

const CAMINHO: Record<string, string> = {
  ecg_normal: dois(NORMAL),
  ecg_t_apiculada: dois(T_APICULADA),
  ecg_qrs_largo: dois(QRS_LARGO),
  // A sinusoidal já ocupa a faixa inteira: duplicar a esconderia.
  ecg_sinusoidal: SINUSOIDAL,
};

/**
 * Devolve o XML do traçado, ou `undefined` quando o id não existe.
 *
 * ⚠️ `undefined` e não um desenho vazio: sem traçado, a tela mostra o rótulo e
 * a conduta e a ausência aparece — é o mesmo critério do card do hub. Piso
 * silencioso aqui seria um quadrado em branco no ramo mais letal do módulo.
 */
export function tracadoDeEcg(id: string, cor: string): string | undefined {
  const d = CAMINHO[id];
  return d ? svg(d, cor) : undefined;
}

/** Ids desenhados — usado pela trava que confere que todo comparativo existe. */
export const TRACADOS_DE_ECG = Object.keys(CAMINHO);
