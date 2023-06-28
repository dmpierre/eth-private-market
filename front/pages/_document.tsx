import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body className="polka">
                <Main />
                <NextScript />
                <Script src="/snarkjs.min.js" />
            </body>
        </Html>
    );
}
