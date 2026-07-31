# Camada 5 — Auditoria das máquinas de estado

> Gerado por `node scripts/auditoria-maquinas-estado.cjs`. Nenhum código alterado.
> Analisa ESTRUTURA do grafo, não conduta clínica.

- Árvores analisadas: **19**
- Erros estruturais: **0**
- Avisos: **3**

## Visão por árvore

| árvore | nós | alcançáveis | finais | achados |
|---|---:|---:|---:|---:|
| anaphylaxis-decision-tree (anaphylaxisDecisionTree) | 24 | 24 | 7 | 1 |
| coronary-decision-tree (coronaryDecisionTree) | 21 | 21 | 2 | 1 |
| dka-hhs-decision-tree (dkaHhsDecisionTree) | 17 | 17 | 1 | 1 |
| acls-bradycardia-tree (bradycardiaDecisionTree) | 11 | 11 | 3 | 0 |
| acls-tachycardia-tree (tachycardiaDecisionTree) | 12 | 12 | 2 | 0 |
| acute-abdomen-decision-tree (acuteAbdomenDecisionTree) | 12 | 12 | 2 | 0 |
| avc-decision-tree (avcDecisionTree) | 24 | 24 | 3 | 0 |
| dyspnea-decision-tree (dyspneaDecisionTree) | 26 | 26 | 13 | 0 |
| eap-decision-tree (eapDecisionTree) | 24 | 24 | 4 | 0 |
| eclampsia-decision-tree (eclampsiaDecisionTree) | 16 | 16 | 1 | 0 |
| poisoning-decision-tree (poisoningDecisionTree) | 17 | 17 | 2 | 0 |
| politrauma-decision-tree (politraumaDecisionTree) | 19 | 19 | 4 | 0 |
| rsi-decision-tree (rsiDecisionTree) | 22 | 22 | 1 | 0 |
| seizure-decision-tree (seizureDecisionTree) | 14 | 14 | 3 | 0 |
| sepsis-decision-tree (sepsisDecisionTree) | 23 | 23 | 1 | 0 |
| shock-decision-tree (shockDecisionTree) | 28 | 28 | 16 | 0 |
| tce-decision-tree (tceDecisionTree) | 15 | 15 | 3 | 0 |
| tep-decision-tree (tepDecisionTree) | 20 | 20 | 4 | 0 |
| ventilation-decision-tree (ventilationDecisionTree) | 22 | 22 | 2 | 0 |

## Achados por tipo

| tipo | gravidade | ocorrências |
|---|---|---:|
| escolha-sem-efeito | aviso | 3 |

### escolha-sem-efeito (3)

| árvore | nó | detalhe |
|---|---|---|
| anaphylaxis-decision-tree (anaphylaxisDecisionTree) | `severity_grade` | opções grade2, grade3 levam todas a "immediate_im_epinephrine" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `nste_risco` | opções alto, intermediario levam todas a "nste_invasiva_precoce" — a escolha não muda o fluxo |
| dka-hhs-decision-tree (dkaHhsDecisionTree) | `bicarbonato` | opções ph_69_70, ph_baixo levam todas a "bic_admin" — a escolha não muda o fluxo |

