import { useEffect, useRef, useState } from "react";
import { useDockStore } from "../store/DockContext";
import { cx } from "../util/common";

const ItemTab = ({ children, stackId, id, isFocused }) => {
    const store = useDockStore();
    const ref = useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setIsActive(true);

        return () => {
            store.outDrag();
        };
    }, [store]);

    const onDragStart = event => {
        store.inDrag();
        event.dataTransfer.setData('type', 'item');
        event.dataTransfer.setData('stackId', stackId);
        event.dataTransfer.setData('id', id);
        event.dataTransfer.effectAllowed = event.ctrlKey ? 'copy' : 'move';
    };

    // Might trigger twice, but catches most possible outcomes.
    const onDragEnd = () => {
        store.outDrag();
    };

    return (<div ref={ref} className={cx('rubber-dock__item-tab', isActive && 'active', isFocused && 'focused')} onDragStart={onDragStart} onDragOver={event => event.preventDefault()} onDragEnd={onDragEnd} draggable={true}>
        <div className="rubber-dock__item-tab__label" onClick={() => store.focusItem(stackId, id)}>
            {children}
        </div>
        <div className="rubber-dock__item-tab__button-bar">
            <i className="far fa-window-maximize fa-lg" onClick={() => store.toggleItemFullscreen(id)} />
            <i className="far fa-window-close fa-lg" onClick={() => store.deregisterItem(stackId, id)} />
        </div>
    </div>);
};

export default ItemTab;
