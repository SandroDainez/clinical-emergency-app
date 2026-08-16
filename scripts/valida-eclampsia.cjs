#!/usr/bin/env node
/**
 * PROMETE
 *   Que os DOIS relógios existam com marcos diferentes e digam O QUE MEDEM;
 *   que a vigilância ATRAVESSE o parto — conferido caminhando até o pós-parto
 *   e lendo o prazo lá; que a tríade continue separando SUSPENDER de
 *   ANTIDOTAR; que os limiares de suspensão e as concentrações tóxicas não
 *   sumam; e que a meta pressórica venha com o teto dos 20%.
 *
 * NÃO PROMETE
 *   Que os relógios sejam MODULARES. O runtime conta do MARCO, não do último
 *   ciclo cumprido: aos 90 min o relógio diz "ultrapassado", não "faltam 30
 *   para a próxima". Ele diz que a checagem está DEVIDA — não quantas foram
 *   feitas —, porque o app não tem evento de "checagem cumprida" para rearmar.
 *   Limitação declarada na árvore, não disfarçada.
 *
 * UNIVERSO
 *   A árvore da eclâmpsia compilada e executada sobre o runtime de decisão.
 *
 * ── OS DEFEITOS QUE ORIGINARAM ──────────────────────────────────────────────
 *
 * 1. D-16 COM O OBJETO ERRADO. A dívida dizia "gluconato a cada 15 min é
 *    antídoto de toxicidade do magnésio" — e o gluconato tem relógio de
 *    REPIQUE, que ninguém esquece porque está tratando. O que se perde é a
 *    VIGILÂNCIA DE 24 HORAS, e é ela que decide se a toxicidade aparece antes
 *    ou depois da parada respiratória. A dívida mal formulada apontou o
 *    instrumento para o lugar errado, e o erro sobreviveu três fases.
 *
 * 2. A VIGILÂNCIA SÓ EXISTIA NO NÓ DE SEGURANÇA. O cronograma (20 min na 1ª
 *    hora, depois de hora em hora, por 24 h) estava em `mg_seguranca` — antes
 *    do parto no fluxo. Quem avançava para o parto e o pós-parto deixava de
 *    vê-lo, e é justamente no pós-parto que ele é esquecido.
 *
 * 3. UM RELÓGIO SEM RÓTULO É ALARME GENÉRICO. "Próxima checagem da tríade" e
 *    "próxima dose" são coisas diferentes; alarme que não diz o que mede é
 *    silenciado.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-ecl-"));
let Engine = null;
let arvore = null;
try {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      path.join(appDir, "core/decision-tree/engine.ts"),
      path.join(appDir, "eclampsia-decision-tree.ts"),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  ({ DecisionTreeEngine: Engine } = require(path.join(tempDir, "core/decision-tree/engine.js")));
  arvore = require(path.join(tempDir, "eclampsia-decision-tree.js")).eclampsiaDecisionTree;
} catch (erro) {
  falhas.push(`a árvore da eclâmpsia não compilou — as conferências NÃO RODARAM: ${String(erro).slice(0, 200)}`);
}

/**
 * ⚠️ TÍTULO, RESUMO E PERGUNTA ENTRAM — e a primeira versão desta trava provou
 * por quê: ela acusou "a meta pressórica sumiu" e "PE não é indicação de
 * cesárea sumiu", e as duas estavam no `summary` do nó. Texto de tela é texto
 * de tela, e ler só `actions` é definir universo pela ESTRUTURA em vez do que
 * o usuário lê (R-59, aplicado aqui mesmo).
 */
/**
 * ⚠️ TODO o texto do nó — via helper canônico, não por lista de campos.
 *
 * A versão anterior listava campos à mão e ficava cega para os demais. Seis
 * vezes numa sessão isso produziu conclusão errada, a pior delas declarando
 * "beco sem conteúdo" um nó cuja conduta vivia em `exitCriteria` e `targets`.
 * O helper deriva do objeto: campo novo entra sozinho (R-73, D-15).
 */
const { textosDoNo } = require("./lib/textos-do-no.cjs");

const textosDe = (id) => textosDoNo(arvore?.nodes?.[id]);

