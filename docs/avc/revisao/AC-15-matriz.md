# AC-15 · mapa e matriz de provas vermelhas (versão 4 · primeiro conjunto rodado no HEAD, sem implementação)

**Branch:** `ac15-hsa` (worktree isolado), a partir de `50ccb48`. **Nenhum arquivo do projeto foi alterado.**
**Base:** C1–C4 (`docs/decisoes.md` §1 da 19ª rodada), D1 e D3 (complemento), mais os três cuidados do autor de 2026-09-15.
**Fonte:** a §4 da AHA/ASA 2023 aparece aqui só por localização (p. e322–e323, rec. 2/3/5, Figure 2). Nada é citado como literal: S-00 continua em paráfrase, com as linhas `VERBATIM: ___` em branco.

**Estado dos números de linha:** conferidos no HEAD `50ccb48` por três leituras independentes. A procedência do estudo, o `deficit_focal` e o destino da imagem foram reconferidos à mão.

---

## 1 · Consumidores atuais de `suspeita_hsa`

| consumidor | arquivo:linha | lê o quê |
|---|---|---|
| Campo (Sim / Não / Incerto → `nao_sei`), F-16, sem instância | `avc/conteudo/superficie-c.ts:864-901` | — |
| `suspeitaDeHsa` (texto da imagem) | `avc/nucleo/derivacoes-c.ts:593-655` | **última resposta** |
| `destinoDaImagem` (saída `suspeita_hsa`; nota anexa se a TC tem sangue) | `derivacoes-c.ts:544-584` | **última resposta** (`ternario`) |
| `retencaoDiagnostica` | `derivacoes-c.ts:715-748` | **histórico**: qualquer «Sim» sem correção |
| Pendência "Registrar a conclusão sobre a suspeita" | `derivacoes-c.ts:1168-1176` | **última resposta** = `nao_sei` |
| Portão da IVT: motivo `suspeita_hsa`, camada `destino`, **sem `leva`**; estado `saida_diagnostica_pendente` | `avc/nucleo/portao-ivt.ts:302-316`, `:486-488` | retenção |
| Veredito da EVT (carrega a retenção) | `avc/nucleo/veredito-da-trombectomia.ts:259` | retenção |
| Cor do card da EVT (sucesso → neutro) | `avc/nucleo/apresentacao-f.ts:521-528` | retenção |
| Síntese do caso: próximo passo "Abrir o manejo de HSA" | `avc/nucleo/sintese-do-caso.ts:215-216` | destino (**última resposta**) |
| Saída da tela G | `avc/nucleo/derivacoes-g.ts:65` | destino (**última resposta**) |
| Problemas ativos (inclui a pendência) | `avc/nucleo/problemas-ativos.ts:137` | pendência |
| «Limpar» auditado: regra genérica | `avc/nucleo/limpar-auditado.ts:25-62` | motivo restritivo do portão |
| Tela F: card do motivo, ⓘ da bula; card da EVT | `components/avc/superficie-f.tsx:1054-1066`, `:641-655` | retenção |
| Tela C: botão da saída | `components/avc/superficie-c.tsx:387-389` | destino |
| Rótulos clínicos; bula; i18n PT/ES | `avc/conteudo/rotulos-clinicos.ts:78,123`; `bula-actilyse.ts:60`; `lib/i18n/modules/avc-modulo.ts:366,1119-1126,1211-1252,1941,2605,2614` | — |

**Achado central:** o portão lê o histórico, e a tela, a pendência, o destino e a síntese leem a última resposta.

| sequência | portão | tela, destino, síntese |
|---|---|---|
| Sim → Não | **retém** | "Sem suspeita"; a saída e o próximo passo **somem** |
| Sim → Incerto | **retém** | "não retém nada" |
| Sim → Não → desfazer | **retém** (o desfazer corrige só o «Não») | "ainda não avaliada" (sem teste) |

A mesma divergência atinge `apareceQuando` (`avc/conteudo/campo.ts:421-445`): ele lê o valor atual de **um** campo. Campos de investigação que dependessem de «suspeita = Sim» sumiriam depois de «Não», com a reperfusão ainda retida.

## 2 · Onde «Incerto» hoje libera ou não retém

| lugar | arquivo:linha |
|---|---|
| a retenção só conta `valor === "sim"` | `derivacoes-c.ts:726-728` |
| o destino só arma com «Sim» | `derivacoes-c.ts:575` |
| texto e comentário "não retém nada" | `derivacoes-c.ts:589-591`, `:632`; i18n `avc-modulo.ts:1246` |
| comentário "resolve por «Não»" (desatualizado desde a 8ª rodada) | `derivacoes-c.ts:688` |
| «Incerto» vira **pendência** em vez de retenção | `derivacoes-c.ts:1168-1176` |
| «Incerto» é a saída "sem conclusão" do campo | `superficie-c.ts:1245` |
| «Limpar» sobre «Incerto» não pede "Foi engano?" (não há motivo restritivo) | `limpar-auditado.ts:40-52` |

## 3 · Fatos existentes para C1, D1 e D3

| fato | existe? | onde / observação |
|---|---|---|
| **Horário de início da cefaleia** | **não** | nenhum "cefaleia" em `avc/`. Relógios vizinhos: `hora_ultima_vez_bem`, `hora_inicio_observado` (início do **déficit**), `hora_reconhecimento` (`superficie-b.ts:159-251`). Precedente contra derivar um relógio de outro: `MEIO_DO_SONO_PROCEDENCIA.naoDerivarDe` (`superficie-b.ts:139-156`). |
| **Déficit neurológico novo** | **em parte** | `deficit_focal` "Déficit neurológico focal observado" (B, `afericao`, Sim/Não/Incerto, F-13, sem instância; `superficie-b.ts:282`). Não há campo próprio do contexto de HSA. |
| **TC sem contraste negativa** | sim | instância `estudo`, modalidade NCCT, `estudo_resultado` "Sem hemorragia intracraniana identificada" (`superficie-c.ts:583-601`). Só a NCCT oferece resultado (`MODALIDADES_COM_RESULTADO`). |
| **Qualidade da TC** | **não** | — |
| **Interpretação por neurorradiologista** | **não** | `estudo_procedencia` = Este serviço / Serviço externo / Não sei (`superficie-c.ts:542-550`). É **de onde veio**, não **quem laudou**. |
| **Punção lombar / xantocromia** | **não** | só o item da Table 8 "Punção dural nos últimos 7 dias" (`paciente.ts:634`, `superficie-d.ts:396`), que já aciona julgamento individual (D-139-3). |
| **Angio-TC com aneurisma / DSA** | **não** | a angio-TC só oferece `sitio_oclusao`; não há modalidade DSA. |
| **Conclusão clínica "HSA excluída após investigação"** | **não** | modelo mais próximo: `julgamento_individual_registrado` (D-139-3, `034db66`). Instância própria, trilha com vigente/anterior; mudança é registro novo; autoria pelo evento (AC-40, snapshot v4). Campos de texto livre com autor digitado (`neuro_parecer_autor`) são **outro padrão**, que não se copia. |
| Autoria e horário do registro | sim | `horaRegistro` pelo relógio; `nomeDoAutor` no evento; "Autoria não identificada" sem conta. |

