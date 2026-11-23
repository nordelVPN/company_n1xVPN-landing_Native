# Спецификация текстов и локализации N1X VPN (`src/data/index.js` и `src/data/locales.json`)

Документ содержит **точные английские тексты (EN)**, снятые с дизайн-концептов в [`docs/assets/images/concept/`](../assets/images/concept/), утверждённую владельцем таблицу из **4 тарифов**, технический копирайт для `header`, `footer`, `wishlist` и демо-превью, а также рабочий **русский словарь (RU)** с полным совпадением ключей.

> **Правила копирайта:**
> - Все базовые EN-тексты секций (`01-home`, `02-the-app`, `03-why-n1x`, `04-plans`, `07-support`, `mobile/01`, `mobile/02`) переносятся **в точности с фото концептов**.
> - Для блока тарифов (`04-plans`) используются **4 утверждённых тарифа владельца** (см. раздел ниже); валюта не подставляется до отдельного указания.
> - В русской версии сохраняется термин **«вишлист»** (не `waitlist`).
> - Названия бренда **N1X VPN** / **N1X** не переводятся.

---

## 1. Утверждённая таблица тарифов (4 карточки)

Заменяет 3 иллюстративные карточки с `04-plans.png` (само визуальное оформление карточек берётся с `04-plans.png`):

| # | Тариф (RU) | Тариф (EN) | Цена | Устройства | Возможности / примечание (RU) | Возможности / примечание (EN) |
|---|---|---|---|---|---|---|
| 1 | Триал — 1 мес | Trial — 1 month | `1` | `5` | Один раз для нового пользователя | Once for a new user |
| 2 | 1 мес | 1 month | `7` | `5` | — | — |
| 3 | 3 месяца | 3 months | `15` | `5` | 5 в месяц | 5 per month |
| 4 | 12 месяцев | 12 months | `55` | `5` | 4.58 в месяц | 4.58 per month |

> Валюта не указана — выводить цену как число (`1`, `7`, `15`, `55`) без знака `€`/`$`/`₽`. Выбор любого тарифа открывает модальное окно вишлиста (`data-wishlist-open`), оплата в MVP не реализована.

---

## 2. Целевая структура `src/data/index.js`

