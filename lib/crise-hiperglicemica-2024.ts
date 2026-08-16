/**
 * Crise hiperglicêmica — os números do consenso 2024, e o que eles substituem.
 *
 * ── ⚠️ O ACHADO QUE ORIGINOU ESTE ARQUIVO ───────────────────────────────────
 *
 * O módulo CITAVA o consenso ADA/EASD de 2024 — no id (`cad_ehh_ada_2024`), no
 * cabeçalho e em várias evidências — e CARREGAVA NÚMEROS DE 2009 em sete
 * pontos. A D-2 registrava isso para o bicarbonato ("evidência de 2024,
 * ramificação de 2009"); ao abrir a fonte para fechá-la, descobriu-se que o
 * bicarbonato era um caso de um padrão que atravessava o módulo inteiro.
 *
 * Está registrado no METODO como R-52 PELO AVESSO — a má atribuição de
 * procedência aqui é INTERNA: não é fonte de terceiro que rotula ano novo sobre
 * conteúdo velho (o caso do material de "ACLS 2025" que recusamos), é o nosso
 * próprio app afirmando uma procedência que os números não têm.
 *
 * ── FONTE ───────────────────────────────────────────────────────────────────
 *
 * Umpierrez GE, et al. "Hyperglycemic Crises in Adults With Diabetes: A
 * Consensus Report". Diabetes Care 2024;47:1257–1275. PDF integral aberto e
 * lido em sessão (2026-08-16), incluindo o texto da FIGURA 4, que é onde estão
 * a maioria dos números operacionais. Cada constante abaixo traz o verbatim que
 * a sustenta.
 */

/* ── BICARBONATO — a D-2 ────────────────────────────────────────────────────
 *
 * Verbatim: "Routine bicarbonate administration is not recommended. Intravenous
 * fluid resuscitation and insulin administration are usually sufficient to
 * resolve the metabolic acidosis of DKA." · "…bicarbonate administration should
 * be considered if the acidosis is severe (i.e., pH < 7.0)." · "If indicated,
 * then 100 mmol of sodium bicarbonate (8.4% solution) in 400 mL of sterile
 * water (an isotonic solution) can be given every 2 h to achieve a pH > 7.0."
 * Figura 4: "Bicarbonate should only be considered if pH is <7.0."
 *
 * ⚠️ A FAIXA 6,9–7,0 NÃO EXISTE NO CONSENSO. Ela é do protocolo de 2009, com
 * dose de 50 mEq. O app tinha TRÊS ramos onde a fonte tem DOIS estados — e o
 * ramo do meio prescrevia METADE da dose a um paciente que a diretriz atual
 * trata com a dose cheia. A pergunta que a D-2 fazia ("a faixa deve deixar de
 * existir como ramo?") tem resposta: sim.
 */
export const BICARBONATO_QUANDO =
  "BICARBONATO — SÓ SE pH < 7,0, e nunca de rotina. O consenso ADA/EASD 2024 é direto: a administração rotineira NÃO é recomendada, porque hidratação e insulina bastam para resolver a acidose da CAD. Considera-se apenas quando a acidose é GRAVE — pH < 7,0 —, pelo risco de efeitos vasculares adversos. ⚠️ NÃO EXISTE MAIS A FAIXA 6,9–7,0 COM MEIA DOSE: ela é do protocolo de 2009, e o consenso 2024 traz um único limiar e uma única dose.";

export const BICARBONATO_DOSE =
  "DOSE (consenso 2024): 100 mmol de bicarbonato de sódio (solução a 8,4%) em 400 mL de ÁGUA ESTÉRIL — a diluição é o que torna a solução isotônica —, podendo ser repetida a cada 2 h até atingir pH > 7,0. ⚠️ O KCl JUNTO NÃO VEM DO CONSENSO 2024: vem do protocolo clássico, e a razão está na própria fonte, que lista a HIPOCALEMIA entre os danos do bicarbonato. Repor potássio junto continua sendo prática defensável — mas é procedência diferente, e fica declarada.";

