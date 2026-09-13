# Matriz de requisitos · AVC (C01 do PDF v1.1)

**Data:** 2026-09-13 · **Fonte:** `docs/spec-avc.md` · **Estado no repo:**
`docs/avc/inventario.md`.

## Como ler

- Cada requisito tem **ID estável**. O ID não muda quando a tela ou a ordem mudam.
- A **camada** separa o que o PDF manda separar: `INT` interface · `REG` regra
  clínica · `CAL` cálculo · `PER` persistência · `REC` recurso assistencial.
- **Desconhecido** diz o que o requisito faz quando falta dado. Nenhum requisito
  preenche valor normal por padrão.
- A coluna **teste** cita só o que existe e foi medido; o resto é "a criar".
  Nenhum teste listado como existente foi executado nesta rodada, exceto quando
  dito.
- **Regra clínica não tem critério escrito aqui.** O critério vive em
  `docs/avc/matriz-regras.md`, pendente de validação médica.

---

# Parte A · Especificação por requisito

## A.1 · Chegada e relógio (T01)

| ID | camada | entrada | comportamento | saída | dependências | desconhecido | aceite |
|---|---|---|---|---|---|---|---|
| RQ-T01-01 | INT | nenhuma | abrir atendimento com paciente não identificado | atendimento com ID provisório | RQ-DAD-01 | identificação ausente não bloqueia | A01 |
| RQ-T01-02 | INT | chegada, última vez normal, início presenciado, descoberta | registrar os quatro marcos separados, com data completa e fuso | marcos com horário observado e registrado | RQ-DAD-02, RQ-DAD-06 | cada marco aceita "não sei"; descoberta nunca substitui início | A04 |
| RQ-T01-03 | INT | PAS/PAD, FC, FR, SpO₂, glicemia, temperatura, consciência | registrar observação com valor, unidade, horário, origem e autor | observações | RQ-DAD-02 | não medido ≠ normal; campo vazio fica vazio | A01 |
| RQ-T01-04 | CAL | PAS, PAD, horário | calcular PAM estimada = (PAS + 2 × PAD)/3 preservando PAS/PAD | PAM com unidade e horário da medida de origem | RQ-FUN-02 | sem PAS ou PAD, sem PAM; valores inconsistentes pedem conferência | T01 |
| RQ-T01-05 | INT | comorbidades | seleção múltipla com "nenhuma conhecida" e "desconhecido" distintos | lista de comorbidades | RQ-DAD-02 | "desconhecido" ≠ "nenhuma" | A01 |
| RQ-T01-06 | INT | anticoagulante | abrir fármaco, dose e última tomada | observação estruturada | RQ-REG-IVT-SEG | última tomada ausente = incerteza explícita | A03 |
| RQ-T01-07 | INT | texto livre de medicamento | pedir conciliação estruturada | pendência de conciliação | RQ-DAD-07 | termo de risco não gera conclusão | p.11 |
| RQ-T01-08 | INT | imagem | permitir solicitar imagem antes de completar história e NIHSS | exame em estado "solicitado" | RQ-T04-01 | campos não essenciais não bloqueiam | A01 |

## A.2 · Ameaças e suporte (T02, p.4)

| ID | camada | entrada | comportamento | saída | dependências | desconhecido | aceite |
|---|---|---|---|---|---|---|---|
| RQ-T02-01 | INT | achados de via aérea, ventilação, oxigenação, perfusão, convulsão, glicemia | perguntar por achado observável, com instrução de exame | ameaça identificada ou "não avaliado" | RQ-REG-AMEACA | "não sei" leva a perguntas menores | T02 |
| RQ-T02-02 | INT | ameaça | oferecer ação pertinente e ficha de execução que diz o que dar, quanto, via, em quanto tempo, o que reavaliar e quando | ficha | RQ-REG-AMEACA, RQ-FAR-01 | ficha com parâmetro pendente aparece indisponível | [CORREÇÃO 12/09] |
| RQ-T02-03 | REG | intervenção registrada | manter ameaça pendente até nova medida | ameaça pendente | RQ-DAD-04 | intervenção sem medida não resolve | A02 |
| RQ-T02-04 | INT | qualquer tela | "Preciso de ajuda" e "Paciente piorou" acessíveis | caminho de ajuda ou de reavaliação | RQ-ORQ-01 | sempre visível | T02, p.10 |
| RQ-T02-05 | INT | "Preciso de ajuda" | oferecer não sei avaliar · não tenho medicamento · não tenho equipamento · não melhorou · paciente piorou | conteúdo ou caminho, retorno preservado | RQ-ORQ-01 | — | p.10 |
| RQ-T02-06 | REG | pressão arterial | controle pressórico recebe diagnóstico provável, fase e estratégia | alvo contextual ou "pendente" | RQ-REG-PA-IVT, RQ-REG-HIC-PA | sem diagnóstico, sem alvo | T02 |
| RQ-INT-01 | INT | qualquer item de tela | nenhum item acima de 200 caracteres | — | trava a criar | — | [CORREÇÃO 12/09] |

