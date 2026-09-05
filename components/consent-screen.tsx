/**
 * CONSENTIMENTO DE USO — a parede entre o produto e a conduta.
 *
 * ── ⚠️⚠️ O QUE ESTA TELA É, ⛔ E O QUE ELA ⛔ NÃO É ─────────────────────────
 *
 * ⚠️ Ela é **aceite**: o médico declara que leu de quem é a decisão ⛔ antes de
 * ver a primeira dose calculada. ⛔ Ela ⛔ **não** é a landing: `intro-landing`
 * apresenta o produto ⛔ e convida ("Começar agora"); esta cobra ciência
 * ("Li e estou ciente"), ⛔ e o texto é sobre responsabilidade, ⛔ não sobre
 * funcionalidade.
 *
 * ⚠️⚠️ ⛔ POR QUE ELA VEM DEPOIS DA GUARDA, ⛔ E ⛔ NÃO ANTES: quem ⛔ não tem acesso
 * ⛔ nem deveria ser convidado a consentir com nada — ⛔ e a guarda já devolve
 * `login` ⛔ ou `bloqueado` nesses casos. ⚠️ O aceite protege o **conteúdo
 * clínico**, ⛔ e é exatamente ali que ele se interpõe.
 *
 * ── ⛔ NENHUM HEX AQUI ──────────────────────────────────────────────────────
 *
 * ⚠️ A versão de origem (`acls-pcr-standalone`) escrevia `#0a0f1a` ⛔ e mais oito
 * cores cruas. ⛔ `valida-paleta` proíbe hex **novo** em `components/` — ⛔ e com
 * razão: cor duplicada é a divergência que a trava existe para matar. Tudo aqui
 * sai de `tema.cores`, ⛔ e por isso a tela nasce clara ⛔ e escura de uma vez.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../design-system/theme";
import { useTr } from "../lib/use-tr";

export type ConsentScreenProps = {
  onAccept: () => void;
};

export default function ConsentScreen({ onAccept }: ConsentScreenProps) {
  const e = useEstilosDoTema(criarEstilos);
  const tr = useTr();

  return (
    <View style={e.tela} testID="consentimento">
      <ScrollView contentContainerStyle={e.rolagem} showsVerticalScrollIndicator={false}>
        <View style={e.cabecalho}>
          <View style={e.selo}>
            <Text style={e.seloTexto}>{tr("Apoio à decisão clínica")}</Text>
          </View>
          <Text style={e.titulo}>{tr("Antes de entrar")}</Text>
        </View>

        <View style={e.cartao}>
          <Text style={e.sobrancelha}>{tr("Consentimento de uso")}</Text>

          {/**
           * ⚠️ FRASE INTEIRA, ⛔ e ⛔ não montada por pedaços.
           *
           * ⛔ A versão de origem quebrava este parágrafo em três `<Text>` para
           * pôr uma palavra em negrito — ⛔ e frase concatenada ⛔ não tem chave de
           * tradução (R-82): cada pedaço ganha a sua, ⛔ e a sentença que chega à
           * tela ⛔ não tem nenhuma. O destaque saiu; a chave ficou.
           */}
          <Text style={e.corpo}>
            {tr(
              "Este aplicativo é uma ferramenta de apoio educacional e à decisão clínica, baseada em diretrizes vigentes. Serve ao estudo e à prática — não substitui o julgamento clínico, a avaliação individualizada do paciente nem os protocolos da sua instituição."
            )}
          </Text>

          <View style={e.alerta}>
            <Text style={e.alertaTitulo}>{tr("⚠ A decisão final é do profissional")}</Text>
            <Text style={e.alertaTexto}>
              {tr(
                "A conduta e a responsabilidade pelo atendimento são sempre do profissional de saúde assistente. Ao usar, você reconhece as implicações éticas e legais inerentes à prática clínica."
              )}
            </Text>
          </View>

          {/**
           * ⚠️ O RÓTULO É O ACEITE — ⛔ e por isso ele vem primeiro, ⛔ e em cima.
           * ⛔ "Entrar" sozinho seria um botão de navegação; o que se registra
           * aqui é a ciência, ⛔ e não a intenção de avançar.
           */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr("Li e estou ciente — entrar no aplicativo")}
            onPress={onAccept}
            style={({ pressed }) => [e.botao, pressed && e.pressionado]}
            testID="consentimento-aceitar"
          >
            <Text style={e.botaoSobrancelha}>{tr("Li e estou ciente")}</Text>
            <Text style={e.botaoTexto}>{tr("Entrar no aplicativo")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    tela: { flex: 1, backgroundColor: tema.cores.bg },
    rolagem: {
      flexGrow: 1,
      justifyContent: "center",
      padding: ESPACO.md,
      paddingVertical: ESPACO.xl,
      gap: ESPACO.md,
      maxWidth: 560,
      width: "100%",
      alignSelf: "center",
    },
    cabecalho: { gap: ESPACO.sm },
    selo: {
      alignSelf: "flex-start",
      paddingHorizontal: ESPACO.sm,
      paddingVertical: ESPACO.xs,
      borderRadius: RAIO.badge,
      backgroundColor: tema.cores.surface,
      borderWidth: 1,
      borderColor: tema.cores.border,
    },
    seloTexto: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    titulo: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.title.fontSize,
      fontWeight: "700",
    },
    cartao: {
      backgroundColor: tema.cores.surface,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: tema.cores.border,
      padding: ESPACO.md,
      gap: ESPACO.md,
    },
    sobrancelha: {
      color: tema.cores.textSecondary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    corpo: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.body.fontSize,
      lineHeight: TIPOGRAFIA.body.fontSize * 1.5,
    },
    alerta: {
      backgroundColor: tema.cores.bg,
      borderRadius: RAIO.botao,
      borderLeftWidth: 4,
      borderLeftColor: tema.cores.critical,
      padding: ESPACO.sm,
      gap: ESPACO.xs,
    },
    alertaTitulo: {
      color: tema.cores.critical,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
    alertaTexto: {
      color: tema.cores.text,
      fontSize: TIPOGRAFIA.caption.fontSize,
      lineHeight: TIPOGRAFIA.caption.fontSize * 1.5,
    },
    botao: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: tema.cores.primary,
      borderRadius: RAIO.botao,
      paddingVertical: ESPACO.sm,
      paddingHorizontal: ESPACO.md,
      gap: ESPACO.xs,
    },
    pressionado: { opacity: 0.88 },
    botaoSobrancelha: {
      color: tema.cores.onPrimary,
      fontSize: TIPOGRAFIA.micro.fontSize,
      fontWeight: "700",
    },
    botaoTexto: {
      color: tema.cores.onPrimary,
      fontSize: TIPOGRAFIA.body.fontSize,
      fontWeight: "700",
    },
  });
