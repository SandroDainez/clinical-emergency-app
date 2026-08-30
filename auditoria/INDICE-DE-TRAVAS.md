# Índice das travas do `test:all`

**GERADO DE `scripts/indice-de-travas.cjs` — não editar à mão.**

Este índice existe porque o `test:all` ficou grande demais para alguém saber de cabeça o que ele cobre. Duas vezes nesta auditoria começou-se a construir um verificador que já existia; a lacuna era de inventário, não de cobertura.

⚠️ Ele lê o que cada trava **diz de si mesma**. Que a declaração seja verdadeira é o que a mutação prova (R-1), não este índice.

**57 de 71 travas com declaração completa.**

## `test:engine` → `scripts/test-engine.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:nucleo` → `scripts/prova-nucleo.cjs`

- **PROMETE:** que as cinco capacidades novas do NÚCLEO funcionem de verdade, sobre o motor real, numa árvore de prova — seleção múltipla, valor com histórico, veredito derivado que muda de cor ao corrigir o dado, estado de ação, e bloqueio de medicação SEM bloqueio do atendimento.
- **NÃO PROMETE:** nada sobre a SCA nem sobre qualquer módulo clínico — a árvore aqui é sintética de propósito. O núcleo não conhece doença.
- **UNIVERSO:** core/decision-tree/{engine,types,estado-clinico}.ts. ── POR QUE UMA ÁRVORE SINTÉTICA E NÃO A SCA ──────────────────────────────── O pedido foi explícito: implementar e testar SÓ o núcleo antes de tocar em qualquer tela. Provar sobre a SCA misturaria dois riscos — "o núcleo funciona?" e "o módulo usa o núcleo direito?" — e uma falha não diria qual dos dois quebrou. A árvore daqui existe só para exercitar as capacidades.

## `test:avc-nucleo` → `scripts/prova-avc-nucleo.cjs`

- **PROMETE:** que o núcleo do AVC obedeça às três decisões de Q-01/Q-02/Q-03 — uma porta única de relógio (⛔ nenhum `Date.now()` disperso), trilha APPEND-ONLY em que correção convive com a medida corrigida e exige motivo, e os três vazios (não perguntado / não sei / valor) como estados distintos que ⛔ nunca colapsam.
- **NÃO PROMETE:** nada sobre MEDICINA. Ele ⛔ não confere corte, dose, janela nem fidelidade à AHA/ASA — isso é `prova-avc-superficie-a` (fidelidade dos campos) e, acima dela, a conferência de fonte, que é do médico. Também ⛔ não diz nada sobre a tela: um núcleo correto renderizado errado passa aqui, e foi exatamente o que aconteceu nos testes visuais de 2026-08-28.
- **UNIVERSO:** `avc/nucleo/*.ts` compilados — relogio.ts, tipos.ts, estado.ts e derivacoes.ts —, mais uma varredura de TEXTO sobre todo `.ts`/`.tsx` de `avc/` e `components/avc/` para a regra do separador. ⛔ Fora do universo: a medicina de `avc/conteudo/` e o desenho de `components/avc/`.

## `test:avc-superficie-a` → `scripts/prova-avc-superficie-a.cjs`

- **PROMETE:** que os campos da Superfície A sejam FIÉIS à fonte no que se pode medir sem julgamento — que `<60 mg/dL` seja limite e `>94%` seja meta e ⛔ nunca o contrário; que ausência ⛔ nunca vire negativa (E-23); que toda escolha ofereça saída de ausência de conclusão e nenhum rótulo caia cru no estado; que todo campo tenha slot de fonte (E-30) e `bloqueiaTerapia: false` (E-49); e que a faixa de cada barra ALCANCE os limites que a fonte escreve, ⛔ sem obrigar o médico a aproximar.
- **NÃO PROMETE:** que os números clínicos estejam CERTOS — ele confere que o código diz o que o verbatim transcrito diz, ⛔ não que o verbatim esteja bem transcrito nem que a fonte esteja atualizada. Também ⛔ não mede tela: ordem visual, legibilidade e vazamento de dado interno são `e2e/avc-superficie-a`.
- **UNIVERSO:** `avc/conteudo/superficie-a.ts` inteiro (todos os campos de `TODOS_OS_CAMPOS_A`, contados) e as derivações de `avc/nucleo/derivacoes.ts` exercitadas por estado construído. ⛔ Fora do universo: Superfícies B a G, que ainda não existem.

## `test:avc-superficie-b` → `scripts/prova-avc-superficie-b.cjs`

- **PROMETE:** que a Superfície B se comporte como DECOMPOSIÇÃO e ⛔ nunca como veredito — que o sistema ⛔ não conclua "déficit incapacitante"; que o NIHSS **total** ⛔ não classifique nada (a leitura é idêntica de 0 a 42); que os dois quadros da Table 4 preservem o hedge e ⛔ não se cancelem; que a leitura da fonte ⛔ NÃO seja estendida fora da população que ela declara (D-1) sem que isso feche campo nenhum; que a consulta a paciente e família seja registro opcional e ⛔ nunca requisito (D-5); que a divergência tenha UMA direção só e só exista dentro do contexto da fonte; que ⛔ nenhum campo bloqueie terapia (E-49) e que ⛔ nenhuma leitura fale de elegibilidade; que campo de vocabulário próprio ⛔ nunca seja lido por `ternario()`; e que o zero do NIHSS seja resposta, ⛔ não ausência (E-10).
- **NÃO PROMETE:** que os números clínicos estejam CERTOS — ela confere que o código diz o que o verbatim transcrito diz, ⛔ não que o verbatim esteja bem transcrito. ⛔ Também não mede tela: ordem visual, tamanho de alvo e legibilidade são `e2e/avc-superficie-b`. E ⛔ não diz nada sobre a Superfície A nem sobre elegibilidade, que ainda não existe.
- **UNIVERSO:** `avc/conteudo/superficie-b.ts` inteiro (todos os campos de `TODOS_OS_CAMPOS_B`, contados, com piso) e todas as derivações de `avc/nucleo/derivacoes-b.ts` exercitadas por estado construído, mais o TEXTO desse arquivo para a trava de `ternario()`. ⛔ Fora do universo: Superfícies A e C a G.

## `test:avc-superficie-c` → `scripts/prova-avc-superficie-c.cjs`

- **PROMETE:** que a Superfície C se comporte como o **ponto de decisão da imagem** e ⛔ nunca como portão de tudo — que as **três saídas** de §1.8 existam como representações distintas e ⛔ não colapsem em booleano; que ausência de tomografia ⛔ NUNCA seja lida como ausência de hemorragia (E-23); que *"realizada — resultado ainda não disponível"* seja resposta válida que ⛔ **não** fecha a pendência (PD-22); que a exclusão de hemorragia olhe para UM campo e ⛔ nenhum outro possa retê-la; que fatos coexistam e **destino seja um só**, com prioridade declarada e o outro achado preservado (PD-21); que ⛔ nenhum campo bloqueie terapia (E-49) e o bloqueio de classe viva na derivação (PD-23); que o dossiê endovascular descreva **dados**, ⛔ nunca elegibilidade (PD-24); que a alergia a contraste ⛔ não toque em ⛔ nada além do exame com contraste; que ⛔ não exista campo de creatinina, função renal ou laboratório; que a imagem avançada ⛔ não vire porta; e que o horário da tomografia ⛔ não alimente relógio clínico nem produza meta temporal (R2.5).
- **NÃO PROMETE:** que os números clínicos estejam CERTOS — confere que o código diz o que o verbatim transcrito diz, ⛔ não que o verbatim esteja bem transcrito. ⛔ Não mede tela: ordem visual, alvo de toque e legibilidade são `e2e/avc-superficie-c`. ⛔ E não diz nada sobre elegibilidade a IVT ou EVT, que vivem na Superfície F e ainda não existem. ⛔ Também ⛔ não confere tradução: o par em espanhol de cada OPÇÃO é `test:i18n-opcoes`, que cobre as três superfícies de uma vez — a regra vive em UM lugar, ⛔ não em três cópias que podem divergir.
- **UNIVERSO:** `avc/conteudo/superficie-c.ts` inteiro (todos os campos de `TODOS_OS_CAMPOS_C`, contados, com piso) e todas as derivações de `avc/nucleo/derivacoes-c.ts` exercitadas por estado construído, mais o TEXTO desses dois arquivos para as travas de `ternario()` e de laboratório. ⛔ Fora do universo: Superfícies A, B e D a G.

