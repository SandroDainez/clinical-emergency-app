import ModuleIntroScreen from "./module-intro-screen";

type Props = { onAccept: () => void };

export default function CoronaryConsentScreen({ onAccept }: Props) {
  return (
    <ModuleIntroScreen
      badge="Cardiologia clínica e emergência"
      title="Síndromes coronarianas"
      subtitle="Fluxo guiado para dor torácica, STEMI, NSTEMI, angina instável e angina estável / DAC crônica, com ECG estruturado, troponina seriada, scores, estratégia de reperfusão, medicações iniciais e destino."
      features={[
        { icon: "⏱", text: "Timeline crítica: dor, chegada, primeiro ECG, troponina, decisão e reperfusão" },
        { icon: "📈", text: "Leitura estruturada de ECG, troponina e estratificação por HEART, TIMI, GRACE e Killip" },
        { icon: "💉", text: "Checagem de contraindicações, cálculo de trombólise/anticoagulação e templates de prescrição" },
      ]}
      disclaimer="Ferramenta de apoio. Nunca substitui protocolo institucional, cardiologia/intervenção e julgamento médico final."
      actionLabel="Iniciar módulo coronariano"
      actionHint="Abrir fluxo completo de síndromes coronarianas"
      onAccept={onAccept}
    />
  );
}
