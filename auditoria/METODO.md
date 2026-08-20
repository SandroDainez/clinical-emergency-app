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

11. **MIGRAÇÃO AUTOMÁTICA SOBRE CAMPO COMPOSTO ERRA DE LINHA EM SILÊNCIO.**
    Um script moveu um item de `evidence` para o `summary` em 17 nós. Ele
    localizava o campo por índice — `nb.index("\n      summary:")` — e depois
    procurava o fim da string com `index('",\n')`. Funcionou em 14 nós. Nos
    outros três o `summary` **não terminava em aspas**:

    ```ts
    summary: "Reavaliar PA, SpO₂, esforço respiratório..." + " " + NA_DUVIDA_ANAFILAXIA_RESPOSTA,
    question: "Qual é a resposta ao tratamento inicial?",
    ```

    O `index` do fecha-aspas caiu na **linha seguinte**, e o texto de conduta
    foi anexado à `question` em vez do `summary`. ⚠️ **O código compilou, os
    testes de conteúdo passaram, e a tela mostrou a frase — no campo errado.**
    Nada estourou porque o campo errado também é texto visível.

    **Quem viu foi a varredura de i18n**, e por acidente: a string composta
    mudou, então ela apareceu como tradução pendente. Sem o app ser bilíngue, os
    três nós teriam ido para produção com a conduta dentro da pergunta.

    **A regra.** Edição por posição pressupõe que o campo é um literal simples.
    Quando o valor pode ser **concatenação, constante importada ou template**, o
    índice do delimitador não é o fim do campo — é o fim de *alguma* string.
    Antes de migrar em massa: verifique que o campo alvo é literal em todos os
    casos, e **confira o resultado no objeto compilado**, não no fonte. A árvore
    compilada teria mostrado `question` com 250 caracteres onde havia 40.

    É primo do item 10: ali a trava deixou de enxergar conteúdo que mudou de
    lugar; aqui o script moveu conteúdo para o lugar errado. Os dois nascem de
    tratar como texto plano uma estrutura que já não é plana.

12. **CONSTANTE QUE SOBRA SÓ NO IMPORT É CONTEÚDO APAGADO, NÃO MOVIDO.**
    Na deduplicação do `coronary/ecg`, quinze itens de `evidence` foram
    removidos porque dez eram cópia do nó vizinho. O décimo quinto —
    `OMI_ENQUADRAMENTO` — **não tinha par em nenhum outro nó**. Depois da
    remoção ele ficou com UMA ocorrência no arquivo: a linha de `import`.

    ⚠️ O código compilou. O TypeScript não reclama de import não usado nesta
    configuração, nenhuma trava vigiava aquela constante, e o texto simplesmente
    deixou de existir na tela do app.

    **É a mesma assinatura do item 10 significando o OPOSTO, conforme a
    direção.** Ali, uma constante com o nome presente e o uso ausente fazia a
    trava passar sobre conteúdo que não chegava à tela. Aqui, a mesma
    configuração — nome no import, zero usos — é o rastro de conteúdo que foi
    APAGADO por engano. Uma contagem, dois defeitos, e o que muda é se aquilo
    era o estado inicial ou o resultado de uma edição.

    **A regra.** Ao remover um consumo, conferir se aquele era o ÚLTIMO. A
    pergunta operacional é `grep -c '\bNOME\b' arquivo`: se o resultado é 1, o
    que sobrou é o import, e o conteúdo saiu do app. É barato, e foi assim que
    o OMI/NOMI voltou — movido para `ecg_sem_supra`, onde pertencia.

13. **DESESCAPAR PARA LER E ESQUECER DE REESCAPAR PARA ESCREVER — e os DOIS
    silêncios que deixaram isso chegar longe.**

    Um script leu os literais de `lib/hemoperitonio.ts` para gerar as entradas do
    dicionário PT→ES. Para desescapar, fez `.replace('\\"', '"')`; para escrever,
    usou `'  "%s":'`. As duas frases que continham aspas internas — a do
    `\"o abdome está mole\"` e a do `\"a cada X minutos\"` — saíram com aspas
    CRUAS e quebraram o arquivo sintaticamente.

    ⚠️ **E O ARQUIVO QUEBRADO PASSOU EM `test:i18n`.** A varredura de tradução lê
    por regex e não compila TypeScript: para ela, "toda frase PT tem par em ES"
    continuava verdadeiro. Quem detectou foi o `build:web` — que eu havia rodado
    como `npm run build:web >/dev/null 2>&1`, **descartando o stderr**. O build
    falhou, eu não vi, e só apareceu quando o Playwright não conseguiu subir o
    servidor porque `dist/index.html` não existia.

    **Dois silêncios em série:** uma trava que não compila o que confere, e um
    comando cujo erro eu mesmo joguei fora. O primeiro é limitação conhecida do
    instrumento; o segundo foi escolha minha, e é a que não tem desculpa —
    `>/dev/null 2>&1` num build é apagar a única voz que restava.

    ⚠️ **E A TENTATIVA DE CONSERTO PIOROU.** Escrevi um regex para escapar aspas
    cruas em qualquer linha `"...":` do dicionário: ele alterou **31 linhas**
    quando duas estavam quebradas, porque o `.*` casava até a última aspa da
    linha e não até o fecha-aspas real. O arquivo foi restaurado do último commit
    e reescrito com `json.dumps`, que escapa por construção.

    **A regra, em três partes:**

    - ao gerar código, **serialize com o serializador** (`json.dumps`,
      `JSON.stringify`) em vez de interpolar com `%s`. Escape é problema
      resolvido; refazê-lo à mão é reintroduzir o bug;
    - **nunca silencie o stderr de um build ou de uma trava.** Se a saída é
      longa, use `| tail`, que preserva o código de saída e mostra o fim;
    - **conserto de sintaxe por regex sobre texto com aspas não funciona** — o
      delimitador é ambíguo por definição. Restaure e regenere.
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

13. **A TRAVA CASA A STRING CERTA NO PAPEL ERRADO — quatro mecanismos, uma
    causa.** Os itens 1, 9 e 10 acima descrevem o mesmo defeito por ângulos
    diferentes, e a quarta ocorrência fechou o padrão. A trava procura o TEXTO
    e não o PAPEL que aquele texto exerce no arquivo:

    | ocorrência | onde a string estava | que papel ela exercia |
    |---|---|---|
    | import satisfazendo consumo (2×) | linha de `import` | declaração de dependência — **não exibe nada** |
    | comentário que narra o defeito | bloco de comentário | documentação do erro — **o app não mostra comentário** |
    | conferência sobre lista vazia | em lugar nenhum | vacuidade: comparava vazio com vazio |
    | menção de procedência aceita como alvo | dentro da mesma constante, na frase *"o 25–34 vem do protocolo institucional"* | **explica de onde veio o número** — não declara o alvo terapêutico |

    A última é a mais instrutiva porque a string estava no arquivo CERTO, na
    constante CERTA, e ainda assim no papel errado: trocar o alvo de
    `PaCO₂ 25–34 mmHg` para `20–30` não derrubava a trava, porque o número
    seguia citado na frase que explica a procedência. **Presença não é
    declaração.**

    **A prova continua a mesma** — remover o USO, manter tudo o mais, e
    confirmar que a trava CAI. **O que muda é a pergunta que se faz antes de
    escrever:** *onde mais este texto aparece no arquivo, e em que função?* Se
    ele aparece em import, comentário, nota de procedência, exemplo, mensagem
    de erro da própria trava ou referência bibliográfica, a busca precisa de
    âncora — o bloco, a chave, ou o par completo (`PaCO₂ … mmHg` em vez de só
    o número).

**Corolário sobre o custo.** Os treze itens acima são checagem de escrita, não de
execução: custam minutos. As correções custaram rodadas inteiras de mutação,
e três delas só apareceram porque alguém releu a saída do comando. **Escrever
com a lista na mão é mais barato que descobrir por mutação** — e a mutação
continua obrigatória, porque a lista nunca vai estar completa.

14. **ASSERÇÃO DEPOIS DO RELATÓRIO NUNCA REPROVA.** Toda conferência acrescentada
    a um script que já existe entra **ANTES do portão** que imprime `falhas` e sai
    — não depois, e não "no fim do arquivo, junto do resumo".

    ⚠️ O caso (2026-08-17): acrescentei ao `valida-abdome-agudo.cjs` a conferência
    da posição do gatilho de retorno, inserindo-a antes da linha de sucesso. Só que
    o `if (falhas.length) { … process.exit(1) }` vem ANTES dessa linha: o bloco novo
    empurrava em `falhas` e **ninguém mais lia**. Rodei a mutação — devolver o
    gatilho ao fim do nó — e ela **passou verde com o defeito aplicado**.

    O erro não tem sintoma: a trava imprime ✅, o contador de conferências sobe, e
    a asserção nunca dispara. Só a mutação denuncia.

    > **A verificação é barata e é sempre a mesma: rode a mutação.** Se ela passa,
    > a asserção não está no caminho da execução — e o lugar é a primeira coisa a
    > conferir, antes do critério.

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
9b. **Os dois agentes equivalentes que este texto oferece estão na mesma FORMA?**
   (R-54) Um em ponto e o outro em faixa quebra a equivalência sem que nenhum
   número esteja errado — e o piso da faixa subdosa.
9c. **Este "teto" é limite ou é limiar de gravidade?** (R-56) Se a fonte diz
   "acima disso observou-se X", é descrição — escrever como teto subdosa.
9d. **Esta trava exige um LITERAL que a diretriz pode aposentar?** (R-55) Se o
   número é referência de prática, a trava vigia a ressalva. Se é o valor da
   própria intervenção, continua vigiando o número.
7b. **Este módulo tem nó de "não sei"? Então: o que só existe lá?** (R-48,
   hesitante × certo) Ressalva sobre a limitação do próprio julgamento
   pertence ao caminho de quem JÁ DECIDIU — no nó da dúvida ela também cabe,
   mas não pode morar só lá.
9f. **Esta constante nova é TEXTO ou NÚMERO?** (R-58) Se é texto, a constante é
   a frase inteira — compor no consumo tira a frase do dicionário e a varredura
   aprova as peças.
9e. **Este comentário explica por que algo NÃO foi feito?** (R-57) Se sim, tem
   data e tem a condição que reabriria o caso? Sem os dois é veto permanente —
   e o veto pode estar certo sobre o mecanismo e errado sobre a conclusão.
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

### R-47, forma nova · ARQUIVO NÃO RASTREADO NÃO VOLTA COM CHECKOUT

Registrada em 2026-08-18. A regra original manda copiar o arquivo para o
scratchpad antes de mutá-lo, em vez de contar com `git checkout`. Para arquivo
RASTREADO a cópia é cinto e suspensório. **Para arquivo NOVO ela é a única
volta** — e o comando não avisa:

    git checkout -q design-system/paleta-de-area.ts   # sai 0, não restaura nada

O arquivo tinha acabado de nascer no passo (b) e ainda estava como `??` no
status. A mutação havia removido a etiqueta « TCE » da paleta; o checkout saiu
limpo, e a linha continuou faltando. Quem lesse o código de saída concluiria que
o estado estava restaurado.

⚠️ **A VERIFICAÇÃO BARATA, que foi a que salvou:** depois de restaurar, conferir
que o CONTEÚDO bate com o original — não que o comando saiu limpo. Aqui foi a
própria trava que continuou vermelha e denunciou; a contagem de paletas contra a
cópia confirmou. É a mesma família do R-68: o valor a comparar é o objeto (o
arquivo), não o proxy (o exit code do comando que deveria tê-lo mudado).

Vale para todo artefato criado dentro do ciclo de mutação — arquivo novo, diretório
gerado, migração recém-escrita.

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

## Refinamento · Além de consulta × ação, existe HESITANTE × CERTO

**A superfície errada nem sempre é a de consulta. Pode ser a do médico que
ADMITIU não saber — enquanto falta na do que já decidiu.**

### O caso

O abdome agudo tinha, e bem escrito:

> *"Idoso, diabético, imunossuprimido, em corticoide ou gestante: o exame
> ENGANA — pode não haver defesa, febre nem leucocitose com víscera perfurada."*

Busca no app inteiro por "ENGANA", "imunossuprimido" e "corticoide": **uma
ocorrência**, dentro do nó `padrao_indefinido` — o nó a que se chega
respondendo *"tenho certeza do abdome agudo, mas NÃO do padrão"*.

**Quem escolheu "inflamatório" com convicção nunca via o aviso.** E é ele quem
precisa: **a convicção dele veio de um exame que engana.**

### Por que é uma classe, e não um descuido

O nó do "não sei" é escrito com cuidado — é o nó que a auditoria criou para
tirar o peso de decidir de quem não sabe, e por isso ele acaba concentrando as
ressalvas boas. O autor escreve a ressalva enquanto está pensando no médico
inseguro, e ela fica onde ele estava pensando. **O caminho do confiante recebe
conduta e não recebe dúvida** — que é exatamente o inverso do que a segurança
pede.

Há uma assimetria de guarda: quem chega ao "não sei" já está com a guarda alta
e vai reexaminar de qualquer jeito. Quem escolheu um padrão está com a guarda
baixa, e a única coisa que reabriria o caso é a ressalva que ele não vê.

### A regra

**Ressalva sobre a limitação do PRÓPRIO JULGAMENTO tem de estar onde alguém já
julgou, não onde ele admitiu não saber.** Aviso de que o exame engana, de que
o achado normal não afasta, de que o padrão pode mudar — todos pertencem ao nó
da decisão, e não ao nó da dúvida. No nó da dúvida eles também cabem; o que
não pode é morarem só lá.

### ⚠️ E A DIREÇÃO INVERSA, encontrada no módulo seguinte

Nas Intoxicações o mesmo eixo apareceu **ao contrário**: não sobrava conteúdo no
nó do "não sei" — **o nó não existia.**

A tela de toxidromes tinha a opção *"Indefinido / substância conhecida"*, que
mandava direto para a descontaminação. **Um rótulo para dois estados
epistêmicos OPOSTOS:** "não faço ideia do que é" e "sei exatamente qual
substância". Somados no mesmo botão, nenhum dos dois recebia conduta — e o
médico sem toxidrome definida, que é a maior parte dos casos reais, seguia o
fluxo sem que ninguém lhe dissesse o que fazer enquanto não sabe.

**As duas direções, juntas, definem o que se procura:**

| direção | sintoma | onde olhar |
|---|---|---|
| **sobra** (abdome agudo) | o nó do "não sei" concentra ressalvas que faltam no caminho do confiante | o que só existe lá |
| **falta** (intoxicações) | não há nó do "não sei", ou ele é um rótulo somado a outro | o que o hesitante recebe: nada |

E há um teste rápido para a segunda: **o rótulo da opção tem "ou" — explícito ou
disfarçado de barra?** Se tem, provavelmente há dois estados diferentes ali
dentro, e nenhum deles com conduta.

### A varredura devida (não feita)

**Em todo módulo com nó de "não sei" — ou "indefinido", ou "não tenho certeza"
—, conferir o que só existe lá** (e se ele existe). Fica como pergunta do checklist de módulo,
respondida no turno de cada um, e não como varredura própria: julgar se a
ressalva pertence ao caminho do confiante exige o contexto clínico aberto.

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

---

## R-54 · Doses pareadas se movem juntas

**Quando o app oferece dois agentes equivalentes, fixar um em PONTO e deixar o
outro em FAIXA quebra a equivalência em silêncio — e o piso da faixa subdosa.**

### O caso

O card da PCR na gestação dizia: *"cloreto de cálcio 10% **10 mL (1 g)** […] Só
há acesso periférico: gluconato de cálcio 10% **15–30 mL**"*.

O par da fonte é **5–10 mL ↔ 15–30 mL** — 5↔15 e 10↔30, razão 3× coerente nos
dois extremos. O texto fixou o cloreto no TOPO e manteve o gluconato na faixa
inteira.

**NENHUM NÚMERO ESTAVA ERRADO.** O 10 mL de cloreto está na fonte. O 15–30 mL de
gluconato está na fonte. A **correspondência** é que quebrou.

E a consequência é de dose: quem só tem acesso periférico lê *"1 g de cloreto…
se periférico, 15–30 mL de gluconato"*, escolhe 15 mL acreditando ser o
equivalente do que acabou de ler, e dá **metade**. Os 15 mL equivalem aos 5 mL
de cloreto que o card deliberadamente não oferece na parada.

### Por que nenhuma trava de valor pegaria

Todas as travas de conteúdo desta auditoria conferem NÚMEROS — contra a fonte,
contra o dono, contra a massa molar. Aqui os números estão certos e a
**forma de apresentação** é que produz o erro. É uma classe que só se pega
comparando os dois agentes ENTRE SI.

### A regra

**Ou os dois em PONTO, ou os dois em FAIXA com os extremos pareados.** Nunca um
de cada jeito.

Quando o app escolhe um ponto de um lado — porque o contexto pede a dose cheia,
como na parada —, ele tem de escolher o ponto CORRESPONDENTE do outro lado, não
repassar a faixa herdada da fonte.

### Distinção do R-36, que é primo e não é o mesmo

**R-36:** mesmo número, construto diferente — a mesma "2 g" significando coisas
distintas em cenários distintos.

**R-54:** mesmo construto, **forma diferente** — e a divergência de forma produz
erro de dose sem que nenhum número esteja errado.

### Onde procurar

Todo par de agentes intercambiáveis com potência diferente: os dois sais de
cálcio, amiodarona × lidocaína, cloreto × bicarbonato, gluconato × cloreto de
potássio, cristaloide × coloide em volumes equivalentes. A pergunta:
**os dois lados estão escritos na mesma forma?**

A trava `valida-gestacao` faz isso em universo aberto para os sais de cálcio:
acha as linhas em que os dois aparecem juntos e compara a FORMA de cada lado.

---

## R-55 · Trava de literal que virou portão: vigie a RESSALVA, não o número

**Quando o número é referência de PRÁTICA e não critério de entrada, a trava tem
de cobrar o qualificador — nunca o valor.**

### O caso

Duas travas da Sepse exigiam literais que a SSC 2026 aposentou:

| trava | exigia | o que 2026 diz |
|---|---|---|
| `hidrocortisona-4h` | `4 h` em toda frase com hidrocortisona + 0,25 | *"we suggest using intravenous corticosteroids"* — **sem gatilho de dose nem de duração** |
| `gatilho-vasopressina` | `0,25` em toda frase sobre associar | 2026 **não estabelece limiar**; o 0,25 é texto de prática de 2021 |

As duas **proibiam a atualização**: quem reescrevesse para 2026 e removesse o
número seria acusado por escrever o certo. É o D-12 do magnésio de novo, com
outro fármaco.

### A forma de resolver

Trocar a exigência de **valor** por exigência de **enquadramento**:

```
exige: [{ re: /(referência de prática|não é portão)/, porque: … }]
```

O número pode ficar — é útil como parâmetro — ou sair, porque a diretriz não o
exige. **O que não pode é aparecer como condição de entrada.**

E a trava fica mais forte, não mais fraca: antes ela protegia um literal
datado; agora protege a distinção clínica que sobrevive à próxima diretriz.

### ⚠️ A METADE QUE FAZ A REGRA UTILIZÁVEL: quando o literal continua certo

**Nem toda trava de literal deve virar trava de ressalva.** Sem este critério,
alguém converte todas e perde as que estavam certas.

O literal continua sendo a coisa certa quando o número é **invariante de
construto**, não parâmetro de prática:

- **`0,03 U/min` da vasopressina** — dose FIXA por desenho, não titulada. Não há
  faixa, não há contexto que a mude: mudar o número é mudar o fármaco de lugar.
  Esta trava fica exigindo o literal, e é o contraste que mostra que as outras
  duas eram de outra natureza.
- Alteplase `0,9 mg/kg máx 90 mg`, adrenalina `1 mg` na parada, o fator `3×`
  entre os sais de cálcio: valores fixos de referência, sem gradiente de prática.

**O teste:** *a diretriz DERIVA este número de um limiar de decisão, ou ele é o
próprio valor da intervenção?* No primeiro caso, vigie a ressalva. No segundo,
vigie o número.

### O custo que a trava estreita cobra — e não é só falso positivo

`valida-consistencia-clinica` exigia o literal **`máx`** no teto da alteplase e
da tenecteplase. Um texto novo escreveu *"TETO DE 25 mg"* e *"MÁXIMO 90 mg"* —
clinicamente idêntico, e a trava acusou.

**O falso positivo é o menor dos dois males.** O maior é o que ele PROVOCA:
quem quer o build verde reescreve *"TETO DE 25 mg"* como *"máx 25 mg"* para
satisfazer o vocabulário do instrumento. **O texto piora para agradar a trava** —
e ninguém registra que piorou, porque o build ficou verde.

É a trava mudando o conteúdo clínico pela porta dos fundos. E o efeito é
cumulativo: cada trava estreita empurra a escrita para o dialeto que ela
reconhece, até o app falar como os scripts em vez de falar como um médico.

**A regra:** trava sobre conteúdo clínico vigia a **SUBSTÂNCIA** — o teto
existe, a ressalva está lá, a contraindicação foi nomeada —, **nunca a palavra
que a expressa**. Se precisar de literal, aceite os sinônimos e **declare a
lista** no próprio código.

### O critério, explicitado — porque na aplicação seguinte ele faltava

