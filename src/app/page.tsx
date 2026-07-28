import Neptune from "@/components/Neptune";
import Button, { ButtonLooks } from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";

export default function Home() {
	return (
		<main className="bg-linear-135 from-bg to-bg-lighter w-full h-screen">
			<div className="absolute-center text-center flex flex-col items-center">
				<Neptune />
				<p className="whitespace-pre-wrap">
					A simple self-hosted app to{"\n"}
					organize your college life.
				</p>
				<Divider />
				<a href="/app" className="w-full"><Button look={ButtonLooks.CUSTOM} className="bg-linear-330 from-primary to-tertiary">Get Started</Button></a>
			</div>
		</main>
	);
}
