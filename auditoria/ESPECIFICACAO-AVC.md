# ESPECIFICAÇÃO — AVC ISQUÊMICO AGUDO (V1)

**Natureza:** contrato **vigente e executável**. Não é documento arquivado, não é
alvo, não é proposta. O que está aqui fechado governa o código quando o código
existir; o que está aberto está marcado como aberto.

> ⚠️ **Por que este carimbo existe.** `auditoria/ARQUITETURA-MAE.md` foi arquivada
> como *alvo* e trazia o aviso "não é uma ordem para executar". Resultado: um
> contrato que ninguém executou. Este documento nasce com a natureza oposta, e a
> diferença é essa linha.

**Estado:** Parte 0 fechada · **Parte 1 completa** (chegada → reperfusão →
destinos) · **Parte 2 escrita, com nove espécies** · Partes 3 a 11 não escritas.

**P-01 e P-02 fechadas pelo autor em 2026-08-28.** A fonte-mãe está declarada
(§0.7) e a nona espécie existe (§2.9).

**Regra de preenchimento, válida para todo o documento:**
nenhum número clínico, dose, contraindicação, janela ou limite é escrito de
memória. Onde o número pertence, há um **slot `F-nn`** dizendo o que falta e qual
fonte deve supri-lo. Slot vazio é honesto; número sem procedência não é.

---

## PARTE 0 — O QUE ESTE DOCUMENTO É

### 0.1 Escopo do AVC V1

**AVC V1 = atendimento emergencial do adulto com suspeita de AVC isquêmico agudo.**

Fora do escopo desta construção, e **deliberadamente não implementados agora**:

- hemorragia intracraniana;
- AVC hemorrágico;
- hemorragia subaracnóidea (HSA);
- população pediátrica — as regras deste documento **não se aplicam
  automaticamente** ao AVC pediátrico, e nenhuma delas deve ser reusada lá sem
  spec própria.

⚠️ **O que "fora do escopo" NÃO significa.** A tomografia precisa reconhecer essas
condições como **saídas clínicas explícitas** — não como ausência de caminho:

| achado da imagem | comportamento do módulo |
|---|---|
| sem hemorragia | continua no fluxo de AVC isquêmico |
| hemorragia intracraniana | **interrompe** o fluxo de reperfusão isquêmica e aponta para o futuro módulo de AVC hemorrágico |
| suspeita de HSA | saída específica, apontando para o futuro fluxo de HSA |

Apontar para módulo que ainda não existe é **destino declarado**, nunca beco sem
saída. Como isso se representa é a **E-09**.

#### Recorte consciente da fonte: a fase pré-hospitalar

**Decidido pelo autor em 2026-08-28 (P-03, alternativa A).**

A fonte-mãe (§0.5) cobre explicitamente da avaliação **pré-hospitalar** ao manejo
intra-hospitalar precoce. **O AVC V1 usa deliberadamente um subconjunto**: o
módulo começa com o paciente **na emergência**.

> **t₀ operacional do módulo = chegada / primeiro contato na emergência.**

⚠️ **O t₀ operacional NÃO substitui os relógios clínicos** — última vez bem,
início observado, reconhecimento dos sintomas e os demais tempos continuam
existindo por si (§1.1). Ele é a referência de **porta** para as métricas de
**F-11**, e nada mais. ⇒ **E-21**

**O que continua entrando, e nunca perde a origem:** informação produzida antes
da chegada entra como **dado observado com procedência explícita** (§1.2e) —
última vez bem apurada pelo pré-hospitalar, horário de reconhecimento, glicemia e
PA pré-hospitalares, pré-notificação, acesso venoso já obtido, e o que mais vier.
**O que não existe no V1 é conduta pré-hospitalar**, não o dado dela.

A alternativa C — abrir o caso a partir da pré-notificação, com o relógio já
correndo antes da chegada — fica registrada na **Parte 9** como **candidata
prioritária de expansão**. Não implementar agora.

### 0.2 A regra do zero — e sua fronteira

`0 = não informado` **não é universal**. Vale para **grandezas clínicas coletadas
por slider**, nas quais o zero inicial representa campo ainda não preenchido:

> idade · peso · altura · PAS · PAD · FC · SpO₂ · FR · glicemia · temperatura ·
> e grandezas equivalentes.

Até a primeira interação do usuário: **`0` = não informado**. Depois da primeira
interação, o valor **existe** no estado clínico — inclusive se o usuário voltar ao
zero, que aí é valor, não vazio.

**Não vale** para escalas, escores e opções categóricas em que zero é resposta
clínica legítima:

> NIHSS total = 0 é válido · item isolado do NIHSS = 0 é válido · mRS = 0 é válido.

São **duas famílias de campo numérico**, com semânticas opostas para o mesmo
dígito. A fronteira é normativa e está registrada como **E-10**.

### 0.3 Entrada numérica

Sem caixa de digitação para valores numéricos comuns. O controle padrão é:

- **slider** como mecanismo primário de ajuste rápido;
- **valor atual claramente visível**;
- **`−` e `+` tocáveis** para ajuste fino, com passo definido **por grandeza**.

```
        −     PAS  198 mmHg     +
        ●━━━━━━━━━━━━━━━━━━━━━━━━━
```

O **primeiro movimento da barra ou o primeiro toque em `−`/`+`** é o que
transforma o campo de "não informado" em informado. A regra não é "arrastar
obrigatoriamente".

### 0.4 Internacionalização

O AVC nasce **PT-BR e ES desde o primeiro commit**. Todo conteúdo exibível ao
usuário passa pela infraestrutura de i18n; tradução **não** é etapa posterior.

Esta especificação continua escrita em português e **não** é duplicada em
espanhol. Comentários técnicos, nomes internos e documentação também não.

### 0.5 A fonte-mãe — e o que ela não autoriza

**Fonte clínica primária vigente do módulo, declarada pelo autor em 2026-08-28:**

> **AHA/ASA 2026** — *Guideline for the Early Management of Patients With Acute
> Ischemic Stroke.* Prabhakaran S, et al. **Stroke**, 2026.
> **DOI** `10.1161/STR.0000000000000513` · **PMID** 41582814.

Governa: avaliação emergencial · suporte inicial · trombólise IV · elegibilidade
e contraindicações · trombectomia mecânica · pressão arterial · glicemia ·
imagem · manejo inicial pós-reperfusão. Registrada em
`auditoria/fontes-vigentes.json` como `aha_asa_avc_isquemico_2026`.

**Complementares permitidas:** ESO, DAWN/DEFUSE-3 e referências brasileiras —
**nunca substituindo silenciosamente a fonte-mãe**. Divergência, ou necessidade
de adaptação à realidade brasileira, é **marcada para decisão do autor**, não
resolvida por quem escreve. ⇒ **E-18**

**Regra permanente de disponibilidade brasileira:**

> Disponibilidade e comercialização brasileiras **não se inferem da guideline
> americana.** Medicamento e apresentação usados no Brasil exigem fonte
> brasileira ou verificação específica de disponibilidade.

⛔ **O que declarar a fonte NÃO autoriza.** Declarar não é possuir. Em
2026-08-28 conferi por busca a existência e os dados bibliográficos da
publicação, e **não obtive o texto**: `ahajournals.org` e
`professional.heart.org` responderam **HTTP 403**. Vale a regra que já está
escrita em `protocols/fontes-verbatim/ACHADOS-SEM-VERBATIM.md`:

> *"Referência bibliográfica não é fonte; texto é. O verbatim tem de sair do PDF
> do documento original, e só então vira conteúdo de tela, com número e grau."*

A pauta de transcrição está aberta em
`protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md`, com um bloco por slot
`F-nn`. **Enquanto ela estiver vazia, nenhum número entra nesta spec.**

⚠️ **Filtro pediátrico na origem.** Esta edição traz também a primeira orientação
pediátrica de AVC da AHA/ASA. O app é adulto (PD-2) e o build reprova dose
pediátrica. Os oito fragmentos pediátricos que já entraram no app entraram por
esta via exata — fonte que cita as duas populações, número copiado junto. A
transcrição filtra **na origem**. ⇒ **E-17**

### 0.6 Como se lê uma regra

Cada regra deste documento carrega quatro campos: **enunciado** · **a necessidade
clínica do AVC que a obrigou** · **como se prova** · **status**.

O campo "como se prova" é escrito **antes** de existir código. É ele que torna a
auditoria das 92 travas uma comparação contra contrato, e não uma opinião.

### 0.7 O que fica proibido até esta spec fechar

Não criar motor, schema, tipos ou componentes genéricos. Não reaproveitar
`core/decision-tree` nem usar `estado-clinico.ts` como base automática — o
conjunto está carimbado `LEGACY_ACLS_RUNTIME` (D-107) e existe apenas para
bradicardia e taquicardia. A generalização acontece por **extração com dois casos
na mão**, nunca por antecipação (Parte 9).

---

## PARTE 1 — O AVC COMO COMPORTAMENTO CLÍNICO

> **Completa em duas passagens.** §1.1 a §1.8 cobrem da chegada ao ponto de
> decisão pós-imagem; §1.9 a §1.11 cobrem reperfusão, destinos e o que fica para
> as partes seguintes.
>
> Esta parte descreve **atendimento**, não telas. Não há nós, não há "passo 1 de
> N", e a ordem do texto **não** é a ordem obrigatória dos acontecimentos.

### 1.1 O momento de entrada

O paciente chega por uma de três vias, e a via muda o que já se sabe antes do
primeiro contato:

| via | o que costuma vir junto | o que costuma faltar |
|---|---|---|
| regulação / pré-notificação | horário, déficit observado em rota, testemunha ao alcance | exame completo, laboratório |
| demanda espontânea / triagem | queixa do próprio paciente ou do acompanhante | horário confiável, testemunha |
| AVC intra-hospitalar | horário quase exato, paciente já monitorizado | contexto prévio, funcionalidade basal |

**O fato que governa tudo é a hora do último-visto-bem** — e ele é o primeiro
lugar onde este módulo já se comporta diferente de uma sequência de páginas:

1. **Não é "hora do início dos sintomas".** Em AVC ao acordar, os dois divergem, e
   é o último-visto-bem que conta.
2. **Pode ser desconhecido, e desconhecido não é vazio.** "Ninguém sabe dizer" é
   uma resposta clínica com consequência própria, diferente de "ainda não
   perguntei". ⇒ **E-02**
3. **Tem procedência.** O horário dito pela esposa que estava na sala não vale o
   mesmo que o horário estimado pelo próprio paciente afásico. ⇒ **E-03**
4. **Não para de correr.** O tempo decorrido é derivado do último-visto-bem contra
   o relógio: **muda de resposta sem ninguém tocar em nada**. É o caso mais puro
   de derivação viva do módulo. ⇒ **E-01**

E há uma quarta hora que não é a mesma coisa que nenhuma das anteriores: a **hora
em que o dado foi registrado**. Um horário anotado às 14h20 sobre um evento das
11h50 são dois instantes distintos, e confundi-los corrompe todo o cálculo de
janela. ⇒ **E-01**

#### Os relógios do módulo

Nenhum deles substitui outro, e o módulo precisa dos cinco ao mesmo tempo:

| relógio | o que marca | de onde vem |
|---|---|---|
| **última vez bem** | último instante em que se sabe que o paciente estava sem déficit | dado observado, com procedência — pode vir de antes da porta |
| **início observado** | quando o déficit foi visto pela primeira vez | dado observado |
| **reconhecimento dos sintomas** | quando alguém entendeu aquilo como AVC | dado observado · ✅ **confirmado pela fonte como relógio de contagem**: §4.6.3 rec. 1 conta janela *"from symptom recognition"* (F-03) |
| **t₀ operacional** | chegada / primeiro contato na emergência | referência de "porta" (**F-11**) |
| **hora de registro** | quando o dado entrou no sistema | automática, nunca informada pelo usuário |

⚠️ **O t₀ operacional é o relógio do serviço, não do paciente.** A janela
terapêutica se conta dos relógios clínicos; porta-imagem e porta-agulha se contam
do t₀. Trocar um pelo outro produz janela errada com aparência de precisão. ⇒
**E-21**

**Ao mesmo tempo — não antes, não depois — corre a estabilização.** Via aérea,
respiração e circulação não são uma etapa que termina para o atendimento
começar: são uma frente que permanece aberta e pode retomar a prioridade a
qualquer instante. ⇒ **E-04**

### 1.2 Os fatos que o médico informa

Inventário do que o médico **observa e informa** nesta fase. Não é ordem de
coleta, não é formulário, e nem tudo estará disponível — a coluna "quando falta"
é parte da especificação, não observação de rodapé.

#### a) Tempo

| fato | natureza | quando falta |
|---|---|---|
| hora do último-visto-bem | dado observado, com procedência | é a incerteza mais cara do módulo — ver 1.3 |
| hora da chegada | dado observado | derivável do registro |
| houve sono entre o último-visto-bem e o achado do déficit | dado observado | muda qual referência temporal se usa |

#### a.1) O que chega de antes da porta

O V1 não tem conduta pré-hospitalar (§0.1), mas recebe **dado** pré-hospitalar —
e ele entra **com procedência explícita, sem nunca perder a origem**:

> última vez bem apurada pelo pré-hospitalar · horário de reconhecimento dos
> sintomas · glicemia pré-hospitalar · PA pré-hospitalar · pré-notificação ·
> acesso venoso já realizado · demais informações relevantes.

**Regra:** dado de antes da porta é **dado observado com procedência
pré-hospitalar**, e assim permanece na trilha. Não vira dado do app, não vira
dado "do médico", e não se confunde com a aferição feita na emergência — que é um
**dado novo**, não uma correção do anterior (§3.4). ⇒ **E-03**

#### b) Estabilidade e grandezas

| fato | família (§0.2) | observação |
|---|---|---|
| PAS · PAD | grandeza (slider, 0 = não informado) | o significado depende do contexto — ver 1.3 |
| FC · FR · SpO₂ · temperatura | grandeza | |
| glicemia capilar | grandeza | é o desvio de rota mais provável de todo o módulo — ver 1.4 |
| peso | grandeza, **com origem** | balança, informado, estimado — a origem muda a confiança da dose ⇒ **E-14** |

#### c) Déficit

| fato | natureza | observação |
|---|---|---|
| déficit focal súbito (suspeita) | dado observado | critério de entrada — **F-13** |
| NIHSS, item a item | escala (0 é resposta válida) | ⇒ **E-10** |
| NIHSS **incompleto** | propriedade do dado composto | incompleto **não é** zero ⇒ **E-13** |
| déficit é incapacitante para *este* paciente | **julgamento**, não cálculo | ⇒ **E-15** |
| funcionalidade basal (mRS prévio) | escala | entra como critério ou como contexto? — **P-05** |

#### d) O que pode impedir a reperfusão

Todo este bloco é **conteúdo pendente de fonte** (**F-07**, **F-10**). O que a
Parte 1 fixa é a **natureza** de cada item, porque é ela que decide o
comportamento do sistema:

- **anticoagulação em uso, e a hora da última dose** — dado observado cuja
  consequência depende de exame que pode ainda não ter voltado ⇒ pendência;
- **cirurgia, trauma, punção ou sangramento recentes** — dado observado que, se
  presente, não se corrige: candidato a **contraindicação não corrigível**;
- **glicemia fora de faixa** — se presente, **corrige-se e reavalia** — candidato
  a **bloqueio corrigível**;
- **PA acima da meta em candidato a reperfusão** — corrige-se: **bloqueio
  corrigível**;
- **plaquetas / coagulograma** — frequentemente **pendência** no momento da
  decisão, não uma resposta.

⚠️ **A distinção não é acadêmica.** "Corrigir e seguir", "esperar o resultado" e
"não vai acontecer" são três comportamentos diferentes do app diante do que, numa
lista de contraindicações impressa, aparece como itens da mesma coluna.

### 1.3 O que o sistema deriva desses fatos

O médico informa fatos; **o sistema deriva consequências** — e nunca o contrário.

**Tempo decorrido desde o último-visto-bem.** Derivado, nunca informado. Muda
sozinho. Quando o último-visto-bem é incerto, o derivado **não** vira um número
otimista: a incerteza é propagada, não resolvida por conveniência. ⇒ **E-01**,
**E-02**

**Janela candidata.** Qual reperfusão ainda é geograficamente possível no tempo
atual. Depende inteiramente de **F-02**, **F-03** e **F-08**, e é
**recalculada**, nunca gravada: gravada, ela envelheceria enquanto o paciente
espera a tomografia.

**Suspeita de simulador de AVC (*mimic*).** A hipoglicemia é o caso que muda o
atendimento inteiro, e ela tem uma propriedade rara: **é corrigível, e a correção
obriga a reavaliar o próprio déficit** que motivou a suspeita de AVC. — **F-06**

**Gravidade.** Derivada do NIHSS. Com a ressalva do **E-13**: escala incompleta
produz gravidade incompleta, não gravidade baixa.

**O estado da PA — e aqui está o exemplo central do princípio 15.**

> **A mesma PA 198/110 tem dois significados clínicos opostos** conforme o
> paciente esteja ou não sendo considerado para reperfusão. Num candidato, é um
> **bloqueio corrigível** que precisa cair antes da terapia. Em quem não vai
> reperfundir, a conduta é regida por outra lógica inteiramente.
>
> Nem o número mudou, nem o paciente mudou. Mudou o **contexto que qualifica o
> número** — e o contexto pode virar por causa de um relógio que passou de uma
> janela, ou de uma imagem que ainda nem voltou. ⇒ **E-06**, **F-04**, **F-05**

**Elegibilidade preliminar.** Antes da imagem, **nada de reperfusão é
autorizado** — não porque falte um campo, mas porque existe um bloqueio que
governa uma **classe inteira de ações** até que a hemorragia seja excluída. ⇒
**E-08**

**Pendências.** Peso não informado, coagulograma não resultado, NIHSS incompleto,
horário incerto. Todas nascem aqui e **nenhuma delas pode morrer na troca de
tela**. ⇒ **E-07**

### 1.4 As ações desta fase, e o que cada uma muda

| ação | o que exige | o que muda no estado |
|---|---|---|
| estabilizar (via aérea, ventilação, circulação) | nada — precede tudo | pode suspender qualquer outra frente ⇒ **E-04** |
| obter acesso venoso e coletar laboratório | acesso | **abre pendências** (coagulograma, plaquetas) |
| medir glicemia | glicosímetro | pode instaurar ou **remover** um bloqueio |
| **corrigir hipoglicemia** | glicemia informada e abaixo do corte (**F-06**) | ⇒ ver quadro abaixo |
| tratar a PA para permitir reperfusão | contexto de candidatura + meta (**F-04**) | rebaixa um bloqueio corrigível |
| **registrar Código AVC acionado** | nada além do toque do médico | grava a hora na trilha — ver quadro abaixo |
| levar à tomografia | estabilidade mínima | **é o que destrava a decisão de 1.8** |

> **O quadro que o princípio 5 exige, percorrido inteiro:**
>
> glicemia informada abaixo do corte → instaura **bloqueio corrigível** e levanta
> suspeita de *mimic* → **ação de correção** → **nova glicemia é obrigatória**, e
> o valor antigo **não é sobrescrito**: os dois coexistem com a ação entre eles →
> a nova glicemia libera o bloqueio → **e obriga a reavaliar o déficit**, porque a
> razão de suspeitar de AVC pode ter desaparecido junto com a hipoglicemia.
>
> Uma ação corrigiu um dado, o dado mudou um estado derivado, e o estado derivado
> **reabriu uma avaliação que já tinha sido feita**. Isto é o comportamento
> mínimo do módulo, não um caso de borda. ⇒ **E-05**

#### O Código AVC — duas entidades, não uma

**Decidido pelo autor em 2026-08-28 (P-04, alternativa B).** O app **registra** o
acionamento; **não aciona** sistema externo nenhum.

| entidade | espécie | quem produz |
|---|---|---|
| **Código AVC indicado** | estado derivado / ação sugerida | o sistema |
| **Código AVC acionado** | **ação**, registrada explicitamente pelo médico | o médico |

Ao registrar, a hora entra na trilha **automaticamente**:

```
        Código AVC acionado — 20:14
```

⚠️ **O avanço do fluxo não aciona nada.** Nenhuma tela adiante pode significar,
implicitamente, que a equipe foi chamada. Ação só existe quando alguém a
registra — e isto vale para toda ação do módulo, não só para esta. ⇒ **E-20**

**Não entra nesta versão:** telefone institucional, WhatsApp, ramal, integração
externa, configuração por hospital, lista de profissionais. O objetivo é
**registrar o evento** e permitir derivar métricas temporais depois.

### 1.5 As reavaliações, e o que as dispara

Reavaliação **não é** repetir a pergunta: é a mesma avaliação, refeita porque
algo a invalidou. Três gatilhos, e nenhum deles é o médico lembrar:

1. **Ação executada** — corrigiu a glicemia, mede de novo e reavalia o déficit;
   tratou a PA, mede de novo.
2. **Tempo decorrido** — a janela que estava aberta fechou enquanto se esperava.
   O gatilho aqui não é um dado novo: **é a ausência de dado novo com o relógio
   correndo.** ⇒ **E-01**
3. **Dado novo que contradiz um derivado** — chega a testemunha que dá um horário
   diferente; volta o exame que muda o peso da anticoagulação.

⚠️ **O que a reavaliação não pode fazer é apagar o que veio antes.** PA 198/114 →
tratamento → PA 168/96: os **dois valores e a ação entre eles** permanecem
registrados, com suas horas. Sem isso, "a PA está em 168/96" é indistinguível de
"a PA sempre esteve em 168/96" — e a segunda leitura muda a conduta.

### 1.6 As frentes que correm em paralelo

Nesta fase há, no mínimo, **cinco frentes simultâneas**:

```
  estabilização (ABC) ─────────────────────────────────────────▶  permanente
  relógio / janela    ─────────────────────────────────────────▶  corre sozinho
  glicemia            ──▶ correção ──▶ reavaliação do déficit
  déficit / NIHSS     ──▶ gravidade ──▶ (incapacitante? julgamento)
  PA                  ──▶ significado depende da candidatura ◀── (contexto)
  laboratório         ──▶ pendência ─────────────────▶ resolve depois
                                  ╲
  imagem              ─────────────╲──────────▶  ponto de decisão (1.8)
```

Nenhuma delas é "o próximo passo". A pergunta "qual é o próximo nó?" **não tem
resposta** neste módulo — e é por isso que a árvore de ponteiro único falhou no
app anterior. ⇒ **E-11**

E a consequência que o princípio 7 impõe: **a pendência não pode aprisionar o
médico na tela em que nasceu.** O coagulograma pendente precisa continuar
visível enquanto o paciente vai para a tomografia. ⇒ **E-07**

### 1.7 O que não pode atrasar o quê

Regras de precedência **temporal** — separadas das de ordem lógica, porque são
elas que sobrevivem à pressa:

