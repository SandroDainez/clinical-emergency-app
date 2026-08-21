# Índice das travas do `test:all`

**GERADO DE `scripts/indice-de-travas.cjs` — não editar à mão.**

Este índice existe porque o `test:all` ficou grande demais para alguém saber de cabeça o que ele cobre. Duas vezes nesta auditoria começou-se a construir um verificador que já existia; a lacuna era de inventário, não de cobertura.

⚠️ Ele lê o que cada trava **diz de si mesma**. Que a declaração seja verdadeira é o que a mutação prova (R-1), não este índice.

**50 de 67 travas com declaração completa.**

## `test:engine` → `scripts/test-engine.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:guiado` → `scripts/test-fluxo-guiado.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:contexto` → `scripts/test-contexto-paciente.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:faixas` → `scripts/valida-faixas-entrada.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:voice` → `scripts/test-voice-intents.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:i18n` → `scripts/varredura-pt.cjs`

- **PROMETE:** todo literal de texto em português exibido ao usuário tem tradução em espanhol registrada.
- **NÃO PROMETE:** que a tradução esteja correta, nem cobre texto dentro de template literal com ${} — que é justamente onde a frase escapa da varredura. ⚠️ NÃO PROMETE, sobretudo: que a frase que a TELA RECEBE tenha chave. Este instrumento lê o FONTE. Quando a frase é montada por concatenação, aqui existem vários literais curtos, cada um com a sua chave — e a string de runtime, que é a soma deles, não tem nenhuma. Isso é R-82, e quem cobre é `scripts/valida-traducao-runtime.cjs`, que lê o ARTEFATO COMPILADO.
- **UNIVERSO:** os arquivos de conteúdo e os módulos de i18n. ── A FRONTEIRA COM A TRAVA DE RUNTIME (cobertura cruzada declarada) ──────── esta varredura (fonte) → TEXTO NOVO sem tradução. Vê o literal no momento em que alguém o escreve. valida-traducao-runtime → FRASE MONTADA cuja chave é de uma versão (artefato compilado)      ANTERIOR da frase. ⚠️ E FOI MEDIDO que obedecer ESTA varredura ao pé da letra NÃO basta: numa mutação em que um pedaço foi acrescentado por concatenação a uma frase que já tinha chave, gravar a chave do PEDAÇO fez esta varredura dizer «SEM TRADUÇÃO: 0» — e a tela continuou em português, com a trava de runtime reprovando. Passar aqui não é evidência de tela traduzida. Varredura exaustiva de texto em português no código VIVO do app. Por que existe: a checagem antiga só perguntava se as chamadas tr() já existentes tinham tradução — e por isso dizia "faltando 0" com o app inteiro em português. Aqui o critério é outro: extrai TODO literal com prosa em português, esteja ele dentro de tr() ou não, e confronta com os dicionários. Uso:  node scripts/varredura-pt.cjs [--json <arquivo>] Saída: por arquivo, as frases sem tradução em es-419; código de saída 1 se houver pendências.

## `test:traducao-runtime` → `scripts/valida-traducao-runtime.cjs`

- **PROMETE:** que toda string em português que o app MONTA EM TEMPO DE EXECUÇÃO tenha chave correspondente no dicionário PT→ES. O universo é o ARTEFATO COMPILADO — `lib/*.ts` e as árvores de decisão emitidas por `tsc` —, e as strings comparadas são as que a tela recebe, não as que alguém escreveu.
- **NÃO PROMETE:** que exista texto novo sem tradução nenhuma. Isso é `npm run test:i18n` (`varredura-pt.cjs`), que lê o FONTE e pega o literal recém-escrito. Também não promete que a tradução esteja CORRETA — nenhuma trava sabe espanhol.
- **UNIVERSO:** o ARTEFATO COMPILADO — todos os `lib/*.ts` e todas as árvores de decisão da raiz, emitidos por `tsc` num diretório temporário e carregados com `require`. Compara-se cada string de prosa portuguesa alcançável nos objetos exportados contra as chaves de `lib/i18n/**` e `acls/locales/**`. ⚠️ FORA do universo: `acls/reducer.ts` e `acls/presentation.ts` — dívida nomeada, porque o painel de adrenalina depende de teste que avança o cronômetro — e os componentes `.tsx`, cujo texto não vem de objeto exportado. ── A FRONTEIRA COM A VARREDURA DE FONTE (cobertura cruzada declarada) ────── varredura-pt.cjs (fonte)   → TEXTO NOVO sem tradução. Vê o literal no arquivo, no momento em que é escrito. esta trava (runtime)       → FRASE MONTADA cuja chave não corresponde ao que a tela mostra. ⚠️ NENHUMA DAS DUAS COBRE A OUTRA, e as duas condições que a auditoria fixou para aceitar cobertura cruzada estão satisfeitas: cada uma é provada por MUTAÇÃO PRÓPRIA, e as duas chegam ao defeito por CAMINHOS DIFERENTES (uma lê texto de arquivo, a outra objetos compilados). E A FRONTEIRA FOI MEDIDA, não deduzida. A mutação desta trava — acrescentar um pedaço por concatenação a `AMIODARONA_COM_PULSO_CARGA`, que HOJE tem chave — foi levada até o fim nos dois instrumentos: 1. mutação aplicada        → as duas reprovam, mas dizem coisas diferentes: a de fonte aponta o PEDAÇO de 72 caracteres, esta aponta a FRASE de 230 que a tela recebe. 2. obedecendo a de fonte   → gravei a chave do PEDAÇO. `varredura-pt.cjs` ao pé da letra             passou com «SEM TRADUÇÃO: 0». 3. e a tela                → esta trava seguiu reprovando em 3 contagens. O médico continuaria vendo português. ⚠️ É POR ISSO QUE A DE FONTE NÃO SUBSTITUI ESTA: obedecê-la literalmente produz um dicionário que passa e uma tela que não traduz. E o inverso também vale — esta trava não vê literal recém-escrito que ninguém montou ainda. A mutação também mostrou o ALCANCE do mecanismo: UMA concatenação em `lib/` derrubou TRÊS superfícies — a própria constante e dois nós de `acls-tachycardia-tree.ts` que a consomem. Quem edita a constante não vê as telas que ela alimenta. ── O DEFEITO QUE ORIGINOU (2026-08-17) ──────────────────────────────────── O autor viu o app em espanhol mostrando conteúdo clínico em português. A varredura de fonte dizia ZERO pendências — e estava certa do próprio ponto de vista. O caso, medido: lib/causas-na-parada.ts → HIPERCALEMIA_NA_PARADA string em RUNTIME  : 722 caracteres chave no dicionário: 287 caracteres divergem no caractere 287 — onde a concatenação continua export const HIPERCALEMIA_NA_PARADA = "HIPERCALEMIA — a sequência tem TRÊS tempos…" + " " + CALCIO_EQUIVALENCIA + " (2) DESLOCAR o potássio…"; A chave foi gravada quando a frase terminava no primeiro pedaço. Depois a auditoria acrescentou a equivalência dos sais e o segundo tempo: a string cresceu, a chave ficou, e `tr()` devolveu o original — em silêncio. ⚠️ E A VARREDURA DE FONTE NÃO PODIA VER: no arquivo existem TRÊS literais curtos, cada um com a sua chave. Quem monta a frase de 722 caracteres é o programa. R-82.

## `test:ausencias` → `scripts/valida-ausencias-declaradas.cjs`

- **PROMETE:** que toda AUSÊNCIA DECLARADA — lugar onde o app diz que NÃO fixa um número porque a fonte não o dá — continue declarada, e que o número plausível que alguém escreveria "completando" não apareça no lugar dela.
- **NÃO PROMETE:** que a decisão de não fixar esteja certa. Ela é clínica e está argumentada no arquivo de conteúdo; aqui só se garante que ela não seja desfeita em silêncio. Também não vê declarações escritas de forma que os padrões abaixo não reconheçam — e é por isso que o universo é DERIVADO, não listado: uma declaração nova reprova até ganhar guarda.
- **UNIVERSO:** os literais de tela de `lib/**.ts` e das árvores, varridos pelos padrões de DECLARAÇÃO. Comentário não conta — o que protege o médico é o que ele lê. ── POR QUE ESTA CLASSE EXISTE (R-88) ────────────────────────────────────── Onde o app declara que não fixa um número, a AUSÊNCIA É CONTEÚDO. E o ataque tem forma própria: alguém lê "este app não fixa o intervalo", enxerga uma OMISSÃO, e a corrige de memória. O resultado parece melhoria — um número onde havia lacuna — e é regressão do R-5: precisão inventada com a autoridade de estar no app. ⚠️ A MUTAÇÃO DESTA TRAVA É ESCREVER O NÚMERO PLAUSÍVEL, não uma quebra artificial. Por isso cada caso declara `proibido`: o número que um revisor competente escreveria de boa-fé. ── A VARREDURA QUE A ORIGINOU (2026-08-17) ──────────────────────────────── Oito ausências declaradas em texto de tela; DUAS tinham guarda. As seis restantes eram D-52 — e as três primeiras são números que todo médico "sabe", que é o que torna o preenchimento provável.

## `test:rotulo-timer` → `scripts/valida-rotulo-do-timer.cjs`

- **PROMETE:** que o rótulo do cronômetro do ACLS venha do PRÓPRIO CRONÔMETRO, e que nenhum estado com timer ativo mostre o rótulo genérico.
- **NÃO PROMETE:** que o rótulo esteja bem escrito, nem que o número esteja certo — quem garante o número é a invariante `multiple_active_timers` do reducer.
- **UNIVERSO:** os estados com `timer` no `protocol.json`, derivados do arquivo — não listados aqui. Estado novo com timer entra sozinho. ── O DEFEITO QUE ORIGINOU (2026-08-18) ──────────────────────────────────── `getTimerLabel` lia `clinicalIntent` e nomeava 3 de 8 intents; os outros CINCO caíam em "Tempo atual" — entre eles `give_epinephrine` e `give_antiarrhythmic`, as telas de fármaco. Medido na tela: nelas o cronômetro de 2 min aparecia como «Tempo atual», ao lado do cronômetro de parada. Número certo, nome que não diz para onde ele conta (R-77). A causa era R-12 na camada de apresentação: o nome vinha do intent e o número do timer. E o motor JÁ SABIA — `ACLSTimer` carrega `id`, `stateId` e `nextStateId`, e `getTimers()` descartava os três na conversão. ⚠️ A MUTAÇÃO DESTA TRAVA É VOLTAR A DESCARTAR: `getTimers()` deixando de repassar a identidade tem de reprovar, nomeando qual rótulo virou genérico.

## `test:frase-composta` → `scripts/valida-frase-composta.cjs`

- **PROMETE:** que nenhuma frase de tela NOVA seja montada com template literal e `${}`. As 55 que já existem estão nomeadas como legado e o passivo é impresso a cada execução — a lista só encolhe.
- **NÃO PROMETE:** que o VALOR interpolado esteja traduzido — ela vê a forma da frase, não o idioma do que entra nela. Quando {0} é uma frase (e não número ou nome de fármaco), o valor continua em português mesmo com a frase traduzida: é a D-20. Também não promete que as legadas estejam traduzidas. Elas NÃO estão: o usuário em espanhol lê português nas 55. Esta trava para o sangramento; a conversão é trabalho de bloco.
- **UNIVERSO:** os arquivos de conteúdo (.ts/.tsx), fora scripts, e2e, locales e i18n. Erro de dev, telemetria e log ficam de fora — não são frase de tela. ── POR QUE O test:i18n NÃO PEGA ISTO ─────────────────────────────────────── A varredura de tradução pula template literal com `${}` POR DESENHO. Uma violação bem formada faz o `test:i18n` dizer `SEM TRADUÇÃO: 0` — silêncio completo. E o mecanismo é direto: `tr(pt)` devolve `pt` inalterado quando não há chave, e frase montada em runtime nunca é chave. ── COMO CORRIGIR ─────────────────────────────────────────────────────────── A solução já existe no app: `lib/i18n/trf.ts`. A chave passa a ser a frase com marcadores e os valores entram DEPOIS da tradução: ❌ `Dose sugerida: ${dose} mEq de KCl (${ml} mL).` ✅ trf(tr, "Dose sugerida: {0} mEq de KCl ({1} mL).", [dose, ml]) Já é usada em 60 lugares. As 55 são as que ficaram para trás. ── A CHAVE É A FRASE, NÃO A LINHA ────────────────────────────────────────── Número de linha muda a cada edição e transformaria a lista em ruído. A assinatura é `arquivo :: frase com {} no lugar da interpolação`, então mover código não mexe na lista — e mudar a FRASE tira o item dela, que é exatamente quando se quer reexaminar.

