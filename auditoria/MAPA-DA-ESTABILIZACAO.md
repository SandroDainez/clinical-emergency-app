# Mapa da Estabilização A–E — ameaça → tratamento → reavaliação → seguir

**Levantamento de 2026-09-10.** ⛔ Nenhuma implementação. ⛔ Nenhum número
clínico novo: o que está aqui **já existe no repositório** ou está marcado como
**falta transcrever**.

## O contrato que este mapa serve

> *"avaliar → identificar ameaça imediata → corrigir → reavaliar → só então
> avançar"* — autor, 2026-09-10.

⛔ A Estabilização **não é tela de registro do ABCDE**. ⛔ Ela conduz. ⛔ Quando um
eixo mostra ameaça, ⛔ o app **⛔ abre o tratamento**; ⛔ quando não mostra, ⛔ o
fluxo segue.

## O que o app já tem, e o padrão que ele já inventou

⚠️ O repositório **⛔ já resolveu** este problema duas vezes. ⛔ Quando a AHA/ASA
reconhece a necessidade ⛔ mas ⛔ não operacionaliza, ⛔ o projeto abre um **slot
próprio**, com **fonte complementar** e **procedência separada**:

| slot | assunto | arquivo | estado |
|---|---|---|---|
| **F-18** | Correção glicêmica **operacional** | fonte BR | ✅ transcrito |
| **F-19** | Anti-hipertensivo IV **operacional** | fonte BR | ✅ transcrito |

⛔ É exatamente o mecanismo que A e B precisam. ⛔ **⛔ Não é invenção nova** —
⛔ é o padrão da casa.

---

## A · VIA AÉREA

| # | | |
|---|---|---|
| 1 | **fatos avaliados** | `consciencia_rebaixada` · `disfuncao_bulbar` |
| 2 | **critério de ameaça** | **qualitativo**, dois gatilhos nomeados: consciência rebaixada **ou** disfunção bulbar. ⛔ Sem escore, ⛔ sem corte |
| 3 | **conduta imediata (fonte)** | F-23 rec. 1 · **COR 1 · LOE C-LD** — *"airway support and ventilatory assistance are recommended **as needed**"* |
| 4 | **tratamento operacional** | ⛔ **NÃO EXISTE NO MÓDULO.** A transcrição diz textualmente: *"⛔ Nenhuma dose, fluxo, dispositivo ou técnica de via aérea consta da fonte"* |
| 5 | **parâmetros/doses** | ⛔ nenhum |
| 6 | **reavaliar** | ⛔ não declarado |
| 7 | **critério de resolução** | ⛔ não declarado |
| 8 | **bloqueia?** | ⛔ não bloqueia (**E-49**) · hoje ⛔ nem alerta com destino |

### ⛔ O que falta, nomeado

**Slot novo — «Via aérea operacional na estabilização»**, fonte complementar,
procedência separada, no padrão F-18/F-19. ⛔ Precisa cobrir: posicionamento e
manobras básicas, dispositivos básicos (cânula oro/nasofaríngea), aspiração,
supraglótico, indicação de via aérea definitiva, **confirmação** (capnografia) e
o que reavaliar depois.

⚠️⚠️ ⛔ **A D-104 vigia esta porta.** ⛔ Decisão sua de 2026-08-27: ⛔ **⛔ não**
reabrir ISR/VM ⛔ por aqui. ⛔ O slot tem de ser **⛔ estabilização de via aérea
no AVC**, ⛔ e ⛔ não um módulo de intubação ⛔ entrando pela lateral.

---

## B · RESPIRAÇÃO / OXIGENAÇÃO

