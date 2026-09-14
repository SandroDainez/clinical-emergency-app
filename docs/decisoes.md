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

## D-PEND-27 · Diálogo "Foi engano?": o destaque visual fica no caminho seguro

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:** no diálogo "Foi engano?", "Manter a resposta" é a ação padrão visualmente; "Foi engano — limpar" é secundária.

**Razão registrada:** "numa confirmação cuja função é frear o dedo, o destaque visual deve estar no caminho seguro."
**Origem:** captura da confirmação da D-PEND-26 (`docs/avc/auditoria-vs-spec.md` §7.14).
**Autoriza implementação:** sim (10ª rodada).

**Pedido do autor na mesma mensagem (10ª rodada), sem conteúdo clínico novo:** transferência com ciclo de vida e telestroke como ator (T07, caso A12).
- **Estados da transferência:** solicitada → contato realizado → aceite ou recusa (com motivo) → transporte confirmado → saída → chegada, ou cancelamento. Estimativas marcadas como estimativas; aceite nunca presumido.
- **Estados do telestroke:** solicitada · em andamento · parecer registrado (texto livre, autor, horário; sem conclusão automática) · não disponível. O parecer não altera regra; aparece como "avaliação especializada registrada".
- **Durante a espera:** plano local e tarefas continuam; deterioração antecipa reavaliação. Sem recurso e sem aceite: plano local, documentação e revisão do acesso como tarefa, nunca terapia substituta.
- **Síntese:** inclui a linha do tempo real da transferência e do parecer.
- **Critério de transferência e centro de destino:** nenhum texto é afirmado; só o que o usuário registra, até haver fonte (Portaria 665/2012 e rede local na fila).

**Ajuste de rota do autor (2026-09-13, antes da implementação), nos termos dele:**
- **Rota:** não criar deterioração dentro da transferência.
- **Ação global:** implementar "Paciente piorou" como ação GLOBAL, acessível de qualquer tela do AVC.
  - gera evento de deterioração (autor, horário, texto livre opcional);
  - cria a tarefa "reavaliar agora", que aparece em Prioridade;
  - reabre a avaliação de ameaças (Estabilização) com o histórico preservado.
- **Limites:** sem limiar, sem conduta.
- **Transferência:** a espera da transferência usa esse mesmo mecanismo.
- **Provas vermelhas:**
  - A11: deterioração após tratamento leva a avaliação imediata, sem esperar tarefa agendada;
  - deterioração durante a espera de transferência;
  - "Paciente piorou" visível e acionável em todas as superfícies a 375 px, incluindo com bloco recolhido.
- **Idiomas:** PT/ES.
- **Razão registrada (revisor, aceita pelo autor):** é um dos dois botões globais do PDF (com "Preciso de ajuda"). Nascer dentro da transferência criaria dois mecanismos parciais e uma migração dolorosa. **Fecha o AC-10** (a parte "Paciente piorou") e dá prova ao A11.

**AC-66 / "fato novo" da HSA:**
- **Estado:** o autor deu a leitura dele, mas **ainda não escolheu** a opção do pacote `revisao/hsa-resolucao.md`.
- **Registro:** a leitura entrou no pacote como opção E.
- **Card:** fica como está até a escolha.

## Decisões da 11ª rodada (2026-09-13) · "Prioridade", AC-67, AC-68, AC-69 e ajustes das capturas

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente · **Origem:** capturas e relato da 10ª rodada (`docs/avc/auditoria-vs-spec.md` §7.15).

**Decisões, nos termos do autor:**
- **"Prioridade":** confirmada como linha no topo de toda superfície + primeiro item da lista de pendências. Sem seção nova.
- **AC-67 (piora registrada por engano):** "Limpar" auditado com confirmação, no padrão da D-PEND-26.
  - O evento não some: recebe correção com motivo "registrado por engano".
  - A tarefa "Reavaliar agora" só é removida se os eixos não tiverem sido reavaliados depois dela. Se já foram, a reavaliação fica.
- **AC-69 (marcos da transferência):** usar os dois horários do modelo de fato — observado (editável) e registrado (preservado). A síntese mostra a hora real com "registrado às" ao lado.
- **AC-68 (um fato por tecla no texto livre):** confirmar ao sair do campo ou ao tocar "Registrar"; nunca por alteração.