## 4 · Usos de «HIC» que deveriam distinguir HSA confirmada

Hoje a HSA vista na imagem só entra como "Hemorragia intracraniana identificada". O valor gravado é o próprio texto (`valorDaOpcao`), já persistido em casos v4 e usado como testID em e2e.

| uso | arquivo:linha | o que nomeia hoje | conflito com a C4 |
|---|---|---|---|
| Destino da imagem `modulo: "Hemorragia intracraniana (HIC)"` | `superficie-c.ts:992` | toda hemorragia na imagem | HSA confirmada cai aqui |
| Título do caminho hemorrágico; pendências `Hemorragia intracraniana (HIC): …` | `avc/nucleo/caminho-hemorragico.ts:100,103`; `components/avc/caminho-hemorragico.tsx:59,179` | idem | sim |
| `TITULO_DO_CAMINHO.hemorragia` (plano 48 h) | `avc/conteudo/plano-48h.ts:141,227` | idem | sim |
| Próximo passo da síntese | `sintese-do-caso.ts:214` | idem | sim |
| Cabeçalho / aba `hic` | `avc-modulo-screen.tsx:97,101,1320`; `superficies.ts:206-207` | **título** "intracraniana", **escopo** "intracerebral espontânea" | dois conceitos no mesmo nome |
| `hem_tipo` = «Subaracnóidea» **dentro** do caminho HIC; só troca o catálogo | `avc/conteudo/caminho-hemorragico.ts:15-35`; `validacao-do-catalogo.ts:105-110` | subtipo dentro da HIC | HSA confirmada chamada de HIC |
| i18n ES "Hemorragia intracraneal (HIC)" | `lib/i18n/modules/avc-hemorragico.ts:27-28,103` | idem | sim |
| **Fallback silencioso:** toda saída ≠ `hemorragia_intracraniana` abre o catálogo de HSA | `components/avc/superficie-c.tsx:389`, `superficie-g.tsx:808` | — | uma saída nova abriria a HSA sem regra |

**Leem conjuntos diferentes de exames:**
- A exclusão de hemorragia e o destino da imagem leem só a NCCT (`tcsSemContraste`).
- O caminho hemorrágico, a origem da hemorragia no plano 48 h e as imagens pós-trombólise leem **todos** os estudos (`estudos()`).
- Um valor novo de resultado precisa contar como hemorragia nos **dois** grupos.

## 5 · Testes atuais que contradizem C1–C4, D1 e D3

| decisão | teste | o que afirma hoje |
|---|---|---|
| C2 | `prova-avc-criticos.cjs:785` | «Incerto» não retém (nome invertido: "⛔ retém") |
| C2 | `prova-avc-decisoes-d22-d24.cjs:129` | «Incerto» → `livre` (nome invertido) |
| C2 | `prova-avc-superficie-c.cjs:508-545`, `:547-557`, `:591-595`, `:613-615` | «Incerto» não arma saída; é "desconhecido"; abre pendência própria; exatamente 3 pendências |
| C2 | `e2e/avc-superficie-c.spec.ts:313-321` | «Incerto»: sem saída, pendência visível, "em aberto" |
| C1/D3 | `prova-avc-rodada8.cjs:72-77`; `e2e/avc-hsa-sem-atalho.spec.ts:34` | card "conteúdo pendente de validação" (deixa de ser verdade quando a condição existir) |
| C1/D3 | `prova-avc-rodada8.cjs:84-86` | `hsa-resolucao.md` com "Decisão humana: ___" em branco |
| (desenho) | `prova-avc-rodada8.cjs:81-82`; `e2e/avc-hsa-sem-atalho.spec.ts:36` | o motivo da HSA **não tem `leva`**. **Não contradiz** a C1/D3: proíbe o atalho que troca a resposta. A investigação precisa de caminho próprio, e as duas travas ficam como estão. |
| C4 | `prova-avc-superficie-c.cjs:376-382` | resultado da TC com **exatamente 2** opções |
| C4 | `prova-avc-rodada17.cjs:196-218`; `e2e/avc-rodada17.spec.ts:93-111`; `prova-avc-rodada16.cjs:211-212` | nome único "Hemorragia intracraniana (HIC)" em seis lugares, inclusive na síntese (AC-110) |
| C4 | `prova-avc-rodada16.cjs:151-152`; `prova-avc-rodada15.cjs:271-297` | «Subaracnóidea» como tipo **dentro** do caminho HIC; lista exata de `TIPOS_DE_HEMORRAGIA` |
| C4 | `prova-avc-superficie-g.cjs:474-476` | `derivacoes-g.ts` não pode mencionar `hemorragia\|hsa\|suspeita_hsa` |
| D1, D3 | — | nenhum teste (campos inexistentes) |

**Continuam válidos:**
- desfazer/correção do «Sim» libera (`criticos.cjs:781-784`);
- Sim → Não mantém a retenção (`criticos.cjs:779`, `rodada8.cjs:69-70`, `limpar-auditado.cjs:77-78`);
- «Limpar» auditado libera (`limpar-auditado.cjs:69-83`; e2e `avc-limpar-auditado.spec.ts:56-75`);
- suspeita de HSA sozinha não abre o caminho hemorrágico (`rodada15.cjs:297`);
- rótulo e procedência da D-PEND-23 (`d22-d24.cjs:109-125`).

---

## 6 · Máquina de estados da suspeita de HSA (versão 3)

**Decisões do autor (2026-09-15) aplicadas:** E1, E3, E4, E6, E7, E9 e E11. Abertas: E2, E5, E8, E10 e as novas E6b, E7b, E9b e E12 (§8).

**Invariante de consistência:** um único derivado, `estadoDaSuspeitaDeHsa(estado)`, alimenta portão, EVT, card, pendência, destino, síntese, tela G e a visibilidade dos campos de investigação. Nenhum consumidor lê a última resposta por conta própria.

**Duas fontes separadas:**
- **Suspeita (juízo clínico):** só o campo `suspeita_hsa` a ativa (E1). Déficit, NIHSS, horários e nenhum outro «Não sei» do caso a criam.
- **Evidência objetiva (exames):** vale por si. Só deixa de valer quando o próprio exame é corrigido (E11).

