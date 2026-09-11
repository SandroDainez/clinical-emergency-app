# Choque no AVC — slots ainda ABERTOS

> Este arquivo **não contém verbatim**. Ele existe para dar endereço aos slots
> que já foram identificados e ainda **não têm texto transcrito**, no mesmo
> padrão de `seguranca-definicoes-operacionais.md` e
> `imagem-definicoes-operacionais.md`.
>
> ⛔ Enquanto um slot estiver aqui, **nada que ele sustentaria pode aparecer na
> tela** (§0.5). Isso vale para nome de fármaco, dose, faixa, meta e intervalo.

## Por que existem slots abertos no C2

O F-32 (ESICM 2025 · choque circulatório e monitorização hemodinâmica) declara
de si mesmo que **não é diretriz de tratamento farmacológico**. A leitura
verbatim confirmou: a diretriz manda corrigir hipoperfusão e **não diz com
quê**. Ver `auditoria/MAPA-C2-CHOQUE.md`, Passo 5.

O que falta, portanto, não é interpretação da fonte que temos. É **outra
fonte**.

---

## F-33 · ✅ FECHADO — transcrito em 2026-09-10

O PDF foi localizado em `~/Literatura Medica` e transcrito em
`protocols/fontes-verbatim/einstein-cptw386-choque.md`.

⚠️ **O que ele fechou:** reconhecimento, classificação por mecanismo,
vasopressor de escolha por subtipo, indicação e contra-indicação de
inotrópico, conduta de volume por subtipo, gatilho de linha arterial.

⛔ **O que ele NÃO fechou, e agora está provado:** dose inicial, titulação e
tipo de fluido fora da sepse. Ver F-34 e F-35 abaixo.

---

## F-34 · ✅ FECHADO — transcrito em 2026-09-10

Arabi YM et al. *ESICM clinical practice guideline on fluid therapy in adult
critically ill patients. Part 1: the choice of resuscitation fluids.*
Intensive Care Med. 2024;50(6):813–831. DOI 10.1007/s00134-024-07369-9.

Verbatim em `protocols/fontes-verbatim/esicm-2024-fluidos-parte1.md`.
Mapa das seis perguntas em `auditoria/MAPA-F34-FLUIDOS.md`.

⚠️ **O que ele fechou:** primeira escolha em adulto crítico em geral;
balanceado × salina por população; quando a albumina entra; o que evitar; as
exceções neurológicas.

⛔ **O que ele NÃO fechou:** volume, velocidade, bólus, meta hemodinâmica,
osmoterapia para hipertensão intracraniana (fora do escopo declarado) e qual
balanceado usar (lacuna de pesquisa declarada).

⚠️⚠️ **E não fechou o AVC.** O documento não menciona AVC em nenhuma das 19
páginas. As recs. 1, 7 e 11 entram por **analogia de população**, decisão do
autor, e nunca como evidência de AVC.

### A regra R-TCE saiu reforçada, com prova documental

| | adulto crítico em geral | TCE |
|---|---|---|
| albumina × cristaloide | **cristaloide** (rec. 1) | **salina isotônica** (rec. 4) |
| balanceado × salina | **balanceado** (rec. 7) | **salina isotônica** (rec. 9) |

No TCE as duas recomendações gerais **se invertem**. A regra continua valendo
para F-35a–d, e o texto operacional dela está preservado abaixo.

### ⚠️⚠️⚠️ REGRA R-TCE · TCE NÃO É PROXY DE AVC — permanece ativa

> ⛔ **Uma recomendação para traumatismo cranioencefálico não vale para AVC
> isquêmico só porque as duas populações são neurológicas.**

Três provas independentes, agora:

| fonte | população | conteúdo |
|---|---|---|
| F-32, rec. 43 (UGPS) | TCE com Glasgow ≤ 8 | PAM ≥ 80 mmHg |
| F-33, p. 5 | neurológico agudo **com hipertensão intracraniana** | PAM 90–100 mmHg |
| **F-34, recs. 4 e 9** | **TCE** | **inverte** a escolha de fluido das recs. 1 e 7 |

⚠️ A **D-137** mostrou a troca acontecendo **dentro da mesma fonte**.

**Aplicação:** recomendação escopada a TCE, sepse, trauma, queimado, cirúrgico,
cirrose, lesão renal ou qualquer outra população nomeada → transcrever com a
população declarada e marcar ⛔ **não transportável**. Só o que a fonte escopar
a *"adult critically ill patients" em geral* entra como candidato, e mesmo
assim a aplicabilidade continua pendente de revisão do autor.

⚠️ **O silêncio não é permissão.** Fonte que não nomeia população registra-se
como *"população não declarada"*, nunca como *"vale para todos"*.

---

## F-35 · A família por mecanismo — ⚠️ **reordenada em 2026-09-10**

⚠️⚠️⚠️ **O contrato do Passo 5 mudou.** ⛔ Não é *"vasopressor por mecanismo"*.
É:

