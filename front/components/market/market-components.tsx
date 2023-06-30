import Link from 'next/link';
import { PageTop } from '../page-components';

interface MarketNavBarProps {
    active: 'bids' | 'asks' | 'list' | 'activity' | 'decrypt';
}
export const MarketNavBar: React.FC<MarketNavBarProps> = ({active}) => {
    const bidsUnderline = active == 'bids' ? 'underline' : 'hover:underline';
    const asksUnderline = active == 'asks' ? 'underline' : 'hover:underline';
    const listUnderline = active == 'list' ? 'underline' : 'hover:underline';
    const activityUnderline = active == 'activity' ? 'underline' : 'hover:underline';
    const decryptUnderline = active == 'decrypt' ? 'underline' : 'hover:underline';
    
    return (
        <div className="flex font-mono md:text-lg justify-center py-5 space-x-4 md:space-x-16">
            <div>
                <Link href="/market/bids">
                    <span className={`${bidsUnderline} underline-offset-2`}>
                        Bids
                    </span>
                </Link>
            </div>
            <div>
                <Link href="/market/asks">
                    <span className={`${asksUnderline} underline-offset-2`}>
                        Asks
                    </span>
                </Link>
            </div>
            <div>
                <Link href="/market/list">
                    <span className={`${listUnderline} underline-offset-2`}>
                        List
                    </span>
                </Link>{' '}
            </div>
            <div>
                <Link href="/market/my-activity">
                    <span className={`${activityUnderline} underline-offset-2`}>
                        Activity
                    </span>
                </Link>
            </div>
            <div>
                <Link href="/market/decrypt">
                    <span className={`${decryptUnderline} underline-offset-2`}>
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
