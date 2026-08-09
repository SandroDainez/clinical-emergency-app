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

## D-3 · Oito módulos sem nenhuma diretriz citada no conteúdo

**Estado:** aberta · criada em 2026-08 · fecha módulo a módulo, na Fase 1

**Os oito:** abdome agudo · dispneia · intoxicações exógenas · politrauma ·
RSI · choque · TCE · ventilação mecânica.

**O que falta.** O inventário de anos por árvore (`npm run mapa:desatualizacao`)
não encontra, no conteúdo desses módulos, nenhum ano ligado a uma sociedade ou à
palavra "diretriz". Os outros onze citam: convulsões 2016 · anafilaxia 2020 ·
eclâmpsia 2020 · EAP 2021 · CAD 2024 · bradi/taqui 2025 · coronárias 2025 ·
AVC/sepse/TEP 2026.

**Por que isso é dívida e não detalhe.** Estes oito são **invisíveis aos dois
sinais** que a auditoria estrutural construiu. A varredura de desatualização só
enxerga o nó que se denuncia — aquele cuja evidência diz que a ramificação
envelheceu. Módulo que nunca citou fonte não tem o que envelhecer no texto: ele
não aparece na lista de suspeitos nem no inventário de anos. Ausência de sinal
aqui não é sinal de saúde.

E num produto de ensino com plano pago, conteúdo clínico sem rastreabilidade de
fonte é problema **por si só** — independente de estar certo. O leitor não tem
como conferir, e o app não tem como saber quando revisar.

**Como fechar.** Cada um destes oito, ao ser auditado na Fase 1, **termina com a
diretriz e o ano explicitados no conteúdo** — não só no `guidelines_metadata`.
A dívida sai desta lista quando os oito estiverem cobertos, um a um.


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
