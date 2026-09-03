#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const replacements = [
  {
    file: "shock-decision-tree.ts",
    from: "⏱ CERCA DE 80% DOS CHOQUES CARDIOGÊNICOS TÊM SÍNDROME CORONARIANA AGUDA POR TRÁS — faça o ECG em até 10 minutos, antes mesmo de fechar o subtipo. E se o subtipo não estiver claro, siga em 'Não definido' e reavalie com o ecocardiograma.",
    to: "⚠️ CHOQUE CARDIOGÊNICO NÃO É SINÔNIMO DE IAM. Síndrome coronariana aguda continua sendo causa crítica e tempo-dependente, mas insuficiência cardíaca aguda/descompensada, arritmias e complicações mecânicas também representam parcela importante dos casos contemporâneos. Faça ECG precocemente e use ecocardiografia para definir o fenótipo; se o subtipo não estiver claro, siga em 'Não definido' e reavalie.",
  },
  {
    file: "shock-decision-tree.ts",
    from: "Cerca de 80% dos choques cardiogênicos têm alguma forma de síndrome coronariana aguda por trás: fazer ECG em até 10 minutos.",
    to: "Síndrome coronariana aguda é uma causa crítica e tempo-dependente de choque cardiogênico, mas não representa todo o espectro contemporâneo. Obter ECG precocemente e investigar isquemia/reperfusão sem atrasar a definição hemodinâmica do choque.",
  },
  {
    file: "shock-decision-tree.ts",
    from: "Descompensação aguda de insuficiência cardíaca crônica responde por até 30% dos casos.",
    to: "Choque cardiogênico não relacionado a IAM é substancial e vem ganhando importância, incluindo insuficiência cardíaca aguda/descompensada, valvopatias, miocardite, arritmias e outras causas de falência de bomba.",
  },
  {
    file: "lib/i18n/modules/choque.ts",
    from: "⏱ CERCA DE 80% DOS CHOQUES CARDIOGÊNICOS TÊM SÍNDROME CORONARIANA AGUDA POR TRÁS — faça o ECG em até 10 minutos, antes mesmo de fechar o subtipo. E se o subtipo não estiver claro, siga em 'Não definido' e reavalie com o ecocardiograma.",
    to: "⚠️ CHOQUE CARDIOGÊNICO NÃO É SINÔNIMO DE IAM. Síndrome coronariana aguda continua sendo causa crítica e tempo-dependente, mas insuficiência cardíaca aguda/descompensada, arritmias e complicações mecânicas também representam parcela importante dos casos contemporâneos. Faça ECG precocemente e use ecocardiografia para definir o fenótipo; se o subtipo não estiver claro, siga em 'Não definido' e reavalie.",
  },
  {
    file: "lib/i18n/modules/choque.ts",
    from: "⏱ CERCA DEL 80% DE LOS CHOQUES CARDIOGÉNICOS TIENEN SÍNDROME CORONARIO AGUDO DETRÁS — haga el ECG en hasta 10 minutos, antes incluso de cerrar el subtipo. Y si el subtipo no está claro, siga en 'No definido' y reevalúe con el ecocardiograma.",
    to: "⚠️ EL CHOQUE CARDIOGÉNICO NO ES SINÓNIMO DE INFARTO. El síndrome coronario agudo sigue siendo una causa crítica y tiempo-dependiente, pero la insuficiencia cardiaca aguda/descompensada, las arritmias y las complicaciones mecánicas también representan una parte importante de los casos contemporáneos. Obtenga un ECG precoz y use ecocardiografía para definir el fenotipo; si el subtipo no está claro, siga en 'No definido' y reevalúe.",
  },
  {
    file: "lib/i18n/modules/choque-einstein.ts",
    from: "Cerca de 80% dos choques cardiogênicos têm alguma forma de síndrome coronariana aguda por trás: fazer ECG em até 10 minutos.",
    to: "Síndrome coronariana aguda é uma causa crítica e tempo-dependente de choque cardiogênico, mas não representa todo o espectro contemporâneo. Obter ECG precocemente e investigar isquemia/reperfusão sem atrasar a definição hemodinâmica do choque.",
  },
  {
    file: "lib/i18n/modules/choque-einstein.ts",
    from: "Cerca del 80% de los choques cardiogénicos tienen detrás alguna forma de síndrome coronario agudo: realizar ECG en un máximo de 10 minutos.",
    to: "El síndrome coronario agudo es una causa crítica y tiempo-dependiente de choque cardiogénico, pero no representa todo el espectro contemporáneo. Obtenga un ECG precoz e investigue isquemia/reperfusión sin retrasar la definición hemodinámica del choque.",
  },
  {
    file: "lib/i18n/modules/choque-einstein.ts",
    from: "Descompensação aguda de insuficiência cardíaca crônica responde por até 30% dos casos.",
    to: "Choque cardiogênico não relacionado a IAM é substancial e vem ganhando importância, incluindo insuficiência cardíaca aguda/descompensada, valvopatias, miocardite, arritmias e outras causas de falência de bomba.",
  },
  {
    file: "lib/i18n/modules/choque-einstein.ts",
    from: "La descompensación aguda de insuficiencia cardíaca crónica explica hasta el 30% de los casos.",
    to: "El choque cardiogénico no relacionado con infarto es sustancial y gana importancia, incluyendo insuficiencia cardiaca aguda/descompensada, valvulopatías, miocarditis, arritmias y otras causas de fallo de bomba.",
  },
];

const touched = new Set();
for (const { file, from, to } of replacements) {
  const abs = path.join(root, file);
  let text = fs.readFileSync(abs, "utf8");
  if (!text.includes(from)) continue;
  text = text.replace(from, to);
  fs.writeFileSync(abs, text);
  touched.add(file);
}

if (!touched.has("shock-decision-tree.ts")) {
  console.error("❌ Nenhuma substituição clínica foi aplicada em shock-decision-tree.ts; reauditar texto atual.");
  process.exit(1);
}

console.log(`✅ Choque cardiogênico: etiologia contemporânea ajustada em ${[...touched].join(", ")}.`);
