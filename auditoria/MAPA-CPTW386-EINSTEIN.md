# F-33 · CPTW386.1 — o que o app transportou, e onde errou

> ⚠️ **A fonte é `protocols/fontes-verbatim/einstein-cptw386-choque.md`.**
> Este mapa é o **inventário do transporte antigo**, e existe para mostrar
> onde ele divergiu do PDF.

> **Documento:** Sociedade Beneficente Israelita Brasileira Albert Einstein.
> *Guia do Episódio de Cuidado — Manejo Inicial do Paciente Adulto com Choque.*
> CPTW386.1, aprovado em 08/04/2024.
>
> **Natureza:** *pathway* institucional. **Não é diretriz de sociedade.**
> Isso não o desqualifica — qualifica o peso que ele pode ter.
>
> **Procedência no app:** já declarado em `protocols/guidelines_metadata.json`
> como `einstein_choque_adulto_2024`, com `modules_using: ["choque"]`.

## ⚠️⚠️⚠️ ESTADO DA FONTE — atualizado em 2026-09-10

| eixo | estado |
|---|---|
| **PDF em mãos** | ✅ **SIM** — `~/Literatura Medica/06-Material MedCampus (Estrategia e Einstein)/02-Einstein (protocolos)/Emergencias/manejo-inicial-do-paciente-adulto-com-choque.pdf`, 8 páginas |
| **transcrição verbatim** | ✅ `protocols/fontes-verbatim/einstein-cptw386-choque.md` |
| **fidelidade ao PDF** | ✅ **conferida** — quatro divergências do registro antigo do app registradas na §D do arquivo-fonte |
| **aplicabilidade ao AVC isquêmico** | ⏳ **pendente** — o documento **não cita AVC em nenhuma das 8 páginas** |

⚠️ **Correção de rota.** A primeira varredura cobriu `~/Downloads`,
`~/Documents`, `~/Projetos` e `~/Desktop`, e concluiu que o PDF não existia.
Ele estava em **`~/Literatura Medica`**, pasta que eu não incluí. Achado por
Spotlight (`mdfind "CPTW386"`), que lê o conteúdo do PDF e não só o nome.
➜ Lição operacional: buscar por **conteúdo** antes de declarar ausência de fonte.

⚠️ **O que este mapa é, agora.** O inventário do que o app **tinha
transportado**, mantido porque é ele que revela os erros de transporte. A
fonte de verdade é o arquivo verbatim.

## De onde veio o registro

O módulo `choque` **não existe nesta branch**. Ele foi removido no commit
`bdf02c8` (*remove legacy clinical modules and isolate transitional ACLS
runtime*). Sobreviveram três coisas soltas:

| o que sobreviveu | onde |
|---|---|
| o id canônico `choque` | `lib/modulos-canonicos.ts` |
| o metadado da fonte | `protocols/guidelines_metadata.json` |
| as traduções PT→ES | `lib/i18n/modules/choque-einstein.ts` |

O conteúdo clínico está recuperável em `bdf02c8^:shock-decision-tree.ts`,
649 linhas, 31 nós. É esse arquivo que este mapa lê.

⚠️ **Correção do que eu disse antes.** Eu afirmei que o app "já tem" este
pathway vivo. Ele **teve**. Hoje o app tem o metadado e a tradução, sem tela
que os renderize. A diferença importa: não há nada em produção para conferir
contra o PDF — há um registro histórico para reconstruir.

---

# OS SEIS EIXOS

## 1 · Reconhecimento por subtipo

O registro implementa exatamente a arquitetura que o autor declarou central
para o Passo 2 do C2: **reconhecer → classificar mecanismo → abrir tratamento**.

| pergunta do nó | leva a |
|---|---|
| sinais de hipovolemia | hipovolêmico (com ramo hemorrágico) |
| obstrução mecânica | pneumotórax hipertensivo · tamponamento · TEP maciço |
| disfunção miocárdica primária | cardiogênico, e então **seis subtipos** |
| vasodilatação | séptico · anafilático · neurogênico · distributivo outro |

