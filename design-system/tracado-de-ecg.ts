/**
 * TRAÇADOS DE ECG — desenhados em código, para reconhecimento de padrão.
 *
 * ⚠️ ESTE ARQUIVO É BIBLIOTECA COMPARTILHADA, NÃO ARQUIVO DO MÓDULO RENAL.
 * Nasceu no renal, na família da hipercalemia, mas o tipo de nó `PADRÃO VISUAL`
 * vale para bradicardia, taquicardia, SCA, PCR, TEP, pericardite e intoxicações
 * — cerca de 40 painéis no inventário de `auditoria/PADRAO-VISUAL.md`. Quem
 * edita aqui edita o instrumento de decisão de vários módulos.
 *
 * ── ⚠️ A ESCALA, DECLARADA (e é requisito, não enfeite) ─────────────────────
 *
 * "T alta" é alta EM RELAÇÃO A QUÊ? Painel sem referência não é comparável, e
 * painéis em escalas diferentes MENTEM sobre amplitude — que é justamente o que
 * se está comparando.
 *
 *   6 px = 1 mm   ·   25 mm/s (horizontal)   ·   10 mm/mV (vertical)
 *
 * Disso decorre tudo: um batimento ocupa 150 px = 25 mm = 1 s (≈ 60 bpm), e o R
 * do traçado normal tem 46 px ≈ 7,7 mm ≈ 0,77 mV — amplitude plausível de
 * derivação periférica.
 *
 * ⚠️ A ESCALA É A MESMA NOS CINCO PAINÉIS, e isso foi MEDIDO, não presumido
 * (2026-08-20): mesmo `viewBox`, mesmo eixo do tempo, amplitudes no mesmo
 * sistema de pixels — nenhuma normalização por painel — e os cinco renderizam
 * em 303 × 72 px na tela. É o requisito da §5 de `PADRAO-VISUAL.md`.
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
 * desenhos ela é irrespondível.
 *
 * ── ⚠️ A PRIMEIRA VERSÃO FOI REPROVADA PELO MÉDICO, E ELE ESTAVA CERTO ──────
 *
 * Ela desenhava os complexos com segmentos de reta: picos triangulares, T como
 * um triângulo, sem Q, sem S, sem curvatura. Parecia diagrama de livro infantil
 * e não parecia ECG — e um traçado que não parece ECG não serve para comparar
 * com o monitor, que é a ÚNICA coisa que esta tela pede.
 *
 * Agora a forma é SINTETIZADA como se sintetiza ECG de verdade: cada onda é uma
 * gaussiana com centro, largura e amplitude próprios, e o traçado é a soma
 * delas amostrada ponto a ponto. É o mesmo princípio do modelo clássico de
 * síntese de ECG — P arredondada, Q e S como deflexões estreitas de sinal
 * oposto ao R, T assimétrica. O desenho ganha curvatura, linha de base e
 * proporção entre ondas, que é o que o olho usa para reconhecer.
 *
 * ── POR QUE VETOR EM CÓDIGO, E NÃO IMAGEM IMPORTADA ─────────────────────────
 *
 * Mesma decisão dos 31 desenhos do hub, e pelas mesmas razões medidas lá: sem
 * questão de licença ou procedência (estes traçados são gerados aqui, não
 * copiados de exame de ninguém), praticamente sem peso, nítido em qualquer
 * densidade, funciona offline e obedece à paleta — a cor entra por parâmetro,
 * nunca hexadecimal fixo (`test:paleta`).
 *
 * ── ⚠️ O QUE ESTES DESENHOS SÃO E O QUE NÃO SÃO ────────────────────────────
 *
 * São TRAÇADOS SINTÉTICOS de uma derivação, para comparação de FORMA. Não são
 * exame de paciente, não têm quadriculado de papel e não medem milissegundos:
 * ninguém deve medir intervalo neles. O que eles carregam é a morfologia — e é
 * a morfologia que a hipercalemia muda.
 *
 * A progressão desenhada — T alta e estreita → PR alargando → P que some com
 * QRS alargando → onda larga fundida (sinusoidal) — é a sequência clássica
 * descrita para a hipercalemia. ⚠️ ELA NÃO É CRONOLOGIA GARANTIDA NEM ESCADA DE
 * VALOR: os achados não aparecem em ordem obrigatória, não correspondem a faixas
 * fixas de potássio, e a ausência deles NÃO exclui hipercalemia grave — o que a
 * tela que os usa diz com todas as letras.
 */

