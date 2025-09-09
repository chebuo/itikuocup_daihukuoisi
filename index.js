const table = document.querySelector('table');
const todo = document.getElementById('todo');
const priority = document.querySelector('select');
const deadline = document.querySelector('input[type="date"]');
const submit = document.getElementById('submit');
submit.addEventListener('click', () => {
    console.log('jaja');
    const item = {};

    item.todo = todo.value;
    item.priority = priority.value;
    item.deadline = deadline.value;
    item.done = false;

    console.log(item);
   todo.value ='';
   priority.value = '普';
   deadline.value = '';
   const tr = document.createElement('tr');

        for (const prop in item) {
            const td = document.createElement('td');
            td.textContent = item[prop];
            tr.appendChild(td);
        }
        table.append(tr);
});