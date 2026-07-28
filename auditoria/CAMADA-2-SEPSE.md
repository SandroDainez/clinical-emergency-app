# Camada 2 — Auditoria científica do módulo Sepse

**Fonte:** *MedCampus — Sepse e Choque Séptico em Adultos*, capítulo clínico v1.4,
corte científico 28/07/2026, revisão médica do Dr. Sandro Dainez.

**Base da fonte:** Surviving Sepsis Campaign **2026** (Prescott HC et al., Crit Care
Med 2026;54(4)) — mais recente que a SSC 2021 que o app citava em vários pontos.

---

## O módulo já estava bem alinhado

| item | situação |
|---|---|
| Antimicrobiano: 1 h no choque, até 3 h na sepse possível | presente, com a distinção correta |
| Noradrenalina como 1ª linha | presente |
| Cristaloide balanceado preferido ao SF 0,9% | presente |
| Não usar gelatinas nem amidos | presente |
| Bolus com reavaliação dinâmica | presente |
| Sepsis-3 com critérios independentes | presente |
| Vasopressina como adjuvante | presente |
| Corticoide não indicado em sepse sem choque | presente |
| Alvo de glicemia 140–180 | presente |

---

## Achados aplicados

### 🟠 SEP-01 · Limiar de corticoide funcionava como PORTÃO — e a fonte diz que ele não existe

| | |
|---|---|
| **Onde** | `sepsis-decision-tree.ts:330` e `:333` · `protocols/sepse_adulto.json:205` |
| **O app perguntava** | "Choque com **NE ≥ 0,25 mcg/kg/min por ≥ 4 h** sem atingir PAM ≥ 65?" — e atribuía o critério à SSC 2026 |
| **A fonte diz** | "Considere hidrocortisona quando houver **necessidade persistente de vasopressor** após ressuscitação inicial e correção de causas reversíveis. **Não existe limiar universal de dose ou duração do vasopressor para início**." |
| **Avaliação** | **Divergente — e com atribuição incorreta** |

O agravante é ser um **nó de decisão**: quem respondia "não" seguia para o controle
do foco **sem corticoide**. Um número que a fonte diz não existir estava barrando a
indicação.

**Aplicado:** a pergunta passou a ser a necessidade persistente de vasopressor. O
0,25/4 h permanece no texto como **referência de prática e critério dos ensaios** —
útil como parâmetro, explicitamente não como portão. Entrou também que não há
superioridade estabelecida entre dose intermitente e infusão contínua.

### 🟠 SEP-02 · Faltava a exceção do TCE no cristaloide balanceado

| | |
|---|---|
| **O app dizia** | "Cristaloide BALANCEADO preferido ao SF 0,9%" — regra geral, sem exceção |
| **A fonte diz** | "Em traumatismo cranioencefálico associado, **prefira solução salina 0,9% e evite albumina**." |
| **Risco** | Alto no cenário específico. Soluções balanceadas são relativamente hipotônicas e podem agravar edema cerebral |

Sepse com TCE associado não é raro — politrauma com infecção, pneumonia
aspirativa após TCE. O app mandava a conduta oposta à correta nesse subgrupo.

**Aplicado**, com a razão fisiológica junto.

### 🟠 SEP-03 · Alvo de PAM sem a ressalva do idoso

A fonte: "PAM inicial em torno de 65 mmHg; **em pacientes ≥65 anos, considerar alvo
inicial de 60–65 mmHg** e individualizar pela perfusão."

**Aplicado.** Entrou também que a noradrenalina pode ser iniciada por acesso
periférico de boa qualidade sob monitorização — o que evita atrasar o vasopressor
esperando acesso central.

### 🟡 SEP-04 · Peso usado no volume inicial

A fonte: peso corporal **real**; em IMC > 30 kg/m², peso ajustado ou ideal,
**documentando o descritor escolhido**. O app calculava 30 mL/kg sem dizer qual peso.
Num paciente de 140 kg a diferença entre real e ideal passa de 2 litros.

**Aplicado.**

### 🟡 SEP-05 · "30 mL/kg" sem a qualificação da fonte

A fonte insiste: "em alíquotas e com reavaliação; **não é volume automático**".
**Aplicado**, e a citação passou de SSC 2021 para a redação da 2026.

### 🟡 SEP-06 · Albumina

O app não mencionava albumina em lugar nenhum. **Aplicado:** SSC 2026 sugere
cristaloide isoladamente em vez da associação rotineira; suplementar pode ser
considerada após grandes volumes ou em cirrose.

---

## Não aplicado — fica como observação

**qSOFA.** A fonte recomenda "NEWS/NEWS2, MEWS ou SIRS **em vez de qSOFA como
ferramenta única**" para rastreamento hospitalar. O app usa qSOFA na triagem, já com
a ressalva de que "não substitui o SOFA".

Não mexi porque trocar a ferramenta de rastreamento do módulo é mudança de fluxo, não
de texto — mexe na tela de triagem, nos campos calculados e no registro. **Decisão
sua:** manter o qSOFA com uma ressalva apontando NEWS/MEWS, ou trocar a ferramenta.

**Vasopressina.** O app adiciona vasopressina quando NE > 0,25 mcg/kg/min. A fonte
diz apenas "quando a dose estiver em escalada", sem número. Diferente do corticoide —
onde a fonte **nega** o limiar —, aqui ela apenas não fornece um. Mantive o número
por ser prática consolidada e por não haver contradição.

---

## Avaliação do material

**Bom, atual e com uma virtude que os outros não tiveram: ele nega limiares falsos.**

A frase "não existe limiar universal de dose ou duração do vasopressor para início"
é o tipo de afirmação que corrige um erro comum — a precisão inventada. Foi
exatamente ela que expôs o portão do corticoide no app.

Outras qualidades:

1. **Traz "O que não fazer"** explícito, como o de arritmias.
2. **Distingue força de recomendação** ("condicional e de baixa certeza") em vez de
   apresentar tudo como igual.
3. **Declara os limites de aplicabilidade brasileira** — diz que registro Anvisa,
   incorporação no SUS e disponibilidade real não foram validados no capítulo.

**Limite, igual ao do TEP:** não traz esquemas empíricos de antimicrobiano
("este capítulo não inclui esquemas empíricos fechados"). Os antibióticos do app —
254 afirmações críticas em `sepse-antimicrobianos` — **não foram validados** por esta
fonte e seguem pendentes.
