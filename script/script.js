/**************************************************************************************************************************/
//*displaying date and time

function getDate(date) {
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let day = days[date.getDay()];

  let hour = date.getHours();
  let minutes = date.getMinutes();

  if (hour < 10) {
    hour = `0${hour}`;
  } else if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  return `<span>${day}<br/>${hour}:${minutes}`;
}

let date = new Date();
let sectionDate = document.querySelector("#section-date");

sectionDate.innerHTML = getDate(date);

//block for displaying the fake temp + functions for converting to celsius/fahrenheit
// let temperature = 17;
// let tempDisp = document.querySelector(".left__current_temp p");
// tempDisp.textContent = temperature;

// function getCelsius() {
//   tempDisp.textContent = temperature;
// }

// function getFahrenheit() {
//   let temperatureFahr = Math.floor(temperature * 1.8 + 32);
//   tempDisp.textContent = temperatureFahr;
// }

// let celsUnit = document.querySelector("#temp-celsius");
// let fahrUnit = document.querySelector("#temp-fahrenheit");

// celsUnit.addEventListener("click", getCelsius);
// fahrUnit.addEventListener("click", getFahrenheit);

//* adding functionality: weather API, geolocation API
// let apiUrlRoot = "https://api.openweathermap.org/data/2.5/weather?";
// const apiKey = "1ee4264117b73d2263eecd562f31ef5c";
let apiUrlRoot = "https://api.shecodes.io/weather/v1/current?";
const apiKey = "785e4002t4o34d2ed60bb3aec801e9af";
const units = "metric";

/**************************************************************************************************************************/
//* showing the initial city ("Kharkiv") and temperature when the page is loaded

async function getInitialCityTemp() {
  const city = "Kharkiv";
  updateCurrentCity(city);

  const data = await getWeatherData(apiUrlRoot, city);

  const temp = Math.round(data.temperature.current);
  updateCurrentTemp(temp);

  const description = data.condition.description;
  updateCurrentWeatherDescription(description);

  updateCurrentImg(description);
}

function updateCurrentCity(city) {
  const cityRef = document.querySelector("#current-city");
  cityRef.textContent = city;
}

async function getWeatherData(url, city) {
  try {
    const response = await axios.get(
      `${url}query=${city}&key=${apiKey}&units=${units}`
    );
    return response.data;
  } catch (err) {
    console.error(err.message);
  }
}

function updateCurrentTemp(temp) {
  const tempRef = document.querySelector("#current-temp");
  tempRef.textContent = temp;
}

function updateCurrentWeatherDescription(descr) {
  const weatherDescriptionRef = document.querySelector("#weather-description");
  weatherDescriptionRef.textContent = descr;
}

document.addEventListener("DOMContentLoaded", getInitialCityTemp);

/**************************************************************************************************************************/
//* showing temperature according to the input value

async function showWeather(e) {
  e.preventDefault();

  const city = getCity();
  updateCurrentCity(city);

  const data = await getWeatherData(apiUrlRoot, city);

  const temp = Math.round(data.main.temp);
  updateCurrentTemp(temp);

  const description = data.weather[0].description;
  updateCurrentWeatherDescription(description);

  const conditions = data.weather[0].main;
  updateCurrentImg(conditions);

  const forecastRef = document.querySelector(".main_content__right");
  forecastRef.innerHTML = "";
  updateForecast(forecastUrl, city);
}

function getCity() {
  const searchInput = document.querySelector("#search-input");
  let city = searchInput.value;
  city = city.trim();
  searchInput.value = "";
  return city;
}

const searchForm = document.querySelector("#search-form");
searchForm.addEventListener("submit", showWeather);

/**************************************************************************************************************************/
//* get the current weather with the geolocation API

async function showWeatherInMyCity() {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const data = await getMyCityWeatherData(apiUrlRoot, lat, lon);

    const city = data.name;
    updateCurrentCity(city);

    const temp = Math.round(data.main.temp);
    updateCurrentTemp(temp);

    const description = data.weather[0].description;
    updateCurrentWeatherDescription(description);

    const conditions = data.weather[0].main;
    updateCurrentImg(conditions);
  } catch (err) {
    console.error(err.message);
  }
}

