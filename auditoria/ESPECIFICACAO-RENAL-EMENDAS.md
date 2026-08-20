# EMENDAS À ESPECIFICAÇÃO DO MÓDULO RENAL

**Origem:** mensagem de chat do autor (Dr. Sandro Dainez), recebida em 2026-08-18.
**O que este arquivo é:** o registro do que foi decidido **depois** que a especificação
de 22 seções foi escrita.

⚠️ **NÃO MISTURAR COM O ORIGINAL.** A disciplina é a mesma do retrato antes/depois: a
especificação é registro histórico e não se edita; o que mudou vem **ao lado**, aqui.
Quem for ler o módulo lê os dois — primeiro a especificação, depois estas emendas, que
prevalecem onde houver conflito.

✅ **A ESPECIFICAÇÃO ESTÁ ARQUIVADA** desde 2026-08-20, verbatim, em
[`ESPECIFICACAO-RENAL.md`](./ESPECIFICACAO-RENAL.md) — com a nota da §19 ao lado do
texto, sem apagar nada dele. Estas emendas prevalecem onde houver conflito.

---

## E-1 · Toda decisão tem terceira saída

A especificação foi escrita antes da regra "o app pergunta antes de mandar, e toda
pergunta tem saída de «não sei» com o que fazer para descobrir".

O instinto já estava lá na §5 — ramo específico para "basal desconhecida", "informar
quando os dados forem insuficientes". A emenda **generaliza isso para toda decisão da
árvore**.

## E-2 · "Não sei" é ramo do fluxo, nunca texto

Leva a perguntas menores, respondíveis olhando o paciente, que devolvem a resposta à
decisão original. **Nunca um parágrafo explicativo, nunca um acordeão, nunca um
tooltip.**

## E-3 · Toda tela de ação responde cinco coisas

O que dar · quanto · por qual via · em quanto tempo · o que reavaliar e quando.
**Sem os cinco, não é nó de ação.**

## E-4 · Toda recomendação carrega fonte

`fonte` + `versao` + `revisadoEm`. Conceito que não existia quando a especificação foi
escrita.

## E-5 · Padrão visual entra no fluxo quando o reconhecimento é visual

O ECG da hipercalemia é o caso. Regra dura para não recriar poluição: **uma imagem só
entra numa tela se muda a resposta da pergunta daquela tela.** Padrão diagnóstico entra;
ilustração e anatomia decorativa não.

## E-6 · §19 fora do escopo, permanentemente

`lib/contexto-do-paciente.ts` guarda peso, altura, sexo e idade, e **proíbe** PA, SpO₂,
glicemia, lactato, pH e potássio, com a razão escrita: *valor que muda de minuto a
minuto, preenchido sozinho, é número morto que ninguém tem motivo para duvidar.* A razão
é boa e sobrevive.

**Emenda que a reforça:** quando um valor volátil for reexibido adiante **dentro do mesmo
módulo**, a tela mostra **quando foi informado** — "K⁺ 6,8 — informado há 4 min". Valor
que carrega a própria validade é o oposto de valor preenchido sozinho.

⚠️ **Estado desta emenda em 2026-08-18: NÃO IMPLEMENTADA.** O bloco das 6 captura os
valores no ponto de decisão, mas nenhuma tela ainda reexibe valor volátil com a hora em
que foi informado. Fica como pendência própria — ver o relatório do bloco.

## E-7 · As armadilhas da §11 mudam de lugar

"Não usar dopamina em dose renal" e "não usar diurético para recuperar função renal" são
corretas e importantes, mas **numa lista viram leitura**. Elas mudam o que se faz — então
pertencem ao **nó de decisão onde a ação errada é tentadora**: dentro do ramo de
volemia/perfusão da §7, no momento em que o médico está prestes a mandar volume ou
furosemida.

Aviso que aparece antes da tentação funciona; numa lista, não.

## E-8 · O bloco das 6 é a implementação da §4

O aviso da §3 — "não transformar as etapas em capítulos rígidos quando precisarem
ocorrer em paralelo" — é respeitado exatamente assim: a triagem de gravidade entra antes
e por fora da investigação, trata, e devolve ao fluxo.

## E-9 · Base de estadiamento: KDIGO 2012

A KDIGO 2026 AKI/AKD **continua sendo draft** — a revisão pública foi estendida até
11/05/2026 e encerrou, e o work group está preparando a publicação, sem data anunciada.

O módulo estadia por **KDIGO 2012**. Se citar o draft 2026, cita **marcado como draft,
com a data**. Fonte: kdigo.org/guidelines/acute-kidney-injury/.

## E-10 · O retorno da §12 é legítimo

"IRA → hipercalemia → tratar → retornar ao ponto da árvore" é o que acontece de verdade e
**fica como está**.
