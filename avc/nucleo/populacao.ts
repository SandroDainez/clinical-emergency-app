/**
 * PORTÃO DE POPULAÇÃO — AC-03 de `docs/avc/auditoria-vs-spec.md`.
 *
 * Fonte: `protocols/fontes-verbatim/escopo-populacional-avc.md` (slot F-37):
 * [CORREÇÃO 12/09] *"Identificar e encaminhar; nunca aplicar regra adulta em
 * silêncio"* e a instrução escrita do autor de 2026-09-13.
 *
 * ⚠️ O que este arquivo decide: se a população do caso está **validada** para o
 * módulo (adulto, não gestante, não puérpera), **fora do escopo**, ou ainda **sem
 * resposta**. ⛔ O que ele NÃO decide: nenhuma conduta. Fora do escopo, a única
 * saída é encaminhar.
 *
 * ⚠️ Desconhecido ⛔ não é negativo: "não sei" na idade ⛔ não vira adulto, e
 * "não sei" na gestação ⛔ não vira "não gestante" (escolha do autor, 2026-09-13).
 */
import type { EstadoAvc } from "./estado";
import { valorAtual } from "./estado";
import type { Pendencia, SuperficieId } from "./tipos";
import { valorDaOpcao } from "../conteudo/campo";
import { FAIXA_ETARIA, GESTACAO_PUERPERIO, HORA_DO_PARTO, JANELA_DO_PUERPERIO_DIAS } from "../conteudo/paciente";

const DIA_MS = 24 * 60 * 60 * 1000;

export const MENSAGEM_FORA_DO_ESCOPO = "Fora do escopo validado — encaminhar";

export type EstadoDaPopulacao = "adulto_validado" | "fora_do_escopo" | "pergunta_pendente";
export type MotivoForaDoEscopo = "menor_de_18" | "gestante" | "puerpera";
export type PerguntaDaPopulacao = "faixa_etaria" | "gestacao_puerperio" | "data_do_parto" | "parto_hora_conhecida";

export type LeituraDaPopulacao = {
  readonly estado: EstadoDaPopulacao;
  /** Por que o caso está fora do escopo. Vazio quando não está. */
  readonly motivos: readonly MotivoForaDoEscopo[];
  /** Quais perguntas ainda não têm resposta que decida. */
  readonly faltam: readonly PerguntaDaPopulacao[];
};

/**
 * ⚠️⚠️ AC-03r, C8 (autor, 2026-09-14): a janela OPERACIONAL LOCAL de 14 dias após o parto.
 *
 *   · `nao_se_aplica` — ⛔ «Puérpera» registrada;
 *   · `data_desconhecida` — data ⛔ registrada ou «Sem essa informação»: ⛔ assume mais de 14 dias, ⛔ libera o
 *     protocolo adulto;
 *   · `hora_desconhecida` — data registrada, hora ⛔ confirmada («Não, só a data», «Não sei» ⛔ sem resposta):
 *     ⛔ assume horário nenhum; informação incompleta, retém como a data desconhecida;
 *   · `dentro_da_janela_local` — tempo decorrido ≤ 14 × 24 h: fora do escopo validado;
 *   · `alem_da_janela_local` — tempo decorrido > 14 × 24 h: o portão ⛔ retém por puerpério.
 *
 * ⚠️ Decisão do autor (2026-09-14): data E hora do parto contra a data e hora de ABERTURA do atendimento
 * (`abertoEm`, congelada no episódio) — ⛔ o relógio de agora: retomar o caso ⛔ muda a classificação.
 * `dias` é o número de dias completos decorridos, só para exibição. ⛔ Regra local do projeto — ⛔ recomendação da AHA/ASA.
 */
export type LeituraDoPuerperio =
  | { readonly estado: "nao_se_aplica" | "data_desconhecida" | "hora_desconhecida" }
  | { readonly estado: "dentro_da_janela_local" | "alem_da_janela_local"; readonly dias: number };

export function leituraDoPuerperio(estado: EstadoAvc): LeituraDoPuerperio {
  if (valorAtual(estado, "gestacao_puerperio")?.valor !== valorDaOpcao(GESTACAO_PUERPERIO.puerpera)) {
    return { estado: "nao_se_aplica" };
  }
  const parto = valorAtual(estado, "data_do_parto")?.valor;
  if (typeof parto !== "number") return { estado: "data_desconhecida" };
  if (valorAtual(estado, "parto_hora_conhecida")?.valor !== valorDaOpcao(HORA_DO_PARTO.conhecida)) {
    return { estado: "hora_desconhecida" };
  }
  const decorrido = estado.abertoEm - parto;
  return {
    estado: decorrido <= JANELA_DO_PUERPERIO_DIAS * DIA_MS ? "dentro_da_janela_local" : "alem_da_janela_local",
    dias: Math.floor(decorrido / DIA_MS),
  };
}

