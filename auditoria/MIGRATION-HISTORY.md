# Histórico de migrations — divergência real × simetria estética

⛔⛔ **`supabase migration repair` ⛔ NÃO está autorizado**, e esta tabela existe
⛔ justamente para impedir que ele seja rodado por reflexo.

⚠️⚠️ O princípio: **o histórico precisa representar a verdade, ⛔ não simetria.**
Marcar como aplicada uma migration que ⛔ nunca rodou faz as listas ficarem iguais
e o banco ficar **mentindo** — e a mentira só aparece na próxima pessoa que
confiar no histórico para saber o que existe no schema.

## ⚠️ O que ⛔ NÃO foi feito

O projeto ⛔ não está linkado (`supabase link` não foi executado). Linkar é
operação **remota** e envolve credencial, e o escopo desta etapa é local. ⚠️ Por
isso a coluna **remoto** abaixo está marcada `?` — ela só pode ser preenchida na
Fase 0, e ⛔ inventá-la seria pior que deixá-la vazia.

## Tabela

| Migration | Local | Remoto | Aplicada? | Ação proposta | Efeito de `repair` | Risco se errado |
|---|---|---|---|---|---|---|
| `20260324103000_create_clinical_session_tables` | ✅ | ? | provável sim | ⛔ nenhuma | — | — |
| `20260429110000_create_app_users_auth` | ✅ | ? | provável sim | ⛔ nenhuma | — | — |
| `20260429170500_backfill_app_users…` | ✅ | ? | provável sim | ⛔ nenhuma | — | — |
| `20260511105000_create_admin_list_users_rpc` | ✅ | ? | provável sim | ⛔ nenhuma | — | — |
| `20260511121000_enable_admin_user_management_policies` | ✅ | ? | provável sim | ⛔ nenhuma | — | — |
| `20260511124500_fix_app_user_auth_rpcs` | ✅ | ? | provável sim | ⛔ nenhuma | — | — |
| `20260612123357_usage_and_ratings` | ✅ | ? | provável sim | ⛔ nenhuma | — | — |
| `20260612132325_admin_usage_summary` | ✅ | ? | provável sim | ⛔ nenhuma | — | — |
| `20260619015020_enable_rls_healthcheck` | ✅ | ? | provável sim | ⛔ nenhuma | — | — |
| **`20260525120000_admin_full_controls`** | ⛔ **arquivada** | **ausente** | ⛔ **NUNCA** | ⛔ **⛔ NENHUMA** | marcaria como aplicada algo que ⛔ nunca rodou | ⛔ o schema passaria a alegar `casos_count`/`ultimo_caso` removidos que ⛔ **existem** |
| `20260830180000_harden_rpc_grants_and_search_path` | ✅ | ausente | ⛔ não | aplicar na Fase 1 | — | — |
| `20260830190000_compatibilidade_identidade_anonima` | ✅ | ausente | ⛔ não | aplicar na Fase 1 | — | — |
| `20260830191000_fecha_leitura_publica_de_sessoes` | ✅ | ausente | ⛔ não | aplicar ⛔ **só** na Fase 4 | — | — |

## ⚠️⚠️ `20260525120000_admin_full_controls` — o caso que ⛔ NÃO pede reparo

- ⛔ **Nunca foi aplicada.** Foi commitada (`fc03e80`) e ⛔ nunca rodou contra o banco.
- Foi **arquivada** em `supabase/migrations-arquivadas/`, verbatim, ⛔ sem edição.
- ⚠️⚠️ **⛔ NÃO deve ser marcada como aplicada** para deixar listas iguais. Ela
  derrubaria `casos_count` e `ultimo_caso`, que estão **em uso**.

⚠️⚠️ E o ponto que corrige o runbook anterior: **remover corretamente do local uma
migration que ⛔ nunca foi aplicada ⛔ não cria divergência de histórico.** O remoto
⛔ nunca teve essa entrada. ⛔ Não há nada para reparar — ⛔ eu tinha escrito que
`migration repair` seria provavelmente necessário, e isso estava errado.

## ⚠️ Regra de decisão para a Fase 0

| Situação | É divergência real? | `repair` é a resposta? |
|---|---|---|
| Local removeu migration **⛔ nunca aplicada** | ⛔ **Não** | ⛔ **Não.** ⛔ Nada a fazer |
| Remoto diz aplicada, arquivo **perdido** no repo | ⚠️ **Sim** | Talvez — ⛔ mas primeiro **recuperar o SQL** do banco |
| Local tem migration pendente ⛔ não aplicada | ⛔ Não | ⛔ Não — é o estado normal antes do `push` |
| Remoto e local com **mesmo timestamp, conteúdo diferente** | ⚠️⚠️ **Sim, grave** | ⛔ Parar. Investigar antes de ⛔ qualquer coisa |

⚠️ ⛔ Só a segunda e a quarta linhas justificam sequer **considerar** `repair` — e
⛔ nenhuma delas está confirmada hoje.
