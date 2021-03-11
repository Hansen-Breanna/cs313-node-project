require('dotenv').config()
const https = require('https');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 4000
const app = express()
app.use(express.urlencoded({
  extended: true}))

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.get('/getWeather', getWeather)
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

async function getWeather(req, res) {
  var location = req.query.location;
  var params = {location: location};
  console.log("Retrieving location with id: ", location);

  https.get('https://api.openweathermap.org/data/2.5/weather?q='
  +location+'&appid=2e2fced7cda96a0e12f634c9f98ccd19&units=imperial', (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(JSON.parse(data));
      var weatherData = JSON.parse(data);
      var lon = weatherData['coord']['lon'];
      var lat = weatherData['coord']['lat'];
      var weatherMain = weatherData['weather'][0]['main'];
      var description = weatherData['weather'][0]['description'];
      var icon = weatherData['weather'][0]['icon'];
      var temp = Math.round(weatherData['main']['temp']);
      var feelsLike = Math.round(weatherData['main']['feels_like']);
      var humidity = weatherData['main']['humidity'];
      var windSpeed = Math.round(weatherData['wind']['speed'])
      var sunrise = new Date(weatherData['sys']['sunrise'] * 1000);
      var sunset = new Date(weatherData['sys']['sunset'] * 1000);
      var windDirection = weatherData['wind']['deg'];
      var params = {location: location, lon: lon, lat: lat, weatherMain: weatherMain, description: description,
        icon: icon, temp: temp, feelsLike: feelsLike, humidity: humidity, windSpeed: windSpeed, sunrise: sunrise,
        sunset: sunset, windDirection: windDirection};
    
      res.render('pages/index.ejs', params);
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
    
 
  getLocationData(location, function(error, result) {
    if (error || result == null) {
      res.status(500).json({success:false, data:error});
    } else {
      console.log("Back from the getPersonFromDB function with results:", result);
      res.render('pages/location.ejs', params);
    }
  })  
}

function doRequest(options) {
  return new Promise ((resolve, reject) => {
    let req = http.request(options);

    req.on('response', res => {
      resolve(res);
    });

    req.on('error', err => {
      reject(err);
    });
  }); 
}

function getLocationData(location, callback) {
  console.log("Made it to getLocationData function: ", location);
  callback(null, location);
}