export const BICARBONATO_DANOS =
  "⚠️ POR QUE NÃO DE ROTINA — os danos que a fonte nomeia: risco aumentado de HIPOCALEMIA, REDUÇÃO DA CAPTAÇÃO TISSULAR DE OXIGÊNIO, EDEMA CEREBRAL e ACIDOSE PARADOXAL DO SISTEMA NERVOSO CENTRAL. E o benefício não aparece: estudos observacionais e randomizados não mostraram vantagem em desfecho cardíaco ou neurológico, nem na velocidade de recuperação da hiperglicemia e da cetoacidose. Dar bicarbonato porque o pH assusta é trocar um número que melhora por um dano que não aparece no monitor.";

/* ── INSULINA ───────────────────────────────────────────────────────────────
 *
 * Verbatim: "treatment protocols recommend the initial administration of an
 * insulin bolus (0.1 units/kg) (intravenously or intramuscularly) if a delay in
 * obtaining venous access is anticipated to be followed by fixed-rate
 * intravenous insulin infusion" · Figura 4: "Consider 0.1 units/kg short-acting
 * insulin as i.v. bolus if there is a delay in setting up the infusion" ·
 * "Mild DKA: Start 0.05 units/kg/h short-acting insulin as fixed-rate i.v.
 * insulin infusion".
 */

/**
 * ⚠️ R-55 PELO AVESSO: a regra estava certa e a RESSALVA faltava.
 *
 * "SEM bolus" é a regra, e continua sendo. O que não existia era a condição em
 * que a própria fonte admite o bólus — e ela é justamente a do serviço com
 * acesso difícil, que é onde o app é usado.
 */
export const INSULINA_BOLUS_A_EXCECAO =
  "SEM BOLUS DE ROTINA — o bólus não melhora desfecho e aumenta hipoglicemia e hipocalemia. ⚠️ MAS EXISTE UMA EXCEÇÃO, E ELA É A DO SERVIÇO REAL: se houver DEMORA para obter acesso venoso ou para montar a bomba, o consenso 2024 admite uma dose inicial de 0,1 U/kg de insulina de ação rápida — IV OU INTRAMUSCULAR —, seguida da infusão contínua de taxa fixa assim que possível. A via IM é a que resolve o caso em que a veia é o problema. O que não se faz é bólus com a bomba pronta ao lado.";

export const INSULINA_CAD_LEVE =
  "⚠️ CAD LEVE TEM TAXA PRÓPRIA: o consenso 2024 inicia a infusão em 0,05 U/kg/h na CAD leve, e não nos 0,1 U/kg/h da moderada e da grave. É a mesma lógica que separa o EHH: a condição vem ANTES do número. Classifique a gravidade (pH, bicarbonato, cetonas e estado mental) antes de programar a bomba — e lembre que a CAD leve não complicada é também a candidata ao análogo rápido SUBCUTÂNEO, que evita a UTI.";

/**
 * ⚠️ A DIREÇÃO DO ERRO ESCRITA NO PRÓPRIO TEXTO.
 *
 * O app acrescentava glicose aos 200 mg/dL — número de 2009. Esperar 50 mg/dL a
 * mais com insulina correndo é tempo de hipoglicemia, e a alternativa que o
 * médico toma quando ela ameaça é desligar a insulina, que é o que não pode.
 */
export const INSULINA_GLICOSE_AOS_250 =
  "ACRESCENTAR GLICOSE AOS 250 mg/dL — e não aos 200. O consenso 2024 manda adicionar dextrose a 5% ou 10% ao cristaloide quando a glicemia cai abaixo de 250 mg/dL, reduzindo a insulina para 0,05 U/kg/h. ⚠️ POR QUE O LIMIAR MAIS ALTO É O SEGURO: a glicose no soro não trata a hiperglicemia, ela EXISTE PARA MANTER A INSULINA CORRENDO enquanto a cetose não fecha. Esperar até 200 mg/dL deixa o paciente mais tempo perto da hipoglicemia com insulina em curso — e a saída que se toma quando ela ameaça é desligar a insulina, que é exatamente o que não se deve fazer com a cetoacidose aberta. ALVOS depois disso: CAD, manter 150–200 mg/dL até a resolução; EHH, manter 200–250 mg/dL até a resolução.";

