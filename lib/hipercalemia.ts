/**
 * HIPERCALEMIA — os limiares e a conduta, em UMA fonte.
 *
 * ⚠️ ESTE ARQUIVO É BIBLIOTECA COMPARTILHADA, NÃO ARQUIVO DO MÓDULO RENAL.
 * É o primeiro bloco real dela (R-95). Quem edita aqui edita o conteúdo de DOIS
 * módulos ao mesmo tempo — Eletrólitos e Injúria renal aguda — e é essa a
 * intenção: a dose existe uma vez só.
 *
 * ── POR QUE ESTE ARQUIVO EXISTE ─────────────────────────────────────────────
 *
 * Os números da hipercalemia (limiar de gravidade, dose de cálcio, de insulina
 * e de beta-2) viviam DENTRO de uma tela — `electrolyte-calculator-screen.tsx`,
 * na função que monta a estratégia. Enquanto só aquela tela os usava, tudo bem.
 *
 * O módulo renal passou a precisar dos mesmos números: a primeira das seis
 * emergências é o potássio, e a tela de conduta tem de dizer o que dar, quanto,
 * por qual via, em quanto tempo e o que reavaliar. Copiar para a árvore criaria
 * a segunda cópia — e este app já registrou o que acontece quando uma dose vive
 * em dois lugares: um dia divergem, e a divergência é silenciosa.
 *
 * Então os números saíram da tela para cá, e a tela passou a importá-los. Nada
 * mudou de valor: é extração, não revisão.
 *
 * ── ⚠️ A PROCEDÊNCIA, E O QUE ELA NÃO COBRE ────────────────────────────────
 *
 * Fonte declarada em `protocols/guidelines_metadata.json` para o módulo de
 * eletrólitos: bula oficial (DailyMed) mais recomendações amplamente aceitas
 * para o manejo da hipercalemia, revisão de 2026-04-15.
 *
 * ⚠️ O REPOSITÓRIO NÃO CITA DIRETRIZ DE HIPERCALEMIA (ERC, KDIGO ou outra), e
 * nada aqui foi acrescentado por memória. O que não tem fonte no repositório
 * NÃO ENTRA — em particular:
 *
 *   · DOSE DO DIURÉTICO DE ALÇA — o repositório diz "considerar diurético se
 *     houver diurese", sem dose, via nem tempo. Um nó de ação com três das
 *     cinco respostas não é nó de ação: o diurético fica FORA do fluxo até a
 *     dose ter fonte. Pendência aberta.
 *   · LIGANTES INTESTINAIS — fora por decisão de produto, não por falta de
 *     fonte: têm início lento e não mudam o que se faz nos próximos minutos.
 *   · DOSE DE BICARBONATO — o app não escolhe dose de bicarbonato fora da
 *     parada; a indicação depende do pH, da causa e da resposta.
 */

/** Limiar em que o potássio, sozinho, já é emergência elétrica. */
export const K_GRAVE = 6.5;
/** Limiar da faixa intermediária. */
export const K_MODERADA = 6;

export type GravidadeDeHipercalemia = "grave" | "moderada" | "leve";

/**
 * ⚠️ O ECG PESA MAIS QUE O NÚMERO. Alteração de ECG é grave em qualquer valor —
 * é a regra que estava escrita na tela de eletrólitos e continua valendo aqui.
 */
export function gravidadeDeHipercalemia(
  potassio: number | undefined,
  ecgAlterado: boolean
): GravidadeDeHipercalemia {
  if (ecgAlterado) return "grave";
  if (potassio === undefined) return "leve";
  if (potassio >= K_GRAVE) return "grave";
  if (potassio >= K_MODERADA) return "moderada";
  return "leve";
}

/* ── AS TRÊS FRENTES, NA ORDEM ─────────────────────────────────────────────── */

/**
 * ⚠️ SÃO TRÊS COISAS DIFERENTES, E É O QUE MAIS SE ERRA: o cálcio NÃO baixa o
 * potássio, e deslocar para dentro da célula NÃO tira potássio do corpo.
 */
export const HIPERCALEMIA_ESTABILIZAR =
  "Gluconato de cálcio 10% — 30 mL IV, infundir em 10 minutos. Reavalie o ECG ao fim da infusão: se continuar alterado, repita.";

export const HIPERCALEMIA_DESLOCAR_INSULINA =
  "Insulina regular 10 U IV + glicose 25 g IV (50 mL de glicose 50%). Meça a glicemia ANTES e monitore seriada nas próximas 6 h.";

export const HIPERCALEMIA_DESLOCAR_BETA2 =
  "Salbutamol nebulizado 10–20 mg — dose muito maior que a do broncoespasmo. Adjuvante, se tolerado.";

export const HIPERCALEMIA_REMOVER =
  "Interrompa toda fonte de potássio — soro com K, dieta, suplemento, IECA/BRA, espironolactona.";

export const HIPERCALEMIA_REMOVER_TRS =
  "Refratária, anúrica ou sem resposta às duas primeiras frentes: acione diálise.";

export const HIPERCALEMIA_REAVALIAR =
  "Repita o potássio depois da fase de deslocamento: sem remoção, ele rebota.";

/** Regra do rebote, escrita como razão — o que faz alguém não parar no meio. */
export const HIPERCALEMIA_POR_QUE_TRES_FRENTES =
  "⚠️ O cálcio não baixa o potássio: ele protege o coração enquanto as outras duas agem. E insulina e beta-2 empurram o potássio para dentro da célula — de onde ele volta. Só a remoção resolve.";

/* ── GLICEMIA — a glicose acompanha a insulina, por padrão ────────────────── */

