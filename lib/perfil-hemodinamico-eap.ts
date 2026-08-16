/**
 * EAP — o perfil hemodinâmico, e o par que a classificação por PAS não separa.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * `card_classificacao` tem quatro saídas, TODAS por PAS: > 180 · 110–180 ·
 * 90–110 · < 90. Busca no módulo inteiro: "quente" 0, "frio" 0,
 * "extremidades" 0, "enchimento capilar" 0, "pressão de pulso" 0.
 *
 * O perfil de perfusão só aparecia ATRELADO À HIPOTENSÃO — no rótulo do quarto
 * ramo e numa linha do terceiro.
 *
 * ⚠️ O PACIENTE QUE SOME É O FRIO-ÚMIDO COM PAS NORMAL: débito baixo,
 * extremidades frias, pressão de pulso estreita, oligúria, lactato alto — e
 * PAS 120. Ele cai em "110–180 → vasodilatador + diurético", que é a conduta
 * do QUENTE-úmido, e é exatamente o que piora quem já está com débito baixo.
 *
 * É o par do Choque aplicado aqui: PAS NÃO É PERFUSÃO. A pressão é o produto
 * do débito pela resistência, e um débito baixo com vasoconstrição intensa
 * mantém a pressão normal enquanto os órgãos já não estão sendo perfundidos.
 */

/**
 * ⚠️ ESCRITO NA FORMA DO PAR, como no Choque — porque o que se confunde não se
 * separa com uma definição, se separa com o contraste lado a lado.
 */
export const EAP_QUENTE_VERSUS_FRIO =
  "⚠️ ANTES DE VASODILATAR, DECIDA SE O PACIENTE ESTÁ QUENTE OU FRIO — e a PA NÃO responde isso. QUENTE-ÚMIDO (a maioria): congesto e bem perfundido — extremidades quentes, enchimento capilar normal, pressão de pulso ampla, lactato normal, diurese preservada, consciência clara. É o paciente do vasodilatador e do diurético. FRIO-ÚMIDO: congesto E mal perfundido — extremidades frias e pegajosas, enchimento capilar lento, PRESSÃO DE PULSO ESTREITA (< 25% da sistólica), sonolência, oligúria, lactato elevado, hiponatremia. Este precisa de INOTRÓPICO, e o vasodilatador o derruba. ⚠️ E O FRIO-ÚMIDO PODE TER PAS NORMAL — a pressão é débito × resistência, e a vasoconstrição sustenta o número enquanto o débito já caiu. Classificar só pela PA manda o frio de PAS 120 para o mesmo caminho do quente.";

/**
 * ⚠️ A ASSIMETRIA ESCRITA, e não só implícita na recomendação.
 *
 * É o que diz ao médico PARA ONDE ERRAR quando ele não tem certeza — e a
 * incerteza aqui é a regra, não a exceção.
 */
export const EAP_PARA_ONDE_ERRAR =
  "⚠️ NA DÚVIDA, ERRE PARA O LADO DO INOTRÓPICO — E O MOTIVO É A ASSIMETRIA. Vasodilatar quem está FRIO derruba o que já está baixo: a pressão cai, a perfusão coronariana piora, e o efeito é IMEDIATO, com o paciente ficando pior na sua frente em minutos. Inotrópico em quem está QUENTE-úmido é EXCESSO, não catástrofe: gasta droga, pode taquicardizar e aumentar consumo de oxigênio, e se corrige suspendendo. Os dois erros não têm o mesmo tamanho, e é por isso que a dúvida não se resolve no meio-termo — se você não consegue afirmar que o paciente está quente, trate-o como frio até provar o contrário.";

/**
 * O sinal de reversibilidade no ramo em que o erro acontece — mesma forma do
 * Choque, onde a cascata não foi mexida e a saída veio pelo TEXTO, no nó em
 * que a pessoa JÁ ERROU.
 */
export const EAP_SE_ERROU_O_PERFIL =
  "⚠️ E SE O PERFIL ESTAVA ERRADO, O PACIENTE AVISA — reconheça o sinal em vez de insistir: se a PA CAIR com o vasodilatador, se a DIURESE NÃO VIER apesar do diurético, ou se as extremidades esfriarem e o lactato subir, o perfil era FRIO. Suspenda o vasodilatador, reduza ou pare o diurético e passe ao inotrópico — não aumente a dose do que não está funcionando. Débito baixo não responde a mais vasodilatação; responde a mais contração.";

