function weather() {
  var location = document.getElementById("location").value;
  validate(location);
  var home = document.getElementById("home");
  home.style.marginTop = "0";

  $.ajax({
    url: '/weather?location='+location,
    type: 'GET',
    dataType: 'json', 
    success: (data) => {
    var currentData = document.getElementById("currentData");
    currentData.style.position = "static";
    var forecastBox = document.getElementById("forecast");
    forecastBox.style.position = "static";
    
      // add to nav
    var nav = document.getElementById("links");
    nav.innerHTML = "";
    var li2 = document.createElement("li");
    var coord = JSON.stringify(data.coord);
    li2.innerHTML = "<a href='#' onclick='getHourly(" + coord  + ")'>Hourly</a>";
    var li3 = document.createElement("li");
    li3.innerHTML = "<a href='#' onclick='getForecast(" + coord + ")'>Daily</a>";
    li2.style.padding = "0 10px";
    li3.style.padding = "0 10px";
    nav.append(li2);
    nav.append(li3);

      // get city and state
      getCityState(data.coord, location);

      var time = new Date().toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
      var temp = Math.round(data.main.temp);
      var description = data.weather[0].description;
      var descUpper = description.charAt(0).toUpperCase() + description.slice(1);
      var feelsLike = Math.round(data.main.feels_like);
      var wind = Math.round(data.wind.speed);
      var windDirection = getDirection(data.wind.deg);

      // get sunrise and sunset times
      var sunrise = getTime(data.sys.sunrise);
      var sunset = getTime(data.sys.sunset);
      
      // get AQI and forecast
      getForecast(data.coord);
      var aqi = getAQI(data.coord);
      getAirQuality(aqi); 

      // image html
      var icon = "<img src='http://openweathermap.org/img/w/" + data.weather[0].icon + ".png' class='icon' alt='Weather Icon'>";

      // empty elements
      document.getElementById("home").innerHTML =  "";
      document.getElementById("currentData").innerHTML = "";

      // add current data to view
      var display = document.getElementById("currentData");
      display.style.backgroundImage = "linear-gradient(#18458b 0%, #fff 100%)";
      display.innerHTML = "<h2><span id='city'></span>, <span id='state'></span></h2><p class='mb-0'>As of " + time + "</p>";
      display.innerHTML += "<p class='ft-small'><span>Sunrise: " + sunrise + " a.m.</span> / <span>Sunset: " + sunset + " p.m.</span></p><p class='font-xlg mb-0 d-flex flex-nowrap align-items-center'>" + icon + temp + "&deg;</p>";
      display.innerHTML += "<p class='mb-0'>Feels like " + feelsLike + "&deg;</p><p class='font-lg mb-0'>" + descUpper + "</p><p>Wind: " + windDirection + " " + wind + " mph</p><p id='aqi'></p>";
    }
  });
}


// get wind direction
function getDirection(deg) {
  var direction = "";
  if (deg == 0) {
    direction = "N";
  } else if (deg > 0 && deg < 45) {
    direction = "NNE"; 
  } else if (deg == 45) {
    direction = "NE";
  } else if (deg > 45 && deg <= 89) {
    direction = "ENE"; 
  } else if (deg == 90) {
    direction = "E"; 
  } else if (deg > 90 && deg < 135) {
    direction = "ESE";
  } else if (deg == 135) {
    direction = "SE";
  } else if (deg > 135 && deg < 180) {
    direction = "SSE";
  } else if (deg == 180) {
    direction = "S";
  } else if (deg > 180 && deg < 225) {
    direction = "SSW";
  } else if (deg == 225) {
    direction = "SW";
  } else if (deg > 225 && deg < 269) {
    direction = "WSW";
  } else if (deg == 270) {
      direction = "W";
  } else if (deg > 270 && deg < 314) {
    direction = "WNW";
  } else if (deg == 315) {
    direction = "NW";
  } else if (deg > 315 && deg < 360) {
    direction = "NNW";
  }
  return direction;
}

