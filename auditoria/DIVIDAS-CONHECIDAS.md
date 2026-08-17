# Dívidas conhecidas

Divergências que existem **de propósito**, com a razão de ainda existirem e
onde fecham. Este arquivo existe para que nenhuma delas vire divergência
invisível daqui a vinte sessões: o que está aqui foi decidido, não esquecido.

Uma dívida sai desta lista quando é **fechada**, não quando é esquecida.

---

## D-1 · Meta de PAS no TCE: o texto estratifica, a lógica não

**Estado:** ✅ **FECHADA** em 2026-08-15, na auditoria do **POLITRAUMA** — antes
do previsto, e a razão é um achado sobre a própria dívida.

**Por que fechou aqui e não no TCE.** O argumento que justificava adiar era que
coletar a idade exigiria um campo "que não serve aos outros seis módulos que
consomem `camposDeInstabilidade()`". A auditoria conferiu: **o passo não é
compartilhado.** `traumaCraniano` já era campo LOCAL da árvore do politrauma —
busca no app inteiro retorna um único arquivo. O que é compartilhado é a FUNÇÃO
de campos, não o passo que a usa.

Com isso a idade entrou do mesmo jeito — campo local —, **sem passar pelo
contexto do paciente** e portanto **sem depender do contrato do canal (D-7)**,
que era a condição imposta quando esta dívida foi registrada. A D-7 continua
aberta como dívida separada; se algum dia a idade precisar vir pelo contexto, a
condição volta a valer.

**Como foi fechada.** `lib/pas-no-tce.ts` passou a ser dona do texto E da lógica:
`limiarDePasNoTce(idade)` devolve 100 na faixa 50–69 e 110 nas demais — e **110
quando a idade não é informada**, mantendo a direção de sobre-triagem que tornava
a dívida tolerável. As **seis ocorrências de texto** (politrauma × 2, TCE × 4)
consomem a mesma constante: fechar a lógica e deixar textos soltos recriaria o
problema pelo outro lado.

Conferida por EXECUÇÃO em `scripts/valida-politrauma.cjs`, incluindo o caso que
a dívida citava — 60 anos, PAS 105.

*(Registro original abaixo.)*

**Estado original:** aberta · criada em 2026-08 · fecharia na auditoria do TCE

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

## D-2 · Bicarbonato na CAD — ✅ FECHADA (2026-08-16)

A dívida perguntava: *"a faixa 6,9–7,0 deve deixar de existir como ramo?"*
Fonte aberta (Umpierrez et al., Diabetes Care 2024;47:1257–1275, PDF integral):
**sim.**

> *"Routine bicarbonate administration is not recommended."*
> *"…bicarbonate administration should be considered if the acidosis is severe
> (i.e., pH < 7.0)."*
> *"If indicated, then 100 mmol of sodium bicarbonate (8.4% solution) in 400 mL
> of sterile water (an isotonic solution) can be given every 2 h to achieve a
> pH > 7.0."*

Um limiar, uma dose. A faixa 6,9–7,0 com 50 mEq é de 2009 — o app tinha TRÊS
ramos onde a fonte tem DOIS estados, e o do meio prescrevia METADE da dose a
quem a diretriz atual trata com a dose cheia.

⚠️ **E a D-2 era a ponta de um padrão:** ao abrir a fonte, apareceram mais SEIS
números de 2009 sob o rótulo de 2024. Está registrado no METODO como acréscimo
ao R-52, e a varredura correspondente é a **D-36**.

## D-3 · Módulos sem nenhuma fonte citada no conteúdo

**Estado:** aberta · criada em 2026-08 · **lista corrigida em 2026-08** · fecha
módulo a módulo, na Fase 1

**Os cinco:** abdome agudo · dispneia · intoxicações exógenas · politrauma ·
TCE. Mais **choque**, que só cita "2000" — e esse 2000 é o volume de
cristaloide, não um ano.

*(O ISR saiu da lista em 2026-08: a auditoria do módulo declarou a fonte no
conteúdo — Walls 6ª ed. 2023 + DAS 2015 — e o inventário passou a reconhecê-la.)*

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

## D-4b · Acréscimos da auditoria do ISR para a vez da Sedoanalgesia

**Estado:** ✅ **FECHADA** em 2026-08, na auditoria de Sedoanalgesia & BNM.

Etomidato (2 mg/mL, ampola 10 mL — Hypnomidate/Blau/Cristália) e succinilcolina
(100 mg pó, frasco-ampola — Succinil Colin/União Química, registro ANVISA
1.0497.0206.003-6) entraram com bula e com dose de indução declarada.

**Uma das 5 apresentações do R-6 SAIU da lista por não se confirmar:**
**cisatracúrio 5 mg/mL** (frasco 30 mL, Nimbex Forte). Existe documento na
ANVISA por fabricante espanhol (Reig Jofré) e a apresentação existe
internacionalmente, mas **não se confirmou comercialização no Brasil** — o que
circula aqui é 2 mg/mL (CIS/Cristália, Cisauni/União Química). A lista das 5
veio de leitura de mercado; **quatro se confirmaram em bula, uma não.** Fica
registrado para que a próxima leitura de mercado seja tratada como hipótese até
a bula abrir (R-5).

*Registro original abaixo, para histórico:*

- **Etomidato e succinilcolina não existem na tabela de Sedoanalgesia** — os
  dois agentes mais específicos da ISR. *Achado de ausência, verificado por
  grep pelos nomes na lista de drogas do `sedation-engine`* (0 ocorrências de
  etomidato; succinilcolina só citada de passagem).
- As 5 apresentações da fila do R-6 (propofol 2%, midazolam 1 mg/mL, morfina
  1 mg/mL, dexmedetomidina 4 mcg/mL, cisatracúrio 5 mg/mL) — com bula aberta,
  e o campo `fonte` obrigatório estendido àquela tabela.

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


---

## D-9 · Constantes deriváveis ainda conferidas por comparação

**Estado:** aberta · criada em 2026-08 · ver **R-17**

`test:eletrolitos` recalcula as constantes a partir da massa molar do NaCl e do
cálcio — **é a única trava do app que faz isso** (7 pontos). Todas as demais
comparam o número escrito com um número esperado, e comparação não atravessa
erro consistente: se o app e a expectativa erram igual, passa. Foi assim que a
dopamina norte-americana conviveu com um rótulo internamente coerente.

**Onde replicar, por ordem de consequência:**

| Onde | O que é derivável | Hoje |
|---|---|---|
| `vasoactive-engine` · 19 `basePerAmpoule` | mcg por ampola = mg/mL da bula × volume | conferido só contra o rótulo do atalho |
| `sedation-engine` · 18 `basePerAmpoule` | idem | idem |
| **osmolaridade calculada** — `clinical-calculators`, `dka-hhs-engine`, `tep` | `2×Na + glic/18 + ureia/6`: o **18** vem da massa molar da glicose (180) e o **6** da ureia em mg/dL; **2,8** seria para BUN | nenhum recálculo — e a distinção ureia × BUN **já causou** um erro de ~2× documentado no TCE |
| MgSO₄ 50% = **4,06 mEq/mL** | 500 mg/mL × (24,31 ÷ 246,5) ÷ 12,15 | escrito, não recalculado |
| Cálcio elementar fora do módulo de eletrólitos | igual ao que a trava de eletrólitos já faz | não conferido |
| Percentuais de solução em geral (SG 5%, SF, glicose 50%) | g/L ÷ massa molar | não conferidos |

**Como fechar.** Uma função compartilhada de derivação (`mEqPorMl(sal, percentual)`,
`mcgPorAmpola(mgPorMl, volumeMl)`) usada pelas travas — não pelo app, que já tem
os números — e cada trava passando a recalcular em vez de comparar. O ganho é
concentrado nos dois primeiros itens: 37 `basePerAmpoule` que hoje só são
conferidos contra o próprio rótulo.


---

## D-10 · Fármaco rastreado, conduta não rastreada

**Estado:** aberta · criada em 2026-08 · **perfil a conferir nos módulos restantes**

Encontrado na auditoria de Correções eletrolíticas, e é **mais fino que o D-3**.

O D-3 pergunta *"o módulo cita alguma fonte?"*. Este módulo **cita** — e mesmo
assim tinha um buraco que o D-3 não enxerga:

| | Procedência |
|---|---|
| **Fármacos** (gluconato de cálcio, KCl, fosfatos, MgSO₄) | ✅ bulas oficiais (DailyMed), citadas no `guidelines_metadata` |
| **Estratégias de correção** (velocidade do sódio, limiares, metas, bólus de resgate) | ❌ *"recomendações amplamente aceitas"* |

**Bula não é diretriz, e "amplamente aceitas" não é fonte.** A bula diz o que a
droga é e como se administra; ela não diz a que velocidade corrigir o sódio nem
quando parar. É exatamente a conduta — a parte que o app ENSINA — que ficava sem
lastro.

**Fechado para o sódio:** a estratégia passou a citar Spasovski G, et al.
*Intensive Care Med.* 2014;40:320–331 (ESICM · ESE · ERA-EDTA/ERBP), de onde
vêm o teto de correção, o bólus de resgate e a conduta na sobrecorreção.

**Aberto:** potássio, cálcio, magnésio, fósforo e cloro seguem com bula para o
fármaco e nada para a estratégia.

**A pergunta que esta dívida deixa para os módulos restantes:** o perfil se
repete? **Nenhum instrumento atual mede isso** — o inventário de procedência
(`mapa:desatualizacao`) conta anos e siglas no conteúdo, e não distingue "fonte
do fármaco" de "fonte da conduta". Um módulo pode passar no D-3 citando três
bulas e não ter nenhuma diretriz para o que ele ensina a fazer.

---

## D-11 · Dobutamina com quatro faixas de dose (ACHADO CLÍNICO ABERTO)

**Não é sobrevivente de unificação — nunca foi unificada.** A *apresentação* é
única e rastreada (dobutamina 12,5 mg/mL, ampola 20 mL — Hipolabor/Teuto). As
*faixas de dose* nunca foram reconciliadas, e hoje coexistem quatro:

| Faixa | Contexto |
|---|---|
| `2,5 mcg/kg/min` | baixo débito / disfunção miocárdica |
| `2,5–10 mcg/kg/min` | disfunção miocárdica séptica |
| `2–10 mcg/kg/min` | baixo débito com PA mantida |
| `2–20 mcg/kg/min` | IC baixo com PAM adequada |

Podem ser legítimas (contextos diferentes, tetos diferentes) ou podem ser a
mesma recomendação escrita quatro vezes por quatro autores. **Exige decisão
clínica do Sandro sobre qual faixa vale em cada contexto** — trazido
deliberadamente DEPOIS do bloco #4/#5/#6 das Calculadoras para não fragmentar a
sessão de "números contra publicação".

Enquanto não decidido, nenhuma trava as protege.

---

## D-12 · Torsades e fentanil unificados sem proibição do valor antigo

Sem sobrevivente hoje — os valores concordam em todos os pontos. Mas nenhuma das
duas tem trava que **proíba** o valor antigo (R-20):

- **MgSO₄ no torsades (1–2 g):** existe em 4 lugares (hipomagnesemia,
  taquicardia, ACLS). A trava lê **um** arquivo e confere **presença** na
  primeira linha que casa. Os outros três não são vigiados.
- **Fentanil em infusão (25–100 mcg/h):** ISR e Ventilação concordam. **Não
  existe trava alguma.**

A fechar junto com o bloco #4/#5/#6 das Calculadoras (aprovado).

---

## D-13 · `verifica-bundle-es.cjs` — a única trava que olha o artefato, e não roda

**Não é só perfil D-5.** É a **única** verificação do app que confere o
**artefato construído** (`dist/`) em vez do código-fonte — e bugs de build e de
minificação de i18n só aparecem lá. O `tr("literal")` que congelava na
minificação é exatamente a classe de defeito que só o `dist` revela.

Depender de um build é justamente o que a torna a mais fácil de esquecer: não
está no `test:all`, e o `dist` local é de 9 de agosto de 2026.

### Conferência de vitalidade das amostras (feita antes de qualquer religação)

Exigida porque religar com amostras obsoletas quebraria o build **pelo motivo
errado** — mecanismo do R-21, agora do lado do falso positivo.

| | |
|---|---|
| Amostras estáticas | **22** |
| Correspondem a texto **vivo** | **21** |
| **Órfãs** | **1** |
| Amostras derivadas de config (preços, PT+ES) | 8 — não podem envelhecer, são lidas de `lib/subscription.ts` |

**A órfã:** `["vasoativos", "ahorradora de noradrenalina"]`. Diagnóstico — a
frase **funde duas** que existem de verdade: `"ahorrador de noradrenalina"`
(masculino, `sepse-engine-3.ts`) e `"ahorradora de catecolaminas"`
(`vasoativo-eap-sedacao-eng.ts`). Nunca casou com nenhuma das duas.

**Não religada.** Pendente: (a) corrigir a órfã; (b) decidir como encadear o
build no pipeline sem tornar `test:all` caro demais para rodar a cada bloco.

