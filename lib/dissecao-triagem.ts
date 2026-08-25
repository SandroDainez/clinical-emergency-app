import type { InputField, TreeValues } from "../core/decision-tree/types";

/**
 * TRIAGEM DE RISCO DE SÍNDROME AÓRTICA AGUDA — antes de liberar AAS/antitrombótico.
 *
 * ⚠️ REESCRITO (Bloco 2/3, 2026-08-24) — a versão anterior era UMA pergunta
 * binária ("algum destes três está presente?") que transformava um achado
 * isolado em "suspeita de dissecção" fechada, sem saída real além de Voltar/
 * Recomeçar. Pedido explícito do autor: distinguir baixa suspeita / suspeita
 * intermediária (exige avaliação adicional) / alta suspeita (imagem urgente)
 * / não sei — e nenhuma saída pode terminar sem ação.
 *
 * ⚠️ FORÇA DA AFIRMAÇÃO: PRÁTICA ACEITA, NÃO RECOMENDAÇÃO GRADUADA DESTA
 * DIRETRIZ. A ACC/AHA/ACEP/NAEMSP/SCAI 2025 (fonte deste módulo) lista
 * "suspeita de dissecção de aorta" como contraindicação ABSOLUTA à fibrinólise
 * (Tabela 14), mas não define, dentro do seu próprio texto, os critérios
 * clínicos de suspeita — isso pertence à diretriz de doença aórtica torácica,
 * que este módulo não abriu nesta rodada.
 *
 * Os 3 BLOCOS (dor / exame / condições predisponentes) são os três grupos
 * clássicos do escore de risco de detecção de dissecção de aorta amplamente
 * difundido na literatura de emergência — prática aceita, não recomendação
 * numerada desta diretriz. ⚠️ O NOME DO ESCORE NÃO APARECE NA TELA (pedido
 * explícito: "não exigir que o usuário conheça o ADD-RS pelo nome") — o app
 * deriva a classificação internamente a partir dos achados observáveis.
 *
 * ── POR QUE 3 BLOCOS, NÃO 3 ITENS NUMA TELA SÓ ──────────────────────────────
 *
 * "Poucos blocos observáveis, de forma enxuta" — cada bloco é 1 pergunta com
 * os achados de exemplo listados, não uma decomposição item a item (o pedido
 * original — "sem transformar isso num questionário excessivo" — continua
 * valendo). O app conta quantos dos 3 BLOCOS vieram "Sim", não quantos itens
 * individuais.
 *
 * ── A REGRA QUE IMPEDE 1 ACHADO DE VIRAR DIAGNÓSTICO ────────────────────────
 *
 * 0 blocos "Sim" → baixa suspeita. 1 bloco "Sim" → suspeita intermediária —
 * NÃO gera indicação automática de angio-TC nem trata o caso como dissecção
 * provável; pede avaliação adicional "conforme contexto/protocolo
 * institucional" (sem codificar uma via de D-dímero/CTA sem fonte/protocolo
 * específico aprovado nesta sessão — R-5). Só 2 ou 3 blocos "Sim" elevam para
 * alta suspeita/imagem urgente.
 */

// ⚠️ REMOVIDO (correção final 2026-08-25, auditoria SCA) — os 3 blocos que
// existiam aqui (dor/exame/predisponente, cada um "algum destes está
// presente?") foram DELETADOS, não só esvaziados. Auditoria comprovou que
// eram redundância pura: por construção do grafo, só se chega a este ponto
// do fluxo DEPOIS do Portão (`portaoGrupoA`/`portaoGrupoB`, abaixo), que já
// perguntou os MESMOS achados — déficit de pulso/PA, déficit neurológico
// focal, sopro de IAo, dor abrupta/rasgando, predisposição aórtica — para
// decidir SE abre a investigação. Reperguntar aqui não coletava dado novo,
// só repetia a pergunta com outras palavras. A classificação de nível
// (`derivarNivelPosPortao`, abaixo) deriva agora DIRETO dos campos do
// Portão — nenhum critério clínico mudou, só parou de perguntar duas vezes.

export type NivelRiscoDisseccao = "intermediaria" | "alta";

