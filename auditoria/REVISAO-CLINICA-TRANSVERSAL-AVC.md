# REVISÃO CLÍNICA TRANSVERSAL — AVC isquêmico agudo (V1)

**Natureza:** revisão do **paciente inteiro**, cruzando os 15 slots transcritos da
AHA/ASA 2026. ⛔ Não é implementação, não é wireframe, não é spec — é **auditoria
de coerência** entre regras que foram lidas separadamente.

**Base:** `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md` (marco
`65a7096`) contra `auditoria/ESPECIFICACAO-AVC.md`.

**Formato de cada bloco:** `fato necessário → regra aplicável → derivação → ação
disponível/bloqueada → condição de mudança → fonte`, seguido dos **achados**.

**Categorias de achado**

| tag | significado |
|---|---|
| 🕐 **atraso indevido** | dependência desnecessária atrasa ação tempo-dependente |
| ⛔ **bloqueio indevido** | condição sem força de bloqueio impediria a ação |
| ⚠️ **liberação indevida** | ausência de dado lida como permissão |
| 📉 **perda de informação** | colapso de distinção que a fonte faz |
| 🗣️ **tradução que muda força** | gradação verbal achatada |
| 🧪 **regra de ensaio promovida** | critério de RCT tratado como recomendação |
| ❔ **ausência de evidência = proibição** | *unknown* / *IDD* virando exclusão |
| 🕳️ **lacuna** | a fonte não cobre |
| 🔁 **duplicação** | mesma regra em dois lugares |
| ♾️ **dependência circular** | A depende de B que depende de A |

---

## BLOCO 1 · Entrada e estabilização

| fato necessário | regra aplicável | derivação | ação | condição de mudança | fonte |
|---|---|---|---|---|---|
| glicemia capilar | tratar hipoglicemia | `<60 mg/dL` → tratar | corrigir glicemia | nova glicemia | §4.5 rec. 1 · **COR 1 · C-LD** |
| glicemia antes da IVT | medir antes de iniciar | valor conhecido | libera a etapa de decisão da IVT | medida feita | §4.6.1 rec. 5 · **COR 1 · B-NR** |
| déficit após correção glicêmica | reavaliar | persiste → segue AVC · sumiu → sai do fluxo | IVT recomendada se persistir | reavaliação | §4.6.1 rec. 6 · **COR 1 · C-LD** |
| PA (hipotensão/hipovolemia) | corrigir para manter perfusão | hipotensão → corrigir | expansão/suporte | PA aferida | §4.3 rec. 1 · **COR 1 · C-LD** |
| comorbidade que exige tratar HAS | tratar precocemente | evento coronariano, IC aguda, dissecção de aorta, sICH pós-trombólise, pré-eclâmpsia | tratar PA | comorbidade identificada | §4.3 rec. 2 · **COR 1 · C-EO** |
| relógios (5) | contagem por marco declarado | tempo decorrido | define janela | tempo corre sozinho | §1.1 spec · **E-01**, **E-21**, **E-36** |
| via aérea / oxigenação | — | — | — | — | 🕳️ **§4.1 não transcrita** |
| crise convulsiva na entrada | — | — | — | — | 🕳️ **§6.5 não transcrita** |

**Achados**

- 🕳️ **L-01 · Via aérea e oxigenação (§4.1, e347) não foram transcritas.** A frente
  de estabilização da spec (**E-04**) não tem verbatim próprio. **Não é erro de
  transcrição — é slot que nunca foi aberto.** Sugiro **F-23**.
- 🕳️ **L-02 · Crise convulsiva não tem regra transcrita.** Aparece só (a) como
  *stroke mimic* com risco de HT muito baixo e (b) na nota `†` de §4.7.2 como
  limitação de generalização. Se o app perguntar "houve crise?", **não há regra que
  consuma a resposta**. Sugiro **F-24** (§6.5, e400).
- ✅ **C-01 · Três números de hipoglicemia — conflito APARENTE, resolvido por
  finalidade.** `<60` (tratar, COR 1) · `<50` (rótulo "severa", texto de apoio, sem
  COR) · `<40` (desfecho de segurança do SHINE). ⛔ Não gerar um quarto número.
- 🕐 **R-01 · A glicemia não atrasa a imagem.** §4.6.1 rec. 5 exige glicemia antes
  da **IVT**, não antes da **TC**; §1.7 e §3.2 rec. 3 mantêm a imagem sem espera.
  Se o app puser a glicemia como pré-requisito da imagem, cria atraso que a fonte
  não pede.

