# HSA · O que resolve a suspeita clínica de hemorragia subaracnóidea

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13 (8ª rodada)
**Origem:** pedido do autor de 2026-09-13. O card antigo dizia *"Resolver a suspeita: responder «Não», ou corrigir o registro"*, o que ensina a virar a resposta. Condição corrigível exige **dado novo**.

## 1 · Pergunta clínica

Com suspeita clínica de HSA e TC sem sangue, **que fato registrado** encerra a suspeita e libera a reperfusão isquêmica retida pela D-PEND-23?

## 2 · População

Adulto com suspeita de AVC isquêmico, candidato a reperfusão, TC sem hemorragia e suspeita clínica de HSA registrada.

## 3 · Comportamento atual do código (9ª rodada, D-PEND-26)

| o quê | onde |
|---|---|
| «Sim» retém a reperfusão; classificação "requer avaliação especializada / corrigir e reavaliar" (D-PEND-23) | `avc/nucleo/derivacoes-c.ts` `retencaoDiagnostica` |
| Depois de «Sim», registrar «Não» ou «Incerto» **não** desfaz a retenção | idem; `scripts/prova-avc-rodada8.cjs`; `e2e/avc-hsa-sem-atalho.spec.ts` |
| O card diz *"Requer investigação antes de reperfundir — conteúdo pendente de validação"*; o motivo não tem botão «Resolver» | `avc/nucleo/portao-ivt.ts`; `components/avc/superficie-f.tsx` |
| **«Limpar» (D-PEND-26):** abre a confirmação "Foi engano?". Confirmar grava correção com motivo "toque errado" (autor carimbado pela persistência) em **todas** as respostas vigentes e devolve a pergunta a "não respondida". A retenção cai porque o fato deixou de existir | `avc/nucleo/limpar-auditado.ts`; `components/avc/confirmacao-de-limpar.tsx`; `scripts/prova-avc-limpar-auditado.cjs`; `e2e/avc-limpar-auditado.spec.ts` |
| A regra vale para toda resposta cujo apagamento faria sumir um motivo restritivo do portão (provada com HSA e coagulação «Sim») | idem |

✅ **A brecha da 8ª rodada fechou:** «Limpar» + «Não» em dois toques deu lugar a um ato explícito, auditado, que custa três toques mais a confirmação (D-PEND-26).

## 4 · O que as fontes do repositório dizem

**AHA/ASA 2026 (fonte-mãe do isquêmico):**
- **Imagem:** manda excluir hemorragia intracraniana por imagem antes da reperfusão (§3.2 rec. 1, COR 1, LOE A, transcrita em F-16).
- **Suspeita de HSA:** não tem recomendação sobre suspeita clínica de HSA com TC sem sangue em candidato à reperfusão. A busca no PDF foi registrada no pacote `AC-15-hsa.md` §9.

**AHA/ASA 2023, HSA aneurismática** (`protocols/fontes-verbatim/aha-asa-2023-hsa.md`):
- **Transcrito:** §6, §7, §8.2–§8.5 e §8.
- **§4 (diagnóstico), atualizado em 2026-09-13, AC-64:** localizada e **parafraseada** em **S-00**, com página e COR/LOE. O **verbatim ainda falta**: o agente não reproduz texto longo da diretriz, e o autor cola o literal.
- **O que a §4 trata** (paráfrase, p. e322–e324): investigação de **cefaleia aguda intensa** suspeita de HSA aneurismática.
  - **Rec. 2 (COR 1, B-NR):** com mais de 6 h **ou déficit neurológico novo**, TC sem contraste e, se negativa, punção lombar.
  - **Rec. 3 (COR 2a, B-NR):** com menos de 6 h e sem déficit novo, a TC de alta qualidade laudada por neurorradiologista é razoável para excluir.
  - **Rec. 5 (COR 1, B-NR):** alta suspeita de aneurisma com angio-TC negativa ou inconclusiva pede DSA.
  - **Figure 2 (e323):** punção lombar → xantocromia → angio-TC/DSA.
- ⚠️ **Limites de aplicação ao módulo:**
  - **População diferente:** a §4 fala de quem chega com **cefaleia**, não de candidato à reperfusão isquêmica.
  - **Apresentação atípica:** o texto de suporte (e324) diz que as análises de sensibilidade da TC não se aplicam a apresentações atípicas, entre elas déficit neurológico focal novo.

## 5 · O que resolveria — proposta com base na §4 da AHA/ASA 2023 (S-00), sem decisão

⚠️ **Proposta do agente a partir da paráfrase de S-00.** Nada disto está no app. O card continua "Requer investigação antes de reperfundir — conteúdo pendente de validação" até a decisão.

