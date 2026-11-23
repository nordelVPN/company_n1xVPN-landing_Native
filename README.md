# N1X VPN Landing

Статический лендинг: Webpack 5, Handlebars, SCSS, vanilla JS; PHP 8.4 Telegram-вишлист.

## Разработка

Node.js 22+, npm 9+:

```sh
npm ci
npm run start
npm run lint
npm run build:dev
npm run build:prod
```

Сайт: http://localhost:3000. Если порт занят: `npm run start -- --port 3001`.
В Windows PowerShell с ограниченной ExecutionPolicy используйте `npm.cmd`.
Результат production-сборки: `build/prod/`. Исходники редактируются в `src/` и `pages/`.

## Проверки

```sh
npx playwright install chromium firefox webkit
node scripts/verify-landing.cjs chromium
node scripts/verify-landing.cjs firefox
node scripts/verify-landing.cjs webkit
node scripts/verify-backend.cjs
```

Backend-проверка требует PHP в PATH (или переменную PHP_BINARY).
Отчёты и скриншоты: `docs/qa/`.
[Результаты FRONT-003](docs/frontend/tasks/003-validation.md).

Страницы: `index.html`, `login.html`, `account.html`. Демо-вход доступен через ссылку в footer и `login.html`; нажмите «Log in to demo» с предзаполненной почтой. Пароль не требуется, данные не отправляются на сервер. Аккаунт доступен напрямую как демонстрационный экран.

## Telegram и Docker

Скопируйте `.env.example` в `.env`, заполните настройки локально для PHP-бота. В FRONT-003 кнопки сайта открывают демо-заказ; Telegram-кнопка в этом диалоге заменена формой по макету. PHP-бот сохранён.
Секреты не добавляются в Git.

```sh
docker compose up --build -d
```

[Регистрация webhook и сквозной тест](docs/backend/docker-compose.md).
[Вся документация](docs/README.md).
Сборка и браузерная проверка на PR; публикация Pages после push в main (Settings → Pages → GitHub Actions).

Основа сборки и PHP: nordelVPN/company_nordel-landing_Native, commit 0386f6bc86b8d4f880cc9340d7f2cb3b7e7b47b4.
