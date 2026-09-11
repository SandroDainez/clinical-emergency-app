# Choque no AVC — slots ainda ABERTOS

> Este arquivo **não contém verbatim**. Ele existe para dar endereço aos slots
> que já foram identificados e ainda **não têm texto transcrito**, no mesmo
> padrão de `seguranca-definicoes-operacionais.md` e
> `imagem-definicoes-operacionais.md`.
>
> ⛔ Enquanto um slot estiver aqui, **nada que ele sustentaria pode aparecer na
> tela** (§0.5). Isso vale para nome de fármaco, dose, faixa, meta e intervalo.

## Por que existem slots abertos no C2

O F-32 (ESICM 2025 · choque circulatório e monitorização hemodinâmica) declara
de si mesmo que **não é diretriz de tratamento farmacológico**. A leitura
verbatim confirmou: a diretriz manda corrigir hipoperfusão e **não diz com
quê**. Ver `auditoria/MAPA-C2-CHOQUE.md`, Passo 5.

O que falta, portanto, não é interpretação da fonte que temos. É **outra
fonte**.

---

## F-33 · ✅ FECHADO — transcrito em 2026-09-10

O PDF foi localizado em `~/Literatura Medica` e transcrito em
`protocols/fontes-verbatim/einstein-cptw386-choque.md`.

⚠️ **O que ele fechou:** reconhecimento, classificação por mecanismo,
vasopressor de escolha por subtipo, indicação e contra-indicação de
inotrópico, conduta de volume por subtipo, gatilho de linha arterial.

⛔ **O que ele NÃO fechou, e agora está provado:** dose inicial, titulação e
tipo de fluido fora da sepse. Ver F-34 e F-35 abaixo.

---

## F-34 · Escolha do fluido de ressuscitação

### O documento — identificado em 2026-09-10

> **Arabi YM, Belley-Cote E, Carsetti A, et al.** *European Society of Intensive
> Care Medicine clinical practice guideline on fluid therapy in adult critically
> ill patients. **Part 1: the choice of resuscitation fluids.***
> **Intensive Care Med. 2024;50(6):813–831.**
> **DOI 10.1007/s00134-024-07369-9** · publicado em 21/05/2024.

⚠️ **São TRÊS partes, e só a Parte 1 pertence a este slot:**

| parte | assunto | pertence ao F-34? |
|---|---|---|
| **Parte 1** (2024) | **escolha** do fluido de ressuscitação | ✅ **é este slot** |
| Parte 2 (2025) | **volume** dos fluidos de ressuscitação | ⛔ não — ver o escopo abaixo |
| Parte 3 (2025) | **retirada** de fluido na desescalada | ⛔ não |

⚠️ Correção de registro: eu havia escrito "ESICM 2025 · fluidoterapia parte 1".
A Parte 1 é de **2024**; 2025 são as Partes 2 e 3.

### Estado

| eixo | estado |
|---|---|
| **PDF em mãos** | ⛔ **NÃO** — varredura por nome, por conteúdo (Spotlight) e por DOI em `~/Literatura Medica`, `~/Downloads`, `~/Documents` e `~/Projetos`: ausente |
| **acesso aberto** | ⛔ não — Springer exige assinatura; **não está no PMC** (consultado pelo conversor de identificadores: *"Identifier not found in PMC"*) |
| **fidelidade ao PDF** | ⛔ **não conferida** — e não pode ser, sem o documento |
| **aplicabilidade ao AVC isquêmico** | ⏳ pendente, recomendação por recomendação |

⚠️⚠️ **Não se transcreve de resumo de página web.** Um resumo gerado por
terceiro não é verbatim, não tem página e não distingue força de certeza. Seria
exatamente o modo de falha que o projeto proíbe: número clínico de segunda mão.

### Por que este slot existe

O **F-32** se exime explicitamente, e aponta para cá:

> *"other aspects of the fluid prescription (choice of resuscitation fluids, or
> volume of resuscitation fluids) have been addressed in other recommendations
> of ESICM"* — F-32, escopo declarado

O **F-33** também não responde: o único fluido nomeado no CPTW386.1 inteiro é
*"preferencialmente com soro ringer lactato"*, e está **dentro da seção de
sepse**.

### As seis perguntas que este slot deve responder — e só elas

