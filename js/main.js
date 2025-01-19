const openWeatherkey = "45a1078dcfa9a0cac30ade9573e63587";
const unsplashKey = "yHNHJjy_sBl1Vr285tqf0qGyqZ2W43Y0Jmi5U8kzCF8";
const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const datalist = document.getElementById("searchList");
const home = document.getElementById("home");
const favList = document.getElementById("favList");
const initList = document.getElementById("initList");
const allItems = favList.querySelectorAll("li:not(#initList)");
let index = 0;
//async fetch function

let coordinates = async function getCoordinatesByLocationName(city) {
  try {
    const result = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${openWeatherkey}`
    );
    if (!result.ok) {
      datalist.innerHTML = "<p>City not found!</p>";
      throw new Error("City not found");
    }

    const data = await result.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { lat, lon };
    } else {
      datalist.innerHTML = "<p>City not found!</p>";
    }
  } catch (error) {
    datalist.innerHTML = `<p>Error: ${error.message}</p>`;
  }
};
let weather = async function getWeatherLatAndLon(lat, lon) {
  try {
    const result = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherkey}&units=metric`
    );
    if (!result.ok) {
      datalist.innerHTML = "<p>City not found!</p>";
      throw new Error("City not found");
    }

    const data = await result.json();
    return data;
  } catch (error) {
    datalist.innerHTML = `<p>Error: ${error.message}</p>`;
  }
};
let cities = async function getCities(city) {
  try {
    const result = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${openWeatherkey}`
    );

    if (!result.ok) {
      datalist.innerHTML = "<p>City not found!</p>";
      throw new Error("City not found");
    }

    let data = await result.json();
    const lowercaseCity = city.toLowerCase();
    data = data.filter((item) =>
      item.name.toLowerCase().startsWith(lowercaseCity)
    );

    data = data.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    return data;
  } catch (error) {
    console.error("Error fetching city data:", error);
  }
};
let images = async function getImageByCity(city) {
  try {
    const result = await fetch(
      `https://api.unsplash.com/search/photos?query=${city}&client_id=${unsplashKey}`
    );
    if (!result.ok) {
      if (result.status === 404) {
        throw new Error("City picture not found");
      }
      datalist.innerHTML = "<p>City picture not found!</p>";
      console.error("City picture not found");
      return null;
    }

    const data = await result.json();
    let arrImg = data.results;
    if (arrImg.length > 0) {
      let rand = Math.floor(Math.random() * 10);
      let url = arrImg[rand].links.download;
      return url;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching picture data:", error);
  }
};

// data function
function displayCityList(cities) {
  datalist.innerHTML = "";

  if (cities.length === 0) {
    datalist.innerHTML = "No cities found";
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
  h3.id = "weatherTitle";
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
    //console.log(new Date(tempArr[i]["date"]).toDateString());
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
  imgSection.id = "sectionImg";
  main.appendChild(imgSection);

  const img = document.createElement("img");
  const h4 = document.createElement("h4");
  h4.classList.add("img-container__h4");
  h4.innerHTML = `A little picture from ${city}<span>.</span>`;
  img.classList.add("img-container__img");
  img.src = `${url}&w=1200&h=800&fit=max`;
  imgSection.appendChild(h4);
  imgSection.appendChild(img);
}
function addFavBtn() {
  const buttonAdd = document.createElement("a");
  const imgSection = document.getElementById("sectionImg");
  buttonAdd.classList.add("img-container__button");
  buttonAdd.id = "addBtn";
  buttonAdd.innerText = "Add to favorite city";
  imgSection.appendChild(buttonAdd);
  return buttonAdd;
}
function addToFavList(city) {
  const ul = document.getElementById("favList");
  localStorage.setItem(index, city);
  const li = document.createElement("li");
  li.innerHTML = localStorage.getItem(index);
  li.value = index;
  li.style.display = "none";
  ul.appendChild(li);
  index++;
}

// listeners
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cityName = input.value.trim();
  if (cityName) {
    const city = await cities(cityName);
    displayCityList(city);
  }
});
input.addEventListener("input", async (e) => {
  e.preventDefault();

  const cityName = input.value.trim();
  if (cityName) {
    const cityList = await cities(cityName);
    displayCityList(cityList);
  }
  if (input.value === "") {
    datalist.innerHTML = "";
    const section = document.getElementById("weatherResult");
    section.innerHTML = "";
    const imgSection = document.getElementById("sectionImg");
    if (imgSection) {
      imgSection.remove();
    }
  }
});
datalist.addEventListener("click", async (e) => {
  let txt = e.target.innerText;
  let arr = txt.split(", ");
  const section = document.getElementById("weatherResult");
  section.innerHTML = "";
  const imgSection = document.getElementById("sectionImg");
  if (imgSection) {
    imgSection.innerHTML = "";
  }
  if (section.innerHTML === "") {
    const coords = await coordinates(arr[0]);
    const weatherData = await weather(coords.lat, coords.lon);
    const url = await images(arr[0]);
    displayWeatherResult(weatherData);
    const h3 = document.getElementById("weatherTitle");
    h3.innerHTML = `Temperature in ${txt}<span>.</span>`;
    if (!url) {
      if (imgSection) {
        imgSection.innerHTML = `<p>No picture for ${arr[0]} `;
      }
    } else {
      displayImgByCity(url, arr[0]);
    }
    addFavBtn().addEventListener("click", (e) => {
      const btnFav = document.getElementById("addBtn");
      btnFav.innerHTML = "✓";
      btnFav.style.backgroundColor = "green";
      addToFavList(txt);
    });

    input.value = txt;
    datalist.innerHTML = "";
  }
});
home.addEventListener("click", (e) => {
  location.reload(true);
});
favList.addEventListener("click", async (e) => {
  if (e.target.id != "initList") {
    let txt = e.target.innerText;
    let arr = txt.split(", ");
    const section = document.getElementById("weatherResult");
    const imgSection = document.getElementById("sectionImg");
    section.innerHTML = "";
    if (imgSection) {
      imgSection.remove();
    }

    try {
      const coords = await coordinates(arr[0]);
      const weatherData = await weather(coords.lat, coords.lon);
      const url = await images(arr[0]);
      displayWeatherResult(weatherData);
      const h3 = document.getElementById("weatherTitle");
      h3.innerHTML = `Temperature in ${txt}<span>.</span>`;
      if (url) {
        displayImgByCity(url, arr[0]);
      } else {
        imgSection.innerHTML = `<p>No picture for ${arr[0]}</p>`;
      }
      datalist.innerHTML = "";
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
});
initList.addEventListener("click", () => {
  const allItems = favList.querySelectorAll("li:not(#initList)");

  allItems.forEach((item) => {
    if (item.style.display === "none") {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
});
