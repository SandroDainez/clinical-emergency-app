import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";
import { alertaDoEcg, FONTE_ECG_10MIN } from "./lib/ecg-tempo";
import { avisoDePeso } from "./lib/peso-estimado";
import {
  blocoCirculacao,
  blocoConscienciaViaAerea,
  blocoRespiracao,
  blocoRitmo,
  avaliarAmeacaImediata,
} from "./lib/instabilidade-coronariana";
import { suspeitaDeVd, vereditoNitrato, vereditoMorfina } from "./lib/vereditos-sca";
import { TENECTEPLASE_APRESENTACAO, TENECTEPLASE_REGIME_IAM } from "./lib/tenecteplase";
import { ENOXAPARINA_APRESENTACAO, ENOXAPARINA_REGIME_IAM } from "./lib/enoxaparina";
import {
  VD_QUANDO_PROCURAR,
  VD_DERIVACOES_COMO,
  VD_CONTRAINDICA_PRE_CARGA,
  OCLUSAO_DE_WINTER,
  OCLUSAO_POSTERIOR,
  DERIVACOES_POSTERIORES_COMO,
  OCLUSAO_SEM_SUPRA_ABERTURA,
  OCLUSAO_T_HIPERAGUDA,
} from "./lib/oclusao-sem-supra";

/**
 * ════════════════════════════════════════════════════════════════════════
 *  SCA V2 — NAVEGAÇÃO POR DECISÕES CLÍNICAS
 * ════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ ESTA ÁRVORE NASCE AO LADO DA V1, NÃO NO LUGAR DELA. A árvore de 95 nós
 * (`coronary-decision-tree.ts`) continua intacta, publicada e roteada em
 * `/modulos/sindromes-coronarianas`. Esta vive em
 * `/modulos/sindromes-coronarianas-v2`, para comparação lado a lado no
 * telefone e rollback trivial. Decisão do autor, 2026-08-26.
 *
 * ── POR QUE UMA V2 EM VEZ DE CONTINUAR CORRIGINDO A V1 ──────────────────
 *
 * A V1 ficou segura — vereditos, dose governada, janela do PDE-5, marcos
 * temporais, retomada sem deslocar relógio. Nada disso se perde: esta árvore
 * CONSOME as mesmas funções, sem reescrever uma linha de lógica clínica.
 *
 * O que muda é a UNIDADE DE NAVEGAÇÃO. Na V1 o cabeçalho diz "Passo 17" —
 * dezessete de quantos, o médico não sabe, e o número não corresponde a nada
 * clínico. Aqui ele diz "Decisão 2 de 3", e isso é verdade sobre o
 * atendimento, não sobre o app.
 *
 * ⚠️ E A TRAVA QUE ORGANIZA TUDO, na formulação do autor:
 *
 *     "O PDF é a base de conhecimento. O app é o condutor da decisão."
 *
 * Foi exatamente aqui que a V1 se perdeu: ela tentou CONTER o protocolo, e por
 * isso `stemi_meds` chegou a 3.738 caracteres visíveis numa tela de 375 px.
 * Nenhum nó desta árvore tenta caber o conteúdo das 63 páginas — cada um
 * carrega só o que muda a resposta daquele momento.
 *
 * ── O CAMINHO CRÍTICO, E SÓ ELE ─────────────────────────────────────────
 *
 *   entrada → linha do tempo → ameaças → DECISÃO 1 (ECG)
 *                                          ├─ sem supra → (fora desta etapa)
 *                                          └─ com supra → território → VD
 *                                                → DECISÃO 2 (ICP ≤120 min)
 *                                                   ├─ sim → ICP primária
 *                                                   └─ não → DECISÃO 3 (fibrinólise)
 *                                                              ├─ elegível → fibrinólise
 *                                                              │     → reavaliação 60–90 min
 *                                                              └─ não → transferir
 *
 * Ramo sem supra, complicações, unidade coronariana e alta NÃO entram aqui.
 * Estão no mapa aprovado e esperam este caminho ser testado no telefone.
 */

/** Só o que este caminho precisa derivar. */
function deriveV2(values: TreeValues): Record<string, string> {
  const saida: Record<string, string> = {};

  const peso = Number(values.peso);
  if (Number.isFinite(peso) && peso > 0) {
    // Tenecteplase por faixa de peso — os degraus são os da bula, não uma
    // interpolação: TNK é bolus único e não há como corrigir depois.
    const tnk =
      peso < 60 ? 30 : peso < 70 ? 35 : peso < 80 ? 40 : peso < 90 ? 45 : 50;
    saida.tnk = String(tnk);
    saida.enoxa = String(Math.min(100, Math.round(peso)));
    saida.enoxa75 = String(Math.min(75, Math.round(peso * 0.75)));
  }

  // ⚠️ A DOSE POR PESO PRECISA DIZER SOBRE QUE PESO ELA REPOUSA. `test:peso`
  // reprovou a V2 por coletar `peso` sem `pesoOrigem`: sem a origem, o app não
  // tem como avisar que o número saiu de uma estimativa, e o erro do peso passa
  // integralmente para a dose. Num bolus único de TNK isso não se corrige
  // depois.
  saida.avisoPeso = avisoDePeso(values.pesoOrigem);

  // ⚠️ `supra_inferior` É DERIVADO AQUI, e é o ponto que mais motivou a V2.
  // Na V1 ele é um CAMPO perguntado seis passos depois de o ECG já ter sido
  // lido — dois nomes para o mesmo achado no mesmo traçado, e o médico
  // respondendo duas vezes. O território já responde por ele.
  //
  // O veredito do nitrato e `suspeitaDeVd` leem `supra_inferior` sem saber de
  // onde veio: é a mesma chave de `TreeValues`, e por isso a camada de
  // segurança inteira funciona sem alteração.
  if (values.territorio === "inferior") saida.supra_inferior = "sim";
  else if (values.territorio) saida.supra_inferior = "nao";

  return saida;
}