```
EVIDÊNCIA — independente da suspeita; «Limpar» da suspeita não a toca (E11)
  NCCT com HSA confirmada (terceira opção, E9)            → HSA_CONFIRMADA
      → barreira de segurança F-16 (IVT e EVT) + destino próprio de HSA, sem «HIC»
  legado: NCCT "Hemorragia intracraniana identificada" + hem_tipo «Subaracnóidea»
      → lido como HSA_CONFIRMADA por compatibilidade; evento persistido intacto (E9)
  PL com xantocromia presente, vigente                     → HSA_NAO_EXCLUIDA → retida
      → investigação vascular; continua valendo com a suspeita limpa (D3, E11)
  para invalidar qualquer um: correção do próprio exame

SUSPEITA
  nunca respondida                    → NAO_AVALIADA → livre
  só «Não» no histórico               → SEM_SUSPEITA → livre
  «Sim» ou «Incerto» sem correção     → ATIVA (E1)
     «Não» posterior não desativa: Sim → Não (8ª rodada; autor 2026-09-15) · Incerto → Não (E2, a confirmar)
     sai só por correção explícita do fato («Limpar» auditado incluído) ou por resolução

ATIVA → ramo (lê fatos; desconhecido nunca vale «<6 h» nem «sem déficit novo»)
  RAMO_TC = início conhecido <6 h  E  déficit novo = «Não» registrado
     + NCCT negativa + qualidade adequada = Sim + interpretação apropriada = Sim     (E10)
        → RESOLVIDA_PELA_TC → livre, por derivação, sem segundo registro          (E3)
     qualquer requisito ausente / «Não» / «Não sei» → ATIVA, pendência nomeada
  RAMO_INVESTIGACAO_ADICIONAL = ≥6 h  OU início desconhecido/não registrado
                                OU déficit novo = Sim (déficit agudo deste episódio, E4)
                                OU déficit «Não sei»/não perguntado
     NCCT negativa não resolve → pendência «investigação adicional»
     PL xantocromia ausente      → AVALIACAO_HSA_POS_PL_PENDENTE → retida (não exclui, D3)
     PL xantocromia presente     → HSA_NAO_EXCLUIDA (evidência) → retida
     PL «Não sei» / não realizada → retida
     gesto «HSA excluída após investigação»: só aparece com investigação suficiente (E6; definição em E6b)
        autoria identificável + horário (E7)   → EXCLUIDA_APOS_INVESTIGACAO → livre
        «Autoria não identificada»              → fica na trilha e NÃO libera

PRECEDÊNCIA
  barreira F-16 (qualquer hemorragia na imagem) > retenção diagnóstica; a suspeita segue anexa
  evidência positiva não é neutralizada por «Limpar», por «Não» posterior nem pela rota da TC
  conclusão «HSA excluída» com xantocromia presente vigente → E6b

«LIMPAR» E CORREÇÃO (E11)
  «Limpar» ou correção de suspeita_hsa corrige só as respostas; nenhum exame é corrigido nem neutralizado
  TC negativa e PL não diagnóstica continuam na trilha; a relevância delas depende da suspeita válida
     (suspeita registrada de novo → voltam a contar para o ramo)
  correção do registro «HSA excluída» → volta a retida
  nenhuma transição usa intervalo PL → IVT (C3)
```

**Pontos em que `unknown` pode virar «não» por acidente, cada um com prova na §7:**
1. `nao_sei` em `suspeita_hsa` tratado como ausência (é o comportamento de hoje).
2. Horário de início desconhecido ou não registrado lido como «<6 h».
3. Déficit «Incerto» ou não perguntado lido como «sem déficit novo».
4. Qualidade ou interpretação não registradas lidas como satisfeitas.
5. Xantocromia ausente lida como «HSA excluída» (cuidado 3).
6. Consumidor que ainda lê a última resposta (Sim → Não).
7. HSA confirmada não reconhecida como hemorragia por um dos grupos de leitores.
8. Evidência positiva perdida porque a suspeita foi limpa (E11).
9. «Autoria não identificada» aceita como autoria (E7).

**Achados de arquitetura, conferidos no HEAD `50ccb48`:**
- **E7: o núcleo clínico não enxerga autoria.**
  - `avc/nucleo/derivacoes-d.ts:828`: «autor ⛔ não mora aqui: vem da persistência (AC-40), pelo `fatoId`».
  - `avc/persistencia/autoria.ts:96`: «a trilha clínica não carrega autor».
  - Origens possíveis: `sessao`, `sessao_anonima`, `aparelho`, `nao_registrado` (`avc/persistencia/tipos.ts:45`).
  - Consequência: para o portão não liberar sem autoria identificável, a identidade precisa chegar ao derivado. É a E7b.
  - O julgamento do D-139-3 **não** exige autoria para liberar hoje.
- **E9: quem lê `hem_tipo`.** É campo administrativo, lido em:
  - `avc/nucleo/caminho-hemorragico.ts:85`;
  - `avc/conteudo/validacao-do-catalogo.ts:107` («Subaracnóidea» → catálogo de HSA).

  A lista exata está travada em `prova-avc-rodada15.cjs:281`. Os e2e selecionam «Intraparenquimatosa» (`avc-rodada15.spec.ts:153`, `avc-rodada16.spec.ts:37`), não «Subaracnóidea».

## 7 · Matriz de provas vermelhas (versão 3)

**Colunas:**
- **Hoje:** 🔴 falha no HEAD atual (a prova nasce vermelha); 🟢 controle já verde, que precisa continuar verde; ⚪ campo ou valor inexistente, vermelho por ausência.
- **Camada:** P = prova unitária `scripts/prova-avc-ac15-hsa.cjs`; E = e2e `e2e/avc-ac15-hsa.spec.ts`.
- **Bloqueio:** a decisão aberta de que a linha depende; «—» quando pode ser escrita já.

### A · Máquina de estados (histórico, correção, desfazer, «Incerto», «Limpar»)

