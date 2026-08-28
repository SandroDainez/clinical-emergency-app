# F-25 · Crise convulsiva no AVC — **FECHA COMO PONTEIRO**

⚠️ **Escopo estreito, por decisão do autor.** ⛔ Não é protocolo de estado de mal
epiléptico. ⛔ Não duplica outro módulo.

**Consultado em:** 2026-08-28 · **Conferência clínica: pendente**

---

## 🔒 O que a fonte-mãe já fixa — imutável

| regra | força |
|---|---|
| crise **não provocada APÓS** o AVC → tratamento **inclui anticonvulsivante**, conforme características do paciente | **COR 1 · C-LD** |
| ⛔ **profilaxia** anticonvulsivante | **COR 3: No Benefit · C-LD** |
| *"**insufficient data** to inform the pharmacological management of early seizures or recommend the routine use of EEG"* | lacuna declarada |

⚠️ **Três contextos distintos de "crise"** já mapeados (F-24): crise **no início**
= mimetizador · crise como **limitação de generalização** na nota `†` do EVT ·
crise **não provocada após** = a única com recomendação de tratar.

---

## Resultado da busca — e por que ele fecha o slot como ponteiro

| # | campo | resultado |
|---|---|---|
| 25.1 | fármaco de primeira linha | 🟡 **encontrado, mas apenas dentro de protocolos de ESTADO DE MAL EPILÉPTICO** |
| 25.2 | dose inicial e via | 🟡 idem |
| 25.3 | conduta na recorrência | 🔴 **é o próprio algoritmo de EME** |
| 25.4 | **interação com a trombólise** | 🔴 **não identificada nas fontes revisadas** — ver varredura |
| 25.5 | ponto de encaminhamento | ✅ **é a resposta do slot** |

### ⚠️ Toda fonte brasileira encontrada é protocolo de estado de mal epiléptico

As referências localizadas para manejo agudo da crise no adulto — benzodiazepínico
de primeira linha, doses de diazepam e midazolam, segunda linha com levetiracetam
/ fenitoína / valproato, algoritmo por minutos — **pertencem a algoritmos de
estado de mal epiléptico**.

> ⛔ **Transcrevê-las aqui seria exatamente o que o autor proibiu:** duplicar, dentro
> do módulo de AVC, um protocolo que tem escopo, fonte e contrato próprios.
>
> ⚠️ **Por isso não transcrevo dose alguma neste slot.**

### 🔴 25.4 · O campo específico do AVC **não existe em nenhuma fonte**

Varredura da AHA/ASA 2026 por `antiseizure`, `anticonvuls`, `levetiracetam` e por
coocorrência de `seizure` com `thrombolysis`/`IVT`/`alteplase`:

> ⛔ **Nenhuma passagem trata de interação entre anticonvulsivante e trombólise.**

O que a fonte-mãe tem sobre anticonvulsivante limita-se a: infarto cerebelar,
manejo cirúrgico, e a recomendação de iniciar após crise não provocada pós-AVC.

⚠️ **Era o campo mais específico do AVC em todo o F-25.**

> ### ⚠️ FORÇA DA CONCLUSÃO — corrigida pelo autor em 2026-08-28
>
> **Classificação correta:** `lacuna da fonte-mãe / não identificada nas fontes
> revisadas`.
>
> ⛔ **NÃO** *"lacuna real da literatura"*.
>
> A busca demonstra que a **AHA/ASA 2026 não aborda** interação entre
> anticonvulsivante e IVT, e que **as fontes revisadas** não a trouxeram. ⛔ Isso
> **não autoriza** afirmar ausência de literatura científica sobre o tema inteiro
> — seria extrapolar da minha varredura para o estado do conhecimento.

---

## ✅ FECHAMENTO — ponteiro, não conteúdo

**Forma prevista pelo autor em `CAMPOS-FALTANTES`, §F-25:**

```
   ação de tratamento  +  referência a protocolo específico
```

**O que o AVC V1 carrega:**

| elemento | conteúdo |
|---|---|
| **quando agir** | crise **não provocada após** o AVC — **COR 1 · C-LD** |
| **o que NÃO fazer** | ⛔ profilaxia anticonvulsivante — **COR 3: No Benefit · C-LD** |
| **ação** | tratar a crise, *"on the basis of specific patient characteristics"* |
| **referência** | ➜ **protocolo institucional de crise convulsiva / estado de mal epiléptico**, com fonte e contrato próprios |
| **o que o app NÃO diz** | ⛔ fármaco · ⛔ dose · ⛔ via · ⛔ algoritmo de recorrência |

> ⚠️ **Isto é resultado aceitável, não fracasso.** É a mesma forma das saídas de
> §0.1 (HIC, HSA) e da lacuna de gestação (§6.8): **destino nomeado, módulo não
> construído**.
>
> ✅ E resolve o problema que abriu o slot: o campo *"houve crise?"* **agora tem
> regra que o consome** — três contextos distintos (F-24), uma recomendação COR 1,
> uma proibição COR 3, e um ponteiro para fora.

### 🔓 Gatilho de reabertura

F-25 reabre se:

1. surgir **fonte que trate especificamente da interação anticonvulsivante ×
   trombólise** (campo 25.4); **ou**
2. o autor decidir que o AVC V1 deve **conter** a conduta da crise aguda — o que
   exigiria abrir um módulo próprio, ⛔ não ampliar este slot.