---

## D-14 · `DOSES_ISR` não tem consumidores — PRIORIDADE ALTA

**Enquanto `lib/doses-isr.ts` não for importada, o R-12 está sendo cumprido só
na aparência em todo o eixo da ISR.**

`DOSES_ISR` e `ISR_AJUSTE_NO_INSTAVEL` têm **zero imports**. 27 sítios escrevem
as doses à mão — 22 no próprio `rsi-decision-tree.ts`, 4 na Sedoanalgesia, 1 na
Sepse (este último era o defeito, corrigido). O alinhamento vem de
`valida-isr.cjs` comparando texto, não de o código consumir o valor: é o
**contrato vigiado** do R-25.

**O que dá e o que não dá para importar**

| | Situação |
|---|---|
| **Multiplicadores do `derive`** (`0.3 * peso`, `Math.min(1.5 * peso, 200)`) | **Dá.** Não passam por `tr()`, e hoje são literais numéricos repetidos |
| **Frases de tela** ("cetamina 1 mg/kg…") | **Não dá diretamente.** Template literal sai da varredura de tradução — o espanhol veria português. Precisa de constante de frase inteira por idioma, ou de mudança na varredura |

**Por que é alta prioridade:** o defeito da Sepse mostrou o modo de falha. Todo
módulo novo que prescrever indução nasce fora do contrato, e só entra nele se
alguém lembrar de ampliar a trava. A trava foi ampliada para universo aberto no
caso da succinilcolina, mas isso trata o sintoma.

---

## D-15 · O `test:all` ficou grande demais para se saber de cabeça

**TRÊS vezes nesta auditoria começou-se a construir um verificador que JÁ
EXISTIA** — a lista de siglas do D-3, a alcançabilidade do grafo
(`test:arvores`, que cobria tudo o que eu ia escrever e já estava no pipeline)
e, em 2026-08-16, o medidor de contraste renderizado. **Nas três o instrumento
estava correto. A lacuna era do inventário, não da cobertura.**

### ⚠️ A TERCEIRA NOMEIA O PADRÃO: O UNIVERSO ESCOLHIDO À MÃO

Eu ia projetar um extrator de pares de cor a partir dos `StyleSheet`. Ao abrir o
diretório, `e2e/contraste-renderizado.spec.ts` **já fazia exatamente isso, e
melhor** — mede o par RENDERIZADO, descobrindo o fundo real subindo a árvore do
DOM. Não faltava instrumento. Faltava **universo**:

```ts
const TELAS = ["pcr-adulto","ritmos-acls","anafilaxia","sepse-adulto",
               "calculadoras-clinicas","avc"];   // seis, escolhidos à mão
```

`drogas-vasoativas` (2,36:1) e `correcoes-eletroliticas` (1,60:1) não estavam na
lista. **A trava media a coisa certa, do jeito certo, no lugar errado.**

### As três formas da MESMA doença

| forma | onde apareceu | o que decidia o universo |
|---|---|---|
| **por NOME de componente** | R-59, três ocorrências | o nome que o autor lembrou |
| **por LISTA de módulos** | esta (D-15, terceira) | a lista que o autor escreveu |
| **por ARQUIVO DE ORIGEM** | `valida-contraste` — só a paleta, nunca uma tela | o mecanismo que o autor tinha em mente |

Nos três casos o verde tem a mesma aparência do verde completo, e **é isso que
torna a doença cara**: ela não se anuncia.

### A correção é sempre a mesma: DERIVAR O UNIVERSO DO ARTEFATO

Nunca listar. O universo vem do que existe: **o `dist`** (as rotas que o build
publicou — foi a correção aplicada aqui), **o grafo de imports**, **o catálogo
de módulos**, **o diretório de scripts**. Assim módulo novo entra sozinho e não
há lista para alguém esquecer de atualizar.

E, quando o universo é derivado, **ele precisa falhar se vier vazio** — o
`dist` ausente agora derruba o teste em vez de deixá-lo passar sem nada a medir
(R-15 item 9).

⚠️ **Antes de escrever qualquer verificador novo, duas perguntas:** ele já
existe? e, se existe, o universo dele é derivado ou escrito à mão?

Com **34 etapas** no `test:all`, "módulo fechado" (R-20) só significa algo
verificável se der para saber QUAIS travas guardam aquele módulo.

**Resolvido barato e gerado do código:** `test:indice` lê o cabeçalho padrão de
cada trava — `PROMETE` / `NÃO PROMETE` / `UNIVERSO` — e escreve
`auditoria/INDICE-DE-TRAVAS.md`. Documento gerado não envelhece.

O campo **NÃO PROMETE** é o que mais importa: foi a falta dele que deixou o
`test:arvores` parecer cobrir correção clínica, que é o mecanismo da D-5.

### O que falta

**14 de 33** travas declaram. As 19 restantes nasceram antes da convenção.
Exigir todas de uma vez pararia o pipeline por dívida histórica, então a trava
guarda um **piso** (14) que sobe sozinho conforme alguém declara mais uma: o que
não se admite é PIORAR — trava nova sem declaração, ou declaração perdida.

**Não é urgente, é incremental:** cada módulo auditado daqui em diante declara as
suas antes de fechar.

---

## D-16 · Módulos que mandam cronometrar e não cronometram

**Fechados:** Anafilaxia (5 min entre doses IM), Ventilação (30 min até a
gasometria de controle), EAP (5 min entre passos da nitroglicerina),
**Convulsões** (runtime de árvore, 36 conferências executadas) e **Eclâmpsia**
(2026-08-16, dois relógios).

**Falta:** Vasoativos — e a leitura de que **provavelmente não deve ter**
continua valendo (ver abaixo).

### ⚠️ ESTA DÍVIDA NASCEU MAL FORMULADA — e o registro é o achado

O texto original dizia:

> *"alta — gluconato a cada 15 min é antídoto de toxicidade do magnésio"*

**O objeto estava errado.** O gluconato tem relógio de **REPIQUE**, e repique
de antídoto ninguém esquece: quem está dando cálcio está tratando uma
toxicidade instalada, com a paciente na frente. O que se perde é outra coisa —
**a VIGILÂNCIA DE 24 HORAS**: a tríade a cada 20 min na primeira hora e depois
de hora em hora, atravessando o parto. É ela que decide se a toxicidade aparece
**antes ou depois da parada respiratória**.

**A consequência de método:** dívida mal formulada aponta o instrumento para o
lugar errado, e o erro sobrevive até alguém abrir o módulo. **Foram três
fases.** A dívida foi lida várias vezes, priorizada, adiada — e ninguém
percebeu que o objeto estava trocado, porque a frase era plausível e o número
(15 min) existia mesmo no módulo.

**O que a torna detectável:** dívida escrita com o OBJETO e a CONSEQUÊNCIA —
"o que se perde é X, e o custo de perder é Y" — em vez de com o sintoma que se
viu primeiro. "Gluconato a cada 15 min" era o sintoma: o prazo mais chamativo
do módulo. A consequência ("a toxicidade aparece depois da parada") é que
apontaria para a vigilância.

### O que entrou (2026-08-16)

**Dois relógios, com marcos diferentes e RÓTULO dizendo o que cada um mede** —
porque relógio sem rótulo vira alarme genérico que a pessoa silencia:

| relógio | marco | mede | intervalo |
|---|---|---|---|
| **vigilância** | `inicioDoEvento` = instalação da sulfatação | a tríade — é para **OLHAR** | 20 min na 1ª h, depois 60 min, por 24 h |
| **dose** | `ultimaDose` | a manutenção — é para **DAR** | 4/4 h (Pritchard) |

**A vigilância atravessa o parto**, e isso é conferido por execução: a trava
caminha até `pos_parto` e lê o prazo lá. O marco é de SESSÃO
(`__marco_inicioDoEvento` em `values`), não de nó.

⚠️ **Limitação declarada:** os relógios **não são modulares**. O runtime conta
do marco, não do último ciclo cumprido — ele diz que a checagem está DEVIDA,
não quantas foram feitas, porque não há evento de "checagem cumprida" para
rearmar. Está escrito na árvore, não disfarçado.

**E a infra deixou de ser obstáculo:** a dívida dizia *"o motor não tem
`Session` nem campos registráveis"*. O runtime de árvore das Convulsões
resolveu exatamente isso, e a Eclâmpsia o consome sem motor próprio — R-44,
expectativa datada dentro da própria dívida.

## D-17 · Dois prazos aguardando decisão clínica de marco

Nomeados em `PENDENTE_DE_DECISAO` dentro de `scripts/valida-prazos.cjs`, e
exibidos a cada execução — não silenciados.

1. **`tce-decision-tree.ts:112`** — *"Repetir TC em 6–12 h"*: a partir da **TC
   inicial** ou do **trauma**? Num paciente que chegou 3 h depois do acidente, a
   diferença entre as duas leituras é de 3 h.
2. **`sepsis-engine.ts:3077`** — *"Reavaliar critérios de alta em 24–48h"*: da
   **admissão**, da **estabilização** ou do **início do antimicrobiano**? Os três
   marcos existem no mesmo módulo.

Quando a decisão vier, o item sai da lista e o texto ganha o marco — e a trava
volta a cobrar.

---

## D-18 · TC de controle de rotina no TCE — ✅ FECHADA (2026-08-16), SEM AFROUXAR NADA

O marco foi resolvido antes (D-17): a linha diz **"Repetir TC em 6–12 h da TC
INICIAL ou se houver qualquer deterioração neurológica"**. O que faltava era
abrir as fontes que sugeriam que a repetição DE ROTINA no estável tem benefício
questionável.

**Fontes abertas em sessão (2026-08-16):**

| fonte | desenho | população | resultado |
|---|---|---|---|
| *Role of scheduled repeat CT scan in TBI* (PMC11450495) | prospectivo, centro único, 231 casos | todas as gravidades; o grupo que não repetiu era **Glasgow > 13** | rendimento cirúrgico de **3,5%**; ninguém do grupo sem repetição deteriorou |
| *Routine Repeat Head CT … on ACAP Therapy Following Mild TBI* (PMC4307724) | **retrospectivo**, 144 pacientes, média 74 anos | **TCE leve (GCS 13–15)** anticoagulado/antiagregado, TC inicial normal | **0,7%** de hemorragia tardia, *"discharged without any intervention required"* |

**A DECISÃO: não afrouxar nada.** A conduta continua idêntica. O que o módulo
ganhou foi a LEITURA da evidência — os números, e de quem eles falam.

**⚠️ E POR QUE NÃO SE REABRE ISTO (escrito para o próximo, não para o
arquivo):** 144 pacientes retrospectivos não mudam conduta. E a **assimetria de
dano** continua valendo: uma TC a mais custa radiação e tempo; um hematoma
tardio não visto custa o paciente. Quem quiser reabrir precisa trazer evidência
de outro porte — e, sobretudo, evidência que fale do TCE **moderado ou grave**,
que é onde a conduta do app manda repetir e onde nenhuma destas duas fontes
chega.

**O ganho real:** o médico passa a ter os números e a população para decidir, que
é o que ele não tinha. `test:tce` confere que a população e a assimetria não
sumam do texto — sem elas, ele vira permissão para afrouxar no grave.

---

## D-19 · Frase de tela composta com `${}` sai da tradução — 56 casos

**PRIORIDADE ALTA.**

### Como apareceu

Ao escrever o veto do formatador da D-14, testei se o `test:i18n` pegaria uma
interpolação em frase traduzível. **Não pega.** A varredura pula template
literal com `${}` **por desenho** — é justamente essa a armadilha. Com uma
violação bem formada, ela diz `SEM TRADUÇÃO: 0`, silêncio completo.

**E quase registrei uma proteção inexistente:** a primeira mutação que fiz FICOU
vermelha, mas por quebrar o *parsing* do arquivo, não por detectar a violação.
Falso positivo salvando falso negativo é a pior coincidência possível — só não
passou porque o R-15 item 10 manda conferir o que sumiu entre execuções.

### A medida

| | |
|---|---|
| template literals com `${}` no app | 1040 |
| …com texto em português fora da interpolação | 357 |
| …**que são frase de tela** (excluindo erro de dev, telemetria, log) | **58** |
| …com o trecho fixo presente na tradução ES | **2** |
| **…que o usuário em espanhol lê EM PORTUGUÊS** | **56** |

O mecanismo é direto: `tr(pt)` devolve `pt` inalterado quando a chave não existe
no dicionário. Frase montada em runtime nunca é chave. Logo, português.

**Por arquivo:** CAD/EHH 13 · Sepse 12 · EAP 6 · Vasoativos 6 · ACLS debrief 4 ·
Ventilação 3 · e mais 8 arquivos com 1–2 cada.

### E a boa notícia: NÃO é decisão de arquitetura

**A solução já existe no app e está escrita.** `lib/i18n/trf.ts` faz exatamente
isto: a chave passa a ser a frase com marcadores `{0}`, `{1}`, e os valores
entram DEPOIS da tradução.

