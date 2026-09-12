# PLANO-CORRECAO-AVC-CRITICOS.md

**Natureza:** plano de implementação. Nenhum arquivo do repositório foi alterado para produzi-lo. Nenhum código é proposto aqui além de tipos e assinaturas ilustrativas.
**Base:** branch `refactor/clinical-modules-rebuild`, HEAD `a7350f5` (idêntico a `ba14943` em `avc/`, `components/avc/`, `e2e/`, spec).
**Insumos:** auditoria original (AVC-01…19), revisão independente (matriz + reprodução em `repro.cjs`), decisões do autor D1 e D2, ESPECIFICACAO-AVC.md, CONSOLIDACAO-CLINICA-AVC.md, verbatim `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md`.

---

## 1. RESUMO EXECUTIVO

Onze achados são *release blockers*. Eles não são onze defeitos: são **cinco causas** e uma inconsistência local.

| Causa | Achados | Natureza |
|---|---|---|
| **R1** · o bloqueio de classe da imagem não tem consumidor de classe | 01 (parte), 05 | função existe (`reperfusaoRetidaPelaImagem`) e ninguém a lê fora dos testes |
| **R2** · o catálogo IVT é plano e o veredito o reduz por "qualquer aplicável" | 01, 02, 03 | falta domínio, falta janela como critério, falta relógio |
| **R3** · o portão só conhece um estado negativo de segurança | 04, 08 | incerteza relevante e julgamento individual caem no mesmo balde que "sem problema" |
| **R4** · o ciclo de vida da ação não tem "interrompida" e a exposição é lida do último estado | 07, 09, 13 | vocabulário incompleto + derivação por estado corrente + instância vazia lida como conduta |
| **R5** · fato temporal com duas representações | 12 | `relogiosClinicos` × fato do campo |
| local · G elege estudo por ordem de registro | 06 | contraria a regra de C |

A estratégia é corrigir a **arquitetura causal** em seis blocos pequenos, cada um com prova vermelha antes e verde depois, sem criar segundo motor, sem novo catálogo, sem número clínico novo, sem regra de fonte inventada. A ordem começa pelo que não depende de decisão nova do autor (R1) e termina no que depende (D1 composição, marco da janela).

Fora desta rodada: AVC-10, 15, 17 (roadmap) e AVC-11, 14, 16, 18*, 19 (posteriores). *AVC-18 entra de carona porque a mudança de `agora` já toca a comparação de janela; custa zero e evita tocar o mesmo ponto duas vezes — se o autor preferir, fica fora.

---

## 2. DECISÕES DO AUTOR INCORPORADAS

### D1 — veredito positivo composto

"Trombólise indicada" passa a ser uma **derivação composta e explicável**, nunca a leitura `aplicavel` de uma única recomendação. Componentes, todos já sustentados por fonte e contrato (Consolidação Bloco 4 "fatos mínimos"; spec §1.9a e §2.3 confirmação 1):

| papel | critério | leitor já existente | fonte |
|---|---|---|---|
| elegibilidade clínica | déficit incapacitante assumido | insumo `deficit_incapacitante` (B) | §4.6.1 rec. 1 ("disabling deficits") e rec. 8 (COR 3 para leve não incapacitante) — F-17 |
| temporal | dentro da janela padrão ≤ 4,5 h pelo marco da fonte | `valorDaJanela` (F) | §4.6.1 rec. 2 / §4.6.2 rec. 1 — F-02 (**HR-1**: qual marco) |
| classe | hemorragia excluída na imagem | barreira de classe (C) | F-16 rec. 1 |
| segurança | nenhum impeditivo conhecido; incerteza relevante resolvida | cortes e itens (D), tipados em R3 | F-07, F-10 |
| negativa | nenhuma COR 3 de população aplicável | catálogo, domínio elegibilidade | §4.6.1 rec. 8 |

O veredito devolve a lista de critérios com estado (`satisfeito · contradito · ausente · em_julgamento`), fonte e valor legível — é isso que torna a conclusão explicável (E-22). A frase continua "Os critérios registrados sustentam a trombólise" + ressalva. A guideline **não** recebe a autoria da frase individual: o rodapé cita cada regra-fonte usada e diz que a composição é do aplicativo.

### D2 — ciclo de vida da trombólise

Vocabulário fixado: `iniciada · realizada · interrompida · cancelada`, com a semântica dada (cancelada = antes do início, sem exposição; interrompida = começou e parou, **com** exposição). Exposição é derivada do **histórico** da instância. "Interromper a infusão" nunca produz "não recebeu trombolítico". Isto exige emenda da tabela de §2.3 da spec (que hoje funde interrompida em cancelada) para ficar coerente com §3.7 (que já as separa) — registrado em HUMAN_REVIEW como emenda documental, não como decisão pendente.

---

## 3. CAUSAS-RAIZ

### R1 — Barreira de classe sem consumidor de classe
- `derivacoes-c.ts:353` `reperfusaoRetidaPelaImagem()` = `exclusao !== "excluida"`. Consumidores: **zero** fora de `prova-avc-superficie-c`.
- `veredito-da-trombolise.ts:161-176` reimplementa metade: `retida` só em `hemorragia_presente | divergente`. `sem_informacao` cai no catálogo.
- `portao-ivt.ts:195` lê `veredito.tipo === "retida"` → herda a metade.
- `veredito-da-trombectomia.ts` não lê imagem. Não existe portão de EVT.
- Efeito: portão IVT `liberado` sem nenhuma TC (AVC-01); EVT `recomendada` com hemorragia (AVC-05).

### R2 — Catálogo plano + redução por "qualquer aplicável"
- `superficie-f.ts:459-600`: todas as recs IVT têm `dominio: "elegibilidade"`; nenhuma declara `criterios`; nenhuma exige `"janela"`.
- `ivt_agente` (§4.6.2 rec. 1) exige só `peso`; `ivt_rapidez` (§4.6.1 rec. 1) exige só `deficit_incapacitante`; `ivt_tnk_04` (§4.6.2 rec. 2) exige só o agente.
- `veredito-da-trombolise.ts:184-212`: COR 3 aplicável ⇒ `nao_recomendada`; favorável aplicável ⇒ `indicada`; sem `agoraMs` (`:178`).
- `derivacoes-f.ts:598-600`: sem `criterios`, a leitura é "há dado?". Comentário `:470-476` documenta que a IVT foi deixada intacta ao criar critérios da EVT (decisão de não mexer de carona, não de ignorar janela).
- Efeito: só peso ⇒ indicada (AVC-01); 72 h ⇒ indicada (AVC-02); TNK ⇒ não recomendada (AVC-03).

### R3 — Portão com um único estado negativo de segurança
- `portao-ivt.ts:206-208` lê só `contraindicacao_nao_corrigivel` dos cortes; `:214-215` só dos itens.
- `derivacoes-d.ts:187-194` produz `informacao_insuficiente` na divergência com o comentário "não libera" — o consumidor libera.
- `pendenciasDaSeguranca()` (`:432-486`) não é lida pelo portão. Nada em `avc/nucleo` lê varfarina/heparina.
- Efeito: INR 2,5 + INR 1,0 ⇒ liberado (AVC-04); suspeita de coagulopatia + sem exame ⇒ liberado; DOAC hora desconhecida ⇒ liberado sem sinal de julgamento individual (AVC-08).

