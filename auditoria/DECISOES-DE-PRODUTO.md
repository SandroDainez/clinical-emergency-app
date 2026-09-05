# Decisões de produto — separadas da auditoria clínica

Este arquivo existe porque uma pergunta apareceu durante a varredura de D-22
que **não é um achado de auditoria** — não há certo/errado clínico a
verificar, é uma escolha de escopo do produto. Decisões aqui são do Sandro e
de quem conduz a auditoria, juntas, e vivem separadas de
`DIVIDAS-CONHECIDAS.md` (que é só o que falta corrigir) e do `METODO.md`
(que é só regra de verificação).

---

## PD-1 · O módulo Sepse cobre só o atendimento inicial, ou também o
## paciente internado em piora?

**De onde saiu.** A varredura exaustiva de `sepsis-engine.ts` (código morto
para o fluxo, D-22) encontrou ~6.500 linhas de conteúdo clínico sem
equivalente na árvore viva: SOFA calculável por sistema, ajuste renal/diálise
por antibiótico, alternativa para alergia a beta-lactâmico, isolamento e
precauções, e um fluxo inteiro para o paciente já internado em UTI que piora
(PAV, CRBSI, candidemia, escalonamento por cultura, choque refratário com
resgate avançado, critérios de desmame).

**Por que não é achado de auditoria.** Nas outras categorias (vale portar por
omissão pontual, duplicata, obsoleto, contradição) a pergunta é "isto é
verdade clínica que falta ou diverge?". Aqui a pergunta é outra: **"isto é
produto que o módulo nunca teve como meta oferecer?"** A árvore de Sepse
cobre, de ponta a ponta, o pacote da 1ª hora e a decisão inicial —
exatamente o que `sepsis-decision-tree.ts` promete no seu próprio
`intro`. O conteúdo do engine morto vai muito além disso: é o manejo de
DIAS de UTI, não de HORAS de emergência.

**A pergunta, por extenso:** o módulo Sepse deve crescer para cobrir o
paciente internado em piora (PAV, CRBSI, escalonamento por cultura, SDRA
por sepse, choque refratário avançado), ou o escopo dele termina na
estabilização inicial e o resto é PRODUTO NOVO — um módulo de "Sepse — UTI"
ou equivalente, com sua própria auditoria?

**Por que a pergunta não é só da Sepse.** O mesmo padrão de arquitetura
(árvore cobre o agudo, engine morto tinha ambição maior) provavelmente
existe nos outros três módulos da mesma leva (Anafilaxia, EAP, Ventilação)
e talvez no app inteiro — nenhum módulo hoje declara explicitamente até onde
vai. A resposta aqui é o primeiro caso, não o único, e o critério que sair
dela deveria se aplicar aos 30 módulos ao decidir o tamanho da Fase 2.

**DECIDIDA — o app termina na estabilização inicial e nas decisões que
decorrem dela. Não cobre o paciente internado em piora.**

Três razões, do Sandro:

1. **É um app de beira-leito sob pressão**, e é aí que protocolo em tela
   ajuda. Conduta de dias depois se decide com prontuário, cultura e
   parecer — onde o app agrega pouco.
2. **Escalonamento empírico depende de perfil de resistência LOCAL.**
   Conselho genérico de descalonamento pode ser PIOR que silêncio, e não
   há como manter isso por instituição.
3. **Superfície de auditoria.** 30 módulos e 34 travas já é o limite do que
   esta disciplina sustenta. Uma segunda fase de cuidado multiplica isso.

## ⚠️ A separação que a formulação original escondia

A pergunta original agrupava cinco coisas como se fossem uma. **Quatro delas
NÃO são "internado em piora" — são PRIMEIRA HORA, e entram no escopo:**

| Item | Por que é primeira hora |
|---|---|
| **SOFA calculável por sistema** | É o critério DIAGNÓSTICO formal de sepse (Sepsis-3). Hoje está só citado por nome na árvore — não dá para calcular o que define o diagnóstico. Não é conteúdo de fase seguinte. |
| **Ajuste renal de antibiótico** | Decide a PRIMEIRA dose. E o app já tem parte disso nas Calculadoras — o problema é delegação, não ausência (R-33). |
| **Alergia a beta-lactâmico** | Decide QUAL antibiótico na primeira hora. Ausência total é lacuna real. |
| **Isolamento / precauções** | Decide no primeiro contato, e protege TERCEIROS. Fora de escopo seria estranho num app de emergência. |

**Fora do escopo, confirmado:** PAV, CRBSI, candidemia, descalonamento
dirigido por cultura, resgate avançado no choque refratário (angiotensina
II, azul de metileno), SDRA por sepse com prona/BNM/ECMO, critérios de
desmame, profilaxias de bundle de internação.

O critério que sai daqui, e que vale para os 30 módulos: **a fronteira não é
"agudo × crônico", é "decisão que o médico toma COM O PACIENTE NA FRENTE e
sem os dados que só chegam depois"**. Cultura, perfil de resistência local e
evolução de dias ficam do lado de fora — mesmo quando a doença é a mesma.

**Ligação:** [D-22](DIVIDAS-CONHECIDAS.md#d-22) (o destino dos engines
mortos não depende desta decisão — mesmo se o escopo maior for aprovado
como produto futuro, o conteúdo seria reescrito/revisado antes de entrar,
não copiado do engine morto direto).

---

## PD-2 · Escopo pediátrico — DECIDIDA

**Decisão:** os módulos declaram população **ADULTA**. Onde havia dose ou
conduta pediátrica avulsa, a ausência agora é **declarada**, não silenciosa —
um ponteiro (`FORA_DE_ESCOPO_PEDIATRICO`, `lib/escopo-pediatrico.ts`) substitui
o fragmento: *"Dose pediátrica fora do escopo deste app — usar protocolo
pediátrico."*

**Onde havia dose pediátrica — oito sítios, não sete.** O levantamento
original (Anafilaxia 5, ISR 1, Convulsões 1) achou o essencial, mas a
varredura escrita para a TRAVA (não a auditoria manual) achou um oitavo:
`sedation-engine.ts:575` (Sedoanalgesia — calculadora VIVA), mesmo padrão do
ISR (atropina pré-medicação para bradicardia vagal em succinilcolina
pediátrica). Corrigido junto. **Isto é o argumento vivo a favor da trava
abaixo** — a varredura por padrão achou o que a leitura dirigida não achou,
mesmo módulo a módulo.

Convulsões (`seizure-decision-tree.ts:204`) foi revisado e **não** alterado:
a menção a "diazepam retal é prática pediátrica" ali não é uma dose — é a
razão pela qual a via retal foi excluída do módulo adulto. Já é ausência
declarada, no sentido que esta decisão pede.

**Por que é reversível, e por que não é barato reverter.** Uma trilha
pediátrica de verdade não é trocar os números de volta — exige
infraestrutura que o app não tem hoje: peso pediátrico com faixas próprias
(`lib/faixas-de-entrada.ts` é só adulta), sinais vitais por faixa etária, e
calculadoras de dose próprias (não uma linha a mais numa calculadora
adulta). Reverter PD-2 sem essa infraestrutura recriaria exatamente o
defeito que a motivou: fragmento avulso, sem trilha, na próxima fonte que
citar as duas populações.

**A trava:** `scripts/valida-escopo-pediatrico.cjs` (`test:escopo-pediatrico`,
dentro de `test:all`) — nenhum arquivo de conteúdo vivo pode introduzir
número por peso (mg/kg, mcg/kg, mL/kg) perto de palavra pediátrica, ou
dispositivo exclusivamente pediátrico (EpiPen Jr), sem que seja o próprio
ponteiro. Os três engines mortos (D-22) são exceção nomeada — não podem
crescer o app de qualquer forma, mas também não são o alvo desta trava.
Mutação provada antes de usar (R-10): a trava pega o achado real
(`sedation-engine.ts`, mg/kg + criança) e o EpiPen Jr (sem mg/kg), e não
acusa nem o próprio ponteiro nem uma dose adulta comum.

**Ligação:** [D-22](DIVIDAS-CONHECIDAS.md#d-22b) (itens B do quadro de
categoria 4).

---

## PD-3 · CAD/EHH — a classificação CAD × EHH fica MANUAL

**Contexto.** Verificado por execução: a árvore viva **não calcula
osmolaridade e não coleta sódio**. `deriveDka()` computa só doses de
insulina, volumes e déficit. Os campos de entrada são cinco — glicemia,
potássio, pH, peso, origem do peso. O nó `classificacao` é uma `decision`
com botões: **o usuário classifica, não o app.** O critério de
osmolalidade existe como texto de apoio para ele aplicar de cabeça.

**DECIDIDA: a classificação manual FICA.** A escolha é defensável — o
médico à beira do leito distingue CAD de EHH pela clínica, e o app entrega
o critério escrito. O que **não** seria defensável é o app ter pH e
glicemia na mão e não usar nenhum dos dois para ajudar na escolha que ele
próprio pede.

**Dois acréscimos, e eles resolvem coisas diferentes:**

**(a) Usar o que já se coleta.** Quando pH e glicemia forem discordantes
do ramo escolhido — pH 7,0 com glicemia 900 apontando para EHH, por
exemplo — sinalizar a incoerência em vez de seguir mudo. Não bloqueia a
escolha: aponta o conflito entre o que foi digitado e o que foi marcado.

**(b) NÃO acrescentar coleta de sódio para calcular osmolaridade.** O
critério fica manual, e isso passa a ser **decisão declarada no
conteúdo**: *"este módulo não calcula a osmolalidade efetiva — use a
fórmula ao lado ou a calculadora"*, com ponteiro para as Calculadoras
Clínicas, que já a têm. Ausência declarada, não silenciosa (R-13).

**Relação com o ramo misto:** são mecanismos distintos e os dois ficam. O
ramo misto (implementado) existe para quem preenche critérios dos DOIS —
27% a um terço dos casos, com regime próprio. O acréscimo (a) existe para
outro caso: discordância entre o ramo escolhido e os dados coletados.
Sinalizar incoerência **não substitui** o terceiro ramo: deixar o usuário
escolher entre dois ramos errados seria ressalva sem alternativa, que é o
R-23 ao contrário.

**Status:** decidida; (a) e (b) ainda não implementados.

---

## PD-4 · TCE penetrante — DECIDIDA (2026-08-16)

**Decisão: o app NÃO cobre o manejo do TCE penetrante, e a exclusão passa a ser
DECLARADA na tela — não presumida.**

### Como o assunto apareceu

Achado lateral da sonda da D-36. Ao confirmar que **não existe 5ª edição** das
diretrizes de TCE grave, apareceu que a Brain Trauma Foundation publicou a **2ª
edição das *Guidelines for the Management of Penetrating TBI* (2025)**.

O app mencionava "ferimento penetrante craniano" **uma vez** — no nó de
neurocirurgia, como sinal que dispensa esperar o laudo — e não tinha conduta
própria. ⚠️ **Menção solta num app em que tudo o mais tem conduta sugere que o
assunto está tratado.**

### FRONTEIRA, NÃO MURO — e por quê

