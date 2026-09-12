/**
 * ROTULOS CLÍNICOS — a fronteira entre o identificador interno e o que o médico lê.
 *
 * ── ⚠️⚠️ A CLASSE DE DEFEITO QUE ISTO ELIMINA ──────────────────────────────
 *
 * ⛔ A Superfície F imprimia `Falta: deficit_incapacitante` — **o nome da
 * variável**, na tela clínica, com underline ⛔ e tudo. ⚠️ Apareceu numa captura
 * de 2026-09-05, ⛔ e ⛔ nenhum teste pegava: `tr()` faz *fallback* para a própria
 * chave, então slug ⛔ não traduzido **atravessa em silêncio**.
 *
 * ⚠️⚠️ ⛔ E A CORREÇÃO ⛔ NÃO É TROCAR AQUELE SLUG (autor, 2026-09-05):
 *
 * > *"⛔ Não quero resolver um slug; quero eliminar essa classe de defeito."*
 *
 * ⛔ Regra local — `if (id === "deficit_incapacitante") …` — espalhada por
 * superfície é a garantia de que o **próximo** slug volta a vazar, ⛔ e por outra
 * tela. ⚠️ Aqui há **uma** fonte, com *fallback* seguro, ⛔ e uma trava que
 * reprova identificador em texto clínico renderizado.
 *
 * ── ⚠️⚠️ DUAS COISAS DIFERENTES, ⛔ E ⛔ NÃO UMA ────────────────────────────
 *
 *   · `rotuloClinico(id)` — **o nome do dado**: *"Déficit incapacitante"*.
 *     Serve para dizer **de que** se está falando.
 *
 *   · `acaoPendente(id)` — **o que o médico faz**: *"Definir se o déficit é
 *     incapacitante"*. Serve para pendência, ⛔ e ⛔ nunca para rótulo.
 *
 * ⚠️ A distinção é do autor: *"⛔ não mostramos o nome da variável; mostramos a
 * **ação clínica pendente**"*. ⛔ Uma pendência escrita como substantivo
 * (*"Anticoagulante"*) ⛔ não diz o que resolver — ⛔ ela nomeia um assunto.
 */

/**
 * ⚠️ O NOME DO DADO. ⛔ Chave = identificador interno; valor = o que se lê.
 *
 * ⛔ Entrada nova aqui ⛔ não é burocracia: é o preço de o identificador ⛔ nunca
 * chegar à tela.
 */
export const ROTULO_CLINICO: Readonly<Record<string, string>> = {
  // ── insumos das recomendações de reperfusão ───────────────────────────────
  deficit_incapacitante: "Déficit incapacitante",
  deficit_leve_nao_incapacitante: "Déficit leve e não incapacitante",
  nihss: "NIHSS",
  mrs_previo: "mRS prévio",
  idade: "Idade",
  sitio_da_oclusao: "Sítio da oclusão",
  aspects: "ASPECTS",
  /**
   * ⚠️ **PC-ASPECTS**, ⛔ e ⛔ não *"pc-ASPECTS"* — ⛔ a fonte escreve a sigla em
   * caixa alta, ⛔ e ⛔ ela aparece **ao lado de "ASPECTS"** no fundamento do
   * veredito. ⛔ Caixa inconsistente ali lê como duas coisas diferentes.
   */
  pc_aspects: "PC-ASPECTS",
  efeito_de_massa_ausente: "Ausência de efeito de massa",
  penumbra_salvavel: "Penumbra salvável",
  penumbra_por_perfusao_automatizada: "Penumbra por perfusão automatizada",
  dwi_menor_que_um_terco: "DWI menor que um terço do território",
  flair_sem_alteracao_marcada: "FLAIR sem alteração marcada",
  peso: "Peso",
  nao_elegivel_a_evt: "Inelegibilidade à trombectomia",
  agente_e_tenecteplase: "Agente em consideração",
  /**
   * ⚠️ ⛔ *"Desde o início"*, ⛔ e ⛔ não *"Janela"*: ⛔ o que o médico lê no
   * fundamento é o **tempo decorrido** (*"2h08"*), ⛔ e ⛔ não o nome do
   * critério.
   */
  janela: "Desde o início",

  // ── campos de tela ────────────────────────────────────────────────────────
  hora_ultima_vez_bem: "Última vez visto bem",
  hora_chegada: "Chegada ao pronto-socorro",
  inicio_observado: "Início observado do déficit",
  reconhecimento: "Reconhecimento dos sintomas",
  deficit_focal: "Déficit neurológico focal",
  estudo_resultado: "Resultado da imagem",
  estudo_modalidade: "Modalidade do exame",
  suspeita_hsa: "Suspeita de hemorragia subaracnóidea",
  anticoagulacao: "Uso de anticoagulante",
  glicemia: "Glicemia",
  pressao_arterial: "Pressão arterial",
  // ── segurança da IVT (commit 7 · 2026-09-12) ─────────────────────────────
  inr: "INR",
  plaquetas_unidade: "Unidade das plaquetas",
  motivo_para_suspeitar_alteracao_coagulacao: "Motivo para suspeitar de alteração da coagulação",
};

