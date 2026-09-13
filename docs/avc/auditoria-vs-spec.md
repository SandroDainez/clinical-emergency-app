# Auditoria do AVC existente contra a especificação (PDF v1.1)

**Data:** 2026-09-13 · **HEAD auditado:** `52aa4e2`, igual ao remoto após o push desta rodada
**Spec:** `docs/spec-avc.md` · **Requisitos:** `docs/avc/matriz-requisitos.md` · **Regras:** `docs/avc/matriz-regras.md`

**Natureza:** auditoria **só de leitura**. Nenhum código, conteúdo clínico ou tela
foi alterado. Nada aqui valida regra clínica: tudo segue **pendente de validação
médica** até registro humano com nome, versão e data.

## Como ler

- **Classe:** atendido · parcial · ausente · contradiz a spec. Onde nenhuma busca
  específica foi feita, a célula diz **não medido**. Isso fica fora das quatro
  classes de propósito: sem busca, não se afirma ausência (R-AUSENCIA).
- **Gravidade:**
  - **crítica:** pode levar a conduta errada sem aviso, ou perder o registro de uma administração;
  - **alta:** requisito de segurança ou de rastreabilidade não cumprido;
  - **média:** requisito funcional divergente;
  - **baixa:** documentação ou forma.
- **Evidência:** arquivo:linha, função ou `testID`, e como foi medido.
- **Instrumento:** `git grep -P`, porque `git grep -E` não tem `\s`/`\b`.
  - Em zsh, caminhos passados por variável não se separam em palavras. Nesta rodada isso produziu zeros falsos. Eles foram **descartados** e as buscas refeitas em bash.
  - **Controle T:** a palavra `Trombólise` em `avc/` + `components/avc/` dá 21 ocorrências com caixa exata e 194 sem distinção de caixa. Toda busca negativa com dois caminhos abaixo usou o mesmo instrumento.
  - *"Fora de comentário"* significa que as linhas iniciadas por `*` ou `//` foram excluídas.

---

## 1. Achados ordenados por gravidade

| # | gravidade | achado | classe | evidência resumida |
|---|---|---|---|---|
| AC-01 | **crítica** · ✅ **fechado em `ec8f107`** (2026-09-13) | NIHSS obriga item não testável a virar número | contradiz a spec (RQ-T03-02, A06, p.11 *"Não avaliado ≠ ausente"*) | §2.1 abaixo; fechamento e achados a jusante em §7 |
| AC-02 | **crítica** | O atendimento não sobrevive a recarregar: fatos, inclusive trombólise registrada, se perdem | ausente (RQ-PER-01, A13) | `e2e/avc-abertura.spec.ts:189-192`: *"O módulo AVC não persiste o atendimento através de um recarregamento: `useState(() => abrirAtendimento(relogio))` cria um atendimento novo a cada montagem"* |
| AC-03 | **crítica** · ✅ **fechado em `2e28bd8`** (2026-09-13) | Pediátrica, gestante e puérpera não são identificadas antes da regra adulta. A tela F mostra dose derivada do peso sem essa identificação | ausente (RQ-POP-01, [CORREÇÃO 12/09]) | Busca `pediátric\|criança\|gestant\|gravidez\|grávida\|puerp\|menor de 18` em `avc/` + `components/avc/`: 2 ocorrências, **nenhuma fora de comentário** (controle T). Dose exibida em `components/avc/superficie-f.tsx:777` (`dose.totalMg`) |
| AC-04 | alta | Errata *Stroke* 2026;57(8):e461–e467 inacessível; **nenhum slot AHA/ASA 2026 foi conferido contra ela** | — | §4 |
| AC-05 | alta | Quatro interpretações clínicas estão aplicadas no código **aguardando confirmação do autor** | sem registro humano | `auditoria/DIVIDAS-CONHECIDAS.md`, D-139, seção *"INTERPRETAÇÕES QUE O AUTOR PRECISA CONFIRMAR"* (itens 1–4); §5.3 |
| AC-06 | alta | Dose do trombolítico arredondada para mg inteiro: decisão do autor registrada **só na mensagem de commit** | sem fonte · sem registro humano formal | `6f230f1`; `avc/nucleo/derivacoes-f.ts:238` `Math.min(Math.round(pesoKg * d.mgPorKg), d.maximoMg)`. O commit diz: *"a Table 7 dá mg/kg e o teto, e não define arredondamento"* |
| AC-07 | alta | Nenhuma proteção contra toque repetido ao abrir ação clínica, e nenhum teste | ausente (RQ-T06-03, A17) | `components/avc/avc-modulo-screen.tsx:2176`: `onNovaAcao` chama `proximaInstancia` a cada toque. Busca `debounce\|throttle\|emAndamento\|jaTocado\|idempot\|duplo\|clique repetido` em `components/avc/` + `avc/nucleo/`: só achou a semântica do portão (`portao-ivt.ts:369-378`) e `scrollEventThrottle`. Controle: `onPress` = 143 em `components/avc/` |
| AC-08 | alta | A dose do trombolítico é recalculada do peso **atual**; não existe evento de dose histórica | ausente (RQ-T06-04) | `derivacoes-f.ts:238` → `superficie-f.tsx:777`. Busca `dose_registrada\|doseRegistrada\|dose_administrada\|peso_na_hora\|pesoNoMomento` em `avc/`: 0; controle `totalMg` = 3. **Não medido:** se a dose muda na tela depois de uma administração registrada e de uma correção de peso |
| AC-09 | alta | Decisão não é registrada; por contrato interno, nenhuma saída do núcleo é persistida | contradiz a spec (RQ-DAD-04, A14, p.11) | `auditoria/PLANO-CORRECAO-AVC-CRITICOS.md` §12 item 8: *"Nenhuma saída do núcleo é persistida"*; `avc/nucleo/derivacoes.ts:6`: *"derivado nunca é persistido como verdade clínica"*; AVC-14 e E-24 adiados (D-139) |
| AC-10 | alta | *"Preciso de ajuda"* e *"Paciente piorou"* não existem | ausente (RQ-T02-04, RQ-T02-05, RQ-FAL-02, A11) | Busca `Preciso de ajuda\|Paciente piorou\|piorou` em `avc/` + `components/avc/` + `lib/i18n/modules/avc-modulo.ts`: 0 (controle T) |
| AC-11 | alta | Não há ciclo de transferência nem ator de telestroke | ausente (RQ-T07-02, RQ-TEL-01, RQ-DAD-09, A12) | `transferencia` em `avc/`: 1 ocorrência, o campo `transferencia_possivel` (Sim/Não/Incerto), em `avc/conteudo/superficie-g.ts:496`. `telestroke\|telemedic\|teleavc\|tele-avc\|teleconsult`: 0 (controle T) |
| AC-12 | alta | Angioedema não existe; F-35b (contraste) está transcrito mas não chega a nenhuma superfície | ausente / parcial (RQ-T06-05, RQ-REG-COMP-ANGIO, RQ-REG-COMP-CONTRASTE) | `angioedema` em `avc/` + `components/avc/`: 0. `F35B_CONTRASTE\|F-35b`: 4 ocorrências, **todas** em `avc/conteudo/fontes.ts` (67, 206, 224, 227) |
| AC-13 | média | Ciclo de vida da ação com 4 estados; o PDF pede 8 | parcial (RQ-T06-01) | `ESTADO_DA_ACAO` em `avc/conteudo/superficie-e.ts:72-79`: iniciada, realizada, interrompida, cancelada (D2, `77f56da`). `prescrit`: 0; `preparad`: 0 |
| AC-14 | média | Temperatura removida do caminho isquêmico | divergência (RQ-T01-03) | `b170b44`; `e2e/avc-cockpit-abcde.spec.ts:235` afirma `avc-num-caixa-temperatura` com contagem 0 |
| AC-15 | média | Retenção por suspeita de HSA e reconciliação de marcos incompatíveis: decisões clínicas sem fonte | registro humano com data, sem nome e sem versão | `588ee06` → `auditoria/ESPECIFICACAO-AVC.md` §1.8 item 4 (*"a fonte transcrita não tem item sobre HSA clínica"*); `5e6892e` → §1.1 |
| AC-16 | média | Nenhuma chamada nem retorno entre módulos; intubação e sedação ausentes | ausente (RQ-ORQ-01..04, RQ-T03-04, A09) | `encounterId\|pontoDeRetorno\|origemDoRetorno\|pilha de`: nenhuma ocorrência fora de comentário. `intuba\|sedaç\|sedad` em `avc/` + `components/avc/`: 0 (controle T) |
| AC-17 | média | O texto em português é a chave de tradução | contradiz a spec (RQ-I18N-01) | `tr(pt, locale)` (inventário §i18n); D-PEND-05 aberta |
| AC-18 | média | A imagem tem 2 das 3 saídas pedidas | parcial (RQ-T04-03) | `avc/nucleo/derivacoes-c.ts:527`: saídas `suspeita_hsa` e `hemorragia_intracraniana`; sem *isquemia provável* e sem *dúvida/outra hipótese* |
| AC-19 | média | Comorbidades sem cinco itens da lista do PDF | parcial (RQ-T01-05) | `avc/conteudo/paciente.ts:628-662` (lista lida inteira) comparado a `docs/spec-avc.md:264`: faltam hemorragia prévia, doença hepática, epilepsia, câncer e coagulopatia |
| AC-20 | média | Paciente avaliado só por RM fica com a classe da reperfusão retida | limitação declarada (A07) | AVC-16 em D-139: `CAPACIDADES_DA_MODALIDADE` dá resultado de hemorragia só à TC |
| AC-21 | média | Não existe cálculo de volume por concentração | ausente (RQ-T06-02, A16) | `concentra` em `avc/` só aparece na classificação de unidade (`avc/nucleo/unidade-clinica.ts`). Títulos de teste com `concentra\|volume`: 0 em 313 e2e e 558 conferências indexadas |
| AC-22 | média | Datas sem fuso explícito | parcial (RQ-T01-02, RQ-DAD-06) | `fuso\|timezone\|getTimezoneOffset\|toISOString`: 3 ocorrências, e a única fora de comentário diz que a síntese *"não inventa fuso"* (`avc/nucleo/sintese-do-caso.ts:176`) |
| AC-23 | baixa | 48 literais com mais de 200 caracteres em `avc/conteudo`; não há trava | ausente (RQ-INT-01) | Medição em node: 25 arquivos `.ts`, comentários removidos; controle >50 caracteres = 543. **Não classificado** quais desses são texto de tela (ex.: `conferencia.ts` guarda proveniência) |
| AC-24 | baixa | Três classificações erradas na minha própria `matriz-requisitos.md`, Parte B | documento | RQ-T01-04 dizia "NÃO RESOLVE", mas a PAM existe e tem prova. RQ-T02-03 dizia "NÃO MEDIDO", mas há e2e. RQ-DAD-03 dizia "JÁ RESOLVE", mas o fato não tem autor. Correção pendente |
| AC-25 | baixa | RQ-PER-03 ainda diz *"detectar e conciliar"*; D-PEND-03 decidiu **detectar e bloquear** | documento | `docs/avc/matriz-requisitos.md:130` × `docs/decisoes.md` D-PEND-03 |

---

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

## 4. Errata · Prabhakaran S et al., *Stroke* 2026;57(8):e461–e467, doi 10.1161/STR.0000000000000530

**Resultado: inacessível. Nenhuma correção pôde ser listada e nenhum slot foi comparado.**

| # | via | resultado |
|---|---|---|
| E1 | Spotlight local, por DOI e título | só o PDF do autor `AVC_Isquemico_Hemorragico_2026_V7_1_REVISAO_FINAL.pdf` cita a errata. Controle: DOI …0513 achado em 12 arquivos |
| E2 | Crossref | tipo *Correction*; atualiza 10.1161/str.0000000000000513; 2026-07-27; sem licença; sem resumo |
| E3 | Unpaywall | `is_oa: false` |
| E4 | PMC idconv | não encontrado |
| E5 | doi.org → ahajournals.org | HTTP 403. Nenhuma tentativa de contornar (regra do autor) |
| E6 | Europe PMC REST | 1 resultado, PMID 42507797; texto completo só pelo DOI; resumo vazio. Controle: …0513 com `hitCount` 1 |
| E7 | PubMed esearch (repetido) | JSON válido; 35 resultados para o título, incluindo 42507797 |
| E8 | PDF do autor V7_1, texto extraído | cita a errata só como referência [9]; `errata` 0; `e461` 1 (a própria referência). Controle: `AVC` 231. **Não traz o conteúdo das correções** |
| E9 | PubMed efetch 42507797 | registro *Published Erratum*, *"Erratum for Stroke. 2026 Aug;57(8):e316-e436"*; sem texto de resumo |

**Achado AC-04 (alta):** todos os slots `transcrito` cujo arquivo é a diretriz
AHA/ASA 2026 (constante `AHA` em `avc/conteudo/fontes.ts`) seguem **não
conferidos** contra uma correção publicada de 7 páginas. Para continuar, alguém
com acesso institucional precisa colocar o PDF da errata no repositório.

---

## 5. Os 26 commits de 12/09 (`2cc88de..52aa4e2`) · qual spec seguiram e onde divergem do PDF

### 5.1 · Spec seguida

O PDF v1.1 chegou em 2026-09-13, **depois** desses commits. Os corpos dos commits
não o citam: `v1.1\|atendimento guiado\|spec-avc.md` = 0. Controle:
`PLANO-CORRECAO` = 14.

| grupo | commits | contrato seguido |
|---|---|---|
| Correção dos críticos | `2cc88de`, `230b0ac`, `e643547`, `37a37f4`, `d90aeb5`, `6045a15`, `058ae0b`, `8cce85d`, `397bca3`, `77f56da`, `3e94b1f`, `55554d1`, `26bd9da`, `3566d47` | `auditoria/PLANO-CORRECAO-AVC-CRITICOS.md` (§13, *"plano aprovado"*, 2026-09-12); `auditoria/ESPECIFICACAO-AVC.md` V1 (emenda §2.3, D2); `auditoria/CONSOLIDACAO-CLINICA-AVC.md` (emenda D1 no Bloco 4) |
| Red-team pós-correção | `012f7ee` (C40), `995fa56` (O6b), `5e6892e` (O4), `588ee06` (O3) | Mesma especificação, com emendas §1.1 (O4) e §1.8 item 4 (O3) |
| Revisão visual do autor | `5bef7c4`, `4e48b5c`, `6f230f1`, `b170b44`, `4d1a896`, `a3c0c33`, `237e074`, `52aa4e2` | Frases do autor citadas nas mensagens de commit |

### 5.2 · Divergências em relação ao PDF v1.1

