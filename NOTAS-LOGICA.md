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
