let usersearchEL = document.getElementById("usersearch")
let weatherDesc = document.getElementById("weatherDesc")
let currentTemp = document.getElementById("currentTemp")
let  latitude;
let longitude;
let cityTXT = document.getElementById("cityTXT")
let weatherIMG = document.getElementById("weatherIMG")
let weatherID;
const API_KEY = "28e85bb6fceef87b8575ae0f8d203149";

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
} else {
  // Geolocation is not available
  alert("Geolocation is not supported by this browser.");
}



function successCallback(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
   fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=28e85bb6fceef87b8575ae0f8d203149`)
    .then(response => response.json())
    .then(data => {
      const cit = data[0].name;
      console.log(cityTXT);
      cityTXT.textContent = cit
    });

  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      const kel = data.list[0].main.temp;
      const weatherString = data.list[0].weather[0].main;
      weatherID = data.list[0].weather[0].id;
      console.log(weatherString);
      weatherDesc.textContent = weatherString;
      currentTemp.textContent = (kel - 273.15) * 9/5 + 32
    });    
    IMGchange()
}

//-------------------------------------Catch the ERORR FOR GEOLOCATER HERE--------------------------------
function errorCallback(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      console.error("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.error("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.error("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.error("An unknown error occurred.");
      break;
  }
}

//-----------------------------------FRAMEWORK FOR YOU SEARCH ENGINE HERE------------------------------------------
const apiCall = () => { //very basic search engine
  let usersearch = document.getElementById("usersearch").value; // get value when called

  let userlocation = usersearch.split(' '); // ["Stockton","CA","US"]
  let city = userlocation[0];
  let state = userlocation[1];
  let country = userlocation[2];

  console.log(city); 
  console.log(state);
  console.log(country);

  fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=1&appid=${API_KEY}`)
    .then(response => response.json())
    .then(data => { console.log(data); });
};




usersearchEL.addEventListener('keydown', (event) => {
  if (event.key === "Enter") {
    apiCall();
  }
});
//-------------------------------FUNCTION TO CHANGE IMG BASED ON OPENWEATHER API ID-----------------------------
function IMGchange(){
if (weatherID >= 300 && weatherID <= 531) {
  weatherIMG.src = "../Rainy.png";
}
else if (weatherID >= 600 && weatherID <= 622) {
  weatherIMG.src = "../Snow.png";
}
else if (weatherID = 800) {
  weatherIMG.src = "../Sunny.png";
}
else if (weatherID >= 801 && weatherID <= 804) {
  weatherIMG.src = "../Cloudy.png";
}
}