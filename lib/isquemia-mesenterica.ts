/**
 * Isquemia mesentérica aguda — QUATRO doenças sob um rótulo (R-36).
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O nó `vascular` reconhecia bem e prescrevia UMA conduta —
 * "revascularização (embolectomia/endovascular) e/ou ressecção do segmento
 * inviável" — para quatro entidades cujo tratamento diverge até o extremo.
 *
 * ⚠️ A MAIOR DISTÂNCIA DO MÓDULO está entre duas delas: a trombose VENOSA sem
 * peritonite é tratamento CLÍNICO, e a mesma frase genérica mandava o paciente
 * para a laparotomia.
 *
 * ── FONTE ABERTA EM SESSÃO (2026-08-16) ─────────────────────────────────────
 *
 * Bala M, et al. "Acute mesenteric ischemia: updated guidelines of the World
 * Society of Emergency Surgery". World J Emerg Surg. 2022;17:54. PDF integral
 * aberto e lido. Trechos usados, verbatim:
 *
 *  · "Half of cases of AMI are due to acute SMA embolism";
 *  · "Mesenteric venous thrombosis can often be successfully treated with a
 *    continuous infusion of unfractionated heparin. (Strong recommendation
 *    based on moderate-quality evidence 1B)";
 *  · "MVT has a distinctive clinical finding on CTA scan, and when noted in a
 *    patient without findings of peritonitis, non-operative management should
 *    be considered. The first line treatment for mesenteric venous thrombosis
 *    is anticoagulation";
 *  · "When NOMI is suspected, the focus is to correct the underlying cause and
 *    improve mesenteric perfusion. Infarcted bowel should be resected
 *    promptly. (Strong recommendation based on low-quality evidence 1C)";
 *  · "Severe abdominal pain out of proportion to physical examination findings
 *    should be assumed to be AMI until disproven. (Strong recommendation based
 *    on low-quality evidence)";
 *  · "The reason for the pain being disproportionate to the clinical findings
 *    is that ischemia starts from the mucosa toward the serosa";
 *  · "The classic presentation of AMI, i.e., severe, poorly localized abdominal
 *    pain that is out of proportion to the physical examination, is becoming
 *    less common, while the 'acute on chronic' presentations of mesenteric
 *    ischemia are more typical, and probably underdiagnosed";
 *  · "There are no laboratory parameters that are sufficiently accurate to
 *    conclusively identify the presence or absence of ischemic or necrotic
 *    bowel"; "no accurate biomarkers have been identified to diagnose AMI".
 */

/**
 * O sinal, COM o mecanismo — porque é o mecanismo que faz a regra grudar.
 * Mesmo argumento da hiperventilação no TCE: mandar sem explicar não gruda.
 */
export const ISQUEMIA_DOR_DESPROPORCIONAL_POR_QUE =
  "⚠️ A DOR DESPROPORCIONAL AO EXAME É O SINAL — e o motivo dela é ANATÔMICO: a isquemia começa na MUCOSA e caminha para a SEROSA. A dor visceral é intensa desde cedo, e a defesa peritoneal só aparece quando a serosa é atingida, o que é tarde. É por isso que o abdome está mole enquanto o paciente grita de dor — e é por isso que esperar a barriga endurecer para acreditar no diagnóstico significa esperar o infarto intestinal. A WSES é explícita: dor abdominal intensa desproporcional ao exame deve ser ASSUMIDA como isquemia mesentérica até prova em contrário.";

/**
 * ⚠️ O clássico está ficando MENOS comum — e isto é do próprio guideline.
 *
 * Entra porque o módulo inteiro ancora a suspeita na dor desproporcional,
 * inclusive no roteamento do caminho guiado. Quem espera o quadro de livro
 * perde a apresentação que hoje é mais frequente.
 */
export const ISQUEMIA_CLASSICO_ESTA_SUMINDO =
  "⚠️ E O QUADRO CLÁSSICO ESTÁ FICANDO MENOS COMUM. A WSES 2022 registra que a apresentação de livro — dor intensa, mal localizada, desproporcional ao exame — vem se tornando menos frequente, enquanto os quadros \"agudo sobre crônico\" são hoje mais típicos e provavelmente SUBDIAGNOSTICADOS. Pergunte por angina intestinal: dor que vem depois de comer, medo de comer e perda de peso nos meses anteriores. Quem espera o quadro clássico para suspeitar perde justamente o paciente mais comum.";