| id | cenário | esperado | hoje | camada | bloqueio |
|---|---|---|---|---|---|
| A1 | nunca respondida | NAO_AVALIADA; livre; sem pendência de HSA | 🟢 | P | — |
| A2 | «Não» desde o início | SEM_SUSPEITA; livre | 🟢 | P | — |
| A3 | «Sim» | ATIVA; retida; motivo `suspeita_hsa` sem `leva` | 🟢 | P | — |
| A4 | «Incerto» desde o início | ATIVA; retida (E1) | 🔴 | P, E | — |
| A5 | Sim → Não | retida **e** card, destino, síntese e pendência mostram suspeita ativa | 🔴 (tela) | P, E | — |
| A6 | Sim → Incerto | retida; nenhum texto diz «não retém» | 🔴 | P, E | — |
| A7 | Incerto → Não, sem fato novo | retida | 🔴 | P | E2 |
| A8 | Não → Sim | retida | 🟢 | P | — |
| A9 | Sim → Não → desfazer | retida e tela coerente | 🔴 (tela) | P | — |
| A10 | correção do «Sim» (`corrigeFatoId`), sem evidência positiva | livre | 🟢 | P | — |
| A11 | «Limpar» sobre «Incerto» | pede «Foi engano?»; confirmado → NAO_AVALIADA; livre | 🔴 | P, E | — |
| A12 | «Limpar» com NCCT negativa registrada | respostas corrigidas; o fato da TC intacto (nenhuma correção aponta para ele) | 🟢 | P | — |
| A13 | «Limpar» com NCCT HSA confirmada | barreira F-16 e destino de HSA continuam (E11) | ⚪ | P | E9b |
| A14 | «Limpar» com xantocromia presente | continua retida: HSA não excluída (E11) | ⚪ | P | E12 |
| A15 | «Limpar» e depois «Sim» de novo | a NCCT negativa anterior volta a contar para o ramo | ⚪ | P | E5, E10 |
| A16 | correção do próprio exame (HSA confirmada → sem hemorragia) | o efeito da evidência cai; a suspeita segue o próprio estado | ⚪ | P | E9b |
| A17 | **cuidado 1:** déficit focal Sim + NIHSS alto + horários registrados; suspeita nunca respondida | NAO_AVALIADA; livre; nenhuma pendência de HSA | 🟢 | P | — |
| A18 | **cuidado 1:** déficit focal Sim + «Não» | livre | 🟢 | P | — |
| A19 | **E1:** «Não sei» em déficit focal, horários e itens do NIHSS; suspeita nunca respondida | não ativa a suspeita | 🟢 | P | — |
| A20 | varredura: nenhum `ternario`/`valorAtual`/`respondeuDesconhecido` de `suspeita_hsa` fora do derivado | 0 leituras diretas | 🔴 | P | — |

### B · Ramo da TC (C1, D1, E3, E4)

| id | cenário (suspeita ATIVA) | esperado | hoje | camada | bloqueio |
|---|---|---|---|---|---|
| B1 | início <6 h + déficit novo «Não» + NCCT negativa + qualidade Sim + interpretação Sim | RESOLVIDA_PELA_TC → livre, **sem** exigir o gesto de conclusão (E3) | ⚪ | P, E | E5, E10 |
| B2 | igual a B1, ≥6 h | retida; pendência «investigação adicional» | ⚪ | P | E5, E10 |
| B3 | igual a B1, exatamente 6 h | ramo adicional (texto da decisão: «<6 h» / «≥6 h») | ⚪ | P | E5, E10 |
| B4 | igual a B1, início desconhecido ou não registrado | retida | ⚪ | P | E5, E10 |
| B5 | igual a B1, déficit focal agudo Sim (E4) | ramo adicional; retida | ⚪ | P | E5, E10 |
| B6 | igual a B1, déficit «Incerto» ou não perguntado | retida | ⚪ | P | E5, E10 |
| B7 | igual a B1, qualidade «Não», «Não sei» ou ausente | retida | ⚪ | P | E10 |
| B8 | igual a B1, interpretação «Não», «Não sei» ou ausente | retida | ⚪ | P | E10 |
| B9 | igual a B1, modalidade ≠ NCCT | retida | ⚪ | P | E10 |
| B10 | início da cefaleia nunca derivado de `hora_ultima_vez_bem` nem de `hora_inicio_observado` | varredura + LKW <6 h com início da cefaleia ausente → retida | ⚪ | P | E5 |
| B11 | propriedade: toda combinação com pelo menos um requisito desconhecido | nunca livre | ⚪ | P | E5, E10 |
| B12 | B1 completa, mas a suspeita não está ativa | nada a resolver; nenhum estado RESOLVIDA | ⚪ | P | E5, E10 |

### C · Punção lombar e conclusão (D3, C3, E6, E7)

| id | cenário (ramo adicional, NCCT negativa) | esperado | hoje | camada | bloqueio |
|---|---|---|---|---|---|
| C1 | PL com xantocromia ausente | `avaliacao_hsa_pos_pl_pendente`; retida; nenhum texto «excluída» | ⚪ | P, E | E12 |
| C2 | PL com xantocromia presente | HSA não excluída; «investigação vascular»; retida | ⚪ | P | E12 |
| C3 | PL «Não sei» / não realizada | retida | ⚪ | P | E12 |
| C4 | **E6:** gesto «HSA excluída» antes de investigação suficiente (sem PL; ramo da TC; suspeita não ativa) | o gesto não é oferecido; um registro forçado não libera | ⚪ | P, E | E6b, E12 |
| C5 | registro «HSA excluída», autoria identificável + horário | livre; a trilha mostra autor e hora | ⚪ | P, E | E6b, E7b |
| C6 | **E7:** registro com «Autoria não identificada» | fica na trilha; **não** libera; a pendência diz o que falta | ⚪ | P | E7b |
| C7 | correção do registro «HSA excluída» | volta a retida | ⚪ | P | E7b |
| C8 | mudança da conclusão | novo registro; o anterior fica na trilha | ⚪ | P | E7b |
| C9 | **cuidado 3:** varredura + propriedade | xantocromia ausente nunca produz EXCLUIDA sem o registro | ⚪ | P | E12 |
| C10 | **C3:** varredura do núcleo | nenhuma regra temporal PL → IVT; nenhum limiar em horas ligado à PL | 🟢 | P | — |
| C11 | registrar PL da investigação | não marca «Punção dural nos últimos 7 dias» nem cria julgamento | ⚪ | P | E8, E12 |
| C12 | motivo da HSA no portão | continua sem `leva` que troque a resposta; a investigação tem gesto próprio | 🟢 | P, E | — |

### D · HSA confirmada na imagem (C4, E9)

| id | cenário | esperado | hoje | camada | bloqueio |
|---|---|---|---|---|---|
| D1 | as duas opções atuais de `estudo_resultado` | texto gravado idêntico byte a byte | 🟢 | P | — |
| D2 | caso v4 salvo com «Hemorragia intracraniana identificada» | a retomada lê igual | 🟢 | P | — |
| D3 | terceira opção | existe só na NCCT; passa na trava «identificada», sem palavra de veredito | ⚪ | P | E9b |
| D4 | NCCT com HSA confirmada | barreira F-16 retém IVT e EVT | ⚪ | P | E9b |
| D5 | NCCT com HSA confirmada | reconhecida como hemorragia por `exclusaoDeHemorragia`, `caminhoHemorragico`, `origemDaHemorragia` e `imagensAposInstante` | ⚪ | P | E9b |
| D6 | NCCT com HSA confirmada | destino próprio de HSA; cabeçalho, síntese, pendências e plano 48 h **sem «HIC»** | ⚪ | P, E | E9b |
| D7 | hemorragia não-HSA | segue «Hemorragia intracraniana (HIC)» como hoje | 🟢 | P | — |
| D8 | **legado:** NCCT «Hemorragia intracraniana identificada» + `hem_tipo` «Subaracnóidea» | lido como HSA confirmada; evento persistido intacto; nenhuma reescrita | ⚪ | P | — |
| D9 | **novo caso:** `hem_tipo` | não oferece «Subaracnóidea» (HSA não é subtipo de HIC) | 🔴 | P, E | — |
| D10 | saída desconhecida nas telas C e G | não cai sozinha no catálogo de HSA | 🔴 | P | — |
| D11 | ES | par es-419 da opção e dos textos novos | ⚪ | P, E | E9b |
| D12 | tela G | chega pelo destino de C sem `derivacoes-g.ts` nomear hemorragia ou HSA; se não couber, ajuste declarado da trava | ⚪ | P | E9b |
| D13 | suspeita ativa + NCCT com HSA confirmada | a barreira prevalece; a suspeita fica anexa | ⚪ | P | E9b |

