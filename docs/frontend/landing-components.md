# Компоненты и дизайн-система лендинга N1X VPN

## Основание и исходные материалы

Документ составлен на основе инвентаризации всех 16 эталонных PNG-макетов из [`docs/assets/images/concept/`](../assets/images/concept/) с учётом архитектурных и функциональных требований, перенесённых из проекта-исходника **NordelVPN** ([nordelVPN/company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native)), и утверждённых продуктовых решений владельца.

Точные тексты всех секций и готовый словарь EN/RU вынесены в [copy-and-locales.md](copy-and-locales.md).

### Состав исходных концептов

| Группа | Файлы | Разрешение (px) | Область применения |
|---|---|---|---|
| Бренд-айдентика | `logo-lime-x-concept.png` | `1672 × 941` | Первичный логотип, знак `X`, иконка приложения, монохром |
| Веб-секции единого лендинга (`index.html`) | `01-home.png`, `02-the-app.png`, `03-why-n1x.png`, `04-plans.png`, `07-support.png` | `1672 × 941` (`04`, `07`: `1671 × 941`) | 5 последовательных секций главной страницы `index.html` |
| Веб-экраны следующих этапов | `05-checkout.png`, `account-page/06-account.png` | `1672 × 941` | Референс оплаты и личного кабинета (вне статического MVP) |
| Мобильное приложение | `mobile/01-home.png` .. `mobile/08-account.png` | `941 × 1672` (`02-connected`: `1024 × 1536`) | `01`, `02` — ориентир интерактивного превью; `03`–`08` — референс клиентских приложений |

## Дизайн-система N1X VPN (только тёмная тема)

Дизайн **N1X VPN** построен вокруг высококонтрастной игровой/технологичной **тёмной палитры** и геометрического фирменного знака **X**. Светлая тема и переключатель тем **не реализуются**.

| Токен | Назначение | Ориентировочные значения из PNG |
|---|---|---|
| `--bg-primary` | Основной фон страницы | `#0D0C12` – `#100F15` (глубокий графитово-чёрный) |
| `--bg-surface` | Карточки, панели, поля ввода | `#16161C` – `#1E1E24` |
| `--bg-elevated` | Внутренние блоки, hover-состояния | `#202028` |
| `--border-subtle` | Контуры карточек тарифов и инпута поиска | тонкая светлая/приглушённая обводка поверх тёмного фона |
| `--accent-lime` | Основной фирменный акцент (CTA-кнопки, активный пункт меню, диагональ `X`, маркеры `/`, иконки) | `#CBF806` / `#CEF803` / `#C9F80C` |
| `--accent-lime-hover` | Состояние hover/active акцентной кнопки | `#D8FF18` |
| `--text-on-accent` | Текст на лаймовых кнопках (`Get N1X`, `Explore N1X`, `Choose ...`, `Contact support`) | `#0B0B10` (тёмный контрастный) |
| `--text-primary` | Заголовки и основной текст | `#F8F0E0` / `#FFF8E8` (тёплый кремово-белый) |
| `--text-secondary` | Описания, подписи, неактивные элементы | приглушённый кремово-серый (проверить контраст >= 4.5:1 по WCAG AA) |

### Типографика (шрифт с фото)
- **Требование к разработке:** выявить шрифт по фото концептов (или подобрать максимально близкий лицензионно-чистый геометрический гротеск и подключить его в проект).
- По анализу PNG ключевая особенность — крупные display-заголовки (`Beyond borders. Beyond limits.`, `Your connection. Your way.`, `A little more freedom online.`, `Choose your plan.`, `How can we help?`) набраны **жирным наклонным (Bold Italic / Heavy Oblique) геометрическим гротеском**, а основной наборный текст и подписи — прямым чистым гротеском.

### Фирменный знак и иконки (`logo-lime-x-concept.png` + экраны концепта)
- **Primary logo (`logo.hbs`):** снять геометрию с `logo-lime-x-concept.png` — символ **X** (диагональ слева-сверху вправо-вниз неоново-лаймовая `#CBF806`, диагональ справа-сверху влево-вниз кремово-белая `#F8F0E0`) + надпись **`N1X VPN`**.
- **Symbol (Large, `brand-x.hbs`):** крупный двухцветный **X** с `logo-lime-x-concept.png` для правой части секций `01-home`, `02-the-app`, `03-why-n1x`, `04-plans`, `07-support`.
- **App Icon (X Only):** иконка `X` с `logo-lime-x-concept.png` для `favicon.svg` / app icon.
- **Иконки карточек и UI:** снять геометрию иконок с фото (`02-the-app.png`, `03-why-n1x.png`, `07-support.png`, `mobile/01-home.png`) и реализовать чистыми inline SVG (без растровых вырезок из PNG и без замены на случайные текстовые символы).

