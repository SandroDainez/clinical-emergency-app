/**
 * Consistência dos fatos clínicos que aparecem em MAIS DE UM lugar.
 *
 * ── POR QUE ESTE SCRIPT EXISTE ───────────────────────────────────────────────
 *
 * O mesmo fato clínico costuma ser escrito em vários módulos: o gatilho para
 * associar vasopressina aparece na calculadora de drogas vasoativas, na tabela
 * de associações, no motor da sepse e no texto de ajuda de um campo. Cada cópia
 * foi escrita numa data diferente, e elas divergiram — foi o que o autor do app
 * viu ao encontrar "≥ 0,25", "0,25–0,5" e "0,4" e não saber qual valia.
 *
 * Divergência aqui não dá erro, não quebra teste e não aparece em revisão de
 * arquivo: só aparece para quem lê os dois módulos e percebe que dizem coisas
 * diferentes. Enquanto isso, um dos dois está errado.
 *
 * A varredura encontrou, além da divergência de números, um ERRO DE FATO: uma
 * linha afirmava "SSC 2021 forte" para a vasopressina. A recomendação da SSC
 * 2021 é FRACA (condicional), evidência moderada — "we suggest adding
 * vasopressin". Rotular como forte inverte o peso da diretriz.
 *
 * ── COMO FUNCIONA ────────────────────────────────────────────────────────────
 *
 * Cada FATO declara o que o assunto é (`assunto`) e o que toda frase sobre ele
 * precisa (`exige`) ou não pode ter (`proibe`). O script lê os literais de
 * string do código de produção e confere um a um.
 *
 * Além de `exige`/`proibe`, um fato pode trazer `verifica(frase)` — usada quando
 * o que importa não é a presença de um texto, mas o NÚMERO que acompanha um
 * fármaco específico. "Amiodarona 300 mg … mantenha epinefrina a cada 3–5 min"
 * cita epinefrina e contém "300 mg", e uma regra de presença cobraria "1 mg"
 * dessa frase. `verifica` extrai a dose ligada ao fármaco certo e compara.
 *
 * Uma exceção pode ser por TEXTO (`contem`) ou por ORIGEM (`arquivo`). A segunda
 * existe porque o mesmo fato muda de forma conforme onde é dito: uma fala de
 * áudio é emitida no instante em que a conduta já foi indicada, e ali a condição
 * já está satisfeita — a voz dizer "segunda dose, se necessário" no momento de
 * administrar seria pior do que não dizer nada.
 *
 * ESCOPO. Por padrão um fato é conferido FRASE a frase. Alguns não cabem nessa
 * granularidade: na árvore do TEP a dose de alteplase está num marcador e a
 * duração da RCP no marcador seguinte, e nenhuma frase sozinha tem os dois. Um
 * fato com `escopo: "arquivo"` é conferido sobre o conjunto dos literais do
 * arquivo — é o jeito de exigir que duas informações VIAJEM JUNTAS sem obrigar
 * que estejam na mesma linha.
 *
 * `excecoes` é parte do desenho, não remendo: um mesmo fármaco pode ter dose
 * diferente em indicação diferente, e nesse caso a diferença é correta e
 * precisa ficar declarada — com o motivo por escrito.
 *
 * Este script NÃO julga se o número está certo. Ele garante que o app diz a
 * MESMA coisa em todo lugar. Conferir o número contra a diretriz continua sendo
 * trabalho humano; o que deixa de existir é a divergência silenciosa.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");

/** Arquivos de produção — fora dicionários, testes e scripts. */
function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|lib\/i18n|e2e|scripts|auditoria|locales/.test(p)) {
        fontes(p, saida);
      }
    } else if (/\.tsx?$/.test(f.name)) {
      saida.push(p);
    }
  }
  return saida;
}

