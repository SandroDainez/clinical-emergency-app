# Inventário · o que o repositório já resolve do PDF v1.1

**Data da medição:** 2026-09-13 · **HEAD medido:** `52aa4e2`
(`refactor/clinical-modules-rebuild`) · working tree limpo.

## Como ler

| estado | significado |
|---|---|
| **JÁ RESOLVE** | o requisito está atendido no objeto medido, com arquivo e função |
| **PARCIAL** | existe parte; a coluna diz o que falta |
| **NÃO RESOLVE** | nada medido atende o requisito |
| **NÃO MEDIDO** | não conferido nesta rodada; não se afirma nada |

**Regra seguida:** mediu-se o objeto, não o proxy. "Existe um arquivo com esse nome"
não conta como requisito atendido. Toda busca negativa usou controle positivo no
mesmo estilo de padrão (R-CONTROLE, `auditoria/REGRAS-DE-EVIDENCIA.md`).

⚠️ **Duas medições desta rodada foram refeitas** porque o instrumento estava
quebrado: `git grep -E` não entende `\b` nem `\s`, e deu zero inclusive no
controle positivo. Refeitas com `git grep -P`, inverteram: o conteúdo do AVC
**tem** COR e LOE por afirmação. Os números abaixo são os da refação.

---

## 0 · O fato que muda a leitura de todo o resto

**O módulo de AVC já existe neste repositório, e é grande.**

| medida | valor |
|---|---|
| `avc/conteudo/` | 25 arquivos |
| `avc/nucleo/` | 25 arquivos |
| `components/avc/` | 18 arquivos |
| superfícies (`avc/conteudo/superficies.ts`) | `paciente`, `laboratorio`, `estabilizacao`, `neurologico`, `imagem`, `seguranca`, `correcoes`, `reperfusao`, `destino`, `hic`, `hsa` |
| especificação vigente | `auditoria/ESPECIFICACAO-AVC.md`, 3.297 linhas |
| provas `scripts/prova-avc-*` | 32 |
| e2e `e2e/avc*` | 32 |
| commits locais da sessão de 2026-09-12, **não enviados** | 26 (`058ae0b`..`52aa4e2`), fechando 11 *release blockers* |

**E ele não roda sobre um motor declarativo em grafo.** O que existe:

| peça | estado medido |
|---|---|
| contrato do motor ("1 motor + N conteúdos") | `auditoria/ARQUITETURA-MAE.md` — **arquivado em 2026-08-20**. O cabeçalho diz: *"ELE DESCREVE O ALVO, NÃO O ESTADO"* e *"não é uma ordem para executar"*. §4 define tipos de nó; §7 define travas e linter; o próprio cabeçalho registra que §7.1–§7.10 **não** reprovam build em todos os módulos |
| emendas ao contrato | `auditoria/ARQUITETURA-MAE-EMENDAS.md` — força da afirmação e `contextoDaFonte` |
| motor em código | `core/decision-tree/` — carimbado **`LEGACY_ACLS_RUNTIME`**, mantido só para bradicardia e taquicardia. Cabeçalho de `acls-decision-flow-screen.tsx`: *"ISTO NÃO É A BASE DO PRÓXIMO MÓDULO"* |
| AVC atual | reconstruído em 2026-08-28 como `avc/conteudo` (dados) × `avc/nucleo` (derivações puras) × `components/avc` (telas), **sem** grafo declarativo nem linter de grafo |

➜ **"1 motor + N conteúdos em grafo": NÃO RESOLVE.** Há contrato arquivado e
nenhuma implementação. Evoluir o AVC existente ou reconstruí-lo sobre o motor é
decisão do autor (`docs/status.md`).

---

## 1 · Os itens nomeados pelo autor

### `lib/instabilidade-guiada.ts` — NÃO RESOLVE para o AVC

| medida | valor |
|---|---|
| existe | sim, 354 linhas |
| carimbo | `LEGACY_ACLS_RUNTIME` — *"Não utilizar em novos módulos clínicos."* · dívida **D-107** |
| consumidores reais | `acls-bradycardia-tree.ts` e `acls-tachycardia-tree.ts`, e só eles |
| conteúdo | decomposição de instabilidade em sinais de beira de leito; critérios AHA com limiar de PAS embutido (`derivarInstabilidade`, `OpcoesDeInstabilidade.limiarPas`) |

