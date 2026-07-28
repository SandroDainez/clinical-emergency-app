# Camada 2 — Auditoria científica do módulo Síndromes Coronarianas Agudas

**Fonte de referência:** *MedCampus — Síndrome Coronariana Aguda em Adultos*, guia
clínico integrado v1.0, atualização científica 28/07/2026, revisado para publicação
educacional. Fornecido pelo autor como fonte aprovada.

**Método:** cada afirmação de risco crítico ou alto do módulo foi localizada no
código e comparada com o guia. Nenhuma linha foi alterada.

**Escopo:** `coronary-decision-tree.ts`, `coronary/calculators.ts`,
`coronary/classification.ts`, `coronary/protocol-config.ts`,
`coronary/prescriptions.ts` e `protocols/sindromes_coronarianas.json`.

---

## Resumo

| classificação | itens |
|---|---:|
| Confirmado pela referência | 11 |
| **Divergente — com risco de dose** | **2** |
| Divergente — tempo e faixa | 2 |
| Incompleto | 1 |
| **Total de achados** | **5** |

⚠️ Diferente do AVC, aqui há **dois achados em que o app produz um número maior do
que o teto da fonte** — e produz calculando, não citando.

---

## Achados

### 🔴 SCA-01 · Enoxaparina na fibrinólise ultrapassa o teto das duas primeiras doses

| | |
|---|---|
| **Localização** | `coronary-decision-tree.ts:40-41` (cálculo) · `:161` e `:223` (texto) |
| **O app calcula** | `enoxa = 1,0 × peso` · `enoxa75 = 0,75 × peso` — **sem teto** |
| **A fonte diz** | "<75 anos, **30 mg IV em bolus** e depois 1 mg/kg SC 12/12 h (**máximo 100 mg nas duas primeiras doses**); ≥75 anos, sem bolus, 0,75 mg/kg SC 12/12 h (**máximo 75 mg nas duas primeiras**); se ClCr <30 mL/min, espaçar para 24/24 h" |
| **Avaliação** | **Divergente, com risco de dose** |

**O que isso produz na prática:**

| paciente | app calcula | teto da fonte | excesso |
|---|---:|---:|---:|
| 120 kg, <75 anos | **120 mg** | 100 mg | **+20 mg por dose** |
| 120 kg, ≥75 anos | **90 mg** | 75 mg | **+15 mg por dose** |

Três omissões somadas:

1. **o teto não existe** no cálculo;
2. **o bolus IV de 30 mg não é dito em lugar nenhum** — o texto diz "≥ 75a: sem
   bolus IV", o que informa que existe bolus para os mais jovens, mas nunca diz
   qual é;
3. **não há ajuste para ClCr <30 mL/min** (espaçar para 24/24 h).

**Risco:** alto. Anticoagulante em excesso, em paciente que acabou de receber
fibrinolítico, com o número vindo pronto do app.

**Correção proposta:** aplicar os tetos de 100 mg e 75 mg nas duas primeiras doses,
declarar o bolus IV de 30 mg para <75 anos e acrescentar o ajuste renal.

### 🔴 SCA-02 · Meia dose de tenecteplase em ≥75 anos sem a condição que a autoriza

| | |
|---|---|
| **Localização** | `coronary-decision-tree.ts:222` · cálculo em `:45` |
| **O app diz** | "Tenecteplase (TNK) {tnk} mg IV em bolus único (**≥ 75 anos: reduzir à metade** → {tnkHalf} mg)." — incondicional |
| **A fonte diz** | "Em pessoas ≥75 anos, considere metade da dose de tenecteplase **somente em estratégia farmacoinvasiva quando a apresentação ocorrer até 3 h do início dos sintomas**. Essa conduta deriva da população idosa selecionada do STREAM-2 e **não deve ser extrapolada para apresentação após 3 h, fibrinólise sem estratégia farmacoinvasiva ou qualquer outro uso trombolítico**" |
| **Avaliação** | **Divergente** |
| **Risco** | Alto, e na direção oposta ao SCA-01: **subdose** de trombolítico em idoso que não preenche a condição do STREAM-2 — reperfusão insuficiente num IAM com supra |

