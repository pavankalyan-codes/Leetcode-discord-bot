const axios = require("axios");
const constants = require("./constants.js");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
let url =
    "https://api.weatherapi.com/v1/current.json?key=" +
    process.env.weatherKey +
    "&q=";

function getInEmojis(text) {
    let nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    let result = "";
    for (let i = 0; i < text.length; i++) {
        if (nums.includes(text[i])) result += constants.numberMatch[text[i]] + " ";
        else result += text[i];
    }
    return result;
}

function getWeather(city) {
    return new Promise(function(resolve, reject) {
        axios
            .get(url + city + "&aqi=no")
            .then(function(response) {
                resolve(
                    `\nWeather Report :umbrella2:    \n` +
                    `:round_pushpin: : ` +
                    response.data.location.name +
                    ", " +
                    response.data.location.region +
                    `\n` +
                    `:map: :` +
                    response.data.location.country +
                    `\n` +
                    `Weather: ` +
                    getInEmojis(response.data.current.temp_c + "") +
                    `:regional_indicator_c: ` +
                    `\n` +
                    `Condition: **` +
                    response.data.current.condition.text +
                    `**`
                );
            })
            .catch(function(error) {
                resolve(
                    "\n:octagonal_sign: Could not find city :slight_frown: :octagonal_sign: "
                );
            });
    });
}

module.exports = { getWeather };