## `test:avc-superficie-d` → `scripts/prova-avc-superficie-d.cjs`

- **PROMETE:** que a Superfície D interprete segurança **sem virar veredito** — que ⛔ não exista estado agregado "contraindicado" ⛔ nem "elegível"; que **todo** item carregue o **verbo da própria fonte**; que a gradação da faixa dita absoluta seja preservada literalmente; que D ⛔ **não declare** ⛔ nenhum fato de Paciente, Laboratório, A ou C; que `unknown` ⛔ nunca vire negativo, ausência ⛔ nunca vire negativo e desconhecido ⛔ nunca vire valor fabricado; que a janela de 48 h do DOAC ⛔ **não seja calculada** enquanto F-30 estiver aberta; e que ⛔ **só** condição realmente resolvível gere pendência.
- **NÃO PROMETE:** que os cortes clínicos estejam certos — eles são transcrição, e quem os confere é o autor contra o verbatim. ⛔ Também ⛔ não mede tela: isso é `e2e/avc-superficie-d`. E ⛔ não confere tradução — é `test:i18n-opcoes`.
- **UNIVERSO:** `avc/conteudo/superficie-d.ts` inteiro (todos os itens de `ITENS_DE_SEGURANCA`, contados, com piso) e todas as derivações de `avc/nucleo/derivacoes-d.ts`, mais os campos de Paciente e Laboratório que D lê. ⛔ Fora do universo: as superfícies E a G. ── ⚠️⚠️ O QUE ESTA TRAVA EXISTE PARA IMPEDIR ──────────────────────────────── > *"O ponto mais delicado continua sendo manter **verbo da fonte + estado > derivado** sem transformar tudo num 'pode/⛔ não pode trombolisar' > simplificado."* — autor, 2026-08-30 ⚠️ Um atalho de linguagem aqui vira **bloqueio clínico mais forte do que a diretriz sustenta** — e ⛔ nenhum teste de comportamento pegaria isso, porque o app continuaria "funcionando".

## `test:avc-paciente` → `scripts/prova-avc-paciente.cjs`

- **PROMETE:** que a superfície **Paciente** seja **painel e ⛔ nunca porta** — que com ela inteiramente vazia todas as superfícies continuem acessíveis, que ⛔ nenhum bloqueio genérico nasça dela e que ausência ⛔ nunca vire negativa; que a **propriedade do fato** seja única (⛔ nenhum id declarado em duas casas) e que **preenchimento compartilhado ⛔ não seja duplicação** — o campo emprestado é o MESMO objeto, com o mesmo id; que toda derivação do módulo só mude quando muda um fato **declarado como insumo dela**; que todo campo declare **casa** e **temporalidade**; que texto livre ⛔ não exista em campo clínico; e que o campo administrativo ⛔ não afrouxe a exigência de fonte dos demais.
- **NÃO PROMETE:** que os números clínicos estejam CERTOS — confere que o código diz o que o verbatim transcrito diz. ⛔ Não mede tela: ordem visual, alvo de toque e legibilidade são `e2e/avc-superficie-paciente`. ⛔ Não confere tradução: o par em espanhol é `test:i18n-opcoes`.
- **UNIVERSO:** `avc/conteudo/paciente.ts` inteiro (todos os campos de `TODOS_OS_CAMPOS_P`, contados, com piso) mais as superfícies A, B e C para medir empréstimo e propriedade única, e TODAS as derivações do módulo (A, B e C) para a trava de insumos. ⛔ Fora do universo: Laboratório e D a G.

## `test:grandeza-decimal` → `scripts/prova-grandeza-decimal.cjs`

- **PROMETE:** que uma grandeza com **passo decimal** seja representável sem erro de ponto flutuante — que `1,4` fique `1,4` na trilha, que os degraus ⛔ não saiam com dezesseis casas, e que o número exibido use **vírgula**; e que o **zero** ⛔ nunca seja usado como sinônimo de "⛔ não informado".
- **NÃO PROMETE:** que as faixas dos campos sejam clinicamente adequadas — elas são **limite técnico de entrada** (ver `Faixa`), e ⛔ não afirmação clínica. ⛔ Também ⛔ não mede tela: o comportamento do controle é `e2e/avc-superficie-a`.
- **UNIVERSO:** os helpers de `avc/nucleo/formato.ts` exercitados sobre os passos realmente usados no módulo, mais TODOS os campos de grandeza das quatro casas — contados, com piso. ── POR QUE ESTA TRAVA NASCEU (2026-08-30) ───────────────────────────────── Laboratório traz os dois primeiros campos com casa decimal do módulo — INR e TP. Todo o resto (peso, PA, glicemia, ASPECTS, NIHSS) é inteiro, e a camada do AVC assumia isso: `0,1 × 10` saía `1.0000000000000002` no rótulo do degrau, no `testID` **e no valor gravado**. ⚠️⚠️ E o autor fixou a regra que a acompanha: ⛔ **`0` ⛔ nunca é sentinela de ausência**. *"⛔ Não informado é estado; zero é número."* Plaqueta 0 é resultado possível, e um campo que ⛔ não o registra fabrica ausência onde há informação — **E-52** reaparecendo pelo componente numérico.

## `test:avc-laboratorio` → `scripts/prova-avc-laboratorio.cjs`

- **PROMETE:** que o painel **Laboratório** ⛔ nunca escolha o "valor atual" de um analito por *"último digitado"* — que a ordem venha de **regra temporal explícita**, que `sem_ordem` seja estado terminal legítimo quando o horário é genuinamente desconhecido, e que ⛔ **nenhuma** coleta seja chamada de mais recente sem horário conhecido; que **⛔ nenhum resultado exista órfão de instância**; que a **unidade das plaquetas** seja lida da **mesma coleta** do valor, e que **sem unidade declarada ⛔ não haja conversão**; que **plaqueta 0** seja registrável; que a pendência do horário nasça ⛔ **só** quando a ordem passa a ser necessária; e que **nova coleta ⛔ não seja correção**.
- **NÃO PROMETE:** que os cortes clínicos estejam certos — eles ⛔ não moram aqui: são interpretação da Superfície D. ⛔ Também não mede tela: isso é `e2e/avc-superficie-laboratorio`. E ⛔ não confere tradução — é `test:i18n-opcoes`.
- **UNIVERSO:** `avc/conteudo/laboratorio.ts` inteiro (todos os campos de `TODOS_OS_CAMPOS_L`, contados, com piso) e todas as derivações de `avc/nucleo/derivacoes-lab.ts`, exercitadas por estado construído. ⛔ Fora do universo: as superfícies A a G. ── ⚠️⚠️ OS TRÊS CASOS-SENTINELA ───────────────────────────────────────── **1 · A ordem** — montado pelo autor: `INR 1,4` numa coleta **externa sem horário**, e `INR 1,1` numa coleta **local às 22h**. Ele existe para impedir que *"último digitado"* volte escondido no sistema. **2 · A unidade** — `plaquetas 80` **sem unidade declarada** ⛔ não pode ser comparada com `100.000`. Converter é transformar; **supor unidade é inventar**. **3 · A correção da unidade** — `plaquetas 80` em `mil/mm³`, e depois o médico percebe que o laudo era `/mm³`. A comparação passa de `80.000` para `80` na **mesma** coleta, a trilha preserva **marcada** a unidade anterior, e as outras coletas ⛔ não são reinterpretadas. ⚠️ É onde *"atributo da medida"* vira bug histórico se ⛔ não estiver amarrado.

## `test:rotas-de-modulo` → `scripts/valida-rotas-de-modulo.cjs`

