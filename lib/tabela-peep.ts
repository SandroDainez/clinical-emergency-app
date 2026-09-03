/**
 * Tabela PEEP/FiO₂ do ARDSNet — a de verdade, porque o app mandava usar uma
 * que não existia.
 *
 * ── O DEFEITO QUE ORIGINOU ESTE ARQUIVO ──────────────────────────────────────
 *
 * QUATRO pontos do app instruíam a titular a PEEP "pela tabela PEEP/FiO₂
 * ARDSNet" — e a tabela não existia em lugar nenhum. Mandar fazer algo
 * impossível dentro do próprio app é pior que omitir: quem lê acredita que ela
 * está a um toque, procura, não acha, e conclui que não achou por incompetência.
 *
 * ── QUAL TABELA, E POR QUE ESTA ──────────────────────────────────────────────
 *
 * A **low-PEEP / high-FiO₂**, que é o braço de controle do ARMA (ARDSNet, NEJM
 * 2000) e a mais citada. A high-PEEP existe e não é oferecida aqui: o app é de
 * emergência, e escolher entre as duas é decisão de serviço, não de tela.
 *
 * ── E POR QUE OS VALORES DO APP FICAM AO LADO ───────────────────────────────
 *
 * O app NÃO passa a recomendar a tabela. Ele mostra os dois e declara a
 * escolha. A low-PEEP não é alvo a atingir: é o braço controle de um ensaio de
 * 2000, em população selecionada, e a PEEP que ela prescreve em FiO₂ 1,0
 * pressupõe titulação e monitorização que a emergência frequentemente não tem.
 * Subir a recomendação de 12 para 18–24 como efeito colateral de exibir uma
 * tabela seria mudar conduta por acidente.
 *
 * Mas omitir a tabela perderia informação: quem conduz SDRA grave precisa saber
 * que existe referencial mais alto e que o app está deliberadamente abaixo dele.
 */

/** Par FiO₂ → PEEP da low-PEEP/high-FiO₂ (ARDSNet, NEJM 2000;342:1301-8). */
export const TABELA_LOW_PEEP: { fio2: string; peep: string }[] = [
  { fio2: "0,30", peep: "5" },
  { fio2: "0,40", peep: "5–8" },
  { fio2: "0,50", peep: "8–10" },
  { fio2: "0,60", peep: "10" },
  { fio2: "0,70", peep: "10–14" },
  { fio2: "0,80", peep: "14" },
  { fio2: "0,90", peep: "14–18" },
  { fio2: "1,00", peep: "18–24" },
];

export const TABELA_PEEP_FONTE =
  "ARDSNet (ARMA). N Engl J Med. 2000;342:1301–1308 — tabela low-PEEP/high-FiO₂, braço de controle do ensaio.";

/** Ressalva clínica: tabela como ponto de partida, não como automatismo. */
export const TABELA_PEEP_RESSALVA =
  "usar a tabela como ponto de partida e individualizar PEEP pela oxigenação, mecânica/recrutabilidade e hemodinâmica; evitar manobras de recrutamento de alta pressão ou prolongadas.";
