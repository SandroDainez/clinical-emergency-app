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
const BR_MRS = "protocols/fontes-verbatim/mrs-br.md";
const SEG_DEF = "protocols/fontes-verbatim/seguranca-definicoes-operacionais.md";
const IMG_DEF = "protocols/fontes-verbatim/imagem-definicoes-operacionais.md";

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
  /**
   * ⚠️ DOIS SLOTS PARA UMA ESCALA, e ⛔ não um: o estudo de validação brasileiro
   * e a diretriz que publica os descritores respondem por coisas diferentes, e
   * ⛔ nenhum responde pela do outro (E-30, rastreabilidade por afirmação).
   */
  { id: "F-26", assunto: "mRS — validação brasileira e entrevista estruturada", estado: "transcrito", arquivo: BR_MRS },
  { id: "F-27", assunto: "mRS — descritores operacionais 0 a 6 em português", estado: "parcial", arquivo: BR_MRS },
  /**
   * ⚠️⚠️ DOIS SLOTS **ABERTOS**, e ⛔ não "parciais" — abertos em 2026-08-29 depois
   * do relato de uso da Superfície C: *"o usuário ⛔ não sabe classificar isso"*.
   *
   * ⚠️ `aberto` significa **⛔ nenhum texto transcrito**. Enquanto estiverem assim,
   * ⛔ nada do que eles sustentariam pode aparecer na tela (§0.5) — nem os 10
   * territórios do ASPECTS, ⛔ nem o esquema vetorial deles, ⛔ nem qualquer
   * critério de efeito de massa.
   *
   * ⚠️ **F-29 ⛔ não tem fonte candidata**: a lacuna é **da fonte-mãe**, que usa
   * *"significant mass effect"* em recomendação e ⛔ não define a medida.
   */
  { id: "F-28", assunto: "ASPECTS — territórios e pontuação", estado: "aberto", arquivo: IMG_DEF },
  { id: "F-29", assunto: "Efeito de massa significativo — definição operacional", estado: "aberto", arquivo: IMG_DEF },
  /**
   * ⚠️⚠️ **F-30 ⛔ NÃO TEM FONTE CANDIDATA**, e a lacuna é da fonte-mãe: ela usa
   * *"recent DOAC exposure (<48 hours)"* e ⛔ **não declara contra qual instante**
   * as 48 horas são medidas.
   *
   * ⛔ Enquanto aberto: ⛔ não calcular o intervalo, ⛔ não comparar com agora,
   * chegada, último-visto-bem, início dos sintomas ⛔ nem reconhecimento, e
   * ⛔ **não** transformar horário conhecido em "<48 h confirmado" (**E-52**).
   */
  { id: "F-30", assunto: "Marco temporal da exposição recente a DOAC", estado: "aberto", arquivo: SEG_DEF },
] as const;

export function slot(id: string): SlotDeFonte | undefined {
  return SLOTS.find((s) => s.id === id);
}