Os seis subtipos cardiogênicos: **VD**, **frio-úmido**, **frio-seco**,
**normotenso**, **valvopatia/obstrução da via de saída**, **bradiarritmia**.

Reconhecimento de choque, antes da classificação:

- hipoperfusão em **três janelas** — pele, rim, cérebro;
- laboratório — hiperlactatemia, acidose, SvcO₂ < 70% (SvO₂ < 65%), gap de PCO₂ > 6 mmHg;
- **hipotensão não é obrigatória**, e o nó diz isso no resumo visível.

### ⛔ divergência 1 · o número no gatilho

O nó de entrada pergunta *"PA sistólica < 90 mmHg ou queda ≥ 40 mmHg do basal
(ou sinais de hipoperfusão)?"* — e o **resumo do mesmo nó** avisa que responder
"não" por causa de PA normal é o erro mais comum ali.

O nó **contradiz a si mesmo**: carrega um limiar numérico e depois diz para
não usá-lo. O F-32 rec. 1 define choque **sem número**, e a rec. 2 afirma
*"Although hypotension is commonly present, it is not required to define
shock."*

➜ **Decisão já tomada pelo autor:** não inventar «choque = PAS abaixo de X».
A pergunta tem de nascer das três janelas, não do número. Isto vale mesmo que
o PDF traga o limiar: seria um caso de **não transportar**, não de obedecer.

## 2 · Fluidos

| situação | o que o registro sustenta |
|---|---|
| hipovolêmico | 2 acessos calibrosos · **bólus inicial de 500–1000 mL de cristaloide** · reavaliar após cada alíquota |
| hemorrágico | hemoderivados e protocolo de transfusão maciça · controlar a fonte |
| cardiogênico frio-úmido | **evitar** expansão volêmica |
| cardiogênico frio-seco | **pequenas alíquotas**, reavaliando a cada uma |
| cardiogênico VD | fluidos **com meta de recuperar a pré-carga** — a regra do "evitar volume" **não se aplica** |
| obstrução dinâmica da VSVE | alíquotas em bólus |
| neurogênico | volume **com cautela** |
| regra geral | ressuscitação **guiada por resposta**, sem volume fixo no automático |

### ⛔ lacuna que permanece

**Tipo de cristaloide: o registro não diz.** Balanceada × salina não aparece
em nenhum dos 31 nós. É exatamente a lacuna que o F-32 empurra para outra
diretriz da ESICM. ➜ vai para o slot **ESICM Fluid Therapy Part 1**.

## 3 · Noradrenalina

| onde | o que o registro sustenta |
|---|---|
| cardiogênico frio-úmido | **"NORADRENALINA (vasopressor de escolha)"** |
| cardiogênico frio-seco | noradrenalina |
| cardiogênico VD | noradrenalina |
| cardiogênico geral | noradrenalina de escolha **com** dobutamina associada |
| valvopatias | noradrenalina na estenose aórtica, estenose mitral, insuficiência mitral, obstrução da VSVE, ruptura de septo |
| neurogênico | vasopressor (noradrenalina) |
| distributivo outro | ressuscitação volêmica **+** noradrenalina |

### ⛔ lacuna que permanece, e é a principal

**Dose inicial: ausente. Titulação: ausente.** Em 31 nós não há uma única
dose de noradrenalina. A única faixa numérica que aparece é a **da linha
arterial** (eixo 5), que é indicação de monitorização, não de titulação.

➜ Isto significa que o CPTW386.1 **não fecha o Passo 5 do C2**. Ele responde
*qual* e *quando*, e continua sem *quanto* e *como subir*.

## 4 · Inotrópicos

