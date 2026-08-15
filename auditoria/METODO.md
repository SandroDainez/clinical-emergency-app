# Método da auditoria

Regras que nasceram de erro cometido, não de preferência. Cada uma tem o caso
que a originou escrito junto — sem o caso, uma regra vira folclore e alguém a
descarta por parecer burocracia.

---

## R-1 · Nenhuma trava é aceita sem uma mutação que a derrube

**Toda verificação nova entra com a mutação que a valida documentada ao lado.**
No cabeçalho do script, no commit, ou nos dois. A mutação tem de ser executada
e o resultado, visto — não descrita como intenção.

**Por que virou regra escrita.** Ao longo desta auditoria foram escritas **cinco
regras incapazes de falhar**. Todas foram pegas, mas por hábito, e hábito é o
que falha na sessão em que se está com pressa:

| Regra | Por que não podia falhar |
|---|---|
| `UI/min` proibido em doses | o termo não estava no `assunto`, então a regra nunca era consultada |
| "12 mg … 12 mg" como alternativa | a condição era sempre verdadeira |
| campo obrigatório no motor | a mutação escapava por um caminho não coberto |
| `norepinefrina` na lista de sinônimos | faltava o sinônimo que a regra dependia de encontrar |
| preparo inicial × solução padrão | os dois lados saíam da **mesma função** depois da correção |

A quinta é a mais instrutiva: a regra estava certa **antes** da correção e ficou
tautológica **por causa** dela. Refatoração pode esvaziar uma trava sem tocar
nela — por isso a mutação se refaz quando o código ao redor muda, não só quando
a trava nasce.

**Uma regra tautológica é pior que nenhuma regra:** ocupa o lugar da proteção,
aparece verde no pipeline, e ninguém volta a olhar.

---

## R-2 · O veredicto é o código de saída, nunca o texto impresso

**Toda trava termina em `process.exit(falhas ? 1 : 0)`.** Nenhum harness conta
`❌` na saída, e nenhuma verificação conclui nada a partir do que foi impresso.

**Por que virou regra escrita.** Um harness desta auditoria usava
`grep -c "❌"` para contar mutações detectadas. Quando o processo **morria**, a
contagem dava zero — e zero era lido como *"a mutação escapou"*. O instrumento
relatava o oposto do que acontecera, e por um tempo a evidência da auditoria
veio de um aparelho com falso-negativo conhecido.

Três ocorrências da mesma família:

1. `grep -c "❌"` contando 0 no processo morto.
2. `test-motor-arvore.cjs` com `advance()` sem envelope — morria em vez de
    relatar, produzindo "0 falhas".
3. `valida-vasoativos.cjs` — remover o campo `fonte` derrubava o `tsc`, e o
    script morria com stack trace solto em vez de dizer o que houve.

**Consequência prática:** compilação, leitura de arquivo e qualquer subprocesso
entram em `try`, e a falha é **relatada** antes de sair com 1. Morrer é aceitável;
morrer em silêncio, não.

---

## R-3 · Detectar não é travar

**Script cujo nome promete um portão (`test:`, `valida-`) sai 1 quando acha
erro.** Script que só mapeia (`mapa:`, `audit:`) sai 0 por desenho — e diz isso
no próprio texto, para ninguém confundir mapa com portão.

**Por que virou regra escrita.** `auditoria-maquinas-estado.cjs` imprimia
*"Erros estruturais: 11"* e saía **0**. Detectava perfeitamente e o pipeline
seguia satisfeito.

E o caso maior: **sete travas de build não estavam no `test:all`.** Cada uma
escrita, testada por mutação, declarada trava — e nenhuma ligada ao portão.
Sete portas trancadas num muro sem portão. Hoje `test:pipeline` cobre isso: toda
trava nova nasce ligada ou o build cai no mesmo dia.

---

## R-4 · O ônus da prova é do descarte, não do achado

**Verifique o instrumento antes de agir sobre o achado — mas nunca feche um
achado como falso positivo sem demonstrar por quê.**

Os instrumentos desta auditoria produziram falsos positivos com frequência
(RASS lido com o menos tipográfico errado, "2000 mL" lido como ano, sete nós de
prosa clínica confundidos com evidência desatualizada). Isso justifica
**conferir**, não **presumir**. A assimetria importa: presumir que o achado é
ruído racionaliza defeito verdadeiro, e o custo dos dois erros não é o mesmo
num app de beira-leito.

---

## R-5 · Número clínico não se altera de memória

**Toda mudança de dose, faixa, limiar ou apresentação vem com a fonte primária
consultada na hora** — diretriz com ano, ou bula/registro. Se a fonte não foi
aberta nesta sessão, a mudança não acontece.

**Por que virou regra escrita.** Duas vezes a memória divergiu da fonte:

- "20 mL/kg é o padrão de cristaloide na anafilaxia" — é a dose **pediátrica**;
  no adulto é 1–2 L. O app já estava certo.
- A dopamina entrou com a ampola **norte-americana** (40 mg/mL) num app
  brasileiro. A ampola daqui é 5 mg/mL × 10 mL. Fator 8, para menos, num
  vasopressor — e o próprio app já trazia a ampola certa em outra tela.

Corolário: **apresentação farmacológica é número clínico.** Toda ampola
cadastrada declara `fonte`, e o build recusa quem não declarar.

---

## R-6 · Droga com mais de uma apresentação no Brasil não pode ter apresentação implícita

**Ou o app oferece as duas, ou declara no conteúdo visível qual assume e por
quê.** Nunca deixa a escolha acontecer no silêncio.

**Por que virou regra escrita.** Dois defeitos de aparência oposta e mecanismo
idêntico:

- **Dopamina:** o app trazia a ampola **errada** (americana, 40 mg/mL) num país
  onde a ampola é 5 mg/mL. O médico assumiu que a tela descrevia o que ele
  tinha na mão.
- **Sedoanalgesia:** o app traz **uma** ampola por droga, e todas conferem —
  mas propofol, midazolam, morfina e dexmedetomidina têm **outra** apresentação
  circulando no Brasil. O médico com a outra na mão assume que a única listada
  é a dele.

Errar a apresentação e omitir a segunda produzem o **mesmo** engano: *o que
está na tela é o que está na minha mão*. Uma tela que oferece uma opção não
está informando — está afirmando.

**Consequência prática:** cadastro de apresentação declara `fonte` (R-5) **e**
responde se existe outra no mercado. Se existe e não é oferecida, a tela diz
qual assumiu. O silêncio é que está proibido — não a escolha.

### Refinamento — quando a apresentação alternativa é de OUTRA VIA

**Declarar não é oferecer.** Se a segunda apresentação existe para uma **via
diferente**, ela entra como **aviso**, nunca como opção selecionável.

**O caso.** A morfina tem, no Brasil, 10 mg/mL e 1 mg/mL para uso IV — e
**Dimorf 0,1 e 0,2 mg/mL para uso PERIDURAL/INTRATECAL**, sem conservantes.
Colocá-las na lista de apresentações de um módulo que calcula infusão IV
convidaria ao erro **dos dois lados**: 10 mg/mL por via intratecal é
catastrófico; 0,2 mg/mL por via IV é subdose de **50×**.

**Aqui a regra original vale ao contrário.** "Uma tela que oferece uma opção
está afirmando" — e oferecer a ampola peridural entre as opções de infusão IV
**afirmaria que ela serve para isso**. O que protege é nomeá-la com a via
explícita e o veto de uso, fora da lista de escolha.

**Consequência para a trava:** não basta conferir que a apresentação de outra
via está **citada**. É preciso garantir que ela **não seja selecionável** — que
não apareça em `presentations` nem em `standardSolutions`.

---

## R-7 · Conteúdo clínico nunca se edita por índice posicional

**Sempre por âncora de nome ou `id`.** Nada de `linhas[idx[2]]`, `DRUGS[3]`,
"a terceira ocorrência". Se o alvo é a atropina, o código diz *atropina*.

**Por que virou regra escrita.** A fonte de bula da atropina foi aplicada por
posição — e caiu na **adenosina**. A atropina é a 4ª droga da lista, não a 3ª.
O card da adenosina passou a citar apresentações de atropina; o da atropina
ficou sem fonte.

**Por que esta classe é pior que a da dopamina.** Ela **falha em silêncio**. A
dopamina tinha um número errado que a aritmética podia denunciar, e hoje uma
trava a pega. Aqui não havia nada a denunciar: o campo `fonte` existia, tinha
conteúdo plausível, o `tsc` passava, os 16 fatos clínicos passavam, as 19 travas
passavam. O texto estava certo — no lugar errado.

**É o único defeito desta auditoria inteira que dependeu de leitura humana para
aparecer.** Foi pego relendo o resultado do próprio comando, não por
verificação. Nenhum instrumento apontou.

**Corolário operacional:** edição em lote de conteúdo clínico se confere
imprimindo o par (âncora → valor aplicado) e lendo, antes de seguir. E onde der,
o dado carrega a própria âncora — ver a trava de pertencimento em
`valida-consistencia-clinica.cjs`, que faz fonte trocada de posição não casar.

---

## R-8 · Regra que depende de vocabulário enumerado precisa de um segundo sinal com o defeito oposto

**Toda lista escrita à mão subnotifica por construção**, e fura de novo a cada
termo que alguém inventa. A correção **não é ampliar a lista** — é somar um
segundo sinal **ruidoso e sem vocabulário**, e criar um **balde de incerteza**
entre os dois. O instrumento passa a degradar para **dúvida** em vez de
**acusação falsa**.

**Por que virou regra escrita.** Três vezes, com três listas diferentes:

| Lista | O que faltava | Consequência |
|---|---|---|
| sinônimos de fármaco | `norepinefrina` | a regra nunca disparava — tautologia (R-1) |
| siglas de sociedade | `ATS`, `ACCP`, `SBPT`, `ERS`, `ESICM` | ventilação acusada de não citar fonte |
| fármacos que exigem dose | nome novo entra à mão | prescrição sem dose passa batido |

O caso das siglas foi o mais caro: o inventário exigia o ano colado a uma sigla
conhecida, tinha `AMIB` e não tinha `ATS` — então *"Elegibilidade (ACCP/ATS
2017)"* não contava, e a ventilação entrou no D-3 como "sem fonte citada"
quando cita seis. **O erro não ficou na lista: o D-3 foi usado para ordenar a
auditoria**, então decisões de sequência saíram de dado errado.

**A forma da correção, que é o que se reaproveita:**

- **Sinal A — preciso e estreito.** Depende do vocabulário. Quando acerta,
  afirma com confiança. Quando o vocabulário fura, **cala**.
- **Sinal B — ruidoso e cego.** Não depende de vocabulário nenhum (aqui:
  qualquer ano no texto, inclusive o "2000" de *2000 mL*). Erra para mais,
  **nunca subnotifica pelo motivo do A**.
- **O balde do meio.** A ≡ vazio **e** B ≡ vazio → o achado é real. A vazio e B
  cheio → **provavelmente o vocabulário furou; ler antes de acusar.**

Sem o balde, o instrumento tinha duas saídas e a errada era afirmativa. Com ele,
a saída do meio é uma pergunta — e pergunta não corrompe decisão de prioridade.

**Corolário:** ao herdar qualquer verificação baseada em lista, a primeira
pergunta não é *"a lista está completa?"* (nunca está), é *"o que esta regra faz
quando a lista falha — cala ou mente?"*

---

## R-9 · Valor que atravessa módulos precisa de contrato, não de boa vontade

**Defeito não vive só dentro de módulo. Nasce também no CANAL entre eles** —
quando o mesmo valor tem significado diferente em cada ponta e é carregado de
um lado ao outro sem tradução.

**Por que virou regra escrita.** O campo `sexo` viajava pelo contexto do
paciente. O EAP gravava `"m"` para **Mulher**; o motor de ventilação lia
`/^m/i` como **Masculino**. Uma mulher registrada no EAP chegava à Ventilação
como homem — PBW +4,5 kg, Vt +27 mL, em SARA.

**Nenhuma das três implementações estava errada sozinha.** Lidas isoladamente,
as três eram defensáveis: cada uma coerente com o seu próprio domínio de
valores. O dano nasceu do trânsito.

**Por isso auditoria módulo a módulo nunca pegaria isso** — o erro não vive
dentro de módulo nenhum. Quem achou foi a trava de FONTE ÚNICA, ao cobrar que
a constante `152.4` aparecesse num arquivo só: ela tropeçou na terceira
implementação, e a terceira revelou o trânsito. **Foi o instrumento, não a
análise.**

**Consequência prática, em três exigências:**

1. **Domínio declarado.** Campo compartilhado tem conjunto de valores válidos
   escrito num lugar só, e quem escreve e quem lê usam o mesmo.
2. **Nada de `as`.** Ler do canal e afirmar o tipo com cast é fingir validação.
   Valor que entra pelo canal se NORMALIZA (e a normalização pode recusar).
3. **Recusar vence adivinhar.** Valor legado ou ambíguo → `null`, e o app
   pergunta de novo. Uma pergunta a mais custa segundos; herdar sexo trocado
   custa o Vt inteiro.

**Corolário de auditoria:** ao terminar cada módulo, perguntar não só *"está
certo aqui?"* mas *"o que este módulo escreve para os outros, e com que
significado?"*

---

## R-10 · Meça o EFEITO, não a GRAFIA

**Quando a pergunta é sobre comportamento, meça o comportamento.** Contar
ocorrências de uma string é instrumento grosseiro, e responde outra pergunta:
*"como isto está escrito?"* em vez de *"o que isto faz?"*

**Por que virou regra escrita.** Três leituras erradas nesta auditoria, todas
por contar grafia:

| Medição | O que disse | O que era |
|---|---|---|
| ocorrências de `mg/kg` por módulo | politrauma **não tem** dose por peso | calcula `peso × 15` e exibe **mL absoluto** — a string nunca aparece |
| anos citados no conteúdo | choque cita **diretriz de 2000** | era `2000 mL` de cristaloide |
| faixa exibida × faixa calculada | RASS com faixa **errada** | o app usava o menos tipográfico `−` (U+2212); o parser lia hífen |

Nos três casos o app estava certo e o instrumento errado — e nos três o erro
foi pego **relendo o resultado**, não por outra verificação.

**Um quarto caso, na direção oposta — a grafia escondeu um efeito real.** A
trava de dobutamina (D-11) exigia o nome da droga e a dose numéricos na MESMA
linha. Em `recs.push({ title: "🚨 Dobutamina...", lines: ["Dose inicial: 2–3
mcg/kg/min..."] })` o nome está no `title`, a dose numa string adiante do array
`lines` — linhas diferentes, e a trava nunca via a divergência (uma oitava
afirmação de dose, piso 2–3 nunca convertido para a fonte única). A correção
não foi alargar a grafia (uma janela de N linhas): isso teria acendido em
qualquer bloco de OUTRA droga que mencionasse "dobutamina" de passagem na
prosa — provado por mutação antes de descartar a abordagem. A correção certa
rastreia o `title:` ativo do bloco, que é a unidade real que a pergunta
"nome e dose bateram?" precisa comparar.

**A forma certa, nos mesmos três casos:** contar a aritmética (`peso *`), exigir
procedência junto do ano (R-8), e comparar o número **derivado dos pesos** com o
número **exibido**, normalizando os sinais.

**Corolário, e é o mais importante:** a releitura do próprio resultado é **parte
do método**, não zelo extra. Três achados desta auditoria — este, o `152.4` do
EAP e a fonte da atropina na adenosina — só existiram porque alguém leu de novo
o que o comando devolveu.

---

## R-11 · Região de aviso que às vezes fica em branco ensina a ignorar a região

**Aviso ausente e aviso negativo não são a mesma coisa.** "Peso aferido"
**informa**; branco **treina a não olhar**. Onde a tela reserva um lugar para
uma ressalva, esse lugar diz algo sempre — inclusive quando a notícia é boa.

**Por que virou regra escrita.** A ressalva de peso não aferido é interpolada
por um token (`{avisoPeso}`) na linha da dose dos módulos com teto. A saída
óbvia era devolver string vazia quando o peso fosse aferido — e ela produziria
um item de lista em branco no meio das doses.

O custo não é estético. O leitor aprende, em poucas telas, que **aquela posição
costuma estar vazia**, e para de olhar. Quando o aviso finalmente aparece, ele
cai numa região que o olho já treinou a pular — exatamente no atendimento em que
importava.

**Vale para qualquer região persistente da tela**, não só esta: rodapé de
ressalva, faixa de alerta, coluna de observação. Se o lugar existe, ele fala.