// ── A. OS DOIS RELÓGIOS, POR EXECUÇÃO ────────────────────────────────────
{
  if (!Engine || !arvore) {
    falhas.push("sem motor ou árvore — a conferência de relógio não rodou.");
  } else {
    const comRelogio = (sulfatacaoMin, ultimaDoseMin) => {
      const e = new Engine(arvore);
      e.setValue("tempoDeSulfatacao", String(sulfatacaoMin));
      if (ultimaDoseMin !== undefined) e.setValue("tempoDaUltimaDose", String(ultimaDoseMin));
      return e;
    };

    // Os dois marcos são DIFERENTES — se fossem o mesmo, a dose e a vigilância
    // andariam juntas, e elas não andam.
    const marcos = arvore.marcos ?? {};
    if (marcos.tempoDeSulfatacao !== "inicioDoEvento" || marcos.tempoDaUltimaDose !== "ultimaDose") {
      falhas.push(
        "os dois marcos deixaram de ser distintos. A VIGILÂNCIA conta da instalação da sulfatação " +
        "(inicioDoEvento) e a DOSE conta da última administrada (ultimaDose). Unificá-los faz o relógio " +
        "de olhar e o de dar virarem um só — e o que se perde é o de olhar."
      );
    } else ok++;

    {
      const e = comRelogio(30, 0);
      e.goToNode("mg_seguranca");
      const ps = e.getPrazos();
      const vig = ps.find((p) => p.id === "vigilanciaMg");
      const dose = ps.find((p) => p.id === "doseMg");

      if (!vig) falhas.push("`mg_seguranca` não tem o relógio de VIGILÂNCIA — é o nó da tríade.");
      else {
        if (vig.decorridoMin !== 30) {
          falhas.push(`vigilância: 30 min informados, ${vig.decorridoMin} decorridos — o marco não é o da sulfatação.`);
        } else ok++;
        if (vig.vencido !== true) {
          falhas.push("vigilância: com 30 min de sulfatação, a checagem de 20 min já deveria ter vencido.");
        } else ok++;
      }

      if (!dose) {
        falhas.push("`mg_seguranca` não tem o relógio de DOSE — o repique do Pritchard é 4/4 h.");
      } else if (dose.decorridoMin !== 0) {
        falhas.push(
          `dose: última dose informada como "agora", ${dose.decorridoMin} decorridos — os dois relógios ` +
          `estão lendo o MESMO marco, e é isso que a separação existe para impedir.`
        );
      } else ok++;
    }

    // ⚠️ A VIGILÂNCIA ATRAVESSA O PARTO — a conferência que a D-16 pedia sem
    // saber que pedia. Caminha até o pós-parto e lê o prazo LÁ.
    {
      const e = comRelogio(45, 10);
      for (const no of ["parto_acao", "pos_parto"]) {
        e.goToNode(no);
        const vig = e.getPrazos().find((p) => p.id === "vigilanciaMg");
        if (!vig) {
          falhas.push(
            `\`${no}\`: a vigilância do magnésio SUMIU. As 24 h atravessam o parto — um relógio que só ` +
            `existe no nó de segurança desaparece justamente quando é mais esquecido.`
          );
        } else if (vig.decorridoMin !== 45) {
          falhas.push(
            `\`${no}\`: a contagem reiniciou (${vig.decorridoMin} em vez de 45). O marco é de SESSÃO e tem ` +
            `de sobreviver ao avanço de nó.`
          );
        } else ok++;
      }
      if (!e.temMarco("inicioDoEvento")) {
        falhas.push("o marco da sulfatação não sobreviveu à travessia até o pós-parto.");
      } else ok++;
    }

    // ⚠️ O RÓTULO: cada relógio diz O QUE MEDE — E NOS DOIS ESTADOS.
    //
    // A primeira versão desta conferência lia UM texto só, com 30 min no
    // relógio: aí ele já está VENCIDO e o runtime devolve o
    // `aoUltrapassarTexto`. Mutar o `aoVencer` não derrubava a trava — ela
    // estava cega para metade do que a tela mostra.
    //
    // São dois textos porque são dois momentos, e o médico lê um OU outro: às
    // 18 h de sulfatação ele vê o de ultrapassagem, e é justamente aí que o
    // rótulo importa mais. Por isso as duas leituras entram, com dois cenários.
    {
      const cedo = comRelogio(10, 0);   // ainda não venceu → aoVencer
      cedo.goToNode("mg_seguranca");
      const tarde = comRelogio(30, 0);  // já ultrapassou → aoUltrapassarTexto
      tarde.goToNode("mg_seguranca");
      const textos = {
        "antes de vencer": cedo.getPrazos().find((p) => p.id === "vigilanciaMg")?.texto ?? "",
        "depois de ultrapassar": tarde.getPrazos().find((p) => p.id === "vigilanciaMg")?.texto ?? "",
      };
      const e = tarde;
      const dose = e.getPrazos().find((p) => p.id === "doseMg");

      // ⚠️ CADA TEXTO É CONFERIDO SOZINHO — e a versão anterior desta trava
      // concatenava os dois e perguntava se o rótulo aparecia em ALGUM. Aí
      // apagar o rótulo de um passava, porque o outro o tinha. Concatenar
      // universos e exigir "pelo menos um" é o mesmo erro de medir a menção em
      // vez do efeito: o médico lê UM dos dois, não a soma.
      for (const [estado, texto] of Object.entries(textos)) {
        if (!texto) {
          falhas.push(`o relógio de vigilância não devolve texto ${estado} — conferência de rótulo sobre o vazio.`);
          continue;
        }
        ok++;
        if (!/CHECAGEM DA TRÍADE/.test(texto)) {
          falhas.push(
            `o relógio de vigilância não diz que é CHECAGEM DA TRÍADE ${estado}. Relógio sem rótulo vira ` +
            `alarme genérico, e alarme genérico é silenciado — e às 18 h de sulfatação o médico lê ` +
            `justamente o texto de ultrapassagem.`
          );
        } else ok++;
        if (!/para OLHAR, não para dar cálcio/.test(texto) && !/É para OLHAR, não para dar cálcio/.test(texto)) {
          falhas.push(
            `sumiu a distinção entre OLHAR e DAR ${estado}. O que se faz a cada 20 min é examinar reflexo, ` +
            `FR e diurese — o gluconato é antídoto de toxicidade instalada, não rotina.`
          );
        } else ok++;
      }

      if (!/PRÓXIMA DOSE DE MANUTENÇÃO/.test(dose?.texto ?? "")) {
        falhas.push("o relógio de dose não diz que é DOSE — é o outro lado do par que precisa de rótulo.");
      } else ok++;
      if (!/checar a tríade/.test(dose?.texto ?? "")) {
        falhas.push(
          "o relógio de dose não lembra de checar a tríade ANTES. A tríade é condição da manutenção, e " +
          "não etapa paralela."
        );
      } else ok++;
    }
  }
}

