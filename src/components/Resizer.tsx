import {useRef} from "react";

const Resizer = props => {
    let {onResize} = props;
    const ref = useRef<HTMLDivElement>(null);

    const onMouseDown = () => {
        let resizer = ref.current;
        let left = resizer.previousSibling;
        let right = resizer.nextSibling;

        let onMouseUp = () => {
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
        }
        let onMouseMove = event => onResize(event, left, right);

        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);
    }

    return (<div
        ref={ref}
        className="rubber-dock__resizer"
        onMouseDown={() => onMouseDown()}>&nbsp;</div>);
};

export default Resizer;
