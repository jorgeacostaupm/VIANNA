import React from "react";
import { HighlightOutlined } from "@ant-design/icons";

import PopoverButton from "@/components/ui/PopoverButton";
import NullifyValuesPanel from "@/components/Data/NullifyValuesPanel";

export default function EditValuesButton() {
  return (
    <PopoverButton
      content={<NullifyValuesPanel />}
      icon={<HighlightOutlined />}
      title="Nullify values"
    />
  );
}
