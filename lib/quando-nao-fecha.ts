/**
 * QUANDO O ALGORITMO NÃO FECHA — o fim das cascatas de exclusão.
 *
 * ── OS DOIS DESTINOS QUE ORIGINARAM ─────────────────────────────────────────
 *
 * A Dispneia e o Choque terminam em cascatas de perguntas sim/não. Quem
 * responde "Não" a todas cai num último nó — `dx_indefinido` (11 perguntas
 * antes) e `dx_distributivo_outro` (6 perguntas antes).
 *
 * Os dois JÁ TINHAM conteúdo: exames e diferenciais na Dispneia; causas,
 * noradrenalina, cortisol e hidrocortisona no Choque, com encaminhamento para
 * as vasoativas. ⚠️ Eu os declarei "becos vazios" porque minha sonda lia 6 dos
 * 11 campos de texto do nó e não via `exitCriteria` nem `targets` (R-65, sexta
 * ocorrência). O conserto é ACRÉSCIMO, não escrita — e o que faltava era o
 * mesmo nos dois.
 *
 * ── AS TRÊS PEÇAS QUE FALTAVAM ──────────────────────────────────────────────
 *
 * 1. FISIOLOGIA — o que se está procurando, para reconhecer quando aparecer.
 * 2. POR QUE A CONDUTA É ESSA — no Choque, por que o vasopressor entra cedo.
 * 3. RECONSIDERE O CAMINHO — depois de N respostas negativas, a explicação mais
 *    provável NÃO é causa exótica: é uma resposta anterior errada.
 *
 * E a quarta, que é de rótulo e está nas árvores: a opção "Não / indefinido"
 * FUNDE DESCARTEI COM NÃO SEI, que são opostos (R-70).
 */

/* ── CHOQUE · dx_distributivo_outro ───────────────────────────────────────── */

/**
 * ⚠️ O RECONHECIMENTO VEM DA CONTRAPOSIÇÃO com o perfil frio.
 *
 * O módulo ensina o frio-úmido no cardiogênico — extremidades frias, enchimento
 * lento, pressão de pulso estreita. O distributivo é o oposto ponto a ponto, e
 * é essa contraposição que faz reconhecer: hipotensão COM pele quente e
 * enchimento rápido não é falha de bomba, é vaso aberto.
 */
export const DISTRIBUTIVO_FISIOLOGIA =
  "O QUE VOCÊ ESTÁ PROCURANDO: vasodilatação com débito preservado ou ALTO. À beira do leito isso é o oposto do perfil frio que você viu no cardiogênico — extremidades QUENTES, pressão de pulso AMPLA (a diastólica cai mais que a sistólica), enchimento capilar RÁPIDO, tudo isso APESAR da hipotensão. Hipotensão com pele quente e enchimento rápido não é falha de bomba: é vaso aberto. O lactato pode subir mesmo com débito alto, porque o problema é de distribuição, não de fluxo total.";

/**
 * ⚠️ NECESSÁRIO E INSUFICIENTE — e a redação foi calibrada de propósito.
 *
 * "Volume não corrige vasodilatação" lido rápido vira "não dê volume", e aí
 * criamos o defeito inverso: alguém segurando volume num paciente que precisa
 * dele. No distributivo há hipovolemia RELATIVA real — o leito dilatou e
 * precisa ser preenchido —, e volume é PARTE do tratamento.
 *
 * É o R-23 na forma perigosa: a ressalva cancelando a conduta certa em vez de
 * completá-la. Esta peça EXPLICA o que a conduta do nó já manda (volume +
 * noradrenalina); não a contradiz.
 */
export const DISTRIBUTIVO_POR_QUE_VASOPRESSOR_CEDO =
  "⚠️ POR QUE O VASOPRESSOR ENTRA CEDO — E ISSO NÃO É MOTIVO PARA SEGURAR VOLUME. O leito vascular dilatou, então há HIPOVOLEMIA RELATIVA de verdade: o continente cresceu e o conteúdo precisa acompanhar. Volume é PARTE do tratamento e não é erro. O ponto é outro: ele é NECESSÁRIO E INSUFICIENTE. Quem só repõe persegue uma meta de pressão que a vasodilatação desfaz enquanto se infunde — e o preço de insistir só com volume é congestão, hemodiluição e tempo perdido com o paciente hipoperfundido. Por isso os dois andam juntos: expanda E comece a noradrenalina, sem esperar terminar a expansão para titular.";

