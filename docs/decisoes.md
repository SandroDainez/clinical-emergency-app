# Decisões de produto — App Emergências

Registro das decisões que mudam o escopo ou o método do projeto. Cada entrada diz
quem decidiu, quando, o que muda e por quê. Uma decisão só entra aqui quando o
autor a fornece por escrito; proposta do agente vai para `docs/status.md` como
decisão pendente.

---

## D-AVC-01 · O módulo de AVC é construído dentro deste repositório

**Data:** 2026-09-13
**Decidido por:** Dr. Sandro Dainez (autor), por escrito, na instrução que
entregou o PDF *App Emergências | AVC — atendimento guiado*, v1.1.
**Estado:** vigente.

### O que muda

O PDF v1.1 contém três instruções que esta decisão **revoga**:

| trecho do PDF | página | estado |
|---|---|---|
| *"Origem: requisitos desta conversa, sem consulta ou reutilização do app existente."* | 1 | revogado |
| *"Não consulte, copie ou adapte o app anterior. […] Trabalhe em projeto novo e isolado."* | 16 | revogado |
| *"Mantenha a proibição de consultar o app anterior, exceto o módulo PCR que o usuário fornecer expressamente para integração futura."* | 27 | revogado |

O módulo de AVC é construído **neste repositório**
(`clinical-emergency-app`), como primeiro módulo do motor declarativo planejado
(1 motor + N conteúdos em grafo). Nenhum projeto novo é criado.

O restante do PDF permanece vigente, com as correções marcadas
`[CORREÇÃO 12/09]` em `docs/spec-avc.md`.

### Por quê

1. **O repositório já contém a infraestrutura que o PDF pede.** Um projeto novo
   reescreveria, sem o histórico de defeitos que a formou, trilha de fatos,
   estados de incerteza, i18n PT/ES, travas de build e transcrição verbatim de
   fontes. O inventário medido está em `docs/avc/inventario.md`.
2. **As regras de método continuam obrigatórias.** O autor as nomeou
   "R-1..R-100". Medido em `auditoria/METODO.md` em 2026-09-13: 129 regras
   distintas com cabeçalho, de R-1 a R-133 (R-46, R-129, R-130 e R-131 sem
   cabeçalho próprio). Todas continuam valendo.

### O que esta decisão NÃO decide

- **Não decide a base arquitetural do AVC.** O repositório já tem um módulo de
  AVC reconstruído em 2026-08-28 (`avc/conteudo/`, `avc/nucleo/`,
  `components/avc/`), que **não** roda sobre um motor declarativo em grafo. O
  contrato desse motor existe apenas como documento arquivado
  (`auditoria/ARQUITETURA-MAE.md`, arquivado em 2026-08-20, que declara
  *"descreve o alvo, não o estado"*). Evoluir o módulo existente ou reconstruí-lo
  sobre o motor é decisão pendente do autor, listada em `docs/status.md`.
- **Não autoriza tocar no PCR** nem em módulo existente.
- **Não valida nenhuma regra clínica.** Toda regra nasce pendente de validação
  médica e assim permanece até registro humano explícito com nome, versão e data.

---

## D-PEND-01 · Evoluir o AVC existente; o motor em grafo é extraído dele depois

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão:** o módulo de AVC existente (`avc/conteudo/`, `avc/nucleo/`,
`components/avc/`) é **evoluído**. O motor declarativo em grafo será **extraído
dele depois, não antes**.

**Razão registrada:** a do próprio texto da decisão: o motor nasce do módulo que
funciona, e não o precede. Contexto medido que a antecedeu, em
`docs/avc/inventario.md` §0: o AVC já existe com 68 arquivos, 32 provas e 32 e2e,
enquanto o motor em grafo existe só como contrato arquivado.

**Não autoriza** implementação nesta rodada.

## D-PEND-02 · Registro do atendimento local-first, em IndexedDB, com sincronização posterior

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão:** o registro do atendimento é **local-first**, persistido em
**IndexedDB**, com **sincronização posterior**.

**Razão registrada:** decisão exigida pela [CORREÇÃO 12/09], que tornou
offline/local-first obrigatório para E01. Contexto medido: hoje o estado do AVC
vive em memória e não sobrevive a fechar e reabrir (caso A13).

**Não autoriza** implementação nesta rodada. O desenho da sincronização fica para
entrega própria.

## D-PEND-03 · Multiusuário fora do escopo; segunda abertura do mesmo caso é detectada e bloqueada

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão:** edição multiusuário está **fora do escopo**. Uma **segunda abertura
do mesmo caso é detectada e bloqueada**.

**Razão registrada:** decisão exigida pela [CORREÇÃO 12/09] para E01. O caso A18
do PDF (*"conflito detectado e conciliado"*) passa a ser atendido por **detecção e
bloqueio**, e não por conciliação.