// ── B. SUSPENDER × ANTIDOTAR, e os limiares ──────────────────────────────
{
  const seg = textosDe("mg_seguranca").join("\n");
  for (const [nome, padrao, porque] of [
    ["a tríade antes de cada dose", /Tríade ANTES de cada dose/, "é a condição da manutenção"],
    ["o gatilho de SUSPENDER", /QUANDO SUSPENDER/, "tríade alterada manda parar e investigar"],
    ["o gatilho de ANTIDOTAR", /QUANDO DAR O ANTÍDOTO/, "toxicidade instalada — e não é o mesmo gatilho"],
    ["a FR ≥ 16", /FR ≥ 16/, "limiar de suspensão"],
    ["a diurese ≥ 25 mL/h", /diurese ≥ 25 mL\/h/, "o magnésio é excretado pelos rins"],
    ["as concentrações", /4–7 mEq\/L/, "terapêutica, perda do reflexo e parada respiratória em faixas diferentes"],
    ["o risco de parada respiratória", /PARADA RESPIRATÓRIA/, "é o desfecho que a vigilância existe para evitar"],
    ["o antídoto com dose", /gluconato de cálcio 1 g IV/, "R-48: mandar dar sem dizer quanto"],
    ["que o antídoto não encerra o caso", /NÃO encerra o caso/, "o magnésio continua no organismo e o cálcio tem ação curta"],
    ["o kit à beira do leito", /Kit conferido e lacrado/, "antídoto que está na farmácia não é antídoto"],
    ["o cronograma de 24 h", /de hora em hora por 24 h/, "é o que o relógio passou a lembrar"],
  ]) {
    if (!padrao.test(seg)) falhas.push(`segurança do MgSO₄: ${nome} sumiu — ${porque}.`);
    else ok++;
  }
}