/**
 * ⚠️ NÃO EXISTE FRASE DE FONTE QUE SUSTENTE UM LIMIAR AQUI, E O NÚMERO SAIU.
 *
 * O código dizia "com glicemia basal abaixo de 126 mg/dL, o risco é maior" e
 * ramificava o esquema de glicose por esse corte. Procurado no repositório: 126
 * não aparece em fonte nenhuma — só no nosso próprio código. A `citation` do
 * módulo de Eletrólitos registra "bula oficial DailyMed… e recomendações
 * amplamente aceitas", e a única recomendação escrita sobre o assunto é
 * "hipercalemia: cálcio, insulina-glicose e medidas de remoção", sem limiar.
 *
 * Era **procedência herdada por vizinhança** — o mesmo defeito do rodapé "KDIGO
 * 2012" sob doses que não eram do KDIGO. E 126 mg/dL é o corte DIAGNÓSTICO de
 * diabetes em jejum, de outro contexto e de outro raciocínio.
 *
 * ── O LADO SEGURO, QUE É O QUE FICA ────────────────────────────────────────
 *
 * A glicose passa a ser PADRÃO junto com a insulina, e não conduta condicionada
 * a um número inventado. A assimetria decide: dar glicose a quem não precisava
 * custa hiperglicemia transitória; não dar a quem precisava custa hipoglicemia
 * depois que a equipe já saiu do leito.
 *
 * ⚠️ DECISÃO DO AUTOR (2026-08-20): **NÃO existe limiar estabelecido** para
 * dispensar a glicose. A inversão para o lado seguro fica. Se algum dia um
 * número entrar aqui, ele entra **rotulado como PRÁTICA VARIÁVEL**, nunca como
 * recomendação — é a diferença entre "o serviço costuma usar" e "a diretriz
 * manda", e o app já distingue as duas coisas em outros módulos.
 */
export const HIPERCALEMIA_GLICEMIA =
  "⚠️ Hipoglicemia é a complicação mais comum e mais esquecida da insulina aqui — por isso a glicemia se mede ANTES e se monitora depois.";

export const HIPERCALEMIA_GLICOSE_PADRAO =
  "Mantenha glicose depois do bolus, não só junto dele — o efeito da insulina dura mais que o da glicose que foi com ela. Só se dispensa em quem já está francamente hiperglicêmico.";

/**
 * A JANELA DE VIGILÂNCIA — o que a fonte diz, e o que é tradução nossa.
 *
 * ── A FONTE, COM TIPO E DATA ───────────────────────────────────────────────
 *
 * Pennsylvania Patient Safety Authority — *Treating Hyperkalemia: Avoid
 * Additional Harm When Using Insulin and Dextrose*, **Patient Safety Advisory,
 * setembro de 2017**.
 *
 * ⚠️ NÃO É DIRETRIZ, e tem NOVE ANOS. É comunicado de segurança do paciente,
 * baseado em notificação voluntária de eventos. Entra porque o que ele descreve
 * muda o que se faz; não entra como recomendação graduada.
 *
 * ── O QUE É DELA E O QUE É NOSSO ───────────────────────────────────────────
 *
 * DA FONTE: os sintomas de hipoglicemia podem se ATRASAR em até seis horas
 * depois da insulina, sobretudo com comprometimento renal; e a glicose
 * administrada junto REDUZ o risco sem eliminá-lo — há hipoglicemia mesmo com
 * ela.
 *
 * ⚠️ NOSSO: "monitorar por seis horas". A fonte fala do ATRASO POSSÍVEL do
 * sintoma; transformar isso em janela de vigilância é OPERACIONALIZAÇÃO deste
 * app — a tradução prática do atraso descrito, não o texto da fonte.
 *
 * ── ⚠️ O NÚMERO QUE SAIU DA TELA ───────────────────────────────────────────
 *
 * A primeira versão dizia "mais de 28% dos casos ocorreram apesar da glicose". O
 * denominador é de NOTIFICAÇÃO VOLUNTÁRIA, não populacional — e na tela, ao lado
 * de doses, seria lido como taxa. A afirmação que sobrevive sem número é a que
 * muda a conduta: reduz o risco, não elimina.
 */
export const HIPERCALEMIA_JANELA_HIPOGLICEMIA =
  "Vigie a glicemia nas SEIS HORAS seguintes à insulina — o sintoma de hipoglicemia pode atrasar dentro dessa janela, sobretudo com função renal comprometida.";

export const HIPERCALEMIA_JANELA_PORQUE =
  "⚠️ DAR GLICOSE REDUZ O RISCO, NÃO O ELIMINA — a hipoglicemia acontece também com a glicose administrada. Glicose e vigilância são duas medidas, não uma, e este módulo inteiro é de paciente com função renal comprometida, que é o grupo de maior risco. ➜ A fonte (Pennsylvania Patient Safety Authority, Patient Safety Advisory de setembro de 2017) descreve o ATRASO do sintoma em até seis horas; a janela de vigilância de seis horas é operacionalização deste app, não texto da fonte.";

export const HIPERCALEMIA_GLICOSE_PORQUE =
  "⚠️ O app não fixa um valor de glicemia para dispensar a glicose: não há frase de fonte no repositório que sustente esse limiar. Dar glicose a quem não precisava custa hiperglicemia transitória; não dar a quem precisava custa hipoglicemia depois que a equipe saiu do leito.";

export const HIPERCALEMIA_BICARBONATO =
  "⚠️ Bicarbonato só entra se houver acidose metabólica, e como adjuvante — nunca no lugar do cálcio e da insulina. Este app não escolhe a dose: ela depende do pH, da causa e da resposta.";

export const HIPERCALEMIA_PSEUDO =
  "⚠️ Coleta difícil, garrote demorado ou amostra hemolisada dão pseudo-hipercalemia: se o quadro não fecha, repita a amostra — mas não adie o tratamento de quem tem ECG alterado.";