```ts
trf(tr, "Dose sugerida: {0} mEq de KCl ({1} mL).", [dose, ml])
```

Ela já é usada em **60 lugares**. As 56 restantes são as que ficaram para trás —
não há decisão a tomar, há trabalho a fazer.

### O que falta

1. Converter as 56 para `trf`, por módulo, com tradução ES de cada frase.
2. **Uma trava que proíba o padrão** — hoje nada impede o 57º. O veto escrito na
   D-14 protege só o formatador do ISR; o problema é geral.
3. Conferir se o `trf` funciona em todos os contextos (o comentário dele avisa
   que `tr` vem por parâmetro para não congelar na minificação — a mesma
   armadilha do `tr("literal")` já documentada).

---

## D-20 · `trf` traduz a FRASE, não o valor que entra nela

Descoberto ao provar as 19 conversões da D-19 executando `trf` nos dois idiomas.
A frase atravessa; o valor interpolado, não:

```
es-419:  Trombólisis NO autorizada en el estado actual por janela expirada.
                                                          ^^^^^^^^^^^^^^^^
es-419:  El alta AÚN NO es segura — faltan ítems obligatorios … : autoinjetor.
                                                                  ^^^^^^^^^^
```

Quando `{0}` é número, unidade ou nome de fármaco, não há problema — atravessam
por serem iguais nos dois idiomas. **O problema é quando `{0}` é uma FRASE**, e
das 19 convertidas ao menos cinco caem nisso:

| Onde | `{0}` é |
|---|---|
| `avc-engine` | `primaryBlocker` — o motivo pelo qual a trombólise está bloqueada |
| `anafilaxia-engine` (2×) | itens do checklist de alta que faltam |
| `sepsis-engine` | `preview` — a lista de campos não preenchidos |
| `dka-hhs-engine` | `gapTargetText` — *"fechar gap aniônico antes da transição"* |

**A conversão para `trf` era necessária e não é suficiente nesses cinco.** O
valor precisa vir já traduzido — ou seja, as listas de origem (bloqueadores da
trombólise, itens do checklist, rótulos de campo) precisam passar por `tr()`
antes de entrar no `join(", ")`.

### Precisão sobre o que foi entregue

Não é "convertido" — é **entrega parcial, e a parte que chegou é a que mais
importa**. Nos cinco casos a NEGAÇÃO agora atravessa; o conteúdo que ela
qualifica, não:

> *"Trombólisis NO autorizada en el estado actual por **janela expirada**."*

Isso é melhor que a frase inteira em português, porque **a palavra que decide
chegou**. Mas não é o trabalho terminado, e registrar como "convertido"
esconderia metade.

### Os cinco NÃO se dispersam na Fase 2 — são categoria própria

Dentro das 35 restantes, estes cinco formam um grupo: **o valor interpolado
carrega conteúdo clínico**, e o padrão de correção é o MESMO em todos —
`tr()` na lista de origem antes do `join`.

Fazer os cinco juntos é uma sessão. Fazer um por módulo são **cinco
redescobertas do mesmo problema**, e a quinta custa igual à primeira.

**Não corrigido aqui de propósito:** mexer nas listas de origem é entrar em cinco
módulos diferentes, e o eixo da D-19 era parar o sangramento e converter as 19 de
maior risco. Isto vai junto com a conversão das 35 restantes, na Fase 2.

**A trava não pega isto** — e está dito no `NÃO PROMETE` dela: ela vê a forma da
frase, não o idioma do que entra nela.

---

## D-21 · Inotrópico na sepse: o app oferece uma opção onde a diretriz vê equipoise

**PRIORIDADE MÉDIA — trabalho de conteúdo do módulo Sepse.**

A leitura da SSC 2026 durante a D-11 abriu três achados que NÃO são de dose e
por isso não entraram naquele bloco:

**1. A adrenalina isolada está em pé de igualdade e o app não a oferece.**
A recomendação é *"adicionar dobutamina à noradrenalina **OU usar adrenalina
isolada**"*. O app só apresenta o primeiro caminho.

**2. A milrinona está cadastrada e não é oferecida onde há equipoise.**
Este é o achado mais forte e o mais barato: **não é acrescentar fármaco que o app
não tem** — `vasoactive-engine.ts:459` já traz *"Lactato de milrinona 1 mg/mL,
frasco-ampola 10 mL (Primacor — Sanofi; genéricos Blau) — bula ANVISA"*, conferida
na varredura da D-4. A SSC 2026 registra que **os dados são insuficientes para
decidir entre dobutamina e milrinona**, e o app decide por conta própria ao
oferecer só uma.

**3. O enquadramento de 2026 é mais amplo que o do app.**
A diretriz diz *"inotrópico versus nenhum inotrópico"*, com a escolha do agente
rebaixada. O app apresenta a dobutamina como o caminho.

**O que a D-11 já resolveu:** a força FRACA da recomendação está escrita no
conteúdo, e a menção de que dobutamina × milrinona ficou sem recomendação
também. O que falta é **oferecer as outras opções**, e isso é decisão de conteúdo
do módulo — vai quando a Sepse for auditada.

---

## D-22 · Três engines inalcançáveis + uma rota órfã — decisão pendente (R-32)

**`anafilaxia-engine.ts`, `eap-engine.ts`, `ventilation-engine.ts`** (≈6.500
linhas) nunca são executados pela tela real: `components/clinical-app.tsx`
decide por `protocolId` e retorna `<XFlowScreen/>` (árvore) incondicionalmente,
descartando o `engine` recebido. `sepsis-engine.ts` é parcialmente vivo: dois
exports (`QSOFA_PAPEL_APOS_SSC_2026`, `UTI_NA_PNEUMONIA_NAO_SAI_DO_CURB65`) são
consumidos por `clinical-calculators-engine.ts` (Calculadoras Clínicas, módulo
vivo); o resto do arquivo — a lógica de condução do caso — não é.

**`app/(tabs)/sepse.tsx`** — rota que instancia `<ClinicalApp engine=
{sepsisEngine}/>` diretamente. Não está linkada de lugar nenhum no app (hub,
catálogo, ou qualquer outro componente) — só alcançável digitando a URL. E
mesmo alcançada, cairia no mesmo branch de `protocolId` e renderizaria a
árvore, não o engine passado.

**Decisão pendente — dois caminhos, custo de cada um:**

**(a) Deletar.** Extrair antes os dois exports vivos de `sepsis-engine.ts`
para um lib compartilhado (padrão `lib/dobutamina.ts`); depois apagar os
quatro arquivos (parcial em sepsis-engine, total nos outros três) e a rota
órfã. Exige retargetar as travas que hoje compilam esses arquivos diretamente:
`test:cronometros`, `valida-frase-composta.cjs`, `test:vm`/`valida-
ventilacao.cjs`, `valida-dobutamina.cjs`, `valida-prazos.cjs`. Resultado:
~13.000 linhas a menos, zero ambiguidade, recuperável pelo git caso algum
trecho seja necessário depois.

**(b) Mover + guardar.** Mudar para um caminho inequívoco (ex.: `dead-code/`)
e escrever uma trava que impeça edição de conteúdo clínico ali sem uma marca
explícita de "reconhecido como morto". Mesmo custo de retargetar as travas
acima (elas apontam para o caminho antigo de qualquer forma). Benefício real
só existe se houver plano concreto de MINERAR esses arquivos por conteúdo que
ainda não foi portado para as árvores (foi assim que a lacuna de succinilcolina/
IOT da Sepse apareceu) — sem esse plano, é o mesmo risco que já se
concretizou três vezes (R-32): arquivo presente convida edição, mesmo
rotulado.

**Recomendação, não decisão:** se (a) for escolhido, fazer antes uma
varredura de conteúdo dedicada (engine × árvore, os quatro módulos, linha a
linha) para não perder nenhuma outra lacuna tipo succinilcolina — a rastreada
nesta rodada cobriu só os itens nomeados e os marcadores R-XX/D-XX, não é
exaustiva.

---

## D-23 · `eap-engine.ts` — dobutamina com piso divergente (2–3, nunca convertida)

**RESOLVIDA.** `eap-engine.ts:298` — *"Dose inicial: 2–3 mcg/kg/min IV
contínuo → titular até 20 mcg/kg/min."* Nunca foi convertida para
`lib/dobutamina.ts` (D-11) porque o arquivo é inalcançável (D-22) e passou
batido pela varredura original — o nome da droga está no `title:` do bloco, a
dose numa linha adiante do array `lines:`, e a trava original só comparava a
mesma linha. A trava foi corrigida (R-10). Corrigido também o próprio ponto:
`eap-engine.ts` agora importa `DOBUTAMINA_INICIO/FAIXA_USUAL/ATE_20` de
`lib/dobutamina.ts`, mesmo padrão de `eap-decision-tree.ts`. `test:dobutamina`
verde, `test:all` limpo.

---

## D-22b · Divergências CATEGORIA 4 encontradas na varredura exaustiva — status

A varredura exaustiva engine×árvore dos quatro módulos (D-22) não achou só
"vale portar"/"duplicata"/"obsoleto" — achou **contradições reais** entre o
engine morto e a árvore viva sobre o MESMO fato clínico (R-33-adjacente: a
taxonomia de três categorias escondia isto dentro de "duplicata"/"obsoleto";
corrigida para quatro categorias a pedido do Sandro). Oito itens, status:

| Item | Achado | Decisão | Status |
|---|---|---|---|
| **C** | Anafilaxia — bolus IV de adrenalina fora da PCR, no engine morto, ausente na árvore | Árvore vence — bolus fora de PCR é causa conhecida de arritmia/isquemia | **Feito** — documentado como remoção deliberada em `anaphylaxis-decision-tree.ts` (comentário, para não ser "restaurado" sem nova decisão) |
| **F** | Ventilação — pressão de cuff: engine 20–25 (perigo >30), árvore 20–30 | Árvore vence — 20–30 é o alvo padrão (acima de 30 compromete perfusão de mucosa, abaixo de 20 permite microaspiração); o engine deixava zona morta 25–30 sem orientação | **Fechado** — árvore já estava certa, nenhuma mudança de código necessária |
| **G** | Ventilação/ISR — fentanil de analgosedação declarado 3× em paralelo (RSI, Ventilação, calculadora de Sedoanalgesia) | Nem um nem outro — fonte única | **Feito** — `lib/fentanil-analgosedacao.ts` criado; `rsi-decision-tree.ts` e `ventilation-decision-tree.ts` consomem a mesma constante; ES traduzido; `test:i18n`/`tsc` limpos |
| **H** | Ventilação — FC de aprovação do SBT: engine <140 sem piso, árvore 50–130 | Árvore vence — bradicardia também reprova um SBT | **Fechado** — árvore já estava certa |
| **A** | Anafilaxia — dose de partida da adrenalina EV: engine 0,05–0,1, árvore 0,1–0,3 | Nem um nem outro por completo — iniciar 0,1 (não 0,1–0,3: o 0,3 é titulação, não partida), incrementos de 0,05 a cada 3 min, sem teto fixo (nenhuma fonte declara um). 0,05 do engine é dose PEDIÁTRICA (fonte canadense) aplicada como geral | **Feito** — `lib/adrenalina-ev-anafilaxia.ts` criado, consumido nos dois pontos de `anaphylaxis-decision-tree.ts`; o achado (0,05 = dose pediátrica confundida com geral) documentado no comentário da fonte; ES traduzido |
| **B** | Anafilaxia — teto pediátrico da dose IM calculada: JSON 0,3/0,5 por peso, árvore uniforme 0,5 | Depende da resposta de escopo pediátrico (levantamento: app não declara escopo pediátrico sistemático; só fragmentos isolados em Anafilaxia/ISR/Convulsões) | **Aberta** — aguardando decisão de escopo |
| **E** | EAP — amiodarona: engine 150–300mg/30–60min, árvore 150mg/10min→infusão | NÃO é uma divergência — são DOIS regimes (confirmado: protocolo brasileiro de FA/cardiopata usa 30–60min explicitamente para reduzir risco de hipotensão; ACLS padrão usa 10min). EAP é justamente a população hemodinamicamente frágil, então o LENTO vira padrão do módulo, RÁPIDO fica para instabilidade elétrica que exige controle imediato | **Feito** — `eap-decision-tree.ts` nomeia os dois regimes com o critério de escolha; ES traduzido |

---

## D-24 · Sepse — falta delegação explícita de CONDUTA para o ISR (item MENOR)

Fechado como não-lacuna de segurança (R-33): a Sepse tem delegação de
**plantão** para o ISR (card universal "Estabilização primeiro", sempre
visível, com o critério de IOT no próprio ABCDE). O que falta é delegação de
**conduta** — uma linha, no ponto certo da árvore (quando a via aérea entra em
questão dentro do fluxo da Sepse), do tipo *"via aérea comprometida → abrir
ISR: preditores de dificuldade, ajuste de dose no instável, índice de choque
para o colapso peri-intubação"*. Não duplica conteúdo do ISR (violaria R-12) —
aponta para ele no momento clínico certo, em vez de só no topo da tela. Vai
junto da auditoria de conteúdo do módulo Sepse.

