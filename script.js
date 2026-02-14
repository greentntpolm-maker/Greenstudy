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
const MATH_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf6u_Y5GwIEUTzIRtfqo7ZSSs3nDrHc37hyyOSGePJqJy2p4g/viewform?usp=header";

// --- ระบบแปลภาษา ---
const translations = {
    th: {
        login_h1: "Log In", signup_h1: "Sign Up", email_ph: "อีเมล / ชื่อผู้ใช้", pass_ph: "รหัสผ่าน",
        btn_login: "เข้าสู่ระบบ", btn_signup: "สมัครสมาชิก",
        current_time: "เวลาปัจจุบัน", reserve: "🔔 จองเวลาเริ่มเรียน", btn_reserve: "จอง", queue: "📌 คิวการเรียนของคุณ:",
        notif_btn: "🔔 เปิดระบบแจ้งเตือนข้างจอ/มือถือ", study_status: "📚 ได้เวลาเรียนแล้ว!", sub_label: "1. เลือกวิชาที่จะติว:",
        time_label: "2. ระบุเวลาที่จะอ่าน (นาที):", start_btn: "เริ่มจับเวลาเลย!",
        sub_thai: "ภาษาไทย", sub_sci: "วิทยาศาสตร์", sub_soc: "สังคมศึกษา", sub_math: "คณิตศาสตร์",
        time_ph: "ระบุจำนวนนาที", skip: "ข้ามขั้นตอนเรียน ⏩"
    },
    en: {
        login_h1: "Log In", signup_h1: "Sign Up", email_ph: "Email / Username", pass_ph: "Password",
        btn_login: "Login", btn_signup: "Sign Up",
        current_time: "Current Time", reserve: "🔔 Reserve Study Time", btn_reserve: "Reserve", queue: "📌 Your Study Queue:",
        notif_btn: "🔔 Enable Notifications", study_status: "📚 Time to Study!", sub_label: "1. Choose a subject:",
        time_label: "2. Enter study time (Minutes):", start_btn: "Start Timer Now!",
        sub_thai: "Thai Language", sub_sci: "Science", sub_soc: "Social Studies", sub_math: "Mathematics",
        time_ph: "Enter minutes", skip: "Skip to Quiz ⏩"
    },
    cn: {
        login_h1: "登录", signup_h1: "注册", email_ph: "电子邮件 / 用户名", pass_ph: "密码",
        btn_login: "登录", btn_signup: "注册",
        current_time: "当前时间", reserve: "🔔 预约学习时间", btn_reserve: "预约", queue: "📌 您的学习队列:",
        notif_btn: "🔔 开启通知", study_status: "📚 学习时间到了！", sub_label: "1. 选择科目:",
        time_label: "2. 输入学习时间 (分钟):", start_btn: "现在开始计时！",
        sub_thai: "泰语", sub_sci: "科学", sub_soc: "社会", sub_math: "数学",
        time_ph: "输入分钟", skip: "跳过学习 ⏩"
    },
    jp: {
        login_h1: "ログイン", signup_h1: "サインアップ", email_ph: "メール / ユーザー名", pass_ph: "パスワード",
        btn_login: "ログイン", btn_signup: "サインアップ",
        current_time: "現在の時刻", reserve: "🔔 学習時間を予約する", btn_reserve: "予約", queue: "📌 学習キュー:",
        notif_btn: "🔔 通知を有効にする", study_status: "📚 勉強の時間です！", sub_label: "1. 科目を選択:",
        time_label: "2. 学習時間を入力 (分):", start_btn: "タイマー開始！",
        sub_thai: "タイ語", sub_sci: "科学", sub_soc: "社会科", sub_math: "数学",
        time_ph: "分を入力", skip: "クイズへスキップ ⏩"
    },
    ru: {
        login_h1: "Вход", signup_h1: "Регистрация", email_ph: "Email / Имя пользователя", pass_ph: "Пароль",
        btn_login: "Войти", btn_signup: "Создать аккаунт",
        current_time: "Текущее время", reserve: "🔔 Забронировать время", btn_reserve: "Бронь", queue: "📌 Ваша очередь:",
        notif_btn: "🔔 Включить уведомления", study_status: "📚 Время учиться!", sub_label: "1. Выберите предмет:",
        time_label: "2. Введите время (мин):", start_btn: "Начать отсчет!",
        sub_thai: "Тайский язык", sub_sci: "Наука", sub_soc: "Обществознание", sub_math: "Математика",
        time_ph: "Введите минуты", skip: "Перейти к тесту ⏩"
    }
};

