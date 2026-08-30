/**
 * DERIVAÇÕES DA SUPERFÍCIE D — Segurança. Recalculadas a cada leitura, ⛔ nunca
 * gravadas (§4.3).
 *
 * ── ⚠️⚠️ A REGRA QUE GOVERNA O ARQUIVO ───────────────────────────────────────
 *
 * > *"O ponto mais delicado continua sendo manter **verbo da fonte + estado
 * > derivado** sem transformar tudo num 'pode/⛔ não pode trombolisar'
 * > simplificado."*
 *
 * ⛔⛔ **⛔ NÃO EXISTE, EM LUGAR NENHUM DESTE ARQUIVO, UM VEREDITO AGREGADO.** ⛔ Nem
 * "contraindicado", ⛔ nem "elegível", ⛔ nem "pode trombolisar". A superfície
 * devolve **uma leitura por item**, cada uma com o verbo da fonte.
 *
 * ⚠️⚠️ **D ⛔ NÃO POSSUI FATO NENHUM ALÉM DE TRÊS JUÍZOS.** Todo o resto é lido de
 * Paciente, Laboratório, A e C — e lido, ⛔ não copiado.
 *
 * ── ⛔ AS QUATRO PROIBIÇÕES QUE ESTE ARQUIVO CARREGA ─────────────────────────
 *
 *   · ⛔ **unknown ⛔ nunca vira negativo** — *"safety is unknown"* ⛔ não é "seguro";
 *   · ⛔ **ausência ⛔ nunca vira negativo** (**E-23**) — ⛔ não perguntado ⛔ não é
 *     "⛔ não tem";
 *   · ⛔ **desconhecido ⛔ nunca vira valor fabricado** (**E-52**);
 *   · ⛔ **⛔ só condição realmente resolvível gera pendência** (**E-26**).
 */

import type { EstadoAvc } from "./estado";
import { valorAtual } from "./estado";
import { instanciasDe, valorNaInstancia } from "./instancia";
import { numero, respondeuDesconhecido, selecaoDe, ternario, type Leitura } from "./leitura";
import type { Pendencia } from "./tipos";
import {
  CORTES_LABORATORIAIS,
  ITENS_DE_SEGURANCA,
  VERBO_DOS_CORTES,
  formulacaoDoVerbo,
  type EstadoDeSeguranca,
  type ItemDeSeguranca,
} from "../conteudo/superficie-d";
import { COLETA, FATOR_PARA_MM3 } from "../conteudo/laboratorio";

/** ⚠️ A leitura de UM item — e o verbo viaja junto, ⛔ sempre. */
export type LeituraDeSeguranca = {
  readonly id: string;
  readonly rotulo: string;
  readonly estado: EstadoDeSeguranca;
  /** ⚠️ **A frase clínica em português** — o que o médico lê primeiro. */
  readonly formulacao: string;
  /** ⚠️ O verbatim em inglês — a **autoridade**, e ⛔ nunca substituída. */
  readonly verbo: string;
  readonly fonte: string;
  readonly faixa: string;
  readonly individualizada: boolean;
  readonly consulta?: string;
  readonly corrigivel: boolean;
  readonly nota?: string;
};

const marcado = (estado: EstadoAvc, campo: string, opcao: string): boolean =>
  selecaoDe(estado, campo).includes(opcao);

/**
 * OS ANTECEDENTES QUE O MÉDICO MARCOU — ⚠️ ⛔ **nada é inferido**.
 *
 * ⚠️⚠️ ⛔ NENHUM item ⛔ não marcado aparece aqui, e ⛔ isso ⛔ **não** é o mesmo que
 * dizer que ele ⛔ não existe (**E-23**). A ausência de um antecedente na lista é
 * silêncio, e silêncio ⛔ não é negativa.
 */
export function itensMarcados(estado: EstadoAvc): readonly LeituraDeSeguranca[] {
  return ITENS_DE_SEGURANCA.filter((i) => marcado(estado, i.campo, i.opcao)).map(leituraDoItem);
}

