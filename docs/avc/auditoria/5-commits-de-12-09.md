## 5. Os 26 commits de 12/09 (`2cc88de..52aa4e2`) · qual spec seguiram e onde divergem do PDF

### 5.1 · Spec seguida

O PDF v1.1 chegou em 2026-09-13, **depois** desses commits. Os corpos dos commits
não o citam: `v1.1\|atendimento guiado\|spec-avc.md` = 0. Controle:
`PLANO-CORRECAO` = 14.

| grupo | commits | contrato seguido |
|---|---|---|
| Correção dos críticos | `2cc88de`, `230b0ac`, `e643547`, `37a37f4`, `d90aeb5`, `6045a15`, `058ae0b`, `8cce85d`, `397bca3`, `77f56da`, `3e94b1f`, `55554d1`, `26bd9da`, `3566d47` | `auditoria/PLANO-CORRECAO-AVC-CRITICOS.md` (§13, *"plano aprovado"*, 2026-09-12); `auditoria/ESPECIFICACAO-AVC.md` V1 (emenda §2.3, D2); `auditoria/CONSOLIDACAO-CLINICA-AVC.md` (emenda D1 no Bloco 4) |
| Red-team pós-correção | `012f7ee` (C40), `995fa56` (O6b), `5e6892e` (O4), `588ee06` (O3) | Mesma especificação, com emendas §1.1 (O4) e §1.8 item 4 (O3) |
| Revisão visual do autor | `5bef7c4`, `4e48b5c`, `6f230f1`, `b170b44`, `4d1a896`, `a3c0c33`, `237e074`, `52aa4e2` | Frases do autor citadas nas mensagens de commit |

### 5.2 · Divergências em relação ao PDF v1.1

| gravidade | commit | PDF v1.1 | o que o commit fez |
|---|---|---|---|
| alta | `77f56da` (D2) | *"Separar indicado, decidido, prescrito, preparado, iniciado, administrado/concluído, interrompido e cancelado"* (`docs/spec-avc.md:357`) | fixou 4 estados (AC-13) |
| alta | `6f230f1` | *"Não invente dose"*; toda regra com validação humana registrada | arredondamento inteiro sem fonte (AC-06) |
| média | `b170b44` | temperatura entre as observações de chegada (RQ-T01-03) | removeu o eixo E e a temperatura do isquêmico (AC-14) |
| média | `588ee06` (O3) | hemorragia com caminho próprio; decisão com fonte | retenção por suspeita clínica de HSA sem fonte (AC-15) |
| média | `4e48b5c` | *"Preciso de ajuda"* e apoio (p.10) | removeu o registro solto de consultas especializadas; a especialidade continua só ao lado do item da Table 8 |
| baixa | `237e074`, `52aa4e2` | p.26: voláteis exibidos com horário e origem | a medida anterior fica atrás de "Ver histórico" (D-134, dívida declarada no commit) |
| baixa | `4d1a896` | ficha de execução (o que, quanto, via, tempo, reavaliar) | retirou o bloco "O que fazer agora"; agentes e doses continuam no bloco de tratamento (`e2e/avc-estabilizacao-composicao.spec.ts:304`). Nenhuma divergência medida além da mudança de lugar |

### 5.3 · Decisões clínicas sem fonte ou sem registro humano

A regra do projeto exige **nome, versão e data** para registro humano. Nenhuma das
decisões abaixo tem versão.

| decisão | commit / documento | fonte | registro humano |
|---|---|---|---|
| Dose do trombolítico em mg inteiro | `6f230f1` | nenhuma; o commit diz que a fonte não define arredondamento | **só a mensagem de commit** (frase do autor, 2026-09-12); fora de `docs/decisoes.md` e da especificação |
| Remover eixo E e temperatura | `b170b44` | nenhuma fonte transcrita dá corte (commit) | só a mensagem de commit |
| Remover o registro de consultas especializadas | `4e48b5c` | Table 8 (a especialidade fica no item) | só a mensagem de commit |
| Suspeita de HSA retém a execução de IVT e EVT | `588ee06` | *"a fonte transcrita não tem item sobre HSA clínica"* | emenda §1.8 item 4, com data |
| Marcos incompatíveis → reconciliação, sem escolha | `5e6892e` | a fonte dá disjunção; a escolha é do autor | emenda §1.1, com data |
| HR-1..HR-5, `ivt_rapidez`, `planejada`, AVC-18, heparina | PLANO §13 | parte com fonte | PLANO §13, *"decisões do autor incorporadas (2026-09-12)"* |
| **Interpretações 1–4 de D-139** | `397bca3`, `3566d47` | interpretação; o item 2 mapeia *"coagulation test results"* para INR, PT ou aPTT | **nenhum**: o próprio documento diz *"o autor precisa confirmar"* (AC-05) |
| RM sem resultado de hemorragia | D-139, AVC-16 | *"EVIDÊNCIA INSUFICIENTE"* | limitação declarada, sem decisão |

---

