# Método da auditoria

Regras que nasceram de erro cometido, não de preferência. Cada uma tem o caso
que a originou escrito junto — sem o caso, uma regra vira folclore e alguém a
descarta por parecer burocracia.

---

## R-1 · Nenhuma trava é aceita sem uma mutação que a derrube

**Toda verificação nova entra com a mutação que a valida documentada ao lado.**
No cabeçalho do script, no commit, ou nos dois. A mutação tem de ser executada
e o resultado, visto — não descrita como intenção.

**Por que virou regra escrita.** Ao longo desta auditoria foram escritas **cinco
regras incapazes de falhar**. Todas foram pegas, mas por hábito, e hábito é o
que falha na sessão em que se está com pressa:

| Regra | Por que não podia falhar |
|---|---|
| `UI/min` proibido em doses | o termo não estava no `assunto`, então a regra nunca era consultada |
| "12 mg … 12 mg" como alternativa | a condição era sempre verdadeira |
| campo obrigatório no motor | a mutação escapava por um caminho não coberto |
| `norepinefrina` na lista de sinônimos | faltava o sinônimo que a regra dependia de encontrar |
| preparo inicial × solução padrão | os dois lados saíam da **mesma função** depois da correção |

A quinta é a mais instrutiva: a regra estava certa **antes** da correção e ficou
tautológica **por causa** dela. Refatoração pode esvaziar uma trava sem tocar
nela — por isso a mutação se refaz quando o código ao redor muda, não só quando
a trava nasce.

**Uma regra tautológica é pior que nenhuma regra:** ocupa o lugar da proteção,
aparece verde no pipeline, e ninguém volta a olhar.

---

## R-2 · O veredicto é o código de saída, nunca o texto impresso

**Toda trava termina em `process.exit(falhas ? 1 : 0)`.** Nenhum harness conta
`❌` na saída, e nenhuma verificação conclui nada a partir do que foi impresso.

**Por que virou regra escrita.** Um harness desta auditoria usava
`grep -c "❌"` para contar mutações detectadas. Quando o processo **morria**, a
contagem dava zero — e zero era lido como *"a mutação escapou"*. O instrumento
relatava o oposto do que acontecera, e por um tempo a evidência da auditoria
veio de um aparelho com falso-negativo conhecido.

Três ocorrências da mesma família:

1. `grep -c "❌"` contando 0 no processo morto.
2. `test-motor-arvore.cjs` com `advance()` sem envelope — morria em vez de
    relatar, produzindo "0 falhas".
3. `valida-vasoativos.cjs` — remover o campo `fonte` derrubava o `tsc`, e o
    script morria com stack trace solto em vez de dizer o que houve.

**Consequência prática:** compilação, leitura de arquivo e qualquer subprocesso
entram em `try`, e a falha é **relatada** antes de sair com 1. Morrer é aceitável;
morrer em silêncio, não.

---

## R-3 · Detectar não é travar

**Script cujo nome promete um portão (`test:`, `valida-`) sai 1 quando acha
erro.** Script que só mapeia (`mapa:`, `audit:`) sai 0 por desenho — e diz isso
no próprio texto, para ninguém confundir mapa com portão.

**Por que virou regra escrita.** `auditoria-maquinas-estado.cjs` imprimia
*"Erros estruturais: 11"* e saía **0**. Detectava perfeitamente e o pipeline
seguia satisfeito.

E o caso maior: **sete travas de build não estavam no `test:all`.** Cada uma
escrita, testada por mutação, declarada trava — e nenhuma ligada ao portão.
Sete portas trancadas num muro sem portão. Hoje `test:pipeline` cobre isso: toda
trava nova nasce ligada ou o build cai no mesmo dia.

---

## R-4 · O ônus da prova é do descarte, não do achado

**Verifique o instrumento antes de agir sobre o achado — mas nunca feche um
achado como falso positivo sem demonstrar por quê.**

Os instrumentos desta auditoria produziram falsos positivos com frequência
(RASS lido com o menos tipográfico errado, "2000 mL" lido como ano, sete nós de
prosa clínica confundidos com evidência desatualizada). Isso justifica
**conferir**, não **presumir**. A assimetria importa: presumir que o achado é
ruído racionaliza defeito verdadeiro, e o custo dos dois erros não é o mesmo
num app de beira-leito.

---

## R-5 · Número clínico não se altera de memória

**Toda mudança de dose, faixa, limiar ou apresentação vem com a fonte primária
consultada na hora** — diretriz com ano, ou bula/registro. Se a fonte não foi
aberta nesta sessão, a mudança não acontece.

**Por que virou regra escrita.** Duas vezes a memória divergiu da fonte:

- "20 mL/kg é o padrão de cristaloide na anafilaxia" — é a dose **pediátrica**;
  no adulto é 1–2 L. O app já estava certo.
- A dopamina entrou com a ampola **norte-americana** (40 mg/mL) num app
  brasileiro. A ampola daqui é 5 mg/mL × 10 mL. Fator 8, para menos, num
  vasopressor — e o próprio app já trazia a ampola certa em outra tela.

Corolário: **apresentação farmacológica é número clínico.** Toda ampola
cadastrada declara `fonte`, e o build recusa quem não declarar.

---

## R-6 · Droga com mais de uma apresentação no Brasil não pode ter apresentação implícita

**Ou o app oferece as duas, ou declara no conteúdo visível qual assume e por
quê.** Nunca deixa a escolha acontecer no silêncio.

**Por que virou regra escrita.** Dois defeitos de aparência oposta e mecanismo
idêntico:

- **Dopamina:** o app trazia a ampola **errada** (americana, 40 mg/mL) num país
  onde a ampola é 5 mg/mL. O médico assumiu que a tela descrevia o que ele
  tinha na mão.
- **Sedoanalgesia:** o app traz **uma** ampola por droga, e todas conferem —
  mas propofol, midazolam, morfina e dexmedetomidina têm **outra** apresentação
  circulando no Brasil. O médico com a outra na mão assume que a única listada
  é a dele.

Errar a apresentação e omitir a segunda produzem o **mesmo** engano: *o que
está na tela é o que está na minha mão*. Uma tela que oferece uma opção não
está informando — está afirmando.

**Consequência prática:** cadastro de apresentação declara `fonte` (R-5) **e**
responde se existe outra no mercado. Se existe e não é oferecida, a tela diz
qual assumiu. O silêncio é que está proibido — não a escolha.
