import admin from 'firebase-admin';

let db: any;

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'metria-fcbbc',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@metria-fcbbc.iam.gserviceaccount.com',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
      }),
      databaseURL: 'https://metria-fcbbc.firebaseio.com'
    });
  }
  db = admin.firestore();
};

export { db };
export default admin;