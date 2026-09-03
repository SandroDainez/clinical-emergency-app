import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { ventilationDecisionTree } from "../../ventilation-decision-tree";
import VentilatorConfiguratorCard from "./ventilator-configurator-card";

export default function VentilationFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={ventilationDecisionTree}
      protocolLabel="Ventilação Mecânica"
      headerTitle="Ventilação Mecânica"
      intro="Fluxo interativo da ventilação mecânica invasiva. O app conduz a sequência real: objetivos e modo, cálculo do peso corporal predito pela altura e sexo para orientar o volume corrente protetor, ajuste inicial, estratégia por patologia, checagem de segurança (platô e driving pressure), troubleshooting (DOPES) e desmame."
      source="ARDSNet · Surviving Sepsis 2021 · ERS/ESICM 2017 · ACCP Weaning 2017"
      currentModuleSlug="ventilacao-mecanica"
      topContent={<VentilatorConfiguratorCard />}
    />
  );
}