| subtipo | o que o registro sustenta |
|---|---|
| normotenso | **começar por inotrópico pode ser apropriado** — RVS relativamente alta — dobutamina, milrinone ou levosimendana; se a PA cair, associar vasopressor |
| frio-úmido | considerar acrescentar inotrópico |
| frio-seco | considerar acrescentar inotrópico |
| VD | considerar acrescentar **ou transicionar para** inotrópico |
| estenose aórtica | dobutamina **só com FE reduzida**; com FE preservada **não traz ganho** |
| estenose mitral | **evitar cronotrópicos** — pré-carga dependente |
| obstrução dinâmica da VSVE | **evitar inotrópicos e vasodilatadores** |
| bradiarritmia | cronotrópico ou marca-passo — atropina, dopamina ou adrenalina |
| insuficiência aórtica | dopamina; marca-passo temporário para manter FC alta |

⚠️ Nomes de fármaco existem; **doses não**. Mesma lacuna do eixo 3.

⚠️ Note o **contra-fluxo**: três subtipos dizem o que **NÃO** fazer, e são os
mais perigosos de errar. Isso é conteúdo de alto valor e precisa sobreviver
à conferência sem suavização.

## 5 · Linha arterial

> "Linha arterial para PAM quando a dose de noradrenalina passar de
> 0,3–0,5 mcg/kg/min, ou por outra indicação de monitorização invasiva."

Único número de vasopressor no documento inteiro, e ele **não é de dose
terapêutica** — é gatilho de monitorização.

Contra o F-32 §3a: a ESICM trata *quando e como monitorar* a PA com duas UGPS.
➜ **Não conflitam.** O CPTW dá um gatilho operacional que a ESICM não dá.
Se o PDF confirmar, é complemento legítimo.

⚠️ Para o AVC há uma pergunta que **nenhuma das duas fontes responde**:
puncionar artéria atrasa reperfusão? O C2 já resolveu o análogo no eco
(oferta, nunca portão). A mesma regra deve valer aqui.

## 6 · Exceções neurológicas — ⛔ **O ERRO MAIS GRAVE DO TRANSPORTE**

Este é o eixo mais relevante para o AVC, e é onde o registro antigo errou.

| | |
|---|---|
| **PDF, p. 5** | *"Para pacientes neurológicos agudos **com hipertensão intracraniana (suspeita ou confirmada)**: meta de PAM 90 a 100mmHg"* |
| **registro do app** | *"tolerando PAM < 65 no sangramento ativo — **EXCETO em lesão cerebral grave, em que o alvo é PAM 90–100 mmHg**"* |

⛔ O app **fundiu duas linhas independentes do documento** e, ao fundir,
**trocou a população**. No PDF, *"sem lesão cerebral grave"* é a **exclusão**
da linha que permite tolerar PAM < 65. A meta de 90–100 é de outra linha, e
sua condição é **hipertensão intracraniana**.

⚠️ Hipertensão intracraniana é uma **condição específica**. Lesão cerebral
grave é um universo muito maior. A fusão criaria meta pressórica para uma
população que o documento não cobre — e o AVC isquêmico não é nenhuma das
duas.

A outra linha neurológica do PDF, essa transportada corretamente:

> "Em pacientes neurológicos agudos: meta de Hb entre 9 e 10 mg/dl"
> *(errata do original: é g/dL)*

### ⛔ divergência contra o F-32 · dois números para populações vizinhas

| fonte | população | alvo |
|---|---|---|
| CPTW386.1 | neurológico agudo **com hipertensão intracraniana** | PAM **90–100** mmHg |
| F-32 rec. 43 (UGPS) | **TCE** com Glasgow ≤ 8 | PAM **≥ 80** mmHg |

Duas fontes, populações vizinhas, números diferentes, **e nenhuma é AVC
isquêmico**.

➜ **Nenhum dos dois números entra no C2.** Para o AVC continua valendo a
rec. 38 do F-32 (individualizar) mais a F-05 (corrigir hipotensão e
hipovolemia, COR 1 · LOE C-LD), **sem número**.

---

# TEXTO DO PATHWAY × REFERÊNCIAS QUE ELE CITA — **conferido**

A lista de referências do PDF (p. 8) resolve as atribuições que antes eu só
podia supor. Duas suposições minhas estavam **erradas**.

