# Proposta — o tempo de instalação como dado

**Não implementada.** Mostrada antes, como os eixos, o peso e o critério clínico.

---

## Por que ela deixou de ser desejável e passou a ser necessária

A **D-93** nasceu na hipercalcemia: o autor citou *"velocidade de elevação"* como
modulador de urgência, e eu registrei a pendência **sem inventar campo** — o app
não conhece o valor anterior nem o intervalo entre as medidas.

Ali era desejável. **No sódio, é necessária.**

A **Spasovski 2014** — a referência-base que o autor acabou de nomear —
distingue **hiponatremia AGUDA (< 48 h) de CRÔNICA**, e a distinção **muda a
conduta e o risco**: correção rápida na crônica causa desmielinização osmótica.

> **Sem saber se é aguda ou crônica, a conduta correta não pode ser dada.**

⚠️ E é por isso que esta proposta vem **antes** de qualquer número de velocidade
de correção. Escrever mEq/L por 24 h sem o eixo do tempo seria dar uma conduta
cujo risco depende de um dado que a tela não tem.

---

## O que a Spasovski pede, e o que a estrutura já resolve

| o que a diretriz usa | a estrutura de hoje |
|---|---|
| classificação por **sintoma** (vômitos, sonolência profunda, cefaleia, convulsão, coma) — trata o grave **independentemente do valor** | ✅ **já existe**: é o `combinado` com `papel: "define"`, construído para o cálcio. Serve sem mudança |
| classificação por **velocidade de instalação** (aguda < 48 h × crônica) | ❌ **não existe** |

---

## A forma proposta

O tempo **não é um número que o app calcula** — é um estado que o médico
informa, e que muitas vezes ele **não sabe**. A forma tem que comportar as três
respostas, porque "não sei" é a mais comum à beira do leito.

```ts
export type TempoDeInstalacao =
  | { tipo: "aguda"; documentadaAte: number; unidade: "h" }   // valor anterior conhecido
  | { tipo: "cronica" }
  | { tipo: "indeterminada" };                                 // ⚠️ o caso mais comum
```

E o degrau ganha o eixo, do mesmo jeito que ganhou o critério clínico:

```ts
| { tipo: "tempoDeInstalacao"; exige: TempoDeInstalacao["tipo"];
    procedencia: ProcedenciaDeGravidade }
```

### ⚠️ E a regra que vem junto, que é a parte que protege o paciente

> **`indeterminada` é tratada como CRÔNICA para efeito de risco de correção.**

Não porque seja crônica — mas porque **errar para o lado da correção lenta é
recuperável e errar para o lado rápido não é**. É o oposto da conclusão por queda
(R-111): ali, o caminho sem resposta caía no grau mais brando; aqui, o caminho
sem resposta cai no **mais cauteloso**.

⚠️ **Esta regra é clínica e não é minha.** Ela está escrita aqui como proposta
porque a estrutura precisa dela para existir — e precisa do "pode aplicar" do
autor antes de valer.

---

## A pergunta que o app passa a fazer

> **Há quanto tempo esse sódio está assim?**
> · Sei que começou há menos de 48 h *(há valor anterior)*
> · É crônico / vem de antes
> · **Não sei dizer**

Com o "não sei" **abrindo onde procurar**, no mesmo padrão do cálcio: exame
anterior no prontuário, internação prévia, sintomas que já vinham.

---

## A trava que nasce junto

1. **Nenhuma conduta de velocidade de correção é exibida sem o tempo informado.**
   É a aplicação do R-111 ao caso em que a ausência tem risco de dano.
2. **`indeterminada` nunca cai na conduta da aguda.** Mutação prevista: fazer o
   `indeterminada` seguir o ramo agudo → reprova.
3. **O eixo declara procedência**, como todos os outros.

---

## ⚠️ O QUE ESTA PROPOSTA NÃO DECIDE

- **Nenhum número de velocidade de correção** (mEq/L por 24 h, por hora, limites
  de resgate). Isso é conduta com risco de dano quando errada, vem depois, com o
  autor, **e com verbatim**.
- **Nenhum corte de sódio** foi alterado.
- **A lista de sintomas do sódio** — a Spasovski nomeia os dela, e transcrevê-la
  é o passo seguinte, não este.