| gravidade | commit | PDF v1.1 | o que o commit fez |
|---|---|---|---|
| alta | `77f56da` (D2) | *"Separar indicado, decidido, prescrito, preparado, iniciado, administrado/concluído, interrompido e cancelado"* (`docs/spec-avc.md:357`) | fixou 4 estados (AC-13) |
| alta | `6f230f1` | *"Não invente dose"*; toda regra com validação humana registrada | arredondamento inteiro sem fonte (AC-06) |
| média | `b170b44` | temperatura entre as observações de chegada (RQ-T01-03) | removeu o eixo E e a temperatura do isquêmico (AC-14) |
| média | `588ee06` (O3) | hemorragia com caminho próprio; decisão com fonte | retenção por suspeita clínica de HSA sem fonte (AC-15) |
| média | `4e48b5c` | *"Preciso de ajuda"* e apoio (p.10) | removeu o registro solto de consultas especializadas; a especialidade continua só ao lado do item da Table 8 |
| baixa | `237e074`, `52aa4e2` | p.26: voláteis exibidos com horário e origem | a medida anterior fica atrás de "Ver histórico" (D-134, dívida declarada no commit) |
| baixa | `4d1a896` | ficha de execução (o que, quanto, via, tempo, reavaliar) | retirou o bloco "O que fazer agora"; agentes e doses continuam no bloco de tratamento (`e2e/avc-estabilizacao-composicao.spec.ts:304`). Nenhuma divergência medida além da mudança de lugar |

### 5.3 · Decisões clínicas sem fonte ou sem registro humano

A regra do projeto exige **nome, versão e data** para registro humano. Nenhuma das
decisões abaixo tem versão.

| decisão | commit / documento | fonte | registro humano |
|---|---|---|---|
| Dose do trombolítico em mg inteiro | `6f230f1` | nenhuma; o commit diz que a fonte não define arredondamento | **só a mensagem de commit** (frase do autor, 2026-09-12); fora de `docs/decisoes.md` e da especificação |
| Remover eixo E e temperatura | `b170b44` | nenhuma fonte transcrita dá corte (commit) | só a mensagem de commit |
| Remover o registro de consultas especializadas | `4e48b5c` | Table 8 (a especialidade fica no item) | só a mensagem de commit |
| Suspeita de HSA retém a execução de IVT e EVT | `588ee06` | *"a fonte transcrita não tem item sobre HSA clínica"* | emenda §1.8 item 4, com data |
| Marcos incompatíveis → reconciliação, sem escolha | `5e6892e` | a fonte dá disjunção; a escolha é do autor | emenda §1.1, com data |
| HR-1..HR-5, `ivt_rapidez`, `planejada`, AVC-18, heparina | PLANO §13 | parte com fonte | PLANO §13, *"decisões do autor incorporadas (2026-09-12)"* |
| **Interpretações 1–4 de D-139** | `397bca3`, `3566d47` | interpretação; o item 2 mapeia *"coagulation test results"* para INR, PT ou aPTT | **nenhum**: o próprio documento diz *"o autor precisa confirmar"* (AC-05) |
| RM sem resultado de hemorragia | D-139, AVC-16 | *"EVIDÊNCIA INSUFICIENTE"* | limitação declarada, sem decisão |

---

## 6. O que não foi verificado

- O conteúdo da errata (§4).
- O instrumento oficial do NIHSS (§2.1).
- As telas, que não foram vistas; nenhuma revisão visual foi feita.
- Os corpos de `e2e/avc-criticos.spec.ts:99` e `e2e/avc-controle-de-data.spec.ts:130`, citados só como apoio: a cobertura de A07 e A03 se apoia nas provas lidas.
- Se a dose exibida muda depois de uma administração registrada e de uma correção de peso (AC-08).
- As duas ocorrências em comentário da busca de populações (AC-03).
- Os itens marcados **não medido**: RQ-I18N-02, RQ-I18N-04, RQ-REG-48H.
- A dose do anticoagulante (RQ-T01-06).
- *"Não sei → perguntas menores"* (RQ-T02-01).

---

## 7. Fechamentos de 2026-09-13 · AC-01 e AC-03

### 7.1 · AC-01 — NIHSS "não testável" · commit `ec8f107`

- **Fonte:** `protocols/fontes-verbatim/nih-nihss-2024.md`, transcrita item a item do PDF oficial do NINDS (fev. 2024, sha256 `4d698c25…a676aef`), fornecido pelo autor.
- **Decisão do autor, não da fonte:** o UN não entra na soma, e o total é dito "X, com N itens não testáveis".

| prova | antes (código de `52aa4e2`) | depois |
|---|---|---|
| `scripts/prova-avc-nihss-nao-testavel.cjs` | 🔴 3 verdes · 32 vermelhos; entre eles *"nihssCalculado = 14 — o critério de trombectomia (NIHSS ≥ 6) leria este número como escore completo"* | ✅ 23/23 |
| `e2e/avc-nihss-nao-testavel.spec.ts` | 🔴 5/5 vermelhos; a tela recebeu *"Grave/intubado2"* | ✅ 5/5 |
| regressões da escala: B, outros, cartão, cenários, fase 9, críticos | — | ✅ 62 verdes |

Arquivos alterados:
- `avc/conteudo/nihss.ts`
- `lib/nihss.ts`
- `components/avc/campo-de-escala.tsx`
- `avc/nucleo/derivacoes-b.ts`
- `avc/nucleo/sintese-do-caso.ts`
- `components/avc/superficie-b.tsx`
- `components/avc/avc-modulo-screen.tsx`
- `clinical-calculators-engine.ts` (rótulo do item 10)
- dicionários ES

⚠️ **Fora do conjunto mínimo pedido:**
- **Motor da calculadora:** o rótulo errado do item 10 mora nele.
- **`derivacoes-b.ts`:** sem ele, a regra continuaria recebendo a soma como total.

### 7.2 · Regras a jusante que consomem o NIHSS

Reavaliadas por leitura e busca. **Nenhum limiar foi alterado.**

| # | gravidade | achado | evidência |
|---|---|---|---|
| AC-26 | alta · **decisão do autor pendente** | Com item UN, `nihssCalculado` devolve `undefined`. As 9 recomendações de trombectomia que exigem NIHSS ficam **sem o critério**, e só um NIHSS "informado por fora" as alcança. Falta decidir se uma soma com UN pode satisfazer um piso (≥ 6, ≥ 10); para teto (6–9, 0–5) ela não prova nada. | `avc/conteudo/superficie-f.ts` (as 9 recomendações: `evt_ant_1`…`evt_ant_6`, `evt_m2_dominante`, `evt_basilar_1`, `evt_basilar_2`); `avc/nucleo/derivacoes-f.ts:389-391`, `:540-542`, `:748` |
| AC-27 | alta · histórico | **Antes de `ec8f107`**, um caso com UN real rodava com total inflado ou desviado, sem aviso (detalhe abaixo da tabela). ⛔ Não há como saber se isso ocorreu em uso: o atendimento não persiste (AC-02). | `clinical-calculators-engine.ts:734` antes da correção; `avc/nucleo/derivacoes-b.ts` (`achadoDerivado`, `lateralidadeDerivada`, `contextoDaTable4`) |
| AC-28 | média | O "NIHSS informado por fora" aceita um total sem dizer se houve UN. É uma rota pela qual uma soma com UN entra como escore completo. | `nihssInformado` em `derivacoes-b.ts`; consumido junto com `nihssCalculado` em `derivacoes-f.ts:390` |
| AC-29 | média | A calculadora clínica avulsa continua sem opção UN. A nota dela manda não pontuar, mas a tela exige escolher um número. Fora desta rodada. | `clinical-calculators-engine.ts:754` |
| AC-30 | baixa · não medido | A síntese monta "NIHSS X, com N itens não testáveis" em português; a tradução dessa frase composta no espanhol não foi medida. | `avc/nucleo/sintese-do-caso.ts` |

Detalhe de AC-27, os dois caminhos de inflação antes da correção:
- **Intubação:** o item 10 pontuava 2. Isso afetava os critérios de trombectomia (≥ 6, ≥ 10, 6–9) e o contexto da Table 4 (0–5).
- **Amputação ou fusão articular:** o membro tinha de receber 0–4. Os achados `t4_fraqueza_contra_gravidade` (corte ≥ 2) e a lateralidade podiam derivar de um membro não testável.

**Medido sem efeito:**
- **IVT:** nenhuma recomendação exige `nihss`; a busca por `exige:` com `"nihss"` em `superficie-f.ts` só retorna recomendações `evt_*`.
- **Déficit incapacitante:** continua juízo do médico (`incapacitante_assumido`).

### 7.3 · AC-03 — portão de população · commit `2e28bd8`

- **Fonte:** `protocols/fontes-verbatim/escopo-populacional-avc.md` (slot F-37).
- **Escolhas do autor em 2026-09-13:**
  - o portão retém protocolo e dose, e a Estabilização continua aberta;
  - "não sei" na gestação pergunta de novo, como na idade.

| prova | antes (código de `ec8f107`, sem AC-03) | depois |
|---|---|---|
| `scripts/prova-avc-populacao.cjs` | 🔴 0 verdes · 17 vermelhos | ✅ 16/16 |
| `e2e/avc-portao-populacao.spec.ts` | 🔴 7 vermelhos; o controle da Estabilização já passava | ✅ 8/8 |

⚠️ No primeiro `test:all` da árvore, 6 testes do spec novo falharam **por instrumento**:
- **O erro:** o spec contava `avc-superficie-reperfusao`, que é a moldura da superfície e **contém** o próprio portão.
- **A correção:** a contagem passou a ser `avc-f-raia-ivt`, com controle positivo no caso validado. O resultado foi 8/8 no mesmo `dist`.

**Efeito nos e2e existentes:**
- **Passo do portão:** `responderPopulacaoAdulta` foi inserido depois das 83 aberturas do AVC e dentro de `abrirModulo("avc")`.
- **Prova do Paciente:** `prova-avc-paciente` passou a conferir seis blocos, com a população primeiro.

**Resíduos de AC-03:**
- **Idade numérica sem cruzamento:** o campo numérico `idade` (faixa 18–110) e a pergunta categórica `faixa_etaria` não são cruzados. Se forem contraditórios, a conclusão é conservadora (fora do escopo). Isso não foi testado.
- **Puerpério sem duração:** a duração do puerpério não é definida pelo app; é resposta do médico.

### 7.4 · Suíte e envio

| item | resultado |
|---|---|
| `test:all` no HEAD `2e28bd8` (árvore limpa, 0 rastreados modificados) | **EXIT=0**, das 07:38:42 às 07:49:22 · 128 scripts npm · Playwright *"Running 500 tests"* → **500 passed · 0 failed · 0 skipped · 0 flaky** · pipeline: 119 travas ligadas |
| artefatos reescritos pela suíte | `auditoria/INDICE-DE-TRAVAS.md` e `auditoria/INVENTARIO-AFIRMACOES-AVC.json`, revertidos (D-PEND-10) |
| push | `52aa4e2..2e28bd8` → `origin/refactor/clinical-modules-rebuild`; `git ls-remote` = `2e28bd899ffac0e3166e7db2f0882fcab2c99eba`; divergência 0/0 |

### 7.5 · Entrega 1 · AC-29, D-PEND-13 (AC-26) e D-PEND-14 (AC-28) · commit `207e4be`

Decisões do autor registradas em `docs/decisoes.md`, com data de 2026-09-13.

| # | estado | como foi fechado |
|---|---|---|
| AC-26 | ✅ fechado em `207e4be` | D-PEND-13 em `avc/nucleo/derivacoes-f.ts`: com item UN, a soma é limite inferior. Satisfaz piso quando parcial ≥ k; abaixo, `inconclusivo`, que aparece como "NIHSS inconclusivo por item não testável" no veredito da EVT e em cada recomendação; teto nunca é satisfeito. Nenhum limiar mudou. |
| AC-28 | ✅ fechado em `207e4be` | D-PEND-14: regras, "onde resolver" e reavaliação pós-glicemia deixam de ler `nihss_informado`. A pergunta `nihss_informado_nao_testaveis` foi criada; a peça NIHSS mostra o escore externo só com "Não, escala completa"; a síntese diz "NIHSS de outro serviço X". |
| AC-29 | ✅ fechado em `207e4be` | A regra UN passou a morar em `lib/nihss.ts`, sem cópia: `avc/conteudo/nihss.ts` só reexporta. A calculadora avulsa usa a mesma regra, com justificativa e total "X, com N itens não testáveis", sem faixa de gravidade para soma com UN. |

**Vermelho → verde:**

| prova | antes (código de `2e28bd8`) | depois |
|---|---|---|
| `scripts/prova-avc-nihss-criterios.cjs` | 🔴 9 · 27, entre elas *"NIHSS de fora 14 → satisfaz"* e *"NIHSS de fora registrado depois da correção → reavaliado"* | ✅ 30/30 |
| `e2e/calculadora-nihss-nao-testavel.spec.ts` | 🔴 3/3 | ✅ 3/3 |
| `e2e/avc-nihss-externo.spec.ts` | 🔴 3/3; a peça mostrava *"NIHSS140–42"* | ✅ 3/3 |
| e2e relacionados: fase 9, críticos, fluxos, superfície F, B, cenários, NIHSS UN | — | ✅ 84 verdes |

⚠️ **Falha de instrumento corrigida:** um teste esperava ler a peça NIHSS vazia, mas sem sinais com valor a peça nem é desenhada. A asserção passou a ser uma contagem, com controle positivo no teste seguinte.

⚠️ **Fixtures reescritas pela D-PEND-14:** estas fixtures alcançavam a EVT pelo escore de fora e passaram a usar a escala deste atendimento, com as mesmas somas.
- `prova-avc-fase9-evt.cjs`
- `prova-avc-criticos.cjs`
- e2e da fase 9, críticos, fluxos e superfície F

Três âncoras de mutação foram reescritas contra o código novo, com a mesma semântica.

**Achados novos:**

| # | gravidade | achado | evidência |
|---|---|---|---|
| AC-31 | média · anterior à rodada | Na calculadora avulsa, um item não tocado vale a primeira opção (0). "Não medido" vira ponto sem aviso. A regra UN foi acrescentada sem mexer nisso. | `components/protocol-screen/clinical-calculators-screen.tsx`, `ScoreView`: `scores[...] ?? v.options[0].points` |
| AC-32 | baixa · **confirmar com o autor** | Na faixa 6–9, uma soma com UN acima de 9 dá "contradiz". É consequência aritmética do limite inferior, aplicada por mim; a D-PEND-13 só diz que o teto nunca é satisfeito. | `derivacoes-f.ts`, bloco D-PEND-13; prova *"6–9 com UN: parcial 10 → contradiz"* |
| AC-33 | média | O contexto da Table 4 (NIHSS 0–5, teto) com UN continua "não estabelecido". A D-PEND-13 não foi aplicada aqui porque a instrução pedia os critérios de trombectomia. | `derivacoes-b.ts`, `contextoDaTable4` |
| AC-34 | baixa · não medido | As frases compostas da síntese ("NIHSS de outro serviço X", "X, com N itens não testáveis") não tiveram a tradução ES conferida na tela. | `avc/nucleo/sintese-do-caso.ts` |
| AC-35 | baixa | Os helpers `nihssDeFora`, `baixarNihss` e `abrirNihssDeFora` ficaram sem uso no e2e da fase 9. | `e2e/avc-fase9-trombectomia.spec.ts` |