### E · Tela (e2e, 375 px, com capturas)

| id | fluxo | esperado | bloqueio |
|---|---|---|---|
| E-a | Sim → Não na Imagem e na Reperfusão | motivo, saída e próximo passo coerentes (A5) | — |
| E-b | «Incerto» | motivo nomeado; «Limpar» pede «Foi engano?» (A4, A11) | — |
| E-c | «Limpar» com HSA confirmada na imagem | a barreira e o destino de HSA continuam (A13) | E9b |
| E-d | ramo <6 h completo | libera sem gesto de conclusão; nenhum «Resolver» (B1, C12) | E5, E10 |
| E-e | PL sem xantocromia → registro «HSA excluída» | pendência nomeada; sem autoria identificável não libera; com autoria libera (C1, C5, C6). ⚠️ os e2e rodam sem conta: dependem da forma de atestação (E7b) | E6b, E7b, E12 |
| E-f | HSA confirmada | cabeçalho sem «HIC», PT e ES (D6, D11) | E9b |

### F · Mutações (commit próprio, depois da implementação)

- «Incerto» fora da ativação da suspeita.
- A retenção volta a ler a última resposta.
- «Não» posterior desativa a suspeita.
- Início desconhecido tratado como <6 h.
- Déficit «Incerto» tratado como «sem déficit».
- Rota da TC sem exigir qualidade ou interpretação.
- Déficit focal abrindo a suspeita.
- Xantocromia ausente → EXCLUIDA.
- Gesto de conclusão oferecido antes de investigação suficiente.
- «Autoria não identificada» liberando.
- «Limpar» corrigindo exames.
- Evidência positiva condicionada à suspeita ativa.
- HSA confirmada fora de `imagensAposInstante`.
- Legado «Subaracnóidea» lido como HIC.
- Síntese lendo a última resposta.

**Âncoras a conferir depois:**
- `scripts/mutacoes/horario-clinico.cjs:43-48` usa a linha de `veredito-da-trombectomia.ts:259`;
- `scripts/mutacoes/superficie-g.cjs:69-73` usa `derivacoes-g.ts:65`.

A rodada só fecha com **zero** «âncora não encontrada».

---

## 8 · Decisões

### Fechadas pelo autor (2026-09-15)

| # | decisão |
|---|---|
| E1 | «Incerto» em `suspeita_hsa` é suspeita ativa e retém. Só `suspeita_hsa` ativa a suspeita; déficit, NIHSS e horários não a criam. |
| E3 | A rota <6 h resolve por derivação, sem segundo registro de conclusão, só com todos os requisitos explicitamente satisfeitos. Desconhecido em qualquer requisito não libera. |
| E4 | Déficit neurológico agudo deste episódio conta como déficit novo se a suspeita já estiver ativa. Nunca ativa a HSA sozinho. A rota <6 h fica pouco disponível no candidato típico: consequência desejada. |
| E6 | «HSA excluída após investigação» só fica disponível depois de investigação suficiente; não é atalho precoce. PL sem xantocromia não exclui automaticamente. |
| E7 | A conclusão que libera exige autoria identificável e horário. «Autoria não identificada» não libera. Sem conta, o caminho é a identificação ou atestação explícita do médico responsável. |
| E9 | HSA confirmada é terceira opção própria da NCCT, sem renomear valores persistidos. Em casos novos, HSA não é subtipo de HIC. `hem_tipo` «Subaracnóidea» legado continua legível e é interpretado como HSA, sem reescrita silenciosa. |
| E11 | Limpar ou corrigir a suspeita não altera exames. Resultado confirmatório continua valendo; para invalidá-lo, corrige-se o próprio exame. TC negativa e PL não diagnóstica ficam registradas, e a relevância delas depende da suspeita válida. |
| (Sim → Não) | Um «Não» posterior não invalida um «Sim» anterior. Só a correção explícita do fato ou a resolução pela investigação encerram a suspeita. |

### Abertas, com o texto literal da versão 2

| # | texto literal (versão 2) | leitura proposta na versão 2 | observação |
|---|---|---|---|
| **E2** | «Incerto → Não, sem fato novo, desativa?» | «não, por coerência com Sim → Não (8ª rodada); erro de registro sai por correção ou «Limpar» auditado» | A E2 trata de **Incerto → Não**, não de Sim → Não (decidido na 8ª rodada e confirmado agora). Falta confirmar se a mesma regra vale a partir de «Incerto». Bloqueia só A7. |
| **E5** | «horário de início da cefaleia: campo novo, sem derivar de LKW nem do início do déficit; onde vive (B ou bloco de HSA em C)?» | «campo novo no bloco de investigação, com «Não sei»» | Sua E3 fala em «início relevante». A C1 diz «início da cefaleia». Confirmar que o marco é o início da cefaleia. |
| **E8** | «a PL da investigação de HSA deve marcar o item da Table 8 "Punção dural nos últimos 7 dias"?» | «nada automático (C3); os dois registros ficam separados até decisão» | O item da Table 8 já aciona julgamento individual (D-139-3). |
| **E10** | «forma dos fatos de qualidade e de neurorradiologista: dois campos Sim/Não/Não sei na instância da NCCT?» | «sim, com rótulo próprio e procedência por localização (rec. 3, p. e322), sem literal» | Sua E3 diz «adequada/alta qualidade e interpretação apropriada». A rec. 3 localiza «neurorradiologista». Decidir o rótulo exibido. |

### Novas, surgidas das decisões de hoje

