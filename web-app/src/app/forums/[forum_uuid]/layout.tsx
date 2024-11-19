import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Edit Forum | Forums@Work',
    description: 'Forum Project'
}

export default function Layout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <section>
            {children}
        </section>
    )

}