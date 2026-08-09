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
