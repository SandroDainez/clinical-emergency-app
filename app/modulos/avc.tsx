/**
 * ROTA PRÓPRIA DO MÓDULO AVC — `/modulos/avc`.
 *
 * ⚠️ ROTA ESTÁTICA DE PROPÓSITO. No expo-router um arquivo concreto vence o
 * template `[id].tsx`, e é isso que mantém o AVC FORA do caminho legado: o
 * `[id].tsx` monta `ClinicalApp` com um `ClinicalEngine`, que é exatamente a
 * concha que a reestruturação removeu (D-107).
 *
 * ⛔ O AVC não é registrado em `clinical-modules.ts` e ⛔ não tem `engine`.
 */
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AvcModuloScreen from "../../components/avc/avc-modulo-screen";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { MODULES_HUB_HREF } from "../../lib/modules-hub-route";

export default function AvcRoute() {
  const router = useRouter();
  // ⚠️ Cor vem do tema, nunca de hexadecimal escrito aqui — arquivo novo nasce
  // no design system, e é a trava `test:paleta` que garante que continue assim.
  const e = useEstilosDoTema(criarEstilos);
  return (
    <SafeAreaView style={e.root} edges={["top", "left", "right", "bottom"]}>
      <View style={e.corpo}>
        {/* ⚠️ I7: a rota NÃO desenha cabeçalho — quem monta a tela desenha o seu,
            com título e com saída. A tela do AVC cumpre isso. */}
        <AvcModuloScreen onVoltar={() => router.replace(MODULES_HUB_HREF)} />
      </View>
    </SafeAreaView>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tema.cores.bg },
    corpo: { flex: 1 },
  });
