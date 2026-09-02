# Emergências 2.0 — roadmap de evolução

Objetivo: evoluir o app existente para um copiloto determinístico de atendimento crítico, mantendo o produto utilizável e migrando por camadas, sem reescrita total.

## Princípios

1. Uma tela, uma decisão dominante.
2. Toda decisão relevante oferece saída segura para quem não sabe responder.
3. Terapia crítica exige reavaliação explícita.
4. O app evita omissão silenciosa, mas não bloqueia uma emergência sem override controlado.
5. Intercorrências são transições clínicas declaradas, não navegações improvisadas.
6. Sinais vitais e exames só atravessam módulos com timestamp e idade do dado visíveis.
7. Dose, cálculo e contraindicação permanecem determinísticos.
8. Toda ação relevante pode gerar evento temporal para auditoria.
9. Conteúdo clínico e apresentação visual permanecem separados.
10. Nenhuma mudança clínica crítica entra apenas por decisão de UI.

## Bloco A — Clinical Cockpit UI

- [x] Nova direção de paleta e superfícies.
- [x] Botões, cards e header compartilhados refinados.
- [x] ClinicalCockpitBar.
- [x] CrisisActionBar.
- [x] DecisionPrompt.
- [x] SafetyGate.
- [x] ReassessmentCard.
- [x] DecisionGrid migrado para tokens semânticos.
- [x] Ramo “não sei” visualmente destacado quando já existe na árvore.
- [x] Showcase `/dev/ui-v2` atualizado para validar o conjunto.
- [ ] Integrar cockpit ao shell compartilhado sem duplicar headers.
- [ ] Integrar barra de crise às portas já existentes por módulo.

## Bloco B — Patient State 2.0

- [x] Estrutura de observações clínicas com timestamp.
- [x] Classificação de freshness do dado.
- [x] Formatação da idade da observação.
- [ ] Ligar observações progressivamente aos inputs existentes.
- [ ] Exibir “informado há X min” ao reutilizar dado volátil.
- [ ] Exigir confirmação quando a observação estiver stale para aquela decisão.

## Bloco C — Clinical Orchestrator

- [x] Contrato explícito de transições entre módulos.
- [ ] Inventariar todas as arestas `from_module` atuais.
- [ ] Declarar retorno, terminalidade e contexto preservado de cada aresta.
- [ ] Substituir navegações improvisadas progressivamente.

## Bloco D — Event Log e auditoria

- [x] Event log append-only em memória.
- [ ] Integrar decisões, ações, medicações, overrides, reavaliações e destino.
- [ ] Gerar timeline clínica do atendimento.
- [ ] Gerar debrief automático por metas temporais.

## Bloco E — Segurança do fluxo

- [ ] Mapear decisões sem `nao_sei` no universo completo.
- [ ] Diferenciar hard stop de soft stop.
- [ ] Registrar motivo de override.
- [ ] Tornar reavaliação obrigatória para terapias críticas definidas no contrato.
- [ ] Garantir destino alcançável em todos os módulos.

## Bloco F — Drug Knowledge Base

- [ ] Consolidar fonte única de medicamentos.
- [ ] Separar fármaco de indicação clínica.
- [ ] Dose, via, concentração, diluição, velocidade, máximo, apresentação e fonte.
- [ ] Validar apresentações comercializadas no Brasil.
- [ ] Bloquear duplicação de dose crítica entre módulos.

## Bloco G — Clinical Safety Test Suite

- [ ] Casos clínicos completos por módulo.
- [ ] Caminhos obrigatórios e proibidos.
- [ ] Testes de deterioração e interrupção.
- [ ] Testes de retomada de protocolo.
- [ ] Mutation testing clínico para doses, limites e passos críticos.

## Bloco H — Evidence Governance

- [ ] Fonte por recomendação acionável.
- [ ] Versão clínica e `revisadoEm`.
- [ ] Data de revisão programada.
- [ ] Atendimentos preservam a versão do protocolo em que começaram.

## Regra de migração

Nada do legado é removido porque o novo parece melhor. Uma peça antiga só sai depois que a nova está ligada, testada, auditada e com paridade funcional demonstrada.
