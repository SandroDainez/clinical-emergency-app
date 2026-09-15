/**
 * MUTAÇÕES · HORÁRIO CLÍNICO — AC-13 reaberto, item 3 (autor, 2026-09-14; E-49 aprovada).
 *
 * Cada mutação reencena um jeito de o horário do registro virar horário clínico, ou de a ausência de horário clínico
 * alcançar conduta (marcas 6 e 7 do índice de não-exigir). A prova do AC-13 tem de reprovar todas.
 */
const { ARQ } = require("./lib.cjs");

module.exports = {
  nome: "Horário clínico · separado do registro e fora da conduta",
  trava: "scripts/prova-avc-ac13-reaberto.cjs",
  mutacoes: [
    {
      nome: "transição sem horário clínico passa a usar o horário do registro",
      arquivo: ARQ.horarioClinico,
      de: '  /** Sem horário clínico, a transição fica sem horário clínico; o horário do registro continua separado, na trilha. */\n  return { tipo: "nao_informado" };',
      para: '  return { tipo: "conhecido", ms: fato.horaRegistro, fonte: "registro_da_situacao" };',
    },
    {
      nome: "«Iniciada» sem ivt_inicio passa a usar o horário do registro",
      arquivo: ARQ.horarioClinico,
      de: '    if (inicio === "nao_sei") return { tipo: "desconhecido_declarado", fonte: "ivt_inicio" };\n    return { tipo: "nao_informado" };',
      para: '    if (inicio === "nao_sei") return { tipo: "desconhecido_declarado", fonte: "ivt_inicio" };\n    return { tipo: "conhecido", ms: fato.horaRegistro, fonte: "ivt_inicio" };',
    },
    {
      nome: "a pendência documental do horário clínico deixa de nascer",
      arquivo: ARQ.horarioClinico,
      de: '      if (horarioClinicoDaTransicao(estado, f).tipo !== "nao_informado") continue;',
      para: "      continue;",
    },
    {
      nome: "«Limpar» passa a apagar a pendência de horário clínico de uma transição ainda válida",
      arquivo: ARQ.horarioClinico,
      de: '      if (info.tipo !== "registrado" || invalidados.has(f.id)) continue;',
      para: '      if (info.tipo !== "registrado" || invalidados.has(f.id) || doCampo.some((y) => y.corrigeFatoId === f.id)) continue;',
    },
    {
      nome: "o caminho hemorrágico volta a usar o horário do registro como hora da interrupção",
      arquivo: ARQ.caminhoHemorragico,
      de: '      interrompidaEm: h.tipo === "conhecido" ? h.ms : undefined,',
      para: '      interrompidaEm: h.tipo === "conhecido" ? h.ms : f?.horaRegistro,',
    },
    {
      nome: "E-49 marca 6 · o veredito da EVT passa a considerar a ausência de horário clínico",
      arquivo: ARQ.vereditoEvt,
      de: "    retencaoDiagnostica: retencaoDiagnostica(estado),\n  };",
      para: '    retencaoDiagnostica: retencaoDiagnostica(estado),\n    aguardaHorarioClinico: !estado.fatos.some((f) => f.campo === "ivt_horario_clinico"),\n  };',
    },
    {
      nome: "E-49 marca 7 · a última dose de DOAC passa a ser inferida do horário da trombólise",
      arquivo: ARQ.derivD,
      de: '  const fato = valorAtual(estado, "doac_ultima_dose");',
      para: '  const fato = valorAtual(estado, "doac_ultima_dose") ?? valorAtual(estado, "ivt_horario_clinico") ?? valorAtual(estado, "ivt_inicio");',
    },
  ],
};
