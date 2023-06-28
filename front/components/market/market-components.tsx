import Link from 'next/link';
import { PageTop } from '../page-components';
export const MarketNavBar: React.FC = () => {
    return (
        <div className="flex font-mono md:text-lg justify-center py-5 space-x-4 md:space-x-16">
            <div>
                <Link href="/market/bids">
                    <span className="hover:underline underline-offset-2">
                        Bids
                    </span>
                </Link>
            </div>
            <div>
                <Link href="/market/asks">
                    <span className="hover:underline underline-offset-2">
                        Asks
                    </span>
                </Link>
            </div>
            <div>
                <Link href="/market/list">
                    <span className="hover:underline underline-offset-2">
                        List
                    </span>
                </Link>{' '}
            </div>
            <div>
                <Link href="/market/my-activity">
                    <span className="hover:underline underline-offset-2">
                        Activity
                    </span>
                </Link>
            </div>
            <div>
                <Link href="/market/decrypt">
                    <span className="hover:underline underline-offset-2">
                        Decrypt
                    </span>
                </Link>
            </div>
        </div>
    );
};

export const MarketPageTop: React.FC = () => {
    return (
        <>
            <PageTop />
        </>
    );
};