/**
 * ⚠️ A AÇÃO CLÍNICA PENDENTE — verbo na frente, ⛔ e ⛔ nunca substantivo solto.
 *
 * ⛔ *"Anticoagulante"* nomeia um assunto; *"Confirmar uso recente de
 * anticoagulante"* diz **o que fazer**. ⚠️ Pendência sem verbo é muro (**E-26**).
 */
export const ACAO_PENDENTE: Readonly<Record<string, string>> = {
  deficit_incapacitante: "Definir se o déficit é incapacitante",
  deficit_leve_nao_incapacitante: "Definir se o déficit é leve e não incapacitante",
  nihss: "Registrar o NIHSS",
  mrs_previo: "Registrar a funcionalidade prévia (mRS)",
  idade: "Informar a idade",
  sitio_da_oclusao: "Registrar o sítio da oclusão",
  aspects: "Registrar o ASPECTS do laudo",
  pc_aspects: "Registrar o PC-ASPECTS do laudo",
  efeito_de_massa_ausente: "Registrar se há efeito de massa na imagem",
  penumbra_salvavel: "Registrar se há penumbra salvável",
  penumbra_por_perfusao_automatizada: "Registrar a perfusão automatizada",
  dwi_menor_que_um_terco: "Registrar a extensão na DWI",
  flair_sem_alteracao_marcada: "Registrar o FLAIR",
  peso: "Informar o peso",
  nao_elegivel_a_evt: "Definir a elegibilidade à trombectomia",
  agente_e_tenecteplase: "Escolher o agente trombolítico em consideração",
  /**
   * ⚠️⚠️ ⛔ A JANELA SE RESOLVE **INFORMANDO O HORÁRIO**, ⛔ e ⛔ o genérico
   * ⛔ não servia: o fallback produzia *"Registrar desde o início"*, ⛔ que
   * ⛔ não é ação clínica ⛔ nem diz o que fazer. ⚠️ Visto na revisão de 375 px.
   */
  janela: "Informar o horário de início do déficit",

  hora_ultima_vez_bem: "Informar a última vez visto bem",
  hora_chegada: "Informar o horário de chegada",
  deficit_focal: "Registrar o exame neurológico",
  estudo_resultado: "Registrar o resultado da imagem",
  suspeita_hsa: "Responder se há suspeita de hemorragia subaracnóidea",
  anticoagulacao: "Confirmar uso recente de anticoagulante",
  glicemia: "Medir a glicemia",
  pressao_arterial: "Aferir a pressão arterial",
  // ── segurança da IVT (commit 7 · 2026-09-12) ─────────────────────────────
  inr: "Registrar o resultado dos exames de coagulação",
  plaquetas_unidade: "Registrar a unidade do laudo, sem a qual o valor não se compara ao corte",
  motivo_para_suspeitar_alteracao_coagulacao:
    "Responder se há motivo para suspeitar de alteração da coagulação",
};

/**
 * ⚠️⚠️ O *FALLBACK* É **SEGURO**, ⛔ e ⛔ não silencioso.
 *
 * ⛔ Devolver o próprio identificador seria repetir o defeito. ⚠️ Sem entrada, o
 * id vira texto legível — `_` viram espaços ⛔ e a primeira letra sobe —, ⛔ e a
 * trava `valida-rotulos-clinicos` reprova a ausência, para que a entrada certa
 * seja escrita por quem conhece a clínica.
 *
 * ⚠️ ⛔ O fallback ⛔ não existe para tolerar a falta: existe para que a tela
 * ⛔ nunca mostre `deficit_incapacitante` **enquanto** alguém escreve a entrada.
 */
export function rotuloClinico(id: string): string {
  const conhecido = ROTULO_CLINICO[id];
  if (conhecido) return conhecido;
  return humanizar(id);
}

/** ⚠️ Sem ação declarada, cai para *"Registrar <o nome do dado>"*. */
export function acaoPendente(id: string): string {
  const conhecida = ACAO_PENDENTE[id];
  if (conhecida) return conhecida;
  return `Registrar ${rotuloClinico(id).toLowerCase()}`;
}

/** ⚠️ `deficit_incapacitante` → `Deficit incapacitante`. ⛔ Último recurso. */
function humanizar(id: string): string {
  const limpo = id.replace(/[_-]+/g, " ").trim();
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}

/**
 * ⚠️ Os identificadores que a trava conhece — ⛔ para ela saber o que procurar
 * em texto renderizado. ⛔ Um destes na tela é defeito, ⛔ e ⛔ não estilo.
 */
export const IDENTIFICADORES_CONHECIDOS: readonly string[] = [
  ...new Set([...Object.keys(ROTULO_CLINICO), ...Object.keys(ACAO_PENDENTE)]),
];
