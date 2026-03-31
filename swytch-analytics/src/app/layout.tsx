import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
    title: "Statsy",
    description: "Google Analytics dashboard powered by SwytchCode",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body suppressHydrationWarning={true}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}