import { getActiveLocale } from "../locale";
import { ES_STRINGS } from "./es-419";
import { ES_SEPSE } from "./modules/sepse";
import { ES_AVC } from "./modules/avc";
import { ES_SCA } from "./modules/sca";
import { ES_ANAFILAXIA } from "./modules/anafilaxia";
import { ES_POLITRAUMA } from "./modules/politrauma";
import { ES_TCE } from "./modules/tce";
import { ES_CONVULSOES } from "./modules/convulsoes";
import { ES_INTOXICACOES } from "./modules/intoxicacoes";
import { ES_VENTILACAO } from "./modules/ventilacao";
import { ES_ISR } from "./modules/isr";
import { ES_TEP } from "./modules/tep";
import { ES_SEDACAO } from "./modules/sedacao";
import { ES_CAD } from "./modules/cad";
import { ES_ECLAMPSIA } from "./modules/eclampsia";
import { ES_EAP } from "./modules/eap";
import { ES_CHOQUE } from "./modules/choque";
import { ES_INSUFRESP } from "./modules/insufresp";
import { ES_ABDOME } from "./modules/abdome";
import { ES_CALCULADORAS } from "./modules/calculadoras";
import { ES_LANDING } from "./modules/landing";
import { ES_HUB_DESCRICOES } from "./modules/hub-descricoes";
import { ES_TELAS_ABERTURA } from "./modules/telas-abertura";
import { ES_SEPSE_ENGINE_1 } from "./modules/sepse-engine";
import { ES_SEPSE_ENGINE_2 } from "./modules/sepse-engine-2";
import { ES_SEPSE_ENGINE_3 } from "./modules/sepse-engine-3";
import { ES_ANAFILAXIA_ENGINE_1 } from "./modules/anafilaxia-engine";
import { ES_ANAFILAXIA_ENGINE_2 } from "./modules/anafilaxia-engine-2";
import { ES_CAD_ENGINE_1 } from "./modules/cad-engine";
import { ES_CAD_ENGINE_2 } from "./modules/cad-engine-2";
import { ES_EAP_ENGINE } from "./modules/eap-engine";
import { ES_VENTILACAO_ENGINE } from "./modules/ventilacao-engine";
import { ES_RESTO_ENGINES } from "./modules/resto-engines";
import { ES_TELAS_ENTRADA } from "./modules/telas-entrada";
import { ES_CALCULADORAS_UI } from "./modules/calculadoras-ui";
import { ES_ELETROLITOS_1 } from "./modules/eletrolitos-1";
import { ES_ELETROLITOS_2 } from "./modules/eletrolitos-2";
import { ES_TELAS_SUPORTE } from "./modules/telas-suporte";
import { ES_ELETROLITOS_RUNTIME } from "./modules/eletrolitos-runtime";
import { ES_ARRAYS_CALCULADORAS } from "./modules/arrays-calculadoras";
import { ES_ANAFILAXIA_ENG_A } from "./modules/anafilaxia-eng-a";
import { ES_ANAFILAXIA_ENG_B } from "./modules/anafilaxia-eng-b";
import { ES_SEPSE_ENG_A } from "./modules/sepse-eng-a";
import { ES_SEPSE_ENG_B } from "./modules/sepse-eng-b";
import { ES_VENT_AVC_ENG } from "./modules/ventilacao-avc-eng";
import { ES_VASO_EAP_SED_ENG } from "./modules/vasoativo-eap-sedacao-eng";
import { ES_CAD_CORONARIA_ENG } from "./modules/cad-coronaria-eng";
import { ES_TELAS_RESTANTES } from "./modules/telas-restantes";
import { ES_AVC_PRESCRICOES } from "./modules/avc-prescricoes";
import { ES_SEPSE_ENG_C } from "./modules/sepse-eng-c";
import { ES_ACLS_CAUSAS_REVERSIVEIS } from "./modules/acls-causas-reversiveis";
import { ES_ACLS_PCR_GESTACAO } from "./modules/acls-pcr-gestacao";
import { ES_CHOQUE_EINSTEIN } from "./modules/choque-einstein";
import { ES_ACLS_OVACE } from "./modules/acls-ovace";
import { ES_INTOXICACOES_EINSTEIN } from "./modules/intoxicacoes-einstein";
import { ES_MAL_EPILEPTICO_2025 } from "./modules/mal-epileptico-2025";
import { ES_PREECLAMPSIA_2025 } from "./modules/preeclampsia-2025";
import { ES_ANALGOSEDACAO_PRINCIPIOS } from "./modules/analgosedacao-principios";
import { ES_VM_AJUSTE_INICIAL } from "./modules/vm-ajuste-inicial";
import { ES_TCE_HIC } from "./modules/tce-hic";
import { ES_TRAUMA_2025 } from "./modules/trauma-2025";
import { ES_BNM_REGRAS } from "./modules/bnm-regras";
import { ES_SABISTON } from "./modules/sabiston";
import { ES_VNI_USP } from "./modules/vni-usp";
import { ES_INDICES_PROGNOSTICOS } from "./modules/indices-prognosticos";
import { ES_AHA_2025 } from "./modules/aha-2025";
import { ES_AVC_NIHSS } from "./modules/avc-nihss-elegibilidade";
import { ES_FINAL_A } from "./modules/final-a";
import { ES_FINAL_B } from "./modules/final-b";
import { ES_FINAL_C } from "./modules/final-c";
import { ES_CRONOMETRO_PERSISTENTE } from "./modules/cronometro-persistente";
import { ES_FENTANIL_ANALGOSEDACAO } from "./modules/fentanil-analgosedacao";
import { ES_ADRENALINA_EV_ANAFILAXIA } from "./modules/adrenalina-ev-anafilaxia";
import { ES_AMIODARONA_EAP_DOIS_REGIMES } from "./modules/amiodarona-eap-dois-regimes";
import { ES_BLOCO3 } from "./modules/bloco3";
import { ES_CAUSAS_PARADA } from "./modules/causas-parada";
import { taquicardiaFarmacosEs as ES_TAQUICARDIA_FARMACOS } from "./modules/taquicardia-farmacos";
import { pcrIntegradorEs as ES_PCR_INTEGRADOR } from "./modules/pcr-integrador";
import { metasPosParadaEs as ES_METAS_POS_PARADA } from "./modules/metas-pos-parada";
import { ovaceEs as ES_OVACE_2025 } from "./modules/ovace";
import { gestacaoCalcioEs as ES_GESTACAO_CALCIO } from "./modules/gestacao-calcio";
import { sepseVasoativosEs as ES_SEPSE_VASOATIVOS } from "./modules/sepse-vasoativos";
import { coronariasOclusaoEs as ES_CORONARIAS_OCLUSAO } from "./modules/coronarias-oclusao";
import { avcImagemEs as ES_AVC_IMAGEM } from "./modules/avc-imagem";
import { tepAnticoagulacaoEs as ES_TEP_ANTICOAG } from "./modules/tep-anticoagulacao";
import { choqueDiferencialEs as ES_CHOQUE_DIF } from "./modules/choque-diferencial";
import { politraumaTceEs as ES_POLITRAUMA_TCE } from "./modules/politrauma-tce";
import { tceAlvosEs as ES_TCE_ALVOS } from "./modules/tce-alvos";
import { abdomeAgudo2026Es as ES_ABDOME_2026 } from "./modules/abdome-agudo-2026";
import { intoxicacoesLastEs as ES_TOX_LAST } from "./modules/intoxicacoes-last";
import { cadEhh2024Es as ES_CAD_2024 } from "./modules/cad-ehh-2024";
import { eclampsiaRelogiosEs as ES_ECL_RELOGIOS } from "./modules/eclampsia-relogios";
import { convulsoesGestanteEs as ES_CONV_GESTANTE } from "./modules/convulsoes-gestante";
import { eapPerfilEs as ES_EAP_PERFIL } from "./modules/eap-perfil";
import { tepChoqueNormotensoEs as ES_TEP_NORMO } from "./modules/tep-choque-normotenso";
import { ES_FARMACO_ACLS } from "./modules/farmaco-acls";
import { ES_RITMOS_PCR } from "./modules/ritmos-pcr";
import { ES_ESCORES_LIMITES } from "./modules/escores-limites";
import { ES_BRONCO_ANAFILAXIA } from "./modules/broncoespasmo-anafilaxia";
import { ES_SARA_DUVIDOSA } from "./modules/sara-duvidosa";
import { ES_TRANSVERSAIS } from "./modules/transversais";
import { ES_BLOCO2 } from "./modules/bloco2";
import { ES_VM_CENARIOS } from "./modules/vm-cenarios";
import { ES_BLOCO1 } from "./modules/bloco1-contraindicacoes";
import { ES_ALARMES_VENT } from "./modules/alarmes-ventilador";
import { ES_PRECAUCOES } from "./modules/precaucoes-isolamento";
import { ES_ALERGIA_BL } from "./modules/alergia-beta-lactamico";
import { ES_HNF_PERI_ICP } from "./modules/hnf-peri-icp";
import { ES_NIHSS_FAIXAS_PRESET } from "./modules/nihss-faixas-preset";
import { ES_MISTO_CAD_EHH } from "./modules/misto-cad-ehh";
import { ES_ESCOPO_PEDIATRICO } from "./modules/escopo-pediatrico";
import { ES_STRINGS as ES_ACLS } from "../../acls/locales/es-419/strings";
import { ES_STRINGS_GENERATED as ES_ACLS_GEN } from "../../acls/locales/es-419/strings-generated";

