# MATRIZ DE PRONTIDÃO PARA IMPLEMENTAÇÃO — AVC isquêmico agudo (V1)

**Natureza:** mapa objetivo do que pode ou não virar código.
⛔ **Não substitui a revisão clínica do autor.** ⛔ Não resolve lacuna. ⛔ Não
propõe UI. ⛔ Não escreve código. **Apenas classifica o estado real.**

> ### ✅ UNIVERSO AUDITADO
>
> **Universo auditado: 91 regras, 91 IDs únicos, zero duplicados, exatamente um
> status primário por ID. Listas derivadas agrupam por dependência e podem se
> sobrepor legitimamente.**
>
> Teste completo em §**Teste de universo**, ao final.

**Base:** marco documental `cb4ff11` — spec (51 exigências), transcrição da
AHA/ASA 2026, revisão transversal, consolidação e fontes complementares.

## Legenda

| status | significado |
|---|---|
| ✅ **PRONTA** | conteúdo fechado, fonte identificada, comportamento definido, sem bloqueio conhecido |
| 🔧 **PRONTA C/ DEP. TÉCNICA** | medicina fechada; depende de **Q-01/Q-02/Q-03** ou outra decisão arquitetural |
| 🟡 **PARCIAL** | parte fechada; falta conteúdo operacional complementar |
| 🔴 **BLOQUEADA** | falta dado clínico ou regulatório necessário à segurança |
| ⚪ **FORA DO V1** | deliberadamente não implementada nesta versão |

**Naturezas:** `CLÍN` conteúdo clínico · `COMP` comportamento · `CALC` cálculo ·
`REG` dado regulatório · `TRAD` tradução · `TÉC` requisito técnico

**Dependências técnicas:** **Q-01** relógio substituível · **Q-02** onde mora a
camada de conteúdo · **Q-03** mecanismo do espanhol

---

## BLOCO 1 · Entrada e estabilização

| ID | descrição | nat. | status | motivo | fonte | dependência | risco se implementada agora |
|---|---|---|---|---|---|---|---|
| **R1.1** | "suspeita clínica de AVC agudo" como condição operacional de entrada | COMP | ✅ | decidido pelo autor; ⛔ sem algoritmo de triagem | decisão (F-13) | — | — |
| **R1.2** | cinco relógios distintos, ⛔ sem `stroke_time` | COMP·TÉC | 🔧 | modelo fechado; ⛔ tempo precisa ser injetável | F-02, §1.1 | **Q-01** | janela incomputável ou incorreta |
| **R1.3** | t₀ operacional = chegada, ⛔ não substitui relógio clínico | COMP | ✅ | decidido (P-03) | §0.1 | — | — |
| **R1.4** | suporte de via aérea se rebaixamento **ou** disfunção bulbar | CLÍN | ✅ | COR 1 · C-LD; gatilhos nomeados | F-23 §4.1 r1 | — | — |
| **R1.5** | O₂ para SpO₂ >94% **se hipóxia**; ⛔ não dar sem hipóxia | CLÍN | ✅ | COR 1 · C-LD + COR 3: No benefit | F-23 §4.1 r2, r5 | — | O₂ universal = conduta sem benefício |
| **R1.6** | tratar hipoglicemia `<60 mg/dL` | CLÍN | ✅ | COR 1 · C-LD | F-06 §4.5 r1 | — | — |
| **R1.7** | **como** corrigir a hipoglicemia | CLÍN | 🟡 | dose/via/diluição fechadas pelo MS; ⛔ apresentação em **ampola** não obtida | F-18 (MS) | bula da ampola | concentração/apresentação errada |
| **R1.8** | reavaliar o déficit após normoglicemia | COMP | ✅ | COR 1 · C-LD | F-06 §4.6.1 r6 | — | — |
| **R1.9** | corrigir hipotensão/hipovolemia | CLÍN | ✅ | COR 1 · C-LD | F-04 §4.3 r1 | — | — |
| **R1.10** | tratar HAS quando comorbidade exigir | CLÍN | ✅ | COR 1 · C-EO | F-04 §4.3 r2 | — | — |
| **R1.11** | tiamina antes da glicose | CLÍN | ⚪ | fora do V1 por decisão; ⛔ nunca pré-condição | — | — | atrasaria a glicose |
| **R1.12** | conduta **sem acesso venoso** na hipoglicemia | CLÍN | 🔴 | ⛔ não encontrado em nenhuma fonte | — | fonte complementar | conduta inventada |
| **R1.13** | crise: três contextos distintos | CLÍN | ✅ | F-24 mapeou os três | F-24 | — | confundir mimetizador com crise pós-AVC |