| # | | |
|---|---|---|
| 1 | **fatos avaliados** | `hipoxia` · `spo2` · `fr` |
| 2 | **critério de ameaça** | **qualitativo** (hipóxia presente). ⛔ `SpO₂ > 94 %` é **meta**, ⛔ e ⛔ não gatilho |
| 3 | **conduta imediata (fonte)** | F-23 rec. 2 · **COR 1 · LOE C-LD** — O₂ suplementar para manter SpO₂ > 94 %. ⛔ E o **contra**: rec. 5 · **COR 3: No benefit** — ⛔ sem hipóxia, ⛔ O₂ ⛔ não recomendado |
| 4 | **tratamento operacional** | ⛔ **PARCIAL.** A **meta** existe; ⛔ o **dispositivo, o fluxo e o escalonamento ⛔ não** |
| 5 | **parâmetros/doses** | alvo SpO₂ > 94 % ✅ · fluxo/dispositivo ⛔ |
| 6 | **reavaliar** | ⛔ implícito (SpO₂), ⛔ não declarado como ciclo |
| 7 | **critério de resolução** | SpO₂ > 94 % — ⚠️ ⛔ derivável, ⛔ mas ⛔ **⛔ não** implementado como resolução |
| 8 | **bloqueia?** | ⛔ não bloqueia · hoje ⛔ nem alerta com destino |

### ⛔ O que falta, nomeado

**Slot novo — «Oxigenoterapia e suporte ventilatório na estabilização»**: cânula
nasal → máscara → alto fluxo → VNI → VM, com faixas de fluxo e critérios de
escalonamento. ⛔ Mesma vigilância da **D-104**.

⚠️ ⛔ A rec. 3 (**hiperóxia normobárica**, COR 2b) ⛔ **⛔ não entra**: ⛔ ela exige
⛔ cinco condições simultâneas (≤6 h + NIHSS 10–20 + ASPECTS ≥6 + LVO anterior +
EVT planejada) ⛔ e ⛔ é ⛔ a mais estreita do documento.

---

## C · CIRCULAÇÃO — duas ameaças diferentes

### C1 · HAS impeditiva da reperfusão ✅ **O ÚNICO EIXO COMPLETO HOJE**

| # | | |
|---|---|---|
| 1 | **fatos** | `pas` · `pad` (instância `pa`) |
| 2 | **ameaça** | **≥ 185 / 110 mmHg** — corte numérico explícito (F-04) |
| 3 | **conduta** | F-04 · **COR 1 · LOE B-NR** — baixar antes da IVT |
| 4 | **operacional** | ✅ **F-19** — **11 agentes** com dose e via |
| 5 | **doses** | ✅ labetalol 10–20 mg EV · nicardipino 5 mg/h · clevidipino 1–2 mg/h · esmolol · metoprolol · enalaprilato · hidralazina · nitroprussiato… |
| 6 | **reavaliar** | ✅ `resolvePor: "Uma nova aferição de pressão arterial"` — ⛔ e ⛔ **⛔ nova instância**, ⛔ não correção |
| 7 | **resolução** | ✅ nova aferição **completa** abaixo do corte |
| 8 | **bloqueia?** | ⛔ **não bloqueia navegação** (E-49) · **bloqueia o portão da IVT** (`bloqueado_corrigivel`) |

### C2 · Choque / hipotensão ⛔ **FORA DO MÓDULO HOJE**

⛔ ⛔ **⛔ Nenhuma fonte transcrita aqui dá limiar inferior de PA.** ⛔ O comentário
do núcleo é explícito: ⛔ *"o app ⛔ não vai passar a acender por hipotensão:
⛔ nenhuma fonte transcrita aqui dá limiar inferior, ⛔ e inventá-lo seria a
conduta nascendo na tela (**E-31**)"*.

⛔ Uma PA de **80/46** ⛔ hoje ⛔ **⛔ não acende**. ⚠️ ⛔ Isso é ⛔ **⛔ decisão
registrada**, ⛔ e ⛔ não esquecimento — ⛔ mas ⛔ é ⛔ uma ameaça real ⛔ que a
estabilização ⛔ deveria tratar. **Slot novo** ⛔ necessário: acesso, volume,
vasopressor/inotrópico por perfil, ⛔ com fonte complementar.

