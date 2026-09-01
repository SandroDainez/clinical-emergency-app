/**
 * MUTAÇÕES · SUPERFÍCIE C — identidade da instância e as duas naturezas.
 *
 * ⚠️⚠️ O que este conjunto existe para impedir ⛔ não é erro de desenho: é a
 * volta silenciosa de **três confusões** que a migração visual de 2026-09-01
 * desfez, cada uma com consequência clínica própria.
 *
 *   · **ordinal lido como cronologia** — inverte a ordem entre dois exames
 *     quando o mais antigo é digitado depois;
 *   · **capacidade misturada com juízo** — faz *"⛔ não temos angioTC"* ser lido
 *     como *"⛔ não há indicação de imagem vascular"*;
 *   · **rótulo curto reescrito** — abre um lugar onde a apresentação nomeia
 *     achado clínico ⛔ sem fonte.
 */
const { ARQ } = require("./lib.cjs");

module.exports = {
  nome: "Superfície C · identidade da instância e as duas naturezas",
  trava: "scripts/prova-avc-superficie-c.cjs",
  mutacoes: [
    /**
     * ⚠️⚠️ AS DUAS NATUREZAS VOLTAM PARA O MESMO BLOCO.
     *
     * ⛔ É literalmente o estado anterior do arquivo: a disponibilidade de
     * angioTC dentro do bloco de juízo clínico. ⚠️ Se a trava ⛔ não reprovar,
     * separar os blocos foi arrumação de layout, ⛔ e ⛔ não uma garantia.
     */
    {
      nome: "a capacidade do serviço volta para dentro do juízo clínico",
      arquivo: ARQ.conteudoC,
      de: '    id: "capacidade",\n    titulo: "Capacidade deste serviço",',
      para: '    id: "juizo",\n    titulo: "Juízo clínico e disponibilidade",',
    },

    /**
     * ⚠️⚠️ A SEPARAÇÃO **SEM** A FRONTEIRA ESCRITA.
     *
     * ⛔ O bloco continua separado ⛔ e no lugar certo — ⛔ só a frase some. ⚠️ É a
     * mutação que distingue *"separei os campos"* de *"disse o que a separação
     * significa"*: quem lê "Angiotomografia: ⛔ não disponível" ⛔ sem a frase
     * ⛔ não tem ⛔ nada na tela dizendo que isso ⛔ não é contraindicação.
     */
    {
      nome: "o bloco operacional perde a fronteira escrita",
      arquivo: ARQ.conteudoC,
      de: "    campos: CAPACIDADE_C,\n    nota: FRONTEIRA_OPERACIONAL_C,",
      para: "    campos: CAPACIDADE_C,",
    },

    /**
     * ⚠️⚠️ A FRONTEIRA PERDE **UMA DAS DUAS NEGATIVAS**.
     *
     * ⛔ Ela continua lá, ⛔ e continua verdadeira — ⛔ só ⛔ não diz mais que
     * indisponibilidade ⛔ não **equivale a contraindicação**. ⚠️ É a metade que
     * mais importa: "⛔ não altera indicação" ainda deixa espaço para ler
     * indisponibilidade como impedimento.
     */
    {
      nome: "a fronteira deixa de negar a equivalência com contraindicação",
      arquivo: ARQ.conteudoC,
      de: '  "Disponibilidade do recurso não altera indicação clínica nem equivale a contraindicação.";',
      para: '  "Disponibilidade do recurso não altera indicação clínica.";',
    },

    /**
     * ⚠️⚠️ O OPERACIONAL DE C ATRAVESSA PARA A CORRESPONDÊNCIA DA F.
     *
     * ⛔ A mesma ponte que a Superfície G tem trava para impedir — agora tentada
     * a partir de C, onde ⛔ nenhuma trava a cobria até hoje. ⚠️ Se sobreviver,
     * *"o serviço ⛔ não tem"* passou a satisfazer critério clínico da fonte, ⛔ e
     * geografia virou elegibilidade.
     */
    {
      nome: "a disponibilidade de angioTC vira critério clínico na F",
      arquivo: ARQ.derivF,
      de: '    case "nihss": {',
      para:
        '    case "angio_disponibilidade":\n'
        + '      return escolha(estado, "angio_disponibilidade") === "Disponível"\n'
        + '        ? "satisfaz"\n'
        + '        : "contradiz";\n'
        + '    case "nihss": {',
    },

    /**
     * ⚠️⚠️ O ORDINAL DEIXA DE DECLARAR QUE ⛔ NÃO É CRONOLOGIA.
     *
     * ⛔ A nota some, ⛔ e o número fica exatamente igual na tela. ⚠️ ⛔ Nenhum
     * pixel muda; o que muda é que ⛔ ninguém mais diz ao médico que *"estudo
     * 2"* ⛔ não significa *"o segundo que aconteceu"*.
     */
    {
      nome: "a identidade da instância para de negar a cronologia",
      arquivo: ARQ.conteudoC,
      de: '  nota: "O número identifica o exame nesta lista. Não indica ordem cronológica: um exame feito antes pode ter sido registrado depois.",',
      para: '  nota: "O número identifica o exame nesta lista.",',
    },

    /**
     * ⚠️⚠️ O EXAME SEM RESPOSTA PASSA A LAUDAR.
     *
     * ⛔ *"Sem achados"* é veredito sobre o paciente (**E-43**) escrito pela
     * tela sobre um exame que ⛔ ninguém respondeu. ⚠️ A diferença entre
     * *"⛔ ninguém preencheu"* e *"o exame ⛔ não mostrou ⛔ nada"* é a diferença
     * entre um campo vazio ⛔ e um laudo.
     */
    {
      nome: "o exame sem resposta passa a dizer que não há achados",
      arquivo: ARQ.conteudoC,
      de: '  semRespostas: "Nada respondido além da identificação.",',
      para: '  semRespostas: "Sem achados neste exame.",',
    },

    /**
     * ⚠️⚠️ UM ACHADO PERDE O RÓTULO CURTO.
     *
     * ⛔ Sem ele o achado ⛔ não é resumido, ⛔ e some do exame recolhido — com o
     * fato **já na trilha**. ⚠️ É o defeito exato que a Superfície B pagou: o
     * grupo fechado parecendo vazio enquanto guardava resposta.
     */
    {
      nome: "a hipodensidade clara perde o nome curto do resumo",
      arquivo: ARQ.conteudoC,
      de: '  hipodensidade_clara: "Hipodensidade clara",\n',
      para: "",
    },

    /**
     * ⚠️⚠️ O RÓTULO CURTO VIRA REDAÇÃO NOVA.
     *
     * ⛔ *"Isquemia precoce"* ⛔ não é recorte de *"Hipodensidade clara na
     * tomografia"*: é **outro nome clínico**, nascido na camada de
     * apresentação, ⛔ sem fonte ⛔ e sem dono (**E-29**, **E-31**).
     */
    {
      nome: "o rótulo curto deixa de ser recorte e vira nome novo",
      arquivo: ARQ.conteudoC,
      de: '  hipodensidade_clara: "Hipodensidade clara",',
      para: '  hipodensidade_clara: "Isquemia precoce",',
    },

    /**
     * ⚠️⚠️ O RÓTULO DE INTERFACE VIRA O VALOR GRAVADO.
     *
     * ⛔ A trilha passaria a guardar *"Indisponível"* onde toda derivação de C
     * espera *"Não disponível neste serviço"*. ⚠️ É o defeito **rótulo × valor**
     * — errado dos dois lados ⛔ e por isso silencioso: a tela mostraria a opção
     * marcada ⛔ e a leitura de indisponibilidade pararia de existir.
     */
    {
      nome: "o rótulo de interface curto vira a própria opção do campo",
      arquivo: ARQ.conteudoC,
      de: '    opcoes: ["Disponível", "Não disponível neste serviço", NAO_SEI],',
      para: '    opcoes: ["Disponível", "Indisponível", NAO_SEI],',
    },

    /**
     * ⚠️⚠️ ENCURTAR **ACHADO CLÍNICO**.
     *
     * ⛔ *"Hemorragia intracraniana identificada"* virando *"Hemorragia"* muda o
     * que o médico lê no instante da decisão: some *"intracraniana"* ⛔ e some
     * *"identificada"* — que é justamente o que separa o achado do exame de uma
     * afirmação sobre o paciente.
     */
    {
      nome: "o rótulo de interface passa a encurtar um achado clínico",
      arquivo: ARQ.conteudoC,
      de:
        "export const ROTULO_DE_INTERFACE: Readonly<Record<string, Readonly<Record<string, string>>>> = {\n"
        + "  angio_disponibilidade: {",
      para:
        "export const ROTULO_DE_INTERFACE: Readonly<Record<string, Readonly<Record<string, string>>>> = {\n"
        + '  estudo_resultado: { "Hemorragia intracraniana identificada": "Hemorragia" },\n'
        + "  angio_disponibilidade: {",
    },

    /**
     * ⚠️⚠️ O RÓTULO CURTO COLIDE COM OUTRA OPÇÃO DO MESMO CAMPO.
     *
     * ⛔ Duas colunas com o texto *"Disponível"* ⛔ e valores diferentes: a
     * escolha deixa de ser escolha.
     */
    {
      nome: "o rótulo de interface colide com outra opção do campo",
      arquivo: ARQ.conteudoC,
      de: '    "Não disponível neste serviço": "Indisponível",',
      para: '    "Não disponível neste serviço": "Disponível",',
    },

    /**
     * ⚠️⚠️ O BLOCO OPERACIONAL SOBE PARA ANTES DOS DADOS CLÍNICOS.
     *
     * ⛔ ⛔ Nenhum campo muda, ⛔ nenhuma regra muda — muda ⛔ só a ordem. ⚠️ E a
     * ordem é conteúdo: lido primeiro, *"este serviço ⛔ não tem angioTC"* vira
     * filtro de entrada, ⛔ e o médico para de responder o resto.
     */
    {
      nome: "o operacional passa a vir antes do juízo clínico",
      arquivo: ARQ.conteudoC,
      de: '  {\n    id: "juizo",\n    titulo: "Juízo clínico",\n    campos: JUIZO_C,',
      para: '  {\n    id: "capacidade2",\n    titulo: "Juízo clínico",\n    campos: JUIZO_C,',
    },
  ],
};
