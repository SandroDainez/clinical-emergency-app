# Proposta · Cronômetro no runtime de árvore

**Documento de decisão. Nada implementado.**

Nasce da D-16: **Convulsões é o caso mais próprio de cronômetro do app inteiro** e
é o único que não pode receber um, porque não tem motor — é árvore pura. Os
outros 18 módulos de árvore são consequência, não justificativa.

---

## 1 · O que a árvore já faz, e por que isso facilita

Três coisas que **já existem** e que a proposta apenas usa:

**A árvore de Convulsões já é organizada por tempo.** Os títulos dos nós são as
fases do protocolo:

```
0–5 min   · Estabilização simultânea
5–20 min  · 1ª linha — BENZODIAZEPÍNICO
20–40 min · 2ª linha — antiepiléptico IV
40–60 min · Refratário — anestésico + IOT
```

São **quatro** relógios, não dois. A estrutura para pendurar o cronômetro já
está desenhada — falta o cronômetro.

**O runtime já interpola tokens.** `interpolate()` substitui `{chave}` a partir
de `getValues()`, e a tradução acontece ANTES da substituição (as chaves de i18n
contêm os tokens). Um token `{tCrise}` com o tempo decorrido entra sem mecanismo
novo e sem quebrar a tradução.

**O AVC já resolve "contar do início e não do app".** O nó `tempo` captura a
janela desde o último momento visto bem, com presets. **O mesmo problema, já
resolvido uma vez neste app.**

---

## 2 · A costura entre dado e comportamento

A árvore é **dado**; o timer é **comportamento**. A costura é o ponto que decide
se isso fica auditável ou vira exceção.

**Precedente que manda no desenho:** `ProximoNo` pode ser `string` ou
`Roteamento { possiveis, escolher }`. A escolha é função — mas os **alvos
possíveis são declarados**, porque a auditoria de grafo percorre estaticamente e
não segue função. **O prazo segue a mesma regra: declarado como dado, executado
pelo runtime.**

### Como um nó declara um prazo

```ts
type Prazo = {
  /** Identidade do relógio. Nós da mesma fase compartilham. */
  id: string;
  /** Minutos desde o MARCO. */
  aos: number;
  /** De onde conta — nunca "de agora" por omissão. */
  marco: "inicioDoEvento" | "entradaNoNo" | "ultimaDose";
  /** O que fazer quando vencer. Texto literal — traduzível. */
  aoVencer: string;
  /** Para onde o fluxo DEVERIA ir. Declarado, nunca automático. */
  sugereNo?: string;
};

type BaseNode = {
  id: string;
  title: string;
  summary?: string;
  prazos?: Prazo[];   // ← acréscimo
};
```

**Três decisões embutidas, e cada uma por um motivo:**

- **`marco` é obrigatório e não tem default.** Sem isso, o prazo silenciosamente
  conta do app — que é o erro clínico central (§5).
- **`sugereNo` sugere, não navega.** Timer que muda a tela sozinho durante uma
  emergência tira o controle de quem está com as mãos no paciente. E navegação
  automática quebraria o log de decisão, que hoje registra escolha humana.
- **`aoVencer` é literal**, não composto — D-19.

### O que muda no runtime, e onde

| Arquivo | Mudança |
|---|---|
| `core/decision-tree/types.ts` | `Prazo` + campo opcional em `BaseNode` |
| `core/decision-tree/engine.ts` | `getPrazos()`, marcos em `values`, e `validateDecisionTree` exigindo `marco` declarado e `sugereNo` existente |
| `scripts/auditoria-maquinas-estado.cjs` | `sugereNo` entra na alcançabilidade — senão vira nó órfão falso |
| a tela de árvore | renderiza o que `getPrazos()` devolver, no badge que já existe |

**Nenhum motor muda.** Nenhum módulo que não declara prazo é afetado.

---

## 3 · De quem é o timer: nó, fluxo ou sessão

**Da SESSÃO, ancorado num marco — não do nó.**

Se fosse do nó, sairia da tela ao navegar, e o status epiléptico é exatamente o
caso em que o médico anda pelo fluxo enquanto o relógio corre.

| Situação | Comportamento |
|---|---|
| **Navega para frente** | o relógio continua — o marco não mudou |
| **Volta (`goBack`)** | continua. Voltar é reler, não desfazer: zerar aqui apagaria o tempo real da crise |
| **`reset()`** | zera tudo, junto com `values` e `history` — é paciente novo |
| **Abandona o app** | os marcos vivem em `values`, que já é o que se persiste. Reabrir recupera o relógio |
| **Prazo vence** | o nó marca `vencido`; **nada navega sozinho** |

