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

---

## D-53 · Os 749 px acima do cronômetro no ramo chocável — e os dois cronômetros que vão virar um card

**Aberta em 2026-08-18, ao fim do item da troca de compressor.** Fica aqui com a
causa NOMEADA porque quatro hipóteses caíram e o retorno de continuar caçando
acabou — não porque o defeito seja aceitável.

### O resíduo, medido

Depois do rótulo derivado do timer e da troca por proximidade, **20 dos 22 estados
medidos estão corretos**. Sobram dois, ambos no ramo CHOCÁVEL:

| estado | faixa do cronômetro | linha da troca | dobra |
|---|---|---|---|
| `Epinefrina — 1ª dose · Ciclo 1` | y782 ✅ | **y882** — 43 px abaixo | 839 |
| `Manter RCP · Ciclo 1` | y759 ✅ | **y859** — 20 px abaixo | 839 |

⚠️ **A faixa está acima nos dois.** O que cruza a dobra é só a linha da troca, que
vive dentro dela, por 20 e 43 px.

### A causa, nomeada

**Há ~749 px de conteúdo acima do cronômetro nesses estados.** Não é um bloco
específico empurrando — foi o que quatro hipóteses tentaram e nenhuma sustentou:

| # | hipótese | como caiu |
|---|---|---|
| 1 | o CTA "MEDICAÇÃO — AGORA" empurra o card de RCP | o card estava a y651, visível |
| 2 | pôr no painel `CONDUTA DESTE CICLO` | o painel desce a y1037–1060 nesses estados |
| 3 | pôr no bloco `PRÓXIMO RITMO` | o bloco "não existia" — era o RÓTULO que mudava (R-83) |
| 4 | subir o bloco para cima do CTA | **o CTA não está na tela** nesses estados — 22 de 22 medições com `CTA ynull` |

A quarta é a que fecha o diagnóstico: não existe um culpado único a deslocar. É
**acúmulo** — cabeçalho, cronômetro de parada, chips, ATIVAR VOZ, o card do estado,
o painel do ciclo. Cada um defensável; a soma, não.

⚠️ Por isso a dívida é da **UI 2.0**, que redesenha a hierarquia da tela. Corrigir
por deslocamento agora é escolher qual conteúdo clínico rebaixar, e nenhuma das
quatro tentativas encontrou um candidato que não fosse conduta.

### ⚠️ A DECISÃO DO MÉDICO, que muda o destino desta dívida

Medido: em quatro estados do ramo NÃO CHOCÁVEL, **os dois cronômetros aparecem na
mesma tela**, ambos nomeados e separados por ~620 px —

```
epiCard  y137   «PRÓXIMA EPINEFRINA»   180 → 151 → 121s   (conta para a droga)
faixa    y759   «Próximo ritmo»                    59s    (conta para o ritmo)
```

Levado ao autor com os números, a resposta foi: **os dois cronômetros CONFUNDEM
separados e devem ficar no MESMO CARD.**

Isso é o próximo bloco, e **provavelmente resolve os dois estados residuais acima**:
juntar os dois relógios num card só remove uma faixa inteira da coluna vertical,
que é exatamente o que falta para a troca subir os 43 px.

⚠️ Quem for fazer: os dois relógios têm FONTES diferentes — `timers[0]` (invariante
de um só, do reducer) e `operationalMetrics.nextAdrenalineDueInMs`. Juntar na tela
não pode fundir as fontes.

## D-54 · A ETIQUETA REPETE O TÍTULO EM 24 DE 30 CARDS — defeito do sistema de etiquetas, não do layout

⚠️ **O NÚMERO FOI CORRIGIDO DE 14 PARA 24 EM 2026-08-18**, no mesmo dia. O 14 saiu
de um teste que normalizava acento e caixa e comparava SUBSTRING. Ele acha
`Choque│Choque` e `AVC│AVC`, e não acha o resto — porque **a redundância também é
por SIGLA e por ABREVIATURA**, que nenhuma comparação de substring alcança:

    Tromboembolia Pulmonar │ TEP        Ventilação mecânica │ VM
    Edema agudo de pulmão │ EAP         Insuficiência respiratória │ Insuf. resp.
    Crises convulsivas │ Convulsões     CAD e estado hiperosmolar │ CAD / EHH
    Correções eletrolíticas │ Eletrólitos   Injúria renal aguda │ Rim
    Pré-eclâmpsia / Eclâmpsia │ PE / Eclâmpsia   Drogas Vasoativas │ Vasoativos

"TEP" não está dentro de "Tromboembolia Pulmonar" como texto; é a mesma palavra.
São **10 casos** que só a leitura acha — o médico apontou "Vasoativos" e ele não
estava entre os meus 14. **O 14 era piso, não medida**, e ficou registrado aqui
porque a diferença entre os dois números é a lição, não o número.

Contagem correta, pelo critério de R-91 (rótulo de pertencimento só informa onde
há um pai): **24 dos 30 cards** têm etiqueta que não diz nada que o título não
diga. As 6 que sobrevivem estão todas dentro da seção do PCR.

As 14 que a comparação de substring achava (o resto está no bloco acima):

    PCR na Gestação │ PCR          ·  Cuidados Pós-PCR │ Pós-PCR
    Sepse / Choque Séptico │ Sepse ·  Choque │ Choque
    AVC │ AVC                      ·  Síndromes coronarianas │ Coronariana
    ISR — Via aérea │ ISR          ·  Politrauma │ Politrauma
    TCE │ TCE                      ·  Intoxicações exógenas │ Intoxicações
    Anafilaxia │ Anafilaxia        ·  Abdome agudo │ Abdome agudo
    Sedoanalgesia & BNM │ Sedoanalgesia · Calculadoras Clínicas │ Calculadoras

**POR QUE ISTO NÃO É PROBLEMA DE LAYOUT.** Apareceu ao medir a versão de três
colunas, onde o descritor sai — e a conclusão fácil seria "a etiqueta salva os
dois canais". Não salva: nesses 24 ela devolve a mesma informação do título, de
modo que o card fica com **um canal repetido duas vezes**, não com dois. Mudar
grade, fonte ou espaçamento não muda isso em nenhum sentido.

**O CRITÉRIO, que vale quando for resolvido:** ou a etiqueta diz algo que o
título não diz — o CENÁRIO em que se pega aquele módulo, que era a intenção
original —, ou ela não precisa estar naquele card. As duas saídas são legítimas;
a que não é legítima é a atual, em que ela ocupa uma linha para não dizer nada.

Parente de R-90 (repetição com significado é informação; por acidente é ruído):
aqui a repetição é entre CANAIS do mesmo card, não entre cards.

⚠️ **NÃO RESOLVER AGORA** — decisão do médico, em turno próprio. Registrada para
não se perder junto com a escolha de grade, que é outra coisa.

### D-54, segunda forma · O DESCRITOR REPETINDO O TÍTULO — e por que ela não tem trava

Registrada em 2026-08-18, ao medir a terceira versão do protótipo. A dívida tem
duas formas, e só a primeira é contável:

  1. **A ETIQUETA repete o título** — 14 de 30, medível por normalização de
     acento e caixa (acima). Um script acha todos.
  2. **O DESCRITOR repete o título** — ⚠️ NÃO APARECE EM CONTAGEM NENHUMA. O caso
     que a revelou passava em tudo: `Ritmos de Parada` / «Os 4 ritmos da parada»
     tinha 21 caracteres, cabia em duas linhas, não transbordava, e lia-se bem na
     ampliação. E não dizia nada: a única informação nova era o "4".

**O CRITÉRIO, que é do médico e vale para as duas formas:** o descritor não
descreve o CONTEÚDO do módulo — nomeia O QUE SE GANHA AO ABRI-LO. Enumerar os
quatro ritmos descreve o conteúdo; «Chocável × não chocável» nomeia a decisão que
o módulo apoia, que é o que o título não diz. Ganho extra quando a formulação
já existe no app: aqui é a mesma distinção que a pergunta do ritmo faz
(`acls/presentation.ts:185` — «FV/TV = chocável · AESP/Assistolia = não
chocável»), de modo que o médico reconhece em vez de aprender.

**POR QUE NÃO SE ESCREVE TRAVA PARA ISTO.** A primeira forma é sobreposição de
strings — mecânica. A segunda é sobreposição de SIGNIFICADO: «Os 4 ritmos da
parada» e «Ritmos de Parada» não compartilham estrutura que um teste ache sem
achar junto uma dúzia de descritores legítimos. Precisa de olho, na revisão de
conteúdo, não de script. Registrar isto aqui é a alternativa honesta a fingir que
uma contagem cobre o caso.


### D-54, nota de execução · O ANCORAMENTO AO PÉ — nota, NÃO dívida

Ao medir a quarta versão apareceu vazio de **9 a 37 px** entre o fim do texto e o
pé do card, com amplitude de até 27 px dentro de uma mesma linha da grade.

**NÃO É DÍVIDA, e o registro é para que ninguém a abra:** foi medido, é
PRÉ-EXISTENTE às quatro versões (a pior linha — Politrauma │ TCE │ Crises — não
tem etiqueta nenhuma, e a causa é título e descritor ocupando 1 ou 2 linhas em
combinações diferentes), e a barra lateral corre a altura inteira e ancora o
card, de modo que lê como respiro. Remover as etiquetas não criou nem piorou o
efeito; apenas deixou de escondê-lo dentro de uma linha a mais.

Se um dia se quiser fechar, é ancorar o conteúdo ao pé em vez do topo — uma
linha, `justify-content:flex-end` no `.c` (que já é `display:flex` em coluna),
tirando o `flex:1` do descritor. Fica aqui para não ser redescoberto como
problema.

## D-55 · CRITÉRIO DE INTUBAÇÃO SEM FONTE ÚNICA — 12 lugares na insuficiência respiratória

Levantado em 2026-08-18, ao conferir se o bloco A do retrato do hub precisava
subir para as telas de entrada. A descrição longa do módulo prometia «critérios
de intubação»; o nó de entrada não os traz. Mas a conclusão NÃO é mover um deles
para a entrada:

    IOT e link para o protocolo correspondente.
    IOT na falência ventilatória.
    IOT se exaustão/rebaixamento; VM com expiração prolongada.
    IOT se falha. Ver ventilação mecânica.
    IOT se falência.
    IOT se insuficiência respiratória refratária.
    IOT se rebaixamento/apneia. Reverter causa.
    IOT.
                                    (12 ocorrências em `dyspnea-decision-tree.ts`)

**ISTO NÃO É PROBLEMA DE POSIÇÃO, É FONTE ÚNICA FALTANDO.** Cada ramo diz o seu
critério com as suas palavras — «falência», «exaustão», «refratária», «falha» —
e nenhum aponta para uma definição comum. ⚠️ **Mover um deles para a entrada
criaria o 13º**, que é o defeito, não a correção: seria uma redação nova
concorrendo com doze existentes.

**O QUE FECHA:** uma fonte única de critério de intubação, consumida pelos ramos
— o mesmo padrão da meta de PAS no TCE (D-1), em que texto e lógica passaram a
sair do mesmo lugar. Enquanto isso não existir, qualquer edição em um dos doze
deixa os outros onze intactos e discordantes.

⚠️ NÃO TRATAR JUNTO COM O HUB. Nasceu do retrato das descrições, mas é dívida
clínica do módulo, e misturá-la com a migração de UI faz as duas piorarem.

## D-56 · DOIS DOCUMENTOS GERADOS NÃO ACOMPANHAM O REPOSITÓRIO — e alguém vai lê-los

Medido em 2026-08-18. `auditoria/INVENTARIO-CLINICO.md` e
`auditoria/CAMADA-9-RASTREABILIDADE.md` são GERADOS por script. Rodando os
scripts **do próprio HEAD**, sem nenhuma alteração no repositório, os dois
arquivos mudam:

    INVENTARIO-CLINICO.md          178 linhas trocadas de 325  (55%)
    CAMADA-9-RASTREABILIDADE.md     34 linhas trocadas de  60  (57%)

Ou seja: **mais da metade de cada um está errada**, e não por defeito do gerador
— por não ter sido regenerado. Último commit de cada: 2026-08-01 e 2026-08-09.

A defasagem não é cosmética. No inventário, o volume de texto por módulo:

    (tradução)   6.368 → 8.274 caracteres      pcr-adulto  1.165 → 1.190
    e módulos que hoje existem no gerador não constam da tabela publicada.

⚠️ **POR QUE ISTO É PIOR QUE NÃO TER O DOCUMENTO.** Um documento que descreve o
repositório e não acompanha o repositório é lido como se descrevesse. Quem
consultar o inventário para decidir onde mexer decide sobre números de duas
semanas atrás sem nenhum sinal de que estão velhos. Documento ausente faz a
pessoa ir olhar o código; documento desatualizado a impede de ir.

**O QUE FECHA:** ou os dois são regenerados por uma trava que reprova quando o
arquivo publicado difere do que o gerador produz — o mesmo padrão de
`valida-leitura-de-fonte`, aplicado a artefato em vez de a código —, ou eles
saem do repositório e viram saída sob demanda. A segunda é legítima: relatório
que ninguém regenera não precisa estar versionado.

⚠️ **NÃO TRATAR AGORA.** Descoberto de raspão durante a migração do helper de
leitura (os dois apareceram como modificados e a suspeita inicial foi de que a
migração os houvesse quebrado; a conferência com os scripts de HEAD mostrou que a
defasagem é anterior). Foram devolvidos ao estado original de propósito, para não
misturar regeneração com a mudança de instrumento.

## D-57 · O PROTÓTIPO DISCORDA DO APP SOBRE O PARENTESCO DO RIM — e a divergência é de conteúdo

Levantada em 2026-08-18, ao varrer os pares de cor adjacentes depois que o
tingimento do card fez a cor deixar de viver numa barra de 3 px.

    Correções eletrolíticas × Injúria renal aguda — adjacentes, ΔE 0 (mesma cor)

**AS DUAS FONTES AFIRMAM COISAS DIFERENTES, e as duas têm razão escrita:**

  · o **protótipo** os põe na mesma variável, afirmando uma família METABÓLICA —
    distúrbio hidroeletrolítico e renal como um eixo só;
  · o **app** (`design-system/paleta-de-area.ts`) dá ao Rim a paleta do ABDOME,
    com o motivo declarado no arquivo: «o rim é o vizinho retroperitoneal do
    abdome, e compartilha a cor por isso».

⚠️ **NÃO É DEFEITO DE LAYOUT, e por isso não foi corrigido.** Pelo R-90, cor
repetida COM significado é informação — e aqui há dois significados possíveis,
cada um coerente consigo. Escolher entre «o rim é vizinho do abdome» e «o rim é
do eixo hidroeletrolítico» é decisão CLÍNICA, do médico, não de quem desenha.

**O QUE PRECISA SER DECIDIDO:** qual das duas famílias o app afirma. Decidida,
uma das duas fontes muda — e a outra tem de mudar junto, senão a divergência
volta na próxima migração de seção.

⚠️ Registrada porque divergência sem registro vira "conserto" arbitrário de quem
encontrar por último. Não tratar sozinho.

## D-58 · PERGUNTA ABERTA: texto secundário a 9,5 px — e o argumento certo é o TAMANHO

Registrada em 2026-08-18 como PERGUNTA, não como dívida a fechar. ⚠️ Não tratar
sem decisão do médico.

── COMO ELA APARECEU, E O ERRO QUE A PRECEDEU ──────────────────────────────

Ao medir o tingimento do card, o descritor deu 4,53 de contraste — "raspando" o
mínimo AA. Levantei a suspeita de que o app inteiro estivesse no limite.

⚠️ **ESTAVA ERRADO, e o erro tem nome: pares HIPOTÉTICOS.** Eu havia cruzado a
cor do secundário com fundos que existem em ALGUM lugar do código, produzindo uma
tabela alarmante (`#1E6FD9` → 2,36; `#565E6C` → 3,18). O secundário não é pintado
sobre nenhum daqueles fundos. Medindo os pares REALMENTE RENDERIZADOS, em 5
telas, 98 elementos:

    fundo             ocorr   contraste   menor fonte
    rgb(56,62,74)       71       5,22        9,5 px
    rgb(41,46,56)       21       6,62         11 px
    rgb(6,34,43)         4       8,03         11 px
    rgb(17,22,31)        2       8,82         12 px
                    → NENHUM abaixo de 4,5

O 4,53 era do PROTÓTIPO tingido, que não existe em produção. No app o piso é
**5,22**.

── A PERGUNTA QUE SOBRA, E QUE É LEGÍTIMA ──────────────────────────────────

O contraste passa. **O tamanho é que é a pergunta:** há texto secundário a
**9,5 px** no app — 71 das 98 ocorrências medidas estão sobre a surface, e é
nesse grupo que vive a menor fonte.

Este app é lido com pressa, com luva, em corredor mal iluminado. Nessas condições
o que falha primeiro não é a razão de contraste — é o corpo da letra.