**Corolário:** e o inverso também — região que fala o tempo todo com a mesma
frase vira mobília. O aviso negativo é curto e factual ("peso aferido"), o
positivo é longo e acionável. A diferença de peso visual é o que mantém o olho.

---

## R-12 · Fonte única se cria quando a divergência é pequena, não quando dói

**Ao encontrar o mesmo número clínico em mais de um lugar, unifique — mesmo que
os valores ainda concordem.** Fonte única não é conserto: é prevenção, e custa
uma fração do que custa depois.

**Por que virou regra escrita.** Duas vezes, com desfechos opostos:

- **Peso predito** — três implementações, descobertas **depois** de discordarem
  em produção, uma delas trocando o sexo do paciente entre módulos. Custou uma
  varredura, um bloco de segurança, 346 verificações e um push urgente.
- **Alvos do TCE** — cinco lugares, três valores de PaCO₂ (35–45, 35–40,
  35–38). Descobertos com a divergência ainda **dentro da tela**, sem dano
  atribuível. A fonte única saiu antes de o sexto lugar nascer.

O segundo caso só foi barato porque o primeiro tinha ensinado onde olhar.

**O gatilho é o número aparecer duas vezes**, não ele estar errado. Quando a
divergência já é sentida, a unificação vem acompanhada de decidir *qual valor
vale* — que é decisão clínica, cara, e precisa de fonte primária.

**Corolário:** a pergunta ao terminar um módulo não é só *"os números estão
certos?"*, é *"quantos lugares deste app escrevem este número?"*

**O terceiro caso, e o mais forte — a disciplina protegeu contra um defeito que
ninguém sabia que existia.** Ao descobrir que `anafilaxia-engine.ts`,
`eap-engine.ts` e `ventilation-engine.ts` são inalcançáveis pela tela real (a
tela roda `*-decision-tree.ts`, um arquivo separado), a pergunta era: quantas
das correções clínicas da Fase 1 nesses engines nunca chegaram ao usuário?
Resposta: quase nenhuma — porque a dobutamina (D-11), a tabela PEEP/ART, os
alvos do TCE e o peso predito já tinham sido movidos para `lib/*.ts` **por
disciplina de fonte única**, e as árvores vivas importam da MESMA fonte. A
única baixa real foi o item que nunca tinha sido unificado: succinilcolina/IOT
na Sepse, escrito só em prosa dentro do engine morto. R-12 não foi criada
pensando em alcançabilidade de tela — foi criada por peso predito discordando
em produção. Mas o efeito colateral é este: fonte única não protege só contra
divergência de VALOR, protege contra a ROTA morrer debaixo do conteúdo sem
ninguém perceber.

---

## R-13 · Achado de ausência é a classe mais frágil de achado

**Achado de ERRO é auto-verificável:** o número errado está lá, lê-se e confere.
A dopamina com ampola americana, o `/^m/i` lendo "Mulher" como masculino, a
fonte da atropina na adenosina — todos apontáveis com o dedo.

**Achado de AUSÊNCIA exige provar que algo NÃO existe**, e a busca textual
sub-reporta sistematicamente o que já está lá com outras palavras. Não há como
"ler e conferir" um vazio.

**Por que virou regra escrita.** O #7 da ventilação foi inflado **duas vezes,
pelo mesmo mecanismo**:

1. *"O TCE não tem alvo ventilatório em lugar nenhum do app."* Tinha — PaCO₂
   35–45, em três lugares, dentro de linhas que começavam com `"Metas:"`. A
   busca foi por "conduta ventilatória"; o conteúdo estava sob outro rótulo.
2. Corrigido o primeiro, sobrou *"falta a proibição de hiperventilação
   profilática"*. Também já estava, no nó inicial do ABCDE.

Nos dois casos a busca foi por **frase**, não por **efeito** — R-10 aplicado ao
avesso: lá eu contei grafia e perdi comportamento; aqui procurei um rótulo e
não achei o conteúdo que existia sob outro nome.

**A regra:**

- Antes de afirmar que algo falta, varra pelo **EFEITO clínico** — o número, a
  conduta, o parâmetro — e nunca pelo rótulo que se espera encontrar.
- **Declare no relatório onde procurou.** "Não achei" sem dizer onde é uma
  afirmação sem lastro.
- **Rotule o achado**: *"este é achado de ausência, verificado por X"*. Achado
  de erro e achado de ausência não merecem a mesma confiança, e quem lê o
  relatório precisa saber qual dos dois está recebendo.

**E a parte que é sobre a dinâmica, não sobre o código.** As duas versões
infladas foram aceitas sem questionamento, e a prioridade do #7 foi elevada a
"alta" com base na primeira. As duas correções vieram da verificação, não da
revisão. Um achado de ausência mal rotulado não engana só quem o escreve: ele
desloca a ordem da auditoria inteira, como o D-3 já tinha deslocado. Por isso o
rótulo é obrigatório — ele existe para que o outro lado possa calibrar em vez
de aceitar.

---

## R-14 · Número vizinho ao da literatura não é erro até se saber qual desfecho cada um mede

**Quando um número do app difere do "número conhecido", a primeira pergunta é o
que cada um PREDIZ — não qual está certo.**

**Por que virou regra escrita.** O ISR usa índice de choque **> 0,9**; a
literatura de hipotensão peri-intubação trabalha com **> 0,8**. Parecia
divergência, e foi listada como achado de baixa gravidade a conferir.

Não era divergência. São **desfechos diferentes**:

| Limiar | O que prediz |
|---|---|
| **0,8** | hipotensão pós-intubação |
| **0,9** | colapso/PCR peri-intubação (Heffner, *J Crit Care* 2013) |

E o texto do app afirmava exatamente *"prevê colapso peri-intubação"* — o
desfecho do 0,9. **Trocar 0,9 por 0,8 teria sido regressão disfarçada de
correção**: o número passaria a não corresponder à frase que o acompanha.

**O que se faz em vez de trocar:** citar a fonte e escrever a distinção, para
que o próximo leitor não repita a dúvida. O número ficou; o texto ganhou o
porquê.

**Corolário, e vale para todo par de números próximos:** dose, limiar, faixa e
alvo só são comparáveis quando medem a mesma coisa na mesma população. Antes de
alinhar dois números, alinhe as perguntas que eles respondem.

---

## R-15 · A trava nasce testando o que o autor ACHA que ela testa

**R-1 diz que toda trava precisa de uma mutação que a derrube. R-15 é sobre o
que fazer ANTES — porque a mutação é cara e a maioria das falhas é evitável por
construção.**

**O número que originou a regra.** Das 10 travas escritas ou modificadas nesta
auditoria, **8 precisaram de correção depois de escritas** — 16 correções ao
todo, com 4 concentradas em duas travas. Não é ruído: é a taxa normal. A trava
nasce testando a intenção do autor, e só a mutação revela o que ela testa de
fato.

### As 16 falhas, em cinco famílias

| Família | Casos | O que a trava fazia |
|---|---|---|
| **Tautologia** — não podia falhar | 6 | termo fora do `assunto` · condição sempre verdadeira · sinônimo faltando · os dois lados saindo da mesma função após refatoração · exceção incapaz de disparar · **import satisfazendo "consumo"** |
| **Leitura cega** — não encontrava e seguia | 4 | janela de regex curta + `continue` silencioso · falta de fronteira (`CENARIOS_ANTIGO` casando com `CENARIOS`) · extrator parando no `;` dentro da string · lendo o COMENTÁRIO que narra o defeito |
| **Morte silenciosa** — morria em vez de relatar | 4 | `grep -c "❌"` no processo morto · `advance()` sem envelope · `tsc` caindo sem relato (2×) |
| **Detecta e não trava** | 1 | imprimia "11 erros" e saía 0 |
| **Expectativa datada** | 1 | codificava o fluxo antigo e acusou a correção legítima |

### O que a trava precisa provar antes de ser aceita

1. **Meça o EFEITO, não a menção.** Antes de conferir conteúdo, remova
   comentários **e imports** — os dois contêm o texto procurado sem exibir nada.
   Foi assim que um módulo que importava e não usava manteve a trava verde.
2. **Toda leitura que pode não encontrar FALHA — nunca `continue`.** Regra que
   "não achou e seguiu" não protege: ela some do relatório sem uma linha de
   aviso. Se o formato mudou, isso é o achado.
3. **Casamento por nome carrega fronteira.** `CENARIOS` casa `CENARIOS_ANTIGO`
   sem `(?![\w$])`. Prefixo é a forma mais comum de falso verde.
4. **Toda exceção precisa ser demonstrada disparando.** Exceção que nunca
   dispara mente sobre o alcance da regra — sugere que ela pegaria o caso, e
   não pega. Se o `assunto` já exclui, a exceção é código morto: remova.
5. **Subprocesso entra em `try`, e a falha é RELATADA antes do `exit 1`.**
   Morrer é aceitável; morrer em silêncio é indistinguível de aprovar (R-2).
6. **Distinga INVARIANTE de ESTADO ATUAL.** Trava que fotografa o valor de hoje
   passa trivialmente e acusa a próxima correção legítima. Pergunte: *"isto
   nunca deve mudar, ou apenas não mudou ainda?"* Só a primeira vira trava.
7. **A mutação vive no CÓDIGO, nunca no teste** — e é aplicada em **TODAS as
   ocorrências**. Alterar a expectativa para ver a trava falhar prova nada.
   E a mutação parcial é pior que inútil: se a constante existe em três pontos
   e você muta um, **o app segue correto e a trava passa com razão** — o que se
   lê como fuga é acerto.

   **Causa raiz identificada, e é de ferramenta:** `perl -0pi -e 's/…/…/'`
   **sem `/g`** substitui só a primeira ocorrência. Aconteceu **três vezes**
   nesta auditoria — o aviso do rocurônio (2 linhas), o `{avisoPeso}` do TEP
   (2 linhas) e o teto de 8 mEq da hipernatremia (**3 pontos** no arquivo).

   **Deixou de ser lição e virou regra de comando:** toda mutação por `perl`
   usa `/g`, e o passo seguinte é **contar as ocorrências restantes** antes de
   rodar a trava. Se sobrou alguma, a mutação não existiu.
8. **A mutação precisa provar que CRIOU O DEFEITO, não só que foi aplicada.**
   **Três vezes** nesta auditoria uma mutação removeu **redundância** em vez de
   proteção — o aviso do rocurônio sobrevivia noutra linha, o veto do etomidato
   sobrevivia no `alert`, o "ROSE" sobrevivia em `reference:`. Nos três casos o
   app continuava **correto** depois do mutante, e a trava passar era o
   comportamento certo. Antes de chamar de fuga, leia o alvo pós-mutação e
   pergunte: *isto ainda está certo?* Se estiver, a mutação é que era fraca —
   remova **todas** as ocorrências e refaça.

9. **Conferência que roda sobre NADA passa por VACUIDADE — e é falso verde.**
   Ao ampliar a trava do debrief para cobrir as causas abordadas, ela acusou o
   próprio autor: o cenário não marcava nenhuma causa, então a conferência
   comparava lista vazia com lista vazia e passava. Teria ficado verde para
   sempre, sobre um campo que ninguém estava protegendo.

   **A regra é: corrigir o CENÁRIO, não remover a conferência.** E a trava
   precisa acusar a própria vacuidade — não basta o autor lembrar. As três
   formas usadas: `if (antes.addressedCauses.length === 0) falhas.push(...)`,
   `if (antes.shockCount < 2) falhas.push(...)`, `if (vistos < 40)
   falhas.push("universo pequeno demais para valer como trava")`.

   **É prima da mutação que não chegou a ser aplicada (item 8).** Nos dois
   casos a trava passa e o verde não significa nada: lá porque o defeito não
   foi criado, aqui porque o objeto da conferência não existia. A pergunta é a
   mesma — *o que exatamente essa passagem prova?*

10. **Quando a correção muda a ESTRUTURA do conteúdo, a trava muda junto.**
   Trava que só passa na forma ANTIGA está errada mesmo estando verde. A trava
   dos antídotos lia o texto em volta da prescrição — e parou de funcionar
   assim que a correção fez a coisa certa e moveu tudo para constantes de fonte
   única: o bloco passou a conter identificadores e nenhum sinal. Ela acusaria
   justamente o app corrigido.

   **É a segunda desta classe**, e por isso vale como padrão e não como acaso:
   a primeira foi a expectativa que codificava o fluxo antigo dos nós. Sempre
   que uma correção mover conteúdo — inline → constante, literal → derivado,
   duplicado → fonte única —, releia a trava perguntando *ela ainda enxerga o
   que passou a existir?* O verde dela, nesse momento, não é evidência de nada.

10. **IMPORT NUNCA SATISFAZ CONSUMO — regra fixa, não correção caso a caso.**
    Nenhuma verificação de consumo pode se dar por satisfeita com a linha de
    `import`. O nome da constante aparece nela, e apagar o USO deixa a trava
    verde sobre um módulo que já não mostra nada.

    **Terceira e quarta ocorrências fecharam a regra.** A primeira estava na
    tabela das 16 falhas ("import satisfazendo consumo"); a segunda foi o
    fentanil; a varredura retroativa que se seguiu achou mais duas —
    `valida-dobutamina` (apagar `DOBUTAMINA_INICIO` do EAP: exit 0) e
    `valida-osmolaridade` (apagar `OSM_EFETIVA_VS_TOTAL` da árvore da CAD:
    exit 0). Quatro vezes é mecanismo, não descuido.

    **Como se prova, sempre:** removendo o USO, mantendo o import, e
    confirmando que a trava CAI. Não basta remover a constante inteira — isso
    leva o import junto e testa outra coisa.

    **Como se escreve:** tirar imports e comentários antes de conferir, ou
    ancorar a busca num BLOCO do arquivo em vez do arquivo inteiro (é o que
    `valida-calculadoras` já fazia, e por isso passou na varredura).

11. **Correção da trava que REDUZ achados: confira um a um o que sumiu.**
    As auto-acusações não são todas da mesma classe. A trava do teto por kg
    produziu quatro, e as três primeiras **acusavam inocente** — teto por quilo
    lido como absoluto, velocidade de infusão lida como teto, dose atribuída ao
    fármaco errado da linha. A quarta fez o oposto: **silenciou culpado.** Ela
    conferia só a primeira dose por kg de cada linha, e por isso
    `"Ketamina 1–2 mg/kg + Succinilcolina 1,5 mg/kg"` era descartada na cetamina,
    que não tem teto, antes de chegar à succinilcolina, que tem.

    **A assimetria é o que importa.** Falso positivo se descobre sozinho —
    alguém investiga o alerta e percebe que não era nada. **Falso negativo não
    tem quem o investigue**: o achado sumiu entre duas execuções e só reapareceu
    porque eu tinha o resultado anterior aberto para comparar.

    **Consequência prática:** toda vez que uma correção na trava REDUZIR o
    número de achados, percorra o que sumiu item a item e classifique — era
    falso positivo, ou ficou invisível? Trava mais silenciosa não é
    necessariamente trava melhor.

11. **`git checkout` desfaz mais do que a mutação.** Já apareceu três vezes,
    de três jeitos: com caminho inexistente aborta tudo e não restaura nada; em
    arquivo com alteração NÃO COMMITADA reverte para o HEAD e apaga o trabalho
    da sessão; e em `package.json` apagou o registro de uma trava nova, fazendo
    a mutação seguinte não aplicar — o controle ficou verde por não ter alvo.
    **Restaurar sempre por cópia do scratchpad**, e conferir que a mutação
    APLICOU antes de ler o veredito (item 7).

12. **Comando de restauração que falha inteiro.** Mesma família do `perl` sem
   `/g`, e igualmente invisível: `git checkout -- a.ts b.ts` com **um** caminho
   inexistente aborta a operação toda e **não restaura nem o arquivo válido** —
   `fatal: empty string is not a valid pathspec`. O controle seguinte roda sujo,
   com a mutação ainda aplicada, e o vermelho é lido como defeito do código.
   Restaurar **um arquivo por comando**, e conferir `git status` antes de
   declarar o controle verde.

**Corolário sobre o custo.** Os doze itens acima são checagem de escrita, não de
execução: custam minutos. As correções custaram rodadas inteiras de mutação,
e três delas só apareceram porque alguém releu a saída do comando. **Escrever
com a lista na mão é mais barato que descobrir por mutação** — e a mutação
continua obrigatória, porque a lista nunca vai estar completa.


## R-16 · O mesmo aviso em campos de pesos diferentes ensina que o risco é diferente

