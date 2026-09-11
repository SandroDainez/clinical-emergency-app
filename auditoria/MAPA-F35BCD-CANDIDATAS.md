# F-35b · c · d — levantamento de candidatas de fonte

**Ordem do autor, 2026-09-10:** abrir os três sub-slots **apenas para
identificar candidatas**, sem transcrever.

## ⚠️⚠️⚠️ O QUE ESTE DOCUMENTO É, E O QUE ELE NÃO É

⛔ **Nenhum destes documentos foi lido.** O que segue é:

| verificado por execução | **não** verificado |
|---|---|
| identidade bibliográfica (PubMed E-utilities) | o que cada documento diz |
| ano, veículo, população **pelo título e escopo declarado** | se cobre farmacologia |
| situação de acesso (Unpaywall, DOI a DOI) | se traz dose |

➜ As colunas **"cobre farmacologia"** e **"traz dose"** são **expectativa por
escopo**, marcadas ⏳ **a verificar**. ⛔ Tratá-las como fato seria exatamente o
erro que o F-32 e o F-33 já pregaram duas vezes: presumir que documento de
manejo traz posologia. Os dois **não traziam**.

---

# O QUADRO

## F-35b · Choque hipovolêmico e hemorrágico

| | |
|---|---|
| **melhor candidata** | **Rossaint R et al.** *The European guideline on management of major bleeding and coagulopathy following trauma: sixth edition.* **Crit Care. 2023;27(1):80.** DOI 10.1186/s13054-023-04327-7 |
| **ano** | 2023 — ⚠️ é a **edição corrente**; conferido que não há 7ª |
| **natureza** | diretriz europeia multissocietária, com graduação |
| **população** | ⚠️ **trauma**, e só trauma |
| **cobre farmacologia?** | ⏳ a verificar |
| **traz dose?** | ⏳ a verificar |
| **porta ou UTI?** | ⚠️ **porta** — é diretriz de ressuscitação inicial |
| **acesso** | ✅ **aberto**, versão publicada (BMC) |

### ⚠️ O problema de população deste sub-slot

⛔ **A melhor diretriz disponível é de trauma, e o paciente do C2 não é de
trauma.** Um AVC que fica hipovolêmico normalmente é por **desidratação**,
**perda gastrointestinal**, ou — e este é o cenário próprio do módulo —
**sangramento após trombólise ou anticoagulação**.

⚠️⚠️ **O cenário específico do AVC que ninguém mais tem:** o paciente que
recebeu alteplase ou tenecteplase e sangra. Isso é choque hemorrágico **causado
pelo tratamento do próprio módulo**, e ⛔ nenhuma diretriz de trauma foi escrita
para ele.

➜ Registrar como **lacuna de população**, e ⛔ não fechar por analogia com
trauma sem decisão clínica explícita.

### Candidata secundária, por cenário

| | |
|---|---|
| sangramento digestivo alto | **Gralnek IM et al.** *Endoscopic diagnosis and management of nonvariceal upper gastrointestinal hemorrhage (NVUGIH)* — ESGE, 2021. DOI 10.1055/a-1369-5274 · ✅ aberto |
| ⚠️ ressalva | é diretriz **endoscópica**; a parte hemodinâmica tende a ser ressuscitação e transfusão, ⛔ provavelmente **sem** vasopressor |

---

## F-35c · Choque obstrutivo

⚠️⚠️ **Este sub-slot é ele próprio uma família**: TEP, tamponamento e
pneumotórax hipertensivo têm fontes diferentes e condutas opostas.

### c1 · Tromboembolismo pulmonar — ⚠️ o mais plausível na porta do AVC

| | |
|---|---|
| **melhor candidata** | *2026 AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN Guideline for the Evaluation and Management of Acute Pulmonary Embolism in Adults.* **Circulation. 2026;153(12):e977–e1051.** DOI 10.1161/CIR.0000000000001415 · publicação simultânea em **J Am Coll Cardiol. 2026;87(13):1626–1710** |
| **ano** | **2026** — a mais recente de todo este levantamento |
| **natureza** | diretriz **multissocietária**, ⚠️ **com COR e LOE** — vantagem real sobre o ACC 2025 do F-35a, que não gradua nada |
| **população** | TEP agudo em adultos |
| **cobre farmacologia?** | ⏳ a verificar |
| **traz dose?** | ⏳ a verificar |
| **porta ou UTI?** | ⚠️ **porta** — a lista de sociedades inclui **ACEP**, medicina de emergência |
| **acesso** | ⚠️ `is_oa: false`. ⛔ **Não concluir que está fechado** — ver a regra abaixo |