**O ARGUMENTO CORRETO PARA TRATAR É O TAMANHO, NÃO O CONTRASTE.** Registrado sem
proposta: quantos pontos subir, onde, e o que isso empurra na altura das telas é
medição a fazer DEPOIS da decisão de que vale tratar.

    contraste hoje (piso medido):  5,22   → passa com folga
    menor corpo de texto secundário: 9,5 px → é isto que está em questão

## D-59 · O DADO REPETIDO CAI NO RAMO MAIS URGENTE — hipercalemia na IRA

Registrada em 2026-08-18, ao desenhar a triagem de gravidade do módulo renal.

**O médico redigita peso, creatinina e potássio ao entrar no módulo de
eletrólitos, com o paciente grave na frente, no ramo mais urgente do fluxo.**

⚠️ **NÃO É INCONVENIÊNCIA DE NAVEGAÇÃO — É ATRITO NO RAMO MAIS URGENTE.** A
hipercalemia é a primeira pergunta da triagem porque é a que mata em minutos; é
exatamente ali que o app para e pede de novo o que já sabe.

── POR QUE ACONTECE ────────────────────────────────────────────────────────

`TreeValues` guarda o que o `InputNode` coleta e os tokens `{peso}` interpolam —
mas **por ÁRVORE**. `injuria_renal_aguda` e `correcoes-eletroliticas` são módulos
separados, com árvores separadas e motores separados. O `from_module` leva e traz
o médico, e não leva os valores.

── O QUE ESTA PASSADA FEZ, DE PROPÓSITO ───────────────────────────────────

Perguntou duas vezes. A §19 da especificação (reusar dados do paciente) foi
excluída do escopo pelo médico, porque criar registro de paciente é decisão de
ARQUITETURA e de PRIVACIDADE — dado clínico persistido muda o que o app é, e
isso não se decide dentro de uma refatoração de módulo.

── O QUE FECHA ─────────────────────────────────────────────────────────────

Um portador de valores entre árvores, com escopo de sessão e sem persistência —
o `from_module` passando também o que foi coletado. ⚠️ E a pergunta que vem
junto: o que acontece com esses valores quando o médico fecha o app, e quem é o
dono deles. Enquanto essa pergunta não tiver resposta, perguntar duas vezes é
mais honesto que guardar sem decidir.


---

## D-60 · A VARREDURA DE TRADUÇÃO EXIGE ACENTO OU PALAVRA DE PISTA — português sem os dois passa

Registrada em 2026-08-18, quando `"Acione a nefrologia agora."` foi para produção
sem espanhol e `test:i18n` passou verde.

**A varredura exige acento ou palavra da lista de pistas, e português sem nenhum
dos dois passa. A cobertura veio de outra trava por acaso** — quem acusou foi
`test:traducao-composta`, que mede outra coisa e a encontrou de lado.

── ONDE ────────────────────────────────────────────────────────────────────

`scripts/varredura-pt.cjs`, `isProse()`. Fora de campo de tela reconhecido, o
literal só é considerado frase se casar `PT_HINT` — acento OU uma das ~60
palavras da lista (`não`, `para`, `com`, `de`, `que`…). Dentro de campo de tela
reconhecido pelo prefixo, a heurística é dispensada e tudo passa a valer.

── O TAMANHO, MEDIDO E NÃO ESTIMADO (2026-08-18) ───────────────────────────

Universo: as 10.733 chaves em português dos dicionários de espanhol — frases que,
por definição, CHEGAM À TELA.

| medida | nº |
|---|---:|
| cegas ao `PT_HINT` (sem acento e sem palavra de pista) | 1.271 |
| dessas, vistas assim mesmo, por prefixo de campo de tela | 402 |
| **INVISÍVEIS à varredura** | **869 · 8,1% do universo** |
| dessas, com 3+ palavras — frase, não rótulo | 361 |

⚠️ **MEDIDO POR MUTAÇÃO, não por leitura do código.** Cópia do repositório no
scratchpad, as 1.301 entradas cegas apagadas dos dicionários, varredura rodada:
acusou 446. O que ela NÃO acusou é o buraco. Ler o regex diria "1.271 em risco",
que é o número errado — dois terços deles estão cobertos por outro caminho.

── O QUE ISSO SIGNIFICA ────────────────────────────────────────────────────

Não é caso isolado: **8,1% do texto de tela em português é invisível para a trava
que existe para achá-lo.** Amostra do que passaria calado — `Corrigir
coagulopatia; evitar hipotermia.`, `Estado mental alterado`, `Nenhum exame
confirmado ainda`, `Destino — sugerido por contexto`.

⚠️ E o número é um PISO, não um teto: só enxerga o que já está traduzido. Frase
sem acento, sem palavra de pista e ainda não traduzida não está em dicionário
nenhum — e por isso não entra nem nesta contagem.

── CONSERTO NÃO PROPOSTO NESTA PASSADA ─────────────────────────────────────

O médico pediu a MEDIDA antes da proposta, e a medida diz que o caminho barato
(engordar a lista de pistas) trata o sintoma. O caminho que fecha é reconhecer o
literal pela POSIÇÃO — campo de tela — em vez de pelo idioma, que é o que a
própria varredura já faz melhor quando conhece o prefixo. Fica para bloco próprio.


---

## D-61 · O LIMIAR DE GLICEMIA DA HIPERCALEMIA NÃO TEM FONTE

Aberta em 2026-08-20, quando o autor exigiu a frase literal da fonte e ela não
existia.

**O app ramificava o esquema de glicose por `glicemia < 126 mg/dL`.** Procurado
no repositório inteiro: **126 não aparece em fonte nenhuma** — só no nosso
próprio código. A `citation` do módulo de Eletrólitos registra "bula oficial
DailyMed… e recomendações amplamente aceitas", e a única recomendação escrita
sobre o assunto é *"Hipercalemia: cálcio, insulina-glicose e medidas de
remoção"*, sem limiar. Não há bula, PDF nem transcrição no repositório.

⚠️ **ERA PROCEDÊNCIA HERDADA POR VIZINHANÇA** — o mesmo defeito do rodapé "KDIGO
2012" sob doses que não eram do KDIGO, repetido por mim **depois** de tê-lo
corrigido. E 126 mg/dL é o corte DIAGNÓSTICO de diabetes em jejum: outro
contexto, outro raciocínio.

── O QUE FOI FEITO ─────────────────────────────────────────────────────────

O ramo foi invertido para o lado seguro: **a glicose é PADRÃO junto com a
insulina e mantida depois do bolus**, dispensada apenas em quem já está
francamente hiperglicêmico. Nenhum número entrou no lugar. A assimetria decide:
glicose a quem não precisava custa hiperglicemia transitória; a falta dela custa
hipoglicemia depois que a equipe saiu do leito.

── RESPONDIDA PELO AUTOR EM 2026-08-20 ─────────────────────────────────────

**NÃO existe limiar estabelecido para dispensar a glicose.** A inversão para o
lado seguro fica como está. ⚠️ Se algum dia um número entrar, ele entra
**rotulado como PRÁTICA VARIÁVEL, nunca como recomendação**.

E o 126 **saiu também de `electrolyte-calculator-screen.tsx`**, no mesmo dia:
deixá-lo vivo ali era manter o mesmo defeito, na mesma direção insegura, numa
tela que residentes abrem em produção. **Número errado não espera número melhor
para ser consertado.**

── O QUE ENTROU NO LUGAR, E TEM FONTE ──────────────────────────────────────

A **janela de monitorização**, que faltava e é o que muda o desfecho:
hipoglicemia até **seis horas** depois da insulina, risco maior em **função
renal comprometida** — todo paciente deste módulo — e **mais de 28% dos casos
ocorreram APESAR da glicose**. Glicose e vigilância são duas medidas, não uma.

Fonte nova no repositório: `pa_psa_hipercalemia_insulina` — Pennsylvania Patient
Safety Authority, *Treating Hyperkalemia: Avoid Additional Harm When Using
Insulin and Dextrose*, **Patient Safety Advisory, setembro de 2017**.

⚠️ **NÃO É DIRETRIZ, E TEM NOVE ANOS.** É comunicado de segurança do paciente,
baseado em notificação voluntária. Trazida pelo autor; não conferida por mim
contra a publicação.

⚠️ **O "mais de 28%" SAIU DA TELA.** O denominador é de notificação voluntária,
não populacional — e na tela, ao lado de doses, seria lido como taxa. Ficou a
afirmação que é verdadeira sem número e que muda a conduta: **dar glicose reduz
o risco, não o elimina.**

⚠️ **A JANELA DE SEIS HORAS É OPERACIONALIZAÇÃO NOSSA.** A fonte descreve o
ATRASO possível do sintoma em até seis horas, sobretudo com comprometimento
renal; transformar isso em janela de vigilância é a nossa tradução prática, e
está declarado como tal no texto renderizado e no metadata.

---

## D-62 · GLICOSE A 10% × 50% NA HIPERCALEMIA — decisão clínica do autor

Registrada em 2026-08-20, trazida pelo autor.

**Há evidência de menos hipoglicemia com glicose a 10% em vez de 50%** (estudo
CHICA-D10).

⚠️ **NÃO IMPLEMENTADO, DE PROPÓSITO.** Trocar a concentração muda dose, volume,
tempo de infusão e o preparo à beira do leito — é decisão clínica do autor, não
de quem escreve o app. O repositório hoje usa 25 g de glicose (50 mL de glicose
50%), herdado do módulo de Eletrólitos.

O que falta: a decisão do autor e, se for pela troca, a fonte primária no
metadata.


---

## D-63 · ACESSO VASCULAR — a mudança de 2025 não está no conteúdo do ACLS

Medida em 2026-08-20, ao responder qual diretriz o módulo ACLS realmente segue.

O conteúdo do módulo é **AHA 2025** — cita "AHA 2025" 50 vezes contra 2 menções
residuais a 2020, ambas em comentário, e oito das mudanças de 2025 estão
implementadas (epinefrina no chocável após a falha dos choques, dispositivo
mecânico, cabeça elevada, dupla sequencial, ETCO₂, OVACE 5+5, cardioversão de FA
≥ 200 J, adenosina 6→12).

⚠️ **UMA MUDANÇA DE 2025 NÃO ESTÁ LÁ:** *"tentar IV primeiro; IO aceitável se o IV
falhar ou não for viável"*. O fluxo e o áudio dizem **"1 mg IV ou IO"**, sem
preferência declarada — o que era a redação anterior à mudança.

── CORRIGIDO NA TELA EM 2026-08-20 ─────────────────────────────────────────

A hierarquia entrou em `lib/acesso-vascular.ts`, com classe e nível:

| via | quando | classe · nível |
|---|---|---|
| IV | primeira tentativa | Classe 1 · Nível A |
| IO | se a tentativa de IV falhar ou não for viável | Classe 2a · Nível A |
| central | se IV e IO falharem, por profissional treinado | Classe 2b · Nível C-LD |

⚠️ **A cláusula de não-atraso é NOSSA**, marcada como tal no texto: a diretriz
estabelece a hierarquia e **não traz ressalva de tempo**. Ela existe porque o
pior desfecho previsível, com usuário sem experiência, é adiar a epinefrina
procurando veia.

⚠️ **A FONTE NÃO ESTÁ CONFERIDA:** AHA 2025, Parte 9 (Adult Advanced Life
Support), **transcrita de fonte secundária — o artigo primário na Circulation
devolveu 403 e não foi aberto.** Registrada no metadata como não conferida
contra o primário.

── ⚠️ O ÁUDIO CONTINUA NA REDAÇÃO ANTIGA, E ISSO É DELIBERADO ──────────────

O app toca **MP3 gravado por cue**; `speech-map` é o texto canônico daquele MP3.
Mudar o texto sem regravar faria o app **anunciar um comando e tocar outro** —
exatamente o defeito que `valida-audio-vs-texto` existe para pegar, e que já
aconteceu uma vez neste app com o `start_cpr`.

Então o texto a gravar ficou registrado no roteiro (`acls/AUDIO_SCRIPT.md`),
como cue nova `vascular_access.mp3`:

> *"Acesso: tentar veia primeiro. Se falhar, intraósseo."*

**Falta a gravação, na mesma voz das outras 29.** Regravar com TTS local faria
uma cue soar diferente de todo o resto — é decisão de produto, não minha.

── ✅ FECHADA EM 2026-08-20: GRAVADA E LIGADA ──────────────────────────────

O autor gravou as duas no ElevenLabs. PT 3,4 s · ES 4,5 s · MP3 44,1 kHz mono —
mesmo formato das outras 30, sem conversão.

⚠️ **Os arquivos chegaram com o CAMINHO no nome** (`assets:audio:final-acls:
vascular_access.mp3`), e o português com um `.mp3` a mais. Renomeados. Vale a
nota porque o nome do arquivo É a chave da cue: nome errado = cue muda.

Registradas em `web-audio-cues.ts` (PT e ES), no manifesto canônico e em
`speech-cues.ts` do espanhol. `CUES_SEM_MP3` esvaziada. As duas travas que provam
a ligação passaram: `validate:acls-audio` (catálogo validado) e
`verify-acls-flow` (**21 cues resolvem MP3 + texto PT + ES**, 18 verificações sem
falhas). `mapa:fontes` §6 voltou a zero.

⚠️ **O voice id continua sem registro** — a próxima cue ainda vai depender de
comparação de ouvido.

── COMO ESTAVA ANTES ───────────────────────────────────────────────────────

A cue `vascular_access` existe: texto canônico em `speech-map.ts`, tradução em
espanhol, disparo no motor **10 s depois do início do 1º ciclo pós-choque**.

⚠️ **ELA NÃO TOCA AINDA, E ISSO É DELIBERADO.** A chave está em `CUES_SEM_MP3`
(`acls/speech-map.ts`), e o motor não emite cue dessa lista. Sem MP3, o app
cairia no TTS — e **a troca de voz no meio da parada já foi relatada pelo
usuário como defeito** quando duas cues ficaram fora do lote de gravação. A trava
`verify-acls-flow` concorda: exige que toda cue emitida resolva MP3 mais texto
nos dois idiomas.

**Para ligar:** gravar no ElevenLabs (mesma voz), registrar em
`web-audio-cues.ts` e no `canonical-audio-manifest.ts`, e **tirar a chave de
`CUES_SEM_MP3`** — uma linha. Não há flag para alguém lembrar de virar depois.

── ⚠️ A CONDIÇÃO DE DISPARO É PROXY, E ESTÁ ESCRITO ONDE ELA MORA ─────────

"Só no `rcp_1`" é substituto de **"o acesso provavelmente ainda não está
estabelecido"** — o app **não sabe** se há acesso: ninguém pergunta e nada
registra. Não é regra clínica: a hierarquia vale sempre; a FALA é que só cabe
onde ainda é útil ouvi-la. **No dia em que o app souber, a condição troca de
`rcp_1` para o fato**, e a cue passa a calar quando o acesso existir — inclusive
no primeiro ciclo. A nota está em `isRelevantPreCue`, no roteiro e aqui.

## D-64 · A ENTRADA `aha_acls_2020` CONFLITA COM O CONTEÚDO

Mesma medição. A entrada declara base AHA 2020 + updates 2022/2023, e as telas
que ela diz sustentar já são cobertas por `aha_ecc_2025_destaques_ptbr` e
`medcampus_acls_adultos_v13`.

⚠️ **Não removi.** Aposentar uma fonte é decisão de procedência do autor — e
remover a entrada errada sem ele decidir seria escolher um ano para encerrar a
dúvida, que é como o 126 entrou.

## D-65 · KDIGO 2012, Tabelas 8 e 9 — creatinina basal desconhecida

**O que falta:** o TEXTO das Tabelas 8 e 9 da KDIGO 2012, transcrito para
`protocols/fontes-verbatim/kdigo-2012-aki.md`.

**Por que importa:** o nó `sem_base` afirmava na tela que "a diretriz autoriza
seguir" e que a palavra "presumido" era dela. **Ninguém verificou.** A atribuição
foi retirada em 2026-08-21; a conduta ficou, declarada como nossa.

**Isto é "não consegui olhar", não "não há".** A distinção é a dívida.

**Como fechar:** transcrever as duas tabelas numa seção `## … Tabelas 8 …` do
arquivo verbatim. A trava de `valida-ira` que hoje exige a AUSÊNCIA da atribuição
se desarma sozinha quando essa seção existir — não é preciso mexer no script.

**✅ FECHADO EM 2026-08-21 (a outra metade desta dívida):** o texto das três
recomendações foi **conferido contra o primário pelo autor, médico**, no resumo das
recomendações, **página 12** do PDF. A marca "não conferida" saiu — não porque eu
tenha conseguido abrir o PDF (não consegui: HTTP 403), mas porque quem podia abrir,
abriu. **A cadeia fecha com um humano, não com um agente.** O que continua aberto é
só o das Tabelas 8 e 9, acima.

## D-66 · A assimetria do selo de força — 1 módulo de 31

**Aberta em:** 2026-08-21 · **Tipo:** dívida com prazo, **não observação** ·
**Fecha sozinha:** sim, quando o 31º módulo entrar.

### O que é

