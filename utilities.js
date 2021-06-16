const constants = require("./constants.js");

const numberMatch = constants.numberMatch;

function numberToEmoji(number) {
    let emoji = "";
    let digit;
    while (number > 0) {
        digit = number % 10;
        emoji = numberMatch[digit] + emoji;
        number = Math.floor(number / 10);
    }
    return emoji;
}

function isValidUser(text) {
    return text !== "could not fetch user";
}

module.exports = { numberToEmoji, isValidUser };