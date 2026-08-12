import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { NeptuneProvider } from "@/components/context/NeptuneContext";
import Spinner from "@/components/primitives/Spinner";

export default async function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	if (!(await auth())?.user && process.env.IS_DEMO !== "true")
		return redirect("/auth");

	return <NeptuneProvider>
		<Suspense fallback={<Spinner />}>
			{children}
		</Suspense>
	</NeptuneProvider>;
}
