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

    const [child, setChild] = useState(children);
    const [childRef, setChildRef] = useState(null);
    const [onDropObject, setOnDropObject] = useState(null);
    const [edgeDraggedClass, setEdgeDraggedClass] = useState('');

    // A drag can end anywhere (or nowhere, if the user hits Escape), so the
    // global drag flag - not a local dragleave - is the only reliable signal
    // that the edge-drop indicator should clear.
    useEffect(() => {
        if (!dragging) {
            setEdgeDraggedClass('');
        }
    }, [dragging]);

    const onEdgeDragOver = (event, className) => {
        event.stopPropagation();
        event.preventDefault();
        setEdgeDraggedClass(className);
    };

    const onEdgeDragLeave = () => {
        setEdgeDraggedClass('');
    };

    const onBind = childRef => {
        setChildRef(childRef);

        if (onDropObject !== null) {
            const { params, stackId, itemIds, effectAllowed } = onDropObject;

            if (childRef.onDrop.apply(childRef, params)) {
                if (effectAllowed === 'move') {
                    itemIds.forEach(itemId => store.deregisterItem(stackId, itemId));
                }
            }
        }
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

        if (child.type === Column && gridGroupType === GridGroupType.Row) {
            setChild((<Row>{child}</Row>));
            setOnDropObject({
                params: [null, itemIds, gridGroupType, gridPosition],
                stackId,
                itemIds,
                effectAllowed: event.dataTransfer.effectAllowed
            });
        } else if (child.type === Row && gridGroupType === GridGroupType.Column) {
            setChild((<Column>{child}</Column>));
            setOnDropObject({
                params: [null, itemIds, gridGroupType, gridPosition],
                stackId,
                itemIds,
                effectAllowed: event.dataTransfer.effectAllowed
            });
        } else if (childRef.onDrop(null, itemIds, gridGroupType, gridPosition)) {
            if (event.dataTransfer.effectAllowed === 'move') {
                itemIds.forEach(itemId => store.deregisterItem(stackId, itemId));
            }
        }
    };

    return (<div ref={ref} className="rubber-dock__layout">
        {cloneElement(child, { onBind })}
        {dragging && (<>
            <span className={edgeDraggedClass}></span>
            <div className="rubber-dock__layout__edge-zone rubber-dock__layout__edge-zone--top"
                 onDragOver={event => onEdgeDragOver(event, 'dragged-before-column')}
                 onDragLeave={onEdgeDragLeave}
                 onDrop={event => onDrop(event, GridGroupType.Column, GridPosition.Before)} />
            <div className="rubber-dock__layout__edge-zone rubber-dock__layout__edge-zone--bottom"
                 onDragOver={event => onEdgeDragOver(event, 'dragged-after-column')}
                 onDragLeave={onEdgeDragLeave}
                 onDrop={event => onDrop(event, GridGroupType.Column, GridPosition.After)} />
            <div className="rubber-dock__layout__edge-zone rubber-dock__layout__edge-zone--left"
                 onDragOver={event => onEdgeDragOver(event, 'dragged-before-row')}
                 onDragLeave={onEdgeDragLeave}
                 onDrop={event => onDrop(event, GridGroupType.Row, GridPosition.Before)} />
            <div className="rubber-dock__layout__edge-zone rubber-dock__layout__edge-zone--right"
                 onDragOver={event => onEdgeDragOver(event, 'dragged-after-row')}
                 onDragLeave={onEdgeDragLeave}
                 onDrop={event => onDrop(event, GridGroupType.Row, GridPosition.After)} />
        </>)}
    </div>);
};

export default Layout;