---

## D-25 · `test:avc` e `test:coronary` validam CÓDIGO MORTO

`scripts/test-avc-engine.cjs` compila e testa `avc-engine.ts`;
`scripts/test-coronary-engine.cjs` faz o mesmo com
`coronary-syndromes-engine.ts`. Os dois arquivos são órfãos de render
(D-22): as telas rodam `avc-decision-tree.ts` e `coronary-decision-tree.ts`.

**Não são apenas inúteis — são ATIVAMENTE enganosas.** Duas entradas verdes
no `test:all` dão sensação de cobertura sobre os módulos de AVC e Síndromes
Coronarianas, que são **exatamente dois dos módulos que a Fase 1 nunca
auditou**. O placar dizia "40 travas" e duas delas vigiavam arquivos que
nenhum médico alcança. Pior que ausência de trava: ausência não engana.

**O que elas deveriam apontar.** Não é só trocar o caminho do arquivo — os
dois testes foram escritos contra a API de engine (`getCurrentState`,
`next`, `getAuxiliaryPanel`), e as árvores têm outra forma
(`DecisionTreeEngine`, `choose`, `goToNode`). O reaproveitamento certo é o
padrão de `test:arvores` / `test:motor`, que já exercita árvore de decisão:

- **`test:avc`** → `avc-decision-tree.ts`, verificando o que o módulo promete:
  janela de trombólise, elegibilidade por NIHSS (a fonte única em
  `avc/nihss.ts`, criada na Fase 1), e as contraindicações de alteplase.
- **`test:coronary`** → `coronary-decision-tree.ts`: separação SCACSST ×
  SCASSST, tempos de reperfusão, e o HEART (cuja correção de Backus 2013 foi
  feita nas Calculadoras — conferir que a árvore não traz uma segunda
  afirmação, R-12).

**Ordem:** isto vem junto da auditoria dos módulos AVC e Coronárias
(Fases 3–8), não antes — reescrever a trava sem ter auditado o conteúdo
produziria uma trava que copia o que existe (R-21).

---

## D-26 · `stabilization-first-card 2.tsx` — RESOLVIDA, e o enquadramento estava errado

**Correção ao que eu mesmo reportei.** Chamei este arquivo de "9º arquivo
morto" e de armadilha "ordenando ao lado do original no repositório". As
duas coisas estavam erradas: **o arquivo nunca esteve no repositório.**

`.gitignore:66-71` já cobre o padrão, e de forma abrangente — `* [0-9].ts`,
`.tsx`, `.cjs`, `.mjs` — com um comentário explicando a exceção dos nomes
que terminam em dígito legitimamente (`lib/i18n/es-419.ts`). Alguém já
tinha resolvido este problema, melhor do que eu supus.

**O que era verdade:** o arquivo existia no disco local, com a versão
ANTERIOR do card (nasce expandido — o comportamento que a medição da Fase 6
corrigiu — e sem `ATALHOS_REMOVIDOS`). Como ordena ao lado do original em
qualquer listagem de editor, era uma armadilha **local**: editar a cópia e
não receber erro nenhum, só a ausência de efeito.

**O que NÃO era verdade:** não fazia parte da D-22, não podia chegar a
produção, não estava visível para mais ninguém, e não havia o que commitar
— o `git rm` falhou justamente porque o arquivo nunca esteve sob controle
de versão.

**Resolução:** apagado do disco local. Sem commit, porque não havia o que
commitar.

**O que fica da trava:** a checagem de `" N.tsx"` em
`valida-alcancabilidade.cjs` continua valendo, mas **o valor da minha
checagem é menor do que declarei** — o `.gitignore` já impede que uma duplicata seja commitada.
O que a trava acrescenta é higiene **local**: ela acusa o arquivo no disco
antes que alguém o edite por engano. Mutação executada (uma duplicata `.ts`
criada dispara; removida, volta verde).

**Contagem da D-22 corrigida: 8 arquivos, ~18.300 linhas** — não 9.



---

## D-27 · Afirmação ao lado de citação, sem que a fonte diga aquilo

Achada por acaso ao verificar o A4/A5: a linha *"nenhum adjuvante substitui ou
atrasa a adrenalina"* estava escrita junto de conteúdo atribuído à fonte de
anafilaxia — e **a fonte não contém essa frase**. É princípio clínico correto,
e agora está declarado como inferência. Mas ninguém saberia disso lendo o
arquivo antes da conferência.

**A pergunta que fica, e não foi varrida:** quantas outras linhas do app
afirmam algo ao lado de uma citação, sem que a citação sustente aquilo?

**É primo de duas regras e distinto das duas:**

| | O defeito |
|---|---|
| **D-10** | conduta sem rastreio nenhum — não há fonte |
| **R-39** | a fonte diz, mas como DESCRIÇÃO, e foi lida como critério |
| **D-27** | a fonte existe, está certa, e a frase ao lado dela **não vem dela** |

O terceiro é o mais difícil: a citação próxima empresta autoridade por
adjacência. Quem lê vê fonte, ano e afirmação no mesmo bloco e assume
vínculo.

**Não varrer agora.** Fica como item do checklist de módulo — ao auditar um
módulo, para cada bloco com citação, conferir quais linhas daquele bloco a
fonte de fato sustenta.

---

## D-28 · Citação de MÓDULO cobrindo N cards — D-27 por construção

`acls-rhythms-screen.tsx` fecha com **uma** citação no rodapé — *"Baseado em
AHA ACLS 2025 (Diretrizes RCP e ACE 2025)"* — que cobre os **quatro** cards de
ritmo. O formato faz cada afirmação do módulo **parecer sustentada** por
aquela diretriz, e **nenhuma foi verificada individualmente**.

É a D-27 (afirmação ao lado de citação que a fonte não sustenta) na forma
estrutural, e não por descuido: quando a citação é de MÓDULO, o vínculo
aparente é automático para tudo que estiver dentro dele. Ninguém precisa
escrever a atribuição errada — o layout já a faz.

**O que está sob o guarda-chuva sem verificação individual:**

| Afirmação | Onde | Situação |
|---|---|---|
| MgSO₄ 1–2 g IV no Torsades | card TV sem pulso | não verificado |
| TV sp: 150–300 bpm | card TV sem pulso | prosa descritiva, não limiar (R-39) — mas o campo `rate:` lê como critério |
| Assistolia: < 10 bpm | card assistolia | idem |
| ~~6 causas parciais na AESP~~ | card AESP | **resolvido** — virou `lib/causas-reversiveis.ts` com as 10 |

**Não auditar os quatro cards agora foi decisão explícita:** seria abrir a
auditoria de conteúdo inteira do módulo dentro de um bloco de três correções.
Fica para a vez de Ritmos de Parada nas fases seguintes.

