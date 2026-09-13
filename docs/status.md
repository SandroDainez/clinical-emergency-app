# Status · App Emergências — módulo AVC (PDF v1.1)

**Última atualização:** 2026-09-13
**Branch:** `refactor/clinical-modules-rebuild` · **HEAD de código:** `e8fed38`, enviado; por cima, um commit só de `docs/` (D-PEND-17)

## Fila consolidada · tudo que está aberto (2026-09-13, atualizada na 10ª rodada)

Fonte de cada linha:
- **AC-\*:** `docs/avc/auditoria-vs-spec.md` (§1, §7.4–§7.15).
- **Decisões:** `docs/decisoes.md`.
- **Casos A:** `docs/spec-avc.md` §15 × testes.

Fechados não entram na tabela; ver a nota logo abaixo dela. Ordem: primeiro o que só o autor pode fazer, depois decisões, achados por gravidade e casos A01–A18.

| # | categoria | gravidade | o que está aberto | estado | quem destrava |
|---|---|---|---|---|---|
| 1 | só o autor | alta | **Errata** *Stroke* 2026;57(8):e461–e467 (AC-04). Nenhum slot AHA/ASA 2026 foi conferido contra ela. | inacessível por via automatizada (403); nenhuma tentativa de contornar | autor: colocar o PDF da errata no repositório |
| 2 | só o autor | alta | **Table 8** (gestação e puerpério, p. e364–e367). A linha é imagem no PDF e não foi transcrita; a janela de puerpério depende dela (AC-03r). | não conferível | autor: transcrever ou confirmar a linha |
| 3 | só o autor | alta | **ANVISA e bula** (D-PEND-22 exibe o campo "pendente de conferência"): situação regulatória da tenecteplase no AVC no Brasil; bula Metalyse 25 mg não obtida; concentração após reconstituição não conferida em bula (pacote `revisao/AC-06-dose-trombolitico.md` §9A). | campo regulatório em branco | autor: consultar ANVISA e bula |
| 4 | só o autor | alta | **Teste no celular** (persistência): nenhum registro, em `docs/`, de uso em aparelho físico. O app nativo não persiste o caso (AC-39). Pelo autor em 2026-09-13: **presumir que não foi feito**. | presumido não feito | autor |
| 6 | decisão | alta | **HSA · o que é "fato novo"**: opções A–E no pacote (a E é a leitura do autor na 10ª rodada, ainda não escolhida) `revisao/hsa-resolucao.md` §6. Até decidir, o card diz "Requer investigação antes de reperfundir — conteúdo pendente de validação". | aguardando | autor |
| 7 | só o autor | média · fonte | **AC-64**: §4 (diagnóstico) da diretriz de HSA 2023 **localizada e parafraseada** em `aha-asa-2023-hsa.md` S-00 (p. e322–e324, COR/LOE). O **verbatim** das recs. 2, 3 e 5 falta: o agente não reproduz texto longo protegido. | ◐ parcial | autor: colar o literal nas linhas `VERBATIM: ___` |
| 7a | decisão | média · clínico | **AC-66**: pela rec. 2 da §4, com déficit focal a TC negativa não basta e segue punção lombar. A interação punção lombar × trombólise não tem fonte no repositório. | aberto | autor: pacote `revisao/hsa-resolucao.md` §7 pergunta 3 |
| 8 | decisão | alta | **D-PEND-11 / AC-05**: quatro interpretações da D-139 aplicadas no código, sem confirmação (pacotes `revisao/D-139-1…4`). AC-54: a correção do AC-47 responde em parte à interpretação 4. | aguardando | autor |
| 9 | decisão | média | **D-PEND-07**: força, `contextoDaFonte` e validação humana por regra. Toda regra segue "pendente de validação médica". | aberta | autor |
| 10 | decisão | média | **D-PEND-06**: registro formal dos direitos de uso do NIHSS. | aberta | autor |
| 11 | decisão | média | **D-PEND-05 / AC-17**: i18n por chave estável; hoje a chave é o texto em português. | aberta | autor |
| 12 | decisão | baixa | **D-PEND-09 / AC-49**: corrigir `docs/avc-module.md`, o cabeçalho da fonte-mãe e a página da rec. 10 (e353 × e354). | aberta | autor |
| 13 | decisão | baixa | **D-PEND-10**: regenerar e commitar `INDICE-DE-TRAVAS.md` e `INVENTARIO-AFIRMACOES-AVC.json`. Hoje são revertidos após cada suíte. | aberta | autor |
| 14 | decisão | baixa | **AC-53**: a D-PEND-19 vale para a seleção múltipla? Hoje tocar um item marcado desmarca só aquele item. | confirmar | autor |
| 15 | decisão | média | **AC-52**: `nao_elegivel_a_evt` nunca é satisfeito, e as duas rotas de janela estendida que o exigem nunca ficam "aplicáveis". | decidir o que fazer | autor |
| 16 | decisão | — | **Pacotes de revisão**: `docs/avc/revisao/` com "Decisão humana: ___" em branco. AC-06, AC-15 e AC-03r foram decididos pelas D-PEND-22/23/24 e os pacotes ainda não foram carimbados. | aguardando | autor |
| 16a | decisão | média · fonte | **AC-60**: fontes citadas nas D-PEND-23 (bula) e D-PEND-24 (AHA 2019) não transcritas no repositório. As regras rodam como adaptação ou "a confirmar". | aberto | autor: colocar os trechos |
| 17 | achado | alta | **AC-08**: dose do trombolítico recalculada do peso atual; não existe evento de dose histórica. | aberto | código |
| 18 | achado | alta | **AC-09**: decisões não são registradas. | parcial: só a conclusão de população é versionada (`prova-avc-persistencia` A14) | código |
| 19 | achado | alta | **AC-10**: "Preciso de ajuda" não existe. "Paciente piorou" global foi entregue em `e8fed38` (§7.15). | parcial | código |
| 19a | pergunta | média | **AC-67**: «Paciente piorou» registrado por engano não tem desfazer; a tarefa só sai reconcluindo os eixos. | aberto | autor |
| 19b | decisão | baixa · interpretação | **"Prioridade"** do ajuste de rota foi lida como linha no topo de toda superfície + primeiro lugar da lista de problemas (§7.15). | confirmar | autor |
| 20 | fonte | alta · clínico | **Transferência · critério e destino**: o ciclo e o telestroke existem como registro (`e8fed38`); critério de transferência e centro de destino seguem sem fonte (Portaria 665/2012, rede local). | aberto | autor: fonte |
| 21 | achado | alta | **AC-12**: angioedema não existe; F-35b (contraste) transcrito, mas não chega a nenhuma superfície. | aberto | código + fonte |
| 22 | achado | alta | **AC-39**: nativo sem persistência (`armazenamento.native.ts` em memória). | documentado (`docs/avc/persistencia.md` §4), não implementado; os demais itens da §6 de `persistencia.md` também antes de dado real | código, antes de dado real |
| 23 | achado | alta · histórico | **AC-27**: antes de `ec8f107`, caso com UN rodava com total inflado. | sem ação possível: o atendimento não persistia | — |
| 24 | achado | alta | **AC-07**: toque repetido ao abrir ação clínica. | provavelmente resolvido pelo A17 (`fa01339`, `c513b64`); **fechamento não registrado** | confirmar e registrar |
| 25 | achado | média | **AC-13**: ciclo de vida da ação tem 4 estados; o PDF pede 8. | aberto (pacote de estados da ação) | autor + código |
| 26 | achado | média | **AC-16**: sem chamada nem retorno entre módulos; intubação e sedação ausentes (A09). | aberto | código |
| 27 | achado | média | **AC-18**: a imagem tem 2 das 3 saídas pedidas. | aberto | código |
| 28 | achado | média | **AC-19**: faltam cinco comorbidades da lista do PDF. | aberto | código |
| 29 | achado | média | **AC-20**: paciente avaliado só por RM fica com a classe da reperfusão retida. | limitação declarada | autor + código |
| 30 | achado | média | **AC-21**: não há cálculo de volume por concentração (A16). | aberto | código + fonte (F-20 parcial) |
| 31 | achado | média | **AC-22**: datas sem fuso explícito. | aberto | código |
| 32 | achado | média | **AC-31**: na calculadora avulsa, item não tocado vale 0. | aberto | código |
| 33 | achado | média | **AC-33**: contexto da Table 4 com UN sem a D-PEND-13. | aberto | código |
| 34a | achado | baixa | **AC-62**: tema claro inalcançável no app (Fase 9), então a AC-59 só foi capturada no escuro; botões ‹ › da barra de fases medem transbordo só na web. | registrado | código |
| 34b | achado | baixa · não medido | **AC-65**: a trava de procedência cobre só "repositório", "spec §", "transcrito", "D-PEND", "a confirmar". Códigos "F-nn" fora do portão da IVT não foram varridos. | a medir | código |
| 35 | achado | baixa | **AC-23**: 48 literais com mais de 200 caracteres em `avc/conteudo`, sem trava. | aberto | código |
| 36 | achado | baixa | **AC-24, AC-25**: `matriz-requisitos.md` com três classificações erradas e RQ-PER-03 desatualizado. | aberto | documento |
| 37 | achado | baixa | **AC-30 / AC-34**: tradução ES das frases compostas da síntese não medida. | aberto | código |
| 38 | achado | baixa | **AC-35**: helpers sem uso no e2e da fase 9. | aberto | código |
| 39 | achado | baixa | **AC-41**: o e2e "corrigir NÃO cria terceira medida" da A não corrige. | aberto (instrumento) | código |
| 40 | achado | baixa | **AC-42, AC-51**: `dblclick` não reproduz A17 (a prova usa dois cliques); o toque duplo não tem janela de tempo. | limites declarados | — |
| 40a | achado | baixa | **AC-68**: campo de texto grava um fato por alteração (herdado de `identificacao`); motivo da recusa e parecer enchem a trilha. **AC-69**: marco da transferência usa a hora do registro, sem retroagir; horário futuro na previsão não medido. **AC-70**: a trava de texto livre (`prova-avc-paciente`) cobre só P/A/B/C. | declarados | código |
| 41 | caso A | — | **A09**: intubação e módulos associados. | **sem teste** (depende de AC-16) | código |
| 42 | caso A | — | **A16**: concentração alterada. | **sem teste** (depende de AC-21) | código |
| 43 | caso A | — | **A05** NIHSS baixo incapacitante · **A08** IVT impedida com EVT recomendada (ganhou o cenário "transferência em curso") · **A10** reavaliação após glicemia · **A14** decisão histórica. | **parciais**: há teste, mas não mede o caso inteiro (§3 da auditoria) | código |

