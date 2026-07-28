# Camada 2 — Auditoria científica do módulo AVC

**Fonte de referência:** *MedCampus — Acidente vascular cerebral em adultos*, capítulo
clínico v1.4, data de corte 28/07/2026, estado editorial "revisado para publicação
educacional". Fornecido pelo autor como fonte aprovada.

**Método:** cada afirmação de risco crítico ou alto do módulo AVC do app foi
localizada no código e comparada com o capítulo. Nenhuma linha foi alterada.

**Escopo:** o módulo AVC — `avc/protocol-config.ts`, `avc/prescriptions.ts`,
`avc/calculators.ts`, `avc/eligibility.ts`, `avc-decision-tree.ts` e
`protocols/acidente_vascular_cerebral.json`.

---

## Resumo

| classificação | itens |
|---|---:|
| Confirmado pela referência | 12 |
| Divergente da referência | 3 |
| Incompleto | 3 |
| **Total de achados** | **6** |

> ✅ **As seis correções foram APLICADAS** em 28/07/2026, com autorização expressa
> ("aplique as alterações de acordo com a fonte que mandei"). O texto abaixo
> preserva o achado original e o que foi feito, para a rastreabilidade da decisão.

Nenhum achado é dose perigosa por excesso. Os três divergentes são: uma dose com
limite inferior menor que o da fonte, um prazo mais permissivo e um critério
cirúrgico escrito por diâmetro em vez de volume. Os três incompletos são omissões
que podem atrasar ou confundir conduta.

---

## Achados

### 🔴 AVC-01 · AAS tem TRÊS doses diferentes dentro do mesmo módulo

| | |
|---|---|
| **Localização** | `avc/prescriptions.ts:160` · `avc/prescriptions.ts:116` e `:180` · `avc-decision-tree.ts:303` |
| **O app diz** | `160-300 mg` · `100-300 mg/dia` · `160–325 mg` |
| **A fonte diz** | "Aspirina: iniciar **160–300 mg** nas primeiras 24–48 h após excluir hemorragia" |
| **Avaliação** | **Divergente** em dois dos três lugares — e internamente inconsistente |
| **Risco** | Moderado. Nenhuma das faixas é perigosa; o problema é o app dizer coisas diferentes conforme a tela |

Este é o achado A-05 do relatório consolidado deixando de ser abstrato: a mesma
recomendação escrita em três lugares divergiu em dois deles.

**Correção proposta:** uniformizar em `160–300 mg` nas três ocorrências, com
manutenção `81–100 mg/dia`. Decisão sua.

### 🔴 AVC-02 · Prazo de oclusão do aneurisma na HSA mais permissivo que a fonte

| | |
|---|---|
| **Localização** | `avc-decision-tree.ts:434`, `:437`, `:452` |
| **O app diz** | "Obliterar o aneurisma em **24–72 h**" · "Tratamento precoce do aneurisma (24–72 h)" |
| **A fonte diz** | "ocluir completamente o aneurisma por via endovascular ou cirúrgica, **preferencialmente em até 24 h**" — e na síntese: "oclusão do aneurisma preferencialmente em 24 h" |
| **Avaliação** | **Divergente** |
| **Risco** | Alto. O ressangramento precoce é a complicação que esse prazo existe para evitar; "até 72 h" autoriza espera que a fonte não autoriza |

**Correção proposta:** trocar para "preferencialmente em até 24 h" nas três
ocorrências. Decisão sua.

### 🟠 AVC-03 · Reversão de varfarina sem estratificação por INR e sem teto

| | |
|---|---|
| **Localização** | `avc-decision-tree.ts` — nó de reversão de anticoagulação |
| **O app diz** | "complexo protrombínico (CCP) 4 fatores **25–50 UI/kg** IV → alvo INR < 1,3 em 1–2 h" |
| **A fonte diz** | "PCC de 4 fatores (PCC4) **por INR/peso**: INR 2–<4, **25 UI/kg (máx 2.500 UI)**; INR 4–6, **35 UI/kg (máx 3.500 UI)**; INR >6, **50 UI/kg (máx 5.000 UI)**, mais **vitamina K 10 mg IV** em infusão lenta. Reavaliar INR 15–60 min após PCC e seriado" |
| **Avaliação** | **Incompleto** |
| **Risco** | Alto. A faixa "25–50" sem o INR que a determina deixa a escolha ao acaso, e a ausência de teto permite dose excessiva em paciente pesado — 50 UI/kg num paciente de 120 kg dá 6.000 UI, acima do teto de 5.000 |

**Correção proposta:** substituir pela tabela por faixa de INR com os tetos, e
acrescentar a vitamina K e a reavaliação de INR. Decisão sua.

### 🟠 AVC-04 · Falta o alerta contra a dose de tenecteplase do infarto

| | |
|---|---|
| **Localização** | ausente em todo o módulo |
| **O app diz** | nada |
| **A fonte diz** | **ALERTA**: "Tenecteplase no AVC: **não utilizar os esquemas ponderais empregados no infarto agudo do miocárdio**. Para AVC isquêmico agudo, a dose é 0,25 mg/kg IV em bólus único, até 25 mg" |
| **Avaliação** | **Incompleto** |
| **Risco** | Alto. A fonte destaca isso como ALERTA justamente porque é modo de erro conhecido: a dose do IAM chega a 0,5 mg/kg, o dobro da do AVC |

