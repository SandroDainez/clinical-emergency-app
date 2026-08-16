# Auditoria do app de emergências — relatório consolidado

> Gerado a partir de quatro auditorias executáveis mais verificação científica
> dirigida. **Nenhum arquivo do app foi alterado.**
>
> Reproduzir: `npm run audit:inventario`, `audit:estado`, `audit:calculos`,
> `audit:doses`.

---

## 1. O que foi auditado, e o que não foi

| camada do plano | situação | como |
|---|---|---|
| Preparação — inventário | ✅ feita | varredura de 362 arquivos, 13.010 ocorrências |
| C1 — estrutural | ✅ feita | camadas, acoplamento, duplicação, rastreabilidade |
| C2 — científica linha a linha | 🟡 **parcial** | verificação dirigida aos itens de maior risco |
| C3 — consistência entre módulos | ✅ feita | mesma afirmação em arquivos diferentes; dose divergente |
| C4 — doses e cálculos | ✅ feita | 15 ferramentas + 4.320 conversões dose ↔ velocidade |
| C5 — máquinas de estado | ✅ feita | grafo das 19 árvores |
| C6 — simulação clínica | ✅ coberta | 97 testes E2E + 18 verificações ACLS já existentes |
| C7 — usabilidade | ✅ coberta | contraste, alvo de toque e ação primária já sob teste |
| C8 — regressão | ✅ coberta | `npm run test:all` verde |
| C9 — referências | 🟡 parcial | rastreabilidade medida; adequação da citação não |
| C10 — revisão médica | ⛔ **sua** | é decisão médica, não de engenharia |

### Por que a Camada 2 é parcial, e não completa

São **5.752 afirmações de risco crítico**. Verificar cada uma contra a fonte
primária é trabalho de meses de leitura médica, não de varredura. O que fiz foi
priorizar: peguei os números de maior consequência — trombolítico, adrenalina,
antiarrítmico, insulina, volume na sepse, energia de choque — e conferi contra as
diretrizes. O que está confirmado abaixo está confirmado com citação; o que não
foi verificado está listado como não verificado. Não afirmo correção do que não
conferi.

---

## 2. Achados

### 🔴 A-01 · Adenosina com terceira dose que a diretriz não prevê

**Onde:** `acls-tachycardia-tree.ts` — dois lugares.

O app instrui:

> "Adenosina 6 mg IV rápido + flush de 20 mL. Se não reverter: 12 mg; **pode repetir 12 mg**."
> "Adenosina: 6 mg IV rápido + flush → 12 mg → **12 mg**."

O algoritmo *Adult Tachycardia With a Pulse* da AHA (© 2020) diz textualmente:

> "Adenosine IV dose: First dose: 6 mg rapid IV push; follow with NS flush.
> **Second dose: 12 mg if required.**"

Não há terceira dose. O esquema 6–12–12 é o de **2010**; foi retirado nas edições
seguintes.

**Impacto:** o app declara seguir a AHA e ensina um esquema que a AHA já não traz.
Não é dose perigosa em si — é divergência da fonte citada, e num app de consulta
rápida a redação vira conduta.

**Decisão sua:** alinhar à AHA 2020 (6 → 12) ou manter 6–12–12 citando a fonte que
o sustente.

### 🔴 A-02 · Caminho de IA acoplado, contra a decisão arquitetural

**Onde:** `lib/acls-ai.ts`, `components/protocol-screen/acls-ai-assistant-card.tsx`,
`acls-protocol-screen.tsx`, `components/protocol-screen.tsx`,
`supabase/functions/acls-assistant/index.ts` — 17 ocorrências.

Existe assistente de IA (OpenAI, via edge function) importado pela **tela ativa do
PCR**. Está desligado por `EXPO_PUBLIC_ACLS_AI_ENABLED=false`, não removido.

Seu documento proíbe IA "implementada, contratada ou **acoplada**". Desligado por
flag continua acoplado: segue importado, mantido, e volta com uma variável de
ambiente.

**Decisão sua:** remover, ou manter declarado como o ponto de extensão do "Plano B".

### 🟠 A-03 · Calculadoras aceitam valores fisiologicamente impossíveis

