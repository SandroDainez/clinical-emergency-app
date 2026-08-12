# Dívidas conhecidas

Divergências que existem **de propósito**, com a razão de ainda existirem e
onde fecham. Este arquivo existe para que nenhuma delas vire divergência
invisível daqui a vinte sessões: o que está aqui foi decidido, não esquecido.

Uma dívida sai desta lista quando é **fechada**, não quando é esquecida.

---

## D-1 · Meta de PAS no TCE: o texto estratifica, a lógica não

**Estado:** aberta · criada em 2026-08 · fecha na auditoria do módulo **TCE**

**O que diverge.** As 6 ocorrências da meta de PAS no TCE (politrauma × 2,
tce × 4) exibem a estratificação da BTF:

> PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos)

Mas a lógica em `politrauma-decision-tree.ts` (`c_dados`) aplica **110 liso**
quando há suspeita de trauma craniano. Um paciente de **60 anos com PAS 105**
está na meta segundo o texto que ele lê, e a derivação o marca como hipotenso.

**Por que não foi corrigida junto.** Aplicar a estratificação exige coletar a
**idade** no passo `c_dados` — um campo que não serve aos outros seis módulos
que consomem `camposDeInstabilidade()`. A decisão foi implementar o 110 liso
agora e tratar a idade na auditoria do TCE, onde ela entra como parte natural
do fluxo.

**Por que é tolerável até lá.** A direção do erro é **sobre-triagem**: o app
marca como hipotenso quem a diretriz não marcaria, na faixa dos 50–69 anos.
Erra para o lado de tratar. O erro oposto — deixar de reconhecer hipotensão em
quem tem lesão cerebral — não acontece.

**⚠️ PRÉ-REQUISITO — leia antes de fechar esta dívida.**

Fechar o D-1 exige coletar **idade**, e `idade` é campo do contexto do paciente
(`lib/contexto-do-paciente.ts`) — ou seja, vai **atravessar módulos**. Hoje esse
canal **não tem contrato**: `guardarNoContexto` valida só o nome do campo e
aceita qualquer string como valor (ver **D-7** e **R-9**).

Foi exatamente esse mecanismo que fez `"m"` significar Mulher no EAP e Masculino
no motor de ventilação, com Vt 27 mL maior em SARA. Fechar o D-1 sobre o canal
como ele está hoje coloca a **meta de PAS do TCE** — decisão de perfusão
cerebral — dependendo de um valor que ninguém valida na entrada nem na leitura.

**Então: o contrato de `idade` (domínio, faixa plausível, normalização que
RECUSA o que não reconhece) entra ANTES da estratificação da BTF, não depois.**

**Como fechar.** Coletar idade no fluxo do TCE, passar a idade para o limiar, e
substituir `(v) => (v.traumaCraniano === "sim" ? 110 : 90)` por uma função que
leia a faixa etária. O fato `meta-de-pas-no-tce` em
`scripts/valida-consistencia-clinica.cjs` já garante que o TEXTO permaneça
estratificado — falta a lógica alcançá-lo.

**Este caso é um exemplo do padrão que a varredura de desatualização procura**
(evidência mais nova que a ramificação implementada). Foi criado por nós, é
conhecido, e mesmo assim aparece na lista — a lista precisa refletir o app, não
o app menos o que a gente mesmo criou.


---

## D-2 · Bicarbonato na CAD: evidência de 2024, ramificação de 2009

**Estado:** aberta · fecha na auditoria do módulo **CAD/EHH**

O nó `bicarbonato` de `dka-hhs-decision-tree` traz na evidência:

> *"Consenso 2024: considerar bicarbonato APENAS na acidose grave com pH < 7,0
> (a faixa 6,9–7,0 abaixo vem do protocolo clássico e virou opcional)"*

E oferece, logo abaixo, as duas faixas como **ramos equivalentes**, com as doses
de 2009. O módulo sabe que está desatualizado, escreveu isso, e manteve a
estrutura. Os dois ramos ainda levam ao mesmo nó, que exibe as duas doses sem
usar a faixa escolhida.

**A pergunta certa não é como selecionar a dose** — é se a faixa 6,9–7,0 deve
deixar de existir como ramo. Corrigir a seleção automatizaria a versão antiga.

Encontrado por `npm run mapa:desatualizacao`.


---

## D-3 · Módulos sem nenhuma fonte citada no conteúdo

**Estado:** aberta · criada em 2026-08 · **lista corrigida em 2026-08** · fecha
módulo a módulo, na Fase 1

