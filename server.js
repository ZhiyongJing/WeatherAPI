// Require node_modules

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const routes = express.Router();
const cors = require('cors');
const port = 3000;
const util = require('util')

app.use(cors());
app.use(bodyParser.json());



// Configuration option to provide the key as an environment variable
require('dotenv').config();
const apiKey = `${process.env.API_KEY}`;

app.use(bodyParser.urlencoded({ extended: true }));

const cache = new Map();


// Root path to show default info
routes.route('/').get(function (req, res) {
    res.json(null);
});

routes.route('/:city').get(function (req, res) {
    let city = req.params.city.toUpperCase(),
        timeStamp = Date.parse(new Date());

    if (cache.has(city) && timeStamp - 600000 < cache.get(city).timeStamp) {
        console.log("From cache")
        res.json(cache.get(city).weather);
    } else {

        let url = `http://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&units=metric&cnt=7&lang=en&appid=${apiKey}`;

        request.get(url, function (err, response, body) {
            if (err || response.statusCode != 200) {
                return null
            } else {
                let data = JSON.parse(body);

                console.log("From API");
                const timeStamp = Date.parse(new Date());
                cache.set(data.city.name.toUpperCase(), { "timeStamp": timeStamp, "weather": body });
                res.json(cache.get(city).weather);
            }
        })
    }
})

// Get the current weather and 7-day forecast of a city or zipcode
routes.route('/').post(function (req, res) {
    let cityList = req.body;
    console.log(cityList);
    cityList.forEach(getWeather);
})

app.use("", routes);
app.listen(port, function () {
    console.log("Weather app listening on port: " + port);
});
