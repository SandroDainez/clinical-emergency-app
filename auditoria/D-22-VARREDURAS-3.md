# D-22 · Varreduras exaustivas — AVC, Coronárias, CAD/EHH

Três engines mortos (6º, 7º e 8º da D-22), varridos contra as árvores vivas
com as **quatro categorias**. Nada foi portado, nada deletado.

## ⚠️ O que torna estes três diferentes dos quatro primeiros

Nas varreduras anteriores (Anafilaxia, EAP, Ventilação, Sepse) a árvore viva
**já tinha passado pela auditoria da Fase 1**. Quando engine e árvore
divergiam, a árvore tinha procedência e a decisão era "qual versão prevalece".

**Aqui não.** AVC, Coronárias e CAD/EHH nunca foram auditados. Toda
categoria 4 destes três é **DOIS TEXTOS QUE NINGUÉM CONFERIU** — decidir
entre eles é escolher entre duas afirmações sem procedência.

**Consequência, decidida pelo Sandro:** em categoria 4 nestes três, a
resposta padrão **não é "a árvore vence"** — é **abrir fonte**. Cada item
abaixo traz a fonte primária específica que precisa ser aberta.

E vale o R-35: o engine morto **não é fonte**. Que um número esteja
repetido lá não o confere.

---

## Placar

| Módulo | Vale portar | Duplicata | Obsoleto* | **Contradiz** |
|---|---|---|---|---|
| AVC | 23 | 30 | 2 | **17** |
| Coronárias | 17 | 17 | **0** | **18** |
| CAD/EHH | 26 | 26 | 1 | **16** |
| **Total** | **66** | **73** | **3** | **51** |

\* "Obsoleto" exige justificativa **documentada com fonte/ano** na árvore.
Sem isso, rebaixa para categoria 4. Em Coronárias nenhum item qualificou.

---

## Restrições à deleção (verificadas)

1. **`avc/protocol-config.ts` NÃO morre com o engine.** Exporta `NIHSS_ITEMS`
   → `avc/nihss.ts` → `clinical-calculators-engine.ts` (vivo). Apagar o
   engine não pode arrastá-lo.
2. **`coronary/*.ts` e `protocols/sindromes_coronarianas.json` morrem junto** —
   só o engine os importa. **Mas o conteúdo clínico do módulo está lá**, não
   no engine (que é camada de composição). Apagar sem garimpar perde os 17.
3. **`protocols/cetoacidose_hiperosmolar.json`** idem — é onde vive o texto
   do lado morto do CAD/EHH.

---

# AVC

## Categoria 4 — 17 itens, com a fonte de cada um

| # | Assunto | Fonte a abrir |
|---|---|---|
| 1 | Janela medida até a **chegada**, não até a agulha | AHA/ASA 2019 (onset-to-treatment) · ECASS III (NEJM 2008) |
| 2 | Tempo/LKW incerto **bloqueia trombectomia** | DAWN (NEJM 2018) · DEFUSE-3 (NEJM 2018) |
| 3 | Janela 6–24 h de MT sem critério de mismatch/ASPECTS | DAWN · DEFUSE-3 · SELECT2 / ANGEL-ASPECT (NEJM 2023) |
| 4 | HIC prévia: relativa (engine) × absoluta (árvore) | AHA/ASA 2019, tabela de elegibilidade · bula do alteplase |
| 5 | Coagulopatia/INR > 1,7 como "corrigível", não bloqueio | AHA/ASA 2019 · exclusões do ECASS III / NINDS 1995 |
| 6 | TTPa > 40 s (número absoluto) | AHA/ASA 2019 (aPTT > LSN do laboratório) |
| 7 | DOAC não bloqueia (engine) × 48 h absoluto (árvore) | AHA/ASA 2019 §3.5 |
| 8 | Glicemia > 400 como contraindicação | AHA/ASA 2019, critérios glicêmicos |
| 9 | "Cirurgia < 14 dias" absoluta × intracraniana 3 meses | AHA/ASA 2019, tabela de elegibilidade |
| 10 | **NIHSS incompleto bloqueia trombólise** | AHA/ASA 2019 (NIHSS não é critério) · PRISMS (JAMA 2018) |
| 11 | PA-alvo na trombectomia 220/120 × < 180/105 | AHA/ASA 2019 · BP-TARGET (Lancet Neurol 2021) · ENCHANTED2/MT |
| 12 | **Nitroglicerina EV** sugerida × "não usar nitrato" | AHA/ASA 2019, manejo da PA · Diretriz SBDCV/ABN |
| 13 | HIC: "< 140 é seguro" sem piso × alvo 140 com piso 130 | INTERACT2 (NEJM 2013) · ATACH-2 (NEJM 2016) · AHA/ASA ICH 2022 |
| 14 | Cerebelar > 3 cm (diâmetro) × ≥ 15 mL (volume) | AHA/ASA Spontaneous ICH Guideline 2022 |
| 15 | Lobar > 30 mL × lobar superficial sem volume | STICH I (Lancet 2005) · STICH II (Lancet 2013) |
| 16 | NIHSS ≥ 4 / ≤ 5 como limiar × "independentemente do NIHSS" | PRISMS (JAMA 2018) · AHA/ASA 2019 |
| 17 | Febre: 37,5 / 37,8 / 38 °C × meta ≤ 37,5 | AHA/ASA 2019 (hipertermia > 38 °C) · ESO |