/**
 * Função pura — deriva o nível de suspeita a partir do que o Portão JÁ
 * coletou, sem perguntar de novo. Só é chamada depois que o Portão decidiu
 * abrir a investigação (Grupo A sozinho, ou ≥2 domínios do Grupo B) — por
 * isso não existe mais nível "baixa" aqui: quem chegou a este ponto já tem
 * pelo menos um achado forte o bastante para o Portão ter aberto.
 *
 * "alta" = achado direto (Grupo A positivo, ou ≥2 domínios do Grupo B
 * confirmados como "sim"). "intermediaria" = a abertura só se confirmou
 * depois da tela de ajuda (dúvida esclarecida, não achado direto) — mesmo
 * princípio de cautela graduada que já existia, um degrau abaixo do achado
 * direto.
 */
export function derivarNivelPosPortao(v: TreeValues): NivelRiscoDisseccao {
  const grupoASim = v.portaoA_pulso_pa === "sim" || v.portaoA_neuro_focal === "sim" || v.portaoA_sopro_iao === "sim";
  if (grupoASim) return "alta";
  const simCountB = [v.portaoB1_dor_abrupta, v.portaoB2_choque, v.portaoB3_predisposicao].filter((r) => r === "sim").length;
  if (simCountB >= 2) return "alta";
  // Alcançado só via ajuda (confirmação após esclarecer dúvida) ou via
  // retorno de "inconclusivo" do laudo — nível cauteloso por padrão.
  return "intermediaria";
}

export const DISSECCAO_NIVEL_ROTULO: Record<NivelRiscoDisseccao, string> = {
  intermediaria: "suspeita intermediária",
  alta: "alta suspeita",
};

/**
 * ⚠️ A CONDUTA MUDA COM O NÍVEL — mas nunca fixa uma via rígida de D-dímero/
 * CTA na suspeita intermediária (pedido explícito, sem fonte/protocolo
 * específico aprovado nesta sessão). Só a alta suspeita nomeia angio-TC como
 * via inicial usual, com a alternativa explícita para quem está instável ou
 * não pode ir à TC.
 */
export const DISSECCAO_CONDUTA: Record<NivelRiscoDisseccao, string> = {
  alta:
    "Angio-TC de aorta com urgência — opção inicial usual, quando o paciente consegue realizá-la. Se instável ou não pode ir à TC: alternativa conforme disponibilidade institucional (ex.: ecocardiograma transesofágico à beira-leito).",
  intermediaria:
    "Avaliação adicional conforme contexto/protocolo institucional — este app não fixa uma via específica (ex.: D-dímero, angio-TC) sem fonte/protocolo confirmado nesta sessão.",
};

export const DISSECCAO_EQUIPE: Record<NivelRiscoDisseccao, string> = {
  alta: "agora",
  intermediaria: "conforme os achados",
};

/**
 * ⚠️ ANTITROMBÓTICO NÃO É "BLOQUEIO ABSOLUTO INDEFINIDO" IGUAL PARA TODOS OS
 * NÍVEIS (pedido explícito) — alta suspeita bloqueia até esclarecimento
 * (mais firme); suspeita intermediária não libera ENQUANTO a suspeita
 * clínica permanecer relevante (mais condicional — a própria investigação é
 * o que resolve isso, não uma regra fixa).
 */
export const DISSECCAO_ANTITROMBOTICO: Record<NivelRiscoDisseccao, string> = {
  alta: "Antitrombótico: bloqueado até esclarecimento.",
  intermediaria: "Antitrombótico: não liberar enquanto a suspeita clínica permanecer relevante.",
};

// ══════════════════ RESULTADO DA INVESTIGAÇÃO — FLUXO BASEADO EM FATOS ══════
//
// ⚠️ REESCRITO (correção 2026-08-24, pedido explícito): a versão anterior
// perguntava direto "qual o resultado da investigação?" com "confirmada/
// afastada/inconclusiva" como opções — isso pedia ao usuário uma CONCLUSÃO
// DIAGNÓSTICA pronta, o mesmo erro de pressuposição do resto do módulo. Agora
// a pergunta é sobre FATO DISPONÍVEL ("você já tem o resultado do exame de
// imagem?"), e só quando o laudo existe é que se pergunta o que ELE diz —
// nunca o que o usuário concluiu por conta própria.

export const DISSECCAO_PERGUNTA_DISPONIBILIDADE = "Você já tem o resultado do exame de imagem?";

export const DISSECCAO_AGUARDANDO_TEXTO =
  "Manter monitorização contínua e as medidas de segurança em curso enquanto o resultado não chega. Volte aqui assim que o exame estiver pronto.";