**O marco é um valor**, gravado em `values` como qualquer outro campo — então
persistência, log e auditoria já funcionam sem código novo.

---

## 4 · O que Convulsões precisa

**Quatro relógios, e a resposta à sua pergunta é: em SÉRIE, com marco comum.**

Todos contam do **início da crise**, não um do outro. São marcos de uma mesma
linha do tempo:

```
início da crise ──┬── 5 min  → 1ª linha (benzodiazepínico)
                  ├── 20 min → 2ª linha (antiepiléptico IV)
                  ├── 40 min → refratário (anestésico + IOT)
                  └── 60 min → super-refratário
```

Não correm "juntos" no sentido de paralelos independentes, nem "em série" no
sentido de um começar quando o outro termina. **É um relógio só com quatro
marcas** — e por isso `Prazo.id` é compartilhado entre os nós da mesma linha.

**A exceção real:** o benzodiazepínico pode ser repetido **uma vez em 5 min**, e
esse é um segundo relógio, com marco `ultimaDose`. Corre em paralelo ao da crise.
São dois, não cinco.

---

## 5 · A restrição clínica: contar do INÍCIO DA CRISE

**Você tem razão e isso decide o desenho.** Se o app conta do próprio uso, mede
a coisa errada — e no status a diferença entre as duas medidas **é exatamente o
atraso que o protocolo existe para evitar**. Um paciente que convulsiona há 12
minutos quando o app abre já está na janela da segunda linha; um relógio que
começa em zero diria "faltam 8 minutos para a 1ª linha".

**Como a proposta lida:**

1. **Nó de entrada captura o tempo decorrido**, no molde do nó `tempo` do AVC —
   presets em vez de digitação (`agora / ~2 min / ~5 min / ~10 min / ~20 min /
   mais de 20 / não sei`). Presets porque ninguém digita relógio com o paciente
   convulsionando.
2. **O marco é calculado para trás:** `inicioDaCrise = agora − decorrido`. Todos
   os prazos contam dele.
3. **`não sei` NÃO cai em zero.** Cai num estado declarado, com esta redação:

   > ⚠️ Início da crise desconhecido — a contagem começa agora e SUBESTIMA o
   > tempo real. A fase pode ser mais avançada que a exibida: **na dúvida, trate
   > pela fase mais avançada**. Procure uma âncora antes de decidir —
   > testemunha, horário da chamada, último momento visto bem.

   Duas coisas que a primeira versão errava. "Piso" é preciso e técnico demais:
   o que a pessoa precisa saber é **o que fazer**, e subestimar tempo no status
   significa dar benzodiazepínico quando já era hora da segunda linha. E a
   âncora: quem está na sala quase sempre tem uma referência melhor que "agora"
   — mesmo raciocínio do "último momento visto bem" do AVC.

   Contar do zero em silêncio seria pior que não contar.
4. **O tempo decorrido é re-editável.** A informação melhora quando chega quem
   presenciou, e o relógio tem de acompanhar.

**Consequência de desenho:** `marco: "inicioDoEvento"` é o padrão de Convulsões, e
o runtime **recusa** um prazo com esse marco se o valor de origem não existir —
falha declarada em vez de contagem errada silenciosa.

---

## 5b · O que acontece DEPOIS da última marca

**Um cronômetro que estoura sem dizer nada é pior que não ter** — ensina que o
problema acabou justamente quando ele piorou.

E há um fato clínico que decide o desenho: **o status superrefratário não é
definido por minuto nenhum.** A própria árvore diz:

> *"SUPERREFRATÁRIO = continua ou recorre apesar de infusão adequada de
> anestésico por mais de 24 h."*

Ou seja: aos 60 minutos o relógio do **início da crise** deixa de ser o relógio
que decide. Quem decide passa a ser outro, com **outro marco** — o início do
anestésico — e em **outra escala**, horas.

### Três comportamentos, nenhum deles "sumir"

**1. Passada a última marca, o relógio NÃO para nem desaparece.** Muda de
rótulo: deixa de exibir "faltam X para a próxima fase" e passa a exibir
**tempo total de crise**, contando indefinidamente. O número continua sendo a
informação mais importante da tela.

**2. Diz que todas as fases foram ultrapassadas — e o que isso implica.**

> ⚠️ Mais de 60 min de crise: todas as fases declaradas foram ultrapassadas. Se
> o anestésico ainda não foi iniciado, **esta é a pendência** — não há fase
> seguinte a esperar.

Isso cobre o caso pior: o médico preso numa fase anterior enquanto o tempo
passa. O relógio que só contava "faltam X para a próxima" ficaria mudo
exatamente aí.