**42 ocorrências.** Sem validação de faixa, entrada absurda vira resultado absurdo
com cara de resultado válido:

| ferramenta | entrada | saída |
|---|---|---|
| `clearance-creatinina` | idade 400 anos | **−253 mL/min** |
| `clearance-creatinina` | idade 9999999 | −9.722.085 mL/min |
| `anion-gap` | sódio 0 ou negativo | ânion gap negativo (40 casos) |

Cockcroft-Gault usa (140 − idade): acima de 140 anos o numerador inverte de sinal.
Ninguém digita 400 de propósito — mas digita 40 querendo 4, e o app não reclama de
nada.

**Correção:** faixa fisiológica por campo, recusando fora dela. Não muda fórmula
nem dose.

### 🟡 A-04 · Conteúdo clínico dentro de componentes de tela

**495 ocorrências** em componentes, incluindo doses em
`vasoactive-calculator-screen.tsx` e `electrolyte-calculator-screen.tsx`.

Enquanto a dose morar na tela, atualizar uma recomendação exige caçá-la na
interface, e a mesma informação pode divergir entre tela e protocolo.

### 🟡 A-05 · 2.567 afirmações repetidas em mais de um arquivo

Mesma frase clínica em vários lugares: mudar em um e esquecer o outro é o modo de
falha mais provável deste app. É o argumento central para centralizar conteúdo.

### 🟡 A-06 · Rastreabilidade: 7.880 afirmações de risco alto ou crítico sem citação próxima

Não significa sem fundamento — o arquivo pode citar a diretriz no cabeçalho.
Significa que a afirmação **não é rastreável no lugar onde está**, e a Camada 2
precisa disso para ser viável.

### 🟡 A-07 · Mesmo módulo com dois nomes

`sepse`/`sepsis`, `anafilaxia`/`anaphylaxis`, `avc`/`acidente-vascular-cerebral`,
`rsi`/`isr-rapida`, `eap`/`edema-agudo-pulmao`. Um protocolo aparece dividido em
duas linhas de qualquer relatório, e a auditoria de consistência precisa saber que
são o mesmo.

### 🟢 A-08 · Três escolhas clínicas que não mudam o fluxo

`anaphylaxis:severity_grade` (graus 2 e 3 → mesma conduta),
`coronary:nste_risco` (alto e intermediário → mesma), `dka:bicarbonato` (duas
faixas de pH → mesma).

Clinicamente coerente — grau 2 e 3 de anafilaxia recebem adrenalina IM de todo
jeito. Só confirmar que a escolha fica **registrada** no prontuário, já que não
altera o caminho.

---

## 3. O que foi verificado e está CORRETO

Vale tanto quanto os defeitos: foi medido, não presumido.

| item | app | fonte |
|---|---|---|
| Alteplase no AVC | 0,9 mg/kg · máx 90 mg · bolus 10% · infusão 60 min | AHA/ASA |
| Tenecteplase no AVC | 0,25 mg/kg · máx 25 mg | AHA/ASA |
| Alteplase no TEP | 100 mg em 2 h (10 mg bolus + 90 mg) · 0,6 mg/kg máx 50 mg no colapso | ESC |
| Atropina na bradicardia | 1 mg a cada 3–5 min · máx 3 mg | AHA |
| Amiodarona na PCR | 300 mg → 150 mg | AHA |
| Volume inicial na sepse | 30 mL/kg em 3 h se hipotensão ou lactato ≥ 4 | SSC 2021 |
| Insulina na CAD | 0,1 U/kg/h sem bolus de rotina | ADA |
| Epinefrina na PCR | 1 mg a cada 3–5 min | AHA |

**Estrutura e cálculo:**

- 19 árvores de decisão: **zero** nó órfão, beco sem saída ou transição quebrada;
- 4.320 conversões dose ↔ velocidade de infusão: **fecham em ida e volta** com
  erro < 10⁻⁹;
- dose de trombolítico: peso ausente **bloqueia** o cálculo, teto respeitado,
  bolus + infusão fecham o total, monotonicidade preservada;
- camada de tradução: **zero** dose órfã — a tradução espelha a fonte.

Os quatro auditores foram validados por mutação: com o defeito injetado de
propósito, acusam (21 erros estruturais, 4.320 divergências de conversão).