---

## M · METABÓLICO — hoje ele **é** o eixo D, e não deveria ser

### M1 · Hipoglicemia ✅ **completo**

| # | | |
|---|---|---|
| 1 | **fatos** | `glicemia` (instância própria desde **D-133**) |
| 2 | **ameaça** | **< 60 mg/dL** — corte explícito (F-06) |
| 3 | **conduta** | F-06 · *"hypoglycemia should be treated to avoid complications"* |
| 4 | **operacional** | ✅ **F-18** |
| 5 | **doses** | ✅ glicose EV 25 mL (12,5 g) · glicose oral 15 g · glucagon 1 mg IM/SC ou 3 mg intranasal |
| 6 | **reavaliar** | ✅ `resolvePor: "Uma nova glicemia"` + ⛔ **reavaliar o déficit** (F-06 §4.6.1) |
| 7 | **resolução** | nova glicemia ≥ 60 |
| 8 | **bloqueia?** | não navega · bloqueia o portão |

### M2 · Hiperglicemia ⚠️ **parcial, e por decisão**

⛔ `> 180 mg/dL` ⛔ pede conduta (`pedeConduta: true`) ⛔ mas ⛔ **⛔ não bloqueia**
— ⛔ o conteúdo diz ⛔ *"⛔ não bloqueia a trombólise isoladamente"*. ⛔ Alvo
140–180 (COR 2a) ⛔ e insulina existem em **F-18**; ⛔ o que ⛔ não existe ⛔ é
⛔ **⛔ ciclo de reavaliação** ⛔ — ⛔ e ⛔ você já confirmou ⛔ que ⛔ **⛔ não deve
virar bloqueio**.

---

## D · NEUROLÓGICO — a descoberta que muda o desenho

| # | | |
|---|---|---|
| 1 | **fatos** | `deficit_focal` (F-13) · `nihss_calculado` / `nihss_informado` (F-13/F-17) · `lateralidade` · `crise_no_inicio` (F-24) · `consciencia_rebaixada` (⛔ hoje mora em **A**) |
| 2 | **ameaça** | ⚠️ **⛔ só a crise convulsiva** é ameaça tratável |
| 3 | **conduta** | F-24 rec. 1 · **COR 1 · LOE C-LD** — antiepiléptico após crise **não provocada**. ⛔ E o contra: rec. 2 · **COR 3: No Benefit** — ⛔ **⛔ nada** de profilaxia |
| 4 | **operacional** | ⛔ **F-25 · estado `ponteiro`** — ⛔ *"Terapêutica anticonvulsiva"* ⛔ **⛔ declarado e ⛔ não transcrito** |
| 5 | **doses** | ⛔ nenhuma |
| 6 | **reavaliar** | ⛔ não declarado |
| 7 | **resolução** | ⛔ não declarada |
| 8 | **bloqueia?** | ⛔ não |

### ⚠️⚠️ ⛔ DÉFICIT E NIHSS ⛔ **⛔ NÃO SÃO AMEAÇA A CORRIGIR**

⛔ ⛔ Eles **⛔ caracterizam o AVC** ⛔ e ⛔ alimentam ⛔ o **portão da reperfusão**
(`deficit_focal` tem ⛔ 7 leituras, ⛔ incluindo `portao-ivt`). ⛔ **⛔ Não existe
«corrigir o déficit»** — ⛔ o tratamento dele ⛔ **⛔ é a reperfusão**, ⛔ que é
⛔ a fase seguinte.

### ⛔ E O GLASGOW ⛔ NÃO TEM FONTE