---

## BLOCO 2 · Confirmação por imagem

| fato necessário | regra aplicável | derivação | ação | condição de mudança | fonte |
|---|---|---|---|---|---|
| TC/RM inicial | excluir hemorragia e avaliar carga isquêmica | sem hemorragia → segue isquêmico | **destrava a classe reperfusão** | imagem resultada | §3.2 rec. 1 · **COR 1 · A** |
| tempo até a imagem | protocolo institucional | *"as rapidly as possible (eg, within 25 minutes)"* | — | — | §3.2 rec. 2 · **COR 1 · B-NR** |
| creatinina | **não** atrasa angioTC/CTP | pendência que não bloqueia | imagem vascular segue | — | §3.2 rec. 3 · **COR 1 · B-NR** |
| imagem multimodal na janela padrão | **não** atrasar a IVT | — | IVT segue | — | §4.6.1 rec. 2 · **COR 1 · B-NR** |
| imagem vascular na suspeita de LVO | fazer o quanto antes, ≤24 h do LKW | seleção para EVT | avaliação de EVT | imagem vascular | §3.2 rec. 8 · **COR 1 · A** |
| hemorragia na TC | ⛔ não administrar IVT | bloqueio de classe, **não corrigível** | ⛔ reperfusão | — | Table 8, faixa absoluta |

**Achados**

- 🕐 **R-02 · O achado mais perigoso deste bloco: a angioTC não pode atrasar a
  IVT.** Duas regras COR 1 convivem — §4.6.1 rec. 2 manda **evitar atraso por
  neuroimagem multimodal (CTA/MRA, CTP)** na janela padrão; §3.2 rec. 8 manda
  **fazer imagem vascular** na suspeita de LVO. **Não se contradizem: têm objetos
  diferentes** (tempo da IVT × seleção para EVT), e §4.7.1 rec. 2 fecha —
  IVT *"as rapidly as possible, without observation… or delay in initiating EVT"*.
  ⛔ Se o app exigir angioTC resultada para liberar a IVT, **inverte a fonte**.
- 🗣️ **T-01 · *"as rapidly as possible (eg, within 25 minutes)"* não é meta de 25
  minutos**, e a recomendação é sobre **protocolo institucional**, não sobre o
  paciente. Exibir "meta: 25 min" endurece a fonte.
- ✅ **C-02 · Creatinina — conflito aparente**: parece exigir laboratório antes de
  contraste; a fonte diz o contrário, explicitamente.

---

## BLOCO 3 · Déficit incapacitante

| fato necessário | regra aplicável | derivação | ação | condição de mudança | fonte |
|---|---|---|---|---|---|
| itens do NIHSS | escala de gravidade | gravidade + insumos da Table 4 | informa julgamento | reavaliação | §3.1 rec. 1 · **COR 1 · B-NR** |
| NIHSS **total** | ⛔ não basta isoladamente | — | ⛔ não classifica | — | §4.6.1 *Supportive Text* 1 (e354) |
| função basal e impacto (AVD/atividade habitual) | pergunta-mãe | leitura **intermediária** | apoio ao julgamento | novas respostas | Table 4 (e355) — *guidance*, **sem COR/LOE** |
| déficit incapacitante **assumido** | rec. 1 | tratar rápido melhora desfecho | IVT | decisão do médico | §4.6.1 rec. 1 · **COR 1 · A** |
| déficit leve **não incapacitante** ≤4,5 h | IVT **não recomendada** | comparador: dupla antiagregação | ⛔ IVT | mudança do julgamento | §4.6.1 rec. 8 · **COR 3: No Benefit · B-R** |

**Achados**

- 🗣️ **T-02 · Cinco expressões que não podem achatar:** *clearly disabling* ·
  *typically considered* · *may not be clearly disabling* · *individual
  circumstances* · *does not suffice*. **E-45**.
- ❔ **A-01 · Escopo da Table 4 (NIHSS 0–5) × rec. 8 (déficit leve, sem NIHSS
  declarado).** Um paciente com NIHSS 7 e déficit não incapacitante está **fora do
  escopo da Table 4** e **dentro** da rec. 8. Se o app só oferecer a decomposição
  em 0–5, esse paciente fica sem apoio; se aplicar a Table 4 fora do escopo,
  extrapola. ⏳ **É a D-1 da proposta, ainda aberta.**
