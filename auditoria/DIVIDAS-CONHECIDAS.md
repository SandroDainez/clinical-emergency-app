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

## D-16 · Cinco módulos mandam cronometrar e não cronometram

A Anafilaxia ganhou cronômetro (bloco próprio, `test:cronometro`). Faltam cinco,
com o número de prazos acionáveis em minutos que cada um declara:

| Módulo | Prazos | Exemplo |
|---|---|---|
| **EAP** | 4 | *"titular 5–10 mcg/min a cada 5 min"* |
| **Eclâmpsia** | 3 | *"repetir a cada 15 min"* (gluconato de cálcio) |
| **Ventilação** | 2 | *"Repetir gasometria em 30 min"* |
| **Convulsões** | 1 | *"repetir 1× em 5 min"* |
| **Vasoativos** | 1 | *"Titular a cada 5 min"* |

**Por que não é urgente como foi a Anafilaxia:** ali o intervalo de 5 min entre
doses IM É o tratamento, e a falha clássica do quadro é dar uma dose e esperar
demais. Nos cinco acima o prazo acompanha titulação ou reavaliação laboratorial —
importa, mas não é o próprio tratamento.

**Por que também não é opcional:** a infraestrutura está pronta (`TimerState`,
`getTimers`, o badge no `protocol-header-card`), o padrão está estabelecido em
dois módulos, e prazo que o app manda cumprir e não mede é decorativo — mesma
família do teto que nunca vincula.

`test:prazos` mantém os cinco visíveis como aviso a cada execução.

---

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

## D-18 · TC de controle de rotina no TCE — ressalva pendente de fonte

O marco foi resolvido (D-17): a linha agora diz **"Repetir TC em 6–12 h da TC
INICIAL ou se houver qualquer deterioração neurológica"**.

**O que ficou aberto:** a literatura recente sugere que, no paciente **estável e
sem deterioração**, a TC de controle DE ROTINA tem benefício questionável — o
gatilho que importa é o clínico, que a linha já traz. Há trabalhos indicando que
o controle pode ser adiado com segurança e que a repetição de rotina em
anticoagulado sem deterioração pode não ser indicada.

**Por que não entrou:** é MUDANÇA DE RECOMENDAÇÃO, e o padrão desta auditoria é
trazer a fonte primeiro — com o que ela sustenta **e o que não sustenta** — para
o Sandro decidir. As referências que apareceram na busca são de TCE **leve**, e
o nó do app trata TCE em geral: aplicar sem ler o desenho de cada uma seria o
erro do ART outra vez (citar estudo para sustentar conclusão que ele não
sustenta, D-6).

**O que fazer quando voltar:** abrir os trabalhos, verificar a população (leve ×
moderado/grave, anticoagulado × não), e só então propor a redação.

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