A regra acima diz "vigie a substância", e isso ainda deixa a pergunta de onde
está a fronteira. O caso do politrauma resolveu: o `exige` cobrava a grafia
`≥ 100 para 50–69`, e a fonte única escreve `≥ 100 mmHg para 50–69` — mesma
informação, uma palavra a mais. Tornar o `mmHg` opcional foi a correção.

**A fronteira: vigia-se a FAIXA ESTAR DECLARADA, não a pontuação.** O que a
trava protege é a existência do fato clínico — a faixa dos 50–69 tem meta
própria e ela está escrita. Unidade, vírgula, maiúscula, ordem das palavras e
sinônimo são forma; exigi-los transforma o instrumento em revisor de estilo, e
o autor obedece ao estilo em vez de escrever o que é certo.

**E o sinal de alarme:** se a lista de sinônimos cresce demais, a verificação
está no nível errado. Cinco jeitos de dizer a mesma coisa significa que o que
importa não é a frase — é um fato que deveria estar em constante, conferido uma
vez, e consumido pelos sítios (a saída que a fonte única dá).

---

---

### ⚠️ A FORMA NOVA (2026-08-17): PALAVRA AMBÍGUA MEDIDA COMO SINAL

Irmã do portão, e mais silenciosa: a asserção cobra uma PALAVRA que tem dois
sentidos, e **um dos sentidos está garantido pelo contexto do nó**. A conferência
passa sempre, e não mede nada.

### O caso, e é o exemplo perfeito

A trava do gatilho do LAST no Choque exige que ele traga o PADRÃO cardíaco — porque
"colapso" sozinho não reconhece nada: todo choque colapsa. Escrevi:

```js
/bradicardia|arritmia ventricular|bloqueio/i
```

⚠️ Em português, **`bloqueio` é o bloqueio ANESTÉSICO (o procedimento) e o bloqueio
AV (o ritmo)**. E este gatilho fala obrigatoriamente do procedimento — "bloqueio,
peridural, infiltração". A palavra estava garantida no texto por outro motivo.

A mutação mostrou: encurtei o gatilho para *"colapso após bloqueio ou infiltração"*,
sem padrão cardíaco nenhum, e **esta conferência passou**, casando com o
procedimento. Reprovaram duas das três exigências, não três — e a que passou era
justamente a que eu tinha acabado de escrever.

### O teste, e ele é rápido

> **Existe algum texto PLAUSÍVEL deste nó em que essa palavra apareça SEM o
> sentido que eu quero medir?**
>
> Se não existe — se o contexto do nó garante a palavra por outra razão —, ela não
> serve como sinal.

Aplicado ao caso: um gatilho de LAST **sempre** vai dizer "bloqueio", porque é o
procedimento que causa. Logo `bloqueio` não distingue nada ali. Ficaram
`bradicardia`, `arritmia ventricular` e `assistolia`, que só têm um sentido.

### Por que ela escapa

Um portão (R-55 original) **reprova** o que devia passar — dói, e por isso é
descoberto. Esta **aprova** o que devia reprovar: não dói nunca, e só aparece
quando alguém escreve a mutação. É a mesma família do R-83 — medir a forma da
palavra em vez do que ela significa —, agora dentro da própria trava.

## R-56 · Limiar de gravidade lido como teto terapêutico

**Um número que a literatura usa para CLASSIFICAR vira, no app, um limite que não
se deve ultrapassar — e o efeito é subdosar quem precisa de mais.**

### Três ocorrências, três fármacos, o mesmo mecanismo

| app dizia | a fonte diz |
|---|---|
| amiodarona: "teto 2,2 g/24 h" | *"mean daily doses above 2100 mg were associated with an increased risk of hypotension"* — associação em ensaio |
| pós-PCR: "PAM ≥ 80 no choque" | proposta de documento conjunto 2023, **não endossada** em 2025 |
| adrenalina: "0,01–0,5" e "0,01–1" como faixa | *"> 0,5 […] often used in clinical trials as a threshold"* de dose alta; *"> 1 µg/kg/min […] associated with a 90% mortality"* |

Nos três, o número existe na literatura e **não é um limite**: é critério de
ensaio, marcador de prognóstico ou proposta recusada.

### Como detectar

**Quando o app declarar teto, perguntar em que FORMA a fonte enuncia o número:**

- *"não ultrapassar X"* / *"dose máxima X"* → **é limite**, escreva como limite.
- *"acima de X observou-se Y"* / *"X é usado como limiar em ensaios"* →
  **é descrição**, e escrever como limite muda a conduta na direção perigosa.

A diferença não é de ênfase: descrição vira proibição na cabeça de quem lê, e
a proibição faz parar de subir a dose em quem está morrendo por falta dela.

### Parente do R-39, aplicado a dose

**R-39:** descrição não é critério — aplicado a DIAGNÓSTICO (o "≥ 150 bpm" da
taquicardia, que era observação epidemiológica virando porta de entrada).

**R-56:** descrição não é limite — aplicado a DOSE. E aqui o erro tem direção:
sempre subdosa, porque limiar de gravidade sempre marca o extremo superior.

### O que escrever no lugar

O app já tinha a forma certa, na entrada da noradrenalina em `vasoactive-engine`:
faixa usual + o número nomeado como o que ele é. *"0,01–1 (faixa habitual); > 1 =
dose alta (marcador de gravidade — SOFA cardiovascular)"*. Foi o modelo usado
para a adrenalina.

---

## R-58 · Fonte única de TEXTO é a frase inteira; compor no consumo só vale para NÚMERO

**A recomendação que esta auditoria mais repete — extrair para uma constante e
consumir — tem uma forma certa e uma errada, e a errada custa a tradução.**

### O mecanismo

A varredura de tradução extrai **literais** do código-fonte. A tela mostra a
**frase**. Duas formas de compor deixam a frase fora do dicionário:

```ts
// ERRADO para texto — a soma não tem chave, e a varredura aprova as peças
"2ª linha — " + VASOPRESSINA_DOSE

// ERRADO para texto — template com ${} é pulado por desenho (D-19)
`Metas: PaCO₂ ${ALVOS_TCE.paco2} · SpO₂ ${ALVOS_TCE.spo2}`

// CERTO para texto — a constante é a frase inteira, o literal continua literal
TCE_METAS_NEUROPROTECAO
```

Na composição a varredura é pior que cega: ela **afirma** que está tudo
traduzido, porque cada peça está.

### E o vínculo com a fonte, que a interpolação dava de graça?

Vira trava. A frase literal repete os números do objeto, e um script confere
que continuam batendo — é o que `test:vm` já fazia para três frases do TCE e o
que `test:tce` passou a fazer por **execução**, sobre o texto que a árvore
produz. **Literal com trava, em vez de interpolação sem tradução.**

### Quando compor É o padrão certo

Quando o que varia é **NÚMERO derivado do paciente** — `{peso}`, `{vc6}`,
`{manitolMin}`. Aí a frase-molde é literal e traduzida, e o motor substitui só
o valor. A diferença é essa: **interpola-se o que muda por paciente; nunca o
que muda por diretriz.**

### O custo de não saber disso

Quatro frases desta própria auditoria chegaram em português ao usuário em
espanhol, criadas por blocos que seguiam corretamente a recomendação de fonte
única. A recomendação estava certa e incompleta — e é por isso que esta regra
existe em vez de virar só uma dívida (D-35).

### ⚠️ E o reflexo antigo venceu no MESMO bloco que criou a regra

No levantamento do TCE eu propus, por escrito, fazer `ALVOS_TCE.paco2Resgate`
"ser consumido pela frase de resgate em vez de ficar decorativo" — ou seja,
**interpolar**. Só desisti ao escrever o código, quando a mão parou no
`${...}`: interpolar era exatamente o que aquele bloco estava removendo.

Registro isto porque diz algo sobre o prazo da regra: **ela é nova o bastante
para o hábito ainda ganhar dela.** "Constante decorativa é ruim" é reflexo
antigo e correto em geral; "para TEXTO, o vínculo vira trava e não
interpolação" é aprendizado de agora. Enquanto os dois não se acomodarem,
espere a proposta sair errada e a escrita corrigir — e prefira que a correção
aconteça antes de o texto chegar à tela, que é o que a trava genérica garante.

---

## R-44 · Acréscimo — a trava nasce carregando a leitura de quem a escreveu

**O caso mais curto possível: UMA HORA entre escrever a trava e ela barrar a
correção.**

A `valida-eclampsia` foi escrita com a conferência *"a eclâmpsia pós-parto até
48 h"*, copiando o que o módulo dizia. Uma hora depois, ao escrever o aviso de
gestante/puérpera nas Convulsões, a fonte mostrou que as 48 h **separam a
eclâmpsia pós-parto precoce da tardia** e não marcam o fim do risco. **A trava
recusou a correção.**

### O que isso muda no entendimento do R-44

A regra dizia "expectativa datada" — e a palavra sugere **envelhecimento**,
como se o risco viesse do tempo. Não vem.

**A trava nasce codificando a INTERPRETAÇÃO CORRENTE**, que é a do autor no
momento em que a escreve. Se essa interpretação estiver errada, a trava
protege o erro **desde o primeiro minuto** — e a próxima correção é a primeira
coisa a bater nela. O tempo não cria o problema; ele só aumenta a chance de
alguém tropeçar.

### A consequência prática

**Trava recém-escrita não é evidência de nada sobre o conteúdo que ela vigia.**
Ela é evidência de que o conteúdo não mudou desde ontem — o que é útil contra
regressão e inútil contra erro de origem.

Quando uma trava barrar uma correção, a pergunta é sempre a mesma, e a idade
dela não entra: **quem está certo, o texto novo ou a expectativa?** Se a
correção tem fonte aberta e a trava tem só a leitura anterior, a trava cede — e
o registro do porquê fica no script, para o próximo não achar que foi
relaxamento.

---

## R-61 · Remover conferência é manutenção, não recuo

**A disciplina de travas tem duas metades, e só uma é praticada: elas se
acrescentam com facilidade e quase nunca se removem.**

### O caso

A `valida-convulsoes` nasceu com uma conferência de POSIÇÃO: as causas
específicas (isoniazida, hiponatremia) não podiam ser o último item do nó da
2ª linha, para serem lidas "antes de escalar".

A mutação realista — mover as duas para o penúltimo lugar, depois de toda a
lista de fármacos — **PASSOU**. A conferência só caía no caso extremo, e
pensando bem a propriedade que ela dizia proteger não existe: dentro de um nó
a ordem não decide nada, porque quem chega lê a tela inteira antes de avançar.
O que decide é as causas estarem **naquele nó e no do refratário**, e isso já
era conferido por presença.

**Removida, com o registro no lugar dela.**

### Por que isso precisa de regra

Acrescentar conferência parece sempre seguro — "não custa nada verificar mais".
Custa. **Uma conferência que mede o que não importa consome atenção sem
entregar proteção**: ela aparece na saída, entra na contagem, precisa ser
mantida quando o texto muda, e — pior — dá a sensação de cobertura no ponto em
que não há nenhuma.

E há o efeito sobre quem escreve: trava que mede forma em vez de substância
empurra o autor a escrever para satisfazê-la (R-55). Uma que mede posição
irrelevante faz o próximo revisor mover linhas por medo de quebrar o build.

### A regra

**Se a mutação realista de uma conferência passa, a conferência não protege o
que diz proteger — remova, com o registro do porquê.** Remover é manutenção,
não recuo: o conjunto que sobra é mais forte, porque cada item dele já provou
que cai quando o defeito existe.

⚠️ **E a remoção precisa do registro**, no lugar exato de onde saiu. Sem ele, a
próxima pessoa reescreve a mesma conferência achando que encontrou uma lacuna —
e a lacuna era a decisão.

---

## R-64 · Fonte bloqueada: separe a AUSÊNCIA DE CONSTRUTO do VALOR NUMÉRICO

**Quando a primária não abre, a pergunta não é "escrevo ou não escrevo" — é
QUAL METADE não depende dela.**

### O caso

A diretriz de TEP de 2026 está atrás de paywall (Circulation e JACC em 403; as
sínteses trazem os critérios só em imagem). Havia duas coisas a dizer sobre o
módulo, e elas têm dependências diferentes:

| o que se queria dizer | depende da primária? |
|---|---|
| **existe um estado** com PA preservada e hipoperfusão instalada, ele é a razão de ser da nova classificação, e o módulo não o oferecia | ❌ **não** — a ausência do construto se verifica no PRÓPRIO APP (`grep "normotens"` = 0, enquanto o conceito existe em Choque e EAP) |
| os **critérios numéricos** de hipoperfusão (lactato, diurese, índice cardíaco, PAM) e a inversão do "< 15 min" | ✅ **sim** — e reproduzi-los de resumo de terceiro é R-52 pela porta dos fundos |

**Escrevi a primeira metade e declarei a segunda como pendente, na própria
tela.**

### Por que a metade escrevível é a que mais muda comportamento

**O médico precisa saber que existe um paciente com pressão normal em
deterioração.** É isso que reorganiza a atenção dele. Os pontos de corte de
lactato e diurese **refinam a identificação** — melhoram a sensibilidade de
quem já está procurando —, mas não são o que faltava. Faltava a categoria
mental.

**Ausência de CONSTRUTO é achado de estrutura, e estrutura se verifica no
código.** Ausência de VALOR é achado de conteúdo, e conteúdo exige fonte.
Tratar as duas como uma só bloqueia a correção inteira por causa de um paywall.

### ⚠️ E a estrutura NÃO é a mesma em toda pendência — conferido, 2026-08-16

Apliquei a pergunta às outras duas pendências de fonte do app, e elas caem em
classes diferentes:

- **Hidrocortisona (volume de reconstituição):** mesma estrutura do TEP, **e a
  metade escrevível já estava escrita** — `HIDROCORTISONA_APRESENTACAO` diz que
  é pó liofilizado em frasco de 100 e 500 mg e que *"NÃO VEM PRONTA: precisa
  ser reconstituída antes de qualquer coisa, e é aí que se perde tempo"*. O
  construto (é pó, atrasa, reconstitua antes) está lá; só o volume espera a
  bula. **Nada a fazer.**

  ⚠️ **CORREÇÃO, 2026-08-16 — e a conclusão "nada a fazer" estava certa pela
  razão errada.** Não é que o número esteja esperando a bula: **o número não é
  conduta.** A hidrocortisona corre em **bólus** — reconstitui e injeta —, e
  nenhuma taxa, concentração de bomba ou cálculo depende do volume. Comparar com
  a **vasopressina**, onde o volume **É conduta**: 20 UI/mL numa ampola de 1 mL
  determina a concentração da bomba que vai infundir 0,03 U/min. **VOLUME QUE É
  CONDUTA × VOLUME QUE É INSTRUÇÃO DE PREPARO** — o segundo mora no rótulo por
  natureza, e quem prepara o lê ali, como faz com qualquer pó. Encerrada por
  escopo em **D-41**, não por fonte encontrada. O teste a aplicar nas próximas:
  **em que a ausência do número muda a conduta?**

- **V3R–V4R:** ⚠️ **estrutura DIFERENTE, e a hipótese de simetria não se
  confirma.** Ali não falta metade nenhuma: técnica, posicionamento (5º EIC
  direito, linha hemiclavicular), critério (> 1 mm em V3R–V6R), sensibilidade e
  especificidade — **tudo escrito**. O que é pendente é a **PROCEDÊNCIA**: os
  números vieram de LITFL e wikidoc, não de diretriz primária. É caso de R-52
  (declarar a fonte que se tem), não de R-64 (dividir o que se pode dizer).

**A lição de método sai da diferença:** antes de aplicar o R-64, verifique de
qual classe é a pendência. "Falta o número" e "o número veio de fonte
secundária" parecem a mesma coisa no relatório e exigem ações opostas — uma
espera a fonte, a outra já pode ser fechada declarando o que se tem.

---

## R-62 · Sonda escolhida por SUPOSIÇÃO de mudança tem poder zero

**E produz um relatório limpo com a mesma aparência de um verdadeiro.**

### O caso

Na primeira rodada da D-36 escolhi sete números-sonda — um por módulo, cada um
supostamente da classe "mudou de valor sem mudar de nome". **Duas das sete
partiam de uma mudança que eu SUPUNHA e que não existia:**

| sonda | eu supunha | a fonte disse |
|---|---|---|
| Convulsões: levetiracetam 60 mg/kg, máx 4.500 | que fosse do ESETT (2019), sob citação de AES 2016 — "atribuição invertida" | **está na AES 2016**, verbatim, ao lado de fosfenitoína 20 mg PE/kg e valproato 40 mg/kg. O ESETT veio comparar os três **sem mudar as doses** |
| AVC: NIHSS ≥ 6 × ≥ 10 | divergência interna | **dois construtos**: ≥ 6 é circulação anterior, ≥ 10 é oclusão de BASILAR |

⚠️ **E o mais grave é a ordem em que eu quase fiz.** Eu havia proposto a
"atribuição invertida" como CLASSE NOVA de defeito antes de abrir a fonte. Se
tivesse escrito o achado primeiro e conferido depois, teria **inventado uma
categoria de defeito a partir de uma coincidência de números** — e ela teria
entrado no METODO com a mesma aparência das outras.

### Por que a sonda ruim é pior que sonda nenhuma

Sonda cujo número **não mudou** entre as versões **passa sempre** — no módulo
correto e no módulo podre. Ela não distingue nada, e o relatório sai com um
"✅ passa" idêntico ao de uma verificação real. **Cobertura aparente sem poder
de detecção é o pior resultado possível de uma varredura**, porque encerra o
assunto.

### A regra operacional: DUAS ETAPAS SEPARADAS

1. **Confirmar que o número MUDOU entre as versões** — na fonte, antes de olhar
   o app.
2. **Só então** conferir o que o app tem.

**Inverter a ordem faz a premissa se ajustar ao resultado.** Quem olha o app
primeiro já sabe o que quer encontrar, e a "confirmação" da mudança vira busca
por evidência que sustente o achado que já se formou.

E se a etapa 1 falhar — o número não mudou —, **a sonda é descartada e se
escolhe outra**. Descartar sonda não é fracasso da varredura: é a varredura
funcionando antes de produzir uma conclusão falsa.

---

## R-63 · Traduzir a classificação nova para o vocabulário antigo

**É o mecanismo que atualiza a CITAÇÃO sem atualizar o CONTEÚDO — e ele parece
rigor, porque a equivalência está declarada.**

### O caso

O módulo de TEP cita a classificação **A–E da AHA/ACC 2026** e fecha a linha
com:

> *"Equivalência: A–B ≈ baixo risco, C ≈ intermediário, **D–E ≈ alto risco**."*

O autor mapeou o esquema novo no antigo **para preservar o fluxo existente** —
os ramos do módulo continuam sendo baixo/intermediário/alto. O mapeamento é
honesto, está escrito, e por isso passa por cuidado.

⚠️ **Mas equivalência entre esquemas de GRANULARIDADE DIFERENTE perde
exatamente o que o novo acrescentou.** Cinco categorias achatadas em três
apagam o estado que a revisão foi criada para nomear: no TEP, o **choque
normotenso** — pressão preservada com hipoperfusão instalada, que a
classificação antiga não tinha onde colocar e que caía na caixa de baixo.

Confirmação independente da ausência, sem depender de fonte: `grep "normotens"`
no módulo de TEP retornava **zero**, enquanto o conceito já existia em Choque
(7 ocorrências) e no EAP. **O construto existia no app e não existia onde a
diretriz o introduziu.**

### Como detectar

**Procurar por `≈`, "equivale a", "corresponde ao antigo", "equivalência" ao
lado de citação recente** — e, onde houver, perguntar: **o que a granularidade
nova enxerga que a antiga não enxergava?**

### O que a varredura rendeu (feita, 2026-08-16)

Varri o app inteiro por `≈`, "equivale", "equivalência", "classificação
antiga", "terminologia anterior", "maciço/submaciço", "Killip", "Forrester".

**Resultado: uma única ocorrência do padrão — a que originou a regra.** Todos
os outros `≈` são conversão de unidade (mL ≈ L, mmol/L ≈ mg/dL, mg/kg/h ≈
mcg/kg/min), que é aritmética e não mapeamento de esquema.

⚠️ **Registro o rendimento honesto: 1 de 1 — e a previsão de que renderia mais
era minha e do Sandro, e estava errada.** A varredura foi barata e não
encontrou passivo além do caso de origem.

**Isso não invalida a regra: muda o que ela serve para fazer.** Uma regra pode
ser verdadeira e ter frequência ZERO fora do caso que a originou. O mecanismo
é real — mapear esquema novo no antigo apaga o que o novo acrescentou —, e ele
apagou um estado clínico inteiro no TEP. O que não existe é o passivo.

**Consequência: o R-63 deixa de ser varredura de passivo e vira CRITÉRIO DE
REVISÃO para a próxima diretriz que trocar de esquema.** É o mesmo
enquadramento que a D-36 inteira recebeu, e pela mesma razão: a auditoria
módulo a módulo já drenou o que havia. Isso **não** significa que o app
esteja livre do mecanismo — significa que, hoje, só um módulo recebeu uma
classificação nova sem reescrever o fluxo. **O risco é futuro**: a cada
diretriz que troque de esquema, a tentação de mapear no antigo reaparece, e é
aí que esta regra serve.

---

## R-60 · Exclusão de escopo escrita em comentário não exclui nada

