// DOM elements
const searchField = document.getElementById("search-input");

// API call params
const apiKey = "e65881984450c0477412f63cf68a5579";
const limit = 1;
const searchLocation = "London"; // this is a test input

// obtain the lat/lon for input city
const getData = async () => {
  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${searchLocation}&limit=${limit}&appid=${apiKey}`
  );
  const responseJson = await response.json();
  console.log(responseJson);
  return responseJson;
};

const latLon = getData();

// get the weather data at the defined lat/lon
latLon
  .then(async (data) => {
    // obtain weather at target lat/lon
    const response = await fetch(
      `http://api.openweathermap.org/data/2.5/forecast?lat=${data[0].lat}&lon=${data[0].lon}&appid=${apiKey}`
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