> ### ⚠️ ATUALIZAÇÃO DE 2026-08-29 — a hiperglicemia grave entrou
>
> O `>400 mg/dL` como **hiperglicemia grave e possível mimetizador** (F-06,
> *Supportive Text*, ⚠️ sem COR/LOE) estava transcrito e ⛔ não implementado. Entrou
> com correção + **reavaliação do déficit depois dela**, ⛔ sem virar
> contraindicação e ⛔ sem bloquear nada — `PD-16`.
>
> ⛔ O `>180 mg/dL` **continua fora**: é manejo, com o momento ideal em relação à
> reperfusão declarado desconhecido pela fonte, e ⛔ não é regra de mimetizador.

## BLOCO 2 · Confirmação por imagem

| ID | descrição | nat. | status | motivo | fonte | dependência | risco |
|---|---|---|---|---|---|---|---|
| **R2.1** | excluir hemorragia **antes** de qualquer reperfusão | CLÍN·COMP | ✅ | COR 1 · A — bloqueio de classe (**E-08**) | F-16 §3.2 r1 | — | — |
| **R2.2** | imagem vascular ⛔ não espera creatinina | COMP | ✅ | COR 1 · B-NR | F-16 §3.2 r3 | — | atraso indevido |
| **R2.3** | ⛔ neuroimagem multimodal não atrasa a IVT | COMP | ✅ | COR 1 · B-NR | F-02 §4.6.1 r2 | — | **atraso da trombólise** |
| **R2.4** | imagem vascular ≤24 h do LKW na suspeita de LVO | CLÍN | ✅ | COR 1 · A | F-16 §3.2 r8 | — | — |
| **R2.5** | imagem *"as rapidly as possible (eg, 25 min)"* | CLÍN·TRAD | ✅ | é **protocolo institucional**, ⛔ não meta do paciente | F-11 §3.2 r2 | — | exibir "meta 25 min" endurece a fonte |
| **R2.6** | três saídas da TC | COMP | ✅ | comportamento de saída definido | F-16, §0.1 | — | tratar HIC/HSA como beco |

## BLOCO 3 · Déficit incapacitante

> ### ⚠️ ATUALIZAÇÃO DE 2026-08-28 — duas linhas deixaram de ser 🔴
>
> **R3.7 (D-1)** e **R3.8 (D-5)** eram *decisão médica pendente* no marco
> documental deste documento (`cb4ff11`). O autor as decidiu, e ambas estão
> **implementadas com trava e mutação** — ver `DECISOES-DE-PRODUTO.md`, **PD-13**
> e **PD-14**.
>
> ⚠️ **E mais cinco decisões entraram em 2026-08-29**, todas com trava e mutação:
> **PD-15** (pendência com alcance global, e ⛔ nenhuma pendência sem porta) ·
> **PD-16** (hiperglicemia grave `>400` como mimetizador, ⛔ nunca contraindicação,
> com reavaliação derivada da trilha) · **PD-17** (NIHSS calculado aqui × trazido
> de fora, e o externo ⛔ não deriva item nem contexto) · **PD-18** (lateralidade
> **motora**, ⛔ não "lado predominante") · **PD-19** (a escala preenche, explica e
> ⛔ não classifica).
>
> ⚠️ **As contagens agregadas ao final deste documento ⛔ NÃO foram refeitas**:
> elas descrevem o marco `cb4ff11`, e reescrevê-las aqui faria o documento
> parecer uma medição nova sem que ninguém tenha medido tudo de novo. O que muda
> é o status DESTAS DUAS LINHAS, e está dito nelas.

