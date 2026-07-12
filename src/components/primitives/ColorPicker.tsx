import React, { useCallback, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

import { hexToRgb } from "@/lib/colors";

import Input from "./Input";

function useClickOutside(ref: React.RefObject<HTMLDivElement | null>, handler: (e: MouseEvent) => void) {
    useEffect(() => {
        let startedInside = false;
        let startedWhenMounted = false;

        function listener(event: MouseEvent) {
            if (startedInside || !startedWhenMounted)
                return;
            if (!ref.current || ref.current.contains(event.target as Node))
                return;

            handler(event);
        }

        function validateEventStart(event: Event) {
            startedWhenMounted = !!ref.current;
            startedInside = ref.current! && ref.current.contains(event.target as Node);
        }

        document.addEventListener("mousedown", validateEventStart);
        document.addEventListener("touchstart", validateEventStart);
        document.addEventListener("click", listener);

        return () => {
            document.removeEventListener("mousedown", validateEventStart);
            document.removeEventListener("touchstart", validateEventStart);
            document.removeEventListener("click", listener);
        };
    }, [ref, handler]);
}

export default function PopoverColorPicker({ color, onChange }: { color: string, onChange: (color: string) => void }) {
    const popover = useRef<HTMLDivElement | null>(null);
    const [isOpen, toggle] = useState(false);

    const close = useCallback(() => toggle(false), []);
    useClickOutside(popover, close);

    return (
        <div className="flex flex-col items-center justify-center gap-2">
			<div
				className="p-2 w-full h-10 cursor-pointer transition-all border-2 text-center"
				style={{ backgroundColor: `rgba(${Object.values(hexToRgb(color)!).join(", ")}, 0.5)`, borderColor: color }}
				onClick={() => toggle(true)}
			>{!isOpen && "click here for color picker"}</div>

            {isOpen && (
                <div className="popover flex flex-col items-center gap-2" ref={popover}>
                    <HexColorPicker color={color} onChange={onChange} />
                    <Input placeholder="Hex Code" value={color} onChange={onChange} />
                </div>
            )}
        </div>
    );
}