- **PROMETE:** que o segmento `app/modulos/` ⛔ NUNCA volte a ter uma rota estática irmã de `[id].tsx` — porque uma irmã estática quebra o **voltar do navegador** entre duas telas de módulo, montando a irmã no lugar da rota pedida.
- **NÃO PROMETE:** que a navegação funcione — isso é `e2e/retomada-de-fluxo`, que mede o comportamento com cliques reais. Esta trava mede a CONDIÇÃO estrutural que o produz, porque o e2e ⛔ só a pegaria no módulo que ele percorre, e o defeito nasce em QUALQUER módulo novo.
- **UNIVERSO:** os arquivos de rota de `app/modulos/`, listados e contados. ── O DEFEITO QUE ESTA TRAVA NASCEU PARA MATAR (D-122, 2026-08-30) ───────── `app/modulos/avc.tsx` era rota estática irmã de `[id].tsx`. Com ela ali, o médico entrava em **bradicardia**, abria as **vasoativas** pelo atalho de estabilização, tocava em **voltar** — e caía no **módulo de AVC**, com a URL da bradicardia na barra de endereço. Tela de um paciente sobre o fluxo de outro. ⚠️⚠️ E ele passou **quatro rodadas de `test:all`** como *"1 falhou, pré-existente"*. Vermelho tolerado é vermelho que ⛔ não é mais lido. ⚠️ Investigação: renomear o arquivo ⛔ não resolvia (reproduziu como `zoutro.tsx`), declarar `<Stack.Screen>` ⛔ não resolvia, a forma de diretório (`avc/index.tsx`) ⛔ não resolvia. O que resolve é ⛔ **não haver irmã**.

## `test:avc-superficies` → `scripts/prova-avc-superficies.cjs`

- **PROMETE:** que a LETRA de uma superfície do AVC seja apresentação e nada mais — que o identificador seja um slug estável, que a letra saia da posição e ⛔ nunca seja digitada, que a ordem de apresentação seja exatamente a aprovada pelo autor, que nenhuma superfície declare vizinho ("próxima"/"anterior") nem pré-requisito de navegação, e que toda pendência e todo slot de fonte citados por uma superfície EXISTAM.
- **NÃO PROMETE:** que a ordem seja a melhor ordem clínica — isso é julgamento do autor, e a trava só congela a decisão dele para que ela ⛔ não se desfaça por acidente. Também ⛔ não mede tela: que a tela RENDERIZE nesta ordem é `e2e/avc-modulo-navegavel`, e ⛔ não diz nada sobre o conteúdo clínico de nenhuma superfície.
- **UNIVERSO:** `avc/conteudo/superficies.ts` e `avc/conteudo/fontes.ts` compilados — as sete superfícies e as três pendências iniciais, contadas e impressas. ── O DEFEITO QUE ESTA TRAVA NASCEU PARA MATAR (2026-08-28) ──────────────── `SuperficieId` era `"A" | ... | "G"`: a letra ERA a identidade. Ao inverter E e F, `superficieVista: "E"` mudaria de significado sem que uma linha de estado mudasse, e uma pendência `dono: "E"` passaria a apontar para outra superfície EM SILÊNCIO. Rótulo virando identidade é um defeito que passa em todos os testes — é por isso que ele precisa de trava própria.

## `test:selecao-encapsulada` → `scripts/valida-encapsulamento-selecao.cjs`

- **PROMETE:** que a representação serializada da seleção múltipla seja detalhe PRIVADO de `core/decision-tree/estado-clinico.ts` — que nenhum outro arquivo do app conheça o separador, faça `split` do valor bruto de um campo múltiplo ou procure substring dentro dele.
- **NÃO PROMETE:** que os helpers estejam clinicamente certos (test:nucleo) nem que todo campo múltiplo esteja declarado como tal.
- **UNIVERSO:** todo .ts/.tsx do app fora de node_modules. ── POR QUE ESTA TRAVA EXISTE ─────────────────────────────────────────────── A escolha de guardar seleção múltipla como string com separador foi deliberada: `TreeValues` é `Record<string,string>` e sustenta 30 módulos, todo `escolher` de roteamento e todos os validadores — trocar o tipo obrigaria a revisar cada consumidor, e um esquecido vira rota clínica errada. ⚠️ MAS A ESCOLHA SÓ É SEGURA ENQUANTO FOR INVISÍVEL (exigência do autor, 2026-08-25): "nenhum módulo, componente, validador ou regra clínica deveria fazer `value.includes(...)` ou manipular esse separador diretamente. Caso contrário, daqui a alguns meses aparece um bug clínico impossível de rastrear." O bug que ele descreve é concreto: `values.queixas.includes("dor")` casa também com "dor torácica pleurítica" e com "sem dor" — dois quadros diferentes, um deles o oposto do procurado. `temSelecionado()` compara item inteiro e não tem esse modo de falhar. Por isso a leitura é obrigada a passar pelos helpers, e esta trava é o que obriga.

## `test:valor-informado` → `scripts/valida-valor-nao-informado.cjs`

- **PROMETE:** que a exibição de campo numérico reflita o ESTADO REAL do motor — que o `NumericStepper` saiba dizer "não informado", que o shell marque isso exatamente quando o campo é opcional e o motor está vazio, e que soltar a barra sem mover também grave (via `onConfirmar`).
- **NÃO PROMETE:** o comportamento renderizado — isso é `e2e/valor-nao-informado.spec.ts`, que exercita o app de verdade. Esta trava é ESTRUTURAL e cobre justamente o caso que o e2e não consegue reproduzir no web (soltar a barra sem movimento).
- **UNIVERSO:** components/ui-v2/numeric-stepper.tsx e o shell de fluxo. ── O DEFEITO, MEDIDO (2026-08-25) ────────────────────────────────────────── A barra parte do meio da faixa e imprimia esse número em tipo grande antes de qualquer toque. Em campo OBRIGATÓRIO isso nunca apareceu — o botão de avançar trava até informar. Em campo OPCIONAL, que a Tela 1 da SCA introduziu, a tela dizia "Peso 140 kg" com o motor VAZIO. ⚠️ E PESO ALIMENTA DOSE: tenecteplase e enoxaparina são por quilo. Um número que parece confirmado sem ninguém ter medido é a semente de uma dose errada três telas adiante.

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
- **UNIVERSO:** os arquivos de conteúdo e os módulos de i18n. ── A FRONTEIRA COM A TRAVA DE RUNTIME (cobertura cruzada declarada) ──────── esta varredura (fonte) → TEXTO NOVO sem tradução. Vê o literal no momento em que alguém o escreve. valida-traducao-runtime → FRASE MONTADA cuja chave é de uma versão (artefato compilado)      ANTERIOR da frase. ── A SEGUNDA FRONTEIRA (2026-08-29): OPÇÃO CURTA E RÓTULO MONTADO ───────── Esta varredura procura **prosa**. Duas coisas passam por baixo disso, e as duas foram medidas na revisão da Superfície C do AVC: · **"Incerto"** — sete letras, sem acento, ⛔ não parece prosa. Ficou sem par desde a Superfície B, em doze campos, com esta varredura dizendo «SEM TRADUÇÃO: 0» e a tela espanhola mostrando a palavra portuguesa; · **os rótulos do mRS** — `${grau} · ${descritor}`, montados em tempo de execução: a string que a tela recebe ⛔ não existe como literal. ⚠️ Quem cobre isso é `scripts/prova-i18n-opcoes.cjs` (`test:i18n-opcoes`), que **carrega o módulo** e enumera as opções de verdade. ⛔ Endurecer a heurística de prosa aqui ⛔ não resolveria: o segundo caso ⛔ não tem literal para achar. ⚠️ E FOI MEDIDO que obedecer ESTA varredura ao pé da letra NÃO basta: numa mutação em que um pedaço foi acrescentado por concatenação a uma frase que já tinha chave, gravar a chave do PEDAÇO fez esta varredura dizer «SEM TRADUÇÃO: 0» — e a tela continuou em português, com a trava de runtime reprovando. Passar aqui não é evidência de tela traduzida. Varredura exaustiva de texto em português no código VIVO do app. Por que existe: a checagem antiga só perguntava se as chamadas tr() já existentes tinham tradução — e por isso dizia "faltando 0" com o app inteiro em português. Aqui o critério é outro: extrai TODO literal com prosa em português, esteja ele dentro de tr() ou não, e confronta com os dicionários. Uso:  node scripts/varredura-pt.cjs [--json <arquivo>] Saída: por arquivo, as frases sem tradução em es-419; código de saída 1 se houver pendências.

