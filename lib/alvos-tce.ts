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
  /**
   * ⚠️ NÃO EXISTE `pas` AQUI, E É DE PROPÓSITO.
   *
   * Existia — `pas: "≥ 110 mmHg"`, liso, sem a estratificação por idade da BTF.
   * Ninguém o consumia, e era a D-1 conservada em formol: no dia em que alguém
   * consumisse, o defeito voltava inteiro por uma porta que a trava do
   * politrauma não vigia.
   *
   * A meta de PAS no TCE tem dono, e é `lib/pas-no-tce.ts` — texto e lógica
   * juntos, estratificados por idade. Quem precisar dela, importa de lá.
   */
  /** ACS TBI Best Practices 2024: alvo inicial de oxigenação. */
  spo2: "≥ 94%",
} as const;

// ⚠️ ALVOS_TCE_FONTE REMOVIDA (2026-08-17) — o módulo já mostra a
// procedência: "➜ ONDE BUSCAR: Brain Trauma Foundation — Guidelines…".
// Segunda redação da mesma atribuição, nunca consumida.

/**
 * As frases abaixo são LITERAIS, sem interpolação — de propósito.
 *
 * A varredura de tradução extrai literais e pula template literal com `${}`
 * (porque ele se compõe em runtime). Escrever estas frases com interpolação as
 * deixaria fora do dicionário: apareceriam em português no espanhol, sem que
 * nada acusasse.
 *
 * O preço seria perder o vínculo com ALVOS_TCE — e por isso `npm run test:vm`
 * confere que os números escritos aqui batem com os do objeto acima. Literal
 * com trava, em vez de interpolação sem tradução.
 *
 * ── ⚠️ E A ÁRVORE NÃO SEGUIU ESTA REGRA (D-35) ─────────────────────────────
 *
 * Este comentário existia e estava certo — e valia só para as três frases que
 * moravam AQUI. A árvore do TCE continuou compondo as linhas de METAS com
 * `${ALVOS_TCE...}`, e cinco delas chegavam em português ao usuário em
 * espanhol. Medido por execução: `tr(texto, "es-419")` devolvia o próprio
 * texto. O dicionário guardava as chaves antigas, com PaCO₂ 35–45 — o número
 * de antes da unificação —, prova de que eram traduzidas e a tradução se
 * perdeu em silêncio quando viraram interpolação.
 *
 * Por isso as linhas de metas da árvore passam a morar aqui, inteiras.
 */

/** A hipocapnia de resgate: indicação estreita, duração curta. */
export const TCE_HIPERVENTILACAO =
  "Hiperventilação (PaCO₂ 30–35 mmHg) SÓ como ponte para herniação iminente — anisocoria, postura de descerebração, tríade de Cushing — enquanto se prepara terapia hiperosmolar, drenagem ou neurocirurgia. Por MINUTOS, e revertida assim que a causa for tratada.";

/**
 * A hiperventilação de 3ª LINHA — que não é a mesma coisa que a ponte acima.
 *
 * ── O CONFLITO, E POR QUE ELE SE RESOLVE POR ROTULAGEM ─────────────────────
 *
 * O módulo trazia dois números de PaCO₂ para hiperventilação — 30–35 na ponte
 * da herniação e 25–34 na 3ª etapa da HIC refratária — sem dizer que são
 * coisas diferentes. E o 25–34 ATRAVESSA o piso que a literatura aberta
 * declara.
 *
 * O número NÃO foi alterado (R-5: ele vem do protocolo institucional que o
 * módulo cita, e esse protocolo não foi aberto em sessão). O que muda é a
 * rotulagem: a MONITORIZAÇÃO passa a ser CONDIÇÃO, não ressalva na linha
 * seguinte. Sem ela, o piso é 30.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-16) ──────────────────────────────────
 *
 *  · "Hyperventilation in Adult TBI Patients: How to Approach It?" (PMC7875871):
 *    hiperventilação controlada como terapia de "tiers 2", alvo "PaCO2 around
 *    33–36 mmHg and avoid values <30 mmHg"; "should never decrease below PaCO2
 *    values of 30 mmHg"; profilática "is not recommended and should not be
 *    used".
 *  · SIBICC (Hawryluk 2019, PubMed 31659383): algoritmo em três tiers, tier
 *    menor primeiro, com reavaliação de causas remediáveis entre tiers.
 *    ⚠️ Texto integral NÃO aberto — Springer e o pôster do globalneuro atrás
 *    de login. O que se usou daqui foi a ESTRUTURA em tiers, não números.
 */
