# AC-03 (resíduo) · Janela de puerpério

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13
**Origem:** `docs/avc/auditoria-vs-spec.md:371` ("Puerpério sem duração") · requisito `docs/avc/matriz-requisitos.md:140` (RQ-POP-01)

## 1 · Pergunta clínica

Até quanto tempo depois do parto uma paciente conta como "puérpera" para o portão de população, que retém protocolo e dose adultos?

## 2 · População

Mulher adulta com suspeita de AVC.

## 3 · Cenário

O médico responde à pergunta "Gestação ou puerpério" antes de qualquer regra adulta.

## 4 · Comportamento atual do código

| o quê | onde |
|---|---|
| Opções: "Não gestante e não puérpera" / "Gestante" / "Puérpera" / "Não sei" | `avc/conteudo/paciente.ts:79` e `:104` |
| "Puérpera" → fora do escopo validado, encaminhar | `avc/nucleo/populacao.ts:48` |
| "Não sei" → pergunta pendente; retém protocolo e dose | `avc/nucleo/populacao.ts:56` |
| Texto antigo com "primeiros 10 dias pós-parto": sem consumidor no AVC e sem fonte registrada | **removido** pela D-PEND-20 em `f314f36` |

**O app não define janela:** "puérpera" é resposta binária do médico. Não há campo de data do parto nem de dias pós-parto.

## 5 · Critério proposto — opções para decisão, sem escolha

| opção | comportamento |
|---|---|
| **A · atual** | "Puérpera" é juízo do médico, sem janela definida pelo app. |
| **B** | O app mostra junto da pergunta uma janela definida por decisão humana a partir de fonte identificada. |
| **C** | O app pergunta a data do parto e aplica a janela da opção B. |

## 6 · Exceções

O portão vale para gestante e puérpera igualmente; a Estabilização continua aberta (decisão do autor de 2026-09-13).

## 7 · Dados necessários

- Opção B: a janela e a fonte dela (**não localizada**, ver §9).
- Opção C: data do parto.

## 8 · Conduta diante de "não sei"

Hoje "Não sei" mantém a pergunta, e a dose por peso não aparece. É escolha do autor de 2026-09-13, "igual à idade": `protocols/fontes-verbatim/escopo-populacional-avc.md:29`.

## 9 · Fonte primária

**Escopo populacional (F-37), declarado pelo autor; não é fonte clínica.**
- `protocols/fontes-verbatim/escopo-populacional-avc.md:40-42` lista, entre o que o registro **não** sustenta, a *"definição da duração do puerpério"*.
- `:46`: *"A palavra puérpera é resposta do médico, sem critério do app."*

**AHA/ASA 2026, Table 8 *Other Situations That May Arise in Thrombolysis Decision-Making*, p. e364–e367 (PDF p. 49–52).**
- A tabela é **imagem** no PDF, e a busca por `pregnan|postpartum|puerper|peripartum` no texto extraído retorna 0.
- A transcrição do repositório registra, em paráfrase e não em verbatim, que gestação e puerpério estão na faixa **relativa**, e declara a linha "Não transcrito como regra do V1" (`aha-asa-2026-avc-isquemico.md:1110-1132`).
- **A frase literal dessa linha não foi conferida nesta rodada.**

**⚠️ Nenhuma fonte aberta define a duração do puerpério para este uso.** O texto antigo com "10 dias" não tem fonte registrada.

## 10 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | Não conferida: a linha de gestação e puerpério da Table 8 é imagem e não foi transcrita literalmente. |
| **Adaptação local** | Gestante e puérpera ficam fora do escopo validado, com a conduta "encaminhar" (instrução escrita do autor, 2026-09-13, rodada AC-03). |
| **Escolha de interface** | Resposta binária do médico; "Não sei" mantém a pergunta. |

## 11 · Decisão humana

**Decisão humana:** ___ (nome, versão, data)

## 12 · Table 8 conferida no PDF (18ª rodada, 2026-09-14)

- **Linha conferida:** AHA/ASA 2026 (versão online corrigida), Table 8, faixa relativa, p. e366, "Pregnancy and post-partum period". A trombólise pode ser considerada na gestação e no puerpério quando o benefício no AVC moderado ou grave supera o risco de sangramento uterino, com consulta obstétrica de emergência. **Não há janela em dias**: a linha está sem janela em dias.
- **Consequência para a D-PEND-24:** os 14 dias do app ("fonte AHA 2019, a confirmar na Table 8 de 2026") **não são confirmados** pela Table 8 de 2026, que não traz número.
- **Bula profissional Actilyse (I23-01), p. 4:** "parto nos últimos 10 dias" entre as contraindicações gerais por alto risco de hemorragia. É a fonte do texto "10 dias" removido pela D-PEND-20 por falta de fonte.
- **Três posições, sem decisão:** bula 10 dias (contraindicação) · AHA/ASA 2026 sem janela (faixa relativa) · app 14 dias (D-PEND-24, AHA 2019 não transcrita).
- **Pacote relacionado:** `docs/avc/revisao/bula-x-diretriz.md` §7.
- **Decisão humana:** ___

