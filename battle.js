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
  measurementId: "G-6ZZXPQ2PE4",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let roomId = [];
let messageRef = null;
// 騾壻ｿ｡繝ｻ繝槭ャ繝√Φ繧ｰ縺ｯ譌｢蟄伜ｮ溯｣�蜑肴署

// 逕ｻ髱｢驕ｷ遘ｻ繝ｻ蜈･蜉帑ｾ九�ｮ縺ｿ�ｼ医Ο繝ｼ繧ｫ繝ｫ蜍穂ｽ懃畑繝繝溘�ｼ�ｼ�

// 行動入力
const actions = [];
document.getElementById("action-form").onsubmit = (e) => {
  e.preventDefault();
  const val = document.getElementById("action-input").value.trim();
  if (!val) return;
  if (actions.length >= 5) {
    alert("繧�縺｣縺溘％縺ｨ縺ｯ譛螟ｧ5莉ｶ縺ｾ縺ｧ縺ｧ縺�");
    return;
  }
  actions.push(val);
  document.getElementById("action-input").value = "";
  renderActionList();
  // 荳矩剞3莉ｶ譛ｪ貅縺ｪ繧蛾∽ｿ｡繝懊ち繝ｳ繧堤┌蜉ｹ蛹�
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
////繝ｫ繝ｼ繝�繧剃ｽ懈�舌�懊ち繝ｳ繧呈款縺励◆縺ｨ縺�
document.getElementById("room-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("make room");
  const roomKey = document.getElementById("room-key-input").value.trim();
  if (!roomKey) return;
  roomId = roomKey;
  console.log(roomId);
  ///閾ｪ霄ｫ縺ｮuid繧貞叙蠕�   rooms/aikotoba/players/uid(蛟倶ｺｺ繧堤音螳壹〒縺阪ｋ繧ゅ�ｮ)
  const playerRef = doc(db, "rooms", roomId, "players", auth.currentUser.uid);
  await setDoc(playerRef, {
    user: auth.currentUser.uid || "empty",
    action: actions,
    timestamp: new Date(),
  });
  console.log(playerRef.path); //閾ｪ蛻�縺ｮ繝�繝ｼ繧ｿ繧剃ｿ晏ｭ�

  // todolist縺ｫ繧ょ酔譎ゅ↓菫晏ｭ假ｼ域眠隕剰ｿｽ蜉�驛ｨ蛻��ｼ�
  const todolistRef = doc(db, "todolist", auth.currentUser.uid);
  if (actions.length > 0) {
    // 驟榊�励ｒ繧ｪ繝悶ず繧ｧ繧ｯ繝医→縺励※蛹�繧薙〒arrayUnion繧剃ｽｿ逕ｨ
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
    console.log("todolist縺ｫ菫晏ｭ伜ｮ御ｺ�:", actionGroup);
  }

  ////繝�繝ｼ繧ｿ繧貞女菫｡縺吶ｋ縺溘ａ縺ｮ逶ｸ謇九�ｮuid繧貞叙蠕�
  const targetUid = collection(db, "rooms", roomId, "players");
  const playersSnap = await getDocs(targetUid);
  let targetActions = [];
  playersSnap.forEach((doc) => {
    if (doc.id == auth.currentUser.uid) return;
    console.log(doc.id);
    console.log(doc.data().action);
    targetActions = doc.data().action;
  });
  console.log(targetActions); //逶ｸ謇九�ｮ繝�繝ｼ繧ｿ繧貞叙蠕�
  // 蜿嶺ｿ｡縺励◆逶ｸ謇九�ｮ繝ｪ繧ｹ繝医ｒ逕ｻ髱｢縺ｫ陦ｨ遉ｺ
  renderOpponentActions(targetActions);
  // 逶ｸ謇九′騾√▲縺溽判蜒上ｒ蜿嶺ｿ｡繝ｻ陦ｨ遉ｺ縺吶ｋ繝ｪ繧ｹ繝�
  const opponentImageList = document.getElementById('opponent-image-list');
  opponentImageList.innerHTML = '';
  // 逶ｸ謇偽ID蜿門ｾ�
  let opponentUid = null;
  playersSnap.forEach((doc) => {
    if (doc.id != auth.currentUser.uid) opponentUid = doc.id;
  });
  if (opponentUid) {
    const imageCol = collection(db, 'rooms', roomId, 'players', opponentUid, 'images');
    onSnapshot(imageCol, (snapshot) => {
      opponentImageList.innerHTML = '';
      if (snapshot.empty) {
        const msg = document.createElement('li');
        msg.textContent = '逶ｸ謇九�ｮ逕ｻ蜒上�ｯ縺ｾ縺�縺ゅｊ縺ｾ縺帙ｓ';
        msg.style.color = 'gray';
        opponentImageList.appendChild(msg);
        return;
      }
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.image && data.action) {
          const li = document.createElement('li');
          li.textContent = data.action;
          const img = document.createElement('img');
          img.src = data.image;
          img.style.maxWidth = '120px';
          img.style.display = 'block';
          li.appendChild(img);
          opponentImageList.appendChild(li);
        }
      });
    });
  }
  // mimic-phase繧定｡ｨ遉ｺ縲（nput-phase繧帝撼陦ｨ遉ｺ
  document.getElementById("mimic-phase").style.display = "";
  document.getElementById("input-phase").style.display = "none";
});