function leituraDoItem(i: ItemDeSeguranca): LeituraDeSeguranca {
  return {
    id: i.opcao,
    rotulo: i.opcao,
    estado: i.estado,
    /**
     * ⚠️⚠️ A FORMULAÇÃO VEM DO **MAPA FECHADO**, e ⛔ não de um campo escrito no
     * item: mesmo verbo, mesma frase, sempre. ⛔ Verbo sem par é erro de
     * conteúdo, e a trava reprova antes de chegar aqui.
     */
    formulacao: formulacaoDoVerbo(i.verbo) ?? i.verbo,
    verbo: i.verbo,
    fonte: i.fonte,
    faixa: i.faixa,
    individualizada: i.individualizada === true,
    consulta: i.consulta,
    corrigivel: i.corrigivel === true,
    nota: i.nota,
  };
}

/**
 * ⚠️⚠️ O SANGRAMENTO GI/GU TRATADO — o **único** item da Table 8 cuja condição de
 * modificação a fonte declara.
 *
 * ⚠️ Tratado, ele ⛔ **não** some da lista e ⛔ **não** vira "sem restrição": ele
 * passa a `situacao_individualizada`, que é o que a fonte sustenta —
 * *"if the GI/GU bleeding has been treated and risk modified/reduced"*.
 * ⛔ Apagá-lo esconderia que houve sangramento.
 */
export function itensComModificacao(estado: EstadoAvc): readonly LeituraDeSeguranca[] {
  const tratado = ternario(estado, "sangramento_tratado") === true;
  return itensMarcados(estado).map((l) =>
    l.corrigivel && tratado
      ? { ...l, estado: "situacao_individualizada" as const, individualizada: true }
      : l
  );
}

export type LeituraDeCorte = {
  readonly id: string;
  readonly estado: EstadoDeSeguranca;
  readonly valor?: number;
  readonly limite: number;
  readonly verbo: string;
  readonly razao?: "unidade_nao_declarada" | "divergencia_entre_coletas";
};

/** ⚠️ O valor do analito em TODAS as coletas — a divergência é lida, ⛔ não eleita. */
function valoresDoAnalito(estado: EstadoAvc, campo: string): readonly number[] {
  return instanciasDe(estado, COLETA)
    .map((c) => valorNaInstancia(estado, c, campo))
    .filter((f) => typeof f?.valor === "number")
    .map((f) => f!.valor as number);
}

/**
 * OS QUATRO CORTES DA FAIXA ABSOLUTA.
 *
 * ── ⚠️⚠️ AS TRÊS COISAS QUE D HERDA DO LABORATÓRIO, E ⛔ NÃO PODE REINVENTAR ───
 *
 *   1. **⛔ sem unidade declarada ⛔ não há comparação** — plaqueta `80` ⛔ não se
 *      compara com `100.000` enquanto ninguém disser em que unidade ela veio.
 *      ⛔ Isso ⛔ **não** é "abaixo do corte": é **informação insuficiente**;
 *   2. **divergência entre coletas** — se duas coletas discordam quanto a cruzar
 *      o corte, D ⛔ **não elege**, exatamente como C ⛔ não elege entre duas TCs;
 *   3. **exame que ⛔ não voltou ⛔ não é exame alterado** — rec. 10, **COR 2a**.
 */
export function corteDoAnalito(estado: EstadoAvc, chave: keyof typeof CORTES_LABORATORIAIS): LeituraDeCorte {
  const corte = CORTES_LABORATORIAIS[chave];
  const base = { id: chave as string, limite: corte.limite, verbo: VERBO_DOS_CORTES };

  /** ⚠️ Plaquetas exigem unidade — e ela é lida da MESMA coleta do valor. */
  if (chave === "plaquetas") {
    const coletas = instanciasDe(estado, COLETA);
    const comparaveis: number[] = [];
    let semUnidade = false;
    for (const c of coletas) {
      const v = valorNaInstancia(estado, c, "plaquetas");
      if (typeof v?.valor !== "number") continue;
      const u = valorNaInstancia(estado, c, "plaquetas_unidade");
      const rotulo = u === undefined ? undefined : String(u.valor);
      const fator = rotulo === undefined || rotulo === "nao_sei" || rotulo === "nao_perguntado"
        ? undefined
        : FATOR_PARA_MM3[rotulo];
      if (fator === undefined) { semUnidade = true; continue; }
      comparaveis.push(v.valor * fator);
    }
    if (comparaveis.length === 0) {
      return semUnidade
        ? { ...base, estado: "informacao_insuficiente", razao: "unidade_nao_declarada" }
        : { ...base, estado: "nao_perguntado" };
    }
    return classifica(base, comparaveis, corte.limite, "menor");
  }

  const valores = valoresDoAnalito(estado, chave as string);
  if (valores.length === 0) return { ...base, estado: "nao_perguntado" };
  return classifica(base, valores, corte.limite, corte.comparacao);
}

