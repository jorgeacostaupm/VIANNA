import LineChart from "./LineChart";
import { defineView } from "@/components/grid/viewDefinitions";

export default {
  evolution: defineView(LineChart, {
    layout: { w: 10, h: 4 },
  }),
};
