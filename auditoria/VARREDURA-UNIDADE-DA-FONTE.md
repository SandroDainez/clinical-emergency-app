# Quais cortes vieram de fonte em outra unidade — os doze distúrbios

**Medição de 2026-08-23. ⚠️ NADA FOI CONVERTIDO fora do cálcio**, que era a
decisão já tomada.

---

## O quadro

| distúrbio | corte hoje | unidade guardada | fonte nomeada | risco de divergência |
|---|---|---|---|---|
| hipocalcemia | **1,9** | **mmol/L** ✅ | Society for Endocrinology | **resolvido** (era `< 7 mg/dL`, D-90) |
| hipercalcemia | **3,0–3,5 · > 3,5** | **mmol/L** ✅ | Society for Endocrinology | **resolvido** (era `≥ 14 mg/dL`, D-91) |
| hipofosfatemia | `< 1` | mg/dL (da tela) | consenso amplo, **nomeado em mmol/L** | ⚠️ **candidato — ver abaixo** |
| hiponatremia | `< 120` | mEq/L (da tela) | alvo: ESICM/ESE/ERA-EDTA 2014 | ⚠️ **a conferir quando o verbatim entrar** |
| hipernatremia | `≥ 160` | mEq/L | nenhuma | sem fonte: não há de onde divergir |
| hipocalemia | `< 2,5` | mEq/L | nenhuma | idem |
| hipercalemia | `≥ 6,5` | mEq/L | `lib/hipercalemia.ts` (K_GRAVE) | a procedência mora lá |
| hipomagnesemia | `< 1,2` | mg/dL | nenhuma | ⚠️ **intocados por decisão do autor** |
| hipermagnesemia | `≥ 4,9` | mg/dL | nenhuma | idem |
| hiperfosfatemia · hipocloremia · hipercloremia | — | — | autor, `definicao` | sem corte numérico |

---

## ⚠️ O ÚNICO CANDIDATO REAL: hipofosfatemia

O autor nomeou o consenso assim: **grave < 0,32 mmol/L (< 1 mg/dL)** — ou seja,
**a fonte foi citada nas duas unidades**, e o app guarda a segunda.

**Confere?** Fósforo tem peso atômico 30,97, então 1 mmol/L = **3,097 mg/dL**:

> **0,32 mmol/L × 3,097 = 0,99 mg/dL**

**Bate.** A conversão está certa dentro do arredondamento — ao contrário do
cálcio, onde `1,9 → 7` errava por 0,62 mg/dL. **Não há divergência aqui.**

⚠️ **Mas a forma continua sendo a que produziu a D-90:** o número está guardado
já convertido, e a conta está fora do repositório. Converter para
`{ valor: 0.32, unidade: "mmol/L" }` **não mudaria uma classificação sequer** — e
exigiria declarar o fator do fósforo em `lib/eletrolitos/unidades.ts`.

**Não convertido nesta rodada**, porque a instrução foi reportar antes de
converter qualquer outro. **É a decisão do autor**, e a recomendação é converter:
o benefício não é o número de hoje, é a conta ficar dentro do repositório para o
dia em que alguém reler a fonte.

## ⚠️ E o que ainda não dá para conferir: hiponatremia

O `< 120` tem alvo nomeado (**ESICM/ESE/ERA-EDTA 2014**) e **verbatim ainda não
transcrito**. Sódio é medido em mmol/L e mEq/L com **equivalência 1:1** (valência
1+), então **não há conversão a errar** — o risco aqui não é de unidade, é de o
número não ser o que a diretriz escreve. Fica para quando o verbatim entrar.

---

## O que a varredura mostra sobre o método

Dos doze, **apenas dois tinham fonte em outra unidade** — e os dois eram o
cálcio, os dois divergiam ou faltavam, e **nenhum dos dois havia sido conferido**.
Os outros dez estão protegidos por um motivo desconfortável: **não têm fonte
nenhuma**. Não há conversão errada onde não houve conversão.
