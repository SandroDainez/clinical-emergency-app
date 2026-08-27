/**
 * Agrupamento temático dos módulos — usado para COBERTURA E VALIDAÇÃO, não
 * para desenhar a tela. `ids` lista todos os módulos do grupo.
 *
 * ── O `subIds` QUE EXISTIA, E O COMENTÁRIO QUE MENTIA (2026-08-17) ──────────
 *
 * Havia aqui um campo `subIds` com oito módulos ACLS, e este comentário dizia:
 *
 *     "Não usado atualmente: todos os módulos ACLS são exibidos como cards
 *      completos, iguais aos demais."
 *
 * ⚠️ ERA FALSO. O `module-hub.tsx` LIA o campo: filtrava os oito para fora dos
 * cards principais e os redesenhava DENTRO do card do PCR, sob um divisor
 * "MÓDULOS ACLS". O Engasgo (OVACE) — paciente CONSCIENTE, de pé, tossindo —
 * não era um módulo do hub; era uma linha dentro do card da parada.
 *
 * Duas lições, e a segunda é sobre este arquivo:
 *
 *   1. o comentário afirmava NÃO-EXECUÇÃO de código que executava. Comentário
 *      narra, não executa (R-15 item 13) — e aqui ele narrou o contrário do
 *      que o programa fazia. Quem lesse só o comentário concluiria que o
 *      aninhamento não existia, que foi exatamente o risco corrido nesta
 *      auditoria;
 *   2. o campo foi REMOVIDO, não esvaziado. Deixar `subIds: []` manteria vivo
 *      o caminho que redesenha sub-cards, esperando alguém repovoá-lo.
 */
export const MODULE_GROUPS: readonly {
  title: string;
  subtitle: string;
  ids: readonly string[];
}[] = [
  {
    title: "Reanimação",
    subtitle: "Parada cardiorrespiratória e ACLS",
    // ⚠️ A ORDEM DESTE ARRAY NÃO CHEGA A NENHUMA TELA — leia o cabeçalho deste
    // arquivo: ele existe para COBERTURA E VALIDAÇÃO.
    //
    // Eu reordenei este array em 2026-08-17 para pôr consulta depois de cenário, e
    // RELATEI como correção da queixa do autor. Estava errado: `module-hub.tsx`
    // ignora estes grupos e ordena os 31 módulos em UMA lista alfabética, com
    // `pcr-adulto` forçado à frente. A produção confirmou — Farmacologia aparece na
    // 5ª posição e Ritmos na 7ª, por F e por R.
    //
    // ⚠️ E O CABEÇALHO DESTE ARQUIVO JÁ DIZIA ISSO. Escrevi um comentário afirmando
    // que a ordem é lida pelo médico logo acima de um arquivo que declara não
    // desenhar tela. É o próprio R-85: a razão estava escrita, e eu agi sem ler.
    //
    // A ordem que o médico vê está em `module-hub.tsx`, e é lá que o critério
    // cenário-antes-de-consulta foi aplicado. Aqui a ordem é só legibilidade
    // humana — mantida na sequência do encontro por conveniência de leitura.
    ids: ["pcr-adulto", "bradicardia-acls", "taquicardia-acls", "causas-reversiveis-acls", "pcr-gestacao-acls", "ovace-adulto", "pos-pcr-acls", "ritmos-acls", "farmacologia-acls"],
  },
  {
    title: "Choque & hemodinâmica",
    subtitle: "Sepse e suporte vasoativo",
    ids: ["sepse-adulto", "drogas-vasoativas", "correcoes-eletroliticas"],
  },
  {
    title: "Via aérea & ventilação",
    subtitle: "ISR, VM, sedoanalgesia/BNM e edema agudo de pulmão",
    ids: ["isr-rapida", "ventilacao-mecanica", "sedoanalgesia", "edema-agudo-pulmao"],
  },
  {
    title: "Metabólico & alergia",
    subtitle: "CAD/EHH e anafilaxia",
    ids: ["cetoacidose-hiperosmolar", "anafilaxia"],
  },
  {
    title: "Neurologia aguda",
    subtitle: "AVC, reperfusão e neuroemergência",
    ids: ["avc"],
  },
  {
    title: "Cardiovascular & respiratório",
    subtitle: "Síndromes coronarianas e tromboembolia pulmonar",
    // ⚠️ A V2 APARECE AO LADO DA V1, e é o ponto: as duas convivem no hub para
    // serem comparadas no telefone. Registrar o módulo em `clinical-modules.ts`
    // dá a ROTA, não o card — o hub monta a partir daqui, e sem esta linha o
    // módulo existe e é inalcançável por toque (achado do autor, 2026-08-27:
    // "não estou vendo a modificação das telas").
    ids: ["sindromes-coronarianas", "sindromes-coronarianas-v2", "tep"],
  },
  {
    title: "Obstetrícia",
    subtitle: "Emergências hipertensivas da gestação",
    ids: ["pre-eclampsia"],
  },
  {
    title: "Calculadoras & escores",
    subtitle: "Peso predito, TFG, SOFA, Glasgow, Wells, HEART, NIHSS, RASS e mais",
    ids: ["calculadoras-clinicas"],
  },
  {
    title: "Politrauma & emergências",
    subtitle: "Trauma, TCE, convulsões, intoxicações, choque, insuficiência respiratória e abdome agudo",
    ids: [
      "politrauma",
      "tce",
      "crises-convulsivas",
      "intoxicacoes-exogenas",
      "choque",
      "insuficiencia-respiratoria",
      "abdome-agudo",
      "injuria-renal-aguda",
    ],
  },
] as const;

/** Em __DEV__, avisa se módulos e grupos deixarem de estar alinhados. */
export function assertModuleGroupsCoverage(moduleIds: readonly string[]): void {
  if (!__DEV__) return;
  const all = new Set(moduleIds);
  const inGroups = new Set(MODULE_GROUPS.flatMap((g) => [...g.ids]));
  for (const id of all) {
    if (!inGroups.has(id)) {
      console.warn(`[module-groups] Módulo sem grupo temático: ${id}`);
    }
  }
  for (const id of inGroups) {
    if (!all.has(id)) {
      console.warn(`[module-groups] Grupo referencia id inexistente: ${id}`);
    }
  }
}
