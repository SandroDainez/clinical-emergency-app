/**
 * Orientações clínicas complementares por fase do protocolo ACLS.
 * Exibidas abaixo do card principal para apoio ao usuário menos experiente.
 */
type PhaseNote = {
  /** Título curto do contexto clínico */
  heading: string;
  /** Texto explicativo para orientação */
  body: string;
  /** Fonte ou referência resumida */
  source?: string;
};

const PHASE_NOTES: Record<string, PhaseNote> = {
  reconhecimento_inicial: {
    heading: "Reconhecimento rápido é essencial",
    body: "Avalie responsividade com estímulo tátil e verbal. Gasping não é respiração efetiva. Solicite ajuda imediatamente — cada segundo sem compressão reduz a chance de sobrevida.",
    source: "AHA 2020",
  },
  checar_respiracao_pulso: {
    heading: "Dúvida sobre o pulso? Comprima.",
    body: "Palpe o pulso carotídeo ou femoral por no máximo 10 s. Se houver qualquer dúvida, inicie a RCP — o risco de atrasar as compressões supera o risco de comprimir quem ainda tem pulso.",
    source: "AHA 2020",
  },
  monitorizar_com_pulso: {
    heading: "Pulso presente: monitore continuamente",
    body: "Esteja preparado para iniciar RCP imediatamente se houver deterioração ou perda de pulso. Mantenha o desfibrilador conectado e reavalie se surgir instabilidade.",
  },
  inicio: {
    heading: "RCP de alta qualidade salva mais vidas que qualquer droga",
    body: "Comprima forte (5–6 cm), rápido (100–120/min) e solte completamente após cada compressão. Troque o compressor a cada 2 min ou antes se houver fadiga. Sem via aérea avançada: 30 compressões para 2 ventilações.",
    source: "AHA 2020",
  },
  avaliar_ritmo_preparo: {
    heading: "Pausar o mínimo — e observar com atenção",
    body: "Mantenha as compressões até o último momento antes da análise. O monitor deve estar conectado e ativo. Na pausa (<10 s): observe o ritmo no monitor, avalie se há movimento, tosse ou respiração espontânea. Se houver ritmo organizado no monitor, palpe o pulso imediatamente — não presuma ROSC sem confirmação.",
    source: "AHA 2020",
  },
  avaliar_ritmo_2_preparo: {
    heading: "Pausar o mínimo — e observar com atenção",
    body: "Mantenha as compressões até o último momento antes da análise. O monitor deve estar conectado e ativo. Na pausa (<10 s): observe o ritmo no monitor, avalie se há movimento, tosse ou respiração espontânea. Se houver ritmo organizado no monitor, palpe o pulso imediatamente — não presuma ROSC sem confirmação.",
    source: "AHA 2020",
  },
  avaliar_ritmo_3_preparo: {
    heading: "Pausar o mínimo — e observar com atenção",
    body: "Mantenha as compressões até o último momento antes da análise. O monitor deve estar conectado e ativo. Na pausa (<10 s): observe o ritmo no monitor, avalie se há movimento, tosse ou respiração espontânea. Se houver ritmo organizado no monitor, palpe o pulso imediatamente — não presuma ROSC sem confirmação.",
    source: "AHA 2020",
  },
  avaliar_ritmo_nao_chocavel_preparo: {
    heading: "Pausar o mínimo — e observar com atenção",
    body: "Mantenha as compressões até o último momento antes da análise. O monitor deve estar conectado e ativo. Na pausa (<10 s): observe o ritmo no monitor, avalie se há movimento, tosse ou respiração espontânea. Se houver ritmo organizado no monitor, palpe o pulso imediatamente — não presuma ROSC sem confirmação.",
    source: "AHA 2020",
  },
  avaliar_ritmo: {
    heading: "Identificar o ritmo define o tratamento",
    body: "FV e TV sem pulso são ritmos chocáveis — desfibrilação imediata. AESP e assistolia não são chocáveis — epinefrina e causa reversível. Ritmo organizado: palpe o pulso por no máximo 10 s.",
    source: "AHA 2020",
  },
  avaliar_ritmo_2: {
    heading: "Reavaliação a cada 2 minutos",
    body: "Se persistir FV/TV, aplique novo choque. Se o ritmo mudar para AESP/assistolia, mude para o ramo não chocável. Ritmo organizado: palpe o pulso antes de confirmar ROSC.",
    source: "AHA 2020",
  },
  avaliar_ritmo_3: {
    heading: "Reavaliação a cada 2 minutos",
    body: "Se persistir FV/TV, aplique novo choque. Se o ritmo mudar para AESP/assistolia, mude para o ramo não chocável. Ritmo organizado: palpe o pulso antes de confirmar ROSC.",
    source: "AHA 2020",
  },
  avaliar_ritmo_nao_chocavel: {
    heading: "AESP vs. Assistolia",
    body: "AESP é ritmo organizado no monitor sem pulso palpável — pesquise causa reversível ativamente. Assistolia (linha reta) tem pior prognóstico, mas causas reversíveis ainda podem revertê-la.",
    source: "AHA 2020",
  },
  tipo_desfibrilador: {
    heading: "Bifásico é o padrão atual",
    body: "A maioria dos desfibriladores modernos é bifásica. Se não souber a carga recomendada pelo fabricante, use a carga máxima disponível — é seguro e não reduz a eficácia.",
    source: "AHA 2020",
  },
  choque_bi_1: {
    heading: "Segurança antes do choque",
    body: "Confirme: todos afastados, ninguém em contato com o paciente, oxigênio removido da proximidade. Após o choque: retome a RCP IMEDIATAMENTE sem verificar o pulso — o ritmo de perfusão pode levar segundos para ser palpável.",
    source: "AHA 2020",
  },
  choque_mono_1: {
    heading: "Segurança antes do choque",
    body: "Confirme: todos afastados, ninguém em contato com o paciente, oxigênio removido da proximidade. Após o choque: retome a RCP IMEDIATAMENTE sem verificar o pulso — o ritmo de perfusão pode levar segundos para ser palpável.",
    source: "AHA 2020",
  },
  choque_2: {
    heading: "2º choque: epinefrina logo após o choque",
    body: "Após aplicar este choque, retome a RCP IMEDIATAMENTE e dê epinefrina 1 mg IV/IO durante o próximo ciclo de 2 min. É a primeira dose de epinefrina no ritmo chocável — só indicada a partir do 2º choque (AHA 2020). Afaste todos antes de aplicar o choque.",
    source: "AHA 2020",
  },
  choque_3: {
    heading: "FV/TV refratária: antiarrítmico após o choque",
    body: "Após o 3º choque, administre amiodarona ou lidocaína durante o ciclo de RCP subsequente. Não atrase o choque para administrar o antiarrítmico.",
    source: "AHA 2020",
  },
  rcp_1: {
    heading: "1º ciclo pós-choque: ainda não é o momento da epinefrina",
    body: "Use este ciclo para garantir acesso IV/IO e preparar a via aérea. A epinefrina só está indicada no chocável a partir do 2º ciclo (após o 2º choque), conforme AHA 2020.",
    source: "AHA 2020",
  },
  rcp_2: {
    heading: "Epinefrina 1 mg IV/IO agora",
    body: "Repita a cada 3–5 min durante toda a ressuscitação. Considere intubação ou via aérea supraglótica para manter compressões contínuas. Mantenha a RCP de alta qualidade como prioridade.",
    source: "AHA 2020",
  },
  rcp_3: {
    heading: "Antiarrítmico para FV/TV refratária — ver dose na tela",
    body: "1ª dose: Amiodarona 300 mg IV/IO (ou lidocaína 1–1,5 mg/kg).\n2ª dose (se ainda em FV/TV após novo choque): Amiodarona 150 mg IV/IO (ou lidocaína 0,5–0,75 mg/kg).\nNão administre amiodarona e lidocaína simultaneamente. Mantenha epinefrina a cada 3–5 min.",
    source: "AHA 2020",
  },
  nao_chocavel_epinefrina: {
    heading: "Epinefrina precoce melhora o ROSC",
    body: "É a única droga vasoativa indicada em AESP e assistolia. Meta: 1ª dose nos primeiros 3–5 min. Cada minuto de atraso reduz as chances de retorno da circulação espontânea.",
    source: "AHA 2020",
  },
  nao_chocavel_ciclo: {
    heading: "Use os 2 min de RCP para investigar a causa",
    body: "Causas reversíveis são a maior chance de ROSC no ritmo não chocável. Pesquise ativamente: hipovolemia, hipóxia, acidose, distúrbios eletrolíticos, hipotermia, pneumotórax, tamponamento, toxinas e trombose.",
    source: "AHA 2020",
  },
  nao_chocavel_hs_ts: {
    heading: "Hs e Ts — causas reversíveis de PCR",
    body: "Hs: Hipovolemia · Hipóxia · Hidrogênio (acidose) · Hipo/Hipercalemia · Hipotermia.\nTs: Tensão (pneumotórax hipertensivo) · Tamponamento cardíaco · Toxinas · Trombose pulmonar · Trombose coronária.",
    source: "AHA 2020",
  },
  pos_rosc: {
    heading: "Os primeiros 60 min após ROSC são críticos",
    body: "Confirme ROSC: pulso palpável + pressão detectável + EtCO2 em elevação. Não interrompa o atendimento — inicie imediatamente os cuidados pós-parada estruturados.",
    source: "AHA 2020",
  },
  pos_rosc_via_aerea: {
    heading: "FiO2 100% no início — depois titule",
    body: "Após confirmar SpO2 confiável, ajuste para 90–98%. Hiperventilação é prejudicial: causa hipocapnia, que provoca vasoconstrição cerebral e piora o prognóstico neurológico. Meta de EtCO2: 35–45 mmHg.",
    source: "AHA 2020",
  },
  pos_rosc_hemodinamica: {
    heading: "Hipotensão pós-ROSC dobra a mortalidade",
    body: "Meta: PAM ≥ 65 mmHg. Use fluidos para hipovolemia e noradrenalina como vasopressor de escolha em choque vasoplégico. Evite hipotensão mesmo transitória.",
    source: "AHA 2020",
  },
  pos_rosc_ecg: {
    heading: "Supra de ST após ROSC = cateterismo de urgência",
    body: "Não espere exames adicionais para acionar a equipe de hemodinâmica. O cateterismo de emergência está indicado mesmo sem diagnóstico confirmado pré-parada, quando há supra de ST.",
    source: "AHA 2020",
  },
  pos_rosc_neurologico: {
    heading: "Prevenir febre é mandatório em todos os pacientes",
    body: "Temperatura > 37,7°C é prejudicial após PCR. Controle ativo (32–36°C) não é mais universal — use conforme protocolo institucional (AHA 2023 update). Trate convulsões, controle glicemia e monitore com EEG se indicado.",
    source: "AHA 2023",
  },
  pos_rosc_destino: {
    heading: "UTI com suporte completo é o destino ideal",
    body: "Documente todo o atendimento: horário da parada, intervenções, evolução do ritmo, drogas administradas e número de choques. Comunique a equipe receptora com antecedência.",
    source: "AHA 2020",
  },
  pos_rosc_concluido: {
    heading: "Monitorização contínua no pós-ROSC",
    body: "Reavalie PA, SpO2, temperatura, glicemia e responsividade neurológica periodicamente. Ajuste o plano conforme a resposta ao tratamento e a causa identificada da parada.",
  },
  encerrado: {
    heading: "Documentação é responsabilidade médica",
    body: "Registre: hora da parada, hora do início das intervenções, ritmos identificados, drogas e doses administradas, número de choques e a decisão de encerramento com justificativa.",
  },
};

function getPhaseNote(stateId: string): PhaseNote | null {
  return PHASE_NOTES[stateId] ?? null;
}

export type { PhaseNote };
export { getPhaseNote };
