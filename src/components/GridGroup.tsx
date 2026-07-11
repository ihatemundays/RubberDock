import {cloneElement, Fragment, isValidElement, ReactElement} from "react";
import Stack from "./Stack";
import Item from "./Item";
import Resizer from "./Resizer";
import Column from "./Column";
import Row from "./Row";

const GridGroup = props => {
    let {id, item, onClose, onDrop, onResize} = props;

    return (<Fragment>
        <GridGroupInner id={id} item={item} onClose={onClose} onDrop={onDrop} />
        {onResize ? (<Resizer onResize={onResize} />) : null}
    </Fragment>);
};

const GridGroupInner = props => {
    let {id, item, onClose, onDrop} = props;

    // Guard against using an invalid element against type checks
    if (!isValidElement(item)) {
        return null;
    }
    const element = item as ReactElement<any>;

    const isGridGroup = element.type === Column || element.type === Row;
    const isStack = element.type === Stack;
    const isItem = element.type === Item;

    if (isGridGroup) {
        return cloneElement(element, {id, onClose});
    } else if (isStack) {
        return cloneElement(element, {id, onClose, onDrop});
    } else if (isItem) {
        return (<Stack id={id} onClose={onClose} onDrop={onDrop}>
            {item}
        </Stack>);
    }

    return null;
};

export default GridGroup;
