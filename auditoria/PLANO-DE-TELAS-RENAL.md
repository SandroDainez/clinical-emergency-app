# Plano de telas do módulo renal — para revisão ANTES de implementar

**Nada foi implementado.** Escrito em 2026-08-23, depois do percurso do autor no
celular.

---

## §1 · ⚠️ UM CONFLITO QUE PRECISA SER RESOLVIDO ANTES DA PRIMEIRA LINHA

O plano recebido põe **as seis emergências no passo 4**, depois de confirmar IRA
e estadiar. **A especificação do autor diz o contrário, em título de seção:**

> **"4. PRIMEIRA TELA — TRIAGEM DE GRAVIDADE.** Logo no início, **antes de longas
> investigações**, verificar se existe emergência renal ou metabólica. […] **Não
> obrigar o médico a percorrer toda a investigação antes de tratar uma ameaça
> imediata."**

E colide também com a regra universal do app — estabilização antes do protocolo.

**A minha leitura, e é a razão de eu não ter começado a escrever:** o que o autor
reprovou no celular **não foi a POSIÇÃO das seis. Foi a PORTA.** A tela pergunta
*"Você já sabe qual das seis é?"* — categorização antes de olhar. Mas a varredura
que vem depois do "Não sei — verifique comigo" **já faz exatamente o que o plano
pede**: uma emergência por vez, por sinal observável, na ordem de risco de morte,
com "não sei" em cada uma.

> **O defeito é a bifurcação de entrada, não o lugar da triagem.**

**Proposta:** as seis continuam cedo (passo 2, logo após situar), e o passo de
confirmação/estadiamento vem depois delas — como está hoje e como a especificação
manda. **Se o autor quiser mesmo as seis depois do estadiamento, é decisão dele e
contraria a própria especificação — por isso não decido.**

---

## §2 · O QUE A ESPECIFICAÇÃO PEDE PARA AS ETAPAS 0–3 E NÃO EXISTE HOJE

| etapa | o que a especificação pede | existe? |
|---|---|---|
| **0 · instável agora?** | *"Não obrigar o médico a percorrer toda a investigação antes de tratar uma ameaça imediata"* | ⚠️ **existe como CARD, não como passo.** `StabilizationFirstCard` é um bloco que se rola por cima — não pergunta nada e não tem resposta |
| **1 · o que fez pensar em rim?** | §2 lista as oito situações de entrada: creatinina elevada · aumento recente · oligúria · anúria · redução inexplicada · IRA já diagnosticada · suspeita de IRA sobre DRC · distúrbio hidroeletrolítico | ❌ **não existe nenhuma tela.** ⚠️ O conteúdo **já está escrito pelo autor** — não precisa inventar nada |
| **2 · isto é IRA?** | §5: creatinina atual · basal conhecida · valores anteriores e intervalo · diurese · peso · tempo de evolução | ✅ existe (`dados_do_caso`, `basal_conhecida`, `sem_base`) — **mas só depois das seis** |
| **2b · IRA sobre DRC** | §6: quatro saídas — IRA isolada · DRC sem agudização · IRA sobre DRC · **indeterminada** | ✅ existe (`sobre_drc`, `drc_pistas`, `cronico_agudizado`, `drc_sem_agudizacao`, `indeterminado`) |
| **3 · estágio** | §5: calcular quando houver dados · **explicar qual critério determinou o estágio** · informar quando insuficiente · não presumir basal · não inventar diurese | ✅ existe, e **melhor do que a especificação pede**: o `derive` devolve os dois eixos por extenso (*"Eixo creatinina: estágio 2 (2,1× a base)"* · *"Eixo diurese: 0,42 mL/kg/h por 8 h"*) |
| **3b · diurese por peso** | §5 | ✅ já é `mL/kg/h` com peso e horas — **não existe `30 mL/h` fixo em lugar nenhum** |

**Conclusão da leitura:** falta **uma tela** (a etapa 1) e falta **transformar o
card 0 em passo**. Todo o resto das etapas 0–3 já está escrito e funcionando —
**no lugar errado da fila, não ausente.**

⚠️ **E há uma coisa que a especificação pede e ninguém notou que falta:** §5 pede
*"valores anteriores e intervalo entre eles"*. O app coleta creatinina atual e
basal, **mas não o intervalo entre as duas medidas** — que é o dado da D-93 (o
tempo de instalação). É a mesma lacuna que apareceu no sódio e na hipercalcemia,
pela terceira vez.

---

## §3 · O PLANO DE TELAS — uma linha por decisão

| # | tela | a decisão que ela toma | origem |
|---|---|---|---|
| **0** | **Está instável agora?** | via aérea, respiração, circulação, consciência → estabilizar antes, ou seguir | ⚠️ **novo como passo**; o conteúdo é o card que já existe |
| **1** | **O que fez você pensar em rim?** | situa o caso e escolhe por onde entrar | ⚠️ **nova**; conteúdo da §2 da especificação, com **"não sei, me ajude a entender o que estou vendo"** |
| **2** | **As seis, uma por vez** | há ameaça à vida agora? | ✅ **existe** (`e1`…`e6`) — muda só a porta |
| 2·atalho | **Já sei qual é** | pula para a emergência reconhecida | ✅ existe (`atalhos`) — **vira saída secundária**, sai da entrada |
| **3** | **Isto é IRA?** | creatinina, basal, diurese, peso, tempo | ✅ existe (`dados_do_caso`) |
| **3b** | **Basal desconhecida** | estimar (MDRD eGFR 75, na ausência de DRC) ou seguir sem estadiar | ✅ existe (`sem_base`, D-65) |
| **4** | **É IRA sobre DRC?** | quatro saídas, com a indeterminada | ✅ existe (`sobre_drc`) |
| **5** | **Qual o estágio?** | KDIGO 1/2/3 pelos dois eixos, calculado | ✅ existe (`estagio_kdigo`) |
| **6** | **Há obstrução?** | descartar o pós-renal primeiro | ✅ existe (`obstrucao_check`) |
| **7** | **Volemia e perfusão** | hipovolemia · vasoplegia · congestão · baixo débito · **incerto** | ✅ existe (`volume_check`, `vol_dados`) |
| **8** | **Nefrotóxicos** | suspender e reajustar | ✅ existe (`nefrotoxico_check`) |
| **9** | **Precisa de TRS?** | indicação, e quem decide | ✅ existe (`trs_check`) |
| **10** | **Reavaliação e destino** | o que medir, quando, quem chamar | ✅ existe (`seguimento`, `destino_*`) |

