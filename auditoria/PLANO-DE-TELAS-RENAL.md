# Plano de telas do módulo renal — v2, pelo fluxo ditado pelo autor

**Nada implementado.** Reescrito em 2026-08-23 sobre o fluxo literal do autor.
Substitui a v1, cuja ordem ele não confirmou.

---

## §1 · O PLANO — uma linha por decisão

| # | tela | a decisão que ela toma | estado |
|---|---|---|---|
| **0** | **ABCDE — como está o paciente agora?** | via aérea · respiração · circulação · consciência → tratar a ameaça, ou seguir | ⚠️ **nova como PASSO**; hoje é card que se rola por cima |
| **0b** | **Tratar a ameaça** | qual ameaça, e para onde ir | ✅ existe: os seis atalhos do card (parada · via aérea · ventilação · choque · bradi · taqui) |
| **1** | **Motivo de entrada / apresentação clínica** | situa o caso pelas oito | ⚠️ **nova**; as oito são do autor, literais |
| **2** | **Triagem das ameaças renais imediatas** | as seis, uma a uma, por sinal observável, com "não sei" em cada | ✅ existe (`e1_hipercalemia` … `e6_anuria`) |
| 2·atalho | **Já sei qual é** | pula para a emergência reconhecida | ✅ existe (`atalhos`) — **sai da entrada, vira saída secundária** |
| **3** | **Há IRA?** | creatinina atual e prévia · **intervalo entre as medidas** · diurese · basal | ✅ existe (`dados_do_caso`) · ⚠️ **falta o intervalo** |
| **3b** | **Basal desconhecida** | estimar (D-65) ou seguir sem estadiar | ✅ existe (`sem_base`) |
| **3c** | **DRC prévia?** | IRA isolada · DRC sem agudização · IRA sobre DRC · indeterminada | ✅ existe (`sobre_drc`, `drc_pistas`) |
| **3d** | **Estágio KDIGO** | 1, 2 ou 3 — calculado, não perguntado | ✅ existe (`estagio_kdigo`) |
| **4** | **Mecanismo / causa** | obstrução · perfusão e volemia · nefrotóxicos · intrínseca | ✅ existe (`obstrucao_check`, `volume_check`, `vol_dados`, `nefrotoxico_check`) |
| **5** | **Conduta específica** | por ameaça, causa e estágio | ✅ existe (`trata_*`, `pre_renal`, `congesto_conduta`, `renal_conduta`, `trs_check`) |
| **6** | **Reavaliar resposta** | **melhorou · não respondeu · piorou · surgiram dados novos** | ⚠️ **nova como DECISÃO**; hoje `seguimento` é ação que diz o que vigiar, sem as quatro saídas |

**Telas novas: 3** (0, 1 e 6). Uma muda de posição (o atalho). O resto fica.

---

## §2 · A TENSÃO ENTRE AMEAÇA E APRESENTAÇÃO — três formas, e eu não decido

**A tensão, literal:** no fluxo do renal a instabilidade é o passo **0** e o
motivo de entrada é o **1**. Na regra dos 31, *"o que tenho na minha frente"* vem
**antes** de *"há ameaça imediata"*. Em telas, é uma ordem só.

### Forma A · Portão binário antes da apresentação

*"Há ameaça imediata à vida?"* → [Sim, tratar agora] [Não] [Não sei]

⚠️ **Contra:** pede exatamente o tipo de julgamento que o autor reprovou na porta
de entrada. *"Há ameaça imediata"* é conclusão, não observação — e quem não sabe
o que está vendo não sabe responder. **É o defeito do "qual das seis" com outro
nome.**

### Forma B · Apresentação primeiro, portão sempre alcançável no topo

⚠️ **Contra:** é o que existe hoje. O portão vira banner, e banner se rola por
cima — foi exatamente a queixa.

### Forma C · ⚠️ RECOMENDADA — o passo 0 pergunta o que se VÊ, não o que se conclui

Uma tela, opções observáveis, sem exigir raciocínio anterior:

> **Como está o paciente agora?**
> · Respirando mal, saturando baixo ou com esforço
> · Rebaixado, confuso ou não responde bem
> · Pressão baixa, mal perfundido, pele fria
> · Ritmo muito lento ou muito rápido
> · **Nenhuma dessas — está conversando e estável por enquanto**
> · **Não sei dizer — me ajude a olhar**

Quem marca qualquer uma das quatro primeiras vai para o atalho de estabilização
correspondente **e volta**. Quem marca "nenhuma dessas" segue para o motivo de
entrada. O **"não sei"** abre o ABCDE item a item.

**Por que ela resolve a tensão:** a pergunta é *"o que tenho na minha frente"* —
**e a resposta já é a triagem de ameaça**. As duas acontecem juntas, como na
prática, porque a pergunta é observacional dos dois lados. Não há ordem a
escolher: há uma tela que faz as duas coisas.

**Custo:** um toque a mais para o paciente estável — o caso comum. É o mesmo
preço que a varredura das seis já paga, e pelo mesmo motivo.

⚠️ **O que a Forma C exige e eu não tenho:** o texto das quatro linhas de
observação. Escrevi-as acima **como forma, não como conteúdo** — elas precisam
sair da especificação ou do autor. É a diferença entre propor a estrutura e
inventar clínica.

---

