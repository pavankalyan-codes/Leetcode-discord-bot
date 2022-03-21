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

async function userExist(name) {
    return new Promise(function(resolve, reject) {
        database.ref().once("value", function(snapshot) {
            if (snapshot.hasChild(name)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

async function getNames() {
    return new Promise(function(resolve, reject) {
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

module.exports = { getNames, userExist };