```
mecanismo → intervenção causal prioritária → suporte hemodinâmico adjuvante,
            se necessário → reavaliação
```

⚠️ Em **tamponamento** e **pneumotórax hipertensivo** a intervenção é
**procedimento**, e ⛔ não droga. Em **anafilaxia**, a adrenalina é a
**intervenção causal**, e ⛔ não o suporte.

| # | sub-slot | mecanismo | estado · candidata |
|---|---|---|---|
| — | **F-35a** | cardiogênico | ✅ **transcrito** · ACC 2025 |
| **1** | **F-35b** | **anafilaxia por contraste** | ⛔ aberto · **ACR + AAAAI**, *Radiology* 2025;315(2):e240100 |
| **2** | **F-35c** | **hemorragia pós-trombólise / anticoagulação** | ⛔ aberto · **Yaghi S et al., AHA/ASA**, *Stroke* 2017;48(12):e343–e361 ✅ aberto |
| **3** | **F-35d** | TEP com instabilidade | ⛔ aberto · AHA/ACC multissocietária **2026**, *Circulation* 153(12):e977–e1051 |
| **4** | **F-35e** | tamponamento | ⛔ aberto · ESC 2015 (Adler) — ⚠️ conduta é **drenagem** |
| **5** | **F-35f** | pneumotórax hipertensivo | ⛔ aberto · BTS 2023 — ⚠️ conduta é **descompressão** |
| **6** | **F-35g** | hipovolemia **não** hemorrágica | ⛔ aberto · sem candidata firme |
| **7** | **F-35h** | crise adrenal | ⛔ aberto · Endocrine Society 2016 |
| — | neurogênico | ⛔ **sem slot** | exige trauma raquimedular, que não é via do AVC |
| — | distributivo **séptico** | ⛔ **fora de escopo** | o app já tem SSC 2026 no módulo de sepse, e ⛔ não se transporta para cá |

### ⚠️⚠️ Os dois primeiros são complicações que o PRÓPRIO MÓDULO provoca

| slot | provocado por |
|---|---|
| **F-35b** | **contraste iodado** da angioTC, que o app manda pedir |
| **F-35c** | **alteplase ou tenecteplase**, que o app manda administrar |

⚠️ Um app que recomenda uma intervenção e ⛔ **não sabe tratar a complicação
dela** tem um buraco que nenhuma outra fonte fecha. Por isso vêm antes.

➜ Levantamento completo dos dois em
`auditoria/MAPA-F35BC-CONTRASTE-E-TROMBOLISE.md`.

### ⚠️⚠️⚠️ AS TRÊS REGRAS DO SANGRAMENTO

1. ⛔ **não usar guideline de trauma para hemorragia pós-trombólise**;
2. **procurar fonte específica** de complicação hemorrágica da trombólise no AVC
   — ✅ encontrada: **Yaghi 2017**;
3. ⛔ **não tratar "hemorrágico" como entidade única** se a causa e o tratamento
   forem diferentes.

⚠️ A regra 3 quebrou o slot antigo. *"Choque hemorrágico"* juntava numa caixa só
o politraumatizado, o sangramento digestivo e o paciente que recebeu alteplase —
três causas, três tratamentos, e um deles **causado pelo próprio app**.
➜ **F-35c** e **F-35g** são slots separados, e a diretriz de trauma ⛔ não entra
em nenhum dos dois sem decisão clínica.

### ⚠️ Duas ressalvas já registradas sobre o F-35c

- **é de 2017** — declaração de desatualização obrigatória;
- ⚠️⚠️ **é de ALTEPLASE**, e o app também usa **tenecteplase**. ⛔ Não presumir
  equivalência entre trombolíticos: é a mesma classe de erro que a **R-TCE**
  barra. Declarar o agente em cada afirmação transcrita.

### Por que a família, e não uma fonte só

A busca por diretriz de sociedade para farmacologia de **choque
indiferenciado** não encontrou documento. As diretrizes são organizadas **por
tipo de choque**. ⚠️ Isto **não** é lacuna de busca: é como a literatura está
organizada, e a arquitetura do C2 já foi ajustada a isso.

⛔ Enquanto **qualquer** sub-slot do mecanismo em questão estiver aberto, o
Passo 5 **não vira tela para aquele mecanismo**. O app pode reconhecer a
ameaça, caracterizar o mecanismo e dizer que há indicação de vasopressor.
Não pode dizer quanto.

⚠️ Isso permite fechar **por mecanismo**, e não tudo de uma vez — que é
exatamente o que a arquitetura do Passo 2 torna possível.

### A prova de que o F-33 não fecha isto

Nem o F-32 nem o F-33 trazem dose inicial ou esquema de titulação de
noradrenalina. No F-33 isso foi **medido no documento**: em 8 páginas não há um
único mcg/kg/min de dose terapêutica.

