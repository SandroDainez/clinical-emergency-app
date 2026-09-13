# AC-06 · Arredondamento da dose do trombolítico

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13
**Origem:** `docs/avc/auditoria-vs-spec.md:37` (AC-06) · `docs/status.md` (D-PEND-12)

## 1 · Pergunta clínica

Como a dose calculada por peso deve ser arredondada?
- **Alteplase:** mg inteiro, décimo de mg, ou sem arredondamento?
- **Tenecteplase:** mg/kg arredondado, ou a **tabela por faixa de peso** da fonte?

## 2 · População

Adulto validado pelo portão de população (AC-03), com peso e origem do peso registrados.

## 3 · Cenário

O médico escolhe o agente na tela de Reperfusão, e o app mostra "Cálculo de dose — não é administração".

## 4 · Comportamento atual do código

| o quê | onde |
|---|---|
| Constantes: alteplase 0,9 mg/kg, máx. 90; tenecteplase 0,25 mg/kg, máx. 25 | `avc/conteudo/superficie-f.ts:1191-1192` |
| Cálculo: `Math.min(Math.round(pesoKg * d.mgPorKg), d.maximoMg)` — mg inteiro, teto aplicado **depois** | `avc/nucleo/derivacoes-f.ts:254` |
| Peso: inteiro de 30 a 200 kg | `avc/conteudo/paciente.ts:194` |
| Origem do peso: informado / estimado / "Não sei" | `avc/conteudo/paciente.ts:244` |
| Prova: 70 kg → alteplase 63 mg | `scripts/prova-avc-superficie-f.cjs:227` |

**Tenecteplase, código × Table 7.**
- A coluna "código" é aritmética sobre a linha 254; só 70 kg é confirmado por prova.
- `Math.round` arredonda .5 para cima.

| peso | código | Table 7 (faixa) |
|---|---|---|
| 50 kg | 13 mg | 15 mg |
| 60 kg | 15 mg | 17,5 mg |
| 69 kg | 17 mg | 17,5 mg |
| 70 kg | 18 mg | 20 mg |
| 80 kg | 20 mg | 22,5 mg |
| 90 kg | 23 mg | 25 mg |

⚠️ **Comentário e commit contradizem a transcrição.**
- O comentário em `derivacoes-f.ts:242-252` e o commit `6f230f1` dizem que a Table 7 dá "só mg/kg e o teto".
- A transcrição e o PDF trazem uma **tabela por faixa de peso** para a tenecteplase.

## 5 · Critério proposto — opções para decisão, sem escolha

| opção | alteplase | tenecteplase |
|---|---|---|
| **A · atual** | mg inteiro, teto depois | mg inteiro, teto depois |
| **B** | mg inteiro, teto depois | faixa de peso da Table 7 (dose e volume) |
| **C** | sem arredondamento, com casas definidas por decisão | faixa de peso da Table 7 |
| **D** | a definir pela bula brasileira, quando o PDF for aberto | idem |

## 6 · Exceções

- **Nota da Table 7 para < 50 kg:** com peso exato conhecido, admite faixa de 1 kg.
- **Peso estimado:** a mesma nota diz que a faixa de 1 kg não é necessariamente mais segura que a de 10 kg.
- **Peso fora de 30–200 kg:** não é registrável hoje.

## 7 · Dados necessários

- Peso e origem do peso (existem).
- Opção B ou C: volume em mL da faixa (não existe no app).
- Opção D: PDF da bula brasileira (**não disponível**; ver §9).

## 8 · Conduta diante de "não sei"

Hoje, peso ausente ou origem "Não sei" → **sem dose**, e o app não estima peso (`superficie-f.tsx`, mensagem "O app não estima peso"). A decisão deve dizer se isso se mantém.

## 9 · Fonte primária

**AHA/ASA 2026, Table 7 *Treatment of AIS in Adults*, PDF p. 43 = página impressa e358.**
- Tabela operacional, sem COR/LOE.
- Transcrição: `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md:1591-1612`.
- Trechos literais conferidos no PDF:
  - *"Infuse 0.9 mg/kg (maximum dose 90 mg) over 60 min"*
  - *"Push 0.25 mg/kg (up to maximum 25 mg) based on patient body weight"*
  - Linhas da tabela por faixa: `<60 kg` 15 mg · `60 kg to <70 kg` 17.5 mg · `70 kg to <80 kg` 20 mg · `80 kg to <90 kg` 22.5 mg · `≥90 kg` 25 mg
  - Nota: *"dosing per 1-kg band may be used"* (para < 50 kg com peso exato conhecido)

**AHA/ASA 2026, §4.6.2 rec. 1 · COR 1 · LOE A.** Transcrição `:1557-1562`; dose por kg e máximo, sem arredondamento.

**Bulas brasileiras** (`protocols/fontes-verbatim/bulas-br-tromboliticos.md`):
- **Actilyse:** transcrição **parcial**; a posologia do AVC está em `:117-120`, sem página e sem regra de arredondamento.
- **Metalyse 25 mg (AVC):** bula **não obtida** (`:179`).
- **PDF de nenhuma das duas** está no repositório ou no aparelho. A fonte candidata **não foi aberta**.

**⚠️ Confronto com o código:**
- **Alteplase:** a fonte **não fala** de arredondamento. O mg inteiro é adaptação local.
- **Tenecteplase:** a fonte **contradiz** o código. A Table 7 tem a tabela por faixa de peso, e o app calcula mg/kg arredondado, com valor abaixo da faixa em cinco dos seis pesos da tabela acima.

## 9A · Ampliação de 2026-09-13 — pedido do autor (AC-43), sem código

### 9A.1 · Recomendação textual × Table 7

