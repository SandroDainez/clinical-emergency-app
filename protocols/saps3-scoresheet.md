# SAPS 3 — folha de pontuação, transcrita do artigo original

Fonte: Moreno RP, Metnitz PGH, Almeida E, Jordan B, Bauer P, Abizanda Campos R,
Iapichino G, Edbrooke D, Capuzzo M, Le Gall JR; SAPS 3 Investigators.
**SAPS 3 — From evaluation of the patient to evaluation of the intensive care
unit. Part 2: Development of a prognostic model for hospital mortality at ICU
admission.** *Intensive Care Med.* 2005 Oct;31(10):1345–1355. PMID 16132892.
Errata em *Intensive Care Med.* 2006 May;32(5):796 — **ainda não conferida**.

Transcrito das Tabelas 1 e 2 (p. 1348–1350), lendo as páginas renderizadas a
220 dpi e rotacionadas. Não foi usado texto extraído: o `pdftotext` desalinha as
colunas desta tabela e leva a atribuir o ponto errado à faixa errada.

Este arquivo existe para que a reimplementação seja mecânica e conferível, sem
depender de alguém reler o PDF.

---

## Caixa I — paciente antes da internação

| Variável | Faixas e pontos |
|---|---|
| **Idade** (anos) | < 40 → **0** · 40–59 → **5** · 60–69 → **9** · 70–74 → **13** · 75–79 → **15** · ≥ 80 → **18** |
| **Comorbidades** | Quimio/imunossupressão/radio/corticoide → **3** · ICC classe IV NYHA → **6** · Neoplasia hematológica → **6** · Cirrose → **8** · AIDS → **8** · Câncer metastático → **11** |
| **Dias de hospital antes da UTI** | < 14 → **0** · 14–27 → **6** · ≥ 28 → **7** |
| **Local intra-hospitalar antes da UTI** | Emergência → **5** · Outra UTI → **7** · Enfermaria/outro → **8** |
| **Terapias maiores antes da UTI** | Droga vasoativa → **3** |

## Caixa II — circunstâncias da admissão

**Todo paciente recebe 16 pontos por ser admitido.** Nota 12 da Tabela 2, literal:
*"Every patient gets an offset of 16 points for being admitted (to avoid negative
SAPS 3 Scores)."*

| Variável | Faixas e pontos |
|---|---|
| **Admissão** | Planejada → **0** · Não planejada → **3** |
| **Status cirúrgico** | Cirurgia programada → **0** · Não operado → **5** · Cirurgia de emergência → **6** |
| **Infecção aguda na admissão** | Nosocomial → **4** · Respiratória → **5** |

### Motivo da admissão na UTI

| Motivo | Pontos |
|---|---:|
| Cardiovascular: distúrbio de ritmo | **−5** |
| Neurológico: convulsões | **−4** |
| Cardiovascular: choque hipovolêmico hemorrágico ou não hemorrágico · Digestivo: abdome agudo, outros | **3** |
| Neurológico: coma, estupor, torpor, distúrbio de vigilância, confusão, agitação, delirium | **4** |
| Cardiovascular: choque séptico · choque anafilático, misto ou indefinido | **5** |
| Hepático: falência hepática | **6** |
| Neurológico: déficit neurológico focal | **7** |
| Digestivo: pancreatite grave | **9** |
| Neurológico: efeito de massa intracraniano | **10** |
| Todos os outros | **0** |

### Sítio anatômico da cirurgia

| Sítio | Pontos |
|---|---:|
| Transplante: fígado, rim, pâncreas, rim+pâncreas, outro | **−11** |
| Trauma isolado (tórax, abdome, membro) · Trauma múltiplo | **−8** |
| Cirurgia cardíaca: revascularização sem troca valvar | **−6** |
| Neurocirurgia: acidente vascular cerebral | **5** |
| Todos os outros | **0** |

## Caixa III — fisiologia na admissão

