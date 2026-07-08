import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "./Dropdown";
import Input from "./Input";
import Subtext from "./Subtext";

type SelectProps = {
	options: Record<string, React.ReactNode>;
	disabledOptions?: string[]
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
} & Omit<React.SelectHTMLAttributes<HTMLButtonElement>, "value" | "onChange" | "children">;

export function Select({ options, value, onChange, placeholder, disabledOptions, ...props }: SelectProps) {
	return (
		<Dropdown>
			<DropdownTrigger asChild>
				<button {...props} className={`px-2 py-1 pr-2 bg-bg-lighter border-2 outline-none
                flex flex-row justify-between gap-4 items-center border-transparent focus:border-bg-lightest transition-all w-full
                cursor-pointer text-sm ${props.className ?? ""}`}>
					{options[value] ?? <Subtext>{placeholder}</Subtext>}
					<ChevronDown />
				</button>
			</DropdownTrigger>
			<DropdownContent className="z-200 drop-shadow-lg">
				{Object.keys(options)
					.map(k => <DropdownItem
						onClick={() => onChange(k)}
						className={`${value === k && "border-bg-lightest!"} border-2 border-transparent`}
						key={k}
						disabled={disabledOptions?.includes(k)}
					>
						{options[k]}
					</DropdownItem>)
				}
			</DropdownContent>
		</Dropdown>
	);
}

type SelectMultipleProps = {
	options: Record<string, React.ReactNode>;
	values: string[];
	onChange: (newVals: string[]) => void;
	placeholder?: string;
	searchable?: boolean;
} & Omit<React.SelectHTMLAttributes<HTMLButtonElement>, "value" | "onChange" | "children">;

export function SelectMultiple({ options, values, onChange, placeholder, searchable, ...props }: SelectMultipleProps) {
	const [search, setSearch] = useState("");

	return (
		<Dropdown>
			<DropdownTrigger asChild>
				<button {...props} className={`px-2 py-1 pr-2 rounded-lg bg-bg-lighter border-2 outline-none drop-shadow-lg
                flex flex-row justify-between gap-4 items-center border-transparent focus:border-primary transition-all
                cursor-pointer text-sm ${props.className ?? ""}`}>
					{!values.length && <Subtext>{placeholder}</Subtext>}
					{values.length === 1 && options[values[0]]}
					{values.length >= 2 && `${values.length} selected`}
					<ChevronDown />
				</button>
			</DropdownTrigger>
			<DropdownContent>
				{/* TODO: search unfocuses after some character inputs */}
				{searchable &&
					<Input
						placeholder="Search..."
						className="mb-1 border-2 border-bg-lightest!"
						value={search}
						onChange={setSearch}
						autoFocus
					/>
				}
				{Object.keys(options)
					.filter(o => !search || o.toLowerCase().includes(search.toLowerCase()))
					.map(k => <DropdownItem
						onClick={() => {
							if (values.includes(k))
								onChange(values.filter(v => v !== k));
							else
								onChange([...values, k]);
						}}
						className={"border-2 border-transparent flex flex-row gap-1 items-center not-last:mb-1"}
						key={k}
						onSelect={e => e.preventDefault()}
					>
						{options[k]}
					</DropdownItem>)
				}
			</DropdownContent>
		</Dropdown>
	);
}