**Fechados, fora da fila:**
- **Achados:** AC-11 (`e8fed38`, como registro), AC-01, AC-02 (web), AC-03, AC-14 → AC-44, AC-26, AC-28, AC-29, AC-32, AC-36, AC-37, AC-38, AC-40, AC-44, AC-45, AC-46, AC-47 (rota de RM), AC-48, AC-50, AC-55, AC-56, AC-57, a D-PEND-21 (`4e05527`), AC-43 (D-PEND-22), AC-15 (D-PEND-23), janela de puerpério (D-PEND-24), AC-59 os quatro achados de interface da 7ª rodada: cabeçalho, ponto vermelho, quinta aba e degraus (`c7a1956`); AC-61 (D-PEND-25) e os achados da leitura das capturas da 7ª rodada: HSA ensinando a virar a resposta, procedência no card, duas doses no card, contadores opacos, "mesma força" sem literal (`7c59d35`). AC-58 fica registrado como diagnóstico; AC-63 (D-PEND-26, «Limpar» auditado, `68da674`).
- **Casos A01–A18 com teste que mede o caso:** A11 e A12 (`e2e/avc-paciente-piorou.spec.ts`, `e2e/avc-transferencia.spec.ts`, `prova-avc-piora-e-transferencia`), A01, A02, A03, A04, A06 (`e2e/avc-nihss-nao-testavel.spec.ts`, `prova-avc-nihss-criterios`), A07, A13 (web: `e2e/avc-persistencia.spec.ts`), A15, A17 (`e2e/avc-persistencia.spec.ts`, `prova-avc-autoria-e-toque-duplo`) e A18 na forma da D-PEND-03 (detectar e bloquear).
- ⚠️ **Método:** a cobertura de A01–A12 e A15 é a leitura de asserções da §3 (1ª rodada). Nesta rodada só A06, A13, A14, A17 e A18 foram reconferidos contra os testes existentes.

