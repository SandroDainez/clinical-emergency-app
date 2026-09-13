## 3. Casos de aceite A01–A18 · há teste? (asserção lida, não o título)

| caso | teste | o que a asserção mede | cobre? |
|---|---|---|---|
| A01 · História incompleta | `e2e/avc-abertura.spec.ts:159` *"dá para ir a qualquer fase sem preencher nada em Paciente"* · `:203` · `e2e/avc-superficie-a.spec.ts:149` *"glicemia não informada aparece como desconhecida, não como normal"* · `scripts/prova-avc-criticos.cjs` bloco 4 | abas visíveis e *"Nada aqui é obrigatório"*; novo estudo sem Paciente; glicemia *"desconhecida não é normal"*; sem TC → `v.tipo === "incompleta"` com `classe_imagem` ausente | **sim** |
| A02 · PA tratada sem nova medida | `e2e/avc-superficie-f.spec.ts:85` *"PA 198/112 · corrigir não basta — o portão só abre com nova aferição"* · `e2e/avc-superficie-e.spec.ts:181` | após "Realizada": `avc-f-portao-estado-aguardando_reavaliacao` visível e `ivt_indicacao_confirmada` com contagem 0; só a nova aferição 150/90 remove o motivo | **sim** |
| A03 · Anticoagulante sem última dose | `scripts/prova-avc-criticos.cjs` blocos 15 e 27 | `julgamento_individual_pendente`; `liberado === false`; `aguarda_juizo` em `doac_ultima_dose`; propriedade *"menos informação nunca é mais permissivo"* em 12 combinações | **sim** |
| A04 · Início desconhecido | `scripts/prova-avc-criticos.cjs` bloco 28 · `e2e/avc-cenarios-clinicos.spec.ts:265` *"F · janela — horário desconhecido não fecha a reperfusão"* | início não perguntado → `≠ indicada`; "não sei" + RM completa → rota estendida; início conhecido há 6 h → `nao_corresponde`; janela da rota = 4,5 h de `symptom_recognition`; e2e: raia IVT visível e `avc-f-sem-relogio` | **sim** |
| A05 · NIHSS baixo incapacitante | **não existe** com NIHSS baixo | próximos: prova dos críticos bloco 3 (só "Incapacitante" → elegibilidade clínica `satisfeito`); `prova-avc-fase4-composicao.cjs` mede o inverso (NIHSS 22 não responde incapacitância) | parcial |
| A06 · NIHSS incompleto | `e2e/avc-superficie-b.spec.ts:114` *"o NIHSS se preenche item a item, e zero é resposta"* | confirmar com `aria-disabled="true"` antes de preencher | parcial, e o item não testável **contradiz** (AC-01) |
| A07 · Hemorragia na imagem | `scripts/prova-avc-criticos.cjs` bloco 5 · `e2e/avc-superficie-c.spec.ts:238` *"hemorragia produz destino nomeado, que ABRE o módulo hemorrágico"* | IVT `retida`; portão `bloqueado_seguranca`; EVT classe `retida` por `hemorragia_presente`; destino `hemorragia_intracraniana`; e2e: `avc-hemorragica-hic` visível | **sim** (caminho = catálogo; RM: AC-20) |
| A08 · IVT impedida, possível EVT | `e2e/avc-fase9-trombectomia.spec.ts:269` *"o No Benefit da EVT NÃO se pinta como o bloqueio de segurança da IVT"* · `scripts/prova-avc-fase9-evt.cjs` | INR 2,5 → portão IVT `bloqueado_seguranca` **e** EVT avaliada (`nao_recomendada_sem_beneficio` visível); prova: imports proibidos = 0 (estrutural) | parcial: não há cenário com IVT impedida e EVT **recomendada** |
| A09 · Intubação e módulos associados | **não existe** | — | não |
| A10 · Glicemia corrigida, déficit persiste | `e2e/avc-superficie-e.spec.ts:352` *"disglicemia grave NÃO é apresentada como contraindicação"* · `scripts/prova-avc-glicemia.cjs` | texto *"déficit neurológico persiste depois de corrigir"* presente; `PERGUNTA_QUE_DECIDE` e ramos `sePersiste`/`seDesaparece` escritos | parcial: mede texto, não a reavaliação neurológica nem a continuidade da investigação |
| A11 · Deterioração após tratamento | **não existe** para reabrir a avaliação | próximos: `e2e/avc-superficie-g.spec.ts:208` (lista de sinais e conduta pós-IVT); `prova-avc-fase7-correcoes.cjs` (piora medida → `alterada_agora`) | parcial |
| A12 · Sem recurso ou transferência | `e2e/avc-superficie-g.spec.ts:235` *"responder o contexto operacional NÃO muda NADA em Reperfusão"* · `:252` *"ausência de centro EVT NÃO destrava F-31"* | texto da raia EVT igual antes e depois; dívida F-31 continua dita | parcial: plano local, apoio, documentação e transferência sem teste |
| A13 · Fechar e reabrir | **não existe** | `e2e/avc-abertura.spec.ts:189-192` declara a não persistência; `e2e/avc-cockpit-abcde.spec.ts:165` "reabrir" é reabrir o eixo na tela | não |
| A14 · Novo dado relevante | `e2e/avc-superficie-a.spec.ts:119` *"o fato entra no estado e a leitura recalcula à vista"* | leitura muda após o fato | parcial: decisão histórica **não existe** (AC-09) |
| A15 · 24 h sem imagem de controle | `e2e/avc-fase10-antitromboticos.spec.ts:58` · `scripts/prova-avc-fase10-antitromboticos.cjs` | estado `antes_da_imagem_controle`; sem *"iniciar antiagregante agora"*; com laudo, sem *"liberad\|pode iniciar\|indicado iniciar\|autorizad"*; nenhuma dose; prova: `prazoHoras === 24` e *"ANTES de iniciar…"* | **sim** |
| A16 · Concentração alterada | **não existe** | — | não |
| A17 · Clique duplo | **não existe** | `e2e/avc-superficie-e.spec.ts:233` *"duas intervenções aparecem como DUAS"* mede dois toques **deliberados** com seleção entre eles; nenhum teste distingue toque acidental | não |
| A18 · Dois usuários | **não existe** | aceite alterado por D-PEND-03 para detectar e bloquear | não |

