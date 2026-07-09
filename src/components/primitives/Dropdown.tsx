import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuContentProps,
	DropdownMenuItem,
	DropdownMenuItemIndicator,
	DropdownMenuItemProps,
	DropdownMenuPortal,
	DropdownMenuProps,
	DropdownMenuRadioItem,
	DropdownMenuRadioItemProps,
	DropdownMenuSeparator,
	DropdownMenuSeparatorProps,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubContentProps,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
	DropdownMenuTriggerProps,
} from "@radix-ui/react-dropdown-menu";
import { ChevronRight, Dot } from "lucide-react";

export function Dropdown(props: DropdownMenuProps) {
	return (<DropdownMenu {...props}>
		{props.children}
	</DropdownMenu>);
}

export function DropdownTrigger(props: DropdownMenuTriggerProps) {
	return (<DropdownMenuTrigger {...props}>
		{props.children}
	</DropdownMenuTrigger>);
}

export function DropdownContent(props: DropdownMenuContentProps) {
	return (<DropdownMenuPortal>
		<DropdownMenuContent {...props}
			className={`${props.className ?? ""} bg-bg-lighter p-2 min-w-40 drop-shadow-lg z-20`}>
			{props.children}
		</DropdownMenuContent>
	</DropdownMenuPortal>);
}

export function DropdownItem(props: DropdownMenuItemProps) {
	return (<DropdownMenuItem {...props}
		className={`${props.className ?? ""} px-2 py-1 hover:bg-bg-lightest cursor-pointer outline-none transition-all`}>
		{props.children}
	</DropdownMenuItem>);
}

export function DropdownSeparator(props: DropdownMenuSeparatorProps) {
	return (<DropdownMenuSeparator {...props} className={`${props.className && ""} border-t border-bg-light my-2`} />);
}

export function DropdownSubMenu(props: { text: string } & DropdownMenuSubContentProps) {
	return <DropdownMenuSub>
		<DropdownMenuSubTrigger asChild>
			<DropdownItem className="flex flex-row justify-between items-center outline-none">
				{props.text}
				<ChevronRight size={14} />
			</DropdownItem>
		</DropdownMenuSubTrigger>
		<DropdownMenuPortal>
			<DropdownMenuSubContent {...props}
				className={`${props.className ?? ""} bg-ctp-mantle border border-ctp-surface0 p-2 min-w-40 shadow-md z-20`}>
				{props.children}
			</DropdownMenuSubContent>
		</DropdownMenuPortal>
	</DropdownMenuSub>;
}

export function DropdownRadioItem(props: DropdownMenuRadioItemProps) {
	return <DropdownMenuRadioItem {...props}
		className={`${props.className ?? ""} px-2 py-1 hover:bg-ctp-surface0 cursor-pointer outline-none transition-all flex items-center gap`}
	>
		<DropdownMenuItemIndicator>
			<Dot size={24} className="-ml-2" />
		</DropdownMenuItemIndicator>
		{props.children}
	</DropdownMenuRadioItem>;
}