### Os quatro de maior peso, com os textos

**#1 — janela até a chegada**
- engine (`avc/eligibility.ts:274-276`): `if (lkwToArrival > AVC_WINDOWS.ivTrombolysisMinutes) { blockers.push("Fora da janela IV padrão") }` — `lkwToArrival` é medido até a **hora de chegada**
- árvore (`:223`): *"Trombólise IV até 4,5 h do início em pacientes elegíveis (ECASS III)."*
- **Efeito:** o engine libera paciente que chegou em 4 h e será tratado em 5 h.

**#2 — LKW incerto bloqueia trombectomia**
- engine (`avc/eligibility.ts:319-321`): `if (timeUnknown) { thrombectomyBlockers.push("Tempo/LKW incerto para estratégia de reperfusão.") }`
- árvore (`:227`): *"Início desconhecido / ao acordar: considerar protocolo guiado por imagem (RM DWI-FLAIR) em centro especializado."*
- **Efeito:** o engine nega trombectomia exatamente à população que o DAWN incluiu.

**#5 — INR alto vira "corrigível"**
- engine: coagulopatia entra em `correctableItems`, não em `blockers` — INR 3,5 sai como *"Precisa corrigir antes"*
- árvore (`:252`): *"INR > 1,7 / TTPa elevado; uso de DOAC nas últimas 48 h"* sob **contraindicação ABSOLUTA**

**#12 — nitrato**
- engine (`avc/prescriptions.ts:94`): *"discutir nitroglicerina em bomba e/ou metoprolol 5 mg EV lento"*
- árvore (`:287`): *"NÃO usar nitrato sublingual."* + nitroprussiato como escolha quando betabloqueador contraindicado

## Vale portar — os 4 de segurança que só existem no morto

1. **`protocol-config.ts:69`** — *"⚠️ NÃO usar os esquemas ponderais do infarto agudo do miocárdio: no IAM a dose chega ao dobro."* Ressalva de segurança ausente da árvore.
2. **`prescriptions.ts:95,102`** — manejo do **angioedema orolingual** pós-alteplase (suspender infusão, proteger via aérea). A árvore não menciona uma vez a complicação que mata por via aérea.
3. **`prescriptions.ts:92`** — cadência de neurochecks 15/15 min × 2 h → 30/30 × 6 h → 1/1 h até 24 h. A árvore só diz "monitorização (24 h)".
4. **`calculators.ts:12-22`** — **bloqueia o cálculo sem peso**, em vez de degradar para texto. Escolha mais segura para miligrama com teto.

Outros 19 de menor peso: gestação/puerpério e punção não compressível como contraindicações relativas; IOT se GCS ≤ 8; dose de glicose na hipoglicemia; doses de insulina, estatina e profilaxia de TEV; angioedema; solução isotônica; permanência em UTI; "AngioTC não bloqueia a trombólise IV".

---

# CORONÁRIAS

## Correção de escopo
`coronary-syndromes-engine.ts` é **camada de composição** — quase sem texto
clínico. O conteúdo vive em `protocols/sindromes_coronarianas.json` (198 l.)
e `coronary/{protocol-config,calculators,scores,classification,biomarkers,ecg,prescriptions}.ts`,
todos importados **só** pelo engine.

## Categoria 4 — 18 itens (22 linhas: 4 contradizem a fonte, não a árvore)

