let usersearchEL = document.getElementById("usersearch");
let weatherDesc = document.getElementById("weatherDesc");
let currentTemp = document.getElementById("currentTemp");
let cityTXT = document.getElementById("cityTXT");
let weatherIMG = document.getElementById("weatherIMG");
let weatherID;

let d2 = document.getElementById("d2");
let d3 = document.getElementById("d3");
let d4 = document.getElementById("d4");
let d5 = document.getElementById("d5");

let d2TXT = document.getElementById("d2TXT");
let d3TXT = document.getElementById("d3TXT");
let d4TXT = document.getElementById("d4TXT");
let d5TXT = document.getElementById("d5TXT");

let lowEL = document.getElementById("low");
let highEL = document.getElementById("high");

let favoriteBtn = document.getElementById("favoriteBtn");
let favLocation = document.getElementById("favLocation");
let favoriteIcon = favoriteBtn.querySelector("img");

let recView = document.getElementById("recView");

let latitude;
let longitude;
//====================================================KEY HERE======================================
const API_KEY = "";
const placeholder = "ex. Stockton CA US";

favoriteBtn.type = "button";

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let recents = JSON.parse(localStorage.getItem("recents")) || [];

/* =================== GEOLOCATION =================== */

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}

function successCallback(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  weatherData();
}

function errorCallback(err) {
  console.error(err);
}

/* =================== Formula =================== */

function kToF(k) {
  return Math.round(((k - 273.15) * 9 / 5) + 32);
}

/* =================== INPUT ERROR =================== */

function locationNotFound() {
  usersearchEL.value = "";
  usersearchEL.placeholder = 'Location Not Found Enter ex."Stockton CA US"';
}

/* =================== LOAD CITY =================== */

function loadCityByName(cityName) {
  if (!cityName) return;

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`)
    .then(r => r.json())
    .then(data => {
      if (!data || !data.length) {
        locationNotFound();
        return;
      }

      latitude = data[0].lat;
      longitude = data[0].lon;
      cityTXT.textContent = data[0].name;

      weatherData();
    })
    .catch(() => locationNotFound());
}

/* =================== HIGH / LOW =================== */

function todayHighLow(data) {
  let firstDate = data.list[0].dt_txt.slice(0, 10);
  let high = data.list[0].main.temp;
  let low = data.list[0].main.temp;

  for (let i = 0; i < data.list.length; i++) {
    let dateKey = data.list[i].dt_txt.slice(0, 10);
    if (dateKey !== firstDate) break;

    let temp = data.list[i].main.temp;
    if (temp > high) high = temp;
    if (temp < low) low = temp;
  }

  lowEL.textContent = "Low " + kToF(low) + "°";
  highEL.textContent = "High " + kToF(high) + "°";
}

/* =================== 4 DAY AVG =================== */

function fourDayAvg(data) {
  let firstDate = data.list[0].dt_txt.slice(0, 10);
  let dayCount = 0;
  let currentDate = "";
  let sum = 0;
  let count = 0;

  for (let i = 0; i < data.list.length; i++) {
    let dateKey = data.list[i].dt_txt.slice(0, 10);
    if (dateKey === firstDate) continue;
    if (currentDate === "") currentDate = dateKey;

    if (dateKey !== currentDate) {
      let avgF = kToF(sum / count);
      let dayName = new Date(currentDate + "T00:00:00")
        .toLocaleDateString("en-US", { weekday: "short" });

      if (dayCount === 0) { d2TXT.textContent = dayName; d2.textContent = avgF + "°"; }
      if (dayCount === 1) { d3TXT.textContent = dayName; d3.textContent = avgF + "°"; }
      if (dayCount === 2) { d4TXT.textContent = dayName; d4.textContent = avgF + "°"; }
      if (dayCount === 3) { d5TXT.textContent = dayName; d5.textContent = avgF + "°"; }

      dayCount++;
      if (dayCount === 4) return;

      currentDate = dateKey;
      sum = 0;
      count = 0;
    }

    sum += data.list[i].main.temp;
    count++;
  }
}

/* =================== WEATHER ICON =================== */

function IMGchange() {
  if (weatherID >= 300 && weatherID <= 531) weatherIMG.src = "../Rainy.png";
  else if (weatherID >= 600 && weatherID <= 622) weatherIMG.src = "../Snow.png";
  else if (weatherID === 800) weatherIMG.src = "../Sunny.png";
  else weatherIMG.src = "../Cloudy.png";
}

/* =================== WEATHER DATA =================== */

function weatherData() {
  if (!latitude || !longitude) return;

  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`)
    .then(r => r.json())
    .then(data => {
      cityTXT.textContent = data.city.name;
      weatherID = data.list[0].weather[0].id;

      currentTemp.textContent = kToF(data.list[0].main.temp) + "°";
      weatherDesc.textContent = data.list[0].weather[0].main;

      todayHighLow(data);
      fourDayAvg(data);
      IMGchange();

      addRecent();
      checkFavorite();
    })
    .catch(() => locationNotFound());
}