O AVC tem o próprio `avc/nucleo/ameacas-imediatas.ts` (conteúdo não medido nesta
rodada). O arquivo legado **não pode** ser reaproveitado: sai do app com
bradicardia e taquicardia.

### `lib/contexto-do-paciente.ts` — PARCIAL (regra existe; ficha compartilhada não)

| medida | valor |
|---|---|
| existe | sim, 85 linhas |
| campos compartilháveis | `CAMPOS_COMPARTILHADOS = ["peso", "pesoOrigem", "altura", "sexo", "idade"]` — lista fechada |
| armazenamento | em memória, validade de 1 h (`VALIDADE_MS`) |
| consumidor único | `components/protocol-screen/acls-decision-flow-screen.tsx`, **legado** |
| o AVC usa? | **não** — zero `guardarNoContexto`/`lerDoContexto` em `avc/` e `components/avc/` |

**A razão escrita de proibir valores voláteis** (linhas 22–28, verbatim):

> *"NUNCA REAPROVEITADO — sinais vitais e exames: PA, FC, SpO₂, glicemia,
> lactato, pH, potássio, NIHSS, Glasgow. Esses mudam de minuto a minuto, e é
> exatamente por mudarem que são medidos. Preencher automaticamente uma PA de dez
> minutos atrás como se fosse a de agora seria pior do que perguntar: o médico
> veria um número plausível, não teria motivo para duvidar dele, e decidiria
> conduta sobre um dado morto."*

⚠️ **Diferença a decidir:** o arquivo **proíbe reaproveitar** voláteis. A
formulação do autor para a fundação é *"sempre com horário e origem, nunca
preenchidos sozinhos"*, e o PDF p.26 fala em *"dados confirmados com horário e
origem; permite revisar"*. As duas proíbem o preenchimento automático; a nova
**permite exibir** o valor anterior com horário e origem. É refinamento a
confirmar, não a reconciliar em silêncio.

### `components/protocol-screen/calculadora-embutida.tsx` — NÃO EXISTE

Medido: `git ls-files` sem o caminho. O que existe no lugar:

| arquivo | o que é |
|---|---|
| `components/avc/calculadora-de-glasgow.tsx` | calculadora específica do AVC |
| `components/protocol-screen/clinical-calculators-screen.tsx` | tela de calculadoras independente |
| `scripts/valida-calculadoras.cjs`, `scripts/mapa-de-calculadoras.cjs` | travas |
| `auditoria/limiares-de-calculadora.json` | limiares |

**PAM estimada = (PAS + 2 × PAD)/3 (T01):** nenhuma função reutilizável. A única
ocorrência de "PAM estimada" é texto de estratégia em
`components/protocol-screen/vasoactive-calculator-screen.tsx:175`.
➜ **Calculadora em dois modos com o mesmo cálculo (p.26): NÃO RESOLVE.**

### `protocols/guidelines_metadata.json` — PARCIAL

| medida | valor |
|---|---|
| entradas | 48, **por diretriz**, não por regra |
| campos em todas | `id`, `name`, `base`, `nossa`, `citation`, `modules_using`, `key_recommendations_covered`, `notes` |
| campos parciais | `staleness_threshold_months` (20), `url` (17), `texto_verbatim` (1) |
| força, `contextoDaFonte`, população, status de validação **por regra** | **ausentes** |

Serve à procedência e à idade da diretriz. **Não** atende o contrato de regra da
p.12.

### Guardas de build — PARCIAL

| medida | valor |
|---|---|
| passos em `test:all` | 126, incluindo `build:web:teste` |
| `node scripts/valida-pipeline.cjs` (executado) | *"116 travas ligadas · 3 isenção(ões) com motivo registrado"* |
| `node scripts/indice-de-travas.cjs` (executado) | *"104 declaradas · 17 isentas por serem anteriores à convenção"*. ⚠️ **Este script reescreve `auditoria/INDICE-DE-TRAVAS.md`**; ao rodá-lo, o arquivo passou de *"104 de 118"* para *"105 de 119"* e ganhou a entrada `test:avc-criticos`. **Revertido** — ver §3 |
| `lint` e `tsc` no `test:all` | **não** |
| `test:forca-da-afirmacao` (descrita em `ARQUITETURA-MAE-EMENDAS.md`) | **ausente** do `package.json` |
| teto de 200 caracteres por item | **nenhuma trava**. As duas ocorrências de `length > 200` são **pisos**, não tetos: `prova-avc-fase9-evt.cjs:1185` confere que um trecho de código tem corpo; `prova-guarda-de-acesso.cjs:204` idem |
| dose pediátrica | `test:escopo-pediatrico` reprova |

