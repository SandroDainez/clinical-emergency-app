# AC-13 · Estados da ação (4 × 8)

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13
**Origem:** `docs/avc/auditoria-vs-spec.md:44` (AC-13) · requisito `docs/avc/matriz-requisitos.md:67` (RQ-T06-01)

## 1 · Pergunta clínica

Que estados uma intervenção precisa registrar para que a trilha diga, sem ambiguidade, o que foi indicado, decidido, preparado, iniciado, concluído, interrompido ou cancelado?

## 2 · População

Toda intervenção registrada no módulo: ação corretiva da superfície Correções e trombólise.

## 3 · Cenário

O médico registra o que aconteceu com uma ação, inclusive fora da ordem, por exemplo registrando direto "realizada".

## 4 · Comportamento atual do código

| o quê | onde |
|---|---|
| Tipo com 6 estados: `sugerida`, `disponivel` (derivados); `iniciada`, `realizada`, `interrompida`, `cancelada` (médico) | `avc/nucleo/tipos.ts:244` |
| Opções que a tela oferece: os **4** do médico | `avc/conteudo/superficie-e.ts:81` |
| Campo `acao_estado`, sem opção "Não sei" | `avc/conteudo/superficie-e.ts:197` |
| Trombólise usa o mesmo vocabulário | `avc/nucleo/derivacoes-f.ts:924` |

**Contagens de estados nos documentos:**

| documento | quantos | onde |
|---|---|---|
| PDF da spec v1.1 | **8**: indicado, decidido, prescrito, preparado, iniciado, administrado/concluído, interrompido, cancelado | `docs/spec-avc.md:357` |
| Especificação interna §2.3, emenda de 2026-09-12 | 6 | `auditoria/ESPECIFICACAO-AVC.md:884-918` |
| Código | 4 registráveis | acima |

## 5 · Critério proposto — opções para decisão, sem escolha

| opção | comportamento |
|---|---|
| **A · atual** | 4 estados registráveis (iniciada, realizada, interrompida, cancelada). |
| **B** | Os 8 estados da spec. |
| **C** | Os 4 atuais, mais parte dos 4 que faltam, escolhidos um a um (indicado, decidido, prescrito, preparado). |

## 6 · Exceções

- **Interrompida × cancelada:** a distinção já vigente não pode se perder. "Interrompida" significa que houve exposição; "cancelada" significa antes do início, sem exposição.
- **Consumidores:** a exposição ao trombolítico é lida pelo histórico (`derivacoes-f.ts`, `exposicaoDaInstancia`).

## 7 · Dados necessários

- Horário de cada transição (a spec pede horários reais, quantidade, responsável e motivo da interrupção: `docs/spec-avc.md:358`).
- Opção B ou C: os novos estados e quem os registra.

## 8 · Conduta diante de "não sei"

Hoje `acao_estado` e `ivt_estado` **não** oferecem "Não sei". Um valor `nao_sei` gravado seria lido como ausente (`derivacoes-e.ts`). A decisão deve dizer se "não sei o que aconteceu com a ação" é registrável.

## 9 · Fonte primária

- **Nenhuma fonte clínica define estados de ação.** Busca por `discontinu|interrupt|cancel|prescri|administered|state` na AHA/ASA 2026, nas bulas, no contrato da trombólise e nas definições operacionais: nenhuma lista de estados.
- **Única frase que toca o tema** — AHA/ASA 2026, **Table 7**, PDF p. 43 = e358, conferida no PDF:
  - Trecho literal: *"discontinue the infusion (if IV alteplase is being administered)"*.
  - A frase sustenta que interromper uma infusão iniciada é evento real, isto é, distingue interrompida de cancelada.
  - Ela **não** define os demais estados.

**A fonte não trata da questão.** O número de estados é escolha de especificação e interface.

## 10 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | Nenhuma sobre estados. A Table 7 prevê interromper a infusão diante de piora. |
| **Adaptação local** | Vocabulário de 4 estados fixado na decisão **D2** (`auditoria/PLANO-CORRECAO-AVC-CRITICOS.md:44-46`, 2026-09-12). Não há registro humano que decida **contra** os 8 estados da spec. |
| **Escolha de interface** | Estados derivados (sugerida, disponível) não são registráveis; o médico pode registrar fora da sequência. |

## 11 · Decisão humana

**Decisão humana:** ___ (nome, versão, data)
