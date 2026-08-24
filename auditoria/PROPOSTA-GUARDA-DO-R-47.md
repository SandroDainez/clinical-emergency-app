# Proposta — o guarda do R-47

**Não implementada.** Mostrada antes, como o resto.

---

## O problema, e por que a solução anterior não bastou

O **R-47** proíbe `git checkout` e `git restore` dentro de um ciclo de mutação:
eles revertem o arquivo inteiro, e um arquivo revertido apaga trabalho que não
era da mutação.

**Violado quatro vezes nesta sequência.** As três primeiras produziram
`scripts/muta.cjs` — que existe, funciona, e **não impediu a quarta**.

> **R-128: o que se repete precisa virar IMPOSSIBILIDADE, não advertência.**

⚠️ E o diagnóstico do porquê: **usar o `muta.cjs` continua sendo uma escolha.**
Ferramenta boa que não é obrigatória protege quem já se lembraria sozinho — que é
exatamente quem não precisa dela.

---

## As três propriedades exigidas

| # | propriedade | por quê |
|---|---|---|
| 1 | **liga sozinha** | se depender de alguém ligar, é advertência de novo |
| 2 | **falha alto** | a tentativa erra com a mensagem dizendo o que fazer no lugar |
| 3 | **não sobrevive ao ciclo** | sai quando o ciclo termina — **inclusive se ele morrer** |

---

## A forma proposta

Um `git` de mentira **no início do `PATH`**, ligado pelo `muta.cjs` durante o
ciclo:

```
scripts/guarda-r47/git          ← executável, entra no PATH pelo muta.cjs
```

```sh
#!/bin/sh
# ⚠️ SÓ DUAS PALAVRAS SÃO PROIBIDAS. `git status`, `git diff` e `git log` são
# exatamente o que a conferência da mutação precisa — bloquear tudo obrigaria a
# desligar o guarda, que é como um guarda morre.
case "$1" in
  checkout|restore)
    echo "⛔ R-47: \`git $1\` não existe dentro de um ciclo de mutação." >&2
    echo "   Ele reverte o ARQUIVO INTEIRO e apaga o que não era da mutação." >&2
    echo "   ➜ Restaure da cópia fora da árvore:  cp \$SCRATCH/<arquivo>.ORIG <arquivo>" >&2
    echo "   ➜ Confira com:  diff -q  e  git status --short" >&2
    exit 47
    ;;
esac
exec /usr/bin/git "$@"
```

E no `muta.cjs`:

```js
// ⚠️ LIGA SOZINHA (propriedade 1) e NÃO SOBREVIVE (propriedade 3).
const env = { ...process.env, PATH: `${GUARDA}:${process.env.PATH}` };
try { /* … o ciclo inteiro roda com este env … */ }
finally { /* nada a desligar: o env morre com o processo */ }
```

⚠️ **A propriedade 3 sai de graça, e é por isso que a forma é esta:** o guarda
vive no `PATH` do processo filho. Se o `muta.cjs` morrer — travar, ser
interrompido, cair —, **o `PATH` morre junto**. Nada fica ligado depois. Um
guarda que fosse um hook do git, ou um arquivo de flag, precisaria ser desligado
— e desligar é o passo que falha quando o processo morre.

---

## A prova

> Um instrumento que **tenta** `git checkout` durante um ciclo e **exige o
> erro**. Passou → **reprova**.

```
✅ dentro do ciclo: `git checkout --` saiu com 47 e disse o que fazer
✅ fora do ciclo:   `git checkout --` funciona normalmente
❌ se o comando funcionar dentro do ciclo → o guarda não está de pé
```

⚠️ **A segunda linha importa tanto quanto a primeira:** um guarda que
sobrevivesse ao ciclo quebraria todo uso legítimo de `git` no repositório — e a
primeira coisa que alguém faria seria removê-lo.

---

## ⚠️ O QUE ESTA PROPOSTA NÃO RESOLVE

**Ela só protege quem passa pelo `muta.cjs`.** Uma mutação feita à mão, sem o
harness, continua sem guarda — e as quatro violações foram todas assim.

**A pergunta que fica, e é do autor:** o `muta.cjs` deve virar **o único caminho**
para mutar (com uma trava que reprove mutação registrada fora dele), ou o guarda
cobre só quem já o usa?

⚠️ Eu não decido isso: tornar o harness obrigatório muda como toda mutação futura
é feita, e o custo aparece em cada rodada.
