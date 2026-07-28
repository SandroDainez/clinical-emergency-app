# NOTAS-LOGICA.md

Registro de problemas de **lógica** encontrados durante o projeto UI 2.0.

Regra do plano: achou bug ou oportunidade de refactor lógico → **anota aqui e
segue**. Não corrige durante as fases visuais. Este arquivo existe para que
nada se perca e para que a correção seja uma decisão consciente, num momento
próprio, com teste próprio.

---

## L-001 · Hydration mismatch (React #418) em todas as 28 rotas de módulo

**Encontrado em:** Fase 0.2, ao criar o E2E de cobertura dos módulos.
**Gravidade:** média — não impede o uso, mas tem custo real (abaixo).
**Status:** ✅ **corrigido** em 2026-07-27 — ver "Correção" no fim desta entrada

### O que acontece

Abrir qualquer `/modulos/<id>` lança no console:

```
Minified React error #418
(Hydration failed because the server rendered HTML didn't match the client)
```

28 de 28 módulos. Reproduz em build de produção (`expo export -p web`).

### Causa

O HTML gerado estaticamente para a rota `/modulos/[id]` **contém a landing
page**, não a tela do módulo:

```bash
python3 -c "import re;print(re.sub(r'<[^>]+>','\n',open('dist/modulos/[id].html').read()))" | head
# 🩺 Clinical Emergency Suite / Apoio à decisão clínica... / Começar agora
```

Na renderização estática (build) não existe parâmetro de rota nem sessão, então
a árvore cai no ramo da landing. No cliente, com `id` e sessão disponíveis,
renderiza o módulo. São duas árvores diferentes para a mesma rota — o React
descarta o HTML do servidor e refaz tudo.

### Por que importa para a UI 2.0

1. **Todo módulo renderiza duas vezes** ao abrir. Qualquer medição de
   performance visual feita antes de resolver isto mede o dobro do trabalho.
2. Há um **flash da landing** antes do módulo aparecer — exatamente o tipo de
   coisa que o plano quer eliminar ("leve, limpo, respirando").
3. O E2E precisa tolerar este erro como linha de base (ver
   `e2e/modulos.spec.ts`), o que enfraquece a rede: um #418 **novo**, causado por
   uma tela migrada, não seria distinguível do antigo. Corrigir isto aperta a
   rede de segurança de todas as fases seguintes.

### Correção aplicada

O usuário autorizou corrigir. A solução foi enumerar os ids no build, com
`generateStaticParams()` em `app/modulos/[id].tsx`:

```ts
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return getClinicalModules().map((m) => ({ id: m.id }));
}
```

Cada módulo passou a ter o seu próprio HTML (`dist/modulos/ritmos-acls.html`,
etc.) já com o conteúdo certo, em vez de um único `[id].html` genérico. O
primeiro render do cliente encontra exatamente o mesmo HTML — sem mismatch, sem
render duplo e sem flash da landing.

**Não afeta iOS/Android:** `generateStaticParams` só é chamado pelo exportador
web; em nativo não existe pré-render.

**Duas tentativas anteriores falharam** e vale registrar por quê:

1. Trocar o `<Redirect>` por um esqueleto com render em dois passos. Não
   resolveu: o problema não era o Redirect, e sim a rota não ter id no build.
2. Procurar a causa no `<Redirect>` isoladamente. A pista que faltava estava
   à vista desde o começo — os botões "Começar agora" e "Entrar na plataforma"
   apareciam junto com os do módulo. A landing fica montada sob todo módulo por
   `unstable_settings = { anchor: "index" }` em `app/_layout.tsx`, e isso é
   legítimo; não era ali o defeito.

**Verificação:** 0 erros de hidratação nos módulos sondados; a tolerância que
`e2e/modulos.spec.ts` mantinha foi REMOVIDA, e os 38 testes seguem verdes. A
rede de segurança voltou a ser rígida: qualquer erro de hidratação agora falha.

---

## L-002 · `tr("literal")` fora do render em `acls/presentation.ts` e `acls/debrief.ts`

**Encontrado em:** revisão do i18n (antes da Fase 0).
**Gravidade:** baixa — hoje funciona.
**Status:** ⬜ aberto — vigiar, não mexer sem sintoma

155 chamadas `tr("texto literal")` sem receber o locale do render. É o mesmo
padrão que já causou congelamento de idioma no cabeçalho do PCR e que foi
corrigido nos componentes com `useTr()`. Estes arquivos são `.ts` fora de
componente e não podem usar hook.

Hoje funciona: o ACLS está comprovadamente bilíngue em produção. Mas é frágil —
depende de o minificador não dobrar a chamada. Se algum dia um texto do ACLS
travar em português com o app em espanhol, começar por aqui.

Corrigir exigiria propagar o locale por 155 pontos. Sem sintoma, o risco da
mudança é maior que o do problema.

---

## L-003 · Despacho de módulo por cadeia de 27 comparações

**Encontrado em:** Fase 0.1 (mapeamento).
**Gravidade:** baixa — funciona; é risco de manutenção.
**Status:** ⬜ aberto — anotado como observação de arquitetura

`components/clinical-app.tsx` decide qual tela renderizar com 27
`protocolId === "..."` em sequência, e só `pcr_adulto` cai no fallback.

Um mapa `id → componente` seria mais direto e removeria a chance de inserir uma
comparação na ordem errada. **Mas é lógica de roteamento**, e a migração visual
vai passar por este arquivo em toda fase — mexer nele agora misturaria refactor
com migração, que é justamente o que o plano proíbe.

Sugestão: fazer depois da Fase 7, quando todos os módulos já estiverem migrados
e o arquivo estiver estável.

---

