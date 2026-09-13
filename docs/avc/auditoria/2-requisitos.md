## 2. Requisitos (RQ-*) · classificação com evidência

### 2.1 · O achado crítico AC-01, por extenso

| o que | onde | medido como |
|---|---|---|
| O campo do AVC só confirma com os 15 itens respondidos | `components/avc/campo-de-escala.tsx:139-140` (`completa = respondidos === ITENS_NIHSS.length`) e `:359-362` (`disabled={!completa}`) | leitura; `e2e/avc-superficie-b.spec.ts:114` afirma `aria-disabled="true"` antes de preencher |
| A escala não oferece opção de item não testável | `clinical-calculators-engine.ts:684-737`, todas as opções dos itens 1a–11 lidas sem truncar | busca no bloco: `UN` 0; `avaliáv` 0. Controle: `Afasia` 5 |
| A ajuda do item manda tratar como não testável | `:708` *"Amputação ou fusão do ombro = não testável"*; `:714` (quadril); `:732` *"Só é não testável se houver intubação ou outra barreira física"* | leitura |
| A opção do mesmo item pontua a intubação | `:734` `{ label: "Grave/intubado", points: 2 }` | leitura |
| A nota da escala diz o contrário do que o AVC faz | `:754` *"Itens não testáveis (amputação, fusão articular, intubação) não são pontuados nesta tela; registre a ressalva por escrito."* | leitura; a nota não é lida pelo campo do AVC, que só mostra `item.help` (`campo-de-escala.tsx:244`, `:282-284`) |

**Consequência medida:** para confirmar a escala no AVC, o médico precisa escolher
um número para o item que a própria ajuda chama de não testável. O total gerado
entra na trilha como `nihss_calculado` (`components/avc/avc-modulo-screen.tsx:744-750`).
**Não verificado:** a conformidade dessas opções com o instrumento oficial do
NIHSS, que não foi aberto nesta rodada (direitos de uso: D-PEND-06).

### 2.2 · Tabela

