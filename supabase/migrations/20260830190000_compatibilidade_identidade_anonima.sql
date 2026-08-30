-- ═══════════════════════════════════════════════════════════════════════════
-- FASE 1 · COMPATIBILIDADE COM IDENTIDADE ANÔNIMA — ⛔ e ⛔ NADA MAIS.
--
-- ⛔⛔ NÃO APLICADA. ⛔ Nenhum `db push` foi feito.
--
-- ── ⚠️⚠️ POR QUE ESTA MIGRATION ⛔ NÃO FECHA ⛔ NADA ────────────────────────
--
-- ⚠️ Ela é ⛔ **deliberadamente inerte** para quem usa o app hoje: ⛔ nenhuma
-- política muda, ⛔ nenhum acesso é retirado. Aplicá-la ⛔ não quebra o fluxo ⛔ não
-- autenticado, porque `auth.uid()` continua NULO para o papel `anon` — que é
-- ⛔ exatamente o que já acontece.
--
-- ⚠️⚠️ E ela é **pré-requisito** de habilitar Anonymous Sign-In: sem a guarda
-- do trigger, o **segundo** usuário anônimo colide em `app_users_email_key`,
-- porque os dois tentariam `email = ''`. ⛔ Habilitar antes disto é proibido.
--
-- ⚠️ O fechamento do P0 vive em `20260830191000`, e ⛔ só pode rodar depois de o
-- cliente ser capaz de obter `auth.uid()`.
-- ═══════════════════════════════════════════════════════════════════════════
-- ── 1 · A COLUNA DE POSSE, e a ⛔ CORREÇÃO DO ALVO DA CHAVE ────────────────
--
-- ⚠️⚠️ A FK apontava para `public.app_users`. ⛔ Isso ⛔ TORNA A IDENTIDADE
-- ANÔNIMA IMPOSSÍVEL: o usuário anônimo ⛔ não tem — ⛔ e ⛔ não pode ter — linha em
-- `app_users`, porque `app_users_email_key` é UNIQUE e ⛔ todos os anônimos
-- compartilhariam o e-mail vazio.
--
-- ⚠️ `auth.users` é o registro de **identidade**; `app_users` é o de **cadastro
-- aprovado**. Posse é da identidade.
--
-- ⚠️ `if exists` / `if not exists` em toda parte: a coluna existe na produção
-- por **desvio** (foi criada fora do histórico de migrations), e ⛔ não existe
-- num banco local recriado do zero. A migration precisa valer nos dois.
alter table public.clinical_sessions
  add column if not exists user_id uuid;

-- ── ⚠️⚠️ PRECONDIÇÃO · A TROCA DE FK ⛔ NÃO PODE INVALIDAR LINHA ⛔ NENHUMA ──
--
-- ⚠️ O raciocínio diz que é seguro: `app_users.id` já referencia `auth.users(id)`,
-- então ⛔ todo `user_id` válido sob a FK antiga está, ⛔ por construção, em
-- `auth.users`. A FK nova é **estritamente mais fraca**.
--
-- ⚠️⚠️ Mas raciocínio ⛔ não é medição, e este banco **já tem desvio** — a própria
-- coluna `user_id` foi criada fora do histórico de migrations. Se ela tiver
-- nascido com FK `not valid`, ⛔ ou sem FK ⛔ nenhuma, pode haver linha que o
-- raciocínio ⛔ não cobre.
--
-- ⛔ Por isso a suposição **falha alto**, aqui, ⛔ antes de qualquer alteração —
-- em vez de virar violação crua de constraint no meio do `db push`.
--
-- ⛔ ⛔ CONTA linhas. ⛔ NÃO lê `notes`, ⛔ não lê `event_data`, ⛔ não lê paciente.
do $$
declare
  orfas bigint;
begin
  select count(*) into orfas
    from public.clinical_sessions s
   where s.user_id is not null
     and not exists (select 1 from auth.users u where u.id = s.user_id);

  if orfas > 0 then
    raise exception
      'PRECONDICAO FALHOU: % sessao(oes) com user_id ausente de auth.users. A troca de FK foi ABORTADA — nada foi alterado.', orfas;
  end if;
end $$;

-- ⚠️⚠️ E as linhas **legadas** ⛔ ficam ⛔ EXATAMENTE onde estão.
--
-- ⛔ ⛔ ⛔ NÃO HÁ `update` ⛔ NENHUM NESTA MIGRATION. ⛔ Nenhum `NULL` é atribuído,
-- convertido, adivinhado ⛔ ou herdado. ⚠️ Fabricar posse para uma linha órfã
-- seria ⛔ exatamente o que a regra proíbe — e seria pior que o vazamento, porque
-- daria a sessão de um paciente a um dono **inventado**.
--
-- ⚠️ A coluna permanece **nullable** por decisão: `NULL` é o registro honesto de
-- *"⛔ não se sabe de quem é"*. Torná-la `not null` obrigaria a inventar um valor.

alter table public.clinical_sessions
  drop constraint if exists clinical_sessions_user_id_fkey;

alter table public.clinical_sessions
  add constraint clinical_sessions_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

create index if not exists clinical_sessions_user_id_idx
  on public.clinical_sessions (user_id);

-- ── 2 · O TRIGGER ⛔ NÃO PODE CADASTRAR UM ANÔNIMO ─────────────────────────
--
-- ⚠️⚠️ `handle_auth_user_created` insere em `app_users` a **cada** inserção em
-- `auth.users`. O anônimo tem `email` vazio, e o **segundo** anônimo colidiria
-- em `app_users_email_key` — ⛔ derrubando o login anônimo com erro de banco.
--
-- ⚠️ E há a razão de produto, que é a mais forte: um anônimo ⛔ NÃO É um cadastro
-- pendente de aprovação. Criar linha em `app_users` colocaria ⛔ toda emergência
-- registrada sem login na fila de aprovação do administrador.
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- ⚠️⚠️ A GUARDA. ⛔ Anônimo ⛔ não vira cadastro.
  if coalesce(new.is_anonymous, false) then
    return new;
  end if;

  insert into public.app_users (id, nome, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    'user',
    'pendente'
  )
  on conflict (id) do update
    set nome = excluded.nome,
        email = excluded.email;

  return new;
end;
$$;

-- ── 3 · POSSE NA ESCRITA — o dono ⛔ não é escolhido pelo cliente ───────────
--
-- ⚠️⚠️ Sem isto, `with check` por si ⛔ não impede que alguém **omita** o
-- `user_id` e crie uma sessão órfã — que ⛔ ninguém consegue ler depois, e que
-- reintroduz a categoria de linha sem dono que acabamos de fechar.
create or replace function public.set_clinical_session_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- ⚠️ `security invoker`: precisa enxergar o `auth.uid()` de **quem chamou**.
  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists set_clinical_session_owner on public.clinical_sessions;
create trigger set_clinical_session_owner
before insert on public.clinical_sessions
for each row
execute function public.set_clinical_session_owner();