// 陦悟虚騾∽ｿ｡�ｼ医ム繝溘�ｼ�ｼ夂嶌謇句ｾ�縺｡�ｼ�
document.getElementById("submit-actions").onclick = async () => {
  document.getElementById("wait-msg").style.display = "";
  // 騾壻ｿ｡縺ｧ逶ｸ謇九�ｮ陦悟虚蜿嶺ｿ｡蠕�       const roomId=document.getElementById('room-key-input').value.trim();
  const roomId = document.getElementById("room-key-input").value.trim();
};

// 模倣フェーズ
function renderOpponentActions(opponentActions) {
  const ul = document.getElementById('opponent-action-list');
  ul.innerHTML = '';
  // Firestore縺ｮimages繧ｳ繝ｬ繧ｯ繧ｷ繝ｧ繝ｳ繧偵Μ繧｢繝ｫ繧ｿ繧､繝�逶｣隕�
  const imageCol = collection(db, 'rooms', roomId, 'players', auth.currentUser.uid, 'images');
  onSnapshot(imageCol, (snapshot) => {
    const imagesMap = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.action && data.image) imagesMap[data.action] = data.image;
    });
    ul.innerHTML = '';
    if (!opponentActions || opponentActions.length === 0) {
      // 繝ｪ繧ｹ繝医′遨ｺ縺ｮ蝣ｴ蜷医�ｯ繝｡繝�繧ｻ繝ｼ繧ｸ陦ｨ遉ｺ
      const msg = document.createElement('li');
      msg.textContent = '逶ｸ謇九′縺ｾ縺�騾∽ｿ｡縺励※縺�縺ｾ縺帙ｓ';
      msg.style.color = 'gray';
      ul.appendChild(msg);
      return;
    }
    opponentActions.forEach(act => {
      const li = document.createElement('li');
      li.textContent = act;
      // 險ｼ諡�逕ｻ蜒上′縺ゅｌ縺ｰ陦ｨ遉ｺ
      if (imagesMap[act]) {
        const img = document.createElement('img');
        img.src = imagesMap[act];
        img.style.maxWidth = '120px';
        img.style.display = 'block';
        li.appendChild(img);
      } else {
        // 逕ｻ蜒乗悴逋ｻ骭ｲ縺ｮ蝣ｴ蜷医�ｯ繝輔ぃ繧､繝ｫ驕ｸ謚樊ｬ�
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            const base64 = reader.result;
            // Firestore縺ｫ繧｢繝�繝励Ο繝ｼ繝会ｼ育嶌謇九′蜿門ｾ励〒縺阪ｋ�ｼ�
            const imageRef = doc(db, 'rooms', roomId, 'players', auth.currentUser.uid, 'images', act);
            await setDoc(imageRef, {
              image: base64,
              action: act,
              timestamp: new Date()
            });
            // 逕ｻ蜒上�ｯonSnapshot縺ｧ閾ｪ蜍募渚譏�
            fileInput.style.display = 'none';
          };
        };
        li.appendChild(fileInput);
      }
      ul.appendChild(li);
    });
  });
    // 讓｡蛟｣邨先棡蜈･蜉�
    const resultUl = document.getElementById('mimic-result-list');
    resultUl.innerHTML = '';
    opponentActions.forEach((act, idx) => {
         const li = document.createElement('li');
        li.textContent = act + '�ｼ�';
        ['縲�','笆ｳ','笨�'].forEach(mark => {
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

// 讓｡蛟｣邨先棡騾∽ｿ｡�ｼ医ム繝溘�ｼ�ｼ夂嶌謇句ｾ�縺｡�ｼ�
document.getElementById('submit-mimic').onclick = async() => {
  // 繝�繝舌ャ繧ｰ: 蜿門ｾ怜ｯｾ雎｡UID, roomId, append蜈�ID, display迥ｶ諷�
  const roomId = document.getElementById("room-key-input").value.trim();
  const targetDoc = collection(db, 'rooms', roomId, 'players');
  const targetSnap = await getDocs(targetDoc);
  const uids = targetSnap.docs.map(doc => doc.id);
  console.log('submit-mimic: roomId', roomId);
  console.log('submit-mimic: 閾ｪ蛻�縺ｮUID', auth.currentUser.uid);
  console.log('submit-mimic: 蜿門ｾ怜ｯｾ雎｡UID荳隕ｧ', uids);
  const resultImageList = document.getElementById('result-opponent-image-list');
  console.log('result-opponent-image-list隕∫ｴ�:', resultImageList);
  console.log('result-opponent-image-list display:', resultImageList && resultImageList.style.display);
  let opponentImages = [];
  for (const uid of uids) {
    if (uid === auth.currentUser.uid) continue;
    console.log('逕ｻ蜒丞叙蠕怜ｯｾ雎｡UID:', uid);
    const imageCol = collection(db, 'rooms', roomId, 'players', uid, 'images');
    console.log('逕ｻ蜒丞叙蠕励ヱ繧ｹ:', imageCol.path);
    const imageSnap = await getDocs(imageCol);
    console.log('imageSnap.docs:', imageSnap.docs);
    opponentImages = imageSnap.docs.map(doc => doc.data());
    console.log('opponentImages after getDocs:', opponentImages);
  }
  // 逕ｻ蜒剰｡ｨ遉ｺ逶ｴ蜑�
  console.log('opponentImages before render:', opponentImages);
  // 縲�笆ｳ笨輔�ｮ驕ｸ謚槭↓蠢懊§縺ｦ轤ｹ謨ｰ險育ｮ�
  const resultUl = document.getElementById('mimic-result-list');
  let score = 0;
  Array.from(resultUl.children).forEach(li => {
    if (li.dataset.result === '縲�') score += 2;
    else if (li.dataset.result === '笆ｳ') score += 1;
  });
  localStorage.setItem('score', JSON.stringify({
    self: `縺ゅ↑縺溘�ｮ蠕礼せ: ${score}轤ｹ`,
    opponent: `逶ｸ謇九�ｮ蠕礼せ: 5轤ｹ`
  }));
  resultImageList.innerHTML = '';
  if (opponentImages.length === 0) {
    console.log('opponentImages縺ｯ遨ｺ縺ｧ縺�');
    const msg = document.createElement('li');
    msg.textContent = '逶ｸ謇九�ｮ險ｼ諡�逕ｻ蜒上�ｯ縺ゅｊ縺ｾ縺帙ｓ';
    msg.style.color = 'gray';
    resultImageList.appendChild(msg);
  } else {
    opponentImages.forEach(imgObj => {
      console.log('imgObj:', imgObj);
      if (imgObj.image && imgObj.action) {
        console.log('imgObj.image:', imgObj.image);
        console.log('imgObj.action:', imgObj.action);
        const li = document.createElement('li');
        li.textContent = imgObj.action;
        const img = document.createElement('img');
        img.src = imgObj.image;
        img.style.maxWidth = '120px';
        img.style.display = 'block';
        li.appendChild(img);
        resultImageList.appendChild(li);
      }
    });
  }
  //window.location.href = 'result.html';
};