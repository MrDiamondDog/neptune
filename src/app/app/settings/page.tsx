"use client";

import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { editUser, getUser } from "@/app/actions/users";
import Button from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";
import Input from "@/components/primitives/Input";
import Subtext from "@/components/primitives/Subtext";
import { throwToast } from "@/lib/errors";

export default function SettingsPage() {
	const session = useSession();

	const [loading, setLoading] = useState(false);

	const [name, setName] = useState("");
	const [icalUrl, setIcalUrl] = useState("");

	useEffect(() => {
		getUser().then(user => {
			setName(user.name);
			setIcalUrl(user.icalUrl ?? "");
		});
	}, []);

	if (!session || !session.data?.user)
		return null;

	async function save() {
		setLoading(true);

		editUser({
			name,
			icalUrl
		}).catch(async e => {
			setLoading(false);
			throwToast("Could not save.", e);
		}).then(() => setLoading(false));
	}

	return <main className="mx-auto w-fit min-w-200">
		<div className="flex w-full justify-between items-center">
			<h1>Settings</h1>
			<a href="/app/" className="flex items-center link"><ArrowLeft size={20} /> Back</a>
		</div>
		<Divider />

		<p>Name</p>
		<Input className="w-full" value={name} onChange={setName} />

		<p>iCalendar URL</p>
		<Input className="w-full" type="password" value={icalUrl} onChange={setIcalUrl} />
		<Subtext>Connect other calendars to Neptune to display them in the app.</Subtext>
		<Subtext>Make sure to use the private URL or make the calendar public so Neptune can access it.</Subtext>

		<Divider />
		<div className="w-full flex justify-end">
			<Button className="w-fit!" loading={loading} onClick={save}>Save</Button>
		</div>
	</main>;
}
