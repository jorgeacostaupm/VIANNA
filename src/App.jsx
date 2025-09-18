import CANTABVis from "./components/CANTABVis";
import { Popover, Button, Tooltip, ConfigProvider, Space } from "antd";

export default function App() {
  return (
    <ConfigProvider theme={{ token: { fontSize: 20 } }}>
      <CANTABVis></CANTABVis>
    </ConfigProvider>
  );
}
