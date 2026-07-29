import {TrackType} from "../util/common";
import useTrack from "../hooks/useTrack";

const Column = props => {
    return useTrack({...props, type: TrackType.Column});
};

export default Column;
