# Índice das travas do `test:all`

**GERADO DE `scripts/indice-de-travas.cjs` — não editar à mão.**

Este índice existe porque o `test:all` ficou grande demais para alguém saber de cabeça o que ele cobre. Duas vezes nesta auditoria começou-se a construir um verificador que já existia; a lacuna era de inventário, não de cobertura.

⚠️ Ele lê o que cada trava **diz de si mesma**. Que a declaração seja verdadeira é o que a mutação prova (R-1), não este índice.

**25 de 42 travas com declaração completa.**

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
- **NÃO PROMETE:** que a tradução esteja correta, nem cobre texto dentro de template literal com ${} — que é justamente onde a frase escapa da varredura.
- **UNIVERSO:** os arquivos de conteúdo e os módulos de i18n. Varredura exaustiva de texto em português no código VIVO do app. Por que existe: a checagem antiga só perguntava se as chamadas tr() já existentes tinham tradução — e por isso dizia "faltando 0" com o app inteiro em português. Aqui o critério é outro: extrai TODO literal com prosa em português, esteja ele dentro de tr() ou não, e confronta com os dicionários. Uso:  node scripts/varredura-pt.cjs [--json <arquivo>] Saída: por arquivo, as frases sem tradução em es-419; código de saída 1 se houver pendências.

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
- **UNIVERSO:** grafo de imports a partir de `app/**` (rotas do expo-router), contra os arquivos de conteúdo clínico da raiz. ── POR QUE ESTA TRAVA EXISTE ─────────────────────────────────────────────── A auditoria corrigiu conteúdo clínico DENTRO de `anafilaxia-engine.ts`, `eap-engine.ts` e `ventilation-engine.ts` — três vezes, ao longo de semanas — sem saber que a tela nunca os executa. ~13.000 linhas inalcançáveis, e o defeito só apareceu por acidente, ao tentar mostrar um número de cronômetro na tela. Um `grep` de "quem importa este arquivo?" NÃO teria pegado: os três SÃO importados, por `clinical-modules.ts`, que é alcançável. A morte deles é de RENDER, não de import — e é a classe que esconde volume, porque tudo parece conectado. Um quinto arquivo (`sepsis-antibiotic-engine.ts`, 364 linhas) era da primeira classe e passou despercebido pela varredura manual dos quatro. Foi encontrado por grep, não por leitura — R-29 outra vez.

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

| Módulo | Estrutura | Auditado na Fase 1–2 | Travas que TOCAM o módulo |
|---|---|---|---|
| `acute-abdomen` | ✅ | — | **nenhuma** |
| `anaphylaxis` | ✅ | ✅ | test:isr, test:prazos |
| `avc` | ✅ | — | test:peso |
| `coronary` | ✅ | — | test:peso, test:calculadoras |
| `dka-hhs` | ✅ | ✅ | test:peso, test:eletrolitos, test:osmolaridade |
| `dyspnea` | ✅ | — | **nenhuma** |
| `eap` | ✅ | ✅ | test:dobutamina |
| `eclampsia` | ✅ | — | test:sulfatacao |
| `poisoning` | ✅ | — | test:osmolaridade, test:antidotos, test:ordem-clinica-parcial |
| `politrauma` | ✅ | — | **nenhuma** |
| `rsi` | ✅ | ✅ | test:isr, test:sedacao, test:eletrolitos, test:ordem-clinica-parcial, test:calculadoras |
| `seizure` | ✅ | — | test:sedacao, test:cronometro-arvore |
| `sepsis` | ✅ | ✅ | test:dobutamina, test:ordem-clinica-parcial |
| `shock` | ✅ | — | **nenhuma** |
| `tce` | ✅ | — | test:osmolaridade |
| `tep` | ✅ | — | test:dobutamina, test:peso, test:calculadoras |
| `ventilation` | ✅ | ✅ | test:sedacao, test:eletrolitos |

### ⚠️ 4 módulo(s) sem cobertura de CONTEÚDO

`acute-abdomen`, `dyspnea`, `politrauma`, `shock`

Nenhuma trava toca estes módulos, e nenhum foi auditado. A
estrutura é vigiada; o conteúdo clínico não. **AVC e Coronárias estão aqui
por decisão declarada (D-25)**: as travas que existiam validavam os engines
mortos, e reescrevê-las contra as árvores exige auditar os módulos, o que a
Fase 1 nunca fez. Cobertura zero DECLARADA é aceitável; silenciosa não.
