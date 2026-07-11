import { createContext, useContext, useSyncExternalStore } from "react";
import { DockStore, DockState } from "./DockStore";

export const DockContext = createContext<DockStore | null>(null);

export const useDockStore = (): DockStore => {
    const store = useContext(DockContext);
    if (!store) {
        throw new Error("Dock components must be rendered inside a <Layout>");
    }
    return store;
};

export const useDockState = (): DockState => {
    const store = useDockStore();
    return useSyncExternalStore(store.subscribe, store.getState);
};
