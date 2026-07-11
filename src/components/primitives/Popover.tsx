import * as RadixPopover from "@radix-ui/react-popover";

export function Popover(props: RadixPopover.PopoverProps) {
	return <RadixPopover.Root {...props}>
		{props.children}
	</RadixPopover.Root>;
}

export function PopoverContent(props: RadixPopover.PopoverContentProps) {
	return <RadixPopover.Portal>
		<RadixPopover.Content {...props} className={`${props.className ?? ""} bg-bg-light drop-shadow-lg p-2 z-10 outline-none`}>
			{props.children}
		</RadixPopover.Content>
	</RadixPopover.Portal>;
}

export function PopoverArrow(props: RadixPopover.PopoverArrowProps) {
	return <RadixPopover.PopoverArrow {...props} width={15} height={10} className="fill-bg-lightest" />;
}
