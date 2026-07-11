export type DockState = {
    dragging: boolean;
    stacks: Record<string, { items: string[]; focus: string | null }>;
    items: Record<string, { item: any; isFullscreen: boolean; poppedOut: boolean }>;
};

const initialState: DockState = { dragging: false, stacks: {}, items: {} };

// The whole dock's state as one object, updated only through the methods
// below and broadcast via the native EventTarget "change" event - no Redux,
// no reducers, just a small store React reads through useSyncExternalStore.
export class DockStore extends EventTarget {
    private state: DockState = initialState;

    getState = (): DockState => this.state;

    subscribe = (listener: () => void): (() => void) => {
        this.addEventListener('change', listener);
        return () => this.removeEventListener('change', listener);
    };

    private setState(patch: Partial<DockState>) {
        this.state = { ...this.state, ...patch };
        this.dispatchEvent(new Event('change'));
    }

    inDrag = () => this.setState({ dragging: true });
    outDrag = () => this.setState({ dragging: false });

    registerStack = (id: string) => {
        if (id in this.state.stacks) {
            return;
        }
        this.setState({ stacks: { ...this.state.stacks, [id]: { items: [], focus: null } } });
    };

    deregisterStack = (id: string) => {
        if (!(id in this.state.stacks)) {
            return;
        }
        const stacks = { ...this.state.stacks };
        delete stacks[id];
        this.setState({ stacks });
    };

    focusItem = (stackId: string, id: string) => {
        const stack = this.state.stacks[stackId];
        if (!stack || !stack.items.includes(id)) {
            return;
        }
        this.setState({ stacks: { ...this.state.stacks, [stackId]: { ...stack, focus: id } } });
    };

    registerItem = (stackId: string, stackIndex: number, id: string, item: any, focus?: boolean) => {
        let { items, stacks } = this.state;

        if (!(id in items)) {
            items = { ...items, [id]: { item: { ...item }, isFullscreen: false, poppedOut: false } };
        }

        const existingStack = stacks[stackId] ?? { items: [], focus: null };
        if (existingStack.items.includes(id)) {
            this.setState({ items });
            return;
        }

        const stackItems = [...existingStack.items];
        stackItems.splice(stackIndex, 0, id);
        const stack = { items: stackItems, focus: focus || existingStack.focus === null ? id : existingStack.focus };

        this.setState({ items, stacks: { ...stacks, [stackId]: stack } });
    };

    deregisterItem = (stackId: string, id: string) => {
        const items = { ...this.state.items };
        delete items[id];

        const stack = this.state.stacks[stackId];
        if (!stack) {
            this.setState({ items });
            return;
        }

        const index = stack.items.indexOf(id);
        if (index === -1) {
            this.setState({ items });
            return;
        }

        const stackItems = [...stack.items];
        stackItems.splice(index, 1);
        let focus = stack.focus;
        if (id === stack.focus) {
            focus = index < stackItems.length ? stackItems[index] : stackItems[stackItems.length - 1] ?? null;
        }

        this.setState({ items, stacks: { ...this.state.stacks, [stackId]: { items: stackItems, focus } } });
    };

    dropItem = (stackId: string, id: string, newId: string, position: number) => {
        const { items, stacks } = this.state;
        if (!(id in items) || newId in items) {
            return;
        }
        const nextItems = { ...items, [newId]: { item: { ...items[id].item }, isFullscreen: false, poppedOut: false } };

        const stack = stacks[stackId];
        if (!stack) {
            this.setState({ items: nextItems });
            return;
        }

        const stackItems = [...stack.items];
        stackItems.splice(position, 0, newId);

        this.setState({ items: nextItems, stacks: { ...stacks, [stackId]: { ...stack, items: stackItems } } });
    };

    toggleItemFullscreen = (id: string) => {
        const item = this.state.items[id];
        if (!item) {
            return;
        }
        this.setState({ items: { ...this.state.items, [id]: { ...item, isFullscreen: !item.isFullscreen } } });
    };

    popOutItem = (id: string) => {
        const item = this.state.items[id];
        if (!item || item.poppedOut) {
            return;
        }
        this.setState({ items: { ...this.state.items, [id]: { ...item, isFullscreen: false, poppedOut: true } } });
    };

    dockItem = (id: string) => {
        const item = this.state.items[id];
        if (!item || !item.poppedOut) {
            return;
        }
        this.setState({ items: { ...this.state.items, [id]: { ...item, poppedOut: false } } });
    };
}