/**
 * ⚠️ O que abre antes de a população ser validada — escolha do autor
 * (2026-09-13): estabilização e ameaças imediatas ⛔ não esperam pela pergunta.
 */
export const SUPERFICIES_LIVRES_DO_PORTAO: readonly SuperficieId[] = ["estabilizacao"];

export function estadoDaPopulacao(estado: EstadoAvc): LeituraDaPopulacao {
  const faixa = valorAtual(estado, "faixa_etaria")?.valor;
  const gestacao = valorAtual(estado, "gestacao_puerperio")?.valor;

  const motivos: MotivoForaDoEscopo[] = [];
  if (faixa === valorDaOpcao(FAIXA_ETARIA.menor)) motivos.push("menor_de_18");
  if (gestacao === valorDaOpcao(GESTACAO_PUERPERIO.gestante)) motivos.push("gestante");
  /** ⚠️ AC-03r: além da janela local, «Puérpera» ⛔ retém; dentro dela ⛔ com data desconhecida, retém como antes. */
  const puerperio = leituraDoPuerperio(estado);
  if (gestacao === valorDaOpcao(GESTACAO_PUERPERIO.puerpera) && puerperio.estado !== "alem_da_janela_local") {
    motivos.push("puerpera");
  }

  const faltam: PerguntaDaPopulacao[] = [];
  const faixaDecide = faixa === valorDaOpcao(FAIXA_ETARIA.adulto) || faixa === valorDaOpcao(FAIXA_ETARIA.menor);
  const gestacaoDecide = [GESTACAO_PUERPERIO.nenhuma, GESTACAO_PUERPERIO.gestante, GESTACAO_PUERPERIO.puerpera]
    .map(valorDaOpcao)
    .includes(String(gestacao));
  if (!faixaDecide) faltam.push("faixa_etaria");
  if (!gestacaoDecide) faltam.push("gestacao_puerperio");
  if (puerperio.estado === "data_desconhecida") faltam.push("data_do_parto");
  if (puerperio.estado === "hora_desconhecida") faltam.push("parto_hora_conhecida");

  if (motivos.length > 0) return { estado: "fora_do_escopo", motivos, faltam };
  if (faltam.length > 0) return { estado: "pergunta_pendente", motivos, faltam };
  return { estado: "adulto_validado", motivos, faltam };
}

/**
 * ⚠️ Pedido do autor (2026-09-14, antes do commit do AC-03r): puérpera com a data do parto necessária ⛔ resolvida —
 * ausente ⛔ «Sem essa informação» — é PENDÊNCIA da fase Paciente, ⛔ «Nada pendente aqui». Data dentro ⛔ além da
 * janela resolve; ⛔ puérpera ⛔ cria pendência.
 */
export function pendenciasDaPopulacao(estado: EstadoAvc): readonly Pendencia[] {
  const leitura = leituraDoPuerperio(estado).estado;
  /** ⚠️ Decisão do autor: data sem hora confirmada é informação incompleta — a pendência nomeia a pergunta da hora. */
  if (leitura === "hora_desconhecida") {
    return [
      {
        id: "parto_hora_conhecida",
        rotulo: "Hora do parto de puérpera ainda sem confirmação que decida o portão",
        dono: "paciente",
        campo: "parto_hora_conhecida",
        resolvePor: "Registrar se a hora do parto é conhecida; sem a hora, a janela local de 14 dias não é calculada e o protocolo adulto não é liberado",
      },
    ];
  }
  if (leitura !== "data_desconhecida") return [];
  return [
    {
      id: "data_do_parto",
      rotulo: "Data do parto de puérpera ainda sem resposta que decida o portão",
      dono: "paciente",
      campo: "data_do_parto",
      resolvePor: "Registrar a data do parto; sem ela, a janela local de 14 dias não é calculada e o protocolo adulto não é liberado",
    },
  ];
}

/** ⚠️ `true` quando a superfície fica atrás do portão neste caso. */
export function superficieRetidaPeloPortao(estado: EstadoAvc, superficie: SuperficieId): boolean {
  if (SUPERFICIES_LIVRES_DO_PORTAO.includes(superficie)) return false;
  return estadoDaPopulacao(estado).estado !== "adulto_validado";
}

/** ⚠️ Dose calculada por peso só existe para a população validada. */
export function exibeDosePorPeso(estado: EstadoAvc): boolean {
  return estadoDaPopulacao(estado).estado === "adulto_validado";
}
