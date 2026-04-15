import ModuleIntroScreen from "./module-intro-screen";

type Props = { onAccept: () => void };

export default function DkaHhsConsentScreen({ onAccept }: Props) {
  return (
    <ModuleIntroScreen
      badge="CAD e estado hiperosmolar"
      title="Cetoacidose vs hiperosmolar"
      subtitle="Roteiro completo de emergência em etapas, com classificação automática e condutas por quadro."
      features={[
        { icon: "🔀", text: "Diferencia CAD de EHH com foco em acidose, cetose e hiperosmolaridade" },
        { icon: "📊", text: "PAM, osmolaridade estimada e gap aniônico no painel" },
        { icon: "🚑", text: "Primeiros minutos: SpO₂, acesso venoso, ECG e registro do que foi feito" },
        { icon: "📋", text: "Tratamento: volume, insulina, potássio e alertas críticos" },
      ]}
      disclaimer="Referência alinhada a diretrizes tipo ADA; ajustar ao protocolo institucional e ao paciente."
      actionLabel="Iniciar atendimento"
      actionHint="Abrir roteiro CAD / EHH"
      onAccept={onAccept}
    />
  );
}
