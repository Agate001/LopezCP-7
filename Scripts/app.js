let usersearchEL = document.getElementById("usersearch");
let weatherDesc = document.getElementById("weatherDesc");
let currentTemp = document.getElementById("currentTemp");
let latitude;
let longitude;
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

let recentBox = document.querySelector(".recents");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let recents = JSON.parse(localStorage.getItem("recents")) || [];

const API_KEY = "28e85bb6fceef87b8575ae0f8d203149";
const placeholder = "ex. Stockton CA US";

/* make sure button behaves like a normal button */
favoriteBtn.type = "button";

/* ---------------- GEOLOCATION ---------------- */

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
} else {
  alert("Geolocation is not supported by this browser.");
}

function successCallback(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;

  // reverse geocode is optional now (we set city from forecast too)
  fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`)
    .then(r => r.json())
    .then(data => {
      if (data && data[0]) cityTXT.textContent = data[0].name;
    });

  weatherData();
}

function errorCallback(error) {
  console.error(error);
}

/* ---------------- HIGH / LOW ---------------- */

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

  high = Math.round(((high - 273.15) * 9 / 5) + 32);
  low = Math.round(((low - 273.15) * 9 / 5) + 32);

  lowEL.textContent = "Low " + low + "°";
  highEL.textContent = "High " + high + "°";
}

/* ---------------- 4 DAY AVG ---------------- */

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
      let avgF = Math.round((((sum / count) - 273.15) * 9 / 5) + 32);
      let dayName = new Date(currentDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });

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

/* ---------------- WEATHER ---------------- */

function weatherData() {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      if (!data || !data.list) return;

      // IMPORTANT: always set city from forecast (reliable + sync)
      if (data.city && data.city.name) {
        cityTXT.textContent = data.city.name;
      }

      let kel = data.list[0].main.temp;
      weatherID = data.list[0].weather[0].id;

      weatherDesc.textContent = data.list[0].weather[0].main;
      currentTemp.textContent = Math.round(((kel - 273.15) * 9 / 5) + 32) + "°";

      todayHighLow(data);
      fourDayAvg(data);
      IMGchange();

      addRecent();     // recents update
      checkFavorite(); // star update
    });
}

/* ---------------- SEARCH ---------------- */

const apiCall = () => {
  let input = usersearchEL;
  let usersearch = input.value.trim();
  if (!usersearch) return;

  let parts = usersearch.split(/\s+/);

  if (parts.length < 3) {
    input.value = "";
    input.placeholder = "Use format: City State Country";
    return;
  }

  let country = parts.pop();
  let state = parts.pop();
  let city = parts.join(" ");

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=1&appid=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      if (!data || !data.length) {
        input.value = "";
        input.placeholder = "Location not found (City State Country)";
        return;
      }

      latitude = data[0].lat;
      longitude = data[0].lon;
      cityTXT.textContent = data[0].name;

      input.value = "";
      input.placeholder = placeholder;

      weatherData();
    });
};

usersearchEL.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    apiCall();
  }
});

usersearchEL.addEventListener("focus", () => {
  usersearchEL.placeholder = placeholder;
});

/* ---------------- WEATHER ICON ---------------- */

function IMGchange() {
  if (weatherID >= 300 && weatherID <= 531) {
    weatherIMG.src = "../Rainy.png";
  } else if (weatherID >= 600 && weatherID <= 622) {
    weatherIMG.src = "../Snow.png";
  } else if (weatherID === 800) {
    weatherIMG.src = "../Sunny.png";
  } else if (weatherID >= 801 && weatherID <= 804) {
    weatherIMG.src = "../Cloudy.png";
  }
}

/* ---------------- FAVORITES ---------------- */

function updateStar(isFavorited) {
  favoriteIcon.src = isFavorited ? "Star1.png" : "Star.png";
}

function checkFavorite() {
  let city = cityTXT.textContent;

  for (let i = 0; i < favorites.length; i++) {
    if (favorites[i].city === city) {
      updateStar(true);
      return;
    }
  }
  updateStar(false);
}

function toggleFavorite(e) {
  if (e) e.preventDefault();

  let city = cityTXT.textContent;
  let temp = currentTemp.textContent;

  if (!city || !temp) return;

  // remove if already exists
  for (let i = 0; i < favorites.length; i++) {
    if (favorites[i].city === city) {
      favorites.splice(i, 1);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
      updateStar(false);
      return;
    }
  }

  // add newest first
  favorites.unshift({ city: city, temp: temp });

  // limit 6
  if (favorites.length > 6) favorites.pop();

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
  updateStar(true);
}

function renderFavorites() {
  favLocation.innerHTML = "";

  for (let i = 0; i < favorites.length; i++) {
    let item = document.createElement("button");
    item.className = "saved rounded-5";

    item.innerHTML = `${favorites[i].temp} ${favorites[i].city} <img src="Star1.png" alt="">`;

    favLocation.appendChild(item);
  }
}

favoriteBtn.addEventListener("click", toggleFavorite);

/* ---------------- RECENTS (MAX 6, MOST RECENT FIRST) ---------------- */

function addRecent() {
  let city = cityTXT.textContent;
  let temp = currentTemp.textContent;

  if (!city || !temp) return;

  // remove duplicate
  for (let i = 0; i < recents.length; i++) {
    if (recents[i].city === city) {
      recents.splice(i, 1);
      break;
    }
  }

  // add front
  recents.unshift({ city: city, temp: temp });

  // limit 6
  if (recents.length > 6) recents.pop();

  localStorage.setItem("recents", JSON.stringify(recents));
  renderRecents();
}

function renderRecents() {
  let old = recentBox.querySelectorAll(".saved");
  old.forEach(el => el.remove());

  for (let i = 0; i < recents.length; i++) {
    let btn = document.createElement("button");
    btn.className = "saved rounded-5";
    btn.textContent = recents[i].temp + " " + recents[i].city;
    recentBox.appendChild(btn);
  }
}



renderFavorites();
renderRecents();
checkFavorite();
