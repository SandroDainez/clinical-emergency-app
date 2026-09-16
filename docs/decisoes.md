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

## D-PEND-18 · complemento (2026-09-15): temperatura em «C · Circulação», sem eixo «E · Exposição»

**Data:** 2026-09-15 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** vigente.

**Decisão, nos termos do autor:** «tudo bem se voltou mas não cabe isso em exposição, quem sabe colocamos onde avaliamos sinais vitais como PAS PAD».

- A temperatura **continua** no caminho isquêmico (D-PEND-18, §4.4, sem corte).
- O eixo «E · Exposição» **sai** da Estabilização; a estabilização volta a ABCD.
- A temperatura mora em «C · Circulação», depois de PAS, PAD e FC. Não vira ameaça e não muda o estado do eixo C, que continua lendo a pressão.
- Atendimentos salvos com o eixo `exposicao` concluído continuam abrindo: o nome sobra na trilha e nenhuma tela o lê.

**Na mesma mensagem:**
- ~~**«Paciente piorou» sem tela de ação:** decidir depois; registrado como dívida.~~ Decidido em 2026-09-16: implementar (D-140, abaixo).
- ~~**«Preciso de ajuda»:** fica como está até existirem outros módulos para ligar às opções.~~ Revisto em 2026-09-16: o roteamento já existia; a correção foi de hierarquia e linguagem (D-140, abaixo).

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

## Decisões da 18ª rodada (2026-09-14) · documentos oficiais substituem os dossiês: bula Actilyse, HSA 2023 integral, Linha de Cuidados em AVC (MS); errata e Table 8

**Autor:** Sandro Dainez, 14/09/2026.

**Documentos entregues pelo autor** (em `~/Downloads/Documentos para o app/`; a mensagem diz `protocols/fontes-verbatim/`, onde não estavam):
- **Oficiais, que substituem os dossiês de conferência:** bula profissional Actilyse (I23-01); diretriz HSA AHA/ASA 2023 integral; "PCDT de Cuidados ao AVC" (Ministério da Saúde).
- **Também na pasta:** AHA/ASA 2026 integral e *Correction* (errata, *Stroke* 2026;57:e461–e467); CSBPR7 *Acute Stroke Management* (2022); Portaria GM/MS 665/2012; artigo *Arq Neuropsiquiatr* 2012; e os dossiês de Actilyse, Metalyse e HSA §4.
- **Procedência:** onde estava "dossiê de conferência", passa a bula, diretriz ou PCDT oficial, com página.

**Entrega A — Actilyse oficial.**
- **D-PEND-25 fecha com fonte de bula** (texto do autor): 0,9 mg/kg, máx. 90 mg; 10% em bolus de 1–2 minutos ("a bula diz 1–2, não 1"); restante em 60 min; concentração 1 mg/mL.
- **Tabela de dose por peso da bula (40 a 100+ kg):** transcrever e exibir como conferência, no padrão da Table 7 da TNK. Só mg, menor, com a frase "tabela da bula, para conferência — não é a dose a preparar". Prova: 70 kg → 63,0 mg · bolus 6,3 · infusão 56,7.
- **D-PEND-23 (HSA):** passa a ter fonte nominal de bula, com a frase literal no ⓘ.
- **Conflito declarado:**
  - A bula (2023) contraindica início >4,5 h ou desconhecido e não contempla janela estendida nem tenecteplase para AVC; a AHA/ASA 2026 contempla.
  - Onde as duas divergirem, o card mostra as duas posições rotuladas (bula brasileira × diretriz), nunca só uma.
  - Não resolver o conflito: listar as divergências em `docs/avc/revisao/bula-x-diretriz.md` com decisão em branco.
- **Contraindicações antigas da bula** (NIHSS >25, glicemia, plaquetas etc.): não viram regra determinística; entram como "critério de bula" no mesmo pacote.

**Entrega B — HSA 2023 integral.**
- Substituir o dossiê; transcrever a §4 com página e COR/LOE.
- Completar a opção E de `hsa-resolucao.md` com a regra real: com déficit novo ou >6 h, TC negativa não resolve e exige punção lombar; angio-TC investiga a fonte depois de HSA demonstrada.
- A decisão continua em branco.

**Entrega C — PCDT de Cuidados ao AVC (MS).**
- Ler e produzir `docs/avc/revisao/pcdt-brasil.md`: elegibilidade à trombólise no SUS, fluxo, critérios de centro e cuidados, e onde diverge da AHA/ASA 2026 e da bula.
- Não implementar nada a partir dele nesta rodada; é insumo de decisão.

**Prioridade:** as entregas da errata e da Table 8 "do comando anterior" seguem valendo e vêm antes destas, se ainda não foram feitas.

**Idiomas:** PT/ES. **Autoriza implementação:** sim (18ª rodada). Provas vermelhas antes; `test:all` completo; push só verde; docs append-only; sem `main`.

**Mensagem do autor durante a rodada:** "todos estão em Downloads, pasta Documentos para o APP".

## Decisões da 19ª rodada (2026-09-14) · revisão do DOSSIE-REVISAO.pdf: os nove pacotes e as nove decisões complementares

**Autor:** Sandro Dainez, 14/09/2026, sobre `docs/avc/revisao/DOSSIE-REVISAO.pdf` (`1573e8e`).
**Autoriza implementação:** **não**. O autor autorizou só o commit de documentação desta seção; nenhum código muda antes de nova autorização.

**Duas mensagens do autor:** a primeira decide os nove pacotes (§1–§9); a segunda ajusta três pontos (AC-13, D-139-3, AC-15) e traz nove decisões complementares, incorporadas em cada seção e numeradas **C1–C9**.

### 0 · Reconciliação: os nove pacotes não estavam igualmente pendentes

| pacote | estado antes desta rodada | por quê |
|---|---|---|
| AC-14 · temperatura | **decidido** (D-PEND-18) e implementado em `f314f36` | o próprio pacote registra a decisão |
| AC-06 · dose do trombolítico | **decidido** (D-PEND-22 tenecteplase, D-PEND-25 alteplase) | o campo do pacote não foi carimbado |
| AC-15 · suspeita de HSA | **decidido em parte** (D-PEND-23 retém a reperfusão); o que resolve a suspeita seguia aberto em `hsa-resolucao.md` | o campo do pacote não foi carimbado |
| AC-03r · puerpério | **decidido em parte** (D-PEND-24, 14 dias); a fonte seguia "a confirmar" | o campo do pacote não foi carimbado |
| D-139-1 a D-139-4, AC-13 | **abertos** | sem decisão registrada |

`docs/status.md` (fila, linha 16) já dizia que AC-06, AC-15 e AC-03r estavam decididos e não carimbados. Esta rodada **não reabre** AC-06 nem AC-14.

### 1 · AC-15 · suspeita de HSA — variante da opção C

**Decisão, nos termos do autor:**
- Suspeita clínica relevante de HSA ainda não resolvida permanece como **pendência diagnóstica** e **pode reter temporariamente** a reperfusão.
- **"Incerto" não equivale a "não".**
- **HSA confirmada** tem **caminho próprio**, distinto da HIC.
- O bloqueio tem **condição explícita de resolução**; não pode ser permanente por simples suspeita não esclarecida.

**Refina:** D-PEND-23 (a retenção continua "avaliação especializada", não impedimento).
**Muda em relação ao app de hoje:**
- "Sim" retém sem condição de resolução (só a correção libera, 8ª rodada e D-PEND-26).
- "Incerto" registrado desde o início não retém.
- A imagem tem só dois resultados e não distingue HSA.
- O caminho hemorrágico usa um nome só, "Hemorragia intracraniana (HIC)" (AC-110), inclusive para o tipo subaracnóidea.

**Decisões complementares:**
- **C1 · resolução da suspeita:** segue o algoritmo diagnóstico da AHA/ASA 2023 (§4, p. e322–e323; Figure 2).
  - **<6 h do início da cefaleia, sem déficit neurológico novo:** TC sem contraste de alta qualidade negativa pode resolver a suspeita conforme a diretriz (rec. 3, COR 2a, B-NR).
  - **≥6 h ou com déficit neurológico novo:** TC negativa não resolve. Se a suspeita permanece, a rota exige investigação adicional, com punção lombar prevista como Classe 1 (rec. 2, COR 1, B-NR).
  - A resolução decorre dos **fatos diagnósticos registrados**, não de inferência automática.
