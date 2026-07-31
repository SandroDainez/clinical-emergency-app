import { useEffect, useState } from "react";
import * as defaultEngine from "../engine";
import type { ClinicalEngine } from "../clinical-engine";
import { preloadWebAudio } from "./audio-session";
import AnafilaxiaFlowScreen from "./protocol-screen/anafilaxia-flow-screen";
import ProtocolScreen from "./protocol-screen";
import VasoactiveCalculatorScreen from "./protocol-screen/vasoactive-calculator-screen";
import ElectrolyteCalculatorScreen from "./protocol-screen/electrolyte-calculator-screen";
import RsiFlowScreen from "./protocol-screen/rsi-flow-screen";
import AvcFlowScreen from "./protocol-screen/avc-flow-screen";
import CoronaryFlowScreen from "./protocol-screen/coronary-flow-screen";
import SepsisFlowScreen from "./protocol-screen/sepsis-flow-screen";
import EapFlowScreen from "./protocol-screen/eap-flow-screen";
import DkaHhsFlowScreen from "./protocol-screen/dka-hhs-flow-screen";
import VentilationFlowScreen from "./protocol-screen/ventilation-flow-screen";
import TepFlowScreen from "./protocol-screen/tep-flow-screen";
import EclampsiaFlowScreen from "./protocol-screen/eclampsia-flow-screen";
import SedationCalculatorScreen from "./protocol-screen/sedation-calculator-screen";
import ClinicalCalculatorsScreen from "./protocol-screen/clinical-calculators-screen";
import ShockFlowScreen from "./protocol-screen/shock-flow-screen";
import DyspneaFlowScreen from "./protocol-screen/dyspnea-flow-screen";
import PolitraumaFlowScreen from "./protocol-screen/politrauma-flow-screen";
import TceFlowScreen from "./protocol-screen/tce-flow-screen";
import SeizureFlowScreen from "./protocol-screen/seizure-flow-screen";
import PoisoningFlowScreen from "./protocol-screen/poisoning-flow-screen";
import AcuteAbdomenFlowScreen from "./protocol-screen/acute-abdomen-flow-screen";
import AclsRhythmsScreen from "./protocol-screen/acls-rhythms-screen";
import AclsRhythmsScreenV2 from "./protocol-screen/acls-rhythms-screen-v2";
import AclsPharmacologyScreenV2 from "./protocol-screen/acls-pharmacology-screen-v2";
import AclsPostRoscScreenV2 from "./protocol-screen/acls-post-rosc-screen-v2";
import AclsReversibleCausesScreenV2 from "./protocol-screen/acls-reversible-causes-screen-v2";
import { useUiV2Enabled } from "../lib/ui-v2-flag";
import AclsPharmacologyScreen from "./protocol-screen/acls-pharmacology-screen";
import AclsBradycardiaScreen from "./protocol-screen/acls-bradycardia-screen";
import AclsTachycardiaScreen from "./protocol-screen/acls-tachycardia-screen";
import AclsReversibleCausesScreen from "./protocol-screen/acls-reversible-causes-screen";
import AclsPostRoscScreen from "./protocol-screen/acls-post-rosc-screen";
import AclsPregnancyScreen from "./protocol-screen/acls-pregnancy-screen";
import AclsChokingScreen from "./protocol-screen/acls-choking-screen";
import {
  consumeProtocolSessionResume,
  isProtocolSessionMarkedForResume,
} from "../lib/module-session-navigation";
import { clearProtocolUiState } from "../lib/module-ui-state";

type ClinicalAppProps = {
  engine?: ClinicalEngine;
  onRouteBack?: () => void;
  initialReferralFields?: Record<string, string>;
};

