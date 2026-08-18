# Antes de escrever

**Leia isto antes de criar ou editar um nó de fluxo clínico.** São treze coisas
que compilam, passam nos testes de conteúdo e ainda assim quebram o app — sete
convenções do código e seis lugares onde a coisa óbvia é a errada.

Não é o método. O método está em [`auditoria/METODO.md`](auditoria/METODO.md), com
80 regras e as razões de cada uma; as decisões de produto estão em
[`auditoria/DECISOES-DE-PRODUTO.md`](auditoria/DECISOES-DE-PRODUTO.md) e as
dívidas em [`auditoria/DIVIDAS-CONHECIDAS.md`](auditoria/DIVIDAS-CONHECIDAS.md).
Aqui está só o que você precisa ter na cabeça **enquanto escreve**.

---

## Checklist — ao criar ou editar um nó

```
□  o campo em que escrevi é VISÍVEL na tela?             (C1, C2)
□  se é `evidence`: o nó ficou com 3+ itens?             (C1)
□  o nó de decisão pergunta o OBSERVÁVEL, não a
   classificação? e os rótulos põem sinal antes do nome? (I1)
□  toda saída de dúvida ("não sei") tem destino próprio
   com conteúdo, e não um atalho para o próximo nó?      (I2)
□  há um nó `transition` fechando o fluxo?               (C3)
□  se prometi navegação: o nó é `transition`?            (C2)
□  todo texto novo em PT foi para o dicionário ES?       (C4)
□  rodei `npm run build:web` SEM silenciar o stderr?     (C5)
□  se citei um número que NÃO deve ser usado: ele saiu
   do texto visível?                                     (I5)
□  se escrevi dose por peso: a fonte do cálculo é uma
   função única em `lib/`?                               (I6)
□  se escrevi dose pediátrica: eu sei que ela reprova?    (C6)
□  a constante que criei em `lib/` é CONSUMIDA por um nó? (C7)
□  se é MÓDULO NOVO: fiz os 9 registros? usei
   `entryNodeId` (não `initial`)?                       (abaixo)
□  a minha tela desenha o PRÓPRIO cabeçalho, com volta?  (I7)
□  medi a densidade do nó contra a mediana do app?      (abaixo)
□  rodei `npm run test:all` e ele saiu com 0?
   ⚠️ E ANTES DE TODO PUSH — não só ao editar nó. Em 2026-08-18 uma
   string foi para produção sem tradução porque rodei a trava do
   módulo (`test:politrauma`) e não o conjunto. A trava certa existia,
   estava verde e não foi chamada.
□  ⚠️ NÃO COMMITE MÓDULO NOVO SEM TRAVA.                (abaixo)
```

---

## As 7 convenções do código

### C1 · `evidence` recolhe por CONTAGEM — o 3º item esconde os outros dois

`components/protocol-screen/acls-decision-flow-screen.tsx` → `ListaDeCriterios`:
`const curta = itens.length <= 2`. Com **até 2 itens a lista aparece aberta**;
com **3 ou mais** ela vira um botão *"Ver critérios (N)"* que ninguém abre no
meio de um atendimento.

> **Consequência de ignorar:** você acrescenta um item a um nó que tinha 2 e
> **esconde os outros dois** sem tocar em nada mais. Nenhuma trava geral vigia
> isso. Foi assim que 15% do conteúdo das árvores ficou atrás de um toque, e o
> caso mais caro foi um nó com **15 itens** — incluindo os padrões de oclusão
> coronária que decidem sala de hemodinâmica.

**O que fazer:** conduta vai no `summary` (renderiza aberto, sempre). `evidence`
é para **critério e justificativa** — o que se consulta, não o que se executa. Se
o nó já tem 2 itens e você precisa de um terceiro, pergunte primeiro se o novo
não é conduta.

#### ⚠️ E a consequência que não estava escrita: o recolhimento restringe ONDE o conteúdo pode ir

C1 costuma ser lida como regra de quantidade — "não passe de 2". Ela é também uma
regra de **endereço**:

> **Um nó que já tem 4 itens em `evidence` NÃO RECEBE um quinto que precise ser
> visto.** Não adianta acrescentar: ele nasce recolhido junto com os outros
> quatro, e "está no app" vira "está atrás de um toque".

