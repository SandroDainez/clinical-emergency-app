# EMENDAS À ARQUITETURA-MÃE

**Origem:** decisões do autor (Dr. Sandro Dainez) posteriores ao documento.
**O que este arquivo é:** o registro do que mudou **depois** que
[`ARQUITETURA-MAE.md`](./ARQUITETURA-MAE.md) foi escrito.

⚠️ **NÃO MISTURAR COM O ORIGINAL.** Mesma disciplina dos outros pares: o
documento é registro histórico e não se edita; o que mudou vem **ao lado**, aqui,
e **prevalece** onde houver conflito.

---

## AM-1 · TRAVA NOVA — nenhum nó afirma achado não capturado a montante

Registrada em 2026-08-20, depois de o autor encontrar no fluxo uma frase que
tratava **falta de ar** como fato estabelecido, quando nada no caminho até ali
tinha perguntado isso. **O app estava afirmando o que devia perguntar.**

> **Nenhum nó pode afirmar um achado clínico DESTE paciente que não tenha sido
> capturado em algum caminho a montante.** Ordem, critério e enunciado geral
> sobre a doença **não são** afirmação. A verificação é a mesma análise de
> alcançabilidade da trava da calculadora (§7.9 do original).

### As quatro naturezas — e é a classificação que torna a trava utilizável

A primeira varredura do módulo renal achou **58 ocorrências candidatas**.
Reprovar as 58 seria inútil: 46 não são defeito, e **linter que grita lobo é
linter que ninguém obedece**. Então as naturezas entram como DEFINIÇÃO:

| natureza | exemplo | reprova? |
|---|---|---|
| ordem | "colha gasometria", "meça a diurese" | não — manda fazer, não afirma |
| critério | "conta como evidência de DRC:", "as seis:" | não — ensina o que contaria |
| geral | "a creatinina sobe tarde", "costuma dar" | não — fala da doença |
| **afirmação sobre ESTE paciente** | "com a glicemia basal abaixo de…" | **sim** |
| **vinheta** | "um paciente lúcido, comendo e sem dispneia…" | **sim** |

### A quinta natureza — VINHETA (acrescentada pelo autor em 2026-08-20)

A trava nasceu parando na quarta, e o buraco estava declarado: a frase que
originou tudo — *"creatinina de 4 num paciente lúcido, comendo e sem dispneia
costuma ser crônica"* — não afirma nada sobre ninguém em particular e passava
limpo. A distinção que fecha o buraco é do autor:

> **Enunciado geral fala de VARIÁVEIS e da doença; vinheta descreve ALGUÉM.**

VINHETA é o enunciado que introduz um **sujeito clínico** — paciente, doente,
caso, "um homem de 70 anos" — com **achados pendurados nele**. Quem lê com o
paciente na frente lê a vinheta como descrição do paciente que está na frente:
é a forma mais fácil de contrabandear pressuposição para dentro de um texto que
parece didático.

⚠️ **Ela reprova mesmo com marca de enunciado geral** ("costuma ser"), porque era
justamente essa combinação que escapava.

**A correção é reescrever por variáveis**, e a trava não proíbe ensinar:
*"um paciente anúrico há 12 h já é estágio 3"* → *"anúria de 12 h já é estágio
3"*. Mesma informação, sem gente inventada.

Duas ocorrências foram encontradas e corrigidas ao acrescentá-la — a segunda
ninguém tinha visto: *"bexiga cheia com o paciente sem urinar"* virou *"bexiga
cheia sem diurese"*.

### A correção, quando reprova

Uma de duas, e o critério é o que já vale no app:

- o achado **muda o que se faz nos próximos minutos** → vira **pergunta**, com as
  três saídas (sim · não · não sei, me guie pelos sinais);
- **não muda** → a frase **sai**.

⚠️ **Nenhuma delas vira texto condicional** ("se houver falta de ar…"). Isso é a
poluição já reprovada, em roupa nova.

### Onde está

`scripts/valida-pressuposicao.cjs`, rodando em `test:all`. Hoje cobre o módulo
renal; cada árvore entra quando migra para o formato novo.

