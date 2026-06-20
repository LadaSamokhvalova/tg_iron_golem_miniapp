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

// ===== DOM ЭЛЕМЕНТЫ =====
const rulesList = document.getElementById('rulesList');
const agreeBtn = document.getElementById('agreeBtn');
const scrollHint = document.getElementById('scrollHint');

// ===== ФУНКЦИИ =====
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

// ===== ОБРАБОТЧИК КНОПКИ =====
if (agreeBtn) {
    agreeBtn.addEventListener('click', () => {
        // Сохраняем в localStorage, что правила приняты
        localStorage.setItem('rulesAccepted', 'true');
        
        // Отправляем событие в бот
        tg.sendData(JSON.stringify({
            action: 'rules_accepted',
            user: user?.id,
            username: user?.username
        }));
        
        // Переходим на страницу капчи
        window.location.href = 'captcha.html';
    });
}

// ===== ЗАПУСК =====
renderRules();

console.log('✅ Страница правил загружена!');
console.log('👤 Пользователь:', user);