**Telas novas: 2.** Telas que só mudam de posição: 1 (o atalho). O resto fica
como está.

---

## §4 · A CONTAGEM DE BLOCOS ATÉ A PRIMEIRA DECISÃO — hoje

`npm run medir:blocos`

```
1. Header (título do módulo + voltar)
2. Barra de retomada — «Você estava aqui»      ⟨só se houver percurso anterior⟩
3. Card «Estabilização primeiro (ABCDE)»
4. Faixa «peso não aferido»                     ⟨só se o peso for estimado⟩
5. Descrição do módulo (texto + «ver mais»)     ⟨só no passo 1⟩
6. Chip «Passo N» + trilha
7. ⟵ AQUI a primeira decisão

BLOCOS ATÉ A PRIMEIRA DECISÃO: 3 sempre · 6 no pior caso
DENTRO do card: title + question + summary + 2 linhas de evidência, antes de 2 botões
```

⚠️ **O pior caso é o primeiro acesso do dia com peso estimado — que é o caso
comum à beira do leito**, não a exceção.

E dentro do card, **a pergunta aparece duas vezes**: no `title` (*"Você já sabe
qual das seis é?"*) e no `question` (*"Escolha por onde começar…"*). Mais o
`summary` (*"Antes de investigar, trate o que ameaça a vida"*), que **repete o
card de estabilização** que está logo acima.

---

## §5 · O QUE SAI DA TELA E VAI PARA O «POR QUE ISTO»

Medido: **9 literais** com linguagem de PROCESSO na árvore renal.

**Saem para o "Por que isto" (ou só para o arquivo de procedência):**

1. *"Nenhuma diretriz de hipercalemia está citada no repositório. A UKKA aguda existe e NÃO recomenda diurético de alça; a KDIGO não tem diretriz de hipercalemia, só relatório de conferência."*
2. *"⚠️ FORÇA NÃO INFLADA: o grau que a diretriz dá a ESTE trecho não foi conferido no documento…"*
3. *"⚠️ FORÇA NÃO INFLADA: revisão nomeada sustenta a dose como prática aceita… Verbatim em protocols/fontes-verbatim/riccardi-2025-ira-uti.md…"*
4. *"A exceção literal da mesma 3.4.2… Verbatim em protocols/fontes-verbatim/kdigo-2012-aki.md."*

**À beira do leito, o que resta na tela é uma linha:** a força e a fonte, curtas
— *"prática aceita · UKKA 2023"*. O que o app **não** tem, o que **outra**
diretriz diz e por que a fonte X não serve é registro de auditoria.

**FICAM na tela** (são conduta, não processo):

- *"Este app não escolhe dose de bicarbonato — isso é do contexto e do serviço."*
- *"Este app não escolhe modalidade, dose nem momento de diálise — isso é do nefrologista e do serviço."*
- *"Este app não conduz a síndrome hepatorrenal — reconhecê-la é o que faz chamar quem conduz."*
- *"⚠️ ENQUANTO A DIÁLISE NÃO CHEGA, o que sustenta o paciente é o que este app sabe fazer…"*

⚠️ **A diferença entre os dois grupos:** o primeiro fala do **repositório**; o
segundo fala do **limite do app diante do paciente** — e esse limite é conduta:
diz ao médico que chamar alguém é o próximo passo.

---

## §6 · OS DEFEITOS DE ESTRUTURA, E O QUE FAZER COM CADA UM

| # | defeito | proposta |
|---|---|---|
| 1 | a pergunta aparece no chip do passo **e** no título | o chip mostra só `Passo N` + o nome curto da etapa; a pergunta fica só no título |
| 2 | dois cards de DECISÃO CLÍNICA na mesma tela | uma decisão por tela — regra do projeto, e a entrada nova já resolve |
| 3 | quatro blocos antes da primeira decisão | a retomada já é condicional; **a descrição do módulo colapsa por padrão** e o `summary` da entrada sai |
| 4 | banner de estabilização **e** *"Antes de investigar, trate o que ameaça a vida"* dizem o mesmo | fica **uma**, e ela vira o **passo 0** |
| 5 | a lista das seis aparece antes de a pessoa decidir | sai da entrada; vira as perguntas do passo 2 |

---

## §7 · O QUE EU NÃO VOU FAZER SEM RESPOSTA

1. **A ordem das seis** (§1) — contraria a especificação, e a especificação é do
   autor.
2. **O texto da tela 1** — as oito situações de entrada estão na especificação,
   mas **o texto exato do "não sei, me ajude a entender o que estou vendo"** é
   clínico e é dele.
3. **O intervalo entre as creatininas** (§2) — é a D-93 pela terceira vez, e a
   forma já está proposta em `auditoria/PROPOSTA-TEMPO-DE-INSTALACAO.md`, sem
   "pode aplicar".
