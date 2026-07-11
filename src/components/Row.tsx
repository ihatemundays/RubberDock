import { cloneElement, useEffect, useRef, useState } from "react";
import GridGroup from "./GridGroup";
import { useDockState } from "../store/DockContext";
import { GridGroupType, GridPosition } from "../util/common";
import { getChildren } from "../util/helpers";
import Column from "./Column";

const Row = props => {
    const { onClose: onParentClose, onBind } = props;
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
    const onDrop = (childId, itemId, gridGroupType: GridGroupType, gridPosition: GridPosition) => {
        const { children, items } = stateRef.current;
        let index = childId !== null ?
            children.findIndex(x => x.id === childId) :
            gridPosition === GridPosition.Before ? 0 : children.length - 1;
        if (index === -1) {
            return false;
        }

        if (!(itemId in items)) {
            return false;
        }

        let item: any = {
            item: cloneElement(items[itemId].item),
            id: crypto.randomUUID()
        };

        let next = [...children];
        if (gridGroupType === GridGroupType.Column) {
            const childItem = cloneElement(next[index].item);
            item.item = gridPosition === GridPosition.Before ? (<Column>
                {item.item}
                {childItem}
            </Column>) : (<Column>
                {childItem}
                {item.item}
            </Column>);
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
        const getFlexBasis = element => element.style.flexBasis === '' ? 100.0 : parseFloat(element.style.flexBasis);
        const { x: leftX, width: leftWidth } = left.getBoundingClientRect();
        const relativeX = event.x - leftX;
        const startFlexBasisLeft = getFlexBasis(left);
        const startFlexBasisRight = getFlexBasis(right);
        const startFlexBasis = startFlexBasisLeft + startFlexBasisRight;

        let flexBasisLeft = Math.max(10.0 / 100.0 * startFlexBasis, relativeX / leftWidth * startFlexBasisLeft);
        let flexBasisRight = Math.max(10.0 / 100.0 * startFlexBasis, startFlexBasis - flexBasisLeft);
        flexBasisLeft = startFlexBasis - flexBasisRight;
        left.style.flexBasis = flexBasisLeft + '%';
        right.style.flexBasis = flexBasisRight + '%';
    };

    const isEmpty = children.length === 0;

    // Notifying the parent belongs after render/commit, not during Row's own render.
    useEffect(() => {
        if (isEmpty) {
            onParentClose?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEmpty]);

    if (isEmpty) {
        return null;
    }

    return (<div className="rubber-dock__row">
        {children.map((child, index) => {
            return (<GridGroup
                key={child.id} id={child.id} item={child.item}
                onClose={() => onClose(child.id)}
                onDrop={(itemId, gridGroupType, gridPosition) => onDrop(child.id, itemId, gridGroupType, gridPosition)}
                onResize={index < children.length - 1 ? onResize : null} />);
        })}
    </div>);
};

export default Row;
