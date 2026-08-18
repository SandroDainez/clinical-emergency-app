import { type Href, useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  bordaDoCard,
  fundoDaPilula,
  fundoDoCard,
  getPalette,
  PALETA_BLOQUEADA,
  TEXTO_BLOQUEADO,
} from "@/design-system/paleta-de-area";
import { DESENHO_DO_MODULO } from "@/design-system/desenho-do-modulo";
import { useTheme } from "@/design-system/theme";
import { openClinicalModule } from "@/lib/open-clinical-module";

/**
 * CARD DE MÓDULO — UI 2.0.
 *
 * Desenho decidido pelo médico olhando protótipo, não argumentando:
 *
 *   · ÍCONE CHEIO E COLORIDO no topo, com HALO da cor da categoria — é o que faz
 *     o card ser reconhecido antes de ser lido;
 *   · TÍTULO À ESQUERDA, não centralizado. Medido antes de decidir: 22 dos 30
 *     títulos ocupam 2+ linhas, com irregularidade média de 25 px entre elas
 *     (86 px no pior caso). Centralizado, essa diferença aparece dos DOIS lados
 *     e a coluna se varre pior;
 *   · ETIQUETA EM PÍLULA, e SÓ onde ela diz o que o título não diz (R-91) — na
 *     seção do PCR, 6 dos 7 cards;
 *   · FUNDO TINGIDO a 7% e SEM BARRA LATERAL: com halo, pílula e tingimento, a
 *     barra seria o quarto canal dizendo a mesma coisa.
 *
 * ⚠️ NENHUM HEXADECIMAL AQUI (`test:paleta`). Halo, pílula e tingimento saem da
 * cor da categoria por FUNÇÃO, no design system — não há segunda cor a manter em
 * sincronia. Foi para isto que a paleta saiu de `module-hub.tsx` antes.
 *
 * ⚠️ O TÍTULO PODE OCUPAR TRÊS LINHAS. Encurtar título para caber é conteúdo
 * saindo por layout; quando um título mudou («Crises e mal epiléptico»), foi por
 * decisão de conteúdo do médico, não por medida de card.
 */
export type ModuloDoCard = {
  id: string;
  titulo: string;
  descritor: string;
  /**
   * A área clínica do módulo — SEMPRE preenchida. É ela que dá a cor.
   *
   * ⚠️ NÃO CONFUNDIR COM `etiqueta`. Esconder o RÓTULO (R-91) não pode apagar a
   * CATEGORIA: na primeira versão os dois eram o mesmo campo, e os três cards
   * cujo rótulo é eco do título — PCR na Gestação, Cuidados Pós-PCR — caíram no
   * cinza genérico. O card perdeu a cor por causa de uma decisão sobre TEXTO.
   */
  area: string;
  /** Vazio quando a etiqueta apenas repetiria o título (R-91). */
  etiqueta: string;
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
  const area = mod.area;
  const paleta = mod.bloqueado ? PALETA_BLOQUEADA : getPalette(area);

  const fundo = mod.bloqueado ? cores.surface : fundoDoCard(area, cores.surface);
  const borda = mod.bloqueado ? cores.border : bordaDoCard(area, cores.border);

  // ⚠️ Os 31 desenhos foram conferidos um a um no repositório do Noto ANTES de a
  // dependência entrar. `null` aqui não é piso silencioso: sem desenho, o card
  // mostra só o halo, e a ausência fica visível em vez de virar quadrado vazio.
  const desenho = DESENHO_DO_MODULO[mod.id] ?? null;

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
        { backgroundColor: fundo, borderColor: borda },
        pressed && e.cardTocado,
      ]}>
      <View style={e.topo}>
        {/* ⚠️ O HALO É O FUNDO DO PRÓPRIO CÍRCULO, não um irmão posicionado. Na
            primeira versão ele era uma View absoluta ao lado, e o ícone saía
            centralizado enquanto o halo ficava à esquerda — dois discos por
            card. Só o print mostrou. */}
        <View style={[e.halo, { backgroundColor: fundoDaPilula(area, fundo) }]}>
          {desenho ? (
            <SvgXml xml={desenho} width={20} height={20} opacity={mod.bloqueado ? 0.45 : 1} />
          ) : null}
        </View>
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
        <View style={[e.pilula, { backgroundColor: fundoDaPilula(area, fundo) }]}>
          <Text style={[e.etiqueta, { color: paleta.accent }]} numberOfLines={1}>
            {tr(mod.etiqueta)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const e = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 96,
    borderRadius: 11,
    borderWidth: 1,
    paddingTop: 9,
    paddingBottom: 8,
    paddingHorizontal: 7,
    overflow: "hidden",
    gap: 4,
    alignItems: "flex-start",
  },
  cardTocado: { opacity: 0.75 },
  cadeado: { fontSize: 11, lineHeight: 14 },
  topo: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  halo: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  titulo: { fontSize: 12.5, fontWeight: "700", lineHeight: 15, textAlign: "left" },
  // ⚠️ 11 px, decidido pelo médico. A COR NÃO MUDA (PD-10).
  descritor: { fontSize: 11, lineHeight: 13, flex: 1, textAlign: "left" },
  pilula: { borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 },
  etiqueta: { fontSize: 8, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase" },
});
