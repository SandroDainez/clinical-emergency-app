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
  return ES_STRINGS[pt] ?? ES_SEPSE[pt] ?? ES_AVC[pt] ?? ES_SCA[pt] ?? ES_ANAFILAXIA[pt] ?? ES_POLITRAUMA[pt] ?? ES_TCE[pt] ?? ES_CONVULSOES[pt] ?? ES_INTOXICACOES[pt] ?? ES_VENTILACAO[pt] ?? ES_ISR[pt] ?? ES_TEP[pt] ?? ES_SEDACAO[pt] ?? ES_CAD[pt] ?? ES_ECLAMPSIA[pt] ?? ES_EAP[pt] ?? ES_CHOQUE[pt] ?? ES_INSUFRESP[pt] ?? ES_ABDOME[pt] ?? ES_CALCULADORAS[pt] ?? ES_LANDING[pt] ?? ES_HUB_DESCRICOES[pt] ?? ES_TELAS_ABERTURA[pt] ?? ES_SEPSE_ENGINE_1[pt] ?? ES_SEPSE_ENGINE_2[pt] ?? ES_SEPSE_ENGINE_3[pt] ?? ES_ANAFILAXIA_ENGINE_1[pt] ?? ES_ANAFILAXIA_ENGINE_2[pt] ?? ES_CAD_ENGINE_1[pt] ?? ES_CAD_ENGINE_2[pt] ?? ES_EAP_ENGINE[pt] ?? ES_VENTILACAO_ENGINE[pt] ?? ES_RESTO_ENGINES[pt] ?? ES_TELAS_ENTRADA[pt] ?? ES_CALCULADORAS_UI[pt] ?? ES_ELETROLITOS_1[pt] ?? ES_ELETROLITOS_2[pt] ?? ES_TELAS_SUPORTE[pt] ?? ES_ELETROLITOS_RUNTIME[pt] ?? ES_ARRAYS_CALCULADORAS[pt] ?? ES_ACLS[pt] ?? ES_ACLS_GEN[pt] ?? pt;
}

export { ES_STRINGS };
