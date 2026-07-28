# NOTAS-LOGICA.md

Registro de problemas de **lógica** encontrados durante o projeto UI 2.0.

Regra do plano: achou bug ou oportunidade de refactor lógico → **anota aqui e
segue**. Não corrige durante as fases visuais. Este arquivo existe para que
nada se perca e para que a correção seja uma decisão consciente, num momento
próprio, com teste próprio.

---

## L-001 · Hydration mismatch (React #418) em todas as 28 rotas de módulo

**Encontrado em:** Fase 0.2, ao criar o E2E de cobertura dos módulos.
**Gravidade:** média — não impede o uso, mas tem custo real (abaixo).
**Status:** ✅ **corrigido** em 2026-07-27 — ver "Correção" no fim desta entrada

### O que acontece

Abrir qualquer `/modulos/<id>` lança no console:

```
Minified React error #418
(Hydration failed because the server rendered HTML didn't match the client)
```

28 de 28 módulos. Reproduz em build de produção (`expo export -p web`).

### Causa

O HTML gerado estaticamente para a rota `/modulos/[id]` **contém a landing
page**, não a tela do módulo:

```bash
python3 -c "import re;print(re.sub(r'<[^>]+>','\n',open('dist/modulos/[id].html').read()))" | head
# 🩺 Clinical Emergency Suite / Apoio à decisão clínica... / Começar agora
```

Na renderização estática (build) não existe parâmetro de rota nem sessão, então
a árvore cai no ramo da landing. No cliente, com `id` e sessão disponíveis,
renderiza o módulo. São duas árvores diferentes para a mesma rota — o React
descarta o HTML do servidor e refaz tudo.

### Por que importa para a UI 2.0

1. **Todo módulo renderiza duas vezes** ao abrir. Qualquer medição de
   performance visual feita antes de resolver isto mede o dobro do trabalho.
2. Há um **flash da landing** antes do módulo aparecer — exatamente o tipo de
   coisa que o plano quer eliminar ("leve, limpo, respirando").
3. O E2E precisa tolerar este erro como linha de base (ver
   `e2e/modulos.spec.ts`), o que enfraquece a rede: um #418 **novo**, causado por
   uma tela migrada, não seria distinguível do antigo. Corrigir isto aperta a
   rede de segurança de todas as fases seguintes.

### Correção aplicada

O usuário autorizou corrigir. A solução foi enumerar os ids no build, com
`generateStaticParams()` em `app/modulos/[id].tsx`:

```ts
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return getClinicalModules().map((m) => ({ id: m.id }));
}
```

Cada módulo passou a ter o seu próprio HTML (`dist/modulos/ritmos-acls.html`,
etc.) já com o conteúdo certo, em vez de um único `[id].html` genérico. O
primeiro render do cliente encontra exatamente o mesmo HTML — sem mismatch, sem
render duplo e sem flash da landing.

**Não afeta iOS/Android:** `generateStaticParams` só é chamado pelo exportador
web; em nativo não existe pré-render.

**Duas tentativas anteriores falharam** e vale registrar por quê:

1. Trocar o `<Redirect>` por um esqueleto com render em dois passos. Não
   resolveu: o problema não era o Redirect, e sim a rota não ter id no build.
2. Procurar a causa no `<Redirect>` isoladamente. A pista que faltava estava
   à vista desde o começo — os botões "Começar agora" e "Entrar na plataforma"
   apareciam junto com os do módulo. A landing fica montada sob todo módulo por
   `unstable_settings = { anchor: "index" }` em `app/_layout.tsx`, e isso é
   legítimo; não era ali o defeito.

**Verificação:** 0 erros de hidratação nos módulos sondados; a tolerância que
`e2e/modulos.spec.ts` mantinha foi REMOVIDA, e os 38 testes seguem verdes. A
rede de segurança voltou a ser rígida: qualquer erro de hidratação agora falha.

---

## L-002 · `tr("literal")` fora do render em `acls/presentation.ts` e `acls/debrief.ts`

**Encontrado em:** revisão do i18n (antes da Fase 0).
**Gravidade:** baixa — hoje funciona.
**Status:** ⬜ aberto — vigiar, não mexer sem sintoma

155 chamadas `tr("texto literal")` sem receber o locale do render. É o mesmo
padrão que já causou congelamento de idioma no cabeçalho do PCR e que foi
corrigido nos componentes com `useTr()`. Estes arquivos são `.ts` fora de
componente e não podem usar hook.

