import { hexToRgb } from "@/lib/colors";

import PopoverColorPicker from "../primitives/ColorPicker";

export const courseColors = [
    "#000000", // black
    "#ffffff", // white
    "#ff0000", // red
    "#ffa500", // orange
    "#ffff00", // yellow
    "#00ff00", // lime
    "#008000", // green
    "#0000ff", // dark blue
    "#00bfff", // cyan
    "#00ffff", // light blue
    "#8000ff", // purple
    "#ff00ff", // pink
];

export default function CourseColorPicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    return (<>
        <div className="flex flex-row flex-wrap gap-1 my-2 justify-center">
            {courseColors.map(c => <ColorEntry key={c} selected={value === c} onClick={() => onChange(c)} color={c} />)}
        </div>

        <PopoverColorPicker color={value} onChange={onChange} />
    </>);
}

export function ColorEntry({ color, selected, onClick }:
    { selected?: boolean, onClick?: () => void, color: string }) {
    return (
		<div
			className="bg-bg-lighter px-0.5 py-0.5 text-center cursor-pointer transition-all border-2 select-none min-w-7.5 min-h-7.5"
			style={{ backgroundColor: `rgba(${Object.values(hexToRgb(color)!).join(", ")}, 0.5)`, borderColor: color }}
			onClick={onClick}
        />
    );
}
