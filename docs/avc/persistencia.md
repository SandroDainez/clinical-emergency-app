# Persistência local-first do atendimento de AVC

**Entregas:**
- AC-02 — decisões D-PEND-02 (local-first em IndexedDB, sincronização posterior) e D-PEND-03 (multiusuário fora do escopo; segunda abertura detectada e bloqueada).
- AC-40 — autor do evento pela sessão Supabase.
- Toque duplo no registro, para toda ação.

**Atualizado em:** 2026-09-13

> ⚠️ **Não use com dado real de paciente.** Esta entrega grava o atendimento no
> aparelho, mas ainda faltam os itens da seção 6.

## 1 · O que existe

| peça | arquivo | papel |
|---|---|---|
| tipos, schema e migração | `avc/persistencia/tipos.ts` | `EventoDoAtendimento`, `VERSAO_DO_SCHEMA = 3`, `migrarEvento` (v1 e v2 → v3), interface `ArmazenamentoDoAtendimento` |
| log | `avc/persistencia/log.ts` | função pura: transição → eventos; eventos → estado; versões de conclusão |
| autoria | `avc/persistencia/autoria.ts` | autor pela sessão Supabase, recurso do aparelho, marca da linha do tempo |
| IndexedDB | `avc/persistencia/armazenamento-indexeddb.ts` | armazenamento do navegador; lojas `casos`, `eventos` e `rascunhos` |
| memória | `avc/persistencia/armazenamento-memoria.ts` | provas e nativo; ⛔ não persistente |
| escolha por plataforma | `avc/persistencia/armazenamento.ts` · `.native.ts` | navegador: IndexedDB; nativo: memória |
| trava do caso | `avc/persistencia/trava.ts` | Web Locks no navegador; memória como recurso |
| toque duplo | `avc/nucleo/toque-duplo.ts` | `repeteOGestoAnterior`, regra pura aplicada no registro |
| ligação com a tela | `components/avc/use-atendimento-persistido.ts` | recupera, trava, lê a sessão, aplica a regra de toque duplo, grava em fila, encerra |
| autoria na tela | `components/avc/autoria-do-atendimento.tsx` | contexto com `autoriaPorFato` |
| avisos | `components/avc/avisos-do-atendimento.tsx` | carregando, bloqueado, recuperado, falha ao gravar |

## 2 · Como funciona

### Log append-only

Todo fato novo da trilha vira um evento. O mesmo vale para:
- relógio clínico definido;
- eixo concluído ou reaberto;
- superfície vista;
- **nova versão de conclusão**: população, exposição ao trombolítico, veredito da IVT, portão da IVT e veredito da EVT.

Um evento com ID já gravado é ignorado e nunca reescrito. O estado da tela é
reconstruído só a partir do log. As conclusões ficam como **histórico** (A14): a
reconstrução não as lê.

**Ordem:** quem atribui `seq` é o **armazenamento**, na gravação, dentro de uma
transação. O produtor nunca numera.

### Dados de cada evento

- **Horários:** `registradoEm`, e `observadoEm` quando o médico informou a hora (senão `null`).
- **Autor e origem (AC-40):**

| `origemDoAutor` | `autor` | marca na linha do tempo |
|---|---|---|
| `sessao` | `user.id` da sessão Supabase | nenhuma |
| `sessao_anonima` | `user.id` da sessão anônima | "registrado em sessão anônima, sem conta" |
| `aparelho` | `local:<uuid>` do aparelho, recurso sem sessão | "registrado neste aparelho, sem conta" |
| `nao_registrado` | marcador de evento migrado de v1 | "autor não registrado" |

- **Versão:** `versaoDoSchema`.

**Leitura da sessão:**
- O hook lê a sessão ao abrir o módulo, antes de gravar qualquer evento, e de novo a cada login ou logout (`onAuthStateChange`).
- Os eventos **seguintes** passam a levar o novo autor.
- Falha ao ler a sessão cai no recurso do aparelho, marcado.

**A marca aparece em dois lugares:**
- na linha de correção do Laboratório e da Imagem ("corrigido de … · sem motivo informado · registrado neste aparelho, sem conta");
- no cabeçalho de cada medida do histórico de aferições da Estabilização.

⚠️ **O `dist` das provas não tem backend, portanto não tem sessão.** O e2e exerce o recurso do aparelho. O caminho com sessão é provado no módulo, com cliente Supabase falso.

### Correção

- Uma correção é um evento próprio, e o valor anterior continua no log.
- **D-PEND-15:** motivo opcional, autor obrigatório, ausência visível. Motivo não informado aparece como "sem motivo informado".

### Toque duplo, para toda ação

