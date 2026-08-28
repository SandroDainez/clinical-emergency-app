/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  LEGACY_ACLS_RUNTIME — manter temporariamente apenas para bradicardia    ║
 * ║  e taquicardia. Não utilizar em novos módulos clínicos.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * ⚠️ SATÉLITE EXCLUSIVO. Este arquivo não estava na lista original dos sete
 * carimbados, e a conferência de consumidores de 2026-08-27 mostrou que ele
 * deveria estar: TODO consumidor seu está dentro do runtime transitório. Ele é
 * legado por dependência, não por conteúdo.
 *
 * Sai do app junto com bradicardia e taquicardia. Registrado como **D-107** em
 * `auditoria/DIVIDAS-CONHECIDAS.md`.
 */
import type { InputField, TreeValues } from "../core/decision-tree/types";

/**
 * "Há sinais de instabilidade?" — decomposta em observações de beira de leito.
 *
 * ── POR QUE ISTO É UM MÓDULO, E NÃO TEXTO COPIADO EM CADA ÁRVORE ─────────────
 *
 * A mesma pergunta aparece em quase todos os módulos: bradicardia, taquicardia,
 * abdome agudo, choque, TEP, dispneia. É pergunta de especialista — pressupõe
 * saber o que conta como sinal e saber atribuí-lo ao quadro. Quem não tem
 * experiência trava aí, e travar num fluxo de emergência é o pior desfecho
 * possível de uma tela.
 *
 * A decomposição foi escrita primeiro na bradicardia e copiada para a
 * taquicardia. Copiar de novo, mais dezesseis vezes, garantiria que um dia as
 * cópias divergiriam — e uma delas ficaria errada em silêncio. Já aconteceu
 * neste app com dose de fármaco.
 *
 * Aqui os critérios existem UMA vez. Corrigir aqui corrige em todo lugar.
 *
 * ── O QUE CONTA COMO INSTABILIDADE ───────────────────────────────────────────
 *
 * Os critérios são os da AHA: hipotensão, alteração aguda do estado mental,
 * sinais de choque, dor torácica isquêmica, insuficiência cardíaca aguda.
 *
 * A primeira versão tratava os cinco como equivalentes e concluía INSTÁVEL com
 * qualquer um sozinho. Estava errado, porque dois deles são COMPOSTOS e foram
 * traduzidos por um único elemento:
 *
 *   "sinais de choque"             virou  "pele pálida, fria ou suada"
 *   "insuficiência cardíaca aguda" virou  "falta de ar"
 *
 * Pele fria e suada não é choque — é um achado que aparece no choque, e também
 * em dor, ansiedade, febre, hipoglicemia e reação vagal. Falta de ar não é IC
 * aguda: a diretriz descreve dispneia COM congestão. Do jeito que estava, um
 * paciente com PAS 110, lúcido, sem dor e sem dispneia era declarado INSTÁVEL
 * só por estar suado.
 *
 *   BASTA SOZINHO   hipotensão (PAS < 90) · alteração aguda do estado mental
 *                   · desconforto torácico de caráter isquêmico
 *   PRECISA DO PAR  pele alterada + má perfusão objetiva  → choque
 *                   dispneia    + congestão               → IC aguda
 *
 * Metade de um critério composto não é estável nem instável: é LIMÍTROFE.
 * Chamar de estável esconderia um sinal real; chamar de instável leva a
 * tratamento de instabilidade em quem não precisa.
 */

