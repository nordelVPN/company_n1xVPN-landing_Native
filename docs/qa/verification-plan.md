# План проверок и QA-автоматизации (N1X VPN)

Документ описывает обязательные автоматизированные и ручные проверки фронтенда, локализации, бэкенда Telegram-вишлиста и сквозного пользовательского сценария по методике проекта-исходника [nordelVPN/company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native) (см. `scripts/verify-landing.cjs`).

## 1. Статический анализ и сборки

Перед каждым прогоном браузерных проверок выполняются команды из корня проекта:

```bash
npm run lint
npm run build:dev
npm run build:prod
```

Успешным считается прогон с кодом возврата `0`, без ошибок ESLint и с непустыми выходными файлами HTML/CSS/JS в `build/dev/` и `build/prod/`.

## 2. Автоматизированная проверка фронтенда (`scripts/verify-landing.cjs`)

На базе `playwright` (`^1.65.1`) и `pngjs` (`^7.0.0`) реализуется скрипт `scripts/verify-landing.cjs`:

- Поднимает локальный статический HTTP-сервер из `build/prod/` на `127.0.0.1` (проверки выполняются строго по HTTP, а не через `file://`).
- Принимает аргументы движка и опционального канала браузера:
  ```bash
  node scripts/verify-landing.cjs chromium chrome
  node scripts/verify-landing.cjs firefox
  node scripts/verify-landing.cjs webkit
  ```
- Сохраняет машинный отчёт и скриншоты в `docs/qa/front-001/<engine>/`:
  - `report.json` — сводка всех проверок, измерений, ошибок и диагностических сравнений;
  - полные снимки `index.html` (`fullPage: true`) на `375 / 768 / 1440 px` (в `en` и `ru`);
  - снимки отдельных секций (`#home`, `#the-app`, `#why-n1x`, `#plans`, `#support`) на ширине эталонов (`1672×941` / `1671×941`) с наложением `*-overlay.png` и картой разности `*-difference.png` против PNG из `docs/assets/images/concept/`.

> Число `meanChannelDifference` в `report.json` служит **только диагностикой**, а не автоматическим критерием визуальной приёмки (на него влияют шрифты, сглаживание, иконки и 4 тарифа вместо 3 на `04-plans.png`).

## 3. Матрица браузерных проверок

### Viewport, тема и языки
- **Страница:** единый лендинг `index.html` (5 секций + `header` + `footer` + `<dialog>`).
- **Ширины:** `375 px` (mobile), `768 px` (tablet), `1440 px` (desktop), а также сравнение секций на `1672 × 941` / `1671 × 941`.
- **Тема:** только `dark` (`html[data-theme="dark"]`; светлая тема не реализуется).
- **Языки:** `en` (по умолчанию) и `ru` (через `[data-language-select]`).
- **Браузеры:** Chromium/Chrome, Firefox, WebKit (автоматизация WebKit не заменяет финальную проверку в реальном Safari на целевом устройстве).

### Обязательные assertions на каждом сценарии

1. **Геометрия и отсутствие переполнений:**
   - `document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1`;
   - ни один текстовый/интерактивный элемент внутри `main` не выходит за границы viewport (`left >= -1`, `right <= innerWidth + 1`);
   - на странице ровно один `<h1>`.
2. **Ошибки среды:**
   - 0 ошибок `pageerror`;
   - 0 сообщений `console` типа `error`;
   - 0 HTTP-ответов `status >= 400` и 0 `requestfailed`.
3. **Навигация и якорные переходы:**
   - ссылки `The app` (`#the-app`), `Why N1X` (`#why-n1x`), `Support` (`#support`) и кнопки `Explore N1X` (`#plans`) ведут на существующие ID секций;
   - при `width <= 900`: фокус на `[data-menu-toggle]` → `Enter` → `aria-expanded === 'true'`, `#main-nav` видим → `Escape` → `aria-expanded === 'false'` и возврат фокуса на `[data-menu-toggle]`.
