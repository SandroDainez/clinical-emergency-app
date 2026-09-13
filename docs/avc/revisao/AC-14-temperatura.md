# AC-14 · Temperatura no caminho isquêmico

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13
**Origem:** `docs/avc/auditoria-vs-spec.md:45` (AC-14) · requisito `docs/avc/matriz-requisitos.md:29` (RQ-T01-03)

## 1 · Pergunta clínica

No AVC isquêmico, o app deve registrar a temperatura na chegada e sinalizar hipertermia?

## 2 · População

Adulto com AVC isquêmico em atendimento de emergência.

## 3 · Cenário

Observações de chegada da Estabilização: PA, FC, FR, SpO₂, glicemia, consciência e temperatura, segundo a spec (`docs/spec-avc.md:262`).

## 4 · Comportamento atual do código

| o quê | onde |
|---|---|
| Campo de temperatura e eixo E removidos | commit `b170b44` (2026-09-12) |
| e2e fixa a ausência do campo | `e2e/avc-cockpit-abcde.spec.ts:235` (`avc-num-caixa-temperatura` com contagem 0) |
| Prova fixa quatro eixos, ABCD | `scripts/prova-avc-ameacas.cjs` (lista de letras "ABCD") |
| Só resta "Temperatura" como opção de **monitorização**, sem valor | `avc/conteudo/superficie-a.ts:396` |
| No ramo de hemorragia intracerebral, a recomendação de temperatura existe como cartão (H-06) | `avc/conteudo/hemorragia-intracerebral.ts:560` |

**Razões do commit `b170b44`:**
- Frase do autor: *"exposição não precisamos no app AVC… é só mais um item para confundir"*.
- *"Se a fonte-mãe do isquêmico trouxer corte ou conduta, o eixo volta com ela e não por analogia."*

## 5 · Critério proposto — opções para decisão, sem escolha

| opção | comportamento |
|---|---|
| **A · atual** | Sem campo de temperatura no isquêmico. |
| **B** | Campo de temperatura na chegada, só como observação (RQ-T01-03), sem regra. |
| **C** | Opção B, mais um aviso de hipertermia ligado à §4.4, com o corte definido por decisão humana a partir da fonte. |

## 6 · Exceções

O ramo de hemorragia intracerebral já tem a recomendação própria (H-06), que não depende desta decisão.

## 7 · Dados necessários

- Temperatura com unidade, horário e origem (hoje não existe no isquêmico).
- Opção C: o corte, que a fonte só dá no texto de sinopse, não na recomendação (ver §9).

## 8 · Conduta diante de "não sei"

Hoje não há campo, então não há "não sei". Se o campo voltar, "não medida" não pode valer como normal (RQ-T01-03: "não medido ≠ normal; campo vazio fica vazio").

## 9 · Fonte primária

**AHA/ASA 2026, §4.4 *Temperature Management*, PDF p. 37 = página impressa e352.** Conferido no PDF.

| recomendação | classe e nível | trecho literal |
|---|---|---|
| rec. 1 | COR 1 · LOE B-R | *"targeting normothermia, including using nurse-initiated protocols for managing fever, is recommended"* |
| rec. 2 | COR 1 · LOE C-EO | *"sources of hyperthermia, such as infection, should be identified and treated"* |
| rec. 3 | COR 3: No Benefit · LOE B-R | *"treatment with induced hypothermia or prophylactic fever prevention is not recommended"* |

- **Sinopse** (texto de suporte, não recomendação): *"temperatures >37.5°C"*.
- **Transcrição:** a §4.4 **não foi transcrita**. A busca por `temp|therm|fever` em `aha-asa-2026-avc-isquemico.md` retorna 0.

**⚠️ A fonte não confirma o comportamento atual.**
- A fonte-mãe **tem** recomendações COR 1 sobre hipertermia no AVC isquêmico.
- A remoção foi feita porque "nenhuma fonte transcrita dá corte" (`auditoria-vs-spec.md:277`). A lacuna era da **transcrição**, não da diretriz.
- O corte numérico aparece só na sinopse.

## 10 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | Tratar hipertermia buscando normotermia (COR 1); identificar e tratar a causa (COR 1); não induzir hipotermia nem prevenir febre de rotina em normotermia (COR 3). |
| **Adaptação local** | Remoção do eixo E e da temperatura (autor, 2026-09-12). Registro **só** na mensagem do commit `b170b44`; não está em `docs/decisoes.md`. |
| **Escolha de interface** | A spec pede a temperatura entre as observações de chegada (RQ-T01-03), e o app não a tem. |

## 11 · Achado registrado junto

- **AC-44 · alta · clínico.** O caminho isquêmico não registra temperatura, embora a fonte-mãe tenha recomendação COR 1 (§4.4).
- A remoção se apoiou na ausência de transcrição, não na ausência de fonte.
- **Não corrigido:** exige decisão clínica.

## 12 · Decisão humana

**Decisão humana:** ___ (nome, versão, data)
