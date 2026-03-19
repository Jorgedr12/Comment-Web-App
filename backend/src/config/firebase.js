import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
    serviceAccount = require('../../serviceAccountKey.json');
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
export default db; 