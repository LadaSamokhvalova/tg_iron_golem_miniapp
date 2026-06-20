// ===== ИНИЦИАЛИЗАЦИЯ =====
const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user;

// Проверяем, принял ли пользователь правила
if (localStorage.getItem('rulesAccepted') !== 'true') {
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

// ===== DOM ЭЛЕМЕНТЫ (с проверкой) =====
const captchaString = document.getElementById('captchaString');
const captchaInput = document.getElementById('captchaInput');
const captchaOptions = document.getElementById('captchaOptions');
const captchaStatus = document.getElementById('captchaStatus');
const checkCaptchaBtn = document.getElementById('checkCaptchaBtn');
const resetCaptchaBtn = document.getElementById('resetCaptchaBtn');

// Проверяем наличие элементов
console.log('🔍 Проверка элементов капчи:');
console.log('captchaString:', captchaString);
console.log('captchaInput:', captchaInput);
console.log('captchaOptions:', captchaOptions);
console.log('captchaStatus:', captchaStatus);
console.log('checkCaptchaBtn:', checkCaptchaBtn);
console.log('resetCaptchaBtn:', resetCaptchaBtn);

// ===== ИНИЦИАЛИЗАЦИЯ КАПЧИ =====
function initCaptcha() {
    console.log('🚀 Запуск initCaptcha()');
    
    // Генерируем последовательность
    captchaSequence = generateCaptcha();
    userSelection = [];
    isCaptchaCompleted = false;
    
    console.log('📝 Последовательность капчи:', captchaSequence);
    
    // 1. Показываем строку с эмодзи
    if (captchaString) {
        captchaString.innerHTML = captchaSequence.map(e => `<span>${e}</span>`).join('');
        captchaString.style.opacity = '1';
        console.log('✅ Строка капчи отображена');
    } else {
        console.error('❌ captchaString не найден!');
    }
    
    // 2. Очищаем поле ввода
    if (captchaInput) {
        captchaInput.innerHTML = '';
        captchaInput.classList.remove('filled');
        console.log('✅ Поле ввода очищено');
    } else {
        console.error('❌ captchaInput не найден!');
    }
    
    // 3. Создаем кнопки с эмодзи
    const options = [...captchaSequence];
    const extraEmojis = ['🍌', '🥑', '🍊', '🥥', '🍐', '🥝', '🍅', '🌽'];
    const shuffledExtra = extraEmojis.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 2; i++) {
        if (shuffledExtra[i] && !options.includes(shuffledExtra[i])) {
            options.push(shuffledExtra[i]);
        }
    }
    options.sort(() => Math.random() - 0.5);
    
    console.log('🔘 Доступные эмодзи для выбора:', options);
    
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
        console.log(`✅ Создано ${options.length} кнопок с эмодзи`);
    } else {
        console.error('❌ captchaOptions не найден!');
    }
    
    // 4. Обновляем статус
    if (captchaStatus) {
        captchaStatus.textContent = '👆 Запомните последовательность эмодзи';
        captchaStatus.className = 'captcha-status';
        console.log('✅ Статус обновлен');
    }
    
    // 5. Блокируем кнопку проверки
    if (checkCaptchaBtn) {
        checkCaptchaBtn.disabled = true;
        console.log('✅ Кнопка проверки заблокирована');
    }
    
    // 6. Скрываем строку через 3 секунды
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
        console.log('⏰ Строка скрыта, можно выбирать');
    }, 3000);
    
    console.log('✅ initCaptcha() завершен');
}

function handleEmojiClick(btn, emoji) {
    console.log('👆 Нажат эмодзи:', emoji);
    
    if (!btn || btn.classList.contains('used') || isCaptchaCompleted) {
        console.log('⛔ Кнопка уже использована или капча завершена');
        return;
    }
    
    userSelection.push(emoji);
    console.log('📊 Текущий выбор:', userSelection);
    
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
        console.log('✅ Все эмодзи выбраны!');
    } else {
        if (captchaStatus) {
            captchaStatus.textContent = `⏳ Выбрано: ${userSelection.length}/${captchaSequence.length}`;
            captchaStatus.className = 'captcha-status';
        }
    }
}

function checkCaptcha() {
    console.log('🔍 Проверка капчи...');
    console.log('Ожидалось:', captchaSequence);
    console.log('Пользователь выбрал:', userSelection);
    
    const isCorrect = userSelection.every((emoji, index) => emoji === captchaSequence[index]);
    
    if (isCorrect) {
        console.log('✅ Капча пройдена!');
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
        
        localStorage.setItem('captchaPassed', 'true');
        
        tg.sendData(JSON.stringify({
            action: 'captcha_passed',
            user: user?.id,
            username: user?.username
        }));
        
        setTimeout(() => {
            window.location.href = 'end.html';
        }, 1500);
    } else {
        console.log('❌ Капча не пройдена!');
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
    console.log('🔄 Сброс капчи');
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
    console.log('✅ Обработчик checkCaptchaBtn добавлен');
}

if (resetCaptchaBtn) {
    resetCaptchaBtn.addEventListener('click', resetCaptcha);
    console.log('✅ Обработчик resetCaptchaBtn добавлен');
}

// ===== ЗАПУСК =====
// Ждем полной загрузки DOM fdsfdf
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM загружен, запускаем капчу');
        initCaptcha();
    });
} else {
    console.log('📄 DOM уже загружен, запускаем капчу');
    initCaptcha();
}

console.log('✅ Страница капчи загружена!');
console.log('👤 Пользователь:', user);