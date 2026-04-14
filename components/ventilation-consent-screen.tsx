import ModuleIntroScreen from "./module-intro-screen";

type Props = { onAccept: () => void };

export default function VentilationConsentScreen({ onAccept }: Props) {
  return (
    <ModuleIntroScreen
      badge="Ventilação mecânica"
      title="Regulagem com explicação passo a passo"
      subtitle="Informe cenário clínico, peso, altura e parâmetros do ventilador. O app calcula metas e explica o que ajustar na máquina."
      features={[
        { icon: "🧮", text: "Peso predito (PBW) e relação Vt/kg para estratégia protetora" },
        { icon: "🎯", text: "Cenários: ARDS, obstrutivo, pós-operatório, neuro e acidose metabólica" },
        { icon: "📟", text: "Passo a passo no monitor do ventilador, com alarmes e reavaliação" },
      ]}
      disclaimer="Conteúdo educativo; não substitui prescrição médica, fisioterapia especializada nem protocolo da unidade."
      actionLabel="Iniciar atendimento"
      actionHint="Abrir assistente de VM"
      onAccept={onAccept}
    />
  );
}
