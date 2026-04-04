/* script.js */
document.addEventListener('DOMContentLoaded', () => {
    // ── Elements ──
    const inHour = document.getElementById('inHour');
    const inMinute = document.getElementById('inMinute');
    const amBtn = document.getElementById('amBtn');
    const pmBtn = document.getElementById('pmBtn');
    const nowBtn = document.getElementById('nowBtn');
    const resetBtn = document.getElementById('resetBtn');
    const checkOutDisplay = document.getElementById('checkOutTime');

    const resultSection = document.getElementById('resultSection');
    const resultIcon = document.getElementById('resultIcon');
    const validationMsg = document.getElementById('validationMsg');
    const liveDateEl = document.getElementById('liveDate');
    const liveTimeEl = document.getElementById('liveTime');
    const permissionRadios = document.getElementsByName('permission');
    const leaveRadios = document.getElementsByName('leave');

    // ── Constants ──
    const HOURS_TO_ADD = 9;
    const MINUTES_TO_ADD = 30;

    // ── Alert state ──
    let checkOutDateObj = null;
    let hasAlerted = false;
    let alertInterval = null;

    // ════════════════════════════════════
    // 1. LIVE CLOCK
    // ════════════════════════════════════
    function updateLiveClock() {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        liveDateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

        let h = now.getHours();
        let m = now.getMinutes();
        let s = now.getSeconds();
        const ap = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        liveTimeEl.textContent = `${h}:${pad(m)}:${pad(s)} ${ap}`;
    }
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    // ════════════════════════════════════
    // 2. SMART INPUT & AUTO-FORMAT
    // ════════════════════════════════════

    // Only allow digits
    function filterDigits(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    }

    // Auto-format: pad single digit on blur, clamp values, auto-tab
    inHour.addEventListener('input', (e) => {
        filterDigits(e);
        let v = e.target.value;
        if (v.length >= 2) {
            let num = parseInt(v, 10);
            if (num > 12) e.target.value = '12';
            if (num < 1) e.target.value = '1';
            inMinute.focus();
        }
        autoCalculate();
    });

    inHour.addEventListener('blur', () => {
        let v = inHour.value;
        if (v === '') return;
        let num = parseInt(v, 10);
        if (isNaN(num) || num < 1) { inHour.value = ''; return; }
        if (num > 12) num = 12;
        inHour.value = pad(num);
        autoCalculate();
    });

    inMinute.addEventListener('input', (e) => {
        filterDigits(e);
        let v = e.target.value;
        if (v.length >= 2) {
            let num = parseInt(v, 10);
            if (num > 59) e.target.value = '59';
        }
        autoCalculate();
    });

    inMinute.addEventListener('blur', () => {
        let v = inMinute.value;
        if (v === '') return;
        let num = parseInt(v, 10);
        if (isNaN(num) || num < 0) { inMinute.value = ''; return; }
        if (num > 59) num = 59;
        inMinute.value = pad(num);
        autoCalculate();
    });

    // ════════════════════════════════════
    // 3. AM/PM TOGGLE
    // ════════════════════════════════════
    amBtn.addEventListener('click', () => {
        amBtn.classList.add('active');
        pmBtn.classList.remove('active');
        autoCalculate();
    });
    pmBtn.addEventListener('click', () => {
        pmBtn.classList.add('active');
        amBtn.classList.remove('active');
        autoCalculate();
    });

    // ════════════════════════════════════
    // 4. NOW BUTTON
    // ════════════════════════════════════
    nowBtn.addEventListener('click', () => {
        const now = new Date();
        let h = now.getHours();
        const m = now.getMinutes();
        const isPM = h >= 12;
        h = h % 12 || 12;

        inHour.value = pad(h);
        inMinute.value = pad(m);

        if (isPM) {
            pmBtn.classList.add('active');
            amBtn.classList.remove('active');
        } else {
            amBtn.classList.add('active');
            pmBtn.classList.remove('active');
        }

        // Animate the inputs
        inHour.classList.add('valid');
        inMinute.classList.add('valid');

        autoCalculate();
    });

    // ════════════════════════════════════
    // 5. OPTIONS (Leave / Permission)
    // ════════════════════════════════════
    permissionRadios.forEach(r => r.addEventListener('change', autoCalculate));
    leaveRadios.forEach(r => r.addEventListener('change', autoCalculate));

    // ════════════════════════════════════
    // 6. VALIDATION
    // ════════════════════════════════════
    function validate() {
        const hVal = inHour.value.trim();
        const mVal = inMinute.value.trim();

        // Nothing entered yet
        if (hVal === '' && mVal === '') {
            clearValidation();
            return null;
        }

        const h = parseInt(hVal, 10);
        const m = parseInt(mVal, 10);

        // Partial input
        if (hVal === '' || mVal === '') {
            setValidation('Enter both hour and minute', 'error');
            return null;
        }

        // Invalid hour
        if (isNaN(h) || h < 1 || h > 12) {
            setValidation('Hour must be 1–12', 'error');
            inHour.classList.add('invalid');
            inHour.classList.remove('valid');
            return null;
        }

        // Invalid minute
        if (isNaN(m) || m < 0 || m > 59) {
            setValidation('Minute must be 0–59', 'error');
            inMinute.classList.add('invalid');
            inMinute.classList.remove('valid');
            return null;
        }

        // All good
        inHour.classList.remove('invalid');
        inMinute.classList.remove('invalid');
        inHour.classList.add('valid');
        inMinute.classList.add('valid');

        return { hour: h, minute: m };
    }

    function setValidation(msg, type) {
        validationMsg.textContent = msg;
        validationMsg.className = 'validation-msg ' + type;
    }

    function clearValidation() {
        validationMsg.textContent = '';
        validationMsg.className = 'validation-msg';
        inHour.classList.remove('invalid', 'valid');
        inMinute.classList.remove('invalid', 'valid');
    }

    // ════════════════════════════════════
    // 7. AUTO-CALCULATE
    // ════════════════════════════════════
    function autoCalculate() {
        const result = validate();
        if (!result) {
            // Reset result display if invalid
            checkOutDisplay.textContent = '--:-- --';
            checkOutDisplay.className = 'result-value';
            resultIcon.className = 'result-icon';
            resultSection.classList.remove('finished');
            return;
        }

        const { hour, minute } = result;
        const isPM = pmBtn.classList.contains('active');

        // Convert to 24h
        let hour24 = hour;
        if (isPM && hour !== 12) hour24 = hour + 12;
        if (!isPM && hour === 12) hour24 = 0;

        // Get deductions
        let permHours = 0;
        const selectedPerm = document.querySelector('input[name="permission"]:checked');
        if (selectedPerm) permHours = parseFloat(selectedPerm.value);

        let leaveHours = 0;
        const selectedLeave = document.querySelector('input[name="leave"]:checked');
        if (selectedLeave) leaveHours = parseFloat(selectedLeave.value);

        const totalShiftMins = (HOURS_TO_ADD * 60) + MINUTES_TO_ADD;
        const deductedMins = (permHours + leaveHours) * 60;
        const actualMins = totalShiftMins - deductedMins;

        // Calculate check-out
        const checkInDate = new Date();
        checkInDate.setHours(hour24, minute, 0, 0);

        const checkOutDate = new Date(checkInDate.getTime());
        checkOutDate.setMinutes(checkInDate.getMinutes() + actualMins);

        const formatted = formatTime12(checkOutDate);

        let dayNote = '';
        if (checkOutDate.getDate() !== checkInDate.getDate()) {
            dayNote = ' (Next Day)';
        }



        // Build detail string
        let details = [];
        if (leaveHours === 4) details.push('Half Day');
        if (permHours > 0) details.push(`${permHours}h Permission`);

        // Update result UI
        checkOutDisplay.textContent = formatted;
        checkOutDisplay.className = 'result-value active';
        resultIcon.className = 'result-icon active';
        resultSection.classList.remove('finished');


        setValidation('✓ Shift calculated', 'success');

        // ── Alert setup ──
        checkOutDateObj = checkOutDate;
        if (new Date() < checkOutDateObj) {
            hasAlerted = false;
        } else {
            hasAlerted = true;
        }

        if (!alertInterval) {
            alertInterval = setInterval(() => {
                if (checkOutDateObj && !hasAlerted) {
                    if (new Date() >= checkOutDateObj) {
                        hasAlerted = true;
                        checkOutDisplay.className = 'result-value finished';
                        resultIcon.className = 'result-icon finished';
                        resultSection.classList.add('finished');
                        setTimeout(() => alert("Time's up! Your shift is over."), 100);
                    }
                }
            }, 1000);
        }
    }

    // ════════════════════════════════════
    // 8. RESULT STATUS HELPER
    // ════════════════════════════════════


    // ════════════════════════════════════
    // 9. RESET
    // ════════════════════════════════════
    resetBtn.addEventListener('click', () => {
        inHour.value = '';
        inMinute.value = '';
        amBtn.classList.add('active');
        pmBtn.classList.remove('active');
        checkOutDisplay.textContent = '--:-- --';
        checkOutDisplay.className = 'result-value';
        resultIcon.className = 'result-icon';
        resultSection.classList.remove('finished');
        clearValidation();
        checkOutDateObj = null;

        document.getElementById('leave0').checked = true;
        document.getElementById('perm0').checked = true;
    });

    // ════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════
    function pad(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    function formatTime12(date) {
        let h = date.getHours();
        let m = date.getMinutes();
        const ap = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${pad(m)} ${ap}`;
    }

    // ════════════════════════════════════
    // DARK MODE TOGGLE
    // ════════════════════════════════════
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Restore saved theme on load
    const savedTheme = localStorage.getItem('timeCheckerTheme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';

        // Animate toggle button spin
        themeToggle.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, color 0.4s ease, background-color 0.4s ease';
        themeToggle.style.transform = 'rotate(360deg) scale(1.15)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 450);

        html.setAttribute('data-theme', next);
        localStorage.setItem('timeCheckerTheme', next);
    });
});