**Ajustes pedidos a partir das capturas:**
1. **Eixos reabertos:** mostram a última avaliação com hora e a marca "reavaliação pendente"; nunca vazio. É a regra "reavaliações não sobrescrevem o basal", que vale para os eixos como para o NIHSS.
2. **Marcos da transferência:** são eventos de uma linha do tempo, não seletor de estado.
   - Ação "Registrar marco" que adiciona à linha do tempo com horário.
   - Lista dos marcos já registrados abaixo.
   - "Chegada" sem "Saída" é tolerado; a síntese avisa.
   - Correção auditada por marco, não limpeza do conjunto.
3. **Porta 4173:** o `test:all` encerra ou recusa a porta ocupada antes de subir o servidor (o servidor esquecido derrubou 66 testes na 10ª rodada).

**Entrega 1 pedida:** "Preciso de ajuda" global, no mesmo topo fixo do "Paciente piorou".
- **Opções do PDF:** não sei avaliar · não tenho o medicamento · não tenho o equipamento · não melhorou · paciente piorou (esta chama o mecanismo existente).
- **Cada opção:** leva ao conteúdo ou caminho correspondente com retorno preservado.
- **Sem conteúdo validado:** a tela diz isso e permite registrar a conduta externa, sem simular execução.
- **Provas:** visível nas 7 superfícies a 375 px; retorno ao ponto de origem; nenhuma opção termina em beco sem saída. PT/ES. **Fecha o AC-10.**

**Entrega 2 pedida:** eixos reabertos com última avaliação e hora; marcos como linha do tempo com correção auditada; `test:all` protege a porta 4173.

**Autoriza implementação:** sim (11ª rodada). Provas vermelhas antes; `test:all` completo; push só verde; docs com hashes; sem `main`.

## Decisões da 12ª rodada (2026-09-13) · auditoria append-only, AC-67 confirmado, AC-71, AC-72, AC-73 e contrato de navegação (C05)

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente · **Origem:** capturas e relato da 11ª rodada (§7.16).

**Decisões, nos termos do autor:**
- **Auditoria append-only (correção estrutural do incidente `9b3c45e`):**
  - uma seção por arquivo em `docs/avc/auditoria/`;
  - o `auditoria-vs-spec.md` vira índice gerado;
  - nenhum script reescreve arquivo de histórico, só cria;
  - migrar sem perda, contando linhas antes e depois.
  - **Razão registrada:** é a segunda vez que um script abre o arquivo para escrita e o destrói. "O modo de falha está no desenho"; com uma seção por arquivo, a classe inteira de erro deixa de existir.
- **AC-67:** interpretação confirmada. Conta como "reavaliado depois" qualquer fato da Estabilização registrado depois da piora, ou eixo concluído de novo.
- **AC-71:** campos rotulados como estimativa aceitam horário futuro; horários observados continuam não aceitando. "É a diferença entre previsão e fato, que o próprio PDF exige."
- **AC-72:** teleconsulta pelo mesmo modelo de marcos, sem seletor de estado:
  - solicitada;
  - em andamento;
  - parecer registrado (texto, autor, horário);
  - não disponível.
- **AC-73:** a correção "registrado por engano" fica sempre disponível no evento da linha do tempo, não só enquanto a tarefa está pendente.
  - O efeito segue a regra do AC-67: tarefa e eixos só voltam se nada foi reavaliado depois.
  - "Perder a capacidade de corrigir porque o tempo passou não faz sentido numa trilha."
- **Achado de captura:** nome de exame não se trunca; quebra de linha ("Tomografia de crânio sem ...").

**Entrega 2 pedida — contrato de navegação entre módulos (C05, p. 4 do PDF):**
- **Antes de tudo:** inspecionar os módulos de via aérea existentes sem alterar a lógica deles.
- **Chamada e retorno:** com `encounterId`, ponto de origem e pilha. Caminho: AVC → via aérea → cuidados pós-intubação → retorno ao AVC, no campo de origem, com rolagem preservada.
- **O retorno transporta:** eventos realmente registrados, suporte ativo (ex.: intubado, ventilação), resposta e pendências.
- **Voltar não conclui a ameaça:** o eixo A fica "intervenção registrada · reavaliação pendente" até nova medida.
- **Exame neurológico anterior à sedação:** preservado e marcado.
- **Módulo não implementado:** aparece como "indisponível" com registro de conduta externa, nunca botão que simula execução.
- **Provas vermelhas:**
  - A09 completo;
  - retorno aninhado (dois módulos);
  - cancelamento no meio;
  - fechar e reabrir durante a intervenção;
  - "Paciente piorou" dentro do módulo chamado.
