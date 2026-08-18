import { type Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/design-system/theme";
import { getPalette, PALETA_BLOQUEADA, TEXTO_BLOQUEADO } from "@/design-system/paleta-de-area";
import { openClinicalModule } from "@/lib/open-clinical-module";

/**
 * CARD DE MÓDULO — UI 2.0, três colunas.
 *
 * O desenho vem do protótipo julgado pelo médico: card de 123 px, ícone de traço
 * em cima, título em até três linhas, descritor curto, e etiqueta SÓ quando ela
 * diz algo que o título não diz (R-91). A cor vive na BARRA lateral e na
 * etiqueta — nunca no fundo.
 *
 * ⚠️ NENHUM HEXADECIMAL AQUI. Arquivo novo nasce com zero cor própria
 * (`test:paleta`): a área vem de `design-system/paleta-de-area.ts` e o texto do
 * tema. É por isso que a paleta saiu de `module-hub.tsx` ANTES deste componente
 * existir — se ela tivesse ficado lá, a cor seria duplicada entre os dois.
 *
 * ⚠️ O TÍTULO PODE OCUPAR TRÊS LINHAS, e isso é decisão de conteúdo, não folga de
 * layout: encurtar «Crises convulsivas e mal epiléptico» para caber seria
 * conteúdo saindo por layout. A trava da ordem do hub foi consertada ANTES deste
 * componente exatamente porque ela exigia o título dentro de um nó só.
 */
export type ModuloDoCard = {
  id: string;
  titulo: string;
  descritor: string;
  /** Vazio quando a etiqueta apenas repetiria o título (R-91). */
  etiqueta: string;
  icone: string;
  rota: string;
  bloqueado: boolean;
};

export default function CardDeModulo({
  mod,
  tr,
}: {
  mod: ModuloDoCard;
  tr: (pt: string) => string;
}) {
  const router = useRouter();
  const { cores } = useTheme();
  const paleta = mod.bloqueado ? PALETA_BLOQUEADA : getPalette(mod.etiqueta || "Módulo");

  function aoTocar() {
    if (mod.bloqueado) {
      router.push("/paywall");
      return;
    }
    void openClinicalModule(router, mod.id, mod.rota as Href);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tr(mod.titulo)}
      accessibilityHint={mod.bloqueado ? tr("Requer assinatura") : undefined}
      onPress={aoTocar}
      style={({ pressed }) => [
        e.card,
        { backgroundColor: cores.surface, borderColor: cores.border },
        pressed && e.cardTocado,
      ]}>
      <View style={[e.barra, { backgroundColor: paleta.accent }]} />

      <View style={e.topo}>
        <Text style={[e.icone, { color: mod.bloqueado ? paleta.badgeText : cores.text }]}>
          {mod.icone}
        </Text>
        {mod.bloqueado && <Text style={[e.cadeado, { color: paleta.badgeText }]}>🔒</Text>}
      </View>

      <Text
        style={[e.titulo, { color: mod.bloqueado ? TEXTO_BLOQUEADO.titulo : cores.text }]}
        numberOfLines={3}>
        {tr(mod.titulo)}
      </Text>
      <Text
        style={[
          e.descritor,
          { color: mod.bloqueado ? TEXTO_BLOQUEADO.descritor : cores.textSecondary },
        ]}
        numberOfLines={2}>
        {tr(mod.descritor)}
      </Text>

      {mod.etiqueta !== "" && (
        <Text style={[e.etiqueta, { color: paleta.badgeText }]} numberOfLines={1}>
          {tr(mod.etiqueta)}
        </Text>
      )}
    </Pressable>
  );
}

const e = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 96,
    borderRadius: 10,
    borderWidth: 1,
    paddingTop: 9,
    paddingBottom: 8,
    paddingLeft: 11,
    paddingRight: 8,
    overflow: "hidden",
    gap: 5,
  },
  cardTocado: { opacity: 0.75 },
  barra: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  icone: { fontSize: 15, lineHeight: 18 },
  cadeado: { fontSize: 11, lineHeight: 14 },
  titulo: { fontSize: 12.5, fontWeight: "700", lineHeight: 15 },
  descritor: { fontSize: 9.5, lineHeight: 12, flex: 1 },
  etiqueta: { fontSize: 8.5, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
});