/* ── O EDEMA MISTO ──────────────────────────────────────────────────────────
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O nó `tipo` tinha DUAS saídas — cardiogênico ou SARA — e a própria evidência
 * do nó dizia: "MISTO (sepse em cardiopata, pós-op cardíaco): tratar
 * componente dominante; reavaliar com POCUS/ecocardiograma".
 *
 * ⚠️ O MISTO ESTAVA DESCRITO E NÃO TINHA BOTÃO. É o terceiro módulo em que
 * isso acontece — CAD/EHH, Choque e agora o EAP —, e no balanço da auditoria
 * está registrado como achado de DESENHO, não como três achados: o app sabia
 * da existência do estado misto e não oferecia o caminho.
 */

export const EAP_MISTO =
  "EDEMA MISTO — CARDIOGÊNICO + LESÃO PULMONAR, e ele é comum: sepse em cardiopata, pneumonia em quem já tem fração de ejeção reduzida, pós-operatório cardíaco, transfusão maciça em disfunção diastólica. Suspeite quando os dois quadros se sobrepõem — infiltrado difuso COM cardiomegalia, BNP alto COM febre e foco infeccioso, ou congestão que não responde como deveria ao diurético. ⚠️ TRATAR O COMPONENTE DOMINANTE NÃO É ESCOLHER UM: escolher é o que este ramo existe para evitar, e os DOIS erros são de OMISSÃO. Quem rotula como SARA perde o vasodilatador e o diurético de uma congestão hidrostática REAL, e trata com restrição de volume um coração que precisa descongestionar. Quem rotula como cardiogênico restringe volume e diureiza um paciente que precisa de ANTIBIÓTICO PRECOCE e de RESSUSCITAÇÃO — e a sepse não espera a congestão melhorar. Conduza o dominante pela via dele e o segundo em paralelo: antibiótico e controle de foco não esperam o eco; ventilação protetora e vasodilatador não se anulam. ⚠️ O SINAL DE QUE HÁ DOIS MECANISMOS É A RESPOSTA PARCIAL — melhorou e parou de melhorar. E o que decide a proporção é o POCUS à beira do leito: função de VE, linhas B, VCI — não o rótulo escolhido na primeira tela.";

/**
 * ── A SAÍDA DE QUEM AINDA NÃO SABE (R-48 refinado) ─────────────────────────
 *
 * A diferenciação cardiogênico × SARA é justamente a que se faz com POCUS e
 * BNP — exames que ainda não voltaram quando o paciente chega. Obrigar a
 * escolher entre dois ramos que decidem a conduta inteira, na primeira tela, é
 * pedir um chute com consequência.
 *
 * E o que se faz sem saber é quase tudo o que muda desfecho na primeira meia
 * hora.
 */
export const EAP_AINDA_NAO_SEI =
  "NÃO PRECISA DEFINIR O MECANISMO PARA COMEÇAR — e boa parte do que muda desfecho na primeira meia hora é COMUM aos dois. FAÇA AGORA, vale para cardiogênico, SARA e misto: SENTAR o paciente (pernas pendentes, se não houver rebaixamento), O₂ para SpO₂ ≥ 94% (88–92% se DPOC), VNI se a saturação não subir — conferindo as contraindicações —, monitor, dois acessos, ECG de 12 derivações e gasometria. ⚠️ O QUE ESPERA O MECANISMO, e por isso não se faz no escuro: VASODILATADOR e DIURÉTICO (são do cardiogênico, e no SARA puro não tratam nada — o diurético em quem está hipovolêmico por sepse piora), e a RESTRIÇÃO DE VOLUME (que é o oposto do que a sepse precisa). O QUE DECIDE: ultrassom à beira do leito — função de VE, linhas B, VCI — e BNP/NT-proBNP. Nenhum dos dois demora, e os dois valem mais que o palpite. ⚠️ E REAVALIE: o mecanismo se declara em minutos a horas, e o rótulo da primeira tela não é sentença.";
