import type { Href } from "expo-router";
import type { Router } from "expo-router";

import { logClinicalSessionEvent } from "./clinical-events";
import { setCurrentClinicalSessionId } from "./clinical-session-store";
import { startClinicalSession } from "./clinical";

/**
 * Abre um módulo clínico: inicia sessão ACLS quando aplicável, regista evento e navega.
 */
export async function openClinicalModule(router: Router, moduleId: string, route: Href): Promise<void> {
  if (moduleId !== "pcr-adulto") {
    router.push(route);
    return;
  }

  const { data, error } = await startClinicalSession("acls_adulto");
  if (error) {
    console.error("Falha ao iniciar sessão clínica", error);
    setCurrentClinicalSessionId(null);
    router.push(route);
    return;
  }

  const sessionId = data?.id ?? data?.session_id;
  if (!sessionId) {
    console.error("ID da sessão não retornado");
    setCurrentClinicalSessionId(null);
    router.push(route);
    return;
  }

  setCurrentClinicalSessionId(sessionId);

  const { error: eventError } = await logClinicalSessionEvent(
    sessionId,
    "protocol_opened",
    "Protocolo ACLS aberto",
    {
      module_key: "acls_adulto",
    }
  );

  if (eventError) {
    console.error("Falha ao registrar evento de sessão clínica", eventError);
  }

  router.push(route);
}
