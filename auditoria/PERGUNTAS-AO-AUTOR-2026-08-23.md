# Cinco perguntas ao autor — 2026-08-23

Todas travadas por decisão clínica, nenhuma decidida por mim. Em ordem do que
destrava mais trabalho.

---

## 1 · Eletrólitos: qual é a sua referência-base?

**8 dos 12 distúrbios não têm diretriz nomeada.** Os cortes de gravidade de
**cálcio, magnésio, fósforo e cloro** estão em `lib/eletrolitos/gravidade.ts`
como pendência com alvo *"fonte primária a nomear pelo autor"* — que é o mais
honesto que consegui escrever sem saber de onde vieram.

Sem isso, esses cortes ficam pendentes para sempre.

> **Qual referência o senhor adota como base para distúrbios eletrolíticos?**
> (uma só, ou uma por eletrólito — o que for verdade na sua prática)

Os números pendentes, para conferir junto:

| distúrbio | corte de "grave" |
|---|---|
| hipocalcemia | < 7 mg/dL |
| hipercalcemia | ≥ 14 mg/dL |
| hipomagnesemia | < 1,2 |
| hipermagnesemia | ≥ 4,9 |
| hipofosfatemia | < 1 |
| hipocloremia | < 95 |
| hipercloremia | ≥ 115 |
| hipernatremia | ≥ 160 |

E as cinco referências de conduta da camada 2, também sem fonte:
`8–10 mEq/L em 24 h` · `0,5 mEq/L/h` · `500–1000 mL por etapa` ·
`ureia 0,25–0,50 g/kg/dia` · `0,5–1,0 mL/kg/h` · `D5W 3 mL/kg/h`.

---

## 2 · D-82 — o verbatim da SSC 2021 para 0,25 · 4 h · 0,5

A frase corrigida diz: *"Considerar hidrocortisona 200 mg/dia se a dose se
mantiver ≥ 0,25 por pelo menos 4 h"* e *"não esperar chegar a 0,5"*.

Os três números não têm verbatim no repositório.

> **O verbatim da SSC 2021 — e a força que ele carrega.**
> ⚠️ Se o critério estiver no TEXTO DE PRÁTICA e não na recomendação graduada,
> a força é `pratica_aceita`, não `recomendacao_formal`. O próprio texto do app
> já suspeita disso ("SSC 2021, texto de prática, nunca recomendação graduada").

---

## 3 · D-81 — coronárias: qual das duas leituras vale?

Não é tradução: **são parágrafos diferentes**, e afirmam coisas distintas sobre
o estado das diretrizes.

- **PT:** *"A ACC/AHA 2025 MANTÉM STEMI/NSTEMI e incorpora só parte desse
  reconhecimento; as diretrizes australianas de 2025 adotaram a nomenclatura
  OMI. O app usa a nomenclatura corrente de propósito."*
- **ES:** *"No es nomenclatura oficial de las guías actuales, y esta app no la
  adopta como criterio."*

> **Qual das duas fica?** A outra é reescrita para dizer o mesmo.

---

## 4 · D-85 — os três distúrbios sem escala: o texto está certo?

Hiperfosfatemia, hipocloremia e hipercloremia passaram a ter **um degrau só**,
com o texto que o senhor ditou:

> *"A gravidade aqui não muda a apresentação. O que muda a conduta é a causa e a
> velocidade de instalação"* — e, na hiperfosfatemia, *"…e o cálcio associado"*.

Está no dado como `forca: definicao`, assinado `Dr. Sandro Dainez, 2026-08-23`,
pendente da sua confirmação. **Nenhum sintoma foi inventado** para preencher o
degrau que saiu.

> **Confirma o texto e a assinatura?**

---

## 5 · D-83 — onde vive hoje a dose de trombolítico?

`scripts/auditoria-doses-criticas.cjs` auditava dose de trombolítico por peso
(teto, monotonicidade, peso ausente) em `avc/calculators.ts` e
`coronary/calculators.ts`. Os dois foram apagados no refactor `a9b16ad`, e o
instrumento crashou em silêncio até hoje.

As funções não existem mais com o mesmo nome. Escolher qual código de hoje ocupa
o lugar delas é decidir **o que auditar** — escopo, não conserto.

> **Para onde eu reaponto o auditor?**

---

## 6 · Cálcio — proposta a confirmar

⚠️ **A pergunta anterior estava mal feita** e foi reescrita: ela pedia "os cortes
do iônico", um número que provavelmente não existe em diretriz — a mesma
armadilha da "referência-base única" que o senhor já recusou uma vez.

**O que a fonte diz muda o arranjo:** a Society for Endocrinology escreve
*"grave: < 1,9 mmol/L **e/ou sintomas em qualquer valor abaixo da referência**"*.
Ou seja, **o critério que decide conduta na hipocalcemia é o SINTOMA** — e
sintoma é igual nos três ensaios (total, ajustado, iônico).

**Proposta:** o app pergunta **primeiro** se há sintoma. Havendo, trata como
grave qualquer que seja o ensaio e o valor. Não havendo, o número orienta
conforme o ensaio informado.

> **1.** Confirma esse arranjo?
> **2.** Qual a **lista de sintomas** que entra na pergunta?
> *(proposta, para o senhor cortar ou acrescentar: parestesia peribucal e de
> extremidades, cãibra, tetania, Chvostek/Trousseau, laringoespasmo, convulsão,
> QT longo/arritmia)*
> **3.** Para o **iônico**: prefere corte próprio (e de qual fonte) ou **sem
> corte**, deixando o ramo sintomático e a referência do laboratório
> responderem?
>
> ⚠️ **"Sem corte, com o critério clínico no lugar" é resposta legítima** — e é
> o que evita repetir o erro de pedir número onde não há.

**A estrutura já está pronta e vazia:** o degrau sintomático existe em
`lib/eletrolitos/gravidade.ts` com `texto: ""`. Enquanto estiver vazio ele
**nunca casa** e nada muda na tela. Quando o senhor preencher, ele passa a valer
sem tocar em código de tela.

## 7 · A faixa intermediária da hipercalcemia

A fonte tem três faixas; o app tem uma. Falta **3,0–3,5 mmol/L (≈ 12–14 mg/dL)**,
que a fonte descreve como *"trata conforme sintomas e contexto"*.

> **Qual texto de conduta entra nessa faixa?**
> ⚠️ Ela não é faixa pura — é faixa **+** critério clínico. Ver a proposta em
> `auditoria/PROPOSTA-CRITERIO-NAO-NUMERICO.md`, que precisa do seu "pode
> aplicar" antes de existir.

## 8 · Magnésio — segue intocado

`< 1,2` e `≥ 4,9` mg/dL continuam exatamente como estavam, sem fonte. Aguardando
a sua conferência **número a número**, como o senhor pediu.