**Suíte e envio da Entrega 1:**

| item | resultado |
|---|---|
| commit de `docs/` | `773ed92` — "docs: especificação, matrizes, auditoria e status do AVC" |
| 1º `test:all` (HEAD `773ed92`) | 🔴 parou no passo 31: `test:avc-independencia` (fixture C.3 usava NIHSS de outro serviço como reexame) → corrigida em `9a0ecea` |
| 2º `test:all` (HEAD `9a0ecea`) | 🔴 504 verdes · **2 vermelhos**: dois e2e faziam o resumo aparecer com NIHSS de outro serviço → passam a responder "Não, escala completa" em `8e07c30` |
| 3º `test:all` (HEAD `8e07c30`, árvore limpa) | ✅ **EXIT=0** · 129 scripts npm · Playwright **506 passed · 0 failed · 0 skipped** · mutações 84/84 · 120 travas ligadas |
| artefatos da suíte | `INDICE-DE-TRAVAS.md` e `INVENTARIO-AFIRMACOES-AVC.json`, revertidos (D-PEND-10) |
| push | `2e28bd8..8e07c30` → `origin/refactor/clinical-modules-rebuild`; `git ls-remote` = `8e07c30812d25be096e87cd4a06c6b40b324db73`; divergência 0/0 |

⚠️ As três correções de fixture (`9a0ecea`, `8e07c30`) são consequência direta da D-PEND-14. ⛔ Nenhuma afrouxou o que o teste mede.

### 7.6 · Entrega 2 · AC-02 persistência local-first (D-PEND-02, D-PEND-03) · commit `fa01339`

**O que entrou:**
- log de eventos append-only em IndexedDB (`avc-atendimento`, schema v2), atrás de uma interface de armazenamento;
- recuperação do caso mais recente não encerrado;
- horário observado e registrado em cada evento de fato;
- conclusões versionadas, e correção com autor;
- trava por caso: segunda aba do mesmo caso fica bloqueada;
- migração v1→v2.

Sem sincronização com servidor. Limites em `docs/avc/persistencia.md`.

**Quem atribui a ordem (`seq`):**
- Na primeira implementação (nunca commitada), era o **produtor**: `log.ts` gravava `seq: ctx.proximoSeq()`, e o hook fornecia `proximoSeq: () => ++seq.current`. Os armazenamentos só ordenavam.
- Para passar a conferência *"valor anterior continua na trilha"*, a prova tinha sido ajustada na ordem dos eventos. O autor recusou: A13 e A14 dependem da ordem de **gravação**.
- **Corrigido no módulo** antes do commit:
  - `NovoEvento = Omit<EventoDoAtendimento, "seq">`, e o produtor não tem mais `seq`;
  - `anexarEventos` numera dentro de **uma** transação readwrite (maior `seq` do caso pelo índice `[casoId, seq]`, depois `++seq` na ordem de entrada);
  - a memória faz o mesmo.
- O ajuste da prova foi revertido. Entraram três conferências de ordem: evento produzido sem `seq`; `seq` 1, 2, 3 na ordem de gravação; a reconstrução segue a gravação mesmo com a correção **produzida antes** dos eventos que ela corrige.
- Vermelho antes da correção: 26 verdes · 7 vermelhos. Depois: ✅ 40/40.

**Provas verdes:**

| exigência | prova de módulo (`scripts/prova-avc-persistencia.cjs`) | gesto real (`e2e/avc-persistencia.spec.ts`) |
|---|---|---|
| A13 fechar/reabrir | estado reconstruído com fatos idênticos (`JSON.stringify`), mais relógios, eixos, superfície, exposição ao trombolítico e 1 administração; recupera o caso não encerrado | `:37` A13 |
| A17 toque duplo | `abrirNovaInstancia` duas vezes devolve o mesmo estado, com 1 instância de trombólise; 1 evento com ID | `:63` A17 |
| A14 nova versão da conclusão | 2 versões, `pergunta_pendente` → `adulto_validado`, IDs distintos, anterior preservada | — |
| correção versionada | evento de correção com `autor`, `motivo` e `corrigeFatoId`; o valor anterior continua na trilha | lab `avc-superficie-laboratorio.spec.ts:99` |
| trava da segunda aba | 1ª adquire, 2ª recusada, liberada volta a abrir; aviso "outra aba" | `:84` D-PEND-03 |
| migração v1→v2 | `VERSAO_DO_SCHEMA === 2`; eventos migrados com versão e autor; `dados` intactos; dump v1 recuperado (peso 70) | `:95` schema v1 → v2 |

**Correção sem motivo na tela:**
- Em `8e07c30`, **nenhuma** tela mostrava motivo de correção (`git grep` = 0).
- Agora, "Corrigir resultado" no Laboratório e na Imagem mostra a linha `avc-correcao-<campo>`: *"corrigido de 1,4 · sem motivo informado"*, ou *"· motivo: X"*.
- O histórico da A mostra o mesmo, via `motivoDaCorrecao`.
- e2e: `avc-superficie-laboratorio.spec.ts:99`. Prova de módulo: `correcaoNaInstancia` (nunca corrigido → sem linha; sem motivo → `null`; com motivo → o texto, mais o valor substituído).

#### Achado clínico fechado pela D-PEND-14

| # | gravidade | achado | evidência |
|---|---|---|---|
| AC-36 | **alta · clínico · fechado** | O app aceitava **NIHSS de outro serviço como exame deste atendimento**. O escore de fora alimentava o critério de trombectomia e contava como **reexame** na reavaliação. Três testes antigos só passavam por isso: usavam o escore de fora como basal ou reexame. | Em `2e28bd8`: `derivacoes-f.ts:390` e `:541` (`nihssCalculado(estado) ?? nihssInformado(estado)`); `derivacoes.ts:301` e `:341` (`nihss_informado` como reexame e insumo); `apresentacao-f.ts:309` (`nihss: ["nihss_calculado", "nihss_informado"]`). **Fechado pela D-PEND-14 em `207e4be`**. Fixtures corrigidas em `207e4be`, `9a0ecea` (`prova-avc-independencia` C.3) e `8e07c30` (dois e2e de resumo). |

#### Achados novos da Entrega 2

| # | gravidade | achado | evidência |
|---|---|---|---|
| AC-37 | alta · **fechado antes do push** | `seq` atribuído pelo produtor, não pela gravação. A reconstrução dependia da ordem em que o código produzia, e não da ordem em que o log gravou. | acima; `fa01339` |
| AC-38 | média · **confirmar com o autor** | Correção **sem motivo** continua aceita (decisão do autor de 2026-08-30). O pedido da Entrega 2 dizia "correção com autor e motivo". Hoje o motivo ausente é gravado como ausente e dito na tela; nenhum gesto da tela pede motivo. | `avc/nucleo/estado.ts` `corrigirFato`; `components/avc/avc-modulo-screen.tsx` `corrigirNaInstanciaDaTela` |
| AC-39 | alta · antes de dado real | O app **nativo não persiste**: `armazenamento.native.ts` usa memória, e fechar o app perde o caso. Só o web usa IndexedDB. | `avc/persistencia/armazenamento.native.ts` |
| AC-40 | média | O autor é um identificador **local do aparelho** (`local:<uuid>`), não uma identidade autenticada. | `components/avc/use-atendimento-persistido.ts` `autorLocal` |
| AC-41 | baixa · instrumento | O e2e *"corrigir NÃO cria uma terceira medida"* da A **não corrige**: digitar sobre o valor é nova escrita na mesma instância (`registrarComInstancia`). A superfície A **não tem** gesto "Corrigir". A asserção "sem motivo informado" foi posta ali, ficou vermelha pelo motivo certo e foi **retirada**; a prova foi para o gesto real no Laboratório. | `e2e/avc-historico-de-afericoes.spec.ts:89` |
| AC-42 | baixa · instrumento | `dblclick` do Playwright **não reproduziu** o defeito A17 no código antigo. A prova usa dois cliques. | `e2e/avc-persistencia.spec.ts:63` |

**Suíte e envio da Entrega 2:**

| item | resultado |
|---|---|
| commits | `fa01339` (código e provas) · `5c41455` (docs) · `fc81900` (prova lê fonte sem comentário) |
| 1º `test:all` (HEAD `5c41455`) | 🔴 EXIT=1 · parou em `test:leitura-fonte`: `prova-avc-persistencia.cjs` lia `.tsx` cru com `fs.readFileSync`, então a busca por "sem motivo informado" podia ser satisfeita por um comentário → passou a usar `lerFonte` em `fc81900` |
| 2º `test:all` (HEAD `fc81900`, árvore limpa, mesmo HEAD no início e no fim) | ✅ **EXIT=0** · 130 scripts npm · Playwright **510 passed** (7.8 min), sem failed ou skipped · persistência 40/40 · mutações 84/84 · 121 travas ligadas · 65 instrumentos no censo |
| artefatos da suíte | `INDICE-DE-TRAVAS.md` e `INVENTARIO-AFIRMACOES-AVC.json` revertidos (D-PEND-10) |
| push | `8e07c30..fc81900` → `origin/refactor/clinical-modules-rebuild`; `git ls-remote` = `fc819003ff61de8d313d3a0c9b8fe96a483a521b`; divergência 0/0 |

⚠️ Esta tabela e a atualização correspondente de `docs/status.md` ficaram **fora de commit**: commitá-las criaria um HEAD sem `test:all`.

### 7.7 · Decisões do autor de 2026-09-13 (3ª rodada)

| # | estado | decisão |
|---|---|---|
| AC-38 | ✅ **fechado** pela D-PEND-15 | Motivo da correção opcional, autor obrigatório, ausência visível ("sem motivo informado"); decisão de 2026-08-30 mantida. Já conforme em `fa01339`. |
| AC-32 | ✅ **confirmado** pela D-PEND-16 | Com UN, "contradiz" só quando a soma parcial excede o teto. Já conforme em `207e4be`; provas `prova-avc-nihss-criterios.cjs:120-122`. |
| — | regra de envio | **D-PEND-17:** commit só de `docs/` dispensa `test:all` quando `git diff --stat` tocar só `docs/`. |

Texto integral em `docs/decisoes.md`.

### 7.8 · 3ª rodada de 2026-09-13 · pacotes de revisão médica e correções sem decisão clínica

#### Entrega 1 · pacotes de revisão médica (sem código)

- **Onde:** `docs/avc/revisao/`, com índice em `README.md`. São nove pacotes, cada um com o campo "Decisão humana: ___" vazio.
- **Fontes primárias abertas:** PDFs locais da AHA/ASA 2026 (sha256 `7380c4f2…794ffe`) e da AHA/ASA 2023 HSA (sha256 `3e206a9d…c00c73`), lidos com `pdftotext`.
- **Limites:**
  - A Table 8 da AHA 2026 é imagem no PDF, e as frases dela vêm só da transcrição.
  - Os PDFs das bulas brasileiras não estão disponíveis.

| pacote | a fonte confirma o código? |
|---|---|
| AC-15 · HSA retém reperfusão | **não** — a fonte manda excluir hemorragia por imagem; reter pela suspeita clínica é adaptação local |
| AC-06 · dose do trombolítico | alteplase: a fonte não fala de arredondamento · tenecteplase: a fonte **contradiz** o código (AC-43) |
| AC-14 · temperatura no isquêmico | **não** — §4.4 com COR 1 no PDF (AC-44) |
| AC-13 · estados da ação | a fonte não trata disso; a divergência é spec (8) × D2 (4) |
| AC-03r · puerpério | não conferível: a Table 8 é imagem, e o app não define janela |
| D-139 · 1 juízo da coagulação | parcial |
| D-139 · 2 varfarina/heparina | ambígua |
| D-139 · 3 julgamento individual | parcial |
| D-139 · 4 déficit incapacitante | a fonte não trata disso |

#### Entrega 2 · correções sem decisão clínica · commit `c513b64` (mais `7dc42c5`)

**(a) AC-40, fechado:**
- **Autor com sessão:** o autor do evento é o `user.id` da sessão Supabase.
- **Sem sessão:** o autor é o ID do aparelho, marcado `origemDoAutor = aparelho` no evento e, na linha do tempo, "registrado neste aparelho, sem conta".
- **Sessão anônima:** marcada à parte.
- **Schema e migração:** schema v3, com migração v1/v2 → v3 sem inventar autor.

**(b) Toque duplo:**
- **Onde estava:** a proteção **não** estava só no botão da trombólise. Ela morava em `abrirNovaInstancia`, que atende os três botões de "nova instância" e nenhuma outra ação.
- **Onde está agora:** o hook do atendimento aplica `repeteOGestoAnterior` a **toda** mudança de estado.
- **Regra:** gesto que repete o imediatamente anterior, sem nada entre os dois, não vira fato nem evento.
- **Tempo:** a regra não usa janela de tempo.
- **Guarda que continua:** a de `abrirNovaInstancia` fica como está.

**(c) AC-39, documentado e não implementado:** o adaptador SQLite necessário e o que ele precisa satisfazer das 40 conferências estão em `docs/avc/persistencia.md` §4.

**Vermelho → verde:**

| prova | antes (código de `fd1af8e`) | depois |
|---|---|---|
| `scripts/prova-avc-autoria-e-toque-duplo.cjs` | 🔴 0 verdes · 13 vermelhos (módulos inexistentes; eventos sem `origemDoAutor`; schema 2; hook sem sessão) | ✅ 32/32 |
| `e2e/avc-autoria-e-toque-duplo.spec.ts` · correção do laboratório marcada | 🔴 recebeu *"corrigido de 1,4 · sem motivo informado"* | ✅ |
| e2e · histórico marcado | 🔴 recebeu *"1ª medida · 09:51Glicemia capilar: 38"* | ✅ |
| e2e · «Registrar ação» 2× | 🔴 `avc-e-acao-acao_2` com contagem 1 | ✅ |
| e2e · Glasgow «Usar» 2× antes de redesenhar | 🔴 o log tinha 2 Glasgow | ✅ |

**Consequência direta do schema v3:**
- `prova-avc-persistencia.cjs` passou a exigir versão 3 nas conferências de schema (continua 40/40).
- `e2e/avc-persistencia.spec.ts` passou a esperar o banco na versão 3.

**Achados novos:**

