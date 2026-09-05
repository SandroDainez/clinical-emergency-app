import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import {
  LAST_AMIODARONA_E_A_EXCECAO,
  LAST_CHAMAR_AJUDA_E_CEC,
  LAST_DEPOIS_QUE_ESTABILIZA,
  LAST_EMULSAO_DOSE,
  LAST_NAO_E_SO_DURANTE_A_INJECAO,
  LAST_O_QUE_EVITAR,
  LAST_PONTEIRO_CURTO,
  LAST_PROPOFOL_NAO_SUBSTITUI,
  LAST_RCP_E_DIFERENTE,
  LAST_RECONHECER,
} from "./lib/last-emulsao-lipidica";
import { PRALIDOXIMA_TRES_POSICOES, PRALIDOXIMA_O_QUE_FAZER } from "./lib/pralidoxima-controversia";


/**
 * ── VIGILÂNCIA DEPOIS DE O ANTÍDOTO FUNCIONAR ───────────────────────────────
 *
 * Fonte única, dona aqui. Antídoto de duração menor que a do agente tem uma
 * consequência obrigatória: o paciente que acordou NÃO está resolvido.
 *
 * Fonte: bula profissional do Narcan (cloridrato de naloxona, Cristália).
 */
export const NALOXONA_VIGILANCIA_APOS_REVERSAO =
  "⚠️ O PACIENTE QUE ACORDOU NÃO ESTÁ RESOLVIDO. A meia-vida da naloxona é MENOR que a da maioria dos opioides — a depressão respiratória PODE VOLTAR depois de o paciente já ter acordado (renarcotização). Vigiar por horas, não por minutos: a bula prevê doses repetidas em intervalos de UMA A DUAS HORAS, conforme a quantidade, o tipo (curta ou longa duração) e o tempo desde a última administração do opioide. METADONA e FENTANIL TRANSDÉRMICO são os piores casos — duram muito mais que qualquer dose única de naloxona, e o adesivo continua liberando fármaco depois de retirado: REMOVER O ADESIVO faz parte do tratamento. Quando houver recorrência ou opioide de ação longa, passar para INFUSÃO CONTÍNUA: dose por hora = dois terços da dose total que reverteu a ventilação. Na bula, o uso pediátrico exige monitorização por pelo menos 24 h, pela possibilidade de recaída conforme a naloxona é metabolizada.";

/**
 * ── FLUMAZENIL: APRESENTAÇÃO E RESSEDAÇÃO ───────────────────────────────────
 *
 * A apresentação estava AUSENTE do app inteiro — pendência R-6 que só apareceu
 * ao abrir a bula para escrever a ressedação.
 *
 * Fonte: bula profissional do flumazenil (Lanexat/genérico, 0,1 mg/mL),
 * conferida em dois registros nacionais — União Química e Fresenius Kabi.
 */
export const FLUMAZENIL_APRESENTACAO =
  "Flumazenil — apresentação nacional: solução injetável 0,1 mg/mL, ampola de 5 mL (0,5 mg por ampola), caixa com 5. USO EXCLUSIVAMENTE INTRAVENOSO.";

export const FLUMAZENIL_RESSEDACAO =
  "⚠️ RESSEDAÇÃO — o risco é MAIOR que o da naloxona. A meia-vida terminal do flumazenil é de 40 a 80 minutos, contra praticamente todo benzodiazepínico; em insuficiência hepática ela sobe para 1,3 h (moderada) e 2,4 h (grave), e com o benzodiazepínico em INFUSÃO a diferença vira horas. A própria bula registra um estudo em intoxicados que despertaram por 72 ± 37 min e no qual 40% VOLTARAM AO COMA após 18 ± 7 min. Vigiar por horas: os efeitos do benzodiazepínico reaparecem em poucas horas conforme a meia-vida dele e a relação entre as doses de agonista e antagonista. Mesmo o paciente que acordou e está lúcido não deve dirigir nem operar máquinas nas primeiras 24 h.";

/**
 * ⚠️ DOIS TETOS, E O NÓ DOS ANTÍDOTOS USAVA O ERRADO.
 *
 * `tox_sedativo` já distinguia: teto cumulativo de 3 mg na SUPERDOSAGEM, e o
 * teto de 1 mg é o da REVERSÃO DE SEDAÇÃO CONSCIENTE. O nó `antidoto`, escrito
 * à mão, dizia "Flumazenil 0,2 mg IV (máx 1 mg)" — o teto da sedação
 * consciente aplicado à intoxicação, dentro do módulo de intoxicação.
 * Subdosa o antídoto exatamente no contexto que exige mais.
 *
 * ⚠️ É A MESMA FAMÍLIA DO DEFEITO DA NALOXONA — uma dose para dois cenários —,
 * e ele sobreviveu ao bloco que corrigiu a naloxona por um motivo que vale
 * registrar: A DOSE FICOU FORA DA FONTE ÚNICA. As constantes de naloxona foram
 * criadas, revisadas e consumidas; esta linha continuou literal num nó, e
 * nenhuma correção da fonte a alcançou.
 *
 * É o argumento a favor de que fonte única não é burocracia: o que está fora
 * dela não recebe as correções, e ninguém percebe, porque o texto ao lado está
 * certo.
 */
export const FLUMAZENIL_DOIS_TETOS =
  "⚠️ O TETO DO FLUMAZENIL DEPENDE DO CENÁRIO, e confundi-los subdosa o antídoto. NA SUPERDOSAGEM (intoxicação): 0,2 mg IV em 15 s; sem resposta, 0,3 mg e depois 0,5 mg a cada minuto, até TETO CUMULATIVO DE 3 mg. NA REVERSÃO DE SEDAÇÃO CONSCIENTE (o paciente que a própria equipe sedou): 0,2 mg, repetindo até TETO DE 1 mg — porque ali se quer acordar, não competir com uma superdose. Usar o teto de 1 mg na intoxicação é parar no terço do caminho; usar o de 3 mg em quem foi sedado pela equipe é reversão abrupta desnecessária. ⚠️ NOS DOIS CENÁRIOS, A RESSEDAÇÃO É REGRA: a duração do flumazenil é MENOR que a da maioria dos benzodiazepínicos, e o rebaixamento volta depois de o paciente ter acordado — chegar ao teto não encerra o caso, e a vigilância é por horas.";

export const FLUMAZENIL_NAO_USAR =
  "NÃO usar flumazenil se: uso crônico de benzodiazepínico, epilepsia, coingestão de tricíclico ou convulsão — risco de convulsão refratária. Também é contraindicado em quem recebe benzodiazepínico para controlar condição potencialmente fatal (hipertensão intracraniana, epilepsia de difícil controle): retirar o agonista devolve a condição que ele estava segurando.";

/**
 * ── O ANTÍDOTO NÃO CRUZA DE CLASSE ──────────────────────────────────────────
 *
 * Ausência total no app até aqui, e é a que produz o erro de raciocínio mais
 * caro da intoxicação mista.
 *
 * Fontes: bula do flumazenil (não reverte opioides, barbitúricos nem outros
 * depressores que não sejam benzodiazepínicos; na intoxicação mista, anular o
 * benzodiazepínico pode DESMASCARAR a toxicidade do outro fármaco — convulsão,
 * arritmia — especialmente com antidepressivos cíclicos) e van Lemmen/Dahan,
 * Anesthesiology 2023, para o simétrico da naloxona diante de coingestão de
 * depressores centrais.
 */
export const ANTIDOTO_NAO_CRUZA_DE_CLASSE =
  "⚠️ CADA ANTÍDOTO REVERTE UMA CLASSE SÓ. Naloxona age no receptor opioide e NÃO reverte benzodiazepínico, álcool, barbitúrico ou outro depressor central. Flumazenil age no receptor do benzodiazepínico e NÃO reverte opioide, barbitúrico nem álcool. CONSEQUÊNCIA PRÁTICA, que é onde o raciocínio erra: em intoxicação mista, \"não respondeu ao antídoto\" significa PROCURAR A OUTRA SUBSTÂNCIA — não escalar a dose do antídoto que já falhou. Uma reversão parcial é a assinatura da coingestão. E cuidado com a direção oposta: anular o benzodiazepínico numa mista pode DESMASCARAR a toxicidade do outro fármaco, com convulsão ou arritmia, sobretudo com antidepressivo cíclico.";

