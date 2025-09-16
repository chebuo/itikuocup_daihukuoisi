import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc,setDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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
// --- 模倣アプリ用ロジック ---
let actions = [];
let results = [];
let firstPlayer = '一人目';
let secondPlayer = '二人目';
let turn = 0; // 0: 一人目入力, 1: 二人目入力

const actionForm = document.getElementById('action-form');
const actionInput = document.getElementById('action-input');
const actionList = document.getElementById('action-list');
const nextPhaseBtn = document.getElementById('next-phase-btn');
const inputPhase = document.getElementById('input-phase');
const mimicPhase = document.getElementById('mimic-phase');
const mimicList = document.getElementById('mimic-list');
const scoreBtn = document.getElementById('score-btn');
const scorePhase = document.getElementById('score-phase');
const scoreResult = document.getElementById('score-result');
const swapBtn = document.getElementById('swap-btn');
const resetBtn = document.getElementById('reset-btn');
const inputTitle = document.getElementById('input-title');
const mimicTitle = document.getElementById('mimic-title');

//const userId=auth.currentUser ? auth.currentUser.uid : 'guest';
function renderActions() {
    actionList.innerHTML = '';
    actions.forEach((act, idx) => {
        const li = document.createElement('li');
        li.textContent = act;
        actionList.appendChild(li);
    });
    let userId = 'guest';
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;
            console.log(userId);
        } else {
            userId = 'guest';
            console.log("no user");
        }
        const todoDoc=doc(db, 'todolist', userId); 
    setDoc(todoDoc, {
        actions: actions
    }, { merge: true }).then(()=>{
        console.log(todoDoc);
    }).catch((error)=>{
        console.log(error);
    });
    });
    
}

if (actionForm) {
    actionForm.addEventListener('submit', e => {
        e.preventDefault();
        if (actionInput.value.trim()) {
            actions.push(actionInput.value.trim());
            actionInput.value = '';
            renderActions();
        }
    });

}

if (nextPhaseBtn) {
    nextPhaseBtn.addEventListener('click', () => {
        if (actions.length === 0) {
            alert('行動を1つ以上入力してください');
            return;
        }
        inputPhase.style.display = 'none';
        mimicPhase.style.display = '';
        renderMimicList();
    });
}

function renderMimicList() {
    mimicList.innerHTML = '';
    results = Array(actions.length).fill(null);
    actions.forEach((act, idx) => {
        const li = document.createElement('li');
        li.textContent = act + '：';
        ['〇','△','✕'].forEach(mark => {
            const btn = document.createElement('button');
            btn.textContent = mark;
            btn.onclick = () => {
                results[idx] = mark;
                updateMimicList();
            };
            li.appendChild(btn);
        });
        mimicList.appendChild(li);
    });
}

function updateMimicList() {
    Array.from(mimicList.children).forEach((li, idx) => {
        li.style.background = results[idx] ? '#e0ffe0' : '';
        li.querySelectorAll('button').forEach(btn => {
            btn.style.fontWeight = (btn.textContent === results[idx]) ? 'bold' : 'normal';
        });
    });
}

if (scoreBtn) {
    scoreBtn.addEventListener('click', () => {
        if (results.some(r => r === null)) {
            alert('すべての行動に結果を選択してください');
            return;
        }
        mimicPhase.style.display = 'none';
        scorePhase.style.display = '';
        let score = 0;
        results.forEach(r => {
            if (r === '〇') score += 2;
            else if (r === '△') score += 1;
        });
        scoreResult.textContent = `${secondPlayer}の得点: ${score}点`;

        // 一人目の得点をlocalStorageに一時保存（すでに保存済みなら上書きしない）
        if (turn === 0 && !localStorage.getItem('score_first')) {
            localStorage.setItem('score_first', JSON.stringify({ player: firstPlayer, value: score }));
        }

        // 攻守交替済みかつ二人目の点数化が終わったらリザルト遷移ボタン表示
        if (turn === 1) {
            // 二人目のplayer名は常に「二人目」に固定
            localStorage.setItem('score_second', JSON.stringify({ player: '二人目', value: score }));
            let resultBtn = document.getElementById('result-btn');
            if (!resultBtn) {
                resultBtn = document.createElement('button');
                resultBtn.id = 'result-btn';
                resultBtn.textContent = 'リザルト画面へ';
                resultBtn.style.marginTop = '20px';
                scorePhase.appendChild(resultBtn);
            }
            resultBtn.onclick = () => {
                // 両方の得点をlocalStorageにまとめて保存（役割名で明示）
                const score_first = JSON.parse(localStorage.getItem('score_first') || '{}');
                const score_second = JSON.parse(localStorage.getItem('score_second') || '{}');
                localStorage.setItem('score', JSON.stringify({
                    first: '先攻の得点: ' + score_first.value + '点',
                    second: '後攻の得点: ' + score_second.value + '点'
                }));
                window.location.href = 'result.html';
            };
        }
    });
}

if (swapBtn) {
    swapBtn.addEventListener('click', () => {
        // 先攻後攻入替
        turn = 1 - turn;
        [firstPlayer, secondPlayer] = [secondPlayer, firstPlayer];
        inputTitle.textContent = `${firstPlayer}：行動入力`;
        mimicTitle.textContent = `${secondPlayer}：模倣・結果記録`;
        actions = [];
        results = [];
        renderActions();
        scorePhase.style.display = 'none';
        inputPhase.style.display = '';
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        actions = [];
        results = [];
        turn = 0;
        firstPlayer = '一人目';
        secondPlayer = '二人目';
        inputTitle.textContent = `${firstPlayer}：行動入力`;
        mimicTitle.textContent = `${secondPlayer}：模倣・結果記録`;
        renderActions();
        scorePhase.style.display = 'none';
        inputPhase.style.display = '';
    });
}
