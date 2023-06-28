import { PropsWithChildren } from 'react';
import { ConnectWallet } from './wallet';
import Link from 'next/link';
import { FooterArt } from './misc/footer-art';

export const TopContainer: React.FC<PropsWithChildren<{}>> = (props) => {
    return (
        <>
            <div
                className="flex p-10 flex-col items-center"
                style={{ margin: '0px auto' }}
            >
                {props.children}
            </div>
            <div className="flex justify-center">
                <footer className="p-5 text-center">
                    <FooterArt />
                </footer>
            </div>
        </>
    );
};

export const PagePresentation: React.FC<{ text?: string }> = () => {
    return (
        <div className="text-lg text-center space-y-4">
            <p>Welcome!</p>
            <p>
                You might want to have a look at how this app works{' '}
                <a
                    className="underline"
                    href=""
                    target={'_blank'}
                    rel={'noreferrer'}
                >
                    {' '}
                    here.
                </a>{' '}
                We also have a{' '}
                <a
                    className="underline"
                    href=""
                    target={'_blank'}
                    rel={'noreferrer'}
                >
                    blog post
                </a>
                !
            </p>
            <p>
                Private markets leverage zero-knowledge and decentralized
                ledgers to privately and trustlessly exchange data.
            </p>
        </div>
    );
};

export const Title: React.FC = () => {
    return (
        <div className="text-center font-mono text-4xl font-bold">
            <Link href="/">Private Market</Link>
        </div>
    );
};

export const PageTop: React.FC = () => {
    return (
        <header className="flex flex-col w-8/12 lg:w-5/12">
            <Title></Title>
            <div className="md:text-end text-center py-5">
                <ConnectWallet></ConnectWallet>
            </div>
        </header>
    );
};