## A.3 · Neurologia e exames (T03, T04)

| ID | camada | entrada | comportamento | saída | dependências | desconhecido | aceite |
|---|---|---|---|---|---|---|---|
| RQ-T03-01 | INT | sintomas | sintomas clicáveis com início, persistência, flutuação e estado prévio | observações | RQ-DAD-02 | "não sei" por sintoma | T03 |
| RQ-T03-02 | CAL | itens NIHSS | cada item oficial com instrução, alternativas, pontuação e regra de impedimento | total **só quando válido** | direitos de uso (pendência) | item não avaliável **não vale zero**; incompleto não gera total | A06 |
| RQ-T03-03 | REG | NIHSS e funções habituais | avaliar déficit incapacitante separado da pontuação | incapacitante sim/não/pendente | RQ-REG-INCAP | NIHSS baixo não exclui | A05 |
| RQ-T03-04 | PER | reavaliação | reavaliação não sobrescreve o basal; preservar exame anterior à sedação | série de exames | RQ-DAD-03 | — | A09 |
| RQ-T04-01 | INT | exame | estados não solicitado · solicitado · realizado · resultado disponível · interpretado · indisponível/cancelado com motivo | exame com estado | RQ-DAD-05 | "solicitar" não marca realização nem exclusão de hemorragia | T04 |
| RQ-T04-02 | INT | resultado | data/hora de coleta ou aquisição e de registro; achados estruturados; inconclusivo explícito | resultado | RQ-DAD-05 | inconclusivo ≠ normal | T04 |
| RQ-T04-03 | REG | imagem interpretada | saídas hemorragia · isquemia provável · dúvida/outra hipótese | caminho | RQ-REG-IMG | TC sem alteração não exclui AVC | A07 |

## A.4 · Decisão e execução (T05, T06)

| ID | camada | entrada | comportamento | saída | dependências | desconhecido | aceite |
|---|---|---|---|---|---|---|---|
| RQ-T05-01 | REG | dados integrados | painel IVT com critérios atendidos, impedimentos, corrigíveis, ausentes e situações especiais | resultado IVT explicável | RQ-REG-IVT-* | desconhecido não vira negativo | A02, A03 |
| RQ-T05-02 | REG | dados integrados | painel EVT **independente** do IVT | resultado EVT explicável | RQ-REG-EVT | IVT impedida não bloqueia EVT | A08 |
| RQ-T05-03 | REG | novo dado relevante | invalidar conclusão para uso futuro e preservar a histórica | nova conclusão + histórico | RQ-DAD-04 | — | A14 |
| RQ-T06-01 | INT | intervenção | estados indicado · decidido · prescrito · preparado · iniciado · administrado/concluído · interrompido · cancelado | evento com estado | RQ-DAD-08 | escolher fármaco não administra | T06 |
| RQ-T06-02 | CAL | concentração | confirmar concentração antes de calcular volume; dose e volume com unidades distintas | volume | RQ-FAR-01, RQ-FUN-02 | sem concentração, sem volume | A16 |
| RQ-T06-03 | PER | clique repetido | não duplicar administração registrada | um evento, identificado | RQ-DAD-08 | — | A17 |
| RQ-T06-04 | PER | peso alterado | não modificar evento histórico | evento imutável | RQ-DAD-04 | — | T06 |
| RQ-T06-05 | REG | complicação (deterioração neurológica, sangramento, angioedema, reação ao contraste) | abrir avaliação/resgate da complicação específica | caminho de resgate | RQ-ORQ-01, RQ-REG-COMP-SANG, RQ-REG-COMP-ANGIO, RQ-REG-COMP-CONTRASTE, RQ-REG-FALHA | fonte de uma complicação não serve a outra | A11 |