- **Idiomas:** PT/ES.
- **Conteúdo clínico:** nenhum novo. Os módulos chamados mantêm o conteúdo que já têm, com o estado de validação que já declaram.

**Autoriza implementação:** sim (12ª rodada). Provas vermelhas antes; `test:all` completo; push só verde; docs com hashes; sem `main`.

## Decisão da 13ª rodada (2026-09-13) · contrato de navegação com destinos indisponíveis, via aérea como conduta externa, "Sem essa informação" por marco

**Data:** 2026-09-13 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente · **Origem:** bloqueio da Entrega 2 da 12ª rodada (`docs/avc/auditoria/7.17-rodada-12.md`).

**Decisão, nos termos do autor:** opção (A). Não restaurar módulos legados.

**Razão registrada:**
- Via aérea, ventilação e sedoanalgesia foram removidas em 27/08 porque estavam sem validação. Restaurar o JSON legado (B) traria de volta exatamente o que foi tirado, e sem engine.
- Adiar (C) deixa o A09 sem prova e o cabeçalho sem "suporte ativo", que o PDF exige desde a T01.
- O que o AVC precisa hoje não é o módulo de via aérea. É saber que o paciente foi intubado, quando, e que o exame neurológico anterior à sedação está preservado. Isso é registro estruturado de conduta externa, sem fármaco e sem dose.
- O contrato fica pronto para quando via aérea voltar como segundo módulo do motor ("família procedimento", com o AVC como primeiro consumidor).

**Entrega 1 — contrato de navegação entre módulos:**
- **O contrato:** `encounterId`, ponto de origem com rolagem, pilha, retorno com eventos, suporte, resposta e pendências.
- **Destinos:** via aérea, ventilação e sedoanalgesia aparecem como "indisponível neste app", com registro estruturado de conduta externa.
- **Limite:** módulo indisponível nunca mostra botão que simule execução.
- **Provas:**
  - chamada e retorno com destino indisponível;
  - fechar e reabrir no meio;
  - "Paciente piorou" a partir do painel de indisponível.

**Entrega 2 — conduta externa de via aérea (estado, não conduta clínica):**
- **Campos:**
  - via aérea definitiva: sim · não · não sei;
  - tipo: intubação orotraqueal · dispositivo supraglótico · via aérea cirúrgica · outra · não sei;
  - horário observado (com registrado);
  - quem realizou: texto livre;
  - sedação em curso: sim · não · não sei;
  - ventilação mecânica: sim · não · não sei.
- **Fora do registro:** fármaco, dose e parâmetro ventilatório.
- **Efeitos com "via aérea definitiva = sim":**
  - o cabeçalho mostra "intubado às HH:MM · sedação em curso";
  - o eixo A vai a "intervenção registrada · reavaliação pendente" até nova medida;
  - todo exame neurológico com horário anterior ao da intubação recebe "anterior à sedação — basal preservado"; o posterior recebe "sob sedação — confundidor";
  - os itens do NIHSS que a intubação torna não testáveis (AC-01) passam a ser sugeridos automaticamente, nunca preenchidos.
- **Provas vermelhas:**
  - A09 completo;
  - NIHSS basal preservado após registrar intubação;
  - exame novo sob sedação não substitui o basal;
  - "não sei" em cada campo mantém pendência.

**Entrega 3 — "Sem essa informação" por marco na Cronologia:**
- **O problema:** "não sei quando chegou" e "não sei a última vez bem" são fatos diferentes.
- **O pedido:** o botão fica por marco, e "última vez bem desconhecida" abre o caminho de início desconhecido (A04), com prova.
- **Origem:** 1ª captura da 12ª rodada, com um "Sem essa informação" único abaixo de dois marcos.

**Idiomas:** PT/ES. **Autoriza implementação:** sim (13ª rodada). Provas vermelhas antes; `test:all` completo; push só verde; docs no modelo append-only; sem `main`.

## Decisões da 14ª rodada (2026-09-13) · AC-76 a AC-80, caminho A04 completo, leve ≠ incapacitante e plano até 48 h

**Autor:** Sandro Dainez, 13/09/2026.