// get 7-day forecast
function getForecast(coord) {
  $.ajax({
    url: '/forecast',
    type: 'POST',
    dataType: 'json',
    data: coord,
    success: (data) => {
      // add to nav
      var nav = document.getElementById("links");
      // Check for alert link
      if (nav.lastChild.textContent != "Alerts") {
        if (typeof data.alerts != "undefined") {
          var alerts = JSON.stringify(data.alerts[0]);
          var li4 = document.createElement("li");
          li4.innerHTML = "<a href='#forecast' onclick='displayAlert(" + alerts + ")'>Alert</a>";
          li4.style.padding = "0 10px";
          nav.append(li4);
        }
      } 

      // add forecast table
      var display = document.getElementById("forecast");
      display.innerHTML = "";
      display.style.backgroundColor = "#fff";
      var h2 = document.createElement("h2");
      h2.style.padding = "20px 0 10px 10px";
      h2.style.textAlign = "left";
      h2.style.borderBottom = "1px solid #c4e3ff";
      h2.innerHTML = "7-day Forecast";
      display.append(h2);
      var table = document.createElement("table");
      display.append(table);
      for (var i = 0; i < data.daily.length; i++) {
        var tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #c4e3ff";
        tr.style.padding = "5px 15px";
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");
        var td4 = document.createElement("td");
        var td5 = document.createElement("td");
        var td6 = document.createElement("td");
        td1.style.width = "90px";
        td2.style.textAlign = "left";
        td2.style.width = "auto";
        //td3.classList += "d-none d-md-flex"
        td3.style.width = "90px";
        td4.style.width = "115px";
        td5.style.width = "70px";
        td6.classList += "text-left mr-2";

        var info = data.daily[i];
        var wind = Math.round(info.wind_speed);
        var windDirection = getDirection(info.wind_deg);
        var desc = info.weather[0].description;
        var description = desc.charAt(0).toUpperCase() + desc.slice(1);

        // get date
        var dateObject = getDate(info.dt);
        var DOW = dateObject.toLocaleString("default", { weekday: "short" })
        var date = dateObject.getDate();

        // fill td's
        td1.innerHTML = Math.round(info.temp.max) + "&deg;/" + Math.round(info.temp.min) + "&deg;";
        td2.innerHTML = "<img src='http://openweathermap.org/img/w/" + info.weather[0].icon + ".png' class='icon' alt='" + description + "'>";
        td3.innerHTML = rainPercent(info.pop);
        td4.innerHTML = windDirection + " " + wind + " mph";
        td5.innerHTML = DOW + " " + date;
        td6.innerHTML = description;
        table.append(tr);
        tr.append(td5);
        tr.append(td2);
        tr.append(td6);
        tr.append(td1);
        tr.append(td3);
        tr.append(td4);
      }

      // alert
      if (typeof data.alerts != "undefined") {
        var alert = document.getElementById("alert");
        alert.innerHTML = "";
        alert.classList = "bg-danger px-4";
        var p = document.createElement("p");
        var start = getDate(data.alerts[0].start);
        var end = getDate(data.alerts[0].end);
        p.innerHTML = "<a href='#forecast' onclick='displayAlert(" + alerts + ")'>" + data.alerts[0].event + "</a> from " + start + " to " + end;
        p.style.textAlign = "center";
        p.style.padding = "15px 0";
        p.style.color = "#fff";
        alert.append(p);
      } else {
        var alert = document.getElementById("alert");
        alert.innerHTML = "";
      } 
    },
    error: (error) => {
      console.log('There was an error retrieving the forecast.');
      console.log(error);
    }
  });
}

// get AQI to display
function getAQI(coord) {
  $.ajax({
    url: '/aqi',
    type: 'POST',
    dataType: 'json',
    data:coord,
    success: (data) => {
      // get air quality
      var quality = getAirQuality(data.aqi);
      document.getElementById("aqi").innerHTML = "Air quality: " + quality;
    },
    error: (error) => {
      console.log('There was an error');
      console.log(error);
    }
  });
}

// get type of air quality
function getAirQuality(aqi) {
  var quality = "";
  if (aqi == 1) {
    quality = "Good";
  } else if (aqi == 2) {
    quality = "Fair";
  } else if (aqi == 3) {
    quality = "Moderate";
  } else if (aqi == 4) {
    quality = "Poor";
  } else if (aqi == 5) {
    quality = "Very Poor";
  } else {
    quality = "NA";
  }
  return quality;
}

// convert rain amount to percentage
function rainPercent(pop) {
  var rain = Math.round(pop * 100);
  var display = "&#128167; " + rain + "&percnt;";
  return display;
}

