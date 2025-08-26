import admin from 'firebase-admin';

let db: any;

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'metria-fcbbc';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@metria-fcbbc.iam.gserviceaccount.com';
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY environment variable is required');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      }),
      databaseURL: `https://${projectId}.firebaseio.com`
    });
  }
  db = admin.firestore();
};

export { db };
export default admin;