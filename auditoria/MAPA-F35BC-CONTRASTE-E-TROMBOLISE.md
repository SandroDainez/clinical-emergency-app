# F-35b e F-35c — as duas complicações que o próprio módulo provoca

**Ordem do autor, 2026-09-10:** identificar e mapear as fontes, **sem
transcrever**.

## ⚠️ Por que estes dois vêm primeiro

Nenhum dos dois é *"choque em paciente com AVC"*. Os dois são **complicação
direta de uma conduta que o app recomenda**:

| slot | mecanismo | provocado por |
|---|---|---|
| **F-35b** | anafilaxia | **contraste iodado** da angioTC, que o app manda pedir |
| **F-35c** | hemorrágico | **alteplase ou tenecteplase**, que o app manda administrar |

⚠️⚠️ Um app que recomenda uma intervenção e **não sabe tratar a complicação
dela** tem um buraco que nenhuma outra fonte fecha, porque nenhuma outra fonte
foi escrita para esse fluxo.

## ⛔ O que este documento NÃO é

⛔ **Nenhum dos documentos foi lido.** Verificado por execução: identidade
bibliográfica (PubMed E-utilities) e situação de acesso (Unpaywall, DOI a DOI).
Tudo sobre **conteúdo** está marcado ⏳ **a verificar**.

---

# F-35b · Anafilaxia por contraste iodado

## A candidata principal

| | |
|---|---|
| **documento** | **Wang C, Ramsey A, Lang D, Copaescu AM, Krishnan P, Kuruvilla M, Mervak B, Newhouse J, Sumkin A, Saff R.** *Management and Prevention of Hypersensitivity Reactions to Radiocontrast Media: A Consensus Statement from the American College of Radiology and the American Academy of Allergy, Asthma & Immunology.* |
| **veículo** | **Radiology. 2025 May;315(2):e240100.** DOI 10.1148/radiol.240100 |
| **natureza** | **consensus statement conjunto de duas sociedades** — ACR (radiologia) e AAAAI (alergia) |
| **ano** | **2025** |
| **população** | reações de hipersensibilidade a **meio de contraste radiológico** |
| **cobre farmacologia?** | ⏳ a verificar · expectativa **alta** |
| **traz dose?** | ⏳ a verificar · expectativa **alta** |
| **porta ou UTI?** | ⚠️ **porta**, e imediata — a reação acontece na sala de imagem |
| **acesso** | ⚠️ `is_oa: false` — ⛔ **não concluir que está fechado**, ver regra do F-35a |

⚠️⚠️ **É a fonte certa para este slot, e não uma diretriz geral de anafilaxia.**
O agente é conhecido, o momento é conhecido, e o documento é das duas sociedades
que disputam o assunto. Reação a contraste tem literatura **própria**, com
categorias próprias (*allergic-like* × fisiológica; leve, moderada, grave).

## Candidatas complementares

| documento | papel |
|---|---|
| **Cardona V et al.** *World Allergy Organization Anaphylaxis Guidance 2020.* World Allergy Organ J. 2020;13:100472 · ✅ **aberta** | ⚠️ **já declarada no app** (`wao_anaphylaxis_2020`), no módulo de anafilaxia. Serve para a anafilaxia **em geral** |
| **Muraro A et al.** *EAACI guidelines: Anaphylaxis (2021 update).* Allergy. 2022;77:357–377 · ✅ **aberta** | mais recente que a WAO; alternativa europeia |
| **ACR Manual on Contrast Media** | ⚠️ manual operacional de referência em radiologia. ⛔ **Não tem paginação de periódico nem DOI** — ver a ressalva abaixo |

⚠️ **Ressalva sobre o ACR Manual:** é o documento que os serviços de radiologia
de fato usam, mas é **manual**, revisado por edição, sem DOI e sem paginação
estável. ⛔ O contrato do projeto exige **página**. ➜ Se entrar, entra como
fonte **operacional complementar**, com a edição declarada, e ⛔ nunca como
fonte principal.

## ⚠️ O que já existe no app, e muda o trabalho

O app **já tem módulo de anafilaxia** com a WAO 2020 declarada.

➜ Então este slot pode **não precisar de conteúdo novo de conduta**. Pode ser
principalmente:

1. **reconhecimento** no contexto certo — o paciente reage **minutos após o
   contraste**, dentro do fluxo do AVC;