**AC-76 — corrigido pelo autor ("o erro é meu"):**
- Dispositivo supraglótico não é via aérea definitiva. Definitiva = tubo com balonete na traqueia (intubação orotraqueal ou via aérea cirúrgica).
- O campo passa a ser "via aérea avançada instalada: sim · não · não sei". O tipo define se é definitiva.
- Cabeçalho por tipo:
  - intubação orotraqueal → "intubado às HH:MM";
  - via aérea cirúrgica → "via aérea cirúrgica às HH:MM";
  - dispositivo supraglótico → "dispositivo supraglótico às HH:MM (não definitiva)".
- A marca de sedação e a sugestão do item 10 do NIHSS valem para todos os tipos.

**AC-77 — não confirmado:**
- NIHSS sob sedação não é limite inferior nem superior; pode satisfazer falsamente um piso de EVT.
- Mesma regra de D-PEND-14: é contexto, não critério.
- Sem basal anterior, as regras dependentes ficam "inconclusivo — exame sob sedação; avaliação especializada".
- Exceção humana explícita: campo "sedação suspensa para o exame: sim · não" no próprio exame. Com "sim", o exame vale e fica marcado.

**AC-78:** a marca de sedação passa a valer também para o Glasgow.

**AC-79 e AC-80:** aceitos como estão.

**Cartão A04:**
- Hoje mostra só o caminho RM-DWI/FLAIR.
- A AHA 2026 também tem o caminho por perfusão (despertar até 9 h do ponto médio do sono; 4,5–9 h).
- Se §4.6.3 estiver transcrito, oferecer os dois caminhos com os dados exigidos; senão, marcar "segundo caminho pendente de transcrição".

**Leve × incapacitante:** "Déficit leve, na avaliação do médico" (Leve · Não leve · Incerto) não se funde com "incapacitante"; são perguntas distintas da diretriz (A05). Confirmar com prova.

**Entrega 2 — plano até 48 h (T08, C08), estrutura sem conteúdo clínico:**
- Tarefas vinculadas a eventos reais, com caminho próprio para cada um:
  - início da trombólise;
  - fim da trombectomia;
  - decisão de não reperfundir;
  - hemorragia confirmada.
- Cada tarefa declara evento de origem, prazo ou condição, e critério real de conclusão.
- Passagem de tempo nunca autoriza sozinha (A15: sem imagem de controle, a terapia dependente fica retida). Deterioração antecipa.
- Agenda visível na tela com "próxima reavaliação". Notificações em segundo plano documentadas como não confiáveis, sem presumir.
- Itens transversais (deglutição como trava antes de via oral, glicemia, temperatura, mobilização, TEV, dispositivos) entram como tarefas "conteúdo pendente de validação", com as fontes R5/R6 e AHA 2026 § correspondente listadas por tarefa em `docs/avc/revisao/plano-48h.md`.
- Provas: A15; atraso; cancelamento; fuso; quatro caminhos com agendas diferentes.

**Idiomas:** PT/ES. **Autoriza implementação:** sim (14ª rodada). Provas vermelhas antes; `test:all` completo; push só verde; docs append-only; sem `main`.

## Decisões da 15ª rodada (2026-09-13) · capturas antes de entregar, AC-85 parcial, AC-81/82 confirmados, AC-83 não confirmado, AC-88 como trava, caminho hemorrágico (A07)

**Autor:** Sandro Dainez, 13/09/2026.

**Observação sobre revisão:**
- Sem capturas, a rodada não está revisada. A agenda de 48 h e o cabeçalho por tipo de via aérea são o tipo de coisa que já surpreendeu na tela com testes verdes.
- Capturas antes de qualquer outra entrega.

**AC-85 — confirmado em parte:**
- Os dois eventos com horário registrado pela equipe (fim da trombectomia, decisão de não reperfundir) ficam.
- "Não prosseguir" na trombólise, sem horário, não abrir o caminho sem reperfusão é um problema: é o caminho mais frequente no Brasil e nunca abriria.
- **Regra:**
  - "Não prosseguir" ganha horário observado.
  - O caminho "sem reperfusão" abre quando IVT e EVT têm, **ambos**, desfecho final negativo registrado (impedida, sem indicação, indisponível ou recusada), cada um com horário.
  - Enquanto um dos dois estiver pendente, o caminho não abre, e a pendência diz qual falta.

**AC-81 — confirmado:** «Outra» ou «Não sei» → definitiva não determinada; cabeçalho "via aérea avançada às HH:MM (tipo não determinado)".

