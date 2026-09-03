import type { ReactNode } from "react";

import { useTr } from "../../lib/use-tr";
import { Header } from "./header";

export type ReferenceScreenHeaderProps = {
  title: string;
  category?: string;
  onBack: () => void;
  right?: ReactNode;
};

/** Cabeçalho canônico das telas de consulta rápida. */
export function ReferenceScreenHeader({
  title,
  category = "ACLS",
  onBack,
  right,
}: ReferenceScreenHeaderProps) {
  const tr = useTr();

  return (
    <Header
      titulo={title}
      etapa={`${category} · ${tr("Consulta rápida")}`}
      onVoltar={onBack}
      labelVoltar={tr("Voltar ao atendimento")}
      direita={right}
    />
  );
}
