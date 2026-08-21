# Fase 1 — auditoria clínica módulo a módulo

**O que esta auditoria mudou, para quem chegar depois — inclusive nós mesmos
daqui a seis meses.**

Seis módulos abertos um a um, com um método que foi sendo escrito enquanto era
usado. Cada regra do `METODO.md` nasceu de um erro cometido aqui — nenhuma é
teórica.

---

## O placar

| | |
|---|---|
| Commits | **49** |
| Módulos fechados | **6** — Vasoativas · Ventilação · ISR · Sedoanalgesia · Eletrólitos · Calculadoras |
| Mudanças de recomendação ou de dose | **13** |
| Travas no `test:all` | 7 → **34** |
| Regras de método | **29** |
| Dívidas registradas | **22** |
| Classes de defeito descartadas com varredura limpa | **2** |

---

## Os achados que estavam EM PRODUÇÃO

Não são hipóteses. Estavam no app, no ar, alcançáveis por quem o usasse.

### 1. Dopamina com a ampola americana — subdose de 8×
O app calculava sobre 200/400 mg (40 mg/mL, apresentação dos EUA). A ampola
brasileira é **5 mg/mL × 10 mL = 50 mg**. Um vasopressor com fator 8 de erro. E o
próprio app já trazia `"Dopamina — 50 mg / 10 mL"` correto na Farmacologia do
ACLS — o número certo existia ao lado do errado.
**Empurrado isolado, no mesmo dia.**

### 2. Osmolaridade com o divisor do BUN — ⚠️ CORRIGIDO EM 14/ago: NÃO ERA O QUE ESTE ITEM DIZIA
O motor usava `ureia/2,8` (divisor do nitrogênio ureico) sobre um campo que pede
**ureia**, e comparava a osmolaridade TOTAL contra o limiar da EFETIVA. Os dois
erros inflam, e a direção importa: um paciente com CAD rotulado como EHH recebe
insulina em dose menor e hidratação mais prolongada enquanto a cetoacidose corre.

**A explicação correta já existia no app, em QUATRO lugares** — inclusive na
árvore do próprio módulo.

> **⚠️ CORREÇÃO DE REGISTRO (14/ago).** Este item foi escrito como *correção de
> cálculo*, e **não é**. Verificado por execução na varredura da D-22:
> `dka-hhs-engine.ts` é **código morto desde 07/jun** — a tela nunca o executou.
> O cálculo errado **nunca esteve no ar**, e o cálculo corrigido também não
> chegou: foi escrito no arquivo morto.
>
> **O que a Fase 1 de fato entregou ao usuário aqui foram os dois AVISOS DE
> TEXTO** — "usar a EFETIVA, não a total" e "ureia ≠ BUN, o divisor é 6" —, que
> estão na árvore viva e são bons. **A tela não calcula osmolaridade nenhuma**:
> ela escreve a fórmula para o médico aplicar (decisão registrada como PD-3).
>
> Isto não anula o item — anula a palavra "erro em produção". Fica como
> **aviso entregue**, não como cálculo consertado. O registro precisa dizer o
> que entregou (R-13, e agora R-32).

### 3. Naloxona com uma dose só onde precisam existir duas
Os seis sítios traziam `0,4–2 mg`. No contexto **iatrogênico** — opioide dado
pela própria equipe — é dose de superdose de rua: reverte tudo de uma vez e
dispara surto catecolaminérgico (a bula lista edema pulmonar, parada cardíaca,
FV, convulsão). Na overdose por opioide de **alta afinidade**, é dose baixa
demais.

**O erro era bidirecional**, e o que separa os regimes não é a gravidade — é a
**procedência do opioide**.

### 4. NIHSS indicando reperfusão a partir de um número que não a decide
A faixa 1–4 dizia *"Trombólise + DAPT se elegível"*, somando o que a evidência
separa (CHANCE/POINT estudaram AVC menor **sem** trombólise) e contradizendo o
próprio app, que registra em quatro lugares que antiagregante é proibido nas
primeiras 24 h pós-trombólise.

### 5. Três implementações de peso predito discordando no sexo ausente
Uma assumia homem, outra mulher, e `"m"` significava *Mulher* num módulo e
*Masculino* noutro — com o valor atravessando módulos pelo contexto do paciente.
**Auditoria módulo a módulo nunca pegaria isso:** cada implementação, lida
sozinha, estava correta.

