const axios = require("axios");

async function getSubmission(name) {
    return new Promise(function(resolve, reject) {
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

function getQuery(name) {
    return {
        operationName: "getUserProfile",
        variables: {
            username: name,
        },
        query: "query getUserProfile($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n    __typename\n  }\n  matchedUser(username: $username) {\n    username\n    socialAccounts\n    githubUrl\n    contributions {\n      points\n      questionCount\n      testcaseCount\n      __typename\n    }\n    profile {\n      realName\n      websites\n      countryName\n      skillTags\n      company\n      school\n      starRating\n      aboutMe\n      userAvatar\n      reputation\n      ranking\n      __typename\n    }\n    submissionCalendar\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n        __typename\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n        __typename\n      }\n      __typename\n    }\n    badges {\n      id\n      displayName\n      icon\n      creationDate\n      __typename\n    }\n    upcomingBadges {\n      name\n      icon\n      __typename\n    }\n    activeBadge {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n",
    };
}

module.exports = { getSubmission, getCount, getQuery };