const FATOS = [
  {
    id: "gatilho-vasopressina",
    descricao: "gatilho de dose para associar vasopressina à noradrenalina",
    // Precisa falar da NORADRENALINA (ou dizer "a partir de"): a frase da dose
    // excepcional — "> 1–3 mcg/kg/min … adicionar vasopressina 0,03 U/min" —
    // cita vasopressina e mcg/kg/min, mas o número dela é de outro degrau. Sem
    // este recorte o script cobrava "0,25" de uma frase que fala de 1–3.
    assunto: (t) =>
      /vasopressina/i.test(t) &&
      /mcg\/kg\/min/i.test(t) &&
      /(associar|adjuvante|adicionar|a partir de|janela)/i.test(t) &&
      /(noradrenalina|norepinefrina|\bnora\b|\bNE\b|a partir de)/i.test(t),
    exige: [
      { re: /0,25/, porque: "o gatilho é 0,25 mcg/kg/min — início da faixa 0,25–0,5 (SSC 2021, texto de prática)" },
    ],
    proibe: [
      { re: /\b0,4\s*mcg/i, porque: "0,4 mcg/kg/min é limiar de protocolo institucional, sem lastro em diretriz" },
    ],
  },
  {
    id: "forca-da-recomendacao-vasopressina",
    descricao: "peso da recomendação da SSC para vasopressina",
    assunto: (t) => /vasopressina/i.test(t) && /SSC\s*20\d\d/i.test(t),
    proibe: [
      {
        re: /\bforte\b/i,
        porque:
          "a SSC 2021 SUGERE adicionar vasopressina — recomendação fraca/condicional, evidência moderada. " +
          "Chamar de forte inverte o peso da diretriz.",
      },
    ],
  },
  {
    id: "hidrocortisona-4h",
    descricao: "corticoide no choque séptico exige as 4 h, não só a dose",
    assunto: (t) => /hidrocortisona/i.test(t) && /0,25/.test(t),
    exige: [
      {
        re: /4\s*h/i,
        porque:
          "a SSC 2021 condiciona o corticoide a noradrenalina ou adrenalina ≥ 0,25 mcg/kg/min há PELO MENOS 4 h. " +
          "Sem as 4 h o gatilho vira 'dose alcançada', que é mais precoce e não é o da diretriz.",
      },
    ],
  },
  {
    id: "dose-de-manutencao-da-vasopressina",
    descricao: "vasopressina é dose fixa de 0,03 U/min",
    // O "UI" precisa entrar no ASSUNTO, não só na proibição: procurando apenas
    // "U/min", a frase escrita "UI/min" nunca era selecionada — e a regra que
    // proíbe "UI/min" ficava impossível de disparar. Regra que não pode falhar
    // não protege nada; só foi descoberta ao tentar quebrá-la de propósito.
    assunto: (t) => /vasopressina/i.test(t) && /\bU\.?I?\/min/i.test(t),
    exige: [{ re: /0,03/, porque: "a dose é fixa em 0,03 U/min (VASST/SSC), não titulada" }],
    proibe: [{ re: /\bUI\/min\b/, porque: "a unidade no app é U/min — 'UI/min' é a mesma coisa escrita diferente" }],
    excecoes: [
      {
        contem: "0,03–0,04",
        porque:
          "anafilaxia refratária à adrenalina usa 0,03–0,04 U/min. Indicação diferente, faixa " +
          "legitimamente diferente — declarada aqui para não virar divergência silenciosa.",
      },
    ],
  },
  {
    id: "preparo-da-solucao-1-10000",
    descricao: "toda menção a 1:10.000 ensina a preparar a partir da ampola nacional",
    /**
     * A ampola brasileira de adrenalina é 1 mg/1 mL — isto é 1:1.000. A seringa
     * pré-cheia de 10 mL a 1:10.000 é norte-americana e não circula aqui.
     *
     * O app dizia, na tela de farmacologia do ACLS, que a ampola SEM DILUIÇÃO
     * era 1:10.000. Nenhum cálculo tinha derivado dessa premissa — todos os
     * preparos do app ancoram corretamente em 1:1.000 —, mas ela é a premissa
     * que habilita o erro clássico de 10×: quem acredita que a ampola já é
     * 1:10.000 e diluir 1 mL em 9 mL obtém 100 mcg/mL onde esperava 10.
     *
     * Duas ocorrências existiam quando a regra nasceu. Ela existe para que a
     * TERCEIRA, que alguém escreverá, nasça com a instrução de preparo.
     */
    assunto: (t) => /1:\s?10\.?000/.test(t),
    exige: [
      {
        re: /9\s*mL|10\s*mL/i,
        porque:
          "aqui 1:10.000 não vem pronto: obtém-se diluindo 1 mL da ampola de 1:1.000 em 9 mL de SF " +
          "(10 mL a 0,1 mg/mL = 100 mcg/mL). Citar a concentração sem ensinar o preparo deixa a " +
          "conta por conta de quem está com a ampola errada na mão, sob pressão.",
      },
    ],
    proibe: [
      {
        re: /sem diluição[^.]{0,30}1:\s?10\.?000|1:\s?10\.?000[^.]{0,30}sem diluir/i,
        porque:
          "a ampola nacional SEM DILUIÇÃO é 1:1.000. Chamá-la de 1:10.000 é a premissa do erro de 10×.",
      },
    ],
  },
  {
    id: "apresentacao-multipla-declarada",
    descricao: "droga com mais de uma apresentação no Brasil declara todas (R-6)",
    /**
     * Mesmo espírito da regra acima, generalizado: o médico assume que o que
     * está na tela é o que está na mão dele.
     *
     * A atropina tem 0,25 e 0,5 mg/mL no Brasil, e a de 0,25 é a padronizada
     * pelo SUS — a mais provável no serviço público, e a que o app não
     * declarava. Quem aspirasse 2 mL da de 0,25 receberia 0,5 mg: metade da
     * dose, em bradicardia instável.
     *
     * A regra vigia por DROGA, com a lista das que já foram conferidas em bula.
     * Nome novo entra aqui depois da bula aberta (R-5), nunca por dedução.
     */
    assunto: (t) => /atropina/i.test(t) && /mg\s?\/\s?mL/i.test(t),
    exige: [
      {
        re: /0,25/,
        porque:
          "a atropina tem DUAS apresentações no Brasil (0,25 e 0,5 mg/mL, ampola 1 mL) e a de " +
          "0,25 mg/mL é a padronizada pelo Ministério da Saúde (CBAF). Declarar só a de 0,5 faz " +
          "o leitor assumir 2 mL para 1 mg — com a ampola do SUS, 2 mL são meia dose.",
      },
    ],
  },
  {
    id: "dose-de-adrenalina-na-pcr",
    descricao: "adrenalina na parada é 1 mg IV/IO",
    assunto: (t) =>
      /(adrenalina|epinefrina)/i.test(t) &&
      /\bIV\b|\bIO\b/i.test(t) &&
      /\bmg\b/i.test(t) &&
      /(PCR|parada|RCP|ACLS|assistolia|AESP|FV\/TV|fibrilação ventricular)/i.test(t) &&
      !/\bIM\b/i.test(t),
    // Extrai a dose ATRELADA à adrenalina, não qualquer "mg" da frase.
    verifica: (t) => {
      const m = t.match(/(adrenalina|epinefrina)[^.;·]{0,25}?(\d+(?:[,.]\d+)?)\s*mg/i);
      if (!m) return null; // cita a adrenalina sem dose própria — nada a conferir
      if (m[2].replace(",", ".") !== "1") {
        return `dose de adrenalina "${m[2]} mg" — na parada é 1 mg IV/IO (ACLS). Fora da parada, a adrenalina tem outras doses e outra via.`;
      }
      return null;
    },
  },
  {
    id: "intervalo-de-adrenalina-na-pcr",
    descricao: "adrenalina na parada se repete a cada 3–5 min",
    // O IM fica de fora: na anafilaxia a repetição é a cada 5–15 min, outra
    // indicação e outro intervalo — não é divergência, é outro fármaco em outro
    // papel.
    assunto: (t) =>
      /(adrenalina|epinefrina)/i.test(t) &&
      /(a cada|repetir|cada)\s*\d/i.test(t) &&
      /min/i.test(t) &&
      !/\bIM\b/i.test(t),
    verifica: (t) => {
      const m = t.match(/(?:a cada|cada|repetir[^\d]{0,12})\s*(\d+)\s*[–-]\s*(\d+)\s*min/i);
      if (!m) return null;
      if (m[1] !== "3" || m[2] !== "5") {
        return `intervalo "${m[1]}–${m[2]} min" — na parada a adrenalina se repete a cada 3–5 min (ACLS).`;
      }
      return null;
    },
  },
  {
    id: "alteplase-no-avc",
    descricao: "alteplase no AVC isquêmico: 0,9 mg/kg, máx 90 mg",
    // Só o AVC. No TEP as doses são outras e corretas (100 mg em 2 h, 50 mg em
    // bólus na PCR, 1–2 mg/h cateter-dirigida) — indicações diferentes.
    assunto: (t) =>
      /alteplase|rt-?PA/i.test(t) &&
      /mg\/kg/i.test(t) &&
      !/\bTEP\b|pulmonar|cateter/i.test(t) &&
      !/\bnão usar\b|\bNÃO estabelece\b/i.test(t),
    // A dose precisa estar ATRELADA à alteplase. A frase da tenecteplase cita a
    // alteplase como alternativa ("AHA/ASA endossa alteplase OU tenecteplase") e
    // carrega o 0,25 mg/kg da TNK — uma regra de presença cobrava dela o 0,9 mg/kg
    // da alteplase, que não é a dose de que a frase fala.
    verifica: (t) => {
      const m = t.match(/(alteplase|rt-?PA)[^.;]{0,60}?(\d+(?:[,.]\d+)?)\s*mg\/kg/i);
      if (!m) return null;
      if (m[2] !== "0,9") {
        return `alteplase a "${m[2]} mg/kg" — no AVC isquêmico a dose é 0,9 mg/kg (AHA/ASA).`;
      }
      if (!/(máx|max)\.?\s*90/i.test(t)) {
        return "dose de alteplase sem o teto de 90 mg — omitir o teto permite ultrapassá-lo no paciente pesado.";
      }
      return null;
    },
  },
  {
    id: "tenecteplase-no-avc",
    descricao: "tenecteplase no AVC isquêmico: 0,25 mg/kg, máx 25 mg, bolus único",
    assunto: (t) => /tenecteplase|\bTNK\b/i.test(t) && /mg\/kg/i.test(t),
    verifica: (t) => {
      const m = t.match(/(tenecteplase|\bTNK\b)[^.;]{0,60}?(\d+(?:[,.]\d+)?)\s*mg\/kg/i);
      if (m && m[2] !== "0,25") {
        return `tenecteplase a "${m[2]} mg/kg" — no AVC isquêmico é 0,25 mg/kg.`;
      }
      if (!/(máx|max)\.?\s*25/i.test(t)) return "tenecteplase sem o teto de 25 mg.";
      if (!/bolus|bólus/i.test(t)) {
        return "tenecteplase sem dizer BOLUS ÚNICO — é o que a distingue da alteplase na prática, que exige bomba por 60 min.";
      }
      return null;
    },
  },
  {
    id: "alvo-de-pam-no-choque",
    descricao: "alvo inicial de PAM no choque é ≥ 65 mmHg",
    assunto: (t) =>
      /PAM\s*[≥>]=?\s*\d/i.test(t) &&
      // "norepinefrina" precisa estar aqui: o app usa os DOIS nomes do mesmo
      // fármaco, e a frase da árvore da sepse escreve "NOREPINEFRINA". Sem este
      // sinônimo, a linha que define o alvo de PAM da sepse ficava fora da
      // conferência — foi o que uma mutação (PAM ≥ 70) revelou ao passar ilesa.
      /(choque|sepse|séptic|vasopressor|noradrenalina|norepinefrina)/i.test(t),
    verifica: (t) => {
      const alvos = [...t.matchAll(/PAM\s*[≥>]=?\s*(\d+)/gi)].map((m) => m[1]);
      const fora = alvos.filter((n) => n !== "65");
      if (fora.length) {
        return `alvo de PAM "${fora.join(", ")}" — no choque o alvo inicial é ≥ 65 mmHg (SSC). Alvos maiores existem em outras indicações e precisam dizer qual.`;
      }
      return null;
    },
    excecoes: [
      {
        contem: "PAM ≥ 80",
        porque:
          "TCE grave / hipertensão intracraniana usa PAM ≥ 80 mmHg para sustentar a pressão de perfusão " +
          "cerebral. Indicação diferente, alvo legitimamente diferente.",
      },
    ],
  },
  {
    id: "segunda-dose-de-antiarritmico-e-condicional",
    descricao: "2ª dose no card de fármacos diz SE se aplica, não só quando",
    // Nasceu de um relato de leitura, não de um número errado: no card de
    // farmacologia a amiodarona trazia "2ª dose (se necessário)" e a lidocaína,
    // logo abaixo, trazia "2ª dose" seca — e ainda "Repetir a cada 5–10 min".
    // Lado a lado, a leitura era de que a lidocaína SEMPRE leva duas doses e
    // entra numa série. A AHA marca as duas igual: "second dose if required".
    //
    // O fluxo do ACLS já dizia certo ("a 2ª e última dose só será necessária SE
    // o ritmo permanecer em FV/TV"). O card é que destoava.
    // Basta ser um RÓTULO de linha de dose que diga "2ª dose" — o nome do
    // fármaco não precisa estar na mesma string, e em geral não está.
    assunto: (t, ctx) =>
      /2ª\s*dose|segunda dose/i.test(t) &&
      !/pós-ROSC|manutenção/i.test(t) &&
      (/(amiodarona|lidocaína)/i.test(t) ||
        // Rótulo de dose DENTRO do material do ACLS. Sem o recorte por arquivo,
        // a regra passou a cobrar a condição da "2ª dose (após 1–2 min)" de
        // adrenalina IM na anafilaxia — outro fármaco, outro protocolo, outra
        // pergunta. Lá a segunda dose também é condicional, mas por critérios
        // próprios; misturar as duas coisas é o começo de um alerta ruidoso.
        (/\blabel:\s*$/.test(ctx.prefixo) && /acls/i.test(ctx.arquivo))),
    exige: [
      {
        re: /se necessário|só se|somente se|se não|\bSE\b|última dose|se o ritmo|se a FV/i,
        porque:
          "a 2ª dose é condicional: na FV/TV depende de o ritmo persistir após o próximo choque; " +
          "na TSV, de o ritmo não converter. Rótulo que informa só o INTERVALO ('após 1–2 min') " +
          "diz quando, não se — e a linha passa a ser lida como etapa obrigatória.",
      },
    ],
    excecoes: [
      {
        arquivo: /acls\/(speech-map|canonical-audio-manifest)/,
        porque:
          "falas de áudio. Elas só tocam quando o motor JÁ decidiu que a 2ª dose está indicada — " +
          "a condição está satisfeita no instante em que a frase é dita. Uma voz que hesita " +
          "('segunda dose, se necessário') na hora de administrar atrapalha em vez de informar. " +
          "A condição pertence ao texto que se LÊ antes de decidir, não à fala que se OUVE ao executar.",
      },
    ],
  },
  {
    id: "alteplase-na-pcr-por-tep",
    descricao: "PCR por TEP: bólus de 50 mg e RCP de 60–90 min andam juntos",
    // Nasceu de um relato de uso: o app dizia que a AHA não estabelece dose e
    // parava aí. Verdadeiro e inútil na parada — serviço sem protocolo escrito é
    // a regra, e o vazio empurra para a improvisação. Passou a trazer o esquema
    // mais usado, ROTULADO como prática (ERC/séries), não como recomendação AHA.
    //
    // Vigiado porque agora aparece em DUAS telas (a árvore do TEP e o card de
    // causas reversíveis do ACLS), lidas em momentos diferentes da mesma parada.
    // Por ARQUIVO: na árvore do TEP a dose está num marcador e a duração da RCP
    // no seguinte. Conferido frase a frase, o fato só via a tela de causas
    // reversíveis (onde tudo cabe numa sentença) e deixava a árvore sem trava —
    // a duração podia sumir de lá sem nada falhar.
    escopo: "arquivo",
    assunto: (t) =>
      /alteplase/i.test(t) &&
      /\bTEP\b/i.test(t) &&
      /\bPCR\b|parada|\bRCP\b/i.test(t) &&
      /\bmg\b/i.test(t),
    exige: [
      {
        re: /50\s*mg/i,
        porque: "o esquema mais usado na PCR por TEP é 50 mg IV em bólus durante a RCP",
      },
      // A presença de "50 mg" no arquivo NÃO basta, e isso só apareceu ao mutar
      // a dose para 100 mg: o texto continha "repetir 50 mg" e "máximo 50 mg"
      // logo adiante, então a regra de presença passava com a dose errada
      // escrita no lugar principal. Quem confere é o `verifica` abaixo.
      {
        re: /60\s*[–-]\s*90\s*min/i,
        porque:
          "a dose sem a duração da RCP é meia instrução: encerrar a ressuscitação poucos minutos " +
          "após fibrinolisar desperdiça a droga que acabou de ser dada. As duas informações " +
          "precisam viajar juntas, em qualquer tela onde a dose apareça.",
      },
      {
        re: /não é dose chancelada pela AHA|não fixa esquema|NÃO estabelece dose|não é uma dose avalada/i,
        porque:
          "o esquema é prática consolidada (ERC e séries), NÃO recomendação da AHA. " +
          "Omitir o rótulo transforma um consenso de prática em diretriz — e quem lê não " +
          "tem como saber a diferença.",
      },
    ],
    verifica: (t) => {
      const m = t.match(/alteplase\s+(\d+(?:[,.]\d+)?)\s*mg\s+IV\s+em\s+B[ÓO]LUS/i);
      if (m && m[1] !== "50") {
        return `bólus de alteplase escrito como "${m[1]} mg" — na PCR por TEP o esquema descrito é 50 mg IV em bólus, repetindo 50 mg em 15–20 min. Os 100 mg pertencem ao regime de 2 h, que não se sustenta em parada.`;
      }
      return null;
    },
  },
  {
    id: "adenosina-tem-terceira-dose",
    descricao: "esquema da adenosina vai até a 3ª dose (6 → 12 → 12 mg)",
    // O autor do app suspeitou que a 3ª dose estivesse em um lugar e faltasse em
    // outro. Não estava faltando — mas a suspeita é o tipo de coisa que só se
    // responde uma vez se virar trava; senão a mesma dúvida volta a cada leitura.
    //
    // A 3ª dose é a que mais se perde ao copiar, porque o esquema "6 e depois
    // 12" já soa completo. Quem para no segundo bólus conclui que a adenosina
    // falhou quando ainda havia uma tentativa prevista em bula.
    escopo: "arquivo",
    assunto: (t) =>
      /adenosina/i.test(t) &&
      /\b6\s*mg\b/i.test(t) &&
      /\b12\s*mg\b/i.test(t),
    exige: [
      {
        // A alternativa "12 mg … 12 mg" estava aqui e tornava a regra IMPOSSÍVEL
        // de falhar: no escopo de arquivo, qualquer texto que cite 12 mg duas
        // vezes — e todos citam — a satisfazia. Tirar a 3ª dose de propósito
        // passava ileso nas duas superfícies.
        //
        // É a terceira regra desta sessão que nasce incapaz de disparar, e o
        // padrão é sempre o mesmo: a condição frouxa parece generosa e na
        // verdade desliga o verificador. Só aparece quebrando de propósito.
        // O marcador tem de ser EXPLÍCITO.
        re: /(3ª dose|terceira dose|segunda vez|repetid[oa] uma segunda)/i,
        porque:
          "o esquema tem TRÊS bólus: 6 mg, 12 mg e 12 mg de novo (o segundo 12 mg é previsto em bula). " +
          "Arquivo que mostra 6 e 12 e para aí ensina que a adenosina acabou — e ela não acabou.",
      },
    ],
    excecoes: [
      {
        contem: "enquanto prepara o cardioversor",
        porque:
          "no paciente INSTÁVEL a adenosina é uma tentativa única enquanto o cardioversor é montado, " +
          "e o texto diz explicitamente para não atrasar a cardioversão. Série de três bólus ali " +
          "seria o erro oposto: adiar o choque em quem já está instável.",
      },
    ],
  },
  {
    id: "volume-de-cristaloide-e-titulado",
    descricao: "volume de cristaloide vem com a ressalva de titular por comorbidade",
    // Duas correções nasceram desta linha, e as duas foram do autor do app.
    //
    // A primeira: eu ia escrever "20 mL/kg" como padrão do adulto. É a dose
    // PEDIÁTRICA — no adulto a referência é 1–2 L. Ele duvidou antes de eu
    // escrever, e o app já trazia os dois números certos num outro texto: eu
    // teria INTRODUZIDO o erro e a divergência de uma vez.
    //
    // A segunda: "reposição volêmica não pode ser generalizada, tem que
    // observar condições do paciente, comorbidades". Certo — 2 L corridos em
    // cardiopata ou renal crônico troca um problema por outro, e a anafilaxia
    // não protege ninguém de edema agudo. O app tinha essa ressalva em UM
    // lugar; agora ela viaja junto do número em todos.
    //
    // Nasceu na anafilaxia e já pegou a cetoacidose na primeira execução: o
    // "15–20 mL/kg na 1ª hora" também corria sem a ressalva. O fato vale para
    // qualquer módulo que prescreva volume — por isso o nome não cita módulo.
    assunto: (t) => /cristaloide|cristalóide|ringer|SF 0,9%/i.test(t) && /1\.000–2\.000 mL|20 mL\/kg/i.test(t),
    exige: [
      {
        re: /alíquot/i,
        porque: "o volume é titulado em alíquotas, não corrido de uma vez",
      },
      {
        // ICC, DRC e IRC entram: é como o app escreve em vários módulos, e uma
        // trava que só aceita a forma por extenso obrigaria a reescrever texto
        // correto — ou, pior, seria contornada removendo a ressalva.
        re: /cardiopat|disfunção renal|idoso|sobrecarga|\bICC\b|\bDRC\b|\bIRC\b/i,
        porque:
          "quem tem cardiopatia, disfunção renal ou é idoso descompensa com o volume que salva os outros. " +
          "O número sem a ressalva é meia instrução.",
      },
    ],
  },
  {
    id: "meta-de-pas-no-tce",
    descricao: "meta de PAS no TCE vem sempre com a estratificação da BTF",
    // Seis frases declaravam a meta em dois arquivos, e CINCO traziam só o 110
    // liso — inclusive três dentro do próprio módulo TCE. Uma única, no nó de
    // pressão arterial, tinha a estratificação por idade.
    //
    // Não dá para extrair isto para uma constante de código: são literais que
    // passam por `tr()`, e compor com template literal (`${...}`) tira a frase
    // da varredura de tradução — o usuário em espanhol veria português. Então o
    // que se compartilha é a REGRA, não a string: o texto fica repetido e este
    // fato garante que as seis digam a mesma coisa.
    //
    // Mesmo mecanismo que já mantém alinhados o gatilho da vasopressina, a dose
    // da alteplase e o volume de cristaloide.
    // Recortado por ARQUIVO, e isto é necessário: "PAS ≥ 110" também aparece
    // legitimamente no edema agudo de pulmão, como limiar para o vasodilatador
    // — nada a ver com a meta do TCE. Uma regra que cobrasse BTF de toda frase
    // com "PAS ≥ 110" acusaria o EAP, e verificador que acusa inocente é
    // desligado no primeiro aperto.
    assunto: (t, ctx) =>
      /PAS\s*≥\s*110/.test(t) && /(politrauma|tce)-decision-tree/.test(ctx.arquivo),
    exige: [
      {
        re: /BTF/,
        porque: "a meta do TCE é estratificada por idade (BTF) e o valor liso esconde isso",
      },
      {
        re: /≥\s*100 para 50–69/,
        porque:
          "a faixa dos 50–69 anos tem meta MENOR (≥ 100). Omiti-la faz o app cobrar 110 de quem " +
          "a diretriz não cobra — e some justamente a informação que a estratificação existe para dar.",
      },
    ],
  },
];