export const TCE_HIPERVENTILACAO_TERCEIRA_LINHA =
  "HIPERVENTILAÇÃO NA HIC REFRATÁRIA — usar apenas como RESGATE, não como rotina. No algoritmo SIBICC, hiperventilação leve com PaCO₂ 32–35 mmHg é opção de tier 2; PaCO₂ 30–32 mmHg aparece apenas no tier 3 e, no algoritmo com monitorização de oxigênio cerebral, somente quando não há hipoxia tecidual cerebral. Evitar PaCO₂ <30 mmHg e NÃO usar PaCO₂ ≤25 mmHg de forma profilática ou prolongada. Reavaliar PIC, PPC e oxigenação cerebral quando disponível e reverter a hipocapnia assim que a medida de resgate deixar de ser necessária.";

/** A proibição COM o mecanismo do dano nomeado. Proibir sem explicar não gruda. */
export const TCE_HIPERVENTILACAO_PROIBIDA =
  "⚠️ Hiperventilação PROFILÁTICA é contraindicada. Ela baixa a PIC por vasoconstrição cerebral — ou seja, reduzindo o fluxo sanguíneo cerebral. Em cérebro já isquêmico isso converte penumbra em infarto. Não hiperventilar por precaução.";

/**
 * ⚠️ O CONFLITO COM O POLITRAUMA NÃO MORA MAIS AQUI.
 *
 * `TCE_VERSUS_POLITRAUMA` dizia "prevalece a meta do TCE, PAS ≥ 110 mmHg" —
 * o número liso outra vez, agora numa frase. Quem manda nessa frase é
 * `PAS_TCE_POR_QUE_NAO_VALE_A_PERMISSIVA`, em `lib/pas-no-tce.ts`, que diz a
 * mesma coisa sem fixar um valor único e junto de quem tem a estratificação.
 */

/* ── As linhas de METAS, que antes eram interpoladas na árvore ────────────── */

/** `estabilizacao` — a normocapnia, com o encaminhamento do porquê. */
export const TCE_NORMOCAPNIA =
  "Normocapnia: PaCO₂ 35–40 mmHg. NÃO hiperventilar profilaticamente — o porquê e a exceção da herniação vêm no passo de neuroproteção.";

/** `tce_grave` — o painel de metas. A PAS sai de lib/pas-no-tce.ts. */
export const TCE_METAS_NEUROPROTECAO =
  "Metas: PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos) · SpO₂ ≥ 94% (PaO₂ 80–100 mmHg como alvo inicial) · PaCO₂ 35–40 mmHg na ausência de HIC · normotermia · glicemia 100–180 mg/dL · Na 135–145 mEq/L como alvo basal; evitar hiponatremia e não induzir hipernatremia profilática.";

/** `tce_grave` — a conduta ventilatória, com o teto de PEEP na mesma linha. */
export const TCE_VENTILACAO =
  "Ventilação: Vt 6–8 mL/kg PBW com platô < 30 cmH₂O. PEEP 5–10 cmH₂O — até 15 cmH₂O SOMENTE em paciente estável, euvolêmico e com neuromonitorização — condição que raramente existe na emergência; sem isso, o alvo é 5–10.";

/** `tce_grave` — a indicação de monitorização da PIC com os dois alvos. */
export const TCE_MONITORIZACAO_PIC =
  "Monitorização da PIC se Glasgow ≤ 8 com TC alterada: manter PIC < 22 mmHg e PPC 60–70 mmHg (PPC = PAM − PIC).";

/** `uti` — as metas mantidas. */
export const TCE_METAS_UTI =
  "Metas mantidas: PIC < 22 mmHg; PPC 60–70 mmHg, individualizada pela autorregulação quando disponível; SpO₂ ≥ 94% e PaO₂ 80–100 mmHg como alvos iniciais; PaCO₂ 35–40 mmHg na ausência de HIC; PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos); normotermia; glicemia 100–180 mg/dL; Na 135–145 mEq/L como alvo basal.";

/** Onde a PPC é alvo de vasopressor — antes escrita à mão na árvore. */
export const TCE_PPC_COM_VASOPRESSOR =
  "Manter PPC 60–70 mmHg com vasopressor se necessário.";
