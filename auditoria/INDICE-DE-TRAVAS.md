# Índice das travas do `test:all`

**GERADO DE `scripts/indice-de-travas.cjs` — não editar à mão.**

Este índice existe porque o `test:all` ficou grande demais para alguém saber de cabeça o que ele cobre. Duas vezes nesta auditoria começou-se a construir um verificador que já existia; a lacuna era de inventário, não de cobertura.

⚠️ Ele lê o que cada trava **diz de si mesma**. Que a declaração seja verdadeira é o que a mutação prova (R-1), não este índice.

**15 de 34 travas com declaração completa.**

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

## `test:nota-epi` → `scripts/test-nota-epinefrina.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `node ./scripts/verify-acls-flow.cjs` → `scripts/verify-acls-flow.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

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

## `test:vm` → `scripts/valida-ventilacao.cjs`

- **PROMETE:** o peso predito tem implementação ÚNICA (a constante 152.4 não aparece em nenhum outro arquivo), recusa sexo indeterminado, e os alvos do TCE vêm de lib/alvos-tce.ts.
- **NÃO PROMETE:** que os parâmetros ventilatórios estejam certos para cada cenário.
- **UNIVERSO:** árvore INTEIRA para a fonte única do PBW; lista fixa de 6 arquivos para os alvos do TCE. Ventilação: peso predito tem UMA fonte, e ela recusa o que não sabe. ── OS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ─────────────────────────────────── 1. DUAS implementações de PBW, discordando onde ninguém olha — no sexo AUSENTE. A árvore assumia HOMEM (`sexo === "feminino" ? 45,5 : 50`); o motor assumia MULHER (`/^m/i` falha em string vazia). Mesmo paciente, mesmo app: a 175 cm, PBW 70,6 × 66,1 kg → Vt 423 × 396 mL. As duas devolviam um número, nenhuma avisava. 2. O `/^m/i` do motor classificava **"Mulher" como masculino**, por testar a INICIAL. Não era hipótese: o campo é `TextInput` de valor livre, com os presets como botões de conveniência abaixo. 3. O portão do plano ventilatório era `!pbw || !scenario`. Com sexo em branco o PBW saía preenchido (pelo default feminino), então o app montava modo, Vt, FR, PEEP e FiO₂ enquanto declarava, na mesma tela, que faltava o sexo. ── POR QUE A TRAVA ÓBVIA PASSARIA VERDE ───────────────────────────────────── Comparar as duas fórmulas com sexo INFORMADO não pega nada: elas sempre concordaram aí. A divergência morava só na ausência. Por isso o caso "sexo ausente" é verificado EXPLICITAMENTE, e o esperado não é concordância de número — é RECUSA nos dois lados. Este script FALHA O BUILD. Vt errado é dose errada.

## `test:peso` → `scripts/valida-peso-origem.cjs`

- **PROMETE:** todo módulo com dose peso-dependente exibe a ressalva quando o peso é estimado, e a ressalva mede EFEITO e não grafia (R-10).
- **NÃO PROMETE:** que o peso informado esteja certo — só que a incerteza dele seja declarada onde a dose depende dela.
- **UNIVERSO:** os 9 módulos que recebem peso pelo contexto do paciente. Peso estimado: quem pergunta de onde veio o peso tem de usar a resposta. ── O DEFEITO QUE ORIGINOU ESTE SCRIPT ─────────────────────────────────────── `pesoOrigem` era perguntado em NOVE módulos e lido por NENHUM. Nove perguntas ao médico, em emergência, para um dado que nenhuma linha de código consumia — atrito puro no exato lugar onde o app promete reduzir atrito. E os nove calculam dose por peso: alteplase, tenecteplase, insulina, heparina, manitol, salina hipertônica, cristaloide, sedativos, bloqueadores. O erro do peso passa integralmente para a dose, e em vários há teto absoluto. ── O QUE ESTE SCRIPT COBRA ────────────────────────────────────────────────── A. Árvore que coleta `peso` também coleta `pesoOrigem`. Dose por peso sem saber a procedência do peso é dose sem ressalva possível. B. `pesoOrigem` só oferece valores do domínio fechado (estimado/real). C. O shell renderiza a ressalva — sem isso, os nove voltam a perguntar por nada. D. Os quatro módulos com TETO de dose repetem a ressalva na linha da dose. Este script FALHA O BUILD.

