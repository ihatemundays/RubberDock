import { cloneElement, useEffect, useRef, useState } from "react";
import ItemTab from "./ItemTab";
import { useDockState, useDockStore } from "../store/DockContext";
import { GridGroupType, GridPosition, cx, tabElementId } from "../util/common";
import { useRegisterStack } from "../hooks/useRegisterStack";

const Stack = props => {
    let {
        children,
        id,
        onClose: onParentClose,
        onDrop: onParentDrop,
        vertical: _vertical = false,
        lockedOrientation = false
    } = props;

    const store = useDockStore();
    const { dragging, stacks, items: registeredItems } = useDockState();
    const stack = stacks[id];
    const focus = stack?.focus;
    const items = stack?.items?.map(x => ({ ...registeredItems[x], id: x }));

    useRegisterStack(id);

    const tabsRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<HTMLDivElement>(null);
    children = children instanceof Array ? children : [children];
    children = children.map(x => ({
        ...x,
        id: x.id || crypto.randomUUID(),
    }));
    const list = items || children;

    const [tabsHeight, setTabsHeight] = useState(0);
    const [vertical, setVertical] = useState(_vertical);
    const [className, setClassName] = useState(_vertical ? 'rubber-dock__vstack' : 'rubber-dock__hstack');
    const [stackDraggedClass, setStackDraggedClass] = useState('');
    const [dragTabPosition, setDragTabPosition] = useState(-1);

    useEffect(() => {
        setClassName(vertical ? 'rubber-dock__vstack' : 'rubber-dock__hstack');
    }, [vertical]);

    useEffect(() => {
        if (vertical) {
            setTabsHeight(0);
        } else {
            let current = tabsRef.current as any;
            setTabsHeight(current.offsetHeight);
        }
    }, [vertical, className]);

    // A drag can end anywhere (or nowhere, if the user hits Escape), so the
    // global drag flag - not a local dragleave - is the only reliable signal
    // that the drop-position indicator should clear.
    useEffect(() => {
        if (!dragging) {
            setDragTabPosition(-1);
        }
    }, [dragging]);

    const onDragOver = event => {
        const { left, top, width, height } = (itemsRef.current as any).getBoundingClientRect();
        const [centerX, centerY] = [width / 2 + left, height / 2 + top];
        const [dx, dy] = [event.clientX - centerX, -(event.clientY - centerY)];
        let theta = Math.atan2(dy, dx) * 180 / Math.PI;
        if (theta < 0) {
            theta += 360;
        }

        if (theta >= 45 && theta < 135) {
            setStackDraggedClass('dragged-before-column');
        } else if (theta >= 135 && theta < 180) {
            setStackDraggedClass('dragged-before-row');
        } else if (theta >= 180 && theta < 315) {
            setStackDraggedClass('dragged-after-column');
        } else if ((theta >= 315 || theta < 45)) {
            setStackDraggedClass('dragged-after-row');
        }

        event.preventDefault();
    };

    const onDragLeave = () => {
        setStackDraggedClass('');
    };

    const onDrop = event => {
        setStackDraggedClass('');

        const type = event.dataTransfer.getData('type');
        const stackId = event.dataTransfer.getData('stackId');
        const itemId = event.dataTransfer.getData('id');

        if (type !== 'item') {
            return;
        }

        // A stack with only one tab renders as that item itself (see `isSole`
        // below), so dropping it back onto its own body is the item being
        // dropped onto itself: it would clone the item into a new split
        // panel and then immediately deregister the original, making it look
        // like the item just vanished. Ignore that no-op drop.
        if (isSole && stackId === id) {
            return;
        }

        switch (stackDraggedClass) {
            case 'dragged-before-column':
                if (!onParentDrop(itemId, GridGroupType.Column, GridPosition.Before)) {
                    return;
                }
                break;
            case 'dragged-after-column':
                if (!onParentDrop(itemId, GridGroupType.Column, GridPosition.After)) {
                    return;
                }
                break;
            case 'dragged-before-row':
                if (!onParentDrop(itemId, GridGroupType.Row, GridPosition.Before)) {
                    return;
                }
                break;
            case 'dragged-after-row':
                if (!onParentDrop(itemId, GridGroupType.Row, GridPosition.After)) {
                    return;
                }
                break;
        }

        if (event.dataTransfer.effectAllowed === 'move') {
            store.deregisterItem(stackId, itemId);
        }
    };

    // Which half of a tab the pointer is over decides whether the dragged tab
    // would land before or after it - a bigger, more forgiving target than a
    // thin divider between tabs, and it needs no extra DOM per gap.
    const tabInsertPosition = (event, index) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const before = vertical
            ? event.clientY - rect.top < rect.height / 2
            : event.clientX - rect.left < rect.width / 2;
        return before ? index : index + 1;
    };

    const onTabDragOver = (event, index) => {
        event.preventDefault();
        event.stopPropagation();
        setDragTabPosition(tabInsertPosition(event, index));
    };

    const onTabDrop = (event, index) => {
        event.preventDefault();
        event.stopPropagation();
        dropTab(event, tabInsertPosition(event, index));
    };

    // Dropping past the last tab, in the empty space the tab list leaves
    // after it, appends at the end. Per-tab handlers stop propagation so this
    // only fires when the drop didn't land on a specific tab.
    const onTabListDragOver = event => {
        event.preventDefault();
        setDragTabPosition(list.length);
    };

    const onTabListDrop = event => {
        event.preventDefault();
        dropTab(event, list.length);
    };

    const dropTab = (event, position) => {
        setDragTabPosition(-1);

        const type = event.dataTransfer.getData('type');
        const stackId = event.dataTransfer.getData('stackId');
        const itemId = event.dataTransfer.getData('id');

        if (type !== 'item') {
            return;
        }

        // Dropping a tab right next to its own current slot doesn't change
        // its order - skip it instead of re-mounting the item under a new id.
        const sourceIndex = list.findIndex(x => x.id === itemId);
        if (sourceIndex !== -1 && (position === sourceIndex || position === sourceIndex + 1)) {
            return;
        }

        store.dropItem(id, itemId, crypto.randomUUID(), position);

        if (event.dataTransfer.effectAllowed === 'move') {
            store.deregisterItem(stackId, itemId);
        }
    };

    // ARIA tablist keyboard navigation: arrow keys move focus and selection
    // together (automatic activation), Home/End jump to the first/last tab.
    const onTabsKeyDown = event => {
        if (list.length === 0) {
            return;
        }

        const forwardKey = vertical ? 'ArrowDown' : 'ArrowRight';
        const backwardKey = vertical ? 'ArrowUp' : 'ArrowLeft';
        const currentIndex = list.findIndex(x => x.id === focus);

        let nextIndex;
        if (event.key === forwardKey) {
            nextIndex = (currentIndex + 1) % list.length;
        } else if (event.key === backwardKey) {
            nextIndex = (currentIndex - 1 + list.length) % list.length;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = list.length - 1;
        } else {
            return;
        }

        event.preventDefault();
        const nextId = list[nextIndex].id;
        store.focusItem(id, nextId);
        document.getElementById(tabElementId(nextId))?.focus();
    };

    // A stack holding just one item isn't really a tab group - render it as a
    // plain, full-width header instead of a narrow tab (see ItemTab `sole`).
    const isSole = list.length === 1;

    const isEmpty = list.length === 0;

    // Notifying the parent belongs after render/commit, not during Stack's own render.
    useEffect(() => {
        if (isEmpty) {
            onParentClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEmpty]);

    if (isEmpty) {
        return null;
    }

    return (<div className={cx(className, 'active')}>
        <div ref={tabsRef} className={`${className}__item-tabs`}>
            <div {...(isSole ? {} : { role: 'tablist', 'aria-orientation': vertical ? 'vertical' : 'horizontal', onKeyDown: onTabsKeyDown })}
                 className={`${className}__item-tabs__list`} onDragOver={onTabListDragOver} onDrop={onTabListDrop}>
                {list.map((item, index) => {
                    let { id: itemId } = item;
                    let _item = item?.item || item;
                    let { tab, hasFullscreen, hasPopOut, hasMaximize, hasClose } = _item.props;

                    const spanStyle = isSole ? {width: 'stretch'} : {};
                    const isLast = index === list.length - 1;

                    return (<span key={itemId} style={spanStyle}
                                  className={cx(
                                      'rubber-dock__item-tab-drop-zone',
                                      dragTabPosition === index && 'rubber-dock__item-tab-drop-zone--before',
                                      isLast && dragTabPosition === list.length && 'rubber-dock__item-tab-drop-zone--after'
                                  )}
                                  onDragOver={event => onTabDragOver(event, index)} onDrop={event => onTabDrop(event, index)}>
                        <ItemTab id={itemId} stackId={id} isFocused={focus === itemId} sole={isSole}
                                 hasFullscreen={hasFullscreen} hasPopOut={hasPopOut} hasMaximize={hasMaximize}
                                 hasClose={hasClose}>
                            {tab}
                        </ItemTab>
                    </span>);
                })}
            </div>
            {lockedOrientation || (<div className="rubber-dock__item-tab__button-bar">
                <div>
                    <i className={`fas fa-table-columns fa-lg rubber-dock__icon-button ${vertical ? 'fa-rotate-270' : ''}`} title="Toggle orientation" onClick={() => setVertical(!vertical)} />
                </div>
            </div>)}
        </div>
        <div ref={itemsRef} className={`${className}__items`} style={{ height: `calc(100% - ${tabsHeight}px)` }} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
            <span className={stackDraggedClass}></span>
            {list.map((item, index) => {
                let { id: itemId } = item;
                let _item = item?.item || item;

                return cloneElement(_item, { key: itemId, id: itemId, stackId: id, stackIndex: index, onParentClose, item: _item, isFocused: focus === itemId, sole: isSole });
            })}
        </div>
    </div>);
};

export default Stack;