export const DISSECCAO_EXAME_NAO_POSSIVEL_TEXTO =
  "Considerar alternativa diagnóstica conforme estabilidade do paciente e disponibilidade institucional (ex.: ecocardiograma transesofágico à beira-leito). Manter avaliação especializada e a suspeita como pendente.";

export const DISSECCAO_PERGUNTA_LAUDO = "O que o laudo informa?";

/**
 * ⚠️ "NÃO SEI INTERPRETAR" NÃO ABRE TEXTO LONGO (pedido explícito) — decompõe
 * em achados observáveis que o próprio laudo costuma nomear, e o app deriva a
 * partir deles. Dois campos bastam: um agrupando os achados que CONFIRMAM
 * (flap intimal, hematoma intramural, úlcera penetrante, extensão aórtica —
 * qualquer um já confirma) e outro perguntando se o laudo AFASTA
 * explicitamente. Nenhum dos dois → inconclusivo, não "sem achado = afastada"
 * por omissão.
 */
export function blocoAjudaLaudo(): InputField[] {
  return [
    {
      id: "disLaudo_achados_confirmatorios",
      label:
        "O laudo menciona algum destes: flap intimal, hematoma intramural, úlcera aterosclerótica penetrante, ou extensão da dissecção?",
      presets: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" },
        { value: "nao_sei", label: "Não sei localizar isso no laudo" },
      ],
    },
    {
      id: "disLaudo_afasta_explicitamente",
      label: "O laudo declara explicitamente ausência de dissecção/síndrome aórtica aguda (conclusão do radiologista)?",
      presets: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" },
        { value: "nao_sei", label: "Não sei localizar isso no laudo" },
      ],
    },
  ];
}

/** Função pura — deriva confirmada/afastada/inconclusiva a partir dos 2 campos acima. */
export function derivarResultadoLaudo(v: TreeValues): "confirmada" | "afastada" | "inconclusiva" {
  if (v.disLaudo_achados_confirmatorios === "sim") return "confirmada";
  if (v.disLaudo_afasta_explicitamente === "sim") return "afastada";
  return "inconclusiva";
}

// ══════════════════ PORTÃO DE ENTRADA — TRAVA DE EXCEÇÃO ═══════════════════
//
// ⚠️ NOVO (correção final 2026-08-25, 4 rodadas de revisão do autor). A
// triagem de dissecção completa (acima) só é alcançada por quem passar por
// este portão — deixou de ser a entrada padrão de todo paciente com SCA.
// Pedido explícito: "quero que a entrada no ramo aórtico seja uma EXCEÇÃO".
//
// GRUPO A — achado de EXAME muito específico, associado ao quadro AGUDO.
// Qualquer um sozinho já abre. Nenhum antecedente entra aqui (antecedente é
// Grupo B — ADD-RS trata condição predisponente como DOMÍNIO DE RISCO, não
// diagnóstico nem indicação isolada de imagem).
//
// GRUPO B — 3 domínios independentes (dor abrupta / choque inexplicado /
// predisposição aórtica). 1 sozinho NÃO abre — só ≥2 domínios DIFERENTES.
// Os 5 itens de predisposição (Marfan, aneurisma, valvopatia, cirurgia
// prévia, história familiar) contam como UM domínio só — tê-los todos ainda
// é 1 domínio positivo, nunca multiplica.
//
// "NÃO SEI" NUNCA CONTA COMO POSITIVO — nem no Grupo A, nem no Grupo B. Um
// achado incerto abre uma tela de esclarecimento com critério mais objetivo
// (a diferença de PA > 20 mmHg é REFERÊNCIA ÚTIL, não corte absoluto
// exclusivo — pedido explícito do autor). Se continuar desconhecido depois
// da ajuda, o portão NÃO abre por causa dele — mas o valor gravado é
// "desconhecido", nunca reescrito silenciosamente como "não".
//
// ⚠️ NÃO É ESCORE VALIDADO — aviso obrigatório. O TEXTO vive só como string
// literal em `coronary-decision-tree.ts` (campo `intro` de `portao_grupo_a`),
// não como constante aqui — a varredura de tradução (`scripts/varredura-
// pt.cjs`) só reconhece string literal estático; uma constante interpolada
// via template string ficaria permanentemente em português, mesmo no app em
// espanhol. Manter as duas cópias sincronizadas é risco de divergência
// silenciosa — por isso só existe UMA cópia (na árvore), e este comentário
// é o registro do porquê não há constante compartilhada.

