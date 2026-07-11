export const getChildren = (initialChildren) => {
    let children = initialChildren instanceof Array ? initialChildren : [initialChildren];

    return children.map(item => ({
        item,
        id: crypto.randomUUID()
    }));
};
