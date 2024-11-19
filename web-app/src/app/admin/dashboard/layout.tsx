import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Forums | Forums@Work",
    description: "Forum Project",
};

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <section suppressHydrationWarning >
            {children}
        </section>
    );
}