**Aviso igual, para drogas da mesma classe, vive no mesmo campo.** Quando o
mesmo risco aparece num campo de destaque para um fármaco e num campo discreto
para outro, o de menor peso **ensina que aquele risco é menor** — e a diferença
de peso é lida como informação clínica, porque é assim que a tela fala.

**Por que virou regra escrita.** O aviso *"nunca bloquear sem sedação e
analgesia — o paciente paralisado e mal sedado está acordado, sentindo, e sem
como avisar"* vivia em `alert` no cisatracúrio e no atracúrio, e em `info` — de
menor destaque — no **rocurônio**.

O rocurônio é o BNM mais dado em **bólus por quem está com pressa**, na ISR. Era
exatamente onde o aviso tinha menos peso, e exatamente onde ele mais importa.

**Este é o R-11 pelo outro lado.** Lá: região que às vezes fica em branco ensina
a ignorar a região. Aqui: mesmo conteúdo em pesos diferentes ensina que a
gravidade difere. Nos dois casos o que informa não é só o texto — é **onde ele
está**, e a tela nunca é neutra sobre isso.

**Consequência prática:** ao revisar uma família de fármacos, comparar os campos
**lado a lado**, não um a um. A assimetria só aparece na comparação — lendo o
rocurônio isoladamente, o aviso estava lá e parecia suficiente.


---

## R-17 · Constante derivável se RECALCULA, não se compara

**Quando um número do app pode ser derivado de um princípio, a trava o deriva —
e compara com o que está escrito.** Nunca compara o escrito com uma cópia do
escrito.

**Por que virou regra escrita.** A trava dos eletrólitos confere 513 mEq/L
(NaCl 3%), 3,42 mEq/mL (NaCl 20%), 154 (SF 0,9%) e 77 (NaCl 0,45%) **contra a
massa molar do NaCl (58,44)** — não contra uma lista de números esperados. O
mesmo vale para o cálcio elementar: 0,465 mEq/mL sai de
`100 mg/mL × (40,08 ÷ 430,4) ÷ 20,04`, e a razão 2,93× entre cloreto e
gluconato é recalculada a cada build.

**É a única classe de trava que um erro CONSISTENTE não atravessa.** Se alguém
escrever 500 mEq/L para o NaCl 3% no app e 500 na expectativa do teste, a
comparação passa e o erro sobrevive — foi assim que a dopamina americana
conviveu com um rótulo coerente. O recálculo não tem como concordar com o erro:
ele não lê o app para saber a resposta.

**Corolário:** a trava por comparação protege contra *mudança*; a trava por
recálculo protege contra *erro*. Onde o número for derivável, a segunda é
estritamente melhor — e custa as mesmas linhas.

**Onde replicar** — ver a dívida **D-9**, que lista as constantes deriváveis do
app ainda conferidas por comparação.

---

## R-18 · Documentação correta num módulo não protege o código de outro

**Quando a auditoria encontrar uma armadilha EXPLICADA em texto, o passo
seguinte é varrer quem mais faz aquele cálculo.** A explicação é indício de que
alguém já tropeçou ali — e escreveu o aviso onde tropeçou, não onde o defeito
mora.

**Por que virou regra escrita.** A osmolaridade calculada aparece em cinco
lugares do app. **Quatro estavam certos** — e um deles, o TCE, explica a
armadilha com todas as letras:

> *"…calculada = 2 × Na + glicemia/18 + **ureia/6**… A forma "ureia/2,8" do
> protocolo-fonte pressupõe nitrogênio ureico (BUN); aplicá-la à ureia total
> **superestima o cálculo em cerca de 2 vezes**."*

E o motor da CAD/EHH — **o único dos cinco que CALCULA para decidir** — usava
`ureia/2,8`. Pior: a **própria árvore daquele módulo** já ensinava o critério
certo (*"osmolalidade efetiva = 2 × Na⁺ + glicemia/18"*), e o motor ao lado dela
comparava a osmolaridade TOTAL contra o limiar da efetiva.

**O conhecimento estava dentro do repositório e não alcançou o código que
precisava dele.** Não faltou entendimento; faltou trânsito.

**Consequência prática, em três passos:**

1. Achou uma armadilha **explicada** em prosa? Trate o texto como **relatório de
   incidente**: alguém errou ali antes.
2. Varra **todos** os pontos que fazem o mesmo cálculo — inclusive os do próprio
   módulo, que é onde a discrepância parece menos provável e por isso não se
   olha.
3. Prefira **um lugar só** para o cálculo (R-12) e uma trava por **recálculo**
   (R-17). Aviso em prosa protege quem lê aquele módulo; código compartilhado e
   trava protegem o app.

**Corolário desconfortável:** um repositório bem comentado dá a sensação de que
o problema foi resolvido. Comentário é memória, não mecanismo — e a distância
entre "alguém sabia" e "o código faz" é exatamente onde este defeito viveu.

---

**E a regra se repetiu DENTRO da correção que a originou.** O rótulo
`"Ureia — não BUN"` — escrito nesta auditoria exatamente para impedir que
alguém digitasse BUN num campo de ureia — foi para `dka-hhs-engine.ts`, que
é código morto desde 07/jun. **A desambiguação não foi para outro módulo:
foi para lugar nenhum.** A calculadora viva, que é onde o número é
digitado, continuou dizendo só "Ureia" por dois meses.

Só apareceu em 14/ago, ao reapontar `valida-osmolaridade.cjs` do arquivo
morto para o vivo — ou seja, a correção do instrumento revelou que a
correção de conteúdo nunca tinha chegado.

**O enunciado do R-18 fica mais forte:** documentação correta não protege
código de outro módulo — **nem o próprio, quando vai para o arquivo
errado**. Saber a coisa certa e escrevê-la no lugar certo são duas
verificações, não uma.

## R-19 · Escore de gravidade DESCREVE, não INDICA

**Onde uma calculadora sugerir conduta, verifique se ela tem TODOS os dados
que a decisão exige. Se não tem, ela aponta para quem tem.**

**O caso que originou a regra.** A tela do NIHSS dizia, na faixa 1–4:
*"Trombólise + DAPT se elegível"*. Três defeitos numa linha:

1. **Somava o que a evidência separa.** CHANCE e POINT estudaram AVC menor
   **sem** trombólise; ARAMIS põe a dupla antiagregação como **alternativa** à
   alteplase. Nunca as duas juntas — e antiagregante é proibido nas primeiras
   24 h pós-trombólise.
2. **Indicava reperfusão a partir de um número que não decide reperfusão.** O
   NIHSS mede DÉFICIT. A indicação sai de **incapacitância + janela +
   contraindicações**. NIHSS 3 com afasia isolada ou hemianopsia é
   incapacitante e trombolisa; NIHSS 6 por déficits sensitivos difusos pode não
   ser. O número não distingue os dois casos.
3. **A tela não tinha como saber — ela não pergunta.** Não pergunta a hora do
   início, não pergunta anticoagulação, não avalia incapacitância. O módulo AVC
   pergunta as três, e tem `hasPotentiallyDisablingDeficit` item a item.

**Por que a correção não é reescrever a frase.** Qualquer redação nova
continuaria indicando conduta a partir de dados ausentes — só que com menos
chance de alguém notar. A correção é a tela **parar de indicar** e apontar para
o módulo que decide.

**O teste, em uma pergunta:** *esta tela pergunta tudo o que a conduta que ela
sugere exige?* Se a resposta for não, a conduta sai e entra o encaminhamento.

**O que NÃO é violação.** Escore cujo desfecho validado É a conduta que ele
sugere, com os dados na própria tela: dose por função renal, CURB-65 apontando
sítio de tratamento, Wells escolhendo a via diagnóstica. A violação começa onde
a sugestão **excede** o que o escore mede — CURB-65 indicando UTI (o critério de
UTI é outro), HEART pedindo coronariografia, Wells mandando fazer AngioTC sem
saber gestação ou função renal.

**Os dois modelos de como fazer certo já estavam no app:** APACHE II e SAPS 3
dizem, na própria tela, *"índices prognósticos NÃO servem para avaliação
individual"*. Descrevem e param.

### O segundo critério: a ASSIMETRIA DE DANO da sugestão

Ter os dados não é a única pergunta. **Sugestões diferentes têm classes de risco
diferentes, e o R-19 não exige tratá-las igual.**

O caso que fixou isto foi a tela do Glasgow, que sugeria duas coisas ao mesmo
tempo:

| Sugestão | Erro por excesso | Erro por falta | Decisão |
|---|---|---|---|
| **"IOT indicada"** | intubação indevida — dano **imediato e grave**, e a causa costuma ser reversível em minutos (pós-ictal, hipoglicemia, opioide) | via aérea desprotegida | **SAI** |
| **"TCE: TC de crânio urgente"** | radiação e tempo | **hematoma não visto** | **FICA** |

Quando o dano de sugerir a mais é pequeno e o de sugerir a menos é catastrófico,
a sugestão sobrevive — mesmo vindo de uma tela que não tem todos os dados. A
assimetria é o critério; a posse dos dados sozinha decidiria os dois casos do
mesmo jeito, e estaria errada em um deles.

---

## R-20 · Unificação verificada por presença não é unificação — e ausência mal ancorada também não

**A trava tem de PROIBIR o padrão antigo, não apenas exigir o novo.** E a
proibição só vale se estiver ancorada no DEFEITO e varrer um universo ABERTO.

**O caso.** O alvo de sedação foi unificado em RASS −2 a 0 (PADIS 2018) no
`2804e00`, com trava escrita no mesmo commit. Meses depois, **oito** ocorrências
do alvo aposentado ainda viviam no app — duas na Ventilação, módulo declarado
fechado, duas nas Calculadoras, três em chaves de tradução e uma numa trava que
**exigia** a string antiga no bundle em espanhol.

**E a trava conferia ausência.** Isto é o que a torna instrutiva: o diagnóstico
óbvio — "conferiu presença em vez de ausência" — estava errado. Ela tinha
exatamente esta linha:

```js
if (/Alvo RASS −2 a −3|Alvo RASS −1 a −2/.test(t)) { falhas.push(...) }
```

Falhou por duas outras razões:

1. **Âncora na grafia, não no defeito.** Proibiu `Alvo RASS −1 a −2` porque era
   assim que estava escrita a linha que eu tinha acabado de corrigir. As
   sobreviventes diziam *"Sedação leve (RASS −1 a −2)"* e *"analgosedação leve
   (RASS −1 a −2)"* — sem a palavra "Alvo". Copiei o texto corrigido em vez de
   descrever o que não pode existir. **R-10 aplicado à proibição.**
2. **Universo fechado.** `const VIZINHOS = [dois arquivos]`. As Calculadoras
   nunca foram lidas porque não estavam na lista. Varri quem eu SABIA que
   divergia, não quem PODIA divergir — e a lista foi escrita no dia em que eu
   sabia menos sobre o app do que hoje.

**As três perguntas de toda trava de unificação:**

| | Pergunta | Como falha |
|---|---|---|
| 1 | Ela **proíbe** o valor antigo? | Só exigir o novo deixa os dois coexistirem |
| 2 | A proibição está ancorada no **defeito** ou na **frase que eu corrigi**? | Âncora estreita passa por cima da variante |
| 3 | O universo é **todo o app** ou uma **lista**? | Lista fixa nunca cresce sozinha |

**A quarta pergunta, que este caso acrescentou:** a proibição alcança as
**traduções**? Uma chave ES órfã guardava o alvo aposentado — e chave órfã não
compila, não quebra nada e não aparece em varredura de fonte. O valor antigo
sobreviveu no arquivo onde ninguém procura.

**A exceção precisa ser NOMEADA, não afrouxada.** A faixa observada do RASS na
calculadora legitimamente diz "RASS −1 a −2 — sedação leve": descreve o nível
MEDIDO, não uma meta. Ela entra como exceção nominal na trava. Afrouxar o padrão
para acomodá-la teria reaberto o buraco inteiro. E a âncora precisa ser `RASS`:
a Ventilação diz "Trigger sensível (pressão −1 a −2 cmH₂O)", homônimo legítimo
que uma proibição ampla mataria — e verificador que acusa inocente é desligado
no primeiro aperto.

**O modelo de como fazer certo já existia no app:** a trava do peso predito
(`valida-ventilacao.cjs` § 5) varre a árvore inteira recursivamente e proíbe a
constante `152.4` em qualquer arquivo que não seja o dono. Universo aberto,
âncora no que define a fórmula.

---

## O que "MÓDULO FECHADO" significa (revisado a partir do R-20)

Fechado **não é** "achados tratados e correção verificada". Fechado é:

1. Achados tratados;
2. Travas que **proíbem a regressão** — não apenas confirmam a correção;
3. Cada proibição ancorada no defeito e com universo aberto (R-20);
4. Cada trava derrubada por uma mutação executada (R-1, R-15).

Sem o item 2, "fechado" quer dizer só "estava certo no dia em que olhei". Foi
por isso que a Ventilação, fechada, entregou duas ocorrências do alvo antigo.

### Perguntas fixas do checklist de módulo

Feitas em TODO módulo, antes de declarar fechado:

1. **O arquivo que estou auditando é o que a tela renderiza?** (R-32) Confirmar
   por execução, não por import nem por registro em catálogo — `test:alcancabilidade`
   responde para arquivo inteiro; o branch de `clinical-app.tsx` é o primeiro
   lugar a checar.
2. **Quantos lugares deste app escrevem este número?** (R-12) E, ao encontrar
   noutro módulo: **é o mesmo CONSTRUTO ou só o mesmo número?** (R-36)
3. **Cada número atribuído a diretriz veio de TABELA/FIGURA de critérios ou de
   TEXTO CORRIDO?** (R-39) Se do corrido, procurar a tabela antes de usar como
   regra — diretrizes descrevem muito mais do que exigem, com os mesmos números.
4. **Conteúdo de outro domínio nesta árvore tem PONTEIRO?** (R-37) Com `targets`,
   é delegação correta; sem, é resíduo de origem.
5. **A ressalva que estou escrevendo oferece alternativa?** (R-23) Ressalva sem
   saída é aviso que o médico não pode cumprir.
6. **O instrumento que vou construir já existe?** (R-32 passo zero) Procurar
   fora de `scripts/` também — `.gitignore`, `tsconfig`, lint, `INDICE-DE-TRAVAS.md`.
7. **Toda dose ADMINISTRADA neste fluxo tem, aqui, o detalhe de administração?**
   (R-48) Se a apresentação, o volume ou o número de ampolas só existe num módulo
   de consulta, o app sabe e não diz onde importa.
8. **O conteúdo que acrescentei chega à TELA, no estado em que importa?** (R-50)
   Verificado por execução naquele estado — não no mais simples, e nunca pela
   presença no arquivo. Truncamento se acumula em camadas.
9. **O rótulo deste botão e o que ele EXECUTA vêm da mesma fonte?** (R-53) E a
   confirmação de ação destrutiva está no ponto de entrada da ação, não na tela?
   Nenhuma trava de conteúdo pega isto: o conteúdo está certo dos dois lados.
10. **A fonte secundária que estou usando é DA ÉPOCA que o título diz?** (R-52)
   Conferir contra um número que se sabe ter mudado. Material de treinamento
   rotulado com o ano corrente e conteúdo de cinco anos atrás é o pior caso,
   porque desliga o sinal que se usaria para detectá-lo.

A pergunta 3 substitui a varredura própria do R-39: como a fonte já vai estar
aberta na auditoria do módulo, verificar ali custa uma linha de leitura — e
uma varredura separada reabriria as mesmas 6–8 fontes duas vezes.

---

## R-21 · Trava que copia um valor DO APP vira mais uma cópia dele

**O literal numa trava é obrigatório quando representa a REFERÊNCIA EXTERNA, e é
defeito quando representa o TEXTO DO APP.**

Esta formulação substitui a primeira, que dizia "nunca copie o valor" — e estava
errada. Ela teria matado as travas boas: a que confere alteplase 0,9 mg/kg
contra a AHA/ASA **precisa** escrever 0,9, senão não há referência independente
e a trava vira tautológica (R-1). O que não pode é copiar o que o próprio app
diz, porque aí são duas cópias do mesmo valor e elas divergem.

Cópia do app fica sujeita exatamente ao problema que a trava existe para
prevenir: quando o valor muda, ela guarda o antigo.

**O caso, que é pior do que parece.** `scripts/verifica-bundle-es.cjs` conferia
que as traduções chegaram ao bundle usando 27 frases de amostra. Uma delas era
`"RASS −1 a −2 — sedación ligera"`.

Quando o alvo de sedação foi unificado em RASS −2 a 0, essa trava passou a
**exigir a presença do valor aposentado** — em espanhol, num arquivo que ninguém
associa a conteúdo clínico.

