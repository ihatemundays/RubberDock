import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { useDockState, useDockStore } from "../store/DockContext";
import { useRegisterItem } from "../hooks/useRegisterItem";
import { cx } from "../util/common";

const Item = props => {
    const { children, id, stackId, stackIndex, item, focus, isFocused } = props;
    const ref = useRef<HTMLDivElement>(null);
    const store = useDockStore();
    const { items } = useDockState();
    const isFullscreen = items[id]?.isFullscreen;
    const [isActive, setIsActive] = useState(false);

    useRegisterItem(stackId, stackIndex, id, item, focus);

    useEffect(() => {
        setIsActive(true);
    }, []);

    const toggleItemFullscreen = () => store.toggleItemFullscreen(id);

    // Function-component children (e.g. custom tab content) are cloned with the
    // same props Item received, so they can read things like `id`/`isFullscreen`.
    const childProps = { ...props, isFullscreen, toggleItemFullscreen };

    return (<div ref={ref} className={cx('rubber-dock__item', isActive && 'active', isFullscreen && 'fullscreen', isFocused && 'focused')}>
        {isFullscreen ? (<i className="far fa-window-minimize fa-lg" onClick={toggleItemFullscreen} />) : ''}
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
};

export default Item;