**Não autoriza** implementação nesta rodada.

## D-PEND-04 · Valores voláteis exibidos com horário, origem e idade; confirmar antes de alimentar regra

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão:** valores voláteis **podem ser exibidos** com **horário, origem e
idade**, e **exigem confirmar ou atualizar** antes de alimentar qualquer regra.
**Nunca** são pré-preenchidos como atuais.

**Razão registrada:** a razão escrita em `lib/contexto-do-paciente.ts` permanece:
um valor antigo preenchido parece plausível, não gera dúvida e leva a conduta
sobre dado morto. A decisão preserva essa proteção e acrescenta a exibição
rotulada, que o PDF p.26 pede para o modo "dentro do atendimento".

**Não autoriza** implementação nesta rodada.

## D-PEND-13 · Soma de NIHSS com item não testável é limite inferior do escore

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:** a soma com itens UN é **limite inferior** do escore.

| critério | com UN, a soma parcial… | resultado |
|---|---|---|
| **piso** (≥ k) | ≥ k | **satisfaz** |
| **piso** (≥ k) | < k | **inconclusivo por item não testável** (⛔ nunca "não atendido") |
| **teto** (≤ k) | qualquer valor | **nunca satisfaz** |

**Natureza:** interpretação humana. *"A fonte não define"*: a folha de total do NIH
Stroke Scale (`protocols/fontes-verbatim/nih-nihss-2024.md`, p. 8) não traz regra para UN.

**Origem:** achado AC-26 de `docs/avc/auditoria-vs-spec.md` §7.2.
**Razão registrada:** não fornecida além do texto da decisão.
**Autoriza implementação:** sim, na rodada seguinte à decisão (Entrega 1).

## D-PEND-14 · NIHSS informado por outro serviço é contexto, nunca critério

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:**

- O NIHSS informado por outro serviço é **contexto, nunca critério**.
- O app **pergunta se houve itens não testáveis**. Salvo **"não, escala completa"**, o
  escore externo aparece **só na síntese**.
- **Toda regra consome apenas o NIHSS basal feito neste atendimento.**

**Origem:** achado AC-28 de `docs/avc/auditoria-vs-spec.md` §7.2.
**Razão registrada:** não fornecida além do texto da decisão.
**Autoriza implementação:** sim, na rodada seguinte à decisão (Entrega 1).

## D-PEND-15 · Correção: motivo opcional, autor obrigatório, ausência visível

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:**

- O motivo da correção é **opcional**.
- O **autor é obrigatório** em todo evento de correção.
- A **ausência** de motivo é **visível**: a tela escreve "sem motivo informado".
- A decisão de 2026-08-30 (`corrigirFato` não exige motivo) fica **mantida**.

**Origem:** achado AC-38 de `docs/avc/auditoria-vs-spec.md` §7.6, que fica **fechado**.
**Estado da implementação:** já conforme em `fa01339`. O evento sempre leva `autor`; o motivo ausente é gravado como ausente; "sem motivo informado" aparece na leitura do Laboratório e da Imagem e no histórico da A.
**Razão registrada:** não fornecida além do texto da decisão.

## D-PEND-16 · "Contradiz" com item não testável só quando a soma parcial excede o teto

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:** com item UN, um critério de faixa com teto dá **"contradiz" apenas quando a soma parcial excede o teto**.

Isso complementa a D-PEND-13 (teto nunca satisfeito). Na faixa 6–9:

| soma parcial com UN | resultado |
|---|---|
| ≤ 9 | inconclusivo |
| > 9 | contradiz |

**Origem:** achado AC-32 de `docs/avc/auditoria-vs-spec.md` §7.5, que fica **confirmado**.
**Estado da implementação:** conforme em `207e4be` (`avc/nucleo/derivacoes-f.ts`, bloco D-PEND-13). Provas em `scripts/prova-avc-nihss-criterios.cjs:120-122`: parcial 7 e parcial 5 → inconclusivo; parcial 10 → contradiz.
**Razão registrada:** não fornecida além do texto da decisão.

## D-PEND-17 · Commit só de `docs/` dispensa `test:all`

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:** um commit **apenas de `docs/`** dispensa `test:all` quando `git diff --stat` tocar **só** `docs/`.

**Como se confere:** antes do commit, `git diff --cached --stat` lista apenas caminhos sob `docs/`. Qualquer caminho fora de `docs/` volta à regra geral: push só com `test:all` verde no HEAD exato.
**O que continua valendo:** commit por caminho explícito, e nenhuma afirmação de teste que não rodou.
**Razão registrada:** não fornecida além do texto da decisão.

## D-PEND-18 · AC-44: temperatura volta ao caminho isquêmico, com a §4.4 transcrita

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:** restaurar temperatura no caminho isquêmico, transcrevendo a §4.4 (p. e352) da AHA/ASA 2026.

