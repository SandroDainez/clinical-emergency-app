# AHA/ASA 2026 — Early Management of Patients With Acute Ischemic Stroke

**Prabhakaran S, et al.** *2026 Guideline for the Early Management of Patients
With Acute Ischemic Stroke: A Guideline From the American Heart
Association/American Stroke Association.* **Stroke**, 2026.
**DOI:** `10.1161/STR.0000000000000513` · **PMID:** 41582814
Publicada online em 26/01/2026 · edição impressa: Stroke v.57 n.8 (agosto/2026).
Substitui as Guidelines de 2018 e a atualização de 2019.

**Declarada fonte-mãe do módulo AVC** pelo autor em 2026-08-28.
**Transcrito por:** — · **Data:** —

---

## ⛔ ESTE ARQUIVO ESTÁ VAZIO DE PROPÓSITO

**Nenhum trecho foi transcrito ainda.** A regra da casa, escrita em
`ACHADOS-SEM-VERBATIM.md`, vale aqui sem exceção:

> *"Referência bibliográfica não é fonte; texto é. O verbatim tem de sair do PDF
> do documento original, e só então vira conteúdo de tela, com número e grau."*

**O que foi conferido:** a existência da publicação e seus dados bibliográficos,
por busca (PubMed e páginas oficiais da AHA), em 2026-08-28.
**O que NÃO foi obtido:** o texto. `ahajournals.org` e `professional.heart.org`
responderam **HTTP 403**.

Enquanto este arquivo estiver vazio, **nenhum número entra na spec nem no app** —
os slots `F-nn` de `auditoria/ESPECIFICACAO-AVC.md` permanecem abertos.

---

## ⚠️ FILTRO OBRIGATÓRIO NA TRANSCRIÇÃO: CONTEÚDO PEDIÁTRICO

Esta publicação traz **também a primeira orientação pediátrica de AVC** da
AHA/ASA. O app é de população **adulta** (PD-2), e `npm run test:escopo-pediatrico`
reprova o build diante de dose pediátrica.

**Os oito fragmentos pediátricos que já entraram no app entraram exatamente
assim:** por fonte que cita as duas populações, com o número pediátrico copiado
junto. Transcrever **só o adulto**, e marcar no trecho quando a fonte tratava das
duas.

---

## O CONTRATO DE FECHAMENTO DE UM SLOT

Definido em **§6.11** da `ESPECIFICACAO-AVC.md`. Um slot **só fecha** entregando:

| # | exigência |
|---|---|
| 1 | **trecho verbatim** |
| 2 | **localização** — seção · tabela · página |
| 3 | **grau e nível**, quando existirem |
| 4 | **população** a que o trecho se aplica |
| 5 | **espécie de conteúdo** — dose? meta? limite? janela? recomendação? |
| 6 | **marco**, se for janela temporal (de que relógio se conta) |
| 7 | **fonte-mãe ou complementar** — e a marcação, se complementar |
| 8 | **divergências conhecidas**, com os cinco registros de §6.6 |
| 9 | **exige adaptação brasileira?** |
| 10 | **nível de construção** do texto que dali sair (1 a 4, §6.9) |
| 11 | **data e responsável** pela transcrição |

⛔ **Slot que entrega número sem os itens 1, 2 e 4 não está fechado — está
preenchido**, que é diferente.

⚠️ **Estado atual dos 17 slots:** `fonte identificada, conteúdo não validado`
(§6.5). Este estado **não autoriza** dose, meta, limite, janela, contraindicação
nem classe de recomendação.

---

## O QUE PRECISA SER TRANSCRITO — pauta ligada aos slots da spec

### F-02 · Janela para trombólise IV, contada do último-visto-bem
> _(verbatim pendente)_

### F-03 · Janela estendida e critérios de imagem avançada (AVC ao acordar)
> _(verbatim pendente)_

### F-04 · Meta pressórica antes da trombólise, e depois dela
> _(verbatim pendente)_

### F-05 · Conduta pressórica em quem não vai reperfundir
> _(verbatim pendente)_

### F-06 · Glicemia: corte que obriga correção, e alvo
> _(verbatim pendente)_

### F-07 · Contraindicações à trombólise IV
> _(verbatim pendente)_
>
> ⚠️ **Transcrever preservando a distinção entre o que é corrigível e o que não
> é.** A spec trata as duas como espécies diferentes (Parte 2), e a diretriz
> costuma listá-las na mesma coluna. Onde a fonte não separar, a separação é
> **decisão do autor** — e fica marcada como tal, não inferida por mim.

### F-08 · Elegibilidade para trombectomia mecânica
> _(verbatim pendente)_
>
> Resumos oficiais sinalizam **ampliação** de elegibilidade nesta edição,
> incluindo **oclusão de basilar** e **core isquêmico grande**, antes excluídos.
> ⚠️ Sinalização de resumo, **não** critério — o critério sai do texto.

### F-09 · Trombolítico(s) e dose por peso
> _(verbatim pendente)_

### F-10 · Anticoagulante prévio: o que bloqueia, o que exige exame
> _(verbatim pendente)_

### F-11 · Tempos-alvo porta-imagem e porta-agulha
> _(verbatim pendente)_

### F-13 · Critério de suspeita (intra-hospitalar)
> _(verbatim pendente)_
>
> ⚠️ **Reduzido por P-03 (2026-08-28):** o AVC V1 começa na emergência. A escala
> pré-hospitalar deixa de ser instrumento do app e passa a **contexto recebido**
> — transcrever apenas o que sustenta o critério de suspeita intra-hospitalar.

### F-14 · mRS prévio: critério ou contexto
> _(verbatim pendente)_
>
> **Interino fixado pelo autor (P-05, 2026-08-28):** mRS prévio é **dado/contexto
> clínico estruturado**. **Não** vira contraindicação automática. O papel em IVT e
> EVT permanece aberto até este trecho ser transcrito.

### F-15 · Manejo inicial pós-reperfusão e monitorização
> _(verbatim pendente)_

### F-16 · Imagem: qual exame, em que ordem, e o que decide
> _(verbatim pendente)_

### F-17 · "Déficit incapacitante" — o que o compõe, e o papel do NIHSS
> _(verbatim pendente)_
>
> ⚠️ **Afirmação do autor a confirmar no texto (2026-08-28):** que a AHA/ASA 2026
> deixa claro que **o NIHSS isoladamente não determina** se o déficit é
> incapacitante, e que **o impacto funcional individual precisa ser avaliado**.
> Enquanto não transcrito, isso é **dado declarado pelo autor** — não afirmação
> da spec.
>
> **O que este bloco precisa entregar:** as **dimensões** que a fonte sustenta
> para compor o julgamento. A decomposição de §2.8 só pode conter pergunta que
> saia daqui — pergunta sem fonte não entra (**E-19**).

---

## F-12 · NÃO SE TRANSCREVE DAQUI — regra de disponibilidade brasileira

**Regra permanente declarada pelo autor em 2026-08-28:**

> Disponibilidade e comercialização brasileiras **não se inferem da guideline
> americana.** Medicamento e apresentação usados no Brasil exigem **fonte
> brasileira** ou verificação específica de disponibilidade.

O módulo removido registrava que os anti-hipertensivos IV citados pela AHA não
têm apresentação intravenosa comercializada no Brasil. Isso é **ponteiro para
conferência**, não conteúdo aprovado, e a fonte que o resolve **não é esta**.