1. **Estabilização não espera nada.**
2. **A imagem não espera resultado de laboratório** — salvo exceção
   definida por fonte (**F-07**, **F-10**).
3. **Terapia tempo-dependente não espera investigação completa.** É a regra da
   `ARQUITETURA-MAE` §3 que este módulo herda por mérito clínico, não por
   herança de documento.
4. **A correção de hipoglicemia não espera a imagem.**
5. **Métricas de porta-imagem e porta-agulha** — **F-11**.

### 1.8 O primeiro grande ponto de decisão: a imagem voltou

Aqui termina a primeira passagem. A tomografia produz **três saídas**, e duas
delas **saem do módulo**:

```
                    ┌─────────────────────────────────┐
                    │   TC de crânio sem contraste    │
                    └────────────────┬────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
  sem hemorragia            hemorragia intracraniana        suspeita de HSA
        │                            │                            │
  segue isquêmico          INTERROMPE reperfusão          saída específica
        │                  → futuro módulo AVCh           → futuro fluxo HSA
        ▼                     (não existe ainda)            (não existe ainda)
  ┌───────────────────────────────┐
  │  reperfusão IV   ║  avaliação │   ← em PARALELO, não em sequência
  │  (F-02, F-09)    ║  para TMV  │
  │                  ║  (F-08)    │
  └───────────────────────────────┘
```

Três coisas ficam fixadas neste ponto:

**1 · A exclusão de hemorragia é o que libera uma classe inteira de ações.** Não
é um campo a mais: é a condição que mantinha todo o ramo de reperfusão em
bloqueio. ⇒ **E-08**

**2 · As duas saídas para fora do módulo precisam ser destino, não vazio.** O
paciente com hemorragia **não pode cair num estado sem comportamento** porque o
módulo de AVC hemorrágico ainda não foi construído. Como se representa um destino
que aponta para um módulo inexistente é **E-09** — e ela levanta uma questão de
vocabulário que a Parte 2 vai ter de responder: **as oito espécies do princípio
16 não incluem "destino"**. Ver **P-02**.

**3 · Trombólise IV e avaliação para trombectomia não são sequenciais.** Iniciar
a primeira não pode bloquear, atrasar nem encerrar a segunda. É o exemplo que o
princípio 6 nomeia, e é o teste mais duro da Parte 5. ⇒ **E-11**

### 1.9 Depois da imagem limpa: duas frentes, não duas etapas

Excluída a hemorragia, abrem-se **duas frentes simultâneas** — e a palavra é
frentes, não etapas. Iniciar a primeira **não pode** bloquear, atrasar nem
encerrar a segunda. ⇒ **E-11**

```
  ┌──────────────────────────────┐        ┌──────────────────────────────┐
  │  REPERFUSÃO INTRAVENOSA      │        │  AVALIAÇÃO PARA TROMBECTOMIA │
  │  F-02 janela                 │        │  F-08 elegibilidade          │
  │  F-03 janela estendida       │  ║║║   │  F-16 imagem vascular        │
  │  F-07 contraindicações       │  ║║║   │  disponibilidade local       │
  │  F-09 fármaco e dose/peso    │        │  → DESTINO se não houver EVT │
  │  F-04 meta de PA antes       │        │                              │
  └──────────────┬───────────────┘        └──────────────┬───────────────┘
                 │                                        │
                 └──────────────┬─────────────────────────┘
                                ▼
              F-15 · manejo inicial pós-reperfusão e monitorização
```

**O que a Parte 1 fixa aqui é comportamento, não número.** Todos os valores estão
em slot: nenhum deles pode ser escrito antes da transcrição verbatim (§0.5).

**a) A candidatura é derivada e volátil.** "É candidato a trombólise IV" não é um
campo que alguém marca: é derivado do tempo (que corre), da imagem (que voltou),
das contraindicações (que podem estar pendentes) e da PA (que pode estar em
bloqueio corrigível). Muda sozinha quando o relógio cruza a janela. ⇒ **E-01**

**b) É a candidatura que dá significado à PA.** O exemplo do princípio 15 fecha
aqui: a mesma PA que era um **bloqueio corrigível** no candidato deixa de sê-lo no
instante em que a janela fecha — e passa a ser regida por outra lógica (**F-04**
× **F-05**). O número não mudou; o contexto que o qualifica, sim. ⇒ **E-06**

**c) O peso vira caminho crítico.** Dose por peso (**F-09**) transforma um dado
que era conveniente em dado que **bloqueia a ação**. E a origem do peso — balança,
informado, estimado — muda a confiança da dose sem mudar o número. ⇒ **E-14**

**d) A contraindicação pendente não é contraindicação ausente.** Coagulograma que
não voltou, anticoagulante cuja última dose ninguém sabe (**F-10**): o sistema
tem de exibir **pendência**, e pendência não pode ser lida como liberação. É a
fronteira mais perigosa de todo o módulo. ⇒ **E-07**, e a tabela de §2.10.

**e) A trombectomia é decidida com o paciente já em outro lugar.** A avaliação
pode continuar durante o transporte, durante a infusão, durante a transferência —
e é o primeiro ponto do módulo em que a **responsabilidade clínica** começa a
mudar de mãos. É isso que a nona espécie existe para representar.

### 1.10 Destinos e transições de cuidado

**Destino** é a nona espécie (§2.9): o estado que representa **para onde** o
paciente ou o fluxo segue quando muda a responsabilidade clínica, o módulo
responsável ou o nível/local de cuidado.

Os destinos que o AVC V1 produz:

| gatilho | destino | existe hoje? |
|---|---|---|
| hemorragia intracraniana na TC | módulo de AVC hemorrágico | ❌ futuro |
| suspeita de HSA | fluxo de HSA | ❌ futuro |
| candidato a trombectomia sem serviço local | transferência para centro EVT | ✅ dentro do AVC V1 |
| pós-trombólise | unidade de AVC ou UTI, conforme condição (**F-15**) | ✅ |
| quadro resolvido após correção de mimetizador | saída do fluxo de reperfusão, reavaliação diagnóstica | ✅ |

Três regras que a Parte 1 fixa sobre destino:

**1 · Ação produz destino; ação não É destino.**

> `Solicitar transferência` = **ação**.
> `Centro EVT definido · transferência em curso` = **destino**.

São entidades diferentes, com ciclos de vida diferentes: a ação se completa, o
destino **persiste** enquanto o paciente não chegou. ⇒ **E-16**

**2 · Destino para módulo inexistente é destino declarado, não beco.** O paciente
com hemorragia não pode cair em estado sem comportamento porque o módulo de AVC
hemorrágico ainda não existe. O que o AVC V1 deve garantir: o fluxo de reperfusão
**para**, a razão fica registrada, e o destino é nomeado como pendente de módulo
futuro. ⇒ **E-09**

**2.1 · Acionar equipe não é destino.** "Código AVC acionado" mobiliza gente
dentro do mesmo cuidado: a responsabilidade clínica **não muda de mãos**. É ação
(§1.4). Destino é o que redireciona o paciente ou o módulo responsável — e, com o
pré-hospitalar fora do escopo (§0.1), a transferência para centro EVT é sempre
decidida **com o paciente já dentro**.

**3 · O destino do mimetizador resolvido é uma saída para trás.** Corrigida a
hipoglicemia e desaparecido o déficit, o paciente **sai do fluxo de reperfusão** e
volta para reavaliação diagnóstica. É o único destino do módulo que não avança o
cuidado — reabre o diagnóstico. Sem representá-lo, o app fica com um paciente
"em AVC" que já não tem AVC. ⇒ **E-05**

### 1.11 O que a Parte 1 deixa em aberto

Fora do escopo da Parte 1, por serem comportamento de fases seguintes e não do
atendimento inicial: complicações da trombólise, prevenção secundária precoce,
disfagia e nutrição, mobilização, e o seguimento nas primeiras 24 horas. Entram
quando a spec passar do atendimento inicial — que é onde o AVC V1 termina.

Fora do escopo por **decisão de escopo** (§0.1), e apenas apontados como destino:
AVC hemorrágico, hemorragia intracraniana e HSA.

**Decidido em 2026-08-28:** P-03 (começa na porta, §0.1) · P-04 (registra, não
aciona, §1.4) · P-05 (decomposição + par proposto/assumido, §2.8).

**Registrado para a Parte 9 — candidata prioritária de expansão:** abrir o caso a
partir da **pré-notificação**, com o relógio correndo antes da chegada (P-03,
alternativa C). Não implementar agora.

---

## O QUE A PARTE 1 EXIGE DA ARQUITETURA

Nenhuma destas exigências foi escolhida por elegância. Cada uma tem, na coluna do
meio, o fato clínico do AVC que a obrigou.

| # | exigência | o fato clínico que a forçou | fecha em |
|---|---|---|---|
| **E-01** | O tempo é dado que corre sozinho; hora clínica ≠ hora de registro | a janela do último-visto-bem muda de resposta sem ninguém tocar em nada | Partes 3 e 4 |
| **E-02** | "Não sei" é valor clínico, não ausência de valor | último-visto-bem desconhecido tem consequência própria, diferente de "não perguntei" | Partes 2 e 7 |
| **E-03** | Dado tem procedência, e a procedência muda a confiança | horário da testemunha ≠ horário estimado pelo paciente afásico | Partes 2 e 3 |
| **E-04** | Estabilização é frente permanente, não etapa que termina | o ABC pode retomar prioridade a qualquer instante | Parte 5 |
| **E-05** | Bloqueio corrigível reabre a avaliação que o originou | hipoglicemia → correção → nova glicemia → **reavaliar o déficit** | Partes 2 e 3 |
| **E-06** | O mesmo valor tem significados diferentes conforme o contexto | PA 198/110 em candidato a reperfusão ≠ sem reperfusão | Parte 4 |
| **E-07** | Pendência sobrevive à troca de tela | coagulograma pendente enquanto o paciente vai à tomografia | Parte 5 |
| **E-08** | Um bloqueio pode governar uma classe inteira de ações | nada de reperfusão antes de excluir hemorragia | Partes 2 e 4 |
| **E-09** | Destino para módulo inexistente é saída declarada, não beco | hemorragia e HSA saem do AVC V1 sem que os módulos existam | Parte 2 (ver **P-02**) |
| **E-10** | Duas famílias de campo numérico, com semânticas opostas para "0" | NIHSS 0 é resposta; PAS 0 é ausência | Parte 7 |
| **E-11** | Não existe "próximo passo" único | trombólise IV e avaliação de TMV correm em paralelo | Parte 5 |
| **E-12** | Todo texto exibível nasce PT-BR + ES | decisão de escopo §0.4 | Partes 6 e 7 |
| **E-13** | Completude é propriedade do dado composto | NIHSS incompleto **não é** NIHSS 0 | Partes 2 e 7 |
| **E-14** | Dado exigido por ação tem origem, e a origem muda a confiança | peso de balança ≠ peso estimado, e a dose depende dele | Partes 2 e 3 |
| **E-15** | Julgamento clínico tem **proposta derivada** e **decisão assumida**, com divergência preservada | "déficit incapacitante" não sai de fórmula, mas o app não pode se calar diante do inexperiente | Parte 2 (§2.8) |
| **E-16** | Destino tem estado próprio: proposto ≠ assumido | "solicitar transferência" é ação; "centro EVT definido, transferência em curso" é destino | Parte 2 (§2.9) |
| **E-17** | Conteúdo pediátrico é filtrado **na origem**, não na tela | a fonte-mãe traz orientação pediátrica, e o app é adulto (PD-2) | Parte 6 |
| **E-18** | Divergência com a realidade brasileira é **marcada**, nunca resolvida sozinha | anti-hipertensivo IV citado pela AHA sem apresentação no Brasil | Parte 6 |
| **E-19** | Pergunta de decomposição só existe se a **fonte a sustentar** | decompor "déficit incapacitante" sem fonte é inventar critério | Parte 6 |
| **E-20** | **Nenhuma ação clínica é registrada como realizada por avanço de tela**, e a ação tem ciclo de vida explícito | avançar o fluxo não pode significar que a equipe foi acionada | Partes 2 (§2.3) e 3 |
| **E-21** | t₀ operacional e relógios clínicos coexistem, e não se substituem | janela se conta do último-visto-bem; porta-agulha, da chegada | Parte 3 (§3.3) |
| **E-22** | Derivação **declara seus insumos** — conclusão opaca não entra | o médico precisa saber por que o app diz "fora de janela" | Parte 4 (§4.6) |
| **E-23** | **Ausência de dado nunca é dado negativo** — três vazios distintos | "nada informado sobre anticoagulante" ≠ "não usa" | Parte 4 (§4.2) |
| **E-24** | Evento histórico de derivação guarda **qual lógica estava vigente** | reconstruir o passado com a regra de hoje falsifica o registro | Parte 4 (§4.7) |
| **E-25** | Dependência liga **uma ação a uma condição** — nunca frente a frente | excluir hemorragia bloqueia administrar, não avaliar nem preparar | Parte 5 (§5.3) |
| **E-26** | Frente bloqueada **declara a condição de desbloqueio** | "reperfusão aguarda a imagem" é acionável; "indisponível" é muro | Parte 5 (§5.6) |
| **E-27** | Frentes **não conversam** — leem os mesmos fatos | corrigir a última vez bem muda cinco frentes sem avisar nenhuma | Parte 5 (§5.7) |
| **E-28** | Espécie de conteúdo **não herda fonte por vizinhança na tela** | dose ao lado de recomendação citada continua sem fonte própria | Parte 6 (§6.1) |
| **E-29** | A tela **nunca é fonte primária** de dose, contraindicação, meta, elegibilidade, corte, janela ou recomendação | 495 ocorrências de conteúdo clínico dentro de componentes | Parte 6 (§6.2) |
| **E-30** | A **menor unidade auditável é a afirmação** | 7.880 afirmações sem citação no lugar onde estão | Parte 6 (§6.3) |
| **E-31** | Número clínico só existe a partir de **verbatim transcrito**; memória nunca preenche lacuna | os 17 `F-nn` estão em "fonte identificada, conteúdo não validado" | Parte 6 (§6.5) |
| **E-32** | **Toda janela temporal declara seu marco** | o módulo tem cinco relógios; janela sem marco é ambígua | Parte 6 (§6.1) |
| **E-33** | Todo texto exibido declara se é **sustentado, estruturado, derivado ou redação** | "corrija rapidamente" prescreve urgência sem fonte | Parte 6 (§6.9) |
| **E-34** | Dependência **regra ↔ fonte navegável nos dois sentidos** | trocar a guideline exige saber quais regras caem | Parte 6 (§6.10) |
| **E-35** | Recolhimento por **importância clínica**, nunca por contagem de itens | o critério aritmético escondeu 15% do conteúdo, incluindo padrões que decidem hemodinâmica | Parte 7 (§7.3) |
| **E-36** | Todo controle de tempo **nomeia qual relógio informa** | cinco relógios; horário no relógio errado produz janela errada | Parte 7 (§7.5) |
| **E-37** | Os **três estados de resposta** são distinguíveis olhando | "nada informado sobre anticoagulante" não pode parecer "não usa" | Parte 7 (§7.7) |
| **E-38** | Correção é **superfície focada do mesmo atendimento**, com retorno ao estado recalculado | corrigir PA sem sair do caso, e sem restaurar tela velha | Parte 7 (§7.11) |
| **E-39** | Cor **nunca** é portador único de significado | as espécies são semânticas; cor comporta ordem, não espécie | Parte 7 (§7.13) |
| **E-40** | Existe **seleção não confirmada** — toque não é fato clínico | sem isso, toque exploratório vira registro | Parte 7 (§7.16) |
| **E-41** | Toda string exibível **declara categoria**, e nenhuma string clínica fica embutida na tela | "corrija rapidamente" prescreve urgência sem fonte | Parte 7 (§7.17) |
| **E-42** | Horário copiado de outro evento é **cópia com linhagem**, nunca vínculo vivo | correção silenciosa de horário mudaria janela terapêutica sem ninguém ver | Parte 7 (§7.5) |
| **E-43** | **Não existe veredito marcável** — contraindicação e elegibilidade são derivadas dos fatos | marcar "contraindicado" grava a interpretação dentro do dado | Parte 7 (§7.15) |
| **E-44** | Toda trava **declara universo e piso**; universo vazio **reprova** | trava com universo zerado passou verde e escondeu um achado real | Parte 8 (§8.4) |
| **E-45** | A tradução preserva **intensidade, condição, exceção, população, temporalidade e grau de certeza** | `recommended` · `reasonable` · `may be reasonable` · `not recommended` · `harmful` são cinco forças, não duas | Parte 6 (§6.14) |
| **E-46** | Em julgamento clínico, a leitura do sistema é **apoio, nunca veredito binário** | a Table 4 é *guidance* com hedge; convertê-la em SIM/NÃO inventaria uma certeza que a fonte não tem | Parte 2 (§2.8) |
| **E-47** | Ação pode ser **iniciada sob condição resolutiva vinculada**, com regra de interrupção — e não existe "liberado" global | a fonte manda iniciar IVT antes do coagulograma e suspender se vier alterado | Parte 2 (§2.3) |
| **E-48** | **Classificação visual da fonte não é espécie clínica**; recomendação com COR/LOE prevalece sobre faixa de tabela | a Table 8 é gradiente de opinião, sem COR/LOE, e sua faixa "absoluta" é declarada sem sustentação em evidência | Parte 2 (§2.7) |
| **E-49** | **Nenhum campo obrigatório novo sem checagem contra o índice de não-exigir** | doze fatos com verbatim explícito de que não podem atrasar a terapia — e cada campo obrigatório é candidato a violá-los | Parte 2 (§2.3) |
| **E-50** | **Dose, concentração, indicação e preparo pertencem ao PRODUTO/APRESENTAÇÃO, nunca ao princípio ativo** | a bula brasileira acessível de tenecteplase é a do IAM, com faixas de peso idênticas às do AVC e valores até o dobro | Parte 6 (§6.7) |
| **E-51** | Inconsistência interna bloqueia **a afirmação**, não o **campo** — se outra fonte independente o sustentar explicitamente; e a fonte final é sempre **registrada** | a SBD crítico contradiz a si mesma no preparo de insulina; a SBD perioperatória o publica sem ambiguidade | Parte 6 (§6.6) |
| **E-52** | **Dado desconhecido nunca pode ser substituído por valor fabricado** — e atributo acessório nunca é pré-requisito para registrar um fato principal conhecido | TC externa com resultado conhecido e horário desconhecido: exigir a hora troca uma verdade por um número inventado, e o inventado entra na trilha com a cara de medido | Parte 2 (§2.1) · **acrescentada em 2026-08-29** |

> ### ⚠️⚠️ §0.3 · A FRONTEIRA DA ENTRADA NUMÉRICA — fixada pelo autor em 2026-08-30
>
> **Redação normativa, do autor:**
>
> > **Entrada numérica estruturada ⛔ não é texto livre.** Um valor clínico pode
> > ser digitado diretamente quando o campo declara: **tipo numérico** ·
> > **unidade**, quando aplicável · **semântica explícita de ⛔ não
> > informado/desconhecido** · **validação determinística** · **arredondamento
> > compatível com o passo**.
> >
> > ⛔ **Texto livre continua proibido** para valores clínicos estruturáveis.
>
> ⚠️ **O que §0.3 sempre quis impedir** — e continua impedindo — é o campo em que
> o médico escreve qualquer coisa **sem tipo, sem unidade, sem domínio e sem
> semântica controlada**. É por ali que entra conteúdo clínico sem fonte.
>
> ⚠️ **Por que a distinção precisou ser escrita:** o Laboratório transcreve
> resultado de laudo. Barra deslizante ali ⛔ não é neutra — ela sugere um
> **contínuo** e uma **faixa normal** que a fonte ⛔ não estabelece: os cortes de
> F-10 são limiares de decisão, ⛔ não faixas de normalidade. Digitar o número é o
> gesto real, e ⛔ não uma conveniência.
>
> ⛔ **E o limite técnico ⛔ nunca vira clínico:** se o componente precisar de
> `min`/`max` para se proteger, eles ⛔ **não aparecem na tela**, ⛔ não viram
> mensagem de "valor máximo permitido" e ⛔ não alimentam derivação nenhuma.

> ### ⚠️⚠️ E-52 · DADO DESCONHECIDO NUNCA VIRA VALOR FABRICADO — acrescentada pelo autor em 2026-08-29
>
> **Redação normativa, do autor:**
>
> > A ausência ou o desconhecimento de um dado **acessório** ⛔ não pode impedir o
> > registro de um fato clínico **conhecido**. Quando um fato principal é
> > conhecido e um atributo associado é desconhecido, **ambos devem ser
> > representáveis simultaneamente**, preservando explicitamente o
> > desconhecimento do atributo.
>
> **Exemplos normativos** — cada um é um estado que o app tem de conseguir
> representar:
>
> | fato principal conhecido | atributo desconhecido |
> |---|---|
> | resultado da TC | horário do estudo |
> | valor laboratorial | horário da coleta |
> | uso de DOAC | data e hora da última dose |
> | — | última vez visto bem, **sem** horário estimado automaticamente |
>
> ⚠️⚠️ **O QUE ELA ACRESCENTA A E-02 E E-23, e por que ⛔ não é dedutível delas.**
> **E-02** diz que *desconhecido é resposta*; **E-23**, que *ausência ⛔ nunca vira
> negativa*. As duas falam do **campo que ⛔ não foi respondido**. E-52 fala de um
> terceiro caso: o campo **foi** respondido, com verdade, e um **atributo dele**
> ⛔ não é sabido — e é aí que o formulário desenhado para completude troca a
> verdade por um número plausível.
>
> ⚠️ **O defeito que ela impede é silencioso por natureza:** um horário fabricado
> ⛔ não parece fabricado. Ele entra na trilha com o mesmo formato do medido, e três
> telas adiante alimenta cálculo de janela.
>
> ### ⛔ ALCANCE — exigência do AVC, candidata declarada
>
> ⛔ **⛔ NÃO PROMOVER a arquitetura universal do app.** §9.1 exige que um **segundo
> módulo clínico** demande o mesmo, de forma independente, antes da promoção.
> Ela nasce normativa **dentro do AVC**, e a candidatura fica registrada — ⛔ não
> exercida.

> ### ⚠️ E-50 · TESTE OBRIGATÓRIO — fixado pelo autor em 2026-08-28
>
> **No contexto AVC, nenhuma dose de 30, 35, 40, 45 ou 50 mg proveniente do
> regime de IAM pode ser sugerida, calculada ou apresentada como dose de
> tenecteplase para reperfusão cerebral.**
>
> **O teste FALHA se qualquer regra de IAM puder ALCANÇAR o fluxo de AVC.**
>
> ⛔ **Não basta esconder na interface.** A regra errada **não pode ser
> alcançável pelo motor** — é prova de **natureza C (comportamento)**, não
> estática, e mede **alcançabilidade**, não visibilidade.
>
> ⚠️ Razão: as faixas de peso dos dois regimes são **idênticas**
> (`<60` · `60–70` · `70–80` · `80–90` · `≥90 kg`) e os valores diferem em
> **exatamente o dobro** — 30/35/40/45/50 mg no IAM contra 15/17,5/20/22,5/25 mg
> no AVC.

