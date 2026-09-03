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
- [x] GuidedDiscoveryCard criado sem regra clínica interna.
- [x] Adapter de descoberta converte registry canônico em view model da UI.
- [x] Tela `/dev/guided-discovery` consome casos reais via adapter, sem duplicar conteúdo clínico.
- [x] DecisionGrid migrado para tokens semânticos.
- [x] Ramo “não sei” visualmente destacado quando já existe na árvore.
- [x] Showcase `/dev/ui-v2` atualizado para validar o conjunto.
- [x] Registro canônico das portas de crise criado.
- [x] ClinicalShellChrome compondo header + cockpit + barra de crise.
- [x] Adapter do shell criado sem dependência de engine ou roteador.
- [x] ClinicalShellChrome exibe contexto de protocolo interrompido para retorno.
- [x] Banner de contexto interrompido oferece retomada explícita e conclui a pilha LIFO sem retorno automático.
- [x] Adapter deriva o contexto de retorno diretamente da pilha de interrupções.
- [x] ClinicalShellHost plugável criado para reduzir a integração no shell legado a poucas props/callbacks.
- [x] Trava estrutural do ClinicalShellHost criada.
- [x] Reavaliações pendentes aparecem no chrome com sinais a verificar, tempo decorrido e atraso quando aplicável.
- [x] Cockpit trata idade "agora" sem renderizar "há agora".
- [x] Migração idempotente do ClinicalShellHost preparada: substitui apenas o header V2 e preserva StepHeaderBar/engine/timers como fallback/legado.
- [x] Trava da migração confirma export do host, callbacks de navegação e invariantes antes de escrever o shell.
- [x] Executar a migração no shell compartilhado e validar build/CI antes de marcar integração concluída.
- [x] Ligar GuidedDiscoveryCard aos ramos reais somente após migração/build validado.

## Bloco B — Patient State 2.0

- [x] Estrutura de observações clínicas com timestamp.
- [x] Classificação de freshness do dado.
- [x] Formatação da idade da observação.
- [x] Ponte de runtime capaz de registrar observações sem alterar decisão clínica.
- [x] Componente visual que obriga mostrar a idade do dado.
- [x] Adapter do cockpit inclui idade do dado em observações reutilizadas.
- [x] Reset central do novo atendimento limpa contexto, observações, event log, pilha de interrupções e reavaliações pendentes.
- [x] Ligar observações dos fluxos compartilhados no momento da confirmação do input, preservando timestamp, unidade e origem.
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
- [x] Contrato terminal de módulo distingue `care_pathway`, `procedural_subflow` e `embedded_care_pathway`.
- [x] ISR classificada como `embedded_care_pathway`: destino próprio quando aberta diretamente e retorno quando chamada por outro protocolo.
- [x] Primeiras 10 arestas reais retornáveis declaradas para IRA e Politrauma, com `returnLabel` explícito.
- [x] Contrato de transição distingue destino `module` de `external_service`.
- [x] Handoffs terminais externos iniciais classificados: Politrauma -> centro cirúrgico/angioembolização e TCE -> neurocirurgia.
- [x] Travas estruturais protegem arestas retornáveis e handoffs externos contra divergência com as árvores reais.
- [ ] Declarar retorno, terminalidade e contexto preservado das demais arestas reais.
- [ ] Substituir navegações improvisadas progressivamente.

## Bloco D — Event Log e auditoria

- [x] Event log append-only em memória.
- [x] Timeline derivada do event log com cálculo de intervalos.
- [x] Ponte de runtime para registrar decisão, ação, observação e transição.
- [x] Evento de retomada de protocolo incorporado à bridge.
- [x] Ida e retorno das portas de crise podem ser espelhados no event log sem alterar a navegação legada.
- [x] Override de segurança gera evento com motivo e gravidade.
- [x] Conclusão de reavaliação gera evento com tempo decorrido e resumo.
- [ ] Integrar bridge ao shell compartilhado.
- [ ] Integrar medicações e destino.
- [ ] Gerar debrief automático por metas temporais.

## Bloco E — Segurança do fluxo