### R4 — Ciclo de vida incompleto + exposição por estado corrente + instância vazia
- `superficie-e.ts:62-66` `OPCOES_ESTADO_DA_ACAO = [Iniciada, Realizada, Cancelada]`; F importa o mesmo vocabulário.
- `derivacoes-f.ts:782-795` `acoesDeTrombolise` lê o **último** `ivt_estado`.
- `derivacoes-g.ts:149-150` conta só `iniciada|realizada`; `:447-454` sem hora ⇒ `fora_do_contexto_pos_ivt` e `aspirinaIvNosNoventaMin: false`.
- `sintese-do-caso.ts:120-129` instância sem estado ⇒ conduta "indicada"; `superficie-f.tsx:218` conta instâncias para discrepância.
- Efeito: iniciada→cancelada apaga exposição (AVC-07); sem hora vira "fora do contexto" (AVC-09); formulário vazio vira "Trombólise indicada" (AVC-13).

### R5 — Duas representações do marco
- `avc-modulo-screen.tsx:782-789` grava fato **e** `relogiosClinicos`; "Sem essa informação" grava só o fato (`:598`, `campos-clinicos.tsx:1042`).
- `estado.ts:260-266` `decorridoEmMinutos` lê `relogiosClinicos`; consumidores: `sintese-do-caso.ts:98`, cabeçalho (`screen:228`). Os motores de F leem o fato e estão certos.
- Efeito: LKW `nao_sei` e síntese "há 2 h" (AVC-12).

### Local — G elege estudo
- `derivacoes-g.ts:425-434` `find` do primeiro com laudo por ordem de registro. C (`exclusaoDeHemorragia`, `destinoDaImagem`) já sabe não eleger. Efeito: AVC-06.

---

## 4. ARQUITETURA ATUAL (onde a composição quebra)

```
fatos (trilha append-only)
  │
  ├─ C  exclusaoDeHemorragia ──► reperfusaoRetidaPelaImagem  ──► (ninguém)
  │        └── só hemorragia|divergente ──► veredito IVT "retida" ──► portão IVT
  │
  ├─ F  RECOMENDACOES (planas) ──► recomendacoesDoEstado(estado)   [sem agora]
  │        └── qualquer favorável aplicável ──► "indicada" ──► portão "liberado"
  │        └── qualquer COR3 aplicável ──► "nao_recomendada"
  │
  ├─ D  cortes/itens ──► contraindicacao_nao_corrigivel ──► portão
  │        informacao_insuficiente / pendências ──► (ninguém no portão)
  │
  ├─ F  acoesDeTrombolise (último ivt_estado) ──► G pertinência / síntese
  │        instância vazia ──► síntese "indicada"; F conta discrepância
  │
  ├─ EVT vereditoDaTrombectomia(estado, agora) ──► seleção   [sem imagem]
  │
  └─ relogiosClinicos (escrita dupla) ──► síntese/cabeçalho
```

Cinco pontos em que uma garantia local desaparece na composição: (1) a classe da imagem; (2) o domínio da recomendação; (3) a incerteza da segurança; (4) o histórico da ação; (5) o marco temporal.

---

## 5. ARQUITETURA PROPOSTA

### 5.1 Fluxo de dados

```
fatos ──► leituras por superfície (C, D, B, A, F-ação)  [inalteradas na semântica]
              │
              ├─ C ► barreiraDeReperfusao(estado)              ← ÚNICA fonte da classe
              │       consumida por: portão IVT · veredito IVT · veredito EVT · (futuro) gate EVT
              │
              ├─ D ► leituras com efeitoNaAcao tipado          ← R3
              │       consumida por: portão IVT (todas as espécies), tela D
              │
              ├─ F ► RECOMENDACOES com dominio {elegibilidade|agente|posologia|tecnica|procedimento}
              │       recs IVT de elegibilidade com criterios.janela + exige "janela"
              │       recomendacoesDoEstado(estado, agoraMs)   ← agora obrigatório para quem decide
              │
              ├─ F ► CRITERIOS_DA_INDICACAO_IVT (dados, papel+fonte)   ← D1
              │       vereditoDaTrombolise(estado, agoraMs) = barreira ▷ COR3 ▷ composição ▷ incompleta
              │
              ├─ F ► exposicaoAoTrombolitico(estado)            ← R4 / D2 (histórico da instância)
              │       consumida por: G (pertinência, fase, PA, antitrombótico), síntese, discrepância
              │
              ├─ G ► imagensAposIvt(estado, inicioMs)           ← AVC-06 (não elege)
              │
              └─ relógio: fato do campo é canônico; relogiosClinicos só t0_operacional  ← R5
```

### 5.2 Dependências permitidas e proibidas

- `barreiraDeReperfusao` importa **só** `derivacoes-c`. Proibido importar `derivacoes-d/e/f`. É isso que garante que EVT não herde nada de IVT: a única coisa comum é a leitura de C.
- `vereditoDaTrombectomia` passa a importar `barreiraDeReperfusao`. Continua **proibido** importar `bloqueiosCorrigiveis`, `cortesLaboratoriais`, `itensMarcados`, `exposicaoADoac`, `acoesDeTrombolise` (a prova `prova-avc-fase9-evt` já varre o arquivo; ampliar a lista).
- `portao-ivt` deixa de inferir imagem de `veredito.tipo` e passa a ler a barreira diretamente (uma verdade, I6).
- `derivacoes-g` deixa de ler `acoesDeTrombolise` cru e passa a ler `exposicaoAoTrombolitico` (que vive em F, casa da ação; G→F continua unidirecional).
- Nenhum componente calcula: F.tsx e G.tsx só renderizam os tipos novos.

### 5.3 Barreira de classe — matriz de estados

Tipo (ilustrativo):

```ts
type BarreiraDeReperfusao =
  | { estado: "liberada"; estudos: string[] }
  | { estado: "retida"; motivo:
        | "sem_imagem"                 // nenhum estudo registrado
        | "sem_resultado_interpretavel"// há estudo, mas nenhum de modalidade que responda estudo_resultado (ex.: só RM) — AVC-16 declarada
        | "resultado_pendente"         // TC sem contraste registrada, sem laudo
        | "hemorragia_presente"
        | "divergente";
      estudos: string[]; oQueFalta: string; leva: "imagem" };
```

Derivada de `exclusaoDeHemorragia()` + `situacaoDaTcSemContraste()` + `estudos()`. Sem campo novo.

| estado da imagem | avaliar IVT | concluir IVT "indicada" | administrar IVT | avaliar EVT (seleção) | concluir EVT "recomendada" | realizar EVT |
|---|---|---|---|---|---|---|
| não realizada (`sem_imagem`) | sim | **não** — `incompleta`, falta exclusão | **não** — portão retido | sim | seleção pode fechar; veredito carrega `classe: retida`; selo não afirma reperfusão | **não** |
| resultado pendente | sim | não — incompleta | não | sim | idem | não |
| sem hemorragia (`liberada`) | sim | pelas demais camadas | pelas demais camadas | sim | pela seleção | pela seleção (+ suas próprias condições, F-08/F-16) |
| hemorragia presente | sim (lista) | **não** — `retida`; destino HIC prevalece (PD-36) | não | sim (lista) | **não** — `classe: retida_hemorragia`; destino HIC | não |
| divergente | sim | não — retida até reconciliar (corrigir laudo na instância) | não | sim | não — retida até reconciliar | não |
| informação insuficiente (`sem_resultado_interpretavel`) | sim | não — incompleta, nomeando a limitação | não | sim | classe retida | não |

Regras de leitura: **avaliar** nunca é bloqueado (E-11, §5.3: a imagem bloqueia "administrar/realizar", não "avaliar"). **Concluir positivo** exige classe liberada porque a Consolidação lista "hemorragia excluída" entre os fatos mínimos da candidatura. **Executar** exige classe liberada sempre. `sem_informacao` continua não sendo hemorragia (E-23): a frase fala da trilha ("nenhuma TC registrada"), nunca do paciente.

