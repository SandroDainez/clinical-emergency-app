import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { iraDecisionTree } from "../../ira-decision-tree";

/**
 * ⚠️ SEM RODAPÉ DE FONTE, E É DE PROPÓSITO (2026-08-18).
 *
 * O rodapé dizia "KDIGO 2012 (Clinical Practice Guideline for Acute Kidney
 * Injury)" em TODAS as telas do módulo. Isso é verdade para o estadiamento — e
 * é FALSO para a conduta da hipercalemia, cujas doses vêm do módulo de
 * Eletrólitos (bula DailyMed + recomendações aceitas). O app estava atribuindo
 * uma recomendação clínica a uma diretriz que não a fez.
 *
 * **RODAPÉ AUSENTE É MELHOR QUE RODAPÉ MENTIROSO.** A etiqueta que generaliza
 * saiu; a procedência específica ficou onde a recomendação está — dentro do
 * `porque` do nó que a usa, dizendo de onde veio e de onde NÃO veio.
 *
 * O conserto real é `fonte` POR NÓ, no motor. Ele deixou de ser pendência e
 * virou PORTÃO: nenhum módulo novo entra sem campo de fonte por nó.
 */
export default function IraFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={iraDecisionTree}
      protocolLabel="Injúria renal aguda"
      headerTitle="Injúria renal aguda"
      intro="Creatinina que subiu ou paciente que parou de urinar: os dois eixos do KDIGO (creatinina e diurese), a base de creatinina — inclusive quando você não a tem —, a exclusão da obstrução em primeiro lugar, hipoperfusão e nefrotóxico pelo que se observa, e quando a conversa sobre diálise precisa começar."
      currentModuleSlug="injuria-renal-aguda"
      // ⚠️ O ABCDE É O PASSO 0 DESTE MÓDULO, então o card universal sai: ele
      // diria a mesma coisa duas vezes, e a versão dele é a pior — aviso não
      // pergunta nada e se rola por cima.
      estabilizacaoNoFluxo
    />
  );
}