⚠️⚠️ **Aplicar a regra aprendida no F-35a:** `is_oa: false` significa **sem
licença aberta**, e ⛔ não *"inacessível"*. Diretrizes da AHA costumam ser
liberadas para leitura no site. **Conferir a página do editor.**

⚠️ Substitui a ESC 2019 (Konstantinides, *Eur Heart J* 2020;41:543–603, aberta)
como candidata principal. A ESC fica como **segunda opção** se a de 2026 não for
obtida.

⚠️ **Por que é o mais plausível na porta do AVC:** paciente imobilizado por
déficit motor. É complicação conhecida do próprio curso do AVC.

⚠️ O app **já declara** duas fontes de TEP — `einstein_tep_v3` e
`medcampus_tep_adultos_v13` — mas ⛔ nenhuma é diretriz de sociedade nem foi
transcrita verbatim.

### c2 · Tamponamento cardíaco

| | |
|---|---|
| **candidata** | **Adler Y et al.** *2015 ESC Guidelines for the diagnosis and management of pericardial diseases.* **Eur Heart J. 2015;36:2921–2964.** DOI 10.1093/eurheartj/ehv318 |
| **ano** | **2015** — ⚠️ a mais antiga do levantamento; **declaração de desatualização obrigatória** |
| **população** | doenças do pericárdio |
| **cobre farmacologia?** | ⏳ a verificar — ⚠️ o tratamento do tamponamento é **drenagem**, não droga |
| **porta ou UTI?** | porta |
| **acesso** | ✅ aberto, versão publicada |

### c3 · Pneumotórax hipertensivo

| | |
|---|---|
| **candidata** | *British Thoracic Society Guideline for pleural disease.* **Thorax. 2023.** DOI 10.1136/thorax-2022-219784 |
| **ano** | 2023 |
| **cobre farmacologia?** | ⛔ **provavelmente não** — a conduta é **descompressão**, não droga |
| **porta ou UTI?** | porta |
| **acesso** | ✅ aberto |

⚠️⚠️ **Observação que muda o desenho:** em **c2 e c3 o tratamento não é
farmacológico**. Para esses dois, o F-35 pode **não ter conteúdo de vasoativo**,
e o que o C2 precisa é apontar para **o procedimento**, não para uma droga.

➜ Isso é achado de arquitetura, e vale registrar antes de transcrever qualquer
coisa: ⛔ **nem todo mecanismo do Passo 5 termina em droga.**

---

## F-35d · Choque distributivo não séptico

### d1 · Anafilaxia — ⚠️⚠️ o cenário mais específico do AVC

| | |
|---|---|
| **candidatas** | **Cardona V et al.** *World Allergy Organization Anaphylaxis Guidance 2020.* **World Allergy Organ J. 2020;13:100472.** DOI 10.1016/j.waojou.2020.100472 · ✅ aberto — **e é a fonte que o app já declara** (`wao_anaphylaxis_2020`) |
| | **Muraro A et al.** *EAACI guidelines: Anaphylaxis (2021 update).* **Allergy. 2022;77:357–377.** DOI 10.1111/all.15032 · ✅ aberto · ⚠️ mais recente |
| **população** | anafilaxia em geral |
| **cobre farmacologia?** | ⏳ a verificar — ⚠️ mas adrenalina IM é o núcleo destas diretrizes; expectativa **alta** |
| **traz dose?** | ⏳ a verificar · expectativa alta |
| **porta ou UTI?** | ⚠️ **porta**, e imediata |

⚠️⚠️⚠️ **Por que este é o mais específico do AVC, e não um mecanismo genérico:**
o paciente do módulo recebe **contraste iodado** na angioTC. Anafilaxia a
contraste é um choque distributivo **causado dentro do próprio fluxo do AVC**,
minutos depois de uma decisão que o app recomenda.

