import type { InputField, TreeValues } from "../core/decision-tree/types";

/**
 * INSTABILIDADE — DESCOBERTA GUIADA, ESPECÍFICA DE CORONARIANAS.
 *
 * ⚠️ ARQUIVO NOVO, NÃO TOCA EM `lib/instabilidade-guiada.ts`. Aquele arquivo é
 * consumido por ~8 módulos (bradicardia, taquicardia, choque, dispneia,
 * politrauma, abdome agudo, TEP...) com um conjunto de campos genérico. O
 * pedido desta rodada foi por um conjunto MAIS RICO e específico (via aérea,
 * esforço respiratório, SpO₂, FC/ritmo, edema pulmonar e pulso como campos
 * próprios) — estendê-lo ali arriscaria mudar o que os outros 8 já usam,
 * mesmo que aditivamente. Um arquivo próprio custa uma duplicação pequena
 * (a lógica de PAS<90, já validada no app) e garante risco zero aos outros
 * módulos, que é a exigência de cada rodada desta sessão.
 *
 * ── OS 5 BLOCOS, NÃO 10 PERGUNTAS DE UMA VEZ ────────────────────────────────
 *
 * Pedido do autor: "evitar exibir 10 perguntas simultaneamente... agrupar em
 * poucos blocos clínicos". Cada bloco é um NÓ DE ENTRADA PRÓPRIO na árvore
 * (1–3 campos cada), não uma lista comprida numa tela só — mantém o primeiro
 * viewport curto em cada passo, e cada bloco é pequeno o bastante para caber
 * sem rolar em 375×667.
 *
 * ── POR QUE A DERIVAÇÃO NÃO É MAIS "QUALQUER ACHADO ISOLADO = INSTÁVEL"
 * (correção de 2026-08-24, pedido explícito do autor) ──────────────────────
 *
 * A versão anterior tratava qualquer achado positivo como suficiente sozinho.
 * O autor pediu uma classificação em três categorias — `suficiente_para_
 * instabilidade`, `alerta_dependente_de_contexto`, `não_instabilidade` — e só
 * a primeira pode disparar a saída antecipada (early exit) isoladamente.
 * `avaliarAmeacaImediata()` é a função única que decide isso; ela é chamada
 * depois de CADA bloco (não só do último), e o resultado (se houver) já diz
 * QUAL ameaça foi encontrada — necessário porque o resultado da tela de
 * estabilização precisa nomear a ameaça, não rotular tudo como "instabilidade
 * hemodinâmica" (pedido explícito: SpO₂ baixa é ameaça RESPIRATÓRIA).
 *
 * O limiar de PAS < 90 é o único número reaproveitado de um critério já
 * usado e testado neste app (não é novo, não foi inventado agora).
 */

const SIM_NAO = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

export function blocoConscienciaViaAerea(): InputField[] {
  return [
    {
      // ⚠️ A PERGUNTA JÁ EXCLUI O BASAL (ajuste pedido, 2026-08-24): "confuso/
      // sonolento" sem qualificar capturava alteração CRÔNICA do paciente
      // (demência, sequela prévia) como se fosse instabilidade nova. A
      // pergunta agora pede a mudança AGUDA, comparada ao padrão dele — é o
      // próprio enunciado que impede a classificação automática do basal.
      id: "cor_consciencia",
      label: "Piora AGUDA e importante da consciência agora — diferente do padrão basal dele?",
      presets: SIM_NAO,
    },
    {
      id: "cor_via_aerea_livre",
      label: "A via aérea está livre — fala frases inteiras, sem estridor?",
      presets: SIM_NAO,
    },
  ];
}

export function blocoRespiracao(): InputField[] {
  return [
    {
      id: "spo2",
      label: "SpO₂",
      unit: "%",
      allowCustom: true,
      customKeyboard: "numeric",
      presets: ["85", "88", "90", "94", "97"].map((v) => ({ value: v, label: v })),
    },
    {
      id: "cor_esforco_resp",
      label: "Usa musculatura acessória ou não completa frases por falta de ar?",
      presets: SIM_NAO,
    },
  ];
}