| # | gravidade | achado | evidência |
|---|---|---|---|
| AC-43 | **alta · clínico** | A dose da tenecteplase não segue a tabela por faixa de peso da Table 7: 70 kg → 18 mg no app, 20 mg na faixa. O comentário do código e o commit `6f230f1` dizem que a Table 7 dá "só mg/kg". **Não corrigido**: exige decisão clínica. | `avc/nucleo/derivacoes-f.ts:254`; AHA 2026 Table 7, PDF p. 43 = e358; pacote `revisao/AC-06-dose-trombolitico.md` |
| AC-44 | **alta · clínico** | O caminho isquêmico não registra temperatura, embora a §4.4 da fonte-mãe tenha recomendação COR 1. A remoção (`b170b44`) se apoiou na ausência de transcrição. **Não corrigido.** | AHA 2026 §4.4, PDF p. 37 = e352; `e2e/avc-cockpit-abcde.spec.ts:235`; pacote `revisao/AC-14-temperatura.md` |
| AC-45 | média · interface | Tocar duas vezes numa **opção já marcada** desfaz a escolha, porque a opção alterna. A regra de toque duplo não cobre isso, que é gesto de interface e não repetição. | `components/avc/campos-clinicos.tsx:501` (`ativa ? onDesfazer : onEscolher`) |
| AC-46 | média · **por leitura, a verificar** | Com varfarina registrada, INR/PT/aPTT registrados, plaquetas ausentes e juízo "não", o texto seria *"sem varfarina ou heparina registradas"*. | `avc/nucleo/derivacoes-d.ts:887`; pacote D-139-2 |
| AC-47 | alta · **por leitura, a verificar** | "Não incapacitante" com rota de janela estendida aplicável pode sair "indicada", sem teste que cubra o caso. | `avc/nucleo/veredito-da-trombolise.ts:514`; pacote D-139-4 |
| AC-48 | média · **por leitura, a verificar** | Quatro itens relativos com `informacao_insuficiente` (malformação vascular não rota, dissecção intracraniana, neoplasia ativa, punção arterial não compressível) não geram impedimento nenhum. | `avc/nucleo/derivacoes-d.ts` (laço de itens relativos); pacote D-139-3 |
| AC-49 | baixa · fonte | A transcrição registra a rec. 10 da §4.6.1 em e354; o texto extraído do PDF está em e353. O cabeçalho da transcrição ainda diz "vazio de propósito" (D-PEND-09). | `aha-asa-2026-avc-isquemico.md:1846-1850`; PDF p. 38 |
| AC-50 | baixa | Texto i18n "primeiros 10 dias pós-parto" sem consumidor no AVC e sem fonte registrada. | `lib/i18n/modules/avc-nihss-elegibilidade.ts:135` |
| AC-51 | baixa · limite declarado | A regra de toque duplo não usa janela de tempo: repetir de propósito o **mesmo** registro, sem nada entre os dois, não vira segundo fato (perde-se só o horário da repetição). | `avc/nucleo/toque-duplo.ts`; `docs/avc/persistencia.md` §2 |

**Suíte e envio:**

| item | resultado |
|---|---|
| commits | `fd1af8e` (decisões D-PEND-15/16/17, só `docs/`, D-PEND-17) · `c513b64` (código e provas) · `7dc42c5` (declaração da prova) · `commit só de `docs/` com os pacotes e a documentação` (pacotes e documentação, só `docs/`, D-PEND-17) |
| 1º `test:all` (HEAD `c513b64`) | 🔴 EXIT=1 · parou em `test:indice` depois de 123 scripts: a prova nova entrou no `test:all` sem PROMETE / NÃO PROMETE / UNIVERSO → declarada em `7dc42c5`. Tudo o que rodou antes passou (persistência 40/40, autoria e toque duplo 32/32, mutações 84/84, 122 travas, censo 65). |
| 2º `test:all` (HEAD `7dc42c5`) | ✅ **EXIT=0** · 131 scripts npm · Playwright **514 passed** (7,8 min), sem failed ou skipped · persistência 40/40 · autoria e toque duplo 32/32 · mutações 84/84 · 122 travas ligadas · índice: 110 declaradas · censo 65 instrumentos |
| artefatos da suíte | `INDICE-DE-TRAVAS.md` e `INVENTARIO-AFIRMACOES-AVC.json` revertidos (D-PEND-10) |
| push | `fc81900..7dc42c5` → `origin/refactor/clinical-modules-rebuild`; `git ls-remote` = `7dc42c5e9def3b8e218a6b3759656ba3c32ed2a6`; divergência 0/0. O commit só de `docs/` com os pacotes sobe em seguida, sem `test:all` (D-PEND-17). |

### 7.9 · 4ª rodada de 2026-09-13 · achados por leitura, decisões D-PEND-18/19/20 e pacote AC-43 ampliado

**Decisões do autor** (Sandro Dainez, 13/09/2026; `docs/decisoes.md`, commit `433bb78`):

| decisão | achado | conteúdo |
|---|---|---|
| D-PEND-18 | AC-44 | restaurar a temperatura no caminho isquêmico, transcrevendo a §4.4 (p. e352) |
| D-PEND-19 | AC-45 | segundo toque em opção já marcada é ignorado; desmarcar exige "limpar" |
| D-PEND-20 | AC-50 | apagar o texto "10 dias pós-parto", sem fonte |

**Pendentes do autor, não implementados:** AC-43 (dose), AC-15 (HSA), janela de puerpério.

#### Entrega 1 · verificar rodando o que foi visto só lendo · commit `62856f4`

**Prova:** `scripts/prova-avc-achados-por-leitura.cjs`. Antes (código de `433bb78`): 🔴 14 verdes · 8 vermelhos. Depois: ✅ 22/22.

| # | cenário | resultado antes | correção | depois |
|---|---|---|---|---|
| AC-46 | varfarina registrada; INR 1,0, TP 12, TTPa 30 registrados; plaquetas não; juízo "não" | ✅ **reproduzido**: *"Sem motivo para suspeitar; sem varfarina ou heparina registradas"* | texto passa a dizer *"varfarina ou heparina registradas, com os exames de coagulação já registrados"*; sem anticoagulante, o texto antigo continua (controle) | ✅ |
| AC-47 · cenário do autor | "não incapacitante"; última vez bem e início há 6 h; TC sem hemorragia; penumbra em perfusão automatizada "sim"; juízo "não" | ⛔ **não reproduzido**: a rota `ivt_wakeup_ou_45_9` fica `nao_avaliavel` (travada por F-31) e `nao_elegivel_a_evt` nunca é satisfeito; o veredito já saía `nao_sustentada` | nenhuma nesse cenário; a conferência fica como trava | ✅ (trava) |
| AC-47 · rota que sustenta | "não incapacitante"; RM com DWI < 1/3 e FLAIR sem alteração marcada; início "não sei"; reconhecimento há 2 h; juízo "não" | ✅ **reproduzido**: *"indicada"*, portão **liberado** | com déficit **registrado** "não incapacitante" e só rota estendida sustentando, a saída é `nao_sustentada` com *"Sem indicação neste caminho: o déficit foi registrado como não incapacitante"*; "Incapacitante" e "Incerto" ficam como estavam (controles) | ✅ portão não libera |
| AC-48 | cada um dos quatro itens de "segurança desconhecida" marcado sobre candidato completo | ✅ **reproduzido** nos quatro: nenhum aparecia entre os impedimentos | entram como **informação** (`efeito: "informa"`), sem reter; o portão fica igual ao do candidato sem o item (controle) | ✅ |

**Nenhum limiar novo.** Os arquivos alterados foram `avc/nucleo/derivacoes-d.ts`, `avc/nucleo/veredito-da-trombolise.ts` e as traduções ES.

#### Entrega 2 · D-PEND-18, D-PEND-19, D-PEND-20 · commit `f314f36`

| prova | antes (código de `433bb78`) | depois |
|---|---|---|
| `scripts/prova-avc-decisoes-d18-d20.cjs` | 🔴 0 verdes · 17 vermelhos | ✅ 20/20 (instrumento ampliado a todo desenhador de opção) |
| `e2e/avc-decisoes-d18-d20.spec.ts` · escolha: 2º toque | 🔴 `aria-checked` recebeu "false" | ✅ |
| e2e · "Sem essa informação": 2º toque | 🔴 `aria-checked` recebeu "false" | ✅ |
| e2e · temperatura na Estabilização | 🔴 `avc-num-caixa-temperatura` não encontrado | ✅ |

**D-PEND-18 · AC-44:**
- **Volta do que saiu:** o diff inverso de `b170b44` devolve o campo, o eixo E e os testes que ele tinha mudado.
- **Fonte:** o campo aponta a **F-38**, e a nota diz as três recomendações e que **não há corte**.
- **Transcrição:** a §4.4 foi transcrita verbatim do PDF local (sha256 `7380c4f2…794ffe`) em `aha-asa-2026-avc-isquemico.md`, slot **F-38**; o slot está registrado em `fontes.ts`.
- **Eixo E:** fica *medido*, nunca *ameaça*. A sinopse cita *"temperatures >37.5°C"*, mas isso não é recomendação e não virou corte.

**D-PEND-19 · AC-45:**
- **Opção de escolha:** o segundo toque é ignorado, e surge "Limpar" quando há resposta.
- **"Sem essa informação":** o segundo toque é ignorado, e surge "Limpar" (no horário e no estudo de imagem).
- **Componentes de opção da `ui/index.tsx`** (`Segmentado`, `LinhaDeAchado`, `Empilhado`): o mesmo. ⚠️ A 1ª versão só mudou `campos-clinicos.tsx`; a prova de módulo ficou verde e o e2e mostrou a opção da Superfície B ainda desmarcando. A prova foi ampliada para todo desenhador de opção.
- **Teste antigo:** `e2e/avc-superficie-a.spec.ts` ("uma resposta pode ser desfeita") passou a desfazer por "Limpar".
- **Fora do escopo:** a seleção múltipla (marcar/desmarcar item) **não** foi alterada — ver AC-53.

**D-PEND-20 · AC-50:** a chave PT e a tradução ES saíram de `lib/i18n/modules/avc-nihss-elegibilidade.ts`.

**Falha da suíte, corrigida:** ver `9ef7270` na tabela de suíte — aplicar o inverso inteiro de `b170b44` foi amplo demais.

**Falhas de instrumento corrigidas:**
- **Citação Markdown:** as três conferências de verbatim da prova nova liam a citação sem tirar os marcadores `> `, e davam vermelho sobre texto correto. Corrigido na própria prova.
- **Resumo da prova de ameaças:** o fim da prova dizia "4 eixos (ABCD)" em texto fixo, enquanto as conferências já exigiam ABCDE. Corrigido o texto.

#### Entrega 3 · pacote AC-43 ampliado (sem código)

`docs/avc/revisao/AC-06-dose-trombolitico.md` §9A:
- **Texto e tabela:** a recomendação textual (§4.6.2 rec. 1, COR 1, LOE A, **e357**) ao lado da Table 7 (**e358**).
- **Cálculo:** comparativo para 50–100 kg nas três condutas (exata, faixa, inteiro atual), em mg e em mL a 5 mg/mL.
- **Regulatório:** campo da situação regulatória no Brasil **em branco**, com a lista do que conferir na ANVISA e na bula.

#### Achados novos

| # | gravidade | achado | evidência |
|---|---|---|---|
| AC-52 | média | `nao_elegivel_a_evt` nunca é satisfeito (`return undefined`): as duas rotas de janela estendida que o exigem não alcançam "aplicável" nem com F-31 aberta. É por isso que o cenário de perfusão do AC-47 não reproduz. | `avc/nucleo/derivacoes-f.ts` (`case "nao_elegivel_a_evt"`) |
| AC-53 | baixa · **confirmar com o autor** | A D-PEND-19 foi aplicada à escolha única e a "Sem essa informação". Na **seleção múltipla**, tocar um item marcado continua desmarcando só aquele item; o "limpar" apagaria a lista inteira. | `components/avc/campos-clinicos.tsx` (`CampoDeMultipla`) |
| AC-54 | baixa | A AC-47 foi corrigida no sentido pedido (saída ≠ "indicada", com motivo). Isso responde em parte à interpretação 4 da D-139 (opção C do pacote), só para o registro explícito "não incapacitante". | `avc/nucleo/veredito-da-trombolise.ts`; pacote `D-139-4` |

**Suíte e envio:**

| item | resultado |
|---|---|
| commits | `433bb78` (decisões, só `docs/`) · `62856f4` (Entrega 1) · `f314f36` (Entrega 2) · `9ef7270` (cor órfã) · commit só de `docs/` com os pacotes, a auditoria e o status (D-PEND-17) (pacotes, auditoria e status, só `docs/`) |
| 1º `test:all` (HEAD `f314f36`) | 🔴 EXIT=1 · parou no 45º script, `test:avc-cor-do-assunto`: o diff inverso de `b170b44` trouxe de volta a entrada de cor do grupo `consultas`, que não existe e que `b170b44` tinha removido com razão → removida em `9ef7270`. Antes da parada, passaram: achados 22/22, D-PEND-18/19/20 20/20, autoria 32/32, persistência 40/40. |
| 2º `test:all` (HEAD `9ef7270`) | ✅ **EXIT=0** · 133 scripts npm · Playwright **517 passed** (8,0 min), sem failed ou skipped · achados 22/22 · D-PEND-18/19/20 20/20 · autoria e toque duplo 32/32 · persistência 40/40 · mutações 84/84 · 124 travas ligadas · índice 112 declaradas · censo 65 instrumentos |
| artefatos da suíte | `INDICE-DE-TRAVAS.md` e `INVENTARIO-AFIRMACOES-AVC.json` revertidos (D-PEND-10) |
| push | `e660433..9ef7270` → `origin/refactor/clinical-modules-rebuild`; `git ls-remote` = `9ef72701b46b50ccccf958c46e82933205eea9c5`; divergência 0/0. O commit só de `docs/` sobe em seguida (D-PEND-17). |

### 7.10 · Limpeza visual e a regressão que ela expôs (2026-09-13) · commits `6ffe520` (processo), `1da11b9` (interface) e `60d580d` («Limpar» com afordância)

⛔ **Nenhuma regra clínica alterada.**

#### 1 · A regressão da trombólise — causa real

**Sintoma.** No e2e da limpeza, 4 testes caíram: críticos (2), fluxos (1) e superfície F "chega já trombolisado". Depois de "Registrar administração" → "Iniciada", o fato de `ivt_estado` era gravado **sem instância** (`-` em vez de `trombolise_iv_1`), e nada que dependesse da administração aparecia.

**Hipótese inicial, refutada.** A primeira suspeita foi ciclo de import ou ordem de import (`ameacasImediatas` no topo de `superficie-a.tsx`). Não se sustentou:

| teste | resultado |
|---|---|
| ciclos de import de valor (aliases do `tsconfig`, resolução `.web`) | **0** em 558 arquivos |
| `import/no-cycle` do ESLint | 0 em 408 arquivos (sem resolvedor TS, inconclusivo) |
| registro de campos | já resolvido no uso (`campoDoModulo` → `todosOsCampos()` a cada chamada), sem montagem na carga |
| `campoDoModulo("ivt_estado")` no bundle, com o app carregado | `instanciaDe: "trombolise_iv"` |
| mesmo código, rebuildado | **passa** (45/45, inclusive os 4) |
| código com o filtro de eco amplo, rebuildado | **passa** |

A "bisseção" que parecia confirmar a ordem de import estava confundida: entre os dois builds também mudou o filtro de eco.

