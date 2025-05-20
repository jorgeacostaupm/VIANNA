import React from "react";
import { Button } from "antd";
import { setLinks } from "@/components/VAPUtils/features/atlas/atlasSlice";
import { useDispatch } from "react-redux";

const buttons_style = { width: "100%" };

const Interaction = () => {
  const dispatch = useDispatch();

  const onResetAtlas = React.useCallback(() => {
    dispatch(setLinks([]));
  }, [dispatch]);

  return (
    <div className="buttonContainer">
      <Button type="primary" style={buttons_style} onClick={onResetAtlas}>
        Reset Atlas
      </Button>
    </div>
  );
};

export default Interaction;