```js
module.exports = {
  lang: 'en',
  title: 'N1X VPN — Beyond borders. Beyond limits.',
  description: 'A versatile VPN for everyday life and play, giving you a more private, open, and flexible online experience.',
  canonical: '',
  landing: true,
  nav: [
    { href: '#the-app', label: 'The app', key: 'nav.theApp' },
    { href: '#why-n1x', label: 'Why N1X', key: 'nav.whyN1x' },
    { href: '#support', label: 'Support', key: 'nav.support' }
  ],
  header: {
    cta: 'Get N1X'
  },
  hero: {
    lines: ['Beyond', 'borders.', 'Beyond', 'limits.'],
    description: 'A versatile VPN for everyday life and play, giving you a more private, open, and flexible online experience.',
    button: 'Explore N1X',
    buttonHref: '#plans',
    stripHeadingLines: ['Made for the', 'way you play.'],
    features: [
      {
        title: 'PRIVACY EVERYDAY',
        description: 'Keep your online activity more private and secure.'
      },
      {
        title: 'ACCESS MORE',
        description: 'Enjoy a freer internet with fewer restrictions.'
      },
      {
        title: 'STAY FLEXIBLE',
        description: 'Use it at home, on the go, or wherever you play.'
      }
    ]
  },
  app: {
    lines: ['Your', 'connection.', 'Your way.'],
    description: 'A universal VPN app for gaming and everyday online life. Keep your connection private, access more of the internet and stay in control across your devices.',
    button: 'Get N1X',
    preview: {
      headingLines: ['Ready when', 'you are.'],
      status: 'Not connected',
      connectedStatus: 'Connected (preview)',
      connect: 'Connect',
      disconnect: 'Disconnect',
      serverLabel: 'Selected server',
      connectedServerLabel: 'Connected server',
      serverValue: 'Automatic',
      connectedServerValue: 'Netherlands • Amsterdam',
      viewServers: 'View all servers',
      connectedNote: 'Demo only — your network connection has not changed.',
      demoNotice: 'This is a concept preview. Server list and accounts are not available yet.'
    },
    stripHeadingLines: ['Simple VPN', 'for everyday', 'online life.'],
    features: [
      {
        title: 'SIMPLE TO USE',
        description: 'Get started quickly with a clean, straightforward app across your devices.'
      },
      {
        title: 'CHOOSE YOUR LOCATION',
        description: 'Connect through locations across the globe to access more of the internet.'
      },
      {
        title: 'FOR EVERYDAY USE',
        description: 'A flexible VPN for gaming, streaming, browsing and staying private online.'
      }
    ]
  },
  why: {
    lines: ['A little more', 'freedom', 'online.'],
    description: "A universal VPN for a safer, more open and flexible online experience, whether you're gaming, streaming, working or browsing.",
    button: 'Explore N1X',
    buttonHref: '#plans',
    items: [
      {
        titleLines: ['Made for', 'everyday life'],
        description: 'A versatile VPN that fits seamlessly into your daily routine, at home, at work or on the go.'
      },
      {
        titleLines: ['Designed', 'for privacy'],
        description: 'Help keep your online activity more private with a secure, encrypted connection.'
      },
      {
        titleLines: ['Ready', 'when you are'],
        description: 'A reliable, flexible VPN that keeps up with how you play, watch, work and explore online.'
      }
    ]
  },
  pricing: {
    title: 'Choose your plan.',
    description: 'A universal VPN for play, work, and everyday online life.',
    note: 'Currency and billing terms will be confirmed. Plan selection opens the wishlist; payment is not available yet.',
    plans: [
      {
        id: 'trial',
        name: 'Trial — 1 month',
        price: '1',
        devices: '5 devices',
        note: 'Once for a new user',
        button: 'Choose Trial'
      },
      {
        id: 'monthly',
        name: '1 month',
        price: '7',
        devices: '5 devices',
        note: '',
        button: 'Choose 1 Month'
      },
      {
        id: 'quarterly',
        name: '3 months',
        price: '15',
        devices: '5 devices',
        note: '5 per month',
        button: 'Choose 3 Months'
      },
      {
        id: 'annual',
        name: '12 months',
        price: '55',
        devices: '5 devices',
        note: '4.58 per month',
        button: 'Choose 12 Months'
      }
    ]
  },
  support: {
    lines: ['How can we', 'help?'],
    description: 'Find answers, set up N1X, manage your account, and get help when you need it.',
    searchPlaceholder: 'Search support',
    categories: [
      {
        title: 'Getting started',
        description: 'Set up N1X, install the app, and connect for the first time.'
      },
      {
        title: 'Account & subscription',
        description: 'Manage your account, subscription, and billing details.'
      },
      {
        title: 'Troubleshooting',
        description: 'Fix common issues and get back to gaming.'
      }
    ],
    contactButton: 'Contact support',
    contactNote: 'Still need help? Get in touch with the N1X support team.'
  },
  footer: {
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    copyright: 'N1X VPN. All rights reserved.'
  },
  wishlist: {
    title: 'N1X VPN wishlist',
    description: 'Our Telegram wishlist is not available yet. Please check back soon.',
    telegramUrl: process.env.TELEGRAM_BOT_URL || '',
    buttonText: 'Open Telegram',
    close: 'Close'
  }
};
```

> **Примечание по `wishlist.telegramUrl`:** пока переменная `TELEGRAM_BOT_URL` пуста (адрес бота будет добавлен в `.env` позже), кнопка в диалоге вишлиста рендерится неактивной (`disabled`). После добавления URL описание меняется на приглашение перейти в Telegram-бот.

---

## 3. Готовый словарь `src/data/locales.json` (`en` и `ru`)

Наборы ключей `en` и `ru` полностью идентичны (проверяется в QA):

