import React from "react";

import MainAppView from "./MainAppView";
import useMainAppController from "./useMainAppController";

export default function MainApp() {
  const mainViewModel = useMainAppController();

  return (
    <>
      <MainAppView {...mainViewModel} />
    </>
  );
}
