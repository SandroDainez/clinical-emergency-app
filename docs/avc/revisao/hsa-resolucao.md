# HSA · O que resolve a suspeita clínica de hemorragia subaracnóidea

**Estado:** aguardando decisão humana · **Criado em:** 2026-09-13 (8ª rodada)
**Origem:** pedido do autor de 2026-09-13. O card antigo dizia *"Resolver a suspeita: responder «Não», ou corrigir o registro"*, o que ensina a virar a resposta. Condição corrigível exige **dado novo**.

## 1 · Pergunta clínica

Com suspeita clínica de HSA e TC sem sangue, **que fato registrado** encerra a suspeita e libera a reperfusão isquêmica retida pela D-PEND-23?

## 2 · População

Adulto com suspeita de AVC isquêmico, candidato a reperfusão, TC sem hemorragia e suspeita clínica de HSA registrada.

## 3 · Comportamento atual do código (8ª rodada)

| o quê | onde |
|---|---|
| «Sim» retém a reperfusão; classificação "requer avaliação especializada / corrigir e reavaliar" (D-PEND-23) | `avc/nucleo/derivacoes-c.ts` `retencaoDiagnostica` |
| Depois de «Sim», registrar «Não» ou «Incerto» **não** desfaz a retenção | idem; prova `scripts/prova-avc-rodada8.cjs`; e2e `e2e/avc-hsa-sem-atalho.spec.ts` |
| O card diz *"Requer investigação antes de reperfundir — conteúdo pendente de validação"*; o motivo não tem botão «Resolver» | `avc/nucleo/portao-ivt.ts`; `components/avc/superficie-f.tsx` |
| **Libera:** a correção formal do registro (o «Sim» é declarado erro de registro) | `avc/nucleo/estado.ts` `corrigirFato` |
| ⚠️ **Também libera:** «Limpar», porque é implementado como correção (`desfazerRegistro` → `corrigirFato` para `nao_perguntado`) | `avc/nucleo/estado.ts:219` |

⚠️ **Brecha declarada, não fechada sem decisão:**
- **Caminho:** «Limpar» seguido de «Não» são dois toques e liberam a reperfusão, sem investigação.
- **Por que não foi fechada:** fechá-la impediria corrigir um toque errado em «Sim», o que manteria a reperfusão retida por erro de digitação.
- **Decisão pedida:** ver §7.

## 4 · O que as fontes do repositório dizem

**AHA/ASA 2026 (fonte-mãe do isquêmico):**
- **Imagem:** manda excluir hemorragia intracraniana por imagem antes da reperfusão (§3.2 rec. 1, COR 1, LOE A, transcrita em F-16).
- **Suspeita de HSA:** não tem recomendação sobre suspeita clínica de HSA com TC sem sangue em candidato à reperfusão. A busca no PDF foi registrada no pacote `AC-15-hsa.md` §9.

**AHA/ASA 2023, HSA aneurismática** (`protocols/fontes-verbatim/aha-asa-2023-hsa.md`):
- **Transcrito:** §6 (ressangramento), §7 (tratamento do aneurisma), §8.2–§8.5 (vasoespasmo, hidrocefalia, convulsões) e §8 (complicações).
- **Não transcrito:** a própria transcrição declara *"§4 (diagnóstico/imagem)"* como **não transcrito**.
- ⚠️ **Consequência:** o conteúdo que responderia a esta pergunta — como investigar suspeita de HSA com TC sem sangue — **não está no repositório**. Nenhum exame, prazo ou limiar é afirmado aqui.

## 5 · O que resolveria — itens a conferir, sem conteúdo afirmado

| item citado pelo autor | fonte no repositório | o que falta |
|---|---|---|
| angiotomografia (angio-TC) | nenhuma para esta indicação; a transcrição de 2023 cita CTA/CTP só na monitorização de vasoespasmo (S-04) | transcrever a §4 da AHA/ASA 2023 (diagnóstico/imagem), com recomendação, COR/LOE e página |
| punção lombar | nenhuma; a transcrição de 2023 cita drenagem lombar só na hidrocefalia (S-05) | idem |
| avaliação neurológica / especializada | "avaliação por especialista" aparece em §7 rec. 6 de 2023 (sistemas de cuidado), sem relação com o diagnóstico da suspeita | idem, e decidir se avaliação especializada registrada basta como "fato novo" |

**Fonte aberta para transcrever:** Hoh BL et al., *2023 Guideline for the Management of Patients With Aneurysmal Subarachnoid Hemorrhage*, Stroke 2023;54:e314–e370, §4 (o PDF primário já foi enviado pelo autor em 2026-09-05).

## 6 · Opções para "fato novo" — sem escolha

| opção | fato que libera a retenção |
|---|---|
| **A** | investigação registrada com resultado (exame + resultado + horário), após o conteúdo da §4 ser transcrito e validado |
| **B** | avaliação especializada registrada (quem, quando, conclusão) |
| **C** | A ou B |
| **D** | só a correção formal do registro, como hoje (erro de registro), sem liberação clínica pela interface |

## 7 · Decisões pedidas

1. Qual opção da §6 define "fato novo"?
2. «Limpar» de uma suspeita já marcada «Sim» deve continuar liberando a retenção (erro de toque), ou deve exigir correção formal com motivo?

## 8 · Separação das camadas

| camada | conteúdo |
|---|---|
| **Recomendação da diretriz** | Excluir hemorragia por imagem antes da reperfusão (AHA 2026 §3.2). Nada sobre suspeita clínica com TC sem sangue. |
| **Adaptação do projeto** | Reter a reperfusão enquanto a suspeita não for investigada (D-PEND-23). Trocar a resposta não resolve (pedido do autor, 8ª rodada). |
| **Escolha de interface** | O card não oferece gesto de resolução enquanto o conteúdo não existir. |

## 9 · Decisão humana

**Decisão humana:** ___ (nome, versão, data)
