import Bucket from "./Bucket"
import { useEffect } from "react";
import {  Routes, Route } from "react-router-dom";
function App() {
  useEffect(() => {
  if (window.location.search === "?") {
    window.history.replaceState(null, "", window.location.pathname);
  }
}, []);

  return (
      <Routes>
        <Route path="/" element={<Bucket />}/>
      </Routes>
      
  )
}

export default App
