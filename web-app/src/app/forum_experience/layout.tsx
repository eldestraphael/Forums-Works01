import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Learning Management System | Forums@Work",
    description: "Forum Project",
};

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <section>
            {children}
        </section>
    );
}