4. **Интерактивное превью приложения (`[data-app-preview]`):**
   - `Enter` / клик по `[data-connect]` переключает `aria-pressed` (`true` ↔ `false`), обновляет статус и сервер (`Not connected` / `Automatic` ↔ `Connected (preview)` / `Netherlands • Amsterdam`), отображает пометку демо-режима;
   - клик по `[data-demo-info]` показывает `[data-demo-notice]`.
5. **Тарифы (`#plans`):**
   - отображаются ровно 4 карточки (`1`, `7`, `15`, `55`, `5 devices` / `5 устройств`) без подставленной валюты;
   - кнопка выбора каждого тарифа открывает `<dialog data-wishlist>`.
6. **Секция поддержки (`#support`):**
   - поле поиска — рабочий `<input>` (принимает ввод текста и фокус, `placeholder` переводится при смене языка);
   - кнопка `Contact support` открывает `<dialog data-wishlist>`.
7. **Модальное окно вишлиста (`<dialog data-wishlist>`):**
   - открытие по `[data-wishlist-open]` с клавиатуры (`Enter`) — из `header`, тарифов, `Contact support` и `footer`;
   - пока `wishlist.telegramUrl` пуст — кнопка перехода в Telegram видна в состоянии `disabled`;
   - `Tab` удерживает фокус внутри диалога;
   - закрытие по `Escape`, кнопке закрытия и клику по backdrop возвращает фокус на элемент-инициатор.
8. **Footer:**
   - меню footer остаётся видимым на `375px` и не даёт горизонтального переполнения;
   - присутствуют юридические заглушки `Privacy Policy` и `Terms of Use` (`href="#"`) и копирайт с текущим годом;
   - кнопка `Get N1X` в footer открывает диалог и возвращает фокус после `Escape`.
9. **Локализация EN / RU (`FRONT-002`):**
   - наборы ключей `en` и `ru` в `src/data/locales.json` строго совпадают;
   - переключение на `ru` обновляет `<html lang="ru">`, `<title>`, `<meta name="description">`, `placeholder` поиска и все `data-i18n*` тексты и атрибуты;
   - состояние `app-preview` (подключено) сохраняется при смене языка;
   - выбор языка сохраняется после `page.reload()`;
   - обратное переключение на `en` возвращает точные английские тексты с концептов.
10. **Доступность:**
    - `prefers-reduced-motion: reduce` отключает плавный скролл (`scrollBehavior === 'auto'`) и лишние анимации;
    - у интерактивных элементов при фокусе присутствует видимый `outline`.

## 4. Проверки backend Telegram-вишлиста и Docker Compose

Полная матрица проверок PHP 8.4 бэкенда описана в [../backend/telegram-wishlist.md](../backend/telegram-wishlist.md#матрица-обязательных-проверок-бэкенда) и [../backend/docker-compose.md](../backend/docker-compose.md#чек-лист-ручной-проверки-сквозного-сценария):

- PHP lint всех 4 файлов `tg-bot/*.php`;
- `docker compose config --no-interpolate --quiet` и сборка образов `site` и `bot`;
- HTTP-тесты статусов `200 / 400 / 403 / 404 / 413` и невозможность скачать `common.php`;
- проверки JSON-хранилища (создание, обновление без дублей, сохранение `createdAt`, отказ без перезаписи на битом JSON);
- после добавления токена тестового бота и `NGROK_AUTHTOKEN` в `.env` — сквозной тест: сайт → переход в Telegram → `/start` → приветствие → запись в `/data/wishlist.json` → повторный `/start` → `docker compose restart bot` → сохранность данных.

## 5. Правила отчётности QA

- По итогам приёмки создаётся отчёт валидации `docs/frontend/tasks/001-validation.md` и сохраняется машинный артефакт `docs/qa/front-001/<engine>/report.json`.
- **Запрещено отмечать проверку пройденной без фактического запуска и артефакта.** Непроверенные браузеры, визуальные отличия и незаполненные внешние зависимости (адрес/токен бота, `NGROK_AUTHTOKEN`, домен) фиксируются явно в разделе ограничений.