## A.5 · Hemorragia

| ID | camada | entrada | comportamento | saída | dependências | desconhecido | aceite |
|---|---|---|---|---|---|---|---|
| RQ-HEM-01 | REG | imagem com hemorragia | abrir **caminho próprio**, não só bloquear IVT | caminho hemorrágico | RQ-T04-03 | — | A07 |
| RQ-HEM-02 | REG | anticoagulante em uso | entrega de **reversão por agente** | ficha de reversão | RQ-REG-HIC-REV, RQ-FAR-01 | agente desconhecido = pendência explícita | [CORREÇÃO 12/09] |
| RQ-HEM-03 | REG | PA, tipo de hemorragia | entrega de **alvo pressórico** próprio | alvo ou pendente | RQ-REG-HIC-PA | — | [CORREÇÃO 12/09] |
| RQ-HEM-04 | REG | tipo, gravidade, localização | entrega de **indicação neurocirúrgica** | indicação ou pendente | RQ-REG-HIC-CIR | — | [CORREÇÃO 12/09] |
| RQ-HEM-05 | REG | caminho hemorrágico | plano de 48 h próprio | plano | RQ-T08-01 | — | T08 |

## A.6 · Destino, recursos, telemedicina (T07, p.5)

| ID | camada | entrada | comportamento | saída | dependências | desconhecido | aceite |
|---|---|---|---|---|---|---|---|
| RQ-REC-01 | REC | perfil do serviço | disponibilidade atual confirmável, separada da indicação clínica | recurso disponível/ausente/incerto | RQ-DAD-01 | incerto ≠ ausente | A12 |
| RQ-REC-02 | REG | recurso ausente | falta de recurso **não** é contraindicação; manter plano local e reavaliar acesso | plano local | RQ-REC-01 | sem terapia substituta inventada | A12 |
| RQ-T07-01 | REG | necessidade e capacidade | destino entre neurointervenção, neurocirurgia, UTI, unidade AVC | destino | RQ-REG-DEST | UTI não é padrão universal | T07 |
| RQ-T07-02 | REC | transferência | estados solicitada · contato · aceite · transporte confirmado · saída · chegada/entrega · cancelada | transferência com marcos | RQ-DAD-09 | estimativa é estimativa; aceite não se presume | A12 |
| RQ-TEL-01 | REC | telemedicina/telestroke | **ator e estado** da decisão e da transferência: acionamento, contato, parecer, aceite remotos com horário e autor | fatos do ator remoto | RQ-DAD-09 | parecer ausente não se presume | [CORREÇÃO 12/09] |
| RQ-T07-03 | INT | atendimento | resumo com horários, exames, decisões e fundamentos, medicamentos **realmente** administrados, pendências e próxima reavaliação | passagem do caso | RQ-DAD-* | "pronto" não vem de preenchimento | T07 |

## A.7 · Continuidade, falha terapêutica e 48 h (T08)

| ID | camada | entrada | comportamento | saída | dependências | desconhecido | aceite |
|---|---|---|---|---|---|---|---|
| RQ-T08-01 | REG | caminho (após IVT · após EVT · sem reperfusão · hemorragia) | plano diferente por caminho | tarefas | RQ-REG-48H | — | T08 |
| RQ-T08-02 | PER | evento real | tarefa vinculada ao evento de origem, com prazo/condição e critério real de conclusão | tarefa | RQ-DAD-10 | — | T08 |
| RQ-T08-03 | REG | 24 h após IVT | **não** liberar antiagregante só pelo tempo; exigir imagem e avaliação | pendência | RQ-REG-ANTITROMB | sem imagem, sem liberação | A15 |
| RQ-FAL-01 | REG | resposta insuficiente | escalonar, resgatar e pedir ajuda | caminho de resgate | RQ-ORQ-01 | — | p.4 |
| RQ-FAL-02 | REG | deterioração | reabrir avaliação de ameaças sem esperar tarefa agendada; manter histórico, infusões, exames e transferências ativos | ameaças reabertas | RQ-T02-01 | — | A11 |
| RQ-T08-04 | INT | notificação | não presumir notificação de navegador em segundo plano; exibir agenda | agenda visível | — | — | T08 |

## A.8 · Retorno entre módulos (p.4, C05)

