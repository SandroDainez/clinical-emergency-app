import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import {
  INTRO_GUIADA,
  OPCAO_GUIADA,
  camposDeInstabilidade,
  roteamentoDeInstabilidade,
} from "./lib/instabilidade-guiada";
import {
  ADENOSINA_ADMINISTRACAO,
  ADENOSINA_ANTES_DE_REPETIR,
  ADENOSINA_CONTRAINDICACOES,
  ADENOSINA_DOSE_TSV,
  ADENOSINA_INTERACOES,
  ADENOSINA_SEM_ANTIDOTO,
} from "./lib/adenosina";
import {
  AMIODARONA_COM_PULSO_CARGA,
  AMIODARONA_COM_PULSO_MANUTENCAO,
  AMIODARONA_COM_PULSO_RECORRENCIA,
  AMIODARONA_COM_PULSO_VIGILANCIA,
} from "./lib/amiodarona-com-pulso";
import {
  MAGNESIO_APRESENTACAO,
  MAGNESIO_TORSADES_COM_PULSO,
  MAGNESIO_TORSADES_MANUTENCAO,
} from "./lib/magnesio-torsades";
import {
  TORSADES_ACELERAR,
  TORSADES_PONTEIRO_ELETROLITOS,
  TORSADES_REMOVER_CAUSA,
} from "./lib/torsades-recorrente";

/**
 * Algoritmo ACLS de Taquicardia no adulto com pulso (AHA 2025).
 * Fluxo interativo passo-a-passo conduzido como um instrutor de ACLS.
 *
 * Energias de cardioversão sincronizada:
 * - Taquicardia de QRS estreito (TSV): 100 J
 * - Flutter atrial: 200 J (AHA 2025 — NÃO agrupar com a TSV)
 * - QRS estreito irregular (FA): ≥ 200 J bifásico (AHA 2025)
 * - QRS largo regular (TV monomórfica): 100 J
 * - QRS largo irregular (TV polimórfica): desfibrilação NÃO sincronizada
 * Adenosina: 6 mg IV rápido + flush → 12 mg → 12 mg.
 *
 * ATRIBUIÇÃO, porque as duas diretrizes divergem e este cabeçalho diz "AHA 2025":
 *
 *  - AHA/ACLS: "First dose: 6 mg rapid IV push; follow with NS flush. Second dose:
 *    12 mg if required." NÃO traz terceira dose — após a falha, reavaliar o
 *    diagnóstico e considerar betabloqueador ou bloqueador de canal de cálcio.
 *  - Resuscitation Council UK (ALS): "6 mg adenosine should be administered as a
 *    very rapid intravenous bolus. If there is no response to adenosine 6 mg, give a
 *    12 mg bolus. If there is no further response give one further 12 mg bolus."
 *
 * O app segue o esquema do RCUK (6–12–12), que é o de uso corrente no Brasil. A
 * terceira dose fica explicitamente atribuída no texto da conduta, para quem lê não
 * atribuir à AHA algo que a AHA não recomenda.
 *
 * ⚠️ Não confundir com "terceira dose de 18 mg": esse esquema não foi localizado em
 * ERC 2025 nem em RCUK 2025. As únicas menções encontradas foram um protocolo local
 * em relato de caso e um artigo de 1994. Não entrou no app por isso.
 */