E não adianta tirar um para abrir: sair de 4 para 3 continua recolhido, perde-se o
detalhe e não se ganha visibilidade nenhuma.

**O que isso obriga:** quando o conteúdo novo PRECISA ser visto, a pergunta deixa
de ser "em que campo?" e passa a ser **"em que nó?"**. Procure, no mesmo caminho,
um nó do tipo `action` — que renderiza `actions` sempre abertas — ou um nó de
decisão com `evidence` ainda vazio ou com um item só.

**O caso (2026-08-17):** o gatilho do LAST no Choque precisava entrar antes de o
padrão ser classificado, e o nó natural era `inicio`. Ele tem **4 itens** em
`evidence` — o gatilho nasceria fechado. Foi para `estabilizacao_metas`, que é
`action`, está no mesmo caminho de todo paciente com choque, e cujo `next` é a
primeira pergunta de classificação. Mesmo momento do fluxo, tela em que aparece.

### C2 · Os campos visíveis dependem do TIPO do nó

`core/decision-tree/types.ts` define quatro tipos, e cada um mostra coisas
diferentes:

| tipo | renderiza aberto | recolhe | exclusivo dele |
|---|---|---|---|
| `decision` | `title`, `question`, `summary`, rótulos das `options` | `evidence` (3+) | — |
| `action` | `title`, `summary`, `actions` | `evidence` (3+) | — |
| `input` | `title`, `intro`, campos | — | `intro`, `fields` |
| `transition` | `title`, `summary`, `exitCriteria` | — | **`targets`** |

⚠️ **`targets` — a navegação real entre módulos — existe SÓ em `transition`.**

> **Consequência de ignorar:** você escreve um ponteiro que promete um toque que
> não existe. E converter um `action` em `transition` para ganhar navegação muda
> a semântica: `transition` significa **desfecho** (`disposition: discharge |
> observation | icu | other_module`), e "prescrevi o antibiótico" não é desfecho
> — o fluxo continua.

**O que fazer:** em `action`, o ponteiro é textual e diz **onde** a coisa está,
no vocabulário do hub ("CALCULADORAS & ESCORES › …"), sem prometer botão.

### C3 · Um fluxo sem nó `transition` não tem conclusão

`scripts/auditoria-maquinas-estado.cjs` exige que todo fluxo termine em
`transition`.

> **Consequência de ignorar:** a trava reprova **todos** os nós do módulo, não o
> culpado. Você vai ver 14 erros e nenhum deles aponta o `next` que fechou o
> ciclo.

### C4 · O dicionário ES é indexado pela string PT INTEIRA

`lib/i18n/modules/*.ts` mapeia `"frase em português": "frase em espanhol"`.
`npm run test:i18n` varre todo texto PT do app e exige o par.

> **Consequência de ignorar:** o build falha. E, pior: **mudar uma vírgula
> orfana a entrada** — a tradução antiga continua no dicionário e a frase nova
> aparece como pendente. Concatenar strings (`"a" + " " + CONSTANTE`) cria uma
> chave nova a cada mudança de qualquer das partes: é a **D-35**, e é por isso
> que constantes viajam inteiras.

**O que fazer:** ao acrescentar tradução, gere o escape com um serializador
(`json.dumps`, `JSON.stringify`), nunca à mão — aspas internas cruas quebram o
arquivo.

### C5 · `test:i18n` NÃO compila TypeScript

Ela lê por regex. Um dicionário sintaticamente inválido **passa**.

> **Consequência de ignorar:** quem detecta é o `build:web`. Se você rodou
> `npm run build:web >/dev/null 2>&1`, jogou fora a única voz que restava, e o
> erro só aparece quando o Playwright não sobe porque `dist/index.html` não
> existe. Já aconteceu.

**O que fazer:** `npm run build:web 2>&1 | tail -5` — preserva o código de saída
e mostra o fim.

### C6 · Dose pediátrica reprova o build, mesmo com fonte

**PD-2**: o app é de população **adulta**, com a ausência declarada por ponteiro.
`npm run test:escopo-pediatrico` reprova qualquer `número + mg/kg` perto de
"criança", "pediátric", "lactente".

