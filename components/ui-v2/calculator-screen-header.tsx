import type { ReactNode } from "react";

import { useTr } from "../../lib/use-tr";
import { Header } from "./header";

export type CalculatorScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

/**
 * Cabeçalho canônico das calculadoras clínicas.
 *
 * Declara a função da tela sem sugerir que uma calculadora é um fluxo de
 * atendimento. Não conhece fórmula, fármaco, engine ou navegação.
 */
export function CalculatorScreenHeader({ title, onBack, right }: CalculatorScreenHeaderProps) {
  const tr = useTr();
  return (
    <Header
      titulo={title}
      etapa={tr("Calculadora clínica")}
      onVoltar={onBack}
      labelVoltar={tr("Voltar aos módulos")}
      direita={right}
    />
  );
}
