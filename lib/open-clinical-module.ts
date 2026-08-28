import type { Href } from "expo-router";
import type { Router } from "expo-router";

import { logClinicalSessionEvent } from "./clinical-events";
import { setCurrentClinicalSessionId } from "./clinical-session-store";
import { startClinicalSession } from "./clinical";

/**
 * Abre um módulo clínico: inicia sessão ACLS quando aplicável, regista evento e navega.
 */
export async function openClinicalModule(router: Router, moduleId: string, route: Href): Promise<void> {
  /**
   * ⚠️ O RAMO DO AVC SAIU EM 2026-08-27, com o módulo. Eram três linhas: o
   * `moduleId !== "avc"` da guarda, a `moduleKey` `"avc"` e o rótulo
   * « Guia AVC aberto ». Nenhuma delas era alcançável sem o módulo.
   *
   * ⚠️ A CHAVE `"avc"` ERA GRAVADA NO BANCO (`startClinicalSession`), então este
   * ramo tem lastro em dados históricos: sessões antigas continuam com ela. Ele
   * volta quando o AVC for reconstruído — e a chave deve ser a MESMA, para que a
   * série não se parta em duas.
   */
  if (moduleId !== "pcr-adulto") {
    router.push(route);
    return;
  }

  const moduleKey = "acls_adulto";
  const protocolOpenedLabel = "Guia ACLS aberto";
  const { data, error } = await startClinicalSession(moduleKey);
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
    protocolOpenedLabel,
    {
      module_key: moduleKey,
    }
  );

  if (eventError) {
    console.error("Falha ao registrar evento de sessão clínica", eventError);
  }

  router.push(route);
}
