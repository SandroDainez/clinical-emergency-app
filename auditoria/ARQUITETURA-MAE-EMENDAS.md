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