- [x] Contrato central mínimo das regras de segurança criado.
- [x] Inventário automático de decisões potencialmente sem ramo de incerteza criado.
- [x] Política formal de incerteza criada: `unknown_required` / `binary_observable` / `guided_elsewhere`.
- [x] Dispensa de ramo “não sei” exige justificativa explícita e data de revisão.
- [x] Inventário reconhece `guiado` como saída de incerteza e reduz falsos positivos.
- [x] Origem da incerteza distinguida em interpretação clínica, observação ausente, história ausente e dado operacional externo.
- [x] Contrato reutilizável de descoberta guiada criado com informação faltante, 1–3 passos, critério de suficiência e retorno obrigatório à decisão.
- [x] Registry canônico de descoberta guiada promovido para `lib/`, sem dependência de pasta de testes.
- [x] HIC, STEMI, choque, taquicardia e TEP possuem contratos iniciais de descoberta; planos ainda não inseridos na árvore permanecem explicitamente `prepared_plan`.
- [x] Trava cruza contrato de descoberta, política de incerteza e nós/arestas reais das árvores.
- [x] Inventário de terapias críticas com sinal de reavaliação criado.
- [x] Runtime de override exige motivo não vazio e registra evento auditável.
- [x] Política de reavaliação definida para fibrinólise, cardioversão, intubação, vasopressor e adrenalina na anafilaxia.
- [x] Ledger de reavaliações pendentes criado; terapia crítica pode abrir obrigação explícita até a reavaliação ser concluída.
- [x] Bindings reais terapia → reavaliação criados para Anafilaxia, ISR e AVC.
- [x] Runtime observa visita aos nós e abre/fecha a obrigação sem alterar a DecisionTreeEngine.
- [x] Observer de reavaliação ligado ao shell compartilhado nos nós reais; slug da ISR alinhado à rota canônica.
- [x] Adjacência terapia → reavaliação protegida por trava estrutural nos três pilotos.
- [x] Cardioversão instável ligada a `unstable_reavaliar` no módulo de taquicardia ACLS.
- [x] Vasopressor usa obrigação orientada a evento, sem inventar nó de árvore inexistente.
- [x] Estado de reavaliação de vasopressor é limpo ao iniciar novo paciente.
- [x] Reavaliações pendentes ficam visíveis no Clinical Cockpit e priorizam a obrigação mais antiga.
- [x] Primeira classificação real de incerteza cobre AVC, ISR, taquicardia, choque, TEP e SCA.
- [x] HIC com anticoagulante desconhecido e tempo incerto até ICP no STEMI estão classificados como `unknown_required`, com migrações guiadas preparadas.
- [x] Política de gates diferencia `hard_stop`, `soft_stop` e `advisory`; hard stop não admite override e soft stop exige motivo auditável.
- [x] Auditoria terminal distingue destino assistencial de `other_module` e classifica módulos pelo papel real.
- [x] Politrauma e IRA confirmados na branch com destinos assistenciais explícitos; dívidas falsas derivadas do `main` foram removidas.
- [ ] Continuar classificando os demais achados reais do inventário.
- [ ] Garantir cobertura terminal/retorno para todos os módulos e arestas reais.

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
- [x] Alteplase no TEP sistêmico adicionada como indicação separada (100 mg/2 h), sem criar dose canônica para PCR por TEP.
- [x] Regime padrão de tenecteplase no STEMI adicionado por faixa de peso, sem promover meia-dose etária condicional a regra universal.
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
- [x] Travas de evidência e isolamento de indicação criadas para TEP e SCA.
- [x] Travas estruturais da política de incerteza, override e runtime de reavaliação criadas.
- [x] Trava confirma que bindings de reavaliação apontam para nós reais nos pilotos.
- [x] Trava confirma adjacência terapia crítica → reavaliação nos pilotos.
- [x] Trajetória executável de taquicardia instável prova cardioversão → reavaliação antes de destino.
- [x] Trava do runtime de vasopressor exige obrigação de reavaliação orientada a evento.
- [x] Trava estrutural protege a visibilidade da reavaliação pendente no cockpit.
- [x] Travas estruturais protegem as migrações guiadas de HIC/anticoagulante desconhecido e STEMI/tempo de ICP desconhecido.
- [x] Trava estrutural protege registry canônico e contratos de descoberta guiada.
- [x] Trava estrutural protege a fronteira registry → adapter → GuidedDiscoveryCard e impede regra clínica duplicada na UI.
- [x] Travas estruturais protegem classificação terminal de módulos, transições retornáveis e handoffs externos definitivos.
- [x] Ligar suíte estrutural consolidada de 26 validadores ao `test:all`.
- [ ] Expandir trajetórias executáveis completas até reavaliação e destino.
- [ ] Ligar interrupções aos pontos reais dos módulos pilotos.
- [ ] Mutation testing clínico para doses, limites e passos críticos.

## Classificação de alcançabilidade da nova arquitetura

- [x] Runtimes de reavaliação por nó e retorno LIFO conectados às rotas reais.
- [x] Ferramentas de QA/grafo/terminalidade classificadas como infraestrutura de teste, fora do bundle assistencial.
- [x] Runtime de sessão, timeline/debrief e reavaliação de vasopressor mantidos preparados com dívida de integração explícita.
- [x] Drug Knowledge Base e Evidence Governance mantidas paralelas ao legado até migração piloto com paridade demonstrada.

## Classificação funcional dos módulos

- [x] Os 31 módulos possuem função canônica declarada no catálogo: 19 fluxos assistenciais, 8 referências e 4 calculadoras.
- [x] O hub ordena fluxo antes de consulta/calculadora pela função declarada, sem inferir comportamento pelo texto da etiqueta.
- [x] As quatro calculadoras usam cabeçalho canônico com função, identidade e retorno uniformes.
- [ ] Aplicar o contrato visual obrigatório de cada categoria e eliminar bifurcações antigas após paridade.

## Bloco H — Evidence Governance

- [x] Contrato de evidência por recomendação acionável criado.
- [x] Contrato de versão clínica criado.
- [x] Regra de preservar a versão em que o atendimento começou definida.
- [x] Registry de evidência por nó criado.
- [x] AVC já possui bindings iniciais para tempo, neuroimagem, trombólise e avaliação de anticoagulação na HIC.
- [x] TEP possui bindings iniciais para classificação 2026 e trombólise sistêmica.
- [x] SCA possui bindings iniciais para ECG precoce, estratégia de reperfusão e fibrinólise no STEMI.
- [x] Tenecteplase e alteplase do AVC registradas com fonte AHA/ASA 2026 e data de revisão.
- [x] Índice único de evidências por protocolo criado com consulta por protocolId + nodeId.
- [x] Inventário de cobertura de evidência por nó acionável criado.
- [ ] Migrar recomendações reais adicionais para fonte por nó/ação.
- [ ] Definir data de próxima revisão e responsável por revisão por protocolo.

## Regra de migração

Nada do legado é removido porque o novo parece melhor. Uma peça antiga só sai depois que a nova está ligada, testada, auditada e com paridade funcional demonstrada.
