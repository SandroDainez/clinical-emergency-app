/**
 * Nome canônico de cada módulo clínico, e os apelidos que ele tem por aí.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O problema que isto resolve
 *
 * O mesmo protocolo aparece hoje com até TRÊS grafias diferentes, conforme a
 * camada onde se olha:
 *
 *  - rota e registro de módulos: `pcr-adulto`, `sepse-adulto`, `avc`
 *  - nome de arquivo:            `sepsis-engine.ts`, `anaphylaxis-decision-tree.ts`
 *  - metadados de diretriz:      `pcr_adulto`, `sepsis_primeiro_atendimento`
 *
 * Enquanto for assim, qualquer verificação que compare módulos vê `sepse` e
 * `sepsis` como coisas distintas — e a auditoria de consistência (Camada 3) existe
 * justamente para descobrir que dois lugares falam do MESMO protocolo com números
 * diferentes. Sem este mapa ela não tem como saber que são o mesmo.
 *
 * ## Por que um mapa e não renomear os arquivos
 *
 * Renomear 40 arquivos e ajustar seus imports é mudança grande, arriscada e que o
 * plano de auditoria pede para não fazer sem autorização ("não mova arquivos sem
 * autorização"). O mapa dá o mesmo ganho — saber que são o mesmo módulo — sem
 * tocar em uma linha de conteúdo clínico. Se um dia a renomeação vier, este arquivo
 * é o roteiro dela.
 *
 * ## O id canônico é o do registro de módulos
 *
 * `clinical-modules.ts` é o que a aplicação usa para rotear. Adotar outra chave
 * criaria uma QUARTA convenção, que é exatamente o problema.
 */

export type ModuloCanonico = {
  /** Id do registro em `clinical-modules.ts` — a chave de rota do app. */
  id: string;
  /** Nome para leitura humana em relatórios. */
  rotulo: string;
  /**
   * Toda grafia já vista para este módulo: nome de arquivo, pasta de domínio,
   * chave em `guidelines_metadata.json`, prefixo de engine.
   */
  apelidos: string[];
};

