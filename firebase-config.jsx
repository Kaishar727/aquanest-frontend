import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//GetAuth Method is used to Configure our app to use Firebase Authentication
import { getAuth, setPersistence, browserLocalPersistence} from "firebase/auth";

const apiKey = import.meta.env.VITE_API_KEY
const authDomain = import.meta.env.VITE_AUTH_DOMAIN
const projectId = import.meta.env.VITE_PROJECT_ID
const storageBucket = import.meta.env.VITE_STORAGE_BUCKET
const messagingSenderId = import.meta.env.VITE_MESSENGER_ID
const appId = import.meta.env.VITE_APP_ID

const firebaseConfig = {
  apiKey: `${apiKey}`,
  authDomain: `${authDomain}`,
  projectId: `${projectId}`,
  storageBucket: `${storageBucket}`,
  messagingSenderId: `${messagingSenderId}`,
  appId: `${appId}`
};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });
// Export the services you'll need