| conteúdo | eu supunha | o PDF diz |
|---|---|---|
| classes I–IV do choque hemorrágico | ATLS | ⛔ **Cannon JW, N Engl J Med 2018** (ref. 8). **O ATLS não é citado em lugar nenhum.** |
| três janelas · SvcO₂ · gap de PCO₂ · hipotensão não obrigatória | Cecconi 2014 | ✅ **Cecconi 2014** está na lista (ref. 2), mas o pathway **não marca** quais linhas vêm dela |
| subtipos cardiogênicos · condutas por valvopatia | Chioncel 2020 | ✅ a seção cardiogênica é referenciada como **3, 9, 10, 11** em bloco — Chioncel é a ref. 10 |
| suporte circulatório mecânico | van Diepen 2017 | ✅ ref. 3, também em bloco |
| seção de sepse | SSC 2021 | ✅ **Evans 2021** (ref. 1) |

## ⚠️ A limitação que o próprio documento impõe

O pathway referencia **por seção, não por afirmação**. A seção cardiogênica
inteira carrega *"³,⁹,¹⁰,¹¹"*, sem dizer qual frase veio de qual.

➜ **Consequência:** não é possível, só com este PDF, afirmar que uma linha
específica é "recomendação do Chioncel". O máximo defensável é *"conduta do
pathway CPTW386.1, que referencia Chioncel 2020 entre outras"*.

➜ Se uma linha específica precisar de peso de diretriz de sociedade, ela
**abre slot próprio** com o documento original. É a etapa 3 da ordem do autor.

## ⚠️⚠️ A referência 11 é candidata direta ao F-35

> Bloom JE, Chan W, Kaye DM, Stub D. **State of Shock: Contemporary Vasopressor
> and Inotrope Use in Cardiogenic Shock.** J Am Heart Assoc. 2023;12:e029787.

É o título exato da lacuna que sobrou. **Não foi lida**, e nada dela entrou em
lugar nenhum. Fica anotada como candidata, não como fonte.

## O que a conferência confirmou do transporte antigo

- **as duas erratas de unidade são do documento**, não do app — a correção
  para g/dL estava certa;
- **a conversão do lactato** estava certa: o PDF diz *"lactato-alvo < 18"* em
  mg/dL;
- **a exclusão da seção de sepse** estava certa, e agora se sabe que era
  justamente ali que morava a escalada de vasopressor;
- **a exclusão da operação institucional** estava certa.

---

# CPTW386.1 × F-32 — O QUADRO

## Onde concordam

| tema | F-32 | CPTW (registro) |
|---|---|---|
| hipotensão não define choque | rec. 2, UGPS | resumo do nó de entrada |
| lactato tipicamente > 2 mmol/L | rec. 3, UGPS | meta de lactato |
| volume por resposta, não fixo | §4a–4c | "não infundir volume fixo no automático" |
| imagem quando a causa não é evidente | §5b | POCUS/RUSH |
| reavaliar após intervenção | §2 | reavaliar após cada alíquota |

## Onde divergem

| # | tema | F-32 | CPTW (registro) | resolução |
|---|---|---|---|---|
| 1 | limiar para reconhecer choque | **sem número** | PAS < 90 ou queda ≥ 40 | ⛔ fica o F-32 |
| 2 | alvo em cérebro agudo | PAM ≥ 80 (TCE, Glasgow ≤ 8) | PAM 90–100 (**hipertensão intracraniana**) | ⛔ **nenhum dos dois** — não é AVC |
| 3 | PAM 65 como meta | **por tipo**: 65–70 só em séptico, ≥ 65 "may be considered" em cardiogênico | **"metas gerais"** para qualquer choque | ⛔ fica o F-32 — o "geral" é mais forte que a fonte |
| 4 | lactato | consequência, não alvo | **"normalização do lactato"** com queda ≥ 10%/h | ⛔ fica o F-32 |