## `test:nota-epi` → `scripts/test-nota-epinefrina.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `node ./scripts/verify-acls-flow.cjs` → `scripts/verify-acls-flow.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:debrief-reparada`

_não executa script em scripts/ (e2e, playwright)_

## `audit:confirmacao` → `scripts/diag-confirmacao-repetida.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `validate:acls-audio` → `scripts/validate-acls-audio.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `validate:audio-textos` → `scripts/diag-divergencia-textos-audio.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `validate:audio-duracao` → `scripts/valida-audio-vs-texto.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `validate:sem-ia` → `scripts/valida-sem-ia.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:contraste` → `scripts/valida-contraste.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:paleta` → `scripts/valida-paleta.cjs`

- **PROMETE:** que nenhuma cor hexadecimal NOVA entre em `components/` ou `app/` fora do design system. Arquivo novo nasce com zero hex; arquivo do legado tem um TETO congelado que só pode descer.
- **NÃO PROMETE:** que a cor usada seja a CERTA para o papel (um `critical` onde cabia `warning` passa), nem que o par frente/fundo seja legível — isso é do `e2e/contraste-renderizado.spec.ts`, que mede o que foi renderizado. Também não vê cor vinda de variável, de `rgba(...)` ou de string montada.
- **UNIVERSO:** todos os `.ts`/`.tsx` sob `components/` e `app/`, DERIVADOS do diretório (D-15: universo se deriva do artefato, nunca se lista). `design-system/` fica de fora por definição — é onde a paleta mora. ── O DEFEITO QUE ORIGINOU ────────────────────────────────────────────────── O usuário relatou quatro sintomas de interface — caixas em vez de barras, eletrólitos sem distinção visual, rail de Vasoativas apagado, módulos fora do padrão. O levantamento mostrou que os quatro têm UMA causa: o app tem um sistema de design (`design-system/tokens`, `ui-v2`, `FAIXA_DE_ENTRADA`) que a maior parte das telas não consulta. ⚠️ E O NÚMERO QUE IMPORTA NÃO É "QUANTAS CORES ERRADAS": é que **1.222 das 1.977 ocorrências JÁ SÃO CORES DA PALETA, copiadas em vez de importadas**. Não é divergência de gosto, é duplicação — a mesma classe do R-48 e da D-34, aplicada a cor: quando o tema mudar, muda num lugar e não nos outros. ── POR QUE TETO, E NÃO PROIBIÇÃO ─────────────────────────────────────────── Proibir hoje exigiria migrar 55 arquivos num commit — e migração grande em app clínico é exatamente o que não se faz por causa de uma trava. O teto por arquivo transforma a dívida num número que **só pode cair**, e cada bloco de convergência aperta o próprio teto (mesmo molde da D-35, das 24 traduções pendentes). O que a trava garante desde hoje: **a próxima tela nasce certa.**

## `test:padroes-ui` → `scripts/auditoria-padroes-ui.cjs`

- **PROMETE:** que o número de divergências de PADRÃO DE INTERAÇÃO não suba — caixa de digitação onde a decisão foi ter barra, campo numérico sem faixa declarada, módulo fora da UI v2 e decisão de gravidade sem "não sei — me guie". O teto de hoje (11) só desce.
- **NÃO PROMETE:** que as 11 pendências atuais sejam aceitáveis — elas são dívida congelada, e são a lista de trabalho do bloco de convergência de UI. Também não diz nada sobre COR: origem é `test:paleta`, legibilidade é o `contraste-renderizado`.
- **UNIVERSO:** todas as telas sob components/ (derivado do diretório) e todas as árvores de decisão compiladas; a flag de UI vem de `lib/ui-v2-flag.ts` e os módulos de `lib/modulos-canonicos.ts`. Auditoria de PADRÕES DE INTERFACE, módulo a módulo. O autor do app relatou, usando: "ainda tem módulos com padrões diferentes, com caixas para preenchimento onde deveria ter rolagem lateral, ainda tem módulos sem 'não sei me guie'". Padronizar sem medir é apostar. Este script varre TODAS as telas de módulo e responde, por módulo, o que está fora do padrão — para que a padronização seja uma lista finita, e não uma impressão. O QUE ELE MEDE -------------- 1. ENTRADA NUMÉRICA POR CAIXA. Campo de digitação livre onde a decisão foi ter barra deslizante ("só devemos ter as barras para seleção em todo o app, nada de caixas"). Caixa numérica em emergência é teclado abrindo, erro de digitação e um passo a mais com o paciente na frente. 2. FAIXA DE ENTRADA AUSENTE. Campo numérico sem faixa declarada volta a herdar os limites dos presets — o defeito que impedia registrar o paciente real. 3. UI v2. Módulo fora da interface nova tem cabeçalho, cartões e navegação diferentes dos demais. 4. CAMINHO GUIADO. Decisão de estabilidade/gravidade sem "não sei — me guie". Ele NÃO falha o build: é um mapa de trabalho. O que ele garante é que a lista exista por escrito, em vez de depender de alguém reparar tela por tela.

## `test:na-duvida` → `scripts/valida-na-duvida.cjs`

- **PROMETE:** que as 16 regras de "na dúvida" estejam nos nós certos, que cada uma diga a CONSEQUÊNCIA (e não só a direção), e que a regra aponte para o MESMO destino que o critério objetivo do nó — regra que contradiz o ramo é um dos dois errado.
- **NÃO PROMETE:** que a conduta esteja clinicamente certa (isso é das travas de cada módulo), nem cobre as saídas de dúvida em RAMO, que são outro bloco.
- **UNIVERSO:** as 17 árvores compiladas; a lista de regras vem de lib/na-duvida.ts lida do próprio arquivo, não redigitada aqui. ── POR QUE ISTO EXISTE ───────────────────────────────────────────────────── O levantamento classificou os 106 pontos de decisão do app e achou 38 de julgamento, dos quais 33 sem saída de dúvida. O critério de entrada é do autor e é mais afiado que "consequência do erro": ⚠️ ENTRA ONDE O DEFAULT SOB DÚVIDA É O LADO PERIGOSO. Quem hesita escolhe o caminho de menor resistência — "não há contraindicação", "a crise cessou", "a via aérea parece fácil" —, e em 16 nós esse caminho é o que machuca. Nesses, a dúvida JÁ DECIDE: não se abre ramo, escreve-se a regra. A regra vai no `summary`, que o app renderiza SEM precisar expandir — em `evidence` ela ficaria atrás do "Ver critérios (N)", que é onde o conteúdo morre (R-50).

## `test:via-aerea` → `scripts/valida-via-aerea-dominios.cjs`

- **PROMETE:** que a avaliação de via aérea difícil da ISR cubra os QUATRO domínios (laringoscopia, ventilação com máscara, extraglótico e acesso frontal do pescoço); que a saída de dúvida exista e leve ao guia; que o eFONA tenha PRECEDÊNCIA com a razão escrita na tela; que cada saída diga em que base concluiu; e que nenhum sinal seja perguntado duas vezes.
- **NÃO PROMETE:** que os preditores estejam clinicamente completos — os cinco fatores de eFONA vêm de fonte SECUNDÁRIA (SHORT/SMART), o que está dito na própria tela. Também não confere as doses da ISR (test:isr).
- **UNIVERSO:** a árvore da ISR compilada e lib/via-aerea-quatro-dominios.ts. ── OS DEFEITOS QUE ORIGINARAM ────────────────────────────────────────────── 1. LEMON e MOANS FUNDIDOS numa pergunta só, com duas saídas. O nó escrevia a distinção na evidência e a apagava ao perguntar — e os planos de resgate são diferentes. 2. DEFAULT SOB DÚVIDA NO LADO PERIGOSO: quem hesita responde "não" e induz sem plano de resgate. Caso puro do critério de entrada do bloco. 3. O APP PREPARAVA O RESGATE SEM AVALIAR O RESGATE: mandava abrir o kit de cricotireoidostomia e preparar máscara laríngea, e nunca perguntava se aquele pescoço é abordável nem se o dispositivo é viável.

## `test:ci-trombolise` → `scripts/valida-contraindicacao-trombolise.cjs`

- **PROMETE:** que os três nós de contraindicação (AVC, SCA, TEP) tenham saída de dúvida com a lista completa; que as JANELAS PRÓPRIAS de cada indicação não se contaminem entre si; que os dois itens comuns venham da CONSTANTE COMPARTILHADA e não de cópia; que a exceção da SCA traga a razão; e que a divergência do TEP nomeie as duas fontes.
- **NÃO PROMETE:** que as listas estejam completas segundo a diretriz primária — as fontes abertas foram bula, tabela adaptada e revisão (R-52), o que está declarado na tela. Não confere doses (test:coronarias, test:avc, test:tep).
- **UNIVERSO:** as três árvores compiladas e lib/contraindicacao-trombolise.ts. ── O ACHADO QUE DESENHOU ISTO ────────────────────────────────────────────── A tentação era fonte única com acréscimos: as três listas se parecem. O autor mandou conferir JANELA A JANELA antes, e das quatro que pareciam núcleo, DUAS eram: cirurgia intracraniana/intraespinhal → 3 MESES no AVC, 2 MESES na SCA AVC isquêmico recente → 3 meses no AVC; 3 meses na SCA COM EXCEÇÃO de 4,5 h; 3 (StatPearls) × 6 (ESC) no TEP pressão arterial → ALVO TRATÁVEL no AVC; relativa nas outras duas dissecção de aorta → absoluta no AVC e na SCA; não consta no TEP Fundir teria criado limiar errado em duas das três telas. Esta trava existe para que a fusão não volte por descuido.

## `test:prazo-visivel` → `scripts/valida-prazo-visivel.cjs`

- **PROMETE:** que nenhum alerta com PRAZO ou PRECEDÊNCIA viva SÓ num campo RECOLHIDO — `evidence` (o "Ver critérios (N)" dos nós de decisão) ou `porque` (o "por quê" dos passos de ação, criado em 2026-08-18). ⚠️ `porque` ENTROU AQUI NO MESMO COMMIT EM QUE NASCEU. Um campo recolhido que nenhuma trava conhece é conteúdo sem guarda desde o primeiro dia — e este nasceu justamente para receber texto que sai da tela, o que o torna o destino mais provável de um prazo em fuga.
- **NÃO PROMETE:** que todo ⚠️ esteja visível. A maioria não precisa estar, e exigir isso faria alguém TIRAR O ⚠️ para passar (R-55). Também não diz nada sobre o conteúdo clínico do alerta.
- **UNIVERSO:** as 17 árvores compiladas, derivadas do diretório. ── O DEFEITO QUE ORIGINOU (2026-08-17) ───────────────────────────────────── O `coronary/ecg` revelou que `evidence` renderiza RECOLHIDO, e a pergunta seguinte foi: quanto do que esta auditoria produziu está atrás desse toque? Medido: 15% do conteúdo das árvores e 18% dos alertas ⚠️ — 39 itens. A classificação em três colunas mostrou que a maioria está no lugar certo: MUDA CONDUTA AGORA (prazo, precedência, contraindicação) → tem de subir QUALIFICA A CONDUTA (por que a dose é essa)               → fica, e é certo ENSINA (mecanismo, fisiopatologia)                        → fica, e é para isso que serve ⚠️ E A CLASSE DO PRAZO É A ÚNICA COM CUSTO IRREVERSÍVEL: quem não viu perdeu a janela, e não há como recuperar depois. Por isso a trava é ESTREITA — pega prazo e precedência, e deixa em paz os 25 que estão certos onde estão.

## `test:sinonimos` → `scripts/valida-sinonimos.cjs`