export const INSULINA_TRANSICAO_SC =
  "TRANSIÇÃO PARA SUBCUTÂNEA — SOBREPOSIÇÃO OBRIGATÓRIA de 1 a 2 h: mantenha a infusão IV correndo por 1–2 h DEPOIS de aplicar a insulina SC. A insulina IV tem meia-vida de minutos, e desligar sem cobertura devolve a cetoacidose. Em quem já usava insulina, retomar o esquema prévio ajustado. NO RECÉM-DIAGNOSTICADO, o consenso 2024 dá o número: basal de ação longa SC em 0,15–0,3 U/kg, em dose única ou dividida em duas, com o rápido acrescentado conforme a alimentação e a glicemia — e o esquema completo (40–60% da dose total como basal) começa DEPOIS da resolução, não durante.";

/* ── POTÁSSIO ──────────────────────────────────────────────────────────────
 *
 * Verbatim (Figura 4): "10–20 mmol/L/h until K+ >3.5 mmol/L (faster K+
 * replacement will require central venous access)" · "Give 10–20 mmol/L liter
 * of i.v. fluid as needed to keep serum K+ between 4 and 5 mmol/L" ·
 * "K+ = 3.5–5.0 mmol/L: Start insulin, but do not give K+; check serum K+ every
 * 2 h" (esta última para K⁺ > 5,0).
 */

/**
 * ⚠️ A RESSALVA DO ACESSO CENTRAL VAI JUNTO DO NÚMERO, e não depois.
 *
 * Quem precisa de mais que 10–20 mmol/h precisa saber, na mesma frase, por que
 * a veia periférica não serve — senão a taxa sobe na bomba que está ali.
 */
export const POTASSIO_TAXA_DE_REPOSICAO =
  "REPOSIÇÃO DE K⁺ — 10–20 mmol/L POR HORA até K⁺ > 3,5 mmol/L, E TAXA MAIOR EXIGE ACESSO VENOSO CENTRAL (consenso 2024). ⚠️ A ressalva é da mesma frase, e não de uma nota adiante: potássio concentrado em veia periférica causa dor intensa, flebite e necrose se extravasar, e é por isso que a via — e não a pressa — é o que limita a velocidade. ⚠️ E A DIREÇÃO DO ERRO IMPORTA: o app trazia 20–40 mEq/h, o DOBRO da taxa da fonte, herdado do protocolo de 2009. Repor rápido demais por veia periférica troca uma hipocalemia tratável por uma lesão de acesso — e não acelera a insulina, que espera o K⁺ chegar a 3,5 de qualquer forma. MANUTENÇÃO, com K⁺ entre 3,5 e 5,0: 10–20 mmol de KCl por LITRO de fluido, mantendo o K⁺ entre 4 e 5.";

/* ── RESOLUÇÃO ─────────────────────────────────────────────────────────────
 *
 * Verbatim (rodapé da Figura 4): "Definitions of resolution (use clinical
 * judgment and do not delay discharge or level of care if these are not met):
 * DKA: Venous pH >7.3 or bicarbonate >18 mmol/L and plasma/capillary ketones
 * <0.6 mmol/L · HHS: Calculated serum osmolality falls to <300 mOsm/kg and
 * urine output is >0.5 mL/kg/h and glucose is <250 mg/dL".
 */
export const RESOLUCAO_CAD =
  "CAD RESOLVIDA (consenso 2024): cetonas plasmáticas ou capilares < 0,6 mmol/L E (pH venoso > 7,30 OU bicarbonato > 18 mmol/L). ⚠️ NÃO HÁ CRITÉRIO DE GLICEMIA na definição — a glicemia já estará controlada pelo tratamento, e exigir um valor dela apenas atrasa a transição. Se o betaOHB não estiver disponível, usar o fechamento do ânion gap. CETONÚRIA PODE PERSISTIR por horas depois de resolvido (o teste da fita lê acetoacetato, e o betaOHB se converte nele durante a recuperação) — não usá-la como critério isolado. E a própria fonte pede JUÍZO CLÍNICO: não atrasar alta ou mudança de nível de cuidado por um critério não cumprido.";

export const RESOLUCAO_EHH =
  "EHH RESOLVIDO (consenso 2024) — são TRÊS condições, e a terceira costuma ser esquecida: osmolalidade efetiva calculada < 300 mOsm/kg, glicemia < 250 mg/dL, E DÉBITO URINÁRIO > 0,5 mL/kg/h. ⚠️ O DÉBITO URINÁRIO É CRITÉRIO, não detalhe de enfermagem: ele é a prova de que a perfusão renal voltou, e o EHH é, antes de tudo, uma depleção de volume. Paciente com osmolalidade e glicemia arrumadas mas oligúrico não está resolvido — está com o número corrigido e o volume ainda faltando.";