### 6. Prognóstico com números que não eram da fonte citada
HEART exibia `~12%` e `~65%` de MACE citando Backus 2013, que dá **16,6%** e
**50,1%**. SOFA exibia mortalidade por faixa citando Singer 2016, que **não
publica faixa nenhuma** — e o número que existe (Ferreira 2001) depende da
TENDÊNCIA em 48 h, não do valor de hoje: o mesmo SOFA 10 vale ≤6% se está caindo
e 60% se não está.

### 7. Antídoto sem a consequência da duração curta
`"A meia-vida da naloxona é MENOR que a da maioria dos opioides"` existia em
**um** lugar e faltava em cinco. O flumazenil não tinha a ressedação em lugar
nenhum — nem no módulo de Intoxicações — e sua apresentação nacional não estava
declarada.

### 8. Anafilaxia mandando cronometrar sem cronômetro
Doze frases *"Reavaliar em 5 minutos"* e nenhum relógio. **O único achado da
auditoria que não é sobre o que o app DIZ, e sim sobre o que ele deixa de
FAZER** — capacidade ausente com infraestrutura pronta.

### 9. Dezenove frases clínicas que o usuário em espanhol lê em português
Frase montada em runtime nunca vira chave de dicionário. Entre elas: *"Alta ainda
não segura"*, *"Trombólise não liberada"*, *"desmame contraindicado"* — e
**"Ureia — não BUN"**, o rótulo escrito nesta mesma auditoria para evitar o erro
do item 2. **O aviso mais importante daquele bloco era invisível em metade dos
idiomas do app.**

---

## O que SAIU do app

- Indicação de conduta em telas de escore: `"IOT indicada"` (Glasgow),
  `"aumentar sedação"` (RASS), `"Trombólise + DAPT"` (NIHSS), `"UTI se ≥ 4"`
  (CURB-65), `"coronariografia precoce"` (HEART).
- Uma tabela PEEP inexistente que o EAP mandava usar.
- Uma citação **invertida** do ART — o braço-controle era a tabela low-PEEP, e o
  app a citava para justificar ir **abaixo** dela.
- Doses derivadas de premissa errada (adrenalina 1:1.000 × 1:10.000).
- `"evitar contraste"` numa tela que não sabe se há exame indicado.

## O que ENTROU

- Fontes únicas: `lib/doses-isr.ts`, `lib/alvos-tce.ts`, `lib/tabela-peep.ts`,
  `lib/peso-estimado.ts`, `lib/dobutamina.ts`, `avc/nihss.ts`.
- Cronômetro de 5 min entre doses IM de adrenalina na Anafilaxia.
- Regime da dobutamina com dose (bula) e indicação (SSC 2026) **separadas**, e a
  força da recomendação escrita como FRACA.
- 27 travas novas, cada uma com mutação executada que a derruba.
- `INDICE-DE-TRAVAS.md` e `ARQUITETURA.md`, gerados ou escritos porque **duas
  vezes começou-se a construir um verificador que já existia**.

---

## As duas varreduras que voltaram LIMPAS

Contam tanto quanto os achados: são o que permite **parar de olhar**.

| | |
|---|---|
| Faixas numéricas invertidas | **1633 conferidas, 343 arquivos — zero** |
| Alcançabilidade do grafo | **19 árvores — zero órfãos, ciclos ou becos** |

Sem elas, *"acho que não temos esse problema"* continuaria sendo palpite, e
palpite precisa ser reexaminado a cada revisão.

---

## O que este trabalho ensinou sobre si mesmo

As regras que mais mudaram a conduta não são sobre medicina:

- **R-18** — documentação correta num módulo não protege o código de outro. O
  conhecimento estava no repositório e não alcançava quem precisava dele.
- **R-22** — existe verificação que não depende de fonte externa: o app conferido
  contra si mesmo pega erro em número que ninguém conferiu ainda.
- **R-26** — a distância entre a regra clínica e a estrutura que a hospeda. Quem
  conhece a medicina não sabe que o ACLS é um reducer; quem conhece o código não
  sabe que capnografia precisa de ventilação para existir como sinal.
- **R-28** — custo invisível não é descuido, é ausência de sinal. Quando um
  defeito reaparece depois de documentado, a pergunta não é *"por que ninguém
  viu?"*, é *"o que mediria isso?"*.
- **R-29** — levantamento por leitura subconta; a trava acerta. Três vezes, e
  sempre para menos.

E a definição de **"módulo fechado"** mudou no meio do caminho: não é "achados
tratados", é **achados tratados E travas que proíbem a regressão**. A Ventilação
já tinha sido declarada fechada quando entregou duas ocorrências de um alvo
aposentado.

---

## O que fica aberto