- **PROMETE:** que o vocabulário de busca nasça COMPLETO e continue completo — todo módulo do hub tem sinônimos, nenhum termo é ambíguo entre módulos, e nenhum módulo se apoia só no próprio título.
- **NÃO PROMETE:** que os termos sejam os CERTOS. Nenhuma trava sabe como o médico digita sob pressão; isso é decisão de quem escreve.
- **UNIVERSO:** os ids derivados de `clinical-modules.ts`, não uma lista à mão (D-15) — módulo novo entra no radar sozinho e reprova até ser nomeado. ── O DEFEITO QUE ORIGINOU (2026-08-17) ───────────────────────────────────── Medido: NÃO EXISTE BUSCA no app. A conclusão foi que os sinônimos vêm antes dela, porque uma busca sobre os títulos já nasceria inútil — casaria "Engasgo (OVACE)" e não casaria "corpo estranho" nem "sufocamento". ⚠️ E O RISCO DESTE ARQUIVO É PRECISAMENTE O DE NASCER PELA METADE: dado sem consumidor apodrece calado. Trinta módulos hoje, e o trigésimo primeiro entra sem ninguém lembrar. É contra isso que a trava existe.

## `test:etiquetas` → `scripts/valida-etiquetas.cjs`

- **PROMETE:** que a etiqueta de área não volte a ser depósito — nenhuma etiqueta cobre uma fatia grande demais do app, todo módulo tem etiqueta declarada, e toda etiqueta usada tem cor própria no hub.
- **NÃO PROMETE:** que o nome seja o CERTO. Nenhuma trava sabe se "ARRITMIAS" lê melhor que "peri-parada" — isso é decisão de quem escreve.
- **UNIVERSO:** os ids derivados de `clinical-modules.ts` (D-15), não uma lista à mão. Módulo novo entra no radar sozinho. ── O DEFEITO QUE ORIGINOU (2026-08-17) ───────────────────────────────────── "ACLS" cobria 9 dos 30 módulos; as outras 21 áreas tinham 1 cada. Não era uma área entre outras — era o único agrupamento, e por isso recebeu tudo que tocava parada, inclusive o Engasgo (OVACE), que trata paciente CONSCIENTE. ⚠️ E O DEFEITO É REINCIDENTE POR CONSTRUÇÃO. `MODULE_AREA_LABELS` é um `Record` escrito à mão: quando o próximo módulo entrar, a etiqueta mais fácil de digitar será a que já existe. O TETO abaixo é o que impede isso — ele torna a acumulação uma falha de build, não uma escolha silenciosa.

## `test:leitura-fonte` → `scripts/valida-leitura-de-fonte.cjs`

- **PROMETE:** que nenhuma trava leia um arquivo-fonte `.ts`/`.tsx` COM comentários para medir o que a tela mostra. Toda leitura passa por `lib/fonte.cjs` — `lerFonte` quando se mede o que o médico lê, `lerCru` quando o comentário É o objeto.
- **NÃO PROMETE:** que o termo procurado seja o certo, nem que a busca esteja bem escrita. Só que o comentário não conte como se fosse tela. Também não impede `lerCru` — ele é legítimo quando o comentário É o objeto, e a escolha entre os dois continua sendo de quem escreve.
- **UNIVERSO:** todos os `scripts/*.cjs`, menos o próprio arquivo — que se exclui porque o padrão procurado está escrito dentro dele (R-71, forma do universo). ── O DEFEITO QUE ORIGINOU (2026-08-18) ──────────────────────────────────── A conferência nova do tranexâmico em `valida-politrauma.cjs` passou VERDE com a mutação aplicada — a linha havia sido removida da tela, e o que satisfazia a busca era o comentário escrito ali para explicar a própria conferência. ⚠️ E `valida-paleta.cjs` JÁ DOCUMENTAVA esse defeito, com todas as letras, há meses: «COMENTÁRIO NÃO PINTA NADA». Documentar não impediu repetir — é o R-92 numa forma nova: documentação que ninguém é obrigado a consultar tem o mesmo efeito de um aviso que não reprova. Por isso a correção é ESTA TRAVA, e não um terceiro parágrafo dizendo a mesma coisa.

## `test:secao-pcr` → `scripts/valida-secao-pcr.cjs`

- **PROMETE:** que a seção «Dentro do módulo PCR Adulto» — a lista que DESENHA a tela, em `constants/secao-do-pcr.ts` — seja exatamente o grupo "Reanimação" de `constants/module-groups.ts` menos o herói; que todo id exista de fato; e que nenhum card da seção deixe de aparecer no hub (seção agrupa, não some).
- **NÃO PROMETE:** a ordem dentro da seção (é a do encontro, decisão de produto), nem o desenho do card. A ordem cenário→consulta DENTRO da seção é medida por `e2e/ordem-do-hub`, na tela renderizada.
- **UNIVERSO:** `constants/secao-do-pcr.ts` (a lista que desenha), o grupo "Reanimação" de `constants/module-groups.ts` (a lista de cobertura) e os ids de `clinical-modules.ts` — os três derivados da fonte, para que módulo novo entre sem ninguém lembrar. ── POR QUE DUAS LISTAS, E NÃO UMA ───────────────────────────────────────── `module-groups.ts` declara no cabeçalho que serve a COBERTURA E VALIDAÇÃO e NÃO desenha tela. Em 2026-08-17 alguém o usou como se desenhasse e relatou uma correção que não chegou a nenhum pixel. Ler dali para montar a seção repetiria o erro invertido. Então a tela tem fonte própria — e a coerência entre as duas é TRAVADA aqui em vez de combinada por comentário (R-92: o que não reprova não impede).

## `test:campos-do-no` → `scripts/valida-campos-do-no.cjs`

- **PROMETE:** que todo campo de TEXTO que um nó de árvore pode ter esteja classificado — VISÍVEL (a tela mostra sem toque) ou RECOLHIDO (atrás de um toque) — e que os campos recolhidos sejam vigiados por `test:prazo-visivel`.
- **NÃO PROMETE:** que o conteúdo esteja no campo certo. Isso é decisão clínica. Só que nenhum campo exista sem que alguém saiba que ele existe.
- **UNIVERSO:** o tipo `DecisionTreeNode` em core/decision-tree/types.ts e as árvores compiladas — os campos são derivados dos DOIS, para que um campo declarado e nunca usado, ou usado e nunca declarado, apareça. ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-18) ───────────────────────────────── `porque` nasceu neste dia, para receber o texto que sai da tela dos passos de ação. Antes de escrevê-lo, o levantamento perguntou quais travas leem nós: 17 derivam do objeto (`textosDoNo`) → enxergam campo novo sozinhas 7 leem CAMPO A CAMPO              → cegas para campo novo E entre as sete estava `valida-prazo-visivel` — a trava que existe justamente para impedir que um PRAZO fique atrás de um toque. Um campo novo feito para esconder texto, invisível para a trava que vigia texto escondido: o pior par possível, e ele só apareceu porque o campo foi levantado antes de ser escrito. Esta trava existe para que o PRÓXIMO campo não dependa de alguém lembrar.

## `test:timer-badge` → `scripts/valida-timer-badge-largura.cjs`

- **PROMETE:** que `timerTopRow` (rótulo do cronômetro + chips de choque/epinefrina) tenha largura própria dentro do badge — não encolhida ao conteúdo.
- **NÃO PROMETE:** nenhuma outra propriedade do badge, nem o alinhamento vertical.
- **UNIVERSO:** components/protocol-screen/acls-protocol-screen.tsx (timerTopRow) e components/protocol-screen/protocol-screen-styles.ts (timerBadge, o pai). ── O DEFEITO QUE ORIGINOU (2026-08-18) ───────────────────────────────────── `timerBadge` (protocol-screen-styles.ts) tem `alignItems: "center"` — usado para centralizar o valor grande ("43s"). Mas o mesmo alignItems faz TODO filho direto do badge encolher para a largura do CONTEÚDO em vez de esticar para a largura do badge. `timerTopRow`, que por dentro separa rótulo e chips com `justify-content: space-between`, é filho direto — e sem largura própria o space-between não tem o que distribuir: rótulo e chip ficam ENCOSTADOS, centralizados no meio do badge. Medido: a linha caía de 298 px para 165 px, e "Epi ×1" tocava/sobrepunha a última palavra de "PRÓXIMO RITMO". A CORREÇÃO é `alignSelf: "stretch"` só em `timerTopRow` — devolve a largura cheia a ESTE filho, sem tirar a centralização dos outros (o valor, a troca de compressor) que dependem do `alignItems: center` do badge.

## `test:voltar-fato` → `scripts/valida-voltar-preserva-fato.cjs`

- **PROMETE:** que VOLTAR mova o CURSOR e nunca o FATO — medicação administrada, choque aplicado, log do caso, linha do tempo e RELÓGIO sobrevivem ao voltar; e que TODO campo de `ACLSState` esteja classificado como cursor ou fato.
- **NÃO PROMETE:** que a classificação esteja clinicamente certa. Ela é decisão do médico e está escrita em `acls/estado-cursor-e-fato.ts`; aqui só se exige que exista, que cubra o tipo inteiro e que o motor a respeite.
- **UNIVERSO:** o tipo `ACLSState` (acls/reducer.ts), a classificação (acls/estado-cursor-e-fato.ts) e o motor executado de verdade (engine.ts). ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-18) ───────────────────────────────── `goBack` restaurava o instantâneo inteiro. Medido no motor real: dose 1 → 0, cronômetro do ciclo 1 → 0 (DESAPARECIA), log 6 → 4, linha do tempo 15 → 9. ⚠️ UM DEFEITO COM TRÊS PORTAS — botão do cabeçalho, etapa da tela e comando de voz chamam o MESMO `goBack`. Esta trava prova o conserto no motor E confere que as portas da tela continuam convergindo para ele; consertar só uma porta criaria duas com resultados diferentes.

## `test:atb-renal` → `scripts/valida-antibiotico-renal.cjs`

- **PROMETE:** que os nove esquemas empíricos de antibiótico digam o que fazer com a função renal — o PISO em todos, o PONTEIRO nos que citam os três fármacos cobertos —, e que o ataque de vancomicina tenha FONTE ÚNICA de cálculo.
- **NÃO PROMETE:** que os esquemas estejam clinicamente certos, nem que a calculadora cubra os fármacos certos — isso é PD-6, decidido e declarado.
- **UNIVERSO:** os nós de esquema derivados da árvore da sepse pelo prefixo `atb_`, não uma lista à mão (D-15). Esquema novo entra no radar sozinho. ── OS DOIS DEFEITOS QUE ORIGINARAM (2026-08-17) ──────────────────────────── 1 · Os nove nós prescreviam REGIME COMPLETO (dose E intervalo) e nenhum mencionava função renal. Varrido na árvore: `ClCr`, `TFG`, `ajuste renal`, `creatinina`, `hemodiálise` — nenhum. E a Sepse não sabia que a calculadora existia. 2 · ⚠️ O `{vancoLoad}` DIVERGIA DA CALCULADORA. Aqui era `27.5 * peso` sem teto; lá, 25–30 mg/kg com máximo de 3 g. A partir de 110 kg o lado que PRESCREVE ultrapassava o teto — 3.575 mg contra 3.000 mg a 130 kg. R-12 com cálculo é pior que com texto: dois lugares divergem em silêncio, e um deles prescreve. ⚠️ E O PISO É INVERTIDO PELO TEMPO, NÃO PELA FUNÇÃO RENAL. O texto óbvio ("ajuste se a função renal estiver ruim") contraria a evidência no cenário mais comum deste módulo. As conferências abaixo vigiam a direção certa — e a de nº 3 existe para impedir que alguém "corrija" o piso para a versão intuitiva e errada.

## `test:ira` → `scripts/valida-ira.cjs`

- **PROMETE:** que o módulo de injúria renal aguda mantenha as decisões de ESCOPO e de DESENHO que o autorizaram — os dois eixos do KDIGO com o contraste meta × critério, a obstrução PRIMEIRA na exclusão, as perguntas pelo observável (nunca pela classificação), a saída do "não sei a base" com conteúdo próprio, e a fronteira da diálise COM alternativa.
- **NÃO PROMETE:** que os números clínicos estejam certos — isso é a fonte (KDIGO 2012, aberta em sessão). Nem que o módulo cubra nefrologia: ele declara três exclusões.
- **UNIVERSO:** a árvore compilada `ira-decision-tree.ts` e as constantes de `lib/injuria-renal-aguda.ts`, derivadas do próprio arquivo. ── POR QUE ESTA TRAVA É DIFERENTE DAS OUTRAS ─────────────────────────────── ⚠️ NÃO HÁ DEFEITO DE ORIGEM. O módulo é NOVO — foi o primeiro escrito nesta auditoria —, então não existe mutação que "devolva" um defeito histórico. O que ela vigia são as DECISÕES QUE PODERIAM SER DESFEITAS por quem revisar o módulo com boa intenção e sem o contexto: transformar as perguntas em classificação (porque parece mais organizado), tirar o contraste da diurese (porque parece redundante com os 30 nós que já usam o número), mover a obstrução para depois (porque a ordem "pré-renal, renal, pós-renal" é a dos livros), ou apagar a alternativa ao nefrologista (porque "é obvio que se transfere"). Cada uma dessas quatro tem mutação abaixo.

