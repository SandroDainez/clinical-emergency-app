import ModuleIntroScreen from "./module-intro-screen";

type Props = { onAccept: () => void };

export default function AvcConsentScreen({ onAccept }: Props) {
  return (
    <ModuleIntroScreen
      badge="Neurologia de emergência"
      title="AVC isquêmico e hemorrágico"
      subtitle="Fluxo completo desde a chegada até o destino final, com NIHSS item a item, imagem, elegibilidade para reperfusão, cálculo de trombolítico, bloqueios de segurança e trilha de auditoria."
      features={[
        { icon: "⏱", text: "Linha do tempo crítica: LKW, chegada, imagem, decisão e reperfusão" },
        { icon: "🧠", text: "NIHSS completo, contraindicações categorizadas e justificativas visíveis" },
        { icon: "💉", text: "Cálculo configurável de alteplase / tenecteplase e fluxo separado para hemorragia" },
      ]}
      disclaimer="Ferramenta de apoio à decisão clínica. Nunca substitui protocolo institucional, neurologia de plantão e julgamento médico final."
      actionLabel="Iniciar fluxo AVC"
      actionHint="Abrir módulo completo de AVC"
      onAccept={onAccept}
    />
  );
}
