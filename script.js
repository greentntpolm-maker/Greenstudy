let schedules = [];
let timer;
let timeLeft = 0;
let selectedSubject = "";
let isCounting = false;

// --- โหมดจองเวลา ---
function updateClock() {
    const now = new Date();
    const currentHM = now.toTimeString().substring(0, 5);
    document.getElementById('live-clock').innerText = now.toTimeString().substring(0, 8);
    
    // ถ้าเวลาปัจจุบันตรงกับที่จองไว้
    if (schedules.includes(currentHM)) {
        triggerStudyPage(currentHM);
    }
}
setInterval(updateClock, 1000);

function addSchedule() {
    const timeInput = document.getElementById('study-time-input');
    if (!timeInput.value) return alert("เลือกเวลาก่อนครับ");
    if (!schedules.includes(timeInput.value)) {
        schedules.push(timeInput.value);
        renderList();
    }
}

function renderList() {
    const list = document.getElementById('list-items');
    list.innerHTML = schedules.map((t, i) => `<li>⏰ ${t} น. <button onclick="schedules.splice(${i},1);renderList()" style="border:none;background:none;color:red;cursor:pointer">ลบ</button></li>`).join('');
}

// --- โหมดเริ่มเรียน (เปลี่ยนหน้า) ---
function triggerStudyPage(time) {
    schedules = schedules.filter(t => t !== time); // ลบเวลาที่ถึงแล้วออก
    renderList();
    
    document.getElementById('alarm-sound').play();
    document.getElementById('setup-page').style.display = "none";
    document.getElementById('study-page').style.display = "block";
    
    if (Notification.permission === "granted") {
        new Notification("🌿 Greenstudy: ได้เวลาเรียน!", { body: "คลิกเพื่อเลือกวิชาและเริ่มจับเวลา" });
    }
}

function selectSubject(subject) {
    selectedSubject = subject;
    document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById(`btn-${subject === 'คณิต' ? 'math' : subject === 'อังกฤษ' ? 'eng' : 'sci'}`).classList.add('selected');
}

function setTime(mins) {
    timeLeft = mins * 60;
    updateTimerDisplay();
    document.querySelectorAll('.time-btn').forEach(b => b.classList.toggle('selected', b.innerText.includes(mins)));
}

function startCountdown() {
    if (!selectedSubject || timeLeft === 0) return alert("กรุณาเลือกวิชาและเวลาให้ครบก่อนครับ!");
    
    isCounting = true;
    document.getElementById('main-btn').style.display = "none";
    document.getElementById('skip-btn').style.display = "block";
    
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            finishStudy();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('time-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
}

function skipToQuiz() {
    if(confirm("ข้ามไปทำข้อสอบเลยไหม?")) finishStudy();
}

function finishStudy() {
    clearInterval(timer);
    document.getElementById('alarm-sound').play();
    openQuiz();
}

// --- ระบบข้อสอบ (เหมือนเดิม) ---
function openQuiz() {
    const modal = document.getElementById('quiz-modal');
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    modal.style.display = "block";
    optionsEl.innerHTML = "";

    const bank = {
        "คณิต": [{q:"15 + 15 = ?", a:["20","30","40"], c:1}],
        "อังกฤษ": [{q:"'Cat' แปลว่าอะไร?", a:["หมา","แมว","นก"], c:1}],
        "วิทย์": [{q:"น้ำแข็งละลายเป็นน้ำเรียกว่า?", a:["การระเหย","การหลอมเหลว","การควบแน่น"], c:1}]
    };
    
    const q = bank[selectedSubject][0];
    questionEl.innerText = q.q;
    q.a.forEach((txt, i) => {
        const btn = document.createElement("button");
        btn.innerText = txt;
        btn.onclick = () => {
            if(i === q.c) { alert("เก่งมาก!"); closeQuiz(); }
            else alert("ลองใหม่นะ");
        };
        optionsEl.appendChild(btn);
    });
}

function closeQuiz() {
    document.getElementById('quiz-modal').style.display = "none";
    document.getElementById('study-page').style.display = "none";
    document.getElementById('setup-page').style.display = "block";
    document.getElementById('main-btn').style.display = "block";
    document.getElementById('skip-btn').style.display = "none";
    selectedSubject = "";
    timeLeft = 0;
    updateTimerDisplay();
}

function requestNotif() { Notification.requestPermission(); }