## `test:pressuposicao` → `scripts/valida-pressuposicao.cjs`

- **PROMETE:** que nenhuma tela fale de um achado do paciente — sintoma, sinal, valor ou contexto — como fato estabelecido, NEM descreva um sujeito clínico com achados pendurados nele (vinheta), se existir um caminho do início até ela em que ninguém perguntou aquele achado.
- **NÃO PROMETE:** reconhecer toda forma de afirmar. A detecção é por FORMA da frase (posse, estado declarado, valor tratado como em mãos), e forma nova passa batido até alguém ler. Também não julga se a pergunta que captura o achado é boa — só que ela existe no caminho.
- **UNIVERSO:** as árvores listadas em ARVORES, compiladas; hoje, o módulo renal. Cada árvore entra aqui quando migra para o formato novo. ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-20) ───────────────────────────────── O médico leu no fluxo uma frase que tratava "falta de ar" como fato — e nada no caminho até ali tinha perguntado isso. O app AFIRMAVA o que devia PERGUNTAR. Não era instância: era classe. ── A MÁQUINA É A MESMA DA TRAVA DA CALCULADORA ──────────────────────────── Alcançabilidade no grafo. Para cada achado, o conjunto de nós que o PERGUNTAM; para cada nó que o MENCIONA, uma busca em largura de `entry` até ele que não passe por nenhum nó de captura. Se esse caminho existe, existe um atendimento real em que a tela fala de algo que ninguém mediu. ── ⚠️ E É A CLASSIFICAÇÃO QUE TORNA A TRAVA UTILIZÁVEL ──────────────────── A primeira varredura achou 58 ocorrências candidatas no renal. Reprovar as 58 seria inútil: 46 não são defeito, e linter que grita lobo é linter que ninguém obedece. As quatro naturezas entram aqui como DEFINIÇÃO: ORDEM     "colha gasometria", "meça a diurese"     → manda fazer, não afirma CRITÉRIO  "conta como evidência de DRC:", "as seis:" → ensina o que contaria GERAL     "a creatinina sobe tarde", "costuma dar"  → fala da doença AFIRMAÇÃO "o edema dele", "com a glicemia baixa"    → ❌ fala DESTE paciente VINHETA   "um paciente lúcido, comendo e sem…"      → ❌ descreve ALGUÉM A quarta e a quinta reprovam. ── ⚠️ POR QUE A VINHETA ENTROU DEPOIS (2026-08-20) ──────────────────────── A primeira versão da trava parava na quarta natureza, e eu mesmo registrei o buraco: a frase que originou tudo — "creatinina de 4 num paciente lúcido, comendo e sem dispneia costuma ser crônica" — NÃO afirma nada sobre ninguém em particular, e passava limpo. O médico fechou o buraco com a distinção que faltava: **enunciado geral fala de VARIÁVEIS e da doença; vinheta descreve ALGUÉM.** "A creatinina sobe tarde" é variável. "Um paciente anúrico há 12 horas já é estágio 3" é gente — e gente inventada, com achados que ninguém colheu, lida como se fosse o paciente que está na maca. É a forma mais fácil de contrabandear pressuposição para dentro de um texto que parece didático. ⚠️ O RISCO DESTE INSTRUMENTO É O INVERSO DO USUAL: ele erra para MENOS. A classificação é por forma da frase, e forma nova de afirmar passa batido. Ele não substitui a leitura — corta o custo dela.

## `test:tamanho-de-item` → `scripts/valida-tamanho-de-item.cjs`

- **PROMETE:** que nenhuma tela de CONDUTA passe de 7 ações visíveis, e que nenhum item de ação passe de 200 caracteres — nas árvores listadas em ARVORES.
- **NÃO PROMETE:** que o item caiba na tela do aparelho (isso é medição de layout, e o teto de caracteres é proxy dela), nem que o texto seja bom. Também não julga os campos RECOLHIDOS (`porque`, `evidence`): eles são contados e exibidos, sem reprovar — quem lê o porquê já parou para ler.
- **UNIVERSO:** as árvores de ARVORES, compiladas. Hoje o módulo renal; cada uma entra quando migra para o formato novo. ── ⚠️ POR QUE ESTA TRAVA NASCEU TARDE (2026-08-20) ──────────────────────── A §7.4 define o limite desde que a arquitetura-mãe foi escrita, e **ele nunca existiu como trava**. Os números que eu reportei no bloco das 6 — "0 itens acima de 200, maior 125" — vieram de um crawler que eu escrevi na sessão e que morreu com ela. Número de sessão apresentado ao lado de critério de aceite: quem lê não distingue, e eu não distingui. ── ⚠️ PISO DE UNIVERSO ──────────────────────────────────────────────────── Se o universo vier menor que o esperado, isto NÃO é "não há item grande" — é "não consegui olhar", e reprova. É a lição das três travas que passaram verde com o universo vazio nesta mesma varredura.

## `test:forca-da-afirmacao` → `scripts/valida-forca-da-afirmacao.cjs`

- **PROMETE:** que todo nó de CONDUTA das árvores auditadas declare `procedencia` com `forca`, e que cada força carregue o que ela obriga — classe/grau na recomendação formal, tipo de documento na prática aceita, lacuna de evidência no mecanismo fisiológico. Nó sem procedência só passa se estiver na lista de PENDÊNCIAS DECLARADAS, com motivo.
- **NÃO PROMETE:** que a força esteja CERTA. Nenhum script julga se uma conduta é recomendação formal ou plausibilidade — isso é leitura de fonte, e é do médico. A trava garante que alguém DECLAROU, e que o que se declara aparece na tela.
- **UNIVERSO:** as árvores de ARVORES, compiladas, com piso no retrato. ── ⚠️ POR QUE A PENDÊNCIA É DECLARADA, E NÃO SILENCIOSA ─────────────────── A ordem do autor foi explícita: "não invente a força de nenhuma conduta; onde não estiver claro, marque como pendência e PARE — preencher por suposição é o mesmo defeito com nome novo". Uma trava que aceitasse nó sem `procedencia` em silêncio deixaria a maior parte do módulo sem classificação e sem ninguém saber. Aqui, o que falta tem nome, motivo e sai no relatório.

## `test:aviso-auditoria` → `scripts/valida-aviso-de-auditoria.cjs`

- **PROMETE:** que, ENQUANTO houver módulo sem declaração de força por conduta, as duas telas onde o usuário COMPARA módulos (o hub e a página de produto) mostrem o aviso; e que a lista de módulos auditados não possa "adiantar" — ela é conferida contra o instrumento que realmente audita.
- **NÃO PROMETE:** que o aviso esteja legível, nem que o usuário o leia. Isso é medição de layout e de comportamento, e nenhuma das duas é feita aqui.
- **UNIVERSO:** os módulos clínicos declarados no app, com piso no retrato. ── ⚠️ POR QUE ISTO É TRAVA E NÃO OBSERVAÇÃO ─────────────────────────────── A assimetria (1 módulo com selo, 30 sem) é do tipo que NINGUÉM NOTA: ela não quebra tela, não falha teste, não aparece em relatório. E ela mente para o lado perigoso — quem compara lê "sem selo" como "recomendação mais fraca", quando o que ela significa é "ainda não auditado". É a mesma regra do piso de universo, agora virada para o usuário: um "não medi" apresentado sem etiqueta é lido como "medi e não achei". ── ⚠️ E POR QUE ELA SE DESARMA SOZINHA ──────────────────────────────────── Quando `MODULOS_COM_FORCA_DECLARADA` cobrir todos os módulos, o aviso deixa de ser exigido — e passa a ser exigida a REMOÇÃO dele, porque aviso que sobrevive ao seu motivo vira ruído e ensina a ignorar avisos.

## `test:imagem-clinica` → `scripts/valida-imagem-clinica.cjs`

- **PROMETE:** que toda imagem em `assets/clinico/` tenha entrada em `auditoria/imagens-clinicas.json` com fonte, procedência, licença e força; e que nenhuma entrada aponte para arquivo inexistente.
- **NÃO PROMETE:** que a imagem seja a certa, nem que a licença seja válida — ler licença é trabalho humano. A trava garante que alguém DECLAROU.
- **UNIVERSO:** hoje ZERO imagens. E é por isso que ela é FECHADA POR PADRÃO. ── ⚠️ POR QUE ELA NÃO DIZ "TUDO CERTO" ──────────────────────────────────── Um instrumento com universo zero que imprime "✅ nenhuma irregularidade" é o falso verde que este projeto já pagou três vezes (ver `scripts/lib/universo.cjs`). Aqui o universo zero é o estado NORMAL — não há imagem clínica no app — e a trava diz exatamente isso: "nada a conferir", não "está conforme". Ela existe para reprovar a PRIMEIRA imagem que entrar sem declaração. ── ⚠️ E POR QUE ELA NÃO CONVERTE NADA ───────────────────────────────────── A outra metade da AM-5 — nunca vetorizar imagem clínica real — não é verificável por script: nenhum programa distingue um SVG desenhado à mão de um SVG traçado a partir de uma foto. Isso fica como REGRA ESCRITA e revisão humana, declarado aqui para que a ausência não passe por cobertura.

## `test:lib-consumida` → `scripts/valida-lib-consumida.cjs`

- **PROMETE:** que nenhuma constante de conteúdo clínico de `lib/*.ts` fique SEM consumidor — porque a segunda redação que ninguém lê é a que pode divergir da primeira em silêncio.
- **NÃO PROMETE:** que a constante consumida CHEGUE à tela — isso depende do campo em que ela é usada (`evidence` recolhe a partir do 3º item), e é a outra metade do problema, coberta por `valida-prazo-visivel` e pelas travas de módulo. Nem que o texto esteja clinicamente certo.
- **UNIVERSO:** `lib/*.ts` derivado do diretório (não uma lista à mão), e todo `.ts`/`.tsx` do app como possíveis consumidores. ── O DEFEITO QUE ORIGINOU, E A HIPÓTESE QUE ERA FALSA (2026-08-17) ───────── A varredura do item 13 achou 10 constantes de `lib/` sem NENHUM consumidor, e a hipótese era "conteúdo clínico invisível" — texto escrito, revisado, traduzido, e que nunca chegou ao médico. ⚠️ A HIPÓTESE ERA FALSA, e o resultado foi ZERO DE DEZ. Verificadas uma a uma contra o que já está na tela: · 5 eram SEGUNDA REDAÇÃO de conteúdo que já chega por outra via — a advertência da atropina em bloqueio infranodal já está no nó da bradicardia; a procedência dos alvos do TCE já está no módulo; as faixas da dobutamina já aparecem com a bula; · 4 eram infraestrutura (locale, preços, flag de UI, sessão); · 1 era ESTRUTURA — `[...CAUSAS_5H, ...CAUSAS_5T]`, com as duas partes consumidas separadamente. Nenhuma era conteúdo perdido. **O enquadramento certo da classe é: fonte única que virou fonte DUPLA, e a segunda morreu.** ── POR QUE ISSO MERECE TRAVA, SE NADA ESTAVA PERDIDO ────────────────────── ⚠️ PORQUE A SEGUNDA REDAÇÃO PODE DIVERGIR DA PRIMEIRA — e ninguém percebe, porque uma delas não é lida por ninguém. O app tem o caso provado: a dose de ataque de vancomicina vivia em dois lugares, a calculadora aplicava o teto de 3 g e a sepse não. A 130 kg um dizia 3.000 mg e o outro 3.575 — e o que PRESCREVIA era o errado. A diferença é que lá as duas eram consumidas; aqui uma está dormindo, esperando alguém a "reativar" numa revisão futura sem saber que ela ficou para trás. A trava força a decisão no momento em que o autor ainda sabe qual é a fonte: ou consome, ou apaga com a razão escrita.

## `test:vasoativos` → `scripts/valida-vasoativos.cjs`

