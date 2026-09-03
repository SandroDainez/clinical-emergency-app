#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const fail = (message) => {
  console.error(`❌ Drug KB apresentações BR: ${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const alteplase = read("lib/drug-knowledge/alteplase.ts");

for (const mg of [10, 20, 50]) {
  expect(
    alteplase.includes(`Actilyse ${mg} mg — pó liofilizado + ${mg} mL de diluente`),
    `apresentação brasileira Actilyse ${mg} mg/${mg} mL ausente`
  );
}

const concentrationCount = (alteplase.match(/concentration: "1 mg\/mL após reconstituição"/g) || []).length;
expect(concentrationCount === 3, `esperadas 3 apresentações de alteplase a 1 mg/mL; encontradas ${concentrationCount}`);

const sourceCount = (alteplase.match(/ANVISA\/CMED — lista oficial de apresentações comercializadas no Brasil/g) || []).length;
expect(sourceCount === 3, `as 3 apresentações de alteplase precisam manter proveniência ANVISA/CMED; encontradas ${sourceCount}`);

expect(
  alteplase.includes('reviewedAt: "2026-09-03"'),
  "data de revisão das apresentações brasileiras de alteplase não está registrada"
);

console.log("✅ Drug KB apresentações BR: Actilyse 10/20/50 mg com diluentes correspondentes e proveniência ANVISA/CMED protegidos.");
