/**
 * Metas do cuidado pós-parada — fonte única das duas superfícies.
 *
 * ── POR QUE ESTE ARQUIVO EXISTE ─────────────────────────────────────────────
 *
 * Os mesmos alvos viviam em DOIS lugares, escritos separadamente:
 *
 *  · `protocol.json`, nos seis estados `pos_rosc_*` — a superfície de AÇÃO, o
 *    fluxo guiado dentro do caso, com áudio ("P A M de pelo menos 65
 *    milímetros de mercúrio", "saturação entre 90 e 98 por cento").
 *  · O módulo Pós-PCR — a superfície de CONSULTA, com o que o fluxo não tem
 *    (volume corrente, PEEP, vasopressores, prognóstico às 72 h).
 *
 * Os números CONCORDAVAM. Concordar hoje é o estado ANTES da divergência, não
 * a ausência dela — foi exatamente assim que a dopamina e o magnésio começaram.
 *
 * O JSON não pode importar: quem injeta as metas nos estados do fluxo é o
 * motor, no mesmo mecanismo já usado por `ACOES_NA_PARADA` nas causas
 * reversíveis.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · PulmCCM — "Post-Cardiac Arrest: 2025 Guideline Update": AHA MAP ≥ 65;
 *    SpO₂ 90–98% ou PaO₂ 60–105 mmHg com O₂ a 100% até estabilizar; controle
 *    de temperatura ativo ≤ 37,5 °C; o alvo de PAM > 80 do documento conjunto
 *    AHA/Neurocritical Care Society 2023 NÃO é endossado em 2025.
 *  · PulmCrit — "2025 AHA & ESICM guidelines on post-arrest care": "The concept
 *    of targeting a higher MAP (e.g., >75 or >80 mm) wasn't supported by
 *    evidence"; ESICM normocapnia pCO₂ 35–45.
 *  · AHA Part 8 — Post–Cardiac Arrest Care, 2015 Update (PMC4959439): "The
 *    benefit of any specific target range of glucose management is uncertain in
 *    adults with ROSC after cardiac arrest (Class IIb, LOE B-R)".
 *  · Temperatura 32–37,5 °C por ≥ 36 h e prevenção de febre ≤ 37,5 °C por
 *    ≥ 72 h: AHA 2025, Part 11.
 *  · ⚠️ O texto integral no ahajournals devolveu HTTP 403 em todas as
 *    tentativas. Declarado aqui em vez de atribuído de memória (R-5).
 */

export const META_OXIGENACAO =
  "OXIGENAÇÃO — O₂ a 100% até estabilizar e conseguir medir com confiança; depois titular para SpO₂ 90–98% (ou PaO₂ 60–105 mmHg). Evitar hiperóxia E hipoxemia: as duas pioram o desfecho neurológico.";

export const META_VENTILACAO =
  "VENTILAÇÃO — PaCO₂ 35–45 mmHg (normocapnia). ⚠️ Hiperventilar é a armadilha mais comum do pós-PCR: baixa a PaCO₂, causa vasoconstrição cerebral e piora o prognóstico do órgão que se está tentando salvar.";

/**
 * O "80" fica, e fica com a história inteira — R-45.
 *
 * A ideia circula: foi recomendação de documento conjunto AHA/Neurocritical
 * Care Society em 2023. Silêncio não a apaga — quem já a ouviu aplicaria
 * achando que o app apenas não mencionou. Escrever que foi proposta e não
 * endossada ENSINA; omitir deixa a prática antiga vencer por ausência.
 *
 * Mesmo mecanismo do "choca na dúvida" da FV fina.
 */
export const META_PRESSAO =
  "PRESSÃO — PAM ≥ 65 mmHg e PAS ≥ 90 mmHg. Hipotensão pós-ROSC é preditor independente de morte. ⚠️ SOBRE O ALVO DE PAM ≥ 80: foi proposto em documento conjunto AHA/Neurocritical Care Society de 2023 e as diretrizes de 2025 NÃO o endossaram — não há evidência de benefício em mirar mais alto. Se você ouviu falar nele, é isto: proposto, não confirmado. O alvo é 65.";

