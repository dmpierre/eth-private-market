import { TopContainer, PageTop } from '@/components/page-components';

export const art404 = `
  _  _    ___  _  _   
 | || |  / _ \\| || |  
 | || |_| | | | || |_ 
 |__   _| | | |__   _|
    | | | |_| |  | |  
     |_|  \\___/   |_|   

`;
export default function Page404() {
    return (
        <TopContainer>
            <PageTop />
            <div className="p-5 text-center">
                <pre>{art404}</pre>
            </div>
        </TopContainer>
    );
}