// ── C. Anti-hipertensivo: meta e o teto dos 20% ──────────────────────────
{
  const anti = textosDe("anti_has").join("\n");
  for (const [nome, padrao, porque] of [
    ["a meta pressórica", /140–150/, "a meta não é normalizar"],
    ["o teto de queda de 20%", /NÃO reduzir a PA em mais de 20%/, "queda abrupta compromete a perfusão placentária"],
    ["a hidralazina como 1ª linha no Brasil", /HIDRALAZINA \(1ª linha no Brasil\)/, "é a que existe aqui"],
    ["a ausência de labetalol IV no Brasil", /Sem IV no Brasil/, "prescrever o que não existe é pior que não prescrever"],
    ["a proibição da nifedipina sublingual", /NÃO usar via sublingual/, "hipotensão abrupta"],
    ["o que evitar", /IECA\/BRA \(fetotóxicos\)/, "a lista de proibidos é parte da conduta"],
  ]) {
    if (!padrao.test(anti)) falhas.push(`anti-hipertensivo: ${nome} sumiu — ${porque}.`);
    else ok++;
  }
}

// ── D. Parto e pós-parto ─────────────────────────────────────────────────
{
  const parto = textosDe("parto_timing").join("\n") + "\n" + textosDe("parto_acao").join("\n");
  for (const [nome, padrao] of [
    ["que PE não é indicação de cesárea", /NÃO é indicação de cesárea/],
    ["os 30 min pós-convulsão", /mín 30 min pós-convulsão/],
    ["as 4 h de MgSO₄ para neuroproteção < 32 sem", /aguardar pelo menos 4 h/],
    ["o MgSO₄ mantido no parto e por 24 h", /durante o trabalho de parto e por 24 h/],
  ]) {
    if (!padrao.test(parto)) falhas.push(`parto: ${nome} sumiu.`);
    else ok++;
  }

  const pos = textosDe("pos_parto").join("\n");
  for (const [nome, padrao, porque] of [
    ["as 24 h de MgSO₄ pós-parto", /24 h após o parto ou após a última convulsão/, "é a janela que o relógio acompanha"],
    // ⚠️ EXPECTATIVA DATADA CORRIGIDA (R-44) — e a trava era MINHA, de uma hora
    // antes. Ela exigia "até 48 h", que é a leitura ERRADA: as 48 h separam a
    // eclâmpsia pós-parto PRECOCE da TARDIA, e não marcam o fim do risco.
    // Fonte: "Late postpartum eclampsia can be distinguished from early onset
    // postpartum eclampsia by an onset later than 48 hours after term";
    // relatos até 23 dias e um caso com 8 semanas; pré-eclâmpsia pós-parto
    // considerada de 48 h a 6 semanas. Trava que codifica a leitura errada
    // impede a correção — foi exatamente o que aconteceu aqui.
    ["as 48 h como fronteira, não como fim do risco", /48 h NÃO SÃO O FIM DO RISCO/, "a eclâmpsia pós-parto tardia existe"],
    ["a investigação DUPLA além das 48 h", /as duas juntas, não uma no lugar da outra/, "trombose de seio venoso E eclâmpsia tardia"],
    ["o cálcio universal no Brasil", /CÁLCIO É UNIVERSAL NO BRASIL/, "não é condicionado a comprovar baixa ingestão"],
    ["o AAS até 16 semanas à noite", /ATÉ 16 semanas/, "o momento de iniciar é o que decide o efeito"],
  ]) {
    if (!padrao.test(pos)) falhas.push(`pós-parto: ${nome} sumiu — ${porque}.`);
    else ok++;
  }
}

console.log("\nEclâmpsia — dois relógios com rótulo, a vigilância que atravessa o parto e a tríade como condição\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — vigilância e dose separadas, contagem provada até o pós-parto\n`);
process.exit(0);