⚠️ **O QUE ELA NÃO PEGA, DECLARADO:** a detecção da quarta natureza é por FORMA
da frase — posse ("dele"), estado declarado ("o paciente está…"), valor tratado
como em mãos ("com a glicemia abaixo de…"). **Forma nova de afirmar passa
batido.** E há um caso importante que ela não pega por desenho: a frase geral que
descreve um paciente hipotético ("creatinina de 4 num paciente lúcido, comendo e
sem dispneia costuma ser crônica") — ela não afirma nada sobre ninguém, mas
**funciona como se o app soubesse**, e foi assim que o defeito original chegou à
tela. Esse continua sendo trabalho de leitura, e a trava não substitui o olho.

## AM-2 · A §7.8 (fonte por nó) virou PORTÃO

O original já listava "atribuição de fonte no nível do módulo quando as
recomendações têm origens diferentes" como trava. Em 2026-08-20 ela deixou de ser
pendência e passou a ser **portão**: **nenhum módulo novo entra sem campo de
fonte por nó.**

O defeito que a promoveu: o rodapé "KDIGO 2012" aparecia embaixo das doses de
cálcio, insulina e salbutamol, que vêm do módulo de Eletrólitos. O rodapé saiu; o
campo por nó ainda não existe.

## AM-3 · A FORÇA DA AFIRMAÇÃO — campo novo, ao lado de `fonte`

Registrada em 2026-08-20, por ordem do autor:

> *"Vocês estão começando a separar verdade fisiológica, prática clínica
> aceitável e recomendação formal de guideline. Eu manteria essa distinção em
> todo o repositório."*

⚠️ **Isso já estava na especificação do renal, §20** — *"diferencie: recomendação
estabelecida; prática razoável; evidência limitada; decisão dependente do
contexto"* — e ficou como **intenção em prosa por meses**. Prosa não se cumpre
sozinha: virou campo.

### Por que `fonte` não bastava

`fonte` responde **de onde veio**; não responde **que tipo de afirmação é**. Na
mesma tela e com a mesma aparência conviviam *"5 golpes nas costas + 5
compressões abdominais"* (AHA 2025, Classe 1, Nível A) e *"furosemida pode
aumentar a excreção urinária de potássio"* (plausibilidade fisiológica, sem
estudo de eficácia no agudo). **As duas têm fonte. O usuário sem experiência não
tinha como distinguir** — e ele é a população-alvo.

### O campo

| força | exige |
|---|---|
| `recomendacao_formal` | `fonte` + **classe/grau literal da fonte** |
| `pratica_aceita` | `fonte` + tipo do documento (consenso, painel, revisão, bula) |
| `mecanismo_fisiologico` | a razão fisiológica **e** a lacuna de evidência, escritas |

E `contextoDaFonte`, **obrigatório quando o contexto original da fonte difere do
nó** — população, cenário, agudo × crônico. ⚠️ **É o campo que existe por causa
do erro mais repetido do projeto:** pH < 7,0 vindo da cetoacidose, 126 mg/dL
vindo do diagnóstico de diabetes em jejum, UKKA 7.1 vindo da hipercalemia
crônica. Nenhum linter julga transposição semanticamente — mas **exigir o campo
obriga quem escreve a olhar**, e o que se declara, se confere.

### A consequência visual não é opcional

Os três níveis **parecem diferentes na tela** (`selo-de-forca.tsx`), com o design
system existente: cor `primary` na recomendação formal, `textSecondary` na
prática aceita, `warning` com fundo no mecanismo fisiológico. **A lacuna de
evidência e o `contextoDaFonte` aparecem junto da ação, não atrás de um toque.**
Campo que só o desenvolvedor vê não corrige nada.

### A trava, e o que ela NÃO promete

`test:forca-da-afirmacao`: conduta sem `procedencia` reprova; `recomendacao_formal`
sem classe/grau reprova. ⚠️ **Ela não julga se a força está CERTA** — isso é
leitura de fonte, e é do médico.

⚠️ **E a pendência é DECLARADA, não silenciosa:** `auditoria/forca-pendente.json`
lista, com motivo, cada conduta ainda sem classificação. Ordem do autor: *"não
invente a força de nenhuma conduta; onde não estiver claro, marque como pendência
e pare"*. Hoje: **27 condutas no renal · 6 classificadas · 21 pendentes com
motivo**.


## AM-4 · O quarto valor, e as duas naturezas que não declaram força

Registrado em 2026-08-20, no mesmo dia da AM-3 e por causa dela: a primeira
implementação tratava TODO nó de ação como afirmação clínica, e isso produziria
declaração falsa em três lugares.

### `definicao` — porque definição não se gradua

> Uma diretriz não RECOMENDA que o estágio 3 seja o estágio 3 — ela ESTABELECE.
> Não se discorda de uma definição: adota-se ou não.

Exige **fonte + VERSÃO**, e **não exige** classe/grau — pedir uma classe que a
fonte não dá seria inventar procedência.

