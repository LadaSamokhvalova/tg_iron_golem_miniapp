// ===== ИНИЦИАЛИЗАЦИЯ =====
const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user;

// Проверяем, принял ли пользователь правила
if (localStorage.getItem('rulesAccepted') !== 'true') {
    // Если нет - отправляем обратно
    window.location.href = 'index.html';
}

// ===== ГЕНЕРАЦИЯ КАПЧИ =====
function generateCaptcha() {
    const emojis = ['🍎', '🍋', '🍇', '🍉', '🍓', '🍑', '🍒', '🥝', '🍍', '🥭'];
    const count = 4 + Math.floor(Math.random() * 2);
    const selected = [];
    const shuffled = [...emojis].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < count; i++) {
        selected.push(shuffled[i]);
    }
    
    return selected;
}

// ===== СОСТОЯНИЕ =====
let captchaSequence = [];
let userSelection = [];
let isCaptchaCompleted = false;

// ===== DOM ЭЛЕМЕНТЫ =====
const captchaString = document.getElementById('captchaString');
const captchaInput = document.getElementById('captchaInput');
const captchaOptions = document.getElementById('captchaOptions');
const captchaStatus = document.getElementById('captchaStatus');
const checkCaptchaBtn = document.getElementById('checkCaptchaBtn');
const resetCaptchaBtn = document.getElementById('resetCaptchaBtn');

// ===== ИНИЦИАЛИЗАЦИЯ КАПЧИ =====
function initCaptcha() {
    captchaSequence = generateCaptcha();
    userSelection = [];
    isCaptchaCompleted = false;
    
    if (captchaString) {
        captchaString.innerHTML = captchaSequence.map(e => `<span>${e}</span>`).join('');
        captchaString.style.opacity = '1';
    }
    
    if (captchaInput) {
        captchaInput.innerHTML = '';
        captchaInput.classList.remove('filled');
    }
    
    const options = [...captchaSequence];
    const extraEmojis = ['🍌', '🥑', '🍊', '🥥', '🍐', '🥝', '🍅', '🌽'];
    const shuffledExtra = extraEmojis.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 2; i++) {
        if (shuffledExtra[i] && !options.includes(shuffledExtra[i])) {
            options.push(shuffledExtra[i]);
        }
    }
    options.sort(() => Math.random() - 0.5);
    
    if (captchaOptions) {
        captchaOptions.innerHTML = '';
        options.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'btn-emoji';
            btn.textContent = emoji;
            btn.dataset.emoji = emoji;
            btn.addEventListener('click', () => handleEmojiClick(btn, emoji));
            captchaOptions.appendChild(btn);
        });
    }
    
    if (captchaStatus) {
        captchaStatus.textContent = '👆 Запомните последовательность эмодзи';
        captchaStatus.className = 'captcha-status';
    }
    
    if (checkCaptchaBtn) {
        checkCaptchaBtn.disabled = true;
    }
    
    // Скрываем строку через 3 секунды
    setTimeout(() => {
        if (captchaString) {
            captchaString.style.opacity = '0.3';
            captchaString.innerHTML = '❓ Запомнили? Выберите в том же порядке';
            setTimeout(() => {
                if (captchaString) {
                    captchaString.style.opacity = '1';
                }
            }, 300);
        }
        if (captchaStatus) {
            captchaStatus.textContent = '👆 Выберите эмодзи в том же порядке';
        }
    }, 3000);
}

function handleEmojiClick(btn, emoji) {
    if (!btn || btn.classList.contains('used') || isCaptchaCompleted) return;
    
    userSelection.push(emoji);
    
    if (captchaInput) {
        const span = document.createElement('span');
        span.className = 'emoji-item';
        span.textContent = emoji;
        captchaInput.appendChild(span);
        captchaInput.classList.add('filled');
    }
    
    btn.classList.add('used');
    
    if (userSelection.length === captchaSequence.length) {
        if (checkCaptchaBtn) {
            checkCaptchaBtn.disabled = false;
        }
        if (captchaStatus) {
            captchaStatus.textContent = '✅ Все выбрано! Нажмите "Проверить"';
            captchaStatus.className = 'captcha-status success';
        }
    } else {
        if (captchaStatus) {
            captchaStatus.textContent = `⏳ Выбрано: ${userSelection.length}/${captchaSequence.length}`;
            captchaStatus.className = 'captcha-status';
        }
    }
}

function checkCaptcha() {
    const isCorrect = userSelection.every((emoji, index) => emoji === captchaSequence[index]);
    
    if (isCorrect) {
        if (captchaStatus) {
            captchaStatus.textContent = '🎉 Отлично! Капча пройдена!';
            captchaStatus.className = 'captcha-status success';
        }
        isCaptchaCompleted = true;
        if (checkCaptchaBtn) {
            checkCaptchaBtn.disabled = true;
        }
        
        document.querySelectorAll('.btn-emoji').forEach(btn => {
            if (btn.dataset.emoji && captchaSequence.includes(btn.dataset.emoji)) {
                btn.classList.add('correct');
            }
        });
        
        // Сохраняем в localStorage, что капча пройдена
        localStorage.setItem('captchaPassed', 'true');
        
        // Отправляем событие в бот
        tg.sendData(JSON.stringify({
            action: 'captcha_passed',
            user: user?.id,
            username: user?.username
        }));
        
        // Переходим на главную страницу через 1.5 секунды
        setTimeout(() => {
            window.location.href = 'end.html';
        }, 1500);
    } else {
        if (captchaStatus) {
            captchaStatus.textContent = '❌ Неправильный порядок! Попробуйте снова';
            captchaStatus.className = 'captcha-status error';
        }
        
        if (captchaInput) {
            captchaInput.style.borderColor = '#f44336';
            setTimeout(() => {
                if (captchaInput) {
                    captchaInput.style.borderColor = '';
                }
            }, 1000);
        }
        
        setTimeout(() => {
            resetCaptcha();
        }, 1500);
    }
}

function resetCaptcha() {
    userSelection = [];
    isCaptchaCompleted = false;
    
    if (captchaInput) {
        captchaInput.innerHTML = '';
        captchaInput.classList.remove('filled');
    }
    
    if (checkCaptchaBtn) {
        checkCaptchaBtn.disabled = true;
    }
    
    document.querySelectorAll('.btn-emoji').forEach(btn => {
        btn.classList.remove('used', 'correct', 'wrong');
    });
    
    if (captchaString) {
        captchaString.style.opacity = '1';
        captchaString.innerHTML = captchaSequence.map(e => `<span>${e}</span>`).join('');
    }
    
    if (captchaStatus) {
        captchaStatus.textContent = '🔄 Начните заново!';
        captchaStatus.className = 'captcha-status';
    }
    
    setTimeout(() => {
        if (captchaStatus) {
            captchaStatus.textContent = '👆 Выберите эмодзи в том же порядке';
        }
        setTimeout(() => {
            if (captchaString) {
                captchaString.style.opacity = '0.3';
                captchaString.innerHTML = '❓ Запомнили?';
                setTimeout(() => {
                    if (captchaString) {
                        captchaString.style.opacity = '1';
                    }
                }, 300);
            }
        }, 2000);
    }, 1000);
}

// ===== ОБРАБОТЧИКИ =====
if (checkCaptchaBtn) {
    checkCaptchaBtn.addEventListener('click', checkCaptcha);
}

if (resetCaptchaBtn) {
    resetCaptchaBtn.addEventListener('click', resetCaptcha);
}

// ===== ЗАПУСК =====
initCaptcha();

console.log('✅ Страница капчи загружена!');
console.log('👤 Пользователь:', user);