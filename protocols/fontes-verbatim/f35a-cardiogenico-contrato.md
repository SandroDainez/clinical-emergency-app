# F-35a · Choque cardiogênico — contrato do slot

> ⛔ **Este arquivo não contém verbatim.** Ele identifica a fonte, fixa o escopo
> a mapear e registra as proibições de transporte. A transcrição é a etapa
> seguinte, e depende de um PDF em mãos.

| eixo | estado |
|---|---|
| **fidelidade documental** | ⛔ **nada transcrito** — o PDF do ACC 2025 é *Free Access*, mas o `jacc.org` recusa agente automático |
| **aplicabilidade ao AVC isquêmico** | ⏳ pendente, e já se sabe que **exigirá qualificação** |

---

# 1 · A FONTE — o levantamento

## 1.1 · O que foi verificado, e como

Identidade bibliográfica confirmada por PubMed (E-utilities) e situação de
acesso por **Unpaywall**, DOI a DOI. ⛔ **Nenhum conteúdo clínico foi lido**:
o que segue é identificação e disponibilidade, e nada mais.

| # | documento | natureza | escopo pelo título | acesso |
|---|---|---|---|---|
| **1** | **Sinha SS, Morrow DA, Kapur NK, Kataria R, Roswell RO.** *2025 Concise Clinical Guidance: An ACC Expert Consensus Statement on the Evaluation and Management of Cardiogenic Shock.* **J Am Coll Cardiol. 2025;85(16):1618–1641.** DOI 10.1016/j.jacc.2025.02.018 · PMID 40100174 | *expert consensus statement* de sociedade (**ACC**) | avaliação **e manejo** do choque cardiogênico | ⚠️ **Free Access no JACC** · ⛔ inacessível a agente automático (parede anti-bot) — ver §1.5 |
| **2** | **van Diepen S et al.** *Contemporary Management of Cardiogenic Shock: A Scientific Statement From the American Heart Association.* **Circulation. 2017;136:e232–e268.** DOI 10.1161/CIR.0000000000000525 | *scientific statement* (**AHA**) | manejo contemporâneo | ✅ aberto no editor · ⛔ download automático bloqueado (HTTP 403) |
| **3** | **Chioncel O et al.** *Epidemiology, pathophysiology and contemporary management of cardiogenic shock — a position statement from the Heart Failure Association of the ESC.* **Eur J Heart Fail. 2020;22:1315–1341.** DOI 10.1002/ejhf.1922 | *position statement* (**HFA-ESC**) | epidemiologia, fisiopatologia e manejo | ✅ aberto no editor · ⛔ download bloqueado (403). Repositórios só têm **submittedVersion** |
| **4** | **Kanwar MK et al.** *Heart failure related cardiogenic shock: An ISHLT consensus conference content summary.* **J Heart Lung Transplant. 2024;43(2):189–203.** DOI 10.1016/j.healun.2023.09.014 · PMID 38069920 | *consensus conference* (**ISHLT**) | ⚠️ **só cardiogênico relacionado a insuficiência cardíaca**, dito no próprio título | PMC só com **author manuscript** |
| — | Bloom JE, Chan W, Kaye DM, Stub D. *State of Shock: Contemporary Vasopressor and Inotrope Use in Cardiogenic Shock.* J Am Heart Assoc. 2023;12:e029787 | ⚠️ **revisão**, não documento de sociedade | uso de vasopressor e inotrópico | era a candidata anotada a partir da ref. 11 do CPTW386.1 |

## 1.2 · ⚠️ Por que a candidata anterior foi rebaixada

**Bloom 2023 é uma revisão em revista**, e não um documento de sociedade com
processo de consenso declarado. Ela entrou na lista porque o CPTW386.1 a cita.
⛔ Não serve como **fonte principal** de um slot que vai sustentar escolha de
droga. Pode voltar como leitura de apoio, nunca como procedência.

## 1.3 · Recomendação de fonte principal

**Primeira escolha: o ACC 2025 (documento 1).** É o mais recente, é de
sociedade, e o título declara **avaliação e manejo** — as duas metades que o
Passo 5 precisa. Está marcado como **Free Access** no JACC; o que impede a
obtenção é a **parede anti-bot**, e não o direito de leitura (§1.5).

**Segunda escolha, se o ACC 2025 não for obtido: o par AHA 2017 + HFA-ESC
2020** (documentos 2 e 3). Há uma razão de continuidade: são **exatamente as
duas referências de sociedade que o CPTW386.1 já cita** (refs. 3 e 10), e o
app já herdou delas, de segunda mão, a taxonomia de subtipos que o F-33
transporta. Transcrevê-las converte herança indireta em procedência própria.