- **PROMETE:** o preparo de cada vasoativo é derivado de UMA fonte (apresentação, ampolas e diluente do mesmo objeto) e a apresentação tem bula anotada ao lado.
- **NÃO PROMETE:** que as indicações e as faixas de dose estejam certas — confere montagem e procedência, não escolha de droga.
- **UNIVERSO:** o motor de vasoativos e as telas que o consomem. Drogas vasoativas: o atalho tem de descrever a bolsa que o app calcula, e a ampola cadastrada tem de existir no Brasil. ── OS DOIS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ────────────────────────────── 1. A tela montava o preparo inicial de DUAS fontes: ampolas e diluente vinham da solução padrão, a apresentação vinha de `presentations[0]`. Na dopamina elas discordavam. O atalho "1600 mcg/mL" aparecia ACESO e a conta rodava com 816 mcg/mL — quase o dobro na taxa da bomba. Nada na tela denunciava, porque todos os números eram coerentes ENTRE SI: só não descreviam a mesma bolsa. 2. Essa dopamina tinha ampolas de 200 mg e 400 mg — o concentrado americano, 40 mg/mL. A ampola brasileira é 5 mg/mL × 10 mL = 50 mg. Fator 8. Quem preparasse com a ampola que tem na mão receberia uma taxa oito vezes menor que a pretendida: subdose de vasopressor em choque. O app já sabia a resposta certa — a tela de Farmacologia do ACLS traz "Dopamina — 50 mg / 10 mL". Duas telas, duas ampolas, mesma droga. ── O QUE ESTE SCRIPT COBRA ────────────────────────────────────────────────── A. Toda solução padrão: a concentração e o volume final ANUNCIADOS no rótulo do atalho batem com o que sai da aritmética do preparo. B. O estado inicial de cada droga reproduz exatamente a solução padrão que a tela exibe como ativa — o defeito 1 não pode voltar por outro caminho. C. Toda apresentação declara `fonte`. Sem fonte, ninguém conferiu a bula, e é assim que apresentação estrangeira entra: copiada de uma referência que não é a nossa. Este script FALHA O BUILD. Erro de bolsa é erro de dose.

## `test:preparos` → `scripts/valida-preparos.cjs`

- **PROMETE:** que nenhuma DILUIÇÃO de fármaco vasoativo seja declarada fora de `vasoactive-engine.ts`, que é o dono das soluções padrão. Sítio que precisa ensinar preparo aponta para lá ou consome de lá — não escreve o seu.
- **NÃO PROMETE:** que as diluições do DONO estejam certas — isso é `test:vasoativos`, que confere preparo contra rótulo DENTRO do módulo. Também não cobre diluição de fármaco não-vasoativo (antibiótico, anticonvulsivante), que tem donos próprios ainda não unificados.
- **UNIVERSO:** toda a árvore .ts/.tsx de conteúdo, fora do dono, scripts e i18n. ── POR QUE ESTA TRAVA EXISTE (R-46) ──────────────────────────────────────── A auditoria corrigiu a dopamina no lugar onde o número é CALCULADO (vasoactive-engine) e não onde ele é ENSINADO (o card de Farmacologia, que seguiu mandando preparar "200 mg em 250 mL" — a apresentação AMERICANA). Ninguém notou porque `test:vasoativos` vigiava o dono, e o dono estava certo. A varredura que encontrou isso achou o mesmo defeito na dobutamina: o EAP ensinava 1000 mcg/mL, uma concentração que NÃO EXISTE na tabela do dono (2000 e 4000). Programar a bomba pela tabela errada erra por fator 2 ou 4. `test:vasoativos` olha para DENTRO. Esta olha para FORA.

## `test:farmacos`

_não executa script em scripts/ (e2e, playwright)_

## `test:causas` → `scripts/valida-causas-reversiveis.cjs`

- **PROMETE:** que `lib/causas-reversiveis.ts` (consumida pelo card da AESP em Ritmos de Parada) tenha EXATAMENTE os mesmos nomes, na mesma ordem, do módulo dono; e que cada causa do dono tenha intervenção específica.
- **NÃO PROMETE:** que os nomes ou as intervenções estejam clinicamente certos — a conferência é de SINCRONIA e de PRESENÇA, não de fonte.
- **UNIVERSO:** os dois arquivos. ── POR QUE ESTA TRAVA EXISTE ─────────────────────────────────────────────── A lib foi criada copiando os dez nomes À MÃO do módulo dono. Conferido por execução: nasceu sincronizada. Mas copiar à mão é como o app acumulou boa parte dos defeitos desta auditoria, e a garantia não é o estado de hoje — é o que impede a 11ª causa de nascer só de um lado. Mesmo argumento que criou lib/atropina.ts ANTES do segundo sítio.

## `test:metas-pos-parada`

_não executa script em scripts/ (e2e, playwright)_

## `test:ovace`

_não executa script em scripts/ (e2e, playwright)_

## `test:gestacao`

_não executa script em scripts/ (e2e, playwright)_

## `test:coronarias`

_não executa script em scripts/ (e2e, playwright)_

## `test:avc`

_não executa script em scripts/ (e2e, playwright)_

## `test:tep`

_não executa script em scripts/ (e2e, playwright)_

## `test:choque`

_não executa script em scripts/ (e2e, playwright)_

## `test:politrauma`

_não executa script em scripts/ (e2e, playwright)_

## `test:tce`

_não executa script em scripts/ (e2e, playwright)_

## `test:abdome`

_não executa script em scripts/ (e2e, playwright)_

## `test:intoxicacoes`

_não executa script em scripts/ (e2e, playwright)_

## `test:cad`

_não executa script em scripts/ (e2e, playwright)_

## `test:eclampsia`

_não executa script em scripts/ (e2e, playwright)_

## `test:convulsoes`

_não executa script em scripts/ (e2e, playwright)_

## `test:eclampsia-crise` → `scripts/valida-eclampsia-na-crise.cjs`

- **PROMETE:** que os DOIS FATOS QUE MUDAM CONDUTA na crise da gestante e da puérpera estejam presentes nos QUATRO estágios do fluxo de Convulsões — `estabilizacao`, `primeira_linha`, `terceira_linha` e `pos_ictal`: (a) gestante **OU PUÉRPERA**, porque é a puérpera que escapa; (b) o benzodiazepínico ABORTA e o magnésio TRATA A CAUSA.
- **NÃO PROMETE:** que o TEXTO seja o mesmo nos quatro, nem que seja longo. ⚠️ Esta distinção é o ponto inteiro da trava: ENCURTAR é permitido, ESVAZIAR não é. Também não promete nada sobre o módulo de Pré-eclâmpsia — ele é o dono da conduta (R-12); aqui só se confere que o fluxo de Convulsões não perde o gatilho.
- **UNIVERSO:** os quatro nós nomeados de `seizure-decision-tree.ts`, compilado por `tsc` e lido do artefato — o texto que a tela recebe, não o literal do fonte (R-82). ── A DECISÃO QUE ELA PROTEGE, NÃO O DEFEITO QUE ELA CORRIGE (R-80) ───────── O aviso da eclâmpsia vivia INTEIRO nos quatro nós: 964 caracteres × 4. Uma varredura de repetição mediu isso e quase propôs cortá-lo — a medição estava certa e a conclusão seria errada, porque não são quatro cópias: **é o mesmo erro possível em quatro estágios**, e o pior deles é o pós-ictal, quando o paciente já não convulsiona e a pessoa já não está grávida. A saída foi o texto completo UMA vez (na estabilização, onde a decisão do magnésio se abre) e o gatilho nos outros três. ⚠️ E gatilho é onde o R-50 mora: encurtar aviso clínico é como se esvazia um aviso sem que ninguém veja. Esta trava é a fronteira — os dois fatos, sempre; o resto, livre. ── POR QUE OS DOIS FATOS, E NÃO OUTROS ──────────────────────────────────── (a) sem "puérpera", o aviso não pega o cenário que mais escapa — a eclâmpsia pós-parto tardia está descrita além das 48 h, até semanas depois do parto. (b) sem os dois papéis, alguém troca o benzodiazepínico pelo magnésio e deixa de abortar uma crise ativa. É o erro que a própria constante foi escrita para impedir, e ele reaparece a cada encurtamento descuidado.

## `test:eap`

_não executa script em scripts/ (e2e, playwright)_

## `test:traducao-composta`

_não executa script em scripts/ (e2e, playwright)_

## `test:dobutamina` → `scripts/valida-dobutamina.cjs`

- **PROMETE:** que nenhum sítio escreva faixa de dobutamina própria — inclusive quando o nome da droga está no `title:` de um bloco e a dose numa linha adiante (R-10); que os textos do regime venham de lib/dobutamina.ts; que as três ressalvas do teto estejam na constante; e que a força FRACA da recomendação de 2026 esteja escrita onde a indicação aparece.
- **NÃO PROMETE:** que as doses estejam clinicamente certas — o lastro é a bula (dose) e a SSC 2026 (indicação), e a trava confere coerência interna e procedência, não julgamento. Também não cobre as demais drogas vasoativas. E não pega nome e dose separados por MAIS de um bloco `title:`/`lines:` — só o bloco imediatamente ativo.
- **UNIVERSO:** toda a árvore de conteúdo (.ts/.tsx), fora scripts, e2e, locales e i18n. ── O DEFEITO ─────────────────────────────────────────────────────────────── Seis afirmações de dose para a mesma droga, com a SEPSE limitando abaixo da própria fonte de três jeitos diferentes (nenhum teto, 5 e 10) enquanto a bula registra que até 20 são frequentemente necessários. ── DUAS FONTES QUE NÃO PODEM SER FUNDIDAS ────────────────────────────────── A DOSE vem da BULA; a INDICAÇÃO vem da SSC 2026, que NÃO especifica dose. Uma citação única cobrindo as duas seria citar diretriz para o que ela não diz — o erro do ART (D-6). A trava confere que as duas atribuições existem e estão separadas.

## `test:escopo-pediatrico` → `scripts/valida-escopo-pediatrico.cjs`

- **PROMETE:** que nenhum arquivo de conteúdo VIVO introduza dose/conduta pediátrica nova (padrão: número + mg/kg, mcg/kg ou mL/kg perto de "criança"/"pediátric"/"infantil"/"lactente"/"recém-nascido"; ou EpiPen Jr, dispositivo exclusivamente pediátrico) sem que a infraestrutura pediátrica (peso, faixas de sinais vitais, calculadoras próprias) exista.
- **NÃO PROMETE:** que o app tenha ou não deva ter escopo pediátrico algum dia — só que, enquanto não tiver a infraestrutura, nenhum fragmento avulso novo nasce. Não julga se um achado que dispare esta trava é clinicamente correto — só que ele não pertence aqui sem a trilha por trás.
- **UNIVERSO:** toda a árvore de conteúdo (.ts/.tsx) fora scripts, e2e, locales e i18n — EXCETO os três engines mortos (D-22, ainda não resolvida) e `lib/escopo-pediatrico.ts` (a fonte do próprio ponteiro). ── O DEFEITO ─────────────────────────────────────────────────────────────── Sete fragmentos pediátricos avulsos (Anafilaxia 5, ISR 1, Convulsões 1 — mais um oitavo achado só ao ESCREVER esta trava, em `sedation-engine.ts`) chegaram ao app do mesmo jeito: uma fonte clínica citava as duas populações, e o número pediátrico foi copiado junto, sem virar trilha. PD-2 (`auditoria/DECISOES-DE-PRODUTO.md`) decidiu: população ADULTA, ausência DECLARADA (ponteiro `FORA_DE_ESCOPO_PEDIATRICO`), reversível — mas só com infraestrutura própria, não fragmento por fragmento outra vez.

## `test:alcancabilidade` → `scripts/valida-alcancabilidade.cjs`