**Se o módulo decide NÃO cobrir um caso, isso é CONTEÚDO — e precisa aparecer
para quem usa, com o ponteiro para onde o caso é coberto.**

### O caso

O cabeçalho de `seizure-decision-tree.ts` dizia, e dizia bem:

> *⚠️ ESCOPO: essa diretriz EXCLUI a população obstétrica. Crise em gestante
> com síndrome hipertensiva é o módulo de pré-eclâmpsia e eclâmpsia, onde o
> fármaco de primeira linha é o sulfato de magnésio, não o benzodiazepínico.*

**Em comentário.** Na árvore não havia ramo, ressalva nem ponteiro; a palavra
"gestante" aparecia UMA vez na tela, como contraindicação do valproato. O
β-hCG era colhido na estabilização e **nada no fluxo agia sobre ele**.

Resultado: a gestante ou puérpera com eclâmpsia percorre benzodiazepínico →
levetiracetam → fenitoína → anestésico, e o fármaco que trata a causa e previne
a recorrência — o sulfato de magnésio — **nunca é mencionado**. O módulo que o
tem existe, está pronto, e não havia caminho até ele.

### Por que o comentário engana quem escreve

**Ele fecha o assunto na cabeça do autor.** Quem escreveu aquele parágrafo
pensou no caso, decidiu corretamente, e registrou a decisão — e a sensação de
ter resolvido é idêntica à de ter resolvido de verdade. O comentário é a prova
de que o autor NÃO esqueceu; é justamente por isso que ele impede a próxima
pessoa de perceber que falta.

**Comentário protege o autor de ter esquecido; não protege o paciente.**

### A regra

Toda exclusão de escopo precisa de três coisas **na tela**:

1. **O gatilho** — como reconhecer que este caso é o excluído;
2. **O que muda** — e, se a conduta em curso continua valendo, dizer isso
   explicitamente (ver abaixo);
3. **O ponteiro navegável** — para o módulo que cobre, com `moduleId` que
   exista de verdade. Ponteiro para módulo inexistente é pior que ponteiro
   nenhum: parece resolver.

⚠️ **E o item 2 tem uma armadilha.** A formulação natural — "aqui o fármaco é
X, não Y" — faz alguém **parar de dar Y numa emergência em curso**. Na crise da
gestante, o benzodiazepínico continua abortando a crise; o magnésio é o que
FALTA, não o que sobra. Escreva os dois papéis: **o que aborta × o que trata a
causa e previne a próxima.**

E a exclusão levanta SUSPEITA, não fecha diagnóstico: gestante convulsiona
também por epilepsia prévia, hiponatremia, tóxico e trombose venosa cerebral.
"Pense em eclâmpsia e EXCLUA" é diferente de "é eclâmpsia" — e o erro inverso,
a epiléptica grávida tratada como eclâmptica, também existe.

### A varredura devida (não feita)

**Quantos comentários de escopo existem sem contraparte na tela?** Registrado
como **D-38**. O padrão de busca é fácil — comentário com "ESCOPO", "não
cobre", "fora deste módulo", "exclui" — e a pergunta para cada um é: *o usuário
vê isso, e existe caminho até onde o caso é coberto?*

---

## R-59 · O instrumento também precisa passar no próprio teste

**Duas varreduras sobre as travas (2026-08-16), as duas nascidas de defeitos
reais do bloco do CAD/EHH. E a segunda encontrou o caso mais limpo que
apareceu nesta auditoria: a trava de ALCANÇABILIDADE falhava no teste de
alcançabilidade.**

### Parte 1 · Piso de vacuidade: ARQUIVOS × ACHADOS

O piso da `valida-prazos` estava em **30 com a contagem em 30** — folga zero.
Qualquer remoção legítima o derrubava, e foi o que aconteceu ao fechar a D-2: o
ramo de 2009 do bicarbonato levou dois prazos consigo, porque o consenso 2024
não o tem. **A trava acusou uma correção correta.**

Varredura de todos os pisos, lendo o valor real do contador vigiado:

| contador é de… | travas | folga |
|---|---|---|
| **arquivos** | calculadoras, isr, sedacao, faixas-invertidas, frase-composta, dobutamina, escopo-pediatrico, preparos | 65–93% |
| **achados clínicos** | prazos (29%), teto-por-kg (17%) | ⚠️ apertadas |

**Não é acaso, e a regra sai daí:**

- **Contagem de ARQUIVOS só cai se a leitura quebrar.** Piso baixo, folga
  grande de graça.
- **Contagem de ACHADOS encolhe por CORREÇÃO** — diretriz aposenta um esquema,
  o achado some legitimamente. Piso colado vira **alarme contra quem remove o
  que a diretriz removeu**.

**A regra:** piso de vacuidade detecta **leitura quebrada**, não mudança de
conteúdo. Sobre arquivos, qualquer valor baixo serve. Sobre achados, fica em
**≈ 60% da contagem real**, e a mensagem diz que é piso de leitura — para o
próximo não o confundir com meta.

### A FORMULAÇÃO FINAL, depois de quatro ocorrências

**O padrão é sempre o mesmo: o app ganha uma SEGUNDA forma de fazer a coisa, e
a trava continua conhecendo só a primeira.**

| # | mecanismo antigo (que a trava conhecia) | mecanismo novo (invisível) | o que se cegou |
|---|---|---|---|
| 1 | literal no código-fonte | interpolação e composição em runtime | varredura de tradução (D-19/D-35) |
| 2 | texto cru do arquivo | artefato compilado, com imports resolvidos | alvos do TCE, prazos |
| 3 | conteúdo na raiz, por nome de arquivo | conteúdo em `lib/` | **alcançabilidade** |
| 4 | cronômetro no motor (`getTimers`) | cronômetro no runtime de árvore (`prazos`+`marco`) | `valida-prazos` dizia que Convulsões "não tem cronômetro" |

Em nenhum dos quatro a trava estava errada quando foi escrita. Ela envelheceu
porque **o app mudou de forma e ela não soube** — e o mais desconfortável é que,
em três dos quatro, quem introduziu o mecanismo novo foi esta mesma auditoria,
seguindo a própria recomendação.

### A regra prática

**Toda vez que o app ganhar um MECANISMO NOVO — um runtime, uma camada, um
formato, um lugar onde o conteúdo passa a morar —, varrer as travas
perguntando: quais só conhecem o antigo?**

Não é revisão geral: é uma pergunta dirigida, feita no momento em que o
mecanismo nasce, sobre o conjunto pequeno de travas que tocam aquele assunto.
Custa minutos; descobrir por acaso custou quatro ocorrências e três fases.

⚠️ **E a próxima é previsível: a UI 2.0.** Ela vai cegar tudo que lê por NOME DE
COMPONENTE — e o precedente já existe e já custou caro: o bloco 5H/5T corrigido
em `acls-rhythms-screen.tsx` nunca chegou à tela, porque produção renderiza a
v2. Quando a migração avançar, esta varredura é obrigatória antes de confiar em
qualquer trava de tela.

### Parte 2 · Universo por NOME DE ARQUIVO — R-32 aplicado ao instrumento

Terceira ocorrência do mesmo mecanismo: a varredura de tradução perdeu as
frases que viraram interpolação (D-19/D-35), a trava dos alvos do TCE deixou de
ver o identificador que sumiu, e a `valida-prazos` deixou de contar os prazos
que foram para `lib/`.

**A causa comum: o conteúdo migra para `lib/` por recomendação NOSSA, e o
instrumento se cega justamente quando seguimos o próprio conselho.**

Varredura: **7 travas** definem universo por padrão de nome. Mas elas não têm o
mesmo risco, e o critério que as separa é **o que a trava lê**:

| como lê | cega com a migração? | casos |
|---|---|---|
| **texto cru**, filtrado por nome | ⚠️ **sim** | `valida-alcancabilidade`, `valida-prazos` |
| **texto cru**, mas procurando o que SÓ pode existir ali | não | `valida-peso-origem`, `valida-ventilacao` — procuram CAMPO de formulário, e campo não migra para lib |
| **artefato compilado**, percorrendo o objeto | não | `valida-traducao-composta` — o texto da lib chega pelo import |
| inventário/índice, não trava | — | `inventario-clinico`, `indice-de-travas` |

**A regra:** trava não define universo por padrão de nome **lendo texto cru**.
Ou percorre o **artefato compilado** (o que a árvore ENTREGA, imports
resolvidos), ou define o universo por **conteúdo declarado**. Filtro de nome
vale como **ponto de entrada** de uma travessia que resolve imports — nunca
como fronteira do que se lê. E vale também quando o alvo é estrutural (um campo
de formulário), porque aí ele não pode estar em outro lugar.

### ⚠️ A ironia, registrada como aviso permanente

**A `valida-alcancabilidade` é a trava que existe para impedir conteúdo clínico
órfão — e foi ela que achou os oito engines mortos.** A travessia dela já era
por imports (certa). O que era por nome era a lista de CANDIDATOS a órfão: só a
raiz, só `*-decision-tree.ts` e `*-engine.ts`.

**Resultado: uma lib órfã — criada, preenchida com dose e ressalva, e nunca
consumida — passava invisível pela trava que existe exatamente para isso.** Ela
não alcançava a metade nova do app.

Corrigido: `lib/**` entrou no universo (77 arquivos, 1 órfão real, declarado com
a razão). Mutação: uma lib nova com conteúdo clínico e sem consumidor é
acusada.

**O aviso que fica: toda regra nova deve ser rodada contra as PRÓPRIAS TRAVAS
antes de ser considerada estável.** O instrumento é código como qualquer outro,
e a regra que ele impõe ao app vale para ele — a diferença é que ninguém audita
o auditor por hábito. Aqui, três regras nossas (R-32, o piso de vacuidade e a
fonte única em lib) só foram testadas contra o app; ao virarem a lente para o
próprio ferramental, as três acusaram.

---

### ⚠️ QUARTA E QUINTA OCORRÊNCIAS (2026-08-16) — e a forma EXTREMA

**Quarta — universo por lista fixa.** `e2e/contraste-renderizado.spec.ts` mede
exatamente a coisa certa (o par renderizado, com o fundo real descoberto
subindo a árvore) — em **seis módulos escolhidos à mão**. `drogas-vasoativas`
não era um deles, e por isso 2,36:1 ficou meses no ar. O instrumento estava
correto e **incompleto**, e a incompletude é invisível porque o verde de um
universo pequeno tem a mesma aparência do verde de um universo completo.

**Quinta — e esta é a forma extrema do R-59: INSTRUMENTO QUE NÃO CONHECE
MECANISMO NENHUM DA COISA QUE SE SUPÕE QUE ELE VIGIA.** `valida-contraste`
compila UM arquivo — `design-system/tokens.ts` — e confere 15 pares em 2 temas.
**Ele nunca abre uma tela.** Prova que a paleta é legível; não prova, e não pode
provar, que o app é. E foi citado — por mim — como se provasse a segunda coisa.

As três ocorrências anteriores eram travas que liam **por nome de componente**.
Estas duas são piores: uma lê **por lista de módulos**, a outra **por arquivo de
origem da cor**. Em todas, o padrão é o mesmo — *o universo foi definido pelo
mecanismo que o autor tinha em mente, não pelo efeito que se quer garantir.*

**A pergunta que fecha o R-59, e que vale para toda trava nova:** se o defeito
aparecesse por um caminho que você não imaginou, esta trava o veria? Se a
resposta depende de o autor ter lembrado de listar algo, o universo está errado
— derive-o do que existe (o build, o registro, o diretório), nunca de uma lista
escrita à mão.

## R-52 · Acréscimo — O RÓTULO DE FONTE ATUALIZADA NO NOSSO PRÓPRIO APP

**A regra nasceu contra fonte de TERCEIRO: material rotulado "ACLS 2025" com
conteúdo de cinco anos atrás. O caso do CAD/EHH é a mesma falha por dentro — e
é pior.**

### O caso

O módulo de CAD/EHH cita o consenso ADA/EASD **2024** em toda parte: no id
(`cad_ehh_ada_2024`), no cabeçalho do arquivo, em várias evidências. A D-2
registrava que o **bicarbonato** tinha "evidência de 2024, ramificação de
2009".

Ao abrir a fonte para fechar a D-2, o bicarbonato revelou-se um caso de um
padrão. **Sete números eram de 2009**, sob rótulo de 2024:

| eixo | app (2009) | consenso 2024 |
|---|---|---|
| glicose no soro | 200 mg/dL | **250** mg/dL |
| redução da insulina | 0,02–0,05 U/kg/h | **0,05** |
| meta do EHH | 250–300 mg/dL | **200–250** |
| queda osmolar | ≤ 3 mOsm/kg/h | **3,0–8,0** |
| reposição de K⁺ | 20–40 mEq/h | **10–20** mmol/L/h |
| KCl de manutenção | 20–40 mEq/L | **10–20** mmol/L |
| resolução do EHH | osmol < 315, glicemia < 300 | **< 300**, **< 250** e **débito urinário > 0,5 mL/kg/h** |

### Por que a versão interna é pior que a externa

Fonte de terceiro a gente **desconfia por ofício** — foi o que a R-52 ensinou a
fazer. **Do próprio repositório, não.** Quem lê `cad_ehh_ada_2024` no id do
módulo tem toda a razão de supor que os números são de lá; a citação foi escrita
por nós, e a confiança nela é a confiança no nosso próprio trabalho.

E o mecanismo é banal: **o texto foi atualizado e os números não.** Alguém leu o
consenso novo, reescreveu as frases de enquadramento — critérios diagnósticos,
o que saiu, o que entrou — e deixou intactos os valores operacionais que já
estavam ali. Não é desleixo: é que a leitura de uma diretriz nova atrai a
atenção para o que MUDOU DE CONCEITO, e os números que mudaram de valor sem
mudar de nome passam despercebidos.

### A regra

**Toda citação de diretriz recente merece a conferência de pelo menos UM número
que mudou entre as versões.** É o mesmo teste que a R-52 aplica a fonte externa
— e ele vale para o app.

Escolha um número que a diretriz nova alterou e confira no módulo. Se ele estiver
na versão antiga, **não confira só aquele: o módulo inteiro está sob suspeita**,
porque a falha não é pontual, é de processo — o texto foi revisado e os números
não.

### A dívida que sai daqui

**Quantos outros módulos citam diretriz recente com números da anterior?** Não
varrido. Registrado como **D-36**, com o método: para cada módulo que cite ano
de diretriz, escolher um número que mudou entre as versões e conferir.

---

## R-57 · Justificativa escrita no código também envelhece

**Comentário que explica por que algo NÃO foi feito é um veto — e vetos escritos
não têm validade declarada. Quem lê não reexamina: lê e desiste.**

### O caso

O fato `meta-de-pas-no-tce`, em `valida-consistencia-clinica`, trazia escrito:

> *"Não dá para extrair isto para uma constante de código: são literais que
> passam por `tr()`, e compor com template literal (`${...}`) tira a frase da
> varredura de tradução — o usuário em espanhol veria português. Então o que se
> compartilha é a REGRA, não a string: o texto fica repetido."*

O argumento está **certo sobre o mecanismo e errado sobre a conclusão**. É
verdade que `${...}` tira a frase da varredura (D-19, por desenho). O que não
se examinou é que existia uma terceira forma: **a constante ser a frase
INTEIRA**, sem interpolação nenhuma. O literal continua literal, a varredura
continua vendo, e a fonte passa a ser única.

A saída existia o tempo todo. O comentário sobreviveu meses, e só caiu porque
se tentou assim mesmo — enquanto isso, seis frases soltas em dois arquivos
declaravam a meta de PAS no TCE, que é exatamente o defeito que ele descrevia
como inevitável.

### Por que é pior que conteúdo desatualizado

Número clínico desatualizado é lido, conferido e corrigido — a auditoria existe
para isso. **A justificativa desatualizada não é lida como afirmação: é lida
como decisão já tomada.** Ela desliga o exame em vez de convidá-lo. Quem chega
depois não vê um fato a verificar; vê uma porta com aviso de que já tentaram, e
vai fazer outra coisa.

E o autor do veto quase sempre sabia menos do que se sabe hoje: escreveu antes
da lib de fonte única existir, antes de R-36, antes de a varredura de tradução
ter o comportamento que tem. **O veto permanece com a autoridade do presente e
o conhecimento do passado.**

### A regra

**Comentário que explica por que algo NÃO foi feito precisa de:**

1. **DATA** — quando a conclusão foi tirada;
2. **O QUE MUDARIA A CONCLUSÃO** — a condição concreta que reabre o caso.

Sem os dois, é veto permanente. Com eles, é uma hipótese com prazo, e quem
chegar depois sabe o que testar.

Vale para a `DIVIDAS-CONHECIDAS` também, e lá já se faz: a D-1 trazia escrita a
condição que a fecharia (*"idade precisa de contrato antes"*), e foi exatamente
por ela ser explícita que se pôde examinar se ainda valia — e ver que não
valia, porque o campo podia ser local.

### Varredura devida (não feita)

**Quantos comentários do app dizem "não dá para X porque Y"?** Cada um é um veto
que ninguém testou de novo. A varredura fica registrada como pendência: listar
as ocorrências, e para cada uma perguntar se o Y ainda é verdade e se a
conclusão ainda decorre dele — porque neste caso o Y era verdade e a conclusão
não decorria.

---

## R-65 · Verificar produção exige literal DO REPOSITÓRIO **e** bundle DECODIFICADO

**Os dois atalhos erram, e erram em direções opostas — mas produzem o mesmo
relatório falso: "produção está desatualizada".**

### O caso, 2026-08-16

Pedido: provar que a auditoria inteira estava no ar. Fiz duas rodadas de sonda
antes de acertar, e **as duas primeiras teriam disparado alarme falso**.

**Rodada 1 — frases SUPOSTAS.** Escrevi as sondas de memória do que "o texto
devia dizer": `"PRESSÃO NORMAL NÃO EXCLUI"`, `"CAD e EHH não são caixas
separadas"`. Nenhuma existe no código. **É o R-62 aplicado a mim mesmo**, na
mesma sessão em que o escrevi: sonda escolhida por suposição tem poder zero, e
aqui teve poder NEGATIVO — não achou o que estava lá.

**Rodada 2 — bundle NÃO DECODIFICADO.** Corrigi os literais extraindo-os do
repositório, e ainda assim **8 de 10 falharam**. O bundle de produção é ASCII:
todo caractere não-ASCII vira escape. E são **dois** formatos, não um —
`\uXXXX` **e** `\xNN`. Decodificar só um deixa metade dos acentos invisível.
`"MISTO CAD"` (ASCII) casava; `"NÃO SIMPLIFIQUE"` não, porque no bundle está
`N\xc3O SIMPLIFIQUE`.

**O que as duas teriam produzido:** um relatório afirmando que produção não
tinha as correções — **falso alarme que custaria uma investigação inteira**, e
que faria perder confiança justamente no que estava certo.

### ⚠️ QUINTA OCORRÊNCIA — e a mais barata de evitar (2026-08-16)

Varrendo saídas de dúvida, minha sonda apontou `anaphylaxis/grau_sem_criterio`
como **nó órfão de 823 caracteres**. Era falso alarme: ele é alcançado por
`next` DINÂMICO (`{ possiveis, escolher }`), e a sonda só sabia ler
`option.next`.

**A resposta estava a um comando de distância.** `valida-alcancabilidade`
conhece o next dinâmico, roda em 137 conferências e não acusava nada.

> **Antes de declarar órfão, pergunte se a trava que existe para isso concorda.**

⚠️ **E a inversão também vale: quando as duas CONCORDAM, isso não é
confirmação.** Se a sonda nova foi escrita olhando para a trava antiga — mesmo
mecanismo, mesmo campo, mesma suposição —, a concordância é **o mesmo ponto cego
duas vezes**. Confirmação exige que as duas cheguem ao objeto por caminhos
diferentes: uma pelo código, outra pelo renderizado; uma pelo grafo, outra pela
execução.

Vale como caso geral: quando a sonda nova contradiz uma trava antiga sobre o
mesmo objeto, **a hipótese de partida é que a sonda nova está incompleta** — a
trava já sobreviveu a mutação, a sonda acabou de nascer.

### A regra

Para afirmar que algo **está** ou **não está** em produção, é preciso:

1. **O literal vem do REPOSITÓRIO**, extraído por leitura do arquivo — nunca
   digitado de memória nem parafraseado;
2. **O bundle é DECODIFICADO** antes da busca — `\uXXXX` e `\xNN` — e o
   decodificador é conferido contra uma string acentuada que se sabe presente.

⚠️ **E o teste de controle vale mais que as dez sondas:** inclua sempre uma
amostra que você SABE que não está no ar (código não commitado) e uma que SABE
que está. Se a que devia falhar passa, ou a que devia passar falha, **o
instrumento está quebrado — e não o app**. Foi assim que descobri as duas
rodadas ruins: a PD-4 não commitada dava "ausente" (correto) enquanto correções
antigas e commitadas também davam "ausente" (impossível).

### Por que isto é da mesma família do resto

O erro não foi ler errado — foi **medir com régua que eu não tinha verificado**.
É o mesmo padrão do `dist` de nove dias (R-2) e da trava que casava com o
comentário que narrava o defeito (R-15 item 13): **o instrumento também precisa
de prova, e a prova é uma execução em que ele falha quando deve falhar.**

### ⚠️ TERCEIRA OCORRÊNCIA, no mesmo dia e no mesmo pedido — o instrumento de novo