**A consequência é a inversão do papel da trava.** Quem corrigisse as duas
linhas da Ventilação sem tocar nela teria o build quebrado, com uma mensagem
sobre bundle e tradução. A leitura natural seria *"a correção está errada,
reverta"*. **A trava teria defendido a regressão contra a correção** — e teria
vencido, porque o build é o árbitro.

Uma trava mal escrita não é só proteção que falha. É proteção que muda de lado.

**As três formas, em ordem de perigo:**

| Forma | Exemplo | Veredito |
|---|---|---|
| Copia o valor e a mensagem não diz que é cópia | `verifica-bundle-es.cjs` — probe com o alvo antigo | ❌ **Defende a regressão** |
| Copia o valor, mas a mensagem manda atualizar a trava | `valida-isr.cjs` — *"a fonte única mudou sem esta trava acompanhar"* | ⚠️ Tolerável: a leitura natural é "atualize", não "reverta" |
| O literal é a **referência externa**, com a fonte citada | `valida-consistencia-clinica.cjs` — alteplase 0,9 mg/kg (AHA/ASA) | ✅ **Obrigatório**: sem ele a trava seria tautológica (R-1) |

**A distinção que decide:** o literal representa a **publicação** ou o **texto do
app**? Publicação é referência independente e tem de estar escrita. Texto do app
é cópia, e cópia diverge.

**A melhor forma é não ter literal nenhum:** `valida-eletrolitos.cjs` deriva 513,
3,42, 154 e 77 da massa molar do NaCl e compara com o que o app diz (R-17). Não
há valor a envelhecer.

### O caso que justifica o R-5 sozinho: o erro tipográfico de 2003

O CURB-65 do app dizia "escore 2 — 9,2% de mortalidade". Ao conferir contra
Lim 2003, o resumo da própria publicação imprime:

> *"score 0, 0.7%; score 1, 3.2%; **score 2, 3%**; score 3, 17%; score 4, 41.5%
> and score 5, 57%"*

**Escore 2 valendo 3% é impossível** entre 3,2% (escore 1) e 17% (escore 3) — a
mortalidade é monotônica no escore por construção. Outras fontes citam **13%**,
que encaixa. É quase certamente um "1" perdido na composição do resumo, em 2003,
reproduzido desde então em toda parte que copia o resumo em vez da tabela.

**Três lições, e nenhuma é sobre o CURB-65:**

1. **Número de resumo não é número de tabela.** O resumo é texto composto por
   humanos; a tabela é dado. Quando os dois divergirem, a tabela ganha — e
   quando só o resumo estiver acessível, isso precisa ser dito.
2. **A monotonicidade é um instrumento de verificação.** Um escore de gravidade
   com valor não monotônico está errado em algum lugar — na fonte, na leitura ou
   na transcrição. Vale como conferência automática, não só como estranhamento.
3. **O que não se confirma fica ENQUADRADO, não vazio nem inventado.** O app
   agora diz "entre 3,2% e 17%; valor pontual não confirmado na publicação
   primária". O clínico recebe a ordem de grandeza e a informação de que ali há
   uma incerteza — que é mais do que qualquer um dos dois números daria.

Um número errado sobreviveu **vinte e três anos** porque era mais fácil copiar o
resumo do que abrir a tabela. É por isso que o R-5 exige a fonte primária aberta
na sessão, e não a lembrança de tê-la lido.

**Corolário para amostras e probes.** Verificação de infraestrutura — bundle,
build, tradução — deve escolher amostras **sem valor**: uma frase que descreve,
não uma que quantifica. A frase existe ali para provar que o pipeline funciona,
não para guardar medicina.

---

## R-22 · Existe verificação que não depende de fonte externa

Todas as outras travas desta auditoria comparam o app contra **algo de fora**:
bula, publicação, massa molar, tabela de diretriz, fonte única interna. Esta
classe compara o app **contra si mesmo**.

**A forma.** Se a tela afirma que o escore 3 é mais grave que o 2, e afirma que
o prognóstico do 2 é pior que o do 3, **uma das duas afirmações está errada** — e
isso é decidível sem sair do repositório.

**A consequência que a torna valiosa: é a única capaz de pegar erro em número
que ninguém conferiu ainda.** As faixas de mortalidade do APACHE II estão
abertas atrás de paywall e continuam sem a Figura do Knaus 1985 — e mesmo assim
estão sob vigilância agora, porque a escada não pode deixar de ser monotônica.
Nenhuma trava de referência externa conseguiria isso; ela precisa da fonte que
não temos.

**O caso que a originou** foi o CURB-65: o resumo de Lim 2003 imprime "score 2,
3%" entre 3,2% e 17%. Nenhuma leitura de fonte era necessária para saber que
aquilo estava errado — bastava reparar que a curva descia no meio.

### Corolário: trava que acusa inocente é pior que trava que não existe

A primeira versão desta verificação acusou o RASS inteiro. O RASS é
**bidirecional** — 0 é o alvo, e piora subindo (agitação) e descendo (sedação
excessiva) —, então lido como escala única ele "melhora quando piora" em metade
do domínio. O defeito era da trava.

Uma trava que acusa inocente ensina a ignorar o sinal, e o passo seguinte é
alguém removê-la *"porque vivia quebrando"* — momento em que se perde também
tudo o que ela pegava de verdade. **A exceção legítima entra NOMEADA** (o RASS é
conferido em dois braços a partir do alvo), nunca afrouxando o critério para
todos.

---

## R-23 · Ressalva que impede uma conduta precisa nomear o que fazer no lugar

**Ressalva sem alternativa não é segurança — é obstáculo.** Ela transfere o
problema para quem tem menos tempo que nós.

**O caso.** O achado no Wells estava enquadrado como *"falta a ressalva de
gestação, função renal e alergia a contraste"*. Escrita assim, a tela diria à
plantonista de madrugada: *"⚠️ cuidado com gestante"* — e ela ficaria parada
diante de uma suspeita de TEP, que é diagnóstico com relógio correndo.

A ressalva só vira ajuda quando carrega a saída:

> gestante → **doppler venoso de membros inferiores primeiro** (se positivo,
> trata sem irradiar); se negativo, cintilografia de perfusão ou AngioTC com
> protocolo de dose reduzida · injúria renal ou alergia ao contraste →
> **cintilografia V/Q**

**O teste, em uma pergunta:** *depois de ler este aviso, o leitor sabe o que
fazer agora?* Se a resposta for "sabe o que NÃO fazer", a ressalva está pela
metade.

**Onde isto morde mais.** Quanto mais grave o cenário, pior o custo do aviso
truncado: quem lê um app de emergência está decidindo sob pressão, e uma porta
fechada sem outra aberta produz ou paralisia ou a conduta que o aviso queria
evitar — feita assim mesmo, agora com culpa e sem plano.

**Corolário sobre a origem do achado.** Este item nasceu de um enquadramento meu
que estava incompleto, e não do código: eu descrevi o defeito como *ausência de
aviso* quando ele era *ausência de caminho*. Vale para a leitura de qualquer
achado — **descrever o que falta é mais fácil do que descrever o que deveria
estar lá**, e as duas descrições produzem correções diferentes.


---

## Zero achados é RESULTADO, não fracasso

A varredura de faixas invertidas leu **1633 faixas em 343 arquivos** e não achou
nenhuma. Isso não foi tempo perdido: **uma classe inteira de defeito foi
descartada com evidência executada**, e a trava fica de guarda para tudo o que
for escrito daqui em diante.

Auditoria que só contabiliza achados ensina que "não achar" foi desperdício — e
é o oposto. **A varredura que volta limpa é a que permite parar de olhar para
ali.** Sem ela, "acho que não temos esse problema" continua sendo palpite, e
palpite precisa ser reexaminado a cada revisão.

O placar de uma auditoria tem duas colunas, e a segunda vale tanto quanto a
primeira:

| | |
|---|---|
| **defeitos corrigidos** | o que estava errado e deixou de estar |
| **classes descartadas** | o que se provou não estar errado, e não precisa ser reexaminado |

### Corolário: as auto-acusações são do instrumento, não do app

A trava de limiar acusou **quatro** vezes antes de ficar verde, e as quatro eram
defeito dela:

- `"PROVÁVEL"` é substring de `"IMPROVÁVEL"` — acusava as duas faixas do Wells;
- `"AVC leve"` é substring de `"AVC leve a moderado"`;
- o enquadramento do CURB-65 escore 2 **cita** 3,2% e 17%, e derrubava os
  vizinhos dele;
- **as faixas da vancomicina eu transcrevi erradas** — numa trava escrita
  justamente para pegar erro de transcrição.

A última é a que vale guardar. **O instrumento tem o mesmo defeito que ele
existe para encontrar**, e nada nele é imune por ser "o teste". É a razão de o
R-1 exigir mutação: sem ela, uma trava com a faixa errada escrita dentro passa a
exigir o erro — que é o R-21 chegando pela porta dos fundos.


---

## R-24 · Número de resumo se confere pelo que ele IMPLICA

**Todo número extraído de resumo, abstract ou sumário automático é conferido
contra o que ele implica** — apresentação, total, proporção, ordem de grandeza.
**Se o implicado não existe no mundo, o número está errado** — e isso se sabe
ANTES de abrir a fonte primária.

**O caso.** Um sumário automático da bula do flumazenil devolveu a apresentação
como `0,5 mg/mL em ampola com 5 mL`. Não foi preciso desconfiar da fonte nem
buscar uma segunda referência: **0,5 × 5 = 2,5 mg por ampola**, e não existe
ampola de flumazenil de 2,5 mg. A leitura primária confirmou 0,1 mg/mL × 5 mL =
0,5 mg.

**O que torna esta regra diferente das outras de fonte.** O R-5 manda abrir a
primária. O R-24 diz o que fazer **enquanto** você ainda não abriu: um número de
resumo carrega consigo consequências aritméticas, e essas consequências são
verificáveis de graça. É o **R-22 aplicado a fonte externa** — coerência interna
pegando erro sem segunda referência.

**Os implicados que valem conferir sempre:**

| Número | O que ele implica | Como se confere |
|---|---|---|
| concentração | massa por ampola = concentração × volume | existe essa apresentação? |
| dose/kg + teto | peso em que o teto passa a valer | é plausível para a população do protocolo? |
| porcentagens por faixa | monotonicidade | a curva sobe quando a gravidade sobe? (R-22) |
| meia-vida | quando o efeito acaba | bate com o intervalo de redose que a mesma fonte manda? |

**O mesmo raciocínio já tinha aparecido duas vezes** antes de virar regra: o
`score 2, 3%` do CURB-65, impossível entre 3,2% e 17%; e a osmolaridade com
divisor do BUN, que inflava o número em ~2×. Nos três casos, o erro se anuncia
pela aritmética antes de se anunciar pela fonte.

---

## R-25 · Fonte única sem consumidores é fonte única APARENTE

**Constante exportada com zero imports, enquanto N sítios escrevem o valor à
mão, não é fonte única — é um CONTRATO VIGIADO POR TRAVA.** A diferença decide
o que acontece com quem está de fora.

| | Fonte única real | Contrato vigiado por trava |
|---|---|---|
| Como se cumpre | o código **importa** o valor | a trava **compara** textos |
| Quem pode burlar | ninguém: não há segundo valor | qualquer arquivo fora do universo da trava |
| O que acontece com o novo módulo | herda o valor de graça | passa despercebido até alguém ampliar a trava |

**O caso.** `lib/doses-isr.ts` foi criada como fonte única das doses de indução.
Ela exporta `DOSES_ISR` e `ISR_AJUSTE_NO_INSTAVEL` — e **as duas têm zero
imports em todo o app**. O que mantinha 27 sítios alinhados era
`valida-isr.cjs`, comparando os multiplicadores do `derive` com o texto do
arquivo por regex.

Funcionou por meses — e falhou exatamente onde tinha de falhar: a **Sepse**
prescrevia `Succinilcolina 1,5 mg/kg` sem o teto de 200 mg, porque estava fora
do universo que a trava lia. Não foi omissão de teto; foi **fonte única
ignorada por quem deveria consumi-la**. Mesma família do R-18: a resposta certa
existia no repositório e não alcançou o código que precisava dela.

**Sintoma diagnóstico, e é barato de rodar:** exportação de valor clínico com
**zero consumidores** enquanto o valor aparece à mão noutros arquivos.

**A varredura de todas as exportações de valor clínico do app** encontrou só um
caso — `lib/doses-isr.ts`. As demais são fontes reais: `ALVOS_TCE` (6
consumidores), `predictedBodyWeight` (4), `FAIXA_DE_ENTRADA` (4),
`TABELA_LOW_PEEP` e as faixas do NIHSS (consumidas por acessor, que é a API
legítima do módulo).

**A restrição que impede a correção óbvia**, e que precisa ficar registrada:
texto de tela passa por `tr()`, e compor com template literal
(`${DOSES_ISR.succinilcolina}`) tira a frase da varredura de tradução — o
usuário em espanhol veria português. **Por isso a frase fica literal e o valor
fica sob contrato.** O que dá para importar sem custo são os **multiplicadores
numéricos** do `derive`, e é isso que a D-14 tem de resolver.

**Enquanto isso, a regra operacional é:** contrato vigiado exige que o
**universo da trava seja aberto** (R-20). Lista fixa de arquivos num contrato é
a combinação que produziu este defeito.


---

## Regra é LENTE, não critério automático

**"Dose por quilo cujo teto satura abaixo do peso adulto médio é cálculo sem
consequência"** é uma boa regra — e é uma boa regra *para olhar*, não para
derrubar o build.

A varredura que ela gerou achou **7 casos abaixo de 70 kg**, e a maioria é a
**formulação da própria diretriz**: lorazepam 0,1 mg/kg até 4 mg e diazepam
0,15 mg/kg até 10 mg são o texto do ENLS; HNF 60 U/kg até 4000 U é o texto da
diretriz de STEMI. Convertê-los para dose fixa "porque saturam cedo" seria
divergir da fonte para satisfazer uma regra interna.

**Onde a regra vale:** quando a própria fonte já dá a dose fixa e o app escolheu
a versão por peso. Foi o caso da dexametasona na meningite (a diretriz
brasileira usa 10 mg fixos) e do midazolam IM no estado de mal (o ENLS diz
"10 mg IM" no adulto). Aí a conversão aproxima da fonte em vez de afastar.

### A consequência para a trava

Por isso o **caso B da trava de teto é AVISO, não falha** — e a decisão está
escrita no código, não implícita. Vermelho gasto onde não há risco é vermelho
que a equipe aprende a ignorar, e aí ele deixa de funcionar onde importa. Mesmo
raciocínio que fez o RASS ser conferido em dois braços em vez de acusar o app
inteiro (R-22).

**Teste para decidir a severidade:** *o que acontece com o paciente se este
achado ficar como está?* Nada → aviso. Alguma coisa → falha. Uma trava cujo
vermelho não corresponde a risco treina a equipe a fechar o vermelho, não a
lê-lo.

---

## R-26 · Par clínico proposto por quem não vai implementá-lo passa por dupla checagem

**Antes de virar trava, todo par "A antes de B" precisa de duas conferências:
EXEQUIBILIDADE ESTRUTURAL (o app expressa essa ordem em algum lugar verificável?)
e CONTRAEXEMPLO (existe cenário legítimo em que a ordem se inverte?).**

**O caso.** Uma tabela de dez pares "universais e inegociáveis", escrita com
cuidado por quem conhece a medicina, foi submetida à dupla checagem antes de
virar código. O resultado:

| | |
|---|---|
| **1** era fisicamente impossível como escrito | *"confirmar o tubo antes de fixar e VENTILAR"* — capnografia em onda **exige ventilação para gerar onda**. Reescrito para *"antes de FIXAR e antes de assumir a via aérea como segura"* |
| **3** tinham exceção nomeável | PCR para o bloqueador · pré-hospitalar para o antídoto · e a **tiamina** |
| **3** não são verificáveis na estrutura de hoje | um vive noutra máquina (o reducer do ACLS), dois o app não expressa como ordem |
| **4** sobreviveram intactos | |

**O item mais instrutivo é o da tiamina**, porque o dano da versão original não
seria um falso positivo qualquer. A regra *"tiamina ANTES da glicose"* faria a
trava acusar um texto **correto** — e a "correção" que ela empurraria é
**perigosa**: atrasar glicose em hipoglicemia documentada. Wernicke por um
único bólus é largamente teórico; hipoglicemia prolongada não é. O par virou
regra de **PRESENÇA**, não de ordem.