## `test:i18n-opcoes` → `scripts/prova-i18n-opcoes.cjs`

- **PROMETE:** que TODA opção tocável e TODO rótulo de grau das superfícies do AVC tenha par em espanhol — inclusive os que ⛔ nenhuma varredura de texto alcança: palavra curta sem acento ("Incerto") e rótulo **montado em tempo de execução** (`grau · descritor` do mRS). Confere também que o par ⛔ não seja a própria string portuguesa por engano, quando ela deveria mudar.
- **NÃO PROMETE:** que a tradução esteja CERTA — isso é revisão humana. ⛔ Também não cobre prosa: frases exibíveis continuam sendo `test:i18n` (`varredura-pt.cjs`), que lê o fonte, e `test:traducao-runtime`, que lê o artefato compilado.
- **UNIVERSO:** as opções de TODOS os campos de `TODOS_OS_CAMPOS_A`, `TODOS_OS_CAMPOS_B`, `TODOS_OS_CAMPOS_C` e `TODOS_OS_CAMPOS_P`, contadas com piso, mais os graus de `GRAUS_MRS`. ⛔ Fora do universo: qualquer módulo que ⛔ não seja o AVC. ── POR QUE ESTA TRAVA EXISTE (2026-08-29) ───────────────────────────────── `varredura-pt.cjs` procura **prosa em português** no código-fonte, e declara essa fronteira no próprio cabeçalho. Duas coisas passam por baixo dela, e as duas foram medidas na revisão da Superfície C: · **"Incerto"** — sete letras, sem acento, ⛔ não parece prosa. Estava sem par desde a Superfície B, em doze campos, com a varredura dizendo «SEM TRADUÇÃO: 0» e a tela espanhola mostrando a palavra portuguesa; · **os seis graus do mRS** — o rótulo é `${grau} · ${descritor}`, montado em tempo de execução. A string que a tela recebe ⛔ **não existe como literal em lugar nenhum**, e por isso ⛔ nenhum leitor de texto poderia achá-la. ⚠️ A correção ⛔ não é endurecer a heurística de prosa — é **carregar o módulo e enumerar as opções de verdade**, que é o que esta trava faz.

## `test:varredura-throw` → `scripts/prova-varredura-throw.cjs`

- **PROMETE:** que a varredura de i18n continue enxergando literal em português dentro de `throw` de UMA LINHA — o buraco medido em 2026-08-27, em que `isInvariantMessage` só olhava as linhas ANTERIORES ao literal e deixava passar a mensagem escrita no mesmo `throw new Error("...")`.
- **NÃO PROMETE:** que a varredura esteja completa. Ela cobre UM buraco conhecido, ⛔ não a corretude geral do `varredura-pt.cjs` — e ⛔ não diz nada sobre a QUALIDADE da tradução em espanhol, que é julgamento clínico (E-45) e ⛔ não se automatiza.
- **UNIVERSO:** `scripts/varredura-pt.cjs`, exercitado contra amostras sintéticas de throw (uma linha e várias linhas), positivas e negativas.

## `test:traducao-runtime` → `scripts/valida-traducao-runtime.cjs`

- **PROMETE:** que toda string em português que o app MONTA EM TEMPO DE EXECUÇÃO tenha chave correspondente no dicionário PT→ES. O universo é o ARTEFATO COMPILADO — `lib/*.ts` e as árvores de decisão emitidas por `tsc` —, e as strings comparadas são as que a tela recebe, não as que alguém escreveu.
- **NÃO PROMETE:** que exista texto novo sem tradução nenhuma. Isso é `npm run test:i18n` (`varredura-pt.cjs`), que lê o FONTE e pega o literal recém-escrito. Também não promete que a tradução esteja CORRETA — nenhuma trava sabe espanhol.
- **UNIVERSO:** o ARTEFATO COMPILADO — todos os `lib/*.ts` e todas as árvores de decisão da raiz, emitidos por `tsc` num diretório temporário e carregados com `require`. Compara-se cada string de prosa portuguesa alcançável nos objetos exportados contra as chaves de `lib/i18n/**` e `acls/locales/**`. ⚠️ FORA do universo: `acls/reducer.ts` e `acls/presentation.ts` — dívida nomeada, porque o painel de adrenalina depende de teste que avança o cronômetro — e os componentes `.tsx`, cujo texto não vem de objeto exportado. ── A FRONTEIRA COM A VARREDURA DE FONTE (cobertura cruzada declarada) ────── varredura-pt.cjs (fonte)   → TEXTO NOVO sem tradução. Vê o literal no arquivo, no momento em que é escrito. esta trava (runtime)       → FRASE MONTADA cuja chave não corresponde ao que a tela mostra. ⚠️ NENHUMA DAS DUAS COBRE A OUTRA, e as duas condições que a auditoria fixou para aceitar cobertura cruzada estão satisfeitas: cada uma é provada por MUTAÇÃO PRÓPRIA, e as duas chegam ao defeito por CAMINHOS DIFERENTES (uma lê texto de arquivo, a outra objetos compilados). E A FRONTEIRA FOI MEDIDA, não deduzida. A mutação desta trava — acrescentar um pedaço por concatenação a `AMIODARONA_COM_PULSO_CARGA`, que HOJE tem chave — foi levada até o fim nos dois instrumentos: 1. mutação aplicada        → as duas reprovam, mas dizem coisas diferentes: a de fonte aponta o PEDAÇO de 72 caracteres, esta aponta a FRASE de 230 que a tela recebe. 2. obedecendo a de fonte   → gravei a chave do PEDAÇO. `varredura-pt.cjs` ao pé da letra             passou com «SEM TRADUÇÃO: 0». 3. e a tela                → esta trava seguiu reprovando em 3 contagens. O médico continuaria vendo português. ⚠️ É POR ISSO QUE A DE FONTE NÃO SUBSTITUI ESTA: obedecê-la literalmente produz um dicionário que passa e uma tela que não traduz. E o inverso também vale — esta trava não vê literal recém-escrito que ninguém montou ainda. A mutação também mostrou o ALCANCE do mecanismo: UMA concatenação em `lib/` derrubou TRÊS superfícies — a própria constante e dois nós de `acls-tachycardia-tree.ts` que a consomem. Quem edita a constante não vê as telas que ela alimenta. ── O DEFEITO QUE ORIGINOU (2026-08-17) ──────────────────────────────────── O autor viu o app em espanhol mostrando conteúdo clínico em português. A varredura de fonte dizia ZERO pendências — e estava certa do próprio ponto de vista. O caso, medido: lib/causas-na-parada.ts → HIPERCALEMIA_NA_PARADA string em RUNTIME  : 722 caracteres chave no dicionário: 287 caracteres divergem no caractere 287 — onde a concatenação continua export const HIPERCALEMIA_NA_PARADA = "HIPERCALEMIA — a sequência tem TRÊS tempos…" + " " + CALCIO_EQUIVALENCIA + " (2) DESLOCAR o potássio…"; A chave foi gravada quando a frase terminava no primeiro pedaço. Depois a auditoria acrescentou a equivalência dos sais e o segundo tempo: a string cresceu, a chave ficou, e `tr()` devolveu o original — em silêncio. ⚠️ E A VARREDURA DE FONTE NÃO PODIA VER: no arquivo existem TRÊS literais curtos, cada um com a sua chave. Quem monta a frase de 722 caracteres é o programa. R-82.

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

## `test:gravidade-eletrolitica` → `scripts/valida-gravidade-eletrolitica.cjs`

