import { useSelector, useDispatch } from "react-redux";
import React, { useCallback } from "react";
import { Tag } from "antd";
import DataManager from "../../managers/DataManager";

const utils = DataManager.getInstance();

const AttributeList = ({ attrs, removeAttr }) => {
  const dispatch = useDispatch();

  const onClose = useCallback(
    (attr) => (e) => {
      e.preventDefault();
      const index = attrs.findIndex((item) => utils.compareAttrs(attr, item));
      if (index !== -1) {
        dispatch(removeAttr(index));
      }
    },
    [attrs, dispatch, removeAttr]
  );

  return attrs.map((attr, index) => (
    <Tag
      key={index}
      style={{ marginBottom: "5px" }}
      closeIcon
      onClose={onClose(attr)}
    >{`${attr.type.name} - ${attr.measure.name} - ${attr.band.name}`}</Tag>
  ));
};

export default AttributeList;