| RQ | classe | evidência (arquivo · função/tela · medição) | o que falta (se parcial) |
|---|---|---|---|
| RQ-T01-01 | parcial | Abre sem identificação: `e2e/avc-abertura.spec.ts:159` afirma *"Nada aqui é obrigatório"* e as abas visíveis. Busca `provisóri\|não identificad\|identificação do paciente\|nome do paciente`: 0 (controle T) | Não existe ID provisório do atendimento. |
| RQ-T01-02 | parcial | Marcos separados em `avc/conteudo/superficie-b.ts:159-249` (`hora_chegada`, `hora_ultima_vez_bem`, `hora_inicio_observado`, `hora_reconhecimento`, `hora_meio_do_sono`); "não sei" no último-visto-bem (`e2e/avc-superficie-a.spec.ts:848`); prova 28 dos críticos | Falta fuso explícito (AC-22). A chegada não oferece "desconhecido" (`e2e/avc-superficie-a.spec.ts:878`), divergindo do texto "cada marco aceita não sei". |
| RQ-T01-03 | parcial | `FatoRegistrado` (`avc/nucleo/tipos.ts:135-208`, campos de código lidos): `id`, `corrigeFatoId`, `campo`, `valor`, `horaClinica`, `horaRegistro`, `procedencia`, `motivo`, `tipo`, `instancia`. Glicemia vazia ≠ normal: `e2e/avc-superficie-a.spec.ts:149` | O fato não tem autor nem unidade, e a temperatura saiu do isquêmico (AC-14). |
| RQ-T01-04 | parcial | `pressaoArterialMedia` em `avc/nucleo/derivacoes.ts:537` (`pad + (pas − pad)/3`, `undefined` sem medida completa); tela `avc-pam` em `components/avc/superficie-a.tsx:633`; `scripts/prova-avc-independencia-da-ui.cjs:323-338` afirma `undefined` para vazio, só PAS e só PAD | Não há conferência de valores inconsistentes (busca PAS/PAD invertida e `inconsistente` em `avc/nucleo/` + `components/avc/`: 0, controle T). |
| RQ-T01-05 | parcial | `avc/conteudo/paciente.ts:628-662`: "Nenhum destes" e `NAO_SEI` são opções distintas | Faltam cinco itens da lista do PDF (AC-19). |
| RQ-T01-06 | atendido | `scripts/prova-avc-criticos.cjs`, blocos 15 e 27 (§3) | — (a dose do anticoagulante não foi medida) |
| RQ-T01-07 | parcial | Texto livre sem consumidor: `avc/conteudo/paciente.ts:255`, `:406`, `:631` (*"Sem consumidor — por isso pode aceitar texto livre"*) | Não pede conciliação estruturada. |
| RQ-T01-08 | atendido | `e2e/avc-abertura.spec.ts:159` (vai à Imagem sem preencher nada) e `:203` (abre estudo sem Paciente); `hora_solicitacao_imagem` (`superficie-c.ts:514`); `derivacoes-c.ts:217` (`em_andamento` se solicitada) | — |
| RQ-T02-01 | parcial | `scripts/prova-avc-ameacas.cjs` (19 conferências, ex.: *"disfunção bulbar marcada ACENDE a via aérea"*); `e2e/avc-superficie-a.spec.ts:572` | A convulsão não é eixo de ameaça: `e2e/avc-estabilizacao-composicao.spec.ts:56` afirma que a Estabilização não carrega crise, e `:130` que ela está na Avaliação AVC. "Não sei → perguntas menores" não foi medido. |
| RQ-T02-02 | parcial | Agentes e doses no bloco de tratamento: `e2e/avc-estabilizacao-composicao.spec.ts:304` (PA), `:334` (glicemia), `:209` (hipoxemia); `:357` afirma que hipotensão e Glasgow não geram conduta | Não há ficha para hipotensão e Glasgow; "ficha com parâmetro pendente aparece indisponível" não foi medido. |
| RQ-T02-03 | atendido | `e2e/avc-superficie-f.spec.ts:85`: "Realizada" → `aguardando_reavaliacao`, e só abre com nova aferição 150/90. `e2e/avc-superficie-e.spec.ts:181` | — |
| RQ-T02-04 | ausente | AC-10 | — |
| RQ-T02-05 | ausente | AC-10 | — |
| RQ-T02-06 | parcial | Pós-IVT: `e2e/avc-superficie-g.spec.ts:55`; pré-IVT: `e2e/avc-superficie-f.spec.ts:85`; sem reperfusão: F-05 transcrito (`fontes.ts:75`); HIC em `hemorragia-intracerebral.ts` | "Sem diagnóstico, sem alvo" não foi medido. |
| RQ-INT-01 | ausente | AC-23 | — |
| RQ-T03-01 | parcial | Achados típicos da Table 4 em `superficie-b.ts`. `flutua` em `avc/`: 2 ocorrências, ambas sobre ponto flutuante (`derivacoes-f.ts:212`, `formato.ts:55`) | Falta início, persistência e flutuação por sintoma. |
| RQ-T03-02 | ~~contradiz a spec~~ → **atendido em `ec8f107`** | §2.1 (estado de `52aa4e2`); §7.1 (fechamento) | Usar soma com UN em critério de trombectomia depende de decisão do autor (AC-26). |
| RQ-T03-03 | atendido | `incapacitante_assumido` com Incapacitante / Não incapacitante / `nao_sei` (`e2e/avc-superficie-b.spec.ts:197`, `:260`, `:282`); `scripts/prova-avc-fase4-composicao.cjs` *"NIHSS 22 NÃO responde o déficit incapacitante"*; `derivacoes-b.ts:386` | — |
| RQ-T03-04 | parcial | Trilha append-only; novo total da escala entra como fato novo (`avc-modulo-screen.tsx:684-689`) | Não há marca de exame anterior à sedação (AC-16). |
| RQ-T04-01 | parcial | `derivacoes-c.ts:121-225`: `sugerido`, `em_andamento`, `realizado_sem_resultado`, `realizada_resultado_pendente`, `realizada_resultado_registrado`; `e2e/avc-superficie-c.spec.ts:187` (sem TC não afirma ausência de hemorragia) | Faltam "interpretado" e "indisponível/cancelado com motivo". |
| RQ-T04-02 | parcial | `superficie-c.ts:444-462`: "Não especificado no laudo" e `NAO_SEI` viram `indeterminado`; `horaClinica` e `horaRegistro` no fato | Não há opção "inconclusivo" explícita (`inconclusiv`: 0). |
| RQ-T04-03 | parcial | AC-18 | Faltam "isquemia provável" e "dúvida/outra hipótese". |
| RQ-T05-01 | atendido | Composição D1: `criteriosAvaliados` com papel e estado (`satisfeito`, `contradito`, `ausente`, `em_julgamento`); `prova-avc-criticos.cjs` blocos 3, 4 e 27 | — (a força da regra é pendência de REG) |
| RQ-T05-02 | atendido | `avc/nucleo/veredito-da-trombectomia.ts:28-30` (*"não existe aqui nenhuma leitura do estado da IVT"*); `prova-avc-fase9-evt.cjs` (imports proibidos = 0); `e2e/avc-fase9-trombectomia.spec.ts:269` (IVT `bloqueado_seguranca` e EVT avaliada) | — |
| RQ-T05-03 | parcial | A leitura recalcula: `e2e/avc-superficie-a.spec.ts:119` | A conclusão histórica não é preservada (AC-09). |
| RQ-T06-01 | parcial | AC-13; ver a conduta não a registra (`e2e/avc-estabilizacao-composicao.spec.ts:394`); abrir o registro sem preencher não cria exposição (`e2e/avc-criticos.spec.ts:175`) | Faltam indicado, decidido, prescrito e preparado. |
| RQ-T06-02 | ausente | AC-21 | — |
| RQ-T06-03 | ausente | AC-07 | — |
| RQ-T06-04 | ausente | AC-08 | — |
| RQ-T06-05 | parcial | Deterioração pós-IVT com conduta: `e2e/avc-superficie-g.spec.ts:208`; F-35c em 3 ocorrências | Faltam angioedema e reação ao contraste na tela (AC-12). |
| RQ-HEM-01 | parcial | `e2e/avc-superficie-c.spec.ts:238`: a hemorragia abre `avc-hemorragica-hic`, com conteúdo (15 mL cerebelar); `TEMAS_HIC` (3 ocorrências) | É catálogo de temas, não caminho com entregas. |
| RQ-HEM-02 | parcial | `PCC\|idarucizumab\|andexanet\|protamina\|vitamina K` em `avc/conteudo/`: 34; ex. `hemorragia-intracerebral.ts:183` | A ficha de reversão por agente não foi medida como entrega. |
| RQ-HEM-03 | parcial | Conteúdo pressórico de HIC em `hemorragia-intracerebral.ts` | Não há alvo exposto como entrega própria (não medido na tela). |
| RQ-HEM-04 | parcial | `e2e/avc-superficie-c.spec.ts:261` (`avc-hem-rec-cerebelar` contém "15 mL") | A indicação neurocirúrgica é recomendação solta, não entrega. |
| RQ-HEM-05 | parcial | `48 ?h\|48 horas` no hemorrágico: 4; só profilaxia 24–48 h (`hemorragia-intracerebral.ts:591-593`) | Não há plano de 48 h. |
| RQ-REC-01 | atendido | `superficie-g.ts:492-506`: três perguntas Sim/Não/Incerto; `e2e/avc-superficie-g.spec.ts:235` afirma a raia da EVT idêntica antes e depois de "sem centro, sem transferência" | — |
| RQ-REC-02 | parcial | `e2e/avc-superficie-g.spec.ts:252` (sem centro EVT não destrava F-31); `superficie-g.ts:493` (*"Não torna o paciente inelegível"*) | Plano local e reavaliação do acesso não foram medidos como entrega. |
| RQ-T07-01 | parcial | `superficie-g.ts:102` (unidade de AVC) e `:120` (*"UTI OU unidade de AVC"*) | Falta a escolha de destino por necessidade × capacidade entre as quatro opções. |
| RQ-T07-02 | ausente | AC-11 | — |
| RQ-TEL-01 | ausente | AC-11 | — |
| RQ-T07-03 | parcial | `avc/nucleo/sintese-do-caso.ts` existe; separa indicada de administrada (`:17`, `:41`) | O conteúdo exigido (horários, fundamentos, pendências, próxima reavaliação) não foi conferido item a item. |
| RQ-T08-01 | parcial | Pós-IVT: `prova-avc-fase8-pos-reperfusao.cjs`, `prova-avc-fase10-antitromboticos.cjs`; pós-EVT: lacuna declarada (`e2e/avc-superficie-g.spec.ts:224`) | Falta plano sem reperfusão e plano hemorrágico. |
| RQ-T08-02 | ausente | `type Tarefa\|interface Tarefa\|tarefas\s*:\|prazo\s*:` em `avc/` + `components/avc/`: 0 (controle T) | — |
| RQ-T08-03 | atendido | `e2e/avc-fase10-antitromboticos.spec.ts:58` (§3, A15); prova fase 10 (`prazoHoras === 24` e *"ANTES de iniciar…"*) | — |
| RQ-T08-04 | parcial | `notifica`: 0 (não presume notificação) | Não há agenda visível (`agenda`: 0, controle T). |
| RQ-FAL-01 | ausente | No isquêmico, `não melhorou\|falha terapêutica\|resgate\|reoclus`: só HSA (`hemorragia-subaracnoidea.ts:220`, `fontes.ts:169`) | — |
| RQ-FAL-02 | parcial | Piora medida reabre a ameaça: `prova-avc-fase7-correcoes.cjs`, expressão `estadoDaReavaliacao(piora) === "alterada_agora"` e bloqueio `glicemia_alterada` | Falta o gatilho "piorou" a partir de qualquer tela (AC-10). |
| RQ-ORQ-01 | ausente | AC-16 | — |
| RQ-ORQ-02 | ausente | AC-16 | — |
| RQ-ORQ-03 | parcial | `testID="avc-destino-modulo-inexistente"` em `components/avc/superficie-c.tsx:372` | Não se registra conduta externa. |
| RQ-ORQ-04 | ausente | AC-16 | — |
| RQ-DAD-01 | parcial | O atendimento nasce em `abrirAtendimento(relogio)` (`e2e/avc-abertura.spec.ts:190`) | Faltam ID, paciente, perfil de recursos e versão do conteúdo (`versaoDoConteudo\|versão do conteúdo`: 0). |
| RQ-DAD-02 | parcial | `FatoRegistrado` (RQ-T01-03); `Vazio` = `nao_perguntado`, `nao_sei`; `Procedencia` (`tipos.ts:110`) | Faltam autor, unidade e "não aplicável" como estado. |
| RQ-DAD-03 | parcial | `corrigeFatoId` e `motivo` no fato; desfazer acrescenta correção (`avc-modulo-screen.tsx`, `desfazer`) | Falta o autor da correção. |
| RQ-DAD-04 | **contradiz a spec** | AC-09 | — |
| RQ-DAD-05 | parcial | Estudo como instância, com modalidade, hora e resultado (`superficie-c.ts`) | Faltam responsável e disponibilidade. |
| RQ-DAD-06 | parcial | AC-22; janela não se calcula da descoberta: prova 28 dos críticos | Falta fuso explícito. |
| RQ-DAD-07 | atendido | Texto livre sem consumidor (RQ-T01-07) | — |
| RQ-DAD-08 | parcial | Ação com tipo e estado (`onNovaAcao`, `acao_tipo`) | Faltam dose, volume, resposta e complicações na instância. |
| RQ-DAD-09 | ausente | AC-11 | — |
| RQ-DAD-10 | ausente | ver RQ-T08-02 | — |
| RQ-PER-01 | ausente | AC-02; `e2e/retomada-de-fluxo.spec.ts` mira o hub `"/(tabs)"` (linha de `HUB`), não o AVC | — |
| RQ-PER-02 | ausente | Decisão registrada (D-PEND-02), sem implementação | — |
| RQ-PER-03 | ausente | Decisão registrada (D-PEND-03). `BroadcastChannel\|storage event\|segunda aba\|outra aba\|lock` em `avc/`, `components/avc/`, `lib/`, `e2e/`: só falsos positivos (*clock*, *block*, *unlock*) | — |
| RQ-I18N-01 | **contradiz a spec** | AC-17 | — |
| RQ-I18N-02 | não medido | `e2e/avc-modulo-navegavel.spec.ts:445` só fixa `es-419` **antes** de abrir o módulo | — |
| RQ-I18N-03 | parcial | Vírgula aceita (`e2e/avc-fase9-trombectomia.spec.ts:276`, INR `"2,5"`); passo `test:grandeza-decimal` no `test:all` | Rejeição de separador ambíguo não medida. |
| RQ-I18N-04 | não medido | — | — |
| RQ-POP-01 | ~~ausente~~ → **atendido em `2e28bd8`** | AC-03; §7.3 (fechamento) | — (idade numérica × faixa etária não são cruzadas; não testado) |