## §3 · A SEPARAÇÃO — o que existe · o que sai da especificação · o que falta

### Etapa 0 · ABCDE operacional

| | |
|---|---|
| **existe** | os seis atalhos de estabilização (`StabilizationFirstCard`): parada · via aérea · ventilação mecânica · choque/vasopressor · bradicardia instável · taquicardia instável. **O destino de cada ameaça já está pronto** |
| **sai da especificação** | §4: *"instabilidade hemodinâmica/choque · rápida deterioração clínica"* entre as situações a identificar no início |
| ⚠️ **falta** | **as frases observacionais** da Forma C ("respirando mal…", "rebaixado…"). O card de hoje lista **módulos de destino**, não **sinais**. Transformar "Via aérea / IOT (ISR)" em "respirando mal, saturando baixo" **é escrever conteúdo clínico novo** — e não está na especificação |

### Etapa 1 · Motivo de entrada

| | |
|---|---|
| **existe** | nada. Não há tela |
| **sai do autor, literal** | as oito: oligúria/anúria · creatinina elevada ou em ascensão · distúrbio eletrolítico · sobrecarga volêmica · acidose · paciente crítico com risco de IRA · alteração renal incidental · **"Ainda não sei — me ajude a identificar o problema."** |
| ⚠️ **falta** | **para onde cada uma das oito leva.** O autor deu a lista; o roteamento é decisão de fluxo. Sete têm destino óbvio dentro do que já existe; **"ainda não sei" não tem** — e é justamente a que importa |

### Etapa 6 · Reavaliar resposta

| | |
|---|---|
| **existe** | `seguimento` (o que vigiar, com a tendência), `destino_monitorizado`, `destino_suporte`, `acionar`. **O conteúdo do que medir e de quando chamar está escrito** |
| **sai da especificação** | §12 (reavaliar resposta) e §13 (destino, monitorização, seguimento) |
| ⚠️ **falta** | **a decisão com as quatro saídas.** Hoje `seguimento` é `action`: informa e segue para o destino. As quatro — melhorou · não respondeu · piorou · surgiram dados novos — **não existem como opções**, e cada uma precisa de destino: para onde volta quem piorou? Reentra na triagem das seis? Isso é **desenho de fluxo com consequência clínica**, e é do autor |

---

## §4 · A ESTRUTURA DA D-93 — sem número

Autorizada como **campo reutilizável**. Três usos, um campo: cálcio (velocidade
de elevação) · sódio (aguda × crônica) · creatinina (valor prévio e intervalo).

```ts
/**
 * ⚠️ ESTRUTURA SEM CLÍNICA DENTRO. Nenhum limiar de tempo, nenhuma velocidade de
 * correção, nenhum número — quem os fornece é o módulo que a consome, com fonte.
 */
export type MedidaAnterior = {
  /** O valor de antes, na unidade DO CAMPO (R-119). */
  valor: number;
  unidade: UnidadeDeCampo;
  /** Quando foi medido — o dado que o app nunca teve. */
  medidaEm: { tipo: "horasAtras"; horas: number } | { tipo: "dataHora"; iso: string };
};

export type TempoDeInstalacao =
  | { tipo: "conhecido"; anterior: MedidaAnterior }
  /** Sabe-se que é antigo, sem valor anterior à mão. */
  | { tipo: "previo_sem_valor" }
  /** ⚠️ O caso mais comum à beira do leito. */
  | { tipo: "indeterminado" };

/** O intervalo é DERIVADO — nunca perguntado nem digitado. */
export function intervaloEmHoras(t: TempoDeInstalacao, agoraIso: string): number | null;

/** O "não sei" ensina onde procurar, em vez de escolher pelo médico. */
export const ONDE_ACHAR_A_MEDIDA_ANTERIOR: string[];
```

⚠️ **O que ela NÃO traz, de propósito:** nenhum corte de "agudo × crônico",
nenhuma velocidade de correção, nenhuma faixa. A regra de que
`indeterminado` deve ser tratado como o cenário mais cauteloso está **proposta**
em `PROPOSTA-TEMPO-DE-INSTALACAO.md` e **é clínica** — não entra no campo.

⚠️ **E `ONDE_ACHAR_A_MEDIDA_ANTERIOR` está vazio até o autor escrever.** "Exame
anterior no prontuário, internação prévia" é plausível e **seria invenção
minha**.

---

## §5 · O TESTE QUE TODA TELA NOVA PRECISA PASSAR

Do autor, ao corrigir a minha tela 1:

> *"'O que fez pensar em rim?' ainda pressupõe que alguém já pensou em rim."*

> **A pergunta exige que a pessoa já saiba a resposta de algo anterior? Se exige,
> está errada.**

⚠️ **Apliquei o teste às três telas novas deste plano:**

- **Tela 0 (Forma C):** *"Como está o paciente agora?"* → passa. É observação.
- **Tela 0 (Forma A):** *"Há ameaça imediata à vida?"* → **reprova.** É conclusão.
- **Tela 1:** *"Motivo de entrada / apresentação clínica"* → passa.
- **Tela 6:** *"O paciente melhorou?"* → passa **se** as opções forem
  observáveis (diurese subiu, creatinina caiu, continua igual). **Reprova** se
  perguntar *"respondeu ao tratamento?"*, que é julgamento.