2. **transição de módulo** — C2 reconhece, decide, e entrega ao módulo de
   anafilaxia, com **retorno obrigatório** ao ponto de origem no AVC (regra 7
   do contrato de transições);
3. **o que é específico do contraste** e a WAO 2020 não cobre — categorias de
   reação, prevenção, e o que fazer com o exame em andamento.

⚠️ **A pergunta que só esta frente responde:** o paciente reagiu ao contraste —
⛔ **a angioTC continua? a trombectomia continua?** Isso não é pergunta de
diretriz de anafilaxia; é pergunta do fluxo do AVC, e pode não ter fonte.
➜ Registrar como **possível lacuna** antes de transcrever.

---

# F-35c · Hemorragia pós-trombólise ou anticoagulação

## A candidata principal — e ela é exatamente o que o autor pediu

| | |
|---|---|
| **documento** | **Yaghi S et al.** *Treatment and Outcome of Hemorrhagic Transformation After Intravenous Alteplase in Acute Ischemic Stroke: A Scientific Statement for Healthcare Professionals From the American Heart Association/American Stroke Association.* |
| **veículo** | **Stroke. 2017;48(12):e343–e361.** DOI 10.1161/STR.0000000000000152 |
| **natureza** | *scientific statement* **AHA/ASA** |
| **ano** | **2017** — ⚠️ ver a ressalva de desatualização |
| **população** | ⚠️⚠️ **transformação hemorrágica após alteplase IV no AVC isquêmico agudo** — **exatamente** o paciente do módulo |
| **cobre farmacologia?** | ⏳ a verificar · expectativa **alta** |
| **traz dose?** | ⏳ a verificar |
| **porta ou UTI?** | **porta** — a complicação acontece nas primeiras horas |
| **acesso** | ✅ **aberto**, versão publicada |

⚠️⚠️⚠️ **É a fonte específica que o autor mandou procurar.** Não é diretriz de
trauma, não é diretriz de HIC espontânea: é a complicação do tratamento do AVC,
escrita pela sociedade do AVC.

## ⚠️ Duas ressalvas, e a segunda é séria

### 1 · Ano

**2017.** ⚠️ Declaração de desatualização obrigatória, no mesmo padrão já
aplicado ao F-33.

### 2 · ⚠️⚠️ ALTEPLASE, e o app usa TENECTEPLASE

O título diz **"After Intravenous Alteplase"**. O app hoje oferece **alteplase
e tenecteplase** — o F-09 e o F-20 tratam dos dois, e a Superfície F tem prova
de correspondência entre eles.

⛔ **Não presumir que o tratamento da transformação hemorrágica da tenecteplase
é o mesmo da alteplase** só porque os dois são trombolíticos. É a mesma classe
de erro que a **R-TCE** barra: proximidade não é equivalência.

➜ Ao transcrever, **declarar o agente** em cada afirmação, e registrar
explicitamente se a fonte fala de tenecteplase ou só de alteplase. Se só de
alteplase, isso vira **lacuna de agente**, decidida clinicamente e ⛔ não por
analogia.

## Candidata complementar

| documento | situação |
|---|---|
| **Frontera JA et al.** *Guideline for Reversal of Antithrombotics in Intracranial Hemorrhage* — Neurocritical Care Society / SCCM, 2016 | ⛔ `is_oa: false`. ⚠️ E é de **HIC**, não de transformação hemorrágica pós-IVT — populações vizinhas, **não equivalentes** |

## ⚠️ O que já existe no app

O ramo **HIC** está transcrito, **H-01 a H-15**, a partir da AHA/ASA 2022. Mas:

⚠️⚠️ **HIC espontânea ≠ transformação hemorrágica pós-trombólise.** A primeira é
uma doença; a segunda é uma **complicação iatrogênica** com coagulopatia
induzida por fibrinolítico. ⛔ Não transportar H-01…H-15 para cá sem decisão
clínica explícita — é a **regra 3 do sangramento**, aplicada.

## ⚠️ E o sangramento SISTÊMICO

O Yaghi 2017 é sobre **transformação hemorrágica**, ou seja, sangramento
**intracraniano**. O paciente que recebeu trombolítico também pode sangrar
**fora do crânio** — digestivo, retroperitoneal, sítio de punção.

⛔ **Isso pode não estar coberto por nenhuma das fontes levantadas.**
➜ Registrar como **possível lacuna** antes de transcrever, e ⛔ não fechar com
diretriz de trauma — regra 1 do sangramento.

