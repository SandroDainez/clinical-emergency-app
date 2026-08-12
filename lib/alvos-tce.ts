/**
 * Alvos do TCE grave — a fonte única, criada ANTES da divergência existir.
 *
 * ── POR QUE ESTE ARQUIVO NASCE ASSIM ─────────────────────────────────────────
 *
 * O peso predito precisou de fonte única DEPOIS de três implementações
 * discordarem em produção — uma delas trocando o sexo do paciente entre
 * módulos. Aqui os alvos do TCE já viviam em dois lugares (a árvore do TCE e o
 * card de configuração da VM) e estavam prestes a nascer num terceiro (o
 * cenário do motor). Em vez de esperar a divergência, ela é impedida.
 *
 * PaCO₂ já divergia: a árvore dizia 35–45 e o card 35–40.
 *
 * ── AS FONTES ────────────────────────────────────────────────────────────────
 *
 * PIC e PPC: Brain Trauma Foundation, Guidelines for the Management of Severe
 * TBI, 4ª edição (2016), ambos Nível IIB. NÃO existe 5ª edição — a BTF passou a
 * um modelo de *living guidelines*, com uma atualização em 2020 restrita a
 * craniectomia descompressiva. Anunciou em 2024 intenção de publicar a 5ª;
 * até aqui, não publicada.
 *
 * Ventilação: Robba C, et al. Mechanical ventilation in patients with acute
 * brain injury: recommendations of the European Society of Intensive Care
 * Medicine consensus. Intensive Care Med. 2020. A BTF é forte em PIC/PPC e
 * econômica em parâmetro ventilatório — daí a segunda fonte, específica.
 *
 * ── POR QUE SÓ TCE, E NÃO "NEURO" ────────────────────────────────────────────
 *
 * AVC e HSA têm alvos hemodinâmicos PRÓPRIOS, que vivem nos módulos deles — a
 * HSA ainda tem vasoespasmo, com manejo que não é intercambiável. A fisiologia
 * se parece; o manejo não. Um cenário "neuro" compartilhado é exatamente a
 * estrutura que produz divergência silenciosa, e por isso o nome aqui é TCE,
 * explícito, para ninguém reaproveitar por analogia.
 */

export const ALVOS_TCE = {
  /** PaCO₂ de normocapnia. Robba/ESICM 2020. */
  paco2: "35–40 mmHg",
  /**
   * Hipocapnia de RESGATE — transitória, com indicação estreita.
   * Robba/ESICM 2020: reverter prontamente; hipocapnia prolongada é
   * contraindicada por isquemia onde a autorregulação está comprometida.
   */
  paco2Resgate: "30–35 mmHg",
  /** Volume corrente. Pplat manda mais que o número. */
  vt: "6–8 mL/kg PBW",
  platô: "< 30 cmH₂O",
  /**
   * PEEP.
   *
   * ⚠️ O TETO VAI NA MESMA LINHA DO NÚMERO, de propósito. A fonte admite até
   * 15 cmH₂O em paciente estável e euvolêmico COM NEUROMONITORIZAÇÃO — condição
   * que quase nunca existe na emergência. Deixar o "até 15" numa nota de rodapé
   * faria alguém ler o teto e usar o teto.
   */
  peep: "5–10 cmH₂O",
  peepTeto:
    "até 15 cmH₂O SOMENTE em paciente estável, euvolêmico e com neuromonitorização — condição que raramente existe na emergência; sem isso, o alvo é 5–10.",
  /** BTF 2016, Nível IIB. */
  pic: "< 22 mmHg",
  ppc: "60–70 mmHg",
  pas: "≥ 110 mmHg",
  spo2: "≥ 90%",
} as const;

export const ALVOS_TCE_FONTE =
  "Brain Trauma Foundation, 4ª ed. (2016), Nível IIB (PIC/PPC) · Robba C, et al. ESICM consensus, Intensive Care Med 2020 (ventilação).";

/**
 * As três frases abaixo são LITERAIS, sem interpolação — de propósito.
 *
 * A varredura de tradução extrai literais e pula template literal com `${}`
 * (porque ele se compõe em runtime). Escrever estas frases com interpolação as
 * deixaria fora do dicionário: apareceriam em português no espanhol, sem que
 * nada acusasse.
 *
 * O preço seria perder o vínculo com ALVOS_TCE — e por isso `npm run test:vm`
 * confere que os números escritos aqui batem com os do objeto acima. Literal
 * com trava, em vez de interpolação sem tradução.
 */

/** A hipocapnia de resgate: indicação estreita, duração curta. */
export const TCE_HIPERVENTILACAO =
  "Hiperventilação (PaCO₂ 30–35 mmHg) SÓ como ponte para herniação iminente — anisocoria, postura de descerebração, tríade de Cushing — enquanto se prepara terapia hiperosmolar, drenagem ou neurocirurgia. Por MINUTOS, e revertida assim que a causa for tratada.";

/** A proibição COM o mecanismo do dano nomeado. Proibir sem explicar não gruda. */
export const TCE_HIPERVENTILACAO_PROIBIDA =
  "⚠️ Hiperventilação PROFILÁTICA é contraindicada. Ela baixa a PIC por vasoconstrição cerebral — ou seja, reduzindo o fluxo sanguíneo cerebral. Em cérebro já isquêmico isso converte penumbra em infarto. Não hiperventilar por precaução.";

/** O conflito com o politrauma, do lado do TCE. */
export const TCE_VERSUS_POLITRAUMA =
  "Politraumatizado COM TCE: a hipotensão permissiva do controle de danos (PAS ~80–90) NÃO se aplica — prevalece a meta do TCE, PAS ≥ 110 mmHg. Um episódio de hipotensão piora o desfecho do TCE, e o cérebro não tem como esperar a hemostasia.";
