# MAPA-APP.md — Clinical Emergency Suite

Levantamento da Fase 0.1 do plano UI 2.0. Descreve o que existe hoje, antes de
qualquer mudança visual.

Data do levantamento: 2026-07-27 · commit base: `1fe4bc4`

---

## 1. Stack exato

| Camada | O que é | Versão |
|---|---|---|
| Framework | **React Native + Expo** (não é app web) | Expo `~54.0.33`, RN `0.81.5` |
| React | | `19.1.0` |
| Roteamento | **expo-router** (file-based, `app/`) | `~6.0.23` |
| Web | **react-native-web** (o site é o app RN compilado) | `~0.21.0` |
| Estado | Sem Redux/Zustand. Módulo singleton por engine + `useState` local + `useSyncExternalStore` no i18n | — |
| Styling | **`StyleSheet.create` do React Native** | — |
| Persistência | `expo-sqlite`, Supabase, e `localStorage` no web | — |
| Voz | `expo-speech-recognition` + `expo-speech` | — |
| Áudio | `expo-av` + MP3 pré-gravados | — |
| Ícones | `@expo/vector-icons` + SF Symbols (`expo-symbols`) | — |
| Animação | `react-native-reanimated` | `~4.1.1` |
| Linguagem | TypeScript `~5.9.2` | — |

### ⚠️ Conflito com o plano UI 2.0 — precisa de decisão antes da Fase 2

O plano especifica **shadcn/ui, Radix, Tailwind e Vaul**. Nenhum funciona aqui:

- **Radix / shadcn/ui** são construídos sobre o DOM (`div`, `button`, portals).
  React Native não tem DOM. Só rodariam no build web, quebrando iOS/Android.
- **Vaul** (bottom sheet) é DOM-only, mesma limitação.
- **Tailwind** puro não existe em RN. O equivalente é **NativeWind**, que compila
  classes para objetos de estilo — funciona, mas é outra biblioteca.
- **Lucide** tem porte oficial (`lucide-react-native`) — este é viável.

Equivalentes que preservam a intenção do plano (mesma qualidade, stack certa):

| Plano (web) | Equivalente React Native |
|---|---|
| shadcn/ui + Radix | Componentes próprios em `/components/ui-v2/` sobre primitivas RN |
| Tailwind | NativeWind, **ou** manter `StyleSheet` consumindo os tokens |
| Vaul (bottom sheet) | `@gorhom/bottom-sheet` |
| Lucide | `lucide-react-native` |
| CSS variables | Objeto de tokens + `useColorScheme()` para dark/light |

### ✅ Decisão tomada (2026-07-27)

**Manter o padrão iOS/Android.** Nada de shadcn/ui, Radix, Tailwind ou Vaul —
qualquer uma delas quebraria o build nativo, e o requisito é o app funcionando
nas três plataformas.

Portanto, para as fases seguintes:

- **Tokens**: módulo TypeScript exportando objetos (cores, espaçamento,
  tipografia), consumido por `StyleSheet`. Não são CSS variables — elas não
  existem em React Native.
- **Tema dark/light**: `useColorScheme()` do React Native, com os estilos
  derivados DENTRO do componente. Atenção: `StyleSheet.create` roda no import,
  fora do render; estilo montado ali congela no tema inicial — o mesmo tipo de
  erro que o `tr("literal")` já causou no i18n.
- **Componentes**: próprios, em `/components/ui-v2/`, sobre `View`, `Text`,
  `Pressable`, `Modal` e `FlatList`.
- **Bottom sheet**: `@gorhom/bottom-sheet` (funciona nas três plataformas).
- **Ícones**: `lucide-react-native`, ou seguir com `@expo/vector-icons`, que já
  está no projeto e não adiciona dependência.

O restante do plano UI 2.0 vale integralmente: paleta, escala tipográfica em
`rem`, grade de espaçamento, raios, alvo de toque de 44 px (56 px nos botões
críticos), contraste AA e showcase em `/dev/ui-v2`.

---

## 2. Rotas

