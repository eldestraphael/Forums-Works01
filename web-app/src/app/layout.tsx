import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import NextAuthProvider from "@/components/nextAuthProvider";
import Sidebar from "@/components/sidebar";
import { ReduxProvider } from "@/redux/reduxProvider";
import FirebaseSetup from '@/firebase/firebaseSetup';
import { work_sans } from '@/util/fonts';
import ThemeRegistry from "../theme/ThemeRegistry";

export const metadata: Metadata = {
    title: "Forums@Work",
    description: "Forum Project",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${work_sans}`}>
                <ThemeRegistry>
                    <NextAuthProvider>
                        <ReduxProvider>
                            <AppRouterCacheProvider>
                                <FirebaseSetup />
                                <Sidebar />
                                {children}
                            </AppRouterCacheProvider>
                        </ReduxProvider>
                    </NextAuthProvider>
                </ThemeRegistry>
            </body>
        </html>
    );
}
