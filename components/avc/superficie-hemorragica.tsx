/**
 * SUPERFÍCIE HEMORRÁGICA · catálogo de recomendações (HIC e HSA).
 *
 * ⚠️⚠️ UMA TELA, DUAS VARIANTES. HIC e HSA são o **mesmo tipo de artefato** — um
 * catálogo de recomendações COR/LOE — e ⛔ não uma árvore de decisão (PD-36).
 *
 * ── ⚠️⚠️ VESTIDA COM O SISTEMA CONGELADO (PD-37) ───────────────────────────
 *
 * ⛔ Esta tela nasceu com estilos próprios: card próprio, aviso próprio, seu
 * próprio jeito de mostrar a fonte. ⚠️ Funcionava, ⛔ e era **outro aplicativo
 * por dentro** — exatamente o que o autor proibiu para a transição
 * `Imagem → hemorragia → HIC/HSA`.
 *
 * ⚠️ Agora ela usa `ClinicalCard`, `SectionTitle`, `WarningCard` ⛔ e
 * `InfoToggle`, com a tipografia clínica. ⛔ Zero `fontSize` avulso, ⛔ zero hex:
 * a trava `valida-tipografia-clinica` cobra os dois.
 *
 * ── ⚠️ O QUE ESTA TELA ⛔ NÃO FAZ ───────────────────────────────────────────
 *
 *   ⛔ **⛔ não conclui nada.** ⛔ Não há veredito, ⛔ não há "faça isto agora".
 *   ⛔ **⛔ não esconde a fonte.** Cada recomendação abre o verbatim em inglês.
 *   ⛔ **⛔ não substitui julgamento.** O aviso de escopo está no topo.
 */
import { useState } from "react";
import { Text, View } from "react-native";

import {
  AVISO_HIC,
  CITACAO_HIC,
  REVERSAO_POR_AGENTE,
  TEMAS_HIC,
  type ClasseCOR,
  type Direcao,
  type Recomendacao,
} from "../../avc/conteudo/hemorragia-intracerebral";
import { AVISO_HSA, CITACAO_HSA, TEMAS_HSA } from "../../avc/conteudo/hemorragia-subaracnoidea";
import { ClinicalCard, InfoToggle, SectionTitle, WarningCard } from "./sistema";
import { useEstilosDoTema, useTheme, type Tema } from "../../design-system/theme";
import { PAPEL } from "../../design-system/tipografia-clinica";
import { ESPACO, RAIO } from "../../design-system/tokens";
import { useTr } from "../../lib/use-tr";

type Variante = "hic" | "hsa";

/**
 * ⚠️ A cor da direção sai do tema — ⛔ nenhum hex novo. ⚠️ Ela ⛔ nunca é o
 * **único** sinal: o selo carrega o rótulo da classe em texto (E-15).
 */
function corDaDirecao(dir: Direcao, tema: Tema): string {
  if (dir === "a_favor") return tema.cores.success;
  if (dir === "contra") return tema.cores.critical;
  return tema.cores.warning;
}

/** ⚠️ O rótulo PT da classe — ⛔ a classe em si é dado, ⛔ e ⛔ não texto de tela. */
function rotuloCor(cor: ClasseCOR): string {
  if (cor === "COR 1") return "Recomendado";
  if (cor === "COR 2a") return "Razoável";
  if (cor === "COR 2b") return "Pode ser considerado";
  if (cor === "COR 3: No Benefit") return "Sem benefício";
  return "Potencialmente danoso";
}

