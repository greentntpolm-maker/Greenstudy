let schedules = [];
let timer;
let timeLeft = 0;
let selectedSubject = "";
let currentUser = null;
let lastTriggeredTime = "";

// --- ลิงก์แบบทดสอบแยกตามวิชา ---
const THAI_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdony2Q9w6-kOfHU3uIaP2a1y7inOti9XXHBqFuJcTS_uPW7w/viewform?usp=header";
const SCIENCE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSczVjyfKF_2PHB7VoTED7TN7iZqaloM4eHxpQZsCrcdqT_-mQ/viewform?usp=header";
const SOCIAL_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfR6P0ZGOBeAZMnj3_jrtx1rgr1rklmY19oqajVHZKlgUMmMA/viewform?usp=header";

// --- Translations ---
const translations = {
    th: {
        login_h1: "Log In", signup_h1: "Sign Up", email_ph: "อีเมล / ชื่อผู้ใช้", pass_ph: "รหัสผ่าน",
        btn_login: "เข้าสู่ระบบ", btn_signup: "สมัครสมาชิก", no_acc: "ยังไม่มีบัญชีใช่ไหม? ", has_acc: "มีบัญชีอยู่แล้ว? ",
        current_time: "เวลาปัจจุบัน", reserve: "🔔 จองเวลาเริ่มเรียน", btn_reserve: "จอง", queue: "📌 คิวการเรียนของคุณ:",
        notif_btn: "🔔 เปิดระบบแจ้งเตือนข้างจอ/มือถือ", study_status: "📚 ได้เวลาเรียนแล้ว!", sub_label: "1. เลือกวิชาที่จะติว:",
        time_label: "2. เลือกเวลาที่จะอ่าน:", start_btn: "เริ่มจับเวลาเลย!"
    },
    en: {
        login_h1: "Log In", signup_h1: "Sign Up", email_ph: "Email / Username", pass_ph: "Password",
        btn_login: "Login", btn_signup: "Sign Up", no_acc: "Don't have an account? ", has_acc: "Already have an account? ",
        current_time: "Current Time", reserve: "🔔 Reserve Study Time", btn_reserve: "Reserve", queue: "📌 Your Study Queue:",
        notif_btn: "🔔 Enable Desktop/Mobile Notifications", study_status: "📚 Time to Study!", sub_label: "1. Choose a subject:",
        time_label: "2. Choose study time:", start_btn: "Start Timer Now!"
    }
};

function changeLang(lang) {
    const t = translations[lang] || translations['th'];
    const h1Login = document.querySelector('#login-form h1');
    if (h1Login) h1Login.innerText = t.login_h1;
    document.getElementById('login-email').placeholder = t.email_ph;
    document.getElementById('login-pass').placeholder = t.pass_ph;
    document.getElementById('main-btn').innerText = t.btn_login;
    document.getElementById('current-time-label').innerText = t.current_time;
    document.getElementById('reserve-label').innerText = t.reserve;
    document.getElementById('reserve-btn').innerText = t.btn_reserve;
    document.getElementById('queue-label').innerText = t.queue;
    document.getElementById('notif-btn').innerText = t.notif_btn;
    document.getElementById('study-status').innerText = t.study_status;
    document.getElementById('sub-label').innerText = t.sub_label;
    document.getElementById('time-label').innerText = t.time_label;
    document.getElementById('main-btn-start').innerText = t.start_btn;
}

// --- Auth System ---
function handleSignIn() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    if (email === "Admin007" && pass === "greentntpolm000") {
        currentUser = email;
        localStorage.setItem('gs_current_session', email);
        showAdminPage();
        return;
    }
    const users = JSON.parse(localStorage.getItem('gs_users') || "{}");
    if (users[email] && users[email].password === pass) {
        currentUser = email;
        localStorage.setItem('gs_current_session', email);
        showMainApp();
    } else { alert("ข้อมูลไม่ถูกต้อง"); }
}

function showMainApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('user-display').innerText = `👤 ${currentUser}`;
    const savedData = localStorage.getItem(`schedules_${currentUser}`);
    schedules = savedData ? JSON.parse(savedData) : [];
    renderList();
    resetToSetupPage(); 
}

function handleSignOut() { localStorage.removeItem('gs_current_session'); location.reload(); }

window.onload = () => {
    const session = localStorage.getItem('gs_current_session');
    if (session) {
        currentUser = session;
        if (currentUser === "Admin007") showAdminPage();
        else showMainApp();
    }
};

// --- Core Logic ---
function updateClock() {
    const now = new Date();
    const currentHM = now.toTimeString().substring(0, 5);
    document.getElementById('live-clock').innerText = now.toTimeString().substring(0, 8);
    if (schedules.includes(currentHM) && lastTriggeredTime !== currentHM) {
        lastTriggeredTime = currentHM;
        triggerStudyPage(currentHM);
    }
}
setInterval(updateClock, 1000);

function triggerStudyPage(time) {
    schedules = schedules.filter(t => t !== time);
    localStorage.setItem(`schedules_${currentUser}`, JSON.stringify(schedules));
    renderList();
    document.getElementById('alarm-sound').play();
    if (Notification.permission === "granted") {
        new Notification("🌿 ได้เวลาเรียนแล้ว!", { body: `จองไว้เวลา ${time} น.` });
    }
    document.getElementById('setup-page').style.display = "none";
    document.getElementById('study-page').style.display = "block";
}

