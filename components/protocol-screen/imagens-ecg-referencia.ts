import type { ImageSourcePropType } from "react-native";

/**
 * MAPA DE FOTOS DE REFERÊNCIA REAIS — o `require()` de asset vive só aqui.
 *
 * ⚠️ POR QUE SEPARADO DA ÁRVORE (Bloco 4, 2026-08-24): `coronary-decision-
 * tree.ts` e os outros arquivos de árvore precisam continuar sendo
 * `require()`áveis por Node puro (fora do Metro) — é assim que os
 * validadores (`scripts/valida-*.cjs`) compilam e inspecionam a árvore.
 * `require()` de um `.png` só funciona sob o asset transform do Metro; posto
 * direto na árvore, quebra todo validador. Por isso a árvore carrega só o ID
 * (string) em `ComparativoVisual.imagemReal`, e este arquivo — que só o
 * componente React (`comparativo-de-padroes.tsx`) importa — resolve o ID
 * para o asset de verdade.
 *
 * ⚠️ SÓ ENTRA AQUI O QUE TEM REFERÊNCIA FORNECIDA PELO AUTOR. Nenhuma
 * morfologia é inventada para preencher lacuna — um padrão sem imagem aqui
 * continua com o traçado sintético (`tracadoDeEcg`) até a referência chegar.
 */
export const IMAGENS_ECG_REFERENCIA: Record<string, ImageSourcePropType> = {
  "de-winter": require("../../assets/ecg-referencias/de-winter.png"),
  posterior: require("../../assets/ecg-referencias/posterior.png"),
  // ⚠️ PRÉVIA — AINDA NÃO LIGADAS À ÁRVORE REAL (2026-08-24). Recortadas de
  // referência fornecida pelo autor: "t-hiperaguda" teve cabeçalho do
  // paciente e as setas/texto "T hiperaguda" removidos (inpainting sobre a
  // máscara de vermelho — o traçado preto não foi tocado), mostrando só
  // V2–V4. "avr-infra-difuso" já vinha limpa (sem dado de paciente).
  // Consumidas por enquanto só em `app/dev/preview-ecg-bloco4.tsx`, rota de
  // prévia isolada — entram na árvore de coronarianas apenas após aprovação
  // visual explícita do autor.
  "t-hiperaguda": require("../../assets/ecg-referencias/t-hiperaguda.png"),
  "avr-infra-difuso": require("../../assets/ecg-referencias/avr-infra-difuso.png"),

  // ── SCA V2 · os três da Decisão 1 (2026-08-27) ─────────────────────────
  //
  // ⚠️ IMAGENS SINTÉTICAS, GERADAS POR IA PARA ESTE PROJETO — não são traçados
  // de paciente real. A distinção está declarada em
  // `auditoria/imagens-clinicas.json` e importa: elas servem como APOIO VISUAL
  // DIDÁTICO para reconhecer o padrão, e a tela diz isso. O critério do autor
  // para aceitá-las foi o único que vale aqui: serem claramente típicas e
  // clinicamente fiéis — "se alguma estiver ambígua ou artificial demais,
  // melhor trocar do que forçar a auditoria a aceitá-la".
  //
  // Recortadas dos painéis 1, 3 e 4 do quadro "Alterações isquêmicas no ECG"
  // fornecido pelo autor. Mesma grade e mesma escala nos três: é o que permite
  // comparar amplitude entre eles sem que um painel minta sobre o outro.
  "ecg-normal": require("../../assets/clinico/ecg-normal.png"),
  "ecg-supra-st": require("../../assets/clinico/ecg-supra-st.png"),
  "ecg-infra-st": require("../../assets/clinico/ecg-infra-st.png"),
};
