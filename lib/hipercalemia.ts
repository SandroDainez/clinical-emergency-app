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


export const HIPERCALEMIA_DESLOCAR_INSULINA =
  "Insulina regular 10 U IV + glicose 25 g IV (50 mL de glicose 50%). Meça a glicemia ANTES e monitore seriada nas próximas 6 h.";

export const HIPERCALEMIA_DESLOCAR_BETA2 =
  "Salbutamol nebulizado 10–20 mg — dose muito maior que a do broncoespasmo. Adjuvante, se tolerado.";





/* ── GLICEMIA — a glicose acompanha a insulina, por padrão ────────────────── */


/**
 * ⚠️ FUNDE O QUE ERAM DUAS AÇÕES — e a fusão é de conteúdo, não de pontuação.
 *
 * A tela da hipercalemia chegou a 8 ações visíveis, teto 7 da §7.4, porque a
 * glicose e a vigilância dela entraram em rodadas diferentes e ficaram como duas
 * linhas. Elas falam da MESMA coisa: a insulina dura mais que a glicose que foi
 * com ela, e é por isso que se mantém glicose e se olha a glicemia depois.
 *
 * ⚠️ A REGRA DA FUSÃO: somar as duas frases (177 + 155) daria 330 caracteres — a
 * maior linha da tela por larga margem, e acima do teto de 200. Isso seria fusão
 * COSMÉTICA: a tela contaria 7 e leria pior. A linha nova tem 114 caracteres,
 * abaixo da maior que sobra (125), e o que saiu dela foi conteúdo que já vive no
 * `porque` — a ausência de limiar para dispensar, e o risco renal.
 */
export const HIPERCALEMIA_GLICOSE_PADRAO =
  "Glicose depois do bolus, não só junto: vigie a glicemia por SEIS HORAS — a insulina dura mais, e o sintoma atrasa.";

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

/**
 * ⚠️ ERA UM PARÁGRAFO DE 480 CARACTERES, E A TRAVA DE PRAZO O DERRUBOU.
 *
 * Ele repetia "seis horas" dentro do campo RECOLHIDO — e prazo escondido atrás de
 * um toque é a única classe cujo custo é irreversível: quem não abriu, perdeu.
 * O número agora vive na AÇÃO VISÍVEL, e o recolhido ficou com a razão, partida
 * em duas frases curtas: o que muda a conduta, e de onde vem.
 */
export const HIPERCALEMIA_JANELA_PORQUE =
  "⚠️ DAR GLICOSE REDUZ O RISCO, NÃO O ELIMINA: a hipoglicemia acontece mesmo com ela. São duas medidas, não uma — e todo paciente deste módulo tem função renal comprometida, o grupo de maior risco.";





/* ── DIURÉTICO DE ALÇA — subordinado a diurese e volemia ──────────────────── */










/* ── A dose, que é de DESCONGESTÃO e mora no ramo congesto ────────────────── */



/**
 * ⚠️ O TESTE DE ESTRESSE COM FUROSEMIDA NÃO É DOSE — e este bloco existe para
 * que ele não vire uma.
 *
 * 1,0 mg/kg IV sem exposição prévia e 1,5 mg/kg com exposição prévia é
 * **ferramenta prognóstica/funcional**: mede se o néfron responde. Aparece nas
 * mesmas revisões que trazem a dose de descongestão, e é exatamente o tipo de
 * número que MIGRA DE CONTEXTO SOZINHO — alguém copia e 1,5 mg/kg vira "dose
 * alta de furosemida".
 *
 * Não está na tela. Se entrar um dia, entra com este rótulo e em card próprio.
 * A constante fica aqui SEM SER EXPORTADA PARA A ÁRVORE de propósito: registra a
 * distinção sem oferecer o número.
 */
const TESTE_DE_ESTRESSE_NAO_E_DOSE =
  "Teste de estresse com furosemida (1,0 mg/kg IV sem exposição prévia; 1,5 mg/kg com exposição) é PROGNÓSTICO, não terapêutico — não é dose de congestão.";
void TESTE_DE_ESTRESSE_NAO_E_DOSE;

