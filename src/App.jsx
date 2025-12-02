import React, { Suspense } from "react";
import MainCanvas from "./components/layout/MainCanvas";
import UIOverlay from "./components/layout/UIOverlay";
import Loader from "./components/layout/Loader";
import AmbientSound from "./components/AmbientSound";

import { useLenis } from "./hooks/useLenis";

function App() {
  return (
    <>
      <UIOverlay />
      <AmbientSound />
      <MainCanvas />
      <Suspense fallback={<Loader />}></Suspense>
    </>
  );
}

export default App;
