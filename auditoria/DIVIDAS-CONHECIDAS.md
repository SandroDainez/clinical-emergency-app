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