export default function SuperficieHemorragica({ variante }: { variante: Variante }) {
  const tr = useTr();
  const tema = useTheme();
  const e = useEstilosDoTema(estilos);
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  const temas = variante === "hic" ? TEMAS_HIC : TEMAS_HSA;
  const aviso = variante === "hic" ? AVISO_HIC : AVISO_HSA;
  const citacao = variante === "hic" ? CITACAO_HIC : CITACAO_HSA;

  const alternar = (id: string) => setAbertos((a) => ({ ...a, [id]: !a[id] }));

  function cartao(rec: Recomendacao) {
    const aberto = abertos[rec.id] === true;
    const cor = corDaDirecao(rec.direcao, tema);
    return (
      <ClinicalCard key={rec.id} testID={`avc-hem-rec-${rec.id}`}>
        <View style={e.topo}>
          {/** ⚠️ Selo com BORDA colorida ⛔ e rótulo em texto — cor ⛔ nunca sozinha. */}
          <View style={[e.selo, { borderColor: cor }]}>
            <Text style={[e.seloTexto, { color: cor }]}>{tr(rotuloCor(rec.cor))}</Text>
          </View>
          <Text style={e.loe}>{tr("Nível")} {rec.loe}</Text>
          {/** ⚠️ O ⓘ na linha do que ele explica — padrão único do módulo. */}
          <InfoToggle
            aberto={aberto}
            onAlternar={() => alternar(rec.id)}
            rotuloAcessivel="Ver o texto-fonte desta recomendação"
            testID={`avc-hem-fonte-${rec.id}`}
          />
        </View>
        <Text style={e.frase}>{tr(rec.formulacao)}</Text>
        {rec.populacao ? (
          <Text style={e.populacao}>{tr("População")}: {tr(rec.populacao)}</Text>
        ) : null}
        {aberto ? (
          /**
           * ⚠️ O verbatim vive no **segundo degrau** de superfície — ⛔ e ⛔ não
           * numa caixa com borda dentro do card. É a regra do sistema contra o
           * *card dentro de card*.
           */
          <ClinicalCard aninhado testID={`avc-hem-verbatim-${rec.id}`}>
            <Text style={e.local}>{tr(rec.localizacao)}</Text>
            {/** ⚠️ Verbatim em inglês — ⛔ NÃO passa por tr(): é a evidência auditável. */}
            <Text style={e.verbatim}>{rec.verbatim}</Text>
          </ClinicalCard>
        ) : null}
      </ClinicalCard>
    );
  }

  return (
    <View style={e.raiz} testID={`avc-hemorragica-${variante}`}>
      {/**
        * ⚠️ `info`, ⛔ e ⛔ não `atencao`: ⛔ não há nada de anormal acontecendo —
        * é o **escopo** da tela que está sendo declarado.
        */}
      <WarningCard nivel="info" titulo={aviso} testID="avc-hem-aviso" />

      {variante === "hic" ? (
        <View style={e.grupo} testID="avc-hem-reversao">
          <SectionTitle testID="avc-hem-bloco-reversao">Reversão por agente</SectionTitle>
          <Text style={e.resumo}>
            {tr("Suspender o anticoagulante e reverter o mais rápido possível. O agente depende do anticoagulante em uso.")}
          </Text>
          {REVERSAO_POR_AGENTE.map((r) => (
            <ClinicalCard key={r.id} testID={`avc-hem-reversao-${r.id}`}>
              <Text style={e.agente}>{tr(r.agente)}</Text>
              <Text style={e.frase}>{tr(r.conduta)}</Text>
              {/**
                * ⚠️⚠️ ⛔ ISTO ⛔ NÃO É UMA DOSE — é uma **regra de dosagem**.
                *
                * ⛔ Na primeira propagação usei `PAPEL.dose` aqui (22 pt, peso
                * 800), que existe para o número que vai na veia. ⚠️ O texto tem
                * várias cláusulas ("INR ≥2,0: … INR 1,3 a 1,9: …") ⛔ e virou
                * **seis linhas gigantes** dominando o card — a captura mostrou.
                *
                * ⚠️ A lição do sistema congelado: papel se escolhe pela **função
                * do texto**, ⛔ e ⛔ não pelo assunto dele. Regra operacional vai
                * no segundo degrau, legível ⛔ e sem gritar.
                */}
              {r.dose ? (
                <ClinicalCard aninhado testID={`avc-hem-dose-${r.id}`}>
                  <Text style={e.frase}>{tr(r.dose)}</Text>
                </ClinicalCard>
              ) : null}
              {r.alternativa ? <Text style={e.populacao}>{tr(r.alternativa)}</Text> : null}
            </ClinicalCard>
          ))}
        </View>
      ) : null}

      {temas.map((t) => (
        <View key={t.id} style={e.grupo} testID={`avc-hem-tema-${t.id}`}>
          <SectionTitle testID={`avc-hem-bloco-${t.id}`}>{t.titulo}</SectionTitle>
          <Text style={e.resumo}>{tr(t.resumo)}</Text>
          {t.recomendacoes.map((rec) => cartao(rec))}
        </View>
      ))}

      <View style={e.rodape} testID="avc-hem-fonte-citacao">
        {/** ⚠️ Citação — dado bibliográfico, ⛔ não texto de tela traduzível. */}
        <Text style={e.citacao}>{citacao}</Text>
      </View>
    </View>
  );
}

function estilos(tema: Tema) {
  return {
    raiz: { gap: ESPACO.md } as const,
    grupo: { gap: ESPACO.sm } as const,
    resumo: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary } as const,

    topo: { flexDirection: "row", alignItems: "center", gap: ESPACO.sm } as const,
    selo: {
      borderWidth: 1,
      borderRadius: RAIO.badge,
      paddingHorizontal: ESPACO.sm,
      paddingVertical: 2,
    } as const,
    seloTexto: { ...PAPEL.micro } as const,
    loe: { ...PAPEL.micro, color: tema.cores.textSecondary, marginRight: "auto" } as const,

    frase: { ...PAPEL.textoPrincipal, color: tema.cores.text } as const,
    populacao: { ...PAPEL.textoSecundario, color: tema.cores.textSecondary } as const,
    agente: { ...PAPEL.tituloDeSecao, color: tema.cores.text } as const,

    local: { ...PAPEL.legenda, color: tema.cores.textSecondary } as const,
    verbatim: { ...PAPEL.textoSecundario, color: tema.cores.text, fontStyle: "italic" } as const,

    rodape: { paddingTop: ESPACO.sm } as const,
    citacao: { ...PAPEL.legenda, color: tema.cores.textSecondary } as const,
  };
}
