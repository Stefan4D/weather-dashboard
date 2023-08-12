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
const forecastRow = forecast.querySelector(".row");

/*
  ---------------
  State variables
  ---------------
*/
const history =
  new Set(JSON.parse(localStorage.getItem("history"))) || new Set(); // using a Set here to allow removal of duplicates simply
const lastSearched =
  JSON.parse(localStorage.getItem("lastSearched")) || "London"; // set the search to use the last searched location or default to London

/* 
  ---------------
  API call params
  ---------------
*/
// ! API key should not normally be stored here
const openWeatherApiKey = "e65881984450c0477412f63cf68a5579";
const resultsLimit = 1;
// Change this to pull from the DOM
// const userSearchlocation = lastSearched;

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
  const location = searchInput.value.trim();
  if (location === "") return; // if location is blank, do nothing

  // TODO: render the cards
  updateHistory(history, location); // ? should this be called within the fetch?
  fetchWeather(location);
  localStorage.setItem("lastSearched", JSON.stringify(location));
  searchForm.reset();
}

/**
 * This function handles the button clicks of history items.
 * @param {object} e - The event object
 */
function handleClick(e) {
  if (!e.target.matches("button")) return; // if it isn't a button, then return
  const location = e.target.dataset.location;
  updateHistory(history, location); // ? should this be called within the fetch?
  fetchWeather(location);
  localStorage.setItem("lastSearched", JSON.stringify(location));
}

/**
 * This function updates the search history and stores this in localStorage
 * @param {Set} history - this is the history Set to be updated
 * @param {string} location - this is the most recently searched location
 */
function updateHistory(history, location) {
  if (history.has(location)) {
    history.delete(location);
    history.add(location);
  } else {
    history.add(location);
  }

  // remove the first item in the set if there are more than 5
  if (history.size > 5) {
    history.delete(history.values().next().value);
  }
  // console.log(history);
  localStorage.setItem("history", JSON.stringify(Array.from(history))); // convert to array before storing in localStorage.  This is here as storing a Set in localStorage results in a blank object
}

/**
 * This function obtains the latitude / longitude for the given location
 *
 * @async
 * @function getLatLon
 * @param {string} searchLocation - The location searched by the user
 * @param {number} limit - How many results to be returned
 * @param {string} apiKey - The API key for the Open Weather endpoint
 * @returns {array} The data from the fetch as an array with nested objects
 */
const getLatLon = async (searchLocation, limit, apiKey) => {
  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${searchLocation}&limit=${limit}&appid=${apiKey}`
  );
  const responseJson = await response.json();
  // console.log(responseJson);
  return responseJson;
};

/**
 *
 * @param {string} location - the location searched by the user
 * @param {number} limit - the limit of results to pass through to the getLatLon function
 * @param {string} apiKey - the Open Weather API key to use
 */
function fetchWeather(
  location,
  limit = resultsLimit,
  apiKey = openWeatherApiKey
) {
  const latLon = getLatLon(location, limit, apiKey);

  // get the weather data at the defined lat/lon
  latLon
    .then(async (data) => {
      // obtain weather at target lat/lon
      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${data[0].lat}&lon=${data[0].lon}&appid=${openWeatherApiKey}&units=metric`
      ); // remove units=metric to go back to Kelvin, or use units=imperial for Fahrenheit
      const responseJson = response.json();
      return responseJson;
      // console.log(data[0].lat, data[0].lon);
    })
    .then((weatherData) => {
      const city = weatherData.city.name;

      const dateTime = weatherData.list[0].dt;
      const dateTimeTextString = weatherData.list[0].dt_txt;
      // converting UNIX timestamp to UK date format
      const date = new Date(dateTime * 1000).toLocaleDateString("en-GB");

      const temperature = weatherData.list[0].main.temp; // in Kelvin
      const humidity = weatherData.list[0].main.humidity;
      const weatherIcon = weatherData.list[0].weather[0].icon; // string for the icon image .png
      const weatherIconAlt = weatherData.list[0].weather[0].description; // string for the icon image .png
      const windSpeed = weatherData.list[0].wind.speed;

      console.log(weatherData);

      // inject today's forecast into the DOM
      today.innerHTML = renderToday(
        city,
        date,
        temperature,
        humidity,
        windSpeed,
        weatherIcon,
        weatherIconAlt
      );
      // TODO: parse data to pick next 5 days for forecast
      // parse data
      // 8 data points per day means that doing i = 0; i < list.length; i += 8 will show data for some point on the next day
      const forecasts = [];
      for (i = 0; i < weatherData.list.length; i += 8) {
        // console.log(i, weatherData.list[i].dt_txt);
        newDay = {
          date: new Date(weatherData.list[i].dt * 1000).toLocaleDateString(
            "en-GB"
          ),
          dateTimeTextString: weatherData.list[i].dt_txt,
          temperature: weatherData.list[i].main.temp,
          humidity: weatherData.list[i].main.humidity,
          icon: weatherData.list[i].weather[0].icon,
          iconAlt: weatherData.list[i].weather[0].description,
          windSpeed: weatherData.list[i].wind.speed,
        };
        forecasts.push(newDay);
      }

      // inject the 5 day forecast into the DOM
      renderForecast(forecasts);
      renderHistory(history);
    })
    .catch((err) => console.error(err));
}

