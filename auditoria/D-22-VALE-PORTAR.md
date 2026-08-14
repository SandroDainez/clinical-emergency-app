# D-22 · O que vale portar antes de deletar os engines mortos

Consolidação das quatro varreduras exaustivas (Anafilaxia, EAP, Ventilação,
Sepse — `anafilaxia-engine.ts`, `eap-engine.ts`, `ventilation-engine.ts`,
`sepsis-engine.ts` contra as árvores vivas). Nada foi portado. Nada foi
deletado. Cada item abaixo tem o achado original completo no relatório do
agente correspondente, entregue em chat — este documento é o roteiro de
decisão, não a substituição daquele detalhe.

Classificação em quatro grupos, como pedido:

---

## 1. Dentro do escopo atual — decide agora

Não depende de PD-1 nem de PD-2. Conteúdo clínico do atendimento agudo,
população adulta, sem depender da resposta sobre "internado em piora".

### Anafilaxia
- Diagnóstico diferencial: síndrome de Kounis (dor torácica + anafilaxia) e troponina como exame dirigido.
- Limiar numérico SpO₂ < 92% para definir Grau III (a árvore hoje só diz "hipoxemia grave", sem o número).
- Acesso intraósseo (IO) como alternativa quando o periférico é inviável — a árvore só cita "2 acessos calibrosos".
- Sulfato de magnésio 2 g IV/20 min para broncoespasmo grave refratário — ausente na árvore.
- Ipratrópio nebulizado como adjuvante ao salbutamol em broncoespasmo refratário — **só a parte adulta**; a dose pediátrica que vinha junto está fora de escopo por PD-2 (ver grupo 3).
- Hidrocortisona EV / dexametasona como alternativas de via/dose de corticoide (a árvore só tem metilprednisolona).
- Bateria de exames complementares condicionais (lactato se choque, gasometria se hipoxemia, troponina se dor torácica, coagulograma se choque grave) — árvore não tem nenhum nó de exames.
- Fator de risco "asma grave e uso de betabloqueador" para reação bifásica grave (a árvore cita outros fatores, não estes dois).

### EAP
- Cabeceira 30–45° / restrição de decúbito dorsal se rebaixamento ou IOT.
- Contraindicações de VMNI: parada cardíaca, vômito incoercível, rebaixamento grave (GCS≤8), choque refratário.
- Ressalva "hipotensão é contraindicação relativa a VMNI" (existe no engine como lógica, `suggestVni`, ausente como texto na árvore).
- Via sublingual de nitroglicerina (0,5 mg SL a cada 5 min, máx 3 doses) — útil antes de acesso IV, ausente na árvore.
- Preparo/diluição IV da nitroglicerina (50 mg/250 mL SG5%).
- Contraindicações de nitrato: PAS<90, uso de inibidor de PDE-5 (sildenafila) <24–48h, estenose aórtica grave — **interação potencialmente perigosa, ausente na árvore**.
- Ajuste de furosemida na DRC (60–120 mg IV).
- Teto e intervalo de repetição da morfina (2–4mg a cada 5–15min, máx 10–15mg) — a árvore só tem a dose única.
- Contraindicações de morfina: hipotensão, rebaixamento, insuficiência respiratória grave, DPOC.
- Ressalva de acesso central preferencial para noradrenalina (risco de necrose periférica).
- Opção de metoprolol/diltiazem IV para controle de FC em FA associada ao EAP (hoje só cardioversão/amiodarona/digoxina).
- Meta numérica de FC < 110 bpm na fase aguda de controle de arritmia.
- Escada de dispositivo de O₂ por faixa de SpO₂ (a árvore só define a meta, não a progressão).
- Tabela FiO₂-por-dispositivo (`estimateFio2FromDevice`) — calculadora auxiliar, prioridade menor.

### Ventilação
- Três cenários clínicos **inteiros**, sem qualquer equivalente na árvore:
  - Hipoxêmico sem SDRA confirmado (pneumonia grave/sepse pulmonar) — Vt 6, sem ser tratado como SDRA.
  - Acidose metabólica grave (sepse, CAD, choque) — FR alta para compensação ventilatória, lógica própria.
  - Fraqueza neuromuscular (miastenia, Guillain-Barré) — insuficiência de bomba, não lesão parenquimatosa.