**AC-82 — confirmado, com pendência:** sem horário da via aérea nenhum exame é basal. Isso gera pendência explícita "informe o horário da via aérea para recuperar o exame basal", e não só silêncio.

**AC-83 — não confirmado. São dois confundidores diferentes:**
- **Sedação em curso = não:** o exame não é "sob sedação". É "com via aérea avançada, sem sedação":
  - os itens 1b e 10 ficam não testáveis;
  - o restante vale.
- **"Sob sedação"** (contexto, não critério): só quando sedação = sim ou não sei.

**AC-88 — corrigir agora (trava de segurança):**
- Triagem de deglutição "feita", sem resultado, não serve.
- As tarefas transversais registram resultado: aprovada · reprovada · não realizada · não sei.
- Deglutição reprovada ou não realizada mantém a trava "nada por via oral" visível no cabeçalho de suporte.
- O conteúdo de como fazer a triagem continua pendente; o resultado é dado do médico.

**AC-90 — do autor:** R4/R5/R6 (Canadian) e as seções da AHA 2026 sobre deglutição, mobilização e TEV entram na lista de PDFs do autor.

**AC-84, AC-86, AC-87, AC-89 — aceitos como limites declarados**, com uma ressalva:
- A agenda que só recalcula ao redesenhar vira defeito no momento em que a "próxima reavaliação" fica visível numa tela parada. Registrar como defeito.
- ⚠️ **Numeração:** o autor citou "AC-86", mas na §7.19 esse limite é o **AC-89**. O AC-86 é "desfazer evento com horário gravado exige «Sem essa informação» → «Limpar»". A ressalva vale para o AC-89.

**Entrega 1:**
- as cinco decisões acima (AC-85, AC-81, AC-82, AC-83, AC-88), com provas vermelhas antes;
- capturas a 375 px da 14ª rodada e desta:
  - agenda de 48 h em cada um dos quatro caminhos;
  - cabeçalho por tipo de via aérea;
  - trava de via oral no cabeçalho.

**Entrega 2 — caminho hemorrágico como caminho (A07), estrutura sem conteúdo:**
- **Abertura:** a saída "hemorragia" da T04 abre um caminho próprio com superfícies reduzidas (estabilização, neurológico, imagem, destino/48 h).
- **Bloqueio:** IVT e EVT isquêmicas ficam bloqueadas definitivamente, com motivo.
- **Campos de estado apenas:**
  - tipo: intraparenquimatosa · subaracnóidea · subdural · outra · não sei;
  - anticoagulante em uso, reutilizando o que a T01 já tem;
  - neurocirurgia contatada, por marcos, como a teleconsulta de AVC.
- **Condutas:** reversão, alvo pressórico e indicação cirúrgica aparecem como "conteúdo pendente de validação". O pacote `docs/avc/revisao/hemorragia.md` lista, por item, a fonte candidata (AHA/ASA 2022 ICH, AHA/ASA 2023 HSA, transcrições existentes).
- **Provas:**
  - A07 completo;
  - hemorragia depois de trombólise iniciada (complicação) leva ao mesmo caminho, com a infusão interrompida e registrada;
  - troca de idioma no meio.

**Idiomas:** PT/ES. **Autoriza implementação:** sim (15ª rodada). Provas vermelhas antes; `test:all` completo; push só verde; docs append-only; sem `main`.

### 15ª rodada · respostas do autor a duas perguntas de implementação (13/09/2026)

**AC-83 — a instrução do autor acima foi revogada pela fonte.**
- **Conflito:** a instrução NIH transcrita (`nih-nihss-2024.md`, p. 2, item 1b) diz que o intubado que não fala recebe 1. O UN por intubação existe só no item 10.
- **Decisão, com via aérea avançada e sem sedação:**
  - item 10: não testável (UN, com justificativa);
  - item 1b: pontuado pelo médico, com lembrete literal da instrução NIH na tela ("intubado que não fala recebe 1");
  - itens 1a e 1c: pontuados normalmente;
  - restante do exame: válido para as regras.
- **Soma:** segue a D-PEND-13 (UN = limite inferior) apenas pelo item 10.
- **O que se revoga:** a frase "itens 1b e 10 não testáveis", registrada acima nesta seção.
- **Prova vermelha (intubado sem sedação):**
  - 1b = 1 aceito;
  - 1b = UN rejeitado;
  - 10 = UN aceito.