⚠️ **E o risco dela é outro:** não é evidência fraca, é **versão desatualizada**.
Por isso o campo obrigatório é a versão, e é ela que aparece na tela. Liga direto
na **E-9**: a KDIGO 2026 segue draft, e no dia em que mudar o estadiamento, é
este campo que denuncia o app.

`estagio_kdigo` · `definicao` · KDIGO 2012 · sem grau.

### `transicao` — porque procedência duplicada é como módulos divergem

Nó que só roteia para outro módulo (`trata_choque`, `trata_congestao`) não faz
afirmação própria. A força é a das condutas do módulo de destino, e repeti-la
aqui criaria **duas declarações da mesma coisa** — que é exatamente o mecanismo
pelo qual dois módulos divergem com o tempo.

⚠️ **A trava reprova nos dois sentidos:** transição sem força passa; transição
QUE DECLARA força reprova, com a frase *"ou é conduta, ou não é"*.

### `organizacao_do_atendimento` — porque exigir força produziria mentira

"Acionar a nefrologia", "colher o exame", "abrir a prescrição das últimas 72 h"
não são recomendações graduadas: são o fluxo do atendimento. **Exigir força delas
produziria declaração falsa — o defeito que o campo existe para impedir.**

### O que a reclassificação mostrou

Das 21 pendências, **8 não eram pendência**: 1 definição, 2 transições, 5
organização. **Sobraram 13 afirmações clínicas de verdade sem força declarada** —
e essas são do autor.

---

## AM-5 · VETOR É SVG, IMAGEM CLÍNICA É RASTER — E RASTER É AFIRMAÇÃO CLÍNICA

**Decisão permanente do autor, 2026-08-21.** Não é convenção de conversa: é regra
de arquitetura, com consequência de conteúdo clínico. Ver também `PD-11`.

### §1 · Todo elemento vetorial é SVG

Ícones, traçados **esquemáticos** de ECG, setas, diagramas, elementos do design
system. Sem exceção — é o formato que escala sem borrar, pesa pouco e aceita cor
do tema.

### §2 · ⚠️ NUNCA converter imagem clínica real para SVG

ECG real, ultrassom, radiografia, fotografia — **qualquer imagem cujo diagnóstico
esteja na TEXTURA** permanece em raster apropriado.

**A razão não é estética, é de veracidade:** vetorizar uma dessas **inventa traços
que a imagem original não tem**. O vetorizador tem de decidir onde a linha começa
e termina; num ECG real, essa decisão é justamente o achado. O ruído de base, a
espessura do traço, a granulação do ultrassom — o que o traçador chamaria de
"sujeira para limpar" é o que o médico está olhando.

É a mesma família do que já vale para texto neste projeto: **não preencher por
suposição**. Uma curva inventada é uma dose inventada com outra aparência.

### §3 · SVG embutido como componente, herdando o tema

Onde possível, `stroke` e `fill` em `currentColor` ou em token do design system —
**nunca hexadecimal cravado**. Assim claro e escuro funcionam sem duas versões do
arquivo, e a paleta muda em um lugar só.

⚠️ **"Onde possível" tem um limite honesto, e ele está medido:** os **31 ícones de
módulo** em `assets/emoji/*.svg` são ilustrações multicoloridas — **31 de 31 usam
hexadecimal, 0 usam `currentColor`**. Forçar `currentColor` neles apagaria a
ilustração. A regra vale para **vetor de interface e de esquema clínico**, que é
onde a cor carrega sentido de tema; a ilustração decorativa fica fora, declarada,
em vez de fingir conformidade.

O precedente correto já existe: `design-system/tracado-de-ecg.ts` recebe a cor
como parâmetro e o traçado é sintetizado com ela.

### §4 · ⚠️ IMAGEM CLÍNICA RASTER É AFIRMAÇÃO CLÍNICA

Um ECG real na tela diz **"é assim que se parece"** — e isso é conteúdo médico
exatamente como uma dose é. Portanto:

- carrega **fonte**, **procedência** e **LICENÇA**;
- passa pelo **mesmo campo de força** das condutas (`ProcedenciaDaConduta`);
- **imagem sem procedência não entra**, pela mesma razão que dose sem fonte não entra.

A licença entra na lista porque é o único item que não é clínico e ainda assim
bloqueia: um ECG correto e bem citado, sem direito de uso, não pode ser publicado.

⚠️ **Universo hoje: ZERO.** Não há nenhuma imagem clínica raster no app — os 10
arquivos em `assets/images/` são ícone, splash e logotipos. A trava
`test:imagem-clinica` é **fechada por padrão**: ela não diz "está tudo certo", ela
**reprova a primeira imagem que entrar sem declaração**. Trava de universo zero que
diz "✅ nenhuma irregularidade" é o falso verde que este projeto já pagou três vezes.

