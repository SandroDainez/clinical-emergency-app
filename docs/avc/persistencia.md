# Persistência local-first do atendimento de AVC

**Entrega:** AC-02 · **Decisões:** D-PEND-02 (local-first em IndexedDB, sincronização
posterior) e D-PEND-03 (multiusuário fora do escopo; segunda abertura detectada e
bloqueada) · **Data:** 2026-09-13

> ⚠️ **Não use com dado real de paciente.** Esta entrega grava o atendimento no
> aparelho, mas ainda faltam os itens da seção 5.

## 1 · O que existe

| peça | arquivo | papel |
|---|---|---|
| tipos, schema e migração | `avc/persistencia/tipos.ts` | `EventoDoAtendimento`, `VERSAO_DO_SCHEMA = 2`, `migrarEventoDeV1`, interface `ArmazenamentoDoAtendimento` |
| log | `avc/persistencia/log.ts` | função pura: transição → eventos; eventos → estado; versões de conclusão |
| IndexedDB | `avc/persistencia/armazenamento-indexeddb.ts` | armazenamento do navegador; lojas `casos`, `eventos` e `rascunhos` |
| memória | `avc/persistencia/armazenamento-memoria.ts` | provas e nativo; ⛔ não persistente |
| escolha por plataforma | `avc/persistencia/armazenamento.ts` · `.native.ts` | navegador: IndexedDB; nativo: memória |
| trava do caso | `avc/persistencia/trava.ts` | Web Locks no navegador; memória como recurso |
| ligação com a tela | `components/avc/use-atendimento-persistido.ts` | recupera, trava, grava em fila, encerra |
| avisos | `components/avc/avisos-do-atendimento.tsx` | carregando, bloqueado, recuperado, falha ao gravar |
| toque duplo | `avc/nucleo/instancia.ts` · `abrirNovaInstancia` | instância vazia ⛔ não é reaberta |

## 2 · Como funciona

### Log append-only

Todo fato novo da trilha vira um evento. O mesmo vale para:
- relógio clínico definido;
- eixo concluído ou reaberto;
- superfície vista;
- **nova versão de conclusão**: população, exposição ao trombolítico, veredito da IVT, portão da IVT e veredito da EVT.

Um evento com ID já gravado é ignorado e nunca reescrito. O estado da tela é
reconstruído só a partir do log. As conclusões ficam como **histórico** (A14): a
reconstrução não as lê, e a verdade clínica continua sendo derivada dos fatos.

### Dados de cada evento

- **Horários:** `registradoEm`, e `observadoEm` quando o médico informou a hora (senão `null`).
- **Autor:** `autor`, que hoje é um identificador **local do aparelho**.
- **Versão:** `versaoDoSchema`.

### Correção

Uma correção é um evento próprio. O valor anterior continua no log.

O motivo é gravado quando o médico o informa. ⛔ Ele não é inventado: se não foi
informado, o campo fica ausente. Isso segue a decisão do autor de 2026-08-30,
registrada em `corrigirFato`.

### Rascunho

O rascunho fica na loja `rascunhos`, que pode ser sobrescrita, e nunca entra no log.
⚠️ **Nenhuma tela grava rascunho ainda.** A escala do NIHSS mantém o rascunho em
memória do componente; a interface existe para quando isso mudar.

### Recuperação

Ao abrir o módulo, o app carrega o **caso mais recente não encerrado**. A tela mostra
"Atendimento recuperado… aberto às HH:MM". Encerrar exige confirmação e abre um caso
novo.

### Segunda abertura (D-PEND-03)

A trava `avc-atendimento:<casoId>` usa Web Locks. Uma segunda aba do mesmo aparelho
vê o aviso e não escreve nada. A trava se solta sozinha quando a aba fecha. Ao
recarregar a página, há algumas tentativas curtas para não bloquear o próprio médico.

### Schema

| versão | conteúdo |
|---|---|
| v1 | `casos` e `eventos`, sem autor e sem versão |
| v2 | acrescenta `rascunhos`; cada evento v1 é reescrito por `migrarEventoDeV1`, sem tocar `dados` |

⚠️ O v1 foi escrito nesta rodada. Não há dado real gravado por ele: a migração é
provada com dados sintéticos.

## 3 · Limites reais

| limite | consequência |
|---|---|
| **Cota do navegador** | O IndexedDB tem cota por origem, definida pelo navegador e pelo espaço livre do aparelho. Uma gravação pode falhar (`QuotaExceededError`). A tela avisa "O registro local falhou", e o atendimento continua só na memória da aba. |
| **Apagamento por limpeza de dados** | Limpar dados do site, usar navegação privada ou sofrer a remoção automática do navegador (Safari/iOS pode apagar armazenamento de sites pouco usados) **apaga o registro sem aviso**. Nesta rodada nada foi pedido como armazenamento persistente (`navigator.storage.persist()`). |
| **Sem backup** | Não existe cópia fora do aparelho. Perder, trocar ou redefinir o aparelho perde o atendimento. |
| **Sem sincronização** | Nada vai para servidor. O ponto de extensão está na §4. |
| **Nativo sem persistência** | No app nativo o armazenamento é memória (`persistente: false`). |
| **Autor não autenticado** | O autor é um identificador local do aparelho (`local:<uuid>`), não uma pessoa identificada. |
| **Um aparelho, um médico** | Duas abas do mesmo aparelho são bloqueadas. Dois aparelhos com o mesmo caso não existem: não há sincronização. |
| **Sem Web Locks** | Em navegador sem Web Locks, a trava cai para memória e só protege a própria aba. |
| **Relógio do aparelho** | `registradoEm` é o relógio do aparelho. Um relógio errado grava hora errada. |
| **Sem criptografia em repouso** | O IndexedDB não é criptografado pelo app. Quem acessa o perfil do navegador lê o registro. |

## 4 · Ponto de extensão: sincronização (Supabase), não implementado

- **Unidade:** o evento, que já é imutável e tem `id`, `casoId`, `seq`, `autor` e `versaoDoSchema`.
- **Encaixe:** uma camada acima de `ArmazenamentoDoAtendimento` enviaria em fila os eventos ainda não confirmados pelo servidor, com a mesma idempotência por `id`.
- **Nativo:** `criarArmazenamentoSqlite()` sobre `expo-sqlite` implementa a mesma interface (`armazenamento.native.ts`).
- **Requisitos:** identidade autenticada, políticas de acesso, criptografia e revisão de LGPD antes de qualquer envio.

## 5 · O que falta antes de dado real de paciente

1. Pedir armazenamento persistente (`navigator.storage.persist()`) e medir a cota disponível.
2. Backup e sincronização com servidor, com identidade autenticada no lugar do autor local.
3. Criptografia em repouso no aparelho e política de retenção e descarte.
4. Revisão de LGPD: base legal, consentimento, acesso, anonimização e registro de acesso.
5. Persistência no nativo (SQLite).
6. Tela de histórico de versões das conclusões (A14 hoje está só no log).
7. Rascunho da escala do NIHSS usando a loja de rascunhos.
8. Teste em Safari/iOS, onde a remoção automática de armazenamento é mais agressiva.
9. Decisão do autor sobre o motivo obrigatório na correção (conflito entre a instrução de 2026-09-13 e a decisão de 2026-08-30).
10. Validação humana registrada, conforme o método do projeto.
