# Módulo AVC

## Visão geral

O módulo AVC foi implementado no mesmo padrão dos módulos clínicos guiados do app:

- engine clínico isolado em `avc-engine.ts`
- regras clínicas configuráveis em `avc/`
- tela especializada em `components/protocol-screen/avc-protocol-screen.tsx`
- tabs e mapeamento semântico em `components/protocol-screen/avc-tab-config.ts`
- protocolo-base em `protocols/acidente_vascular_cerebral.json`

## Estrutura

- `avc/domain.ts`
  Tipos fortes do domínio: snapshot clínico, NIHSS, contraindicações, decisão de reperfusão e auditoria.
- `avc/protocol-config.ts`
  Janelas terapêuticas, NIHSS completo, contraindicações e trombolíticos configuráveis.
- `avc/nihss.ts`
  Soma, completude, gravidade e déficit incapacitante.
- `avc/calculators.ts`
  Cálculo determinístico de alteplase e tenecteplase.
- `avc/eligibility.ts`
  Motor de elegibilidade para trombólise, trombectomia, fluxo hemorrágico e destino.
- `avc/prescriptions.ts`
  Templates de prescrição inicial por cenário.
- `avc/audit.ts`
  Auditoria interna de mudança de campo, recálculo, correção e alteração de decisão.
- `avc/persistence.ts`
  Autosave local do rascunho no navegador.
- `avc/mocks.ts`
  Casos úteis para demonstração e desenvolvimento.

## Segurança clínica

O módulo aplica as travas exigidas no pedido:

- dado ausente não é tratado como normal
- trombólise é bloqueada se hemorragia não foi excluída
- tempo desconhecido ou inconsistente bloqueia automação de reperfusão
- NIHSS incompleto sem justificativa de déficit incapacitante mantém a decisão em revisão
- correções de PA/glicemia entram como pendências rastreáveis
- recomendação do sistema fica separada da decisão médica final

## Como atualizar o protocolo

Para ajustar o módulo sem refatorar a UI:

1. Atualize `avc/protocol-config.ts` para janelas, contraindicações, trombolíticos e NIHSS.
2. Se a lógica mudar, ajuste `avc/eligibility.ts` e `avc/prescriptions.ts`.
3. Mantenha `avc-engine.ts` apenas como camada de composição entre formulário, snapshot, auditoria e painel auxiliar.
4. Rode `npm run lint`, `npx tsc --noEmit` e `npm run test:avc`.
