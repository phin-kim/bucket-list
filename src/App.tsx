import Bucket from "./Bucket"
import {  Routes, Route } from "react-router-dom";
function App() {

  return (
      <Routes>
        <Route path="/" element={<Bucket />}/>
      </Routes>
      
  )
}

export default App