**Origem:** achado AC-44 e pacote `docs/avc/revisao/AC-14-temperatura.md`.
**Revoga:** a remoção do eixo E e da temperatura do commit `b170b44` (decisão de 2026-09-12, registrada só na mensagem do commit).
**Razão registrada:** não fornecida além do texto da decisão.
**Autoriza implementação:** sim (4ª rodada, Entrega 2).

## D-PEND-19 · AC-45: segundo toque em opção já marcada é ignorado

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:** o segundo toque numa opção já marcada é **ignorado**; desmarcar exige o gesto **"limpar"**.

**Origem:** achado AC-45 de `docs/avc/auditoria-vs-spec.md` §7.8.
**Razão registrada:** não fornecida além do texto da decisão.
**Autoriza implementação:** sim (4ª rodada, Entrega 2).

## D-PEND-20 · AC-50: apagar o texto "10 dias pós-parto" sem fonte

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:** apagar o texto "10 dias pós-parto", que não tem fonte.

**Origem:** achado AC-50 de `docs/avc/auditoria-vs-spec.md` §7.8.
**Razão registrada:** não fornecida além do texto da decisão.
**Autoriza implementação:** sim (4ª rodada, Entrega 2).

## D-PEND-21 · Opção não marcada é neutra; cor só após marcação, com ✓ e borda

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:** opção não marcada é neutra (contorno, sem preenchimento de cor semântica); cor só após marcação, sempre acompanhada de ✓ e borda.

**Origem:** observação da revisão visual a 375 px da 5ª rodada (`docs/avc/auditoria-vs-spec.md` §7.10): com nada marcado, "Sim" aparecia verde cheio e "Não" vermelho cheio; a marcada se distinguia só pela borda e pelo ✓.
**Razão registrada:** não fornecida além do texto da decisão.
**Autoriza implementação:** sim (6ª rodada, Entrega 1): prova vermelha genérica em toda pergunta Sim/Não/Incerto do AVC; correção no componente compartilhado, não por tela; revisão das travas de contraste.

## D-PEND-22 · Dose da tenecteplase: 0,25 mg/kg exato, sem arredondar mg; Table 7 como conferência

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Como chegou:** bloco "Decisões — Sandro Dainez, 13/09/2026", colado pelo autor com a recomendação do revisor e sem linhas apagadas. Pela regra do próprio bloco, colar é aprovar.

**Decisão, nos termos do autor:**
- **Dose:** 0,25 mg/kg exato, máximo 25 mg, sem arredondar mg.
- **Volume:** exibido com 0,1 mL, a 5 mg/mL.
- **Table 7:** a faixa da Table 7 (p. e358) é exibida como conferência, com divergência explícita quando houver.
- **Regulatório:** a situação regulatória no Brasil (ANVISA/bula) é campo separado, "pendente de conferência", visível ao usuário.
- **Fonte:** recomendação textual da AHA 2026 e Table 7.
- **Arredondamento:** o arredondamento para mg inteiro é retirado.

**Origem:** AC-43 e pacote `docs/avc/revisao/AC-06-dose-trombolitico.md` §9A.
**Fontes no repositório:** AHA 2026 §4.6.2 rec. 1 e Table 7, transcritas em `protocols/fontes-verbatim/aha-asa-2026-avc-isquemico.md:1557-1612`.
**Leitura do agente, a confirmar:** a decisão fala da tenecteplase. A alteplase mantém a dose inteira da decisão de 2026-09-12. O arredondamento do volume ao 0,1 mL é feito ao valor mais próximo.
**Autoriza implementação:** sim (7ª rodada, Entrega 2).

## D-PEND-23 · Suspeita clínica de HSA com TC sem sangue: reter reperfusão como avaliação especializada

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Como chegou:** o mesmo bloco da D-PEND-22.

**Decisão, nos termos do autor:**
- **Conduta:** com suspeita clínica de HSA e TC sem sangue, reter a reperfusão.
- **Classificação:** "requer avaliação especializada / corrigir e reavaliar", e não "impede pela diretriz".
- **Fonte:** bula, marcada como adaptação do projeto até o autor conferir a Table 8.

**Origem:** AC-15 e pacote `docs/avc/revisao/AC-15-hsa.md`.
⚠️ **Fonte no repositório:** `protocols/fontes-verbatim/bulas-br-tromboliticos.md` **não contém** menção a hemorragia subaracnóidea (busca `subaracn|subarachnoid|HSA|SAH`: 0). O trecho da bula citado pelo autor **não está transcrito**. A regra fica registrada como adaptação do projeto.
**Autoriza implementação:** sim (7ª rodada, Entrega 2).

## D-PEND-24 · Puerpério: janela de 14 dias pós-parto no portão de população

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Como chegou:** o mesmo bloco da D-PEND-22.