---

## FONTES PENDENTES — a Parte 1 não escreve nenhum destes números

| # | o que falta | estado |
|---|---|---|
| **F-01** | ~~Qual é a fonte vigente do AVC isquêmico agudo~~ | ✅ **FECHADA** em 2026-08-28 — ver §0.7 |
| **F-02** | Janela para trombólise IV | ✅ **transcrito** · ✅ **resolvido por MÚLTIPLOS RELÓGIOS** (2026-08-28) — divergência documental segue aberta, mas não bloqueia: cada regra usa o marco da sua recomendação |
| **F-03** | Janela estendida e critérios de imagem avançada (AVC ao acordar) | ✅ **transcrito** 2026-08-28 · ⚠️ **quatro marcos distintos**, um deles novo (*symptom recognition*) |
| **F-04** | Meta pressórica **antes** da trombólise, e depois dela | ✅ **transcrito** 2026-08-28 · fármacos → **F-19** |
| **F-05** | Conduta pressórica em quem **não** vai reperfundir | ✅ **transcrito** 2026-08-28 · ⚠️ tensão recomendação × supportive text em aberto |
| **F-06** | Corte de glicemia que caracteriza *mimic* e obriga correção | ✅ **transcrito** 2026-08-28 · regra fechada; terapêutica operacional → **F-18** |
| **F-07** | Contraindicações à trombólise IV, **separadas em corrigíveis e não corrigíveis** | ✅ **transcrito** 2026-08-28 · Table 8 lida como IMAGEM; taxonomia da fonte mantida |
| **F-08** | Critérios de elegibilidade para trombectomia | ✅ **transcrito** 2026-08-28 · elegibilidade é **derivada**, nunca fato armazenado |
| **F-09** | Trombolítico(s) adotado(s) e dose por peso | ✅ **transcrito** 2026-08-28 · dose e administração fechadas; preparo → **F-20** |
| **F-10** | Anticoagulante prévio: o que bloqueia, o que exige exame | ✅ **transcrito** 2026-08-28 · DOAC = informação insuficiente; labs A×B sustentados |
| **F-11** | Tempos-alvo porta-imagem e porta-agulha | ✅ **transcrito** 2026-08-28 · ⚠️ **achado negativo**: a fonte NÃO tem meta numérica de porta-agulha |
| **F-12** | Anti-hipertensivos **disponíveis no Brasil** | ⚠️ decisão do autor · **premissa corrigida em 2026-08-28**: a edição 2026 **não nomeia** labetalol, nicardipino nem clevidipino — não há escolha da AHA a divergir. Ver **F-19** |
| **F-13** | Critério de suspeita **intra-hospitalar** | ✅ **transcrito** 2026-08-28 · ⚠️ **achado negativo**: escala de gravidade, não critério de suspeita |
| **F-14** | mRS prévio: critério ou contexto | ✅ **transcrito** 2026-08-28 · contexto na IVT, gradiente de força na EVT; **nunca contraindicação** |
| **F-15** | Manejo inicial pós-reperfusão e monitorização | ✅ **transcrito** 2026-08-28 · ⚠️ sem tabela equivalente para pós-EVT |
| **F-16** | Imagem: qual exame, em que ordem, e o que decide | ✅ **transcrito** 2026-08-28 · conferência clínica pendente |
| **F-17** | **Quais dimensões compõem o julgamento de "déficit incapacitante"** — e o trecho que diz que o NIHSS isolado não o determina | ✅ **transcrito** 2026-08-28 (Table 4, e355) · conferência clínica pendente |
| **F-22** | **Alvo de porta-agulha (DTN)** | ⚪ **FONTE COMPLEMENTAR OPCIONAL — indicador de desempenho.** ⛔ **Não é lacuna clínica bloqueante do V1.** Só será buscada se o autor decidir incorporar métricas institucionais ao produto. A AHA/ASA 2026 traz DTN apenas como desempenho observado, nunca como meta recomendada |
| **F-20** | **Preparo e administração operacional do trombolítico** — apresentação, concentração, reconstituição, diluente, estabilidade | 🔴 **ABERTO — exige FONTE BRASILEIRA / bula.** A Table 7 dá mg e mL e **não declara concentração** ⇒ **E-18**, **E-31** |
| **F-19** | **Terapêutica anti-hipertensiva operacional** — fármaco, dose, via, apresentação, concentração, titulação | 🟡 **parcial** · Posicionamento Luso-Brasileiro 2020 · ⚠️ disponibilidade **2026 não confirmada** |
| **F-23** | **Via aérea, ventilação e oxigenação no AVC** | ✅ **transcrito** 2026-08-28 · §4.1, e347 · ⛔ escopo AVC, **não** ISR/VM |
| **F-24** | **Crise convulsiva no AVC** | ✅ **transcrito** 2026-08-28 · §6.5, e400 · ⛔ escopo AVC, **não** estado de mal · terapêutica → **F-25** |
| **F-25** | **Terapêutica anticonvulsiva operacional** | ✅ **FECHADO COMO PONTEIRO** — ação + referência a protocolo específico; ⛔ sem dose no V1 |
| **F-18** | **Terapêutica operacional da correção glicêmica** — como corrigir hipo e hiperglicemia: fármaco, dose, via, apresentação, concentração | 🟡 **parcial** · MS + SBD 2025 · ⚠️ **preparo de insulina BLOQUEADO** por discrepância editorial de 10× na fonte |

> ⚠️ **Nota sobre F-12, registrada porque a informação existiu e foi apagada.** A
> árvore de AVC removida em `bdf02c8` registrava uma divergência real: os
> anti-hipertensivos citados pela diretriz americana **não têm apresentação
> intravenosa comercializada no Brasil**, e o app trabalhava com os que existem à
> beira do leito aqui. Isto é **ponteiro para conferência**, não conteúdo
> aprovado — mas apagar o ponteiro junto com a árvore seria perder o achado.

---

## PERGUNTAS AO AUTOR — Parte 1

**P-01 · ✅ FECHADA em 2026-08-28 — fonte-mãe declarada.**
AHA/ASA 2026 (DOI `10.1161/STR.0000000000000513`), registrada em §0.5 e em
`fontes-vigentes.json`. ⚠️ **Fechar P-01 não desbloqueou os slots `F-nn`:** a
fonte está declarada, o texto não está transcrito. Ver §0.5.

**P-02 · ✅ FECHADA em 2026-08-28 — existe a nona espécie.**
**DESTINO / TRANSIÇÃO DE CUIDADO**, especificada em §2.9.

**P-03 · ✅ FECHADA — alternativa A.** O AVC V1 começa na emergência. Recorte da
fonte declarado em §0.1; t₀ operacional definido; dado de antes da porta entra com
procedência (§1.2a.1). Alternativa C registrada para a Parte 9.

**P-04 · ✅ FECHADA — alternativa B.** O app registra, não aciona. `Código AVC
indicado` (derivado) ≠ `Código AVC acionado` (ação, com hora automática), em §1.4.
Nenhuma ação por avanço de tela ⇒ **E-20**.

**P-05 · ✅ FECHADA — C na interação, B na forma.** Decomposição sustentada pela
fonte, proposta derivada e decisão assumida com divergência preservada (§2.8).
mRS prévio permanece dado/contexto até **F-14**.

**Nenhuma pergunta da Parte 1 em aberto.** As pendências restantes são de
**fonte** (`F-nn`), não de decisão.

---

## PARTE 2 — O VOCABULÁRIO DO ESTADO CLÍNICO

> **Nove espécies.** As oito do princípio 16 mais **DESTINO / TRANSIÇÃO DE
> CUIDADO**, acrescentada pelo autor em 2026-08-28 depois que a Parte 1 mostrou
> que hemorragia, HSA e transferência para centro EVT não cabiam em nenhuma das
> outras.
>
> Cada espécie traz: **definição** · **quem escreve** · **guardada ou derivada** ·
> **exemplo no AVC** · **de quem ela se distingue**. As fronteiras entre pares
> confundíveis estão em §2.10, e são elas que fazem o trabalho — a definição
> isolada de cada espécie é a parte fácil.

### 2.1 Dado observado

**Definição:** fato que o médico observa ou colhe, sobre este paciente, neste
momento. **Quem escreve:** o médico. **Guardado**, com trilha completa (Parte 3).

**No AVC:** hora do último-visto-bem · PAS/PAD · glicemia · NIHSS item a item ·
peso · uso de anticoagulante.

**Três propriedades que o AVC obriga:**
- **procedência** — quem informou muda a confiança sem mudar o valor ⇒ **E-03**
- **origem** — peso de balança ≠ peso estimado ⇒ **E-14**
- **"não sei" é valor** — desconhecido tem consequência própria, diferente de
  "ainda não perguntei" ⇒ **E-02**

**Distingue-se de:** *estado derivado* — o sistema nunca escreve aqui.

### 2.2 Estado derivado

**Definição:** consequência clínica que o sistema calcula a partir de dados
observados e do contexto. **Quem escreve:** o sistema. **Derivado a cada
leitura, nunca gravado.**

**No AVC:** tempo decorrido desde o último-visto-bem · janela candidata ·
gravidade pelo NIHSS · candidatura a reperfusão.

**Por que nunca gravado:** gravado, envelhece junto com o dado que o produziu — e
neste módulo há um derivado que **muda de resposta sem nenhum dado mudar**,
porque o relógio anda. ⇒ **E-01**

**Distingue-se de:** *situação individualizada* — aquilo é julgamento, isto é
cálculo.

### 2.3 Ação

**Definição:** intervenção que altera o paciente ou o curso do atendimento.
**Quem escreve:** o médico executa; o sistema registra. **Guardada, com ciclo de
vida explícito.**

**No AVC:** corrigir hipoglicemia · tratar a PA para permitir reperfusão ·
administrar trombolítico · solicitar transferência · registrar Código AVC
acionado.

#### O ciclo de vida da ação (autor, 2026-08-28)

| estado | o que significa | quem produz |
|---|---|---|
| **sugerida** | o sistema propõe, a partir do estado atual | sistema (derivado) |
| **disponível** | nada a impede — nenhum bloqueio ativo sobre ela | sistema (derivado) |
| **iniciada** | começou, e ainda não terminou | médico |
| **realizada** | foi feita | médico |
| **cancelada** | quando aplicável — interrompida ou desfeita, com motivo | médico |

⚠️ **"Pode fazer" não é "foi feito", e "sugerida" não é nenhum dos dois.**
Sugerida e disponível são **derivadas**; iniciada, realizada e cancelada são
**registro do médico**.

⛔ **Avançar, voltar ou mudar de seção não produz ação clínica.** Nenhuma
navegação move uma ação para *iniciada* ou *realizada*. ⇒ **E-20**

#### Ação iniciada sob CONDIÇÃO RESOLUTIVA — extensão do ciclo, não espécie nova

**Acrescentado pelo autor em 2026-08-28**, a partir do verbatim de **F-10**: a
fonte permite, em cenário definido, **iniciar uma ação tempo-dependente antes de
o dado pendente resolver**, com regra explícita de interromper se o resultado vier
incompatível.

> *"…treatment with IV thrombolysis **can be initiated before availability of
> coagulation test results** but **should be discontinued if** INR >1.7, PT, or
> PTT is abnormal by local laboratory standards."* — Table 8, p. e367

**Isto NÃO é:** ação apenas *disponível* · ação *completamente liberada* · ação
*bloqueada* · nem *pendência* genérica.

**É:** **ação `iniciada` + condição resolutiva vinculada + regra de interrupção.**

⚠️ **Modelado como QUALIFICAÇÃO do estado `iniciada`, não como espécie nova.** A
ontologia continua com nove espécies (§2.1–§2.9) e cinco estados de ação — o que
existe aqui é um **vínculo** entre uma ação `iniciada` e uma pendência.

**O mínimo que o vínculo carrega:**

| elemento | |
|---|---|
| a **ação iniciada** | qual é, com hora |
| a **condição resolutiva vinculada** | qual pendência a governa |
| o **resultado ainda pendente** | e o fato de estar pendente ser visível (**E-07**) |
| a **regra de chegada** | o que acontece quando o resultado chega |
| os **desfechos possíveis** | **continuar** · **interromper** · **reavaliar** |
| o **registro do evento** | o que mudou o estado, com hora e motivo (Parte 3) |

⛔ **Não existe estado global de "liberado".** A condição pertence **àquela ação**,
nunca ao atendimento — é **E-25** aplicada ao tempo: uma condição liga-se a **uma**
ação. ⇒ **E-47**

#### ⚠️ Duas confirmações do autor (2026-08-28), a partir da consolidação clínica

**1 · A pressão arterial é bloqueio corrigível DA AÇÃO, nunca critério de
candidatura.** A candidatura à reperfusão deriva de tempo + imagem + déficit +
segurança; a PA entra depois, como bloqueio da administração. ⚠️ Incluí-la na
candidatura cria **dependência circular** — o alvo `<185/110` só existe para quem
já é candidato.

**2 · A avaliação detalhada do déficit incapacitante é superfície PULÁVEL** quando
o déficit já é claramente incapacitante e o atraso puder prejudicar terapia
tempo-dependente. Sustentado por **COR 1 · LOE A**: *"delaying IVT is potentially
harmful"*. ⛔ A decomposição de §2.8 **não pode ser caminho obrigatório**.

#### 🚫 As doze marcas de não-exigir — critério operacional de projeto

**Elevado a regra pelo autor em 2026-08-28.**

> ⛔ **Nenhum campo obrigatório novo pode ser criado sem checagem contra o índice
> de não-exigir** de `auditoria/CONSOLIDACAO-CLINICA-AVC.md`. ⇒ **E-49**

Cada uma das doze marcas tem verbatim que a sustenta, e todas nomeiam um fato que
⛔ **não pode travar terapia tempo-dependente** — podendo ser coletado, exibido e
pendente.

**Distingue-se de:** *destino* — a ação se completa; o destino persiste. E de
*reavaliação* — a ação muda o paciente, a reavaliação mede de novo.

### 2.4 Reavaliação

**Definição:** obrigação de refazer uma avaliação já feita, porque algo a
invalidou. **Quem escreve:** o sistema cria a obrigação; o médico a cumpre, e o
que ele produz é **dado observado novo** (§2.1). **Derivada.**

**No AVC:** nova glicemia após correção · **reavaliação do próprio déficit** após
a glicemia normalizar · PA após tratamento · neurológico após trombólise
(**F-15**).

**Os três gatilhos** (§1.5): ação executada · tempo decorrido · dado novo que
contradiz um derivado. Nenhum deles é o médico lembrar.

**Distingue-se de:** *pendência* — a pendência espera um dado que nunca veio; a
reavaliação **invalida um dado que já veio**.

### 2.5 Pendência

**Definição:** ausência **qualificada** de um dado que o atendimento precisa.
Não é campo vazio: é vazio que o sistema sabe que importa. **Derivada.**

**No AVC:** coagulograma não resultado · peso não informado · NIHSS incompleto ·
hora do último-visto-bem incerta.

**Duas regras:**
- **sobrevive à troca de tela** — continua visível enquanto o paciente vai à
  tomografia ⇒ **E-07**
- **pendência não é liberação** — contraindicação cujo exame não voltou não pode
  ser lida como contraindicação ausente (§1.9d)

**Distingue-se de:** *bloqueio corrigível* — na pendência o dado **não chegou**;
no bloqueio o dado **chegou e impede**.

### 2.6 Bloqueio corrigível

**Definição:** condição presente que impede uma ação **e para a qual existe
conduta que a remove**. **Derivado.**

**No AVC:** glicemia abaixo do corte (**F-06**) · PA acima da meta no candidato a
reperfusão (**F-04**) · hemorragia ainda não excluída, antes da imagem.

**Duas propriedades que o AVC obriga:**
- **pode governar uma classe inteira de ações**, não uma ação só — a hemorragia
  não excluída bloqueia toda a reperfusão ⇒ **E-08**
- **corrigido, reabre a avaliação que o originou** — não basta liberar a ação:
  a hipoglicemia corrigida obriga a reavaliar o déficit ⇒ **E-05**

**Distingue-se de:** *contraindicação não corrigível* — e a diferença é a
existência de conduta, não a gravidade.

### 2.7 Contraindicação não corrigível

**Definição:** condição presente que impede uma ação e para a qual **não existe
conduta** que a remova neste atendimento. **Derivada**, e estável.

**No AVC:** o bloco de **F-07**, na parte que não admite correção.

⚠️ **A separação é nossa, e pode não estar na fonte.** Diretriz costuma listar
corrigível e não corrigível na mesma coluna. Onde a AHA/ASA 2026 não separar, a
separação é **decisão do autor**, marcada como tal — nunca inferida por quem
escreve a spec (§0.5).

#### ⚠️ Classificação visual da fonte ≠ espécie clínica do app

**Fixado pelo autor em 2026-08-28, a partir de F-07.** A **Table 8** da AHA/ASA
2026 é **gradiente de risco e de opinião de especialista** — três faixas
cromáticas, **sem COR/LOE em nenhuma célula**, e com a faixa "absoluta"
declarada *"unsupported by clinical evidence"*.

| ⛔ não equivale | |
|---|---|
| `item listado na Table 8` | ≠ contraindicação automática |
| faixa *"absolute contraindications"* | ≠ proibição computável sem julgamento |
| gradiente cromático da fonte | ≠ semáforo do app (**E-39**, P-07) |

#### ⚠️ `COR 3` não é a espécie *contraindicação*

**Fixado pelo autor em 2026-08-28.** Classe de recomendação descreve **o que se
faz com uma intervenção**; a espécie §2.7 descreve **uma condição do paciente**.

| | objeto | onde vive |
|---|---|---|
| **COR 3: No Benefit / Harm** | **a intervenção ou a estratégia** — recomendação **contra** ela porque risco > benefício | regra sobre a **ação** (§2.3), que a torna indisponível |
| **contraindicação não corrigível** (§2.7) | **o paciente** — uma condição dele que impede a ação | **estado** derivado dos fatos |

**O caso que obrigou a distinção:** §4.3 rec. 10 (**COR 3: Harm · A**) desaconselha
a **estratégia** de redução pressórica intensiva (<140 por 72 h) após
recanalização bem-sucedida. ⛔ Não contraindica o paciente, ⛔ não proíbe tratar a
PA, ⛔ não retira nada da reperfusão já feita.

> **Regra de precedência:** onde houver **recomendação específica com COR/LOE**,
> ela **prevalece** sobre a faixa geral da tabela. Onde **não** houver
> recomendação acionável, o item permanece **situação individualizada** ou **risco
> contextual** — nunca veredito. ⇒ **E-48**

**Distingue-se de:** *bloqueio corrigível* — ver §2.10.

### 2.8 Situação individualizada

**Definição:** ponto em que a conduta depende de julgamento sobre **este**
paciente, e não de regra aplicável.

**No AVC:** "o déficit é incapacitante para este paciente" · o peso da
funcionalidade basal · a decisão diante de contraindicação relativa.

**Decidido pelo autor em 2026-08-28 (P-05): decomposição na interação, par
proposto/assumido na forma.** O sistema **nem se cala nem decide**.

#### O que fica proibido

- ⛔ perguntar `Déficit incapacitante? Sim/Não` e ficar nisso;
- ⛔ o sistema concluir sozinho;
- ⛔ **usar o NIHSS total como regra substituta** do julgamento.

> ✅ **SUSTENTADO POR VERBATIM** desde 2026-08-28. **F-17** transcreveu o
> *Recommendation-Specific Supportive Text* da rec. 1 de §4.6.1 (p. e354):
> *"Use of the NIHSS score alone does not suffice."* Deixou de ser afirmação
> declarada pelo autor e passou a afirmação da spec, com fonte.

#### Os sete passos

1. o médico informa **déficits e consequências funcionais** por opções
   estruturadas;
2. o sistema usa **apenas critérios sustentados pela fonte** para produzir uma
   leitura;
3. a leitura aparece como **proposta**, nunca como decisão final;
4. o médico **assume ou diverge**;
5. a decisão assumida pelo médico é **guardada**;
6. a proposta do sistema **continua derivada e recalculável**;
7. eventual **divergência permanece identificável**.

```
   Achados observados  ──▶  Sistema: "potencialmente incapacitante"  ──▶
   Médico: incapacitante · não incapacitante · incerto
```

#### A forma do estado

| | natureza | onde vive |
|---|---|---|
| **incapacitante proposto** | estado derivado, recalculável | §2.2 |
| **incapacitante assumido** | julgamento clínico **guardado com autor** | §2.8 |

É o **mesmo par proposto/assumido** da nona espécie (§2.9). Duas espécies
distintas usando o mesmo par é o primeiro sinal de que ele é geral — anotado
para a **Parte 9**, e **não** promovido agora. ⇒ **E-15**, **E-16**

⚠️ **A decomposição não é nossa.** Pergunta que a fonte não sustentar **não
entra** ⇒ **E-19**. As dimensões vieram de **F-17** — Table 4 (p. e355) e o
*Supportive Text* da rec. 1 (p. e354).

⛔ **Não inventar categoria funcional adicional por parecer intuitiva.** A
decomposição usa **apenas** dimensões sustentadas pela Table 4 e pelo texto de
suporte.

#### O que a fonte sustenta — fixado pelo autor em 2026-08-28, sobre F-17

**1 · NIHSS total.** ⛔ **Não pode ser usado isoladamente** para classificar o
déficit como incapacitante ou não incapacitante. ✅ **Permanece dado clínico
relevante** — não é descartado, é insuficiente sozinho.

**2 · Itens do NIHSS.** ✅ **Podem** ser usados como parte da avaliação, porque a
Table 4 emprega itens específicos e seus escores **como exemplos** (≥2 em
*vision*, *best language*, *extinction and inattention*, *motor*). ⛔ Isso **não
autoriza** transformar os itens em **algoritmo automático de elegibilidade**.

**3 · A pergunta funcional central tem PRIORIDADE CONCEITUAL.** É a estrutura
principal do julgamento — os quadros da Table 4 são ilustração sob ela, não o
contrário:

> *"Se os déficits observados persistirem, o paciente ainda conseguiria realizar
> atividades básicas de vida diária e/ou retornar à sua atividade
> habitual/trabalho?"*

⚠️ **Marcação de fidelidade — a redação "atividade habitual/trabalho".** É
**redação de apresentação decidida pelo autor**, e:

- ⛔ **não é verbatim** — a fonte diz *"return to work (if applicable)"*;
- ✅ **amplia operacionalmente** o alcance, para incluir pacientes **sem atividade
  laboral formal**;
