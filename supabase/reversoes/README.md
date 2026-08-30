# `supabase/reversoes/` — ⛔ FORA do caminho de deploy, ⛔ de propósito

⛔⛔ **⛔ NADA aqui é migration, e ⛔ NADA aqui roda sozinho.**

O CLI do Supabase aplica ⛔ exclusivamente o que está em `supabase/migrations/`.
Esta pasta ⛔ não é lida por `supabase db push`, `supabase migration up` ⛔ nem por
⛔ qualquer passo automático — ⛔ nem por acidente, ⛔ nem por engano de caminho.

## ⚠️⚠️ A segunda barreira: os nomes ⛔ não parecem migration

Os arquivos daqui ⛔ **não têm prefixo de timestamp**. Isso ⛔ não é estética: o CLI
⛔ só reconhece arquivos no formato `<timestamp>_nome.sql`. ⚠️ Se alguém copiar um
destes para `migrations/` por engano, ele ⛔ continua ⛔ não sendo executado — ⛔ é
preciso **renomear deliberadamente** para que rode.

⚠️ Duas barreiras, porque uma delas é *"a pessoa estava no diretório certo"*, e
⛔ essa falha sob pressão.

## ⚠️⚠️ O QUE ESTE ROLLBACK CUSTA

`REVERSAO-fecha-leitura-publica.sql` **reabre a exposição**: volta a permitir que
⛔ qualquer pessoa com a chave publicável — pública ⛔ por definição, embarcada no
bundle web — leia ⛔ **todas** as sessões clínicas, ⛔ inclusive `notes` e ⛔ todo o
`event_data`.

⛔ ⛔ Ele ⛔ **NÃO** é plano B confortável. É saída de emergência, para um caso só:
o fechamento do P0 quebrou o app em produção e a escolha é entre indisponibilidade
e exposição temporária — ⚠️ uma escolha que é **do autor**, ⛔ e ⛔ nunca automática.

⚠️ Rodar exige decisão explícita, com a exposição reaberta como consequência
**conhecida**, ⛔ e ⛔ não como surpresa. Depois de rodar, o P0 está ABERTO de novo.
