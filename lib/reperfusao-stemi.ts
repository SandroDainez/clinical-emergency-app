import type { TreeValues } from "../core/decision-tree/types";

/**
 * REPERFUSÃO NO STEMI — as derivações puras do ramo mais perigoso do módulo.
 *
 * ── POR QUE ESTE ARQUIVO EXISTE ─────────────────────────────────────────────
 *
 * Antes desta rodada, a decisão de reperfusão era UMA pergunta ("ICP em ≤120
 * min?") cuja resposta "não" caía direto no checklist de contraindicações e,
 * de lá, na fibrinólise. Três dimensões clínicas diferentes — tempo desde o
 * início dos sintomas, atraso logístico até a ICP e elegibilidade à
 * fibrinólise — estavam colapsadas numa pergunta só, e o texto que as
 * separava era `evidence` recolhido: informação que o médico deveria ter
 * lido, não parte da decisão.
 *
 * ⚠️ AQUI UMA FALHA DE ROTEAMENTO NÃO É DEFEITO DE INTERFACE. Liberar
 * fibrinólise para quem tem início indeterminado, apresentação tardia ou
 * contraindicação não resolvida é conduta potencialmente catastrófica. Por
 * isso o ramo é desenhado para que os estados inadequados sejam
 * ESTRUTURALMENTE incapazes de alcançar a administração do fibrinolítico —
 * não apenas desaconselhados por texto de alerta.
 *
 * As funções abaixo são puras e testadas por cenário em
 * `scripts/valida-coronarias.cjs`, que também ENUMERA todos os caminhos do
 * grafo capazes de alcançar `stemi_fibrinolise` e reprova qualquer um que
 * não satisfaça, simultaneamente, todas as pré-condições clínicas.
 */

/** Janela desde o início dos sintomas — o que ela permite muda por completo. */
export type JanelaReperfusao = "<12h" | "12_24h" | ">24h" | "indeterminada";

/**
 * ⚠️ "INDEFINIDO" NÃO É "<12 h" (decisão do autor, 2026-08-25).
 *
 * Tratar incerteza temporal como elegibilidade transformaria a dúvida em
 * autorização para uma terapia hemorrágica. Tratar como ">12 h" também
 * estaria errado: negaria reperfusão a quem talvez esteja na janela. O
 * estado correto é um terceiro — `indeterminada` —, que não abre a
 * fibrinólise e encaminha para estratégia invasiva/avaliação especializada.
 *
 * A reclassificação existe e é legítima: se a história permitir estabelecer
 * um episódio atual contínuo com início conhecido, `tempo_confiavel` vira
 * "sim" e a janela passa a ser calculada normalmente. O que não vale é o
 * app assumir isso sozinho.
 */
export function derivarJanelaReperfusao(v: TreeValues): JanelaReperfusao {
  const t = v.tempo_dor;
  if (!t) return "indeterminada";
  // "intermitente / indefinido" só sai do limbo por confirmação explícita.
  if (t === "intermitente / indefinido") {
    return v.tempo_confiavel === "sim" && v.tempo_confirmado ? janelaPorRotulo(v.tempo_confirmado) : "indeterminada";
  }
  return janelaPorRotulo(t);
}

function janelaPorRotulo(t: string): JanelaReperfusao {
  if (t === "< 1 h" || t === "1–3 h" || t === "3–6 h" || t === "6–12 h") return "<12h";
  if (t === "12–24 h") return "12_24h";
  if (t === "> 24 h") return ">24h";
  return "indeterminada";
}

/**
 * CENÁRIO LOGÍSTICO — e por que a meta não é uma frase só.
 *
 * ⚠️ CORREÇÃO DO AUTOR (2026-08-25): "≤120 min, ideal ≤90 min" como regra
 * universal apaga a diferença entre dois cenários que têm metas diferentes.
 * Quem já está num serviço com hemodinâmica não tem "ideal" de 90 min — tem
 * META de 90 min. Quem precisa ser transferido trabalha com o teto de 120
 * min do primeiro contato médico ao dispositivo. Colapsar os dois faz o
 * médico do primeiro cenário achar que tem 120 min quando tem 90.
 */
