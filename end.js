// ===== ИНИЦИАЛИЗАЦИЯ =====
const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user;

// Проверяем, прошел ли пользователь капчу
if (localStorage.getItem('captchaPassed') !== 'true') {
    // Если нет - отправляем на капчу
    window.location.href = 'captcha.html';
}

// ===== DOM ЭЛЕМЕНТЫ =====
const userNameEl = document.getElementById('userName');
const avatarEl = document.getElementById('avatar');
const userStatusEl = document.getElementById('userStatus');
const welcomeText = document.getElementById('welcomeText');
const logoutBtn = document.getElementById('logoutBtn');

// ===== ФУНКЦИИ =====
function getInitials(firstName, lastName) {
    let initials = firstName.charAt(0).toUpperCase();
    if (lastName && lastName.length > 0) {
        initials += lastName.charAt(0).toUpperCase();
    }
    return initials;
}

function showUserInfo() {
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
}

// ===== ОБРАБОТЧИК ВЫХОДА =====
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите выйти?')) {
            // Очищаем данные
            localStorage.clear();
            
            // Отправляем событие в бот
            tg.sendData(JSON.stringify({
                action: 'logout',
                user: user?.id
            }));
            
            // Возвращаемся на правила
            window.location.href = 'index.html';
        }
    });
}

// ===== ЗАПУСК =====
showUserInfo();

// Настройка главной кнопки Telegram
if (tg.MainButton) {
    tg.MainButton.setText('🎉 Добро пожаловать!');
    tg.MainButton.show();
    
    tg.MainButton.onClick(() => {
        tg.showAlert('Спасибо за прохождение верификации! ✨');
    });
}

console.log('✅ Главная страница загружена!');
console.log('👤 Пользователь:', user);