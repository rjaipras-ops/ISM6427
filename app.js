const DEFAULT = { name: "Boca Raton", lat: 26.3683, lon: -80.1289 };
const USER_NAME = "Rajesh Jaiprashad";

// WMO weather codes -> [description, icon]
const CODES = {
  0: ["Clear", "☀️"],
  1: ["Mostly Clear", "🌤️"],
  2: ["Partly Cloudy", "⛅"],
  3: ["Cloudy", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Fog", "🌫️"],
  51: ["Light Drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy Drizzle", "🌧️"],
  61: ["Light Rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy Rain", "🌧️"],
  71: ["Light Snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy Snow", "❄️"],
  80: ["Showers", "🌦️"],
  81: ["Showers", "🌧️"],
  82: ["Heavy Showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm", "⛈️"],
  99: ["Thunderstorm", "⛈️"],
};

const $ = (id) => document.getElementById(id);
const describe = (code) => CODES[code] || ["Unknown", "🌡️"];

async function loadWeather({ name, lat, lon }) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const { current, daily } = await res.json();

    $("location").textContent = name;
    $("temp").textContent = `${Math.round(current.temperature_2m)}°`;
    $("condition").textContent = describe(current.weather_code)[0];
    $("hilo").textContent =
      `H:${Math.round(daily.temperature_2m_max[0])}°  L:${Math.round(daily.temperature_2m_min[0])}°`;
    $("feels").textContent = `${Math.round(current.apparent_temperature)}°`;
    $("humidity").textContent = `${current.relative_humidity_2m}%`;
    $("wind").textContent = `${Math.round(current.wind_speed_10m)} mph`;

    $("days").innerHTML = daily.time
      .map((date, i) => {
        const day = i === 0
          ? "Today"
          : new Date(date + "T00:00").toLocaleDateString("en-US", { weekday: "short" });
        return `<li>
          <span>${day}</span>
          <span class="icon">${describe(daily.weather_code[i])[1]}</span>
          <span class="range">
            <span class="low">${Math.round(daily.temperature_2m_min[i])}°</span>
            ${Math.round(daily.temperature_2m_max[i])}°
          </span>
        </li>`;
      })
      .join("");
  } catch {
    $("condition").textContent = "Unable to load weather";
  }
}

$("search").addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = $("city").value.trim();
  if (!query) return;

  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`
  );
  const data = await res.json();
  const place = data.results?.[0];
  if (!place) {
    $("condition").textContent = "City not found";
    return;
  }

  $("city").value = "";
  loadWeather({ name: place.name, lat: place.latitude, lon: place.longitude });
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  document.querySelectorAll(".themes button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === theme);
  });
}

document.querySelectorAll(".themes button").forEach((btn) => {
  btn.addEventListener("click", () => setTheme(btn.dataset.theme));
});

const hour = new Date().getHours();
const timeOfDay = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
$("greeting").textContent = `${timeOfDay}, ${USER_NAME}`;

setTheme(document.documentElement.dataset.theme);
loadWeather(DEFAULT);