/**
 * ⚠️ DEPOIS DE SEIS "NÃO", A HIPÓTESE MAIS PROVÁVEL É UM "NÃO" ERRADO.
 *
 * Chegar ao fim de uma cascata de exclusão não significa causa exótica —
 * significa revise o caminho. E as três a reconsiderar são as que dependeram de
 * julgamento, não de número.
 */
export const DISTRIBUTIVO_RECONSIDERE =
  "⚠️ ANTES DE PROCURAR CAUSA RARA, RECONSIDERE O CAMINHO. Você respondeu NÃO a seis perguntas para chegar aqui, e depois de seis negativas a explicação mais provável não é uma doença exótica — é uma das respostas anteriores estar errada. Volte e reconsidere as três que dependem de julgamento: (1) HIPOVOLEMIA — o sangramento oculto não se vê: retroperitônio, pelve, TGI alto, fêmur; hematócrito normal na primeira hora não exclui nada; (2) OBSTRUTIVO — tamponamento e TEP são os que mais escapam, e o ultrassom à beira do leito responde os dois em minutos; (3) CARDIOGÊNICO — a bomba pode falhar sem dor torácica e sem congestão evidente, sobretudo no idoso e no diabético. Só depois disso a busca por causa distributiva incomum faz sentido.";

/**
 * ⚠️ AUSÊNCIA DECLARADA (R-13), com onde procurar — e não só "procure".
 *
 * O nó já lista quatro causas (insuficiência adrenal, intoxicação por
 * vasodilatador, pós-bypass, hepatopatia) SEM procedência declarada — o que é
 * D-3/D-27 e está anotado como dívida. Esta constante não repete a lista: ela
 * diz que a lista não é exaustiva e onde continuar.
 */
export const DISTRIBUTIVO_O_QUE_ESTE_APP_NAO_LISTA =
  "⚠️ E ESTA LISTA NÃO É EXAUSTIVA — o app não fecha o diferencial do choque distributivo não séptico, e dizer isso é mais honesto que sugerir que quatro causas o esgotam. O que sustenta o paciente enquanto o diagnóstico não vem é o que está acima: reconhecer o perfil, expandir, vasopressor cedo e reavaliar. ➜ ONDE CONTINUAR: cortisol basal antes da hidrocortisona quando houver suspeita de insuficiência adrenal, revisão da lista de medicamentos em uso (anti-hipertensivos, sedativos, vasodilatadores), história de corticoterapia crônica interrompida, e a discussão com a terapia intensiva — que é onde este paciente vai.";

/* ── DISPNEIA · dx_indefinido ─────────────────────────────────────────────── */

export const DISPNEIA_INDEFINIDA_FISIOLOGIA =
  "O QUE SOBROU DEPOIS DE EXCLUIR AS COMUNS, e como pensar: dispneia sem padrão pulmonar nem cardíaco claro costuma ser um dos três — (1) DEMANDA aumentada por acidose metabólica, em que o pulmão está compensando e não doente (Kussmaul: respiração profunda, sem esforço acessório proporcional); (2) TRANSPORTE de oxigênio comprometido com pulmão normal — anemia grave, intoxicação por monóxido ou metemoglobinemia, em que a SpO₂ engana; (3) MISTO, o paciente com duas doenças parciais, que é o mais comum dos três no idoso. A ansiedade é diagnóstico de EXCLUSÃO e vem depois destes, nunca antes.";

export const DISPNEIA_INDEFINIDA_RECONSIDERE =
  "⚠️ ANTES DE AMPLIAR EXAMES, RECONSIDERE O CAMINHO. Você respondeu NÃO a onze perguntas para chegar aqui — e a explicação mais provável não é causa rara, é uma resposta anterior errada. Reconsidere as três em que mais se erra com o paciente ofegante: (1) TEP — a apresentação clássica é minoria; taquicardia isolada, síncope ou piora súbita sem ausculta alterada bastam para suspeitar, e o fator de risco pode não ser lembrado no primeiro momento; (2) CHIADO — nem todo sibilo é asma ou DPOC: o EAP silba, e chamá-lo de broncoespasmo leva a broncodilatador em quem precisa de vasodilatador e diurético; (3) CREPITANTES — a ausculta do taquipneico engana, e crepitante bilateral com jugular cheia é congestão até prova em contrário. Se qualquer uma dessas mudar, volte ao ramo dela.";