---

## 4. Plano de correção

Ordenado por risco sobre o paciente, não por esforço.

### Etapa 1 — decisões que dependem de você (bloqueiam o resto)

| # | item | pergunta |
|---|---|---|
| 1 | **A-01** adenosina | alinhar à AHA 2020 (6 → 12) ou manter 6–12–12 com a fonte que sustente? |
| 2 | **A-02** IA acoplada | remover ou declarar como ponto de extensão do Plano B? |

Nenhuma linha de conteúdo clínico muda sem isso.

### Etapa 2 — segurança de entrada (sem tocar em conteúdo clínico)

| # | item | o que fazer | risco da mudança |
|---|---|---|---|
| 3 | **A-03** | faixa fisiológica por campo nas calculadoras; fora da faixa, recusa com motivo | baixo — não altera fórmula |
| 4 | — | teste de propriedade para toda calculadora nova: entrada impossível nunca vira número | baixo |

### Etapa 3 — rastreabilidade (habilita a Camada 2 de verdade)

| # | item | o que fazer |
|---|---|---|
| 5 | **A-06** | vincular cada afirmação de risco crítico a um id de `guidelines_metadata.json` |
| 6 | **A-07** | um nome canônico por módulo, com mapa de equivalência |

Sem o passo 5, auditar 5.752 afirmações críticas é impraticável: não se sabe
contra o que conferir cada uma.

### Etapa 4 — centralização (a maior, e a que mais previne erro futuro)

| # | item | o que fazer |
|---|---|---|
| 7 | **A-04** | tirar dose de dentro de componente de tela |
| 8 | **A-05** | fonte única por afirmação; telas e traduções passam a referenciar |

Feito isto, mudar uma dose passa a ser mudar **um** lugar. É o que impede o modo
de falha mais provável deste app.

### Etapa 5 — auditoria científica completa (com você)

Só depois da Etapa 3. Módulo a módulo, por prioridade medida:

| ordem | módulo | afirmações críticas |
|---|---|---|
| 1 | pcr-adulto | 752 |
| 2 | anafilaxia | 342 |
| 3 | sepse (todas as grafias) | 289 |
| 4 | sepse-antimicrobianos | 254 |
| 5 | vasoativas | 204 |
| 6 | avc | 180 |

---

## 5. O que eu não fiz, e não vou fingir que fiz

- **Não verifiquei 5.752 afirmações críticas uma a uma.** Verifiquei as de maior
  consequência e listei o resto como não verificado.
- **Não julguei adequação de citação** — se a referência citada sustenta a
  afirmação é Camada 9 com as fontes abertas.
- **Não alterei nenhum conteúdo clínico.** Nem o da adenosina, que é o achado mais
  claro: mudar comando clínico é decisão de quem assina o conteúdo.
- **Varredura por padrão tem falso positivo e falso negativo.** Conduta escrita sem
  número não é detectada por nenhuma expressão regular.

---

# 6. FASE 3 — fechada (2026-08-16)

**8 módulos auditados:** Sepse · Síndromes Coronarianas · AVC · TEP · Choque ·
Politrauma · TCE · Abdome Agudo. Com ela, os quatro módulos que estavam sem
cobertura de conteúdo (`acute-abdomen`, `dyspnea`, `politrauma`, `shock`)
deixaram de estar — restando `dyspnea`, que fecha no bloco seguinte.

## ⚠️ O padrão que atravessa as três fases

**Os cinco achados GRAVES da Fase 3 são todos da mesma família: o app AFIRMAVA
uma coisa e FAZIA outra.**

| módulo | o que o texto dizia | o que o app fazia |
|---|---|---|
| AVC | existe janela estendida de 4,5–9 h e para o wake-up com mismatch | mandava TODAS as janelas acima de 4,5 h direto para a trombectomia |
| Politrauma/TCE | meta de PAS estratificada por idade (BTF) | derivação aplicava 110 liso |
| Abdome agudo | diferencial cita volvo de sigmoide **e cecal** | única conduta era a do sigmoide — endoscopia no cecal |
| Abdome agudo | quatro entidades de isquemia mesentérica no diferencial | uma conduta só: revascularização/ressecção, inclusive para a trombose venosa sem peritonite |
| Choque | fluxo com cinco saídas | um "não" errado no obstrutivo era irreversível dentro do grafo |