> **Consequência de ignorar:** o build para. E a razão não é burocrática: já
> entraram **oito** fragmentos pediátricos avulsos no app, todos pela mesma via —
> uma fonte cita as duas populações e o número pediátrico vem copiado junto, sem
> virar trilha. Reverter é possível, mas com infraestrutura própria (peso, faixas
> de sinais vitais, calculadoras), não fragmento por fragmento.

### C7 · Constante em `lib/` que ninguém consome é conteúdo APAGADO

`lib/*.ts` é a fonte única do conteúdo clínico. Uma constante lá que nenhum nó
importa **e usa** não existe para o usuário.

> **Consequência de ignorar:** texto escrito, revisado, traduzido — e invisível.
> Medido: **10 constantes clínicas** estavam nessa situação, entre elas o aviso de
> que atropina não funciona em bloqueio infranodal.

**E o inverso, ao remover:** ao apagar o último consumo, `grep -c '\bNOME\b'
arquivo` volta **1** — o que sobrou é o `import`, e o conteúdo saiu do app. Isso
não é "constante não usada": é conteúdo apagado por engano.

---

## As 7 inversões — onde a coisa óbvia é a errada

### I1 · Não pergunte a classificação. Pergunte o que se vê.

*"Qual toxíndrome?"*, *"É pré-renal, renal ou obstrutivo?"*, *"Qual o padrão do
abdome?"* — todas devolvem ao usuário a conclusão que o app deveria tirar.

> **Consequência de ignorar:** quem não domina o termo **para na palavra** e não
> chega aos sinais que vinham logo depois. E a saída que ele escolheria — "não
> sei" — costuma levar ao caminho errado.

**O que fazer:** pergunte o achado (bexiga palpável, pele seca, jato fino,
resposta a volume) e deixe o app concluir. E nos rótulos, **sinal primeiro, nome
depois**: `"Miose, bradipneia, coma — OPIOIDE"`, não o contrário. Quem domina o
nome continua achando; quem não domina lê o quadro antes do termo.

### I2 · "Não sei" precisa de destino próprio, com conteúdo

> **Consequência de ignorar:** a saída vira atalho para o próximo nó, e o médico
> que admitiu não saber — que é quem mais precisa — recebe menos que quem sabia.
> Em vários módulos essa saída é o **caso comum**, não a exceção.

E o rótulo dela não pode exigir o vocabulário que o usuário não tem: *"quadro sem
toxíndrome definida"* pede a palavra que ele não domina para poder sair.

### I3 · Não ajuste antibiótico pela função renal na primeira hora

A intuição diz para reduzir. A coorte de sepse com lesão renal aguda diz o
contrário: **adiar** o ajuste além de 24 h associou-se a **menor** mortalidade
(HR 0,588; IC 95% 0,355–0,974). A dose de ataque compensa o volume de
distribuição aumentado, que **não depende de depuração renal**.

> **Consequência de ignorar:** você subdosa o séptico — e isso mata mais rápido
> que acumular a droga.

### I4 · A ordem canônica dos livros põe a causa reversível no fim

Pré-renal → renal → pós-renal é como se ensina. Mas a **obstrução** é a única
reversível em minutos, e passar uma sonda é barato e diagnóstico.

> **Consequência de ignorar:** você reordena "para ficar organizado" e a única
> causa que se resolve agora passa a ser a última perguntada.

### I5 · Número desmentido é número retido

Se um valor **não deve ser usado**, não o cite no aviso contra ele.

> **Consequência de ignorar:** quem lê depressa guarda a cifra e descarta a
> ressalva. Num fluxo de emergência a leitura é por varredura: os olhos param em
> números, e o "não" se perde. Pior: um número citado dentro do app **parece do
> app**.