- **PROMETE:** que os 12 distúrbios eletrolíticos tenham a classificação de gravidade COMO DADO, cada degrau com procedência de ALVO NOMEADO; que nenhum distúrbio fique sem degrau de base; que `getSeveritySummary` não volte a comparar contra o valor do paciente; e que um distúrbio existente SÓ no dado seja classificado sem tocar no componente.
- **NÃO PROMETE:** que os 12 cortes estejam clínicos certos — nenhum tem fonte ainda, e é exatamente isso que o campo `alvo` declara. Também não cobre o resto da tela: imprime, a cada rodada, quantas comparações contra o valor do paciente continuam no componente (D-84).
- **UNIVERSO:** `lib/eletrolitos/gravidade.ts`, compilado, com piso no retrato de 2026-08-23 (12 distúrbios, 24 degraus). A GRAVIDADE ELETROLÍTICA CONTINUA SENDO DADO — e o componente continua sem classificar. ⚠️ O QUE ESTA TRAVA IMPEDE: que o próximo corte volte para dentro do JSX. A extração é barata de fazer e barata de desfazer — basta alguém escrever `current < 3` numa condição de tela e o conteúdo clínico volta a morar onde nenhum instrumento o vê. ⚠️ E ELA CONFERE O QUE FOI EXTRAÍDO, não se a extração aconteceu: conta os degraus, exige procedência com ALVO nomeado em cada um, e prova que um distúrbio que existe SÓ no dado é classificado sem ninguém tocar no componente.

## `test:texto-vs-corte` → `scripts/valida-texto-vs-corte.cjs`

- **PROMETE:** que nenhum número escrito na PROSA da tela dos eletrólitos contradiga o corte declarado no dado para o mesmo analito. Se o texto diz "Ca < 7 mg/dL" e o corte é 1,9 mmol/L (≈ 7,62 mg/dL), reprova.
- **NÃO PROMETE:** que o corte esteja clínico certo, nem que a prosa esteja completa. Ela confere COERÊNCIA entre as duas cópias, não a verdade de nenhuma.
- **UNIVERSO:** os cortes com unidade declarada em `lib/eletrolitos/gravidade.ts` (impressos antes do resultado) × as strings da tela dos eletrólitos. ── R-95 NA SUA FORMA MAIS TEIMOSA ────────────────────────────────────────── O corte da hipocalcemia mudou de `< 7 mg/dL` para `< 1,9 mmol/L` (≈ 7,62) em 2026-08-23 — e **a prosa ao lado continuou dizendo o número velho**. Ninguém mente de propósito: o número saiu do lugar onde a trava olha e ficou onde ela não olhava. ⚠️ A segunda cópia não está em outro campo. Está NA FRASE.

## `test:formula-ag` → `scripts/valida-formula-do-ag.cjs`

- **PROMETE:** que o ânion gap que a calculadora DEVOLVE seja exatamente o que a fórmula declarada em `lib/anion-gap.ts` diz — e que o rótulo mostrado na tela seja derivado dos MESMOS termos que fazem a conta.
- **NÃO PROMETE:** que a fórmula escolhida seja a melhor, nem que os cortes estejam certos. A escolha entre AG com e sem potássio é decisão do autor (2026-08-23, SEM potássio); os cortes seguem herdados e pendentes (D-95).
- **UNIVERSO:** a ferramenta `anion-gap` de `clinical-calculators-engine.ts`, compilada, varrida em combinações de Na, Cl e HCO₃ — o número sai impresso. ORIGEM DO CRITÉRIO: decisão do autor datada (2026-08-23) — R-118. ── POR QUE ELA EXISTE ────────────────────────────────────────────────────── Existem duas fórmulas de ânion gap: com potássio (Na + K − Cl − HCO₃) e sem (Na − Cl − HCO₃). **Elas dão números diferentes e têm intervalos de referência diferentes.** Trocar uma pela outra sem trocar o intervalo desloca TODA a classificação — e o rótulo na tela continua idêntico. ⚠️ Sem esta trava, a decisão se desfaz em silêncio na primeira edição, como quase aconteceu com o `>= 14` da hipercalcemia.

## `test:unidade-de-campo` → `scripts/valida-unidade-de-campo.cjs`

- **PROMETE:** que todo campo de entrada numérica declare a unidade NO CAMPO, e que o rótulo exibido seja DERIVADO dela — nunca a fonte dela.
- **NÃO PROMETE:** que a unidade declarada seja a certa para a grandeza. Ela garante que existe e que a prosa não a contradiz — não que "mEq/L" seja o correto para aquele analito.
- **UNIVERSO:** os campos `kind: "number"` das calculadoras + as chamadas de `input(...)` da tela dos eletrólitos, contados antes do resultado. ORIGEM DO CRITÉRIO: decisão do autor datada (2026-08-23) — R-118, R-119. ── ⚠️ UNIDADE EM PROSA É TRADUZÍVEL; UNIDADE EM CAMPO, NÃO ───────────────── O app tem uma segunda cópia de todo texto em espanhol. Uma tradução que escreva "Peso (lb)" — por descuido ou por convenção local — **muda a unidade de entrada de um cálculo, e nenhum instrumento vê**, porque para eles aquilo é só prosa. Não aconteceu. Mas é o MESMO MECANISMO do D-80, em que o critério da hidrocortisona de fato divergiu entre os idiomas. Ali era conduta; aqui seria unidade de dose.

## `test:guarda-r47` → `scripts/valida-guarda-r47.cjs`

- **PROMETE:** que o guarda do R-47 esteja de pé — `git checkout` e `git restore` falham dentro de um ciclo de mutação, `git status` e `git diff` continuam funcionando, e o `muta.cjs` RECUSA iniciar com a árvore suja.
- **NÃO PROMETE:** que ninguém mute à mão, fora do harness. O guarda do PATH só alcança o que o `muta.cjs` dispara — e as quatro violações foram todas fora dele. É a pré-condição de árvore limpa que cobre esse caso, e por isso as duas metades existem.
- **UNIVERSO:** o shim `scripts/guarda-r47/git` e o `scripts/muta.cjs`. Cada tentativa é executada de verdade, não inspecionada por regex. ORIGEM DO CRITÉRIO: decisão do autor datada (2026-08-24) — R-118, R-128, R-133. ── ⚠️ POR QUE DUAS METADES ───────────────────────────────────────────────── **O PATH mata o verbo dentro do ciclo; a árvore limpa mata o estrago em qualquer lugar.** `git checkout` só destrói o que não está salvo — se a árvore estava limpa, um checkout perdido não custa nada (R-133).

## `test:referencias-eletroliticas` → `scripts/valida-referencias-eletroliticas.cjs`

- **PROMETE:** que os números extraídos para `lib/eletrolitos/referencias.ts` não voltem a existir como LITERAL na tela dos eletrólitos nem dentro de qualquer dicionário de tradução; que toda referência declare procedência com alvo nomeado; e que a moldura traduzida não tenha número onde o dado deveria entrar.
- **NÃO PROMETE:** que o número esteja clínico certo. Cinco das doze são conduta sem fonte, e é o campo `alvo` que diz isso. A trava garante que o número tem UMA DONA — não que a dona esteja certa.
- **UNIVERSO:** `lib/eletrolitos/referencias.ts` compilado + a tela dos eletrólitos + os 121 dicionários de `lib/i18n/modules`, contados antes do resultado. ── POR QUE ESTA TRAVA EXISTE (R-107) ─────────────────────────────────────── `154 mEq/L` e `8–10 mEq/L em 24 h` moravam DENTRO da frase traduzível. Toda frase dessas tem uma segunda cópia em espanhol, escrita noutro momento — e a medição de 2026-08-23 achou duas linhas em que o espanhol dizia OUTRO critério clínico (D-80). O número no dicionário tem duas donas. ⚠️ E A TRAVA OLHA O DICIONÁRIO, não só a tela: devolver o número ao espanhol é tão fácil quanto devolvê-lo ao componente, e mais difícil de notar.

## `test:censo` → `scripts/censo-de-instrumentos.cjs`

