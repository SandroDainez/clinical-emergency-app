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

**Corolário sobre o custo.** Os sete itens acima são checagem de escrita, não de
execução: custam minutos. As 16 correções custaram rodadas inteiras de mutação,
e três delas só apareceram porque alguém releu a saída do comando. **Escrever
com a lista na mão é mais barato que descobrir por mutação** — e a mutação
continua obrigatória, porque a lista nunca vai estar completa.

---

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
