# D-22 — o que foi deletado, e para onde foi cada coisa

**SHA imediatamente anterior à deleção: `2dc5620`.**
Tudo abaixo está recuperável com `git show 2dc5620:<arquivo>`. O ponto deste
documento é que **ninguém procura no git o que não sabe que existiu** — a
pergunta real, daqui a seis meses, será *"não tinha um texto sobre MgSO₄ na
anafilaxia?"*, e a resposta precisa estar aqui.

---

## Por que foram deletados

Os oito engines eram **órfãos de RENDER**: registrados em
`clinical-modules.ts`, importados, compilando e testados — e nenhuma tela os
executava. `components/clinical-app.tsx` decide por `protocolId` e devolve um
componente que ignora o engine registrado, renderizando a árvore de decisão.

A auditoria corrigiu conteúdo clínico dentro deles **vinte vezes** sem saber
disso. O defeito só apareceu por acidente, ao tentar mostrar um número de
cronômetro na tela.

---

## Os 31 arquivos

### Os 8 engines (~18.300 linhas)

| Arquivo | Linhas | A tela usa, no lugar dele |
|---|---|---|
| `sepsis-engine.ts` | 6.566 | `sepsis-decision-tree.ts` |
| `anafilaxia-engine.ts` | 2.991 | `anaphylaxis-decision-tree.ts` |
| `ventilation-engine.ts` | 2.164 | `ventilation-decision-tree.ts` |
| `dka-hhs-engine.ts` | 1.984 | `dka-hhs-decision-tree.ts` |
| `avc-engine.ts` | 1.645 | `avc-decision-tree.ts` |
| `eap-engine.ts` | 1.349 | `eap-decision-tree.ts` |
| `coronary-syndromes-engine.ts` | 1.239 | `coronary-decision-tree.ts` |
| `sepsis-antibiotic-engine.ts` | 364 | (órfão de import — nunca teve tela) |

### Os 16 órfãos de dependência

Ficaram inalcançáveis **por consequência**, não por decisão. A lista veio do
grafo de imports a partir de `app/`, não de leitura.

`avc/`: `audit.ts` · `calculators.ts` · `eligibility.ts` · `persistence.ts` ·
`prescriptions.ts` · `mocks.ts`
`coronary/`: `audit.ts` · `biomarkers.ts` · `calculators.ts` ·
`classification.ts` · `domain.ts` · `ecg.ts` · `mocks.ts` · `persistence.ts` ·
`prescriptions.ts` · `protocol-config.ts` · `scores.ts`
`lib/ventilation-case-storage.ts`

#### ⚠️ `coronary/domain.ts` — a nota que evita reconstruir a análise

Quem ler o histórico vai ver um arquivo com **23 consumidores** sendo
apagado, e vai desconfiar. A razão: **os 23 consumidores também morreram.**
Eram os outros arquivos de `coronary/`, que só o engine deletado alcançava.

Contar referências sem perguntar se o referente sobrevive dá exatamente a
resposta errada — foi o que quase me fez preservar 10 arquivos mortos. Quem
resolveu foi o grafo de alcançabilidade, não o `grep`.

### Os 7 JSON de protocolo

`anafilaxia` · `edema_agudo_pulmao` · `ventilacao_mecanica` · `sepse_adulto` ·
`sepse_antimicrobianos` · `acidente_vascular_cerebral` ·
`sindromes_coronarianas` · `cetoacidose_hiperosmolar` — todos importados
apenas pelos engines deletados.

### Mais dois, achados durante a execução

- **`app/(tabs)/sepse.tsx`** — rota órfã que instanciava `<ClinicalApp
  engine={sepsisEngine}/>`. Não era linkada de lugar nenhum; mesmo alcançada
  por URL, o `ClinicalApp` devolveria a árvore.
- **`avc/domain 2.ts`** — décima duplicata `" 2"`, cópia byte-idêntica de
  21/mai ao lado de um arquivo **vivo**. Achada pela própria trava de
  alcançabilidade, não por leitura.

---

## O que SOBREVIVEU, e por quê

| Arquivo | Por quê |
|---|---|
| `avc/protocol-config.ts` | exporta `NIHSS_ITEMS` |
| `avc/nihss.ts` | consome o anterior e alimenta as **Calculadoras** (vivo) |
| `avc/domain.ts` | tipos usados por `protocol-config.ts` |
| `coronary/mocks.ts` | (verificado: sem dependência dos deletados) |

**A restrição foi verificada duas vezes**, por grep e pelo grafo: apagar
`avc-engine.ts` **não pode arrastar o diretório `avc/`**.

---

## PARA ONDE FOI CADA COISA — Blocos 1 a 3

O conteúdo que valia salvar foi portado ANTES da deleção, em três blocos.
Quem procurar por um texto específico acha aqui o destino dele.

### Bloco 1 — lacuna real e defeito de alcance

| O que era | Onde está agora |
|---|---|
| Alergia a beta-lactâmico por foco | `lib/alergia-beta-lactamico.ts` → nó `foco_atb` da Sepse |
| Precauções de isolamento | `lib/precaucoes-isolamento.ts` → nó de entrada da Sepse |
| Alarmes do ventilador | `lib/alarmes-ventilador.ts` → nó de ajuste inicial da Ventilação |
| Nitrato × PDE-5 (com a janela 24/48 h) | `lib/nitrato-contraindicacoes.ts` → EAP, Coronárias, Vasoativas |
| Contraindicações da VNI | `lib/vni-contraindicacoes.ts` → EAP |
| Teto e contraindicações da morfina | `lib/morfina-dispneia.ts` → EAP, Coronárias |
| **MgSO₄ e ipratrópio na anafilaxia** | `lib/broncoespasmo-anafilaxia.ts` → Anafilaxia |

