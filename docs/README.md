# Документация проекта N1X VPN Landing (`company_n1xVPN-landing_Native`)

## Назначение проекта

Статический лендинг **N1X VPN** (`index.html`, все 5 веб-экранов собраны секциями на одной странице) с «вишлистом для пользователей в Telegram-бота» и локальным/контейнерным окружением для разработки и проверки.

> Термин **«вишлист»** сохраняем в документации и русскоязычных материалах без замены на `waitlist`.

## Референс и проект-исходник (NordelVPN)

Проект **N1X VPN Landing** строится на базе проекта-исходника **NordelVPN** и полностью наследует его структуру каталогов, технологический стек, набор пакетов, функциональные требования, PHP 8.4 бэкенд Telegram-вишлиста, Docker Compose и процессы CI/CD/QA:

- **Исходный репозиторий (референс):** [nordelVPN/company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native)
- **Опубликованное превью эталона (GitHub Pages):** [https://nordelvpn.github.io/company_nordel-landing_Native/](https://nordelvpn.github.io/company_nordel-landing_Native/)

Основное отличие **N1X VPN** от исходника — визуальный дизайн, бренд-айдентика (**N1X VPN**, неоново-лаймовый знак **X** на глубоком тёмном фоне; только тёмная тема) и структура секций, заданные в [`docs/assets/images/concept/`](assets/images/concept/). При возникновении вопросов по реализации сборки, модулей, бота или скриптов проверок разработчик ориентируется на код исходного репозитория [company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native).

## Навигация по документации

| Раздел | Файл | Содержание |
|---|---|---|
| Задача BOOTSTRAP-000 | [tasks/000-project-bootstrap.md](tasks/000-project-bootstrap.md) | Стартовая инициализация репо: `package.json`, Webpack, ESLint, PostCSS, Docker, `tg-bot/`, CI/CD, QA-скрипт |
| Общая архитектура | [architecture.md](architecture.md) | Структура каталогов, стек технологий, `package.json`, сборки Webpack, ESLint/PostCSS, Docker, CI/CD |
| Дорожная карта | [roadmap.md](roadmap.md) | Этапы развития продукта (сайт, Telegram-бот, Android, iOS, macOS, Windows), зависимости и границы |
| Frontend: разработка | [frontend/landing-development.md](frontend/landing-development.md) | Запуск, сборки `dev`/`prod`, добавление partials, i18n, тёмная палитра, вишлист, footer, правила поддержки |
| Frontend: компоненты и дизайн | [frontend/landing-components.md](frontend/landing-components.md) | Дизайн-система N1X VPN, инвентаризация всех концептов `docs/assets/images/concept/`, 4 утверждённых тарифа |
| Frontend: тексты и словарь | [frontend/copy-and-locales.md](frontend/copy-and-locales.md) | Готовая спецификация точных EN-текстов с фото, 4 тарифа, `src/data/index.js` и словарь `locales.json` (`en`/`ru`) |
| Задача FRONT-001 | [frontend/tasks/001-landing-from-concept.md](frontend/tasks/001-landing-from-concept.md) | ТЗ на реализацию единого лендинга N1X VPN по концептам, адаптив, доступность и критерии приёмки |
| Задача FRONT-002 | [frontend/tasks/002-localization.md](frontend/tasks/002-localization.md) | ТЗ на переключение языка EN/RU без перезагрузки (`i18n.js` + `locales.json`) |
| Задача FRONT-003 | [frontend/tasks/003-corrections.md](frontend/tasks/003-corrections.md) | Правки: модалка `Complete your order`, страница аккаунта, шрифты, `.three-grid`, тарифы `#plans`, знак `€` |
| Backend: Telegram-бот | [backend/telegram-wishlist.md](backend/telegram-wishlist.md) | Архитектура PHP 8.4 бэкенда вишлиста, HTTP webhook, long polling, JSON-хранилище, проверки и ограничения |
| Backend: Docker Compose | [backend/docker-compose.md](backend/docker-compose.md) | Локальный запуск `site` + `bot` + `ngrok` (`localhost:4040`), регистрация webhook, ручное тестирование и диагностика |
| DevOps и CI/CD | [devops/deployment-ci.md](devops/deployment-ci.md) | GitHub Actions, публикация на GitHub Pages, Docker-образы, откат, требования к целевому хостингу |
| QA и приёмка | [qa/verification-plan.md](qa/verification-plan.md) | Автоматизированная проверка через Playwright + `pngjs`, матрица viewport/языков, проверки бота и приёмки |

## Утверждённые продуктовые решения (MVP)

- **Единый лендинг (`index.html`):** экраны `01-home`, `02-the-app`, `03-why-n1x`, `04-plans`, `07-support` собираются последовательными секциями на главной странице `index.html` с якорной навигацией.
- **Только тёмная тема:** светлая тема и переключатель темы не реализуются; используется тёмная палитра N1X VPN из концептов (`#0D0C12`–`#100F15`, `#CBF806`, `#F8F0E0`).
- **Тарифы (4 карточки):**
  - `Триал - 1 мес` — `€1`, `5` устройств, `Один раз для нового пользователя`;
  - `Далее - 1мес` — `€7`, `5` устройств;
  - `3 месяца` — `€15`, `5` устройств, `€5 в месяц`;
  - `12 месяцев` — `€55`, `5` устройств, `€4.58 в месяц`.
  Выбор любого тарифа открывает окно вишлиста; оплата в MVP не реализована.
- **Навигация CTA:** кнопки `Explore N1X` (`01-home`, `03-why-n1x`) ведут к секции `#plans`; кнопки `Get N1X`, выбора тарифа и `Contact support` открывают окно вишлиста.
- **Блок `Support` (`07-support.png`):** поле поиска реализуется как рабочий `<input>` (ввод, фокус, доступный `aria-label` и `placeholder`), без логики поиска на текущем этапе.
- **Шрифт, графика и тексты:** шрифт выявляется по фото концептов; логотип, фирменный знак `X` и иконки снимаются с `logo-lime-x-concept.png` и концептов в inline SVG; все EN-тексты переносятся в точности с фото (см. [copy-and-locales.md](frontend/copy-and-locales.md)).
- **Footer:** юридические ссылки `Privacy Policy` и `Terms of Use` делаются заглушками `href="#"`.
- **Telegram-бот и `.env`:** стартовые файлы `tg-bot/`, `docker/`, `compose.yaml` и `.env.example` готовятся сразу по примеру NordelVPN; адрес бота (`TELEGRAM_BOT_URL`), токен тестового бота (`TELEGRAM_BOT_TOKEN`) и `NGROK_AUTHTOKEN` будут добавлены в `.env` позже.

## Что не входит в текущий этап (вынесено в будущие этапы)

- Живой платёж и биллинг. Статический экран `05-checkout.png` делается в [задаче FRONT-003](frontend/tasks/003-corrections.md).
- Авторизация и API личного кабинета. Статическая страница `account-page/06-account.png` делается в [задаче FRONT-003](frontend/tasks/003-corrections.md).
- Серверная часть VPN, выдача VPN-конфигураций, связка серверов, реальный список серверов.
- Клиентские приложения Android, iOS, macOS, Windows (`mobile/01..08.png` — референс приложений; `01-home.png` и `02-connected.png` служат ориентиром для интерактивного демо-превью на лендинге).

## Внешние зависимости (подключаются позже)

1. **Адрес и токен тестового Telegram-бота + `NGROK_AUTHTOKEN`** — добавляются в локальный `.env` (не в Git) для финального подключения кнопки вишлиста и сквозного тестирования Docker Compose.
2. **Домен, `canonical` URL, доступы к целевому хостингу и офшорным IP** — передаются вне репозитория к этапу production-размещения.
3. **Валюта тарифов** — цены таблицы выше со знаком `€`: `€1`, `€7`, `€15`, `€55`.

## Базовые правила репозитория

- Не хранить секреты, токены ботов, `NGROK_AUTHTOKEN`, ключи, платёжные реквизиты и IP-адреса инфраструктуры в репозитории, документации и Docker build context.
- Не редактировать каталог `build/` вручную и не коммитить его в Git.
- Не выдавать заглушки (неактивную кнопку Telegram, демо-переключатель Connect, ссылки `#`) за рабочую интеграцию.
- Все незавершённые проверки и визуальные расхождения с концептами фиксировать явно в отчётах QA.
