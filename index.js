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
var connectionString = "postgres://ifiibuckhdcfbq:75bb6b850d1098ff80f10bbfccc9fbc201ea8a584c88ebfdf7dc77fe4be0dcd5@ec2-54-161-239-198.compute-1.amazonaws.com:5432/d14qmu45c0uguh?ssl=true"; 
//process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.post('/aqi',(req,res) => {
  var lat = req.body.lat;
  var lon = req.body.lon;
  var aqiURL = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lon + "&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";
  axios.get(aqiURL)
      .then(response => { 
        var aqi = response.data.list[0].main;
        res.status(200).json(aqi)
      })
      .catch(error => {
        console.log('There was an error retrieving the AQI.');
        console.log(error);
      });
 })

app.post('/forecast',(req,res) => {
var lat = req.body.lat;
var lon = req.body.lon;
var forecastUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";

getUrlFromForecastDB(forecastUrl, function(error, result) {
  // if not in table, insert new data
  if (result[0] == null) {
    // get current date
    var dateObj = new Date();
    var date = getDate(dateObj);
    var time = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    // get data from API
    axios.get(forecastUrl)
    .then(response => {
      insertForecast(forecastUrl, date, time, response.data);
      res.status(200).json(response.data);
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
    // get time difference
    var difference = diffHour(currentTime, result[0].time);
    // Check if content more is from a different day
    if (date != resultDate) {
      // get data from API
      axios.get(forecastUrl)
      .then(response => {
        updateForecast(forecastUrl, date, currentTime, response.data);
        res.status(200).json(response.data);
      })
      .catch(error => {
        console.log('There was an error');
        console.log(error);
      });
    }
    // Check if content is more than 60 minutes old
    else if (difference >= 60) {
      // get data from API
      axios.get(forecastUrl)
      .then(response => {
        updateForecast(forecastUrl, date, currentTime, response.data);
        res.status(200).json(response.data);
      })
      .catch(error => {
        console.log('There was an error');
        console.log(error);
      });
    } else {
      res.status(200).json(JSON.parse(result[0].json));
    }
  }
});
})

app.post('/cityState',(req,res) => {
  var lat = req.body.lat;
  var lon = req.body.lon;
  var url = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lon + "&localityLanguage=en";
  axios.get(url)
    .then(response => { 
      var cityState = response.data;
      res.status(200).json(cityState)
    })
    .catch(error => {
      console.log('There was an error retrieving the forecast data.');
      console.log(error);
    });
})

app.post('/hourly', (req, res) => {
  var lat = req.body.lat;
  var lon = req.body.lon;
  var url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";
  getUrlFromForecastDB(url, function(error, result) {
    res.status(200).json(JSON.parse(result[0].json));
  })
})

app.get('/weather',(req,res) => {
  var location = req.query.location;
  var currentUrl = "https://api.openweathermap.org/data/2.5/weather?zip=" + location + "&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial";
  // Check db for URL
  getUrlFromCurrentDB(currentUrl, function(error, result) {
    // if not in table, insert new data
    if (result[0] == null) {
      // get current date
      var dateObj = new Date();
      var date = getDate(dateObj);
      var time = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      // get data from API
      axios.get(currentUrl)
      .then(response => {
        insertData(currentUrl, location, date, time, response.data);
        res.status(200).json(response.data);
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
      // get time difference
      var difference = diffMinutes(currentTime, result[0].time);
      // Check if content more is from a different day
      if (date != resultDate) {
        // get data from API
        axios.get(currentUrl)
        .then(response => {
          updateData(currentUrl, location, date, currentTime, response.data);
          res.status(200).json(response.data);
        })
        .catch(error => {
          console.log('There was an error');
          console.log(error);
        });
      }
      // Check if content is more than 10 minutes old
      else if (difference >= 10) {
        // get data from API
        axios.get(currentUrl)
        .then(response => {
          updateData(currentUrl, location, date, currentTime, response.data);
          res.status(200).json(response.data);
        })
        .catch(error => {
          console.log('There was an error');
          console.log(error);
        });
      } else {
        console.log(result[0].json);
        res.status(200).json(JSON.parse(result[0].json));
      }
    }
  });
  })

// See if current URL is in DB
function getUrlFromCurrentDB(url, callback) {
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

// See if current URL is in DB
function getUrlFromForecastDB(url, callback) {
  var sql = "SELECT url, date, time, json FROM forecast WHERE url = $1";
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

// Difference in hour
// https://www.w3resource.com/javascript-exercises/javascript-date-exercise-44.php
function diffHour(currentTime, resultDate) {
  var current = currentTime.split(':');
  var result = resultDate.split(':');
  var subtract = Math.abs(current[0] - result[0]);
  if (subtract > 1) {
    return 70;
  } else {
    var check = Math.abs(current[1] - result[1]);
    if (check > 59) {
      return 70;
    } else {
      return 10;
    }
  }
}

// Update current data by URL
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

// Update forecast data by URL
function updateForecast(url, date, time, data) {
  var sql = "UPDATE forecast SET url = $1, date = $2, time = $3, json = $4 WHERE url = $1";
  var params = [url, date, time, data];

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

function insertForecast(url, date, time, data) {
  var sql = "INSERT INTO forecast (url, date, time, json) VALUES ($1, $2, $3, $4)";
  var params = [url, date, time, data];

  pool.query(sql, params, function(err, result) {
    if (err) {
      console.log("An error with the DB occurred.");
      console.log(err);
    }
  }); 
}