const fs = require("node:fs");

function replaceExact(source, from, to, label) {
  const first = source.indexOf(from);
  if (first < 0) throw new Error(`${label}: padrão não encontrado`);
  if (source.indexOf(from, first + from.length) >= 0) {
    throw new Error(`${label}: padrão apareceu mais de uma vez`);
  }
  return source.slice(0, first) + to + source.slice(first + from.length);
}

function migrate(path, transforms) {
  let source = fs.readFileSync(path, "utf8");
  for (const [from, to, label] of transforms) source = replaceExact(source, from, to, label);
  fs.writeFileSync(path, source);
}

migrate("components/protocol-screen/acls-choking-screen.tsx", [
  [
    'import { markProtocolSessionForResume } from "../../lib/module-session-navigation";\n',
    "",
    "OVACE remove import de resume manual",
  ],
  [
    'import { buildClinicalContextHref, getClinicalContextNavigation } from "../../lib/clinical-context-navigation";',
    'import { executeClinicalContextNavigation, getClinicalContextNavigation } from "../../lib/clinical-context-navigation";',
    "OVACE usa executor contextual",
  ],
  [
    '            // Pré-marca a hipóxia como SUSPEITA no destino: a causa já é\n            // conhecida, e o app não deve pedir que se procure o que a própria\n            // navegação sabe. "suspeita" e não "abordada" — ela só é abordada\n            // quando o objeto sair.\n            markProtocolSessionForResume("pcr_adulto", ["hipoxia"]);\n            router.push(buildClinicalContextHref(pcrNavigation) as never);',
    '            executeClinicalContextNavigation(pcrNavigation, (href) => router.push(href as never));',
    "OVACE terminal usa executor",
  ],
]);

migrate("components/protocol-screen/acls-pregnancy-screen.tsx", [
  [
    'import { buildClinicalContextHref, getClinicalContextNavigation } from "../../lib/clinical-context-navigation";',
    'import { executeClinicalContextNavigation, getClinicalContextNavigation } from "../../lib/clinical-context-navigation";',
    "Gestação usa executor contextual",
  ],
  [
    'import { markProtocolSessionForResume } from "../../lib/module-session-navigation";\n',
    "",
    "Gestação remove import de resume manual",
  ],
  [
    '            // A causa NÃO é pré-marcada aqui, ao contrário do engasgo: na\n            // gestante a etiologia é aberta (ABCDEFGH), e marcar uma causa\n            // sem saber qual é o oposto do que o módulo ensina.\n            markProtocolSessionForResume("pcr_adulto");\n            router.push(buildClinicalContextHref(pcrNavigation) as never);',
    '            // A etiologia permanece aberta (ABCDEFGH); o contrato não pré-marca causa.\n            executeClinicalContextNavigation(pcrNavigation, (href) => router.push(href as never));',
    "Gestação subfluxo PCR usa executor",
  ],
  [
    '          onPress={() => router.push(buildClinicalContextHref(preEclampsiaNavigation) as never)}',
    '          onPress={() => executeClinicalContextNavigation(preEclampsiaNavigation, (href) => router.push(href as never))}',
    "Gestação referência obstétrica usa executor",
  ],
]);

migrate("components/protocol-screen/acls-protocol-screen.tsx", [
  [
    'import { markProtocolSessionForResume } from "../../lib/module-session-navigation";\n',
    "",
    "PCR remove import de resume manual",
  ],
  [
    'import { ACLS_REFERENCE_NAVIGATION, buildClinicalContextHref, getClinicalContextNavigation } from "../../lib/clinical-context-navigation";',
    'import { ACLS_REFERENCE_NAVIGATION, buildClinicalContextHref, executeClinicalContextNavigation, getClinicalContextNavigation } from "../../lib/clinical-context-navigation";',
    "PCR importa executor contextual",
  ],
  [
    '                markProtocolSessionForResume(encounterSummary.protocolId);\n                router.push(buildClinicalContextHref(reversibleCausesNavigation) as Href);',
    '                executeClinicalContextNavigation(reversibleCausesNavigation, (href) => router.push(href as Href));',
    "PCR HsTs principal usa executor",
  ],
  [
    '              markProtocolSessionForResume(encounterSummary.protocolId);\n              router.push(buildClinicalContextHref(postRoscNavigation) as Href);',
    '              executeClinicalContextNavigation(postRoscNavigation, (href) => router.push(href as Href));',
    "PCR pós-ROSC usa executor",
  ],
  [
    '                        markProtocolSessionForResume(encounterSummary.protocolId);\n                        router.push(mod.route);',
    '                        executeClinicalContextNavigation(mod, (href) => router.push(href as Href));',
    "PCR recursos contextuais usam executor",
  ],
  [
    '              markProtocolSessionForResume(encounterSummary.protocolId);\n              router.push(buildClinicalContextHref(reversibleCausesNavigation) as Href);',
    '              executeClinicalContextNavigation(reversibleCausesNavigation, (href) => router.push(href as Href));',
    "PCR HsTs card usa executor",
  ],
]);

console.log("Migração contextual aplicada com padrões exatos em PCR, OVACE e gestação.");
