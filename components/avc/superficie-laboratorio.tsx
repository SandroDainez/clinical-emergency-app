/**
 * PAINEL **LABORATÓRIO** — a tela.
 *
 * ⛔ NENHUMA medicina nasce aqui. Campos vêm de `avc/conteudo/laboratorio.ts`,
 * leituras vêm de `avc/nucleo/derivacoes-lab.ts`, e esta camada só desenha (E-29).
 *
 * ── ⚠️⚠️ O QUE ESTA TELA FAZ DE DIFERENTE DE TODAS AS OUTRAS ──────────────
 *
 * Ela desenha **o mesmo conjunto de campos N vezes** — uma por coleta. Em A, B,
 * C e Paciente cada campo aparece uma vez; aqui, um toque no INR da **terceira**
 * coleta precisa gravar **naquela** instância, e ⛔ não na "aberta". É a tela que
 * sabe em qual o médico tocou, e é ela que passa a instância adiante.
 *
 * ⛔⛔ E ELA ⛔ NUNCA ESCREVE "MAIS RECENTE" onde ⛔ não sabe datar. A lista segue a
 * ordem de **registro** — sempre conhecida —, e cada coleta mostra o seu horário
 * **ou** *"horário desconhecido"*. Quem diz se há ordem clínica é a derivação.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ANALITOS_L, COLETA, COLETA_L } from "../../avc/conteudo/laboratorio";
import { coletas, leiturasDoLaboratorio } from "../../avc/nucleo/derivacoes-lab";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorNaInstancia } from "../../avc/nucleo/instancia";
import { horaDeExibicao } from "../../avc/nucleo/formato";
import {
  CabecalhoDeBloco,
  CampoDaSuperficie,
  PainelDeLeituras,
  useDetalhes,
} from "./campos-clinicos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolherNaColeta: (coleta: string, campo: string, valor: string) => void;
  onMedirNaColeta: (coleta: string, campo: string, valor: number) => void;
  onHoraNaColeta: (coleta: string, campo: string, instante: number) => void;
  onDesfazerNaColeta: (coleta: string, campo: string) => void;
  onNovaColeta: () => void;
};

export default function SuperficieLaboratorio({
  estado,
  agora,
  onEscolherNaColeta,
  onMedirNaColeta,
  onHoraNaColeta,
  onDesfazerNaColeta,
  onNovaColeta,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const detalhes = useDetalhes();
  const lista = coletas(estado);
  const leituras = leiturasDoLaboratorio(estado);
  /** ⚠️ Estado de TELA: abrir coleta ⛔ não registra nem apaga nada (E-20). */
  const [abertas, setAbertas] = useState<readonly string[]>([]);

  const campos = [...COLETA_L, ...ANALITOS_L];

  function bruto(coleta: string, id: string): string {
    return String(valorNaInstancia(estado, coleta, id)?.valor ?? "");
  }
  function numeroDe(coleta: string, id: string): number | undefined {
    const f = valorNaInstancia(estado, coleta, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  return (
    <View style={e.raiz} testID="avc-superficie-laboratorio-conteudo">
      {lista.length === 0 ? (
        <Text style={e.vazio} testID="avc-laboratorio-vazio">
          {tr("Nenhuma coleta registrada. Nada no atendimento espera por isto.")}
        </Text>
      ) : null}

      {lista.map((coleta, i) => {
        const fechada = i < lista.length - 1 && !abertas.includes(coleta.id);
        return (
          <View key={coleta.id} style={e.coleta} testID={`avc-coleta-${coleta.id}`}>
            <Pressable
              accessibilityRole="button"
              aria-expanded={!fechada}
              testID={`avc-coleta-abrir-${coleta.id}`}
              onPress={() =>
                setAbertas((a) =>
                  a.includes(coleta.id) ? a.filter((x) => x !== coleta.id) : [...a, coleta.id]
                )
              }
            >
              <CabecalhoDeBloco
                titulo={`${tr("Coleta")} ${i + 1}`}
                testID={`avc-coleta-cabecalho-${coleta.id}`}
                aberto={!fechada}
              />
            </Pressable>

            {/**
              * ⚠️⚠️ A LINHA DE IDENTIDADE DA COLETA — procedência e horário, e
              * ⛔ **"horário desconhecido" escrito por extenso** quando é o caso.
              *
              * ⚠️ Deixar em branco faria o desconhecimento parecer "⛔ ainda ⛔ não
              * preenchi" — e os dois são estados diferentes (**E-37**), com
              * consequências diferentes para a ordem entre coletas.
              */}
            <Text style={e.identidade} testID={`avc-coleta-identidade-${coleta.id}`}>
              {coleta.procedencia ? tr(coleta.procedencia) : tr("procedência não informada")}
              {" · "}
              {coleta.horaConhecida
                ? horaDeExibicao(coleta.hora as number, agora)
                : coleta.horaDesconhecida
                  ? tr("horário desconhecido")
                  : tr("horário não informado")}
            </Text>

            {fechada
              ? null
              : campos.map((campo) => (
                  <CampoDaSuperficie
                    key={`${coleta.id}-${campo.id}`}
                    campo={{ ...campo, casa: "laboratorio" }}
                    casaAtual="laboratorio"
                    bruto={bruto(coleta.id, campo.id)}
                    numero={numeroDe(coleta.id, campo.id)}
                    agora={agora}
                    detalheAberto={detalhes.aberto(`${coleta.id}-${campo.id}`)}
                    onAlternarDetalhe={() => detalhes.alternar(`${coleta.id}-${campo.id}`)}
                    onEscolher={(c, v) => onEscolherNaColeta(coleta.id, c, v)}
                    onMedir={(c, v) => onMedirNaColeta(coleta.id, c, v)}
                    onHora={(c, instante) => onHoraNaColeta(coleta.id, c, instante)}
                    onDesfazer={(c) => onDesfazerNaColeta(coleta.id, c)}
                  />
                ))}
          </View>
        );
      })}

      {/**
        * ⚠️⚠️ NOVA COLETA — o gesto explícito de §3.4. Sem ele, editar um INR
        * seria ambíguo entre **correção** e **nova coleta**, e a ambiguidade
        * ⛔ não é de interface: ela muda o que a trilha AFIRMA sobre o paciente.
        */}
      <Pressable
        style={e.novaColeta}
        accessibilityRole="button"
        testID="avc-nova-coleta"
        onPress={onNovaColeta}
      >
        <Text style={e.novaColetaTexto}>{tr("Nova coleta")}</Text>
      </Pressable>

      <PainelDeLeituras
        leituras={leituras}
        rotuloDoCampo={Object.fromEntries(ANALITOS_L.map((c) => [c.id, c.rotulo]))}
        detalheAberto={detalhes.aberto}
        onAlternarDetalhe={detalhes.alternar}
      />
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    coleta: { gap: ESPACO.xs },
    identidade: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
    vazio: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.body.fontSize },
    novaColeta: {
      alignSelf: "flex-start", minHeight: TOQUE.minimo, justifyContent: "center",
      paddingHorizontal: ESPACO.md,
      backgroundColor: tema.cores.surface, borderRadius: RAIO.botao,
      borderWidth: 2, borderColor: tema.cores.border,
    },
    novaColetaTexto: {
      color: tema.cores.text, fontSize: TIPOGRAFIA.body.fontSize, fontWeight: "600",
    },
  });
