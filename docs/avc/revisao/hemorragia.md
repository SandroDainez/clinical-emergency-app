# Caminho hemorrágico — pacote de revisão (A07 · RQ-HEM-01..05)

**Decisão do autor:** Sandro Dainez, 13/09/2026 (`docs/decisoes.md`, 15ª rodada).

**Estado:** estrutura implementada; **toda conduta está pendente de validação médica**.
- Nenhuma dose, alvo, limiar ou indicação foi criada.
- O caminho só registra estado: tipo, anticoagulante em uso (campo do Paciente) e marcos da neurocirurgia.
- Cada conduta aparece como "conteúdo pendente de validação", com a fonte candidata abaixo.

## Regras de estrutura

- **Abertura:** a saída "hemorragia" da imagem (T04: TC sem contraste com "Hemorragia intracraniana identificada") abre o caminho.
  - A suspeita de HSA sem hemorragia na imagem não abre.
- **Superfícies do caminho:** estabilização, neurológico, imagem e destino (com o plano até 48 h).
  - As demais saem da barra de abas.
  - A superfície aberta por um botão (por exemplo, Paciente para o anticoagulante) aparece enquanto está aberta.
- **Bloqueio:** trombólise e trombectomia isquêmicas ficam bloqueadas, com o motivo dito.
  - O portão da IVT e a classe da EVT já retinham pela imagem (`barreiraDeReperfusao`); o caminho diz isso em palavra.
- **Complicação depois de trombólise iniciada:** leva ao mesmo caminho.
  - Com infusão em curso, o caminho pede o registro da interrupção.
  - O app **não grava a interrupção sozinho**: registrar o que a equipe não fez seria inventar um evento.
  - O registro fica na trilha da trombólise ("Interrompida", com horário), e a exposição é preservada.
- **Neurocirurgia:** marcos com os dois horários, como a teleconsulta. O parecer exige texto e autor.

## Condutas — fonte candidata por item

As fontes estão em `protocols/fontes-verbatim/`. Os arquivos da HIC e da HSA estão transcritos, com a conferência clínica do autor pendente. O de 2017 está transcrito e conferido.

### `reversao_anticoagulante`
- **Conduta:** reversão de anticoagulante. Conteúdo pendente de validação.
- **Fontes candidatas:**
  - **AHA/ASA 2022 (HIC)**, `aha-asa-2022-hic.md`: §5.2.1 recs. 1–12, p. e300 (slot H-02); figura 2, p. e301 (doses em figura, não recomendação graduada).
  - **AHA/ASA 2023 (HSA)**, `aha-asa-2023-hsa.md`: §6 rec. 2, p. e326 (slot S-01).
  - **AHA/ASA 2017 (hemorragia pós-alteplase)**, `aha-asa-2017-hemorragia-pos-alteplase.md`: §3.3 (tabela 4), §3.4, §3.5, p. e351. Documento de sugestões sem COR/LOE, só alteplase.
- **Limite do registro:** o campo do Paciente não separa DOAC em dabigatrana e anti-Xa, nem heparina em HNF e HBPM. As fontes separam.

### `alvo_pressorico`
- **Conduta:** alvo pressórico. Conteúdo pendente de validação.
- **Fontes candidatas:**
  - **AHA/ASA 2022 (HIC):** §5.1 recs. 1–5, p. e297–e298 (slot H-01).
  - **AHA/ASA 2023 (HSA):** §6 rec. 1, p. e326 (slot S-01). O arquivo registra que a diretriz não dá alvo numérico.
  - **AHA/ASA 2017 (hemorragia pós-alteplase):** §3.6, p. e354. Sem alvo numérico.

### `indicacao_cirurgica`
- **Conduta:** indicação neurocirúrgica. Conteúdo pendente de validação.
- **Fontes candidatas:**
  - **AHA/ASA 2022 (HIC):**
    - §6.1.1, p. e318; §6.1.3, p. e322; §6.2, p. e324 (H-10);
    - §6.1.4, p. e323 (H-11);
    - §6.1.2, p. e320, e figura 3, p. e321 (H-12).
  - **AHA/ASA 2023 (HSA):** §7, p. e327 (S-02); hidrocefalia em S-05.
  - **AHA/ASA 2017 (hemorragia pós-alteplase):** §3.7, p. e354.

## Uma fonte de verdade (AC-95, 16ª rodada)

**Decisão do autor (13/09/2026):** o caminho hemorrágico consome o conteúdo do catálogo HIC/HSA, com a força e a fonte que o catálogo declara. Nenhuma conduta tem dois estados de validação.

- **Função única:** `avc/conteudo/validacao-do-catalogo.ts`, usada pelo catálogo (`superficie-hemorragica.tsx`) e pelo caminho (`caminho-hemorragico.tsx`).
- **Contrato de uma regra (`docs/spec-avc.md` §12):** força e `contextoDaFonte` declarados pelo que o item já tem.
  - COR + LOE de diretriz → força `recomendacao_formal`.
  - `contextoDaFonte` = população declarada no item.
- **Vão para "conteúdo pendente de validação" nos dois lugares:**
  - todo item sem população: 31 de 41 na HIC, 17 de 25 na HSA;
  - as seis reversões por agente, porque a dose vem da figura 2 e não é recomendação graduada.
- **Itens de cada conduta:**
  - reversão: HIC tema "reversão" + reversão por agente; HSA "reversão";
  - alvo pressórico: HIC tema "pressão arterial"; HSA "pa_curta";
  - indicação cirúrgica: HIC tema "cirurgia"; HSA tema "aneurisma".
- **Tipo registrado:**
  - intraparenquimatosa → HIC;
  - subaracnóidea → HSA;
  - subdural ou outra → sem item no catálogo (pendente);
  - não registrado ou não sei → os dois.
- **Na tela:** fonte e texto literal ficam no ⓘ.
- **Substitui a seção abaixo.** Ela registrava o estado da 15ª rodada, com o catálogo mostrando doses e o caminho mostrando "pendente".

## Relação com o catálogo existente (15ª rodada — substituída pela seção acima)

- **O que o catálogo mostra hoje:** a superfície `hic`/`hsa` (`components/avc/superficie-hemorragica.tsx`) exibe recomendações transcritas, com números (doses do esquema de reversão, alvo pressórico). Continua acessível pelo cartão da Imagem.
- **Por que não foi removido:** ele é transcrição, com conferência do autor pendente. O caminho hemorrágico não o repete: aponta as condutas como pendentes.
- **O que o autor decide:** se o catálogo também passa a "pendente de validação" (achado da 15ª rodada).
- **Conflito já registrado:** `f35c-trombolise-contrato.md` ainda diz "nada transcrito", mas o arquivo de 2017 está transcrito e conferido.
