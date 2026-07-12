import Spinner from "./Spinner";

export enum ButtonLooks {
	PRIMARY = "bg-primary hover:bg-secondary disabled:bg-secondary",
	SECONDARY = "bg-bg-light hover:bg-bg-lightest disabled:bg-bg-lighter",
	SECONDARY2 = "bg-bg-lighter hover:bg-bg-lightest disabled:bg-bg-lightest",
	DANGER = "bg-danger hover:bg-danger-secondary disabled:bg-danger-secondary",
}

export default function Button({ loading, look, ...props }:
	{ loading?: boolean, look?: ButtonLooks } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return <button {...props} disabled={props.disabled || loading} className={`${props.className ?? ""}
		${look ?? ButtonLooks.PRIMARY}
		w-full p-2 enabled:cursor-pointer transition-all flex gap-1 justify-center items-center outline-none`}>
		{loading ? <Spinner /> : props.children}
	</button>;
}
