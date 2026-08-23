# Proposta — classificação e conduta são camadas diferentes

**Não aplicada.** A faixa do meio da hipercalcemia entrou **classificando**; o
texto de conduta do autor está aqui, pronto, esperando a forma.

---

## A distinção, e por que ela não pode ser achatada

O `combinado` existe para quando o critério clínico **muda a classificação** —
como na hipocalcemia, onde o sintoma torna grave um valor que o número não
tornaria.

**A faixa 3,0–3,5 mmol/L é outra coisa:** o número classifica ("significativa") e
o julgamento clínico modula a **conduta**. A classificação não muda com sintomas;
o que muda é a urgência do tratamento.

> **A faixa classifica. O texto conduz.**

⚠️ Se as duas forem para o mesmo campo, em três distúrbios ninguém sabe mais o
que o degrau significa — e foi por isso que não forcei `combinado` aqui.

---

## O que a estrutura tem hoje, e o que falta

`DegrauDeGravidade` tem `rotulo` (a classificação) e `sinais` (o que se vê no
paciente). **Não tem onde pôr conduta** — e enfiar a conduta em `sinais` seria
exatamente o achatamento acima.

**Proposta:** um campo próprio, com procedência própria.

```ts
export type DegrauDeGravidade = {
  rotulo: string;                    // classifica
  sinais: string;                    // o que se vê
  conduta?: {                        // ⚠️ NOVO — modula, não classifica
    texto: string;
    procedencia: ProcedenciaDeGravidade;
  };
  cortes: CorteDeGravidade[];
  procedencia: ProcedenciaDeGravidade;
};
```

E a faixa do meio da hipercalcemia ficaria assim, com **o texto literal do
autor**:

```ts
{
  rotulo: "Significativa",
  sinais: "Náusea, constipação, poliúria e fadiga predominam.",
  conduta: {
    texto:
      "Hipercalcemia significativa; necessidade e urgência do tratamento dependem de sintomas, " +
      "velocidade de instalação, causa e contexto clínico; em geral requer avaliação e tratamento, " +
      "mas não constitui emergência automaticamente pelo número isolado.",
    procedencia: P_CA,
  },
  cortes: [{ tipo: "faixa", de: 3.0, ate: 3.5, unidade: "mmol/L" }],
  procedencia: P_CA,
}
```

---

## A trava que nasce junto

1. **`conduta` não pode ser lida como classificação.** A trava confere que
   `rotulo` e `conduta.texto` são campos distintos e que a tela os renderiza em
   lugares distintos — classificação onde está a classificação, conduta onde está
   a conduta.
2. **`conduta` exige procedência própria**, como todo o resto.
3. **Mutação prevista:** mover o texto da conduta para dentro de `sinais` →
   reprova, mesmo mostrando as mesmas palavras na tela. É o achatamento, não as
   palavras.

---

## ⚠️ O QUE ESTA PROPOSTA NÃO DECIDE

- **Não muda nenhum corte.** A faixa 3,0–3,5 já está aplicada e classificando.
- **Não escreve conduta para nenhum outro degrau.** O único texto de conduta que
  existe é o que o autor ditou, e ele cobre uma faixa só.
- Se o campo entrar, **os outros vinte e um degraus continuam sem conduta** — e
  isso é honesto: nenhum deles tem texto de conduta com fonte.
