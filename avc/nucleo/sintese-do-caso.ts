/**
 * SÍNTESE DO CASO — o que a Superfície Destino mostra (PD-37).
 *
 * ── ⚠️⚠️ SÍNTESE ⛔ NÃO É *DUMP* DE ESTADO ──────────────────────────────────
 *
 * > *"Se o sistema possui 40 dados, ⛔ não quero 40 dados na tela."* — autor,
 * > 2026-09-05
 *
 * ⚠️ Cada linha aqui passou por uma pergunta: **ela muda a compreensão ⛔ ou a
 * próxima ação neste momento?** ⛔ O que ⛔ não muda ⛔ nenhuma das duas fica na
 * superfície de origem ⛔ ou no contexto expandido — ⛔ e ⛔ não é repetido aqui.
 *
 * ── ⚠️⚠️ AS DUAS REGRAS QUE ESTE ARQUIVO EXISTE PARA NÃO QUEBRAR ───────────
 *
 * ⛔ **INDICADO ⛔ NÃO É REALIZADO.** ⚠️ O domínio já separa (`iniciada` ·
 * `realizada` · `cancelada`), ⛔ e a síntese **usa** essa separação em vez de
 * achatá-la. ⛔ Ler *"Tenecteplase indicada"* como *"Tenecteplase administrada"*
 * é o pior erro que esta tela poderia induzir.
 *
 * ⛔ **⛔ NADA É AFIRMADO POR AUSÊNCIA (E-23).** ⚠️ Sem tomografia registrada, a
 * síntese ⛔ não diz *"sem hemorragia"*: ⛔ ela ⛔ não diz ⛔ nada sobre imagem.
 * ⛔ Silêncio no estado ⛔ não vira achado negativo.
 */
import { decorridoEmMinutos, valorAtual, type EstadoAvc } from "./estado";
import { destinoDaImagem } from "./derivacoes-c";
import { exposicoesPorInstancia, type FaseDaExposicao } from "./derivacoes-f";
import { bloqueiosCorrigiveis } from "./derivacoes-d";
import { nihssCalculado, nihssInformado } from "./derivacoes-b";
import type { Relogio } from "./relogio";

/** ⚠️ Um fato da síntese — ⛔ já formatado para leitura, ⛔ e sem id cru. */
export type LinhaDaSintese = {
  readonly id: string;
  readonly texto: string;
};

/**
 * ⚠️⚠️ A CONDUTA — ⛔ e ⛔ SÓ o que já foi **decidido**.
 *
 * ⛔ Possibilidade ⛔ não entra: mostrar *"pode receber trombólise"* ao lado de
 * *"trombólise administrada"* faria as duas parecerem da mesma espécie.
 */
export type Conduta = {
  readonly id: string;
  readonly texto: string;
  /**
   * ⚠️⚠️ A **FASE DA EXPOSIÇÃO** (D2, commit 8b): `iniciada` · `realizada` ·
   * `interrompida`. ⛔ *"indicada"* saiu: ⛔ ela nascia de uma instância
   * **vazia** — ⛔ formulário aberto virando conduta (AVC-13). ⛔ Decisão de
   * prosseguir ⛔ não é conduta desta lista; ⛔ ela vive no seu campo.
   */
  readonly natureza: FaseDaExposicao;
  /** ⚠️ Quando houver — ⛔ e ⛔ nunca inventado. */
  readonly horario?: string;
  /** ⚠️ HR-5: trilha `Iniciada → Cancelada` — ⛔ exposição preservada, ⛔ contradição dita. */
  readonly contraditoria?: boolean;
};

export type SinteseDoCaso = {
  /** ⚠️ A frase curta do estado clínico. ⛔ Vazia quando ⛔ nada se sabe. */
  readonly situacao: readonly LinhaDaSintese[];
  readonly condutas: readonly Conduta[];
  /** ⚠️ O que fazer agora — ⛔ operacional, ⛔ e ⛔ não guideline genérica. */
  readonly proximaAcao: readonly LinhaDaSintese[];
  /** ⚠️ Só o que interfere em segurança, decisão, destino ⛔ ou tratamento. */
  readonly pendencias: readonly { readonly id: string; readonly campo: string }[];
};