function classifica(
  base: { id: string; limite: number; verbo: string },
  valores: readonly number[],
  limite: number,
  comparacao: "menor" | "maior"
): LeituraDeCorte {
  const cruza = (v: number) => (comparacao === "menor" ? v < limite : v > limite);
  const algumCruza = valores.some(cruza);
  const algumNaoCruza = valores.some((v) => !cruza(v));

  /**
   * ⚠️⚠️ DIVERGÊNCIA ENTRE COLETAS — e ⛔ D ⛔ não elege, pela mesma razão de C:
   * preferir a "mais recente" ou a "local" seria hierarquia que ⛔ ninguém
   * autorizou. ⛔ E ⛔ não libera: ⛔ enquanto as duas valerem, ⛔ não há exclusão.
   */
  if (algumCruza && algumNaoCruza) {
    return { ...base, estado: "informacao_insuficiente", razao: "divergencia_entre_coletas" };
  }
  return algumCruza
    ? { ...base, estado: "contraindicacao_nao_corrigivel", valor: valores.find(cruza) }
    : { ...base, estado: "baixa_preocupacao_declarada", valor: valores[0] };
}

export function cortesLaboratoriais(estado: EstadoAvc): readonly LeituraDeCorte[] {
  return (Object.keys(CORTES_LABORATORIAIS) as (keyof typeof CORTES_LABORATORIAIS)[])
    .map((k) => corteDoAnalito(estado, k));
}

/**
 * A EXPOSIÇÃO A DOAC — ⚠️ e é aqui que **F-30** vive.
 *
 * ── ⛔ O QUE ESTA FUNÇÃO ⛔ NÃO FAZ, E ⛔ NUNCA VAI FAZER ENQUANTO F-30 ESTIVER ABERTA ──
 *
 * ⛔ Ela ⛔ **não calcula intervalo nenhum**. ⛔ Não compara com `agora`, ⛔ nem com a
 * chegada, ⛔ nem com o último-visto-bem, ⛔ nem com o início dos sintomas, ⛔ nem com
 * o reconhecimento. ⛔ E ⛔ **não** transforma horário conhecido em
 * *"<48 h confirmado"* (**E-52**).
 *
 * ⚠️⚠️ A fonte diz *"recent DOAC exposure (**<48 hours**)"* e lista o *"timing of
 * the last DOAC administration"* entre os fatores da análise individual — e
 * ⛔ **⛔ não declara contra qual instante** as 48 horas são medidas. ⛔ Sem marco, ⛔ não
 * há conta a fazer, e fazer uma seria inventar o relógio.
 *
 * ⚠️ O estado é o que a fonte declara, ⛔ nem mais ⛔ nem menos: *"the safety … **is
 * unknown**"* → **informação insuficiente**, e *"**may be considered** after a
 * thorough benefit vs risk analysis on an individual basis"* → **situação
 * individualizada**. As duas ao mesmo tempo.
 */
export type LeituraDoDoac = Leitura & {
  readonly exposicao: "sem_anticoagulante" | "nao_perguntado" | "horario_desconhecido" | "horario_conhecido";
  readonly estado: EstadoDeSeguranca;
  readonly individualizada: boolean;
  /** ⚠️ ⛔ SEMPRE `false` enquanto F-30 estiver aberta. A prova mede isto. */
  readonly janelaClassificada: boolean;
};