- **C2 · "Incerto":** enquanto a suspeita estiver ativa e não resolvida, "Incerto" **retém** a reperfusão; não equivale a "Não". Cumprido o critério diagnóstico de exclusão, a retenção é removida.
- **C3 · punção lombar × trombólise:** não criar intervalo temporal local sem fonte nem regra de "X horas após a punção". Se necessário, abrir questão clínica própria, com fonte específica.
- **C4 · HSA confirmada:** classificação própria de imagem para HSA, distinta de HIC. O caminho hemorrágico pode compartilhar componentes, mas não denomina HSA confirmada como "HIC". HSA fica preservada como diagnóstico e caminho próprio.

**Revoga em parte:** o AC-110 (17ª rodada) no ponto em que "Hemorragia intracraniana (HIC)" nomeia também a HSA.
**Estado:** decidido, **incluindo a condição de resolução**. O que ainda falta de fonte está no §10.

### 2 · AC-06 · dose do trombolítico — mantém D-PEND-22 e D-PEND-25

**Decisão, nos termos do autor:** dose exata por peso, sem arredondamento arbitrário para mg inteiro. Alteplase 0,9 mg/kg, máximo 90 mg; tenecteplase 0,25 mg/kg, máximo 25 mg. **Não inferir volume ou concentração sem documento regulatório correspondente.** Não reabrir a decisão só porque o pacote aparece pendente.

**Estado:** **encerrado** quanto à dose.
**⚠️ Conflito a confirmar pelo autor:**
- A D-PEND-22 manda exibir o volume da tenecteplase "a 5 mg/mL".
- Essa concentração **não tem documento regulatório**: a bula de Metalyse 25 mg não foi obtida, e a de 40/50 mg não declara mg/mL (`bulas-br-tromboliticos.md` §20.3, "implicam 5 mg/mL").
- Pela regra nova, o volume da tenecteplase é inferência. A alteplase tem 1 mg/mL na bula I23-01 (p. 7).

**Decisões complementares:**
- **C5 · volume da tenecteplase:** retirar do comportamento operacional brasileiro o volume calculado a 5 mg/mL enquanto não houver documento regulatório oficial da apresentação brasileira arquivado. Manter a dose em mg. A Table 7 da AHA/ASA pode permanecer como fonte internacional/documental, sem assumir que a apresentação brasileira é idêntica.
  - **Revoga em parte:** a D-PEND-22 no ponto "volume exibido com 0,1 mL, a 5 mg/mL".
  - **Resolve o conflito** registrado acima.
- **C9 · AC-118 encerrado pela AHA/ASA 2026 Table 7 (p. e358):** alteplase 0,9 mg/kg, máximo 90 mg; 10% da dose em bolus IV durante 1 minuto; o restante infundido durante 60 minutos.
  - Confirma o esquema da D-PEND-25.
  - A divergência D1 de `bula-x-diretriz.md` (a posologia do AVC da bula não dá duração) fica decidida.

### 3 · D-139 interpretação 2 · varfarina/heparina — opção B

**Decisão, nos termos do autor:**
- Requisitos laboratoriais **específicos por agente**, em vez de exigir INR + PT + aPTT de todos.
- Não exigir teste sem pertinência farmacológica só para satisfazer o motor.
- DOAC mantém a regra própria.

**Revoga:** a lista universal `["inr", "aptt", "tp"]` (`avc/nucleo/derivacoes-d.ts`).
**Decisão complementar C6 · mapa por agente (nos termos do autor):**
- **VKA/varfarina:** INR como parâmetro principal.
- **HNF:** considerar exposição recente e aPTT quando pertinente.
- **HBPM:** não usar aPTT como teste de liberação. A lógica se baseia em agente, dose e horário; anti-Xa só entra se uma fonte específica sustentar sua operacionalização.
- **DOAC:** regra própria.
- **Limite:** não inventar exames para preencher o mapa.

**Estado:** decidido. O que ainda falta de fonte para HNF e HBPM está no §10.

### 4 · D-139 interpretação 1 · coagulograma — opção A

**Decisão, nos termos do autor:**
- "Não" permite prosseguir conforme a diretriz quando não há razão para suspeitar de alteração.
- "Sim" e "incerto" aguardam os resultados pertinentes.
- "Não perguntado" permanece informação incompleta.
- Ausência de resposta nunca vira resposta negativa.

**Estado:** **encerrado.** É o comportamento atual (`derivacoes-d.ts`). Falta cobertura: nenhuma asserção isola "Incerto", e nenhum e2e mede o título causado só pelo juízo não perguntado (pacote §4).
**Interação com a interpretação 2:** "resultados pertinentes" passa a seguir o mapa por agente quando houver anticoagulante registrado.

### 5 · D-139 interpretação 3 · julgamento individual — opção B

**Decisão, nos termos do autor:**
- Fato explícito `julgamento_individual_registrado`, com decisão (prosseguir / não prosseguir), autor e data/hora.
- Não transformar automaticamente todo item relativo da Table 8 em julgamento obrigatório; cada condição segue o grau de suporte da sua fonte.

**Ajuste do autor:**
- O modelo de dados do fato pode ser preparado.
- O fato **não** é ligado ao portão pelos gatilhos atuais indiscriminadamente (hoje: DOAC, microssangramentos >10 e itens relativos de "situação individualizada").

**Decisão complementar C7:**
- **Onde se exige o julgamento:** só nas condições em que a fonte sustenta avaliação individual. **DOAC é o caso claramente identificado** (Table 8, faixa relativa, p. e365: "on an individual basis").
- **Sem automatismo:** microssangramentos >10 e toda a faixa relativa da Table 8 não viram julgamento obrigatório.
- **`prosseguir`** só libera se nenhum outro impedimento existir.
- **`não_prosseguir`** impede a IVT naquele episódio, com trilha auditável. Mudar a decisão exige novo registro, não sobrescrita silenciosa.

**Estado:** decidido.

### 6 · D-139 interpretação 4 · déficit incapacitante — opção C para o V1

**Decisão, nos termos do autor:**
- "Não incapacitante" explicitamente registrado impede a rota estendida.
- "Incerto" e "não perguntado" não viram incapacitante nem liberam a IVT automaticamente.
- Distinção explícita entre desconhecido, negativo e não avaliado.

**Estado:** **encerrado.**
- **Já implementado:** a primeira metade (AC-47, `62856f4`; `veredito-da-trombolise.ts`: com o déficit registrado "não incapacitante", toda rota estendida sai "Sem indicação neste caminho").
- **Muda:** hoje "Incerto" e não perguntado não afetam as rotas estendidas, que podem sustentar "indicada".

### 7 · AC-03r · puerpério — data do parto e regra explícita

**Decisão, nos termos do autor:**
- Usar a data do parto e regra explícita quando aplicável.
- A janela de 14 dias (D-PEND-24) é **decisão operacional/local** enquanto não houver fonte primária que a sustente.
- Não atribuí-la à AHA/ASA 2026 sem suporte documental.

**Revoga:** a marcação "fonte AHA 2019, a confirmar na Table 8 de 2026" (nota do campo `gestacao_puerperio`).
**Estado:** decidido; a janela **depende de fonte primária externa.**
- A AHA/ASA 2019 não está no repositório.
- A Table 8 de 2026 (p. e366) não traz janela em dias.
- A bula Actilyse I23-01 (p. 4) traz "parto nos últimos 10 dias" (AC-119).

**Decisão complementar C8 · data do parto desconhecida:**
- Desconhecida permanece desconhecida.
- Não assumir mais de 14 dias.
- Não liberar automaticamente o protocolo adulto pela ausência da data.
- Os 14 dias continuam identificados como regra local, não como recomendação da AHA/ASA 2026.

### 8 · AC-13 · estados da ação — opção B

**Decisão, nos termos do autor:**
- **Os 8 estados da spec:** indicado, decidido, prescrito, preparado, iniciado, administrado/concluído, interrompido, cancelado.
- **"Interrompido"** implica exposição; **"cancelado"**, ausência de exposição.
- **"Não sei"** é estado epistemológico (ausência de informação), não sinônimo de cancelado nem de não realizado.
  - **Ajuste do autor:** "não sei" **não é um nono estado da ação.** Os estados da ação são os 8 decididos; a ausência de informação é modelada **separadamente** do estado.
