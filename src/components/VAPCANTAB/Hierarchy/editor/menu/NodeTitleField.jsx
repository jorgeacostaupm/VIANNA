import { Field, useFormikContext } from "formik";
import { useState } from "react";
import { SaveOutlined, CloseOutlined, FormOutlined } from "@ant-design/icons";
import { Input, Button } from "antd";
import { useField } from "formik";

const NodeTitleField = ({ closeTab }) => {
  const [editable, makeEditable] = useState(false);
  const { isValid, errors } = useFormikContext();
  const [field] = useField("name");

  return (
    <div style={{ display: "flex", flexDirection: "row", marginBottom: "5px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "0.5rem",
          justifyContent: "center",
        }}
      >
        <label htmlFor="name" style={{ fontSize: "20px" }}>
          Node Name:
        </label>

        <Input
          id="name"
          {...field}
          style={{
            padding: "5px",
            width: "auto",
          }}
        />
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
        <Button
          type="primary"
          htmlType="submit"
          disabled={!isValid}
          style={{
            pointerEvents: isValid ? "auto" : "none",
          }}
          onClick={() => isValid}
        >
          <SaveOutlined style={{ color: "white" }} />
        </Button>

        <Button type="primary" onClick={closeTab}>
          <CloseOutlined />
        </Button>
      </div>
    </div>
  );
};

export default NodeTitleField;