- 📉 **P-01 · NIHSS total e itens do NIHSS são dados diferentes.** Guardar só o
  total impossibilita a Table 4, que usa cortes por item (*vision*, *best
  language*, *extinction*, *motor*).

---

## BLOCO 4 · IVT — janela padrão

| fato necessário | regra aplicável | derivação | ação | condição de mudança | fonte |
|---|---|---|---|---|---|
| tempo ≤4,5 h do marco | janela padrão | candidato temporal | IVT | relógio corre | §4.6.1 rec. 2 · **COR 1 · B-NR** |
| hemorragia excluída | pré-condição de classe | libera reperfusão | IVT/EVT | imagem | §3.2 rec. 1 · **COR 1 · A** |
| déficit incapacitante | ver Bloco 3 | elegível | IVT | julgamento | §4.6.1 recs. 1 e 8 |
| PA | alvo pré-IVT | `≥185/110` → **bloqueio corrigível** | tratar PA | PA na meta | §4.3 rec. 5 · **COR 1 · B-NR** |
| peso | dose por peso | dose calculada | administrar | peso informado | §4.6.2 rec. 1 · **COR 1 · A** · Table 7 |
| fármaco | TNK 0,25 mg/kg (máx 25) **ou** alteplase 0,9 mg/kg (máx 90) | duas alternativas de **mesma força** | administrar | — | §4.6.2 rec. 1 · **COR 1 · A** |
| exames de coagulação | não atrasar se não há suspeita | **pendência que não bloqueia** | IVT **iniciada sob condição resolutiva** | resultado chega | §4.6.1 rec. 10 · **COR 2a · B-NR** + Table 8 |

**Achados**

- 🕐 **R-03 · O peso não pode travar a trombólise.** Table 7, verbatim: *"**Do not
  delay thrombolysis to obtain exact weight** — timely treatment is critical."*
  ⛔ Se o peso for campo obrigatório bloqueante, o app contraria a fonte. Ele é
  **pendência vinculada à administração**, não ao fluxo.
- ⚠️ **L-03 · "Sem exame" não é "sem alteração".** A permissão de iniciar antes do
  resultado vem com **regra de suspensão** (`INR >1,7`, PT/PTT anormal). Modelar
  como *liberado* perde a segunda metade da regra → **E-47**.
- ♾️ **D-01 · Circularidade potencial: PA × candidatura.** O alvo `<185/110` só se
  aplica a **candidato**; se a candidatura incluir "PA na meta", o modelo entra em
  ciclo. **Resolução:** candidatura se deriva de tempo + imagem + déficit +
  segurança; a PA é **bloqueio corrigível da ação**, nunca critério de candidatura.
- 🔁 **U-01 · Duplicação de limiar pressórico:** `>180/105` aparece em §4.3 rec. 7
  (**alvo pós-IVT**) e na Table 7 (**gatilho de aumentar frequência de medida**).
  Mesmo número, funções diferentes. Fonte única de verdade, dois consumidores.

---

## BLOCO 5 · IVT — janela estendida

| fato necessário | regra aplicável | derivação | ação | condição de mudança | fonte |
|---|---|---|---|---|---|
| início **desconhecido** + ≤4,5 h do **reconhecimento** + DWI < 1/3 ACM + sem FLAIR marcado | janela estendida por RM | elegível | IVT | imagem | §4.6.3 rec. 1 · **COR 2a · B-R** |
| **wake-up** ≤9 h do **midpoint of sleep** + penumbra em perfusão **automatizada** + não elegível a EVT | janela estendida por perfusão | elegível | IVT | imagem | §4.6.3 rec. 2(a) · **COR 2a · B-R** |
| **4,5–9 h do LKW** + penumbra + não elegível a EVT | idem | elegível | IVT | imagem | §4.6.3 rec. 2(b) · **COR 2a · B-R** |
| **4,5–24 h de *onset or LKW*** + LVO + penumbra + **sem acesso a EVT** + expertise | janela estendida | elegível | IVT | imagem + expertise | §4.6.3 rec. 3 · **COR 2b · B-R** |

**Achados**

- 📉 **P-02 · Colapsar os marcos destrói este bloco.** Quatro marcos, três durações
  (4,5 h · 9 h · 24 h). Um único campo "tempo desde o início" torna as recs. 1 e
  2(a) **incomputáveis**. ⇒ **E-32**, **E-36**.
