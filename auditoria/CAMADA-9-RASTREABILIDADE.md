# Camada 9 — Rastreabilidade do conteúdo clínico

> Gerado por `node scripts/valida-rastreabilidade.cjs`. Nenhum código alterado.
> Mede se cada módulo declara a diretriz de onde veio. NÃO julga se a diretriz
> é a certa nem se sustenta a afirmação — isso é a auditoria científica.

- Módulos com conteúdo crítico: **28**
- Com diretriz declarada: **18**
- **Sem diretriz declarada: 10**
- Diretrizes cadastradas: **21**

## Cobertura por módulo

| módulo | afirmações críticas | diretrizes declaradas |
|---|---:|---|
| Sepse, choque séptico e antimicrobianos | 1162 | `ssc_sepsis_2021`, `ssc_sepsis_2021`, `sepsis3_definitions_2016`, `sepsis3_definitions_2016`, `sofa_score_original`, `sofa_score_original`, `idsa_antimicrobials`, `anvisa_microbiota_2021`, `anvisa_microbiota_2021`, `cdc_isolation_2007_update`, `ards_ventilation_ardsnett`, `medcampus_sepse_choque_adultos_v14` |
| Anafilaxia | 627 | `wao_anaphylaxis_2020` |
| PCR no adulto (ACLS) | 514 | `aha_acls_2020`, `medcampus_acls_adultos_v13` |
| Acidente vascular cerebral | 419 | `medcampus_avc_adultos_v14` |
| Ventilação mecânica | 254 | `ardsnet_protective_vent_2000` |
| Edema agudo de pulmão | 253 | `esc_hf_acute_decomp_2021` |
| Síndromes coronarianas agudas | 229 | `medcampus_sca_adultos_v10` |
| Drogas vasoativas | 228 | `vasopressors_ssc_2021` |
| Sedoanalgesia | 184 | **— nenhuma —** |
| Intubação em sequência rápida | 162 | `difficult_airway_rsi_2022` |
| Cetoacidose diabética e estado hiperosmolar | 145 | `ada_dka_hhs_2024` |
| Tromboembolia pulmonar | 87 | `medcampus_tep_adultos_v13` |
| Calculadoras clínicas | 80 | **— nenhuma —** |
| Correções eletrolíticas | 79 | `electrolyte_disorders_core_2026` |
| Farmacologia do ACLS | 61 | `medcampus_acls_adultos_v13` |
| Pré-eclâmpsia e eclâmpsia | 61 | **— nenhuma —** |
| Crises convulsivas | 49 | **— nenhuma —** |
| Intoxicações exógenas | 41 | **— nenhuma —** |
| Traumatismo cranioencefálico | 40 | **— nenhuma —** |
| Taquicardia | 39 | `medcampus_arritmias_adultos_v10` |
| Politrauma | 31 | **— nenhuma —** |
| Choque | 25 | **— nenhuma —** |
| Abdome agudo | 19 | **— nenhuma —** |
| Bradicardia | 18 | `medcampus_arritmias_adultos_v10` |
| Cuidados pós-PCR | 17 | `medcampus_acls_adultos_v13` |
| Ritmos de parada | 17 | `medcampus_acls_adultos_v13` |
| Causas reversíveis | 14 | `medcampus_acls_adultos_v13` |
| Insuficiência respiratória | 11 | **— nenhuma —** |

### modulo-sem-diretriz — erro (10)

- "Sedoanalgesia" tem 184 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Calculadoras clínicas" tem 80 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Pré-eclâmpsia e eclâmpsia" tem 61 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Crises convulsivas" tem 49 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Intoxicações exógenas" tem 41 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Traumatismo cranioencefálico" tem 40 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Politrauma" tem 31 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Choque" tem 25 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Abdome agudo" tem 19 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Insuficiência respiratória" tem 11 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json

## Fonte que o próprio código já declara — para você confirmar

> Estes módulos citam diretriz em comentário ou campo de origem, mas a citação
> não está ligada a `guidelines_metadata.json`. A coluna é o que o CÓDIGO
> afirma — **não é a minha conclusão de qual diretriz governa o módulo.**
> Confirme e eu preencho `modules_using`.

| módulo | o que o código declara |
|---|---|
| Sedoanalgesia | — nada declarado — |
| Calculadoras clínicas | `Cockcroft-Gault usa (140 − idade)` |
| Pré-eclâmpsia e eclâmpsia | — nada declarado — |
| Crises convulsivas | — nada declarado — |
| Intoxicações exógenas | — nada declarado — |
| Traumatismo cranioencefálico | — nada declarado — |
| Politrauma | — nada declarado — |
| Choque | `Surviving Sepsis Campaign` |
| Abdome agudo | — nada declarado — |
| Insuficiência respiratória | — nada declarado — |

---

### O que fazer com isto

Cada módulo sem diretriz declarada é um bloqueio para a auditoria científica:
não se sabe contra qual documento conferir suas afirmações. Preencher
`modules_using` em `protocols/guidelines_metadata.json` é o passo que destrava
a Camada 2 daquele módulo — e é decisão de quem assina o conteúdo, porque
dizer de qual diretriz um protocolo veio é afirmação clínica.
