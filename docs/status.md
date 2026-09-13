# Status · App Emergências — módulo AVC (PDF v1.1)

**Última atualização:** 2026-09-13
**Branch:** `refactor/clinical-modules-rebuild` · **HEAD de código:** `207e4be` (Entrega 1; push pendente de `test:all` verde)

## Ponto exato de retomada

**Rodada em andamento:** duas entregas, cada uma com commits separados por caminho explícito.

| entrega | escopo | estado |
|---|---|---|
| **Entrega 1** | AC-29, D-PEND-13, D-PEND-14 e commit de `docs/` | código commitado em `207e4be`; commit de `docs/` feito junto com este status; `test:all` e push a seguir |
| **Entrega 2** | AC-02: persistência local-first (D-PEND-02) | não iniciada |

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

## Achados críticos

| # | estado |
|---|---|
| AC-01 | ✅ fechado em `ec8f107` |
| AC-02 · persistência | ⛔ aberto — Entrega 2 |
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

## Próximo passo nesta rodada

1. `test:all` completo no HEAD com `docs/` commitado → push se verde.
2. Entrega 2 (AC-02): provas vermelhas de A13, A17, A14, correção versionada, segunda abertura bloqueada e migração v1 → v2; depois a implementação.