- 🧪 **E-01 · Parâmetros do WAKE-UP não são regra:** razão de sinal `<1,2`,
  exclusão por `NIHSS >25`, exclusão de trombectomia planejada, permissão de
  alterações sutis de FLAIR. Estão no *Supportive Text*, **sem COR/LOE**.
- 🗣️ **T-03 · Nenhuma recomendação da janela estendida é COR 1.** *"can be
  beneficial"* e *"may be beneficial"* precisam sobreviver à tradução.
- ❔ **A-02 · Falta de CTP/RM não é inelegibilidade.** É **disponibilidade**
  (§6.7, **E-18**) e pode gerar **destino** (transferência), nunca exclusão.

---

## BLOCO 6 · Segurança da IVT

| fato necessário | regra aplicável | derivação | ação | condição de mudança | fonte |
|---|---|---|---|---|---|
| antiagregante simples ou dupla | IVT recomendada mesmo assim | **não bloqueia** | IVT | — | §4.6.1 rec. 9 · **COR 1 · B-NR** |
| microssangramentos **não investigados** | ⛔ **não obter RM para excluí-los** | não bloqueia e **não investiga** | IVT | — | §4.6.1 rec. 11 · **COR 1 · B-NR** |
| CMB 1–10 em RM prévia | razoável | não bloqueia | IVT | — | §4.6.1 rec. 12 · **COR 2a · B-NR** |
| CMB >10 em RM prévia | utilidade **incerta** | **não bloqueia**, incerteza declarada | IVT sob julgamento | decisão | §4.6.1 rec. 13 · **COR 2b · B-NR** |
| DOAC <48 h | segurança **desconhecida** | **informação insuficiente** + individualizada | IVT sob análise risco-benefício | julgamento | Table 8 (e365) — **sem COR/LOE** |
| varfarina/heparina recente | resultado **antes** | exige coagulograma | IVT aguarda | resultado nos cortes | Table 8 (e367) |
| INR >1,7 · plaq <100.000 · aPTT >40 s · PT >15 s | ⛔ não administrar | **bloqueio** | ⛔ IVT | não corrigível no ato | Table 8 (e367) |
| cirurgia <10 d · trauma <14 d · sangramento GI/GU <21 d | risco aumentado, individualizada | **não proíbe** | IVT sob consideração | consulta; sangramento **tratado** pode modificar | Table 8 (e365–e366) |

**Achados**

- 🕐⛔ **R-04 · Perguntar por microssangramentos induz exame que a fonte proíbe.**
  A rec. 11 (**COR 1**) manda administrar **sem** obter RM para excluir CMB. Um
  campo obrigatório "CMB?" cria investigação e atraso contra recomendação COR 1.
  O dado só entra **se já houver RM prévia**.
- ❔ **A-03 · Sete itens da Table 8 dizem *"safety is unknown"*** — dissecção
  intracraniana, malformação vascular não rota, neoplasia sistêmica ativa, punção
  arterial não compressível, entre outros. Estão na faixa **relativa**
  (*"may be considered"*). ⛔ Transformar *unknown* em bloqueio é o erro mais
  provável deste bloco.
- ⚠️ **L-04 · DOAC: observacional não é permissão.** *"Emerging but limited
  observational data suggest… may be considered after a thorough benefit vs risk
  analysis on an individual basis."* ⛔ Não vira liberação automática.
- 🕳️ **L-05 · Horário desconhecido da última dose de DOAC não é tratado pela
  fonte.** ⛔ Não é "exposição excluída"; é **pendência**. ⏳ Decisão do autor.
- 🗣️ **T-04 · Dentro da própria faixa "absoluta" há quatro forças verbais** —
  *should not be administered* · *likely contraindicated* · *potentially harmful* ·
  *should be avoided*. Achatar em "contraindicado" apaga gradação da fonte.

---

## BLOCO 7 · Tratamento da pressão arterial

