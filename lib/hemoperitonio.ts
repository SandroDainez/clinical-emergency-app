/**
 * PADRÃO HEMORRÁGICO DO ABDOME AGUDO — o quinto mecanismo, que não tinha porta.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ─────────────────────────────────────
 *
 * O nó `padrao` listava CINCO mecanismos no item de abertura — infecção,
 * isquemia, obstrução, perfuração e HEMORRAGIA, "que é a que mata mais rápido"
 * — e oferecia opção para quatro. O hemorrágico tinha critério escrito em
 * `evidence` e nenhum botão.
 *
 * ⚠️ E O DEFEITO SÓ APARECEU AO MOVER OS CRITÉRIOS PARA OS RÓTULOS: quatro
 * viraram rótulo, e sobrou um sem destino. A correção de forma revelou um
 * buraco de conteúdo — o inverso do que se espera.
 *
 * ── QUEM CHEGA AQUI, E QUEM NÃO CHEGA ───────────────────────────────────────
 *
 * O nó `padrao` é alcançado SÓ quando `instabilidade` respondeu "Não — estável"
 * (verificado no grafo: é a única aresta, mais o retorno do caminho guiado).
 * Então este destino é para o paciente que AINDA está estável.
 *
 * ⚠️ O INSTÁVEL CONTINUA INDO PARA `catastrofe`, e isso é deliberado: lá estão
 * a cirurgia imediata, os hemocomponentes reservados, a hipotensão permissiva
 * do aneurisma roto e o "não aguardar β-hCG quantitativo". Este nó NÃO é o
 * caminho de quem está sangrando muito — é o de quem talvez esteja sangrando e
 * ainda não mostrou.
 *
 * ── FONTES ABERTAS EM SESSÃO ────────────────────────────────────────────────
 *
 * 1. Hemoperitoneum from Corpus Luteal Cyst Rupture (PMC4058584) — o exame
 *    físico varia "from no signs to severe peritoneal irritation"; o β-hCG é
 *    necessário para diferenciar cisto lúteo roto de ectópica rota; e a rotura
 *    de cisto deve ser considerada AINDA QUE o teste de gravidez seja positivo.
 *    Causas ginecológicas espontâneas mais comuns na idade fértil: ectópica e
 *    cisto lúteo roto; menos comuns: rotura uterina, endometriose,
 *    hidropiossalpinge rota.
 *
 * 2. Vital signs fail to correlate with hemoperitoneum from ruptured ectopic
 *    pregnancy (Am J Emerg Med 2001, PMID 11593468) — 51 casos, volume médio de
 *    1.050 mL (400–2.000). Correlação com FC R² = 0,04; com PAS R² = 0,1.
 *    "If surgical decisions were made on the basis of hypotension, 38% of
 *    patients could have received either inappropriate additional studies or
 *    surgical approach." E: "Patients with normal vital signs had a 20% chance
 *    of having class IV blood loss at surgery."
 *
 * 3. Ectopic pregnancy: diagnosis and management (AFP 2020) — considerar
 *    ectópica em qualquer gestante com sangramento ou dor abdominal baixa antes
 *    de estabelecer gestação intrauterina.
 *
 * 4. Ectópica rota com β-hCG sérico negativo (PMID 19155948) e com teste de
 *    urina negativo (PMC5030406) — o negativo NÃO exclui.
 *
 * ⚠️ O QUE A FONTE NÃO SUSTENTA, E POR ISSO NÃO ESTÁ ESCRITO: o mecanismo de
 * que "sangue livre irrita menos o peritônio que conteúdo entérico". É
 * explicação plausível e corrente, e nenhuma das fontes abertas a afirma. O que
 * está escrito é o FATO que a fonte dá — o exame pode não ter sinal nenhum —
 * sem a fisiopatologia que ela não diz.
 */

/* ── 1 · O ABDOME QUE PODE ESTAR MOLE ─────────────────────────────────────── */

export const HEMO_EXAME_PODE_ENGANAR =
  "⚠️ O ABDOME PODE ESTAR MOLE, E ISSO NÃO AFASTA SANGRAMENTO. O exame físico no hemoperitônio vai de NENHUM SINAL até irritação peritoneal grave — a fonte descreve exatamente esse espectro, e não há como saber em que ponto dele o seu paciente está. Defesa, rigidez e descompressão dolorosa são achados que podem CHEGAR TARDE ou não chegar. ➜ Não use \"o abdome está mole\" como argumento para não procurar sangue: use a imagem.";

