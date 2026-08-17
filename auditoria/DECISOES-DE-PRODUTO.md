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
