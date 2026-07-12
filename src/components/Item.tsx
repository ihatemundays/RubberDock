import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDockState, useDockStore } from "../store/DockContext";
import { useRegisterItem } from "../hooks/useRegisterItem";
import { usePopoutWindow } from "../hooks/usePopoutWindow";
import { cx, itemElementId, tabElementId } from "../util/common";

const Item = props => {
    const { children, id, stackId, stackIndex, item, focus, isFocused, sole, tab } = props;
    const ref = useRef<HTMLDivElement>(null);
    const store = useDockStore();
    const { items } = useDockState();
    const isFullscreen = items[id]?.isFullscreen;
    const poppedOut = items[id]?.poppedOut;
    const [isActive, setIsActive] = useState(false);

    useRegisterItem(stackId, stackIndex, id, item, focus);

    useEffect(() => {
        setIsActive(true);
    }, []);

    const toggleItemFullscreen = () => store.toggleItemFullscreen(id);

    useEffect(() => {
        if (!isFullscreen || poppedOut) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                store.toggleItemFullscreen(id);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isFullscreen, poppedOut, id, store]);

    const tabLabel = typeof item?.props?.tab === 'string' ? item.props.tab : 'Window';
    const popoutContainer = usePopoutWindow(!!poppedOut, tabLabel, () => store.dockItem(id));

    // Function-component children (e.g. custom tab content) are cloned with the
    // same props Item received, so they can read things like `id`/`isFullscreen`.
    const childProps = { ...props, isFullscreen, toggleItemFullscreen };

    const content = (<div
        id={itemElementId(id)}
        ref={ref}
        className={cx('rubber-dock__item', isActive && 'active', isFullscreen && !poppedOut && 'fullscreen', isFocused && 'focused', poppedOut && 'popped-out')}
        {...(poppedOut || sole ? {} : { role: 'tabpanel', 'aria-labelledby': tabElementId(id), tabIndex: 0 })}>
        {isFullscreen && !poppedOut ? (
            <div className="rubber-dock__item__maximize-bar">
                <div className="rubber-dock__item__maximize-bar__label">{tab}</div>
                <i className="far fa-window-restore rubber-dock__icon-button" title="Restore" onClick={toggleItemFullscreen} />
            </div>
        ) : ''}
        <div className="rubber-dock__item__container">
            <div className="rubber-dock__item__body">
                {Children.map(children, child => {
                    if (typeof child.type === 'function' && isValidElement(child)) {
                        return cloneElement(child, childProps);
                    }

                    return child;
                })}
            </div>
        </div>
    </div>);

    if (poppedOut) {
        return (<>
            {popoutContainer ? createPortal(content, popoutContainer) : null}
            <div
                id={itemElementId(id)}
                className={cx('rubber-dock__item', isActive && 'active', isFocused && 'focused')}
                {...(sole ? {} : { role: 'tabpanel', 'aria-labelledby': tabElementId(id), tabIndex: 0 })}
            >
                <div className="rubber-dock__item__container">
                    <div className="rubber-dock__item__body rubber-dock__item__body--popped-out" title="Dock" onClick={() => store.dockItem(id)}>
                        <i className="fas fa-up-right-from-square" />
                    </div>
                </div>
            </div>
        </>);
    }

    return content;
};

export default Item;