| ID | descrição | nat. | status | motivo | fonte | dependência | risco |
|---|---|---|---|---|---|---|---|
| **R3.1** | ⛔ NIHSS **total** não classifica isoladamente | CLÍN | ✅ | verbatim e354 | F-17 | — | classificar por escore |
| **R3.2** | itens do NIHSS entram na avaliação | CLÍN | ✅ | Table 4 usa cortes por item | F-17 | — | — |
| **R3.3** | pergunta-mãe funcional tem **prioridade conceitual** | CLÍN·TRAD | ✅ | fixada pelo autor; redação marcada como não-verbatim | F-17 + decisão | — | — |
| **R3.4** | Table 4 é *guidance*, com hedge preservado | CLÍN·TRAD | ✅ | quatro marcas de não-normatividade | F-17 | — | achatar *typically*/*may not* |
| **R3.5** | leitura **intermediária**, ⛔ nunca SIM/NÃO | COMP | ✅ | **E-46** | decisão + F-17 | — | veredito inventado |
| **R3.6** | decisão assumida + divergência preservada | COMP·TÉC | 🔧 | exige trilha e autoria | §2.8, §4.5 | **Q-02** | divergência irrecuperável |
| **R3.7** | escopo da decomposição fora de NIHSS 0–5 | CLÍN | ✅ | **D-1 FECHADA em 2026-08-28** → `PD-13` | F-17 (população da Table 4) | — | extrapolar ou omitir apoio |
| **R3.8** | consulta a paciente/família como **ação registrada** | COMP | ✅ | **D-5 FECHADA em 2026-08-28** → `PD-14` | F-17 | — | virar requisito por dentro |
| **R3.9** | déficit leve não incapacitante ≤4,5 h → ⛔ IVT | CLÍN | ✅ | COR 3: No Benefit · B-R | F-17 §4.6.1 r8 | — | — |
| **R3.10** | decomposição é **superfície pulável** | COMP | ✅ | decidido; *"delaying IVT is potentially harmful"* | decisão + F-17 | — | **atraso da trombólise** |

## BLOCO 4 · IVT — janela padrão

| ID | descrição | nat. | status | motivo | fonte | dependência | risco |
|---|---|---|---|---|---|---|---|
| **R4.1** | janela ≤4,5 h **pelo marco da recomendação aplicada** | CLÍN·TÉC | 🔧 | conteúdo fechado; ⛔ exige múltiplos relógios | F-02 | **Q-01** | janela errada nos dois sentidos |
| **R4.2** | PA `≥185/110` = **bloqueio corrigível da ação** | CLÍN·COMP | ✅ | COR 1 · B-NR; ⛔ não é critério de candidatura | F-04 §4.3 r5 | — | dependência circular |
| **R4.3** | **alteplase 0,9 mg/kg, máx 90 mg** | CALC | ✅ | COR 1 · A; preparo fechado por bula (1 mg/mL) | F-09 + F-20 | — | — |
| **R4.4** | **tenecteplase 0,25 mg/kg, máx 25 mg** | CALC·REG | 🔴 | dose clínica fechada; ⛔ **indicação regulatória BR e preparo não confirmados** | F-09 · F-20 | **20.10 · 20.3** | uso fora de indicação registrada; dose do IAM |
| **R4.5** | ⛔ **TNK 0,4 mg/kg não recomendada** | CLÍN | ✅ | COR 3: No Benefit · A — regra separada | F-09 | — | virar "faixa" |
| **R4.6** | ⛔ peso exato **não trava** a trombólise | COMP | ✅ | verbatim Table 7 | F-09 | — | **atraso da trombólise** |
| **R4.7** | iniciar antes do coagulograma, **sob condição resolutiva** | COMP·TÉC | 🔧 | **E-47**; exige vínculo ação↔pendência | F-10 + §2.3 | **Q-02** | ler como "liberado" |
| **R4.8** | alteplase: 10% em bolus de 1 min + 60 min de infusão | CLÍN | ✅ | Table 7 e bula convergem | F-09 + F-20 | — | — |
| **R4.9** | alteplase exige **lúmen/acesso exclusivo** | CLÍN | ✅ | bula Actilyse | F-20 | — | administração concomitante |
| **R4.10** | as **doze marcas 🚫** como critério de projeto | COMP | ✅ | **E-49** | consolidação | — | campo obrigatório que atrasa terapia |

## BLOCO 5 · IVT — janela estendida

| ID | descrição | nat. | status | motivo | fonte | dependência | risco |
|---|---|---|---|---|---|---|---|
| **R5.1** | quatro caminhos, **quatro marcos, três durações** | CLÍN·TÉC | 🔧 | conteúdo fechado; incomputável sem relógios separados | F-03 | **Q-01** | **elegibilidade errada** |
| **R5.2** | critérios de imagem: DWI-FLAIR e penumbra **automatizada** | CLÍN | ✅ | COR 2a · B-R | F-03 + F-16 | — | — |
| **R5.3** | ⛔ parâmetros do WAKE-UP (`<1,2`, `NIHSS >25`) não são regra | CLÍN | ✅ | *Supportive Text*, sem COR/LOE | F-03 | — | critério inventado |
| **R5.4** | indisponibilidade de CTP/RM → **destino**, ⛔ não exclusão | COMP | ✅ | **E-18**; *"if immediately available"* | F-03 §12 | — | negar terapia por falta de equipamento |

## BLOCO 6 · Segurança da IVT

| ID | descrição | nat. | status | motivo | fonte | dependência | risco |
|---|---|---|---|---|---|---|---|
| **R6.1** | antiagregante simples/duplo ⛔ não bloqueia | CLÍN | ✅ | COR 1 · B-NR | F-07 §4.6.1 r9 | — | negar IVT |
| **R6.2** | perguntar *"há informação prévia sobre CMB?"* | COMP | ✅ | corrigido; ⛔ nunca *"CMB presente?"* | F-07 r11 | — | induzir RM contra COR 1 |
| **R6.3** | CMB desconhecido / 1–10 / >10 com forças distintas | CLÍN | ✅ | COR 1 · 2a · 2b | F-07 | — | escala contínua |
| **R6.4** | DOAC <48 h = **informação insuficiente** + individualizada | CLÍN·COMP | ✅ | Table 8, sem COR/LOE | F-10 | — | liberação automática |
| **R6.5** | DOAC de hora desconhecida = desconhecido + pendência + individualizada | COMP | ✅ | classificado pelo autor | F-10 + decisão | — | ler como ausência de exposição |
| **R6.6** | cortes `INR>1,7` · `plaq<100.000` · `aPTT>40s` · `PT>15s` | CLÍN | ✅ | Table 8, faixa absoluta | F-10 | — | — |
| **R6.7** | Table 8 é **gradiente**, ⛔ não veredito | CLÍN·COMP | ✅ | **E-48**; sem COR/LOE em nenhuma célula | F-07 | — | semáforo automático |
| **R6.8** | *"safety is unknown"* ⛔ não bloqueia | COMP | ✅ | faixa relativa, *"may be considered"* | F-07 | — | **negar terapia por incerteza** |
| **R6.9** | gestação e puerpério | CLÍN | ⚪ | lacuna declarada (§6.8) | Table 8 | — | — |

## BLOCO 7 · Pressão arterial

| ID | descrição | nat. | status | motivo | fonte | dependência | risco |
|---|---|---|---|---|---|---|---|
| **R7.1** | quatro contextos com alvos distintos | CLÍN | ✅ | COR 1 / 2a por contexto | F-04 · F-05 | — | alvo do contexto errado |
| **R7.2** | mesmo valor, significados opostos | COMP | ✅ | **E-06** | F-04 · F-05 | — | tratar quem não deve |
| **R7.3** | `COR 3: Harm` = contra a **estratégia**, ⛔ não o paciente | CLÍN·TRAD | ✅ | corrigido em §2.7 | F-05 | — | contraindicar o paciente |
| **R7.4** | ⛔ redução intensiva `<140` desaconselhada/danosa | CLÍN | ✅ | COR 3: No Benefit · COR 3: Harm | F-05 | — | — |
| **R7.5** | **quais anti-hipertensivos IV usar** | CLÍN·REG | 🟡 | 7 fármacos com dose (2020); só 3 citados para AVC; ⛔ disponibilidade 2026 não confirmada | F-19 | ANVISA · bulas | fármaco indisponível ou fora de contexto |
| **R7.6** | velocidade de queda **10–15%** | CLÍN | 🟡 | verbatim completo; gatilho `>220/120`, **não candidato**; ⛔ sem COR/LOE | F-19 | decisão de uso | aplicar fora do gatilho |
| **R7.7** | diluição/concentração dos anti-hipertensivos | CLÍN | 🔴 | ⛔ dado de bula, não obtido | — | bulas individuais | preparo inventado |
| **R7.8** | conduta se a PA não ceder · monitorização na titulação | CLÍN | 🔴 | ⛔ não encontrado | — | fonte complementar | — |

## BLOCO 8 · Trombectomia

| ID | descrição | nat. | status | motivo | fonte | dependência | risco |
|---|---|---|---|---|---|---|---|
| **R8.1** | elegibilidade é **derivada**, ⛔ nunca fato armazenado | COMP | ✅ | **E-43** | F-08 | — | veredito congelado |
| **R8.2** | faixas por janela × ASPECTS × mRS × idade | CLÍN·CALC | ✅ | COR 1 / 2a / 2b, todas transcritas | F-08 | — | — |
| **R8.3** | M2 **dominante** (2a) × **não dominante** (COR 3) | CLÍN | ✅ | forças opostas | F-08 r7, r8 | — | achatar em "M2" |
| **R8.4** | `IDD` ⛔ não é exclusão | COMP | ✅ | legenda da Figure 3 | F-08 | — | **negar EVT por incerteza** |
| **R8.5** | notas `*`/`†` são limitação de generalização | CLÍN | ✅ | ⛔ não são critério | F-08 §16 | — | contraindicação inventada |
| **R8.6** | IVT e EVT **em paralelo**; ⛔ não observar resposta | COMP | ✅ | COR 1 · A | F-08 §4.7.1 | — | **atraso da EVT** |
| **R8.7** | texto com COR/LOE prevalece sobre Figure 3 | CLÍN | ✅ | **E-48**; resolvido pelo autor | F-08 | — | ampliar população |
| **R8.8** | *"não preenche a população"* ≠ *No Benefit* | COMP | ✅ | decidido pelo autor | F-08 | — | rotular como sem benefício |
| **R8.9** | transferência para centro EVT | COMP | ✅ | destino; ⛔ disponibilidade local ⚠️ não é conteúdo | F-16 · §1.10 | 19.1b futuro | inferir serviço local |

## BLOCO 9 · Pós-reperfusão

| ID | descrição | nat. | status | motivo | fonte | dependência | risco |
|---|---|---|---|---|---|---|---|
| **R9.1** | monitorização pós-IVT 15/30/60 min até 24 h | CLÍN | ✅ | Table 7 | F-15 | — | — |
| **R9.2** | deterioração → interromper infusão + TC de emergência | CLÍN·COMP | ✅ | Table 7 | F-15 | — | — |
| **R9.3** | TC/RM em 24 h **antes** de antitrombótico | CLÍN | ✅ | Table 7 | F-15 | — | — |
| **R9.4** | **adiar** SNG, sonda vesical, cateter arterial | CLÍN | ✅ | Table 7 | F-15 | — | listar como tarefa a fazer |
| **R9.5** | reavaliação com escala após reperfusão | COMP | ✅ | COR 1 · B-NR | F-13 §3.1 | — | — |
| **R9.6** | monitorização **pós-EVT** | CLÍN | 🔴 | ⛔ não existe tabela equivalente | — | fonte complementar | derivar por analogia (**E-31**) |
| **R9.7** | internação em unidade de AVC organizada | CLÍN | ✅ | COR 1 · B-R | F-15 §5.1 | — | — |

## BLOCO 10 · Saídas do fluxo

| ID | descrição | nat. | status | motivo | fonte | dependência | risco |
|---|---|---|---|---|---|---|---|
| **R10.1** | destino **proposto** × **assumido** | COMP·TÉC | 🔧 | **E-16**; exige estado e ação | §2.9 | **Q-02** | transferência "feita" sem ser |
| **R10.2** | destino para módulo inexistente é **declarado** | COMP | ✅ | **E-09** | §0.1 | — | beco sem saída |
| **R10.3** | **módulo de AVC hemorrágico (HIC)** | CLÍN | ⚪ | fora do V1 por escopo; destino declarado por **R10.2** | §0.1 | — | tratar como beco |
| **R10.7** | **fluxo de HSA** | CLÍN | ⚪ | fora do V1 por escopo; destino declarado por **R10.2** | §0.1 | — | tratar como beco |
| **R10.4** | mimetizador resolvido → **saída para trás** | COMP | ✅ | COR 1 · C-LD | F-06 §4.6.1 r6 | — | paciente "em AVC" sem AVC |
| **R10.5** | não candidato **segue no fluxo** | COMP | ✅ | PA própria + unidade de AVC (COR 1) | §4.3 · §5.1 | — | encerrar o atendimento |
| **R10.6** | destino cancelado **recalcula**, ⛔ não restaura | COMP·TÉC | 🔧 | §3.7 | §3.7 | **Q-02** | mentir sobre o tempo |

## TRANSVERSAIS

| ID | descrição | nat. | status | motivo | fonte | dependência | risco |
|---|---|---|---|---|---|---|---|
| **T1** | trilha sem sobrescrita | COMP·TÉC | 🔧 | Parte 3 fechada | §3.1 | **Q-02** | perder evolução |
| **T2** | medir de novo ≠ corrigir registro | COMP·TÉC | 🔧 | §3.4 | §3.4 | **Q-02** | **evolução clínica falsa** |
| **T3** | evento histórico de derivação com a lógica vigente | COMP·TÉC | 🔧 | **E-24**; ⛔ versionagem não definida | §4.7 | **Q-02** | falsificar o passado |
| **T4** | autoria do registro | TÉC | 🔴 | campo previsto; ⛔ preenchimento em aberto | §3.9 | decisão futura | atribuição errada |
| **T5** | persistência entre sessões | TÉC | ⚪ | adiada até o ciclo de vida do atendimento | §3.9 | decisão futura | — |
| **T6** | todo conteúdo nasce **PT-BR + ES** | TRAD·TÉC | 🔧 | política fechada (§6.14); ⛔ mecanismo não | **E-12**, **E-45** | **Q-03** | achatar gradação verbal |
| **T7** | teste de alcançabilidade da dose de IAM | TÉC | 🔧 | **E-50**; ⛔ exige motor para ser medido | **E-50** | **Q-02** | **dose dobrada** |
| **T8** | relógio substituível para provas temporais | TÉC | 🔴 | ⛔ **Q-01 não decidida** | §8.7 | **Q-01** | E-01/E-21/E-38 sem prova |

---

# AS CINCO LISTAS

## 1 · Já pode virar código — ✅ **62 regras**

R1.1 · R1.3 · R1.4 · R1.5 · R1.6 · R1.8 · R1.9 · R1.10 · R1.13
R2.1 · R2.2 · R2.3 · R2.4 · R2.5 · R2.6
R3.1 · R3.2 · R3.3 · R3.4 · R3.5 · R3.9 · R3.10
R4.2 · R4.3 · R4.5 · R4.6 · R4.8 · R4.9 · R4.10
R5.2 · R5.3 · R5.4
R6.1 · R6.2 · R6.3 · R6.4 · R6.5 · R6.6 · R6.7 · R6.8
R7.1 · R7.2 · R7.3 · R7.4
R8.1 · R8.2 · R8.3 · R8.4 · R8.5 · R8.6 · R8.7 · R8.8 · R8.9
R9.1 · R9.2 · R9.3 · R9.4 · R9.5 · R9.7
R10.2 · R10.4 · R10.5



⚠️ **Observação:** a maior parte do **conteúdo clínico** e do **comportamento
clínico** já está pronta. O que falta é majoritariamente **técnico** e
**operacional**, ⛔ não médico.

## 2 · Depende **apenas** de Q-01 / Q-02 / Q-03 — **13 IDs**

| dependência | IDs | status primário |
|---|---|---|
| **Q-01** relógio substituível | R1.2 · R4.1 · R5.1 | 🔧 (3) |
| **Q-01** | **T8** | 🔴 (1) |
| **Q-02** camada de conteúdo e estado | R3.6 · R4.7 · R10.1 · R10.6 · T1 · T2 · T3 · T7 | 🔧 (8) |
| **Q-03** mecanismo do espanhol | T6 | 🔧 (1) |

**Total: 13 IDs · sem duplicata entre grupos · nenhum listado indevidamente.**

> ### 🔍 CAUSA DA DIVERGÊNCIA 13 × 12 — identificada
>
> ⛔ **Não é duplicata nem ID indevido.** É **critério diferente entre a lista e o
> resumo**:
>
> | | critério | resultado |
> |---|---|---|
> | **a lista** | *"depende apenas de Q-nn"* — **dependência** | **13** |
> | **o resumo** | contagem do status **🔧 PRONTA C/ DEP. TÉCNICA** | **12** |
>
> **O ID que separa os dois é `T8`** — *"relógio substituível para provas
> temporais"*. Ele **depende de Q-01** (por isso está na lista), mas seu status
> primário é **🔴 BLOQUEADA**, ⛔ não 🔧.
>
> **Por quê:** os 12 marcados 🔧 são **regras clínicas com medicina fechada**
> esperando decisão arquitetural. **T8 não é regra clínica — é o próprio requisito
> técnico**, e sem Q-01 ele não existe, não fica esperando.
>
> ✅ **Correção adotada:** a lista declara **13 IDs**, com o status primário de cada
> um explícito. ⛔ O total 12 não estava errado — estava **medindo outra coisa**.

⚠️ **Q-01 continua a decisão de maior alavancagem:** 4 IDs e, com eles, **toda a
elegibilidade temporal**.

## 3 · Depende de fonte complementar — **8 regras**, em **dois status**

| regra | status primário | o que falta |
|---|---|---|
| **R1.7** | 🟡 **PARCIAL** | bula da **ampola** de glicose |
| **R7.5** | 🟡 **PARCIAL** | disponibilidade **2026** dos anti-hipertensivos |
| **R7.6** | 🟡 **PARCIAL** | decisão de uso dos 10–15% |
| **R1.12** | 🔴 **BLOQUEADA** | conduta sem acesso venoso |
| **R4.4** | 🔴 **BLOQUEADA** | **20.10** indicação regulatória do TNK + **20.3** concentração |
| **R7.7** | 🔴 **BLOQUEADA** | bulas individuais dos anti-hipertensivos |
| **R7.8** | 🔴 **BLOQUEADA** | conduta se a PA não ceder |
| **R9.6** | 🔴 **BLOQUEADA** | monitorização pós-EVT |

**3 PARCIAIS + 5 BLOQUEADAS = 8.**

> ### 🔍 POR QUE A LISTA É MAIOR QUE O NÚMERO DE BLOQUEADAS POR FONTE
>
> A lista agrupa por **dependência** (*"o que falta é fonte complementar"*), e
> essa dependência atinge **dois status diferentes**: quem tem **parte** do
> conteúdo fechado é 🟡; quem não tem **nada** utilizável é 🔴.
>
> ✅ **Decomposição correta das 9 BLOQUEADAS:**
>
> | causa | nº | quais |
> |---|---|---|
> | **fonte complementar ausente** | **5** | R1.12 · R4.4 · R7.7 · R7.8 · R9.6 |
> | **decisão médica do autor** | **3** | R3.7 · R3.8 · T4 |
> | **decisão arquitetural (Q-01)** | **1** | T8 |
>
> ⚠️ **Correção:** eu havia escrito *"6 por fonte complementar, 2 por decisão
> médica"*. **O correto é 5 e 3** — `T4` (autoria do registro) é decisão, ⛔ não
> fonte.

## 4 · Depende de decisão médica do autor — 🔴 **2 regras + 1 pendência**

| item | pergunta |
|---|---|
| **R3.7** | a decomposição do déficit se oferece **fora de NIHSS 0–5**? (**D-1**) |
| **R3.8** | a consulta a paciente/família é **ação registrada**? (**D-5**) |
| **T4** | autoria do registro — quem preenche |

⚠️ **Também dependem da sua revisão clínica**, ainda que classificadas como
prontas: **todas as 62** da lista 1. A prontidão aqui é **documental**, ⛔ não
clínica.

## 5 · Fora do V1 — ⚪ **5 regras**

| regra | razão |
|---|---|
| **R1.11** tiamina | decisão do autor; ⛔ nunca pré-condição da glicose |
| **R6.9** gestação e puerpério | lacuna declarada (§6.8) |
| **R10.3** **módulo de AVC hemorrágico (HIC)** | escopo (§0.1) |
| **R10.7** **fluxo de HSA** | escopo (§0.1) |
| **T5** persistência entre sessões | adiada até o ciclo de vida do atendimento |

> ### 🔍 RECONCILIAÇÃO — o que causava 4 × 5
>
> **Duas causas, ambas corrigidas:**
>
> 1. **HIC e HSA estavam agrupados numa única linha** (`R10.3`). São **dois
>    destinos distintos** em §0.1 e agora têm **IDs próprios** — `R10.3` e
>    `R10.7`. Isso eleva o universo de **90 para 91**;
> 2. **`F-22` não é regra — é slot de fonte.** ⛔ Sai da contagem de regras e passa
>    a nota abaixo.
>
> ✅ Agora **status ⚪ = 5** e **lista 5 = 5 regras**. Reconciliado.

⚠️ **Não é regra, e por isso fora do universo:** **F-22** (alvo de porta-agulha) —
**slot de fonte complementar opcional**, indicador de desempenho, ⛔ não bloqueante
do V1.

---

## QUADRO-RESUMO

| status | nº |
|---|---|
| ✅ **PRONTA** | **62** |
| 🔧 **PRONTA COM DEPENDÊNCIA TÉCNICA** | **12** |
| 🟡 **PARCIAL** | **3** |
| 🔴 **BLOQUEADA** | **9** |
| ⚪ **FORA DO V1** | **5** |
| **total de regras classificadas** | **91** |
---

## 🧪 TESTE DE UNIVERSO — aplicação de **E-44**

| verificação | resultado |
|---|---|
| **universo declarado** | **91 regras** |
| IDs únicos | **91** ✅ |
| duplicados | **nenhum** ✅ |
| ausentes | **nenhum** ✅ |
| exatamente **um** status primário por ID | ✅ |
| soma dos status = universo | **62 + 12 + 3 + 9 + 5 = 91** ✅ |

> ⚠️ **As listas derivadas PODEM se sobrepor**, porque agrupam por **dependência**,
> ⛔ não por status. Sobreposições declaradas:
>
> | lista | IDs | relação com o status primário |
> |---|---|---|
> | **2 · Q-01/02/03** | **13** | 12 são 🔧 · **T8 é 🔴** |
> | **3 · fonte complementar** | **8** | 3 são 🟡 · 5 são 🔴 |
> | **4 · decisão médica** | **3** | todas 🔴 (R3.7 · R3.8 · T4) |
> | **1 · pode virar código** | **62** | = status ✅, sem sobreposição |
> | **5 · fora do V1** | **5** | = status ⚪, sem sobreposição |
>
> ⛔ **`T8` aparece nas listas 2 e nas 🔴** — sobreposição **declarada**, não erro.
> ⛔ **`F-22`** está fora do universo por ser **slot**, não regra.


## Por natureza

| natureza | pronta | dep. téc. | parcial | bloqueada | fora |
|---|---|---|---|---|---|
| **conteúdo clínico** | 34 | 3 | 3 | 6 | 3 |
| **comportamento** | 28 | 7 | — | 1 | — |
| **cálculo** | 2 | 1 | — | 1 | — |
| **dado regulatório** | — | — | 1 | 1 | — |
| **tradução** | 4 | 1 | — | — | — |
| **requisito técnico** | — | 8 | — | 2 | 1 |

*(itens acumulam natureza; a soma por linha não é o total.)*

> ### ⚠️ A leitura que a matriz permite
>
> **Nenhuma regra está bloqueada por falta de medicina da fonte-mãe.** As nove
> bloqueadas dividem-se em: **5 por fonte complementar brasileira ausente**,
> **3 por decisão médica do autor**, **1 por decisão arquitetural (Q-01)**.
>
> ⛔ **Isto não significa que o conteúdo está clinicamente correto** — significa
> que ele está **documentalmente completo e rastreável**. A correção é a sua
> revisão, e ela ainda não aconteceu.
