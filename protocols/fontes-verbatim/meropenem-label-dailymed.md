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