/**
 *
 * @param {string} city
 * @param {string} date
 * @param {number} temp
 * @param {number} humidity
 * @param {number} windSpeed
 * @param {string} icon
 * @param {string} iconAlt
 * @returns {string}
 */
function renderToday(city, date, temp, humidity, windSpeed, icon, iconAlt) {
  return `
          <div class="card">
              <div class="card-body">
                <h5 class="card-title">
                  ${city} (${date})
                  <img
                    src="http://openweathermap.org/img/wn/${icon}@2x.png"
                    alt="${iconAlt}"
                    height="50px"
                  />
                </h5>
                <div class="card-text">
                  <div>Temp: ${temp}&deg;C</div>
                  <div>Wind: ${windSpeed} KPH</div>
                  <div>Humidity: ${humidity}%</div>
                </div>
              </div>
            </div>
  `;
}

/**
 * This function renders an individual forecast card
 * @param {string} date
 * @param {number} temp
 * @param {number} humidity
 * @param {number} windSpeed
 * @param {string} icon
 * @param {string} iconAlt
 * @returns {string}
 */
function renderForecastCard(date, temp, humidity, windSpeed, icon, iconAlt) {
  return `
  <div class="card bg-dark h-100 col-lg my-3">
  <div class="card-body text-white">
    <h5 class="card-title">${date}</h5>
    <img
      src="http://openweathermap.org/img/wn/${icon}@2x.png"
      alt="${iconAlt}"
      height="50px"
    />
    <div class="card-text">
      <div>
        Temp: ${temp}&deg;C
      </div>
      <div>
        Wind: ${windSpeed} KPH
      </div>
      <div>
        Humidity: ${humidity}&percnt;
      </div>
    </div>
  </div>
</div>
  `;
}

/**
 * This function takes an array of forecast objects and renders them to the page using renderForecastCard()
 * @param {array} forecasts - the array of forecasts to be rendered
 */
function renderForecast(forecasts) {
  forecastRow.innerHTML = "";
  forecasts.forEach((day) => {
    const forecastCard = renderForecastCard(
      day.date,
      day.temperature,
      day.humidity,
      day.windSpeed,
      day.icon,
      day.iconAlt
    );
    forecastRow.innerHTML += forecastCard;
    // forecastRow.appendChild(forecastCard);
  });
}

/**
 * This function renders the search history of the user to the page
 * @param {Set} history
 */
function renderHistory(history) {
  if (history.size === 0) return; // if there is no history, do nothing
  searchHistory.innerHTML = ""; // clear our the element first
  history.forEach((historyItem) => {
    const newBtn = document.createElement("button");
    newBtn.setAttribute("class", "btn btn-secondary mb-3");
    newBtn.textContent = historyItem;
    newBtn.setAttribute("data-location", historyItem);
    searchHistory.prepend(newBtn);
  });
}

/*
  ---------------
  Event listeners
  ---------------
*/
searchForm.addEventListener("submit", handleSubmit);
searchHistory.addEventListener("click", handleClick);

// renderHistory(history);
fetchWeather(lastSearched, resultsLimit, openWeatherApiKey);