## L-004 · Seta de voltar do cabeçalho do expo-router tem 30×30 px

**Encontrado em:** Fase 2, no teste de alvo de toque do showcase.
**Gravidade:** baixa-média — usabilidade, não correção clínica.
**Status:** ⬜ aberto — resolve sozinho na Fase 4

O cabeçalho de navegação gerado pelo expo-router (aquele que mostra "modulos" ou
"dev/ui-v2" no topo) traz uma seta de voltar de **30×30 px**, abaixo do mínimo de
44 exigido pelo plano. Não é componente nosso: vem do react-navigation.

Todos os 16 componentes da UI 2.0 passam no mínimo — o teste
`e2e/ui-v2-showcase.spec.ts` verifica isso a cada execução, escopado ao conteúdo
do showcase justamente para não confundir o defeito do framework com os nossos.

Some quando o `Header` compacto substituir esse cabeçalho na Fase 4. Se por
algum motivo ele permanecer, dá para aumentar o alvo com `headerBackTitleStyle` /
`headerLeft` customizado nas opções do Stack.

---

## L-005 · O mapa da Fase 0 identificou o shell errado

**Encontrado em:** Fase 6, ao preparar a migração de bradicardia/taquicardia.
**Gravidade:** alta enquanto durou — era informação errada guiando o projeto.
**Status:** ✅ corrigido em MAPA-APP.md §4

`MAPA-APP.md` afirmava que as telas `*-flow-screen.tsx` delegavam para
`module-flow-shell.tsx`, e que mexer nele afetaria 17 módulos.

O shell real é `acls-decision-flow-screen.tsx`, usado por **19 módulos**.
`module-flow-shell.tsx` é usado por **2**.

### Como o erro entrou

Na Fase 0 eu li que as telas de fluxo tinham 15 linhas e delegavam a um shell, e
associei ao `module-flow-shell` pelo nome — sem abrir uma delas para confirmar de
onde vinha o import. O nome do arquivo era plausível demais.

### Por que importou

As Fases 3 a 6 foram desenhadas em cima dessa informação, inclusive a regra "não
usar módulo `*-flow-screen` como piloto". A regra estava certa por acaso, mas
pelo motivo errado — e a Fase 6 quase tratou o shell de 19 módulos como se fosse
"a quarta tela" de uma migração incremental.

### Lição aplicada

Afirmação de arquitetura no mapa precisa vir de import verificado, não de nome de
arquivo. As demais afirmações de MAPA-APP.md §4 foram reconferidas contra os
imports reais.

---

## L-006 · Cue `rearrest` fora do catálogo canônico de áudio

**Encontrado em:** correção dos defeitos do ACLS reportados pelo usuário.
**Gravidade:** baixa · **Status:** ⬜ aberto — **pré-existente, não introduzido aqui**

`npm run validate:acls-audio` acusa, duas vezes:

```
Cue fora do catálogo canônico em WEB_AUDIO_CUES: rearrest
```

`components/web-audio-cues.ts` registra a cue `rearrest`, que não existe em
`ACLS_CANONICAL_AUDIO_MANIFEST`. Já falhava antes desta rodada — confirmado ao
rodar o validador na primeira vez, junto com os erros que eu mesmo havia
acabado de criar.

Não corrigi junto de propósito: misturar um achado pré-existente com a correção
de um defeito reportado esconde qual mudança causou o quê. Ou a cue entra no
catálogo, ou sai do registro — decisão de quem conhece a intenção do `rearrest`.

---

## L-007 · Auditoria do fluxo ACLS: sem divergência no ramo chocável

**Pedido do usuário:** "sincroniza para dar a segunda dose no tempo certo de
acordo com o ACLS · verifique todo o fluxo se está correto".
**Resultado:** ✅ **conforme** — nada foi alterado no reducer.

`npm run audit:acls` dirige o engine por 9 choques de FV refratária, confirmando
toda droga oferecida, e registra a linha do tempo real:

| min | choques | droga | epi acum. | antiarr acum. |
|---|---|---|---|---|
| 2,08 | 2 | epinefrina | 0 | 0 |
| 4,17 | 3 | antiarrítmico 1ª | 1 | 0 |
| 5,50 | 3 | epinefrina | 1 | 1 |
| 8,33 | 5 | antiarrítmico 2ª | 2 | 1 |
| 8,67 | 5 | epinefrina | 2 | 1 |
| 11,75 | 6 | epinefrina | 3 | 2 |
| 14,92 | 8 | epinefrina | 4 | 2 |

Confere com o algoritmo de PCR no adulto:

- epinefrina só após **2 choques** ✓
- intervalos de epinefrina entre **3 e 5 min** nas 5 doses ✓
- 1ª dose de antiarrítmico após o **3º choque** ✓
- 2ª dose após o **5º choque** — em ciclo posterior, não consecutivo ✓
- **máximo de 2 doses** de antiarrítmico respeitado ✓

### Sobre "a 2ª dose não apareceu"

Explicado, e não é defeito: a 2ª dose entra **depois do 5º choque**. Num teste
que pare antes disso, ela corretamente não aparece.

### O que esta auditoria NÃO cobre

Só o ramo **chocável refratário**. Ficam sem auditoria automatizada: o ramo
não chocável (AESP/assistolia), o ROSC e o encerramento. Também não reproduzi o
relato de "pedir confirmação de dose já confirmada" — neste cenário, com toda
droga confirmada assim que oferecida, a duplicidade não ocorreu.

⚠️ Números de dose e a regra de 2 doses são estáveis entre as edições recentes
do ACLS, mas qualquer divergência futura apontada por este script deve ser
conferida contra o texto vigente antes de virar mudança de conduta.
