# D-139 · Interpretação 2 · Varfarina ou heparina: quais exames aguardar

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13
**Origem:** `auditoria/DIVIDAS-CONHECIDAS.md:5765-5767` · `docs/avc/auditoria-vs-spec.md:282` · commit `397bca3`

## 1 · Pergunta clínica

Em quem usa varfarina ou heparina, quais resultados de coagulação precisam estar registrados antes da trombólise?

## 2 · População

Candidato à IVT com varfarina (ou outro antagonista da vitamina K), heparina ou heparina de baixo peso molecular registrada.

## 3 · Cenário

O paciente usa varfarina ou heparina, e algum exame de coagulação ainda não chegou.

## 4 · Comportamento atual do código

| o quê | onde |
|---|---|
| Uso de varfarina ou heparina lido do campo de anticoagulante | `avc/nucleo/derivacoes-d.ts:795` |
| Exames exigidos: `["inr", "aptt", "tp"]` | `avc/nucleo/derivacoes-d.ts:801` |
| Qualquer um dos três sem registro → `impede_ate_resultado` → portão `resultado_pendente` | `avc/nucleo/derivacoes-d.ts:857` |

- Plaquetas não entram nesta lista.
- **Por leitura, não executado:** "Não sei" no anticoagulante não é tratado como possível varfarina.
- **⚠️ Achado por leitura, a verificar por execução:**
  - Situação: varfarina registrada, INR, PT e aPTT registrados, plaquetas sem registro e juízo "não".
  - Resultado provável: o texto mostrado seria "Sem motivo para suspeitar; sem varfarina ou heparina registradas" (`derivacoes-d.ts:887`), com varfarina registrada.

## 5 · Critério proposto — opções para decisão, sem escolha

| opção | exames a aguardar |
|---|---|
| **A · atual** | INR **e** PT **e** aPTT |
| **B** | Por agente, com o mapa definido por decisão humana |
| **C** | Um só exame de coagulação qualquer |

## 6 · Exceções

- Valor que cruza o corte da fonte vira impedimento (`derivacoes-d.ts`, cortes da Table 8).
- A frase da fonte fala em **uso recente**; o campo diz **em uso**.

## 7 · Dados necessários

- Agente e horário da última dose (o horário existe só para DOAC).
- INR, PT e aPTT (existem).

## 8 · Conduta diante de "não sei"

"Não sei" no anticoagulante segue para o juízo da interpretação 1. A decisão deve dizer se "não sei se usa varfarina" basta.

## 9 · Fonte primária

**AHA/ASA 2026, Table 8, faixa absoluta, p. e367.**
- Tabela sem COR/LOE.
- ⚠️ A tabela é **imagem** no PDF; as frases foram conferidas **só na transcrição** (`aha-asa-2026-avc-isquemico.md:1819-1826`, leitura visual).

Trechos:
- *"In patients without recent use of warfarin or heparin"*
- *"should be discontinued if INR >1.7, PT, or PTT is abnormal"*

**⚠️ A fonte é ambígua quanto à regra do código.**
- A frase nomeia INR, PT e PTT **na cláusula de suspensão** de quem **não** usa varfarina ou heparina.
- Ela **não** define "coagulation test results", **não** diz que os três são exigidos e **não** diz o que fazer com quem usa esses agentes.
- Diferenças de termo: a fonte escreve "PTT", o código "aptt"; a fonte diz "heparin", a opção do app inclui heparina de baixo peso molecular.
- A transcrição registra (`:1813-1815`) que a Table 8 não tem célula própria para varfarina nem heparina.

## 10 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | Quem **não** usa varfarina ou heparina pode iniciar antes dos resultados, suspendendo se INR > 1,7 ou PT/PTT alterado. |
| **Adaptação local** | Quem usa aguarda INR, PT **e** aPTT. É interpretação sem registro humano (`auditoria-vs-spec.md:282`). A leitura da opção heparina é decisão do autor (`auditoria/PLANO-CORRECAO-AVC-CRITICOS.md:490`). |
| **Escolha de interface** | Pendência "Exames de coagulação", com o que falta registrar. |

## 10A · Atualização da 4ª rodada (2026-09-13)

- **AC-46 · reproduzido e corrigido** em `62856f4`: com varfarina ou heparina registradas, a condição resolutiva deixou de dizer "sem varfarina ou heparina registradas". A pergunta clínica deste pacote continua **sem decisão**.

## 11 · Decisão humana

**Decisão humana:** ___ (nome, versão, data)
