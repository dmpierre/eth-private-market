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
        <div className="text-lg text-center space-y-4 white-background">
            <p>Welcome!</p>
            <p>
                Private markets leverage zero-knowledge and decentralized
                ledgers to privately and trustlessly exchange data.
            </p>
            <p>
                You might want to have a look at how this app works{' '}
                <a
                    className="underline"
                    href="https://github.com/dmpierre/eth-private-market/tree/main/how-to"
                    target={'_blank'}
                    rel={'noreferrer'}
                >
                    {' '}
                    here.
                </a>{' '}
                We also have a{' '}
                <Link className="underline" href={'/whatisthis'}>
                    blog post
                </Link>{' '}
                detailing everything.
            </p>
            <p>
                If you prefer to dive right into the code, you can find our repo{' '}
                <Link
                    target="_blank"
                    className="underline"
                    href={'https://github.com/dmpierre/eth-private-market'}
                >
                    here
                </Link>
                .
            </p>
        </div>
    );
};

export const Title: React.FC = () => {
    return (
        <div className="text-center font-mono text-4xl font-bold white-background">
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

export const SectionTitle: React.FC<{ text: string; size: string }> = ({
    text,
    size,
}) => {
    return <div className={`${size} font-bold`}>{text}</div>;
};

export const Paragraph: React.FC<{ text: string }> = ({ text }) => {
    return <p className="p-2">{text}</p>;
};

interface LinkToTabProps {
    text: string;
    href: string;
}

export const LinkToTab: React.FC<LinkToTabProps> = ({ text, href }) => {
    return (
        <a className="underline" href={href} rel="noreferrer" target="_blank">
            {text}
        </a>
    );
};