| contexto | regra | derivação | ação | fonte |
|---|---|---|---|---|
| **pré-IVT** | baixar para `<185/110` antes de iniciar | **bloqueio corrigível** | tratar PA | §4.3 rec. 5 · **COR 1 · B-NR** |
| **pré-EVT**, sem IVT | razoável manter `≤185/110` | meta | tratar PA | §4.3 rec. 6 · **COR 2a · B-NR** |
| **pós-IVT** | manter `<180/105` por ≥24 h | meta | manter | §4.3 rec. 7 · **COR 1 · B-R** |
| **pós-IVT**, AVC leve/moderado | redução intensiva (<140 vs <180) **sem benefício** | ⛔ estratégia desaconselhada | ⛔ redução intensiva | §4.3 rec. 8 · **COR 3: No Benefit · B-R** |
| **durante e 24 h pós-EVT** | razoável `≤180/105` | meta | manter | §4.3 rec. 9 · **COR 2a · B-NR** |
| **pós-recanalização bem-sucedida** (mTICI 2b/2c/3) | alvo `<140` por 72 h é **danoso** | ⛔ **estratégia**, não o paciente | ⛔ redução intensiva | §4.3 rec. 10 · **COR 3: Harm · A** |
| **sem reperfusão**, `≥220/120` | benefício **incerto** em 48–72 h | incerteza | julgamento | §4.3 rec. 3 · **COR 2b · C-EO** |
| **sem reperfusão**, `<220/120` | iniciar/reiniciar **não é efetivo** | ⛔ tratar por tratar | ⛔ | §4.3 rec. 4 · **COR 3: No Benefit · A** |
| comorbidade que exige | tratar | indicação concorrente | tratar PA | §4.3 rec. 2 · **COR 1 · C-EO** |

**Achados**

- ✅ **C-03 · O caso do princípio 15, com verbatim.** `198/110` num **candidato a
  reperfusão** é **bloqueio corrigível** (`<185/110`, COR 1). No **não candidato**
  com PA `<220/120`, tratar **não é efetivo** (COR 3: No Benefit · A). Mesmo
  número, condutas opostas — e o que muda é **só o contexto**. ⇒ **E-06**.
- ⛔ **B-01 · Aplicar `<185/110` a quem não é candidato** produz tratamento que a
  fonte classifica como **sem benefício, LOE A**. É o espelho do erro oposto.
- 🗣️ **T-05 · `COR 3: Harm` é recomendação contra a ESTRATÉGIA**, não
  contraindicação do paciente. Já corrigido em §2.7 da spec.
- ♾️ **D-02 · Dependência de ordem, não circular:** o alvo pressórico depende da
  **fase** (pré/pós) e da **via** (IVT/EVT) — quatro contextos que o app precisa
  distinguir antes de exibir qualquer número.

---

## BLOCO 8 · Trombectomia

| fato necessário | regra | derivação | ação | fonte |
|---|---|---|---|---|
| LVO anterior (ICA/M1), 0–6 h, ASPECTS 3–10, NIHSS ≥6, mRS 0–1 | EVT recomendada | elegível | EVT | §4.7.2 rec. 1 · **COR 1 · A** |
| idem, 6–24 h, ASPECTS ≥6 | EVT recomendada | elegível | EVT | rec. 2 · **COR 1 · A** |
| idem, 6–24 h, ASPECTS 3–5, **idade <80**, sem efeito de massa | EVT recomendada | elegível | EVT | rec. 3 · **COR 1 · A** |
| idem, 0–6 h, ASPECTS 0–2, **idade <80**, sem efeito de massa | EVT razoável | elegível | EVT | rec. 4 · **COR 2a · B-R** |
| mRS prévio 2 / 3–4 | gradiente de força | 2a / 2b | EVT | recs. 5 e 6 |
| **M2 dominante** 0–6 h | razoável, benefícios **incertos** | elegível com incerteza | EVT | rec. 7 · **COR 2a · B-NR** |
| **M2 não dominante · MCA distal · ACA · PCA** | **não recomendada** | ⛔ | ⛔ EVT | rec. 8 · **COR 3: No Benefit · A** |
| basilar, mRS 0–1, PC-ASPECTS ≥6, NIHSS ≥10, ≤24 h | recomendada | elegível | EVT | §4.7.3 rec. 1 · **COR 1 · A** |
| basilar, NIHSS 6–9 | **não bem estabelecido** | incerteza | julgamento | §4.7.3 rec. 2 · **COR 2b · B-R** |
| elegível a IVT **e** EVT | IVT é segura e recomendada; **sem observar resposta** | as duas frentes | IVT **+** EVT | §4.7.1 recs. 1 e 2 · **COR 1 · A** |

**Achados**

