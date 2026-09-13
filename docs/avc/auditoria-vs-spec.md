

### 7.16 · 11ª rodada de 2026-09-13 · «Preciso de ajuda» (fecha AC-10), AC-67, AC-68, AC-69, eixos reabertos e porta do e2e · commits `c2f0c23` (decisões, só `docs/`) e `70149fc` (código)

**Decisões do autor** (Sandro Dainez, 13/09/2026; `docs/decisoes.md`, `c2f0c23`):

| item | conteúdo |
|---|---|
| "Prioridade" | confirmada: linha no topo de toda superfície + primeiro item das pendências |
| AC-67 | piora registrada por engano: «Limpar» auditado com confirmação; o evento recebe correção "registrado por engano"; a tarefa só cai se os eixos não foram reavaliados depois dela |
| AC-68 | texto livre confirma ao sair do campo ou ao tocar «Registrar»; nunca por alteração |
| AC-69 | marcos da transferência com horário observado editável e horário registrado preservado |
| Ajustes das capturas | (1) eixos reabertos mostram a última avaliação com hora e «reavaliação pendente»; (2) marcos como linha do tempo com «Registrar marco» e correção auditada por marco, sem seletor de estado; (3) `test:all` encerra ou recusa a porta 4173 ocupada |
| Entrega 1 | «Preciso de ajuda» global com as cinco opções do PDF; fecha o AC-10 |

#### «Preciso de ajuda» · o outro botão global

**Onde fica:** no topo fixo, na mesma linha de «Paciente piorou», em toda superfície (`components/avc/preciso-de-ajuda.tsx`).

**Opções** (`avc/conteudo/ajuda.ts`):

| opção | o que a tela diz | caminhos |
|---|---|---|
| não sei avaliar | o conteúdo existente são os campos guiados com ⓘ, pendentes de validação médica; não substitui apoio presencial | Estabilização · exame neurológico |
| não tenho o medicamento | este módulo não tem conteúdo sobre medicamento indisponível e não sugere substituto | Destino (capacidade e transferência) |
| não tenho o equipamento | idem, para equipamento | Destino |
| não melhorou | este módulo não tem conteúdo sobre ausência de melhora; se houve piora, «Paciente piorou» | exame neurológico · Estabilização |
| paciente piorou | — | abre o diálogo existente |

- **Todo painel tem:** caminho, registro de conduta externa, «Voltar às opções» e «Fechar».
- **Caminho:** fecha a ajuda e abre a superfície. Uma faixa «‹ Voltar para …» no topo devolve a superfície e a rolagem de origem.
- **Conduta externa** (`avc/nucleo/ajuda.ts`): vira fato com horário, e o autor é carimbado. Na linha do tempo aparece como *"Conduta externa registrada: …"* com o texto da equipe. O app não a executa nem a lê em derivação.

#### AC-67 · piora registrada por engano

**Onde:** botão «Registrado por engano?» logo abaixo da linha «Reavaliar agora». Abre confirmação com o destaque em «Manter o registro» (`components/avc/confirmacao-de-engano.tsx`).

**O que a correção faz** (`corrigirPioraPorEngano`):
- **Registro:** correção com motivo "registrado por engano" apontando o evento. O evento continua na trilha e na linha do tempo, com a nota.
- **Leitura de "reavaliado depois"** (interpretação, a confirmar): algum fato da Estabilização registrado depois do evento, ou algum eixo concluído de novo.
- **Sem reavaliação:** a tarefa cai e os eixos concluídos antes da piora voltam a concluídos.
  - Esses eixos ficam gravados num fato auxiliar ao lado do evento (`paciente_piorou_eixos_reabertos`).
- **Com reavaliação começada:** nada é desfeito, e a tarefa fica até a reavaliação terminar (fato `paciente_piorou_reavaliacao_mantida`).
  - Fato de estabilização registrado depois da correção não ressuscita a tarefa.

#### Eixos reabertos com a avaliação anterior

**Leitura** (`avc/nucleo/avaliacao-anterior.ts`): a mesma `ameacasImediatas`, aplicada à trilha até o evento de piora.
- **Hora:** a do último fato do bloco do eixo antes do evento.
- **Fato novo depois:** não altera a avaliação anterior.

**No card da Estabilização:** enquanto a tarefa está pendente, cada eixo não concluído mostra *"Antes da piora: <achado ou estado> · <valor> · HH:MM"* e «Reavaliação pendente».
- **Eixo sem dado:** *"Antes da piora: sem dados registrados"*.
- **Ajuste depois da captura:** com ameaça, o texto mostra o achado de então no lugar do rótulo "Corrigível".

#### AC-69 · marcos da transferência

**Modelo:** o campo `transf_estado` (seletor) saiu e entrou `transf_marco` (evento).
- `registrarMarco`, `corrigirHorarioDoMarco` (correção com motivo "horário corrigido") e `marcoPorEngano` (correção "registrado por engano").
- `marcosDaTransferencia`: horário observado e horário de registro do fato original, preservado depois de corrigir o observado.

**Leitura:**
- **Ordem e marco atual:** pelo horário observado.
- **Aceite:** conta o observado depois da última recusa ou cancelamento.
- **Chegada sem saída:** tolerada; a síntese diz *"Chegada registrada sem saída registrada"*.

**Tela** (`components/avc/marcos-da-transferencia.tsx`):
- **Lista:** um item por marco, com *"aconteceu às · registrado às"* e dois botões, «Corrigir horário» e «Registrado por engano» (com confirmação).
- **«Registrar marco»:** tipo, depois «Aconteceu agora» (escolha explícita) ou «Informar horário» (seletor). «Cancelar» em cada passo.
- **Linha do tempo da síntese:** hora real, com *"registrado às"* ao lado quando difere.