**A lição não é sobre quem escreveu a tabela.** É sobre a distância entre a
regra clínica e a estrutura que a hospeda: quem conhece a medicina não tem como
saber que o ACLS é um reducer e não uma árvore, nem que a capnografia precisa de
ventilação para existir como sinal. **A checagem é o encontro dos dois
conhecimentos, e ela precisa acontecer antes do código.**

**Uma tabela aceita sem essa checagem teria produzido travas que acusam texto
certo — o caminho mais rápido para a trava ser desligada (R-22).**


---

## R-27 · Refatoração que ameaça esvaziar uma trava: demonstre o vazio primeiro

**Quando uma mudança de estrutura vai tornar uma verificação tautológica, escreva
a mutação que PROVA o vazio antes de corrigir.** O registro precisa mostrar por
que a pergunta mudou — senão a próxima pessoa restaura a versão antiga achando
que ela bastava.

**O caso.** `lib/doses-isr.ts` passou a ser importada pelo `derive`, resolvendo a
D-14. A trava existente comparava o literal do `derive` contra o texto da fonte —
o que fazia sentido enquanto eram DUAS fontes. Depois do import, os dois lados
nascem da mesma constante.

Antes de reescrevê-la, escrevi a versão **ingênua** da trava nova e mutei a
fonte:

```
etomidato 0,3 → 3 mg/kg      o app passa a calcular 210 mg num paciente de 70 kg
trava ingênua:               ✅ verde
```

**Dose dez vezes errada, verde.** Não é uma tautologia que se veja lendo: os dois
lados se movem juntos e a conferência gira em falso.

**O que a demonstração compra:** o registro passa a conter o CONTRAEXEMPLO, não
só a conclusão. Quem ler o commit daqui a um ano não vai propor "voltar a
comparar derive com fonte, que era mais simples" — porque está escrito ali o que
essa simplicidade deixa passar.

**A saída, quando acontecer:** o valor de referência tem de ser EXTERNO (R-21).
Se os dois lados vêm do app, não há conferência — há espelho.

---

## R-28 · Custo invisível não é descuido, é ausência de sinal

Uma das 55 frases da D-19 — texto de tela que o usuário em espanhol lê em
português — **foi escrita durante esta auditoria**, por quem já conhecia a
armadilha do template literal. O rótulo do HEART: a forma já era template antes,
e foi mantida sem que o custo aparecesse.

**Não foi falta de atenção. Foi falta de instrumento:** nada media aquilo, e o
que não é medido não aparece na revisão, por mais cuidadosa que ela seja.

**Consequência para a leitura de achados:** quando um defeito reaparece depois de
documentado, a primeira pergunta não é *"por que ninguém viu?"* — é **"o que
mediria isso?"**. A primeira leva a mais atenção, que não escala. A segunda leva
a uma trava, que escala.

É o mesmo mecanismo do R-18 pelo avesso: lá, o conhecimento certo existia num
módulo e não alcançava o código de outro. Aqui, existia na cabeça de quem
escrevia e não alcançava a própria mão.


---

## R-29 · Levantamento por leitura SUBCONTA; a trava acerta

> **A leitura descobre a CLASSE; a trava CONTA certo.**
>
> Explica retroativamente por que quase todo achado grande desta auditoria veio
> de alguém lendo, e quase toda contagem correta veio da trava. Usar um no lugar
> do outro desperdiça os dois.

**Nenhum "são N ocorrências" é definitivo antes de a trava rodar.** Até lá o
relatório diz **"N conhecidos"**, não "N".

**Três vezes nesta auditoria**, e sempre para menos:

| Levantamento disse | A trava achou |
|---|---|
| duas implementações de peso predito | **três** — a terceira estava no EAP |
| o aviso do BNM faltava no rocurônio | faltava **também no atracúrio**, em `info` |
| dobutamina em **seis** sítios | **oito** — a árvore da Sepse e o EAP |

**Por que erra sempre para menos.** Quem lê procura o que já sabe existir: monta
uma consulta a partir da forma que já viu. A ocorrência escrita de outro jeito —
outro campo, outra ordem de palavras, outro módulo — não entra na consulta
porque não estava na hipótese. A trava não tem hipótese: varre o universo
declarado inteiro.

**Consequência prática, em três partes:**

1. **No relatório**, escreva "N conhecidos" e diga como procurou. O número muda
   quando a trava roda, e vai mudar **para cima**.
2. **Na ordem do trabalho**, a trava vem antes de declarar o escopo do bloco —
   senão o bloco é dimensionado por um número que ainda vai crescer.
3. **Na leitura do resultado**, se a trava achou o mesmo número do levantamento,
   desconfie do universo dela antes de comemorar a coincidência.

**Corolário sobre a divisão de trabalho.** O levantamento por leitura não é
inútil — é ele que descobre a CLASSE do defeito e permite escrever a trava. Erra
na contagem, acerta na natureza. A trava faz o inverso: não descobre classe
nenhuma, e conta certo. Usar um no lugar do outro desperdiça os dois.


---

## R-30 · Teste de tempo escrito sem tempo decorrido não testa tempo

**Entre armar o relógio e conferi-lo passam milissegundos — e nesse intervalo
re-armado e não-re-armado são INDISTINGUÍVEIS.** Toda verificação de re-arme,
expiração, contagem ou janela precisa de **espera real maior que a granularidade
que ela pretende distinguir**.

**O caso.** O teste do cronômetro da Anafilaxia conferia assim:

```js
motor.updateAuxiliaryField("secondDoseAction", "2ª dose IM aplicada");
conferir("a 2ª dose RE-ARMA", motor.getTimers()[0].remaining > 290);
```

Passava. E passaria **do mesmo jeito se o relógio não tivesse re-armado**: o
primeiro armar foi há milissegundos e o valor ainda estava cheio. O teste media a
**existência** do relógio, não o **re-arme** — e o cronômetro subiu como
"provado por mutação" com essa lacuna desde o começo.

Com 1,2 s de espera real, os dois casos se separam: quem não re-armou marca
**299**, quem re-armou volta a **300**.

**É o R-27 aplicado ao próprio trabalho:** a verificação passava por um motivo
que não era o que ela afirmava verificar. A diferença é que ali o vazio foi
demonstrado de propósito, e aqui só apareceu porque uma mutação posterior, em
outro módulo, escancarou o mesmo padrão.

**Regra prática:** se o que se testa é tempo, o teste **espera**. Espera real, com
o relógio do sistema — não `jest.advanceTimers` quando o código lê `Date.now()`
direto, não valor mockado que o próprio teste controla. Custa segundos e é a
única coisa que separa "tem relógio" de "o relógio conta certo".


---

## R-31 · O cronômetro é uma pergunta sobre O QUE MEDIR

**Um cronômetro não é um contador. É uma pergunta — e a pergunta muda com a
fase.**

A formulação saiu de uma pergunta simples: *o que acontece aos 61 minutos no
status epiléptico?* A resposta não era "o relógio expira". Era: **o relógio deixa
de medir a coisa que decide**. Aos 60 min, o tempo desde o início da crise para
de governar a conduta e quem passa a governar é outro relógio, com outro marco
(o início do anestésico) e outra escala (24 h para superrefratário).

**Isso explica retroativamente os três casos do app:**

| | |
|---|---|
| **Anafilaxia** funcionou de primeira | marco único, pergunta única: *"quanto falta para a próxima dose IM?"* |
| **Convulsões** exigiu estrutura nova | **quatro marcas e dois marcos**, com troca de marco no fim — a pergunta muda quatro vezes |
| **Vasoativos** provavelmente NÃO deve ter | *"titular a cada 5 min"* é titulação contínua: **não há marco, logo não há pergunta que um relógio responda**. Um cronômetro ali ensinaria a tratar por relógio o que se trata por resposta |

**Três consequências de projeto, todas verificáveis:**

1. **O marco é obrigatório e não tem default.** Um relógio sem marco declarado
   responde *"há quanto tempo o app está aberto"* — a única pergunta que nunca
   interessa. E é o defeito mais fácil de introduzir: basta omitir um campo.
2. **Vencer não é sumir.** Depois da última marca, o relógio muda o que diz — e
   o texto do "ultrapassado" cobre o caso pior, que é **não ter havido avanço
   nenhum**. Um relógio que só conta para a próxima marca fica mudo exatamente
   quando o problema é estar parado.
3. **A ausência de marco é uma resposta legítima.** Quando não há evento de
   onde contar, o certo é **não ter cronômetro** — e dizer por quê, em vez de
   inventar um contador que mede o uso do app.

---

## R-32 · Código que parece rodar e não roda é pior que código ausente

**Código ausente não engana ninguém — quem procura, não acha, e sabe que não
achou. Código presente, compilando, com testes que o exercitam, engana todo
mundo: parece coberto.** `anafilaxia-engine.ts`, `eap-engine.ts` e
`ventilation-engine.ts` somam quase 6.500 linhas, têm travas que os compilam
(`test:cronometros`, `test:frase-composta`, `test:vm`, `valida-dobutamina.cjs`)
e um registro em `clinical-modules.ts` que parece cadastrá-los como o motor do
módulo. Nenhuma dessas três coisas prova alcançabilidade — prova só que o
arquivo existe e é sintaticamente válido.

**Por que virou regra escrita.** Esta auditoria corrigiu conteúdo clínico
nesses arquivos **três vezes** ao longo da Fase 1 (dobutamina, TCE, peso
predito) achando que a correção chegava ao médico. Só foi descoberta ao tentar
mostrar um número de cronômetro na tela — por acidente de outra tarefa, não por
verificação dirigida.

**O teste que teria pego isto não é de conteúdo, é de ALCANÇABILIDADE.**
Nenhuma trava desta auditoria pergunta "a partir da rota real, qual código
executa?" — todas perguntam "o que este arquivo contém?". São perguntas
diferentes, e a auditoria só tinha instrumento para a segunda.

**Corolário, e é o que muda o próximo passo:** antes de auditar conteúdo de um
módulo, confirmar por execução (não por import, não por registro em catálogo)
que o arquivo sob auditoria é o que a tela realmente renderiza. `components/
clinical-app.tsx` decide por `protocolId` e pode ignorar silenciosamente o
`engine` que um componente recebeu — esse padrão específico (prop recebida e
descartada por um branch hard-coded) é o primeiro lugar a checar quando um
módulo tem mais de uma implementação candidata.

---

## R-33 · Delegação de PLANTÃO não é delegação de CONDUTA

**Um módulo pode apontar para outro de duas formas diferentes, e só uma
resolve uma lacuna de conteúdo.** Delegação de **plantão** diz "lembre que
este outro módulo existe" — um atalho, sempre visível, igual para todos.
Delegação de **conduta** diz "quando X, a decisão vem de lá" — um critério
específico, ligado ao ponto exato da árvore onde a pergunta clínica surge.

**Por que virou regra escrita.** A Sepse tem o card "Estabilização primeiro"
com atalho para o ISR, e o ABCDE do mesmo card já nomeia o critério
("B — insuficiência respiratória → IOT se falha ou exaustão"). Isso é
delegação de PLANTÃO: existe, é visível, mas é igual em todos os 19 módulos
que carregam o card — não nasceu da Sepse, não sabe que é a Sepse. A pergunta
que decide se há lacuna não é "o módulo aponta para algum lugar?" — quase
todos apontam, pelo card universal. É: **"existe, no PONTO CERTO do fluxo
específico deste módulo, uma frase que diga 'aqui, abra o outro módulo'?"**

**O teste de duas perguntas:**
1. O apontamento é igual em todo módulo que carrega o mesmo card, ou é
   específico deste fluxo? Igual em todos = plantão.
2. O apontamento está ligado a uma CONDIÇÃO do próprio fluxo (um nó, um
   critério, um "se X"), ou é uma presença constante e genérica? Condicional
   e local = conduta.

**Corolário:** plantão sem conduta não é lacuna grave — é candidato a item
MENOR (uma frase de transição no ponto certo), não bloco de segurança. Duplicar
o conteúdo do módulo delegado ali violaria a própria disciplina de fonte única
(R-12): a conduta pertence a UM lugar, e apontar para ela é o padrão correto,
não uma correção incompleta.

---

## R-34 · Valide o que vai ser commitado, não o que está na sua mesa

**Rodar a suíte contra a árvore de trabalho suja testa uma coisa; o commit
leva outra.** Quando um commit é montado de um diff maior — separando por
tema, revertendo trechos de outros commits temporariamente — a única
verificação que vale é sobre o CONTEÚDO EXATO que vai ser gravado, não
sobre o estado momentâneo do disco.

**Por que virou regra escrita.** Ao separar uma sessão grande em três
commits temáticos, arquivos como `eap-engine.ts` e `anaphylaxis-decision-
tree.ts` precisaram ser temporariamente revertidos a um estado
intermediário (só a parte do tema do commit atual) antes de `git add`. Rodar
`tsc`/testes nesse momento, sobre a árvore de trabalho como um todo, teria
validado uma mistura de "o que este commit contém" com "o que os outros
dois commits ainda não commitados também contêm" — porque arquivos de
OUTROS commits continuavam modificados no disco ao lado dos já revertidos.
Zero erro apareceria mesmo se o commit isolado estivesse quebrado.

**A técnica:** `git add` dos arquivos do commit atual, depois `git stash
push --keep-index -u` — isola o índice (staged) do resto da árvore de
trabalho, que vai para a stash. `tsc`/testes agora só enxergam o que está
staged mais o que já foi commitado antes. Depois do `git commit`, `git
stash pop` devolve o resto para continuar montando o próximo commit.

**Por que importa mais aqui do que em código comum.** Este repositório
deploya a `main` automaticamente. Um commit que "passa" contra a árvore
suja mas não compilaria sozinho é uma bomba de bisect: `git bisect` ou
`git revert` de um commit seguinte deixam a árvore num estado nunca
testado, e ninguém vai descobrir até o deploy automático dessa revisão
específica.

**Corolário:** isto vale toda vez que um commit é montado por partes de um
diff maior — não só nesta auditoria. A pergunta antes de rodar qualquer
verificação não é "isto está certo?", é "isto está certo NO QUE VAI SER
GRAVADO?".

---

## R-35 · Código inalcançável NÃO É FONTE

**Copiar um número de engine morto é escrever de memória com aparência de
procedência — e isso é PIOR que memória declarada, porque o número chega
com ar de já-conferido.** Quem lê um valor dentro de um arquivo do próprio
repositório presume que alguém, algum dia, o conferiu contra alguma coisa.
Num arquivo que a tela nunca executou, ninguém conferiu — e ninguém teria
como saber que não conferiu.

**Por que virou regra escrita.** A infusão EV de adrenalina na anafilaxia
aparecia **onze vezes** em `anafilaxia-engine.ts`, sempre como
`0,05–0,1 mcg/kg/min`, sempre coerente consigo mesma. Repetição interna
parecia confirmação. Ao abrir a fonte (ASBAI 2024 / Practice Parameter
2023 e RCH Melbourne), a dose de partida é **0,1** — e o 0,05 é a dose
**PEDIÁTRICA**, aplicada como se fosse a geral. Onze cópias de um erro
continuam sendo um erro; a única coisa que a repetição provou foi que
ninguém tinha aberto a fonte.

**A consequência prática, ao decidir o que salvar de código morto:** todo
item que carrega número clínico entra na fila do R-5, sem exceção — não
importa quantas vezes o engine o repita, nem há quanto tempo esteja lá.
Dos 40 itens candidatos a porte da D-22, **31 exigiram fonte aberta antes
de qualquer linha escrita**, exatamente por isso.

**AMPLIAÇÃO — o engine morto é ACUMULADOR, não só não-fonte.**

Um arquivo inalcançável não erra: ele **para no tempo**, e o mundo se move em
volta. O critério de hemocultura na endocardite (3 pares, 30 min de
intervalo) estava CERTO quando foi escrito — foi retirado no Duke-ISCVID
2023. O arquivo não ficou errado por descuido de ninguém; ficou errado por
ter sobrevivido a uma revisão de diretriz sem ser lido.

**Consequência prática, e ela é contraintuitiva:** conteúdo de código morto
tem IDADE, e a idade é a **data em que o arquivo morreu** — não a do último
commit que o tocou. Esta auditoria tocou os oito engines vinte vezes sem
revisar nada clinicamente: `git log` mostra atividade recente sobre
conteúdo que envelhece desde abril e junho. O histórico mente sobre a idade
do conteúdo, e mente de forma tranquilizadora.

