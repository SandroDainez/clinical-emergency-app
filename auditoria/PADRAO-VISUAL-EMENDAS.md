# EMENDAS À ESPECIFICAÇÃO DO PADRÃO VISUAL

**Origem:** mensagem de chat do autor (Dr. Sandro Dainez), 2026-08-20.
**O que este arquivo é:** o registro do que foi decidido **depois** que
[`PADRAO-VISUAL.md`](./PADRAO-VISUAL.md) foi escrito.

⚠️ **NÃO MISTURAR COM O ORIGINAL.** Mesma disciplina do par
`ESPECIFICACAO-RENAL.md` / `ESPECIFICACAO-RENAL-EMENDAS.md`: o documento é
registro histórico e não se edita; o que mudou vem **ao lado**, aqui, e
**prevalece** onde houver conflito. Quem for trabalhar em padrão visual lê os
dois.

---

## PV-1 · Escala é REQUISITO; grade é RECOMENDAÇÃO FORTE

A §5 do original põe as duas coisas no mesmo nível ("todo traçado desenha a
grade" e "todos os painéis usam a mesma escala"). **Elas não têm o mesmo peso**,
e a razão é o que o usuário faz com a tela:

> **O usuário COMPARA, não mede.**

- **REQUISITO — escala igual entre painéis do mesmo comparativo.** Painéis em
  escalas diferentes mentem sobre amplitude, e amplitude é exatamente o que se
  está comparando. Uma T "alta" desenhada num painel mais esticado é uma T alta
  falsa. Isto não admite exceção.
- **RECOMENDAÇÃO FORTE — a grade.** Ela ajuda o olho a calibrar tamanho e faz o
  traçado parecer o que é, mas ninguém vai medir milissegundo no celular durante
  uma emergência. Onde ela atrapalhar a leitura (traçado pequeno, tela apertada,
  contraste ruim), sai — e a escala igual continua valendo.

## PV-2 · A §7 se contradizia: "✅ feito" para a hipercalemia

A tabela do inventário marcava a família da hipercalemia como **✅ feito** no
mesmo documento cuja §5 ela não cumpria — os traçados não declaravam escala nem
desenhavam grade. **Documento que se contradiz engana quem o ler depois**, e o
original não se edita: a correção vive aqui.

**Estado real, conferido no código:**

| data | estado da família da hipercalemia |
|---|---|
| 2026-08-19 | feito — **pendente de escala declarada** (cinco traçados aprovados pelo autor, sem escala e sem grade) |
| **2026-08-20** | **feito — escala declarada (6 px = 1 mm · 25 mm/s · 10 mm/mV) e grade desenhada** |

⚠️ **E a geometria do traçado NÃO mudou nessa passagem** — provado, não afirmado:
o `d` do path de cada um dos cinco painéis foi comparado com a versão do commit
anterior (extraída do próprio git, não de um arquivo de apoio), e os cinco
md5 batem. A grade é desenhada ATRÁS, em dois paths separados. **A aprovação
médica dada em 2026-08-19 continua valendo sobre exatamente a mesma forma.**

## PV-3 · A biblioteca compartilhada foi registrada como tal

A §8.4 pedia que `tracado-de-ecg.ts` e `comparativo-de-padroes.tsx` fossem
registrados como biblioteca compartilhada, e eles não estavam. Em 2026-08-20 os
dois ganharam o aviso no cabeçalho, no mesmo molde de `lib/hipercalemia.ts`
(R-95): **quem edita ali edita o instrumento de decisão de vários módulos.**

## PV-4 · A página de revisão em lote é ferramenta do repositório

A §9 sugeria gerar uma página com todos os painéis de uma família para o autor
aprovar de uma vez. Ela existia — foi assim que os cinco da hipercalemia foram
aprovados — mas vivia no scratchpad da conversa.

Agora é `npm run revisao:padroes` → `auditoria/revisao/padroes-visuais.html`.

⚠️ **E ela lê as ÁRVORES, não uma lista à parte.** Painel novo aparece na página
no mesmo commit em que aparece no app; painel removido some dos dois. Uma lista
paralela divergiria, e a página passaria a mostrar um app que não existe.

⚠️ **Não é trava e não reprova nada.** Julgar se um traçado está desenhado certo
é do olho do médico. A ferramenta existe para que esse olho gaste um minuto por
família em vez de quarenta toques em quarenta telas.