| # | pergunta | por que surgiu |
|---|---|---|
| **E6b** | O que é, de forma operacional, «investigação suficiente» para oferecer o gesto? Candidatos, sem escolha: (i) ramo adicional + NCCT negativa + PL com xantocromia registrada (ausente); (ii) igual, com xantocromia ausente **ou** presente; (iii) exigir registro de investigação vascular, que não existe no app (sem modalidade DSA). E com xantocromia presente vigente, a conclusão pode liberar ou a evidência prevalece? | E6 fecha o princípio, não o gatilho |
| **E7b** | Onde a autoria entra no derivado, se a trilha clínica não carrega autor (`autoria.ts:96`)? (a) o próprio registro de conclusão carrega a atestação (médico responsável identificado no gesto); (b) o derivado recebe o mapa de autoria da persistência. E quais origens contam como identificáveis: `sessao` com nome; `sessao_anonima`; `aparelho`; atestação sem conta? | E7 exige, e o núcleo hoje não vê a autoria |
| **E9b** | Rótulo da terceira opção. Proposta: «Hemorragia subaracnóidea identificada» (passa na trava «identificada», sem palavra de veredito; PT e ES) | E9 decide a opção, não o texto |
| **E12** | Forma dos fatos de PL e da conclusão. Proposta, sem decisão: instância própria de investigação de HSA, com PL realizada, xantocromia Presente / Ausente / Não sei e horário; conclusão no modelo do julgamento D-139-3 (vigente e anterior, mudança como registro novo) | nenhum dos campos existe |

**Podem ser escritas já, sem esperar decisão:**
- A1–A6, A8–A12 e A17–A20;
- C10 e C12;
- D1, D2, D7, D8, D9 e D10;
- E-a e E-b.

## 9 · Ajustes conscientes obrigatórios (entram no commit de cada bloco, nunca em silêncio)

- **Nomes de teste invertidos, reescritos junto com a troca da asserção:**
  - `prova-avc-criticos.cjs:779`: o nome diz «portão ⛔ libera», mas confere que **não** libera;
  - `prova-avc-criticos.cjs:785` e `prova-avc-decisoes-d22-d24.cjs:129`: o nome diz «Incerto ⛔ retém», mas conferem que **não** retém.
- **Comentários e textos desatualizados:**
  - `derivacoes-c.ts:688` («resolve por «Não»»);
  - `derivacoes-c.ts:589-591` e `:632`, e a i18n `avc-modulo.ts:1246` («não retém nada»).
- **`prova-avc-rodada8.cjs:84-86`:** exige «Decisão humana: ___» em branco. Muda no commit que carimbar a decisão.
- **`prova-avc-rodada15.cjs:281`:** lista exata de `TIPOS_DE_HEMORRAGIA` com «Subaracnóidea». Muda na D9: a opção sai da oferta em casos novos e continua legível no legado.
- **`prova-avc-rodada16.cjs:152`:** «Subaracnóidea» → catálogo de HSA. Continua valendo como leitura de compatibilidade (D8).
- **Princípio «a trilha clínica não carrega autor»** (`autoria.ts:96`; `derivacoes-d.ts:828`): se a E7b escolher (b), muda de forma declarada, com decisão registrada.
- **Leitores de exames em conjuntos diferentes:** a C4 fica restrita à NCCT. Se o resultado passar a outra modalidade, D5 vira condição de entrada.
- **S-00 fora de `avc/conteudo/fontes.ts`:** continua fora até o literal existir. A procedência cita só a localização.
- **Autorização da C4:** item 7 do Lote 1 (2026-09-14). Entra depois da revisão da máquina de estados.

**Ordem:**
1. Provas vermelhas do que não depende de decisão (A, C10, C12, D1–D2, D7–D10).
2. Implementação A, com `test:all` e commit.
3. D, com `test:all` e commit.
4. B e C, depois de E2, E5, E6b, E7b, E8, E10 e E12, com `test:all` e commit.
5. E (e2e com capturas).
6. F (mutações e âncoras).

Sem push.

---

## 10 · Decisões fechadas na segunda mensagem do autor (2026-09-15)

| # | decisão |
|---|---|
| E2 | «Incerto» → «Não», sem fato novo, **não** desativa. Encerra só a correção explícita do fato anterior ou a resolução pela investigação. |
| E5 | Início da cefaleia/sintoma compatível com HSA: campo próprio no **bloco de investigação de HSA da superfície C**. Nunca derivado de LKW, do início do déficit nem do relógio do AVC. É o marco da rota <6 h. |
| E8 | A PL realizada, com data e hora suficientes, **alimenta por derivação** o item existente «Punção dural nos últimos 7 dias», sem segundo campo manual. Data ou hora insuficientes → desconhecido. Nenhuma regra nova PL → IVT; «PL feita» não é contraindicação por atalho. |
| E10 | Dois fatos separados na instância da NCCT, Sim/Não/Não sei: «TC sem contraste de alta qualidade?» e «Interpretada por neurorradiologista?». Não fundir; não inferir pelo aparelho nem pela existência de laudo. |
| E7b | A conclusão nasce como fato que **já carrega a atestação de autoria**; o núcleo não consulta a persistência. Identificável: sessão autenticada com identidade nominal, ou, sem conta, atestação no gesto com nome do médico e identificação profissional (idealmente CRM/UF). Sessão anônima, aparelho e «Autoria não identificada» não liberam. O horário é o do registro. |
| E6b | Rota <6 h completa → resolve pelos fatos, sem botão. Rota adicional → o gesto só aparece depois de PL realizada **e** xantocromia **ausente**. Xantocromia presente → a conclusão de exclusão não fica disponível nem libera. Xantocromia «Não sei» ou não avaliada → pendente. Investigação vascular não é pré-condição neste lote. |
| E9b | Rótulo aprovado: «Hemorragia subaracnóidea identificada». |
| E12 | Bloco próprio de investigação de HSA, com: início da cefaleia; qualidade da NCCT; neurorradiologista; PL como exame próprio; xantocromia Presente/Ausente/Não sei (sem resposta ≠ Ausente); conclusão com atestação e horário. |

**Invariante nova, na matriz como A21:** evidência confirmatória de HSA vence um «Não» na suspeita **e** uma conclusão anterior de exclusão, até que o próprio exame confirmatório seja corrigido. São evidência confirmatória: HSA confirmada na NCCT, xantocromia presente e legado «Subaracnóidea».

| id | cenário | esperado | escrita? |
|---|---|---|---|
| A21a | legado: NCCT hemorragia + `hem_tipo` «Subaracnóidea» + suspeita «Não» | barreira F-16 retém; destino de HSA; «Não» não neutraliza | não (fora do conjunto autorizado) |
| A21b | NCCT com HSA confirmada + suspeita «Não» | idem | não (depende da terceira opção) |
| A21c | xantocromia presente + conclusão «HSA excluída» posterior | continua retida; a conclusão não libera | não (depende dos campos de E12) |
| A21d | correção do próprio exame confirmatório | o efeito da evidência cai; conclusão e suspeita seguem os próprios estados | não |

