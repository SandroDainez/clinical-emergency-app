# KDIGO 2012 — AKI · recomendações VERBATIM

**Documento:** KDIGO Clinical Practice Guideline for Acute Kidney Injury.
Kidney Int Suppl. 2012;2(1).
**PDF público:** https://kdigo.org/wp-content/uploads/2016/10/KDIGO-2012-AKI-Guideline-English.pdf

## ⚠️ POR QUE ESTE ARQUIVO EXISTE

Três forças de afirmação ficaram travadas por uma razão só: **a diretriz não estava
no repositório**. O que havia era a referência bibliográfica no
`protocols/guidelines_metadata.json` — título, ano, URL, citação. Referência
bibliográfica não é fonte; **texto é**. Sem o texto, qualquer grau que eu
escrevesse viria da minha memória ou do conteúdo do próprio módulo — e usar o
módulo para justificar o módulo é o defeito de "procedência por vizinhança", já
corrigido duas vezes neste projeto.

Este arquivo guarda o TEXTO. É contra ele que a força de cada nó é conferida.

## PROCEDÊNCIA DESTE ARQUIVO — a cadeia fechou

- **Transcrito pelo autor** (Dr. Sandro Dainez) a partir do PDF público acima.
- **✅ CONFERIDO CONTRA O PRIMÁRIO em 2026-08-21**, pelo autor, **médico**, no
  **resumo das recomendações, PÁGINA 12** do PDF: as três frases, a numeração e o
  grau. `revisadoPor: autor (médico)`.
- **⚠️ O que isso significa e o que não significa:** significa que há **um humano
  no fim da cadeia**, que abriu o documento e leu. A marca "não conferida contra o
  primário" saiu por isso — não por eu ter conseguido abrir o PDF (não consegui; a
  busca devolveu HTTP 403), mas porque quem podia abrir, abriu.
- **O que continua faltando:** as **Tabelas 8 e 9** (creatinina basal desconhecida),
  não transcritas. É o que mantém o nó `sem_base` sem atribuição à diretriz (D-65).

---

## AS TRÊS RECOMENDAÇÕES

> **3.4.1 (1B)** — "We recommend not using diuretics to prevent AKI."

> **3.4.2 (2C)** — "We suggest not using diuretics to treat AKI, except in the
> management of volume overload."

> **3.5.1 (1A)** — "We recommend not using low-dose dopamine to prevent or treat AKI."

## O QUE ELAS SUSTENTAM, E O QUE NÃO SUSTENTAM

**Sustentam:**

| afirmação do app | recomendação | grau |
|---|---|---|
| não usar dopamina em dose renal | 3.5.1 | **1A** |
| não usar diurético para **prevenir** IRA | 3.4.1 | **1B** |
| não usar diurético para **tratar** IRA | 3.4.2 | **2C** |

### ⚠️ SÃO TRÊS AFIRMAÇÕES, NÃO DUAS

O diurético não aparece duas vezes aqui — aparece **três**, e a terceira é positiva:

1. **não usar para PREVENIR** AKI — 3.4.1, **1B**
2. **não usar com o objetivo de TRATAR A LESÃO** ou recuperar função — 3.4.2, **2C**
3. **CONSIDERAR alça quando houver sobrecarga volêmica / congestão**, se
   clinicamente apropriado — a **exceção literal** da 3.4.2

⚠️ **A 2 e a 3 são as duas faces da MESMA recomendação e não se separam.** Um card
que diz só a 2 produz um falso absoluto: o médico lê "não use diurético na IRA" e
**não vê a sobrecarga** — que é justamente a indicação que sobra, e a que ele tem
na frente quando o paciente está congesto. É a regra de proximidade do app:
separar não omite, **muda a asserção**.

⚠️ **A exceção é estrutural.** *"except in the management of volume overload"* é o
que sustenta a arquitetura C do diurético de alça neste módulo.

⚠️ **A 3.5.1 é a única absoluta.** Dopamina em dose renal é NÃO USAR, sem exceção,
grau **1A** — e o app pode dizê-la assim, com a segurança que as outras duas não
têm.

**NÃO sustentam:**

- **Suspender nefrotóxico e revisar doses por função renal.** Não há aqui
  recomendação graduada geral para isso — a KDIGO gradua por DROGA (aminoglicosídeo,
  anfotericina, contraste), não uma regra única. No app isso é `pratica_aceita`,
  **sem grau**. Escrever "1A" ali seria empréstimo de força.
- **Creatinina basal desconhecida.** Está nas Tabelas 8 e 9, **não transcritas**.
  Enquanto não estiverem, nenhum nó do app diz que "a diretriz autoriza" nada a
  respeito. Isso é "não consegui olhar", não "não há".
