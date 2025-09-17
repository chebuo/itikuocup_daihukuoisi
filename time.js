  
  let goal = localStorage.getItem("goalItem")

   if (!goal)
    
     {
      goal = new Date().getTime() + 3600000 * 24;
     localStorage.setItem("goalItem", goal);
     }
     
    else
    {
    goal = parseInt(goal, 10);
    }
    function showRestTime()
    {
        console.log('kakak');
        const now = new Date().getTime();
        const restMillisecond = goal - now;
    if (restMillisecond <= 0){
        document.getElementById('hour').textContent = "00";
        document.getElementById('minute').textContent = "00";
        document.getElementById('second').textContent = "00";
        localStorage.removeItem("goalItem");
        
    return;
    }

        const hour = Math.floor(restMillisecond / 1000 / 60 / 60);
        const minute = Math.floor(restMillisecond / 1000 / 60) % 60;
        const second = Math.floor(restMillisecond / 1000) % 60;
       
  document.getElementById('hour').textContent = String(hour).padStart(2, '0');
  document.getElementById('minute').textContent = String(minute).padStart(2, '0');
  document.getElementById('second').textContent = String(second).padStart(2, '0');
}
setInterval(showRestTime, 1000);
showRestTime();

document.getElementById("button").addEventListener("click", function () {
    localStorage.clear("goalItem");
    goal = new Date().getTime() + 3600000 * 24; // 新しく24時間設定
      localStorage.setItem("goalItem", goal);
      showRestTime();
    });