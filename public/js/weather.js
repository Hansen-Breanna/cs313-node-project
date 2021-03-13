function weather() {
  var location = document.getElementById("location").value;
  $.ajax({
    url: '/weather?location='+location,
    type: 'GET',
    dataType: 'json', 
    success: (data) => {
      var time = new Date().toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
      var temp = Math.round(data.main.temp);
      var description = data.weather[0].main;
      var feelsLike = Math.round(data.main.feels_like);
      var wind = Math.round(data.wind.speed);
      var windDirection = getDirection(data.wind.deg);
      var gusts = Math.round(data.wind.gust);
      var icon = "<img src='http://openweathermap.org/img/w/" + data.weather[0].icon + ".png' alt='Weather Icon'>";

      newhtml = "<div id='currentData' class='w-75 mt-5'><h1>" + location + "</h1><p>As of " + time + "</p><p class='font-lg'>" + icon + temp + "&deg;</p>";
      newhtml += "<p>Feels like " + feelsLike + "&deg;</p><p class='font-md'>" + description + "</p><p>Wind " + windDirection + " ";
      newhtml += wind + " mph</p><p>Wind gusts " + gusts + " mph</p></div>";
      JSON.stringify(data);       
      $('#results').html(newhtml);
    }
  });
}

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