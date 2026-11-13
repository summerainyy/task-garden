import { createContext, useContext } from "react";

export const StoreContext = createContext(null);

// Access tasks, lists, settings and every create/update/delete action.
export function useStore() {
    const store = useContext(StoreContext);
    if (!store) throw new Error("useStore must be used inside <StoreProvider>");
    return store;
}