export function blocoCirculacao(): InputField[] {
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
      // ⚠️ SOZINHO NÃO BASTA (ajuste pedido, 2026-08-24) — pele fria/pálida/
      // sudoreica pode vir de dor ou ansiedade, não só de choque. Continua
      // `alerta_dependente_de_contexto`: só deriva instabilidade em CONJUNTO
      // com outro sinal objetivo de hipoperfusão (pulso filiforme ou ritmo
      // irregular) — ver `avaliarAmeacaImediata`.
      id: "cor_perfusao",
      label: "Pele fria, pálida ou sudoreica?",
      presets: SIM_NAO,
    },
  ];
}

export function blocoRitmo(): InputField[] {
  return [
    {
      id: "fc",
      label: "Frequência cardíaca",
      unit: "bpm",
      allowCustom: true,
      customKeyboard: "numeric",
      presets: ["50", "70", "100", "130", "160"].map((v) => ({ value: v, label: v })),
    },
    {
      // ⚠️ SOZINHO NÃO BASTA (ajuste pedido, 2026-08-24) — ritmo irregular
      // isolado (ex.: FA crônica conhecida, estável) não define ameaça
      // imediata. Só deriva em CONJUNTO com outro sinal objetivo de
      // hipoperfusão (perfusão alterada) — ver `avaliarAmeacaImediata`.
      id: "cor_ritmo_irregular",
      label: "Ritmo irregular ao monitor ou à palpação?",
      presets: [...SIM_NAO, { value: "nao_avaliado", label: "Não avaliei" }],
    },
  ];
}

export function blocoIsquemiaEapPulso(): InputField[] {
  return [
    {
      // ⚠️ PRÉ-CONDIÇÃO DE PERGUNTA (Bloco 2, correção 2026-08-24): a versão
      // anterior perguntava "apesar do tratamento inicial" — mas nenhum
      // tratamento anti-isquêmico foi executado OU CONFIRMADO antes deste
      // nó (os 5 blocos de estabilidade vêm logo depois de `entry`, que só
      // MONITORIZA; nitrato/morfina só entram muito mais adiante, em
      // `stemi_meds`/`nste_meds`). A pergunta agora é sobre o ESTADO ATUAL,
      // sem pressupor uma ação que o fluxo ainda não confirmou.
      //
      // REGRA GERAL (vale para todo campo deste arquivo, e é o contrato do
      // Bloco 2 a partir de agora): toda pergunta precisa ser respondível
      // só com fatos/achados já disponíveis no estado atual — nunca
      // pressupor tratamento, exame ou decisão que o fluxo ainda não
      // executou nem confirmou. "Apesar do tratamento inicial" só pode
      // voltar a aparecer em um nó POSTERIOR a `stemi_meds`/`nste_meds`,
      // onde o app já orientou e confirmou esse tratamento.
      id: "cor_dor_isquemica_atual",
      label: "Dor torácica isquêmica intensa ou persistente agora?",
      presets: SIM_NAO,
    },
    {
      // ⚠️ REPERCUSSÃO CLÍNICA REAL, NÃO O RÓTULO "EAP" (correção 2026-08-24)
      // — o enunciado agora nomeia as 4 formas de repercussão que qualificam
      // (desconforto respiratório importante, hipoxemia, repercussão
      // hemodinâmica, necessidade de suporte ventilatório), não só
      // "estertores + desconforto". Crepitação isolada, sem nenhuma dessas
      // repercussões, não deriva ameaça imediata.
      id: "cor_edema_pulmonar",
      label: "Edema pulmonar com repercussão clínica real — desconforto respiratório importante, hipoxemia, repercussão hemodinâmica ou necessidade de suporte ventilatório (não só crepitações isoladas)?",
      presets: SIM_NAO,
    },
    {
      // ⚠️ AUSENTE × FILIFORME SEPARADOS (ajuste pedido, 2026-08-24) — os dois
      // eram uma pergunta só ("filiforme ou ausente?"). Pulso central AUSENTE
      // é parada cardiorrespiratória (sai para o ramo de PCR, não para
      // estabilização genérica); pulso FILIFORME mas presente é
      // `alerta_dependente_de_contexto` — só deriva instabilidade associado a
      // outro sinal objetivo de hipoperfusão (perfusão alterada).
      id: "cor_pulso_alterado",
      label: "Pulso central (carotídeo/femoral)",
      presets: [
        { value: "ausente", label: "Ausente" },
        { value: "filiforme", label: "Muito fraco/filiforme, mas presente" },
        { value: "normal", label: "Normal" },
      ],
    },
    {
      // ⚠️ DADO PRECOCE, NÃO GATE (decisão do autor, 2026-08-25) — "quando
      // começou?" é perguntado cedo no atendimento real, e o app precisa ter
      // o dado disponível quando a estratégia de reperfusão for decidida.
      // Mas ele NÃO PODE travar esta tela nem, antes, a chegada ao ECG: por
      // isso `optional: true`. Se chegar à reperfusão sem ele, aí sim um nó
      // condicional (`tempo_se_ausente`) o exige — dado importante ≠ tela
      // bloqueante.
      id: "tempo_dor",
      label: "Quando a dor começou? (pode responder depois)",
      optional: true,
      presets: [
        { value: "< 1 h", label: "< 1 h" },
        { value: "1–3 h", label: "1–3 h" },
        { value: "3–6 h", label: "3–6 h" },
        { value: "6–12 h", label: "6–12 h" },
        { value: "12–24 h", label: "12–24 h" },
        { value: "> 24 h", label: "> 24 h" },
        { value: "intermitente / indefinido", label: "Indefinido" },
      ],
    },
  ];}

