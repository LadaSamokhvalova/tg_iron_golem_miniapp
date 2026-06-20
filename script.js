// ===== ИНИЦИАЛИЗАЦИЯ =====
const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user;

// ===== ПРАВИЛА =====
const rules = [
    { emoji: '🤝', text: 'Будьте вежливы и уважайте друг друга' },
    { emoji: '🚫', text: 'Запрещен спам, ссылки, реклама, флуд, бессвязные выкрики' },
    { emoji: '🔞', text: 'Запрещен контент 18+ и оскорбления' },
    { emoji: '📢', text: 'Обсуждайте только темы, связанные с чатом' },
    { emoji: '👤', text: 'Один аккаунт — один участник' },
    { emoji: '📸', text: 'Не публикуйте личные данные других людей' },
    { emoji: '💬', text: 'Приветствуются комментарии с вашим мнением, опытом или впечатлениями. Мы рады конструктивным дисскусиям и хорошей орфографии :)' }
];

// ===== ГЕНЕРАЦИЯ КАПЧИ =====
function generateCaptcha() {
    const emojis = ['🍎', '🍋', '🍇', '🍉', '🍓', '🍑', '🍒', '🥝', '🍍', '🥭'];
    const count = 4 + Math.floor(Math.random() * 2); // 4 или 5 эмодзи
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
const rulesPage = document.getElementById('rulesPage');
const captchaPage = document.getElementById('captchaPage');
const mainPage = document.getElementById('mainPage');

const rulesList = document.getElementById('rulesList');
const agreeBtn = document.getElementById('agreeBtn');
const scrollHint = document.getElementById('scrollHint');

const captchaString = document.getElementById('captchaString');
const captchaInput = document.getElementById('captchaInput');
const captchaOptions = document.getElementById('captchaOptions');
const captchaStatus = document.getElementById('captchaStatus');
const checkCaptchaBtn = document.getElementById('checkCaptchaBtn');
const resetCaptchaBtn = document.getElementById('resetCaptchaBtn');

const userNameEl = document.getElementById('userName');
const avatarEl = document.getElementById('avatar');
const userStatusEl = document.getElementById('userStatus');
const welcomeText = document.getElementById('welcomeText');
const actionBtn = document.getElementById('actionBtn');
const counterEl = document.getElementById('counter');
const logoutBtn = document.getElementById('logoutBtn');

let counter = 0;

// ===== ФУНКЦИИ НАВИГАЦИИ =====
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    // Прокрутка вверх при смене страницы
    document.getElementById(pageId).scrollTop = 0;
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРАВИЛ =====
function renderRules() {
    rulesList.innerHTML = '';
    rules.forEach((rule, index) => {
        const div = document.createElement('div');
        div.className = 'rule-item';
        div.innerHTML = `
            <span class="emoji">${rule.emoji}</span>
            <span class="text">${rule.text}</span>
        `;
        rulesList.appendChild(div);
        
        // Анимация появления с задержкой
        div.style.opacity = '0';
        div.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            div.style.transition = 'all 0.3s ease';
            div.style.opacity = '1';
            div.style.transform = 'translateX(0)';
        }, 100 + index * 50);
    });
    
    // Отслеживание прокрутки для активации кнопки
    rulesList.addEventListener('scroll', checkScrollComplete);
    rulesList.addEventListener('touchmove', checkScrollComplete);
}