| item | apoio na §4 (paráfrase, com página) | pergunta que só o autor decide |
|---|---|---|
| **TC sem contraste negativa** | rec. 2 (COR 1, e322): com déficit novo ou mais de 6 h, a TC negativa **não basta**, e segue punção lombar. Rec. 3 (COR 2a) só vale com menos de 6 h e **sem** déficit novo | O candidato à reperfusão tem déficit focal: a TC negativa sozinha pode encerrar a suspeita? Pela leitura da §4, não. |
| **punção lombar (xantocromia)** | rec. 2 e Figure 2 (e322–e323): exame seguinte após TC negativa; o texto de suporte cita 6 a 12 h do início | ⚠️ Punção lombar e trombólise: a interação **não está** nesta diretriz nem na AHA 2026 transcrita. É conduta aceitável antes de reperfundir? Com que intervalo? |
| **angio-TC / DSA** | rec. 5 (COR 1, e322) e Figure 2: após xantocromia, ou na alta suspeita de aneurisma com angio-TC negativa, DSA. O texto de suporte (e323) diz que a angio-TC não avalia a HSA em si | Angio-TC negativa, sozinha, encerra a suspeita? A §4 não sustenta isso. |
| **avaliação especializada** | não aparece na §4 como critério diagnóstico; "avaliação por especialista" está em §7 rec. 6 (sistemas de cuidado) | Avaliação especializada registrada basta como "fato novo"? |

**Pendência de fonte:**
- **Literal:** colar o verbatim das recs. 2, 3 e 5 em `protocols/fontes-verbatim/aha-asa-2023-hsa.md` S-00, nas linhas `> VERBATIM: ___`.
- **Punção lombar e trombólise:** transcrever o item correspondente da AHA 2026 (Table 8) se houver.

## 6 · Opções para "fato novo" — sem escolha

| opção | fato que libera a retenção |
|---|---|
| **A** | investigação registrada com resultado (exame + resultado + horário), após o conteúdo da §4 ser transcrito e validado. Pela §4, a sequência para quem tem déficit é TC → punção lombar → angio-TC/DSA se houver xantocromia; ver a pergunta sobre punção lombar e trombólise na §5 |
| **B** | avaliação especializada registrada (quem, quando, conclusão) |
| **C** | A ou B |
| **D** | só a correção formal do registro, como hoje (erro de registro), sem liberação clínica pela interface |
| **E** | **Leitura do autor (2026-09-13), completada com a regra da §4 conferida no PDF integral (18ª rodada), ainda não escolhida.** Pela AHA/ASA 2023 §4 (p. e322–e323): com **déficit neurológico novo ou mais de 6 h** do início, a **TC sem contraste negativa não resolve** a suspeita e exige **punção lombar** (rec. 2, COR 1, B-NR; Figure 2); a **angio-TC ou a DSA investigam a fonte depois de HSA demonstrada**, na TC ou pela xantocromia (rec. 5, COR 1, B-NR; Figure 2). Abaixo de 6 h e sem déficit novo, a TC de alta qualidade laudada por neurorradiologista é razoável para excluir (rec. 3, COR 2a, B-NR), cenário que não é o do candidato à reperfusão com déficit. Leitura original do autor: libera a retenção um resultado registrado de angio-TC com reavaliação clínica documentada, ou punção lombar com resultado registrado. ⚠️ Pela §4, a angio-TC negativa sozinha não demonstra ausência de HSA: ela investiga a fonte depois da HSA demonstrada. Nunca «Não» nem «Limpar». Mesmo com o fato novo, a saída é "avaliação especializada", não "elegível" (D-PEND-23). Tempo desde a TC não resolve. |

## 7 · Decisões pedidas

1. Qual opção da §6 define "fato novo"? (A–D ou E, a leitura do autor de 2026-09-13)
2. ~~«Limpar» de uma suspeita já marcada «Sim» deve continuar liberando a retenção?~~ **Decidido pela D-PEND-26 (2026-09-13):** exige confirmação ("foi engano?"), grava correção com motivo "toque errado" e devolve a pergunta a "não respondida".
3. Punção lombar antes de reperfundir: aceitável? Com que intervalo? (§5; sem fonte no repositório)

## 8 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | Excluir hemorragia por imagem antes da reperfusão (AHA 2026 §3.2). Nada sobre suspeita clínica com TC sem sangue. |
| **Adaptação do projeto** | Reter a reperfusão enquanto a suspeita não for investigada (D-PEND-23). Trocar a resposta não resolve (pedido do autor, 8ª rodada). |
| **Escolha de interface** | O card não oferece gesto de resolução enquanto o conteúdo não existir. |

## 9 · Decisão humana

**Decisão humana:** ___ (nome, versão, data)

## 10 · Fonte conferida no PDF integral (18ª rodada, 2026-09-14)

- **Documento:** AHA/ASA 2023, *Stroke* 2023;54:e314–e370, PDF integral entregue pelo autor; substitui o dossiê de conferência da §4.
- **§4, p. e322–e324:** seis recomendações, conferidas com COR/LOE em `protocols/fontes-verbatim/aha-asa-2023-hsa.md` S-00.
- **Punção lombar × trombólise:** a §4 não trata. Na Table 8 da AHA/ASA 2026 (p. e366), a linha "punção dural nos últimos 7 dias" está na faixa relativa ("may be considered in individual cases"). Não resolve a pergunta 3 da §7: é insumo.
- **Decisão:** continua em branco (§9).

