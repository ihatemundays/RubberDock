export const getChildren = (initialChildren) => {
    let children = initialChildren instanceof Array ? initialChildren : [initialChildren];

    return children.map(item => ({
        item,
        id: crypto.randomUUID(),
        flex: item.props?.flex ?? 1
    }));
};

// A drag payload is either a single tab (type 'item') or a whole tab group
// dragged as a unit via shift (type 'stack') - in the latter case the ids
// come from the source stack's current item order, not the dataTransfer.
export const resolveDraggedItemIds = (type: string, stackId: string, itemId: string, stacks: Record<string, { items: string[] }>): string[] =>
    type === 'stack' ? (stacks[stackId]?.items ?? []) : [itemId];
