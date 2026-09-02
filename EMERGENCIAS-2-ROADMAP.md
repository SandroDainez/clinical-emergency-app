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
- [x] ClinicalObservationChip com idade do dado obrigatória.
- [x] CrisisActionBar.
- [x] DecisionPrompt.
- [x] SafetyGate.
- [x] ReassessmentCard.
- [x] DecisionGrid migrado para tokens semânticos.
- [x] Ramo “não sei” visualmente destacado quando já existe na árvore.
- [x] Showcase `/dev/ui-v2` atualizado para validar o conjunto.
- [x] Registro canônico das portas de crise criado.
- [x] ClinicalShellChrome compondo header + cockpit + barra de crise.
- [x] Adapter do shell criado sem dependência de engine ou roteador.
- [x] ClinicalShellChrome exibe contexto de protocolo interrompido para retorno.
- [x] Adapter deriva o contexto de retorno diretamente da pilha de interrupções.
- [x] ClinicalShellHost plugável criado para reduzir a integração no shell legado a poucas props/callbacks.
- [x] Trava estrutural do ClinicalShellHost criada.
- [ ] Integrar ClinicalShellHost ao shell compartilhado sem duplicar headers.

## Bloco B — Patient State 2.0

- [x] Estrutura de observações clínicas com timestamp.
- [x] Classificação de freshness do dado.
- [x] Formatação da idade da observação.
- [x] Ponte de runtime capaz de registrar observações sem alterar decisão clínica.
- [x] Componente visual que obriga mostrar a idade do dado.
- [x] Adapter do cockpit inclui idade do dado em observações reutilizadas.
- [x] Reset central do novo atendimento limpa contexto, observações, event log e pilha de interrupções.
- [ ] Ligar observações progressivamente aos inputs existentes.
- [ ] Exigir confirmação quando a observação estiver stale para aquela decisão.

## Bloco C — Clinical Orchestrator

- [x] Contrato explícito de transições entre módulos.
- [x] Registro canônico das portas de crise e exceções existentes.
- [x] Inventário derivado do código para localizar transições `from_module`.
- [x] Ponte de runtime para registrar interrupções sem assumir controle da navegação.
- [x] Roteamento canônico de crise preservando `from_module`.
- [x] Pilha explícita de interrupções aninhadas criada.
- [x] Retorno LIFO modelado para trajetórias AVC -> ISR -> PCR -> ISR -> AVC.
- [x] Rotas de crise podem ser instrumentadas mantendo o `router.push(href)` legado intacto.
- [x] Runtime de retomada resolve o retorno correto sem controlar o router.
- [ ] Declarar retorno, terminalidade e contexto preservado de cada aresta real.
- [ ] Substituir navegações improvisadas progressivamente.

## Bloco D — Event Log e auditoria

- [x] Event log append-only em memória.
- [x] Timeline derivada do event log com cálculo de intervalos.
- [x] Ponte de runtime para registrar decisão, ação, observação e transição.
- [x] Evento de retomada de protocolo incorporado à bridge.
- [x] Ida e retorno das portas de crise podem ser espelhados no event log sem alterar a navegação legada.
- [ ] Integrar bridge ao shell compartilhado.
- [ ] Integrar medicações, overrides, reavaliações e destino.
- [ ] Gerar debrief automático por metas temporais.

## Bloco E — Segurança do fluxo

- [x] Contrato central mínimo das regras de segurança criado.
- [x] Inventário automático de decisões potencialmente sem ramo de incerteza criado.
- [ ] Classificar achados do inventário em: precisa `nao_sei` / binário legítimo / já possui descoberta guiada.
- [ ] Diferenciar hard stop de soft stop por tipo de risco.
- [ ] Registrar motivo de override.
- [ ] Tornar reavaliação obrigatória para terapias críticas definidas no contrato.
- [ ] Garantir destino alcançável em todos os módulos.

## Bloco F — Drug Knowledge Base

- [x] Contratos canônicos de fármaco, apresentação, indicação e fonte definidos.
- [x] Separação estrutural entre apresentação comercial e recomendação clínica definida.
- [x] Tenecteplase migrada em paralelo, sem substituir a fonte legada.
- [x] Tenecteplase separa fonte da apresentação brasileira da fonte clínica do regime de AVC.
- [x] Paridade do regime AVC 0,25 mg/kg, máximo 25 mg, protegida por trava estrutural.
- [x] Amiodarona migrada em paralelo com regimes PCR e com pulso explicitamente separados.
- [x] Trava impede mistura dos regimes de amiodarona.
- [x] Alteplase no AVC migrada em paralelo e isolada de TEP/IAM.
- [x] Paridade da alteplase no AVC 0,9 mg/kg, máximo 90 mg, 10% bolus + 60 min protegida.
- [x] Registry único da Drug Knowledge Base criado com IDs e indicações não duplicados.
- [x] Inventário de doses críticas duplicadas criado para ordenar próximas migrações.
- [ ] Consumir uma entrada canônica em módulo piloto após CI/testes verdes.
- [ ] Validar apresentações dos próximos fármacos comercializados no Brasil.
- [ ] Bloquear duplicação de dose crítica entre módulos após inventário/revisão.

## Bloco G — Clinical Safety Test Suite

- [x] Validador estrutural inicial do Emergências 2 core criado.
- [x] Contrato de casos clínicos de regressão criado.
- [x] Catálogo piloto criado para AVC, Anafilaxia e ISR.
- [x] Validador de forma dos casos-piloto criado.
- [x] Travas estruturais do runtime bridge, session reset, shell adapter e crisis routing criadas.
- [x] Runner determinístico criado sobre a DecisionTreeEngine real.
- [x] Primeiras trajetórias executáveis reais: AVC, Anafilaxia e ISR.
- [x] Casos iniciais já verificam nós obrigatórios, proibidos e nó final esperado.
- [x] Trava estrutural dos casos executáveis criada.
- [x] Auditoria de grafo para reavaliação/destino criada.
- [x] Cenário estrutural de interrupção aninhada e retorno LIFO criado.
- [x] Trava estrutural do runtime de retomada criada.
- [x] Travas de paridade das primeiras entradas canônicas de medicamentos criadas.
- [x] Trava estrutural do registry único de medicamentos criada.
- [ ] Ligar validadores ao `test:all` após execução local/CI verde.
- [ ] Expandir trajetórias até reavaliação e destino.
- [ ] Ligar interrupções aos pontos reais dos módulos pilotos.
- [ ] Mutation testing clínico para doses, limites e passos críticos.

## Bloco H — Evidence Governance

- [x] Contrato de evidência por recomendação acionável criado.
- [x] Contrato de versão clínica criado.
- [x] Regra de preservar a versão em que o atendimento começou definida.
- [x] Registry de evidência por nó criado.
- [x] AVC já possui bindings iniciais para tempo, neuroimagem e trombólise.
- [x] Tenecteplase e alteplase do AVC registradas com fonte AHA/ASA 2026 e data de revisão.
- [x] Inventário de cobertura de evidência por nó acionável criado.
- [ ] Migrar recomendações reais adicionais para fonte por nó/ação.
- [ ] Definir data de próxima revisão e responsável por revisão por protocolo.

## Regra de migração

Nada do legado é removido porque o novo parece melhor. Uma peça antiga só sai depois que a nova está ligada, testada, auditada e com paridade funcional demonstrada.
