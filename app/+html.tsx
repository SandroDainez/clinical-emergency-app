import type { PropsWithChildren } from "react";

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <style
          id="expo-reset"
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                min-height: 100%;
                height: auto;
              }

              body {
                margin: 0;
                overflow-x: hidden;
                overflow-y: auto;
                background: #eef3fb;
              }

              #root {
                display: flex;
                min-height: 100vh;
                width: 100%;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
