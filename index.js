
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
        ['〇','△','?'].forEach(mark => {
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
'use strict'
const storage = localStorage;
const table = document.querySelector('table');
const todo = document.getElementById('todo');
const priority = document.querySelector('select');
const deadline = document.querySelector('input[type="date"]');
const submit = document.getElementById('submit');

let list = [];

document.addEventListener('DOMContentLoaded', () =>{
    const json =storage.todoList;//ストレージの読み込み
    if (json == undefined) 
        {
        return;//何もしない
    }
    list = JSON.parse(json);
    for (const item of list)
        {
        addItem(item);
    }
    
});
const addItem = (item) => 
{
const tr = document.createElement('tr');

for (const prop in item) 
    {
const td = document.createElement('td');

    //const td = document.createElement('td');

if (prop == 'done')
    {
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.checked = item[prop];
td.appendChild(checkbox);

checkbox.addEventListener('change', checkBoxListener);
    }else
{
    td.textContent = item[prop];
}
tr.appendChild(td);
}
table.append(tr);
};
const checkBoxListener = (ev) =>{
    const trList = Array.from(document.getElementsByTagName('tr'));
    const currentTr = ev.currentTarget.parentElement.parentElement;
    const idx = trList.indexOf(currentTr) - 1;
    list[idx].done = ev.currentTarget.checked;
    storage.todoList = JSON.stringify(list);
};






submit.addEventListener('click', () => 
    {
    console.log('jaja');
    const item = {};

    item.todo = todo.value;
    item.priority = priority.value;
    item.deadline = deadline.value;
    item.done = false;
    
    if (deadline.value != '')
        {
            item.deadline = deadline.value;
        }
        else
        {
        const date = new Date();
        item.deadline = date.toLocaleDateString();}
        if (todo.value != '')
        {
            item.todo = todo.value;
        }
        else
        {
            item.todo = 'ダミーTODO';
        }
        
            console.log(item);
            todo.value ='';
            priority.value = '普';
            deadline.value = ''; 
            
            const tr = document.createElement('tr');
             addItem(item);
            
             list.push(item);
             storage.todoList = JSON.stringify(list);
        });

        

        const filterButton = document.createElement('button');
        filterButton.textContent = '優先度（高）で絞り込み';
        filterButton.id = 'priority';
        const main = document.querySelector('main');
        main.appendChild(filterButton);

        filterButton.addEventListener('click', () => {
        clearTable()

            for (const item of list) {
                if (item.priority == '高'){
                    addItem(item);
                }
            }
        });
        const clearTable = () => {
            const trList = Array.from(document.getElementsByTagName('tr'));
            trList.shift();
            for (const tr of trList) {
                tr.remove();
            }
        };
        const remove = document.createElement('button');
        remove.textContent = '完了したTODOを削除する';
        remove.id = 'remove';
        const br = document.createElement('br');
        main.appendChild(br);
        main.appendChild(remove);
        
         
        remove.addEventListener('click',() => {
            clearTable();
            list = list.filter((item) => item.done == false);
            for (const item of list) {
                addItem(item);
            }
            storage.todoList = JSON.stringify(list);
        });