export const coronaryV2DecisionTree: DecisionTreeDefinition = {
  id: "sca_v2_2025",
  version: "2025.1-v2",
  label: "Síndromes Coronarianas · V2",
  entryNodeId: "v2_entrada",
  derive: deriveV2,
  /**
   * DOIS RELÓGIOS ARMADOS NUMA TELA SÓ, e é o que paga três telas adiante.
   *
   * `fmc_min` → a meta de 10 min do ECG e a janela de 120 min da ICP.
   * `tempo_dor` → a janela de 12 h da fibrinólise.
   * `tnk_ha_min` → os 60–90 min da reavaliação, contados DO BOLUS.
   *
   * ⚠️ Todos ancoram em (agora − valor informado), nunca em "agora". Contar da
   * tela responderia "há quanto tempo o app está aberto" — o defeito que já foi
   * medido em crises convulsivas e custou 8 minutos de atraso no escalonamento.
   */
  marcos: {
    fmc_min: "primeiroContatoMedico",
    tempo_dor: "inicioDoEvento",
    tnk_ha_min: "ultimaDose",
  },
  alertaPersistente: alertaDoEcg,

  nodes: {
    // ── 01 · ENTRADA ─────────────────────────────────────────────────────
    //
    // ⚠️ TRÊS CONDUTAS, NÃO OITO. O `entry` da V1 lista oito medidas iniciais
    // com o mesmo peso visual — e foi assim que "ECG de 12 derivações em até
    // 10 min" virou a quarta linha de uma lista, entre "2 acessos venosos" e
    // "coletar troponina". Aqui ficam as três que não esperam por nada.
    v2_entrada: {
      id: "v2_entrada",
      type: "action",
      title: "Suspeita de SCA",
      summary: "Faça agora, em paralelo. Nada aqui espera exame.",
      actions: [
        "Área monitorada: monitor cardíaco, 2 acessos venosos, desfibrilador próximo",
        "ECG de 12 derivações",
        "Não atrasar a reperfusão por exame nenhum",
      ],
      porque: [
        "Tempo é músculo. As medidas iniciais correm ao lado do ECG, não antes dele.",
      ],
      next: "v2_dados_paciente",
    },

    // ── 02 · DADOS DO PACIENTE ──────────────────────────────────────────
    //
    // ⚠️ COLETADOS UMA VEZ, CONSUMIDOS POR TODAS AS DECISÕES. Idade, peso e
    // altura alimentam as doses; o início dos sintomas alimenta a janela de
    // 12 h da fibrinólise. Nenhum deles é perguntado de novo adiante.
    //
    // ⚠️ E O PRIMEIRO CONTATO MÉDICO ESTÁ AQUI, NÃO NA TELA DO ECG (decisão do
    // autor, 2026-08-27). Eu havia proposto coletá-lo na tela 5, onde o ECG é
    // pedido — e ele barrou com a razão certa: o primeiro contato JÁ ACONTECEU
    // antes de o médico chegar naquela tela. Ancorar ali "rejuvenesceria"
    // artificialmente o tempo e subestimaria o atraso justamente no dado que a
    // meta de 10 min existe para medir. A tela 5 apenas CONSOME este marco.
    v2_dados_paciente: {
      id: "v2_dados_paciente",
      type: "input",
      title: "Dados do paciente",
      intro: "Coletados uma vez. As decisões seguintes leem daqui — nada será perguntado de novo.",
      fields: [
        {
          id: "idade",
          label: "Idade",
          unit: "anos",
          allowCustom: true,
          customLabel: "Outra",
          customKeyboard: "numeric",
          presets: [
            { value: "40", label: "40" },
            { value: "55", label: "55" },
            { value: "65", label: "65" },
            { value: "75", label: "75" },
            { value: "85", label: "85" },
          ],
        },
        {
          id: "peso",
          label: "Peso",
          unit: "kg",
          allowCustom: true,
          customLabel: "Outro",
          customKeyboard: "numeric",
          presets: ["50", "60", "70", "80", "90", "100"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "pesoOrigem",
          label: "Este peso é",
          optional: true,
          presets: [
            { value: "estimado", label: "Estimado" },
            { value: "real", label: "Real (pesado)" },
          ],
        },
        {
          id: "altura",
          label: "Altura",
          unit: "cm",
          optional: true,
          allowCustom: true,
          customLabel: "Outra",
          customKeyboard: "numeric",
          presets: ["150", "160", "170", "180", "190"].map((v) => ({ value: v, label: v })),
        },
        {
          // Marco `inicioDoEvento` — a janela de 12 h da fibrinólise conta daqui.
          id: "tempo_dor",
          label: "Há quantos minutos começaram os sintomas?",
          unit: "min",
          optional: true,
          allowCustom: true,
          customLabel: "Outro",
          customKeyboard: "numeric",
          presets: [
            { value: "30", label: "~30 min" },
            { value: "60", label: "1 h" },
            { value: "180", label: "3 h" },
            { value: "360", label: "6 h" },
            { value: "720", label: "12 h" },
            { value: "1440", label: "mais de 12 h" },
          ],
        },
        {
          // Marco `primeiroContatoMedico` — a meta de 10 min do ECG e a janela
          // de 120 min da ICP contam daqui.
          id: "fmc_min",
          label: "Há quantos minutos foi o primeiro contato médico?",
          unit: "min",
          optional: true,
          allowCustom: true,
          customLabel: "Outro",
          customKeyboard: "numeric",
          presets: [
            { value: "0", label: "Agora" },
            { value: "10", label: "~10 min" },
            { value: "30", label: "~30 min" },
            { value: "60", label: "1 h" },
            { value: "120", label: "2 h ou mais" },
          ],
        },
      ],
      next: "v2_ameacas",
    },

    // ── 03 · AMEAÇA IMEDIATA ─────────────────────────────────────────────
    //
    // ⚠️ O APP CONCLUI; NÃO PERGUNTA "O PACIENTE ESTÁ INSTÁVEL?". Ele coleta
    // achados observáveis e `avaliarAmeacaImediata` decide — inclusive a regra
    // de causalidade que o autor exigiu: FC extrema com hipotensão NÃO prova
    // que a arritmia seja a causa, e a faixa do meio não é arritmia nem choque.
    //
    // Cinco blocos da V1 viram um só. Lá eram `estab_bloco1..5`, cinco telas
    // seguidas antes do ECG.
    v2_ameacas: {
      id: "v2_ameacas",
      type: "input",
      title: "Há ameaça imediata à vida?",
      intro: "Um bloco só. O app conclui a gravidade a partir do que você medir.",
      fields: [
        ...blocoConscienciaViaAerea(),
        ...blocoRespiracao(),
        ...blocoCirculacao(),
        ...blocoRitmo(),
      ],
      next: {
        possiveis: ["v2_estabilizar", "v2_medidas_iniciais"],
        escolher: (values) =>
          avaliarAmeacaImediata(values) ? "v2_estabilizar" : "v2_medidas_iniciais",
      },
    },

    // ── 04 · ESTABILIZAR ─────────────────────────────────────────────────
    //
    // ⚠️ DESVIO, NÃO PARADA. Regra universal do app: estabilização tem
    // precedência sobre o protocolo, e o fluxo volta ao mesmo ponto depois.
    v2_estabilizar: {
      id: "v2_estabilizar",
      type: "action",
      title: "Estabilizar antes de seguir",
      summary: "A ameaça identificada tem precedência. O fluxo volta a este ponto.",
      actions: [
        "Tratar a ameaça identificada antes de avançar na classificação do ECG",
        "A reperfusão continua sendo o objetivo — estabilizar não é adiar",
      ],
      ferramenta: {
        moduleId: "pcr-adulto",
        label: "Abrir o módulo da ameaça",
      },
      next: "v2_medidas_iniciais",
    },

    // ── 04 · MEDIDAS INICIAIS ────────────────────────────────────────────
    //
    // ⚠️ CONDUTA OPERACIONAL, NÃO TEXTO. Cada linha é uma coisa que alguém faz
    // com as mãos agora. O `entry` da V1 misturava isso com exames, oxigênio e
    // anamnese em oito itens de peso igual — e foi assim que a meta do ECG virou
    // a quarta linha de uma lista.
    v2_medidas_iniciais: {
      id: "v2_medidas_iniciais",
      type: "action",
      title: "Medidas iniciais",
      summary: "Tudo em paralelo. Nada aqui espera o resultado do anterior.",
      actions: [
        "Monitorização cardíaca contínua",
        "Oximetria de pulso — O₂ apenas se SpO₂ < 90%",
        "Pressão arterial (aferir nos dois braços)",
        "Acesso venoso periférico — dois se o quadro for grave",
        "Desfibrilador disponível ao lado do paciente",
      ],
      next: "v2_analgesia_exames",
    },

    // ── 05 · ANALGESIA E EXAMES · O ECG EM DESTAQUE ──────────────────────
    //
    // ⚠️ O ECG NÃO É MAIS UM ITEM DA LISTA. Ele é o título da tela, e a faixa
    // persistente cobra a meta pelo resto do atendimento. O resto dos exames
    // aparece como conduta — nenhum deles atrasa a reperfusão.
    //
    // ⚠️ ANALGESIA ENTRA GOVERNADA. `vereditoMorfina` avalia hipotensão,
    // hipoperfusão, rebaixamento e VD; o que ele não consegue avaliar
    // (retenção de CO₂, DPOC) vira decisão registrada. A dose só nasce do
    // "prosseguir" — nunca solta na lista de exames.
    v2_analgesia_exames: {
      id: "v2_analgesia_exames",
      type: "input",
      title: "ECG de 12 derivações",
      summary: FONTE_ECG_10MIN,
      intro:
        "⏱️ REALIZAR E INTERPRETAR O MAIS RÁPIDO POSSÍVEL — meta de até 10 minutos do primeiro contato médico. Em paralelo: troponina ultrassensível, hemograma, creatinina e eletrólitos. Nenhum exame atrasa a reperfusão.",
      fields: [
        {
          id: "ecg_realizado",
          label: "O ECG de 12 derivações já foi realizado?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Ainda não" },
          ],
        },
        {
          id: "pde5_recente",
          label: "Uso recente de inibidor de PDE-5 (sildenafila, tadalafila)?",
          optional: true,
          presets: [
            { value: "nao", label: "Não" },
            { value: "sim", label: "Sim" },
            { value: "nao_sei", label: "Não sei" },
          ],
        },
        {
          id: "pde5_qual",
          label: "Qual inibidor de PDE-5?",
          optional: true,
          showIf: (v) => v.pde5_recente === "sim",
          presets: [
            { value: "sildenafila", label: "Sildenafila (Viagra, Revatio)" },
            { value: "tadalafila", label: "Tadalafila (Cialis)" },
            { value: "vardenafila", label: "Vardenafila (Levitra)" },
            { value: "avanafila", label: "Avanafila (Spedra)" },
            { value: "nao_sei_qual", label: "Não sei qual" },
          ],
        },
        {
          id: "pde5_horas",
          label: "Há quantas horas foi a última dose?",
          unit: "h",
          optional: true,
          showIf: (v) => v.pde5_recente === "sim",
          allowCustom: true,
          customLabel: "Outro",
          customKeyboard: "numeric",
          presets: [
            { value: "2", label: "~2 h" },
            { value: "8", label: "~8 h" },
            { value: "12", label: "~12 h" },
            { value: "24", label: "~24 h" },
            { value: "48", label: "~48 h" },
            { value: "72", label: "mais de 48 h" },
          ],
        },
      ],
      vereditos: [{ id: "morfina", avaliar: vereditoMorfina }],
      next: "v2_decisao1",
    },

    // ── 05 · DECISÃO 1 ───────────────────────────────────────────────────
    //
    // ⚠️ A DECISÃO QUE BIFURCA O MÓDULO INTEIRO — E QUE NA V1 NÃO TEM UMA
    // IMAGEM. O nó `ecg` faz esta mesma pergunta em texto puro. Descrever com
    // palavras o que se reconhece com o olho transfere ao médico a tarefa mais
    // difícil da tela, e aqui ela decide reperfusão.
    //
    // Formato A (decisão do autor): padrão de poucas derivações → normal ×
    // alterado lado a lado, compactos.
    v2_decisao1: {
      id: "v2_decisao1",
      type: "decision",
      title: "Decisão 1 de 3 · O ECG",
      // ⚠️ SÓ SUPRA. A V1 pergunta "supra de ST OU BRE novo suspeito" na mesma
      // tela, e o autor separou: a novidade do BRE depende de ECG prévio ou de
      // contexto, que é outra variável e merece decisão própria. Misturar as
      // duas obriga a responder por duas coisas com um toque só.
      question: "O ECG mostra supradesnível de ST?",
      summary: "Compare com o traçado normal ao lado. Apoio visual — o diagnóstico é no ECG do seu paciente.",
      comparativo: [
        {
          figura: "ecg_normal",
          imagemReal: "ecg-normal",
          rotulo: "Normal — DII",
          significado: "Ritmo sinusal, segmento ST na linha de base.",
          conduta: "Referência para comparação.",
        },
        {
          figura: "ecg_supra_anterior",
          imagemReal: "ecg-supra-st",
          rotulo: "Supra de ST — V3",
          significado: "ST elevado e convexo, acima da linha de base antes da onda T.",
          conduta: "Critério de STEMI — reperfusão.",
          optionId: "sim",
        },
      ],
      options: [
        {
          id: "sim",
          label: "Sim — há supra ou equivalente",
          next: "v2_territorio",
          gravidade: "critica",
          grava: { campo: "ecg_supra", valor: "sim" },
        },
        {
          // ⚠️ "NÃO" NÃO É SINÔNIMO DE NSTE (correção do autor, 2026-08-27).
          // Cinco padrões ocluem a coronária SEM elevar o ST nas 12 derivações
          // padrão, e três deles são sala de hemodinâmica agora. Mandar o "não"
          // direto para o ramo sem supra tiraria da fila da reperfusão
          // exatamente quem mais precisa dela.
          id: "nao",
          label: "Não",
          next: "v2_oclusao_sem_supra",
          grava: { campo: "ecg_supra", valor: "nao" },
        },
        {
          // ⚠️ A DÚVIDA TEM DESTINO PRÓPRIO E NÃO É CONVERTIDA. O rótulo é o
          // mesmo padrão do resto do app.
          id: "nao_sei",
          label: "Não sei — me ajude",
          next: "v2_d1_ajuda",
          grava: { campo: "ecg_supra", valor: "nao_sei" },
        },
      ],
    },

    // ── 06 · AJUDA DA DECISÃO 1 ──────────────────────────────────────────
    //
    // ⚠️ OS CRITÉRIOS FICAM ABERTOS E O TRAÇADO APARECE. A ajuda equivalente da
    // V1 (`ecg_ajuda_supra`) ensina supra por texto e guarda os critérios atrás
    // de "Ver critérios". Uma tela que só existe porque o médico disse "não
    // sei" não pode abrir com a ajuda fechada.
    //
    // ⚠️ E ELA NÃO FORÇA SIM/NÃO. A terceira saída preserva a dúvida — mesma
    // correção que o autor exigiu no BAV/PR.
    v2_d1_ajuda: {
      id: "v2_d1_ajuda",
      type: "decision",
      title: "Reconhecer supra e equivalentes",
      // ⚠️ PREDOMINANTEMENTE VISUAL, e os critérios ficam ABERTOS. A tela existe
      // porque o médico disse que não sabe reconhecer o padrão — ensiná-lo por
      // texto é transferir de volta a tarefa mais difícil. Três traçados na
      // mesma grade e na mesma escala: é o contraste que faz reconhecer.
      question: "Com estes traçados ao lado, o ECG do seu paciente tem supradesnível de ST?",
      evidence: [
        "SUPRA: o segmento ST fica ACIMA da linha de base depois do QRS, e assim PERMANECE até a onda T. Costuma ser convexo (abaulado para cima).",
        "INFRA: o ST fica ABAIXO da linha de base. Não é supra — mas também não é normal, e as alterações horizontais ou descendentes são as que mais importam.",
        "A linha de base é o segmento entre o fim da onda T e o início da P seguinte. É contra ela que se mede, não contra o traçado vizinho.",
        "⚠️ Um ECG inicial normal NÃO exclui síndrome coronariana aguda. Repita o traçado se os sintomas persistirem ou mudarem.",
      ],
      comparativo: [
        {
          figura: "ecg_normal",
          imagemReal: "ecg-normal",
          rotulo: "Normal — DII",
          significado: "Ritmo sinusal, ST na linha de base, T positiva.",
          conduta: "Referência para comparação.",
        },
        {
          figura: "ecg_supra_anterior",
          imagemReal: "ecg-supra-st",
          rotulo: "Supra de ST — V3",
          significado: "ST elevado e convexo — lesão transmural.",
          conduta: "É supra: siga para o território.",
        },
        {
          figura: "ecg_posterior",
          imagemReal: "ecg-infra-st",
          rotulo: "Infra de ST — DII",
          significado: "ST deprimido — isquemia subendocárdica.",
          conduta: "NÃO é supra. Segue pelo ramo sem supradesnível.",
        },
      ],
      options: [
        { id: "sim", label: "Tem supra ou equivalente", next: "v2_territorio", gravidade: "critica", grava: { campo: "ecg_supra", valor: "sim" } },
        { id: "nao", label: "Não tem", next: "v2_oclusao_sem_supra", grava: { campo: "ecg_supra", valor: "nao" } },
        {
          id: "indeterminado",
          label: "Continuo sem conseguir determinar",
          next: "v2_ecg_indeterminado",
          gravidade: "neutra",
          grava: { campo: "ecg_supra", valor: "nao_sei" },
        },
      ],
    },

    // ── 06b · ECG INDETERMINADO ──────────────────────────────────────────
    //
    // ⚠️ DESCONHECIDO NÃO VIRA "SEM SUPRA". Mandar a dúvida para o ramo sem
    // supra seria converter ausência de leitura em ausência de oclusão — e o
    // paciente sairia da fila da reperfusão por um dado que ninguém tem.
    v2_ecg_indeterminado: {
      id: "v2_ecg_indeterminado",
      type: "action",
      title: "ECG ainda não classificado",
      summary: "Isto não é 'sem supra'. É 'ainda não sei'.",
      actions: [
        "Repetir o ECG agora e comparar com o traçado anterior, se houver",
        "Se a suspeita for posterior: registrar V7–V9. Se houver supra inferior: registrar V3R–V4R. Um conjunto responde a uma pergunta — pedir os dois sempre é ruído",
        "Se não for possível distinguir o padrão: completar a avaliação do ECG sem assumir nenhum deles",
        "Discutir com quem vai assumir o paciente: ligar para o serviço de referência custa minutos",
      ],
      porque: [
        "Enquanto a leitura não fecha, o paciente não sai da fila da reperfusão — a dúvida não o move para o ramo sem supra.",
      ],
      next: "v2_decisao1",
    },

    // ── 07 · TERRITÓRIO ──────────────────────────────────────────────────
    //
    // ⚠️ É AQUI QUE `supra_inferior` DEIXA DE SER PERGUNTA. Ver `deriveV2`.
    //
    // Formato B (decisão do autor): padrão multiderivações → alterado em
    // destaque, com a comparação disponível, sem gastar a primeira dobra.
    v2_territorio: {
      id: "v2_territorio",
      type: "decision",
      title: "Ramo A · Território",
      question: "Em quais derivações está o supradesnível?",
      comparativo: [
        {
          figura: "ecg_supra_inferior",
          rotulo: "Inferior — II, III, aVF",
          significado: "Supra nas derivações inferiores.",
          conduta: "Pesquisar ventrículo direito com V3R–V4R.",
          optionId: "inferior",
        },
        {
          figura: "ecg_supra_anterior",
          rotulo: "Anterior/septal — V1–V4",
          significado: "Supra nas precordiais anteriores.",
          conduta: "Reperfusão emergente.",
          optionId: "anterior",
        },
        {
          figura: "ecg_supra_lateral",
          rotulo: "Lateral — I, aVL, V5–V6",
          significado: "Supra nas derivações laterais.",
          conduta: "Reperfusão emergente.",
          optionId: "lateral",
        },
        {
          figura: "ecg_posterior",
          rotulo: "Posterior — V7–V9",
          significado: "Imagem em espelho em V1–V3; confirmar nas posteriores.",
          conduta: "Supra de 0,5 mm em V7–V9 já fecha o diagnóstico.",
          optionId: "posterior",
        },
      ],
      options: [
        { id: "inferior", label: "Inferior — II, III, aVF", next: "v2_vd", gravidade: "critica", grava: { campo: "territorio", valor: "inferior" } },
        { id: "anterior", label: "Anterior/septal — V1–V4", next: "v2_decisao2", gravidade: "critica", grava: { campo: "territorio", valor: "anterior" } },
        { id: "lateral", label: "Lateral — I, aVL, V5–V6", next: "v2_decisao2", gravidade: "critica", grava: { campo: "territorio", valor: "lateral" } },
        { id: "posterior", label: "Posterior — V7–V9", next: "v2_decisao2", gravidade: "critica", grava: { campo: "territorio", valor: "posterior" } },
        {
          // Não localizar a parede não impede a reperfusão — só impede derivar
          // `supra_inferior`, e o veredito do nitrato trata isso sozinho.
          id: "indeterminado",
          label: "Não consigo localizar",
          next: "v2_decisao2",
          gravidade: "neutra",
          grava: { campo: "territorio", valor: "nao_sei" },
        },
      ],
    },

    // ── 08 · VENTRÍCULO DIREITO ──────────────────────────────────────────
    //
    // ⚠️ ESTA TELA EXISTE PARA O NITRATO, E É POR ISSO QUE ELA VEM ANTES DAS
    // TERAPIAS. `suspeitaDeVd` alimenta `vereditoNitrato` e `vereditoMorfina`:
    // o VD infartado depende de pré-carga, e a conduta oposta é VOLUME.
    v2_vd: {
      id: "v2_vd",
      type: "decision",
      title: "Ramo A · Ventrículo direito",
      question: "As derivações direitas (V3R–V4R) mostram supradesnível?",
      evidence: [VD_QUANDO_PROCURAR, VD_DERIVACOES_COMO, VD_CONTRAINDICA_PRE_CARGA],
      // ⚠️ SEM `comparativo` AINDA: o traçado de V3R–V4R não existe na
      // biblioteca. Declarado como pendência em vez de reaproveitar um traçado
      // de outra derivação, o que seria mostrar a imagem errada com o rótulo
      // certo — pior que não mostrar nenhuma.
      options: [
        {
          id: "sim",
          label: "Sim — supra em V3R–V4R",
          next: "v2_decisao2",
          gravidade: "critica",
          grava: { campo: "vd_confirmado", valor: "sim" },
        },
        {
          id: "nao",
          label: "Não há supra nas direitas",
          next: "v2_decisao2",
          gravidade: "favoravel",
          grava: { campo: "vd_confirmado", valor: "nao" },
        },
        {
          id: "nao_registrei",
          label: "Ainda não registrei V3R–V4R",
          next: "v2_decisao2",
          gravidade: "neutra",
          grava: { campo: "vd_confirmado", valor: "nao_sei" },
        },
      ],
    },

    // ── 09 · DECISÃO 2 ───────────────────────────────────────────────────
    //
    // ⚠️ O RELÓGIO ARMADO NA TELA 02 PAGA AQUI. O app MOSTRA "primeiro contato
    // há X min" em vez de perguntar — regra do autor: não perguntar conclusão
    // que o app pode derivar.
    v2_decisao2: {
      id: "v2_decisao2",
      type: "decision",
      title: "Decisão 2 de 3 · Reperfusão mecânica",
      question:
        "A intervenção coronária percutânea primária pode ocorrer em até 120 minutos a partir do primeiro contato médico?",
      summary: "Se a resposta for sim, a ICP primária é a estratégia preferida.",
      prazos: [
        {
          id: "icp120",
          aos: 120,
          marco: "primeiroContatoMedico" as const,
          aoVencer: "⏱️ Meta de 120 min do primeiro contato até o dispositivo.",
          aoUltrapassar: "seguirContando" as const,
          aoUltrapassarTexto:
            "⏱️ Passou dos 120 min do primeiro contato. A janela da ICP primária como estratégia preferida se fechou — reavaliar fibrinólise se ainda houver indicação.",
        },
      ],
      options: [
        {
          id: "sim",
          label: "Sim — ativar hemodinâmica",
          next: "v2_icp",
          gravidade: "favoravel",
          grava: { campo: "icp_no_prazo", valor: "sim" },
        },
        {
          id: "nao",
          label: "Não — avaliar fibrinólise",
          next: "v2_decisao3",
          gravidade: "alerta",
          grava: { campo: "icp_no_prazo", valor: "nao" },
        },
        {
          id: "nao_sei",
          label: "Não sei estimar o tempo — me ajude",
          next: "v2_d2_ajuda",
          gravidade: "neutra",
          grava: { campo: "icp_no_prazo", valor: "nao_sei" },
        },
      ],
    },

    v2_d2_ajuda: {
      id: "v2_d2_ajuda",
      type: "decision",
      title: "O que entra nos 120 minutos",
      question: "Com estes componentes somados, a ICP cabe em 120 min do primeiro contato?",
      evidence: [
        "O relógio conta do PRIMEIRO CONTATO MÉDICO até o DISPOSITIVO cruzar a lesão — não do diagnóstico, não da chegada ao hospital com hemodinâmica.",
        "Some: tempo até a decisão + acionamento e deslocamento da ambulância + transporte + porta do hospital receptor até a sala + preparo até o dispositivo.",
        "Se o paciente já está em hospital com hemodinâmica, a meta operacional é mais curta e a fibrinólise raramente entra na conta.",
        "⚠️ Na dúvida entre transferir e trombolisar, o critério não é a distância em quilômetros — é o tempo real porta-dispositivo que o seu serviço consegue reproduzir num dia comum.",
      ],
      options: [
        { id: "sim", label: "Cabe em 120 min", next: "v2_icp", gravidade: "favoravel", grava: { campo: "icp_no_prazo", valor: "sim" } },
        { id: "nao", label: "Não cabe", next: "v2_decisao3", gravidade: "alerta", grava: { campo: "icp_no_prazo", valor: "nao" } },
        {
          // ⚠️ A DÚVIDA AQUI VAI PARA A FIBRINÓLISE, e isso é decisão clínica,
          // não conveniência: quando não se consegue garantir a ICP no prazo,
          // a conduta que a diretriz sustenta é avaliar o fibrinolítico — e a
          // avaliação continua tendo suas próprias travas.
          id: "indeterminado",
          label: "Continuo sem conseguir estimar",
          next: "v2_decisao3",
          gravidade: "neutra",
          grava: { campo: "icp_no_prazo", valor: "nao_sei" },
        },
      ],
    },

    // ── 10 · ICP PRIMÁRIA ────────────────────────────────────────────────
    v2_icp: {
      id: "v2_icp",
      type: "action",
      title: "ICP primária — ativar agora",
      summary: "Abrir a artéria culpada o mais cedo possível.",
      actions: [
        "Ativar a hemodinâmica agora",
        "Acesso radial preferencial; tratar primeiro a artéria culpada",
        "Antitrombóticos e controle de dor em paralelo — sem atrasar a sala",
      ],
      next: "v2_terapias",
    },

    // ── 11 · DECISÃO 3 ───────────────────────────────────────────────────
    //
    // ⚠️ O MARCO DO INÍCIO DA DOR PAGA AQUI. A metade temporal da pergunta o
    // app responde sozinho; ao médico resta a metade que só ele sabe.
    v2_decisao3: {
      id: "v2_decisao3",
      type: "decision",
      title: "Decisão 3 de 3 · Fibrinólise",
      question: "Sintomas há menos de 12 horas e sem contraindicação absoluta à fibrinólise?",
      summary: "Se elegível, o fibrinolítico deve sair idealmente em até 30 minutos.",
      prazos: [
        {
          id: "janela12h",
          aos: 720,
          marco: "inicioDoEvento" as const,
          aoVencer: "⏱️ Janela de 12 h do início dos sintomas para a fibrinólise.",
          aoUltrapassar: "seguirContando" as const,
          aoUltrapassarTexto:
            "⏱️ Passou de 12 h do início dos sintomas. Fora da janela, a fibrinólise deixa de ser a estratégia — a decisão passa a ser sobre isquemia persistente e transferência.",
        },
      ],
      options: [
        {
          id: "elegivel",
          label: "Sim — elegível",
          next: "v2_fibrinolise",
          gravidade: "favoravel",
          grava: { campo: "fibrino_elegivel", valor: "sim" },
        },
        {
          id: "contraindicado",
          label: "Não — há contraindicação absoluta",
          next: "v2_transferencia",
          gravidade: "critica",
          grava: { campo: "fibrino_elegivel", valor: "nao" },
        },
        {
          id: "conferir",
          label: "Preciso conferir a lista",
          next: "v2_ci_lista",
          gravidade: "neutra",
        },
      ],
    },

    // ── 12 · CONTRAINDICAÇÕES ────────────────────────────────────────────
    //
    // ⚠️ ITENS CONFERÍVEIS, NÃO UM PARÁGRAFO. A tela equivalente da V1 se chama
    // "confira item a item" e entrega 930 caracteres de texto corrido com 8
    // absolutas e 11 relativas. Ninguém confere item a item um parágrafo.
    v2_ci_lista: {
      id: "v2_ci_lista",
      type: "input",
      title: "Contraindicações à fibrinólise",
      intro: "Marque o que estiver PRESENTE. Item que você não consegue afastar conta como presente.",
      fields: [
        {
          id: "ci_absolutas",
          label: "Absolutas",
          multiplo: true,
          optional: true,
          presets: [
            { value: "hic", label: "Hemorragia intracraniana prévia, em qualquer época" },
            { value: "lesao_vascular", label: "Lesão vascular cerebral estrutural (MAV, aneurisma)" },
            { value: "neoplasia", label: "Neoplasia intracraniana maligna" },
            { value: "avc_3m", label: "AVC isquêmico nos últimos 3 meses" },
            { value: "disseccao", label: "Suspeita de dissecção de aorta" },
            { value: "sangramento", label: "Sangramento ativo ou diátese hemorrágica" },
            { value: "tce_3m", label: "Trauma craniano/facial significativo nos últimos 3 meses" },
            { value: "cirurgia_2m", label: "Cirurgia intracraniana ou intraespinhal nos últimos 2 meses" },
          ],
        },
        {
          id: "ci_relativas",
          label: "Relativas",
          multiplo: true,
          optional: true,
          presets: [
            { value: "has_grave", label: "PAS > 180 ou PAD > 110 mmHg na apresentação" },
            { value: "avc_antigo", label: "AVC isquêmico prévio há mais de 3 meses" },
            { value: "rcp", label: "RCP traumática ou prolongada (> 10 min)" },
            { value: "cirurgia_3s", label: "Cirurgia de grande porte há menos de 3 semanas" },
            { value: "sangramento_recente", label: "Sangramento interno recente (2 a 4 semanas)" },
            { value: "puncao", label: "Punção vascular não compressível" },
            { value: "gravidez", label: "Gravidez" },
            { value: "ulcera", label: "Úlcera péptica ativa" },
            { value: "anticoagulante", label: "Uso de anticoagulante oral" },
          ],
        },
      ],
      next: "v2_decisao3",
    },

    // ── 13 · FIBRINÓLISE ─────────────────────────────────────────────────
    //
    // ⚠️ A DOSE SÓ EXISTE AQUI PORQUE A DECISÃO 3 LIBEROU. E o fator 200 fica
    // na primeira dobra: errar mg por unidades erra por 200×, e é bolus único —
    // não há como corrigir depois.
    v2_fibrinolise: {
      id: "v2_fibrinolise",
      type: "input",
      title: "Fibrinólise — tenecteplase",
      intro:
        "Tenecteplase {tnk} mg IV em bolus único. ⚠️ 1 mg = 200 U — confira no frasco antes de aspirar, porque é bolus único e não há como corrigir depois. {avisoPeso}",
      // ⚠️ NÃO REPERGUNTA O PESO. Ele foi coletado na tela 02 e a dose de TNK é
      // interpolada de lá — reperguntar aqui seria o app desconfiando do que ele
      // mesmo guardou, e abriria a porta para dois pesos diferentes no mesmo
      // atendimento decidindo doses diferentes.
      fields: [
        {
          // Arma o relógio da reavaliação. Opcional: quem ainda não administrou
          // segue, e a tela seguinte diz que o relógio não está contando.
          id: "tnk_ha_min",
          label: "Se já administrou: há quantos minutos foi o bolus?",
          unit: "min",
          optional: true,
          allowCustom: true,
          customLabel: "Outro",
          customKeyboard: "numeric",
          presets: [
            { value: "0", label: "Agora" },
            { value: "30", label: "~30 min" },
            { value: "60", label: "~60 min" },
            { value: "90", label: "~90 min" },
          ],
        },
      ],
      next: "v2_reavaliacao",
    },

    // ── 14 · TRANSFERÊNCIA ───────────────────────────────────────────────
    v2_transferencia: {
      id: "v2_transferencia",
      type: "action",
      title: "Não fibrinolisar — transferir agora",
      summary: "Contraindicação absoluta ou janela inadequada.",
      actions: [
        "Organizar transferência imediata para intervenção coronária percutânea primária",
        "Ligar agora para o serviço de referência — a decisão precisa de quem vai assumir o paciente",
        "Antitrombóticos e anti-isquêmicos seguem em paralelo, conforme os vereditos",
      ],
      next: "v2_terapias",
    },

    // ── 15 · REAVALIAÇÃO 60–90 MIN ───────────────────────────────────────
    //
    // ⚠️ TRÊS ESTADOS, NÃO DOIS (correção do autor, 2026-08-26). Eu havia
    // desenhado "parcial / não consigo dizer" roteando como FALHA. Está errado
    // e repete o defeito que este app inteiro combate:
    //
    //     desconhecido ≠ negativo — E TAMBÉM ≠ positivo.
    //
    // A falha de reperfusão se define por achado OBJETIVO: resolução do ST
    // < 50% em 60–90 min, dor persistente ou em piora, instabilidade
    // hemodinâmica ou elétrica. Quem não conseguiu avaliar não tem nenhum
    // desses — tem uma avaliação incompleta, que é outra coisa.
    //
    // ⚠️ E O RELÓGIO CONTA DO BOLUS, não da abertura desta tela.
    v2_reavaliacao: {
      id: "v2_reavaliacao",
      type: "decision",
      title: "Ramo A · Reavaliação 60–90 min",
      question: "Houve reperfusão clínica e eletrocardiográfica?",
      summary: "Compare com o traçado de antes do fibrinolítico.",
      prazos: [
        {
          id: "reperfusao",
          aos: 90,
          marco: "ultimaDose" as const,
          aoVencer: "⏱️ Janela de 60–90 min desde o bolus para julgar a reperfusão.",
          aoUltrapassar: "seguirContando" as const,
          aoUltrapassarTexto:
            "⏱️ Passou de 90 min desde o bolus sem definição. Sem critério de reperfusão, a conduta é angiografia de resgate.",
        },
      ],
      comparativo: [
        {
          figura: "ecg_supra_anterior",
          rotulo: "Antes do fibrinolítico",
          significado: "Supra de ST no território acometido.",
          conduta: "Traçado de referência para a comparação.",
        },
        {
          figura: "ecg_normal",
          rotulo: "Reperfusão — ST resolvido",
          significado: "Queda do supra maior que 50% em relação ao traçado inicial.",
          conduta: "Critério eletrocardiográfico de reperfusão.",
        },
      ],
      options: [
        {
          id: "provavel",
          label: "Reperfusão provável — ST caiu > 50% e a dor cedeu",
          next: "v2_farmacoinvasiva",
          gravidade: "favoravel",
          grava: { campo: "reperfusao", valor: "provavel" },
        },
        {
          id: "falha",
          label: "Falha — ST não caiu, dor persiste ou há instabilidade",
          next: "v2_icp_resgate",
          gravidade: "critica",
          grava: { campo: "reperfusao", valor: "falha" },
        },
        {
          id: "indeterminado",
          label: "Não consegui avaliar",
          next: "v2_reperfusao_indeterminada",
          gravidade: "neutra",
          grava: { campo: "reperfusao", valor: "indeterminado" },
        },
      ],
    },

    // ── 16 · AVALIAÇÃO INDETERMINADA ─────────────────────────────────────
    //
    // ⚠️ ESTA TELA EXISTE PARA O INDETERMINADO NÃO FICAR PARADO NEM VIRAR
    // CONCLUSÃO. Ela não decide — diz o que falta para decidir. Enquanto o
    // estado for indeterminado, a estratégia não avança para "fármaco-invasiva
    // bem-sucedida" nem para resgate.
    v2_reperfusao_indeterminada: {
      id: "v2_reperfusao_indeterminada",
      type: "action",
      title: "Avaliação indeterminada",
      summary: "Não foi possível avaliar a reperfusão. Isto não é falha nem sucesso.",
      actions: [
        "Repetir o ECG agora, nas mesmas derivações do traçado inicial",
        "Comparar com o traçado pré-fibrinólise — a queda do ST se mede contra ele, não contra o normal",
        "Medir a resolução do ST: a referência é queda maior que 50% no território acometido",
        "Reavaliar a dor: persistente ou em piora conta como critério de falha",
        "Checar instabilidade hemodinâmica ou elétrica — qualquer uma delas fecha o critério de falha",
      ],
      porque: [
        "Falha de reperfusão se define por achado objetivo. Ausência de avaliação não é ausência de reperfusão, nem prova dela — e converter a dúvida em qualquer um dos dois lados decide por um dado que ninguém tem.",
      ],
      next: "v2_reavaliacao",
    },

    // ── 17 · ESTRATÉGIA FÁRMACO-INVASIVA ─────────────────────────────────
    v2_farmacoinvasiva: {
      id: "v2_farmacoinvasiva",
      type: "action",
      title: "Reperfusão provável — estratégia fármaco-invasiva",
      summary: "Transferir mesmo com reperfusão aparentemente bem-sucedida.",
      actions: [
        "Angiografia entre 2 e 24 h do fibrinolítico, com intenção de ICP quando indicada",
        "Transferir para centro com hemodinâmica — a indicação não depende de o paciente ter melhorado",
        "Manter monitorização contínua: a reoclusão é possível e costuma ser precoce",
      ],
      next: "v2_terapias",
    },

    // ── 18 · ICP DE RESGATE ──────────────────────────────────────────────
    v2_icp_resgate: {
      id: "v2_icp_resgate",
      type: "action",
      title: "Falha de reperfusão — ICP de resgate",
      summary: "Angiografia imediata com intenção de intervenção.",
      actions: [
        "Acionar a hemodinâmica para angiografia de resgate agora",
        "Não repetir o fibrinolítico",
        "Transferência imediata se o serviço não tiver hemodinâmica",
      ],
      next: "v2_terapias",
    },

    // ── 19 · TERAPIAS ────────────────────────────────────────────────────
    //
    // ⚠️ A CAMADA DE SEGURANÇA INTEIRA ENTRA AQUI SEM UMA LINHA REESCRITA.
    // `vereditoNitrato` e `vereditoMorfina` leem `pas`, `pde5_*`, `cor_perfusao`,
    // `cor_consciencia` e `supra_inferior` — e este último chega DERIVADO do
    // território, sem que o veredito saiba ou precise saber.
    //
    // ⚠️ SEM `actions`: dose de fármaco contraindicado impressa ao lado do
    // próprio bloqueio é o defeito que os vereditos existem para eliminar.
    v2_terapias: {
      id: "v2_terapias",
      type: "action",
      title: "Terapia anti-isquêmica",
      summary: "Cada fármaco responde pelos seus próprios impedimentos.",
      // ⚠️ SEM CAMPOS, E É O PONTO. A primeira versão desta tela reperguntava o
      // PDE-5 — que a tela 05 já coletou. Era o mesmo defeito que originou a
      // V2: o app perguntando de novo o que ele mesmo acabou de receber. Os
      // vereditos leem `TreeValues`; não precisam de coleta própria.
      //
      // ⚠️ E SEM `actions`: dose de fármaco contraindicado impressa ao lado do
      // próprio bloqueio é o defeito que os vereditos existem para eliminar.
      actions: [],
      vereditos: [
        { id: "nitrato", avaliar: vereditoNitrato },
        { id: "morfina", avaliar: vereditoMorfina },
      ],
      next: "v2_fim_do_caminho",
    },

    // ── 20 · FIM DO CAMINHO CRÍTICO ──────────────────────────────────────
    //
    // ⚠️ TERMINAL DECLARADO. Ramo sem supra, complicações, unidade coronariana
    // e alta estão no mapa aprovado e NÃO entram nesta etapa — a decisão do
    // autor foi testar este caminho no telefone antes de construir o resto.
    // Um destino honesto vale mais que um ramo pela metade.
    // ⚠️ TERMINAL DE VERDADE, e isso é estrutural. A primeira versão fechava o
    // ciclo voltando para `v2_entrada` — e `test:arvores` reprovou os 23 nós
    // com "sem-caminho-para-o-fim", com razão: uma árvore em que todo caminho
    // é um laço não tem desfecho, e a auditoria de grafo deixa de conseguir
    // distinguir um fluxo que termina de um que se perdeu.
    //
    // Um nó de transição sem `targets` é o fim declarado.
    v2_fim_do_caminho: {
      id: "v2_fim_do_caminho",
      type: "transition",
      title: "Fim do caminho crítico desta versão",
      summary: "Até aqui vai a SCA V2 nesta etapa.",
      disposition: "other_module",
      exitCriteria: [
        "Ramo sem supra, complicações pós-IAM, unidade coronariana e checklist de alta ainda não foram construídos nesta versão",
        "Para esses, use o módulo de Síndromes Coronarianas (V1), que segue completo e publicado",
      ],
      targets: [],
    },

    // ── 06c · OCLUSÃO SEM SUPRA CLÁSSICO ─────────────────────────────────
    //
    // ⚠️ A TRAVA QUE IMPEDE `sem supra → NSTE automático`. Achado do autor,
    // 2026-08-27: a V2 mandava o "não" da Decisão 1 direto para o ramo sem
    // supra. Cinco padrões ocluem a coronária sem elevar o ST nas derivações
    // padrão — e dois deles só aparecem em derivações que ninguém colocou.
    //
    // ⚠️ CURTA DE PROPÓSITO, não é galeria. Três padrões nomeados, "nenhum
    // destes" e a dúvida. A varredura completa continua na V1.
    v2_oclusao_sem_supra: {
      id: "v2_oclusao_sem_supra",
      type: "decision",
      title: "Antes de seguir como sem supra",
      question: "Há algum destes padrões de oclusão ou alto risco?",
      summary: "Sem supra no traçado padrão NÃO significa sem oclusão.",
      comparativo: [
        {
          figura: "ecg_de_winter",
          rotulo: "De Winter",
          significado: "Infra ascendente em V1–V6 com T altas e simétricas.",
          conduta: "Oclusão proximal da DA — sala agora.",
          optionId: "de_winter",
        },
        {
          figura: "ecg_posterior",
          rotulo: "Posterior",
          significado: "V1–V3 com infra horizontal, R alta e larga, T positiva.",
          conduta: "Confirmar em V7–V9 — o limiar ali é 0,5 mm.",
          optionId: "posterior",
        },
        {
          figura: "ecg_avr_tronco",
          rotulo: "aVR com infra difuso",
          significado: "Supra em aVR com infra em ≥ 6 derivações.",
          conduta: "Alto risco — avaliação invasiva, não fibrinólise.",
          optionId: "avr",
        },
      ],
      options: [
        { id: "de_winter", label: "De Winter", next: "v2_oclusao_alto_risco", gravidade: "critica", grava: { campo: "padrao_oclusao", valor: "de_winter" } },
        { id: "posterior", label: "Posterior", next: "v2_oclusao_alto_risco", gravidade: "critica", grava: { campo: "padrao_oclusao", valor: "posterior" } },
        {
          // ⚠️ CAMINHO PRÓPRIO, E ISTO É CLÍNICO. O padrão de tronco NÃO é
          // candidato a trombolítico — mandá-lo para a Decisão 2 o levaria à
          // Decisão 3, que oferece fibrinólise. A V1 já separa este ramo
          // ("Sala urgente — fibrinólise fora") e a V2 mantém a separação.
          id: "avr",
          label: "Supra em aVR com infra difuso",
          next: "v2_avr_alto_risco",
          gravidade: "critica",
          grava: { campo: "padrao_oclusao", valor: "avr" },
        },
        { id: "nenhum", label: "Nenhum destes", next: "v2_sem_supra_parcial", grava: { campo: "padrao_oclusao", valor: "nenhum" } },
        {
          id: "nao_sei",
          label: "Não sei — me ajude",
          next: "v2_oclusao_ajuda",
          gravidade: "neutra",
          grava: { campo: "padrao_oclusao", valor: "nao_sei" },
        },
      ],
    },

    // ── 06d · AJUDA DOS PADRÕES DE OCLUSÃO ───────────────────────────────
    //
    // Critérios abertos e os mesmos traçados. A terceira saída preserva a
    // dúvida: quem continua sem conseguir determinar NÃO é empurrado para o
    // ramo sem supra — vai para a orientação de registrar as derivações que
    // faltam, que é o que de fato resolve dois destes padrões.
    v2_oclusao_ajuda: {
      id: "v2_oclusao_ajuda",
      type: "decision",
      title: "Reconhecer oclusão sem supra clássico",
      question: "Com estes critérios, algum dos padrões está presente?",
      evidence: [
        OCLUSAO_SEM_SUPRA_ABERTURA,
        OCLUSAO_DE_WINTER,
        OCLUSAO_POSTERIOR,
        DERIVACOES_POSTERIORES_COMO,
        OCLUSAO_T_HIPERAGUDA,
        // ⚠️ TEXTO PRÓPRIO DA V2, e não o `OCLUSAO_AVR_TRONCO` da V1. Aquele
        // diz que o padrão "sugere lesão de tronco", e o autor pediu que a V2
        // não nomeie a anatomia: o que o ECG estabelece é isquemia extensa de
        // alto risco e que o trombolítico está fora. A anatomia quem define é a
        // angiografia. A constante da V1 fica como está — ela está congelada.
        "SUPRA EM aVR COM INFRA DIFUSO (≥ 6 derivações): padrão de isquemia subendocárdica EXTENSA e de alto risco. Não é candidato a trombolítico por este padrão, e a conduta é avaliação invasiva. ⚠️ O ECG não fecha a anatomia — quem define é a angiografia.",
      ],
      comparativo: [
        {
          figura: "ecg_de_winter",
          rotulo: "De Winter",
          significado: "Infra ascendente no ponto J em V1–V6, seguida de T altas e simétricas.",
          conduta: "Não espere virar supra: pode não virar.",
          optionId: "de_winter",
        },
        {
          figura: "ecg_posterior",
          rotulo: "Posterior",
          significado: "Imagem em espelho em V1–V3; confirmar nas posteriores.",
          conduta: "Supra de 0,5 mm em V7–V9 já fecha.",
          optionId: "posterior",
        },
        {
          figura: "ecg_t_hiperaguda",
          rotulo: "T hiperaguda",
          significado: "T altas, largas e simétricas — pode preceder o supra.",
          conduta: "Repetir o ECG em minutos.",
          optionId: "de_winter",
        },
      ],
      options: [
        { id: "de_winter", label: "De Winter ou T hiperaguda", next: "v2_oclusao_alto_risco", gravidade: "critica", grava: { campo: "padrao_oclusao", valor: "de_winter" } },
        { id: "posterior", label: "Posterior", next: "v2_oclusao_alto_risco", gravidade: "critica", grava: { campo: "padrao_oclusao", valor: "posterior" } },
        { id: "avr", label: "aVR com infra difuso", next: "v2_avr_alto_risco", gravidade: "critica", grava: { campo: "padrao_oclusao", valor: "avr" } },
        { id: "nenhum", label: "Nenhum destes", next: "v2_sem_supra_parcial", grava: { campo: "padrao_oclusao", valor: "nenhum" } },
        {
          id: "indeterminado",
          label: "Continuo sem conseguir determinar",
          next: "v2_oclusao_indeterminado",
          gravidade: "neutra",
          grava: { campo: "padrao_oclusao", valor: "nao_sei" },
        },
      ],
    },

    // ── 06e · OCLUSÃO NÃO DETERMINADA ────────────────────────────────────
    //
    // ⚠️ MESMA REGRA DO ECG INDETERMINADO: a dúvida não vira "nenhum". Dois
    // destes padrões só aparecem em derivações que ninguém colocou, e é isso
    // que a tela manda fazer — não é conselho genérico, é o que resolve.
    v2_oclusao_indeterminado: {
      id: "v2_oclusao_indeterminado",
      type: "action",
      title: "Padrão ainda não determinado",
      summary: "Isto não é 'nenhum destes'. É 'ainda não sei'.",
      // ⚠️ DERIVAÇÃO CONFORME A SUSPEITA, NÃO EM BLOCO (correção do autor,
      // 2026-08-27). A primeira versão mandava registrar V7–V9 E V3R–V4R em
      // todo caso indeterminado. Cada conjunto responde a uma pergunta
      // diferente, e pedir os dois sempre é ruído que treina a ignorar o pedido
      // — além de sugerir que o app suspeita das duas coisas quando ele não
      // suspeita de nenhuma.
      actions: [
        "Se a suspeita for POSTERIOR (infra horizontal em V1–V3 com R alta e larga): registrar V7–V9 — o limiar ali é 0,5 mm",
        "Se houver supra INFERIOR (II, III, aVF): registrar V3R–V4R para pesquisar ventrículo direito",
        "Se não for possível distinguir o padrão: completar a avaliação do ECG sem assumir nenhum deles — repetir o traçado em poucos minutos e comparar, porque T hiperaguda e De Winter mudam com o tempo",
        "Ligar para o serviço de referência antes de classificar como sem supra — a decisão precisa de quem vai assumir o paciente",
      ],
      porque: [
        "Enquanto o padrão não for afastado, o paciente não é reclassificado como sem supra — a dúvida não o tira da fila da reperfusão.",
      ],
      next: "v2_oclusao_sem_supra",
    },

    // ── 06f · OCLUSÃO DE ALTO RISCO CONFIRMADA ───────────────────────────
    v2_oclusao_alto_risco: {
      id: "v2_oclusao_alto_risco",
      type: "action",
      title: "Oclusão de alto risco — sala agora",
      summary: "Reperfusão com a mesma urgência do STEMI, mesmo sem supra clássico.",
      actions: [
        "Acionar a hemodinâmica AGORA — o relógio da reperfusão conta a partir deste reconhecimento",
        "Não aguardar troponina para decidir: o padrão do ECG já indica oclusão",
        "Seguir pela mesma decisão de reperfusão do STEMI",
      ],
      next: "v2_decisao2",
    },

    // ── 06g · aVR / TRONCO ───────────────────────────────────────────────
    //
    // ⚠️ NÃO PASSA PELA DECISÃO 3. Este ramo existe separado justamente porque
    // o padrão de tronco ou multiarterial NÃO é candidato a trombolítico —
    // roteá-lo pela reperfusão comum o levaria à tela que oferece fibrinólise.
    v2_avr_alto_risco: {
      id: "v2_avr_alto_risco",
      type: "action",
      title: "Alto risco — fibrinólise não indicada",
      summary:
        "Padrão de isquemia subendocárdica extensa e de alto risco. A fibrinólise não está indicada por este padrão.",
      actions: [
        "Avaliação invasiva com urgência — acionar a hemodinâmica",
        "NÃO administrar trombolítico com base neste padrão",
        "Considerar anatomia coronariana crítica conforme o contexto clínico — o padrão SUGERE, não fecha diagnóstico",
        "Antitrombóticos e anti-isquêmicos conforme os vereditos, sem atrasar a sala",
      ],
      porque: [
        "⚠️ O ECG não nomeia a artéria acometida. O que este padrão estabelece é isquemia extensa de alto risco e que o trombolítico não é o caminho — a anatomia quem define é a angiografia.",
      ],
      next: "v2_terapias",
    },

    // Destino provisório do ramo sem supra: existe para o grafo não ter aresta
    // solta, e diz a verdade sobre o que ainda não foi construído.
    v2_sem_supra_parcial: {
      id: "v2_sem_supra_parcial",
      type: "action",
      title: "Sem supra — ainda não construído nesta versão",
      summary: "O ramo B está no mapa aprovado e vem depois deste caminho ser testado.",
      actions: [
        "Troponina ultrassensível seriada, reavaliação clínica e do ECG, estratificação de risco e estratégia invasiva",
        "Enquanto o ramo B da V2 não existe, use o módulo de Síndromes Coronarianas (V1)",
      ],
      next: "v2_terapias",
    },
  },
};

/**
 * Exportado para as travas: a V2 não pode reescrever lógica clínica, e é isto
 * que se confere — as funções vêm das mesmas libs que a V1 usa.
 */
export const V2_REUSA = {
  vereditos: ["vereditoNitrato", "vereditoMorfina"],
  instabilidade: ["blocoConscienciaViaAerea", "blocoRespiracao", "blocoCirculacao", "blocoRitmo", "avaliarAmeacaImediata"],
  tempo: ["alertaDoEcg"],
  ecg: ["suspeitaDeVd"],
} as const;

// Consumidos pelos nós de dose acima; declarados aqui para a auditoria de
// procedência enxergar a fonte única.
void TENECTEPLASE_APRESENTACAO;
void TENECTEPLASE_REGIME_IAM;
void ENOXAPARINA_APRESENTACAO;
void ENOXAPARINA_REGIME_IAM;
void suspeitaDeVd;