function checkScrollComplete() {
    const el = rulesList;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;
    
    if (isAtBottom) {
        agreeBtn.disabled = false;
        scrollHint.style.display = 'none';
        agreeBtn.textContent = '✅ Я прочитал(а), я согласен(на)';
    } else {
        agreeBtn.disabled = true;
        scrollHint.style.display = 'block';
        agreeBtn.textContent = '📖 Я прочитал(а), я согласен(на)';
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ КАПЧИ =====
function initCaptcha() {
    captchaSequence = generateCaptcha();
    userSelection = [];
    isCaptchaCompleted = false;
    
    // Отображаем строку для запоминания
    captchaString.innerHTML = captchaSequence.map(e => `<span>${e}</span>`).join('');
    
    // Очищаем ввод
    captchaInput.innerHTML = '';
    captchaInput.classList.remove('filled');
    
    // Создаем кнопки с эмодзи (в случайном порядке)
    const options = [...captchaSequence];
    // Добавляем лишние эмодзи для сложности
    const extraEmojis = ['🍌', '🥑', '🍊', '🥥', '🍐', '🥝', '🍅', '🌽'];
    const shuffledExtra = extraEmojis.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 2; i++) {
        if (shuffledExtra[i] && !options.includes(shuffledExtra[i])) {
            options.push(shuffledExtra[i]);
        }
    }
    // Перемешиваем
    options.sort(() => Math.random() - 0.5);
    
    captchaOptions.innerHTML = '';
    options.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'btn-emoji';
        btn.textContent = emoji;
        btn.dataset.emoji = emoji;
        btn.addEventListener('click', () => handleEmojiClick(btn, emoji));
        captchaOptions.appendChild(btn);
    });
    
    captchaStatus.textContent = '👆 Выберите эмодзи в том же порядке';
    captchaStatus.className = 'captcha-status';
    checkCaptchaBtn.disabled = true;
    
    // Скрываем строку через 3 секунды
    setTimeout(() => {
        captchaString.style.opacity = '3';
        captchaString.style.transition = 'opacity 0.5s ease';
        captchaString.innerHTML = '❓ Запомнили?';
        setTimeout(() => {
            captchaString.style.opacity = '1';
        }, 300);
    }, 3000);
}

function handleEmojiClick(btn, emoji) {
    if (btn.classList.contains('used') || isCaptchaCompleted) return;
    
    // Добавляем в выбор пользователя
    userSelection.push(emoji);
    
    // Отображаем в поле ввода
    const span = document.createElement('span');
    span.className = 'emoji-item';
    span.textContent = emoji;
    captchaInput.appendChild(span);
    captchaInput.classList.add('filled');
    
    // Отмечаем кнопку как использованную
    btn.classList.add('used');
    
    // Проверяем, не собрана ли вся последовательность
    if (userSelection.length === captchaSequence.length) {
        checkCaptchaBtn.disabled = false;
        captchaStatus.textContent = '✅ Все выбрано! Нажмите "Проверить"';
        captchaStatus.className = 'captcha-status success';
    } else {
        captchaStatus.textContent = `⏳ Выбрано: ${userSelection.length}/${captchaSequence.length}`;
        captchaStatus.className = 'captcha-status';
    }
}

function checkCaptcha() {
    const isCorrect = userSelection.every((emoji, index) => emoji === captchaSequence[index]);
    
    if (isCorrect) {
        captchaStatus.textContent = '🎉 Отлично! Капча пройдена!';
        captchaStatus.className = 'captcha-status success';
        isCaptchaCompleted = true;
        checkCaptchaBtn.disabled = true;
        
        // Подсвечиваем правильные кнопки
        document.querySelectorAll('.btn-emoji').forEach(btn => {
            if (btn.dataset.emoji && captchaSequence.includes(btn.dataset.emoji)) {
                btn.classList.add('correct');
            }
        });
        
        // Переход на основную страницу через 1.5 секунды
        setTimeout(() => {
            showMainPage();
        }, 1500);
    } else {
        captchaStatus.textContent = '❌ Неправильный порядок! Попробуйте снова';
        captchaStatus.className = 'captcha-status error';
        
        // Анимация ошибки
        captchaInput.style.borderColor = '#f44336';
        setTimeout(() => {
            captchaInput.style.borderColor = '';
        }, 1000);
        
        // Сбрасываем через 1.5 секунды
        setTimeout(() => {
            resetCaptcha();
        }, 1500);
    }
}