Arquivos em `app/` (expo-router):

| Rota | Arquivo | Papel |
|---|---|---|
| `/` | `app/index.tsx` | Landing / entrada |
| `/(tabs)` | `app/(tabs)/index.tsx` | Hub de módulos |
| `/(tabs)/explore` | `app/(tabs)/explore.tsx` | Aba secundária |
| `/(tabs)/sepse` | `app/(tabs)/sepse.tsx` | Atalho para sepse |
| `/modulos/[id]` | `app/modulos/[id].tsx` | **Rota única de todos os 28 módulos** |
| `/paywall` | `app/paywall.tsx` | Assinatura |
| `/session-history` | `app/session-history.tsx` | Histórico de sessões |
| `/session-history/[sessionId]` | idem `/[sessionId].tsx` | Detalhe da sessão |
| `/admin-users` | `app/admin-users.tsx` | Administração |
| `/privacidade` | `app/privacidade.tsx` | Política |
| `/modal` | `app/modal.tsx` | Modal genérico |

**Ponto crítico:** os 28 módulos clínicos não têm rota própria. Todos entram por
`/modulos/[id]`, e `components/clinical-app.tsx` decide qual tela renderizar
comparando `protocolId` — 27 comparações em sequência, com `pcr_adulto` caindo
no fallback `<ProtocolScreen>`. Qualquer migração precisa respeitar esse
despacho central.

---

## 3. Módulos clínicos (28)

Catálogo em `clinical-modules.ts`. Agrupados em `constants/module-groups.ts`.

| id | Título | Motor |
|---|---|---|
| `pcr-adulto` | PCR Adulto | `engine.ts` + `acls/` (o mais complexo) |
| `sepse-adulto` | Sepse / Choque Séptico | `sepsis-engine.ts`, `sepsis-antibiotic-engine.ts` |
| `drogas-vasoativas` | Drogas Vasoativas | `vasoactive-engine.ts` |
| `correcoes-eletroliticas` | Correções eletrolíticas | `electrolyte-engine.ts` |
| `isr-rapida` | ISR — Via aérea | `rsi-engine.ts` |
| `edema-agudo-pulmao` | Edema agudo de pulmão | `eap-engine.ts` |
| `cetoacidose-hiperosmolar` | CAD e estado hiperosmolar | `dka-hhs-engine.ts` |
| `ventilacao-mecanica` | Ventilação mecânica | `ventilation-engine.ts` |
| `anafilaxia` | Anafilaxia | `anafilaxia-engine.ts` |
| `avc` | AVC | `avc-engine.ts` + `avc/` |
| `sindromes-coronarianas` | Síndromes coronarianas | `coronary-syndromes-engine.ts` + `coronary/` |
| `ritmos-acls` | Ritmos de Parada | `acls-rhythms-engine.ts` (**referência estática**) |
| `farmacologia-acls` | Farmacologia no ACLS | `acls-pharmacology-engine.ts` (**referência estática**) |
| `bradicardia-acls` | Bradicardia no ACLS | `acls-bradycardia-engine.ts` (**referência estática**) |
| `taquicardia-acls` | Taquicardia no ACLS | `acls-tachycardia-engine.ts` (**referência estática**) |
| `causas-reversiveis-acls` | Causas Reversíveis (Hs e Ts) | `acls-reversible-causes-engine.ts` (**referência estática**) |
| `pos-pcr-acls` | Cuidados Pós-PCR | `acls-post-rosc-engine.ts` (**referência estática**) |
| `tep` | Tromboembolia Pulmonar | `tep-engine.ts` |
| `pre-eclampsia` | Pré-eclâmpsia / Eclâmpsia | `eclampsia-engine.ts` |
| `sedoanalgesia` | Sedoanalgesia & BNM | `sedation-engine.ts` |
| `calculadoras-clinicas` | Calculadoras Clínicas | `clinical-calculators-engine.ts` |
| `politrauma` | Politrauma | árvore de decisão |
| `tce` | TCE | árvore de decisão |
| `crises-convulsivas` | Crises convulsivas | árvore de decisão |
| `intoxicacoes-exogenas` | Intoxicações exógenas | árvore de decisão |
| `choque` | Choque | árvore de decisão |
| `insuficiencia-respiratoria` | Insuficiência respiratória | árvore de decisão |
| `abdome-agudo` | Abdome agudo | árvore de decisão |