- 🕐 **R-05 · Observar resposta à IVT antes da EVT é atraso que a fonte proíbe**,
  com **COR 1 · LOE A**. E *"skip" da IVT para facilitar a EVT* também não é
  recomendado. ⇒ sustenta **E-11** com força máxima.
- ❔ **A-04 · `IDD` não é exclusão.** Oito células da Figure 3 são `IDD`
  (*insufficient data to determine*), com cor própria, **fora da legenda de COR** e
  distinta de `3: No Benefit`. ⛔ Tratar `IDD` como inelegível apaga distinção que
  a fonte fez de propósito.
- 🧪 **E-02 · Notas `*` e `†` são limitações de generalização, não critérios.**
  Idade >80, insuficiência renal, tortuosidade, psiquiátrico, expectativa de vida
  <3 meses, crise no início. ⚠️ **Idade <80 é critério** (dentro das recs. 3 e 4);
  **idade >80 na nota é limitação**. São coisas diferentes.
- 🧪 **E-03 · `≥26 mL` de hipodensidade severa é análise exploratória do SELECT2.**
  Sem COR/LOE. ⛔ Não vira corte.
- ⚠️ **L-06 · "Não preenche a população da recomendação" ≠ "No Benefit".**
  Fechado pelo autor a partir da divergência Figure 3 × texto. ⛔ Só usar
  *No Benefit* onde a fonte atribui **COR 3: No Benefit**.
- 🔁 **U-02 · `PAS ≥185 / PAD ≥110` aparece como meta pré-EVT (§4.3 rec. 6) e como
  limitação de generalização (nota `*` de §4.7.2).** Mesmo número, estatutos
  opostos. ⛔ Não unificar.

---

## BLOCO 9 · Pós-reperfusão

| fato necessário | regra | derivação | ação | fonte |
|---|---|---|---|---|
| exame neurológico após reperfusão | escala ao basal **e após** | reavaliação obrigatória | reavaliar | §3.1 rec. 1 · **COR 1 · B-NR** |
| PA e neuro pós-IVT | 15 min × 2 h → 30 min × 6 h → horária até 24 h | cadência de monitorização | monitorizar | Table 7 (e358) — **sem COR/LOE** |
| deterioração (cefaleia intensa, HAS aguda, náusea, vômito, piora do exame) | interromper infusão (se alteplase) + **TC de emergência** | suspeita de sICH | interromper + TC | Table 7 |
| PAS >180 ou PAD >105 | aumentar frequência + anti-hipertensivo | gatilho | tratar PA | Table 7 |
| SNG, sonda vesical, cateter arterial | **adiar** se manejável sem eles | precaução | adiar | Table 7 |
| TC/RM em 24 h | **antes** de anticoagulante/antiagregante | pré-condição | imagem de controle | Table 7 |
| destino | unidade de AVC organizada | destino | internar | §5.1 rec. 1 · **COR 1 · B-R** + Table 7 |

**Achados**

- 🕳️ **L-07 · Não existe tabela de monitorização pós-EVT.** A Table 7 é
  explicitamente pós-IVT. ⛔ Derivar pós-EVT por analogia viola **E-31**.
- 🗣️ **T-06 · Table 7 não tem COR/LOE.** É tabela operacional da fonte-mãe —
  conteúdo legítimo, autoridade menor que recomendação (**E-48**).
- 📉 **P-03 · "Adiar SNG/sonda/cateter" é conduta, não pendência.** Se o app listar
  como tarefa pendente, inverte o sentido: a fonte quer que **não** sejam feitos.

---

## BLOCO 10 · Saídas do fluxo

| gatilho | derivação | destino | existe hoje? | fonte |
|---|---|---|---|---|
| hemorragia na TC | bloqueio de classe, não corrigível | módulo de AVC hemorrágico | ❌ futuro | Table 8 · §0.1 spec |
| suspeita de HSA | saída específica | fluxo de HSA | ❌ futuro | §0.1 spec |
| mimetizador resolvido (déficit sumiu pós-correção) | sai do fluxo de reperfusão | reavaliação diagnóstica | ✅ | §4.6.1 rec. 6 · **COR 1 · C-LD** |
| candidato a EVT sem serviço local | transferência | centro EVT | ✅ | §3.2 recs. 10–11 |
| pós-reperfusão | internação | unidade de AVC / UTI | ✅ | §5.1 · **COR 1 · B-R** + Table 7 |
| não candidato a reperfusão | **não é beco** | segue manejo (PA, glicemia, unidade de AVC) | ✅ | §4.3 recs. 3–4 · §5.1 |

