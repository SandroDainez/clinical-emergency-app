# MEROPENÉM — label oficial, tabela de ajuste renal VERBATIM

**Documento:** Meropenem for injection (I.V.) — US prescribing information.
**Onde foi lido:** DailyMed, setid `092ebd9b-77a0-4877-afc3-dd8211730f71`.
https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=092ebd9b-77a0-4877-afc3-dd8211730f71

## PROCEDÊNCIA DESTE ARQUIVO

- **Lido por mim (agente) em 2026-08-22, direto do label no DailyMed** — que é o
  repositório oficial da bula aprovada, não uma fonte terciária.
- ⚠️ **O PDF do FDA indicado (`050706s037lbl.pdf`) devolveu HTTP 404.** O texto
  abaixo é o do DailyMed, e é onde ele foi conferido.
- ⚠️ **PENDENTE DE CONFERÊNCIA DO AUTOR.** A cadeia só fecha com um humano no fim
  dela — foi assim com a KDIGO.

## TABELA 1 — dosagem no adulto com insuficiência renal

> | Creatinine Clearance (mL/min) | Dose | Dosing Interval |
> |---|---|---|
> | Greater than 50 | "Recommended dose (500 mg cSSSI and 1 gram Intra-abdominal)" | Every 8 hours |
> | 26 to 50 | "Recommended dose" | Every 12 hours |
> | 10 to 25 | "One-half recommended dose" | Every 12 hours |
> | Less than 10 | "One-half recommended dose" | Every 24 hours |

## DIÁLISE — as duas frases, e elas dizem coisas diferentes

> **Seção de dosagem:** "There is inadequate information regarding the use of
> Meropenem for injection (I.V.) in patients on hemodialysis or peritoneal dialysis."

> **Seção 10, OVERDOSAGE:** "Meropenem and its metabolite are readily dialyzable and
> effectively removed by hemodialysis"

⚠️ **AS DUAS SÃO CONTEÚDO, E NENHUMA É A OUTRA.** "Informação inadequada" é ausência
de dose recomendada — não é "não precisa ajustar". "É removido por hemodiálise" é
farmacocinética, e muda a conversa (dose após a sessão), mas **o label não diz qual
dose**. No catálogo: `sem_dados` com a razão escrita, mais a observação da
dialisabilidade, com força própria.

## ⚠️ O QUE ISTO CORRIGIU NO APP

O app tinha **três** faixas; o label tem **quatro**. **A faixa `< 10` não existia.**

| ClCr | app ANTES | label / app DEPOIS |
|---|---|---|
| < 10 | 12/12h | **24/24h** |
| 10–25 | "500 mg–1 g" 12/12h | **METADE da dose** 12/12h |
| 25 | faixa de cima (dose plena) | **faixa de baixo** (metade) |

Em ClCr < 10 o app dobrava a exposição diária de carbapenêmico em quem tem a menor
depuração. **Meropeném acumulado é neurotóxico** — rebaixamento, mioclonia, crise
convulsiva —, e o paciente que recebe costuma estar sedado, onde o efeito passa por
"encefalopatia da sepse".

⚠️ **E o teste de fronteira anterior não podia achar:** ele comparava o catálogo com
o MOTOR, nos valores 20 · 25 · 40 · 50 · 60 · 90 — que são as fronteiras que o
próprio código declara. **Testar as fronteiras que o código declara nunca encontra a
fronteira que o código não declara.**


---

# ⚠️ ACHADO DE 2026-08-23 — "DOSE RECOMENDADA" É REFERENTE, NÃO NÚMERO

**Levantado pelo autor, conferido por mim no mesmo label. NÃO corrigido nesta
rodada, por instrução.**

A tabela renal do meropeném diz **"one-half recommended dose"**. E a dose
recomendada **depende da indicação**:

> **Infecção complicada de pele e partes moles:** "500 mg given every 8 hours" —
> e "When treating complicated skin and skin structure infections caused by
> *P. aeruginosa*, a dose of **1 gram every 8 hours** is recommended."

> **Infecção intra-abdominal complicada:** "1 gram given every 8 hours".

> **Meningite bacteriana:** indicação **pediátrica** (3 meses ou mais), não adulta.

## O QUE ISSO SIGNIFICA NO APP, HOJE

O catálogo fixou **1 g** como dose de referência, e a `doseConcreta` das faixas de
metade vale **500 mg**. Isso está **certo na infecção intra-abdominal** e **errado
na de pele e partes moles**, onde a base é 500 mg e a metade seria **250 mg**.

| ClCr | label · pele (base 500 mg) | label · intra-abdominal (base 1 g) | app hoje |
|---|---|---|---|
| > 50 | 500 mg 8/8h | 1 g 8/8h | **1 g 8/8h** |
| 26–50 | 500 mg 12/12h | 1 g 12/12h | **1 g 12/12h** |
| 10–25 | **250 mg** 12/12h | 500 mg 12/12h | **500 mg 12/12h** |
| < 10 | **250 mg** 24/24h | 500 mg 24/24h | **500 mg 24/24h** |

⚠️ **O erro não aparece na fronteira — aparece na DOSE.** As fronteiras estão
certas; o que está errado é o referente. E ele erra **para cima** na indicação de
pele: o dobro da dose do label, em quem tem ClCr baixo, num carbapenêmico
neurotóxico.

## A FORMA QUE ISSO PEDE

O meropeném precisa de **eixo de indicação**, como o pip-tazo — e aí a tabela renal
deixa de ser absoluta e passa a ser **relativa à base**, que é como o label a
escreveu. A `doseConcreta` passa a ser calculada por indicação, não fixada.

⚠️ **E a lição é da estrutura, não do fármaco:** o catálogo guarda `dose` como
TEXTO. Quando a fonte escreve uma FRAÇÃO ("metade da dose recomendada"), o texto
carrega um **referente** que o dado não representa — e alguém precisa resolvê-lo. Foi
resolvido uma vez, à mão, e ficou parecendo número.
