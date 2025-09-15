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

function renderActions() {
    actionList.innerHTML = '';
    actions.forEach((act, idx) => {
        const li = document.createElement('li');
        li.textContent = act;
        actionList.appendChild(li);
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