- **Horário e responsável** registrados quando aplicável.

**Revoga:** os 4 estados registráveis (iniciada, realizada, interrompida, cancelada) e a emenda de 6 estados de 2026-09-12 (`auditoria/ESPECIFICACAO-AVC.md` §2.3).
**Estado:** **encerrado** quanto ao modelo (a fonte clínica não define estados; é escolha de especificação).

### 9 · AC-14 · temperatura — não reabrir

**Decisão, nos termos do autor:** manter a D-PEND-18: registro de temperatura no AVC isquêmico e §4.4 da AHA/ASA 2026.
**Estado:** **encerrado** (implementado em `f314f36`). Só falta carimbar o pacote.

### 10 · O que ainda depende de fonte ou definição externa (depois de C1–C9)

| pacote | pendência | natureza |
|---|---|---|
| AC-15 | **"déficit neurológico novo" no candidato com AVC:** o déficit do próprio AVC conta como "novo" para o ramo da §4? A §4 trata de quem se apresenta com cefaleia (população diferente, `hsa-resolucao.md` §4). Pela C1, o fato é registrado, não inferido; falta dizer se o déficit focal do AVC já o preenche. | definição do autor |
| AC-15 | **"TC de alta qualidade laudada por neurorradiologista"** (rec. 3): não há fato registrado para qualidade do equipamento nem para quem laudou | dado a modelar; a fonte existe |
| AC-15 | **o que fecha a investigação depois da punção lombar:** a Figure 2 leva "sem xantocromia" a "investigação a critério do médico". A rec. 2 diz que a punção serve para "diagnosticar/excluir". Falta confirmar que punção sem xantocromia registrada exclui para fins de liberação. | leitura da fonte a confirmar pelo autor |
| AC-15 | **intervalo punção lombar × trombólise:** sem fonte; questão clínica própria (C3) | fonte externa |
| AC-15 | **verbatim das recs. 2, 3 e 5 da §4:** página e COR/LOE conferidos no PDF integral; o literal não foi colado | autor |
| AC-06 | **bula oficial de Metalyse 25 mg (apresentação brasileira):** sem ela, não há volume nem concentração (C5) | fonte regulatória externa |
| D-139-2 | **HNF, "exposição recente":** a Table 8 fala em "recent use of heparin" sem janela de tempo; o campo do app diz "em uso" | fonte externa |
| D-139-2 | **HBPM, regra por agente, dose e horário:** nenhuma fonte do repositório define dose ou intervalo que retenha ou libere; anti-Xa sem operacionalização (C6) | fonte externa |
| D-139-3 | **itens relativos que hoje pedem julgamento** (situação individualizada) e **microssangramentos >10:** saem do julgamento obrigatório pela C7. Falta dizer se passam a informação sem retenção ou mantêm outra forma de retenção. | definição do autor |
| AC-03r | **fonte primária da janela de 14 dias:** a AHA 2019 não está no repositório (regra local pela C8) | fonte externa, sem bloquear a implementação |

### 11 · Estado dos nove pacotes depois desta rodada

| pacote | estado | implementação |
|---|---|---|
| AC-14 | ✅ encerrado (D-PEND-18) | feita (`f314f36`) |
| AC-06 | ✅ encerrado: dose (D-PEND-22/25), volume da TNK retirado (C5), bolus pela Table 7 (C9) | a fazer: retirar o volume da TNK |
| D-139-1 | ✅ encerrado (opção A) | é o comportamento atual; faltam testes |
| D-139-4 | ✅ encerrado (opção C) | parcial; falta "incerto"/não perguntado nas rotas estendidas |
| AC-13 | ✅ encerrado (opção B, 8 estados; "não sei" separado) | a fazer |
| AC-15 | ✅ decidido (C1–C4); ◐ três definições do §10 antes da implementação completa | a fazer, em parte bloqueado |
| D-139-2 | ✅ decidido (C6); ◐ HNF e HBPM sem fonte suficiente | VKA implementável; HNF e HBPM parciais |
| D-139-3 | ✅ decidido (C7); ◐ destino dos gatilhos que saem do julgamento | modelo de dados e DOAC implementáveis |
| AC-03r | ✅ decidido (C8); janela como regra local | implementável |

## Decisões da 19ª rodada (2026-09-14) · complemento: definições D1, D3 e D8 e autorização do Lote 1

**Autor:** Sandro Dainez, 14/09/2026, respondendo aos itens 1, 3 e 8 do §10 da seção anterior.
**Autoriza implementação:** **sim, só o Lote 1**, com teste vermelho antes de cada alteração, teste focal verde depois, `test:all` antes de cada commit relevante, commits pequenos e separáveis e **sem push remoto**. Nada do Lote 2 além destas três definições.

### D1 · AC-15 · déficit neurológico novo

- **O que conta:** no algoritmo de HSA, um déficit focal neurológico agudo do episódio atual conta como *new neurological deficit*, inclusive se inicialmente atribuído ao AVC isquêmico.
- **Quando participa:** só **depois** que a suspeita clínica de HSA estiver ativa. A presença de déficit de AVC, isoladamente, não abre suspeita de HSA.
- **Rota de exclusão por TC:** suspeita ativa + início da cefaleia <6 h + ausência de déficit neurológico novo + TC sem contraste de alta qualidade conforme a fonte (AHA/ASA 2023 §4 rec. 3, p. e322).
- **Com déficit neurológico novo:** não usar a rota simplificada; seguir o ramo TC → investigação adicional (§4 rec. 2; Figure 2, p. e323).

### D3 · AC-15 · punção lombar sem xantocromia

- **Sem exclusão automática:** ausência de xantocromia não exclui HSA. Pela Figure 2, depois de TC negativa no ramo ≥6 h ou com déficit neurológico novo, a punção lombar é Classe 1, e a ausência de xantocromia leva a *work-up at physician discretion*.
- **Estados:**
  - xantocromia presente → HSA não excluída; seguir investigação vascular;
  - xantocromia ausente → `avaliacao_hsa_pos_pl_pendente`; não liberar IVT automaticamente.
- **Liberação:** a retenção só cai com registro explícito de "HSA excluída após investigação", com autor e hora.
- **Tempo:** sem intervalo punção lombar → trombólise sem fonte (reitera a C3).

### D8 · D-139-3 · condições que deixam o julgamento genérico

- **DOAC <48 h:** julgamento individual obrigatório (Table 8, faixa relativa, p. e365).
- **Carga conhecida de microssangramentos >10:**
  - não liberar automaticamente; a AHA/ASA 2026 classifica a utilidade da IVT como incerta (§4.6.1 rec. 13, COR 2b, B-NR, p. e354);
  - semântica própria `beneficio_ivt_incerto_requer_decisao_clinica`, retendo até decisão clínica registrada;
  - não chamar de contraindicação absoluta nem atribuir à fonte a expressão "individual basis", que a recomendação não usa.
- **Demais itens relativos da Table 8:** sem comportamento único; classificação item a item pelo verbo e pelo grau de certeza da fonte.
  - Os que exigem individualização explicitamente podem usar julgamento registrado.
  - Os que só dizem segurança desconhecida precisam de decisão separada antes de definir se retêm ou só informam. Até lá, mantêm o comportamento atual (AC-48: informação, sem reter).

**Complementa:** as C1, C3 e C7 (seção anterior).

### Complemento de 2026-09-14 · validação clínica final (texto do autor)

**Decisão, nos termos do autor:** onde o projeto indicava "validação por neurologista vascular", passa a constar:

> validação clínica final pelo responsável médico do projeto, com rastreabilidade explícita para literatura primária e documentação oficial. Testes automatizados não substituem essa revisão clínica.

- **Onde estava:** só em `docs/avc/revisao/DOSSIE-REVISAO.pdf` (`1573e8e`), no rótulo "[neurologista vascular]" das páginas dos pacotes 1 a 7 e no critério "Quem decide" da capa. Nenhum `.md` versionado nem código usavam a expressão.
- **Aplicado:** o dossiê foi gerado de novo com o rótulo "[responsável médico do projeto]" e o texto acima no critério "Quem decide". O conteúdo dos nove pacotes não mudou.
- **Não muda:** nenhuma decisão já registrada. Nenhum teste declara validação clínica.

