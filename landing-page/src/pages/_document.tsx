import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <title>Birthday Bot</title>
      <meta name="description" content="Never miss a birthday message again!" />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
