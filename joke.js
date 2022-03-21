const axios = require("axios");

let url = "https://official-joke-api.appspot.com/random_joke";

function getJoke() {
    return new Promise(function(resolve, reject) {
        axios
            .get(url)
            .then(function(response) {
                resolve(
                    " Here is your joke \n" +
                    response.data.setup +
                    "\n" +
                    response.data.punchline
                );
            })
            .catch(function(error) {
                resolve("Unknown error occured!");
            });
    });
}

module.exports = { getJoke };