A dose que o app calcula está **correta** (0,25 mg/kg, máx 25 mg). O que falta é o
aviso que impede a troca de esquema por quem conhece o protocolo do infarto.

**Correção proposta:** incluir o alerta junto da dose. Decisão sua.

### 🟠 AVC-05 · Dupla antiagregação sem as doses de ataque

| | |
|---|---|
| **Localização** | `avc/prescriptions.ts:161` · `avc-decision-tree.ts:304` |
| **O app diz** | "AAS + **clopidogrel 75 mg/dia** por 21 dias" |
| **A fonte diz** | "AAS **160–300 mg de ataque, depois 81–100 mg/dia**; clopidogrel **300 mg de ataque, depois 75 mg/dia**. Manter ambos por 21 dias" |
| **Avaliação** | **Incompleto** |
| **Risco** | Moderado a alto. Clopidogrel sem ataque leva dias para efeito antiagregante pleno — justamente na janela em que o risco de recorrência é maior |

**Correção proposta:** acrescentar as doses de ataque. Decisão sua.

### 🟡 AVC-06 · Critério cirúrgico da HIC cerebelar escrito por diâmetro

| | |
|---|---|
| **Localização** | `avc-decision-tree.ts:392` |
| **O app diz** | "HIC cerebelar **> 3 cm** com deterioração ou hidrocefalia" |
| **A fonte diz** | "HIC cerebelar: evacuação imediata ± DVE para **deterioração neurológica, compressão de tronco, hidrocefalia obstrutiva ou volume ≥ 15 mL**" |
| **Avaliação** | **Redação imprecisa** |
| **Risco** | Moderado. 3 cm de diâmetro equivalem a ~14 mL, então os limiares são próximos — mas o app exige deterioração OU hidrocefalia junto do tamanho, enquanto a fonte trata **volume ≥ 15 mL como critério suficiente por si**, e acrescenta compressão de tronco |

**Correção proposta:** alinhar à redação da fonte. Decisão sua.

---

## Confirmado pela referência

Verificado item a item, e correto:

| item | app | fonte |
|---|---|---|
| Alteplase | 0,9 mg/kg · máx 90 mg · 10% em bólus · 90% em 60 min | idêntico |
| Tenecteplase | 0,25 mg/kg · bólus único · máx 25 mg | idêntico |
| Janela de trombólise IV | 270 min (4,5 h) | 4,5 h |
| Trombectomia precoce | 360 min (6 h) | 0–6 h |
| Trombectomia estendida | 1440 min (24 h) | 6–24 h selecionados |
| PA antes da trombólise | < 185/110 mmHg | < 185/110 mmHg |
| PA após a trombólise | < 180/105 mmHg por 24 h | < 180/105 mmHg por 24 h |
| PA na trombectomia | limite 220/120 | não reduzir se ≤ 220/120 |
| Não reduzir PAS < 140 após reperfusão | presente | "não melhora desfecho e pode causar dano" |
| Glicemia alvo | 140–180 mg/dL | 140–180 mg/dL |
| HIC: PAS 150–220 → alvo 140, não < 130 em 24 h | presente | idêntico |
| Nimodipino | 60 mg VO 4/4 h por 21 dias | idêntico |
| Trombectomia — critérios | NIHSS ≥ 6 · ASPECTS ≥ 6 · mRS 0–1 | idêntico |
| Basilar | recomendação forte até 24 h com NIHSS ≥ 10 | idêntico |

---

## Como ficou depois da aplicação

| achado | antes | depois |
|---|---|---|
| AVC-01 | `160-300` · `100-300` · `160–325` | **`160-300 mg` de ataque, manutenção `81-100 mg/dia`** nos três pontos |
| AVC-02 | "obliterar em 24–72 h" | **"ocluir preferencialmente em até 24 h"** nas três ocorrências |
| AVC-03 | "PCC 25–50 UI/kg" | **faixas por INR com teto** + vitamina K 10 mg IV + reavaliação de INR em 15–60 min |
| AVC-04 | sem alerta | **"⚠️ NÃO usar os esquemas ponderais do IAM: no IAM a dose chega ao dobro"** |
| AVC-05 | "clopidogrel 75 mg/dia" | **AAS 160–300 e clopidogrel 300 de ataque**, DAPT em 12–24 h, 21 dias, depois monoterapia |
| AVC-06 | "> 3 cm com deterioração ou hidrocefalia" | **deterioração, compressão de tronco, hidrocefalia obstrutiva OU volume ≥ 15 mL** |

Cada frase alterada recebeu tradução para o espanhol — 12 no total. O app diz o
mesmo nos dois idiomas.

## O que esta auditoria NÃO fez

- **Não alterei nada por conta própria.** As seis correções só foram aplicadas depois da autorização expressa, e cada uma segue o texto da fonte.
- **Não auditei o que a fonte não cobre.** O capítulo é de AVC no adulto; o módulo
  tem conteúdo de AIT, trombose venosa cerebral e dissecção que a fonte trata
  brevemente — esses pontos ficaram sem verificação profunda.
- **Não julguei o que é decisão de serviço.** Escolha entre alteplase e
  tenecteplase, disponibilidade de nicardipino ou clevidipino e protocolo local de
  reversão dependem da instituição, e a própria fonte diz isso.
