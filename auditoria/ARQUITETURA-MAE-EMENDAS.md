# EMENDAS À ARQUITETURA-MÃE

**Origem:** decisões do autor (Dr. Sandro Dainez) posteriores ao documento.
**O que este arquivo é:** o registro do que mudou **depois** que
[`ARQUITETURA-MAE.md`](./ARQUITETURA-MAE.md) foi escrito.

⚠️ **NÃO MISTURAR COM O ORIGINAL.** Mesma disciplina dos outros pares: o
documento é registro histórico e não se edita; o que mudou vem **ao lado**, aqui,
e **prevalece** onde houver conflito.

---

## AM-1 · TRAVA NOVA — nenhum nó afirma achado não capturado a montante

Registrada em 2026-08-20, depois de o autor encontrar no fluxo uma frase que
tratava **falta de ar** como fato estabelecido, quando nada no caminho até ali
tinha perguntado isso. **O app estava afirmando o que devia perguntar.**

> **Nenhum nó pode afirmar um achado clínico DESTE paciente que não tenha sido
> capturado em algum caminho a montante.** Ordem, critério e enunciado geral
> sobre a doença **não são** afirmação. A verificação é a mesma análise de
> alcançabilidade da trava da calculadora (§7.9 do original).

### As quatro naturezas — e é a classificação que torna a trava utilizável

A primeira varredura do módulo renal achou **58 ocorrências candidatas**.
Reprovar as 58 seria inútil: 46 não são defeito, e **linter que grita lobo é
linter que ninguém obedece**. Então as naturezas entram como DEFINIÇÃO:

| natureza | exemplo | reprova? |
|---|---|---|
| ordem | "colha gasometria", "meça a diurese" | não — manda fazer, não afirma |
| critério | "conta como evidência de DRC:", "as seis:" | não — ensina o que contaria |
| geral | "a creatinina sobe tarde", "costuma dar" | não — fala da doença |
| **afirmação sobre ESTE paciente** | "com a glicemia basal abaixo de…" | **sim** |
| **vinheta** | "um paciente lúcido, comendo e sem dispneia…" | **sim** |

### A quinta natureza — VINHETA (acrescentada pelo autor em 2026-08-20)

A trava nasceu parando na quarta, e o buraco estava declarado: a frase que
originou tudo — *"creatinina de 4 num paciente lúcido, comendo e sem dispneia
costuma ser crônica"* — não afirma nada sobre ninguém em particular e passava
limpo. A distinção que fecha o buraco é do autor:

> **Enunciado geral fala de VARIÁVEIS e da doença; vinheta descreve ALGUÉM.**

VINHETA é o enunciado que introduz um **sujeito clínico** — paciente, doente,
caso, "um homem de 70 anos" — com **achados pendurados nele**. Quem lê com o
paciente na frente lê a vinheta como descrição do paciente que está na frente:
é a forma mais fácil de contrabandear pressuposição para dentro de um texto que
parece didático.

⚠️ **Ela reprova mesmo com marca de enunciado geral** ("costuma ser"), porque era
justamente essa combinação que escapava.

**A correção é reescrever por variáveis**, e a trava não proíbe ensinar:
*"um paciente anúrico há 12 h já é estágio 3"* → *"anúria de 12 h já é estágio
3"*. Mesma informação, sem gente inventada.

Duas ocorrências foram encontradas e corrigidas ao acrescentá-la — a segunda
ninguém tinha visto: *"bexiga cheia com o paciente sem urinar"* virou *"bexiga
cheia sem diurese"*.

### A correção, quando reprova

Uma de duas, e o critério é o que já vale no app:

- o achado **muda o que se faz nos próximos minutos** → vira **pergunta**, com as
  três saídas (sim · não · não sei, me guie pelos sinais);
- **não muda** → a frase **sai**.

⚠️ **Nenhuma delas vira texto condicional** ("se houver falta de ar…"). Isso é a
poluição já reprovada, em roupa nova.

### Onde está

`scripts/valida-pressuposicao.cjs`, rodando em `test:all`. Hoje cobre o módulo
renal; cada árvore entra quando migra para o formato novo.