async function getMyCityWeatherData(url, lat, lon) {
  try {
    const response = await axios.get(
      `${url}units=${units}&appid=${apiKey}&lat=${lat}&lon=${lon}`
    );
    return response.data;
  } catch (err) {
    console.error(err.message);
  }
}

const currentCityBtn = document.querySelector("#my-city-btn");
currentCityBtn.addEventListener("click", showWeatherInMyCity);

/**************************************************************************************************************************/
//* get the img according to the conditions

const icons = {
  clouds: "media/cloud.png",
  rain: "media/thunder.png",
  mist: "media/rainbow.png",
  clear: "media/sun.png",
  few: "media/sun_cloud.png",
};

function updateCurrentImg(weather) {
  const imgRef = document.querySelector("#weather-icon");
  if (weather.includes("clear")) {
    imgRef.src = icons["clear"];
  } else if (weather.includes("clouds") && weather.includes("few")) {
    imgRef.src = icons["few"];
  } else if (weather.includes("rain") || weather.includes("thunderstorm")) {
    imgRef.src = icons["rain"];
  } else if (weather.includes("mist")) {
    imgRef.src = icons["mist"];
  } else if (weather.includes("clouds")) {
    imgRef.src = icons["clouds"];
  }
}

/**************************************************************************************************************************/
//* Adding the functionality for displaying the 5-days forecast

// To get the daily forecast, we need to use another root url for the API call (below)
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?";

async function showInitForecast() {
  const city = "Kharkiv";
  const data = await getWeatherData(forecastUrl, city);
  const list = data.list;
  const respArr = extractWeatherData(list);
  // console.log(respArr);

  displayWeatherData(respArr);
}

//since the new API call returns daily and HOURLY forecast, was decided to display the forecast for 12.00 each day only
//for this purpose the "for" loop has such a strange logic
// TODO: logic in the "for" loop is incorrect: need to fix later;

function extractWeatherData(list) {
  const respArr = [];
  for (let i = 6; i < list.length; i += 8) {
    respArr.push({
      temp: Math.round(list[i].main.temp),
      descr: list[i].weather[0].main,
    });
  }
  return respArr;
}

function displayWeatherData(arr) {
  const forecastRef = document.querySelector(".main_content__right"); // selecting the forecast section

  const div = document.createElement("div"); // creating the container
  div.className = "right__forecast";
  div.id = "right-forecast";

  let elementIndex = 1; // will be used as increment when getting the date and day

  arr.forEach((el) => {
    const dateP = createDateP(elementIndex);
    const tempP = createTempP(el.temp);
    const iconP = createIconP(el.descr);
    div.append(dateP, tempP, iconP);
    elementIndex++; // increments the index to get the next five days and dates
  });
  forecastRef.appendChild(div);
}

function createDateP(index) {
  const dateP = document.createElement("p");
  dateP.className = "forecast-date";

  const day = moment().add(index, "days").format("ddd").slice(0, 3);
  const date = moment().add(index, "days").format("DD/MM/YYYY");

  dateP.innerHTML = `${day}<br />${date}`;

  return dateP;
}

function createTempP(temp) {
  const tempP = document.createElement("p");
  tempP.className = "forecast-temp";

  tempP.innerHTML = `${temp}°`;

  return tempP;
}

function createIconP(descr) {
  const iconP = document.createElement("p");

  iconP.innerHTML = `<img
                  src="${icons[descr]}"
                  alt="weather icon"
                  class="forecast-img"
                />`;

  return iconP;
}

showInitForecast();

/**************************************************************************************************************************/
// function for displaying the 5-days forecast on the input change (used above, in the "showWeather" function)
async function updateForecast(url, city) {
  const data = await getWeatherData(url, city);
  const list = data.list;
  const respArr = extractWeatherData(list);

  displayWeatherData(respArr, date);
}
