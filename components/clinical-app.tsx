import { useEffect, useState } from "react";
import * as defaultEngine from "../engine";
import type { AclsMode, ClinicalEngine } from "../clinical-engine";
import { preloadWebAudio } from "./audio-session";
import ConsentScreen from "./consent-screen";
import ProtocolScreen from "./protocol-screen";

type ClinicalAppProps = {
  engine?: ClinicalEngine;
  onRouteBack?: () => void;
};

export default function ClinicalApp({
  engine = defaultEngine as ClinicalEngine,
  onRouteBack,
}: ClinicalAppProps) {
  const [acceptedConsent, setAcceptedConsent] = useState(false);
  const [initialAclsMode, setInitialAclsMode] = useState<AclsMode>("code");

  useEffect(() => {
    preloadWebAudio();
  }, []);

  useEffect(() => {
    engine.resetSession?.();

    return () => {
      engine.resetSession?.();
    };
  }, [engine]);

  function handleAcceptConsent(mode: AclsMode = "code") {
    setInitialAclsMode(mode);
    setAcceptedConsent(true);
  }

  if (!acceptedConsent) {
    return <ConsentScreen onAccept={handleAcceptConsent} />;
  }

  return <ProtocolScreen engine={engine} onRouteBack={onRouteBack} initialAclsMode={initialAclsMode} />;
}