## Утверждённые тарифные планы (секция `#plans`)

По решению владельца блок тарифов содержит **4 карточки**, которые заменяют 3 иллюстративные карточки с `04-plans.png` (визуальный стиль карточек, обводок и лаймовых кнопок берётся с `04-plans.png`):

| # | Тариф (RU) | Тариф (EN) | Цена | Устройства | Возможности / примечание |
|---|---|---|---|---|---|
| 1 | Триал — 1 мес | Trial — 1 month | `1` | `5` | Один раз для нового пользователя (`Once for a new user`) |
| 2 | 1 мес | 1 month | `7` | `5` | — |
| 3 | 3 месяца | 3 months | `15` | `5` | 5 в месяц (`5 per month`) |
| 4 | 12 месяцев | 12 months | `55` | `5` | 4.58 в месяц (`4.58 per month`) |

Уточнения для реализации:
- Валюта не указана — не подставлять `€`, `$` или `₽` автоматически.
- Сетка 4 карточек: **4 колонки** на `> 1100px`, **2 колонки** на `901–1100px`, **1 колонка** на `<= 900px`.
- Выбор любого тарифа открывает модальное окно вишлиста (`data-wishlist-open`); оплата не реализована.
- Под карточками сохраняется честное пояснение об уточнении валюты/условий оплаты и открытии вишлиста.

## Инвентаризация секций единого лендинга `index.html`

Все пути шаблонов указаны относительно `src/templates/partials/`, модулей — относительно `src/modules/`.

### 1. Единая шапка (`header.hbs`, `modules/navigation.js`)

| Область макета | Элемент | Компонент / файл | Поведение |
|---|---|---|---|
| Верх слева (`x~84, y~25`) | Логотип `[X] N1X VPN` | `logo.hbs`, `header.hbs` | Ссылка на начало страницы (`#home` / `./index.html`) |
| Верх по центру (`x~493..880`) | Навигация: `The app`, `Why N1X`, `Support` | `header.hbs`, `modules/navigation.js` | Якорные ссылки `#the-app`, `#why-n1x`, `#support`; активный пункт подсвечивается лаймовым (`#CBF806`); на `<= 900px` переходит в мобильное меню |
| Верх справа (до `Get N1X`) | Переключатель языка `EN / RU` (`data-language-select`) | `header.hbs`, `modules/i18n.js` | Переключение языка без перезагрузки (функционал `FRONT-002`) |
| Верх справа (`x~1456, y~38`) | Кнопка `Get N1X` (лаймовая заливка, тёмный текст) | `header.hbs`, `wishlist.hbs` | Открывает модальное окно вишлиста (`data-wishlist-open`) |

### 2. Секция 1 (`#home`) — `01-home.png`

| Область макета | Содержимое (точно с фото) | Компонент / файл | Поведение |
|---|---|---|---|
| Левая колонка Hero | Заголовок (4 строки): `Beyond / borders. / Beyond / limits.` | `hero.hbs`, `data/index.js` | Единственный `<h1>` на странице |
| Под заголовком | `A versatile VPN for everyday life and play, giving you a more private, open, and flexible online experience.` | `hero.hbs`, `data/index.js` | Локализуется через `data-i18n` |
| CTA под описанием | Лаймовая кнопка `Explore N1X` | `hero.hbs` | Якорная ссылка **`href="#plans"`** |
| Правая часть Hero | Крупный фирменный знак **X** (лайм + кремовый) | `brand-x.hbs` | Декоративный inline SVG (`aria-hidden="true"`) |
| Нижняя полоса (4 колонки) | `Made for the / way you play.` + 3 блока: `PRIVACY EVERYDAY`, `ACCESS MORE`, `STAY FLEXIBLE` (тексты в [copy-and-locales.md](copy-and-locales.md)) | `hero.hbs`, массив `hero.features` | `4 → 2 (<= 900px) → 1 (<= 600px)` |

### 3. Секция 2 (`#the-app`) — `02-the-app.png` (+ `mobile/01-home.png`, `mobile/02-connected.png`)