/**
 * ── NALOXONA: DOIS REGIMES, E O QUE DECIDE ENTRE ELES ───────────────────────
 *
 * Fonte única, dona aqui. A Sedoanalgesia e as telas de consulta CONSOMEM.
 *
 * ── O DEFEITO QUE ORIGINOU ───────────────────────────────────────────────────
 *
 * O app tinha UMA dose só — 0,4–2 mg — em todos os seis lugares que prescrevem
 * naloxona. E ela errava nas DUAS direções, conforme o contexto:
 *
 *   · no IATROGÊNICO (opioide dado pela própria equipe) é dose de superdose:
 *     reverte tudo de uma vez, devolve a dor, e a bula brasileira lista entre as
 *     reações pós-operatórias edema pulmonar, parada cardíaca, taquicardia,
 *     fibrilação ventricular, convulsão e hipertensão;
 *   · na overdose por opioide de ALTA AFINIDADE (fentanil e análogos) é dose
 *     baixa demais: 0,4 mg ou menos se associa a nenhum efeito ou a maior chance
 *     de renarcotização, e são necessários mais de 2 mg, repetição ou infusão.
 *
 * ── O QUE DECIDE NÃO É A GRAVIDADE, É A PROCEDÊNCIA DO OPIOIDE ──────────────
 *
 * A pergunta a responder ANTES de escolher o número: quem deu o opioide?
 * Dose conhecida e paciente monitorizado pedem titulação fina; opioide
 * desconhecido pede dose alta. Um paciente grave pode precisar de qualquer um
 * dos dois regimes — a gravidade não separa.
 *
 * ── FONTES ───────────────────────────────────────────────────────────────────
 *
 * Bula profissional do Narcan (cloridrato de naloxona, Cristália) — apresentação
 * 0,4 mg/mL em ampola de 1 mL, embalagens com 10 e 25 ampolas; posologia de
 * superdose e de depressão pós-operatória; reações adversas do pós-operatório.
 * Corroboração fisiopatológica: van Lemmen M, Florian J, Li Z, … Dahan A.
 * Anesthesiology 2023;139(3):342–353.
 */
export const NALOXONA_PROCEDENCIA_DECIDE =
  "ANTES DA DOSE, RESPONDA: quem deu o opioide? Não é a gravidade que separa os dois regimes — é a PROCEDÊNCIA. Opioide que a EQUIPE administrou, dose conhecida, paciente monitorizado → titulação fina, preservando analgesia. Opioide DESCONHECIDO, ou suspeita de fentanil e análogos → dose alta, repetição ou infusão. O mesmo paciente grave pode pertencer a qualquer um dos dois.";

export const NALOXONA_TITULADA_IATROGENICA =
  "REVERSÃO TITULADA (opioide dado pela equipe). PREPARO: 1 ampola de 0,4 mg/1 mL + 9 mL de SF = 10 mL a 40 mcg/mL — assim 1 mL = 40 mcg e a titulação fica executável. Injetar 0,1–0,2 mg (2,5–5 mL) por vez, a cada 2–3 min, até VENTILAÇÃO adequada — não até despertar completo. O alvo é respirar, mantendo analgesia: a depressão respiratória cede com ocupação de receptor menor que a da analgesia. Em quem se quer evitar abstinência (dependência conhecida), começar mais baixo e escalonar de 0,04 mg (1 mL) em diante. Reversão abrupta devolve a dor de uma vez e provoca surto catecolaminérgico — a bula lista taquicardia, hipertensão, náusea, vômito, convulsão, arritmia e EDEMA PULMONAR entre as reações do pós-operatório.";

export const NALOXONA_DOSE_ALTA_DESCONHECIDO =
  "DOSE ALTA (opioide desconhecido ou de alta afinidade). Dose inicial 0,4–2 mg IV, repetindo a cada 2–3 min. Fentanil, análogos e metadona exigem MAIS: doses de 0,4 mg ou menos podem não deslocar o opioide do receptor e ainda aumentar a chance de renarcotização — nesses casos são necessários mais de 2 mg, doses repetidas ou infusão contínua. Se não houver NENHUMA resposta após 10 mg no total, questionar o diagnóstico de intoxicação por opioide e procurar outra causa. Manter ventilação com bolsa-válvula-máscara enquanto a naloxona não age.";
/**
 * Intoxicações exógenas — abordagem inicial.
 * Estrutura: estabilização (ABCDE + antídotos do coma) → identificação da
 * síndrome tóxica (toxidrome) → descontaminação → antídoto específico →
 * eliminação (hemodiálise). Tabela de antídotos reaproveitada das antigas
 * Referências Rápidas.
 *
 * Fontes: Einstein/SBIBAE — "Intoxicação Exógena em Adultos" e "Intoxicação por
 * Metanol" (CPTW474.1, aprovado em 03/10/2025, escrito durante o surto de
 * metanol e alinhado à nota técnica da SES-SP de 2025), com as referências que
 * eles próprios citam: Manual de Toxicologia Clínica da SMS-SP (2017) e
 * Kraut & Mullins, Toxic alcohols, N Engl J Med 2018;378:270.
 *
 * Onde o pathway institucional divergiu da literatura, prevaleceu a literatura
 * (regra do autor do app). Dois pontos concretos:
 *
 * 1. O documento afirma que cocaína, tricíclicos e carbamazepina "agem no canal
 *    de cálcio do miócito". Não: bloqueiam o canal de SÓDIO rápido — e é por
 *    isso que o bicarbonato funciona (sobrecarga de sódio + alcalinização
 *    deslocam o bloqueio) e que se evita amiodarona, também bloqueadora de
 *    sódio. A conduta do documento está certa; o mecanismo, trocado. Aqui vai o
 *    mecanismo correto.
 * 2. O documento indica NAC por "ingesta de 10 g ou mais" de paracetamol. O
 *    critério da literatura é o nomograma de Rumack-Matthew (ou dose tóxica por
 *    peso), que o app já usa e foi mantido.
 *
 * Também ficaram de fora os acionamentos institucionais (telefones internos,
 * transferências entre unidades da rede, solicitação de fomepizol a um serviço
 * específico) — são operação de um hospital, não conduta transferível.
 */

