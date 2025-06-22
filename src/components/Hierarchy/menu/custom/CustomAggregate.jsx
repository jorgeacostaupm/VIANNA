import { useState, useRef } from "react";
import { get_parser } from "../logic/parser";
import { build_aggregation } from "../logic/formularGenerator";
import { Field, useFormikContext } from "formik";
import { copyClipboard } from "../../utils";
import { SearchOutlined, CopyOutlined } from "@ant-design/icons";
import { Button, Typography, Tooltip } from "antd";
const { Text } = Typography;

let parser = get_parser();

export const AttributePaste = ({ name }) => {
  const copyAttribute = async () => {
    await copyClipboard(`$(${name})`);
  };

  return (
    <div
      style={{
        display: "flex",
        cursor: "grab",
        padding: "0.5rem",
        border: "1px solid",
        borderRadius: "0.75rem",
        background: "transparent",
        overflow: "hidden",
        width: "100%",
        justifyContent: "space-between",
      }}
      onClick={copyAttribute}
    >
      <Tooltip title={name}>
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: "1.125rem",
          }}
        >
          {name}
        </span>
      </Tooltip>
      <CopyOutlined />
    </div>
  );
};

const CustomAggregate = ({ nodes, formula, save }) => {
  const { errors, setFieldError, setFieldValue, setTouched } =
    useFormikContext();
  const textRef = useRef();
  const [formulaText, setFormula] = useState(formula);
  let typingTimer;

  const validateFormula = (e) => {
    let parsed;
    try {
      parsed = parser.parse(e.target.value);
    } catch (error) {
      setFieldError("info.formula", "Syntax error");
      return;
    }

    try {
      const executable_code = build_aggregation(parsed);
      if (
        !executable_code.nodes.every(
          (n) => nodes.find((o) => o.name === n) !== null
        )
      ) {
        throw {
          error: "AttributeNotFound",
          msg:
            "One of the attributes used does not correspond with the children of this aggregation. Nodes: " +
            nodes.map((n) => '"' + n.name + `"`).join(", ") +
            " Obtained: " +
            executable_code.nodes.map((n) => '"' + n + `"`).join(", "),
        };
      }
      setFieldValue("info.exec", executable_code.formula, false);
      setTouched("info.exec", false);

      let used = executable_code.nodes.map((o) => {
        const usedNode = { name: o, used: true, weight: 1 }; // corrected 'weigth' to 'weight'
        usedNode.id = nodes.find((n) => n.name == o)?.id; // it is expected that the node exists so there will be no check
        return usedNode;
      });
      setFieldValue("info.usedAttributes", used);
    } catch (error) {
      setFieldError("info.formula", `${error.error} :  ${error.msg}`);
      return;
    }
    console.log("EEEEEE2");
    setFieldValue("info.formula", textRef.current.value, true);
  };

  const handleInputChange = (event) => {
    setFormula(event.target.value);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      validateFormula(event);
    }, 200);
  };

  return (
    <>
      <Text strong>Aggregation Formula:</Text>
      <textarea
        ref={textRef}
        value={formulaText}
        style={{
          width: "100%",
          height: "100px",
          border: "1px solid #d1d5db",
          borderRadius: "0.375rem",
          padding: "0.5rem",
          resize: "vertical",
        }}
        onChange={handleInputChange}
        spellCheck={"false"}
        autoCorrect={"false"}
        placeholder="Add an aggregation equation or formula"
      />
      {errors?.info?.formula && (
        <p
          style={{
            color: "#f87171",
            overflow: "hidden",
            fontSize: "0.875rem",
            width: "100%",
          }}
        >
          {errors?.info?.formula}
        </p>
      )}
      {save}
      <Text strong>Available Variables:</Text>
      <div
        style={{
          borderWidth: "3px",
          borderStyle: "dashed",
          borderRadius: "0.375rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          minHeight: "7vh",
          padding: "5px",
          gap: "5px",
        }}
      >
        {nodes.map((n) => {
          return <AttributePaste key={n.name} name={n.name} />;
        })}
      </div>
    </>
  );
};

export default CustomAggregate;
