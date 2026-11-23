# BOOTSTRAP-000 — Инициализация репозитория N1X VPN Landing

- **Исполнитель:** Frontend / Fullstack / DevOps (первая задача перед `FRONT-001` и `FRONT-002`).
- **Статус:** готово к выполнению.
- **Проект-исходник (референс):** [nordelVPN/company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native) (превью: [https://nordelvpn.github.io/company_nordel-landing_Native/](https://nordelvpn.github.io/company_nordel-landing_Native/)).
- **Цель:** подготовить полный рабочий каркас репозитория `company_n1xVPN-landing_Native` (сборка Webpack 5, линтер, Docker Compose, стартовые файлы PHP 8.4 Telegram-бота, CI/CD workflow и базовый QA-скрипт) по образцу NordelVPN, чтобы команда могла сразу приступать к вёрстке ([FRONT-001](../frontend/tasks/001-landing-from-concept.md)) и локализации ([FRONT-002](../frontend/tasks/002-localization.md)).

## Порядок выполнения задач в проекте

1. **`BOOTSTRAP-000` (эта задача)** — каркас репозитория, сборки, Docker, стартовые файлы `tg-bot/` и CI/CD.
2. **[`FRONT-001`](../frontend/tasks/001-landing-from-concept.md)** — вёрстка единого лендинга `index.html` по дизайн-концептам N1X VPN (только тёмная тема, 5 секций + общий `header`, `footer` и `<dialog>` вишлиста).
3. **[`FRONT-002`](../frontend/tasks/002-localization.md)** — подключение переключения языка `EN / RU` без перезагрузки по [спецификации текстов](../frontend/copy-and-locales.md).
4. **Интеграция `.env` и сквозная проверка** — после получения адреса и токена тестового бота + `NGROK_AUTHTOKEN` заполнить `.env`, прописать `wishlist.telegramUrl` и провести сквозной тест по [docker-compose.md](../backend/docker-compose.md) и [verification-plan.md](../qa/verification-plan.md).

## Объём работ

### 1. Конфигурация Node.js, Webpack, PostCSS и ESLint
Перенести с адаптацией под **N1X VPN** (исходник — [company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native)):

- `package.json`: имя `n1xvpn-landing`, скрипты `start`, `build:dev`, `build:prod`, `build`, `lint`, точный набор `devDependencies` и `browserslist` из [architecture.md](../architecture.md#базовый-packagejson-и-версии-пакетов).
- `webpack/pages.js`: единая страница `index`:
  ```js
  module.exports = {
    index: {
      template: './pages/index.hbs',
      data: './src/data/index.js',
      modules: ['i18n', 'navigation', 'app-preview', 'wishlist'],
      styles: ['base', 'pages/index']
    }
  };
  ```
  > Модуль `theme-toggle` **не подключается**: по решению владельца светлая тема не требуется.
- `webpack/webpack.common.js`: рендеринг Handlebars (`renderPage` с авто-регистрацией всех `src/templates/partials/*.hbs` и `year: new Date().getFullYear()`), `WatchPageSourcesPlugin`, `HtmlWebpackPlugin`, `MiniCssExtractPlugin`, `babel-loader`, `sass-loader` + `postcss-loader` + `css-loader`.
- `webpack/webpack.dev.js`: `mode: 'development'`, `devServer` на порту `3000` (`hot: true`, `open: true`, `static: './build/dev'`).
- `webpack/webpack.prod.js`: `mode: 'production'`, `TerserPlugin` + `CssMinimizerPlugin`, `contenthash:8`, `clean: true`.
- `postcss.config.js`: подключение `autoprefixer`.
- `eslint.config.js`: flat-конфигурация ESLint 9 для `src/**/*.js` и `webpack/**/*.js` со строгими правилами из [architecture.md](../architecture.md#конфигурация-eslint-и-postcss).
- `.gitignore`: исключить `/node_modules`, `/build`, `.env`, `.env*.local`, логи и кэш.

### 2. Стартовый каркас фронтенда (`pages/` и `src/`)
Создать минимальный собираемый каркас (полное наполнение выполняется в `FRONT-001` и `FRONT-002`):

- `pages/index.hbs` — композиция пяти секций: `{{> hero}}`, `{{> app-preview}}`, `{{> why-n1x}}`, `{{> pricing}}`, `{{> support}}`.
- `src/templates/layouts/main.hbs` — `<html lang="{{lang}}" data-theme="dark">`, `<meta name="color-scheme" content="dark">`, `skip-link`, `header`, `<main id="main-content">`, `footer`, `wishlist`.
- `src/templates/partials/` — заготовки `logo.hbs`, `brand-x.hbs`, `header.hbs`, `footer.hbs`, `hero.hbs`, `app-preview.hbs`, `why-n1x.hbs`, `pricing.hbs`, `plan-card.hbs`, `support.hbs`, `wishlist.hbs`.
- `src/data/index.js` и `src/data/locales.json` — заполнить стартовыми данными по [copy-and-locales.md](../frontend/copy-and-locales.md); `wishlist.telegramUrl` оставить пустым (или читать из переменной окружения при сборке, если подключён `DefinePlugin` — без передачи токена бота!).
- `src/styles/base.scss` и `src/styles/pages/index.scss` — CSS-токены тёмной палитры N1X (`:root`).
- `src/modules/i18n.js`, `navigation.js`, `app-preview.js`, `wishlist.js`.

### 3. Стартовые файлы Telegram-бота (`tg-bot/`)
Подготовить все PHP 8.4 файлы по образцу `company_nordel-landing_Native/tg-bot/` (адрес бота, токен тестового бота и `NGROK_AUTHTOKEN` будут добавлены позже в локальный `.env`):

- `tg-bot/common.php` — чтение `TELEGRAM_BOT_TOKEN` и `TELEGRAM_WEBHOOK_SECRET`, функция `telegram()`, атомарное сохранение пользователя `saveUser()` с `flock` и `tempnam`+`rename`, обработка `/start` с приветствием для **N1X VPN**.
- `tg-bot/webhook.php` — `GET /health` (`200 ok`), `POST /webhook` с проверкой `X-Telegram-Bot-Api-Secret-Token`, лимитом 65536 байт и валидацией `update_id`.
- `tg-bot/webhook-admin.php` — CLI-команды `set <https-url>`, `info`, `delete`.
- `tg-bot/bot.php` — альтернативный режим long polling.
- `tg-bot/README.md` — краткая памятка со ссылками на `docs/backend/telegram-wishlist.md` и `docs/backend/docker-compose.md`.

### 4. Docker, Compose и `.env.example`
Подготовить инфраструктурные файлы по образцу NordelVPN:

- `docker/site.Dockerfile` — multi-stage `node:22-alpine` → `nginx:stable-alpine`.
- `docker/bot.Dockerfile` — `php:8.4-cli-alpine`, пользователь `bot` (UID/GID 1000), `/data`, `EXPOSE 8080`.
- `docker/ngrok.yml` — `version: "3"`, `agent.web_addr: 0.0.0.0:4040`.
- `compose.yaml` — сервисы `site` (`127.0.0.1:${SITE_PORT:-3000}:80`), `bot` (`127.0.0.1:8080:8080`, `healthcheck`, volume `wishlist:/data`), `ngrok` (`127.0.0.1:4040:4040`, без `--url`, `depends_on: bot healthy`).
- `.env.example` — шаблон без реальных секретов:
  ```dotenv
  SITE_PORT=3000
  # Public Telegram bot link for the website wishlist (e.g. https://t.me/your_n1x_bot)
  TELEGRAM_BOT_URL=
  TELEGRAM_BOT_TOKEN=
  # Random secret: 1-256 characters, only A-Z a-z 0-9 _ -
  TELEGRAM_WEBHOOK_SECRET=
  NGROK_AUTHTOKEN=
  # Public ngrok URL is assigned automatically; find it at http://localhost:4040
  ```
  > `TELEGRAM_BOT_URL` может использоваться при сборке сайта (если подключена подстановка в `src/data/index.js` через `process.env.TELEGRAM_BOT_URL || ''`), при этом `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` и `NGROK_AUTHTOKEN` **никогда** не пробрасываются во frontend.
- `.dockerignore` — исключить `node_modules`, `.git`, `.idea`, `build`, `.env`, `.env.*`, `!.env.example`, `tg-bot/data`, `**/*.log`.

### 5. CI/CD и QA-скрипт
- `.github/workflows/pages.yml` — сборка на Node 22 (`npm ci`, `npm run lint`, `npm run build`), проверка `test -s build/prod/index.html`, публикация `build/prod` на GitHub Pages из ветки `main` (см. [deployment-ci.md](../devops/deployment-ci.md)).
- `scripts/verify-landing.cjs` — базовый скрипт проверки на `playwright` + `pngjs` по спецификации [verification-plan.md](../qa/verification-plan.md).

## Критерии готовности `BOOTSTRAP-000`

- [ ] `npm install` устанавливает зависимости без ошибок и создаёт `package-lock.json`.
- [ ] `npm run lint`, `npm run build:dev` и `npm run build:prod` завершаются с кодом `0`, генерируют непустой `build/prod/index.html` с подключёнными `css/index.*.css` и `js/index.*.js`.
- [ ] `npm run start` запускает dev-server на `http://localhost:3000`.
- [ ] `php -l` проходит без ошибок для всех 4 файлов `tg-bot/*.php` (если PHP установлен локально, иначе проверяется внутри `docker build -f docker/bot.Dockerfile`).
- [ ] `docker compose config --no-interpolate --quiet` валиден; образы `site` и `bot` собираются без ошибок.
- [ ] В репозитории нет реальных токенов, секретов, `.env` и каталога `build/`.