**Não eram números errados. Eram textos CERTOS com comportamento divergente.**

Isso é o oposto do que se espera de uma auditoria de conteúdo clínico — e é a
razão de a leitura sozinha nunca ter bastado. **Sete dos oito módulos tinham o
texto certo.** Quem auditasse lendo teria aprovado os oito.

O que encontrou foi sempre a mesma coisa: **executar**. Rodar a função de
roteamento e comparar o destino; compor o texto que a árvore entrega e passar
por `tr()`; montar o cenário e ver o que a tela renderiza. Nas três fases, todo
achado grave veio de comparar o que o app DIZ com o que o app FAZ — e a
distância entre os dois não aparece em nenhuma leitura, porque os dois lados,
lidos separadamente, estão corretos.

**Consequência para o resto da auditoria:** trava de texto protege texto. O
comportamento precisa de trava que EXECUTE — foi o que passou a ser padrão a
partir do AVC, e é o que as travas de `avc`, `politrauma`, `tce` e
`abdome-agudo` fazem.

## Números

- **Regras novas:** R-47 a R-58 (12), mais R-15 itens 9, 10 e 13, e os itens de
  checklist 7b e 9b–9f.
- **Travas novas:** 10, entre elas a primeira genérica de tradução composta.
- **`test:all`:** de 41 para 57 passos — e passou a incluir `build:web`, sem o
  qual o e2e validava artefato obsoleto.
- **Dívidas fechadas:** D-1, D-18, parte da D-31.
- **Dívidas abertas:** D-7, D-29, D-30, D-31 (restante), D-34, D-35.

---

# 7. AUDITORIA FECHADA — o balanço (2026-08-16)

**23 módulos clínicos auditados.** Todos os que existem. Nenhum módulo sem
cobertura de conteúdo — eram quatro quando a Fase 3 começou.

---

## 7.1 · A conclusão central: **o app AFIRMAVA e não FAZIA**

**Os achados graves não foram números errados. Foram textos CERTOS com
comportamento divergente** — e é por isso que esta auditoria precisou ser
EXECUTADA, não lida.

| módulo | o que o texto dizia | o que o app fazia |
|---|---|---|
| **AVC** | existe janela estendida de 4,5–9 h e para o wake-up com mismatch | mandava TODAS as janelas acima de 4,5 h direto para a trombectomia — o paciente do WAKE-UP (⅔ sem oclusão de grande vaso) sumia do fluxo |
| **Politrauma/TCE** | meta de PAS estratificada por idade (BTF: ≥ 110 para 15–49 e > 70; ≥ 100 para 50–69) | a derivação aplicava 110 liso — o paciente de 60 anos com PAS 105 estava na meta e era marcado hipotenso |
| **Abdome agudo** | o diferencial cita volvo de sigmoide **e cecal** | a única conduta de volvo era a do sigmoide — o cecal ia para a endoscopia, que resolve 10–15% e perfura |
| **Abdome agudo** | quatro entidades de isquemia mesentérica | uma conduta só — a trombose venosa **sem peritonite**, cujo tratamento é clínico, era mandada à laparotomia |
| **Convulsões** | "esta diretriz EXCLUI a população obstétrica; o fármaco é o sulfato de magnésio" | **estava em COMENTÁRIO** — a gestante e a puérpera percorriam o fluxo comum, e o magnésio nunca aparecia |
| **CAD/EHH** | cita o consenso ADA/EASD **2024** no id, no cabeçalho e nas evidências | carregava **sete números de 2009** |

**Nenhum desses seis aparece em leitura.** Os dois lados — texto e
comportamento — estão corretos quando lidos separadamente. A distância entre
eles só aparece quando se **executa**: rodar a função de roteamento e comparar
o destino; compor o texto que a árvore entrega e passar por `tr()`; montar o
cenário e ver o que a tela renderiza; abrir a fonte e conferir um número que
mudou de versão.

**Sete dos oito módulos da Fase 3 tinham o texto certo.** Quem auditasse lendo
teria aprovado os oito.