- ⛔ **não altera o verbatim armazenado** (F-17) **nem a interpretação clínica da
  fonte**.


**4 · Table 4 é *guidance*.** Achados **tipicamente** claramente incapacitantes ×
achados que **podem não ser** claramente incapacitantes. ⛔ Não converter
`typically disabling` → "sempre incapacitante", nem `may not be clearly
disabling` → "não incapacitante". **Preservar a incerteza da fonte.**

**5 · A leitura do sistema não é veredito.** ⛔ O app **não** produz
automaticamente `Déficit incapacitante = SIM/NÃO` a partir da Table 4. ✅ Produz
**leitura intermediária**, do tipo:

- *"Há achados tipicamente associados a déficit claramente incapacitante"*;
- *"Há achados que podem não ser claramente incapacitantes isoladamente"*;
- *"A avaliação funcional individual permanece necessária"*.

> **É apoio ao julgamento, não decisão.** ⇒ **E-46**

**6 · A decisão final é do médico:** `incapacitante · não incapacitante ·
incerto`, guardada e **separada** da leitura derivada.

**7 · Divergir não é erro.** Se o médico divergir da leitura do sistema, isso
**não bloqueia o fluxo** e permanece registrado como **divergência clínica**
(§4.5, §4.7).

**8 · Tradução preserva as quatro expressões** (**E-45**): `clearly disabling` ·
`typically considered` · `may not be clearly disabling` · `individual
circumstances`. ⛔ Não achatar. O verbatim permanece em inglês (§6.14).

#### mRS prévio — papel ainda não fechado

Por ora: **dado / contexto clínico estruturado**. **Não** transformar mRS prévio
elevado em contraindicação automática. O papel exato em trombólise IV e
trombectomia permanece em **F-14** até a conferência do texto correspondente.

**Distingue-se de:** *estado derivado* — a proposta é derivada, mas **a decisão
não**. O sistema ocupa o espaço da leitura; nunca o da autoria.

### 2.9 Destino / transição de cuidado — a nona espécie

**Definição (autor, 2026-08-28):** estado que representa **para onde** o paciente
ou o fluxo clínico deve seguir quando muda **a responsabilidade clínica**, **o
módulo responsável** ou **o nível/local de cuidado**.

**Quem escreve:** o sistema propõe; a ação do médico o assume. **Dois estados,
e a distinção é normativa:**

| estado | natureza | exemplo |
|---|---|---|
| **proposto** | derivado | "candidato a EVT sem serviço local → transferência indicada" |
| **assumido** | guardado, produzido por ação | "centro EVT definido · transferência em curso" |

⇒ **E-16**

**No AVC** (§1.10): hemorragia → módulo de AVC hemorrágico (futuro) · suspeita de
HSA → fluxo de HSA (futuro) · candidato a EVT sem serviço local → centro EVT ·
pós-trombólise → unidade de AVC ou UTI (**F-15**) · mimetizador resolvido →
saída do fluxo de reperfusão e reavaliação diagnóstica.

**Três coisas que destino não é** — e o autor as nomeou porque cada uma já foi
confundida com ele em algum módulo do app:

- **não é ação.** `Solicitar transferência` é ação; `centro EVT definido,
  transferência em curso` é destino. A ação se completa; o destino persiste
  enquanto o paciente não chegou.
- **não é estado derivado.** O derivado descreve o paciente; o destino muda
  **de quem ele é**.
- **não é pendência nem contraindicação.** Destino não é falta de dado nem
  impedimento: é redirecionamento com responsável.

**Destino para módulo inexistente continua sendo destino.** É o que impede o
paciente com hemorragia de cair em estado sem comportamento. ⇒ **E-09**

### 2.10 A tabela de fronteiras

As definições acima quase nunca falham sozinhas. O que falha é o par:

| par | a pergunta que separa | erro se confundir |
|---|---|---|
| dado observado × estado derivado | **quem escreveu?** | sistema escrevendo fato vira fato inventado |
| pendência × bloqueio corrigível | **o dado chegou?** | pendência lida como liberação (§1.9d) |
| bloqueio corrigível × contraindicação não corrigível | **existe conduta que remove?** | ou trava paciente tratável, ou insiste em quem não pode |
| ação × reavaliação | **muda o paciente ou mede de novo?** | "medi a PA" contado como "tratei a PA" |
| ação × destino | **completa-se ou persiste?** | transferência solicitada lida como transferência feita |
| estado derivado × situação individualizada | **sai de cálculo ou de julgamento?** | app opinando onde só o médico decide ⇒ **E-15** |
| estado derivado × destino | **descreve o paciente ou muda de quem ele é?** | saída de módulo tratada como mais um achado |
| pendência × situação individualizada | **falta resposta, ou a resposta é "depende deste paciente"?** | julgamento exibido como campo por preencher |
| reavaliação × pendência | **invalidou dado que veio, ou espera dado que não veio?** | reavaliação some da tela junto com a pendência resolvida |

### 2.11 O que não é nenhuma das nove

Não entra no estado clínico: texto educativo, referência bibliográfica,
justificativa, lembrete, material de apoio, e conteúdo que "é bom saber". Nada
disso descreve o paciente, e nada disso muda comportamento.

Isso **não** significa que não apareça na tela — significa que não é estado. Onde
esse conteúdo mora, e quanto dele aparece no momento clínico, é matéria das
Partes 6 e 7. E é aqui que a spec responde ao C1: o critério de exibição não pode
voltar a ser a **contagem de itens** de um campo genérico, porque foi ela que
escondeu os padrões de oclusão coronária atrás de um toque.

### 2.12 O que a Parte 2 deixa em aberto

- **P-05** decide se o sistema **ocupa** ou apenas **registra** a situação
  individualizada (§2.8).
- A separação corrigível × não corrigível em **F-07** depende de leitura da fonte
  e, possivelmente, de decisão do autor (§2.7).
- Se **destino assumido** admite reversão — transferência cancelada, paciente que
  volta — e o que acontece com o fluxo de reperfusão nesse caso. Nasce na Parte 3,
  que é onde a reversibilidade vive.

---

## PARTE 3 — A TRILHA: O DADO QUE MUDA SEM SE PERDER

> Esta parte responde aos princípios **4** e **5**, e é onde vivem os relógios
> (**E-01**, **E-21**), a procedência (**E-03**), a origem (**E-14**) e a regra de
> que nada é registrado por avanço de tela (**E-20**).
>
> Ela é **estrutural**: nenhuma regra aqui depende de número clínico.

### 3.1 A regra

**Nenhum dado clínico é sobrescrito.** Registrar um valor novo **acrescenta**;
nunca substitui.

O caso do princípio 4, percorrido:

```
  19:42   PA 198/114                       (dado observado)
  19:51   tratamento da PA                 (ação)
  20:07   PA 168/96                        (dado observado — novo, não correção)
```

Os **três** permanecem. Sem eles, "a PA está em 168/96" é indistinguível de "a PA
sempre esteve em 168/96" — e as duas leituras levam a condutas diferentes.

**O que a trilha protege, em uma frase:** o estado atual responde *como o
paciente está*; a trilha responde *como ele chegou aqui* — e em AVC a segunda
pergunta muda a primeira.

### 3.2 O que compõe um registro

| campo | obrigatório | observação |
|---|---|---|
| **valor** | sim | ou o marcador de "não sei", que é valor ⇒ **E-02** |
| **hora clínica** | sim | quando o fato aconteceu — ver §3.3 |
| **hora de registro** | sim | automática, nunca informada pelo usuário |
| **procedência** | sim | quem informou / de onde veio ⇒ **E-03** |
| **origem** | quando a grandeza tiver | balança · informado · estimado ⇒ **E-14** |
| **autor do registro** | sim | quem operou o app — ver §3.9 |
| **motivo** | quando houver | por que este registro existe (correção, reavaliação, novo achado) |
| **o que ele sucede** | quando houver | o registro anterior do mesmo campo |
| **linhagem** | quando o valor foi **copiado** de outro evento | evento de origem, valor copiado e hora da cópia — **cópia, nunca vínculo** (§7.5) ⇒ **E-42** |

Um registro **não** guarda estado derivado. Derivado se recalcula da trilha
(§2.2); guardá-lo faria a trilha envelhecer junto com ele.

### 3.3 Os relógios, e por que são cinco

§1.1 lista os cinco. A Parte 3 fixa o que se faz com eles:

- **hora clínica ≠ hora de registro.** O evento das 11h50 anotado às 14h20 são
  dois instantes. Confundi-los corrompe a janela. ⇒ **E-01**
- **t₀ operacional não substitui relógio clínico.** Janela terapêutica conta dos
  relógios clínicos; porta-imagem e porta-agulha contam do t₀. ⇒ **E-21**
- **hora de registro é do sistema.** Ninguém digita. É ela que permite reconstruir
  o que se sabia **no momento de cada decisão** — sem isso, toda revisão de caso
  vira julgamento com informação que o médico não tinha.
- **hora clínica pode ser incerta**, e a incerteza viaja com o dado em vez de ser
  arredondada para um número confortável. ⇒ **E-02**

### 3.4 Medir de novo ≠ corrigir o que foi registrado errado

**A distinção mais fácil de perder, e a mais cara.** Duas coisas produzem um valor
diferente no mesmo campo, e elas **não são a mesma operação**:

| | o que aconteceu | o que a trilha faz |
|---|---|---|
| **nova medida** | o paciente mudou, ou mediu-se outra vez | acrescenta registro; **os dois valem**, cada um na sua hora |
| **correção de registro** | o valor anterior **nunca foi verdade** — valor informado incorretamente, campo trocado, unidade errada | acrescenta registro marcado como correção; o anterior fica **invalidado, e visível** |

**Por que isso importa em AVC:** confundir as duas transforma **erro de entrada em
evolução clínica falsa**. Uma PAS **informada incorretamente** e depois "corrigida"
apareceria como resposta a um tratamento que ninguém deu — e o app derivaria
candidatura a reperfusão a partir de uma melhora que não existiu.

⚠️ **O erro de entrada não some porque a entrada é tocável.** Slider e ajuste fino
(§0.3) erram de outro jeito — arraste que passa do ponto, toque repetido, campo
vizinho — e erram **em silêncio**, sem o estranhamento visual de um número
absurdo num campo de texto. A distinção desta seção é **mais** necessária aqui,
não menos.

**Regras:**
1. corrigir **exige motivo**; medir de novo, não;
2. correção **não apaga** — invalida, e o invalidado continua legível;
3. o valor corrigido **não herda a hora clínica** do errado quando a hora também
   estava errada: são dois campos, e ambos podem estar errados;
4. um valor **nunca é apagado para virar "não informado"** por avanço de tela.
   Se o campo precisa voltar a ser perguntado, isso é uma **reavaliação** (§2.4),
   com gatilho declarado — não um esvaziamento silencioso. ⇒ **E-20**

### 3.5 O efeito em cadeia

Um registro novo não muda só o próprio campo. Ele propaga:

```
  dado observado novo
        ↓
  estado derivado recalculado          (§2.2 — nunca gravado)
        ↓
  bloqueio instaurado ou removido      (§2.6)
        ↓
  ação reaberta, ou reavaliação criada (§2.3, §2.4)
        ↓
  destino proposto muda                (§2.9)
```

**Percorrido no caso da PA (§3.1):** PA 198/114 num candidato a reperfusão é
bloqueio corrigível (**E-06**) → o tratamento é ação → PA 168/96 é dado novo → o
derivado recalcula → **o bloqueio cai** → a ação de reperfusão volta a ser
autorizável. Se, nesse meio-tempo, o relógio tiver cruzado a janela, o mesmo
168/96 **não** destrava nada: o contexto que qualificava o número mudou sozinho.
⇒ **E-01**, **E-06**

### 3.6 A cadeia que volta para trás

O caso do princípio 5 é mais forte que o da PA, porque a propagação **reabre uma
avaliação já concluída**:

```
  glicemia abaixo do corte (F-06)
        ↓  instaura bloqueio corrigível + suspeita de mimetizador
  ação de correção
        ↓
  nova glicemia  (dado novo — o antigo permanece)
        ↓  bloqueio cai
  REAVALIAÇÃO DO DÉFICIT           ← a avaliação que já tinha sido feita
        ↓
  se o déficit sumiu → DESTINO: saída do fluxo de reperfusão,
                                 reavaliação diagnóstica  (§1.10, §2.9)
```

⚠️ **É o único caminho do módulo em que o paciente sai por onde entrou.** Sem
representá-lo, o app fica com um paciente "em AVC" que já não tem AVC. ⇒ **E-05**

### 3.7 Reversão: o que se desfaz, e o que não se desfaz

Fecha a pendência aberta em §2.12.

| o que | reverte? | como |
|---|---|---|
| **valor informado** | não se desfaz | corrige-se (§3.4) ou mede-se de novo |
| **proposta do sistema** | não se reverte — **recalcula** | é derivada (§2.2) |
| **decisão assumida pelo médico** | sim | nova decisão, com motivo; **a anterior e a divergência permanecem** (§2.8) |
| **ação registrada** | não se apaga | registra-se *não realizada*, *interrompida* ou *revertida*, com hora |
| **destino assumido** | sim | vira *cancelado*, com motivo — e o fluxo que ele havia interrompido **não volta sozinho** |

⚠️ **O destino cancelado é o caso perigoso.** Transferência para centro EVT
cancelada não devolve o paciente ao ponto onde ele estava: o relógio andou, a
janela pode ter fechado, e o estado tem de ser **recalculado**, não restaurado.
Restaurar estado antigo é a forma mais silenciosa de mentir sobre o tempo.

### 3.8 O que a trilha NÃO é

**Não é prontuário.** Não substitui registro legal, não tem valor documental e
não deve ser desenhada para isso — desenhar para valor legal muda o produto e
traz obrigação que o app não assume.

**Não é auditoria de conduta.** Ela existe para que **o próprio atendimento** não
perca informação — e, depois, para permitir derivar métricas temporais (§1.4).
Não existe para avaliar quem atendeu.

**Não é log técnico.** Evento de interface, navegação e render não entram. Entra
o que é clínico: dado, ação, decisão, destino.

### 3.9 O que a Parte 3 deixa em aberto

- **Autoria.** §3.2 exige o campo. **Orientação do autor (2026-08-28):** a
  arquitetura deve **permitir incorporar autoria depois**, e **não inventar agora
  uma identidade clínica própria do módulo**. Ou seja: o campo existe e é
  previsto; quem o preenche fica em aberto, e o AVC não cria sistema de identidade
  paralelo ao do app.
- **Persistência e retomada.** **Não definir ainda** — a decisão vem depois de
  haver clareza sobre o **ciclo de vida completo de um atendimento**. Registrar a
  pergunta é o trabalho desta parte; respondê-la, não.
- **Volume.** Um atendimento longo produz muitos registros; o que a tela mostra
  da trilha, e quanto dela fica recolhido, é **Parte 7** — e não pode reeditar o
  C1, que escondeu decisão crítica atrás de contagem de itens.

---

## PARTE 4 — DERIVAÇÃO: O MESMO NÚMERO COM DOIS SIGNIFICADOS

> Formaliza as **dez regras de derivação** ditadas pelo autor em 2026-08-28. O
> mapa delas está em §4.9.
>
> ⚠️ **Esta parte especifica o MECANISMO da derivação, não as derivações
> clínicas.** Quais são a janela, a meta, o corte e o critério depende dos slots
> `F-nn` e do verbatim. Nada disso é escrito aqui.

### 4.1 O dado não carrega a própria interpretação

**Regra 1.** Dado observado guarda **o fato**, nunca a leitura clínica do fato.

| ✅ o que se guarda | ⛔ o que nunca se guarda |
|---|---|
| glicemia = *valor* | `hipoglicemia = sim` |
| PAS · PAD = *valores* | `PA elevada = sim` |
| hora do último-visto-bem | `dentro da janela = sim` |
| itens do NIHSS | `AVC grave = sim` |
| uso de anticoagulante + hora da última dose | `contraindicado = sim` |

**Três razões, e nenhuma é estética:**

1. **A interpretação depende do contexto**, e o contexto muda sem o dado mudar —
   a mesma PA é bloqueio no candidato a reperfusão e não é no não candidato.
   Congelada dentro do dado, ela não muda quando deveria. ⇒ **E-06**
2. **A interpretação depende da fonte**, e a fonte é atualizável. Corte gravado
   dentro do dado significa reescrever histórico de paciente para atualizar uma
   diretriz.
3. **É o modo de falha documentado deste app.** A auditoria contou **495
   ocorrências de conteúdo clínico dentro de componentes de tela** e **2.567
   afirmações repetidas em mais de um arquivo**. Interpretação embutida no dado é
   a mesma doença, um andar abaixo.

**Consequência de contrato:** o campo carrega a **grandeza**; a classificação é
**sempre** derivada.

### 4.2 Ausência não é negação

**Regra 10.** O módulo tem **três vazios diferentes**, e eles não podem colapsar
em um só:

| vazio | significa | exemplo no AVC |
|---|---|---|
| **não perguntado** | ninguém abordou o assunto | anticoagulante nunca mencionado |
| **perguntado, "não sei"** | há resposta, e ela é a incerteza ⇒ **E-02** | ninguém sabe a última vez bem |
| **perguntado e negado** | fato observado negativo | paciente nega anticoagulante |

⛔ **A derivação mais perigosa do módulo seria ler silêncio como negativa.**
"Nada informado sobre anticoagulante" **não é** "não usa anticoagulante" — e
tratar um como o outro produz liberação de reperfusão por ausência de pergunta.
É a mesma fronteira de §1.9d, agora do lado da derivação: **pendência não é
liberação**. ⇒ **E-23**

E os vazios de forma, que §0.2 e **E-13** já separaram: slider em 0 antes da
interação é *não informado*; NIHSS incompleto **não é** NIHSS 0.

### 4.3 O que é derivar — e por que não se guarda

**Regras 2 e 3.** Derivar é interpretar **os fatos atuais** contra **o contexto
atual**, no instante da leitura.

> **O estado clínico atual nunca é lido de armazenamento. É sempre recalculado.**

**Por que não se persiste como verdade clínica:** derivado guardado envelhece
junto com o fato que o produziu — e este módulo tem um derivado que muda **sem
que fato nenhum mude**, porque o relógio anda (§4.4-ii). Guardar "está dentro da
janela" é gravar uma verdade com prazo de validade e nenhum aviso de vencimento.

*(Otimização de cálculo é assunto de implementação. O contrato é: ninguém pode
**ler** um derivado guardado como se fosse fato.)*

### 4.4 Os quatro modos de um derivado mudar

**Regras 4, 5, 6 e 7.** Só um deles é o médico informando algo novo:

| # | o que mudou | exemplo no AVC | o que exige |
|---|---|---|---|
| **i** | **o contexto**, não o dado (regra 4) | a mesma PA deixa de ser bloqueio quando o paciente deixa de ser candidato | derivação lê contexto, não só campos ⇒ **E-06** |
| **ii** | **o tempo**, e mais nada (regra 5) | a janela fecha enquanto se espera a imagem | recálculo **na leitura**, não por evento — não há evento nenhum ⇒ **E-01** |
| **iii** | **um dado foi corrigido** (regra 6) | a testemunha chega e corrige a última vez bem | derivados anteriores **deixam de valer** — ver §4.7 |
| **iv** | **uma ação produziu dado novo** (regra 7) | correção da glicemia → nova glicemia → nova derivação → reavaliação do déficit | a cadeia de §3.5 ⇒ **E-05** |

⚠️ **O modo (ii) é o que quebra arquitetura reativa ingênua.** Sistema que
recalcula "quando algo muda" nunca recalcula aqui — porque **nada muda**. A
passagem do tempo não emite evento.

⚠️ **O modo (iii) é o que quebra cache ingênuo.** Corrigir a última vez bem
invalida, de uma vez, tempo decorrido, janela, candidatura, o significado da PA e
o destino proposto. A correção de **um** campo derruba **uma cadeia inteira**.

### 4.5 Proposta e decisão continuam separadas

**Regra 8.** Recapitula §2.8 e §2.9, e acrescenta o caso que faltava:

| | natureza | muda quando |
|---|---|---|
| **proposta do sistema** | derivada | qualquer um dos quatro modos de §4.4 |
| **decisão assumida pelo médico** | guardada, com autor | **só quando o médico decide de novo** |

⚠️ **A proposta pode mudar depois de a decisão ter sido assumida — e a decisão
não muda sozinha.** O que nasce daí **não é** sobrescrita: é uma **reavaliação**
(§2.4), com gatilho declarado. O médico decidiu com os fatos de então; mudaram os
fatos, ele é chamado a decidir de novo — não corrigido pelas costas.

E a divergência permanece identificável, como o passo 7 de §2.8 exige.

### 4.6 Derivação explicável

**Regra 9.** O médico tem de conseguir saber **quais fatos produziram aquela
conclusão**. Toda derivação declara três coisas:

1. **os fatos que entraram** — quais campos, com que valores e de que hora;
2. **o contexto que a qualificou** — o que fez este número significar isto;
3. **a fonte que sustenta a regra** — o `F-nn` correspondente.

**E declara também o que faltou.** Derivado produzido com pendência aberta é
**derivado com informação incompleta**, e isso é parte da explicação — não
rodapé. ⇒ **E-07**, **E-22**

⚠️ **Explicável não é "sempre exibido".** Que a explicação exista é contrato desta
parte; **quanto dela aparece, e quando**, é **Parte 7** — e não pode reeditar o
C1, que escondeu decisão crítica atrás de contagem de itens.

**Consequência dura:** derivação não pode ser função opaca. Se a conclusão não
sabe dizer de onde veio, ela não entra no módulo.

### 4.7 Quando um derivado deixa de valer: some, ou fica na trilha?

**Pergunta do autor, com inclinação declarada. Analisada aqui, e NÃO fechada.**

#### O reenquadramento que dissolve a contradição aparente

Guardar o derivado parece contradizer §4.3. Não contradiz, **se o que se guarda
for outra coisa**:

> Não se guarda **o derivado**. Guarda-se **o fato de que ele foi derivado** —
> "às 20:10, com os fatos disponíveis, o sistema derivava X".
>
> Isso é um **fato sobre o sistema**, com hora, insumos e fonte. É observado, não
> derivado. O estado clínico atual continua recalculado sempre, e continua sem
> nunca ler daí.

#### As três alternativas, e o que cada uma custa

**A · O derivado desaparece sem rastro.**
- ✅ Invariante puríssimo; zero risco de derivado velho ser lido como atual.
- ⛔ **Quebra uma regra já aprovada.** O passo 7 de §2.8 exige que a divergência
  entre proposta e decisão permaneça **identificável**. Se a proposta é efêmera,
  fica um julgamento assumido sem a proposta com que ele concordou ou divergiu —
  divergência irreconstruível.