Para a EVT o veredito ganha um segundo eixo em vez de sobrescrever o primeiro:

```ts
type VereditoDaTrombectomia = { selecao: TipoDoVereditoEvt; classe: BarreiraDeReperfusao; ... }
```

A tela mostra os dois. Quando `classe.estado === "retida"`, o selo de "sucesso" não é exibido; aparece "Seleção atende · reperfusão retida pela imagem: <motivo>". A **palavra** exata é HR-8.

### 5.4 Reconstrução da composição IVT (camadas A–G)

| camada | onde mora | como se separa | o que nunca implica |
|---|---|---|---|
| **A · elegibilidade clínica** | critério `deficit_incapacitante` (B) + COR 3 rec. 8 | papel `elegibilidade_clinica` em `CRITERIOS_DA_INDICACAO_IVT` | déficit sozinho ≠ indicada |
| **B · critérios temporais** | `janelas` das recs + `criterios.janela` + `valorDaJanela(agoraMs)` | papel `temporal`; marco por recomendação, nunca global | dentro da janela ≠ elegível |
| **C · segurança** | D (cortes, itens, DOAC, antiagregante, CMB) tipados por `efeitoNaAcao` | camada "segurança" do portão + critério `seguranca` da composição | pendência ≠ liberação |
| **D · escolha do agente** | `CAMPO_AGENTE` (`agente_trombolitico`) + `ivt_agente` com `dominio: "agente"` | fora do veredito; alimenta cartão de dose e alerta posológico | agente selecionado ≠ indicado |
| **E · esquema de dose** | `ivt_tnk_04` com `dominio: "posologia"` + `DOSES` | `alertasNegativos` continua a mostrá-la para TNK; não entra no veredito | TNK selecionada ≠ TNK 0,4 |
| **F · cálculo da dose** | `doseDerivada(agente, peso, origem)` | inalterado; exige agente + peso + origem | dose calculada ≠ administrada |
| **G · administração** | `ACAO_DE_TROMBOLISE` + `exposicaoAoTrombolitico` | ver 5.6 | instância aberta ≠ evento |

Menor alteração estrutural: (i) `DominioDaRecomendacao += "agente" | "posologia"`; (ii) `RECOMENDACOES_DE_ELEGIBILIDADE_IVT = RECOMENDACOES.filter(terapia==="ivt" && dominio==="elegibilidade")` (espelho exato do que a EVT já tem); (iii) `criterios.janela` + `"janela"` em `exige` de cada rec IVT de elegibilidade que tenha `janelas` (leve não incapacitante, início desconhecido, wake-up, LVO sem EVT); (iv) `CRITERIOS_DA_INDICACAO_IVT` como dado em `superficie-f.ts` (papel, insumo/derivação, fonte, verbatim de onde vem) — **não é catálogo novo**: referencia insumos e recs já existentes; (v) `vereditoDaTrombolise(estado, agoraMs)` = barreira ▷ COR 3 de elegibilidade aplicável ▷ composição (todos satisfeitos ⇒ `indicada`) ▷ `incompleta` nomeando ausentes ▷ `sem_criterios` quando algum critério está **contradito** e nenhuma recomendação de janela estendida alcança (ver HR-2). `ivt_rapidez` permanece no catálogo com `dominio: "elegibilidade"` como âncora textual do critério "déficit incapacitante", mas deixa de fechar sozinho porque a composição substituiu "qualquer aplicável" (HR-9 confirma).

### 5.5 Janelas temporais e `agora`

- `agoraMs: number` torna-se **obrigatório** em `vereditoDaTrombolise`, `estadoDoPortaoIVT` e (já é) `vereditoDaTrombectomia`. Quem só lista (`recomendacoesDoEstado`) mantém opcional: ausência ⇒ insumo `janela` ausente ⇒ potencial, nunca aplicável (regra já existente e provada).
- Origem única: a tela lê `relogio.agora()` uma vez por render e passa o número; as provas passam `relogioControlado`. Nenhuma função do núcleo chama `Date.now()`.
- Relógios continuam independentes por recomendação (`ORIGEM_DO_MARCO`, `camposDoMarco`); `onset_ou_lkw` mantém a disjunção; `midpoint_of_sleep` continua sem campo (lacuna declarada); `t0_operacional` continua só em métricas.
- Comparação em milissegundos: `valorDaJanela` compara `agoraMs - marcoMs` com `ateHoras*3_600_000` (inclusivo como hoje). `minutosDesdeCampoDoEstado` fica só para apresentação (`horasEMinutos`). Fronteira 6 h pertencendo a `evt_ant_1` **e** `evt_ant_2` permanece como está (inconsistência da fonte, não harmonizar).

### 5.6 Exposição ao trombolítico (D2, AVC-07/09/13)

```ts
type Exposicao =
  | { estado: "nenhuma_administracao" }
  | { estado: "registro_em_aberto"; instancia }                      // instância sem ivt_estado — não é evento
  | { estado: "planejada" }                                          // ivt_indicacao_confirmada = "Prosseguir" (decisão), sem ação — HR-10
  | { estado: "cancelada_antes_do_inicio"; instancia }
  | { estado: "exposta"; fase: "iniciada" | "realizada" | "interrompida";
      inicio: { tipo: "conhecido"; ms } | { tipo: "desconhecido_declarado" } | { tipo: "nao_perguntado" };
      agente?: string; instancia };
```

Regra do histórico: a instância é `exposta` se **alguma vez** teve `Iniciada`, `Realizada` ou `Interrompida`; `fase` = último desses três. `Cancelada` só significa "cancelada antes do início" quando **nenhum** dos três precedeu; se precedeu, a trilha é contraditória e o estado é `exposta` + pendência "situação contraditória: registre Interrompida ou corrija" (HR-5 confirma).

Consumidores e efeito:
- `pertinenciaDaMonitorizacao`: pertinente se `exposta` (qualquer fase). Corrige AVC-07.
- `faseDaMonitorizacao`, `estadoPressoricoPosIvt`: já tratam "sem hora"; passam a ler `exposicao.inicio`.
- `estadoAntitromboticoPosIvt`: novo estado `sem_horario_ivt` (espelho dos irmãos); `aspirinaIvNosNoventaMin: true | false | undefined`. Corrige AVC-09. "IVT iniciada sem horário" ⇒ "exposição confirmada, intervalo indeterminado".
- `sinteseDoCaso`: condutas só de `exposta` (com a fase legível: iniciada/realizada/interrompida); `planejada` aparece como decisão, não conduta. Corrige AVC-13.
- Discrepância (F.tsx): conta `exposta`, não instâncias.

### 5.7 Imagens seriadas pós-IVT (AVC-06)

```ts
type ImagensAposIvt =
  | { estado: "nenhuma_posterior" }
  | { estado: "posterior_sem_resultado"; estudos }
  | { estado: "hemorragia_identificada"; estudos; discordante: boolean }   // qualquer posterior com hemorragia (mesma regra de destinoDaImagem)
  | { estado: "sem_hemorragia_identificada"; estudos }                     // todas as posteriores com laudo concordam
```

- "Posterior" = `estudo_hora` conhecida e ≥ início da IVT (como hoje). Estudo sem hora não é assumido posterior (E-52) — aparece como "não classificável no tempo" e gera a pendência de horário já existente.
- Basal = hora conhecida e < início. Não entra na leitura pós-IVT.
- **Não** se classifica "precoce / por deterioração / de controle" nesta rodada: exigiria fato novo (finalidade do estudo) ou regra temporal que a Table 7 não dá (ela diz "at 24 h", sem tolerância). HR-6 decide se um campo **opcional** `estudo_motivo` entra depois.
- `estadoAntitromboticoPosIvt` consome esta leitura: `hemorragia_identificada` tem estado próprio e prevalece; `discordante` é dito. "Sem hemorragia" só quando todas concordam.