/** ⚠️ `96` → `"1 h 36 min"`. ⛔ Minuto cru vira conta na cabeça do médico. */
function duracao(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/**
 * ⚠️⚠️ AS PENDÊNCIAS ENTRAM **POR PARÂMETRO**, ⛔ e ⛔ não são decididas aqui.
 *
 * ⛔ Quem sabe quais pendências existem é a tela do módulo, que já compõe as
 * derivadas de várias superfícies. ⚠️ Recalcular isso aqui daria **duas
 * verdades** sobre o mesmo fato, ⛔ e elas divergiriam na primeira mudança (I6).
 */
export function sinteseDoCaso(
  estado: EstadoAvc,
  relogio: Relogio,
  pendenciasDoCaso: readonly { readonly id: string; readonly campo: string }[],
): SinteseDoCaso {
  const situacao: LinhaDaSintese[] = [];
  const condutas: Conduta[] = [];
  const proximaAcao: LinhaDaSintese[] = [];

  /* ── 1 · SITUAÇÃO — a síndrome, o tempo, a gravidade, a imagem ────────── */

  /**
   * ⚠️⚠️ A SÍNDROME VEM DA IMAGEM, ⛔ e ⛔ não de suposição. ⛔ Sem tomografia
   * registrada, o app ⛔ não afirma *"isquêmico"* — ⛔ ele ⛔ não sabe.
   */
  const destino = destinoDaImagem(estado);
  if (destino) {
    situacao.push({ id: "sindrome", texto: destino.rotulo });
  }

  /** ⚠️ O relógio clínico — o dado que corre sozinho. */
  const lkw = decorridoEmMinutos(estado, "ultima_vez_bem", relogio);
  if (lkw !== undefined) {
    situacao.push({ id: "tempo", texto: `Última vez bem há ${duracao(lkw)}` });
  }

  /**
   * ⚠️ O NIHSS — calculado **ou** trazido de fora, ⛔ e a síntese ⛔ não escolhe
   * entre eles por conta própria: quem resolve isso é a derivação de B.
   */
  const nihss = nihssCalculado(estado) ?? nihssInformado(estado);
  if (nihss !== undefined) {
    situacao.push({ id: "nihss", texto: `NIHSS ${nihss}` });
  }

  /* ── 2 · CONDUTA — ⛔ só o decidido, ⛔ e com a natureza explícita ──────── */

  /**
   * ⚠️⚠️ ⛔ SÓ O QUE **EXPÔS** O PACIENTE ENTRA (R4 · D2, commit 8b).
   *
   * ⛔ A versão anterior listava **toda** instância ⛔ não cancelada, ⛔ e uma
   * instância **vazia** (formulário aberto) saía como *"Trombólise indicada"*
   * (AVC-13). ⚠️ Agora a conduta nasce da **exposição**, lida do histórico:
   * iniciada · realizada · interrompida. ⛔ `registro_em_aberto` ⛔ e
   * `cancelada_antes_do_inicio` ⛔ não são conduta do paciente — ⛔ são história,
   * ⛔ e vivem na trilha.
   */
  for (const x of exposicoesPorInstancia(estado)) {
    if (x.estado !== "exposta") continue;
    condutas.push({
      id: `trombolise-${x.instancia}`,
      texto: x.agente ? `${x.agente}` : "Trombólise",
      natureza: x.fase,
      horario: x.inicio.tipo === "conhecido" ? horaCurta(x.inicio.ms) : undefined,
      contraditoria: x.contraditoria,
    });
  }

  /* ── 3 · PRÓXIMA AÇÃO — operacional, ⛔ e ⛔ não guideline ───────────────── */

  /**
   * ⚠️⚠️ A SAÍDA HEMORRÁGICA É A PRÓXIMA AÇÃO MAIS FORTE QUE EXISTE.
   *
   * ⛔ Identificada hemorragia, ⛔ nada mais importa antes de abrir o manejo
   * correspondente — ⛔ e a tela diz isso, ⛔ em vez de listar recomendações.
   */
  if (destino?.saida === "hemorragia_intracraniana") {
    proximaAcao.push({ id: "abrir-hic", texto: "Abrir o manejo de hemorragia intracerebral" });
  } else if (destino?.saida === "suspeita_hsa") {
    proximaAcao.push({ id: "abrir-hsa", texto: "Abrir o manejo de hemorragia subaracnóidea" });
  }

  /**
   * ⚠️ Bloqueio corrigível é ação **agora**: ⛔ ele impede a terapia ⛔ e tem
   * conserto. ⛔ A frase vem de D — ⛔ a síntese ⛔ não reescreve o limiar.
   */
  for (const b of bloqueiosCorrigiveis(estado)) {
    proximaAcao.push({ id: `corrigir-${b.id}`, texto: b.formulacao });
  }

  /* ── 4 · PENDÊNCIAS — ⛔ só as que interferem ───────────────────────────── */

  /**
   * ⚠️⚠️ ⛔ NÃO É A LISTA DE CAMPOS VAZIOS. ⚠️ São as pendências que o próprio
   * núcleo já classificou como abertas — ⛔ e a tela as apresenta como **ação**,
   * ⛔ nunca como nome de variável (`acaoPendente`).
   */
  const pendencias = pendenciasDoCaso.map((p) => ({ id: p.id, campo: p.campo }));

  return { situacao, condutas, proximaAcao, pendencias };
}

/** ⚠️ `HH:MM` — ⛔ a síntese ⛔ não inventa fuso ⛔ nem formato longo. */
function horaCurta(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** ⚠️ Usado pela tela para saber se há o que sintetizar. */
export function sinteseVazia(s: SinteseDoCaso): boolean {
  return (
    s.situacao.length === 0
    && s.condutas.length === 0
    && s.proximaAcao.length === 0
  );
}

/** ⚠️ Mantido para a tela poder ler o valor bruto sem reimplementar acesso. */
export function leituraDireta(estado: EstadoAvc, campo: string) {
  return valorAtual(estado, campo);
}
