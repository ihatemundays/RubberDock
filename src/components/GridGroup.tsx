import {cloneElement, isValidElement, ReactElement} from "react";
import Stack from "./Stack";
import Item from "./Item";
import Resizer from "./Resizer";
import Column from "./Column";
import Row from "./Row";

const GridGroup = props => {
    let {id, item, flex = 1, onClose, onDrop, onResize} = props;

    return (<>
        <GridGroupInner id={id} item={item} flex={flex} onClose={onClose} onDrop={onDrop} />
        {onResize ? (<Resizer onResize={onResize} />) : null}
    </>);
};

const GridGroupInner = props => {
    let {id, item, flex, onClose, onDrop} = props;

    // Guard against using an invalid element against type checks
    if (!isValidElement(item)) {
        return null;
    }
    const element = item as ReactElement<any>;

    const isGridGroup = element.type === Column || element.type === Row;
    const isStack = element.type === Stack;
    const isItem = element.type === Item;

    // One `flex` unit is expressed as a 100% flex-basis, so siblings that
    // haven't been manually resized (blank flex-basis) end up over-subscribed
    // together and shrink to fit in proportion to their unit count - see the
    // getFlexBasis default of 100 in Column/Row's onResize.
    const style = { flexBasis: `${flex * 100}%` };

    if (isGridGroup) {
        return cloneElement(element, {id, onClose, style});
    } else if (isStack) {
        return cloneElement(element, {id, onClose, onDrop, style});
    } else if (isItem) {
        return (<Stack id={id} onClose={onClose} onDrop={onDrop} style={style}>
            {item}
        </Stack>);
    }

    return null;
};

export default GridGroup;