## AC-13 reaberto (2026-09-14) · auditoria do `5649ade`: exposição triestado, trilha fiel, horários, autoria, retrocessos

**Data:** 2026-09-14 · **Decidido por:** Dr. Sandro Dainez, por escrito · **Estado:** AC-13 **reaberto** em 2026-09-14 e **encerrado em 2026-09-15** (§14); nenhuma implementação autorizada até a aprovação do plano de testes vermelhos.

**Decisão, nos termos do autor:** o `5649ade` implementa corretamente a base do AC-13, mas o AC-13 continua aberto por dois defeitos e dois atendimentos parciais. Não recriar a etapa: os ajustes são feitos sobre o `5649ade`.

**Revoga:** o "✅ encerrado" do AC-13 na tabela da 19ª rodada, §11, quanto à implementação. O modelo decidido na §8 (opção B, 8 estados, "não sei" separado) continua vigente.

### 0 · Como a auditoria foi feita

- **Onde:** worktree isolado no `5649ade`, sem tocar na árvore principal.
- **Provas:** 13 suítes verdes, incluindo 19ª rodada 123/0, críticos 185/0, fase 8 30/30, fase 10 41/41, Superfície G 77/77, persistência 40/40.
- **E2e que o commit tocou:** 126 de 126.
- **`tsc` na árvore principal:** limpo.
- **Roteiro adversarial:** 40 cenários executados no núcleo, comparados com o `52aa4e2` onde o módulo já existia, para separar o que o AC-13 introduziu do que já vinha antes.

### 1 · "Não sei" não pode ser consumido como "sem trombólise" · defeito

**Decisão, nos termos do autor:** criar semântica triestado para exposição: `exposta`, `nao_exposta`, `desconhecida`. Todo consumidor clínico dependente de exposição deve tratar `desconhecida` explicitamente.

**O que o código faz hoje:** `exposicaoAoTrombolitico` devolve seis formas, e todo consumidor pergunta só se a forma é `exposta`. Com "Não sei" na única trombólise, a forma é `situacao_desconhecida`, e o resultado em cada consumidor é o mesmo de "nenhuma trombólise":

| consumidor | arquivo | com "Não sei" |
|---|---|---|
| pertinência da monitorização, fase, protocolo pós-IVT, pressão pós-IVT, antitrombóticos | `avc/nucleo/derivacoes-g.ts` | não pertinente; antitrombóticos "fora do contexto pós-IVT" |
| alvos pressóricos aplicáveis | `avc/nucleo/alvo-pressorico.ts` | alvo de antes da trombólise |
| caminho hemorrágico, com hemorragia na TC | `avc/nucleo/caminho-hemorragico.ts` | "sem trombólise", sem a pendência de registrar a interrupção da infusão |
| plano até 48 h, desfechos e origem | `avc/nucleo/plano-48h.ts` | sem exposição e sem origem |
| síntese do caso | `avc/nucleo/sintese-do-caso.ts` | nenhuma linha |
| contagem de administrações, cartão de discrepância | `components/avc/superficie-f.tsx` | zero |
| conclusão gravada no log | `avc/persistencia/log.ts` | `situacao_desconhecida`, valor que nenhum leitor interpreta |
| ação corretiva com "Não sei", portão da PA e reavaliação glicêmica | `avc/nucleo/derivacoes-e.ts` | igual a nenhuma correção |

Nenhuma tela menciona a situação desconhecida.

**Agregação entre instâncias hoje:** exposta vence; senão, `cancelada_antes_do_inicio` vence qualquer outra; senão, vale a última. Com uma instância cancelada e outra "não sei", em qualquer ordem, o atendimento inteiro é lido como cancelado.

**Novo ou pré-existente:** `situacao_desconhecida` é novo do `5649ade`. A precedência da cancelada já existia no `52aa4e2`, e passou a esconder o desconhecido.

**Mapeamento proposto das formas atuais para as três, a confirmar pelo autor:**

| forma atual | triestado proposto |
|---|---|
| `exposta` | `exposta` |
| `nenhuma_administracao`, `cancelada_antes_do_inicio`, `antes_do_inicio` | `nao_exposta` |
| `situacao_desconhecida` | `desconhecida` |
| `registro_em_aberto`, instância aberta sem situação registrada | **a decidir**: o AVC-13 decidiu que formulário aberto não é conduta, e a E-23 separa não perguntado de "não" |

**A decidir pelo autor, sem regra clínica inventada:**
- **Agregação entre instâncias.** Proposta: `exposta` se alguma instância estiver exposta; senão `desconhecida` se alguma for desconhecida; senão `nao_exposta`.
- **O que cada consumidor faz com `desconhecida`.** Monitorização pós-IVT, alvo pressórico, imagem de controle antes de antitrombótico, pendência de interromper a infusão e plano até 48 h são condutas clínicas. Esta decisão exige só que nenhum deles trate `desconhecida` como `nao_exposta` em silêncio.
- **"Não sei" numa ação corretiva de Correções:** se entra na mesma semântica.

### 2 · A trilha não pode marcar como vigente um estado desfeito ou corrigido · defeito

**Decisão, nos termos do autor:** desfazer e corrigir precisam aparecer como eventos próprios, e o estado vigente deve ser derivado do estado reconstruído atual.

**O que o código faz hoje:**
- **Desfazer:** o gesto grava uma correção com valor vazio (`nao_perguntado`). A trilha filtra esse valor e continua exibindo, por exemplo, "Iniciada" como "situação vigente", enquanto o valor atual do campo está vazio.
- **Corrigir:** a correção aparece como transição comum. O fato carrega `tipo: "correcao"` e `corrigeFatoId`, mas a trilha não lê nenhum dos dois, então o valor corrigido aparece só como "registro anterior".
- **Vigente:** é a última linha listada, e não o valor atual da instância.

**Novo ou pré-existente:** a trilha é nova do `5649ade`, então o defeito também.

**Relacionado, pré-existente e a decidir:** a exposição por histórico continua contando um "Iniciada" depois desfeito ou corrigido. A saída é idêntica no `52aa4e2`. A pergunta é se uma **correção de registro**, que pela §3.4 significa que o valor nunca foi verdade, deve retirar a exposição. A HR-5 tratou "Iniciada seguida de Cancelada" como transição clínica, e não como correção.

### 3 · Separar horário do registro de horário clínico da ação · parcial

**Decisão, nos termos do autor:** separar `horário do registro` de `horário clínico da ação`.

**O que o código faz hoje:**
- O fato já tem os dois campos, `horaRegistro` e `horaClinica` opcional.
- A tela grava `ivt_estado` sem `horaClinica`. O único gravador com horário clínico é o registro da interrupção no caminho hemorrágico.
- A trilha mostra `horaClinica ?? horaRegistro` numa única linha, sem dizer qual dos dois é. O caminho hemorrágico faz o mesmo em `interrompidaEm`, e isso é pré-existente.
- O início da infusão mora no campo `ivt_inicio`, que a trilha não mostra.

**Referência:** a spec T06, bloco Rastreio, pede "horários reais".

**A decidir:** quais transições pedem horário clínico, e se ele é exigido ou opcional, à luz da E-49. Regra desta decisão: horário clínico ausente é declarado como ausente, e nunca substituído pelo horário do registro.

### 4 · "Responsável" reflete a identidade realmente disponível · parcial

**Decisão, nos termos do autor:** "responsável" deve refletir a identidade realmente disponível; sem identidade, declarar autoria não identificada, e não inferir responsável clínico.

**O que o código faz hoje:** a autoria vem do log (AC-40): `user.id` da sessão, ID do aparelho, sessão anônima ou não registrado. A trilha exibe "registrado neste aparelho, sem conta", "registrado em sessão anônima, sem conta", "autor não registrado", "registrado com conta" sem identidade, ou "autoria ainda não gravada". O comentário do componente afirma que "conta tem nome no módulo", e não tem.

