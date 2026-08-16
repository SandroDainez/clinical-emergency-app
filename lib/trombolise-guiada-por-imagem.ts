/**
 * Trombólise guiada por IMAGEM — os dois critérios, que não são o mesmo.
 *
 * ── O DEFEITO QUE ORIGINOU: O FLUXO CONTRADIZIA O PRÓPRIO TEXTO ────────────
 *
 * O nó de janela do AVC DIZIA (AHA/ASA 2026): "janela ESTENDIDA: 4,5–9 h do
 * último-visto-bem, ou AVC ao acordar (até 9 h do ponto médio do sono), quando
 * há mismatch em neuroimagem avançada".
 *
 * E o roteamento, medido por execução, mandava TODAS as janelas acima de 4,5 h
 * — inclusive "desconhecido / ao acordar" — direto para a avaliação de
 * TROMBECTOMIA, sem nunca oferecer a trombólise guiada por imagem.
 *
 * ⚠️ O PACIENTE QUE SUMIA DO FLUXO É EXATAMENTE A POPULAÇÃO DO ENSAIO. No
 * WAKE-UP, oclusão de grande vaso NÃO era exigida: apenas 33,7% dos pacientes
 * tinham qualquer oclusão. Dois terços NÃO tinham — e é justamente esse
 * paciente (acordou com déficit, tem mismatch, não tem OGV) que a rota antiga
 * mandava para uma avaliação de trombectomia que o ensaio usava como critério
 * de EXCLUSÃO.
 *
 * A rota antiga era decisão consciente, com comentário: "errar para o lado de
 * NÃO liberar o trombolítico é o único erro aceitável aqui". Era defensável
 * enquanto o módulo não tinha a janela estendida escrita. Com o texto lá, o app
 * afirmava uma conduta e não a oferecia.
 *
 * ── ⚠️ DOIS CRITÉRIOS, DUAS POPULAÇÕES, DOIS EXAMES (R-36) ────────────────
 *
 * Fundir os dois faria o app mandar procurar o exame que o hospital não tem —
 * e o médico concluiria "não elegível" quando existe outro caminho.
 *
 *                     DWI-FLAIR (WAKE-UP)        PERFUSÃO (EXTEND)
 *   população         início DESCONHECIDO        4,5–9 h por TEMPO
 *                     / ao acordar               e também o wake-up
 *   exame             RM obrigatória             "MR-DWI ou CT-CBF" —
 *                                                TC de perfusão SERVE
 *   critério          DWI+ / FLAIR−              core < 70 mL, razão de
 *                                                mismatch > 1,2,
 *                                                penumbra > 10 mL
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · WAKE-UP (NEJM 2018; Wiki Journal Club): inclusão "Abnormal signal on MRI
 *    DWI imaging" + "No abnormal signal on MRI FLAIR imaging", com "last known
 *    well time greater than 4.5 hours"; "'Any' vessel occlusion occurred in
 *    33.7% of patients"; "Planned thrombectomy" entre os critérios de exclusão;
 *    alteplase 0,9 mg/kg (10% bolus + 90% em 60 min). Desfecho mRS 0–1 em 90
 *    dias: 53% × 42%, OR 1,61 (IC 1,09–2,36), p = 0,02.
 *  · EXTEND (Wiki Journal Club): "treatment can commence between 4.5 and 9
 *    hours after stroke onset" ou, no wake-up, "time from midpoint of sleep is
 *    less than or equal 9 hours"; seleção por "MR-DWI or CT-CBF"; "penumbral
 *    mismatch, with mismatch ratio > 1.2 and penumbra more than 10 mL" e
 *    "ischemic core < 70 ml"; candidatos a trombectomia EXCLUÍDOS.
 *  · ⚠️ Os textos integrais de AHA/ASA 2026 não foram abertos nesta sessão — o
 *    que o app afirma sobre a diretriz já estava escrito e conferido em fase
 *    anterior. O que se abriu agora foram os ENSAIOS que sustentam cada
 *    critério, porque a pergunta era de elegibilidade, não de recomendação.
 */