> **Consequência de método, e é a regra que sobra:** trava de texto protege
> texto. **Comportamento precisa de trava que EXECUTE** — travessia do grafo,
> chamada da função de decisão, leitura do artefato compilado. Virou padrão a
> partir do AVC.

---

## 7.2 · Os três MISTOS — achado de DESENHO, não três achados

**Em CAD/EHH, Choque e EAP o estado misto estava DESCRITO no texto e AUSENTE
como ramo.**

| módulo | a população | frequência |
|---|---|---|
| **CAD/EHH** | hiperosmolar COM cetose/acidose | **mais de um terço** das crises hiperglicêmicas; mortalidade hospitalar **8%**, contra 5% do EHH e 3% da CAD — a mais letal dos três |
| **Choque** | séptico que sangrou, cardiogênico que vasoplegiou, politrauma com tamponamento, anafilaxia em hipovolêmico | mais de um mecanismo no mesmo paciente é **comum** |
| **EAP** | sepse em cardiopata, pneumonia em FE reduzida, pós-op cardíaco, transfusão maciça em disfunção diastólica | o edema misto é rotina de UTI |

Nos três, o app **sabia da existência** — a frase estava lá, na evidência do
próprio nó que oferecia só duas ou quatro saídas — **e não oferecia o
caminho**. O médico era forçado a escolher um, e os dois lados erram por
OMISSÃO: perde-se o tratamento do mecanismo não escolhido.

**É a família do "afirma e não faz", aplicada a uma POPULAÇÃO INTEIRA em vez de
a uma conduta.** E é o defeito de desenho mais previsível do app: sempre que um
nó binário descreve um estado intermediário na evidência, o estado
intermediário não tem botão.

> ⚠️ **Para quem for escrever o próximo módulo:** antes de desenhar um nó com
> saídas mutuamente exclusivas, pergunte se existe paciente com os dois
> estados. Se existir e você escrever isso na evidência, **ele precisa de
> ramo** — com a conduta do dominante E o que não se abandona do outro lado.

---

## 7.3 · Os quinze achados de INSTRUMENTO — e por que 62 passos verdes não são garantia

**Esta é a parte que ninguém escreveria sobre o próprio trabalho.** Ela existe
para impedir que alguém leia a suíte verde como prova.

### ⚠️ O pior: o e2e validou artefato obsoleto durante toda a auditoria

`test:e2e` rodava contra o `dist/` estático, e o `dist/` era de **9 de agosto —
antes do primeiro commit da auditoria**. **Todo "110 passed" registrado até
então era vazio para qualquer afirmação sobre a UI.** Corrigido acrescentando
`build:web` ao `test:all`; o primeiro build fresco revelou uma falha real na
mesma hora.

### Os outros catorze

| # | o que era | o que significava |
|---|---|---|
| 2 | **v1/v2**: correção do bloco 5H/5T feita na tela v1, produção renderiza a v2 | conteúdo corrigido que **nunca chegou ao usuário** |
| 3 | **D-35**: 45 textos compostos sem tradução, varredura marcando "SEM TRADUÇÃO: 0" | o instrumento **afirmava** cobertura que não existia; 4 casos criados pela própria auditoria |
| 4 | trava satisfeita por **import** (4 ocorrências) | módulo que importava e não usava passava verde |
| 5 | trava satisfeita pelo **comentário que narra o defeito** | a string certa no papel errado |
| 6 | trava rodando sobre **lista vazia** (vacuidade) | verde que não significava nada |
| 7 | trava satisfeita por **menção de procedência** ("o 25–34 vem do protocolo…") | idem, e a mais sutil das quatro |
| 8 | **piso de vacuidade colado na contagem** (30 com 30) | alarme contra correção legítima, não contra leitura quebrada |
| 9 | **`valida-alcancabilidade` não alcançava `lib/`** | a trava que impede conteúdo órfão era cega para metade do app |
| 10 | **`valida-prazos` dizia que Convulsões "não tem cronômetro"** | o módulo com 36 conferências de cronômetro executado |
| 11 | trava lendo **um dos dois textos** do relógio | metade do que a tela mostra ficava fora |
| 12 | trava exigindo **literal que a diretriz aposentou** | empurrava o autor a piorar o texto para satisfazê-la |
| 13 | trava com **conferência de posição que não protegia nada** | removida (R-61) |
| 14 | **trava de uma hora** codificando a leitura errada e barrando a correção | R-44: a trava nasce com a interpretação do autor |
| 15 | **mutações que passavam sem criar o defeito** (5 ocorrências) | o controle verde não provava o que se pensava |