### Resultado de AC-46, AC-47 e AC-48 (4ª rodada, `62856f4`)

Prova: `scripts/prova-avc-achados-por-leitura.cjs`, de 🔴 14 verdes · 8 vermelhos para ✅ 22/22. Nenhum limiar novo.

| # | cenário | antes | correção | depois |
|---|---|---|---|---|
| AC-46 | varfarina registrada; INR 1,0, TP 12 e TTPa 30 registrados; plaquetas não; juízo "não" | **reproduzido**: *"Sem motivo para suspeitar; sem varfarina ou heparina registradas"* | texto passa a *"varfarina ou heparina registradas, com os exames de coagulação já registrados"*; sem anticoagulante, o texto antigo continua | ✅ |
| AC-47 · cenário do autor | "não incapacitante"; início há 6 h; TC sem hemorragia; penumbra em perfusão automatizada "sim"; juízo "não" | **não reproduzido**: a rota fica travada por F-31, `nao_elegivel_a_evt` nunca é satisfeito (AC-52) e o veredito já saía "não sustentada" | nenhuma; a conferência fica como trava | ✅ (trava) |
| AC-47 · rota de RM | "não incapacitante"; RM com DWI < 1/3 e FLAIR sem alteração marcada; início "não sei"; reconhecimento há 2 h | **reproduzido**: *"indicada"*, portão liberado | com déficit registrado "não incapacitante" e só rota estendida sustentando: *"Sem indicação neste caminho: o déficit foi registrado como não incapacitante"*; "Incapacitante" e "Incerto" como antes | ✅ portão não libera |
| AC-48 | cada um dos quatro itens de "segurança desconhecida" sobre candidato completo | **reproduzido** nos quatro: nenhum aparecia entre os impedimentos | entram como **informação**, sem reter; o portão fica igual ao do candidato sem o item | ✅ |