- ⛔ Decisão sem motivo aparente: o médico que não trombolisou às 20:10 porque o
  sistema derivava "fora de janela" a partir de um horário depois corrigido fica,
  no registro, sem nada que explique a conduta.

**B · Registra-se toda derivação.**
- ✅ Explicabilidade total.
- ⛔ Volume: derivação recalculada a cada leitura produziria trilha ilegível.
- ⚠️ Risco de leitura: cópia histórica confundida com estado atual.

**C · Registra-se a derivação que ANCOROU alguma coisa.** *(recomendada)*
- Entra na trilha a **transição** de um derivado — não cada recálculo — e apenas
  quando ele **ancorou**: impediu uma ação, sustentou proposta que o médico
  assumiu ou da qual divergiu, mudou um destino, ou autorizou uma ação.
- ✅ Preserva a divergência de §2.8 e a explicação da conduta.
- ✅ Volume proporcional a decisões, não a renders.
- ⚠️ Exige marcação dura: **nunca** é fonte de leitura do estado; aparece só em
  contexto de trilha, sempre com hora, insumos e o instante em que deixou de
  valer.

#### O argumento que eu não esperava, e que pesa a favor de guardar

**Regra muda entre versões do app.** Se a trilha não guardar o que o sistema
**de fato disse**, a única forma de reconstruir o passado é recalcular com a
regra de hoje — e isso **falsifica o registro**: mostra o que o app diria agora,
não o que ele dizia quando o médico decidiu. Numa revisão de caso, é a diferença
entre julgar a conduta pela informação disponível e julgá-la por informação que
não existia.

#### ✅ FECHADA pelo autor em 2026-08-28 — alternativa C, com filtro de relevância clínica

**Duas entidades, e a distinção é normativa:**

| | natureza | persistido? |
|---|---|---|
| **estado derivado atual** | interpretação viva dos fatos e do contexto | **nunca** — sempre recalculado (§4.3) |
| **evento histórico de derivação** | fato de que, naquele instante, com aqueles dados e **aquela versão das regras**, o sistema concluiu aquilo | **sim**, quando teve consequência |

> Não se persiste "o derivado". Persiste-se o **fato histórico** de que ele foi
> derivado — com contexto mínimo para ser auditável depois.

**As três perdas que isto evita** (autor):

1. perder o contexto de uma **concordância ou divergência** médico × sistema;
2. **reconstruir o passado com regras futuras**, falsificando o que o sistema de
   fato mostrava naquele momento;
3. perder a explicação de por que uma ação foi **bloqueada, liberada, proposta ou
   reavaliada**.

#### Critério de entrada na trilha

⛔ **Recálculo sem consequência clínica não vira evento.**

✅ Entra a derivação que **ancorou uma consequência relevante** — por exemplo:
bloqueou uma ação · liberou uma ação · sustentou proposta depois assumida ou
recusada · produziu divergência · alterou destino · abriu uma ação · encerrou
pendência crítica · obrigou reavaliação · mudou materialmente a conduta
disponível.

#### O que o evento carrega, quando aplicável

- **horário**;
- **fatos / insumos relevantes**;
- **conclusão derivada**;
- **versão da regra**, ou referência suficiente para saber qual lógica estava
  vigente.

⚠️ **A implementação técnica da versionagem não é definida agora.** O contrato é
que a lógica vigente seja recuperável; como se representa isso é decisão
posterior. ⇒ **E-24**

⛔ **E o que continua valendo:** nada no app lê esse evento para compor estado
atual. O estado clínico atual deixa de mostrar o derivado no instante em que ele
deixa de valer — sem carência, sem eco.

### 4.8 A herança que não entra automaticamente: 🔴 🟡 🟢

O núcleo legado tinha regra sua, de 2026-08-25: *vermelho bloqueia aquela ação e
nunca o atendimento; amarelo exige decisão explícita com o tipo escolhido; verde
libera.*

**Não a importei.** A Parte 2 já distingue, por espécie, **pendência**,
**bloqueio corrigível** e **contraindicação não corrigível** — que é a distinção
clínica. As cores são **vocabulário de severidade para apresentação**, e §0.7
proíbe reaproveitar o legado por herança automática.

#### ✅ FECHADA pelo autor em 2026-08-28

**As cores pertencem à apresentação, não ao vocabulário clínico do estado.**

Pendência · bloqueio corrigível · contraindicação · ação · destino · julgamento ·
estado derivado **continuam definidos semanticamente sem depender de cor**.

Na **Parte 7** se decide como cada espécie e cada prioridade aparece no mobile. Se
vermelho, amarelo ou verde forem usados, serão **consequência** da semântica e da
prioridade clínica — **nunca a definição delas**.

⛔ **Não reutilizar automaticamente a regra de cores do `LEGACY_ACLS_RUNTIME`.**

### 4.9 Mapa das dez regras

| regra do autor | onde foi formalizada |
|---|---|
| 1 · dado não contém a própria interpretação | §4.1 |
| 2 · derivado recalculado dos fatos e do contexto atual | §4.3 |
| 3 · derivado não é persistido como verdade clínica | §4.3 (e §4.7 para o que **pode** ser guardado) |
| 4 · contexto muda o derivado sem mudar o dado | §4.4-i ⇒ **E-06** |
| 5 · tempo muda o derivado sem interação | §4.4-ii ⇒ **E-01** |
| 6 · correção invalida derivados anteriores | §4.4-iii + §4.7 |
| 7 · ação gera dado novo, e nova derivação | §4.4-iv ⇒ **E-05** |
| 8 · proposta e decisão separadas | §4.5 ⇒ **E-15** |
| 9 · derivação explicável | §4.6 ⇒ **E-22** |
| 10 · ausência não é dado negativo | §4.2 ⇒ **E-23** |

### 4.10 O que a Parte 4 deixa em aberto

- ~~P-06~~ e ~~P-07~~ — **fechadas em 2026-08-28** (§4.7 e §4.8).
- **Toda derivação clínica concreta** — janela, candidatura, meta, corte,
  elegibilidade — depende dos `F-nn`. Esta parte definiu **como** se deriva;
  **o que** se deriva espera o verbatim.

---

## PARTE 5 — SIMULTANEIDADE: O FIM DO "PRÓXIMO PASSO"

> Responde às **nove perguntas** do autor (mapa em §5.10). É a parte que enfrenta
> o defeito estrutural do app anterior — e a única que não pode ser resolvida
> apertando o modelo antigo.

### 5.1 Por que não existe "próximo passo"

A árvore de nó único responde sempre à mesma pergunta: *qual é o próximo nó?*
Num AVC em curso essa pergunta **não tem resposta** — porque cinco coisas estão
acontecendo, e nenhuma delas é "a próxima".

**A evidência é do próprio app.** A coronária chegou a **95 nós**, e ainda assim o
card dela ficou **inalcançável por toque** até um commit de agosto. Não foi
descuido de UI: um grafo que cresce para representar simultaneidade cresce para
sempre, porque cada combinação de frentes vira caminho novo.

**O que substitui o ponteiro:** o estado é o **conjunto de frentes abertas**, cada
uma com o que precisa **agora**. Não há cursor. Ver §5.9.

### 5.2 As frentes do AVC

**Pergunta 1.** Frente é um objetivo clínico que avança por conta própria e tem o
próprio ritmo. Não é aba, não é tela, não é etapa.

| frente | o que persegue | do que depende de verdade | quem nunca a espera |
|---|---|---|---|
| **estabilização** | via aérea, respiração, circulação | nada | ninguém — precede tudo ⇒ **E-04** |
| **relógio** | saber onde o paciente está na linha do tempo | dos relógios clínicos (§1.1) | corre sozinho ⇒ **E-01** |
| **glicemia** | excluir e corrigir mimetizador | glicosímetro | não espera imagem |
| **déficit** | medir e qualificar (NIHSS, incapacitante) | exame do paciente | não espera laboratório |
| **pressão arterial** | manter no alvo que o contexto exigir | contexto de candidatura ⇒ **E-06** | não espera imagem |
| **laboratório** | resolver o que só o exame resolve | coleta | **a imagem não o espera** (§1.7) |
| **imagem** | excluir hemorragia; caracterizar | estabilidade mínima | destrava a reperfusão ⇒ **E-08** |
| **reperfusão IV** | tratar dentro da janela | imagem sem hemorragia + peso + contraindicações | não espera a avaliação de TMV |
| **avaliação de TMV** | decidir trombectomia | imagem vascular | **não espera a infusão IV terminar** ⇒ **E-11** |
| **destino** | para onde o paciente vai | depende da frente que o disparou | — |
| **contexto do paciente** | anticoagulação, comorbidade, funcionalidade basal | informante | não bloqueia a estabilização |

⚠️ **O número de frentes é do modelo clínico, não dos dados.** Frente não nasce de
campo preenchido. Um módulo que cria frente por dado vira lista — §5.8.

### 5.3 As dependências que realmente obrigam sequência

**Pergunta 2.** Aqui está a regra que corrige o erro central do modelo antigo:

> **Dependência liga UMA AÇÃO a UMA CONDIÇÃO. Nunca uma frente inteira a outra
> frente inteira.** ⇒ **E-25**

O modelo antigo sequenciava ramos porque *uma* ação precisava de *um* dado — e
arrastava tudo o que vinha junto. Exemplos da diferença:

| dependência real | o que ela bloqueia | o que ela **não** bloqueia |
|---|---|---|
| hemorragia excluída antes de reperfundir ⇒ **E-08** | **administrar** trombolítico; **realizar** trombectomia | avaliar, preparar, pesar, corrigir PA, acionar equipe |
| peso antes de dose por peso ⇒ **E-14** | **administrar** a dose | tudo o mais da frente de reperfusão |
| PA no alvo antes de iniciar trombólise (**F-04**) | **iniciar** a infusão | preparar, consentir, decidir |
| imagem vascular antes de decidir TMV (**F-08**, **F-16**) | **decidir** trombectomia | acionar transferência, avaliar elegibilidade clínica |
| glicemia antes de atribuir o déficit ao AVC (**F-06**) | **concluir** que o déficit é do AVC | medir NIHSS, estabilizar, levar à imagem |

**Consequência de contrato:** toda dependência declarada nomeia **a ação** e **a
condição**. Dependência declarada entre frentes é erro de modelagem, não decisão
clínica.

### 5.4 O que começa sem esperar — e o que nunca espera o quê

**Perguntas 3 e 8.** §1.7 já fixou a precedência temporal. A Parte 5 acrescenta a
regra de **início**:

> **Uma frente começa quando tem o que precisa para o SEU primeiro passo — não
> quando outra frente termina.**

Começam sem esperar nada: estabilização · relógio · glicemia · déficit · PA ·
coleta de laboratório · contexto do paciente.

E as precedências que não se negociam (§1.7): estabilização não espera nada · a
imagem não espera laboratório, salvo exceção de fonte (**F-07**, **F-10**) ·
terapia tempo-dependente não espera investigação completa · a correção de
hipoglicemia não espera a imagem · **a avaliação de TMV não espera a infusão IV
terminar** ⇒ **E-11**.

### 5.5 A pendência que atravessa frentes

**Pergunta 4.** Pendência tem **dono** e **alcance**, e eles são diferentes:

- **dono:** a frente que precisa daquele dado — é ela que sabe o que a pendência
  significa;
- **alcance:** **global** — a pendência é visível de onde quer que o médico
  esteja.

⛔ **Resolver uma pendência não pode exigir voltar até onde ela nasceu.** Se
exigir, o app aprisiona — que é exatamente o princípio 7. O coagulograma
pendente continua visível enquanto o paciente vai à imagem, e é resolvível dali.
⇒ **E-07**

⚠️ **Pendência não é liberação.** Continua valendo §1.9d e **E-23**: contraindicação
cujo exame não voltou **não** é contraindicação ausente.

### 5.6 Frente bloqueada, atendimento livre

**Pergunta 6.** Duas regras:

1. **Bloqueio é da ação, nunca do atendimento.** Mesmo o bloqueio que governa uma
   classe inteira — hemorragia não excluída, que segura toda a reperfusão
   (**E-08**) — deixa em pé estabilização, PA, glicemia, déficit, laboratório e
   contexto. **A sessão nunca para.**
2. **Toda frente bloqueada declara a condição de desbloqueio.** ⇒ **E-26**

> Frente bloqueada que não diz o que a destrava é um muro. Dizendo, vira tarefa:
> *"reperfusão aguarda a imagem"* é acionável; *"reperfusão indisponível"* não é.

E a condição de desbloqueio é ela própria derivada (§4.6) — declara os insumos que
faltam, e por isso sabe dizer o que falta.

### 5.7 Como uma frente altera outra

**Pergunta 7.** E a resposta é o ponto arquitetural mais importante desta parte:

> **Frentes não conversam entre si. Elas leem os mesmos fatos.** ⇒ **E-27**

Nenhuma frente notifica, chama ou empurra outra. Cada uma deriva do conjunto de
fatos e do contexto atual (§4.3); quando um fato novo entra, **todas** as frentes
que dependem dele mudam por recálculo — não por mensagem.

**Percorrido:** a testemunha chega e corrige a última vez bem →

```
  relógio        recalcula tempo decorrido
  reperfusão IV  candidatura muda — pode abrir, pode fechar
  pressão        o mesmo valor muda de significado          ⇒ E-06
  TMV            elegibilidade por janela muda
  destino        proposta de transferência muda
```

Cinco frentes mudaram. **Nenhuma delas foi avisada.** É o modo (iii) de §4.4, e é
por isso que a propagação por mensagem seria frágil: bastaria uma frente não
inscrita para o app ficar mostrando janela antiga com aparência de atual.

⚠️ **Propagação é por derivação, nunca por navegação.** Mudar de tela não propaga
nada; informar um fato, sim.

### 5.8 Como isto não vira uma lista caótica

**Pergunta 5.** Quatro mecanismos, e nenhum deles é esconder:

1. **A unidade exibida é a frente, não a tarefa.** A tela não mostra N tarefas
   soltas: mostra M frentes, cada uma com **o seu próximo passo**. M é pequeno e
   vem do modelo clínico (§5.2), não dos dados.
2. **A ordem é clínica, não cronológica.** Ordena-se pelo que é tempo-dependente e
   ainda cabe na janela, depois pelo que **desbloqueia mais coisa**, depois pelo
   que já está pronto para ser feito. Ordem de criação não ordena nada.
3. **Frente sem próximo passo não ocupa espaço de decisão.** Ela não some — some
   da fila de ação, e continua legível como estado.
4. **Nada desaparece por não ser prioridade.** Prioridade ordena; não oculta.

⚠️ **Onde isto vira pixel é a Parte 7** — e lá vale a proibição que já custou
caro: **decisão crítica não fica atrás de conteúdo recolhido**. O C1 escondeu 15%
do conteúdo das árvores por contagem de itens, incluindo os padrões que decidem
sala de hemodinâmica. O critério de exibição desta spec é **clínico**, nunca
aritmético.

### 5.9 Como o estado atual é reconstruído sem ponteiro global

**Pergunta 9 — a mais estrutural de todas.**

O app **não pergunta "onde o paciente está"**. Ele pergunta, para cada frente:
*o que esta frente precisa agora?* A resposta de todas, junta, **é** o estado.

```
  fatos (§3.2)  +  contexto atual  ──derivação(§4.3)──▶  para cada frente:
                                                          · o que já tem
                                                          · o que falta
                                                          · o que está bloqueado
                                                            e por quê
                                                          · qual é o próximo passo
                                                            dela, se houver
```

**Quatro consequências duras:**

1. **Não existe posição.** Não há "nó atual", não há cursor, não há caminho
   percorrido que precise ser guardado para o app saber onde está.
2. **Navegação não é estado.** Avançar, voltar ou mudar de seção não altera nada
   clínico — já era **E-20**, e aqui ganha a razão de fundo: não há o que alterar,
   porque não há posição.
3. **Retomar um atendimento é recalcular, não restaurar.** Reabrir o caso deriva
   tudo de novo a partir da trilha e do relógio de agora. É a mesma razão de §3.7:
   destino cancelado não devolve o paciente ao ponto onde ele estava — **não
   existe ponto para voltar**.
4. **"Onde eu estava" é conveniência de interface.** Pode existir como última
   frente vista. **Nunca** é verdade clínica, e nunca decide o que o app mostra
   como prioritário.

### 5.10 Mapa das nove perguntas

| pergunta do autor | onde foi respondida |
|---|---|
| 1 · quais frentes correm em paralelo | §5.2 |
| 2 · quais dependências obrigam sequência | §5.3 ⇒ **E-25** |
| 3 · o que começa sem esperar | §5.4 |
| 4 · pendência visível em outra frente | §5.5 ⇒ **E-07** |
| 5 · como não virar lista caótica | §5.8 |
| 6 · frente bloqueada sem bloquear o atendimento | §5.6 ⇒ **E-26** |
| 7 · nova informação reabre outra frente | §5.7 ⇒ **E-27** |
| 8 · o que nunca espera o quê | §5.4 + §1.7 |
| 9 · estado sem ponteiro de próximo passo | §5.9 |

### 5.11 O que a Parte 5 deixa em aberto

- **Quais frentes existem de fato** — §5.2 traz as do atendimento inicial. A lista
  fecha quando os `F-nn` disserem o que a fonte exige.
- **Como a ordem clínica de §5.8 se traduz em tela** — Parte 7.
- **Concorrência entre operadores.** Duas pessoas registrando no mesmo
  atendimento é problema real de sala de emergência, e depende da autoria (§3.9,
  ainda aberta) e da persistência (§3.9). Registrado, não resolvido.

---

## PARTE 6 — ONDE MORA A MEDICINA

> Responde aos **dez itens obrigatórios** ditados pelo autor em 2026-08-28 (mapa
> em §6.12). Escrita **antes** do PDF de propósito: é o contrato que a própria
> fonte terá de obedecer quando chegar.

### 6.0 Duas camadas que usam as mesmas palavras

Antes de tudo, uma desambiguação que a spec precisa fazer explicitamente:

| | do que trata | exemplo |
|---|---|---|
| **Parte 2 — espécies do ESTADO** | como **este paciente** está agora | "contraindicação não corrigível" = *este* paciente tem uma |
| **Parte 6 — espécies do CONTEÚDO** | o que **o conhecimento** afirma | "contraindicação" = o que a fonte lista como impeditivo |

A ponte entre as duas é sempre a mesma:

```
   conteúdo (Parte 6) ──▶ regra clínica ──▶ derivação (Parte 4) ──▶ estado (Parte 2)
```

⚠️ **"Contraindicação", "dose" e "meta" existem nas duas camadas com sentidos
diferentes.** Confundi-las é como gravar interpretação dentro do dado (§4.1), um
andar acima.

### 6.1 As doze espécies de conteúdo clínico

**Item 1.** Cada uma com o que a define e com **o que exige de fonte**:

| espécie | o que é | exige fonte? |
|---|---|---|
| **dado apresentado ao médico** | valor vindo **do atendimento**, exibido de volta | não — a origem é o paciente, não a literatura |
| **afirmação clínica** | proposição sobre o mundo, sustentável por trecho | **sim, sempre** |
| **regra clínica** | afirmação em forma operável — "se X, então Y" — que a derivação consome | sim, via as afirmações que a compõem |
| **recomendação** | o que a fonte **aconselha fazer** | sim, com força |
| **contraindicação** | condição que a fonte diz **impedir** uma conduta | sim, e separada em corrigível × não corrigível (§2.7) |
| **dose** | quantidade **+ via + tempo + população + teto**, quando houver | sim — número solto não é dose |
| **meta** | **alvo a atingir** | sim |
| **limite** | valor em que **a conduta muda** | sim |
| **janela temporal** | intervalo de validade de uma conduta, **contado de um marco declarado** | sim ⇒ **E-32** |
| **classe / força + nível de evidência** | metadado da recomendação | é da fonte; viaja **colado** à recomendação |
| **referência bibliográfica** | identificação do documento | ⚠️ **não é fonte** — ver §6.5 |
| **texto de apresentação** | redação de UX | não afirma nada clínico novo |

**Três fronteiras que se perdem com facilidade:**

- **meta ≠ limite.** Meta é onde se quer chegar; limite é onde a conduta muda.
  Escrever uma no lugar da outra troca "tratar até" por "tratar se".
- **recomendação ≠ regra.** A recomendação é o ato de aconselhar da fonte; a regra
  é a forma condicional que o app opera. Uma recomendação vira **zero, uma ou
  várias** regras — e essa conversão é trabalho declarado, não cópia.
- **janela sem marco não é janela.** O módulo tem cinco relógios (§1.1). Janela que
  não diz de qual marco se conta é ambígua exatamente onde o erro é caro.
  ⇒ **E-32**

⛔ **Nenhuma espécie herda a fonte da vizinha por aparecer junto na tela.**
Proximidade visual não transfere procedência: uma dose ao lado de uma
recomendação citada continua sem fonte própria. ⇒ **E-28**

### 6.2 Onde cada coisa mora

**Item 2.** **A tela não é dona da medicina.**

**A tela PODE:** escolher apresentação · organizar informação · mostrar ou
esconder conforme o estado · oferecer interação.

**A tela NÃO PODE ser fonte primária de:** dose · contraindicação · meta · regra
de elegibilidade · corte · janela · recomendação terapêutica. ⇒ **E-29**

> **Regra operacional:** se a tela precisa de um número que não existe na camada
> de conteúdo, **o número não existe**. Não se cria na tela — cria-se na camada,
> com fonte, ou não se cria.

**Por que isto é o eixo da reconstrução:** a auditoria contou **495 ocorrências de
conteúdo clínico dentro de componentes** e **2.567 afirmações repetidas em mais de
um arquivo**. Enquanto a dose morar na tela, atualizar uma recomendação exige
caçá-la na interface — e a mesma informação diverge entre dois lugares sem que
ninguém perceba.

⚠️ **"Esconder conforme o estado" tem teto.** Continua valendo a proibição de
§5.8: **decisão crítica não fica atrás de conteúdo recolhido**, e o critério de
exibição é clínico, nunca aritmético. A forma disso é **Parte 7**.

### 6.3 A menor unidade auditável

**Item 3.** Não é a página, não é o módulo, não é a regra.

> **A menor unidade auditável é a AFIRMAÇÃO.**

Porque uma regra pode repousar sobre várias afirmações, cada uma com fonte,
localização e grau **próprios** — e auditar a regra inteira esconde qual das
pernas não tem chão.

**A cadeia completa, por afirmação:**

```
  regra clínica
     └─ afirmação                    ← unidade auditável
          ├─ fonte citada            (§6.4)
          ├─ trecho verbatim
          ├─ localização no documento (seção · tabela · página)
          ├─ grau / nível             (quando existir)
          ├─ população                (§6.8)
          └─ data e responsável pela transcrição
```