### 2.3 · Regras (RQ-REG-*, RQ-FAR-01), dependências das linhas acima

**Condição comum a todas:** `forcaDaAfirmacao\|ForcaDaAfirmacao\|contextoDaFonte`
em `avc/` + `components/avc/` dá 3 ocorrências. Todas são o **homônimo**
`ContextoDaFonte` da população da Table 4 (`avc/nucleo/derivacoes-b.ts:61`,
`:90`, `:92`), não o campo da p.12. COR/LOE aparecem 249 vezes em
`avc/conteudo/`. **Nenhuma regra tem força nem validação humana.** Por isso
nenhuma pode ser "atendido".

| regra | classe | o que existe | o que falta |
|---|---|---|---|
| RQ-REG-IVT, -IVT-SEG | parcial | catálogo com COR/LOE; composição D1; portão tipado (provas dos críticos 3, 4, 15, 27, 28) | Faltam força, `contextoDaFonte`, errata (AC-04) e validação. |
| RQ-REG-EVT | parcial | `prova-avc-fase9-evt.cjs` (82 conferências) | Faltam força, errata e validação. |
| RQ-REG-IMG | parcial | exclusão de hemorragia; destino hemorrágico | Faltam duas saídas (AC-18) e a RM (AC-20). |
| RQ-REG-INCAP | parcial | juízo do médico separado da pontuação | A força da definição segue pendente. |
| RQ-REG-AMEACA | parcial | eixos A–D com fonte | Faltam convulsão como ameaça, eixo E, força e validação. |
| RQ-REG-PA-IVT | parcial | bloqueio corrigível; alvo pós-IVT | Faltam força e validação. |
| RQ-REG-ANTITROMB | parcial | ordem "imagem em 24 h antes" (A15) | Faltam força e validação. |
| RQ-REG-48H | não medido | — | — |
| RQ-REG-DEST | parcial | unidade de AVC / UTI (`superficie-g.ts:102`, `:120`) | Falta a decisão de destino. |
| RQ-REG-FALHA | ausente | RQ-FAL-01 | — |
| RQ-REG-HIC-REV, -PA, -CIR | parcial | catálogo `TEMAS_HIC` | Faltam as entregas. |
| RQ-REG-COMP-SANG | parcial | sinais e conduta pós-alteplase (`e2e/avc-superficie-g.spec.ts:208-220`) | F-35c parcial; tenecteplase fora. |
| RQ-REG-COMP-CONTRASTE | parcial | F-35b transcrito | Não chega à tela (AC-12). |
| RQ-REG-COMP-ANGIO | ausente | AC-12 | — |
| RQ-FAR-01 | parcial | dose do trombolítico com teto; anti-hipertensivos com agente e dose | Faltam concentração, volume e preparo (F-20 parcial, AC-21). |

---

