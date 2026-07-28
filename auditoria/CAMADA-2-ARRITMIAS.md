# Camada 2 — Auditoria científica dos módulos de Arritmias

**Fonte:** *MedCampus — Arritmias em Adultos*, guia clínico v1.0, atualização
científica 28/07/2026, revisão médica do Dr. Sandro Rogerio Dainez.

**Escopo:** `acls-tachycardia-tree.ts` e `acls-bradycardia-tree.ts`.

---

## Achados

### 🔴 ARR-02 · O app recomendava amiodarona na FA pré-excitada — a fonte a proíbe

| | |
|---|---|
| **Onde** | `acls-tachycardia-tree.ts:200` |
| **O app dizia** | "FA com pré-excitação (WPW): evitar bloqueadores do nó AV; **considerar amiodarona** ou cardioversão." |
| **A fonte diz** | "Evitar bloqueadores do nó AV: adenosina, verapamil, diltiazem, betabloqueadores, digoxina **e amiodarona IV**, pois podem favorecer condução pela via acessória e fibrilação ventricular." |
| **Avaliação** | **Divergente — e internamente contraditório** |
| **Risco** | **Crítico.** A frase mandava evitar bloqueadores do nó AV e, na mesma linha, sugeria um deles. O desfecho temido é fibrilação ventricular |

**Corrigido:** amiodarona IV entrou na lista do que NÃO usar, com a conduta da fonte
no lugar — cardioversão se instável; procainamida ou ibutilida se estável.

### 🔴 ARR-01 · Flutter atrial com energia de cardioversão agrupada à da TSV

| | |
|---|---|
| **Onde** | cabeçalho, `:76`, `:145` e `:159` |
| **O app dizia** | "QRS estreito regular (TSV/**flutter**): 50–100 J" |
| **A fonte diz** | Energia inicial AHA 2025: TSV de QRS estreito **100 J**; flutter atrial **200 J**; FA 200 J; TV monomórfica com pulso 100 J |
| **Risco** | Alto. Energia insuficiente é choque que falha, mais choques e mais tempo em arritmia |

**Corrigido:** separado por ritmo, com a ressalva da própria fonte — se o protocolo
local ou o fabricante validarem 50–100 J bifásicos no flutter, seguir a
parametrização local sem atrasar o tratamento.

### 🟠 ARR-04 · Adenosina sem nenhuma regra de segurança

O app não trazia **nenhuma** das ressalvas da fonte. A busca por "asma",
"broncoespasmo", "dipiridamol", "transplante" e "teofilina" no módulo dava **zero**.

**Corrigido:** contraindicação em asma/broncoespasmo ativo e em BAV avançado sem
marcapasso; redução de dose em transplante cardíaco, dipiridamol e acesso central;
teofilina e cafeína reduzindo o efeito; aviso ao paciente sobre rubor e dispneia
transitórios.

### 🟠 ARR-06 · Procainamida citada como alternativa, sem dose

O app dizia "Alternativas: procainamida ou sotalol", sem dose nenhuma — numa
taquicardia de QRS largo.

**Corrigido:** 20–50 mg/min até suprimir a arritmia, hipotensão, aumento do QRS
acima de 50% ou 17 mg/kg; manutenção 1–4 mg/min; com as ressalvas de QT prolongado,
IC descompensada e disponibilidade no Brasil.

### 🟡 ARR-05 · Amiodarona sem a repetição por recorrência

Faltava "repetir se houver recorrência" e a monitorização. **Corrigido.**

---

## ⚠️ ARR-03 · Adenosina: a terceira dose voltou à mesa — decisão sua

Esta fonte diz: **"A AHA 2025 apresenta 6 mg e 12 mg; não sustenta terceira dose de
18 mg."** O fluxo dela mostra 6 → 12, e para aí.

Ela nega os **18 mg**, e é silenciosa quanto a um terceiro bolus de **12 mg**.

O app hoje traz 6 → 12 → 12, atribuído ao Resuscitation Council UK, que diz
textualmente: *"If there is no further response give one further 12 mg bolus."*
Foi o que você confirmou usar na prática.

**Não mexi.** As duas leituras se sustentam, e a escolha do que o app ensina é sua:

1. manter 6–12–12 atribuído ao RCUK, como está;
2. deixar 6 → 12 e alinhar ao fluxo desta fonte;
3. manter as duas, dizendo que a AHA para em 12 e o RCUK admite mais 12.

---

## Confirmado pela referência

| item | app | fonte |
|---|---|---|
| Atropina na bradicardia | 1 mg, repetir 3–5 min, máx 3 mg | idêntico |
| Dopamina | 5–20 mcg/kg/min | idêntico |
| Epinefrina | 2–10 mcg/min | idêntico |
| Atropina ineficaz em bloqueio infranodal | presente, com "não atrasar o marcapasso" | idêntico |
| Magnésio nas torsades | 1–2 g IV | 1–2 g IV |
| TV polimórfica | choque NÃO sincronizado | idêntico |
| Amiodarona — dose inicial | 150 mg em 10 min, 1 mg/min por 6 h | idêntico |
| FA/flutter — energia da FA | 200 J | 200 J |
| TV monomórfica com pulso | 100 J | 100 J |
| Adenosina — 1ª e 2ª dose | 6 mg → 12 mg | idêntico |

---

## Avaliação do material

Bom, e melhor que os dois anteriores em dois pontos: **traz o "NUNCA FAZER"
explícito** — foi o que expôs a amiodarona na FA pré-excitada — e **separa o que é
AHA do que é protocolo local**, em vez de apresentar um número só.

Três qualidades que valem manter no padrão:

1. **Diz quando NÃO fazer.** "NUNCA FAZER — captura aparente", "NUNCA FAZER — TV
   polimórfica: não tentar sincronizar". Um app de emergência erra mais por fazer o
   que não devia do que por omitir.
2. **Admite variação local sem abrir mão do padrão.** A pérola do flutter é exemplo:
   dá o número da AHA e diz o que fazer se o serviço tiver outro.
3. **Referências específicas e atuais**, com DOI, incluindo ESC 2024 de FA e AHA
   2025.

Um ponto de atenção: a seção de intoxicações diz explicitamente que "este guia não
fornece uma ordem pronta de infusão". Correto para um material educacional — mas
significa que o módulo de intoxicações **não pode ser auditado por esta fonte**.
Vai precisar de material próprio.