**A decidir:** qual atributo da conta pode ser exibido, por privacidade, e se "responsável clínico" será um fato próprio. Hoje esse fato não existe.

### 5 · Retrocessos e contradições de estado precisam de política explícita

**Decisão, nos termos do autor:** não aceitar silenciosamente `administrado → indicado`, `interrompido → preparado` e casos equivalentes.

**O que o código faz hoje:** qualquer ordem é aceita. A exposição fica preservada, mas só "estado exposto seguido de Cancelada" é marcado como contraditório, pela HR-5. Medido:
- "Iniciada" seguida de "Prescrita", "Administrada/concluída" seguida de "Indicada" e "Interrompida" seguida de "Preparada": exposição preservada, nenhuma marca, e a trilha exibe o estado de antes do início como "situação vigente".
- "Cancelada" seguida de "Iniciada": exposta, sem marca.
- "Preparada" seguida de "Interrompida", sem "Iniciada": aceita como exposição pelo e2e do próprio commit.

**Opções para o autor:**

| opção | comportamento |
|---|---|
| A | recusar o registro do retrocesso |
| B | aceitar, marcar como contraditório na trilha e na exposição, e pedir correção ou motivo, como na HR-5 |
| C | aceitar só depois de confirmação explícita no gesto |

**Recomendação:** B. A trilha é append-only, o médico pode estar registrando um fato real fora de ordem, e o padrão já existe na HR-5.

**A decidir:** a ordem de referência. Proposta: indicado, decidido, prescrito, preparado, iniciado, administrado/concluído, com interrompido e cancelado como terminais. Também é preciso decidir se "interrompido" sem "iniciado" registrado é contradição, e se "cancelado" seguido de "iniciado" na mesma instância é retrocesso ou retomada legítima.

### 6 · Clique repetido não duplica transição idêntica

**Decisão, nos termos do autor:** clique repetido não deve duplicar transição idêntica.

**O que o código faz hoje, pela tela:** o D-PEND-19 ignora o segundo toque numa opção já marcada, e toda mudança de estado passa por `repeteOGestoAnterior`, a trava de toque duplo. Pelo gesto, a duplicação não foi reproduzida.

**Onde a duplicação existe:** o núcleo grava dois fatos idênticos se registrar for chamado duas vezes em sequência. A auditoria mediu isso chamando o núcleo diretamente. O único gravador de `ivt_estado` fora da tela é o caminho hemorrágico, que só grava com a infusão em curso. Pela tela, a trilha mostra duas linhas iguais na sequência marcar, "Limpar" e marcar de novo, e isso é consequência do item 2.

**Estado:** atendido no gesto, não garantido no núcleo. RQ-T06-03 consta como "não medido" na matriz de requisitos.

**A decidir:** se a garantia também fica no núcleo, recusando fato idêntico consecutivo na mesma instância, além da tela.

### 7 · Comentários que contradizem o comportamento e referências de arquivo erradas

**Decisão, nos termos do autor:** revisar comentários do código que contradizem o comportamento real, e corrigir referências de arquivo.

**Causa:** nos trechos do `5649ade`, o símbolo ⛔ ocupa o lugar de "não" e de "e". Várias frases passam a dizer o contrário do código.

| arquivo e linha no `5649ade` | o comentário lê | o código faz |
|---|---|---|
| `avc/conteudo/superficie-e.ts:81` | "Realizada" "é mais oferecido" | não é mais oferecido |
| `avc/conteudo/superficie-e.ts:91` | os rótulos já gravados "mudam" | não mudam |
| `avc/conteudo/superficie-e.ts:93` | "Não sei" "é nono estado" | não é estado |
| `avc/conteudo/superficie-e.ts:121` | rótulos antigos "são mais oferecidos" e "perdem o significado" | não são oferecidos e não perdem |
| `avc/nucleo/derivacoes-e.ts:31` | indicada a cancelada e "não sei" "contam"; "expor é resolver" | não contam; expor não resolve |
| `avc/nucleo/derivacoes-e.ts:38-39` | a trilha mora "aqui, onde o horário de registro pode entrar" | mora fora, porque ali o horário não pode entrar |
| `avc/nucleo/derivacoes-e.ts:154` | prescrita e preparada "são" correção | não são |
| `avc/nucleo/portao-ivt.ts:211` | prescrita e preparada "são gesto no paciente" | não são |
| `avc/nucleo/derivacoes-f.ts:1077` | antes do início é "exposição" | não é |
| `avc/nucleo/derivacoes-f.ts:1079` | "não sei" "vira sem exposição" | não vira nem sem exposição nem exposição |
| `avc/nucleo/derivacoes-f.ts:1093-1094` | fases "renomeadas, para regredir" | não renomeadas, para não regredir |
| `avc/nucleo/transicoes-da-acao.ts:4` e `:20` | "derivação clínica"; "não sei" é "estado" | não é derivação clínica; não é estado |
| `components/avc/superficie-f.tsx:1228` | "o estado antigo some" | não some |
| `components/avc/transicoes-da-acao.tsx:8` | a trilha vem de `avc/nucleo/derivacoes-e.ts` | vem de `avc/nucleo/transicoes-da-acao.ts` |
| `components/avc/transicoes-da-acao.tsx:22` | "conta tem nome no módulo" | não tem |
| `e2e/avc-rodada19.spec.ts:203` e `:210`, títulos de teste | "«Prescrita» → «Preparada» é exposição: o Destino mostra conduta" | o teste confere que não é exposição e não mostra conduta |
| `scripts/prova-avc-rodada19.cjs:587`, `:594`, `:596`, `:598`, `:661`, `:668`, nomes de conferência | "contam como exposição", "conta", "apaga", "regride" | as conferências medem o contrário |

**Sem guarda textual:** conforme a regra de desconfiar de guarda que mede texto de código, a revisão dos comentários não ganha teste automático. É conferida na revisão do commit.

### 8 · O que não muda

- O modelo da §8 da 19ª rodada: os 8 estados, "não sei" fora deles, a tabela de exposição, "interrompido" diferente de "cancelado" e a leitura do legado "Realizada".
- A não regressão medida para os 8 estados no plano até 48 h, no caminho hemorrágico, na persistência e na retomada.
- Nenhuma regra clínica nova. Os pontos marcados "a decidir" ficam com o autor.

### 9 · Decisões do autor que fecham os pontos bloqueados (2026-09-14)

**Decidido por:** Dr. Sandro Dainez, por escrito · **Autoriza implementação:** sim, na ordem desta seção, com testes vermelhos antes de cada item.

**Decisão, nos termos do autor:**
- **Triestado de exposição:** `exposta`, `nao_exposta`, `desconhecida`. "Não sei" não é um terceiro rótulo do estado da ação: ele afeta a certeza sobre a exposição.
- **Agregação entre instâncias**, conservadora mas não burra: qualquer evidência positiva de exposição vence a incerteza, e a incerteza vence a ausência de exposição.
  - qualquer instância `iniciado`, `administrado/concluído` ou `interrompido` → atendimento `exposta`;
  - nenhuma exposta e ao menos uma "não sei" → `desconhecida`;
  - só quando todas forem inequivocamente sem exposição → `nao_exposta`.
  - Exemplos: cancelada + não sei → `desconhecida`; preparada + não sei → `desconhecida`; iniciada + não sei → `exposta`; administrada + cancelada → `exposta`.
- **"Registro em aberto"** não é quarta categoria do triestado: é estado de completude documental, não de exposição. Aberto e sem evidência de exposição, pode produzir `desconhecida` se a abertura impede conclusão; os eixos não se misturam.
- **"Não sei" em ação corretiva:** mantém a semântica epistemológica, ausência de conhecimento, mas a consequência depende do tipo de ação. O triestado de exposição não é reaproveitado cegamente para toda intervenção; ele vale para o trombolítico e para intervenções em que exposição é clinicamente relevante.
- **Corrigir ou desfazer "Iniciada":** distinguir correção de erro documental de reversão do fato clínico.
  - «Limpar» não apaga a consequência clínica de uma exposição já registrada.
  - A exposição só deixa de existir por correção explícita do registro que a originou, com motivo e trilha; a trilha mostra que o registro anterior foi invalidado por correção.