| Область макета | Содержимое (точно с фото) | Компонент / файл | Поведение |
|---|---|---|---|
| Левая колонка | Заголовок `Your / connection. / Your way.` + описание + лаймовая кнопка `Get N1X` | `app-preview.hbs`, `data/index.js` | `Get N1X` открывает вишлист (`data-wishlist-open`) |
| Правая колонка | Макет приложения N1X VPN поверх знака **X** | `app-preview.hbs`, `modules/app-preview.js` | Интерактивное локальное демо: кнопка `Connect`/`Disconnect` переключает `Not connected` (`Automatic`) ↔ `Connected (preview)` (`Netherlands • Amsterdam`) с пометкой демо; клик по `View all servers` показывает `[data-demo-notice]` |
| Нижняя полоса (4 колонки) | `Simple VPN / for everyday / online life.` + 3 блока с лаймовыми SVG-иконками: `SIMPLE TO USE`, `CHOOSE YOUR LOCATION`, `FOR EVERYDAY USE` | `app-preview.hbs`, массив `app.features` | `4 → 2 → 1` |

### 4. Секция 3 (`#why-n1x`) — `03-why-n1x.png`

| Область макета | Содержимое (точно с фото) | Компонент / файл | Поведение |
|---|---|---|---|
| Верхняя часть | Заголовок `A little more / freedom / online.` + описание + лаймовая кнопка `Explore N1X` + справа крупный знак **X** | `why-n1x.hbs`, `data/index.js` | `Explore N1X` ведёт на **`href="#plans"`** |
| Нижняя 3-колоночная сетка | 3 карточки с SVG-иконками: `Made for everyday life`, `Designed for privacy`, `Ready when you are` | `why-n1x.hbs`, массив `why.items` | `3 → 1 (<= 900px)` |

### 5. Секция 4 (`#plans`) — `04-plans.png`

| Область макета | Содержимое | Компонент / файл | Поведение |
|---|---|---|---|
| Шапка секции | Заголовок `Choose your plan.` + `A universal VPN for play, work, and everyday online life.` + справа средний знак **X** | `pricing.hbs`, `data/index.js` | — |
| Карточки тарифов | 4 контурные карточки по утверждённой таблице тарифов выше (оформление и лаймовые кнопки — по `04-plans.png`) | `pricing.hbs`, `plan-card.hbs`, `pricing.plans` | Выбор тарифа открывает вишлист (`data-wishlist-open`) |
| Примечание снизу | Пояснение об уточнении валюты/условий и открытии вишлиста | `pricing.hbs` | — |

### 6. Секция 5 (`#support`) — `07-support.png`

| Область макета | Содержимое (точно с фото) | Компонент / файл | Поведение |
|---|---|---|---|
| Верхняя часть | Заголовок `How can we / help?` + описание + поле `Search support` с лаймовой иконкой/кнопкой + справа крупный знак **X** | `support.hbs`, `data/index.js` | Поле поиска — **рабочий `<input type="search">`** (принимает ввод и фокус, без логики поиска на этапе MVP) |
| Карточки категорий (3 колонки) | `Getting started`, `Account & subscription`, `Troubleshooting` с SVG-иконками с фото | `support.hbs`, массив `support.categories` | `3 → 1 (<= 900px)` |
| Нижняя CTA-строка | Лаймовая кнопка `Contact support` + `Still need help? Get in touch with the N1X support team.` | `support.hbs` | Кнопка открывает вишлист (`data-wishlist-open`) |

### 7. Компоненты, добавленные по проектным требованиям (вне PNG)

| Компонент | Файлы реализации | Обоснование |
|---|---|---|
| Модальное окно «Вишлист N1X» | `wishlist.hbs`, `modules/wishlist.js` | Обязательная механика перехода в Telegram-бот (`<dialog data-wishlist>`) |
| Общий `Footer` | `footer.hbs`, `layouts/main.hbs`, `styles/base.scss` | Логотип, якорная навигация, CTA `Get N1X` (`data-wishlist-open`), заглушки `Privacy Policy` / `Terms of Use` (`href="#"`), копирайт `© {{year}} N1X VPN` |
| Переключатель языка `EN / RU` | `header.hbs`, `modules/i18n.js`, `data/locales.json` | Перенос `FRONT-002` из NordelVPN |
| Слой доступности | `main.hbs`, `base.scss`, JS-модули | `skip-link`, `:focus-visible`, управление с клавиатуры, `aria-*`, `prefers-reduced-motion` |

### 8. Экраны вне объёма статического MVP (справочная инвентаризация)