/**
 * QUAL ameaça imediata foi encontrada — e para ONDE ela direciona.
 *
 * ⚠️ `destino` SUBSTITUI O `pcr: boolean` ANTERIOR (Bloco 2, 2026-08-24) —
 * pedido explícito: "pulso ausente → PCR; arritmia instável → ramo
 * correspondente; choque → ramo de choque; via aérea ameaçada → via aérea;
 * insuficiência respiratória grave → suporte respiratório". Cada ameaça
 * imediata agora sabe para qual MÓDULO do app ela vai — o mesmo padrão já
 * usado em `ira-decision-tree.ts` (`abcde_a/b/c` → isr-rapida/ventilacao-
 * mecanica/choque) e em `acls-bradycardia-tree.ts` (`bradi_sem_pulso` →
 * pcr-adulto). Edema pulmonar COM repercussão real fica em
 * `estabilizacao_ramo`, dentro do próprio fluxo coronariano — não faz
 * sentido mandar isso para outro módulo quando SCA é exatamente o assunto
 * deste. Dor isquêmica atual tem destino PRÓPRIO, `isquemia_em_curso` — ela
 * NÃO é ameaça fisiológica (o paciente pode estar estável e só manter
 * isquemia ativa), então não entra em `estabilizacao_ramo`.
 */
export type DestinoAmeaca =
  | "pcr"
  | "via_aerea"
  | "respiratorio"
  | "choque"
  | "arritmia_bradi"
  | "arritmia_taqui"
  | "estabilizacao_ramo"
  | "isquemia_em_curso";

export type AmeacaImediata = {
  id:
    | "pulso_ausente"
    | "via_aerea"
    | "consciencia_aguda"
    | "hipoxemia"
    | "esforco_respiratorio"
    | "dor_isquemica_atual"
    | "edema_pulmonar"
    | "choque_pas"
    | "choque_associado"
    | "arritmia_associada";
  /** Frase curta — usada no token {ameacaEncontrada} da tela de estabilização. */
  rotulo: string;
  /** Para onde a ameaça direciona — ver `DestinoAmeaca`. */
  destino: DestinoAmeaca;
};

