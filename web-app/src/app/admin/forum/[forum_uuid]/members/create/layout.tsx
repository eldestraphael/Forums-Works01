import type { Metadata } from "next";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
    title: "Add members | Forums@Work",
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
