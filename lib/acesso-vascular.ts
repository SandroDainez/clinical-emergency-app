/**
 * ACESSO VASCULAR NA PARADA — a hierarquia, em UMA fonte.
 *
 * ── ⚠️ A LACUNA QUE ORIGINOU (medida em 2026-08-20, D-63) ──────────────────
 *
 * O módulo ACLS é AHA 2025 — o conteúdo cita a 2025 cinquenta vezes e implementa
 * oito das mudanças dela. Mas o acesso vascular tinha ficado para trás: o fluxo
 * e o áudio diziam **"1 mg IV ou IO"**, sem preferência declarada, que é a
 * redação anterior à mudança. A hierarquia existia em UM lugar só (a nota do
 * primeiro ciclo pós-choque) e não chegava a quem estava ouvindo.
 *
 * ── A HIERARQUIA, COM CLASSE E NÍVEL ───────────────────────────────────────
 *
 *   IV       primeira tentativa                          Classe 1,   Nível A
 *   IO       se a tentativa de IV falhar ou não for viável Classe 2a, Nível A
 *   CENTRAL  se IV e IO falharem, por profissional treinado Classe 2b, Nível C-LD
 *
 * ⚠️ CLASSE E NÍVEL VIAJAM COM A RECOMENDAÇÃO, e não são enfeite: 2a com nível A
 * é coisa diferente de 2b com C-LD, e quem lê "IO é aceitável" sem a classe não
 * tem como saber que a via central é recomendação mais fraca, sustentada por
 * evidência limitada.
 *
 * ── ⚠️ A FONTE, E O QUE FALTA NELA ─────────────────────────────────────────
 *
 * AHA 2025 — Parte 9 (Adult Advanced Life Support). **Transcrita de fonte
 * SECUNDÁRIA: o artigo primário na Circulation devolveu HTTP 403 e não foi
 * aberto.** Registrada no metadata como NÃO CONFERIDA CONTRA O PRIMÁRIO — não
 * escrever "conferida" enquanto ninguém abrir o Circulation.
 *
 * ── ⚠️ O QUE É NOSSO, E ESTÁ MARCADO COMO TAL ──────────────────────────────
 *
 * A cláusula de NÃO-ATRASO é OPERACIONALIZAÇÃO DESTE APP. A diretriz estabelece
 * a hierarquia e **não traz ressalva de tempo**. Ela existe aqui porque o pior
 * desfecho previsível desta recomendação, com usuário sem experiência, é alguém
 * adiar a epinefrina procurando veia — a hierarquia é sobre ORDEM DE TENTATIVA,
 * não sobre esperar. Mesmo formato da janela de seis horas da hipoglicemia.
 */

/**
 * A NOTA DO 1º CICLO PÓS-CHOQUE — FRASE INTEIRA, não concatenação.
 *
 * ⚠️ A primeira versão montava a nota somando três constantes no consumo. O
 * texto chega à tela COMPOSTO e a varredura de literais não vê a soma: fonte
 * única de TEXTO significa que a constante é a frase inteira.
 *
 * Carrega, nesta ordem: a hierarquia com classe e nível · a ressalva que é NOSSA
 * · a regra da epinefrina no chocável · a procedência com a ressalva de não ter
 * sido conferida contra o primário.
 */
export const ACESSO_VASCULAR_NOTA_RCP1 =
  "Use este ciclo para garantir acesso e preparar a via aérea. Acesso: tente IV primeiro (Classe 1, Nível A); se a tentativa de IV falhar ou não for viável, IO (Classe 2a, Nível A); se IV e IO falharem, acesso central por profissional treinado (Classe 2b, Nível C-LD). ⚠️ A hierarquia é de ORDEM DE TENTATIVA, não de espera: nenhuma dose atrasa por causa dela — se o IV não vem, vá ao IO e siga (operacionalização deste app; a diretriz estabelece a hierarquia e não traz ressalva de tempo). A epinefrina só está indicada no chocável a partir do 2º ciclo, após o 2º choque. ➜ AHA 2025, Parte 9 — transcrita de fonte secundária, não conferida contra o primário.";

/**
 * ⚠️ O TEXTO FALADO NÃO VIVE AQUI, E NÃO É ESQUECIMENTO.
 *
 * O app toca MP3 gravado por cue; `speech-map` é o texto canônico daquele MP3.
 * Uma constante nova aqui daria a impressão de áudio corrigido sem mudar uma
 * palavra do que se ouve. O texto a gravar está no roteiro
 * (`acls/AUDIO_SCRIPT.md`), marcado como cue pendente — e entra em `speech-map`
 * no dia em que o MP3 existir, junto (D-63).
 */
