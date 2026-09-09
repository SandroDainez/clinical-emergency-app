# Auditoria das afirmações clínicas do AVC — 2026-09-09

> **Estado:** primeira rodada concluída. **1 pendência real**, aguardando fonte primária.
> Nada foi corrigido clinicamente. Sem deploy por conta desta frente.

## Por que ela existe

Em 2026-09-09 o autor conferiu no PDF da AHA/ASA 2026 uma frase que o app exibia
como definição de hipodensidade. **Ela não existia na diretriz.**

O que a fez sobreviver não foi descuido de uma pessoa — foram **cinco camadas
confirmando umas às outras**:

| camada | o que dizia |
|---|---|
| `protocols/fontes-verbatim/…md` | a frase, **com página citada** (Table 8, p. e367) |
| `avc/conteudo/superficie-c.ts` | traduzida, na linha de decisão do campo |
| `avc/nucleo/derivacoes-c.ts` | repetida no texto da leitura |
| `lib/i18n/modules/avc-modulo.ts` | espelhada em espanhol |
| `e2e/avc-superficie-c.spec.ts` | **uma trava verde que a exigia** |

> ⚠️ **Suíte verde é coerência interna, não fidelidade à fonte.**
> As duas se parecem até alguém abrir o documento.

A transcrição em `fontes-verbatim` **não é a fonte**. É uma transcrição
intermediária, e transcrição também erra.

---

## O que a auditoria mede, e o que não mede

| relação | verificável? | por quem |
|---|---|---|
| `app ↔ transcrição` | **sim**, mecanicamente | `scripts/auditoria-definicoes-clinicas.cjs` |
| `transcrição ↔ PDF` | **não** | apenas uma pessoa com a fonte aberta |

**Nenhuma trava lê o PDF.** O que a governança impede é que a *ausência* de
conferência passe por conferência.

---

## Inventário

**173 afirmações** classificadas em `avc/conteudo` e `avc/nucleo`:

| tipo | n |
|---|---|
| unidade/intervalo | 44 |
| definição | 43 |
| janela temporal | 29 |
| verbatim com página | 24 |
| corte | 20 |
| dose | 16 |
| força de recomendação | 10 |
| contraindicação | 8 |

Inventário completo: `auditoria/INVENTARIO-AFIRMACOES-AVC.json`.

---

## Os 14 falsos positivos — `falso_positivo_da_auditoria`

A primeira rodada acusou **15** itens. **14 eram falso positivo do auditor.**

**Motivo:** `normalização textual insuficiente`. A transcrição e o app escrevem
o **mesmo número** de formas diferentes:

| app | transcrição |
|---|---|
| `220 mmHg` | `220 mm Hg` |
| `24 horas` | `24 h` |
| `mg/dL` | `mg / dL` |

> ⚠️ **Auditoria que grita 14 vezes à toa é pior que auditoria nenhuma.**
> Ela gasta a atenção de quem confere e ensina a ignorar o alarme.

Os 14, todos **sem divergência** após normalizar:

| # | arquivo | disparo |
|---|---|---|
| 1 | `antihipertensivos.ts` · esmolol | `1 minuto` |
| 2 | `antihipertensivos.ts` · faixa pós-trombólise | `72 horas` |
| 3 | `correcao-glicemica.ts` · gatilho hospitalar | `24 horas` |
| 4 | `hemorragia-intracerebral.ts` · titulação de PA | `220 mmHg`, `150 mmHg` |
| 5 | `hemorragia-intracerebral.ts` · PA abaixo de 130 | `150 mmHg`, `130 mmHg` |
| 6 | `hemorragia-intracerebral.ts` · TEV/meias | `48 horas` |
| 7 | `hemorragia-intracerebral.ts` · reanticoagulação | `130 mmHg` |
| 8 | `paciente.ts` · antiagregante em uso | `48 horas` |
| 9 | `superficie-c.ts` · sítio de oclusão | `9 horas`, `24 horas` |
| 10 | `superficie-f.ts` · tecido viável | `24 horas` |
| 11 | `superficie-g.ts` · aspirina IV | `24 horas` |
| 12–14 | `derivacoes-d.ts` · janela DOAC | `48 horas` |

