const axios = require("axios");

let url = "https://meme-api.herokuapp.com/gimme";

function getMeme() {
  return new Promise(function (resolve, reject) {
    axios
      .get(url)
      .then(function (response) {
        let preview = response.data.preview;
        resolve(preview[preview.length - 1]);
      })
      .catch(function (error) {
        resolve("Unknown error occured!");
      });
  });
}
module.exports = { getMeme };
