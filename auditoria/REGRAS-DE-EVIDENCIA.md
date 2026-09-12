# Regras de evidência — as três classes de erro que o projeto já cometeu

> **Consolidado em 2026-09-11**, por observação do autor: *"vocês encontraram
> três classes diferentes de erro de evidência no projeto — evidência velha
> apresentada como atual, ausência afirmada sem busca e busca negativa sem
> instrumento validado. PD-39, R-AUSENCIA e R-CONTROLE agora formam um conjunto
> coerente."*

⚠️ Este arquivo **não substitui** as definições canônicas. Ele reúne as três,
diz de qual erro real cada uma nasceu, e fixa a relação entre elas.

---

# O que as três têm em comum

Todas respondem à mesma pergunta: **como sei que o que estou afirmando é
verdade agora?**

E todas nasceram do mesmo jeito: **eu afirmei, com confiança, algo que a
medição depois contradisse.** Nenhuma é teórica.

| regra | a pergunta que ela força | o erro que a gerou |
|---|---|---|
| **PD-39** | esta evidência é **deste** estado? | suíte verde de commit anterior apresentada como atual |
| **R-AUSENCIA** | você **procurou**, ou só não viu? | *"não existe em lugar nenhum"* sem busca nenhuma |
| **R-CONTROLE** | o **instrumento** estava funcionando? | busca negativa com zero em tudo, inclusive no que existia |

⚠️⚠️ Elas formam uma **escada**, e cada degrau pressupõe o de baixo:

```
R-CONTROLE   o instrumento funciona?          ← sem isso, a busca não vale
   ↓
R-AUSENCIA   a busca foi feita?               ← sem isso, a ausência não vale
   ↓
PD-39        a evidência é do estado atual?   ← sem isso, o verde não vale
```

---

# 1 · PD-39 · evidência velha não vale como atual

**Canônica:** `auditoria/DECISOES-DE-PRODUTO.md`, PD-39.

> ⛔ **Não usar como evidência uma suíte verde de commit anterior.**

Verde em `X` não é verde em `X+4`, mesmo que os quatro commits sejam
documentais. A medição tem de rodar **no estado candidato**, e o registro tem
de dizer em qual estado ela rodou.

**Aplicação mais visível:** a sequência obrigatória de deploy, sete passos,
com `test:all` completo verde **no HEAD candidato**.

⚠️ Generaliza para além de deploy: toda afirmação de estado — "está verde",
"está traduzido", "está transcrito" — herda a data da medição, ⛔ não a data em
que foi escrita.

---

# 2 · R-AUSENCIA · afirmação de ausência exige busca

**Canônica:** `auditoria/BUSCAS-LF04-LF05-E-ANAFILAXIA.md`.

> ⛔ **Não declarar que algo "não existe em nenhuma fonte" sem busca específica
> que prove isso.**

E a classificação que a acompanha, para lacunas de fluxo, ⛔ nunca *"não
existe"* por padrão:

| estado | significado |
|---|---|
| **fonte clínica incompleta** | a fonte da complicação não responde à continuidade do fluxo |
| **integração de fontes necessária** | a resposta pode nascer da combinação de diretrizes diferentes |
| **evidência não localizada** | busca feita, e nada adequado encontrado |
| **decisão operacional derivada** | as fontes delimitam o problema, não dão regra explícita; a decisão é assumida e declarada como tal |

⚠️ **Silêncio não é permissão.** Fonte que não nomeia população registra-se
como *"população não declarada"*, ⛔ nunca como *"vale para todos"*.

---

# 3 · R-CONTROLE · busca negativa exige instrumento validado

**Aprovada como regra global em 2026-09-11.** Canônica aqui.

> ⛔ **Uma contagem de zero só vale depois de provar que a busca funcionava.**

## Os cinco requisitos, na ordem

| # | exigência | por quê |
|---|---|---|
| 1 | **caminho do arquivo confirmado** | um PDF movido devolve 0 em tudo, sem erro visível se `stderr` estiver suprimido |
| 2 | **controle positivo conhecido** | uma palavra que **tem** de aparecer (`the`, `patients`). Se ela der 0, o instrumento está quebrado e ⛔ nenhum 0 daquela rodada vale |
| 3 | **normalização** de quebras/extração quando necessária | frase de várias palavras se parte entre linhas e some da busca — achatar antes (`tr '\n' ' '`) |
| 4 | **citação do trecho**, ou evidência de que a busca funcionou | contagem sem contexto ⛔ não distingue *"não menciona"* de *"menciona e diz outra coisa"* |
| 5 | **só então** a contagem negativa | a ordem importa: o zero é a **conclusão**, ⛔ não o ponto de partida |

## Os três erros reais que a geraram, todos em 2026-09-11

1. **caminho** — afirmei que o PDF do Wang *"não tem camada de texto"*. Ele
   tinha; havia sido **movido** para `~/Downloads/Para Avaliar/`;
2. **mutação que não mutou** — removi uma tradução que **não foi removida**, vi
   a trava não reprovar, e conclui que a trava estava **cega**. Não estava;
3. **zero onde havia um** — a busca de `bronchodilator` no Wang registrou **0**,
   e o documento traz a palavra, numa frase que **contradiz** o que eu havia
   escrito a partir daquele zero.

⚠️⚠️ O terceiro é o mais grave: o zero virou **afirmação clínica publicada no
repositório** — *"a fonte NÃO dá broncodilatador"* — e essa afirmação estava
errada.

## ⚠️ R-CONTROLE vale também para as travas

Uma trava que devolve *"0 problemas"* está sujeita à mesma pergunta. A
**D-138** é exatamente isso: `varredura-pt.cjs` devolvia **SEM TRADUÇÃO: 0** e
o zero significava *"não olhei para esta frase"*, ⛔ não *"está traduzida"*.

➜ Consequência prática: **toda trava nova declara o que reprova quando o
universo fica vazio.** Já é prática do projeto — *"trava que não encontra nada
não está aprovando nada, está cega"* — e agora tem nome.

---

# ⚠️ O que estas regras NÃO fazem

- ⛔ não tornam uma afirmação verdadeira por estar bem medida;
- ⛔ não substituem leitura da fonte — trava nenhuma substitui ler;
- ⛔ não dispensam revisão clínica: **fidelidade documental** e
  **aplicabilidade ao AVC** continuam sendo eixos separados.

⚠️ Elas tornam o processo **mais difícil de enganar** — inclusive, e
principalmente, **pelo próprio agente que o executa**.