### 5.8 Formulário ≠ evento clínico (AVC-13)

| conclusão | único evento explícito que a produz |
|---|---|
| "Trombólise indicada" (decisão) | `ivt_indicacao_confirmada = "Prosseguir com a trombólise"` — nunca instância aberta, nunca agente escolhido |
| "Trombólise administrada / realizada" | `ivt_estado = Realizada` |
| exposição | `ivt_estado ∈ {Iniciada, Realizada, Interrompida}` no histórico |
| monitorização pertinente | exposição |
| discrepância "administração apesar de bloqueio" | exposição registrada com portão não liberado |
| nada | marcador `trombolise_iv_nova_medida`, agente considerado, dose calculada |

O marcador `_nova_medida` continua existindo (máquina de instâncias), mas nenhuma derivação clínica o lê. Instância sem estado pode gerar, no máximo, uma pendência "registro de administração sem situação informada".

### 5.9 Incerteza tipada (R3)

Discriminante derivado em D, sem número novo:

```ts
type EfeitoNaAcao =
  | "impede"                  // conhecido e impeditivo — corte cruzado; item Table 8 não corrigível
  | "impede_ate_corrigir"     // bloqueio corrigível (PA, glicemia) — já existe
  | "impede_ate_reavaliar"    // correção iniciada sem prova — já existe no portão
  | "impede_ate_reconciliar"  // divergente entre coletas; plaquetas com valor e sem unidade
  | "impede_ate_resultado"    // desconhecido clinicamente relevante — exame não colhido COM motivo de suspeita; varfarina/heparina com INR pendente
  | "exige_julgamento"        // situação individualizada pela fonte — DOAC (hora conhecida ou não, F-30), CMB > 10, itens relativos da Table 8, GI/GU tratado
  | "condicao_resolutiva"     // E-47 — sem suspeita e sem varfarina/heparina: pode iniciar antes do resultado, suspender se alterado
  | "informa"                 // risco aumentado declarado; antiagregante; baixa preocupação
  | "nao_aplicavel";
```

Mapeamento por item (só reclassificação do que a fonte já diz):

| item | fonte | estado hoje | efeito proposto |
|---|---|---|---|
| INR / plaquetas / aPTT / TP cruzando o corte | Table 8 "should not be administered" | `contraindicacao_nao_corrigivel` | `impede` (inalterado) |
| mesmo analito, coletas discordantes | regra do Laboratório (não elege) | `informacao_insuficiente` | `impede_ate_reconciliar` |
| plaquetas com valor e sem unidade | idem | `informacao_insuficiente` | `impede_ate_reconciliar` |
| exame não colhido + `motivo_para_suspeitar = sim` | rec. 10 (condicional) | pendência não lida | `impede_ate_resultado` |
| exame não colhido + varfarina/heparina em uso | Table 8 "without recent use of warfarin or heparin" | nada lê | `impede_ate_resultado` |
| exame não colhido + `motivo_para_suspeitar = não` + sem varfarina/heparina | rec. 10 + Table 8 | `nao_perguntado` | `condicao_resolutiva` (E-47, visível) |
| exame não colhido + suspeita **não perguntada** | E-23 | `nao_perguntado` | **HR-3** |
| DOAC, hora conhecida ou `nao_sei` | Table 8 "safety is unknown … may be considered"; F-30 aberta | `informacao_insuficiente + individualizada` | `exige_julgamento` — **nunca** `impede` |
| CMB > 10 | rec. 2b | `informacao_insuficiente` | `exige_julgamento` |
| itens Table 8 relativos / GI-GU tratado | faixa "may be considered" | `situacao_individualizada` | `exige_julgamento` |
| risco aumentado / antiagregante / CMB 1–10 / sem informação de CMB | COR 1–2a | `risco_aumentado` / `baixa_preocupacao` | `informa` |

Portão: dois estados novos, ambos `liberado: false` — `reconciliacao_pendente` e `resultado_pendente` — com motivos que nomeiam as coletas/o exame e o gesto que resolve. `exige_julgamento` **não** retém automaticamente (regra do autor); ele aparece como motivo visível com camada própria. O que o gesto "Prosseguir" faz diante de julgamento pendente é **HR-4** (as opções estão lá; nenhuma é assumida).

Regra invariante provável: `liberado === true` ⇒ nenhum motivo com efeito `impede*` e barreira `liberada`. `exige_julgamento` ⇒ nunca `impede`. `condicao_resolutiva` ⇒ nunca `impede`.

### 5.10 Marco canônico (R5)

- O fato do campo (`hora_ultima_vez_bem`, `hora_inicio_observado`, `hora_reconhecimento`) é a única verdade. `registrarHora` deixa de escrever em `relogiosClinicos`.
- `decorridoEmMinutos(estado, relogioId, relogio)` resolve `relogioId → campo` pelo atributo `relogio` já declarado nos campos (mesmo mapa de `ORIGEM_DO_MARCO`) e devolve `undefined` para `nao_sei`/`nao_perguntado`.
- `relogiosClinicos` fica só com `t0_operacional`. `definirRelogioClinico` restringe-se a ele (ou é removido para os clínicos).

---

## 6. MAPA DE ALTERAÇÕES