- VNI-primeiro para DPOC exacerbado e imunossuprimidos, com NNT citado (hoje a árvore só recomenda VNI-primeiro no cardiogênico).
- Alarmes obrigatórios do ventilador: Ppico, Pplat, PEEP, VTe, FR, FiO₂, apneia — ausentes por completo.
- Limiar numérico de resistência do sistema (10 cmH₂O/L/s).
- Monitorização de esforço espontâneo — P0.1 e Pmus, com regra de quando NÃO usar modo espontâneo.
- Orientação específica por modo ventilatório (SIMV, PRVC/VC+, PC-AC, CPAP como modo inicial).
- Diagnóstico gasométrico estruturado (pH/PaCO₂/HCO₃/BE) com sugestão de ajuste — mecanismo, não só conteúdo.
- Periodicidade de reavaliação da Pplat (a cada 4–8h).
- Manobra de recrutamento alveolar e óxido nítrico inalatório, como notas de resgate de baixo risco.
- Equivalência SpO₂/FiO₂ < 235 ↔ PaO₂/FiO₂ < 200 (a árvore só tem a equivalência para o diagnóstico de SDRA, não para este patamar de gravidade).

### Sepse — os quatro reclassificados de PD-1 + os de admissão
- SOFA calculável por sistema (respiratório, cardiovascular, hepático, renal, SNC, hemostasia) — é o critério diagnóstico formal de sepse; a árvore só cita "SOFA agudo ≥ 2" sem poder calculá-lo.
- Ajuste renal/diálise da PRIMEIRA dose de antibiótico (ClCr, HD/CRRT) — decisão do momento zero, não do seguimento.
- Alternativa para alergia a beta-lactâmico, por foco — decisão da primeira prescrição.
- Isolamento/precauções (contato MDR, aéreo, gotículas) — decidido na admissão.
- Swab retal de rastreio MDR — ação de admissão.
- Hemoculturas de endocardite (3 pares, 30 min de intervalo) — parte da coleta inicial.


---

## ⚠️ VARREDURA DE COBERTURA — o app JÁ TEM parte disto (R-33)

Feita a pedido do Sandro, ANTES da decisão de porte. "Vale apontar" é
categoria diferente de "vale portar", e mais barata. Resultado: **9 dos 40
já existem em outro módulo**, e um deles em versão MELHOR que a do engine
morto.

| Item | Onde já existe | Vivo? | Auditado? |
|---|---|---|---|
| **S1** SOFA por sistema | `clinical-calculators-engine.ts` — 6 domínios, limiares completos | ✅ | ✅ Fase 1 |
| **E6** nitrato × PDE-5 | `vasoactive-engine.ts:672` + `coronary-decision-tree.ts:189` | ✅ | ✅ (Vasoativas) |
| **E10** noradrenalina periférica | `vasoactive-engine.ts:226` — **melhor**: traz critério do Chest 2023 (<48 h, <15 mcg/min), o engine morto só dizia "preferir central" | ✅ | ✅ (Vasoativas) |
| **E2 + E3** contraindicações de VNI | `dyspnea-decision-tree.ts:34` — lista **muito mais completa** que a do engine morto (inclui PAS<90, IAM, HDA, trauma de face, tosse ineficaz) | ✅ | ❌ |
| **A4** MgSO₄ 2 g IV | `dyspnea-decision-tree.ts:207` (broncoespasmo grave) | ✅ | ❌ |
| **A5** ipratrópio | `dyspnea-decision-tree.ts:207` e `:230` | ✅ | ❌ |
| **E8/E9** morfina 2–4 mg + contraindicação | `coronary-decision-tree.ts:189` (parcial — tem a ressalva, **não** tem o teto de 10–15 mg) | ✅ | ❌ |
| **S2** ajuste renal de ATB | `clinical-calculators-engine.ts` (3 fármacos: vanco, pip-tazo, meropeném) | ✅ | ✅ Fase 1 |

### A distinção que esta varredura produziu — refinamento do R-33

**Nem todo "já existe em outro módulo" vira ponteiro.** Há duas naturezas:

- **Delegável** — quando o outro módulo toma uma DECISÃO que este não
  precisa duplicar: *calcular* um SOFA, *ajustar* uma dose por ClCr. O
  ponteiro basta, e duplicar violaria R-12. → **S1, S2**.
- **NÃO delegável** — quando é a CONTRAINDICAÇÃO de um fármaco que ESTA
  tela está prescrevendo. Não se manda o médico abrir outro módulo para
  descobrir que a droga que a tela acabou de indicar é contraindicada. A
  contraindicação pertence ao ponto da prescrição. → **E6, E2, E3, E8,
  E9**.

O critério: *quem prescreve, avisa*. Ponteiro serve para buscar; não serve
para alertar.

**Consequência prática:** os itens não-delegáveis continuam sendo porte —
mas **o texto já existe auditado no app** (E6, E10 via Vasoativas), então
não precisam de fonte externa nova: precisam de FONTE ÚNICA (`lib/`),
consumida pelos dois módulos. É D-11 outra vez, não R-5.

---

## 2. Fora do escopo por PD-1 — NÃO portar

