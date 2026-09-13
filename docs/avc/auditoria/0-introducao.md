# Auditoria do AVC existente contra a especificação (PDF v1.1)

**Data:** 2026-09-13 · **HEAD auditado:** `52aa4e2`, igual ao remoto após o push desta rodada
**Spec:** `docs/spec-avc.md` · **Requisitos:** `docs/avc/matriz-requisitos.md` · **Regras:** `docs/avc/matriz-regras.md`

**Natureza:** auditoria **só de leitura**. Nenhum código, conteúdo clínico ou tela
foi alterado. Nada aqui valida regra clínica: tudo segue **pendente de validação
médica** até registro humano com nome, versão e data.

## Como ler

- **Classe:** atendido · parcial · ausente · contradiz a spec. Onde nenhuma busca
  específica foi feita, a célula diz **não medido**. Isso fica fora das quatro
  classes de propósito: sem busca, não se afirma ausência (R-AUSENCIA).
- **Gravidade:**
  - **crítica:** pode levar a conduta errada sem aviso, ou perder o registro de uma administração;
  - **alta:** requisito de segurança ou de rastreabilidade não cumprido;
  - **média:** requisito funcional divergente;
  - **baixa:** documentação ou forma.
- **Evidência:** arquivo:linha, função ou `testID`, e como foi medido.
- **Instrumento:** `git grep -P`, porque `git grep -E` não tem `\s`/`\b`.
  - Em zsh, caminhos passados por variável não se separam em palavras. Nesta rodada isso produziu zeros falsos. Eles foram **descartados** e as buscas refeitas em bash.
  - **Controle T:** a palavra `Trombólise` em `avc/` + `components/avc/` dá 21 ocorrências com caixa exata e 194 sem distinção de caixa. Toda busca negativa com dois caminhos abaixo usou o mesmo instrumento.
  - *"Fora de comentário"* significa que as linhas iniciadas por `*` ou `//` foram excluídas.

---

