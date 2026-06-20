// ===== ИНИЦИАЛИЗАЦИЯ =====
const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user;

// ===== ПРАВИЛА =====
const rules = [
    { emoji: '🤝', text: 'Будьте вежливы и уважайте друг друга' },
    { emoji: '🚫', text: 'Запрещен спам, реклама и флуд' },
    { emoji: '🔞', text: 'Запрещен контент 18+ и оскорбления' },
    { emoji: '📢', text: 'Обсуждайте только темы, связанные с чатом' },
    { emoji: '🤖', text: 'Не используйте ботов для накрутки' },
    { emoji: '👤', text: 'Один аккаунт — один участник' },
    { emoji: '📸', text: 'Не публикуйте личные данные других' },
    { emoji: '💬', text: 'Используйте @username для упоминаний' },
];

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
let isCaptchaStringHidden = false;

// ===== ПОЛУЧАЕМ ЭЛЕМЕНТЫ =====
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

// Проверяем, что все элементы найдены
if (!checkCaptchaBtn) {
    console.error('❌ Кнопка checkCaptchaBtn не найдена в DOM!');
}

let counter = 0;

// ===== ФУНКЦИИ НАВИГАЦИИ =====
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
        page.scrollTop = 0;
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРАВИЛ =====
function renderRules() {
    if (!rulesList) return;
    
    rulesList.innerHTML = '';
    rules.forEach((rule, index) => {
        const div = document.createElement('div');
        div.className = 'rule-item';
        div.innerHTML = `
            <span class="emoji">${rule.emoji}</span>
            <span class="text">${rule.text}</span>
        `;
        rulesList.appendChild(div);
        
        div.style.opacity = '0';
        div.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            div.style.transition = 'all 0.3s ease';
            div.style.opacity = '1';
            div.style.transform = 'translateX(0)';
        }, 100 + index * 50);
    });
    
    if (rulesList) {
        rulesList.addEventListener('scroll', checkScrollComplete);
        rulesList.addEventListener('touchmove', checkScrollComplete);
    }
}

function checkScrollComplete() {
    if (!rulesList || !agreeBtn || !scrollHint) return;
    
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
    isCaptchaStringHidden = false;
    
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
            isCaptchaStringHidden = true;
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
        
        setTimeout(() => {
            showMainPage();
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

// ===== ОСНОВНАЯ СТРАНИЦА =====
function showMainPage() {
    showPage('mainPage');
    
    if (user && userNameEl && avatarEl && welcomeText) {
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

// ===== ИНИЦИАЛИЗАЦИЯ =====
// Функция для проверки готовности DOM
function initApp() {
    console.log('🚀 Инициализация приложения...');
    
    // Проверяем наличие всех элементов
    const elements = {
        rulesPage, captchaPage, mainPage,
        rulesList, agreeBtn, scrollHint,
        captchaString, captchaInput, captchaOptions,
        captchaStatus, checkCaptchaBtn, resetCaptchaBtn,
        userNameEl, avatarEl, userStatusEl, welcomeText,
        actionBtn, counterEl, logoutBtn
    };
    
    const missingElements = Object.entries(elements)
        .filter(([name, el]) => !el)
        .map(([name]) => name);
    
    if (missingElements.length > 0) {
        console.warn('⚠️ Отсутствуют элементы:', missingElements.join(', '));
    } else {
        console.log('✅ Все элементы найдены');
    }
    
    // Рендерим правила
    renderRules();
    
    // Показываем страницу правил
    showPage('rulesPage');
    
    // Настраиваем обработчики событий (только если элементы существуют)
    if (agreeBtn) {
        agreeBtn.addEventListener('click', () => {
            showPage('captchaPage');
            initCaptcha();
        });
    }
    
    if (checkCaptchaBtn) {
        checkCaptchaBtn.addEventListener('click', checkCaptcha);
    }
    
    if (resetCaptchaBtn) {
        resetCaptchaBtn.addEventListener('click', resetCaptcha);
    }
    
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            counter++;
            if (counterEl) {
                counterEl.textContent = counter;
            }
            
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
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите выйти?')) {
                counter = 0;
                if (counterEl) {
                    counterEl.textContent = '0';
                }
                showPage('rulesPage');
                if (rulesList) {
                    rulesList.scrollTop = 0;
                }
                if (agreeBtn) {
                    agreeBtn.disabled = true;
                }
                if (scrollHint) {
                    scrollHint.style.display = 'block';
                }
                if (agreeBtn) {
                    agreeBtn.textContent = '📖 Я прочитал(а), я согласен(на)';
                }
            }
        });
    }
    
    // Настройка главной кнопки
    if (tg.MainButton) {
        tg.MainButton.setText('📋 Правила');
        tg.MainButton.show();
        
        tg.MainButton.onClick(() => {
            if (rulesList) {
                rulesList.scrollTop = 0;
            }
        });
    }
    
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
}

// Запускаем приложение когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}