/** Faixa em que todos os traçados são desenhados. */
const L = 300;
const A = 110;
/** Linha de base — o "zero" elétrico, com espaço para R acima e S abaixo. */
const BASE = 74;

/** Uma onda: centro e largura em fração do batimento, amplitude em pixels. */
type Onda = { c: number; s: number; a: number };

/**
 * Um batimento é a soma das suas ondas.
 *
 * `dur` é a fração do quadro que um batimento ocupa — é o que permite desenhar
 * um batimento e meio e ainda ver o começo do seguinte, que é o que dá noção de
 * ritmo. Um complexo isolado vira figura; dois seguidos viram traçado.
 */
type Batimento = { ondas: Onda[]; dur: number };

const NORMAL: Batimento = {
  dur: 0.5,
  ondas: [
    { c: 0.13, s: 0.028, a: 7 },    // P — baixa, arredondada, larga
    { c: 0.30, s: 0.010, a: -6 },   // Q — deflexão pequena antes do R
    { c: 0.33, s: 0.012, a: 46 },   // R
    { c: 0.37, s: 0.012, a: -13 },  // S
    { c: 0.56, s: 0.055, a: 13 },   // T — larga, assimétrica, modesta
  ],
};

/** 1 · T alta, estreita e pontiaguda, com o resto do batimento preservado. */
const T_APICULADA: Batimento = {
  dur: 0.5,
  ondas: [
    { c: 0.13, s: 0.028, a: 7 },
    { c: 0.30, s: 0.010, a: -6 },
    { c: 0.33, s: 0.012, a: 46 },
    { c: 0.37, s: 0.012, a: -13 },
    { c: 0.55, s: 0.026, a: 36 },   // T: quase o dobro da altura, metade da largura
  ],
};

/** 2 · PR longo e P achatada — a condução atrial começa a falhar. */
const PR_LONGO: Batimento = {
  dur: 0.5,
  ondas: [
    // ⚠️ A P PRECISA CONTINUAR VISÍVEL AQUI, e a primeira tentativa a achatou
    // tanto que este cartão virou cópia do seguinte. O achado deste estágio é
    // "P menor E LONGE do QRS" — se a P some, já é o próximo padrão.
    { c: 0.05, s: 0.020, a: 6 },
    { c: 0.30, s: 0.010, a: -6 },
    { c: 0.33, s: 0.013, a: 44 },
    { c: 0.37, s: 0.013, a: -13 },
    { c: 0.55, s: 0.028, a: 32 },
  ],
};

/** 3 · P que sumiu e QRS alargado — nenhuma onda antes do complexo. */
const P_AUSENTE_QRS_LARGO: Batimento = {
  dur: 0.5,
  ondas: [
    { c: 0.27, s: 0.030, a: -10 },  // Q larga
    { c: 0.34, s: 0.038, a: 38 },   // R larga — o complexo perde o aspecto de espícula
    { c: 0.43, s: 0.038, a: -20 },  // S larga
    { c: 0.60, s: 0.045, a: 26 },   // T já encostando no S
  ],
};

/** 4 · Sinusoidal — QRS e T fundidos numa onda só. Pré-parada. */
const SINUSOIDAL: Batimento = {
  dur: 0.5,
  ondas: [
    { c: 0.33, s: 0.075, a: 34 },   // uma corcova ampla…
    { c: 0.53, s: 0.075, a: -30 },  // …seguida da contrária, sem nada entre elas
  ],
};

