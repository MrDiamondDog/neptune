import { auth } from "@/auth";
import { NeptuneProvider } from "@/components/context/NeptuneContext";
import { redirect } from "next/navigation";

export default async function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	if (!(await auth())?.user)
		return redirect("/auth");

	return <NeptuneProvider>
		{children}
	</NeptuneProvider>
}
