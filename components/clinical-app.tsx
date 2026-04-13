import { useEffect, useState } from "react";
import * as defaultEngine from "../engine";
import type { ClinicalEngine } from "../clinical-engine";
import { preloadWebAudio } from "./audio-session";
import ConsentScreen from "./consent-screen";
import SepsisConsentScreen from "./sepsis-consent-screen";
import EapConsentScreen from "./eap-consent-screen";
import DkaHhsConsentScreen from "./dka-hhs-consent-screen";
import VentilationConsentScreen from "./ventilation-consent-screen";
import AnafilaxiaConsentScreen from "./anafilaxia-consent-screen";
import ProtocolScreen from "./protocol-screen";
import VasoactiveCalculatorScreen from "./protocol-screen/vasoactive-calculator-screen";
import RsiProtocolScreen from "./protocol-screen/rsi-protocol-screen";
import AclsRhythmsScreen from "./protocol-screen/acls-rhythms-screen";
import AclsPharmacologyScreen from "./protocol-screen/acls-pharmacology-screen";
import AclsBradycardiaScreen from "./protocol-screen/acls-bradycardia-screen";
import AclsTachycardiaScreen from "./protocol-screen/acls-tachycardia-screen";
import AclsReversibleCausesScreen from "./protocol-screen/acls-reversible-causes-screen";
import AclsPostRoscScreen from "./protocol-screen/acls-post-rosc-screen";
import {
  consumeProtocolSessionResume,
  isProtocolSessionMarkedForResume,
} from "../lib/module-session-navigation";
import { clearProtocolUiState } from "../lib/module-ui-state";

type ClinicalAppProps = {
  engine?: ClinicalEngine;
  onRouteBack?: () => void;
};

export default function ClinicalApp({
  engine = defaultEngine as ClinicalEngine,
  onRouteBack,
}: ClinicalAppProps) {
  const protocolId = engine.getEncounterSummary().protocolId;
  const [resumeSession] = useState(() => consumeProtocolSessionResume(protocolId));
  const [acceptedConsent, setAcceptedConsent] = useState(resumeSession);
  const isSepsisModule = protocolId === "sepse_adulto";
  const isVasoactiveModule = protocolId === "drogas_vasoativas";
  const isRsiModule = protocolId === "isr_rapida";
  const isEapModule = protocolId === "edema_agudo_pulmao";
  const isDkaHhsModule = protocolId === "cetoacidose_hiperosmolar";
  const isVentilationModule = protocolId === "ventilacao_mecanica";
  const isAnafilaxiaModule = protocolId === "anafilaxia";
  const isAclsRhythmsModule = protocolId === "ritmos_acls";
  const isAclsPharmacologyModule = protocolId === "farmacologia_acls";
  const isAclsBradycardiaModule = protocolId === "bradicardia_acls";
  const isAclsTachycardiaModule = protocolId === "taquicardia_acls";
  const isAclsReversibleCausesModule = protocolId === "causas_reversiveis_acls";
  const isAclsPostRoscModule = protocolId === "pos_pcr_acls";

  useEffect(() => {
    preloadWebAudio();
  }, []);

  useEffect(() => {
    if (!resumeSession) {
      clearProtocolUiState(protocolId);
      engine.resetSession?.();
    }

    return () => {
      if (!isProtocolSessionMarkedForResume(protocolId)) {
        clearProtocolUiState(protocolId);
        engine.resetSession?.();
      }
    };
  }, [engine, protocolId, resumeSession]);

  // Vasoactive calculator: render directly, no consent gate, no voice machinery
  if (isVasoactiveModule) {
    return <VasoactiveCalculatorScreen />;
  }

  // ISR (rapid sequence intubation): clinical reference flow, no voice
  if (isRsiModule) {
    return <RsiProtocolScreen />;
  }

  // ACLS Rhythms: static reference screen, no consent gate, no voice
  if (isAclsRhythmsModule) {
    return <AclsRhythmsScreen />;
  }

  // ACLS Pharmacology: static reference screen, no consent gate, no voice
  if (isAclsPharmacologyModule) {
    return <AclsPharmacologyScreen />;
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
  if (isAclsReversibleCausesModule) {
    return <AclsReversibleCausesScreen />;
  }

  // ACLS Post-ROSC care: static reference screen, no consent gate, no voice
  if (isAclsPostRoscModule) {
    return <AclsPostRoscScreen />;
  }

  if (!acceptedConsent) {
    if (isSepsisModule) {
      return <SepsisConsentScreen onAccept={() => setAcceptedConsent(true)} />;
    }
    if (isEapModule) {
      return <EapConsentScreen onAccept={() => setAcceptedConsent(true)} />;
    }
    if (isDkaHhsModule) {
      return <DkaHhsConsentScreen onAccept={() => setAcceptedConsent(true)} />;
    }
    if (isVentilationModule) {
      return <VentilationConsentScreen onAccept={() => setAcceptedConsent(true)} />;
    }
    if (isAnafilaxiaModule) {
      return <AnafilaxiaConsentScreen onAccept={() => setAcceptedConsent(true)} />;
    }
    return <ConsentScreen onAccept={() => setAcceptedConsent(true)} />;
  }

  return <ProtocolScreen engine={engine} onRouteBack={onRouteBack} />;
}