⚠️⚠️ **E o ISHLT 2024 não pode ser a fonte principal**, por escopo: ele é de
choque cardiogênico **relacionado a insuficiência cardíaca**, e o C2 chega a
um paciente cujo mecanismo acabou de ser caracterizado como cardiogênico —
sem saber ainda se é isquêmico, de IC crônica agudizada ou misto. Pode entrar
como sub-fonte, com a população declarada.

## 1.4 · ⚠️⚠️ DECLARAÇÃO DE DESATUALIZAÇÃO — obrigatória

Os documentos 2 e 3 são de **2017** e **2020**. A discussão de **suporte
circulatório mecânico** no choque cardiogênico mudou depois deles — o próprio
metadado do app já registra isso para o CPTW386.1:

> *"Documento aprovado em 04/2024, anterior ao DanGer Shock — a discussão de
> suporte circulatório mecânico no choque cardiogênico do IAM evoluiu depois."*
> — `protocols/guidelines_metadata.json`, `einstein_choque_adulto_2024`

⛔ Se o slot for fechado com AHA 2017 e/ou HFA-ESC 2020, a seção de **suporte
mecânico** nasce marcada como **possivelmente desatualizada**, e o app ⛔ não
apresenta aquela parte como estado da arte. Isso ⛔ não contamina a seção de
vasopressor e inotrópico, que é o que o Passo 5 precisa — mas a separação tem
de estar escrita.

## 1.5 · ⚠️⚠️ TENTATIVA DE OBTENÇÃO DO ACC 2025 — registro do que foi tentado

**Correção de uma afirmação minha.** Eu escrevi que o ACC 2025 estava
*"fechado"*, apoiado no `is_oa: false` do Unpaywall. O autor apontou que o JACC
o marca como **Free Access**, e ele está certo: **as duas coisas são
verdadeiras ao mesmo tempo**.

> O Unpaywall registra **licença aberta**, e não **leitura livre**. Um artigo
> *free to read* sem licença aberta aparece como `is_oa: false`.

➜ Regra para as próximas buscas: ⛔ **`is_oa: false` não significa
«inacessível»**. Significa "sem licença aberta". A leitura pode estar liberada
mesmo assim, e é preciso checar a página do editor.

### Rotas tentadas em 2026-09-10, e o resultado

| rota | resultado |
|---|---|
| `jacc.org/doi/...` (WebFetch) | **HTTP 403** |
| `jacc.org/doi/reader/...` | **HTTP 403** |
| `jacc.org/doi/epdf/...` | **HTTP 403** |
| `sciencedirect.com/science/article/pii/S0735109725004188` | **HTTP 403** |
| API TDM da Elsevier (sem chave) | HTTP 400 |
| **navegador da sessão** em `jacc.org` | ⛔ **parede anti-bot** — *"Executando verificação de segurança… proteção contra bots maliciosos"* |
| `acc.org`, página do documento | HTTP 200, mas ⛔ **sem PDF** — remete de volta ao `jacc.org` |
| PMC · Europe PMC | ⛔ não indexado |

### ⛔ Por que a busca parou aqui

O `jacc.org` serve uma **verificação anti-bot**. ⛔ Contornar detecção de bot
**não é uma opção**, e isso **não muda** porque o conteúdo é livre para leitura.
A restrição é sobre o **método de acesso**, e não sobre o direito de ler.

➜ **Quem destrava é uma pessoa num navegador comum.** Abrir
`https://www.jacc.org/doi/10.1016/j.jacc.2025.02.018`, a verificação passa, e
salvar o PDF.

⚠️ ⛔ **Não cair para o plano B ainda.** Ordem do autor: o ACC 2025 é a melhor
fonte e está oficialmente marcado como acesso livre. AHA 2017 e HFA-ESC 2020
continuam como plano B, e ⛔ não foram lidos.

## 1.6 · ⚠️⚠️⚠️ ESTADO: AGUARDANDO O PDF · ordem do autor, 2026-09-10

> **"Não tentar mais acesso automatizado nem contornar anti-bot. Aguardar o PDF
> do ACC 2025 obtido manualmente no navegador comum."**

⛔ **A busca automatizada está ENCERRADA para este slot.** Não repetir as rotas
da §1.5. O registro delas existe para que ninguém as tente de novo, e não como
lista de pendências.

