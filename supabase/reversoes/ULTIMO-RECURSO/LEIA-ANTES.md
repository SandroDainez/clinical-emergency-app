# ⛔⛔ ÚLTIMO RECURSO — o arquivo aqui **recria o incidente**

⚠️⚠️ Esta pasta ⛔ **não** é a das reversões. As reversões seguras estão um nível
acima. ⛔ Aqui existe **um** arquivo, e ele ⛔ não é um rollback: ele é a decisão
deliberada de **reabrir a exposição** de `notes` e `event_data` de ⛔ todas as
sessões clínicas a qualquer um com a chave publicável.

## ⚠️⚠️ Antes de rodar, os três degraus seguros já falharam?

1. **Corrigir para frente** — a causa provável é o cliente ⛔ não obter `auth.uid()`.
2. **Desligar o histórico no cliente** — `EXPO_PUBLIC_HISTORICO=off`. ⛔ Zero exposição.
3. **`../DEGRADAR-historico-fechado.sql`** — fail-closed no banco, aplica em
   segundos, ⛔ sem build. ⛔ Zero exposição.

⚠️ Se ⛔ nenhum dos três foi tentado, ⛔ **⛔ não abra este arquivo.**

## ⚠️⚠️ O que muda no instante em que ele roda

O P0 volta a existir. ⛔ Não *"parcialmente"*, ⛔ não *"por pouco tempo"* — ⛔ volta
inteiro, e o relógio do incidente recomeça do zero. ⚠️ Qualquer pessoa com o
bundle web passa a ler ⛔ todas as sessões de ⛔ todos os pacientes.

## ⚠️ Por que ele continua existindo

Porque *"⛔ não temos saída ⛔ nenhuma"* é pior que *"temos uma saída cara e
conhecida"*. ⚠️ Mas ela ⛔ **não pode ser automatizada**, ⛔ não pode ser o caminho
mais fácil, e ⛔ não pode ser chamada de "rollback" — é **decisão humana**, tomada
com o preço na frente, ⛔ e ⛔ nunca um reflexo de plantão.

⚠️⚠️ O princípio que ordena tudo isto:
**Disponibilidade pode degradar. Confidencialidade, ⛔ não.**
