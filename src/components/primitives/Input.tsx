import RequiredStar from "./RequiredStar";

export default function Input({ onChange, label, ...props }: { onChange?: (value: string) => void, label?: string }
	& Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
	return <div className="w-full">
		{label && <p>{label} {props.required && <RequiredStar />}</p>}
		<input {...props} onChange={e => onChange?.(e.target.value)} className={`${props.className ?? ""}
			outline-none px-2 py-1 bg-bg-lighter border-2 border-transparent focus:border-bg-lightest transition-all`}>
		</input>
	</div>;
}
