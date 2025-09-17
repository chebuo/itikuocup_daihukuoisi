import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getFirestore,
  getDoc,
  collection,
  addDoc,
  setDoc,
  getDocs,
  doc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAo6Teruh-6dPXACBAeJbH_lCmXzfTKt8M",
  authDomain: "itikuo-37042.firebaseapp.com",
  projectId: "itikuo-37042",
  storageBucket: "itikuo-37042.firebasestorage.app",
  messagingSenderId: "258262199926",
  appId: "1:258262199926:web:03304ca76fb8cc4585f957",
  measurementId: "G-6ZZXPQ2PE4",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let roomId = [];
let messageRef = null;
// 通信・マッチングは既存実装前提

// 画面遷移・入力例のみ（ローカル動作用ダミー）

// 行動入力
const actions = [];
document.getElementById("action-form").onsubmit = (e) => {
  e.preventDefault();
  const val = document.getElementById("action-input").value.trim();
  if (!val) return;
  if (actions.length >= 5) {
    alert("やったことは最大5件までです");
    return;
  }
  actions.push(val);
  document.getElementById("action-input").value = "";
  renderActionList();
  // 下限3件未満なら送信ボタンを無効化
  document.getElementById("submit-actions").disabled = actions.length < 3;
};
function renderActionList() {
    const ul = document.getElementById('action-list');
    ul.innerHTML = '';
    actions.forEach((act, idx) => {
        const li = document.createElement('li');
        li.textContent = act;
        // 削除ボタン追加
        const delBtn = document.createElement('button');
        delBtn.textContent = '削除';
        delBtn.style.marginLeft = '8px';
        delBtn.onclick = () => {
            actions.splice(idx, 1);
            renderActionList();
        };
        li.appendChild(delBtn);
        ul.appendChild(li);
    });
    // 下限3件未満なら送信ボタンを無効化
    document.getElementById('submit-actions').disabled = actions.length < 3;
}
////ルームを作成ボタンを押したとき
document.getElementById("room-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("make room");
  const roomKey = document.getElementById("room-key-input").value.trim();
  if (!roomKey) return;
  roomId = roomKey;
  console.log(roomId);
  ///自身のuidを取得   rooms/aikotoba/players/uid(個人を特定できるもの)
  const playerRef = doc(db, "rooms", roomId, "players", auth.currentUser.uid);
  await setDoc(playerRef, {
    user: auth.currentUser.uid || "empty",
    action: actions,
    timestamp: new Date(),
  });
  console.log(playerRef.path); //自分のデータを保存

  // todolistにも同時に保存（新規追加部分）
  const todolistRef = doc(db, "todolist", auth.currentUser.uid);
  if (actions.length > 0) {
    // 配列をオブジェクトとして包んでarrayUnionを使用
    const actionGroup = {
      actions: actions,
      timestamp: new Date(),
    };

    await setDoc(
      todolistRef,
      {
        actions: arrayUnion(actionGroup),
      },
      { merge: true }
    );
    console.log("todolistに保存完了:", actionGroup);
  }

  ////データを受信するための相手のuidを取得
  const targetUid = collection(db, "rooms", roomId, "players");
  const playersSnap = await getDocs(targetUid);
  let targetActions = [];
  playersSnap.forEach((doc) => {
    if (doc.id == auth.currentUser.uid) return;
    console.log(doc.id);
    console.log(doc.data().action);
    targetActions = doc.data().action;
  });
  console.log(targetActions); //相手のデータを取得
  // 受信した相手のリストを画面に表示
  renderOpponentActions(targetActions);
  // mimic-phaseを表示、input-phaseを非表示
  document.getElementById("mimic-phase").style.display = "";
  document.getElementById("input-phase").style.display = "none";
});

// 行動送信（ダミー：相手待ち）
document.getElementById("submit-actions").onclick = async () => {
  document.getElementById("wait-msg").style.display = "";
  // 通信で相手の行動受信後       const roomId=document.getElementById('room-key-input').value.trim();
  const roomId = document.getElementById("room-key-input").value.trim();
};

// 模倣フェーズ
function renderOpponentActions(opponentActions) {
    const ul = document.getElementById('opponent-action-list');
    ul.innerHTML = '';
    opponentActions.forEach(act => {
        const li = document.createElement('li');
        li.textContent = act;
        ul.appendChild(li);
        const fileInput=li.appendChild(document.createElement('input'));
        fileInput.type='file';
        fileInput.accept='image/*';
        fileInput.onchange=async(e)=>{
            const file=e.target.files[0];
            if(!file) return;
            const reader=new FileReader();
            reader.readAsDataURL(file);
            reader.onload=async()=>{
                const base64=reader.result;
            const imageRef=doc(db,'rooms',roomId,'players',auth.currentUser.uid,'images');
            await setDoc(imageRef,{
                image:base64,
                action:act,
                timestamp:new Date()
            }).then(()=>{
                console.log(imageRef.path);
            }).catch((error)=>{
                console.log(error);
            });
            
            console.log(base64);
            console.log("uploadekita");
        };
    };
        console.log(li);
    });
    // 模倣結果入力
    const resultUl = document.getElementById('mimic-result-list');
    resultUl.innerHTML = '';
    opponentActions.forEach((act, idx) => {
         const li = document.createElement('li');
        li.textContent = act + '：';
        ['〇','△','✕'].forEach(mark => {
            const btn = document.createElement('button');
            btn.textContent = mark;
            btn.onclick = () => {
                li.dataset.result = mark;
                updateResultList();
            };
            li.appendChild(btn);
        });
        resultUl.appendChild(li);
    });

}

function updateResultList() {
  const resultUl = document.getElementById("mimic-result-list");
  Array.from(resultUl.children).forEach((li) => {
    li.querySelectorAll("button").forEach((btn) => {
      btn.style.fontWeight =
        btn.textContent === li.dataset.result ? "bold" : "normal";
    });
  });
}

// 模倣結果送信（ダミー：相手待ち）
document.getElementById('submit-mimic').onclick = async() => {
    
    document.getElementById('wait-mimic-msg').style.display = '';
    // 通信で相手の模倣結果受信後（ダミー）
    const roomId = document.getElementById("room-key-input").value.trim();
    const targetDoc=collection(db,'rooms',roomId,'players');
    const targetSnap=await getDocs(targetDoc);
    const uids=targetSnap.docs.map(doc=>doc.id);
    //console.log(uids);
    for(const uid of uids){
        if(uid===auth.currentUser.uid) continue;
        const imageCol=collection(db,'rooms',roomId,'players',uid,'images');
        const imageSnap=await getDocs(imageCol);
        const images=imageSnap.docs.map(doc=>doc.data());
        console.log(images);//証拠のデータ配列
        console.log('images:',imageSnap.docs.map(d=>d.id));
    }
    setTimeout(() => {
        // 〇△✕の選択に応じて点数計算
        const resultUl = document.getElementById('mimic-result-list');
        let score = 0;
        Array.from(resultUl.children).forEach(li => {
            if (li.dataset.result === '〇') score += 2;
            else if (li.dataset.result === '△') score += 1;
        });
        // ダミー：相手の得点は5点固定
        localStorage.setItem('score', JSON.stringify({
            self: `あなたの得点: ${score}点`,
            opponent: `相手の得点: 5点`
        }));
        //window.location.href = 'result.html';
    }, 50000);
};