PD-1 decidida: o app termina na estabilização inicial. **Quatro itens que
estavam neste grupo foram reclassificados para o Grupo 1** (SOFA calculável,
ajuste renal de ATB, alergia a beta-lactâmico, isolamento/precauções) — são
decisões de primeira hora, não de fase seguinte.

O que resta aqui é o que fica **de fora**, e não volta:

- Fluxo do paciente já internado em piora: PAV, CRBSI (retirada de CVC), ITU-cateter, infecção abdominal em UTI, candidemia.
- Escalonamento de antibiótico dirigido por cultura (KPC/ESBL/MRSA/Pseudomonas/Acinetobacter) — depende de perfil de resistência LOCAL, que o app não tem como manter por instituição; conselho genérico aqui é pior que silêncio.
- Choque refratário com resgate avançado: angiotensina II, azul de metileno.
- SDRA por sepse com prona / bloqueio neuromuscular / ECMO, e critérios de desmame.
- Profilaxias de bundle de internação (enoxaparina/HNF com ajuste renal, pantoprazol).

**Isto não é conteúdo perdido** — é produto que o módulo nunca teve como meta
oferecer. Deletar o engine morto não destrói decisão nenhuma aqui.

## 3. Depende de PD-2 (escopo pediátrico) — CONFIRMADO VAZIO

PD-2 já foi decidida e aplicada nesta sessão (população adulta, ponteiro de
ausência declarada). Não há item nesta lista "esperando" PD-2 — ela já
resolveu os candidatos que existiam:

- **Anti-H1 por faixa etária pediátrica** (cetirizina/loratadina/difenidramina por idade) — a parte pediátrica está fora de escopo por PD-2; não sobra o que portar aqui além do que a árvore já tem para o adulto (difenidramina 25–50mg IV).
- **Ipratrópio com "doses pediátricas por faixa etária"** — a dose adulta entra no grupo 1 acima; a variação por faixa etária pediátrica não é portada, por PD-2.

Nenhum outro item das quatro varreduras tinha conteúdo pediátrico — o
restante da lista "vale portar" é população adulta desde a origem.

---

## 4. Obsoleto/duplicata — classificação já conferida, não decisão

Volume grande (~60 itens entre os quatro módulos) já revisado durante a
varredura e a rodada de categoria 4 (achados A–H). Não listado item a
item aqui — está nos relatórios originais de cada agente, em chat. Os
casos que pareciam divergência e eram na verdade duplicata/obsoleto
genuíno (fonte documentada) já foram checados nominalmente:

- Anafilaxia: teto pediátrico antigo de adrenalina IM (json vs. árvore) — superado por PD-2, não se aplica mais.
- Anafilaxia: dose de infusão EV 0,05–0,1 do engine — era o item A, já resolvido (fonte única aplicada).
- Anafilaxia: bolus EV fora de PCR do engine — item C, já resolvido (removido deliberadamente, documentado).
- EAP: diluição de noradrenalina do engine (32 mcg/mL) vs. árvore (16 mcg/mL, conta corrigida) — item D, prioridade ainda em aberto (D-22b).
- EAP: regime de amiodarona do engine (30–60min) — item E, já resolvido (os dois regimes nomeados).
- Ventilação: tabela PEEP/FiO₂, sedação RASS/dexmedetomidina, cenário "neuro" fundido — três casos de obsoleto genuíno, fonte documentada na própria árvore, confirmados corretos.
- Sepse: dexametasona de meningite por peso (json) vs. dose fixa (árvore) — obsoleto genuíno, árvore cita a razão.
- Sepse: SIRS clássico (engine) vs. Sepsis-3/qSOFA (árvore) — obsoleto genuíno, padrão que o módulo inteiro já adota.

Se quiser conferir a classificação de algum item específico da grande massa
de "duplicata" não listada aqui, aponte o item e eu releio contra a árvore.

---

## Resumo para decisão

| Grupo | Itens | Ação |
|---|---|---|
| 1. Escopo atual | **40** (Anafilaxia 8 · EAP 14 · Ventilação 12 · Sepse 6) | Decida quais portar — lista nominal abaixo |
| 2. Fora por PD-1 | 1 bloco (Sepse/UTI) + 4 itens | **Fechado.** Não porta, não volta |
| 3. Depende de PD-2 | 0 (confirmado) | Nenhuma ação — PD-2 já resolveu |
| 4. Obsoleto/duplicata | ~60 (não listados individualmente) | Sem ação, salvo conferência pontual |

**31 dos 40 itens exigem fonte aberta antes de escrever (R-5)** — marcados
com 🔍. E a razão é estrutural, não burocrática: **o engine morto NÃO é
fonte.** Copiar um número de código inalcançável é escrever de memória com
aparência de procedência — pior que memória declarada, porque o número
chega com ar de já-conferido. Foi assim que a adrenalina EV 0,05 (dose
pediátrica) sobreviveu anos parecendo dose adulta.