Depois de corrigir as duas sondas de conteúdo, errei uma terceira vez, agora
sobre o **deploy**. `vercel ls` mostra `Username sandrodainez` e `vercel
inspect` (CLI 54.17) **não imprime meta de commit** — e eu concluí que os
deploys eram de CLI, sem vínculo com git. Escrevi a **D-42** inteira, com
proposta de correção, para um problema **que não existia**: os 20 deploys de
produção são `source: git`, `ref=main`, cada um com o SHA do seu commit. A
prova veio quando o `git push` **disparou um build sozinho, 52 s depois**.

**A regra que sai daqui, e que generaliza o R-65:**

> **A AUSÊNCIA DE UM DADO NA SAÍDA DE UMA FERRAMENTA NÃO É EVIDÊNCIA DA
> AUSÊNCIA DO MECANISMO.** É evidência de que aquela ferramenta não mostra
> aquele dado. Antes de escrever "não existe", pergunte por qual superfície
> você olhou e se existe outra — aqui, a API REST (`/v13/deployments/<id>`)
> respondia o que o CLI silenciava.

E o teste de controle serve para o instrumento tanto quanto para o app: **se
uma afirmação sobre infraestrutura pode ser checada por uma ação que a força a
se revelar** — empurrar um commit e ver se algo acontece —, faça a ação em vez
de ler a saída.

---

## R-66 · A trava valida os PARES QUE LHE PERGUNTARAM — e a tela inventa pares

**Ausência de um par na lista de verificação não é aprovação. É silêncio — e
silêncio de instrumento se lê como verde.**

### O caso, 2026-08-16

A barra lateral de Vasoativas estava ilegível em produção: rótulos de 9 px em
`#aab6c6` sobre `#1e6fd9` — **2,36:1**, contra um piso de 4,5. O app **tem** uma
trava de contraste, e ela passava.

E não passava por erro de cálculo. **As duas cores SÃO tokens**: `#1e6fd9` é
`primary`, `#aab6c6` é `textSecondary`. Cada uma é conferida — contra `bg` e
contra `surface`, os pares que a tabela `PARES` lista. **A combinação entre as
duas nunca foi perguntada, porque ela não deveria existir na interface.**

A tela criou um par que o desenho não previu. A trava não errou: ela respondeu
com precisão a uma pergunta que ninguém fez.

### A regra

⚠️ **Uma lista de pares a conferir só cobre o que alguém imaginou.** Toda
combinação que a tela produzir e a lista não contiver passa em silêncio — e o
silêncio tem exatamente a mesma cor do aprovado.

**Consequência para o desenho de qualquer trava desta família: EXTRAIA OS PARES
QUE EXISTEM, não confira os pares que alguém listou.** A fonte da verdade é o
que foi renderizado, não a tabela de combinações previstas.

É a mesma inversão do R-1 (a trava se prova pela mutação, não pela leitura) e do
R-15 item 9 (conferência sobre universo vazio passa): **o instrumento deve
partir do que o mundo produziu, não do que o autor lembrou.**

### Onde isto se aplica além da cor

Qualquer verificação por *tabela de combinações*: interação entre módulos, pares
fármaco × via, unidade × faixa, locale × formato. Se a lista é escrita à mão, a
pergunta a fazer é **"o que a execução pode produzir que não está aqui?"** — e a
resposta costuma ser o defeito.

---

## R-67 · MESMA CAUSA, TRÊS SEVERIDADES — varra os consumidores por CONSEQUÊNCIA

**O usuário relatou os dois casos cosméticos e não relatou o grave. Não por
descuido: o grave não parece bug de interface, parece "o app não calculou".**

### O caso, 2026-08-16

Um único defeito de componente: o `NumericStepper` não tinha como dizer "o
médico interagiu", e as telas inferiam isso do VALOR GRAVADO. Como o `Slider`
só emite mudança quando o número muda, **tocar a barra e parar no valor de
partida não gravava nada**.

A varredura dos consumidores encontrou três, e a severidade **não é a mesma**:

| tela | o campo alimenta | o que o defeito causava | severidade |
|---|---|---|---|
| Eletrólitos | um AVISO | aviso "ainda não informado" preso | cosmético |
| Vasoativas | um AVISO | "peso ainda NÃO confirmado" preso | cosmético |
| **Sedoanalgesia** | **um CÁLCULO** | `weightMissing` **BLOQUEIA a dose**, que vira "—" | ⚠️ **clínico** |

O paciente de 70 kg — com a barra partindo de 70 — soltava o dedo e **ficava sem
dose de sedação**.

### Por que o grave não foi relatado

Os dois cosméticos **parecem defeito de interface**: um texto que não sai. O
terceiro **parece comportamento**: o app pediu o peso e não calculou. Quem usa
não classifica isso como "bug da barra"; classifica como "faltou preencher".

⚠️ **O sintoma mais visível não é o mais grave, e a lista de sintomas do usuário
é enviesada pelo que PARECE interface.**

### A regra

**Ao corrigir defeito de COMPONENTE, varra os consumidores por CONSEQUÊNCIA, não
por semelhança de sintoma.** A pergunta não é "onde mais aparece esse texto
preso?", é:

> **O que cada consumidor FAZ com o estado que o componente informa errado?**

Alimenta um rótulo? É cosmético. Alimenta um cálculo, um gate, uma trava de
segurança ou uma decisão de fluxo? **É clínico, e provavelmente ninguém
reportou** — porque naquele lugar o defeito tem outro nome.

### Onde isto se aplica além deste caso

Todo componente compartilhado: o que emite valor, o que emite estado de
validação, o que emite "pronto/não pronto". Uma mudança neles se propaga por
consequências diferentes, e a auditoria tem de listar **os consumidores e o que
cada um decide com aquilo** antes de declarar o defeito coberto.

### ⚠️ COROLÁRIO — a varredura por consequência inclui a VIA DE ENTRADA, não só o consumo

Corrigido o mecanismo do `NumericStepper`, varri os consumidores e declarei o
defeito coberto. **Estava errado na Sedoanalgesia**: o campo continuava
inalcançável, porque a barra media **0 px** por um defeito de layout
INDEPENDENTE, no hospedeiro.

As duas causas juntas produziam o bloqueio da dose, e **uma não anula a outra**:
consertar o mecanismo sem consertar a via deixa o campo tão inutilizável quanto
antes — e agora com a aparência de resolvido, que é pior.

**A pergunta completa tem duas metades:** *o que este consumidor FAZ com o
estado?* e *o médico CONSEGUE produzir esse estado nesta tela?*

---

## R-68 · Inspeção visual devolve CATEGORIA; medição devolve NÚMERO

**E barra estreita e barra INEXISTENTE pedem correções diferentes com aparência
idêntica.**

### Os dois casos, no mesmo dia

| o relato | o número | o que mudou |
|---|---|---|
| *"a barra lateral está apagada"* | **2,36:1** | não era cor "meio fraca": era 9 px abaixo de metade do piso, e a correção foi de mecanismo (acento vira fundo), não de tom |
| *"a barra está esmagada"* — **eu**, olhando a tela | **0 px** | eu vi a bolinha entre os botões e chamei de estreita. **Era zero.** Não havia barra |

Nos dois casos o número **mudou o que havia a fazer**. E o segundo é pior porque
o relato era meu, depois de olhar com atenção, com a captura de tela na frente.

### A regra

⚠️ **Nenhum relato de interface — do usuário ou meu — vale como diagnóstico sem
medição.** É o R-10 aplicado à própria inspeção: assim como não se afirma
conduta por memória, não se afirma defeito visual por impressão.

"Parece apagado", "parece esmagado", "parece pequeno demais" são **pistas para
onde medir**, nunca a medida. E a medida costuma revelar uma categoria
diferente: não *pouco*, mas *nenhum*.

---

---

## ⚠️ A CONDIÇÃO QUE FALTAVA — medição só substitui impressão se medir o OBJETO

A regra, como estava escrita acima, é verdadeira pela metade. A metade que faltava:

> **Medição substitui impressão QUANDO O INSTRUMENTO MEDE O OBJETO.** Quando ele
> mede o PROXY, ela veste a autoridade do número e entrega a impressão — e isso é
> **pior que a impressão declarada, porque ninguém a questiona.**

Uma impressão se apresenta como impressão e o leitor desconta. "19 módulos com
cabeçalho duplicado" se apresenta como fato, e quem recebe age.

### O TESTE DA VARIAÇÃO — barato, e roda ANTES de olhar o resultado

> **O VALOR MEDIDO TEM DE VARIAR ONDE O OBJETO VARIA.**
>
> Se você está medindo uma coisa que muda com o estado e ela sai IGUAL em todos os
> estados, você está medindo outra coisa.

⚠️ Vale nos DOIS sentidos:

- **constante onde deveria variar** → é proxy;
- **variável onde deveria ser constante** → também é.

Roda antes de ler o número, custa uma olhada na primeira coluna da saída, e **teria
pegado três das cinco ocorrências abaixo**.

### AS CINCO OCORRÊNCIAS, na mesma auditoria

| # | o instrumento media | o objeto era | pego pelo teste? |
|---|---|---|---|
| 1 | faixa larga com borda inferior no topo | um CABEÇALHO | ✅ — 19 módulos com o mesmo resultado |
| 2 | a palavra `bloqueio` | o padrão CARDÍACO (o bloqueio AV) | ❌ — precisou da mutação |
| 3 | `\b` do JS em texto acentuado | palavra inteira em português | ❌ — precisou de teste unitário |
| 4 | frases com mais de 28 caracteres | TODAS as frases | ✅ — 1.851 sempre fora, em qualquer retrato |
| 5 | a folha anterior ao valor | o RÓTULO do cronômetro | ✅ — `⚡ 1` idêntico em três estados diferentes |

### E A CONCLUSÃO MUDA O QUE A REGRA PEDE

Cinco instrumentos diferentes, escritos em dias diferentes, com o mesmo defeito.
**Não é descuido pontual: é a forma default de escrever um seletor às pressas.**
Quem escreve um seletor rápido pega o que é fácil de agarrar — a borda, a palavra,
o vizinho, o comprimento — e o fácil de agarrar quase nunca é o objeto.

Logo a regra **não é "tome cuidado"**. É:

> **TODO SELETOR NOVO PASSA PELO TESTE DA VARIAÇÃO ANTES DE O NÚMERO SER LIDO.**

E o corolário operacional: quando a primeira coluna da sua saída vier igual em
todas as linhas, **pare** — não interprete a tabela, conserte o seletor.

### R-68, exemplo · O CANAL DE SAÍDA TAMBÉM É SELETOR — o exit code que não variou

A regra do R-68 é «o valor medido tem de variar onde o objeto varia». Ela costuma
ser aplicada a SELETOR — que elemento se lê. Vale igual para o CANAL DE SAÍDA —
que número se compara.

**O CASO (2026-08-18).** Ao migrar 34 scripts para o helper de leitura sem
comentário, conferi as regressões comparando o **código de saída** de cada um,
antes e depois. Zero diferenças. Conclusão: nenhuma quebra.

Errado. **Três instrumentos mudaram de CONTEÚDO com exit code igual.** O índice
de travas perdeu associações reais — `anaphylaxis` deixou de listar `test:prazos`,
`poisoning` deixou de listar `test:antidotos` — porque essas associações vivem no
CABEÇALHO de cada trava, e o helper as havia removido. Os três continuaram saindo
com `exit 0`, porque geradores de relatório terminam bem quando terminam.

O exit code não varia onde o relatório varia. Para instrumento cuja saída É o
produto, o canal comparável é o **arquivo gerado** — regenerar e comparar o
conteúdo, que foi o que expôs o defeito depois.

## R-69 · A auditoria clínica perguntou se o conteúdo estava CERTO, nunca se ele podia ser INSERIDO

**23 módulos verificados quanto a conteúdo. ZERO quanto a operabilidade da
entrada.**

### O caso que expõe

A **Ventilação Mecânica** foi auditada dose por dose, com fonte primária aberta
em sessão. E o campo de altura — que calcula o peso predito, que calcula o
volume corrente protetor — **mede 0 px**: é impossível arrastar. Ninguém viu,
porque ninguém perguntou.

O mesmo vale para as Calculadoras (`slider-altura` 0 px), a Sedoanalgesia
(`slider-dose` 2 px) e as Vasoativas (`slider-taxa` 0 px, `slider-dose` 40 px).
**Seis campos, quatro módulos — e nenhum apareceu em nenhuma das varreduras
clínicas.**

### É a família do "afirma e não faz", uma camada abaixo

O achado central da auditoria foi que **o app AFIRMAVA e não FAZIA** — texto e
comportamento divergindo. Isto é o degrau seguinte:

> **O app sabia a dose e não deixava informar o peso que a calcula.**

O conteúdo estava certo, a conduta estava certa, a fonte estava aberta — e o
médico não conseguia chegar até elas.

### Limitação declarada do balanço

O `RELATORIO-CONSOLIDADO.md` registra o que a auditoria cobriu. **Ela não cobriu
operabilidade da entrada em módulo nenhum**, e este é o registro dessa lacuna.

**Consequência de direção, e o autor já a tinha antecipado ao fechar a
auditoria:** *o que muda mais o app daqui em diante não é auditoria de conteúdo,
é USO.* As três travas nascidas desta frente — contraste renderizado, paleta e
barra utilizável — medem o que a tela ENTREGA, e as três acharam defeito real na
primeira execução, em módulos declarados fechados.

---

## R-70 · O RÓTULO faz parte da saída de dúvida

**Conteúdo certo, completo e bem escrito é inalcançável se o rótulo estiver em
TAXONOMIA CLÍNICA em vez de na VOZ DE QUEM HESITA.**

### O caso, 2026-08-16

A varredura por "enunciados que já contêm a incerteza como critério" achou o
`sepsis/foco_atb`. A opção se chama **"Foco indeterminado"**, e o destino tem
esquema completo: cobertura ampla, piperacilina-tazobactam + vancomicina,
meropenem se MDR, buscar ativamente o foco e desescalonar.

⚠️ **O conteúdo não tem defeito nenhum. O rótulo tem.**

> **"Foco indeterminado" é uma CATEGORIA. "Não sei qual" é um ESTADO.**
> **Só o segundo é reconhecido por quem está nele.**

Quem hesita entre pneumonia e urossepse não pensa *"o meu caso é um foco
indeterminado"* — pensa *"não sei qual"*. Ele lê a lista de nove focos
procurando o seu, não acha, e escolhe **o mais parecido** — que é justamente o
chute com consequência que a saída existia para evitar.

### Primo do R-48, e a diferença importa

| | R-48 | R-70 |
|---|---|---|
| onde está o conteúdo | na superfície **errada** | na superfície **certa** |
| por que não chega | quem precisa não passa por ali | a porta **não se anuncia** |
| conserto | mover o conteúdo | **reescrever o rótulo** |

### ⚠️ A FORMA AGRAVADA: "Não / indefinido"

Encontrada em dois nós (`dyspnea/q_hipercapnia`, `shock/q_distributivo`), e é
pior que rótulo ruim: **funde DESCARTEI com NÃO SEI, que são opostos.**

- quem **descartou** tem informação — examinou, mediu, e o achado é negativo;
- quem **não sabe** não tem informação nenhuma;
- **e o que se faz a seguir difere**: o primeiro segue o algoritmo adiante, o
  segundo precisa saber o que fazer enquanto não sabe.

Fundir os dois num rótulo faz o app tratar ausência de dado como dado negativo.
Separar não é estética.

### Consequência prática

**O conserto de uma saída de dúvida tem TRÊS partes, não duas:**

1. **separar** o "não" do "indefinido", quando estiverem fundidos;
2. **escrever o destino no molde B** — o que fazer agora, o que espera, o que
   discrimina;
3. **rotular a saída na voz de quem hesita** — não na taxonomia do protocolo.

Um destino excelente atrás de um rótulo em jargão é conteúdo que ninguém lê.

---

## R-71 · UNIVERSO CIRCULAR — a trava fica verde quando o defeito volta

**O universo da trava não pode depender do artefato que ela mede.**

### O caso, 2026-08-16

`auditoria-padroes-ui` decide quais nós medir por um teste de texto — se o nó
fala de instabilidade/gravidade, ele entra no radar. E o texto lido incluía o
`summary`.

⚠️ **As regras de "na dúvida" vivem no `summary`, e falam de instabilidade.**
Resultado: o nó **ENTRAVA no radar ao ganhar a correção** e **SAÍA ao perdê-la**.

A mutação que remove a regra fez a contagem de pendências **cair**, e a trava
passou. Ou seja: **ela ficava verde exatamente quando o defeito voltava.**

### Distinto do D-15, e por isso tem regra própria

| | D-15 | R-71 |
|---|---|---|
| defeito | universo **listado à mão** | universo **derivado do próprio alvo** |
| como falha | fica incompleto e não cresce | **retrai-se junto com a correção** |
| sintoma | verde por não olhar | **verde por deixar de olhar** |

O segundo é pior: o primeiro erra por omissão estável — o mesmo ponto cego
sempre. O segundo **erra no momento exato em que a regressão acontece**.

### O TESTE QUE DETECTA

> ⚠️ **A mutação que REMOVE a correção tem de AUMENTAR a contagem de
> pendências, nunca diminuí-la. Se diminuir, o universo é circular.**

É barato e deve ser rodado em toda trava de contagem, teto ou legado.

### A CORREÇÃO

**Universo pela NATUREZA do objeto, nunca pelo seu ESTADO.**

- natureza = o que o nó **é**: `title` + `question`, o que ele pergunta;
- estado = o que já **foi feito** com ele: o `summary`, o legado, a cobertura.

O mesmo vale fora das árvores: "campo numérico" é natureza; "campo numérico que
tem barra" é estado — e contar só os que têm barra faz a troca da barra por
caixa passar despercebida.

---

### R-71, forma nova · INSTRUMENTO QUE APARECE NO PRÓPRIO UNIVERSO MEDE A SI

Registrada em 2026-08-18. Uma trava que procura um PADRÃO precisa **se excluir do
universo que varre** — senão o literal que ela busca a incrimina.

**O CASO.** `valida-leitura-de-fonte.cjs` proíbe `fs.readFileSync` sobre arquivo
`.ts` em todo `scripts/`. Ela varre `scripts/*.cjs` procurando esse padrão. Na
primeira execução ela reprovou **a si mesma**: o padrão que ela busca está
escrito dentro dela, como literal da própria busca, e casou.

    ❌ valida-leitura-de-fonte.cjs: lê fonte .ts com `fs.readFileSync`

Não era falso positivo de regex mal escrita — a regex estava certa. Era o
universo mal definido: o instrumento fazia parte do conjunto que ele media.

**A CORREÇÃO, e por que ela não é «filtrar o ruído»:**

    const EU = path.basename(__filename);
    ...filter((x) => x.endsWith(".cjs") && x !== EU)

⚠️ **E o cuidado que vem junto:** excluir-se do universo é legítimo para o
instrumento, e é FRAUDE para qualquer outro arquivo. A exclusão tem de ser
`__filename` — derivada, nunca uma lista de nomes —, porque lista de exceções é
onde um arquivo inconveniente se esconde depois. Vale para toda trava que procure
padrão em código: varredura de hex, de literal não traduzido, de chamada proibida.

Parente do R-71 original (o instrumento não pode ser a fonte do que ele mede):
ali a contaminação era de DADO, aqui é de UNIVERSO.

## R-72 · COBERTURA CRUZADA DECLARADA — resposta legítima, com duas condições

**Quando uma trava é circular NA FORMA (R-71) e outra fecha o buraco por caminho
diferente, declarar a cobertura cruzada é melhor que endurecer a circular.**

### O caso, 2026-08-16

`contraste-renderizado` conta textos abaixo do piso de contraste. Aplicado o
teste do R-71: **apagar o texto ilegível zera a contagem e o teste passa.** É
formalmente o mesmo defeito da `barra-utilizavel`.

Mas endurecê-la exigiria contar quantos textos cada tela deve ter — frágil, e
reprovaria por qualquer edição legítima. A resposta certa foi outra: **medir se
alguma trava pega o apagamento.** Apaguei o aviso "Peso ainda NÃO confirmado" e
`valor-informado-vs-padrao` reprovou.

### AS DUAS CONDIÇÕES — sem elas, "cobertura cruzada" é desculpa para não consertar

1. ⚠️ **PROVAR POR MUTAÇÃO que a outra pega.** Não supor, não argumentar por
   proximidade temática: executar o apagamento e ver a outra trava falhar.
2. ⚠️ **VERIFICAR QUE OS CAMINHOS SÃO DIFERENTES DE FATO** — senão é o mesmo
   ponto cego duas vezes, que é a inversão do R-65. No caso: uma mede o **par de
   cores renderizado**, a outra exige que o **texto exista e mude de estado**.
   Objetos diferentes, mecanismos diferentes.

**Se as duas condições estiverem cumpridas, a circularidade da primeira é
aceitável e fica DECLARADA no cabeçalho dela.** Se qualquer uma faltar, o
conserto é obrigatório — como foi na `barra-utilizavel`, que ganhou piso por
módulo porque nada mais guardava a existência da barra.

---

## R-73 · Na dúvida sobre incluir, INCLUA — o falso negativo é o caro

**Falso positivo é VISÍVEL e barato. Falso negativo é INVISÍVEL e caro.**

