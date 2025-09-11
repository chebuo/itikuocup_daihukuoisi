const table = document.querySelector('table');
const todo = document.getElementById('todo');
const priority = document.querySelector('select');
const deadline = document.querySelector('input[type="date"]');
const submit = document.getElementById('submit');
let list = [];
submit.addEventListener('click', () => {
    console.log('jaja');
    const item = {};

    item.todo = todo.value;
    item.priority = priority.value;
    item.deadline = deadline.value;
    item.done = false;
    if (deadline.value != ''){
            item.deadline = deadline.value;
        }else{
            window.alert('期日を入力してください');
        const date = new Date();
        item.deadline = date.toLocaleDateString();}
        if (todo.value != ''){
            item.todo = todo.value;
        }else{
            item.todo = 'ダミーTODO';
        }
        
    console.log(item);
   todo.value ='';
   priority.value = '普';
   deadline.value = '';
   const tr = document.createElement('tr');

        for (const prop in item){
            const td = document.createElement('td');
            if (prop == 'done'){
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = item[prop];
                td.appendChild(checkbox);
            }else{
                td.textContent = item[prop];
            }
            tr.appendChild(td);
        }
        
        table.append(tr);
        });

        const filterButton = document.createElement('button');
        filterButton.textContent = '優先度（高）で絞り込み';
        filterButton.id = 'priority';
        const main = document.querySelector('main');
        main.appendChild(filterButton);

        filterButton.addEventListener('click', () => {
            const trList = Array.from(document.getElementsByTagName('tr'));
            trList.shift();
            for (const tr of trList) {
                tr.remove();
            }
       // table.textContent = '';

            for (const item of list) {
                if (item.priority == '高'){
                    addItem(item);
                }
            }
        });