24 arquivos `*-engine.ts` na raiz. `clinical-engine.ts` define os tipos comuns.

---

## 4. Telas por módulo

Dois padrões coexistem:

**a) Telas de fluxo — 15 linhas cada, e a casca leva a UM shell.**

> ⚠️ **Correção (2026-07-27, durante a Fase 6).** A versão original desta seção
> dizia que as telas de fluxo delegavam para `module-flow-shell.tsx`. **Estava
> errado**, e o erro teria custado caro: o shell real é
> `acls-decision-flow-screen.tsx`, usado por **19 módulos**.
> `module-flow-shell.tsx` é usado por apenas 2 (`acls-protocol-screen` e
> `electrolyte-calculator-screen`).

`components/protocol-screen/*-flow-screen.tsx` são casca de 15 linhas: passam uma
árvore de decisão para `acls-decision-flow-screen.tsx`, que roda um
`DecisionTreeEngine` e monta a tela.

**Mudar esse arquivo muda 19 módulos de uma vez** — sepse, anafilaxia, AVC,
coronárias, TEP, CAD, EAP, ventilação, ISR, politrauma, TCE, convulsões,
intoxicações, choque, insuficiência respiratória, abdome agudo, eclâmpsia, e
bradicardia + taquicardia do ACLS.

Ele NÃO é um piloto e NÃO é "mais uma tela" da Fase 6: é o shell da maior parte
do app, com estado próprio (21 referências a `useState`/engine). Migrá-lo é a
Fase 7 inteira num commit, e precisa de estratégia própria — não do processo
tela-a-tela.

**b) Telas próprias (11).** ACLS (`acls-*-screen.tsx`), calculadoras
(`clinical-calculators-screen.tsx`, `vasoactive-calculator-screen.tsx`,
`electrolyte-calculator-screen.tsx`, `sedation-calculator-screen.tsx`) e o
`protocol-screen.tsx` do PCR.

Componentes compartilhados já existentes em `components/protocol-screen/`:
`auxiliary-panel-card`, `protocol-header-card`, `clinical-log-card`,
`debrief-card`, `reversible-causes-card`, `stabilization-first-card`,
`voice-command-card`, `cpr-guidance-card`, `case-history-card`.

E em `components/protocol-screen/template/` já há um embrião de design system:
`ProtocolScreenTemplate`, `StepHeaderBar`, `HeroActionButton`, `DecisionGrid`,
`ActionChecklistCard`, `FixedFooterAction`, `StepSummaryCard`, `VoiceStatusPanel`.

---

## 5. Onde vive cada coisa sensível

| Coisa | Arquivo | Observação |
|---|---|---|
| **Timers / cronômetros** | `engine.ts:100,321,988` (`setInterval` → `tick()`), `getTimers()` em `engine.ts:372` | Scheduler global de 1 s |
| | `components/cpr-metronome-card.tsx` | Metrônomo de compressão |
| | `acls/clinical-clock.ts` | Relógio do caso |
| **Máquina de estados** | `acls/reducer.ts` | Reducer do ACLS, com invariantes que lançam exceção |
| | `acls/orchestrator.ts` | Orquestra efeitos e log |
| | `acls/domain.ts`, `acls/protocol-schema.ts` | Tipos e validação |
| **Comandos de voz** | `acls/voice-intents.ts` | Intents e frases de reconhecimento |
| | `acls/voice-resolver.ts` | Casamento transcrição → intent |
| | `acls/voice-policy.ts` | Quando exigir confirmação |
| | `acls/voice-session-controller.ts` | Ciclo de vida da sessão de voz |
| | `acls/voice-runtime.ts`, `voice-telemetry.ts` | Runtime e métricas |
| | `components/voice/` | Provider de captura (Expo e fallback) |
| **Áudio** | `acls/speech-map.ts`, `speech-queue.ts`, `canonical-audio-manifest.ts` | Fala por `cueId` |
| | `components/audio-session.ts` | Reprodução web/nativa |
| **Persistência** | `lib/clinical-session-store.ts`, `clinical-events.ts`, `clinical-session-history.ts` | Sessões clínicas |
| | `lib/supabase.ts` | Backend |
| | `lib/vasoactive-storage.ts`, `ventilation-case-storage.ts` | Estado por módulo |
| | `lib/locale.ts` | Idioma (localStorage no web) |
| **i18n** | `lib/i18n/`, `lib/use-tr.ts`, `acls/locales/` | PT/ES, fechado em `1fe4bc4` |