Hoje funciona: o ACLS está comprovadamente bilíngue em produção. Mas é frágil —
depende de o minificador não dobrar a chamada. Se algum dia um texto do ACLS
travar em português com o app em espanhol, começar por aqui.

Corrigir exigiria propagar o locale por 155 pontos. Sem sintoma, o risco da
mudança é maior que o do problema.

---

## L-003 · Despacho de módulo por cadeia de 27 comparações

**Encontrado em:** Fase 0.1 (mapeamento).
**Gravidade:** baixa — funciona; é risco de manutenção.
**Status:** ⬜ aberto — anotado como observação de arquitetura

`components/clinical-app.tsx` decide qual tela renderizar com 27
`protocolId === "..."` em sequência, e só `pcr_adulto` cai no fallback.

Um mapa `id → componente` seria mais direto e removeria a chance de inserir uma
comparação na ordem errada. **Mas é lógica de roteamento**, e a migração visual
vai passar por este arquivo em toda fase — mexer nele agora misturaria refactor
com migração, que é justamente o que o plano proíbe.

Sugestão: fazer depois da Fase 7, quando todos os módulos já estiverem migrados
e o arquivo estiver estável.

---

## L-004 · Seta de voltar do cabeçalho do expo-router tem 30×30 px

**Encontrado em:** Fase 2, no teste de alvo de toque do showcase.
**Gravidade:** baixa-média — usabilidade, não correção clínica.
**Status:** ⬜ aberto — resolve sozinho na Fase 4

O cabeçalho de navegação gerado pelo expo-router (aquele que mostra "modulos" ou
"dev/ui-v2" no topo) traz uma seta de voltar de **30×30 px**, abaixo do mínimo de
44 exigido pelo plano. Não é componente nosso: vem do react-navigation.

Todos os 16 componentes da UI 2.0 passam no mínimo — o teste
`e2e/ui-v2-showcase.spec.ts` verifica isso a cada execução, escopado ao conteúdo
do showcase justamente para não confundir o defeito do framework com os nossos.

Some quando o `Header` compacto substituir esse cabeçalho na Fase 4. Se por
algum motivo ele permanecer, dá para aumentar o alvo com `headerBackTitleStyle` /
`headerLeft` customizado nas opções do Stack.

---

## L-005 · O mapa da Fase 0 identificou o shell errado

**Encontrado em:** Fase 6, ao preparar a migração de bradicardia/taquicardia.
**Gravidade:** alta enquanto durou — era informação errada guiando o projeto.
**Status:** ✅ corrigido em MAPA-APP.md §4

`MAPA-APP.md` afirmava que as telas `*-flow-screen.tsx` delegavam para
`module-flow-shell.tsx`, e que mexer nele afetaria 17 módulos.

O shell real é `acls-decision-flow-screen.tsx`, usado por **19 módulos**.
`module-flow-shell.tsx` é usado por **2**.

### Como o erro entrou

Na Fase 0 eu li que as telas de fluxo tinham 15 linhas e delegavam a um shell, e
associei ao `module-flow-shell` pelo nome — sem abrir uma delas para confirmar de
onde vinha o import. O nome do arquivo era plausível demais.

### Por que importou

As Fases 3 a 6 foram desenhadas em cima dessa informação, inclusive a regra "não
usar módulo `*-flow-screen` como piloto". A regra estava certa por acaso, mas
pelo motivo errado — e a Fase 6 quase tratou o shell de 19 módulos como se fosse
"a quarta tela" de uma migração incremental.

### Lição aplicada

Afirmação de arquitetura no mapa precisa vir de import verificado, não de nome de
arquivo. As demais afirmações de MAPA-APP.md §4 foram reconferidas contra os
imports reais.

---

## L-006 · Cue `rearrest` fora do catálogo canônico de áudio

**Encontrado em:** correção dos defeitos do ACLS reportados pelo usuário.
**Gravidade:** baixa · **Status:** ✅ corrigido — a cue entrou no catálogo

`npm run validate:acls-audio` acusa, duas vezes:

```
Cue fora do catálogo canônico em WEB_AUDIO_CUES: rearrest
```

`components/web-audio-cues.ts` registra a cue `rearrest`, que não existe em
`ACLS_CANONICAL_AUDIO_MANIFEST`. Já falhava antes desta rodada — confirmado ao
rodar o validador na primeira vez, junto com os erros que eu mesmo havia
acabado de criar.

