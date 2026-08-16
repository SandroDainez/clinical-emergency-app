/**
 * TEP — o estado que a classificação antiga não enxergava.
 *
 * ── O QUE ESTE ARQUIVO PODE AFIRMAR, E O QUE ELE NÃO PODE ──────────────────
 *
 * ⚠️ A PRIMÁRIA NÃO ABRIU. A diretriz AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/
 * SVM/SVN 2026 (Circulation e JACC, fev/2026) está atrás de paywall — três
 * tentativas, e o "guideline-at-a-glance" e as sínteses trazem os critérios
 * apenas em imagem.
 *
 * Por isso este arquivo escreve SÓ O QUE NÃO DEPENDE DA PRIMÁRIA:
 *
 *   PODE: que existe um estado com PA PRESERVADA e HIPOPERFUSÃO INSTALADA;
 *   que ele é a razão de ser da nova classificação; e que o módulo não o
 *   oferecia. Ausência de CONSTRUTO se verifica no próprio app — `grep`
 *   "normotens" no TEP retornava ZERO, enquanto o conceito já existia em
 *   Choque (7 ocorrências) e no EAP.
 *
 *   NÃO PODE, e fica pendente declarado (D-39): os CRITÉRIOS numéricos de
 *   hipoperfusão (lactato, diurese, índice cardíaco, PAM), a inversão do
 *   "< 15 min" e a varredura número a número do módulo.
 *
 * Sem números não há como errar por fonte secundária — e é essa a fronteira
 * que este arquivo respeita.
 *
 * ── POR QUE A AUSÊNCIA JÁ É ACHADO ─────────────────────────────────────────
 *
 * O módulo cita a classificação A–E de 2026 e, na linha seguinte, escreve
 * "D–E ≈ alto risco" — traduzindo o esquema novo para o vocabulário antigo.
 * A tradução preserva o fluxo existente e APAGA exatamente o que a revisão
 * acrescentou: o paciente que ainda não está hipotenso e já está em choque.
 *
 * Está registrado no METODO como R-63.
 */

export const TEP_CHOQUE_NORMOTENSO =
  "⚠️ PRESSÃO NORMAL NÃO É PERFUSÃO NORMAL — E ESTE É O PACIENTE QUE A CLASSIFICAÇÃO ANTIGA NÃO ENXERGAVA. Existe um estado, entre o TEP estável e o TEP com choque declarado, em que a PRESSÃO AINDA ESTÁ PRESERVADA e a PERFUSÃO JÁ FALHOU: o ventrículo direito está falhando, o débito caiu, e a vasoconstrição sustenta o número do monitor enquanto os órgãos já não recebem sangue. É o CHOQUE NORMOTENSO, e reconhecê-lo cedo é o motivo pelo qual a classificação de 2026 substituiu \"maciço/submaciço\" — os rótulos antigos só tinham duas caixas, e este paciente caía na de baixo. ⚠️ COMO SUSPEITAR, SEM DEPENDER DA PRESSÃO: sinais de má perfusão em quem está normotenso — lactato que sobe, diurese que cai, extremidades frias, confusão, taquicardia desproporcional — somados a disfunção de VD na imagem e biomarcador elevado. ⚠️ E O QUE ISSO MUDA: ele NÃO é um TEP intermediário estável que se observa; é um paciente em deterioração, que exige vigilância intensiva, acionamento do time de resposta (PERT) e decisão precoce sobre reperfusão — antes de a pressão cair, porque quando ela cai a mortalidade já é outra. Reavalie de perto: a piora costuma ser de horas, não de dias.";

/**
 * ⚠️ A RESSALVA DE PROCEDÊNCIA, no próprio texto de tela.
 *
 * O app afirma a EXISTÊNCIA do estado e a lógica clínica dele — que não
 * dependem de número. Os critérios operacionais de 2026 ficam declarados como
 * pendentes, em vez de estimados: é a mesma disciplina da janela pós-LAST e do
 * volume de reconstituição da hidrocortisona.
 */
export const TEP_CHOQUE_NORMOTENSO_PROCEDENCIA =
  "⚠️ PROCEDÊNCIA: a classificação AHA/ACC 2026 define este estado com CRITÉRIOS NUMÉRICOS de hipoperfusão, e este app AINDA NÃO OS REPRODUZ — o texto integral da diretriz não foi aberto, e reproduzir critério a partir de resumo de terceiro é o erro que esta auditoria recusa. O que está escrito acima é o construto clínico e a conduta que decorre dele. Para os pontos de corte, consulte a diretriz de 2026 diretamente.";