## Ponto exato de retomada

**Rodada mais recente (2026-09-13, 10ª) · D-PEND-27, «Paciente piorou» global e transferência/telestroke:** detalhe em `docs/avc/auditoria-vs-spec.md` §7.15.

| entrega | escopo | estado |
|---|---|---|
| **D-PEND-27** | «Manter a resposta» com o destaque da ação padrão; «Foi engano — limpar» secundário | ✅ `e8fed38` · prova 17·2 → 19/19 · e2e fundo `rgb(42, 55, 74)` 🔴 → `rgb(26, 107, 213)` ✅ |
| **«Paciente piorou» global (AC-10 parcial, A11)** | botão no topo fixo de toda superfície; evento com horário, texto opcional e autor; eixos reabertos; tarefa «Reavaliar agora» no topo e em primeiro; sem limiar, sem conduta | ✅ `e8fed38` · e2e 4 vermelhos → verdes (7 superfícies a 375 px, A11, espera, ES) |
| **Transferência e telestroke (AC-11, A12, A08)** | ciclo como marcos com horário; aceite não presumido; recusa com motivo; estimativa marcada; parecer só como "Avaliação especializada registrada"; plano local e revisão do acesso; linha do tempo na síntese; portão e EVT idênticos | ✅ `e8fed38` · prova 0·5 → 47/47 · e2e 6 vermelhos → verdes · ⛔ critério e destino sem fonte |
| **AC-66 / "fato novo"** | leitura do autor registrada como opção E | aguardando escolha; card inalterado |

1º `test:all` (HEAD `e8fed38`): 🔴 EXIT=1 por ambiente — um `serve -s dist` meu na 4173 foi reaproveitado e deu React #418 em toda rota (66 failed, 497 passed); nada enviado. 2º `test:all` no HEAD `e8fed38`: ✅ **EXIT=0** · 140 `npm run` + 1 `node` · Playwright **563 passed** (8,6 min), sem failed ou skipped · piora e transferência 47/47 · «Limpar» auditado 19/19 · críticos 183/183 · 132 travas ligadas · índice 120 declaradas · push `84a858d..e8fed38`; `git ls-remote` = `e8fed38543d4`; divergência 0/0.

**Rodada anterior (9ª), concluída · D-PEND-26 («Limpar» auditado) e AC-64:** detalhe em `docs/avc/auditoria-vs-spec.md` §7.14.

| entrega | escopo | estado |
|---|---|---|
| **D-PEND-26 · «Limpar» auditado** | resposta que sustenta retenção ou bloqueio → confirmação "Foi engano?" → correção "toque errado" em todas as respostas vigentes → pergunta "não respondida"; regra genérica (HSA e coagulação); «Sim»→«Não» direto continua retendo; confirmação sem animação | ✅ `5705840` (decisão) + `68da674` · prova 0·3 → 17/17 · e2e 2 vermelhos (HSA, coagulação) → verdes |
| **AC-64 · §4 da diretriz de HSA 2023** | localização + paráfrase (p. e322–e324) em S-00; pacote `hsa-resolucao.md` com proposta por item e decisão em branco; card inalterado | ◐ verbatim pendente do autor (não reproduzido pelo agente) |

