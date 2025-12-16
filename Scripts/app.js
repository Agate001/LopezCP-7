let usersearchEL = document.getElementById("usersearch")


if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
} else {
  // Geolocation is not available
  alert("Geolocation is not supported by this browser.");
}


function successCallback(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
}



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

// http://api.openweathermap.org/geo/1.0/direct?q=Stockton,CA,US&limit=1&appid=09138befca0b554bfbc9e831ad391ef8


const apiCall = () => { //very basic search engine
  let usersearch = document.getElementById("usersearch").value; // get value when called

  let userlocation = usersearch.split(' '); // ["Stockton","CA","US"]
  let city = userlocation[0];
  let state = userlocation[1];
  let country = userlocation[2];

  console.log(city); 
  console.log(state);
  console.log(country);

  fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=1&appid=09138befca0b554bfbc9e831ad391ef8`)
    .then(response => response.json())
    .then(data => { console.log(data); });
};

usersearchEL.addEventListener('keydown', (event) => {
  if (event.key === "Enter") {
    apiCall();
  }
});