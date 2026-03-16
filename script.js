const API_KEY = "037952cf04ccc7cebabd2c4bc9d2a474";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const cardEl = document.getElementById("weather-card");

const cityNameEl = document.getElementById("city-name");
const countryEl = document.getElementById("country");
const tempEl = document.getElementById("temperature");
const descEl = document.getElementById("description");
const iconEl = document.getElementById("weather-icon");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const unitToggleBtn = document.getElementById("unit-toggle");

let currentUnits = "metric"; // "metric" (°C) or "imperial" (°F)
let lastQuery = null; // { type: "city" | "coords", value: string | { lat, lon } }

function showElement(el) {
  el.classList.remove("hidden");
}

function hideElement(el) {
  el.classList.add("hidden");
}

function setLoading(isLoading) {
  if (isLoading) {
    hideElement(errorEl);
    showElement(loadingEl);
    searchForm.querySelector("button[type='submit']").disabled = true;
  } else {
    hideElement(loadingEl);
    searchForm.querySelector("button[type='submit']").disabled = false;
  }
}

function showError(message) {
  errorEl.textContent = message;
  showElement(errorEl);
}

function clearError() {
  errorEl.textContent = "";
  hideElement(errorEl);
}

function formatTemperature(temp, units) {
  const unitLabel = units === "imperial" ? "°F" : "°C";
  return `${Math.round(temp)}${unitLabel}`;
}

function buildUrlFromCity(city, units) {
  const encodedCity = encodeURIComponent(city.trim());
  return `${BASE_URL}?q=${encodedCity}&units=${units}&appid=${API_KEY}`;
}

async function fetchWeatherByCity(city, units = currentUnits) {
  if (!city.trim()) {
    showError("Please enter a city name.");
    return;
  }

  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    showError(
      "Missing API key. Please add your OpenWeatherMap API key in script.js."
    );
    return;
  }

  const url = buildUrlFromCity(city, units);
  lastQuery = { type: "city", value: city.trim() };

  await fetchAndRenderWeather(url, units);
}

async function fetchAndRenderWeather(url, units) {
  try {
    clearError();
    setLoading(true);

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        showError("City not found. Please try again.");
      } else {
        showError("Unable to fetch weather data.");
      }
      hideElement(cardEl);
      return;
    }

    const data = await response.json();
    renderWeather(data, units);
  } catch (err) {
    console.error(err);
    showError("Network error. Unable to fetch weather data.");
    hideElement(cardEl);
  } finally {
    setLoading(false);
  }
}

function renderWeather(data, units) {
  const city = data.name;
  const country = data.sys?.country || "";
  const temp = data.main?.temp;
  const humidity = data.main?.humidity;
  const description = data.weather?.[0]?.description || "";
  const iconCode = data.weather?.[0]?.icon || "";
  const windSpeed = data.wind?.speed;

  cityNameEl.textContent = city || "Unknown";
  countryEl.textContent = country;

  if (typeof temp === "number") {
    tempEl.textContent = formatTemperature(temp, units);
  } else {
    tempEl.textContent = "--";
  }

  descEl.textContent = description || "N/A";

  if (iconCode) {
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconEl.alt = description || "Weather icon";
    iconEl.style.visibility = "visible";
  } else {
    iconEl.removeAttribute("src");
    iconEl.alt = "";
    iconEl.style.visibility = "hidden";
  }

  humidityEl.textContent =
    typeof humidity === "number" ? `${humidity}%` : "N/A";

  if (typeof windSpeed === "number") {
    const windUnit = units === "imperial" ? "mph" : "m/s";
    windEl.textContent = `${windSpeed} ${windUnit}`;
  } else {
    windEl.textContent = "N/A";
  }

  showElement(cardEl);
}


searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value;
  fetchWeatherByCity(city);
});

unitToggleBtn.addEventListener("click", async () => {
  currentUnits = currentUnits === "metric" ? "imperial" : "metric";

  if (!lastQuery) {
    
    
    tempEl.textContent =
      currentUnits === "imperial" ? "--°F" : "--°C";
    return;
  }

  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    showError(
      "Missing API key. Please add your OpenWeatherMap API key in script.js."
    );
    return;
  }

  if (lastQuery.type === "city") {
    const url = buildUrlFromCity(lastQuery.value, currentUnits);
    await fetchAndRenderWeather(url, currentUnits);
  }
});