`test:all` no HEAD `68da674`: ✅ **EXIT=0** · 140 scripts npm · Playwright **552 passed** (8,4 min), sem failed ou skipped · «Limpar» auditado 17/17 · rodada 8 28/28 · críticos 183/183 · 131 travas ligadas · índice 119 declaradas · execução 15:41–15:53 · push `4488259..68da674` → `origin/refactor/clinical-modules-rebuild` (inclui `5705840`); `git ls-remote` = `68da674267374d6dfdd7eaaf60b153ea96ec9db7`; divergência 0/0. Sem deploy, sem merge em `main`.

**Rodada anterior (8ª), concluída · HSA sem atalho, procedência fora do card, card de dose, D-PEND-25:** detalhe em `docs/avc/auditoria-vs-spec.md` §7.13.

| entrega | escopo | estado |
|---|---|---|
| **Entrega 1 (alta) · HSA** | card sem «responder Não» e sem «Resolver»; «Sim» → «Não» sem fato novo não libera; pacote `revisao/hsa-resolucao.md` | ✅ `7c59d35` · prova + e2e vermelhos → verdes · ⚠️ brecha «Limpar» + «Não» declarada (AC-63) |
| **Entrega 2 · procedência** | "repositório", "spec §", "transcrito", "D-PEND", "a confirmar" só no ⓘ; trava genérica e2e | ✅ `7c59d35` · 2 cenários vermelhos (portão; HSA+TNK) → verdes |
| **Entrega 3 · dose e Reperfusão** | uma dose com mL; Table 7 só em mg, rotulada, "em vez de"; D-PEND-25 alteplase exata com bolus e infusão; contadores em linguagem direta; "mesma força" com literal e página (e357) no ⓘ | ✅ `583dde3` (decisão) + `7c59d35` · e2e 4/4 vermelhos → verdes |

`test:all` no HEAD `7c59d35`: ✅ **EXIT=0** · 139 scripts npm · Playwright **549 passed** (8,4 min), sem failed ou skipped · rodada 8 28/28 · D-PEND-22/23/24 33/33 · críticos 183/183 · superfície F 92/92 · execução 15:11–15:22 · push `1010a21..7c59d35` → `origin/refactor/clinical-modules-rebuild` (inclui `583dde3`, `9f79e66`); `git ls-remote` = `7c59d359ce8b387b80fff599fd1996b674ede7a9`; divergência 0/0. Sem deploy, sem merge em `main`.

**Rodada anterior (7ª), concluída · AC-59, D-PEND-22/23/24 e interface:** detalhe em `docs/avc/auditoria-vs-spec.md` §7.12.

| entrega | escopo | estado |
|---|---|---|
| **Entrega 1 · AC-59** | contorno da opção neutra ≥ 3:1 contra card e fundo (claro `#818EA1`, escuro `#5C697E`) | ✅ `c7a1956` · contraste 🔴 4 falhas → ✅ 96 OK · e2e contorno medido 🔴 2,85:1 → ✅ · só tema escuro capturável (AC-62) |
| **Entrega 2 · D-PEND-22/23/24** | TNK exata (70 kg 17,5 mg · 3,5 mL; 100 e 120 kg 25 mg) com Table 7 como conferência e regulatório pendente; HSA "requer avaliação especializada / corrigir e reavaliar"; puerpério 14 dias | ✅ `95028a5` (decisões) + `c7a1956` · prova 11·22 → 33/33 · e2e 🔴 4 → ✅ 4/4 |
| **Entrega 3 · interface** | cabeçalho em duas linhas curtas, com título em uma; marcador neutro; botões ‹ › na barra de fases; degraus inertes com campo vazio | ✅ `c7a1956` · e2e 🔴 4 → ✅ 4/4 · 9 passos de e2e ajustados (degrau não parte mais do vazio) |