⚠️ O cabeçalho de `ARQUITETURA-MAE.md` afirma que o app cumpre *"teto de 200
caracteres por item"*. Nenhuma trava sustenta isso.

### i18n — PARCIAL

| requisito p.25 | medido |
|---|---|
| cobertura PT/ES | 133 dicionários em `lib/i18n/modules/`; `tr(pt, locale)` em `lib/i18n/index.ts:152` |
| **chaves estáveis** | **não** — a chave é o **texto em português** (`ES_AVC_MODULO[pt] ?? …`) |
| troca sem reiniciar | `lib/language-context.tsx` usa store externo (`lib/locale.ts`) + `useSyncExternalStore`: re-renderiza **sem remontar**, então o estado da tela não se perde. Web lembra a escolha em `localStorage`; native, em memória |
| números por idioma | `avc/nucleo/formato.ts:90` formata com **vírgula**; rejeição de separador ambíguo **não localizada** |
| glossário clínico revisado | **nenhum arquivo** |
| trava de tradução | `scripts/varredura-pt.cjs` + `scripts/prova-varredura-morde-sem-acento.cjs`; **D-138 aberta** (descarte por heurística fora de campo de tela) |

### `acls/speech-map.ts` — fora do escopo do AVC

459 linhas; textos canônicos do áudio do ACLS (AHA 2025), com números clínicos
falados; consumidores `acls/orchestrator.ts`, `acls/presentation.ts`,
`acls/speech-queue.ts`, `components/protocol-screen.tsx`, `engine.ts`,
`lib/acesso-vascular.ts`. **Pertence ao PCR**, área preservada. O AVC não usa voz.

---

## 2 · Requisitos do PDF, um a um

### Escopo e fontes

| req. | estado | onde / o que falta |
|---|---|---|
| Regras de método R-1..R-100 | **JÁ RESOLVE, com correção de número** | `auditoria/METODO.md`: 129 IDs distintos com cabeçalho, **R-1 a R-133**; R-46, R-129, R-130, R-131 sem cabeçalho |
| Fonte R3 = texto integral AHA/ASA 2026 | **PARCIAL** | `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md`: 2.618 linhas, 91 blocos verbatim, 27 páginas e3xx/e4xx distintas. ⚠️ O cabeçalho *"ESTE ARQUIVO ESTÁ VAZIO DE PROPÓSITO"* (linha 24) está **desatualizado** |
| **Errata Stroke 2026;57(8):e461–e467** | **NÃO RESOLVE** | DOI `…530` em **0** arquivos do repo (controle `…513`: 5). Citada **só** na lista de referências do PDF do autor `AVC_Isquemico_Hemorragico_2026_V7_1_REVISAO_FINAL.pdf`. O documento da errata não foi localizado. ➜ **nenhum slot transcrito foi conferido contra ela** |
| ABN/SBDCV · Linha de Cuidado MS · Portaria 665/2012 | **NÃO RESOLVE** | 0 arquivos para Portaria 665, Linha de Cuidado e ABN (controle `Prabhakaran`: 6). `SBDCV` aparece em 9 arquivos, vindos da "Parte 2" (tabelas de anti-hipertensivo) |
| Canadian Stroke Best Practices (R1, R2, R4, R5, R6) | **NÃO RESOLVE** | 0 arquivos no repo |
| Populações pediátrica, gestante, puérpera: identificar e encaminhar | **NÃO RESOLVE** | 0 arquivos em `avc/` e `components/avc/` (PCRE, controle `\bgravidade\b`: 17). Existe só a trava de dose pediátrica e o filtro na transcrição da fonte-mãe |

### Telas

