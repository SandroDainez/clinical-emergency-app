/** Rótulo curto por módulo (área clínica) — filtros, badges e catálogo. */
/**
 * ⚠️ A ETIQUETA DESCREVE O CENÁRIO, NÃO A ORIGEM DO CONTEÚDO.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ─────────────────────────────────────
 *
 * NOVE dos trinta módulos carregavam "ACLS", e as outras vinte e uma áreas
 * tinham um módulo cada — ou seja, "ACLS" não era uma área entre outras: era o
 * ÚNICO agrupamento que existia, e virou o depósito de tudo que toca parada.
 *
 * O custo apareceu no Engasgo (OVACE). Ele trata um paciente CONSCIENTE, de pé,
 * tossindo — e o card dizia "ACLS", que é o cenário em que aquele módulo
 * justamente NÃO serve. A etiqueta é o que o médico usa para decidir se aquele
 * módulo é o dele, e estava dizendo a coisa errada.
 *
 * ⚠️ E O PRÓPRIO APP JÁ DISCORDAVA DE SI: `module-hub.tsx` dá ao OVACE o glifo
 * "VA" (via aérea) enquanto a etiqueta dizia ACLS.
 *
 * ── O CRITÉRIO ──────────────────────────────────────────────────────────────
 *
 * A etiqueta responde "o que eu tenho na frente", na voz de quem chega:
 *
 *   PCR        · sem pulso, em RCP  (pcr-adulto, gestação, causas reversíveis)
 *   ARRITMIAS  · monitor com arritmia e paciente COM pulso  (bradi, taqui)
 *   PÓS-PCR    · depois do ROSC
 *   VIA AÉREA  · o OVACE — obstrução com paciente consciente
 *   CONSULTA   · "quero olhar uma tabela"  (ritmos, farmacologia)
 *
 * "Peri-parada" foi recusado por evocar a parada que se está tirando da leitura
 * de quem tem paciente com pulso; "Referência" foi recusado por dizer o que a
 * coisa É em vez do que a pessoa está FAZENDO.
 *
 * Na mesma varredura, "Cardiologia" destoava por ser ESPECIALIDADE e não
 * cenário — virou CORONARIANA.
 */
export const MODULE_AREA_LABELS: Record<string, string> = {
  "pcr-adulto": "PCR",
  "sepse-adulto": "Sepse",
  "drogas-vasoativas": "Vasoativos",
  "correcoes-eletroliticas": "Eletrólitos",
  "isr-rapida": "ISR",
  "edema-agudo-pulmao": "EAP",
  "cetoacidose-hiperosmolar": "CAD / EHH",
  "ventilacao-mecanica": "VM",
  sedoanalgesia: "Sedoanalgesia",
  anafilaxia: "Anafilaxia",
  avc: "AVC",
  "sindromes-coronarianas": "CORONARIANA",
  tep: "TEP",
  "pre-eclampsia": "PE / Eclâmpsia",
  "calculadoras-clinicas": "Calculadoras",
  politrauma: "Politrauma",
  tce: "TCE",
  "crises-convulsivas": "Convulsões",
  "intoxicacoes-exogenas": "Intoxicações",
  "abdome-agudo": "Abdome agudo",
  choque: "Choque",
  "insuficiencia-respiratoria": "Insuf. resp.",
  "ritmos-acls": "CONSULTA",
  "farmacologia-acls": "CONSULTA",
  "bradicardia-acls": "ARRITMIAS",
  "taquicardia-acls": "ARRITMIAS",
  "causas-reversiveis-acls": "PCR",
  "pcr-gestacao-acls": "PCR",
  "ovace-adulto": "VIA AÉREA",
  "pos-pcr-acls": "PÓS-PCR",
};

export function getModuleAreaLabel(moduleId: string): string {
  return MODULE_AREA_LABELS[moduleId] ?? "Módulo";
}

/** Largura mínima (px) para grelha em duas colunas nos cartões de módulo. */
export const MODULE_GRID_TWO_COL_MIN = 400;

export { assertModuleGroupsCoverage, MODULE_GROUPS } from "./module-groups";