/**
 * Traduz uma string de português para o idioma ativo.
 * Sem tradução (ou em pt-BR) devolve o próprio PT — o app nunca mostra vazio e
 * permanece byte-idêntico em português.
 *
 * `locale` opcional: quando passado (ex.: vindo de useLanguage() durante o
 * render) evita que o minificador congele chamadas tr("literal") fora do render
 * — bug já observado no app de PCR, em que o cabeçalho ficava preso no idioma
 * inicial.
 */
export function tr(pt: string, locale?: string): string {
  const loc = locale ?? getActiveLocale();
  if (loc !== "es-419") return pt;
  // interface do app completo → dicionário ACLS curado → dicionário ACLS gerado
  return ES_STRINGS[pt] ?? ES_SEPSE[pt] ?? ES_AVC[pt] ?? ES_SCA[pt] ?? ES_ANAFILAXIA[pt] ?? ES_POLITRAUMA[pt] ?? ES_TCE[pt] ?? ES_CONVULSOES[pt] ?? ES_INTOXICACOES[pt] ?? ES_VENTILACAO[pt] ?? ES_ISR[pt] ?? ES_TEP[pt] ?? ES_SEDACAO[pt] ?? ES_CAD[pt] ?? ES_ECLAMPSIA[pt] ?? ES_EAP[pt] ?? ES_CHOQUE[pt] ?? ES_INSUFRESP[pt] ?? ES_ABDOME[pt] ?? ES_CALCULADORAS[pt] ?? ES_LANDING[pt] ?? ES_HUB_DESCRICOES[pt] ?? ES_TELAS_ABERTURA[pt] ?? ES_SEPSE_ENGINE_1[pt] ?? ES_SEPSE_ENGINE_2[pt] ?? ES_SEPSE_ENGINE_3[pt] ?? ES_ANAFILAXIA_ENGINE_1[pt] ?? ES_ANAFILAXIA_ENGINE_2[pt] ?? ES_CAD_ENGINE_1[pt] ?? ES_CAD_ENGINE_2[pt] ?? ES_EAP_ENGINE[pt] ?? ES_VENTILACAO_ENGINE[pt] ?? ES_RESTO_ENGINES[pt] ?? ES_TELAS_ENTRADA[pt] ?? ES_CALCULADORAS_UI[pt] ?? ES_ELETROLITOS_1[pt] ?? ES_ELETROLITOS_2[pt] ?? ES_TELAS_SUPORTE[pt] ?? ES_ELETROLITOS_RUNTIME[pt] ?? ES_ARRAYS_CALCULADORAS[pt] ?? ES_ANAFILAXIA_ENG_A[pt] ?? ES_ANAFILAXIA_ENG_B[pt] ?? ES_SEPSE_ENG_A[pt] ?? ES_SEPSE_ENG_B[pt] ?? ES_VENT_AVC_ENG[pt] ?? ES_VASO_EAP_SED_ENG[pt] ?? ES_CAD_CORONARIA_ENG[pt] ?? ES_TELAS_RESTANTES[pt] ?? ES_AVC_PRESCRICOES[pt] ?? ES_SEPSE_ENG_C[pt] ?? ES_ACLS_CAUSAS_REVERSIVEIS[pt] ?? ES_ACLS_PCR_GESTACAO[pt] ?? ES_CHOQUE_EINSTEIN[pt] ?? ES_ACLS_OVACE[pt] ?? ES_INTOXICACOES_EINSTEIN[pt] ?? ES_MAL_EPILEPTICO_2025[pt] ?? ES_PREECLAMPSIA_2025[pt] ?? ES_ANALGOSEDACAO_PRINCIPIOS[pt] ?? ES_VM_AJUSTE_INICIAL[pt] ?? ES_TCE_HIC[pt] ?? ES_TRAUMA_2025[pt] ?? ES_BNM_REGRAS[pt] ?? ES_SABISTON[pt] ?? ES_VNI_USP[pt] ?? ES_INDICES_PROGNOSTICOS[pt] ?? ES_AHA_2025[pt] ?? ES_AVC_NIHSS[pt] ?? ES_FINAL_A[pt] ?? ES_FINAL_B[pt] ?? ES_FINAL_C[pt] ?? ES_CRONOMETRO_PERSISTENTE[pt] ?? ES_FENTANIL_ANALGOSEDACAO[pt] ?? ES_ADRENALINA_EV_ANAFILAXIA[pt] ?? ES_AMIODARONA_EAP_DOIS_REGIMES[pt] ?? ES_ESCOPO_PEDIATRICO[pt] ?? ES_MISTO_CAD_EHH[pt] ?? ES_NIHSS_FAIXAS_PRESET[pt] ?? ES_HNF_PERI_ICP[pt] ?? ES_ALERGIA_BL[pt] ?? ES_PRECAUCOES[pt] ?? ES_ALARMES_VENT[pt] ?? ES_BLOCO1[pt] ?? ES_VM_CENARIOS[pt] ?? ES_BLOCO2[pt] ?? ES_TRANSVERSAIS[pt] ?? ES_SARA_DUVIDOSA[pt] ?? ES_BRONCO_ANAFILAXIA[pt] ?? ES_ESCORES_LIMITES[pt] ?? ES_RITMOS_PCR[pt] ?? ES_FARMACO_ACLS[pt] ?? ES_CAUSAS_PARADA[pt] ?? ES_TAQUICARDIA_FARMACOS[pt] ?? ES_PCR_INTEGRADOR[pt] ?? ES_METAS_POS_PARADA[pt] ?? ES_OVACE_2025[pt] ?? ES_GESTACAO_CALCIO[pt] ?? ES_SEPSE_VASOATIVOS[pt] ?? ES_CORONARIAS_OCLUSAO[pt] ?? ES_AVC_IMAGEM[pt] ?? ES_TEP_ANTICOAG[pt] ?? ES_CHOQUE_DIF[pt] ?? ES_POLITRAUMA_TCE[pt] ?? ES_TCE_ALVOS[pt] ?? ES_ABDOME_2026[pt] ?? ES_TOX_LAST[pt] ?? ES_CAD_2024[pt] ?? ES_ECL_RELOGIOS[pt] ?? ES_CONV_GESTANTE[pt] ?? ES_EAP_PERFIL[pt] ?? ES_TEP_NORMO[pt] ?? ES_BLOCO3[pt] ?? ES_ACLS[pt] ?? ES_ACLS_GEN[pt] ?? pt;
}

export { ES_STRINGS };
