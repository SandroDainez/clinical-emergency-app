/**
 * PAINEL DE MÓDULO INDISPONÍVEL — contrato de navegação (C05; autor, 2026-09-13, 13ª rodada).
 *
 * ⚠️ O destino chamado ⛔ está implementado neste app. O painel DIZ isso ⛔ e oferece só o
 * registro estruturado da conduta externa (o que a equipe fez fora do app) — ⛔ nenhum
 * botão aparenta executar intervenção, ⛔ nenhum fármaco, dose ⛔ ou parâmetro.
 *
 * ⚠️ Mostra a pilha (AVC › Via aérea › …), os cuidados associados como chamadas aninhadas,
 * «Voltar para …» (retorno com o que foi registrado) ⛔ e «Cancelar chamada» (retorno sem
 * resposta; o que já foi registrado continua na trilha).
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { valorDaOpcao } from "../../avc/conteudo/campo";
import { moduloChamavel } from "../../avc/conteudo/modulos-chamaveis";
import { CAMPOS_DA_VIA_AEREA_EXTERNA } from "../../avc/conteudo/via-aerea-externa";
import type { ChamadaAberta } from "../../avc/nucleo/chamadas";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { leituraDaViaAereaExterna, type RegistroDeViaAerea } from "../../avc/nucleo/via-aerea-externa";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import SeletorDeHora from "./seletor-de-hora";

type Rascunho = {
  -readonly [K in keyof RegistroDeViaAerea]?: RegistroDeViaAerea[K];
};

function horaCurta(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const CHAVE: Readonly<Record<string, keyof RegistroDeViaAerea>> = {
  va_definitiva: "definitiva",
  va_tipo: "tipo",
  va_hora: "observado",
  va_quem: "quem",
  va_sedacao: "sedacao",
  va_ventilacao: "ventilacao",
};

export function ModuloIndisponivel({
  chamada,
  pilha,
  estado,
  obterAgora,
  onRegistrar,
  onChamar,
  onVoltar,
  onCancelar,
}: {
  chamada: ChamadaAberta;
  pilha: readonly ChamadaAberta[];
  estado: EstadoAvc;
  obterAgora: () => number;
  onRegistrar: (registro: RegistroDeViaAerea) => void;
  onChamar: (destino: string) => void;
  onVoltar: () => void;
  onCancelar: () => void;
}) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const corDoPlaceholder = useEstilosDoTema((tema) => ({ cor: { color: tema.cores.textSecondary } })).cor
    .color as string;
  const modulo = moduloChamavel(chamada.destino);
  const [rascunho, setRascunho] = useState<Rascunho>({});
  const [hora, setHora] = useState<{ instante: number; selecionado: boolean } | null>(null);
  const [registrado, setRegistrado] = useState(false);
  const leitura = leituraDaViaAereaExterna(estado);
  if (modulo === undefined) return null;

  const trilha = ["AVC", ...pilha.map((c) => moduloChamavel(c.destino)?.nome ?? c.destino)];
  const origem = chamada.origem.modulo === "avc" ? "AVC" : moduloChamavel(chamada.origem.modulo)?.nome ?? chamada.origem.modulo;
  const mudar = (chave: keyof RegistroDeViaAerea, valor: unknown) => {
    setRascunho((r) => ({ ...r, [chave]: valor }));
    setRegistrado(false);
  };
  const vazio = Object.values(rascunho).every((v) => v === undefined || v === "");

  return (
    <View style={e.raiz} testID={`avc-modulo-indisponivel-${modulo.id}`}>
      <Text style={e.pilha} testID="avc-modulo-pilha">{trilha.map((n) => tr(n)).join(" › ")}</Text>
      <Text style={e.titulo}>
        {tr(modulo.nome)} — {tr("indisponível neste app")}
      </Text>
      <Text style={e.texto}>
        {tr("Este módulo não está implementado neste app. Nada aqui executa ou orienta a intervenção: registre o que a equipe fez fora do app, sem fármaco, dose ou parâmetro.")}
      </Text>

      <View style={e.bloco}>
        <Text style={e.subtitulo}>{tr("Conduta externa registrada pela equipe")}</Text>
        {CAMPOS_DA_VIA_AEREA_EXTERNA.map((campo) => {
          if (!modulo.campos.includes(campo.id)) return null;
          const chave = CHAVE[campo.id];
          if (campo.tipo === "texto") {
            return (
              <View key={campo.id} style={e.campo}>
                <Text style={e.rotulo}>{tr(campo.rotulo)}</Text>
                <TextInput
                  style={e.entrada}
                  value={String(rascunho.quem ?? "")}
                  onChangeText={(t) => mudar(chave, t)}
                  placeholder={tr("não informado")}
                  placeholderTextColor={corDoPlaceholder}
                  accessibilityLabel={tr(campo.rotulo)}
                  testID="avc-va-quem"
                />
              </View>
            );
          }
          if (campo.tipo === "hora") {
            const escolhido = rascunho.observado;
            return (
              <View key={campo.id} style={e.campo}>
                <Text style={e.rotulo}>
                  {tr(campo.rotulo)}
                  {typeof escolhido === "number" ? ` · ${horaCurta(escolhido)}` : escolhido === "nao_sei" ? ` · ${tr("Não sei")}` : ""}
                </Text>
                <View style={e.linha}>
                  <Pressable style={e.opcao} accessibilityRole="button" testID="avc-va-hora-agora" onPress={() => mudar(chave, obterAgora())}>
                    <Text style={e.opcaoTexto}>{tr("Aconteceu agora")}</Text>
                  </Pressable>
                  <Pressable style={e.opcao} accessibilityRole="button" testID="avc-va-hora-informar" onPress={() => setHora({ instante: obterAgora(), selecionado: false })}>
                    <Text style={e.opcaoTexto}>{tr("Informar horário")}</Text>
                  </Pressable>
                  <Pressable style={e.opcao} accessibilityRole="button" testID="avc-va-hora-nao-sei" onPress={() => mudar(chave, "nao_sei")}>
                    <Text style={e.opcaoTexto}>{tr("Não sei")}</Text>
                  </Pressable>
                </View>
                {hora !== null ? (
                  <SeletorDeHora
                    rotulo={campo.rotulo}
                    instante={hora.instante}
                    selecionado={hora.selecionado}
                    agora={obterAgora()}
                    onMudar={(i, escolheu) => setHora((h) => ({ instante: i, selecionado: escolheu || (h?.selecionado ?? false) }))}
                    onConfirmar={() => {
                      mudar(chave, hora.instante);
                      setHora(null);
                    }}
                    onCancelar={() => setHora(null)}
                  />
                ) : null}
              </View>
            );
          }
          return (
            <View key={campo.id} style={e.campo}>
              <Text style={e.rotulo}>{tr(campo.rotulo)}</Text>
              <View style={e.linha}>
                {(campo.opcoes ?? []).map((op) => {
                  const valor = valorDaOpcao(op);
                  const marcada = rascunho[chave] === (campo.id === "va_tipo" ? op : valor);
                  return (
                    <Pressable
                      key={op}
                      style={[e.opcao, marcada ? e.opcaoMarcada : null]}
                      accessibilityRole="radio"
                      aria-checked={marcada}
                      testID={`avc-va-${campo.id}-${valor}`}
                      onPress={() => mudar(chave, campo.id === "va_tipo" ? op : valor)}
                    >
                      <Text style={e.opcaoTexto}>
                        {marcada ? "✓ " : ""}
                        {tr(op)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
        <Pressable
          style={[e.principal, vazio ? e.inerte : null]}
          accessibilityRole="button"
          disabled={vazio}
          aria-disabled={vazio}
          testID="avc-va-registrar"
          onPress={() => {
            onRegistrar(rascunho);
            setRascunho({});
            setRegistrado(true);
          }}
        >
          <Text style={e.principalTexto}>{tr("Registrar conduta externa")}</Text>
        </Pressable>
        {registrado ? (
          <Text style={e.texto} testID="avc-va-registrado">
            {tr("Conduta externa registrada na trilha.")}
          </Text>
        ) : null}
        {leitura.registrada ? (
          <Text style={e.rotulo} testID="avc-va-leitura">
            {tr("Registrado até agora")}:{" "}
            {[
              leitura.definitiva ? `${tr("Via aérea definitiva")}: ${tr(leitura.definitiva === "sim" ? "Sim" : leitura.definitiva === "nao" ? "Não" : "Não sei")}` : undefined,
              leitura.tipo ? `${tr("Tipo")}: ${tr(leitura.tipo === "nao_sei" ? "Não sei" : leitura.tipo)}` : undefined,
              leitura.observado !== undefined ? `${tr("Horário observado")}: ${horaCurta(leitura.observado)}` : leitura.horaDesconhecida ? `${tr("Horário observado")}: ${tr("Não sei")}` : undefined,
              leitura.quem ? `${tr("Quem realizou")}: ${leitura.quem}` : undefined,
            ].filter((x) => x !== undefined).join(" · ")}
          </Text>
        ) : null}
      </View>

      {modulo.cuidadosAssociados.length > 0 ? (
        <View style={e.bloco}>
          <Text style={e.subtitulo}>{tr("Cuidados associados")}</Text>
          {modulo.cuidadosAssociados.map((id) => (
            <Pressable key={id} style={e.opcao} accessibilityRole="button" testID={`avc-chamar-modulo-${id}`} onPress={() => onChamar(id)}>
              <Text style={e.opcaoTexto}>{tr(moduloChamavel(id)?.nome ?? id)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={e.linha}>
        <Pressable style={e.principal} accessibilityRole="button" testID="avc-modulo-voltar" onPress={onVoltar}>
          <Text style={e.principalTexto}>
            {tr("Voltar para")} {tr(origem)}
          </Text>
        </Pressable>
        <Pressable style={e.opcao} accessibilityRole="button" testID="avc-modulo-cancelar" onPress={onCancelar}>
          <Text style={e.opcaoTexto}>{tr("Cancelar chamada")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    pilha: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    titulo: { ...PAPEL.tituloDeSecao, color: tema.cores.text },
    subtitulo: { ...PAPEL.textoPrincipal, color: tema.cores.text, fontWeight: "700" },
    texto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    rotulo: { ...PAPEL.legenda, color: tema.cores.textSecondary },
    bloco: {
      gap: ESPACO.sm,
      padding: ESPACO.sm,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.border,
      backgroundColor: tema.cores.surface,
    },
    campo: { gap: ESPACO.xs },
    linha: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.xs },
    opcao: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.controlBorder,
      backgroundColor: tema.cores.controlSurface,
    },
    opcaoMarcada: { borderColor: tema.cores.primary, borderWidth: 2 },
    opcaoTexto: { ...PAPEL.textoPrincipal, color: tema.cores.text },
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
    principal: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: tema.cores.primaryFill,
      backgroundColor: tema.cores.primaryFill,
    },
    principalTexto: { ...PAPEL.tituloDeSecao, color: tema.cores.onFill },
  });