> **A regra que sai daí (R-59):** o app ganha uma segunda forma de fazer a
> coisa, e a trava continua conhecendo só a primeira. Aconteceu quatro vezes —
> literal × interpolação, texto cru × compilado, raiz × `lib/`, motor × runtime
> de árvore. **Toda vez que o app ganhar um mecanismo novo, varra as travas
> perguntando quais só conhecem o antigo.**

---

## 7.4 · O que esta auditoria NÃO cobriu

**Escrito para não ser confundido com cobertura completa.**

### Dívidas abertas, com dono declarado

| dívida | o que é | dono |
|---|---|---|
| **D-36** | módulos que citam diretriz recente e carregam números da anterior | ⚠️ **maior risco clínico dos que restam** — o CAD/EHH provou que o padrão existe |
| **D-35** | 24 frases compostas sem tradução em 7 módulos | varredura barata, fecha módulo a módulo |
| **D-38** | exclusões de escopo que vivem só em comentário | varredura barata |
| **D-7** | contrato do contexto do paciente (5 campos sem validação de valor) | infraestrutura |
| **D-30** | 11 engines de registro escritos à mão | arquitetura |
| **D-31** | fatos clínicos sem dono declarado (parcial) | módulo a módulo |
| **D-34** | 6 libs vasoativas ainda por unificar | módulo a módulo |
| **D-37** | relógios de vigilância não modulares — falta evento de "checagem cumprida" | runtime de árvore |

### Pendências de FONTE — declaradas, não estimadas

- **Hidrocortisona na sepse:** o volume de reconstituição não foi escrito
  porque a bula do frasco não foi aberta. O app manda a dose e não inventa o
  preparo.
- **V3R–V4R e V7–V9:** a técnica está escrita; um limiar numérico específico
  espera fonte primária.
- **Janela de observação pós-LAST:** a ASRA recomenda tempos estratificados por
  gravidade, e os valores estão no gráfico do checklist, que não abriu. Uma
  fonte secundária diz 12–24 h. **O app não fixa número.**
- **PaCO₂ 25–34 na 3ª linha do TCE:** número do protocolo institucional citado
  pelo módulo, que não foi aberto em sessão. Mantido, com a monitorização como
  condição e a literatura aberta declarando o piso de 30.

### E o que está fora do escopo desta auditoria por natureza

**A cobertura é de CONTEÚDO CLÍNICO e de TRAVAS.** Não foram auditados:

- **uso real** — nenhum médico usou o app sob observação, e nenhuma decisão
  deste relatório vem de erro observado em plantão;
- **desempenho** — tempo de carga, consumo, comportamento em rede ruim ou
  aparelho antigo;
- **acessibilidade** — leitor de tela, tamanho de fonte, daltonismo (só o
  contraste renderizado tem trava);
- **a versão em espanhol como CONTEÚDO** — a tradução foi conferida quanto à
  EXISTÊNCIA, nunca quanto à correção clínica do texto traduzido;
- **pediatria** — declaradamente fora do app, com trava que impede fragmento
  pediátrico novo;
- **os módulos de consulta e calculadoras**, que têm travas próprias mas não
  passaram pela auditoria módulo a módulo.

---

## 7.5 · Por onde retomar

1. **D-36** — maior risco clínico. Para cada módulo que cite ano de diretriz,
   conferir **um** número que mudou entre versões. Se estiver na versão antiga,
   o módulo inteiro entra em suspeita: a falha é de processo.
2. **D-35 e D-38** — varreduras baratas, com método já escrito.
3. **UI 2.0** — antes de começar, aplicar o **R-59**: varrer as travas
   perguntando quais leem por nome de componente. A migração vai cegar todas
   elas, e o precedente (5H/5T corrigido na v1, produção na v2) já custou uma
   correção que nunca chegou ao usuário.

