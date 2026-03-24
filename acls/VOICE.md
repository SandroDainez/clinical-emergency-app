# Voz ACLS

## Por que o modelo anterior falhava

O modelo anterior espalhava a coordenação entre:

- `protocol-screen.tsx`
- runtime de voz
- efeitos de áudio
- provider web de captura

Na prática isso abria três riscos:

1. o app podia tentar falar e ouvir quase ao mesmo tempo
2. transcrições atrasadas podiam ser resolvidas contra um estado já mudado
3. o conjunto de comandos válidos podia ficar preso em closure antiga

No web, isso é especialmente ruim porque `SpeechRecognition` não é confiável para “escuta contínua real” ao mesmo tempo em que o app toca áudio.

## Modelo novo: half-duplex guiado por estado

Agora existe um controlador central em `acls/voice-session-controller.ts`.

Ele é o único dono de:

- sessão de voz
- reprodução de orientação
- abertura e fechamento do reconhecimento
- confirmação pendente
- timeout de confirmação
- turn token por estado
- comandos válidos do estado atual
- logs e telemetria de voz

O fluxo operacional é:

1. o estado atual entra no controller
2. o controller toca a orientação completa daquele estado
3. só depois do fim do áudio ele arma a escuta
4. a escuta aceita apenas intents válidas naquele estado
5. ao reconhecer uma intent válida, o controller dispara a mesma action já usada pela UI
6. se o estado mudar, o turn anterior é invalidado e o ciclo recomeça no novo estado

Invariante principal:

- o app nunca deve falar e ouvir ao mesmo tempo

## Invariantes do controller

- existe um único ponto de `startListening`
- existe um único ponto de `stopListening`
- existe um único ponto de `playOutput`
- cada estado recebe um `turn token` com `sessionId`, `turnId` e `stateId`
- transcript capturado com token antigo é descartado
- `allowed intents` sempre vêm do estado atual via `voice-policy`
- a UI não resolve transcript nem inicia reconhecimento diretamente

## Confirmação

A confirmação continua reduzida ao necessário:

- `ROSC`
- baixa confiança
- mudanças mais sensíveis já protegidas pela policy

Comandos operacionais contextuais, como:

- `epinefrina administrada`
- `choque aplicado`
- `antiarrítmico administrado`

executam direto quando a confiança é alta e o estado atual realmente aceita aquilo.

## Camadas

- `components/voice/*`: captura/transcrição
- `acls/voice-policy.ts`: intents válidas por estado
- `acls/voice-resolver.ts`: matching determinístico
- `acls/voice-runtime.ts`: tipos de estado de voz
- `acls/voice-session-controller.ts`: orquestração central half-duplex
- `acls/voice-telemetry.ts`: métricas derivadas do log
- `components/protocol-screen.tsx`: integração fina com UI e engine

## Logs de debug

O controller emite logs temporários e controláveis para depuração:

- modo voz ligado/desligado
- `stateId`
- `turnId`
- intents válidas
- início/fim de áudio
- início/fim de escuta
- transcript recebido
- intent resolvida
- action executada
- transcript descartado por token antigo
- motivo de rejeição

Esses logs ficam atrás da flag:

- `globalThis.__ACLS_VOICE_DEBUG__ = true`

## Limitações conhecidas no web

- `SpeechRecognition` continua sendo uma API frágil e dependente do navegador
- o modelo agora é robusto por ser `half-duplex`, não por manter microfone “sempre aberto”
- o controller evita competição entre áudio e voz, mas o provider web ainda depende do comportamento do Chrome

## Como evoluir provider nativo depois

O provider continua desacoplado da decisão clínica.

Um provider nativo futuro só precisa implementar o contrato de captura em `components/voice/voice-capture-provider.ts`:

- `id`
- `isAvailable()`
- `captureOnce(...)`
- `stop()`

Ele não deve:

- resolver intent
- decidir conduta
- alterar o engine diretamente

Essas decisões continuam em:

- `voice-policy`
- `voice-resolver`
- `voice-runtime`
- `voice-session-controller`
