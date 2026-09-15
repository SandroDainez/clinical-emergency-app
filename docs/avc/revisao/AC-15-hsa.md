# AC-15 · Suspeita de HSA retendo a reperfusão isquêmica

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13
**Origem:** `docs/avc/matriz-regras.md:220-226` (RQ-REG-HSA) · `docs/avc/auditoria-vs-spec.md:46` (AC-15)

## 1 · Pergunta clínica

Num adulto candidato à reperfusão isquêmica cuja imagem não mostra hemorragia, a **suspeita clínica** de hemorragia subaracnóidea deve reter a **execução** da trombólise e da trombectomia? E HSA **vista na imagem** deve abrir um caminho próprio, distinto da hemorragia intracerebral?

## 2 · População

Adulto (portão AC-03) candidato a IVT ou EVT.

## 3 · Cenário

- O médico registra a suspeita clínica de HSA.
- A imagem registrada é "Sem hemorragia intracraniana identificada", ou ainda não há resultado.

## 4 · Comportamento atual do código

| o quê | onde |
|---|---|
| Campo `suspeita_hsa`, com opções Sim / Não / Incerto e `fonte: "F-16"` | `avc/conteudo/superficie-c.ts:864` |
| Nota do próprio campo: a fonte "não define conduta para esta suspeita" | `avc/conteudo/superficie-c.ts:894` |
| Leitura da suspeita como verdadeira | `avc/nucleo/derivacoes-c.ts:546` |
| "Incerto" vira resposta sem retenção | `avc/nucleo/derivacoes-c.ts:609` |
| `retencaoDiagnostica`: com "Sim", fica **retida** | `avc/nucleo/derivacoes-c.ts:704` |
| Portão da IVT lê a retenção → `saida_diagnostica_pendente`, abaixo de segurança, COR 3 e não sustentada | `avc/nucleo/portao-ivt.ts:291` |
| Veredito da EVT carrega a mesma retenção | `avc/nucleo/veredito-da-trombectomia.ts` (`retencaoDiagnostica`) |
| Prova: "Incerto" não retém | `scripts/prova-avc-criticos.cjs:772` |

**HSA confirmada na imagem:**
- O resultado da TC só tem duas opções (`OPCOES_RESULTADO_TC`, em `superficie-c.ts`).
- HSA vista na imagem entra como "Hemorragia intracraniana identificada": cai na barreira de classe da F-16 e no destino de hemorragia intracerebral. **Não existe regra própria de HSA confirmada.**

**Cobertura:** nenhum e2e verifica a retenção na tela de Reperfusão. A busca por `saida_diagnostica` e `suspeita_hsa` fora de `e2e/avc-superficie-c.spec.ts` retorna 0.

## 5 · Critério proposto — opções para decisão, sem escolha

| opção | comportamento |
|---|---|
| **A · atual** | Suspeita "Sim" retém a execução de IVT e EVT até ser respondida "Não" ou corrigida; "Incerto" não retém e abre pendência nomeada. |
| **B** | A suspeita é registrada e mostrada, mas não retém a execução; a exclusão de hemorragia continua sendo só da imagem. |
| **C** | Opção A, mais uma saída própria para HSA **vista na imagem**, com conteúdo a transcrever da fonte de HSA. |

## 6 · Exceções já vigentes

- Hemorragia identificada na imagem retém a classe pela F-16, qualquer que seja a opção.
- Bloqueio de segurança prevalece sobre a retenção diagnóstica (ordem em `portao-ivt.ts`).

## 7 · Dados necessários

- Registro da suspeita clínica (existe).
- Resultado da imagem (existe, sem distinguir HSA).
- Opção C: um campo de resultado de imagem que distinga HSA (não existe).

## 8 · Conduta diante de "não sei"

Hoje "Incerto" é gravado como `nao_sei`, não retém e abre a pendência "Registrar a conclusão sobre a suspeita". A decisão deve dizer se isso se mantém.

## 9 · Fonte primária

**AHA/ASA 2026, §3.2 *Initial, Vascular, and Multimodal Imaging Approaches*, rec. 1 · COR 1 · LOE A.**
- Localização: PDF p. 26 = página impressa **e341**.
- Transcrição: `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md:2204-2207`.
- Trecho literal (conferido no PDF): *"exclude intracranial hemorrhage before initiating reperfusion interventions"*.

**AHA/ASA 2023, HSA aneurismática.**
- A busca no PDF inteiro por `thromboly|alteplase|tenecteplase|reperfusion|thrombectomy|acute ischemic stroke` não encontrou recomendação sobre suspeita de HSA em candidato à reperfusão isquêmica.
- As duas ocorrências (PDF p. 35 e 38) tratam de outros assuntos.
- A §4 (diagnóstico) **não foi transcrita** (`aha-asa-2023-hsa.md:309-311`).

**⚠️ A fonte não confirma o comportamento atual.**
- Ela manda excluir hemorragia **por imagem** antes da reperfusão.
- Ela **não** diz nada sobre reter a execução por suspeita clínica com imagem sem hemorragia.
- A própria nota do campo e `auditoria/ESPECIFICACAO-AVC.md:512-513` reconhecem isso.

## 10 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | Imagem de emergência para excluir hemorragia intracraniana antes de iniciar reperfusão (§3.2 rec. 1, COR 1, LOE A). |
| **Adaptação local** | A suspeita clínica de HSA retém a **execução** da IVT e da EVT. É decisão do autor de 2026-09-12 (red-team O3), registrada em `auditoria/ESPECIFICACAO-AVC.md:509-519`, sem nome e sem versão. O destino único vem do PD-21 (`auditoria/DECISOES-DE-PRODUTO.md:958`). |
| **Escolha de interface** | "Incerto" não retém e vira pendência nomeada; o botão "Resolver" leva ao campo; a retenção aparece como "Saída diagnóstica armada". |

## 11 · Decisão humana

**Decisão humana:** Dr. Sandro Dainez, por escrito, 2026-09-15 — `docs/decisoes.md`, seção «AC-15 · suspeita de HSA — decisões de 2026-09-15 e encerramento». Implementados os blocos A e D; a resolução da suspeita por fatos de investigação (blocos B e C) ficou adiada com a mudança para apoio à decisão.