/* ── VELOCIDADE DE CORREÇÃO NO EHH ─────────────────────────────────────────
 *
 * Verbatim: "the usual time to resolve hyperglycemia is between 8 and 10 h and
 * the decline should not exceed 90–120 mg/dL/h (5–6.7 mmol/L/h) to prevent
 * cerebral edema. Similarly, the rate of decline of serum sodium should not
 * exceed 10 mmol/L in 24 h and the rate of fall in osmolality should be no
 * greater than 3.0–8.0 mOsm/kg/h to minimize the risk of neurological
 * complications."
 *
 * ⚠️ CONTRADIÇÃO INTERNA QUE ESTA CONSTANTE RESOLVE: o nó do MISTO já trazia
 * 3,0–8,0 (certo, escrito quando o ramo foi criado); o nó de hidratação do EHH
 * trazia "≤ 3 mOsm/kg/h". Dois tetos diferentes para a mesma grandeza, no mesmo
 * módulo — e o do EHH puro, que é o paciente de maior risco osmolar, era o
 * errado.
 */
export const EHH_VELOCIDADE_DE_CORRECAO =
  "VELOCIDADE DE CORREÇÃO NO EHH (consenso 2024) — três tetos que andam juntos: queda da GLICEMIA não maior que 90–120 mg/dL/h; queda do SÓDIO não maior que 10 mmol/L em 24 h; e queda da OSMOLALIDADE entre 3,0 e 8,0 mOsm/kg/h. A hiperglicemia costuma levar de 8 a 10 h para resolver, e essa lentidão é terapêutica, não demora. ⚠️ O QUE ACONTECE SE CORRIGIR RÁPIDO: a água se desloca para o intracelular e o cérebro edemacia — é a complicação que mata no EHH tratado. Se a queda estiver rápida demais, o freio é o FLUIDO, não a insulina.";

/* ── ANTES DO EXAME VOLTAR ─────────────────────────────────────────────────
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O nó `dados` exige glicemia, pH, K⁺ e peso como campos OBRIGATÓRIOS, e a
 * classificação depende dos três primeiros. O paciente da PRIMEIRA HORA — que
 * é o real — chega antes da gasometria, e o fluxo não abria sem ela.
 *
 * O módulo pressupunha exame pronto. E a consequência não é o médico ficar sem
 * o app: é ele ESPERAR, porque a tela sugere que sem o número não há conduta.
 *
 * O que se faz sem exame nenhum é quase tudo o que muda desfecho na primeira
 * hora — e é isso que esta constante diz.
 */
export const ANTES_DO_EXAME_VOLTAR =
  "COMECE AGORA — O QUE NÃO DEPENDE DE NENHUM EXAME: (1) HIDRATAÇÃO, que é o primeiro passo dos três quadros e sozinha já derruba glicemia e osmolalidade — cristaloide balanceado, 500–1.000 mL/h nas primeiras 2–4 h, reduzindo em cardiopata e nefropata; (2) MONITORIZAÇÃO e dois acessos; (3) ECG, que devolve informação de potássio em segundos — onda T apiculada sugere K⁺ alto, achatamento com onda U sugere baixo — enquanto o laboratório não volta; (4) BUSCAR O PRECIPITANTE, que é metade do tratamento: infecção, omissão de insulina, infarto, AVC, pancreatite, gestação, medicamento novo, SGLT2i; (5) COLHER tudo de uma vez — glicemia capilar, gasometria (VENOSA serve), eletrólitos, função renal, cetonas, hemograma, urina, ECG. ⚠️ O QUE DEPENDE DO EXAME, e por isso espera: a CLASSIFICAÇÃO entre CAD, EHH e misto, e a INSULINA — que não começa antes de saber o K⁺, porque insulina com potássio baixo é arritmia. ⚠️ E NÃO ESPERE GASOMETRIA ARTERIAL: a VENOSA basta para o diagnóstico e o acompanhamento da CAD, e é o que costuma chegar primeiro.";