**Achados**

- ⛔ **B-02 · "Não candidato a reperfusão" não encerra o atendimento.** Continua
  havendo regra pressórica própria, glicemia, e **indicação COR 1 de unidade de
  AVC**. Modelar como fim de fluxo perde cuidado sustentado por evidência.
- 🕳️ **L-08 · Gestação/puerpério**, **HIC** e **HSA** — lacunas declaradas, com
  destino nomeado e módulo inexistente.
- ✅ **C-04 · O mimetizador resolvido é a única saída "para trás"** — e tem
  verbatim COR 1.

---

## FECHAMENTO

### Contagem

| categoria | nº | quais |
|---|---|---|
| **Conflitos reais** | **0** | ⚠️ nenhuma contradição entre regras da fonte foi encontrada |
| **Conflitos aparentes, resolvidos por contexto** | **4** | C-01 (três cortes de glicemia) · C-02 (creatinina) · C-03 (mesma PA, condutas opostas) · C-04 (saída para trás) |
| **Lacunas** | **8** | L-01 via aérea · L-02 crise · L-03 sem-exame≠sem-alteração · L-04 DOAC observacional · L-05 hora da última dose · L-06 população≠No Benefit · L-07 monitorização pós-EVT · L-08 gestação/HIC/HSA |
| **Decisões autorais ainda abertas** | **5** | divergência de marcos (**F-02**) · escopo da Table 4 fora de NIHSS 0–5 (**D-1**) · consulta a paciente/família como ação (**D-5**) · hora desconhecida do DOAC · abrir ou não **F-23** (via aérea) e **F-24** (crise) |
| **Riscos de implementação catalogados** | **21** | 5 🕐 · 2 ⛔ · 4 ⚠️ · 3 📉 · 6 🗣️ · 3 🧪 · 4 ❔ · 2 🔁 · 2 ♾️ *(itens acumulam tags)* |

⚠️ **Zero conflitos reais é achado, não ausência de achado:** significa que as
regras da AHA/ASA 2026 são internamente coerentes **quando o contexto é
preservado**. Todo risco identificado nasce de **colapsar contexto**, não de
contradição da fonte.

### Os três erros mais perigosos se implementados errado

**1 · Colapsar os marcos temporais num único "tempo desde o início".**
A fonte usa **seis formulações** e conta janelas a partir de **quatro marcos
diferentes**, com durações de 4,5 h, 9 h e 24 h. Um campo único torna as recs. 1 e
2(a) de §4.6.3 incomputáveis e **desloca a janela nos dois sentidos** — trata fora
dela, ou nega tratamento dentro dela. Atinge **toda** decisão de reperfusão.
`📉 perda de informação` · **P-02**, **F-02** ainda aberta.

**2 · Transformar "desconhecido" em bloqueio.**
Três formas do mesmo erro, todas presentes na fonte: `IDD` na Figure 3 · *"safety
is unknown"* em sete itens da Table 8 · exame pendente sem suspeita. Em todas, a
fonte **não proíbe** — e em duas manda **prosseguir**. O dano é por **omissão de
terapia tempo-dependente**, que é o dano mais difícil de auditar depois porque não
deixa rastro de ação errada.
`❔ ausência de evidência = proibição` · **A-01**, **A-03**, **A-04**, **L-03**.

**3 · Deixar dependência desnecessária atrasar a trombólise.**
Três instâncias com verbatim explícito contra: **peso** (*"do not delay
thrombolysis to obtain exact weight"*), **exames de coagulação** (COR 2a: não
esperar se não há suspeita), **neuroimagem multimodal** (COR 1: evitar atraso por
CTA/MRA e CTP) — e ainda **observar resposta à IVT antes da EVT** (COR 1 · A
contra). Cada campo obrigatório a mais na tela é um candidato a violar isso.
`🕐 atraso indevido` · **R-02**, **R-03**, **R-04**, **R-05**.

### Recomendação de sequência

1. fechar **F-02** (marcos) — bloqueia P-02, o erro nº 1;
2. decidir **D-1** e a hora desconhecida do DOAC;
3. abrir **F-23** (via aérea) e **F-24** (crise), ou declará-las fora do V1;
4. só então consolidar a regra clínica por bloco.
