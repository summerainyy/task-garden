import { useEffect, useState } from "react";

const resolve = (v) => (typeof v === "function" ? v() : v);

// useState that remembers its value in the browser between visits
export function useLocalStorage(key, initial) {
    const [value, setValue] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved != null ? JSON.parse(saved) : resolve(initial);
        } catch {
            return resolve(initial);
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            /* storage blocked — keep working in memory */
        }
    }, [key, value]);

    return [value, setValue];
}
