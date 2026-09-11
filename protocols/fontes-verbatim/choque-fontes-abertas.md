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

## F-34 · ✅ FECHADO — transcrito em 2026-09-10

Arabi YM et al. *ESICM clinical practice guideline on fluid therapy in adult
critically ill patients. Part 1: the choice of resuscitation fluids.*
Intensive Care Med. 2024;50(6):813–831. DOI 10.1007/s00134-024-07369-9.

Verbatim em `protocols/fontes-verbatim/esicm-2024-fluidos-parte1.md`.
Mapa das seis perguntas em `auditoria/MAPA-F34-FLUIDOS.md`.

⚠️ **O que ele fechou:** primeira escolha em adulto crítico em geral;
balanceado × salina por população; quando a albumina entra; o que evitar; as
exceções neurológicas.

⛔ **O que ele NÃO fechou:** volume, velocidade, bólus, meta hemodinâmica,
osmoterapia para hipertensão intracraniana (fora do escopo declarado) e qual
balanceado usar (lacuna de pesquisa declarada).

⚠️⚠️ **E não fechou o AVC.** O documento não menciona AVC em nenhuma das 19
páginas. As recs. 1, 7 e 11 entram por **analogia de população**, decisão do
autor, e nunca como evidência de AVC.

### A regra R-TCE saiu reforçada, com prova documental

| | adulto crítico em geral | TCE |
|---|---|---|
| albumina × cristaloide | **cristaloide** (rec. 1) | **salina isotônica** (rec. 4) |
| balanceado × salina | **balanceado** (rec. 7) | **salina isotônica** (rec. 9) |

No TCE as duas recomendações gerais **se invertem**. A regra continua valendo
para F-35a–d, e o texto operacional dela está preservado abaixo.

### ⚠️⚠️⚠️ REGRA R-TCE · TCE NÃO É PROXY DE AVC — permanece ativa

> ⛔ **Uma recomendação para traumatismo cranioencefálico não vale para AVC
> isquêmico só porque as duas populações são neurológicas.**

Três provas independentes, agora:

| fonte | população | conteúdo |
|---|---|---|
| F-32, rec. 43 (UGPS) | TCE com Glasgow ≤ 8 | PAM ≥ 80 mmHg |
| F-33, p. 5 | neurológico agudo **com hipertensão intracraniana** | PAM 90–100 mmHg |
| **F-34, recs. 4 e 9** | **TCE** | **inverte** a escolha de fluido das recs. 1 e 7 |

⚠️ A **D-137** mostrou a troca acontecendo **dentro da mesma fonte**.

**Aplicação:** recomendação escopada a TCE, sepse, trauma, queimado, cirúrgico,
cirrose, lesão renal ou qualquer outra população nomeada → transcrever com a
população declarada e marcar ⛔ **não transportável**. Só o que a fonte escopar
a *"adult critically ill patients" em geral* entra como candidato, e mesmo
assim a aplicabilidade continua pendente de revisão do autor.

⚠️ **O silêncio não é permissão.** Fonte que não nomeia população registra-se
como *"população não declarada"*, nunca como *"vale para todos"*.

---

## F-35 · Dose inicial e titulação de vasopressor — ⚠️ **UMA FAMÍLIA, NÃO UMA FONTE**

**Decisão do autor, 2026-09-10:** F-35 não é um slot único. É uma **família de
slots por mecanismo**, porque o C2 entra em **choque indiferenciado** e só
depois caracteriza.

`reconhecer choque → caracterizar mecanismo provável → tratamento específico`

| sub-slot | mecanismo | estado | candidata |
|---|---|---|---|
| **F-35a** | cardiogênico | ⛔ aberto · **fonte identificada**, PDF não obtido | **ACC 2025** (Sinha SS et al., JACC 85(16):1618–1641) como 1ª escolha; **AHA 2017** + **HFA-ESC 2020** como 2ª. Contrato completo em `f35a-cardiogenico-contrato.md` |
| **F-35b** | hipovolêmico / hemorrágico | ⛔ aberto | nenhuma |
| **F-35c** | obstrutivo | ⛔ aberto | nenhuma |
| **F-35d** | distributivo não séptico | ⛔ aberto | nenhuma |
| **—** | distributivo séptico | ⛔ **fora de escopo** | o app já tem SSC 2026 no módulo de sepse, e ⛔ não se transporta para cá |

⚠️⚠️ **Bloom 2023 foi REBAIXADO em 2026-09-10.** É uma **revisão em revista**,
e não documento de sociedade com processo de consenso declarado. ⛔ Não serve
como procedência de um slot que vai sustentar escolha de droga. Pode voltar
como leitura de apoio.

⚠️ E vale a razão original: nenhuma fonte de um mecanismo vira o F-35 inteiro.
Adotar a cardiogênica como única repetiria, ao contrário, o erro que a
proibição do séptico evita — um mecanismo governando todos.

⚠️⚠️⚠️ **O PORTÃO DA FAMÍLIA**, decidido pelo autor em 2026-09-10: cada
sub-slot só alimenta o Passo 5 quando **aquele mecanismo estiver razoavelmente
caracterizado**. Com mecanismo incerto, o C2 permanece no ramo de choque **não
classificado** e ⛔ **não escolhe droga «por padrão»**. Um default viraria
conduta, e conduta sem mecanismo é chute com aparência de protocolo.

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