export function exposicaoADoac(estado: EstadoAvc): LeituraDoDoac {
  const fato = valorAtual(estado, "doac_ultima_dose");
  const insumos = ["anticoagulante_em_uso", "doac_ultima_dose"];
  const base = {
    insumos, fonte: "F-10", janelaClassificada: false, conclusao: "desconhecido" as const,
  };

  if (fato === undefined || fato.valor === "nao_perguntado") {
    return {
      ...base,
      exposicao: "nao_perguntado",
      estado: "nao_perguntado",
      individualizada: false,
      tom: "informativo",
      curto: "Última dose de anticoagulante direto ainda não registrada",
      texto: "Não haver registro não é o mesmo que não haver exposição",
    };
  }
  if (String(fato.valor) === "nao_sei") {
    /**
     * ⚠️⚠️ CLASSIFICADO PELO AUTOR NO PRÓPRIO VERBATIM: `dado desconhecido` **+**
     * `pendência clínica` **+** `situação individualizada` — as três ao mesmo
     * tempo. ⛔ E ⛔ nunca: exposição confirmada, ausência de exposição, ⛔ nem
     * contraindicação automática.
     */
    return {
      ...base,
      exposicao: "horario_desconhecido",
      estado: "informacao_insuficiente",
      individualizada: true,
      tom: "atencao",
      curto: "Horário da última dose de anticoagulante direto desconhecido",
      texto: "A fonte lista o horário entre os fatores da análise individual, e não define o instante de referência da janela de 48 horas. O aplicativo não calcula essa janela",
    };
  }
  return {
    ...base,
    exposicao: "horario_conhecido",
    estado: "informacao_insuficiente",
    individualizada: true,
    tom: "atencao",
    curto: "Exposição a anticoagulante direto registrada",
    texto: "A fonte diz que a segurança da trombólise nesta situação é desconhecida, e que ela pode ser considerada após análise individual de risco e benefício. O aplicativo não classifica a janela de 48 horas, porque a fonte não define o instante de referência",
  };
}

/**
 * O ANTIAGREGANTE — ⚠️ **COR 1 · B-NR**, e é o item que mais se presta ao erro
 * oposto: tratar risco declarado como proibição.
 *
 * > *"IVT **is recommended** to improve functional outcomes **despite an
 * > increase in risk of sICH** compared with no antiplatelet therapy"*
 */
export function antiagregante(estado: EstadoAvc): Leitura & { estado: EstadoDeSeguranca } {
  const v = ternario(estado, "antiagregante_em_uso");
  const base = { insumos: ["antiagregante_em_uso"], fonte: "F-07", conclusao: "desconhecido" as const };
  if (v !== true) {
    return { ...base, estado: "nao_perguntado", tom: "informativo",
      curto: "Antiagregante em uso ainda não registrado",
      texto: "Nada no atendimento espera por este registro" };
  }
  return {
    ...base, estado: "baixa_preocupacao_declarada", tom: "informativo",
    curto: "Antiagregante em uso — a fonte recomenda a trombólise mesmo assim",
    texto: "A fonte recomenda a trombólise para melhorar o desfecho funcional, apesar do aumento de risco de hemorragia sintomática comparado a não usar antiagregante",
  };
}

/**
 * MICROSSANGRAMENTOS — ⚠️⚠️ o **único** ponto do módulo em que *desconhecido* é
 * **estado terminal aceitável**, por recomendação de **classe 1**.
 *
 * > *"IVT be administered **without first obtaining MRI** to exclude CMBs"*
 *
 * ⛔ Por isso ele ⛔ **não** gera pendência. Cobrar a informação seria induzir a
 * ressonância que a rec. 11 manda **⛔ não** obter.
 */
export function microssangramentos(estado: EstadoAvc): Leitura & { estado: EstadoDeSeguranca } {
  const rotulo = String(valorAtual(estado, "informacao_previa_cmb")?.valor ?? "");
  const base = { insumos: ["informacao_previa_cmb"], fonte: "F-07", conclusao: "desconhecido" as const };
  if (/1 a 10|1–10|1-10/i.test(rotulo)) {
    return { ...base, estado: "baixa_preocupacao_declarada", tom: "informativo",
      curto: "Ressonância prévia com 1 a 10 microssangramentos — a fonte considera razoável",
      texto: "Recomendação classe 2a" };
  }
  if (/mais de 10|>10/i.test(rotulo)) {
    return { ...base, estado: "informacao_insuficiente", tom: "atencao",
      curto: "Ressonância prévia com mais de 10 microssangramentos — utilidade incerta",
      texto: "A fonte diz que a utilidade da trombólise é incerta, e pode associar-se a maior risco de hemorragia sintomática. Recomendação classe 2b, e a trombólise não fica bloqueada" };
  }
  return { ...base, estado: "baixa_preocupacao_declarada", tom: "informativo",
    curto: "Sem informação prévia sobre microssangramentos — e nada espera por ela",
    texto: "A fonte recomenda administrar a trombólise sem obter ressonância para excluir microssangramentos. Recomendação classe 1" };
}

