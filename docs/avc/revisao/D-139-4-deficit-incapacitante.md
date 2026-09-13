# D-139 · Interpretação 4 · Déficit incapacitante só na rota padrão

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13
**Origem:** `auditoria/DIVIDAS-CONHECIDAS.md:5771-5773` · HR-2 em `auditoria/PLANO-CORRECAO-AVC-CRITICOS.md:482`

## 1 · Pergunta clínica

A trombólise em **janela estendida** exige déficit incapacitante, como a rota padrão?

## 2 · População

Candidato à IVT fora da janela padrão: início desconhecido com RM, despertar, 4,5–9 h, ou oclusão de grande vaso sem trombectomia.

## 3 · Cenário

Uma rota de janela estendida tem todos os seus critérios satisfeitos, e o déficit está registrado como "Não incapacitante", "Incerto" ou não perguntado.

## 4 · Comportamento atual do código

| o quê | onde |
|---|---|
| Rota por início desconhecido: exige início desconhecido, DWI < 1/3, FLAIR sem alteração marcada e janela, **sem** déficit incapacitante | `avc/conteudo/superficie-f.ts:638` |
| Despertar / 4,5–9 h: sem déficit incapacitante; travada por F-31 | `avc/conteudo/superficie-f.ts:670` |
| Oclusão de grande vaso sem trombectomia: sem déficit incapacitante; travada por F-31 | `avc/conteudo/superficie-f.ts:693` |
| Rota padrão = elegibilidade clínica (inclui déficit incapacitante) e janela | `avc/nucleo/veredito-da-trombolise.ts:514` |
| Prova: início "não sei" + RM, **sem** registrar déficit incapacitante → "indicada" | `scripts/prova-avc-criticos.cjs:662` |

- **Na prática** só a rota por início desconhecido sustenta sem déficit incapacitante; as outras duas estão travadas.
- **⚠️ Achado por leitura, a verificar por execução:**
  - Situação: déficit "Não incapacitante" com uma rota estendida aplicável.
  - Leitura: `rotaSustenta` fica verdadeiro, então o veredito pode sair "indicada".
  - Limite da COR 3 da rec. 8: só alcança quem tem "Leve" e "Não incapacitante" dentro de 4,5 h.
  - Nenhum teste cobre esse caso.

## 5 · Critério proposto — opções para decisão, sem escolha

| opção | comportamento |
|---|---|
| **A · atual** | Déficit incapacitante só na rota padrão; rotas estendidas usam a população que a própria recomendação escreve. |
| **B** | Déficit incapacitante exigido em todas as rotas. |
| **C** | Opção A, mas "Não incapacitante" registrado impede também as rotas estendidas. |

## 6 · Exceções

As rotas travadas por F-31 não sustentam enquanto a fonte estiver aberta.

## 7 · Dados necessários

Déficit incapacitante (`incapacitante_assumido`: "Incapacitante" / "Não incapacitante" / "Incerto"), já existente.

## 8 · Conduta diante de "não sei"

"Incerto" e não perguntado ficam como insumo ausente e só afetam a rota padrão. A decisão deve dizer se afetam as estendidas.

## 9 · Fonte primária

**Rota padrão — AHA/ASA 2026, §4.6.1 rec. 1 · COR 1 · LOE A.**
- Localização: PDF p. 38 = página impressa e353.
- Trecho literal (conferido no PDF): *"with disabling deficits, regardless of NIHSS score"*.
- Transcrição: `aha-asa-2026-avc-isquemico.md:2348-2351`.

**Janela estendida — AHA/ASA 2026, §4.6.3 rec. 1 · COR 2a · LOE B-R.**
- Localização: PDF p. 44 = página impressa e359.
- Trecho literal (conferido no PDF): *"have unknown time of onset and are within 4.5 hours from symptom recognition"*.
- Transcrição: `:289-295`. As recs. 2 e 3 estão em `:297-310`.

**⚠️ A fonte não trata disso.**
- As recomendações de janela estendida **não** usam "disabling".
- Mas também **não** dizem que o critério fica de fora.
- A rec. 1 da §4.6.1 fala da rapidez do tratamento e pressupõe "eligible for IVT".

## 10 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | Rota padrão com déficit incapacitante (§4.6.1). Rotas estendidas com populações próprias, sem menção a déficit incapacitante (§4.6.3). |
| **Adaptação local** | Leitura literal: o critério pertence à rota padrão. Registrada como "observação, não como decisão nova" na HR-2 (`PLANO:482`). A confirmação segue pendente (D-PEND-11). |
| **Escolha de interface** | Quando uma rota estendida sustenta, a lista de critérios troca o déficit e a janela pela recomendação estendida aplicável. |

## 10A · Atualização da 4ª rodada (2026-09-13)

- **AC-47:** o cenário de perfusão pedido pelo autor **não reproduziu** (rota travada pela F-31; `nao_elegivel_a_evt` nunca satisfeito — AC-52).
- A rota de RM com início desconhecido **reproduziu** e foi corrigida em `62856f4`, no sentido pedido pelo autor: com o déficit **registrado** "não incapacitante", a saída é "Sem indicação neste caminho", com o motivo.
- "Incerto" e não perguntado não mudaram. Isso cobre em parte a opção C deste pacote; o resto continua **sem decisão**.

## 11 · Decisão humana

**Decisão humana:** ___ (nome, versão, data)