- **PROMETE:** que todo script de instrumento do repositório esteja no `test:all` ou numa isenção DATADA E JUSTIFICADA; que o número de instrumentos no portão não caia (piso registrado); que cada um RODE de fato; e que nenhum termine com código fora de {0,1} — porque 127, 126 e 2 são "não rodou", e "não rodou" saindo como verde é a mentira que este censo existe para matar.
- **NÃO PROMETE:** que o instrumento meça a coisa certa, nem que o universo dele seja suficiente. Isso é `valida-pipeline` (declaração de cobertura) e `lib/universo.cjs` (piso por instrumento). O censo cobre EXISTÊNCIA e EXECUÇÃO, não qualidade.
- **UNIVERSO:** `scripts/*.cjs` que casam com o padrão de instrumento, contados e impressos antes do resultado, com piso em auditoria/universo-dos-instrumentos.json. ── A FAMÍLIA QUE ELE NASCEU PARA MATAR (2026-08-23) ──────────────────────── Cinco coisas de uma rodada só, todas a mesma mentira — "está tudo bem" quando o correto era "nada foi olhado": 1. erro classificado saindo com código 0 (severidade não amarrada à saída) 2. três instrumentos FORA do test:all — 349 commits desde que nasceram 3. auditoria-doses-criticas MORTO desde a9b16ad, crashando na compilação 4. bloco pulado por `typeof === "function"`, relatório saindo limpo 5. uma varredura minha com `timeout` (inexistente no macOS): 53 instrumentos voltaram 127, e a saída vazia leu-se como "ninguém tem esse defeito" As duas últimas são as piores: o silêncio é indistinguível do sucesso.

## `audit:confirmacao` → `scripts/diag-confirmacao-repetida.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `audit:calculos` → `scripts/auditoria-calculos.cjs`

- **PROMETE:** que toda fórmula e todo escore das calculadoras rodem sem exceção e devolvam número finito nos casos varridos; e — desde 2026-08-23 — que qualquer achado que ELE MESMO classifica como "erro" REPROVE o build.
- **NÃO PROMETE:** que a fórmula seja a fórmula clínica certa. Ele confere que o cálculo não quebra e não devolve absurdo, não que o número seja o correto para o paciente — isso é conferência de fonte, e é do médico.
- **UNIVERSO:** as ferramentas de `clinical-calculators-engine.ts`, compiladas, com fórmulas e escores contados e impressos antes do resultado. CAMADA 4 — Auditoria de doses, diluições e cálculos. Dirige TODAS as calculadoras do app com valores-limite e observa o que sai. Não confere se a fórmula é a certa segundo a diretriz — confere se ela se comporta: um `NaN`, um `Infinity` ou um número negativo chegando à tela como dose é risco clínico independente de qual fórmula deveria estar ali. Casos exercitados, seguindo a lista do plano: - campo vazio, ausente e só espaço; - zero e negativo; - valores extremos (peso de 1 kg e de 400 kg, altura de 50 cm e 250 cm); - vírgula e ponto decimal (o app é pt-BR: "72,5" precisa valer); - texto onde se espera número; - casas decimais longas; - todos os presets declarados pela própria ferramenta. Para escores: verifica se `interpret` cobre a faixa inteira declarada em `totalRange`, extremos inclusive — faixa com buraco significa paciente sem classificação. Uso: node scripts/auditoria-calculos.cjs

## `audit:rastreabilidade` → `scripts/valida-rastreabilidade.cjs`

- **PROMETE:** que todo módulo com conteúdo clínico crítico tenha diretriz declarada em `guidelines_metadata.json`; que toda grafia de módulo usada por lá exista no mapa canônico; e — desde 2026-08-23 — que achado classificado como "erro" REPROVE o build. Antes ele saía com código 0 com 1 erro no meio de 50 avisos, e o erro era o módulo renal fora do mapa.
- **NÃO PROMETE:** que a diretriz declarada seja a certa, nem que esteja vigente. Ele confere que EXISTE declaração e que os nomes casam — a data de revisão continua saindo como aviso, não como reprovação.
- **UNIVERSO:** `guidelines_metadata.json` × `lib/modulos-canonicos.ts`, com o número de módulos críticos impresso antes do resultado. CAMADA 9 — Rastreabilidade: cada módulo clínico sabe de qual diretriz veio? ───────────────────────────────────────────────────────────────────────────── Por que isto vem ANTES da auditoria científica São 5.752 afirmações de risco crítico no app. Auditar cada uma exige saber contra o que conferir. Hoje a resposta está espalhada: parte em `protocols/guidelines_metadata.json`, parte escrita em comentário no topo do arquivo, parte em lugar nenhum. Este script mede a cobertura e aponta os buracos. Ele não julga se a diretriz citada é a certa nem se ela sustenta a afirmação — isso é a auditoria científica em si, com as fontes abertas e olho médico. ## O que verifica 1. módulo com conteúdo clínico e NENHUMA diretriz declarada; 2. diretriz cadastrada que não é usada por módulo nenhum; 3. `modules_using` apontando para módulo que não existe; 4. grafia de módulo que o mapa canônico ainda não conhece; 5. diretriz vencida pela própria política de revisão do app. Uso: node scripts/valida-rastreabilidade.cjs

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

## `test:prazo-visivel` → `scripts/valida-prazo-visivel.cjs`

- **PROMETE:** que nenhum alerta com PRAZO ou PRECEDÊNCIA viva SÓ num campo RECOLHIDO — `evidence` (o "Ver critérios (N)" dos nós de decisão) ou `porque` (o "por quê" dos passos de ação, criado em 2026-08-18). ⚠️ `porque` ENTROU AQUI NO MESMO COMMIT EM QUE NASCEU. Um campo recolhido que nenhuma trava conhece é conteúdo sem guarda desde o primeiro dia — e este nasceu justamente para receber texto que sai da tela, o que o torna o destino mais provável de um prazo em fuga.
- **NÃO PROMETE:** que todo ⚠️ esteja visível. A maioria não precisa estar, e exigir isso faria alguém TIRAR O ⚠️ para passar (R-55). Também não diz nada sobre o conteúdo clínico do alerta.
- **UNIVERSO:** as 17 árvores compiladas, derivadas do diretório. ── O DEFEITO QUE ORIGINOU (2026-08-17) ───────────────────────────────────── O `coronary/ecg` revelou que `evidence` renderiza RECOLHIDO, e a pergunta seguinte foi: quanto do que esta auditoria produziu está atrás desse toque? Medido: 15% do conteúdo das árvores e 18% dos alertas ⚠️ — 39 itens. A classificação em três colunas mostrou que a maioria está no lugar certo: MUDA CONDUTA AGORA (prazo, precedência, contraindicação) → tem de subir QUALIFICA A CONDUTA (por que a dose é essa)               → fica, e é certo ENSINA (mecanismo, fisiopatologia)                        → fica, e é para isso que serve ⚠️ E A CLASSE DO PRAZO É A ÚNICA COM CUSTO IRREVERSÍVEL: quem não viu perdeu a janela, e não há como recuperar depois. Por isso a trava é ESTREITA — pega prazo e precedência, e deixa em paz os 25 que estão certos onde estão.

## `test:timer-badge` → `scripts/valida-timer-badge-largura.cjs`

- **PROMETE:** que `timerTopRow` (rótulo do cronômetro + chips de choque/epinefrina) tenha largura própria dentro do badge — não encolhida ao conteúdo.
- **NÃO PROMETE:** nenhuma outra propriedade do badge, nem o alinhamento vertical.
- **UNIVERSO:** components/protocol-screen/acls-protocol-screen.tsx (timerTopRow) e components/protocol-screen/protocol-screen-styles.ts (timerBadge, o pai). ── O DEFEITO QUE ORIGINOU (2026-08-18) ───────────────────────────────────── `timerBadge` (protocol-screen-styles.ts) tem `alignItems: "center"` — usado para centralizar o valor grande ("43s"). Mas o mesmo alignItems faz TODO filho direto do badge encolher para a largura do CONTEÚDO em vez de esticar para a largura do badge. `timerTopRow`, que por dentro separa rótulo e chips com `justify-content: space-between`, é filho direto — e sem largura própria o space-between não tem o que distribuir: rótulo e chip ficam ENCOSTADOS, centralizados no meio do badge. Medido: a linha caía de 298 px para 165 px, e "Epi ×1" tocava/sobrepunha a última palavra de "PRÓXIMO RITMO". A CORREÇÃO é `alignSelf: "stretch"` só em `timerTopRow` — devolve a largura cheia a ESTE filho, sem tirar a centralização dos outros (o valor, a troca de compressor) que dependem do `alignItems: center` do badge.

## `test:voltar-fato` → `scripts/valida-voltar-preserva-fato.cjs`

