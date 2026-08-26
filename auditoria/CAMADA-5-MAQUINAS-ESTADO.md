# Camada 5 — Auditoria das máquinas de estado

> Gerado por `node scripts/auditoria-maquinas-estado.cjs`. Nenhum código alterado.
> Analisa ESTRUTURA do grafo, não conduta clínica.

- Árvores analisadas: **20**
- Erros estruturais: **0**
- Avisos: **21**

## Visão por árvore

| árvore | nós | alcançáveis | finais | achados |
|---|---:|---:|---:|---:|
| coronary-decision-tree (coronaryDecisionTree) | 95 | 95 | 9 | 13 |
| ira-decision-tree (iraDecisionTree) | 74 | 74 | 8 | 7 |
| anaphylaxis-decision-tree (anaphylaxisDecisionTree) | 26 | 26 | 7 | 1 |
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
| escolha-sem-efeito | aviso | 21 |

### escolha-sem-efeito (21)

| árvore | nó | detalhe |
|---|---|---|
| anaphylaxis-decision-tree (anaphylaxisDecisionTree) | `severity_grade` | opções grade2, grade3 levam todas a "immediate_im_epinephrine" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `atalhos_coronarianas` | opções completo, ecg_pronto, reperfusao, antitromboticos levam todas a "ecg_tempo" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `portao_ajuda_grupo_a` | opções afasta, incerto levam todas a "portao_grupo_b" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `portao_ajuda_grupo_b` | opções afasta, incerto levam todas a "aas_check" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `bb_ajuda_pr` | opções nao, sim, indeterminado levam todas a "terapia_vereditos" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `ecg` | opções sim, nao levam todas a "portao_grupo_a" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `ecg_ajuda_supra` | opções tem, nao_tem, incerto levam todas a "portao_grupo_a" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `ecg_supra_qual` | opções anterior, inferior, incerto levam todas a "stemi_localizacao" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `ecg_supra_qual_2` | opções lateral, incerto levam todas a "stemi_localizacao" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `stemi_cenario_icp` | opções no_local, transferencia levam todas a "stemi_reperfusao" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `ecg_sem_supra` | opções de_winter, posterior levam todas a "ecg_grupoB_oclusao" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `ecg_padroes_wellens` | opções wellens_a, wellens_b levam todas a "wellens_conduta" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `nste_trop` | opções positivo, negativo_alto_risco levam todas a "nste_risco_criterios" — a escolha não muda o fluxo |
| coronary-decision-tree (coronaryDecisionTree) | `nste_risco_manual` | opções alto, intermediario levam todas a "nste_invasiva_precoce" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `motivo_de_entrada` | opções creatinina, eletrolitico, critico, incidental levam todas a "e1_hipercalemia" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `entrada_dados` | opções lab, diurese, sinais, so_paciente levam todas a "e1_hipercalemia" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `atalhos` | opções k, nao_sei levam todas a "e1_hipercalemia" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `obstrucao_check` | opções sim, sonda_nao_drena, rim_unico, nao_sei levam todas a "obstrucao_conduta" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `nefrotoxico_check` | opções exposto, sedimento, rabdo, nada levam todas a "renal_conduta" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `trs_check` | opções sim, nao_sei levam todas a "acionar" — a escolha não muda o fluxo |
| ira-decision-tree (iraDecisionTree) | `reavaliar` | opções piorou, nova_ameaca levam todas a "e1_hipercalemia" — a escolha não muda o fluxo |