**AC-85 — substituir pela regra.**
- O evento avulso "Decisão de não reperfundir" sai.
- O caminho sem reperfusão abre só com desfecho negativo de IVT ("Não prosseguir" + motivo + horário) **e** de EVT (motivo + horário). Com um dos dois pendente, a pendência nomeia qual.
- Os motivos de EVT incluem "decisão da equipe / limitação terapêutica" e "recusa do paciente ou família". Assim a decisão global se registra nos dois desfechos com um gesto, sem pular a avaliação.
- **Provas vermelhas:**
  - IVT negativa com EVT pendente não abre o caminho;
  - a decisão global registra os dois desfechos e abre.

## Decisões da 16ª rodada (2026-09-13) · regressão de procedência, AC-95, AC-98, AC-91, AC-92, AC-93, AC-101 e textos

**Autor:** Sandro Dainez, 13/09/2026.

**Capturas da 15ª rodada — revisadas pelo autor:**
- **Aprovados:** caminho hemorrágico com título próprio, bloqueio em vermelho com horário, interrupção da infusão registrável e os quatro caminhos de 48 h com agendas distintas.

**Regressão (alta) — procedência de volta ao card clínico.**
- **O que aparece em texto normal no plano de 48 h:**
  - "Fonte: F-15 · Table 7 · p. e358 · R5 (não transcrita)";
  - "Fonte: R6 · R4 (não transcritas) · AHA 2026 § a localizar";
  - "Conclusão: …".
- **Por que voltou:** a 8ª rodada tirou isso dos cards e mandou para o ⓘ, com trava. O plano nasceu fora do alcance da trava (AC-70: a varredura só cobre algumas superfícies).
- **Correções pedidas:**
  - mover fonte, status e conclusão para o ⓘ nessas telas;
  - ampliar a trava para todas as superfícies do AVC, não uma lista. Senão a próxima superfície nova repete.

**AC-95 — uma fonte de verdade.**
- Catálogo de hemorragia dizendo dose e alvo, e caminho hemorrágico dizendo "pendente", sobre a mesma conduta, é pior que qualquer um dos dois.
- O caminho consome o conteúdo do catálogo, com a força e a fonte que ele declara.
- Item sem fonte, força e contexto no contrato da p. 12 fica pendente nos dois lugares.
- Nenhuma conduta com dois estados de validação.
- **Resposta do autor a pergunta de implementação:** declarar pelo que já existe.
  - Recomendação com COR + LOE de diretriz → força `recomendacao_formal`.
  - `contextoDaFonte` = a população declarada no item.
  - Item sem população e as doses da figura 2 (não graduadas) → pendentes no catálogo e no caminho.

**AC-98 — renomear:** "Recusada" vira "Centro de referência recusou". "Recusa do paciente ou família" fica.

**AC-91 — confirmado, com pendência visível:** "Sedação não registrada — informe para liberar o exame como basal".

**AC-92 — corrigir.**
- A trava de via oral não depende de o plano de 48 h estar aberto: vale desde que o caminho (isquêmico ou hemorrágico) esteja definido. Disfagia é risco desde a chegada.
- **Resposta do autor a pergunta de implementação:** o caminho está definido pela imagem registrada.
  - Com laudo "Hemorragia intracraniana identificada": caminho hemorrágico.
  - Com laudo "Sem hemorragia intracraniana identificada": caminho isquêmico.
  - Antes do laudo: sem trava.

**AC-93 — aceito:** glicemia e temperatura são medidas; concluem pela medida.

**AC-101 — decidido, não é achado aberto:** suspeita de HSA sem sangue na imagem retém a reperfusão (D-PEND-23), mas não abre o caminho hemorrágico.

**Menores das capturas:**
- "4 registro(s) de conduta externa": plural por contagem, em PT e ES.
- "Antiagregante ou anticoagulante: retido… / retida · condição": concordância.
- "Unidade de AVC organizada, com…" truncado.
- "Caminho hemorrágico: registrar…" repetido em cada pendência: o prefixo é redundante dentro do próprio caminho.

**Entregas:**
1. **(alta) Procedência:**
   - "Fonte:", "Conclusão:", "§ a localizar", "não transcrita" e afins saem do texto visível do plano de 48 h e do caminho hemorrágico, e vão para o ⓘ;
   - a trava da 8ª rodada passa a valer para todas as superfícies do AVC;
   - prova vermelha reproduzindo as telas das capturas.