A declaração de força e fonte **por conduta** existe hoje em **1 módulo de 31**
(injúria renal aguda). Nos outros 30, nenhum card tem selo.

### Por que é dívida, e não detalhe

Ela **mente para o lado perigoso**, e é do tipo que ninguém nota: não quebra tela,
não falha teste, não aparece em relatório. Quem compara dois módulos lê a diferença
como se fosse informação clínica —

> "este tem selo de recomendação formal; aquele não tem selo nenhum, então deve ser
> consenso fraco."

É falso. **Ausência de selo não diz nada sobre a força da conduta**: diz que aquele
módulo ainda não foi auditado. É a regra do piso de universo (`scripts/lib/universo.cjs`)
virada para o usuário: um "não medi" sem etiqueta é lido como "medi e não achei".

### O que já foi feito (2026-08-21)

- Aviso nas **duas telas onde o usuário compara** — o hub (31 cards lado a lado) e a
  página de produto (que fala de procedência). Texto único em
  [`lib/auditoria-de-forca.ts`](../lib/auditoria-de-forca.ts), com o progresso: "1 de 31".
- Trava `test:aviso-auditoria`, que exige o aviso **enquanto** a assimetria existir,
  exige a **remoção** dele quando acabar, e impede a lista de módulos auditados de
  **adiantar** — ela é conferida contra `valida-forca-da-afirmacao`, quem realmente
  audita. Auditoria por declaração é o oposto de auditoria.

### Prazo

- **A cada bloco de auditoria concluído**, `MODULOS_COM_FORCA_DECLARADA` cresce e o
  número na tela muda. É o prazo natural, e é automático.
- **Ponto de revisão: 2026-11-21 (três meses).** Se nessa data menos de **1/3** dos
  módulos (11 de 31) declararem força, o aviso deixa de ser rodapé e passa a faixa
  fixa no topo do hub — porque uma assimetria que dura deixa de ser transitória, e
  rodapé de coisa permanente ninguém lê.
- ⚠️ **Este ponto de revisão é PROPOSTA minha, não compromisso do autor.** Ele muda a
  data ou o critério se quiser; o que não pode é a assimetria voltar a ser observação
  sem prazo.

### Fecha quando

`MODULOS_COM_FORCA_DECLARADA.length === 31`. Nesse dia a trava passa a **reprovar o
aviso**, e ele sai das telas — aviso que sobrevive ao motivo vira ruído, e ruído
ensina a ignorar avisos.

## D-67 · A citação do "ECG normal não exclui hipercalemia" — ✅ RESOLVIDA (2026-08-23)

**Como se resolveu:** o autor transcreveu a UKKA 2023 para
`protocols/fontes-verbatim/ukka-2023-hipercalemia.md`. ⚠️ **A FORÇA NÃO SUBIU
JUNTO:** segue `pratica_aceita` com o documento nomeado, porque o grau que a
diretriz dá àquele trecho não foi conferido no documento. Inflar seria o defeito
que a própria dívida existia para evitar.

<details><summary>o registro original</summary>


**Aberta em:** 2026-08-21 · **Nó:** `k_ecg_normal` · **Força já decidida:** `pratica_aceita`
(afirmação sobre **desempenho de teste**, não sobre conduta).

**O que falta:** a frase literal da **UKKA 2023** sobre a sensibilidade do ECG na
hipercalemia — **não transcrita** para este repositório.

**O que NÃO foi feito, de propósito:** inventar a citação. A pendência aparece **na
própria tela**, dentro do selo (`fonte: "⚠️ PENDÊNCIA DE FONTE — alvo: UKKA 2023…"`),
porque um selo que cita fonte inexistente é pior que selo nenhum: ele parece
procedência.

**Como fechar:** transcrever a frase para `protocols/fontes-verbatim/`, com número de
seção, e trocar o texto do campo `fonte`.

## D-68 · As indicações de diálise por UREMIA — ✅ RESOLVIDA (2026-08-21)

**Como se resolveu:** eram **duas afirmações**, não uma — e a que eu não tinha
separado é a que a diretriz nomeia.

| afirmação | força | fonte |
|---|---|---|
| "ureia isolada, sem sintoma, não indica diálise" | `recomendacao_formal` | KDIGO **5.1.2** · "Not Graded" |
| "pericardite e sangramento urêmico mudam a urgência" | `pratica_aceita` | **sem grau** |

### ⚠️ CABER NUMA FRASE GERAL NÃO É SER NOMEADO

A 5.1.2 manda considerar *"conditions that can be modified with RRT"* e o *"broader
clinical context"*. Pericardite e sangramento urêmicos **cabem ali** — e a diretriz
**não os nomeia**. Por isso a segunda linha ficou sem grau.

É **a mesma distinção que derrubou a proposta anterior** (encaixar pericardite na
5.1.1, que fala de fluidos, eletrólitos e ácido-base). Caber e ser nomeado são coisas
diferentes, e a diferença é exatamente onde a força se inventa.

### ⚠️ O QUE CONTINUA ABERTO — limite de leitura declarado

Palavras do autor, 2026-08-21: *"o trecho que eu consegui ler do capítulo 5.1 não
desenvolve as complicações urêmicas específicas."*

**Isso é "não consegui ler tudo", não "não existe"** — a mesma distinção que o piso de
universo protege nos instrumentos, agora aplicada à leitura de uma diretriz.

**ALVO NOMEADO:** o **texto narrativo do capítulo 5.1** da KDIGO 2012, para quem abrir
o PDF inteiro. Se ele nomear pericardite ou sangramento urêmico, a segunda linha sobe
de `pratica_aceita` para `recomendacao_formal` — e o caminho para isso está no
`contextoDaFonte` do próprio selo, visível na tela.

## D-69 · ⚠️ BLOQUEANTE DA FASE DO MOTOR — `DecisionNode` não tem `procedencia`

**Aberta em:** 2026-08-21 · **Tipo:** bloqueante de fase, não dívida de módulo.

### O que é

`DecisionNode` **não tem campo de procedência**. Não existe onde pôr o selo — não é
omissão de quem escreveu o módulo, é o tipo que não permite. E o `evidence` recolhe a
partir de 3 itens (C1), que é **exatamente onde moram os critérios que sustentam uma
decisão**.

Consequência medida: um módulo pode ter recomendações formais nos seus nós de decisão
e **exibir zero selos**, sem que nenhuma trava perceba.

### As duas instâncias conhecidas, nomeadas

| nó | item recolhido | o que é |
|---|---|---|
| `e5_uremia` (`evidence`) | *"⚠️ UREIA ISOLADA NÃO INDICA DIÁLISE… e a diretriz recusa decidir por limiar isolado."* | KDIGO **5.1.2** · Not Graded |
| `sobre_drc` (`evidence`) | *"A definição do KDIGO usa duas janelas: 0,3 mg/dL em 48 HORAS, ou 1,5 vez a base em 7 DIAS."* | **definição** KDIGO 2012 |

### Por que NÃO se resolve agora

Decisão do autor, 2026-08-21: **é tipo, engine e duas telas — e é justamente o que a
fase do motor formaliza.** Fazer à mão agora, dentro de um módulo, seria **construir a
abstração duas vezes**, e a segunda construção herda os atalhos da primeira.

### O que fica no lugar, enquanto não se resolve

`test:forca-da-afirmacao` passou a **imprimir as duas coisas**, sempre:

```
condutas: 17 de 18 declaradas · pendentes declaradas: 1
nós de DECISÃO: FORA DO ALCANCE DO CAMPO — 17 nós, 2 com sinal de diretriz no evidence
⚠️ `DecisionNode` não tem `procedencia`: o "zero" acima vale para CONDUTAS, não para o módulo.
```

⚠️ **A razão de a linha existir é a nossa própria regra virada contra nós:** "zero
pendências" sobre um universo que exclui um tipo inteiro de nó é o mesmo defeito que o
piso de universo existe para matar. O relatório não pode dizer "zero" sem dizer **sobre
o quê**.

⚠️ **E o sinal do `evidence` é PROXY, declarado como tal:** procurar "KDIGO"/"diretriz"
no texto mede a redação, não o fato. Serve para dimensionar o problema, não para afirmar
quantas recomendações formais estão escondidas ali.

## D-70 · "Vanco + pip-tazo somam nefrotoxicidade" — evidência sem procedência

**Aberta em:** 2026-08-21 · **Onde:** `nefrotoxico_check` (`evidence`) e `renal_conduta`
(`porque`) · **Alvo:** **a definir**.

### A afirmação

> *"A combinação vancomicina + piperacilina-tazobactam tem nefrotoxicidade somada maior
> que a de cada uma isolada."*

### Por que é pendência de verdade

Não cita diretriz — e **não tem fonte alguma**. É uma **afirmação de evidência
circulando sem procedência dentro de uma tela de conduta**: ela muda prescrição (faz
trocar antibiótico), e é do tipo que o usuário aceita porque está escrita ao lado de
coisas que têm fonte. **Vizinhança de novo, agora emprestando credibilidade em vez de
grau.**

⚠️ Classe diferente das outras cinco desta varredura: aquelas são **força** não
declarada de coisa que TEM fonte; esta é **fonte que não existe no repositório**.

### O que NÃO fazer

Preencher de memória. Existe literatura sobre esta combinação, e é exatamente por
parecer conhecida que ela entrou sem citação — o mesmo caminho do 126 mg/dL.

### Como fechar

Achar a publicação, transcrever a frase para `protocols/fontes-verbatim/`, e declarar a
força nos dois lugares. Se a evidência for fraca ou contestada, a força é
`mecanismo_fisiologico` **com a lacuna escrita** — nunca silêncio.

</details>

## D-71 · A DOSE DO DIURÉTICO DE ALÇA — ✅ RESOLVIDA (2026-08-23)

**Como se resolveu:** duas afirmações, duas fontes, duas forças.

| afirmação | força | fonte |
|---|---|---|
| a INDICAÇÃO (sobrecarga de volume, não o rim) | `recomendacao_formal` | KDIGO 2012, **3.4.2**, grau 2C |
| a DOSE e a escalada | `pratica_aceita` | **Riccardi 2025**, Eur Heart J Acute Cardiovasc Care 2025;14:618–630 |

40 mg sem uso prévio · 1–2× a dose oral prévia em uso crônico · reavaliar em
2–6 h · aumentar dobrando. ⚠️ **A faixa 40–80 mg NÃO foi usada** (é de
insuficiência cardíaca — importá-la sem dizer seria transposição), e o **teste de
estresse com furosemida ficou registrado como PROGNÓSTICO, não dose**.
Ver D-86 para o conflito de tempo que isso deixou visível.

<details><summary>o registro original</summary>


**Aberta em:** 2026-08-21 (substitui a formulação anterior) · **Estado:** fora do fluxo.

### O que mudou

A pendência **não é mais "falta a dose"**. As doses estão propostas e o **raciocínio
está certo** — descongestão, escalada por dobra, os condicionantes. O que falta é
outra coisa:

> **As doses propostas vêm de referências NÃO NOMEADAS.**

### Por que isso basta para segurar

É exatamente a distinção que este projeto passou a semana inteira construindo:
**referência bibliográfica não é fonte; texto é** — e aqui nem a referência existe.
Uma dose com raciocínio correto e procedência inexistente entra na tela com a mesma
aparência de uma dose com fonte, e o usuário não tem como distinguir. Foi assim que
o `126 mg/dL` e o `pH < 7,0` chegaram onde chegaram.

### Como fechar

A referência precisa ter **nome, autor e ano**. Com isso, transcrever o trecho para
`protocols/fontes-verbatim/` e declarar a força — que provavelmente será
`pratica_aceita`, e está tudo bem: prática aceita **declarada** é honesta; grau
emprestado não é.

**Até lá, fica fora do fluxo.** O ramo do diurético existe e aponta sem saltar; o que
não existe é dose na tela sem procedência.

</details>

## D-72 · `dka-hhs` — a escada de pH mistura corte real e enchimento, e OMITE o corte diagnóstico

**Aberta em 2026-08-21.** ⚠️ **NÃO CORRIGIDA NESTA RODADA, de propósito** — é revisão
de módulo inteiro, com o autor, não conserto de botão.

### O que a tela oferece

```
pH        [6,8] [6,9] [7,0] [7,1] [7,25] [7,35]
potássio  [2,8] [3,2] [3,5] [4] [4,5] [5] [5,8]
```

### O que a fonte diz

Consenso 2024 de crises hiperglicêmicas em adultos (Umpierrez et al., *Diabetes
Care* 2024;47:1257–1275; ADA/EASD/AACE/JBDS/DTS), **conferido pelo autor nesta
rodada**:

- **Diagnóstico de CAD:** glicose ≥ 200 mg/dL ou diabetes prévio · β-hidroxibutirato
  ≥ 3,0 mmol/L ou cetonúria ≥ 2+ · **pH < 7,3, bicarbonato < 18 mmol/L, ou ambos**
- **Gravidade:** leve **pH > 7,25**, HCO₃ ≥ 15 · moderada **pH 7,0–7,25**, HCO₃ 10 a
  < 15 · grave **pH < 7,0**, HCO₃ < 10
- **Potássio:** adiar insulina se **K < 3,5 mmol/L** na apresentação

### O achado

| degrau | o que é |
|---|---|
| **7,0** e **7,25** | **cortes reais** de gravidade |
| 6,8 · 6,9 · 7,1 · 7,35 | **enchimento** — não são nada |
| **7,3** | ⚠️ **o corte DIAGNÓSTICO, e ele NÃO ESTÁ na escada** |
| **3,5** (potássio) | corte real — o que adia a insulina |
| 2,8 · 3,2 | enchimento, ladeando o corte real |

⚠️ **O controle mistura, indistinguíveis, degraus COM fonte e degraus INVENTADOS — e
omite justamente o que define o diagnóstico.** É o problema que o campo `forca`
resolveu para o texto e que a interface não tem: **botão não carrega procedência.**

### A leitura que vale para os outros

**Quando há corte real, ele está na escada — disfarçado entre degraus inventados.**
O preset não inventou o número do zero; ele **apagou a diferença** entre o número que
decide e o que enfeita.

### O selo do módulo — resposta à pergunta

Nem 2022, nem 2024. A entrada é `ada_dka_hhs_2024`, e:

```json
"base": [{ "referencia": "American Diabetes Association — CAD e EHH", "ano": null }]
"nossa": { "versao": "Síntese clínica", "revisadoEm": "2026-04-11" }
```

⚠️ **O ano 2024 existe só no ID.** A base não declara ano nenhum — por isso o selo
aparece sem ano na tela —, e a referência é genérica: "American Diabetes Association
— CAD e EHH", sem publicação nomeada. **O módulo cita um consenso que o metadata não
tem.**

### Como fechar

Revisão do módulo inteiro, com o autor: verbatim do PDF do consenso 2024 para
`protocols/fontes-verbatim/`, base nomeada com ano e DOI, força por conduta, e só
então os presets — se houver — com o corte real declarado e o enchimento fora.

⚠️ **Os números transcritos acima NÃO entram em tela ainda.** São transcrição
secundária (*Cleve Clin J Med* 2025;92(3):152 sobre o original); o verbatim tem de
sair do PDF do consenso, como foi feito com a KDIGO.

## D-73 · Os outros presets clínicos sem fonte — fila, com a leitura escrita

**Aberta em 2026-08-21.** Medição, sem correção. `npm run mapa:presets` imprime a
lista atualizada a qualquer momento.

| módulo · campo | valores | leitura |
|---|---|---|
| `sepsis` · lactato | 1 · **2** · 3 · **4** · 6 · 8 | **2 e 4 são os números da SSC**; 1 · 3 · 6 · 8 não são |
| `seizure` · tempoDeCrise | 0 · 2 · **5** · 10 · **20** · 40 | **5 e 20 são estado de mal e refratariedade**; 0 · 2 · 10 · 40 não são |
| `avc` · glicemia | **50** · 80 · 110 · 150 · 200 · 300 · 400 | **50 é hipoglicemia** — mimic de AVC, decisão real; 110 e 150 não são nada |
| `dka-hhs` · glicemia, potássio, ph | ver D-72 | corte real disfarçado entre enchimento |

**A correção é por módulo, com o autor** — e boa parte dela provavelmente cai junto
com a reescrita de cada módulo no formato novo.

## D-74 · AS CALCULADORAS — 148 limiares de interpretação, ZERO com fonte no limiar

**Aberta em 2026-08-21.** Inventário: `npm run mapa:calculadoras`. ⚠️ **Nada foi
corrigido, removido ou desligado.**

### O universo, que ninguém tinha olhado

```
15 ferramentas · 62 campos de entrada · 143 limiares dentro das ferramentas
                                       + 5 em funções AUXILIARES
```

⚠️ **São 15, não 17.** O "17" que reportei na rodada anterior veio de
`grep -c "^  {"` — proxy do número de ferramentas, e errado. O número medido, do
objeto compilado, é 15.

### As três colunas

| coluna | total |
|---|---|
| fonte declarada **no nível da ferramenta** | **15 de 15** |
| ferramenta sem referência nenhuma | **0** |
| ⚠️ limiar com fonte declarada **no nível do limiar** | **0 de 148** |

