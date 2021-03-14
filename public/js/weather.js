function weather() {
  var location = document.getElementById("location").value;

  $.ajax({
    url: '/weather?location='+location,
    type: 'GET',
    dataType: 'json', 
    success: (data) => {
      console.log(data);
      var time = new Date().toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
      var temp = Math.round(data.main.temp);
      var description = data.weather[0].main;
      var feelsLike = Math.round(data.main.feels_like);
      var wind = Math.round(data.wind.speed);
      var windDirection = getDirection(data.wind.deg);
      var gusts = Math.round(data.wind.gust);
      var icon = "<img src='http://openweathermap.org/img/w/" + data.weather[0].icon + ".png' class='icon' alt='Weather Icon'>";

      newhtml = '<div class="d-flex flex-column"><div class="search p-2 rounded">';
      newhtml += '<input type="text" class="rounded p-2 form-control" id="location" name="location" placeholder="Search by City">';
      newhtml += '<button type="button" class="btn btn-small bg-yellow col-12 mt-2" onclick="weather()">Search</button></div>"';
      newhtml += "<div id='currentData' class='col-12 col-md-6 mt-5 font-md text-left pl-5 py-3'><h2>" + location + "</h2>";
      newhtml += "<p class='mb-0'>As of " + time + "</p><p class='font-xlg mb-0'>" + icon + temp + "&deg;</p>";
      newhtml += "<p class='mb-0'>Feels like " + feelsLike + "&deg;</p><p class='font-lg mb-0'>" + description + "</p>";
      newhtml += "<p>Wind " + windDirection + " " + wind + " mph</p><p class='mb-0'>Wind gusts " + gusts + " mph</p></div></div>";
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