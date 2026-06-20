// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Расширяем приложение на весь экран
tg.expand();

// Получаем данные пользователя
const user = tg.initDataUnsafe?.user;

// Элементы DOM
const userNameEl = document.getElementById('userName');
const userStatusEl = document.getElementById('userStatus');
const avatarEl = document.getElementById('avatar');
const greetingText = document.getElementById('greetingText');
const actionBtn = document.getElementById('actionBtn');
const counterEl = document.getElementById('counter');

// Состояние
let counter = 0;

// Функция для получения инициалов
function getInitials(firstName, lastName) {
    let initials = firstName.charAt(0).toUpperCase();
    if (lastName && lastName.length > 0) {
        initials += lastName.charAt(0).toUpperCase();
    }
    return initials;
}

// Функция для обновления приветствия
function updateGreeting() {
    const hours = new Date().getHours();
    let timeGreeting = 'Доброе утро! 🌅';
    
    if (hours >= 12 && hours < 18) {
        timeGreeting = 'Добрый день! ☀️';
    } else if (hours >= 18 && hours < 24) {
        timeGreeting = 'Добрый вечер! 🌙';
    } else if (hours >= 0 && hours < 6) {
        timeGreeting = 'Доброй ночи! 🌃';
    }
    
    if (user) {
        const firstName = user.first_name || 'Гость';
        const lastName = user.last_name || '';
        const username = user.username || '';
        
        userNameEl.textContent = `${firstName} ${lastName}`.trim();
        avatarEl.textContent = getInitials(firstName, lastName);
        userStatusEl.textContent = timeGreeting;
        
        // Персонализированное приветствие
        greetingText.innerHTML = `
            Рады видеть тебя, <strong>${firstName}</strong>! 🎉<br>
            <span style="font-size:14px; color: var(--tg-theme-hint-color, #999);">
                ${username ? `@${username}` : 'Добро пожаловать!'}
            </span>
        `;
    } else {
        userNameEl.textContent = 'Гость';
        avatarEl.textContent = '👤';
        userStatusEl.textContent = timeGreeting;
        greetingText.textContent = 'Добро пожаловать в наше приложение! 🎉';
    }
}

// Обработчик кнопки
actionBtn.addEventListener('click', () => {
    counter++;
    counterEl.textContent = counter;
    
    // Виброотклик (если поддерживается)
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    // Показываем всплывающее уведомление
    if (counter % 5 === 0) {
        tg.showAlert(`🎉 Ты нажал ${counter} раз!`);
    }
    
    // Отправляем событие в бот (опционально)
    tg.sendData(JSON.stringify({
        action: 'button_click',
        count: counter,
        user: user?.id
    }));
});

// Инициализация
updateGreeting();

// Настройка главной кнопки (опционально)
tg.MainButton.setText('Готово');
tg.MainButton.show();

tg.MainButton.onClick(() => {
    tg.showAlert('Спасибо за использование! ✨');
    tg.close();
});

// Обработка изменения темы
tg.onEvent('themeChanged', () => {
    // Принудительное обновление стилей
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#0088cc');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f0f0f0');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
});

console.log('✅ Мини-приложение загружено!');
console.log('👤 Пользователь:', user);
console.log('📱 Telegram Web App версия:', tg.version);