# DevOps, CI/CD и развёртывание N1X VPN Landing

Документ описывает требования к сборке в CI, публикации предпросмотра на GitHub Pages, контейнеризации и последующему размещению проекта на целевом хостинге по образцу проекта-исходника [nordelVPN/company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native).

## 1. CI/CD в GitHub Actions (`.github/workflows/pages.yml`)

### Триггеры
- `push` в ветку `main` — сборка, проверка и деплой на GitHub Pages;
- `pull_request` в ветку `main` — только сборка и проверки (без деплоя);
- `workflow_dispatch` — ручной запуск (деплой выполняется только для `refs/heads/main`).

### Задание `build`
- Окружение: `ubuntu-latest`, `timeout-minutes: 10`, `permissions: { contents: read }`.
- Шаги:
  1. `actions/checkout@v6`.
  2. `actions/setup-node@v6` с `node-version: '22'` и `cache: npm`.
  3. `npm ci`.
  4. `npm run lint` (рекомендуемое усиление относительно базового Nordel, где линт оставался в бэклоге CI).
  5. `npm run build` (`npm run build:prod`).
  6. Проверка существования и непустоты всех HTML-точек входа (например, `test -s build/prod/index.html` и остальных страниц из `webpack/pages.js`).
  7. `actions/upload-pages-artifact@v4` (`path: build/prod`) — только если `github.event_name != 'pull_request' && github.ref == 'refs/heads/main'`.

### Задание `deploy`
- Запускается только при `github.event_name != 'pull_request' && github.ref == 'refs/heads/main'` после успешного `build`.
- Разрешения минимально необходимые: `pages: write`, `id-token: write`.
- `concurrency`: `{ group: github-pages, cancel-in-progress: false }`.
- Окружение: `github-pages`.
- Шаги: `actions/configure-pages@v5` → `actions/deploy-pages@v4`.

### Настройка репозитория для GitHub Pages
1. В настройках репозитория **Settings → Pages → Build and deployment → Source** выбрать **GitHub Actions**.
2. Убедиться в успешном прохождении заданий `build` и `deploy` во вкладке **Actions**.
3. Проверить опубликованный сайт: загрузку HTML/CSS/JS, SVG-графики, навигацию, переключение языка EN/RU, окно вишлиста и отсутствие ошибок консоли.

## 2. Процедура отката

Для возврата к предыдущей стабильной версии:
1. Создать `revert`-коммит проблемного изменения в ветке `main` через стандартную проверку PR.
2. После merge GitHub Actions автоматически выполнит пересборку и публикацию предыдущего состояния.
3. Проверить доступность сайта после деплоя. Процедуру отката необходимо испытать и зафиксировать до финального релиза.

## 3. Docker-образы

- **`docker/site.Dockerfile`:**
  - Stage 1 (`node:22-alpine`): `COPY package.json package-lock.json ./` → `RUN npm ci` → `COPY . .` → `RUN npm run build`.
  - Stage 2 (`nginx:stable-alpine`): `COPY --from=build /app/build/prod/ /usr/share/nginx/html/`, `EXPOSE 80`.
- **`docker/bot.Dockerfile`:**
  - База: `php:8.4-cli-alpine`.
  - Копируются только `tg-bot/common.php`, `tg-bot/bot.php`, `tg-bot/webhook.php`, `tg-bot/webhook-admin.php`.
  - Создаётся пользователь `bot` (UID/GID `1000`) и каталог `/data` с владельцем `bot:bot`.
  - `USER bot`, `EXPOSE 8080`, `CMD ["php", "-S", "0.0.0.0:8080", "webhook.php"]` (для локального стенда).
- **`.dockerignore`:** исключает `node_modules`, `.git`, `.idea`, `build`, `.env`, `.env.*` (кроме `!.env.example`), `tg-bot/data`, `**/*.log`.
- Для фиксированного production-окружения рекомендуется закреплять образы по проверенному digest вместо плавающих тегов.

## 4. Требования к целевому production-размещению

Публикация на GitHub Pages используется как предпросмотр статики и **не закрывает** требования к целевому хостингу:

- [ ] Получить доступы и утвердить схему размещения сайта на целевом хостинге через офшорные IP (вне репозитория).
- [ ] Зарегистрировать/привязать домен, настроить DNS и автоматический HTTPS (TLS).
- [ ] Заполнить поле `canonical` в `src/data/*.js` после утверждения домена и пересобрать сайт.
- [ ] Развернуть Telegram-бота отдельно от статического хостинга (GitHub Pages не исполняет PHP).
- [ ] Для production-бота заменить встроенный PHP-сервер (`php -S`) на **PHP-FPM + Nginx** с TLS-терминацией на публичном домене.
- [ ] Настроить мониторинг доступности (`/health`, сайт), ротацию логов, резервное копирование вишлиста и проверку восстановления из бэкапа.
- [ ] Подключить в CI автоматизированные браузерные проверки (`scripts/verify-landing.cjs`) в дополнение к сборке и `npm run lint`.

## 5. Правила безопасности и секретов

- Конкретные IP-адреса инфраструктуры, SSH-ключи, доступы к регистратору/DNS/хостингу, платёжные реквизиты, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` и `NGROK_AUTHTOKEN` **никогда не хранятся в репозитории**.
- Пользовательские секреты GitHub для деплоя статики на GitHub Pages не требуются (используется OIDC `id-token: write`).
- Секреты для production-окружений передаются через защищённый менеджер секретов или переменные окружения на целевом хосте.