| arquivo | por que mudaria | função afetada | alteração conceitual | risco de regressão |
|---|---|---|---|---|
| `avc/nucleo/derivacoes-c.ts` | R1 | nova `barreiraDeReperfusao()` ao lado de `reperfusaoRetidaPelaImagem()` | tipo discriminado com motivo; sem campo novo; não altera `exclusaoDeHemorragia` | baixo; provas de C ganham casos |
| `avc/nucleo/portao-ivt.ts` | R1, R3, agora | `estadoDoPortaoIVT(estado, agoraMs)` | lê barreira direto (não `veredito.tipo`); consome `efeitoNaAcao`; estados `reconciliacao_pendente`, `resultado_pendente`; motivo de julgamento | médio: `prova-avc-fase6` muda expectativas (caso "só peso"); tela F lê `portao.estado` novos |
| `avc/nucleo/veredito-da-trombolise.ts` | R1, R2, D1, agora | `vereditoDaTrombolise(estado, agoraMs)` | `retida` vem da barreira; filtra domínio elegibilidade; ramo positivo vira composição; devolve `criterios[]` | alto (é o coração); coberto por provas novas + fase6 + apresentação-f |
| `avc/nucleo/veredito-da-trombectomia.ts` | R1 | `vereditoDaTrombectomia` | acrescenta eixo `classe` lido da barreira; seleção inalterada; import de C permitido, de D/E/F-ação proibido | médio: `prova-avc-fase9` amplia varredura de imports; F.tsx renderiza `classe` |
| `avc/conteudo/superficie-f.ts` | R2, D1 | `DominioDaRecomendacao`, `RECOMENDACOES` (ivt_agente→agente; ivt_tnk_04→posologia; recs IVT de elegibilidade com `criterios.janela`), nova `CRITERIOS_DA_INDICACAO_IVT`, `RECOMENDACOES_DE_ELEGIBILIDADE_IVT` | dados, com verbatim ao lado; nenhum número novo | médio: provas de superfície-f que asseguram `exige` não vazio e verbatim seguem válidas; `alertasNegativos` deve continuar mostrando 0,4 para TNK |
| `avc/nucleo/derivacoes-f.ts` | agora, AVC-18, D2 | `valorDaJanela` (ms), `minutosDesdeCampoDoEstado` (só apresentação), `acoesDeTrombolise` (histórico), nova `exposicaoAoTrombolitico()` | comparação sem arredondar; exposição por histórico | médio: fronteiras 6 h/24 h têm prova; `fatosQueFecharam` inalterado |
| `avc/conteudo/superficie-e.ts` | D2 | `ESTADO_DA_ACAO`, `OPCOES_ESTADO_DA_ACAO`, `ESTADOS_QUE_NAO_RESOLVEM` | `Interrompida` entra nos três; "interrompida nunca resolve bloqueio" | baixo: provas de E medem que nenhum estado resolve — continuam verdes |
| `avc/nucleo/tipos.ts` | D2 | `EstadoDaAcao` | `+ "interrompida"` | nenhum |
| `avc/nucleo/derivacoes-d.ts` | R3 | `LeituraDeCorte`, `LeituraDeSeguranca`, `exposicaoADoac`, `microssangramentos`, nova `leiturasDeSegurancaParaOPortao()` | acrescenta `efeitoNaAcao` derivado do estado + contexto (suspeita, varfarina/heparina) | médio: nenhum estado existente muda; só ganha etiqueta; provas de D confirmam que DOAC nunca vira `impede` |
| `avc/nucleo/derivacoes-g.ts` | R4, AVC-06, AVC-09 | `pertinenciaDaMonitorizacao`, `faseDaMonitorizacao`, `estadoPressoricoPosIvt`, `estadoAntitromboticoPosIvt`, `estudoDeControle` → `imagensAposIvt` | consome `exposicao`; não elege estudo; estado `sem_horario_ivt`; aspirina tri-estado | médio: `prova-avc-fase8/fase10/superficie-g` mudam expectativas nos casos sem hora e com estudos múltiplos |
| `avc/nucleo/sintese-do-caso.ts` | R4, R5 | `sinteseDoCaso` | condutas só de `exposta`; decisão "Prosseguir" como linha própria; LKW via fato | baixo |
| `avc/nucleo/estado.ts` | R5 | `decorridoEmMinutos`, `definirRelogioClinico` | relógio clínico derivado do fato; `relogiosClinicos` só t0 | médio: provas que usam `definirRelogioClinico` para LKW precisam registrar o fato |
| `components/avc/avc-modulo-screen.tsx` | R5, agora | `registrarHora`, passagem de `agora` | remove escrita dupla; passa `agora` ao veredito/portão | baixo |
| `components/avc/superficie-f.tsx` | R1, R3, R4 | renderização do portão (estados novos), do veredito (critérios explicáveis), do eixo `classe` da EVT, da discrepância (por exposição) | só apresentação de tipos novos; nenhum cálculo | médio: e2e de F (`avc-superficie-f`, `avc-fluxos-clinicos`, `avc-cenarios-clinicos`) checam textos |
| `components/avc/superficie-g.tsx` | AVC-09, AVC-06 | cartão antitrombótico | renderiza `sem_horario_ivt`, aspirina indeterminada, `discordante` | baixo |
| `avc/conteudo/rotulos-clinicos.ts` / i18n | todos | rótulos dos estados novos | PT-BR + ES (E-12); trava de rótulos | baixo |
| `scripts/prova-avc-*.cjs` | todos | fase6, fase8, fase9, fase10, superficie-c/d/f/g, apresentação-f | expectativas atualizadas **só** onde o comportamento antigo era o defeito; nova `prova-avc-criticos.cjs` | — |
| `e2e/*.spec.ts` | gesto real | novos specs (ver §9) | — | — |
| `auditoria/ESPECIFICACAO-AVC.md` §2.3, CONSOLIDACAO Bloco 4, DIVIDAS-CONHECIDAS | D1, D2, AVC-16 | emendas documentais | tabela de estados da ação; composição da candidatura; RM sem `estudo_resultado` declarada | — |

Não muda: `derivacoes-e.ts` (além de importar o vocabulário), `derivacoes-lab.ts`, `derivacoes-b.ts`, `instancia.ts` (a leitura de histórico usa `fatosDaInstancia` já existente), conteúdo de C/D/G (números, verbatim), HIC/HSA.

---

## 7. MATRIZ ACHADO → CAUSA → CORREÇÃO → TESTE

| achado | causa | correção | prova de núcleo | e2e |
|---|---|---|---|---|
| AVC-01 | R1 + R2 | barreira consumida pelo portão; composição D1 | vazio ⇒ incompleta; só peso ⇒ incompleta (faltam: déficit, janela, imagem); só "Incapacitante" ⇒ incompleta; propriedade `liberado ⇒ barreira liberada` | só peso ⇒ "Prosseguir" ausente |
| AVC-02 | R2 | `criterios.janela` + `agoraMs` obrigatório | 72 h ⇒ não indicada; limite exato ⇒ dentro; limite + 1 ms ⇒ fora; LKW `nao_sei` ⇒ janela ausente | início 72 h ⇒ portão não liberado |
| AVC-03 | R2 | domínios agente/posologia | peso + TNK ⇒ não `nao_recomendada`; `alertasNegativos ∋ ivt_tnk_04`; alteplase ⇒ sem alerta; E-50 inalcançável | clicar TNK ⇒ portão não muda |
| AVC-04 | R3 | `impede_ate_reconciliar` | INR 2,5→1,0 e 1,0→2,5 ⇒ `reconciliacao_pendente`; corrigir laudo ⇒ resolve; ×4 analitos; plaquetas sem unidade | duas coletas discordantes ⇒ cartão de reconciliação |
| AVC-05 | R1 | eixo `classe` na EVT | hemorragia ⇒ `classe: retida`, seleção intacta; divergente idem; **independência**: INR 2,5 não altera EVT | TC hemorrágica ⇒ sem selo "sustentam a trombectomia" |
| AVC-06 | local | `imagensAposIvt` | TC normal T+1 h + TC hemorrágica T+25 h em qualquer ordem ⇒ `hemorragia_identificada`; discordância dita | idem na tela G |
| AVC-07 | R4 / D2 | `Interrompida` + exposição por histórico | iniciada→interrompida ⇒ pertinente; cancelada só ⇒ não; iniciada→cancelada (legado) ⇒ exposta + pendência | registrar Interrompida ⇒ Destino mantém monitorização |
| AVC-08 | R3 | `impede_ate_resultado` / `exige_julgamento` / `condicao_resolutiva` | suspeita sim + sem exame ⇒ `resultado_pendente`; varfarina + INR pendente ⇒ idem; DOAC `nao_sei` ⇒ julgamento visível e **nunca** bloqueado_seguranca; suspeita não ⇒ E-47 | — |
| AVC-09 | R4 | `sem_horario_ivt` + aspirina tri-estado | iniciada sem hora ⇒ estado próprio; `aspirinaIvNosNoventaMin === undefined` | IVT sem hora ⇒ cartão antitrombótico visível com pendência |
| AVC-12 | R5 | fato canônico | conhecido → `nao_sei` ⇒ síntese e cabeçalho sem "há X h"; → corrigido ⇒ volta | "Sem essa informação" ⇒ cabeçalho sem tempo |
| AVC-13 | R4 | eventos explícitos | instância vazia ⇒ condutas `[]`, discrepância ausente, não pertinente; "Prosseguir" ⇒ decisão, não conduta | abrir "Registrar administração" ⇒ Destino sem conduta |
| AVC-18 (carona) | agora | comparação em ms | 24 h + 24 s ⇒ fora; 24 h exato ⇒ dentro | — |

---

## 8. ORDEM DE IMPLEMENTAÇÃO (commits pequenos)

