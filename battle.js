// 通信・マッチングは既存実装前提
// 画面遷移・入力例のみ（ローカル動作用ダミー）

// 行動入力
const actions = [];
document.getElementById('action-form').onsubmit = e => {
    e.preventDefault();
    const val = document.getElementById('action-input').value.trim();
    if (!val) return;
    if (actions.length >= 5) {
        alert('やったことは最大5件までです');
        return;
    }
    actions.push(val);
    document.getElementById('action-input').value = '';
    renderActionList();
    // 下限3件未満なら送信ボタンを無効化
    document.getElementById('submit-actions').disabled = actions.length < 3;
};
function renderActionList() {
    const ul = document.getElementById('action-list');
    ul.innerHTML = '';
    actions.forEach(act => {
        const li = document.createElement('li');
        li.textContent = act;
        ul.appendChild(li);
    });
    // 下限3件未満なら送信ボタンを無効化
    document.getElementById('submit-actions').disabled = actions.length < 3;
}

// 行動送信（ダミー：相手待ち）
document.getElementById('submit-actions').onclick = () => {
    document.getElementById('wait-msg').style.display = '';
    // 通信で相手の行動受信後
    setTimeout(() => {
        document.getElementById('input-phase').style.display = 'none';
        document.getElementById('mimic-phase').style.display = '';
        renderOpponentActions(['相手の行動A', '相手の行動B']);
    }, 1500);
};

// 模倣フェーズ
function renderOpponentActions(opponentActions) {
    const ul = document.getElementById('opponent-action-list');
    ul.innerHTML = '';
    opponentActions.forEach(act => {
        const li = document.createElement('li');
        li.textContent = act;
        ul.appendChild(li);
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
    const resultUl = document.getElementById('mimic-result-list');
    Array.from(resultUl.children).forEach(li => {
        li.querySelectorAll('button').forEach(btn => {
            btn.style.fontWeight = (btn.textContent === li.dataset.result) ? 'bold' : 'normal';
        });
    });
}

// 模倣結果送信（ダミー：相手待ち）
document.getElementById('submit-mimic').onclick = () => {
    document.getElementById('wait-mimic-msg').style.display = '';
    // 通信で相手の模倣結果受信後（ダミー）
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
        window.location.href = 'result.html';
    }, 1500);
};
