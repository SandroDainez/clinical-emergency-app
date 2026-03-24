## Debrief e Replay

O debrief do ACLS e uma camada de leitura sobre dados ja registrados no caso. Ele nao altera o fluxo clinico, nao executa condutas e nao muda o comportamento do engine.

### Fontes de dados usadas

- `timeline`
- `encounterSummary`
- `operationalMetrics`
- logging de voz
- registros manuais de Hs e Ts
- insights do assistente de Hs/Ts ja gravados no caso

### O que o debrief gera

- resumo pos-caso estruturado
- linha do tempo resumida
- replay assistivo em steps ordenados
- replay navegavel com agrupamento e filtros
- resumo de Hs/Ts mais priorizadas
- resumo operacional da voz
- export estruturado do debrief
- export textual copiavel
- export JSON para integracoes futuras
- indicadores operacionais de qualidade
- snapshots persistidos localmente para historico de casos

### Como e montado

O agregador principal fica em [`debrief.ts`](./debrief.ts):

- consolida metricas finais do caso
- resume transicoes de ramo
- detecta ROSC
- agrega causas reversiveis priorizadas ao longo da timeline
- resume dados faltantes recorrentes
- integra telemetria de voz existente
- produz modelo exportavel independente da UI
- formata saida em texto e JSON
- calcula indicadores operacionais derivados
- organiza replay em blocos logicos navegaveis

### Arquitetura do export

O export usa 3 passos:

1. `buildAclsDebrief(...)`
2. `buildAclsDebriefExport(...)`
3. formatadores de saida

Formatos atuais:

- texto legivel via `buildAclsDebriefTextExport(...)`
- JSON estruturado via `buildAclsDebriefJsonExport(...)`

O modelo exportavel inclui:

- `metadata`
- `operationalSummary`
- `voiceSummary`
- `causesSummary`
- `timeline`
- `replaySteps`
- `replayBlocks`

### Persistencia e historico local

O ACLS agora pode salvar snapshots locais do caso sem tocar no engine clinico. A persistencia fica desacoplada e usa:

- `buildPersistedAclsCase(...)` para montar o snapshot
- `savePersistedAclsCase(...)` para gravar localmente
- `listPersistedAclsCases(...)` para listar casos anteriores
- `getPersistedAclsCase(...)` para reabrir debrief, replay e export

Cada snapshot persistido inclui:

- `id`
- `savedAt`
- resumo curto do caso
- `encounterSummary`
- indicadores operacionais
- `debrief`
- modelo de export ja derivado

O armazenamento atual usa `localStorage` quando disponivel no web. Fora disso, cai para um adaptador em memoria para nao quebrar a experiencia. Esse fallback e tolerante a falhas, mas nao oferece persistencia duravel entre sessoes.

### Replay navegavel

O replay continua sendo leitura e sintese, mas agora suporta:

- agrupamento por blocos logicos quando possivel
- destaque de eventos criticos
- filtros simples de navegacao

Filtros atuais:

- `all`
- `drugs`
- `shocks`
- `rhythm`
- `voice`
- `causes`

Eventos criticos destacados:

- inicio de RCP
- choques
- epinefrina
- antiarritmico
- reavaliacao de ritmo
- ROSC
- insights do assistente
- eventos de voz relevantes

### Indicadores operacionais

Os indicadores atuais incluem:

- tempo ate primeiro choque
- tempo ate primeira epinefrina
- tempo total do caso
- numero total de ciclos
- numero de choques realizados
- numero de epinefrinas administradas
- numero de antiarritmicos administrados
- numero de transicoes de ramo
- ROSC ocorreu ou nao
- pendencias ou atrasos relevantes
- desvios operacionais registrados
- rejeicoes, timeout e baixa confianca na voz
- causas reversiveis mais persistentemente priorizadas

### Regras de calculo

- tempos usam o primeiro evento do caso como referencia
- primeiro choque vem do primeiro `shock_applied`
- primeira epinefrina vem do primeiro `medication_administered` com `adrenaline`
- tempo total usa o ultimo evento disponivel; se nao houver timeline suficiente, cai para `durationLabel`
- pendencias/atrasos usam relacao entre `medication_due_now` e `medication_administered`
- baixa confianca de voz usa `voice_command.errorCategory = low_confidence`
- indicadores indisponiveis permanecem `undefined` em vez de inferidos

### Limitacoes

- o debrief depende da qualidade da timeline e dos registros manuais
- o replay atual e textual, nao um player temporal completo
- a secao de Hs/Ts usa os insights do assistente registrados no caso; se houver poucos insights, o resumo fica mais enxuto
- o export atual nao gera PDF; ele prepara os dados para isso depois
- alguns atrasos operacionais ainda sao aproximacoes baseadas no que foi registrado, nao em confirmacao clinica externa
- o agrupamento do replay e heuristico e orientado a navegacao, nao a uma reconstrucao temporal perfeita

### Como expandir

- adicionar mais marcos relevantes no replay
- enriquecer a agregacao de Hs/Ts com snapshots mais ricos por prioridade
- gerar PDF ou relatorio compartilhavel a partir do JSON exportado
- criar filtros visuais para auditoria operacional e ensino