| Файл концепта | Содержимое | Статус в MVP |
|---|---|---|
| `05-checkout.png` | 3-шаговая форма заказа + `Order summary` | **Вне MVP.** Дизайн-референс этапа платёжной интеграции |
| `account-page/06-account.png` | Личный кабинет (`Overview`, `Subscription`, `Devices`, `Quick actions`) | **Вне MVP.** Дизайн-референс этапа единого API и аккаунтов |
| `mobile/01-home.png`, `mobile/02-connected.png` | Главный экран приложения (`Not connected` / `Connected`) | **Ориентир** для интерактивного демо-превью в `#the-app` |
| `mobile/03-menu.png` .. `mobile/08-account.png` | Меню, список серверов, настройки, подписка, оплата, профиль | **Вне MVP.** Референс для этапов Android / iOS приложений |

## Реестр компонентов (C01–C15)

| ID | Компонент | Файлы | Примечание |
|---|---|---|---|
| C01 | AppShell (`Layout`) | `src/templates/layouts/main.hbs` | Единый каркас (`data-theme="dark"`), `skip-link`, `header`, `main`, `footer`, `wishlist` |
| C02 | Brand & Artwork | `partials/logo.hbs`, `partials/brand-x.hbs` | Inline SVG логотипа `X N1X VPN`, знака `X` и иконок с концептов |
| C03 | Header | `partials/header.hbs`, `modules/navigation.js` | Единая шапка с адаптивным мобильным меню `<= 900px` |
| C04 | LanguageSwitcher | `partials/header.hbs`, `modules/i18n.js` | Переключение `EN / RU` без перезагрузки |
| C05 | PrimaryButton / SecondaryButton | `styles/base.scss` | Лаймовые primary-кнопки (`#CBF806` + тёмный текст) и контурные/текстовые secondary |
| C06 | HeroSection (`#home`) | `partials/hero.hbs`, `styles/pages/index.scss` | Экран `01-home.png` + полоса из 3 преимуществ; `Explore N1X` → `#plans` |
| C07 | AppPreviewSection (`#the-app`) | `partials/app-preview.hbs`, `modules/app-preview.js` | Экран `02-the-app.png` + интерактивное демо подключения + 3 преимущества |
| C08 | WhySection (`#why-n1x`) | `partials/why-n1x.hbs` | Экран `03-why-n1x.png` + 3 карточки ценности; `Explore N1X` → `#plans` |
| C09 | PricingSection / PlanCard (`#plans`) | `partials/pricing.hbs`, `partials/plan-card.hbs` | 4 утверждённых тарифа в стиле `04-plans.png`, CTA → вишлист |
| C10 | SupportSection (`#support`) | `partials/support.hbs` | Экран `07-support.png`: рабочий `<input>`, 3 категории, `Contact support` → вишлист |
| C11 | WishlistDialog | `partials/wishlist.hbs`, `modules/wishlist.js` | Техническое `<dialog>` окно перехода в Telegram-бот |
| C12 | Footer | `partials/footer.hbs`, `styles/base.scss` | Единый футер с якорями, CTA вишлиста, заглушками `#` и копирайтом |
| C13 | ResponsiveLayout | `styles/base.scss`, `styles/pages/index.scss` | Брейкпоинты `375px`, `600px`, `768px`, `900px`, `1100px`, `1440px+` |
| C14 | DesignTokens | `styles/base.scss` | CSS-переменные тёмной палитры, типографики, радиусов и отступов |
| C15 | AccessibilityLayer | шаблоны + SCSS + JS | Клавиатурная навигация, focus management, семантика, `prefers-reduced-motion` |

## Адаптивные решения (мобильные и планшетные ширины)

Отдельных мобильных макетов веб-сайта нет (`mobile/*.png` — это макеты нативного VPN-приложения). Для веб-лендинга применяются правила:
- **`> 1100px` (desktop):** полная композиция по концептам `1672×941`; шапка в одну строку; тарифы в **4 колонки**.
- **`901–1100px`:** тарифы перестраиваются в **2 колонки**; графика `X` масштабируется без переполнения.
- **`<= 900px` (tablet):** навигация header сворачивается в раскрываемое меню; двухколоночные hero-секции переходят в стопку; карточки тарифов, `Why N1X` и `Support` — в 1 колонку; меню footer остаётся открытым.
- **`<= 600px` (mobile, проверка на `375px`):** полосы преимуществ (`#home`, `#the-app`) переходят в 1 колонку; макет приложения следует под описанием; шапка не даёт горизонтального скролла (`scrollWidth <= clientWidth + 1`).
