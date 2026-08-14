/**
 * Broncoespasmo refratário — adjuvantes em fonte única (A4/A5).
 *
 * O conteúdo existia em `dyspnea-decision-tree.ts:207` (Insuficiência
 * Respiratória, vivo). A Anafilaxia — onde o broncoespasmo refratário é
 * evento definidor — só oferecia salbutamol, sem segundo broncodilatador e
 * sem magnésio.
 *
 * ── A RESSALVA QUE PRECISA ANDAR JUNTO ──────────────────────────────────────
 *
 * Na anafilaxia, nenhum adjuvante substitui ou atrasa a adrenalina. Escrever
 * o magnésio sem essa linha criaria a leitura de que existe alternativa —
 * que é o erro mais comum e mais letal do módulo.
 */

export const BRONCOESPASMO_ADJUVANTES =
  "BRONCOESPASMO REFRATÁRIO — adjuvantes, quando o β2 isolado não resolve: acrescentar IPRATRÓPIO inalatório ao salbutamol (broncodilatação por outro mecanismo, aditiva); corticoide sistêmico; e SULFATO DE MAGNÉSIO 2 g IV em 20 min no broncoespasmo grave.";

export const BRONCOESPASMO_NAO_SUBSTITUI_ADRENALINA =
  "⚠️ NA ANAFILAXIA, NENHUM DESSES SUBSTITUI OU ATRASA A ADRENALINA. São adjuvantes do broncoespasmo que persiste APÓS a adrenalina IM — nunca alternativa a ela. Broncoespasmo refratário em anafilaxia é indicação de repetir a adrenalina e preparar via aérea, não de escalar adjuvante.";