| # | Assunto | Fonte a abrir |
|---|---|---|
| 1 | AAS: ataque 200–300 × 162–325; manutenção 100 × 81–100 | AHA/ACC 2025 ACS · Diretriz SBC IAMCSST |
| 2 | Supra: 2 mm em V1–V4 × limiar por sexo/idade em V2–V3 | Fourth Universal Definition of MI (Thygesen 2018) · ESC 2023 ACS |
| 3 | **BRE novo = STEMI automático** × exigir Sgarbossa | ESC 2023 ACS · Sgarbossa 1996 (NEJM) · Smith 2012 |
| 4 | **GRACE fabricado** (pesos inventados, creatinina por checkbox) | Granger 2003 (Arch Intern Med) · Fox 2014 (BMJ Open 4:e004425) |
| 5 | HEART: inversão de T = 1 × 2 pontos; DAC prévia contada 2× | Six/Backus/Kelder, Neth Heart J 2008;16(6):191–196 |
| 6 | TIMI com itens redefinidos | Antman, JAMA 2000;284:835–842 |
| 7 | **Gate de ICP usando 90 min como corte de decisão** | ESC 2023 ACS · AHA/ACC 2025 ACS |
| 8 | Porta-agulha 30 min × 10 min do diagnóstico (âncoras diferentes) | ESC 2023 × AHA/ACC 2025 |
| 9 | Fármaco-invasiva 3–24 h × 2–24 h | ESC 2023 (STREAM, TRANSFER-AMI, CARESS-in-AMI) |
| 10 | **Lise nunca oferecida se existe sala lenta** | ESC 2023 · AHA/ACC 2025 |
| 11 | **P2Y12: ticagrelor liberado com lítico**; prasugrel ausente | AHA/ACC 2025 · CLARITY-TIMI 28 · COMMIT/CCS-2 |
| 12 | Enoxaparina + alteplase: bolus 0,5 mg/kg × 30 mg IV | ExTRACT-TIMI 25 (NEJM 2006) · bula |
| 13 | Idoso "> 75" (texto) × "≥ 75" (código e árvore) | ExTRACT-TIMI 25 · bula |
| 14 | Teto de 100/75 mg nas duas primeiras doses | bula da enoxaparina · ExTRACT-TIMI 25 |
| 15 | Ajuste renal por **checkbox de DRC**, removendo o bolus | bula (ClCr < 30) · ExTRACT-TIMI 25 |
| 16 | **Faixas de peso da TNK** (`<=` × `<` em 60/70/80/90 kg) | bula da tenecteplase (Metalyse) |
| 17 | Teto da alteplase 100 mg × comentário "90 mg" | bula do Actilyse (regime acelerado IAM) · GUSTO-I |
| 18 | HAS grave: relativa sem número × absoluta > 185/110 | AHA/ACC 2013 STEMI Tabela 14 + 2025 ACS |
| 19 | Betabloqueador: FC>60/PAS>120/VD × 24 h/BAV/broncoespasmo | AHA/ACC 2025 · COMMIT/CCS-2 |
| 20 | **Nitrato liberado em IAM de VD com PA normal** | AHA/ACC 2025 · ESC 2023 |
| 21 | Alta rápida: 0h/1h ou **0h/2h** × 0h/1h ou **0h/3h** | ESC 2023, algoritmos hs-cTn |
| 22 | Delta de troponina como ≥ 20 % do limite de referência | ESC 2023 · Fourth Universal Definition of MI |

### Os quatro mais perigosos

**#3 — BRE novo dispara STEMI sem Sgarbossa**
`coronary/ecg.ts:19-21`: `hasStemiPattern = stElevation === "yes" || (newBundleBranchBlock === "yes" && inconclusive !== "yes")` — libera trombólise só com o flag de BRE. Árvore (`:128`) exige Sgarbossa e ainda inclui BRD novo.

**#7 e #10 — o gate da ICP**
`coronary/classification.ts:110` usa `primaryPciTargetMin: 90` como **corte de elegibilidade**; e `:114` só considera lise `if (cathLabAvailable !== "yes")`. Efeito combinado: paciente com atraso previsto de 100 min é desviado da ICP, e onde existe sala lenta (4 h) a lise **nunca é avaliada**. A árvore decide por tempo (120 min), que é o correto.

