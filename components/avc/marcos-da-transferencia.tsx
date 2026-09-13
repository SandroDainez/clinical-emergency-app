/**
 * MARCOS DE REGISTRO — transferência (11ª rodada) ⛔ e teleconsulta (AC-72, 12ª rodada).
 *
 * ⚠️ ⛔ Seletor de estado sugeria que se ESCOLHE um marco; ⚠️ marcos ACONTECEM. A ação é
 * «Registrar marco» (tipo + quando aconteceu) ⛔ e, abaixo, a lista dos já registrados.
 *
 * ⚠️ AC-69 · DOIS HORÁRIOS: «aconteceu às» (observado, editável por correção auditada)
 * ⛔ e «registrado às» (preservado). ⚠️ Cada marco tem a sua correção: horário ⛔ ou
 * "registrado por engano" — ⛔ nunca limpeza do conjunto.
 *
 * ⚠️ O horário de um marco é OBSERVADO: o seletor mantém o teto em agora (AC-71).
 *
 * ⚠️ AC-72 · «Parecer registrado» da teleconsulta exige texto ⛔ e autor antes do horário.
 *
 * ⚠️ «Aconteceu agora» é escolha explícita do médico, ⛔ e ⛔ não padrão silencioso: o
 * seletor de hora continua exigindo toque para confirmar outro horário.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ESTADOS_DA_TELECONSULTA, ESTADOS_DA_TRANSFERENCIA } from "../../avc/conteudo/superficie-g";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import {
  marcosDaTeleconsulta,
  marcosDaTransferencia,
  PARECER_REGISTRADO,
} from "../../avc/nucleo/transferencia";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { ConfirmacaoDeEngano } from "./confirmacao-de-engano";
import SeletorDeHora from "./seletor-de-hora";

type Hora = { readonly instante: number; readonly selecionado: boolean };
type Parecer = { readonly texto: string; readonly autor: string };

const CONFIG = {
  transferencia: {
    tipos: ESTADOS_DA_TRANSFERENCIA as readonly string[],
    titulo: "Marcos da transferência",
    nota: "Cada marco entra na linha do tempo com o horário em que aconteceu e o horário em que foi registrado. Aceite só existe quando registrado.",
    campoTestID: "avc-campo-transf_marco",
    lista: "avc-g-marcos",
    registrar: "avc-g-registrar-marco",
    rotuloRegistrar: "Registrar marco",
    prefixo: "avc-g-marco",
  },
  teleconsulta: {
    tipos: ESTADOS_DA_TELECONSULTA as readonly string[],
    titulo: "Marcos da teleconsulta",
    nota: "Cada marco entra na linha do tempo com os dois horários. O parecer exige texto e autor.",
    campoTestID: "avc-campo-tele_marco",
    lista: "avc-g-tele-marcos",
    registrar: "avc-g-registrar-tele-marco",
    rotuloRegistrar: "Registrar marco da teleconsulta",
    prefixo: "avc-g-tele-marco",
  },
} as const;

function horaCurta(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function MarcosDaTransferencia({
  ator = "transferencia",
  estado,
  agora,
  onRegistrar,
  onCorrigirHora,
  onEngano,
}: {
  ator?: "transferencia" | "teleconsulta";
  estado: EstadoAvc;
  agora: number;
  onRegistrar: (tipo: string, observado: number, parecer?: Parecer) => void;
  onCorrigirHora: (fatoId: string, observado: number) => void;
  onEngano: (fatoId: string) => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const cfg = CONFIG[ator];
  const corDoPlaceholder = useEstilosDoTema((tema) => ({ cor: { color: tema.cores.textSecondary } })).cor
    .color as string;
  const marcos = ator === "teleconsulta" ? marcosDaTeleconsulta(estado) : marcosDaTransferencia(estado);
  const [registrando, setRegistrando] = useState(false);
  const [tipo, setTipo] = useState<string | undefined>(undefined);
  const [horaNova, setHoraNova] = useState<Hora | null>(null);
  const [parecer, setParecer] = useState<Parecer>({ texto: "", autor: "" });
  const [corrigindo, setCorrigindo] = useState<{ readonly fatoId: string; readonly hora: Hora } | null>(null);
  const [engano, setEngano] = useState<string | undefined>(undefined);

  const exigeParecer = ator === "teleconsulta" && tipo === PARECER_REGISTRADO;
  const parecerCompleto = parecer.texto.trim() !== "" && parecer.autor.trim() !== "";
  const podeRegistrar = !exigeParecer || parecerCompleto;

  const encerrar = () => {
    setRegistrando(false);
    setTipo(undefined);
    setHoraNova(null);
    setParecer({ texto: "", autor: "" });
  };
  const registrar = (observado: number) => {
    if (!podeRegistrar || tipo === undefined) return;
    onRegistrar(tipo, observado, exigeParecer ? parecer : undefined);
    encerrar();
  };

  return (
    <View style={e.raiz} testID={cfg.campoTestID}>
      <Text style={e.titulo}>{tr(cfg.titulo)}</Text>
      <Text style={e.nota}>{tr(cfg.nota)}</Text>

      <View style={e.lista} testID={cfg.lista}>
        {marcos.length === 0 ? <Text style={e.nota}>{tr("Nenhum marco registrado")}</Text> : null}
        {marcos.map((m) => (
          <View key={m.fatoId} style={e.item} testID={`${cfg.prefixo}-item-${m.fatoId}`}>
            <Text style={e.itemTipo}>{tr(m.tipo)}</Text>
            {m.parecer === undefined ? null : (
              <Text style={e.itemParecer}>
                {m.parecer.texto} — {m.parecer.autor}
              </Text>
            )}
            <Text style={e.itemHoras}>
              {tr("aconteceu às")} {horaCurta(m.observado)} · {tr("registrado às")} {horaCurta(m.registradoEm)}
              {m.horarioCorrigido ? ` · ${tr("horário corrigido")}` : ""}
            </Text>
            <View style={e.linha}>
              <Pressable
                style={e.botaoSecundario}
                accessibilityRole="button"
                testID={`${cfg.prefixo}-corrigir-hora-${m.fatoId}`}
                onPress={() => setCorrigindo({ fatoId: m.fatoId, hora: { instante: m.observado, selecionado: false } })}
              >
                <Text style={e.botaoSecundarioTexto}>{tr("Corrigir horário")}</Text>
              </Pressable>
              <Pressable
                style={e.botaoSecundario}
                accessibilityRole="button"
                testID={`${cfg.prefixo}-engano-${m.fatoId}`}
                onPress={() => setEngano(m.fatoId)}
              >
                <Text style={e.botaoSecundarioTexto}>{tr("Registrado por engano")}</Text>
              </Pressable>
            </View>
            {corrigindo?.fatoId === m.fatoId ? (
              <SeletorDeHora
                rotulo="Quando aconteceu"
                instante={corrigindo.hora.instante}
                selecionado={corrigindo.hora.selecionado}
                agora={agora}
                onMudar={(i, escolheu) =>
                  setCorrigindo((c) => (c === null ? c : { ...c, hora: { instante: i, selecionado: escolheu || c.hora.selecionado } }))
                }
                onConfirmar={() => {
                  onCorrigirHora(m.fatoId, corrigindo.hora.instante);
                  setCorrigindo(null);
                }}
                onCancelar={() => setCorrigindo(null)}
              />
            ) : null}
          </View>
        ))}
      </View>

      {!registrando ? (
        <Pressable style={e.botaoPrincipal} accessibilityRole="button" testID={cfg.registrar} onPress={() => setRegistrando(true)}>
          <Text style={e.botaoPrincipalTexto}>{tr(cfg.rotuloRegistrar)}</Text>
        </Pressable>
      ) : tipo === undefined ? (
        <View style={e.escolha}>
          <Text style={e.pergunta}>{tr("Qual marco aconteceu?")}</Text>
          <View style={e.linha}>
            {cfg.tipos.map((t) => (
              <Pressable key={t} style={e.botaoSecundario} accessibilityRole="button" testID={`${cfg.prefixo}-tipo-${t}`} onPress={() => setTipo(t)}>
                <Text style={e.botaoSecundarioTexto}>{tr(t)}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={e.botaoSecundario} accessibilityRole="button" testID={`${cfg.prefixo}-cancelar`} onPress={encerrar}>
            <Text style={e.botaoSecundarioTexto}>{tr("Cancelar")}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={e.escolha}>
          <Text style={e.pergunta}>
            {tr(tipo)}: {tr("quando aconteceu?")}
          </Text>
          {exigeParecer ? (
            <View style={e.escolha}>
              <Text style={e.nota}>{tr("O parecer exige texto e autor.")}</Text>
              <TextInput
                style={e.entrada}
                value={parecer.texto}
                onChangeText={(t) => setParecer((p) => ({ ...p, texto: t }))}
                placeholder={tr("Parecer (texto livre)")}
                placeholderTextColor={corDoPlaceholder}
                accessibilityLabel={tr("Parecer (texto livre)")}
                multiline
                testID="avc-g-tele-parecer-texto"
              />
              <TextInput
                style={e.entrada}
                value={parecer.autor}
                onChangeText={(t) => setParecer((p) => ({ ...p, autor: t }))}
                placeholder={tr("Autor do parecer")}
                placeholderTextColor={corDoPlaceholder}
                accessibilityLabel={tr("Autor do parecer")}
                testID="avc-g-tele-parecer-autor"
              />
            </View>
          ) : null}
          {horaNova === null ? (
            <View style={e.linha}>
              <Pressable
                style={[e.botaoSecundario, !podeRegistrar && e.inerte]}
                accessibilityRole="button"
                disabled={!podeRegistrar}
                aria-disabled={!podeRegistrar}
                testID={`${cfg.prefixo}-agora`}
                onPress={() => registrar(agora)}
              >
                <Text style={e.botaoSecundarioTexto}>{tr("Aconteceu agora")}</Text>
              </Pressable>
              <Pressable
                style={[e.botaoSecundario, !podeRegistrar && e.inerte]}
                accessibilityRole="button"
                disabled={!podeRegistrar}
                aria-disabled={!podeRegistrar}
                testID={`${cfg.prefixo}-informar-hora`}
                onPress={() => setHoraNova({ instante: agora, selecionado: false })}
              >
                <Text style={e.botaoSecundarioTexto}>{tr("Informar horário")}</Text>
              </Pressable>
              <Pressable style={e.botaoSecundario} accessibilityRole="button" testID={`${cfg.prefixo}-cancelar`} onPress={encerrar}>
                <Text style={e.botaoSecundarioTexto}>{tr("Cancelar")}</Text>
              </Pressable>
            </View>
          ) : (
            <SeletorDeHora
              rotulo="Quando aconteceu"
              instante={horaNova.instante}
              selecionado={horaNova.selecionado}
              agora={agora}
              onMudar={(i, escolheu) => setHoraNova((h) => ({ instante: i, selecionado: escolheu || (h?.selecionado ?? false) }))}
              onConfirmar={() => registrar(horaNova.instante)}
              onCancelar={() => setHoraNova(null)}
            />
          )}
        </View>
      )}

      <ConfirmacaoDeEngano
        aberto={engano !== undefined}
        titulo="Marco registrado por engano?"
        texto="O marco não é apagado: recebe correção com motivo «registrado por engano» e sai da linha do tempo. Os outros marcos não mudam."
        onManter={() => setEngano(undefined)}
        onCorrigir={() => {
          if (engano !== undefined) onEngano(engano);
          setEngano(undefined);
        }}
      />
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.sm },
    titulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    nota: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    lista: { gap: ESPACO.xs },
    item: {
      gap: ESPACO.xs,
      padding: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
      backgroundColor: tema.cores.surface,
    },
    itemTipo: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    itemParecer: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    itemHoras: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    linha: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    escolha: { gap: ESPACO.sm },
    pergunta: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    entrada: {
      ...PAPEL.textoPrincipal,
      color: tema.cores.text,
      minHeight: TOQUE.minimo,
      padding: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    inerte: { opacity: 0.5 },
    botaoSecundario: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    botaoSecundarioTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    botaoPrincipal: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.primaryFill,
      backgroundColor: tema.cores.primaryFill,
    },
    botaoPrincipalTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.onFill },
  });
