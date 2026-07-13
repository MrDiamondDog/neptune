"use client";

import { Info, OctagonAlert, X } from "lucide-react";

import Divider from "./Divider";
import Portal from "./Portal";
import Subtext from "./Subtext";

export type ModalProps = {
	open?: boolean,
	onClose: () => void
};

type Props = {
	title: string;
	level?: number;
	danger?: boolean;
} & ModalProps & React.PropsWithChildren;

export default function Modal({ children, title, open, onClose, danger }: Props) {
	return (<Portal>
		{(open === undefined ? true : open) && <div
			key="bg"
			className="fixed inset-0 bg-black opacity-50 z-100"
			onClick={e => {
				e.stopPropagation();
				onClose();
			}}
		/>}

		{(open === undefined ? true : open) && <div
			key="content"
			className={`fixed top-1/2 left-1/2 -translate-1/2 bg-bg-light min-h-25 max-h-[95vh] md:w-fit w-[98vw]
                overflow-scroll border-2 ${danger ? "border-danger" : "border-bg-lighter"} px-4 py-3 z-110`}
		>
			<ModalTitle onClose={onClose}>{title}</ModalTitle>

			{children}
		</div>}
	</Portal>);
}

export function ModalTitle({ children, onClose }: { onClose: () => void } & React.PropsWithChildren) {
	return (<div className="flex flex-row gap-10 justify-between items-center">
		<h2 className="text-lg md:text-xl">{children}</h2>
		<X size={32} className="p-1 cursor-pointer transition-all hover:bg-ctp-surface0" onClick={onClose} />
	</div>);
}

export function ModalHeader({ children }: React.PropsWithChildren) {
	return (<>
		<Subtext>{children}</Subtext>
		<Divider />
	</>);
}

export function ModalFooter({ children, tip, error }: { tip?: string, error?: string } & React.PropsWithChildren) {
	return (<>
		<Divider />
		<div className="flex flex-col gap-2 md:flex-row justify-between w-full items-end">
			<div className="flex flex-col gap-2 w-full">
				{error && <p className="text-gray-400 flex flex-row gap-2 items-center">
					<OctagonAlert className="text-danger min-w-8 min-h-8" /> {error}
				</p>}
				{tip && <Subtext className="text-xs flex flex-row gap-2 items-center md:min-w-0 min-w-75">
					<Info className="text-primary min-w-8 min-h-8" /> {tip}
				</Subtext>}
			</div>
			<div className="flex flex-row gap-1 justify-end">
				{children}
			</div>
		</div>
	</>);
}