export type GrauDeInstabilidade =
  | "instavel"
  | "limitrofe"
  | "estavel"
  /**
   * Dor torácica de caráter isquêmico como ÚNICO achado positivo.
   *
   * Na AHA a dor isquêmica é critério inteiro de instabilidade, e continua
   * sendo — na bradicardia e na taquicardia, onde o destino é o tratamento da
   * arritmia, nada muda.
   *
   * O problema aparecia nos módulos cujo destino de "instável" é uma via
   * específica da doença: no TEP levava a `ar_suporte` (alto risco, discussão de
   * trombólise), no abdome agudo a `catastrofe` (via cirúrgica) e no politrauma
   * a `peso` (hemorragia/transfusão). Nos três, a leitura correta do achado é
   * "considerar síndrome coronariana" — e nenhuma dessas três vias é isso.
   *
   * O grau existe para o módulo consumidor poder mandar esse caso para onde ele
   * pertence. Quem não declarar destino cai em `instavel`, preservando o
   * comportamento da AHA por padrão.
   */
  | "isquemico_isolado";

const SIM_NAO = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

/** Confirmação de um critério composto — pode não dar para avaliar. */
const SIM_NAO_TALVEZ = [
  ...SIM_NAO,
  { value: "nao_avaliado", label: "Não consegui avaliar" },
];

/**
 * Texto de abertura do passo. Diz explicitamente que ninguém precisa saber o
 * significado dos achados — é o que tira o peso de decidir de quem não sabe.
 */
export const INTRO_GUIADA =
  'Responda o que dá para observar agora, à beira do leito. Não precisa saber o que cada achado significa — o app conclui no fim. Na dúvida sobre um item, responda "Não": ele deixa de contar, e os demais continuam valendo.';

/** Rótulo da opção que leva ao caminho guiado, igual em todos os módulos. */
export const OPCAO_GUIADA = "Não sei dizer — me guie pelos sinais";

/**
 * Campos do passo guiado.
 *
 * `contexto` entra na pergunta da dor torácica quando o módulo não é cardíaco —
 * em abdome agudo, por exemplo, perguntar só por dor no peito confunde.
 */
export function camposDeInstabilidade(): InputField[] {
  return [
    {
      id: "pas",
      label: "Pressão sistólica (o número de cima)",
      unit: "mmHg",
      allowCustom: true,
      customKeyboard: "numeric",
      presets: ["70", "80", "90", "100", "120", "140"].map((v) => ({ value: v, label: v })),
    },
    {
      id: "mental",
      label: "Está confuso, muito sonolento, desmaiou ou quase desmaiou agora?",
      presets: SIM_NAO,
    },
    {
      id: "dorToracica",
      label:
        "Dor no peito em aperto, peso ou queimação — podendo irradiar para braço, ombro, pescoço ou mandíbula?",
      presets: SIM_NAO,
    },
    {
      id: "perfusao",
      label: "A pele está pálida, fria ou suada?",
      presets: SIM_NAO,
    },
    {
      // Par de confirmação da pele. Sem ele, "suado" viraria choque — e suor
      // sozinho tem meia dúzia de causas banais.
      id: "perfusaoObjetiva",
      label:
        "Junto com isso: aperte a ponta do dedo por 5 segundos e solte — a cor demora mais de 3 segundos para voltar? (ou urina quase parou)",
      optional: true,
      presets: SIM_NAO_TALVEZ,
    },
    {
      id: "dispneia",
      label: "Falta de ar que apareceu ou piorou agora?",
      presets: SIM_NAO,
    },
    {
      // Par de confirmação da dispneia. É o que separa "cansaço" de
      // insuficiência cardíaca aguda.
      id: "congestao",
      label:
        "Junto com isso: chiado/estalidos na ausculta dos pulmões, não consegue ficar deitado, ou a saturação caiu?",
      optional: true,
      presets: SIM_NAO_TALVEZ,
    },
  ];
}

/**
 * Conclui o grau a partir das observações.
 *
 * Função pura, sem dependência de árvore — é o que permite testá-la uma vez e
 * valer para todos os módulos que a usam.
 */
/**
 * `limiarPas` — a meta mínima de sistólica, que o módulo consumidor pode
 * sobrescrever. Padrão 90, que é o critério da AHA e serve a quase todos.
 *
 * Existe por causa do TCE: ali a meta é PAS ≥ 110 (BTF), e o limiar genérico de
 * 90 SUB-TRIA — um traumatizado de crânio com PAS 95 já está sofrendo lesão
 * secundária, e a derivação padrão não o marcaria como hipotenso.
 */
