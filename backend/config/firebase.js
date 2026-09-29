const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
const fs = require("fs");

// Local PC: backend/serviceAccountKey.json
// Render: /etc/secrets/serviceAccountKey.json
const localKeyPath = path.join(
    __dirname,
    "..",
    "serviceAccountKey.json"
);

const renderKeyPath = "/etc/secrets/serviceAccountKey.json";

const serviceAccountPath = fs.existsSync(renderKeyPath)
    ? renderKeyPath
    : localKeyPath;

const serviceAccount = require(serviceAccountPath);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = {
    db
};