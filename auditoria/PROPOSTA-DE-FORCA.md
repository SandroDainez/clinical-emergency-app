# PROPOSTA DE FORÇA — os 13 nós de conduta ainda sem procedência

**Módulo:** injúria renal aguda · **Data:** 2026-08-20 · **Estado:** proposta, não formulário.

Cada nó abaixo vem com a força que EU proponho, a fonte, o grau quando houver, e a
razão. Você confirma ou corrige. **Onde não há base, está escrito "sem proposta,
precisa do autor"** — preencher por suposição é o defeito que a lista existe para
evitar.

---

## ⚠️ ANTES DE TUDO: a KDIGO 2012 NÃO está no repositório

Você mandou conferir na KDIGO 2012 quais destas afirmações têm recomendação
**graduada**, apontando duas candidatas fortes — dopamina em dose renal e diurético
para tratar a IRA — mais "suspender nefrotóxico" e "revisar doses".

**Não achei. Nenhuma das quatro.** E a razão é anterior à busca:

| medição | resultado |
|---|---|
| `find -iname "*kdigo*"` (fora de node_modules) | **nada** — nenhum PDF, nenhum texto, nenhuma transcrição |
| `grep -rl "KDIGO"` | 27 arquivos, **todos escritos por nós** (árvore, libs, i18n, travas, auditoria) |
| `grep` por grau perto de "kdigo" (`1A\|1B\|2A\|2B\|2C\|Not Graded`) | **zero ocorrências no repositório inteiro** |

O que existe é a **referência bibliográfica** em `protocols/guidelines_metadata.json`
(título, ano, URL, citação) — não o texto da diretriz. E o campo
`key_recommendations_covered` daquela entrada **fui eu que escrevi, em 2026-08-20, a
partir do conteúdo do módulo**. Usá-lo como prova do que a KDIGO recomenda seria
circular: é o mesmo defeito de "procedência herdada por vizinhança" que já corrigimos
duas vezes (o rodapé KDIGO sob doses de hipercalemia, e o 126 mg/dL).

**Portanto: não presumo grau para nenhuma delas.** As quatro afirmações continuam
clinicamente corretas e permanecem na tela — o que falta é a PROCEDÊNCIA, e ela
depende de alguém abrir a KDIGO 2012. Isso é seu, ou é uma fonte a trazer para o
repositório.

---

## O QUE JÁ TEM BASE NO REPOSITÓRIO

A única fonte renal com precedente aceito por você é a **KDIGO 2012 como `definicao`**
— já em uso no nó do estadiamento (`ira-decision-tree.ts:1184`), com `versao: "2012"`
e sem classe, porque definição não se gradua.

### 1 · `fazer_agora` — "Creatinina subiu ou parou de urinar"
- **Proposta:** `definicao` · KDIGO 2012 · versão **2012** · sem classe
- **Razão:** os dois primeiros itens ("meça a diurese em mL/kg/h", "anote a creatinina
  COM A HORA") não recomendam conduta — eles **operacionalizam os dois eixos da
  definição**. É o mesmo tipo de afirmação do nó do estadiamento.
- **⚠️ Ressalva honesta:** os outros três itens do nó (suspender nefrotóxico, tratar a
  hipercalemia, pedir a bateria de exames) **são conduta e não são definição**. Se você
  aceitar a força única, ela cobre o nó por maioria — o que é frouxo. A alternativa
  limpa é **partir o nó**: os dois eixos como `definicao`, o resto como conduta com
  fonte própria. **Recomendo partir.**

### 2 · `cronico_agudizado` — "Crônico agudizado — três coisas mudam"
- **Proposta:** `definicao` · KDIGO 2012 · versão **2012** · sem classe
- **Razão:** "ler o número contra a BASE DELE" e "somar o eixo da DIURESE" são a
  definição aplicada a quem já tem creatinina alta — não recomendação.
- **⚠️ Ressalva:** "volume mais cauteloso", "telefone para o nefrologista" e "procure o
  gatilho" são conduta. Mesma escolha do nó 1.

### 3 · `sem_base` — "Sem a creatinina de base"
- **Proposta:** `definicao` · KDIGO 2012 · versão **2012** · sem classe
- **Razão:** o título do nó afirma que **"a diretriz autoriza seguir"** — isto é uma
  afirmação SOBRE a diretriz, e hoje ela está na tela sem procedência nenhuma. Ou ela
  ganha a fonte, ou a frase sai.
- **⚠️ Isto é o mais urgente da lista:** é o único nó que **cita a diretriz na cara do
  usuário** sem que nada no repositório sustente a citação.

---

## SEM PROPOSTA, PRECISA DO AUTOR

Para os dez nós abaixo **não existe no repositório nenhuma fonte que sustente a
afirmação**. Digo o que a força PARECE ser, para você julgar rápido — mas sem fonte
não há proposta, e não preencho.

| nó | o que ele afirma | força que aparenta | o que falta |
|---|---|---|---|
| `nao_faca` | a família das armadilhas (volume pela creatinina · diurético não trata o rim · dopamina em dose renal) | recomendação formal — **se** a KDIGO graduar | **a KDIGO 2012 no repositório.** É UMA decisão, não três: as três constantes saem de uma fonte só (`lib/injuria-renal-aguda.ts`) |
| `pre_renal` | prova de volume em alíquotas, com reavaliação entre elas | prática aceita | qual documento. "Fluid challenge" é universal e sem dono; se for consenso, qual |
| `renal_conduta` | remover a exposição; sedimento; rabdomiólise com hidratação vigorosa | mista | **o alvo de débito na rabdomiólise não tem número na tela** — se ganhar número, precisa de fonte com ele |
| `obstrucao_conduta` | sonda antes de investigar; repor e não restringir na pós-obstrutiva | prática aceita | qual documento (urologia? KDIGO?) |
| `retencao` | sonda de alívio; medir o volume drenado | prática aceita | idem |
| `trata_acidose` | tratar a causa; acidose refratária entra na conversa da diálise | recomendação formal — **se** graduada | KDIGO 2012 (indicação de TRS) |
| `trata_uremia` | acionar nefrologia; pericardite e sangramento urêmicos mudam a urgência | recomendação formal — **se** graduada | idem |
| `drc_sem_agudizacao` | não dar volume pela creatinina; revisar doses; suspender nefrotóxico | recomendação formal — **se** graduada | idem `nao_faca` — mesma família |
| `indeterminado` | presumir base normal; alíquotas menores; procurar exames anteriores | prática aceita / nossa | pode ser **operacionalização nossa** declarada, como a janela das 6 h da insulina. Sua decisão |
| `k_ecg_normal` | **ECG normal não exclui hipercalemia** | prática aceita | a UKKA 2023 está no metadata e trata do assunto, mas **o texto dela também não está no repositório** — não cito o que não abri |

---

## O QUE EU RECOMENDO DECIDIR PRIMEIRO

1. **`sem_base`** — é o único que cita a diretriz na tela sem lastro. Ou fonte, ou a
   frase muda hoje.
2. **A família das armadilhas** — uma decisão só, cobrindo `nao_faca` e
   `drc_sem_agudizacao`. Depende de abrir a KDIGO 2012.
3. **Partir ou não `fazer_agora` e `cronico_agudizado`** — é decisão de desenho, não
   clínica, e destrava três nós de uma vez.