## 11 · Primeiro conjunto rodado no HEAD `50ccb48`

**Arquivos novos, sem commit:** `scripts/prova-avc-ac15-hsa.cjs` e `e2e/avc-ac15-hsa.spec.ts`. Ainda não estão em `test:all`: entram no commit das provas, com o registro que `test:pipeline` exige. Nenhum código clínico foi alterado.

**Instrumento.** Duas conferências verdes antes das linhas: com «Sim», a síntese expõe «abrir-hsa» e o portão expõe o motivo `suspeita_hsa`. Os leitores usados nas asserções funcionam; as falhas abaixo são do comportamento, não da ferramenta.

**Resultado:** prova unitária com **12 linhas vermelhas · 15 verdes**; e2e com **3 de 3 vermelhos**.

### Unitárias (`node scripts/prova-avc-ac15-hsa.cjs`)

| id | esperado | resultado | o que falhou (observado) |
|---|---|---|---|
| A0 | existe `estadoDaSuspeitaDeHsa`, com NAO_AVALIADA / SEM_SUSPEITA / ATIVA («Incerto» = ATIVA) | 🔴 | função ausente |
| A1 | nunca respondida: livre; sem motivo, pendência nem saída | 🟢 | — |
| A2 | «Não»: livre; leitura «não» | 🟢 | — |
| A3 | «Sim»: retida no portão e na EVT; motivo sem `leva` | 🟢 | — |
| A4 | «Incerto»: retida no portão e na EVT; nenhum texto «não retém» | 🔴 | portão `livre`; o texto longo da leitura diz «não retém» |
| A5 | Sim → Não: retida; a Imagem não diz «sem suspeita»; saída de HSA armada; síntese com «abrir-hsa» | 🔴 | **portão retém (ok)**; leitura `nao` «Sem suspeita de hemorragia subaracnóidea»; saída `undefined`; síntese sem ação |
| A6 | Sim → Incerto: retida; nenhum texto «não retém» | 🔴 | **retida (ok)**; o texto longo diz «não retém» |
| A7 | Incerto → Não: retida | 🔴 | `livre` |
| A8 | Não → Sim: retida | 🟢 | — |
| A9 | Sim → Não → desfazer: retida; leitura «sim»; saída e síntese coerentes | 🔴 | **retida (ok)**; leitura «ainda não avaliada»; saída `undefined` |
| A10 | correção explícita do «Sim»: livre | 🟢 | — |
| A11 | «Incerto» sustenta retenção (pede «Foi engano?»); confirmado → livre e «não respondida» | 🔴 | `campoSustentaRetencaoOuBloqueio` = false (a parte depois de limpar passa) |
| A12 | «Limpar» com NCCT negativa: nenhuma correção em fato de estudo; leitura da imagem igual; livre | 🟢 | — |
| A17 | déficit focal + NIHSS 20 + horários, suspeita nunca respondida: livre, nada de HSA | 🟢 | — |
| A18 | déficit focal + «Não»: livre | 🟢 | — |
| A19 | «Não sei» em déficit, horários e item do NIHSS: livre, nada de HSA | 🟢 | — |
| A20 | nenhuma leitura direta de `suspeita_hsa` fora do derivado | 🔴 | `derivacoes-c.ts`: 5 leituras diretas (e o derivado não existe) |
| C10 | nenhuma linha liga punção lombar a limiar de tempo | 🟢 | — (heurística por texto; não há PL no núcleo hoje) |
| C12 | motivo da HSA sem `leva` | 🟢 | — |
| D1 | as duas opções atuais: rótulo, valor gravado e oferta intactos | 🟢 | — |
| D2 | caso com «Hemorragia intracraniana identificada» reconstruído pelo log: valor e barreira iguais | 🟢 | — |
| D7 | hemorragia intraparenquimatosa: «abrir-hic» com «(HIC)»; pendências «(HIC)» | 🟢 | — |
| D8 | legado «Subaracnóidea»: barreira retém; dado intacto; nenhum texto «HIC» | 🔴 | **barreira e dado ok**; «Abrir o manejo de Hemorragia intracraniana (HIC)», pendência «Hemorragia intracraniana (HIC): registrar o anticoagulante…», destino «Hemorragia intracraniana (HIC)» |
| D9 | `hem_tipo` não oferece «Subaracnóidea» em caso novo | 🔴 | opções incluem «Subaracnóidea» |
| D10 | telas C e G sem queda silenciosa no catálogo de HSA | 🔴 | ternário «≠ `hemorragia_intracraniana` → `hsa`» nas duas |
| D11 | «Hemorragia subaracnóidea identificada» oferecida, com par es-419 | 🔴 | opção ausente; sem par |

### e2e (`npx playwright test e2e/avc-ac15-hsa.spec.ts --project=dist`, 375 px)

| id | esperado | resultado | o que falhou (observado) |
|---|---|---|---|
| E-a | Sim → Não: saída de HSA visível na Imagem; leitura sem «sem suspeita»; motivo visível na Reperfusão | 🔴 | `avc-destino-suspeita_hsa` não existe. O teste para na primeira asserção: leitura e Reperfusão **não foram medidas** nesta execução (a prova unitária A5 mede as duas) |
| E-b (retenção) | «Incerto»: motivo `avc-f-portao-motivo-suspeita_hsa` visível | 🔴 | motivo não existe |
| E-b (Limpar) | «Limpar» sobre «Incerto» abre «Foi engano?» | 🔴 | diálogo não aparece |

### Duas perguntas que a execução levantou

| # | pergunta | por quê |
|---|---|---|
| **E13** | Com «Incerto» (ATIVA), a Imagem arma a **saída de HSA** e a síntese mostra «Abrir o manejo de hemorragia subaracnóidea», como com «Sim»? Ou só a retenção e uma pendência nomeada? | A E1 decide a retenção, não a saída. Hoje só «Sim» arma a saída. A4 e E-b medem só retenção e texto, sem afirmar a saída. |
| **E14** | Xantocromia presente: a E6b diz «HSA confirmada»; a D3 diz «HSA não excluída; seguir investigação vascular». É estado de **confirmação** (barreira F-16 e caminho de HSA, como a NCCT com HSA) ou de **não excluída** (retenção diagnóstica, sem abrir o caminho)? | Os dois retêm e bloqueiam a conclusão, mas mudam o destino e o nome na tela. Afeta A14, A21c e C2. |

## 12 · E13 e E14 fechadas (autor, 2026-09-15)