#### AC-68 · texto livre

`CampoDeTexto` (`components/avc/campos-clinicos.tsx`) vale para todo campo de texto do módulo, inclusive a identificação.
- **Rascunho:** o texto fica num rascunho e vira fato ao sair do campo (`onBlur`/`onSubmitEditing`) ou em «Registrar», que aparece quando há rascunho não gravado.
- **Rascunho igual ao gravado:** não grava.
- **Rascunho vazio sobre valor gravado:** limpa.

#### Porta do e2e

- **Trava:** `scripts/porta-e2e-livre.cjs` roda no `test:all` como `test:porta-e2e`, imediatamente antes de `test:e2e`.
  - **Como detecta:** conexão em IPv4 e IPv6, ou bind recusado.
  - **Com porta ocupada:** sai com erro, a porta, a saída do `lsof` (PID) e a instrução para encerrar.
- **Limite:** não encerra processo alheio.
- **Prova:** `scripts/prova-porta-e2e.cjs` (porta aleatória ocupada/livre e posição no `test:all`).

#### Provas (vermelho no código e no build de `e8fed38`)

| prova | antes | depois |
|---|---|---|
| `scripts/prova-avc-rodada11.cjs` (nova, no `test:all`) | 🔴 0 · 12 | ✅ 46/46 |
| `scripts/prova-porta-e2e.cjs` (nova, no `test:all`) | 🔴 0 · 2 | ✅ 5/5 |
| `e2e/avc-preciso-de-ajuda.spec.ts` (6) · 7 superfícies a 375 px; sem beco sem saída; cada caminho volta à origem com a rolagem; conduta externa na linha do tempo; «paciente piorou»; ES | 🔴 6 | ✅ 6 |
| `e2e/avc-rodada11.spec.ts` (5) · eixos reabertos; engano sem e com reavaliação; marcos; texto livre | 🔴 5 | ✅ 5 |
| `e2e/avc-transferencia.spec.ts` e `avc-paciente-piorou.spec.ts` adaptados a marcos | 🔴 4 (seletor inexistente no novo modelo) | ✅ |

**Ajustes de instrumento antes do verde:**
- (a) Na prova de módulo, a conferência "onChangeText não grava" passava por vacuidade: o recorte da função terminava no `}` da assinatura. Foi corrigida antes de implementar, e o vermelho passou de 11 para 12.
- (b) A regex "não sugere substituto" reprovava o *"use «Paciente piorou»"* de «não melhorou»; o texto passou a *"toque em"*.
- (c) A nota "registrado por engano" da linha do tempo mora em `nota` (traduzível); a conferência passou a lê-la ali.

**Travas ajustadas conscientemente:**
- **`prova-avc-cockpit`:** a exceção de workflow (`deterioracao.ts`) exporta também `corrigirPioraPorEngano`.
- **`prova-avc-piora-e-transferencia`:**
  - os marcos passaram de estado para evento;
  - o histórico preservado aceita o fato auxiliar dos eixos reabertos ao lado do evento.

#### Achados

| # | gravidade | achado | estado |
|---|---|---|---|
| AC-10 | alta | «Preciso de ajuda» e «Paciente piorou» não existiam | ✅ **fechado** em `70149fc` («Paciente piorou» em `e8fed38`) |
| AC-67 | média | piora por engano sem desfazer | ✅ fechado em `70149fc` · interpretação de "reavaliado depois" a confirmar |
| AC-68 | baixa | um fato por tecla no texto livre | ✅ fechado em `70149fc` |
| AC-69 | baixa | marco só com a hora do registro | ✅ fechado em `70149fc` |
| AC-71 | média | "Previsão do transporte (estimativa)" usa o seletor de hora do app, cujo teto é *agora* (regra dos marcos passados). Uma estimativa futura não pode ser registrada | aberto · código (encontrado nesta rodada, não corrigido) |
| AC-72 | baixa · pergunta | a teleconsulta continua com seletor de estado (`tele_estado`). O ajuste "eventos, não seletor" foi pedido só para a transferência | aberto · autor |
| AC-73 | baixa | a correção por engano da piora só aparece enquanto a tarefa está pendente. Depois da reavaliação completa não há onde marcar o engano, embora ele só mudasse a anotação da trilha | declarado |
| AC-70 | baixa · instrumento | a trava de texto livre (`prova-avc-paciente`) cobre só P/A/B/C | inalterado |

**Suíte e envio:**

| item | resultado |
|---|---|
| commits | `c2f0c23` (decisões, só `docs/`) · `70149fc` (código) · commit só de `docs/` com esta seção e o status |
| e2e da rodada no build final | ✅ 21/21 (ajuda 6, rodada 11 5, transferência 6, piora 4) |
| e2e do AVC no build final | ✅ 391 passed (antes do ajuste do achado, que não muda testID) |
| `test:all` (HEAD `70149fc`) | ✅ **EXIT=0** · 143 `npm run` + 1 `node` · Playwright **574 passed** (8,8 min), sem failed ou skipped · rodada 11 46/46 · porta do e2e 5/5 · `test:porta-e2e`: porta 4173 livre · piora e transferência 47/47 · críticos 183/183 · cockpit 18/18 · alcançabilidade 22/22 · 135 travas ligadas · índice 123 declaradas · execução 18:26–18:37 · `dist/artefato.json` = `70149fc` |
| artefatos da suíte | revertidos (D-PEND-10) |
| push | `6aae9b7..70149fc` → `origin/refactor/clinical-modules-rebuild` (inclui `c2f0c23`); `git ls-remote` = `70149fcf4958484f72f16483b4416ca0356cef1e`; divergência 0/0 |
| deploy · merge em `main` | ⛔ não feitos |
