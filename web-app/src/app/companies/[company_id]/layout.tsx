
import { Metadata } from 'next';
import MsalWrapper from '@/app/azure_service/MsalWrapper';

export const metadata: Metadata = {
    title: 'Edit Company | Forums@Work',
    description: 'Forum Project'
}

export default function layout({
    children
}: Readonly<{
    children: React.ReactNode;
}>
) {
    return (
        <section>
            <MsalWrapper>
                {children}
            </MsalWrapper>
        </section>
    )
}