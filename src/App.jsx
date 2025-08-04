
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
// import Homepage from "./assets/pages/Homepage";
import LandingPage from "./assets/pages/LandingPage";


function App() {
  return (
    <div className="">
      {/* <Homepage /> */}
      <LandingPage />
    </div>
  );
}

export default App;
library.add(fab, fas, far);
