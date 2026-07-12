import "./globals.css";

import { CheckCircle2, CircleAlert, Info } from "lucide-react";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

import { PublicEnv } from "@/public-env";

const lexend = Lexend({
	variable: "--font-lexend",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Neptune",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${lexend.variable} h-full antialiased dark bg-bg`}
		>
			<head>
				{/* <Script
					src="//unpkg.com/react-scan/dist/auto.global.js"
					crossOrigin="anonymous"
					strategy="beforeInteractive"
				/>*/}
			</head>
			<body className="min-h-full">
				<SessionProvider>
					{children}
				</SessionProvider>

				<PublicEnv />

				<Toaster
					className="toaster group"
					theme="dark"
					richColors
					style={{
						"--normal-bg": "var(--catppuccin-color-surface0)",
						"--normal-text": "var(--catppuccin-color-text)",
						"--normal-border": "var(--catppuccin-color-surface1)",
					} as React.CSSProperties}
					visibleToasts={5}
					position="bottom-center"
					icons={{
						success: <CheckCircle2 size={20} />,
						error: <CircleAlert size={20} />,
						info: <Info size={20} />,
					}}
				/>

				<div id="portal-root" />
			</body>
		</html>
	);
}