**#11 — ticagrelor com lítico**
engine (`json:112`): *"Ticagrelor 180 mg ou Clopidogrel 300-600 mg"* sem separar cenário. Com fibrinolítico o único P2Y12 com evidência é **clopidogrel** — e o engine ainda omite a regra de não fazer ataque no ≥ 75 anos.

**#4 — o GRACE do engine não é o GRACE**
`coronary/scores.ts:128-174` fabrica o número: não há campo de creatinina (usa checkbox de DRC como proxy binário), não há PCR na admissão, e os pesos não correspondem à publicação. Depois usa esse número para indicar estratégia invasiva e UTI. **Recomendação: não portar nada de `scores.ts`.**

## Sobre a pergunta do R-12 (HEART/MACE) — NÃO há violação
Os percentuais de Backus 2013 (1,7 % / 16,6 % / 50,1 %) existem em **um único
lugar**: `clinical-calculators-engine.ts:585-588`, com citação completa. Nem o
engine nem a árvore repetem número de MACE. O que existe é uma segunda
*implementação de pontuação* (morta), divergente no item ECG.

## Vale portar — prioridade
1. **HNF peri-ICP primária: 70–100 U/kg IV (máx 10.000 U); 50–70 com GP IIb/IIIa** (`json:153`). A árvore diz *"conforme serviço"* e o teto existe só em comentário.
2. Ressalva do **fondaparinux** (não usar isolado na ICP — OASIS-5/6).
3. **Dupla checagem obrigatória** antes da lise.
4. Gate **"ECG inconclusivo bloqueia trombólise"**.
5. Contraindicação por **anticoagulante oral / INR não esclarecido** (ausente da árvore).
6. Esquema acelerado da **alteplase** (a árvore só tem tenecteplase — onde não há TNK, o app fica sem opção).
7. **ECG seriado 0/60/90 min** pós-lítico.
8. Metas **porta-troponina 60 min** e definição de positividade (percentil 99).
9. Bloqueio de cálculo sem peso.

---

# CAD / EHH

## D-2 — INVESTIGAÇÃO DIRIGIDA: veredito

**A suspeita NÃO se confirma na direção temida.** Ninguém corrigiu a
estrutura diagnóstica no arquivo errado: **a árvore viva é o lado 2024; o
engine morto + JSON são Kitabchi 2009**, praticamente intocados.
Portar o engine por cima seria **regressão clínica**.

**Mas se confirma noutra forma.** Correções da auditoria R-18 foram aplicadas
ao engine morto:

| Correção | Onde foi | Chega à tela? |
|---|---|---|
| Osmolaridade `ureia/2,8` → `ureia/6` + critério de EHH pela EFETIVA | `engine.ts:255-300, 362` | **Não** |
| Rótulo "Ureia — não BUN" + helper | `engine.ts:1603-1614` | **Não** |
| Texto ADA/EASD 2024 de cristaloide balanceado | engine **e** árvore:165 | Sim |
| "0,05 U/kg/h no EHH (2024)" | engine:891 / árvore:268 sem citação | Parcial |

E **`scripts/valida-osmolaridade.cjs:77,113` trava o cálculo do arquivo
morto** — terceira trava validando código inalcançável (com `test:avc` e
`test:coronary`, D-25).

### Contradição interna do lado morto
O **código TS** do engine usa `g >= 200` e `hco3 < 18` (2024); o **JSON que
ele exibe** diz `> 250` e `< 15` (2009). O texto que o usuário leria é 2009;
a classificação silenciosa é 2024.

### O buraco estrutural real
O consenso 2024 formalizou o **estado de sobreposição CAD+EHH**. O engine
morto tem a classe `mixed` implementada com conduta própria
(`engine.ts:374-397, 663-678, 870-897`). A árvore viva diz *"podem
coexistir"* (`:75`) e oferece **só duas opções** (`:152-155`).
**No único ponto onde 2024 mudou a estrutura, quem tem certo é o arquivo morto.**

## Categoria 4 — 16 itens. Todos convergem para UMA fonte

**`Diabetes Care 2024;47(8):1257-1275` — ADA/EASD/AACE/DTS, "Hyperglycemic
Crises in Adults With Diabetes: A Consensus Report"**

