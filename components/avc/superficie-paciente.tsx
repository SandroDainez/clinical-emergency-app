/**
 * SUPERFÍCIE **PACIENTE** — a tela.
 *
 * ⛔ NENHUMA medicina nasce aqui. Campos vêm de `avc/conteudo/paciente.ts`, e
 * esta camada só desenha (E-29).
 *
 * ⚠️⚠️ O QUE ESTA TELA NÃO PODE FAZER, e é a condição que o autor impôs para ela
 * existir:
 *
 *   ⛔ **ser o passo 1.** Ela aparece primeiro na navegação e ⛔ não é porta. Com
 *      ela **inteiramente vazia**, todas as superfícies abrem, ⛔ nenhuma some, e
 *      ⛔ nenhum bloqueio nasce. As doze marcas 🚫 são a razão: uma ficha de
 *      admissão antes do fluxo é a forma mais natural de reintroduzir atraso, e
 *      ⛔ nem pareceria bloqueio — pareceria organização.
 *
 *   ⛔ **cobrar preenchimento.** ⛔ Nenhum campo obrigatório, ⛔ nenhuma barra de
 *      progresso, ⛔ nenhum "faltam N".
 *
 *   ⛔ **concluir.** Ela ⛔ não tem painel de leituras: aqui se registra **quem é o
 *      paciente**, e a interpretação de cada fato pertence à superfície que o
 *      consome. É a regra do autor — *"o dado pertence à espécie dele; a decisão
 *      apenas o consome"*.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GRUPOS_P } from "../../avc/conteudo/paciente";
import { camposDoGrupo } from "../../avc/conteudo/campo";
import type { EstadoAvc } from "../../avc/nucleo/estado";
import { valorAtual } from "../../avc/nucleo/estado";
import { CabecalhoDeBloco, CampoDaSuperficie, useDetalhes } from "./campos-clinicos";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { ESPACO, TIPOGRAFIA } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  onDesfazer: (campo: string) => void;
};

export default function SuperficiePaciente({
  estado,
  agora,
  onEscolher,
  onMedir,
  onHora,
  onDesfazer,
}: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const detalhes = useDetalhes();
  /** ⚠️ Estado de TELA — abrir bloco ⛔ não registra nem apaga nada (E-20). */
  const [abertos, setAbertos] = useState<readonly string[]>([]);

  function bruto(id: string): string {
    return String(valorAtual(estado, id)?.valor ?? "");
  }
  function numeroGravado(id: string): number | undefined {
    const f = valorAtual(estado, id);
    return typeof f?.valor === "number" ? f.valor : undefined;
  }

  return (
    <View style={e.raiz} testID="avc-superficie-paciente-conteudo">
      {/**
        * ⚠️⚠️ A LINHA QUE DIZ QUE ELA ⛔ NÃO É PORTA. Sem ela, uma tela de admissão
        * que aparece primeiro é lida como etapa obrigatória — e o médico com um
        * paciente instável hesita antes de pular.
        */}
      <Text style={e.aviso} testID="avc-paciente-nao-e-porta">
        {tr("Nada aqui é obrigatório para seguir. Todas as superfícies abrem com este painel vazio.")}
      </Text>

      {GRUPOS_P.map((grupo) => {
        const fechado = grupo.recolhido === true && !abertos.includes(grupo.id);
        return (
          <View key={grupo.id} style={e.grupo} testID={`avc-grupo-${grupo.id}`}>
            {grupo.recolhido ? (
              <Pressable
                accessibilityRole="button"
                aria-expanded={!fechado}
                testID={`avc-bloco-abrir-${grupo.id}`}
                onPress={() =>
                  setAbertos((a) =>
                    a.includes(grupo.id) ? a.filter((x) => x !== grupo.id) : [...a, grupo.id]
                  )
                }
              >
                <CabecalhoDeBloco titulo={grupo.titulo} testID={`avc-bloco-${grupo.id}`} />
              </Pressable>
            ) : (
              <CabecalhoDeBloco titulo={grupo.titulo} testID={`avc-bloco-${grupo.id}`} />
            )}
            {grupo.nota ? (
              <Text style={e.grupoNota} testID={`avc-grupo-nota-${grupo.id}`}>
                {tr(grupo.nota)}
              </Text>
            ) : null}

            {fechado
              ? null
              : camposDoGrupo(grupo).map((campo) => (
                  <CampoDaSuperficie
                    key={campo.id}
                    campo={campo}
                    casaAtual="paciente"
                    bruto={bruto(campo.id)}
                    numero={numeroGravado(campo.id)}
                    agora={agora}
                    detalheAberto={detalhes.aberto(campo.id)}
                    onAlternarDetalhe={() => detalhes.alternar(campo.id)}
                    onEscolher={onEscolher}
                    onMedir={onMedir}
                    onHora={onHora}
                    onDesfazer={onDesfazer}
                    /** ⚠️ Descritor de escala se lê empilhado, ⛔ não em chip. */
                    empilhado={campo.tipo === "grau"}
                  />
                ))}
          </View>
        );
      })}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    grupo: { gap: ESPACO.xs },
    grupoNota: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.micro.fontSize },
    aviso: { color: tema.cores.textSecondary, fontSize: TIPOGRAFIA.caption.fontSize },
  });