**Decisão, nos termos do autor:**
- **Janela:** 14 dias pós-parto no portão de população.
- **Marcação:** "fonte AHA 2019, a confirmar na Table 8 de 2026".
- **Texto antigo:** o texto "10 dias" é apagado (já removido pela D-PEND-20 em `f314f36`).

**Origem:** pacote `docs/avc/revisao/AC-03r-puerperio.md` (opção B).
⚠️ **Fonte no repositório:** não há transcrição da diretriz AHA/ASA 2019 em `protocols/fontes-verbatim/`. A linha de gestação e puerpério da Table 8 de 2026 é imagem e não foi transcrita. Os 14 dias ficam registrados como número do autor, com a marcação que ele definiu.
**Autoriza implementação:** sim (7ª rodada, Entrega 2). "Não sei" continua mantendo a pergunta.

## AC-59 · Contorno da opção neutra ≥ 3:1 contra o card

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:**
- **Contorno:** o contorno da opção neutra fica em ≥ 3:1 contra o card, nos dois temas.
- **Trava:** a trava de contraste passa a exigir 3:1 para contorno de opção.
- **Piso de 1,5:** mantido só para marcada contra neutra.

**Autoriza implementação:** sim (7ª rodada, Entrega 1).

## D-PEND-25 · Alteplase: 0,9 mg/kg exato, máx. 90 mg, sem arredondar mg; bolus de 10% e volume a 1 mg/mL

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:**
- **Dose:** alteplase 0,9 mg/kg exato, máx. 90 mg, sem arredondar mg.
- **Administração:** 10% em bolus em 1 min, restante em 60 min.
- **Volume:** a 1 mg/mL.
- **Provas:** as mesmas da TNK (70, 100, 120 kg).

**Origem:** AC-61 (leitura do agente na D-PEND-22, que mantinha a alteplase inteira). O autor: "a rodada anterior tirou o '18 mg' de um fármaco e deixou o mesmo defeito no outro".
**Fontes no repositório:**
- **Dose e esquema:** AHA/ASA 2026 §4.6.2 rec. 1 (COR 1, LOE A, p. e357) e Table 7 (p. e358): *"Infuse 0.9 mg/kg (maximum dose 90 mg) over 60 min, with 10% of the dose given as a bolus over 1 min"*.
- **Concentração:** bula do Actilyse, 1 mg/mL (`protocols/fontes-verbatim/bulas-br-tromboliticos.md` §20.3).
- **Esquema na bula:** 10% em bolus e o restante em 60 min (§20.8).

**Revoga:** a dose inteira da alteplase (decisão de 2026-09-12, mantida pela leitura do agente na D-PEND-22).
**Autoriza implementação:** sim (8ª rodada, Entrega 3).

## D-PEND-26 · AC-63: «Limpar» sobre fato que sustenta retenção ou bloqueio exige confirmação e grava correção "toque errado"

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Como chegou:** bloco colado pelo autor, com a recomendação do revisor. Pela regra do próprio bloco, colar é aprovar.

**Decisão, nos termos do autor:**
- **Confirmação:** «Limpar» sobre um fato que sustenta retenção ou bloqueio exige confirmação explícita ("foi engano?").
- **Registro:** grava evento de correção com autor e motivo "toque errado".
- **Estado da pergunta:** devolve a pergunta a "não respondida", nunca a "Não". A retenção cai porque o fato deixou de existir.
- **Troca direta:** "Sim"→"Não" direto continua não liberando.
- **Alcance:** regra genérica para toda pergunta que sustente retenção.
- **Prova:** vermelha com HSA e com pelo menos uma outra pergunta de bloqueio.

**Razão registrada (revisor, aceita pelo autor):** bloquear o «Limpar» impediria corrigir toque errado, que é frequente; dois toques liberando uma retenção de segurança também não serve. Três toques mais uma confirmação e uma linha de auditoria dizendo que foi engano "é o custo certo".
**Origem:** AC-63 (`docs/avc/auditoria-vs-spec.md` §7.13) e pacote `docs/avc/revisao/hsa-resolucao.md` §7.
**Autoriza implementação:** sim (9ª rodada).

**Pedido do autor na mesma mensagem (AC-64), sem decisão clínica:**
- **Transcrição:** trecho de investigação diagnóstica com TC sem sangue da diretriz de HSA 2023 (§4), a partir do PDF local, com página, para `protocols/fontes-verbatim/`.
- **Proposta:** depois, completar `hsa-resolucao.md` com base nele.
- **Mantido:** o campo de decisão continua vazio, e o card não muda até o autor decidir.

## Pendentes do autor em 2026-09-13 (não implementar)

- ~~AC-43, AC-15, janela de puerpério~~: decididos pelas D-PEND-22, D-PEND-23 e D-PEND-24.
