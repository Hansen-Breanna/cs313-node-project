//const { json } = require("express");
$.getJSON("https://api.ipify.org?format=json", 
function(data) { 
$("#ip").html(data.ip); 
sessionStorage.setItem("ip", data.ip);
console.log(data.ip); 
})

function weather() {
  var location = document.getElementById("location").value;
  var home = document.getElementById("home");
  home.style.marginTop = "0";

  $.ajax({
    url: '/weather?location='+location,
    type: 'GET',
    dataType: 'json', 
    success: (data) => {
      // get city and state
      getCityState(data.coord);

      var time = new Date().toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
      var temp = Math.round(data.main.temp);
      var description = data.weather[0].description;
      var descUpper = description.charAt(0).toUpperCase() + description.slice(1);
      var feelsLike = Math.round(data.main.feels_like);
      var wind = Math.round(data.wind.speed);
      var windDirection = getDirection(data.wind.deg);

      // get sunrise and sunset times
      var sunrise = getTime(data.sys.sunrise);
      var sunset = getTime(data.sys.sunset)
      
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
      display.innerHTML += "<p class='mb-0'>Feels like " + feelsLike + "&deg;</p><p class='font-lg mb-0'>" + descUpper + 
      "</p><p>Wind " + windDirection + " " + wind + " mph</p><p id='aqi'></p>";
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
      console.log(data);

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
        td1.style.width = "90px";
        td2.style.width = "90px";
        td3.style.width = "90px";
        td4.style.width = "115px";
        td5.style.width = "70px";
        var wind = Math.round(data.daily[i].wind_speed);
        var windDirection = getDirection(data.daily[i].wind_deg);

        // get date
        const unixTimestamp = data.daily[i].dt;
        const milliseconds = unixTimestamp * 1000;
        const dateObject = new Date(milliseconds);
        var DOW = dateObject.toLocaleString("default", { weekday: "short" })
        var date = dateObject.getDate();

        // fill td's
        td1.innerHTML = Math.round(data.daily[i].temp.max) + "&deg;/" + Math.round(data.daily[i].temp.min) + "&deg;";
        td2.innerHTML = "<img src='http://openweathermap.org/img/w/" + data.daily[i].weather[0].icon + ".png' class='icon' alt='" + data.daily[i].weather[0].description + "'>";
        td3.innerHTML = rainPercent(data.daily[i].pop);
        td4.innerHTML = windDirection + " " + wind + " mph";
        td5.innerHTML = DOW + " " + date;
      // hi/lo
      // icon
      // rain/snow, etc.
      // % chance of rain
      // wind icon
      // wind direction
      // wind mph
      // drop down icon
        table.append(tr);
        tr.append(td5);
        tr.append(td2);
        tr.append(td1);
        tr.append(td3);
        tr.append(td4);
      }

      // alert
      if (typeof data.alerts != "undefined") {
        var alert = document.getElementById("alert");
        alert.classList = "bg-danger";
        var p = document.createElement("p");
        console.log(data.alerts);
        var start = data.alerts.start;
        var end = data.alerts.end;
        p.innerHTML = data.alerts + " from " + start + " to " + end;
        alert.append(p);
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
  var rain = pop * 100;
  var display = "&#128167; " + rain + "&percnt;";
  return display;
}

// get city and state from lat and lon
function getCityState(coord) {
  $.ajax({
    url: '/cityState',
    type: 'POST',
    dataType: 'json',
    data:coord,
    success: (data) => {
      var city = document.getElementById("city");
      city.textContent = data.city;
      var state = document.getElementById("state");
      state.textContent = data.principalSubdivision;
    },
    error: (error) => {
      console.log('There was an error');
      console.log(error);
    }
  });
}

// convert unix timestamp to hours and minutes
function getTime(unix) {
  const unixTimestamp = unix;
  const milliseconds = unixTimestamp * 1000;
  const dateObject = new Date(milliseconds);
  var hour = dateObject.getHours();
  var minutes = dateObject.getMinutes();
  hour = ((hour + 11) % 12 + 1);
  var time = hour + ":" + minutes;
  return time;
}

// get 48-hour weather display
function getHourly(hours) {
  console.log("here " + JSON.stringify(hours));
  // $.ajax({
  //   url: '/hourly?location=' + location,
  //   type: 'GET',
  //   dataType: 'json', 
  //   success: (data) => {
     // console.log(data);

      // // get city and state
      // getCityState(data.coord);

      // // get sunrise and sunset times
      // var sunrise = getTime(data.sys.sunrise);
      // var sunset = getTime(data.sys.sunset)
      
      // var aqi = getAQI(data.coord);
      // getForecast(data.coord);
      // getAirQuality(aqi); 

      // //from forecast

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
      // for (var i = 0; i < data.daily.length; i++) {
      //   var tr = document.createElement("tr");
      //   tr.style.borderBottom = "1px solid #c4e3ff";
      //   tr.style.padding = "5px 15px";
      //   var td1 = document.createElement("td");
      //   var td2 = document.createElement("td");
      //   var td3 = document.createElement("td");
      //   var td4 = document.createElement("td");
      //   var td5 = document.createElement("td");
      //   td1.style.width = "90px";
      //   td2.style.width = "90px";
      //   td3.style.width = "90px";
      //   td4.style.width = "115px";
      //   td5.style.width = "70px";
      //   var wind = Math.round(data.daily[i].wind_speed);
      //   var windDirection = getDirection(data.daily[i].wind_deg);

      //   // get date
      //   const unixTimestamp = data.daily[i].dt;
      //   const milliseconds = unixTimestamp * 1000;
      //   const dateObject = new Date(milliseconds);
      //   var DOW = dateObject.toLocaleString("default", { weekday: "short" })
      //   var date = dateObject.getDate();

      //   // fill td's
      //   td1.innerHTML = Math.round(data.daily[i].temp.max) + "&deg;/" + Math.round(data.daily[i].temp.min) + "&deg;";
      //   td2.innerHTML = "<img src='http://openweathermap.org/img/w/" + data.daily[i].weather[0].icon + ".png' class='icon' alt='" + data.daily[i].weather[0].description + "'>";
      //   td3.innerHTML = rainPercent(data.daily[i].pop);
      //   td4.innerHTML = windDirection + " " + wind + " mph";
      //   td5.innerHTML = DOW + " " + date;
      // // hi/lo
      // // icon
      // // rain/snow, etc.
      // // % chance of rain
      // // wind icon
      // // wind direction
      // // wind mph
      // // drop down icon
      //   table.append(tr);
      //   tr.append(td5);
      //   tr.append(td2);
      //   tr.append(td1);
      //   tr.append(td3);
      //   tr.append(td4);
  
    
    // }
 // });
      
}

// // add links to nav
// function addNav(hours, aqi) {
  
//   // add to nav
//   var nav = document.getElementById("links");
//   nav.innerHTML = "";
//   var li = document.createElement("li");
//   li.innerHTML = "<a href='#'>Now</a>";
//   var li2 = document.createElement("li");
//   li2.innerHTML = "<a href='/hourly' onclick='hourly(" + hours + ")'>Hourly</a>";
//   var li3 = document.createElement("li");
//   li3.innerHTML = "<a href='#'>Daily</a>";
//   var li4 = document.createElement("li");
//   li4.innerHTML = "<a href='/aqiDetails' onclick='aqiDetails(" + aqi + "')>AQ Index</a>";
//   li.style.padding = "0 10px";
//   nav.append(li);
//   nav.append(li2);
//   nav.append(li3);
//   nav.append(li4);
//   // style links
//   var links = document.getElementsByTagName("li");
//   for (var i = 0; i < links.length; i++) {
//     links[i].style.padding = "0 10px";
//     links[i].style.color = "#fff";
//   }
// }