### O achado

**A fonte é declarada POR FERRAMENTA (`reference`), nunca POR LIMIAR.** É o mesmo
defeito que a regra B corrigiu nas árvores — um selo por tela, quando a tela afirma
coisas de procedências diferentes. Aqui: **uma referência por calculadora, quando
cada faixa é uma afirmação própria.**

O `clearance-creatinina` declara *"Cockcroft & Gault 1976 · CKD-EPI Inker NEJM 2021 ·
KDIGO 2012"* — três fontes para sete limiares, e nada diz qual sustenta qual. Os
cortes G1–G5 (90 · 60 · 45 · 30 · 15) são do KDIGO; os de ajuste de dose não são.
**Na tela, os sete parecem iguais.**

### Por que é pior que um preset

Um preset **sugere**; uma calculadora **entrega um número pronto com aparência de
cálculo objetivo**. O usuário sem experiência — o alvo do app — não tem como saber
que o corte que pinta o resultado de vermelho foi escolhido por alguém, e não pela
fonte.

### ⚠️ E por que nunca foram vistas

O campo `forca` foi para as **árvores**. O `mapa:fontes` audita **módulos**. As
calculadoras ficaram **entre as duas coisas**, e não foram alcançadas por nenhuma —
pela mesma razão que os botões: **ninguém audita o que parece infraestrutura.**

### Como fechar

Por calculadora, com o autor: fonte **por limiar**, no molde do `procedencia` das
árvores — força, fonte e, quando houver, classe/grau. Provavelmente cai junto com a
revisão de cada módulo que consome a ferramenta.

## D-75 · ✅ FECHADA em 2026-08-22 — o motor lê o catálogo, e só existe uma cópia

**Aberta em 2026-08-22.** Estrutura entregue; conteúdo pendente; ligação pendente.

### O que existe hoje

- `lib/antimicrobianos/tipos.ts` — o esquema: `doseUsual` · `ajusteRenal` (4 estados)
  · `faixas[]` com fonte e força **por faixa** · `metodoDaTFG` · `dialise` (HD, CRRT,
  SLED) · `fonteDoFarmaco` · `observacoes[]` com força própria.
- `lib/antimicrobianos/catalogo.ts` — os **três** fármacos existentes migrados, com
  **os mesmos números** (603 comparações contra o motor, 0 divergências).
- `test:antimicrobianos` — sobreposição e buraco reprovam, **inclusive no ponto de
  fronteira**.

### O que NÃO existe

- **Fonte por faixa.** As 12 faixas migradas estão `forca: "pendente"`, cada uma com
  a pendência escrita. A ferramenta declarava UMA referência para os dez cortes, e
  migrar não descobre fonte.
- ~~**Ligação com o motor.**~~ ✅ Feita em 2026-08-22.
- **Diálise:** só vancomicina (HD) e pip-tazo (HD) têm dado. Os outros sete campos
  são `sem_dados` **declarado**, com a pendência — nunca silêncio.

### ✅ COMO FECHOU

- **O motor lê o catálogo.** Os ternários de faixa saíram de
  `clinical-calculators-engine.ts` — **nenhum sobrou**, conferido por varredura. As
  doses, as fronteiras e até as notas de faixa (MDR, meningite) vêm de
  `lib/antimicrobianos/catalogo.ts`.
- **As 15 faixas têm fonte:** 0 pendentes. Meropeném e pip-tazo com o label
  (`recomendacao_formal`), vancomicina com o consenso 2020 (`pratica_aceita`, com o
  contexto dizendo que a escada é operacionalização).
- **Provado por mutação:** mudar uma dose no catálogo muda a tela (a trava de
  fronteira acusa); tirar um fármaco do catálogo derruba a calculadora. Se houvesse
  segunda cópia, nenhuma das duas aconteceria.

⚠️ **E a última cópia era a FRONTEIRA, não a dose.** Depois de mover as doses, ainda
havia `tfg > 50 ? … : tfg > 25 ? …` no motor, decidindo qual nota de MDR/meningite
mostrar. Mudar o limiar no catálogo faria a nota grudar na faixa errada, **em
silêncio**. A nota virou campo da própria faixa, com procedência própria.

### ⚠️ O PORTÃO

**Nenhum fármaco novo entra antes de:** (1) o motor ler o catálogo ✅, e (2) as
faixas existentes ganharem fonte por faixa ✅. Com 28 fármacos na estrutura atual
seriam ~70 cortes de dose sem procedência — **multiplicar o defeito por sete seria o
pior desfecho desta sequência, e feito por nós, sabendo.**

### Enquanto isso

As três calculadoras **continuam no ar**, com o aviso que já existe. Desligar
ferramenta que colegas usam também tem custo clínico.

## D-76 · PIP-TAZO e VANCOMICINA contra o label — achados, SEM correção

**Medido em 2026-08-22**, lido nos labels do DailyMed. ⚠️ **Nada foi corrigido**, por
instrução do autor: reportar antes.

### PIPERACILINA-TAZOBACTAM

Label (DailyMed setid `39e19789-de4b-4fd1-ab1c-92f59496f496`, Tabela 1) — **a tabela
tem DUAS COLUNAS de indicação**, e o app não tem essa distinção:

| ClCr | todas as indicações | pneumonia nosocomial | app hoje |
|---|---|---|---|
| > 40 | **3,375 g 6/6h** | 4,5 g 6/6h | **4,5 g 6/6h** |
| 20–40 | **2,25 g 6/6h** | 3,375 g 6/6h | **4,5 g 8/8h** ⚠️ |
| < 20 | **2,25 g 8/8h** | 2,25 g 6/6h | 2,25 g 8/8h ✅ |
| hemodiálise | 2,25 g 12/12h | 2,25 g 8/8h | 2,25 g 12/12h ✅ |

**Três achados:**

1. ⚠️ **A faixa 20–40 não bate com nenhuma das duas colunas.** O app dá **4,5 g
   8/8h** = 13,5 g/dia; o label diz 2,25 g 6/6h (9 g/dia) ou, na pneumonia
   nosocomial, 3,375 g 6/6h (13,5 g/dia — mesma dose diária, **outro intervalo**).
   Para um beta-lactâmico, dependente de tempo acima da CIM, **o intervalo é a
   variável que importa**.
2. **O app usa a coluna da pneumonia nosocomial como se fosse universal** na faixa
   > 40 (4,5 g 6/6h). Não é erro de dose — é ausência da distinção de indicação.
3. ✅ **A hemodiálise bate**, incluindo os 0,75 g após cada sessão.

### VANCOMICINA — o achado é de outra natureza

**O label moderno (PLR, setid `0543b2b5-…`) NÃO TEM TABELA por ClCr.** Ele diz,
verbatim:

> "The initial dose should be no less than 15 mg/kg, in patients with any degree of
> renal impairment." · "Measure trough vancomycin serum concentrations to guide
> therapy" · para anéfricos: "an initial dose of 15 mg/kg … A dose of 1.9 mg/kg/24 hr
> should be given after the initial dose."

O label antigo (setid `00946db3-…`) tem uma tabela **em mg/24 h** (Moellering),
100 → 1.545 mg … 10 → 155 mg. **Nenhum dos dois traz as faixas de intervalo que o app
usa** (8/8h · 12/12h · 24/24h · 48/48h).

⚠️ **Ou seja: as faixas de vancomicina do app não vêm da bula — vêm da prática.** Não
é divergência de valor; é **procedência de outra natureza**. Elas não podem receber
`recomendacao_formal` de bula: são `pratica_aceita`, e a bula sustenta outra coisa
(dose inicial ≥ 15 mg/kg em qualquer grau de disfunção, e ajuste por NÍVEL).

**E a hemodiálise do app** ("15–20 mg/kg após a sessão") **não está no label**. O que
o label diz, na superdosagem, é o oposto do que se assumiria: *"Vancomycin is poorly
removed by dialysis."*

### O que isto NÃO significa

Que o app esteja clinicamente errado na vancomicina — ajuste por nível e faixas de
intervalo são prática corrente e defensável. **Significa que a força está errada:**
declarar bula onde a bula não fala é o defeito que a AM-7 existe para impedir.

## D-77 · VANCOMICINA EM HEMODIÁLISE — dois números, e a decisão é do autor

**Aberta em 2026-08-22.** ⚠️ **Nada foi trocado.**

| | dose de ataque | manutenção |
|---|---|---|
| **o app mostra** | — | **15–20 mg/kg após a sessão** |
| **consenso 2020**, após o fim da sessão, dialisador de **alta permeabilidade** | **25 mg/kg** | **10 mg/kg** |
| consenso 2020, após o fim da sessão, baixa permeabilidade | 25 mg/kg | 7,5 mg/kg |
| consenso 2020, intradialítica, alta permeabilidade | 35 mg/kg | 10–15 mg/kg |

**Por que não troquei:** trocar número clínico a partir de leitura minha é o que o
método não admite (R-5), por mais primária que seja a fonte. E aqui há uma escolha
clínica embutida que não é minha: **a tabela do consenso depende da permeabilidade do
dialisador e de a dose ser dada durante ou após a sessão** — o app não pergunta nem
uma coisa nem outra.

**Verbatim:** `protocols/fontes-verbatim/vancomicina-consenso-2020.md`.

**O que fechar junto:** se a dose passar a depender de permeabilidade e de momento da
sessão, isso é **eixo novo no catálogo** — como a indicação foi para o pip-tazo.

### ⚠️ A SAÍDA PROVÁVEL JÁ TEM FORMA NO APP — e não é escolher por ele

**Quando faltam dados para decidir, este app pergunta.** Permeabilidade do dialisador
e momento da dose (intradialítica × após o fim) são **duas perguntas objetivas**, que
quem prescreve em HD sabe responder ou pergunta à enfermagem em trinta segundos.

É a mesma forma que resolveu a indicação do pip-tazo: **duas perguntas, não uma
escolha nossa.** Fica registrado para quando o autor revisar a vancomicina — **não
implementado agora.**

## D-78 · ✅ FECHADA em 2026-08-22 — o catálogo ganhou eixo de INDICAÇÃO

**Aberta em 2026-08-22.** O pip-tazo mostrou que dose não depende só de função renal.

A Tabela 1 do label tem **duas colunas** — "todas as indicações exceto pneumonia
nosocomial" e "pneumonia nosocomial" —, e o `FaixaRenal` do catálogo tem **uma dose
por faixa**. Hoje as faixas carregam a coluna de "outras indicações" e a de pneumonia
vive em `observacoes`, o que é honesto mas **não é estrutura**: quem consumir o
catálogo por programa não sabe que existe a segunda coluna.

⚠️ **A tela já resolve isto** — ela pergunta a indicação e o "não sei" mostra as duas.
**O catálogo é que ainda não sabe.** E é ele que vai receber 25 fármacos.

**✅ Como fechou:** `Antimicrobiano.indicacoes[]` — cada indicação com o seu conjunto
completo de faixas, **conferido inteiro pela mesma trava**: um buraco na segunda
coluna é tão perigoso quanto na primeira. Quando o eixo existe, `faixas` fica vazio
(a trava reprova os dois juntos: seriam duas fontes de verdade sobre a mesma dose), e
`faixaPara()` **devolve `undefined` se ninguém disser a indicação** — escolher a
coluna por omissão é exatamente o defeito que o pip-tazo tinha.

## D-79 · ✅ FECHADA em 2026-08-23 — pela ESTRUTURA, não à mão

**Aberta em 2026-08-23.** ⚠️ **Levantada pelo autor, conferida no label, NÃO
corrigida** — reportar antes era a instrução.

O label dá **dose base por indicação**: pele e partes moles **500 mg 8/8h** (1 g se
*P. aeruginosa*), intra-abdominal complicada **1 g 8/8h**. O catálogo fixou **1 g**.

**Consequência:** nas faixas de metade, o app mostra **500 mg** — certo na
intra-abdominal, **errado na de pele**, onde seria 250 mg. ⚠️ **Erra para CIMA**, num
carbapenêmico neurotóxico, em paciente com ClCr baixo.

**O erro não está na fronteira, está no REFERENTE.** As faixas continuam corretas.