/* =================== SEARCH =================== */

function apiCall() {
  let input = usersearchEL.value.trim();
  if (!input) return;

  let parts = input.split(/\s+/);
  if (parts.length < 3) {
    locationNotFound();
    return;
  }

  let country = parts.pop();
  let state = parts.pop();
  let city = parts.join(" ");

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=1&appid=${API_KEY}`)
    .then(r => r.json())
    .then(data => {
      if (!data || !data.length) {
        locationNotFound();
        return;
      }

      latitude = data[0].lat;
      longitude = data[0].lon;
      cityTXT.textContent = data[0].name;
      usersearchEL.value = "";
      usersearchEL.placeholder = placeholder;
      weatherData();
    })
    .catch(() => locationNotFound());
}

usersearchEL.addEventListener("keydown", e => {
  if (e.key === "Enter") apiCall();
});

usersearchEL.addEventListener("focus", () => {
  usersearchEL.placeholder = placeholder;
});

/* =================== FAVORITES =================== */

function updateStar(on) {
  favoriteIcon.src = on ? "Star1.png" : "Star.png";
}

function checkFavorite() {
  updateStar(favorites.some(f => f.city === cityTXT.textContent));
}

function toggleFavorite(e) {
  if (e) e.preventDefault();

  let city = cityTXT.textContent;
  let temp = currentTemp.textContent;

  let index = favorites.findIndex(f => f.city === city);
  if (index > -1) {
    favorites.splice(index, 1);
    updateStar(false);
  } else {
    favorites.unshift({ city, temp });
    if (favorites.length > 6) favorites.pop();
    updateStar(true);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  favLocation.innerHTML = "";

  favorites.forEach(f => {
    let b = document.createElement("button");
    b.type = "button";
    b.className = "saved rounded-5";
    b.innerHTML = `${f.temp} ${f.city} <img src="Star1.png" alt="">`;

    // click favorite -> load city
    b.addEventListener("click", () => loadCityByName(f.city));

    favLocation.appendChild(b);
  });
}

favoriteBtn.addEventListener("click", toggleFavorite);

/* =================== RECENTS =================== */

function addRecent() {
  let city = cityTXT.textContent;
  let temp = currentTemp.textContent;

  recents = recents.filter(r => r.city !== city);
  recents.unshift({ city, temp });
  if (recents.length > 6) recents.pop();

  localStorage.setItem("recents", JSON.stringify(recents));
  renderRecents();
}

function renderRecents() {
  recView.innerHTML = "";

  recents.forEach(r => {
    let b = document.createElement("button");
    b.type = "button";
    b.className = "recSave rounded-5";
    b.textContent = `${r.temp} ${r.city}`;

    // click recent -> load city
    b.addEventListener("click", () => loadCityByName(r.city));

    recView.appendChild(b);
  });
}

/* =================== INIT =================== */

renderFavorites();
renderRecents();
checkFavorite();