**Causa real.** `scripts/mutacoes/lib.cjs` gravava cada mutação no arquivo **real** da árvore e só restaurava no `finally`.
- **Sobreposição:** às 11:55:25, `test:mutacoes`, rodando em paralelo, escreveu a primeira mutação do primeiro conjunto — *"a ação de F sai do registro do módulo"* (tira `ACAO_DE_TROMBOLISE` de `todosOsCampos()` em `avc/conteudo/campos.ts`). O build empacotava até 11:55:34.
- **Efeito:** o `dist` saiu com o registro da trombólise mutado.
- **Por que parecia regressão do código:** o mesmo `dist` falhou no e2e e na reprodução manual.

**Prova vermelha do mecanismo.** Com **só** essa mutação aplicada e o build refeito, as 3 rodadas gravam `ivt_estado = "Iniciada"` com instância `-` e deixam a opção desmarcada; o teste da superfície F falha. Com o arquivo restaurado, idêntico ao original, o mesmo roteiro grava em `trombolise_iv_1`.

**Correção estrutural** (`6ffe520`):

| peça | o que faz | vermelho → verde |
|---|---|---|
| `scripts/mutacoes/lib.cjs` | uma cópia isolada por execução (arquivos rastreados e não ignorados), `node_modules` por link simbólico, trava roda **dentro** da cópia; a árvore real nunca é escrita; a cópia é removida no fim (o link sai antes) | — |
| `scripts/prova-mutacoes-isoladas.cjs` | sonda: durante a trava, o arquivo **real** não pode estar mutado e a trava tem de rodar fora da árvore | 🔴 5·2 (árvore real mutada durante a trava; `cwd` = repositório) → ✅ 7/7 |
| `test:mutacoes` | as mesmas 84 mutações, agora na cópia | ✅ 84/84; árvore real intacta; 0 cópias restantes |
| `scripts/prova-sem-ciclos-de-import.cjs` (pedido do autor, como proteção) | ciclos de import de valor com aliases e `.web`; autoteste com fixture (`m/a.ts` ↔ `m/b.ts`, um lado por alias) | ✅ 3/3; 0 ciclos no app |

#### 2 · «Limpar» — segurança de interface

**Defeito medido.**
- **Deslocamento:** ao marcar "18 anos ou mais", o "Limpar" surgia e empurrava a pergunta de baixo 48 px (y 547 → 595). O toque na posição vista antes caía fora de "Não gestante e não puérpera".
- **Confusão com opção:** no `Segmentado`, o "Limpar" era mais um segmento, com o mesmo visual das opções.

**Correção** (`1da11b9`):
- **Linha própria sempre reservada** abaixo das opções, com altura de toque. Aparecer não desloca nada.
- **Visual de ação secundária:** pílula com fundo de cartão e borda, texto pequeno secundário — corpo e borda exigidos pela trava de afordância, ⛔ e diferente de toda opção (versão final em `60d580d`, ver abaixo).
- **Onde:** escolha e horário (`campos-clinicos.tsx`), `Segmentado`, `LinhaDeAchado` e `Empilhado` (`ui/index.tsx`), e "Sem essa informação" do estudo de imagem (`superficie-c.tsx`).

| prova (`e2e/avc-limpeza-visual.spec.ts`) | antes | depois |
|---|---|---|
| marcar uma resposta não move a pergunta de baixo; o toque na posição vista antes acerta a opção | 🔴 y 547 → 595 | ✅ verde |
| «Limpar» com papel de botão e visual diferente da opção, sem sobrepor opção; tocar nele não marca nada; a linha de baixo não se move | 🔴 (medida absoluta; instrumento corrigido para distância relativa, ver abaixo) | ✅ verde (as opções vêm da tela — `sim`·`nao`·`nao_sei`; a 1ª versão supunha `incerto` e travou por tempo: erro de instrumento, corrigido) |

⚠️ **Primeiro `test:all` vermelho (HEAD `1da11b9`, EXIT=1 em 41 s).** O desenho entregue em `1da11b9` era texto sublinhado, sem fundo e sem borda. `test:avc-afordancia` reprovou 6 controles "desenhados como texto" — a mesma classe de defeito que o autor relatou seis vezes (`design-system/afordancia.ts`). ⛔ Nada foi enviado. Correção em `60d580d`: pílula (`RAIO.badge`), fundo de cartão (`surface`), borda `controlBorder`, texto pequeno secundário. O `controle` padrão do design system ⛔ não serviu, porque é idêntico à opção neutra ("Incerto"), e o tracejado já é de "Não sei". O e2e passou a comparar o «Limpar» com **todas** as opções (fundo, raio, tamanho do texto) e a exigir corpo e borda.

⚠️ **Instrumento corrigido.** A primeira versão media a posição absoluta na janela. O toque em "Sim" rolou a tela (2159 → 571) sem mudar o layout. A medida passou a ser a distância entre a opção e a linha de baixo.

#### 3 · Uma frase, uma vez

- **Prova ampliada:** o e2e varre toda frase visível de 25+ caracteres na Estabilização (cockpit e superfície), nos cenários base, PA alta e hipóxia.
- **Fora do universo, com motivo:** a lista de agentes (cada agente repete a própria procedência) e os rótulos de controles.
- **Antes, nos 3 cenários:** 🔴 *"2× Avaliar e tratar ameaças imediatas antes de avançar no fluxo."*
- **Correção:** a frase saiu do card "Estabilização primeiro" e ficou no bloco da Estabilização, com a nota ⓘ. **Depois:** ✅ 3/3 cenários sem frase repetida.

#### 4 · Testes de oxigênio — o que se afirma, lado a lado

| teste (`e2e/avc-superficie-a.spec.ts`) | antes | depois |
|---|---|---|
| "o fato entra no estado e a leitura recalcula à vista" | `avc-leitura-curto-oxigenio` · `toContainText(/94/)` | `avc-ameaca-respiracao` · `toContainText("O₂ suplementar — meta SpO₂ acima de 94%")` |
| "navegar para outra superfície e voltar não apaga os fatos" | `avc-leitura-curto-oxigenio` · `toContainText(/94/)` | `avc-ameaca-respiracao` · `toContainText("O₂ suplementar — meta SpO₂ acima de 94%")` |

**Informação afirmada:**
- **Antes:** o número 94 em qualquer lugar da linha.
- **Depois:** a frase inteira — O₂ suplementar **e** a meta de 94%. É o mesmo `curto` de `oxigenio()` (`avc/nucleo/derivacoes.ts:113`), que o card exibe como achado.
- **Âncora:** mudou do bloco "Atenção" para o card. A afirmação ficou mais forte, não mais fraca.

#### 5 · O resto da limpeza (sem mudança desde a medição)

Detalhe em `1da11b9`:
- PA alta com uma única recomendação completa, aviso e rodapé com estado curto;
- respiração sem eco no bloco "Atenção" e no rodapé;
- nova aferição sem botão removido, com trava dos dois caminhos;
- "Todos os eixos avaliados".

Prova de módulo `prova-avc-limpeza-visual`: 🔴 5·8 → ✅ 13/13.

#### 6 · Achados

| # | gravidade | achado | estado |
|---|---|---|---|
| AC-57 | **alta · processo** | Teste de mutação gravava na árvore real; qualquer build, e2e ou trava em paralelo podia empacotar ou testar código mutado sem aviso. Aconteceu com o registro da trombólise. | ✅ fechado em `6ffe520` |
| AC-58 | média · diagnóstico | A primeira explicação da regressão (ciclo ou ordem de import) estava errada e foi apresentada como provável antes de reproduzir. A bisseção que a "confirmava" misturava duas mudanças. | registrado |
| AC-56 | **alta · interface** (era "baixa · visual") | «Limpar» deslocava a tela e se parecia com opção. | ✅ fechado em `1da11b9` + `60d580d` |
| AC-55 | baixa | Frase "Avaliar e tratar ameaças imediatas…" duplicada. | ✅ fechado em `1da11b9` |

**Suíte e envio:**

| item | resultado |
|---|---|
| commits | `6ffe520` (processo) · `1da11b9` (interface) · `60d580d` («Limpar») · commit só de `docs/` com esta seção e o status (D-PEND-17) |
| e2e dos três fluxos, a 375 px (spec da limpeza e afetados) | build limpo (sem trava concorrente) + 147 e2e dos fluxos afetados: 146 ✅ · 1 🔴 de instrumento (acima) → spec da limpeza 8/8 ✅ |
| revisão visual a 375 px | ✅ 7 capturas (PA alta: rodapé curto e aviso curto no Neurológico; hipóxia: card B compacto, frase uma vez; «Limpar» antes/depois sem deslocar; nova aferição do topo sem bloqueio) |
| 1º `test:all` (HEAD `1da11b9`) | 🔴 EXIT=1 em 41 s · `test:avc-afordancia`: 6 «Limpar» desenhados como texto → corrigido em `60d580d` (§2). ⛔ Nada enviado. |
| 2º `test:all` (HEAD `60d580d`) | ✅ **EXIT=0** · 136 scripts npm · Playwright **525 passed** (8,1 min), sem failed ou skipped · limpeza visual 13/13 · mutações isoladas 7/7 · sem ciclo de import 3/3 · afordância 129 controles · mutações 84/84 · D-PEND-18/19/20 20/20 · achados 22/22 · persistência 40/40 · 127 travas ligadas · índice 115 declaradas · censo 65 instrumentos · execução 12:47–12:58 |
| artefatos da suíte | revertidos (D-PEND-10) |
| push | `589c55d..60d580d` → `origin/refactor/clinical-modules-rebuild`; `git ls-remote` = `60d580d0f56a9892063e547681c8a13402ddd08c`; divergência 0/0 (o helper `osxkeychain` não abriu no terminal sem TTY; o envio usou a credencial do `gh` já autenticado) |
| deploy | ⛔ não feito (pedido do autor) |

### 7.11 · 6ª rodada de 2026-09-13 · D-PEND-21 (opção neutra) e fila consolidada · commits `4447e15` (decisão, só `docs/`) e `4e05527` (código)

**Decisão do autor** (Sandro Dainez, 13/09/2026; `docs/decisoes.md`, `4447e15`):

| decisão | conteúdo |
|---|---|
| D-PEND-21 | opção não marcada é neutra (contorno, sem preenchimento de cor semântica); cor só após marcação, sempre acompanhada de ✓ e borda |

⛔ **D-PEND-22, D-PEND-23, D-PEND-24:** anunciadas pelo autor, texto não enviado. Não registradas. A Entrega 3 (dose exata com a Table 7 como conferência, HSA reclassificada, puerpério 14 dias) **não foi iniciada**, nem com provas.

#### Entrega 1 · D-PEND-21 · commit `4e05527`

**Onde estava o defeito.** Quatro desenhadores pintavam verde e vermelho por conta própria, marcados ou não:

| desenhador | arquivo | estilos |
|---|---|---|
| `Segmentado` e `LinhaDeAchado` | `components/avc/ui/index.tsx` | `decisaoSim` · `decisaoNao` |
| `CampoDeEscolha` | `components/avc/campos-clinicos.tsx` | `opcaoSim` · `opcaoNao` |
| `RespostaAction` (sem uso atual) | `components/avc/sistema/blocos.tsx` | `respostaSim` · `respostaNao`; ✓/✕ exibidos sempre |

**Correção no componente compartilhado.** `design-system/opcao-de-decisao.ts` é a fonte única:
- `opcaoDeDecisao(tema)` dá os estilos;
- `vistaDaOpcaoDeDecisao(valor, marcada)` diz quais aplicar e se há ✓;
- os quatro desenhadores consomem essa fonte, e a tipografia continua de cada um.

| estado | corpo | borda | ✓ | texto |
|---|---|---|---|---|
| não marcada | `controlSurface` | 1 px `controlBorder` | — | `text` |
| Sim marcado | `successFill` | 2 px `text` | ✓ | `onFill` |
| Não marcado | `criticalFill` | 2 px `text` | ✓ | `onFill` |
| Incerto marcado | `controlSurface` | 2 px `text` | ✓ | `text` |

**Provas:**

| prova | antes (código de `60d580d`) | depois |
|---|---|---|
| `e2e/avc-opcao-neutra.spec.ts`, varredura genérica: toda pergunta cujas opções são só sim·nao·nao_sei, em cada superfície com aba, com blocos recolhíveis e eixos abertos; marca Sim, Não e Incerto com «Limpar» entre eles | 🔴 4 de 7 superfícies · 23 perguntas (estabilização 2, neurológico 17, imagem 2, segurança 2) · 138 opções não marcadas com preenchimento semântico e sem contorno · nas 69 marcações, a marcada já tinha ✓, borda e cor | ✅ 7/7 |
| `scripts/prova-avc-opcao-neutra.cjs`: varredura de `successFill`/`criticalFill` em `components/avc` (com autoteste), fonte única nos dois temas, consumo pelos quatro desenhadores | 🔴 2 verdes · 9 vermelhos | ✅ 25/25 |
| e2e do AVC (`e2e/avc-*`) no build novo | — | ✅ 349 passed |

⚠️ **Universo declarado:**
- **Sem pergunta visível:** paciente, reperfusão e destino não têm pergunta Sim/Não/Incerto visível sem responder outra antes.
- **Não varrido:** perguntas que só aparecem depois de outra resposta.
- **Cobertura garantida:** a prova de módulo pega qualquer desenhador novo que pinte essas cores.

**Travas de contraste revistas com o estado neutro** (`scripts/valida-contraste.cjs`: 3 pares novos × 2 temas; 86 → 92 conferências, 0 falhas):

| par | piso | claro | escuro | observação |
|---|---|---|---|---|
| `text` × `controlSurface` (texto da neutra) | 4,5 | 12,77 | 12,04 | já existia |
| `controlSurface` × `surface` (corpo da neutra × card) | 1,25 | 1,40 | 1,42 | já existia |
| `controlBorder` × `controlSurface` (contorno × corpo) | 1,5 | 1,99 | 1,78 | já existia |
| **`text` × `surface`** (anel da marcada × card, WCAG 1.4.11) | **3** | 17,85 | 17,11 | novo |
| **`successFill` × `controlSurface`** (Sim marcado × neutra vizinha) | **1,5** | 3,59 | 2,49 | novo |
| **`criticalFill` × `controlSurface`** (Não marcado × neutra vizinha) | **1,5** | 4,67 | 1,84 | novo |
| `controlBorder` × `surface` (contorno neutro × card) | — | 2,78 | 2,53 | **não travado: abaixo de 3:1 → AC-59** |

⚠️ O anel antigo era medido contra o preenchimento: `text` × `criticalFill` no tema claro dava 2,73:1. O anel novo é medido contra o card.

**Capturas a 375 px** (Estabilização, "Há hipoxemia ou necessidade clínica de oxigênio?"):
- **antes:** com nada marcado, Sim verde cheio e Não vermelho cheio;
- **depois:** as três opções neutras com contorno; Sim marcado verde com ✓ e borda; Não marcado vermelho com ✓ e borda; Incerto marcado com ✓ e borda, sem cor.

#### Entrega 2 · fila consolidada

Tabela única em `docs/status.md` ("Fila consolidada"), em quatro partes:
- o que só o autor pode fazer;
- decisões pendentes;
- achados AC-\* abertos por gravidade;
- casos A01–A18 sem teste ou parciais.