- **PROMETE:** que VOLTAR mova o CURSOR e nunca o FATO — medicação administrada, choque aplicado, log do caso, linha do tempo e RELÓGIO sobrevivem ao voltar; e que TODO campo de `ACLSState` esteja classificado como cursor ou fato.
- **NÃO PROMETE:** que a classificação esteja clinicamente certa. Ela é decisão do médico e está escrita em `acls/estado-cursor-e-fato.ts`; aqui só se exige que exista, que cubra o tipo inteiro e que o motor a respeite.
- **UNIVERSO:** o tipo `ACLSState` (acls/reducer.ts), a classificação (acls/estado-cursor-e-fato.ts) e o motor executado de verdade (engine.ts). ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-18) ───────────────────────────────── `goBack` restaurava o instantâneo inteiro. Medido no motor real: dose 1 → 0, cronômetro do ciclo 1 → 0 (DESAPARECIA), log 6 → 4, linha do tempo 15 → 9. ⚠️ UM DEFEITO COM TRÊS PORTAS — botão do cabeçalho, etapa da tela e comando de voz chamam o MESMO `goBack`. Esta trava prova o conserto no motor E confere que as portas da tela continuam convergindo para ele; consertar só uma porta criaria duas com resultados diferentes.

## `test:aviso-auditoria` → `scripts/valida-aviso-de-auditoria.cjs`

- **PROMETE:** que, ENQUANTO houver módulo sem declaração de força por conduta, as duas telas onde o usuário COMPARA módulos (o hub e a página de produto) mostrem o aviso; e que a lista de módulos auditados não possa "adiantar" — ela é conferida contra o instrumento que realmente audita.
- **NÃO PROMETE:** que o aviso esteja legível, nem que o usuário o leia. Isso é medição de layout e de comportamento, e nenhuma das duas é feita aqui.
- **UNIVERSO:** os módulos clínicos declarados no app, com piso no retrato. ── ⚠️ POR QUE ISTO É TRAVA E NÃO OBSERVAÇÃO ─────────────────────────────── A assimetria (1 módulo com selo, 30 sem) é do tipo que NINGUÉM NOTA: ela não quebra tela, não falha teste, não aparece em relatório. E ela mente para o lado perigoso — quem compara lê "sem selo" como "recomendação mais fraca", quando o que ela significa é "ainda não auditado". É a mesma regra do piso de universo, agora virada para o usuário: um "não medi" apresentado sem etiqueta é lido como "medi e não achei". ── ⚠️ E POR QUE ELA SE DESARMA SOZINHA ──────────────────────────────────── Quando `MODULOS_COM_FORCA_DECLARADA` cobrir todos os módulos, o aviso deixa de ser exigido — e passa a ser exigida a REMOÇÃO dele, porque aviso que sobrevive ao seu motivo vira ruído e ensina a ignorar avisos.

## `test:antimicrobianos` → `scripts/valida-antimicrobianos.cjs`

- **PROMETE:** que as faixas de cada fármaco cubram a reta de ClCr SEM SOBREPOSIÇÃO e SEM BURACO, de 0 ao infinito; que toda faixa declare `metodoDaTFG` e procedência (fonte + força, ou `pendente` COM a pendência escrita); que as três modalidades de diálise existam, ainda que como `sem_dados` declarado; e que os quatro estados de `ajusteRenal` sejam coerentes com as faixas.
- **NÃO PROMETE:** que a dose esteja certa, nem que a fonte seja a melhor. Isso é leitura de bula, e é do médico. A trava garante que o CATÁLOGO não pode mentir por construção.
- **UNIVERSO:** `lib/antimicrobianos/catalogo.ts`, compilado, com piso no retrato. ── ⚠️ POR QUE SOBREPOSIÇÃO E BURACO SÃO A TRAVA CENTRAL ─────────────────── Enquanto a dose morava em ternários (`tfg > 50 ? A : tfg >= 25 ? B : …`), sobreposição era invisível: o encadeamento SEMPRE devolve alguma coisa, e a primeira condição verdadeira vence. Ninguém enxerga que duas faixas se cruzam lendo `if`s — e um buraco simplesmente cai no `else`, com a dose errada. Como DADO, os dois viram impossíveis por construção: **um ClCr pertence a exatamente uma faixa, ou a trava reprova.** ⚠️ E A FRONTEIRA É O PONTO CEGO CLÁSSICO. Um erro em `> 50` × `>= 50` muda a dose EXATAMENTE no valor 50 — um único ponto da reta, que nenhum teste de amostra pega e nenhuma revisão lê. Por isso a inclusividade é declarada campo a campo, e conferida aqui.

## `test:motor-antibiotico` → `scripts/valida-motor-antibiotico.cjs`

- **PROMETE:** que o motor da calculadora de antimicrobianos e a tela que a desenha NÃO contenham nome de fármaco, id de fármaco, dose nem limiar de ClCr do catálogo. A renderização é dirigida pelo DADO.
- **NÃO PROMETE:** que o dado esteja certo — isso é a `test:antimicrobianos` e a leitura de label. Aqui só se garante que o código não sabe clínica.
- **UNIVERSO:** a ferramenta `dose-antibiotico` em `clinical-calculators-engine.ts` e a tela `components/protocol-screen/clinical-calculators-screen.tsx`. ── ⚠️ POR QUE ISTO É TRAVA, E NÃO ESTILO ────────────────────────────────── Enquanto havia um `if` por fármaco, o bloco do próximo seria COPIADO do anterior — e é exatamente aí que a divergência nasce. Com 28 fármacos seriam 28 cópias, cada uma com a chance de errar a linha que o vizinho acertou. **Se o nome do remédio aparece na tela, a tela sabe clínica** — e clínica mora no catálogo, onde tem fonte por linha, trava de fronteira e varredura. ⚠️ E ESTA CALCULADORA É O ENSAIO DO MOTOR: é o mesmo padrão que o app inteiro precisa ter — dado declarativo + renderização dirigida pelo dado. Sete fármacos, quatro formas de tabela, escopo pequeno e verificável.

## `test:metodo-da-tfg` → `scripts/valida-metodo-da-tfg.cjs`

- **PROMETE:** que nenhuma linha do catálogo pressuponha uma equação de clearance diferente da que o campo de entrada da calculadora pede — e, se pressupuser, que isso apareça declarado, nunca em silêncio.
- **NÃO PROMETE:** que a equação declarada seja a certa para o fármaco. Isso é leitura de label, e está no verbatim de cada um.
- **UNIVERSO:** as linhas contínuas do catálogo (as de modalidade não pedem clearance), com piso no retrato. ── ⚠️ ESTA TRAVA NASCE VERDE, DE PROPÓSITO ──────────────────────────────── Hoje todas as linhas contínuas declaram `cockcroft_gault`, e é o que a tela pede. **É o instrumento que existe antes de precisar dele** — foi assim que o `deInclusivo` salvou o ponto 25 do meropeném, escrito quando ainda não havia divergência nenhuma para achar. ⚠️ E O DEFEITO QUE ELA IMPEDE É CARO: bula de aminoglicosídeo pressupõe ClCr ABSOLUTO (Cockcroft-Gault); corte de diretriz renal pressupõe TFG INDEXADA (CKD-EPI). No obeso e no caquético as duas se separam bastante — usar uma no lugar da outra é transpor calibração, a mesma família do pH < 7,0 vindo da cetoacidose.

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

## `test:traducao-composta`

_não executa script em scripts/ (e2e, playwright)_

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

## `test:eletrolitos` → `scripts/valida-eletrolitos.cjs`

