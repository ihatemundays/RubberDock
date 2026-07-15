import { cloneElement, FunctionComponent, ReactElement, useEffect, useRef, useState } from "react";
import { DockStore } from "../store/DockStore";
import { DockContext, useDockState, useDockStore } from "../store/DockContext";
import Row from "./Row";
import Column from "./Column";
import { GridGroupType, GridPosition } from "../util/common";
import { resolveDraggedItemIds } from "../util/helpers";

type LayoutProps = {
    children: ReactElement;
};

// How close to an outer edge (in px) a drag has to be to count as targeting
// that edge. Kept as pointer-coordinate math rather than an overlay element
// so nothing ever physically covers content near the boundary - an overlay
// there would swallow mousedown/click on any tab that happens to sit within
// this band (e.g. the first/last stack in a layout that fills its container).
const EDGE_ZONE_SIZE = 48;

const Layout: FunctionComponent<LayoutProps> = ({ children }) => {
    // One store per Layout instance, so multiple <Layout>s on a page stay isolated.
    const [store] = useState(() => new DockStore());

    return (<DockContext.Provider value={store}>
        <LayoutInner>
            {children}
        </LayoutInner>
    </DockContext.Provider>);
};

const LayoutInner = ({ children }) => {
    const store = useDockStore();
    const { dragging, stacks } = useDockState();
    const ref = useRef<HTMLDivElement>(null);

    // The user's root is always kept nested one level inside a wrapper of the
    // opposite axis, present from the very first render, so BOTH axes are
    // always already mounted. A top/bottom/left/right edge drop is then
    // always a same-type sibling insert into an already-mounted Row/Column -
    // never a type swap.
    //
    // A type swap (turning a bare root <Row> into <Column><Row>...</Row></Column>)
    // would force React to unmount and remount everything beneath it, since
    // React's reconciliation is type-based at each tree position. That
    // remount regenerates fresh ids for every stack/item from their
    // original, static JSX - so the dragged tab's original copy
    // "resurrects" via normal on-mount registration, independent of (and
    // immune to) a deferred deregister call targeting the now-defunct old
    // id. The result: dragging to the edge duplicated the tab instead of
    // moving it. Keeping both axes permanently mounted avoids the type swap
    // entirely, so nothing beneath either wrapper is ever remounted.
    const isColumnRoot = children.type === Column;

    const [outerRef, setOuterRef] = useState<any>(null);
    const [innerRef, setInnerRef] = useState<any>(null);
    const [edgeDraggedClass, setEdgeDraggedClass] = useState('');

    // A drag can end anywhere (or nowhere, if the user hits Escape), so the
    // global drag flag - not a local dragleave - is the only reliable signal
    // that the edge-drop indicator should clear.
    useEffect(() => {
        if (!dragging) {
            setEdgeDraggedClass('');
        }
    }, [dragging]);

    // Which edge (if any) the pointer is currently within EDGE_ZONE_SIZE of,
    // measured against the layout's own bounding box rather than a covering
    // element - see the EDGE_ZONE_SIZE comment above.
    const edgeAt = (event): [GridGroupType, GridPosition, string] | null => {
        const rect = ref.current.getBoundingClientRect();
        const distances: [number, GridGroupType, GridPosition, string][] = [
            [event.clientY - rect.top, GridGroupType.Column, GridPosition.Before, 'dragged-before-column'],
            [rect.bottom - event.clientY, GridGroupType.Column, GridPosition.After, 'dragged-after-column'],
            [event.clientX - rect.left, GridGroupType.Row, GridPosition.Before, 'dragged-before-row'],
            [rect.right - event.clientX, GridGroupType.Row, GridPosition.After, 'dragged-after-row']
        ];
        const [dist, gridGroupType, gridPosition, className] = distances.reduce((a, b) => a[0] <= b[0] ? a : b);
        return dist <= EDGE_ZONE_SIZE ? [gridGroupType, gridPosition, className] : null;
    };

    const onDrop = (event, gridGroupType: GridGroupType, gridPosition: GridPosition) => {
        setEdgeDraggedClass('');

        const type = event.dataTransfer.getData('type');
        const stackId = event.dataTransfer.getData('stackId');
        const itemId = event.dataTransfer.getData('id');

        if (type !== 'item' && type !== 'stack') {
            return;
        }

        const itemIds = resolveDraggedItemIds(type, stackId, itemId, stacks);
        if (itemIds.length === 0) {
            return;
        }

        // Whichever wrapper's own axis matches the requested split gets the
        // new pane as a plain sibling (childId null) - the other wrapper is
        // left untouched. Neither call can hit that wrapper's "wrap in a
        // nested Row/Column" branch, since that only triggers on an axis
        // MISMATCH - so this never remounts anything below either wrapper.
        const outerGridGroupType = isColumnRoot ? GridGroupType.Row : GridGroupType.Column;
        const targetRef = gridGroupType === outerGridGroupType ? outerRef : innerRef;
        if (!targetRef || !targetRef.onDrop(null, itemIds, gridGroupType, gridPosition)) {
            return;
        }

        if (event.dataTransfer.effectAllowed === 'move') {
            itemIds.forEach(itemId => store.deregisterItem(stackId, itemId));
        }
    };

    const onLayoutDragOverCapture = event => {
        const edge = edgeAt(event);
        if (edge === null) {
            if (edgeDraggedClass !== '') {
                setEdgeDraggedClass('');
            }
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        if (edgeDraggedClass !== edge[2]) {
            setEdgeDraggedClass(edge[2]);
        }
    };

    const onLayoutDropCapture = event => {
        const edge = edgeAt(event);
        if (edge === null) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        onDrop(event, edge[0], edge[1]);
    };

    const inner = cloneElement(children, { onBind: bind => setInnerRef(bind) });

    return (<div ref={ref} className="rubber-dock__layout"
                 onDragOverCapture={onLayoutDragOverCapture} onDropCapture={onLayoutDropCapture}>
        {isColumnRoot
            ? (<Row onBind={bind => setOuterRef(bind)}>{inner}</Row>)
            : (<Column onBind={bind => setOuterRef(bind)}>{inner}</Column>)}
        {dragging && edgeDraggedClass !== '' && <span className={edgeDraggedClass}></span>}
    </div>);
};

export default Layout;