Traz também o resultado de AC-46/47/48 (§7.9). As seções antigas "Decisões abertas" e "Próximo passo" passaram a apontar para ela.

#### Achado novo

| # | gravidade | achado | estado |
|---|---|---|---|
| AC-59 | baixa · interface | O contorno da opção neutra mede 2,53:1 (escuro) e 2,78:1 (claro) contra o card, abaixo dos 3:1 da WCAG 1.4.11 para limite de componente. A opção se separa do card pelo corpo (1,40–1,42:1) com a borda; a marcada tem anel de 17:1. | registrado; token não alterado (decisão de design do autor) |

**Suíte e envio:**

| item | resultado |
|---|---|
| commits | `4447e15` (D-PEND-21, só `docs/`) · `4e05527` (código) · commit só de `docs/` com esta seção, a fila e o status (D-PEND-17) |
| `test:all` (HEAD `4e05527`) | ✅ **EXIT=0** · 137 scripts npm · Playwright **532 passed** (8,1 min), sem failed ou skipped · D-PEND-21 opção neutra 25/25 · contraste 92 OK · afordância 129 controles · limpeza visual 13/13 · mutações isoladas 7/7 · sem ciclo de import 3/3 · mutações 84/84 · D-PEND-18/19/20 20/20 · achados 22/22 · persistência 40/40 · 128 travas ligadas · índice 116 declaradas · censo 65 instrumentos · execução 13:18–13:30 |
| artefatos da suíte | revertidos (D-PEND-10) |
| push | `8633f76..4e05527` → `origin/refactor/clinical-modules-rebuild` (inclui `4447e15`); `git ls-remote` = `4e05527d9b710f6dd94d0d7dbd98b40ca48da522`; divergência 0/0. O commit só de `docs/` sobe em seguida (D-PEND-17). |
| deploy · merge em `main` | ⛔ não feitos |

### 7.12 · 7ª rodada de 2026-09-13 · AC-59, D-PEND-22/23/24 e achados de interface · commits `95028a5` (decisões, só `docs/`) e `c7a1956` (código)

**Decisões do autor** (Sandro Dainez, 13/09/2026; `docs/decisoes.md`, `95028a5`):
- **Como chegaram:** num bloco com a recomendação do revisor, colado pelo autor sem linhas apagadas. Pela regra do próprio bloco, colar é aprovar.

| decisão | conteúdo | ressalva registrada |
|---|---|---|
| AC-59 | contorno da opção neutra ≥ 3:1 contra o card, nos dois temas; trava de contraste exige 3:1; 1,5 só para marcada × neutra | — |
| D-PEND-22 | tenecteplase 0,25 mg/kg exato, máx. 25 mg, sem arredondar mg; volume com 0,1 mL a 5 mg/mL; Table 7 (e358) como conferência, com divergência explícita; situação regulatória "pendente de conferência", visível | leitura do agente, a confirmar: alteplase continua inteira; volume arredondado ao 0,1 mL mais próximo |
| D-PEND-23 | suspeita clínica de HSA com TC sem sangue: reter reperfusão como "requer avaliação especializada / corrigir e reavaliar", não "impede pela diretriz"; fonte bula, marcada como adaptação do projeto até a Table 8 | a bula transcrita (`bulas-br-tromboliticos.md`) **não menciona HSA**: o trecho citado não está no repositório |
| D-PEND-24 | puerpério: janela de 14 dias pós-parto no portão, "fonte AHA 2019, a confirmar na Table 8 de 2026"; "10 dias" apagado | **não há transcrição da AHA 2019** no repositório; o número é do autor, com a marcação dele |

#### Entrega 1 · AC-59

| prova | antes (código de `4e05527`) | depois |
|---|---|---|
| `test:contraste`, pares `controlBorder` × `surface` e × `bg` (3:1) | 🔴 4 falhas: claro 2,78 · 2,53; escuro 2,53 · 2,85 | ✅ 96 OK, 0 falhas |
| `e2e/avc-opcao-neutra.spec.ts`, contorno da neutra × fundo real atrás dela, medido na tela | 🔴 4 superfícies; escuro `rgb(78, 92, 115)` × `rgb(11, 14, 20)` = 2,85:1 | ✅ 7/7 |

**Correção** (`design-system/tokens.ts`):

| tema | antes | depois | × card | × fundo | × corpo |
|---|---|---|---|---|---|
| claro | `#8E9CB1` | `#818EA1` | 3,32 | 3,02 | 2,38 |
| escuro | `#4E5C73` | `#5C697E` | 3,08 | 3,47 | 2,17 |

⚠️ **Dois temas:**
- **Tema claro:** o app está fixo no escuro (`design-system/theme.ts`, `useTheme()` devolve `TEMAS.escuro`; a troca de tema é a Fase 9). O claro **não pode ser capturado na tela**; fica verificado só pelos números da trava de contraste.
- **Capturas:** só no tema escuro.
- **Alcance:** `controlBorder` é token global, então o contorno mais visível vale para todo controle do app, não só para a opção neutra.

#### Entrega 2 · D-PEND-22, D-PEND-23, D-PEND-24

| prova | antes (código de `4e05527`) | depois |
|---|---|---|
| `scripts/prova-avc-decisoes-d22-d24.cjs` | 🔴 11 verdes · 22 vermelhos (70 kg = 18 mg; sem volume, sem Table 7, sem regulatório; HSA sem classificação; sem 14 dias) | ✅ 33/33 |
| `e2e/avc-decisoes-d22-d24.spec.ts` | 🔴 4/4 | ✅ 4/4 |

**D-PEND-22 · dose da tenecteplase:**
- **Cálculo:** `doseDerivada` usa 0,25 × peso exato, com teto de 25 mg, sem lixo de ponto flutuante.
- **Volume:** a 5 mg/mL, ao 0,1 mL mais próximo.
- **Conferência:** `conferenciaTable7` traz faixa, mg, mL, divergente e fonte "AHA/ASA 2026 · Table 7, p. e358", com as faixas verbatim da transcrição.
- **Regulatório:** `SITUACAO_REGULATORIA_TNK`.
- **Tela da Reperfusão:** dose com vírgula, volume, conferência com divergência e situação regulatória.

| peso | dose exata | volume | faixa da Table 7 | divergência |
|---|---|---|---|---|
| 55 kg | 13,75 mg | 2,8 mL | <60 kg · 15 mg · 3 mL | sim |
| 70 kg | 17,5 mg | 3,5 mL | 70 kg to <80 kg · 20 mg · 4 mL | sim |
| 71 kg | 17,75 mg | 3,6 mL | 70 kg to <80 kg · 20 mg · 4 mL | sim |
| 100 kg | 25 mg | 5,0 mL | ≥90 kg · 25 mg · 5 mL | não |
| 120 kg | 25 mg | 5,0 mL | ≥90 kg · 25 mg · 5 mL | não |

- **Controles:**
  - alteplase inalterada (99 kg = 89 mg · 70 kg = 63 mg · teto 90);
  - nenhuma dose de 30–50 mg (regime do IAM) alcançável entre 30 e 200 kg.
- **Testes antigos atualizados:**
  - `prova-avc-superficie-f` (70 kg: 18 → 17,5; trava de casas decimais dividida: alteplase inteira, tenecteplase ≤ 2 casas);
  - `prova-avc-criticos` bloco 10 (18 → 17,5).

**D-PEND-23 · suspeita clínica de HSA:**
- **Classificação:** `retencaoDiagnostica` passa a ter `classificacao: "avaliacao_especializada"`, com o rótulo *"Requer avaliação especializada — corrigir e reavaliar: suspeita clínica de hemorragia subaracnóidea com TC sem sangue"*.
- **Procedência:** *"Adaptação do projeto (D-PEND-23): bula citada pelo autor, trecho não transcrito no repositório; a conferir na Table 8 da AHA 2026"*.
- **Portão da IVT:** o motivo leva esse rótulo e essa procedência, e continua na camada `destino`, nunca na de segurança.
- **Na tela:** o título do estado e o bloco de retenção da EVT dizem a classificação; "Saída diagnóstica armada" saiu.
- **Controles:** «Não» libera; «Incerto» não retém.
- **Mesma lógica de retenção:** o que muda é a classificação e a procedência.

**D-PEND-24 · puerpério:**
- **Constantes:** `JANELA_DO_PUERPERIO_DIAS = 14` e `PROCEDENCIA_DA_JANELA_DO_PUERPERIO`.
- **Textos:** a nota do campo e a pergunta do portão dizem *"até 14 dias após o parto — fonte AHA 2019, a confirmar na Table 8 de 2026"*.
- **Escopo populacional:** `protocols/fontes-verbatim/escopo-populacional-avc.md` §5 registra a decisão como número do autor, não como transcrição.
- **Controles:** «Puérpera» fora do escopo; «Não sei» mantém a pergunta; nenhum "10 dias" em `avc/` nem nas traduções.

#### Entrega 3 · achados de interface, sem decisão clínica

| achado | prova (`e2e/avc-interface-compacta.spec.ts`) | antes | depois |
|---|---|---|---|
| cabeçalho alto; título em três linhas (spec p.418, p.462) | título em 1 linha, sem corte; bloco voltar + título (+ relógio quando existe) ≤ 96 px | 🔴 | ✅ ~86 px na captura |
| ponto e texto vermelhos em "Atendimento aberto" (spec p.462) | texto e ponto sem `critical`/`criticalFill` | 🔴 | ✅ |
| quinta aba cortada sem indicação | fase fora da tela ⇒ botão ›, com papel de botão, ≥ 32 px, que rola até a última fase | 🔴 (só borda de 2 px a 60% de opacidade, sem toque) | ✅ |
| SpO₂ vazio: +10 habilitado, −10 apagado | vazio: os dois inertes e no mesmo estado; tocar +10 não grava; com 88 digitado, −10 → 78 | 🔴 | ✅ |

**Correções:**
- **Cabeçalho** (`components/avc/sistema/index.tsx`): duas linhas curtas. Em cima: sair · estado · relógio. Embaixo: o nome da síndrome em uma linha, largura inteira, `PAPEL.tituloDeSecao`, `testID="avc-cabecalho-titulo"`. Marcador em `textSecondary`.
  - ⚠️ **1ª tentativa reprovada no e2e:** título em uma linha dentro das três colunas (64 · centro · 112 px). O nome ficou **cortado** ("AVC isquêmico ...") nos ~151 px do meio, e "Hemorragia subaracnóidea (HSA)" nunca caberia ali. O layout mudou em vez de encolher a fonte.
  - ⚠️ **Instrumento corrigido:** a medida do bloco exigia o relógio do topo, que não é desenhado na Estabilização. Voltar e título passaram a ser obrigatórios; o relógio entra quando existe.
- **Barra de fases:** botões ‹ e › (`avc-barra-mais-esquerda` / `-direita`), com corpo, contorno e seta. Medem o transbordo no nó rolável da web e rolam 60% da largura por toque. A borda passiva `avc-barra-continua` saiu. Fora do navegador, os botões não aparecem.
  - ⚠️ **Defeito visto na captura e corrigido:** o botão ‹ (40 px) cobria o começo da aba ativa ("stabilizar"), porque a barra a rolava para 24 px da borda. Agora rola para 48 px, com trava no e2e: a aba ativa começa depois do fim do botão ‹.
- **Degraus** (`components/avc/ui/index.tsx`): `degrauInerte = semPartida || naoMove(d)`, a mesma regra do `−/+` fino.

⚠️ **Mudança consciente de comportamento nos degraus:**
- **Antes:** o degrau partia do piso da faixa (+50 no peso vazio gravava 80 kg).
- **Origem da regra antiga:** a correção da D-127 (2026-09-10) a descrevia como "por decisão", mas **não há decisão do autor registrada**; foi escolha minha.
- **Agora:** com o campo vazio o valor entra digitado ou arrastado.
- **Specs atualizados, 9 passos:** `avc-abertura`, `avc-cor-do-assunto`, `avc-controle-numerico-unico` (o teste agora afirma o vazio inerte), `avc-fase9-trombectomia`, `avc-nihss-externo`, `avc-leitura-do-peso`, `avc-modulo-navegavel`, `avc-superficie-b`, `avc-superficie-paciente`.

#### Achados novos

| # | gravidade | achado | estado |
|---|---|---|---|
| AC-60 | média · fonte | As fontes citadas nas D-PEND-23 (bula) e D-PEND-24 (AHA 2019) não estão transcritas no repositório. As duas regras rodam marcadas como adaptação ou "a confirmar", sem trecho verificável. | aberto: autor |
| AC-61 | baixa · a confirmar | Leitura do agente na D-PEND-22: alteplase continua inteira; volume arredondado ao 0,1 mL mais próximo (71 kg: 3,55 → 3,6 mL). | confirmar com o autor |
| AC-62 | baixa · limite | O tema claro não é alcançável no app (Fase 9), então a AC-59 só pôde ser capturada no escuro. Os botões ‹ › da barra medem o transbordo só na web. | registrado |

**Suíte e envio:**

| item | resultado |
|---|---|
| commits | `95028a5` (decisões) · `c7a1956` (código) · commit só de `docs/` com esta seção, a fila e o status |
| e2e do AVC no build novo | ✅ 357 passed (build final; antes 356 · 1 falha, o cabeçalho cortado, corrigido) |
| `test:all` (HEAD `c7a1956`) | ✅ **EXIT=0** · 138 scripts npm · Playwright **540 passed** (8,3 min), sem failed ou skipped · D-PEND-22/23/24 33/33 · opção neutra 25/25 · contraste 96 OK · afordância 131 · críticos 183/183 · superfície F 92/92 · mutações 84/84 · 129 travas ligadas · índice 117 declaradas · censo 65 instrumentos · execução 14:19–14:30 |
| artefatos da suíte | revertidos (D-PEND-10) |
| push | `a7abed8..c7a1956` → `origin/refactor/clinical-modules-rebuild` (inclui `95028a5`); `git ls-remote` = `c7a19566ac1b9db5d796b1faec7eb433336812fd`; divergência 0/0 |
| deploy · merge em `main` | ⛔ não feitos |

### 7.13 · 8ª rodada de 2026-09-13 · HSA sem atalho, procedência fora do card, card de dose e D-PEND-25 · commits `583dde3` (decisão, só `docs/`) e `7c59d35` (código)

**Decisão do autor** (Sandro Dainez, 13/09/2026; `docs/decisoes.md`, `583dde3`):

| decisão | conteúdo |
|---|---|
| D-PEND-25 | alteplase 0,9 mg/kg exato, máx. 90 mg, sem arredondar mg; 10% em bolus em 1 min, restante em 60 min; volume a 1 mg/mL; mesmas provas da TNK (70, 100, 120 kg) |

- **Fecha:** AC-61.
- **Fontes, todas transcritas:**
  - AHA 2026 §4.6.2 rec. 1 (e357);
  - Table 7 (e358): *"Infuse 0.9 mg/kg (maximum dose 90 mg) over 60 min, with 10% of the dose given as a bolus over 1 min"*;
  - bula Actilyse §20.3 (1 mg/mL) e §20.8.