export const MODULOS_CANONICOS: ModuloCanonico[] = [
  {
    id: "pcr-adulto",
    rotulo: "PCR no adulto (ACLS)",
    apelidos: ["pcr_adulto", "pcr", "acls", "acls-protocol", "protocol", "engine", "acls_protocol"],
  },
  {
    // Antimicrobianos entram aqui como apelidos, e não como módulo separado: o
    // protocolo de antibiótico é parte do atendimento da sepse e não tem rota
    // própria em clinical-modules.ts. Duas entradas com o mesmo id fariam o rótulo
    // sair errado, porque a busca devolve a primeira.
    id: "sepse-adulto",
    rotulo: "Sepse, choque séptico e antimicrobianos",
    apelidos: [
      "sepse", "sepsis", "sepse-adulto", "sepsis_primeiro_atendimento", "sepsis_uti_piora",
      "sepse_adulto", "sepsis-decision-tree",
      "sepse-antimicrobianos", "sepsis-antibiotic", "sepse_antimicrobianos",
      "antimicrobials_protocol",
    ],
  },
  { id: "drogas-vasoativas", rotulo: "Drogas vasoativas", apelidos: ["vasoactive", "drogas_vasoativas"] },
  {
    id: "correcoes-eletroliticas",
    rotulo: "Correções eletrolíticas",
    apelidos: ["electrolyte", "correcoes_eletroliticas", "correcoes-eletroliticas"],
  },
  { id: "isr-rapida", rotulo: "Intubação em sequência rápida", apelidos: ["rsi", "isr", "isr_rapida"] },
  { id: "edema-agudo-pulmao", rotulo: "Edema agudo de pulmão", apelidos: ["eap", "edema_agudo_pulmao"] },
  {
    id: "cetoacidose-hiperosmolar",
    rotulo: "Cetoacidose diabética e estado hiperosmolar",
    apelidos: ["dka", "dka-hhs", "cad", "cetoacidose_hiperosmolar"],
  },
  {
    id: "ventilacao-mecanica",
    rotulo: "Ventilação mecânica",
    apelidos: ["ventilation", "ventilacao_mecanica", "ventilacao-mecanica", "ventilacao"],
  },
  { id: "anafilaxia", rotulo: "Anafilaxia", apelidos: ["anaphylaxis", "anafilaxia"] },
  {
    id: "avc",
    rotulo: "Acidente vascular cerebral",
    apelidos: ["acidente-vascular-cerebral", "acidente_vascular_cerebral", "stroke"],
  },
  {
    id: "sindromes-coronarianas",
    rotulo: "Síndromes coronarianas agudas",
    apelidos: ["coronary", "coronary-syndromes", "sindromes_coronarianas", "coronaria"],
  },
  { id: "ritmos-acls", rotulo: "Ritmos de parada", apelidos: ["acls-rhythms", "ritmos_acls"] },
  { id: "farmacologia-acls", rotulo: "Farmacologia do ACLS", apelidos: ["acls-pharmacology", "farmacologia_acls"] },
  { id: "bradicardia-acls", rotulo: "Bradicardia", apelidos: ["acls-bradycardia", "bradycardia", "bradicardia_acls"] },
  { id: "taquicardia-acls", rotulo: "Taquicardia", apelidos: ["acls-tachycardia", "tachycardia", "taquicardia_acls"] },
  {
    id: "causas-reversiveis-acls",
    rotulo: "Causas reversíveis",
    apelidos: ["acls-reversible-causes", "causas_reversiveis_acls"],
  },
  { id: "pos-pcr-acls", rotulo: "Cuidados pós-PCR", apelidos: ["acls-post-rosc", "pos_pcr_acls"] },
  { id: "tep", rotulo: "Tromboembolia pulmonar", apelidos: ["tep"] },
  { id: "pre-eclampsia", rotulo: "Pré-eclâmpsia e eclâmpsia", apelidos: ["eclampsia", "pre_eclampsia"] },
  { id: "sedoanalgesia", rotulo: "Sedoanalgesia", apelidos: ["sedation", "sedoanalgesia"] },
  {
    id: "calculadoras-clinicas",
    rotulo: "Calculadoras clínicas",
    apelidos: ["clinical-calculators", "calculadoras", "calculadoras_clinicas"],
  },
  { id: "politrauma", rotulo: "Politrauma", apelidos: ["politrauma", "trauma"] },
  { id: "tce", rotulo: "Traumatismo cranioencefálico", apelidos: ["tce"] },
  { id: "crises-convulsivas", rotulo: "Crises convulsivas", apelidos: ["seizure", "crises_convulsivas"] },
  {
    id: "intoxicacoes-exogenas",
    rotulo: "Intoxicações exógenas",
    apelidos: ["poisoning", "intoxicacoes_exogenas", "intoxicacoes"],
  },
  { id: "choque", rotulo: "Choque", apelidos: ["shock"] },
  {
    id: "insuficiencia-respiratoria",
    rotulo: "Insuficiência respiratória",
    apelidos: ["dyspnea", "insuficiencia_respiratoria", "dispneia"],
  },
  { id: "abdome-agudo", rotulo: "Abdome agudo", apelidos: ["acute-abdomen", "abdome_agudo"] },
];

/** apelido (normalizado) → id canônico */
const INDICE = new Map<string, string>();
for (const m of MODULOS_CANONICOS) {
  INDICE.set(normalizar(m.id), m.id);
  for (const apelido of m.apelidos) INDICE.set(normalizar(apelido), m.id);
}

function normalizar(valor: string): string {
  return String(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    // Sufixos de nome de ARQUIVO, não do módulo: `sepsis-flow-screen.tsx` e
    // `avc-flow-screen.tsx` descrevem a tela, e o módulo é sepse e avc. Tratar o
    // sufixo aqui evita dez apelidos repetindo a mesma regra.
    .replace(/-(flow|screen|tree|engine|decision-tree)$/, "");
}

/**
 * Id canônico de qualquer grafia conhecida, ou `undefined`.
 *
 * Devolver `undefined` em vez de chutar é proposital: um módulo que não está no
 * mapa precisa APARECER como não mapeado no relatório, não ser silenciosamente
 * agrupado no lugar errado.
 */
export function idCanonicoDeModulo(valor: string | undefined): string | undefined {
  if (!valor) return undefined;
  return INDICE.get(normalizar(valor));
}

/** Rótulo legível a partir de qualquer grafia. */
export function rotuloDeModulo(valor: string | undefined): string | undefined {
  const id = idCanonicoDeModulo(valor);
  return id ? MODULOS_CANONICOS.find((m) => m.id === id)?.rotulo : undefined;
}
