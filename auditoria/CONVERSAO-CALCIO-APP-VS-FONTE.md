# O corte do app × o corte da fonte — cálcio

**Medição de 2026-08-23. ⚠️ NENHUM NÚMERO FOI ALTERADO.**

**Fator usado, declarado:** 1 mmol/L de cálcio = **4,008 mg/dL** (peso atômico
40,08 ÷ 10). ⚠️ O fator vale para a MASSA; a valência 2+ não entra aqui — ela
entra quando se fala em mEq/L, que não é o caso destes cortes.

---

## Hipocalcemia — **os dois cortes não são o mesmo, e a diferença tem direção**

| | valor | equivalente |
|---|---|---|
| **fonte** (Society for Endocrinology, mandada manter pelo autor) | **< 1,9 mmol/L** | **≈ 7,62 mg/dL** |
| **app, hoje** | **< 7 mg/dL** | **≈ 1,75 mmol/L** |

⚠️ **O corte do app é MAIS BAIXO.** Ele exige um cálcio **mais grave** para
chamar de grave. A consequência é a faixa entre os dois:

> **7,00 – 7,62 mg/dL** (≈ **1,75 – 1,90 mmol/L**)
> O app classifica como **"Leve a moderada"** · a fonte classifica como **GRAVE**.

**É uma faixa de 0,62 mg/dL de largura**, inteiramente contida na zona em que a
hipocalcemia já costuma dar sintoma. E ela não é rara: é justamente a região onde
o cálcio ajustado de um paciente de UTI costuma cair.

⚠️ **A mitigação existe desde hoje e é real, mas é parcial:** o **ramo
sintomático** (§2) classifica como grave qualquer paciente com manifestação
clínica, em **qualquer valor**. Então o paciente de 7,3 mg/dL **com** parestesia
ou QT longo já é pego. Quem escapa é o de 7,3 mg/dL **assintomático** — que a
fonte ainda chama de grave e o app chama de leve a moderada.

---

## Hipercalcemia — **o corte de cima quase coincide; falta a faixa do meio**

| a fonte diz | em mmol/L | ≈ em mg/dL | o app tem |
|---|---|---|---|
| geralmente não exige correção urgente | < 3,0 | < 12,02 | — |
| trata conforme sintomas e contexto | 3,0 – 3,5 | 12,02 – 14,03 | **não existe** |
| correção urgente | > 3,5 | > 14,03 | `≥ 14` → **Grave** |

- **O corte de cima praticamente coincide:** 14 mg/dL ≈ **3,49 mmol/L**, contra
  3,5 da fonte. A diferença é de **0,01 mmol/L** — dentro do arredondamento.
- **A faixa do meio não existe no app.** Entre 12,02 e 14,03 mg/dL o app diz
  "Leve a moderada" e a fonte diz *"trata conforme sintomas e contexto"* — que,
  note, **não é faixa pura**: é faixa **+** critério clínico, e por isso depende
  do texto de conduta que só o autor pode escrever (pergunta 7).

---

## O que este arquivo prova sobre o método

**O corte foi adotado da fonte, e a conversão não foi conferida.** É exatamente o
defeito que a auditoria existe para achar — e a prova de que **conversão de
unidade tem que morar no dado, declarada**, e não na cabeça de quem escreveu a
string.

⚠️ Enquanto não houver decisão do autor, **os cortes ficam como estão**. Mudar
`< 7` para `< 7,62` seria escolher por ele — e trocar um número clínico com base
numa conta minha é o R-5.
