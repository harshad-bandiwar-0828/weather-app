const apiKey = ""; 

const cityInput = document.getElementById("cityInput");
const weatherResults = document.getElementById("weatherResults");
const loader = document.getElementById("loader");

// ✅ Hide cards initially
weatherResults.style.display = "none";

  //  MAIN WEATHER FUNCTION

function getWeather() {
  const city = cityInput.value.trim();

  if (city === "") {
    alert("Please enter a city name");
    return;
  }

  const weatherUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  // 👉 Show loader, hide cards
  loader.style.display = "block";
  weatherResults.style.display = "none";

  fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
      if (data.cod !== 200) {
        loader.style.display = "none";
        alert("City not found");
        return;
      }

      // 🌡 Temperature
      document.getElementById("temp").textContent =
        Math.round(data.main.temp) + " °C";

      // 🌥 Condition
      const condition = data.weather[0].description;
      document.getElementById("condition").textContent =
        condition.charAt(0).toUpperCase() + condition.slice(1);

      // 💧 Humidity
      document.getElementById("humidity").textContent =
        data.main.humidity + " %";

      // 🌬 Wind
      document.getElementById("wind").textContent =
        (data.wind.speed * 3.6).toFixed(1) + " km/h";

      // 🌅 Sunrise & 🌇 Sunset
      document.getElementById("sunrise").textContent =
        formatTime(data.sys.sunrise);

      document.getElementById("sunset").textContent =
        formatTime(data.sys.sunset);

      // 🌫 AQI + ⏰ Time
      getAQI(data.coord.lat, data.coord.lon);
      showGlobalDateTime(Number(data.timezone || 0));

      // 👉 Hide loader, show cards
      loader.style.display = "none";
      weatherResults.style.display = "grid";
    })
    .catch(error => {
      console.error(error);
      loader.style.display = "none";
      alert("Something went wrong");
    });
}

  //  AQI FETCH

function getAQI(lat, lon) {
  const url =
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const pm25 = data.list[0].components.pm2_5;
      const aqiValue = calculateAQI(pm25);
      showAQI(aqiValue);
    });
}

  //  AQI UI

function showAQI(aqi) {
  let text = "", color = "", status = "", width = "";

  if (aqi <= 50) {
    text = "Good";
    status = "Safe 😊";
    color = "#037733";
    width = "20%";
  } else if (aqi <= 100) {
    text = "Moderate";
    status = "Acceptable 🙂";
    color = "#f1c40f";
    width = "40%";
  } else if (aqi <= 150) {
    text = "Sensitive";
    status = "Caution 😐";
    color = "#974b08";
    width = "60%";
  } else if (aqi <= 200) {
    text = "Unhealthy";
    status = "Avoid 😷";
    color = "#911306";
    width = "80%";
  } else {
    text = "Very Unhealthy";
    status = "Hazardous ☠️";
    color = "#520474";
    width = "100%";
  }

  document.getElementById("aqiLine").innerHTML =
    `AQI ${aqi} · <span style="color:${color}">${text}</span>`;
  document.getElementById("aqiStatus").textContent = status;
  document.getElementById("aqiFill").style.width = width;
  document.getElementById("aqiFill").style.background = color;
  document.querySelector(".aqi-dot").style.background = color;
}

  //  AQI CALCULATION

function calculateAQI(pm25) {
  if (pm25 <= 12) return Math.round((50 / 12) * pm25);
  if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
  if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
  if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
  return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
}

  //  TIME HELPERS

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function showGlobalDateTime(timezoneOffset) {
  try {
    const now = new Date();
    const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utcTime.getTime() + timezoneOffset * 1000);

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const dayName = days[cityTime.getDay()];
    const day = String(cityTime.getDate()).padStart(2, "0");
    const month = String(cityTime.getMonth() + 1).padStart(2, "0");
    const year = cityTime.getFullYear();

    let hours = cityTime.getHours();
    const minutes = String(cityTime.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, "0");

    document.getElementById("date").textContent =
      `${dayName} ${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  } catch {
    document.getElementById("date").textContent = "Time unavailable";
  }
}

  //  ENTER KEY SUPPORT

cityInput.addEventListener("keypress", e => {
  if (e.key === "Enter") getWeather();

});
