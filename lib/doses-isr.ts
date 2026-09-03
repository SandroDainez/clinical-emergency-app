/**
 * Doses de indução da ISR — fonte única.
 *
 * ── A DIVERGÊNCIA QUE ORIGINOU ESTE ARQUIVO ──────────────────────────────────
 *
 * Os dois módulos diziam coisas opostas sobre o MESMO paciente:
 *
 *   ISR            instável 1 mg/kg · choque grave 0,5 mg/kg   → REDUZIR
 *   Sedoanalgesia  "ISR (paciente instável): 1,5–2 mg/kg"      → dose PLENA
 *
 * O rótulo da Sedoanalgesia apontava a faixa cheia de indução como se fosse a
 * do instável. Um manda reduzir, o outro manda dar tudo — e é o mesmo paciente,
 * no mesmo app, com um clique de distância.
 *
 * A dose do indutor deve ser individualizada no choque. Estudos recentes não
 * sustentam uma regra universal de reduzir todo indutor por um corte isolado de
 * índice de choque; em pacientes com baixa reserva hemodinâmica pode ser
 * apropriado usar doses menores de alguns agentes, sem reduzir o bloqueador.
 *
 * ── A REGRA QUE IMPORTA MAIS QUE O NÚMERO ────────────────────────────────────
 *
 * Reduzir o INDUTOR e manter o BLOQUEADOR. Reduzir o bloqueador junto produz
 * relaxamento insuficiente, laringoscopia difícil e mais tentativas — que é o
 * oposto do que se quer em quem já está no limite.
 */

/**
 * ── A CAMADA NUMÉRICA — ESTA É A FONTE ──────────────────────────────────────
 *
 * O número em mg/kg, sem unidade e sem formatação. É daqui que sai TUDO: o
 * cálculo do `derive` (que vira miligrama na seringa) e o texto exibido.
 *
 * ── POR QUE ELA PASSOU A EXISTIR (D-14 / R-25) ──────────────────────────────
 *
 * `DOSES_ISR` tinha ZERO consumidores. Era fonte única no nome e cópia na
 * prática: o `derive` do ISR escrevia os mesmos multiplicadores à mão, e a
 * coerência entre os dois era mantida por trava, não por estrutura. Isso tem
 * nome — contrato vigiado (R-25) — e o problema do contrato é que ele só cobre
 * o universo que a trava enxerga. A Sepse escapou dele com a succinilcolina.
 *
 * Com a camada numérica, o `derive` IMPORTA e não há o que divergir.
 */
export const MG_POR_KG = {
  cetamina: { estavel: 1.5, instavel: 1, choqueGrave: 0.5, asma: 2 },
  /** Dose de referência do cálculo; individualizar conforme contexto clínico. */
  etomidato: 0.3,
  propofol: { estavel: 2, reduzido: 1 },
  succinilcolina: { min: 1, max: 1.5 },
  rocuronio: 1.2,
  sugamadex: 16,
  /** Pré-tratamento — mcg/kg, não mg/kg. */
  fentanilMcg: 2,
} as const;

/**
 * ── FORMATADOR — E O VETO QUE VEM COM ELE ───────────────────────────────────
 *
 * Produz "0,3 mg/kg" a partir de 0.3. Função PURA, sem i18n: a saída não tem
 * palavra em português, então não é texto traduzível — é valor de token.
 *
 * ⚠️ VETO: NUNCA use esta função dentro de uma frase que o usuário lê.
 *
 * Compor ``cetamina ${mgPorKg(1.5)} na indução`` parece a coisa certa e é a
 * armadilha documentada na ARQUITETURA.md: template literal com ${} sai da
 * varredura de tradução, e o usuário em espanhol vê português. A frase inteira
 * precisa ser literal para ser traduzível.
 *
 * O caminho existe porque alguém precisaria dele de qualquer forma; o que
 * impede o mau uso é este veto MAIS a trava que o executa (`test:isr`). Ausência
 * de caminho só protege até alguém criar o caminho sem saber por que ele não
 * existia.
 */
export function mgPorKg(valor: number, unidade: "mg/kg" | "mcg/kg" = "mg/kg"): string {
  return `${valor.toString().replace(".", ",")} ${unidade}`;
}

/**
 * A camada de TEXTO — derivada da numérica, não escrita ao lado dela.
 *
 * Antes as duas eram digitadas em paralelo e uma trava conferia se batiam.
 * Agora uma nasce da outra: não há divergência possível (R-17 aplicado à fonte,
 * não só ao verificador).
 */
export const DOSES_ISR = {
  cetamina: {
    estavel: mgPorKg(MG_POR_KG.cetamina.estavel),
    instavel: mgPorKg(MG_POR_KG.cetamina.instavel),
    choqueGrave: mgPorKg(MG_POR_KG.cetamina.choqueGrave),
    asma: mgPorKg(MG_POR_KG.cetamina.asma),
  },
  etomidato: {
    /** Dose de referência do cálculo; a dose clínica pode ser individualizada. */
    todos: mgPorKg(MG_POR_KG.etomidato),
  },
  propofol: {
    estavel: "1,5–2 mg/kg",
    idoso: mgPorKg(MG_POR_KG.propofol.reduzido),
    /** Hipotensão dose-dependente. */
    instavel: "evitar",
  },
  midazolam: {
    instavel: "evitar",
  },
  succinilcolina: `${MG_POR_KG.succinilcolina.min.toString().replace(".", ",")}–${mgPorKg(MG_POR_KG.succinilcolina.max)}; em obesidade, calcular pelo peso corporal total/real`,
  rocuronio: mgPorKg(MG_POR_KG.rocuronio),
  sugamadex: mgPorKg(MG_POR_KG.sugamadex),
} as const;

