import { useEffect } from "react";
import { useDockStore } from "../store/DockContext";

export const useRegisterStack = id => {
    const store = useDockStore();

    useEffect(() => {
        store.registerStack(id);
        return () => {
            store.deregisterStack(id);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