// Literais de string do código — aspas duplas, simples e template de uma linha.
//
/**
 * Leitor de literais de string — varredura com estado, não expressão regular.
 *
 * A primeira versão usava uma regex global de aspas, e ela tem um defeito que
 * só aparece quando o limite de tamanho baixa. Entre dois literais existe
 * TEXTO DE CÓDIGO — em `{ letter: "C", title: "Circulação", body: "Choque…" }`
 * o trecho `, title: ` tem 9 caracteres. Com limite 12 ele era curto demais
 * para casar; com limite 6 a regex passou a lê-lo COMO SE FOSSE um literal,
 * entre a aspa que fecha "C" e a que abre "Circulação". Isso inverte a paridade
 * das aspas dali para a frente, e a frase seguinte — a do ABCDE, com o alvo de
 * PAM — deixou de ser vista.
 *
 * O sintoma foi baixar o limite e a cobertura CAIR de 25 para 23 frases.
 * Afrouxar um filtro nunca deveria reduzir o que ele enxerga; quando reduz, o
 * filtro está lendo errado, não de menos.
 *
 * Este leitor caminha o arquivo mantendo estado: ao encontrar uma aspa, lê até
 * a aspa correspondente e retoma DEPOIS dela. A paridade deixa de ser adivinhada.
 * De quebra, ignora comentários — este arquivo cita frases clínicas entre aspas
 * na própria documentação, e elas seriam conferidas como se fossem do app.
 */