**Os seis:** abdome agudo · dispneia · intoxicações exógenas · politrauma ·
RSI · TCE. Mais **choque**, que só cita "2000" — e esse 2000 é o volume de
cristaloide, não um ano.

**A lista original dizia OITO e estava errada.** Incluía a **ventilação
mecânica**, que na verdade cita ARDSNet (NEJM 2000), Berlim 2012, Amato 2015,
ACCP/ATS 2017, Nova Definição Global de SDRA (2024) e AMIB/SBPT 2024 — em texto
visível. O inventário exigia que o ano viesse colado a uma sigla de uma lista
escrita à mão, e a lista tinha `AMIB` mas não tinha `ATS`, `ACCP`, `SBPT`, `ERS`
nem `ESICM`.

**O erro custou mais que uma linha na lista:** o D-3 foi usado para ordenar a
auditoria, então decisões de sequência foram tomadas sobre dado errado.

**O instrumento foi refeito com dois sinais de defeitos opostos** — procedência
reconhecida (preciso, subnotifica) e anos crus (ruidoso, mas não subnotifica por
vocabulário). Módulo sem NENHUM ano cru realmente não cita nada; módulo com ano
cru e sem procedência é onde o vocabulário provavelmente falhou, e se lê antes
de acusar. O vocabulário foi **extraído do conteúdo do app**, não adivinhado.

**Por que isso é dívida e não detalhe.** Num produto de ensino com plano pago,
conteúdo clínico sem rastreabilidade de fonte é problema por si só — o leitor
não tem como conferir, e o app não tem como saber quando revisar.

**Como fechar.** Cada um destes, ao ser auditado na Fase 1, **termina com a
diretriz e o ano explicitados no conteúdo** — não só no `guidelines_metadata`.


---

## D-4 · Apresentações de fármaco não conferidas contra a realidade brasileira

**Estado:** aberta · criada em 2026-08 · varredura pendente

A dopamina entrou no app com a ampola norte-americana (40 mg/mL) e ficou lá
até a auditoria de Vasoativas. A pergunta que sobra não é se a dopamina foi
corrigida — foi — e sim **quantas outras tabelas de apresentação têm a mesma
origem**.

As 10 drogas de Vasoativas estão fechadas: todas com `fonte` declarada e o
build recusando quem não declarar. **Faltam todos os outros módulos** que
citam ampola, frasco, concentração ou percentual de solução. Os de maior
preocupação, por terem dose peso-dependente: Sedoanalgesia & BNM, Correções
eletrolíticas, Farmacologia no ACLS, Anafilaxia, ISR e Convulsões.

**Como fechar.** Varrer o app inteiro atrás de qualquer apresentação de fármaco
(mg/mL, mg/ampola, U/mL, % de solução), confrontar com o que se comercializa no
Brasil, e reportar a lista com a fonte de cada divergência antes de corrigir
qualquer coisa.


---

## D-5 · Scripts que detectam e saem 0

**Estado:** parcialmente fechada · criada em 2026-08

Ver **R-2** e **R-3** em `auditoria/METODO.md` para o método que saiu daqui.

**Fechado.** `auditoria-maquinas-estado.cjs` passou a sair 1. As sete travas
soltas foram ligadas ao `test:all`, e `test:pipeline` impede que a próxima
nasça fora. `valida-vasoativos.cjs` relata falha de compilação em vez de morrer
com stack trace.

**Aberto — dois scripts ainda detectam sem travar:**

| Script | Situação |
|---|---|
| `auditoria-acls.cjs` (`audit:acls`) | calcula divergências duras do comportamento do ACLS (nº de doses de antiarrítmico, ciclo em que caem) e **sai 0 sempre** — não tem `process.exit`. É trava vestida de mapa. Hoje reporta 0 divergências. |
| `valida-rastreabilidade.cjs` (`audit:rastreabilidade`) | o nome promete portão, conta `erros`, e o único `process.exit(1)` é guarda de arquivo ausente — o veredicto final sai 0. Hoje reporta 0 erros. |

Ambos passam hoje, então ligá-los é inerte no presente; o valor é futuro.
**Decisão pendente:** virar trava, ou renomear para `mapa:` e assumir que são
mapas.

**Aberto — um script quebrado:** `validate:acls-microcopy` morre com
`MODULE_NOT_FOUND` (`scripts/validate-acls-microcopy.cjs:91` requer arquivo que
não existe mais). Não está no `test:all`, então nunca foi notado. Não é ponto
cego de veredicto: é script morto.


