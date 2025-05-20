import React, { useState } from "react";
import { Collapse } from "antd";
import { placeholders } from "../configuration/config.json";
import "../configuration/styles.css";
import PopulationsTable from "./PopulationsTable";

const getTables = () => {
  const collapse_items = [
    {
      key: placeholders.populations_title,
      label: placeholders.populations_title,
      children: <PopulationsTable />,
    },
    {
      key: placeholders.subjects_title,
      label: placeholders.subjects_title,
      children: <p>TODO</p>,
    },
  ];

  return collapse_items;
};

const Tables = () => {
  const collapse_items = getTables();
  const [active_key, setActiveKey] = useState([collapse_items[0].key]);

  const onChange = (keys) => {
    if (keys.length === 0) {
      // If all items are collapsed, keep the first item uncollapsed
      setActiveKey([collapse_items[0].key]);
    } else {
      setActiveKey(keys);
    }
  };

  return (
    <Collapse
      activeKey={active_key}
      onChange={onChange}
      accordion
      items={collapse_items}
      defaultActiveKey={[placeholders.populations_title]}
      style={{ height: "100%" }}
    />
  );
};

export default Tables;