### Bloco 2 — cenários e itens de EAP/Anafilaxia/Sepse

| O que era | Onde está agora |
|---|---|
| Cenário de acidose metabólica grave | nó `pat_acidose` da Ventilação |
| Cenário de fraqueza neuromuscular | nó `pat_neuromuscular` da Ventilação |
| Hipoxêmico sem SDRA confirmada | **dentro** do nó `pat_sara` (não virou ramo — ver "recusados") |
| Posição no EAP (sentado 60–90°) | nó de suporte inicial do EAP |
| Nitroglicerina sublingual | nó do vasodilatador do EAP |
| Preparo/diluição da NTG | **ponteiro** para Vasoativas (não copiado) |
| Furosemida na DRC (2,5× a dose oral) | nó do vasodilatador do EAP |
| Noradrenalina: acesso central | nó do choque cardiogênico do EAP |
| Síndrome de Kounis | nó da 1ª dose de adrenalina da Anafilaxia |
| Betabloqueador → glucagon antecipado | nó da 1ª dose de adrenalina da Anafilaxia |

### Bloco 3 — refinamento

| O que era | Onde está agora |
|---|---|
| Equivalência S/F ↔ P/F (dois cortes) | nó `pat_sara` da Ventilação |
| VNI na DPOC (efeitos por cenário) | nó do EAP / VNI |
| Pressão resistiva × resistência | nó `pressao_alta` da Ventilação |
| Periodicidade da Pplat (4–8 h) | nó de segurança da Ventilação |
| Modos ventilatórios (SIMV/PRVC/PC-AC/CPAP) | nó de ajuste inicial |
| Corticoides equivalentes (hidrocortisona/dexametasona) | Anafilaxia |
| qSOFA e CURB-65 — o que o escore NÃO decide | `lib/escores-limites.ts` → Calculadoras |

---

## OS 7 RECUSADOS — e é a parte que mais parece "conteúdo perdido"

**Nenhum destes foi portado, e a recusa é o resultado.** Se alguém procurar
por eles e não achar, a razão está aqui.

| Item | Por que NÃO entrou |
|---|---|
| **`SpO₂ < 92%` = Grau III (Anafilaxia)** | **Número inventado.** Ring e Messmer é sindrômica por construção — a escala não tem número nenhum, e isso é escolha. O limiar foi acrescentado dentro dela com a escala citada corretamente (R-41). |
| **Meta de FC < 110 no EAP** | **Falso amigo.** O número é do RACE II, controle *lenient* em FA CRÔNICA AMBULATORIAL. Nenhuma fonte dá alvo de frequência para descompensação aguda (R-36). Virou o **veto de BB/BCC IV**, que era o que faltava. |
| **3 pares de hemocultura com 30 min (endocardite)** | **Critério APOSENTADO.** Retirado no Duke-ISCVID 2023; o atual são 2 ou mais amostras separadas, que a Sepse já coleta. Portar faria colher um terceiro par sem ganho. |
| **Resistência "até 10 cmH₂O/L/s"** | **Erro de unidade.** O 10 pertence à *pressão resistiva* (Ppico−Pplatô, em cmH₂O); a *resistência* raramente passa de 15 cmH₂O/L/s. Escritas as duas, com a distinção. |
| **NNT 4 (DPOC) e NNT 8 (EAP) da VNI** | **Não correspondem a nada.** A fonte dá 2,4 / 6,3 / 8,3 / 20 conforme desfecho e cenário. Escritos os efeitos com a condição junto. |
| **Dexametasona máx 16 mg (Anafilaxia)** | Equivalência real é **10 mg**. Corrigido ao portar. |
| **Betabloqueador como fator de risco de reação BIFÁSICA** | A associação forte é com **refratariedade** (OR ≈ 2,5), não com bifásica. Mudou de eixo e de lugar no módulo. |

**Sete de quinze itens conferidos contra fonte estavam errados** — e a lista
original marcava os quinze como "vale portar". Ela foi feita lendo o engine
morto, e **o engine morto descreve o que ele faz, não o que falta** (R-35).

---

## Também saiu: UI que não podia servir ninguém

A faixa de cronômetro em `acls-protocol-screen.tsx`, alimentada por
`activeTimer`, mais o campo `TimerState.label`. Construída no commit do
cronômetro e **desligada para o único módulo que a alcança** (o PCR, que já
tem metrônomo com rótulo próprio em `acls/screen-model.ts`). Os outros
módulos renderizam por árvore e nunca passam por aquela tela.

A faixa que **funciona** é outra: `acls-decision-flow-screen.tsx`, alimentada
por `engine.getPrazos()` — é a que fez o cronômetro das Convulsões aparecer.

---

## Travas: 40 → 38

Ver `INDICE-DE-TRAVAS.md`, seção de cobertura por módulo. Em resumo:
`test-cronometros` foi **removida** (vigiava mecanismo que só existia no
morto), e `test-avc-engine` e `test-coronary-engine` saíram do `test:all` com
**cobertura zero declarada** até a auditoria desses módulos (D-25).
