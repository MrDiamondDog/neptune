"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Like `useState`, but the setter patches instead of replaces. Useful for large objects.
 * Equivelant to `setState({ ...object, newData })`
 * @param initial Initial object.
 * @returns `useState` return values
 */
export function useObjectState<T extends object>(initial: T) {
    const [state, setState] = useState(initial);

    const update = useCallback((patch: Partial<T>) => {
        setState(prev => ({ ...prev, ...patch }));
    }, []);

    const reset = useCallback(() => {
        setState(initial);
    }, [initial]);

    return [state, update, reset] as const;
}

/**
 * A hook for checking the current device by screen width.
 * @returns [isMobile, width]
 */
export function useDevice() {
    const [width, setWidth] = useState(0);

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        setWidth(window.innerWidth);
        window.addEventListener("resize", handleWindowSizeChange);
        return () => {
            window.removeEventListener("resize", handleWindowSizeChange);
        };
    }, []);

    const isMobile = (!width ? false : width <= 768);

    return [isMobile, width] as const;
}