**3. Quando o anestésico começa, HÁ TROCA DE MARCO.** Um novo prazo entra, com
`marco: "inicioDoAnestesico"` e `aos: 1440` (24 h) — o critério de
superrefratário. O relógio da crise continua visível como tempo total, mas o
relógio que passa a **decidir conduta** é o outro.

Isto é o que o campo `marco` existe para permitir: **o cronômetro não é um
contador, é uma pergunta sobre o que medir — e a pergunta muda com a fase.**

### Consequência para o tipo

`Prazo` ganha um campo, e ele não é opcional para a última marca de uma série:

```ts
type Prazo = {
  …
  /** Como se comporta depois de vencer. Sem default: a omissão é o defeito. */
  aoUltrapassar: "seguirContando" | "trocarDeMarco";
  /** Obrigatório quando aoUltrapassar === "trocarDeMarco". */
  proximoMarco?: string;
};
```

A trava exige `aoUltrapassar` declarado em todo prazo e `proximoMarco` presente
quando a troca é declarada — pelo mesmo motivo de `marco` não ter default: o
silêncio é o defeito.

## 6 · Custo, e o que quebra se for feito errado

**Custo:** ~120 linhas no runtime e nos tipos, ~40 na tela, ~15 na auditoria de
grafo, mais o nó de entrada e as quatro declarações em Convulsões. **Uma sessão
de trabalho**, com teste de comportamento no molde do `test:cronometros` — e
esse teste precisa de espera real (**R-30**), senão mede a existência do relógio
e não o que ele conta.

**O que quebra se for feito errado — quatro modos, em ordem de dano:**

| | |
|---|---|
| **Contar do app** | mede o atraso do atendimento como se fosse a duração da crise. **É o defeito que a proposta existe para evitar** e o mais fácil de introduzir: basta omitir `marco` |
| **Navegar sozinho** | tira o controle de quem está com as mãos no paciente e quebra o log de decisão, que hoje registra escolha humana |
| **Zerar no `goBack`** | apaga tempo real de crise porque alguém releu a tela anterior |
| **`sugereNo` fora da alcançabilidade** | a auditoria de grafo passa a ver órfão onde não há, ou deixa de ver onde há — o mesmo tropeço do `Roteamento` sem `possiveis` |

Os quatro são **evitáveis por trava**, e as travas fazem parte da estimativa.

---

## 7 · Quem mais ganha — sem inflar a lista

**Ganho real, hoje: TRÊS módulos.** Não 19.

| Módulo | O que ganha |
|---|---|
| **Convulsões** | 4 fases + o repique do benzodiazepínico. **É a justificativa inteira** |
| **Anafilaxia (árvore)** | dois nós já titulados por tempo — *"Reavaliação após tratamento inicial (5–15 min)"* e *"Reavaliação do Grau I (30–60 min)"*. Hoje o cronômetro está só no motor, para as doses IM |
| **Eclâmpsia** | resolve sem precisar da infra de sessão que a D-16 estimava — o prazo do gluconato passa a ser declarado na árvore |

**Os outros 16 não ganham nada hoje**, e dizer o contrário seria inflar. Eles
ganham a POSSIBILIDADE — quando uma auditoria de módulo encontrar um prazo
acionável, a estrutura estará lá. Isso é valor real, mas é futuro, e não deve
entrar na conta de agora.

**O caso de Vasoativos continua sendo NÃO fazer:** *"titular a cada 5 min"* é
titulação contínua, não prazo com marco. Cronômetro ali ensinaria a tratar por
relógio o que se trata por resposta.

---

## 8 · Decisões tomadas

**1. `sugereNo` SUGERE e não navega.** Navegação automática por tempo tiraria a
tela debaixo de quem está executando outra coisa — e o app não sabe se a crise
cedeu. Quem decide é quem vê o paciente.

**2. `goBack` NÃO zera.** O tempo de crise é do paciente, não da navegação.
Zerar ao voltar seria o app medir a si mesmo em vez do evento — exatamente o
erro que o marco `inicioDaCrise` existe para evitar.

**3. Redação do `não sei`** — fixada em §5.3.

**4. Escopo do primeiro corte: SÓ CONVULSÕES.** A estrutura precisa ser provada
onde o requisito é mais exigente, e Convulsões tem quatro marcas, dois marcos
distintos, a troca de marco aos 60 min e o caso do "não sei". **Se a
generalidade falhar, falha ali.**

Anafilaxia e Eclâmpsia entram depois e servem como teste de generalidade — mas
contra estrutura já estável, não junto da estreia dela.