export const tachycardiaDecisionTree: DecisionTreeDefinition = {
  id: "acls_tachycardia_2025",
  version: "2025.1",
  label: "Taquicardia ACLS",
  entryNodeId: "entry",
  nodes: {
    entry: {
      id: "entry",
      type: "action",
      title: "Reconhecimento e monitorização inicial",
      // O "≥ 150" da AHA é DESCRITIVO, não definição nem porta de entrada.
      //
      // A versão anterior escrevia "Taquicardia com pulso = FC ≥ 150 bpm" e
      // mandava "identificar taquicardia no monitor (FC ≥ 150 bpm)". Isso
      // transforma uma observação epidemiológica em critério, com dois efeitos
      // ruins: exclui do fluxo a taquiarritmia entre 100 e 150 — que adoece,
      // sobretudo em quem já tem disfunção ventricular, exatamente a ressalva
      // que a própria AHA faz — e sugere que chegar a 150 já é motivo de
      // conduta, quando a 150 mais comum no pronto-socorro é taquicardia
      // SINUSAL, que não se cardioverte: trata-se a causa.
      //
      // Taquicardia é FC > 100. O que decide a conduta é instabilidade
      // atribuível à arritmia + o ritmo no ECG — nunca o número sozinho.
      summary: "Taquicardia = FC > 100 bpm. O que decide a conduta é a instabilidade atribuível à arritmia e o ritmo no ECG — não o número.",
      actions: [
        "Identificar a taquicardia no monitor e correlacionar com os sintomas. Taquiarritmia com repercussão hemodinâmica é TÍPICA a partir de ~150 bpm, mas isso é observação, não critério.",
        "ABAIXO de 150: sintomas atribuíveis só à frequência são incomuns — EXCETO em quem já tem disfunção ventricular, valvopatia ou coronariopatia, em que frequências menores já descompensam. Não descarte o caso pelo número.",
        "ANTES de tratar o número: a taquicardia é SINUSAL? Febre, dor, hipovolemia, anemia, ansiedade, hipóxia, sepse, abstinência, drogas. Taquicardia sinusal NÃO se cardioverte nem se freia às cegas — trata-se a causa; frear a resposta compensatória pode piorar o paciente.",
        "Manter via aérea pérvia; O₂ se SpO₂ < 94% ou desconforto respiratório.",
        "Monitor cardíaco, PA, oximetria e acesso IV.",
        "ECG de 12 derivações se disponível (não atrasar o tratamento do paciente instável).",
      ],
      next: "assess_stability",
    },

    assess_stability: {
      id: "assess_stability",
      type: "decision",
      title: "A taquicardia está causando instabilidade?",
      question: "Há sinais de instabilidade ATRIBUÍVEIS à taquicardia?",
      summary: "A instabilidade precisa ser causada pela arritmia — não pela doença de base.",
      evidence: [
        "Hipotensão / sinais de choque (má perfusão, palidez, sudorese).",
        "Alteração aguda do estado mental.",
        "Desconforto torácico isquêmico em curso.",
        "Insuficiência cardíaca aguda (congestão, dispneia, EAP).",
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "tqi_dados" },
        { id: "instavel", label: "Sim — paciente INSTÁVEL", next: "unstable_cardioversion" },
        { id: "estavel", label: "Não — paciente estável", next: "assess_qrs" },
      ],
    },

    // ── Caminho guiado ────────────────────────────────────────────────────────
    //
    // Mesmo desenho da bradicardia, e pelo mesmo motivo: "há sinais de
    // instabilidade ATRIBUÍVEIS à taquicardia?" é pergunta de especialista.
    // Os critérios de instabilidade da AHA são OS MESMOS nas duas arritmias —
    // hipotensão, alteração aguda do estado mental, sinais de choque, dor
    // torácica isquêmica, insuficiência cardíaca aguda. Por isso a decomposição
    // é a mesma, incluindo a distinção que faltava na primeira versão da
    // bradicardia: choque e IC aguda são critérios COMPOSTOS, e metade deles
    // não conclui instabilidade.
    tqi_dados: {
      id: "tqi_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro:
        "Responda o que dá para observar agora, à beira do leito. Não precisa saber o que cada achado significa — o app conclui no fim. Na dúvida sobre um item, responda \"Não\": ele deixa de contar, e os demais continuam valendo.",
      fields: camposDeInstabilidade(),
      next: roteamentoDeInstabilidade({
        instavel: "tqi_conclusao_instavel",
        limitrofe: "tqi_conclusao_limitrofe",
        estavel: "tqi_conclusao_estavel",
      }),
    },

    tqi_conclusao_instavel: {
      id: "tqi_conclusao_instavel",
      type: "action",
      title: "Pelo que você respondeu: paciente INSTÁVEL",
      summary: "O que você marcou fecha um dos critérios de instabilidade da diretriz, com a taquicardia em curso.",
      actions: [
        "Critérios da diretriz: hipotensão, alteração aguda do estado mental, sinais de choque, dor torácica isquêmica ou insuficiência cardíaca aguda.",
        "Basta UM critério FECHADO — não é preciso ter todos. Mas os dois compostos só fecham completos: choque = pele alterada COM má perfusão objetiva; IC aguda = dispneia COM congestão.",
        "ANTES de cardioverter, confirme que o ritmo é uma TAQUIARRITMIA e não taquicardia SINUSAL. Na sinusal a frequência é resposta a outra coisa (febre, dor, hipovolemia, anemia, hipóxia, sepse) — cardioverter não resolve e tirar a compensação piora o paciente.",
        "Se a instabilidade tiver causa evidente e independente da arritmia, trate a causa em paralelo e reavalie com quem estiver conduzindo o caso.",
        "Siga para a cardioversão sincronizada.",
      ],
      next: "unstable_cardioversion",
    },

    tqi_conclusao_limitrofe: {
      id: "tqi_conclusao_limitrofe",
      type: "action",
      title: "Achado isolado — ainda NÃO é critério de instabilidade",
      summary:
        "O que você marcou é um sinal real, mas sozinho não fecha nenhum dos critérios da diretriz. Não cardioverta ainda — siga a via do paciente estável, reavaliando.",
      actions: [
        "Pele fria, pálida ou suada entra na definição de CHOQUE quando vem com má perfusão objetiva — enchimento capilar lento, débito urinário muito reduzido, hipotensão ou alteração do estado mental. Sozinha, aparece também em dor, ansiedade, febre, hipoglicemia e reação vagal.",
        "Falta de ar entra na definição de INSUFICIÊNCIA CARDÍACA AGUDA quando vem com congestão — estertores na ausculta, ortopneia ou queda da saturação. Sozinha, pode ser ansiedade, dor, anemia, doença pulmonar.",
        "O QUE FAZER AGORA: monitorização contínua, oxigênio se SpO₂ < 94%, acesso venoso e ECG de 12 derivações — é o ECG que define a conduta do paciente estável.",
        "REAVALIAR em poucos minutos, e a cada mudança. Se surgir hipotensão, alteração do estado mental, dor torácica isquêmica, ou o achado ganhar o par que falta, passa a ser taquicardia INSTÁVEL — cardioversão sincronizada imediata.",
        "Manter material de cardioversão e sedação prontos à beira do leito enquanto reavalia.",
      ],
      next: "assess_qrs",
    },

    tqi_conclusao_estavel: {
      id: "tqi_conclusao_estavel",
      type: "action",
      title: "Pelo que você respondeu: paciente ESTÁVEL",
      summary: "Nenhum critério de instabilidade fechado. A conduta passa a depender do RITMO — é o ECG que decide.",
      actions: [
        "Estável não é sinônimo de benigno: significa que há tempo para o ECG de 12 derivações e para escolher o tratamento certo do ritmo.",
        "Reavaliar continuamente. Instabilidade pode surgir a qualquer momento — e aí a conduta muda para cardioversão sincronizada.",
        "Seguir para a análise do QRS (estreito ou largo, regular ou irregular).",
      ],
      next: "assess_qrs",
    },

    unstable_cardioversion: {
      id: "unstable_cardioversion",
      type: "action",
      title: "Cardioversão sincronizada IMEDIATA",
      summary: "Taquicardia instável com pulso → restaurar o ritmo sem demora.",
      actions: [
        "Cardioversão SINCRONIZADA. Sedação/analgesia se o paciente estiver consciente e o tempo permitir.",
        "Energia inicial (AHA 2025): TSV de QRS estreito 100 J · FA 200 J · flutter atrial 200 J · TV monomórfica com pulso 100 J · TV polimórfica: choque NÃO sincronizado em alta energia.",
        "Se o protocolo institucional ou o fabricante do equipamento indicar outra energia — por exemplo 50–100 J bifásicos no flutter — seguir a parametrização validada localmente, sem atrasar o tratamento.",
        "QRS largo irregular (TV polimórfica): desfibrilação NÃO sincronizada (alta energia).",
        // A dose saiu daqui de propósito: neste nó a adenosina é uma PONTE
        // enquanto o cardioversor carrega, e o esquema inteiro (com a técnica,
        // que é o que faz a diferença) vive no nó do QRS estreito regular.
        // Repetir "6 mg" aqui recriaria a cópia que a fonte única desfez.
        "Se QRS estreito e regular, considerar adenosina enquanto prepara o cardioversor — no esquema e na técnica do ramo de QRS estreito regular. NÃO atrasar a cardioversão por causa dela.",
      ],
      next: "unstable_reavaliar",
    },

    // ── Ciclo do paciente instável ────────────────────────────────────────────
    //
    // Antes, a cardioversão levava DIRETO para a disposição em UTI: um choque,
    // reavalia, fim. O algoritmo não tinha o que fazer quando o ritmo não
    // reverte — que é justamente o momento em que quem conduz mais precisa de
    // ajuda. Faltavam a repetição com escalada de energia, o antiarrítmico e a
    // saída para PCR se o pulso se perder.
    unstable_reavaliar: {
      id: "unstable_reavaliar",
      type: "decision",
      title: "Depois do choque: o que aconteceu?",
      question: "Reavalie ritmo e pulso IMEDIATAMENTE após o choque.",
      summary: "A reavaliação após cada choque é o que decide o próximo passo — não avance sem ela.",
      evidence: [
        "Reverteu: ritmo organizado, com pulso, e a perfusão melhora.",
        "Não reverteu: a taquiarritmia persiste, ou volta em seguida (recorrência precoce).",
        "Sem pulso: qualquer ritmo sem pulso — inclusive FV desencadeada pelo choque — é PCR.",
      ],
      options: [
        { id: "reverteu", label: "Reverteu — ritmo e pulso recuperados", next: "unstable_disposition" },
        { id: "refratario", label: "NÃO reverteu ou recorreu", next: "unstable_refratario" },
        { id: "sem_pulso", label: "Perdeu o pulso", next: "unstable_sem_pulso" },
      ],
    },

    unstable_refratario: {
      id: "unstable_refratario",
      type: "action",
      title: "Não reverteu — antes de repetir o choque",
      summary: "Checar o aparelho e a técnica ANTES de escalar. A causa mais comum de choque sem efeito é técnica, não refratariedade real.",
      actions: [
        "⚠️ REARMAR O SYNC. A maioria dos cardioversores SAI do modo sincronizado após cada choque. Se ninguém reapertar SYNC, o próximo disparo sai não sincronizado — e um choque não sincronizado sobre a onda T pode desencadear FV.",
        "Conferir se o aparelho está marcando cada QRS (setas de sincronismo sobre as ondas R). Sem marcação, o choque não sai — trocar a derivação ou reposicionar os eletrodos.",
        "Conferir contato: pás/pás adesivas bem aderidas, gel suficiente, pele seca, sem curativo ou adesivo de medicação embaixo. Considerar posição ântero-posterior — melhora a eficácia sobretudo em FA.",
        "APROFUNDAR A SEDAÇÃO se o paciente estiver reagindo. Paciente semiacordado se move, e movimento atrapalha o sincronismo.",
        "REPETIR a cardioversão com energia ESCALADA — subir para o próximo degrau disponível no aparelho, até a energia máxima.",
        "CORRIGIR o que sustenta a arritmia: hipóxia, hipocalemia, hipomagnesemia, acidose, isquemia, drogas (cocaína, simpaticomiméticos), hipovolemia, hipotermia.",
        "TV POLIMÓRFICA (torsades): choque NÃO sincronizado em alta energia — a morfologia variável impede o sincronismo. Depois do choque, a conduta tem três pernas, e nenhuma sozinha fecha o ciclo.",
        MAGNESIO_TORSADES_COM_PULSO,
        TORSADES_ACELERAR,
        TORSADES_REMOVER_CAUSA,
        "⚠️ NÃO usar amiodarona no torsades: ela prolonga o QT, que é o substrato da arritmia.",
        "ANTIARRÍTMICO se a TV MONOMÓRFICA persistir apesar dos choques:",
        AMIODARONA_COM_PULSO_CARGA,
        AMIODARONA_COM_PULSO_MANUTENCAO,
        AMIODARONA_COM_PULSO_RECORRENCIA,
        "CHAMAR ESPECIALISTA (cardiologia/eletrofisiologia) — refratariedade à cardioversão muda a conduta e pode exigir marcapasso, sedação profunda ou suporte avançado.",
        "Voltar a reavaliar após cada choque. O ciclo se repete: reavaliar → corrigir → escalar → chocar.",
      ],
      next: "unstable_reavaliar",
    },

    unstable_sem_pulso: {
      id: "unstable_sem_pulso",
      type: "transition",
      title: "Sem pulso — isto é PCR",
      summary: "Iniciar RCP imediatamente e seguir o algoritmo de parada.",
      disposition: "icu",
      exitCriteria: [
        "Iniciar compressões AGORA — não repetir cardioversão sincronizada em paciente sem pulso.",
        "Ritmo chocável sem pulso (FV/TV) → desfibrilação NÃO sincronizada em alta energia.",
        "A FV pode ter sido desencadeada por um choque que saiu fora de sincronismo — seguir o algoritmo de PCR, não voltar para o de taquicardia.",
      ],
      targets: [
        {
          moduleId: "pcr-adulto",
          label: "Abrir guia de PCR",
          reason: "Paciente perdeu o pulso — seguir o algoritmo de parada.",
        },
      ],
    },

    unstable_disposition: {
      id: "unstable_disposition",
      type: "transition",
      title: "Reavaliar e estabilizar — UTI",
      summary: "Após a cardioversão, reavaliar ritmo, pulso e perfusão.",
      disposition: "icu",
      exitCriteria: [
        "Reavaliar ritmo e pulso imediatamente após cada choque — e de novo a cada mudança clínica.",
        "RECORRÊNCIA é comum: se a taquiarritmia voltar, o ciclo recomeça (reavaliar → corrigir causa → escalar energia → chocar), e o antiarrítmico passa a ter papel para SUSTENTAR o ritmo revertido.",
        "Se perder o pulso → iniciar o algoritmo de PCR.",
        "Corrigir o que desencadeou: distúrbio eletrolítico (K, Mg), hipóxia, isquemia, drogas, hipovolemia, tireotoxicose.",
        "Cardiologia + UTI; identificar e tratar a causa da arritmia.",
      ],
      targets: [
        {
          moduleId: "pcr-adulto",
          label: "Abrir guia de PCR",
          reason: "Se o paciente perder o pulso durante ou após a cardioversão.",
        },
      ],
    },

    assess_qrs: {
      id: "assess_qrs",
      type: "decision",
      title: "Largura do QRS",
      question: "O QRS é largo (≥ 0,12 s)?",
      summary: "A largura do QRS separa os ramos de conduta no paciente estável.",
      evidence: [
        "QRS estreito (< 0,12 s): geralmente supraventricular.",
        "QRS largo (≥ 0,12 s): tratar como TV até prova em contrário.",
      ],
      options: [
        { id: "largo", label: "QRS LARGO (≥ 0,12 s)", next: "wide_regularity" },
        { id: "estreito", label: "QRS estreito (< 0,12 s)", next: "narrow_regularity" },
      ],
    },

    narrow_regularity: {
      id: "narrow_regularity",
      type: "decision",
      title: "QRS estreito — ritmo regular ou irregular?",
      question: "O ritmo é regular ou irregular?",
      evidence: [
        "Regular: TSV (TRNAV, TRAV), flutter, taquicardia sinusal.",
        "Irregular: fibrilação atrial, flutter com condução variável, TAM.",
      ],
      options: [
        { id: "regular", label: "Regular", next: "narrow_regular" },
        { id: "irregular", label: "Irregular", next: "narrow_irregular" },
      ],
    },

    narrow_regular: {
      id: "narrow_regular",
      type: "action",
      title: "QRS estreito regular — manobras vagais e adenosina",
      summary: "Provável TSV por reentrada.",
      actions: [
        "Manobras vagais (Valsalva modificada ou massagem do seio carotídeo).",
        ADENOSINA_DOSE_TSV,
        ADENOSINA_ADMINISTRACAO,
        ADENOSINA_ANTES_DE_REPETIR,
        ADENOSINA_CONTRAINDICACOES,
        ADENOSINA_INTERACOES,
        ADENOSINA_SEM_ANTIDOTO,
        "Sem resposta: controle de frequência com diltiazem 15–20 mg IV ou metoprolol 5 mg IV.",
        "Consultar especialista. Se instabilizar → cardioversão sincronizada 100 J (TSV de QRS estreito).",
      ],
      next: "stable_reassess",
    },

    narrow_irregular: {
      id: "narrow_irregular",
      type: "action",
      title: "QRS estreito irregular — provável FA / flutter / TAM",
      summary: "Foco em controle de frequência e risco tromboembólico.",
      actions: [
        "Controle de frequência: diltiazem 15–20 mg IV OU metoprolol 5 mg IV.",
        "Considerar anticoagulação se FA > 48 h ou duração indeterminada.",
        "Reversão química/elétrica conforme avaliação da cardiologia.",
        "⚠️ Evitar bloqueadores do nó AV em FA com pré-excitação (WPW) — risco de FV. Se instabilizar → cardioversão sincronizada 200 J, tanto na FA quanto no flutter (AHA 2025).",
      ],
      next: "stable_reassess",
    },

    wide_regularity: {
      id: "wide_regularity",
      type: "decision",
      title: "QRS largo — ritmo regular ou irregular?",
      question: "O ritmo é regular ou irregular?",
      evidence: [
        "Regular: TV monomórfica (mais comum) ou TSV com aberrância.",
        "Irregular: TV polimórfica, Torsades de Pointes ou FA com pré-excitação (WPW).",
      ],
      options: [
        { id: "regular", label: "Regular", next: "wide_regular" },
        { id: "irregular", label: "Irregular", next: "wide_irregular" },
      ],
    },

    wide_regular: {
      id: "wide_regular",
      type: "action",
      title: "QRS largo regular — tratar como TV monomórfica",
      summary: "QRS largo + taquicardia = TV até prova em contrário.",
      actions: [
        AMIODARONA_COM_PULSO_CARGA,
        AMIODARONA_COM_PULSO_MANUTENCAO,
        AMIODARONA_COM_PULSO_RECORRENCIA,
        AMIODARONA_COM_PULSO_VIGILANCIA,
        "Procainamida 20–50 mg/min IV até suprimir a arritmia, surgir hipotensão, o QRS aumentar mais de 50% ou atingir 17 mg/kg; manutenção 1–4 mg/min. Evitar em QT prolongado, insuficiência cardíaca descompensada ou disfunção ventricular grave; confirmar disponibilidade no Brasil.",
        "Adenosina pode ser tentada SOMENTE se regular e monomórfico, com suspeita de TSV com aberrância.",
        "⚠️ NÃO usar bloqueadores do nó AV (verapamil/diltiazem) em TV — risco de colapso.",
        "── É TV OU TSV COM ABERRÂNCIA? O CUSTO DE ERRAR NÃO É O MESMO NOS DOIS LADOS ──",
        "Tratar uma TSV-com-aberrância COMO TV custa uma amiodarona desnecessária num paciente que ia reverter de outro jeito. Tratar uma TV COMO TSV — verapamil ou diltiazem — pode matar: bloqueio nodal em TV causa colapso hemodinâmico. É por isso que a regra é assimétrica, e não conservadorismo acadêmico: o erro tem preços diferentes.",
        "ELEVAM a suspeita de TV, e só nessa direção: idade acima de 35 anos, cardiopatia estrutural conhecida, IAM prévio, insuficiência cardíaca, e o próprio paciente dizer que já teve TV.",
        "⚠️ E A RESSALVA QUE FAZ ESSES DADOS SEREM USÁVEIS: nenhum deles EXCLUI TV. São elevadores de suspeita, não critérios de exclusão — paciente jovem e sem cardiopatia conhecida também tem TV. Ausência de fatores de risco NÃO autoriza tratar como TSV.",
        "CONDUTA, e não conselho: QRS largo = TV até prova em contrário. A prova em contrário vem de eletrofisiologia ou de ECG prévio idêntico com o mesmo padrão de bloqueio de ramo — não de impressão à beira do leito.",
        "Consultar especialista. Se instabilizar → cardioversão sincronizada 100 J.",
      ],
      next: "stable_reassess",
    },

    wide_irregular: {
      id: "wide_irregular",
      type: "action",
      title: "QRS largo irregular — atenção máxima",
      summary: "TV polimórfica, Torsades ou FA com WPW. Alto risco de degeneração para FV.",
      actions: [
        "TORSADES DE POINTES (QT longo) — a conduta tem TRÊS PERNAS, e tratar só o episódio devolve o paciente ao mesmo substrato:",
        "PERNA 1 — CORRIGIR O EPISÓDIO:",
        MAGNESIO_TORSADES_COM_PULSO,
        MAGNESIO_APRESENTACAO,
        MAGNESIO_TORSADES_MANUTENCAO,
        TORSADES_ACELERAR,
        TORSADES_REMOVER_CAUSA,
        TORSADES_PONTEIRO_ELETROLITOS,
        "FA com pré-excitação (WPW) — ⚠️ NÃO usar bloqueadores do nó AV: adenosina, verapamil, diltiazem, betabloqueadores, digoxina E AMIODARONA IV. Todos podem favorecer a condução pela via acessória e desencadear fibrilação ventricular.",
        "FA pré-excitada instável: cardioversão sincronizada imediata. Estável: estratégia especializada com procainamida IV ou ibutilida IV, quando disponíveis e apropriadas, ou cardioversão elétrica.",
        "Na dúvida entre FA com aberrância e pré-excitação, não usar bloqueio nodal empiricamente — obter apoio especializado ou cardioverter.",
        "TV polimórfica instável ou sem pulso: desfibrilação NÃO sincronizada (algoritmo de FV/PCR).",
        "Investigar e corrigir a causa: QT longo, isquemia, distúrbios eletrolíticos, fármacos.",
      ],
      next: "stable_reassess",
    },

    stable_reassess: {
      id: "stable_reassess",
      type: "transition",
      title: "Reavaliar resposta e acionar especialista",
      summary: "Monitorar a resposta ao tratamento e definir destino.",
      disposition: "observation",
      exitCriteria: [
        "Reavaliar ritmo, FC, PA e sintomas após cada intervenção.",
        "Cardiologia para conduta definitiva (ablação, anticoagulação, antiarrítmico de manutenção).",
        "Se a qualquer momento o paciente instabilizar → cardioversão sincronizada.",
        "Se perder o pulso → algoritmo de PCR.",
      ],
      targets: [
        {
          moduleId: "pcr-adulto",
          label: "Abrir guia de PCR",
          reason: "Se o paciente perder o pulso (TV/FV sem pulso).",
        },
      ],
    },
  },
};
