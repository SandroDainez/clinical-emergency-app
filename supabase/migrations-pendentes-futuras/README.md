# `supabase/migrations-pendentes-futuras/` — retirada da sequência, ⛔ não descartada

⚠️⚠️ O arquivo aqui **pertence à Fase 4** do rollout e ⛔ está fora de
`supabase/migrations/` ⛔ por decisão operacional, ⛔ e ⛔ não por estar errado.

## ⚠️ Por que ele saiu

⛔ `supabase db push` aplica **tudo** que estiver pendente em `migrations/`. Com
`20260830191000` ali, a P·1 — que é ⛔ **inerte** por desenho — aplicaria junto o
**fechamento do P0**, retirando o acesso público ⛔ antes de o cliente conseguir
obter `auth.uid()`. ⚠️⚠️ Isso ⛔ não é imprudência: é **interrupção** do app ⛔ não
autenticado.

⚠️ A elegibilidade prematura foi ⛔ exatamente o que o P·0 existiu para pegar.

## ⚠️⚠️ Quando ele volta

⛔ ⛔ **⛔ SÓ** quando a Fase 4 (P·8) for **explicitamente autorizada**, e depois de:

| Passo | Precisa estar feito |
|---|---|
| P·1 | migration de compatibilidade aplicada |
| P·5 | cadastro repontado para o Auth nativo |
| P·6 | Edge Functions endurecidas ⛔ **depois** de P·5 |
| P·7 | Anonymous Sign-In habilitado e provado |

⚠️ ⛔ Antes disso ⛔ não existe **dono** para as sessões, e a policy de posse
negaria tudo.

## ⚠️⚠️ SEGUNDO ARQUIVO · `20260831070000_fecha_acesso_clinico_a_conta_ativa.sql`

⚠️ É o fechamento do P0 pelo **caminho curto** — autorização clínica = conta
`ativo`, ⛔ sem uso anônimo. Ele **substitui** o `20260830191000` enquanto o uso
clínico anônimo estiver fora do roadmap.

⛔ ⛔ **⛔ Só volta para `migrations/` depois de a guarda de rota estar publicada
e validada em produção.** Aplicá-lo antes deixaria o cliente pedindo dados que o
banco nega, ⛔ sem tela preparada para dizer o porquê.

⚠️ Os dois arquivos ⛔ não devem ser aplicados juntos: são **dois desenhos** do
mesmo fechamento, ⛔ e ⛔ não duas etapas.

## ⚠️ Integridade

⛔ ⛔ **⛔ NENHUM byte foi alterado.** Movido com `git mv`, conferido por SHA-256
antes e depois:

```
72ac04762126e3c2f5cc08cc852aa80cd7349e44de708c02fd855a19f5afff43
```

⚠️ Conferir esse mesmo hash ⛔ antes de devolver o arquivo para `migrations/`.