⚠️ **Rastreabilidade é propriedade da afirmação, não do arquivo.** Citar a
diretriz no cabeçalho não torna rastreável o que está na linha 300 — foi assim
que a auditoria encontrou **7.880 afirmações de risco alto ou crítico sem citação
no lugar onde estão**. ⇒ **E-30**

*(Como isso se representa em banco ou schema não é definido aqui.)*

### 6.4 Fonte vigente × fonte citada

**Item 4.**

| | definição |
|---|---|
| **fonte vigente** | documento que o autor escolheu como **base atual** daquele domínio — a fonte-mãe (§0.5) |
| **fonte citada** | documento efetivamente usado para sustentar **aquela afirmação específica** |

**As quatro relações possíveis, e o que cada uma exige:**

1. **citada = vigente** — caso normal, nada a declarar.
2. **citada complementar, vigente silenciosa** — a fonte-mãe não trata do ponto.
   Permitido, **com marcação explícita**: *"a fonte-mãe não trata disto"*.
   Preencher lacuna **não** é substituir.
3. **citada complementar, contradizendo a vigente** — **não é escolha, é
   divergência** (§6.6). A regra não entra até o autor decidir.
4. **citada substituindo a vigente sem marcação** — ⛔ proibido. É a substituição
   silenciosa que §0.5 nomeia.

### 6.5 Ausência de verbatim

**Item 5.** Estados possíveis de uma afirmação quanto à fonte:

| estado | o que se tem | autoriza número clínico? |
|---|---|---|
| `sem fonte` | nada | ⛔ não |
| `fonte identificada, conteúdo não validado` | DOI · PMID · resumo · página secundária · **memória** | ⛔ **não** |
| `transcrita` | verbatim + localização | ✅ sim |
| `transcrita e conferida pelo autor` | verbatim conferido contra o documento | ✅ sim, e é o alvo |

> **Referência bibliográfica não é fonte; texto é.** A regra já estava escrita em
> `protocols/fontes-verbatim/ACHADOS-SEM-VERBATIM.md` e vale sem exceção aqui.

⛔ **Memória nunca preenche lacuna.** Nem de quem escreve a spec, nem de quem
escreve o código. Conhecimento sem trecho é `fonte identificada, conteúdo não
validado` — e esse estado **não autoriza** dose, meta, limite, janela,
contraindicação nem classe de recomendação. ⇒ **E-31**

**Estado atual do módulo:** os **17 slots `F-nn`** estão todos em `fonte
identificada, conteúdo não validado`. A fonte-mãe está declarada; o texto, não.

### 6.6 Divergência entre fontes

**Item 6.** Quando AHA/ASA, ESO, estudo primário e documento brasileiro
discordarem, **não se escolhe em silêncio**. Registra-se:

1. **qual é a divergência** — o ponto exato, não "as fontes divergem";
2. **quais fontes divergem**, com o trecho de cada uma;
3. **impacto clínico** — o que muda na conduta do paciente;
4. **decisão do autor**;
5. **qual regra foi adotada**, e sob qual fonte ela passa a viver.

⚠️ **Divergência não resolvida bloqueia o conteúdo, não o atendimento.** A regra
não entra no app enquanto o autor não decidir — e a ausência dela é lacuna
declarada, não silêncio.

#### ⚠️ Inconsistência DENTRO de uma fonte — o que ela bloqueia, e o que não

**Regra fixada pelo autor em 2026-08-28**, a partir do preparo de insulina (F-18):

> **Uma inconsistência em uma fonte bloqueia o uso daquela AFIRMAÇÃO
> inconsistente — ⛔ não necessariamente o CAMPO CLÍNICO inteiro, se outra fonte
> adequada e independente o sustentar explicitamente.** ⇒ **E-51**

| | |
|---|---|
| ⛔ **não fazer** | reconciliação **silenciosa** entre fontes |
| ⛔ **não fazer** | apagar a inconsistência ao encontrar outra fonte |
| ✅ **sempre fazer** | **registrar qual fonte sustenta o campo final** |

**O caso que originou a regra:** a diretriz SBD do paciente crítico declara
concentração de `1 U/mL` e, na mesma frase, descreve um preparo aritmeticamente
incompatível. A diretriz SBD **perioperatória** — independente — publica
`100 UI em 100 mL de NaCl 0,9%`, explícito e sem ambiguidade.
✅ O **campo** fecha pela segunda; ⛔ a **afirmação inconsistente** da primeira
permanece registrada e **não utilizável**.

**Três coisas diferentes que costumam ser chamadas de divergência:**

| | o que é | o que exige |
|---|---|---|
| **divergência** | duas fontes afirmam coisas incompatíveis | os cinco registros acima |
| **lacuna** | a fonte-mãe não trata do ponto | complementar marcada (§6.4-2) |
| **desatualização** | a fonte citada é anterior à vigente | revalidação (§6.10) |

### 6.7 Adaptação brasileira

**Item 7.** Dois eixos independentes, e confundi-los é o erro:

> **evidência clínica** (o que a literatura sustenta) ≠ **disponibilidade
> operacional no Brasil** (o que existe à beira do leito aqui).

| | disponível no Brasil | indisponível no Brasil |
|---|---|---|
| **recomendada pela fonte** | conduta apresentável | ⚠️ **não pode ser apresentada como executável** — exige alternativa com suporte próprio |
| **não é 1ª opção da fonte** | ⚠️ exige **suporte brasileiro próprio** | fora do módulo |

⛔ **Disponibilidade não se infere de guideline americana.** Exige **fonte
brasileira ou verificação específica de disponibilidade** — regra permanente do
autor, registrada em `fontes-vigentes.json`. ⇒ **E-18**

**Vale especialmente para:** anti-hipertensivos IV · apresentações ·
concentrações · forma de administração · disponibilidade comercial.

⚠️ **E a adaptação aparece como adaptação.** O médico precisa saber que aquilo
não é o que a fonte-mãe recomenda — adaptação silenciosa é o mesmo defeito da
substituição silenciosa, do lado da farmácia.

**O caso registrado (F-12):** o módulo removido registrava que os
anti-hipertensivos IV citados pela AHA não têm apresentação intravenosa
comercializada no Brasil. **Ponteiro para conferência, não conteúdo aprovado** — e
a fonte que resolve isso não é a AHA/ASA 2026.

### 6.8 Filtro populacional, na origem

**Item 8.** **AVC V1 é adulto** (§0.1). Se o documento-fonte contiver pediatria,
gestação ou outra população específica, **o fragmento não entra automaticamente**
no universo do módulo adulto.

> **A exclusão ocorre na ORIGEM DA TRANSCRIÇÃO, nunca depois na UI.** ⇒ **E-17**

**Por que na origem:** os **oito fragmentos pediátricos** que já entraram no app
entraram todos pela mesma via — fonte que cita as duas populações, número
pediátrico copiado junto com o adulto. Filtrar na tela é filtrar depois de o
conteúdo já existir, e conteúdo que existe vaza.

⚠️ **Agravante desta fonte:** a AHA/ASA 2026 traz **também** a primeira orientação
pediátrica de AVC da AHA/ASA. O risco não é teórico nesta transcrição.

⚠️ **Excluir da transcrição não faz a paciente sumir da emergência.** Gestante com
AVC existe. A exclusão gera **lacuna declarada**, tratada como as saídas de §0.1:
apontada, nomeada, e não implementada agora — nunca silêncio.

### 6.9 Conteúdo copiado × estruturado × derivado × redação

**Item 9.** Quatro níveis, e **todo texto exibido declara a qual pertence**:

| nível | o que é | como se demonstra |
|---|---|---|
| **1 · sustentado pela fonte** | paráfrase fiel de um trecho | rastreio 1:1 até o verbatim (§6.3) |
| **2 · estruturado pelo app** | a fonte diz em prosa; o app organiza em campo, opção ou passo | a **estrutura** é nossa, o **conteúdo** é dela — demonstra-se o trecho + a transformação |
| **3 · derivado** | conclusão que **não existe na fonte**: nasce de vários fatos | rastreia-se às **regras e aos fatos** (Parte 4), não a um trecho ⇒ **E-22** |
| **4 · redação de UX** | não afirma nada clínico | ⛔ não pode conter número, corte ou conduta |

> **A fonte não precisa conter a frase exibida — mas a construção precisa ser
> demonstrável.** Nível 2 e 3 exigem mostrar a cadeia; nível 4 exige não ter
> cadeia nenhuma, porque não afirma nada. ⇒ **E-33**

⚠️ **O nível 4 é o mais perigoso**, porque parece inofensivo. Um texto de
apresentação que diz "corrija rapidamente" está prescrevendo urgência sem fonte.
Se afirma, não é nível 4.

### 6.10 Quando uma guideline é substituída

**Item 10.** A obrigação — **não o versionamento**.

Ao trocar a fonte vigente de um domínio, o módulo tem de conseguir responder
**quatro perguntas**:

1. **quais regras dependem dela?**
2. **quais telas passam a potencialmente exibir conteúdo desatualizado?**
3. **quais eventos históricos foram produzidos sob a versão antiga?**
4. **o que precisa ser revalidado?**

⚠️ **A pergunta 3 já tem resposta estrutural.** É exatamente para isso que o
evento histórico de derivação carrega **qual lógica estava vigente** (**E-24**,
§4.7): sem isso, revisar um caso antigo significaria recalculá-lo com a regra de
hoje — falsificando o que o sistema de fato mostrava.

**O que a obrigação implica, e é tudo o que se define agora:** a dependência
regra → fonte precisa ser **navegável nos dois sentidos**. Da fonte, saber quais
regras caem; da regra, saber qual fonte a sustenta. ⇒ **E-34**

*(Como se representa versão de regra e de fonte: decisão posterior.)*

### 6.11 O contrato que cada F-nn terá de cumprir

Quando o PDF chegar, **um slot só fecha** entregando:

| # | exigência | de onde vem |
|---|---|---|
| 1 | **trecho verbatim** | §6.5 |
| 2 | **localização** — seção · tabela · página | §6.3 |
| 3 | **grau e nível**, quando existirem | §6.1 |
| 4 | **população** a que o trecho se aplica | §6.8 |
| 5 | **espécie de conteúdo** — dose? meta? limite? janela? | §6.1 |
| 6 | **marco**, se for janela temporal | §6.1 ⇒ **E-32** |
| 7 | **fonte-mãe ou complementar**, e a marcação se for complementar | §6.4 |
| 8 | **divergências conhecidas**, com os cinco registros | §6.6 |
| 9 | **exige adaptação brasileira?** | §6.7 |
| 10 | **nível de construção** do texto que dali sair (1 a 4) | §6.9 |
| 11 | **data e responsável** pela transcrição | §6.3 |

⛔ **Slot que entrega número sem os itens 1, 2 e 4 não está fechado** — está
preenchido, que é diferente, e é o estado que esta spec existe para impedir.

### 6.12 Mapa dos dez itens

| item do autor | onde foi respondido |
|---|---|
| 1 · o que é conteúdo clínico | §6.1 ⇒ **E-28**, **E-32** |
| 2 · onde cada coisa mora | §6.2 ⇒ **E-29** |
| 3 · granularidade da fonte | §6.3 ⇒ **E-30** |
| 4 · fonte vigente × citada | §6.4 |
| 5 · ausência de verbatim | §6.5 ⇒ **E-31** |
| 6 · divergência entre fontes | §6.6 |
| 7 · adaptação brasileira | §6.7 ⇒ **E-18** |
| 8 · filtro populacional | §6.8 ⇒ **E-17** |
| 9 · copiado × derivado | §6.9 ⇒ **E-33** |
| 10 · atualização futura | §6.10 ⇒ **E-34** |

### 6.14 Idioma da fonte × idioma do app

**Regra acrescentada pelo autor em 2026-08-28, antes da transcrição.** Fonte
científica e idioma da interface são **camadas diferentes**.

#### 1 · O verbatim permanece no idioma original

Todo trecho armazenado em `protocols/fontes-verbatim/` fica **exatamente no
idioma da publicação** — aqui, **inglês**. ⛔ **Não traduzir o verbatim:** ele é a
**evidência auditável**, e evidência traduzida é evidência adulterada.

Registrar junto: **página · seção · tabela/recomendação quando aplicável · COR ·
LOE · população · observações relevantes**.

#### 2 · A regra clínica é independente do idioma

A regra derivada do verbatim é **semanticamente independente da interface**.
⛔ Não existe lógica clínica diferente para PT-BR e ES: **a mesma regra alimenta
os dois idiomas**.

#### 3 · Tudo que o médico vê existe em PT-BR e ES

Nomes de estados · alertas · recomendações · contraindicações · doses · metas ·
mensagens de pendência · mensagens de bloqueio · racional clínico curto · botões
e labels · textos auxiliares.

⛔ **Não exibir inglês ao usuário só porque a guideline está em inglês.**

#### 4 · Tradução não vira fonte

A tradução é **conteúdo de apresentação**. Nunca substitui o verbatim. A cadeia
permanece:

```
   verbatim original (EN)  →  afirmação clínica  →  regra  →  conteúdo localizado PT-BR / ES
```

#### 5 · Fidelidade da tradução clínica ⇒ **E-45**

A tradução preserva **intensidade da recomendação · condição · exceção ·
população · temporalidade · grau de certeza**. ⛔ Não suavizar nem endurecer
palavra clinicamente relevante.

> **O caso que a regra nomeia:** `recommended` · `reasonable` · `may be
> reasonable` · `not recommended` · `harmful` são **cinco intensidades
> diferentes**. Achatá-las em "recomendado" e "não recomendado" destrói a
> gradação que a fonte construiu — e é a forma mais silenciosa de mudar a
> medicina sem mudar nenhum número.

Isto liga direto ao **COR** (§6.1): a intensidade verbal e a classe de
recomendação são duas expressões da mesma força, e nenhuma das duas se perde na
tradução.

#### 6 · Adulto na origem

O AVC V1 é adulto. A guideline contém recomendações pediátricas — **filtrar
população durante a transcrição, antes da regra clínica** (**E-17**, §6.8).
⛔ Não transcrever pediátrico para o universo adulto e tentar escondê-lo na UI
depois.

### 6.13 O que a Parte 6 deixa em aberto

- **Onde a camada de conteúdo mora fisicamente** — arquivo, banco, formato.
  Decisão posterior; §6.2 fixa apenas que **não é a tela**.
- **Como se representa versão** de regra e de fonte (§6.10).
- **O registro de divergências** — §6.6 define o que se registra; onde isso vive
  segue a convenção da casa (`DIVIDAS-CONHECIDAS.md` é o precedente), e não é
  decidido aqui.
- **O MECANISMO da tradução PT/ES** (**E-12**, **Q-03**): se a camada de conteúdo
  guarda as duas línguas lado a lado, ou se o espanhol é derivado por dicionário.
  ⚠️ A **política** de tradução está fechada em §6.14; o mecanismo, não.

---

## PARTE 7 — A SUPERFÍCIE: MOBILE, ENTRADA E VISIBILIDADE

> Contrato de **uso real em smartphone**, não guia visual. Responde aos **vinte
> itens** ditados pelo autor em 2026-08-28. Termina na tabela de §7.20:
> **necessidade clínica → obrigação de superfície → como se prova**.
>
> ⚠️ **E-nn novas só onde a necessidade veio do AVC real.** Preferência estética
> não gera exigência.

### 7.1 A premissa: o celular na emergência

O módulo será usado majoritariamente no celular — **com uma mão**, em ambiente de
emergência, **com interrupções**, com pouco tempo, sob alta carga cognitiva, e com
necessidade de **voltar rápido ao ponto clínico relevante**.

> **Densidade de informação, tamanho de controle e quantidade de elementos
> simultâneos são decisões clínicas.** Um controle pequeno demais não é feio: é
> um toque errado num campo que alimenta dose.

### 7.2 Uma tela não é uma etapa clínica

⛔ Não voltar ao modelo `Tela 1 → Tela 2 → Tela 3 → próxima decisão`.

> **As telas são janelas sobre o estado clínico vivo.** O atendimento existe
> independentemente de qual seção está aberta.

A pendência de PA continua ativa enquanto o médico olha a imagem ou o NIHSS
(§5.5). É a consequência de superfície de §5.9: **não há posição**, logo não há
tela que "seja" o estado — só vistas sobre ele.

### 7.3 Hierarquia de visibilidade — a resposta ao C1

**Item 3.** Três camadas:

| camada | o que ocupa | critério |
|---|---|---|
| **sempre visível** | o que pode mudar conduta **imediata** ou precisa permanecer lembrado | consequência agora |
| **visível no contexto atual** | o necessário para a frente em que o médico trabalha | pertinência à frente |
| **sob expansão deliberada** | detalhe explicativo, evidência, racional, complementar | consulta, não execução |

> ⛔ **Conteúdo que muda uma decisão clínica não fica escondido por padrão para a
> tela parecer limpa.**
>
> **O recolhimento é determinado por IMPORTÂNCIA CLÍNICA, nunca por número de
> itens.** ⇒ **E-35**

**Por que isto é a regra mais cara desta parte.** O critério antigo era
aritmético — `itens.length <= 2` — e mandou **15% do conteúdo das árvores** para
trás de um toque, **incluindo os padrões de oclusão coronária que decidem sala de
hemodinâmica**. O defeito não foi a decisão de recolher: foi recolher por
contagem.

⚠️ **A camada é derivada, não atributo fixo.** A mesma informação pode ser
"sempre visível" enquanto a janela está aberta e "sob expansão" depois que ela
fecha. A visibilidade se recalcula com o estado, como tudo mais (§4.3).

**O teste da camada:** *esta informação, se não for vista agora, pode mudar a
conduta deste paciente neste momento?* Se sim, ela não nasce recolhida.

### 7.4 Campo numérico

**Itens 4 e 5.** Padrão obrigatório, sem exceção para grandeza clínica comum:

```
        −     PAS  198 mmHg     +
        ●━━━━━━━━━━━━━━━━━━━━━━━━━
```

- **valor** legível e sempre presente;
- **slider** como mecanismo primário de ajuste rápido;
- **`−` / `+`** tocáveis para precisão;
- ⛔ **sem caixa de texto livre** para valores clínicos comuns.

**Estado inicial.** Todo campo de grandeza abre visualmente em `0`, e enquanto não
houver interação **`0` = não informado**. O primeiro movimento do slider ou o
primeiro toque em `−`/`+` **transforma o campo em informado**.

⚠️ **Obrigação de superfície que decorre disto:** `0 não informado` e `0 informado`
**precisam ser visualmente distinguíveis**. Se forem idênticos, a regra de §0.2
existe no modelo e não existe para o médico.

**Vale para:** idade · peso · altura · PAS · PAD · glicemia · SpO₂ · FC · FR ·
temperatura · equivalentes.
**Não vale para escalas em que zero é resultado válido** — NIHSS total, item do
NIHSS, mRS (§0.2, **E-10**).

**Granularidade do ajuste fino pertence à grandeza.** O passo de `−`/`+` é
propriedade da grandeza, não do componente — e a **faixa** também. A auditoria
encontrou calculadoras aceitando idade de 400 anos e produzindo clearance
negativo: faixa fisiológica é restrição clínica, não validação de formulário.

*(Passos e faixas concretos não são escritos aqui — pertencem à camada de
conteúdo, §6.2.)*

### 7.5 Tempo

**Item 6.** ⛔ **Horário do AVC não usa slider.** Usa **picker de hora e minuto**,
com opções explícitas quando aplicáveis:

> `DESCONHECIDO` · `AO ACORDAR (wake-up)` · `MESMO HORÁRIO DE OUTRO EVENTO`

> **Todo controle de tempo nomeia QUAL relógio está informando.** ⛔ Nunca
> apresentar apenas "horário". ⇒ **E-36**

Os cinco relógios de §1.1: **última vez bem · início observado · reconhecimento ·
t₀ operacional · hora de registro**. Destes, quatro são informáveis; a **hora de
registro é automática e nunca informada pelo usuário** (§3.2).

⚠️ **A ambiguidade aqui é a mais cara do módulo**: um horário atribuído ao relógio
errado produz janela errada com aparência de precisão (**E-21**).

#### P-08 · ✅ FECHADA em 2026-08-28 — cópia com linhagem, nunca vínculo vivo

Ao escolher `MESMO HORÁRIO DE [evento]`, o sistema **copia o valor daquele evento
naquele instante**. O dado novo registra a **linhagem**:

- **qual evento** foi usado como origem;
- **qual valor** foi copiado;
- **quando** a cópia ocorreu.

**A partir daí os dois dados são independentes.** Se a origem for corrigida
depois, o dado copiado **não muda automaticamente**.

> ⛔ **Nenhuma alteração silenciosa de horário clínico que possa modificar janela
> terapêutica.** ⇒ **E-42**

**Mas a linhagem não é decorativa:** corrigida a origem, o sistema **detecta a
relação e abre uma pendência de consistência** —

```
   ⚑  O horário de origem foi corrigido.
      Este valor foi copiado dele.  → REVISAR
```

E o médico decide: **manter · corrigir · confirmar novamente**. As três são
registros (§3.4): confirmar de novo não é não fazer nada — é afirmar o valor com
hora nova.

> **cópia com linhagem ≠ vínculo sincronizado.**

Compatível com a trilha e com a correção de registro da Parte 3: a linhagem é
mais um campo de procedência (§3.2), e a pendência de consistência é pendência
comum — tem dono, alcance global e é acionável de qualquer superfície (§5.5).

### 7.6 Escolhas clínicas

**Item 7.** ⛔ Sem campo de texto livre para escolhas comuns. **Opções tocáveis:**

```
        PRESERVADA  │  AMEAÇADA
        SIM  │  NÃO  │  NÃO SEI
```

**Quando a realidade clínica permite coexistência, seleção múltipla.** ⛔ Não usar
escolha única por conveniência de implementação — "dor + irradiação + sudorese" é
**um** paciente, não três alternativas.

### 7.7 "Não sei" é resposta real

**Item 8.** A superfície representa **três estados, sem ambiguidade**:

| estado | o que significa |
|---|---|
| **não respondido** | ninguém abordou o assunto |
| **`NÃO SEI` / `DESCONHECIDO`** | há resposta, e ela é a incerteza ⇒ **E-02** |
| **resposta negativa** | fato observado negativo |

> **Os três precisam ser distinguíveis olhando.** ⇒ **E-37**

**Por que aqui e não só no modelo:** é a fronteira de **E-23** na tela. Se "nada
informado sobre anticoagulante" **parecer** "não usa anticoagulante", o médico lê
liberação onde havia silêncio — e a leitura acontece na superfície, não no motor.

### 7.8 O estado atual, no topo

**Item 9.** Resumo **compacto e persistente**, não painel. Mostra apenas o que é
relevante **naquele momento**:

```
   LKW há …    PA …    Glicemia …    NIHSS …    TC …     ⚑ pendências
```

