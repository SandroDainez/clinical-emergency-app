# Protocolo padrão para telas de emergência

Este template define o contrato de dados que alimenta os componentes visuais reutilizáveis da tela de protocolo (header, etapa, checklist, decisões, voz e ação principal). Qualquer novo módulo de emergência deve apenas construir um objeto `ProtocolTemplateContract` e passar para o `ProtocolScreenTemplate`, mantendo a lógica clínica no engine.

## Estrutura contratual

1. **header** — define o rótulo do protocolo e a ação de voltar.
2. **summary** — descreve a etapa atual (título, instrução, progresso e próximo passo). A UI destaca esse bloco como foco principal.
3. **checklist** — lista curta de ações imediatas com título e itens.
4. **decisions** — grid responsiva com as principais opções clínicas, cada uma dispara `onSelect` com o `id` correspondente.
5. **voice** — status do modo de voz, comandos válidos, confirmação pendente e callback para alternar o modo.
6. **footerAction** — botão fixo no rodapé com rótulo, acionador e visibilidade.
7. **secondarySections** — painéis auxiliares opcionais que podem abranger métricas, logs, painéis de causas reversíveis, etc. Eles são renderizados imediatamente após o painel de voz.

## Consumo

```tsx
const contract: ProtocolTemplateContract = {
  header: { protocolLabel: "ACLS · Adulto", onBack },
  summary: { title: "Reconhecimento", instruction: "Confirme pulso e respiração", progress: 0.2, nextStep: "RCP" },
  checklist: { title: "Ação imediata", items: ["Segurança da cena", "Acesso IV"] },
  decisions: { options: [...], onSelect },
  voice: { statusLabel: "Ouvindo", note: "Aguardando comando", commands: [...], confirmation: null, onToggleVoice, voiceModeEnabled: true },
  footerAction: { label: "Confirmar conduta", onPress, visible: true },
  secondarySections: [<ReversibleCausesCard {...} />],
};

<ProtocolScreenTemplate contract={contract} />
```

## Extensibilidade

- Qualquer módulo que precise exibir painéis extras (logs, histórico, métricas) pode fornecer `secondarySections` com `ReactNode`s.
- Para seções específicas do módulo (ex: `AclsModeToggle`, `DebriefCard` ou painéis clínicos), use o `children` do `ProtocolScreenTemplate` para injetar o conteúdo adicional sem quebrar o contrato. O template renderiza os `children` imediatamente após as `secondarySections`.
- Evite reimplementar lógica de transição ou medicação no template; o contrato deve apenas declarar o que exibir.

## Benefícios

- Clareza para novos módulos: basta preencher o contrato com os dados atuais.
- Garantia de consistência visual seguindo os tokens de design já compartilhados.
- Independência da lógica clínica: o contract apenas referencia callbacks e dados preparados pelo engine ou screen model.