function resetCaptcha() {
    // Сбрасываем состояние
    userSelection = [];
    isCaptchaCompleted = false;
    captchaInput.innerHTML = '';
    captchaInput.classList.remove('filled');
    checkCaptchaBtn.disabled = true;
    
    // Сбрасываем кнопки
    document.querySelectorAll('.btn-emoji').forEach(btn => {
        btn.classList.remove('used', 'correct', 'wrong');
    });
    
    // Показываем строку снова
    captchaString.style.opacity = '1';
    captchaString.innerHTML = captchaSequence.map(e => `<span>${e}</span>`).join('');
    captchaStatus.textContent = '🔄 Начните заново!';
    captchaStatus.className = 'captcha-status';
    
    setTimeout(() => {
        captchaStatus.textContent = '👆 Выберите эмодзи в том же порядке';
        // Скрываем строку снова через 2 секунды
        setTimeout(() => {
            captchaString.style.opacity = '0.3';
            captchaString.innerHTML = '❓ Запомнили?';
            setTimeout(() => {
                captchaString.style.opacity = '1';
            }, 300);
        }, 2000);
    }, 1000);
}

// ===== ОСНОВНАЯ СТРАНИЦА =====
function showMainPage() {
    showPage('mainPage');
    
    if (user) {
        const firstName = user.first_name || 'Гость';
        const lastName = user.last_name || '';
        const username = user.username || '';
        
        userNameEl.textContent = `${firstName} ${lastName}`.trim();
        avatarEl.textContent = getInitials(firstName, lastName);
        welcomeText.innerHTML = `
            Рады видеть тебя, <strong>${firstName}</strong>! 🎉<br>
            <span style="font-size:14px; color: var(--tg-theme-hint-color, #999);">
                ${username ? `@${username}` : 'Добро пожаловать!'}
            </span>
        `;
    }
    
    // Отправляем событие в бот о успешной верификации
    tg.sendData(JSON.stringify({
        action: 'verified',
        user: user?.id,
        username: user?.username
    }));
}

function getInitials(firstName, lastName) {
    let initials = firstName.charAt(0).toUpperCase();
    if (lastName && lastName.length > 0) {
        initials += lastName.charAt(0).toUpperCase();
    }
    return initials;
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====

// 1. Согласие с правилами
agreeBtn.addEventListener('click', () => {
    showPage('captchaPage');
    initCaptcha();
});

// 2. Проверка капчи
checkCaptchaBtn.addEventListener('click', checkCaptcha);

// 3. Сброс капчи
resetCaptchaBtn.addEventListener('click', resetCaptcha);

// 4. Основная кнопка
actionBtn.addEventListener('click', () => {
    counter++;
    counterEl.textContent = counter;
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    if (counter % 5 === 0) {
        tg.showAlert(`🎉 Ты нажал ${counter} раз!`);
    }
    
    tg.sendData(JSON.stringify({
        action: 'button_click',
        count: counter,
        user: user?.id
    }));
});

// 5. Выход
logoutBtn.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
        counter = 0;
        counterEl.textContent = '0';
        showPage('rulesPage');
        // Сбрасываем состояние правил
        rulesList.scrollTop = 0;
        agreeBtn.disabled = true;
        scrollHint.style.display = 'block';
        agreeBtn.textContent = '📖 Я прочитал(а), я согласен(на)';
    }
});

// ===== ИНИЦИАЛИЗАЦИЯ =====
renderRules();
showPage('rulesPage');

// Настройка главной кнопки
tg.MainButton.setText('📋 Правила');
tg.MainButton.show();

tg.MainButton.onClick(() => {
    // Прокрутка к правилам
    rulesList.scrollTop = 0;
});

// Обработка темы
tg.onEvent('themeChanged', () => {
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#0088cc');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f5f5f5');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
});

console.log('✅ Мини-приложение загружено!');
console.log('👤 Пользователь:', user);