/* ── 2 · A HIPOVOLEMIA PRECOCE, LIGADA AO CHOQUE COMPENSADO ──────────────── */

/**
 * ⚠️ ESTA CONSTANTE É A PONTE COM O `shock/inicio`.
 *
 * Lá subimos para o summary a frase de que a hipotensão NÃO é obrigatória —
 * taquicardia e vasoconstrição preservam a PA no choque compensado. Aqui está o
 * NÚMERO do mesmo fenômeno num cenário concreto, e ele é mais duro do que a
 * formulação genérica: um em cinco com sinais vitais NORMAIS já tinha perda de
 * classe IV na cirurgia.
 */
export const HEMO_SINAIS_VITAIS_NAO_SERVEM =
  "⚠️ SINAIS VITAIS NORMAIS NÃO SIGNIFICAM POUCO SANGUE — E AQUI EXISTE NÚMERO. Na série de gravidez ectópica rota que mediu isso (51 casos, volume médio de 1.050 mL no abdome), a correlação entre sinais vitais e volume de sangue foi PRATICAMENTE NULA: R² de 0,04 para a frequência cardíaca e 0,1 para a pressão sistólica. E o desfecho que importa: PACIENTES COM SINAIS VITAIS NORMAIS TINHAM 20% DE CHANCE DE PERDA SANGUÍNEA CLASSE IV na cirurgia. É o mesmo choque compensado do módulo de choque — taquicardia e vasoconstrição sustentam a pressão até não sustentarem mais —, só que com o dado do abdome. ➜ Decidir por hipotensão levaria 38% destes pacientes ao estudo ou à abordagem cirúrgica errada.";

/* ── 3 · O β-hCG COMO REGRA, NÃO COMO ITEM DE LISTA ──────────────────────── */

/**
 * ⚠️ A FORMA IMPORTA MAIS QUE O CONTEÚDO AQUI.
 *
 * "Dosar β-hCG" numa lista de exames é ignorável. Escrito como REGRA sem
 * exceção, ele bloqueia a única coisa que faz o exame não ser pedido: a
 * história que a paciente conta. "Ela disse que não está grávida", "está no
 * anticoncepcional", "menstruou na semana passada" — nenhuma dessas frases é
 * um teste, e todas já dispensaram o teste em algum plantão.
 */
export const HEMO_BETA_HCG_REGRA =
  "⚠️ REGRA SEM EXCEÇÃO: TODA MULHER EM IDADE FÉRTIL COM DOR ABDOMINAL FAZ β-hCG. Não importa o que ela diga sobre a última menstruação, não importa se usa contraceptivo, não importa se acha que não está grávida — nenhuma dessas informações é um teste, e é assim que a gravidez ectópica passa. ⚠️ E O RESULTADO NÃO FECHA NEM ABRE SOZINHO: existe ectópica rota com β-hCG sérico NEGATIVO e com teste de urina negativo, então o negativo não exclui; e a rotura de cisto de corpo lúteo deve continuar na lista mesmo com teste POSITIVO. O β-hCG orienta o diferencial — quem decide é a imagem à beira do leito.";

/* ── 4 · AS CAUSAS, COM A PROCEDÊNCIA SEPARADA ───────────────────────────── */

export const HEMO_CAUSAS_GINECOLOGICAS =
  "NA MULHER EM IDADE FÉRTIL, AS DUAS CAUSAS MAIS COMUNS DE SANGRAMENTO ESPONTÂNEO SÃO GINECOLÓGICAS: gravidez ectópica rota e ROTURA DE CISTO DE CORPO LÚTEO — e a segunda é a que se esquece, porque não depende de gravidez. Menos comuns, na mesma fonte: rotura uterina, endometriose e hidropiossalpinge rota.";

/**
 * ⚠️ ESTA LISTA NÃO É NOVA — ela já existia como item de `evidence` do nó
 * `padrao`, recolhida atrás do acordeão. O que muda é o LUGAR: ela desce para o
 * destino de quem escolheu o padrão hemorrágico, onde é conduta, em vez de ficar
 * na tela da triagem, onde era catálogo.
 */
