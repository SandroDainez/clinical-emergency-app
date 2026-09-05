const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '..', 'sedation-engine.ts');
let src = fs.readFileSync(file, 'utf8');

const oldText = `  const teto = declarados.length ? Math.max(...declarados) * 1.5 : padrao * 4;\n\n  // O passo acompanha a ordem de grandeza: dose de 0,05 mg/kg/h precisa de\n  // 0,01; dose de 75 mcg/h com passo 0,01 exigiria centenas de toques.\n  const passo = teto <= 1 ? 0.01 : teto <= 10 ? 0.05 : teto <= 100 ? 1 : 5;\n\n  // O mínimo nunca é zero numa infusão em curso: zero é \"desligado\", e quem\n  // arrasta até lá sem querer não percebe. Começa num passo.\n  return { min: passo, max: Number(teto.toFixed(2)), passo };`;

const newText = `  const teto = declarados.length ? Math.max(...declarados) * 1.5 : padrao * 4;\n\n  // O passo acompanha a ordem de grandeza: dose de 0,05 mg/kg/h precisa de\n  // 0,01; dose de 75 mcg/h com passo 0,01 exigiria centenas de toques.\n  const passo = teto <= 1 ? 0.01 : teto <= 10 ? 0.05 : teto <= 100 ? 1 : 5;\n\n  // O mínimo nunca é zero numa infusão em curso: zero é \"desligado\", e quem\n  // arrasta até lá sem querer não percebe. Começa num passo.\n  //\n  // O máximo também precisa cair EXATAMENTE na grade ancorada nesse mínimo.\n  // Arredondar apenas \"teto\" deixava combinações como 5→100,05 passo 5 e\n  // 0,05→1,11 passo 0,05: o botão + nunca alcançava o topo. Como o teto da\n  // barra é apenas alcance de UI (não limiar clínico), arredondamos para CIMA\n  // até o próximo ponto válido da mesma grade, preservando pelo menos o alcance\n  // derivado sem alterar nenhuma faixa clínica/colorida.\n  const casas = passo < 0.1 ? 2 : passo < 1 ? 1 : 0;\n  const degraus = Math.max(0, Math.ceil(((teto - passo) / passo) - 1e-9));\n  const max = Number((passo + degraus * passo).toFixed(casas));\n  return { min: passo, max, passo };`;

if (!src.includes(oldText)) throw new Error('faixaDaBarra esperada não encontrada; abortando.');
src = src.replace(oldText, newText);
fs.writeFileSync(file, src);
console.log('Sedoanalgesia: teto do NumericStepper alinhado à grade min/passo.');