`test:all` no HEAD `c7a1956`: ✅ **EXIT=0** · 138 scripts npm · Playwright **540 passed** (8,3 min), sem failed ou skipped · D-PEND-22/23/24 33/33 · opção neutra 25/25 · contraste 96 OK · afordância 131 · críticos 183/183 · superfície F 92/92 · mutações 84/84 · 129 travas ligadas · índice 117 declaradas · censo 65 instrumentos · execução 14:19–14:30 · push `a7abed8..c7a1956` → `origin/refactor/clinical-modules-rebuild` (inclui `95028a5`); `git ls-remote` = `c7a19566ac1b9db5d796b1faec7eb433336812fd`; divergência 0/0. Sem deploy, sem merge em `main`.

**Rodada anterior (6ª), concluída · D-PEND-21 e fila consolidada:** detalhe em `docs/avc/auditoria-vs-spec.md` §7.11.

| entrega | escopo | estado |
|---|---|---|
| **Entrega 1 · D-PEND-21** | opção não marcada neutra; cor só após marcação, com ✓ e borda; correção na fonte única `design-system/opcao-de-decisao.ts`, consumida pelos quatro desenhadores | ✅ `4447e15` (decisão) + `4e05527` (código) · e2e genérico 🔴 4 superfícies, 23 perguntas, 138 opções → ✅ 7/7 · prova 2·9 → 25/25 · contraste 86 → 92 OK · capturas a 375 px antes e depois |
| **Entrega 2 · fila consolidada** | tabela única de tudo que está aberto (seção abaixo), com o resultado de AC-46/47/48 | ✅ só `docs/` |
| **Entrega 3 · D-PEND-22/23/24** | dose exata + Table 7; HSA; puerpério 14 dias | ⛔ **não iniciada**: texto das decisões não enviado |

`test:all` no HEAD `4e05527`: ✅ **EXIT=0** · 137 scripts npm · Playwright **532 passed** (8,1 min), sem failed ou skipped · 128 travas ligadas · índice 116 declaradas · censo 65 instrumentos · push `8633f76..4e05527`; `git ls-remote` = `4e05527d9b710f6dd94d0d7dbd98b40ca48da522`; divergência 0/0. Sem deploy, sem merge em `main`.

**Rodada anterior (5ª), concluída · limpeza visual, sem regra clínica alterada:** detalhe em `docs/avc/auditoria-vs-spec.md` §7.10.

| entrega | escopo | estado |
|---|---|---|
| **Limpeza visual** | PA alta com uma recomendação completa, aviso e rodapé curtos · respiração sem eco · nova aferição medida (nenhum botão removido) · frase "Avaliar e tratar ameaças imediatas" uma vez só | ✅ `1da11b9` · prova 5·8 → 13/13 · e2e "uma frase, uma vez" 🔴 2× → ✅ |
| **«Limpar» (AC-56)** | linha própria sempre reservada; pílula com corpo e borda, ⛔ diferente de toda opção; tocar nele ⛔ marca nada | ✅ `1da11b9` + `60d580d` · e2e 🔴 547 → 595 px → ✅ |
| **Regressão da trombólise (AC-57/58)** | hipótese de import refutada; causa real: mutação gravada na árvore durante o build | ✅ `6ffe520` · mutações em cópia isolada (sonda 5·2 → 7/7) · trava de ciclo de import (0 ciclos em 558 arquivos) |

1º `test:all` (HEAD `1da11b9`): 🔴 EXIT=1 em `test:avc-afordancia` («Limpar» como texto), nada enviado. 2º `test:all` no HEAD `60d580d`: ✅ **EXIT=0** · 136 scripts npm · Playwright **525 passed** (8,1 min), sem failed ou skipped · mutações 84/84 · 127 travas ligadas · índice 115 declaradas · censo 65 instrumentos · push `589c55d..60d580d`; `git ls-remote` = `60d580d0f56a9892063e547681c8a13402ddd08c`; divergência 0/0. Sem deploy.

**Rodada anterior (4ª), concluída:** decisões D-PEND-18/19/20 registradas; três entregas.

| entrega | escopo | estado |
|---|---|---|
| **Entrega 1 · achados por leitura** | AC-46, AC-47, AC-48 verificados rodando | ✅ `62856f4` · AC-46 reproduzido e corrigido · AC-47: cenário de perfusão **não reproduzido**; rota de RM reproduzida e corrigida · AC-48 reproduzido e corrigido · prova 14·8 → 22/22 |
| **Entrega 2 · D-PEND-18/19/20** | AC-44 temperatura (§4.4 transcrita, F-38) · AC-45 segundo toque ignorado + «Limpar» · AC-50 texto removido | ✅ `f314f36` · prova 0·17 → 20/20 · e2e 3/3 vermelhos → verdes |
| **Entrega 3 · pacote AC-43 ampliado** | recomendação textual × Table 7; comparativo 50–100 kg; campo regulatório em branco | ✅ só `docs/` |

