import { useRouter } from "expo-router";

import { ReferenceScreenHeader } from "../ui-v2/reference-screen-header";

/**
 * Adaptador de navegação das referências ACLS existentes.
 * router.back() retorna para onde o usuário estava, preservando o estado do PCR.
 *
 * `label` no formato "ACLS · Título" é dividido em sobretítulo + título grande.
 */
export default function ReferenceBackHeader({ label }: { label: string }) {
  const router = useRouter();

  const parts = label.split("·").map((p) => p.trim());
  const eyebrow = parts.length > 1 ? parts[0] : "ACLS";
  const title = parts.length > 1 ? parts.slice(1).join(" · ") : label;

  return (
    <ReferenceScreenHeader title={title} category={eyebrow} onBack={() => router.back()} />
  );
}
