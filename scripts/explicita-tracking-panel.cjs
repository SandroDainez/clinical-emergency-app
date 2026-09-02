const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const rel = "components/ui-v2/tracking-panel.tsx";
const alvo = path.join(raiz, rel);
let fonte = fs.readFileSync(alvo, "utf8");

function falhar(msg) {
  console.error(`\n❌ Patch do TrackingPanel abortado: ${msg}`);
  process.exit(1);
}
function trocar(antes, depois, rotulo) {
  const i = fonte.indexOf(antes);
  if (i < 0) falhar(`âncora ausente: ${rotulo}`);
  if (fonte.indexOf(antes, i + antes.length) >= 0) falhar(`âncora duplicada: ${rotulo}`);
  fonte = fonte.slice(0, i) + depois + fonte.slice(i + antes.length);
}

trocar(
  `        <Text style={e.chevron}>\n          {aberto ? "▴" : escondidos > 0 ? \`+\${escondidos} ▾\` : "▾"}\n        </Text>`,
  `        <View style={[e.toggleCta, aberto && e.toggleCtaAberto]}>\n          <Text style={[e.toggleCtaText, aberto && e.toggleCtaTextAberto]}>\n            {aberto ? "FECHAR" : "ABRIR"}\n          </Text>\n          <Text style={[e.toggleMeta, aberto && e.toggleCtaTextAberto]}>\n            {aberto ? "▴" : escondidos > 0 ? \`+\${escondidos} ▾\` : "▾"}\n          </Text>\n        </View>`,
  "CTA do TrackingPanel"
);

trocar(
  `      chevron: { ...TIPOGRAFIA.caption, color: c.textSecondary, flexShrink: 0 },`,
  `      toggleCta: {\n        minWidth: 82,\n        minHeight: 34,\n        flexDirection: "row",\n        alignItems: "center",\n        justifyContent: "center",\n        gap: 5,\n        flexShrink: 0,\n        borderRadius: RAIO.botao,\n        borderWidth: 1,\n        borderColor: c.primary,\n        backgroundColor: c.primary,\n        paddingHorizontal: ESPACO.sm,\n      },\n      toggleCtaAberto: { backgroundColor: "transparent" },\n      toggleCtaText: { ...TIPOGRAFIA.micro, color: c.onPrimary, fontWeight: "900", letterSpacing: 0.45 },\n      toggleCtaTextAberto: { color: c.primary },\n      toggleMeta: { ...TIPOGRAFIA.micro, color: c.onPrimary, fontWeight: "900" },`,
  "estilos do CTA do TrackingPanel"
);

if (!/aberto \? "FECHAR" : "ABRIR"/.test(fonte)) falhar("ABRIR/FECHAR não foi inserido");
if (/style=\{e\.chevron\}/.test(fonte)) falhar("chevron antigo permaneceu");

fs.writeFileSync(alvo, fonte, "utf8");
console.log("✅ TrackingPanel agora deixa explícito que a faixa é clicável.");