export const HEMO_CAUSAS_NAO_GINECOLOGICAS =
  "E AS DEMAIS, QUE NÃO DEPENDEM DE SER MULHER: ruptura de ANEURISMA arterial (aorta, esplênica, hepática), trauma de órgão sólido — inclusive o trauma que o paciente não relatou —, ruptura ESPONTÂNEA DE BAÇO, divertículo sangrante, malformação arteriovenosa, fístula aortoduodenal em quem tem enxerto aórtico, pancreatite hemorrágica e Mallory-Weiss. ⚠️ ANEURISMA DE AORTA ROTO É O QUE MAIS SE CONFUNDE: ele se apresenta como cólica renal, com dor lombar e hematúria, e a idade da suspeita começa antes do que a intuição sugere.";

/* ── 5 · O GATILHO DE RETORNO, COM O QUE OBSERVAR ────────────────────────── */

/**
 * ⚠️ "REAVALIE" SEM INTERVALO É O DEFEITO QUE JÁ CORRIGIMOS EM OUTROS NÓS.
 *
 * E aqui há uma dificuldade honesta: NENHUMA DAS FONTES ABERTAS DÁ INTERVALO
 * para reavaliação do hemoperitônio estável. Isso está declarado no texto — o
 * app não inventa o número que a fonte não dá (é a mesma decisão do NIHSS sem
 * ponto de corte).
 *
 * O que a fonte SUSTENTA é a instabilidade da própria janela: 20% com sinais
 * vitais normais tinham perda classe IV. Então o texto diz O QUE OBSERVAR, e
 * diz que a observação é CONTÍNUA em vez de fingir uma cadência.
 */
export const HEMO_GATILHO_DE_RETORNO =
  "⚠️ ESTE É UM PACIENTE EM JANELA, NÃO UM PACIENTE ESTÁVEL — e a diferença é que a janela fecha sem avisar. O QUE OBSERVAR, e o que cada coisa quer dizer: PRESSÃO DE PULSO estreitando (a sistólica cai antes de a diastólica ceder, e o pulso fino aparece antes da hipotensão); FREQUÊNCIA CARDÍACA subindo em medidas seguidas — a tendência vale mais que o valor; NÍVEL DE CONSCIÊNCIA, com agitação ou sonolência novas contando como sinal de perfusão, não de comportamento; e a DOR QUE MUDA DE CARÁTER — a que era em cólica e passa a ser contínua, ou a que se espalha para o ombro (irritação diafragmática pelo sangue). ⚠️ MEDIDA ISOLADA NÃO SERVE: são medidas SERIADAS, com o paciente monitorizado e à vista, e nenhuma das fontes abertas estabelece um intervalo — por isso este app não escreve \"a cada X minutos\". ➜ SE QUALQUER UM DESSES SINAIS APARECER, o paciente deixou de ser deste nó: volte ao caminho da CATÁSTROFE ABDOMINAL — cirurgia acionada, hemocomponentes reservados e ressuscitação em paralelo.";

/* ── 6 · A FRONTEIRA COM O PADRÃO VASCULAR ───────────────────────────────── */

/**
 * ⚠️ O PAR CONFUNDÍVEL SE DESFAZ PELOS DOIS LADOS, OU NÃO SE DESFAZ.
 *
 * "Vascular" e "hemorrágico" são ambos vasculares. Se só o rótulo novo disser
 * "vaso roto", quem lê "vascular" continua sem saber que ali é oclusão — e a
 * distinção existe só na metade da tela em que ninguém precisava dela.
 *
 * Por isso a palavra entra nos DOIS rótulos do nó `padrao`: OCLUÍDO num,
 * ROTO no outro. O eixo é mecânico e não exige taxonomia nenhuma.
 */
export const HEMO_FRONTEIRA_COM_ISQUEMIA =
  "⚠️ E A DIFERENÇA COM O PADRÃO VASCULAR, QUE TAMBÉM É DE VASO: lá o vaso está OCLUÍDO e o intestino morre por falta de sangue (isquemia mesentérica) — a dor é desproporcional ao exame e o exame de escolha é a angiotomografia. Aqui o vaso está ROTO e o sangue está livre na cavidade — o exame pode ser pobre e quem responde é o ultrassom à beira do leito. Os dois podem coexistir no mesmo paciente idoso com aterosclerose, e nesse caso o que sangra manda primeiro.";