export const poisoningDecisionTree: DecisionTreeDefinition = {
  id: "intoxicacoes_exogenas",
  version: "2024.1",
  label: "Intoxicações exógenas",
  entryNodeId: "estabilizacao",
  nodes: {
    estabilizacao: {
      id: "estabilizacao",
      type: "action",
      title: "Estabilização primeiro — ABCDE",
      summary: "Tratar o paciente, não o veneno. A maioria das mortes é por falha de via aérea e hipotensão.",
      actions: [
        "Via aérea: rebaixamento com perda de reflexos protetores → via aérea definitiva (risco alto de broncoaspiração).",
        "Respiração: O₂, oximetria e capnografia; atenção à hipoventilação (opioides, sedativos).",
        "Circulação: acesso venoso, monitor, ECG de 12 derivações (QRS e QT alargados indicam toxicidade específica).",
        "GLICEMIA CAPILAR imediata — hipoglicemia é causa reversível de coma.",
        // ⚠️ AQUI FICA O GATILHO, NÃO O REGIME. A frase abaixo diz que a dose
        // depende da PROCEDÊNCIA e manda ao nó onde ela é dada — o regime
        // completo da naloxona (1.099 ch) e a regra de classe única (489 ch)
        // viviam TAMBÉM aqui, e este nó é ABCDE: quem está estabilizando ainda
        // não sabe o agente. Os dois blocos ficam onde o antídoto é
        // administrado (`tox_opioide`) e onde a coingestão é raciocinada
        // (`antidoto`). R-48: o conteúdo na superfície onde a decisão acontece.
        "Antídotos do coma: glicose 50% se hipoglicemia; tiamina 100 mg IV (etilista/desnutrido); naloxona se depressão respiratória com miose — ⚠️ a dose depende da PROCEDÊNCIA do opioide, e o regime está no passo da toxíndrome opioide. ⚠️ E A DURAÇÃO DECIDE A VIGILÂNCIA: a meia-vida da naloxona é MENOR que a da maioria dos opioides, a depressão respiratória PODE VOLTAR depois de o paciente já ter acordado, e vigiar por horas — não por minutos — faz parte da prescrição.",
        "Temperatura: hipertermia grave (> 39–40 °C) exige resfriamento agressivo — é fator de mortalidade.",
        "Coletar: eletrólitos, função renal/hepática, gasometria com lactato, ânion gap, osmolaridade, paracetamol e salicilato, β-hCG.",
        "Contatar o Centro de Informação Toxicológica (CIATox/CEATOX) da sua região — orientação especializada em tempo real.",
        "ECG de 12 derivações em TODOS: QRS alargado indica bloqueio de canal de sódio (tricíclico, cocaína, carbamazepina); QT prolongado indica bloqueio do efluxo de potássio.",
        "RX de tórax/abdome pode revelar substância radiopaca: sais de cálcio, potássio e sódio, metais pesados, lítio, compostos iodados, salicilatos, cápsulas revestidas e pacotes de droga.",
        "⚠️ NÃO pedir triagem toxicológica ampla de rotina — não muda desfecho e é pouco custo-efetiva. Reservar para caso grave de etiologia incerta ou com implicação legal.",
        "Descontaminação cutânea: retirar toda a roupa, lavar com água corrente abundante e sabão, guardar a roupa em saco plástico; equipe com luvas e avental.",
        "Descontaminação ocular: lavagem com soro fisiológico, EVERTENDO a pálpebra para lavar por completo.",
        "Agitação e convulsão: tratar com benzodiazepínico, evitando fármacos que baixem o limiar convulsivo.",
        "Taquiarritmia ventricular na intoxicação: BICARBONATO de sódio 1–2 mEq/kg é a primeira escolha, e EVITAR amiodarona — cocaína, tricíclicos e carbamazepina bloqueiam o canal de SÓDIO rápido, e a amiodarona também o bloqueia (além de prolongar o QT).",
        "Antes de fechar o diagnóstico em intoxicação, descartar o que imita coma tóxico: trauma/TCE (procurar estigmas, anisocoria, déficit motor), hipoxemia, hipotermia, hipoglicemia, AVC, infecção do SNC e distúrbio metabólico.",
      ],
      next: "identificar",
    },

    // ── O NÓ MAIS DENSO DE DECISÃO DO APP, E POR QUÊ ──────────────────────
    //
    // ⚠️ MEDIDO ANTES DE ESCREVER, E O NÚMERO FICA AQUI PARA QUE NINGUÉM
    // "OTIMIZE" DEPOIS SEM SABER O QUE ESTÁ CORTANDO (molde do nó do AVC):
    //
    //   nós de decisão do app · mediana 171 · p90 543 · maior anterior 760
    //   este nó              · 76 (título+pergunta) + 636 (rótulos) + 256
    //                          (summary) = 970 caracteres visíveis
    //
    // O que autoriza o excesso: 636 dos 970 são RÓTULOS, lidos em varredura
    // vertical — uma linha por opção, não prosa. A prosa contínua fica em 332,
    // dentro do p90 (543). Cortar rótulo aqui não é enxugar: é tirar do médico
    // o sinal pelo qual ele reconhece o quadro.
    //
    // Números conferidos por `node scripts/mede-densidade.cjs` DEPOIS de
    // escrever, não estimados antes — a primeira versão deste comentário dizia
    // 968/626 e estava errada.
    //
    // ── O DEFEITO QUE ORIGINOU (2026-08-17) ───────────────────────────────
    //
    // A medição de densidade confirmou Intoxicações como o pior módulo nos DOIS
    // eixos: pior mediana (1269), pior p90 (5614), pior máximo (6179) e o nó
    // com mais opções do app (11, aqui). Mas o defeito não era falta de
    // conteúdo — os sinais discriminantes JÁ ESTAVAM nos rótulos.
    //
    // Eram três defeitos de FORMA:
    //
    //   1. o nó não tinha `summary`. O visível era título + pergunta + os 11
    //      rótulos, e nada dizia ONDE PROCURAR o "conjunto de sinais" que a
    //      pergunta pede;
    //   2. o método de procurar estava em `evidence`, que renderiza RECOLHIDO
    //      atrás do "Ver critérios" — R-75 no nó exato em que a pergunta é
    //      feita;
    //   3. ⚠️ O NOME VINHA PRIMEIRO nos 11 rótulos. Quem não domina
    //      "simpaticomimético" batia na palavra desconhecida e parava ANTES de
    //      chegar aos sinais, que vinham logo depois. É o R-70 aplicado à
    //      opção em vez de à saída de dúvida: o rótulo na voz de quem chega.
    identificar: {
      id: "identificar",
      type: "decision",
      title: "Identificar a síndrome tóxica (toxidrome)",
      question: "Qual conjunto de sinais predomina?",
      // ⚠️ A SEGUNDA SENTENÇA CITA SÓ O PAR DA PUPILA, e a razão é a inversão
      // dos rótulos abaixo: com "pele SECA" e "pele ÚMIDA" escritos na mesma
      // família de palavras, o par anticolinérgico × simpaticomimético passou a
      // se ler na varredura vertical, e repeti-lo aqui seria redundância.
      // Já "miose" × "sinais vitais preservados" NÃO se lê como contraste de
      // pupila — ali a frase ainda faz trabalho.
      summary:
        "ONDE PROCURAR, ANTES DE NOMEAR: pupilas (miose ou midríase), pele (seca ou úmida), secreções (salivação, broncorreia), ruídos hidroaéreos, temperatura, frequência cardíaca e nível de consciência. ⚠️ OPIOIDE E SEDATIVO se separam por um sinal só — a PUPILA.",
      // ── O GANHO QUE NÃO ESTAVA NO PLANO ───────────────────────────────────
      //
      // O método de examinar SUBIU para o summary. Fica aqui o enquadramento
      // (que não muda o que se faz agora) e o paracetamol — que já é AÇÃO
      // aberta no `agente_desconhecido`, e subir de novo seria duplicar.
      //
      // ⚠️ E TIRAR UM ITEM ABRIU OS OUTROS DOIS. O `ListaDeCriterios` recolhe
      // por CONTAGEM: `const curta = itens.length <= 2` — três ou mais itens
      // ganham o "Ver critérios (N)", dois ou menos ficam abertos.
      //
      // Provado por execução, nos dois estados:
      //   3 itens → "Ver critérios (3)" presente, método INVISÍVEL
      //   2 itens → sem botão, as duas linhas VISÍVEIS
      //
      // Então subir o método não só o trouxe à superfície: trouxe junto o
      // enquadramento e o paracetamol, que continuavam escondidos.
      //
      // ⚠️ E ISSO É UMA REGRA DE ORÇAMENTO QUE VALE PARA TODO O APP: o
      // TERCEIRO item de `evidence` é o que esconde os outros dois. Quem
      // acrescentar um item aqui recolhe a lista inteira sem perceber.
      evidence: [
        "A toxidrome orienta o tratamento mesmo sem saber a substância exata.",
        "Sempre dosar PARACETAMOL — intoxicação silenciosa e com antídoto tempo-dependente.",
      ],
      // ── SINAL PRIMEIRO, NOME DEPOIS ───────────────────────────────────────
      // Quem domina o nome continua achando — ele está na linha, em caixa alta,
      // no fim. Quem não domina deixa de bater numa palavra que o faz parar.
      //
      // ⚠️ E "pele SECA" × "pele ÚMIDA" É DISCRIMINAÇÃO, NÃO ESTILO: antes eram
      // "pele seca" e "sudorese", palavras de famílias diferentes, e o leitor
      // precisava saber que eram o mesmo eixo para comparar.
      options: [
        { id: "opioide", label: "Miose, bradipneia, coma — OPIOIDE", next: "tox_opioide" },
        { id: "colinergico", label: "Sialorreia, broncorreia, miose, bradicardia — COLINÉRGICO", next: "tox_colinergico" },
        { id: "anticolinergico", label: "Midríase, pele SECA, delirium, taquicardia — ANTICOLINÉRGICO", next: "tox_anticolinergico" },
        { id: "simpaticomimetico", label: "Agitação, midríase, pele ÚMIDA, hipertermia — SIMPATICOMIMÉTICO", next: "tox_simpatico" },
        { id: "sedativo", label: "Rebaixamento com sinais vitais preservados — SEDATIVO/HIPNÓTICO", next: "tox_sedativo" },
        { id: "serotoninergico", label: "Clonus, hiperreflexia, hipertermia, agitação — SEROTONINÉRGICO", next: "tox_serotoninergico" },
        { id: "alucinogeno", label: "Alucinações, distorção sensorial, nistagmo — ALUCINÓGENO", next: "tox_alucinogeno" },
        { id: "alcool_toxico", label: "Alteração visual e gap osmolar — ÁLCOOL TÓXICO (metanol, etilenoglicol)", next: "tox_alcool_toxico" },
        { id: "anestesico_local", label: "Convulsão ou colapso após bloqueio/infiltração — ANESTÉSICO LOCAL (LAST)", next: "tox_last" },
        // ── UM RÓTULO, DOIS ESTADOS EPISTÊMICOS OPOSTOS ────────────────────
        // "Indefinido / substância conhecida" somava "não faço ideia do que é"
        // com "sei exatamente qual substância". Nenhum dos dois recebia
        // conduta própria, e o médico sem toxidrome definida — que é a maior
        // parte dos casos reais — caía direto na descontaminação sem que
        // ninguém lhe dissesse o que fazer enquanto não sabe.
        //
        // É o R-48 refinado na direção INVERSA à do abdome agudo: lá SOBRAVA
        // conteúdo no nó do "não sei"; aqui o nó não existia.
        //
        // ⚠️ E OS DOIS RÓTULOS PERDERAM A PALAVRA "TOXIDROME". Quem não sabe o
        // que ela significa também não sabe dizer se o quadro "tem toxidrome
        // definida" — a porta existia e estava escrita na língua de quem já
        // sabe. Agora perguntam pelo que o médico consegue responder: os
        // quadros acima batem, ou não batem?
        { id: "sei_a_substancia", label: "Sei qual substância — só não reconheci o quadro", next: "descontaminacao" },
        { id: "nao_sei", label: "Nenhum destes quadros bate — NÃO SEI DIZER", next: "agente_desconhecido" },
      ],
    },

    tox_opioide: {
      id: "tox_opioide",
      type: "action",
      title: "Toxidrome opioide",
      summary: "Tríade: rebaixamento + miose puntiforme + depressão respiratória.",
      actions: [
        NALOXONA_PROCEDENCIA_DECIDE,
        NALOXONA_DOSE_ALTA_DESCONHECIDO,
        NALOXONA_TITULADA_IATROGENICA,
        NALOXONA_VIGILANCIA_APOS_REVERSAO,
        // ⚠️ `ANTIDOTO_NAO_CRUZA_DE_CLASSE` saiu daqui: é regra de intoxicação
        // MISTA e vive uma vez, no nó `antidoto`, apontada abaixo.
        "⚠️ SE A REVERSÃO FOR PARCIAL, pense em COINGESTÃO — a regra de que cada antídoto reverte uma classe só está no passo dos antídotos específicos.",
        "Titular para restaurar a VENTILAÇÃO, evitando abstinência aguda em usuário crônico (agitação, edema pulmonar).",
        "A meia-vida da naloxona é MENOR que a da maioria dos opioides — a depressão respiratória PODE VOLTAR depois de o paciente já ter acordado. Vigiar por horas, não por minutos.",
        "INFUSÃO CONTÍNUA quando houver recorrência ou opioide de ação longa: dose por hora = DOIS TERÇOS da dose total que reverteu a ventilação. Ex.: reverteu com 1,2 mg → 0,8 mg/h. Titular pela frequência respiratória, não pelo nível de consciência.",
        "Ventilar com bolsa-válvula-máscara enquanto a naloxona não age.",
        "Atenção a opioides de ação longa (metadona) e a fentanil/análogos (podem exigir doses altas).",
      ],
      next: "descontaminacao",
    },

    // ── O NÓ QUE O LEVANTAMENTO DE DENSIDADE APONTOU ──────────────────────
    //
    // Tinha 718 caracteres — um sexto do nó do opioide — para a intoxicação
    // que, no Brasil, é comum ("chumbinho") e mata por broncorreia. O destino
    // curto correspondia a risco alto, não a assunto simples, e ⚠️ É O ÚNICO
    // DOS CINCO EM QUE SUBDOSAR É O ERRO ESPERADO de quem não faz isso com
    // frequência.
    //
    // ── FONTE ABERTA EM SESSÃO (2026-08-17) ───────────────────────────────
    //
    // Diretrizes Brasileiras para Diagnóstico e Tratamento de Intoxicações por
    // Agrotóxicos — Conitec/Ministério da Saúde, 2018 (PDF de 206 páginas,
    // baixado e lido; capítulo de inibidores de colinesterase).
    //
    // ⚠️ É DE 2018 — OITO ANOS. Sinalizado como possivelmente desatualizada.
    //
    // ── O QUE A FONTE CORRIGIU AQUI ───────────────────────────────────────
    //
    // O app dizia: "Endpoint da atropinização é a AUSCULTA PULMONAR LIMPA —
    // NÃO a frequência cardíaca nem a pupila."
    //
    // A diretriz define atropinização por TRÊS critérios: "frequência cardíaca
    // acima de 80 bpm; pressão arterial sistólica acima de 80 mmHg; ausculta
    // pulmonar limpa". O app negava um deles.
    //
    // ⚠️ O QUE A FRASE VELHA QUERIA DIZER É VERDADEIRO E ESTAVA MAL FORMULADO:
    // taquicardia não é motivo para PARAR a atropina. Mas FC > 80 é PARTE do
    // alvo, não o contrário dele. Agora o PISO (o alvo) e o TETO (a toxicidade)
    // são frases separadas, porque são coisas separadas.
    //
    // Sobre a PUPILA a fonte concorda, e dá a razão: "a reversão da constrição
    // pupilar pode ser um efeito tardio […] não deve ser usada para determinar
    // a continuidade ou não da administração da atropina."
    //
    // ── E O QUE A TRAVA IMPEDIU DE ENTRAR ─────────────────────────────────
    //
    // ⚠️ A DOSE PEDIÁTRICA DA FONTE (0,01–0,06 mg/kg/dose, a cada 5–15 min)
    // FOI ESCRITA E DEPOIS REMOVIDA — `test:escopo-pediatrico` a reprovou, e
    // com razão. Seria o NONO fragmento pediátrico avulso, e chegaria pela
    // via de sempre: uma fonte que cita as duas populações, e o número
    // pediátrico copiado junto sem virar trilha.
    //
    // PD-2 já decidiu: população ADULTA, ausência DECLARADA pelo ponteiro,
    // reversível — mas com infraestrutura própria (peso, faixas de sinais
    // vitais, calculadoras), não fragmento por fragmento outra vez.
    // ── COLINÉRGICO — TRILHA, E O CICLO É UMA REAVALIAÇÃO ───────────────────
    //
    // Segundo protocolo dentro de um nó (o primeiro foi o LAST). 3.658 caracteres,
    // com fases, decisões e prazos. Mesma forma, PD-8: sub-fluxo, não módulo —
    // chega-se por toxíndrome, não pela porta.
    //
    // ⚠️ E A FORMA NÃO É IDÊNTICA À DO LAST. O LAST tem uma dose e um teto; aqui há
    // um CICLO que se repete DOBRANDO a cada 5 minutos até três sinais. Antes de
    // inventar forma nova, o precedente do app:
    //
    //   · o ACLS NÃO faz laço — o reducer ENUMERA (`choque_1, rcp_1, choque_2,
    //     rcp_2, choque_3, rcp_3`), porque o número de ciclos é conhecido;
    //   · as Convulsões usam `reavaliar_1` / `reavaliar_2` entre as escalas, cada
    //     uma com "cessou → saída" e "persiste → próximo passo";
    //   · aresta de VOLTA só existe na eclâmpsia, e é cruzada, não cíclica.
    //
    // Aqui não dá para enumerar: o texto diz que NÃO EXISTE DOSE MÁXIMA — o limite
    // não é um número, é o aparecimento de toxicidade POR atropina. Então o ciclo
    // vira o que o app já faz nas Convulsões: uma REAVALIAÇÃO, com a diferença de
    // que uma das saídas volta ao mesmo passo. O laço fica explícito como decisão,
    // e não escondido numa instrução dentro de um parágrafo.
    tox_colinergico: {
      id: "tox_colinergico",
      type: "action",
      title: "Toxidrome colinérgica — proteja a equipe e comece a atropina",
      summary:
        "DUMBELS / broncorreia é a causa de morte — atropinizar até secar secreções. ⚠️ NÃO EXISTE DOSE MÁXIMA DE ATROPINA: o limite não é um número, é o aparecimento de toxicidade por atropina. Subdosar é o erro esperado de quem não faz isso com frequência.",
      actions: [
        "EPI para a equipe e DESCONTAMINAÇÃO EXTERNA (retirar roupas, lavar pele/cabelos) — risco de contaminação secundária.",
        "ATAQUE: atropina 0,6 a 3 mg IV, rápido. DOBRAR a dose a cada 5 minutos até atropinizar — dobrar, não repetir a mesma dose. No ensaio que sustenta o regime incremental, ele atropinizou em 24 min contra 152 min do esquema em bolus fixo, com menor mortalidade e MENOS toxicidade por atropina.",
      ],
      next: "coli_alvo",
    },

    coli_alvo: {
      id: "coli_alvo",
      type: "decision",
      // ⚠️ É AQUI QUE O CICLO VIVE, e ele é uma PERGUNTA, não uma instrução dentro
      // de um parágrafo. A cada 5 minutos o médico volta a esta tela.
      title: "Atropinizou? — as três coisas ao mesmo tempo",
      // ⚠️ "AUSCULTA PULMONAR LIMPA", com a palavra inteira — eu havia encurtado para
      // "AUSCULTA LIMPA" e a trava pegou. Encurtar rótulo clínico é encostar no
      // conteúdo, e este bloco foi reescrito com fonte há poucos dias.
      question:
        "AUSCULTA PULMONAR LIMPA (sem sibilos nem crepitações), FREQUÊNCIA CARDÍACA ACIMA DE 80 bpm e PRESSÃO SISTÓLICA ACIMA DE 80 mmHg — as três estão presentes?",
      summary:
        "⚠️ SÓ SE PARA QUANDO AS TRÊS ESTÃO PRESENTES. As AXILAS SECAS ajudam a confirmar — a transpiração é dos primeiros sinais a reverter. Enquanto houver secreção, o paciente ainda NÃO está atropinizado.",
      evidence: [
        "⚠️ TAQUICARDIA ISOLADA NÃO INTERROMPE A ATROPINIZAÇÃO — ela é esperada e faz parte do alvo. A toxicidade POR atropina se reconhece por outro conjunto: PERISTALSE AUSENTE, HIPERTERMIA, DELÍRIO e RETENÇÃO URINÁRIA, com taquicardia GRAVE.",
        "E A PUPILA NÃO SERVE DE GUIA: a midríase pode demorar a aparecer, e a miose pode persistir por exposição ocular direta — sobretudo se for de um olho só. Não use a pupila para decidir se continua ou para a atropina.",
      ],
      options: [
        { id: "coli_sim", label: "SIM — as três presentes", next: "coli_manutencao" },
        // ⚠️ A VOLTA AO MESMO PASSO É O CICLO. Não é erro de roteamento: é
        // "dobre de novo e reavalie em 5 min", que é o regime.
        { id: "coli_nao", label: "NÃO — ainda secretando, ou falta alguma das três", next: "tox_colinergico" },
        { id: "coli_toxico", label: "Peristalse ausente, hipertermia, delírio ou retenção urinária", next: "coli_toxicidade" },
      ],
    },

    coli_toxicidade: {
      id: "coli_toxicidade",
      type: "action",
      title: "Toxicidade POR atropina — outro conjunto de sinais",
      summary: "⚠️ Não confunda com o alvo: taquicardia isolada faz parte da atropinização; este conjunto, não.",
      actions: [
        "PERISTALSE AUSENTE, HIPERTERMIA, DELÍRIO e RETENÇÃO URINÁRIA, com taquicardia GRAVE — suspender ou reduzir a atropina e reavaliar.",
        "⚠️ E CONFIRA ANTES DE PARAR: enquanto houver secreção, o paciente ainda não está atropinizado. Secreção presente COM estes sinais é quadro misto, e o julgamento é à beira do leito.",
      ],
      next: "coli_manutencao",
    },

    coli_manutencao: {
      id: "coli_manutencao",
      type: "action",
      title: "Manutenção — o que decide as horas seguintes",
      summary:
        "Infusão contínua de 10 a 20% da DOSE TOTAL que foi necessária para atropinizar, POR HORA, em salina 0,9%. Some quanto gastou até aqui — esse número é a base do cálculo.",
      actions: [
        "⚠️ E SE OS SINAIS COLINÉRGICOS VOLTAREM a qualquer momento: recomeçar os BOLUS até atropinizar de novo E aumentar a taxa de infusão em 20% por hora. Voltar a secretar não é falha do plano — é o plano pedindo mais dose.",
        // ⚠️ A PRALIDOXIMA FICA AQUI, E NÃO VIROU FASE — decisão PARALELA e
        // controversa, com as três posições. Enterrá-la numa etapa da trilha a
        // transformaria em passo obrigatório, que é o oposto do que se decidiu:
        // a ATROPINA é o tratamento e não depende desta decisão.
        PRALIDOXIMA_TRES_POSICOES,
        PRALIDOXIMA_O_QUE_FAZER,
        "Convulsões: benzodiazepínico (diazepam/midazolam).",
        "Evitar succinilcolina na intubação (bloqueio prolongado pela inibição da colinesterase).",
      ],
      next: "descontaminacao",
    },

    tox_anticolinergico: {
      id: "tox_anticolinergico",
      type: "action",
      title: "Toxidrome anticolinérgica",
      summary: "'Louco, seco, quente, vermelho e cego' — delirium com pele seca.",
      actions: [
        "Suporte: benzodiazepínico para agitação; resfriamento ativo se hipertermia.",
        "ECG obrigatório: se QRS > 100 ms (antidepressivo tricíclico) → bicarbonato de sódio 1–2 mEq/kg IV em bolus, repetir até estreitar o QRS.",
        "Fisostigmina 1–2 mg IV lento (em 5 min) apenas em delirium anticolinérgico PURO e com ECG normal — ter atropina pronta (risco de bradicardia/convulsão).",
        "CONTRAINDICADA a fisostigmina se houver suspeita de tricíclico (QRS alargado) — risco de assistolia.",
        "Sondagem vesical (retenção urinária é regra) e monitorização contínua.",
      ],
      next: "descontaminacao",
    },

    tox_simpatico: {
      id: "tox_simpatico",
      type: "action",
      title: "Toxidrome simpaticomimética (cocaína, anfetaminas)",
      // ⚠️ "SUDOREBA" não é palavra — e a linha que carregava o erro é justamente
      // a que discrimina as duas toxidromes mais confundidas. O espanhol estava
      // certo ("piel SUDOROSA"), o que confirma a intenção.
      //
      // A frase nova diz o CONTRASTE, não só o lado de cá: discriminar exige os
      // dois termos na mesma linha, senão quem lê guarda "úmida" sem ter contra
      // o que comparar.
      summary:
        "Diferencia-se da anticolinérgica pela pele ÚMIDA (sudorese) — na anticolinérgica a pele é SECA.",
      actions: [
        "BENZODIAZEPÍNICO é o tratamento de base — controla agitação, hipertensão, taquicardia e reduz a hipertermia.",
        "Hipertermia grave: resfriamento agressivo imediato (é a principal causa de morte).",
        "EVITAR betabloqueador isolado na cocaína (estimulação alfa sem oposição) — preferir benzodiazepínico e vasodilatador (nitrato/nitroprussiato).",
        "Dor torácica por cocaína: benzodiazepínico + nitrato + AAS; ECG seriado (risco de infarto e dissecção).",
        "Hidratação e vigilância de rabdomiólise (CPK, função renal) e convulsões.",
      ],
      next: "descontaminacao",
    },

    tox_sedativo: {
      id: "tox_sedativo",
      type: "action",
      title: "Toxidrome sedativo-hipnótica",
      summary: "Rebaixamento com sinais vitais relativamente preservados. Suporte é a regra.",
      actions: [
        "Suporte ventilatório — a maioria evolui bem apenas com proteção de via aérea e observação.",
        FLUMAZENIL_APRESENTACAO,
        "Flumazenil 0,2 mg IV em 15 s; se não responder, 0,3 mg e depois 0,5 mg a cada minuto. Teto cumulativo de 3 mg na superdosagem (o teto de 1 mg é o da reversão de sedação consciente). Uso EXCEPCIONAL.",
        FLUMAZENIL_RESSEDACAO,
        FLUMAZENIL_NAO_USAR,
        // ⚠️ `ANTIDOTO_NAO_CRUZA_DE_CLASSE` saiu daqui pelo mesmo motivo do
        // `tox_opioide`: é regra de intoxicação MISTA e vive uma vez, no nó
        // `antidoto`. A ponte abaixo é a versão curta que decide conduta.
        "⚠️ SE O FLUMAZENIL NÃO REVERTER, pense em COINGESTÃO — a regra de que cada antídoto reverte uma classe só está no passo dos antídotos específicos.",
        "Álcool: descartar hipoglicemia, trauma craniano associado e abstinência; repor tiamina.",
        "Reavaliar se o rebaixamento for desproporcional ou não melhorar — buscar coingestão e causas estruturais.",
      ],
      next: "descontaminacao",
    },

    tox_serotoninergico: {
      id: "tox_serotoninergico",
      type: "action",
      title: "Toxíndrome serotoninérgica",
      summary: "O que a separa da simpaticomimética é o CLONUS — sobretudo o de tornozelo e o ocular.",
      actions: [
        "Reconhecer: agitação e confusão, hipertermia, taquicardia, taquipneia, hipertensão, midríase, pele úmida, hiperreflexia, clonus (inclusive ocular), tremor e diarreia.",
        "Etiologias: ISRS e duais, inibidores da MAO, tricíclicos, dextrometorfano, meperidina, tramadol, linezolida, triptanos e associações entre eles.",
        "SUSPENDER imediatamente todos os agentes serotoninérgicos — é a medida que mais muda o curso.",
        "BENZODIAZEPÍNICO para agitação, rigidez e controle autonômico; hidratação e resfriamento ativo na hipertermia.",
        "Hipertermia grave com rigidez: sedação profunda, intubação e BLOQUEIO NEUROMUSCULAR não despolarizante — a rigidez muscular é o motor da hipertermia. Evitar succinilcolina (rabdomiólise/hipercalemia).",
        "NÃO usar antipirético — a hipertermia é de origem muscular, não hipotalâmica.",
        "Ciproeptadina 12 mg VO/SNG, depois 2 mg a cada 2 h enquanto persistirem os sintomas, com manutenção de 8 mg 6/6 h — antagonista serotoninérgico, quando o suporte não basta.",
        "Diferencial: síndrome neuroléptica maligna (instalação em dias, rigidez em cano de chumbo, SEM clonus) e toxíndrome anticolinérgica (pele SECA, sem clonus, ruídos hidroaéreos diminuídos).",
      ],
      next: "descontaminacao",
    },

    tox_alucinogeno: {
      id: "tox_alucinogeno",
      type: "action",
      title: "Toxíndrome alucinógena",
      summary: "Alucinações e distorção sensorial com sinais vitais que podem estar normais.",
      actions: [
        "Reconhecer: alucinações, distorções sensoriais, despersonalização, sinestesia e agitação; pupilas dilatadas ou normais; nistagmo é achado típico (sobretudo com quetamina e fenciclidina).",
        "Etiologias: LSD, MDMA, quetamina, mescalina, psilocibina (cogumelos).",
        "Suporte é a regra: ambiente calmo, com pouco estímulo, e reorientação verbal.",
        "BENZODIAZEPÍNICO para agitação — evitar antipsicótico como primeira escolha (baixa o limiar convulsivo e prejudica a termorregulação).",
        "MDMA: vigiar hipertermia, rabdomiólise e HIPONATREMIA por excesso de água livre — dosar sódio antes de hidratar em volume.",
        "Sinais vitais podem estar normais; a deterioração costuma vir de hipertermia, trauma durante a agitação ou coingestão.",
      ],
      next: "descontaminacao",
    },

    tox_alcool_toxico: {
      id: "tox_alcool_toxico",
      type: "action",
      title: "Álcool tóxico — metanol / etilenoglicol",
      summary: "Acidose com ânion gap alto + gap osmolar alto. Carvão ativado não tem papel em metanol/etilenoglicol. Lavagem gástrica não é recomendada rotineiramente; benefício não demonstrado.",
      actions: [
        "Suspeitar após ingestão de bebida de procedência duvidosa, álcool combustível, solvente ou fluido de limpador de para-brisa — e nas tentativas de suicídio.",
        "Janela dos sintomas no metanol — até 6 h: sonolência, ataxia, tontura, dor abdominal, náuseas, vômitos, cefaleia, confusão, taquicardia e hipotensão. Entre 6 e 24 h: visão turva, fotofobia, escotomas, midríase, perda da visão de cores, convulsões, coma e acidose grave.",
        "O metanol é convertido em ÁCIDO FÓRMICO — a gravidade costuma aparecer a partir de 12 h da ingesta, não no primeiro atendimento.",
        "Calcular sempre os três: ânion gap = Na⁺ − (HCO₃⁻ + Cl⁻); osmolalidade estimada = (2 × Na⁺) + (ureia/6) + (glicose/18); gap osmolar = osmolalidade medida − estimada.",
        "Critério diagnóstico com exposição e quadro compatível: 2 dos 3 — pH < 7,35, ânion gap > 16, gap osmolar > 10. Achado de neuroimagem (hemorragia de gânglios da base ou necrose de putâmen) reforça a suspeita.",
        "⚠️ NÃO fazer lavagem gástrica nem carvão ativado — a absorção é rápida e o álcool não é adsorvido pelo carvão.",
        "Garantir euvolemia com cristaloide; corrigir os demais distúrbios eletrolíticos.",
        "Acidose com pH < 7,35: bicarbonato de sódio 8,4% 1–2 mEq/kg IV em bólus, com a meta de manter o pH acima de 7,35.",
        "NÃO aguardar a dosagem do tóxico para tratar — o resultado demora e a janela terapêutica não espera.",
        "Sintoma visual: avaliação oftalmológica. Rebaixamento de consciência: TC ou RM de crânio.",
        "Notificação COMPULSÓRIA no SINAN (CID T51.1 para metanol); em tentativa de suicídio, notificar também violência.",
      ],
      next: "alcool_toxico_antidoto",
    },

    alcool_toxico_antidoto: {
      id: "alcool_toxico_antidoto",
      type: "action",
      title: "Álcool tóxico — antídoto e diálise",
      summary: "Bloquear a álcool-desidrogenase antes que o tóxico vire ácido.",
      actions: [
        "Indicação do antídoto: paciente sintomático com exposição ou alta suspeição e pelo menos 2 dos 3 — pH < 7,35, ânion gap > 16, gap osmolar > 10.",
        "FOMEPIZOL (primeira escolha onde disponível): ataque 15 mg/kg IV em 30 min → 10 mg/kg a cada 12 h por 4 doses → depois 15 mg/kg a cada 12 h enquanto persistir a intoxicação. Durante hemodiálise, redosar ao fim da sessão.",
        "ETANOL (antídoto disponível no Brasil): preparar solução a 10% — 100 mL de etanol absoluto + 900 mL de soro glicosado 5%.",
        "Etanol IV — ataque 10 mL/kg da solução a 10% em 1 h; manutenção 1 mL/kg/h. Etilista crônico: 1,5 mL/kg/h. Em hemodiálise: 2,5–3,5 mL/kg/h.",
        "Alvo do etanol: etanolemia entre 100 e 150 mg/dL, com dosagem a cada 6–8 h.",
        "Sem etanol absoluto: destilado de boa procedência (40–50%) por sonda, em solução a 20% — ataque 5 mL/kg em 1 h, manutenção 0,5 mL/kg/h.",
        "ÁCIDO FOLÍNICO (leucovorina) 50 mg IV em 30 min a cada 6 h no metanol — acelera a degradação do ácido fórmico. Sem folínico, usar ácido fólico.",
        "HEMODIÁLISE se: pH < 7,25, acidose persistente apesar do antídoto, ânion gap > 24, alteração visual refratária, distúrbio eletrolítico refratário, instabilidade hemodinâmica ou urgência dialítica. Preferir hemodiálise intermitente.",
        "Suspender o antídoto quando houver melhora clínica, resolução da acidose e ânion gap < 16 — mantendo gasometria a cada 4 h e exames a cada 8 h nas 24 h seguintes.",
      ],
      next: "eliminacao",
    },

    // ── LAST — a D-29, fechada ────────────────────────────────────────────
    //
    // Nó PRÓPRIO, e não linha na tabela de antídotos, porque a conduta tem
    // ordem, tem o que evitar e tem uma regra do módulo que se INVERTE aqui
    // (amiodarona). Conteúdo em lib/last-emulsao-lipidica.ts, com as fontes.
    // ── LAST — TRILHA, NÃO PARÁGRAFO (PD-8) ─────────────────────────────────
    //
    // ⚠️ O DEFEITO QUE ORIGINOU (2026-08-17): `tox_last` era UM nó de 6.179
    // caracteres e 63 frases — o maior do app, e com ZERO repetição interna. Isso
    // não é nó denso: é um PROTOCOLO INTEIRO servido como parágrafo. Tem fases
    // sequenciais, decisões internas e prazos, que é assinatura de fluxo.
    //
    // PD-8 decidiu que ele é SUB-FLUXO das Intoxicações, não módulo: ninguém abre
    // o app pensando "LAST" — chega-se por deterioração súbita ou agente
    // desconhecido, que são portas deste módulo.
    //
    // ── O CORTE, e ele NÃO é 3+3 ────────────────────────────────────────────
    //
    // A medição das seis fases mostrou onde caem as decisões:
    //
    //   1 reconhecer      1332 ch   0 decisões
    //   2 ajuda + CEC      449 ch   0 decisões
    //   3 emulsão          786 ch   3 decisões · 3 prazos  ← a mais densa em
    //   4 propofol         832 ch   0 decisões               decisão por caractere
    //   5 ressuscitação   1595 ch   2 decisões               do protocolo inteiro
    //   6 vigilância       819 ch   0 decisões · 2 prazos
    //
    // As fases 4 e 5 não são "estado sustentado": são CONTINGENTES À PARADA. Quem
    // estabilizou com a emulsão e não parou nunca precisa delas. Por isso o corte
    // é uma DECISÃO ("está em parada ou convulsionando?"), não a metade da lista.
    tox_last: {
      id: "tox_last",
      type: "action",
      // ⚠️ A FASE 2 NÃO É UM PASSO DE LEITURA — É AÇÃO PARALELA, e por isso está
      // AQUI, junto do reconhecimento, e não numa tela depois.
      //
      // A própria constante diz "no MESMO MOMENTO" e "pegue o kit enquanto isso".
      // A ASRA subiu o aviso à equipe de CEC para o alto do checklist porque
      // montar circuito leva tempo que não existe depois do colapso — transformar
      // isso numa tela seguinte inverteria o motivo de ele ter subido.
      title: "LAST — reconhecer e disparar a ajuda ao mesmo tempo",
      summary:
        "⚠️ ACIONE A EQUIPE DE CIRCULAÇÃO EXTRACORPÓREA AGORA, enquanto reconhece — montar o circuito leva tempo que não existe depois do colapso. Acionar cedo e cancelar é barato; descobrir tarde que era necessário não tem conserto.",
      actions: [
        // a ação primeiro, o reconhecimento depois: é o que se dispara já
        LAST_CHAMAR_AJUDA_E_CEC,
        LAST_RECONHECER,
        LAST_NAO_E_SO_DURANTE_A_INJECAO,
      ],
      next: "last_emulsao",
    },

    last_emulsao: {
      id: "last_emulsao",
      type: "action",
      title: "Emulsão lipídica 20% — o antídoto, agora",
      // ⚠️ A TELA MAIS LIMPA DAS SEIS, DE PROPÓSITO. É a fase mais densa em
      // DECISÃO por caractere do protocolo (3 decisões e 3 prazos em 786 ch), e é
      // onde o médico AGE. Tudo o que não é a dose saiu daqui.
      summary:
        "Ao PRIMEIRO SINAL de evento grave — não se espera a parada. Sem diluir, direto do frasco, e a dose se prescreve em MILILITROS.",
      // ⚠️ DOIS ITENS, e nada mais. Tentei pôr o aviso do propofol em `evidence`
      // para deixar a dose sozinha — `ActionNode` NÃO TEM `evidence` (C2: os campos
      // visíveis dependem do TIPO do nó), e o `tsc` recusou.
      //
      // Fica em `actions`, logo abaixo da dose, que é onde a confusão nasce: o
      // propofol é branco, tem veículo lipídico e está na sala. A tela continua
      // sendo a mais limpa do protocolo — dois itens contra os NOVE que este nó
      // tinha antes.
      actions: [LAST_EMULSAO_DOSE, LAST_PROPOFOL_NAO_SUBSTITUI],
      next: "last_parada",
    },

    last_parada: {
      id: "last_parada",
      type: "decision",
      title: "Depois da emulsão — onde o paciente está",
      question: "O paciente está em PARADA ou CONVULSIONANDO?",
      summary:
        "⚠️ A ressuscitação do LAST é DIFERENTE do ACLS padrão, e a diferença só importa para quem parou. Quem estabilizou vai direto para a vigilância — que também não é opcional.",
      options: [
        { id: "last_sim", label: "SIM — parada, arritmia grave ou convulsão em curso", next: "last_ressuscitacao" },
        { id: "last_nao", label: "NÃO — estabilizou com a emulsão", next: "last_vigilancia" },
      ],
    },

    last_ressuscitacao: {
      id: "last_ressuscitacao",
      type: "action",
      title: "Ressuscitação modificada — o ACLS padrão não serve aqui",
      summary:
        "⚠️ Se a parada por LAST for conduzida como ACLS de rotina, o tratamento que funciona não é dado e alguns dos que se dariam PIORAM o quadro.",
      actions: [LAST_RCP_E_DIFERENTE, LAST_O_QUE_EVITAR, LAST_AMIODARONA_E_A_EXCECAO],
      next: "last_vigilancia",
    },

    last_vigilancia: {
      id: "last_vigilancia",
      type: "action",
      // ⚠️ A ÚNICA FASE DE ESTADO SUSTENTADO — e a única que os dois ramos
      // compartilham. Quem parou chega aqui depois; quem não parou, direto.
      title: "Depois de estabilizar — a vigilância continua",
      summary:
        "Por HORAS, não por minutos: a recorrência depois da melhora está descrita, e o anestésico local continua sendo liberado do tecido.",
      actions: [LAST_DEPOIS_QUE_ESTABILIZA],
      next: "uti",
    },

    // ── O AGENTE DESCONHECIDO — o nó que faltava ──────────────────────────
    //
    // O que se faz sem saber o agente é MUITO, e nada disso dependia de saber:
    // o suporte é o mesmo, a coleta é a mesma, e o que muda o desfecho na
    // primeira hora é a estabilização, não o nome do veneno.
    agente_desconhecido: {
      id: "agente_desconhecido",
      type: "action",
      title: "Não sei o agente — e não precisa saber para começar",
      summary:
        "A toxidrome orienta, mas não é pré-requisito. O que muda desfecho na primeira hora é o suporte, e ele é o mesmo em quase todas as intoxicações.",
      actions: [
        "FAÇA AGORA, e vale para qualquer agente: via aérea conforme o nível de consciência, O₂, monitorização contínua, dois acessos, GLICEMIA CAPILAR, ECG de 12 derivações e temperatura.",
        "O ECG É O EXAME QUE MAIS APONTA AGENTE SEM QUE VOCÊ SAIBA QUAL É: QRS alargado indica bloqueio de canal de sódio (tricíclico, cocaína, carbamazepina) e pede bicarbonato; QT prolongado indica bloqueio do efluxo de potássio e pede correção de eletrólitos e cuidado com fármacos que alarguem mais.",
        "DOSAR PARACETAMOL E SALICILATO EM TODOS — as duas intoxicações são silenciosas, comuns e têm conduta tempo-dependente. É a exceção à regra de não pedir triagem ampla.",
        "REEXAMINE PROCURANDO A TOXIDROME QUE AINDA NÃO APARECEU: pupilas, pele (seca ou úmida), ruídos hidroaéreos, temperatura, reflexos e clonus. Elas se declaram com o tempo, e o exame de agora não é o de daqui a uma hora.",
        "LIGUE PARA O CIATox/CEATOX — é o recurso mais subutilizado da toxicologia de emergência, e a orientação é em tempo real, com o caso na mão. Não é preciso ter o diagnóstico para ligar; a dúvida já é motivo.",
        "PROCURE A HISTÓRIA ONDE ELA ESTÁ: acompanhante, socorristas, receitas e caixas trazidas, farmácia da casa, prontuário eletrônico, e o que havia ao redor do paciente. Em tentativa de autoextermínio, o que foi tomado costuma estar no domicílio.",
        "⚠️ NÃO FECHE EM INTOXICAÇÃO SEM DESCARTAR O QUE A IMITA: trauma craniano, hipoglicemia, hipóxia, hipotermia, AVC, infecção do SNC e distúrbio metabólico. Rebaixamento com história ambígua não é diagnóstico de intoxicação.",
        "⚠️ E SE HOUVE ANESTÉSICO LOCAL EM QUALQUER MOMENTO — bloqueio, peridural, infiltração, tópico em mucosa —, pense em LAST antes de seguir procurando.",
        LAST_PONTEIRO_CURTO,
      ],
      next: "descontaminacao",
    },

    descontaminacao: {
      id: "descontaminacao",
      type: "decision",
      title: "Descontaminação gastrointestinal",
      question: "A ingestão foi há menos de 1–2 horas, com via aérea protegida e substância adsorvível?",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 5 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 5, tirar um não abre
      // nada — abaixaria para 4 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⚠️ O CARVÃO TEM CONTRAINDICAÇÃO, E ELA NÃO É FORMALIDADE: via aérea desprotegida (risco de aspiração), íleo ou obstrução, e cáustico ou hidrocarboneto — nestes o carvão PIORA a lesão. E há substâncias que ele não adsorve: álcoois, lítio, ferro, hidrocarbonetos, ácidos e álcalis.",
      evidence: [
        "Carvão ativado é útil sobretudo na primeira hora; benefício cai muito depois.",
        "NÃO adsorve: álcoois, lítio, ferro, hidrocarbonetos, ácidos/álcalis.",
        "CONTRAINDICADO se via aérea desprotegida, íleo/obstrução, ou cáustico/hidrocarboneto (risco de aspiração e de piorar lesão).",
        "Lavagem gástrica: praticamente abandonada — só considerar em ingestão maciça e muito recente, com via aérea protegida.",
        "Xarope de ipeca está PROSCRITO.",
      ],
      options: [
        { id: "sim", label: "Sim — indicar carvão ativado", next: "carvao" },
        { id: "nao", label: "Não / contraindicado", next: "antidoto" },
      ],
    },

    carvao: {
      id: "carvao",
      type: "action",
      title: "Carvão ativado",
      summary: "Melhor rendimento na primeira hora.",
      actions: [
        "Carvão ativado 1 g/kg (adulto: 50 g) por via oral ou sonda gástrica.",
        "Proteger a via aérea ANTES se houver rebaixamento — aspiração de carvão é grave.",
        "NÃO passar sonda apenas para administrar carvão, e NÃO intubar apenas para passar a sonda — via oral, ou só por sonda em quem já tem via aérea definitiva.",
        "Doses múltiplas (0,5 g/kg a cada 4–6 h) em: carbamazepina, dapsona, fenobarbital, quinina e teofilina — a lista do position statement AACT/EAPCCT. Alguns protocolos brasileiros acrescentam fenitoína e salicilato.",
        "Irrigação intestinal total (polietilenoglicol): considerar em ferro, lítio, liberação prolongada e 'body packers'.",
      ],
      next: "antidoto",
    },

    antidoto: {
      id: "antidoto",
      type: "action",
      title: "Antídotos específicos",
      summary: "Consultar dose e via conforme o tóxico identificado.",
      actions: [
        "Paracetamol → N-acetilcisteína: 150 mg/kg em 60 min → 50 mg/kg em 4 h → 100 mg/kg em 16 h. Iniciar precocemente (nomograma de Rumack-Matthew).",
        // ⚠️ ESTE NÓ É CATÁLOGO, e o catálogo APONTA — não reproduz.
        //
        // Ele carregava o regime completo da naloxona (1.099 ch, também em
        // `tox_opioide`) e o bloco do flumazenil (934 ch, também em
        // `tox_sedativo`): 59% do nó era texto já lido no mesmo caminho. As duas
        // linhas de catálogo abaixo já eram o ponteiro — o bloco atrás delas era
        // a repetição.
        //
        // Fica aqui, e só aqui, `ANTIDOTO_NAO_CRUZA_DE_CLASSE`: é a única regra
        // genuinamente TRANSVERSAL (intoxicação mista), e este é o nó dos
        // antídotos. Ela vivia em quatro nós.
        "Opioide → Naloxona: a dose depende da PROCEDÊNCIA do opioide, não da gravidade — regime completo no passo da toxíndrome opioide.",
        "Benzodiazepínico → Flumazenil — o teto depende do cenário, o uso é EXCEPCIONAL, e a ressedação é regra; detalhe no passo da toxíndrome sedativo-hipnótica.",
        FLUMAZENIL_DOIS_TETOS,
        // ⚠️ AS CONTRAINDICAÇÕES FICAM AQUI, E A TRAVA ME PROVOU ISSO.
        //
        // Tirei `FLUMAZENIL_NAO_USAR` deste nó por medição — repetia de
        // `tox_sedativo`. `test:intoxicacoes` reprovou, e a razão é clínica: este
        // é o CATÁLOGO, o lugar onde alguém ESCOLHE o antídoto. Contraindicação
        // tem de viajar junto da escolha, senão a escolha é feita sem ela.
        //
        // `FLUMAZENIL_RESSEDACAO` continua fora: o fato da ressedação já vem em
        // `FLUMAZENIL_DOIS_TETOS` («NOS DOIS CENÁRIOS, A RESSEDAÇÃO É REGRA»), e a
        // trava confere isso por padrão de texto, não por constante.
        FLUMAZENIL_NAO_USAR,
        ANTIDOTO_NAO_CRUZA_DE_CLASSE,
        "Organofosforado → Atropina (dobrando até secar secreções) + Pralidoxima 1–2 g IV.",
        "Metanol/etilenoglicol → Fomepizol 15 mg/kg → 10 mg/kg 12/12 h; ou etanol. Hemodiálise precoce.",
        "Betabloqueador → Glucagon 1–5 mg IV → 2–5 mg/h. Bloqueador de canal de cálcio → cálcio + insulina em altas doses (HIET: 1 U/kg bolus → 0,5 U/kg/h com glicose).",
        "Antidepressivo tricíclico (QRS > 100 ms) → Bicarbonato de sódio 1–2 mEq/kg IV em bolus.",
        // A linha abaixo JÁ é o ponteiro; `LAST_PONTEIRO_CURTO` atrás dela
        // repetia a dose que vive em `tox_last`.
        "Anestésico local (LAST) → EMULSÃO LIPÍDICA 20% — o antídoto é único e não tem substituto; dose e sequência no passo próprio de LAST.",
        "Cianeto → Hidroxocobalamina 5 g IV em 15 min. Metemoglobinemia → Azul de metileno 1–2 mg/kg (contraindicado em deficiência de G6PD).",
        "Sulfonilureia com hipoglicemia recorrente → Octreotide 50–100 mcg SC/IV a cada 6 h, ALÉM da glicose — a glicose isolada realimenta a secreção de insulina e a hipoglicemia recidiva.",
        "Digoxina → anticorpo antidigoxina. Isoniazida → Piridoxina (dose = dose ingerida, ou 5 g).",
        "Varfarina → Vitamina K 10 mg + CCP 4 fatores. Dabigatrana → Idarucizumabe 5 g. Heparina → Protamina 1 mg/100 UI.",
      ],
      next: "eliminacao",
    },

    eliminacao: {
      id: "eliminacao",
      type: "decision",
      title: "Necessita métodos de eliminação?",
      question: "Há intoxicação grave por substância dialisável ou acidose/insuficiência renal refratária?",
      evidence: [
        "Dialisáveis (baixo peso molecular, baixa ligação proteica, pequeno volume de distribuição): metanol, etilenoglicol, lítio, salicilato, metformina (acidose láctica), teofilina, valproato em dose maciça.",
        "Alcalinização urinária com bicarbonato: salicilato e fenobarbital.",
      ],
      options: [
        { id: "guiado", label: "Não sei — me guie", next: "eliminacao_guiada" },
        { id: "sim", label: "Sim — indicar hemodiálise/alcalinização", next: "uti" },
        { id: "nao", label: "Não", next: "observacao" },
        // ── A SAÍDA QUE NÃO EXISTIA: NÃO PRECISA DE NADA ──────────────────
        // As cinco saídas do módulo terminavam todas em FAZER alguma coisa —
        // carvão, antídoto, diálise, UTI, observação. A exposição que não
        // precisa de tratamento é uma fatia enorme da toxicologia de
        // emergência, e não tinha caminho: quem chegava aqui com uma ingestão
        // subtóxica era empurrado para a mesma via do intoxicado grave.
        { id: "sem_indicacao", label: "Exposição sem indicação de tratamento — o que ainda assim se faz", next: "sem_indicacao" },
      ],
    },

    eliminacao_guiada: {
      id: "eliminacao_guiada",
      type: "action",
      title: "Antes de decidir eliminação extracorpórea",
      summary: "Não existe um limiar único que sirva para todos os tóxicos. Confirme agente, gravidade e órgão-alvo antes de responder.",
      actions: [
        "IDENTIFIQUE o tóxico, formulação, dose estimada e tempo desde a exposição; critérios de diálise variam por substância.",
        "REAVALIE acidose, função renal, estado neurológico, hemodinâmica, ECG e concentrações séricas quando existirem e forem úteis para aquele agente.",
        "CONSULTE CIATox/CEATOX e, quando houver possibilidade real de terapia extracorpórea, nefrologia/toxicologia e os critérios específicos do agente (por exemplo, recomendações EXTRIP quando aplicáveis).",
        "Se houver deterioração clínica enquanto a definição está em curso, trate suporte e complicações sem esperar a decisão sobre diálise.",
        "Com esses dados em mãos, volte à pergunta e escolha o ramo correspondente.",
      ],
      next: "eliminacao",
    },

    sem_indicacao: {
      id: "sem_indicacao",
      type: "action",
      title: "Não tratar também é conduta",
      summary:
        "Boa parte das exposições atendidas não precisa de descontaminação, antídoto nem eliminação. O que elas precisam é de tempo de observação certo e de quem confirme que é este o caso.",
      actions: [
        "QUANDO NÃO HÁ INDICAÇÃO DE TRATAMENTO: dose abaixo da tóxica para o peso, substância de baixa toxicidade, exposição antiga já fora da janela de risco, e paciente ASSINTOMÁTICO com sinais vitais, ECG e glicemia normais.",
        "⚠️ QUEM CONFIRMA ISSO NÃO É VOCÊ SOZINHO: ligue para o CIATox/CEATOX. Dose tóxica por peso e tempo de risco variam por produto, e é exatamente o que eles respondem em minutos. \"Parece pouco\" não é critério.",
        "O QUE SE FAZ MESMO SEM TRATAR: observar pelo TEMPO DE RISCO DA SUBSTÂNCIA — e ele é definido pela farmacocinética, não pelo quanto o paciente parece bem. Formulação de LIBERAÇÃO PROLONGADA, fármaco de ação longa e coingestão que retarda o esvaziamento gástrico esticam esse tempo.",
        "⚠️ AS EXCEÇÕES QUE PARECEM BENIGNAS E NÃO SÃO: paracetamol e salicilato (silenciosos, com dano já em curso enquanto o paciente conversa), álcoois tóxicos (o intervalo lúcido é característico), ferro, e formulações de liberação prolongada. Nesses, \"assintomático agora\" não autoriza alta.",
        "AVALIAÇÃO PSIQUIÁTRICA antes da alta em toda tentativa de autoextermínio — a ausência de toxicidade clínica não é ausência de risco, e é o motivo mais comum de o paciente voltar.",
        "ALTA COM ORIENTAÇÃO ESCRITA, acompanhante e retorno imediato se rebaixamento, vômitos, dor abdominal, dor torácica ou convulsão. E notificação conforme a legislação local.",
        "⚠️ NÃO PEDIR TRIAGEM TOXICOLÓGICA AMPLA PARA \"TER CERTEZA\" — ela não muda o desfecho e não é o que autoriza a alta. O que autoriza é dose, tempo e paciente assintomático.",
      ],
      next: "observacao",
    },

    uti: {
      id: "uti",
      type: "transition",
      title: "UTI — intoxicação grave",
      summary: "Instabilidade, necessidade de antídoto contínuo, diálise ou ventilação.",
      disposition: "icu",
      exitCriteria: [
        "Hemodiálise precoce quando indicada; alcalinização urinária no salicilato (alvo pH urinário 7,5–8).",
        "Monitorização contínua de ECG (QRS/QT), temperatura, função renal e CPK (rabdomiólise).",
        "Manter contato com o CIATox; reavaliar coingestões e repetir dosagens quando aplicável.",
        "Avaliação psiquiátrica obrigatória em tentativa de autoextermínio, antes da alta.",
        "Notificação compulsória conforme a legislação local.",
      ],
      targets: [
        { moduleId: "isr-rapida", label: "ISR — via aérea", reason: "Rebaixamento com risco de aspiração" },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Choque refratário por cardiotóxico" },
        { moduleId: "correcoes-eletroliticas", label: "Correções eletrolíticas", reason: "Distúrbios associados à intoxicação" },
      ],
    },

    observacao: {
      id: "observacao",
      type: "transition",
      title: "Observação",
      summary: "Manter vigilância pelo tempo de risco da substância.",
      disposition: "observation",
      exitCriteria: [
        "Observar por período compatível com a farmacocinética (liberação prolongada e ação longa exigem mais tempo).",
        "Repetir ECG e exames conforme a substância; reavaliar paracetamol em 4 h da ingestão.",
        "AVALIAÇÃO PSIQUIÁTRICA antes da alta em toda tentativa de autoextermínio.",
        "Orientar acompanhante e retorno imediato se rebaixamento, vômitos, dor torácica ou convulsão.",
      ],
      targets: [],
    },
  },
};
