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

/**
 * ⚠️ Fonte do ramo **HIC** (hemorragia intracerebral espontânea). Enviada pelo
 * autor em 2026-09-05 e transcrita verbatim. ⛔ NÃO é a fonte-mãe — o módulo
 * nasceu do isquêmico; o hemorrágico tem fontes próprias, uma por síndrome.
 */
export const FONTE_HIC = {
  id: "aha_asa_hic_2022",
  citacao:
    "Greenberg SM, et al. 2022 Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage. Stroke. 2022;53:e282–e361.",
  doi: "10.1161/STR.0000000000000407",
  arquivo: "protocols/fontes-verbatim/aha-asa-2022-hic.md",
} as const;

/** ⚠️ Fonte do ramo **HSA** (hemorragia subaracnóidea aneurismática). */
export const FONTE_HSA = {
  id: "aha_asa_hsa_2023",
  citacao:
    "Hoh BL, et al. 2023 Guideline for the Management of Patients With Aneurysmal Subarachnoid Hemorrhage. Stroke. 2023;54:e314–e370.",
  doi: "10.1161/STR.0000000000000436",
  arquivo: "protocols/fontes-verbatim/aha-asa-2023-hsa.md",
} as const;

const AHA = FONTE_MAE.arquivo;
const HIC = FONTE_HIC.arquivo;
const HSA = FONTE_HSA.arquivo;
const BR_TROMBO = "protocols/fontes-verbatim/bulas-br-tromboliticos.md";
const BR_PA = "protocols/fontes-verbatim/fontes-br-anti-hipertensivos.md";
const BR_GLI = "protocols/fontes-verbatim/fontes-br-correcao-glicemica.md";
const BR_MRS = "protocols/fontes-verbatim/mrs-br.md";
const SEG_DEF = "protocols/fontes-verbatim/seguranca-definicoes-operacionais.md";
const IMG_DEF = "protocols/fontes-verbatim/imagem-definicoes-operacionais.md";
const ESICM_CHOQUE = "protocols/fontes-verbatim/esicm-2025-choque.md";
const CHOQUE_ABERTAS = "protocols/fontes-verbatim/choque-fontes-abertas.md";
const CPTW386 = "protocols/fontes-verbatim/einstein-cptw386-choque.md";
const ESICM_FLUIDOS = "protocols/fontes-verbatim/esicm-2024-fluidos-parte1.md";
const ACC_CARDIOGENICO = "protocols/fontes-verbatim/acc-2025-choque-cardiogenico.md";
const F35B_CONTRASTE = "protocols/fontes-verbatim/acr-aaaai-2025-contraste.md";
const F36_ANAFILAXIA = "protocols/fontes-verbatim/f36-anafilaxia-geral-contrato.md";
const F35C_TROMBOLISE = "protocols/fontes-verbatim/aha-asa-2017-hemorragia-pos-alteplase.md";

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
  /**
   * ⚠️ **TRANSCRITO** em 2026-09-06. ⚠️ Diferente de F-19, aqui ⛔ **não houve
   * correção de atribuição**: cada número da revisão do autor tem verbatim
   * correspondente na fonte-mãe — inclusive a **Classe 1** do déficit que
   * persiste ⛔ e o *"reasonable"* (COR 2a) do alvo 140–180.
   */
  { id: "F-18", assunto: "Correção glicêmica operacional", estado: "transcrito", arquivo: BR_GLI },
  /**
   * ⚠️ **TRANSCRITO** em 2026-09-06, a partir da revisão clínica do autor,
   * conferida contra a transcrição da AHA/ASA 2026 — ⛔ e com **cinco
   * correções de atribuição** registradas no arquivo da fonte.
   */
  { id: "F-19", assunto: "Anti-hipertensivo IV operacional", estado: "transcrito", arquivo: BR_PA },
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
  {
    id: "F-31",
    assunto: "Significado de \"not eligible for EVT\" / \"cannot receive EVT\"",
    estado: "aberto",
    arquivo: SEG_DEF,
  },

  /**
   * ⚠️⚠️ RAMO HIC — hemorragia intracerebral espontânea (AHA/ASA 2022).
   * Transcritos verbatim em 2026-09-05 · conferência clínica do autor pendente.
   * ⛔ Cada slot carrega COR/LOE por recomendação no arquivo-fonte.
   */
  { id: "H-01", assunto: "HIC · PA aguda — meta e alvo pressórico", estado: "transcrito", arquivo: HIC },
  { id: "H-02", assunto: "HIC · Reversão de anticoagulação por agente + doses", estado: "transcrito", arquivo: HIC },
  { id: "H-03", assunto: "HIC · Hemorragia associada a antiplaquetário", estado: "transcrito", arquivo: HIC },
  { id: "H-04", assunto: "HIC · Hemostáticos gerais (rFVIIa, TXA)", estado: "transcrito", arquivo: HIC },
  { id: "H-05", assunto: "HIC · Glicemia — monitorização e alvos", estado: "transcrito", arquivo: HIC },
  { id: "H-06", assunto: "HIC · Temperatura", estado: "transcrito", arquivo: HIC },
  { id: "H-07", assunto: "HIC · Convulsões e antiepilépticos", estado: "transcrito", arquivo: HIC },
  { id: "H-08", assunto: "HIC · PIC, osmoterapia, DVE, corticoide", estado: "transcrito", arquivo: HIC },
  { id: "H-09", assunto: "HIC · Tromboprofilaxia (TEV)", estado: "transcrito", arquivo: HIC },
  { id: "H-10", assunto: "HIC · Cirurgia supratentorial (MIS, craniotomia, craniectomia)", estado: "transcrito", arquivo: HIC },
  { id: "H-11", assunto: "HIC · Cirurgia cerebelar (≥15 mL, COR 1)", estado: "transcrito", arquivo: HIC },
  { id: "H-12", assunto: "HIC · Hemorragia intraventricular e DVE", estado: "transcrito", arquivo: HIC },
  { id: "H-13", assunto: "HIC · Local de cuidado e transferência", estado: "transcrito", arquivo: HIC },
  { id: "H-14", assunto: "HIC · Prevenção secundária (PA, antitrombóticos)", estado: "transcrito", arquivo: HIC },
  { id: "H-15", assunto: "HIC · Predição de desfecho e metas de cuidado", estado: "transcrito", arquivo: HIC },

  /**
   * ⚠️⚠️ RAMO HSA — hemorragia subaracnóidea aneurismática (AHA/ASA 2023).
   * Transcritos verbatim em 2026-09-05 · conferência clínica do autor pendente.
   */
  { id: "S-01", assunto: "HSA · Ressangramento (PA, reversão, antifibrinolítico)", estado: "transcrito", arquivo: HSA },
  { id: "S-02", assunto: "HSA · Tratamento do aneurisma (<24 h, modalidade)", estado: "transcrito", arquivo: HSA },
  { id: "S-03", assunto: "HSA · Vasoespasmo/DCI (nimodipino, euvolemia, resgate)", estado: "transcrito", arquivo: HSA },
  { id: "S-04", assunto: "HSA · Monitorização de vasoespasmo/DCI", estado: "transcrito", arquivo: HSA },
  { id: "S-05", assunto: "HSA · Hidrocefalia", estado: "transcrito", arquivo: HSA },
  { id: "S-06", assunto: "HSA · Convulsões (fenitoína COR 3: Harm)", estado: "transcrito", arquivo: HSA },
  { id: "S-07", assunto: "HSA · Complicações (volume, TEV, glicemia)", estado: "transcrito", arquivo: HSA },
  { id: "S-08", assunto: "HSA · Sistemas de cuidado e transferência", estado: "transcrito", arquivo: HSA },

  /**
   * ⚠️⚠️ RAMO C2 — CHOQUE na Estabilização do AVC.
   *
   * ⚠️ F-32 tem DOIS EIXOS DE ESTADO e eles não se substituem: fidelidade ao
   * PDF conferida em 2026-09-10; aplicabilidade ao AVC isquêmico PENDENTE, e
   * classificada passo a passo em `auditoria/MAPA-C2-CHOQUE.md`.
   * "Transcrito" aqui significa transcrito, e nunca "validado para o AVC".
   *
   * ⚠️ F-33 TRANSCRITO em 2026-09-10 do PDF do pathway CPTW386.1 — mesma
   * regra do F-32: transcrito não é validado para o AVC. O documento não cita
   * AVC isquêmico em nenhuma das 8 páginas.
   *
   * ⚠️ F-34 TRANSCRITO em 2026-09-10 (ESICM 2024, Parte 1). Mesma regra: o
   * documento NÃO menciona AVC em nenhuma das 19 páginas. Só as recs. 1, 7 e
   * 11 são de "adult critically ill patients in general"; as outras oito são
   * de população nomeada, e as duas de TCE INVERTEM a regra geral — R-TCE.
   *
   * ⚠️ F-35 é uma FAMÍLIA por mecanismo, e não um slot único. F-35a foi
   * TRANSCRITO em 2026-09-10 (ACC 2025) e traz FAIXAS DE DOSE — as primeiras
   * com procedência neste ramo. ⛔ NÃO traz esquema de titulação.
   *
   * ⚠️⚠️ O ACC 2025 ⛔ NÃO usa GRADE, ⛔ NÃO emite COR e ⛔ NÃO emite LOE: é
   * consenso de especialistas. E a população dele é AMI-CS/HF-CS HOSPITALIZADO
   * POR CAUSA DO CHOQUE — o oposto do paciente do C2, hospitalizado por AVC.
   *
   * ⚠️⚠️ CONTRATO DO PASSO 5, reescrito em 2026-09-10: ⛔ NÃO é "vasopressor
   * por mecanismo". É `mecanismo → intervenção causal prioritária → suporte
   * hemodinâmico adjuvante, se necessário → reavaliação`. Em tamponamento e
   * pneumotórax hipertensivo a intervenção é PROCEDIMENTO, e ⛔ não droga.
   *
   * ✅ F-35b TRANSCRITO em 2026-09-11 (ACR + AAAAI 2025). ⚠️ Força em esquema
   * PRÓPRIO do ACR, com duas linhas independentes — ⛔ não é GRADE nem COR/LOE.
   * ⛔ Contraste INTRA-ARTERIAL está fora do escopo declarado, e a trombectomia
   * é intra-arterial. Busca registrada: a palavra "stroke" aparece ZERO vezes.
   *
   * ⚠️ F-35c PARCIAL — transcrito em 2026-09-11 (AHA/ASA 2017), e parcial por
   * DUAS ressalvas: o agente é ALTEPLASE e o sítio é INTRACRANIANO. O documento
   * ⛔ não gradua nada: chama as próprias afirmações de "suggestions".
   *
   * ⛔ F-35d a F-35h seguem ABERTOS.
   *
   * ⛔ Choque neurogênico ⛔ NÃO tem slot: exige trauma raquimedular, que não é
   * via do AVC. E o portão do mecanismo vale para todos.
   */
  { id: "F-32", assunto: "Choque circulatório e monitorização hemodinâmica", estado: "transcrito", arquivo: ESICM_CHOQUE },
  { id: "F-33", assunto: "Choque no adulto — pathway operacional por mecanismo", estado: "transcrito", arquivo: CPTW386 },
  { id: "F-34", assunto: "Escolha do fluido de ressuscitação em adulto crítico", estado: "transcrito", arquivo: ESICM_FLUIDOS },
  { id: "F-35a", assunto: "Choque cardiogênico — agentes vasoativos e faixas de dose", estado: "transcrito", arquivo: ACC_CARDIOGENICO },
  { id: "F-35b", assunto: "Anafilaxia por contraste iodado — reconhecer e tratar", estado: "transcrito", arquivo: F35B_CONTRASTE },
  /**
   * ⚠️⚠️ F-36 ABERTO em 2026-09-11 — anafilaxia GERAL, e ⛔ não substitui o
   * F-35b. Entra SÓ onde a fonte específica do contraste é silente ou declara
   * fora de escopo: agente/dose/via do broncodilatador, reação leve e
   * moderada, alvo de oxigenação, regime de adrenalina EV, tipo e volume de
   * fluido, e reação a contraste INTRA-ARTERIAL (a trombectomia usa essa via).
   *
   * ⛔ Divergência entre fonte geral e fonte específica é ACHADO a registrar,
   * ⛔ e não escolha a fazer em silêncio. Contrato completo no arquivo.
   */
  { id: "F-36", assunto: "Anafilaxia geral — broncodilatador, adrenalina EV e volume", estado: "aberto", arquivo: F36_ANAFILAXIA },
  { id: "F-35c", assunto: "Hemorragia após trombólise ou anticoagulação", estado: "parcial", arquivo: F35C_TROMBOLISE },
  { id: "F-35d", assunto: "Tromboembolismo pulmonar com instabilidade", estado: "aberto", arquivo: CHOQUE_ABERTAS },
  { id: "F-35e", assunto: "Tamponamento cardíaco — drenagem", estado: "aberto", arquivo: CHOQUE_ABERTAS },
  { id: "F-35f", assunto: "Pneumotórax hipertensivo — descompressão", estado: "aberto", arquivo: CHOQUE_ABERTAS },
  { id: "F-35g", assunto: "Hipovolemia não hemorrágica", estado: "aberto", arquivo: CHOQUE_ABERTAS },
  { id: "F-35h", assunto: "Crise adrenal", estado: "aberto", arquivo: CHOQUE_ABERTAS },
] as const;

export function slot(id: string): SlotDeFonte | undefined {
  return SLOTS.find((s) => s.id === id);
}
