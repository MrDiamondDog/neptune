import Link from "next/link";

export default function Neptune() {
	return <Link className="flex gap-2 items-center" href="/">
		<img src="/neptune.png" className="w-8" />
		<h1 className="text-3xl bg-linear-330 from-[#7d9fe2] to-[#3056a5] bg-clip-text text-transparent hidden md:block">Neptune</h1>
	</Link>;
}