| # | decisão |
|---|---|
| **E13** | «Incerto» = suspeita ativa com investigação pendente. Retém a reperfusão e fica visível de forma coerente na Imagem, nas pendências e na síntese, com linguagem diagnóstica (ex.: «Suspeita de HSA ativa — investigação pendente» / «Continuar investigação de HSA»). **Não** é HSA confirmada e não abre direto o catálogo de manejo. Separar duas saídas hoje misturadas: **suspeita ativa** («Sim» ou «Incerto») → fluxo de investigação; **HSA confirmada** → fluxo de manejo. Com Sim → Não sem correção, a suspeita continua ativa e a interface não some, mas também não mostra o catálogo terapêutico. |
| **E14** | Xantocromia presente = **evidência confirmatória de HSA** (AHA/ASA 2023, Figure 2, p. e323, em localização): retém a reperfusão, segue o caminho próprio de HSA e mantém a investigação vascular da fonte (CTA/DSA). «HSA excluída após investigação» não é permitida enquanto o exame positivo valer; só a correção do próprio exame muda isso. Xantocromia ausente não exclui HSA automaticamente. **Revoga em parte a D3** no ponto «xantocromia presente → HSA não excluída». |

**Invariante do bloco A (autor):** evidência confirmatória de HSA domina o estado subjetivo da suspeita. São evidência confirmatória: HSA na NCCT, xantocromia positiva e legado válido «Subaracnóidea». Nem «Não», nem «Limpar», nem conclusão anterior de exclusão a neutralizam sem correção explícita do exame.

**Efeito nas provas já escritas (antes do commit):**
- **A5 e A9 mudam de expectativa.** Antes: a saída de HSA continua armada e a síntese mantém «abrir-hsa». Agora: a suspeita fica visível **como investigação**, e nenhum texto oferece «manejo de hemorragia subaracnóidea».
- **A3b (nova):** com «Sim», o mesmo critério de A5 e A9. Hoje fica vermelha: a síntese diz «Abrir o manejo de hemorragia subaracnóidea» e não há pendência.
- **A4 e A6 ganham o mesmo critério.** Para «Sim» e «Incerto», o critério inclui pendência nomeada de investigação. É leitura de coerência de interface da E13, não regra clínica.
- **A21a (nova, bloco A):** legado «Subaracnóidea» + «Não» e + «Limpar». A barreira continua, nenhum «HIC» aparece, e o exame não é corrigido.
- **E-a:** passa a exigir a suspeita visível como investigação na Imagem, sem «manejo».

**Ajustes conscientes que o bloco A vai exigir, pela E13:**
- `e2e/avc-superficie-c.spec.ts:298-308` (a suspeita arma a saída de HSA);
- `e2e/avc-procedencia-fora-do-card.spec.ts:240-250` («Sim» abre `avc-destino-abrir-suspeita_hsa` e o catálogo);
- `prova-avc-superficie-c.cjs:508-557` (saídas e frases da suspeita);
- `sintese-do-caso.ts:215-216` («Abrir o manejo de hemorragia subaracnóidea» para suspeita).

## 13 · Registro de prova vermelha em commit: o projeto não tem mecanismo

Conferido no HEAD `50ccb48`:
- nenhum `test.fail`, `test.fixme` ou marca de «falha esperada» em `scripts/`, `e2e/`, `package.json`, `playwright.config.ts` ou `docs/`;
- os commits que nasceram de prova vermelha trouxeram a prova **junto** com a correção (AC-13 itens 1–7, D-139, AC-03r);
- `ISENTOS` em `scripts/valida-pipeline.cjs` só dispensa um script `test:*` de entrar em `test:all`, com motivo. Não cobre um e2e, que `test:e2e` roda de qualquer jeito;
- a D-PEND-17 dispensa `test:all` só em commit exclusivo de `docs/`.

A escolha foi pedida ao autor antes de registrar no pipeline.

## 14 · Estado commitado das provas: vermelhas declaradas (autor, 2026-09-15)

**Mecanismo escolhido pelo autor.** O projeto não tinha como registrar prova vermelha antes da correção (§13).

**Prova unitária** `scripts/prova-avc-ac15-hsa.cjs` (`npm run test:avc-ac15-hsa`, dentro do `test:all`):
- `VERMELHAS_DECLARADAS` lista cada linha que deve estar vermelha, com o bloco que a torna verde.
- A prova passa só quando as vermelhas observadas são **exatamente** as declaradas. Uma vermelha fora da lista reprova; uma linha declarada que ficou verde também reprova, com a mensagem «remova da lista».
- Sanidade medida antes do commit: uma cópia com uma linha verde declarada e outra com uma vermelha retirada da lista saem as duas com código 1.

**e2e** `e2e/avc-ac15-hsa.spec.ts`: `test.fail(true, …)` em cada teste. Enquanto o teste falha, a suíte passa; se ele passar antes da remoção da marca, a suíte reprova. Cada falha foi conferida na asserção pretendida (E-a: leitura «sem suspeita»; E-b: motivo ausente; E-b: diálogo ausente).

**Mudanças de expectativa depois da §11, antes do commit:**
- A3b nova, e A4, A5, A6 e A9 com o critério de investigação da E13 (§12);
- A21a nova: o derivado põe a evidência confirmatória acima da suspeita (HSA_CONFIRMADA). O nome «HIC» do legado fica na D8, bloco D;
- a conferência inicial da síntese pede só uma ação existente, porque o id «abrir-hsa» muda pela E13.

**No HEAD, antes de qualquer código clínico:** 15 linhas verdes, 14 vermelhas declaradas, 0 divergências; 3 e2e vermelhos marcados.

| bloco | linhas vermelhas declaradas |
|---|---|
| A · máquina de estados | A0, A3b, A4, A5, A6, A7, A9, A11, A20, A21a; e2e E-a, E-b (2) |
| D · HSA confirmada na imagem (C4) | D8, D9, D10, D11 |

**Verdes que precisam continuar verdes:** A1, A2, A3, A8, A10, A12, A17, A18, A19, C10, C12, D1, D2, D7.

**Marcas temporárias (autor, 2026-09-15):** cada linha de `VERMELHAS_DECLARADAS` e cada `test.fail` saem **no mesmo commit** que implementa o comportamento correspondente. Nenhuma marca sobrevive ao bloco que a corrige; a própria prova reprova se uma linha declarada ficar verde.

**Mudança de rumo do autor (2026-09-15), depois deste commit:** o app é **apoio à decisão médica**, sem submissão à ANVISA por ora. O AC-15 fica restrito aos blocos A e D. Os blocos B e C (resolução da suspeita por TC <6 h, punção lombar e conclusão com atestação) ficam **adiados**, e o processo passa a ser proporcional: `test:all` completo por bloco, sem novas vermelhas declaradas.

**Próximo passo autorizado:** bloco A só, a partir do derivado único `estadoDaSuspeitaDeHsa`, com todos os consumidores lendo o derivado. Sem PL, sem campos novos de TC e sem a classificação C4 no mesmo commit. Revisão do autor antes do bloco dos novos campos.
