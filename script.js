let timer;
let timeLeft = 1500;
let isRunning = false;
let currentAnswer = ""; // เก็บคำตอบที่ถูกต้อง

function requestNotification() {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") alert("ระบบแจ้งเตือนพร้อมทำงาน!");
    });
}

function setMode(minutes) {
    stopTimer();
    timeLeft = minutes * 60;
    updateDisplay();
}

function toggleTimer() {
    if (isRunning) stopTimer();
    else startTimer();
}

function startTimer() {
    isRunning = true;
    document.getElementById('main-btn').innerText = "หยุดก่อน";
    document.getElementById('main-btn').style.background = "#e53935";
    
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            finishTimer();
        }
    }, 1000);
}

function stopTimer() {
    isRunning = false;
    clearInterval(timer);
    document.getElementById('main-btn').innerText = "เริ่มจับเวลา";
    document.getElementById('main-btn').style.background = "#2e7d32";
}

function resetTimer() {
    stopTimer();
    timeLeft = 1500;
    updateDisplay();
}

function updateDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = Math.floor(timeLeft % 60); // แก้ไขให้เป็นจำนวนเต็ม
    document.getElementById('time-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
}

// --- ส่วนสำคัญ: เมื่อหมดเวลา ให้เด้งข้อสอบ ---
function finishTimer() {
    clearInterval(timer);
    document.getElementById('alarm-sound').play();
    stopTimer();
    
    // เรียกฟังก์ชันเปิดข้อสอบ
    openQuiz();
}

function openQuiz() {
    const modal = document.getElementById('quiz-modal');
    const subject = document.getElementById('task-input').value.toLowerCase(); // รับชื่อวิชา
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const textArea = document.getElementById('quiz-answer-text');
    const resultEl = document.getElementById('quiz-result');

    // รีเซ็ตค่าต่างๆ
    modal.style.display