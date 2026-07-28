# Camada 9 — Rastreabilidade do conteúdo clínico

> Gerado por `node scripts/valida-rastreabilidade.cjs`. Nenhum código alterado.
> Mede se cada módulo declara a diretriz de onde veio. NÃO julga se a diretriz
> é a certa nem se sustenta a afirmação — isso é a auditoria científica.

- Módulos com conteúdo crítico: **28**
- Com diretriz declarada: **10**
- **Sem diretriz declarada: 18**
- Diretrizes cadastradas: **16**

## Cobertura por módulo

| módulo | afirmações críticas | diretrizes declaradas |
|---|---:|---|
| Sepse, choque séptico e antimicrobianos | 1168 | `ssc_sepsis_2021`, `ssc_sepsis_2021`, `sepsis3_definitions_2016`, `sepsis3_definitions_2016`, `sofa_score_original`, `sofa_score_original`, `idsa_antimicrobials`, `anvisa_microbiota_2021`, `anvisa_microbiota_2021`, `cdc_isolation_2007_update`, `ards_ventilation_ardsnett` |
| Anafilaxia | 627 | `wao_anaphylaxis_2020` |
| PCR no adulto (ACLS) | 514 | `aha_acls_2020` |
| Acidente vascular cerebral | 410 | `medcampus_avc_adultos_v14` |
| Ventilação mecânica | 254 | `ardsnet_protective_vent_2000` |
| Edema agudo de pulmão | 253 | `esc_hf_acute_decomp_2021` |
| Drogas vasoativas | 228 | `vasopressors_ssc_2021` |
| Síndromes coronarianas agudas | 216 | **— nenhuma —** |
| Sedoanalgesia | 184 | **— nenhuma —** |
| Intubação em sequência rápida | 162 | `difficult_airway_rsi_2022` |
| Cetoacidose diabética e estado hiperosmolar | 145 | `ada_dka_hhs_2024` |
| Calculadoras clínicas | 80 | **— nenhuma —** |
| Correções eletrolíticas | 79 | `electrolyte_disorders_core_2026` |
| Tromboembolia pulmonar | 79 | **— nenhuma —** |
| Farmacologia do ACLS | 61 | **— nenhuma —** |
| Pré-eclâmpsia e eclâmpsia | 61 | **— nenhuma —** |
| Crises convulsivas | 49 | **— nenhuma —** |
| Intoxicações exógenas | 41 | **— nenhuma —** |
| Traumatismo cranioencefálico | 40 | **— nenhuma —** |
| Taquicardia | 32 | **— nenhuma —** |
| Politrauma | 31 | **— nenhuma —** |
| Choque | 25 | **— nenhuma —** |
| Abdome agudo | 19 | **— nenhuma —** |
| Bradicardia | 18 | **— nenhuma —** |
| Cuidados pós-PCR | 17 | **— nenhuma —** |
| Ritmos de parada | 17 | **— nenhuma —** |
| Causas reversíveis | 16 | **— nenhuma —** |
| Insuficiência respiratória | 11 | **— nenhuma —** |

### modulo-sem-diretriz — erro (18)

- "Síndromes coronarianas agudas" tem 216 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Sedoanalgesia" tem 184 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Calculadoras clínicas" tem 80 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Tromboembolia pulmonar" tem 79 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Farmacologia do ACLS" tem 61 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Pré-eclâmpsia e eclâmpsia" tem 61 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Crises convulsivas" tem 49 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Intoxicações exógenas" tem 41 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Traumatismo cranioencefálico" tem 40 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Taquicardia" tem 32 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Politrauma" tem 31 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Choque" tem 25 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Abdome agudo" tem 19 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Bradicardia" tem 18 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Cuidados pós-PCR" tem 17 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Ritmos de parada" tem 17 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Causas reversíveis" tem 16 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json
- "Insuficiência respiratória" tem 11 afirmações de risco crítico ou alto e NENHUMA diretriz declarada em guidelines_metadata.json

## Fonte que o próprio código já declara — para você confirmar

> Estes módulos citam diretriz em comentário ou campo de origem, mas a citação
> não está ligada a `guidelines_metadata.json`. A coluna é o que o CÓDIGO
> afirma — **não é a minha conclusão de qual diretriz governa o módulo.**
> Confirme e eu preencho `modules_using`.

| módulo | o que o código declara |
|---|---|
| Síndromes coronarianas agudas | `AHA/ACC e ESC 2023 (Síndromes Coronarianas` |
| Sedoanalgesia | — nada declarado — |
| Calculadoras clínicas | `Cockcroft-Gault usa (140 − idade)` |
| Tromboembolia pulmonar | `ESC 2019 · AHA 2011 (updated) · ACCP/CHEST` |
| Farmacologia do ACLS | `ACLS.` · `AHA 2025)` · `AHA ACLS 2025` |
| Pré-eclâmpsia e eclâmpsia | — nada declarado — |
| Crises convulsivas | — nada declarado — |
| Intoxicações exógenas | — nada declarado — |
| Traumatismo cranioencefálico | — nada declarado — |
| Taquicardia | `ACLS de Taquicardia no adulto com pulso (AHA` · `ACLS.` · `AHA 2025)` · `AHA 2025` |
| Politrauma | — nada declarado — |
| Choque | `Surviving Sepsis Campaign` |
| Abdome agudo | — nada declarado — |
| Bradicardia | `ACLS de Bradicardia no adulto com pulso (AHA` · `ACLS.` · `AHA 2020+/2025):` · `AHA 2025)` |
| Cuidados pós-PCR | — nada declarado — |
| Ritmos de parada | — nada declarado — |
| Causas reversíveis | — nada declarado — |
| Insuficiência respiratória | — nada declarado — |

---

### O que fazer com isto

Cada módulo sem diretriz declarada é um bloqueio para a auditoria científica:
não se sabe contra qual documento conferir suas afirmações. Preencher
`modules_using` em `protocols/guidelines_metadata.json` é o passo que destrava
a Camada 2 daquele módulo — e é decisão de quem assina o conteúdo, porque
dizer de qual diretriz um protocolo veio é afirmação clínica.