**Achados do autor na leitura das capturas da 7ª rodada:**
- **Segurança:** o card da HSA ensinava a virar a resposta.
- **Procedência:** o metadado interno aparecia no card clínico.
- **Dose:** o card mostrava duas doses completas.
- **Menores:** contadores opacos na Reperfusão; "mesma força" sem a frase literal.

**Provas vermelhas antes** (código e build de `c7a1956`):

| prova | antes |
|---|---|
| `scripts/prova-avc-rodada8.cjs` | 🔴 7 verdes · 21 vermelhos |
| `e2e/avc-hsa-sem-atalho.spec.ts` | 🔴 1/1 |
| `e2e/avc-procedencia-fora-do-card.spec.ts` | 🔴 2 de 4 (portão; HSA + TNK). Superfícies com blocos abertos e alteplase já passavam |
| `e2e/avc-card-de-dose.spec.ts` | 🔴 4/4 |

#### Entrega 1 (alta) · HSA sem atalho

**Violações encontradas no card (captura):**
- *"Resolver a suspeita clínica de hemorragia subaracnóidea: responder «Não», ou corrigir o registro"*;
- botão «Resolver ›», que levava ao campo;
- trocar «Sim» por «Não» liberava a reperfusão.

**Correção:**
- **Retenção** (`avc/nucleo/derivacoes-c.ts` `retencaoDiagnostica`):
  - nasce de um fato «Sim» **não corrigido**;
  - registrar «Não» ou «Incerto» depois **não** desfaz;
  - libera só a correção do próprio «Sim» (erro de registro).
- **Texto do card:** *"Requer investigação antes de reperfundir — conteúdo pendente de validação"*.
- **Botão:** o motivo do portão ficou sem `leva`, e não há «Resolver» nem no portão da IVT nem na retenção da EVT.
- **Prova antiga atualizada:** `prova-avc-criticos` bloco 30, "Sim → Não → portão liberado", passou a afirmar que o portão **não** libera.

⚠️ **Brecha declarada, não fechada sem decisão:**
- **Caminho:** «Limpar» é implementado como correção (`desfazerRegistro` → `corrigirFato`), então «Limpar» seguido de «Não» libera em dois toques.
- **Por que não foi fechada:** impediria corrigir um toque errado em «Sim».
- **Decisão pedida:** pacote `docs/avc/revisao/hsa-resolucao.md` §7.

**Pacote `docs/avc/revisao/hsa-resolucao.md`**, com a decisão humana em branco:
- **Fontes do repositório:** a AHA 2026 manda excluir hemorragia por imagem (§3.2) e não trata a suspeita clínica com TC sem sangue.
- **AHA/ASA 2023 de HSA:** a transcrição declara a **§4 (diagnóstico/imagem) não transcrita**. O que resolveria (angio-TC, punção lombar, avaliação especializada) fica listado **sem conteúdo afirmado**, apontando a §4 como o que falta transcrever.
- **Opções A–D** para definir "fato novo".

#### Entrega 2 · procedência fora do card clínico

**Trava genérica** (`e2e/avc-procedencia-fora-do-card.spec.ts`):
- **O que procura:** todo texto visível com "repositório", "spec §", "transcrit", "D-PEND" ou "a confirmar" fora de `avc-info-texto-*`/`avc-detalhe-*`.
- **Cenários:** portão pendente; as 7 superfícies com blocos abertos; HSA + TNK 70 kg; alteplase 70 kg.

**Encontrado antes:**
- portão: *"… (puerpério: até 14 dias após o parto — fonte AHA 2019, a confirmar na Table 8 de 2026). Não sei mantém a pergunta."*;
- card da HSA: *"Adaptação do projeto (D-PEND-23): bula citada pelo autor, trecho não transcrito no repositório; a conferir na Table 8 da AHA 2026"* e *"spec §1.8"*.

**Correção:**
- **Portão:** *"… não gestante e não puérpera (até 14 dias após o parto)."* A marcação da fonte e o "Não sei mantém a pergunta" seguem na nota do campo (ⓘ).
- **Portão da IVT:** fonte e procedência de **todo** motivo passam para um ⓘ (`avc-info-portao-<id>`). A retenção da EVT também (`avc-info-evt-retencao`).
- **Dose:** a fonte da Table 7 fica no ⓘ (`avc-info-table7`).

⚠️ **Fora do universo da trava:** o código do slot de fonte (ex.: "F-10") não está na lista de strings. No card do portão ele saiu para o ⓘ. Se outros "F-nn" aparecem no card de outras telas, **não foi medido** nesta rodada.

#### Entrega 3 · card de dose, D-PEND-25, contadores e "mesma força"

**Card de dose** (`components/avc/superficie-f.tsx`):
- **Dose e volume:** uma dose só, com o volume em corpo principal.
- **Conferência da Table 7:** só em mg, em legenda, rotulada *"faixa da diretriz, para conferência — não é a dose a preparar"*, **sem mL**.
- **Divergência:** *"A faixa dá 20 mg em vez de 17,5 mg"*.

**Alteplase (D-PEND-25):**

| peso | dose | volume (1 mg/mL) | bolus em 1 min | restante em 60 min |
|---|---|---|---|---|
| 70 kg | 63 mg | 63,0 mL | 6,3 mg · 6,3 mL | 56,7 mg · 56,7 mL |
| 71 kg | 63,9 mg | 63,9 mL | 6,39 mg · 6,4 mL | 57,51 mg · 57,5 mL |
| 99 kg | 89,1 mg | 89,1 mL | 8,91 mg · 8,9 mL | 80,19 mg · 80,2 mL |
| 100 kg | 90 mg | 90,0 mL | 9 mg · 9,0 mL | 81 mg · 81,0 mL |
| 120 kg | 90 mg (teto) | 90,0 mL | 9 mg · 9,0 mL | 81 mg · 81,0 mL |

- **Provas antigas atualizadas:** `prova-avc-superficie-f` e `prova-avc-decisoes-d22-d24`.
  - 99 kg: 89 → 89,1 mg.
  - Casas decimais: alteplase ≤ 1, tenecteplase ≤ 2.
  - Palavras "bolus" e "infus" liberadas no núcleo de dose, porque a D-PEND-25 as autoriza com fonte; preparo segue proibido.

**Contadores de Reperfusão:** *"1 recomendação se aplica · 3 dependem de dados ainda não registrados · 2 sem critério objetivo na diretriz"*, no lugar de *"1 aplicáveis · 3 potenciais · 2 sem critério na fonte"*.

**"Mesma força":** a frase existe.
- **Recomendação:** §4.6.2 rec. 1, COR 1 · LOE A, p. e357, uma única recomendação com *"tenecteplase at a dose of 0.25 mg/kg body weight (max 25 mg) or alteplase at a dose of 0.9 mg/kg body weight (max 90 mg) is recommended to improve functional outcomes"*.
- **No card:** *"Tenecteplase e alteplase estão na mesma recomendação da diretriz. Escolher não significa administrar."*
- **No ⓘ (`avc-info-agente`):** a frase literal completa, com a página.

#### Achados novos

| # | gravidade | achado | estado |
|---|---|---|---|
| AC-63 | **alta · segurança** | «Limpar» seguido de «Não» libera a retenção da HSA em dois toques, porque «Limpar» é correção. | aberto: decisão do autor (pacote `hsa-resolucao.md` §7) |
| AC-64 | média · fonte | A §4 (diagnóstico/imagem) da AHA/ASA 2023 de HSA não está transcrita. Sem ela não existe conteúdo que defina o que resolve a suspeita. | aberto: autor/transcrição |
| AC-65 | baixa · não medido | A trava cobre só as cinco strings pedidas. Códigos de slot "F-nn" fora do portão da IVT não foram varridos, então não se sabe se aparecem no card de outras telas. | a medir |

**Suíte e envio:**

