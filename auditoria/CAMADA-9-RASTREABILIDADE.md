# Camada 9 — Rastreabilidade do conteúdo clínico

> Gerado por `node scripts/valida-rastreabilidade.cjs`. Nenhum código alterado.
> Mede se cada módulo declara a diretriz de onde veio. NÃO julga se a diretriz
> é a certa nem se sustenta a afirmação — isso é a auditoria científica.

- Módulos com conteúdo crítico: **30**
- Com diretriz declarada: **30**
- **Sem diretriz declarada: 0**
- Diretrizes cadastradas: **43**

## Cobertura por módulo

| módulo | afirmações críticas | diretrizes declaradas |
|---|---:|---|
| Sepse, choque séptico e antimicrobianos | 1162 | `ssc_sepsis_2021`, `ssc_sepsis_2021`, `sepsis3_definitions_2016`, `sepsis3_definitions_2016`, `sofa_score_original`, `sofa_score_original`, `idsa_antimicrobials`, `anvisa_microbiota_2021`, `anvisa_microbiota_2021`, `cdc_isolation_2007_update`, `ards_ventilation_ardsnett`, `medcampus_sepse_choque_adultos_v14` |
| Anafilaxia | 627 | `wao_anaphylaxis_2020` |
| PCR no adulto (ACLS) | 515 | `aha_acls_2020`, `medcampus_acls_adultos_v13`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Acidente vascular cerebral | 432 | `medcampus_avc_adultos_v14`, `sbdcv_avc_fase_aguda` |
| Ventilação mecânica | 259 | `ardsnet_protective_vent_2000`, `einstein_vmi_adultos_2025` |
| Edema agudo de pulmão | 253 | `esc_hf_acute_decomp_2021` |
| Síndromes coronarianas agudas | 229 | `medcampus_sca_adultos_v10` |
| Drogas vasoativas | 228 | `vasopressors_ssc_2021` |
| Sedoanalgesia | 198 | `padis_devlin_2018_abcdef`, `einstein_politica_sedacao_pol0360`, `millers_anesthesia_review_2025` |
| Intubação em sequência rápida | 162 | `difficult_airway_rsi_2022` |
| Cetoacidose diabética e estado hiperosmolar | 145 | `ada_dka_hhs_2024` |
| Calculadoras clínicas | 92 | `usp_medicina_intensiva_5ed_2022`, `knaus_apache2_1985`, `einstein_tep_v3`, `moreno_saps3_2005` |
| Tromboembolia pulmonar | 89 | `medcampus_tep_adultos_v13`, `einstein_tep_v3` |
| Correções eletrolíticas | 79 | `electrolyte_disorders_core_2026` |
| Pré-eclâmpsia e eclâmpsia | 77 | `einstein_msd_preeclampsia_2025`, `guia_obstetrico_preeclampsia_2025` |
| Farmacologia do ACLS | 69 | `medcampus_acls_adultos_v13`, `bula_adenosina_fresenius_2023`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Intoxicações exógenas | 66 | `einstein_intoxicacao_exogena_adultos`, `einstein_intoxicacao_metanol_2025` |
| Crises convulsivas | 58 | `mullhi_status_epilepticus_2025` |
| Choque | 54 | `einstein_choque_adulto_2024` |
| Traumatismo cranioencefálico | 48 | `einstein_hic_adultos_2024`, `einstein_tce_pathway` |
| Taquicardia | 41 | `medcampus_arritmias_adultos_v10`, `bula_adenosina_fresenius_2023`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Politrauma | 35 | `dir_uue_10_politrauma_2025`, `sabiston_20ed` |
| Bradicardia | 24 | `medcampus_arritmias_adultos_v10`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Abdome agudo | 19 | `sabiston_20ed` |
| Cuidados pós-PCR | 17 | `medcampus_acls_adultos_v13`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| PCR na gestação | 17 | `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Ritmos de parada | 17 | `medcampus_acls_adultos_v13`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Insuficiência respiratória | 17 | `usp_medicina_intensiva_5ed_2022` |
| Causas reversíveis | 14 | `medcampus_acls_adultos_v13`, `medcampus_acls_guia_rapido_v1`, `aha_ecc_2025_destaques_ptbr` |
| Engasgo (OVACE) | 11 | `aha_ecc_2025_destaques_ptbr` |

---

### O que fazer com isto

Cada módulo sem diretriz declarada é um bloqueio para a auditoria científica:
não se sabe contra qual documento conferir suas afirmações. Preencher
`modules_using` em `protocols/guidelines_metadata.json` é o passo que destrava
a Camada 2 daquele módulo — e é decisão de quem assina o conteúdo, porque
dizer de qual diretriz um protocolo veio é afirmação clínica.