- **Retrocesso de estado, opção B definida:** a alteração é tecnicamente permitida, mas marcada como correção ou contradição, com confirmação exigida quando viola a ordem causal. Não se bloqueia totalmente, porque erro de registro existe, e não se aceita em silêncio.
  - Ordem de referência: `indicado < decidido < prescrito < preparado < iniciado < administrado/concluído`.
  - `interrompido` e `cancelado` são terminais alternativos: `cancelado` só antes de `iniciado`; `interrompido` só depois de `iniciado`.
  - Movimento contrário à causalidade é correção explícita, não nova transição.
- **Horário clínico:** obrigatório para `iniciado`, `administrado/concluído` e `interrompido`; opcional para `prescrito`, `preparado` e `cancelado`; não pedido para `indicado` e `decidido` no V1. A tela sempre separa horário clínico de horário do registro; sem o clínico, mostra "Horário clínico não informado" e "Registrado às HH:MM".
- **Autoria:** o nome de exibição da conta ou sessão, quando existir, como "Registrado por: Dr. Fulano"; nunca e-mail, ID ou identificador técnico. Sem identidade suficiente, "Autoria não identificada". Evitar a palavra "responsável", que sugere responsabilidade clínica formal quando o sistema só sabe quem registrou.
- **Idempotência também no núcleo:** a mesma transição idêntica, na mesma instância, no mesmo estado, sem mudança de contexto, é ignorada. Marcar, limpar ou corrigir, e marcar de novo não é duplicação: são eventos distintos e aparecem na trilha.
- **Ordem de implementação:** 1 → 2 → 5 → 6 → 3 → 4 → 7. Primeiro a semântica de exposição, depois a trilha, depois a consistência temporal dos estados; horário e autoria dependem da trilha já correta.
- **Conduta clínica final diante de `desconhecida`: não implementar agora.** Cada consumidor deixa de colapsar para "sem trombólise" e passa a expor a incerteza. Depois se fecha, superfície por superfície, se cada uma apenas avisa, retém ou exige resolução.

**Como estas decisões são aplicadas no código, para conferência do autor:**
- **Registro em aberto:** uma instância aberta sem nenhum estado registrado não é evidência de exposição nem de ausência. Pela regra "só quando todas forem inequivocamente sem exposição", ela contribui `desconhecida` para a agregação. O eixo documental "em aberto" continua existindo à parte.
- **Consumidores diante de `desconhecida`, nesta rodada:** a conduta atual de cada um fica como está, e a incerteza passa a ser declarada junto dela. Nenhum consumidor passa a aplicar conduta de pós-trombólise nem retira a de antes.
- **Ações corretivas:** nenhuma mudança nesta rodada.
- **Horário clínico obrigatório:** a transição fica pendente de horário clínico até ele ser informado ou declarado desconhecido. A exigência nunca impede o registro do estado nem inventa horário, pela E-49 e pela E-52.
- **Idempotência, "sem mudança de contexto":** mesmo campo, mesma instância, mesmo valor e mesmo horário clínico, sem nenhum outro registro do campo naquela instância entre os dois.

### 10 · Segunda leva de decisões do autor (2026-09-14), depois dos itens 1, 2, 5 e 6

**Decidido por:** Dr. Sandro Dainez, por escrito, em resposta às perguntas levantadas na implementação. Ordem de implementação mantida: 1 → 2 → 5 → 6 → 3 → 4 → 7. Cada item só entra em commit com `test:all = 0`. Sem push.

**Item 3 · horário clínico**
- `Iniciada`: `ivt_inicio` é a única fonte de verdade do horário clínico. Não se cria segundo horário para o mesmo instante.
- `Administrada/concluída` e `Interrompida`: gesto próprio para o horário clínico, com "Informar horário" e "Horário desconhecido".
- Horário clínico e horário do registro permanecem separados; um nunca preenche o outro silenciosamente.
- E-49: o rascunho completo da checagem contra as 12 marcas de não-exigir é apresentado ao autor para decisão final antes do commit do item 3.

**Item 4 · autoria**
- Nome de exibição: `full_name`; se ausente, `nome`. Nunca derivar nome de e-mail.
- Permitido migrar o IndexedDB para a v4 para persistir o nome de exibição no evento.
- Eventos antigos permanecem "Autoria não identificada". Registro sem conta também exibe "Autoria não identificada".

**Item 6 · idempotência**
- Repetir o mesmo estado na mesma instância continua idempotente se não houve mudança real do estado da ação.
- Registros auxiliares no meio, como `ivt_inicio`, não tornam a repetição uma nova transição.
- Correção, desfazer ou mudança de estado tornam o evento novo.

**Item 5 · movimentos terminais**
- `Cancelada`, `Interrompida` e `Administrada/concluída` são estados terminais distintos.
- `Cancelada → qualquer outro estado`: somente como correção ou reabertura explícita, com confirmação.
- `Administrada/concluída → Interrompida` e `Interrompida → Administrada/concluída`: não são transição normal; somente correção explícita.

**Item 7 · comentários**
- Corrigir os 17 pontos do §7 e as 45 linhas acrescentadas nos itens 1 a 6 em que `⛔` foi usado como negação.
- Sem alteração de comportamento nesse commit.

**Como o item 5 aplica os terminais, para conferência do autor:** a saída de terminal é conferida depois das regras já existentes (cancelada depois do início, interrompida sem início, retrocesso), que continuam dando o nome da violação quando também se aplicam. Um terminal reaberto por correção explícita confirmada deixa de exigir confirmação para os registros seguintes; repetir o mesmo terminal não é saída.

### 11 · Item 3 · horário clínico: checagem E-49 aprovada e decisões finais (2026-09-14)

**Decidido por:** Dr. Sandro Dainez, por escrito, sobre o rascunho da checagem E-49 contra as 12 marcas de não-exigir.

**Checagem E-49 · aprovada.** Nenhuma das 12 marcas do índice de `auditoria/CONSOLIDACAO-CLINICA-AVC.md` é violada: o horário clínico é pedido depois de a ação começar ou terminar e não pode atrasar a própria trombólise. As marcas com relação indireta viram regressões automatizadas:
- **Marca 6** (observar resposta à IVT antes da EVT): pendência ou ausência de horário clínico nunca participa do veredito da EVT nem cria espera. Prova: o veredito da trombectomia e o portão da IVT são idênticos com o horário ausente, desconhecido e informado.
- **Marca 7** (hora da última dose de DOAC): ausência de horário clínico nunca é reutilizada nem inferida como horário de última dose de DOAC. Prova: a leitura do DOAC continua "não perguntada" e nenhum fato de última dose é gravado, em todas as variantes.

**Decisões finais:**
1. O dado de horário clínico é ligado explicitamente à transição correspondente e aparece no gesto e na trilha. Não entra na lista genérica de campos da Reperfusão e não é pré-requisito do portão da IVT.
2. `Iniciada`: `ivt_inicio` é a única fonte de verdade; não se cria segundo horário; o desconhecido declarado resolve a pendência como horário clínico desconhecido; o horário do registro nunca é substituto.
3. `Administrada/concluída` e `Interrompida`: exigem resolução documental do horário, informar ou declarar desconhecido. A ausência não bloqueia retrospectivamente IVT ou EVT nem altera elegibilidade.
4. `Prescrita`, `Preparada` e `Cancelada`: horário clínico opcional; a ausência não gera pendência.
5. `Indicada` e `Decidida`: sem horário clínico no V1.
6. Caminho hemorrágico: o horário do registro deixa de ser fallback da hora clínica da interrupção. Ausente ou desconhecido, fica assim; o horário do registro continua disponível na trilha, para auditoria.
8. «Limpar» (decisão final, 2026-09-14): a pendência de horário clínico continua enquanto a transição continuar válida para exposição. «Limpar» não invalida o fato clínico. A pendência só sai com correção explícita que invalide a transição, ou com o horário resolvido como conhecido ou desconhecido. Regressões na prova do AC-13 (bloco 3i) e mutação correspondente.
7. Os seis usos de `horaClinica ?? horaRegistro` fora do AC-13 (`ajuda.ts`, `avaliacao-anterior.ts`, `deterioracao.ts`, `plano-48h.ts`, `transferencia.ts`, `via-aerea-externa.ts`) ficam para rodada própria e não mudam neste item.

