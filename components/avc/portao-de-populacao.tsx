/**
 * PORTÃO DE POPULAÇÃO — AC-03 de `docs/avc/auditoria-vs-spec.md`.
 *
 * Fonte: `protocols/fontes-verbatim/escopo-populacional-avc.md` (slot F-37).
 *
 * ⚠️ Esta camada só DESENHA: o estado vem de `avc/nucleo/populacao.ts`, e os dois
 * campos são os de Paciente (`POPULACAO_P`), com o mesmo componente de campo das
 * superfícies. ⛔ Nenhuma conduta aqui: fora do escopo, a frase é encaminhar.
 */
import { StyleSheet, Text, View } from "react-native";

import { GRUPOS_P } from "../../avc/conteudo/paciente";
import { valorAtual, type EstadoAvc } from "../../avc/nucleo/estado";
import {
  MENSAGEM_FORA_DO_ESCOPO,
  estadoDaPopulacao,
  type MotivoForaDoEscopo,
} from "../../avc/nucleo/populacao";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";
import { CampoDaSuperficie, useDetalhes } from "./campos-clinicos";

type Props = {
  estado: EstadoAvc;
  agora: number;
  onEscolher: (campo: string, valor: string) => void;
  onMedir: (campo: string, valor: number) => void;
  onHora: (campo: string, instante: number, relogio?: string) => void;
  onDesfazer: (campo: string) => void;
};

/** ⚠️ O motivo é dito com a palavra da opção que o médico escolheu. */
const ROTULO_DO_MOTIVO: Readonly<Record<MotivoForaDoEscopo, string>> = {
  menor_de_18: "Menos de 18 anos",
  gestante: "Gestante",
  puerpera: "Puérpera",
};

export default function PortaoDePopulacao({ estado, agora, onEscolher, onMedir, onHora, onDesfazer }: Props) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);
  const detalhes = useDetalhes();
  const leitura = estadoDaPopulacao(estado);
  const campos = GRUPOS_P.find((g) => g.id === "populacao")?.campos ?? [];

  return (
    <View style={e.raiz} testID="avc-portao-populacao">
      {leitura.estado === "fora_do_escopo" ? (
        <View style={e.fora} testID="avc-portao-fora-do-escopo">
          <Text style={e.foraTitulo}>{tr(MENSAGEM_FORA_DO_ESCOPO)}</Text>
          <Text style={e.foraMotivo}>
            {leitura.motivos.map((m) => tr(ROTULO_DO_MOTIVO[m])).join(" · ")}
          </Text>
        </View>
      ) : (
        <Text style={e.pergunta} testID="avc-portao-pergunta-pendente">
          {tr("Antes do protocolo: este módulo foi escrito para adulto, não gestante e não puérpera (puerpério: até 14 dias após o parto — fonte AHA 2019, a confirmar na Table 8 de 2026). Não sei mantém a pergunta.")}
        </Text>
      )}
      {campos.map((campo) => (
        <CampoDaSuperficie
          key={campo.id}
          campo={campo}
          casaAtual="paciente"
          bruto={String(valorAtual(estado, campo.id)?.valor ?? "")}
          numero={(() => {
            const v = valorAtual(estado, campo.id)?.valor;
            return typeof v === "number" ? v : undefined;
          })()}
          agora={agora}
          detalheAberto={detalhes.aberto(campo.id)}
          onAlternarDetalhe={() => detalhes.alternar(campo.id)}
          onEscolher={onEscolher}
          onMedir={onMedir}
          onHora={onHora}
          onDesfazer={onDesfazer}
        />
      ))}
    </View>
  );
}

const criarEstilos = (tema: Tema) =>
  StyleSheet.create({
    raiz: { gap: ESPACO.md },
    pergunta: { ...PAPEL.textoPrincipal, color: tema.cores.text },
    /** ⚠️ Fora do escopo é informação que muda a conduta: fundo de alerta, ⛔ não texto solto. */
    fora: {
      gap: ESPACO.xs,
      padding: ESPACO.md,
      borderRadius: RAIO.card,
      borderWidth: 1.5,
      borderColor: tema.cores.critical,
      backgroundColor: tema.cores.surface,
    },
    foraTitulo: { ...PAPEL.tituloDeSecao, color: tema.cores.critical },
    foraMotivo: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary },
  });