- **PROMETE:** as constantes de sódio e cálcio conferem com a massa molar por RECÁLCULO (R-17), a paridade hipo × hiper se mantém, e torsades e fentanil não divergem entre módulos.
- **NÃO PROMETE:** que as condutas de reposição estejam certas — confere aritmética e uniformidade, não indicação.
- **UNIVERSO:** os módulos de eletrólitos; a varredura de torsades e fentanil é de universo ABERTO. Correções eletrolíticas: a aritmética fecha e os dois lados têm o mesmo cuidado. ── O QUE ESTE SCRIPT COBRA ────────────────────────────────────────────────── 1. AS CONSTANTES das soluções, contra a massa molar. NaCl 3% = 513 mEq/L, 20% = 3,42 mEq/mL, SF = 154, 0,45% = 77 — e a fração de mistura que transforma SF + NaCl 20% em 3%. São os números de onde sai todo o resto; errar um deles erra o módulo inteiro sem que nada mais denuncie. 2. PARIDADE HIPO × HIPER no sódio. O limite de 8 mEq/24 h da hipernatremia estava NO CÓDIGO e nunca era dito: "edema cerebral" 0×, "sobrecorreção" 0×, limite explícito 0× — contra 4× de sobrecorreção e o nome do dano do lado da hiponatremia, na MESMA tela. O erro simétrico é o esquecido. 3. OS DOIS SAIS DE CÁLCIO, com o fator. O módulo só oferecia gluconato, enquanto o app usa CLORETO em politrauma, choque e PCR na gestante — quem viu a droga lá lê os dois como intercambiáveis. 1 g de cloreto ≈ 3 g de gluconato em cálcio elementar. Este script FALHA O BUILD. Escrito com a lista do R-15.

## `test:osmolaridade` → `scripts/valida-osmolaridade.cjs`

- **PROMETE:** que a ÚNICA implementação viva do cálculo de osmolaridade — a calculadora `osmolalidade` em clinical-calculators-engine.ts — use o divisor 6 (ureia total) e não 2,8 (BUN); que separe osmolalidade TOTAL de EFETIVA; e que os avisos de texto sobre as duas armadilhas continuem na árvore viva do CAD/EHH.
- **NÃO PROMETE:** que as FAIXAS de interpretação da calculadora estejam alinhadas ao consenso 2024 (ver ⚠️ abaixo — há divergência aberta), nem que a árvore do CAD/EHH calcule osmolaridade: ela NÃO calcula, por decisão declarada (PD-3), e escreve a fórmula para o médico aplicar.
- **UNIVERSO:** clinical-calculators-engine.ts. (A árvore da CAD saiu do app em 2026-08-27, com a remoção da arquitetura clínica antiga.) ── POR QUE ESTA TRAVA MUDOU DE ALVO (14/ago) ─────────────────────────────── Ela travava `dka-hhs-engine.ts` — que é CÓDIGO MORTO desde 07/jun (D-22). Protegia um cálculo que a tela nunca executou, e do lado vivo só conferia que a FRASE da fórmula existia. Terceira trava da auditoria validando código inalcançável, junto com test:avc e test:coronary (D-25). Agora aponta para onde o cálculo vive de verdade: a calculadora clínica. A proteção passa a cobrir código que chega ao usuário — que era o ponto. ⚠️ DIVERGÊNCIA ABERTA, NÃO TRAVADA: as faixas de interpretação da calculadora tratam efetiva ≤ 320 como "hiperosmolalidade leve" e só sugerem EHH acima de 320. O consenso ADA/EASD 2024 (Diabetes Care 47:1257, Fig. 2B) usa efetiva > 300 como critério de EHH — 320 é o limiar da TOTAL. É o mesmo defeito corrigido na árvore em 14/ago, sobrevivendo aqui. Não travado ainda porque mudar faixa de interpretação é mudança de recomendação e precisa de decisão registrada.

## `test:faixas-invertidas` → `scripts/valida-faixas-invertidas.cjs`

- **PROMETE:** nenhuma faixa numérica "a–b" tem limite inferior maior que o superior, em nenhum texto clínico do app.
- **NÃO PROMETE:** nada sobre o VALOR das faixas. Uma faixa pode estar coerente consigo mesma e clinicamente errada.
- **UNIVERSO:** toda a árvore de conteúdo (.ts/.tsx), exceto scripts, e2e, locales e i18n. 1633 faixas lidas. valida-faixas-invertidas.cjs — R-22, item 1 ── A CLASSE ──────────────────────────────────────────────────────────────── Verificação que NÃO depende de fonte externa. Toda outra trava desta auditoria compara o app contra algo de fora — bula, publicação, massa molar, fonte única. Esta compara o app contra SI MESMO: uma faixa escrita "a–b" afirma que a é o limite inferior e b o superior. Se a > b, a afirmação se contradiz, e isso é decidível sem sair do repositório. Por isso ela cobre o que a auditoria módulo a módulo não alcança: os módulos sem diretriz citada (D-3) e os números atrás de paywall. ── O QUE NÃO É FAIXA ─────────────────────────────────────────────────────── O travessão em texto clínico é ambíguo, e uma trava que acusa inocente é pior que trava que não existe (R-22). Ficam de fora, NOMEADAMENTE: · relações e proporções — "I:E 1:2", "1:10.000" · intervalos de administração — "12/12h" · sequências decrescentes deliberadas — o degrau do Vt "8–7–6" na SDRA, o desmame de PEEP, a redução escalonada de sedativo · datas, versões, referências bibliográficas ("2016;315(8):762–774") · negativos — "RASS −5 a −4" tem inferior MENOR em valor absoluto e maior em sinal; a comparação é feita com sinal · faixa cujo segundo termo é unidade diferente do primeiro

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

## `test:calculadoras` → `scripts/valida-calculadoras.cjs`

- **PROMETE:** cada ferramenta confere com a publicação por RECÁLCULO, as fronteiras de faixa não se deslocam, a interpretação é monotônica na gravidade, e Glasgow/RASS/NIHSS não indicam conduta (R-19).
- **NÃO PROMETE:** que as ferramentas ausentes deveriam existir, nem que os limiares sem fonte aberta estejam certos — APACHE II segue sem a figura do Knaus.
- **UNIVERSO:** as 15 ferramentas de clinical-calculators-engine.ts. Validação estrutural das calculadoras clínicas. POR QUE ESTE SCRIPT EXISTE -------------------------- Cada calculadora do app cita, no próprio código, a publicação primária que a define. Nenhuma estava conferida contra ela — a citação existia, a verificação não. Conferir 15 artigos inteiros é caro e, na prática, não acontece. Mas quase toda publicação de escore declara um INVARIANTE verificável: a faixa que o escore pode assumir. E o invariante é sensível — a faixa só fecha se todos os pesos estiverem certos. Exemplo real: o APACHE II vai de 0 a 71 (Knaus 1985). Se a creatinina não dobrasse na insuficiência renal aguda, o máximo daria 67. Se o Glasgow fosse pontuado como as demais variáveis (teto 4 em vez de 12), daria 63. Se a idade parasse em 5 pontos, daria 70. Um único peso errado quebra o teste. O QUE ELE PROVA E O QUE NÃO PROVA --------------------------------- Prova que o conjunto de pesos fecha na faixa publicada. NÃO prova que cada faixa individual de cada variável está no ponto certo — para isso é preciso o texto completo com as tabelas. É bem mais do que "a citação está no comentário", e bem menos do que uma auditoria completa. O relatório diz exatamente qual das duas coisas cada calculadora recebeu. COMO ESTENDER ------------- Acrescente uma entrada em INVARIANTES com a faixa e a fonte. Se a publicação não declarar faixa, registre `faixa: null` com o motivo: o script conta como PENDENTE em vez de fingir cobertura.

## `build:web`

_não executa script em scripts/ (e2e, playwright)_

## `test:e2e`

_não executa script em scripts/ (e2e, playwright)_

---

## Cobertura por módulo — e onde ela NÃO existe

**ESTRUTURA** vale para todos por construção: `test:arvores` percorre o grafo
de cada árvore e `e2e/modulos.spec.ts` abre os 30 módulos. Isso NÃO diz que o
conteúdo clínico está certo — diz que ele é alcançável e que a tela monta.

**Fora desta tabela, e auditados:** Vasoativas · Eletrólitos · Calculadoras Clínicas — são telas
de calculadora, sem árvore de decisão. A ausência deles aqui não é lacuna.

| Módulo | Estrutura | Auditado na Fase 1–2 | **Nós interrogados** | Travas que TOCAM o módulo |
|---|---|---|---|---|

⚠️ **Nós interrogados** é medida de ALCANCE, não de qualidade: conta os nós
em que ao menos um padrão da trava casa com algum texto. Nó fora da conta
está dentro do universo da trava e fora de toda asserção dela — uma regressão
ali passa verde (R-74, D-44). `npm run mapa:cobertura -- --mudos` lista quais.