Cada commit: uma causa, provas correspondentes verdes, `npm run test:all` verde ao final do commit (a prova adversarial nova só entra em `test:all` no último commit para não deixar a suíte vermelha entre passos).

| # | commit | conteúdo | depende de |
|---|---|---|---|
| **0** | — | HUMAN_REVIEW resolvidos (§11) | autor |
| **1** | `test(avc): prova adversarial dos críticos, vermelha por construção` | `scripts/prova-avc-criticos.cjs` com os 21 cenários de §9, expectativas = comportamento **correto**; registrada em `package.json` como `test:avc-criticos`, **fora** de `test:all`; README no cabeçalho dizendo quais casos ficam vermelhos até qual commit | — |
| **2** | `feat(avc): barreira de classe da reperfusão (R1)` | `barreiraDeReperfusao()` em C; portão lê barreira; veredito IVT `retida` via barreira; EVT ganha eixo `classe`; F.tsx renderiza; provas fase6/fase9/superfície-c ajustadas | — (E-08 e §5.3 já decidem) |
| **3** | `refactor(avc): agora obrigatório e comparação de janela em ms` | assinaturas `(estado, agoraMs)` no veredito e portão IVT; `valorDaJanela` em ms; tela passa `agora`; **sem mudança de resultado clínico** exceto fronteira (AVC-18) | 2 |
| **4** | `feat(avc): domínios agente/posologia no catálogo IVT (AVC-03)` | `DominioDaRecomendacao`; `ivt_agente`→agente, `ivt_tnk_04`→posologia; veredito filtra elegibilidade; prova de que o alerta 0,4 segue visível para TNK | 3 |
| **5** | `feat(avc): janela como critério das recomendações IVT (AVC-02)` | `criterios.janela` + `"janela"` em `exige`; `RECOMENDACOES_DE_ELEGIBILIDADE_IVT` | 3, HR-1 |
| **6** | `feat(avc): veredito IVT composto e explicável (D1, AVC-01)` | `CRITERIOS_DA_INDICACAO_IVT`; ramo positivo por composição; `criterios[]` na saída; F.tsx lista critérios com fonte; emenda Consolidação Bloco 4 | 2, 4, 5, HR-1/2/9 |
| **7** | `feat(avc): incerteza tipada na segurança e no portão (R3, AVC-04/08)` | `efeitoNaAcao` em D; estados `reconciliacao_pendente`/`resultado_pendente`; motivo de julgamento; provas D/fase6 | 2, HR-3/4 |
| **8a** | `feat(avc): estado Interrompida no ciclo de vida (D2)` | `superficie-e.ts`, `tipos.ts`, i18n, emenda §2.3 | — |
| **8b** | `feat(avc): exposição ao trombolítico derivada do histórico (AVC-07/09)` | `exposicaoAoTrombolitico()` em F; G consome; `sem_horario_ivt`; aspirina tri-estado; provas fase8/fase10 | 8a, HR-5/10 |
| **8c** | `fix(avc): instância de administração aberta não é conduta (AVC-13)` | síntese e discrepância por exposição | 8b |
| **9** | `fix(avc): imagens pós-IVT sem eleição por ordem de registro (AVC-06)` | `imagensAposIvt()`; antitrombótico consome; provas superfície-g | 8b |
| **10** | `fix(avc): marco temporal canônico no fato (AVC-12)` | `registrarHora` sem escrita dupla; `decorridoEmMinutos` via campo; síntese/cabeçalho | — |
| **11** | `test(avc): e2e de gesto real dos críticos + prova adversarial em test:all` | specs de §9; `test:avc-criticos` entra em `test:all`; DIVIDAS-CONHECIDAS: AVC-16 declarada, AVC-11/14/18/19 listadas como posteriores | 2–10 |

Commits 2, 8a e 10 são independentes entre si e podem ser paralelizados; 3→4→5→6 é sequencial; 7 pode vir após 2; 8b/8c/9 após 8a.

---

## 9. TESTES NECESSÁRIOS

### 9.1 Prova de núcleo `scripts/prova-avc-criticos.cjs` (natureza C — comportamento; universo e piso declarados, E-44)

Cenários obrigatórios (os 21 do pedido, mais os que a revisão exigiu):

1. **atendimento vazio** ⇒ veredito `incompleta`, portão não liberado, EVT `sem_criterios` com `classe: retida_sem_imagem`.
2. **somente peso** ⇒ `incompleta` nomeando déficit, janela, exclusão de hemorragia; portão não liberado.
3. **somente déficit incapacitante** ⇒ `incompleta` nomeando janela e imagem; portão não liberado.
4. **imagem ausente** com todos os demais critérios ⇒ `incompleta` (falta exclusão); EVT seleção fecha, `classe: retida`.
5. **hemorragia presente** ⇒ IVT `retida`; EVT `classe: retida_hemorragia`; destino HIC; portão `bloqueado_seguranca`.
6. **imagem divergente** ⇒ IVT `retida`; EVT `classe: retida_divergente`; corrigir laudo na instância ⇒ resolve.
7. **início há 72 h** (onset) ⇒ não `indicada`; sem janela estendida aplicável ⇒ `sem_criterios`/contradito nomeado; nunca `nao_recomendada`.
8. **limite exato da janela** (4,5 h IVT; 6 h e 24 h EVT) ⇒ dentro.
9. **limite + 1 ms** ⇒ fora; **limite − 1 ms** ⇒ dentro; 24 h + 24 s ⇒ fora.
10. **TNK 0,25 mg/kg** (agente TNK + peso) ⇒ veredito não `nao_recomendada`; `doseDerivada` = 0,25 mg/kg, teto 25.
11. **regra 0,4 mg/kg** ⇒ `alertasNegativos` contém `ivt_tnk_04` com TNK e não contém com alteplase; E-50: nenhuma dose de 30/35/40/45/50 mg alcançável.
12. **INR alto + normal** (coleta 1 = 2,5; coleta 2 = 1,0) ⇒ `reconciliacao_pendente`, não liberado.
13. **INR normal + alto** ⇒ idem (independe da ordem de registro); repetir para plaquetas, aPTT, TP; plaquetas sem unidade ⇒ idem.
14. **varfarina com INR pendente** ⇒ `resultado_pendente`, não liberado; INR 1,2 registrado ⇒ sai.
15. **DOAC com horário desconhecido** ⇒ motivo `exige_julgamento` visível; **nunca** `bloqueado_seguranca`; F-30 continua sem cálculo de janela.
16. **suspeita de coagulopatia = sim sem exame** ⇒ `resultado_pendente`; **= não** ⇒ `condicao_resolutiva` visível e portão pelas demais camadas.
17. **contraindicação IVT com EVT ainda possível** ⇒ INR 2,5 muda o portão IVT e **não muda nenhum byte** do veredito EVT (comparação estrutural).
18. **IVT iniciada → interrompida** ⇒ `exposta/interrompida`; monitorização pertinente; fase e PA pós-IVT calculadas; síntese "interrompida".
19. **cancelada antes de iniciar** ⇒ `cancelada_antes_do_inicio`; nada pertinente; síntese sem conduta.
20. **IVT com horário desconhecido** (`nao_sei` e não perguntado, separados) ⇒ `exposta` com `inicio` próprio; antitrombótico `sem_horario_ivt`; aspirina `undefined`.
21. **TC precoce normal → exame posterior hemorrágico** ⇒ `hemorragia_identificada` nas duas ordens de inserção; `discordante: true`.
22. **abrir formulário de administração vazio** ⇒ `registro_em_aberto`; condutas `[]`; discrepância ausente; monitorização não pertinente.
23. **LKW conhecido → `nao_sei` → corrigido** ⇒ síntese/cabeçalho acompanham.
24. **iniciada → cancelada (trilha legada)** ⇒ comportamento fixado por HR-5.
25. **propriedades**: (a) `portao.liberado ⇒ barreira.liberada ∧ ∄ motivo com efeito impede*`; (b) `exige_julgamento` nunca produz `impede`; (c) para todo estado, `vereditoDaTrombectomia(e)` é idêntico com e sem qualquer fato de D/E/A (independência); (d) permutar ordem de registro de coletas/estudos não muda nenhuma saída.

