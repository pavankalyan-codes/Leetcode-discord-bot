const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();
var lineReader = require("line-reader");
const axios = require("axios");
require("dotenv").config();

const numberMatch = [
    "0️⃣",
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
];

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

async function userExist(name) {
    return new Promise(function(resolve, reject) {
        // after some calculation
        fs.readFile("data.txt", "utf-8", (err, file) => {
            const lines = file.split("\n");
            for (let line of lines) {
                if (line === name) resolve(true);
            }
            resolve(false);
        });
    });
}

async function getNames() {
    return new Promise(function(resolve, reject) {
        // after some calculation
        list = [];
        fs.readFile("data.txt", "utf-8", (err, file) => {
            const lines = file.split("\n");
            for (let line of lines) {
                if (line != "") list.push(line);
            }
            resolve(list);
        });
    });
}

function getQuery(name) {
    return {
        operationName: "getUserProfile",
        variables: {
            username: name,
        },
        query: "query getUserProfile($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n    __typename\n  }\n  matchedUser(username: $username) {\n    username\n    socialAccounts\n    githubUrl\n    contributions {\n      points\n      questionCount\n      testcaseCount\n      __typename\n    }\n    profile {\n      realName\n      websites\n      countryName\n      skillTags\n      company\n      school\n      starRating\n      aboutMe\n      userAvatar\n      reputation\n      ranking\n      __typename\n    }\n    submissionCalendar\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n        __typename\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n        __typename\n      }\n      __typename\n    }\n    badges {\n      id\n      displayName\n      icon\n      creationDate\n      __typename\n    }\n    upcomingBadges {\n      name\n      icon\n      __typename\n    }\n    activeBadge {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n",
    };
}

async function getCount(name) {
    return new Promise(function(resolve, reject) {
        axios
            .post("https://leetcode.com/graphql", getQuery(name), {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((res) => {
                resolve(res.data.data.matchedUser.submitStats.acSubmissionNum[0].count);
            })
            .catch((error) => {
                return resolve("could not fetch user");
            });
    });
}

function isValidUser(text) {
    return text !== "could not fetch user";
}

client.on("message", async function(message) {
    if (message.author.bot) return;

    let msg = message.content.toLowerCase();
    let command = msg.split(" ")[0];
    let subCommand = msg.split(" ")[1];
    let data = msg.split(" ")[2];
    if (command === "$chitti") {
        if (subCommand) {
            if (subCommand === "count") {
                if (!data) return;

                let solvedCount = await getCount(data);
                message.reply(solvedCount);
            }
            if (subCommand === "add") {
                if (!data) return;
                let count = await getCount(data);
                if (!isValidUser(count)) {
                    message.reply(
                        "Could not fetch profile for this user :arrow_right: " +
                        data +
                        " :frowning2:"
                    );
                    return;
                } else {
                    let exist = await userExist(data);

                    if (exist) {
                        message.reply("User already exist!");
                    } else {
                        fs.appendFile("data.txt", data + "\n", function(err) {
                            if (err) throw err;
                            message.reply("User Added successfully!");
                        });
                    }
                }
            }
            if (subCommand === "list") {
                fs.readFile("data.txt", "utf-8", (err, file) => {
                    const lines = file.split("\n");
                    let name = "\n";
                    for (let line of lines) {
                        if (line !== "") name += line + "\n";
                    }
                    message.reply(name);
                });
            }
            if (subCommand === "leaderboard") {
                let profiles = await getNames();
                let lb = "";
                let nameCountList = [];
                for (profile of profiles) {
                    let currCount = await getCount(profile);
                    nameCountList.push({ currCount, profile });
                }
                nameCountList.sort((a, b) => {
                    return b.currCount - a.currCount;
                });
                let rank = 1;
                let last = null;
                for (let i = 0; i < nameCountList.length; i++) {
                    if (last != null && last != nameCountList[i].currCount) rank++;
                    lb =
                        lb +
                        "\n" +
                        (numberToEmoji(rank) +
                            "  " +
                            nameCountList[i].profile +
                            " :right_facing_fist: " +
                            nameCountList[i].currCount);
                    last = nameCountList[i].currCount;
                }
                message.reply(lb);
            }
        }
    } else return;
});

client.login(process.env.TOKEN);