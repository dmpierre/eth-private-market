import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { WagmiConfig, configureChains, createConfig, sepolia } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [sepolia],
    [
        jsonRpcProvider({
            rpc: (chain) => ({
                http: 'https://sepolia.infura.io/v3/9a7d8dfb85164188bf27dad18b420149',
            }),
        }),
    ]
);

const config = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <WagmiConfig config={config}>
            <Component {...pageProps} />
        </WagmiConfig>
    );
}