⚠️ As divergências 3 e 4 são do mesmo tipo: o pathway **promove a meta a
alvo geral**, e o F-32 escopa por população. Um pathway institucional pode
fazer isso para padronizar um hospital. O app **não pode**, porque escreve
para serviços que ele não conhece.

## Onde se completam — e é aqui que o CPTW ganha o slot

O F-32 declara de si mesmo que **não é diretriz de tratamento farmacológico**.
O CPTW386.1 preenche parte do que ela deixou vazio:

| lacuna do C2 | CPTW responde? |
|---|---|
| classificar mecanismo | ✅ árvore completa por mecanismo |
| vasopressor de escolha | ✅ noradrenalina, por subtipo |
| quando considerar inotrópico | ✅ por subtipo, **com contra-indicações** |
| volume: quanto na prova | ✅ 500–1000 mL no hipovolêmico; alíquotas no frio-seco |
| linha arterial | ✅ gatilho por dose |
| **dose inicial de noradrenalina** | ❌ |
| **titulação** | ❌ |
| **tipo de fluido** | ❌ |
| **meta pressórica no AVC** | ❌ |

---

# O QUE FALTA, DEPOIS DESTE MAPA

1. ✅ **O PDF do CPTW386.1** — obtido e transcrito. **F-33 fechado** quanto
   à fidelidade; aplicabilidade ao AVC pendente de revisão clínica.
2. ⛔ **F-34 · ESICM Fluid Therapy Part 1** — aberto. O único tipo de fluido
   nomeado no CPTW é *ringer lactato*, e está **dentro da seção de sepse**.
3. ⛔ **F-35 · dose inicial e titulação de vasopressor** — aberto, e a
   transcrição **confirmou** que o CPTW não tem. A escalada que ele traz
   (noradrenalina → vasopressina → adrenalina) é **da seção de sepse** e
   mesmo assim **não traz dose**. Candidata anotada: Bloom 2023, ref. 11.

⚠️ **O achado que muda o planejamento.** Eu esperava que o CPTW fechasse o
Passo 5. Ele **não fecha**, e agora isso está provado pelo documento, não
suposto: em 8 páginas não há um único mcg/kg/min de dose terapêutica.

⚠️ **Vista e não usada.** Existe uma declaração europeia de agosto de 2026
sobre **critérios diagnósticos** de choque cardiogênico. É específica de
cardiogênico e é diagnóstica. **Não serve** para preencher farmacologia do C2
e não foi consultada para nenhuma linha deste mapa.

---

# REGRA DE TRANSIÇÃO · C2 → drogas vasoativas

Regra do autor, 2026-09-10, e ela resolve uma ambiguidade que o registro
recuperado já carrega.

O módulo de vasoativas **é calculadora de preparo**
(`protocols/drogas_vasoativas.json`: introdução → selecionar droga → selecionar
preparo → selecionar modo). Ele **não pode virar motor de escolha clínica**.

| decide | quem |
|---|---|
| **se** há indicação de vasoativo | **C2** |
| **qual** droga | **C2** |
| preparo, concentração, velocidade | **drogas vasoativas** |
| retorno ao ponto exato de origem no AVC | obrigatório, pelo contrato de transições |

⚠️ **O registro recuperado viola isto hoje.** Sete nós apontam para
`drogas-vasoativas` com o motivo *"Titulação de vasopressor e inotrópico"*.
**Titulação é decisão clínica**, não aritmética de preparo. Ao reconstruir,
o motivo da transição passa a ser preparo e velocidade; a titulação fica no
módulo que decidiu a droga.

⚠️ E vale o contrato geral: o módulo de origem continua funcional se o módulo
destino não existir. Ver `auditoria/MAPA-DA-ESTABILIZACAO.md`.

---

# ESTADO

**Levantamento fechado. Fonte não conferida. Nada implementável.**

O C2 continua retido. O Passo 2 ganhou arquitetura — reconhecer, classificar
mecanismo, abrir tratamento correspondente — e o Passo 5 continua sem dose.