Toda mudança de estado da tela entra pelo `setEstado` do hook, que aplica
`repeteOGestoAnterior(anterior, proximo)`. **Se o gesto repete o imediatamente anterior, o estado não muda: não há fato novo nem evento.**

**A regra:**
- **Repetição:** os fatos que o gesto acrescenta são, um a um, equivalentes aos últimos fatos da trilha, sem nada registrado entre os dois.
- **Equivalência:** mesmo campo, valor, tipo, motivo, hora clínica e procedência.
- **Tolerância 1 · instância:** a instância nova é aceita contra uma instância que **nasceu** no gesto anterior. É o segundo toque depois de a tela redesenhar, como em "Registrar ação".
- **Tolerância 2 · correção:** uma correção que aponta para a correção do gesto anterior conta como a mesma, como em desfazer duas vezes.

**⛔ Sem janela de tempo:** a regra não lê relógio, e nenhum número foi inventado.
⚠️ **Consequência declarada:** repetir de propósito, com o **mesmo** valor e nada registrado entre os dois, não gera segundo fato. O valor atual não muda; perde-se só o horário da repetição.

**Continuam valendo:**
- `abrirNovaInstancia` não abre instância vazia sobre instância vazia (A17).
- Tocar de novo numa **opção já marcada** continua **desfazendo** a escolha. É gesto de interface, não repetição; ver o achado AC-45 em `docs/avc/auditoria-vs-spec.md` §7.8.

### Rascunho

O rascunho fica na loja `rascunhos`, pode ser sobrescrito e nunca entra no log.
⚠️ **Nenhuma tela grava rascunho ainda.**

### Recuperação

Ao abrir o módulo, o app carrega o **caso mais recente não encerrado** e o mapa de
autoria de cada fato, lido do log. Encerrar exige confirmação e abre um caso novo.

### Segunda abertura (D-PEND-03)

A trava `avc-atendimento:<casoId>` usa Web Locks. Uma segunda aba do mesmo aparelho
vê o aviso e não escreve nada.

### Schema

| versão | conteúdo |
|---|---|
| v1 | `casos` e `eventos`, sem autor e sem versão |
| v2 | acrescenta `rascunhos` e o índice `porCasoSeq`; em todo evento, `autor`, `observadoEm` e `versaoDoSchema` |
| v3 | AC-40: em todo evento, `origemDoAutor`. O v2 só gravava `local:<uuid>` (→ `aparelho`) ou o marcador de v1 (→ `nao_registrado`); nenhum autor é inventado. |

⚠️ v1 e v2 foram escritos nesta mesma data. Não há dado real gravado por eles: as
migrações são provadas com dados sintéticos.

## 3 · Limites reais

| limite | consequência |
|---|---|
| **Cota do navegador** | Uma gravação pode falhar (`QuotaExceededError`). A tela avisa "O registro local falhou", e o atendimento continua só na memória da aba. |
| **Apagamento por limpeza de dados** | Limpar dados do site, navegação privada ou remoção automática do navegador (Safari/iOS) **apaga o registro sem aviso**. Nada foi pedido como armazenamento persistente (`navigator.storage.persist()`). |
| **Sem backup** | Não existe cópia fora do aparelho. |
| **Sem sincronização** | Nada vai para servidor (§5). |
| **Nativo sem persistência** | No app nativo o armazenamento é memória (AC-39; adaptador descrito na §4). |
| **Autor sem conta** | Sem sessão Supabase, o autor é o ID do aparelho, marcado como tal. Sessão anônima tem `user.id`, mas não é conta identificada. |
| **Autor por gesto, não por pessoa** | Quem está com o aparelho na mão não é verificado a cada gesto; vale a sessão aberta no app. |
| **Um aparelho, um médico** | Duas abas do mesmo aparelho são bloqueadas; dois aparelhos com o mesmo caso não existem. |
| **Sem Web Locks** | A trava cai para memória e só protege a própria aba. |
| **Relógio do aparelho** | `registradoEm` é o relógio do aparelho. |
| **Sem criptografia em repouso** | O IndexedDB não é criptografado pelo app. |
| **Toque duplo sem janela** | Repetição deliberada idêntica e imediata não vira segundo fato (§2). |

## 4 · Persistência no nativo (AC-39) — adaptador SQLite necessário, **não implementado**

Hoje `armazenamento.native.ts` devolve o armazenamento em memória, e fechar o app nativo perde o caso.

### 4.1 · O adaptador

- **Função:** `criarArmazenamentoSqlite(nome = NOME_DO_BANCO)`, sobre `expo-sqlite`.
- **Interface:** implementa a mesma `ArmazenamentoDoAtendimento`: `persistente: true`, `anexarEventos`, `lerEventos`, `casoMaisRecenteNaoEncerrado`, `encerrarCaso`, `gravarRascunho`, `lerRascunhos`.
- **Ligação:** passa a ser devolvido por `armazenamento.native.ts`.