⛔ `fonte: ""` · `natureza: "administrativo"` · ⛔ **0 leituras** no núcleo.
⛔ A nota do próprio conteúdo: ⛔ *"A escala recomendada no AVC é o NIHSS (…)
⛔ **A fonte ⛔ não define corte ⛔ e ⛔ não usa Glasgow no AVC isquêmico.**"*
⛔ Varredura na transcrição: ⛔ **⛔ zero ocorrências de «Glasgow»**.

---

## E · EXPOSIÇÃO ⛔ **sem fonte, sem consumidor**

⛔ `temperatura`: `fonte: ""` · `natureza: "administrativo"` · ⛔ *"Nenhuma
recomendação deste módulo é calculada a partir dele"*. ⛔ O eixo ⛔ **⛔ nunca
acende** — ⛔ por construção. ⛔ Varredura por `fever|hyperthermia|antipyretic` em
⛔ **⛔ todas** as 11 fontes verbatim: ⛔ **⛔ zero**.

⚠️ ⛔ Na **HIC** a fonte fala (H-06, COR 2b, tratar temperatura elevada) — ⛔ mas
⛔ é ⛔ **⛔ texto de recomendação**, ⛔ e ⛔ ⛔ nem lá ⛔ o valor medido ⛔ alimenta
⛔ nada.

---

## Resumo: quem cumpre o contrato hoje

| eixo | ameaça | tratamento | reavaliação | resolução | completo? |
|---|---|---|---|---|---|
| **A** via aérea | ✅ F-23 | ⛔ | ⛔ | ⛔ | **não** |
| **B** respiração | ✅ F-23 | ⚠️ só a meta | ⛔ | ⚠️ derivável | **não** |
| **C1** HAS | ✅ F-04 | ✅ F-19 | ✅ | ✅ | **✅ sim** |
| **C2** choque | ⛔ sem limiar | ⛔ | ⛔ | ⛔ | **não existe** |
| **M1** hipo | ✅ F-06 | ✅ F-18 | ✅ | ✅ | **✅ sim** |
| **M2** hiper | ✅ F-06 | ⚠️ F-18 | ⛔ | ⛔ | parcial **por decisão** |
| **D** crise | ✅ F-24 | ⛔ F-25 ponteiro | ⛔ | ⛔ | **não** |
| **D** déficit/NIHSS | — | — | — | — | **⛔ não é correção** |
| **E** exposição | ⛔ sem fonte | ⛔ | ⛔ | ⛔ | **⛔ não deveria ser eixo** |

**Dois de nove** cumprem o contrato inteiro. ⛔ E os dois ⛔ são exatamente ⛔ os
que ⛔ ganharam ⛔ **⛔ slot operacional complementar** (F-18, F-19).

## O que falta transcrever, em ordem de dor clínica

| # | slot | assunto | por que agora |
|---|---|---|---|
| 1 | **F-25** | terapêutica anticonvulsiva | ⛔ já é **ponteiro declarado**; ⛔ crise é ameaça imediata ⛔ com COR 1 |
| 2 | **novo** | oxigenoterapia e suporte ventilatório | ⛔ hipoxemia é ⛔ a ameaça ⛔ mais frequente ⛔ da lista |
| 3 | **novo** | via aérea operacional na estabilização | ⛔ COR 1 ⛔ sem nenhum operacional |
| 4 | **novo** | choque/hipotensão na estabilização | ⛔ hoje ⛔ **⛔ não acende** ⛔ — e é ameaça à vida |

⚠️⚠️ ⛔ **Nenhum deles ⛔ pode ser escrito ⛔ por mim ⛔ de memória.** ⛔ O contrato
do módulo (**§spec**) ⛔ proíbe ⛔ número clínico ⛔ antes da ⛔ transcrição
verbatim ⛔ com página. ⛔ O caminho ⛔ é ⛔ o mesmo ⛔ de F-18/F-19: ⛔ você escolhe
⛔ a fonte, ⛔ ela é transcrita ⛔ com procedência própria, ⛔ e ⛔ só então ⛔ vira
tela.
