/* 
  ------------
  DOM elements
  ------------
*/
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchHistory = document.getElementById("history");
const today = document.getElementById("today");
const forecast = document.getElementById("forecast");

/*
  ---------------
  State variables
  ---------------
*/
const history = JSON.parse(localStorage.getItem("history")) || [];

// API call params
// ! API key should not normally be stored here
const openWeatherApiKey = "e65881984450c0477412f63cf68a5579";
const resultsLimit = 1;
// ! Change this to pull from the DOM
const userSearchlocation = "London"; // this is a test input

/* 
  ---------
  Functions
  ---------
*/

/**
 * This function handles the submission of the location search form.
 * @param {object} e - The event object
 */
function handleSubmit(e) {
  e.preventDefault();
  console.log(searchInput.value.trim());
  searchForm.reset();
}

/**
 * This function obtains the latitude / longitude for the given location
 *
 * @async
 * @function getData
 * @param {string} searchLocation - The location searched by the user
 * @param {number} limit - How many results to be returned
 * @param {string} apiKey - The API key for the Open Weather endpoint
 * @returns {array} The data from the fetch as an array with nested objects
 */
const getData = async (searchLocation, limit, apiKey) => {
  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${searchLocation}&limit=${limit}&appid=${apiKey}`
  );
  const responseJson = await response.json();
  console.log(responseJson);
  return responseJson;
};

const latLon = getData(userSearchlocation, resultsLimit, openWeatherApiKey);

// get the weather data at the defined lat/lon
latLon
  .then(async (data) => {
    // obtain weather at target lat/lon
    const response = await fetch(
      `http://api.openweathermap.org/data/2.5/forecast?lat=${data[0].lat}&lon=${data[0].lon}&appid=${openWeatherApiKey}`
    );
    const responseJson = response.json();
    return responseJson;
    // console.log(data[0].lat, data[0].lon);
  })
  .then((weatherData) => {
    // weather data is obtained here in object
    // TODO: convert unix date/time
    // TODO: destructure response object into variables
    // TODO: inject content into the DOM
    console.log(weatherData);
  })
  .catch((err) => console.error(err));

/*
  ---------------
  Event listeners
  ---------------
*/
searchForm.addEventListener("submit", handleSubmit);
