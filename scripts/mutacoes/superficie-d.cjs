/**
 * MUTAÇÕES · SUPERFÍCIE D — a ausência respondida e os pares da fonte.
 *
 * ⚠️⚠️ A mutação mais importante deste arquivo é a que faz o silêncio virar
 * *"Nenhum registrado"*. ⛔ Se ela sobreviver, a superfície volta a dizer que
 * o paciente ⛔ não tem antecedente ⛔ nenhum porque ⛔ ninguém abriu o painel —
 * ⛔ e sobre isso alguém decide trombolisar.
 */
const { ARQ } = require("./lib.cjs");

module.exports = {
  nome: "Superfície D · ausência respondida e pares da fonte",
  trava: "scripts/prova-avc-superficie-d.cjs",
  mutacoes: [
    /**
     * ⚠️⚠️ O SILÊNCIO VIRA RESPOSTA NEGATIVA.
     *
     * ⛔ Grupo ⛔ nunca perguntado passa a devolver `nenhum_registrado`. ⚠️ É
     * literalmente o estado anterior da tela, agora escrito em palavras — e a
     * consequência é a pior possível numa superfície de **segurança para
     * trombólise**.
     */
    {
      nome: "grupo nunca perguntado passa a valer como 'nenhum registrado'",
      arquivo: ARQ.derivD,
      de: '  return { campo, estado: "nao_perguntado", marcados: 0 };',
      para: '  return { campo, estado: "nenhum_registrado", marcados: 0 };',
    },

    /**
     * ⚠️⚠️ `NÃO SEI` VIRA AUSÊNCIA.
     *
     * ⛔ Alguém foi perguntado ⛔ e ⛔ não soube dizer — e a derivação passa a
     * tratar isso como campo vazio (**E-02**). ⚠️ ⛔ Some da tela a única coisa
     * que distingue *"⛔ não conseguimos saber"* de *"⛔ ninguém perguntou"*.
     */
    {
      nome: "'Não sei' deixa de ser resposta e cai no ramo do vazio",
      arquivo: ARQ.derivD,
      de: '  if (selecao.includes(NAO_SEI)) return { campo, estado: "nao_sei", marcados: 0 };',
      para: "",
    },

    /**
     * ⚠️⚠️ A COMPARAÇÃO VOLTA A SER **SLUG × RÓTULO**.
     *
     * ⛔ `respondeuDesconhecido` compara com `"nao_sei"`, ⛔ e seleção múltipla
     * grava o rótulo `"Não sei"`. ⚠️ Errado ⛔ e **silencioso**: ⛔ nenhum erro,
     * ⛔ nenhuma exceção — ⛔ só `Não sei` desaparecendo dentro de "⛔ não
     * perguntado". ⛔ É o defeito rótulo × valor que já mordeu este módulo.
     */
    {
      nome: "a ausência volta a ser comparada pelo slug, e não pelo rótulo",
      arquivo: ARQ.derivD,
      de: "  if (selecao.includes(NAO_SEI)) return { campo, estado: \"nao_sei\", marcados: 0 };",
      para: "  if (respondeuDesconhecido(estado, campo)) return { campo, estado: \"nao_sei\", marcados: 0 };",
    },

    /**
     * ⚠️⚠️ A OPÇÃO DE AUSÊNCIA VOLTA A SER ESCRITA À MÃO, ⛔ e ERRADA.
     *
     * ⛔ Uma segunda cópia de um rótulo que vive em Paciente. ⚠️ Renomear a
     * opção lá — ou escrevê-la com um caractere diferente aqui — faz o grupo
     * respondido voltar a parecer ⛔ não perguntado, ⛔ sem ⛔ nenhum sintoma.
     */
    {
      nome: "a opção de ausência deixa de ser lida do campo",
      arquivo: ARQ.derivD,
      de: "  return campoDoModulo(campo)?.exclusivas?.find((o) => o !== NAO_SEI);",
      para: '  return "Nenhum desses";',
    },

    /**
     * ⚠️⚠️ OS CAMPOS DE ANTECEDENTES VIRAM LISTA À MÃO (**D-15**).
     *
     * ⛔ Um grupo novo de antecedentes entraria **sem leitura de ausência**, ⛔ e
     * ⛔ ninguém perceberia: ele simplesmente ⛔ não apareceria no bloco.
     */
    {
      nome: "os campos de antecedentes deixam de ser derivados do catálogo",
      arquivo: ARQ.derivD,
      de: "  ...new Set(ITENS_DE_SEGURANCA.map((i) => i.campo)),",
      para: '  "antecedentes_intracranianos",',
    },

    /**
     * ⚠️⚠️ O PISO DO PREFIXO CAI, ⛔ e nascem FAMÍLIAS FALSAS.
     *
     * ⛔ Em 6, a derivação passa a casar *Trauma*tismo craniano com *Trauma* de
     * grande porte, ⛔ e *Punção* arterial com *Punção* dural — regiões e
     * procedimentos diferentes. ⚠️ A trava mede pela consequência: par em
     * **faixa igual** é marcador sem informação.
     */
    {
      nome: "o piso do prefixo cai e passa a casar famílias falsas",
      arquivo: ARQ.derivD,
      de: "const PISO_DO_PREFIXO = 7;",
      para: "const PISO_DO_PREFIXO = 6;",
    },

    /**
     * ⚠️⚠️ O PAR DEIXA DE SER SIMÉTRICO.
     *
     * ⛔ O marcador passa a existir ⛔ só de um lado: o médico que marcou o
     * membro *"errado"* — justamente o caso perigoso — ⛔ não vê ⛔ nada.
     */
    {
      nome: "o par vira mão única",
      arquivo: ARQ.derivD,
      de: "      pares.push({ opcao: a.opcao, vizinho: b.opcao, familia });\n      pares.push({ opcao: b.opcao, vizinho: a.opcao, familia });",
      para: "      pares.push({ opcao: a.opcao, vizinho: b.opcao, familia });",
    },

    /**
     * ⛔⛔ ⛔ AQUI ⛔ NÃO EXISTE MUTAÇÃO PARA A FRONTEIRA DE PALAVRA — ⛔ e a
     * ausência é MEDIDA, ⛔ não esquecimento (2026-09-01).
     *
     * ⚠️ Eu escrevi uma, e ela **sobreviveu**. ⛔ Com os 30 itens de hoje, toda
     * divergência de prefixo já cai logo depois de um espaço: tirar o corte em
     * fronteira de palavra ⛔ não muda par ⛔ nenhum, ⛔ nem o piso de 7, ⛔ nem a
     * família derivada. ⚠️ Era uma mutação que **⛔ nenhuma trava poderia matar**,
     * porque ⛔ não havia comportamento a medir.
     *
     * ⚠️ A regra ficou no código como **defesa para item futuro**, ⛔ e a trava
     * mede a sua PROPRIEDADE — que a família seja prefixo de palavra inteira
     * nos dois rótulos — ⛔ em vez de fingir que ela muda algo hoje.
     */
    /**
     * ⚠️⚠️ O PAR ATRAVESSA CAMPOS.
     *
     * ⛔ Relacionar um antecedente intracraniano a um procedimento recente
     * inventaria família que a fonte ⛔ não nomeia.
     */
    {
      nome: "o par passa a atravessar grupos de antecedentes",
      arquivo: ARQ.derivD,
      de: "      if (a.campo !== b.campo) continue;",
      para: "",
    },

    /**
     * ⚠️⚠️ A DECLARAÇÃO DE NATUREZA DA FONTE VOLTA A SER **DUAS** (**I6**).
     *
     * ⛔ A mesma regra em duas redações — e duas redações divergem com o tempo,
     * ⛔ sem que ⛔ nenhuma trava veja.
     */
    {
      nome: "o grupo de juízo reescreve a declaração de natureza da fonte",
      arquivo: ARQ.conteudoD,
      de: "    campos: FATOS_PROPRIOS_D,",
      para:
        "    campos: FATOS_PROPRIOS_D,\n"
        + '    nota: "A fonte não traz classe de recomendação em nenhuma célula da tabela.",',
    },
  ],
};
