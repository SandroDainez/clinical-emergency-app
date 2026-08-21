# Camada 5 — Auditoria das máquinas de estado

> Gerado por `node scripts/auditoria-maquinas-estado.cjs`. Nenhum código alterado.
> Analisa ESTRUTURA do grafo, não conduta clínica.

- Árvores analisadas: **20**
- Erros estruturais: **0**
- Avisos: **6**

## Visão por árvore

| árvore | nós | alcançáveis | finais | achados |
|---|---:|---:|---:|---:|
| ira-decision-tree (iraDecisionTree) | 60 | 60 | 2 | 4 |
| anaphylaxis-decision-tree (anaphylaxisDecisionTree) | 26 | 26 | 7 | 1 |
| coronary-decision-tree (coronaryDecisionTree) | 27 | 27 | 2 | 1 |
| acls-bradycardia-tree (bradycardiaDecisionTree) | 17 | 17 | 4 | 0 |
| acls-tachycardia-tree (tachycardiaDecisionTree) | 19 | 19 | 3 | 0 |
| acute-abdomen-decision-tree (acuteAbdomenDecisionTree) | 23 | 23 | 2 | 0 |
| avc-decision-tree (avcDecisionTree) | 27 | 27 | 3 | 0 |
| dka-hhs-decision-tree (dkaHhsDecisionTree) | 18 | 18 | 1 | 0 |
| dyspnea-decision-tree (dyspneaDecisionTree) | 29 | 29 | 13 | 0 |
| eap-decision-tree (eapDecisionTree) | 26 | 26 | 4 | 0 |
| eclampsia-decision-tree (eclampsiaDecisionTree) | 17 | 17 | 1 | 0 |
| poisoning-decision-tree (poisoningDecisionTree) | 27 | 27 | 2 | 0 |
| politrauma-decision-tree (politraumaDecisionTree) | 24 | 24 | 4 | 0 |
| rsi-decision-tree (rsiDecisionTree) | 32 | 32 | 2 | 0 |
| seizure-decision-tree (seizureDecisionTree) | 15 | 15 | 3 | 0 |
| sepsis-decision-tree (sepsisDecisionTree) | 24 | 24 | 1 | 0 |
| shock-decision-tree (shockDecisionTree) | 31 | 31 | 16 | 0 |
| tce-decision-tree (tceDecisionTree) | 15 | 15 | 3 | 0 |
| tep-decision-tree (tepDecisionTree) | 24 | 24 | 4 | 0 |
| ventilation-decision-tree (ventilationDecisionTree) | 25 | 25 | 2 | 0 |

## Achados por tipo

| tipo | gravidade | ocorrências |
|---|---|---:|
| escolha-sem-efeito | aviso | 6 |

### escolha-sem-efeito (6)

| árvore | nó | detalhe |
|---|---|---|
| anaphylaxis-decision-tree (anaphylaxisDecisionTree) | `severity_grade` | opções grade2, grade3 levam todas a "immediate_im_epinephrine" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `nste_risco` | opções alto, intermediario levam todas a "nste_invasiva_precoce" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `atalhos` | opções k, nao_sei levam todas a "e1_hipercalemia" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `obstrucao_check` | opções sim, sonda_nao_drena, rim_unico, nao_sei levam todas a "obstrucao_conduta" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `nefrotoxico_check` | opções exposto, sedimento, rabdo, nada levam todas a "renal_conduta" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `trs_check` | opções sim, nao_sei levam todas a "acionar" — a escolha não muda o fluxo |

