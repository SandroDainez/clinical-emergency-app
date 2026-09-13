# D-139 · Interpretação 1 · Juízo sobre coagulação não perguntado

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13
**Origem:** `auditoria/DIVIDAS-CONHECIDAS.md:5761-5764` · `docs/status.md` (D-PEND-11) · commit `397bca3`

## 1 · Pergunta clínica

A trombólise pode seguir sem coagulograma quando **ninguém respondeu** se há motivo para suspeitar de alteração da coagulação?

## 2 · População

Candidato à IVT com pelo menos um dos exames de corte (INR, aPTT, PT, plaquetas) sem registro.

## 3 · Cenário

Os exames não chegaram, e a pergunta "Há razão para suspeitar de coagulação alterada" está sem resposta, ou respondida.

## 4 · Comportamento atual do código

| resposta do juízo | efeito | onde |
|---|---|---|
| Sim | `impede_ate_resultado` | `avc/nucleo/derivacoes-d.ts:869` |
| Não, sem varfarina ou heparina | `condicao_resolutiva`: pode iniciar antes do resultado e suspender se vier alterado | `avc/nucleo/derivacoes-d.ts:881` |
| Incerto | `impede_ate_resultado` | `avc/nucleo/derivacoes-d.ts:893` |
| **Não perguntado** | `aguarda_juizo` → portão `informacao_incompleta`, nomeando a pergunta | `avc/nucleo/derivacoes-d.ts:905` · `avc/nucleo/portao-ivt.ts:502` |

- **Prova do ramo "não perguntado":** `scripts/prova-avc-criticos.cjs:392`.
- **Por leitura:** o ramo não lê janela de tempo nem rota.
- **Cobertura:** nenhuma asserção isola "Incerto", e nenhum e2e verifica o título causado só pelo juízo não perguntado.

## 5 · Critério proposto — opções para decisão, sem escolha

| opção | "não perguntado" | "incerto" |
|---|---|---|
| **A · atual** | `informacao_incompleta` (pergunta nomeada) | aguarda resultado |
| **B** | `resultado_pendente` (aguarda o exame) | aguarda resultado |
| **C** | `condicao_resolutiva` (como "não") | aguarda resultado |

## 6 · Exceções

- Varfarina ou heparina em uso: aguarda resultado, qualquer que seja o juízo (interpretação 2).
- Os quatro cortes registrados: a pergunta nem é feita.

## 7 · Dados necessários

- Resposta ao juízo (existe).
- Janela de tempo, se a decisão restringir à população escrita da rec. 10 ("within 4.5 hours"). Hoje não é lida neste ramo.

## 8 · Conduta diante de "não sei"

"Incerto" → aguarda resultado (`derivacoes-d.ts:893`). É interpretação, e a decisão deve cobri-la.

## 9 · Fonte primária

**AHA/ASA 2026, §4.6.1 rec. 10 · COR 2a · LOE B-NR.**
- Localização: PDF p. 38 = página impressa **e353**.
- ⚠️ A transcrição registra "p. e354" (`aha-asa-2026-avc-isquemico.md:1846-1850`); o texto extraído do PDF está na p. e353.
- Trecho literal (conferido no PDF): *"if there is no reason to suspect an abnormal result"*.
- A população escrita da recomendação é *"within 4.5 hours of last known well and eligible for IVT"*.

**AHA/ASA 2026, Table 8, faixa absoluta, p. e367.**
- ⚠️ A tabela é **imagem** no PDF; a frase foi conferida **só na transcrição** (`:1823-1826`, leitura visual).
- Trecho: *"can be initiated before availability of coagulation test results"*.

**⚠️ A fonte confirma só em parte.**
- O ramo "não" é sustentado.
- A fonte **não diz** o que fazer quando o juízo não foi feito, nem quando é incerto.

## 10 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | Não atrasar a IVT esperando exames **se não houver razão para suspeitar** de resultado alterado (rec. 10). Iniciar antes do resultado em quem não usa varfarina ou heparina e suspender se vier alterado (Table 8). |
| **Adaptação local** | Juízo não perguntado ≠ negativo; "incerto" aguarda resultado. Decisão do autor para a HR-3 (`auditoria/PLANO-CORRECAO-AVC-CRITICOS.md:483`, 2026-09-12, sem versão). A aplicação concreta segue **a confirmar**. |
| **Escolha de interface** | O portão nomeia a pergunta, e não o exame; o botão leva ao campo. |

## 11 · Decisão humana

**Decisão humana:** ___ (nome, versão, data)