| req. | estado | onde / o que falta |
|---|---|---|
| **T01** dados essenciais, comorbidades, medicamentos | **PARCIAL** | `avc/conteudo/paciente.ts`: `IDENTIFICACAO_P`, `BASAIS_P`, `ALERGIAS_P`, `ANTICOAGULANTE` (DOAC · varfarina · heparina · nenhum), `MEDICACOES_P`, antecedentes. **Falta:** PAM estimada como cálculo |
| **T01** anticoagulante sem última dose (A03) | **JÁ RESOLVE** | `avc/nucleo/derivacoes-d.ts`: efeito `aguarda_juizo` (commit `012f7ee`) |
| **T02** ameaças guiadas | **PARCIAL** | `avc/nucleo/ameacas-imediatas.ts` existe (não medido). Segundo a memória do projeto, A e B não têm tratamento registrável porque a fonte F-23 é limitada |
| **T02** "não sei" em toda decisão | **PARCIAL** | `NAO_SEI`: 67 ocorrências em `avc/`. **Não medido** se cada uma leva a perguntas menores |
| **T02** ações emergenciais de qualquer tela; "Preciso de ajuda"; "Paciente piorou" | **NÃO RESOLVE** | 0 arquivos em `components/avc/` e `avc/` (controle `Reperfusão`: 16) |
| **T03** NIHSS item a item, impedimentos, sem "não avaliável = zero" | **NÃO RESOLVE nos arquivos medidos** | `lib/nihss.ts` (29 linhas) só classifica um total em faixas (`faixaNihss`). `avc/conteudo/nihss.ts` consome a calculadora. Zero tratamento de item não avaliável nos dois (controle `NIHSS`: 8 e 12). O motor da calculadora não foi medido |
| **T03** direitos de uso do NIHSS | **NÃO RESOLVE** | nenhum registro nos dois arquivos |
| **T04** estados do exame (6) | **PARCIAL** | `avc/conteudo/superficie-c.ts`: `realizada`, `naoRealizada`, resultado pendente, `indisponivel`. **Falta:** "interpretado" separado e "cancelado com motivo" |
| **T05** painéis independentes IVT e EVT | **PARCIAL** | `avc/nucleo/veredito-da-trombolise.ts`, `veredito-da-trombectomia.ts`, `portao-ivt.ts`. **Falta:** força e `contextoDaFonte` por regra; conferência contra a errata |
| **T06** estados da execução (8) | **PARCIAL** | `avc/conteudo/superficie-e.ts:72-79`: `iniciada`, `realizada`, `interrompida`, `cancelada` — **4 de 8**. **Falta:** indicado, decidido, prescrito, preparado |
| **T06** concentração antes do volume (A16) | **PARCIAL** | slot F-20 *"Preparo do trombolítico"* em estado `parcial` |
| **T06** clique duplo não duplica dose (A17) | **NÃO MEDIDO** | `concluirEixo` é idempotente (`avc/nucleo/estado.ts:296`), mas é marca de eixo, não dose |
| **T07** destino | **PARCIAL** | superfície `destino`; `FATOS_OPERACIONAIS` em `superficie-g.ts`: `centro_evt_disponivel`, `transferencia_possivel`, `perfusao_automatizada_disponivel`, cada um Sim/Não/Incerto |
| **T07** ciclo de vida da transferência | **NÃO RESOLVE** | nenhum estado solicitada/contato/aceite/transporte/saída/chegada/cancelada |
| **T07** telemedicina/telestroke como ator e estado | **NÃO RESOLVE** | 0 ocorrências em `avc/` e `components/avc/`; a única do app é texto no módulo renal |
| **T08** plano até 48 h por caminho | **PARCIAL** | "24 h" em 12 arquivos de `avc/`, antitrombóticos em 11, TEV em 11, deglutição em 3; `prova-avc-fase8-pos-reperfusao.cjs`, `prova-avc-fase10-antitromboticos.cjs`. **Falta:** tarefas vinculadas a eventos; agenda |
| **Hemorragia** como caminho próprio com entrega própria | **PARCIAL** | superfícies `hic` e `hsa`; `components/avc/superficie-hemorragica.tsx` renderiza `TEMAS_HIC` (PA, reversão, antiplaquetário, PIC, cirurgia, convulsão, suporte, hemostáticos, destino) e `REVERSAO_POR_AGENTE`; slots H-01, H-02, H-10, H-11 `transcrito`. ⚠️ É **catálogo**: *"Catálogo de recomendações da diretriz de HIC. A decisão final é do profissional."* — não é caminho com decisões e entrega |

### Dados, invariantes, persistência

