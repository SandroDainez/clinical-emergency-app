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

**Duas vezes nesta auditoria começou-se a construir um verificador que JÁ
EXISTIA** — a lista de siglas do D-3 e a alcançabilidade do grafo (`test:arvores`,
que cobria tudo o que eu ia escrever e já estava no pipeline). Nas duas o
instrumento estava correto e completo. **A lacuna era do inventário, não da
cobertura.**

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

**Nasceu do CAD/EHH**, que citava o consenso ADA/EASD 2024 no id, no cabeçalho e
nas evidências, e carregava **sete números de 2009**. Registrado no METODO como
acréscimo ao R-52 — a má atribuição de procedência pela versão INTERNA, que é
pior que a externa porque ninguém desconfia do próprio repositório.

**A pergunta:** quantos outros módulos fazem o mesmo?

**O método, para quando for varrido:** para cada módulo que cite ano de
diretriz, escolher **um** número que mudou entre a versão citada e a anterior, e
conferir. Se estiver na versão antiga, o módulo inteiro entra em suspeita — a
falha é de processo (texto revisado, números não), e não é pontual.

**Candidatos óbvios, pela quantidade de anos citados:** ACLS/AHA 2025, SSC 2026,
AHA/ASA 2026 (AVC), a diretriz de TEP 2026, BTF (TCE). Vários já foram
auditados nesta fase com a fonte aberta — o que reduz o risco, mas não o
elimina, porque a auditoria conferiu o que estava em questão, não todos os
números.

**Não varrido. Fecha módulo a módulo, ou num bloco próprio.**

---

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