⚠️⚠️ **E há uma armadilha registrada.** O CPTW386.1 **tem** uma escalada
(noradrenalina → vasopressina → adrenalina, com corticoide ao 2º vasopressor),
mas ela vive **dentro da seção «RECOMENDAÇÕES E METAS CLÍNICAS EM PACIENTES
COM SEPSE»**. ⛔ É algoritmo de sepse, está sob proibição explícita de
transporte, e **mesmo assim não traz dose**.

### ⚠️ O que este slot NÃO autoriza no lugar

- ⛔ não usar a faixa de linha arterial (0,3–0,5 mcg/kg/min) como se fosse
  faixa de titulação — ela é gatilho de monitorização;
- ⛔ não importar a dose que o módulo de sepse já tem;
- ⛔ não deduzir dose a partir da calculadora de preparo em
  `protocols/drogas_vasoativas.json`, que responde aritmética, não indicação.


---

# ⚠️ Levantamento de candidatas para F-35b, c e d — 2026-09-10

Quadro completo em `auditoria/MAPA-F35BCD-CANDIDATAS.md`.
⛔ **Identificação apenas. Nenhum documento foi lido.**

Três achados que mudam o desenho antes de qualquer transcrição:

1. ⛔ **Nem todo mecanismo termina em droga.** Tamponamento e pneumotórax
   hipertensivo se tratam com **procedimento**. Para eles o Passo 5 aponta para
   a descompressão, e não para um vasoativo.
2. ⚠️⚠️ **Dois mecanismos são causados pelo próprio módulo:** o hemorrágico,
   pela trombólise ou anticoagulação, e o anafilático, pelo contraste iodado da
   angioTC. Não são "choque em paciente com AVC" — são **complicação da conduta
   que o app recomenda**. Merecem prioridade.
3. ⚠️ **A melhor fonte do levantamento inteiro é a de TEP** (AHA/ACC
   multissocietária 2026): é a mais recente e a única com **COR e LOE** — grau
   formal que nem o ACC 2025 do F-35a tem — e inclui a **ACEP**, o que a torna
   diretriz de porta.


---

# ⚠️⚠️ F-36 · Anafilaxia geral — PROPOSTA DE SLOT NOVO, 2026-09-11

## Por que ele precisa existir

Ao conferir a fonte de anafilaxia do app, a pedido do autor, apareceu que ela
⛔ **não está à altura do contrato**:

| medida | resultado |
|---|---|
| verbatim de anafilaxia em `protocols/fontes-verbatim/` | ⛔ **não existe** |
| o que o metadado declara | *"Anafilaxia — **síntese** (WAO / EAACI / prática de emergência)"*, com `ano: null`, URL genérica, ⛔ **sem DOI e sem página** |
| módulo de anafilaxia nesta branch | ⛔ **removido** em `bdf02c8`, como o de choque — sobrou só a tradução ES |
| fonte real do **broncoespasmo** | ⚠️ **StatPearls**, e ⛔ não a WAO |

⚠️⚠️ ⛔ **Eu havia afirmado que o broncodilatador "provavelmente vive na WAO
2020" do app.** Estava errado nas duas metades: o módulo não existe aqui, e o
conteúdo que existia vinha de StatPearls.

## Candidatas, já verificadas em 2026-09-10

| documento | acesso |
|---|---|
| **Cardona V et al.** *World Allergy Organization Anaphylaxis Guidance 2020.* World Allergy Organ J. 2020;13:100472 | ✅ aberto, versão publicada |
| **Muraro A et al.** *EAACI guidelines: Anaphylaxis (2021 update).* Allergy. 2022;77:357–377 | ✅ aberto · ⚠️ mais recente |

## O que este slot deve responder — e é o que o F-35b declara fora do escopo

1. tratamento das reações **leve e moderada**;
2. **broncoespasmo** — beta-2, ipratrópio, magnésio;
3. suporte respiratório complementar;
4. anafilaxia refratária.

⚠️ **Nenhum conflito detectado** entre o conteúdo que o app tinha e o consenso
de contraste, nas duas frentes que se tocam: os dois põem a **adrenalina em
primeira linha**, e os dois dizem que inalatório e anti-H1 ⛔ **não a
substituem**.

⛔ **Não remendar o F-35b** com conteúdo de procedência fraca. ➜ Abrir slot
próprio, com fonte de sociedade e verbatim.

## ⚠️ O que preservar do conteúdo removido

O arquivo `bdf02c8^:lib/broncoespasmo-anafilaxia.ts` é **exemplar em disciplina
de procedência**, e separa três naturezas que ⛔ não podem se misturar ao
reconstruir:

| afirmação | natureza |
|---|---|
| beta-2 **e ipratrópio em primeira linha** | ✅ citação da fonte |
| **magnésio 2 g em 20 min** no refratário | ⚠️ indicação da anafilaxia, **dose emprestada da asma grave**, com aval da fonte |
| *"nenhum substitui ou atrasa a adrenalina"* | ⚠️⚠️ **inferência clínica**, ⛔ não citação — e o arquivo declara isso |
