/**
 * MUTAÇÕES · APRESENTAÇÃO DA F — as cinco decisões de UX do autor.
 *
 * ⚠️ Regra de apresentação é a que mais silenciosamente regride: ⛔ nada quebra
 * quando a ordem muda ⛔ e o `tsc` passa. ⛔ Só a mutação vê.
 */
const { ARQ } = require("./lib.cjs");

module.exports = {
  nome: "Apresentação da F · as cinco decisões de UX",
  trava: "scripts/prova-avc-apresentacao-f.cjs",
  mutacoes: [
    /** ⚠️⚠️ DECISÃO 4 · ⛔ COR ⛔ NÃO governa a ordem — o relógio governa. */
    {
      nome: "a ordem volta a ser governada por COR",
      arquivo: ARQ.apresF,
      de: '  "acao_com_relogio",\n  "aplicavel",',
      para: '  "aplicavel",\n  "acao_com_relogio",',
    },
    {
      nome: "o aperto deixa de ordenar dentro da faixa",
      arquivo: ARQ.apresF,
      de: '    if (typeof aa === "number" && typeof bb === "number") return aa - bb;',
      para: '    if (typeof aa === "number" && typeof bb === "number") return 0;',
    },
    {
      nome: "COR 3 aplicável vira ação",
      arquivo: ARQ.apresF,
      de: '    if (ehCor3(leitura.cor)) return "alerta_cor3";',
      para: "",
    },

    /** ⚠️⚠️ DECISÃO 1 · agrupar pela FALTA, ⛔ não pela recomendação. */
    {
      nome: "a exceção de 1 dado volta ao agrupamento",
      arquivo: ARQ.apresF,
      de: '    if (item.faixa !== "potencial_recolhida") continue;',
      para: '    if (item.faixa === "sem_fonte") continue;',
    },
    {
      nome: "a exceção de 1 dado desaparece",
      arquivo: ARQ.apresF,
      de: '  if (leitura.faltam.length === 1) return "a_um_dado";',
      para: "",
    },

    /** ⚠️⚠️ DECISÃO 3 · dívida de fonte ⛔ NÃO é dado faltante. */
    {
      nome: "a dívida vira falta de dado",
      arquivo: ARQ.apresF,
      de: '  if (leitura.correspondencia === "nao_avaliavel") return "sem_fonte";',
      para: "",
    },

    /** ⚠️⚠️ O DESEMPATE DE PRODUTO — ⛔ e ⛔ não o alfabético. */
    {
      nome: "o desempate volta a ser alfabético",
      arquivo: ARQ.apresF,
      de: "      posicaoDeProduto(a.insumo) - posicaoDeProduto(b.insumo) ||",
      para: "",
    },
    {
      nome: "a ordem de produto passa por cima da contagem",
      arquivo: ARQ.apresF,
      de: "      b.quantas - a.quantas ||\n      posicaoDeProduto(a.insumo) - posicaoDeProduto(b.insumo) ||",
      para: "      posicaoDeProduto(a.insumo) - posicaoDeProduto(b.insumo) ||\n      b.quantas - a.quantas ||",
    },

    /** ⚠️⚠️ OS RELÓGIOS — ⛔ nenhum fundido com outro. */
    {
      nome: "o meio do sono aponta para a última vez bem",
      arquivo: ARQ.apresF,
      de: '  midpoint_of_sleep: {\n    tipo: "campo",\n    campo: "hora_meio_do_sono",',
      para: '  midpoint_of_sleep: {\n    tipo: "campo",\n    campo: "hora_ultima_vez_bem",',
    },
    {
      nome: "a disjunção escolhe um lado só",
      arquivo: ARQ.apresF,
      de: "  return comValor.map((x) => ({",
      para: "  return comValor.slice(0, 1).map((x) => ({",
    },
    {
      nome: "relógio sem marco passa a contar desde agora",
      arquivo: ARQ.apresF,
      de: '    return [{ ...base, rotulo: origem.rotulo, estado: "sem_marco", campo: campos[0] }];',
      para: '    return [{ ...base, rotulo: origem.rotulo, estado: "correndo", decorridosMin: 0, restantesMin: Math.round(janela.ateHoras * 60) }];',
    },

    /** ⚠️⚠️ INSUMO ⛔ NÃO É CAMPO — o toque tem de abrir algo. */
    {
      nome: "o insumo vira campo por acidente",
      arquivo: ARQ.apresF,
      de: '  sitio_da_oclusao: ["sitio_oclusao"],',
      para: '  sitio_da_oclusao: ["sitio_da_oclusao"],',
    },
    {
      nome: "F-31 ganha campo para o médico responder",
      arquivo: ARQ.apresF,
      de: "  nao_elegivel_a_evt: [],",
      para: '  nao_elegivel_a_evt: ["nao_elegivel_a_evt"],',
    },
    {
      nome: "o peso perde a origem",
      arquivo: ARQ.apresF,
      de: '  peso: ["peso", "peso_origem"],',
      para: '  peso: ["peso"],',
    },

    /** ⚠️⚠️ O GATILHO DE WAKE-UP — ⛔ e ⛔ não início desconhecido. */
    {
      nome: "volta a aparecer por início não observado, sem sono",
      arquivo: ARQ.conteudoA,
      de: '    apareceQuando: { campo: "acordou_com_deficit", valor: "Sim" },',
      para: '    apareceQuando: { campo: "hora_inicio_observado", valor: "nao_sei" },',
    },
    {
      nome: "esconde o marco mesmo com acordou_com_deficit = Sim",
      arquivo: ARQ.conteudoA,
      de: '    apareceQuando: { campo: "acordou_com_deficit", valor: "Sim" },',
      para: '    apareceQuando: { campo: "acordou_com_deficit", valor: "Nao existe" },',
    },
    {
      nome: "o gatilho vira pergunta sobre ter dormido",
      arquivo: ARQ.conteudoA,
      de: '    rotulo: "Acordou com o déficit",',
      para: '    rotulo: "Houve sono antes do achado",',
    },

    /** ⚠️⚠️ DECISÃO 5 · frase clínica na frente, contagem atrás. */
    {
      nome: "a contagem vira a mensagem principal",
      arquivo: ARQ.telaF,
      de: '    faltaMotivo: { color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600" },\n    faltaQuantas: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },',
      para: '    faltaMotivo: { color: tema.cores.text, fontSize: TIPOGRAFIA.micro.fontSize, fontWeight: "600" },\n    faltaQuantas: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },',
    },
    {
      nome: "a frase clínica volta a falar de arquitetura",
      arquivo: ARQ.conteudoF,
      de: '  sitio_da_oclusao: "Necessário para definir as opções endovasculares.",',
      para: '  sitio_da_oclusao: "Abre 11 recomendações endovasculares.",',
    },
    {
      nome: "duas frases clínicas voltam a ser iguais",
      arquivo: ARQ.conteudoF,
      de: '    "Ausência de alteração marcada no FLAIR — o segundo critério da mesma recomendação.",',
      para: '    "Extensão da lesão em DWI, para a trombólise de início desconhecido.",',
    },

    /** ⚠️⚠️ DECISÃO 2 · as duas raias, sempre. */
    {
      nome: "a raia de EVT vira condicional",
      arquivo: ARQ.telaF,
      de: '        <Raia titulo={tr("Trombectomia")} itens={itens} terapia="evt" testID="avc-f-raia-evt" />',
      para: '        {itens.length > 0 ? <Raia titulo={tr("Trombectomia")} itens={itens} terapia="evt" testID="avc-f-raia-evt" /> : null}',
    },

    /** ⚠️⚠️ O QUE A TELA ⛔ NÃO PODE DIZER ⛔ NEM FAZER. */
    {
      nome: "a tela escreve contraindicado",
      arquivo: ARQ.telaF,
      de: '  const alerta = item.faixa === "alerta_cor3";',
      para: '  const alerta = item.faixa === "alerta_cor3"; const _x = "contraindicado";',
    },
    {
      nome: "a tela estima peso padrão",
      arquivo: ARQ.telaF,
      de: 'typeof pesoBruto === "number" ? pesoBruto : undefined',
      para: 'typeof pesoBruto === "number" ? pesoBruto : 70',
    },
    {
      nome: "a dose perde o aviso de não-administração",
      arquivo: ARQ.telaF,
      de: '{tr("Cálculo de dose — não é administração")}',
      para: '{tr("Cálculo de dose")}',
    },
    {
      nome: "a tela reordena por conta própria",
      arquivo: ARQ.telaF,
      de: "  const naFaixa = (f: Faixa) => itens.filter((i) => i.faixa === f);",
      para: "  const naFaixa = (f: Faixa) => itens.filter((i) => i.faixa === f).sort((a, b) => a.leitura.cor.localeCompare(b.leitura.cor));",
    },
  ],
};
