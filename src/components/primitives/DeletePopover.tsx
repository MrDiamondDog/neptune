import { PopoverClose } from "@radix-ui/react-popover";

import Button, { ButtonLooks } from "./Button";
import Divider from "./Divider";
import { PopoverContent } from "./Popover";
import Subtext from "./Subtext";

export default function DeletePopover({ what, onDelete }: { what: string, onDelete: () => void }) {
	return <PopoverContent side="right" className="border-2 border-bg-lighter">
		<p>Delete {what}?</p>
		<Subtext>Once deleted, it can't be recovered.</Subtext>
		<Divider />
		<div className="w-full flex gap-2">
			<PopoverClose asChild><Button look={ButtonLooks.SECONDARY2}>Cancel</Button></PopoverClose>
			<Button look={ButtonLooks.DANGER} onClick={onDelete}>Delete</Button>
		</div>
	</PopoverContent>;
}