/**
 * Função pura — testável isolada. Chamada depois de CADA bloco (early exit) e,
 * de novo, depois do último (mesma chamada — não há lógica duplicada: se nada
 * foi encontrado em nenhum bloco, o resultado aqui é `null` tanto no meio do
 * fluxo quanto no fim, e `null` no fim é o que deriva "estável").
 *
 * ⚠️ ORDEM = GRAVIDADE, não ordem de coleta. Pulso ausente (PCR) sempre
 * primeiro; os achados `suficiente_para_instabilidade` isolados depois; os
 * compostos (`alerta_dependente_de_contexto` + outro sinal objetivo) por
 * último, porque só fazem sentido quando os dois lados já foram coletados.
 *
 * ⚠️ NENHUM CRITÉRIO DE QUANDO DISPARAR MUDOU NESTA RODADA — só o destino
 * (para onde cada ameaça já derivada encaminha) foi refinado. As condições
 * "suficiente sozinho" × "só em conjunto" continuam exatamente as mesmas já
 * aprovadas.
 */
export function avaliarAmeacaImediata(v: TreeValues): AmeacaImediata | null {
  const pas = Number(String(v.pas ?? "").replace(",", "."));
  const spo2 = Number(String(v.spo2 ?? "").replace(",", "."));
  const fc = Number(String(v.fc ?? "").replace(",", "."));
  const sim = (x: string | undefined) => x === "sim";

  if (v.cor_pulso_alterado === "ausente") {
    return { id: "pulso_ausente", rotulo: "Pulso central ausente — isto é PCR, não gravidade de SCA", destino: "pcr" };
  }
  if (v.cor_via_aerea_livre === "nao") {
    return { id: "via_aerea", rotulo: "Via aérea não livre (estridor)", destino: "via_aerea" };
  }
  // ⚠️ CONSCIÊNCIA AGUDA VAI PARA VIA AÉREA, NÃO PARA UM MÓDULO PRÓPRIO —
  // rebaixamento agudo e importante é, antes de mais nada, risco de perda de
  // proteção de via aérea (mesmo raciocínio de `ira-decision-tree.ts`,
  // `abcde_a`). Não há módulo específico de "nível de consciência" no app.
  if (sim(v.cor_consciencia)) {
    return { id: "consciencia_aguda", rotulo: "Piora aguda e importante da consciência", destino: "via_aerea" };
  }
  if (Number.isFinite(spo2) && spo2 > 0 && spo2 < 90) {
    return { id: "hipoxemia", rotulo: "SpO₂ < 90% — correção/estabilização respiratória necessária", destino: "respiratorio" };
  }
  if (sim(v.cor_esforco_resp)) {
    return { id: "esforco_respiratorio", rotulo: "Esforço respiratório importante (musculatura acessória / frases incompletas)", destino: "respiratorio" };
  }
  // ⚠️ ESTES DOIS FICAM NO PRÓPRIO MÓDULO — dor isquêmica refratária e edema
  // pulmonar cardiogênico SÃO o assunto de Síndromes Coronarianas, não algo
  // a entregar a outro módulo.
  // ⚠️ NÃO É "INSTABILIDADE" (correção 2026-08-24, pedido explícito) — dor
  // isquêmica atual, sozinha, NÃO é ameaça fisiológica: o paciente pode
  // estar estável e só manter isquemia ativa. Por isso o destino é
  // `isquemia_em_curso`, não `estabilizacao_ramo` — a tela de destino
  // ACELERA a via coronariana (ECG/classificação/reperfusão), não trata
  // como se precisasse "estabilizar antes de seguir".
  if (sim(v.cor_dor_isquemica_atual)) {
    return { id: "dor_isquemica_atual", rotulo: "Dor torácica isquêmica intensa ou persistente", destino: "isquemia_em_curso" };
  }
  if (sim(v.cor_edema_pulmonar)) {
    return { id: "edema_pulmonar", rotulo: "Edema pulmonar clinicamente relevante", destino: "estabilizacao_ramo" };
  }
  if (Number.isFinite(pas) && pas > 0 && pas < 90) {
    return { id: "choque_pas", rotulo: "PAS < 90 mmHg", destino: "choque" };
  }
  // ── COMPOSTOS: nenhum dos dois lados basta sozinho, mas juntos descrevem
  // hipoperfusão objetiva (pedido explícito: "se associada a outros sinais
  // objetivos de hipoperfusão, o conjunto pode derivar instabilidade").
  const perfusaoAlterada = sim(v.cor_perfusao);
  if (perfusaoAlterada && v.cor_pulso_alterado === "filiforme") {
    return { id: "choque_associado", rotulo: "Pulso filiforme + sinais de hipoperfusão (pele fria/pálida/sudoreica)", destino: "choque" };
  }
  // ⚠️ CORREÇÃO 2026-08-25 (auditoria SCA, achado C1) — FC EXTREMA + hipoperfusão
  // dispara arritmia associada MESMO COM RITMO REGULAR. A versão anterior exigia
  // `cor_ritmo_irregular === "sim"` também para os dois ramos de FC extrema —
  // isso deixava passar batido um BAV total clássico (regular, lento) ou uma TV
  // monomórfica com pulso (regular, rápida), ambos instáveis, sempre que PAS
  // ainda não tivesse caído abaixo de 90 e o pulso não estivesse filiforme. A
  // irregularidade do ritmo não é pré-requisito clínico para bradi/taquiarritmia
  // instável — é a combinação FC extrema + hipoperfusão que importa.
  if (perfusaoAlterada && Number.isFinite(fc) && fc > 0 && fc < 60) {
    return { id: "arritmia_associada", rotulo: "FC baixa + sinais de hipoperfusão", destino: "arritmia_bradi" };
  }
  if (perfusaoAlterada && Number.isFinite(fc) && fc >= 100) {
    return { id: "arritmia_associada", rotulo: "FC alta + sinais de hipoperfusão", destino: "arritmia_taqui" };
  }
  // Ritmo irregular em faixa de FC NORMAL (60–99) + hipoperfusão: aqui a FC não
  // é o motor óbvio, mas a irregularidade em si já é achado objetivo suficiente
  // associado a hipoperfusão → choque (mesmo critério de sempre, inalterado).
  if (perfusaoAlterada && v.cor_ritmo_irregular === "sim") {
    return { id: "choque_associado", rotulo: "Ritmo irregular + sinais de hipoperfusão (pele fria/pálida/sudoreica)", destino: "choque" };
  }
  return null;
}