| ID | camada | entrada | comportamento | saída | dependências | desconhecido | aceite |
|---|---|---|---|---|---|---|---|
| RQ-ORQ-01 | PER | chamada de módulo | receber encounterId, intervenção, contexto, observações atuais, ponto de retorno | chamada empilhada | RQ-FUN-03 | — | A09 |
| RQ-ORQ-02 | PER | retorno | devolver eventos registrados, suporte ativo, resposta medida e pendências; voltar ao campo de origem | retorno | RQ-ORQ-01 | voltar ≠ resolução | A09 |
| RQ-ORQ-03 | INT | módulo não implementado | mostrar indisponibilidade e permitir registrar conduta externa, sem simular execução | registro externo | RQ-ORQ-01 | — | p.4 |
| RQ-ORQ-04 | PER | retorno aninhado | AVC → via aérea → pós-intubação → ventilação/analgesia/sedação → AVC | pilha íntegra | RQ-ORQ-01 | — | C05 |

## A.9 · Dados e persistência (p.11, C03, E01)

| ID | camada | entrada | comportamento | saída | dependências | desconhecido | aceite |
|---|---|---|---|---|---|---|---|
| RQ-DAD-01 | PER | atendimento | ID, paciente, início, status, contexto assistencial, perfil de recursos, versão do conteúdo | atendimento | — | — | p.11 |
| RQ-DAD-02 | PER | observação | tipo, valor, unidade, momento observado, momento registrado, origem, autor, estado da informação | observação | — | estados desconhecido · pendente · presente · ausente · não aplicável | C03 |
| RQ-DAD-03 | PER | correção | nova versão com autor e motivo; nunca sobrescrever | versão | RQ-DAD-02 | — | p.11 |
| RQ-DAD-04 | PER | decisão | tipo, resultado, motivos, pendências, IDs das observações usadas, regra/versão, autor, horário | decisão | RQ-DAD-02 | — | A14 |
| RQ-DAD-05 | PER | exame | tipo, solicitação, aquisição/coleta, resultado, interpretação, responsável, disponibilidade | exame | — | — | T04 |
| RQ-DAD-06 | PER | datas | datas completas e fuso explícitos | — | — | janela não se calcula da descoberta | A04 |
| RQ-DAD-07 | REG | texto livre | nunca produzir conclusão clínica silenciosa | pedido de conciliação | — | — | p.11 |
| RQ-DAD-08 | PER | intervenção | indicação, plano, execução, dose/volume, horários, resposta, complicações | intervenção | RQ-DAD-02 | — | T06 |
| RQ-DAD-09 | PER | transferência | recurso, contatos, aceite, transporte, marcos, plano durante espera; ator remoto | transferência | — | — | T07 |
| RQ-DAD-10 | PER | tarefa | ação, evento de origem, prazo/condição, estado, critério real de conclusão | tarefa | — | — | T08 |
| RQ-PER-01 | PER | fechar e reabrir | recuperar estado e eventos sem duplicar administração | atendimento restaurado | RQ-DAD-* | — | A13 |
| RQ-PER-02 | PER | **decisão E01** | **offline/local-first** decidido e registrado | decisão | autor | — | [CORREÇÃO 12/09] |
| RQ-PER-03 | PER | **decisão E01** | **conflito multiusuário** decidido; detectar e conciliar, sem sobrescrita silenciosa | decisão + conciliação | autor | — | A18 |

## A.10 · Idioma e populações

| ID | camada | entrada | comportamento | saída | dependências | desconhecido | aceite |
|---|---|---|---|---|---|---|---|
| RQ-I18N-01 | INT | textos | chaves estáveis em pt-BR e es; regra clínica independente do idioma | textos | glossário | sem chave crua na tela | p.25 |
| RQ-I18N-02 | INT | troca de idioma | não reiniciar atendimento nem alterar dados, pontuação, dose, decisão ou cronômetro | mesma sessão | — | — | p.26 |
| RQ-I18N-03 | CAL | número digitado | armazenar canônico com unidade; interpretar conforme idioma; rejeitar separador ambíguo | número ou erro | — | ambíguo é erro, não palpite | p.25 |
| RQ-I18N-04 | INT | texto livre do usuário | preservar no original | — | — | não traduzir em silêncio | p.25 |
| RQ-POP-01 | REG | idade, gestação, puerpério | identificar pediátrica, gestante e puérpera **antes** de regra adulta; encaminhar | alerta de encaminhamento | RQ-DAD-02 | "desconhecido" também bloqueia saída silenciosa | [CORREÇÃO 12/09] |

