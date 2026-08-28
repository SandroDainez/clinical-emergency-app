/**
 * Q-02 · REGISTRO DE FONTES DO MÓDULO AVC.
 *
 * ⚠️ A tela ⛔ NÃO é fonte primária de nada (E-29). Toda afirmação clínica que
 * aparecer no AVC aponta para um slot deste registro, e o slot aponta para o
 * verbatim (E-30: a menor unidade auditável é a afirmação).
 *
 * ⚠️ ESQUELETO: o registro existe e está ligado; ⛔ nenhuma regra clínica o
 * consome ainda.
 */

export type EstadoDoSlot = "transcrito" | "parcial" | "aberto" | "ponteiro";

export type SlotDeFonte = {
  readonly id: string;
  readonly assunto: string;
  readonly estado: EstadoDoSlot;
  /** Onde mora o verbatim. ⛔ Referência bibliográfica não é fonte; texto é. */
  readonly arquivo: string;
};

/** Fonte-mãe do módulo (§0.5). */
export const FONTE_MAE = {
  id: "aha_asa_avc_isquemico_2026",
  citacao:
    "Prabhakaran S, et al. 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke. Stroke. 2026;57:e316–e436.",
  doi: "10.1161/STR.0000000000000513",
  arquivo: "protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md",
} as const;

const AHA = FONTE_MAE.arquivo;
const BR_TROMBO = "protocols/fontes-verbatim/bulas-br-tromboliticos.md";
const BR_PA = "protocols/fontes-verbatim/fontes-br-anti-hipertensivos.md";
const BR_GLI = "protocols/fontes-verbatim/fontes-br-correcao-glicemica.md";

export const SLOTS: readonly SlotDeFonte[] = [
  { id: "F-02", assunto: "Janela para trombólise IV", estado: "transcrito", arquivo: AHA },
  { id: "F-03", assunto: "Janela estendida e imagem avançada", estado: "transcrito", arquivo: AHA },
  { id: "F-04", assunto: "Meta pressórica antes e depois da IVT", estado: "transcrito", arquivo: AHA },
  { id: "F-05", assunto: "Conduta pressórica sem reperfusão", estado: "transcrito", arquivo: AHA },
  { id: "F-06", assunto: "Glicemia: corte e alvo", estado: "transcrito", arquivo: AHA },
  { id: "F-07", assunto: "Contraindicações à IVT", estado: "transcrito", arquivo: AHA },
  { id: "F-08", assunto: "Elegibilidade para trombectomia", estado: "transcrito", arquivo: AHA },
  { id: "F-09", assunto: "Trombolítico e dose por peso", estado: "transcrito", arquivo: AHA },
  { id: "F-10", assunto: "Anticoagulante prévio e exames", estado: "transcrito", arquivo: AHA },
  { id: "F-11", assunto: "Tempos-alvo porta-imagem", estado: "transcrito", arquivo: AHA },
  { id: "F-13", assunto: "Critério de suspeita intra-hospitalar", estado: "transcrito", arquivo: AHA },
  { id: "F-14", assunto: "mRS prévio", estado: "transcrito", arquivo: AHA },
  { id: "F-15", assunto: "Manejo inicial pós-reperfusão", estado: "transcrito", arquivo: AHA },
  { id: "F-16", assunto: "Imagem: qual exame e o que decide", estado: "transcrito", arquivo: AHA },
  { id: "F-17", assunto: "Déficit incapacitante", estado: "transcrito", arquivo: AHA },
  { id: "F-23", assunto: "Via aérea, ventilação e oxigenação", estado: "transcrito", arquivo: AHA },
  { id: "F-24", assunto: "Crise convulsiva no AVC", estado: "transcrito", arquivo: AHA },
  { id: "F-18", assunto: "Correção glicêmica operacional", estado: "parcial", arquivo: BR_GLI },
  { id: "F-19", assunto: "Anti-hipertensivo IV operacional", estado: "parcial", arquivo: BR_PA },
  { id: "F-20", assunto: "Preparo do trombolítico", estado: "parcial", arquivo: BR_TROMBO },
  { id: "F-25", assunto: "Terapêutica anticonvulsiva", estado: "ponteiro", arquivo: AHA },
] as const;

export function slot(id: string): SlotDeFonte | undefined {
  return SLOTS.find((s) => s.id === id);
}