/** Classificação final estável/instável — mesma função de ameaça, sem duplicar critério. */
export function derivarInstabilidadeCoronariana(v: TreeValues): "instavel" | "estavel" {
  return avaliarAmeacaImediata(v) ? "instavel" : "estavel";
}

/**
 * ⚠️ NOVO (correção final 2026-08-25, auditoria SCA item I3/B) — BRE novo:
 * "há dor isquêmica ativa e/ou instabilidade associada?" não pode reperguntar
 * o que os blocos de estabilidade (ou o julgamento direto) já determinaram
 * minutos antes, no mesmo caso. Função pura — deriva de `cor_dor_isquemica_
 * atual` (Bloco 5) e `estabilidade_avaliada` (julgamento direto). Devolve
 * `null` quando nenhum dos dois foi coletado (ex.: atalho "já tenho o ECG na
 * mão" pula os blocos de estabilidade) — só nesse caso a árvore ainda
 * pergunta.
 */
export function derivarCorrelacaoBre(v: TreeValues): "ativa" | "isolado" | null {
  if (v.estabilidade_avaliada === "instavel") return "ativa";
  if (v.cor_dor_isquemica_atual === "sim") return "ativa";
  if (v.cor_dor_isquemica_atual === "nao") return "isolado";
  return null;
}