| Variável | Faixas e pontos |
|---|---|
| **Glasgow** (menor) | 3–4 → **15** · 5 → **10** · 6 → **7** · 7–12 → **2** · ≥ 13 → **0** |
| **Bilirrubina total** (maior) | < 2 mg/dL → **0** · 2–5,9 → **4** · ≥ 6 → **5** |
| **Temperatura** (maior) | < 35 °C → **7** · ≥ 35 → **0** |
| **Creatinina** (maior) | < 1,2 mg/dL → **0** · 1,2–1,9 → **2** · 2–3,4 → **7** · ≥ 3,5 → **8** |
| **Frequência cardíaca** (maior) | < 120 → **0** · 120–159 → **5** · ≥ 160 → **7** |
| **Leucócitos** (maior) | < 15 mil/mm³ → **0** · ≥ 15 → **2** |
| **pH** (menor) | ≤ 7,25 → **3** · > 7,25 → **0** |
| **Plaquetas** (menor) | < 20 mil/mm³ → **13** · 20–49 → **8** · 50–99 → **5** · ≥ 100 → **0** |
| **PA sistólica** (menor) | < 40 mmHg → **11** · 40–69 → **8** · 70–119 → **3** · ≥ 120 → **0** |
| **Oxigenação** | P/F < 100 **com VM** → **11** · P/F ≥ 100 **com VM** → **7** · PaO₂ < 60 **sem VM** → **5** · PaO₂ ≥ 60 **sem VM** → **0** |

---

## Regras de combinação — atenção

Nota de rodapé da Tabela 1, literal: *"no mutually exclusive conditions exist for
the following fields: Comorbidities, Reasons for ICU admission, and Acute
infection at ICU admission. Thus, if a patient has more than one condition listed
for a specific variable, points are assigned for all applicable combinations."*

Ou seja, **comorbidades, motivos de admissão e infecção somam entre si** — não é
"escolha a pior".

Duas exceções escritas no artigo:

- Nota 3: cirrose **e** AIDS juntas → pontos em dobro. Vale também para ICC classe
  IV **e** neoplasia hematológica.
- Nota 13: se distúrbio de ritmo **e** convulsões estiverem ambos presentes como
  motivo, pontua só o pior valor (**−4**).

## Mortalidade

```
logit = −32,6659 + ln(SAPS 3 + 20,5958) × 7,3068
probabilidade de morte = e^logit / (1 + e^logit)
```

⚠️ Essa é a equação **GLOBAL**. O próprio artigo mede razão observado/esperado de
**1,30 (IC 1,23–1,37) para América Central e do Sul** — o pior desempenho entre
todas as regiões, ou seja, a equação global **subestima** mortalidade aqui.
Existe equação regional customizada na Tabela 5, e é ela que um app brasileiro
deveria usar. **A Tabela 5 ainda não foi transcrita.**

## Sanidades para conferir a implementação

- Faixa teórica declarada no artigo: **0 a 217 pontos**.
- Coorte de desenvolvimento (16.784 pacientes, 303 UTIs): mínimo observado **5**,
  máximo **124**, média **49,9 ± 16,6**, mediana **48 (38–60)**.
- Capacidade discriminatória global: aROC **0,848**.

### O teto não fecha — e por que isso deixou de ser bloqueio

Somando todos os máximos com comorbidades aditivas, o teto dá **243**, e não os
217 que o artigo declara. O texto não explica a diferença.

Isso deixou de bloquear a implementação porque **o invariante exato do SAPS 3 não
é o teto: é o piso**. O artigo declara mínimo 0 e explica o offset como existindo
*"to avoid negative SAPS 3 Scores"*. Isso só fecha se

```
16 (offset) − 11 (transplante) − 5 (distúrbio de ritmo) = 0
```

O zero valida, de uma vez, o offset obrigatório e os dois pesos negativos do
modelo — e é justamente o offset que estava faltando na implementação antiga.
É um teste mais sensível que o teto, e é o que está no
`scripts/valida-calculadoras.cjs`.

O teto de 243 fica registrado como divergência não explicada pelo artigo, não
como erro da implementação.

### Simplificação assumida

O motivo de admissão é implementado como **seleção única do motivo predominante**.
O artigo permite somar mais de um motivo. Quem tiver mais de um motivo terá
escore real maior que o mostrado — está escrito no alerta da tela.