O paciente com ferimento penetrante **também tem** lesão cerebral, hipertensão
intracraniana, via aérea e coagulação para cuidar. Uma exclusão dura ("abra a
diretriz específica") faria alguém **abandonar o que este módulo tem de útil**,
que é a maior parte do que se faz na primeira hora.

Mesma escolha da **PD-2** (pediatria) e do diazepam retal nas Convulsões: a
ausência é declarada, e o que continua valendo é dito com todas as letras.

### O critério é OPERACIONAL, e vem antes da lista

> **Se a conduta depende da TRAJETÓRIA, do OBJETO ou da DURA, está fora deste
> módulo. Se depende de PRESSÃO, PIC, VIA AÉREA e COAGULAÇÃO, está aqui e
> continua valendo.**

Cinco eixos ninguém decora sob pressão; três palavras-chave, sim. A lista vem
abaixo como detalhamento: (1) **antibiótico** — o eixo é nomeado e o esquema
NÃO é dado, porque meia-cobertura de antibiótico é pior que nenhuma;
(2) indicação e técnica cirúrgica; (3) **o objeto encravado não se remove** fora
do centro cirúrgico; (4) imagem vascular (aneurisma traumático, lesão de seio);
(5) a trajetória, que decide prognóstico de um jeito que o Glasgow não captura.

### ⚠️ O gatilho de acionamento PERMANECE

A menção original continua no nó de neurocirurgia **como gatilho**: ferimento
penetrante dispensa esperar o laudo da tomografia, e isso é conduta deste
módulo. O texto diz isso explicitamente, para impedir a leitura de que
"penetrante" agora só serve para mandar o médico embora.

### As outras menções de "penetrante" NÃO são este caso

Varredura feita antes de escrever:

| onde | uso | tem conduta? |
|---|---|---|
| `politrauma:50` | critério de **TRAUMA MAIOR** | ✅ sim — sala de emergência e equipe completa |
| `causas-reversiveis:172,179` | pista de **tamponamento** | ✅ sim — pericardiocentese e toracotomia de ressuscitação |

**A exclusão é do MANEJO DO TCE PENETRANTE, não do mecanismo** — escrever
"trauma penetrante está fora do escopo" contradiria dois módulos que o tratam
corretamente.

### REVERSÍVEL — e a trilha já está identificada

**Fonte para quem quiser abrir:** Brain Trauma Foundation, *Guidelines for the
Management of Penetrating Traumatic Brain Injury*, **2ª edição (2025)** —
identificada e **não aberta**. Nada da conduta dela foi reproduzido aqui; ela é
nomeada como o lugar onde a conduta está.

**Custo de reverter:** é um **módulo próprio**, não um enxerto no TCE fechado —
a conduta diverge em eixos demais para caber como ressalvas. Quem reabrir
começa pela diretriz, não pelo módulo atual.

**Quando reabrir:** se o perfil de uso passar a incluir trauma penetrante com
frequência (serviço de referência, região com alta incidência de ferimento por
arma de fogo), ou se o autor decidir cobrir. **A decisão é de produto, e é
reversível a qualquer momento.**

### Trava

`valida-tce` ganhou **9 conferências** para esta decisão, e a mais importante
delas vigia o defeito **no modo como ele nasceu — por ACRÉSCIMO**: nenhuma
ocorrência de "penetrante" pode existir num nó sem a fronteira. Provada por
mutação: uma menção nova e órfã, plantada numa lista de mecanismos, derruba a
trava.


---

## PD-5 · PÚBLICO É USUÁRIO GERAL, NÃO O AUTOR — DECIDIDA (2026-08-17)

**Este é um app genérico, para usuário geral. NÃO é protocolo institucional, e
não pode assumir o protocolo de nenhum serviço.**

### O que forçou a decisão

A pralidoxima. A diretriz brasileira (Conitec/MS 2018) recomenda **contra** as
oximas; a OMS **mantém** a recomendação; a meta-análise de randomizados não
acha benefício em mortalidade. A pergunta que ficou foi *"qual delas o app
adota?"*, e a resposta correta é **nenhuma** — porque adotar uma é decidir pelo
serviço de quem está lendo, que o app não conhece.

⚠️ **E NÓS DOIS DERRAPAMOS NISSO.** A pergunta que eu devolvi foi "o protocolo
do seu serviço diverge da Conitec?" — o que trata o autor como o público. O app
não tem *um* serviço; tem tantos quantos forem os leitores.

### As três consequências, nomeadas

**1. Onde as fontes divergem, o app APRESENTA E ATRIBUI — não escolhe.**
As posições vão nomeadas, com a qualidade da evidência declarada: "recomendação
condicional, evidência muito baixa" não pode virar "não use". E apresentar a
controvérsia não é lavar as mãos: exige dizer **o que fazer enquanto se decide**
(na pralidoxima, que a atropina não espera). Controvérsia sem essa frase paralisa.

⚠️ **E O EXTREMO OPOSTO É PIOR QUE ESCOLHER: apagar.** A prática de dar
pralidoxima é corrente e a droga está na RENAME — o médico pode ter a ampola na
mão. Omitir deixa essa pessoa sem saber o que fazer com o que tem (R-45).

**2. O vocabulário é o de quem CHEGA, não o de quem já sabe.**
Isto já vinha sendo feito sem a razão escrita, e agora tem nome:

| onde | o que se fez |
|---|---|
| R-70 | o rótulo da saída de dúvida na voz de quem chega |
| toxidromes | 11 rótulos invertidos — sinais primeiro, nome depois |
| as duas saídas do "não sei" | perderam a palavra "toxidrome", que era exigida para sair |
| abdome agudo | os padrões invertidos, com os sinais antes do nome |
| etiquetas de área | de "ACLS" (origem do conteúdo) para o CENÁRIO |
| sinônimos de módulo | "engasgo", "corpo estranho", "comida entalada" ao lado de "OVACE" |

**3. "O médico vai saber isso" NÃO é argumento para omitir.**
É a forma mais comum de o autor projetar-se no leitor — e a mais difícil de
detectar, porque quem escreve realmente sabe. Se a informação muda conduta, ela
entra; a economia de linhas se faz em outro lugar.

### O que isto NÃO autoriza

Não é licença para escrever tudo. A densidade continua sendo problema medido
(item 8), e o critério de subir conteúdo continua sendo o das três colunas —
muda conduta / qualifica / ensina —, agora com o R-77 no topo. PD-5 diz **para
quem** se escreve, não **quanto**.

### Onde já está aplicada

`lib/pralidoxima-controversia.ts` — três posições nomeadas, a atropina que não
espera, e a lacuna da cinética por composto declarada em vez de preenchida com
número sem fonte. Travada por 8 conferências novas em `valida-intoxicacoes` e
cinco mutações, entre elas "o app escolhe" (sai uma posição) e "condicional
vira proibição".

---

## PD-6 · O que a calculadora de antibiótico cobre — e o que NÃO cobre

**Decidida em 2026-08-17.** É R-13 aplicado ao escopo da própria ferramenta: a
lacuna existia e era **silenciosa**; aqui ela vira lacuna **declarada**, com
caminho definido para o próximo fármaco.

### O que existe hoje

`clinical-calculators-engine.ts` › `dose-antibiotico` — *"Dose de antibiótico
(TFG)"*, com ClCr **absoluto** e peso real:

| fármaco | faixas de ClCr | além da faixa |
|---|---|---|
| **Vancomicina** | 5 | ataque por peso com teto de 3 g · AUC/MIC 400–600 · regra de infusão · esquema de hemodiálise |
| **Pip-tazo** | 3 | infusão estendida de 4 h para Pseudomonas · esquema de HD |
| **Meropeném** | 4 | variante MDR/meningite em cada faixa · infusão de 3 h |

### O que NÃO existe — os 14, nomeados

⚠️ **Nenhum destes tem ajuste renal no app**, e para eles o único conteúdo sobre
função renal é o PISO dos nove esquemas:

> ceftriaxona · cefepima · ertapeném · ceftazidima · metronidazol · clindamicina ·
> azitromicina · amoxicilina-clavulanato · ampicilina · penicilina ·
> levofloxacino · aztreonam · linezolida · micafungina

O ponteiro dos esquemas diz isso explicitamente — *"os demais antibióticos deste
app NÃO têm ajuste renal implementado"* —, e há trava para a frase não sumir.
Apontar a calculadora sem dizer o que ela não cobre sugere que ela cobre tudo.

### O CRITÉRIO de entrada — decidido, não inferido

**Entra na calculadora o fármaco que cumpre (a) E (c):**

- **(a)** o ajuste renal muda a dose **ou** o intervalo em **mais de uma faixa**
  de ClCr;
- **(c)** o app o prescreve em **mais de um foco**.

**E (b) NÃO É REQUISITO — é PRIORIDADE:** janela terapêutica estreita ou
monitorização por nível torna o caso mais **urgente**, não mais **elegível**.

⚠️ **A correção que produziu essa forma:** a primeira proposta trazia (b) como
requisito, e a própria lista a desmentia — pip-tazo e meropeném **falham** em (b)
e estão dentro. Só a vancomicina cumpre os três. O que de fato separa os três é
(a) + (c); (b) explica por que a vancomicina foi a mais completa das três, não
por que as outras duas entraram.

### O próximo candidato, nomeado

**CEFEPIMA.** Cumpre (a) — tem ajuste por faixa de ClCr — e cumpre (c) —
aparece em `atb_cateter` e `atb_neutropenia`. **Falha em (b)**, o que pelo
critério corrigido não a exclui: apenas a coloca depois dos três, não fora.

**Ela NÃO entrou neste bloco**, por decisão de escopo, e fica aqui como caminho
definido em vez de lista arbitrária. Quem a implementar não precisa reabrir a
discussão do critério — só cumprir (a) + (c) e verificar que o piso e o ponteiro
continuam válidos.

### O que PD-6 não decide

Não decide se o app deveria cobrir mais fármacos, nem quantos. Decide **o que
está coberto, o que não está, por qual critério, e quem é o próximo** — de forma
que a ausência seja legível para quem usa e para quem escreve.

---

## PD-7 · RITMOS DE PARADA NÃO VIRA MÓDULO INTERATIVO — DECIDIDA (2026-08-17)

**A decisão:** `ritmos-acls` continua tela de CONSULTA, e passa a ser o **destino
do "não sei" da pergunta de ritmo que o PCR já faz**. `farmacologia-acls`
continua tabela. Nenhum dos dois volta a ser submódulo aninhado.

### Por que a pergunta apareceu

Reconhecer ritmo É decisão, e por isso "transformar Ritmos em módulo interativo"
é a proposta natural — foi a hipótese do autor, e é razoável.

### ⚠️ POR QUE ELA ESTÁ ERRADA, E O ARGUMENTO É O R-12

**A decisão já é interativa, e já existe.** `acls/presentation.ts:183` pergunta
*"Qual é o ritmo?"* em quatro estados do fluxo de PCR
(`avaliar_ritmo_1`, `avaliar_ritmo_2`, `avaliar_ritmo_3`,
`avaliar_ritmo_nao_chocavel`), com a dica
`FV/TV = chocável · AESP/Assistolia = não chocável · pulso = ROSC`.

Um módulo interativo de Ritmos criaria **um SEGUNDO lugar onde a mesma decisão
clínica é tomada**. É exatamente o que o R-12 (fonte única) existe para impedir, e
o custo não é duplicação de código: é duas árvores que podem responder diferente
para o mesmo traçado. Já vimos o padrão em números — `ataqueVancomicinaMg()`
existiu porque duas telas calculavam a mesma dose e divergiam.

### O que o mapa mostrou, e que redefine o problema

| | conteúdo | indexado por |
|---|---|---|
| `ritmos-acls` | 4 ritmos (FV, TVSP, AESP, assistolia) em 2 grupos; padrão de ECG, frequência, regularidade, bullets, conduta | ritmo |
| `farmacologia-acls` | 5 fármacos (epinefrina, amiodarona, adenosina, atropina, dopamina); categoria, indicação, doses, quando usar, cautelas, fonte | **fármaco** |

Farmacologia é indexada por fármaco: quem tem um paciente não chega por ali.
É tabela, e tabela é legítima — só não é guia.

Ritmos não precisa de interatividade. Precisa de **alcance no momento em que a
leitura falha** (R-48): quem está na pergunta do ritmo e não reconhece o traçado
deveria receber ali os quatro padrões, e não uma dica de uma linha.

### ⚠️ E A PONTE JÁ EXISTE, RECOLHIDA — R-75 OUTRA VEZ

`components/protocol-screen/acls-protocol-screen.tsx:187` tem o atalho
`/modulos/ritmos-acls?from_module=pcr-adulto`. Ele vive dentro de um acordeão
**"RECURSOS ADICIONAIS", fechado por padrão**, junto de outros SETE atalhos
genéricos, em outro ponto da tela — sem relação com a pergunta do ritmo.

É o terceiro padrão de entrega da auditoria repetido: o conteúdo certo, na tela
certa, **recolhido e longe do ponto de decisão**. Oito atalhos indiferenciados num
acordeão são um menu, não uma resposta: quem não sabe qual ritmo está vendo não
procura "recursos adicionais".

### O que esta decisão NÃO resolve

Não implementa o atalho contextual — isso é bloco próprio. Decide apenas que a
saída **não** é duplicar a decisão, para que "vamos tornar o Ritmos interativo"
não volte em três meses como ideia nova.

---

## PD-8 · LAST É SUB-FLUXO DAS INTOXICAÇÕES, NÃO MÓDULO — DECIDIDA (2026-08-17)

**A decisão:** a toxicidade sistêmica por anestésico local vira um **fluxo com
fases dentro do módulo de Intoxicações Exógenas**. Não ganha card no hub, não
entra em `MODULE_GROUPS`, não recebe etiqueta de área.

### Por que a pergunta apareceu

`poisoning/tox_last` é o maior nó do app — **6.179 caracteres, 63 frases, ZERO
repetição interna**, e apontado de dois outros nós. Isso não é um nó denso: é um
**protocolo inteiro servido como parágrafo**. Tem fases sequenciais, decisões
internas e prazos, que é a assinatura de fluxo, não de catálogo.

E o app já converteu um caso assim em módulo próprio — a Injúria Renal Aguda. A
pergunta natural é fazer o mesmo.

### ⚠️ POR QUE NÃO MÓDULO

**Ninguém abre o app pensando "LAST".** Chega-se lá por DETERIORAÇÃO SÚBITA ou por
AGENTE DESCONHECIDO, e as duas são portas do módulo de Intoxicações. A IRA é o
contrário: "a creatinina subiu" e "o paciente parou de urinar" são queixas de
entrada — alguém abre o app com aquilo na cabeça.

Um card de LAST no hub **competiria com os cenários de entrada sem ser um deles** —
exatamente o defeito que a auditoria acabou de consertar na ordem da Reanimação, em
que duas telas de CONSULTA ocupavam as posições 2 e 3 à frente dos guias. Criar um
card novo com o mesmo problema, no dia seguinte, seria desfazer a correção por
outro caminho.

### O que a decisão preserva

O LAST continua alcançável dos dois lugares em que a suspeita nasce, e o conteúdo
não muda de dono (R-12): `lib/last-emulsao-lipidica.ts` segue sendo a fonte, com as
dez constantes.

### O que ela NÃO decide

Não decide a FORMA do sub-fluxo — trilha, painel ou misto —, nem quantas portas de
entrada ele tem. Decide só que o LAST não vira card no hub, para que "vamos
transformar o LAST em módulo" não volte em três meses como ideia nova.

### O critério que fica, e vale para o próximo

> **Card no hub é para QUEIXA DE ENTRADA — o que o médico tem na cabeça quando abre
> o app. Conteúdo alcançado por raciocínio a partir de outra queixa é sub-fluxo do
> módulo que faz esse raciocínio.**

Pela mesma régua, o `tox_colinergico` — que também tem assinatura de protocolo —
também é sub-fluxo: chega-se a ele pela toxíndrome, não pela porta.

---

## PD-9 · SEÇÃO É AGRUPAMENTO VISUAL, NUNCA ANINHAMENTO — DECIDIDA (2026-08-18)

**A decisão:** o hub pode ter um **cabeçalho de seção** — «Dentro do módulo PCR
Adulto» — sobre cards **planos, visíveis e diretamente tocáveis**. Nenhum card
dentro de outro card.

### ⚠️ POR QUE ISTO PRECISA ESTAR ESCRITO

Porque à primeira vista contradiz uma correção desta auditoria, e a próxima pessoa
vai achar que é regressão. Não é, e a diferença é exatamente a que importa.

**O que foi removido em 2026-08-17** (`constants/module-groups.ts`, campo `subIds`):
oito módulos ACLS eram FILTRADOS para fora da lista principal e redesenhados DENTRO
do card do PCR, sob um divisor. O Engasgo (OVACE) — paciente CONSCIENTE, de pé,
tossindo — não era um módulo do hub: era uma linha dentro do card da parada.

**O que a PD-9 autoriza:** um RÓTULO sobre cards que continuam na lista, no mesmo
tamanho dos outros, alcançáveis com um toque.

> O aninhamento ESCONDIA. Um rótulo de seção sobre cards alcançáveis é o oposto:
> diz A QUE ELES PERTENCEM sem tirá-los de vista.

### O teste que separa os dois

- O card é tocável direto, sem abrir outro antes? → agrupamento ✅
- Ele tem o mesmo peso visual dos demais? → agrupamento ✅
- Some da lista principal, ou vira item de outro card? → aninhamento ⛔

### O que a PD-9 NÃO muda

**A PD-7 continua inteira:** `ritmos-acls` e `farmacologia-acls` seguem telas de
CONSULTA — não viram módulos interativos nem submódulos. A seção os agrupa; não os
reclassifica. E a ordem decidida (cenário antes de consulta, aplicada em
`module-hub.tsx`) permanece.

### As etiquetas continuam por CENÁRIO

Etiqueta responde «o que eu tenho na frente», na voz de quem chega: PCR, ARRITMIAS,
PÓS-PCR, VIA AÉREA, CONSULTA. ⚠️ Etiqueta por ESPECIALIDADE — CLÍNICO, ALERGIA,
NEUROLÓGICO — é o critério do qual esta auditoria saiu, e não volta pela porta do
redesenho.

## PD-10 · O TINGIMENTO DO CARD FICA EM 7% — e o que isso já custa

Decidido em 2026-08-18, por medição, com os tokens reais do app (surface
`#383E4A`, secundário `#AAB6C6`, 24 cores de área):

    tint |  ΔE mediano  | contraste do TÍTULO | contraste do DESCRITOR | AA 4,5
     0%  |     0,0      |        9,80         |         5,22           |  ✅
     7%  |     7,1      |        8,51         |         4,53           |  ✅ por 0,03
    10%  |    10,0      |        7,98         |         4,25           |  ❌
    12%  |    12,2      |        7,73         |         4,12           |  ❌
    15%  |    14,7      |        7,24         |         3,86           |  ❌

**7% é o teto, e já estamos nele.** O primeiro passo acima (10%) reprova o
descritor. Não é o título que limita — é o texto cinza pequeno.

E o tingimento a 7% JÁ INFORMA: **46 de 52 pares vizinhos** ficam acima do limiar
perceptível (ΔE ≥ 2); os 6 que não ficam são os de MESMA categoria, onde a
identidade é intencional (R-90).

⚠️ **A CONSEQUÊNCIA CONHECIDA, escrita aqui para ninguém somar outra coisa em
cima e descobrir depois:** hoje, no app, o descritor tem **5,22** de contraste
sobre a surface. Quando o card tingido virar código, ele passa a **4,53**.

**Passa, e perde a folga** — de 16% acima do mínimo para 0,7%. Isso significa que
QUALQUER escurecimento posterior do fundo do card, ou clareamento do cinza do
descritor, reprova. O orçamento de contraste do card está gasto.

⚠️ **E NÃO SE CLAREIA O TOKEN DO TEXTO SECUNDÁRIO PARA DESTRAVAR MAIS TINGIMENTO**
— seria mudar o app inteiro (25 arquivos pelo token, 274 hexadecimais crus no
legado) para ganhar 8 pontos percentuais de cor num card. Decisão do médico,
tomada com o número na frente.

## PD-11 · SVG PARA VETOR, RASTER PARA IMAGEM CLÍNICA — DECIDIDA (2026-08-21)

**Decisão permanente.** A regra técnica está na arquitetura-mãe (`AM-5`); aqui fica
o que ela significa para o produto.

### O que muda para quem usa

Nada visualmente, hoje — e é essa a intenção. A decisão existe para o que vem
depois: no dia em que o app mostrar um **ECG real**, uma radiografia ou um
ultrassom, ele mostra a **imagem original**, não um desenho dela.

### Por que isso é decisão de produto, e não escolha de formato

Porque muda o que o app **afirma**. Um traçado esquemático diz *"o padrão é assim"*
— é didático, e nós o desenhamos. Uma imagem real diz *"é assim que se parece num
paciente"* — é evidência, e não se desenha.

Converter uma imagem real em vetor produz o pior dos dois: **parece evidência e é
desenho.** O usuário não tem como distinguir, e a diferença é justamente o que ele
usaria para decidir.

### A consequência que vem junto

Imagem clínica raster **é conteúdo médico** e obedece às mesmas exigências de uma
dose: **fonte, procedência, licença e força declarada**. Imagem sem procedência não
entra.

Isso torna a inclusão de imagens **mais lenta de propósito**. Uma imagem sem
procedência é uma afirmação clínica anônima na tela do médico — e nós já decidimos,
em cada bloco desta auditoria, que afirmação anônima não entra.

### Estado

- ✅ Regra registrada (AM-5) e travada (`test:imagem-clinica`, fechada por padrão).
- ✅ Universo hoje: **zero** imagens clínicas raster no app.
- ⚠️ **31 ícones de módulo em SVG usam hexadecimal cravado** (31 de 31, medido).
  Ilustração decorativa multicolorida — fora do alcance de `currentColor`, e
  declarado como tal em vez de fingir conformidade.

## PD-12 · ATRIBUIÇÃO NÃO PENDE DE QUEM FEZ O ARQUIVO — DECIDIDA (2026-08-21)

**Decisão permanente.** O modelo técnico está em `AM-6`; aqui, o que ele significa
para o produto.

### A pergunta que o modelo responde

Quando o app mostra alguma coisa que veio de fora — um ícone, um desenho, um dia um
ECG real —, **quem tem direito sobre aquilo?** A resposta não muda porque nós
recortamos, compilamos ou embrulhamos o arquivo.

- **Autoria** responde *"quem montou este arquivo aqui?"*
- **Procedência** responde *"de quem é o que está dentro dele?"*

São perguntas diferentes, e só a segunda decide atribuição e licença.

### Por que isso é decisão de produto

Porque é **o que o app deve ao autor do conteúdo** — e isso é obrigação, não estilo.
A Apache 2.0 dos ícones exige reter o aviso na distribuição; a licença de uma imagem
clínica pode exigir mais, ou proibir uso comercial. Um app que perde a atribuição no
caminho da compilação **descumpre em silêncio**.

E porque estabelece o custo de incorporar: **conteúdo de terceiro entra com licença
ou não entra.** Isso torna a inclusão mais lenta de propósito, exatamente como a
regra de dose sem fonte.

### A frase que a trava imprime, e que é o resumo

> **Assinatura não substitui conformidade.**

Uma declaração assinada pelo autor, com a licença faltando, **reprova**. Quem
declara responde pela declaração; não compra a conformidade dela.

### Estado

- ✅ Modelo aplicado em `test:origem-vetor` (33 vetores) e `test:imagem-clinica`.
- ✅ Buraco medido e fechado: autoria própria + procedência de terceiro + licença
  vazia **passava verde** e agora reprova, nos dois caminhos.
- ✅ Noto Emoji: arquivo/componente nosso · conteúdo Google/Noto · Apache 2.0.
- ✅ Desenhos produzidos por nós a partir de descrição: arquivo e conteúdo próprios.

---

## PD-13 · O ESCOPO DA DECOMPOSIÇÃO DO DÉFICIT (D-1) — DECIDIDA (2026-08-28)

**Decisão do autor.** Fecha o **D-1** / **R3.7**, que a `MATRIZ-PRONTIDAO-AVC`
registrava como 🔴 *decisão médica pendente*.

### A pergunta

A **Table 4** da AHA/ASA 2026 declara a própria população — *"Among patients with
NIHSS scores 0–5 at presentation"* — e a fonte ⛔ **não diz nada** sobre aplicar
aqueles quadros acima disso. O app tinha duas saídas ruins: **extrapolar** (usar o
quadro fora da população, como se valesse) ou **omitir apoio** (esconder a
decomposição de quem está fora).

### A decisão

> - a decomposição da Table 4 é **suportada apenas no contexto que a fonte
>   sustenta**;
> - fora desse contexto, ⛔ **não extrapolar automaticamente**;
> - o médico **ainda pode registrar o julgamento final**;
> - o sistema ⛔ **não cria classificação normativa fora do escopo**.

### O que isso significa no produto — e o que ⛔ NÃO significa

⚠️⚠️ **O limite é do SISTEMA, ⛔ não do médico.** Fora da população, os onze
achados continuam respondíveis, as respostas continuam na trilha e a decisão
continua disponível. O que muda é **o que o app se autoriza a afirmar**: ele
registra e se cala, em vez de reutilizar a frase normativa da fonte.

⛔ **Não é filtro, ⛔ não é porta, ⛔ não esconde campo.** Fechar o quadro fora do
escopo transformaria **limite de evidência** em **limite de registro** — outra
coisa, e ⛔ não foi decidido.

⚠️ **Contexto desconhecido ⛔ não é contexto favorável.** Sem NIHSS registrado, o
app ⛔ não presume que o paciente está na população: presumir seria extrapolar por
omissão. E isso ⛔ **não vira exigência** — ⛔ nada espera pelo NIHSS.

⚠️ **A divergência segue o mesmo limite.** Divergir é divergir *da leitura do
sistema*; onde ele ⛔ não emite leitura normativa, ⛔ não há do que divergir, e
acusar divergência aplicaria o quadro fora do escopo com outro nome.

**Onde vive:** `POPULACAO_TABLE4` em `avc/conteudo/superficie-b.ts` (conteúdo, com
slot de fonte) e `contextoDaTable4()` em `avc/nucleo/derivacoes-b.ts`.
**Travada por:** `test:avc-superficie-b`, com quatro mutações — desfazer o limite,
presumir o contexto por omissão, fechar o campo fora do escopo, e reacusar
divergência fora dele.

---

## PD-14 · A CONSULTA A PACIENTE E FAMÍLIA É REGISTRO, NUNCA REQUISITO (D-5) — DECIDIDA (2026-08-28)

**Decisão do autor.** Fecha o **D-5** / **R3.8**.

### A pergunta

A fonte diz: *"The clinician should make this determination **in consultation with
the patient and available family**."* Isso vira campo? Vira tarefa? Vira condição
para decidir?

### A decisão

> - consulta a paciente/família é **ação opcional registrável**;
> - ⛔ **nunca requisito**;
> - ⛔ **nunca bloqueia**;
> - ⛔ **nunca atrasa reperfusão**.

### Por que a forma importa tanto quanto o conteúdo

⚠️ **"Requisito" ⛔ não precisa estar escrito para existir.** Bastam três
caminhos, e os três estão fechados por trava:

1. **pendência** — teria alcance global (**E-07**) e ficaria aberta o atendimento
   inteiro, como tarefa que ninguém mandou fazer;
2. **tom `pendente`** na leitura — vocabulário de coisa que falta, onde ⛔ não
   falta nada;
3. **outra leitura reagindo a ela** — a mais silenciosa: a decisão passaria a
   esperar pela consulta sem que nenhuma frase da tela dissesse isso. A prova
   varre TODAS as leituras com e sem consulta e exige que ⛔ nenhuma mude.

⚠️ **"Não foi possível" é resposta de primeira classe**, porque a própria fonte
diz *available* family: afasia grave, rebaixamento e ausência de acompanhante são
a regra na porta do pronto-socorro, ⛔ não a exceção.

**Onde vive:** campo `consulta_paciente_familia` (registra **com quem** foi a
conversa) e `consultaAoPacienteEFamilia()`. O registro entra na trilha com hora, é
**append-only**, e uma segunda conversa ⛔ não apaga a primeira.

---

## PD-15 · PENDÊNCIA TEM ALCANCE GLOBAL, E A TELA DIZ ISSO — DECIDIDA (2026-08-29)

**Decisão do autor**, depois de ver o bloco duas vezes e apontá-lo.

### O que estava acontecendo

O bloco de pendências fica logo abaixo do conteúdo da superfície aberta, sem nada
dizendo que muda de assunto. Resultado: *"aqui nessa tela não tem exame
neurológico"* — e ele estava certo **sobre o que via**.

### A decisão

> - **manter o alcance global** (§5.5, **E-07**);
> - a tela passa a dizer o que o bloco é: **"Pendências do atendimento · De todas
>   as superfícies. A letra indica onde resolver."**;
> - o destino vira **verbo**: *"Abrir B · Neurológico"*, ⛔ não *"B · Neurológico ·
>   Resolver"*;
> - ⛔ **nenhuma mudança de regra.**

⚠️ **E pendência sem porta ⛔ não é exibida.** A da tomografia apontava para a
Superfície de Imagem, que ⛔ não existe: tocar levava a "em construção" — muro, ⛔ não
tarefa (**E-26**, I-7). O filtro é **derivado dos campos que existem**, então ela
volta sozinha no dia em que a superfície nascer.

---

## PD-16 · HIPERGLICEMIA GRAVE É MIMETIZADOR, ⛔ NUNCA CONTRAINDICAÇÃO — DECIDIDA (2026-08-29)

**Decisão do autor** sobre **F-06**, com os dois extremos separados por FORÇA.

| valor | papel | força da fonte |
|---|---|---|
| `<60 mg/dL` | hipoglicemia a tratar | §4.5 rec. 1 · **COR 1 · C-LD** |
| `>400 mg/dL` | hiperglicemia grave, **possível mimetizador** | *Supportive Text*, ⚠️ **sem COR/LOE**, *"typically defined"* |

> ⛔ **⛔ NÃO escrever:** "contraindicação à trombólise" · "não elegível" ·
> "aguardar obrigatoriamente normalizar para continuar o fluxo".
>
> ✅ **Gera:** correção glicêmica **e reavaliação do déficit depois da correção**.
> Se o déficit incapacitante persistir após a correção, a diretriz recomenda IVT
> no paciente de outra forma elegível.

⛔ **O `>180 mg/dL` ⛔ NÃO entra aqui.** Ele pertence ao **manejo** da hiperglicemia
no AVC — dado observacional, com o momento ideal em relação à reperfusão
declarado **desconhecido** pela própria fonte. Papel clínico diferente do `>400`
como mimetizador, e o número ⛔ não existe em nenhum lugar da lógica do módulo.

### A reavaliação virou **pendência derivada**

O estado *"corrigida, e ainda sem exame posterior"* ⛔ não podia ser só um alerta:
vira **"Reavaliar déficit neurológico após correção da glicemia"**, dona **B ·
Neurológico**. ⚠️ Ela ⛔ não passa por `pendenciasAbertas()` — ali se mede campo
vazio, e aqui o campo pode estar cheio, com o exame de ANTES. Quem a fecha é a
**ordem dos fatos na trilha**.

---

## PD-17 · NIHSS: O CALCULADO AQUI E O TRAZIDO DE FORA SÃO ENTIDADES DIFERENTES — DECIDIDA (2026-08-29)

**Decisão do autor**, depois de a entrada manual do total ter sido removida por
receio de "duas verdades".

> *"O paciente pode chegar da regulação, SAMU, neurologista ou outro hospital com
> 'NIHSS 12 às 05:55'. Isso é informação útil. Só não é a mesma entidade que
> 'NIHSS 12 calculado aqui item a item'."*

| | calculado aqui | trazido de fora |
|---|---|---|
| origem | os 15 itens, preenchidos nesta avaliação | total recebido, com **origem e horário** |
| deriva achado da Table 4? | ✅ sim | ⛔ **nunca** |
| estabelece o contexto NIHSS 0–5? | ✅ sim | ⛔ **não** |
| sobrescreve o outro? | ⛔ não | ⛔ não |

⚠️⚠️ **A regra crucial:** um total ⛔ **não diz quais itens pontuaram**. NIHSS
externo 12 ⛔ não permite concluir hemianopsia, afasia, negligência nem paresia —
derivar dali seria o app **inventar um exame que ninguém fez aqui**.

⚠️ **E o contexto da Table 4 sai do calculado**, porque a população da fonte é
*"NIHSS 0–5 **at presentation**"*: o de fora pode ter sido medido antes de melhora,
piora ou tratamento.

⚠️ **Os dois convivem.** Exame aqui deu 9 e o referido era 12? Guardam-se os dois.
⛔ Um ⛔ não corrige o outro — são observações de momentos potencialmente diferentes.

---

## PD-18 · LATERALIDADE É **MOTORA**, ⛔ NÃO "LADO PREDOMINANTE" — DECIDIDA (2026-08-29)

**Correção conceitual do autor**, sobre uma derivação que eu havia escrito errado.

Dos itens motores do NIHSS dá para afirmar **lateralidade motora**: esquerda,
direita, bilateral. ⛔ O que ⛔ **não** dá é concluir o *"lado predominante do
déficit neurológico"* — afasia, hemianopsia e negligência importantes convivem
com motor praticamente normal, e a soma dos itens motores ⛔ não sabe disso.

> - deriva por **presença** em cada lado, ⛔ **nunca** por diferença de somas —
>   3 contra 2 é **bilateral**, ⛔ não "predomínio à esquerda";
> - com os quatro itens motores zerados, ⛔ **não deriva nada**: a ausência de
>   déficit MOTOR ⛔ não é ausência de lateralidade.

⚠️ **O rótulo mudou junto com a regra**, e isso é parte da decisão: derivar
lateralidade motora e continuar chamando de "lado predominante do déficit" seria
a interpretação voltando pela porta do texto.

---

## PD-19 · A ESCALA EXPLICA, E ⛔ NÃO CLASSIFICA — DECIDIDA (2026-08-29)

**Decisão do autor** sobre como o app ensina o que ele está perguntando.

### O NIHSS é preenchido, ⛔ não digitado

> *"Essa escala o usuário não sabe, tem que ser clicável para abrir e preencher."*

A escala é **consumida da calculadora** (§10.1 — calculadora neutra), com fonte
própria (Brott 1989 + adaptação brasileira de Pontes-Neto). ⛔ Copiá-la seria a
**I6 aplicada a escore**: duas cópias funcionando e divergindo no dia da primeira
correção.

### O que a escala responde, o app ⛔ não repergunta — mas ⛔ não decide

Os quatro achados que a **Table 4 define por corte de item** passam a vir da
escala, etiquetados **"Vindo do NIHSS"**, editáveis. Ao alterar:

> - o NIHSS ⛔ **não** é modificado;
> - a alteração é **registro do médico**;
> - a **divergência fica identificável**;
> - ⛔ **nada** disso bloqueia, e ⛔ **nada** vira decisão automática de
>   incapacitância — o julgamento final continua `incapacitante · não
>   incapacitante · incerto`.

⚠️ **Três procedências, três etiquetas**: *vindo do NIHSS* · *registro do médico* ·
*registro do médico, diferente do que a escala deriva*. A terceira faltava, e sem
ela um registro que coincide com a escala ficava anônimo.

### As explicações

⛔ **Nada de memória.** Duas camadas, cada uma com procedência:

- **o que o achado é** — redação condensada das instruções oficiais do NIHSS/AHA,
  autorizada pelo autor, com conferência declarada **pendente**;
- **como se testa** — a manobra, nos **15** itens, da mesma origem;
- **as categorias da escala** que satisfazem o corte — derivadas da calculadora,
  e por isso as únicas que ⛔ não dependem de autorização.

⚠️⚠️ **A glosa explica o TERMO, e ⛔ nunca classifica.** A Table 4 lista os sete
achados qualitativos como exemplos que **podem não ser** claramente
incapacitantes, *"sempre considerando as circunstâncias individuais"*: uma glosa
dizendo "não incapacitante" achataria o hedge (**E-45**) e transformaria exemplo
em critério. ⛔ Travado.

### E a tela ⛔ não documenta arquitetura

> *"'Não é requisito para decidir nem para reperfundir' é correto como regra
> interna, mas para o médico soa como documentação de arquitetura."*

Na interface: **"Não impede continuar o atendimento."** A regra inteira continua
na spec e nas travas.

---

## PD-20 · O APP LEMBRA O QUE JÁ SABE, E ⛔ NÃO REPERGUNTA — DECIDIDA (2026-08-29)

**Princípio de UX clínica fixado pelo autor**, e ⚠️ ele vale **daqui para frente**,
⛔ não só no AVC.

> *"O app deve lembrar o que já sabe e ⛔ não perguntar novamente por padrão."*

### O que o originou

Com o NIHSS preenchido item a item, os quatro achados que a **Table 4 define por
corte de item** já estavam respondidos — e a tela continuava exibindo **quatro
cartões de pergunta** sobre hemianopsia, afasia, extinção e fraqueza.

⚠️ **Revalidação obrigatória é a forma mais educada de fazer alguém marcar no
automático.** Quem acabou de examinar o paciente e é obrigado a reconfirmar
quatro vezes ⛔ não relê: confirma. E o app perde exatamente a atenção que pediu.

### A regra

> - o que o app **já sabe**, ele **mostra**;
> - o que ele **⛔ não sabe**, ele **pergunta**;
> - o que ele mostra, o médico **pode contrariar** — sempre.

### O limite, que é a metade que importa

⚠️⚠️ **Recolher a pergunta ⛔ NÃO pode custar a divergência.** No AVC, o resumo
derivado traz `Ajustar`, que devolve os quatro campos com a etiqueta de
procedência intacta; depois de ajustar, o **registro do médico prevalece** e a
divergência continua identificável (**PD-19**).

⛔ Um resumo que ⛔ não pudesse ser contrariado seria **decisão automática com outro
nome** — e é isso que `test:avc-superficie-b` guarda, ⛔ não a economia de tela.

⚠️ **E ⛔ não se recolhe o que ⛔ não se sabe:** sem a escala preenchida, as quatro
perguntas voltam a ser a única via de registro. Recolher ali apagaria o campo em
vez de lembrá-lo.

### Onde já está aplicado

| lugar | o que o app lembra |
|---|---|
| achados da Table 4 | os quatro cortes de item, com a escala preenchida |
| lateralidade motora | os itens motores, quando permitem afirmar o lado |
| pendências | ⛔ não exibe a que ⛔ não tem porta (PD-15) |
| blocos de exceção | NIHSS de fora nasce recolhido (PD-17) |

⛔ **O que ⛔ NÃO se recolhe:** os sete achados **qualitativos** da coluna direita
da Table 4. Eles ⛔ não são deriváveis — a coluna ⛔ não referencia item nenhum —, e
recolhê-los seria fingir saber. Decisão do autor na mesma sessão.

---

## PD-21 · A SUSPEITA DE HSA É CAMPO PRÓPRIO, E O DESTINO É UM SÓ — DECIDIDA (2026-08-29)

**Decisão do autor**, sobre a Superfície C · Imagem.

### O que a spec pede, e onde ela é ambígua

§1.8 declara **três saídas** da tomografia: *sem hemorragia* · *hemorragia
intracraniana* · *suspeita de HSA*. O desenho de três opções mutuamente
exclusivas de um mesmo campo parece fiel — e ⛔ não é.

⚠️⚠️ **Uma tomografia SEM hemorragia convivendo com suspeita clínica de HSA é
combinação real.** Colapsada num campo só, ela fica **irrepresentável**: o médico
marca "sem hemorragia" e a saída de HSA desaparece da tela.

### A decisão, em duas partes que ⛔ não se confundem

> **1 · Os FATOS são independentes.** `tc_resultado` e `suspeita_hsa` são dois
> campos, e os dois podem estar preenchidos ao mesmo tempo.
>
> **2 · Os DESTINOS ⛔ não são.** *"⛔ Não quero uma tela dizendo ao médico: 'vá para
> AVC hemorrágico' e 'vá para HSA' ao mesmo tempo."*

⚠️ **A distinção que isto exercita:** *destino* é a nona espécie (§2.9) e ⛔ não
descreve o paciente — ele muda **de quem ele é**. Dois destinos simultâneos ⛔ não
dão instrução nenhuma: dão duas.

### ⚠️⚠️ A PRIORIDADE — REVISTA PELO AUTOR NO MESMO DIA

A primeira versão desta decisão fazia a **suspeita** de HSA prevalecer sobre a
hemorragia **identificada**. O autor reviu a própria sugestão depois de ver a
estrutura montada:

> *"Uma suspeita ⛔ não deveria simplesmente sobrepor um achado de imagem
> confirmado. […] Isso evita transformar `suspeita_hsa = Sim` numa espécie de
> **override** de um fato radiológico confirmado."*

⚠️⚠️ **E a razão ⛔ não é gravidade — é ESPÉCIE DE DADO.** Hemorragia na tomografia
é **dado observado na imagem**; suspeita de HSA é **hipótese clínica**. Deixar a
hipótese governar o destino inverteria a hierarquia de evidência dentro da
máquina: o médico veria a tela mandá-lo para um fluxo escolhido pelo que ele
**suspeita**, sobre o que ele **viu**.

**A regra que ficou:**

| estado | saída visível | o que fica junto |
|---|---|---|
| hemorragia identificada | **hemorrágica** | — |
| hemorragia identificada **+** suspeita de HSA | **hemorrágica** | *"Há também suspeita de hemorragia subaracnóidea."*, com o `id` preservado |
| suspeita de HSA **sem** hemorragia identificada | **específica de HSA** | — |

⚠️ O fato associado carrega **`id` e frase**: o `id` é o que o subfluxo de HSA vai
procurar quando existir; a frase é o que o médico lê. Só a frase deixaria o
subfluxo dependendo de casar texto traduzível; só o `id` deixaria a tela muda.

### O que a trava mede

Hemorragia + suspeita → **exatamente um** destino, e é o **hemorrágico** · a
suspeita aparece em `associados`, com o id correto · **os dois** fatos continuam
em `valorAtual` · as duas leituras continuam vivas. Mutações: prioridade
revertida, `associados` esvaziado, e `id` trocado — **as três reprovam**.

---

## PD-22 · "RESULTADO AINDA NÃO DISPONÍVEL" É RESPOSTA QUE ⛔ NÃO FECHA A TAREFA — DECIDIDA (2026-08-29)

**Decisão do autor:** *"TC realizada com resultado pendente é fato válido e
mantém a pendência aberta."*

### Por que ela ⛔ não segue a regra geral dos vazios

`pendenciasAbertas()` fecha a pendência quando o campo deixa de estar vazio — e
está certo na **última vez visto bem**, onde *"ninguém sabe dizer"* é fato
**permanente** do mundo: a pergunta foi respondida, e ⛔ não há mais o que fazer.

⚠️⚠️ **Aqui o estado é TRANSITÓRIO, com resolução esperada em minutos.** Fechar a
pendência faria a tela dizer **"resolvido"** sobre o dado que governa a classe
inteira de reperfusão.

### A regra

> A pendência da tomografia fecha ⛔ **somente** com resultado **conclusivo** —
> *sem hemorragia* ou *hemorragia intracraniana*. Nos outros três estados
> (⛔ não perguntado · realizada com laudo pendente · ainda ⛔ não realizada) ela
> permanece aberta, **e muda de instrução** conforme o estado.

⚠️ Por isso as pendências da imagem são **derivadas** (`pendenciasDaImagem`) e
⛔ não passam pelo filtro de campo vazio do núcleo.

⚠️ **E a resposta continua sendo um FATO** (E-02): ela entra na trilha com hora, e
⛔ não é "campo em branco".

---

## PD-23 · O BLOQUEIO DE CLASSE VIVE NA DERIVAÇÃO, ⛔ NUNCA NO CAMPO — DECIDIDA (2026-08-29)

**Decisão do autor**, e é o que mantém `bloqueiaTerapia: false` literal no módulo
inteiro.

A Superfície C traz o **único bloqueio de classe** do AVC — F-16 rec. 1,
**COR 1 · LOE A**: *"…exclude intracranial hemorrhage before initiating
reperfusion interventions"* (**E-08**). A tentação era marcar o campo da
tomografia como bloqueante.

> ⛔ **Marcar o campo gravaria o veredito dentro do fato** — exatamente o que
> **E-43** existe para impedir. O fato é *"a tomografia mostrou X"*; o bloqueio é
> consequência dele contra a regra vigente, e a regra pode mudar.

⚠️ **A distinção que isto obriga na tela:** *a pendência ⛔ NÃO é o bloqueio*. A
pendência é **tarefa**; o bloqueio é `exclusaoDeHemorragia()`, **estado derivado**
com autoridade na fonte. Coincidem no tempo, e ⛔ não na natureza.

⚠️ **E ⛔ nada mais em C retém coisa alguma.** A trava perturba a superfície inteira
— angio, ASPECTS, sítio, efeito de massa, alergia, imagem avançada, suspeita de
HSA — e exige que a leitura da exclusão seja **idêntica**. Um segundo campo
capaz de reter a reperfusão seria bloqueio inventado.

---

## PD-24 · O DOSSIÊ ENDOVASCULAR DESCREVE DADOS, ⛔ NUNCA ELEGIBILIDADE — DECIDIDA (2026-08-29)

**Decisão do autor:** *"informação endovascular descreve quais dados existem;
⛔ nunca decide elegibilidade."*

É a advertência de modelagem de **F-08** aplicada à superfície:

> ⛔ *"`EVT elegível = sim/não` ⛔ NÃO é fato armazenado. Os fatos são: idade ·
> NIHSS · mRS prévio · sítio da oclusão · ASPECTS · tempo desde o marco · achados
> de imagem · efeito de massa. Elegibilidade é derivada."*

### A forma

`informacaoParaAFrenteEndovascular()` devolve **três listas** — *registrados* ·
*respondidos sem conclusão* · *ainda ⛔ não perguntados* — e `conclusao`
permanente em `desconhecido`, **por construção**.

⚠️ As três listas ⛔ não colapsam (**E-37**): *"perguntei e ninguém sabe"* ⛔ não é
*"tenho o dado"*, e ⛔ também ⛔ não é *"ainda ⛔ não perguntei"*.

⛔ **O que a lista ⛔ NÃO é:** requisito. Ausência ali ⛔ **nunca** vira
não-elegibilidade, ⛔ nenhum item gera pendência — cinco tarefas nascendo de uma
tela só é parede, ⛔ não tarefa —, e a palavra *elegibilidade* ⛔ não aparece na
tela **⛔ nem negada**: na Superfície B o autor já corrigiu esse tom uma vez
(*"soa como documentação de arquitetura"*).

### A alergia a contraste ⛔ não entra no dossiê

Ela pertence à **segurança da ação específica** de imagem com contraste. Dentro
do dossiê, *"ainda ⛔ não registrada"* apareceria como dado que falta para a
trombectomia — e ⛔ não é.

---

## PD-25 · A ALERGIA A CONTRASTE FICA NO MODELO — DECIDIDA (2026-08-29)

**Decisão do autor, contra a proposta de modelagem que eu havia apresentado**, e
o registro dela importa mais que o campo.

Eu havia proposto ⛔ **nenhum** campo de contraste na Superfície C, tratando a
marca 🚫 #5 — *"emergent vascular imaging… should not be delayed to obtain serum
creatinine concentration"* — como se ela apagasse tudo que toca o contraste.

> *"Não esperar por creatinina é uma coisa; eliminar uma informação relevante à
> ação contrastada é outra."*

⚠️⚠️ **A regra proíbe o ATRASO, e ⛔ não o registro.** Confundir as duas foi decisão
arquitetural minha apresentada como se fosse consequência da fonte — e ⛔ não era.

### O campo, e as três travas

`Alergia prévia importante a contraste iodado` · **Sim · Não · Não sei**

> - ⛔ **nunca bloqueia a IVT** — a exclusão de hemorragia ⛔ não a lê, e a trava
>   confere que a leitura é idêntica com e sem alergia registrada;
> - ⛔ **nunca cria dependência de creatinina** — ⛔ não existe campo renal ou de
>   laboratório em C, e a trava reprova se um aparecer;
> - ⛔ **⛔ não bloqueia a superfície C** — ⛔ não gera pendência, e ⛔ nenhuma outra
>   leitura muda com ela.

É **E-25** ao pé da letra: condição específica ↔ ação específica, ⛔ nunca
superfície inteira.

⛔⛔ **E ⛔ nenhuma conduta.** A fonte do AVC ⛔ não diz o que fazer diante de alergia
a contraste; o app **registra o fato e se cala**. Pré-medicação, alternativa de
exame ou qualquer manejo seria conteúdo clínico sem fonte (**E-31**) — a trava
varre a leitura atrás dessas palavras. Dívida declarada: **D-115**.

---

## PD-26 · O APP DECLARA O QUE ⛔ NÃO SABE CALCULAR — DECIDIDA (2026-08-29)

**Decisão do autor**, a partir do uso da Superfície C:

> *"O usuário ⛔ não sabe classificar isso, tem que ter itens clicáveis para o app
> classificar."*

### O defeito, e por que ele é maior do que parece

`ASPECTS informado` era um campo numérico de 0 a 10 que o médico ⛔ **não sabe
calcular** — a escala tem 10 territórios e regra própria, e ⛔ nada disso está na
tela. Um campo assim produz **branco ou chute**.

⚠️⚠️ **E o chute ⛔ não morre aqui:** o ASPECTS alimenta as faixas de F-08 na
Superfície F. Um número estimado de memória entraria na decisão de trombectomia
com a mesma aparência de um número lido por radiologista.

> **Campo que convida a inventar é pior que campo ausente.**

### O que ⛔ NÃO deu para fazer, e por quê

⛔ **A escala clicável ⛔ não pôde ser construída nesta rodada.** Ela precisa dos 10
territórios e da lógica de pontuação, e a **Figure 2** — que a rec. 1 de §3.2
referencia — ⛔ **não foi transcrita**. Escrever os territórios de memória seria
**E-31** no ponto mais caro: território errado ⛔ não parece errado.

⚠️ **Por que o NIHSS pôde e o ASPECTS ⛔ não:** o NIHSS veio de uma **calculadora
com fonte declarada** (Brott 1989 + adaptação de Pontes-Neto), consumida por
§10.1. Varridas as **129 entradas** de `clinical-calculators-engine.ts`, ⛔ **⛔ não
existe calculadora de ASPECTS** no app.

### A decisão — opção (b) do autor

> - o campo **permanece** em C, como valor **informado**;
> - o rótulo diz **de onde o número vem**: `ASPECTS informado no laudo ou pela equipe`;
> - a tela declara, **visível e ⛔ não atrás do ⓘ**, que *"o app ainda ⛔ não calcula o
>   ASPECTS nesta versão"*;
> - a redação ⛔ **não convida a estimar** — saiu o *"ou na avaliação"*, entrou o
>   *"sem estimar"*.

⚠️ A confissão fica **permanente**: quem ⛔ não abre o ⓘ é exatamente quem chuta.

### F-28 — aberto, com fonte-base aprovada

> Barber PA, Demchuk AM, Zhang J, Buchan AM. *Validity and reliability of a
> quantitative computed tomography score in predicting outcome of hyperacute
> stroke before thrombolytic therapy.* **Lancet. 2000;355(9216):1670–1674.**

⚠️ **Fonte brasileira de apoio fica em aberto** e ⛔ **não trava** a implementação —
decisão do autor.

### Depois de F-28 — o padrão já está escolhido, e é o de PD-17

| campo | o que é |
|---|---|
| `ASPECTS calculado aqui` | escala item a item, consumindo calculadora com fonte |
| `ASPECTS informado` | o valor que veio do laudo ou da equipe |

> - ⛔ **nenhum sobrescreve o outro**;
> - ⛔ o informado **⛔ nunca fabrica territórios ⛔ não marcados**.

### A imagem — rota (a), e ela depende do mesmo slot

O autor aprovou o **esquema vetorial próprio** dos territórios, no rito
**AM-5 §5 · AM-6 · PD-12** (`origem: desenhado`, `procedencia: propria`), e
recusou figura da AHA/ASA e galeria de TC real para ensino:

> *"Isso realmente mistura registro clínico com conteúdo didático e pode crescer
> sem controle."*

⛔ **E o esquema está bloqueado pelo mesmo F-28:** ⛔ não se desenha o que ⛔ não se
sabe descrever.

⚠️ **A fronteira de escopo que ficou fixada:** esquema dos territórios ajuda a
**pontuar** — é registro, e cabe na C. Galeria de "como é uma hemorragia na TC"
ajuda a **interpretar** — é ensino, e é outro produto.

---

## PD-27 · HIPODENSIDADE CLARA ENTRA COM A DEFINIÇÃO, E ⛔ NÃO COM O VEREDITO — DECIDIDA (2026-08-29)

**Aprovada pelo autor** depois de eu reportar a omissão:

> *"Eu também aprovo adicionar hipodensidade clara/extensa, porque aí existe
> critério operacional transcrito e isso é mais seguro do que deixar um achado
> relevante escondido fora da C. Mas eu manteria a redação fiel ao que a fonte
> sustenta."*

### Por que este achado é diferente de todos os outros da Table 8

É o **único achado de tomografia em que a fonte dá critério aplicável à beira do
leito**:

> *"Clear hypodensity is when the degree of hypodensity is greater than the
> density of contralateral unaffected white matter."* — F-07, p. e367

⚠️ Por isso a definição vai em `ajuda`, **visível**: ela é o que muda a RESPOSTA
de quem ⛔ não tem o termo na cabeça — critério de §7.3 para texto permanente.

⚠️ **O contraste com o efeito de massa é o que justifica os dois tratamentos:**
*"significant mass effect"* aparece em recomendação de F-08 e a fonte ⛔ **não
define medida nenhuma**. Um tem critério transcrito; o outro ⛔ não — e por isso
**F-29** foi aberto **sem fonte candidata**, e o campo mantém a expressão da
fonte sem critério inventado.

### ⛔ O que ele ⛔ NÃO é

⛔ **⛔ Não é elegibilidade**, e ⛔ **não é segundo bloqueio de classe.** A Table 8 ⛔ não
tem COR/LOE em célula nenhuma, e a legenda declara esta faixa
*"unsupported by clinical evidence"* (**E-48**). O achado é **fato**; o que a
fonte diz sobre a trombólise é conteúdo da Superfície F.

⛔ **E ⛔ não é ASPECTS.** São duas leituras da mesma tomografia, e ⛔ nenhuma calcula
a outra.

### O que a trava mede, e por que ela ⛔ não varre a palavra

A primeira versão da conferência varria `contraindicação` — e **reprovou a frase
que atribui o termo à fonte**. ⚠️ É a terceira vez que a mesma armadilha me pega
neste módulo, e a correção é sempre a mesma: **medir o que a frase FAZ**.

| metade | o que exige |
|---|---|
| ⛔ **forma assertiva proibida** | ⛔ nenhum estado diz *está contraindicado* · *⛔ não trombolisar* · *⛔ não elegível* |
| ✅ **atribuição obrigatória** | o estado positivo cita **a fonte** e devolve a decisão à reperfusão |

⚠️ Sem a segunda metade, a trava seria satisfeita pelo **silêncio**.

---

## PD-28 · PROPRIEDADE DO FATO ⛔ NÃO É LOCAL DE PREENCHIMENTO — DECIDIDA (2026-08-29)

**Regra central da arquitetura, formulada pelo autor:**

> **Um fato tem um único id e uma única casa semântica. Qualquer superfície que
> precise dele pode mostrar o valor ou permitir preenchê-lo, sempre escrevendo no
> mesmo fato e na mesma trilha.**

### O que a originou

Quatro defeitos seguidos, encontrados **usando o app**, e todos o mesmo defeito:
alergia a contraste perguntada **depois** de já ter oferecido a angiotomografia ·
hipodensidade num bloco de resultado de TC · imagem avançada **sem leitor** ·
suspeita de HSA parecendo repetição.

⚠️ Todos eram **fatos sobre quem é o paciente** em telas organizadas por
**decisão**. Faltava o lugar onde o paciente é descrito **uma vez**.

### A regra que impede o escorregamento

> *"Senão daqui a pouco começamos a mover fatos para a superfície que os utiliza
> e recriamos o problema: DOAC 'pertence à trombólise', mRS 'pertence à EVT',
> creatinina 'pertence ao contraste'. ⛔ Não. **O dado pertence à espécie dele; a
> decisão apenas o consome.**"*

⚠️ Foi por essa regra que a **hipodensidade clara ficou em C** — eu havia
proposto movê-la para D, e o autor recusou: *"o fato ⛔ não muda de natureza só
porque uma regra de trombólise o utiliza"*.

### As três espécies que decidem a casa

| espécie | pergunta que a identifica | casa |
|---|---|---|
| **quem é o paciente** | isto seria verdade se ele ⛔ não tivesse tido este AVC? | **Paciente** |
| **estado clínico atual** | isto pode mudar nas próximas duas horas? | **A** |
| **exame do episódio** | isto tem valor, horário e laudo? | **Laboratório** · **C** |

### Como se implementa, e o que custou

⚠️ **O núcleo ⛔ não mudou.** `estado.ts` já guardava fatos por `campo`, num vetor
global sem noção de superfície — escrever de qualquer lugar já funcionava. O que
entrou foi **declaração de conteúdo**:

- `casa` em todo campo, **carimbada pelo módulo** (`comCasa`) e ⛔ nunca escrita
  campo a campo — escrita à mão, ela poderia discordar do arquivo;
- `emprestados` no bloco: o **mesmo objeto** da casa de origem, ⛔ nunca uma
  cópia. A prova confere identidade de referência, e ⛔ não igualdade de id;
- etiqueta **"Do painel Paciente"** na tela, para o médico ⛔ não achar que
  respondeu duas vezes.

**Mudaram de casa:** `peso` e `peso_origem` (de A) · `mrs_previo` (de B) ·
`alergia_contraste` (de C) — e **continuam desenhados onde estavam**, por
decisão explícita: *"muda a propriedade, ⛔ não a experiência que já ficou boa na
B."*

---

## PD-29 · A SUPERFÍCIE PACIENTE É PAINEL, E ⛔ NUNCA PORTA — DECIDIDA (2026-08-29)

**Condição que o autor impôs para ela existir:**

> *"Ela pode aparecer primeiro visualmente, mas ⛔ não pode ser uma ficha
> obrigatória para liberar o AVC. Se chegar um paciente instável, o médico
> precisa conseguir tocar direto em estabilização, imagem ou qualquer superfície
> necessária."*

⚠️⚠️ **Por que isto precisa de trava e ⛔ não de boa intenção:** uma tela de
admissão antes do fluxo é a forma mais natural de reintroduzir o atraso que as
**doze marcas 🚫** proíbem — e ⛔ nem pareceria bloqueio: pareceria organização.

**O que a prova mede:** com Paciente **inteiramente vazio**, as nove superfícies
abrem · ⛔ nenhuma pendência nasce dela · ⛔ nenhuma leitura de A, B ou C deixa de
existir · ⛔ nenhum campo dela bloqueia terapia.

### ⛔ O que ⛔ NÃO entra nela

PA · FC · SpO₂ · glicemia · consciência · via aérea · ausculta · laboratório ·
imagem. São fatos do **episódio atual**, repetíveis, e continuam em suas casas.

### Duas superfícies **sem letra**

**Paciente** e **Laboratório** são painéis transversais. ⚠️ A letra carrega a
leitura de fluxo (A → G), e dá-la a um painel sugeriria que existe passo antes
de A. E a letra passou a ser derivada da posição **entre as superfícies com
letra** — se o painel consumisse posição, acrescentar um painel renomearia todas
as superfícies clínicas, e a letra é o que a equipe usa para dizer onde resolver
uma pendência.

### O único campo administrativo do módulo

`identificacao` é `natureza: "administrativo"` e `tipo: "texto"` — o **único**
texto livre do app. ⚠️ §0.3 continua proibindo caixa de texto para **valor
clínico**, e a exceção é declarada, ⛔ não um afrouxamento: sem ela, ou o campo
inventaria uma fonte, ou a exigência de `F-nn` cairia para os outros 50 campos.

⛔ **⛔ Nenhuma derivação o lê**, e a prova varre os três arquivos de derivação
para garantir. Limite fixado pelo autor: *"⛔ sem CPF, ⛔ sem obrigatoriedade, e
⛔ sem qualquer efeito sobre o fluxo."*

---

## PD-30 · TEMPORALIDADE SUBSTITUI `repetivel` — DECIDIDA (2026-08-29)

Eu havia proposto um booleano `repetivel`. O autor o recusou por ⛔ não dar conta
de três coisas diferentes, e nomeou a terceira:

> *"'Ainda ⛔ não realizada' às 14h e 'realizada' às 15h ⛔ não são contraditórios
> ⛔ nem correção. Ambos foram verdadeiros em seus momentos."*

| valor | nova entrada é | operação de §7.16 |
|---|---|---|
| **`estavel`** | o anterior ⛔ nunca foi verdade | **corrigir** |
| **`afericao`** | observação de um evento, que convive com as anteriores | **nova aferição** |
| **`estado`** | estados sucessivos do episódio | **mudança de estado** |

⚠️ Os 51 campos do módulo declaram a sua, e a prova reprova quem ⛔ não declarar.

⏳ **A instância** — que amarra cada aferição ao estudo ou à coleta a que
pertence — foi **contratada e ⛔ não implementada**: ela entra com **Laboratório**,
que é a primeira superfície inteiramente de aferições.

---

## PD-31 · SUBSTITUIR UM VALOR JÁ INFORMADO EXIGE GESTO — DECIDIDA (2026-08-30)

**A ambiguidade.** Redigitar um analito já registrado na mesma coleta podia ser
duas coisas clinicamente diferentes:

- *"o INR desta coleta é 1,4 — percebi que digitei errado"* → **correção**;
- *"o laboratório refez o resultado da mesma amostra"* → **informação nova**.

⚠️ E o app estava **adivinhando**, pela `temporalidade` declarada.

### A decisão do autor

> *"Redigitar um analito já informado na mesma coleta ⛔ não pode ser
> interpretado silenciosamente ⛔ nem como nova aferição ⛔ nem como correção. O
> gesto precisa ser explícito."*

- analito **vazio** → `Registrar resultado`;
- analito **já informado** → ⛔ **não** escrever por cima;
- alterar o existente → gesto explícito `Corrigir resultado`;
- **nova medida clínica** → `Nova coleta`.

⚠️⚠️ **A inferência morreu inteira** — ⛔ nem por `estavel`, ⛔ nem por `atributoDe`.
Inclusive para `plaquetas_unidade`:

> *"Se o médico registrou `80 mil/mm³` e depois muda para `/mm³`, ele ⛔ não está
> simplesmente alterando como o resultado aparece. Está dizendo que a declaração
> anterior sobre a unidade estava **errada**. Isso muda a interpretação clínica
> de `80.000/mm³` para `80/mm³`."*

⚠️ `atributoDe` continua garantindo que valor e unidade sejam lidos da **mesma**
instância. Ele ⛔ **não** concede exceção de correção implícita.

### A alergia a contraste ⛔ deixou de ser perguntada em C

> *"⛔ no A já coleta sobre alergias e no C de novo, ⛔ só deixamos no A"* — autor,
> 2026-08-30.

⚠️ Ela era **emprestada** de Paciente e aparecia nas duas telas. Empréstimo ⛔ não
duplica o **fato** — a trilha é a mesma —, mas duplica a **pergunta**. ⚠️⚠️ E a
segunda pergunta é pior que redundante: ela faz o médico **duvidar da resposta
que já deu**.

⚠️ A **leitura** continua em C: ler ⛔ não é coletar, e quem está diante da
angiotomografia precisa ver o que já se sabe. ⛔ A decisão de 2026-08-29
(**PD-25**) sobrevive inteira na leitura — ⛔ nada foi apagado, ⛔ só deixou de ser
perguntado duas vezes.

⚠️ A trava vale para o **módulo inteiro**, e ⛔ não ⛔ só para C: ⛔ nenhuma superfície
além de Paciente pode desenhá-la — ⛔ senão ela volta pela próxima.

### ⛔ O que ⛔ NÃO foi criado, e por quê

⛔ ⛔ **Nenhuma** terceira operação de *"repetição analítica da mesma amostra"*.
⚠️ Ela acrescentaria complexidade sem necessidade demonstrada. Se um segundo
módulo ou requisito real exigir, ela nasce **conscientemente** — e ⛔ não escondida
dentro de `afericao` (§9.1).

### A identidade do fato

Para dizer *qual* afirmação está sendo corrigida, `FatoRegistrado` ganhou `id`
estável e `corrigeFatoId`. ⛔ A chave `(instancia, campo, horaRegistro)` foi
**recusada** pelo autor: *"transforma três atributos do fato em uma chave
artificial… timestamps podem coincidir e ⛔ não deveriam carregar a
responsabilidade de identidade."*

⚠️ A trilha continua **plana e append-only**: ⛔ nenhuma estrutura paralela,
⛔ nenhum banco de versões.

### O motivo

⛔ ⛔ **Não** gravar *"Resultado corrigido pelo médico"*. Isso é o **tipo** da
operação, dito duas vezes. ⚠️ Motivo ⛔ não perguntado é motivo **ausente** — e o
app ⛔ não fabrica justificativa.

---

## PD-32 · CADA EXAME É UMA INSTÂNCIA, E A DIVERGÊNCIA ⛔ NÃO ELEGE — DECIDIDA (2026-08-30)

O contrato de instância — provado na pressão arterial e no Laboratório — passou
a valer para os **estudos de imagem**. ⛔ Nada foi redesenhado do zero.

### O corte que organiza a superfície

- **Achado** é o que o exame produziu: pertence ao **estudo**, e ⛔ sem estudo ⛔ não
  existe. `estudo_resultado`, `hipodensidade_clara`, `aspects`,
  `efeito_de_massa`, `sitio_oclusao`.
- **Juízo do episódio** é o que o médico suspeita olhando o paciente: casa **C**,
  ⛔ sem instância. `suspeita_hsa`, `suspeita_lvo`, `angio_disponibilidade`.

⚠️ `suspeita_hsa` prova o corte: ela existe **justamente quando a TC ⛔ não mostra
hemorragia**. Presa ao estudo, viraria achado da tomografia.

⛔ E ⛔ **não** são de Paciente. O critério de Paciente é *"isso continuaria
verdadeiro se o paciente ⛔ não tivesse este AVC?"* — e ⛔ não continuaria.

### `tc_resultado` dividido

⛔ *"Ainda ⛔ não realizada"* e *"realizada, resultado pendente"* ⛔ **nunca foram
resultado radiológico**. Misturadas no campo, tornavam-no irrepresentável com
mais de um estudo: duas TCs, e o app teria de dizer que a mesma tomografia foi e
⛔ não foi realizada.

- `estudo_resultado` — **duas** opções, na instância;
- a situação virou **derivação pura**, `situacaoDaTcSemContraste()`.

⚠️⚠️ **E é da TC sem contraste, ⛔ não de "qualquer tomografia"** — correção do
autor: *"TC de perfusão ⛔ não pode fazer o app concluir que a TC sem contraste
inicial está feita."* ⛔ Sem essa precisão, a arquitetura ficaria tecnicamente
correta e responderia à **pergunta clínica errada**.

⛔ E ⛔ nunca *"ainda ⛔ não realizada"*: sem estudo, a frase fala da **trilha**
(*"⛔ Nenhuma tomografia sem contraste registrada"*), e ⛔ não do mundo (**E-23**).

### A matriz de capacidades — literal, e ⛔ não por categoria

⛔ ⛔ **Não** é `parenquimatosa × vascular`. O autor recusou com o contraexemplo que
a quebra: *"hipodensidade é linguagem de **TC**, ⛔ não achado genérico de qualquer
imagem parenquimatosa."*

| modalidade | achados |
|---|---|
| TC sem contraste | resultado, hipodensidade clara, ASPECTS, efeito de massa |
| angio-TC · angio-RM | sítio de oclusão |
| perfusão · RM | ⛔ nenhum |

⚠️ Modalidade nova ⛔ **não herda ⛔ nada** — entra na tabela, ou ⛔ não oferece achado.
⛔ A RM ⛔ não ganha hipodensidade; ASPECTS por RM, se admitido, entra **declarado**
com a fonte que o admita. ⏳ Perfusão abre vazia até F definir o que consome.

### `angio_realizada` dissolvido

A **realização** é derivada da existência de estudo vascular. ⛔ O que ⛔ nenhuma
instância consegue dizer — *"⛔ não disponível neste serviço"* (**E-18**) —
sobreviveu como `angio_disponibilidade`. ⛔ **Ausência de estudo ⛔ nunca vira
indisponibilidade** (**E-23**).

⚠️ Nomeado pela pergunta, e ⛔ não pela negativa: `angio_indisponivel` com opção
"Disponível" seria campo negativo respondido no positivo.

### A divergência retém nos DOIS sentidos

> *"Fazer o app preferir 'local', 'mais novo', 'mais confiável' ⛔ ou qualquer
> outro atributo sem regra explícita seria justamente criar uma hierarquia que
> ⛔ ninguém autorizou."*

⛔ ⛔ Não se prefere: estudo local, externo, último registrado, com horário
conhecido, ⛔ nem o "aparentemente mais recente" quando a ordem ⛔ não é
estabelecível. ⚠️ A saída é **adjudicação explícita**: corrigir o
`estudo_resultado` errado, na mesma instância, com `corrigeFatoId`.

### `imagem_avancada` removido inteiro

⚠️⚠️ **Inclusive "Nenhuma"** — negativa agregada **sem leitor**. Quais exames foram
feitos passa a ser respondido pelas **instâncias**. Quando F precisar da
ausência de um exame, ela pede — ⛔ sem ressuscitar campo agregado artificial.

### ⛔ O que ⛔ NÃO foi criado

⛔ ⛔ Nenhuma calculadora de ASPECTS (**D-111**, slot **F-28** sem verbatim), ⛔ nenhuma
definição operacional de efeito de massa (**F-29**, sem fonte candidata), e
⛔ **⛔ nenhum** `tc_indisponivel`: sem fonte ⛔ nem consumidor, seria fato sem leitor.

---

## PD-33 · D INTERPRETA SEGURANÇA, E ⛔ NUNCA PROFERE VEREDITO — DECIDIDA (2026-08-30)

> *"O ponto mais delicado continua sendo manter **verbo da fonte + estado
> derivado** sem transformar tudo num 'pode/⛔ não pode trombolisar'
> simplificado."*

### D ⛔ não possui fatos

⛔ D ⛔ **não redeclara** ⛔ nada de Paciente, Laboratório, A ou C. Os ~30 antecedentes
que a Table 8 nomeia **já existiam** em Paciente, em três blocos recolhidos, com
as janelas temporais **no rótulo da opção** — e é isso que dispensa qualquer
cálculo: a banda é **declarada**, ⛔ nunca computada de uma data contra uma âncora
que a fonte ⛔ não define.

⚠️ D declara ⛔ **três** fatos, e os três são **juízo**, ⛔ nunca antecedente:

| fato | ⛔ por que ⛔ não é de Paciente |
|---|---|
| `incerteza_diagnostica` | *"só ganha significado porque altera a leitura de segurança. Em B ficaria órfã de interpretação."* |
| `motivo_para_suspeitar_alteracao_coagulacao` | julgamento de segurança — é o gatilho da rec. 10 |
| `sangramento_tratado` | **muda durante o atendimento** — ⛔ não é antecedente estável |

### ⛔ ⛔ Não existe agregado

⛔ ⛔ **Nenhuma** função devolve "pode" ⛔ ou "⛔ não pode". Cada item carrega **o verbo da
própria fonte**, em inglês, ⛔ não traduzido — traduzir o verbo de uma diretriz é
reescrevê-lo. A gradação dentro da faixa dita absoluta é preservada pelas
**quatro formas nomeadas**: *should not be administered* · *likely
contraindicated* · *potentially harmful* · *should be avoided* (**E-45**).

⚠️ A trava mede as quatro **por nome**, e ⛔ não por contagem: com seis itens na
faixa, contar verbos distintos tolera achatar dois — a mutação provou.

### O oitavo estado — `baixa_preocupacao_declarada`, e ⛔ não "sem restrição"

Os sete enumeram **restrições** e **estados epistêmicos**. A **faixa 1** existe, e
nela a fonte **declara risco baixo**. ⛔ Chamar isso de `desconhecido` seria falso;
de `situacao_individualizada`, inventar cautela que a fonte ⛔ não pede.
O nome foi recusado pelo autor:

> *"'Sem restrição' soa mais forte do que a diretriz permite e pode ser lido
> como 'liberado'. `baixa_preocupacao_declarada` diz apenas o que sabemos: a
> fonte colocou aquele cenário no lado de **menor preocupação**."*

⚠️ A Table 8 se descreve como *"general gradient of risk"*, e a legenda diz que a
faixa favorável ⛔ **não** está ligada a recomendações acionáveis. Chamá-la de "sem
restrição" promoveria gradiente a liberação.

⛔⛔ **O verbo específico prevalece sobre o agrupamento.** O estado agrupa; o verbo
decide. ⚠️ E ele ⛔ **nunca** nasce de silêncio: ⛔ não perguntado continua
`nao_perguntado`.

### O nome da superfície

`D · Segurança e elegibilidade` → **`D · Segurança para trombólise`**.

> *"'Segurança e elegibilidade' promete uma resposta que D deliberadamente ⛔ não
> fornece."*

⚠️ E **"para trombólise"**, e ⛔ não "da reperfusão": toda a interpretação desta
superfície é da **trombólise intravenosa**. F-08, que é trombectomia, ⛔ não entra.
Se um dia entrar, o nome amplia junto.

### A formulação clínica em português

> *"Em emergência, o médico brasileiro ⛔ não deveria precisar traduzir
> `potentially harmful and should not be administered` sob pressão."*

⚠️ A tela mostra a **frase em português** no corpo, e o **verbatim em inglês logo
abaixo**, como autoridade. ⛔ A tradução acompanha a fonte, e ⛔ **nunca** a
substitui.

⚠️⚠️ E ela vem de um **mapa fechado verbo → frase**, ⛔ não de um campo escrito item
a item: escrita item a item, a tradução **deriva**, e dois itens com o mesmo
verbo ganhariam frases de força diferente sem ⛔ ninguém perceber. A trava mede a
**bijeção**, os *hedges* obrigatórios (*likely* → provavelmente, *may* → pode,
*is unknown* → desconhecid‑) e as **formas de veredito proibidas**.

### F-30 · o `<48 h` do DOAC ⛔ não é calculado

A fonte diz *"recent DOAC exposure (<48 hours)"* e lista o *"timing of the last
DOAC administration"* entre os fatores — e ⛔ **não declara contra qual instante**.
⛔ Sem marco, ⛔ não há conta a fazer.

⛔ ⛔ Não se compara com agora, chegada, último-visto-bem, início dos sintomas ⛔ nem
reconhecimento. ⛔ E ⛔ **nem com horário em mãos** a janela é classificada — a trava
mede `janelaClassificada === false` e o **código ⛔ não pode conter a aritmética**.

⚠️ A pendência do horário existe, e **declara o que ⛔ não resolve**: registrar é
clinicamente útil, e ⛔ não classifica a janela. ⛔ Sem essa frase ela seria promessa
falsa.

### Pendências — três, e ⛔ nenhuma bloqueia

Coagulograma **⛔ só com o juízo** (rec. 10, **COR 2a**: cobrar exame de todo
paciente é o atraso que a fonte proíbe) · unidade das plaquetas ⛔ não declarada ·
horário do DOAC. ⛔ Fora: faixa 1, CMB desconhecido (**COR 1**, estado terminal
aceitável), contraindicações ⛔ não corrigíveis e consultas.

### PA e glicemia — três coisas distintas

| o quê | onde | ⛔ o que ⛔ NÃO é |
|---|---|---|
| corrigir valor digitado errado | mesma instância em A, gesto explícito | ⛔ não é medida nova |
| tratar clinicamente | **E · Correções** | ⛔ não é correção de fato |
| resposta ao tratamento | **nova aferição** em A | ⛔ ⛔ **não corrige** a medida anterior |

⚠️ PA 190/110 → tratamento → PA 170/95 registra **evolução real**. É a mesma regra
que a trava da Superfície A impôs quando a inferência por temporalidade tentou
transformar medida nova em correção.

---

## PD-34 · UMA LINHAGEM SÓ, E O QUE FEZ AS OUTRAS TRÊS NASCEREM — DECIDIDA (2026-09-05)

**De onde saiu.** O Sandro relatou que "parece que temos 2 versões do mesmo app,
e isso impede de corrigir corretamente". O levantamento achou **quatro** frentes
vivas do mesmo módulo, ⛔ e não duas:

| frente | o que tinha | por que existia |
|---|---|---|
| `refactor/…` **local** | AVC em 9 superfícies + 1.677 linhas **sem commit** | trabalho do dia nunca fechado |
| `refactor/…` **no origin** | 6 commits de padronização, incl. `refactor(ovace)` | push sem `git pull` do outro lado |
| `wt/avc-superficie-d` | 3 commits do design **Filete**, aprovados em 01/09 | worktree que ⛔ nunca voltou para o tronco |
| `emergencias-2-ui-core` | AVC como **árvore de decisão** (`avc-decision-tree.ts`) | linhagem paralela desde `main` 4873cc6 |

⚠️ ⛔ NENHUMA DAS DUAS LINHAGENS GRANDES CONTINHA O AVC DA OUTRA. Elas divergiram
do mesmo commit e reescreveram o módulo inteiro por caminhos diferentes — por
isso toda correção parecia se perder: ela ia para **uma** das quatro.

**A decisão.** Fica `refactor/clinical-modules-rebuild`. ⛔ Não por gosto:

| | refactor | emergencias-2 |
|---|---|---|
| e2e | **308 ✓ / 0 ✘** | 144 ✓ / **37 ✘** |
| arquivos · soltos na raiz | 745 · 19 | 1.147 · 42 |
| AVC | 3 camadas (`conteudo` × `nucleo` × tela), 25 testes | 1 arquivo, 3 testes |
| rastreabilidade | `slot` + `§` + página do PDF + `cor` (classe) + verbatim | texto livre |

⚠️ A rastreabilidade é o argumento que decide: `ivt_tnk_04` registra que TNK
**0,4 mg/kg** *"is not recommended"* citando `§4.6.2 rec. 2 · p. e357`, ⛔ e a
constante de uso é 0,25/25. A árvore antiga ⛔ não tinha como dizer isso.

**Superfície D — o kit `./ui` venceu o Filete.** As duas ⛔ não eram concorrentes
por acaso: **Filete** é camada visual (paleta escopada a D e B); o trabalho de
05/09 é camada de núcleo (`rascunho-numerico.ts`) ⛔ e reescreveu a tela sobre o
kit `./ui` **compartilhado com C**. Escolhido o kit: D e C ficam consistentes ⛔ e
o kit serve as duas. ⚠️ O Filete ⛔ não foi apagado — está em
`~/Documents/backups-clinical-emergency/filete-superficie-d-20260905.bundle`.

**O que ⛔ NÃO era duplicata, apesar de parecer.** `acls-pcr-standalone` tem
`admin-login`, `user-login`, tela de consentimento ⛔ e assistente de IA que o app
principal ⛔ não tem — apagá-lo derrubaria um app com autenticação ⛔ e usuários no
Supabase. `protocolos-medicos` é outro app (Next.js). ⛔ Os dois ficam.

### A regra que sai daqui

⚠️⚠️ **Worktree ⛔ não é branch de longo prazo.** Os dois worktrees viraram
diretórios órfãos em `APPs Projetos/` ⛔ e o git perdeu a referência — o Filete
ficou 4 dias fora do tronco enquanto a mesma tela era reescrita no tronco.
➜ Worktree fecha no **mesmo dia**, com merge ⛔ ou bundle.

⚠️⚠️ **`git pull` antes de escrever, `test:all` antes de `push`.** Os 6 commits do
origin subiram com **55 literais PT sem espanhol** — `test:all` vermelho para
quem puxasse. Corrigido em `lib/i18n/modules/ovace-cockpit.ts`.