### §5 · TODO ASSET SVG DECLARA COMO NASCEU (2026-08-21)

```
origem: 'desenhado'  — construído a partir de descrição, sem imagem de base
      | 'derivado'   — traçado, vetorizado ou decalcado sobre imagem existente
                       (e aí exige a procedência e a LICENÇA da imagem de base)
```

⚠️ **Continua não verificável por script** — nenhum programa distingue um SVG
desenhado de um SVG traçado sobre uma fotografia; a diferença está na intenção de
quem o produziu, não nos bytes.

**O que a declaração muda não é a verificabilidade — é o custo de violar.** Antes,
decalcar um ECG real e chamá-lo de ícone era **silêncio**: nada no repositório
dizia o contrário. Agora exige uma **afirmação falsa**, escrita, num arquivo
versionado — e afirmação escrita alguém confere depois.

É a mesma conversão do `contextoDaFonte`: **o que não se mede, se declara; e o que
se declara, alguém pode conferir depois.**

A trava `test:origem-vetor` **não julga se a declaração é verdadeira**. Ela reprova
**asset sem declaração**, e diz no cabeçalho que a veracidade é do autor.

**Registro:** `auditoria/origem-dos-vetores.json` · **Universo hoje:** 33 vetores
(31 arquivos `.svg` + 2 embutidos em código), todos declarados `desenhado`.

✅ **`autoria` / `quem` / `licenca` — acréscimo do agente, CONFIRMADO pelo autor em
2026-08-21.** O eixo de duas pontas responde *"foi traçado sobre imagem?"* — não
responde *"quem desenhou"*, que é de onde a licença pende. Os 31 ícones são arte de
**terceiro** (Noto Emoji, Google, Apache 2.0). Sem esse campo, um asset de terceiro
passaria como `desenhado` sem que a licença aparecesse em lugar nenhum. A trava só os
exige de quem se declara `terceiro`.

✅ **AS 33 ENTRADAS FORAM CONFIRMADAS PELO AUTOR** — Dr. Sandro Dainez, 2026-08-21.
Ele leu e confirmou os dois julgamentos: arte vetorial original não é traçada sobre
imagem (e o SVGO otimiza caminho existente sem criar traço), e os dois arquivos de
código são `desenhado` de autoria própria. O `declarado_por` de cada entrada nomeia
quem responde por ela — que é o ponto inteiro da regra: **declaração de quem não
responde por ela não é declaração.**

#### ⚠️ TRÊS EIXOS INDEPENDENTES, NÃO CAMPOS CONCORRENTES

```
origem            COMO o vetor nasceu     desenhado | derivado
autoria           quem fez o ARQUIVO      propria | terceiro
arte_de_terceiro  de onde vem a ARTE      true | false     ← é ESTE que obriga a licença
quem              de quem é a ARTE contida
licenca           sob que direito essa arte pode ser usada
```

**"Arquivo nosso, arte de terceiro" não é contradição — é COMPILAÇÃO**, e vai
acontecer toda vez que o app empacotar asset de fora.

⚠️ **O buraco que isto fechou, medido em 2026-08-21:** a exigência de licença
pendurava na **autoria**. `autoria: "propria"` + arte de terceiro + **licença
vazia passava VERDE** — e quem lesse "autoria: propria" daqui a um ano concluiria
que **não há atribuição a preservar**, quando a Apache 2.0 exige reter o aviso na
distribuição. A regra agora é: **arte de terceiro exige licença, independente da
autoria do arquivo.**

⚠️ **E por que um campo novo em vez de ler o `quem`:** adivinhar pelo nome escrito
em `quem` se a arte é de fora seria medir a **redação** em vez do fato (R-87).
`arte_de_terceiro` é declaração explícita — e declaração é o que esta trava confere.

A trava também reprova a **contradição entre os eixos**: arquivo feito por
terceiro com arte declarada como não-de-terceiro.

⚠️ **A ressalva que originou tudo isto, agora no esquema em vez de numa nota:** `design-system/desenho-do-modulo.ts`
ficou com **autoria própria** — o arquivo é nosso, é compilação, nada nele foi traçado.
Mas **a arte compilada continua sendo do Noto sob Apache 2.0**, e é este o arquivo que
o app REALMENTE desenha. Por isso `quem` e `licenca` seguem preenchidos ali mesmo com
autoria própria: a licença acompanha a arte, não o formato em que ela é guardada.

---

