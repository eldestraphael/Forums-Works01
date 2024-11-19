import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Edit Course | Forums@Work',
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