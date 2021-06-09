const { Client, MessageAttachment } = require("discord.js");

// Create an instance of a Discord client
const client = new Client();
const axios = require("axios");
const joke = require("./joke.js");
const meme = require("./meme.js");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var firebase = require("firebase");
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId,
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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
  return new Promise(function (resolve, reject) {
    database.ref().once("value", function (snapshot) {
      if (snapshot.hasChild(name)) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

async function getSubmission(name) {
  return new Promise(function (resolve, reject) {
    axios
      .post("https://leetcode.com/graphql", getQuery(name), {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        let dateKey = (
          new Date(new Date().toISOString().slice(0, 10) + " 05:30:00") / 1000
        ).toFixed(0);
        let submissionsObj = JSON.parse(
          res.data.data.matchedUser.submissionCalendar
        );
        if (dateKey in submissionsObj) {
          resolve(submissionsObj[dateKey]);
        } else {
          resolve(0);
        }
      })
      .catch((error) => {
        console.log(error);
        return resolve("could not fetch user");
      });
  });
}

async function getNames() {
  return new Promise(function (resolve, reject) {
    profiles = [];
    database.ref().once(
      "value",
      (snapshot) => {
        let data = snapshot.val();
        Object.keys(data).forEach((key) => {
          profiles.push(key);
        });

        resolve(profiles);
      },
      (errorObject) => {
        resolve("error occured");
      }
    );
  });
}

function getQuery(name) {
  return {
    operationName: "getUserProfile",
    variables: {
      username: name,
    },
    query:
      "query getUserProfile($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n    __typename\n  }\n  matchedUser(username: $username) {\n    username\n    socialAccounts\n    githubUrl\n    contributions {\n      points\n      questionCount\n      testcaseCount\n      __typename\n    }\n    profile {\n      realName\n      websites\n      countryName\n      skillTags\n      company\n      school\n      starRating\n      aboutMe\n      userAvatar\n      reputation\n      ranking\n      __typename\n    }\n    submissionCalendar\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n        __typename\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n        __typename\n      }\n      __typename\n    }\n    badges {\n      id\n      displayName\n      icon\n      creationDate\n      __typename\n    }\n    upcomingBadges {\n      name\n      icon\n      __typename\n    }\n    activeBadge {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n",
  };
}

async function getCount(name) {
  return new Promise(function (resolve, reject) {
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

client.on("message", async function (message) {
  if (message.author.bot) return;

  let msg = message.content.toLowerCase();
  let command = msg.split(" ")[0];
  let subCommand = msg.split(" ")[1];
  let data = msg.split(" ")[2];
  if (command === "/chitti") {
    if (subCommand) {
      if (subCommand === "count") {
        if (!data) return;

        let solvedCount = await getCount(data);
        message.reply(solvedCount);
      }
      if (subCommand === "joke") {
        let random_joke = await joke.getJoke();
        message.reply(random_joke);
      }
      if (subCommand === "meme") {
        let random_meme = await meme.getMeme();
        const attachment = new MessageAttachment(random_meme);
        message.channel.send(attachment);
      }

      if (subCommand === "remove") {
        if (message.author.id === process.env.modToken) {
          if (!data) return;
          else {
            database.ref(data).remove();
            message.reply(
              "Removed user " + data + " Successfully! :police_officer:"
            );
          }
        } else {
          message.reply("Only moderators can remove :toolbox: ");
        }
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
            database.ref(data).set({ status: 1 }, function (error) {
              if (error) {
                // The write failed...
                message.reply("Could not add Uer!");
              } else {
                // The write was successful...
                message.reply("User Added successfully!");
              }
            });
          }
        }
      }
      if (subCommand === "list") {
        let profiles = await getNames();
        let list = "";
        for (let profile of profiles) {
          list += "\n" + profile;
        }
        message.reply(list);
      }
      if (subCommand === "submissions" || subCommand === "sm") {
        if (!data) {
          let profiles = await getNames();
          let lb = "";
          let submissionList = [];
          var promises = [];
          for (profile of profiles) {
            promises.push(getSubmission(profile));
          }
          let index = 0;
          Promise.all(promises)
            .then(function (data) {
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
                  (numberToEmoji(rank) +
                    "  " +
                    submissionList[i].profile +
                    " :right_facing_fist: " +
                    submissionList[i].subCount);
                last = submissionList[i].subCount;
              }
              message.reply(lb);
            })
            .catch(function (err) {});
        } else {
          let count = await getSubmission(data);
          message.reply(count);
        }
      }
      if (subCommand === "leaderboard" || subCommand === "lb") {
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
