import { createTransform } from "redux-persist";
import { from } from "arquero";

const FrameSerializeTransform = createTransform(
    (inboundState, key) => {
        return inboundState == null ? null : inboundState.objects().slice(0, 50);
    },
    (outboundState, key) => {
        return inboundState == null ? null : from(outboundState);
    },
    { whitelist: ["dataframe"] }
);

export default FrameSerializeTransform;
