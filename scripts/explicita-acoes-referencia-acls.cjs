const fs = require("fs");
const path = require("path");

const arquivo = path.resolve(__dirname, "../components/protocol-screen/acls-protocol-screen.tsx");
let src = fs.readFileSync(arquivo, "utf8");

function trocarUnica(antes, depois, rotulo) {
  const partes = src.split(antes);
  if (partes.length !== 2) {
    throw new Error(`${rotulo}: esperado exatamente 1 trecho, encontrados ${partes.length - 1}`);
  }
  src = partes.join(depois);
}

function trocarTodas(antes, depois, esperado, rotulo) {
  const encontrados = src.split(antes).length - 1;
  if (encontrados !== esperado) {
    throw new Error(`${rotulo}: esperado ${esperado}, encontrados ${encontrados}`);
  }
  src = src.split(antes).join(depois);
}

trocarUnica(
`                <Text style={[aclsScreenStyles.resourcesToggleChevron, showRefModules && aclsScreenStyles.resourcesToggleChevronOpen]}>
                  {showRefModules ? "▲" : "▼"}
                </Text>`,
`                <View style={[aclsScreenStyles.resourcesToggleAction, showRefModules && aclsScreenStyles.resourcesToggleActionOpen]}>
                  <Text style={[aclsScreenStyles.resourcesToggleActionText, showRefModules && aclsScreenStyles.resourcesToggleActionTextOpen]}>
                    {showRefModules ? tr("FECHAR") : tr("ABRIR")}
                  </Text>
                  <Text style={[aclsScreenStyles.resourcesToggleChevron, showRefModules && aclsScreenStyles.resourcesToggleChevronOpen]}>
                    {showRefModules ? "▲" : "▼"}
                  </Text>
                </View>`,
"toggle de recursos adicionais"
);

trocarTodas(
`<Text style={aclsScreenStyles.resourceChevron}>›</Text>`,
`<Text style={aclsScreenStyles.resourceChevron}>{tr("ABRIR MÓDULO")} ›</Text>`,
2,
"CTAs dos módulos de referência"
);

trocarUnica(
`<Text style={aclsScreenStyles.referenceShortcutChevron}>›</Text>`,
`<Text style={aclsScreenStyles.referenceShortcutChevron}>{tr("ABRIR REFERÊNCIA")} ›</Text>`,
"CTA de causas reversíveis"
);

trocarUnica(
`  resourcesToggleTextOpen: {
    color: "#0369a1",
  },
  resourcesToggleChevron: {
    fontSize: 10,
    color: "#aab6c6",
  },
  resourcesToggleChevronOpen: {
    color: "#0369a1",
  },`,
`  resourcesToggleTextOpen: {
    color: "#0369a1",
  },
  resourcesToggleAction: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#7dd3fc",
    backgroundColor: "#f0f9ff",
  },
  resourcesToggleActionOpen: {
    backgroundColor: "transparent",
  },
  resourcesToggleActionText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0369a1",
    letterSpacing: 0.4,
  },
  resourcesToggleActionTextOpen: {
    color: "#0369a1",
  },
  resourcesToggleChevron: {
    fontSize: 10,
    color: "#0369a1",
  },
  resourcesToggleChevronOpen: {
    color: "#0369a1",
  },`,
"estilos do toggle de recursos"
);

trocarUnica(
`  resourceChevron: {
    fontSize: 12,
    color: "#7dd3fc",
  },`,
`  resourceChevron: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0369a1",
    letterSpacing: 0.25,
    borderWidth: 1,
    borderColor: "#7dd3fc",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: "hidden",
    backgroundColor: "#f0f9ff",
  },`,
"estilo dos CTAs de módulo"
);

trocarUnica(
`  referenceShortcutChevron: {
    fontSize: 14,
    color: "#d97706",
    fontWeight: "700",
  },`,
`  referenceShortcutChevron: {
    fontSize: 9,
    color: "#92400e",
    fontWeight: "800",
    letterSpacing: 0.25,
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: "hidden",
    backgroundColor: "#fffbeb",
  },`,
"estilo do CTA de referência"
);

fs.writeFileSync(arquivo, src);

const proibidos = [
  `<Text style={aclsScreenStyles.resourceChevron}>›</Text>`,
  `<Text style={aclsScreenStyles.referenceShortcutChevron}>›</Text>`,
];
for (const trecho of proibidos) {
  if (src.includes(trecho)) throw new Error(`Affordance antiga ainda presente: ${trecho}`);
}

console.log("✅ Ações de referência do ACLS agora têm CTAs explícitos.");
