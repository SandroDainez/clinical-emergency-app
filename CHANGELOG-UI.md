# CHANGELOG-UI.md

Registro do projeto **Clinical Emergency Suite — UI 2.0**, fase a fase.

---

## Fase 0 — Mapeamento e rede de segurança ✅

**Data:** 2026-07-27 · **Base:** `1fe4bc4` · **Escopo:** nenhuma mudança visual.

### O que mudou

| Arquivo | O que é |
|---|---|
| `MAPA-APP.md` | Levantamento completo: stack, rotas, 28 módulos, telas, onde vivem timers/estado/voz/persistência, riscos e escolha do piloto |
| `NOTAS-LOGICA.md` | Bugs de lógica encontrados e **não corrigidos**, conforme a regra do plano |
| `playwright.config.ts` | Configuração do E2E (viewport Pixel 7, worker único, servidor automático) |
| `e2e/helpers.ts` | Helpers para dirigir React Native Web |
| `e2e/acls-fluxo.spec.ts` | Sequência de etapas do ACLS + ramo não chocável |
| `e2e/painel-timers.spec.ts` | Painel de acompanhamento e cronômetros |
| `e2e/registro-clinico.spec.ts` | Log clínico registra início do caso e choque |
| `e2e/voz.spec.ts` | Painel de voz alcançável e persistente |
| `e2e/modulos.spec.ts` | Os 28 módulos abrem, renderizam e não lançam exceção nova |
| `scripts/test-voice-intents.cjs` | Contrato transcrição → intent (43 verificações) |
| `scripts/serve-dist.cjs` | Servidor estático do build, sem dependência nova |
| `lib/ui-v2-flag.ts` | Feature flag `UI_V2` por módulo |
| `package.json` | Scripts `build:web`, `test:e2e`, `test:voice`, `test:i18n`, `test:all` |
| `.gitignore` | Artefatos do Playwright |

### O que NÃO foi tocado

Nada de lógica clínica. Sem alteração em: fluxo, ordem de telas, máquina de
estados, timers, comandos de voz, regras ACLS, doses, hooks, handlers,
assinaturas, variáveis, stores, rotas, banco ou sincronização. Nenhum arquivo de
`*-engine.ts`, `acls/` (exceto leitura), `components/` ou `app/` foi modificado
nesta fase.

### Rede de segurança resultante

```bash
npm run build:web && npm run test:e2e   # 38 testes E2E
npm run test:voice                       # 43 verificações de voz
npm run test:all                         # tudo, incluindo os testes que já existiam
```

**Estado: 38/38 E2E verdes (16 s) · 43/43 voz · 18/18 fluxo ACLS.**

Cobertura, contra o que o plano exigia na Fase 0.2:

| Exigido | Onde | Status |
|---|---|---|
| Protocolo avança na ordem correta | `acls-fluxo.spec.ts` | ✅ 8 etapas, do reconhecimento ao 1º choque |
| Timers iniciam, contam, alertam | `painel-timers.spec.ts` | ✅ tempo do caso monotônico + ciclo regressivo de 2 min |
| Comandos de voz: gatilho → ação | `scripts/test-voice-intents.cjs` | ✅ 18 gatilhos reais + rejeição de ruído |
| Registro de eventos persistido | `registro-clinico.spec.ts` | ✅ início do caso e choque, com horário |
| Painel reflete estado real | `painel-timers.spec.ts` | ✅ CHOQUES 0 → 1, epinefrina permanece 0 no 1º ciclo |

Extra não pedido, mas barato e valioso: `modulos.spec.ts` verifica os 28 módulos
a cada execução — é a rede que pega uma tela migrada quebrando em runtime.

### Achados

**1. Bug pré-existente: hydration mismatch em todas as 28 rotas de módulo.**
Registrado como **L-001** em `NOTAS-LOGICA.md`. Não corrigido, conforme a regra.
O HTML pré-renderizado de `/modulos/[id]` contém a landing, não o módulo — toda
rota de módulo renderiza duas vezes e pisca a landing antes. O E2E tolera este
erro específico como linha de base e falha em qualquer erro novo. **Resolver
L-001 aperta a rede de segurança de todas as fases seguintes.**

**2. O plano especifica bibliotecas que não funcionam nesta stack.**
shadcn/ui, Radix e Vaul são DOM-only; este app é React Native. Detalhado em
`MAPA-APP.md`, seção 1, com a tabela de equivalentes. **Precisa da sua decisão
antes da Fase 2.**

**3. Rótulos em caixa alta vêm do CSS, não do conteúdo.**
O DOM guarda "Ferramentas" e a tela mostra "FERRAMENTAS". Custou três testes
falhando até achar. Está documentado em `e2e/helpers.ts` — e importa para a
migração: trocar `textTransform` muda o que se lê sem mudar o DOM.

**4. Módulo piloto recomendado: `ritmos-acls` (Ritmos de Parada).**
Zero timers, zero voz, zero máquina de estados, zero persistência, zero decisão
clínica — é material de consulta. Justificativa em `MAPA-APP.md`, seção 6.

**5. Não usar um módulo `*-flow-screen` como piloto.** Os 17 arquivos têm 15
linhas cada e delegam para `module-flow-shell.tsx`. Mexer no shell migra 17
módulos de uma vez — o oposto de um piloto isolado.

### Feature flag

```bash
EXPO_PUBLIC_UI_V2=off             # padrão
EXPO_PUBLIC_UI_V2=ritmos-acls     # só o piloto
EXPO_PUBLIC_UI_V2=all             # tudo
```

No navegador, sem rebuild: `localStorage.setItem("ui-v2", "ritmos-acls")`.

A flag decide apenas qual árvore visual renderizar; os dois caminhos consomem o
mesmo engine.

---

## Próxima fase

**Fase 1 — Design Tokens e Tema.** Bloqueada até você decidir o item 2 acima
(qual stack de estilo adotar), porque a forma dos tokens depende disso: CSS
variables não existem em React Native.