⛔ **Não repetir a ficha inteira.** O que aparece é **derivado** (§4.3), não lista
fixa: entra o que tem consequência agora, sai o que deixou de ter.

⚠️ **O argumento mais forte para o resumo ser persistente é o relógio.** O tempo
desde a última vez bem é o único valor que **muda sozinho** (**E-01**). Se ele só
existir numa seção, o médico trabalha em outra sem ver a janela fechar.

### 7.9 Pendência persistente, compacta e acionável

**Item 10.** Pendência nascida numa seção **continua visível em outra** (§5.5,
**E-07**) — e **não ocupa metade da tela**.

**Representação exigida:** uma linha · o que falta · a frente dona · **acionável
dali**, sem navegar de volta até onde nasceu.

```
   ⚑  PA acima do necessário para reperfusão          → CORRIGIR
```

**Ordem é clínica** (§5.8): tempo-dependente primeiro, depois o que desbloqueia
mais coisa, depois o que já está pronto. **Ordem de criação não ordena nada.**

⛔ Prioridade **ordena**; não **oculta**.

### 7.10 Frente bloqueada não bloqueia o app

**Item 11.** Mostrar **o que está bloqueado · por quê · o que desbloqueia**
(**E-26**) — e deixar o médico seguir nas outras frentes.

> ⛔ **Nenhum bloqueio clínico usa modal obrigatório.**

Não é preferência de interação: **bloqueio é da ação, nunca do atendimento**
(§5.6). Modal que interrompe tudo contradiz o modelo — e num AVC interrompe
exatamente quem está tentando ganhar tempo em outra frente.

### 7.11 Correções: superfície focada, mesmo atendimento

**Item 12.** Da pendência, o médico toca e abre uma superfície **focada apenas
naquela correção**:

```
   PA inadequada para [ação]  →  CORRIGIR PA
        ├ opções terapêuticas válidas
        ├ doses                          ⚠️ camada de conteúdo (§6.2), não a tela
        ├ contraindicações pertinentes
        ├ racional mínimo
        ├ registro de administração      → ação (§2.3)
        └ nova aferição                  → dado novo, não correção (§3.4)
```

> ⛔ **Correção não vira submódulo.** Ela pertence ao mesmo atendimento: não há
> navegação que "saia" do caso, e ao fechar **volta-se ao estado recalculado** —
> não à tela anterior. ⇒ **E-38**

⚠️ **"Volta ao estado atualizado" é consequência de §5.9:** não existe ponto para
restaurar. Fechar a correção **recalcula**; se o tempo passou, o que se vê ao
voltar pode ser diferente do que se via ao entrar, e isso é correto.

### 7.12 Ação clínica, visível em cinco estados

**Item 13.** ⛔ Nenhuma ação é marcada como realizada porque o médico abriu a
opção ou avançou (**E-20**).

A superfície distingue os cinco estados de §2.3 — **disponível · sugerida ·
iniciada · realizada · cancelada** — **sem depender apenas de cor**: rótulo em
texto, e a marca própria de cada um (ação realizada carrega **hora**; sugerida
carrega a razão; bloqueada carrega a condição de desbloqueio).

⛔ **Posição na tela não é estado.** Nada é "realizado" por estar mais abaixo.

### 7.13 Cor é reforço, nunca portador único

**Item 14.** Vermelho, amarelo e verde **podem** ser usados. Mas:

> **Todo estado precisa ser compreensível sem cor** — texto, e símbolo quando
> útil. ⇒ **E-39**

E a razão é clínica antes de ser acessibilidade: **as espécies da Parte 2 são
semanticamente distintas, e cor comporta ordem, não espécie.** Pendência,
bloqueio corrigível e contraindicação não corrigível não são três intensidades da
mesma coisa — são três coisas diferentes, com condutas diferentes. Um semáforo as
achataria numa escala.

**A semântica vem das espécies clínicas, não do semáforo** (P-07, §4.8). ⛔ Não
reutilizar a regra de cores do `LEGACY_ACLS_RUNTIME`.

### 7.14 Densidade por tela

**Item 15.** Princípio de ergonomia, **não trava de build**:

- **4 a 6 controles principais** visíveis por agrupamento;
- agrupamentos curtos;
- rolagem **vertical** natural;
- ⛔ **sem rolagem horizontal para conteúdo clínico**;
- área de toque confortável.

⚠️ **Estes números não viram trava agora.** Transformá-los em reprovação de build
antes de existir uma tela real produziria trava que mede o que ninguém construiu
— e a spec já tem 92 travas para auditar, algumas exatamente nessa condição.

### 7.15 As superfícies iniciais do AVC

**Item 16, revisto pelo autor em 2026-08-28 (P-09).** Divisão de **superfície**,
não sequência obrigatória. Nenhuma delas é etapa; qualquer uma pode ser aberta a
qualquer momento (§7.2).

| superfície | conteúdo |
|---|---|
| **A · Entrada / estabilização** | idade · peso · altura · tempo · consciência · via aérea · SpO₂ · PA · glicemia · convulsão |
| **B · Neurológico** | déficit focal · NIHSS · déficit incapacitante · lateralidade · mRS prévio/contexto · evolução dos sintomas |
| **C · Imagem** | TC · resultado · hemorragia · suspeita de HSA · angio-TC · informação para a frente endovascular |
| **D · Segurança / Elegibilidade** | anticoagulante em uso · tipo · última dose · antiagregantes quando relevantes · cirurgia recente · trauma · punções e procedimentos relevantes · sangramento · INR/coagulograma quando aplicável · plaquetas · outros exames necessários · demais condições de segurança **sustentadas pela fonte** |
| **E · Reperfusão** | **IVT e EVT lado a lado**, duas frentes em paralelo ⇒ **E-11** |
| **F · Correções** | contextuais: PA · glicemia · outras condições corrigíveis (§7.11) |
| **G · Destino / acompanhamento inicial** | transferência · pós-reperfusão · unidade de AVC/UTI · saída para outro fluxo |

#### D coleta fatos — D não contém o veredito

> ⛔ **Não existe lista estática chamada "contraindicações" em que o médico marque
> o veredito diretamente.** ⇒ **E-43**

| exemplo | espécie |
|---|---|
| `DOAC em uso` | **dado observado** |
| `Última dose desconhecida` | **dado** (`NÃO SEI`, **E-02**) que gera **pendência** |
| `IVT ainda não liberada por informação insuficiente` | **estado derivado** |
| `Contraindicação confirmada` | **estado derivado** dos fatos + regra vigente |

É §4.1 aplicado à superfície: **o dado não carrega a própria interpretação**.
Marcar "contraindicado" seria gravar o veredito dentro do fato — e ele deixaria
de mudar quando a regra, a fonte ou o contexto mudassem.

#### D não é portão global

> **D não precisa estar completa para E existir.**

Faltando dado de segurança:

- a frente **IVT** aparece **pendente ou bloqueada pela informação específica** —
  nomeada, com o que a destrava (**E-26**);
- a frente **EVT** continua disponível conforme **seus próprios** requisitos.

⚠️ **É E-25 na superfície:** a dependência liga **uma ação a uma condição**, nunca
uma superfície inteira a outra. Transformar Segurança/Elegibilidade em portão
global reinstalaria a sequência que a Parte 5 desfez.

#### Duas observações sobre a divisão

**1 · Dependência entre superfícies aparece como pendência, nunca como tranca.**
O peso vive em **A** e a dose por peso vive em **E**. Isso não tranca E: aparece
como pendência acionável dentro de E (**E-25**, **E-07**).

**2 · E não é sequencial por dentro.** IVT e EVT lado a lado é a exigência
central; iniciar uma não pode fechar, atrasar nem esconder a outra.

### 7.16 Voltar, corrigir, desfazer

**Item 17.** Quatro operações **explicitamente distintas**:

| operação | o que é | efeito na trilha |
|---|---|---|
| **desfazer seleção não confirmada** | o toque ainda não virou fato | **nenhum** — não houve registro |
| **corrigir registro** | o valor nunca foi verdade | registro de correção, com motivo; o anterior fica invalidado e legível (§3.4) |
| **nova aferição** | o paciente mudou, ou mediu-se de novo | registro novo; **os dois valem** (§3.4) |
| **cancelar ação** | a ação não se completou | ação vai a *cancelada*, com hora e motivo (§3.7) |

> ⛔ **"Voltar" na navegação nunca desfaz fato clínico.** Navegação não tem efeito
> clínico nenhum (**E-20**, §5.9).

**E o estado que só existe na superfície:** entre o toque e o registro há
**seleção ainda não confirmada** — e ela **não é fato clínico**. Sem esse estado,
todo toque exploratório viraria registro, e a trilha ficaria cheia de fatos que
ninguém afirmou. ⇒ **E-40**

### 7.17 PT-BR / ES

**Item 18.** Toda string exibível **nasce internacionalizada** (**E-12**), e cada
uma **declara sua categoria**:

| categoria | governada por | pode conter número clínico? |
|---|---|---|
| **conteúdo clínico** | camada de conteúdo (Parte 6) | sim, com fonte |
| **label de interface** | superfície | não |
| **unidade** | pertence à grandeza | — |
| **mensagem de estado** | derivada do estado | só reproduzindo o que já tem fonte |
| **texto auxiliar** | superfície | ⛔ **não** — se afirma conduta, é conteúdo clínico (§6.9, nível 4) |

> ⛔ **Nenhuma string clínica relevante fica embutida na tela.** ⇒ **E-41**

⚠️ **A categoria "texto auxiliar" é a porta de entrada de conteúdo sem fonte.**
"Corrija rapidamente" parece rodapé e prescreve urgência. Se afirma, muda de
categoria — e passa a exigir sustentação.

*(O mecanismo do espanhol — dicionário, par lado a lado, ou outro — continua em
aberto, §6.13.)*

### 7.18 Acessibilidade

**Item 19.** Requisitos, com a razão clínica de cada um:

| requisito | por que, neste módulo |
|---|---|
| área de toque adequada | uma mão, pressa, e campos que alimentam dose |
| contraste suficiente | emergência tem iluminação ruim e tela suja |
| **significado sem depender de cor** | as espécies são semânticas, não intensidades ⇒ **E-39** |
| texto legível em tela pequena | é o dispositivo principal, não o alternativo |
| uso com uma mão | a outra está no paciente |
| ⛔ **hover nunca é requisito** | não existe hover em toque |
| feedback claro após o toque | toque sem retorno vira **toque repetido** — e toque repetido em registro de ação vira fato duplicado |

### 7.19 O que a Parte 7 NÃO define

**Item 20.** Biblioteca de componentes · React · nomes de arquivo · schema · CSS ·
breakpoints · design system definitivo · engine · tipos.

> Esta parte define **comportamento e restrição da superfície**. Não
> implementação.

### 7.20 Necessidade clínica → obrigação de superfície → como se prova

| necessidade clínica (do AVC) | obrigação de superfície | como se prova |
|---|---|---|
| o relógio corre sozinho e fecha a janela | tempo desde a última vez bem **sempre visível** | existe superfície em que o tempo derivado não aparece? |
| há **cinco** relógios distintos | todo controle de tempo **nomeia o relógio** | existe controle de tempo rotulado apenas "horário"? |
| `0` é vazio numa grandeza e resposta numa escala | as duas famílias de campo se comportam diferente | existe campo de grandeza sem estado "não informado" distinto do zero informado? |
| silêncio não é negativa | **três** estados de resposta distinguíveis | existe pergunta clínica com menos de três estados representáveis? |
| decisão crítica não pode ficar escondida | camada de visibilidade **derivada da importância clínica** | existe conteúdo classificado como decisório nascendo recolhido? existe recolhimento decidido por contagem? |
| pendência não aprisiona | pendência **acionável de qualquer superfície** | existe pendência que exige voltar à seção de origem para ser resolvida? |
| bloqueio é da ação, não do atendimento | **sem modal obrigatório** em bloqueio clínico | existe bloqueio clínico que interrompe as outras frentes? |
| frente bloqueada tem de ser acionável | bloqueio exibe **o que destrava** | existe bloqueio exibido sem condição de desbloqueio? |
| ação não acontece por navegar | cinco estados de ação distinguíveis **sem cor** | existe estado de ação distinguível apenas por cor ou por posição? |
| corrigir sem perder o caso | correção em superfície focada, retorno ao estado **recalculado** | a correção navega para fora do atendimento? o retorno restaura tela antiga? |
| toque errado não é fato clínico | existe **seleção não confirmada** | existe caminho em que um toque isolado vira registro? |
| voltar não desfaz medicina | navegação **sem efeito clínico** | existe navegação que altera valor, ação ou trilha? |
| espécies são semânticas, não intensidades | cor **nunca** é portador único | existe estado compreensível só com cor? |
| medicina não mora na tela | string clínica sempre da camada de conteúdo | existe dose, corte, meta, janela ou recomendação escrita na superfície? |
| o app é PT-BR e ES desde o primeiro commit | toda string exibível internacionalizada, **com categoria declarada** | existe string exibível sem par ES? sem categoria? |
| uma mão, pressa, tela pequena | sem rolagem horizontal de conteúdo clínico | existe conteúdo clínico que exige rolagem lateral? |

⚠️ **"Como se prova" descreve o que se mede, não a trava.** Escrever as travas é
**Parte 8** — e a auditoria das 92 existentes vem depois de a spec fechar.

### 7.21 O que a Parte 7 deixa em aberto

- ~~P-08~~ — **fechada em 2026-08-28** (§7.5).
- ⚠️⚠️ **P-09 · REABERTA E REDECIDIDA em 2026-08-29.** §7.15 fixou sete
  superfícies e disse *"D coleta fatos"*. A revisão ⛔ **não desfaz** a frase —
  **precisa-a**, na redação do autor:

  > **D é proprietária da INTERPRETAÇÃO de segurança, ⛔ não necessariamente dos
  > fatos que alimentam essa interpretação.**

  E acrescenta **duas superfícies sem letra**, que ⛔ não são etapas:
  **Paciente** e **Laboratório**. A regra que as sustenta é **PD-28**:
  *propriedade do fato ⛔ não é local de preenchimento* — um id, uma casa, e
  qualquer superfície pode exibir ou preencher, escrevendo no mesmo fato.

  ⚠️ O que motivou: quatro defeitos encontrados **usando o app**, todos o mesmo —
  fatos sobre **quem é o paciente** em telas organizadas por **decisão**.
- **Densidade como trava** (§7.14) — os números são princípio agora; se viram
  reprovação de build, e com que medida, fica para depois de existir tela.
- **Mecanismo do espanhol** (§6.13, §7.17).
- **Concorrência entre operadores** (§5.11) — duas pessoas na mesma superfície.

---

## PARTE 8 — COMO SE PROVA CADA REGRA

> Classifica as **51 exigências** por **natureza de prova**, e trata a **trava de
> universo vazio** como requisito de primeira classe.
>
> ⚠️ **Esta parte não escreve trava nenhuma.** Ela diz o que cada regra exige que
> se meça. Escrever as travas vem depois; auditar as 92 existentes, depois disso.

### 8.1 Por que a prova se declara antes do código

Porque prova escrita depois do código tende a provar **o que o código faz**, e
não o que a regra exige. Declarando antes, a distância entre contrato e
implementação vira **achado**, não interpretação.

E porque é isso que torna a auditoria das 92 travas existentes uma **comparação
contra contrato** — não uma opinião sobre o que cada script parece medir.

### 8.2 As cinco naturezas de prova

| sigla | natureza | o que caracteriza | limite |
|---|---|---|---|
| **S** | **estática** | varredura de código ou de conteúdo, **sem executar** | vê forma, não comportamento |
| **C** | **comportamento** | executar e observar a resposta a um estímulo | precisa de estado montado |
| **T** | **temporal** | exige **relógio controlado** — o tempo tem de passar | não se prova com dado parado |
| **I** | **integração entre estados** | a mudança em um ponto propaga corretamente para outros | é a mais cara e a que mais pega defeito real |
| **R** | **revisão / inspeção clínica** | julgamento humano | **não automatizável, e declarar isso é parte da prova** |

⚠️ **A natureza T existe por causa deste módulo.** Um app cuja janela terapêutica
fecha sozinha não pode ser provado com relógio real: exige tempo injetável. Sem
isso, **E-01** e **E-21** ficam sem prova — e são duas das regras mais caras.

⚠️ **A natureza I é a que o app anterior não tinha.** As travas antigas mediam
módulo a módulo; o defeito que este modelo pode produzir é de **propagação** — um
fato corrigido que não derrubou a cadeia inteira (§4.4-iii).

### 8.3 As 51 exigências, por natureza de prova

| # | natureza | o que se mede |
|---|---|---|
| **E-01** | **T** + S | com o relógio andando e nenhum dado novo, o derivado muda; hora clínica e hora de registro são campos distintos |
| **E-02** | **C** + S | `NÃO SEI` produz comportamento próprio, distinto de campo não respondido |
| **E-03** | **S** + C | todo dado observado carrega procedência; procedência ausente reprova |
| **E-04** | **C** | não existe estado em que a frente de estabilização deixe de estar disponível |
| **E-05** | **I** | corrigir a glicemia derruba o bloqueio **e** cria a reavaliação do déficit |
| **E-06** | **I** + C | o mesmo valor de PA produz leituras diferentes quando só o contexto muda |
| **E-07** | **C** | pendência criada em uma superfície permanece visível e acionável nas outras |
| **E-08** | **C** + I | sem exclusão de hemorragia, **toda** a classe de reperfusão está bloqueada — e só ela |
| **E-09** | **C** + S | saída para módulo inexistente produz destino nomeado, nunca estado sem comportamento |
| **E-10** | **S** + C | campo de grandeza e campo de escala têm comportamentos opostos para `0` |
| **E-11** | **C** | IVT e EVT avançam de forma independente; iniciar uma não altera a outra |
| **E-12** | **S** | toda string exibível tem par ES |
| **E-13** | **S** + C | escala incompleta é representável e distinta de escala zerada |
| **E-14** | **S** | grandeza que alimenta dose carrega origem |
| **E-15** | **I** + C | proposta muda sem alterar decisão assumida; divergência permanece recuperável |
| **E-16** | **C** | destino proposto e destino assumido são estados distintos, com transição por ação |
| **E-17** | **S** + **R** | varredura: nenhum conteúdo pediátrico no universo do módulo · revisão: a filtragem ocorreu na transcrição |
| **E-18** | **R** + S | revisão: a divergência é real e a decisão é do autor · varredura: a marcação existe |
| **E-19** | **S** + **R** | cada pergunta da decomposição aponta um `F-nn`; se a fonte sustenta é revisão |
| **E-20** | **C** | nenhuma sequência de navegação move ação para *iniciada* ou *realizada* |
| **E-21** | **T** + S | janela conta de relógio clínico; porta-agulha conta do t₀ — e trocá-los muda o resultado |
| **E-22** | **S** + C | toda derivação expõe insumos; derivação sem insumos declarados reprova |
| **E-23** | **C** + I | os três vazios produzem três comportamentos; silêncio nunca libera ação |
| **E-24** | **S** + C | evento histórico carrega referência da lógica vigente |
| **E-25** | **S** + C | toda dependência declarada nomeia ação e condição; dependência frente↔frente reprova |
| **E-26** | **S** + C | todo bloqueio exibido carrega condição de desbloqueio |
| **E-27** | **S** + I | não existe canal frente→frente; a propagação acontece por recálculo |
| **E-28** | **S** | cada espécie de conteúdo tem fonte própria; nenhuma herda por proximidade |
| **E-29** | **S** | nenhuma dose, corte, meta, janela, contraindicação ou recomendação na camada de superfície |
| **E-30** | **S** | toda afirmação de risco relevante é rastreável **no lugar onde está** |
| **E-31** | **S** + **R** | número clínico só existe onde há verbatim transcrito |
| **E-32** | **S** | toda janela declara o marco de contagem |
| **E-33** | **S** + **R** | todo texto exibido declara nível 1–4 · se o nível está certo é revisão |
| **E-34** | **S** | de qualquer regra chega-se à fonte, e de qualquer fonte às regras que dela dependem |
| **E-35** | **C** + **R** | nenhum conteúdo decisório nasce recolhido · a classificação de importância é clínica |
| **E-36** | **S** + C | nenhum controle de tempo sem relógio nomeado |
| **E-37** | **C** + **R** | os três estados de resposta são distinguíveis — inspeção confirma que **parecem** distintos |
| **E-38** | **C** + T | fechar a correção retorna a estado recalculado, não à tela anterior |
| **E-39** | **S** + **R** | todo estado tem portador textual · a compreensão sem cor é inspeção |
| **E-40** | **C** | toque isolado não produz registro; só a confirmação registra |
| **E-41** | **S** | toda string declara categoria; nenhuma string clínica na superfície |
| **E-42** | **C** + I | corrigir a origem gera pendência de consistência, e **não** altera o valor copiado |
| **E-43** | **S** + C | não existe campo que registre veredito de contraindicação ou elegibilidade |
| **E-44** | **S** | ⚠️ **meta** — mede as próprias travas: cada uma declara universo e piso, e universo vazio reprova (§8.4) |
| **E-45** | **R** + S | varredura: todo conteúdo tem par PT/ES · **revisão**: a gradação da fonte foi preservada na tradução |
| **E-46** | **S** + C | não existe caminho em que a leitura de julgamento produza conclusão binária sem decisão do médico |
| **E-47** | **I** + C | ação iniciada com vínculo: a chegada do resultado produz continuar, interromper ou reavaliar — e o vínculo é por ação, não global |
| **E-48** | **S** + **R** | varredura: nenhum item de tabela sem COR/LOE tratado como veredito · revisão: a precedência foi respeitada |
| **E-49** | **S** | todo campo declarado obrigatório tem registro de checagem contra as doze marcas 🚫 |
| **E-50** | **S** + **R** + **C** | varredura: nenhuma dose referenciada por princípio ativo sem apresentação declarada · revisão: apresentação corresponde à indicação · ⚠️ **teste obrigatório**: ver quadro |
| **E-51** | **S** + **R** | varredura: todo campo clínico declara a fonte que o sustenta · revisão: nenhuma reconciliação silenciosa entre fontes divergentes |
| **E-52** | **C** + **S** | ⚠️ **construção**: a prova CONSTRÓI o estado "fato principal conhecido + atributo desconhecido" e exige que ele sobreviva · varredura: nenhum campo acessório declarado como condição de outro |

**Distribuição:** predominam **S** (forma, barata, e a que mais pega regressão de
conteúdo) e **C**. Mas as regras que sustentam o modelo — **E-01**, **E-05**,
**E-06**, **E-21**, **E-23**, **E-27**, **E-42** — são **T** e **I**, que são as
caras. Um conjunto de travas só estático daria verde num módulo estruturalmente
quebrado.

### 8.4 A trava de universo vazio — requisito de primeira classe