**Corolário — e é o que separa esta regra do R-21:** o R-21 fala de trava
que copia valor do app e gira em falso. Este fala do inverso: o CONTEÚDO
copiando de si mesmo. Nos dois casos a falha é a mesma — tratar coerência
interna como evidência externa. Um app conferido só contra si mesmo é
consistente e pode estar inteiro errado.

---

## R-36 · Número idêntico com construto diferente é FALSO AMIGO

**Antes de marcar um item como "já existe no app", confirme que existe COMO
A MESMA COISA — não só com o mesmo número.** Divergência se nota;
coincidência não.

**Por que virou regra escrita.** Na reclassificação "vale apontar × vale
portar" da D-22, o item E12 (meta de FC < 110 bpm no controle de frequência
da FA no EAP) quase foi marcado como "já existe": `tep-decision-tree.ts:423`
traz literalmente `FC < 110`. Mesma grafia, mesmo número.

Só que ali **`FC < 110` é critério de ELEGIBILIDADE PARA TRATAMENTO
AMBULATORIAL do TEP** — um marcador de que o paciente está bem o bastante
para ir para casa. No EAP seria um **ALVO A ATINGIR** num paciente
congesto. Mesmo número, decisões opostas: um descreve quem já está estável,
o outro manda intervir em quem não está.

Se tivesse virado ponteiro, o app mandaria o médico do EAP abrir o módulo de
TEP para encontrar um critério de alta — no meio de um edema agudo.

**Por que é PIOR que divergência.** Quando dois lugares discordam (dobutamina
2,5 × 2 × 5), a discordância é visível e alguém investiga. Quando dois
lugares CONCORDAM no número e discordam no significado, a concordância vira
argumento a favor de unificar — e a unificação funde duas coisas que nunca
foram a mesma.

**A verificação:** ao encontrar o número em outro módulo, ler a frase inteira
e responder *"isto responde à MESMA pergunta clínica?"*. Não é o valor que
define identidade — é o construto: alvo × limiar × critério de
elegibilidade × valor de referência são categorias diferentes, e o mesmo
número serve às quatro.

**VARIANTE SINTÁTICA — falso amigo GRAMATICAL.** A mesma inversão acontece
sem número nenhum, por ambiguidade de referente. Escrevi, numa linha de
escolha de droga:

> *"CLOPIDOGREL, não ticagrelor nem prasugrel: **os dois únicos** com
> evidência em paciente lisado (CLARITY-TIMI 28, COMMIT)"*

"Os dois" queria dizer os dois ENSAIOS. Mas vem imediatamente depois de
"ticagrelor nem prasugrel", e a leitura rápida entende que **esses dois
fármacos** é que têm evidência — o oposto exato da instrução, numa frase que
escolhe antiagregante depois de trombólise.

Numa tela de emergência a leitura é sempre rápida. Pronome ambíguo em linha
de escolha de droga é a mesma classe de defeito do falso amigo numérico:
**a frase é a mesma, o sentido é o oposto, e nada no texto sinaliza a
bifurcação**. A correção não é explicar melhor — é eliminar o pronome:
*"CLOPIDOGREL — é o único P2Y12 com evidência em paciente lisado (CLARITY-TIMI
28 e COMMIT). Não usar ticagrelor nem prasugrel aqui."*

**Corolário para o R-12:** fonte única se cria para o mesmo CONSTRUTO, não
para o mesmo número. Unificar por coincidência numérica produziria a fusão
errada — e ela seria muito mais difícil de desfazer que a duplicação que se
queria eliminar.

---

## R-32 · PASSO ZERO — procure o instrumento antes de construí-lo

**Acréscimo ao R-32, e ele vem de contagem, não de princípio.** Antes de
escrever qualquer verificação nova, procurar se ela já existe — e procurar
**fora de `scripts/`**: `.gitignore`, `tsconfig`, configuração de lint,
`package.json`, e as travas que já existem sob outro nome.

**Cinco vezes o instrumento já existia:**

| | O que se ia construir | O que já existia |
|---|---|---|
| D-3 | verificador de siglas | a lista já estava escrita, faltava inventário |
| alcançabilidade | travessia de grafo | `test:arvores` já fazia para nós de árvore |
| par de doses | conferência do par 1 | `test:sedacao` já cobria |
| interpolação | mecanismo de tradução com valor | `trf` já existia |
| duplicata `" N.tsx"` | checagem de arquivo duplicado | **`.gitignore:66-71`**, e de forma mais completa (4 extensões, com a exceção dos nomes que legitimamente terminam em dígito) |

Cinco não é acaso — é padrão. E o custo do erro não é só o trabalho
repetido: no caso do `.gitignore`, a checagem construída era **mais fraca**
que a que já existia, e eu declarei um valor de proteção que ela não tinha.
Construir por cima do que existe sem saber que existe produz duplicação de
instrumento — o mesmo defeito que o R-12 persegue no conteúdo, agora na
camada de verificação.

**Onde olhar, em ordem:** `package.json` (scripts), `scripts/` (nomes
podem não descrever), `.gitignore` / `.gitattributes`, `tsconfig.json`
(strictness já pega classes inteiras de erro), configuração de lint, e o
`INDICE-DE-TRAVAS.md` — que existe justamente porque o `test:all` ficou
grande demais para se saber de cabeça (D-15).

---

## R-37 · Resíduo de origem e delegação legítima têm a MESMA APARÊNCIA TEXTUAL

**Conteúdo de outro domínio dentro de uma árvore pode ser duas coisas
opostas: cópia acidental ou ramo correto do diferencial. A diferença não
está no texto — está na ESTRUTURA.** Delegação tem **ponteiro**
(`targets: [{ moduleId }]`); resíduo não tem.

**Por que virou regra escrita.** A varredura de resíduo de origem nas 17
árvores achou 12 ocorrências de conteúdo aparentemente alheio. **Oito eram
corretas:**

| Ocorrência | Por que está certa |
|---|---|
| `dyspnea:161` e `shock:528` — adrenalina IM | é o ramo anafilático do diferencial, **com `targets: [{ moduleId: "anafilaxia" }]` na linha seguinte** |
| `poisoning:386,389` — insulina | terapia hiperinsulinêmica-euglicêmica para intoxicação por BCC, e octreotide para sulfonilureia: toxicologia legítima |
| `dka-hhs:225` — MgSO₄ | hipomagnesemia na CAD |

**Uma só era resíduo:** o comentário `(alteplase 90 mg · TNK 25 mg ·
enoxaparina 100 mg · HNF 10.000 U)` propagado do AVC — onde os números
estão CERTOS — para Coronárias, TEP e CAD/EHH, onde vão de errados a
absurdos (trombolítico em cetoacidose).

**A conta que importa:** sem a distinção estrutural, a varredura acusaria
**8 casos certos para achar 1 errado**. Pela regra do RASS (R-20), trava
que acusa inocente é pior que trava que não existe — a essa taxa, ela é
desligada na primeira revisão.

**Complementa o R-33, e a pergunta é diferente:**
- **R-33** pergunta se o apontamento é **específico do fluxo** (conduta) ou genérico (plantão).
- **R-37** pergunta se **existe apontamento**. Sem ponteiro nenhum, conteúdo de outro domínio é resíduo — com ponteiro, é o padrão correto que a auditoria inteira defende.

**Corolário:** ao varrer por contaminação entre módulos, o predicado nunca é
*"este texto pertence a outro domínio?"* — é *"este texto pertence a outro
domínio E não aponta para lá?"*.

---

## R-38 · Fonte secundária inventa especificidade que a primária não tem

**Quando uma revisão dá MAIS detalhe do que o consenso que ela revisa, isso
é sinal de leitura — não de sorte.** A revisão preenche as lacunas do texto
primário com prática corrente, e **não marca a costura**: o leitor não
consegue distinguir o que a diretriz diz do que o revisor acrescentou.

**Por que virou regra escrita.** Ao buscar a conduta do estado misto
CAD+EHH, a revisão do *Cleveland Clinic Journal of Medicine* sobre o
consenso ADA/EASD 2024 apresentou três parâmetros como se fossem do
consenso:

| Parâmetro | CCJM (secundária) | Texto primário |
|---|---|---|
| Taxa de insulina no misto | 0,1 U/kg/h | ✅ está lá, p. 1265, explícito |
| **Fluido no misto** | "standard DKA protocol, 500–1.000 mL/h" | ❌ **não menciona** |
| **Meta glicêmica no misto** | "≈200 mg/dL" | ❌ **não menciona** |

Os três vinham com a mesma aparência de citação. Só a leitura do primário
(obtido em PDF depois de dois paywalls) separou o que é diretriz do que é
extrapolação razoável do revisor.

**O erro é plausível por construção**, e é isso que o torna perigoso: o que
a revisão acrescenta costuma estar clinicamente certo — fluido de CAD e meta
de 200 no misto são derivações defensáveis. O defeito não é o conteúdo, é a
**procedência**: escrever "o consenso recomenda" sobre algo que o consenso
não diz é o erro do ART (D-6) chegando por outra porta.

**Corolário do R-5, e é operacional:** quando a secundária responde com mais
especificidade do que se esperava da pergunta, procure o primário antes de
escrever. Falta de detalhe na secundária é sinal honesto; **excesso de
detalhe é sinal de costura invisível**.

**E quando o primário for inacessível:** aceitar a secundária é **exceção
declarada**, não padrão — a fonte entra no conteúdo marcada como secundária
(precedente do flumazenil: bula do FDA como corroboração, brasileira como
primária), e a confirmação no texto primário vira dívida registrada. Para
DOSE e LIMIAR a régua continua sendo a primária.

---

## R-39 · Descrição não é critério

**Frase observacional numa diretriz — *"a maioria dos pacientes com X
apresenta Y"* — lida como regra de decisão — *"X exige Y"* — produz critério
MAIS RESTRITIVO que o da fonte, com atribuição que parece correta porque o
número está mesmo no documento.**

**Por que virou regra escrita.** A árvore do CAD/EHH exigia
`HCO₃⁻ > 18` como critério de EHH, atribuído a *"critérios formalizados no
consenso 2024"*. O 18 está no consenso — mas na **narrativa** da p. 1262:

> *"most people with HHS have an admission pH ≥7.30 and a bicarbonate level
> ≥18 mmol/L, mild ketonemia may be present"*

O critério **formal**, na **Figura 2B**, é `pH ≥7,3 E bicarbonato ≥15`. A
frase descreve a população típica; não define o limiar. Efeito: paciente com
bicarbonato 16 deixava de preencher EHH numa tela que citava a diretriz
corretamente pelo nome e pelo ano.

**Como detectar, e é mecânico:** quando um número vier de diretriz,
conferir se está numa **TABELA ou FIGURA de critérios** ou no **texto
corrido**. Se estiver no corrido, procurar a tabela antes de usar como
regra. Diretrizes descrevem muito mais do que exigem, e as duas coisas
usam os mesmos números.

**A diferença para o R-36** — as duas são da mesma família, e distingui-las
importa:

| | O que varia | Exemplo |
|---|---|---|
| **R-36** · falso amigo | dois CONSTRUTOS, mesmo número | `FC < 110` como elegibilidade ambulatorial de TEP × alvo de controle de FA |
| **R-39** · descrição × critério | mesmo construto, dois STATUS EPISTÊMICOS | bicarbonato ≥18 que a fonte OBSERVA × ≥15 que a fonte EXIGE |

No R-36 o erro é aplicar o número à pergunta errada. No R-39 é aplicar à
pergunta certa um número que a fonte nunca ofereceu como resposta.

---

## R-40 · Nó TRANSVERSAL com conduta condicional

**Regra escrita num nó por onde TODOS os caminhos passam vale como se fosse
universal — mesmo tendo nascido de um cenário. E o app não apenas permite a
leitura errada: ele CONDUZ até ela.**

**Por que virou regra escrita.** O nó `pressao_alta` da Ventilação dizia
*"aceitar hipercapnia permissiva (pH ≥ 7,20)"*, sem qualificação. Os SETE
cenários do módulo roteiam para `seguranca`, e `seguranca` roteia para
`pressao_alta` sempre que as pressões sobem. O piso de 7,20 é convenção da
SDRA — mas ali ele governava asma, TCE, choque séptico, obeso e pulmão
normal.

**E o paciente mais ameaçado era o mais propenso a chegar lá.** Na acidose
metabólica grave, a ventilação-minuto necessária é altíssima → FR alta →
hiperinsuflação → platô alto → `pressao_alta`. O nó transversal entregava
justamente a conduta que causa a parada que o cenário existe para evitar.

**A diferença para uma regra mal escrita num nó comum:** num nó de cenário,
a leitura errada exige que alguém generalize por conta própria. Num nó
transversal, a generalização já está feita pela estrutura — a navegação é a
generalização. Não há "quem leu errado".

**O que fazer:** conduta que só vale para alguns cenários NÃO pode morar em
nó transversal sem carregar a condição junto. E a condição vem ANTES da
conduta no texto: quem chega a um nó de pressão alta está sob pressão, lê a
primeira linha e age — ressalva no fim é ressalva não lida.

**O QUE A VARREDURA CONFIRMOU — e é onde procurar no futuro.** Feita a
varredura das 17 árvores (24 nós com ≥3 ramos de entrada; 17 são nós de
decisão sem conduta), sobraram 7 nós transversais com conduta e **2 tinham o
defeito** — `pressao_alta` da Ventilação e `prevencao_secundaria` das
Coronárias.

Nos DOIS casos a árvore **sabia a distinção no nó de cenário e a perdeu no nó
de convergência**. A Ventilação qualifica a hipercapnia permissiva dentro dos
ramos de SDRA e obstrutivo, e a solta no `pressao_alta`. As Coronárias
escrevem "se fibrinólise → clopidogrel" no nó agudo, e prescrevem
"ticagrelor ou prasugrel" na prevenção secundária, para onde os cinco
caminhos de reperfusão convergem.

Não é ignorância — é o ponto em que os caminhos se juntam e alguém escreveu
a versão mais comum. **Nó de convergência é onde a condicionalidade evapora**,
e é ali que a varredura deve começar.

**Os cinco nós CORRETOS são o modelo, e valem como referência escrita:**

- **`observation_phase` (Anafilaxia)** — recebe três ramos e estratifica o
  tempo de observação POR GRAU (I: 2–4 h · II: 4–6 h · III/IV: 12–24 h em
  área monitorada), em vez de dar um número único. Quem escreveu percebeu a
  transversalidade e respondeu a ela.
- **`pretratamento` (ISR)** — o título já declara "uso seletivo por cenário",
  cada item traz a sua indicação (fentanil em coronariopata, lidocaína em TCE
  grave e asma) e a última linha fecha o caso vazio: *"sem indicação dos itens
  acima → seguir direto para a indução"*. É a forma de escrever conduta
  seletiva num nó por onde todos passam: condição por item, e saída explícita
  para quem não preenche nenhuma.

**Como varrer:** listar os nós alcançáveis a partir de mais de um ramo
(`seguranca`, `pressao_alta`, `monitorizacao`, `destino` e equivalentes nas
17 árvores) e, em cada um, perguntar de cada conduta: *"isto vale para TODOS
os cenários que chegam aqui?"*. Onde não valer, a condição entra no texto.

---

## R-41 · Invenção que PREENCHE LACUNA é mais difícil de pegar que divergência

**Um número que CONTRADIZ a fonte se acha comparando. Um número que preenche
um vazio DELIBERADO da fonte não contradiz nada — parece completar.**

**Por que virou regra escrita.** O engine morto da Anafilaxia trazia
`SpO₂ < 92% = Grau III`. A árvore usa **Ring e Messmer modificada**, cujos
quatro graus são **sindrômicos por construção**: o Grau III é "envolvimento
multiorgânico grave com colapso cardiovascular" — a escala não tem número
nenhum, e isso é escolha, não omissão.

O limiar inventado sobrevivia a qualquer conferência: a escala estava citada
corretamente pelo nome, o número não conflitava com nenhuma outra parte do
app, e "SpO₂ < 92% é grave" é clinicamente plausível. **Ele parecia a parte
que faltava.**

**Como detectar, e a pergunta é outra:** quando a fonte é QUALITATIVA e o app
tem NÚMERO, perguntar **de onde veio o número** — não se ele está certo.
"Está certo?" é respondível com plausibilidade clínica, e a plausibilidade é
exatamente o que faz a invenção passar. "De onde veio?" não é.

**A família completa — três formas de o número estar errado com a fonte
citada corretamente:**

