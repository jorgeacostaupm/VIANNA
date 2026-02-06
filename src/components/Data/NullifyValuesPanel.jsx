import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Space, Tag, Card } from "antd";
import { EditOutlined } from "@ant-design/icons";

import ColoredButton from "@/components/ui/ColoredButton";
import { replaceValuesWithNull } from "@/store/async/dataAsyncReducers";

export default function NullifyValuesPanel() {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const nullifiedValues = useSelector(
    (state) => state.dataframe.present.nullifiedValues
  );

  const onReplaceValues = () => {
    const trimmed = inputValue.trim();
    if (trimmed !== "") {
      dispatch(replaceValuesWithNull(trimmed));
      setInputValue("");
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <div style={{ display: "flex", width: "100%", gap: 8 }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Value to nullify"
          style={{ flex: 1 }}
        />
        <ColoredButton
          title={`Replace ${inputValue} with null`}
          shape="default"
          icon={<EditOutlined />}
          onClick={onReplaceValues}
          placement="bottom"
        />
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
