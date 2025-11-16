import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Weather from "./components/Weather";
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/weather" element={<Weather />} />
    </Routes>
  );
}

export default App;
