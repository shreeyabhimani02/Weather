import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Weather() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const city = queryParams.get("city");

  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState(city || "");

  // ===== History helpers =====
  const HISTORY_KEY = "weatherHistory_v1";

  const loadHistory = () => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  };

  const saveHistory = (list) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  };

  const [history, setHistory] = useState(loadHistory());

  const addToHistory = (cityName, data) => {
    const entry = {
      id: Date.now(),
      city: data.name,
      country: data.sys?.country || "",
      temp: data.main?.temp ?? null,
      icon: data.weather?.[0]?.icon || "",
      desc: data.weather?.[0]?.main || "",
      at: new Date().toISOString(),
    };

    // avoid duplicates by filtering existing same city,country
    let list = loadHistory().filter(
      (h) =>
        `${h.city},${h.country}`.toLowerCase() !==
        `${entry.city},${entry.country}`.toLowerCase()
    );

    list.unshift(entry); // add to start
    list = list.slice(0, 8); // limit to 8 entries

    saveHistory(list);
    setHistory(list);
  };

  const clearHistory = () => {
    saveHistory([]);
    setHistory([]);
  };

  const openFromHistory = (h) => {
    navigate(`?city=${encodeURIComponent(h.city)}`);
  };

  // ===== Search handler =====
  const handleSearch = (e) => {
    e.preventDefault();
    const newCity = searchValue.trim();
    if (!newCity) return;
    navigate(`?city=${encodeURIComponent(newCity)}`);
  };

  // ===== Fetch weather =====
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=6ed570ac911dad2a255e2965a53ced74&units=metric`
        );
        if (!response.ok) throw new Error("City not found ❌");
        const data = await response.json();
        setWeather(data);

        // ✅ add to history only if valid fetch
        addToHistory(city, data);

        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=6ed570ac911dad2a255e2965a53ced74&units=metric`
        );
        const forecastData = await forecastRes.json();
        const dailyForecast = forecastData.list.filter((item) =>
          item.dt_txt.includes("12:00:00")
        );
        setForecast(dailyForecast);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (city) fetchWeather();
  }, [city]);

  if (loading) return <p className="loading">⏳ Loading weather...</p>;
  if (error) return <p className="error">⚠️ {error}</p>;

  const getBackgroundClass = () => {
    if (!weather) return "default-bg";
    const desc = weather.weather[0].main.toLowerCase();
    if (desc.includes("cloud")) return "clouds-bg";
    if (desc.includes("clear")) return "clear-bg";
    if (desc.includes("rain")) return "rain-bg";
    if (desc.includes("snow")) return "snow-bg";
    if (desc.includes("mist") || desc.includes("fog")) return "mist-bg";
    return "default-bg";
  };

  return (
    <div className={`app-body ${getBackgroundClass()}`}>
      <div className="weather-layout">
        {/* Left: History */}

        <aside className="history-panel">
          <div className="history-header">
            <h3>Recent Cities</h3>
            {history.length > 0 && (
              <button className="clear-btn" onClick={clearHistory}>
                Clear
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="history-empty">No searches yet.</p>
          ) : (
            <ul className="history-list">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="history-item"
                  onClick={() => openFromHistory(h)}
                >
                  <img
                    className="history-icon"
                    src={`https://openweathermap.org/img/wn/${h.icon}.png`}
                    alt={h.desc}
                  />
                  <div className="history-mid">
                    <div className="history-city">
                      {h.city}
                      {h.country ? `, ${h.country}` : ""}
                    </div>
                    <div className="history-time">
                      {new Date(h.at).toLocaleString()}
                    </div>
                  </div>
                  <div className="history-right">
                    {h.temp !== null ? `${Math.round(h.temp)}°C` : "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Right: Main weather card */}
        <section className="weather-main">
          <form className="search-row" onSubmit={handleSearch}>
            <input
              className="search-input"
              type="text"
              placeholder="Search another city"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className="search-btn" type="submit">
              Search
            </button>
          </form>

          <div className="weather-card">
            <h2 className="city-name">🌍 {weather.name}</h2>

            <div className="main-info">
              <h1 className="temp">
                <strong>{weather.main.temp}°C</strong>
              </h1>
              <p className="feels">Feels like: {weather.main.feels_like}°C</p>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="weather-icon"
              />
              <h3>
                {weather.weather[0].main} ({weather.weather[0].description})
              </h3>
            </div>

            <div className="extra-info">
              <div className="info-box">
                💧 Humidity: {weather.main.humidity}%
              </div>
              <div className="info-box">
                💨 Wind: {weather.wind.speed} m/s
              </div>
              <div className="info-box">
                🌡️ Pressure: {weather.main.pressure} hPa
              </div>
              <div className="info-box">
                🌅 Sunrise:{" "}
                {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
              </div>
              <div className="info-box">
                🌇 Sunset:{" "}
                {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
              </div>
            </div>

            <h3>📅 5-Day Forecast</h3>
            <div className="forecast">
              {forecast.map((day) => (
                <div key={day.dt} className="forecast-day">
                  <p>
                    {new Date(day.dt_txt).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                    alt={day.weather[0].description}
                  />
                  <p>{Math.round(day.main.temp)}°C</p>
                </div>
              ))}
            </div>

            <button className="back-btn" onClick={() => navigate("/")}>
              ⬅ Back
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Weather;