- **PROMETE:** que todo arquivo de CONTEÚDO CLÍNICO seja alcançável a partir de uma rota real do app, nas DUAS classes de morte: (1) órfão de IMPORT — ninguém o importa; (2) órfão de RENDER — importado pelo catálogo (`clinical-modules.ts`), mas a tela decide por `protocolId` e devolve um componente que IGNORA o engine registrado. Todo arquivo morto conhecido precisa estar declarado em MORTOS_CONHECIDOS com a dívida que o cobre — morte silenciosa é o defeito.
- **NÃO PROMETE:** que o conteúdo alcançável esteja clinicamente certo, nem que todo NÓ de uma árvore alcançável seja alcançável (isso é `test:arvores`). Também não detecta função exportada e nunca chamada dentro de um arquivo vivo — a granularidade aqui é o ARQUIVO.
- **UNIVERSO:** grafo de imports a partir de `app/**` (rotas do expo-router), contra os arquivos de conteúdo clínico da RAIZ **e de `lib/`**. ── POR QUE ESTA TRAVA EXISTE ─────────────────────────────────────────────── A auditoria corrigiu conteúdo clínico DENTRO de `anafilaxia-engine.ts`, `eap-engine.ts` e `ventilation-engine.ts` — três vezes, ao longo de semanas — sem saber que a tela nunca os executa. ~13.000 linhas inalcançáveis, e o defeito só apareceu por acidente, ao tentar mostrar um número de cronômetro na tela. Um `grep` de "quem importa este arquivo?" NÃO teria pegado: os três SÃO importados, por `clinical-modules.ts`, que é alcançável. A morte deles é de RENDER, não de import — e é a classe que esconde volume, porque tudo parece conectado. Um quinto arquivo (`sepsis-antibiotic-engine.ts`, 364 linhas) era da primeira classe e passou despercebido pela varredura manual dos quatro. Foi encontrado por grep, não por leitura — R-29 outra vez.

## `test:vm` → `scripts/valida-ventilacao.cjs`

- **PROMETE:** o peso predito tem implementação ÚNICA (a constante 152.4 não aparece em nenhum outro arquivo), recusa sexo indeterminado, e os alvos do TCE vêm de lib/alvos-tce.ts.
- **NÃO PROMETE:** que os parâmetros ventilatórios estejam certos para cada cenário.
- **UNIVERSO:** árvore INTEIRA para a fonte única do PBW; lista fixa de 6 arquivos para os alvos do TCE. Ventilação: peso predito tem UMA fonte, e ela recusa o que não sabe. ── OS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ─────────────────────────────────── 1. DUAS implementações de PBW, discordando onde ninguém olha — no sexo AUSENTE. A árvore assumia HOMEM (`sexo === "feminino" ? 45,5 : 50`); o motor assumia MULHER (`/^m/i` falha em string vazia). Mesmo paciente, mesmo app: a 175 cm, PBW 70,6 × 66,1 kg → Vt 423 × 396 mL. As duas devolviam um número, nenhuma avisava. 2. O `/^m/i` do motor classificava **"Mulher" como masculino**, por testar a INICIAL. Não era hipótese: o campo é `TextInput` de valor livre, com os presets como botões de conveniência abaixo. 3. O portão do plano ventilatório era `!pbw || !scenario`. Com sexo em branco o PBW saía preenchido (pelo default feminino), então o app montava modo, Vt, FR, PEEP e FiO₂ enquanto declarava, na mesma tela, que faltava o sexo. ── POR QUE A TRAVA ÓBVIA PASSARIA VERDE ───────────────────────────────────── Comparar as duas fórmulas com sexo INFORMADO não pega nada: elas sempre concordaram aí. A divergência morava só na ausência. Por isso o caso "sexo ausente" é verificado EXPLICITAMENTE, e o esperado não é concordância de número — é RECUSA nos dois lados. Este script FALHA O BUILD. Vt errado é dose errada.

## `test:peso` → `scripts/valida-peso-origem.cjs`

- **PROMETE:** todo módulo com dose peso-dependente exibe a ressalva quando o peso é estimado, e a ressalva mede EFEITO e não grafia (R-10).
- **NÃO PROMETE:** que o peso informado esteja certo — só que a incerteza dele seja declarada onde a dose depende dela.
- **UNIVERSO:** os 9 módulos que recebem peso pelo contexto do paciente. Peso estimado: quem pergunta de onde veio o peso tem de usar a resposta. ── O DEFEITO QUE ORIGINOU ESTE SCRIPT ─────────────────────────────────────── `pesoOrigem` era perguntado em NOVE módulos e lido por NENHUM. Nove perguntas ao médico, em emergência, para um dado que nenhuma linha de código consumia — atrito puro no exato lugar onde o app promete reduzir atrito. E os nove calculam dose por peso: alteplase, tenecteplase, insulina, heparina, manitol, salina hipertônica, cristaloide, sedativos, bloqueadores. O erro do peso passa integralmente para a dose, e em vários há teto absoluto. ── O QUE ESTE SCRIPT COBRA ────────────────────────────────────────────────── A. Árvore que coleta `peso` também coleta `pesoOrigem`. Dose por peso sem saber a procedência do peso é dose sem ressalva possível. B. `pesoOrigem` só oferece valores do domínio fechado (estimado/real). C. O shell renderiza a ressalva — sem isso, os nove voltam a perguntar por nada. D. Os quatro módulos com TETO de dose repetem a ressalva na linha da dose. Este script FALHA O BUILD.

## `test:isr` → `scripts/valida-isr.cjs`

- **PROMETE:** que o derive do ISR, EXECUTADO, devolva as doses da publicação; que nenhum multiplicador esteja escrito à mão nele; que o import de MG_POR_KG não seja decorativo (provado por perturbação da fonte); e que o formatador mgPorKg() nunca seja interpolado dentro de frase traduzível.
- **NÃO PROMETE:** que a prosa esteja unificada. As linhas que citam dose dentro de frase que o usuário lê CONTINUAM duplicadas e vigiadas por trava — contrato vigiado, não fonte única (R-25). O universo do contrato ENCOLHEU com a D-14, não fechou: o cálculo virou fonte real, a prosa não pode virar.
- **UNIVERSO:** ISR e Sedoanalgesia para as doses; árvore INTEIRA para o teto da succinilcolina e para o veto do formatador. ISR: a dose do instável tem UMA fonte, e a via acordada é caminho, não menção. ── OS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ─────────────────────────────────── 1. A Sedoanalgesia dizia "ISR (paciente instável): 1,5–2 mg/kg" de cetamina — a faixa CHEIA de indução, rotulada como a do instável. O módulo de ISR, para o MESMO paciente, manda 1 mg/kg (0,5 no choque grave). Um mandava reduzir, o outro mandava dose plena, a um clique de distância. 2. O nó de via aérea difícil dizia "considerar intubação acordada" e seguia DIRETO para a indução: quem escolhesse a técnica acordada não tinha para onde ir. Primeiro achado da auditoria que não é número errado — é uma VIA CLÍNICA que o app não permitia percorrer. Também não existia a saída "não intubar agora". ── O QUE ESTE SCRIPT COBRA ────────────────────────────────────────────────── A. Os multiplicadores do derive da árvore de ISR batem com lib/doses-isr.ts. B. A Sedoanalgesia ensina a REDUÇÃO no instável — nunca a faixa plena rotulada como dose do instável. C. A via acordada e o deferimento são NÓS ALCANÇÁVEIS, oferecidos como opção na decisão de estratégia — não menções em texto. D. As frases literais de doses-isr.ts repetem os números de DOSES_ISR (são literais para a tradução enxergar; o vínculo é esta trava). Este script FALHA O BUILD. Dose de indução errada no chocado é PCR peri-intubação.

## `test:sedacao` → `scripts/valida-sedacao.cjs`

- **PROMETE:** aritmética das diluições, dois eixos declarados (sedação × bloqueio), aviso do BNM com o mesmo peso visual nos três, e nenhum alvo de sedação aposentado escrito em lugar nenhum.
- **NÃO PROMETE:** que as indicações de sedação estejam certas. A proibição de alvo aposentado cobre grafia, não julgamento clínico.
- **UNIVERSO:** universo ABERTO para o alvo de RASS (inclui traduções); os módulos de sedação para o resto. Sedoanalgesia & BNM: a bolsa fecha, e os dois eixos não se confundem. ── OS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ─────────────────────────────────── 1. O atracúrio anunciava "5 amp (250 mg) + 200 mL SF → 250 mL · 1 mg/mL". 5 × 5 mL + 200 = 225 mL, não 250, e a concentração real era 1,11 mg/mL. Única das 20 soluções do módulo cuja aritmética não fechava — e só apareceu porque as 20 foram conferidas uma a uma. 2. O midazolam marcava de VERMELHO tudo acima de 0,20 mg/kg/h. O módulo de Convulsões manda 0,05–2 mg/kg/h no status refratário — dez vezes isso, e está certo. São OBJETIVOS diferentes: sedação titulada por RASS (meta de paciente acordado) × anestesia terapêutica com EEG (meta de supressão). Sem declarar os dois eixos, o app pintava de vermelho a dose correta. 3. O cisatracúrio dizia faixa 0,1–0,2 mg/kg/h e, no mesmo fármaco, citava o ACURASYS com 37,5 mg/h — ~0,54 mg/kg/h em 70 kg, quase 3× o topo da própria faixa. Infusão titulada por TOF e protocolo de dose fixa apresentados como a mesma coisa. Este script FALHA O BUILD. ── ESCRITO COM A LISTA DO R-15 ────────────────────────────────────────────── Comentários removidos antes de conferir conteúdo (os comentários acima citam os números proibidos); toda leitura que pode não encontrar FALHA em vez de seguir; e o que se compara é a ARITMÉTICA, não a grafia do rótulo.

## `test:eletrolitos` → `scripts/valida-eletrolitos.cjs`

- **PROMETE:** as constantes de sódio e cálcio conferem com a massa molar por RECÁLCULO (R-17), a paridade hipo × hiper se mantém, e torsades e fentanil não divergem entre módulos.
- **NÃO PROMETE:** que as condutas de reposição estejam certas — confere aritmética e uniformidade, não indicação.
- **UNIVERSO:** os módulos de eletrólitos; a varredura de torsades e fentanil é de universo ABERTO. Correções eletrolíticas: a aritmética fecha e os dois lados têm o mesmo cuidado. ── O QUE ESTE SCRIPT COBRA ────────────────────────────────────────────────── 1. AS CONSTANTES das soluções, contra a massa molar. NaCl 3% = 513 mEq/L, 20% = 3,42 mEq/mL, SF = 154, 0,45% = 77 — e a fração de mistura que transforma SF + NaCl 20% em 3%. São os números de onde sai todo o resto; errar um deles erra o módulo inteiro sem que nada mais denuncie. 2. PARIDADE HIPO × HIPER no sódio. O limite de 8 mEq/24 h da hipernatremia estava NO CÓDIGO e nunca era dito: "edema cerebral" 0×, "sobrecorreção" 0×, limite explícito 0× — contra 4× de sobrecorreção e o nome do dano do lado da hiponatremia, na MESMA tela. O erro simétrico é o esquecido. 3. OS DOIS SAIS DE CÁLCIO, com o fator. O módulo só oferecia gluconato, enquanto o app usa CLORETO em politrauma, choque e PCR na gestante — quem viu a droga lá lê os dois como intercambiáveis. 1 g de cloreto ≈ 3 g de gluconato em cálcio elementar. Este script FALHA O BUILD. Escrito com a lista do R-15.

## `test:osmolaridade` → `scripts/valida-osmolaridade.cjs`

- **PROMETE:** que a ÚNICA implementação viva do cálculo de osmolaridade — a calculadora `osmolalidade` em clinical-calculators-engine.ts — use o divisor 6 (ureia total) e não 2,8 (BUN); que separe osmolalidade TOTAL de EFETIVA; e que os avisos de texto sobre as duas armadilhas continuem na árvore viva do CAD/EHH.
- **NÃO PROMETE:** que as FAIXAS de interpretação da calculadora estejam alinhadas ao consenso 2024 (ver ⚠️ abaixo — há divergência aberta), nem que a árvore do CAD/EHH calcule osmolaridade: ela NÃO calcula, por decisão declarada (PD-3), e escreve a fórmula para o médico aplicar.
- **UNIVERSO:** clinical-calculators-engine.ts e dka-hhs-decision-tree.ts. ── POR QUE ESTA TRAVA MUDOU DE ALVO (14/ago) ─────────────────────────────── Ela travava `dka-hhs-engine.ts` — que é CÓDIGO MORTO desde 07/jun (D-22). Protegia um cálculo que a tela nunca executou, e do lado vivo só conferia que a FRASE da fórmula existia. Terceira trava da auditoria validando código inalcançável, junto com test:avc e test:coronary (D-25). Agora aponta para onde o cálculo vive de verdade: a calculadora clínica. A proteção passa a cobrir código que chega ao usuário — que era o ponto. ⚠️ DIVERGÊNCIA ABERTA, NÃO TRAVADA: as faixas de interpretação da calculadora tratam efetiva ≤ 320 como "hiperosmolalidade leve" e só sugerem EHH acima de 320. O consenso ADA/EASD 2024 (Diabetes Care 47:1257, Fig. 2B) usa efetiva > 300 como critério de EHH — 320 é o limiar da TOTAL. É o mesmo defeito corrigido na árvore em 14/ago, sobrevivendo aqui. Não travado ainda porque mudar faixa de interpretação é mudança de recomendação e precisa de decisão registrada.

