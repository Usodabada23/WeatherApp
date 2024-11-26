const openWeatherkey = "45a1078dcfa9a0cac30ade9573e63587";
const ninjaKey = "eEo0kAEU9JvRiBQXi9FVZQ==ICbDTBzCCTt9ztaM";
const unsplashKey = "yHNHJjy_sBl1Vr285tqf0qGyqZ2W43Y0Jmi5U8kzCF8";
const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const datalist = document.querySelector(".search-container__result");

//async fetch function

async function getCordinatesByLocationName(city) {
  try {
    const result = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${openWeatherkey}`
    );
    if (!result.ok) {
      throw new Error("City not found");
    }

    const data = await result.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      getWeatherLatAndLon(lat, lon);
    } else {
      datalist.innerHTML = "<p>City not found!</p>";
    }
  } catch (error) {
    datalist.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}
async function getWeatherLatAndLon(lat, lon) {
  try {
    const result = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherkey}&units=metric`
    );
    if (!result.ok) {
      throw new Error("Error fetching forecast");
    }

    const data = await result.json();
    displayWeatherResult(data);
  } catch (error) {
    datalist.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}
async function getCities(city) {
  try {
    const result = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${openWeatherkey}`
    );

    if (!result.ok) {
      throw new Error("City not found");
    }

    const data = await result.json();
    updateCityList(data);
  } catch (error) {
    console.error("Error fetching city data:", error);
  }
}
async function suggestions(city) {
  let options = {
    method: "GET",
    headers: { "x-api-key": ninjaKey },
  };
  try {
    const result = await fetch(
      `https://api.api-ninjas.com/v1/city?name=${city}`,
      options
    );
    if (!result.ok) {
      throw new Error("City not found");
    }

    const data = await result.json();
    const suggestionsList = document.querySelector(
      ".search-container__form--suggestions-list"
    );
    suggestionsList.innerHTML = "";
    for (item of data) {
      const option = document.createElement("li");
      option.innerHTML = `${item.name},${item.country}`;

      option.addEventListener("click", () => {
        input.value = `${item.name},${item.country}`;
        suggestionsList.innerHTML = "";
      });

      suggestionsList.appendChild(option);
    }
  } catch (error) {
    console.error("Error fetching city data:", error);
  }
}
async function getImageByCity(city) {
  try {
    const result = await fetch(
      `https://api.unsplash.com/search/photos?query=${city}&client_id=${unsplashKey}`
    );
    const data = await result.json();
    let arrImg = data.results;
    let rand = Math.floor(Math.random() * 10);
    let url = arrImg[rand].links.download;
    displayImgByCity(url, city);
  } catch (error) {}
}

// data function

function updateCityList(cities) {
  datalist.innerHTML = "";

  if (cities.length === 0) {
    const option = document.createElement("option");
    option.value = "No cities found";
    datalist.appendChild(option);
  } else {
    for (const city of cities) {
      const option = document.createElement("option");
      option.value = `${city.name}, ${city.country}`;
      option.innerHTML = `${city.name}, ${city.country}`;
      datalist.appendChild(option);
    }
  }
}
function getDayName(dateString) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date(dateString);
  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}
function displayWeatherResult(data) {
  let arr = getMaxMinTempByDate(data);
  const section = document.querySelector(".weather-container");
  const tempDatalist = document.createElement("datalist");
  const h3 = document.createElement("h3");
  h3.classList.add("weather-container__h3");
  h3.innerHTML = `Temperature in ${data.city.name},${data.city.country}<span>.</span>`;
  section.appendChild(h3);
  tempDatalist.classList.add("weather-container__result");
  for (let i = 0; i < arr.length; i++) {
    const option = document.createElement("option");

    option.value = arr[i]["day"];
    let formatDate = arr[i]["day"].split("-");
    option.innerHTML = `${getDayName(arr[i]["day"])} ${formatDate[2]}/${
      formatDate[1]
    } <br>Max. ${arr[i]["maxTemp"]}° - Min. ${arr[i]["minTemp"]}°`;
    tempDatalist.appendChild(option);
  }
  section.appendChild(tempDatalist);
}
function getMaxMinTempByDate(data) {
  let temp = data["list"];
  const tempArr = [];
  for (let i = 0; i < temp.length; i++) {
    let content = temp[i];
    let obj = {};
    obj.date = content["dt_txt"];
    obj.temp = content.main.temp_max;
    tempArr.push(obj);
  }

  const arrTempOfTheDay = [];
  let tempOftheDayMax = 0;
  let tempOftheDayMin = 0;
  let previousDate = null;

  for (let i = 0; i < tempArr.length; i++) {
    let dateWithoutHour = tempArr[i]["date"].split(" ")[0];

    if (dateWithoutHour === previousDate) {
      tempOftheDayMax = Math.max(tempOftheDayMax, tempArr[i]["temp"]);
      tempOftheDayMin = Math.min(tempOftheDayMin, tempArr[i]["temp"]);
    } else {
      if (previousDate !== null) {
        arrTempOfTheDay.push({
          day: previousDate,
          maxTemp: tempOftheDayMax,
          minTemp: tempOftheDayMin,
        });
      }

      tempOftheDayMax = tempArr[i]["temp"];
      tempOftheDayMin = tempArr[i]["temp"];
    }

    previousDate = dateWithoutHour;
    if (i === tempArr.length - 1) {
      arrTempOfTheDay.push({
        day: previousDate,
        maxTemp: tempOftheDayMax,
        minTemp: tempOftheDayMin,
      });
    }
  }

  return arrTempOfTheDay;
}
function displayImgByCity(url, city) {
  const main = document.querySelector("main");
  const imgSection = document.createElement("section");
  imgSection.classList.add("img-container");
  main.appendChild(imgSection);

  const img = document.createElement("img");
  const h4 = document.createElement("h4");
  h4.classList.add("img-container__h4");
  h4.innerHTML = `A little picture from ${city}<span>.</span>`;
  img.classList.add("img-container__img");
  img.src = `${url}`;
  imgSection.appendChild(h4);
  imgSection.appendChild(img);
}

// listener
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const cityName = input.value.trim();
  if (cityName) {
    getCities(cityName);
  }
});

input.addEventListener("input", () => {
  if (input.value === "") {
    datalist.innerHTML = "";
    const section = document.querySelector(".weather-container");
    section.innerHTML = "";
    const suggestions = document.querySelector(
      ".search-container__form--suggestions-list"
    );
    suggestions.innerHTML = "";
    const imgSection = document.querySelector(".img-container");
    if (imgSection) {
      imgSection.remove();
    }
  } else {
    suggestions(input.value);
  }
});
window.addEventListener("load", () => {
  input.value = "";
});
datalist.addEventListener("click", async (e) => {
  let txt = e.target.innerText;
  let arr = txt.split(", ");
  await getCordinatesByLocationName(arr[0]);
  await getImageByCity(arr[0]);
});
