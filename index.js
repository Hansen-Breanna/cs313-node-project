require('dotenv').config()
const https = require('https');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 4000
const app = express()
app.use(express.urlencoded({
  extended: true}))

// connect to database
const { Pool } = require("pg");
var connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.get('/getWeather', getWeather)
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

async function getWeather(req, res) {
  var location = req.query.location;
  var current = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";
  var params = {location: location};
  console.log("Retrieving location with id: ", location);

  https.get(current, (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      var weatherData = JSON.parse(data);
      console.log(weatherData);
      // get lat and lon
      var lon = weatherData['coord']['lon'];
      var lat = weatherData['coord']['lat'];

      // get url for forecasted weather
  	  var forecast = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";
      // get url for forecasted weather
      var aqi = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lon + "&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";
      var testUrl = "url.com";
      // check for existing URL in database
      var checkUrl = getUrlFromDB(aqi, function(error, result) {
        console.log("Back from DB with result: ", result);
        if (result[0] == null) {
          console.log("came back null");
          getData(aqi, location);
          getData(forecast, location);
        }
        //res.json(result);
      });
      // var weatherMain = weatherData['weather'][0]['main'];
      // var description = weatherData['weather'][0]['description'];
      // var icon = weatherData['weather'][0]['icon'];
      // var temp = Math.round(weatherData['main']['temp']);
      // var feelsLike = Math.round(weatherData['main']['feels_like']);
      // var humidity = weatherData['main']['humidity'];
      // var windSpeed = Math.round(weatherData['wind']['speed'])
      // var sunrise = new Date(weatherData['sys']['sunrise'] * 1000);
      // var sunset = new Date(weatherData['sys']['sunset'] * 1000);
      // var windDirection = weatherData['wind']['deg'];
      // var params = {location: location, lon: lon, lat: lat, weatherMain: weatherMain, description: description,
      //   icon: icon, temp: temp, feelsLike: feelsLike, humidity: humidity, windSpeed: windSpeed, sunrise: sunrise,
      //   sunset: sunset, windDirection: windDirection};
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
    
 
  // getLocationData(location, function(error, result) {
  //   if (error || result == null) {
  //     res.status(500).json({success:false, data:error});
  //   } else {
  //     console.log("Back from the getPersonFromDB function with results:", result);
  //     res.render('pages/location.ejs', params);
  //   }
  // })  
}

// See if URL is in DB
function getUrlFromDB(url, callback) {
  console.log("Get URL from DB called with URL: ", url);
  var sql = "SELECT url FROM cache WHERE url = $1";
  var params = [url];

  pool.query(sql, params, function(err, result) {
    if (err) {
      console.log("An error with the DB occurred.");
      console.log(err);
      callback(err, null);
    }
    console.log("Found DB results: " + JSON.stringify(result.rows));
    callback(null, result.rows);
  }); 
}

// Get data from aqi and forecast api
function getData(url, location) {
  console.log("insert: " + url);
  
  https.get(url, (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      var locationData = JSON.parse(data);
      var time = new Date().toLocaleTimeString();
      insertData(url, location, time, locationData);


      // check for existing URL in database
      // // var checkUrl = getUrlFromDB(aqi, function(error, result) {
      // //   console.log("Back from DB with result: ", result);
      // //   if (result[0] == null) {
      // //     console.log("came back null");
      // //     getData(aqi);
      // //     inputData(aqi);
      // //   }
      // // });

      // var params = {location: location, lon: lon, lat: lat, weatherMain: weatherMain, description: description,
      //   icon: icon, temp: temp, feelsLike: feelsLike, humidity: humidity, windSpeed: windSpeed, sunrise: sunrise,
      //   sunset: sunset, windDirection: windDirection};
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

function insertData(url, location, time, data, callback) {
  console.log("Insert url, time, data");
  var sql = "INSERT INTO cache (url, location, time, json) VALUES ($1, $2, $3, $4)";
  var params = [url, location, time, data];

  pool.query(sql, params, function(err, result) {
    if (err) {
      console.log("An error with the DB occurred.");
      console.log(err);
      callback(err, null);
    }
    // console.log("Found DB results: " + JSON.stringify(result.rows));
    // callback(null, result.rows);
  }); 
}
// function getLocationData(location, callback) {
//   console.log("Made it to getLocationData function: ", location);
//   callback(null, location);
// }