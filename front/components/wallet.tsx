import { CHAIN_ID } from '@/app.conf';
import {
    useAccount,
    useConnect,
    useNetwork,
    useSwitchNetwork,
    useWalletClient,
} from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

export const ConnectWallet: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { connect, data, reset, variables, status } = useConnect({
        connector: new InjectedConnector(),
        chainId: CHAIN_ID,
    });

    const { chain } = useNetwork();

    const { switchNetwork } = useSwitchNetwork({
        chainId: CHAIN_ID,
    });

    const buttonText = isConnected
        ? chain?.id == CHAIN_ID
            ? address?.slice(0, 10) + '...'
            : 'Switch Network'
        : 'Connect Wallet';

    const clickFn = isConnected
        ? chain?.id == CHAIN_ID
            ? () => {}
            : () => switchNetwork?.()
        : () => connect({ chainId: CHAIN_ID });

    return (
        <button
            disabled={isConnected && data?.chain.id == CHAIN_ID}
            className="hover:bg-gray-100 border-4 white-background py-1 px-4 rounded-md"
            onClick={clickFn}
        >
            {buttonText}
        </button>
    );
};
