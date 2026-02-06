import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";

import AppRoutes from "./core/Routes";
import { theme } from "./theme";
import store from "@/store/store";

import "./styles/index.css";
import "./styles/charts.css";

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <Provider store={store}>
        <AppRoutes></AppRoutes>
      </Provider>
    </ConfigProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
