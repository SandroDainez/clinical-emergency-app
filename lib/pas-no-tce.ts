/**
 * Meta de PAS no TCE — o texto e a lógica, na mesma fonte.
 *
 * ── A D-1, E POR QUE ELA EXISTIU ────────────────────────────────────────────
 *
 * As seis ocorrências da meta no app EXIBIAM a estratificação da BTF — "≥ 110
 * para 15–49 e > 70 anos; ≥ 100 para 50–69" — e a derivação aplicava 110 LISO.
 * Um paciente de 60 anos com PAS 105 estava na meta segundo o que lia, e a
 * lógica o marcava como hipotenso.
 *
 * A dívida foi tolerada porque a direção do erro é SOBRE-TRIAGEM: o app marca
 * como hipotenso quem a diretriz não marcaria, nunca o contrário. Erra para o
 * lado de tratar, numa lesão em que cada episódio de hipotensão piora o
 * desfecho.
 *
 * ── POR QUE FECHOU AGORA, E NÃO NA AUDITORIA DO TCE ────────────────────────
 *
 * O argumento que justificava adiar era que coletar a IDADE exigiria um campo
 * "que não serve aos outros seis módulos que consomem camposDeInstabilidade()".
 * A auditoria do politrauma conferiu: `traumaCraniano` já é campo LOCAL da
 * árvore do politrauma — busca no app inteiro retorna um único arquivo. O passo
 * não é compartilhado; o que é compartilhado é a função de campos.
 *
 * Então a idade entra do mesmo jeito: campo LOCAL, no mesmo passo, sem tocar em
 * nenhum outro módulo — e sem depender do contrato do contexto do paciente
 * (D-7), que continua sendo dívida separada. Se algum dia a idade precisar vir
 * pelo contexto compartilhado, a condição da D-7 volta a valer.
 *
 * ── E O TEXTO PASSA A SAIR DAQUI ───────────────────────────────────────────
 *
 * Fechar a lógica e deixar dois textos soltos recriaria o problema pelo outro
 * lado: a próxima correção de redação em um dos módulos faria o par divergir de
 * novo. Politrauma e TCE consomem a mesma constante.
 *
 * ── FONTE ───────────────────────────────────────────────────────────────────
 *
 * Brain Trauma Foundation, 4ª edição — limiares de pressão sistólica por faixa
 * etária, já conferidos na Fase 1 e reproduzidos no texto do app desde então.
 * ⚠️ Esta lib NÃO reabriu a fonte: ela move para um lugar só o texto que já
 * existia em seis pontos, e implementa a lógica que ele descrevia. Mudar o
 * NÚMERO exige reabrir a BTF (R-5).
 */

/** O texto, único, para os dois módulos. */
export const PAS_TCE_META =
  "EVITAR HIPOTENSÃO — a meta de PAS no TCE é estratificada por idade (BTF): ≥ 110 mmHg para 15–49 anos e para > 70 anos; ≥ 100 mmHg para 50–69 anos. Cada episódio de hipotensão piora o desfecho, e a janela de dano é a fase pré-hospitalar e as primeiras horas.";

/** Forma curta, para as linhas de METAS que listam vários alvos juntos. */
export const PAS_TCE_LIMIAR_CURTO =
  "≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos)";

export const PAS_TCE_POR_QUE_NAO_VALE_A_PERMISSIVA =
  "⚠️ A HIPOTENSÃO PERMISSIVA DO TRAUMA NÃO SE APLICA AO TCE. No sangramento sem lesão craniana, tolerar PAS 80–90 até a hemostasia reduz o sangramento; no cérebro traumatizado, a mesma pressão reduz a perfusão de um tecido que já perdeu a autorregulação. Havendo as duas coisas — hemorragia ativa E TCE —, a meta do CÉREBRO manda, e o controle da hemorragia tem de ser mais rápido, não a pressão mais baixa.";

/**
 * O limiar por idade, para a derivação.
 *
 * ⚠️ SEM IDADE INFORMADA, DEVOLVE 110 — o valor mais exigente. Continua errando
 * para o lado da sobre-triagem, que é a direção tolerável: marcar hipotenso a
 * mais nunca deixa de reconhecer hipotensão em lesão cerebral.
 */
export function limiarDePasNoTce(idade?: number | string): number {
  const n = typeof idade === "number" ? idade : Number.parseInt(String(idade ?? ""), 10);
  if (!Number.isFinite(n) || n <= 0) return 110;
  if (n >= 50 && n <= 69) return 100;
  return 110;
}