### 9.2 Provas existentes a atualizar (só onde o antigo era o defeito)
`prova-avc-fase6-portao` (caso "só peso"), `prova-avc-fase8-pos-reperfusao` e `fase10` (sem hora; cancelada), `prova-avc-fase9-evt` (varredura de imports + eixo classe), `prova-avc-superficie-c` (barreira), `prova-avc-superficie-d` (efeitoNaAcao), `prova-avc-superficie-f` (domínios), `prova-avc-apresentacao-f` (critérios explicáveis), `prova-avc-superficie-g` (imagens pós-IVT).

### 9.3 E2E de gesto real (`e2e/avc-criticos-*.spec.ts`)
- só peso ⇒ Reperfusão sem "Prosseguir"; texto nomeia o que falta em português, sem slug.
- clicar `avc-f-agente-Tenecteplase` ⇒ portão não vira "não recomendada"; alerta de 0,4 visível.
- TC hemorrágica ⇒ EVT sem selo positivo; destino HIC.
- duas coletas discordantes ⇒ cartão de reconciliação; corrigir laudo ⇒ some.
- Registrar Iniciada → Interrompida ⇒ Destino mantém monitorização.
- "Registrar administração" sem preencher ⇒ Destino sem conduta.
- LKW "Sem essa informação" ⇒ cabeçalho e síntese sem "há X h".
- Todos os textos novos passam em `valida-rotulos-clinicos` e `test:i18n`.

### 9.4 Provas estáticas
`reperfusaoRetidaPelaImagem`/`barreiraDeReperfusao` com consumidor em `portao-ivt` **e** `veredito-da-trombectomia`; nenhuma rec IVT `dominio: "elegibilidade"` com `janelas` não vazias sem `criterios.janela`; `OPCOES_ESTADO_DA_ACAO ∋ "Interrompida"`; `veredito-da-trombectomia.ts` não importa D/E/F-ação; nenhum componente importa `RECOMENDACOES`/`DOSES` para calcular.

---

## 10. O QUE NÃO SERÁ ALTERADO NESTA RODADA

- **Persistência entre sessões / reload** (AVC-10) — §3.9/§10.5.
- **Dose efetivamente administrada / quantidade parcial** (AVC-15) — apenas o estado `Interrompida` entra, sem campo de quantidade.
- **Fluxo de resgate pós-alteplase** (AVC-17) — F-35c permanece sem consumidor.
- **Tique de relógio na tela** (AVC-11), **texto causal da discrepância / E-24** (AVC-14), **RM com resultado** (AVC-16 — só declarada em DIVIDAS), **docs/avc-module.md** (AVC-19) — posteriores.
- Nenhuma mudança cosmética, de sistema visual (PD-37/38), de navegação ou de superfícies HIC/HSA.
- Nenhum número clínico, corte, janela, dose ou verbo de fonte é criado ou alterado.
- Nenhum outro módulo.
- Nenhuma harmonização de conflitos da fonte (três formulações da janela padrão; fronteira 6 h; onset × LKW).

---

## 11. HUMAN_REVIEW_REQUIRED

| id | decisão pendente | opções | consequência de cada |
|---|---|---|---|
| **HR-1** | **Marco da janela padrão no critério temporal da composição D1.** §4.6.1 rec. 2 usa *symptom onset*; §4.6.2 rec. 1 e §4.6.1 rec. 8 usam *onset or last known well*. | (a) `onset_ou_lkw` (disjunção já modelada: basta um dentro); (b) só `symptom_onset`; (c) exigir os dois quando ambos conhecidos | (a) segue o marco da recomendação de agente e da COR 3; (b) mais restritivo, deixa LKW-only sem janela padrão; (c) regra composta que a fonte não escreve. Registrar a inconsistência interna (F-02 já registra). |
| **HR-2** | Recomendação de **janela estendida** aplicável (2a/2b) pode sustentar `indicada` quando a janela padrão está contradita? | (a) sim, com a força da rec exibida; (b) não — sai como "recomendação de janela estendida aplicável", sem a palavra "indicada" | Hoje `ivt_wakeup` e `ivt_lvo_sem_evt` estão `nao_avaliavel` (F-31); só `ivt_inicio_desconhecido` fecha. (a) reaproveita o catálogo; (b) evita força agregada. |
| **HR-3** | Exame não colhido com **suspeita não perguntada**. | (a) `informacao_incompleta` nomeando o **juízo** (perguntar "há motivo para suspeitar?"), não o exame; (b) `condicao_resolutiva` (trata não perguntado como "sem motivo") — viola E-23; (c) `resultado_pendente` — cobra coagulograma de todos, viola 🚫 marca 2 | Recomendo (a). |
| **HR-4** | O que o gesto "Prosseguir" faz quando há motivo `exige_julgamento` (DOAC, CMB > 10, itens relativos). | (a) portão em estado próprio `aguarda_julgamento_individual`, gesto disponível, e o registro da decisão fica marcado "com julgamento individual pendente"; (b) exigir um fato novo "julgamento individual registrado" (campo, passa por E-49, sem cortes); (c) nada muda no gesto, só o motivo aparece | (a) não cria campo e não bloqueia; (b) cria rastreabilidade mas é campo novo; (c) mantém a lacuna de AVC-08 parcialmente. |
| **HR-5** | **Trilhas legadas** `Iniciada → Cancelada` na mesma instância. | (a) `exposta` + pendência "situação contraditória"; (b) `cancelada_antes_do_inicio` (D2 literal) — apaga exposição já registrada; (c) migração documental única | Recomendo (a). |
| **HR-6** | Campo **opcional** `estudo_motivo` (basal · precoce · deterioração · controle) para as imagens seriadas? | (a) não nesta rodada (modelagem por tempo + hemorragia basta); (b) sim, opcional, sem derivação de conduta | (b) passa por E-49 e E-31 (a fonte não define "controle" além de "at 24 h"). |
| **HR-7** | Emenda da tabela de §2.3 da spec (cancelada ⇒ antes do início; interrompida ⇒ após exposição), alinhando com §3.7. | confirmar texto | Documental; D2 já decide o conteúdo. |
| **HR-8** | **Palavra** do selo EVT quando seleção fecha e classe está retida. | ex.: "Seleção atende · reperfusão retida pela imagem" | Revisão visual da palavra lida (regra do gesto real). |
| **HR-9** | `ivt_rapidez` (§4.6.1 rec. 1) permanece no catálogo como `elegibilidade` (âncora do critério "déficit incapacitante") ou migra para `PRINCIPIOS_GERAIS`? | (a) permanece, mas não fecha sozinho (composição governa); (b) migra | (a) preserva listagem na tela; (b) mais estrito quanto a "pressupõe elegibilidade". |
| **HR-10** | Estado `planejada` da exposição = `ivt_indicacao_confirmada = "Prosseguir"`? | (a) sim; (b) não modelar "planejada" nesta rodada | (a) dá à síntese uma linha "decisão registrada"; (b) menor. |
| **HR-11** | AVC-18 entra de carona no commit 3? | sim / não | Custo zero; muda fronteira ≤ 30 s. |
| **HR-12** | Heparina: existe opção em `anticoagulante_em_uso`? Se não, a regra da Table 8 ("warfarin or heparin") fica declarada como lacuna de campo, não inventada. | verificar no conteúdo de Paciente | Sem campo ⇒ EVIDÊNCIA INSUFICIENTE para o ramo heparina. |

