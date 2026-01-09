import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Space, Tag, Card } from "antd";
import { EditOutlined, HighlightOutlined } from "@ant-design/icons";

import PopoverButton from "@/utils/PopoverButton";
import ColoredButton from "@/utils/ColoredButton";
import { replaceValuesWithNull } from "@/store/async/dataAsyncReducers";

function EditColumn() {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const nullifiedValues = useSelector(
    (state) => state.dataframe.present.nullifiedValues
  );

  const onReplaceValues = () => {
    if (inputValue.trim() !== "") {
      dispatch(replaceValuesWithNull(inputValue.trim()));
      setInputValue("");
      s;
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <div style={{ display: "flex", width: "100%", gap: 8 }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Value to Nullify"
          style={{ flex: 1 }} // ocupa todo el espacio disponible
        />
        <ColoredButton
          title={`Replace ${inputValue} with null`}
          shape="default"
          icon={<EditOutlined />}
          onClick={onReplaceValues}
          placement={"bottom"}
        ></ColoredButton>
      </div>

      <Card
        size="small"
        title="Nullified Values"
        style={{ marginTop: 12, borderRadius: 8 }}
      >
        <Space wrap>
          {nullifiedValues.map((val, idx) => (
            <Tag key={`${val}-${idx}`} color="red">
              {val}
            </Tag>
          ))}
        </Space>
      </Card>
    </Space>
  );
}

export default function EditValuesButton() {
  return (
    <PopoverButton
      content={<EditColumn />}
      icon={<HighlightOutlined />}
      title="Nullify values"
    />
  );
}
