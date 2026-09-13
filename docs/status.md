# Status · App Emergências — módulo AVC (PDF v1.1)

**Última atualização:** 2026-09-13
**Branch:** `refactor/clinical-modules-rebuild` · **HEAD de código:** `60d580d`, enviado; por cima, um commit só de `docs/` (D-PEND-17)

## Ponto exato de retomada

**Rodada mais recente (2026-09-13, 5ª) · limpeza visual, sem regra clínica alterada:** detalhe em `docs/avc/auditoria-vs-spec.md` §7.10.

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

## Decisões abertas

| # | decisão |
|---|---|
| D-PEND-05 | i18n por chave estável |
| D-PEND-06 | direitos de uso do NIHSS: registro formal |
| D-PEND-07 | força, `contextoDaFonte` e validação humana por regra |
| D-PEND-09 | corrigir `docs/avc-module.md` e o cabeçalho da fonte-mãe |
| D-PEND-10 | regenerar e commitar `INDICE-DE-TRAVAS.md` e `INVENTARIO-AFIRMACOES-AVC.json` |
| D-PEND-11 | confirmar as 4 interpretações de D-139 — pacotes `revisao/D-139-1…4` |
| D-PEND-12 | registrar formalmente a dose inteira do trombolítico — ver pacote `revisao/AC-06-dose-trombolitico.md` e AC-43 |
| pacotes de revisão | nove decisões em `docs/avc/revisao/`, com "Decisão humana: ___" em branco |

## Próximo passo nesta rodada

1. Decisões pendentes do autor: AC-43 (dose da tenecteplase, pacote ampliado §9A), AC-15 (HSA) e janela de puerpério.
2. Confirmar AC-53 (seleção múltipla e D-PEND-19) e decidir o que fazer com AC-52.
3. Antes de dado real de paciente: AC-39 (adaptador SQLite, §4 de `docs/avc/persistencia.md`) e os demais itens da §6.
