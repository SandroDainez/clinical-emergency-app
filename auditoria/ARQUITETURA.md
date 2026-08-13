# Arquitetura do conteúdo clínico — o que quem escreve trava precisa saber

Este documento existe por um motivo específico: **duas travas erraram por
desconhecer estrutura que não estava escrita em lugar nenhum.** Não é
documentação de API — é a lista das armadilhas de forma que fazem um verificador
acusar inocente ou silenciar culpado.

---

## 1 · Existem DOIS formatos de árvore de decisão

E a diferença não está declarada em nenhum campo. Descobre-se pelo desenho.

### Passo a passo
Entrada → nós de **`action`** que mandam fazer → decisões → desfecho.
A conduta mora em `action.actions[]`.
*Exemplos:* ISR, Sedoanalgesia, Eletrólitos, CAD/EHH.

### Triagem e desfecho
Entrada → perguntas que **identificam a síndrome** → terminal.
A conduta mora **no terminal**, não antes dele.
*Exemplos:* Dispneia (1 nó de ação em toda a árvore), Choque (2).

**Consequência:** uma árvore de triagem com poucos ou nenhum nó `action` **não
está incompleta** — está em outro formato. Uma trava que exige conduta em nó de
ação acusa o desenho inteiro. Foram 26 acusações falsas de uma vez.

---

## 2 · A conduta mora em TRÊS lugares, conforme o formato

| Onde | Campo | Quando |
|---|---|---|
| Nó de ação | `action.actions[]` | árvore passo a passo |
| Terminal | `transition.exitCriteria[]` | árvore de triagem-e-desfecho |
| **Outro módulo** | `transition.targets[]` | o fluxo identifica e ENCAMINHA |

O terceiro é o mais fácil de esquecer: um desfecho com `targets` preenchido
**não trata de propósito** — o tratamento está no módulo de destino, e cobrar
conduta ali é cobrar duas vezes.

> **Regra:** toda trava que examina *"o que a árvore faz"* tem de olhar os três.
> Olhar só o primeiro foi o defeito; olhar os dois primeiros ainda deixava 17
> falsos positivos.

---

## 3 · Roteamento dinâmico declara os destinos possíveis

`ProximoNo` é `string` **ou** `Roteamento { possiveis: string[], escolher: fn }`.

O `escolher` é função e não dá para seguir estaticamente. Por isso o `possiveis`
existe: é o que mantém a auditoria de grafo funcionando. **Trava que lê `next`
sem tratar o objeto transforma o destino na string `"[object Object]"` e vê um
grafo quebrado que não existe.**

---

## 4 · Texto de tela não pode ser composto

Todo literal exibido passa por `tr()`, e a varredura de tradução **pula template
literal com `${}`**. Consequência dura para quem quer aplicar o R-12:

- **Dá** para compartilhar por constante quando a constante é a **frase inteira**
  (`GLASGOW_AVALIAR_VIA_AEREA`, `NALOXONA_TITULADA_IATROGENICA`).
- **Não dá** para compor `` `dose de ${DOSES_ISR.x}` `` — a frase sai da varredura
  e o usuário em espanhol vê português.

É por isso que valores clínicos ficam repetidos em literais e a coerência é
mantida por trava. Isso tem nome e custo declarados: **contrato vigiado**, R-25,
e a dívida é a D-14.

---

## 5 · O peso atravessa módulos por um canal sem contrato

`lib/contexto-do-paciente.ts` carrega `peso`, `pesoOrigem`, `altura`, `sexo`,
`idade` entre módulos, com validade de 1 h. Já produziu defeito: três
implementações de peso predito divergindo no sexo ausente, e `"m"` significando
*Mulher* num módulo e *Masculino* noutro.

Quem escreve trava sobre dose peso-dependente precisa saber que **o peso pode
ter vindo de outro módulo** e que `pesoOrigem` qualifica a dose (D-7).
