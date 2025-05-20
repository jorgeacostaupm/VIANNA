import { Routes, Route, HashRouter } from "react-router-dom";
import MatrixApp from "../Matrix";
import CircularApp from "../Circular";
import AllLinks from "../List";
import AtlasApp from "../Atlas";
import MatrixCombo from "../Pages/MatrixCombo";
import CircularCombo from "../Pages/CircularCombo";
import ConnectivityApp from "../Pages/ConnectivityApp";
import NoPage from "../Pages/NoPage";

const AppRoutes = () => {
  console.log("RENDERING APP ROUTES...");
  return (
    <HashRouter>
      {/* esto puede no ser una solucion al usar nginx */}
      <Routes>
        <Route path="/" element={<ConnectivityApp />} />
        <Route path="matrix" element={<MatrixApp title={"Matrix"} />} />
        <Route path="circular" element={<CircularApp title={"Circular"} />} />
        <Route path="atlas" element={<AtlasApp title={"Atlas"} />} />
        <Route path="list" element={<AllLinks title={"List"} />} />
        <Route
          path="matrix_mix"
          element={<MatrixCombo title={"Matrix + List + Atlas"} />}
        />
        <Route
          path="circular_mix"
          element={<CircularCombo title={"Circular + List + Atlas"} />}
        />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;