### Normalização aplicada

Espaços não separáveis · travessões unicode · `mm Hg`↔`mmHg` ·
`mg / dL`↔`mg/dL` · `mg/kg`, `UI/kg` · `h`/`horas` e `min`/`minutos`
**apenas depois de número** · vírgula decimal **apenas entre dígitos**.

**O que deliberadamente NÃO se normaliza:**

- decimal nunca vira inteiro — `0,25` jamais colapsa em `25`;
- unidade nunca some — `50 UI/kg` e `50 mg/kg` têm o mesmo número e não são a
  mesma coisa.

---

## A pendência real — `vka` · dose

| campo | valor |
|---|---|
| slot / proposição | `vka` + `dose` · `hemorragia-intracerebral.ts:179` |
| texto no app | *"INR ≥2,0: 4F-PCC **25 a 50 UI/kg** (Classe 1). INR 1,3 a 1,9: 4F-PCC **10 a 20 UI/kg** (Classe 2b). Vitamina K IV em ambos (Classe 1)."* |
| tipo | dose + força de recomendação |
| disparo | `50 UI`, `20 UI` |
| fonte declarada no código | **nenhuma** |
| arquivo-fonte esperado | `aha-asa-2022-hic.md` |
| trecho mais próximo | l.93 *"…INR ≥2.0, 4-factor (4-F) prothrombin complex concentrate (PCC) is…"* · l.103 *"…INR of 1.3 to 1.9, it may be reasonable to use PCC…"* |
| número na transcrição? | **NÃO** |
| status | `nao_conferido` |
| ação | **conferir a Figura 2 da AHA/ASA HIC 2022 primária** |

**Agravante:** a linha 29 da própria transcrição diz que a dose de 4F-PCC por
INR está na **Figura 2** — que não foi transcrita. E o app tem uma linha
dizendo *"a dose varia com o INR (Figura 2)"* **e outra dando números**.

**Materiais secundários do projeto** sustentam ~25–50 UI/kg conforme
INR/produto e ~10–20 UI/kg para INR 1,3–1,9.
⛔ **Isso não conta como conferência da diretriz.** É material que o próprio
projeto produziu — e a hipodensidade mostrou o que acontece quando material
intermediário vira prova.

---

## Suspeita levantada e descartada — mismatch de agente

O achado foi **relatado por mim como sendo do slot `dabigatrana`**, e o autor
apontou corretamente que *"INR ≥2,0: 4F-PCC… vitamina K"* num slot de
dabigatrana seria conteúdo deslocado — dos erros mais perigosos possíveis.

**Era defeito do extrator da auditoria**, não do app: ele lia o `id` do bloco
*seguinte* à frase. Mapa conferido, e os três estão alinhados:

| slot | agente | conduta |
|---|---|---|
| `vka` | varfarina | 4F-PCC preferível a plasma + vitamina K IV |
| `dabigatrana` | inibidor direto da trombina | **idarucizumabe** |
| `inibidor_xa` | rivaroxabana, apixabana, edoxabana | **andexanet alfa** |

A suspeita se reduz à **dose**.

---

## Governança criada

`avc/conteudo/conferencia.ts` — estado por **`alvo + proposicao`**, não por slot.

Um mesmo card tem várias proposições, e cada uma se confere sozinha. O `vka` é
o exemplo: o **agente** está na transcrição; a **dose** não está.
Marcar o slot inteiro cobriria o número que ninguém viu.

Estados: `nao_conferido` (padrão) · `transcrito` · `conferido_pdf` ·
`corrigido_apos_conferencia`. Os dois últimos exigem **quem** e **quando**.

Trava: `scripts/prova-conferencia-com-a-fonte.cjs` (9 conferências, no
`test:all`). Provada por mutação: "conferido" sem autor reprova; padrão
otimista reprova.
