import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

// Cor de fundo para evitar flash branco antes do JS carregar.
const responsiveBackground = `body { background-color: #0a0f1d; }`;

/**
 * Shell HTML da versão web. Define o ícone de tela inicial (Adicionar à Tela de
 * Início) via apple-touch-icon + manifest PWA, para que o app salvo no celular
 * use o logo da Clinical Emergency Suite.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* Ícones e PWA — usados ao "Adicionar à Tela de Início" (iOS/Android) */}
        <link rel="icon" type="image/png" href="/favicon-32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0f1d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Emergência" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