/**
 * Amostra a soma das gaussianas e devolve o `d` do path.
 *
 * ⚠️ AMOSTRAGEM, E NÃO SEGMENTOS DESENHADOS À MÃO: é o que garante que Q, R, S
 * e T se juntem por curva contínua, com linha de base plana entre elas. A
 * versão anterior ligava vértices com retas e por isso não parecia ECG.
 */
function caminho(b: Batimento): string {
  const PASSOS = 460;
  const pts: string[] = [];
  for (let i = 0; i <= PASSOS; i++) {
    const x = (i / PASSOS) * L;
    // Fase dentro do batimento: o traçado se repete enquanto couber no quadro.
    const t = ((i / PASSOS) % b.dur) / b.dur;
    let y = 0;
    for (const o of b.ondas) {
      const d = t - o.c;
      y += o.a * Math.exp(-(d * d) / (2 * o.s * o.s));
    }
    pts.push(`${x.toFixed(1)} ${(BASE - y).toFixed(1)}`);
  }
  return "M" + pts.join(" L");
}

/** 1 mm em pixels. Tudo o mais decorre daqui. */
const MM = 6;

/**
 * A GRADE — recomendação forte, não requisito (emenda E-11 de PADRAO-VISUAL).
 *
 * O requisito é escala IGUAL entre painéis do mesmo comparativo, porque o
 * usuário COMPARA. A grade não existe para ele medir milissegundos: existe para
 * dar a referência de tamanho que o olho usa sem pensar, e para o traçado
 * parecer o que ele é.
 *
 * ⚠️ ELA É DESENHADA ATRÁS E NÃO TOCA NA GEOMETRIA DO TRAÇADO. O `d` do path é
 * exatamente o mesmo de antes dela existir — o que preserva a aprovação médica
 * dos cinco painéis, dada em 2026-08-19 sobre esta mesma forma.
 */
function grade(cor: string): string {
  const finas: string[] = [];
  const grossas: string[] = [];
  for (let x = 0; x <= L; x += MM) (x % (5 * MM) === 0 ? grossas : finas).push(`M${x} 0V${A}`);
  for (let y = 0; y <= A; y += MM) (y % (5 * MM) === 0 ? grossas : finas).push(`M0 ${y}H${L}`);
  return (
    `<path d="${finas.join("")}" stroke="${cor}" stroke-width="0.5" opacity="0.13" fill="none"/>` +
    `<path d="${grossas.join("")}" stroke="${cor}" stroke-width="0.8" opacity="0.26" fill="none"/>`
  );
}

function svg(d: string, cor: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" width="${L}" height="${A}">` +
    grade(cor) +
    `<path d="${d}" fill="none" stroke="${cor}" stroke-width="2" ` +
    `stroke-linecap="round" stroke-linejoin="round"/>` +
    `</svg>`
  );
}

const BATIMENTO: Record<string, Batimento> = {
  ecg_normal: NORMAL,
  ecg_t_apiculada: T_APICULADA,
  ecg_pr_longo: PR_LONGO,
  ecg_qrs_largo: P_AUSENTE_QRS_LARGO,
  ecg_sinusoidal: SINUSOIDAL,
};

/** Os caminhos são calculados uma vez por id; a cor entra depois. */
const CACHE = new Map<string, string>();

/**
 * Devolve o XML do traçado, ou `undefined` quando o id não existe.
 *
 * ⚠️ `undefined` e não um desenho vazio: sem traçado, a tela mostra o rótulo e
 * a conduta, e a ausência aparece. Piso silencioso aqui seria um retângulo em
 * branco no ramo mais letal do módulo.
 */
export function tracadoDeEcg(id: string, cor: string): string | undefined {
  const b = BATIMENTO[id];
  if (!b) return undefined;
  let d = CACHE.get(id);
  if (!d) {
    d = caminho(b);
    CACHE.set(id, d);
  }
  return svg(d, cor);
}

/** Ids desenhados — usado pela trava que confere que todo comparativo existe. */
export const TRACADOS_DE_ECG = Object.keys(BATIMENTO);
