# Exceções declaradas — o custo aceito dos instrumentos

⚠️ **Isto NÃO é lista de dívida.** Dívida é o que se pretende fechar; isto é o
preço que se decidiu pagar para não deformar conteúdo clínico (R-116).

> **Quando o instrumento e o texto clínico brigam, o texto ganha e o falso
> positivo fica registrado.**

---

## 1 · "negação lida como afirmação" — `medir:queda`

**Instrumento:** `scripts/mede-conclusao-por-queda.cjs`
**Aceita em:** 2026-08-23

O instrumento procura o grau mais brando no ramo terminal de uma cadeia. O texto
abaixo, em `electrolyte-calculator-screen.tsx`, contém a palavra *"estável"* —
**dentro de uma negação**:

> *"O cálcio não alcançou o corte de gravidade. **Isso não é o mesmo que quadro
> estável**: o contexto, a causa e os sintomas definem o restante da correção."*

A frase diz **exatamente o contrário** do que o regex conclui. Ela existe porque
o ramo antigo afirmava estabilidade sem verificar (R-111), e é a correção.

**Por que não se resolve:**
- **Ensinar negação ao regex é frágil** — a próxima frase escaparia de outro
  jeito, e um instrumento que quase entende linguagem dá falso verde com
  confiança.
- **Reescrever a frase para escapar do regex piora o texto clínico**, e é
  exatamente o que o R-116 proíbe.

**O custo:** `medir:queda` reporta 1 achado permanente. Quem ler a medição precisa
saber que **o piso dela é 1, não 0** — e é por isso que esta linha existe.