**Esclarecimento de nome, registrado na implementação:** a decisão 2 citou `ivt_inicio_desconhecido`. No código, esse identificador é a recomendação F-03 (IVT com início dos sintomas desconhecido, janela por DWI/FLAIR), outro conceito. O desconhecido declarado do início da administração é o próprio `ivt_inicio` respondido com "Horário desconhecido" (valor `nao_sei`). É esse que resolve a pendência de `Iniciada`.

**Como o item 3 aplica as decisões, para conferência do autor:**
- Campo `ivt_horario_clinico` (instância da trombólise, tipo hora, aceita desconhecido, `bloqueiaTerapia: false`, fonte F-15), gravado com `referenteAoFatoId` apontando para o registro da transição. Não é correção da transição.
- Informar de novo corrige o horário anterior da mesma transição; "Limpar" volta a não informado.
- Pendência documental por transição válida de estado obrigatório sem horário clínico; a transição corrigida por engano não gera pendência. A pendência entra nas pendências do caso e não é lida por portão, vereditos ou DOAC.
- A trilha mostra, em linhas separadas, "Horário clínico: …" (ou "desconhecido", ou "não informado") e "Registrado às …". Indicada e Decidida mostram só o horário do registro. Em Correções, o horário clínico só aparece quando foi gravado; nunca o do registro no lugar.

### 12 · Item 4 · como a autoria é aplicada, para conferência do autor (2026-09-14)

- **Uma regra em todas as telas.** A trilha das transições, o julgamento registrado na Reperfusão, a correção de campo, o histórico de aferições da Estabilização e o kit visual passam a usar o mesmo texto (`useTextoDeAutoria`). Com nome de exibição: «Registrado por:» e o nome. Sem nome, sem conta, em sessão anônima sem nome ou em evento anterior à v4: «Autoria não identificada». As marcas antigas («registrado neste aparelho, sem conta», «registrado em sessão anônima, sem conta», «autor não registrado», «registrado com conta», «autoria ainda não gravada») deixam de existir.
- **Históricos que passaram a mostrar autoria.** Marcos de transferência, teleconsulta e neurocirurgia; a linha do tempo do caso no Destino (piora, marcos, ajuda); os exames de Glasgow e de NIHSS com marca de sedação. Cada linha já trazia o fato de origem, então nenhuma autoria é inventada. A síntese do caso não mostra autoria.
- **De onde vem o nome.** `user_metadata.full_name` da sessão Supabase; se ausente ou em branco, `user_metadata.nome`. O e-mail nunca entra, nem como fallback.
- **Schema v4 do IndexedDB.** Todo evento declara `nomeDoAutor` (`null` quando não há nome). A migração v1, v2 e v3 grava `null`, sem inventar nome; `autor`, `origemDoAutor`, `dados` e `seq` não mudam.
- **Snapshot.** `nomeDoAutor` é gravado no evento no momento do registro, com a sessão daquele instante. A tela lê o nome do evento, nunca do perfil atual da conta: um fato registrado antes continua com o nome da época, mesmo que a conta mude de nome ou outra pessoa entre depois. Regressão na prova do AC-13 (bloco 4b).
- **Limite do e2e.** O navegador de teste não tem conta: o gesto real prova «Autoria não identificada». O caminho com nome é provado no núcleo (leitura da sessão, evento v4, rótulo).

### 13 · Invariantes de autoria do módulo (autor, 2026-09-15)

**Decidido por:** Dr. Sandro Dainez, por escrito, ao aceitar o item 4. Os três erros abaixo foram reencenados por mutação e reprovados pela prova do AC-13 (`scripts/mutacoes/autoria.cjs`); passam a ser invariantes do módulo:

1. **Nome nunca derivado de e-mail.** O nome de exibição vem só de `full_name` e, na falta dele, de `nome`.
2. **Identificador técnico nunca exibido como autoria.** Sem nome de exibição, a tela diz «Autoria não identificada», e nunca `user.id`, id do aparelho ou e-mail.
3. **Migração nunca inventa nome.** Eventos anteriores ao schema v4 ficam com `nomeDoAutor = null`, e nenhum enriquecimento retroativo acontece; o nome gravado é o snapshot do momento do registro.

### 14 · Encerramento formal do AC-13 (2026-09-15)

**Decidido por:** Dr. Sandro Dainez, por escrito, depois da auditoria final por mutação.

**AC-13 encerrado após auditoria por mutação: 7/7 invariantes protegidas; suíte 108/108 mutações reprovadas; test:all 667 e2e, EXIT=0.**

- **Invariantes protegidas:** triestado de exposição; «não sei» não vira ausência; terminais e retrocessos; trilha fiel a correção e desfazer; horário clínico separado do horário do registro; autoria como snapshot; persistência e legado sem reinterpretação. Cada uma tem prova ou e2e e ao menos uma mutação que quebra a regra de verdade e é reprovada pela trava (`scripts/mutacoes/ac13-invariantes.cjs`, `ac13-legado.cjs`, `horario-clinico.cjs`, `autoria.cjs`).
- **Commits:** item 1 `a45b226` · item 2 `8a51a2a` · item 5 `25de4a8` · item 6 `dd6cf25` · item 5, terminais `89aab11` · teste do AC-03r `4472a39` · item 3 `507cb86` · item 4 `770a791` · item 7 `917b31d` · validação por mutação `433134d`.
- **Não reabrir o AC-13** para os pontos abaixo; cada um segue em frente própria:
  - conduta clínica final diante de exposição `desconhecida` (decisão clínica separada, §9);
  - auditoria dos seis usos de `horaClinica ?? horaRegistro` fora do AC-13 (§11, 7);
  - possível sensibilidade à meia-noite em `e2e/avc-controle-de-data.spec.ts`, que usa o mesmo gesto de data e hora corrigido no AC-03r por `4472a39` (não medida).

## AC-15 · suspeita de HSA — decisões de 2026-09-15 e encerramento (blocos A e D)

**Decidido por:** Dr. Sandro Dainez, por escrito, em 2026-09-15. Matriz completa: `docs/avc/revisao/AC-15-matriz.md`.

**Mudança de rumo do produto (autor):** o app é **apoio à decisão médica**, sem submissão à ANVISA por ora; a decisão é do médico. O AC-15 fica restrito aos blocos A e D. O processo passa a ser proporcional: `test:all` completo por bloco.

**Decisões:**
- **E1:** «Incerto» em `suspeita_hsa` é suspeita ativa e retém. Só `suspeita_hsa` ativa a suspeita; déficit, NIHSS e horários não a criam.
- **E2:** «Não» posterior, a partir de «Sim» ou de «Incerto», não desativa. Encerram só a correção explícita do fato ou a resolução pela investigação.
- **E11:** limpar ou corrigir a suspeita não altera exames. Evidência confirmatória vale até a correção do próprio exame.
- **E13:** suspeita ativa é investigação pendente («Suspeita de HSA ativa — investigação pendente»), sem porta para o catálogo de manejo. HSA confirmada tem o fluxo de manejo.
- **E9 e E9b:** HSA confirmada é a terceira opção da TC sem contraste, «Hemorragia subaracnóidea identificada», sem renomear valores gravados. Em caso novo, HSA não é subtipo de HIC. O legado «Subaracnóidea» é lido como HSA confirmada, sem reescrita.
- **E14:** xantocromia presente é evidência confirmatória de HSA (revoga em parte a D3). Registrada; **não implementada**, porque a punção lombar é do bloco C, adiado.
- **Invariante:** evidência confirmatória domina «Não», «Limpar» e conclusão anterior de exclusão, até a correção do próprio exame.

**Implementado:** blocos A (derivado único `estadoDaSuspeitaDeHsa`, lido por portão, EVT, card, pendência, destino, síntese e tela G) e D (HSA confirmada com saída, nome e catálogo próprios), num commit só.

**Adiados, com a mudança para apoio à decisão:**
- **Blocos B e C:** resolução da suspeita pela TC <6 h, bloco de investigação (início da cefaleia, qualidade da TC, neurorradiologista, punção lombar e xantocromia), conclusão «HSA excluída após investigação» com atestação de autoria, e derivação da punção dural recente.
- **O que continua valendo no lugar deles:** a suspeita ativa retém até a correção do registro, o lado conservador.
- **Decisões guardadas para quando B e C voltarem:** E3, E4, E5, E6/E6b, E7/E7b, E8, E10 e E12, todas na matriz.

