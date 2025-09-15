import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,createUserWithEmailAndPassword,onAuthStateChanged,sendEmailVerification} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,collection,getDocs,doc,addDoc} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore-lite.js";
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
const db=getFirestore(app);

const loginform=document.getElementById("loginForm");
const emailText=document.getElementById("mailAddress");
const passwordText=document.getElementById("password");
//userのデータを保存
async function addUser(name,mailaddress){
    try{
        const userCol=collection(db,'daihukkuCol');
        const docRef=await addDoc(userCol,{
            name:name,
            mailaddress:mailaddress
        });
        console.log("add:"+docRef.id);
        console.log(docRef);
    }catch(e){
        console.error("Error adding document:",e);
    }
}
loginform.addEventListener("submit",(e)=>{
    e.preventDefault();
    const email=emailText.value;
    const password=passwordText.value;
    console.log(email);
    console.log(password);
    createUserWithEmailAndPassword(auth,email,password)
    .then(()=>{
        const user=auth.currentUser;
        const email=user.email;
        if(user.emailVerified){
            console.log("email verified");
            addUser("test",email);
        }else{
            sendEmailVerification(user).then(()=>{
                console.log("send email");
                if(!user.emailVerified) return;
                window.location.href="index.html";
            }
            ).catch((error)=>{
                console.log(error);
            });
        }
    }).catch((error)=>{
        const errorCode=error.code;
        const errorMessage=error.message;
        if(email===''){
            alert("メールアドレスを入力してください");
            return;
        }
        if(password===''){
            alert("パスワードを入力してください");
            return;
        }
        if(errorCode==='auth/weak-password'){
            alert("パスワードは6文字以上にしてください");
            return;
        }
        if(errorCode==='auth/invalid-email'){
            alert("メールアドレスの形式が正しくありません");
            return;
        }
        if(errorCode==='auth/email-already-in-use'){
            alert("このメールアドレスは既に使用されています");
            return;
        }
        console.log(errorCode);
        console.log(errorMessage);
    })
});
const usersDoc=collection(db,'daihukuCol');
onAuthStateChanged(auth,(user)=>{
    if(user){
        const uid=user.uid;
        console.log("uid:"+uid);
        console.log("sign in");
        console.log(usersDoc);
        console.log(collection(db,'daihukuCol'));
        console.log(collection(db,'daihukuCol').id);  // "users"
    }else{
        console.log("sign out");
    }
});




//collection/document/data 
