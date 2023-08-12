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
const history = JSON.parse(localStorage.getItem("history")) || []; // could use a Set to avoid duplicate history items

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
  const location = searchInput.value.trim();
  if (location === "") return; // if location is blank, do nothing

  // TODO: render the cards

  // console.log(location);
  history.push(location);
  if (history.length > 5) {
    history.splice(0, 1);
  }
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory(history);
  searchForm.reset();
}

/**
 * This function handles the button clicks of history items.
 * @param {object} e - The event object
 */
function handleClick(e) {
  if (!e.target.matches("button")) return; // if it isn't a button, then return
  const location = e.target.dataset.location;
  console.log(location);
  // TODO: re-run the fetch and re-render the cards
  // implement here
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
  // console.log(responseJson);
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
    // TODO: destructure response object into variables
    const city = weatherData.city.name;

    // TODO: convert unix date/time
    const dateTime = weatherData.list[0].dt;
    const dateTimeTextString = weatherData.list[0].dt_txt;

    const tempK = weatherData.list[0].main.temp; // in Kelvin
    const humidity = weatherData.list[0].main.humidity;
    const weatherIcon = weatherData.list[0].weather[0].icon; // string for the icon image .png
    const weatherIconAlt = weatherData.list[0].weather[0].description; // string for the icon image .png
    const windSpeed = weatherData.list[0].wind.speed;

    // console.log(weatherData);
    // console.log(
    //   { city },
    //   { dateTime },
    //   { dateTimeTextString },
    //   { tempK },
    //   { humidity },
    //   { weatherIcon },
    //   { windSpeed }
    // );

    // TODO: inject content into the DOM
    today.innerHTML = renderToday(
      city,
      dateTimeTextString,
      tempK,
      humidity,
      windSpeed,
      weatherIcon,
      weatherIconAlt
    );
  })
  .catch((err) => console.error(err));

function renderToday(city, date, temp, humidity, windSpeed, icon, iconAlt) {
  return `
          <div class="card">
              <div class="card-body">
                <h5 class="card-title">
                  ${city} ${date}
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

function renderHistory(history) {
  if (history.length === 0) return; // if there is no history, do nothing
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

renderHistory(history);
