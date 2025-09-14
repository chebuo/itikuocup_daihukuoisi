
// --- –Í•íƒAƒvƒŠ—pƒƒWƒbƒN ---
let actions = [];
let results = [];
let firstPlayer = 'ˆêl–Ú';
let secondPlayer = '“ñl–Ú';
let turn = 0; // 0: ˆêl–Ú“ü—Í, 1: “ñl–Ú“ü—Í

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
        alert('s“®‚ð1‚ÂˆÈã“ü—Í‚µ‚Ä‚­‚¾‚³‚¢');
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
        li.textContent = act + 'F';
        ['Z','¢','?'].forEach(mark => {
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
        alert('‚·‚×‚Ä‚Ìs“®‚ÉŒ‹‰Ê‚ð‘I‘ð‚µ‚Ä‚­‚¾‚³‚¢');
        return;
    }
    mimicPhase.style.display = 'none';
    scorePhase.style.display = '';
    let score = 0;
    results.forEach(r => {
        if (r === 'Z') score += 2;
        else if (r === '¢') score += 1;
    });
    scoreResult.textContent = `${secondPlayer}‚Ì“¾“_: ${score}“_`;
});
}

if (swapBtn) {
swapBtn.addEventListener('click', () => {
    // æUŒãU“ü‘Ö
    turn = 1 - turn;
    [firstPlayer, secondPlayer] = [secondPlayer, firstPlayer];
    inputTitle.textContent = `${firstPlayer}Fs“®“ü—Í`;
    mimicTitle.textContent = `${secondPlayer}F–Í•íEŒ‹‰Ê‹L˜^`;
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
    firstPlayer = 'ˆêl–Ú';
    secondPlayer = '“ñl–Ú';
    inputTitle.textContent = `${firstPlayer}Fs“®“ü—Í`;
    mimicTitle.textContent = `${secondPlayer}F–Í•íEŒ‹‰Ê‹L˜^`;
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
    const json =storage.todoList;//ã‚¹ãƒˆãƒ¬ãƒ¼ã‚¸ã®èª­ã¿è¾¼ã¿
    if (json == undefined) 
        {
        return;//ä½•ã‚‚ã—ãªã?
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
            item.todo = 'ãƒ€ãƒŸã?¼TODO';
        }
        
            console.log(item);
            todo.value ='';
            priority.value = 'æ™®';
            deadline.value = ''; 
            
            const tr = document.createElement('tr');
             addItem(item);
            
             list.push(item);
             storage.todoList = JSON.stringify(list);
        });

        

        const filterButton = document.createElement('button');
        filterButton.textContent = 'å„ªå…ˆåº¦?¼ˆé«˜ï¼‰ã§çµžã‚Šè¾¼ã¿';
        filterButton.id = 'priority';
        const main = document.querySelector('main');
        main.appendChild(filterButton);

        filterButton.addEventListener('click', () => {
        clearTable()

            for (const item of list) {
                if (item.priority == 'é«?'){
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
        remove.textContent = 'å®Œäº?ã—ãŸTODOã‚’å‰Šé™¤ã™ã‚‹';
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
