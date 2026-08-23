# Camada 9 — Rastreabilidade do conteúdo clínico

> Gerado por `node scripts/valida-rastreabilidade.cjs`. Nenhum código alterado.
> Mede se cada módulo declara a diretriz de onde veio. NÃO julga se a diretriz
> é a certa nem se sustenta a afirmação — isso é a auditoria científica.

- Módulos com conteúdo crítico: **31**
- Com diretriz declarada: **31**
- **Sem diretriz declarada: 0**
- Diretrizes cadastradas: **48**

## Cobertura por módulo

| módulo | afirmações críticas | diretrizes declaradas |
|---|---:|---|
| PCR no adulto (ACLS) | 515 | `aha_acls_2020`, `medcampus_acls_adultos_v13`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr`, `aha_2025_parte9_acesso_vascular` |
| Sepse, choque séptico e antimicrobianos | 290 | `ssc_sepsis_2021`, `ssc_sepsis_2021`, `sepsis3_definitions_2016`, `sepsis3_definitions_2016`, `sofa_score_original`, `sofa_score_original`, `idsa_antimicrobials`, `anvisa_microbiota_2021`, `anvisa_microbiota_2021`, `cdc_isolation_2007_update`, `ards_ventilation_ardsnett`, `medcampus_sepse_choque_adultos_v14` |
| Anafilaxia | 279 | `wao_anaphylaxis_2020` |
| Sedoanalgesia | 260 | `padis_devlin_2018_abcdef`, `einstein_politica_sedacao_pol0360`, `millers_anesthesia_review_2025` |
| Drogas vasoativas | 240 | `vasopressors_ssc_2021` |
| Acidente vascular cerebral | 222 | `medcampus_avc_adultos_v14`, `sbdcv_avc_fase_aguda` |
| Intubação em sequência rápida | 173 | `difficult_airway_rsi_2022` |
| Ventilação mecânica | 149 | `ardsnet_protective_vent_2000`, `einstein_vmi_adultos_2025` |
| Edema agudo de pulmão | 128 | `esc_hf_acute_decomp_2021` |
| Tromboembolia pulmonar | 113 | `medcampus_tep_adultos_v13`, `einstein_tep_v3` |
| Síndromes coronarianas agudas | 102 | `medcampus_sca_adultos_v10` |
| Calculadoras clínicas | 99 | `usp_medicina_intensiva_5ed_2022`, `knaus_apache2_1985`, `einstein_tep_v3`, `moreno_saps3_2005` |
| Pré-eclâmpsia e eclâmpsia | 86 | `einstein_msd_preeclampsia_2025`, `guia_obstetrico_preeclampsia_2025` |
| Correções eletrolíticas | 81 | `electrolyte_disorders_core_2026`, `pa_psa_hipercalemia_insulina` |
| Intoxicações exógenas | 76 | `einstein_intoxicacao_exogena_adultos`, `einstein_intoxicacao_metanol_2025` |
| Crises convulsivas | 72 | `mullhi_status_epilepticus_2025` |
| Taquicardia | 66 | `medcampus_arritmias_adultos_v10`, `bula_adenosina_fresenius_2023`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Farmacologia do ACLS | 64 | `medcampus_acls_adultos_v13`, `bula_adenosina_fresenius_2023`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Choque | 64 | `einstein_choque_adulto_2024` |
| Cetoacidose diabética e estado hiperosmolar | 63 | `ada_dka_hhs_2024` |
| Traumatismo cranioencefálico | 45 | `einstein_hic_adultos_2024`, `einstein_tce_pathway` |
| Politrauma | 44 | `dir_uue_10_politrauma_2025`, `sabiston_20ed` |
| Bradicardia | 31 | `medcampus_arritmias_adultos_v10`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Abdome agudo | 22 | `sabiston_20ed` |
| Ritmos de parada | 20 | `medcampus_acls_adultos_v13`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Insuficiência respiratória | 20 | `usp_medicina_intensiva_5ed_2022` |
| PCR na gestação | 18 | `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Engasgo (OVACE) | 13 | `aha_ecc_2025_destaques_ptbr` |
| Cuidados pós-PCR | 13 | `medcampus_acls_adultos_v13`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Injúria renal aguda | 12 | `electrolyte_disorders_core_2026`, `esc_hf_acute_decomp_2021`, `kdigo_aki_2012`, `pa_psa_hipercalemia_insulina`, `ukka_hipercalemia_aguda_2023`, `rafique_hipercalemia_consenso_2021` |
| Causas reversíveis | 2 | `medcampus_acls_adultos_v13`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |

### sem-data-de-revisao — aviso (48)

- "ssc_sepsis_2021" não registra data de última revisão
- "sepsis3_definitions_2016" não registra data de última revisão
- "sofa_score_original" não registra data de última revisão
- "idsa_antimicrobials" não registra data de última revisão
- "anvisa_microbiota_2021" não registra data de última revisão
- "cdc_isolation_2007_update" não registra data de última revisão
- "ards_ventilation_ardsnett" não registra data de última revisão
- "aha_acls_2020" não registra data de última revisão
- "vasopressors_ssc_2021" não registra data de última revisão
- "electrolyte_disorders_core_2026" não registra data de última revisão
- "difficult_airway_rsi_2022" não registra data de última revisão
- "esc_hf_acute_decomp_2021" não registra data de última revisão
- "ada_dka_hhs_2024" não registra data de última revisão
- "ardsnet_protective_vent_2000" não registra data de última revisão
- "wao_anaphylaxis_2020" não registra data de última revisão
- "medcampus_avc_adultos_v14" não registra data de última revisão
- "medcampus_sca_adultos_v10" não registra data de última revisão
- "medcampus_arritmias_adultos_v10" não registra data de última revisão
- "medcampus_tep_adultos_v13" não registra data de última revisão
- "medcampus_sepse_choque_adultos_v14" não registra data de última revisão
- "medcampus_acls_adultos_v13" não registra data de última revisão
- "bula_adenosina_fresenius_2023" não registra data de última revisão
- "medcampus_acls_guia_rapido_v1" não registra data de última revisão
- "einstein_choque_adulto_2024" não registra data de última revisão
- "einstein_intoxicacao_exogena_adultos" não registra data de última revisão
- "einstein_intoxicacao_metanol_2025" não registra data de última revisão
- "mullhi_status_epilepticus_2025" não registra data de última revisão
- "einstein_msd_preeclampsia_2025" não registra data de última revisão
- "padis_devlin_2018_abcdef" não registra data de última revisão
- "einstein_politica_sedacao_pol0360" não registra data de última revisão
- "einstein_vmi_adultos_2025" não registra data de última revisão
- "einstein_hic_adultos_2024" não registra data de última revisão
- "einstein_tce_pathway" não registra data de última revisão
- "dir_uue_10_politrauma_2025" não registra data de última revisão
- "millers_anesthesia_review_2025" não registra data de última revisão
- "sabiston_20ed" não registra data de última revisão
- "usp_medicina_intensiva_5ed_2022" não registra data de última revisão
- "aha_ecc_2025_destaques_ptbr" não registra data de última revisão
- "knaus_apache2_1985" não registra data de última revisão
- "einstein_tep_v3" não registra data de última revisão
- "guia_obstetrico_preeclampsia_2025" não registra data de última revisão
- "moreno_saps3_2005" não registra data de última revisão
- "sbdcv_avc_fase_aguda" não registra data de última revisão
- "kdigo_aki_2012" não registra data de última revisão
- "pa_psa_hipercalemia_insulina" não registra data de última revisão
- "aha_2025_parte9_acesso_vascular" não registra data de última revisão
- "ukka_hipercalemia_aguda_2023" não registra data de última revisão
- "rafique_hipercalemia_consenso_2021" não registra data de última revisão

---

### O que fazer com isto

Cada módulo sem diretriz declarada é um bloqueio para a auditoria científica:
não se sabe contra qual documento conferir suas afirmações. Preencher
`modules_using` em `protocols/guidelines_metadata.json` é o passo que destrava
a Camada 2 daquele módulo — e é decisão de quem assina o conteúdo, porque
dizer de qual diretriz um protocolo veio é afirmação clínica.
