const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const falhar = (m) => { console.error(`\n❌ Patch de expansores abortado: ${m}`); process.exit(1); };
const ler = (r) => fs.readFileSync(path.join(raiz, r), "utf8");
const gravar = (r, s) => fs.writeFileSync(path.join(raiz, r), s, "utf8");
const trocar = (fonte, antes, depois, rotulo) => {
  const i = fonte.indexOf(antes);
  if (i < 0) falhar(`âncora ausente: ${rotulo}`);
  if (fonte.indexOf(antes, i + antes.length) >= 0) falhar(`âncora duplicada: ${rotulo}`);
  return fonte.slice(0, i) + depois + fonte.slice(i + antes.length);
};

// ── Configurador de VM ───────────────────────────────────────────────────────
{
  const rel = "components/protocol-screen/ventilator-configurator-card.tsx";
  let f = ler(rel);
  f = trocar(
    f,
    `        <Text style={s.chev}>{expanded ? "▲" : "▼"}</Text>`,
    `        <View style={[s.headerCta, expanded && s.headerCtaOpen]}>\n          <Text style={[s.headerCtaText, expanded && s.headerCtaTextOpen]}>\n            {expanded ? tr("FECHAR") : tr("ABRIR")}\n          </Text>\n          <Text style={[s.headerCtaArrow, expanded && s.headerCtaTextOpen]}>\n            {expanded ? "▲" : "▼"}\n          </Text>\n        </View>`,
    "CTA do configurador de VM"
  );
  f = trocar(
    f,
    `  chev: { fontSize: 12, color: "#67e8f9", fontWeight: "800" },`,
    `  headerCta: { minWidth: 78, minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, backgroundColor: "#67e8f9", borderWidth: 1, borderColor: "#67e8f9", paddingHorizontal: 10 },\n  headerCtaOpen: { backgroundColor: "transparent" },\n  headerCtaText: { fontSize: 10, fontWeight: "900", color: "#06222b", letterSpacing: 0.5 },\n  headerCtaTextOpen: { color: "#67e8f9" },\n  headerCtaArrow: { fontSize: 10, fontWeight: "900", color: "#06222b" },`,
    "estilos CTA do configurador"
  );
  gravar(rel, f);
}

// ── Sedação: Informações clínicas + Referência ───────────────────────────────
{
  const rel = "components/protocol-screen/sedation-calculator-screen.tsx";
  let f = ler(rel);

  f = trocar(
    f,
    `<Text style={s.collapseChev}>{showInfo ? "▲" : "▼"}</Text>`,
    `<View style={[s.collapseCta, showInfo && s.collapseCtaOpen]}>\n              <Text style={[s.collapseCtaText, showInfo && s.collapseCtaTextOpen]}>{showInfo ? tr("FECHAR") : tr("ABRIR")}</Text>\n              <Text style={[s.collapseCtaArrow, showInfo && s.collapseCtaTextOpen]}>{showInfo ? "▲" : "▼"}</Text>\n            </View>`,
    "Informações clínicas da sedação"
  );
  f = trocar(
    f,
    `<Text style={s.collapseChev}>{showRef ? "▲" : "▼"}</Text>`,
    `<View style={[s.collapseCta, showRef && s.collapseCtaOpen]}>\n              <Text style={[s.collapseCtaText, showRef && s.collapseCtaTextOpen]}>{showRef ? tr("FECHAR") : tr("ABRIR")}</Text>\n              <Text style={[s.collapseCtaArrow, showRef && s.collapseCtaTextOpen]}>{showRef ? "▲" : "▼"}</Text>\n            </View>`,
    "Referência da sedação"
  );
  f = trocar(
    f,
    `  collapseChev: { fontSize: 12, color: "#aab6c6" },`,
    `  collapseCta: { minWidth: 78, minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 10, borderRadius: 9, backgroundColor: "#818cf8", borderWidth: 1, borderColor: "#818cf8" },\n  collapseCtaOpen: { backgroundColor: "transparent" },\n  collapseCtaText: { fontSize: 9, fontWeight: "900", color: "#ffffff", letterSpacing: 0.45 },\n  collapseCtaTextOpen: { color: "#c7d2fe" },\n  collapseCtaArrow: { fontSize: 9, fontWeight: "900", color: "#ffffff" },`,
    "estilos de expansor da sedação"
  );
  gravar(rel, f);
}

// ── Vasoativos: Referência + Associações ────────────────────────────────────
{
  const rel = "components/protocol-screen/vasoactive-calculator-screen.tsx";
  let f = ler(rel);

  f = trocar(
    f,
    `<Text style={s.collapseChev}>{showRefPanel ? "▲" : "▼"}</Text>`,
    `<View style={[s.collapseCta, showRefPanel && s.collapseCtaOpen]}>\n              <Text style={[s.collapseCtaText, showRefPanel && s.collapseCtaTextOpen]}>{showRefPanel ? tr("FECHAR") : tr("ABRIR")}</Text>\n              <Text style={[s.collapseCtaArrow, showRefPanel && s.collapseCtaTextOpen]}>{showRefPanel ? "▲" : "▼"}</Text>\n            </View>`,
    "Referência dos vasoativos"
  );
  f = trocar(
    f,
    `<Text style={s.collapseChev}>{showAssocPanel ? "▲" : "▼"}</Text>`,
    `<View style={[s.collapseCta, showAssocPanel && s.collapseCtaOpen]}>\n                  <Text style={[s.collapseCtaText, showAssocPanel && s.collapseCtaTextOpen]}>{showAssocPanel ? tr("FECHAR") : tr("ABRIR")}</Text>\n                  <Text style={[s.collapseCtaArrow, showAssocPanel && s.collapseCtaTextOpen]}>{showAssocPanel ? "▲" : "▼"}</Text>\n                </View>`,
    "Associações dos vasoativos"
  );
  f = trocar(
    f,
    `  collapseChev:     { fontSize: 12, color: "#aab6c6" },`,
    `  collapseCta:      { minWidth: 78, minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 10, borderRadius: 9, backgroundColor: "#7fb3ff", borderWidth: 1, borderColor: "#7fb3ff" },\n  collapseCtaOpen:  { backgroundColor: "transparent" },\n  collapseCtaText:  { fontSize: 9, fontWeight: "900", color: "#1d2939", letterSpacing: 0.45 },\n  collapseCtaTextOpen:{ color: "#7fb3ff" },\n  collapseCtaArrow: { fontSize: 9, fontWeight: "900", color: "#1d2939" },`,
    "estilos de expansor dos vasoativos"
  );
  gravar(rel, f);
}

console.log("✅ Expansores críticos agora exibem ABRIR/FECHAR explicitamente.");
