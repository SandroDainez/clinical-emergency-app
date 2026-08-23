# Proposta — referência numérica que NÃO classifica

**Não implementada.** É o mesmo caso do `conduta`, que já foi resolvido uma vez.

---

## O conteúdo que está esperando por ela

O autor deu a progressão de toxicidade do magnésio (2026-08-23), **com todas as
letras sobre o que ela não é**:

| manifestação | faixa aproximada |
|---|---|
| perda importante de reflexos | ~8–10 mEq/L |
| depressão / paralisia respiratória | ~10–15 mEq/L |
| risco de parada cardíaca | ~25–30 mEq/L |

> *"Não são limites absolutos nem recomendação graduada; a decisão considera
> sintomas, função renal e tendência da concentração."*

⚠️ **Estes números NÃO estão no app**, e é por isso que esta proposta existe: a
estrutura de hoje só sabe guardar número que **classifica**. Digitá-los como
degrau os transformaria em corte — e `test:gravidade-eletrolitica` já reprova
isso (mutação **M91**, provada).

---

## Por que `conduta` não serve

`conduta` guarda **texto** que modula urgência. Aqui há **números com faixas**, e
número dentro de prosa é o R-114 — a segunda cópia mais teimosa, que envelhece ao
lado do dado sem ninguém ver.

E a diferença de espécie importa:

| campo | o que faz |
|---|---|
| `cortes` | **classifica** — decide o degrau |
| `conduta` | **modula** — muda a urgência sem mudar a classificação |
| **`referencias`** *(proposto)* | **orienta** — números que ajudam a ler a tendência e **não decidem nada** |

---

## A forma proposta

```ts
export type ReferenciaQueNaoClassifica = {
  /** O que se observa nessa faixa. */
  manifestacao: string;
  /** ⚠️ Faixa APROXIMADA, e o campo diz isso — não é `faixa`, que classifica. */
  aproximadamente: { de: number; ate: number; unidade: UnidadeDeConcentracao };
  procedencia: ProcedenciaDeGravidade;
};

export type DegrauDeGravidade = {
  …
  /** ⚠️ ORIENTAM, NÃO DECIDEM. Nenhuma alimenta `cortes`. */
  referencias?: ReferenciaQueNaoClassifica[];
};
```

E o magnésio ficaria:

```ts
referencias: [
  { manifestacao: "Perda importante de reflexos", aproximadamente: { de: 8, ate: 10, unidade: "mEq/L" }, procedencia: P_MG },
  { manifestacao: "Depressão ou paralisia respiratória", aproximadamente: { de: 10, ate: 15, unidade: "mEq/L" }, procedencia: P_MG },
  { manifestacao: "Risco de parada cardíaca", aproximadamente: { de: 25, ate: 30, unidade: "mEq/L" }, procedencia: P_MG },
]
```

---

## A trava que nasce junto

1. **Nenhum valor de `referencias` pode aparecer em `cortes`** — do mesmo
   distúrbio ou de qualquer outro. ⚠️ **Esta metade já existe e já foi provada**
   (M91): a lista de números proibidos como corte está em
   `valida-gravidade-eletrolitica`, hoje escrita à mão. Com o campo, ela passa a
   ser **derivada** — e deixa de ter uma segunda cópia.
2. **A tela renderiza `referencias` em bloco separado da classificação**, com a
   palavra "aproximadamente" visível. Mutação: renderizar junto do degrau →
   reprova.
3. **Cada referência declara procedência**, como todo o resto.

---

## ⚠️ O QUE ESTA PROPOSTA NÃO DECIDE

- **Não muda nenhum corte.** O `≥ 4,9` já saiu por decisão do autor, e nada o
  substitui — a hipermagnesemia deixou de ser graduada por número **de
  propósito**.
- **Não escreve os números no app.** Eles entram quando o campo existir.
- **Não estende a ideia a outros distúrbios** sem pedido.
