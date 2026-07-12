import React, { createElement } from "react";

import RequiredStar from "./RequiredStar";

export default function Input({ onChange, label, multiline, ...props }: { onChange?: (value: string) => void, label?: string, multiline?: boolean }
	& Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
	const element = multiline ? "textarea" : "input";

	return <div className="w-full">
		{label && <p>{label} {props.required && <RequiredStar />}</p>}
		{createElement(element, {
			...props,
			onChange: e => onChange?.((e.target as HTMLInputElement).value),
			className: `${props.className ?? ""} outline-none px-2 py-1 bg-bg-lighter border-2 border-transparent focus:border-bg-lightest transition-all`
		})}
	</div>;
}