1. qual fluido pode ser recomendado como **primeira escolha** em adulto crítico;
2. se **cristaloide balanceado** é preferido a **SF 0,9%**, e **em qual população**;
3. **quando a albumina entra**;
4. quais fluidos **devem ser evitados**;
5. quais **exceções neurológicas** existem;
6. o que é **diretamente aplicável ao AVC** e o que permanece **contextual**.

### ⛔ O que este slot NÃO decide

- ⛔ **volume total** de ressuscitação — é a **Parte 2**, outro documento;
- ⛔ **velocidade** de infusão;
- ⛔ **bólus** e seu tamanho;
- ⛔ **meta hemodinâmica** de qualquer tipo.

⚠️ **Uma exceção, e só uma:** se a própria Parte 1 trouxer um desses itens
**para uma população aplicável**, ele é transcrito com a população declarada.
O critério é o que a fonte diz, e não o que este contrato previu.

### Ao transcrever — o que cada recomendação tem de carregar

| campo | por quê |
|---|---|
| **página** | E-30: a menor unidade auditável é a afirmação |
| **população** | é o que decide o transporte |
| **força** (strong / conditional / UGPS / no recommendation) | força não se deduz do verbo |
| **certeza** da evidência (GRADE) | separada da força |
| **acordo** do painel | o F-32 tinha recomendação com acordo FRACO, e isso mudou a leitura |

⚠️ *"We recommend"* **dentro do texto** de um *good practice statement* **não o
transforma** em recomendação GRADE forte. Foi o §D-4 do F-32, e vale aqui.

### ⚠️⚠️ A PERGUNTA 6 JÁ TEM METADE DA RESPOSTA — e ela vem da fonte-mãe

Antes de abrir a ESICM, a **F-05** (AHA/ASA 2026, §4.3 rec. 1, COR 1 · LOE
C-LD, p. e350) já manda corrigir:

> "In patients with AIS, hypotension and hypovolemia should be corrected to
> maintain systemic perfusion levels necessary to support organ function."

E o *Supportive Text* da **mesma recomendação** declara a lacuna, na mesma
página:

> "**No studies have addressed the treatment of low BP** in patients with
> stroke… **There are no data to guide volume and duration** of parenteral
> fluid delivery. **No studies have compared different isotonic fluids.**"

⚠️⚠️⚠️ **A última frase é decisiva para este slot.** A fonte do AVC afirma que
**nenhum estudo comparou fluidos isotônicos entre si no AVC**. Isso fixa o
teto do que o F-34 pode entregar:

| pergunta | o que já se sabe, antes da ESICM |
|---|---|
| há indicação de corrigir hipovolemia no AVC? | ✅ **sim** — COR 1 · LOE C-LD |
| a fonte do AVC diz **qual** fluido? | ⛔ **não**, e declara que ninguém comparou |
| a fonte do AVC diz **quanto** e **por quanto tempo**? | ⛔ **não**, e declara a ausência de dados |

➜ Consequência: qualquer preferência de fluido que o F-34 traga será
**recomendação de adulto crítico em geral aplicada ao AVC por analogia de
população**, e **nunca** evidência de AVC. Isso precisa ficar escrito na tela
do dia em que virar tela — é a diferença entre *"a diretriz do AVC manda"* e
*"a diretriz de terapia intensiva sugere, e o AVC não tem dado próprio"*.

⚠️ E é o motivo pelo qual o eixo **aplicabilidade ao AVC** deste slot já nasce
sabendo que **não vai fechar sozinho**: ele depende de decisão clínica do
autor, não de leitura de fonte.

### ⚠️⚠️⚠️ REGRA R-TCE · TCE NÃO É PROXY DE AVC

**Regra explícita deste slot**, a pedido do autor em 2026-09-10, porque o erro
**já aconteceu uma vez** (D-137).

> ⛔ **Uma recomendação para traumatismo cranioencefálico não vale para AVC
> isquêmico só porque as duas populações são neurológicas.**

O precedente que a justifica, registrado em dois documentos independentes:

| fonte | população | alvo |
|---|---|---|
| F-32, rec. 43 (UGPS) | TCE com Glasgow ≤ 8 | PAM ≥ 80 mmHg |
| F-33, p. 5 | neurológico agudo **com hipertensão intracraniana** | PAM 90–100 mmHg |

Duas fontes, populações vizinhas, **números diferentes**, e **nenhuma é AVC
isquêmico**. Se houvesse equivalência entre populações neurológicas, os dois
números teriam de concordar. Não concordam.