➜ ⚠️ É, junto com o sangramento pós-trombólise do F-35b, um dos dois mecanismos
que **o próprio módulo pode provocar**. Merecem prioridade sobre os demais.

⚠️ O app **já tem módulo de anafilaxia** com a WAO 2020 declarada. ➜ Aqui o
trabalho pode ser **transição entre módulos**, e não fonte nova — regra 7 do
contrato de transições.

### d2 · Crise adrenal / insuficiência adrenal

| | |
|---|---|
| **candidata** | *Diagnosis and Treatment of Primary Adrenal Insufficiency: An Endocrine Society Clinical Practice Guideline.* **2016.** DOI 10.1210/jc.2015-1710 · ✅ aberto |
| **ano** | 2016 — ⚠️ desatualização a declarar |
| **porta ou UTI?** | porta |
| **plausibilidade no AVC** | ⚠️ baixa, mas é causa reversível de choque refratário a vasopressor |

### d3 · Choque neurogênico por lesão medular

| | |
|---|---|
| **candidata** | ⛔ **nenhuma diretriz de sociedade recente localizada** |
| **plausibilidade no AVC** | ⛔ **irrelevante** — exige **trauma raquimedular**, que não é via do AVC |

➜ ⛔ **Recomendo não abrir este sub-slot.** Manter o mecanismo apenas como
diagnóstico diferencial no Passo 2, sem conduta farmacológica própria.

---

# ⚠️ SÍNTESE — o que este levantamento mostrou

## 1 · Nem todo mecanismo termina em droga

Tamponamento e pneumotórax hipertensivo se tratam com **procedimento**. Para
eles, o Passo 5 aponta para a **descompressão**, e ⛔ não para um vasoativo.

## 2 · Dois mecanismos são causados pelo próprio módulo

| mecanismo | causado por |
|---|---|
| **hemorrágico** | trombólise ou anticoagulação, que o app recomenda |
| **anafilático** | contraste iodado da angioTC, que o app recomenda |

⚠️⚠️ Estes dois **não são "choque em paciente com AVC"**. São **complicação da
conduta do módulo**. ➜ Recomendo prioridade sobre os demais.

## 3 · A melhor fonte do levantamento inteiro é a de TEP

A diretriz multissocietária de **2026** é a mais recente e a única com **COR e
LOE** — grau formal que nem o ACC 2025 do F-35a tem. E inclui **ACEP**, o que a
torna diretriz de porta, não de UTI.

## 4 · O buraco de população do F-35b

A melhor diretriz de sangramento é **de trauma**. O sangramento do paciente do
C2 é **pós-trombólise**. ⛔ Lacuna de população real, a decidir clinicamente, e
⛔ não a fechar por analogia.

## 5 · Estado de acesso

| candidata | acesso |
|---|---|
| Trauma 2023 · TEP ESC 2019 · Pericárdio 2015 · BTS 2023 · WAO 2020 · EAACI 2021 · Adrenal 2016 · ESGE 2021 | ✅ **abertos**, versão publicada |
| **TEP AHA/ACC 2026** | ⚠️ `is_oa: false` — ⛔ **não concluir que está fechado**; conferir a página do editor, como o ACC 2025 ensinou |

---

# ESTADO

**Levantamento fechado. ⛔ Nada transcrito. ⛔ Nenhum sub-slot promovido.**

Os três seguem **abertos** em `avc/conteudo/fontes.ts`. A ordem de ataque, se o
autor concordar, seria pela plausibilidade no fluxo do AVC:

1. **F-35c1 · TEP** — a melhor fonte, e complicação conhecida do AVC;
2. **F-35d1 · anafilaxia** — causada pelo contraste do próprio módulo, e o app
   já tem módulo e fonte declarada;
3. **F-35b · hemorrágico pós-trombólise** — causado pelo tratamento do módulo,
   ⚠️ com lacuna de população a resolver antes;
4. **F-35c2 e c3** — tamponamento e pneumotórax, que provavelmente **não são
   farmacológicos**;
5. ⛔ **F-35d3 · neurogênico** — recomendo **não abrir**.