⚠️ **O QUE ELA NÃO PEGA, DECLARADO:** a detecção da quarta natureza é por FORMA
da frase — posse ("dele"), estado declarado ("o paciente está…"), valor tratado
como em mãos ("com a glicemia abaixo de…"). **Forma nova de afirmar passa
batido.** E há um caso importante que ela não pega por desenho: a frase geral que
descreve um paciente hipotético ("creatinina de 4 num paciente lúcido, comendo e
sem dispneia costuma ser crônica") — ela não afirma nada sobre ninguém, mas
**funciona como se o app soubesse**, e foi assim que o defeito original chegou à
tela. Esse continua sendo trabalho de leitura, e a trava não substitui o olho.

## AM-2 · A §7.8 (fonte por nó) virou PORTÃO

O original já listava "atribuição de fonte no nível do módulo quando as
recomendações têm origens diferentes" como trava. Em 2026-08-20 ela deixou de ser
pendência e passou a ser **portão**: **nenhum módulo novo entra sem campo de
fonte por nó.**

O defeito que a promoveu: o rodapé "KDIGO 2012" aparecia embaixo das doses de
cálcio, insulina e salbutamol, que vêm do módulo de Eletrólitos. O rodapé saiu; o
campo por nó ainda não existe.

## AM-3 · A FORÇA DA AFIRMAÇÃO — campo novo, ao lado de `fonte`

Registrada em 2026-08-20, por ordem do autor:

> *"Vocês estão começando a separar verdade fisiológica, prática clínica
> aceitável e recomendação formal de guideline. Eu manteria essa distinção em
> todo o repositório."*

⚠️ **Isso já estava na especificação do renal, §20** — *"diferencie: recomendação
estabelecida; prática razoável; evidência limitada; decisão dependente do
contexto"* — e ficou como **intenção em prosa por meses**. Prosa não se cumpre
sozinha: virou campo.

### Por que `fonte` não bastava

`fonte` responde **de onde veio**; não responde **que tipo de afirmação é**. Na
mesma tela e com a mesma aparência conviviam *"5 golpes nas costas + 5
compressões abdominais"* (AHA 2025, Classe 1, Nível A) e *"furosemida pode
aumentar a excreção urinária de potássio"* (plausibilidade fisiológica, sem
estudo de eficácia no agudo). **As duas têm fonte. O usuário sem experiência não
tinha como distinguir** — e ele é a população-alvo.

### O campo

| força | exige |
|---|---|
| `recomendacao_formal` | `fonte` + **classe/grau literal da fonte** |
| `pratica_aceita` | `fonte` + tipo do documento (consenso, painel, revisão, bula) |
| `mecanismo_fisiologico` | a razão fisiológica **e** a lacuna de evidência, escritas |

E `contextoDaFonte`, **obrigatório quando o contexto original da fonte difere do
nó** — população, cenário, agudo × crônico. ⚠️ **É o campo que existe por causa
do erro mais repetido do projeto:** pH < 7,0 vindo da cetoacidose, 126 mg/dL
vindo do diagnóstico de diabetes em jejum, UKKA 7.1 vindo da hipercalemia
crônica. Nenhum linter julga transposição semanticamente — mas **exigir o campo
obriga quem escreve a olhar**, e o que se declara, se confere.

### A consequência visual não é opcional

Os três níveis **parecem diferentes na tela** (`selo-de-forca.tsx`), com o design
system existente: cor `primary` na recomendação formal, `textSecondary` na
prática aceita, `warning` com fundo no mecanismo fisiológico. **A lacuna de
evidência e o `contextoDaFonte` aparecem junto da ação, não atrás de um toque.**
Campo que só o desenvolvedor vê não corrige nada.

### A trava, e o que ela NÃO promete

`test:forca-da-afirmacao`: conduta sem `procedencia` reprova; `recomendacao_formal`
sem classe/grau reprova. ⚠️ **Ela não julga se a força está CERTA** — isso é
leitura de fonte, e é do médico.

⚠️ **E a pendência é DECLARADA, não silenciosa:** `auditoria/forca-pendente.json`
lista, com motivo, cada conduta ainda sem classificação. Ordem do autor: *"não
invente a força de nenhuma conduta; onde não estiver claro, marque como pendência
e pare"*. Hoje: **27 condutas no renal · 6 classificadas · 21 pendentes com
motivo**.
