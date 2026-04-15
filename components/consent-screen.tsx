import ModuleIntroScreen from "./module-intro-screen";

type ConsentScreenProps = {
  onAccept: () => void;
};

export default function ConsentScreen({ onAccept }: ConsentScreenProps) {
  return (
    <ModuleIntroScreen
      badge="Módulo ACLS"
      title="Apoio à decisão clínica"
      subtitle="Interface de referência para uso na emergência, com foco em conduta rápida, documentação e revisão do caso."
      features={[
        { icon: "⚡", text: "Fluxos organizados para decisão rápida à beira-leito" },
        { icon: "📝", text: "Registro de marcos clínicos e documentação do atendimento" },
        { icon: "📚", text: "Referência visual alinhada às rotinas do aplicativo" },
      ]}
      disclaimer="Este aplicativo é uma ferramenta de apoio à decisão clínica. As recomendações não substituem o julgamento médico. A decisão final é do profissional assistente."
      actionLabel="Entrar no módulo"
      actionHint="Interface para uso na emergência"
      onAccept={onAccept}
    />
  );
}
