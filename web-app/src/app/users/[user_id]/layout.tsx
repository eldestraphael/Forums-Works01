import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Edit User | Forums@Work',
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