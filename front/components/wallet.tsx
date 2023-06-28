import { useAccount, useConnect, useEnsName } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

export const ConnectWallet: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    });
    const buttonText = isConnected
        ? address?.slice(0, 10) + '...'
        : 'Connect Wallet';
    return (
        <button
            disabled={isConnected}
            className="hover:bg-gray-100 border-4 py-1 px-4 rounded-md"
            onClick={() => connect()}
        >
            {buttonText}
        </button>
    );
};
