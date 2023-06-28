import {
    TopContainer,
    PageTop,
    PagePresentation,
} from '@/components/page-components';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
    return (
        <TopContainer>
            <PageTop />
            <div className="space-y-10">
                <div className="pt-4 text-center md:text-start">
                    <PagePresentation />
                </div>
                <div className="pt-5">
                    <Link href="/market/bids">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="font-mono italic text-sm">
                                Enter
                            </div>
                            <div className="flex items-center">
                                <div className="-rotate-90 font-mono italic text-sm">
                                    Enter
                                </div>
                                <span className="text-6xl">🚪</span>
                                <div className="rotate-90 font-mono italic text-sm">
                                    Enter
                                </div>
                            </div>
                            <div className="font-mono italic text-sm">
                                Enter
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </TopContainer>
    );
}
