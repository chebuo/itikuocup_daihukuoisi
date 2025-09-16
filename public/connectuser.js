import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAo6Teruh-6dPXACBAeJbH_lCmXzfTKt8M",
  authDomain: "itikuo-37042.firebaseapp.com",
  projectId: "itikuo-37042",
  storageBucket: "itikuo-37042.firebasestorage.app",
  messagingSenderId: "258262199926",
  appId: "1:258262199926:web:03304ca76fb8cc4585f957",
  measurementId: "G-6ZZXPQ2PE4"
};
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    // 匿名認証でサインイン

    let roomId = null;
    let messagesRef = null;
 b
    document.getElementById("joinRoomBtn").addEventListener("click", () => {
      const input = document.getElementById("roomInput").value.trim();
      if (!input) {
        alert("合言葉を入力してください");
        return;
      }
      roomId = input;
      // 表示切り替え
      document.getElementById("chatArea").style.display = "block";
      // メッセージコレクションへの参照
      messagesRef = collection(db, "rooms", roomId, "messages");

      // 過去のメッセージを listen（リアルタイム監視）
      const q = query(messagesRef, orderBy("timestamp"));
      onSnapshot(q, (snapshot) => {
        const messagesDiv = document.getElementById("messages");
        messagesDiv.innerHTML = "";  // クリアして再描画
        snapshot.forEach(doc => {
          const m = doc.data();
          const p = document.createElement("p");
          p.textContent = `${m.user || "名無し"}: ${m.text}`;
          messagesDiv.appendChild(p);
        });
      });
    });

    document.getElementById("sendBtn").addEventListener("click", async () => {
      const todolist = document.getElementById("messageInput").value.trim();//前後の空白を削除
      if (!text) return;
      if (!roomId || !messagesRef) {
        alert("部屋に入っていません");
        return;
      }
      await addDoc(messagesRef, {
        user: auth.currentUser.displayName || "empty",
        text: todolist,
        timestamp: new Date()
      });
      console.log(messagesRef);
      document.getElementById("messageInput").value = "";
    });
