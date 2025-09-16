import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,onAuthStateChanged,deleteUser} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,collection,getDocs,doc,addDoc,onSnapshot,query,orderBy} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAo6Teruh-6dPXACBAeJbH_lCmXzfTKt8M",
  authDomain: "itikuo-37042.firebaseapp.com",
  projectId: "itikuo-37042",
  storageBucket: "itikuo-37042.firebasestorage.app",
  messagingSenderId: "258262199926",
  appId: "1:258262199926:web:03304ca76fb8cc4585f957",
  measurementId: "G-6ZZXPQ2PE4"
};

const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);

let roomId="";
let messageRef=null;

document.getElementById("")