⚠️ E o erro do D-137 foi **mais sutil que este**: lá, "lesão cerebral grave"
substituiu "hipertensão intracraniana" **dentro da mesma fonte**. Se a troca
acontece entre duas linhas de uma página, acontece com muito mais facilidade
entre dois documentos.

**Aplicação prática no F-34:**

- recomendação de fluido escopada a **TCE** → transcrever com a população
  declarada e marcar ⛔ **não transportável**;
- o mesmo para **sepse**, **trauma**, **queimado**, **cirúrgico**, **DRC** e
  qualquer outra população nomeada;
- só o que a fonte escopar a **"adult critically ill patients" em geral** entra
  como candidato ao AVC — e mesmo assim a aplicabilidade clínica continua
  pendente de revisão do autor.

⚠️ **O silêncio não é permissão.** Se a fonte não nomear população, isso se
registra como *"população não declarada"*, e não como *"vale para todos"*.

---

## F-35 · Dose inicial e titulação de vasopressor — ⚠️ **UMA FAMÍLIA, NÃO UMA FONTE**

**Decisão do autor, 2026-09-10:** F-35 não é um slot único. É uma **família de
slots por mecanismo**, porque o C2 entra em **choque indiferenciado** e só
depois caracteriza.

`reconhecer choque → caracterizar mecanismo provável → tratamento específico`

| sub-slot | mecanismo | estado | candidata |
|---|---|---|---|
| **F-35a** | cardiogênico | ⛔ aberto | Bloom JE, Chan W, Kaye DM, Stub D. *State of Shock: Contemporary Vasopressor and Inotrope Use in Cardiogenic Shock.* J Am Heart Assoc. 2023;12:e029787 — **ref. 11 do CPTW386.1**. Não lida. |
| **F-35b** | hipovolêmico / hemorrágico | ⛔ aberto | nenhuma |
| **F-35c** | obstrutivo | ⛔ aberto | nenhuma |
| **F-35d** | distributivo não séptico | ⛔ aberto | nenhuma |
| **—** | distributivo séptico | ⛔ **fora de escopo** | o app já tem SSC 2026 no módulo de sepse, e ⛔ não se transporta para cá |

⚠️⚠️ **Bloom 2023 não vira o F-35 inteiro.** Ele pode ser excelente para
cardiogênico e **não responde** por hipovolêmico, obstrutivo ou distributivo.
Adotá-lo como fonte única repetiria, ao contrário, o erro que a proibição do
séptico evita: um mecanismo governando todos.

### Por que a família, e não uma fonte só

A busca por diretriz de sociedade para farmacologia de **choque
indiferenciado** não encontrou documento. As diretrizes são organizadas **por
tipo de choque**. ⚠️ Isto **não** é lacuna de busca: é como a literatura está
organizada, e a arquitetura do C2 já foi ajustada a isso.

⛔ Enquanto **qualquer** sub-slot do mecanismo em questão estiver aberto, o
Passo 5 **não vira tela para aquele mecanismo**. O app pode reconhecer a
ameaça, caracterizar o mecanismo e dizer que há indicação de vasopressor.
Não pode dizer quanto.

⚠️ Isso permite fechar **por mecanismo**, e não tudo de uma vez — que é
exatamente o que a arquitetura do Passo 2 torna possível.

### A prova de que o F-33 não fecha isto

Nem o F-32 nem o F-33 trazem dose inicial ou esquema de titulação de
noradrenalina. No F-33 isso foi **medido no documento**: em 8 páginas não há um
único mcg/kg/min de dose terapêutica.

⚠️⚠️ **E há uma armadilha registrada.** O CPTW386.1 **tem** uma escalada
(noradrenalina → vasopressina → adrenalina, com corticoide ao 2º vasopressor),
mas ela vive **dentro da seção «RECOMENDAÇÕES E METAS CLÍNICAS EM PACIENTES
COM SEPSE»**. ⛔ É algoritmo de sepse, está sob proibição explícita de
transporte, e **mesmo assim não traz dose**.

### ⚠️ O que este slot NÃO autoriza no lugar

- ⛔ não usar a faixa de linha arterial (0,3–0,5 mcg/kg/min) como se fosse
  faixa de titulação — ela é gatilho de monitorização;
- ⛔ não importar a dose que o módulo de sepse já tem;
- ⛔ não deduzir dose a partir da calculadora de preparo em
  `protocols/drogas_vasoativas.json`, que responde aritmética, não indicação.
