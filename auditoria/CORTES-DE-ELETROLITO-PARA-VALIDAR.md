# Os cortes de eletrólito, um por linha — para validação individual

**Gerado do dado** (`lib/eletrolitos/gravidade.ts`) em 2026-08-23.
⚠️ **Nenhum corte foi alterado.** Esta é a fotografia do que a tela mostra hoje.

**Regra editorial que vale aqui (R-110, decisão do autor):** quando existe cutoff
formal, cita-se a sociedade/diretriz; quando não existe, classifica-se como
prática aceita ou referência de revisão — **e não se inventa graduação**.

---

## A tabela

| distúrbio | valor | unidade no código | texto na tela | o que a tela mostra | fonte hoje |
|---|---|---|---|---|---|
| hiponatremia | 120 | mEq/L | `< 120 mEq/L` | **Grave** | nenhuma |
| hiponatremia | — | — | degrau de base | Leve a moderada | nenhuma |
| hipernatremia | 160 | mEq/L | `≥ 160 mEq/L` | **Grave** | nenhuma |
| hipernatremia | — | — | degrau de base | Leve a moderada | nenhuma |
| hipocalemia | 2,5 | mEq/L | `< 2,5 mEq/L` | **Grave** | nenhuma |
| hipocalemia | — | — | degrau de base | Leve a moderada | nenhuma |
| hipercalemia | 6,5 | mEq/L | `≥ 6,5 mEq/L` | **Emergência** | `lib/hipercalemia.ts` (K_GRAVE) |
| hipercalemia | — | — | ECG alterado, **sem número** | **Emergência** | idem |
| hipercalemia | — | — | degrau de base | Moderada | idem |
| hipocalcemia | 7 | **mg/dL** | `< 7 mg/dL` | **Grave** | nenhuma |
| hipocalcemia | — | — | degrau de base | Leve a moderada | nenhuma |
| hipercalcemia | 14 | **mg/dL** | `≥ 14 mg/dL` | **Grave** | nenhuma |
| hipercalcemia | — | — | degrau de base | Leve a moderada | nenhuma |
| hipomagnesemia | 1,2 | mg/dL | `< 1,2 mg/dL` | **Grave** | nenhuma |
| hipomagnesemia | — | — | degrau de base | Leve a moderada | nenhuma |
| hipermagnesemia | 4,9 | mg/dL | `≥ 4,9 mg/dL` | **Grave** | nenhuma |
| hipermagnesemia | — | — | degrau de base | Moderada | nenhuma |
| hipofosfatemia | 1 | **mg/dL** | `< 1 mg/dL` | **Grave** | nenhuma |
| hipofosfatemia | — | — | degrau de base | Leve a moderada | nenhuma |
| hiperfosfatemia | — | — | degrau único | Sem escala de apresentação | autor, `definicao` |
| hipocloremia | — | — | degrau único | Sem escala de apresentação | autor, `definicao` |
| hipercloremia | — | — | degrau único | Sem escala de apresentação | autor, `definicao` |

**12 cortes numéricos · 21 degraus · 11 sem fonte declarada.**

---

## ⚠️ COLUNA EXTRA 1 — a unidade da fonte × a unidade do app

As referências que o autor nomeou estão em **mmol/L**. O app usa **mg/dL** em
cálcio, magnésio e fósforo. **Nada foi convertido nesta rodada** — as duas
unidades ficam lado a lado, para conferência.

| o que a fonte diz | unidade da fonte | o corte do app hoje | unidade do app |
|---|---|---|---|
| **Hipocalcemia grave** (Society for Endocrinology): < 1,9 · e/ou sintomas em qualquer valor abaixo da referência | mmol/L | `< 7` | mg/dL |
| **Hipercalcemia** (Society for Endocrinology): < 3,0 geralmente não urgente · 3,0–3,5 conforme sintomas e contexto · > 3,5 correção urgente | mmol/L | `≥ 14` (corte **único**) | mg/dL |
| **Hipofosfatemia grave** (consenso amplo, **não rotular como diretriz internacional**): < 0,32 · ⚠️ sem consenso universal para todas as faixas | mmol/L | `< 1` | mg/dL |
| **Magnésio** | — | `< 1,2` · `≥ 4,9` | mg/dL | ⚠️ **NÃO FIXAR NADA** — o autor quer conferir número por número |

**Equivalências de referência, só para leitura** (não aplicadas ao código):
3,0 mmol/L ≈ 12 mg/dL · 3,5 ≈ 14 · 1,9 ≈ 7,6 · fósforo 0,32 mmol/L = 1 mg/dL.

⚠️ **Duas observações que a tabela deixa ver, e que são do autor decidir:**

1. **A hipercalcemia da fonte tem TRÊS faixas; o app tem UMA.** O `≥ 14` cobre o
   *"> 3,5 → correção urgente"*, e o app não tem a faixa intermediária
   (3,0–3,5 → conforme sintomas e contexto).
2. **A hipocalcemia da fonte tem um segundo critério que o app não tem:**
   *"sintomas em qualquer valor abaixo da referência"* — ou seja, um critério
   **sem número**, que a estrutura atual de cortes numéricos não expressa.

---

## ⚠️ COLUNA EXTRA 2 — QUAL cálcio a tela pede

**O campo pede literalmente: `Cálcio`, em mg/dL.** Sem qualificar se é total,
iônico ou ajustado.

E o achado que importa, medido no código:

| onde | qual cálcio é usado |
|---|---|
| **classificação de gravidade** (`< 7 mg/dL` → "Grave") | **o valor bruto digitado** — `parsedCurrent`, sem ajuste |
| **cálculo da dose** (2 g × 1 g de gluconato) | **o ajustado pela albumina**, `current + 0,8 × (4 − albumina)`, quando a albumina é informada |

**As diretrizes britânicas usam cálcio AJUSTADO pela albumina.** Hoje o app
classifica gravidade pelo bruto e dosa pelo ajustado — dois cálcios diferentes na
mesma tela, e o corte da fonte vale para um só deles.

⚠️ **Não decidido.** Alvo: veredito do autor sobre qual cálcio a tela pede, qual
cálcio classifica, e se o campo deve dizer qual é.
