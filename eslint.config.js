// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  /**
   * ⚠️⚠️⚠️ OS INSTRUMENTOS SÃO NODE — D-125.
   *
   * ⛔ `eslint-config-expo` descreve o app: React Native, navegador, bundler.
   * ⛔ Nele, `__dirname`, `require`, `module` e `process` ⛔ **⛔ não existem** —
   * ⛔ e ⛔ `scripts/**\/*.cjs` ⛔ é ⛔ **⛔ Node puro**, ⛔ onde ⛔ todos existem.
   *
   * ⛔ ⛔ Sem esta declaração, ⛔ `npx eslint scripts/prova-unidade-de-dose.cjs`
   * ⛔ acusava ⛔ « '__dirname' is not defined » — ⛔ um ⛔ **⛔ falso positivo**
   * ⛔ sobre ⛔ código correto. ⚠️ ⛔ E ⛔ falso positivo ⛔ em ferramenta ⛔ tem
   * ⛔ um custo ⛔ específico: ⛔ ele ⛔ ensina ⛔ a ignorar ⛔ a ferramenta.
   *
   * ⚠️⚠️ ⛔ ISTO ⛔ **⛔ NÃO AFROUXA REGRA NENHUMA**. ⛔ Ele ⛔ só descreve ⛔ o
   * ⛔ **⛔ ambiente**: ⛔ quais nomes ⛔ já existem ⛔ antes ⛔ do arquivo começar.
   * ⛔ `no-undef` ⛔ continua ligada, ⛔ e ⛔ continua ⛔ pegando ⛔ nome ⛔ que
   * ⛔ ninguém definiu — ⛔ provado ⛔ por mutação.
   *
   * ⛔ ⛔ O escopo ⛔ é ⛔ **⛔ a natureza do arquivo**, ⛔ e ⛔ não a pasta:
   * ⛔ `.cjs` ⛔ é ⛔ CommonJS ⛔ por extensão, ⛔ e ⛔ `scripts/` ⛔ é ⛔ onde ⛔ os
   * instrumentos ⛔ moram. ⛔ Um `.ts` ⛔ dentro de `scripts/` ⛔ **⛔ não** entra
   * aqui — ⛔ ele ⛔ não é ⛔ CommonJS.
   */
  {
    files: ['scripts/**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },
]);