**Tabelas mínimas:**

| tabela | colunas e restrições |
|---|---|
| `casos` | `caso_id` PK · `aberto_em` · `encerrado_em` NULL |
| `eventos` | `id` PK · `caso_id` · `seq` · `tipo` · `registrado_em` · `observado_em` · `autor` · `origem_do_autor` · `versao_do_schema` · `dados` (JSON) · `UNIQUE (caso_id, seq)` |
| `rascunhos` | `caso_id` · `chave` · `valor` (JSON) · `atualizado_em` · `PRIMARY KEY (caso_id, chave)` |
| `schema` | versão atual, para a migração |

### 4.2 · O que o adaptador precisa satisfazer

As provas de hoje exercem o armazenamento em **memória**. O adaptador SQLite tem de passar **as mesmas conferências** trocando só a fábrica. A tabela diz o que cada grupo das 40 conferências de `scripts/prova-avc-persistencia.cjs` exige dele.

| grupo de conferências | exige do adaptador | depende do SQLite? |
|---|---|---|
| **A13** (8): fatos, relógios, eixos, superfície e abertura iguais; trombólise exposta; nenhuma administração duplicada; horário registrado e observado; reanexar o mesmo ID não duplica; recupera o caso mais recente não encerrado; encerrado não volta | gravar e ler **todo** evento sem perda de campo; ignorar ID já gravado (`INSERT` só se ausente, devolvendo o gravado); `casoMaisRecenteNaoEncerrado` por `aberto_em` desc com `encerrado_em IS NULL`; `encerrarCaso` | **sim** |
| **Ordem de gravação** (3): produtor sem `seq`; `seq` 1, 2, 3 na ordem de gravação; reconstrução segue a gravação | `seq = max(seq do caso) + 1` **dentro da mesma transação** do `INSERT`, na ordem de entrada; `lerEventos` ordenado por `seq` | **sim** |
| **Migração** (4): versão 3; eventos migrados com versão e autor; `dados` intactos; dump antigo recuperado | migração v1/v2 → v3 ao abrir, com `migrarEvento`, sem tocar `dados` nem `seq` | **sim** |
| **Rascunho** (3): rascunho não vira evento; lido à parte; reconstrução o ignora | tabela `rascunhos` separada de `eventos` | **sim** |
| **A17** (2), **A14** (3), **correção** (2), **linha do tempo e leitura** (10) | nada além de devolver os eventos intactos: são regras do log e do núcleo | não |
| **D-PEND-03 · trava** (4) | no nativo há um processo por app. A trava em memória cobre a mesma instância; várias janelas do app exigiriam trava própria. | não para a prova atual |

Das 32 conferências de `scripts/prova-avc-autoria-e-toque-duplo.cjs`, duas dependem do armazenamento:
- `origem_do_autor` gravado e lido por evento;
- dump v2 devolvido já migrado.

As demais são do núcleo, do log e do hook.

**Como provar:**
- **Prova de módulo:** a mesma prova, parametrizada pela fábrica, rodando memória e SQLite.
- **Gesto real:** no simulador iOS e Android, os equivalentes nativos de A13 (fechar o app e reabrir) e A17. Os e2e atuais são do navegador.

## 5 · Ponto de extensão: sincronização (Supabase), não implementado

- **Unidade:** o evento, que é imutável e tem `id`, `casoId`, `seq`, `autor`, `origemDoAutor` e `versaoDoSchema`.
- **Encaixe:** uma camada acima de `ArmazenamentoDoAtendimento` enviaria em fila os eventos ainda não confirmados pelo servidor, com a mesma idempotência por `id`.
- **Requisitos:** políticas de acesso por `user.id`, criptografia e revisão de LGPD antes de qualquer envio.
- **Eventos com autor do aparelho:** precisam de regra de posse antes de sincronizar.

## 6 · O que falta antes de dado real de paciente

1. Pedir armazenamento persistente (`navigator.storage.persist()`) e medir a cota disponível.
2. Backup e sincronização com servidor.
3. Criptografia em repouso no aparelho e política de retenção e descarte.
4. Revisão de LGPD: base legal, consentimento, acesso, anonimização e registro de acesso.
5. Persistência no nativo: adaptador SQLite da §4.
6. Decidir se o módulo exige sessão com conta para registrar, ou se o recurso do aparelho basta.
7. Tela de histórico de versões das conclusões (A14 hoje está só no log).
8. Rascunho da escala do NIHSS usando a loja de rascunhos.
9. Teste em Safari/iOS, onde a remoção automática de armazenamento é mais agressiva.
10. Validação humana registrada, conforme o método do projeto.