| Regra | O que varia | Caso |
|---|---|---|
| **R-36** · falso amigo | mesmo número, CONSTRUTO diferente | `FC < 110` — elegibilidade ambulatorial de TEP × alvo de FA |
| **R-39** · descrição × critério | mesmo construto, STATUS epistêmico diferente | bicarbonato ≥18 que a fonte OBSERVA × ≥15 que a fonte EXIGE |
| **R-41** · invenção que preenche | a fonte NÃO TEM número, e o app tem | `SpO₂ < 92%` dentro de uma escala sindrômica |

As três passam por revisão de coerência interna. Só fonte externa separa.

---

## R-42 · Relocação entre MÓDULOS pode ser relocação entre DOENÇAS

**Texto que trata o mesmo SINTOMA em doenças diferentes parece reaproveitável
e não é: o sintoma é compartilhado, o mecanismo não.** Antes de mover conteúdo
de um módulo para outro, confirmar que a INDICAÇÃO viaja junto — não só a
apresentação clínica.

**Por que virou regra escrita.** Ipratrópio e sulfato de magnésio foram
movidos do nó `dx_asma` da Insuficiência Respiratória para a Anafilaxia,
classificados como "defeito de alcance" — texto que já existia, só precisando
ser religado. **Não era.** Asma e anafilaxia compartilham o broncoespasmo e
não o mecanismo: inflamação crônica exacerbada × degranulação mastocitária
aguda. Mover o texto foi extrapolar entre doenças com a aparência de
reorganizar.

**A verificação em fonte absolveu o conteúdo e condenou a classificação** —
e o desfecho é mais instrutivo que uma condenação simples:

- **Ipratrópio** — a fonte de anafilaxia o põe em PRIMEIRA LINHA, não como
  adjuvante. Ao herdá-lo do ramo da asma eu o *rebaixei*: a relocação errou o
  sentido, não só a procedência.
- **Magnésio** — a indicação é da anafilaxia, mas a fonte remete
  explicitamente ao regime da asma grave para a DOSE. É analogia com aval,
  e o texto tem de dizer isso.
- **"Não substitui a adrenalina"** — não está na fonte. É princípio clínico
  meu, e agora está declarado como tal, para ninguém o atribuir depois.

**A RELOCAÇÃO CARREGA A POSIÇÃO NO FLUXO, NÃO SÓ O CONTEÚDO** — e este é o
ensinamento que nenhuma das duas perguntas óbvias teria alcançado.

O ipratrópio chegou à Anafilaxia com o STATUS que tinha na asma: adjuvante de
refratariedade. Na anafilaxia ele é PRIMEIRA LINHA. O conteúdo estava certo, a
fonte estava certa, a droga estava certa — e o efeito foi **atrasar uma
primeira linha**, porque a hierarquia veio junto com o texto.

Não é erro de conteúdo nem de procedência: é hierarquia importada. E ela é
invisível na conferência, porque nada no texto relocado declara o próprio
status — o status vem da POSIÇÃO que ele ocupava no fluxo de origem.

**Ao mover conteúdo, são DUAS perguntas, não uma:**
1. *"Vale nesta doença?"* — a pergunta da indicação.
2. *"Vale COM A MESMA PRIORIDADE nesta doença?"* — a pergunta da hierarquia.

A segunda é a que se esquece, e é a que produziu este caso.

**É o R-36 aplicado a CONTEÚDO em vez de a número:** mesmo texto, construto
diferente. E tem um agravante próprio — o número viaja sozinho e é
conferível; o texto viaja com a autoridade de já estar escrito no app.

**O NOME DO ARQUIVO É UMA AFIRMAÇÃO.** `lib/broncoespasmo-refratario.ts`
prometia ser a referência do assunto para qualquer doença, e entregava
conteúdo de anafilaxia com uma parte emprestada da asma — além de rotular
como "refratário" o ipratrópio, que é primeira linha. Renomeado para
`broncoespasmo-anafilaxia.ts`, com as duas camadas separadas e a procedência
de cada uma escrita. Fonte única com nome genérico demais convida ao mesmo
erro que ela existe para impedir.

---

## O corte de escopo do Bloco 3 — a razão, para não parecer cansaço

O Bloco 3 da D-22 foi reduzido de 10 fontes externas para 6. **A razão não é
economia de esforço, e registrar isso importa:** conteúdo que não muda conduta
não justifica o mesmo rigor que conteúdo que muda.

Os itens do Bloco 3 são refinamento — periodicidade de reavaliação,
orientação descritiva de modos ventilatórios, equivalências de índice. Nenhum
é lacuna de segurança como a alergia a beta-lactâmico (Bloco 1) ou o veto da
hipercapnia permissiva em nó transversal (R-40). Gastar neles o mesmo custo de
verificação gastaria a régua onde ela rende menos, e a régua é finita.

**O que NÃO entra no corte, e o critério é esse:** qualquer item que afirme
risco, indique conduta, ou traga número que o médico vá aplicar. Os quatro que
seguiram para fonte externa (NNT da VNI, limiar de resistência, equivalência
S/F, doses de corticoide) e os dois acrescentados na verificação retroativa
(fator de risco de bifásica, broncoespasmo na anafilaxia) são todos desse
tipo. O que se aplica direto é o que descreve sem prescrever.

---

## R-43 · Trava que APONTA para o arquivo × trava que PERMITE o arquivo

**Antes de mover ou deletar um arquivo, perguntar de cada trava que o cita:
ela VIGIA este arquivo, ou ela AUTORIZA o conteúdo dele?** As duas parecem
iguais no `grep` — as duas contêm o nome do arquivo — e exigem ordens opostas
de execução.

**Trava que APONTA** (vigia consumidores, lê o arquivo, compila o arquivo)
pode ser retargetada ANTES da deleção: reapontar para o destino novo, ver
passar, e só então apagar. Se o retarget falhar, falha com o original ainda
no lugar, e dá para comparar.

**Trava que PERMITE** (lista de legado, exceção declarada, passivo aceito)
**não pode** ser tocada antes: tirar a entrada enquanto o arquivo existe faz
o conteúdo dele virar violação NOVA, e a trava fica vermelha por um defeito
que não existe. A entrada tem de morrer **no mesmo commit** que o arquivo.

**Por que virou regra escrita.** Eu propus "retarget primeiro, deleção
depois" como sequência geral da D-22, e ela quebrou na primeira execução em
duas travas:

| Trava | Tipo | O que aconteceu |
|---|---|---|
| `valida-dobutamina` | aponta (lista de consumidores) | retarget passou limpo — 38 verificações |
| `valida-frase-composta` | **permite** (passivo legado de 22 frases) | tirar as entradas com os arquivos vivos gerou *21 frases novas fora da tradução* |
| `valida-escopo-pediatrico` | **permite** (exceção dos 3 engines) | tirar a exceção com os arquivos vivos gerou *4 problemas* |

Nos dois casos o vermelho era artefato da ORDEM, não defeito. Revertidos e
movidos para o commit da deleção, passaram.

**O teste, em uma pergunta:** *se eu apagar esta entrada e o arquivo continuar
existindo, a trava fica vermelha?* Se sim, é trava que permite — a entrada
está acoplada à existência do arquivo, e separá-las quebra necessariamente.

**Onde mais isto vale:** todo passivo declarado do app tem essa forma — o
legado de frases compostas, as exceções de escopo pediátrico, os
`MORTOS_CONHECIDOS` da alcançabilidade, os contratos vigiados do R-25. São
listas que dizem *"isto é aceito"*, e o aceite morre com o aceito.

---

## R-44 · Trava VERMELHA como sinal de SUCESSO

**Trava calibrada sobre um estado defeituoso passa a acusar quando o defeito é
corrigido.** A reação errada — e é a reação natural — é afrouxar o limiar até
o verde voltar. Quando uma trava cai numa correção, a pergunta certa não é
*"como faço passar?"*, é **"o que mudou no mundo que ela media?"**.

**O caso.** `valida-isr` exigia **≥ 2 sítios** prescrevendo succinilcolina por
quilo, e o limiar existia contra cegueira de varredura: se a busca achasse
menos de dois, provavelmente tinha quebrado. Após a deleção da D-22 ela caiu —
só um sítio restou.

Investigado em vez de afrouxado: o segundo sítio **era o
`sepsis-engine`**, e ele **era o achado R-25 da Fase 1** — prescrevia
`1,5 mg/kg` SEM o teto de 200 mg, com `lib/doses-isr.ts` declarando o teto ao
lado. A Sepse hoje **delega a via aérea ao ISR** (D-24, R-33) em vez de
prescrever por conta.

**Um sítio é o número CERTO — é o que a fonte única quer.** Exigir dois seria
exigir a duplicação que a auditoria passou meses removendo. O piso foi para 1
**com a razão escrita no código**, e a trava mantém dente: acusa se cair a
zero.

**A distinção que decide:** baixar o piso COM a razão escrita é correção;
baixar para passar é regressão. As duas produzem o mesmo diff — a diferença
está inteira no comentário, e é por isso que o comentário não é opcional.

**Como reconhecer a classe:** toda trava com limiar de VOLUME (`if (vistos <
N)`, `if (arquivos < N)`, `if (ok < N)`) mede o mundo, não o código. Quando o
mundo encolhe por decisão — deduplicação, deleção, delegação —, ela acusa. É
o preço de ter piso, e o piso vale a pena: sem ele, varredura que cega passa
verde.

---

## R-15 · Acréscimo — verificar RODANDO não basta quando a condição some depois

Ao remover entradas de trava com regex durante a D-22, verifiquei rodando a
trava: passou. **E estava errado.** O regex casou uma das duas entradas
(`eap-engine`) e deixou a outra (`sepsis-engine`); a trava passou porque o
arquivo **ainda existia** — a leitura funcionava. O erro só apareceu no commit
seguinte, quando o arquivo sumiu e a suíte quebrou com `ENOENT` no meio da
cadeia.

**A regra:** quando a edição prepara um estado FUTURO (deleção, migração,
renomeação), a execução no estado ATUAL não prova nada — a condição que
mascara o erro ainda está lá. Conferir o **texto resultante** (`grep -c` do
que deveria ter sumido) é o que vale.

Vale para todo regex de remoção, e o custo é uma linha.

---

## R-45 · Prática ANTIGA na cabeça de todo mundo é uma fonte concorrente

**Quando a orientação mudou e a prática antiga é amplamente conhecida, não
basta escrever a nova: é preciso escrever POR QUE a antiga saiu.** Senão o
leitor reconhece o assunto, não encontra a regra que ele já sabe, e repõe a
que tem na cabeça.

**Por que virou regra escrita — e o caso é sobre mim.** Ao propor o texto de
FV fina × assistolia, formulei a assimetria assim: *"deixar de desfibrilar FV
fina perde uma desfibrilação; desfibrilar assistolia custa um choque inútil e
uma interrupção"*. A conclusão natural dessa formulação é **"na dúvida,
choque"** — que é exatamente a prática histórica.

A fonte corrigiu duas coisas:

1. **Desfibrilar assistolia é *potencialmente danoso*, não apenas inútil.** Meu
   enquadramento subestimava um dos lados — e era justamente o lado que
   sustentaria o "na dúvida, choque".
2. **A recomendação atual não é escolher um lado sob dúvida — é CONFIRMAR:**
   duas derivações e ajuste de ganho, ANTES de concluir. A manobra leva
   segundos e cabe no tempo da parada.

**O que o texto precisou carregar, e é a regra:** não só a conduta certa, mas
**a razão de ela não ser um padrão** — *"os dois erros têm custo, e a manobra
que os separa cabe no tempo da parada"*. Sem essa frase, quem lê "confirme"
sem entender por que não há atalho reintroduz o atalho que aprendeu.

**Como reconhecer a classe:** toda vez que a conduta correta é *"verifique
antes de decidir"* num cenário de urgência, existe uma prática antiga de
decidir sem verificar — e ela é mais fácil de lembrar. O texto compete com
ela, não com o vazio.

---

## R-15 · Acréscimo — quando nem o texto resultante basta, imprima o LITERAL

Já estava registrado que verificar RODANDO não basta quando a condição que
mascara o erro só some depois, e que conferir o TEXTO RESULTANTE é o que vale.
Falta um terceiro degrau, e ele apareceu numa edição de duas linhas que me
custou sete tentativas.

Um `replace` colapsou duas propriedades de objeto na MESMA linha (`caution:` e
`source:`). O sintoma foi `TS1117: multiple properties with the same name` — que
aponta a duplicação, não o colapso. E a partir dali cada correção foi feita
**inferindo a forma do arquivo** em vez de olhar para ela: eu editava o que
esperava encontrar, o erro mudava de linha, e eu repetia.

O que resolveu foi imprimir as duas linhas com `repr()`, escapes visíveis.
**Defeito em espaço e quebra de linha não aparece em `grep`, não aparece na
mensagem do compilador, e não aparece numa leitura normal do arquivo** — só
aparece quando os caracteres invisíveis viram visíveis.

**A escala completa, do mais barato ao mais caro:**

| Degrau | Pega |
|---|---|
| rodar a trava | comportamento, no estado atual |
| `grep -c` do que deveria sumir | presença/ausência de texto |
| **`repr()` da região editada** | **espaço, indentação, quebra de linha, colagem** |

**O gatilho para subir de degrau:** duas tentativas de correção sem que o erro
mude de natureza. Se a terceira for outra inferência, ela vai falhar também —
a essa altura o problema não é o que se está editando, é o que se está
imaginando sobre o arquivo.

---

## R-47 · Nunca reverter por `git checkout` dentro de um ciclo de mutação

**Antes de mutar, copie o arquivo para o scratchpad. Para desfazer, restaure a
cópia.** `git checkout` só com árvore limpa e por decisão explícita — nunca
como passo de rotina dentro de um teste.

**Por que virou regra dura, e não mais uma nota.** Quatro perdas de trabalho
nesta auditoria, todas pelo mesmo mecanismo. A quarta foi a mais instrutiva
porque o comando foi meu e imediato: mutei um arquivo para provar uma trava,
a trava acusou corretamente, e eu revertei com `git checkout <arquivo>` —
levando junto **nove edições** feitas minutos antes, no mesmo arquivo, que
ainda não estavam commitadas.

**O padrão:** mutação e reversão andam juntas, e **a reversão alcança mais que
a mutação**. `git checkout` desfaz até o último commit, não até antes da
mutação — e num ciclo de auditoria a distância entre esses dois pontos é
justamente o trabalho da sessão.

**O procedimento:**

```
cp arquivo.ts /tmp/scratch/arquivo.bak   # ANTES de mutar
# ... muta, roda a trava, lê o resultado ...
cp /tmp/scratch/arquivo.bak arquivo.ts   # restaura SÓ a mutação
```

**Sinais de que se está prestes a errar:** o comando de reversão é `git`
qualquer coisa; a árvore tem mudanças não commitadas; e a reversão vem no
mesmo fôlego da mutação, como se fosse parte dela. As três estavam presentes
nas quatro vezes.

**Quatro ocorrências é frequência que justifica ferramenta, não disciplina** —
o wrapper de mutação fica como dívida, e enquanto não existe, esta regra é o
que há.

---

## R-48 · Conteúdo certo na superfície errada

**O app sabe, e não diz onde importa.** Não é conteúdo ausente nem conteúdo
errado: é conteúdo correto, presente no app, distribuído na superfície em que
ninguém precisa dele.

### As três ocorrências que produziram a regra

| # | O que o app sabia | Onde estava | Onde faltava |
|---|---|---|---|
| 1 | AESP recebe epinefrina | reducer (fluxo) | card de Ritmos (consulta) |
| 2 | Atropina no SUS é 0,25 mg/mL — 1 mg são QUATRO ampolas | Farmacologia (consulta) | árvore de Bradicardia (ação) |
| 3 | Ureia × BUN não são o mesmo número | engine | calculadora onde o número é DIGITADO |

Três ocorrências, três módulos distintos, três direções — a de nº 1 vai do fluxo
para a consulta, as outras duas da consulta para o fluxo. Não é viés de um lado:
é ausência de critério.

### O critério: superfície de CONSULTA × superfície de AÇÃO

**Consulta** é onde se vai APRENDER: o médico abriu o módulo para estudar,
conferir, decidir antes. Tem tempo e tem navegação.

**Ação** é onde se está EXECUTANDO: o fluxo já começou, o paciente está na
frente, e cada toque de tela custa atenção que está sendo usada em outra coisa.

**O detalhe prático pertence à superfície de AÇÃO.** Quantas ampolas, qual
seringa, qual volume, qual apresentação — quem está conduzindo NÃO navega para
descobrir. E o inverso vale igual: a superfície de consulta precisa dizer o que
o fluxo faz, porque quem consulta está aprendendo o fluxo (ocorrência nº 1).

