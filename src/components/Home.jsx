import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Home() {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (city.trim() !== "") {
      navigate(`/weather?city=${city}`);
    }
  };

  return (
    <div className="app-body">
      <div className="container">
        <h1>Weather</h1>
        <input 
          type="text" 
          placeholder="Enter city name" 
          value={city} 
          onChange={(e) => setCity(e.target.value)} 
        />
        <button onClick={handleSubmit}>Get Weather</button>
      </div>
    </div>
  );
}

export default Home;