/**
 * AS PENDÊNCIAS — ⚠️ **três**, e ⛔ **nenhuma bloqueia** (**E-49**).
 *
 * ⚠️⚠️ **E-26**: ⛔ só entra o que é **realmente resolvível**. ⛔ Ficam de fora a
 * faixa 1 inteira, o CMB desconhecido (**COR 1**, estado terminal aceitável), as
 * contraindicações ⛔ não corrigíveis (⛔ não há o que resolver) e as consultas.
 */
export function pendenciasDaSeguranca(estado: EstadoAvc): readonly Pendencia[] {
  const abertas: Pendencia[] = [];

  /**
   * ⚠️⚠️ E ELA NASCE ⛔ **SÓ** COM O JUÍZO — rec. 10, **COR 2a**: *"IVT not be
   * delayed while waiting for … testing **if there is no reason to suspect an
   * abnormal result**"*. ⛔ Sem o juízo, o app cobraria exame de todo paciente, que
   * é exatamente o atraso que a recomendação proíbe.
   */
  if (ternario(estado, "motivo_para_suspeitar_alteracao_coagulacao") === true) {
    const faltando = cortesLaboratoriais(estado).filter((c) => c.estado === "nao_perguntado");
    if (faltando.length > 0) {
      abertas.push({
        id: "coagulograma",
        rotulo: "Coagulograma",
        dono: "seguranca",
        campo: "inr",
        resolvePor: "Registrar o resultado dos exames de coagulação",
      });
    }
  }

  /** ⚠️ Resolvível de verdade: sem a unidade ⛔ não existe comparação nenhuma. */
  if (cortesLaboratoriais(estado).some((c) => c.razao === "unidade_nao_declarada")) {
    abertas.push({
      id: "plaquetas_unidade",
      rotulo: "Unidade das plaquetas",
      dono: "seguranca",
      campo: "plaquetas_unidade",
      resolvePor: "Registrar a unidade do laudo, sem a qual o valor não se compara ao corte",
    });
  }

  /**
   * ⚠️⚠️ E ESTA PENDÊNCIA **DECLARA O QUE ⛔ NÃO RESOLVE** — correção do autor:
   *
   * > *"o horário desconhecido pode ser um dado útil a buscar, mas ⛔ não deve
   * > parecer que obter esse horário automaticamente resolverá a decisão."*
   *
   * ⛔ Sem a segunda frase, ela seria uma promessa falsa: **F-30** está aberta, e
   * ⛔ nem com o horário em mãos o app classifica a janela.
   */
  if (exposicaoADoac(estado).exposicao === "horario_desconhecido") {
    abertas.push({
      id: "doac_ultima_dose",
      rotulo: "Horário da última dose de anticoagulante direto",
      dono: "seguranca",
      campo: "doac_ultima_dose",
      resolvePor:
        "Registrar o horário é clinicamente útil, e não classifica a janela de 48 horas: a fonte não define o instante de referência, e o aplicativo não calcula",
    });
  }

  return abertas;
}

/** Todas as leituras nomeadas de D, para a tela e para a prova. */
export function leiturasDaSuperficieD(estado: EstadoAvc): readonly (Leitura & { id: string })[] {
  return [
    { id: "doac", ...exposicaoADoac(estado) },
    { id: "antiagregante", ...antiagregante(estado) },
    { id: "microssangramentos", ...microssangramentos(estado) },
  ];
}

/** ⚠️ Os itens que a fonte manda considerar caso a caso — para a tela agrupar. */
export function itensPorEstado(estado: EstadoAvc, qual: EstadoDeSeguranca): readonly LeituraDeSeguranca[] {
  return itensComModificacao(estado).filter((i) => i.estado === qual);
}

/**
 * ⛔⛔ ⛔ NÃO EXISTE `podeTrombolisar()`, ⛔ nem `elegivel()`, ⛔ nem `contraindicado()`.
 *
 * ⚠️ Esta ausência é **a decisão central da superfície**, e a prova a mede: uma
 * função dessas achataria oito estados num booleano, e o booleano seria lido
 * como veredito — que é **E-43** e **E-46** de uma vez só.
 */
export function contagemPorEstado(estado: EstadoAvc): Readonly<Record<string, number>> {
  const m: Record<string, number> = {};
  for (const i of itensComModificacao(estado)) m[i.estado] = (m[i.estado] ?? 0) + 1;
  return m;
}
