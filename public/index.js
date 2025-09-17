// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration (replace with your config)
const firebaseConfig = {
  // Your Firebase config object
  apiKey: "AIzaSyAo6Teruh-6dPXACBAeJbH_lCmXzfTKt8M",
  authDomain: "itikuo-37042.firebaseapp.com",
  projectId: "itikuo-37042",
  storageBucket: "itikuo-37042.firebasestorage.app",
  messagingSenderId: "258262199926",
  appId: "1:258262199926:web:03304ca76fb8cc4585f957",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements
const profileBtn = document.getElementById("profile-btn");
const profileText = document.getElementById("profile-text");
const battleBtn = document.getElementById("battle-btn");
const welcomeMessage = document.getElementById("welcome-message");
const loading = document.getElementById("loading");

// Show loading initially
loading.style.display = "flex";

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
  loading.style.display = "none";

  if (user) {
    // User is signed in
    profileText.textContent = "プロフィールへ";
    profileBtn.classList.add("authenticated");
    welcomeMessage.textContent = `おかえりなさい、${
      user.displayName || "プレイヤー"
    }さん！`;

    profileBtn.onclick = () => {
      // Navigate to profile page
      window.location.href = "/profile.html";
    };
  } else {
    // User is signed out
    profileText.textContent = "ログイン/新規登録";
    profileBtn.classList.remove("authenticated");
    welcomeMessage.textContent = "ようこそ！";

    profileBtn.onclick = () => {
      // Navigate to login page
      window.location.href = "auth.html";
    };
  }
});

// Battle button functionality
battleBtn.onclick = () => {
  // Navigate to game (React app)
  window.location.href = "/battle.html"; // or wherever your React app is served
};

// Add logout functionality for authenticated users
profileBtn.addEventListener("contextmenu", (e) => {
  if (auth.currentUser) {
    e.preventDefault();
    if (confirm("ログアウトしますか？")) {
      signOut(auth)
        .then(() => {
          console.log("ログアウトしました");
        })
        .catch((error) => {
          console.error("ログアウトエラー:", error);
        });
    }
  }
});