`test:all` no HEAD `9ef7270`: ✅ **EXIT=0** · 133 scripts npm · Playwright **517 passed** (8,0 min), sem failed ou skipped · achados 22/22 · D-PEND-18/19/20 20/20 · autoria e toque duplo 32/32 · persistência 40/40 · mutações 84/84 · 124 travas ligadas · índice 112 declaradas · censo 65 instrumentos · push `e660433..9ef7270` → `origin/refactor/clinical-modules-rebuild`; `git ls-remote` = `9ef72701b46b50ccccf958c46e82933205eea9c5`; divergência 0/0. O commit só de `docs/` sobe em seguida (D-PEND-17).

**Rodada anterior (3ª), concluída:** decisões D-PEND-15/16/17; duas entregas.

| entrega | escopo | estado |
|---|---|---|
| **Entrega 1 · revisão médica** | nove pacotes em `docs/avc/revisao/` (HSA; dose do trombolítico; temperatura; estados da ação; puerpério; quatro interpretações da D-139), com decisão humana em branco | ✅ escritos · `commit só de `docs/` com os pacotes e a documentação` (só `docs/`, D-PEND-17) |
| **Entrega 2 · correções sem decisão clínica** | (a) AC-40; (b) toque duplo no registro, para toda ação; (c) AC-39 documentado | ✅ `c513b64` (código) · `7dc42c5` (declaração da prova) · `test:all` no HEAD `7dc42c5`: EXIT=0, Playwright 514/514 · push `fc81900..7dc42c5` |

**Rodada anterior (2ª), concluída:**

| entrega | escopo | estado |
|---|---|---|
| **Entrega 1** | AC-29, D-PEND-13, D-PEND-14 e commit de `docs/` | ✅ concluída · `207e4be` (código) · `773ed92` (docs) · `9a0ecea` e `8e07c30` (fixtures presas ao NIHSS de fora) · `test:all` no HEAD `8e07c30`: EXIT=0, Playwright 506/506 · push `2e28bd8..8e07c30` |
| **Entrega 2** | AC-02: persistência local-first (D-PEND-02, D-PEND-03) | ✅ concluída · `fa01339` (código) · `5c41455` (docs) · `fc81900` (prova lê fonte sem comentário) · `test:all` no HEAD `fc81900`: EXIT=0, Playwright 510/510 · push `8e07c30..fc81900` |

Sem deploy, merge em `main`, PR ou mudança na Vercel. Produção segue congelada em
`443f0d8` / deploy `j9p41qshb`.

## Decisões do autor registradas nesta rodada

- **D-PEND-15** (fecha AC-38): motivo da correção opcional, autor obrigatório, ausência visível; a decisão de 30/08 fica mantida.
- **D-PEND-16** (confirma AC-32): com UN, "contradiz" só quando a soma parcial excede o teto.
- **D-PEND-17:** commit só de `docs/` dispensa `test:all` quando `git diff --stat` tocar só `docs/`.

Registradas antes, na 2ª rodada:

- **D-PEND-13:** soma de NIHSS com item UN é limite inferior do escore. Satisfaz piso quando parcial ≥ k; abaixo, "inconclusivo por item não testável"; nunca satisfaz teto. Interpretação humana; a fonte não define.
- **D-PEND-14:** NIHSS de outro serviço é contexto, nunca critério. O app pergunta se houve itens não testáveis; salvo "Não, escala completa", o escore aparece só na síntese. Toda regra consome só o NIHSS deste atendimento.

Ambas estão em `docs/decisoes.md`, com data.

## Entrega 1 · feito

| item | commit | vermelho antes | verde depois |
|---|---|---|---|
| D-PEND-13, D-PEND-14 e AC-29 | `207e4be` | nó 9 · 27; e2e 6/6 vermelhos | nó 30/30; e2e 6/6; 84 e2e relacionados verdes |

Detalhe em `docs/avc/auditoria-vs-spec.md` §7.5.

