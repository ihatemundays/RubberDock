import { useEffect, useRef, useState } from "react";
import { useDockState, useDockStore } from "../store/DockContext";
import { cx, itemElementId, tabElementId } from "../util/common";

const ItemTab = ({ children, stackId, id, isFocused, sole }) => {
    const store = useDockStore();
    const { items } = useDockState();
    const isFullscreen = items[id]?.isFullscreen;
    const poppedOut = items[id]?.poppedOut;
    const ref = useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [isMonitorFullscreen, setIsMonitorFullscreen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setIsActive(true);

        return () => {
            store.outDrag();
        };
    }, [store]);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsMonitorFullscreen(document.fullscreenElement?.id === itemElementId(id));
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, [id]);

    const toggleMonitorFullscreen = () => {
        const element = document.getElementById(itemElementId(id));
        if (!element) {
            return;
        }
        if (document.fullscreenElement === element) {
            document.exitFullscreen();
        } else {
            element.requestFullscreen();
        }
    };

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

    const showActions = sole || isExpanded;

    return (<div
        ref={ref}
        id={tabElementId(id)}
        className={cx('rubber-dock__item-tab', sole && 'rubber-dock__item-tab--sole', isActive && 'active', isFocused && 'focused')}
        onDragStart={onDragStart} onDragOver={event => event.preventDefault()} onDragEnd={onDragEnd} draggable={true}
        {...(sole ? {} : { role: 'tab', 'aria-selected': isFocused, 'aria-controls': itemElementId(id), tabIndex: isFocused ? 0 : -1 })}
    >
        <div className="rubber-dock__item-tab__label" onClick={() => store.focusItem(stackId, id)}>
            {children}
        </div>
        <div className="rubber-dock__item-tab__button-bar">
            {!sole && (
                <i className={cx('fas fa-ellipsis rubber-dock__icon-button', isExpanded && 'rubber-dock__icon-button--active')} title={isExpanded ? 'Fewer actions' : 'More actions'} onClick={() => setIsExpanded(!isExpanded)} />
            )}
            {showActions && (poppedOut ? (
                <i className="fas fa-arrow-left rubber-dock__icon-button" title="Dock" onClick={() => store.dockItem(id)} />
            ) : (<>
                <i className={cx('fas', isMonitorFullscreen ? 'fa-compress' : 'fa-expand', 'rubber-dock__icon-button')} title="Full screen" onClick={toggleMonitorFullscreen} />
                <i className="fas fa-up-right-from-square rubber-dock__icon-button" title="Pop out" onClick={() => store.popOutItem(id)} />
                <i className={cx('far', isFullscreen ? 'fa-window-restore' : 'fa-window-maximize', 'rubber-dock__icon-button')} title="Maximize" onClick={() => store.toggleItemFullscreen(id)} />
            </>))}
            <i className="far fa-window-close rubber-dock__icon-button" title="Close" onClick={() => store.deregisterItem(stackId, id)} />
        </div>
    </div>);
};

export default ItemTab;
