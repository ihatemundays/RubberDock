import {TrackType} from "../util/common";
import useTrack from "../hooks/useTrack";

const Row = props => {
    return useTrack({...props, type: TrackType.Row});
};

export default Row;
