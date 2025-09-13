import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {getFirestore,collection,getDocs} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-lite.js";
//firebaseのIDなどを宣言
const firebaseConfig = {
  apiKey: "AIzaSyAo6Teruh-6dPXACBAeJbH_lCmXzfTKt8M",
  authDomain: "itikuo-37042.firebaseapp.com",
  projectId: "itikuo-37042",
  storageBucket: "itikuo-37042.firebasestorage.app",
  messagingSenderId: "258262199926",
  appId: "1:258262199926:web:03304ca76fb8cc4585f957",
  measurementId: "G-6ZZXPQ2PE4"
};
//firebaseアプリの使用許可?と思ってる
const app=initializeApp(firebaseConfig);
const auth=getAuth(app);

const loginform=document.getElementById("loginform");
const emailText=document.getElementById("mailAddress");
const passwordText=document.getElementById("password");

loginform.addEventListener("submit",(e)=>{
    e.preventDefault();
    const email=emailText.value;
    const password=passwordText.value;
    createUserWithEmailAndPassword(auth,email,password)
    .then((userCredential)=>{
        const user=userCredential.user;
        console.log("ninsyou");
        console.log(user)
    }).catch((error)=>{
        const errorCode=error.code;
        const errorMessage=error.message;
    })
});
const db=getFirestore(app);
//collection/document/data 
async function getCities(db){
    const cities=collection(db,'cities');
    const citySnapshot=await getDocs(citiesCol);
    const cityList=citySnapshot.doncs.map(doc=>Socket.data());
    return cityList;
}