---

# SÍNTESE

| slot | candidata principal | ano | natureza | população | acesso |
|---|---|---|---|---|---|
| **F-35b** | ACR + AAAAI, *Radiology* 315(2):e240100 | **2025** | consensus statement de duas sociedades | hipersensibilidade a contraste | ⚠️ conferir no editor |
| **F-35c** | Yaghi S et al., *Stroke* 48(12):e343–e361 | 2017 | scientific statement AHA/ASA | **transformação hemorrágica pós-alteplase no AVC** | ✅ aberto |

## As três lacunas que este levantamento já enxerga

1. ⛔ **A angioTC continua depois da reação ao contraste?** Pergunta do fluxo do
   AVC, provavelmente sem fonte.
2. ⛔ **Tenecteplase** — a fonte do F-35c é de **alteplase**.
3. ⛔ **Sangramento sistêmico** pós-trombolítico, fora do crânio.

⚠️ As três são **lacunas de fluxo**, e não de leitura. Nenhuma se fecha
escolhendo melhor a fonte; todas dependem de decisão clínica do autor.

---

# ⚠️⚠️ ESTADO DO ACESSO — 2026-09-11

Ordem do autor: transcrever os dois. ⛔ **Os dois PDFs não foram obtidos.**

| slot | documento | acesso |
|---|---|---|
| **F-35b** | ACR + AAAAI, *Radiology* 2025;315(2):e240100 | ⛔ `is_oa: false` · **nenhuma localização aberta registrada** · não está no PMC |
| **F-35c** | Yaghi S et al., *Stroke* 2017;48(12):e343–e361 | ✅ **aberto no editor**, versão publicada · ⛔ `ahajournals.org` devolve **HTTP 403** a agente automático |

⚠️ **Uma tentativa foi feita para o F-35c**, porque o Unpaywall registra a
versão publicada como aberta no editor. O `ahajournals.org` recusou. ⛔ Parei
aí, pela mesma regra do F-35a: leitura livre ⛔ não implica obtenção
automática, e ⛔ não se contorna proteção de acesso.

➜ **Quem destrava é uma pessoa num navegador comum**, salvando os PDFs:

```
https://www.ahajournals.org/doi/10.1161/STR.0000000000000152
https://pubs.rsna.org/doi/10.1148/radiol.240100
```

⚠️ O do *Radiology* pode exigir acesso institucional — ele ⛔ **não** está
marcado como aberto em lugar nenhum, diferente do caso do ACC 2025.

---

# ✅ O QUE FOI FEITO SEM OS PDFs

## 1 · Os contratos de transcrição, escritos

`protocols/fontes-verbatim/f35b-contraste-contrato.md` e
`f35c-trombolise-contrato.md` — com as listas de itens do autor, item a item,
para que a chegada dos arquivos não dependa de reconstruir o combinado.

## 2 · A categoria «lacuna de fluxo», criada

`auditoria/LACUNA-DE-FLUXO.md`. Ela **não** se fecha lendo melhor, e procurar
fonte para ela é trabalho desperdiçado — pior, empurra para inventar.

**Cinco lacunas de fluxo já registradas**, e nenhuma dependeu de ler as fontes:

| id | pergunta | origem |
|---|---|---|
| **LF-01** | a angioTC continua depois da reação ao contraste? | F-35b |
| **LF-02** | a trombectomia continua? ⚠️ e ela usa **mais** contraste | F-35b |
| **LF-03** | reexposição a contraste com o relógio do AVC correndo | F-35b |
| **LF-04** | sangramento **extracraniano** pós-trombolítico | F-35c |
| **LF-05** | **tenecteplase** na complicação hemorrágica | F-35c |

⚠️ **LF-01 a LF-03 não seriam respondidas nem com os PDFs em mãos.** A conduta
da anafilaxia tem fonte de duas sociedades; o que não existe é o que fazer com
a **janela de reperfusão** enquanto a reação acontece.

# ESTADO

⛔ **Nada transcrito. Nenhum slot promovido.** Sem código e sem deploy.

⚠️ Os dois mapas pedidos — `ameaça → intervenção causal → suporte →
reavaliação → condição para seguir/transferir` — ⛔ **não podem ser montados
sem as fontes**. Montá-los agora seria escrever conduta de memória.
