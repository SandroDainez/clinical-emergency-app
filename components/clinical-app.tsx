import { useEffect, useState } from "react";
import * as defaultEngine from "../engine";
import type { ClinicalEngine } from "../clinical-engine";
import { preloadWebAudio } from "./audio-session";
import ConsentScreen from "./consent-screen";
import ProtocolScreen from "./protocol-screen";

type ClinicalAppProps = {
  engine?: ClinicalEngine;
};

export default function ClinicalApp({ engine = defaultEngine as ClinicalEngine }: ClinicalAppProps) {
  const [acceptedConsent, setAcceptedConsent] = useState(false);

  useEffect(() => {
    preloadWebAudio();
  }, []);

  function handleAcceptConsent() {
    setAcceptedConsent(true);
  }

  if (!acceptedConsent) {
    return <ConsentScreen onAccept={handleAcceptConsent} />;
  }

  return <ProtocolScreen engine={engine} />;
}
