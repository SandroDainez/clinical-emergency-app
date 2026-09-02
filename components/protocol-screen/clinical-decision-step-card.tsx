import { Text, View } from "react-native";

import type { FrontendTreeStep } from "../../core/decision-tree/types";
import { useEstilosDoTema } from "../../design-system/theme";
import { useTr } from "../../lib/use-tr";
import { Card, Tag } from "../ui-v2";
import DecisionGrid from "./template/DecisionGrid";
import ComparativoDePadroes from "./comparativo-de-padroes";
import { ListaDeCriterios } from "./lista-de-criterios";
import { criarEstilosV2 } from "./clinical-step-shared-styles";

type DecisionStep = Extract<FrontendTreeStep, { kind: "decision" }>;

export type ClinicalDecisionStepCardProps = {
  step: DecisionStep;
  onChoose: (id: string) => void;
};

/**
 * Apresentação isolada da etapa de DECISÃO.
 *
 * Não escolhe opção, não interpreta evidência e não altera IDs. Recebe o step
 * já produzido pelo engine e devolve ao shell exatamente o id selecionado.
 */
export function ClinicalDecisionStepCard({ step, onChoose }: ClinicalDecisionStepCardProps) {
  const tr = useTr();
  const v = useEstilosDoTema(criarEstilosV2);

  return (
    <View style={v.stepStack} testID="passo-de-decisao">
      <Card tom="primary" style={v.cartao}>
        <Tag label={tr("Decisão clínica")} />
        <Text style={v.titulo}>{tr(step.title)}</Text>
        <Text style={v.texto}>{tr(step.question)}</Text>
        {step.summary ? <Text style={v.resumo}>{tr(step.summary)}</Text> : null}
        <ListaDeCriterios
          itens={step.evidence}
          estilos={{
            lista: v.lista,
            linha: v.linha,
            marcador: v.marcador,
            texto: v.itemTexto,
            alternar: v.alternarCriterios,
          }}
        />
        <ComparativoDePadroes itens={step.comparativo} />
      </Card>

      <DecisionGrid
        options={step.options.map((option) => ({ id: option.id, label: tr(option.label) }))}
        onSelect={onChoose}
        title={tr("Toque para decidir")}
      />
    </View>
  );
}
