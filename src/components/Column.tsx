import { cloneElement, useEffect, useRef, useState } from "react";
import GridGroup from "./GridGroup";
import { useDockState } from "../store/DockContext";
import { GridGroupType, GridPosition } from "../util/common";
import { getChildren } from "../util/helpers";
import Row from "./Row";
import Stack from "./Stack";

const Column = props => {
    const { onClose: onParentClose, onBind, style } = props;
    const { items } = useDockState();
    const [children, setChildren] = useState(() => getChildren(props.children));

    const onClose = id => {
        setChildren(prev => {
            const index = prev.findIndex(x => x.id === id);
            if (index === -1) {
                return prev;
            }
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    };

    // stateRef lets onBind's caller (Layout) always reach the latest onDrop, even
    // though onBind itself is only invoked once on mount.
    const stateRef = useRef<any>(null);
    const onDrop = (childId, itemIds: string[], gridGroupType: GridGroupType, gridPosition: GridPosition) => {
        const { children, items } = stateRef.current;
        let index = childId !== null ?
            children.findIndex(x => x.id === childId) :
            gridPosition === GridPosition.Before ? 0 : children.length - 1;

        if (index === -1) {
            return false;
        }

        if (itemIds.length === 0 || itemIds.some(itemId => !(itemId in items))) {
            return false;
        }

        let item: any = {
            // A single dragged tab becomes a bare item (GridGroup wraps it in
            // its own Stack); a whole dragged stack is rebuilt as a Stack here
            // so all its tabs land together in the new split.
            item: itemIds.length === 1
                ? cloneElement(items[itemIds[0]].item)
                : (<Stack>{itemIds.map(itemId => cloneElement(items[itemId].item))}</Stack>),
            id: crypto.randomUUID(),
            flex: 1
        };

        let next = [...children];
        if (gridGroupType === GridGroupType.Row) {
            // The new split replaces the existing slot, so it inherits that
            // slot's flex weight instead of resetting it back to 1.
            item.flex = next[index].flex ?? 1;
            const childItem = cloneElement(next[index].item);
            item.item = gridPosition === GridPosition.Before ? (<Row>
                {item.item}
                {childItem}
            </Row>) : (<Row>
                {childItem}
                {item.item}
            </Row>);
            next.splice(index, 1, item);
        } else {
            if (gridPosition === GridPosition.Before) {
                next.splice(index, 0, item);
            } else {
                next.splice(index + 1, 0, item);
            }
        }

        setChildren(next);
        return true;
    };
    stateRef.current = { children, items, onDrop };

    useEffect(() => {
        onBind?.({ onDrop: (...args) => stateRef.current.onDrop(...args) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onResize = (event, left, right) => {
        const getFlexBasis = element => element.style.flexBasis === '' ? 100 : parseFloat(element.style.flexBasis);
        const { y: leftY, height: leftHeight } = left.getBoundingClientRect();
        const relativeY = event.y - leftY;
        const startFlexBasisLeft = getFlexBasis(left);
        const startFlexBasisRight = getFlexBasis(right);
        const startFlexBasis = startFlexBasisLeft + startFlexBasisRight;

        let flexBasisLeft = Math.max(10 / 100 * startFlexBasis, relativeY / leftHeight * startFlexBasisLeft);
        let flexBasisRight = Math.max(10 / 100 * startFlexBasis, startFlexBasis - flexBasisLeft);
        flexBasisLeft = startFlexBasis - flexBasisRight;
        left.style.flexBasis = flexBasisLeft + '%';
        right.style.flexBasis = flexBasisRight + '%';
    };

    const isEmpty = children.length === 0;

    // Notifying the parent belongs after render/commit, not during Column's own render.
    useEffect(() => {
        if (isEmpty) {
            onParentClose?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEmpty]);

    if (isEmpty) {
        return null;
    }

    return (<div className="rubber-dock__column" style={style}>
        {children.map((child, index) => {
            return (<GridGroup
                key={child.id} id={child.id} item={child.item} flex={child.flex}
                onClose={() => onClose(child.id)}
                onDrop={(itemIds, gridGroupType, gridPosition) => onDrop(child.id, itemIds, gridGroupType, gridPosition)}
                onResize={index < children.length - 1 ? onResize : null} />);
        })}
    </div>);
};

export default Column;
