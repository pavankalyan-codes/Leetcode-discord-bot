const { Client, MessageAttachment } = require("discord.js");

const client = new Client();
const joke = require("./joke.js");
const meme = require("./meme.js");
const weather = require("./weather.js");
const constants = require("./constants.js");
const leetcode = require("./leetcode.js");
const utility = require("./utilities.js");
const firebaseService = require("./firebaseService.js");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

client.on("message", async function(message) {
    if (message.author.bot) return;

    let msg = message.content.toLowerCase().split(" ");
    let command = msg[0];
    let subCommand = msg[1];
    let data = msg[2];
    if (command === "/chitti") {
        if (subCommand) {
            if (subCommand === "count") {
                if (!data) {
                    message.reply(constants.botCommands);
                    return;
                }

                let solvedCount = await leetcode.getCount(data);
                message.reply(solvedCount);
            } else if (subCommand === "joke") {
                let random_joke = await joke.getJoke();
                message.reply(random_joke);
            } else if (subCommand === "w" || subCommand === "weather") {
                if (!data) {
                    message.reply(constants.botCommands);
                    return;
                } else {
                    let weatherData = await weather.getWeather(data);
                    if (weatherData) {
                        message.reply(weatherData);
                    } else {
                        message.reply("Oops.. City not found!!! :(");
                    }
                }
            } else if (subCommand === "meme") {
                let random_meme = await meme.getMeme();
                const attachment = new MessageAttachment(random_meme);
                message.channel.send(attachment);
            } else if (subCommand === "remove") {
                if (message.author.id === process.env.modToken) {
                    if (!data) return;
                    else {
                        firebaseService.database.ref(data).remove();
                        message.reply(
                            "Removed user " + data + " Successfully! :police_officer:"
                        );
                    }
                } else {
                    message.reply("Only moderators can remove :toolbox: ");
                }
            } else if (subCommand === "add") {
                if (!data) {
                    message.reply(constants.botCommands);
                    return;
                }
                let count = await leetcode.getCount(data);
                if (!utility.isValidUser(count)) {
                    message.reply(
                        "Could not fetch profile for this user :arrow_right: " +
                        data +
                        " :frowning2:"
                    );
                    return;
                } else {
                    let exist = await firebaseService.userExist(data);

                    if (exist) {
                        message.reply("User already exist!");
                    } else {
                        firebaseService.database
                            .ref(data)
                            .set({ status: 1 }, function(error) {
                                if (error) {
                                    message.reply("Could not add Uer!");
                                } else {
                                    message.reply("User Added successfully!");
                                }
                            });
                    }
                }
            } else if (subCommand === "list") {
                let profiles = await firebaseService.getNames();
                let list = "";
                for (let profile of profiles) {
                    list += "\n" + profile;
                }
                message.reply(list);
            } else if (subCommand === "submissions" || subCommand === "sm") {
                if (!data) {
                    let profiles = await firebaseService.getNames();
                    let lb = "";
                    let submissionList = [];
                    var promises = [];
                    for (profile of profiles) {
                        promises.push(leetcode.getSubmission(profile));
                    }
                    let index = 0;
                    Promise.all(promises)
                        .then(function(data) {
                            for (let i = 0; i < data.length; i++) {
                                submissionList.push({
                                    subCount: data[i],
                                    profile: profiles[i],
                                });
                            }
                            submissionList.sort((a, b) => {
                                return b.subCount - a.subCount;
                            });
                            let rank = 1;
                            let last = null;
                            for (let i = 0; i < submissionList.length; i++) {
                                if (last != null && last != submissionList[i].subCount) rank++;
                                lb =
                                    lb +
                                    "\n" +
                                    (utility.numberToEmoji(rank) +
                                        "  " +
                                        submissionList[i].profile +
                                        " :right_facing_fist: " +
                                        submissionList[i].subCount);
                                last = submissionList[i].subCount;
                            }
                            message.reply(lb);
                        })
                        .catch(function(err) {});
                } else {
                    let count = await leetcode.getSubmission(data);
                    message.reply(count);
                }
            } else if (subCommand === "leaderboard" || subCommand === "lb") {
                let profiles = await firebaseService.getNames();
                let lb = "";
                let nameCountList = [];
                for (profile of profiles) {
                    let currCount = await leetcode.getCount(profile);
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
                        (utility.numberToEmoji(rank) +
                            "  " +
                            nameCountList[i].profile +
                            " :right_facing_fist: " +
                            nameCountList[i].currCount);
                    last = nameCountList[i].currCount;
                }
                message.reply(lb);
            } else {
                message.reply(constants.botCommands);
            }
        } else {
            message.reply(constants.botCommands);
        }
    } else return;
});

client.login(process.env.TOKEN);