⚠️ Distinção aceita pelo autor e incorporada ao vocabulário do projeto:

> **`Free Access` no editor ≠ Open Access com licença reutilizável.**
> Leitura liberada não implica obtenção automática, nem reuso.

### ✅ A LISTA DE EXECUÇÃO — quando o arquivo chegar

Ordem do autor, na ordem dele:

1. **confirmar que é o artigo publicado correto** — título, autores, JACC
   2025;85(16):1618–1641, DOI 10.1016/j.jacc.2025.02.018, e a marca de
   *Version of Record* se a cópia a trouxer;
2. **transcrever verbatim**, com página;
3. **mapear os 13 itens** da §2;
4. **registrar população, escopo e ausência/presença de graduação formal**;
5. ⛔ **não inventar GRADE / COR / LOE se o documento não declarar** — ver §2b;
6. **separar fidelidade documental de aplicabilidade ao AVC**;
7. **só depois** montar o mapa F-35a.

⛔ Sem código e sem deploy em nenhuma das sete etapas.

### Onde deixar o arquivo

Qualquer lugar; `~/Downloads` é o caminho já usado e eu encontro sozinho.
⚠️ Serve **a versão publicada**. ⛔ *SubmittedVersion*, *author manuscript* e
página HTML **não servem**: a paginação difere e o contrato exige página.

## 1.7 · O que falta para destravar

Um PDF da **versão publicada**. ⛔ *SubmittedVersion* e *author manuscript*
**não servem** para este projeto: a paginação difere da publicada e o texto
pode diferir, e o contrato exige **página**.

---

# 2 · O ESCOPO A MAPEAR — os treze itens

Ordem do autor, 2026-09-10. ⚠️ **Mapear o escopo ANTES de transcrever
tratamento.**

| # | item | por que importa ao C2 |
|---|---|---|
| 1 | **definição / critério** de choque cardiogênico | é o que liga o Passo 2 ao Passo 5 |
| 2 | **população estudada** | decide transporte |
| 3 | é **IAM-CS**, **IC aguda**, **misto** ou **cardiogênico em geral**? | ⚠️ o item mais decisivo — ver §3 |
| 4 | como reconhecer **baixo débito / congestão** | o F-33 já tem os quatro perfis; aqui se confere a procedência |
| 5 | **papel do eco** | o C2 já decidiu: oferta, nunca portão |
| 6 | **quando** o vasopressor é indicado | hoje o app não sabe dizer |
| 7 | **qual** vasopressor é preferido | o F-33 diz noradrenalina, sem dose |
| 8 | **quando** entra o inotrópico | o F-33 tem por subtipo, sem dose |
| 9 | **quais agentes** | idem |
| 10 | **dose inicial / faixa / titulação**, ⚠️ **se realmente constarem** | é a lacuna que abriu o F-35 |
| 11 | **metas hemodinâmicas** | ⛔ ver a proibição de transporte em §3 |
| 12 | **contraindicações e cautelas** | o F-33 tem contra-fluxo valioso: EM, VSVE, EA com FE preservada |
| 13 | **reavaliação** | o C2 já fixou: por evento, sem intervalo inventado |
| 14 | o que depende de **suporte mecânico** ou **centro especializado** | ⚠️ é a parte com risco de desatualização, §1.4 |

⚠️ O item **10** carrega a ressalva *"se realmente constarem"* porque já
aconteceu duas vezes: o F-32 e o F-33 **não tinham** dose, e só a leitura
provou. ⛔ Não presumir que um documento de manejo traz posologia.

---

# 2b · ⚠️ COMO TRANSCREVER ESTE DOCUMENTO

Instruções do autor, 2026-09-10, e elas antecipam o formato do ACC:

1. **confirmar que é a *Version of Record*** antes de transcrever uma linha;
2. **separar, e nunca misturar:** definição · consenso · algoritmo · tabela ·
   texto de suporte. São naturezas diferentes e carregam pesos diferentes;
3. ⛔ **não assumir força GRADE se o documento não usar GRADE.** Um *expert
   consensus statement* da ACC pode não emitir COR/LOE nem GRADE. Se não
   emitir, registrar **"sem graduação declarada"** — e ⛔ nunca traduzir a
   linguagem do texto em um grau que o documento não deu;
4. **manter os dois eixos separados** — fidelidade documental × aplicabilidade
   ao AVC.

⚠️ O item 3 é o mesmo cuidado do **§D-4 do F-32**: lá, um *"we recommend"*
dentro do texto de um *good practice statement* **não** o transformava em
recomendação forte. Aqui o risco é o espelho: um documento **sem** graduação
sendo lido como se tivesse.

