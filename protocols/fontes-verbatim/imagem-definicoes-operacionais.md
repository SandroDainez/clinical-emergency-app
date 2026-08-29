# Imagem no AVC — definições operacionais que a fonte-mãe não entrega

**Aberto em 2026-08-29**, por decisão do autor, depois do relato de uso da
Superfície C: *"o usuário ⛔ não sabe classificar isso, tem que ter itens
clicáveis para o app classificar"*.

> ### ⚠️⚠️ ESTE ARQUIVO É UM SLOT DECLARADO, E ⛔ NÃO CONTEÚDO
>
> ⛔ **⛔ Não há verbatim aqui ainda.** Abrir o slot registra **o que falta, por que
> falta e o que fica bloqueado até chegar** — ⛔ não substitui a transcrição.
>
> ⚠️ Enquanto estes slots estiverem `aberto`, ⛔ **nada** do que eles sustentariam
> pode aparecer na tela. É §0.5 ao pé da letra: fonte declarada ⛔ não é fonte
> transcrita.

---

## F-28 · ASPECTS — os 10 territórios e a lógica de pontuação

**Estado:** 🔴 **ABERTO** — referência aprovada, texto ⛔ **não transcrito**.

**Fonte-base aprovada pelo autor em 2026-08-29:**

> Barber PA, Demchuk AM, Zhang J, Buchan AM. **Validity and reliability of a
> quantitative computed tomography score in predicting outcome of hyperacute
> stroke before thrombolytic therapy.** *Lancet.* 2000;355(9216):1670–1674.

⚠️ **Fonte brasileira de apoio fica em aberto** — decisão do autor: *"se depois
quisermos uma fonte brasileira de apoio, ótimo, mas ⛔ não precisamos travar a
implementação esperando isso."*

### Por que este slot existe

A fonte-mãe do módulo (AHA/ASA 2026) **usa** o ASPECTS como critério — F-08 tem
faixas inteiras construídas sobre ele (`ASPECTS 3 to 10`, `≥6`, `3 to 5`,
`0 to 2`) — e ⛔ **não o define**. A **Figure 2**, que a rec. 1 de §3.2
referencia, ⛔ **não foi transcrita**: é figura, e F-16 remete a carga isquêmica
a F-08.

⚠️ **Resultado:** o app pede um número que ⛔ não sabe explicar. Foi o defeito que
o autor relatou usando a tela.

### O que este slot precisa conter, antes de qualquer implementação

| # | o que falta | por quê |
|---|---|---|
| 1 | os **10 territórios**, nomeados como o artigo os nomeia | ⛔ escrevê-los de memória é **E-31** no ponto mais caro: território errado ⛔ não parece errado |
| 2 | a **regra de pontuação** — de onde se parte e o que desconta ponto | é o que transforma marcação em escore |
| 3 | o **corte de nível** dos territórios (quais cortes axiais) | o mesmo território muda de leitura conforme o corte |
| 4 | o que o escore **⛔ não** significa | para a leitura derivada ⛔ não virar veredito |

### O que fica BLOQUEADO até a transcrição

- ⛔ `aspects_calculado` — a escala item a item;
- ⛔ o **esquema vetorial** dos territórios (rota (a) aprovada pelo autor): ⛔ não
  se desenha o que ⛔ não se sabe descrever;
- ⛔ qualquer explicação do que é ASPECTS na tela.

### O que ⛔ NÃO fica bloqueado

✅ `aspects` — o valor **informado no laudo ou pela equipe** continua registrável,
com o rótulo dizendo de onde ele vem e a tela declarando que o app ⛔ não calcula.

### Depois da transcrição — o desenho já aprovado

O autor fixou o padrão em 2026-08-29, e ele é **o mesmo de PD-17** (NIHSS):

> - `ASPECTS calculado aqui`, item a item;
> - `ASPECTS informado`, separado;
> - ⛔ **nenhum sobrescreve o outro**;
> - ⛔ o informado **⛔ nunca fabrica territórios ⛔ não marcados**.

---

## F-29 · "Efeito de massa significativo" — definição operacional

**Estado:** 🔴 **ABERTO** — ⚠️ e ⛔ **sem fonte candidata**.

### O achado negativo que o abriu

A fonte-mãe usa a expressão em recomendações que **mudam a força da indicação de
trombectomia** — F-08, recs. 3 e 4: *"…and **without significant mass effect on
imaging**, EVT is recommended…"* — e ⛔ **não define medida nenhuma** para
"significant".

⚠️ ⛔ Isso ⛔ não é lacuna de transcrição: é lacuna **da fonte**. Varrida a seção,
⛔ não há critério, ⛔ não há corte, ⛔ não há referência de comparação.

### O contraste que torna a lacuna visível

A mesma Table 8 **define** o achado vizinho, e o define de forma aplicável à
beira do leito:

> *"Clear hypodensity is when the degree of hypodensity is greater than the
> density of contralateral unaffected white matter."* — F-07, p. e367

⚠️ Por isso a **hipodensidade clara** entrou na Superfície C com a definição
visível, e o **efeito de massa** ⛔ não: um tem critério transcrito, o outro ⛔ não.

### O que a Superfície C faz enquanto isto ⛔ não resolve

O campo `efeito_de_massa` mantém **a expressão da fonte** — *efeito de massa
significativo* — e a nota declara que a fonte ⛔ não define medida e que a leitura
é de quem interpreta a imagem. ⛔ **⛔ Nenhum critério inventado**, ⛔ nenhum corte,
⛔ nenhuma lista de sinais.

### O que fica bloqueado

⛔ Qualquer classificação clicável de efeito de massa, e ⛔ qualquer frase que diga
ao médico **como** decidir se é significativo.