A fonte é explícita ao vetar a extrapolação, e o app extrapola: aplica a metade a
todo paciente ≥75 anos, qualquer que seja o tempo de apresentação e a estratégia.

**Correção proposta:** condicionar a meia dose a estratégia farmacoinvasiva com
apresentação ≤3 h, e dizer isso no texto.

### 🟠 SCA-03 · HNF na ICP primária com limite inferior menor que o da fonte

| | |
|---|---|
| **Localização** | `protocols/sindromes_coronarianas.json:153` |
| **O app diz** | "HNF **60-100 U/kg** IV bolus (máx 10.000 U)" |
| **A fonte diz** | ICP primária: "HNF **70–100 UI/kg** IV; **50–70 UI/kg** se uso de GP IIb/IIIa" |
| **Avaliação** | **Divergente** |
| **Risco** | Moderado. Anticoagulação insuficiente na ICP primária; e o app não distingue o cenário com inibidor de GP IIb/IIIa, que tem faixa própria e menor |

### 🟠 SCA-04 · Porta-agulha de 30 min contra os 10 min da fonte

| | |
|---|---|
| **Localização** | `coronary-decision-tree.ts:176` e `:220` |
| **O app diz** | "fibrinólise (**porta-agulha ≤ 30 min**)" · "Porta-agulha ≤ 30 min" |
| **A fonte diz** | "A ESC busca fibrinólise **em até 10 min após o diagnóstico**; redes devem medir seus próprios intervalos" |
| **Avaliação** | **Divergente** |
| **Risco** | Moderado. Meta três vezes mais frouxa que a da fonte, num tratamento em que o benefício cai com o tempo |

Nota: a fonte fala em 10 min **após o diagnóstico**, e "porta-agulha" conta da
chegada. Não são a mesma régua — o que reforça a necessidade de alinhar a redação,
não só o número.

### 🟡 SCA-05 · Estatina só com atorvastatina

| | |
|---|---|
| **Localização** | `coronary-decision-tree.ts` |
| **O app diz** | "atorvastatina 80 mg VO" |
| **A fonte diz** | "atorvastatina **40–80 mg/dia** ou **rosuvastatina 20–40 mg/dia**" |
| **Avaliação** | **Incompleto** |
| **Risco** | Baixo. A dose citada está dentro da faixa; falta a alternativa e a faixa inferior |

---

## Confirmado pela referência

| item | app | fonte |
|---|---|---|
| Tenecteplase por faixa de peso | <60→30 · <70→35 · <80→40 · <90→45 · ≥90→50 mg | tabela idêntica |
| AAS de ataque | 300 mg mastigável (162–325) | 162–325 mg mastigável |
| AAS de manutenção | 81–100 mg/dia | 75–100 mg/dia |
| Ticagrelor | 180 mg → 90 mg 12/12 h | idêntico |
| Prasugrel | 60 mg; evitar se AVC/AIT prévio, >75 a ou <60 kg | idêntico |
| Clopidogrel com fibrinólise | 300 mg; 75 mg sem ataque se ≥75 a | idêntico |
| Enoxaparina — dose por peso | 1 mg/kg; 0,75 mg/kg se ≥75 a | idêntico (o que falta é o teto) |
| ICP primária — janela | ≤120 min, meta ≤90 min | >120 min → fibrinólise |
| Fibrinólise — janela de sintomas | ≤12 h | ≤12 h |
| DAPT | 12 meses | 12 meses |
| ECG em até 10 min da chegada | presente | primeiro traçado em até 10 min |

---

## O que esta auditoria NÃO fez

- **Não alterei nenhuma linha.** Os cinco achados aguardam decisão.
- **Não auditei o que a fonte trata de passagem** — MINOCA, gestação, terapia
  tripla e bomba microaxial aparecem no guia como orientação geral e não têm
  número verificável contra o app.
- **Não julguei escolha de serviço.** Disponibilidade de fondaparinux, preferência
  por acesso radial e escolha de stent dependem da instituição, e a fonte diz isso.