Ao escrever qualquer varredura é preciso decidir o que entra no universo: quais
campos de um nó, quais arquivos de um diretório, quais módulos de um app, quais
seções de uma diretriz. A assimetria decide sozinha:

| | falso positivo (incluí algo que não era) | falso negativo (deixei de incluir) |
|---|---|---|
| como aparece | **um item a mais no relatório**, que se descarta ao ler | **não aparece** |
| custo | segundos de leitura | conclusão errada, e ela se propaga |
| quem percebe | quem lê o resultado | **ninguém** |

⚠️ **O verde de um universo incompleto é idêntico ao verde de um universo
completo.** Foi assim que uma sonda leu 6 dos 11 campos de texto dos nós, não
viu 25.574 caracteres em 173 nós, e me fez declarar "beco sem conteúdo" um nó
que trazia conduta, lista de causas e encaminhamento.

**Aplicação:** a lista de EXCLUSÃO de um helper de varredura deve ser mínima e
declarada — só o que é comprovadamente identificador ou ligação. Tudo o mais
entra. Vale para campo, arquivo, módulo e seção de diretriz.

E o corolário para achados de AUSÊNCIA (R-13): *"não existe"* só pode ser dito
por instrumento cujo universo se sabe completo — caso contrário o que se está
dizendo é **"não li"**, com a mesma aparência.

---

## R-74 · VER NÃO É CONFERIR — universo completo com asserção ausente

**Universo completo NÃO implica cobertura.** A trava pode ler tudo e não
perguntar nada sobre o que leu.

### O caso, 2026-08-16

`valida-choque` lê o arquivo `shock-decision-tree.ts` **inteiro**, cru, por
texto — universo perfeito, vê todos os campos de todos os nós. E **nunca
asseriu nada sobre `dx_distributivo_outro`**.

Resultado: a conduta daquele nó — noradrenalina, cortisol, hidrocortisona na
suspeita de insuficiência adrenal — estava **visível ao instrumento e invisível
na prática**. Eu a declarei inexistente, e nenhuma trava me contradisse, porque
nenhuma tinha opinião sobre aquele nó.

### As três formas do problema de cobertura

| | o que falha | como aparece |
|---|---|---|
| **D-15** | universo **incompleto** — não lê | verde por não olhar |
| **R-71** | universo **circular** — deixa de ler quando se corrige | verde no instante da regressão |
| **R-74** | universo **completo, asserção ausente** — lê e não pergunta | ⚠️ **verde com a trava presente e correta** |

**A terceira é a mais enganosa**, e por um motivo humano: no relatório ela tem a
melhor aparência das três. A trava existe, roda, passa, e o módulo consta como
guardado. Ninguém procura o que não foi perguntado.

### O TESTE QUE A DETECTA

> **Para cada nó (ou objeto) do universo, existe pelo menos UMA asserção que o
> nomeia? Nó dentro do universo e fora de toda conferência é PONTO CEGO
> DECLARÁVEL.**

Não é exigir asserção sobre tudo — é exigir que a lista dos não-conferidos
exista e seja escrita. Ponto cego declarado é dívida; ponto cego ignorado é
falsa segurança, e a diferença entre os dois é uma linha de relatório.

### Relação com o R-13

É o R-13 aplicado ao instrumento: assim como "não existe" precisa dizer onde se
procurou, **"o módulo está guardado" precisa dizer o que a trava pergunta** — e,
sobretudo, o que ela não pergunta.

---

## R-36 · caso de 2026-08-16 — QUATRO ITENS PARECIAM NÚCLEO, DOIS ERAM

**A semelhança de NOME entre listas de contraindicação é altíssima. A de JANELA
não é. E é a janela que decide.**

### O caso

Três nós do app perguntam "há contraindicação ABSOLUTA ao trombolítico?" — AVC,
SCA e TEP. As listas se parecem tanto que a fonte única parecia óbvia, e eu a
propus: núcleo compartilhado + acréscimos por indicação, no molde da amiodarona
e da enoxaparina.

⚠️ **O autor recusou e mandou conferir janela a janela ANTES de fundir.** As
fontes foram abertas, e o resultado desmontou a proposta:

| item | AVC | SCA | TEP |
|---|---|---|---|
| **cirurgia intracraniana/intraespinhal** | 3 MESES | **2 MESES** | "recente" |
| **AVC isquêmico recente** | 3 meses | 3 meses **EXCETO agudo em 4,5 h** | **3 (StatPearls) × 6 (ESC)** |
| **pressão arterial** | **ALVO TRATÁVEL** (< 185/110) | relativa > 180/110 | relativa > 180/110 |
| **dissecção de aorta** | absoluta | absoluta | **não consta** |
| hemorragia intracraniana prévia | ✅ | ✅ | ✅ |
| sangramento ativo / diátese | ✅ | ✅ | ✅ |

**Dos quatro que pareciam núcleo, DOIS eram.** Fundir teria criado limiar errado
em duas das três telas: contraindicando a mais na SCA (3 em vez de 2 meses) ou
de menos no AVC.

### O que o desenho virou

Três listas COMPLETAS, próprias de cada indicação. Os dois itens realmente
comuns vêm de **constante compartilhada** e aparecem inteiros nas três telas,
**marcados como comuns na tela**.

> ⚠️ **A fonte única não é da LISTA — é dos DOIS ITENS.** Três cópias à mão de
> "hemorragia intracraniana prévia" é o padrão que gerou metade dos achados
> desta auditoria, e duas linhas não são exceção à regra.

### A pergunta que generaliza

Antes de fundir duas listas que se parecem:

> **Os itens têm o mesmo NOME ou o mesmo NÚMERO?** Nome igual com número
> diferente não é o mesmo item — é uma armadilha com boa aparência.

E o corolário para o app: quando as fontes divergem entre si (o TEP, 3 × 6
meses), **o app não escolhe — ele nomeia quem diz o quê**, para que quem decide
saiba a qual referência está aderindo.

---

## R-47 · violação de 2026-08-17 — e o prejuízo foi real

**Usei `git checkout <arquivo>` para restaurar uma mutação, e o arquivo tinha
trabalho NÃO COMMITADO. Perdi os dois ramos do AVC.**

### O caso

Ciclo de mutação normal: plantei o defeito, a trava acusou, e para restaurar
digitei `git checkout avc-decision-tree.ts` em vez de copiar de volta a cópia do
scratchpad — que era o que eu vinha fazendo nas outras vinte mutações desta
sessão.

O `checkout` restaurou o arquivo do **HEAD**, e o HEAD não tinha nada do bloco:
nem o ramo de contraindicação (`ci_avc_lista`), nem o ramo da oclusão de grande
vaso (`lvo_como_saber`), nem os imports. **Duas horas de trabalho apagadas por
um comando de uma linha.**

### Por que aconteceu, e a lição não é "tenha cuidado"

Nas outras mutações a restauração era `cp $S/backup.ts arquivo.ts`. Nesta, o
arquivo mutado era o terceiro de uma sequência e **eu não tinha feito backup
dele** — então recorri ao git, que parecia equivalente e não era.

⚠️ **A regra não é sobre o comando: é sobre a ORDEM.** `cp` restaura o que EU
salvei; `git checkout` restaura o que o REPOSITÓRIO tem. Quando há trabalho não
commitado, os dois divergem — e a divergência é exatamente o trabalho que
importa.

### O que fica

1. **Backup ANTES de mutar, sempre** — mesmo quando a mutação parece pequena.
   O custo é um `cp`; o custo de não fazer é reconstruir de memória.
2. **Reconstruí por reaplicação, não de memória**: os textos estavam em `lib/`
   (que não foi tocado), e o que se perdeu foi só a fiação — imports, opções e
   dois nós. **Ter posto o conteúdo em constantes de biblioteca limitou o
   prejuízo à parte mecânica**, o que é um argumento a mais para a fonte única.
3. E a verificação de que a reconstrução ficou completa foi por EXECUÇÃO —
   `valida-alcancabilidade` (141), `valida-avc` (24), `test:ci-trombolise` (39)
   e `varredura-pt` (0 sem tradução) —, não por leitura do diff.

---

## R-75 · CERTO E RECOLHIDO — a terceira forma de conteúdo que não chega

**Ao corrigir conteúdo clínico, "em que campo isso vai" é PARTE da correção, não
detalhe de implementação.**

### O caso que nomeia a regra — e é da nossa própria auditoria

No EAP corrigimos o defeito de classificar por PAS em vez de perfusão, e
escrevemos a frase que ensina a decidir:

> *"⚠️ ANTES DE VASODILATAR, DECIDA SE O PACIENTE ESTÁ QUENTE OU FRIO — e a PA
> NÃO responde isso."*

Ela foi para `evidence`. E `evidence` renderiza RECOLHIDO, atrás do "Ver
critérios (N)".

⚠️ **A correção existiu, foi verificada por trava, passou no `test:all` — e não
chegava a quem decide.** Medido: era a única frase da lista dos 39 cujo conteúdo
não existia visível em nenhum outro nó do módulo.

### As três formas, e elas são da mesma família

| | o que acontece | regra |
|---|---|---|
| **certo na superfície errada** | o conteúdo está num módulo, e quem precisa está noutro | R-48 |
| **certo e truncado** | o conteúdo chega à tela e é cortado no meio | R-50 |
| **certo e recolhido** | o conteúdo chega à tela e fica atrás de um toque | **R-75** |

Nas três, a revisão de código aprova, a trava fica verde e o texto está correto.
**O que falha é a entrega.**

### O recorte da trava — e por que ele é estreito

`evidence` recolhido NÃO é defeito por si: critério diagnóstico detalhado deve
ficar guardado. Dos 39 alertas medidos, 25 estão certos onde estão.

A trava vigia só a classe cujo custo é IRREVERSÍVEL: **prazo e precedência**.
Quem não viu um prazo perdeu a janela, e não há como recuperar depois.

⚠️ **E ela não exige "todo ⚠️ visível"** — isso faria alguém TIRAR O MARCADOR
para passar, que é o R-55 em forma pura. A porta se fecha por outro lado: um
PISO de alertas por módulo, que impede a contagem de cair.

### A pergunta que fica, para toda correção clínica daqui em diante

> Escrevi no campo que a tela MOSTRA, ou no campo que a tela GUARDA? E se é
> guardado: quem precisa disto sabe que precisa abrir?


---

### Reenquadramento (2026-08-17) — não é erro de julgamento, é consequência de estrutura

A pergunta acima supõe que **houve escolha**: que alguém, podendo escrever no
campo visível, escreveu no guardado. A medição desmente isso.

**A distribuição, por tipo de nó — 391 nós, 17 árvores:**

| tipo | nós | sem `summary` | % |
|---|---|---|---|
| `action` | 186 | **3** | **2%** |
| `transition` | 70 | 0 | 0% |
| `decision` | 106 | **56** | **53%** |
| `input` | 29 | 28 | 97% |

⚠️ **3 de 186 contra 56 de 106.** Nos nós de AÇÃO — que têm o campo `actions`,
uma lista visível e natural para conduta — praticamente todos têm resumo. Nos
nós de DECISÃO, onde o único campo visível além de título e pergunta é o
`summary`, **mais da metade não tem nenhum**.

O `evidence` não venceu uma disputa com o `summary`: ele foi **o único campo
disponível** quando havia conduta a escrever num nó de decisão. E ele recolhe a
partir do terceiro item, silenciosamente, por contagem.

**Isso muda a correção.** "Mova o item para o campo certo" trata caso a caso um
padrão que é do formato. Mas a regra larga — *todo nó de decisão precisa de
summary* — está errada pelo outro lado: forçaria texto onde não é preciso.
Medido: dos 56, **17 não têm `evidence` nenhum** (`dyspnea/q_asma`,
`shock/q_septico` — perguntas binárias do fluxo guiado, corretas como estão), e
**19 têm 1 ou 2 itens**, que já renderizam abertos. Escrever resumo nesses 36
criaria 36 frases de enchimento, que é o defeito da densidade pelo avesso.

**O recorte que descreve a dívida real é a conjunção:**

> nó de DECISÃO **com `evidence` ≥ 3** **e sem `summary`** — porque aí a
> conduta está *necessariamente* recolhida: não existe outro lugar visível
> para ela.

São **20**, não 56. O pior é `coronary/ecg`, com 15 itens atrás de um toque.

**E os 29 `input` não são dívida:** 28 não têm `summary`, mas **28/28 têm
`intro`**, e o `InputStep` o renderiza como `<Text>` direto, aberto — sem
acordeão. Nenhum deles tem `evidence` ≥ 3. O campo visível existe lá, e por
isso o padrão não se repete.

### A forma mais persistente: o alerta que sobe pela metade

`coronary/stemi_reperfusao` **já tinha sido corrigido por esta regra**. A
primeira passagem subiu o PRAZO (≤ 120 min) e o PONTO DE PARTIDA (do primeiro
contato médico). Ficou recolhida a **consequência**:

> "Contar do lugar errado ENCURTA o prazo percebido e faz escolher ICP quando a
> fibrinólise já era a opção certa."

⚠️ **Corrigir "o alerta está recolhido" não garante que o alerta INTEIRO
subiu** — e a parte que fica é sistematicamente a que EXPLICA, porque parece
dispensável a quem já entendeu a regra. Quem escreve já entendeu; quem lê, não.
E é a explicação que faz obedecer: um médico que lê "conta do primeiro contato"
sem saber o que está em jogo trata a frase como detalhe de auditoria.

**A pergunta ganha uma segunda metade:**

> Escrevi no campo que a tela MOSTRA? E subiu a REGRA sozinha, ou subiu também
> a razão pela qual desobedecê-la custa caro?

---

## R-76 · PRESENÇA se verifica em produção; AUSÊNCIA, na árvore compilada

**As duas perguntas parecem simétricas e não são.** "O texto novo chegou?" e "o
texto velho sumiu?" pedem instrumentos diferentes, e usar o mesmo para as duas
produz falso negativo — sempre no lado da ausência.

### O caso (2026-08-17)

Verificação de rotina do deploy `761c90c`. Onze literais **extraídos do repo**
(não digitados de memória — R-62) conferidos no bundle de produção, decodificado
nas duas formas de escape. Os onze presentes. Depois, cinco frases que **não
podiam** estar lá:

```
✅ ausente « SUDOREBA »
✅ ausente « Opioide — miose, bradipneia, coma »
❌ PRESENTE « quadro sem toxidrome definida »
❌ PRESENTE « não a frequência cardíaca nem a pupila »
✅ ausente « CRIANÇA: 0,01 a 0,06 mg/kg »
```

Duas acusaram presença. **Nenhuma das duas chega à tela.** São chaves órfãs do
dicionário de tradução: o texto mudou nas árvores, e a entrada antiga —
`"frase velha": "traducción vieja"` — continua no dicionário, que é compilado
inteiro para dentro do bundle.

### Por que só um lado mente

⚠️ **O bundle é a soma do que RODA com o que SOBROU.** Ele contém o código
vivo, mas também dicionários indexados por chave, ramos que nenhuma rota
alcança, e strings que só existem como dado. Para a pergunta da presença isso é
inofensivo: se a frase nova está lá, ela foi deployada — o pior caso é que ela
esteja lá e não seja alcançável, e isso é outro defeito, não um erro de
medição.

Para a pergunta da ausência é fatal: encontrar a frase velha **não distingue**
"o texto continua vivo na tela" de "sobrou uma chave morta num dicionário". O
instrumento responde SIM às duas, e só uma é defeito.

### A regra

| pergunta | onde se verifica | por quê |
|---|---|---|
| **o texto novo chegou ao usuário?** | bundle de PRODUÇÃO | é a única prova de que o deploy saiu; a fonte local não sabe o que foi publicado |
| **o texto velho saiu?** | árvore COMPILADA (as constantes resolvidas) | é o que a tela renderiza, sem dicionário, sem código morto |

**E isto corrige retroativamente o método do deploy.** Nas verificações
anteriores procuramos PRESENÇA — que é o uso certo, e por isso elas valem. A
regra existe para que ninguém repita o padrão para o outro lado achando que é
a mesma conferência.

### O corolário que a sonda abriu

Se o dicionário guarda chaves de frases que já não existem, o zero de
"traduções pendentes" também muda de significado — ele conta o que falta
traduzir, não o que sobra traduzido. **D-45.**

---

## R-77 · ITEM QUE DESFAZ ERRO DE LEITURA — a classe de maior prioridade

**Ele não acrescenta informação. Impede que o texto visível seja lido ao
contrário.** E por isso está acima de prazo na ordem do que sobe: prazo
escondido faz PERDER TEMPO; leitura invertida faz AGIR AO CONTRÁRIO.

### Os três casos que revelaram a classe (2026-08-17)

**`sepsis/corticoide_check`** — o nó exibe `NE ≥ 0,25 mcg/kg/min por ≥ 4 h`. Um
número na tela, sozinho, lê-se como critério de entrada. O item recolhido dizia:

> "é REFERÊNCIA DE PRÁTICA e o critério dos ensaios, útil como parâmetro — mas
> **NÃO É PORTÃO**, e não deve impedir a indicação em quem já tem necessidade
> persistente de vasopressor."

Sem ele, o médico com paciente em 0,20 mcg/kg/min **nega o corticoide** por não
atingir um número que nunca foi limiar.

**`shock/inicio`** — a pergunta do nó é *"PA sistólica < 90 mmHg…?"*. O item
recolhido dizia que **a hipotensão não é obrigatória** — taquicardia e
vasoconstrição preservam a PA no choque compensado. Sem ele, a própria pergunta
induz o NÃO que fecha o módulo num paciente em choque.

**`avc/isq_contraindicacoes`** — sete itens listam contraindicações absolutas e
relativas. O oitavo dizia que **as relativas não proíbem, mudam a conta**. Sem
ele, uma lista de contraindicações se lê como lista de proibições, e o paciente
com uma relativa deixa de ser trombolisado.

### O que os três têm em comum

⚠️ **O texto visível INDUZ a resposta errada sozinho** — não por omissão, mas
por construção: um número parece limiar, uma pergunta parece critério, uma lista
parece proibição. O item recolhido é a única coisa que desfaz a indução, e ele
está exatamente onde ninguém olha.

**Isto muda o que a ausência significa.** As outras classes deixam o app
incompleto: falta um prazo, falta um detalhe, falta o mecanismo. Esta deixa o
app **enganando** — ele exibe algo que leva à conduta oposta e guarda a correção
atrás de um toque.

### Como procurar (a forma, para quando houver varredura)

> **Onde o nó exibe um NÚMERO e outro item diz que aquele número não é o
> critério, há um R-77 candidato.**

E as variantes, generalizadas dos três casos:

| o que a tela exibe | o item que desfaz | a leitura errada evitada |
|---|---|---|
| um limiar numérico | "é referência, não portão" | negar conduta abaixo do número |
| uma pergunta com valor de corte | "o valor pode estar normal" | responder NÃO e sair do fluxo |
| uma lista de contraindicações | "estas não proíbem, ponderam" | tratar relativa como absoluta |
| um escore | "não existe ponto de corte estabelecido" | inventar o corte que a fonte recusa |

⚠️ **A quarta linha já tinha aparecido** — é o `LVO_NIHSS_SEM_LIMITE`, escrito
para o AVC porque a fonte prediz oclusão sem estabelecer limiar. Na época
pareceu um cuidado isolado de redação; era esta classe, sem nome.

### A consequência prática

Numa triagem entre itens que sobem, **este vem primeiro** — antes de prazo,
antes de precedência, antes de contraindicação. E, ao contrário das outras
classes, ele não pode ser resumido para caber: a frase precisa NOMEAR o que
seria lido errado. "Considere o contexto clínico" não desfaz indução nenhuma.

---

## R-78 · CONTADOR QUE PREMIA O DEFEITO

**Uma métrica de OCORRÊNCIAS sobre conteúdo que pode estar DUPLICADO sobe
quando o app piora e cai quando melhora.** Uma trava assim não é cega: é
ativamente contrária ao objetivo que declara.

### O caso (2026-08-17)

O `PISO_DE_ALERTAS` do `valida-prazo-visivel` existe para impedir que alguém
apague um ⚠️ para passar em trava (R-55). Ele contava strings marcadas por
módulo, e o piso só sobe.

Duas correções legítimas o fizeram cair:

1. **fusão** — o prazo do porta-balão e a sua consequência viraram um `summary`
   só. Duas strings marcadas → uma, com o conteúdo das duas. 26 → 25;
2. **deduplicação** — nove constantes deixaram de ser consumidas em dois nós. O
   texto continuou vivo e ABERTO em `ecg_sem_supra`. 25 → 21.

⚠️ **O contador dizia que o app que mostra o mesmo alerta em dois lugares "tem
mais alertas" que o app que o mostra num só.** Duplicar conteúdo fazia o número
subir; deduplicar o fazia cair e reprovava o build.

Corrigido contando ÚNICOS (`Set`, não incremento). Deduplicar deixou de mexer no
número; apagar continua reprovando — as duas mutações provam.

**E a medição que a correção permitiu:** nove dos dezessete módulos tinham
alerta duplicado — `poisoning` 7, `seizure` 6, `dka-hhs` 5, `rsi` 5,
`acute-abdomen` 4, `tce` 2, `coronary` 1, `eap` 1. Vinte e oito duplicatas que o
contador antigo lia como riqueza.

### O teste que detecta, e é de uma linha