Corrigido depois, em commit próprio: a cue é legítima — tem MP3 em PT e ES, texto
nos dois idiomas e é usada 3× no reducer. Só faltava no catálogo canônico.

Entrou com nota explicando por que ali "reiniciar RCP" está CORRETO, ao contrário
do caso do L-00x da medicação: no `rearrest` a circulação havia retornado e foi
perdida, então recomeçar é exatamente a conduta.

Fechar isso importava além da limpeza: o validador de áudio vivia vermelho, e
verificação que sempre falha é verificação que ninguém lê.

---

## L-007 · Auditoria do fluxo ACLS: sem divergência no ramo chocável

**Pedido do usuário:** "sincroniza para dar a segunda dose no tempo certo de
acordo com o ACLS · verifique todo o fluxo se está correto".
**Resultado:** ✅ **conforme** — nada foi alterado no reducer.

`npm run audit:acls` dirige o engine por 9 choques de FV refratária, confirmando
toda droga oferecida, e registra a linha do tempo real:

| min | choques | droga | epi acum. | antiarr acum. |
|---|---|---|---|---|
| 2,08 | 2 | epinefrina | 0 | 0 |
| 4,17 | 3 | antiarrítmico 1ª | 1 | 0 |
| 5,50 | 3 | epinefrina | 1 | 1 |
| 8,33 | 5 | antiarrítmico 2ª | 2 | 1 |
| 8,67 | 5 | epinefrina | 2 | 1 |
| 11,75 | 6 | epinefrina | 3 | 2 |
| 14,92 | 8 | epinefrina | 4 | 2 |

Confere com o algoritmo de PCR no adulto:

- epinefrina só após **2 choques** ✓
- intervalos de epinefrina entre **3 e 5 min** nas 5 doses ✓
- 1ª dose de antiarrítmico após o **3º choque** ✓
- 2ª dose após o **5º choque** — em ciclo posterior, não consecutivo ✓
- **máximo de 2 doses** de antiarrítmico respeitado ✓

### Sobre "a 2ª dose não apareceu"

Explicado, e não é defeito: a 2ª dose entra **depois do 5º choque**. Num teste
que pare antes disso, ela corretamente não aparece.

### O que esta auditoria NÃO cobre

Só o ramo **chocável refratário**. Ficam sem auditoria automatizada: o ramo
não chocável (AESP/assistolia), o ROSC e o encerramento. Também não reproduzi o
relato de "pedir confirmação de dose já confirmada" — neste cenário, com toda
droga confirmada assim que oferecida, a duplicidade não ocorreu.

⚠️ Números de dose e a regra de 2 doses são estáveis entre as edições recentes
do ACLS, mas qualquer divergência futura apontada por este script deve ser
conferida contra o texto vigente antes de virar mudança de conduta.

---

## L-008 · Três áudios do ACLS fora do lote original (voz diferente)

**Reportado pelo usuário:** "tem dois áudios com voz diferente da que estava,
teremos que gravar com a mesma voz depois e substituir".
**Status:** ⬜ aberto — **pendência de gravação, não de código**

Primeiro, uma correção de premissa: nenhum áudio foi gravado por IA aqui. O que
existe é lote de gravação em datas diferentes, mais uma cue sem MP3 que cai no
TTS do sistema — e é o TTS que soa como "outra voz".

### Levantamento por data de arquivo

Dos 29 MP3 de `assets/audio/final-acls/`, **26 são de 6 de junho** (lote
original). Os fora do lote:

| arquivo | data | tamanho |
|---|---|---|
| `advanced_airway_confirmed.mp3` | 12 jun | 155 KB |
| `switch_compressor.mp3` | 12 jun | 94 KB |
| `rearrest.mp3` | 19 jun | 92 KB |

Os dois de 12 de junho são, com alta probabilidade, os que o usuário ouviu como
voz diferente. O de 19 de junho é o mesmo `rearrest` do **L-006** — registrado em
`web-audio-cues.ts` mas ausente do catálogo canônico.

### Sem MP3 nenhum (toca por TTS)

✅ **Resolvido.** O usuário gravou `medication_given_keep_cpr` em PT e ES no
ElevenLabs, os arquivos foram registrados em `components/web-audio-cues.ts` e a
validação de áudio passou verde — 30 cues canônicas, todas com MP3 nos dois
idiomas.

### Para gravar

Textos canônicos em `acls/canonical-audio-manifest.ts` (PT) e
`acls/locales/es-419/speech-cues.ts` (ES). O espanhol tem os 29 arquivos, todos
de 23 de julho — lote único, sem esse problema.

