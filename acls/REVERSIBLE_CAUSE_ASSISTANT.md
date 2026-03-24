## Assistente de Hs e Ts

Esta V1 e heuristica, deterministica e explicavel. Ela nao diagnostica, nao muda o ramo do ACLS e nao executa condutas automaticamente.

### O que o assistente faz

- avalia cada H/T usando apenas dados estruturados ja registrados no caso
- gera um ranking contextual das causas reversiveis mais uteis de investigar naquele momento
- explica por que cada causa subiu, o que pesa contra e quais dados ainda faltam
- sugere checagens e acoes compativeis ja cadastradas no protocolo

### Entradas usadas

- `stateId` atual
- painel manual de Hs/Ts: `status`, `evidence`, `actionsTaken`, `responseObserved`
- `encounterSummary`
- `operationalMetrics`
- `timeline` do caso

### Arquitetura

O assistente agora esta organizado em 3 camadas:

1. `feature extraction`
2. `heuristic scoring`
3. `presentation`

`feature extraction` transforma estado, timeline e painel manual em sinais estruturados.

`heuristic scoring` aplica pesos explicitos sobre essas features.

`presentation` produz `topThree`, `explanation`, `missingData`, `suggestedChecks` e `compatibleActions`.

### Principios de calibracao

- suspeita manual previa pesa mais do que texto solto
- compatibilidade com ritmo ajuda, mas nao decide sozinha
- causa ja abordada continua no radar se nao houve melhora
- melhora observada reduz suspeita mais do que o simples fato de uma acao ter sido registrada
- palavras-chave sao agrupadas por sinais clinicos e entram com teto de contribuicao para evitar dominancia por ruido textual

### Features estruturadas usadas

As principais features estruturadas ou derivadas hoje sao:

- `currentRhythm`
- `cyclesCompleted`
- `shocksDelivered`
- `hasRepeatedShockableRhythm`
- `hasPersistentNonShockableRhythm`
- `hasDifficultVentilation`
- `hasOxygenationCompromise`
- `hasCapnographyMention`
- `hasLowEtco2`
- `hasHemorrhageOrVolumeLoss`
- `hasPoorPerfusionContext`
- `hasRenalOrMetabolicContext`
- `hasHypothermiaContext`
- `hasToxicExposureContext`
- `hasTraumaOrPericardialContext`
- `hasThoracicPressureContext`
- `hasThromboembolicContext`
- `hasIschemicCoronaryContext`
- `manualSuspicionByCause`
- `addressedByCause`
- `improvementObservedByCause`
- `noImprovementObservedByCause`

Quando uma feature estruturada ja cobre um sinal, o score evita depender novamente do mesmo sinal como texto solto.

### Como os pesos e regras estao organizados

O motor usa dois blocos explicitos:

- `HEURISTIC_WEIGHTS`
- `CAUSE_METADATA`

`HEURISTIC_WEIGHTS` organiza os pesos por grupo:

- `manual`
- `evidence`
- `actions`
- `response`
- `context`
- `thresholds`

`CAUSE_METADATA` organiza os sinais por causa:

- `evidenceSignals`
- `actionSignals`
- `requiredMissingData`
- `optionalMissingData`
- `suggestedChecks`

Isso permite revisar e calibrar o assistente sem espalhar numeros magicos pela logica.

### Como o ranking e calculado

O motor combina sinais simples e revisaveis:

- suspeita manual previa
- causa ja abordada
- features estruturadas derivadas do caso
- sinais de evidencia encontrados em `evidence`
- sinais de acao encontrados em `actionsTaken`
- resposta observada com ou sem melhora
- compatibilidade com ritmo atual
- PCR refrataria apos choques repetidos, quando aplicavel
- persistencia apos ciclos repetidos
- contexto compativel registrado ao longo do caso

Os sinais textuais entram como fallback capado e agrupado. Uma palavra-chave isolada nao deve dominar o ranking sozinha, e texto livre nao deve duplicar uma feature estruturada equivalente.

Os niveis resultantes sao:

- `low`
- `medium`
- `high`

A confianca continua propositalmente conservadora:

- `low`
- `moderate`

### Explicabilidade

Cada causa retorna:

- `supportingEvidence`
- `counterEvidence`
- `missingData`
- `suggestedChecks`
- `compatibleActions`
- `explanation`

Se os dados forem insuficientes, isso aparece explicitamente na explicacao. `missingData` prioriza itens acionaveis e curtos.

### Missing data

Cada causa agora separa:

- `requiredMissingData`
- `optionalMissingData`

O runtime prioriza os dados faltantes mais relevantes e limita a lista para evitar ruido visual.
Se um dado ja esta presente como feature estruturada, ele deixa de aparecer como faltante generico.

### Como expandir

As regras ficam em [`reversible-cause-assistant.ts`](./reversible-cause-assistant.ts):

- ajuste `CAUSE_METADATA` para novos sinais, checagens e dados faltantes
- mantenha pesos em `HEURISTIC_WEIGHTS`
- prefira regras pequenas e revisaveis
- nao adicione inferencia livre nem automacao de conduta

Ao adicionar um novo sinal:

- prefira sinal clinico agrupado em vez de palavra-chave isolada
- capriche no nome do sinal, porque ele pode aparecer em `supportingEvidence`
- teste a mudanca contra cenarios simulados parecidos para verificar estabilidade

### Cenarios simulados

Os testes cobrem cenarios representativos para:

- hipoxia
- hipovolemia
- tamponamento cardiaco
- pneumotorax hipertensivo
- trombose pulmonar
- trombose coronariana
- acidose
- hipo/hipercalemia
- hipotermia
- toxinas

Tambem existem checks de robustez para:

- palavra-chave isolada nao dominar o ranking
- causa abordada sem melhora continuar relevante
- melhora observada reduzir suspeita
- pequenas variacoes irrelevantes de texto nao mudarem radicalmente o top 3
- coexistencia de duas causas plausiveis sem colapso da explicabilidade
- feature estruturada pesar mais do que texto fraco
- `missingData` encolher quando sinais relevantes ja existem
- diferenciar melhor pneumotorax hipertensivo e tamponamento quando o contexto estruturado diverge

### Limitacoes conhecidas

- a heuristica depende da qualidade do registro estruturado
- ainda depende de texto livre para varios sinais porque o painel manual atual nao expoe todos esses dados como campos dedicados
- ainda nao usa sinais numericos ricos quando eles nao estiverem registrados de forma consistente no caso
- o ranking continua conservador por desenho; em cenarios muito incompletos ele prioriza honestidade sobre assertividade

### Logging

O assistente registra eventos passivos de auditoria:

- `ranking_generated`
- `priority_changed`
- `missing_data_highlighted`
- `top_three_presented`

Esses eventos servem para rastrear o comportamento do assistente sem alterar o fluxo clinico.
