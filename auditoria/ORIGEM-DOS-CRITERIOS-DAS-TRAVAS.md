# De onde vem o critério de cada trava — a varredura da fundação

**Medição de 2026-08-23.** `npm run medir:origem`. ⚠️ **Nada foi corrigido.**

---

## O que motivou

> *"`valida-calculadoras` rodava a varredura do ânion gap sem albumina e exigia
> que a calculadora dissesse 'normal'. Ela dizia, e a trava aprovava — **a trava
> estava guardando o erro**."*

Quem a escreveu olhou o que o app fazia, achou razoável, e transformou o
comportamento em exigência. A partir dali **o defeito ficou protegido**:
consertá-lo passaria a reprovar.

---

## O universo, e a contagem

```
87 instrumentos · só o BLOCO /** … */ de cada um foi lido

FONTE CLÍNICA 53 · DECISÃO DO AUTOR 1 · ESTRUTURA 16 · ⚠️ NÃO DECLARADA 17
```

⚠️ **A classificação é por vocabulário, e por isso é PISO.** "Não declarada"
significa **"não consegui ver"**, nunca "não existe" (R-13).

⚠️ **E a primeira versão desta medição estava errada de um jeito instrutivo:**
ela cortava o cabeçalho no primeiro `const` e não conhecia nome de ensaio.
Resultado: **37 "não declaradas"**, entre elas `valida-avc` — que explica o
critério pela população do **WAKE-UP** dez linhas depois do corte. Medir menos do
que existe é o mesmo falso negativo que a varredura persegue. Corrigido: 17.

---

## ⚠️ O ACHADO PRINCIPAL, E ELE DERRUBA A PRÓPRIA MEDIÇÃO

**`valida-calculadoras` — a única fossilização que conhecemos — sai classificada
como FONTE CLÍNICA.**

O cabeçalho dela cita fontes de verdade (as fórmulas conferem contra publicação).
O que estava podre era **um caso de teste no meio do corpo**, escrito a partir do
que o app fazia. **Nenhuma leitura de cabeçalho encontraria isso.**

> **A fossilização não se detecta lendo a trava. Detecta-se CONSERTANDO O DEFEITO
> e vendo a trava brigar.**

Foi assim que ela apareceu: eu tirei o AG do verde, e o `test:all` reprovou. A
varredura abaixo tem valor — mostra onde a origem não está escrita — mas **não é
o instrumento que acha fossilização**, e dizer o contrário seria vender falso
conforto.

---

## As 17 sem origem declarada, lidas uma a uma

### A · DIZEM QUE SÃO DE COERÊNCIA INTERNA — e isso é o modelo (4)

Estas **não afirmam nada clínico** e **escrevem que não afirmam**. Não podem
fossilizar defeito clínico porque não opinam sobre clínica.

| trava | o que ela mesma declara |
|---|---|
| `valida-teto-por-kg` | *"A lista de fármacos vem do que o próprio app já declara — **nenhum teto é exigido por conhecimento externo**"* |
| `valida-causas-reversiveis` | *"NÃO PROMETE que os nomes ou as intervenções estejam clinicamente certos — a conferência é de SINCRONIA e de PRESENÇA, não de fonte"* |
| `valida-campos-do-no` | *"NÃO PROMETE que o conteúdo esteja no campo certo. Isso é decisão clínica"* |
| `valida-secao-pcr` | conferência de conjunto entre duas listas de ids |

### B · ESTRUTURAIS — o critério é sobre FORMA (8)

`auditoria-padroes-ui` · `mapa-fluxo-guiado` · `valida-contraste` ·
`valida-escopo-pediatrico` · `valida-leitura-de-fonte` · `valida-sem-ia` ·
`valida-sinonimos` · `valida-texto-vs-corte`

Nenhuma afirma valor clínico: cobrem alvo de toque, contraste, cobertura de
caminho guiado, leitura de fonte sem comentário, ausência de IA, vocabulário de
busca, coerência entre prosa e corte. **O regex de "estrutura" não as pegou por
vocabulário — é limitação da medição, não delas.**

### C · ⚠️ NASCIDAS DE AUDITORIA DE MÓDULO — a fonte existe, mas mora no CONTEÚDO (5)

`valida-abdome-agudo` · `valida-choque` · `valida-tep` · `valida-politrauma` ·
`valida-ventilacao`

Estas **guardam conteúdo clínico** (D-dímero ajustado por idade, PERC, metas de
PAS por idade no TCE, peso predito, os pares de choque que se confundem). O
critério veio da **auditoria do módulo**, e a fonte está declarada **no
`procedencia` do conteúdo** — não no cabeçalho da trava.

⚠️ **É aqui que a fossilização é possível.** Se a auditoria do módulo aceitou um
valor errado, a trava agora o protege — e o cabeçalho não deixa ver de onde ele
veio. **Não é acusação: é o lugar onde olhar.**

E note o que quatro delas dizem no `NÃO PROMETE`: *"primeira trava do módulo,
nascida DEPOIS da auditoria (R-21)"* — ou seja, elas **sabem** que fotografam o
que a auditoria aprovou. `valida-politrauma` é a mais explícita e a mais honesta:
*"travar um algoritmo que a fonte fixa seria fotografar o que já está certo"*.

---

## O que fazer com isso — recomendação, não decisão

1. **As 5 do grupo C são a fila.** Para cada uma, conferir se o conteúdo que ela
   guarda tem `procedencia` declarada. Onde não tiver, a trava está protegendo
   afirmação sem fonte.
2. **Um campo `ORIGEM DO CRITÉRIO` no cabeçalho**, ao lado de PROMETE / NÃO
   PROMETE / UNIVERSO, cobrado por `valida-pipeline`. Custo baixo; e teria feito
   esta varredura ser uma leitura de campo em vez de uma adivinhação por regex.
3. **Aceitar que nenhuma das duas acha fossilização.** O que acha é corrigir o
   defeito e ver quem reclama.