const PORTAO_PRESETS = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "nao_sei", label: "Não sei" },
];

export function portaoGrupoA(): InputField[] {
  return [
    {
      id: "portaoA_pulso_pa",
      label: "Déficit de pulso ou assimetria clinicamente significativa de PA entre membros?",
      presets: PORTAO_PRESETS,
    },
    {
      id: "portaoA_neuro_focal",
      label: "Déficit neurológico focal associado à dor aguda?",
      presets: PORTAO_PRESETS,
    },
    {
      id: "portaoA_sopro_iao",
      label: "Novo sopro de insuficiência aórtica associado ao quadro agudo?",
      presets: PORTAO_PRESETS,
    },
  ];
}

export function portaoGrupoB(): InputField[] {
  return [
    {
      id: "portaoB1_dor_abrupta",
      label: "Dor abrupta e máxima desde o início, padrão rasgando/dilacerante?",
      presets: PORTAO_PRESETS,
    },
    {
      id: "portaoB2_choque",
      label: "Choque/hipotensão sem explicação coronariana convincente?",
      presets: PORTAO_PRESETS,
    },
    {
      id: "portaoB3_predisposicao",
      label:
        "Predisposição aórtica importante — doença do tecido conjuntivo (ex.: Marfan), aneurisma de aorta torácica conhecido, doença valvar/aórtica relevante conhecida, cirurgia/manipulação aórtica prévia ou história familiar de doença aórtica?",
      presets: PORTAO_PRESETS,
    },
  ];
}

export const PORTAO_AJUDA_GRUPO_A =
  "Critérios mais objetivos: diferença de PA sistólica > 20 mmHg entre os braços é referência útil (não é corte absoluto exclusivo). Déficit neurológico focal = novo déficit motor, sensitivo, de fala ou visual associado ao início da dor. Sopro de insuficiência aórtica = sopro diastólico novo, ausente antes deste episódio.";

export const PORTAO_AJUDA_GRUPO_B =
  "Critérios mais objetivos: dor abrupta/máxima = intensidade máxima já nos primeiros segundos, não crescente. Choque sem explicação coronariana = hipotensão desproporcional ao que o quadro coronariano isolado explicaria. Predisposição aórtica = qualquer um dos itens listados (Marfan, aneurisma conhecido, valvopatia relevante, cirurgia prévia, história familiar) já conta.";

function contarPortao(v: TreeValues, ids: string[]): { sim: number; naoSei: number } {
  let sim = 0;
  let naoSei = 0;
  for (const id of ids) {
    if (v[id] === "sim") sim++;
    else if (v[id] === "nao_sei") naoSei++;
  }
  return { sim, naoSei };
}

const GRUPO_A_IDS = ["portaoA_pulso_pa", "portaoA_neuro_focal", "portaoA_sopro_iao"];
const GRUPO_B_IDS = ["portaoB1_dor_abrupta", "portaoB2_choque", "portaoB3_predisposicao"];

/** Função pura — Grupo A: qualquer "sim" abre sozinho; "não sei" sem "sim" pede ajuda; senão segue Grupo B. */
export function derivarPortaoGrupoA(v: TreeValues): "abre" | "ajuda" | "grupo_b" {
  const { sim, naoSei } = contarPortao(v, GRUPO_A_IDS);
  if (sim > 0) return "abre";
  if (naoSei > 0) return "ajuda";
  return "grupo_b";
}

/**
 * Função pura — Grupo B: ≥2 domínios "sim" abre. Se "sim" + "não sei" somam
 * ≥2 (ou seja, esclarecer o(s) incerto(s) PODE mudar o resultado), pede
 * ajuda antes de decidir. Senão, mesmo resolvendo todo "não sei" como "sim"
 * não chegaria a 2 — não abre, sem precisar perguntar mais nada.
 */
export function derivarPortaoGrupoB(v: TreeValues): "abre" | "ajuda" | "nao_abre" {
  const { sim, naoSei } = contarPortao(v, GRUPO_B_IDS);
  if (sim >= 2) return "abre";
  if (sim + naoSei >= 2) return "ajuda";
  return "nao_abre";
}