| # | Assunto | Seção |
|---|---|---|
| 4.1 | Critérios diagnósticos de CAD (>250/HCO₃<15 × ≥200/HCO₃<18/βOHB) | tabela de critérios |
| 4.2 | **Osmolalidade efetiva do EHH (>320 × >300?)** | critérios de HHS |
| 4.3 | Ânion gap no diagnóstico (mantido × retirado) | "Diagnosis" |
| 4.4 | **Bolus inicial de insulina** (0,1 U/kg × sem bolus) | algoritmo de insulina |
| 4.5 | Insulina SC na CAD leve/moderada (proibida × recomendada) | análogo rápido SC |
| 4.6 | **Limiar de K⁺ que segura insulina (3,3 × 3,5)** | algoritmo de potássio |
| 4.7 | Faixa superior de K⁺ (5,0/5,2/5,3/5,5) e teto por via de acesso | tabela de reposição |
| 4.8 | Bicarbonato: pH < 6,9 × < 7,0 | "Bicarbonate therapy" |
| 4.9 | Fluido inicial (SF 1 L/h × balanceado 500–1.000 mL/h) | "Fluid therapy" |
| 4.10 | Volume por kg × taxa fixa | "Fluid therapy" |
| 4.11 | Déficit hídrico estimado | tabela de déficits |
| 4.12 | Glicemia para adicionar glicose (200 × 250) | algoritmo insulina/dextrose |
| 4.13 | Velocidade de queda da glicemia | titulação |
| 4.14 | **Critérios de resolução da CAD** | "Resolution of DKA and HHS" |
| 4.15 | **TDD na transição SC (0,3–0,5 × 0,4 × 0,5–0,8)** | "Transition to SC insulin" |
| 4.16 | **Estado misto CAD+EHH** | "overlap DKA/HHS" |

### ⚠️ Os QUATRO em que a ÁRVORE VIVA pode estar errada
Ao contrário de todo o resto — aqui o risco chega ao paciente:

- **4.2 · osmolalidade do EHH.** Os dois dizem >320, **mas a árvore atribui esse número a 2024**. Se 2024 baixou para >300, a tela **subdiagnostica EHH** e a atribuição é falsa.
- **4.6 · limiar de K⁺.** A árvore documenta 3,5 como *"desvio conservador da ADA, que usa 3,3"*. Se 2024 adotou 3,5, o número está certo e a **justificativa está errada** — e o comentário precisa ser reescrito.
- **4.12 · glicemia para glicose.** A árvore troca aos 200; suspeita de que 2024 elevou para 250.
- **4.15 · TDD.** Três valores incompatíveis no repositório para um cálculo de dose de insulina.

## Vale portar — 26, por peso clínico
1. **Classe `mixed` (CAD+EHH)** com conduta própria — *o mais grave*
2. **Tromboprofilaxia com HBPM no EHH** + dose de enoxaparina (a árvore não menciona trombose em nenhum nó)
3. Cálculo automático de osmolaridade total/efetiva e de ânion gap — hoje a tela **só escreve a fórmula** (ver PD-3)
4. Gradação da desidratação por PAS/PAM/GCS
5. Vasopressor com alvo de PAM ≥ 65
6. Suporte ventilatório escalonado, IOT se GCS ≤ 8
7. Antibiótico, antiemético e analgesia com doses (**"evitar AINE se hipovolemia/IRA"**)
8. Diurese horária com cateter, meta ≥ 0,5 mL/kg/h
9. O que procurar no ECG quanto ao K⁺
10. Radiografia de tórax; faixas de pH venoso × arterial; SG 10% como opção; classe "indeterminado"; sentinela de acidose de alto gap; HbA1c e encaminhamento; alvos de SpO₂; PAM; conversões de unidade

## Resposta à pergunta do divisor da ureia
**Nenhum dos dois arquivos usa 2,8 sobre campo de ureia hoje.** `engine.ts:287`
usa `/6` com comentário; `engine.ts:1603` rotula "Ureia — não BUN"; a árvore
(`:150`) repete o alerta em texto. O único "2,8" restante é preset de
potássio — falso positivo.

---

# Consolidado — por onde começar

**Uma fonte por módulo resolve a maioria:**
- CAD/EHH inteiro → *Diabetes Care 2024;47:1257* (16 itens)
- Coronárias → ESC 2023 ACS + AHA/ACC 2025 + bulas (enoxaparina, TNK, alteplase)
- AVC → AHA/ASA 2019 + os ensaios de trombectomia (DAWN, DEFUSE-3)

**O maior retorno por esforço não é o porte — são os bugs VIVOS**, que não
dependem de nenhuma decisão da D-22 (ver lista própria).