| req. | estado | onde / o que falta |
|---|---|---|
| Trilha sem sobrescrita (p.11) | **JÁ RESOLVE** | trilha append-only §3.1; `reabrirEixo` não apaga fatos (`avc/nucleo/estado.ts`) |
| Conflito de marcos temporais | **JÁ RESOLVE** | `conflitoDeMarcos` em `avc/nucleo/derivacoes-f.ts:639` (commit `5e6892e`) |
| Início desconhecido não vira descoberta (A04) | **JÁ RESOLVE** | rota RM exige `inicio_desconhecido` (commit `995fa56`) |
| Datas completas e fuso | **PARCIAL** | horários guardados como número (`minutosDesde(v, relogio)`); `avc/nucleo/relogio.ts:26` declara que *"formatação, fuso e apresentação não moram aqui"*. Onde moram: não medido |
| **Fechar e reabrir preserva atendimento (A13)** | **NÃO RESOLVE** | `avc/nucleo/estado.ts:4` declara que não importa `lib/flow-session`; `armazenamentoLocal` só é consumido por `lib/consentimento.ts`; `e2e/retomada-de-fluxo.spec.ts:22`: *"a sessão vive em memória"* |
| **Offline/local-first** | **NÃO RESOLVE** | única menção: `lib/guarda-de-acesso.ts:171` |
| **Conflito entre dois usuários (A18)** | **NÃO RESOLVE** | só posse de sessão anônima (`valida-posse-de-sessao.cjs`: *"a migration … não está"* aplicada) e troca de sessão. Nenhuma edição concorrente |
| encounterId e pilha de retorno (p.4, C05) | **NÃO RESOLVE** | `encounterId`/`atendimentoId`: 0 arquivos. Único retorno: `lib/module-return-handoff` para via aérea, via motor legado (`app/modulos/[id].tsx:78`) |

### Regra clínica

| req. | estado | onde / o que falta |
|---|---|---|
| COR/LOE literais por afirmação | **JÁ RESOLVE no conteúdo do AVC** | `cor:` 114 e `loe:` 113 ocorrências em `avc/conteudo/`, com `localizacao`, `verbatim`, `formulacao` (ex.: `hemorragia-intracerebral.ts`) |
| população por regra | **PARCIAL** | `populacao:` 41 ocorrências em `avc/conteudo/` |
| **força** (4 valores) | **PARCIAL** | tipo `ForcaDaAfirmacao` com os **quatro** valores e `ProcedenciaDaConduta` com `contextoDaFonte` em `core/decision-tree/types.ts:553` — **motor legado**; único consumidor `lib/escalonamento.ts`. Em `avc/conteudo/`: `forca:` **0**, `contextoDaFonte` **0** |
| status de validação médica por regra, com nome, versão e data | **NÃO RESOLVE** | slots têm estado **documental** (`transcrito`/`parcial`/`aberto`/`ponteiro`), não validação humana por regra |

### Interface e design

| req. | estado | onde / o que falta |
|---|---|---|
| Tokens p.24 | **NÃO MEDIDO** | `design-system/` existe; não confrontado com #0B141B etc. |
| SVG com procedência e licença | **PARCIAL** | 31 SVGs versionados; licença só em `assets/emoji/LICENSE-NOTO-EMOJI.txt` |
| Teto de 200 caracteres | **NÃO RESOLVE** | ver Guardas |

---

## 3 · Achados colaterais

- **`docs/avc-module.md` descreve o AVC demolido** (`avc-engine.ts`,
  `avc-protocol-screen.tsx`, `protocols/acidente_vascular_cerebral.json`). Não foi
  alterado nesta rodada; está listado como pendência.
- **O cabeçalho da fonte-mãe está desatualizado** (*"vazio de propósito"* sobre um
  arquivo de 2.618 linhas). Não alterado; pendência.
- **26 commits locais de 2026-09-12 não enviados ao GitHub.** Não enviados nesta
  rodada.
- **`auditoria/INDICE-DE-TRAVAS.md` está desatualizado em relação ao HEAD.** A
  sessão de 2026-09-12 ligou `test:avc-criticos` sem regenerar o índice. Medir
  com `scripts/indice-de-travas.cjs` **reescreve** o arquivo; a medição desta
  rodada o reescreveu, e a alteração foi revertida com `git checkout` para não
  sair do escopo. Regenerar e commitar é decisão do autor.
- **A família F-35 tem oito slots, F-35a a F-35h**, e não um F-35 único. O
  F-35c (*Hemorragia após trombólise ou anticoagulação*, parcial) é a complicação
  de sangramento da T06.
- **Worktree de outra sessão** em
  `/private/tmp/claude-501/-Users-sandrodainez/d1e55705-…/scratchpad/wt-tests`,
  mesmo HEAD, sem processo vivo medido.
