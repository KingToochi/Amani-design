import { Routes, Route } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

import LandingPage from "./assets/pages/LandingPage";
import Layout from "./assets/components/Layout";

function App() {
  return (
    <div className="">
      <LandingPage />
    </div>
  );
}

export default App;
library.add(fab, fas, far);
