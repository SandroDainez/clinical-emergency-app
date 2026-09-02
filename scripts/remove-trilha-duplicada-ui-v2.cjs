const fs = require("fs");

const file = "components/protocol-screen/acls-decision-flow-screen.tsx";
let src = fs.readFileSync(file, "utf8");

const before = `        {/* Trilha de progresso */}\n        <View style={styles.trailRow}>\n          <View style={styles.trailBadge}>\n            <Text style={styles.trailBadgeText}>{tr("Passo")} {stepCount}</Text>\n          </View>\n          {/* ⚠️ A TRILHA MOSTRA DE ONDE SE VEIO, NÃO ONDE SE ESTÁ.\n              Ela mostrava \`trail[último]\`, que é o título do nó ATUAL — o mesmo\n              texto do card logo abaixo. A pergunta aparecia duas vezes na mesma\n              tela, e no primeiro passo a trilha não tinha o que dizer de novo. */}\n          {trail.length > 1 ? (\n            <Text style={styles.trailText} numberOfLines={1}>\n              {tr(trail[trail.length - 2])}\n            </Text>\n          ) : null}\n        </View>`;

const after = `        {/* Trilha de progresso — somente no legado. Na UI v2, o Header já\n            mostra a etapa atual; repetir \"Passo N\" e o título anterior no corpo\n            criava duas hierarquias de navegação para a mesma informação. */}\n        {!emV2 ? (\n          <View style={styles.trailRow}>\n            <View style={styles.trailBadge}>\n              <Text style={styles.trailBadgeText}>{tr("Passo")} {stepCount}</Text>\n            </View>\n            {/* ⚠️ A TRILHA MOSTRA DE ONDE SE VEIO, NÃO ONDE SE ESTÁ. */}\n            {trail.length > 1 ? (\n              <Text style={styles.trailText} numberOfLines={1}>\n                {tr(trail[trail.length - 2])}\n              </Text>\n            ) : null}\n          </View>\n        ) : null}`;

const count = src.split(before).length - 1;
if (count !== 1) {
  console.error(`FAIL: expected exactly 1 progress-trail anchor, found ${count}`);
  process.exit(1);
}

src = src.replace(before, after);
fs.writeFileSync(file, src);
console.log("OK: UI v2 duplicated progress trail removed; legacy preserved.");
