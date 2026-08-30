# Migrations arquivadas — ⛔ NUNCA aplicadas, e ⛔ NÃO elegíveis a `db push`

Esta pasta está **fora** de `supabase/migrations/`, e é isso que a define: o que
está aqui ⛔ **não** entra na sequência executável.

⚠️ O conteúdo dos arquivos é **verbatim**. ⛔ Nada foi editado, ⛔ nenhum cabeçalho
foi acrescentado dentro do SQL, e o nome foi preservado. ⚠️ Uma migration
histórica ⛔ não se altera — ela se **tira do caminho**.

---

## `20260525120000_admin_full_controls.sql`

| | |
|---|---|
| **commit de origem** | `fc03e80`, 2026-05-25 — *"feat(admin): painel de gestão de utilizadores completo"* |
| **aplicada no remoto?** | ⛔ **Nunca.** ⛔ Não consta em `supabase_migrations.schema_migrations` |
| **superada por** | `20260612123357_usage_and_ratings`, aplicada em 2026-06-12 |
| **arquivada em** | 2026-08-30, na auditoria de segurança |

### ⚠️⚠️ Por que executá-la HOJE causaria regressão

Ela recria `public.admin_list_app_users()` devolvendo **oito** colunas:

```
id · email · nome · status · role · pagamento · data_criacao · ultimo_acesso
```

⚠️ A versão **viva** — criada pela migration remota posterior — devolve **dez**:
as mesmas oito **mais** `casos_count` e `ultimo_caso`.

⛔⛔ Como ela usa `create or replace`, um `db push` a executaria e **derrubaria as
duas colunas**. `lib/admin-users.ts` chama essa RPC e o painel administrativo
depende do retorno — a regressão apareceria como painel quebrado, sem erro de
migration.

### ⛔ Por que ⛔ não foi apenas neutralizada no lugar

Um cabeçalho *"⛔ não aplicar"* dentro do arquivo teria dois defeitos: seria
**edição de migration histórica**, e deixaria um artefato inerte dentro da
sequência executável, esperando que alguém leia o comentário antes de rodar o
push. ⚠️ Tirar da pasta é a única forma que ⛔ não depende de ⛔ ninguém ler nada.

### O que ela ⛔ não é

⛔ Ela ⛔ **não** foi marcada como aplicada, e ⛔ nada foi fingido sobre o histórico.
Ela permanece aqui **⛔ só** para auditoria: para quem um dia perguntar por que o
painel ganhou controles em maio e a função só mudou em junho.