Nenhum destes itens é resolvido no plano. Os commits 5, 6, 7 e 8b esperam HR-1/2/3/4/5/9/10.

---

## 12. CRITÉRIOS DE ACEITAÇÃO (para autorizar a implementação)

1. HR-1 a HR-10 respondidos por escrito pelo autor (HR-11/12 podem ficar para o commit).
2. `scripts/prova-avc-criticos.cjs` escrito e **vermelho** nos casos 1–24 antes de qualquer correção, com a lista dos casos vermelhos declarada no cabeçalho.
3. Nenhum número clínico novo em nenhum diff: revisão por `grep` de literais numéricos em `avc/conteudo` e `avc/nucleo` comparando antes/depois; toda constante nova é referência a constante existente.
4. Nenhum import de `derivacoes-d/e`, `acoesDeTrombolise` ou `bloqueiosCorrigiveis` em `veredito-da-trombectomia.ts` (prova estática).
5. Nenhum componente em `components/avc` importa `RECOMENDACOES`, `DOSES`, `CORTES_LABORATORIAIS` ou calcula janela.
6. Ao final de cada commit: `npm run test:all` verde (a prova adversarial fora de `test:all` até o commit 11); ao final do commit 11: `test:all` verde **com** `test:avc-criticos` incluída.
7. Propriedades 25(a)–(d) verdes.
8. Nenhuma saída do núcleo é persistida (varredura: nenhum `registrarFato` com valor derivado de veredito/portão/exposição).
9. Emendas documentais aplicadas no mesmo PR: §2.3 (D2), Consolidação Bloco 4 (D1), DIVIDAS-CONHECIDAS (AVC-16 declarada; AVC-11/14/18*/19 como posteriores; AVC-10/15/17 roadmap).
10. Revisão visual da palavra lida (regra do projeto) para: estados novos do portão, selo EVT com classe retida, "interrompida" na síntese, cartão antitrombótico sem hora.
11. Comportamento do "registro retrospectivo" preservado: registrar uma administração já ocorrida continua sempre possível, com o portão em qualquer estado.

---

## 13. DECISÕES DO AUTOR INCORPORADAS (2026-09-12) — plano aprovado

| id | decisão do autor | como o plano a incorpora |
|---|---|---|
| **HR-1** | Janela padrão usa o marco `onset_ou_lkw` **conforme declarado pela recomendação-fonte**, preservando os relógios separadamente; sem janela global. | O critério temporal da composição D1 lê `janelas` da(s) recomendação(ões) que o sustentam (§4.6.2 rec. 1 e §4.6.1 rec. 8 declaram `onset_ou_lkw`); a disjunção já modelada em `valorDaJanela` vale (basta um marco dentro). Nenhuma constante nova. |
| **HR-2** | Rotas de janela estendida podem sustentar "indicada" **somente** com todos os critérios específicos daquela rota satisfeitos; falta de qualquer requisito pertinente mantém `incompleta`. | A composição aceita a rota estendida X só quando `correspondencia(X) === "aplicavel"` (todos os `exige` de X satisfeitos, inclusive a janela de X) e as camadas comuns (classe, segurança, sem COR 3) estão satisfeitas. `nao_avaliavel` (F-31) nunca sustenta. ⚠️ Aplicação literal: o critério "déficit incapacitante" pertence à rota padrão (§4.6.1 recs. 1/8); as rotas estendidas usam a população que a própria recomendação escreve. Registrado em §11 como observação, não como decisão nova. |
| **HR-3** | "Não perguntado" sobre coagulopatia ≠ negativo ≠ contraindicação. Incerteza só retém conclusão positiva quando pertinente ao caminho avaliado; coagulograma não é universalmente obrigatório. | Exame não colhido + suspeita **não perguntada** ⇒ `informacao_incompleta` nomeando o **juízo** (a pergunta "há motivo para suspeitar?"), nunca o exame. Suspeita = não e sem varfarina/heparina ⇒ `condicao_resolutiva` (E-47), visível e não bloqueante. |
| **HR-4** | Julgamento individual pendente não bloqueia atendimento/navegação, mas **não pode ser convertido automaticamente em liberação** da ação. | Estado próprio do portão `julgamento_individual_pendente` com `liberado: false`; nenhuma navegação ou registro retrospectivo é afetado; o motivo cita o verbo da fonte ("may be considered") e nunca a palavra contraindicação. Sem campo novo nesta rodada. |
| **HR-5** | Trilhas legadas `iniciada → cancelada` preservam a exposição; não reinterpretar como cancelamento pré-início. | `exposicaoAoTrombolitico` lê o histórico: qualquer `Iniciada/Realizada/Interrompida` anterior ⇒ `exposta`; o `Cancelada` posterior gera pendência "situação contraditória: registre Interrompida ou corrija". |
| **§2.3** | Emenda aprovada: interrompida ≠ cancelada (cancelada = antes do início, sem exposição; interrompida = iniciou e foi suspensa, com exposição). | Texto da tabela de §2.3 atualizado no commit 8a; vocabulário `ESTADO_DA_ACAO` ganha `interrompida`. |
| **ivt_rapidez** | Permanece no catálogo como princípio de rapidez/condução; sai do domínio de elegibilidade; não sustenta "indicada" sozinha. | `dominio: "principio"`; continua listada na tela; o critério "déficit incapacitante" da composição cita §4.6.1 rec. 1 como fonte textual sem depender da correspondência dessa recomendação. |
| **planejada** | Não criar nesta rodada. | `Exposicao` não tem estado `planejada`; a decisão "Prosseguir" segue no seu campo próprio, fora da exposição. |
| **AVC-18** | Corrigir junto da refatoração temporal (mesmo helper); comparar tempo preciso, arredondar só para apresentação, com testes de fronteira. | Commit 3 separa `msDesdeCampoDoEstado` (decisão) de `minutosDesdeCampoDoEstado` (apresentação); provas limite−1 ms / limite / limite+1 ms. |
| **heparina** | Não expandir vocabulário sem entrada já existente. | A opção "Heparina ou heparina de baixo peso molecular" **já existe** em `anticoagulante_em_uso` (`paciente.ts`); a regra da Table 8 ("without recent use of warfarin or heparin") é lida desse campo. Nenhum vocabulário novo. HR-12 fechado. |
| **veredito positivo** | "Trombólise indicada" é derivação nível 3 do aplicativo, rastreável a fatos e regras-fonte; não atribuída a recomendação isolada. | `VereditoDaTrombolise.criterios[]` carrega, por critério, papel · estado · fonte · valor legível; a ressalva diz que a composição é do aplicativo. `nivelDeConstrucao: 3` declarado no tipo. |

**HR-6, HR-8, HR-10** ficam como estavam: sem campo de finalidade de imagem; palavra do selo EVT com classe retida sujeita à revisão visual; sem estado `planejada`.

**Ordem de execução confirmada:** commit 1 (prova adversarial vermelha) → 2 → 3 → 4 → 5 → 6 → 7 → 8a → 8b → 8c → 9 → 10 → 11. Após cada commit: suítes pertinentes + `test:all`. Regressão não explicada ⇒ parar e relatar.

Este documento encerrou a etapa de planejamento em 2026-09-12 e passou a guiar a implementação.
