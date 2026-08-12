/**
 * Doses de indução da ISR — fonte única.
 *
 * ── A DIVERGÊNCIA QUE ORIGINOU ESTE ARQUIVO ──────────────────────────────────
 *
 * Os dois módulos diziam coisas opostas sobre o MESMO paciente:
 *
 *   ISR            instável 1 mg/kg · choque grave 0,5 mg/kg   → REDUZIR
 *   Sedoanalgesia  "ISR (paciente instável): 1,5–2 mg/kg"      → dose PLENA
 *
 * O rótulo da Sedoanalgesia apontava a faixa cheia de indução como se fosse a
 * do instável. Um manda reduzir, o outro manda dar tudo — e é o mesmo paciente,
 * no mesmo app, com um clique de distância.
 *
 * A prática recomendada é REDUZIR o indutor em pelo menos 50% no choque (índice
 * de choque elevado). A evidência é reconhecidamente limitada — dose plena de
 * cetamina se associou à maior taxa de hipotensão pós-intubação —, e por isso a
 * redução vem com o motivo escrito, não como número solto.
 *
 * ── A REGRA QUE IMPORTA MAIS QUE O NÚMERO ────────────────────────────────────
 *
 * Reduzir o INDUTOR e manter o BLOQUEADOR. Reduzir o bloqueador junto produz
 * relaxamento insuficiente, laringoscopia difícil e mais tentativas — que é o
 * oposto do que se quer em quem já está no limite.
 */

export const DOSES_ISR = {
  cetamina: {
    estavel: "1,5 mg/kg",
    instavel: "1 mg/kg",
    choqueGrave: "0,5 mg/kg",
    asma: "2 mg/kg",
  },
  etomidato: {
    /** Hemodinamicamente neutro — não se reduz no choque. */
    todos: "0,3 mg/kg",
  },
  propofol: {
    estavel: "1,5–2 mg/kg",
    idoso: "1 mg/kg",
    /** Hipotensão dose-dependente. */
    instavel: "evitar",
  },
  midazolam: {
    instavel: "evitar",
  },
  succinilcolina: "1–1,5 mg/kg (2 mg/kg em obeso; máx 200 mg)",
  rocuronio: "1,2 mg/kg",
  sugamadex: "16 mg/kg",
} as const;

/**
 * A regra do ajuste no instável, em uma frase.
 *
 * Literal, sem interpolação: a varredura de tradução pula template com `${}` e
 * a frase apareceria em português no espanhol. `npm run test:isr` confere que
 * os números aqui batem com DOSES_ISR.
 */
export const ISR_AJUSTE_NO_INSTAVEL =
  "No instável, REDUZIR o indutor e MANTER o bloqueador. Cetamina 1 mg/kg (0,5 mg/kg no choque grave) em vez de 1,5; etomidato segue 0,3 mg/kg, que é hemodinamicamente neutro; evitar propofol e midazolam. Reduzir o bloqueador junto daria relaxamento insuficiente e mais tentativas — exatamente o que quem está no limite não tolera.";

/**
 * ── BLOQUEADOR NA ANAFILAXIA E NO ANGIOEDEMA ─────────────────────────────────
 *
 * Vive aqui, e não em cada módulo, porque a regra vale nos DOIS (ISR e
 * Anafilaxia) e regra clínica em dois lugares diverge — foi o que aconteceu com
 * a dose de cetamina logo acima, e com o peso predito antes dela (R-12).
 *
 * A Anafilaxia mandava evitar succinilcolina e usar rocurônio em angioedema
 * extenso. A lógica se inverte quando se olha o risco: em possível CICO, o
 * rocurônio 1,2 mg/kg compromete 45–70 minutos.
 *
 * ⚠️ A RAZÃO CERTA, e não a que soa melhor. O argumento comum — "com
 * succinilcolina dá para acordar o paciente" — é fraco NESTA população: com a
 * reserva de oxigênio já consumida, a dessaturação crítica costuma chegar antes
 * do retorno da ventilação espontânea adequada. O que sustenta a escolha é
 * outra coisa: o rocurônio compromete 45–70 min e o resgate depende de o
 * sugamadex estar disponível, dentro do prazo, e de alguém ir buscá-lo — três
 * condições que falham justamente sob pressão.
 */
export const ANAFILAXIA_BLOQUEADOR =
  "SUCCINILCOLINA é a escolha padrão na anafilaxia/angioedema de via aérea. O rocurônio 1,2 mg/kg compromete 45–70 min, e o resgate com sugamadex depende de ele estar disponível, dentro do prazo e de alguém ir buscá-lo — três condições que falham sob pressão. Nenhuma das contraindicações reais da succinilcolina (queimado crônico, imobilização prolongada, doença neuromuscular) é típica deste paciente, e a hipercalemia não é preocupação relevante na anafilaxia aguda.";

export const ANAFILAXIA_BLOQUEADOR_ROCURONIO =
  "Rocurônio SOMENTE se houver contraindicação à succinilcolina — e nesse caso o sugamadex 16 mg/kg é MANDATÓRIO à beira do leito, não opcional: sem ele, a paralisia dura 45–70 min num paciente cuja via aérea pode fechar.";

/**
 * ⚠️ O cenário em que a regra acima NÃO se aplica.
 *
 * Bloqueadores neuromusculares estão entre as causas mais frequentes de
 * anafilaxia perioperatória, e a reatividade cruzada entre eles é alta — cerca
 * de 44% de cruzamento com succinilcolina em quem teve anafilaxia por
 * rocurônio, e cerca de 24% no sentido inverso.
 *
 * Quando o gatilho suspeito É um bloqueador, a pergunta "succinilcolina ou
 * rocurônio?" passa a ser secundária diante de "foi um bloqueador que causou
 * isto?".
 */
export const ANAFILAXIA_GATILHO_BLOQUEADOR =
  "⚠️ Se o desencadeante suspeito for um BLOQUEADOR NEUROMUSCULAR (anafilaxia perioperatória): a reatividade cruzada entre eles é alta — cerca de 44% com succinilcolina em quem reagiu ao rocurônio, cerca de 24% no sentido inverso. Evitar AMBOS se houver alternativa para garantir a via aérea; se não houver, a escolha é feita com o risco declarado e a equipe avisada.";

/**
 * A honestidade sobre o lastro da escolha.
 *
 * Ausência de recomendação em diretriz É informação: o leitor precisa saber que
 * esta é uma decisão de raciocínio clínico declarada pelo app, e não uma
 * citação. E a posição contrária existe — vem de revisão, não de diretriz, e
 * está identificada como tal.
 */
export const ANAFILAXIA_BLOQUEADOR_LASTRO =
  "Lastro desta escolha: WAO e EAACI NÃO fazem recomendação sobre qual bloqueador usar na anafilaxia — tratam a via aérea de forma geral. Esta é uma decisão de raciocínio clínico do app, não uma citação de diretriz. A posição contrária existe (revisões defendem que, com sugamadex, a succinilcolina não deveria mais ser usada para intubação) e é opinião de revisão, não recomendação de diretriz. Questão em debate legítimo.";