2. **AC-95, AC-98, AC-91, AC-92,** com provas vermelhas.
3. **Texto:**
   - plural por contagem (PT/ES);
   - concordância "retido/retida";
   - "Unidade de AVC organizada…" sem truncar;
   - sem o prefixo "Caminho hemorrágico:" nas pendências dentro do próprio caminho.

**Capturas a 375 px depois:** plano de 48 h nos quatro caminhos, caminho hemorrágico e trava de via oral sem plano aberto.

**Idiomas:** PT/ES. **Autoriza implementação:** sim (16ª rodada). Provas vermelhas antes; `test:all` completo; push só verde; docs append-only; sem `main`.

## Decisões da 17ª rodada (2026-09-14) · AC-106 a AC-111: vocabulário por transversal, pendente com nome, sem inglês na tela, motivos por terapia, um nome para a HIC, declaração da equipe

**Autor:** Sandro Dainez, revisão das capturas da 16ª rodada.

**Capturas da 16ª rodada — revisadas pelo autor:**
- **Aprovados:** a Entrega 1 funcionou (os cards mostram conduta e o ⓘ carrega conclusão e fonte); o AC-95 ficou coerente (o catálogo HIC mostra o que tem COR/LOE e população e marca o resto como pendente nos dois lugares).

**AC-106 (alta) — vocabulário de resultado por transversal.**
- **Achado:** "Aprovada/Reprovada" foi aplicado a Mobilização. O vocabulário nasceu para a triagem de deglutição e generalizou para as outras transversais. Reaproveitá-lo produz registro sem significado, e a trava de via oral depende de "reprovada" significar algo.
- **Deglutição:** mantém aprovada · reprovada · não realizada · não sei.
- **Mobilização:** realizada · não realizada · contraindicada no momento · não sei.
- **Demais transversais:** o agente propõe o vocabulário próprio e registra; nenhuma herda o da deglutição.
- **Trava de via oral:** continua ligada só ao resultado da deglutição.

**AC-107 (alta) — item pendente sempre com nome.**
- **Achado:** na aba HIC, dois cartões consecutivos dizem só "conteúdo pendente de validação", sem título. Pendente sem nome não é informação, é ruído.
- **Regra:** todo item pendente exibe o tema e, quando houver, a população (exemplo do autor: "Alvo pressórico · HIC grave — pendente").
- **Proibido:** cartão cujo texto visível seja apenas "conteúdo pendente de validação". Trava genérica.

**AC-108 — nenhum trecho em inglês no texto visível.**
- **Achado:** "Unidade de AVC organizada… is recommended". Escapa da trava de i18n porque é conteúdo, não chave.
- **Regra:** nenhum trecho em inglês no texto visível em pt-BR (nem em es). O verbatim da fonte fica só no ⓘ; a tela mostra a força traduzida.
- **Trava:** a de idioma passa a cobrir conteúdo, não só chaves.

**AC-109 — motivos de "não prosseguir" por terapia.**
- **Achado:** "Centro de referência recusou" aparece na lista da trombólise. A trombólise se faz na própria casa; recusa de centro é motivo de EVT/transferência.
- **Regra:** a lista é por terapia; "Centro de referência recusou" e "Indisponível" só na trombectomia.

**AC-110 — um único nome para o caminho.**
- **Achado:** o cabeçalho diz "Hemorragia intracraniana" e a aba diz "AVC hemorrágico (HIC)".
- **Regra:** "Hemorragia intracraniana (HIC)" no cabeçalho, na aba e na síntese.

**AC-111 — o marco de revisão é declaração.**
- **Achado:** "Caminho da hemorragia revisado pela equipe · Revisado/Não revisado" registra uma declaração, não o conteúdo.
- **Regra:** o rótulo explicita que é declaração da equipe ("a equipe declara ter revisado"), senão vira caixinha marcada.

**Observação do autor sobre o ritmo:** ele para de recomendar novas rodadas hoje. São 16 desde ontem, e o que trava não é o código: são a errata, a Table 8, a bula e R4–R6. Enquanto esses PDFs não entram, cada rodada acrescenta mais "§ a localizar".

**Idiomas:** PT/ES. **Autoriza implementação:** sim (17ª rodada). Todos com prova vermelha antes; `test:all` completo; push só verde; docs append-only; capturas depois; sem `main`.

## Pendentes do autor em 2026-09-13 (não implementar)

- ~~AC-43, AC-15, janela de puerpério~~: decididos pelas D-PEND-22, D-PEND-23 e D-PEND-24.