---

## 6. Módulo piloto recomendado — **Ritmos de Parada** (`ritmos-acls`)

Critérios do plano: menor risco clínico.

| Critério | `ritmos-acls` |
|---|---|
| Timers | **nenhum** (`grep setInterval` = 0) |
| Comandos de voz | **nenhum** |
| Máquina de estados | **nenhuma** — o engine devolve estado estático |
| Persistência / registro de eventos | **nenhum** |
| Decisão clínica | **nenhuma** — é material de consulta |
| Tamanho | 524 linhas, uma tela só |

É conteúdo de referência: cards de ritmo com ECG, frequência, regularidade e
conduta. Se a migração quebrar algo, o pior caso é visual — não há fluxo,
cronômetro nem registro para regredir.

**Alternativas de risco igualmente baixo**, na ordem: `farmacologia-acls`,
`pos-pcr-acls`, `causas-reversiveis-acls` (590 linhas, mas tem o assistente de
causas reversíveis acoplado — prefira depois).

**Não usar como piloto:** qualquer módulo com `*-flow-screen`, porque eles
compartilham o `module-flow-shell` — mexer nele afeta 17 módulos ao mesmo tempo,
o oposto de um piloto isolado.

---

## 7. Rede de segurança existente antes desta fase

Já havia no repositório:

| Script | Cobre |
|---|---|
| `scripts/verify-acls-flow.cjs` | 18 asserções do fluxo ACLS (reducer, cues) |
| `scripts/test-engine.cjs` | Engine principal |
| `scripts/test-avc-engine.cjs` | Motor do AVC |
| `scripts/test-coronary-engine.cjs` | Motor das coronárias |
| `scripts/validate-acls-protocol.cjs` | Schema do protocolo |
| `scripts/validate-acls-audio.cjs` | Manifesto de áudio |
| `scripts/validate-acls-microcopy.cjs` | Microcopy |
| `scripts/varredura-pt.cjs` | Tradução PT→ES sem pendência |
| `scripts/verifica-bundle-es.cjs` | Tradução presente no bundle |

Todos são testes de **lógica em Node**, não de interface. A Fase 0.2 acrescenta
a camada que faltava: E2E de interface com Playwright.

---

## 8. Riscos identificados para a migração

1. **Despacho central em `clinical-app.tsx`.** 27 comparações de `protocolId`
   antes do fallback. Migrar uma tela exige entrar aqui — é o ponto de maior
   chance de erro por descuido.
2. **`module-flow-shell.tsx` é compartilhado por 17 módulos.** Alterá-lo não é
   migração de tela, é migração de 17. Deve ser fase própria e explícita.
3. **`StyleSheet.create` é avaliado no import**, fora do render. Tema dinâmico
   (dark/light) exige estilos derivados dentro do componente — senão o tema
   congela, exatamente como aconteceu com `tr("literal")` no i18n.
4. **`protocol-screen.tsx` do PCR concentra timers, voz e engine.** É a tela de
   maior risco do app e deve ser a última.
5. **Reducer do ACLS lança exceção em violação de invariante.** Mudança de
   apresentação que altere a ordem de chamadas pode derrubar o app em runtime,
   não apenas exibir errado.