---

# 3 · ⛔ AS PROIBIÇÕES DE TRANSPORTE

## 3.1 · Três proibições específicas deste slot

Ordem do autor, 2026-09-10:

1. ⛔ **não transportar meta pressórica do cardiogênico para todo choque** — a
   meta do cardiogênico é do cardiogênico;
2. ⛔ **não transportar estratégia de IAM para cardiogênico não isquêmico** —
   reperfusão não é conduta de miocardite, de Takotsubo nem de IC crônica
   agudizada;
3. ⛔ **não transportar recomendação de UTI tardia para a porta do AVC** — o
   que se decide na porta não é o que se decide depois da alocação.

## 3.2 · A regra R-TCE continua valendo

⛔ Recomendação escopada a TCE não vale para AVC só porque as duas populações
são neurológicas. Três provas independentes já registradas — ver
`auditoria/MAPA-C2-CHOQUE.md`.

## 3.3 · ⚠️⚠️ E a armadilha específica DESTE slot

**Muita literatura de choque cardiogênico é de IAM complicado por choque.**
Isso **não é automaticamente igual** a um paciente com AVC que desenvolve
choque cardiogênico.

⚠️ A fonte pode estar **inteiramente correta** e a aplicação ao fluxo do AVC
ainda assim precisar de qualificação. Fidelidade documental e aplicabilidade
são eixos **independentes**, e é por isso que o projeto os mantém separados.

➜ Na transcrição, **cada recomendação declara se é de IAM-CS, de IC-CS, de
misto ou de cardiogênico em geral**, do mesmo jeito que o F-34 declarou
população recomendação a recomendação.

## 3.4 · Silêncio populacional

⚠️ Fonte que não nomeia população registra-se como **"população não
declarada"**, e ⛔ nunca como *"vale para todos"*.

---

# 4 · ⚠️⚠️⚠️ O PORTÃO — quando o F-35a pode alimentar o Passo 5

Regra do autor, 2026-09-10, e ela é de **arquitetura**, não de conteúdo:

> **O F-35a só alimenta o Passo 5 quando o mecanismo cardiogênico estiver
> razoavelmente caracterizado.**
>
> **Se o mecanismo ainda estiver incerto, o C2 permanece no ramo de choque não
> classificado e ⛔ não escolhe droga «por padrão».**

| estado do Passo 2 | o que o Passo 5 pode fazer |
|---|---|
| mecanismo **cardiogênico caracterizado** | abrir o tratamento do F-35a |
| mecanismo **incerto** | ⛔ **nenhuma droga por padrão** · reconhecer a ameaça, seguir caracterizando, e dizer o que falta para decidir |

⚠️ Isto fecha a porta para o modo de falha mais provável de uma tela de choque:
oferecer noradrenalina como default porque é o vasopressor mais comum. ⛔ O
default vira conduta, e conduta sem mecanismo é chute com aparência de
protocolo.

⚠️ E conversa com o **estado intermediário** que o projeto já tem como regra
permanente: *um degrau a menos de evidência nunca vale como um degrau a mais*.
"Provavelmente cardiogênico" ⛔ não é "cardiogênico".

---

# 5 · O MÓDULO DE VASOATIVAS CONTINUA EXECUTOR

Regra 7 do contrato de transições, em `auditoria/MAPA-DA-ESTABILIZACAO.md`,
reafirmada pelo autor:

| decide | quem |
|---|---|
| **se** há indicação de vasoativo | **C2**, pelo mecanismo |
| **qual** agente | **C2** |
| preparo, concentração, velocidade | **drogas vasoativas** |
| retorno ao ponto exato de origem | obrigatório |

⛔ O módulo de vasoativas **não decide droga**, e ⛔ não vira decisor por
receber o paciente.

---

# 6 · A ORDEM DE TRABALHO

1. ✅ **identificar a fonte** — feito, §1. A principal é o **ACC 2025**;
2. ⛔ **obter o PDF da versão publicada** — **bloqueio atual**, e ele é de
   **método de acesso**, não de direito: o documento é *Free Access* e o
   `jacc.org` recusa agentes automáticos. Ver §1.5;
3. ⛔ transcrever verbatim, com página;
4. ⛔ conferir população e força, recomendação a recomendação;
5. ⛔ montar o mapa F-35a;
6. ⛔ só depois discutir código.

⛔ **Sem deploy** em nenhuma etapa desta frente.
