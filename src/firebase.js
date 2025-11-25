
import { initializeApp } from "firebase/app";
import { getFirestore,connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth,connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmlvELaeBCn1m4AuZh-L7vO33B_xvtpTU",
  authDomain: "projectfinal-eb377.firebaseapp.com",
  databaseURL: "https://projectfinal-eb377-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "projectfinal-eb377",
  storageBucket: "projectfinal-eb377.appspot.com",
  messagingSenderId: "1068875487481",
  appId: "1:1068875487481:web:560bc0571688eb8ae4ea28",
  measurementId: "G-SQNBMD58DH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

//connectAuthEmulator(auth,'https://127.0.0.1:9099')
const db = getFirestore(app);
//connectFirestoreEmulator(db,'127.0.0.1',8080)

export{
    db,
    auth
}