## AM-6 · CONTEÚDO INCORPORADO — autoria do arquivo ≠ procedência do conteúdo

**Decisão permanente do autor, 2026-08-21.** ⚠️ **Não é ajuste do registro de
vetores: é o modelo que vale para TODO conteúdo incorporado daqui para frente**,
incluindo imagem clínica raster quando ela existir. Ver `PD-12`.

### Os campos

```
autoria      quem criou o ARQUIVO/COMPONENTE no nosso repositório   propria | terceiro
procedencia  origem do CONTEÚDO VISUAL incorporado                  propria | terceiro
quem         de quem é esse conteúdo
licenca      a licença que autoriza usá-lo
```

**Um arquivo PODE ser nosso e conter arte de terceiro.** Nesse caso, **atribuição e
licença continuam OBRIGATÓRIAS**. Não é contradição — é compilação, e vai acontecer
toda vez que o app empacotar conteúdo de fora.

### A regra da trava

> **Procedência de terceiro exige `quem` e `licenca` — independentemente da autoria
> do arquivo e de `declarado_por`.**
>
> ⚠️ **Assinatura não substitui conformidade.**

### O buraco que isto fecha, medido antes de mexer (2026-08-21)

A exigência pendurava na **autoria do arquivo**. `autoria: "propria"` + conteúdo de
terceiro + **licença vazia passava VERDE**, com o `declarado_por` assinado pelo
autor. Quem lesse "autoria: propria" daqui a um ano concluiria que **não há
atribuição a preservar** — e a Apache 2.0 exige reter o aviso na distribuição.

⚠️ **`procedencia` é ENUM, não prosa.** Adivinhar pelo nome escrito em `quem` se o
conteúdo é de fora mediria a **redação** em vez do fato (R-87).

### Por que a imagem clínica é o caso extremo

Numa imagem clínica o arquivo é **quase sempre nosso** — recorte, anotação,
montagem — e o conteúdo é de **terceiro**: do serviço, do paciente, do banco de
imagens. Pendurar a licença na autoria deixaria a atribuição cair **exatamente onde
ela mais importa**. Um ECG real recortado por nós continua sendo o traçado de outra
pessoa.

### Aplicação hoje

| conteúdo | autoria | procedência | licença |
|---|---|---|---|
| Noto Emoji (31 ícones + o componente que os desenha) | **própria** | Google/Noto | Apache 2.0 |
| `tracado-de-ecg.ts` — sintetizado por gaussianas, sem copiar nem traçar | **própria** | **própria** | próprio |

**Travas que já aplicam o modelo:** `test:origem-vetor` (33 vetores) e
`test:imagem-clinica` (fechada por padrão, universo zero).

---

## AM-7 · EM CALCULADORA, CÁLCULO E INTERPRETAÇÃO DECLARAM PROCEDÊNCIA SEPARADAMENTE

**Decisão do autor, 2026-08-21.** ⚠️ **Registrada como emenda e como PORTÃO — não
implementada nesta rodada.**

### A regra

> **A fonte da fórmula não cobre a faixa, a cor nem a conduta.**
>
> **Limiar de interpretação sem fonte própria não pode renderizar rótulo clínico**
> — mostra o número calculado e diz que a faixa não tem fonte declarada.

### O defeito de fundo

Uma calculadora mistura **duas coisas com procedências diferentes e as apresenta
como uma só**:

- **o cálculo** — a fórmula. Tem fonte, é verificável, e em geral é a parte certa.
- **a interpretação** — a faixa, a cor, o rótulo, a frase de conduta que aparece
  junto do resultado. **É afirmação clínica**, e hoje viaja de carona na fonte da
  fórmula.

Cockcroft-Gault tem fonte. **"TFG < 60 = doença renal crônica" é outra afirmação, de
outra fonte** — e aparece na mesma tela com o mesmo peso visual.

### É a regra B, ainda não aplicada às calculadoras

Nas árvores isto já foi resolvido: uma tela pode afirmar coisas de forças
diferentes, e cada afirmação declara a sua (`DeclaracaoDeAfirmacao`). Nas
calculadoras, a referência é **por ferramenta** — `clearance-creatinina` declara
*três* fontes para *sete* limiares, e nada diz qual sustenta qual.

**Medido em 2026-08-21:** 15 ferramentas · **148 limiares** · **0 com fonte no nível
do limiar** (D-74).

### ⚠️ O PORTÃO

**Nenhuma calculadora nova entra sem isso** — mesma regra que valeu para `fonte` por
nó (AM-2). As existentes entram na fila por consequência: primeiro as **12 de classe
A**, que mudam dose e intervalo de antibiótico.
