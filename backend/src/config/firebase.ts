import admin from 'firebase-admin';

let db: any;

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    const serviceAccount = require('../../metria-fcbbc-firebase-adminsdk-fbsvc-4cc85edb37.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://metria-fcbbc.firebaseio.com'
    });
  }
  db = admin.firestore();
};

export { db };
export default admin;