**O que fazer:** refira-se a ele por posição ("a janela que este texto trazia
antes") ou por classe ("nenhuma janela em horas"), e deixe a cifra no comentário
do código.

### I6 · Cálculo em dois lugares divergem — e o que prescreve é o errado

> **Consequência de ignorar:** medido no app. A dose de ataque de vancomicina
> vivia em dois lugares: a calculadora aplicava o teto de 3 g, o módulo da sepse
> não. A **130 kg** um dizia 3.000 mg e o outro **3.575 mg** — e o que prescrevia
> era o segundo. Ninguém percebeu porque os dois "funcionavam".

**O que fazer:** todo cálculo clínico tem **uma** função exportada de `lib/`, e
os dois lados a chamam.

---

### I7 · A rota NÃO desenha cabeçalho — cada tela desenha o seu

O óbvio é a rota desenhar voltar+título para todo mundo e as telas migradas
suprimirem. Foi o que o app fazia, com uma lista escrita à mão —
`COM_CABECALHO_PROPRIO`, 24 dos 31 módulos.

A medição em produção, por coordenada, mostrou a lista **errada nas sete
ausências**: todos os sete módulos que ela deixava de fora desenhavam cabeçalho
próprio também, e a tela mostrava o título **duas vezes**.

> **Consequência de ignorar:** a lista de exceção mantida à mão erra por
> OMISSÃO, e a omissão é invisível — nada reprova, o build passa, e o defeito só
> aparece na tela de quem usa. Criei um módulo e esqueci a linha; o app ficou com
> o nome repetido no alto e ninguém foi avisado.

Invertido, a pergunta "esta tela está na lista?" deixa de existir. Em troca, a
tela assume a obrigação inteira: **título e saída**. Quatro calculadoras
dependiam do cromado da rota como ÚNICO retorno ao hub e ganharam o `Header` do
ui-v2 junto com a inversão.

---

## Se o que você está criando é um MÓDULO novo

**A árvore não aparece sozinha.** São nove registros, e esquecer um deixa o
módulo invisível ou o app quebrado:

```
1. lib/<tema>.ts               o conteúdo, em constantes (C7)
2. <tema>-decision-tree.ts     a árvore
3. reasoning-engines.ts        export const <x>Engine = makeStub("<id>", "Nome")
4. clinical-modules.ts         id, title, description, route, engine
5. components/protocol-screen/<tema>-flow-screen.tsx    a tela
6. components/clinical-app.tsx  const is<X> = protocolId === "<id>"  +  o if
7. constants/module-area-labels.ts   a etiqueta de CENÁRIO (não de origem)
8. constants/module-groups.ts   o grupo temático
9. o CABEÇALHO da sua tela      `Header` de components/ui-v2/header.tsx,
                                com título E com `onVoltar`  (I7)
   constants/sinonimos-de-modulo.ts  os sinônimos, nos DOIS idiomas
   components/module-hub.tsx    o glifo, e a paleta se a etiqueta é nova
```

⚠️ **O nono é o mais fácil de esquecer, e eu esquecei.** A rota
`app/modulos/[id].tsx` NÃO desenha cabeçalho: se a sua tela não desenhar um, ela
fica sem título e **sem caminho de volta ao hub**. Criei a Injúria Renal Aguda e
não fiz este registro — a tela apareceu com o título duas vezes, e só a captura de
produção mostrou. `e2e/um-cabecalho-por-tela.spec.ts` reprova os dois casos.

⚠️ **`DecisionTreeDefinition` exige quatro campos**, e o erro do `tsc` é
enganoso: escrever `initial:` em vez de `entryNodeId:` produz *"'initial' does
not exist in type"* — sem dizer que faltam os outros três.

```ts
export const xTree: DecisionTreeDefinition = {
  id: "meu_modulo",        // snake_case, e é o protocolId do clinical-app
  version: "1.0.0",
  label: "Meu módulo",
  entryNodeId: "entry",    // NÃO é `initial`
  nodes: { entry: { … } },
};
```

**E confira a densidade antes de fechar.** `node scripts/mede-densidade.cjs` dá a
distribuição do app: nós de **decisão** têm mediana de 171 caracteres visíveis e
p90 de 543; nós de **ação**, mediana 791 e p90 2.481. Passar disso é possível — o
nó das toxíndromes tem 970 e a razão está escrita nele — mas **passar sem saber
não é**. Trocar "escondido" por "ilegível" não resolve nada.

⚠️ **Cor nova em componente reprova.** `npm run test:paleta` mantém um teto de
hexadecimais por arquivo, e ele **só desce**. Arquivo novo nasce importando de
`design-system/tokens`; se a cor não existe na paleta, ela é decisão de tema e
entra em `design-system/`, onde a trava de contraste a enxerga. Reusar a paleta
de uma área existente costuma ser melhor que criar uma — o reuso informa
parentesco.

---

## A trava — as três coisas que decidem se ela vale algo

**Módulo novo sem trava não entra.** Sem ela, "o app tem 74 conferências" não diz
nada sobre o seu módulo, e a próxima correção o desfaz sem que nada reclame.

O método completo está em `METODO.md` (R-1, R-15 com 13 itens, R-71, R-74, R-78,
R-80). Aqui só as três em que **as nossas próprias travas falharam repetidamente**
nesta sessão:

**1 · O universo é DERIVADO, nunca listado — e falha se vier vazio.**
Do diretório, do `dist`, do grafo compilado. Universo escrito à mão foi o defeito
recorrente, em três formas: incompleto (esqueceram um módulo), **circular** (a
trava lia o campo onde a correção vive, então corrigir tirava o nó do radar) e
completo com asserção ausente (239 de 381 nós entravam na conta e nada era
conferido neles).

```js
const arquivos = fs.readdirSync(appDir).filter((f) => /-decision-tree\.ts$/.test(f));
if (arquivos.length < 15) falhas.push("só " + arquivos.length + " árvores — pode ter rodado sobre nada");
```

**2 · A mutação reproduz o erro PLAUSÍVEL, não uma quebra artificial.**
Trava sem mutação não vale nada; mutação que ninguém cometeria também não. A
pergunta é *o que um revisor competente faria de boa-fé?* — e a mutação tem de
provar que **criou o defeito**, não só que foi aplicada.

```
❌ artificial  apagar a constante e ver a trava reclamar do import
✅ plausível   trocar "pergunte o que você vê" por "qual é o padrão?"
```

**3 · PROMETE / NÃO PROMETE / UNIVERSO no cabeçalho — o `test:indice` exige.**
Sem isso a próxima pessoa lê "tem trava" e não sabe o que ela guarda; e o
"NÃO PROMETE" é o que evita alguém confiar nela para o que ela nunca viu.

```js
/**
 * PROMETE: que a obstrução seja a primeira da exclusão, e que as perguntas
 *   sejam pelo observável.
 * NÃO PROMETE: que os números clínicos estejam certos — isso é a fonte.
 * UNIVERSO: a árvore compilada, derivada do arquivo (não uma lista à mão).
 */
```

⚠️ **E se o módulo nasceu certo, sem defeito histórico:** a trava ainda é
necessária — é o **R-80**. Ela guarda a decisão contraintuitiva que alguém
desfaria por bom senso, e cada conferência escreve o *"porque parece"* que a
ameaça (parece organizado, parece redundante, é a ordem canônica, parece óbvio).
Aí a mensagem de falha precisa **argumentar**, não só apontar — senão quem bate
nela apaga a conferência em vez de entender a decisão.

---

## Duas armadilhas de processo

**Ao testar uma trava com mutação:** copie o arquivo para o scratchpad antes
(`cp arquivo /tmp/.../backup`). **`git checkout` restaura o que o REPOSITÓRIO
tem** — se houver trabalho não commitado, ele apaga. Já custou duas horas.

**Ao rodar uma varredura própria:** confira que ela achou algo antes de acreditar
no zero. Uma busca com `|` num `node -e` inline pode perder todos os
alternadores e dizer que o app não fala de rim.

---

## Onde está o resto

| pergunta | arquivo |
|---|---|
| por que a trava é assim? | `auditoria/METODO.md` (R-1 a R-80) |
| por que o escopo é este? | `auditoria/DECISOES-DE-PRODUTO.md` (PD-1 a PD-6) |
| o que ainda falta? | `auditoria/DIVIDAS-CONHECIDAS.md` (D-1 a D-46) |
| que trava cobre o quê? | `auditoria/INDICE-DE-TRAVAS.md` |
| o que foi deletado e por quê | `auditoria/DELECAO.md` |