## `test:isr` → `scripts/valida-isr.cjs`

- **PROMETE:** os multiplicadores do derive batem com lib/doses-isr.ts, a redução no instável é ensinada, e nenhum arquivo prescreve succinilcolina por quilo sem o teto de 200 mg.
- **NÃO PROMETE:** que lib/doses-isr.ts seja consumida por import — ela NÃO é (D-14). Isto é um contrato vigiado por trava, não uma fonte única real (R-25).
- **UNIVERSO:** ISR e Sedoanalgesia para as doses; universo ABERTO para o teto da succinilcolina. ISR: a dose do instável tem UMA fonte, e a via acordada é caminho, não menção. ── OS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ─────────────────────────────────── 1. A Sedoanalgesia dizia "ISR (paciente instável): 1,5–2 mg/kg" de cetamina — a faixa CHEIA de indução, rotulada como a do instável. O módulo de ISR, para o MESMO paciente, manda 1 mg/kg (0,5 no choque grave). Um mandava reduzir, o outro mandava dose plena, a um clique de distância. 2. O nó de via aérea difícil dizia "considerar intubação acordada" e seguia DIRETO para a indução: quem escolhesse a técnica acordada não tinha para onde ir. Primeiro achado da auditoria que não é número errado — é uma VIA CLÍNICA que o app não permitia percorrer. Também não existia a saída "não intubar agora". ── O QUE ESTE SCRIPT COBRA ────────────────────────────────────────────────── A. Os multiplicadores do derive da árvore de ISR batem com lib/doses-isr.ts. B. A Sedoanalgesia ensina a REDUÇÃO no instável — nunca a faixa plena rotulada como dose do instável. C. A via acordada e o deferimento são NÓS ALCANÇÁVEIS, oferecidos como opção na decisão de estratégia — não menções em texto. D. As frases literais de doses-isr.ts repetem os números de DOSES_ISR (são literais para a tradução enxergar; o vínculo é esta trava). Este script FALHA O BUILD. Dose de indução errada no chocado é PCR peri-intubação.

## `test:sedacao` → `scripts/valida-sedacao.cjs`

- **PROMETE:** aritmética das diluições, dois eixos declarados (sedação × bloqueio), aviso do BNM com o mesmo peso visual nos três, e nenhum alvo de sedação aposentado escrito em lugar nenhum.
- **NÃO PROMETE:** que as indicações de sedação estejam certas. A proibição de alvo aposentado cobre grafia, não julgamento clínico.
- **UNIVERSO:** universo ABERTO para o alvo de RASS (inclui traduções); os módulos de sedação para o resto. Sedoanalgesia & BNM: a bolsa fecha, e os dois eixos não se confundem. ── OS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ─────────────────────────────────── 1. O atracúrio anunciava "5 amp (250 mg) + 200 mL SF → 250 mL · 1 mg/mL". 5 × 5 mL + 200 = 225 mL, não 250, e a concentração real era 1,11 mg/mL. Única das 20 soluções do módulo cuja aritmética não fechava — e só apareceu porque as 20 foram conferidas uma a uma. 2. O midazolam marcava de VERMELHO tudo acima de 0,20 mg/kg/h. O módulo de Convulsões manda 0,05–2 mg/kg/h no status refratário — dez vezes isso, e está certo. São OBJETIVOS diferentes: sedação titulada por RASS (meta de paciente acordado) × anestesia terapêutica com EEG (meta de supressão). Sem declarar os dois eixos, o app pintava de vermelho a dose correta. 3. O cisatracúrio dizia faixa 0,1–0,2 mg/kg/h e, no mesmo fármaco, citava o ACURASYS com 37,5 mg/h — ~0,54 mg/kg/h em 70 kg, quase 3× o topo da própria faixa. Infusão titulada por TOF e protocolo de dose fixa apresentados como a mesma coisa. Este script FALHA O BUILD. ── ESCRITO COM A LISTA DO R-15 ────────────────────────────────────────────── Comentários removidos antes de conferir conteúdo (os comentários acima citam os números proibidos); toda leitura que pode não encontrar FALHA em vez de seguir; e o que se compara é a ARITMÉTICA, não a grafia do rótulo.