## `test:faixas-invertidas` → `scripts/valida-faixas-invertidas.cjs`

- **PROMETE:** nenhuma faixa numérica "a–b" tem limite inferior maior que o superior, em nenhum texto clínico do app.
- **NÃO PROMETE:** nada sobre o VALOR das faixas. Uma faixa pode estar coerente consigo mesma e clinicamente errada.
- **UNIVERSO:** toda a árvore de conteúdo (.ts/.tsx), exceto scripts, e2e, locales e i18n. 1633 faixas lidas. valida-faixas-invertidas.cjs — R-22, item 1 ── A CLASSE ──────────────────────────────────────────────────────────────── Verificação que NÃO depende de fonte externa. Toda outra trava desta auditoria compara o app contra algo de fora — bula, publicação, massa molar, fonte única. Esta compara o app contra SI MESMO: uma faixa escrita "a–b" afirma que a é o limite inferior e b o superior. Se a > b, a afirmação se contradiz, e isso é decidível sem sair do repositório. Por isso ela cobre o que a auditoria módulo a módulo não alcança: os módulos sem diretriz citada (D-3) e os números atrás de paywall. ── O QUE NÃO É FAIXA ─────────────────────────────────────────────────────── O travessão em texto clínico é ambíguo, e uma trava que acusa inocente é pior que trava que não existe (R-22). Ficam de fora, NOMEADAMENTE: · relações e proporções — "I:E 1:2", "1:10.000" · intervalos de administração — "12/12h" · sequências decrescentes deliberadas — o degrau do Vt "8–7–6" na SDRA, o desmame de PEEP, a redução escalonada de sedativo · datas, versões, referências bibliográficas ("2016;315(8):762–774") · negativos — "RASS −5 a −4" tem inferior MENOR em valor absoluto e maior em sinal; a comparação é feita com sinal · faixa cujo segundo termo é unidade diferente do primeiro

## `test:antidotos` → `scripts/valida-antidoto-duracao.cjs`

- **PROMETE:** toda prescrição de naloxona ou flumazenil carrega a consequência da duração curta do antídoto (vigilância pós-reversão).
- **NÃO PROMETE:** que a DOSE do antídoto esteja certa, nem que os outros antídotos do app tenham a mesma cobertura — só estes dois estão na tabela.
- **UNIVERSO:** toda a árvore de conteúdo, com expansão de identificadores para o texto das constantes de fonte única. valida-antidoto-duracao.cjs — R-22, item 2 ── O EIXO ────────────────────────────────────────────────────────────────── Antídoto cuja duração de ação é MENOR que a do agente que ele reverte tem uma consequência obrigatória: o paciente precisa ser vigiado depois de acordar, porque o efeito do antídoto acaba antes do efeito do tóxico. Não é julgamento farmacológico — é COERÊNCIA INTERNA (R-22). O próprio app afirma isto sobre a naloxona, com todas as letras, em poisoning-decision-tree: "A meia-vida da naloxona é MENOR que a da maioria dos opioides — a depressão respiratória PODE VOLTAR depois de o paciente já ter acordado. Vigiar por horas, não por minutos." Se o app afirma isso, então TODO lugar que prescreve naloxona precisa dizer o mesmo. Um lugar que prescreve sem a consequência contradiz o próprio app. ── POR QUE ESTA TRAVA É DIFERENTE DA DE REDOSE ───────────────────────────── O eixo original era mais amplo — "intervalo de reavaliação × duração de ação", nos dois sentidos. Ele não tem corpus neste app: de 34 fármacos varridos, 14 declaram intervalo de redose e apenas 6 declaram duração de ação; a interseção é de 3, e as 3 são coincidência de linha, não par real. A ausência é o achado (R-13): o app quase nunca declara duração de ação, e sem ela o cruzamento não existe. O que sobra com corpus real é este recorte — o antídoto —, que é também onde o erro é mais caro.

## `test:teto` → `scripts/valida-teto-por-kg.cjs`

- **PROMETE:** nenhum teto absoluto satura em peso implausível, e nenhum fármaco cujo teto o APP declara é prescrito por quilo sem ele.
- **NÃO PROMETE:** que exista teto onde deveria. A lista de fármacos vem do que o próprio app já declara — nenhum teto é exigido por conhecimento externo. Teto decorativo é AVISO, não falha.
- **UNIVERSO:** toda a árvore de conteúdo. 39 pares dose/kg + teto conferidos. valida-teto-por-kg.cjs — R-22, item 3 ── O EIXO ────────────────────────────────────────────────────────────────── Dose por quilo mais teto absoluto é uma afirmação dupla, e as duas partes precisam ser coerentes ENTRE SI. Três defeitos possíveis, todos decidíveis sem sair do repositório: A · TETO QUE SATURA EM PESO IMPLAUSÍVEL — "0,5 mg/kg, máx 3 mg" satura em 6 kg. Num protocolo adulto, é teto pediátrico esquecido no lugar errado, e todo adulto recebe a mesma dose fixa sem que ninguém perceba. B · TETO QUE NUNCA VINCULA — satura acima de 250 kg. É decorativo: existe no texto, nunca no paciente. Não é perigoso, é ruído que ensina a ler "máx" como enfeite. ⚠️ B É AVISO, NÃO FALHA — e a escolha é DECLARADA, não acidental. O R-3 diz que detectar não é travar, e ele vale para achado que importa: teto decorativo não põe ninguém em risco, e derrubar o build por ele gastaria a autoridade do vermelho onde ela não é necessária. A consequência é que a mutação de B se confere pela SAÍDA, não pelo código de retorno (R-2) — está dito aqui para ninguém confundir com fuga. C · DOSE/kg SEM TETO ONDE O APP JÁ DECLARA UM. Este é o mais forte, porque é R-22 puro: se o app diz em algum lugar que a alteplase tem máximo de 90 mg, então um segundo lugar que prescreve 0,9 mg/kg sem teto CONTRADIZ o próprio app. Não é julgamento farmacológico — é a mesma afirmação feita duas vezes, de formas incompatíveis. ── O QUE NÃO É DEFEITO, E FICA NOMEADO ───────────────────────────────────── A varredura preliminar achou 240 doses por kg sem teto declarado. A esmagadora maioria é legítima: cetamina, propofol, rocurônio, manitol e cristaloide não têm teto absoluto — a dose acompanha o peso e ponto. Exigir teto de todas seria trava que acusa inocente (R-22), e essas 240 viram ruído que faz desligar o verificador. Por isso o caso C é conferido só contra a LISTA DO PRÓPRIO APP: fármaco cujo teto o app já declara em algum lugar. Nada é exigido por conhecimento externo. Também ficam de fora as doses pediátricas com teto adulto — "lorazepam 0,1 mg/kg, máx 4 mg" satura em 40 kg de propósito, e é assim que a literatura escreve. O corte de implausibilidade é bem abaixo disso.

## `test:ordem-clinica-parcial` → `scripts/valida-ordem-clinica-parcial.cjs`

- **PROMETE:** que SEIS pares "A antes de B" nomeados nesta trava sejam respeitados onde o app os expressa — ordem de nó no grafo, índice em array de conduta, ou presença da frase que fixa a ordem.
- **NÃO PROMETE:** que a ordem clínica do app esteja verificada. São 6 pares de uma lista de 10, e a lista de 10 não pretende cobrir a medicina de emergência. QUATRO pares ficam de fora e são impressos a cada execução com o motivo — dois porque o app não expressa a ordem em lugar nenhum, um porque vive em outra máquina (o reducer do ACLS) e um porque já é coberto por test:sedacao.
- **UNIVERSO:** as 19 árvores de decisão, os motores, e a tela de correções eletrolíticas — declarada à parte por ser React e não árvore. ── POR QUE "PARCIAL" ESTÁ NO NOME ────────────────────────────────────────── Porque o perigo de uma tabela curta não é a incompletude — é a incompletude que SE APRESENTA COMO COMPLETA. Uma trava chamada "ordem-clinica" que passa verde ensina que a ordem clínica do app foi conferida. Ela não foi: foram seis pares. A palavra no nome e a lista impressa a cada execução existem para que ninguém leia o verde como mais do que ele é. ── DE ONDE VEIO A TABELA, E O QUE ELA CUSTOU (R-26) ──────────────────────── Dos 10 pares propostos: · 1 era fisicamente impossível como escrito ("confirmar o tubo antes de ventilar" — capnografia em onda EXIGE ventilação para gerar onda); · 3 tinham exceção nomeável (PCR para o bloqueador; pré-hospitalar para o antídoto; e a tiamina, que virou regra de PRESENÇA depois de se ver que a formulação original faria a trava acusar texto correto e empurrar para atrasar glicose em hipoglicemia documentada); · 3 não são verificáveis na estrutura de hoje; · 4 sobreviveram intactos.

## `test:prazos` → `scripts/valida-prazos.cjs`

- **PROMETE:** que prazo ACIONÁVEL declarado num módulo tenha mecanismo de medir, que prazo longo nomeie o marco a partir do qual conta, e que o mesmo marco não receba valores diferentes em caminhos distintos do mesmo módulo.
- **NÃO PROMETE:** que os prazos estejam clinicamente certos, nem que o cronômetro FUNCIONE — ela confere que o mecanismo EXISTE, lendo o fonte. Pôr um `return []` no início do getTimers desliga o relógio e esta trava continua verde, porque a palavra `duration:` segue no corpo, agora inalcançável. Comportamento é conferido executando, em `test:cronometro` (R-10).
- **UNIVERSO:** as árvores e motores de conteúdo clínico, com os prazos de ELEGIBILIDADE nomeadamente excluídos. ── A DISTINÇÃO QUE FAZ OU QUEBRA ESTA TRAVA ──────────────────────────────── Dois prazos parecem iguais no texto e não são: ACIONÁVEL — manda fazer alguma coisa quando o tempo passar. "reavaliar em 5 min", "repetir a cada 3–5 min", "nova dose em 10 min". Se o app manda cronometrar e não cronometra, o prazo é decorativo — mesma família do teto que nunca vincula. ELEGIBILIDADE — é critério, não contagem. "janela de 4,5 h para trombólise", "sintomas há menos de 12 h". Ninguém espera que o app conte isso: é informação para decidir SE, não alarme para tocar QUANDO. Exigir timer aqui é acusar inocente, e trava que acusa inocente termina desligada (R-22). A separação é feita pelo VERBO, não pelo número: prazo acionável tem imperativo de conduta; prazo de elegibilidade descreve uma janela ou um tempo decorrido.

## `test:cronometro-arvore` → `scripts/test-cronometro-arvore.cjs`

- **PROMETE:** que o relógio das Convulsões conte do INÍCIO DA CRISE e não da abertura do app; que as quatro marcas (5/20/40/60 min) vençam na hora certa; que o "não sei" conte do zero DECLARANDO que subestima; que a troca de marco aos 60 min funcione nos dois sentidos — com e sem anestésico iniciado; e que o repique do benzodiazepínico corra em paralelo, com marco próprio.
- **NÃO PROMETE:** que os limiares de 5/20/40/60 min estejam clinicamente certos (são da AES 2016, e a conferência é de comportamento, não de fonte), nem que a tela renderize o que o runtime devolve — isto executa o motor.
- **UNIVERSO:** core/decision-tree (runtime) e seizure-decision-tree.ts, compilados e executados. ── R-30: ESTE TESTE ESPERA DE VERDADE ────────────────────────────────────── Teste de tempo escrito sem tempo decorrido não testa tempo. Onde a diferença entre "armou" e "re-armou" é de segundos, o teste espera segundos — com o relógio do sistema, porque é o que o runtime lê. Onde a diferença é de MINUTOS, esperar seria absurdo: para essas, o marco é fixado no passado (`marcar(marco, decorrido)`), que é exatamente o mecanismo clínico sob teste — o relógio conta do evento, não do app.

## `test:pipeline` → `scripts/valida-pipeline.cjs`