export const ISQUEMIA_NENHUM_EXAME_EXCLUI =
  "⚠️ NENHUM EXAME LABORATORIAL EXCLUI. A WSES é categórica: não há parâmetro de laboratório suficientemente acurado para confirmar OU AFASTAR alça isquêmica ou necrótica, e nenhum biomarcador acurado foi identificado. Lactato, leucócitos e D-dímero apoiam quando alterados e não servem para tranquilizar quando normais — elevam-se tarde. Quem decide é a ANGIOTOMOGRAFIA, e ela deve ser pedida cedo, sem esperar peritonite.";

/**
 * ── AS QUATRO ENTIDADES ─────────────────────────────────────────────────────
 *
 * Ordem deliberada: embolia primeiro, por ser metade dos casos; TVM em
 * seguida, porque é a que muda mais a conduta; NOMI por último entre as
 * "diferentes", porque é a que exige tratar OUTRA coisa.
 */

export const ISQUEMIA_EMBOLIA_ARTERIAL =
  "EMBOLIA DA ARTÉRIA MESENTÉRICA SUPERIOR — METADE dos casos de isquemia mesentérica aguda. Início ABRUPTO, no paciente com fonte embólica: fibrilação atrial, infarto recente, trombo intracavitário, valvopatia, embolia prévia. Conduta: revascularização — embolectomia (aberta ou endovascular) — e ressecção apenas do que já estiver inviável.";

export const ISQUEMIA_TROMBOSE_ARTERIAL =
  "TROMBOSE ARTERIAL MESENTÉRICA — sobre placa aterosclerótica, tipicamente na ORIGEM da mesentérica superior, em paciente que costuma ter história de angina intestinal (dor pós-prandial e perda de peso). Instalação menos abrupta que a embolia. Conduta: revascularização, e aqui a lesão é ostial — habitualmente exige BYPASS ou stent, não embolectomia simples.";

/**
 * ⚠️ ESCRITA COM A CONDIÇÃO VISÍVEL, e não como característica da entidade.
 *
 * "TVM trata-se com anticoagulação" convida a decidir pelo NOME do diagnóstico.
 * O que decide é o exame do abdome: havendo peritonite, a conduta volta a ser
 * cirúrgica, TVM ou não. E a tentação é exatamente a oposta — o laudo da
 * angiotomografia chega escrito e PARECE decidir.
 */
export const ISQUEMIA_TROMBOSE_VENOSA =
  "TROMBOSE VENOSA MESENTÉRICA — ⚠️ SE NÃO HÁ PERITONITE, O TRATAMENTO É CLÍNICO: anticoagulação plena é a primeira linha, e a WSES registra que a trombose venosa mesentérica \"frequentemente pode ser tratada com sucesso com infusão contínua de heparina não fracionada\" (recomendação forte, evidência moderada). Suspeitar em quem é mais jovem que o típico e tem trombofilia, câncer, cirrose, pancreatite, doença inflamatória intestinal ou trombose venosa prévia. ⚠️ A CONDIÇÃO É A PERITONITE, NÃO O NOME DO DIAGNÓSTICO: havendo peritonite, a conduta volta a ser cirúrgica. ⚠️ E QUEM DECIDE É O EXAME, NÃO O LAUDO — a tentação é a oposta, porque o laudo da angiotomografia chega escrito e parece decidir sozinho. Esta é a maior distância entre duas condutas deste módulo: tratamento clínico contra laparotomia, separados pelo abdome que você apalpa.";

export const ISQUEMIA_NOMI =
  "ISQUEMIA MESENTÉRICA NÃO OCLUSIVA (NOMI) — não há trombo: há VASOCONSTRIÇÃO esplâncnica por baixo débito. O paciente típico é o grave de UTI — choque, pós-parada, insuficiência cardíaca, diálise, uso de vasoconstritor ou de digital. ⚠️ A CONDUTA É TRATAR A CAUSA: corrigir o débito cardíaco e a volemia, e RETIRAR ou reduzir o vasoconstritor esplâncnico sempre que possível — a WSES coloca a correção da causa precipitante como o princípio central. Alça já infartada se ressecca; o resto não se resolve operando, e sim melhorando a perfusão.";

/** O que vale para as quatro, para o texto acima não virar quatro condutas soltas. */
export const ISQUEMIA_O_QUE_VALE_PARA_TODAS =
  "PARA AS QUATRO: ressuscitação volêmica, antibiótico de amplo espectro (translocação bacteriana), anticoagulação plena com heparina assim que o diagnóstico for firmado e não houver contraindicação, e discussão CONJUNTA com cirurgia vascular e geral. Alça inviável se ressecca em qualquer uma delas, e a dúvida de viabilidade se resolve com second look programado em 24–48 h — não com observação.";
