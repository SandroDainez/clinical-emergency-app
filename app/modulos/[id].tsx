import { Redirect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AvcModuloScreen from "../../components/avc/avc-modulo-screen";
import ClinicalApp from "../../components/clinical-app";
import { getClinicalModuleById, getClinicalModules } from "../../clinical-modules";
import { consumeAirwayReturnHandoff } from "../../lib/module-return-handoff";
import { MODULES_HUB_HREF } from "../../lib/modules-hub-route";

/**
 * Ids de módulo a pré-renderizar na exportação web (`web.output: "static"`).
 *
 * Sem isto o build gera um único HTML para o template `/modulos/[id]`, sem id
 * concreto: a tela do módulo não tem o que renderizar e o HTML sai diferente do
 * que o cliente monta — era a causa do hydration mismatch (React #418) nas 28
 * rotas, com flash da landing antes de cada módulo.
 *
 * Enumerando os ids, cada módulo ganha o seu próprio HTML já com o conteúdo
 * certo: o primeiro render do cliente encontra exatamente o mesmo, e a página
 * continua indexável. Não afeta iOS/Android — em nativo não há pré-render.
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [...getClinicalModules().map((m) => ({ id: m.id })), { id: AVC_ID }];
}

/**
 * ⚠️⚠️ O AVC ⛔ NÃO PODE TER ARQUIVO DE ROTA PRÓPRIO NESTE SEGMENTO — D-122.
 *
 * ── O DEFEITO QUE ISTO FECHA (investigado em 2026-08-30) ───────────────────
 *
 * Ele morava em `app/modulos/avc.tsx`, rota estática irmã de `[id].tsx`. Com
 * uma irmã estática no segmento, **voltar pelo navegador** entre duas telas de
 * `/modulos/*` montava a **irmã** em vez da rota dinâmica: o médico entrava em
 * bradicardia, abria as vasoativas pelo atalho, tocava em voltar — e caía no
 * **módulo de AVC**, com a URL da bradicardia na barra.
 *
 * ⚠️⚠️ Trocar o nome do arquivo ⛔ não resolvia (reproduziu como `zoutro.tsx`),
 * declarar as telas no `Stack` ⛔ não resolvia, e a forma de diretório
 * (`avc/index.tsx`) ⛔ também ⛔ não resolvia. O que resolve é ⛔ **não haver
 * irmã estática**: com `[id].tsx` sozinho no segmento, a volta acerta.
 *
 * ⚠️ A URL `/modulos/avc` ⛔ NÃO muda — ela passa a ser servida por aqui, e o id
 * entra em `generateStaticParams` para continuar pré-renderizada (React #418).
 *
 * ⛔ E o AVC continua **fora** do `ClinicalApp`: o desvio acontece ANTES de
 * qualquer `engine`, que é a concha que a reestruturação removeu (D-107).
 */
const AVC_ID = "avc";

export default function ClinicalModuleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; from_module?: string; return_mode?: string }>();
  const moduleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const sourceModuleId = Array.isArray(params.from_module) ? params.from_module[0] : params.from_module;
  // ⚠️ SÓ A FERRAMENTA AUXILIAR MANDA ESTE MARCADOR, e ele diz apenas COMO
  // voltar: o módulo de origem deve reapresentar direto, sem a confirmação de
  // retomada. Para qualquer navegação clínica entre módulos, `from_module`
  // continua exatamente como sempre foi.
  const voltaAuxiliar =
    (Array.isArray(params.return_mode) ? params.return_mode[0] : params.return_mode) === "auxiliary";
  /** ⚠️ Ver `AVC_ID` acima: desvio ANTES do `engine`, e ⛔ nunca dentro dele. */
  const ehAvc = moduleId === AVC_ID;
  const clinicalModule = moduleId && !ehAvc ? getClinicalModuleById(moduleId) : undefined;
  const sourceModule = sourceModuleId ? getClinicalModuleById(sourceModuleId) : undefined;

  if (!ehAvc && !clinicalModule) {
    return <Redirect href="/" />;
  }

  function goToHub() {
    router.replace(MODULES_HUB_HREF);
  }

  function goBackTarget() {
    if (sourceModule?.route) {
      const sourceProtocolId = sourceModule.engine.getEncounterSummary().protocolId;
      const airwayReturnHandoff = sourceProtocolId
        ? consumeAirwayReturnHandoff(sourceProtocolId)
        : undefined;

      if (airwayReturnHandoff && sourceModule.engine.updateAuxiliaryField) {
        sourceModule.engine.updateAuxiliaryField("treatmentAirway", airwayReturnHandoff.airwayValue);
        if (airwayReturnHandoff.oxygenValue) {
          sourceModule.engine.updateAuxiliaryField("treatmentO2", airwayReturnHandoff.oxygenValue);
        }
      }

      const rota = voltaAuxiliar
        ? `${sourceModule.route}${String(sourceModule.route).includes("?") ? "&" : "?"}return_mode=auxiliary`
        : sourceModule.route;
      router.replace(rota as Href);
      return;
    }
    goToHub();
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right", "bottom"]}>
      {/* ⚠️ A ROTA NÃO DESENHA CABEÇALHO. NENHUM. (I7)
       *
       * Havia aqui um cromado — voltar + título — suprimido por uma lista escrita
       * à mão, `COM_CABECALHO_PROPRIO`, com 24 dos 31 módulos. A medição em
       * produção, por coordenada, mostrou a lista ERRADA nas SETE ausências: os
       * sete módulos que recebiam o cromado desenhavam cabeçalho próprio também,
       * e mostravam o título DUAS VEZES.
       *
       * Um deles era a Injúria Renal Aguda, criada no dia anterior: escrevi o
       * módulo e não escrevi a linha. Foi o argumento decisivo — lista de exceção
       * mantida à mão erra por omissão, e a omissão é invisível.
       *
       * ⚠️ A CONSEQUÊNCIA, que é o contrato desta rota: quem monta uma tela de
       * módulo TEM DE DESENHAR O PRÓPRIO CABEÇALHO, com título E com saída. Não
       * há mais rede embaixo. Quatro telas de calculadora dependiam deste
       * cromado como ÚNICO caminho de volta ao hub e ganharam o `Header` do
       * ui-v2 no mesmo commit. `e2e/um-cabecalho-por-tela.spec.ts` mede isso nos
       * 31 e reprova tanto a duplicação quanto a ausência. */}
      <View style={styles.appBody}>
        {/* ⚠️ I7 continua valendo: a tela do AVC desenha o próprio cabeçalho. */}
        {ehAvc ? (
          <AvcModuloScreen onVoltar={goToHub} />
        ) : (
          <ClinicalApp engine={clinicalModule!.engine} onRouteBack={goBackTarget} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#292e38",
  },
  appBody: {
    flex: 1,
  },
});
