require('dotenv').config()
const express = require('express')
const path = require('path')
const axios = require('axios')
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
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.get('/weather',(req,res) => {
  var location = req.query.location;
  var currentUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";
  // Check db for URL
  getUrlFromDB(currentUrl, function(error, result) {
    // if not in table, insert new data
    if (result[0] == null) {
      // get current date
      var dateObj = new Date();
      var date = getDate(dateObj);
      var time = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      axios.get(currentUrl)
      .then(response => {
        insertData(currentUrl, location, date, time, response.data);
        res.status(200).json(response.data)
      })
      .catch(error => {
        console.log('There was an error');
        console.log(error);
      });
    } else {
      // get current date
      var dateObj = new Date();
      var date = getDate(dateObj);
      // get result date
      var resultDate = getDate(result[0].date);
      // get current time
      var currentTime = getTime(dateObj);
      // Check if content more is from a different day
      if (date > resultDate) {
        updateData(currentUrl, location, date, currentTime, result[0].json);
      }
      // Check if content is more than 10 minutes old
      var difference = diffMinutes(currentTime, result[0].time);
      if (difference >= 10) {
        updateData(currentUrl, location, date, currentTime, result[0].json);
      }
      res.status(200).json(JSON.parse(result[0].json));
    }
  });
  })

// See if URL is in DB
function getUrlFromDB(url, callback) {
  var sql = "SELECT url, location, date, time, json FROM current WHERE url = $1";
  var params = [url];

  pool.query(sql, params, function(err, result) {
    if (err) {
      console.log("An error with the DB occurred.");
      console.log(err);
      callback(err, null);
    }
    // Send back result
    callback(null, result.rows);
  }); 
}

// Insert data into Current table
function insertData(url, location, date, time, data) {
  var sql = "INSERT INTO current (url, location, date, time, json) VALUES ($1, $2, $3, $4, $5)";
  var params = [url, location, date, time, data];

  pool.query(sql, params, function(err, result) {
    if (err) {
      console.log("An error with the DB occurred.");
      console.log(err);
    }
  }); 
}

// Difference in minutes
// https://www.w3resource.com/javascript-exercises/javascript-date-exercise-44.php
function diffMinutes(currentTime, resultDate) {
  var current = currentTime.split(':');
  var result = resultDate.split(':');
  if (current[0] != result[0]) {
    return 60;
  } else {
    var diff = (current[1] - result[1]);
    return Math.abs(Math.round(diff));
  }
}

// Update data by URL
function updateData(url, location, date, time, data) {
  var sql = "UPDATE current SET url = $1, location = $2, date = $3, time = $4, json = $5 WHERE url = $1";
  var params = [url, location, date, time, data];

  pool.query(sql, params, function(err, result) {
    if (err) {
      console.log("An error with the DB occurred.");
      console.log(err);
    }
  }); 
}

function getDate(dateObj) {
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  var date = year + "-" + month + "-" + day;
  return date;
}

function getTime(dateObj) {
  var seconds = dateObj.getSeconds();
  var minutes = dateObj.getMinutes();
  var hour = dateObj.getHours();
  var currentTime = hour + ":" + minutes + ":" + seconds;
  return currentTime;
}

// Code options for forecasted weather and aqi
// async function getWeather(req, res) {
//   var location = req.query.location;
//   var current = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";
//   var params = {location: location};
//   console.log("Retrieving location with id: ", location);

//   https.get(current, (resp) => {
//     let data = '';
//     console.log(current);

//     // A chunk of data has been received.
//     resp.on('data', (chunk) => {
//       data += chunk;
//     });

//     // The whole response has been received. Print out the result.
//     resp.on('end', () => {
//       var weatherData = JSON.parse(data);
//       console.log(weatherData);
//       // get lat and lon
//       var lon = weatherData['coord']['lon'];
//       var lat = weatherData['coord']['lat'];

//       // get url for forecasted weather
//   	  var forecast = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";
//       // get url for forecasted weather
//       var aqi = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lon + "&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";
//       var testUrl = "url.com";
//       // check for existing URL in database
//       var checkUrl = getUrlFromDB(aqi, function(error, result) {
//         console.log("Back from DB with result: ", result);
//         if (result[0] == null) {
//           console.log("came back null");
//           getData(aqi, location);
//           getData(forecast, location);
//         }
//         //res.json(result);
//       });
//     });

//   }).on("error", (err) => {
//     console.log("Error: " + err.message);
//   });
     
// }