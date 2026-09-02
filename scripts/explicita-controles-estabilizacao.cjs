const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const alvo = path.join(raiz, "components/protocol-screen/stabilization-first-card.tsx");
let fonte = fs.readFileSync(alvo, "utf8");

const falhar = (mensagem) => {
  console.error(`\n❌ Patch de affordance abortado: ${mensagem}`);
  process.exit(1);
};

const substituirUmaVez = (antes, depois, rotulo) => {
  const primeira = fonte.indexOf(antes);
  if (primeira < 0) falhar(`âncora ausente: ${rotulo}`);
  if (fonte.indexOf(antes, primeira + antes.length) >= 0) falhar(`âncora duplicada: ${rotulo}`);
  fonte = fonte.slice(0, primeira) + depois + fonte.slice(primeira + antes.length);
};

// Ramo compacto: CTA explícito em vez de depender só do triângulo.
substituirUmaVez(
  `          <Text style={styles.chev}>{expanded ? "▲" : "▼"}</Text>`,
  `          <View style={[styles.headerCta, expanded && styles.headerCtaAberto]}>\n            <Text style={[styles.headerCtaText, expanded && styles.headerCtaTextAberto]}>\n              {expanded ? tr("FECHAR") : tr("ABRIR")}\n            </Text>\n            <Text style={[styles.headerCtaArrow, expanded && styles.headerCtaTextAberto]}>\n              {expanded ? "▲" : "▼"}\n            </Text>\n          </View>`,
  "CTA do expansor compacto"
);

// Ramo legado: mesma assinatura visual.
substituirUmaVez(
  `        <Text style={styles.chev}>{expanded ? "▲" : "▼"}</Text>`,
  `        <View style={[styles.headerCta, expanded && styles.headerCtaAberto]}>\n          <Text style={[styles.headerCtaText, expanded && styles.headerCtaTextAberto]}>\n            {expanded ? tr("FECHAR") : tr("ABRIR")}\n          </Text>\n          <Text style={[styles.headerCtaArrow, expanded && styles.headerCtaTextAberto]}>\n            {expanded ? "▲" : "▼"}\n          </Text>\n        </View>`,
  "CTA do expansor legado"
);

// O detalhe ABCDE deixa de parecer link de texto.
substituirUmaVez(
  `<Text style={styles.verMaisTexto}>{tr("Ver ABCDE completo")}</Text>`,
  `<Text style={styles.verMaisTexto}>{tr("VER ABCDE COMPLETO")} ›</Text>`,
  "CTA do ABCDE completo"
);

// Atalhos de estabilização: seta reforça navegação.
const atalho = `<Text style={styles.shortcutText}>{tr(m.label)}</Text>`;
const ocorrencias = fonte.split(atalho).length - 1;
if (ocorrencias !== 2) falhar(`esperadas 2 ocorrências do atalho; encontradas ${ocorrencias}`);
fonte = fonte.replaceAll(
  atalho,
  `<Text style={styles.shortcutText}>{tr(m.label)}</Text>\n                <Text style={styles.shortcutArrow}>›</Text>`
);

// Estilos: botão de detalhe e CTA do cabeçalho.
substituirUmaVez(
  `  verMais: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },\n  verMaisTexto: { fontSize: 13, fontWeight: "800", color: "#7fb3ff" },`,
  `  verMais: {\n    alignSelf: "flex-start",\n    minHeight: 44,\n    justifyContent: "center",\n    paddingHorizontal: 14,\n    paddingVertical: 9,\n    borderRadius: 10,\n    borderWidth: 1.5,\n    borderColor: "#7fb3ff",\n    backgroundColor: "rgba(127,179,255,0.12)",\n  },\n  verMaisTexto: { fontSize: 12, fontWeight: "900", color: "#7fb3ff", letterSpacing: 0.35 },\n  headerCta: {\n    minWidth: 78,\n    minHeight: 36,\n    flexDirection: "row",\n    alignItems: "center",\n    justifyContent: "center",\n    gap: 6,\n    paddingHorizontal: 10,\n    borderRadius: 10,\n    backgroundColor: "#fecaca",\n    borderWidth: 1,\n    borderColor: "#fecaca",\n  },\n  headerCtaAberto: { backgroundColor: "transparent" },\n  headerCtaText: { fontSize: 10, fontWeight: "900", color: "#7f1d1d", letterSpacing: 0.5 },\n  headerCtaTextAberto: { color: "#fecaca" },\n  headerCtaArrow: { fontSize: 10, fontWeight: "900", color: "#7f1d1d" },\n  shortcutArrow: { fontSize: 18, lineHeight: 20, fontWeight: "900", color: "#dbeafe" },`,
  "estilos de affordance"
);

if ((fonte.match(/VER ABCDE COMPLETO/g) ?? []).length !== 1) falhar("CTA ABCDE não ficou único");
if ((fonte.match(/headerCta/g) ?? []).length < 6) falhar("CTA do cabeçalho não foi inserido");
if ((fonte.match(/shortcutArrow/g) ?? []).length !== 3) falhar("setas dos atalhos não ficaram em ambos os ramos");

fs.writeFileSync(alvo, fonte, "utf8");
console.log("✅ Controles de estabilização agora têm affordance explícita.");
