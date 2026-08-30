# `supabase/functions-disabled/` — o degrau do meio das Edge Functions

⛔⛔ **⛔ NADA aqui entra em deploy normal.** O CLI implanta o que está em
`supabase/functions/`; esta pasta ⛔ não é lida por `supabase functions deploy`
⛔ sem alguém **nomear** a função e apontar o caminho ⛔ deliberadamente.

## ⚠️ Para que serve

Se a versão **corrigida** de uma Edge Function apresentar defeito de
funcionalidade em produção, a escada é:

1. **Corrigir para frente** — resolver o defeito na versão nova.
2. **Implantar o stub 503** — a função fica *indisponível*, ⛔ e ⛔ não vulnerável.
3. **Versão anterior** — ⛔ **somente** por decisão humana explícita, reconhecendo
   por escrito que ela **reabre o risco** que foi fechado.

⚠️ O degrau 2 existe porque, ⛔ sem ele, o degrau 3 era a única alternativa ao 1 —
e as versões anteriores de `create-user` e `acls-assistant` são as vulneráveis.

## ⚠️ Como implantar um stub (deliberadamente)

```
cp -r supabase/functions-disabled/<funcao> /tmp/stub-<funcao>
cp -r /tmp/stub-<funcao> supabase/functions/<funcao>   # substitui temporariamente
npx supabase functions deploy <funcao>
```

⛔ ⛔ **⛔ NÃO automatizar isto.** ⛔ Nenhum script deve copiar stub por conta
própria: um stub implantado por engano derruba uma função que estava saudável, e
o sintoma (503) parece incidente de plataforma.

## ⚠️⚠️ A PRECONDIÇÃO QUE ⛔ NÃO PODE SER PULADA

⛔⛔ **⛔ Não implante stub sobre função cujo original você ⛔ não consegue restaurar.**

O stub **substitui** o código publicado. Se a fonte original ⛔ não estiver
versionada, implantar o stub **apaga a única cópia existente**.

| Função | Fonte versionada? | Stub seguro? |
|---|---|---|
| `acls-assistant` | ✅ `supabase/functions/` | ✅ sim |
| `create-user` | ✅ `supabase/functions/` | ✅ sim |
| `claim-anonymous-sessions` | ✅ `supabase/functions/` | ✅ sim |
| `admin-user-ops` | ⛔ **não** | ⛔ **⛔ NÃO** — recuperar a fonte primeiro |
| `request-access` | ⛔ **não** | ⛔ **⛔ NÃO** — recuperar a fonte primeiro |

⚠️ As duas últimas são sensíveis (usam service role) e **mereceriam** stub — mas
o código delas só existe implantado. ⚠️ A recuperação é possível (foi assim que
`acls-assistant` e `create-user` voltaram a ser versionadas, a partir do bundle
ESZIP), e é **pré-requisito**, ⛔ não detalhe.

## ⚠️ Efeito colateral conhecido, e ele é bom

`claim-anonymous-sessions` em stub responde 503 → o cliente trata como claim
falho → **a sessão anônima ⛔ não é trocada** e o histórico continua acessível ao
anônimo. ⚠️ O desenho de `troca-de-sessao.ts` já cobre este caso, e
`test:troca-de-sessao` o exercita.

⚠️⚠️ A regra-mãe vale aqui igual ao banco:
**Disponibilidade pode degradar. Confidencialidade, ⛔ não.**
