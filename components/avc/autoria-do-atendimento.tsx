/**
 * AUTORIA NA LINHA DO TEMPO — AC-40.
 *
 * ⚠️ A trilha clínica ⛔ não carrega autor: quem registrou cada fato está no LOG.
 * O hook do atendimento monta `autoriaPorFato`; as telas que mostram histórico ou
 * correção perguntam aqui ⛔ e escrevem a marca (`marcaDeAutoria`).
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Autoria } from "../../avc/persistencia/autoria";

type AutoriaDe = (fatoId: string | undefined) => Autoria | undefined;

const nenhuma: AutoriaDe = () => undefined;
const Contexto = createContext<AutoriaDe>(nenhuma);

export function ProvedorDeAutoria({
  autoriaPorFato,
  children,
}: {
  autoriaPorFato: Readonly<Record<string, Autoria>>;
  children: ReactNode;
}) {
  const autoriaDe = useMemo<AutoriaDe>(
    () => (fatoId) => (fatoId === undefined ? undefined : autoriaPorFato[fatoId]),
    [autoriaPorFato]
  );
  return <Contexto.Provider value={autoriaDe}>{children}</Contexto.Provider>;
}

export function useAutoriaDoAtendimento(): AutoriaDe {
  return useContext(Contexto);
}
