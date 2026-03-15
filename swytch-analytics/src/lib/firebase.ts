// TODO: Install firebase — npm install firebase
// import { initializeApp, getApps } from "firebase/app";
// import { getAuth } from "firebase/auth";

/**
 * Firebase configuration.
 * These values come from your Firebase Console project settings.
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// TODO: Uncomment when firebase is installed
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// export const auth = getAuth(app);
// export default app;

export { firebaseConfig };