export default function ClinicalApp({
  engine = defaultEngine as ClinicalEngine,
  onRouteBack,
  initialReferralFields,
}: ClinicalAppProps) {
  const protocolId = engine.getEncounterSummary().protocolId;
  const [resumeSession] = useState(() => consumeProtocolSessionResume(protocolId));
  const isSepsisModule = protocolId === "sepse_adulto";
  const isVasoactiveModule = protocolId === "drogas_vasoativas";
  const isElectrolyteModule = protocolId === "correcoes_eletroliticas";
  const isRsiModule = protocolId === "isr_rapida";
  const isEapModule = protocolId === "edema_agudo_pulmao";
  const isDkaHhsModule = protocolId === "cetoacidose_hiperosmolar";
  const isVentilationModule = protocolId === "ventilacao_mecanica";
  const isAnafilaxiaModule = protocolId === "anafilaxia";
  const isAvcModule = protocolId === "acidente_vascular_cerebral";
  const isCoronaryModule = protocolId === "sindromes_coronarianas";
  const isTepModule = protocolId === "tromboembolia_pulmonar";
  const isEclampsiaModule = protocolId === "pre_eclampsia_eclampsia";
  const isSedationModule = protocolId === "sedoanalgesia";
  const isCalculatorsModule = protocolId === "calculadoras_clinicas";
  const isShockFlowModule = protocolId === "choque";
  const isDyspneaFlowModule = protocolId === "insuficiencia_respiratoria";
  const isPolitraumaModule = protocolId === "politrauma";
  const isTceModule = protocolId === "tce";
  const isSeizureModule = protocolId === "mal_epileptico";
  const isPoisoningModule = protocolId === "intoxicacoes_exogenas";
  const isAcuteAbdomenModule = protocolId === "abdome_agudo";
  const isAclsRhythmsModule = protocolId === "ritmos_acls";
  // Hook: precisa ficar no topo do componente, nunca dentro de condicional.
  const ritmosEmV2 = useUiV2Enabled("ritmos-acls");
  const farmacologiaEmV2 = useUiV2Enabled("farmacologia-acls");
  const posPcrEmV2 = useUiV2Enabled("pos-pcr-acls");
  const causasEmV2 = useUiV2Enabled("causas-reversiveis-acls");
  const isAclsPharmacologyModule = protocolId === "farmacologia_acls";
  const isAclsBradycardiaModule = protocolId === "bradicardia_acls";
  const isAclsTachycardiaModule = protocolId === "taquicardia_acls";
  const isAclsReversibleCausesModule = protocolId === "causas_reversiveis_acls";
  const isAclsPostRoscModule = protocolId === "pos_pcr_acls";
  const isAclsPregnancyModule = protocolId === "pcr_gestacao_acls";
  const isAclsChokingModule = protocolId === "ovace_adulto";

  useEffect(() => {
    preloadWebAudio();
  }, []);

  useEffect(() => {
    if (!resumeSession) {
      clearProtocolUiState(protocolId);
      engine.resetSession?.();

      if (initialReferralFields && engine.updateAuxiliaryField) {
        for (const [fieldId, value] of Object.entries(initialReferralFields)) {
          if (value.trim()) {
            engine.updateAuxiliaryField(fieldId, value);
          }
        }
      }
    }

    return () => {
      if (!isProtocolSessionMarkedForResume(protocolId)) {
        clearProtocolUiState(protocolId);
        engine.resetSession?.();
      }
    };
  }, [engine, initialReferralFields, protocolId, resumeSession]);

  // Raciocínio clínico (fluxos de referência) — sem consent gate, sem voz
  if (isShockFlowModule) {
    return <ShockFlowScreen />;
  }
  if (isDyspneaFlowModule) {
    return <DyspneaFlowScreen />;
  }
  if (isPolitraumaModule) {
    return <PolitraumaFlowScreen />;
  }
  if (isTceModule) {
    return <TceFlowScreen />;
  }
  if (isSeizureModule) {
    return <SeizureFlowScreen />;
  }
  if (isPoisoningModule) {
    return <PoisoningFlowScreen />;
  }
  if (isAcuteAbdomenModule) {
    return <AcuteAbdomenFlowScreen />;
  }

  // ACLS Rhythms: static reference screen, no consent gate, no voice.
  //
  // Piloto da migração UI 2.0 (Fase 3). A versão nova só entra com a flag
  // ligada; sem ela, nada muda para quem usa o app. As duas consomem o MESMO
  // conteúdo clínico (RHYTHM_GROUPS vem do arquivo antigo) e o mesmo
  // ReferenceBackHeader, então navegação e texto são idênticos — o que muda é a
  // apresentação. Remover a versão antiga é a Fase 9, não agora.
  if (isAclsRhythmsModule) {
    // onRouteBack é o goBackTarget de app/modulos/[id].tsx — a MESMA função que o
    // cromado do módulo usava, com o handoff de via aérea. A tela migrada passa a
    // exibi-la no seu cabeçalho de uma linha; a lógica não muda.
    return ritmosEmV2 ? <AclsRhythmsScreenV2 onVoltar={onRouteBack} /> : <AclsRhythmsScreen />;
  }

  // ACLS Pharmacology: static reference screen, no consent gate, no voice.
  // Migrado na Fase 6 — mesmo padrão do piloto, atrás da flag.
  if (isAclsPharmacologyModule) {
    return farmacologiaEmV2 ? (
      <AclsPharmacologyScreenV2 onVoltar={onRouteBack} />
    ) : (
      <AclsPharmacologyScreen />
    );
  }

  // ACLS Bradycardia: static reference screen, no consent gate, no voice
  if (isAclsBradycardiaModule) {
    return <AclsBradycardiaScreen />;
  }

  // ACLS Tachycardia: static reference screen, no consent gate, no voice
  if (isAclsTachycardiaModule) {
    return <AclsTachycardiaScreen />;
  }

  // ACLS Reversible Causes (5Hs 5Ts): static reference screen, no consent gate, no voice
  if (isAclsChokingModule) {
    return <AclsChokingScreen />;
  }
  if (isAclsPregnancyModule) {
    return <AclsPregnancyScreen />;
  }
  if (isAclsReversibleCausesModule) {
    return causasEmV2 ? (
      <AclsReversibleCausesScreenV2 onVoltar={onRouteBack} />
    ) : (
      <AclsReversibleCausesScreen />
    );
  }

  // ACLS Post-ROSC care: static reference screen, no consent gate, no voice
  if (isAclsPostRoscModule) {
    return posPcrEmV2 ? <AclsPostRoscScreenV2 onVoltar={onRouteBack} /> : <AclsPostRoscScreen />;
  }

  if (isVasoactiveModule) {
    return <VasoactiveCalculatorScreen />;
  }

  if (isElectrolyteModule) {
    return <ElectrolyteCalculatorScreen />;
  }

  if (isRsiModule) {
    return <RsiFlowScreen />;
  }

  if (isAnafilaxiaModule) {
    return <AnafilaxiaFlowScreen />;
  }

  if (isAvcModule) {
    return <AvcFlowScreen />;
  }

  if (isCoronaryModule) {
    return <CoronaryFlowScreen />;
  }

  if (isSepsisModule) {
    return <SepsisFlowScreen />;
  }

  if (isEapModule) {
    return <EapFlowScreen />;
  }

  if (isDkaHhsModule) {
    return <DkaHhsFlowScreen />;
  }

  if (isVentilationModule) {
    return <VentilationFlowScreen />;
  }

  if (isTepModule) {
    return <TepFlowScreen />;
  }

  if (isEclampsiaModule) {
    return <EclampsiaFlowScreen />;
  }

  if (isSedationModule) {
    return <SedationCalculatorScreen />;
  }

  if (isCalculatorsModule) {
    return <ClinicalCalculatorsScreen />;
  }

  return <ProtocolScreen engine={engine} onRouteBack={onRouteBack} />;
}
