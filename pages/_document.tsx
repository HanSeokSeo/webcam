import { Head, Html, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link href="asset/favicons/favicon-16x16.png" rel="icon" type="image/png" sizes="16x16" />
        <link href="asset/favicons/favicon-32x32.png" rel="icon" type="image/png" sizes="32x32" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