```json
{
  "en": {
    "language.name": "EN",
    "language.label": "Language",
    "skip": "Skip to content",
    "index.title": "N1X VPN — Beyond borders. Beyond limits.",
    "index.description": "A versatile VPN for everyday life and play, giving you a more private, open, and flexible online experience.",
    "nav.menuOpen": "Open menu",
    "nav.theApp": "The app",
    "nav.whyN1x": "Why N1X",
    "nav.plans": "Plans",
    "nav.support": "Support",
    "cta.getN1x": "Get N1X",
    "cta.exploreN1x": "Explore N1X",

    "hero.line0": "Beyond",
    "hero.line1": "borders.",
    "hero.line2": "Beyond",
    "hero.line3": "limits.",
    "hero.description": "A versatile VPN for everyday life and play, giving you a more private, open, and flexible online experience.",
    "hero.stripLine0": "Made for the",
    "hero.stripLine1": "way you play.",
    "hero.features.0.title": "PRIVACY EVERYDAY",
    "hero.features.0.description": "Keep your online activity more private and secure.",
    "hero.features.1.title": "ACCESS MORE",
    "hero.features.1.description": "Enjoy a freer internet with fewer restrictions.",
    "hero.features.2.title": "STAY FLEXIBLE",
    "hero.features.2.description": "Use it at home, on the go, or wherever you play.",

    "app.line0": "Your",
    "app.line1": "connection.",
    "app.line2": "Your way.",
    "app.description": "A universal VPN app for gaming and everyday online life. Keep your connection private, access more of the internet and stay in control across your devices.",
    "app.preview.heading0": "Ready when",
    "app.preview.heading1": "you are.",
    "app.preview.status": "Not connected",
    "app.preview.connectedStatus": "Connected (preview)",
    "app.preview.connect": "Connect",
    "app.preview.disconnect": "Disconnect",
    "app.preview.serverLabel": "Selected server",
    "app.preview.connectedServerLabel": "Connected server",
    "app.preview.serverValue": "Automatic",
    "app.preview.connectedServerValue": "Netherlands • Amsterdam",
    "app.preview.viewServers": "View all servers",
    "app.preview.connectedNote": "Demo only — your network connection has not changed.",
    "app.preview.demoNotice": "This is a concept preview. Server list and accounts are not available yet.",
    "app.stripLine0": "Simple VPN",
    "app.stripLine1": "for everyday",
    "app.stripLine2": "online life.",
    "app.features.0.title": "SIMPLE TO USE",
    "app.features.0.description": "Get started quickly with a clean, straightforward app across your devices.",
    "app.features.1.title": "CHOOSE YOUR LOCATION",
    "app.features.1.description": "Connect through locations across the globe to access more of the internet.",
    "app.features.2.title": "FOR EVERYDAY USE",
    "app.features.2.description": "A flexible VPN for gaming, streaming, browsing and staying private online.",

    "why.line0": "A little more",
    "why.line1": "freedom",
    "why.line2": "online.",
    "why.description": "A universal VPN for a safer, more open and flexible online experience, whether you're gaming, streaming, working or browsing.",
    "why.items.0.title0": "Made for",
    "why.items.0.title1": "everyday life",
    "why.items.0.description": "A versatile VPN that fits seamlessly into your daily routine, at home, at work or on the go.",
    "why.items.1.title0": "Designed",
    "why.items.1.title1": "for privacy",
    "why.items.1.description": "Help keep your online activity more private with a secure, encrypted connection.",
    "why.items.2.title0": "Ready",
    "why.items.2.title1": "when you are",
    "why.items.2.description": "A reliable, flexible VPN that keeps up with how you play, watch, work and explore online.",

    "pricing.title": "Choose your plan.",
    "pricing.description": "A universal VPN for play, work, and everyday online life.",
    "pricing.note": "Currency and billing terms will be confirmed. Plan selection opens the wishlist; payment is not available yet.",
    "pricing.plans.0.name": "Trial — 1 month",
    "pricing.plans.0.devices": "5 devices",
    "pricing.plans.0.note": "Once for a new user",
    "pricing.plans.0.button": "Choose Trial",
    "pricing.plans.1.name": "1 month",
    "pricing.plans.1.devices": "5 devices",
    "pricing.plans.1.note": "",
    "pricing.plans.1.button": "Choose 1 Month",
    "pricing.plans.2.name": "3 months",
    "pricing.plans.2.devices": "5 devices",
    "pricing.plans.2.note": "5 per month",
    "pricing.plans.2.button": "Choose 3 Months",
    "pricing.plans.3.name": "12 months",
    "pricing.plans.3.devices": "5 devices",
    "pricing.plans.3.note": "4.58 per month",
    "pricing.plans.3.button": "Choose 12 Months",

    "support.line0": "How can we",
    "support.line1": "help?",
    "support.description": "Find answers, set up N1X, manage your account, and get help when you need it.",
    "support.searchPlaceholder": "Search support",
    "support.searchLabel": "Search support",
    "support.categories.0.title": "Getting started",
    "support.categories.0.description": "Set up N1X, install the app, and connect for the first time.",
    "support.categories.1.title": "Account & subscription",
    "support.categories.1.description": "Manage your account, subscription, and billing details.",
    "support.categories.2.title": "Troubleshooting",
    "support.categories.2.description": "Fix common issues and get back to gaming.",
    "support.contactButton": "Contact support",
    "support.contactNote": "Still need help? Get in touch with the N1X support team.",

    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Use",
    "footer.copyright": "N1X VPN. All rights reserved.",

    "wishlist.title": "N1X VPN wishlist",
    "wishlist.description": "Our Telegram wishlist is not available yet. Please check back soon.",
    "wishlist.buttonText": "Open Telegram",
    "wishlist.close": "Close"
  },
  "ru": {
    "language.name": "RU",
    "language.label": "Язык",
    "skip": "Перейти к содержимому",
    "index.title": "N1X VPN — Без границ. Без ограничений.",
    "index.description": "Универсальный VPN для повседневной жизни и игр — больше приватности, свободы и гибкости в сети.",
    "nav.menuOpen": "Открыть меню",
    "nav.theApp": "Приложение",
    "nav.whyN1x": "Почему N1X",
    "nav.plans": "Тарифы",
    "nav.support": "Поддержка",
    "cta.getN1x": "Получить N1X",
    "cta.exploreN1x": "Выбрать N1X",

    "hero.line0": "За пределами",
    "hero.line1": "границ.",
    "hero.line2": "За пределами",
    "hero.line3": "лимитов.",
    "hero.description": "Универсальный VPN для повседневной жизни и игр, обеспечивающий более приватный, открытый и гибкий доступ в сеть.",
    "hero.stripLine0": "Создан для того,",
    "hero.stripLine1": "как вы играете.",
    "hero.features.0.title": "ПРИВАТНОСТЬ КАЖДЫЙ ДЕНЬ",
    "hero.features.0.description": "Сохраняйте активность в сети более приватной и защищённой.",
    "hero.features.1.title": "БОЛЬШЕ ДОСТУПА",
    "hero.features.1.description": "Пользуйтесь более свободным интернетом с меньшим числом ограничений.",
    "hero.features.2.title": "ВСЕГДА ГИБКИЙ",
    "hero.features.2.description": "Используйте дома, в дороге или везде, где вы играете.",

    "app.line0": "Ваше",
    "app.line1": "подключение.",
    "app.line2": "По вашим правилам.",
    "app.description": "Универсальное VPN-приложение для игр и повседневной жизни в сети. Сохраняйте приватность, открывайте больше интернета и контролируйте подключение на всех устройствах.",
    "app.preview.heading0": "Готов, когда",
    "app.preview.heading1": "готовы вы.",
    "app.preview.status": "Не подключено",
    "app.preview.connectedStatus": "Подключено (демо)",
    "app.preview.connect": "Подключить",
    "app.preview.disconnect": "Отключить",
    "app.preview.serverLabel": "Выбранный сервер",
    "app.preview.connectedServerLabel": "Текущий сервер",
    "app.preview.serverValue": "Автоматически",
    "app.preview.connectedServerValue": "Нидерланды • Амстердам",
    "app.preview.viewServers": "Все серверы",
    "app.preview.connectedNote": "Только демо — сетевое подключение вашего устройства не изменилось.",
    "app.preview.demoNotice": "Это демонстрационное превью. Список серверов и аккаунты пока недоступны.",
    "app.stripLine0": "Простой VPN",
    "app.stripLine1": "для повседневной",
    "app.stripLine2": "жизни онлайн.",
    "app.features.0.title": "ПРОСТО НАЧАТЬ",
    "app.features.0.description": "Быстрый старт в чистом и понятном приложении на всех ваших устройствах.",
    "app.features.1.title": "ВЫБОР ЛОКАЦИИ",
    "app.features.1.description": "Подключайтесь через локации по всему миру для более свободного доступа в сеть.",
    "app.features.2.title": "НА КАЖДЫЙ ДЕНЬ",
    "app.features.2.description": "Гибкий VPN для игр, стриминга, браузинга и приватной работы в сети.",

    "why.line0": "Чуть больше",
    "why.line1": "свободы",
    "why.line2": "онлайн.",
    "why.description": "Универсальный VPN для более безопасного, открытого и гибкого интернета — играете ли вы, смотрите стримы, работаете или просто серфите.",
    "why.items.0.title0": "Создан для",
    "why.items.0.title1": "каждого дня",
    "why.items.0.description": "Универсальный VPN, который органично вписывается в ваш день — дома, на работе и в дороге.",
    "why.items.1.title0": "Сделан",
    "why.items.1.title1": "для приватности",
    "why.items.1.description": "Помогает сохранить активность в сети более приватной благодаря защищённому зашифрованному соединению.",
    "why.items.2.title0": "Готов,",
    "why.items.2.title1": "когда нужно вам",
    "why.items.2.description": "Надёжный и гибкий VPN, который подстраивается под ваши игры, просмотр, работу и поиск в сети.",

    "pricing.title": "Выберите тариф.",
    "pricing.description": "Универсальный VPN для игр, работы и повседневной жизни в сети.",
    "pricing.note": "Валюта и условия оплаты будут уточнены. Выбор тарифа открывает вишлист; оплата пока не подключена.",
    "pricing.plans.0.name": "Триал — 1 мес",
    "pricing.plans.0.devices": "5 устройств",
    "pricing.plans.0.note": "Один раз для нового пользователя",
    "pricing.plans.0.button": "Выбрать Триал",
    "pricing.plans.1.name": "1 мес",
    "pricing.plans.1.devices": "5 устройств",
    "pricing.plans.1.note": "",
    "pricing.plans.1.button": "Выбрать 1 мес",
    "pricing.plans.2.name": "3 месяца",
    "pricing.plans.2.devices": "5 устройств",
    "pricing.plans.2.note": "5 в месяц",
    "pricing.plans.2.button": "Выбрать 3 месяца",
    "pricing.plans.3.name": "12 месяцев",
    "pricing.plans.3.devices": "5 устройств",
    "pricing.plans.3.note": "4.58 в месяц",
    "pricing.plans.3.button": "Выбрать 12 месяцев",

    "support.line0": "Чем мы можем",
    "support.line1": "помочь?",
    "support.description": "Найдите ответы, настройте N1X, управляйте аккаунтом и получайте помощь, когда она нужна.",
    "support.searchPlaceholder": "Поиск по поддержке",
    "support.searchLabel": "Поиск по поддержке",
    "support.categories.0.title": "Начало работы",
    "support.categories.0.description": "Настройте N1X, установите приложение и подключитесь впервые.",
    "support.categories.1.title": "Аккаунт и подписка",
    "support.categories.1.description": "Управление аккаунтом, подпиской и деталями оплаты.",
    "support.categories.2.title": "Решение проблем",
    "support.categories.2.description": "Устраните частые неполадки и возвращайтесь в игру.",
    "support.contactButton": "Связаться с поддержкой",
    "support.contactNote": "Остались вопросы? Свяжитесь с командой поддержки N1X.",

    "footer.privacy": "Политика конфиденциальности",
    "footer.terms": "Условия использования",
    "footer.copyright": "N1X VPN. Все права защищены.",

    "wishlist.title": "Вишлист N1X VPN",
    "wishlist.description": "Наш вишлист в Telegram скоро откроется. Пожалуйста, загляните чуть позже.",
    "wishlist.buttonText": "Открыть Telegram",
    "wishlist.close": "Закрыть"
  }
}
```

## 4. Приветствие Telegram-бота (`/start`)

Стартовый текст для `tg-bot/common.php` (по аналогии с NordelVPN):

```text
Здравствуйте, мы ещё не запустили наше приложение N1X VPN, но Вы добавлены в вишлист! Мы будем держать Вас в курсе!
```