function changeLang(lang) {
    const t = translations[lang] || translations['th'];

    // แปลหน้า Login/Signup
    if(document.querySelector('#login-form h1')) document.querySelector('#login-form h1').innerText = t.login_h1;
    document.getElementById('login-email').placeholder = t.email_ph;
    document.getElementById('login-pass').placeholder = t.pass_ph;
    document.getElementById('main-btn').innerText = t.btn_login;
    
    if(document.querySelector('#signup-form h1')) document.querySelector('#signup-form h1').innerText = t.signup_h1;
    document.getElementById('signup-email').placeholder = t.email_ph;
    document.getElementById('signup-pass').placeholder = t.pass_ph;
    const signupBtn = document.querySelector('#signup-form #main-btn');
    if(signupBtn) signupBtn.innerText = t.btn_signup;

    // แปลหน้า Setup
    document.getElementById('current-time-label').innerText = t.current_time;
    document.getElementById('reserve-label').innerText = t.reserve;
    document.getElementById('reserve-btn').innerText = t.btn_reserve;
    document.getElementById('queue-label').innerText = t.queue;
    document.getElementById('notif-btn').innerText = t.notif_btn;

    // แปลหน้า Study
    document.getElementById('study-status').innerText = t.study_status;
    document.getElementById('sub-label').innerText = t.sub_label;
    document.getElementById('time-label').innerText = t.time_label;
    document.getElementById('main-btn-start').innerText = t.start_btn;
    document.getElementById('skip-btn').innerText = t.skip;
    
    // แปล Placeholder ช่องกรอกเวลา (New)
    document.getElementById('custom-time').placeholder = t.time_ph;

    // แปลชื่อวิชา
    document.getElementById('btn-thai').innerText = t.sub_thai;
    document.getElementById('btn-sci').innerText = t.sub_sci;
    document.getElementById('btn-soc').innerText = t.sub_soc;
    const btnMath = document.getElementById('btn-math');
    if (btnMath) btnMath.innerText = t.sub_math;
    
    localStorage.setItem('gs_lang', lang);
}

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
    } else { alert("ข้อมูลไม่ถูกต้อง / Wrong Info"); }
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
    const savedLang = localStorage.getItem('gs_lang') || 'th';
    changeLang(savedLang);

    if (session) {
        currentUser = session;
        if (currentUser === "Admin007") showAdminPage();
        else showMainApp();
    }
};

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
        new Notification("🌿 Greenstudy", { body: `Time: ${time}` });
    }
    document.getElementById('setup-page').style.display = "none";
    document.getElementById('study-page').style.display = "block";
}

function selectSubject(s) {
    selectedSubject = s;
    document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('selected'));
    const ids = { 'ไทย': 'btn-thai', 'วิทย์': 'btn-sci', 'สังคม': 'btn-soc', 'คณิต': 'btn-math' };
    if (ids[s]) document.getElementById(ids[s]).classList.add('selected');
}

// ลบฟังก์ชัน setTime ออก เพราะเปลี่ยนมาใช้ input แทน

function startCountdown() {
    // อ่านค่าจาก input แทน
    const timeInput = document.getElementById('custom-time').value;
    
    if (!selectedSubject || !timeInput || timeInput <= 0) return alert("กรุณาเลือกวิชาและระบุเวลาให้ถูกต้อง! / Please select subject and time!");
    
    timeLeft = Math.floor(timeInput * 60); // แปลงนาทีเป็นวินาที
    
    addLog("เริ่มเรียน");
    document.getElementById('main-btn-start').style.display = "none";
    document.getElementById('skip-btn').style.display = "block";
    
    // อัปเดตหน้าจอทันที 1 ครั้งก่อน setInterval ทำงาน
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('time-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;

    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            document.getElementById('time-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        } else { finishStudy("เรียนจบ"); }
    }, 1000);
}

function finishStudy(status) {
    clearInterval(timer);
    addLog(status);
    document.getElementById('alarm-sound').play();
    
    let targetUrl = "";
    if (selectedSubject === "ไทย") targetUrl = THAI_FORM_URL;
    else if (selectedSubject === "วิทย์") targetUrl = SCIENCE_FORM_URL;
    else if (selectedSubject === "สังคม") targetUrl = SOCIAL_FORM_URL;
    else if (selectedSubject === "คณิต") targetUrl = MATH_FORM_URL; 
    else targetUrl = SCIENCE_FORM_URL;
    
    window.open(targetUrl, '_blank');
    resetToSetupPage();
}

function resetToSetupPage() {
    document.getElementById('study-page').style.display = "none";
    document.getElementById('setup-page').style.display = "block";
    selectedSubject = "";
    timeLeft = 0;
    document.getElementById('time-display').innerText = "00:00";
    document.getElementById('custom-time').value = ""; // ล้างค่าในช่องกรอกเวลา
    document.getElementById('main-btn-start').style.display = "block";
    document.getElementById('skip-btn').style.display = "none";
    document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('selected'));
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
        user: currentUser, subject: selectedSubject || "N/A",
        duration: timeLeft, action: action, time: new Date().toLocaleString()
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
    alert("Success!"); toggleAuth(false);
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

function clearLogs() { if(confirm("Clear logs?")) { localStorage.removeItem('gs_activity_logs'); renderAdminDashboard(); } }

function requestNotif() {
    Notification.requestPermission().then(perm => {
        if (perm === "granted") alert("✅ OK!");
    });
}

function skipToQuiz() { if(confirm("Skip to Quiz?")) finishStudy("กดข้าม"); }