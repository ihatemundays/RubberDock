import {useDockState} from "../store/DockContext";
import {cloneElement, ReactNode, useEffect, useRef, useState} from "react";
import {getChildren} from "../util/helpers";
import {getTrackTypeClassName, TrackType, GridPosition} from "../util/common";
import Column from "../components/Column";
import Row from "../components/Row";
import {Stack} from "../index";
import MetaDock from "../components/MetaDock";

const useTrack = (props) => {
    const {type} = props;
    const [children, setChildren] = useState(() => getChildren(props.children));
    const stateRef = useRef<any>(null);
    const {items} = useDockState();

    const isEmpty = children.length === 0;

    // Notifying the parent to close after render/commit, not during Track's own render.
    useEffect(() => {
        if (isEmpty) {
            props.onClose?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEmpty]);

    const onClose = (id: string) => {
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

    // stateRef lets onBind's caller (Layout) always reach the latest onDrop, even
    // though onBind itself is only invoked once on mount.
    const onDrop = (childId: string, itemIds: string[], trackType: TrackType, gridPosition: GridPosition) => {
        const { children, items } = stateRef.current;
        let index = childId !== null ?
            children.findIndex((x: { id: any; }) => x.id === childId) :
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
        if (type !== TrackType) {
            const Track = ({children}: {children: ReactNode}) => {
                if (trackType === TrackType.Column) {
                    return (<Column>{children}</Column>);
                }

                // Default to row
                return (<Row>{children}</Row>);
            }

            item.flex = next[index].flex ?? 1;
            const childItem = cloneElement(next[index].item);
            item.item = gridPosition === GridPosition.Before ? (<Track>
                    {item.item}
                    {childItem}
                </Track>) : (<Track>
                    {childItem}
                    {item.item}
                </Track>);
            next.splice(index, 1, item);
        } else if (gridPosition === GridPosition.Before) {
            next.splice(index, 0, item);
        } else {
            next.splice(index + 1, 0, item);
        }
        setChildren(next);

        return true;
    };

    stateRef.current = { children, items, onDrop };

    useEffect(() => {
        props.onBind?.({ onDrop: (...args) => stateRef.current.onDrop(...args) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isEmpty) {
        return null;
    }

    return (<div className={`rubber-dock__${getTrackTypeClassName(type)}`} style={props?.style}>
        {children.map((child, index) => {
                return (<MetaDock
                    key={child.id} id={child.id} item={child.item} flex={child.flex}
                    onClose={() => onClose(child.id)}
                    onDrop={(itemIds: string[], TrackType: TrackType, gridPosition: GridPosition) => onDrop(child.id, itemIds, TrackType, gridPosition)}
                    onResize={index < children.length - 1 ? onResize : null} />);
            })}
        </div>);
}

export default useTrack;