**Situação:** `medication_given_keep_cpr` gravado nos dois idiomas. O usuário
avaliou que `advanced_airway_confirmed`, `switch_compressor` e `rearrest` estão
adequados como estão — ficam registrados aqui apenas como informação, para o caso
de algum dia soarem fora do tom.

## Confirmação repetida de adrenalina — NÃO REPRODUZ

**Relato:** "mandando confirmar dose de adrenalina que foi aplicada mesmo quando
já se havia confirmado."

`scripts/diag-confirmacao-repetida.cjs` dirige o engine por 3 cenários × 10
ciclos e vigia três invariantes:

- **I1** — `recomendadas − administradas` nunca passa de 1 (2 significaria a mesma
  dose pedida duas vezes);
- **I2** — depois de confirmar, não há novo pedido antes de 3 min;
- **I3** — confirmação sempre incrementa a contagem (confirmação "no vazio" é
  ação que continuou oferecida depois de cumprida).

Cenários: (A) confirmação imediata no ramo chocável — o caso do relato;
(B) confirmação atrasada em um ciclo, o médico ocupado; (C) ramo **não chocável**
(assistolia/AESP), que não tinha cobertura de auditoria nenhuma até aqui.

**Resultado: as três invariantes se mantêm nos três cenários.** O ramo não
chocável dá 7 doses de adrenalina em 10 ciclos, zero antiarrítmico e zero
choques — correto para assistolia/AESP.

**O diagnóstico PEGA o defeito, se ele existir.** Provado por mutação: removida a
trava `!adrenaline.pendingConfirmation` de `shouldRemindAdrenaline`, aparece
exatamente o sintoma relatado — "3 recomendadas × 1 administrada" — e I1 acusa 57
violações. A trava existe, é carga estrutural e está no lugar.

Uma segunda mutação foi mascarada: não limpar `pendingConfirmation` ao confirmar
não produz sintoma, porque `reAnnounce` também exige
`status === "pending_confirmation"`. Defesa em profundidade que já estava lá.

