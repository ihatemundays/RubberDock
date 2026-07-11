import { useEffect } from "react";
import { useDockStore } from "../store/DockContext";

export const useRegisterItem = (stackId, stackIndex, id, item, focus) => {
    const store = useDockStore();

    useEffect(() => {
        store.registerItem(stackId, stackIndex, id, item, focus);
        // Registration happens once on mount, mirroring the item's lifetime in its stack.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