---

## D-6 · O degrau conservador de PEEP merece revisão à luz da literatura pós-2000

**Estado:** aberta · criada em 2026-08 · **decisão de conteúdo, sessão própria**

O módulo de ventilação entrega PEEP sistematicamente **abaixo** da tabela
low-PEEP do ARDSNet, e a distância cresce com a FiO₂:

| FiO₂ | App | Low-PEEP ARDSNet |
|---|---|---|
| 0,6 | 8 | 10 |
| 0,8 | 10 | 14 |
| 1,0 | **12** | **18–24** |

**A escolha atual é deliberada e está registrada no conteúdo** (ver a tabela
visível no módulo): a low-PEEP é o braço CONTROLE de um ensaio de 2000, em
população selecionada, e a PEEP que ela prescreve em FiO₂ 1,0 pressupõe
titulação e monitorização que o cenário de emergência frequentemente não tem.
Este app é de emergência, não de UTI com titulação ecoguiada.

**⚠️ CITAÇÃO INVERTIDA — o achado que muda a gravidade desta dívida.**

A linha `:205` de `ventilation-decision-tree.ts` diz:

> *"Tendência atual: PEEP mínimo para SpO₂ ≥ 88% sem DP > 15 (ART aumentou
> mortalidade com recrutamento agressivo)."*

O **ART** (Cavalcanti AB, et al. *JAMA.* 2017;318(14):1335–1345) testou manobra
de recrutamento agressiva — escalonamento até **PEEP 35 cmH₂O e pico de 50** —
seguida de PEEP titulada pela melhor complacência estática. **O braço controle
era a própria tabela low-PEEP do ARDSNet.** O braço experimental aumentou a
mortalidade em 28 dias.

Ou seja: o ensaio é argumento contra **manobra de recrutamento**, e o seu
comparador seguro é **justamente a low-PEEP**. Usar o ART para justificar ficar
ABAIXO da low-PEEP transforma o braço controle do estudo em algo a evitar.

**Isto não é citação desatualizada — é citação invertida.** Um leitor que confie
nela sai com a conclusão OPOSTA à do estudo. Num app de ensino, isso é pior que
não citar nada: a fonte empresta autoridade a uma afirmação que ela contradiz.

**A pergunta que esta dívida precisa responder, e que é de outra natureza:**

> Existe alguma outra citação no app sustentando conclusão que o estudo não
> sustenta?

As varreduras feitas até aqui checam se a fonte **existe** e se é **atual**
(D-3, inventário de procedência). Esta checa se a fonte **diz o que o app afirma
que ela diz** — e não há instrumento para isso. O ART apareceu por acaso, ao
conferir outra coisa.

**Correção de premissa, registrada porque explica uma decisão.** A escolha
original de manter o degrau conservador partiu de "o app adota postura
conservadora deliberada". Não era postura única: o MOTOR estava isolado, mais
baixo que o texto do próprio módulo em dois outros lugares (árvore `:205` e o
card de configuração, ambos 8–13 / 13–18). Divergência interna foi lida como
escolha editorial. A decisão sobre a TABELA (mostrar a low-PEEP como referência,
com os valores do app ao lado) continua valendo; a razão dada para ela era
parcialmente falsa, e por isso a coluna "valores do app" exigiu uma decisão a
mais — o motor subiu para a faixa da árvore.

**O que fica para decidir com calma:** se o degrau conservador deve ser revisto
por completo à luz de **ART, LOVS, EXPRESS e das meta-análises de PEEP alta em
SDRA moderada-grave**. Não é dívida de implementação — é decisão de conteúdo
clínico, e merece sessão própria com as fontes abertas.

Registrada a pedido do Sandro, para não virar decisão tomada de passagem.


---

## D-7 · O contexto do paciente é um canal sem contrato

**Estado:** aberta · criada em 2026-08 · **sem divergência de significado
pendente** — o `"m"` era o único, e foi fechado no bloco de segurança da
ventilação

**O canal.** `lib/contexto-do-paciente.ts`, lista fechada de 5 campos:
`peso · pesoOrigem · altura · sexo · idade`. Dois pontos de acesso apenas:
`acls-decision-flow-screen.tsx` (todas as árvores) e
`ventilator-configurator-card.tsx` (altura e sexo).

**Estado de cada campo, hoje:**

