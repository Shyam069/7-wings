const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");

const serviceAccount = require(
    path.join(
        __dirname,
        "..",
        "serviceAccountKey.json"
    )
);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = {
    db
};