**Hipótese mais provável do que ele viu:** a UI antiga mostrava o card "adrenalina
agora" abaixo do contador de próxima dose, duplicando visualmente o pedido — ele
relatou isso na mesma mensagem ("tem o card com proxima dose de adrenalina e tem o
tempo e embaixo tem outro card escrito adrenalina agora"). Isso foi corrigido na
nota de fase contextual, e ele estava na UI antiga quando relatou.

**Fica aberto** até ele confirmar em uso, ou trazer o cenário concreto (quantos
ciclos, chocável ou não, em que ponto apareceu). Rodar com `npm run
audit:confirmacao`.

## L-009 · `npm run test:engine` estava MORTO desde a i18n

Descoberto ao rodar `test:all` para fechar a rodada. O script morria em
`MODULE_NOT_FOUND` antes de executar um único teste — portanto **nenhuma** das suas
verificações rodava, e ninguém sabia.

**Causa.** `acls/presentation.ts` passou a importar `../lib/locale` no commit
`7b22ee4` (i18n PT/ES). Isso mudou a raiz comum da compilação: o `tsc` passou a
escrever `tempDir/acls/presentation.js` em vez de `tempDir/presentation.js`, e o
script pedia o caminho raiz. Mesma coisa em `speech-map` e `speech-queue`. As
linhas de `screen-model` e `debrief` já usavam `path.join("acls", ...)` — estas
três ficaram para trás.

**Corrigido:** os três caminhos. O script agora carrega e executa.

**E aí aparecem 28 testes falhando.** Ficaram escondidos por ~4 meses. Triagem
preliminar dos tipos:

| tipo | exemplos | leitura |
|---|---|---|
| vocabulário de voz mudou | `testVoicePolicyRestricts*`, `testVoiceLowConfidence*` | provável expectativa velha |
| API que não existe mais | `advanceTrainingCycle is not a function`, `dkaHhsEngine is not defined` | teste referencia código removido |
| cenário fora de sincronia | "Resposta inválida para o estado atual" | roteiro do teste desatualizado |
| apresentação / screen model | `testPresentationModes`, `testScreenModelIntegration` | pode ser drift OU regressão real |

### ✅ Triagem CONCLUÍDA — os 28 estão verdes

**Primeiro achado da triagem: não eram 28 problemas.** Ao envolver cada teste num
`try/catch` para contá-los, o estado compartilhado do engine vazava de um teste
quebrado para o seguinte e a contagem inflava. A conta honesta veio de corrigir e
remedir a cada passo.

**Nenhuma regressão clínica encontrada.** Todos os 28 eram expectativa velha,
descolada de mudança deliberada — cada uma rastreada até o commit que a fez:

| grupo | causa | origem |
|---|---|---|
| janela da epinefrina (2) | teste cobrava 4 min e outro **2 min**; o engine usa 3 min | `ADRENALINE_EARLIEST_REPEAT_MS` |
| vocabulário de voz (6) | `go_to_next_step` passou a ser aceito; RCP expõe só `confirm_cpr_continuing` | commit `3988df4` |
| estado de preparação (4) | `avaliar_ritmo_preparo` entrou no fluxo e os roteiros não confirmavam | — |
| rótulos e falas (5) | redação ficou mais específica (dose, via, ação) | — |
| pré-aviso de ritmo (2) | antecedência zerada de propósito | `RHYTHM_PRE_CUE_LEAD_MS`, com justificativa no código |
| modo treinamento (1) | recurso REMOVIDO do app | commit `3ff8623` |
| engine de CAD (1) | `dkaHhsEngine` usado e **nunca carregado** — o teste jamais rodou | — |
| protocolo de sepse (1) | fluxo reestruturado (reconhecimento e qSOFA antes da coleta) | — |
| demais (6) | log vazio em sessão nova, fila de fala, half-duplex, timer duplicado | — |

**O mais grave que a triagem impediu:** `testNonShockableEpinephrineRepeatUsesPureTimeWindow`
cobrava repetição de epinefrina em **2 minutos**. Alinhar o engine ao teste — o
caminho mais rápido para "deixar verde" — faria o app sugerir epinefrina a cada 2
min, abaixo do mínimo de 3 min da AHA.

**Dois defeitos reais corrigidos no caminho:**

1. `engine.ts` usava teste de veracidade em timestamps
   (`session.protocolStartedAt ? ...`). **Zero é timestamp válido**: um protocolo
   iniciado no instante 0 fazia a duração virar `undefined` e a tela mostrar
   "00:00" para sempre. Em produção nunca aparece porque `Date.now()` jamais é 0 —
   mas tornava a duração intestável. Corrigido para `!== undefined` nos três campos.
2. Testes filtravam cue de áudio por `effect.message` em vez de `effect.cueId`.
   `message` é o texto humano: o filtro nunca casava e o `some(...) === false`
   passava como se fosse ausência real. Mesma armadilha do áudio — cue se resolve
   por id.

**Cobertura que passou a existir:** `testDkaUnitConversions` (conversão de glicemia
e creatinina no CAD/EHH) nunca havia executado; agora roda. E
`testTrainingAdvanceCycleUpdatesEncounterDuration` virou
`testCycleElapsedUpdatesEncounterDuration`, medindo pelo caminho real (deixar os 2
minutos correrem) em vez do atalho de teste que foi removido.

**Duas correções de conteúdo já saíram da triagem inicial:**

1. `assertGuidelineTiming` acusava "epinefrina repetida em 0,08 min" no ramo não
   chocável. NÃO era defeito: o reducer emite `medication_due_now` para pedido
   novo E para reanúncio de dose ainda pendente, marcando o segundo com
   `repeated: true`. O teste misturava os dois e cobrava a janela de 3–5 min do
   conjunto. Agora o helper ignora `repeated`, e entrou uma invariante nova:
   reanúncio só é legítimo enquanto a dose está pendente — que é exatamente a
   trava contra o defeito relatado pelo usuário.
2. `testSpeechMapCanonicalKeys` cobrava de `start_cpr` um texto que o `speech-map`
   não tem mais. Ver abaixo.

## Três textos para o mesmo comando falado — decisão pendente

`scripts/diag-divergencia-textos-audio.cjs` (`npm run validate:audio-textos`)
compara as três fontes de cada cue:

- `acls/speech-map.ts` — o que o TTS fala quando o MP3 não carrega;
- `acls/AUDIO_SCRIPT.md` — o roteiro de onde os MP3 foram gravados, e portanto o
  que o médico realmente ouve (o áudio resolve por cueId);
- `acls/canonical-audio-manifest.ts` — o catálogo chamado de "canônico".

**Resultado:** em 27 das 30 cues, speech-map e roteiro CONCORDAM e o manifesto é a
paráfrase encurtada — apesar do nome. `validate:acls-audio` só confere as CHAVES,
não o texto, então essa paráfrase nunca foi cobrada. Fica registrado: **regravar
pelo manifesto empobreceria o áudio** sem ninguém notar.

**A divergência que importa é uma:** `start_cpr`.

- MP3 gravado: "Iniciar RCP **agora**. Cem a cento e vinte compressões por minuto.
  Cinco a seis centímetros de profundidade. Permitir o retorno total do tórax."
- TTS falaria: "Iniciar RCP **de alta qualidade**. … **Trinta compressões para duas
  ventilações. Minimizar as interrupções.**"

**RESOLVIDO — e não era decisão clínica.** Medindo a DURAÇÃO dos arquivos:

| | texto declarado | MP3 | leitura |
|---|---|---|---|
| PT | 220 caracteres | 9,64 s | diz a versão CURTA — atrasado |
| ES | 226 caracteres | 16,67 s | bate com o texto completo |

O espanhol já havia sido regravado com o texto completo. Logo o texto pretendido é
o completo, e o MP3 em português é que ficou atrás. Não havia decisão a tomar,
havia gravação a refazer.

`acls/AUDIO_SCRIPT.md` passou a trazer o texto completo, marcando **REGRAVAR** na
linha do `start_cpr`. Com isso `speech-map` e roteiro batem em todas as cues.

## L-010 · Validador de duração de áudio contra o texto

`scripts/valida-audio-vs-texto.cjs` (`npm run validate:audio-duracao`) pega a
classe de erro que causou o caso acima: **o texto muda e ninguém regrava**. Nada
apontava isso — `validate:acls-audio` confere as CHAVES, não o conteúdo.

Ajusta, POR IDIOMA, `duração ≈ caracteres / velocidade + pausa × (frases − 1)` por
mínimos quadrados sobre o próprio acervo, e compara real com previsto. PT: 16,5
caracteres/s e 0,48 s de pausa. ES: 17,6 e 0,54 s.

**Duas medidas erradas antes desta, registradas para não se repetirem:**

1. **Taxa absoluta de caracteres por segundo** — inútil: a taxa cai quando há mais
   frases, porque cada ponto vira pausa. O `start_cpr` completo tem SEIS frases e
   deveria estar entre as taxas mais BAIXAS; aparecia na mais alta, mas junto de
   cues curtas de uma frase, e a lista de suspeitos enchia de falso positivo.
2. **Comparar PT com ES na mesma cue** — parecia autocalibrante e não é: a voz ES
   fala ~18% mais rápido, e traduções têm tamanho diferente por razão legítima
   ("Qual é o ritmo?" tem 47 caracteres; a versão ES, 80). Essa medida acusou 6
   cues em espanhol que estão CORRETAS, atribuindo a "áudio truncado" o que era voz
   mais lenta e tradução mais verbosa.

Resultado com o modelo por idioma: `pt:start_cpr` em 0,61× — o caso real — mais
três avisos entre 0,68× e 0,75× e nenhum falso positivo. Limites: falha abaixo de
0,65×, aviso até 0,80×.

**✅ `start_cpr` em PT regravado.** O arquivo novo tem 13,92 s (eram 9,64 s), o
resíduo subiu de 0,61× para 0,83× e alinhou com o ES em 1,07×. Os dois idiomas
passam a dizer a mesma coisa no comando de início de RCP.

**Efeito colateral instrutivo:** trocar o arquivo REFIZ a reta do modelo, e
`pt:initial_recognition` passou de 0,68× para 0,64×, cruzando o limite. Não é
regressão — é a régua se recalibrando. Foi registrado como pendência de ESCUTA (não
de regravação) em vez de o limite ser afrouxado, que era o caminho fácil e teria
cegado a verificação que acabara de achar um problema real.

O caso é genuinamente ambíguo pela medição: 4,13 s para 84 caracteres em 3 frases
curtas. Pode ser a voz PT lendo rápido — o `rearrest` fica igualmente baixo nos DOIS
idiomas (0,69× e 0,75×) com o mesmo conteúdo, o que mostra o modelo penalizando
frase curta — ou pode faltar a última oração ("Acionar emergência e trazer o
desfibrilador" é metade do texto). **Medição não separa os dois casos; ouvir o
arquivo separa, e leva 4 segundos.**

**Checado de passagem:** nenhum MP3 em ES é cópia byte a byte do PT. O `rearrest`
tem duração e tamanho idênticos nos dois idiomas, o que levantou a suspeita, mas os
arquivos diferem — mesma voz, mesma duração, mesmo encoder.
