import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css"
                    crossOrigin="anonymous"
                />
            </Head>
            <body className="polka">
                <Main />
                <NextScript />
                <Script src="/snarkjs.min.js" />
            </body>
        </Html>
    );
}
