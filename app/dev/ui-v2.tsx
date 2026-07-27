import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Badge,
  BottomNavigation,
  BottomSheet,
  Button,
  Card,
  Chip,
  FloatingButton,
  Header,
  Input,
  Modal,
  NumericStepper,
  Progress,
  Switch,
  Tag,
  Timer,
  Toast,
} from "../../components/ui-v2";
import { ESPACO, TEMAS, TIPOGRAFIA, TOQUE, type Tema } from "../../design-system/tokens";

/**
 * Showcase dos componentes da UI 2.0 — Fase 2 do plano.
 *
 * Serve para validar a aparência ISOLADAMENTE, antes de encostar em qualquer
 * tela clínica. Rota interna: nada aqui é ligado a engine, rota ou dado real.
 *
 * Os dois temas aparecem lado a lado de propósito: comparar é o único jeito
 * honesto de decidir se a paleta funciona nos dois.
 *
 * Abrir em: /dev/ui-v2
 */
export default function ShowcaseUiV2() {
  return (
    <SafeAreaView style={estilosPagina.raiz} edges={["top", "left", "right"]} testID="showcase-ui-v2">
      <ScrollView contentContainerStyle={estilosPagina.conteudo}>
        <Text style={estilosPagina.tituloPagina}>UI 2.0 — componentes base</Text>
        <Text style={estilosPagina.subtitulo}>
          16 componentes, dois temas. Nenhuma tela do app foi alterada — isto é
          uma vitrine isolada para você aprovar ou pedir mudança.
        </Text>

        <PainelDoTema tema={TEMAS.escuro} />
        <PainelDoTema tema={TEMAS.claro} />
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Renderiza a galeria inteira com um tema forçado.
 *
 * Os componentes leem o tema por `useTheme()`, que hoje devolve o escuro fixo
 * (ver design-system/theme.ts). Para exibir o claro sem mexer nisso, o painel
 * pinta o fundo com as cores do tema pedido e mostra a paleta ao lado — assim dá
 * para conferir contraste e harmonia dos dois sem ligar a troca de tema antes
 * da Fase 9.
 */
function PainelDoTema({ tema }: { tema: Tema }) {
  const claro = tema.nome === "claro";
  return (
    <View style={[estilosPagina.painel, { backgroundColor: tema.cores.bg, borderColor: tema.cores.border }]}>
      <Text style={[estilosPagina.tituloTema, { color: tema.cores.text }]}>
        Tema {tema.nome}
      </Text>
      <Paleta tema={tema} />
      {claro ? (
        <Text style={[estilosPagina.aviso, { color: tema.cores.textSecondary }]}>
          Os componentes abaixo renderizam no tema escuro (fixado até a Fase 9).
          Acima está a paleta clara já validada em contraste — é ela que entra
          quando a troca de tema for ligada.
        </Text>
      ) : (
        <Galeria />
      )}
    </View>
  );
}

function Paleta({ tema }: { tema: Tema }) {
  const entradas = Object.entries(tema.cores);
  return (
    <View style={estilosPagina.paleta}>
      {entradas.map(([nome, cor]) => (
        <View key={nome} style={estilosPagina.amostra}>
          <View style={[estilosPagina.quadrado, { backgroundColor: cor, borderColor: tema.cores.border }]} />
          <Text style={[estilosPagina.amostraNome, { color: tema.cores.textSecondary }]} numberOfLines={1}>
            {nome}
          </Text>
          <Text style={[estilosPagina.amostraHex, { color: tema.cores.textSecondary }]}>{cor}</Text>
        </View>
      ))}
    </View>
  );
}

function Galeria() {
  const [peso, setPeso] = useState(70);
  const [peep, setPeep] = useState(8);
  const [texto, setTexto] = useState("");
  const [ligado, setLigado] = useState(true);
  const [sintomas, setSintomas] = useState<string[]>(["Dispneia"]);
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState(false);
  const [aba, setAba] = useState("agora");

  const alternar = (s: string) =>
    setSintomas((atual) => (atual.includes(s) ? atual.filter((x) => x !== s) : [...atual, s]));

  return (
    <View style={estilosPagina.galeria}>
      <Secao titulo="Header compacto">
        <Header titulo="Anafilaxia" etapa="Etapa 3" onVoltar={() => {}} direita={<Badge label="GRAVE" tom="critical" solido />} />
      </Secao>

      <Secao titulo="Button — variantes e estados">
        <Button label="Primary" onPress={() => {}} />
        <Button label="Secondary" variant="secondary" onPress={() => {}} />
        <Button label="Danger" variant="danger" onPress={() => {}} />
        <Button label="Ghost" variant="ghost" onPress={() => {}} />
        <Button label="Crítico (56 px)" critico bloco onPress={() => {}} />
        <Button label="Carregando" loading onPress={() => {}} />
        <Button label="Desabilitado" disabled onPress={() => {}} />
      </Secao>

      <Secao titulo="Stepper numérico — o controle padrão de todo número">
        <NumericStepper
          rotulo="Peso"
          unidade="kg"
          valor={peso}
          onChange={setPeso}
          min={1}
          max={200}
          passo={0.5}
          ajuda="Slider para aproximar, −/+ para acertar."
        />
        <NumericStepper rotulo="PEEP" unidade="cmH₂O" valor={peep} onChange={setPeep} min={0} max={24} />
      </Secao>

      <Secao titulo="Timer — dígitos de largura fixa">
        <Timer segundos={154} rotulo="Tempo de parada" tamanho="grande" />
        <Timer segundos={92} rotulo="Ciclo" tom="warning" />
        <Timer segundos={3725} rotulo="Passa de 1 h" tom="critical" />
      </Secao>

      <Secao titulo="Card">
        <Card titulo="Adrenalina" descricao="1 mg IV/IO a cada 3–5 min" tom="primary" />
        <Card titulo="Choque refratário" descricao="Após 2 doses IM + volume" tom="critical" elevado />
        <Card titulo="Card tocável" descricao="A superfície inteira responde" onPress={() => {}} />
      </Secao>

      <Secao titulo="Input">
        <Input rotulo="Dose" unidade="mg" placeholder="0,0" keyboardType="decimal-pad" value={texto} onChangeText={setTexto} />
        <Input rotulo="Com erro" erro="Informe o peso antes de calcular" placeholder="—" />
        <Input rotulo="Desabilitado" editable={false} placeholder="Indisponível" />
      </Secao>

      <Secao titulo="Chip, Badge e Tag">
        <View style={estilosPagina.linha}>
          {["Dispneia", "Urticária", "Hipotensão", "Estridor"].map((s) => (
            <Chip key={s} label={s} selecionado={sintomas.includes(s)} onPress={() => alternar(s)} />
          ))}
        </View>
        <View style={estilosPagina.linha}>
          <Badge label="ROSC" tom="success" />
          <Badge label="2 doses" tom="primary" />
          <Badge label="GRAVE" tom="critical" solido />
          <Badge label="Atenção" tom="warning" solido />
        </View>
        <View style={estilosPagina.linha}>
          <Tag label="ACLS" />
          <Tag label="AHA 2025" />
        </View>
      </Secao>

      <Secao titulo="Progress">
        <Progress valor={0.4} rotulo="Preenchimento" passos={{ atual: 4, total: 10 }} />
        <Progress valor={0.85} rotulo="Ciclo de RCP" tom="warning" />
      </Secao>

      <Secao titulo="Switch">
        <Switch valor={ligado} onChange={setLigado} rotulo="Comandos de voz" descricao="Reconhecimento durante o atendimento" />
        <Switch valor={false} onChange={() => {}} rotulo="Desabilitado" disabled />
      </Secao>

      <Secao titulo="Sobreposições">
        <Button label="Abrir modal" variant="secondary" onPress={() => setModal(true)} />
        <Button label="Abrir bottom sheet" variant="secondary" onPress={() => setSheet(true)} />
        <Button label="Mostrar toast" variant="secondary" onPress={() => setToast(true)} />
      </Secao>

      <Secao titulo="Navegação inferior">
        <BottomNavigation
          itens={[
            { id: "agora", label: "Agora" },
            { id: "dados", label: "Dados", contador: 3 },
            { id: "registro", label: "Registro" },
          ]}
          ativo={aba}
          onSelecionar={setAba}
        />
      </Secao>

      <Secao titulo="Botão flutuante">
        <View style={estilosPagina.areaFlutuante}>
          <Text style={estilosPagina.notaFlutuante}>Flutua sobre o conteúdo</Text>
          <FloatingButton label="Ativar voz" lado="centro" onPress={() => {}} />
        </View>
      </Secao>

      <Modal
        visivel={modal}
        onFechar={() => setModal(false)}
        titulo="Confirmar encerramento"
        acao={{ label: "Encerrar", onPress: () => setModal(false), critico: true }}
      >
        <Text style={estilosPagina.textoModal}>
          Modal interrompe o fluxo. Reservado para confirmação irreversível ou
          erro que impede seguir.
        </Text>
      </Modal>

      <BottomSheet visivel={sheet} onFechar={() => setSheet(false)} titulo="Critérios de anafilaxia">
        <Text style={estilosPagina.textoModal}>
          É o destino do &quot;ver mais&quot;: o texto clínico completo sai da
          tela principal sem ser removido do app.
        </Text>
      </BottomSheet>

      <Toast mensagem="Conduta registrada às 14:32" visivel={toast} onFechar={() => setToast(false)} tom="success" />
    </View>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={estilosPagina.secao}>
      <Text style={estilosPagina.tituloSecao}>{titulo}</Text>
      <View style={estilosPagina.corpoSecao}>{children}</View>
    </View>
  );
}

const estilosPagina = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: "#0a0f1a" },
  conteudo: { padding: ESPACO.md, gap: ESPACO.lg, paddingBottom: ESPACO.xl },
  tituloPagina: { ...TIPOGRAFIA.title, color: "#f1f5f9" },
  subtitulo: { ...TIPOGRAFIA.caption, color: "#94a3b8", fontWeight: "400" },
  painel: { borderRadius: 16, borderWidth: 1, padding: ESPACO.md, gap: ESPACO.md },
  tituloTema: { ...TIPOGRAFIA.step, textTransform: "capitalize" },
  aviso: { ...TIPOGRAFIA.micro, fontWeight: "400", lineHeight: 18 },
  paleta: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
  amostra: { width: 92, gap: 2 },
  quadrado: { height: 40, borderRadius: 8, borderWidth: 1 },
  amostraNome: { ...TIPOGRAFIA.micro },
  amostraHex: { ...TIPOGRAFIA.micro, fontWeight: "400", fontSize: 11 },
  galeria: { gap: ESPACO.lg },
  secao: { gap: ESPACO.sm },
  tituloSecao: { ...TIPOGRAFIA.micro, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 },
  corpoSecao: { gap: ESPACO.sm },
  linha: { flexDirection: "row", flexWrap: "wrap", gap: ESPACO.sm },
  areaFlutuante: { height: TOQUE.critico * 2, justifyContent: "center" },
  notaFlutuante: { ...TIPOGRAFIA.micro, color: "#64748b", textAlign: "center" },
  textoModal: { ...TIPOGRAFIA.body, color: "#f1f5f9" },
});
