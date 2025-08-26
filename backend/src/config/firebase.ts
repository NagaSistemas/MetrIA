import admin from 'firebase-admin';

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    const serviceAccount = require('../../metria-fcbbc-firebase-adminsdk-fbsvc-4cc85edb37.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://metria-fcbbc.firebaseio.com'
    });
  }
};

export const db = admin.firestore();
export default admin;