**O que já mudou:** o conteúdo acrescentado neste bloco leva **atribuição
própria** no próprio texto (*"Fonte desta ressalva: AHA, Adult Advanced Life
Support"*), em vez de herdar o rodapé. É a forma de crescer o módulo sem
aumentar a dívida.

**Onde mais isto vale:** todo módulo com citação de rodapé único. Levantamento
não feito — entra no checklist de módulo, junto com a D-27.

---

## D-29 · EMULSÃO LIPÍDICA / LAST — ✅ FECHADA (2026-08-16)

**Era prioridade alta, e era ausência TOTAL:** `grep` por "emulsão lipídica",
"Intralipid" e "LAST" no app inteiro retornava zero arquivos.

**O que entrou:** `lib/last-emulsao-lipidica.ts`, com fontes abertas em sessão
(artigo do checklist ASRA e revisão que reproduz o checklist 2020) — apresentação
e preparo em mL direto do frasco, esquema fixo acima de 70 kg e por peso abaixo,
repetição/duplicação, manutenção por 10 min após estabilizar, teto de 12 mL/kg
com a ressalva de que doses menores são a norma.

**Três coisas que o levantamento não previa e a fonte sustentou:**

1. **Propofol NÃO é emulsão lipídica terapêutica** — e as DUAS razões ficam
   separadas de propósito: o conteúdo lipídico é baixo demais para tratar (a
   dose necessária seria uma superdose de propofol num paciente em colapso) E
   ele é cardiodepressor. A segunda já existia no app, para a convulsão; a
   primeira é outra coisa, e juntá-las apagaria a que importa aqui.
2. **O atraso** — o LAST "lento" pode aparecer **até 30 min** depois da
   injeção, e há apresentações descritas dias depois; o início tardio é a regra
   em infusão contínua. A sala é considerada segura assim que o bloqueio "dá
   certo", e é nesse intervalo que ele aparece.
3. **Circulação extracorpórea acionada JUNTO com o pedido de ajuda** — a própria
   ASRA moveu essa linha para o alto do checklist, porque montar leva tempo que
   não existe depois do colapso.

**A distribuição, com a decisão inline × ponteiro refeita:** o LAST é a exceção
que a própria dívida previa. Vai **INLINE** no T de tóxicos das Causas
Reversíveis — antídoto único, executável, e o cenário É a parada — e como
ponteiro curto na **ISR** (topização usa volume grande em mucosa) e na
**Anafilaxia** (colapso em bloqueio é o diferencial do colapso por antibiótico
profilático, e a adrenalina em dose padrão PIORA o LAST).

⚠️ **PENDÊNCIA DECLARADA, não esquecida:** a janela de observação pós-evento. O
artigo confirma que a ASRA recomenda tempos específicos **estratificados por
gravidade**, mas os valores estão no GRÁFICO do checklist, que não abriu em
sessão; uma fonte secundária diz 12–24 h sem confirmação na primária. O app diz
que a vigilância é longa, manda consultar o checklist do serviço, e **não fixa
número** (R-5). A trava confere que ninguém escreva um número sem essa
declaração.


## D-30 · Engines de registro escritos à mão em vez da fábrica

**Achado colateral da auditoria da Taquicardia, e é do app inteiro — não do
módulo.**

O D-22 criou `criarEngineDeRegistro(protocolId, rotulo)` justamente para
substituir engines que não fazem nada além de existir para o catálogo. Oito
módulos passaram a usá-la. Onze continuam com o arquivo escrito à mão:

`rsi-engine.ts` · `eclampsia-engine.ts` · `tep-engine.ts` ·
`acls-tachycardia-engine.ts` · `acls-bradycardia-engine.ts` ·
`acls-post-rosc-engine.ts` · `acls-pharmacology-engine.ts` ·
`acls-pregnancy-engine.ts` · `acls-rhythms-engine.ts` ·
`acls-choking-engine.ts` · `acls-reversible-causes-engine.ts`

São ~78 linhas cada, todas iguais a menos do `PROTOCOL_ID` e do rótulo — cerca
de 850 linhas que a fábrica resolve em 11.

**Por que fica como dívida e não foi resolvido no turno da Taquicardia:** é
mudança estrutural que toca onze módulos de uma vez, e nenhum deles foi
auditado ainda nesta fase. Resolver agora misturaria refatoração de catálogo
com correção de conteúdo clínico no mesmo commit — exatamente o que a auditoria
mantém separado.

**Risco clínico: nenhum.** Nenhum destes arquivos carrega conteúdo — todos
retornam listas vazias e um estado estático. É dívida de forma.

**Dono:** o passe estrutural que fechar a Fase 2, quando os onze já tiverem sido
auditados um a um.

---

## D-31 · Os 11 fatos de `valida-consistencia-clinica` que exigem literal em universo aberto

**Herança do D-12: trava que EXIGE UM LITERAL em N sítios, em vez de PROIBIR A
CÓPIA fora do dono.**

O D-12 do magnésio proibiu uma correção legítima por uma fase inteira — exigir
"1–2 g" em todo lugar tornava impossível escrever a dose certa do torsades COM
pulso. A varredura das 31 travas achou mais duas com a mesma forma. O fentanil
foi reescrito no mesmo bloco (é uma regra só). Restam estes 11, aplicados a
**qualquer frase do app** que case o `assunto` do fato.

**Por que NÃO viram um bloco:** cada um é uma questão clínica — *este número é
invariante ou depende do contexto?* — e a resposta exige a fonte aberta e o
módulo dono na frente. Resolver os 11 de uma vez seria decidir 11 questões
clínicas sem ler nenhuma.

**Regra de fechamento: cada fato é resolvido na auditoria do módulo DONO.** Não
em bloco, não numa varredura própria. Assim cada auditoria futura esbarra no
seu — e chega nele com a fonte já aberta.

| # | Fato | Dono | Contextual? |
|---|---|---|---|
| 1 | gatilho de dose para associar vasopressina à noradrenalina | **Sepse** | provável — o gatilho muda entre choque séptico e outros |
| 2 | peso da recomendação da SSC para vasopressina | **Sepse** | não — é o peso da diretriz, não um número clínico |
| 3 | corticoide no choque séptico exige as 4 h | **Sepse** | **SIM** — as 4 h são do choque séptico; outros contextos de corticoide têm tempos próprios |
| 4 | vasopressina é dose fixa de 0,03 U/min | **Sepse** | **SIM** — "dose fixa" é da sepse; há esquemas titulados noutros cenários |
| 5 | toda menção a 1:10.000 ensina a preparar da ampola nacional | **Farmacologia ACLS** | não — é regra de apresentação, vale em todo lugar |
| 6 | droga com mais de uma apresentação declara todas (R-6) | **transversal** | não — é a própria R-6 |
| 7 | adrenalina na parada é 1 mg IV/IO | **PCR Adulto** | não — invariante do ACLS, e o `assunto` já exclui a via IM |
| 8 | adrenalina na parada se repete a cada 3–5 min | **PCR Adulto** | não — invariante do ACLS |
| 9 | alteplase no AVC isquêmico: 0,9 mg/kg, máx 90 mg | **AVC** | não — invariante, e é dos números mais estáveis do app |
| 10 | tenecteplase no AVC: 0,25 mg/kg, máx 25 mg, bolus único | **AVC** | não — invariante |
| 11 | alvo inicial de PAM no choque é ≥ 65 mmHg | **Pós-PCR** | **SIM, e já há prova** |

### O nº 11 já tem a divergência à vista, e o dono é o PRÓXIMO módulo

O módulo de Pós-PCR diz `PAM alvo ≥ 65 mmHg (considerar ≥ 80 mmHg em contexto
de choque pós-PCR)`. A trava exige ≥ 65 em qualquer frase sobre alvo de PAM no
choque. Hoje passa porque o texto contém o 65 — mas a nuance do 80 já existe, e
qualquer reescrita que a promova a alvo principal quebra.

**Resolver na auditoria do Pós-PCR**, que é o próximo módulo.

### Os quatro marcados como contextuais são os de risco real

3, 4 e 11 são números que a literatura já qualifica por cenário. O 1 é gatilho,
não dose, e gatilhos costumam ser locais. Os outros sete são invariantes de
diretriz — para eles, a forma "exige literal" é aceitável **desde que o
`assunto` seja estreito**, e vale reler o `assunto` de cada um no turno do dono.

---

## D-34 · `DRUGS` privado força cópia de dose em toda árvore

**A causa estrutural de metade das divergências de dose desta auditoria.**

`vasoactive-engine.ts` guarda os 10 fármacos vasoativos com apresentação, fonte
ANVISA, soluções padrão e faixas — e `DRUGS` **não era exportado**. Nenhuma
árvore conseguia importar dose de vasoativo. Todas copiavam à mão, não por
descuido: **era a única saída que o código oferecia.**

### A varredura

| fármaco | lib-fonte | árvores que escrevem à mão |
|---|---|---|
| **Vasopressina** | ✅ criada agora | **5** — anafilaxia, EAP, sepse, TEP, ventilação |
| Adrenalina (choque) | ✅ criada agora | 3 — anafilaxia, sepse, choque |
| Nitroprussiato | ❌ | 3 — AVC, EAP, eclâmpsia |
| Noradrenalina | ❌ | **1** — sepse ⚠️ |
| Dopamina | ❌ | 2 — anafilaxia, EAP |

### ⚠️ CORREÇÃO DA PRÓPRIA VARREDURA — R-10 dentro do levantamento estrutural

A auditoria do módulo de Choque conferiu os sítios que esta tabela atribuía a
ele, e **os dois eram FALSO POSITIVO da minha regex**:

| o que a varredura viu | o que o texto realmente diz |
|---|---|
| "noradrenalina … mcg/kg/min" | *"linha arterial quando a dose de noradrenalina passar de **0,3–0,5 mcg/kg/min**"* — é **limiar de monitorização**, não dose de infusão |
| "adrenalina … mg" | *"ADRENALINA IM IMEDIATA (**0,3–0,5 mg coxa**)"* — é **anafilaxia IM**, outro construto e outra via |

**O mecanismo:** o regex procurava `fármaco + unidade de dose` na mesma linha, e
casou **limiar** e **via diferente**. O módulo de Choque **não escreve nenhuma
dose de vasoativo à mão** — ele delega a Vasoativas por `targets`.

**A lição, e ela vale para toda varredura estrutural:** contar ocorrências por
padrão textual superestima o problema, e um número inflado num levantamento de
dívida faz priorizar errado. A conferência sítio a sítio é parte do
levantamento, não um passo posterior opcional (R-10).

Números corrigidos: **10 fármacos · 17 sítios · 8 árvores** (eram 19 e 9).
| Dobutamina | ✅ (D-11) | 1 — TEP (tem lib e não consome) |
| Milrinona | ❌ | 1 — EAP |
| Levosimendan | ❌ | 1 — EAP |
| Nitroglicerina | ❌ | 1 — EAP |
| Fenilefrina | ❌ | 0 |

**10 fármacos · 19 sítios de cópia · 9 árvores.** ⚠️ *Corrigido abaixo para 17 e 8 — ver a nota sobre falso positivo da regex.*

### Por que NÃO virou bloco único

**Criar as 8 libs hoje significaria criá-las a partir do texto atual do app — que
é exatamente a fonte que o R-21 proíbe.** Lib que copia o valor DO APP vira mais
uma cópia dele, com aparência de fonte única.

A dobutamina (D-11) e a adrenalina saíram certas porque nasceram **com a fonte
aberta**, no turno do módulo dono. As demais fecham do mesmo jeito.

### O que foi feito AGORA, e por quê

1. **`DRUGS` exportado.** Enquanto não for possível importar, toda árvore
   continua copiando por falta de opção — a dívida se realimenta.
2. **`lib/vasopressina.ts`**, com fonte aberta (VASST, monografia, bula ANVISA):
   5 árvores é o estado em que a divergência já é provável, não possível.
3. **`lib/adrenalina-no-choque.ts`**, que a auditoria da Sepse exigiu — e que já
   revelou uma divergência instalada (0,01–0,5 × 0,01–1).

### As seis restantes, com dono

| fármaco | dono | fase |
|---|---|---|
| Nitroprussiato | **AVC** (3 sítios, o de maior espalhamento) | 3 |
| Noradrenalina | **Sepse** — o único sítio restante ⚠️ o dono era o Choque, que se mostrou falso positivo | 3 |
| Dopamina | **Anafilaxia** | 3 |
| Milrinona · Levosimendan · Nitroglicerina | **EAP** (os três) | 3 |
| Dobutamina no TEP | **TEP** — a lib existe, falta consumir | 3 |
| Fenilefrina | sem consumidor — nasce quando alguém precisar | — |

Cada uma fecha na auditoria do seu módulo, com a fonte aberta. Quem chegar a um
desses módulos e não criar a lib está deixando a dívida crescer.

---

## D-35 · Texto COMPOSTO escapa da varredura de tradução — a D-19 pelo outro lado

**24 frases em 10 módulos.** Cada uma fecha na auditoria do seu módulo; não há
varredura própria.

### O que é

A varredura (`varredura-pt.cjs`) extrai **LITERAIS** do código-fonte. A tela
mostra a **FRASE**. Entre um e outro há duas rotas de fuga, e elas são a mesma
coisa vista de dois lados:

| | como escapa | o que a varredura vê |
|---|---|---|
| **D-19 · interpolação** | `` `Metas: PaCO₂ ${ALVOS_TCE.paco2}…` `` | nada — template com `${}` é pulado **por desenho**, porque só existe em runtime |
| **D-35 · composição** | `"2ª linha — " + VASOPRESSINA_DOSE` | as **duas peças**, cada uma com a sua tradução — e as duas passam |

A composição é a pior das duas: na interpolação a varredura ao menos não afirma
nada; na composição ela **afirma que está tudo traduzido**, porque cada parte
está. A soma é que não tem chave, e `tr()` devolve português.

**Medido por execução:** 45 textos compostos sem tradução, 29 deles com prosa
(o resto é tabela de números e placeholder), em 13 dos 17 módulos — com a
varredura marcando `SEM TRADUÇÃO: 0` o tempo todo.

### ⚠️ A autoria, registrada honestamente

**Quatro das ocorrências novas vieram dos blocos DESTA auditoria** — a
vasopressina e a adrenalina da Sepse, o `QUANDO ABREVIAR` do politrauma, a
ressalva do Choque, a `IMAGEM_PERFUSAO` do AVC.

Não é autoflagelo: é que o padrão **"criar lib de fonte única e compor no
consumo"** é exatamente o que esta auditoria vem recomendando, módulo após
módulo, e ele carrega este custo. **Quem seguir a recomendação sem saber disso
vai repetir.** Por isso a consequência prática está no METODO e não só aqui.

### A consequência prática

**Ao criar fonte única de TEXTO, a constante é a FRASE INTEIRA.** Compor no
consumo é o padrão certo para **NÚMERO** e errado para **FRASE**.

### O instrumento

`scripts/valida-traducao-composta.cjs` percorre as 17 árvores **compiladas** e
pergunta a `tr(texto, "es-419")` sobre o texto **já composto**. Pega as duas
rotas, porque mede o que chega à tela. Tem teto por módulo — a dívida herdada —,
e o teto existe para ser baixado na auditoria de cada um.

### O saldo por módulo (tetos declarados na trava)

`poisoning` 5 · `ventilation` 4 · `politrauma` 3 · `anaphylaxis` 2 ·
`coronary` 2 · `sepsis` 2 · `avc` 1 · `eap` 1 · `rsi` 1 · `shock` 1 ·
**`tce` 0 (fechado aqui)**

---

## D-36 · Módulos que citam diretriz recente com números da anterior

**Primeira rodada executada em 2026-08-16.** Sete sondas escolhidas, cinco
conferidas em fonte.

### ⚠️ COMO LER O PLACAR — e por que "3 de 3" NÃO é cobertura

**A D-36 foi aberta quando o CAD/EHH ainda NÃO estava auditado.** Foi
justamente por isso que ele carregava sete números de 2009 sob rótulo de 2024:
ninguém tinha conferido os números dele um a um.

**Os três módulos que passaram — TCE, ACLS e Sepse — já haviam sido auditados
com fonte aberta NESTA MESMA auditoria.** A sonda está testando módulos cujos
números já foram conferidos.

> **Consequência: o rendimento esperado da D-36 é BAIXO POR CONSTRUÇÃO.** Três
> passes não são evidência de que o app está limpo — são evidência de que a
> auditoria funcionou. Ler "3 de 3" como cobertura inverte a causa.
>
> **A D-36 vale como VIGILÂNCIA FUTURA** — quando sair a próxima diretriz, e o
> texto de enquadramento for atualizado antes dos números — **não como
> varredura de passivo.** O passivo foi drenado pela auditoria módulo a módulo.

### Placar da primeira rodada

| módulo | sonda | resultado |
|---|---|---|
| **TCE** | PIC > 22 mmHg + existência da 5ª ed. da BTF | ✅ passa. *"Treating ICP above 22 mmHg is recommended"* (BTF 4ª ed., Nível IIB), e **não há 5ª edição** — o comentário de ausência do `alvos-tce.ts` foi revalidado com data |
| **ACLS** | atropina 1 mg (era 0,5) | ✅ passa — e a dopamina também está em 5–20 (era 2–10) |
| **Sepse** | cristaloide 30 mL/kg | ✅ passa — a SSC 2026 **manteve** o valor, contrariando a minha suspeita |
| **Convulsões** | levetiracetam 60/4.500 | ⚪ sonda descartada — **é AES 2016**, verbatim (R-62) |
| **AVC** | NIHSS ≥ 6 × ≥ 10 | ⚪ sonda descartada — construtos diferentes (basilar × circulação anterior) |
| **EAP** | — | ⚪ **sem sonda disponível** (R-13): o número escolhido (faixa de FE) **não existe no módulo**. Não é "passou" |
| **TEP** | queda ≥ 40 mmHg por > 15 min | ❌ **FALHOU** → ver D-39 |

### O que a rodada ensinou

Duas das sete sondas partiam de uma mudança que eu **supunha** e que não
existia — registrado como **R-62**. E o caso do TEP produziu o **R-63**
(traduzir o esquema novo para o vocabulário antigo), cuja varredura já foi
feita: rendimento 1 de 1, o próprio caso de origem.

---

## D-39 · TEP — a classificação de 2026 entrou como rótulo, não como conteúdo

**Aberta pela falha da sonda da D-36.** Dono: módulo de TEP.

### O que já foi corrigido (não depende da primária)

O **choque normotenso** — pressão preservada com hipoperfusão instalada — não
existia no módulo: `grep "normotens"` retornava **zero**, enquanto o conceito
já estava em Choque e no EAP. É o estado que a classificação A–E foi criada
para nomear, e o módulo o apagava ao traduzir "D–E ≈ alto risco".

Entrou o **construto e a conduta**, sem números, com a procedência declarada na
própria tela. E a linha da equivalência ganhou a ressalva do que ela perde.

### ⚠️ O que ESPERA a fonte primária

A diretriz **AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN 2026** (Circulation e
JACC, fev/2026) não abriu — **três tentativas**: as duas revistas em 403, e o
"guideline-at-a-glance" e as sínteses trazem os critérios **apenas em imagem**.

Fica pendente, na mesma disciplina da hidrocortisona e do V4R:

1. **Os critérios numéricos de hipoperfusão do D2** (lactato, diurese, índice
   cardíaco, PAM) — hoje o app descreve o estado sem pontos de corte;
2. **A inversão do "< 15 min"** — o app tem `queda ≥ 40 mmHg por > 15 min`
   (ESC 2019) como critério de "alto risco (maciço)", e as sínteses indicam que
   em 2026 o "< 15 min ou responsivo a volume" marca **outra coisa** (D1);
3. **A terminologia aposentada** — "maciço/submaciço" aparece em 5 pontos do
   módulo, e a diretriz de 2026 a retirou;
4. **A varredura número a número** do módulo, que é o que a regra da D-36 manda
   fazer quando a sonda falha.

**Como retomar:** conseguir o texto integral (acesso institucional, PMC quando
liberar, ou o PDF de uma sociedade coautora que o espelhe). **Sem ele, não se
escreve critério** — reproduzir ponto de corte a partir de resumo de terceiro é
o R-52 pela porta dos fundos.

---

## D-40 · TCE penetrante — ✅ FECHADA (2026-08-16) → **PD-4**

**Decidida: o app NÃO cobre o manejo do TCE penetrante**, e a exclusão passa a
ser declarada na tela. Registro completo em `DECISOES-DE-PRODUTO.md` (PD-4),
com o critério operacional, os cinco eixos, a fonte da trilha (BTF Penetrating
TBI, 2ª ed., 2025) e a marca de reversível.

**FRONTEIRA, NÃO MURO:** o que o módulo já faz — ABCDE, meta de PAS por idade,
PIC/PPC, via aérea, coagulação — continua valendo e é dito explicitamente. E o
ferimento penetrante **continua sendo gatilho de acionamento imediato da
neurocirurgia**, que é conduta deste módulo.


## D-37 · Os relógios de vigilância não são modulares

**Dono: runtime de árvore (`core/decision-tree`).** Nasceu com os dois relógios
da eclâmpsia (D-16), e vale para qualquer relógio de CICLO REPETIDO que venha
depois.

**O que é:** o runtime conta do MARCO, não do último ciclo cumprido. Às 18 h de
sulfatação, o relógio de vigilância mostra "ultrapassado há muito", e não
"faltam 12 min para a próxima checagem". Ele diz que a checagem está **DEVIDA**
— não quantas foram feitas, nem se a última foi há 10 minutos ou há três horas.

**O que faltaria:** um evento de **"checagem cumprida"** que REARME o relógio.
Com ele, a contagem passaria a ser do último ciclo cumprido, e o relógio
viraria **controle de aderência de verdade** — mostraria o intervalo real entre
as checagens, que é o que distingue a vigilância feita da vigilância anotada.

**Por que não é trivial, e por isso não foi feito:**

1. **Exige que a TELA ofereça o registro** — um toque em "tríade checada", com
   o que foi visto (reflexo, FR, diurese). Não é só runtime: é interface, é
   fluxo, e é mais uma coisa para fazer com a paciente na frente.
2. ⚠️ **Registro que ninguém marca é PIOR que relógio que não sabe.** Um
   contador que depende de toque humano e não recebe toque nenhum passa a
   afirmar que a última checagem foi na instalação — e isso é falso de um jeito
   que o relógio atual não é. Hoje ele não sabe e não finge saber; com registro
   abandonado, ele saberia errado.

**Enquanto isso:** a limitação está escrita na árvore e no `NÃO PROMETE` da
`valida-eclampsia`, e o texto de ultrapassagem diz o intervalo (20 min na 1ª
hora, depois de hora em hora) — quem cumpriu sabe que cumpriu.

**Quando reabrir:** se e quando a UI ganhar registro de evento clínico com
adesão comprovada em uso — não antes.

---

## D-38 · Exclusões de escopo que vivem só em comentário

**Nasceu das Convulsões**, onde o cabeçalho excluía a população obstétrica — a
decisão certa — e a tela não dizia nada, sem ramo, sem ressalva e sem ponteiro
para o módulo de eclâmpsia, que existe e está pronto. Registrado no METODO como
**R-60**.

**A pergunta:** quantos outros módulos declaram escopo em comentário sem
contraparte na tela?

**Como varrer:** buscar nos comentários por "ESCOPO", "não cobre", "fora deste
módulo", "exclui", "não se aplica a" — e, para cada ocorrência, perguntar:

1. o usuário VÊ isso, ou só quem lê o código?
2. existe **ponteiro navegável** para onde o caso é coberto, com `moduleId`
   real?
3. se a conduta em curso continua valendo, o texto diz isso — ou dá a entender
   que se deve parar?

**Não varrida.** Fecha módulo a módulo, ou num bloco próprio.

---

## D-41 · Hidrocortisona (volume de reconstituição) — ✅ ENCERRADA POR ESCOPO (2026-08-16)

**Não foi resolvida: foi reclassificada. O número não é conduta, e por isso a
pendência não existe.**

Ela vinha listada como "pendência de fonte" ao lado da AHA/ACC 2026 do TEP e da
procedência do V3R–V4R, esperando o rótulo do frasco. ⚠️ **A classificação
estava errada, e o erro era de ESCOPO, não de fonte.**

### A distinção que encerra — e que vale para as próximas

**VOLUME QUE É CONDUTA × VOLUME QUE É INSTRUÇÃO DE PREPARO.**

| | vasopressina | hidrocortisona |
|---|---|---|
| **como corre** | **infusão contínua** — 0,03 U/min | **bólus** — reconstitui e injeta |
| **o volume entra na conta?** | ✅ **sim** — 20 UI/mL numa ampola de 1 mL, e é o volume que define a concentração da bomba | ❌ **não** — nenhuma taxa, nenhuma concentração, nenhum cálculo depende dele |
| **classe** | **conduta** — errar o volume erra a dose que corre no paciente | **instrução de bula** — quem prepara lê no rótulo, como faz com qualquer pó |
| **o que a ausência do número custa** | dose errada por hora, indefinidamente | **nada** |

### O que de fato atrasa a dose já está escrito

Não é o volume: é **pegar o frasco esperando solução pronta**. E a advertência
está na tela desde a correção anterior — *"⚠️ NÃO VEM PRONTA: precisa ser
reconstituída antes de qualquer coisa, e é aí que se perde tempo no choque
refratário"*, com as duas apresentações (100 e 500 mg) e a equivalência
134 mg de succinato = 100 mg de base.

**O construto estava completo. Só o número faltava — e o número não muda
conduta.**

### A instrução de conferir o frasco FICA — com a razão certa

*"CONFIRA O VOLUME DE RECONSTITUIÇÃO NO PRÓPRIO FRASCO"* continua certa, e
agora está apoiada no motivo verdadeiro: **varia por fabricante e por
apresentação** (frasco simples × Act-O-Vial com diluente acoplado), e **quem
prepara lê no rótulo, como faz com qualquer pó liofilizado**. Não é um número
que o app deveria ter e não tem; é um número que **mora no rótulo por natureza**.

### ⚠️ A lição de método

Antes de registrar "falta o número, espera a fonte", pergunte **em que a
ausência do número muda a conduta**. Se a resposta for "em nada, porque o
fármaco corre em bólus e quem prepara lê o rótulo", a pendência **não é dívida
de fonte — é escopo, e fecha agora**.

Uma lista de pendências que carrega itens sem consequência **perde a
credibilidade dos itens que têm** — e o TEP (D-39), que espera números que
mudam classificação de risco, é exatamente um dos que têm.

**Aplicar às próximas reconstituições:** o mesmo teste vale para todo pó
liofilizado que corre em bólus.

---

## D-42 · ❌ ACHADO INVALIDADO — o deploy É por Git (aberta e fechada em 2026-08-16)

⚠️ **Esta dívida foi aberta com uma conclusão FALSA e é mantida no registro
para que a lição não se perca.** O texto original afirmava que produção não
tinha vínculo com commit. **Não é verdade.**

### O que eu afirmei, e por quê

`vercel ls` mostra todos os deploys com `Username sandrodainez`, e `vercel
inspect` (CLI 54.17) **não imprime meta de commit**. Li a ausência na saída da
ferramenta como ausência do mecanismo e escrevi que os deploys eram de CLI, a
partir do `dist` da máquina.

### O que a execução mostrou

Ao empurrar os três commits, **um build de produção começou sozinho 52 s
depois** — sem que eu rodasse deploy. Consultando a API REST:

```
source: git
githubCommitSha = 98662833cb65cad964db02688c0a5da3c4162ee1
githubCommitRef = main
```

E os **20 deploys de produção mais recentes** são, todos, `source: git`, todos
`ref=main`, cada um com o SHA do seu commit. O `Username` da listagem é o autor
do commit, não quem rodou um comando.

**A Vercel Git Integration está ligada e funcionando: produção só vem de commit
empurrado em `main`.** A premissa da auditoria — git como fonte da verdade do
que o médico vê — **está garantida por mecanismo**, e não só por disciplina.

### O que sobra de verdadeiro

Duas coisas, pequenas:

1. **`vercel --prod` manual ainda é possível** e publicaria árvore suja. Não é
   o fluxo em uso — os 20 últimos deploys provam —, mas o caminho existe.
   Fechá-lo é configuração de projeto, e é decisão do autor.
2. **O CLI instalado (54.17) não exibe a meta de commit**, e foi essa cegueira
   que gerou o falso achado. Quem for conferir procedência de deploy: **use a
   API (`/v13/deployments/<id>`), não o `inspect` do CLI.**

### ⚠️ A lição, registrada em R-65

Eu estava verificando produção justamente porque *"já fomos queimados por
supor"*. E supus — no instrumento. **A ausência de um dado na saída de uma
ferramenta não é evidência da ausência do mecanismo**; é evidência de que
aquela ferramenta não mostra aquele dado. Custou uma dívida inteira escrita com
proposta de correção para um problema que não existia.

---

## D-43 · Convergência de interface — o mapa, as travas e o tamanho real

**Aberta em 2026-08-16 a partir de quatro sintomas relatados pelo autor**, que
o levantamento mostrou serem **um problema só**.

### Os quatro sintomas e a causa única

Caixas em vez de barras nas calculadoras e eletrólitos · eletrólitos sem
distinção visual entre os íons · rail de Vasoativas "apagada" · suspeita de que
os módulos não seguem o mesmo padrão.

⚠️ **CAUSA COMUM: o app tem um sistema de design que a maior parte das telas
não consulta.** O `NumericStepper` foi distribuído para todas; **o layout e a
paleta que o tornam legível, não**. Por isso o MESMO componente aparece bom na
árvore, esmagado nas calculadoras e escondido em modal nos eletrólitos.

### Cinco padrões de entrada

| padrão | como o número entra | telas |
|---|---|---|
| **A · árvore** (canônico) | chips + **barra inline**, faixa por grandeza | **20** |
| B · calculadoras | barra inline **em linha com o rótulo** → esmagada | 1 |
| C · eletrólitos | **caixa que abre MODAL** com a barra dentro | 1 |
| D · vasoativas | barra inline | 1 |
| E · sedação/ventilador | barra com `min`/`max` **escritos à mão** | 2 |

**Decisão do autor (2026-08-16):** o canônico é **A**; **o modal do C morre**
(é histórico, não deliberado, e põe um toque entre o médico e o número num app
de beira de leito); **as três rails viram uma**, com base na das Calculadoras
(fundo escuro, legível), não na de Vasoativas.

### O tamanho REAL da dívida de cor — medido antes de estimar

O autor pediu para descontar o código morto antes de dimensionar. Medido:

| | |
|---|---|
| hex em `components/` | **1.977** |
| dos quais **já são cor da paleta**, copiada em vez de importada | **1.222 (62%)** |
| fora da paleta | 755 |
| **morto — estilo nunca referenciado em nenhum arquivo** | **189** |
| **morto por configuração — 4 telas v1 com par v2** (a flag `PADRAO = TUDO` nunca as renderiza) | **171** |
| **morto por configuração — ramo v1 dentro da árvore** (`styles` do `acls-decision-flow`) | **76** |
| **hex que REALMENTE pintam** | **1.541** |

⚠️ **436 ocorrências — 22% — não pintam nada.** O autor previu que o bloco
encolheria, e encolheu. Mais importante que o número: **`protocol-screen-styles.ts`
tem 119 estilos mortos** e é o maior arquivo de estilo do app. Boa parte da
"convergência de cor" é, na verdade, **deleção**.

### Observações do bloco — o que NÃO virou dívida

⚠️ **Cálcio e fósforo compartilham o acento `#0f766e`.** Visto na tela de
produção: os dois círculos do rail saem verdes. A distinção real vem do
**símbolo** (Ca × P) e do **glifo** (🦴 × 🧪), e cor repetida entre dois íons
não causa erro — ninguém confunde cálcio com fósforo por serem verdes; confunde
por não ler.

**Registrado como observação, de propósito, e não como dívida.** Inventar uma
cor nova para separá-los seria criar paleta fora do sistema justamente no bloco
que existe para acabar com isso, e **dívida que ninguém vai pagar polui a
lista** — acabamos de fechar a D-41 pelo mesmo critério. Se um dia a paleta for
revista de propósito, o par entra na revisão.

**Também observado, e este é layout:** no hero dos Eletrólitos o terceiro
cartão ("CLASSIFICAÇÃO") transborda a borda direita no viewport de 375. Não
estava entre os quatro sintomas e não afeta legibilidade do que está visível.

### O que já está travado (e o que ainda não)

- ✅ **`contraste-renderizado`** — universo derivado do `dist`, 30 módulos, 2 no
  legado (Vasoativas 13, Eletrólitos 10).
- ✅ **`test:paleta`** — nenhum hex novo fora do design system; 56 arquivos com
  teto congelado que só desce.
- ✅ **`test:padroes-ui`** — era mapa que ninguém rodava, virou trava com teto
  11.
- ❌ **Nada ainda garante o PADRÃO DE LAYOUT** (empilhado × em linha) nem que a
  distinção visual declarada no dado chegue à tela. Isso nasce com o bloco (3).

### Ordem de execução, revista pelo levantamento

**Os Eletrólitos passam à frente das Vasoativas.** A razão de contraste é pior
(1,60:1 contra 2,36:1) e atinge **a classificação do distúrbio e o status do
valor** — informação que decide conduta, não rótulo de navegação. E a mesma tela
concentra três dos quatro sintomas.

⚠️ **Os três casos em 4,43:1 ficam como estão, por decisão do autor:** reprovam
por 0,07 num piso convencional e são a **borda do tema** (`#f1f5f9` sobre
`#565e6c`), não defeito de tela. **Mexer no token para satisfazer a trava seria
o R-55 aplicado à cor** — piorar o desenho para agradar o instrumento.
Reavaliar quando a paleta for revista de propósito.

---

## D-44 · ⚠️ "TEM TRAVA" NÃO É INFORMAÇÃO — 239 de 381 nós são interrogados

**Aberta em 2026-08-16, e ela reordena o significado do balanço da auditoria.**

### Como apareceu

Declarei que `shock/dx_distributivo_outro` "não tinha conteúdo". Tinha — conduta,
causas, encaminhamento. E **nenhuma trava me contradisse**, embora
`valida-choque` leia o arquivo inteiro: ela simplesmente **não pergunta nada
sobre aquele nó** (R-74 — universo completo, asserção ausente).

A medição foi então feita em todos os módulos com árvore: para cada nó, existe
ao menos um padrão da(s) trava(s) do módulo que casa com algum texto dele?

### A tabela

| módulo | nós | interrogados | % | travas |
|---|---|---|---|---|
| **dyspnea** | 29 | **1** | **3%** | 1 |
| **politrauma** | 24 | 5 | 21% | 2 |
| **avc** | 25 | 6 | 24% | 2 |
| **shock** | 31 | 11 | 35% | 2 |
| sepsis | 24 | 11 | 46% | 2 |
| ventilation | 25 | 13 | 52% | 4 |
| seizure | 15 | 9 | 60% | 3 |
| eap | 26 | 16 | 62% | 4 |
| poisoning | 20 | 14 | 70% | 3 |
| dka-hhs | 18 | 14 | 78% | 5 |
| eclampsia | 17 | 15 | 88% | 3 |
| coronary | 21 | 19 | 90% | 5 |
| tep | 23 | 22 | 96% | 4 |
| acute-abdomen · anaphylaxis · rsi · tce | 15·26·27·15 | **todos** | 100% | 1·2·7·4 |
| **TOTAL** | **381** | **239** | **63%** | — |

### O que isto significa — e o que NÃO significa

**Significa:** 142 nós do app estão dentro do universo de uma trava e fora de
toda asserção dela. Uma regressão em qualquer um deles passa verde.

⚠️ **NÃO significa que estejam errados.** É medida de ALCANCE, não de qualidade:
um nó "coberto" pode estar coberto por um padrão que casa com o título.

### O padrão que a tabela revela

**A cobertura acompanha a auditoria, não o tamanho do módulo.** Os módulos
auditados por último e com mais travas dedicadas (rsi 7, coronary 5, dka-hhs 5)
estão perto de 100%; os auditados no começo, ou cuja trava nasceu para guardar
UM achado, estão embaixo.

**A Dispneia é o caso extremo — 1 de 29** — e não por acaso: ela é uma cascata de
exclusão de 11 perguntas, e a única trava do módulo guarda um ponto específico.
Foi justamente ali que o `dx_indefinido` passou anos como transição de 265
caracteres sem ninguém notar.

### O que muda no balanço

`RELATORIO-CONSOLIDADO.md` conta 53 travas e trata "módulo fechado" (R-20) como
propriedade do módulo. **Não é**: fechado significa "as perguntas que alguém fez
continuam respondidas", e agora dá para dizer quantas são.

**O `INDICE-DE-TRAVAS.md` passa a trazer a coluna `nós cobertos / nós do
módulo`.** É o dado que faltava para o índice significar alguma coisa.

### Não é para consertar agora

Subir de 63% para 100% é escrever asserção para 142 nós, e asserção escrita
para satisfazer contador é pior que ausência declarada. **A ordem correta é a
inversa:** quando um módulo for tocado por outro motivo, os nós mudos dele
entram no bloco. `npm run mapa:cobertura` dá a lista por módulo (`--mudos`).



---

## D-45 · ~4.300 chaves órfãs — e elas são PASSIVO DE TELA, não dicionário inflado

**Aberta em 2026-08-17, como efeito colateral da verificação de produção do
`761c90c`.** Não medida a fundo — o que está aqui é a medição rápida com a
margem declarada, não uma conclusão.

### ⚠️ REENQUADRAMENTO (2026-08-17, mesmo dia): mudou a NATUREZA, não o tamanho

Esta dívida nasceu como "o dicionário tem 40% de entradas que não correspondem a
texto vivo" — um problema de tamanho, de arquivo grande, de lixo acumulado. Está
errado, e a correção importa mais que o número.

**As órfãs não são lixo. São EDIÇÕES cuja outra metade ficou sem tradução.** Cada
chave que não bate com texto vivo é o rastro de uma frase em português que MUDOU
depois de traduzida. A chave velha e a frase sem tradução são as duas metades da
mesma edição — e a metade que sobrou é a que o médico lê na tela, em português,
com o app em espanhol.

Isso transforma a estimativa de ~4.300 de "gordura" em **estimativa de passivo de
tela**: um teto para quantas frases podem estar aparecendo no idioma errado.

### O CASO PROVADO — `ritmos-acls`, medido em produção

Não é mais hipótese. Com o app em espanhol, a tela do módulo Ritmos mostrava:

> `Mesmas energias da FV. Se polimórfica (Torsades de Pointes): SULFATO DE
> MAGNÉSIO — 1–2 g IV/IO em 1–2 min. Aqui o paciente está em PARADA: não há
> pressão a proteger…`

E o dicionário tinha, traduzida e correta, a chave:

> `Mesmas energias da FV. Se polimórfica (Torsades de Pointes): considerar
> sulfato de magnésio 1–2 g…`

A auditoria trocou "considerar sulfato de magnésio 1–2 g" pelo bloco completo com
a justificativa da infusão rápida. O conteúdo melhorou; a chave ficou na versão
anterior. **Uma órfã e uma linha em português, do mesmo ato de edição.**

⚠️ Nenhuma das duas travas de dicionário viu: `test:i18n` lê o fonte (onde os
literais têm chave) e `test:traducao-runtime` lê `lib/` compilado (e isto vive em
`.tsx`). Quem viu foi `e2e/tela-em-espanhol.spec.ts`, lendo a TELA.

### O que a medição a fundo deve responder, agora com a pergunta certa

Não é "quantas chaves sobram?" — é **"para quantas órfãs existe hoje uma frase
viva parecida sem tradução?"**. Cada par encontrado é uma linha em português na
tela de alguém.

### O que apareceu

Duas frases que esta auditoria removeu do conteúdo continuavam no bundle de
produção. Não chegam à tela: são **chaves órfãs** do dicionário PT→ES, que é
compilado inteiro. Isso motivou uma contagem geral.

### O método, e por que o número tem margem

Comparação de cada chave PT dos dicionários (`lib/i18n/**`, `acls/locales/**`)
com a concatenação de todo `.ts`/`.tsx` de conteúdo, excluídos `scripts/`,
`e2e/`, `dist/`, `node_modules/` e os próprios dicionários. Chaves com menos de
12 caracteres foram ignoradas (ruído).

**Resultado: 4.325 órfãs de 10.632 chaves — 41%.**

⚠️ **E o número JÁ ERROU UMA VEZ.** A primeira contagem deu 4.116 porque
comparava a chave *parseada* (com aspas literais) contra o fonte *cru* (com
`\"`): toda frase que continha aspas internas era falso positivo. Corrigido
normalizando as barras invertidas. Isso é sinal de que outros falsos positivos
podem sobreviver — texto montado em tempo de execução, por exemplo, não aparece
como literal contínuo em arquivo nenhum.

**Por isso a dívida é "medir direito", não "apagar 4.325 linhas".**

### A pergunta que ela abre, e que é maior que ela

Se ~40% do dicionário não corresponde a texto vivo, **o que exatamente
significaram os zeros de `test:i18n` que esta auditoria reportou tantas vezes?**

A varredura responde "toda frase PT do conteúdo tem par em ES" — e isso continua
verdadeiro. Mas ela **não** responde "toda entrada do dicionário serve para
alguma coisa". Um dicionário que dobrou de tamanho traduzindo frases que já não
existem passa na varredura exatamente como um dicionário enxuto.

⚠️ **O zero nunca foi falso — mas ele mede o que FALTA, nunca o que SOBRA.** A
consequência prática: o esforço de tradução gasto nesta auditoria pode incluir
frases que ninguém lê, e não há como saber quanto sem a medição correta.

### Como fechar

1. contagem com normalização de escapes **e** de texto montado dinamicamente;
2. amostra manual de 30 órfãs, para estimar a taxa de falso positivo que sobra;
3. só então decidir entre apagar, marcar como legado congelado, ou criar uma
   conferência de órfãs no molde do teto que só desce.

---

## D-46 · Os 30 nós que usam `< 0,5 mL/kg/h` como META e não dizem que ele também DIAGNOSTICA

**Aberta em 2026-08-17, ao escrever o módulo de injúria renal aguda.**

### O que é, e o que NÃO é

⚠️ **Os 30 nós não estão errados.** `Diurese ≥ 0,5 mL/kg/h` é meta de perfusão
correta em sepse, choque, EAP, TCE, TEP, CAD/EHH e eclâmpsia, e está escrita
corretamente em todos. **Isto é dívida de ACRÉSCIMO, não de correção.**

O que falta é a outra metade da mesma medida: pelo KDIGO 2012, **menos de
0,5 mL/kg/h sustentado por 6 a 12 horas é injúria renal aguda estágio 1** — com
creatinina normal e sem mais nada. E o eixo da diurese pode estar no **estágio 3**
(anúria ≥ 12 h) antes de a creatinina se mover.

**Ninguém junta as duas coisas sozinho** — é a mesma medida em dois papéis, e o
app usa um deles trinta vezes sem nunca nomear o outro.

### Onde está pago

No módulo novo, e com o contraste escrito para **ensinar**, não só informar:

> "⚠️ O MESMO NÚMERO QUE VOCÊ PERSEGUE COMO META É, SE DURAR, O CRITÉRIO QUE
> DIAGNOSTICA — e é isto que quase ninguém junta."

Travado por `valida-ira` (conferência 1), com mutação: apagar o contraste
reprova. Fora do módulo novo, **nada foi tocado**.

### Onde começar, se um dia pagarmos

**A SEPSE**, e por três razões medidas:

1. é a **causa mais comum de IRA** entre os módulos do app;
2. é onde a meta aparece **mais vezes** — `sepsis` lidera as 30 ocorrências;
3. e o módulo **já tem** os insumos: a creatinina entra no SOFA, o `atb_*` já
   ganhou o piso de função renal, e `reaval_perfusao` e `destino` já falam de
   diurese como alvo. O acréscimo seria de uma frase por nó, não de conteúdo novo.

Depois dela, por volume de ocorrências: `shock`, `eap`, `tce`.

### O que o acréscimo NÃO deve fazer

⚠️ **Não repetir o estadiamento em 30 lugares.** O que cabe em cada nó é uma
linha — que aquele mesmo número, se sustentado, estadia — e o ponteiro para o
módulo de IRA. Trinta cópias da tabela KDIGO seria o defeito da densidade (item
8) em escala.

---

## D-47 · Faixa clínica sem camada numérica conferida — a pergunta a medir

**Aberta em 2026-08-17. ⚠️ E A PRIMEIRA VERSÃO DESTA ENTRADA ESTAVA ERRADA — o
registro do erro é parte da dívida.**

### O que eu escrevi, e por que estava errado

A varredura do item 13 acusou `DOBUTAMINA_MCG_KG_MIN` de não ter consumidor. Eu a
apaguei e abri esta dívida dizendo que *"a faixa da dobutamina vive só como
texto, sem constante que a verifique — é o `vancoLoad` esperando acontecer"*.

**`npm run test:dobutamina` reprovou em três conferências.** Quem consome a
constante é a **trava**: `valida-dobutamina.cjs` compara os números com a bula
(referência externa, escrita lá de propósito para não girar em falso) e depois
confere que o **texto** exibe os mesmos valores.

⚠️ **A dobutamina era o EXEMPLO DO PADRÃO CERTO, não o caso de risco.** Ela tem
três camadas: o número, o texto, e a trava que amarra os dois a uma fonte externa.
Meu erro foi conceitual — tratei "consumidor" como "quem renderiza", quando uma
constante numérica pode existir exatamente para **ser conferida**, e essa é a
forma mais forte de proteger um número clínico.

A varredura excluía `scripts/` do universo de consumidores. Corrigido, com a
razão escrita na trava.

### A dívida de verdade, invertida

A pergunta não é *"quantas faixas vivem só como texto?"* — é a mesma pergunta com
o sinal trocado:

> **Quantas faixas clínicas NÃO têm o padrão da dobutamina — número em constante,
> texto derivado, e trava amarrando os dois a uma fonte externa?**

Não medido. O que se sabe: **263 constantes de texto** em `lib/`, todas
consumidas; e um número desconhecido de faixas que existem **só** como texto,
sem camada numérica. O caso da vancomicina prova que o risco é real — lá havia
duas camadas numéricas e elas divergiram —, mas o risco de *nenhuma* camada é
diferente: não há divergência possível hoje, e sim ausência de verificação.

**O molde da medição:** extrair `número + unidade/kg` do texto renderizado,
cruzar com as constantes numéricas de `lib/`, listar as que só existem como
texto. O critério do que fazer com o resultado é provavelmente o do PD-6: ganha
camada numérica quem aparece em mais de uma superfície.


---

## D-48 · Arquivos grandes — a hora certa é durante a UI 2.0, não antes

**Aberta em 2026-08-17. Deliberadamente NÃO tratada, e a razão é a que importa.**

Medidos 18 arquivos acima de 800 linhas:

```
2.935  components/protocol-screen/electrolyte-calculator-screen.tsx
2.463  acls/reducer.ts
2.243  components/protocol-screen/protocol-screen-styles.ts
1.973  vasoactive-engine.ts
1.705  components/protocol-screen/acls-protocol-screen.tsx
1.515  components/protocol-screen/module-flow-shell.tsx
1.425  components/protocol-screen/acls-decision-flow-screen.tsx
1.311  components/protocol-screen.tsx
1.255  engine.ts
1.065  components/protocol-screen/vasoactive-calculator-screen.tsx
1.020  clinical-calculators-engine.ts
  … e outros 7
```

⚠️ **POR QUE NÃO AGORA: a UI 2.0 vai reescrever esta camada.** Refatorar
`acls-decision-flow-screen.tsx` hoje é trabalho que a migração desfaz — e o
risco não é pequeno: **é o componente que renderiza TODOS os fluxos de decisão**.
`ListaDeCriterios`, `InputStep`, `TransitionStep` e o acordeão que originou o
R-75 vivem lá. Mexer nele sem benefício medido, antes de uma reescrita
programada, é assumir risco por estética.

⚠️ **E ISTO NÃO É ESQUECIMENTO.** A dívida está aqui com a razão e com o momento:
**a hora certa é DURANTE a UI 2.0**, quando a camada estiver sendo reescrita de
qualquer forma e a decomposição sair de graça. Quem fizer a migração deve abrir
esta entrada antes de começar.

**O que NÃO está em dívida:** tipagem. Medido no mesmo bloco — 1 `any`, 1
`as any`, 0 `@ts-ignore`, `strict: true`. Este item saiu da lista por não existir.

---

## D-49 · A ordem da lista de vasoativos afirma o inverso da escalada

**Aberta em 2026-08-17. A metade barata foi feita; a reordenação fica.**

### O achado, medido

A tela de vasoativos apresenta as drogas nesta ordem:

```
Noradrenalina → ADRENALINA → Dobutamina → Dopamina → VASOPRESSINA → Milrinona
```

⚠️ **A adrenalina em 2º e a vasopressina em 5º — e a escalada é o inverso.** A
própria sepse do app afirma, citando a SSC 2026: *"a adrenalina entra quando a PAM
segue inadequada apesar de noradrenalina E VASOPRESSINA"*. A lista, pela posição,
diz que a adrenalina vem antes.

E há um agravante de vocabulário: **"segunda linha" aparece na tela aplicado só à
vasopressina** (*"Segunda linha em choque…"*), então o léxico de linha existe ali,
usado de forma inconsistente com a ordem visual.

### O que foi feito agora

A frase — `ADRENALINA_CHOQUE_QUANDO`, que estava morta em `lib/`, foi reescrita e
passou a ser consumida pelas `notes` da adrenalina, dizendo que ela entra apesar
de noradrenalina **e vasopressina**, com a exceção da disfunção cardíaca
delimitada. E a nota vizinha, que dizia *"reservar para choque refratário a
noradrenalina"*, ganhou **"E vasopressina"**.

**Com a frase presente, a ordem visual deixa de afirmar sozinha.**

### O que fica, e por quê

**A reordenação da lista.** É decisão de UI numa tela que a **UI 2.0 vai
reescrever** (ver D-48) — reordenar antes é trabalho desfeito. Fica registrado
para que a UI 2.0 **herde a decisão em vez de repetir o defeito**:

> na lista de vasoativos, a ordem de apresentação deve seguir a ordem da
> escalada — noradrenalina, vasopressina, adrenalina —, e não a ordem histórica
> de cadastro. E se o léxico de "linha" for usado, ele vale para todas as drogas
> ou para nenhuma.

---

## D-50 · O `acls/` fora do universo das duas travas de tradução — 36 literais sem chave, e o painel de adrenalina só se vê com o cronômetro andando

**Alvos nomeados:** `acls/reducer.ts` (36 literais de prosa portuguesa sem chave
no dicionário) e `acls/presentation.ts`.

### O que está fora, e por quê

`scripts/varredura-pt.cjs` lê o fonte e tem `acls/` no universo — mas o texto do
painel de adrenalina não é literal parado: é **montado pelo reducer em função do
tempo decorrido**. `scripts/valida-traducao-runtime.cjs` lê o artefato compilado,
e ali o `reducer.ts`/`presentation.ts` também escapa: o texto não vive em objeto
exportado, e sim no retorno de função chamada com estado.

Nenhuma das duas mente sobre isso — as duas o declaram no cabeçalho. Mas o
resultado é que o painel que o médico mais olha durante uma PCR é justamente o
que nenhuma trava confere em espanhol.

### O que falta, concretamente

Um instrumento que **avance o cronômetro**: instancie o estado do ACLS, dispare
os eventos de tempo (ciclo, dose, troca de compressor) e colha o texto que o
painel emitiria em cada instante — comparando então com o dicionário. Sem
avançar o tempo, o universo é vazio, e trava sobre universo vazio passa calada,
que é o defeito (R-15 item 9).

### ⚠️ Por que NÃO construí agora

Decisão do médico, e ela é boa: o instrumento é maior que a correção, e
construí-lo no meio do bloco de tradução transformaria uma correção de texto em
um projeto de teste de máquina de estado. Os 36 literais ficam **nomeados** —
que é o que impede a dívida de virar esquecimento.

### O tamanho real

36 literais em `reducer.ts` é uma medição do fonte, não do runtime. Pelo que a
mutação do bloco de tradução mostrou (uma concatenação derrubando três
superfícies), o número de FRASES que a tela monta a partir deles é
**provavelmente maior**. R-82 aplica-se a esta própria estimativa.

---

## D-51 · CARACTERE DE APRESENTAÇÃO DENTRO DA STRING TRADUZÍVEL — o risco medido, e a correção do diagnóstico

### ⚠️ PRIMEIRO, A CORREÇÃO: não foi este o mecanismo das duas linhas da Sedoanalgesia

Diagnostiquei que `• Indução (estável)…` saía em português porque o bullet estava
colado ao texto e quebrava a chave. **Estava errado.** O render é
`<Text>• {tr(linha)}</Text>` — o bullet fica FORA do `tr()` nos cinco renders
daquele arquivo. O defeito real era outro: **um dos cinco não chamava `tr()`**
(`mode.bolusNotes?.map((n) => … {n})`, em `sedation-calculator-screen.tsx:473`),
e a tradução já existia em `lib/i18n/modules/sedacao.ts`.

O acerto do diagnóstico era a consequência — "não precisa escrever espanhol" —,
não a causa. Registrar o mecanismo errado teria mandado a próxima pessoa mexer no
bullet e o `tr()` continuaria faltando.

### O mecanismo, que é real mesmo não tendo sido este

Bullet, seta, travessão, emoji ou numeração colados ao texto **dentro** da string
mudam a chave sem mudar a frase. Quem lê não suspeita, porque na tela "parece a
mesma coisa": `"• Indução"` e `"Indução"` são duas chaves diferentes, e mover a
marca entre a string e o estilo — nos dois sentidos — quebra a tradução em
silêncio.

### A varredura, com os números

| | |
|---|---|
| chaves lidas nos dois dicionários | **11.557** |
| chaves que **começam** com marca de apresentação | **655** |
| chaves que **terminam** com marca | **9** |
| linhas com marca DUPLICADA na tela (31 módulos) | **0** |

Concentração das 655: `avc-prescricoes.ts` (74), `sepse-eng-b.ts` (44),
`sepse-eng-c.ts` (38), `sepse-engine.ts` (26), `injuria-renal-aguda.ts` (25).

Quase todas são `⚠️` e `✅` que fazem parte do CONTEÚDO — a chave inclui a marca e
o render não acrescenta nada. Isso funciona, e a medição de marca duplicada em
produção deu **zero**: hoje não há um único render somando marca a uma chave que
já traz uma.

### Por que fica como dívida e não como trava

O passivo não é erro atual — é **acoplamento**: 655 chaves cuja validade depende
de a marca continuar exatamente onde está. Uma trava que proibisse marca na string
reprovaria 655 casos que funcionam; uma que proibisse marca no estilo reprovaria
os renders corretos. O que se pode travar é o SINTOMA — marca duplicada na tela —,
e isso `e2e/tela-em-espanhol.spec.ts` já vê de graça quando o texto muda de idioma.

⚠️ A regra para quem edita: **decida onde a marca vive e não a mova**. Se mover,
regrave a chave — as duas travas de dicionário passam verdes de qualquer jeito.

---

## D-52 · ~~Seis ausências declaradas sem guarda~~ — FECHADA em 2026-08-17 (R-88)

**FECHADA.** `scripts/valida-ausencias-declaradas.cjs` (`npm run test:ausencias`)
guarda as OITO, com o universo DERIVADO: uma declaração de ausência nova reprova
até ganhar guarda, o que impede a trava de virar a lista do D-15.

Cada caso declara o `proibido` — o número plausível que alguém escreveria
"ajudando". Mutação provada nas três mais expostas: `NIHSS ≥ 6`,
`reavaliar a cada 15 min`, `envelhecimento em 24 a 48 h` → as três reprovam.

⚠️ E a própria trava achou um erro meu na primeira execução: a guarda da cinética
por composto usava uma variante da frase diferente da lista de declarações, e o
universo derivado a acusou como desguardada. A conferência guarda × declaração casa
pelo `source` da regex — duas variantes da mesma frase não casam.


A varredura de 2026-08-17 achou **oito** declarações de ausência em texto de tela
— lugares onde o app diz que NÃO fixa um número porque a fonte não o dá. Duas têm
trava; **seis não**:

| ausência | arquivo | o número que alguém escreveria |
|---|---|---|
| NIHSS sem limiar para oclusão de grande vaso | `oclusao-grande-vaso.ts` | "NIHSS ≥ 6" |
| janela do hemoperitônio | `hemoperitonio.ts` | uma cadência em horas |
| cinética de envelhecimento por composto | `pralidoxima-controversia.ts` | "até 24–48 h" |
| "se o protocolo do seu serviço prevê pralidoxima" | `pralidoxima-controversia.ts` | uma indicação fechada |
| "a AHA 2025 não fixa esquema" (fibrinólise no TEP) | `causas-reversiveis-detalhe.ts` | alteplase 50 mg como se fosse AHA |
| hiperventilação < 30 sem monitorização | `alvos-tce.ts` | um piso menor |

⚠️ As três primeiras são as mais expostas: são números que todo médico "sabe", e
completá-los parece corrigir uma omissão em vez de inventar precisão.

**O que falta:** uma conferência por caso, com a mutação sendo escrever o número
plausível — não uma quebra artificial. É trabalho mecânico e curto; ficou de fora
do bloco do ECG para não misturar com a correção clínica.
