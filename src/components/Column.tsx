import {GridGroupType} from "../util/common";
import useTrack from "../hooks/useTrack";

const Column = props => {
    return useTrack({...props, type: GridGroupType.Column});
};

export default Column;
