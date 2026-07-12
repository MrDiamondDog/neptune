"use client";

import { Popover, PopoverAnchor, PopoverTrigger } from "@radix-ui/react-popover";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { deleteTerm } from "@/app/actions/terms";
import { editUser, getUser } from "@/app/actions/users";
import { useApp } from "@/components/context/NeptuneContext";
import Button, { ButtonLooks } from "@/components/primitives/Button";
import DeletePopover from "@/components/primitives/DeletePopover";
import Divider from "@/components/primitives/Divider";
import Input from "@/components/primitives/Input";
import Subtext from "@/components/primitives/Subtext";
import EditTermPopover from "@/components/terms/EditTermPopover";
import { throwToast } from "@/lib/errors";
import { titleCase } from "@/lib/string";
import { prettyTimeRange } from "@/lib/time";
import { getPublicEnv } from "@/public-env";

export default function SettingsPage() {
	const session = useSession();

	const { courses, terms, dispatch } = useApp();

	const [loading, setLoading] = useState(false);

	const [name, setName] = useState("");
	const [icalUrl, setIcalUrl] = useState("");

	const [termPopover, setTermPopover] = useState("");

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

	async function onDeleteTerm(term: string) {
		deleteTerm(term);
		dispatch({ context: "terms", type: "delete", id: term });
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

		<p>Neptune Course iCalendar URL</p>
		<Input className="w-full text-gray-400" disabled defaultValue={`${getPublicEnv().AUTH_URL}/api/ical/${session.data.user!.id}`} />
		<Subtext>Subscribe to this iCalendar in the calendar app of your choice to add all of your Neptune courses.</Subtext>
		<Subtext>Don't share this!</Subtext>

		<Divider />

		<p>Terms</p>
		<div className="bg-bg-light p-2 flex flex-col gap-2">
			<Popover open={termPopover === "new"} onOpenChange={() => setTermPopover("")}>
				<PopoverAnchor asChild>
					<Button look={ButtonLooks.SECONDARY2} className="py-1" onClick={() => setTermPopover("new")}><Plus size={16} /></Button>
				</PopoverAnchor>
				<EditTermPopover onCreate={() => setTermPopover("")} />
			</Popover>

			{terms.sort((a, b) => a.start.getTime() - b.start.getTime())
				.map(term => <div className="flex justify-between items-center bg-bg-lighter p-2" key={term.id}>
					<div>
						{titleCase(term.season)} {term.year}
						<Subtext>{prettyTimeRange(term.start, term.end)}</Subtext>
						<Subtext>{courses.filter(c => c.termId === term.id).length} course(s)</Subtext>
					</div>

					<div className="flex gap-2">
						<Popover open={termPopover === term.id} onOpenChange={() => setTermPopover("")}>
							<PopoverAnchor>
								<Pencil size={20} className="cursor-pointer" onClick={() => setTermPopover(term.id)} />
							</PopoverAnchor>

							<EditTermPopover term={term} onCreate={() => setTermPopover("")} />
						</Popover>

						<Popover>
							<PopoverTrigger>
								<Trash2 size={20} className="cursor-pointer" />
							</PopoverTrigger>

							<DeletePopover what={`Term ${titleCase(term.season)} ${term.year}`} onDelete={() => onDeleteTerm(term.id)} />
						</Popover>
					</div>
				</div>)}
		</div>

		<Divider />
		<div className="w-full flex justify-end">
			<Button className="w-fit!" loading={loading} onClick={save}>Save</Button>
		</div>
	</main>;
}
