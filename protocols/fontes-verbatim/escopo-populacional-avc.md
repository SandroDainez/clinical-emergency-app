# Escopo populacional do módulo AVC — adulto, não gestante, não puérpera

**Status:** ✅ registrado em 2026-09-13 · ⚠️ **não é fonte clínica**: é o escopo
declarado pelo autor e a especificação do produto. ⛔ Nenhuma conduta para essas
populações nasce daqui.

## 1 · Especificação (PDF *App Emergências | AVC — atendimento guiado*, v1.1, com correção do autor)

Transcrito de `docs/spec-avc.md`, linhas 94–96:

> **[CORREÇÃO 12/09] — populações pediátrica, gestante e puérpera.**
> Identificar e encaminhar; **nunca aplicar regra adulta em silêncio**. A
> identificação é obrigatória antes de qualquer regra adulta produzir saída.

## 2 · Instrução escrita do autor (2026-09-13, rodada AC-03)

> AC-03 — Populações fora do escopo.
> Prova vermelha: idade < 18, gestante ou puérpera informada em T01 → o módulo
> identifica, mostra "fora do escopo validado — encaminhar" e NÃO exibe dose
> calculada por peso. Idade desconhecida não é adulto: pergunta antes de
> prosseguir. Implemente como portão na entrada, sem conteúdo clínico novo; a
> conduta para essas populações é "encaminhar", nada mais.

## 3 · Escolhas do autor na mesma rodada (resposta escrita a perguntas do agente)

| pergunta | escolha do autor |
|---|---|
| Enquanto a população não estiver respondida, o portão bloqueia o quê? | **Protocolo e dose:** Estabilização e ameaças imediatas continuam acessíveis; Paciente, Neurológico, Imagem, Segurança, Reperfusão e Destino ficam atrás da pergunta. Dose por peso nunca aparece fora de "adulto, não gestante, não puérpera". |
| Gestação ou puerpério respondido "não sei" deve fazer o quê? | **Igual à idade:** desconhecido não é negativo; o portão continua perguntando, e a dose por peso não aparece. |

## 4 · O que isto sustenta no app

| afirmação | onde |
|---|---|
| a população é perguntada na entrada, antes das superfícies de protocolo | portão de população (`avc/nucleo/populacao.ts`) |
| menor de 18 anos, gestante ou puérpera ⇒ *"Fora do escopo validado — encaminhar"* | idem |
| idade ou gestação/puerpério desconhecidos ⇒ a pergunta continua, ⛔ sem assumir adulto | idem |
| dose calculada por peso só aparece para adulto não gestante e não puérpera | Reperfusão |

⛔ **O que isto NÃO sustenta:**
- limite de idade de recomendação;
- definição da duração do puerpério (definida depois pelo autor na D-PEND-24, ver §5);
- conduta, dose ou contraindicação para qualquer dessas populações;
- qualquer afirmação clínica.

A palavra *puérpera* é resposta do médico, sem critério do app.

## 5 · D-PEND-24 — janela do puerpério (decisão do autor, 2026-09-13)

**Decisão, nos termos do autor:** janela de 14 dias pós-parto no portão de população, marcada "fonte AHA 2019, a confirmar na Table 8 de 2026"; texto "10 dias" apagado.

⚠️ **O que este registro NÃO é:** transcrição de fonte clínica.
- **AHA 2019:** não está transcrita neste repositório.
- **Table 8 de 2026:** a linha de gestação e puerpério é imagem e não foi transcrita.

O número 14 é do autor, com a marcação que ele definiu (`docs/decisoes.md` D-PEND-24).
