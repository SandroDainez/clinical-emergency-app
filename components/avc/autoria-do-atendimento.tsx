/**
 * AUTORIA NA LINHA DO TEMPO — AC-40.
 *
 * ⚠️ A trilha clínica ⛔ não carrega autor: quem registrou cada fato está no LOG.
 * O hook do atendimento monta `autoriaPorFato`; as telas que mostram histórico ou
 * correção perguntam aqui e escrevem o texto de autoria (`useTextoDeAutoria`, AC-13 reaberto item 4).
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { rotuloDeAutoria, type Autoria } from "../../avc/persistencia/autoria";
import { useTr } from "../../lib/use-tr";

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

/**
 * AC-13 reaberto, item 4: o texto de autoria de um fato, a regra única de todas as telas. Com nome de exibição,
 * «Registrado por:» e o nome; sem nome, sem conta ou em evento antigo, «Autoria não identificada».
 */
export function useTextoDeAutoria(): (fatoId: string | undefined) => string {
  const autoriaDe = useAutoriaDoAtendimento();
  const tr = useTr();
  return (fatoId) => {
    const r = rotuloDeAutoria(autoriaDe(fatoId));
    return r.tipo === "nome" ? `${tr(r.rotulo)} ${r.nome}` : tr(r.rotulo);
  };
}