## `test:eletrolitos` → `scripts/valida-eletrolitos.cjs`

- **PROMETE:** as constantes de sódio e cálcio conferem com a massa molar por RECÁLCULO (R-17), a paridade hipo × hiper se mantém, e torsades e fentanil não divergem entre módulos.
- **NÃO PROMETE:** que as condutas de reposição estejam certas — confere aritmética e uniformidade, não indicação.
- **UNIVERSO:** os módulos de eletrólitos; a varredura de torsades e fentanil é de universo ABERTO. Correções eletrolíticas: a aritmética fecha e os dois lados têm o mesmo cuidado. ── O QUE ESTE SCRIPT COBRA ────────────────────────────────────────────────── 1. AS CONSTANTES das soluções, contra a massa molar. NaCl 3% = 513 mEq/L, 20% = 3,42 mEq/mL, SF = 154, 0,45% = 77 — e a fração de mistura que transforma SF + NaCl 20% em 3%. São os números de onde sai todo o resto; errar um deles erra o módulo inteiro sem que nada mais denuncie. 2. PARIDADE HIPO × HIPER no sódio. O limite de 8 mEq/24 h da hipernatremia estava NO CÓDIGO e nunca era dito: "edema cerebral" 0×, "sobrecorreção" 0×, limite explícito 0× — contra 4× de sobrecorreção e o nome do dano do lado da hiponatremia, na MESMA tela. O erro simétrico é o esquecido. 3. OS DOIS SAIS DE CÁLCIO, com o fator. O módulo só oferecia gluconato, enquanto o app usa CLORETO em politrauma, choque e PCR na gestante — quem viu a droga lá lê os dois como intercambiáveis. 1 g de cloreto ≈ 3 g de gluconato em cálcio elementar. Este script FALHA O BUILD. Escrito com a lista do R-15.

## `test:osmolaridade` → `scripts/valida-osmolaridade.cjs`

- **PROMETE:** os divisores da osmolaridade batem com a massa molar (glicose/18, ureia/6), o critério de EHH usa a EFETIVA e o rótulo do campo distingue ureia de BUN.
- **NÃO PROMETE:** nada sobre os demais cálculos dos módulos envolvidos.
- **UNIVERSO:** os módulos que CALCULAM osmolaridade e os quatro que a ENSINAM. Osmolaridade calculada: uma fórmula só, com o divisor da UREIA, e o critério de EHH pela EFETIVA. ── O DEFEITO QUE ORIGINOU ESTE SCRIPT ─────────────────────────────────────── `dka-hhs-engine` calculava `2×Na + glic/18 + ureia/2,8` e comparava o resultado contra o limiar de 320 do EHH. Dois erros somando na mesma direção: · 2,8 é o divisor do BUN (nitrogênio ureico). O campo pede UREIA — rótulo, faixa do helper (~10–50 contra 7–20 do BUN), conversão ×6 e presets, tudo diz ureia. Ureia ÷ 2,8 infla esse termo em 6 ÷ 2,8 = 2,14×. · O limiar de 320 é de osmolalidade EFETIVA, que EXCLUI a ureia (osmol ineficaz). Comparar a TOTAL contra ele infla de novo. Resultado medido: +8 a +23 mOsm, e em Na 138 / glic 500 / ureia 60 a classificação MUDAVA — o app dizia EHH onde os dois critérios corretos diziam que não. E CAD rotulada como EHH recebe insulina menor e hidratação mais longa enquanto a cetoacidose corre. ── O QUE ESTE SCRIPT COBRA (R-17: RECALCULA, não compara) ────────────────── Os divisores são DERIVADOS da massa molar — glicose 180 (÷18 para mg/dL → mmol/L) e ureia 60 (÷6). O script não pergunta ao app quanto dá: ele calcula. É a única forma que um erro CONSISTENTE não atravessa. Este script FALHA O BUILD.

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

## `test:avc` → `scripts/test-avc-engine.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:coronary` → `scripts/test-coronary-engine.cjs`

- **PROMETE:** ⚠️ NÃO DECLARADO
- **NÃO PROMETE:** ⚠️ NÃO DECLARADO
- **UNIVERSO:** ⚠️ NÃO DECLARADO

## `test:e2e`

_não executa script em scripts/ (e2e, playwright)_