| onde | classe e nível | página | trecho literal (conferido no PDF) |
|---|---|---|---|
| **§4.6.2 *Choice of Thrombolytic Agent*, rec. 1** | COR 1 · LOE A | PDF p. 42 = **e357** | *"tenecteplase at a dose of 0.25 mg/kg body weight (max 25 mg)"* |
| **Table 7 *Treatment of AIS in Adults*** | tabela operacional, sem COR/LOE | PDF p. 43 = **e358** | *"Push 0.25 mg/kg (up to maximum 25 mg) based on patient body weight"*, seguida da tabela por faixa de peso (§9) |

- **Transcrição:** a rec. 1 está em `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md:1557-1562`; a Table 7, em `:1591-1612`.
- ⚠️ A recomendação textual dá **mg/kg e máximo**. A Table 7 dá a mesma posologia **e** a tabela de administração por faixa de peso, com volume. **Nenhuma das duas fala em arredondar para mg inteiro.**

### 9A.2 · Cálculo comparativo — tenecteplase, três condutas

- **Exata:** 0,25 mg/kg, com teto de 25 mg, sem arredondamento.
- **Faixa:** a tabela da Table 7.
- **Inteiro atual:** o código de hoje, `Math.min(Math.round(peso × 0,25), 25)` em `avc/nucleo/derivacoes-f.ts:254`.
- **Volume:** a 5 mg/mL, como pedido. As linhas da Table 7 são coerentes com 5 mg/mL (15 mg · 3 mL … 25 mg · 5 mL); a concentração após reconstituição **não foi conferida em bula** (§9A.3).
- **Método:** conta aritmética feita para este pacote, **não executada na tela**. Só 70 kg (inteiro, 18 mg) tem prova no código.

| peso | exata | faixa (Table 7) | inteiro atual |
|---|---|---|---|
| 50 kg | 12,5 mg · 2,5 mL | 15 mg · 3 mL | 13 mg · 2,6 mL |
| 60 kg | 15 mg · 3 mL | 17,5 mg · 3,5 mL | 15 mg · 3 mL |
| 70 kg | 17,5 mg · 3,5 mL | 20 mg · 4 mL | 18 mg · 3,6 mL |
| 80 kg | 20 mg · 4 mL | 22,5 mg · 4,5 mL | 20 mg · 4 mL |
| 90 kg | 22,5 mg · 4,5 mL | 25 mg · 5 mL | 23 mg · 4,6 mL |
| 100 kg | 25 mg · 5 mL | 25 mg · 5 mL | 25 mg · 5 mL |

**Leitura sem decisão:**
- **50, 70 e 90 kg:** as três condutas dão valores diferentes.
- **60 e 80 kg:** a exata coincide com o inteiro atual; a faixa dá 2,5 mg a mais.
- **100 kg:** as três dão 25 mg.
- **Faixa × exata:** para pesos nestes pontos, a faixa nunca fica abaixo da exata.
- **Inteiro atual × faixa:** o inteiro atual fica abaixo da faixa em 50, 60, 70, 80 e 90 kg.

⚠️ **A nota da Table 7 para < 50 kg** (faixa de 1 kg com peso exato conhecido) não se aplica aos pesos desta tabela.

### 9A.3 · Situação regulatória no Brasil — **a preencher**

**Situação regulatória no Brasil:** ___ (quem conferiu, data, documento)

**O que precisa ser conferido na ANVISA:**
- **Registro:** registro vigente de tenecteplase (Metalyse®) no Brasil, com número e titular.
- **Indicação:** a indicação **AVC isquêmico agudo** consta do registro, ou só infarto agudo do miocárdio?
- **Apresentação:** existe a apresentação de 25 mg registrada e comercializada no Brasil?
- **Categoria:** categoria de venda e restrição de uso.

**O que precisa ser conferido na bula profissional:**
- **Versão:** versão e data da bula vigente para a apresentação usada no AVC.
- **Posologia do AVC:** mg/kg e máximo, e se traz tabela por faixa de peso para AVC (a bula de 40/50 mg traz faixas **para infarto**, que ⛔ não se usam no AVC: `bulas-br-tromboliticos.md:163-164`).
- **Preparo:** diluente, volume de reconstituição e **concentração final em mg/mL**, que confirma ou não os 5 mg/mL da §9A.2.
- **Graduação:** graduação da seringa e se a administração é por volume da faixa.
- **Estabilidade:** estabilidade depois de reconstituído.

**Estado das fontes hoje:**
- A bula de Metalyse 25 mg para AVC **não foi obtida** (`bulas-br-tromboliticos.md:179`).
- Nenhum PDF de bula está no repositório nem no aparelho.
- Acesso automatizado ao portal da ANVISA ⛔ não foi tentado.

## 10 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | 0,9 mg/kg (máx. 90 mg) e 0,25 mg/kg (máx. 25 mg) — §4.6.2 rec. 1. Table 7 operacional: bolus de 10% para a alteplase; faixas de peso para a tenecteplase. |
| **Adaptação local** | Arredondar para mg inteiro com teto depois. Frase do autor em 2026-09-12, registrada **só** na mensagem do commit `6f230f1`, sem nome nem versão formal. |
| **Escolha de interface** | Peso inteiro; dose mostrada como "cálculo, não administração"; origem do peso ao lado da dose; sem dose quando o peso é desconhecido. |

## 11 · Achado registrado junto

- **AC-43 · alta · clínico.** A dose da tenecteplase não segue a tabela por faixa de peso da Table 7.
- A 70 kg o app mostra 18 mg; a faixa da fonte dá 20 mg.
- **Não corrigido:** exige decisão clínica.

## 12 · Decisão humana

**Decisão humana:** ___ (nome, versão, data)