export type OpcoesDeInstabilidade = { limiarPas?: number };

export function derivarInstabilidade(
  v: TreeValues,
  opcoes: OpcoesDeInstabilidade = {}
): GrauDeInstabilidade {
  // ── PAS vazia é DESCONHECIDA, não normal ────────────────────────────────────
  //
  // A versão anterior tratava campo em branco como NaN e seguia: não-hipotenso,
  // e sem outros achados a conclusão saía ESTÁVEL. O silêncio virava um
  // diagnóstico. "Não inventar hipotensão" — que era a intenção — não é a mesma
  // coisa que "afirmar estabilidade": a primeira é prudência, a segunda é uma
  // afirmação clínica sobre um paciente cuja pressão ninguém mediu.
  //
  // Agora lança. Pelo fluxo normal isto é inalcançável, porque `pas` é campo
  // obrigatório e `advance()` passou a barrar — esta guarda existe para quem
  // chamar a função direto, e para que o erro apareça no teste em vez de na
  // beira do leito.
  //
  // `Number("")` é 0, não NaN, e é por isso que o teste é de string vazia e não
  // de NaN: sem ele, branco viraria "PAS 0" e concluiria INSTÁVEL.
  const bruto = String(v.pas ?? "").trim();
  if (bruto === "") {
    throw new Error(
      "derivarInstabilidade: pressão sistólica ausente. " +
        "Campo vazio significa PAS DESCONHECIDA, não PAS normal — " +
        "concluir estabilidade a partir dele afirmaria o que ninguém mediu."
    );
  }
  const pas = Number(bruto.replace(",", "."));

  const limiarPas = opcoes.limiarPas ?? 90;
  const hipotenso = Number.isFinite(pas) && pas < limiarPas;
  const mental = v.mental === "sim";
  const isquemico = v.dorToracica === "sim";

  // Compostos: o achado só conta com o par que o define.
  const choque = v.perfusao === "sim" && v.perfusaoObjetiva === "sim";
  const icAguda = v.dispneia === "sim" && v.congestao === "sim";

  if (hipotenso || mental || choque || icAguda) return "instavel";

  // A dor isquêmica só é "isolada" se for a ÚNICA coisa positiva. Acompanhada
  // de pele alterada ou de dispneia — mesmo sem o par que fecha os compostos —
  // volta a ser instabilidade: dor isquêmica com perfusão ruim é a apresentação
  // que menos admite espera.
  if (isquemico) {
    if (v.perfusao === "sim" || v.dispneia === "sim") return "instavel";
    return "isquemico_isolado";
  }

  if (v.perfusao === "sim" || v.dispneia === "sim") return "limitrofe";
  return "estavel";
}

/**
 * Roteamento pronto para o campo `next` de um nó de entrada guiado.
 *
 * Recebe os IDs dos três destinos do módulo — cada árvore escreve suas próprias
 * conclusões, com a linguagem e as condutas dela — e devolve o `Roteamento` com
 * `possiveis` declarado, que é o que mantém o grafo auditável estaticamente.
 */
