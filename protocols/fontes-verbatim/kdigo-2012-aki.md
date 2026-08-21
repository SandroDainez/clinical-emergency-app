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

## PROCEDÊNCIA DESTE ARQUIVO — leia antes de usar

- **Transcrito pelo autor** (Dr. Sandro Dainez) a partir do PDF público acima, na
  mensagem de 2026-08-21, com número e grau.
- **⚠️ NÃO CONFERIDO POR MIM CONTRA O PRIMÁRIO.** Tentei buscar o PDF na sessão e o
  servidor devolveu **HTTP 403**. Registro isso porque é a diferença entre "conferi"
  e "recebi" — e é a mesma marca que já usamos na Parte 9 do AHA 2025.
- **O que falta:** as **Tabelas 8 e 9** (creatinina basal desconhecida) continuam
  não transcritas. É o que mantém o nó `sem_base` sem atribuição à diretriz.

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

⚠️ **Prevenir e tratar são duas afirmações, com graus diferentes.** O app dizia
uma linha só. Agora diz as duas, cada uma com o seu número e o seu grau — a de
prevenir é a mais forte, e não era a que estava na tela.

⚠️ **A exceção da 3.4.2 é estrutural, não uma ressalva.** *"except in the management
of volume overload"* é exatamente o que sustenta a arquitetura C do diurético de
alça neste módulo: a sobrecarga é a indicação que RESTA depois que "tratar a IRA"
sai de cena.

**NÃO sustentam:**

- **Suspender nefrotóxico e revisar doses por função renal.** Não há aqui
  recomendação graduada geral para isso — a KDIGO gradua por DROGA (aminoglicosídeo,
  anfotericina, contraste), não uma regra única. No app isso é `pratica_aceita`,
  **sem grau**. Escrever "1A" ali seria empréstimo de força.
- **Creatinina basal desconhecida.** Está nas Tabelas 8 e 9, **não transcritas**.
  Enquanto não estiverem, nenhum nó do app diz que "a diretriz autoriza" nada a
  respeito. Isso é "não consegui olhar", não "não há".
