import { FileAddOutlined, TableOutlined } from "@ant-design/icons";
import OverviewApp from "@/components/VAPCANTAB/Overview/OverviewApp";
import QuarantineApp from "../../Quarantine/QuarantineApp";

export const tabItems = [
  {
    key: 1,
    label: "Data Overview",
    children: <OverviewApp />,
    closable: false,
    icon: <TableOutlined />,
  },
  {
    key: 2,
    label: "Quarantine Overview",
    children: <QuarantineApp />,
    closable: false,
    icon: <TableOutlined />,
  },
];