---

# Parte B · Requisito → entrega → teste

Entregas E01–E10 conforme p.14. "Estado" vem de `docs/avc/inventario.md`.

| requisito | entrega | teste existente (medido) | teste a criar | estado no repo |
|---|---|---|---|---|
| RQ-T01-02, RQ-DAD-06 | E03 | commit `995fa56` (rota RM exige início desconhecido) | virada de data e fuso | PARCIAL |
| RQ-T01-04 | E04 | — | PAM com PAS/PAD ausentes e inconsistentes | NÃO RESOLVE |
| RQ-T01-06 | E04 | `scripts/prova-avc-criticos.cjs` (C40, `aguarda_juizo`) | — | JÁ RESOLVE |
| RQ-T02-03 | E04 | — | A02 | NÃO MEDIDO |
| RQ-T02-04, RQ-T02-05 | E02 | — | ajuda e piora de qualquer tela | NÃO RESOLVE |
| RQ-INT-01 | E08 | — | trava de 200 caracteres com mutação | NÃO RESOLVE |
| RQ-T03-02 | E04 | — | A06; item não avaliável ≠ zero | NÃO RESOLVE |
| RQ-T03-03 | E04 | — | A05 | NÃO MEDIDO |
| RQ-T04-01 | E03 | — | "solicitar" não marca realização | PARCIAL |
| RQ-T05-01, RQ-T05-02 | E04 | `prova-avc-fase6-portao.cjs`, `prova-avc-fase9-evt.cjs`, `prova-avc-criticos.cjs` | A08 com força e errata | PARCIAL |
| RQ-T06-01 | E06 | — | 8 estados | PARCIAL (4 de 8) |
| RQ-T06-02 | E06 | — | A16 | PARCIAL (F-20) |
| RQ-T06-03 | E06 | — | A17 | NÃO MEDIDO |
| RQ-HEM-01..05 | E04, E06, E07 | — | A07; reversão, alvo, cirurgia como entrega | PARCIAL (catálogo) |
| RQ-REC-01, RQ-REC-02 | E07 | `prova-avc-fase8-pos-reperfusao.cjs` (parcial) | A12 | PARCIAL |
| RQ-T07-02 | E07 | — | ciclo da transferência | NÃO RESOLVE |
| RQ-TEL-01 | E07 | — | ator remoto em decisão e transferência | NÃO RESOLVE |
| RQ-T08-01..03 | E07 | `prova-avc-fase10-antitromboticos.cjs` | A15; agenda por evento | PARCIAL |
| RQ-FAL-01, RQ-FAL-02 | E05 | — | A11 | NÃO MEDIDO |
| RQ-ORQ-01..04 | E05 | — | A09; retorno aninhado | NÃO RESOLVE |
| RQ-DAD-03 | E03 | trilha append-only (§3.1) | — | JÁ RESOLVE |
| RQ-PER-01 | E03 | `e2e/retomada-de-fluxo.spec.ts` cobre sessão **em memória**, não fechamento | A13 com fechamento real | NÃO RESOLVE |
| RQ-PER-02, RQ-PER-03 | E01 | — | A18 | NÃO RESOLVE (decisão do autor) |
| RQ-I18N-01..04 | E02 | `scripts/varredura-pt.cjs`, `scripts/prova-varredura-morde-sem-acento.cjs` | mesmo caso PT/ES = mesmo resultado; separador ambíguo | PARCIAL |
| RQ-POP-01 | E04 | `test:escopo-pediatrico` (só dose) | identificar e encaminhar | NÃO RESOLVE |

---

# Parte C · Escopo da primeira fatia simulada (p.14)

**Proposta, não decisão.** Percorrer as oito etapas com um paciente fictício
estável, provando fluxo e registro. Depende de duas decisões do autor antes de
começar (`docs/status.md`): a base arquitetural e as decisões de E01.

Dentro da fatia: RQ-T01-01..03, RQ-T01-08, RQ-T02-01, RQ-T02-04, RQ-T04-01,
RQ-DAD-01..05, RQ-PER-01, RQ-I18N-02.

Fora da fatia, e **necessários antes de uso clínico**, conforme o PDF: incerteza,
reavaliação, suporte, hemorragia, recursos ausentes e complicações.
