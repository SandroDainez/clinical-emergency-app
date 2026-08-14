# Decisões de produto — separadas da auditoria clínica

Este arquivo existe porque uma pergunta apareceu durante a varredura de D-22
que **não é um achado de auditoria** — não há certo/errado clínico a
verificar, é uma escolha de escopo do produto. Decisões aqui são do Sandro e
de quem conduz a auditoria, juntas, e vivem separadas de
`DIVIDAS-CONHECIDAS.md` (que é só o que falta corrigir) e do `METODO.md`
(que é só regra de verificação).

---

## PD-1 · O módulo Sepse cobre só o atendimento inicial, ou também o
## paciente internado em piora?

**De onde saiu.** A varredura exaustiva de `sepsis-engine.ts` (código morto
para o fluxo, D-22) encontrou ~6.500 linhas de conteúdo clínico sem
equivalente na árvore viva: SOFA calculável por sistema, ajuste renal/diálise
por antibiótico, alternativa para alergia a beta-lactâmico, isolamento e
precauções, e um fluxo inteiro para o paciente já internado em UTI que piora
(PAV, CRBSI, candidemia, escalonamento por cultura, choque refratário com
resgate avançado, critérios de desmame).

**Por que não é achado de auditoria.** Nas outras categorias (vale portar por
omissão pontual, duplicata, obsoleto, contradição) a pergunta é "isto é
verdade clínica que falta ou diverge?". Aqui a pergunta é outra: **"isto é
produto que o módulo nunca teve como meta oferecer?"** A árvore de Sepse
cobre, de ponta a ponta, o pacote da 1ª hora e a decisão inicial —
exatamente o que `sepsis-decision-tree.ts` promete no seu próprio
`intro`. O conteúdo do engine morto vai muito além disso: é o manejo de
DIAS de UTI, não de HORAS de emergência.

**A pergunta, por extenso:** o módulo Sepse deve crescer para cobrir o
paciente internado em piora (PAV, CRBSI, escalonamento por cultura, SDRA
por sepse, choque refratário avançado), ou o escopo dele termina na
estabilização inicial e o resto é PRODUTO NOVO — um módulo de "Sepse — UTI"
ou equivalente, com sua própria auditoria?

**Por que a pergunta não é só da Sepse.** O mesmo padrão de arquitetura
(árvore cobre o agudo, engine morto tinha ambição maior) provavelmente
existe nos outros três módulos da mesma leva (Anafilaxia, EAP, Ventilação)
e talvez no app inteiro — nenhum módulo hoje declara explicitamente até onde
vai. A resposta aqui é o primeiro caso, não o único, e o critério que sair
dela deveria se aplicar aos 30 módulos ao decidir o tamanho da Fase 2.

**Status:** aberta. Nada do "vale portar" da Sepse foi portado — fica
parado até esta decisão, junto com a extensão da mesma pergunta aos outros
três módulos.

**Ligação:** [D-22](DIVIDAS-CONHECIDAS.md#d-22) (o destino dos engines
mortos não depende desta decisão — mesmo se o escopo maior for aprovado
como produto futuro, o conteúdo seria reescrito/revisado antes de entrar,
não copiado do engine morto direto).

---

## PD-2 · Escopo pediátrico — DECIDIDA

**Decisão:** os módulos declaram população **ADULTA**. Onde havia dose ou
conduta pediátrica avulsa, a ausência agora é **declarada**, não silenciosa —
um ponteiro (`FORA_DE_ESCOPO_PEDIATRICO`, `lib/escopo-pediatrico.ts`) substitui
o fragmento: *"Dose pediátrica fora do escopo deste app — usar protocolo
pediátrico."*

**Onde havia dose pediátrica — oito sítios, não sete.** O levantamento
original (Anafilaxia 5, ISR 1, Convulsões 1) achou o essencial, mas a
varredura escrita para a TRAVA (não a auditoria manual) achou um oitavo:
`sedation-engine.ts:575` (Sedoanalgesia — calculadora VIVA), mesmo padrão do
ISR (atropina pré-medicação para bradicardia vagal em succinilcolina
pediátrica). Corrigido junto. **Isto é o argumento vivo a favor da trava
abaixo** — a varredura por padrão achou o que a leitura dirigida não achou,
mesmo módulo a módulo.

Convulsões (`seizure-decision-tree.ts:204`) foi revisado e **não** alterado:
a menção a "diazepam retal é prática pediátrica" ali não é uma dose — é a
razão pela qual a via retal foi excluída do módulo adulto. Já é ausência
declarada, no sentido que esta decisão pede.

**Por que é reversível, e por que não é barato reverter.** Uma trilha
pediátrica de verdade não é trocar os números de volta — exige
infraestrutura que o app não tem hoje: peso pediátrico com faixas próprias
(`lib/faixas-de-entrada.ts` é só adulta), sinais vitais por faixa etária, e
calculadoras de dose próprias (não uma linha a mais numa calculadora
adulta). Reverter PD-2 sem essa infraestrutura recriaria exatamente o
defeito que a motivou: fragmento avulso, sem trilha, na próxima fonte que
citar as duas populações.

**A trava:** `scripts/valida-escopo-pediatrico.cjs` (`test:escopo-pediatrico`,
dentro de `test:all`) — nenhum arquivo de conteúdo vivo pode introduzir
número por peso (mg/kg, mcg/kg, mL/kg) perto de palavra pediátrica, ou
dispositivo exclusivamente pediátrico (EpiPen Jr), sem que seja o próprio
ponteiro. Os três engines mortos (D-22) são exceção nomeada — não podem
crescer o app de qualquer forma, mas também não são o alvo desta trava.
Mutação provada antes de usar (R-10): a trava pega o achado real
(`sedation-engine.ts`, mg/kg + criança) e o EpiPen Jr (sem mg/kg), e não
acusa nem o próprio ponteiro nem uma dose adulta comum.

**Ligação:** [D-22](DIVIDAS-CONHECIDAS.md#d-22b) (itens B do quadro de
categoria 4).
