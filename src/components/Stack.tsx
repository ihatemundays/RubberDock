import { cloneElement, useEffect, useRef, useState } from "react";
import ItemTab from "./ItemTab";
import { useDockState, useDockStore } from "../store/DockContext";
import { GridGroupType, GridPosition, cx } from "../util/common";
import { useRegisterStack } from "../hooks/useRegisterStack";

const Stack = props => {
    let {
        children,
        id,
        onClose: onParentClose,
        onDrop: onParentDrop,
        vertical: _vertical = false
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

    const onTabsDragOver = (event, position) => {
        setDragTabPosition(position);
        event.preventDefault();
    };

    const onTabsDragLeave = () => {
        setDragTabPosition(-1);
    };

    const onTabsDrop = event => {
        const type = event.dataTransfer.getData('type');
        const stackId = event.dataTransfer.getData('stackId');
        const itemId = event.dataTransfer.getData('id');

        if (type === 'item' && dragTabPosition !== -1) {
            store.dropItem(id, itemId, crypto.randomUUID(), dragTabPosition);

            if (event.dataTransfer.effectAllowed === 'move') {
                store.deregisterItem(stackId, itemId);
            }
        }

        setDragTabPosition(-1);
    };

    const isEmpty = (items || children).length === 0;

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
            <span className={cx('rubber-dock__tab-divider', dragging && 'dragged', dragTabPosition === 0 && 'hover')} onDragOver={event => onTabsDragOver(event, 0)} onDragLeave={onTabsDragLeave} onDrop={onTabsDrop}>&nbsp;</span>
            {(items || children).map((item, index) => {
                const position = index + 1;
                let { id: itemId } = item;
                let _item = item?.item || item;
                let { tab } = _item.props;

                return (<span key={itemId}>
                    <ItemTab id={itemId} stackId={id} isFocused={focus === itemId}>
                        {tab}
                    </ItemTab>
                    <span className={cx('rubber-dock__tab-divider', dragging && 'dragged', dragTabPosition === position && 'hover')} onDragOver={event => onTabsDragOver(event, position)} onDragLeave={onTabsDragLeave} onDrop={onTabsDrop}>&nbsp;</span>
                </span>);
            })}
            <div className="rubber-dock__item-tab__button-bar">
                <div>
                    <i className="fas fa-adjust fa-lg" onClick={() => setVertical(!vertical)} />
                </div>
            </div>
        </div>
        <div ref={itemsRef} className={`${className}__items`} style={{ height: `calc(100% - ${tabsHeight}px)` }} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
            <span className={stackDraggedClass}></span>
            {(items || children).map((item, index) => {
                let { id: itemId } = item;
                let _item = item?.item || item;

                return cloneElement(_item, { key: itemId, id: itemId, stackId: id, stackIndex: index, onParentClose, item: _item, isFocused: focus === itemId });
            })}
        </div>
    </div>);
};

export default Stack;