/**
 * ⚠️ REGRA CONTRAINTUITIVA, E POR ISSO ESCRITA COMO REGRA.
 *
 * A leitura natural é "faz os dois" — trombólise e trombectomia. Nos DOIS
 * ensaios que sustentam a janela estendida, ser candidato a trombectomia era
 * critério de EXCLUSÃO. A trombólise guiada por imagem é para quem NÃO vai
 * para a sala.
 */
export const IMAGEM_QUEM_VAI_PARA_TROMBECTOMIA_SAI =
  "⚠️ ANTES DE TUDO: se há OCLUSÃO DE GRANDE VASO e o paciente é candidato a TROMBECTOMIA, este não é o caminho — vá para a trombectomia. Nos dois ensaios que sustentam a janela estendida (WAKE-UP e EXTEND), ser candidato a trombectomia era critério de EXCLUSÃO. A trombólise guiada por imagem existe para quem NÃO vai para a sala de hemodinâmica — e é a maioria: no WAKE-UP, só 33,7% dos pacientes tinham qualquer oclusão.";

export const IMAGEM_DWI_FLAIR =
  "INÍCIO DESCONHECIDO OU AO ACORDAR — critério DWI-FLAIR (WAKE-UP): lesão VISÍVEL na difusão (DWI) e AINDA NÃO VISÍVEL no FLAIR. O mismatch indica lesão recente, provavelmente dentro das 4,5 h, mesmo sem saber a hora. ⚠️ EXIGE RESSONÂNCIA — o ensaio não validou alternativa por TC para este critério. Elegível: trombólise em dose PADRÃO (alteplase 0,9 mg/kg, MÁXIMO 90 mg — 10% em bolus + 90% em 60 min).";

export const IMAGEM_PERFUSAO =
  "4,5–9 h POR TEMPO, OU AO ACORDAR ATÉ 9 h DO PONTO MÉDIO DO SONO — critério de PERFUSÃO (EXTEND): core isquêmico < 70 mL, razão de mismatch > 1,2 e penumbra > 10 mL. ⚠️ AQUI A TC DE PERFUSÃO SERVE — o ensaio aceitou RM ou TC (\"MR-DWI or CT-CBF\"), e é este o caminho de quem não tem ressonância disponível.";

/**
 * A ausência declarada, porque é o cenário mais provável em boa parte dos
 * serviços — e porque sem ela o médico conclui que FALHOU em achar o caminho,
 * quando o caminho é que não existe.
 */
export const IMAGEM_SEM_NENHUM_DOS_EXAMES =
  "SEM RM E SEM TC DE PERFUSÃO — e este é o cenário de boa parte dos serviços: a janela estendida NÃO se abre. Os dois critérios dependem de neuroimagem avançada, e não há substituto validado por TC simples ou por clínica. O que resta: (1) fora de 4,5 h, NÃO trombolisar às cegas — o risco hemorrágico não some porque o exame falta; (2) avaliar OCLUSÃO DE GRANDE VASO com angioTC, que a maioria dos serviços tem, porque a trombectomia tem janela até 24 h e é a terapia que continua na mesa; (3) TRANSFERIR para centro com neuroimagem avançada, se o tempo permitir, é decisão de rede — e é a razão de o transporte precisar começar antes de a conta fechar.";

export const IMAGEM_ATE_QUANDO =
  "⚠️ A JANELA DE TROMBÓLISE GUIADA POR IMAGEM TERMINA EM 9 h (do último-visto-bem, ou do ponto médio do sono). Depois disso, mismatch não abre trombólise: de 9 a 24 h o que resta é TROMBECTOMIA por critério de imagem (DAWN/DEFUSE-3). Este é o ponto em que as duas terapias deixam de correr juntas.";
