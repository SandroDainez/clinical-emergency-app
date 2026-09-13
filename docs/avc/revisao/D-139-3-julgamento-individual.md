# D-139 · Interpretação 3 · Julgamento individual pendente

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13
**Origem:** `auditoria/DIVIDAS-CONHECIDAS.md:5768-5770` · decisão HR-4 em `auditoria/PLANO-CORRECAO-AVC-CRITICOS.md:484`

## 1 · Pergunta clínica

Quando a fonte manda ponderar caso a caso, o app deve segurar a liberação da trombólise até um julgamento registrado? Casos: DOAC nas últimas 48 h, mais de 10 microssangramentos e itens relativos da Table 8.

## 2 · População

Candidato à IVT com uma dessas condições registradas.

## 3 · Cenário

O portão chegou ao ponto de liberar, mas há uma situação "individualizada".

## 4 · Comportamento atual do código

| o quê | onde |
|---|---|
| DOAC individualizado → `exige_julgamento` | `avc/nucleo/derivacoes-d.ts:924` |
| Microssangramentos (> 10) → `exige_julgamento` | `avc/nucleo/derivacoes-d.ts:961` |
| Item relativo com estado `situacao_individualizada` → `exige_julgamento` | `avc/nucleo/derivacoes-d.ts:986` |
| Portão → `julgamento_individual_pendente`, com `liberado: false` | `avc/nucleo/portao-ivt.ts:499` |

- **Sem campo de "julgamento registrado":** a opção (b) da HR-4 ficou com o autor.
- **⚠️ Achado por leitura, a verificar por execução:** quatro itens relativos com estado `informacao_insuficiente` não geram impedimento nenhum — malformação vascular não rota, dissecção intracraniana, neoplasia sistêmica ativa e punção arterial não compressível.
- **Cobertura:** nenhum teste liga microssangramentos > 10 ou itens relativos a `julgamento_individual_pendente`. Só DOAC é testado.

## 5 · Critério proposto — opções para decisão, sem escolha

| opção | comportamento |
|---|---|
| **A · atual** | Julgamento pendente não bloqueia navegação, mas o portão não libera; não há gesto que registre o julgamento. |
| **B** | Um fato novo "julgamento individual registrado", com autor e hora, libera o portão. |
| **C** | Só DOAC exige julgamento; microssangramentos > 10 e itens relativos apenas informam. |

## 6 · Exceções

Bloqueio de segurança, COR 3 e resultado pendente têm precedência sobre o julgamento (`portao-ivt.ts`).

## 7 · Dados necessários

- Horário da última dose do DOAC (existe; a janela de 48 h não é calculada, F-30).
- Carga de microssangramentos (existe como rótulo "> 10").
- Opção B: fato de julgamento com autor. Com a AC-40, o autor passa a ser a conta da sessão quando existe.

## 8 · Conduta diante de "não sei"

Hora do DOAC "não sei" → julgamento individual (`derivacoes-d.ts`). Microssangramentos desconhecidos → "baixa preocupação declarada", sem julgamento. A decisão deve cobrir os dois.

## 9 · Fonte primária

**DOAC — AHA/ASA 2026, Table 8, faixa relativa, p. e365.**
- ⚠️ A tabela é **imagem** no PDF; a frase foi conferida **só na transcrição** (`aha-asa-2026-avc-isquemico.md:1759-1762`, leitura visual).
- Trecho: *"on an individual basis"*.

**Microssangramentos — AHA/ASA 2026, §4.6.1 rec. 13 · COR 2b · LOE B-NR.**
- Localização: PDF p. 39 = página impressa e354.
- Trecho literal (conferido no PDF): *"a high burden (eg, >10) of CMBs"*.
- Transcrição: `aha-asa-2026-avc-isquemico.md:1096`, que diz que a utilidade da IVT é incerta.

**Itens relativos — Table 8, faixa relativa, p. e364–e367.**
- Imagem no PDF.
- Os verbos das células variam; resumo da transcrição em `:1010-1027`.

**⚠️ A fonte confirma só em parte.**
- **DOAC:** a fonte confirma julgamento individual, sem contraindicação.
- **Microssangramentos > 10:** a fonte diz "utilidade incerta", não "base individual".
- **Itens relativos:** tratá-los como julgamento é interpretação.
- **Segurar ou liberar a ação:** a fonte não diz nada sobre isso.

## 10 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | DOAC < 48 h: segurança desconhecida, considerar após análise individual de risco e benefício. Microssangramentos > 10: utilidade incerta (COR 2b). Faixa relativa: cautela moderada. |
| **Adaptação local** | Julgamento pendente não pode virar liberação automática. Decisão HR-4 do autor, 2026-09-12, sem versão. Não há campo novo nesta rodada. |
| **Escolha de interface** | Título "Situação que a fonte manda avaliar individualmente"; a decisão de prosseguir só aparece com o portão liberado. |

## 11 · Decisão humana

**Decisão humana:** ___ (nome, versão, data)