/**
 * A regra do ajuste no instável, em uma frase.
 *
 * Literal, sem interpolação: a varredura de tradução pula template com `${}` e
 * a frase apareceria em português no espanhol. `npm run test:isr` confere que
 * os números aqui batem com DOSES_ISR.
 */
export const ISR_AJUSTE_NO_INSTAVEL =
  "No instável, INDIVIDUALIZAR o indutor e MANTER o bloqueador em dose adequada. Neste módulo, cetamina 1 mg/kg é a referência no instável e 0,5 mg/kg no choque grave; esses valores orientam o cálculo, mas não transformam índice de choque ou outro marcador isolado em gatilho automático de redução. Etomidato 0,3 mg/kg permanece a dose de referência do cálculo, sem tornar dose plena ou redução uma regra universal. Reduzir o bloqueador junto pode piorar as condições de laringoscopia e aumentar tentativas.";

/**
 * ── BLOQUEADOR NA ANAFILAXIA E NO ANGIOEDEMA ─────────────────────────────────
 *
 * Vive aqui, e não em cada módulo, porque a regra vale nos DOIS (ISR e
 * Anafilaxia) e regra clínica em dois lugares diverge — foi o que aconteceu com
 * a dose de cetamina logo acima, e com o peso predito antes dela (R-12).
 *
 * A Anafilaxia mandava evitar succinilcolina e usar rocurônio em angioedema
 * extenso. A lógica se inverte quando se olha o risco: em possível CICO, o
 * rocurônio 1,2 mg/kg compromete 45–70 minutos.
 *
 * ⚠️ A RAZÃO CERTA, e não a que soa melhor. O argumento comum — "com
 * succinilcolina dá para acordar o paciente" — é fraco NESTA população: com a
 * reserva de oxigênio já consumida, a dessaturação crítica costuma chegar antes
 * do retorno da ventilação espontânea adequada. O que sustenta a escolha é
 * outra coisa: o rocurônio compromete 45–70 min e o resgate depende de o
 * sugamadex estar disponível, dentro do prazo, e de alguém ir buscá-lo — três
 * condições que falham justamente sob pressão.
 */
export const ANAFILAXIA_BLOQUEADOR =
  "Na anafilaxia/angioedema com necessidade de ISR, WAO/EAACI não elegem um bloqueador neuromuscular específico. Escolher entre succinilcolina e rocurônio conforme contraindicações, duração esperada do bloqueio, risco de via aérea difícil/CICO e disponibilidade real do plano de reversão/resgate. Succinilcolina é opção quando não há contraindicação; rocurônio 1,2 mg/kg é alternativa válida, lembrando que sua paralisia pode durar 45–70 min. A escolha do BNM nunca deve atrasar a garantia da via aérea.";

export const ANAFILAXIA_BLOQUEADOR_ROCURONIO =
  "Se rocurônio 1,2 mg/kg for escolhido e a reversão rápida fizer parte do plano de falha/despertar, lembrar que a paralisia pode durar 45–70 min, pré-calcular sugamadex 16 mg/kg e garantir disponibilidade imediata antes da indução. Sugamadex reverte o bloqueio, mas não substitui adrenalina nem o tratamento padrão da anafilaxia e não deve ser apresentado como terapia estabelecida da reação alérgica ao rocurônio.";

/**
 * ⚠️ O cenário em que a regra acima NÃO se aplica.
 *
 * Bloqueadores neuromusculares estão entre as causas mais frequentes de
 * anafilaxia perioperatória, e a reatividade cruzada entre eles é alta — cerca
 * de 44% de cruzamento com succinilcolina em quem teve anafilaxia por
 * rocurônio, e cerca de 24% no sentido inverso.
 *
 * Quando o gatilho suspeito É um bloqueador, a pergunta "succinilcolina ou
 * rocurônio?" passa a ser secundária diante de "foi um bloqueador que causou
 * isto?".
 */
export const ANAFILAXIA_GATILHO_BLOQUEADOR =
  "⚠️ Se o desencadeante suspeito for um BLOQUEADOR NEUROMUSCULAR (anafilaxia perioperatória): a reatividade cruzada entre eles é alta — cerca de 44% com succinilcolina em quem reagiu ao rocurônio, cerca de 24% no sentido inverso. Evitar AMBOS se houver alternativa para garantir a via aérea; se não houver, a escolha é feita com o risco declarado e a equipe avisada.";

/**
 * A honestidade sobre o lastro da escolha.
 *
 * Ausência de recomendação em diretriz É informação: o leitor precisa saber que
 * esta é uma decisão de raciocínio clínico declarada pelo app, e não uma
 * citação. E a posição contrária existe — vem de revisão, não de diretriz, e
 * está identificada como tal.
 */
export const ANAFILAXIA_BLOQUEADOR_LASTRO =
  "Lastro: WAO e EAACI orientam tratamento da anafilaxia e garantia da via aérea, mas NÃO elegem succinilcolina ou rocurônio como bloqueador preferencial. Por isso o app não deve transformar uma preferência local em regra de diretriz: a escolha depende do paciente, da via aérea e dos recursos de resgate disponíveis. Bloqueadores neuromusculares também podem ser desencadeantes de anafilaxia perioperatória e apresentam reatividade cruzada variável.";