| Campo | Escreve | Domínio | Lê | Alimenta dose? |
|---|---|---|---|---|
| `peso` | 9 árvores + calculadoras | numérico, **kg em todos os 10 pontos** | 6 árvores em `derive` | **sim** — todas as doses mg/kg |
| `altura` | EAP, ventilação, card | numérico, **cm nos 3** | ventilação, EAP, calculadoras | **sim** — PBW → Vt |
| `sexo` | EAP, ventilação, card | `masculino`/`feminino` nos 3 | idem | **sim** — PBW → Vt |
| `pesoOrigem` | 9 árvores | `estimado`/`real` nas 9 | **ninguém** | não |
| `idade` | **nenhuma árvore** | — | — | — |

**Nenhuma divergência de unidade ou de significado permanece.** Peso é kg em
todos os pontos, altura é cm em todos, e sexo ficou uniforme depois da
correção. O `"m"` foi caso isolado.

**Mas o canal continua sem contrato**, e é isso que o torna dívida:

1. **`guardarNoContexto` valida só o NOME do campo.** Aceita qualquer string
   como valor — nenhum domínio, nenhuma unidade, nenhuma faixa. O `"m"` só foi
   possível porque nada checa.
2. **Leitura com cast, não com validação.** `ventilator-configurator-card.tsx`
   faz `lerDoContexto("sexo")?.valor as Sexo` — afirma o tipo em vez de
   verificar. Um valor legado entraria como `Sexo` sem passar por nada. Hoje o
   estrago é contido porque `predictedBodyWeight` recusa o que não reconhece,
   mas a contenção está do lado errado.
3. **`pesoOrigem` é perguntado em NOVE módulos e lido por nenhum.** Nove
   perguntas ao médico, em emergência, para um dado que nada consome. Ou ele
   passa a informar alguma decisão (dose por peso estimado merece ressalva), ou
   sai dos formulários.
4. **`idade` está na lista de compartilhados e nenhuma árvore a coleta.** Só as
   calculadoras usam idade, e elas não tocam o contexto. Entrada morta.

**Como fechar.** Domínio declarado por campo (valores válidos + unidade),
`normalizar<Campo>` obrigatório na leitura, e decisão sobre `pesoOrigem` e
`idade`. Ver **R-9** em `auditoria/METODO.md`.


---

## D-8 · O fallback de texto livre do roteador de cenário mantém o defeito do R-8

**Estado:** aberta · criada em 2026-08 · **alcançável hoje**, não teórica

Os doze presets de cenário clínico da ventilação passaram a **declarar** o seu
cenário (tabela `CENARIOS`), e o casamento por substring sobreviveu apenas como
fallback para texto livre. Esse fallback mantém, por natureza, o defeito do
**R-8**: vocabulário enumerado subnotifica.

Demonstrado: `"SDRA descartada, hipoxemia difusa"` → roteia para **`ards`**. A
regra trata `"sem sdra"`/`"não sdra"`, e não trata `"descartada"`,
`"não preenche Berlim"`, `"afastada"`, `"excluída"`.

**O campo aceita entrada livre? SIM — e por isso a dívida é alcançável.**
`clinicalScenario` é renderizado por `components/protocol-screen/auxiliary-panel-card.tsx`,
que desenha **sempre um `TextInput`**, com os presets como botões de
conveniência abaixo. É exatamente a mesma estrutura do campo `sexo`, onde o
risco também parecia teórico e não era: foi por ali que `/^m/i` leu "Mulher"
como masculino.

**A diferença em relação ao caso do sexo** é a direção do erro. Ali um valor
livre trocava o sexo do paciente e mudava a dose. Aqui um texto livre não
reconhecido cai em `generic`, que é o cenário conservador — o dano é receber
ajuste genérico em vez do específico, não receber o ajuste errado. **Exceto**
no caso demonstrado: `"SDRA descartada"` não cai em `generic`, cai em `ards`,
que é ativamente a estratégia oposta à marcada.

**Como fechar.** Duas saídas, e a escolha é de UI:

1. **Tirar a entrada livre deste campo** — cenário clínico é escolha de lista,
   não texto. Fecha o problema na raiz e é coerente com a lista ser fechada.
2. **Manter a entrada livre e aplicar o R-8**: somar um segundo sinal sem
   vocabulário — texto livre não reconhecido com alta confiança cai em
   `generic` e a tela DIZ que caiu, em vez de adivinhar.

A saída 1 é mais simples e provavelmente certa; fica para o redesign de UI, que
é onde a decisão pertence.