function literais(texto) {
  const achados = [];
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];

    if (c === "/" && texto[i + 1] === "/") {
      i = texto.indexOf("\n", i);
      if (i < 0) break;
      continue;
    }
    if (c === "/" && texto[i + 1] === "*") {
      const fim = texto.indexOf("*/", i + 2);
      i = fim < 0 ? texto.length : fim + 2;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      let conteudo = "";
      while (j < texto.length) {
        if (texto[j] === "\\") {
          conteudo += texto[j + 1] === '"' ? '"' : texto[j] + (texto[j + 1] || "");
          j += 2;
          continue;
        }
        if (texto[j] === c) break;
        // Literal de uma linha só: aspa sem fechamento na linha é operador,
        // apóstrofo de texto ou coisa pior — abandona e segue.
        if (texto[j] === "\n" && c !== "`") { j = -1; break; }
        conteudo += texto[j];
        j++;
      }
      if (j < 0 || j >= texto.length) { i++; continue; }
      if (conteudo.length >= 6) {
        // O PREFIXO — o pedaço de código imediatamente antes da aspa — permite a
        // um fato saber se está diante de um `label:`, um `value:`, um `title:`.
        // Sem ele, cada literal é analisado sozinho e o contexto se perde: o
        // rótulo "2ª dose" da amiodarona não contém a palavra "amiodarona"
        // (o nome do fármaco está em outro campo do mesmo objeto), então uma
        // regra que procurasse o nome nunca o alcançaria.
        achados.push({ frase: conteudo, pos: i, prefixo: texto.slice(Math.max(0, i - 40), i) });
      }
      i = j + 1;
      continue;
    }

    i++;
  }
  return achados;
}