function selectSubject(s) {
    selectedSubject = s;
    document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('selected'));
    const ids = { 'ไทย': 'btn-thai', 'วิทย์': 'btn-sci', 'สังคม': 'btn-soc' };
    if (ids[s]) document.getElementById(ids[s]).classList.add('selected');
}

function setTime(m) {
    timeLeft = m * 60;
    document.getElementById('time-display').innerText = `${m}:00`;
    document.querySelectorAll('.time-btn').forEach(b => b.classList.toggle('selected', b.innerText.includes(m)));
}

function startCountdown() {
    if (!selectedSubject || timeLeft === 0) return alert("เลือกวิชาและเวลาก่อน!");
    addLog("เริ่มเรียน");
    document.getElementById('main-btn-start').style.display = "none";
    document.getElementById('skip-btn').style.display = "block";
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            document.getElementById('time-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        } else { finishStudy("เรียนจบ"); }
    }, 1000);
}

// --- ฟังก์ชันเด้งไปลิงก์ตามวิชาที่เลือก ---
function finishStudy(status) {
    clearInterval(timer);
    addLog(status);
    document.getElementById('alarm-sound').play();
    
    let targetUrl = "";
    if (selectedSubject === "ไทย") {
        targetUrl = THAI_FORM_URL;
    } else if (selectedSubject === "วิทย์") {
        targetUrl = SCIENCE_FORM_URL;
    } else if (selectedSubject === "สังคม") {
        targetUrl = SOCIAL_FORM_URL;
    } else {
        targetUrl = SCIENCE_FORM_URL; // Default
    }
    
    alert(status === "เรียนจบ" ? `ยอดเยี่ยม! ไปทำแบบทดสอบวิชา ${selectedSubject} กัน` : "กำลังพาไปหน้าแบบทดสอบ...");
    window.open(targetUrl, '_blank');
    resetToSetupPage();
}

function resetToSetupPage() {
    document.getElementById('study-page').style.display = "none";
    document.getElementById('setup-page').style.display = "block";
    selectedSubject = "";
    timeLeft = 0;
    document.getElementById('time-display').innerText = "00:00";
    document.getElementById('main-btn-start').style.display = "block";
    document.getElementById('skip-btn').style.display = "none";
    document.querySelectorAll('.sub-btn, .time-btn').forEach(b => b.classList.remove('selected'));
}

function addSchedule() {
    const val = document.getElementById('study-time-input').value;
    if (val && !schedules.includes(val)) {
        schedules.push(val);
        localStorage.setItem(`schedules_${currentUser}`, JSON.stringify(schedules));
        renderList();
    }
}

function renderList() {
    const list = document.getElementById('list-items');
    if(list) list.innerHTML = schedules.map((t, i) => `<li>⏰ ${t} <button onclick="deleteSchedule(${i})" style="color:red;border:none;background:none;cursor:pointer;margin-left:10px;">ลบ</button></li>`).join('');
}

function deleteSchedule(i) {
    schedules.splice(i,1);
    localStorage.setItem('schedules_'+currentUser, JSON.stringify(schedules));
    renderList();
}

function addLog(action) {
    if (currentUser === 'Admin007') return; 
    const logs = JSON.parse(localStorage.getItem('gs_activity_logs') || "[]");
    logs.push({
        user: currentUser, subject: selectedSubject || "ไม่ได้เลือก",
        duration: timeLeft, action: action, time: new Date().toLocaleString('th-TH')
    });
    localStorage.setItem('gs_activity_logs', JSON.stringify(logs));
}

function toggleAuth(isSignup) {
    document.getElementById('login-form').style.display = isSignup ? 'none' : 'block';
    document.getElementById('signup-form').style.display = isSignup ? 'block' : 'none';
}

function handleSignUp() {
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-pass').value;
    if (!email || !pass) return;
    let users = JSON.parse(localStorage.getItem('gs_users') || "{}");
    users[email] = { password: pass };
    localStorage.setItem('gs_users', JSON.stringify(users));
    alert("สมัครสำเร็จ!"); toggleAuth(false);
}

function showAdminPage() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    renderAdminDashboard();
}

function renderAdminDashboard() {
    const logs = JSON.parse(localStorage.getItem('gs_activity_logs') || "[]");
    const statsDiv = document.getElementById('admin-stats');
    if (statsDiv) {
        statsDiv.innerHTML = logs.reverse().map(log => `
            <div style="border-bottom:1px solid #eee; padding:10px 0; font-size:0.8rem; text-align:left;">
                <strong>${log.user}</strong> - ${log.subject} | <span style="color:${log.action === 'กดข้าม' ? 'red' : 'green'}">${log.action}</span><br>
                <small>${log.time}</small>
            </div>
        `).join('');
    }
}

function clearLogs() { if(confirm("ล้างประวัติ?")) { localStorage.removeItem('gs_activity_logs'); renderAdminDashboard(); } }

function requestNotif() {
    Notification.requestPermission().then(perm => {
        if (perm === "granted") alert("✅ เปิดการแจ้งเตือนแล้ว!");
        else alert("❌ โปรดเปิดสิทธิ์แจ้งเตือนในเบราว์เซอร์");
    });
}

function skipToQuiz() { if(confirm("ต้องการข้ามไปทำแบบทดสอบเลยไหม?")) finishStudy("กดข้าม"); }