**Achados novos:**
- AC-31: calculadora avulsa conta item não tocado como 0.
- AC-32: soma com UN acima do teto dá "contradiz" — ✅ **confirmado pela D-PEND-16**.
- AC-33: contexto da Table 4 sem D-PEND-13.
- AC-34: tradução da síntese composta não medida.
- AC-35: helpers mortos no e2e da fase 9.

## Entrega 2 · feito

| item | commit | vermelho antes | verde depois |
|---|---|---|---|
| AC-02: log append-only em IndexedDB, recuperação, trava por caso, migração v1→v2 | `fa01339` | ordem de gravação e linha do tempo: 26 · 7 | prova 40/40; e2e A13, A17, D-PEND-03, v1→v2 verdes |
| correção sem motivo visível ("sem motivo informado") | `fa01339` | nenhuma tela mostrava motivo em `8e07c30` | lab `avc-superficie-laboratorio.spec.ts:99` verde |

⚠️ **`seq`:** agora é atribuído pelo armazenamento, na gravação. A primeira versão, nunca commitada, deixava o produtor numerar. O ajuste que tinha sido feito na prova foi revertido.

**Achados:**
- AC-36: **clínico, fechado** — o app aceitava NIHSS de outro serviço como basal/critério e como reexame. Fechado pela D-PEND-14 em `207e4be`.
- AC-37: `seq` pelo produtor; fechado antes do push.
- AC-38: correção sem motivo segue aceita — ✅ **fechado pela D-PEND-15**.
- AC-39: nativo sem persistência.
- AC-40: autor só local.
- AC-41: e2e "corrigir" da A não é correção.
- AC-42: `dblclick` não reproduz A17.

Detalhe em `docs/avc/auditoria-vs-spec.md` §7.6.

## 3ª rodada · achados

Detalhe em `docs/avc/auditoria-vs-spec.md` §7.8 e nos pacotes `docs/avc/revisao/`.

- **AC-40:** ✅ fechado em `c513b64` — autor = `user.id` da sessão Supabase; sem sessão, ID do aparelho marcado no evento e na linha do tempo.
- **Toque duplo:** a proteção morava em `abrirNovaInstancia` (três botões); agora vale no registro, para toda ação (`c513b64`).
- **AC-39:** documentado, não implementado (`docs/avc/persistencia.md` §4).
- **AC-43 · alta · clínico:** a dose da tenecteplase não segue a tabela por faixa de peso da Table 7 (70 kg: 18 mg no app, 20 mg na faixa). **Não corrigido.**
- **AC-44 · alta · clínico:** a temperatura saiu do caminho isquêmico, mas a §4.4 da AHA 2026 tem recomendação COR 1. **Não corrigido.**
- **AC-45 · média:** tocar duas vezes numa opção já marcada desfaz a escolha.
- **AC-46, AC-47, AC-48:** achados por leitura na D-139, **a verificar por execução**.
- **AC-49, AC-50, AC-51:** baixos (página da rec. 10 na transcrição, texto órfão de puerpério, toque duplo sem janela).

## 4ª rodada · achados

Detalhe em `docs/avc/auditoria-vs-spec.md` §7.9.

- **AC-44, AC-45, AC-50:** ✅ fechados pelas D-PEND-18/19/20 em `f314f36`.
- **AC-46, AC-48:** ✅ reproduzidos e corrigidos em `62856f4`, sem limiar novo.
- **AC-47:** cenário de perfusão **não reproduzido** (a rota fica travada pela F-31 e `nao_elegivel_a_evt` nunca é satisfeito); a rota de RM com início desconhecido foi reproduzida e corrigida em `62856f4`.
- **AC-52 · média:** `nao_elegivel_a_evt` nunca é satisfeito.
- **AC-53 · baixa · confirmar:** a D-PEND-19 não foi aplicada à seleção múltipla.
- **AC-54 · baixa:** a correção do AC-47 responde em parte à interpretação 4 da D-139.

## Achados críticos

| # | estado |
|---|---|
| AC-01 | ✅ fechado em `ec8f107` |
| AC-02 · persistência | ✅ fechado em `fa01339` no web (IndexedDB) · ⚠️ nativo sem persistência (AC-39) |
| AC-03 | ✅ fechado em `2e28bd8` |

## Decisões abertas e próximo passo

⚠️ Movidos para a **Fila consolidada** no topo deste arquivo: uma tabela só, para não haver duas listas divergindo.