**✅ Como fechou:** o meropeném ganhou **eixo de indicação** (pele 500 mg ·
pele/*P. aeruginosa* 1 g · intra-abdominal 1 g), e a tabela renal passou a declarar
**`fracaoDaBase: 0.5`** em vez de um número — que é **exatamente como o label a
escreveu**. A base vem do eixo; o texto é derivado.

| ClCr | pele (base 500 mg) | pele/*Pseudomonas* (1 g) | intra-abdominal (1 g) |
|---|---|---|---|
| 60 | 500 mg 8/8h | 1 g 8/8h | 1 g 8/8h |
| 40 | 500 mg 12/12h | 1 g 12/12h | 1 g 12/12h |
| 20 | **250 mg** 12/12h | 500 mg 12/12h | 500 mg 12/12h |
| 5 | **250 mg** 24/24h | 500 mg 24/24h | 500 mg 24/24h |

⚠️ **A coluna de pele era o erro:** o app dava 500 mg onde o label dá 250 mg.

**A trava que teria pego sozinha:** `fracaoDaBase` sem base declarada reprova. E a
mutação que prova que ela mede o REFERENTE e não o resultado: trocar a fração por
`absoluta` **com o mesmo número** também reprova.

⚠️ **E a lição é da estrutura:** o catálogo guarda `dose` como TEXTO. Quando a fonte
escreve FRAÇÃO, o texto carrega um **referente** que o dado não representa — e alguém
resolve à mão, uma vez, e o resultado passa a parecer número.

## D-80 — DUAS LINHAS EM QUE O ESPANHOL NÃO É TRADUÇÃO (`lib/i18n/modules/sepse-vasoativos.ts`)

Achadas pela medição PT × ES de 2026-08-23 (`npm run medir:pt-es`). Não são erro
de número — os números batem. São **conteúdo clínico diferente**, e por isso
nenhuma trava de tradução as pegaria.

1. **O critério da hidrocortisona virou vago.**
   - PT: "Considerar hidrocortisona 200 mg/dia **se a dose se mantiver ≥ 0,25 por pelo menos 4 h**."
   - ES: "Considerar hidrocortisona 200 mg/día **si el choque persiste**."
   Um critério quantitativo (dose e tempo) virou um critério de julgamento. Não é
   a mesma conduta.

2. **Uma frase de conduta inteira não atravessou.**
   - PT termina: "Se a noradrenalina está subindo, associar poupa alfa — **não esperar chegar a 0,5**."
   - ES termina em "dosis en escalada." A instrução some.

⚠️ NÃO CORRIGIDO DE PROPÓSITO: qual das duas versões é a certa é decisão clínica
do autor, não conserto de tradução. Alvo: veredito do Dr. Sandro Dainez sobre
cada uma das duas linhas.

## D-81 — TERCEIRA LINHA EM QUE O ESPANHOL NÃO É TRADUÇÃO (`lib/i18n/modules/coronarias-oclusao.ts`)

Apareceu ao corrigir o §2 do parecer de 2026-08-23 ("o ano da diretriz caindo no
ES"). **Não é ano caído — é outro parágrafo.** As duas versões afirmam coisas
diferentes sobre o mesmo enquadramento OMI/NOMI:

- **PT:** "A ACC/AHA **2025** MANTÉM STEMI/NSTEMI e incorpora só parte desse
  reconhecimento; as diretrizes australianas de **2025** adotaram a nomenclatura
  OMI. O app usa a nomenclatura corrente **de propósito**: é a que a equipe ao seu
  lado fala."
- **ES:** "**No es nomenclatura oficial** de las guías actuales, y **esta app no la
  adopta como criterio** — está citada porque explica por qué los patrones de
  arriba importan tanto."

O PT cita duas diretrizes com ano e diz que a escolha é deliberada. O ES não cita
nenhuma, e afirma que a nomenclatura não é oficial. Não é a mesma afirmação sobre
o estado das diretrizes.

⚠️ NÃO CORRIGIDO: restaurar "o ano" aqui significaria reescrever o parágrafo
inteiro do espanhol, e qual das duas leituras está certa é decisão clínica do
autor. Alvo: veredito do Dr. Sandro Dainez.

## D-82 — FONTE PARA 0,25 · 4 h · 0,5 (`lib/i18n/modules/sepse-vasoativos.ts`)

A D-80 alinhou o espanhol ao português, mas os três números do critério
continuam **sem verbatim no repositório**:

- **≥ 0,25 mcg/kg/min de noradrenalina** — limiar
- **por pelo menos 4 h** — tempo, no critério da hidrocortisona
- **0,5 mcg/kg/min** — o teto que a frase manda NÃO esperar

Alvo nomeado: **Surviving Sepsis Campaign 2021**, verbatim em
`protocols/fontes-verbatim/`. ⚠️ E a conferência tem uma pergunta antes da força:
se a SSC escreve o critério no TEXTO DE PRÁTICA e não na recomendação graduada, a
força não é `recomendacao_formal` — é `pratica_aceita`, e o `contextoDaFonte` diz
de onde saiu. O próprio texto do app já suspeita disso ("SSC 2021, texto de
prática, nunca recomendação graduada"), o que torna a conferência mais necessária,
não menos.

## D-83 — O AUDITOR DE DOSE DO TROMBOLÍTICO ESTÁ MORTO DESDE `a9b16ad`

`scripts/auditoria-doses-criticas.cjs` compilava quatro arquivos. Dois deles —
`avc/calculators.ts` e `coronary/calculators.ts` — foram apagados no refactor
a9b16ad (D-22, os 8 engines órfãos de render). Desde então o instrumento
**crashava na compilação a cada rodada**, e ninguém viu: ele não estava no
`test:all`.

O que deixou de ser auditado, nomeado:

- **dose de trombolítico do AVC por peso** (teto, monotonicidade, peso ausente)
- **dose lítica das coronárias** (tenecteplase por peso) — e este bloco já tinha
  uma guarda `typeof … === "function"` que o **pulava em silêncio**, o que é pior
  que crashar: o relatório saía limpo.

Agora ele roda sobre os dois arquivos que existem, e imprime `Blocos PULADOS: 2`.
⚠️ Reapontá-lo é decisão de escopo, não conserto: as funções não existem mais com
o mesmo nome, e escolher qual código de hoje ocupa o lugar delas é decidir o que
auditar. Alvo: veredito do autor sobre onde vive hoje a dose de trombolítico.

## D-84 — A EXTRAÇÃO DOS ELETRÓLITOS SAIU UMA CAMADA, E FALTAM DUAS

Em 2026-08-23 saiu a **camada de gravidade** (12 distúrbios, 24 degraus, 12
cortes numéricos) para `lib/eletrolitos/gravidade.ts`, com trava e mutação. O que
continua dentro de `electrolyte-calculator-screen.tsx`:

- **30 comparações contra o valor do paciente** fora da gravidade — em
  `detectDisorderFromCurrent`, `deriveAutomaticTarget` e no `calculateResult` de
  ~1.300 linhas. O instrumento imprime esse número a cada rodada.
- **67 strings com dose literal dentro da frase traduzível.** ⚠️ É AQUI que o
  dicionário encolhe, e por isso o critério 3 do parecer NÃO foi atendido nesta
  rodada: a camada de gravidade não tem número DENTRO da frase (o número estava
  no código, `current < 120`, e a frase é prosa pura). O dicionário continua com
  11.396 chaves — medido antes e depois.
- **`deriveAutomaticTarget`** escolhe a META de correção por distúrbio. Mover é
  mecânico; os números são conduta e precisam de fonte, como qualquer dose.

## D-85 — TRÊS DISTÚRBIOS TÊM O MESMO TEXTO DE SINAIS NOS DOIS DEGRAUS

`hyperphosphatemia`, `hypochloremia` e `hyperchloremia` mudam o RÓTULO com o
corte ("Importante" × "Moderada") mas repetem os mesmos sinais clínicos nos dois
degraus. Era assim dentro do `switch` e **continuou assim na extração** — mover
conteúdo não decide conteúdo.

⚠️ Pode ser proposital (os sinais realmente não mudam com a gravidade nesses
três) ou pode ser texto que ninguém escreveu. Alvo: veredito do autor.

## D-84 (atualizada 2026-08-23) — CAMADA 2 SAIU PARCIAL

Saíram **13 frases** e **12 números** para `lib/eletrolitos/referencias.ts`.
Dicionário: **13 chaves removidas**, 16 acrescentadas (13 molduras + 3 textos da
D-85) — e as 13 que saíram eram justamente as que **carregavam número**.

O que continua:

- **~42 números literais** ainda dentro de frases do `calculateResult`, em sua
  maioria valores por distúrbio que se repetem entre a frase e o cálculo.
- **30 comparações contra o valor do paciente** no componente, impressas a cada
  rodada por `test:gravidade-eletrolitica`.
- `deriveAutomaticTarget` — a meta de correção por distúrbio.

## D-86 — DOIS TEMPOS DE REAVALIAÇÃO DO DIURÉTICO — ✅ RESOLVIDA (2026-08-23)

**Como se resolveu, e a regra decidiu sozinha:** os dois eram clinicamente
defensáveis, e por isso não houve discussão clínica — **ficou o que tem fonte**.
`ALCA_REAVALIACAO` passou a dizer **2 a 6 h** (Riccardi 2025).

⚠️ **A ORIGEM DO ERRO, REGISTRADA, PORQUE IMPORTA MAIS QUE A CORREÇÃO:** o
"1 a 2 h" foi **ditado de cabeça pelo próprio condutor da auditoria**, várias
rodadas atrás, na arquitetura da furosemida — e ninguém pediu procedência.
Sobreviveu **três rodadas** convivendo, no mesmo módulo, com um número que tinha
fonte. É o defeito que a auditoria persegue, vindo de dentro dela.

<details><summary>o registro original</summary>


Apareceu ao aplicar a D-71. O módulo renal agora diz as duas coisas, em telas
vizinhas:

- `ALCA_REAVALIACAO` (nós `alca_congesto` e `alca_euvolemico`):
  *"Reavalie a RESPOSTA DIURÉTICA em **1 a 2 horas** após o bolus."*
- `DOSE_ALCA_ESCALADA` (nó `congesto_conduta`, fonte Riccardi 2025):
  *"Reavalie a resposta em **2 a 6 h**."*

⚠️ NÃO UNIFICADO DE PROPÓSITO. O 2–6 h tem fonte nomeada desde hoje; o 1–2 h não
tem, e é anterior. Escolher um deles é decisão clínica do autor — e apagar o
antigo em silêncio seria exatamente o que este projeto persegue. Alvo: veredito
do autor sobre qual tempo fica, e a fonte do que ficar.

</details>

## D-87 — SSC 2026 É A BASE DO MÓDULO DE SEPSE, E O CONTEÚDO NÃO FOI REVISTO

Registrada em 2026-08-23 por decisão do autor (R-109). A **SSC 2026** é a
diretriz-base do módulo de sepse; a **SSC 2021** só documenta origem histórica de
número.

⚠️ O CONTEÚDO CLÍNICO DO MÓDULO NÃO FOI ATUALIZADO NESTA RODADA, de propósito: a
2026 reformulou várias recomendações hemodinâmicas, e trocar o selo sem revisar o
módulo cria mentira nova. **Alvo: revisão do módulo de sepse com o autor**,
recomendação por recomendação.


## D-88 — O CORTE DE CÁLCIO ESTAVA APLICADO NO CÁLCIO ERRADO — ✅ CORRIGIDO (2026-08-23)

**O defeito:** a tela pedia "Cálcio (mg/dL)" sem qualificar, classificava
gravidade pelo **bruto** (`< 7` → "Grave") e calculava a dose pelo **ajustado
pela albumina** — dois cálcios no mesmo card, e o corte da fonte (que usa o
ajustado) aplicado no que não é dele.

⚠️ **Era erro clínico ativo na população do app.** Hipoalbuminemia é a regra em
UTI; nela o cálcio total cai sem que o ativo caia (pseudo-hipocalcemia). Albumina
2,0 com total 7,0 dá ajustado ≈ 8,6 — normal. A tela chamava isso de
"hipocalcemia grave" e mandava para gluconato EV, que tem risco próprio.

**O que se fez:** o campo passou a perguntar **qual** cálcio (iônico · total com
albumina · não sei, com onde achar cada um); gravidade e dose passaram a ler o
**mesmo** valor por `lib/eletrolitos/calcio.ts`; a albumina passou a aparecer
também na hipercalcemia. Travado por `test:gravidade-eletrolitica` e provado pela
mutação M79.

**O que NÃO se decidiu:** os cortes do cálcio **iônico**. Enquanto não houver
decisão do autor, escolher iônico faz a tela dizer que **não classifica por
número** — em vez de aplicar nele um corte que não é dele.

## D-89 — O MODELO DE GRAVIDADE SÓ SABIA NÚMERO — ✅ ESTRUTURA APLICADA (2026-08-23)

**Aprovado pelo autor e aplicado:** `CorteDeGravidade` ganhou `faixa` (dois
lados), `clinico` (critério sem número, com procedência) e `combinado` (faixa +
clínico, com a `ligacao` escrita por extenso). A hipocalcemia grave passou a ser
`combinado … ligacao: "ou"`, que é o que a fonte escreveu.

**Três conferências na trava** (`test:gravidade-eletrolitica`): todo critério
clínico COM TEXTO chega à tela · `combinado` declara a ligação · critério clínico
sem procedência reprova. Mais a quarta, que é o alvo da mutação M80: a
hipocalcemia grave não pode voltar a classificar só por número.

⚠️ **O CONTEÚDO CONTINUA PENDENTE, e é a parte que importa:** o degrau
sintomático existe com `texto: ""`. Critério sem texto **nunca casa** — a tela
não classifica por ele e nada mudou para o usuário. A lista de sintomas é
afirmação clínica e é do autor (pergunta 6). Quando ele preencher, o degrau passa
a valer **sem tocar em código de tela**.

⚠️ **Universo hoje: 1 critério clínico, 0 com texto.** A conferência (1) existe e
não tem o que conferir — dito de propósito, porque regra silenciosa com universo
vazio é o falso verde que o R-101 persegue.

<details><summary>o registro original</summary>


A fonte de hipocalcemia tem *"sintomas em qualquer valor abaixo da referência"* —
critério **sem número** — e a de hipercalcemia tem uma faixa que é
*"conforme sintomas e contexto"*. `CorteDeGravidade` não sabe expressar nenhum
dos dois.

É o **R-97 pelo avesso**: lá o app queria número onde a fonte não tinha; aqui a
fonte tem critério e o modelo só sabe número — e modelo que só aceita número
**obriga a inventar número**.

**Proposta escrita e NÃO aplicada** em `auditoria/PROPOSTA-CRITERIO-NAO-NUMERICO.md`,
com a trava e a mutação previstas. Alvo: "pode aplicar" do autor.

</details>

## D-90 — O CORTE DE HIPOCALCEMIA DO APP NÃO ERA O DA FONTE — ✅ RESOLVIDA (2026-08-23)

**Como se resolveu, e a saída foi estrutural:** o corte passou a morar na
**unidade da fonte** (`{ valor: 1.9, unidade: "mmol/L" }`), e a tela converte com
o fator declarado em `lib/eletrolitos/unidades.ts` (1 mmol/L de Ca = 40,08 ÷ 10
mg/dL). **A conta voltou para dentro do repositório.**

⚠️ **Mudou classificação de paciente real:** o assintomático entre 7,0 e 7,6
mg/dL passou de "leve a moderada" para **grave**. Medido em 7,0 · 7,3 · 7,5 · 7,6
(mudam) e 7,7 (não muda).

<details><summary>o registro original</summary>


Medido em 2026-08-23, ao conferir a conversão. **Nada foi alterado.**

- **fonte:** grave = cálcio ajustado **< 1,9 mmol/L** ≈ **7,62 mg/dL**
- **app:** grave = **< 7 mg/dL** ≈ 1,75 mmol/L

**A faixa 7,00–7,62 mg/dL o app chama de "leve a moderada" e a fonte chama de
GRAVE.** O corte foi adotado da fonte e **a conversão nunca foi conferida** — é
o defeito que a auditoria existe para achar, e a prova de que conversão de
unidade tem que morar no dado, declarada.

⚠️ **Mitigação parcial, desde a mesma data:** o ramo sintomático classifica como
grave qualquer manifestação clínica em qualquer valor. Escapa o **assintomático**
na faixa.

Conta completa em `auditoria/CONVERSAO-CALCIO-APP-VS-FONTE.md`. Alvo: pergunta 9
ao autor. ⚠️ Não corrigido de propósito — trocar número clínico com base numa
conta minha é o R-5.

</details>

## D-91 — A FAIXA DO MEIO DA HIPERCALCEMIA — ✅ CLASSIFICAÇÃO APLICADA (2026-08-23)

A faixa **3,0–3,5 mmol/L** entrou como degrau "Significativa", na unidade da
fonte. O corte de cima virou **> 3,5 mmol/L** ("Correção urgente") — e isso
mudou 14,0 mg/dL, que antes era "Grave" pelo `≥ 14` e agora é "Significativa",
porque 3,5 mmol/L = 14,03.

⚠️ **O TEXTO DE CONDUTA DO AUTOR NÃO FOI APLICADO**, de propósito: ele modula a
conduta sem mudar a classificação, e a estrutura não separa as duas camadas.
Forma proposta em `auditoria/PROPOSTA-CLASSIFICACAO-VS-CONDUTA.md`, com o texto
literal dele pronto para entrar.

<details><summary>o registro original</summary>


A fonte tem três faixas; o app tem uma. O corte de cima praticamente coincide
(14 mg/dL ≈ 3,49 mmol/L contra 3,5 — dentro do arredondamento). **Falta
3,0–3,5 mmol/L ≈ 12,02–14,03 mg/dL**, que a fonte descreve como *"trata conforme
sintomas e contexto"*.

⚠️ Ela **não é faixa pura** — é `combinado` (faixa + critério clínico), e o
texto de conduta é do autor (pergunta 7). A estrutura para expressá-la já existe
desde a aplicação do tipo `combinado`.

</details>

## D-92 — HIPOFOSFATEMIA: A CONVERSÃO ESTÁ CERTA, A FORMA NÃO

Varredura de 2026-08-23 (`auditoria/VARREDURA-UNIDADE-DA-FONTE.md`). O autor
nomeou o consenso como **< 0,32 mmol/L (< 1 mg/dL)** e o app guarda `< 1 mg/dL`.

**Confere:** fósforo tem peso atômico 30,97, então 0,32 × 3,097 = **0,99 mg/dL**.
Não há divergência — ao contrário do cálcio, onde `1,9 → 7` errava por 0,62.

⚠️ **Mas a FORMA é a que produziu a D-90:** o número está guardado já convertido
e a conta está fora do repositório. Converter para `{ valor: 0.32, unidade:
"mmol/L" }` **não mudaria uma classificação sequer**, e exigiria declarar o fator
do fósforo.

Não convertido nesta rodada porque a instrução foi reportar antes. Recomendação:
converter — o benefício não é o número de hoje, é a conta ficar dentro do
repositório para quando alguém reler a fonte.

## D-93 — VELOCIDADE DE ELEVAÇÃO: O APP NÃO TEM O DADO

O autor nomeou, na decisão do 14,0 mg/dL (2026-08-23): *"sintomas, **velocidade
de elevação** e contexto clínico continuam podendo justificar tratamento urgente
independentemente desse limite numérico"*.

⚠️ **O app não conhece o valor anterior nem o intervalo entre as duas medidas** —
não tem como calcular velocidade de nada. Registrado **sem inventar campo**: um
campo vazio "variação" convidaria alguém a preenchê-lo com estimativa.

O que entrou já: o texto da faixa intermediária deixa claro que **o número não é
teto** — a urgência pode vir de fora dele.

## D-94 — TRÊS CONCLUSÕES POR QUEDA, MEDIDAS E NÃO CORRIGIDAS

`auditoria/VARREDURA-CONCLUSAO-POR-QUEDA.md` · `npm run medir:queda`.

1. **hipocalcemia** (tela, :1270) — o ramo final afirma *"menos intensa e paciente
   estável"* quando `severe` é falso, o que inclui **sem valor** e **ionizado**.
   ⚠️ E o texto ainda cita **`< 7 mg/dL`**, que deixou de ser o corte.
2. **hipofosfatemia** (tela, :1660) — o ramo final afirma *"fósforo > 2 mg/dL"*,
   valor que ninguém verificou.
3. **ânion gap** (`clinical-calculators-engine.ts`:423) — tudo que não é `> 12`
   vira *"Ânion gap normal"* em **verde**, incluindo o **AG BAIXO**, que não é
   normal e tem causas próprias. ⚠️ O mais consequente: sai em verde, que é a
   forma visual de dizer "pode seguir".

Não corrigidos de propósito: o item 1 esbarra em decisão clínica (o que a tela diz
quando não há valor) e num corte que mudou. É revisão com o autor.

## D-95 — ÂNION GAP: TRÊS NÚMEROS HERDADOS, AGORA DECLARADOS

`lib/anion-gap.ts`. Os três já estavam no app; nenhum foi escolhido nesta rodada.
O que mudou foi **deixar de fingir que tinham fonte**.

| número | onde estava | o que é |
|---|---|---|
| **> 12** | `agRef > 12` no código | corte de AG elevado |
| **< 8** | na linha de referência da calculadora (*"Normal 8–12"*) | corte de AG baixo |
| **2,5** | `ag + 2.5 * (4 - alb)` | fator de correção pela albumina |

Alvo: pergunta 10 ao autor — quais cortes ele adota e com que fonte; e o verbatim
de **Figge et al.** para o fator, antes de a força subir de `pendente`.

## D-96 — VERBATIMS PENDENTES DAS CINCO RESPOSTAS (2026-08-23)

As forças e as fontes foram **aplicadas**; o texto literal de cada documento
ainda **não está em `protocols/fontes-verbatim/`**:

| documento | o que sustenta | força já aplicada |
|---|---|---|
| **Spasovski 2014** (European Clinical Practice Guideline on Hyponatraemia) | referência-base do sódio | `recomendacao_formal` |
| **SSC 2021** — rationale/remark da recomendação de corticosteroide | `≥ 0,25 por ≥ 4 h` | `pratica_aceita` |
| **SSC 2021** — remark de prática do painel | `0,25–0,5` para iniciar vasopressina | `pratica_aceita` |
| **Figge et al.** | fator 2,5 de correção do AG pela albumina | `literatura_primaria` |

⚠️ **A localização está registrada em cada um** (documento, e que é
rationale/remark e não recomendação) — que era a condição do autor para aplicar a
força antes do verbatim.

## D-97 — O ALVO DO AUDITOR DE TROMBOLÍTICO DO AVC AINDA NÃO FOI LOCALIZADO

O escopo foi decidido (autor, 2026-08-23): **só AVC**, não coronárias — no AVC a
janela e os critérios de exclusão são rígidos e o erro é catastrófico; nas
coronárias a angioplastia primária é a regra e o trombolítico é exceção.

⚠️ **Mas `avc/calculators.ts` não existe mais** e a dose de trombolítico do AVC
vive hoje noutro arquivo, com outro nome. O bloco segue **pulado e contado**. O
que deixou de ser dúvida é o ESCOPO; falta localizar o alvo.

## D-98 — DEZ CAMPOS DE ENTRADA SEM UNIDADE — ✅ RESOLVIDA (2026-08-23)

**Fechada na mesma data em que foi medida.** Os 7 com a unidade na prosa
passaram a declará-la no CAMPO, com o rótulo derivado; os 2 de pH e os 2 de
Glasgow ganharam `adimensional` e `pontos`. `test:unidade-de-campo` entrou no
portão, com M93 (tirar a unidade de um campo) e **M94 (mudar a unidade só na
prosa, deixando o campo)** — a segunda é a que importa, porque é invisível para
todo o resto.

Medição final: **41 campos, 41 com unidade, 0 na prosa.**

<details><summary>o registro original</summary>


Medido em 2026-08-23 (`npm run medir:unidade`), **não corrigido** — o autor pediu
o tamanho antes.

```
455 arquivos · 42 campos com kind:"number"
COM unidade 37 · SEM unidade 3 · sem unidade por natureza 2
UNIDADE SÓ NO RÓTULO EM PROSA: 7
TOTAL A RESOLVER: 10
```

**Os 3 sem unidade nenhuma:** dois campos de `pH` (que é adimensional — provável
falso positivo, precisa de julgamento) e um campo cujo bloco o regex não
conseguiu ler.

**Os 7 com a unidade só na prosa**, todos em
`electrolyte-calculator-screen.tsx`: `Peso (kg)` · `Glicemia (mg/dL)` ·
`Albumina (g/dL)` · `Bolsa final (mL)` · `Tempo da infusão (h)` · `Potássio atual
(mEq/L)` · `Bicarbonato (mEq/L)`.

⚠️ **A primeira versão da medição parou nos 42 campos das calculadoras e concluiu
"3 sem unidade"** — número tranquilizador e incompleto. As telas de protocolo
declaram entrada por `input("Peso (kg)", …)`, e a unidade fica dentro do texto.
É o R-119: **a unidade é do campo, não do rótulo em prosa.**

</details>

## D-99 — A PROGRESSÃO DE TOXICIDADE DO MAGNÉSIO — ✅ RESOLVIDA (2026-08-23)

`referencias` implementado (R-120), e as três faixas entraram como o primeiro
caso. **A lista de números proibidos como corte passou a ser DERIVADA do campo** —
antes era `[8, 10, 15, 25, 30]` escrita à mão dentro da trava, que é uma segunda
cópia dos mesmos números no lugar mais irônico possível.

A tela mostra as três em bloco separado da classificação, com "aproximadamente"
visível e a ressalva do autor junto: *não são limites absolutos nem recomendação
graduada; a decisão considera sintomas, função renal e a TENDÊNCIA*.

<details><summary>o registro original</summary>


As três faixas que o autor deu (~8–10 · ~10–15 · ~25–30 mEq/L) **não estão no
app**: a estrutura só sabe guardar número que classifica, e elas explicitamente
não classificam.

Forma proposta em `auditoria/PROPOSTA-REFERENCIA-QUE-NAO-CLASSIFICA.md` (R-120).
⚠️ A trava que impede esses números de virarem corte **já existe e foi provada**
(M91) — hoje com a lista escrita à mão; com o campo, ela passa a ser derivada.

</details>

## D-100 — O MENU JÁ PRESSUPÕE O DIAGNÓSTICO SINDRÔMICO

Registrada em 2026-08-23. ⚠️ **Não começar** — é assunto de outra fase.

A regra dos 31 (R-121) diz que todo módulo começa em *"o que tenho na minha
frente?"*. Mas o app só chega ao módulo **depois** de a pessoa escolher
"Injúria renal aguda" no menu — ou seja, **a escolha do módulo já pressupõe o
diagnóstico sindrômico**.

> Para quem não sabe o que está vendo, **o beco não está no passo 1: está no
> menu.**

Isso pede uma **entrada por apresentação clínica no nível do app inteiro** — o
mesmo teste do R-121 aplicado à porta da frente. Alvo: decisão do autor sobre
quando abrir essa fase.

## D-101 — PROCEDÊNCIA DE PROCESSO EM TELA, FORA DO RENAL

Medido em 2026-08-23. **Não corrigido** — a limpeza autorizada era do renal.

**Padrão de busca:** `/repositório|não está citad|não tem diretriz|relatório de
conferência|verbatim|protocols\/fontes|força não inflada/i`, em literais com mais
de 60 caracteres, lidos **sem comentário**.

**Universo:** 456 arquivos `.ts`/`.tsx`.
**Achados:** 7 — **2** em campo `alvo` (metadado de pendência, nunca renderizado,
tudo bem) e **5 em tela**:

| arquivo | o que é |
|---|---|
| `lib/anion-gap.ts` | caminho do verbatim de Figge a transcrever |
| `lib/eletrolitos/gravidade.ts` (×2) | verbatim da Spasovski a transcrever · o caminho do arquivo da UKKA |
| `components/protocol-screen/acls-post-rosc-screen.tsx` (×2) | "verbatim pendente" nas duas linhas da SSC |

⚠️ **Não é cosmético:** esses 5 são **exatamente o defeito que o autor reprovou
no celular** — texto sobre o nosso processo aparecendo na tela clínica —, só que
em módulos que ele ainda não percorreu. Não foram achados por sorte: foram
achados porque a varredura existiu.

Entra na fila dos 30 módulos restantes.

## D-102 — O APP NÃO TEM FLUXO DE DELIRIUM / ALTERAÇÃO AGUDA DO ESTADO MENTAL

Registrada em 2026-08-23. ⚠️ **Não é dívida do renal — é lacuna do app.**

A confusão aguda isolada, no passo 0 do renal, **não aponta para ramo nenhum**:
recebe o texto do autor e segue o fluxo (R-123). O destino natural dela seria um
fluxo de delirium, **que não existe**.

Entra na decisão de ordem dos 30 módulos restantes. **Não começar.**

## D-103 — O CORTE DE HIPOGLICEMIA: DOIS NÚMEROS, NENHUMA PROCEDÊNCIA

Varrido em 2026-08-24 (474 arquivos, 73.723 literais, padrão `/hipoglicemi/i`).

**Existe corte no app — e existem DOIS, diferentes:**

| onde | corte | procedência |
|---|---|---|
| `avc-decision-tree.ts` (nó `entry`) | *"tratar se **< 60 mg/dL**"* | ⚠️ **nenhuma** — o nó não tem `procedencia` |
| ACLS, causas reversíveis | *"Evitar glicemia **< 70** e > 180 mg/dL"* | ⚠️ **nenhuma** |

⚠️ **E não há módulo nem ramo de hipoglicemia**: a varredura de
`clinical-modules.ts` devolve apenas `cetoacidose-hiperosmolar`, que é o oposto.

Por isso o passo 0 do renal **pergunta e não classifica**: nenhum número foi
escrito. Alvo: pergunta ao autor sobre qual corte adotar e de qual fonte.

### ⚠️ NOTA DO AUTOR (2026-08-24) — e ela muda a pergunta da próxima auditoria

> **Antes de unificar, verificar qual função o número exerce em cada módulo.** Um
> limiar de **tratamento** de hipoglicemia no AVC pode não querer dizer o mesmo
> que uma **meta de evitar** hipoglicemia no pós-PCR/ACLS. **Conferir texto,
> contexto e fonte de cada um** — e só então decidir se é um corte com três usos
> ou três cortes com nomes parecidos.

É o **R-127**. A auditoria clínica específica vem **imediatamente depois do
percurso no celular**, e não antes.

---

## D-104 — ESTABILIZAÇÃO: O "B" DO ABCDE ORIENTA, MAS NÃO LEVA A LUGAR NENHUM

**Aberta em 2026-08-27**, na reestruturação que removeu a arquitetura clínica
antiga. **Decisão explícita do autor:** registrar como dívida funcional e **não**
criar módulo provisório para preservar o link.

**O que se perdeu.** O card "Estabilização primeiro" oferecia seis atalhos. Dois
apontavam para módulos que saíram do app:

| atalho | destino | estado |
|---|---|---|
| Via aérea / IOT (ISR) | `isr-rapida` | removido |
| Ventilação mecânica | `ventilacao-mecanica` | removido |

Mantê-los seria pior que removê-los: o médico toca no meio de uma estabilização
e cai numa rota morta. Foram removidos de `STAB_MODULES` em
`components/protocol-screen/stabilization-first-card.tsx`.

**A consequência clínica, dita sem eufemismo.** O card continua ensinando o "B"
— *"Insuficiência respiratória / hipoxemia → O₂ alvo, VNI precoce; IOT +
ventilação se falha ou exaustão"* — e essa orientação **continua correta e
continua visível**. O que não existe mais é o passo seguinte: **não há navegação
para módulo operacional de via aérea nem de ventilação**. O médico é orientado a
intubar e ventilar; a partir daí o app não o acompanha.

Os quatro atalhos restantes (PCR/RCP, Choque/vasopressor, Bradicardia instável,
Taquicardia instável) seguem funcionando.

**Uma terceira rota morta, da mesma família.** A tela de **PCR na gestação**
(módulo preservado) tinha, no bloco "Para onde ir daqui", um segundo destino:
**"Pré-eclâmpsia e eclâmpsia — se houver PULSO: sulfatação, crise hipertensiva,
HELLP"**, apontando para `/modulos/pre-eclampsia`, também removido. O botão foi
retirado em `components/protocol-screen/acls-pregnancy-screen.tsx`.

O mesmo diagnóstico vale: a gestante **com pulso** é exatamente quem mais precisa
que o toque leve a algum lugar, e agora não leva. Nenhum substituto foi posto de
propósito — mandar a eclâmptica para um fluxo genérico de convulsão inverteria a
primeira linha (**MgSO₄ antes de benzodiazepínico**), erro que este app já
documentou uma vez. O destino "PCR no adulto", que é o principal daquele bloco,
segue funcionando.

**Onde fecha.** Quando **ISR rápida**, **Ventilação mecânica** e
**Pré-eclâmpsia/eclâmpsia** forem reconstruídas na arquitetura nova. Nesse dia os
atalhos voltam a `STAB_MODULES` e ao bloco da gestação — e nenhuma solução
temporária deve ser criada antes disso.

---

## D-105 — REUSO DE PESO ENTRE MÓDULOS: A REGRA ESTÁ VIVA, O CAMINHO NÃO TEM PROVA

**Aberta em 2026-08-27.** A regra de qual dado pode ser reaproveitado entre
módulos — **peso e altura sim, sinal vital nunca** — continua **inteira e
travada** em `scripts/test-contexto-paciente.cjs`, junto com `lib/contexto-do-paciente.ts`.
Nada de conteúdo saiu.

**O que ficou descoberto** é a travessia de ponta a ponta: informar o peso num
módulo, trocar de módulo por dentro do app, e ver o aviso *"Aproveitado do que
você já informou"* no destino. O teste que media isso (`e2e/barra-numerica.spec.ts`)
usava sepse-adulto → ISR; **os dois módulos saíram**.

**Por que não foi redirecionado.** Nenhum par de módulos sobreviventes coleta
peso em árvore de decisão: bradicardia e taquicardia coletam PAS e sintomas, e as
calculadoras pedem peso mas não se alcançam por dentro do fluxo. Escrever a
travessia sobre um par que não existe seria um teste que **passa sem exercitar o
caminho** — pior que a ausência dele, porque parece cobertura.

**Onde fecha.** No primeiro módulo da arquitetura nova que colete peso em fluxo.

---

## D-106 — DOSE POR QUILO: A REGRA GERAL ESTÁ VIVA, O RISCO ESPECÍFICO NÃO TEM PROVA

**Aberta em 2026-08-27.** A regra de que **a tela não pode imprimir número que
ninguém informou** continua travada em `scripts/valida-valor-nao-informado.cjs`
(`test:valor-informado`, 8 conferências verdes). Nada de conteúdo saiu.

**O que ficou descoberto** é o elo mais grave da série: **valor solto no ponto de
partida → dose produzida**. Na Sedoanalgesia, sem peso confirmado a taxa da bomba
saía como "—", e o paciente de 70 kg ficava sem dose enquanto na tela parecia
apenas *"o app não calculou"* — defeito que **bloqueava conduta**, não um aviso.

**Por que não foi redirecionado.** Nenhum módulo sobrevivente dosa por quilo
dentro do fluxo. O teste dos campos opcionais numéricos (`e2e/valor-nao-informado.spec.ts`)
também saiu pelo mesmo motivo: peso, altura e idade opcionais não existem em
nenhum módulo vivo.

**Onde fecha.** Quando voltar a existir um fluxo com **dose por kg**. A cobertura
daquele risco específico deve ser recriada nesse momento — não antes, e não com
teste artificial sobre código que não existe.

---

## D-107 — LEGACY_ACLS_RUNTIME: 6.041 LINHAS DE DÍVIDA TRANSITÓRIA ACEITA

**Aberta em 2026-08-27**, com prazo e escopo declarados pelo autor.

A reestruturação removeu a arquitetura clínica antiga. **Bradicardia e Taquicardia
do ACLS foram preservadas** porque pertencem ao PCR Adulto — e elas dependem do
motor e da concha antigos. O conjunto foi isolado e carimbado:

> `LEGACY_ACLS_RUNTIME — manter temporariamente apenas para bradicardia e
> taquicardia. Não utilizar em novos módulos clínicos.`

| arquivo | linhas |
|---|---|
| `core/decision-tree/types.ts` | 1.046 |
| `core/decision-tree/engine.ts` | 1.038 |
| `core/decision-tree/estado-clinico.ts` | 129 |
| `components/protocol-screen/acls-decision-flow-screen.tsx` | 2.644 |
| `components/protocol-screen/stabilization-first-card.tsx` | 332 |
| `acls-tachycardia-tree.ts` | 460 |
| `acls-bradycardia-tree.ts` | 394 |
| `lib/instabilidade-guiada.ts` | 354 |
| `lib/flow-session.ts` | 163 |
| **total** | **6.581** |

⚠️ **A conferência de consumidores corrigiu o número.** A contagem inicial era
6.041, em sete arquivos. A varredura de quem importa o quê mostrou dois
**satélites exclusivos** que não estavam carimbados: `lib/instabilidade-guiada.ts`
(consumido SÓ pelas duas árvores — é ele que produz `camposDeInstabilidade()`) e
`lib/flow-session.ts` (consumido SÓ pela concha e pelo motor). Eles são legado por
DEPENDÊNCIA, não por conteúdo, e saem junto. O número não cresceu por regressão:
cresceu porque a medição ficou honesta.

O motor propriamente dito — `core/decision-tree/engine.ts` — tem **um único**
consumidor: `acls-decision-flow-screen.tsx`. A concha tem **dois**:
`acls-bradycardia-screen.tsx` e `acls-tachycardia-screen.tsx`. Cada árvore tem
**um**. O vazamento de `types.ts` para fora dos sete era `import type` nos dois
satélites — apagado na compilação, zero acoplamento em runtime.

**Isto não é a base do próximo módulo.** O AVC, e tudo que vier depois, nasce na
arquitetura nova. Acrescentar módulo aqui reinstala o problema que a
reestruturação existiu para desfazer.

**Onde fecha.** Quando bradicardia e taquicardia forem reescritas.


---

## D-108 — DÍVIDA TÉCNICA PRÉ-EXISTENTE, MEDIDA NOS DOIS LADOS DA REESTRUTURAÇÃO

**Registrada em 2026-08-27.** Nenhum dos dois itens foi criado pela remoção dos
módulos clínicos; ambos foram MEDIDOS antes e depois, para que a distinção entre
*dívida herdada* e *regressão* não dependa de memória.

**1 · Lint — 324 → 234 problemas.** Medido com a limpeza em `git stash` e sem
ela. O app nunca teve lint limpo; a reestruturação reduziu a dívida em 90
problemas ao remover os arquivos que os continham. **Decisão explícita do autor:
não corrigir agora, não ampliar o escopo desta etapa.**

**2 · Hidratação (React #418) na rota desconhecida.** Visitar `/modulos/<id que
não existe>` redireciona corretamente para a home e não renderiza tela de módulo
— mas lança um erro de hidratação no console. **Isto NÃO é dos módulos
removidos:** `/modulos/xpto-nunca-existiu`, um id que jamais existiu, produz
exatamente o mesmo erro; e toda rota VIVA hidrata limpa. O que mudou é que os 19
ids removidos passaram a integrar o conjunto dos desconhecidos.

A causa é o caminho de fallback do servidor estático: sem `<id>.html` publicado,
serve-se o `index.html` e o cliente redireciona depois de montar. **Onde fecha:**
quando a rota `[id]` ganhar uma tela de "módulo não encontrado" renderizada no
build, em vez de redirecionar no cliente.

---

## D-109 — mRS PRÉVIO SEM DESCRITORES: A ESCALA ENTRA POR GRAU, SEM O QUE CADA GRAU SIGNIFICA

**Registrada em 2026-08-28**, com a Superfície B do AVC (`avc/conteudo/superficie-b.ts`,
campo `mrs_previo`).

**O que existe:** os graus **0 a 5**, tocáveis, mais "Não sei". O papel do valor
está transcrito e é fiel — **F-14** resolveu o slot: na IVT é **contexto**
(*"remain uncertain… on an individual basis"*, ⛔ sem COR/LOE), na EVT é critério
**como gradiente de força**, e ⛔ em nenhum dos dois é contraindicação automática.

**O que falta:** o TEXTO de cada grau — o que distingue 2 de 3, que é onde a
escala de fato se aplica à beira do leito.

**Por que ficou assim, e ⛔ não é descuido:** os descritores da escala de Rankin
modificada ⛔ **não estão transcritos em fonte nenhuma deste repositório**. A
AHA/ASA 2026 usa o mRS o tempo todo e ⛔ não o define; escrevê-los de memória
seria **E-31** violada no ponto exato em que ela mais custa — um descritor errado
⛔ não parece errado, e o médico o leria com a autoridade da fonte que sustenta o
resto da tela.

**Consequência aceita:** quem não tem a escala na cabeça responde "Não sei" — que
é resposta legítima (**E-02**) e ⛔ não bloqueia nada. ⚠️ É pior que ter os
descritores, e é **melhor que inventá-los**.

**Como se fecha:** um slot de fonte próprio para o mRS (escala original ou
adaptação brasileira validada), transcrito no contrato de §6.11, e os descritores
passam a existir com endereço. ⛔ Enquanto isso, ⛔ não escrever.

---

## D-110 — `flexBasis: "100%"` DO `NumericStepper`: CERTO EM LINHA, ROUBA CLIQUE EM COLUNA

**Registrada em 2026-08-28**, encontrada pelo e2e da Superfície B do AVC — ⛔ não
por leitura de código.

**O que acontece:** `components/ui-v2/numeric-stepper.tsx` declara
`wrapper: { flexBasis: "100%", flexGrow: 1, minWidth: 200 }`. Num contêiner em
LINHA isso é correto e é o motivo de existir: o controle ocupa a largura inteira
e quebra. Num contêiner em **coluna**, `flexBasis: 100%` passa a valer sobre a
**altura**.

**Medido no AVC:** o controle inchou para **250 px** dentro de um cartão de campo
de **268 px** cujo conteúdo ia até **403 px** — o botão seguinte ficava fora da
caixa do cartão, e o bloco de baixo por cima dele. O Playwright ficou 60 s
tentando clicar num botão visível e habilitado, com o texto do bloco seguinte
interceptando o ponteiro.

⚠️ **É a queixa do autor com causa medível:** *"botões ruins de selecionar… tem
que ficar procurando onde tem que clicar"*. Não era só contraste — havia
elemento sobreposto comendo o toque.

**O que foi feito:** neutralizado **no consumidor** (`components/avc/campos-clinicos.tsx`,
`style={e.stepper}` com `flexGrow: 0, flexBasis: "auto"`), e ⛔ **não** no
componente: lá o valor está certo para quem o usa em linha, e mudá-lo mexeria no
layout de todos os módulos sem necessidade.

**O que fica em aberto:** ⛔ ninguém mediu os OUTROS consumidores em coluna. A
dívida é a varredura — quais telas põem `NumericStepper` dentro de uma coluna e
têm o mesmo elemento sobreposto sem que ninguém tenha reparado.

---

## D-111 — ASPECTS ENTRA COMO NÚMERO, SEM O QUE ELE SIGNIFICA

> ### ⚠️ ATUALIZADA em 2026-08-29 — **a dívida continua, e a tela deixou de mentir**
>
> O autor usou a Superfície C e apontou o efeito prático desta dívida: *"o usuário
> ⛔ não sabe classificar isso"*. O que mudou (**PD-26**):
>
> - o rótulo passou a dizer **de onde o número vem** — *informado no laudo ou pela
>   equipe*;
> - a tela declara, **visível**, que *"o app ainda ⛔ não calcula o ASPECTS nesta
>   versão"*, e pede o valor **sem estimar**;
> - **F-28** foi aberto, com fonte-base aprovada — **Barber PA et al., Lancet
>   2000** — e a escala clicável, mais o **esquema vetorial dos territórios**,
>   ficam bloqueados até a transcrição;
> - a trava reprova se qualquer território do ASPECTS for escrito enquanto F-28
>   estiver aberto.
>
> ⚠️ **A dívida ⛔ não foi paga:** o app continua ⛔ não calculando. O que ele deixou
> de fazer foi **parecer** que o médico deveria saber calcular.

**Registrada em 2026-08-29**, com a Superfície C do AVC
(`avc/conteudo/superficie-c.ts`, campo `aspects`).

**O que existe:** o escore **0 a 10**, informado por quem leu a imagem, com o
zero declarado como resposta válida (**E-10** — F-08 rec. 4 tem a faixa
*"ASPECTS 0 to 2"*).

**O que falta:** o que o escore É, e como se pontua.

**Por que ficou assim:** a **Figure 2**, que a rec. 1 de F-16 referencia para o
ASPECTS, ⛔ **não foi transcrita** — é figura, e a carga isquêmica pertence a
F-08. Escrever aqui os territórios, ou como se desconta ponto, seria redação de
memória (**E-31**) num número que alimenta decisão de trombectomia.

**Consequência aceita:** o campo carrega o **nome** e a instrução de registro
(*"Registre o escore se disponível no laudo ou na avaliação"*), e a nota diz
explicitamente que **o app ⛔ não calcula ASPECTS**. Quem ⛔ não tem o escore ⛔ não
o informa, e ⛔ nada espera por ele.

**Como sai:** abrir **F-28** com a descrição operacional do ASPECTS, de fonte que
a publique — decisão do autor.

---

## D-112 — PC-ASPECTS E A CIRCULAÇÃO POSTERIOR FICARAM FORA DESTA RODADA

**Registrada em 2026-08-29**, por decisão do autor: *"PC-ASPECTS: ⛔ não incluir
nesta rodada."*

F-08 nomeia **ASPECTS e PC-ASPECTS** entre os fatos da avaliação endovascular, e
§4.7.3 traz a circulação posterior com recomendação própria. A Superfície C
coleta o sítio *"Artéria basilar ou circulação posterior"*, e ⛔ **não** coleta o
PC-ASPECTS.

**Por que:** o escore posterior só tem leitura contra a recomendação de §4.7.3, e
ela mora na Reperfusão. Coletado antes da regra, seria mais um número sem quem o
leia.

**Como sai:** junto com o bloco de circulação posterior da Superfície F.

---

## D-113 — OS ACHADOS DE IMAGEM AVANÇADA ESPERAM A REGRA QUE OS INTERPRETA

**Registrada em 2026-08-29**, por decisão do autor.

A Superfície C registra **quais** exames avançados já foram feitos (TC de
perfusão · RM difusão/FLAIR · RM perfusão) e ⛔ **não** registra os achados —
*mismatch* DWI-FLAIR e penumbra salvável.

**Por que:** os dois só significam alguma coisa contra a **janela estendida**
(F-03, recs. 1–3), com quatro marcos temporais distintos que a fonte ⛔ não
harmoniza. Trazidos para a imagem antes da regra, fariam a Superfície C parecer
**porta terapêutica** — que é exatamente o que **R2.3** (COR 1 · B-NR) proíbe.

⚠️ Palavras do autor: *"quando chegarmos à janela estendida em Reperfusão, aí os
achados ganham significado clínico"*.

---

## D-114 — A DISPONIBILIDADE BRASILEIRA DE IMAGEM É FATO DE CAMPO, E ⛔ NÃO INFERÊNCIA

**Registrada em 2026-08-29.**

F-16 §9 e F-03 §12 declaram a adaptação brasileira como **necessária** (**E-18**):
a disponibilidade de angiotomografia, perfusão e software de pós-processamento
varia, e ⛔ **não se infere da fonte americana**.

**O que a Superfície C faz:** oferece *"Não disponível neste serviço"* como
resposta do campo `angio_realizada` — e essa resposta **fecha** a pendência
vascular (**E-26**: cobrar para sempre um exame que o serviço ⛔ não tem é muro,
⛔ não tarefa).

**O que ⛔ ainda ⛔ não existe:** o **destino** que essa resposta deveria alimentar —
transferência para centro com o recurso. Ele é da Superfície G, e ⛔ não desta.

---

## D-115 — ALERGIA A CONTRASTE: O FATO ENTRA, A CONDUTA ⛔ NÃO EXISTE

**Registrada em 2026-08-29**, junto com **PD-25**.

O campo `alergia_contraste` registra **Sim · Não · Não sei**, escopado à ação de
imagem com contraste.

**O que falta:** o que fazer quando a resposta é **Sim**. A fonte-mãe do AVC
⛔ **não define conduta** para alergia a contraste — ⛔ não há pré-medicação,
⛔ não há alternativa de exame, ⛔ não há prazo.

**Por que fica assim:** escrever qualquer manejo aqui seria conteúdo clínico sem
fonte (**E-31**), e a trava da Superfície C varre a leitura atrás dessas palavras
justamente para impedir que apareça depois, com cara de recomendação.

**Consequência aceita:** o app registra o fato, diz que ele **diz respeito apenas
ao exame com contraste**, e se cala. O manejo é decisão clínica e institucional.

**Como sai:** fonte complementar — diretriz de radiologia ou protocolo
institucional —, se o autor decidir abrir o slot.

---

## D-116 — ✅ FECHADA em 2026-08-29 · OS DESCRITORES DO mRS EM ESPANHOL

> ### ✅ FECHADA PELO AUTOR NO MESMO DIA EM QUE FOI ABERTA
>
> Eu havia registrado esta dívida argumentando que traduzir os descritores
> produziria "uma escala de Rankin em espanhol sem fonte". ⚠️ **O argumento
> estava errado**, e o autor o desfez:
>
> > *"Isso ⛔ não viola E-31: traduzir fielmente uma fonte ⛔ não é inventar conteúdo
> > clínico. A fonte continua sendo o Quadro 4 brasileiro; o texto espanhol é
> > apenas uma tradução de apresentação, com rastreabilidade para a fonte
> > original."*
>
> ⚠️⚠️ **A distinção que isto fixa, e que vale para o app inteiro:** E-31 proíbe
> **escrever conteúdo clínico sem fonte** — ⛔ não proíbe **exibir, noutro idioma,
> conteúdo que TEM fonte**. O que continua proibido é apresentar a versão
> espanhola como **fonte independente**, e traduzir **verbatim auditável**
> (§6.14), que segue em inglês em `protocols/fontes-verbatim/`.
>
> **O que foi feito:** os sete graus ganharam par em ES-419; a tabela PT/ES está
> em `mrs-br.md` com a procedência declarada; e `test:i18n-opcoes` reprova se um
> grau perder o par, se um par apontar para a própria string portuguesa sem
> declaração, ou se a declaração de procedência sair do arquivo de fonte.

### O registro original



**Registrada em 2026-08-29**, na varredura de opções que a Superfície C
introduziu — ⚠️ a dívida é da **Superfície B**.

**O que acontece:** os seis graus do `mrs_previo` — *"0 · assintomático"* a
*"5 · grave"* — aparecem **em português** na tela em espanhol. ⛔ Eles ⛔ não têm
chave no dicionário, e a varredura de prosa ⛔ não os alcança.

**Por que ⛔ NÃO foram traduzidos junto com o resto:** eles ⛔ não são texto de
interface. São os descritores do **Quadro 4 da SBACV** (**F-27**), transcritos, com
conferência clínica **declarada pendente**. Traduzi-los aqui produziria uma
**escala de Rankin em espanhol sem fonte nenhuma** — E-31 pela porta dos fundos,
numa escala que a literatura publica em várias versões culturalmente adaptadas
(é exatamente o ponto de **F-26**, Cincura 2009: adaptação cultural ⛔ não é
tradução literal).

⚠️ **É decisão do autor**, e ⛔ não de implementação: ou entra uma fonte em
espanhol com os descritores, ou o campo declara na tela que a escala é
apresentada na versão brasileira.

**Enquanto isso:** o grau (o número) é o mesmo nos dois idiomas, e o descritor
aparece em português — visível, ⛔ não silencioso.

⚠️ *(Fim do registro original. O "enquanto isso" acima ⛔ **não descreve mais o
app**: os descritores têm par em espanhol desde 2026-08-29.)*

---

## D-117 — "EFEITO DE MASSA SIGNIFICATIVO" ⛔ NÃO TEM DEFINIÇÃO, E A LACUNA É DA FONTE

**Registrada em 2026-08-29**, com **F-29** aberto — ⚠️ e **sem fonte candidata**.

**O que acontece:** a fonte-mãe usa a expressão em recomendações que **mudam a
força da indicação de trombectomia** — F-08, recs. 3 e 4: *"…and without
**significant** mass effect on imaging, EVT is recommended…"* — e ⛔ **não define
medida nenhuma** para *significant*.

⚠️ **Isto ⛔ não é lacuna de transcrição: é lacuna da fonte.** Varrida a seção, ⛔ não
há critério, ⛔ não há corte, ⛔ não há referência de comparação.

**O contraste que torna a lacuna visível:** a mesma Table 8 **define** o achado
vizinho — *"Clear hypodensity is when the degree of hypodensity is greater than
the density of contralateral unaffected white matter"*. Um tem critério
aplicável; o outro ⛔ não. Foi por isso que a hipodensidade entrou na Superfície C
com a definição visível (**PD-27**) e o efeito de massa ⛔ não.

**O que o app faz enquanto isso:** mantém a **expressão da fonte** e declara, na
nota, que ela ⛔ não define medida e que a leitura é de quem interpreta a imagem.
⛔ **⛔ Nenhum critério inventado**, ⛔ nenhum corte, ⛔ nenhuma lista de sinais.

**Como sai:** fonte complementar que publique definição operacional — decisão do
autor. O slot **F-29** já está declarado e aberto.

---

## D-118 — ✅ FECHADA em 2026-08-30 · O CONTROLE DE DATA E HORA

> ### ✅ FECHADA ANTES DO COMMIT, POR DECISÃO DO AUTOR
>
> > *"⛔ Não é uma melhoria futura de UX; é uma limitação de representação de um
> > dado temporal que pode mudar decisão."*
>
> **O que entrou:** linha de data com **Hoje · Ontem · Escolher data**, mais o
> passo de dia que aparece quando se sai de hoje e ontem. "Agora" e
> *"Sem essa informação"* continuam onde estavam.
>
> ⚠️⚠️ **E a regra que ⛔ não podia cair:** mexer no **dia** ⛔ não habilita
> Confirmar. Tocar em "Ontem" muda a data e deixa a **hora** onde o controle
> estava posicionado — que é `agora`, e ⛔ não escolha de ninguém. Se isso
> valesse como resposta, *"última vez bem"* viraria **ontem, na hora em que a
> tela abriu**: o "agora como default silencioso" voltando por uma porta nova.
> `onMudar` passou a carregar `escolheuValor`, e ⛔ só hora, minuto e "Agora" o
> marcam.
>
> ⚠️ **Um defeito de fuso foi corrigido no caminho:** a primeira versão extraía
> "a hora do dia" com `instante % 86_400_000` — que é a hora em **UTC**. Em
> Brasília o marco sairia três horas deslocado, e ⛔ não pareceria errado.
> `instanteEmDiaComHora` usa o calendário local.
>
> **Provado:** `e2e/avc-controle-de-data` — hoje · ontem · três dias atrás · data
> escolhida · desconhecido · "Agora" · futuro inalcançável · espanhol. **7/7.**

### O registro original


**Registrada em 2026-08-30**, com a superfície Paciente.

**O que existe:** `doac_ultima_dose` é `tipo: "hora"`, e o **fato** já é data e
hora — um instante epoch, exibido como `DD/MM HH:mm` quando o dia difere.

**O que falta:** o **controle**. `SeletorDeHora` oferece hora ±1, minuto ±1, um
atalho de −5 min e "Agora" — e ⛔ **nenhuma dimensão de dia**. Marcar uma dose de
anteontem às 20h exigiria ~40 toques em "hora −".

⚠️ **E o mesmo controle serve `hora_ultima_vez_bem`**: um paciente visto bem
anteontem à noite ⛔ **não é representável hoje**, e esse é o relógio que decide
janela.

**O desenho aprovado pelo autor**, ⛔ ainda ⛔ não implementado:

```
Data:  [ Hoje ] [ Ontem ] [ Escolher data ]
Hora:  [ HH ] : [ MM ]        [ Agora ]
```

⚠️ Preserva o teto em "agora", o `selecionado` que ⛔ não nasce verdadeiro, e a
saída *"Sem essa informação"* onde o campo aceita desconhecido.

⛔ **E ⛔ não autoriza calcular `< 48 h`** — o marco de referência dessa derivação
é decisão da Superfície D.

---

## D-119 — A INSTÂNCIA DE EXAME ESTÁ CONTRATADA, E ⛔ NÃO IMPLEMENTADA

**Registrada em 2026-08-30.**

O contrato temporal foi fechado com o autor (**PD-30** e o contrato de
instâncias), e a **implementação entra com Laboratório**:

> - toda **aferição** pertence a uma **instância**;
> - toda instância de imagem declara **modalidade**;
> - o **horário** pode ser conhecido, desconhecido ou ⛔ ainda ⛔ não informado —
>   e ⛔ **nunca fabricado** (**E-52**).

**O que ainda ⛔ não existe:** o campo `instancia` em `FatoRegistrado`, o
`instanciaDe` no campo, e a divisão de `tc_resultado` em `tc_situacao` (estado) +
`resultado` (aferição do estudo), aprovada como decisão **j**.

⚠️ **Consequência aceita enquanto isso:** com **duas** tomografias, os achados
ficam historicamente órfãos — é exatamente o estado que o autor nomeou como
inaceitável, e é por isso que Laboratório vem antes dos ajustes de C.

---

## D-120 — ✅ FECHADA em 2026-08-30 · A AFERIÇÃO DE PA DEIXOU DE SER ÓRFÃ

> ### ✅ FECHADA ANTES DE ABRIR LABORATÓRIO, POR DECISÃO DO AUTOR
>
> > *"Melhor fechar o contrato de instância primeiro e aplicar pelo menos ao caso
> > mais simples antes de criar uma superfície inteira baseada nisso."*
>
> **O que entrou:** `instancia` em `FatoRegistrado` — uma **etiqueta**, e ⛔ não
> uma segunda estrutura: a trilha continua plana e append-only (§3.1).
> `instanciaDe` no campo declara que ele é **metade de uma aferição composta**, e
> hoje ⛔ **só `pas` e `pad`** o declaram.
>
> ⚠️⚠️ **O defeito era real e silencioso:** a leitura da PA lia o último valor de
> **cada campo**, então a sistólica das 14h se juntava à diastólica das 15h e o
> app exibia uma pressão que ⛔ **nunca existiu** — com a cara de uma medida real,
> alimentando a decisão de tratar antes de reperfundir. A conferência que prova
> isso é a que registra **só a sistólica** da segunda medida e exige que ela
> ⛔ **não** se complete com a diastólica da primeira.
>
> ⚠️ **As três operações ficaram distintas** (§3.4, §7.16): *nova aferição* abre
> instância nova pelo gesto **"Nova medida"** · *correção* fica na mesma
> instância · *completar* preenche a outra metade da medida já aberta.
>
> ⚠️ **E a regra mora em UM lugar:** `registrarComInstancia`, no conteúdo — a
> primeira versão carimbava na tela, e as **travas**, que registram direto,
> passaram a construir PAs sem instância que a derivação lia como "⛔ não
> informada". I6 aplicada a instância.
>
> ⛔ **⛔ Nenhum motor genérico** (§9.1): Laboratório e Imagem entram depois, e é
> quando o contrato será exercitado de verdade.
>
> **Provado:** 6 conferências novas em `prova-avc-superficie-a` (99, era 92),
> **5 mutações reprovando**, e `e2e/avc-superficie-a` com o gesto de nova medida.

### O registro original


**Registrada em 2026-08-30**, achada ao declarar a temporalidade dos 51 campos.

`pas` e `pad` são `afericao` e ⛔ **não pertencem a instância nenhuma** — o que
significa que **PAS 198 e PAD 114 da mesma aferição ⛔ não estão amarrados**. Com
duas medidas, a trilha guarda quatro números e ⛔ nenhuma indicação de quais dois
foram medidos juntos.

⚠️ **É o mesmo defeito das duas tomografias**, numa superfície que ⛔ não estava
no recorte desta rodada. O contrato de instância resolve os dois; a ordem
aprovada é **Laboratório → C → D**, e a **A** entra depois.

**Enquanto isso:** a leitura de PA usa o valor atual de cada campo, e o par mais
recente é o par correto no caminho normal de uso.

---

## D-121 — FREQUÊNCIA CARDÍACA E AUSCULTA ⛔ NÃO TÊM FONTE NO MÓDULO

**Registrada em 2026-08-30**, por decisão do autor: *"⛔ não entram ainda sem
fonte. Abra slots de fonte e registre como prioridade para A."*

O autor descreveu a avaliação inicial como *"exame básico para identificar riscos
iminentes e tratar caso tenha PA, FC, AP, AC"*. Hoje a Superfície A tem PA, SpO₂,
via aérea, consciência e glicemia — e ⛔ **não** tem **frequência cardíaca** ⛔ nem
**ausculta cardíaca ou pulmonar**.

⚠️ ⛔ Nenhum dos três tem verbatim transcrito no módulo. Criá-los agora seria
**E-19** violada — pergunta que a fonte ⛔ não sustenta.

**Prioridade declarada: alta**, por decisão do autor.

---

## D-122 — ✅ FECHADA · URL CERTA MONTAVA O MÓDULO ERRADO

**Registrada em 2026-08-30**, ao fechar o Laboratório.

`e2e/retomada-de-fluxo.spec.ts:209` — *"nunca fica sem caminho de volta ao ponto
— por qualquer rota"* — falha na suíte completa e também isolada.

O ponto de falha é a linha 237: depois de `page.goBack()` a partir de
`drogas-vasoativas`, a tela ⛔ **não** volta a mostrar "Passo" dentro de 15 s, e o
teste sequer chega a medir a invariante que ele existe para medir.

### Por que ⛔ não é do AVC

⚠️ A rota exercida é **bradicardia-ACLS → estabilização → drogas vasoativas** —
⛔ nenhum arquivo dela foi tocado. E a falha aparece **idêntica** em todas as
execuções anteriores de `test:all` registradas nesta sequência de trabalho,
inclusive na do commit `51b642c`, que já está publicado.

### FECHADA em 2026-08-30 — era **defeito do produto**, e ⛔ não do teste

⚠️⚠️ **A asserção por `"Passo"` estava certa.** ⛔ Não havia "Passo" na tela porque
⛔ **não era a tela da bradicardia**: depois do `goBack()`, a URL era
`/modulos/bradicardia-acls?id=bradicardia-acls` e o que montava era o **módulo
de AVC** — 148 testIDs `avc-*` no DOM, e ⛔ nenhum vestígio da bradicardia.

⛔⛔ Em uso real: o médico entra em **bradicardia**, abre as **vasoativas** pelo
atalho de estabilização, toca em **voltar** — e recebe a tela de **AVC** com a
URL da bradicardia. Tela de um paciente sobre o fluxo de outro.

### A causa, isolada por experimento

`app/modulos/avc.tsx` era **rota estática irmã** de `[id].tsx`. Retirada a irmã,
a volta acertava a bradicardia **e** a barra *"VOCÊ ESTAVA AQUI · Passo 3"*
aparecia — ⚠️ a invariante do produto sempre funcionou; ela ⛔ nunca era alcançada.

⚠️ O que ⛔ **não** era a causa, cada um descartado por medição:
- ⛔ ⛔ não é o nome `avc` — reproduziu igual como `zoutro.tsx`;
- ⛔ ⛔ não é a query `?id=` — carga direta com a mesma URL funciona;
- ⛔ ⛔ não é `goBack()` em si — entre dois módulos por carga direta, funciona;
- ⛔ ⛔ não se resolve com `<Stack.Screen>` explícito ⛔ nem com `avc/index.tsx`.

⚠️ O gatilho é o **pop dentro da pilha do expo-router** entre duas telas do
segmento: havendo irmã estática, ela é montada no lugar da rota pedida.

### O conserto, e o que ele ⛔ não mexeu

O AVC passou a ser servido pela própria `[id].tsx`, com desvio **antes** de
qualquer `engine` — ⛔ ele continua fora do `ClinicalApp` (D-107). A URL
`/modulos/avc` ⛔ **não mudou**, e o id entrou em `generateStaticParams` para
seguir pré-renderizada (React #418). ⛔ Nenhum e2e do AVC precisou mudar.

⚠️ `test:rotas-de-modulo` passou a guardar a condição estrutural: ⛔ nenhuma rota
estática irmã de `[id].tsx`. O e2e ⛔ só pegaria o defeito no módulo que ele
percorre, e ele nasce em **qualquer** módulo novo.

⚠️⚠️ A restrição virou **decisão arquitetural explícita** do autor —
`ARQUITETURA.md §6`, com a saída futura registrada: rota própria para um módulo
exige mudança deliberada de arquitetura (segmento separado ou revisão do Expo
Router), e ⛔ **não** exceção local à trava. ⛔ Ela ⛔ não se generaliza para fora do
roteamento atual.

**`test:all`: 239 passed, 0 failed** — a suíte inteira verde pela primeira vez
nesta sequência de trabalho.

## D-123 — ⏸️ ABERTA · POSSE DE SESSÕES ANÔNIMAS PRONTA E DESLIGADA

**O que existe, medido:** `lib/troca-de-sessao.ts` (a decisão), `lib/sessao-anonima.ts`
(a fiação), a Edge Function `claim-anonymous-sessions`, e **duas** migrations.
Provados por `test:troca-de-sessao` (16 conferências **executadas**),
`test:posse-de-sessao` (28) e `test:edge-functions` (21).

**O que ⛔ não existe:** a ligação com `app/index.tsx`, suspensa até a Fase 4.

### ⚠️⚠️ AUTORIZAÇÃO ⛔ NÃO É POSSE — decidido em 2026-08-30

⚠️ Eu tinha provado **isolamento de posse** (`user_id = auth.uid()`) e
**⛔ não-autopromoção** (`app_users_update_admin` exige admin+ativo no banco), e
apresentei isso como se fosse **autorização de uso**. ⛔ São propriedades
diferentes: `app/index.tsx` recusa a navegação, mas ⛔ não é fronteira de servidor.

⚠️ A fronteira que falta é `pode_usar_clinico()` — `stable`, `security invoker`,
`search_path` fixo, ⛔ sem tocar `auth.users`:

| Caso | `is_anonymous` (claim do JWT) | `app_users` | Resultado |
|---|---|---|---|
| anônimo legítimo | `true` | ⛔ nenhuma linha | ✅ ⛔ só os próprios |
| permanente `pendente` | `false` | `pendente` | ⛔ **negado** |
| permanente `ativo` | `false` | `ativo` | ✅ ⛔ só os próprios |
| bloqueado / claim ausente | — | — | ⛔ **negado** (falha fechada) |

⚠️ Nas policies como `(select pode_usar_clinico())` — ⛔ sem o `(select …)` seria
chamada **por linha** em vez de uma vez por consulta (initplan).

### ⚠️⚠️ O CLAIM ⛔ SÓ TRANSFERE PARA CONTA `ativo`

⚠️⚠️ Transferir para conta `pendente` ⛔ não perde dado — mas a conta ⛔ não lê o
que recebeu, e a identidade anônima, que lia, deixa de ser a ativa. ⛔ Para o
médico é **indistinguível de perda**, e é a mesma experiência que a regra
*"claim falho ⛔ não troca a sessão"* existe para evitar.

⚠️ **Posse ⛔ só muda quando a nova identidade está autorizada a exercê-la.**

⚠️⚠️ E a verificação mora **no servidor** (5ª validação do claim). ⛔ Se o cliente
consultasse o `status` e decidisse ⛔ não chamar o claim, voltaria a ser autoridade
sobre a própria autorização — ⛔ o defeito do `old_user_id` com outra roupa. ⚠️ Por
isso o claim é **sempre chamado**; ⛔ o que ⛔ não acontece é a transferência.

⚠️ `conta_pendente` e `conta_indisponivel` são desfechos **distintos**: dizer
*"aguardando aprovação"* a quem foi bloqueado manda esperar por algo que ⛔ não
vai acontecer.

⚠️ **Sem sessão anônima o comportamento ⛔ não muda** — conta `pendente` instala
sessão e é barrada na UI, porque ⛔ não há posse anônima a preservar e o JWT dela
⛔ não lê ⛔ nada pela `pode_usar_clinico()`.

⚠️ **Risco residual assumido:** `sessions_timebox` e `sessions_inactivity_timeout`
são **0**, então a sessão anônima ⛔ não expira por tempo. O que resta é perder o
aparelho ⛔ ou limpar o storage antes da aprovação — e por isso a superfície
anônima **deve dizer** que o histórico está preso àquele aparelho até transferir.

### ⚠️⚠️ A ORDEM DE ATIVAÇÃO — e por que a primeira que escrevi era PROIBIDA

⛔ A versão anterior desta dívida dizia *"habilitar Anonymous Sign-In → migration
→ claim → cliente"*. ⛔ **Essa ordem quebra o app**, e a prova já estava na
própria auditoria: sem a guarda no `on_auth_user_created`, o **segundo** usuário
anônimo colide em `app_users_email_key`, porque os dois inserem `email = ''`.
⚠️ Eu tinha o fato e escrevi a sequência que o contradiz.

⚠️⚠️ E o erro simétrico é igualmente grave: aplicar a RLS final **antes** de o
cliente obter identidade anônima retira o acesso público ⛔ sem que exista dono —
o app não-autenticado para de funcionar por completo.

| Fase | O que entra | Por que ⛔ não pode vir antes |
|---|---|---|
| **1 · compatibilidade** | `20260830190000_compatibilidade_identidade_anonima` — guarda de `is_anonymous` no trigger, FK para `auth.users`, coluna+índice, carimbo do dono na escrita | ⚠️ **Inerte** para quem usa o app: ⛔ nenhuma política muda. É pré-requisito de habilitar o login anônimo |
| **2 · infraestrutura** | implantar `claim-anonymous-sessions`; publicar o cliente com `garantirSessaoAnonima()`, que **falha fechado** (422 ⇒ `false`) enquanto o recurso estiver desligado | ⚠️ ⛔ Sem isto, habilitar o recurso deixaria o app chamando um endpoint inexistente |
| **3 · habilitar** | ligar Anonymous Sign-In; confirmar que usuário sem login recebe `auth.uid()` válido e passa a criar sessões **já com dono** | ⚠️ ⛔ Antes da Fase 1, quebra no segundo anônimo |
| **4 · fechar o P0** | `20260830191000_fecha_leitura_publica_de_sessoes`, em **uma transação** | ⚠️ ⛔ Antes da Fase 3 ⛔ não existe dono, e o acesso público some sem substituto |

### ⚠️ O intervalo entre a Fase 3 e a Fase 4

⚠️⚠️ **A Fase 1 já carimba o dono na escrita.** Isso ⛔ não é detalhe: durante toda
a janela entre 3 e 4, as sessões novas ⛔ já nascem com `user_id` preenchido. Quando
a Fase 4 rodar, ⛔ não há um lote de linhas órfãs recém-criadas para lamentar —
⛔ só as legadas, que já eram órfãs antes de tudo isto começar.

⚠️ ⛔ Não há como tornar 3 e 4 atômicas: uma é configuração do GoTrue, a outra é
DDL. ⛔ Inventar um acoplamento entre as duas criaria a dependência circular que o
autor proibiu. ⚠️ O que **dá** para fazer, e está feito, é encurtar a janela de
conserto: a reversão está escrita e pronta em
`supabase/reversoes/20260830191000_reverte_fechamento.sql`.

### ⚠️⚠️ O que a Fase 4 custa, dito sem rodeio

As **536** sessões com `user_id IS NULL` deixam de ser acessíveis pelo cliente e
viram **legacy orphaned** — acessíveis ⛔ só ao `service_role`. É a regra dada:
⛔ `user_id IS NULL` ⛔ não é posse. Recuperá-las para alguém é **decisão de dados**
separada, ⛔ e ⛔ não efeito colateral de uma migration de segurança.

⚠️ Mudança visível de produto na Fase 4: hoje a tela de histórico lista as
sessões de **todos**; depois, ⛔ só as suas. Isso ⛔ **é** a correção do P0, ⛔ e ⛔ não
um dano colateral dela.