| Dívida | O que falta | Espera |
|---|---|---|
| **D-16** | cinco módulos sem cronômetro | decisão de escopo |
| **D-18** | TC de rotina no TCE | fonte lida |
| **D-20** | cinco valores interpolados com conteúdo clínico | bloco próprio |
| **D-21** | adrenalina e milrinona na sepse | auditoria da Sepse |
| **#7** | faixas do APACHE II | a figura do Knaus 1985 |
| — | 35 frases compostas restantes | por módulo |
| — | 53 linhas de dose do `sedation-engine` | classificar antes de propor |
| — | 19 travas legadas sem `PROMETE`/`NÃO PROMETE` | incremental |

**Nada aqui é urgente e nada aqui está esquecido** — cada item tem trava ou
registro que o mantém visível.

---

# O MÓDULO RENAL FECHADO — e por que ele é o argumento para os outros trinta

**Fechado pelo autor em 2026-08-21.** Primeiro módulo do app com **procedência
declarada de ponta a ponta**.

## O que ele tem

- **Toda conduta com força e fonte.** 17 de 18 condutas declaradas — a que falta é
  pendência de FONTE, não de força (D-65), e está nomeada.
- **Seis recomendações da KDIGO 2012 transcritas VERBATIM** em
  `protocols/fontes-verbatim/kdigo-2012-aki.md` — 3.1.1, 3.4.1, 3.4.2, 3.5.1, 5.1.1,
  5.1.2 —, **conferidas contra o primário pelo autor, médico**, na página 12 do PDF.
  Antes disso o repositório tinha a *referência bibliográfica* e nada mais:
  **referência não é fonte; texto é.**
- **Três ausências REGISTRADAS**, que é o que a maioria dos apps não faz:
  nefrotóxico sem recomendação geral · desafio volêmico sem recomendação nenhuma ·
  **rabdomiólise explicitamente FORA DO ESCOPO**, com o verbatim da metodologia. Esta
  última existe para impedir que alguém "ache" uma justificativa KDIGO daqui a um ano
  — o módulo inteiro cita KDIGO, e a vizinhança convence.
- **Uma recomendação 1A que estava na tela SEM SELO NENHUM**, ao lado de adjuvantes
  2C. O usuário sem experiência não tinha como distinguir as duas — que era o defeito
  que originou o campo de força.

## As quatro pendências, todas nomeadas e com alvo

| # | o que falta | alvo |
|---|---|---|
| D-65 | atribuição da basal desconhecida | KDIGO 2012, **Tabelas 8 e 9** |
| D-67 | a citação do "ECG normal não exclui" | **UKKA 2023**, frase sobre sensibilidade |
| D-69 | selo em nó de decisão | **bloqueante da fase do motor**, 2 instâncias nomeadas |
| D-70 | "vanco + pip-tazo somam nefrotoxicidade" | **a definir** — evidência sem fonte |

**Nenhuma escondida.** Duas aparecem na própria tela do app.

## O que o módulo ensinou aos instrumentos

Cinco travas nasceram ou mudaram aqui, e nenhuma delas é sobre rim:

1. **Força por AFIRMAÇÃO, não por tela** — uma tela pode afirmar duas coisas com
   forças diferentes, e um selo só faz a forte carimbar a fraca ou a fraca rebaixar a
   forte. **As duas mentem, para lados opostos.**
2. **"Not Graded" é grau literal**, não grau ausente — rebaixá-lo apaga que a diretriz
   faz a afirmação.
3. **A ressalva anda colada à afirmação** — separar cria falso absoluto. Vale para a
   exceção do diurético (3.4.2) e para o choque hemorrágico (3.1.1).
4. **Caber numa frase geral não é ser nomeado** — foi o que impediu encaixar
   pericardite na 5.1.1 e depois na 5.1.2.
5. **Repetição de linha recolhida reprova** — e a prova não foi teórica: a tabela de
   estadiamento vivia em dois nós e **as cópias já tinham divergido**, na nota da
   calculadora, dentro do mesmo módulo, sem ninguém notar.

⚠️ **O item 5 converteu o R-95 de previsão em observação.** O argumento era "a
duplicata VAI divergir". A medição mostrou: **ela já estava divergindo.**

## O que decide se o formato vale para os outros trinta

**Não é esta página.** É o **percurso das seis emergências no celular** — se o médico
com o paciente na frente atravessa o fluxo sem tropeçar no que a auditoria acrescentou.
Selo, porquê e procedência custam tela; se o custo aparecer no meio de uma parada, o
formato muda antes de ser replicado.
