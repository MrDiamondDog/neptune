"use client";

import { Popover, PopoverAnchor, PopoverTrigger } from "@radix-ui/react-popover";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { deleteTerm } from "@/app/actions/terms";
import { editUser, getUser } from "@/app/actions/users";
import { useApp } from "@/components/context/NeptuneContext";
import { DashboardCard } from "@/components/misc/DashboardCard";
import Button, { ButtonLooks } from "@/components/primitives/Button";
import PopoverColorPicker from "@/components/primitives/ColorPicker";
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
	const { courses, terms, dispatch } = useApp();

	const [loading, setLoading] = useState(false);

	const [name, setName] = useState("");
	const [userId, setUserId] = useState("");
	const [icalUrl, setIcalUrl] = useState("");
	const [icalColor, setIcalColor] = useState("#38c773");

	const [termPopover, setTermPopover] = useState("");

	useEffect(() => {
		getUser().then(user => {
			if (!user)
				return;
			setName(user.name);
			setUserId(user.id);
			setIcalUrl(user.icalUrl ?? "");
			setIcalColor(user.icalColor);
		});
	}, []);

	async function save() {
		setLoading(true);

		editUser({
			name,
			icalUrl,
			icalColor,
		}).catch(async e => {
			setLoading(false);
			throwToast("Could not save.", e);
		}).then(() => {
			setLoading(false);
			toast.info("Settings saved!");
		});
	}

	async function onDeleteTerm(term: string) {
		deleteTerm(term);
		dispatch({ context: "terms", type: "delete", data: term });
	}

	return <main className="mx-auto w-[95%] md:w-fit md:min-w-200 overflow-x-hidden flex flex-col gap-2">
		<div className="flex md:w-full justify-between items-center">
			<h1>Settings</h1>
			<Link href="/app/" className="flex items-center link"><ArrowLeft size={20} /> Back</Link>
		</div>

		<DashboardCard>
			<p>Name</p>
			<Input className="w-full" value={name} onChange={setName} />

			<p>iCalendar URL</p>
			<Input className="w-full" type="password" value={icalUrl} onChange={setIcalUrl} />
			<Subtext>Subscribe to another calendar to show them in Neptune. Must be a valid ICS URL.</Subtext>
			<Subtext>Make sure to use the private URL or make the calendar public so Neptune can access it.</Subtext>

			<p>iCalendar Event Color</p>
			<PopoverColorPicker color={icalColor} onChange={setIcalColor} />

			<Divider />

			<p>Neptune Course ICS URL</p>
			<div className="flex gap-1">
				<Input className="w-full text-gray-400" type="password" disabled value={`${getPublicEnv().AUTH_URL}/api/ical/${userId}.ics`} />
				<Button
					className="py-1 w-fit!"
					look={ButtonLooks.SECONDARY}
					onClick={() => {
						navigator.clipboard.writeText(`${getPublicEnv().AUTH_URL}/api/ical/${userId}.ics`);
						toast.info("Copied!");
					}}
				>Copy</Button>
			</div>
			<Subtext>Subscribe to this calendar in the calendar app of your choice to add all of your Neptune courses and tasks.</Subtext>
			<Subtext>Don't share this!</Subtext>
		</DashboardCard>

		<DashboardCard>
		<p>Terms</p>
		<div className="flex flex-col gap-2">
			<Popover open={termPopover === "new"} onOpenChange={() => setTermPopover("")}>
				<PopoverAnchor asChild>
					<Button look={ButtonLooks.SECONDARY2} className="py-1" onClick={() => setTermPopover("new")}><Plus size={16} /></Button>
				</PopoverAnchor>
				<EditTermPopover onCreate={() => setTermPopover("")} side="bottom" />
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
		</DashboardCard>

		<Button loading={loading} onClick={save} className="py-1">Save</Button>
		<Button onClick={() => signOut({ redirectTo: "/" })} look={ButtonLooks.SECONDARY}>Log Out</Button>
	</main>;
}