**Indexação usada para achar candidatos:**
- 313 títulos de `test(` em `e2e/avc*` + `e2e/retomada-de-fluxo.spec.ts`. Controle: `avc-criticos.spec` = 8.
- 558 conferências `conf(` em `scripts/prova-avc*`, incluindo título em várias linhas. Controle: `prova-avc-criticos` = 169.
- Candidato achado **só por título** não foi aceito como cobertura.

### 3.1 · Invariantes da p.11

| invariante | classe | evidência | o que falta |
|---|---|---|---|
| Desconhecido ≠ negativo | atendido no núcleo IVT/EVT | `Vazio` distingue `nao_perguntado` de `nao_sei` (`tipos.ts`); propriedades das provas 27 e 28 dos críticos; `e2e/avc-controle-de-data.spec.ts:130` (título) | Onde o domínio não existe (populações, AC-03), o invariante não tem onde valer. |
| Não medido ≠ normal | parcial | `e2e/avc-superficie-a.spec.ts:149`; PAM `undefined` sem medida completa; `e2e/avc-superficie-c.spec.ts:187`; `e2e/avc-eixos-acordeao.spec.ts:195` (concluir sem dados não afirma nada) | O item do NIHSS não testável vira pontuação (AC-01). |
| Prescrição ≠ administração | parcial | Ver conduta ≠ registrar (`e2e/avc-estabilizacao-composicao.spec.ts:394`); exposição derivada do histórico (D2, `3e94b1f`) | O estado "prescrito" não existe (0), então a prescrição não é registrável à parte da administração. |
| Retorno ≠ resolução | parcial | Análogo intramódulo: ação "Realizada" → `aguardando_reavaliacao` (`e2e/avc-superficie-f.spec.ts:85`); *"corrigir não reavalia"* (`e2e/avc-superficie-f.spec.ts:274`, `e2e/avc-superficie-e.spec.ts:120`) | Não há retorno entre módulos (AC-16). |

---

