export type EvidenceReference = {
  /** Referência humana curta, ex.: AHA/ASA 2026, bula ANVISA, DAS 2025. */
  reference: string;
  /** Versão/ano da fonte quando aplicável. */
  version?: string;
  /** Data em que esta recomendação foi conferida no app. */
  reviewedAt: string;
};

export type DrugPresentation = {
  label: string;
  concentration?: string;
  ampouleVolumeMl?: number;
  vialAmount?: string;
  /** Procedência da apresentação comercial, não necessariamente da dose clínica. */
  source: EvidenceReference;
};

export type DrugInstruction = {
  indicationId: string;
  indicationLabel: string;
  dose: string;
  route: string;
  dilution?: string;
  rate?: string;
  interval?: string;
  maximum?: string;
  criticalContraindication?: string;
  alternative?: string;
  /** Fonte clínica específica desta indicação/dose. */
  source: EvidenceReference;
  /** A terapia crítica precisa declarar o que acontece depois. */
  reassessmentId?: string;
};

export type CanonicalDrug = {
  id: string;
  genericName: string;
  aliases?: readonly string[];
  presentations: readonly DrugPresentation[];
  instructions: readonly DrugInstruction[];
};

/**
 * Contrato futuro da Drug Knowledge Base.
 *
 * Não substitui ainda `vasoactive-engine`, `sedation-engine` ou tabelas dos
 * protocolos. Primeiro cria uma forma única; a migração será fármaco a fármaco,
 * comparando o comportamento antigo com o novo antes de remover qualquer fonte.
 */
export type DrugKnowledgeBase = Readonly<Record<string, CanonicalDrug>>;
