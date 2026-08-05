/**
 * Mapa de cobertura do caminho guiado ("Não sei dizer — me guie pelos sinais").
 *
 * O autor do app percebeu, usando, que o abdome agudo tinha "estável/instável"
 * e não tinha o guiado — e suspeitou que faltasse em todos. Suspeita boa merece
 * medição, não palpite: este script varre TODAS as árvores, encontra as decisões
 * que perguntam por estabilidade ou gravidade, e marca quais oferecem o caminho
 * guiado.
 *
 * Ele NÃO falha o build. É um mapa, não uma trava: nem toda decisão de gravidade
 * se decompõe em observações de beira de leito ("Largura do QRS" precisa de um
 * ECG na tela, não de perguntas), e forçar o guiado onde ele não cabe produziria
 * um passo inútil no meio de uma emergência. O que este script garante é que a
 * lista de pendências seja VISÍVEL, em vez de depender de alguém reparar.
 *
 *   node scripts/mapa-fluxo-guiado.cjs .
 */
const fs=require("fs"),os=require("os"),path=require("path"),{execFileSync}=require("child_process");
const app=path.resolve(process.argv[2] || path.join(__dirname, ".."));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"mapa-"));
const arqs=fs.readdirSync(app).filter(f=>/-(decision-)?tree\.ts$/.test(f)).sort();
execFileSync("npx",["tsc","--module","commonjs","--target","es2020","--resolveJsonModule","--esModuleInterop",
  "--moduleResolution","node","--skipLibCheck","--outDir",tmp,...arqs.map(f=>path.join(app,f))],
  {cwd:app,stdio:["ignore","ignore","inherit"]});

const ESTAB=/instabil|instável|instavel|est[áa]vel|gravidade|grave\b|crítico|critico|choque/i;
const linhas=[];
for(const f of arqs){
  const out=path.join(tmp,f.replace(/\.ts$/,".js"));
  if(!fs.existsSync(out))continue;
  let mod; try{mod=require(out);}catch{continue;}
  for(const arv of Object.values(mod).filter(v=>v&&v.nodes&&v.entryNodeId)){
    for(const no of Object.values(arv.nodes)){
      if(no.type!=="decision")continue;
      const txt=[no.title,no.question,no.summary].filter(Boolean).join(" ");
      if(!ESTAB.test(txt))continue;
      const rot=(no.options||[]).map(o=>o.label).join(" | ");
      const guiado=/não sei|nao sei|me guie|não tenho certeza/i.test(rot);
      linhas.push({mod:f.replace(/\.ts$/,""),no:no.id,guiado,titulo:(no.title||"").slice(0,52),opcoes:(no.options||[]).length});
    }
  }
}
linhas.sort((a,b)=>(a.guiado-b.guiado)||a.mod.localeCompare(b.mod));
const sem=linhas.filter(l=>!l.guiado);
console.log(`Decisões de estabilidade/gravidade: ${linhas.length} · COM guiado: ${linhas.length-sem.length} · SEM: ${sem.length}\n`);
for(const l of linhas) console.log(`${l.guiado?"✅":"❌"} ${l.mod.padEnd(28)} ${l.no.padEnd(24)} ${l.titulo}`);
fs.rmSync(tmp,{recursive:true,force:true});
