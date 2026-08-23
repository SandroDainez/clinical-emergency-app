# Proposta — o degrau que não é só número

**Não aplicada.** Mostrada antes, como foi feito com os eixos do catálogo.

---

## O buraco, e ele é o R-97 pelo avesso

O R-97 dizia: **buraco pede número** — o app queria número onde a fonte não
tinha, e alguém preenchia. Aqui é o contrário: **a fonte tem critério e o modelo
só sabe número.**

Dois casos medidos, os dois em cálcio:

| fonte | o que ela diz | o que o modelo atual sabe expressar |
|---|---|---|
| Hipocalcemia (Society for Endocrinology) | grave se **< 1,9 mmol/L** **e/ou** *"sintomas em qualquer valor abaixo da referência"* | só o `< 1,9` |
| Hipercalcemia (Society for Endocrinology) | **< 3,0** geralmente não urgente · **3,0–3,5** *"trata conforme sintomas e contexto"* · **> 3,5** urgente | só um corte |

⚠️ A faixa intermediária da hipercalcemia **também não é faixa pura**: ela é
faixa **+** critério clínico. O mesmo tipo novo resolve os dois casos.

**E o custo de não ter o tipo:** um modelo que só aceita número **obriga a
inventar número**. É como se chega a "grave é abaixo de X" quando a fonte nunca
escreveu X.

---

## A forma proposta

O tipo `CorteDeGravidade` de hoje é fechado em número (`abaixoDe`, `aPartirDe`,
`acimaDe`, `ecgAlterado`, `restante`). A proposta acrescenta **critério clínico**
e **combinação**, sem tirar nada:

```ts
export type CriterioDeGravidade =
  // o que já existe, renomeado para caber ao lado dos outros
  | { tipo: "faixa"; de?: number; ate?: number; unidade: string }
  // ⚠️ O NOVO: critério que a fonte escreveu SEM número
  | { tipo: "clinico"; texto: string; procedencia: ProcedenciaDeGravidade }
  // ⚠️ E o que a hipercalcemia exige: faixa E/OU clínico, com a ligação explícita
  | { tipo: "combinado"; faixa: CriterioDeGravidade; ligacao: "e" | "ou"; clinico: CriterioDeGravidade };
```

Como os dois casos ficariam:

```ts
hypocalcemia: [
  { rotulo: "Grave", cortes: [{
      tipo: "combinado",
      faixa:   { tipo: "faixa", ate: 1.9, unidade: "mmol/L" },
      ligacao: "ou",                         // ⚠️ OU, não E — a fonte diz "e/ou"
      clinico: { tipo: "clinico", texto: "sintomas em qualquer valor abaixo da referência", procedencia: P_CA },
  }] },
  …
]

hypercalcemia: [
  { rotulo: "Correção urgente",     cortes: [{ tipo: "faixa", de: 3.5, unidade: "mmol/L" }] },
  { rotulo: "Conforme sintomas e contexto", cortes: [{
      tipo: "combinado",
      faixa:   { tipo: "faixa", de: 3.0, ate: 3.5, unidade: "mmol/L" },
      ligacao: "e",
      clinico: { tipo: "clinico", texto: "trata conforme sintomas e contexto", procedencia: P_CA },
  }] },
  { rotulo: "Geralmente não exige correção urgente", cortes: [{ tipo: "faixa", ate: 3.0, unidade: "mmol/L" }] },
]
```

---

## A trava que nasce junto

> **Degrau com critério clínico NÃO pode ser renderizado só pelo número.**

Concretamente, três conferências:

1. **Todo `clinico` chega à tela como texto.** Se o degrau tem critério clínico e
   a tela mostra apenas o rótulo e o corte, a trava reprova — porque foi assim
   que a hipocalcemia sintomática deixou de existir na tela.
2. **`combinado` declara a ligação.** `e` × `ou` mudam a conduta e não podem ser
   inferidos: "e/ou" da fonte vira `ou` **por escrito**, não por interpretação de
   quem lê o código.
3. **Critério clínico sem procedência reprova**, como já vale para os numéricos.

**Mutação prevista:** apagar o `clinico` do degrau de hipocalcemia grave →
a tela volta a classificar só por `< 1,9` e a trava reprova.

---

## ⚠️ O QUE ESTA PROPOSTA NÃO DECIDE

- **Não escolhe os cortes**, nem os do iônico. Os `1,9` / `3,0` / `3,5` acima
  estão **em mmol/L, como a fonte escreveu**, e o app usa mg/dL. **Nenhuma
  conversão foi feita** — a proposta é sobre a FORMA, e a unidade é do autor.
- **Não mexe no magnésio.**
- **Não altera nenhum degrau existente** enquanto não houver o "pode aplicar".

---

## Uma consequência que vale dizer antes

Se o tipo entrar, ele **serve o app inteiro**, não só os eletrólitos. Toda vez
que uma fonte escreveu "conforme o quadro clínico" e o app precisou de um número
para caber no modelo, foi este buraco. Vale procurar os outros depois — como
medição, não como correção.