> **A correção CORRETA faz o número subir ou descer?** Se descer num piso, ou
> subir num teto, o contador está do lado errado.

Aplicado a todos os contadores desta auditoria:

| trava | conta | direção | veredito |
|---|---|---|---|
| `valida-paleta` (hex por arquivo) | ocorrências | teto, só desce | **correto** — cada hex escrito à mão é dívida própria, e repetir a mesma cor cinco vezes é cinco vezes pior. Extrair para constante faz descer, que é o que se quer |
| `valida-prazo-visivel` · LEGADO (prazos escondidos) | ocorrências | teto, só desce | **correto** — duplicar um prazo escondido piora de fato; subir o texto faz descer |
| `valida-prazo-visivel` · PISO_DE_ALERTAS | ~~ocorrências~~ → **únicos** | piso, só sobe | **era o defeito**; corrigido |
| `traducao-composta` / `frase-composta` | ocorrências | teto, só desce | **correto** — cada concatenação é dívida, e duplicá-la é dobrá-la |
| `auditoria-padroes-ui` (TETO 10) | ocorrências de PENDÊNCIA | teto, só desce | **correto** — soma de defeitos; corrigir faz descer |
| `valida-etiquetas` (teto 4 por etiqueta) | módulos por etiqueta | teto | **imune** — conta `id`, que é único por construção |
| `valida-sinonimos` (MINIMO 6) | termos por módulo | **piso, só sobe** | ⚠️ **vulnerável** — ver abaixo |
| `barra-utilizavel` (MINIMO_DE_BARRAS) | barras renderizadas | **piso, só sobe** | ⚠️ **vulnerável em teoria** — ver abaixo |

### As duas vulnerabilidades encontradas, e por que uma é pior

**`valida-sinonimos`** exige ≥ 6 termos por módulo e conta o tamanho do array.
Repetir `"engasgo"` seis vezes passa. A conferência de ambiguidade só olha
termos entre módulos DIFERENTES — a repetição interna não é vista por ninguém.
⚠️ **Medido hoje: zero módulos com termo repetido internamente.** O defeito é
possível, não presente; a correção é um `Set` no cálculo do piso.

**`barra-utilizavel`** exige um mínimo de barras por módulo. Duplicar um campo
numérico satisfaria o piso sem acrescentar utilidade. É mais frágil como
argumento — uma barra duplicada aparece na tela e alguém veria —, mas a
assimetria é a mesma: o caminho fácil para passar é piorar.

### A REGRA

> **PISO SOBRE COISA CONTÁVEL CONTA ÚNICOS POR PADRÃO — a decisão contrária é
> que precisa de justificativa escrita.**

**Por que o piso e não o teto.** O teto pune quem acrescenta, e duplicata
acrescenta: quem duplica se aproxima do limite e é punido. O piso recompensa
quem acrescenta — e duplicata é a forma mais barata de acrescentar. A assimetria
não é acidental: **num piso, o caminho mais curto para passar é sempre piorar**,
e contar únicos é o que fecha esse caminho.

O ônus fica invertido de propósito. Não é "prove que precisa contar únicos"; é
**"escreva por que ocorrências, aqui, medem o que você diz medir"**. O
`valida-paleta` tem essa justificativa e ela é boa — cada hexadecimal escrito à
mão é uma dívida própria, e a mesma cor cinco vezes é cinco lugares para
corrigir. Já o `PISO_DE_ALERTAS` não tinha nenhuma, porque ninguém a pediu.

---

## R-79 · NÚMERO DESMENTIDO É NÚMERO RETIDO

**Citar uma cifra para avisar contra ela deixa a cifra na memória e a ressalva na
página.** Se o número não deve ser usado, ele **não aparece**: vai para o
comentário do código, e o texto visível se refere a ele sem reproduzi-lo.

### O caso (2026-08-17)

O texto da pralidoxima dizia "idealmente nas primeiras 24–48 h" — número sem
fonte aberta, e a decisão foi retirá-lo. Ao reescrever, incluí o aviso na forma
mais natural possível:

> "não confie em nenhuma janela em horas que você tenha lido, inclusive a que
> estava aqui antes: este texto dizia **\"idealmente nas primeiras 24–48 h\"**,
> sem fonte, e a frase dava falsa tranquilidade a quem deveria estar correndo."

A trava reprovou — ela vigia a presença da janela no texto do nó, e não fazia
distinção entre afirmar e desmentir. **E ela estava certa por uma razão que eu
não havia previsto ao escrevê-la.**

O texto corrigido:

> "não confie em nenhuma janela em horas que você tenha lido — inclusive a que
> **ESTE TEXTO trazia antes**, que não tinha fonte e dava falsa tranquilidade a
> quem deveria estar correndo."

### Por que a citação não é neutra

⚠️ **Quem lê depressa guarda a cifra e descarta a ressalva.** Num fluxo de
emergência a leitura é por varredura: os olhos param em números, siglas e caixa
alta, e a estrutura sintática — o "não", o "sem fonte", o "antes" — é justamente
o que se perde. O leitor sai com "48 horas" e sem o "não".

E há um agravante de procedência: **um número citado dentro do app parece do
app.** Depois de duas telas, ninguém lembra se leu "24–48 h" como recomendação
ou como advertência — lembra que leu no aplicativo.

### É o espelho do R-77

| | R-77 | R-79 |
|---|---|---|
| o que a tela mostra | um limiar que **parece** critério | um número **desmentido** |
| o que a tela explica | "é referência, não portão" | "não tem fonte, não use" |
| o que o leitor retém | o número | o número |

**A raiz é a mesma: o que a tela MOSTRA pesa mais que o que a tela EXPLICA.** No
R-77 a conclusão é subir a explicação para junto do número. No R-79 é **tirar o
número**, porque não há explicação que o desfaça — a explicação já está do lado
dele e perde.

### A regra operacional