| item | resultado |
|---|---|
| commits | `583dde3` (D-PEND-25) · `9f79e66` (pacote `hsa-resolucao.md`) · `7c59d35` (código) · commit só de `docs/` com esta seção e o status |
| incidente de processo | a 1ª cadeia de commit usou heredoc seguido de `&& \`; a continuação engoliu o título, o commit do pacote saiu sem título (`c688562`) e o resto da cadeia não rodou. Pego antes do push; mensagem corrigida com `--amend -F arquivo` (`9f79e66`); regra registrada: mensagem sempre por arquivo |
| provas no build final | ✅ 17/17 (HSA 1 · procedência 4 · dose 4 · D-PEND-22/23/24 4 · interface 4) |
| e2e do AVC no build final | ✅ 366 passed |
| `test:all` (HEAD `7c59d35`) | ✅ **EXIT=0** · 139 scripts npm · Playwright **549 passed** (8,4 min), sem failed ou skipped · rodada 8 28/28 · D-PEND-22/23/24 33/33 · críticos 183/183 · superfície F 92/92 · execução 15:11–15:22 |
| artefatos da suíte | revertidos (D-PEND-10) |
| push | `1010a21..7c59d35` → `origin/refactor/clinical-modules-rebuild` (inclui `583dde3`, `9f79e66`); `git ls-remote` = `7c59d359ce8b387b80fff599fd1996b674ede7a9`; divergência 0/0 |
| deploy · merge em `main` | ⛔ não feitos |

### 7.14 · 9ª rodada de 2026-09-13 · D-PEND-26 («Limpar» auditado) e AC-64 (§4 da diretriz de HSA 2023) · commits `5705840` (decisão, só `docs/`) e `68da674` (código)

**Decisão do autor** (Sandro Dainez, 13/09/2026; `docs/decisoes.md`, `5705840`):

| decisão | conteúdo |
|---|---|
| D-PEND-26 (AC-63) | «Limpar» sobre fato que sustenta retenção ou bloqueio exige confirmação explícita ("foi engano?"), grava evento de correção com autor e motivo "toque errado" e devolve a pergunta a "não respondida", nunca a "Não". A retenção cai porque o fato deixou de existir. "Sim"→"Não" direto continua não liberando. Regra genérica; prova vermelha com HSA e com pelo menos uma outra pergunta de bloqueio |

**Pedido do autor na mesma mensagem (AC-64), sem decisão clínica:** transcrever a §4 da diretriz de HSA 2023 a partir do PDF local e depois completar o pacote `hsa-resolucao.md`. O card não muda.

#### D-PEND-26 · «Limpar» auditado

**Regra genérica** (`avc/nucleo/limpar-auditado.ts`):
- **Quando sustenta:** uma resposta sustenta retenção ou bloqueio quando limpá-la faria **sumir** um motivo restritivo do portão da IVT. Efeitos "condição resolutiva" e "informa" não restringem.
- **Por que não é por campo citado:** a coagulação «Sim» gera o motivo "coagulograma" com campo `inr`, não com o campo da própria pergunta.
- **O que o «Limpar» auditado faz:** corrige **todas** as respostas vigentes da pergunta, cada correção com motivo "toque errado" e apontando o fato corrigido.
  - Com «Sim» seguido de «Não», corrigir só o «Não» deixaria o «Sim» retendo para sempre.
  - O autor é carimbado pela persistência (AC-40).

**Na tela:**
- **Onde:** `avc-modulo-screen.tsx` `desfazer` consulta a regra; se a resposta sustenta, abre `components/avc/confirmacao-de-limpar.tsx`.
- **Texto do diálogo:** *"Foi engano?"*, com as respostas registradas e *"Esta resposta sustenta uma retenção ou um bloqueio. Limpar registra uma correção com motivo «toque errado» e devolve a pergunta a não respondida."*
- **Botões:** "Manter a resposta" · "Foi engano — limpar".
- **Resposta que não sustenta nada:** limpa direto, como antes.

**Provas:**

| prova | antes (código e build de `7c59d35`) | depois |
|---|---|---|
| `scripts/prova-avc-limpar-auditado.cjs` | 🔴 0 · 3 (módulo e chamada na tela ausentes; as conferências de comportamento dependem do módulo) | ✅ 17/17 |
| `e2e/avc-limpar-auditado.spec.ts` · HSA «Sim» → «Limpar» | 🔴 *"«Limpar» liberou a retenção sem confirmação"* | ✅ |
| idem · coagulação «Sim» → «Limpar» | 🔴 *"bloqueio limpo sem confirmação"* | ✅ |
| idem · controles: coagulação «Não», hipóxia «Sim» limpam direto | ✅ (já limpavam) | ✅ |

**O que a prova de módulo confere:**
- **HSA «Sim»:** sustenta; o «Limpar» auditado derruba a retenção, a pergunta volta a `nao_perguntado` (nunca «Não») e há 1 correção "toque errado" apontando o «Sim».
- **HSA «Sim»→«Não» sem limpar:** continua retida.
- **HSA «Sim»→«Não» com «Limpar» auditado:** 2 correções, retenção cai.
- **Coagulação «Sim» sem exames:** sustenta; limpar derruba "coagulograma".
- **Controles que não sustentam:** coagulação «Não», hipóxia «Sim», HSA nunca respondida.

**Captura a 375 px — defeito visto e corrigido antes do commit:**
- **1ª captura:** o diálogo aparecia **semitransparente**, com o texto sobreposto aos botões da página e sem o fundo escuro.
- **Hipóteses:** animação de entrada ("fade") ou modal atrás do conteúdo. Uma segunda captura, esperando 600 ms no mesmo build, mostrou o diálogo opaco e na frente: era a animação.
- **Correção:** `animationType="none"`. Uma confirmação de segurança não deve ficar meio visível no instante em que já aceita toque.
- **Conferência:** 3ª captura sem espera, com o diálogo opaco e o fundo escurecido; e2e do «Limpar» e da opção neutra 10/10 nesse build.

**Teste antigo ajustado:** a varredura de `e2e/avc-opcao-neutra.spec.ts` toca «Limpar» entre marcações em toda pergunta Sim/Não. Onde a confirmação aparece (HSA, coagulação), agora confirma.

#### AC-64 · §4 da diretriz de HSA 2023

- **PDF lido:** `~/Literatura Medica/04-Guias e Diretrizes (avaliar)/hoh-et-al-2023-…pdf`, fora do repositório.
- ⚠️ **Não transcrito verbatim:** o agente não reproduz texto longo de diretriz protegida por direitos autorais.
  - **O que foi registrado** em `protocols/fontes-verbatim/aha-asa-2023-hsa.md` **S-00:** localização (p. e322–e324), número da recomendação, COR/LOE e **paráfrase marcada**.
  - **Literal:** fica nas linhas `> VERBATIM: ___`, para o autor colar.
  - **COBERTURA:** atualizada.
- **Recomendações localizadas** (paráfrase):
  - **rec. 2 (COR 1, B-NR):** mais de 6 h **ou déficit neurológico novo** → TC sem contraste e, se negativa, punção lombar;
  - **rec. 3 (COR 2a):** menos de 6 h e sem déficit novo → TC de alta qualidade laudada por neurorradiologista;
  - **rec. 5 (COR 1):** alta suspeita e angio-TC negativa ou inconclusiva → DSA;
  - **Figure 2 (e323):** punção lombar → xantocromia → angio-TC/DSA;
  - **texto de suporte (e324):** as análises de sensibilidade da TC não se aplicam a apresentações atípicas com déficit focal novo.
- **Pacote `docs/avc/revisao/hsa-resolucao.md`:**
  - **§4:** o que a §4 trata e os limites de aplicação ao candidato à reperfusão;
  - **§5:** proposta por item (TC negativa, punção lombar, angio-TC/DSA, avaliação especializada), cada um com a pergunta que só o autor decide;
  - ⚠️ **punção lombar antes de trombólise:** sem fonte no repositório;
  - **§7:** a pergunta 2 (brecha «Limpar») marcada como decidida pela D-PEND-26;
  - **Decisão humana:** continua `___`.
- **Card:** inalterado, *"Requer investigação antes de reperfundir — conteúdo pendente de validação"*.

#### Achados

| # | gravidade | achado | estado |
|---|---|---|---|
| AC-63 | alta · segurança | «Limpar» + «Não» liberava a HSA em dois toques | ✅ fechado pela D-PEND-26 em `68da674` |
| AC-64 | média · fonte | §4 da diretriz de HSA 2023 não transcrita | ◐ localizada e parafraseada em S-00; verbatim pendente do autor |
| AC-66 | média · clínico, pergunta | Pela rec. 2 da §4, com déficit focal a TC negativa não basta e segue punção lombar. A interação punção lombar × trombólise não está em nenhuma fonte do repositório | aberto: autor (pacote §7 pergunta 3) |

**Suíte e envio:**

| item | resultado |
|---|---|
| commits | `5705840` (D-PEND-26) · `68da674` (código, com S-00 e o pacote) · commit só de `docs/` com esta seção e o status |
| e2e da rodada no build final | ✅ 30/30 em 8 specs no build com animação; após remover a animação, limpar-auditado + opção neutra 10/10 |
| e2e do AVC no build final | ✅ 369 passed (build com animação); `test:all` no HEAD final: 552 passed |
| `test:all` (HEAD `68da674`) | ✅ **EXIT=0** · 140 scripts npm · Playwright **552 passed** (8,4 min), sem failed ou skipped · «Limpar» auditado 17/17 · rodada 8 28/28 · críticos 183/183 · 131 travas ligadas · índice 119 declaradas · execução 15:41–15:53 |
| artefatos da suíte | revertidos (D-PEND-10) |
| push | `4488259..68da674` → `origin/refactor/clinical-modules-rebuild` (inclui `5705840`); `git ls-remote` = `68da674267374d6dfdd7eaaf60b153ea96ec9db7`; divergência 0/0 |
| deploy · merge em `main` | ⛔ não feitos |

### 7.15 · 10ª rodada de 2026-09-13 · D-PEND-27, «Paciente piorou» global (AC-10, A11) e transferência/telestroke (T07, A12, A08) · commits `d1edb50` e `f7993d7` (só `docs/`) e `e8fed38` (código)

**Decisão e pedidos do autor** (Sandro Dainez, 13/09/2026; `docs/decisoes.md`):

| item | conteúdo |
|---|---|
| D-PEND-27 (`d1edb50`) | No diálogo "Foi engano?", «Manter a resposta» é a ação padrão visualmente; «Foi engano — limpar» é secundária |
| AC-66 / "fato novo" (`d1edb50`) | A leitura do autor não coincide com A–D e entrou como **opção E** no pacote `revisao/hsa-resolucao.md`. ⛔ Não escolhida: o card fica como está |
| Transferência e telestroke (`d1edb50`) | Ciclo de vida da transferência; teleconsulta como ator com parecer registrado; plano local e tarefas durante a espera; linha do tempo real na síntese. ⛔ Nenhum critério de transferência nem centro de destino afirmado |
| Ajuste de rota (`f7993d7`) | «Paciente piorou» é ação GLOBAL: evento de deterioração (autor, horário, texto livre opcional), tarefa «reavaliar agora» em Prioridade, reabre a avaliação de ameaças com histórico preservado. ⛔ Sem limiar, ⛔ sem conduta. A espera da transferência usa o mesmo mecanismo |

#### D-PEND-27 · destaque no caminho seguro

- **O que mudou:** em `components/avc/confirmacao-de-limpar.tsx`, «Manter a resposta» usa o preenchimento da ação padrão (`primaryFill`) e «Foi engano — limpar» usa o estilo secundário.
- **Provas:** `prova-avc-limpar-auditado` 🔴 17·2 → ✅ 19/19. No e2e, o fundo de «Manter» no build de `68da674` era `rgb(42, 55, 74)` 🔴; agora é `rgb(26, 107, 213)` ✅.

#### «Paciente piorou» · ação global

**Onde fica:** um botão no topo fixo do shell, logo abaixo do cabeçalho. Ele fica fora da rolagem e aparece em toda superfície do AVC (`components/avc/paciente-piorou.tsx`).

**O diálogo:**
- Texto: *"Registra o evento com o seu nome e o horário, cria a tarefa «Reavaliar agora» e reabre a avaliação de ameaças da Estabilização. Nada do que já foi registrado é apagado."*
- Campo *"O que mudou (opcional)"*.
- Botões «Cancelar» e «Registrar piora». «Cancelar» não registra nada.

**O que o registro faz** (`avc/nucleo/deterioracao.ts`):
- **Evento:** um fato `paciente_piorou` com horário clínico e o texto aparado; sem texto, `sem_descricao`. O autor é carimbado pela persistência (AC-40).
- **Reabertura:** os eixos de `ameacasImediatas` saem de `eixosConcluidos`. Nenhum fato é corrigido nem apagado, e cada `eixo_reaberto` fica na trilha.
- **Tarefa `reavaliar_apos_piora`:**
  - existe no mesmo instante do evento;
  - fica fixada em primeiro em `problemasAtivos`;
  - resolve quando os eixos voltam a ser concluídos;
  - não traz número nem conduta.
- **Na tela:**
  - leva à Estabilização;
  - uma linha «Reavaliar agora» abre o topo de **toda** superfície, inclusive Paciente e Estabilização, até a reavaliação;
  - a tarefa também é a primeira de "Pendências do atendimento".

⚠️ **Leitura de "Prioridade" (interpretação, a confirmar):** o app não tinha uma seção com esse nome. Foram usados dois lugares: a linha no topo de cada superfície, onde já morava a prioridade da imagem, e o primeiro lugar da lista de problemas.

#### Transferência e teleconsulta · registro

**Campos em G** (`avc/conteudo/superficie-g.ts`), todos `administrativo`, com consumidor declarado só em `transferencia.ts`:

| bloco | campos |
|---|---|
| Transferência | estado (Solicitada · Contato realizado · Aceite · Recusa · Transporte confirmado · Saída · Chegada · Cancelada) · destino informado pela equipe (texto) · motivo da recusa (texto, aparece com «Recusa») · previsão do transporte (estimativa, hora) |
| Teleconsulta (telestroke) | estado (Solicitada · Em andamento · Parecer registrado · Não disponível) · parecer (texto) · autor do parecer (texto) · horário do parecer |

**Leitura** (`avc/nucleo/transferencia.ts`):
- **Cada toque é um marco com horário**, e a linha do tempo é a trilha. Marco corrigido ou limpo sai dela.
- **Aceite nunca presumido:**
  - só conta um «Aceite» registrado depois da última recusa ou cancelamento;
  - transporte, saída ou chegada sem aceite fazem a síntese dizer *"Aceite não registrado"*.
- **Recusa:**
  - sem motivo, vira pendência *"Registrar o motivo da recusa"*;
  - com motivo, entra na linha do tempo como *"Recusa registrada"* com o texto.
- **A12:** duas situações dão a linha *"Sem transferência confirmada: manter o plano local, documentar e revisar o acesso"* e a tarefa *"Revisar o acesso à transferência"*:
  - "transferência viável neste momento" = «Não»;
  - ou recusa/cancelamento sem nova solicitação.
  - «Incerto» não cria a tarefa (RQ-REC-01).
- **Espera:** de Solicitada a Saída, a síntese diz *"Transferência em curso: o plano local e as tarefas continuam"*. Nada trava, e a piora usa o botão global.
- **Parecer:**
  - estado «Parecer registrado» com texto → *"Avaliação especializada registrada"* na situação;
  - na linha do tempo, o texto e o autor aparecem como escritos;
  - sem texto, o parecer não é presumido.
- **Síntese** (`sintese-do-caso.ts`): novo `linhaDoTempo`, com transferência, teleconsulta e pioras em ordem de horário; estimativa marcada.
- **Barreira clínica:** portão da IVT e veredito da EVT idênticos com e sem transferência, recurso ou parecer.

#### Provas (vermelho no código e no build de `68da674`)

| prova | antes | depois |
|---|---|---|
| `scripts/prova-avc-piora-e-transferencia.cjs` (nova, no `test:all`) | 🔴 0 · 5 (módulos e tela ausentes; as conferências de comportamento dependem dos módulos) | ✅ 47/47 |
| `e2e/avc-paciente-piorou.spec.ts` · visível e acionável nas 7 superfícies a 375 px, rolado ao fim, com bloco aberto e recolhido | 🔴 *"«Paciente piorou» fora da tela em paciente"* (elemento ausente) | ✅ |
| idem · A11 após trombólise: tarefa no topo, eixo concluído reaberto, IVT preservada, autor no evento | 🔴 | ✅ |
| idem · piora durante a espera: transferência continua «Aceite», piora na linha do tempo | 🔴 | ✅ |
| idem · ES | 🔴 | ✅ |
| `e2e/avc-transferencia.spec.ts` · A12 sem recurso | 🔴 | ✅ |
| idem · recusa sem/com motivo | 🔴 | ✅ |
| idem · aceite não presumido e estimativa | 🔴 | ✅ |
| idem · telestroke: parecer com texto, autor e horário | 🔴 | ✅ |
| idem · A08: coagulação «Sim», transferência aceita, portão e EVT presentes | 🔴 | ✅ |
| idem · ES | 🔴 | ✅ |

**Ajustes de instrumento antes do verde:**
- (a) A prova de módulo procurava `<ScrollView` e achava o genérico `useRef<ScrollView>`; passou a procurar o JSX `<ScrollView ref=`. O vermelho era legítimo: o botão não existia.
- (b) O e2e ES esperava "Teleconsulta" com maiúscula no rótulo; passou a aceitar `/teleconsulta/i`.
- (c) No build novo:
  - os blocos nascem recolhidos, e a condição "com bloco recolhido" passou a abrir e recolher de novo um bloco;
  - `not.toHaveText` num selo que some reprovava por "elemento ausente", e passou a contar o selo "Avaliação concluída" (0).

**Travas ajustadas conscientemente** (motivo no próprio arquivo):
- **`prova-avc-cockpit`:**
  - a regra "nenhuma derivação lê `eixosConcluidos`" ganhou uma exceção nomeada, `deterioracao.ts`, que é workflow: reabre e diz se a tarefa segue aberta;
  - uma conferência nova limita o que esse módulo exporta a evento, leitura do evento e tarefa. A regra continua para todo o resto do núcleo.
- **`prova-alcancabilidade-avc`:** os campos de transferência e teleconsulta entram no universo de G.
- **`prova-avc-consumidores`:** a primeira versão tinha o literal `"glicemia"` (id de eixo) em `deterioracao.ts`. A trava acusou leitura não declarada, e os eixos passaram a ser lidos de `ameacasImediatas`.

#### Achados

| # | gravidade | achado | estado |
|---|---|---|---|
| AC-10 | alta | «Preciso de ajuda» e «Paciente piorou» não existiam | ◐ **«Paciente piorou» fechado** em `e8fed38`; «Preciso de ajuda» continua ausente |
| AC-11 | alta | sem ciclo de transferência nem telestroke | ✅ fechado em `e8fed38` como **registro**; critério e destino seguem sem fonte (Portaria 665/2012, rede local) |
| AC-67 | média · pergunta | «Paciente piorou» registrado por engano não tem desfazer; a tarefa só sai reconcluindo os eixos | aberto: autor decide se cabe «Limpar» auditado ao evento |
| AC-68 | baixa | Campo de texto grava um fato por alteração (herdado de `identificacao`); motivo da recusa e parecer digitados letra a letra enchem a trilha. A leitura usa o último valor | aberto · código |
| AC-69 | baixa · limite | O horário de cada marco da transferência é o do registro, sem retroagir. A previsão usa o seletor de hora do app; horário futuro não foi medido | declarado |
| AC-70 | baixa · instrumento | A trava "texto livre só administrativo" (`prova-avc-paciente`) cobre só P/A/B/C. Os textos de G ficam cobertos por consumidores e alcançabilidade | declarado |

**Casos A:** A11 e A12 passam a ter e2e que mede o caso. A08 ganhou o cenário "transferência em curso"; o restante de A08 segue como na §3.

**Suíte e envio:**

| item | resultado |
|---|---|
| commits | `d1edb50` · `f7993d7` (decisões, só `docs/`) · `e8fed38` (código) · commit só de `docs/` com esta seção e o status |
| e2e da rodada no build final | ✅ 14/14 (paciente-piorou 4, transferência 6, limpar-auditado 4) |
| e2e do AVC no build final | ✅ 380 passed |
| 1º `test:all` (HEAD `e8fed38`) | 🔴 EXIT=1 · **ambiente**: um `serve -s dist` meu, na 4173, foi reaproveitado (`reuseExistingServer`); com fallback SPA, toda rota recebeu o HTML da home → React #418 · 66 failed (hidratação, módulos, migração, validação dirigida), 497 passed · nada enviado |
| 2º `test:all` (HEAD `e8fed38`, servidor derrubado) | ✅ **EXIT=0** · 140 `npm run` + 1 `node` · Playwright **563 passed** (8,6 min), sem failed ou skipped · piora e transferência 47/47 · «Limpar» auditado 19/19 · rodada 8 28/28 · críticos 183/183 · cockpit 18/18 · alcançabilidade 22/22 · 132 travas ligadas · índice 120 declaradas · término 17:30 · `dist/artefato.json` = `e8fed38` |
| artefatos da suíte | revertidos (D-PEND-10) |
| push | `84a858d..e8fed38` → `origin/refactor/clinical-modules-rebuild` (inclui `d1edb50` e `f7993d7`); `git ls-remote` = `e8fed38543d4be95bd094f86c57f2d1158efb71e`; divergência 0/0 |
| deploy · merge em `main` | ⛔ não feitos |

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
| ⚠️ commit de docs `9b3c45e` | **truncou este arquivo** (1280 linhas apagadas, só a §7.16 sobrou): o script abriu o arquivo para escrita antes de lê-lo. Enviado assim; conferido só o nome dos arquivos, não o tamanho do diff. Restaurado no commit seguinte (conteúdo de `70149fc` + esta seção), sem reescrever histórico enviado |
| deploy · merge em `main` | ⛔ não feitos |