**Separado, para rodada própria:** trocar retenção ou bloqueio por alerta com confirmação do médico, no modelo de apoio. Decisão do autor, fora do AC-15.

## ARQ-APOIO-01 · modo de apoio à decisão clínica — decisões AP-1 a AP-10 (2026-09-15)

**Decidido por:** Dr. Sandro Dainez, por escrito. Mapa, proposta e implementação da F1: `docs/avc/revisao/ARQ-APOIO-01-mapa.md` (§10).

**Rumo:** o motor organiza evidência, critérios, doses, riscos e opções; o médico toma e registra a decisão. «Apoio» é decisão de produto e de UX. Não é garantia de enquadramento fora de SaMD; a avaliação regulatória fica para antes de comercializar.

**Categorias:**
1. **Informação:** não impede nada.
2. **Alerta clínico:** permite prosseguir com decisão médica registrada; subtipo **alerta crítico** nos casos graves da fonte.
3. **Dados a corrigir:** o sistema não conclui até corrigir.

**Decisões:**
- **AP-1:** alerta crítico para hemorragia, cortes laboratoriais, COR 3 e equivalentes. Prosseguir exige justificativa, autoria e horário. O registro de administração nunca é bloqueado.
- **AP-2:** justificativa obrigatória só no crítico ou em decisão contra recomendação forte.
- **AP-3:** autoria humana identificada em toda decisão; o motor nunca aparece como `user`; retrato dos critérios.
- **AP-4:** fora do escopo validado (menor de 18 anos, gestação, puerpério) sem contraindicação automática; aviso de escopo.
- **AP-5:** Reperfusão acessível e contextualizada no caminho hemorrágico.
- **AP-6:** peso de origem desconhecida é dado a corrigir; origem sempre registrada.
- **AP-7:** só rótulos mudam; valores persistidos ficam.
- **AP-8:** aviso permanente «Apoio à decisão clínica · decisão final do médico».
- **AP-9:** PCR na ARQ-APOIO-02.
- **AP-10:** estado derivado ≠ decisão médica registrada.

**Implementado:** F1 (portão da trombólise e telas E/F), com as quatro invariantes do autor (decisão ≠ alerta; «prosseguir» ≠ compatível; decisão incompleta nunca completa por inferência; mudança de decisão é registro novo). **Pendente:** F2 (AP-4, AP-5, AP-6, unificação dos registros de «não prosseguir», textos de D, e a escolha para os julgamentos antigos do D-139-3 sem atestação: compatibilidade legada marcada `legado_sem_atestacao_completa` ou revalidação), F3 (aviso permanente) e ARQ-APOIO-02 (PCR). AC-13 e AC-15 A/D não são reabertos; AC-15 B/C voltam depois desta rodada, terminando em decisão médica registrada.

## Pendentes do autor em 2026-09-13 (não implementar)

- ~~AC-43, AC-15, janela de puerpério~~: decididos pelas D-PEND-22, D-PEND-23 e D-PEND-24.

## D-140 · «Piora clínica: o que fazer agora» e a hierarquia do «Preciso de ajuda» (autor, 2026-09-16)

Nasceu do uso real: *«esse preciso de ajuda, paciente piorou não entendi bem porque ele leva só em tela de anotações e
não de ações»*. Registrar não é conduzir.

**Decidido — piora (D-140):** depois de registrar a piora, abrir uma tela «Piora clínica — o que fazer agora» contendo
**somente**: reavaliar ABCD; repetir a avaliação neurológica/NIHSS; e, havendo trombolítico em curso ou exposição
registrada, a conduta **já existente** da Table 7. Roteador, sem conteúdo clínico novo. **Piora isolada não diagnostica
hemorragia nem cria nova contraindicação** — e isso é o invariante que a prova protege (`D140-INVARIANTE`).

**Nuance do autor, aplicada:** «interromper a infusão» só aparece com infusão **efetivamente em curso**; com exposição
concluída, aparece só a TC de emergência. A prova vermelha original exigia as duas condutas com exposição concluída
(interromper apenas sem gesto); foi **corrigida antes de implementar**, com o ajuste declarado — mandar interromper
uma infusão que não está correndo é ruído na tela em que o médico tem menos tempo.

**Decidido — «Preciso de ajuda» (hierarquia, não reconstrução):** a leitura mudou durante as provas vermelhas. O
roteamento **já existia** («Abrir Destino» já estava lá); o defeito era de ordem de importância. Então:

- sai o texto tipo «Este módulo não tem conteúdo sobre…» como manchete;
- o caminho clínico existente é a ação principal;
- «Registrar conduta feita fora do app» permanece, como **ação secundária explícita**: fechada por padrão, atrás de um
  toque («Registrar conduta realizada fora do app»);
- o registro continua auditável exatamente como antes — esconder ou mostrar o campo **não muda regra clínica nenhuma**;
- onde não houver caminho real no app, cabe uma mensagem curta — nunca como manchete dominante.

**Razão declarada pelo autor:** na primeira dobra o médico deve ver só o que o app consegue fazer agora — reavaliar
ABCD/NIHSS, ir para Destino, ou abrir a tela de piora.

## Ordem dos grupos em Paciente — antecedentes antes das medicações (autor, 2026-09-16)

Achado do uso real: «antecedentes tem que ficar antes das medicações e não depois».

**Decisão, na redação do autor:** «Antecedentes crônicos passam a ser apresentados antes de Medicações habituais,
preservando todos os ids, persistência e estado inicial recolhido. A mudança é exclusivamente de ordem de
apresentação.»

O autor recusou explicitamente registrar como justificativa formal a leitura de UX que eu havia proposto («quem é o
paciente → o que ele tem → o que ele toma»): boa leitura, mas não é decisão documental dele.

**Não revoga a AC-03:** «população em primeiro» continua valendo. Nunca se decidiu que antecedentes ficaria por
último — ele era apenas o grupo que entrou por último, em 2026-09-07, quando cinco grupos mudaram de casa para a
Avaliação AVC. Antes desta decisão, `docs/decisoes.md` não tinha nenhuma linha sobre esta ordem.

**Recorte:** ordem `população → identificação → basais → alergias → antecedentes crônicos → medicações`; antecedentes
continua `recolhido: true` (subir de posição não muda a natureza dele, e a trava de recolhimento fica); nenhum id,
valor persistido, regra clínica ou consumidor muda; ajustada somente a trava que fixa a ordem
(`scripts/prova-avc-paciente.cjs`).

## Glicemia — a tela mostra só a formulação correta (autor, 2026-09-16)

Achado do uso real: o bloco «Leituras antigas que hoje estão erradas» exibia a frase errada riscada, em cinza, acima
da correta.

**Decisão, na redação do autor:** «A frase errada, mesmo riscada e em cinza, continua cognitivamente disponível e pode
ser capturada de forma rápida sob pressão. O "desaprendizado" faz sentido em material de estudo, mas não precisa
competir com a conduta correta dentro do fluxo de emergência.»

**A distinção que a decisão faz:** memória do **sistema** não é conteúdo de **tela**.

- `ERROS_A_EVITAR` permanece no conteúdo e na trava, como proteção anti-regressão: o sistema segue sabendo quais
  interpretações antigas não podem voltar a ser apresentadas como verdade.
- A tela clínica não renderiza mais o campo `errado`; mostra apenas `correto`.
- A trava que exigia a exibição (`prova-avc-glicemia.cjs`, com a razão «correção que não é exibida não corrige
  ninguém») foi **invertida**, não removida — e ficou mais apertada, medindo as duas metades: `.correto` chega à tela,
  `.errado` nunca. A linha que exige as cinco leituras declaradas no conteúdo continua intacta.
- Título passou a «Formulações corretas» (nenhuma trava exigia o antigo). Nenhuma regra clínica, limiar, cálculo,
  verbatim ou persistência muda.

**Revoga a decisão anterior** que mandava exibir os erros para desaprendizado — decisão boa para material de estudo,
inadequada para o fluxo agudo deste app.
