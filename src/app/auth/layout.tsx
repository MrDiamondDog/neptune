
import { Suspense } from "react";

import Spinner from "@/components/primitives/Spinner";

export default async function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <Suspense fallback={<Spinner />}>
		{children}
	</Suspense>;
}
