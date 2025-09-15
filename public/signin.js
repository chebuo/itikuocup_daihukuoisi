import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,onAuthStateChanged,deleteUser} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
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

const emailText=document.getElementById("mailAddress");
const passwordText=document.getElementById("password");
const signinform=document.getElementById("signinForm");

signinform.addEventListener("submit",(e)=>{
    e.preventDefault();
    const email=emailText.value;
    const password=passwordText.value;
    console.log(email);
    console.log(password);
    signInWithEmailAndPassword(auth,email,password)
    .then((userCredential)=>{
        const user =userCredential.user;
        console.log("signin");
        console.log(user);
        if(auth.currentUser.emailVerified){
            window.location.href="index.html";
        }else{
            alert("メールアドレスの認証が完了していません。もう一度登録しなおしてください。");
            deleteUser(user);
            window.location.href="auth.html";
        }
    }).catch((error)=>{
        const errorCode=error.code;
        const errorMessage=error.message;
        console.log(errorCode);
        console.log(errorMessage);
        if(email===''){
            alert("メールアドレスを入力してください");
            return;
        }
        if(password===''){
            alert("パスワードを入力してください");
            return;
        }
        if(errorCode==='auth/invalid-credential'){
            alert("メールアドレス、またはパスワードが正しくありません");
            return;
        }
    })
});

onAuthStateChanged(auth,(user)=>{
    if(user){
        const uid=user.uid;
        console.log("uid:"+uid);
        console.log("sign in");
    }else{
        console.log("sign out");
    }
});
