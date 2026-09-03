const fs = require("fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}
function requireText(src, text, label) {
  if (!src.includes(text)) throw new Error(`FALHA · ${label}: não encontrou ${text}`);
}
function forbidText(src, text, label) {
  if (src.includes(text)) throw new Error(`FALHA · ${label}: padrão proibido ${text}`);
}

const single = read("components/ui-v2/horizontal-choice-selector.tsx");
requireText(single, "showsHorizontalScrollIndicator", "seletor único mostra scrollbar");
requireText(single, "persistentScrollbar", "seletor único mantém scrollbar");
requireText(single, 'accessibilityRole="radio"', "seletor único preserva semântica de rádio");

const multi = read("components/ui-v2/horizontal-multi-select.tsx");
requireText(multi, "showsHorizontalScrollIndicator", "multisseletor mostra scrollbar");
requireText(multi, "persistentScrollbar", "multisseletor mantém scrollbar");
requireText(multi, 'accessibilityRole="checkbox"', "multisseletor preserva semântica de checkbox");

const categorical = read("components/ui-v2/categorical-selector.tsx");
requireText(categorical, "HorizontalChoiceSelector", "CategoricalSelector delega ao canônico");
forbidText(categorical, 'flexWrap: "wrap"', "CategoricalSelector não recria grade local");

const vm = read("components/protocol-screen/ventilator-configurator-card.tsx");
requireText(vm, "HorizontalChoiceSelector", "VM usa seletor canônico");
requireText(vm, 'testID="vm-altura-presets"', "VM altura padronizada");
requireText(vm, 'testID="vm-sexo"', "VM sexo padronizado");
requireText(vm, 'testID="vm-cenario"', "VM cenário padronizado");

const sed = read("components/protocol-screen/sedation-calculator-screen.tsx");
requireText(sed, "HorizontalChoiceSelector", "sedação usa seletor canônico");
forbidText(sed, "showsHorizontalScrollIndicator={false}", "sedação não esconde scrollbar de escolhas");

const vaso = read("components/protocol-screen/vasoactive-calculator-screen.tsx");
requireText(vaso, "HorizontalChoiceSelector", "vasoativos usa seletor canônico");
forbidText(vaso, "showsHorizontalScrollIndicator={false}", "vasoativos não esconde scrollbar de escolhas");

const rail = read("components/protocol-screen/module-flow-shell.tsx");
requireText(rail, "showsHorizontalScrollIndicator={!lateral}", "rail horizontal mostra scrollbar");
requireText(rail, "persistentScrollbar={!lateral}", "rail horizontal mantém scrollbar");

const auxiliary = read("components/protocol-screen/auxiliary-panel-card.tsx");
requireText(auxiliary, "HorizontalMultiSelect", "presets múltiplos usam multisseletor canônico");
forbidText(auxiliary, "styles.auxiliaryPresetRow", "toggle_token não volta a botões locais");

console.log("OK · padrão canônico de seletores protegido");
