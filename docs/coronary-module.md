# Módulo Síndromes Coronarianas

## Visão geral

O módulo de síndromes coronarianas segue o mesmo padrão dos módulos clínicos guiados do app:

- engine clínico isolado em `coronary-syndromes-engine.ts`
- regras clínicas configuráveis em `coronary/`
- tela especializada em `components/protocol-screen/coronary-protocol-screen.tsx`
- tabs e mapeamento semântico em `components/protocol-screen/coronary-tab-config.ts`
- protocolo-base em `protocols/sindromes_coronarianas.json`

## Estrutura

- `coronary/domain.ts`
  Tipos fortes do domínio, classificação, scores, estratégias e auditoria.
- `coronary/protocol-config.ts`
  Tabs, janelas críticas, contraindicações à trombólise, regimes e rótulos configuráveis.
- `coronary/ecg.ts`
  Interpretação estruturada do ECG.
- `coronary/biomarkers.ts`
  Interpretação de troponina, série e delta.
- `coronary/scores.ts`
  HEART, TIMI, GRACE e Killip-Kimball.
- `coronary/calculators.ts`
  Cálculo determinístico de trombolítico e anticoagulação.
- `coronary/classification.ts`
  Motor de classificação e de estratégia diagnóstica/terapêutica.
- `coronary/prescriptions.ts`
  Templates rastreáveis de prescrição inicial por cenário.
- `coronary/audit.ts`
  Auditoria de alterações, recálculos e mudança de decisão.
- `coronary/persistence.ts`
  Autosave local do rascunho.
- `coronary/mocks.ts`
  Seeds úteis para desenvolvimento e teste.

## Segurança clínica

O módulo aplica as travas pedidas:

- dado ausente não é tratado como normal
- ECG inconclusivo, troponina pendente ou logística incompleta mantêm o caso em revisão
- trombólise não é sugerida sem revisar contraindicações e estratégia de reperfusão
- alta não é sugerida para dor torácica sem dados mínimos de segurança
- recomendação do sistema permanece separada da decisão médica final

## Como atualizar o protocolo

1. Atualize `coronary/protocol-config.ts` para tempos-alvo, contraindicações, rótulos e regimes.
2. Ajuste `coronary/classification.ts`, `coronary/ecg.ts`, `coronary/biomarkers.ts` e `coronary/scores.ts` se a lógica clínica mudar.
3. Mantenha `coronary-syndromes-engine.ts` apenas como camada de composição entre formulário, snapshot, auditoria, resumo e painel auxiliar.
4. Rode `npm run lint`, `npx tsc --noEmit` e `npm run test:coronary`.
