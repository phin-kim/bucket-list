//import Bucket from "./Bucket"
import { useEffect } from "react";
//import {  Routes, Route } from "react-router-dom";
import Gf from "./Stupid"
function App() {
  useEffect(() => {
  if (window.location.search === "?") {
    window.history.replaceState(null, "", window.location.pathname);
  }
}, []);

  return (
      /*<Routes>
        <Route path="/" element={<Bucket />}/>
      </Routes>*/
      <Gf/>
      
  )
}

export default App