export function roteamentoDeInstabilidade(destinos: {
  instavel: string;
  limitrofe: string;
  estavel: string;
  /**
   * Destino da dor isquêmica ISOLADA. Opcional de propósito: sem ele, o caso
   * cai em `instavel` — que é o comportamento da AHA e o certo na bradicardia
   * e na taquicardia. Só declara quem tem para onde mandar.
   */
  isquemicoIsolado?: string;
},
/**
 * Limiar de sistólica. Pode ser um número fixo ou uma FUNÇÃO das respostas —
 * é o que permite ao politrauma subir a meta para 110 quando o próprio passo
 * identifica trauma de crânio, sem impor esse limiar aos outros consumidores.
 */
limiarPas?: number | ((v: TreeValues) => number)
) {
  const paraGrau = (g: GrauDeInstabilidade): string =>
    g === "isquemico_isolado" ? destinos.isquemicoIsolado ?? destinos.instavel : destinos[g];

  const possiveis = [destinos.instavel, destinos.limitrofe, destinos.estavel];
  if (destinos.isquemicoIsolado) possiveis.push(destinos.isquemicoIsolado);

  return {
    possiveis,
    escolher: (v: TreeValues) =>
      paraGrau(
        derivarInstabilidade(v, {
          limiarPas: typeof limiarPas === "function" ? limiarPas(v) : limiarPas,
        })
      ),
  };
}

/**
 * ── ESFORÇO RESPIRATÓRIO ─────────────────────────────────────────────────────
 *
 * A decomposição hemodinâmica acima NÃO serve para "a dispneia é grave?". São
 * perguntas diferentes, e reusar a errada produziria uma classificação que não
 * é a da pergunta — pior do que não ter guiado nenhum.
 *
 * Aqui o que define gravidade é o TRABALHO respiratório, e ele é observável sem
 * qualquer treino: quem está grave não termina uma frase, usa o pescoço para
 * respirar e prefere ficar sentado. Saturação entra, mas não manda sozinha —
 * oxímetro erra em pele fria, esmalte, perfusão ruim e movimento, e um número
 * bom num paciente exausto não tranquiliza ninguém que esteja olhando.
 *
 * A EXAUSTÃO é o achado que mais se subestima: o paciente que "melhorou" e ficou
 * quieto, com respiração lenta depois de estar taquipneico, não melhorou —
 * cansou. É pré-parada, e por isso conta como grave sozinha.
 */
export function camposRespiratorios(): InputField[] {
  return [
    {
      id: "spo2",
      label: "Saturação de oxigênio (SpO₂)",
      unit: "%",
      allowCustom: true,
      customKeyboard: "numeric",
      presets: ["85", "88", "90", "92", "94", "97"].map((v) => ({ value: v, label: v })),
    },
    {
      id: "frase",
      label: "Consegue falar uma frase inteira sem parar para respirar?",
      presets: [
        { value: "sim", label: "Sim, fala normal" },
        { value: "frases_curtas", label: "Só frases curtas" },
        { value: "palavras", label: "Só palavras soltas" },
      ],
    },
    {
      id: "musculatura",
      label: "Está usando o pescoço e os ombros para respirar, com as costelas afundando, ou a asa do nariz abrindo?",
      presets: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" },
      ],
    },
    {
      id: "posicao",
      label: "Precisa ficar sentado e inclinado para a frente, sem conseguir deitar?",
      presets: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" },
      ],
    },
    {
      id: "exaustao",
      label: "Está sonolento, confuso, ou ficou QUIETO e com respiração lenta depois de estar ofegante?",
      presets: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" },
      ],
    },
  ];
}

/** Grave = SpO₂ < 90, fala comprometida, esforço visível ou exaustão. */
export function derivarGravidadeRespiratoria(v: TreeValues): "grave" | "limitrofe" | "leve" {
  const bruto = String(v.spo2 ?? "").trim();
  const spo2 = bruto === "" ? Number.NaN : Number(bruto.replace(",", "."));
  const hipoxemico = Number.isFinite(spo2) && spo2 < 90;

  // Exaustão é pré-parada respiratória: sozinha basta, e é o achado que mais
  // engana quem olha só o número do oxímetro.
  if (v.exaustao === "sim") return "grave";
  if (hipoxemico) return "grave";
  if (v.frase === "palavras") return "grave";
  if (v.musculatura === "sim" && (v.frase === "frases_curtas" || v.posicao === "sim")) return "grave";

  if (v.musculatura === "sim" || v.frase === "frases_curtas" || v.posicao === "sim") return "limitrofe";
  return "leve";
}