**O problema, com registro no próprio repositório.** Uma trava mede um universo:
o conjunto de objetos sobre os quais ela verifica algo. Se o universo esvazia, a
trava **passa por vacuidade** — verde, sem medir nada.

> Não é hipótese. Na remoção da arquitetura antiga, travas tiveram o piso baixado
> "com a razão declarada", e uma delas — `test:traducao-composta` — estava com o
> **universo zerado**; redirecionada, encontrou um texto composto que **nunca
> havia sido auditado**. Verde por vacuidade escondeu um achado real.

**A exigência:**

> **Toda trava declara seu universo e o piso desse universo. Universo vazio, ou
> abaixo do piso declarado, REPROVA — nunca passa.** ⇒ **E-44**

**O que isso obriga:**

1. **universo declarado** — a trava diz sobre o que verifica, e sabe contar;
2. **piso declarado, com razão** — não um número solto: o motivo pelo qual aquele
   é o mínimo esperado;
3. **baixar o piso é evento registrado**, com razão escrita — nunca ajuste
   silencioso para o conjunto ficar verde;
4. **censo** — existe uma visão única de todas as travas com o tamanho atual de
   cada universo, e ela é lida quando algo é removido do app.

⚠️ **O precedente já existe neste repositório** — `scripts/censo-de-instrumentos.cjs`
e `auditoria/universo-dos-instrumentos.json`. A Parte 8 não inventa o mecanismo:
**eleva-o a requisito**, e o estende ao módulo novo. Se o censo já existisse como
reprovação, e não como retrato, o caso de 2026-08-27 teria sido barrado.

⛔ **E a inversão que isso proíbe:** afrouxar o **código do instrumento** para o
conjunto ficar verde. Baixar piso com razão é decisão; enfraquecer a medição é
falsificação.

### 8.5 O que só a revisão clínica valida

Nove exigências carregam **R**, e nenhuma delas fica sem prova por descuido — a
prova é humana, e declará-lo é parte do contrato.

**O que a automação nunca vai dizer:**

- se o **conteúdo clínico está correto** — a auditoria contou **5.752 afirmações
  de risco crítico**, e verificá-las contra fonte primária é leitura médica, não
  varredura;
- se a **decomposição** do julgamento é clinicamente válida (**E-19**);
- **qual fonte adotar** quando duas divergem (**E-18**, §6.6);
- se a classificação de **importância clínica** que decide a camada de
  visibilidade está certa (**E-35**);
- se três estados **parecem** distintos para quem está com pressa (**E-37**,
  **E-39**).

> **A prova automatizada nunca certifica correção clínica.** Ela certifica que a
> **estrutura que torna a correção verificável** está de pé: fonte rastreável,
> derivação explicável, trilha íntegra, conteúdo fora da tela. Confundir as duas
> é o modo mais confortável de errar.

### 8.6 O que a Parte 8 NÃO faz

- ⛔ **não escreve trava** — nem nome de script, nem framework, nem formato;
- ⛔ **não audita as 92 travas existentes** — isso vem **depois de a spec fechar**,
  e usa §8.3 como contrato de comparação;
- ⛔ **não define piso numérico** de universo — o piso pertence a cada trava, e
  nasce com ela.

### 8.7 O que a Parte 8 deixa em aberto

- **Como se injeta tempo** para as provas **T**. É decisão de implementação, mas
  tem consequência de arquitetura: se o relógio não for substituível, **E-01**,
  **E-21** e **E-38** ficam sem prova.
- **Onde vive o censo** e com que periodicidade reprova.
- **O piso de cada universo** — nasce com cada trava.

---

## PARTE 9 — O QUE AINDA NÃO SE GENERALIZA

> **Regra principal:** ⛔ **nada vira infraestrutura geral do app apenas porque
> funcionou no AVC.**

### 9.1 A regra de promoção

> **Generalização exige pelo menos um SEGUNDO módulo clínico real que force a
> mesma necessidade de forma INDEPENDENTE.**

⛔ **Repetição dentro do AVC não promove nada.** O par proposto/assumido aparece
duas vezes — em destino (§2.9) e em julgamento (§2.8) — e continua em **B**. Duas
ocorrências no mesmo módulo são um módulo, não dois.

⛔ **Abstração antecipada é proibida.** Não se constrói o geral para depois
encaixar o AVC — foi essa a ordem que produziu o motor que a reestruturação
removeu (§0.7).

### 9.2 Categoria A — específico do AVC

Existe porque o AVC exige. **Não sai daqui sem evidência de outro módulo.**

| conceito | por que é específico |
|---|---|
| **os cinco relógios nomeados** (§1.1) | última vez bem, início observado, reconhecimento, t₀, registro — este conjunto é do AVC |
| **última vez bem (LKW)** | conceito de AVC; outros módulos têm "início", não "último-visto-bem" |
| **IVT e EVT em paralelo** (**E-11**) | duas reperfusões concorrentes é particularidade do AVC isquêmico |
| **imagem como condição de uma classe de ações** (**E-08**) | é a TC que libera todo o ramo de reperfusão |
| **julgamento de déficit incapacitante** (**E-15**, §2.8) | a decomposição é do AVC, e depende de **F-17** |
| **as superfícies A–G** (§7.15) | divisão desenhada para este atendimento |
| **o mimetizador que sai por onde entrou** (§3.6) | único destino "para trás" do módulo |
| **saídas para AVCh e HSA** (§0.1, **E-09**) | recorte deste módulo |

⚠️ **Nuance dos relógios.** O **conjunto específico** é A. A **noção** de que
t₀ operacional e relógios clínicos coexistem (**E-21**) é **B** — parece
reutilizável, e não está promovida.

### 9.3 Categoria B — candidato a geral, NÃO promovido

Parece reutilizável. **Permanece local ao AVC** até um segundo módulo forçar o
mesmo.

| conceito | onde vive |
|---|---|
| as **nove espécies** do estado — dado observado · derivado · ação · reavaliação · pendência · bloqueio corrigível · contraindicação · julgamento · destino | Parte 2 |
| **trilha** e não-sobrescrita | Parte 3 |
| **linhagem** de valor copiado (**E-42**) | §3.2, §7.5 |
| **medir de novo ≠ corrigir registro** (§3.4) | Parte 3 |
| **proposta × assumido** (**E-15**, **E-16**) | §2.8, §2.9 |
| **frente clínica** e a ausência de ponteiro (**E-11**, §5.9) | Parte 5 |
| **dependência ação↔condição** (**E-25**) | §5.3 |
| **derivação explicável** (**E-22**) | §4.6 |
| **evento histórico de derivação** (**E-24**) | §4.7 |
| **camada de visibilidade derivada** (**E-35**) | §7.3 |
| **seleção não confirmada** (**E-40**) | §7.16 |
| **t₀ × relógios clínicos** (**E-21**) | §1.1 |

### 9.4 Categoria C — geral comprovado

**Nenhum conceito promovido a partir do AVC. Zero.**

Os itens abaixo estão aqui **porque já eram regra de todo o app antes desta
spec** — não porque o AVC os provou. A spec os **restata**, não os promove:

| regra | evidência independente do AVC |
|---|---|
| **E-12** · nasce PT-BR + ES | infraestrutura e trava de i18n já existentes |
| **E-17** · filtro pediátrico na origem | PD-2 e `test:escopo-pediatrico`, anteriores ao AVC |
| **E-18** · divergência brasileira marcada | regra permanente declarada pelo autor para todo o app |
| **E-31** · número só com verbatim | política escrita em `ACHADOS-SEM-VERBATIM.md` |
| **E-44** · trava declara universo e piso | o caso que a originou (`test:traducao-composta`) **não é do AVC** |

⚠️ **Esta é a distinção que mantém a categoria honesta.** C não é "o que o AVC
provou ser geral" — é "o que já era geral e a spec repetiu". Enquanto o segundo
módulo não existir, **C não recebe nada vindo de B**.

### 9.5 O que NÃO pode ser construído agora

| ⛔ proibido | por quê |
|---|---|
| **motor / engine genérico** de fluxo ou de estado clínico | é a ordem invertida que produziu o motor removido; o AVC implementa o **seu** |
| **componente genérico de espécie clínica** — "card de pendência", "bloco de ação" reutilizáveis | espécie é semântica; componente genérico congela semântica antes de haver dois casos |
| **schema global** de estado clínico, e tipos `Node`/`Tree` compartilhados | qualquer tipo compartilhado hoje é o legado renascendo com nome novo |
| **biblioteca de derivação** reutilizável | §4 define o mecanismo; a implementação nasce local |

✅ **O que pode ser compartilhado sem promover conceito:** *widget* de entrada
como widget (o slider é controle, não semântica), utilidades neutras, e a
infraestrutura listada em §10.1. **Compartilhar controle não é compartilhar
significado.**

### 9.6 O que permanece local ao AVC até nova evidência

Tudo da categoria **B**, mais as superfícies, as frentes e a trilha. A promoção,
quando vier, é por **extração com dois casos na mão** — nunca por antecipação.

---

## PARTE 10 — FRONTEIRAS COM O APP QUE EXISTE

### 10.1 Pode consumir — infraestrutura neutra

| recurso | condição |
|---|---|
| **i18n** | a infraestrutura, não os dicionários dos módulos removidos |
| **navegação / hub** | como navegação; o card do AVC entra no hub como os 12 atuais |
| **autenticação**, se aplicável | não impõe semântica clínica |
| **calculadoras neutras** | as que sobreviveram e não carregam fluxo (§0.1) |
| **componentes visuais realmente genéricos** | tipografia, espaçamento, controles — não "cards clínicos" |
| **mecanismos de sessão** | ⚠️ **somente se não impuserem semântica clínica antiga** — ver §10.5 |

### 10.2 Não pode herdar

| ⛔ | motivo |
|---|---|
| **`LEGACY_ACLS_RUNTIME`** (D-107) | carimbado como transitório; existe só para bradicardia e taquicardia |
| **`core/decision-tree`** — motor, tipos, `estado-clinico.ts` | é o modelo que a Parte 5 desfez |
| **shell antigo** (`acls-decision-flow-screen.tsx`) | 2.646 linhas com o C1 embutido |
| **tipos de nó antigos** (`decision` · `action` · `input` · `transition`) | pressupõem ponteiro de próximo passo |
| **regras de fluxo antigo** | sequência onde o AVC exige simultaneidade |
| **semáforo 🔴🟡🟢** | P-07: cor é apresentação, não semântica (§4.8) |
| **persistência clínica antiga** | se impuser o modelo legado, não entra (§10.5) |
| **abstrações criadas para os módulos removidos** | nasceram para um modelo que não existe mais |

### 10.3 Conceito sim, implementação não

Ideias válidas do legado, **registradas como conceito reavaliado** — e
reimplementadas do zero, nunca importadas:

| conceito do legado | como reaparece nesta spec |
|---|---|
| histórico de valores | Parte 3, com **linhagem** e a distinção medir × corrigir (§3.4) |
| derivação recalculada, nunca gravada | §4.3 — reencontrada pela necessidade do AVC, não herdada |
| separação ação / veredito | §2.3 e §2.8, com ciclo de vida de cinco estados |
| `remedir()` — apagar valor preservando trilha | §3.4, **reformulado**: o legado apagava; aqui **não se apaga**, invalida-se |
| bloqueio que não para o atendimento | §5.6, derivado do AVC e **sem** as cores |

> ⚠️ **Qualquer reutilização de CÓDIGO precisa ser justificada depois, caso a
> caso. Nada é presumido agora.**

### 10.4 As dívidas D-104 a D-108

| dívida | o AVC toca? | posição |
|---|---|---|
| **D-104** · perdas de cobertura (atalhos ISR e VM no card de estabilização; destino pré-eclâmpsia a partir da PCR na gestação) | ❌ **não** | ⛔ **O AVC não é desculpa para reconstruir ISR, VM ou qualquer outro módulo agora.** A frente de estabilização do AVC é do AVC; não recria ponteiro para módulo inexistente. Permanece aberta. |
| **D-105** · reuso de peso entre módulos sem prova | ⚠️ **parcialmente** | O AVC coleta peso **com origem** (**E-14**) e o usa **localmente**. ⛔ Não construir reuso entre módulos. Fecha quando um segundo módulo exigir peso — regra de §9.1. |
| **D-106** · dose por quilo, risco específico sem prova | ✅ **sim** | A dose de reperfusão é por peso (**F-09**). **Candidata a encerrar com o AVC** — depois do verbatim, com prova de comportamento (§8.3). |
| **D-107** · `LEGACY_ACLS_RUNTIME`, 6.581 linhas | ❌ **não** | Não toca, não herda, não importa. Fecha quando bradicardia e taquicardia forem reescritas — **não pelo AVC**. |
| **D-108** · dívida técnica pré-existente (lint 324→234; hidratação #418 em rota desconhecida) | ❌ **não** | ⛔ **Não contaminar.** A rota nova do AVC não corrige o *fallback* de rota desconhecida, e corrigi-lo não é trabalho deste módulo. |

⚠️ **A regra que atravessa a tabela:** o AVC **declara** o que encontra e **não
amplia escopo**. Foi ampliação de escopo, módulo a módulo, que produziu as 19
árvores removidas.

### 10.5 Sessão e persistência

> ⛔ **Se a infraestrutura de sessão existente não cumprir o contrato desta spec,
> NÃO adaptá-la silenciosamente.**

O contrato que ela teria de cumprir: trilha sem sobrescrita (§3.1), campos de
registro completos (§3.2), linhagem (**E-42**), evento histórico de derivação com
a lógica vigente (**E-24**), e retomada **por recálculo, não por restauração**
(§5.9).

**Não é decidido agora se ela cumpre.** Fica marcado como **decisão futura**,
junto com a persistência entre sessões (§3.9) — que o autor determinou resolver
só depois de haver clareza sobre o ciclo de vida completo de um atendimento.

---

## PARTE 11 — PERGUNTAS CONSOLIDADAS

> Apenas o que está **realmente aberto** ao fim da spec estrutural.
> **P-01 a P-09 foram fechadas** e não se repetem aqui.

### 11.1 Bloqueantes para INICIAR A IMPLEMENTAÇÃO

Sem estas, não é possível modelar corretamente o estado.

| # | pergunta | motivo | decisão que depende dela | momento máximo |
|---|---|---|---|---|
| **Q-01** | **O relógio é substituível?** | as provas **T** exigem tempo injetável; com relógio real, **E-01**, **E-21** e **E-38** ficam sem prova | como o tempo entra no modelo de estado | **antes** de escrever a primeira derivação temporal |
| **Q-02** | **Onde mora fisicamente a camada de conteúdo clínico?** | **E-29** proíbe conteúdo na tela; sem endereço, ele nasce onde der | formato e local de dose, corte, meta, janela e regra | **antes** de o primeiro `F-nn` ser aplicado |
| **Q-03** | **Qual o mecanismo do espanhol?** | **E-12** exige nascer bilíngue no primeiro commit | se a camada de conteúdo guarda os dois idiomas, ou se o ES é derivado por dicionário | **antes** do primeiro commit com string exibível |

### 11.2 Bloqueantes apenas para CONTEÚDO CLÍNICO

Não impedem modelar; impedem escrever regra numérica.

| # | pergunta | motivo | decisão que depende dela | momento máximo |
|---|---|---|---|---|
| **Q-04** | **Os 17 slots `F-nn`** — PDF da AHA/ASA 2026 | `fonte identificada, conteúdo não validado` não autoriza número (**E-31**) | toda regra de janela, meta, limite, dose, contraindicação e elegibilidade | **antes** de qualquer número entrar na spec ou no app |
| **Q-05** | **F-17** — o trecho sobre NIHSS × déficit incapacitante | hoje é **afirmação do autor**, não verbatim (§2.8) | a decomposição de §2.8 e as perguntas que a compõem (**E-19**) | **antes** de a decomposição existir em tela |

### 11.3 Não bloqueantes — podem ser adiadas

| # | pergunta | motivo | decisão que depende dela | momento máximo |
|---|---|---|---|---|
| **Q-06** | **Autoria completa** | §3.2 exige o campo; o autor determinou prever sem inventar identidade própria | quem preenche "autor do registro" | antes de haver mais de um operador real |
| **Q-07** | **Persistência entre sessões** | depende do ciclo de vida completo do atendimento | onde a trilha vive entre aberturas | antes do primeiro atendimento retomado |
| **Q-08** | **Concorrência entre operadores** | duas pessoas registrando no mesmo atendimento é real em sala de emergência | modelo de escrita concorrente | não bloqueia o V1 |
| **Q-09** | **Densidade como trava** (§7.14) | os números são princípio de ergonomia, não regra de build | se 4–6 controles vira reprovação, e com que medida | depois de existir tela real |
| **Q-10** | **Piso de cada universo e onde vive o censo** (**E-44**) | o piso nasce com cada trava | como o censo reprova | junto com a primeira trava |
| **Q-11** | **Onde vive o registro de divergências** (§6.6) | o precedente é `DIVIDAS-CONHECIDAS.md` | formato do registro | na primeira divergência real |
| **Q-12** | **Versionagem técnica de regra e fonte** (**E-24**, **E-34**) | a obrigação está definida; a representação não | como se marca versão | antes da primeira troca de fonte vigente |

---

## APÊNDICE — CASOS DE ACEITAÇÃO DA SPEC

> Provam **comportamento**, não guideline. ⛔ **Nenhum número clínico destes casos
> é limite, corte, meta ou janela.** Os únicos valores usados são os autorizados
> pelo autor (PA 198/114 → 168/96) e horários narrativos.

### Caso 1 — Hipoglicemia como mimetizador corrigível

```
 19:20  chegada · déficit focal súbito                    t₀ operacional (E-36)
 19:24  glicemia informada, abaixo do corte (F-06)        dado observado
        └─ derivado: bloqueio corrigível + suspeita de mimetizador
 19:27  correção administrada                             ação → realizada (E-20)
 19:41  nova glicemia                                     DADO NOVO, não correção (§3.4)
        └─ os dois valores permanecem, com a ação entre eles
        └─ bloqueio cai
        └─ REAVALIAÇÃO DO DÉFICIT criada                  (E-05)
 19:52  déficit ausente na reavaliação                    dado observado
        └─ destino: saída do fluxo de reperfusão, reavaliação diagnóstica
```

**Prova:** trilha sem sobrescrita · ação → dado novo · reavaliação disparada por
ação · **destino para trás** (§3.6) · derivado que deixa de valer, com o evento
histórico registrado por ter ancorado um bloqueio (§4.7).

### Caso 2 — PA inadequada para uma estratégia de reperfusão

⚠️ **198/114 e 168/96 são exemplos do autor. Não são limites da guideline** —
o limite é **F-04**, ainda não transcrito.

```
 19:42  PA 198/114                                        dado observado
        └─ contexto: candidato a reperfusão
        └─ derivado: bloqueio corrigível                  (E-06)
 19:51  tratamento da PA                                  ação → realizada
 20:07  PA 168/96                                         DADO NOVO
        └─ os três registros permanecem                   (§3.1)
        └─ derivado recalculado · bloqueio cai
        └─ evento histórico: "às 19:42 o sistema bloqueava por PA"   (E-24)
```

**E o contraste que o caso existe para provar:** se, nesse intervalo, o relógio
tiver cruzado a janela, **o mesmo 168/96 não destrava nada** — o contexto que
qualificava o número mudou sozinho (**E-01**, **E-06**).

**Prova:** não sobrescrita · bloqueio corrigível · ação · nova aferição ·
desbloqueio · evento histórico de derivação com a lógica vigente.

### Caso 3 — Correção da última vez bem

```
 19:20  LKW informado pelo acompanhante                   procedência: acompanhante (E-03)
 20:35  chega a testemunha · LKW é OUTRO
        └─ CORREÇÃO DE REGISTRO, com motivo               (§3.4 — não é nova aferição)
        └─ o valor anterior fica invalidado e legível
```

Recalculam-se, **sem que nenhuma frente avise nenhuma outra** (**E-27**):

```
   relógio        tempo decorrido
   reperfusão IV  candidatura — pode abrir, pode fechar
   pressão        o mesmo valor muda de significado       (E-06)
   EVT            elegibilidade por janela
   destino        proposta de transferência
```

E, se havia **decisão assumida** pelo médico sob o LKW antigo, ela **não muda
sozinha**: nasce uma **reavaliação** (§4.5).

**Prova:** propagação por recálculo, sem mensagens · natureza temporal ·
invalidação de derivações anteriores · decisão assumida preservada e reaberta.

### Caso 4 — IVT bloqueada, EVT continua

```
 20:10  TC sem hemorragia                                 (E-08 — classe liberada)
 20:12  Superfície D: anticoagulante em uso = SIM
        última dose = NÃO SEI                             (E-02, E-37)
        coagulograma = pendente
        └─ derivado: "IVT ainda não liberada por informação insuficiente"
        └─ ⛔ NÃO é "contraindicação marcada"              (E-43)
        └─ bloqueio declara o que o destrava               (E-26)
 20:13  EVT continua sendo avaliada por seus próprios requisitos
```

**Prova:** paralelismo (**E-11**) · bloqueio de **ação**, não do app (§5.6) ·
Superfície D **não é portão global** (§7.15) · silêncio não vira liberação
(**E-23**) · veredito é derivado, nunca marcado.

### Caso 5 — Horário copiado com linhagem

```
 19:30  reconhecimento dos sintomas informado
 19:31  LKW: "MESMO HORÁRIO DE [reconhecimento]"
        └─ cópia + linhagem: origem, valor copiado, hora da cópia   (E-42)
 20:40  reconhecimento é CORRIGIDO
        └─ ⛔ o LKW NÃO muda                                (E-42)
        └─ pendência de consistência aberta:
           "o horário de origem foi corrigido · REVISAR"
 20:44  o médico escolhe: manter · corrigir · confirmar novamente
        └─ as TRÊS são registro, com hora nova
```

**Prova:** cópia com linhagem ≠ vínculo sincronizado · nenhuma alteração
silenciosa de horário que possa mover janela · pendência acionável de qualquer
superfície (**E-07**).

### Caso 6 — AVC ao acordar, com anticoagulante *(opcional)*

```
 06:50  encontrado com déficit ao acordar
        LKW = DESCONHECIDO                                (E-02 — valor, não vazio)
        houve sono entre o último-visto-bem e o achado = SIM
 06:52  controle de tempo exige o relógio nomeado          (E-36)
        └─ derivado propaga INCERTEZA, não um número confortável
 06:58  anticoagulante: NÃO PERGUNTADO ainda
        └─ ⛔ não é "não usa"                               (E-23, E-37)
 07:05  anticoagulante = SIM · última dose = NÃO SEI
        └─ pendência, não liberação                        (§1.9d)
```

**Prova:** os **três vazios** distinguíveis · incerteza propagada em vez de
resolvida por conveniência · nenhuma regra clínica afirmada — tudo o que decidiria
conduta aqui depende de **F-03**, **F-07** e **F-10**.