/**
 * ⚠️ 36 h e 72 h são CUIDADOS DIFERENTES, e o texto precisa dizer isso.
 *
 * Lido como "manter tudo por 72 h" — que é a leitura natural de dois prazos
 * lado a lado — vira outra coisa, e não é o que a fonte diz. O que termina às
 * 36 h é o CONTROLE ATIVO com dispositivo; o que continua até 72 h é NÃO DEIXAR
 * SUBIR.
 */
export const META_TEMPERATURA =
  "TEMPERATURA — se não segue comandos após o ROSC: CONTROLE ATIVO em 32–37,5 °C por pelo menos 36 h, com dispositivo e temperatura central contínua. DEPOIS das 36 h, o cuidado MUDA: não é manter o controle ativo, é PREVENIR FEBRE — manter ≤ 37,5 °C até completar pelo menos 72 h. Hipotermia induzida de rotina deixou de ser preferida em 2025; o que se busca é normotermia controlada.";

/**
 * 37,5 e não 37,7 — e a razão vai escrita porque sem ela alguém arredonda
 * de volta.
 *
 * O 37,7 que estava aqui abria uma janela de 0,2 °C em que o app declarava
 * "não é febre" enquanto a meta que ele mesmo enuncia duas linhas acima
 * (32–37,5 °C) já estava estourada. O app contradizia a própria meta.
 *
 * E o 37,5 já é o padrão do app: a árvore de AVC usa `normotermia (≤ 37,5)`
 * em cinco lugares. O Pós-PCR era o divergente.
 */
export const META_FEBRE =
  "FEBRE — o limiar é 37,5 °C, o MESMO teto da faixa de controle: acima disso já não se está cumprindo a meta declarada. Monitorar temperatura central continuamente e tratar ativamente, não observar.";

/**
 * A INCERTEZA É CONTEÚDO CLÍNICO, não justificativa interna.
 *
 * Saber que a AHA registra o benefício de uma faixa-alvo como incerto muda a
 * conduta à beira do leito: impede que alguém trate 175 mg/dL como problema a
 * corrigir agressivamente, e impede a busca de um alvo apertado que a própria
 * fonte desaconselha.
 *
 * O 80–110 é o único número DURO que a fonte dá — e é uma proibição.
 */
export const META_GLICEMIA =
  "GLICEMIA — faixa-alvo 140–180 mg/dL. ⚠️ NÃO existe alvo pós-parada próprio: a AHA registra que o benefício de qualquer faixa-alvo específica é INCERTO (Classe IIb) — aplica-se aqui a meta geral de terapia intensiva. Isso tem consequência prática: 175 mg/dL não é problema a corrigir com agressividade. ⚠️ O que a fonte PROÍBE é o controle estrito de 80–110 mg/dL, pelo risco de hipoglicemia iatrogênica. Dentro da faixa, o piso importa: hipoglicemia (< 70 mg/dL) é tão lesiva quanto hiperglicemia, e o limite inferior não é um segundo alvo — é o chão.";

export const META_PROGNOSTICO =
  "PROGNÓSTICO NEUROLÓGICO — não concluir antes de 72 h após a normotermia, e nunca por um exame isolado. Sedação e bloqueio neuromuscular residuais invalidam o exame clínico; avaliar responsividade só depois que saírem.";

/**
 * As metas indexadas pelo id do estado em `protocol.json`, para o motor
 * injetar no fluxo pós-ROSC — o mesmo desenho de `ACOES_NA_PARADA`.
 *
 * A chave é o id do estado, e não a posição: reordenar o fluxo não pode trocar
 * a meta de dois estados.
 */
export const METAS_POR_ESTADO_POS_ROSC: Record<string, string[]> = {
  pos_rosc_via_aerea: [META_OXIGENACAO, META_VENTILACAO],
  pos_rosc_hemodinamica: [META_PRESSAO, META_GLICEMIA],
  pos_rosc_neurologico: [META_TEMPERATURA, META_FEBRE, META_PROGNOSTICO],
};