- **PROMETE:** toda trava test:* do package.json está ligada ao test:all, ou tem isenção com motivo registrado.
- **NÃO PROMETE:** que as travas ligadas funcionem — só que estejam ligadas. É meta-trava.
- **UNIVERSO:** os scripts do package.json. Meta-trava: toda trava tem de estar ligada ao pipeline. ── O DEFEITO QUE ORIGINOU ESTE SCRIPT ─────────────────────────────────────── A auditoria construiu, ao longo de várias sessões, sete verificações que QUEBRAM O BUILD por desenho: árvores de decisão, calculadoras, fatos clínicos, sulfatação, motor, AVC, coronárias. Cada uma foi escrita, testada por mutação, e declarada trava. Nenhuma delas estava no `test:all`. Sete portas trancadas num muro sem portão: existiam, pareciam proteger, e ninguém as abria. É a mesma classe do defeito da dopamina — o número certo no lugar certo, sem nada ligando um ao outro — e não se descobre lendo o script, porque o script está impecável. Descobre-se olhando o pipeline. ── O QUE ESTE SCRIPT COBRA ────────────────────────────────────────────────── Todo script `test:*` do package.json aparece dentro do `test:all`. A trava nova que alguém escrever daqui a três semanas nasce ligada, ou o build cai no mesmo dia — em vez de nascer solta e ser descoberta meses depois, como estas sete. ── ISENÇÕES ───────────────────────────────────────────────────────────────── Uma isenção sem motivo escrito é um buraco. Cada uma abaixo diz por quê. Isenção nova entra aqui com a razão, nunca no silêncio.

## `test:indice` → `scripts/indice-de-travas.cjs`

- **PROMETE:** que exista um índice VERIFICÁVEL do que cada trava do `test:all` cobre, gerado do próprio código, e que nenhuma trava nova entre no pipeline sem declarar o que promete, o que não promete e o universo que enxerga.
- **NÃO PROMETE:** que as declarações sejam VERDADEIRAS. Ele lê o que a trava diz de si mesma; provar que ela faz o que diz é o papel da mutação (R-1).
- **UNIVERSO:** todas as etapas de `test:all` que executam um script em scripts/. ── POR QUE ISTO EXISTE ───────────────────────────────────────────────────── Duas vezes nesta auditoria eu comecei a construir um verificador que JÁ EXISTIA — a lista de siglas do D-3 e a alcançabilidade do grafo. Nas duas o instrumento estava correto e completo; a lacuna era do INVENTÁRIO. Com 34 etapas no `test:all`, ninguém sabe de cabeça o que o pipeline cobre. E "módulo fechado" (R-20) só significa alguma coisa se der para verificar QUAIS travas guardam aquele módulo — o que exige saber o que cada uma promete. ── O CABEÇALHO PADRÃO ────────────────────────────────────────────────────── Três campos no comentário de topo, exatamente com estes rótulos:

## `test:acls` → `scripts/auditoria-acls.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:acls-ritmo` → `scripts/test-acls-troca-de-ritmo.cjs`

- **PROMETE:** que a máquina de estados do ACLS se comporte corretamente quando o ritmo MUDA no meio do ciclo — nos dois sentidos —, que o teto de 2 doses de antiarrítmico sobreviva a conversão e recaída, que `deliveredShockCount` atravesse a troca de ramo, e que as duas invariantes descobertas ao exercitar isto continuem valendo: o antiarrítmico é barrado por CONTAGEM DE CHOQUES (não por nome de estado) e as doses são espaçadas pela cadência par/ímpar do `rcp3CycleIndex`.
- **NÃO PROMETE:** que os limiares clínicos estejam certos (3 choques antes do antiarrítmico, teto de 2 doses, 2 min de ciclo são da AHA e a conferência aqui é de COMPORTAMENTO, não de fonte). Não cobre ROSC, re-parada, OVACE nem gestação — esses têm caminhos próprios. E NÃO PROMETE O ENFORCEMENT DO TETO DE 2 EM SI. Mutação executada: afrouxar `canRecommendAntiarrhythmic` (2→5) E o fechamento do `antiarrhythmicReminderStage` juntos NÃO derruba esta trava — as doses param em 2 mesmo assim, o que indica uma TERCEIRA guarda que não foi mapeada. O teto é vigiado por `npm run test:acls`; o que ESTA trava promete sobre ele é outra coisa: que ele SOBREVIVE a conversão de ritmo e recaída, e que as duas doses caem em ciclos rcp_3 PARES.
- **UNIVERSO:** acls/reducer.ts compilado e executado, com protocol.json real. ── POR QUE ESTA TRAVA EXISTE ─────────────────────────────────────────────── A mudança de ritmo no meio do ciclo era a lacuna de cobertura conhecida do reducer — o único motor do app com máquina de estados real, do qual os nove módulos do ACLS dependem. Auditar conteúdo sobre motor não verificado é a inversão que a Fase 1 ensinou a evitar. Exercitados os quatro casos, O REDUCER ESTAVA CORRETO NOS QUATRO. Isto aqui não corrige nada: converte "provavelmente certo" em "verificado", e prende o comportamento contra refatoração.

## `test:arvores` → `scripts/auditoria-maquinas-estado.cjs`

- **PROMETE:** alcançabilidade e estrutura do grafo: nenhum nó órfão, beco sem saída, transição quebrada, ciclo sem fim, ou desfecho alcançável sem conduta no caminho.
- **NÃO PROMETE:** CORREÇÃO CLÍNICA. Um fluxo pode passar aqui com todas as condutas erradas. Conduta é procurada em três lugares (nó action, exitCriteria do terminal, módulo de destino via targets) — ver ARQUITETURA.md.
- **UNIVERSO:** as 19 árvores de decisão compiladas. CAMADA 5 — Auditoria das máquinas de estado clínicas. Compila as árvores de decisão e analisa o GRAFO de cada uma. Não julga conduta: julga estrutura. Um nó órfão ou um beco sem saída é defeito objetivo — ou o médico não chega àquela conduta, ou chega e fica preso. O que procura, seguindo a lista do plano de auditoria: - estados sem saída (nó que não é final e não leva a lugar nenhum); - estados órfãos (existem no arquivo mas nenhum caminho chega até eles); - transições para nó inexistente; - opções duplicadas dentro do mesmo nó de decisão; - opções distintas que levam ao MESMO destino (escolha sem efeito); - ciclos sem saída para um nó final (o fluxo nunca termina); - nós de entrada cujos campos obrigatórios não têm preset nem valor livre; - textos de conduta vazios. O validador que já existia (`validateDecisionTree`) cobre só referência quebrada. Isto é o resto. Uso: node scripts/auditoria-maquinas-estado.cjs

## `test:motor` → `scripts/test-motor-arvore.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:consistencia` → `scripts/valida-consistencia-clinica.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:calculadoras` → `scripts/valida-calculadoras.cjs`

- **PROMETE:** cada ferramenta confere com a publicação por RECÁLCULO, as fronteiras de faixa não se deslocam, a interpretação é monotônica na gravidade, e Glasgow/RASS/NIHSS não indicam conduta (R-19).
- **NÃO PROMETE:** que as ferramentas ausentes deveriam existir, nem que os limiares sem fonte aberta estejam certos — APACHE II segue sem a figura do Knaus.
- **UNIVERSO:** as 15 ferramentas de clinical-calculators-engine.ts. Validação estrutural das calculadoras clínicas. POR QUE ESTE SCRIPT EXISTE -------------------------- Cada calculadora do app cita, no próprio código, a publicação primária que a define. Nenhuma estava conferida contra ela — a citação existia, a verificação não. Conferir 15 artigos inteiros é caro e, na prática, não acontece. Mas quase toda publicação de escore declara um INVARIANTE verificável: a faixa que o escore pode assumir. E o invariante é sensível — a faixa só fecha se todos os pesos estiverem certos. Exemplo real: o APACHE II vai de 0 a 71 (Knaus 1985). Se a creatinina não dobrasse na insuficiência renal aguda, o máximo daria 67. Se o Glasgow fosse pontuado como as demais variáveis (teto 4 em vez de 12), daria 63. Se a idade parasse em 5 pontos, daria 70. Um único peso errado quebra o teste. O QUE ELE PROVA E O QUE NÃO PROVA --------------------------------- Prova que o conjunto de pesos fecha na faixa publicada. NÃO prova que cada faixa individual de cada variável está no ponto certo — para isso é preciso o texto completo com as tabelas. É bem mais do que "a citação está no comentário", e bem menos do que uma auditoria completa. O relatório diz exatamente qual das duas coisas cada calculadora recebeu. COMO ESTENDER ------------- Acrescente uma entrada em INVARIANTES com a faixa e a fonte. Se a publicação não declarar faixa, registre `faixa: null` com o motivo: o script conta como PENDENTE em vez de fingir cobertura.

## `test:sulfatacao` → `scripts/valida-sulfatacao.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `build:web`

_não executa script em scripts/ (e2e, playwright)_

## `test:e2e`

_não executa script em scripts/ (e2e, playwright)_

---

## Cobertura por módulo — e onde ela NÃO existe

**ESTRUTURA** vale para todos por construção: `test:arvores` percorre o grafo
de cada árvore e `e2e/modulos.spec.ts` abre os 30 módulos. Isso NÃO diz que o
conteúdo clínico está certo — diz que ele é alcançável e que a tela monta.

**Fora desta tabela, e auditados:** Vasoativas · Sedoanalgesia · Eletrólitos · Calculadoras Clínicas — são telas
de calculadora, sem árvore de decisão. A ausência deles aqui não é lacuna.

| Módulo | Estrutura | Auditado na Fase 1–2 | **Nós interrogados** | Travas que TOCAM o módulo |
|---|---|---|---|---|
| `acute-abdomen` | ✅ | — | 23/23 (100%) | **nenhuma** |
| `anaphylaxis` | ✅ | ✅ | 26/26 (100%) | test:isr, test:prazos |
| `avc` | ✅ | — | 8/27 (30%) | test:ci-trombolise, test:peso |
| `coronary` | ✅ | — | 26/27 (96%) | test:ci-trombolise, test:peso, test:calculadoras |
| `dka-hhs` | ✅ | ✅ | 15/18 (83%) | test:peso, test:eletrolitos, test:osmolaridade |
| `dyspnea` | ✅ | — | 1/29 (3%) | **nenhuma** |
| `eap` | ✅ | ✅ | 16/26 (62%) | test:dobutamina |
| `eclampsia` | ✅ | — | 15/17 (88%) | test:sulfatacao |
| `ira` | ✅ | — | 59/60 (98%) | test:ira, test:pressuposicao, test:tamanho-de-item, test:forca-da-afirmacao |
| `poisoning` | ✅ | — | 27/27 (100%) | test:osmolaridade, test:antidotos, test:ordem-clinica-parcial |
| `politrauma` | ✅ | — | 5/24 (21%) | **nenhuma** |
| `rsi` | ✅ | ✅ | 32/32 (100%) | test:via-aerea, test:isr, test:sedacao, test:eletrolitos, test:ordem-clinica-parcial, test:calculadoras |
| `seizure` | ✅ | — | 9/15 (60%) | test:eclampsia-crise, test:sedacao, test:cronometro-arvore |
| `sepsis` | ✅ | ✅ | 17/24 (71%) | test:atb-renal, test:dobutamina, test:ordem-clinica-parcial |
| `shock` | ✅ | — | 13/31 (42%) | **nenhuma** |
| `tce` | ✅ | — | 15/15 (100%) | test:osmolaridade |
| `tep` | ✅ | — | 23/24 (96%) | test:ci-trombolise, test:dobutamina, test:peso, test:calculadoras |
| `ventilation` | ✅ | ✅ | 13/25 (52%) | test:sedacao, test:eletrolitos |

⚠️ **Nós interrogados** é medida de ALCANCE, não de qualidade: conta os nós
em que ao menos um padrão da trava casa com algum texto. Nó fora da conta
está dentro do universo da trava e fora de toda asserção dela — uma regressão
ali passa verde (R-74, D-44). `npm run mapa:cobertura -- --mudos` lista quais.

### ⚠️ 4 módulo(s) sem cobertura de CONTEÚDO

`acute-abdomen`, `dyspnea`, `politrauma`, `shock`

Nenhuma trava toca estes módulos, e nenhum foi auditado. A
estrutura é vigiada; o conteúdo clínico não. **AVC e Coronárias estão aqui
por decisão declarada (D-25)**: as travas que existiam validavam os engines
mortos, e reescrevê-las contra as árvores exige auditar os módulos, o que a
Fase 1 nunca fez. Cobertura zero DECLARADA é aceitável; silenciosa não.
