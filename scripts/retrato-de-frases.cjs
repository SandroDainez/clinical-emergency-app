const fs=require("fs"), os=require("os"), path=require("path");
const {execFileSync}=require("child_process");
const app="/Users/sandrodainez/Documents/clinical-emergency-app"; process.chdir(app);
const {textosDoNo}=require(path.join(app,"scripts/lib/textos-do-no.cjs"));
const arqs=fs.readdirSync(app).filter(f=>/-decision-tree\.ts$/.test(f)).sort();
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"ret-"));
try{execFileSync("npx",["tsc","--module","commonjs","--target","es2020","--esModuleInterop","--moduleResolution","node","--skipLibCheck","--outDir",tmp,...arqs.map(f=>path.join(app,f))],{cwd:app,stdio:"pipe"});}catch{}
const visivel=(n)=>{const ev=(n.evidence??[]); const{evidence,...r}=n; const base=textosDoNo(r); return (ev.length<=2? base.concat(textosDoNo(ev)) : base).join("\n");};
const frases=(t)=>t.split(/(?<=[.:!?])\s+|\n+/).map(s=>s.trim()).filter(s=>s.length>28);
const out={nos:{}, frases:{}};
for(const f of arqs){
  const p=path.join(tmp,f.replace(/\.ts$/,".js")); if(!fs.existsSync(p))continue;
  const m=require(p); const arv=Object.values(m).find(v=>v&&v.nodes); if(!arv)continue;
  const mod=f.replace("-decision-tree.ts","");
  for(const[id,n] of Object.entries(arv.nodes)){
    const t=visivel(n);
    out.nos[mod+"/"+id]=t.length;
    for(const fr of frases(t)) (out.frases[fr]??=[]).push(mod+"/"+id);
  }
}
fs.writeFileSync(process.argv[2], JSON.stringify(out));
const n=Object.keys(out.nos).length, ch=Object.values(out.nos).reduce((a,b)=>a+b,0);
console.log(`retrato: ${n} nós · ${ch} ch · ${Object.keys(out.frases).length} frases distintas`);
