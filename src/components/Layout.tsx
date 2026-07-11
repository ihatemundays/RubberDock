import { cloneElement, FunctionComponent, ReactElement, useRef, useState } from "react";
import { DockStore } from "../store/DockStore";
import { DockContext, useDockState, useDockStore } from "../store/DockContext";
import Row from "./Row";
import Column from "./Column";
import { GridGroupType, GridPosition } from "../util/common";

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
    const { dragging } = useDockState();
    const ref = useRef<HTMLDivElement>(null);

    const [child, setChild] = useState(children);
    const [childRef, setChildRef] = useState(null);
    const [onDropObject, setOnDropObject] = useState(null);

    const onDragOver = event => {
        event.stopPropagation();
        event.preventDefault();
    };

    const onBind = childRef => {
        setChildRef(childRef);

        if (onDropObject !== null) {
            const { params, stackId, itemId, effectAllowed } = onDropObject;

            if (childRef.onDrop.apply(childRef, params)) {
                if (effectAllowed === 'move') {
                    store.deregisterItem(stackId, itemId);
                }
            }
        }
    };

    const onDrop = (event, gridGroupType: GridGroupType, gridPosition: GridPosition) => {
        const type = event.dataTransfer.getData('type');
        const stackId = event.dataTransfer.getData('stackId');
        const itemId = event.dataTransfer.getData('id');

        if (type !== 'item') {
            return;
        }

        if (child.type === Column && gridGroupType === GridGroupType.Row) {
            setChild((<Row>{child}</Row>));
            setOnDropObject({
                params: [null, itemId, gridGroupType, gridPosition],
                stackId,
                itemId,
                effectAllowed: event.dataTransfer.effectAllowed
            });
        } else if (child.type === Row && gridGroupType === GridGroupType.Column) {
            setChild((<Column>{child}</Column>));
            setOnDropObject({
                params: [null, itemId, gridGroupType, gridPosition],
                stackId,
                itemId,
                effectAllowed: event.dataTransfer.effectAllowed
            });
        } else if (childRef.onDrop(null, itemId, gridGroupType, gridPosition)) {
            if (event.dataTransfer.effectAllowed === 'move') {
                store.deregisterItem(stackId, itemId);
            }
        }
    };

    return (<div ref={ref} className="rubber-dock__layout">
        {cloneElement(child, { onBind })}
        <span className="layout-drop-bar" style={{ display: dragging ? 'inline-block' : 'none' }}>
            <i className="fas fa-caret-left fa-2x" onDragOver={onDragOver} onDrop={event => onDrop(event, GridGroupType.Row, GridPosition.Before)}>&nbsp;</i>
            <i className="fas fa-caret-right fa-2x" onDragOver={onDragOver} onDrop={event => onDrop(event, GridGroupType.Row, GridPosition.After)}>&nbsp;</i>
            <i className="fas fa-caret-up fa-2x" onDragOver={onDragOver} onDrop={event => onDrop(event, GridGroupType.Column, GridPosition.Before)}>&nbsp;</i>
            <i className="fas fa-caret-down fa-2x" onDragOver={onDragOver} onDrop={event => onDrop(event, GridGroupType.Column, GridPosition.After)}>&nbsp;</i>
        </span>
    </div>);
};

export default Layout;
