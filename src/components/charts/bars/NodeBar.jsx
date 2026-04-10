import React from "react";
import { CloseOutlined } from "@ant-design/icons";

import BarButton from "@/components/ui/BarButton";

import BaseBar from "./BaseBar";

export default function NodeBar({ title, remove }) {
  return (
    <BaseBar title={title} draggable={false}>
      {remove && <BarButton title="Close" icon={<CloseOutlined />} onClick={remove} />}
    </BaseBar>
  );
}
