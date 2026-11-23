# Архитектура проекта N1X VPN Landing

Документ фиксирует целевую структуру репозитория, технологический стек, зависимости и конфигурацию сборки проекта `company_n1xVPN-landing_Native`, унаследованные от проекта-исходника **NordelVPN**:
- исходный репозиторий (референс): [nordelVPN/company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native);
- превью эталона: [https://nordelvpn.github.io/company_nordel-landing_Native/](https://nordelvpn.github.io/company_nordel-landing_Native/).

## Технологический стек

### Frontend (статический лендинг)
- **Сборка:** Webpack 5 (`webpack`, `webpack-cli`, `webpack-dev-server`) с раздельными конфигурациями `dev` и `prod`. Манифест `webpack/pages.js` сохраняет возможность добавления новых HTML-страниц, при этом в MVP все 5 веб-экранов собраны секциями единого `index.html`.
- **Шаблонизация:** Handlebars 4 (`handlebars`, `html-webpack-plugin`) — единый layout `src/templates/layouts/main.hbs`, авто-регистрация partials верхнего уровня из `src/templates/partials/`.
- **Стили:** SCSS (`sass`, `sass-loader`, `css-loader`, `postcss-loader`, `autoprefixer`, `mini-css-extract-plugin`, `css-minimizer-webpack-plugin`) с CSS custom properties тёмной палитры N1X VPN (светлая тема не реализуется).
- **Скрипты:** модульный vanilla JavaScript (CommonJS/ESNext через `@babel/core` + `babel-loader`, без SPA-фреймворков), минификация через `terser-webpack-plugin`.
- **Контроль качества:** ESLint 9 (`eslint.config.js` в flat-формате), Playwright + `pngjs` для автоматизированной браузерной и визуальной проверки (`scripts/verify-landing.cjs`).
- **Среда сборки:** Node.js 22 (зафиксировано в CI и `docker/site.Dockerfile`), npm 9+.

### Backend (Telegram-бот вишлиста)
- **Среда выполнения:** PHP 8.4 (`php:8.4-cli-alpine` в Docker), без сторонних пакетов Composer (используются только встроенные расширения PHP, HTTPS stream wrapper, `json_*`, `flock`).
- **Режимы работы:** HTTP Webhook (`tg-bot/webhook.php`) для Docker/ngrok и альтернативный long polling (`tg-bot/bot.php`) для локального CLI-запуска.
- **Хранилище MVP:** JSON-файл `/data/wishlist.json` на именованном Docker volume `wishlist` с файловой блокировкой `flock(LOCK_EX)` и атомарной заменой через `tempnam` + `rename`.
- **Разделение ролей сред:** Node.js используется исключительно для сборки фронтенда и QA-скриптов; серверная часть бота полностью работает на PHP 8.4.

### Инфраструктура и CI/CD
- **Локальное окружение:** Docker Compose v2 — три сервиса: `site` (`nginx:stable-alpine`), `bot` (`php:8.4-cli-alpine`), `ngrok` (`ngrok/ngrok:3`, локальная панель на `127.0.0.1:4040`).
- **CI/CD:** GitHub Actions (`.github/workflows/pages.yml`) — сборка на PR и push в `main`, проверка непустого `build/prod/index.html`, публикация `build/prod` на GitHub Pages из ветки `main`.

## Целевая структура репозитория

Исходники сайта располагаются в корне проекта (не во вложенной папке `site/`):

```text
.github/
  workflows/
    pages.yml                  CI/CD сборка и публикация на GitHub Pages
docker/
  site.Dockerfile              Multi-stage сборка (node:22-alpine -> nginx:stable-alpine)
  bot.Dockerfile               PHP 8.4 образ бота (UID/GID 1000, /data)
  ngrok.yml                    Конфигурация ngrok v3 (web_addr: 0.0.0.0:4040)
docs/                          Вся проектная, техническая и QA-документация
  assets/images/concept/       Эталонные PNG дизайн-концепты N1X VPN
  backend/                     Документация Telegram-бота и Docker Compose
  devops/                      Документация CI/CD и развёртывания
  frontend/                    Документация фронтенда, компонентов, текстов и задач
  qa/                          План проверок и сохраняемые отчёты прогонов
  tasks/                       Стартовые общепроектные задачи (BOOTSTRAP-000)
pages/                         Исходные Handlebars-страницы
  index.hbs                    Единый лендинг (5 секций: hero, app-preview, why-n1x, pricing, support)
scripts/
  verify-landing.cjs           Скрипт браузерной и визуальной проверки (Playwright + pngjs)
src/
  assets/                      Статические ресурсы сайта (favicon, шрифты при локальном подключении)
  data/                        Данные и тексты страниц + словарь переводов
    index.js                   Контент и SEO-поля главной страницы
    locales.json               Словарь локализации { "en": {...}, "ru": {...} }
  modules/                     Независимые vanilla JS-модули
    i18n.js                    Переключение языков EN/RU без перезагрузки
    navigation.js              Мобильное меню, Escape, фокус, закрытие при ресайзе
    app-preview.js             Интерактивное демо-превью приложения N1X VPN
    wishlist.js                Управление <dialog data-wishlist>
  styles/
    base.scss                  Дизайн-токены тёмной темы (:root), reset, layout, header, footer, modal
    pages/
      index.scss               Стили 5 секций главной страницы
  templates/
    layouts/
      main.hbs                 Единый HTML-каркас (skip-link, header, main, footer, wishlist)
    partials/                  Переиспользуемые Handlebars-компоненты и inline SVG
      logo.hbs                 Векторный логотип X N1X VPN (с logo-lime-x-concept.png)
      brand-x.hbs              Декоративный фоновый/геройский знак X (лайм + кремовый)
      header.hbs               Единая шапка
      footer.hbs               Единый подвал
      hero.hbs                 Секция 1: 01-home
      app-preview.hbs          Секция 2: 02-the-app + интерактивный макет
      why-n1x.hbs              Секция 3: 03-why-n1x
      pricing.hbs              Секция 4: 04-plans (4 утверждённых тарифа)
      plan-card.hbs            Карточка тарифа
      support.hbs              Секция 5: 07-support (рабочий input, 3 категории, Contact support)
      wishlist.hbs             Модальное окно вишлиста (<dialog>)
tg-bot/
  common.php                   Telegram Bot API, обработка /start, атомарное JSON-хранилище
  webhook.php                  HTTP-маршрутизатор (GET /health, POST /webhook)
  webhook-admin.php            CLI-утилита (set, info, delete)
  bot.php                      Альтернативный режим long polling
webpack/
  pages.js                     Единый манифест страниц (template, data, modules, styles)
  webpack.common.js            Общая конфигурация, рендер Handlebars, WatchPageSourcesPlugin
  webpack.dev.js               Dev-конфигурация (devServer :3000, HMR, source-map)
  webpack.prod.js              Prod-конфигурация (Terser, CssMinimizer, contenthash)
build/                         Артефакты сборок (не коммитится в Git)
  dev/                         Результат npm run build:dev
  prod/                        Результат npm run build:prod
compose.yaml                   Docker Compose (site, bot, ngrok, volume wishlist)
.env.example                   Шаблон переменных окружения без секретов
.dockerignore                  Исключения из Docker build context
.gitignore                     Исключения Git (/node_modules, /build, .env и т. д.)
eslint.config.js               Конфигурация ESLint 9
postcss.config.js              Подключение Autoprefixer
package.json                   Скрипты, devDependencies и browserslist
```

## Базовый `package.json` и версии пакетов

Целевой состав пакетов и npm-скриптов переносится напрямую из проекта-исходника [nordelVPN/company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native):

```json
{
  "name": "n1xvpn-landing",
  "version": "0.1.0",
  "private": true,
  "description": "N1X VPN static landing",
  "scripts": {
    "start": "webpack serve --config webpack/webpack.dev.js",
    "build:dev": "webpack --config webpack/webpack.dev.js",
    "build:prod": "webpack --config webpack/webpack.prod.js",
    "build": "npm run build:prod",
    "lint": "eslint src webpack"
  },
  "devDependencies": {
    "@babel/core": "^7.26.0",
    "autoprefixer": "^10.4.20",
    "babel-loader": "^9.2.1",
    "clean-webpack-plugin": "^4.0.0",
    "copy-webpack-plugin": "^12.0.2",
    "css-loader": "^7.1.2",
    "css-minimizer-webpack-plugin": "^7.0.2",
    "eslint": "^9.17.0",
    "handlebars": "^4.7.8",
    "handlebars-loader": "^1.7.3",
    "html-webpack-plugin": "^5.6.3",
    "mini-css-extract-plugin": "^2.9.2",
    "playwright": "^1.65.1",
    "pngjs": "^7.0.0",
    "postcss": "^8.4.49",
    "postcss-loader": "^8.1.1",
    "sass": "^1.83.4",
    "sass-loader": "^16.0.4",
    "style-loader": "^4.0.0",
    "terser-webpack-plugin": "^5.3.11",
    "webpack": "^5.97.1",
    "webpack-cli": "^6.0.1",
    "webpack-dev-server": "^5.2.0"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "Firefox ESR",
    "not dead"
  ]
}
```

## Принцип работы сборки Webpack

1. **Единый манифест `webpack/pages.js`** описывает каждую страницу объектом `{ template, data, modules, styles }`. Для `index` Webpack формирует entry-чанк (SCSS + JS-модули в порядке `['i18n', 'navigation', 'app-preview', 'wishlist']`) и `HtmlWebpackPlugin` (`index.html`, `inject: 'body'`, `cache: false`).
2. **Рендеринг Handlebars (`renderPage` в `webpack/webpack.common.js`)**:
   - при каждом рендере регистрирует все `*.hbs` из `src/templates/partials/` по имени файла без расширения;
   - сбрасывает `require.cache` для файла данных страницы, компилирует шаблон страницы и оборачивает результат в `src/templates/layouts/main.hbs`, передавая `year: new Date().getFullYear()` и `body`.
3. **Наблюдение за исходниками (`WatchPageSourcesPlugin`)**:
   - добавляет `main.hbs`, директорию `partials/`, все шаблоны страниц и файлы `src/data/*.js` в `fileDependencies`/`contextDependencies` компиляции;
   - при добавлении новых страниц в `webpack/pages.js` требуется перезапуск `npm run start`.
4. **Выходные артефакты**:
   - `build/dev/` или `build/prod/` с автоматической очисткой (`output.clean: true`);
   - JS в `js/[name].[contenthash:8].js`;
   - CSS извлекается через `MiniCssExtractPlugin` в `css/[name].[contenthash:8].css`;
   - в `dev` включены `source-map` и `webpack-dev-server` (порт `3000`, `hot: true`);
   - в `prod` `devtool: false`, включена минификация JS (`TerserPlugin`) и CSS (`CssMinimizerPlugin`).

## Конфигурация ESLint и PostCSS

- **`postcss.config.js`:** подключает `autoprefixer` с опорой на `browserslist` из `package.json`.
- **`eslint.config.js`:** игнорирует `node_modules/**` и `build/**`, проверяет `src/**/*.js` и `webpack/**/*.js` (`ecmaVersion: 'latest'`, `sourceType: 'commonjs'`, globals: `document`, `window`, `localStorage`, `console`, `__dirname`) со строгими правилами:
  - `no-undef: 'error'`
  - `no-unused-vars: ['error', { argsIgnorePattern: '^_' }]`
  - `no-unreachable: 'error'`
  - `no-constant-condition: 'error'`
  - `valid-typeof: 'error'`
  - `eqeqeq: ['error', 'always']`

## Ключевые архитектурные инварианты

1. **Разделение слоёв:** контент и SEO-поля хранятся в `src/data/`, разметка — в Handlebars, стили и токены — в SCSS, интерактивность — в независимых JS-модулях `src/modules/`. Интерактивная логика не помещается в Handlebars.
2. **Отказоустойчивость JS-модулей:** каждый модуль безопасно завершает инициализацию, если его DOM-элементы отсутствуют на странице; недоступность `localStorage` перехватывается через `try/catch` и не ломает работу сайта.
3. **Работа без JavaScript:** базовый английский HTML, якорная навигация и структура всех 5 секций остаются доступными при отключённом JS.
4. **Безопасность внешних ссылок и секретов:** все внешние ссылки с `target="_blank"` обязаны иметь `rel="noopener noreferrer"`. Токен Telegram-бота никогда не передаётся во frontend.
5. **Тёмная дизайн-система:** все цвета, поверхности, границы и акценты задаются CSS custom properties в `:root` (`src/styles/base.scss`).
