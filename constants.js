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

const botCommands = `
**Currently Chitti can understand the below commands.**
> **\`/chitti add <your-leetcode-profile-name>\`**
        :point_right: Adds profile name into chitti's DB :brain:
> **\`/chitti leaderboard (or) lb (shorthand)\`**
        :point_right:  Displays the list of users in sorted order of total sovled Leetcode problems :person_fencing: 
> **\`/chitti remove <leetcode-profile-name> (only for moderators)\`**
        :point_right: Removes the user :no_pedestrians: 
> **\`/chitti list\`**
        :point_right: Lists all the users chitti currently storing :page_with_curl: 
> **\`/chitti submisssions (or) sm (shorthand)\`**
        :point_right: Displays today's leetcode submissions by all the users :green_circle: 
> **\`/chitti count <your-leetcode-profile-name>\`**
        :point_right: Displays count of total problems solved by particular user :man_lifting_weights:
> **\`/chitti joke\`**
        :point_right: Sends some random joke from the internet :poop:
> **\`/chitti meme\`**
        :point_right: Sends some random meme from the internet :beginner: 
> **\`/chitti weather (or) w <city-name>\`**
        :point_right: Sends the current weather information for the given city :thunder_cloud_rain: `;
module.exports = { numberMatch, botCommands };