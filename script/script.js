/**************************************************************************************************************************/
let temp = null;
let forecastTempRefs = [];
// let forecastTemps = [];

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

//* adding functionality: weather API, geolocation API
let apiUrlRoot = "https://api.shecodes.io/weather/v1/current?";
const apiKey = "785e4002t4o34d2ed60bb3aec801e9af";
const units = "metric";

/**************************************************************************************************************************/
//* showing the initial city ("Kharkiv") and temperature when the page is loaded

async function getInitialCityTemp() {
  const city = "Kharkiv";
  updateCurrentCity(city);

  const data = await getWeatherData(apiUrlRoot, city);

  temp = Math.round(data.temperature.current);
  updateCurrentTemp(temp);

  const description = data.condition.description;
  updateCurrentWeatherDescription(description);

  updateMainIcon(description);

  const windSpeed = Math.round(data.wind.speed);
  updateWindInfo(windSpeed);

  showInitForecast();
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

function updateWindInfo(speed) {
  const windSpeedRef = document.querySelector("#wind-speed");
  windSpeedRef.textContent = `Wind speed: ${speed} m/s`;
}

document.addEventListener("DOMContentLoaded", getInitialCityTemp);

/**************************************************************************************************************************/
//* showing temperature according to the input value

async function showWeather(e) {
  e.preventDefault();

  const city = getCity();
  updateCurrentCity(city);

  const data = await getWeatherData(apiUrlRoot, city);

  temp = Math.round(data.temperature.current);
  updateCurrentTemp(temp);

  const description = data.condition.description;
  updateCurrentWeatherDescription(description);

  updateMainIcon(description);

  const windSpeed = Math.round(data.wind.speed);
  updateWindInfo(windSpeed);

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

    const city = data.city;
    updateCurrentCity(city);

    temp = Math.round(data.temperature.current);
    updateCurrentTemp(temp);

    const description = data.condition.description;
    updateCurrentWeatherDescription(description);

    updateMainIcon(description);

    const windSpeed = Math.round(data.wind.speed);
    updateWindInfo(windSpeed);

    const forecastRef = document.querySelector(".main_content__right");
    forecastRef.innerHTML = "";
    updateForecast(forecastUrl, city);
  } catch (err) {
    console.error(err.message);
  }
}

async function getMyCityWeatherData(url, lat, lon) {
  try {
    const response = await axios.get(
      `${url}units=${units}&key=${apiKey}&lat=${lat}&lon=${lon}`
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
  if (weather.includes("clear")) {
    url = icons["clear"];
  } else if (weather.includes("clouds") && weather.includes("few")) {
    url = icons["few"];
  } else if (weather.includes("rain") || weather.includes("thunderstorm")) {
    url = icons["rain"];
  } else if (weather.includes("mist")) {
    url = icons["mist"];
  } else if (weather.includes("clouds")) {
    url = icons["clouds"];
  }
  return url;
}

function updateMainIcon(descr) {
  const imgRef = document.querySelector("#weather-icon");
  const url = updateCurrentImg(descr);
  imgRef.src = url;
}

/**************************************************************************************************************************/
//* Adding the functionality for displaying the 5-days forecast

// To get the daily forecast, we need to use another root url for the API call (below)
const forecastUrl = "https://api.shecodes.io/weather/v1/forecast?";

async function showInitForecast() {
  const city = "Kharkiv";
  const data = await getWeatherData(forecastUrl, city);
  const list = data.daily;

  const respArr = extractWeatherData(list);

  displayWeatherData(respArr);
}

function extractWeatherData(list) {
  const respArr = [];
  const len = 5;
  for (let i = 1; i <= len; i++) {
    respArr.push({
      temp: Math.round(list[i].temperature.day),
      descr: list[i].condition.description,
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
  const url = updateCurrentImg(descr);

  iconP.innerHTML = `<img
                  src=${url}
                  alt="weather icon"
                  class="forecast-img"
                />`;

  return iconP;
}

/**************************************************************************************************************************/
// function for displaying the 5-days forecast on the input change (used above, in the "showWeather" function)
async function updateForecast(url, city) {
  const data = await getWeatherData(url, city);
  const list = data.daily;
  const respArr = extractWeatherData(list);

  displayWeatherData(respArr, date);
}

//* temp units switcher

const tempDisp = document.querySelector(".left__current_temp p");
const celsUnit = document.querySelector("#temp-celsius");
const fahrUnit = document.querySelector("#temp-fahrenheit");

function getCelsius() {
  tempDisp.textContent = temp;

  forecastTempRefs = document.querySelectorAll(".forecast-temp");

  let forecastTemps = getForecastTemp();
  let forecastTempsCels = getForecastTempCels(forecastTemps);

  for (let i = 0; i < forecastTempRefs.length; i++) {
    const celsTemp = forecastTempsCels[i];
    const tempElem = forecastTempRefs[i];
    tempElem.textContent = `${celsTemp}°`;
  }

  toggleActiveClass(fahrUnit);
  toggleActiveClass(celsUnit);
}

function getFahrenheit() {
  let temperatureFahr = Math.floor(temp * 1.8 + 32);
  tempDisp.textContent = temperatureFahr;

  forecastTempRefs = document.querySelectorAll(".forecast-temp");

  let forecastTemps = getForecastTemp(); // extracting the forecast temperatures in celsius
  let forecastTempsFahr = getForecastTempFahr(forecastTemps); // converting temp to fahrenheit and creating another array

  for (let i = 0; i < forecastTempRefs.length; i++) {
    const fahrTemp = forecastTempsFahr[i];
    const tempElem = forecastTempRefs[i];
    tempElem.textContent = `${fahrTemp}°`;
  }

  toggleActiveClass(fahrUnit);
  toggleActiveClass(celsUnit);
}

function toggleActiveClass(element) {
  element.classList.contains("active")
    ? element.classList.remove("active")
    : element.classList.add("active");
}

// trick to improve the function above

// function toggleActiveClass(element) {
//   element.classList.toggle("active");
// }

function getForecastTemp() {
  forecastTempRefs = document.querySelectorAll(".forecast-temp");

  let forecastTemps = [];

  forecastTempRefs.forEach((elem) => {
    forecastTemps.push(elem.innerHTML);
  });

  return forecastTemps;
}

function getForecastTempFahr(forecastTemperaturesArray) {
  let forecastTempsFahr = [];

  forecastTemperaturesArray.forEach((elem) => {
    let tempCelsius = parseInt(elem, 10); // convert the string to an integer
    let tempFahrenheit = tempCelsius * 1.8 + 32;

    forecastTempsFahr.push(Math.round(tempFahrenheit));
  });

  return forecastTempsFahr;
}

function getForecastTempCels(forecastTemperaturesArray) {
  let forecastTempsCels = [];

  forecastTemperaturesArray.forEach((elem) => {
    let tempFahr = parseInt(elem, 10); // convert the string to an integer
    let tempCelsius = ((tempFahr - 32) * 5) / 9;

    forecastTempsCels.push(Math.round(tempCelsius));
  });

  return forecastTempsCels;
}

celsUnit.addEventListener("click", getCelsius);
fahrUnit.addEventListener("click", getFahrenheit);
