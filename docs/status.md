# Status · App Emergências — módulo AVC (PDF v1.1)

**Última atualização:** 2026-09-13
**Branch:** `refactor/clinical-modules-rebuild` · **HEAD:** commit de docs sobre `fa01339` — ver §"Suíte e envio da Entrega 2" em `docs/avc/auditoria-vs-spec.md` §7.6

## Ponto exato de retomada

**Rodada em andamento:** duas entregas, cada uma com commits separados por caminho explícito.

| entrega | escopo | estado |
|---|---|---|
| **Entrega 1** | AC-29, D-PEND-13, D-PEND-14 e commit de `docs/` | ✅ concluída · `207e4be` (código) · `773ed92` (docs) · `9a0ecea` e `8e07c30` (fixtures presas ao NIHSS de fora) · `test:all` no HEAD `8e07c30`: EXIT=0, Playwright 506/506 · push `2e28bd8..8e07c30` |
| **Entrega 2** | AC-02: persistência local-first (D-PEND-02, D-PEND-03) | ✅ implementada · `fa01339` · prova de módulo 40/40 · e2e alvo 45/45 · `test:all` e push: ver auditoria §7.6 |

Sem deploy, merge em `main`, PR ou mudança na Vercel. Produção segue congelada em
`443f0d8` / deploy `j9p41qshb`.

## Decisões do autor registradas nesta rodada

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
- AC-32: soma com UN acima do teto dá "contradiz"; **confirmar com o autor**.
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
- AC-38: correção sem motivo segue aceita; **confirmar com o autor**.
- AC-39: nativo sem persistência.
- AC-40: autor só local.
- AC-41: e2e "corrigir" da A não é correção.
- AC-42: `dblclick` não reproduz A17.

Detalhe em `docs/avc/auditoria-vs-spec.md` §7.6.

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
| D-PEND-11 | confirmar as 4 interpretações de D-139 |
| D-PEND-12 | registrar formalmente a dose inteira do trombolítico |
| AC-32 | confirmar "contradiz" para soma com UN acima do teto (6–9) |
| AC-38 | correção deve exigir motivo? Hoje não exige (decisão de 2026-08-30) |

## Próximo passo nesta rodada

1. `test:all` completo no HEAD final (commit de docs da Entrega 2) → push só se verde.
2. Aceite do autor da Entrega 2; decisões AC-38 (motivo obrigatório?) e AC-32.
3. Antes de dado real de paciente: AC-39 (persistência nativa) e AC-40 (identidade), além dos limites listados em `docs/avc/persistencia.md`.
