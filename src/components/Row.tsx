import {GridGroupType} from "../util/common";
import useTrack from "../hooks/useTrack";

const Row = props => {
    return useTrack({...props, type: GridGroupType.Row});
};

export default Row;