> Ao remover um valor por falta de fonte, **não o reproduza no aviso**. Refira-se
> a ele por posição ("a janela que este texto trazia antes"), por classe
> ("nenhuma janela em horas") ou por procedência ("o que você leu em outro
> lugar") — e registre a cifra no comentário, onde serve de histórico e não de
> referência clínica.

**E a trava não precisa distinguir afirmação de desmentido** — não distinguir é o
comportamento correto. Uma conferência que aceitasse "24–48 h" quando cercado de
negativas estaria confiando na sintaxe que o leitor apressado não lê.

---

## R-80 · TRAVA QUE PROTEGE DECISÃO, não que corrige defeito

**Toda trava até aqui nasceu de um achado.** Um defeito foi medido, corrigido, e
a trava existe para que ele não volte — a mutação devolve o defeito histórico, e
é isso que prova que a trava vê o que diz ver (R-1).

**Esta classe é outra.** Ela nasce de uma decisão **correta** que alguém
desfaria por bom senso, sem nunca ter havido defeito. E o que ela guarda não é
uma linha de código: é a razão pela qual a coisa foi feita do jeito
contraintuitivo.

### O caso que nomeou a classe (2026-08-17)

`valida-ira`, do primeiro módulo NOVO da auditoria. Não havia defeito de origem
— o módulo nasceu certo. Cada conferência carrega o **"porque parece"** que a
ameaça:

| a decisão | como alguém a desfaria | por que parece certo desfazer |
|---|---|---|
| perguntar o observável, nunca a classificação | trocar por "é pré-renal, renal ou obstrutivo?" | **parece organizado** — é a taxonomia dos livros |
| o contraste meta × critério da diurese | apagar como redundante | **parece redundante** — o app já usa `< 0,5 mL/kg/h` em 30 nós |
| obstrução primeira na exclusão | reordenar para pré → renal → pós | **é a ordem canônica** — todo livro a apresenta assim |
| a alternativa a "chame o nefrologista" | remover | **parece óbvio** que se transfere |
| a declaração de que a KDIGO 2026 é rascunho | dizer "revisão mais recente" | **parece mais atual** |

⚠️ **Em nenhum desses casos quem desfaz está sendo descuidado.** Está aplicando
a formação: a taxonomia é real, a ordem canônica é canônica, transferir é óbvio,
e citar a diretriz mais nova parece rigor. A trava existe porque **a decisão
certa parece errada**.

### A irmã que veio antes, sem nome

`valida-antibiotico-renal`, conferência 3, escrita horas antes: ela reprova quem
"corrigir" o piso para *"ajuste a dose se houver disfunção renal"* — que é o que
a formação ensina, e que a coorte de sepse com LRA desmente (HR 0,588 a favor de
adiar o ajuste). O comentário dela diz **"a conferência que protege a evidência
contra o bom senso"**.

R-80 é essa mesma coisa generalizada: **onde a decisão certa parece errada, ela
precisa de guarda mesmo sem defeito histórico.**

### O que muda no método

**A mutação tem de reproduzir a correção PLAUSÍVEL, não uma quebra artificial.**
Apagar um campo ou renomear uma variável prova que a trava lê o arquivo; não
prova que ela pega o que vai acontecer de verdade. A mutação certa é a que um
revisor competente faria de boa-fé:

```
❌ artificial  · remover a constante e ver a trava reclamar do import
✅ plausível   · trocar "pergunte o que você vê" por "qual é o padrão?"
```

**E a mensagem de falha muda de função.** Numa trava de defeito ela diz *o que
quebrou*. Numa trava de decisão ela tem de **argumentar** — reproduzir a razão
que quem desfez não conhecia:

> "É o mesmo defeito das toxidromes ("qual toxidrome?") e dos padrões do abdome
> — e a correção é a mesma: pergunte o que se VÊ."

> "SEM O MECANISMO, 'não ajuste agora' soa como negligência e quem lê desobedece
> POR PRUDÊNCIA — subdosando o séptico, que é o erro que mata mais rápido."

Sem esse parágrafo, a trava vira obstáculo: quem bate nela desfaz a conferência
em vez de entender a decisão, e o resultado é pior que não tê-la.

### Quando escrever uma

Não em toda decisão — a maioria se defende sozinha. O gatilho é a conjunção:

1. a decisão **contraria** a apresentação canônica, a intuição clínica ou a
   forma mais organizada de escrever; **e**
2. quem a desfizer **não terá o contexto** — o motivo vive numa fonte aberta em
   sessão, numa medição, ou num defeito de outro módulo; **e**
3. desfazê-la **não quebra nada** visivelmente: compila, os testes de conteúdo
   passam, e a tela continua parecendo bem.

O item 3 é o que a torna necessária. Decisão contraintuitiva cujo desfazimento
estoura algo se defende sem trava.

---

## R-81 · CHAVE DE ESTADO QUE O TESTE CONTROLA É PARTE DO CONTRATO

Quando um teste precisa **fixar** um estado do app para exercitar um caminho —
idioma, tema, sessão, unidade —, a chave desse estado deixa de ser detalhe de
implementação: ela é interface entre o instrumento e o programa. Se as duas
pontas escrevem a chave à mão, uma pode mudar sem a outra saber, e o teste
segue verde exercitando o estado **padrão**.

### O caso que a originou (2026-08-17)

Os testes e2e fixavam `localStorage` na chave `app-locale`. O app lê
`cea_active_locale` (`lib/locale.ts`). Por **sete meses** os testes de tela
escreveram numa chave que ninguém lê: **nenhum teste jamais rodou em espanhol**,
e todos passaram — porque rodar em português é o caminho que funciona.

### A regra

A chave é **exportada da fonte única** e **importada** pelo teste. Nunca
escrita duas vezes. No caso: `LOCALE_STORAGE_KEY` em `lib/locale.ts`,
consumida por `fixarIdioma()` em `e2e/helpers.ts`.

### ⚠️ O AGRAVANTE, e ele é parte da regra

**Quando o instrumento que veria o defeito É o defeito, nada o denuncia exceto
olhar a tela.** Não há trava que pegue: o teste passa, o build passa, a
varredura passa. A suíte inteira concorda consigo mesma, e a discordância só
existe fora dela — no aparelho do médico.

É por isso que a regra não é "cuidado com chaves duplicadas", e sim **a fonte
única é obrigatória nesta classe**: aqui a autovigilância não funciona por
construção. Toda vez que um estado do app for fixado por teste, pergunte antes
de escrever a chave: *se eu errar este nome, o que reprova?* Se a resposta for
"nada", a chave tem de vir de `import`.

---

## R-82 · O INSTRUMENTO LÊ O FONTE, A TELA MOSTRA O RUNTIME

Uma conferência que lê **arquivo** responde sobre o que alguém escreveu. A tela
mostra o que o **programa montou**. Quando há concatenação, interpolação,
composição ou derivação entre os dois, as duas respostas divergem — e a
conferência passa com o defeito na tela.

### A pergunta que a generaliza

> **O que eu estou lendo é o que a tela recebe, ou é o que alguém escreveu antes
> de o programa montar?**

### Terceira ocorrência, e as três

| | o instrumento lia | a tela recebia |
|---|---|---|
| `valida-coronarias` | o literal no arquivo | a frase composta pelo nó |
| leitura parcial de nó (→ `textos-do-no.cjs`) | `actions[]` | `actions` + `evidence` + `exitCriteria` + `summary` |
| **tradução (este bloco)** | literais curtos, cada um com chave | a soma deles, **sem chave nenhuma** |

### A medição que fecha o caso

`lib/causas-na-parada.ts → HIPERCALEMIA_NA_PARADA`: string em runtime de **722
caracteres**, chave no dicionário de **287** — divergem no caractere 287, onde a
concatenação continua. No arquivo existem três literais curtos, cada um
traduzido. `npm run test:i18n` dizia **zero pendências** e estava certo do
próprio ponto de vista. O médico via conteúdo clínico em português com o app em
espanhol.

E foi levado ao fim por mutação: acrescentei um pedaço por concatenação a uma
frase que **tinha** chave, gravei a chave **do pedaço** — a varredura de fonte
passou com «SEM TRADUÇÃO: 0» e a tela continuou em português. **Obedecer o
instrumento de fonte ao pé da letra produz dicionário verde e tela não
traduzida.**

### A regra

Toda trava declara **de que universo** lê, no cabeçalho. Quando o que importa é
o que a tela recebe, o universo é o **artefato compilado** — não o fonte. As
duas leituras podem coexistir (é cobertura cruzada declarada), mas nunca uma
como se fosse a outra.

### ⚠️ E vale contra a própria auditoria

Meu levantamento atribuiu `TCE_HIPERVENTILACAO_TERCEIRA_LINHA` só a
`lib/alvos-tce.ts`, onde ela é **declarada**. A trava a encontrou também em
`tce-decision-tree.ts`, onde é **consumida** — e a mutação mostrou o alcance
real: uma concatenação em `lib/` derrubou **três** superfícies. Quem edita a
constante não vê as telas que ela alimenta. A pergunta acima aplica-se a quem
mede, não só a quem escreve trava.

---

## R-83 · GEOMETRIA SEM CONTEÚDO MEDE A FORMA E ERRA O OBJETO

Medir posição, tamanho e borda diz **onde** a coisa está e **como** ela se
parece. Não diz **o que** ela é. Duas faixas largas com borda inferior no topo da
tela não são dois cabeçalhos: uma delas pode ser um card.

### O caso que a originou (2026-08-17)

Para decidir a inversão do cabeçalho, medi em produção "faixa larga, de altura
de cabeçalho, com borda inferior, no topo". O resultado saiu errado **nos dois
sentidos**:

| | o que era | quantos |
|---|---|---|
| falso POSITIVO | o card "Estabilização primeiro" — mesma geometria, objeto outro | 19 |
| falso NEGATIVO | o herói de `correcoes-eletroliticas`, que mostra o nome do módulo **sem borda inferior** | 1 |

Sem ler o texto das faixas eu teria relatado **19 defeitos inexistentes** e
declarado sem defeito a única tela que também duplicava.

### A regra

Toda medição por coordenada precisa de um **segundo critério que diga o que
aquilo é**. E o segundo critério tem de ser um atributo que o objeto **tem por
ser o que é**, não uma aparência:

- ❌ "tem borda inferior" — aparência; o herói não tem e é cabeçalho.
- ❌ "o texto é o nome do módulo" — nove módulos escrevem outra coisa
  (« ACLS · Adulto · Suspeita de PCR », « TCE · Passo 1 »). Reprovaria variação
  legítima de rótulo.
- ✅ "carrega o caminho de volta" — é o que um cabeçalho de módulo tem e um card
  de conteúdo não.

### ⚠️ E o erro reincide dentro do próprio instrumento

Ao escrever a trava, o mesmo erro apareceu **duas vezes mais**:

1. exigi 18 px de altura do rótulo de volta — o "Voltar" de dois módulos tem
   13 px, e o filtro geométrico escondeu justamente a coisa procurada;
2. aceitei a palavra `módulos` como marca de volta — e ela casou com o título
   "Calculadora alinhada ao padrão dos **módulos**", inventando uma duplicação.

Palavra de CONTEÚDO usada como marca de ESTRUTURA devolve número errado. Três
ocorrências num só instrumento é a medida de como o erro é fácil.

### ⚠️ O CASO PARTICULAR MAIS CARO: `\b` EM REGEX JS É ASCII

`\b` é definido sobre `\w` = `[A-Za-z0-9_]`. **Letra acentuada não é `\w`**, então
todo detector de português ou espanhol que use `\b` colado a um acento erra — e
erra nos DOIS sentidos, que é o que torna o defeito difícil de ver:

| padrão | o que acontece |
|---|---|
| `/\bé\b/` | casa com o `é` DENTRO de "tambi**é**n" — há fronteira entre `i` e `é`, e outra entre `é` e `n`. Marcou 40+ linhas de espanhol CORRETO como português. |
| `/\baté\b/` | NÃO casa em "até 15 cmH₂O": o `\b` final exige caractere de palavra depois do `é`, e ali vem espaço. **Marca cega.** |
| `/\bà beira do leito\b/` | NÃO casa em "disponível à beira do leito" — o `\b` inicial exige palavra ANTES do `à`. Ramo morto. |

A fronteira correta é explícita e Unicode: `(?<![\p{L}\p{N}])…(?![\p{L}\p{N}])`
com a flag `u`.

**A varredura (2026-08-17):** 33 linhas com `\b` próximo a acento nas travas e
scripts; duas eram defeito real e silencioso —

- `auditoria-prescricao-sem-dose.cjs`, ramo `\bà beira do leito\b` de
  `RE_PREPARO`: nunca casava, então o auditor não reconhecia a frase como preparo;
- a mesma trava, lista `FARMACOS` interpolada em `` `\b(${FARMACOS.join("|")})\b` ``:
  **`ácido tranexâmico` nunca era detectado** — o `\b` antes do `á` não casa depois
  de espaço. Um fármaco de trauma invisível ao auditor, em silêncio.

⚠️ O padrão é COPIADO entre travas. Quem escrever detector de idioma novo:
`\b` só serve se as duas pontas do que você procura forem ASCII.

### O complemento do R-68

R-68 diz que medição substitui impressão. R-83 é o limite disso: **medição do
atributo errado é pior que impressão, porque vem com autoridade.** Uma impressão
se apresenta como impressão e o leitor desconta; "19 módulos com cabeçalho
duplicado" se apresenta como fato, e quem recebe age.

---

## R-84 · POLLING É NEGAÇÃO DE SERVIÇO CONTRA SI MESMO

Consultar um serviço em laço curto para saber se algo aconteceu não é apenas
ineficiente: **derruba o canal pelo qual se pretendia verificar.**

### O caso que a originou (2026-08-17)

Para saber se um deploy havia subido, consultei a produção a cada 15 s, por
minutos, duas vezes seguidas. O Vercel ligou o **Security Checkpoint**: `403` para
este IP e o navegador preso em "Estamos verificando seu navegador".

⚠️ **O custo não foi o tempo perdido — foi ficar sem poder afirmar o estado de
produção.** Dois commits ficaram com verificação pendente, e por alguns minutos eu
não sabia distinguir "o site caiu" de "eu me bloqueei". O médico abriu o app no
navegador dele, carregou normal, e só então ficou claro que o 403 era do meu IP.

### A correção é de RITMO, não de método

Verificar em produção continua certo (R-76). O que muda é a cadência:

1. **Espere o tempo típico do build antes da PRIMEIRA consulta.** Aqui são ~2–3
   min; consultar antes disso é garantidamente inútil.
2. **Depois, intervalo largo** — minutos, não segundos. Um deploy não fica pronto
   mais rápido por ser observado.
3. **Toda consulta a serviço externo tem custo do lado de lá**, e o custo aparece
   como bloqueio, não como erro de rede.

### ⚠️ E A DISTINÇÃO QUE PRECISA SOBREVIVER

**"Não sei se subiu" ≠ "não consigo perguntar".**

O primeiro é ignorância sobre o alvo; o segundo é uma falha do instrumento, e
confundir os dois faz atribuir ao sistema observado um defeito que é do
observador. Foi o que quase relatei: com o bundle bloqueado no painel embutido,
concluí que o seletor de idioma da produção estava quebrado. Estava intacto — o
JavaScript nunca havia carregado.

### O mesmo defeito do R-15 item 13, agora com efeito externo

R-15 item 13 é o laço cego: `>/dev/null 2>&1` esconde a falha e o laço gira sem
saber. Ali o dano era interno — tempo. Aqui o laço cego **produziu** a condição
que impediu a verificação. Laço que não olha o que recebe não é só surdo: ele age.

---

## R-85 · REPETIÇÃO DELIBERADA E CÓPIA POR DESCUIDO TÊM A MESMA ASSINATURA NUMÉRICA

Uma varredura de repetição mede caracteres iguais em nós diferentes. **Ela não
distingue o bloco copiado por descuido do mesmo aviso colocado de propósito em
vários estágios** — os dois produzem o número idêntico, e o número parece
autoexplicativo.

### A regra

**Medição de repetição consulta as travas e as decisões escritas ANTES de propor
corte.** E onde não houver razão escrita, **escrevê-la é parte da correção** —
senão a próxima varredura propõe o mesmo corte, com o mesmo número, e com a mesma
confiança.

### As cinco ocorrências, e a força da regra está nelas

Num único bloco de "consolidar repetição" (2026-08-17) eu propus cinco cortes com
a medição na mão. **Os cinco eram decisões protegidas, e cinco travas nossas me
reprovaram uma por uma — cada uma com argumento melhor que o meu:**

| trava | o que ela defendeu | o argumento dela |
|---|---|---|
| `test:tce` | a fronteira do TCE penetrante nas DUAS superfícies | o nó MENCIONA "penetrante", e menção solta num app em que tudo o mais tem conduta **sugere que o assunto está tratado** — foi assim que o defeito da PD-4 nasceu |
| `test:intoxicacoes` | as contraindicações do flumazenil no nó de catálogo | é ali que alguém **ESCOLHE** o antídoto; contraindicação viaja junto da escolha |
| `test:convulsoes` | isoniazida e sódio repetidos no refratário | «é exatamente ali que o paciente está sob anestésico **sem que ninguém tenha perguntado**» |
| `test:antidotos` | a consequência da duração curta em toda prescrição de naloxona | quem prescreve carrega o fato que muda conduta, **mesmo num gatilho de uma linha** |
| `test:i18n` | as 10 frases novas sem tradução | texto novo é texto novo, ainda que seja só ponteiro |

O ganho caiu de 10.311 para 7.193 caracteres por causa delas, e está certo assim.

⚠️ **Foram travas nossas defendendo decisões nossas contra nós.** É a prova de que
o instrumento vale: quem escreveu a decisão não estava na sala, e a trava estava.
Num app sem elas, os cinco cortes teriam passado — com número, com relatório, e com
aparência de rigor.

### O caso mais instrutivo

No refratário das Convulsões meu argumento era *"perguntar por isoniazida na 3ª
linha é tarde"*. Verdadeiro — **e irrelevante para quem JÁ está na 3ª linha.**
Ponteiro ali exige navegar para trás com o paciente sedado. Estava raciocinando
sobre a ordem do fluxo e não sobre quem chega àquela tela.

### ⚠️ E LER A RAZÃO INCLUI LER O CABEÇALHO DO ARQUIVO QUE VOCÊ EDITA

No mesmo dia, reordenei `constants/module-groups.ts` para pôr consulta depois de
cenário e **relatei a queixa do autor como resolvida**. Aquele arquivo não desenha
tela nenhuma — o hub ordena em outro lugar —, e o **cabeçalho do próprio arquivo
diz isso**, na segunda linha:

> *"Agrupamento temático dos módulos — usado para COBERTURA E VALIDAÇÃO, não para
> desenhar a tela."*

Escrevi um comentário afirmando que "quem abre o app com um paciente lê a ordem"
**duas linhas abaixo da frase que o desmentia**. A produção mostrou os cards ainda
em ordem alfabética.

A razão escrita não estava numa trava nem numa PD: estava no topo do arquivo
aberto na tela. Consultar as razões inclui as três, e a mais fácil de pular é a
que está mais perto.

### O corolário do R-83

R-83 diz que geometria sem conteúdo erra o objeto. R-85 é o mesmo na dimensão do
texto: **contagem de caracteres iguais mede a forma da repetição e não diz se ela é
defeito.** O segundo critério, aqui, não é medível — está escrito em trava, em
PD ou em comentário. Se não estiver em nenhum dos três, não existe, e a primeira
coisa a fazer é escrevê-lo.

---

---

### ⚠️ O CUSTO MEDIDO — o item do rodízio, 2026-08-17/18

A melhor evidência desta regra não é o argumento: é a conta de uma rodada em que
ela foi ignorada. **Quatro propostas caíram**, e a última quase chegou ao médico
como pergunta clínica.

| # | proposta | como caiu |
|---|---|---|
| 1 | subir a linha para cima do CTA de medicação | competiria com a droga — troca de prioridade clínica |
| 2 | pôr no painel `CONDUTA DESTE CICLO` | o painel também está abaixo da dobra nos estados de fármaco (y1037–1060) |
| 3 | fundir a frase com o contador | **afirma** que o marco de 2 min é o mesmo evento — asserção sem fonte (R-89) |
| 4 | pôr dentro do bloco `PRÓXIMO RITMO` | o bloco "não existia" nesses estados |

E a quarta caiu por uma razão **que estava escrita no código o tempo todo**:

```ts
// acls/screen-model.ts
function getTimerLabel(input) {
  if (intent === "perform_cpr")    return tr("Próximo ritmo");
  if (intent === "analyze_rhythm") return tr("Ver ritmo");
  if (intent === "deliver_shock")  return tr("Aplicar choque");
  return tr("Tempo atual");
}
```

O bloco **é renderizado em todos os estados** — `timerVisible: Boolean(activeTimer)`,
sem exceção. O que muda é o RÓTULO, que segue o `clinicalIntent`. O seletor da
medição procurava o texto `PRÓXIMO RITMO`; onde não achou, foi lido como "o bloco
não é renderizado".

⚠️ **DAÍ SAIU UM ACHADO CLÍNICO FALSO** — «o médico administra a epinefrina sem
saber quanto falta para o próximo ritmo» — que foi levado ao autor como pergunta
para decidir. Ele não existia.

### O que a conta ensina, em uma linha

> **Medir antes de ler o que já está escrito custou uma pergunta clínica falsa.**

A ordem não é "meça, depois procure a razão". É **procure a razão escrita, depois
meça** — porque a medição herda as suposições do seletor, e um seletor construído
sobre a suposição errada produz um número que parece medição e é inferência.

⚠️ E o erro foi dos DOIS lados: o autor tinha a regra na mão e mandou medir
primeiro. Regra conhecida e não aplicada é o caso normal, não a exceção — é por
isso que ela vive no MÉTODO e não na memória de quem trabalha.

## R-86 · EDIÇÃO DE VOLUME SE PROVA POR RETRATO FRASE A FRASE

Toda correção que **reduz** texto — consolidar repetição, encurtar aviso, mover
bloco — se prova assim, e não por leitura:

1. **Antes:** retrato de todas as frases do universo, com onde cada uma vive.
2. **Depois:** o mesmo retrato.
3. **Diferença:** toda frase que sumiu do conjunto tem de ser **localizada no
   estado novo** — dentro de outra frase, reescrita, ou justificada uma a uma.

### ⚠️ A PROMESSA É DO INSTRUMENTO, NÃO DO MÉTODO

Como esta regra foi escrita primeiro — *"toda frase que sumir tem de ser
localizada"* —, ela é **falsa**, e a falsidade é do tipo perigoso: parece uma
garantia. Ela vale só para as frases que o instrumento VÊ.

O `retrato-de-frases.cjs` filtrava `length > 28` **na captura**, e por isso não
via **29,3% das frases** (1.851 de 6.312). O que ele engolia não era ruído: eram
os RÓTULOS QUE ABREM BLOCO DE CONDUTA — «⚠️ AINE:», «(1) PERFURAÇÃO POSSÍVEL:»,
«⚠️ VOLVO:», «O QUE FAZER AGORA:». Uma linha curta de conduta podia desaparecer e
o retrato **não reportava**.

Descobri por acaso: uma verificação minha acusou o sumiço de
«⚠️ NÃO É OCLUSÃO EM CURSO:» — 26 caracteres — e o texto estava intacto.

> **A PRIMEIRA COISA A CONFERIR NUM RETRATO É O QUE ELE NÃO CAPTURA.**
>
> Antes de usar a diferença como prova, pergunte qual é o universo, qual é o
> piso, e o que fica de fora por construção. Um retrato com ponto cego devolve
> "zero frases desaparecidas" com a mesma confiança de um retrato completo.

### E a correção é de LUGAR, não de número: filtre no relatório, nunca na captura

Filtro na captura troca precisão por **cobertura**, e cobertura perdida é
invisível — não aparece como erro, aparece como silêncio. A captura passou a ser
total; o filtro vive na leitura, com uma **regra de retenção que não depende de
tamanho**: frase que termina em `:` ou abre com marca (⚠️ • → numeração) entra
sempre, porque são os rótulos que o buraco engolia.

⚠️ Retratos gerados antes de 2026-08-17 usaram piso 28. Continuam válidos como
comparação — cada bloco comparou antes×depois com o mesmo piso dos dois lados —,
mas comparar um retrato novo com base antiga produz ~1.850 falsas "frases novas".

### O que separa "moveu" de "perdeu"

Na Coluna A, cinco frases desapareceram do app. As cinco **reapareceram MAIORES**:

```
"…naloxona se depressão respiratória com miose."        158 → 490 ch
"a dose depende da PROCEDÊNCIA do opioide…"              59 → 108 ch
"Benzodiazepínico → Flumazenil — o teto depende…"        81 → 154 ch
"Anestésico local (LAST) → …ver o passo próprio"        118 → 132 ch
"Manter também SpO₂ ≥ 90%, normocapnia…"                 56 →  97 ch
```

⚠️ **É isso que separa "moveu" de "perdeu"**, e nenhuma leitura do diff mostraria:
o `git diff` de uma consolidação bem-feita e o de uma que apagou conteúdo têm a
mesma cara — linhas somem de um arquivo. A diferença só aparece quando se pergunta
**onde cada frase que sumiu está agora**.

O instrumento é barato: compila as árvores, colhe as frases por nó, compara os dois
conjuntos. E o critério é binário — frase não localizada é conteúdo perdido até
que se prove o contrário.

---

## R-87 · TRAVA QUE REPROVA PORQUE O CÓDIGO MELHOROU É PROXY QUEBRADO

**O sinal é preciso: a trava reprovou e NENHUM caractere se perdeu.**

Quando isso acontece, ela não estava medindo o que protege — estava medindo um
**substituto**: o nome do nó, o campo em que o texto vivia, o arquivo. O
substituto valia enquanto a estrutura era aquela, e quebrou quando a estrutura
melhorou.

### O reflexo errado, e o certo

❌ Excluir o caso, afrouxar o padrão, marcar como exceção — tudo isso enfraquece a
proteção para acomodar uma mudança que era boa.

✅ **Reescrever a asserção no nível do INTENTO.** E ela quase sempre fica mais
forte, porque o intento é mais amplo que o proxy.

### O caso que a originou (2026-08-17)

`valida-abdome-agudo.cjs` lia `node.actions` do nó `vascular` e conferia que as
quatro entidades da isquemia mesentérica estavam lá. O intento estava escrito na
própria mensagem de erro:

> *"As quatro têm tratamento diferente — fundi-las manda para a laparotomia quem
> tem indicação clínica (R-36)."*

O nó virou uma DECISÃO com quatro saídas, e as quatro entidades passaram a viver
nos nós de resposta — exatamente o oposto de fundi-las. **As dez conferências
reprovaram, e o app tinha ficado melhor.**

Generalizada para ler a SUBÁRVORE (o nó e o que se alcança dele), com
`textos-do-no.cjs`. E, sobre a estrutura nova, couberam asserções que antes não
existiam: que `vascular` é decisão, que a pergunta é a da peritonite, que as cinco
saídas existem, que nenhum rótulo começa pelo nome do diagnóstico, que a trombose
venosa NÃO aponta para `cirurgia`, que os dois ramos do NOMI carregam a linha
hemodinâmica, e que `evidence` não passa de dois itens.

**48 → 61 conferências.** A trava saiu mais forte da mudança que a reprovou.

### Como distinguir do caso legítimo

Nem toda reprovação é proxy quebrado. A diferença é a pergunta do R-86:
**alguma frase saiu do app?**

- Saiu conteúdo → a trava está certa, a mudança é que está errada.
- Não saiu nada e a estrutura mudou → é proxy. Generalize.

Foi assim que, no mesmo dia, cinco reprovações foram acatadas (R-85, decisões
protegidas) e dez foram generalizadas (R-87, proxy quebrado). O retrato frase a
frase é o que separa os dois casos, e sem ele os dois se parecem.

### ⚠️ COROLÁRIO — cada asserção decide SOZINHA o próprio escopo

Ao generalizar do nó para a subárvore, **não se generaliza em bloco**. O escopo
certo depende do que cada asserção afirma:

| a asserção fala de… | escopo | exemplo |
|---|---|---|
| **LEITURA** — o que cabe numa tela | **NÓ** | "o mesmo parágrafo aparece duas vezes", "este nó tem mais de 2 itens em `evidence`" |
| **CONTEÚDO** — o que existe no caminho | **SUBÁRVORE** | "a conduta do LAST está completa", "os quatro rótulos separam as entidades" |

**Generalizar em bloco troca proteção por falso positivo.** Aconteceu no mesmo
commit: ao migrar `valida-intoxicacoes` para a subárvore, a conferência de
"duplicado na mesma tela" passou a ver o caminho inteiro e acusou o nó
`identificar` — que alcança `tox_sedativo` e `antidoto`, **dois nós diferentes,
cada um com a sua cópia legítima** do bloco do flumazenil.

A asserção "duplicado na MESMA TELA" perde o sentido no instante em que "tela"
vira "rota". O arquivo ficou com dois leitores — `acoesDe` (subárvore) e `soDoNo`
(nó) —, e cada conferência escolhe o seu.

### A FORMA MAIS COMUM DO PROXY: âncora em REDAÇÃO

**TRAVA ANCORADA EM REDAÇÃO É PROXY. Ancore no FATO CLÍNICO.**

Não é regra nova — é esta mesma, reconhecida onde ela mais aparece. O substituto
não precisa ser o nome do nó nem o campo: **a frase escolhida também é
substituto**, e é o mais fácil de escolher sem perceber, porque no dia em que a
trava foi escrita a frase e o fato eram a mesma coisa.

**O sintoma é preciso, e é o mesmo do R-87 com outro gatilho: MELHORAR O TEXTO
DERRUBA A TRAVA.** Ninguém tirou conteúdo; alguém reescreveu — e a asserção caiu
porque estava presa às palavras, não ao que elas afirmam.

**Instâncias conhecidas:**

| trava | âncora que era proxy | o que a derrubou |
|---|---|---|
| `valida-ira` | o literal `"ANÚRICO há 12 horas já é estágio 3"` | a frase virou `"Anúria de 12 horas já é estágio 3"` ao sair a VINHETA (2026-08-20) |
| `valida-ira` | o nome do nó `base_check` | o nó foi substituído por `sobre_drc` na reconstrução (2026-08-18) |

Nos dois casos a mudança era boa e a trava reprovou. Reancoradas no fato — o CASO
(anúria fecha estágio 3 com creatinina intacta) e a CONDUTA (não a frase de
cabeçalho) —, elas passaram a proteger o que sempre quiseram proteger.

⚠️ **E o custo de não reconhecer é maior aqui do que nas outras formas:** trava
presa a redação **desencoraja melhorar o texto**. Quem sabe que reescrever uma
frase derruba o build reescreve menos — e o texto é o produto.

#### A mesma família do outro lado: BUSCAR pela redação

**BUSCA É MEDIÇÃO**, e busca presa à redação é proxy pela mesma razão que a
âncora é. O sintoma, porém, é o oposto — e por isso é mais difícil de notar:

| forma | sintoma | como aparece |
|---|---|---|
| trava ancorada em redação | **falso positivo** | o build fica vermelho, alguém olha |
| **busca** por redação | **falso NEGATIVO** | ninguém olha: o relatório afirma ausência, e ausência não tem quem a conteste |

**A instância (2026-08-20).** Ao medir se o módulo ACLS seguia a AHA 2025, procurei
`"IV primeiro"`. O conteúdo dizia **"tentar o acesso INTRAVENOSO primeiro"** — a
mesma coisa, com outras palavras. **Reportei ao médico que a mudança de 2025 sobre
acesso vascular não estava no conteúdo, quando estava em um lugar.** A lacuna
existia (faltavam a terceira via, as classes e o áudio), mas foi relatada maior
do que era, e a correção partiu de um diagnóstico exagerado.

⚠️ **E neste projeto já está escrito que o falso negativo é o caro** — é a razão
de os retratos existirem, e a de o R-92 dizer que aviso que não reprova não muda
nada. Uma varredura que não acha não prova ausência: prova que aquele literal não
está lá. **Busque pelo FATO** — o conceito, com as formas alternativas de dizê-lo
— e, quando o resultado for "não existe", desconfie antes de escrever.

---

## R-1 · COROLÁRIO — ASSERÇÃO QUE ACEITA "UM DOS DOIS" NÃO PROTEGE NENHUM

Quando o critério é uma **disjunção sobre ramos**, o ramo forte carrega o fraco: a
mutação no fraco passa, e a trava fica verde protegendo metade do que promete.

### O caso (2026-08-17)

A conferência de que a vigilância do LAST é comum aos dois ramos:

```js
if (!destinos.has("last_vigilancia") && n("last_ressuscitacao")?.next !== "last_vigilancia")
```

Mutação: mandei o ramo "NÃO parou" direto para `uti`, pulando a vigilância. **A
trava passou** — porque o ramo da parada continuava chegando lá, e o `&&`
curto-circuitava. Quem estabilizou com a emulsão é justamente quem **parece** não
precisar de vigilância, e é o caso que a asserção existia para proteger.

### A regra

**Cada ramo se confere sozinho, num laço, com a falha nomeando qual ramo caiu.**

```js
for (const [rotulo, opcao] of [["NÃO parou", "last_nao"], ["parou", "last_sim"]]) {
  if (!alcanca(destino(opcao), "last_vigilancia")) falhas.push(`o ramo "${rotulo}" …`);
}
```

O mesmo vale para `||` sobre coleções, `some()` onde se queria `every()`, e para
qualquer conferência que pergunte "existe algum" quando a promessa é "todos".

### ⚠️ E O SINAL DE QUE VOCÊ ESTÁ NISSO

A mensagem de falha não consegue dizer **qual** item falhou — só que "algo" falhou.
Se a mensagem precisa ser genérica, o critério provavelmente também é.

---

## R-88 · TRAVA QUE PROTEGE UMA AUSÊNCIA DECLARADA

Onde o app declara que **não fixa um número porque a fonte não o dá**, a ausência
é CONTEÚDO — e conteúdo sem guarda é conteúdo que o próximo revisor "completa".

### Por que ela é diferente das outras travas

As travas normais protegem o que está escrito. Esta protege o que está
**deliberadamente não escrito**, e o ataque tem uma forma específica: alguém lê
"este app não fixa o intervalo", enxerga uma **omissão**, e a corrige de memória.
O resultado parece uma melhoria — um número onde havia uma lacuna — e é uma
regressão do R-5: precisão inventada, com a autoridade de estar no app.

### A mutação é escrever o número plausível

Não uma quebra artificial. A mutação certa é **exatamente o que um revisor
competente faria de boa-fé**: trocar

> "⚠️ ESTE APP NÃO FIXA O INTERVALO da repetição"

por

> "repetir o ECG em 10–15 min"

que é plausível, é o que quase todo mundo diria, e não tem fonte aberta neste
módulo. A trava reprova, e a mensagem diz por quê — **as fontes tratam de
reconhecimento, não de cadência**.

### O caso (2026-08-17)

`ecg_sem_supra_duvida`. As fontes abertas para o módulo (JACC 2025, ACEP Now,
LITFL, revisões de De Winter/Wellens/VD) tratam de RECONHECIMENTO, não de
intervalo de repetição, e o número não existe em lugar nenhum do app. O texto
declara a ausência, manda usar o protocolo do serviço, e afirma o que não depende
do número: repetir, seriar, colher troponina, não liberar.

### ⚠️ A VARREDURA — 8 ausências declaradas, 2 com guarda

| ausência declarada | onde | guarda |
|---|---|---|
| intervalo do ECG seriado | `oclusao-sem-supra.ts` | ✅ `valida-coronarias` |
| horas de vigilância no LAST | `last-emulsao-lipidica.ts` | ✅ `valida-intoxicacoes` |
| NIHSS — "não existe um número que defina" | `oclusao-grande-vaso.ts` | ⛔ |
| janela do hemoperitônio | `hemoperitonio.ts` | ⛔ |
| cinética de envelhecimento por composto | `pralidoxima-controversia.ts` | ⛔ |
| "se o protocolo do seu serviço prevê pralidoxima" | `pralidoxima-controversia.ts` | ⛔ |
| "a AHA 2025 não fixa esquema" (fibrinólise no TEP) | `causas-reversiveis-detalhe.ts` | ⛔ |
| hiperventilação < 30 sem monitorização | `alvos-tce.ts` | ⛔ |

⚠️ **Seis das oito estão desprotegidas**, e cada uma é um convite a completar de
memória — as três mais expostas são números que todo médico "sabe": um limiar de
NIHSS, uma janela em horas, um intervalo de repetição.

### A regra

**Toda declaração de ausência recebe guarda no mesmo commit em que é escrita.**
Se a decisão de não fixar o número vale o parágrafo que a explica, vale a linha
que a defende.

---

## R-89 · PROXIMIDADE COMUNICA SEM AFIRMAR

Quando duas coisas acontecem juntas e **a fonte não diz explicitamente que
acontecem juntas**, aproxime-as na tela em vez de escrever a ligação. O médico lê
a relação; o app não a declara.

### O caso que a originou (2026-08-17)

A troca de compressor caía abaixo da dobra nos estados de fármaco do ramo
chocável. Três saídas foram medidas e descartadas — subir a linha (competiria com
o CTA da medicação), pô-la no painel `CONDUTA DESTE CICLO` (o painel também está
abaixo da dobra nesses estados, a y1037–1060), encolher outro bloco.

A saída certa veio de uma observação clínica do autor: **no marco de 2 minutos
acontecem TRÊS coisas ao mesmo tempo** — pausa, checagem de ritmo e troca de quem
comprime. Não competem por espaço; é um evento só, e o bloco `PRÓXIMO RITMO` já
conta para ele, a y452, bem acima da dobra.

### ⚠️ E A PRIMEIRA VERSÃO DA CORREÇÃO ERA CONTEÚDO NOVO SEM FONTE

A proposta inicial fundia as frases:

> ~~"em 89 s — checar ritmo e TROCAR quem comprime"~~

Isso **afirma** que o marco de 2 min é o mesmo evento para as três coisas. É
asserção clínica, e entraria no módulo mais sensível do app sem fonte aberta —
regressão do R-5, disfarçada de melhoria de layout.

O próprio autor recusou a sua versão ao ver o argumento, e formulou a regra:

> **COLOCAÇÃO NÃO É AFIRMAÇÃO.** O bloco diz `PRÓXIMO RITMO · 59s`; logo abaixo,
> `Trocar quem comprime — início do ciclo N (a cada 2 min)`, palavra por palavra
> como já está. A proximidade comunica a relação sem o app declará-la.

### A regra, e o que ela decide

- **Aproximar é grátis** — não afirma nada que a fonte não sustente, e não custa
  pixel novo.
- **Fundir é asserção** — e asserção nova precisa de fonte aberta em sessão (R-5).
- Se um dia a frase fundida for desejável, **abre-se a fonte primeiro**.

⚠️ Ela é o complemento do R-48. R-48 diz que o conteúdo vai para a superfície onde
a leitura errada acontece. R-89 diz **como** pô-lo lá quando a ligação entre os
dois conteúdos é verdadeira mas não está escrita em lugar nenhum: por vizinhança,
não por texto.

### O sinal de que você está prestes a violá-la

Você está reescrevendo duas frases em uma, e a frase nova contém um conector que
nenhuma das duas tinha — "e", "porque", "ao mesmo tempo", "junto com". O conector é
a asserção.

---

## R-90 · COR REPETIDA COM SIGNIFICADO É INFORMAÇÃO; POR ACIDENTE É RUÍDO

Duas repetições de cor com aparência idêntica na tela pedem correções opostas, e o
que as separa não é visual: é **se existe categoria comum por trás**.

### Os dois casos, no mesmo protótipo (2026-08-18)

| | o que acontecia | veredito |
|---|---|---|
| `Choque` e `AVC` | usavam a MESMA variável de cor (`--neu`), em cards diagonais na grade, **sem categoria comum** — um é hemodinâmico, o outro neurológico | **RUÍDO** — no desfoque os dois se fundiam e a fusão não dizia nada |
| `TEP`, `VM`, `EAP`, `Insuf. resp.` | a mesma cor (`--resp`) em três linhas quase seguidas, **todos respiratórios** | **INFORMAÇÃO** — ler como bloco É o conteúdo |

⚠️ No desfoque as duas parecem o mesmo defeito: uma mancha de cor repetida. Quem
corrigir por inspeção visual afasta as duas — e **destrói o agrupamento que estava
funcionando**.

### A regra

> **Antes de afastar cores que se repetem, pergunte se elas compartilham
> categoria.** Se compartilham, a repetição é o sinal. Se não, é colisão.

E a correção difere: no ruído, afasta-se a COR (nunca a posição na grade — ordem de
grade quebra no dia em que um módulo entra). Na informação, não se corrige nada.

### O parentesco com o R-83

R-83 diz que geometria sem conteúdo mede a forma e erra o objeto. R-90 é o mesmo na
dimensão da cor: **"duas manchas iguais" é forma; "duas categorias iguais" é
objeto.** O segundo critério, aqui, não está na tela — está na taxonomia das
etiquetas.

## R-91 · RÓTULO DE PERTENCIMENTO SÓ INFORMA ONDE HÁ UM PAI

Caiu do corte de etiquetas do hub em 2026-08-18, e vale muito além dele.

**A REGRA.** Um rótulo que diz A QUE FAMÍLIA um item pertence só acrescenta
alguma coisa quando existe uma família — isto é, quando o item é SUB-assunto de
algo e o título nomeia só a parte. **Numa lista plana de irmãos, dizer a que
família cada um pertence é dizer o nome dele outra vez.**

**A MEDIÇÃO QUE A PRODUZIU.** Das 30 etiquetas do hub, 24 saíram. As 6 que
ficaram caíram todas na MESMA seção — a do PCR — e nenhuma na outra. Não foi
escolha: dentro do PCR o título nomeia um sub-assunto («Causas Reversíveis») e a
etiqueta diz de que ele é sub-assunto («PCR»); na lista de módulos, cada card JÁ
É o seu próprio cenário, e a etiqueta só podia parafrasear o título.

**O TESTE, antes de escrever qualquer rótulo de pertencimento:** existe um pai
que o título não nomeia? Se o pai é o próprio item, o rótulo é eco.

⚠️ **O CANAL NÃO-TEXTUAL NÃO CAI JUNTO.** No hub, a barra colorida ficou nos 30.
Ela também marca pertencimento, mas não repete o título — ela agrupa sem
soletrar, e agrupar visualmente é justamente o que o texto não faz. A regra é
sobre RÓTULO, não sobre o canal.

Parente de R-90 (repetição com significado é informação, por acidente é ruído) —
aqui está nomeada a condição em que a repetição é acidente por construção. E é o
critério que gerou a segunda forma do D-54.

## R-92 · AVISO QUE NÃO REPROVA NÃO MUDA NADA

**A REGRA.** Uma conferência que só IMPRIME não é conferência. Ela vira ruído no
relatório e — pior — **vira permissão**: se o instrumento vê o achado e não
falha, quem lê conclui que aquilo está tolerado. **Ou a conferência reprova, ou
ela não existe.**

**O CASO COMPLETO, que é o que dá peso à regra.** `scripts/valida-etiquetas.cjs`
tem, desde que as etiquetas foram criadas, a conferência «A ETIQUETA NÃO REPETE
O TÍTULO». Ela funciona. Ela acha. E ela só imprime:

    ℹ️  « Anafilaxia » repete o título de anafilaxia — confira se acrescenta algo.
    ℹ️  « AVC » · « Politrauma » · « Choque » · « Abdome agudo »
    ✅ 7 conferências — 31 módulos em 27 áreas

**Cinco ocorrências, impressas em toda rodada de `test:all`, por semanas.** Em
2026-08-18 o mesmo defeito foi redescoberto do zero, medido à mão no protótipo do
hub, e virou D-54 — com 24 casos, não 5.

⚠️ **E O COMENTÁRIO DA PRÓPRIA TRAVA INTERPRETAVA O ACHADO AO CONTRÁRIO** do que
a medição depois deu:

    // Aviso, não falha: há casos legítimos ("Anafilaxia", "Choque"), em que o
    // título É o cenário e qualquer outra palavra seria pior.

Pelo critério de R-91, «Anafilaxia» e «Choque» são justamente os casos em que a
etiqueta é eco — não há pai que o título não nomeie. O aviso estava certo e a
leitura dele estava errada, e **como nada reprovava, a leitura errada nunca foi
posta à prova**. Um `❌` teria forçado a discussão no dia em que a etiqueta
nasceu.

**O TESTE, para toda conferência nova:** se ela disparar, alguém é obrigado a
fazer alguma coisa? Se a resposta é "não, é só informativo", ela não deve ser
escrita — o que se quer registrar vai para a documentação, onde não se confunde
com medição. E conferência existente que só avisa é dívida: ou ganha `exit 1`
com a lista de exceções EXPLÍCITA, ou sai.

⚠️ Não confundir com o RELATÓRIO de um instrumento de medida (retrato de frases,
inventário), cuja saída É o produto. A regra é sobre TRAVA: instrumento que
promete impedir algo.


## R-93 · TRAVA QUE REPROVA PORQUE O CONTEXTO MUDOU: A RAZÃO SOBREVIVE?

Quando uma trava reprova por causa de uma mudança de CONTEXTO — e não de um
defeito —, a pergunta certa não é «como faço passar». É esta:

**A RAZÃO da regra sobrevive no contexto novo?**

  · **Sobrevive** → o código está errado e a trava está certa. Conserta-se o
    código, e a discussão acabou.
  · **NÃO sobrevive** → a regra era GERAL DEMAIS. O que se corrige é o ESCOPO,
    com a razão escrita — ⚠️ **nunca uma lista de exceções**, que é onde qualquer
    caso inconveniente se esconde depois.

⚠️ **E ESCOPAR SEM MEDIR O NOVO ESCOPO TROCA UMA REGRA POR NENHUMA.** Ao tirar um
território da medida, ele precisa ganhar a sua própria asserção, ou o que se fez
foi desligar a trava com boa redação.

── O CASO (2026-08-18) ──────────────────────────────────────────────────────

`e2e/ordem-do-hub` promete que módulo de CONSULTA venha depois de módulo de
CENÁRIO. Ao nascer a seção «Dentro do módulo PCR Adulto», ela reprovou:
`ritmos-acls` e `farmacologia-acls` são consulta e passaram a ficar acima dos 22
módulos de cenário.

A razão da regra estava escrita: **quem abre o hub tem um paciente, e quem quer
tabela não tem** — então a tabela não pode roubar a posição de quem tem. Dentro
da seção do PCR **a pessoa tem as duas coisas**: o paciente em parada e a
necessidade da tabela para ele, agora. A razão não sobrevive ali.

O escopo passou a ser explícito, nos dois sentidos:

    a LISTA PRINCIPAL é onde consulta COMPETE com cenário   → medida
    a SEÇÃO DO PCR é onde a consulta É do cenário           → medida à parte

E a segunda medida foi provada por mutação: pondo Ritmos e Farmacologia no topo
da seção, o teste reprova com «CONSULTA ANTES DE CENÁRIO DENTRO DA SEÇÃO DO PCR».
Sem ela, elas poderiam subir acima da bradicardia e do engasgo e nada avisaria.

⚠️ **O RISCO QUE ESTA REGRA CONTROLA** é o de usar «o contexto mudou» como
senha para desligar qualquer trava incômoda. O antídoto é a razão ESCRITA: se
ela não puder ser enunciada em duas linhas e confrontada com o contexto novo, o
que está acontecendo é conveniência, não escopo.

Parente de R-92 (o que não reprova não impede) e de R-87 (asserção sobre leitura
é do nó; sobre conteúdo, da subárvore) — as três são sobre o mesmo eixo: qual é o
UNIVERSO de que a promessa fala.


### R-85, forma mais cara · A RAZÃO ESTAVA ESCRITA, E A DECISÃO DE PRODUTO A RECRIOU

Registrada em 2026-08-18, e é a ocorrência mais cara do R-85 nesta auditoria —
porque **não foi um instrumento que falhou. Foi a decisão de produto.**

── O QUE ACONTECEU ──────────────────────────────────────────────────────────

Em 2026-08-17 a auditoria REMOVEU um aninhamento: oito módulos ACLS eram
filtrados para fora do hub e redesenhados DENTRO do card do PCR. O caso que
provou o defeito foi o Engasgo (OVACE) — paciente CONSCIENTE, de pé, tossindo,
apresentado como item da parada. O motivo ficou escrito em três lugares:
`constants/module-groups.ts` (cabeçalho), `constants/module-area-labels.ts` e
`components/module-hub.tsx`.

Em 2026-08-18, ao montar a seção «Dentro do módulo PCR Adulto» na UI 2.0, eu pus
o Engasgo dentro dela. **Com um rótulo que afirma, em português, aquilo que a
auditoria tinha desfeito.** Não era o mesmo código — era a mesma AFIRMAÇÃO, com
outro desenho. E o médico havia pedido duas vezes.

── POR QUE ESTA FORMA É PIOR QUE AS ANTERIORES ──────────────────────────────

Nas ocorrências anteriores do R-85 o que falhou foi um INSTRUMENTO: reordenei um
array que não desenha tela, escrevi uma trava que se satisfazia com o próprio
comentário. Instrumento errado se conserta com outro instrumento.

⚠️ **Aqui o que falhou foi a leitura de uma razão CLÍNICA já escrita.** Nenhuma
trava pega isso, porque não há defeito técnico: os tipos batem, o teste passa, a
tela renderiza, e a afirmação clínica é falsa. A seção estava tecnicamente
impecável e dizia que o engasgado consciente é um caso de parada.

── O QUE FICA COMO PROCEDIMENTO ─────────────────────────────────────────────

⚠️ **AGRUPAR É AFIRMAR.** Toda vez que um desenho novo puser conteúdo clínico
DENTRO de um rótulo — seção, aba, acordeão, card-pai —, a pergunta antes de
desenhar é: *o rótulo é verdadeiro para cada item que ele passa a conter?* E, se
algum item já foi movido para fora de um agrupamento antes, **a razão daquela
mudança tem de ser lida antes de recriá-lo** — ela está no repositório, e é isso
que o R-85 diz.

A correção: o Engasgo voltou para a lista principal com a etiqueta VIA AÉREA, a
seção passou de 8 para 7 cards, e a exclusão ficou EXPLÍCITA em
`constants/secao-do-pcr.ts` com a razão clínica — travada por `test:secao-pcr`,
que reprova exclusão sem razão declarada (para não virar lista de exceções, R-93).

## R-94 · MEDIÇÃO QUE RESPONDE A PERGUNTA A NÃO ENCERRA A PERGUNTA B

Ainda que as duas tenham nascido juntas, no mesmo pedido, na mesma frase.

── O CASO (2026-08-17/18) ───────────────────────────────────────────────────

O médico pediu os cronômetros do ACLS **num card só**, porque os dois separados
CONFUNDEM. O pedido carregava duas perguntas:

    A · a fusão resolve o problema da DOBRA? (posição na tela)
    B · a fusão resolve a CONFUSÃO?          (qual relógio é qual)

Mediu-se a A: o card unificado teria 315–400 px contra 165 px da faixa, e não
existia nos estados de fármaco — a fusão NÃO resolvia a dobra. Resposta correta,
medida, registrada.

⚠️ E essa resposta foi usada para encerrar o item INTEIRO. A pergunta B — que era
o pedido original — nunca foi medida, e o médico teve de cobrar de novo. A
medição verdadeira de A funcionou como álibi para a não-medição de B: um número
legítimo dá ao encerramento uma aparência de rigor que ele não tem.

── O TESTE ──────────────────────────────────────────────────────────────────

**Quando uma medição encerrar um item, conferir se o item tinha UMA pergunta
só.** Se tinha duas, o encerramento vale para a que foi medida — a outra volta
para a fila com nome próprio.

Parente de R-68 (o valor medido tem de variar onde o objeto varia): lá o
instrumento mede o proxy em vez do objeto; aqui a medição certa de UM objeto é
tomada como medição de OUTRO. Nos dois casos o número é real e a conclusão não.

### R-94, segunda forma · O INSTRUMENTO RESPONDE A PERGUNTA DELE, NÃO A SUA

Registrada em 2026-08-18, e é a mesma família da R-94: uma resposta legítima
sendo lida como resposta de outra pergunta.

── O CASO ───────────────────────────────────────────────────────────────────

Ao separar as 44 instruções da IRA, o `retrato-de-palavras` acusou a perda da
frase «é o contraste que quase ninguém junta». Devolvi a frase ao texto.

⚠️ **O instrumento provou que ela SUMIU. Ele não prova que ela MERECIA FICAR.**
São duas perguntas, e só a primeira é dele:

    A · esta edição perdeu conteúdo?        → o retrato responde
    B · este conteúdo devia estar na tela?  → só o médico responde

A frase fala SOBRE O TEXTO («quase ninguém junta»), não sobre o paciente. Ela
saiu depois, por decisão do médico — e teria saído na primeira passada se eu não
tivesse tratado o alerta do instrumento como ordem de restauração.

── O QUE ISSO CUSTA QUANDO NÃO SE VÊ ───────────────────────────────────────

Um retrato verde vira argumento para manter tudo. «Nada se perdeu» é verdadeiro
e insuficiente: um módulo pode ficar ilegível sem perder uma palavra sequer —
foi exatamente o que aconteceu com as 44 instruções numa tela.

**O TESTE:** quando um instrumento acusar perda, perguntar se o que ele acusou
devia existir. Restaurar é o padrão, não a conclusão.

── E A MEDIÇÃO SEGUINTE MOSTROU A MESMA COISA EM OUTRA CAMADA ──────────────

Declarei que os outros 15 nós da IRA «já estavam no formato certo» tendo medido
a CONTAGEM de ações (2 a 4 por nó, boa) e não o TAMANHO delas. Medido depois:

    entry (o nó que eu reparti):  3.114 ch,  0 itens acima de 200 ch
    os outros 15 nós:            11.363 ch, 19 itens acima de 200, em 8 nós

O `acionar` tem 2 itens de 837 caracteres em média. Reparti 21% do texto do
módulo e chamei o resto de pronto. É R-68 outra vez — o valor medido tem de
variar onde o objeto varia, e contagem de itens não varia onde o tamanho varia.

---

## R-95 · NÃO ALTERAR O COMPORTAMENTO DE OUTRO MÓDULO — extração pura é permitida

Nasceu em 2026-08-18, no bloco das 6 emergências do renal, e é uma correção de
ESCOPO de regra, não uma exceção a ela. Exceção abre lista; escopo corrigido
continua sendo uma regra só.

**A REGRA ANTERIOR** dizia "não mexer em nenhum outro módulo nesta rodada", e
existia para impedir duas coisas: escopo rastejante e quebra colateral.

**O CASO.** A conduta da hipercalemia precisava das doses que viviam DENTRO de
`electrolyte-calculator-screen.tsx`. Cumprir a regra ao pé da letra obrigava a
COPIAR limiar e doses para a árvore do renal — e dose duplicada é o mecanismo
exato pelo qual dois módulos divergem com o tempo: um é atualizado, o outro não,
e ninguém percebe. A regra, aplicada literalmente, produzia o dano que ela
existe para evitar.

**A REGRA, COM O ESCOPO CERTO:**

> **Não alterar o COMPORTAMENTO de outro módulo.** Extração pura para biblioteca
> compartilhada é permitida quando evita duplicar um valor clínico, desde que
> nenhum valor mude e os testes do módulo de origem fiquem verdes. A duplicação
> de valor clínico é o dano que a regra existe para impedir; a extração é o
> oposto dele.

**COMO SE DISTINGUE NA PRÁTICA.** Extração pura: o valor sai do arquivo e volta
por importação, o teste do módulo de origem passa sem ser alterado, e o diff do
comportamento é vazio. Qualquer coisa além disso — renomear, reordenar,
"aproveitar e melhorar" — é mudança de comportamento e continua proibida.

⚠️ **`lib/hipercalemia.ts` é o primeiro bloco real da BIBLIOTECA COMPARTILHADA**,
não um arquivo do módulo renal. Quem for editá-lo edita conteúdo de dois
módulos ao mesmo tempo — e é essa a intenção.

---

## R-96 · "NÃO FAZER" É NÃO INICIAR — não é reter o que já está pronto

Nasceu em 2026-08-20, no fim do bloco das 6, e é irmã da R-95: as duas corrigem o
ESCOPO de uma regra em vez de abrir exceção para ela.

**O CASO.** Um documento de instruções trazia uma lista de "o que NÃO fazer nesta
rodada" — grade e escala dos traçados, registrar a biblioteca compartilhada,
promover a página de revisão. Ele foi escrito **antes** de uma mensagem que
mandava fazer exatamente essas quatro coisas, e chegou **depois** de elas estarem
prontas, testadas e com a geometria comprovadamente inalterada.

Lido ao pé da letra, o documento mandava reter trabalho concluído.

**A REGRA, COM O ESCOPO CERTO:**

> **Uma lista de "não fazer" significa NÃO INICIAR trabalho novo.** Ela não
> alcança trabalho já concluído e verificado. Trabalho pronto, testado e provado
> não fica retido: **reter cria divergência local, e divergência local é risco
> maior do que publicar.**

**POR QUE A DIVERGÊNCIA É O RISCO MAIOR.** O que fica só na máquina não é
neutro — some com o disco, conflita com o próximo commit, e some da memória de
quem o fez. É o mesmo modo de falha da especificação de 22 seções, que decidia o
rumo do módulo e viveu fora do controle de versão até ser resgatada por acaso.

⚠️ **O QUE ESTA REGRA NÃO AUTORIZA.** Ela não transforma "quase pronto" em
pronto. Vale para o que está **verificado**: teste verde, e — quando o trabalho
toca conteúdo já aprovado — prova de que o aprovado não mudou. Sem essa prova,
publicar é justamente o risco que a lista queria evitar.