// get city and state from lat and lon
function getCityState(coord, zip) {
  $.ajax({
    url: '/cityState',
    type: 'POST',
    dataType: 'json',
    data:coord,
    success: (data) => {
      var city = document.getElementById("city");
      if (data.city.length != 0) {
        city.textContent = data.city;
      } else {
        city.textContent = zip;
      }
      var state = document.getElementById("state");
      state.textContent = data.principalSubdivision;
    },
    error: (error) => {
      console.log('There was an error');
      console.log(error);
    }
  });
}

function getDate(dt) {
  const unixTimestamp = dt;
  const milliseconds = unixTimestamp * 1000;
  const dateObject = new Date(milliseconds);
  return dateObject;
}

// convert unix timestamp to hours and minutes
function getTime(unix) {
  var dateObject = getDate(unix);
  var hour = dateObject.getHours();
  var minute = dateObject.getMinutes();
  var minutes = "";
  if (minute < 10) {
    minutes = "0" + minute;
  } else {
    minutes = minute;
  }
  hour = ((hour + 11) % 12 + 1);
  var time = hour + ":" + minutes;
  return time;
}

// get 48-hour forecast
function getHourly(coord) {
  $.ajax({
    url: '/hourly',
    type: 'POST',
    dataType: 'json',
    data: coord,
    success: (data) => {
      // add forecast table
      var display = document.getElementById("forecast");
      display.innerHTML = "";
      display.style.backgroundColor = "#fff";
      var h2 = document.createElement("h2");
      h2.style.padding = "20px 0 10px 10px";
      h2.style.textAlign = "left";
      h2.style.borderBottom = "1px solid #c4e3ff";
      h2.innerHTML = "48-hour Forecast";
      display.append(h2);
      var table = document.createElement("table");
      display.append(table);
      for (var i = 0; i < data.hourly.length; i++) {
        var tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #c4e3ff";
        tr.style.padding = "5px 15px";
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");
        var td4 = document.createElement("td");
        var td5 = document.createElement("td");
        td1.style.width = "90px";
        td2.style.textAlign = "left";
        td3.style.width = "90px";
        td4.style.width = "135px";
        td5.style.width = "90px";

        var info = data.hourly[i];
        var wind = Math.round(info.wind_speed);
        var windDirection = getDirection(info.wind_deg);
        var desc = info.weather[0].description;
        var description = desc.charAt(0).toUpperCase() + desc.slice(1);

        // get hour
        var hour = getHour(info.dt);
        // fill td's
        td1.innerHTML = Math.round(info.temp) + "&deg;";
        td2.innerHTML = "<img src='http://openweathermap.org/img/w/" + info.weather[0].icon + ".png' class='icon' alt='" + info.weather[0].description + "'> " + description;
        td3.innerHTML = rainPercent(info.pop);
        td4.innerHTML = windDirection + " " + wind + " mph";
        td5.innerHTML = hour;
        table.append(tr);
        tr.append(td5);
        tr.append(td2);
        tr.append(td1);
        tr.append(td3);
        tr.append(td4);
      }   
    },
    error: (error) => {
      console.log('There was an error retrieving the forecast.');
      console.log(error);
    }
  });
}

function getHour(dt) {
  var dateObject = getDate(dt);
  var hour = dateObject.getHours() + 1;
  if (hour > 12) {
    hour = hour - 12;
    time = hour + " p.m.";
    return time;
  } else {
    time = hour + " a.m.";
    return time
  }
}

function displayAlert(data) {
  var alertDiv = document.getElementById("forecast");
  alertDiv.style.maxWidth = "600px";
  alertDiv.style.position = "static";
  alertDiv.style.backgroundColor = "#fff";
  var alert = data;
  var start = getDate(alert.start);
  var end = getDate(alert.end);
  alertDiv.innerHTML = "<h2>Alert: " + alert.sender_name + "</h2><p class='font-weight-bold'>" + start + " <br>to<br> " + end + "<p>" + alert.description + "</p>";
}

function validate(location) {
  const zipCodeRegex = /\d{5}/;
  var test = zipCodeRegex.test(location);
  var inputMessage = document.getElementById("validate");
  if (test == false) {
    inputMessage.classList += "bg-danger px-5 rounded text-light py-2";
    inputMessage.innerHTML = "Please enter a valid 5 digit U.S. zip code.";
  } else {
    inputMessage.classList -= "bg-danger px-5 rounded text-light py-2";
    inputMessage.innerHTML = "";
  }
}