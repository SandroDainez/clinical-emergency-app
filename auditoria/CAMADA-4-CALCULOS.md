# Camada 4 — Auditoria de doses, diluições e cálculos

> Gerado por `node scripts/auditoria-calculos.cjs`. Nenhum código alterado.
> Verifica COMPORTAMENTO das fórmulas com valores-limite, não se a fórmula é a
> recomendada pela diretriz — isso é a Camada 2.

- Fórmulas exercitadas: **7**
- Escores exercitados: **8**
- Erros: **42** · Avisos: **0**

## Achados por tipo

| tipo | gravidade | ocorrências | ferramentas |
|---|---|---:|---:|
| valor-negativo | erro | 42 | 2 |

### valor-negativo (42)

| ferramenta | detalhe |
|---|---|
| `clearance-creatinina` | campo "idade" = "400" produziu metrics[1].value = "-253 mL/min" |
| `clearance-creatinina` | campo "idade" = "9999999" produziu metrics[1].value = "-9722085 mL/min" |
| `anion-gap` | campo "na" = "0" produziu metrics[0].value = "-2 mEq/L" |
| `anion-gap` | campo "na" = "-1" produziu metrics[0].value = "-3 mEq/L" |
| `anion-gap` | campo "na" = "-0,5" produziu metrics[0].value = "-2,5 mEq/L" |
| `anion-gap` | campo "na" = "0,0001" produziu metrics[0].value = "-2 mEq/L" |
| `anion-gap` | campo "na" = "1" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "cl" = "72,5" produziu metrics[0].value = "-72,5 mEq/L" |
| `anion-gap` | campo "cl" = "72,5" produziu metrics[1].value = "-65 mEq/L" |
| `anion-gap` | campo "cl" = "72.5" produziu metrics[0].value = "-72,5 mEq/L" |
| `anion-gap` | campo "cl" = "72.5" produziu metrics[1].value = "-65 mEq/L" |
| `anion-gap` | campo "cl" = "1" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "cl" = "400" produziu metrics[0].value = "-400 mEq/L" |
| `anion-gap` | campo "cl" = "400" produziu metrics[1].value = "-392,5 mEq/L" |
| `anion-gap` | campo "cl" = "9999999" produziu metrics[0].value = "-9999999 mEq/L" |
| `anion-gap` | campo "cl" = "9999999" produziu metrics[1].value = "-9999991,5 mEq/L" |
| `anion-gap` | campo "hco3" = "72,5" produziu metrics[0].value = "-72,5 mEq/L" |
| `anion-gap` | campo "hco3" = "72,5" produziu metrics[1].value = "-65 mEq/L" |
| `anion-gap` | campo "hco3" = "72.5" produziu metrics[0].value = "-72,5 mEq/L" |
| `anion-gap` | campo "hco3" = "72.5" produziu metrics[1].value = "-65 mEq/L" |
| `anion-gap` | campo "hco3" = "1" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "hco3" = "400" produziu metrics[0].value = "-400 mEq/L" |
| `anion-gap` | campo "hco3" = "400" produziu metrics[1].value = "-392,5 mEq/L" |
| `anion-gap` | campo "hco3" = "9999999" produziu metrics[0].value = "-9999999 mEq/L" |
| `anion-gap` | campo "hco3" = "9999999" produziu metrics[1].value = "-9999991,5 mEq/L" |
| `anion-gap` | campo "alb" = "" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = " " produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "0" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "-1" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "-0,5" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "abc" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "1e400" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "0,0001" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "72,5" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "72,5" produziu metrics[1].value = "-172,2 mEq/L" |
| `anion-gap` | campo "alb" = "72.5" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "72.5" produziu metrics[1].value = "-172,2 mEq/L" |
| `anion-gap` | campo "alb" = "1" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "400" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "400" produziu metrics[1].value = "-991 mEq/L" |
| `anion-gap` | campo "alb" = "9999999" produziu metrics[0].value = "-1 mEq/L" |
| `anion-gap` | campo "alb" = "9999999" produziu metrics[1].value = "-24999988,5 mEq/L" |