export type CenarioIcp = "no_local" | "transferencia";

export const META_ICP: Record<CenarioIcp, string> = {
  no_local:
    "Serviço COM hemodinâmica, sem transferência: meta de 90 minutos entre o primeiro contato médico (FMC) e o dispositivo.",
  transferencia:
    "Hospital SEM hemodinâmica, com necessidade de transferência: meta de 120 minutos entre o primeiro contato médico (FMC) e o dispositivo.",
};

/** Estado da checagem de contraindicações. `nao_resolvido` é o padrão. */
export type EstadoContraindicacao = "nenhuma" | "absoluta" | "relativa" | "nao_resolvido";

/**
 * ⚠️ "NÃO SEI" JAMAIS AUTORIZA FIBRINÓLISE (decisão do autor, 2026-08-25).
 *
 * O fluxo anterior abria a lista item a item e, no fim dela, seguia direto
 * para a administração — quem hesitava terminava trombolisando, que é o
 * default mais perigoso possível neste ponto. Agora a ajuda RECALCULA: só o
 * conjunto "nenhuma absoluta E nenhuma relativa E nada desconhecido" libera
 * a via; qualquer item que permaneça em dúvida devolve `nao_resolvido`, e
 * `nao_resolvido` não tem aresta para o fibrinolítico.
 */
export function derivarEstadoContraindicacao(v: TreeValues): EstadoContraindicacao {
  const abs = v.ciAbsolutas;
  const rel = v.ciRelativas;
  if (!abs || !rel) return "nao_resolvido";
  if (abs === "nao_sei" || rel === "nao_sei") return "nao_resolvido";
  if (abs === "sim") return "absoluta";
  if (rel === "sim") return "relativa";
  return "nenhuma";
}

/**
 * A PRÉ-CONDIÇÃO COMPLETA DA FIBRINÓLISE — em um lugar só.
 *
 * ⚠️ Esta função não roteia nada: ela existe para que a propriedade global
 * exigida pelo autor seja VERIFICÁVEL, e não apenas distribuída por vários
 * nós. A trava de enumeração de caminhos a usa como oráculo — todo caminho
 * do grafo que alcance `stemi_fibrinolise` precisa terminar com um estado
 * em que isto seja verdadeiro.
 */
export function podeFibrinolisar(v: TreeValues): boolean {
  if (derivarJanelaReperfusao(v) !== "<12h") return false;
  if (v.icpDentroDaMeta === "sim") return false; // ICP viável: a via é a ICP
  const ci = derivarEstadoContraindicacao(v);
  if (ci === "absoluta" || ci === "nao_resolvido") return false;
  if (ci === "relativa" && v.decisaoRelativa !== "fibrinolisar") return false;
  if (!v.peso) return false; // sem peso não há dose de tenecteplase
  return true;
}

// ── Estratégia farmacoinvasiva — recomendações declaradas com força ────────
//
// ⚠️ ESTRUTURADO DE PROPÓSITO (pedido do autor): é ponto de segurança
// clínica e precisa ser auditável automaticamente, não texto solto.
export const FARMACOINVASIVA_TRANSFERIR =
  "Após a fibrinólise, TRANSFERIR IMEDIATAMENTE para centro com ICP — ACC/AHA/ACEP/NAEMSP/SCAI 2025, Classe 1, nível A.";

export const FARMACOINVASIVA_RESGATE =
  "Falha de reperfusão: angiografia imediata com intenção de ICP de resgate — ACC/AHA/ACEP/NAEMSP/SCAI 2025, Classe 1, nível B-R.";

export const FARMACOINVASIVA_PRECOCE =
  "Fibrinólise bem-sucedida: angiografia precoce entre 2 e 24 h, com intenção de ICP quando indicada — ACC/AHA/ACEP/NAEMSP/SCAI 2025, Classe 1, nível B-R.";