Não confundir com duplicação: o conteúdo é UM (fonte única), e aparece nas duas
superfícies por CONSUMO. A ocorrência nº 2 se resolveu com a árvore de
Bradicardia importando `lib/atropina.ts` — não copiando dela.

### Por que não é R-18 nem R-33

**R-18** é documentação que não protege código: o conteúdo está fora do app.
Aqui está DENTRO, e executa.

**R-33** é delegação — módulo A manda para B porque o assunto é de B. Aqui o
assunto é dos DOIS, e a superfície de ação não pode delegar: delegar é mandar
navegar, que é exatamente o custo que não se pode pagar durante a condução.

É distribuição errada de conteúdo correto.

### É varrível

A pergunta tem forma de busca: **toda dose administrada num fluxo cuja
apresentação só existe num módulo de consulta.** Não foi varrido — entra como
pergunta 7 do checklist de módulo, respondida no turno de cada módulo, onde o
contexto para julgar "é detalhe de ação?" já está aberto.

---

## R-49 · Campo do episódio corrente servindo à documentação

**A camada que DECIDE e a camada que REGISTRA não podem ler a mesma variável.**

### O caso

O resumo de uma parada com 4 choques, ROSC e re-parada dizia **"Choques
aplicados: 0"**. Não era bug de contagem: o reducer zerava `deliveredShockCount`
na re-parada — corretamente, porque `medications.antiarrhythmic.administeredCount`
é o que impõe o teto de 2 doses, e o segundo episódio recomeça com direito às
suas duas. A camada de registro é que não podia estar lendo a variável de
controle.

### Por que o nome não é "contador que zera"

Foi a DURAÇÃO que revelou a fronteira certa. Ela não zera — cresce — e mesmo
assim entra na mesma classe: se o handler reiniciasse `protocolStartedAt`, o
prontuário passaria a dizer que a reanimação durou o tempo da segunda parada.
O erro é o OPOSTO (encolher uma medida em vez de zerar um total) e o efeito no
documento é o mesmo.

"Contador" cobre metade da classe. O que a define é **qualquer campo derivado do
EPISÓDIO CORRENTE servindo à DOCUMENTAÇÃO** — contador, timestamp, flag,
duração, lista. A pergunta que separa:

> Este campo existe para o algoritmo DECIDIR o próximo passo, ou para alguém
> LER depois o que aconteceu? Se as duas respostas forem sim, são dois campos.

### O que fazer

A camada de decisão fica intacta — mexer nela troca um defeito por outro, e o
outro custa uma dose de antiarrítmico ao paciente. A camada de documentação
ganha fonte própria (`closedEpisodes` acumulando os totais antes do zeramento),
e a conferência é feita contra uma fonte INDEPENDENTE — no caso, o timeline, que
é escrito por outro caminho e não é tocado pela re-parada.

### Onde procurar

Todo módulo com estado que REINICIA sem que o atendimento acabe: re-parada,
segunda tentativa de IOT, nova crise convulsiva, novo bolus no choque. Onde o
algoritmo tem motivo legítimo para esquecer, o prontuário tem motivo legítimo
para lembrar — e é ali que as duas camadas se confundem.

---

## R-50 · Truncamento de exibição é perda silenciosa

**Conteúdo que está no arquivo, passa em toda conferência de texto, e não chega
à tela — porque alguma camada corta a lista antes de renderizar.**

É o código morto uma camada acima: lá o arquivo não é executado; aqui ele é
executado, produz o conteúdo certo, e o conteúdo é descartado na exibição.

### O caso, e ele aconteceu DUAS vezes no mesmo dia

A ressalva da FV fina foi acrescentada aos `details` do motor no intent
`analyze_rhythm`. Estava no arquivo, versionada, traduzida, e:

1. **Primeira falha** — `toConciseDetails` corta em 3. Anexada ao FIM, ela
   aparecia em `avaliar_ritmo_preparo` (poucos detalhes) e **sumia em
   `avaliar_ritmo`** — o único estado em que se decide chocável × não chocável.
   Corrigido reservando o lugar: 2 detalhes + a ressalva.

2. **Segunda falha, depois da "correção"** — a tela do ACLS renderiza apenas
   `details[0]`. Com a ressalva em 3º, ela continuava invisível. Só apareceu
   quando ganhou elemento próprio no card de decisão.

**A lição está na segunda:** eu já sabia do truncamento, corrigi para o
truncamento que conhecia, e havia outro adiante. Truncamento se acumula em
camadas, e cada camada é um lugar onde o conteúdo pode morrer.

### A assimetria que torna a classe perigosa

**Conteúdo anexado ao fim de uma lista truncada some primeiro justamente onde há
mais conteúdo — e onde há mais conteúdo costuma ser onde a decisão é mais
complexa.** A ressalva vale mais no estado cheio, e é ali que ela cai.

### Como se verifica

**Por execução, no estado que importa** — nunca por leitura do arquivo, e nunca
só no estado mais simples. A asserção que ficou é de TELA RENDERIZADA
(`e2e/acls-fluxo.spec.ts`): conferir o arquivo teria aprovado o defeito nas duas
vezes.

### Onde procurar — inventário dos truncamentos do app

Levantado nesta varredura. **Nenhum corrigido**: a lista é o produto, e cada um
se resolve no turno do módulo dono.

| Onde | Corte | O que fica de fora hoje |
|---|---|---|
| `acls/presentation.ts:292` `toConciseDetails` | `details.slice(0, 3)` | qualquer 4º detalhe do estado — **origem do caso da FV fina** |
| `components/protocol-screen/acls-protocol-screen.tsx` | usa só `details[0]` | 2º e 3º detalhes de TODO estado do ACLS. É o corte mais agressivo do app, e o menos visível |
| `protocol-header-card.tsx:52` | `details.slice(0, 2)` | 3º detalhe — **terceiro corte da MESMA lista** |
| `acls/reversible-cause-assistant.ts:463` | `required.slice(0,2)` + `optional.slice(0,1)` | dados faltantes além do 3º, na sugestão de causa |
| `acls/reversible-cause-assistant.ts:807–808` | evidência `slice(0,4)` / contra-evidência `slice(0,2)` | **assimétrico**: mais espaço para confirmar que para refutar |
| `acls/debrief.ts:262,268,308` | `slice(0,3)` / `slice(0,5)` | itens do debrief além do 3º/5º |
| `acls/debrief.ts:754,757` | `supportingSignals/relatedActions.slice(0,2)` | sustentação e ações da 3ª em diante |
| `debrief-card.tsx:216,250` | `timeline.slice(0,8)`, `replayBlocks.slice(0,5)` | eventos além do 8º numa parada longa — e parada longa é a que mais gera |
| `vasoactive-engine.ts:1604` | `buildReferenceLines(drug).slice(0,2)` | 3ª linha de referência do vasoativo |
| `module-hub.tsx:175` | `aclsSubIds.slice(0, 4)` | 4 dos 8 submódulos do ACLS no hub |
| `clinical-session-timeline.tsx:43` | `slice(0,3)` | eventos da sessão além do 3º |
| `ProtocolStepHeader.tsx:88` | `metrics.slice(0, 6)` | 7ª métrica em diante |
| `engine.ts:768`, `electrolyte-engine.ts:126`, `vasoactive-engine.ts:1770` | `slice(-3)` / `slice(-5)` | eventos mais ANTIGOS do log — corte pelo outro lado |

**Os dois de maior risco:** `details[0]` na tela do ACLS (descarta 2 de 3
detalhes já filtrados, no módulo mais crítico) e a assimetria evidência ×
contra-evidência no assistente de causas — 4 slots para sustentar uma hipótese
e 2 para derrubá-la é viés embutido na exibição.

### Pergunta para o checklist de módulo

> **O conteúdo que acabei de acrescentar chega à TELA, no estado em que ele
> importa?** Verificado por execução naquele estado, não no mais simples — e não
> pela presença no arquivo.

---

## R-51 · Assimetria de exibição a favor da contra-evidência

**Quando o app mostra o que sustenta e o que derruba uma hipótese, os dois lados
não merecem o mesmo espaço — e o lado que merece mais é o que derruba.**

### O caso

`acls/reversible-cause-assistant` — o assistente que ranqueia causas reversíveis
durante a parada — exibia `supportingEvidence.slice(0, 4)` e
`counterEvidence.slice(0, 2)`. **Dobro de espaço para sustentar uma hipótese do
que para derrubá-la, num assistente de causa de PCR.** Não foi decidido: é o
default de quem escreveu primeiro a lista principal.

Achado na varredura de truncamentos do R-50, sem estar sendo procurado.

### O argumento, que é o que sustenta a escolha de 2/4

**A evidência a favor já tem dois amplificadores.** Ela é o motivo de a causa
estar na lista — o ranking a colocou ali por causa dela — e confirma o que quem
conduz já suspeitava. Ela chega ao leitor com o vento a favor duas vezes.

**A contra-evidência trabalha contra a inércia da hipótese.** É a única coisa
capaz de tirar uma causa errada do topo, e ela precisa vencer tanto o ranking
quanto a convicção de quem está conduzindo.

**E cortar em 2 descartava justamente o achado específico que exclui** — que
raramente é o primeiro da lista. Sustentar uma hipótese com quatro sinais fracos
é fácil; derrubá-la costuma exigir UM achado preciso, e ele tende a vir depois
dos genéricos na ordem de geração.

Num contexto em que perseguir a hipótese errada custa minutos de RCP na direção
errada, o item que derruba vale mais que o quarto item que sustenta.

**Por que não 3/3.** Simetrizar parece neutro e não é: devolve o privilégio
estrutural ao lado que já tem os dois amplificadores. Neutralidade de exibição
não produz neutralidade de leitura.

### A trava de leitura, que é metade da correção

**O número de itens não pode ser lido como veredito.** Com 4 linhas de contra e
2 de sustentação, é natural concluir "o app está dizendo que não é isto" — e o
app não está dizendo nada disso: está listando **o que checar**.

Por isso os rótulos mudaram junto, e a mudança não é cosmética:

| Antes | Depois | Por quê |
|---|---|---|
| "Sustentação" | **"Sustentam"** | rótulo de placar convida a contar |
| "Reduz suspeita: …" | **"Checar para descartar: …"** | vira TAREFA, não voto |

"A favor × contra" com contagens competindo transforma lista de verificação em
conclusão. É exatamente o erro que a assimetria não pode induzir — e a razão
está escrita no código, para ninguém "simetrizar depois achando que corrige um
viés".

### Onde mais procurar

Todo par de listas em que uma sustenta e a outra questiona: achados × achados
discordantes, indicações × contraindicações, critérios de inclusão × exclusão.
A pergunta é sempre a mesma — **qual dos dois lados já chega com vento a favor?**

---

## R-52 · Fonte que rotula ano novo sobre conteúdo antigo

**O ano do TÍTULO não é procedência.**

### O caso

Ao buscar o alvo glicêmico pós-parada, uma página intitulada **"ACLS 2025 —
Post-Cardiac Arrest Care (ROSC Management)"** serviu:

| O que a página dizia | O que a fonte de 2025 diz |
|---|---|
| temperatura **32–36 °C por 24 h** | 32–37,5 °C por **≥ 36 h** |
| **SpO₂ 92–98%** | 90–98% |

São os números de **2020**, publicados sob rótulo de 2025. Não usei nada dela —
mas só percebi porque a faixa de temperatura estava fresca na memória da sessão.

### Por que é a forma mais perigosa de fonte secundária

**O rótulo do ano é exatamente o que se usaria para verificar atualidade.** Uma
página de 2020 honestamente datada é inofensiva: a data avisa. Uma página que
carimba 2025 sobre conteúdo de 2020 desliga o único sinal barato de
desatualização — e material de treinamento é o que mais aparece nas buscas,
porque é otimizado para elas.

### A regra

**Antes de aceitar qualquer material de treinamento como atual, confira-o contra
um número que se SABE ter mudado.** Aqui, a faixa de temperatura: quem ainda diz
"32–36 °C por 24 h" não acompanhou 2025, e portanto erra o resto sem avisar.

O teste tem de usar um número que MUDOU, não um que se manteve — conferir
"PaCO₂ 35–45" não separa material de 2020 de material de 2025, porque os dois
dizem a mesma coisa ali.

### É o oposto do R-38

**R-38:** a secundária INVENTA especificidade que a primária não tem — o "teto de
2,2 g" da amiodarona, que na bula é observação de ensaio.

**R-52:** a secundária PRESERVA especificidade que a primária já ABANDONOU — o
"32–36 °C por 24 h", que era recomendação e deixou de ser.

Nos dois casos o resultado é o mesmo: um número que parece ter lastro e não tem.
E nos dois a defesa é a mesma — abrir a primária, ou declarar que não se
conseguiu abrir (R-5).

---

## R-53 · Rótulo e ação com fontes independentes

**A classe mais perigosa de defeito de UI clínica, porque NENHUMA trava de
conteúdo a pega: o conteúdo está certo dos dois lados.**

### O caso

No estado `pos_rosc`, o botão mais proeminente da tela do ACLS exibia
**"Cuidar ROSC"** e executava **re-parada** — reiniciar a RCP do zero.

Dois caminhos que ninguém obrigava a concordar:

| | vem de |
|---|---|
| o rótulo | `screenModel.primaryActionLabel` |
| o handler | `getPrimaryDocumentationAction` → `actions[0]` |

Em `pos_rosc` a única ação de documentação disponível é `rearrest`, e o
fallback `actions[0]` a promovia a ação PRIMÁRIA. O rótulo, com outra cadeia de
fallback, continuava dizendo o que o estado fazia.

**Três consequências, e a terceira eu só descobri tentando verificar outra coisa:**

1. Um toque no controle mais proeminente zerava o episódio.
2. **Pulava a confirmação.** O `window.confirm` existia — dentro do `Pressable`
   dedicado de re-parada, com comentário explicando que protegia contra toque
   acidental. O caminho do botão herói chamava `registerDocumentationAction`
   direto e passava por fora.
3. **Os seis estados `pos_rosc_*` eram INALCANÇÁVEIS pela navegação principal.**
   O motor os tinha; a tela nunca chegava neles. O módulo inteiro de cuidados
   pós-parada, dentro do fluxo, estava atrás desse botão.

### ⚠️ O AGRAVANTE: a correção do debrief AMPLIFICOU este bug

Antes do R-49, um toque acidental zerava contadores e o dano morria ali. Depois,
com `closedEpisodes` acumulando, o mesmo toque **cria um episódio fantasma
DOCUMENTADO** — o prontuário passa a registrar duas paradas onde houve uma.

**A correção do registro não é invalidada por isso** — o defeito é do botão, não
do acumulador. Mas a lição fica: **melhorar o registro sem verificar QUEM ESCREVE
NELE aumenta o custo de qualquer entrada indevida.** Um sistema que registra
melhor registra melhor também o que não devia ter acontecido.

### As duas correções, e por que são duas

**1. Ação destrutiva nunca é fallback.** `getPrimaryDocumentationAction` passou a
excluir `ACOES_DESTRUTIVAS` do `actions[0]`. Corrige o CASO.

**2. Rótulo e handler passam a ter uma fonte só.** Havendo ação de documentação,
o título vem de `heroDocumentationAction.label` — a mesma coisa que o `onPress`
executa. Corrige a CLASSE: qualquer ação futura que chegue ali nomeia a si mesma.

### A confirmação pertence à AÇÃO, não à tela

**Regra, e ela é geral:** confirmação de ação destrutiva mora no PONTO DE ENTRADA
da ação, não no componente que a oferece.

A guarda vivia num `Pressable`. Qualquer novo caminho que chamasse
`registerDocumentationAction("rearrest")` a contornava — e foi exatamente o que
aconteceu, duas vezes: o botão herói e o **comando de voz**, que chama a mesma
função e também passava direto.

Telas se multiplicam; a ação é uma só. Agora `CONFIRMACAO_DE_ACAO` é um mapa no
ponto de entrada, e todo caminho passa por ele.

### Como varrer

Procurar botões em que o rótulo cita uma variável que o `onPress` não usa —
priorizando os que executam ação destrutiva ou irreversível. A varredura deste
turno achou **uma ocorrência**, a que originou a regra: os demais controles do
ACLS (CTA de medicação, `DecisionGrid`) derivam rótulo e handler do MESMO objeto.

**Mas o mecanismo é estrutural, não pontual:** basta o rótulo ter uma cadeia de
fallback (`a ?? b ?? c`) que o handler não compartilhe. Por isso a correção 2 —
sem ela, a próxima ação de documentação que chegasse àquele branch reproduziria
o defeito sem que ninguém escrevesse uma linha errada.