const falhas = [];
const porFato = new Map(FATOS.map((f) => [f.id, 0]));

for (const arquivo of fontes(appDir)) {
  const texto = fs.readFileSync(arquivo, "utf8");
  const rel = path.relative(appDir, arquivo);

  const doArquivo = literais(texto).map((l) => l.frase).join(" ¶ ");

  // Fatos de escopo "arquivo": o conjunto dos literais do arquivo é uma frase só.
  for (const fato of FATOS.filter((f) => f.escopo === "arquivo")) {
    if (!fato.assunto(doArquivo, { prefixo: "", arquivo: rel })) continue;
    porFato.set(fato.id, porFato.get(fato.id) + 1);
    for (const regra of fato.exige || []) {
      if (!regra.re.test(doArquivo)) {
        falhas.push(`❌ ${rel} — ${fato.descricao}\n   FALTA ${regra.re} no arquivo: ${regra.porque}`);
      }
    }
    for (const regra of fato.proibe || []) {
      if (regra.re.test(doArquivo)) {
        falhas.push(`❌ ${rel} — ${fato.descricao}\n   NÃO PODE ${regra.re}: ${regra.porque}`);
      }
    }
    if (fato.verifica) {
      const erro = fato.verifica(doArquivo, { prefixo: "", arquivo: rel });
      if (erro) falhas.push(`❌ ${rel} — ${fato.descricao}\n   ${erro}`);
    }
  }

  for (const { frase, pos, prefixo } of literais(texto)) {
    const linha = texto.slice(0, pos).split("\n").length;
    const ctx = { prefixo, arquivo: rel };

    for (const fato of FATOS.filter((f) => f.escopo !== "arquivo")) {
      if (!fato.assunto(frase, ctx)) continue;

      const excecao = (fato.excecoes || []).find(
        (e) => (e.contem && frase.includes(e.contem)) || (e.arquivo && e.arquivo.test(rel))
      );
      if (excecao) continue;

      porFato.set(fato.id, porFato.get(fato.id) + 1);

      for (const regra of fato.exige || []) {
        if (!regra.re.test(frase)) {
          falhas.push(
            `❌ ${rel}:${linha} — ${fato.descricao}\n   FALTA ${regra.re}: ${regra.porque}\n   « ${frase.slice(0, 150)} »`
          );
        }
      }
      if (fato.verifica) {
        const erro = fato.verifica(frase, ctx);
        if (erro) {
          falhas.push(`❌ ${rel}:${linha} — ${fato.descricao}\n   ${erro}\n   « ${frase.slice(0, 150)} »`);
        }
      }
      for (const regra of fato.proibe || []) {
        if (regra.re.test(frase)) {
          falhas.push(
            `❌ ${rel}:${linha} — ${fato.descricao}\n   NÃO PODE ${regra.re}: ${regra.porque}\n   « ${frase.slice(0, 150)} »`
          );
        }
      }
    }
  }
}

console.log("\nConsistência dos fatos clínicos repetidos\n");
for (const fato of FATOS) {
  console.log(`   ${String(porFato.get(fato.id)).padStart(3)} frase(s)  ${fato.descricao}`);
}

// Um fato sem nenhuma frase é um fato que deixou de ser vigiado — o texto pode
// ter sido reescrito de um jeito que o `assunto` não reconhece mais, e aí a
// trava passa a aprovar tudo por não olhar nada.
for (const fato of FATOS) {
  if (porFato.get(fato.id) === 0) {
    falhas.push(
      `❌ o fato "${fato.id}" não encontrou NENHUMA frase — ou o assunto sumiu do app, ou foi reescrito ` +
      `de forma que este script não reconhece. Trava que não vê nada aprova tudo.`
    );
  }
}

if (falhas.length) {
  console.log("");
  for (const f of falhas) console.log(f + "\n");
} else {
  console.log(`\n✅ ${FATOS.length} fatos conferidos em todas as suas ocorrências — o app diz a mesma coisa em todo lugar`);
}
console.log("");

process.exit(falhas.length ? 1 : 0);
