# Сайт N1X VPN и Telegram-бот в Docker Compose

Инструкция по локальному запуску и ручному тестированию связки статического сайта **N1X VPN**, PHP 8.4 Telegram-бота и туннеля `ngrok` через Docker Compose v2.

## Состав сервисов (`compose.yaml`)

- **`site`** (`docker/site.Dockerfile`): multi-stage сборка (`node:22-alpine` → `nginx:stable-alpine`), раздаёт production-сборку Webpack `build/prod/` на `http://localhost:3000` (порт задаётся `SITE_PORT`, публикация только на `127.0.0.1`).
- **`bot`** (`docker/bot.Dockerfile`): `php:8.4-cli-alpine`, запускает `tg-bot/webhook.php` на порту `8080` от непривилегированного пользователя `bot` (UID/GID `1000`), имеет `healthcheck` на `GET http://127.0.0.1:8080/health`. Порт `8080` публикуется только на `127.0.0.1` для локальной диагностики.
- **`ngrok`** (`ngrok/ngrok:3`): отдельный контейнер с туннелем `http bot:8080 --config /etc/ngrok.yml` (зависит от `bot: condition: service_healthy`). Публикует локальную веб-панель инспектора на `127.0.0.1:4040`.
- **`wishlist`** (именованный Docker volume): монтируется в `/data` контейнера `bot` и хранит `/data/wishlist.json`.

> Compose запускает `ngrok` **без** `--url` и `--subdomain`: публичный dev-домен аккаунта выбирается автоматически и отображается в панели `http://localhost:4040`.

## Подготовка окружения

Требуется Docker Desktop (Linux containers) и Docker Compose v2. Все команды выполняются из корня репозитория (примеры для PowerShell):

```powershell
Copy-Item .env.example .env
```

Заполните `.env` локально (никогда не коммитьте `.env`):
- `SITE_PORT` — локальный порт сайта (по умолчанию `3000`);
- `TELEGRAM_BOT_TOKEN` — токен тестового бота из BotFather;
- `TELEGRAM_WEBHOOK_SECRET` — случайная строка, 1–256 символов `A–Z`, `a–z`, `0–9`, `_` или `-`;
- `NGROK_AUTHTOKEN` — токен аккаунта ngrok.

Генерация секрета в PowerShell:

```powershell
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

`.env` должен быть исключён в `.gitignore` и `.dockerignore`. Не добавляйте реальные токены в документацию, исходники или историю команд.

> Для проверки перехода с сайта в Telegram задайте согласованный URL `https://t.me/USERNAME_БОТА` в `src/data/index.js` (`wishlist.telegramUrl`), обновите описание и пересоберите образ `site`. Токен бота во frontend не передаётся.

## Сборка и запуск

```powershell
docker compose --env-file .env config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail 50 bot ngrok
```

1. Откройте сайт на `http://localhost:3000` (или `SITE_PORT`).
2. Откройте панель инспектора `http://localhost:4040` и скопируйте автоматически назначенный публичный HTTPS-адрес ngrok (далее обозначается как `https://your-domain.ngrok-free.app`).
3. Проверьте доступность `/health` локально и через публичный туннель:

```powershell
Invoke-WebRequest http://localhost:8080/health
Invoke-WebRequest https://your-domain.ngrok-free.app/health
```

Ожидается статус `200` и тело `ok`. Сайт через этот туннель не публикуется — туннель ведёт только на `bot:8080`.

## Панель ngrok на `localhost:4040`

Файл `docker/ngrok.yml` задаёт `agent.web_addr: 0.0.0.0:4040` внутри контейнера, а `compose.yaml` пробрасывает его строго на loopback (`127.0.0.1:4040:4040`).

В панели отображаются публичный HTTPS URL и журнал входящих HTTP-запросов, включая `POST /webhook` от Telegram.

> Панель может содержать тексты сообщений и секретный заголовок `X-Telegram-Bot-Api-Secret-Token` — никогда не публикуйте порт `4040` наружу.

Если менялась конфигурация `ngrok`:

```powershell
docker compose up -d --force-recreate ngrok
docker compose logs --tail 50 ngrok
Invoke-WebRequest http://localhost:4040
```

Для проверки конфигурации без раскрытия секретов:

```powershell
docker compose config --no-interpolate
```

## Подключение Telegram webhook

Регистрация выполняется вручную после получения публичного HTTPS-адреса в `localhost:4040`:

```powershell
docker compose exec bot php webhook-admin.php set https://your-domain.ngrok-free.app
docker compose exec bot php webhook-admin.php info
```

- Скрипт добавляет `/webhook` к переданному URL и передаёт `TELEGRAM_WEBHOOK_SECRET`.
- Используйте отдельного тестового бота, если основной бот уже работает в другом окружении.
- После смены публичного домена ngrok или секрета повторите `set`. После изменения `.env` пересоздайте контейнеры командой `docker compose up -d`.

## Чек-лист ручной проверки сквозного сценария

1. Откройте все страницы сайта на `http://localhost:3000`, проверьте стили, переключение языка EN/RU, интерактивное превью приложения и модальное окно вишлиста.
2. После настройки `wishlist.telegramUrl` перейдите с сайта в Telegram.
3. Отправьте боту `/start` — бот должен ответить приветствием N1X VPN, а в `http://localhost:4040` должен появиться `POST /webhook` со статусом `200`.
4. Повторите `/start` — приветствие придёт снова, запись пользователя в файле должна остаться **одной**.
5. Проверьте состояние webhook командой `docker compose exec bot php webhook-admin.php info` — очередь `pending_update_count` должна быть `0`, `last_error_message` отсутствует.
6. Проверьте сохранность данных и устойчивость к перезапуску:

```powershell
docker compose exec bot cat /data/wishlist.json
docker compose restart bot
docker compose exec bot cat /data/wishlist.json
```

7. Проверьте защиту секретным заголовком (ожидается `403 forbidden`):

```powershell
curl.exe -i -X POST http://localhost:8080/webhook -H "Content-Type: application/json" --data "{}"
```

> `/health` проверяет только доступность HTTP-процесса, а не валидность токена, сетевую доступность Telegram или права записи в volume. Полная работоспособность подтверждается только реальным `/start`.

## Остановка, обновление и переключение на long polling

```powershell
docker compose up -d --build
docker compose logs --tail 100 bot ngrok
docker compose down
```

- `docker compose down` сохраняет volume `wishlist`. Команда `docker compose down -v` **удаляет** сохранённый вишлист — не используйте её, если данные нужны.
- Остановка контейнеров не удаляет webhook на стороне Telegram.
- Перед переходом на локальный long polling удалите webhook при работающем контейнере `bot`:

```powershell
docker compose exec bot php webhook-admin.php delete
docker compose down
```

Затем запускайте `php tg-bot/bot.php` с переменными `TELEGRAM_BOT_TOKEN` и `WISHLIST_FILE`.

## Диагностика частых проблем

- **Compose жалуется на отсутствующую переменную:** заполните соответствующее поле в `.env`.
- **`ngrok` не стартует / `ERR_NGROK_313`:** проверьте `NGROK_AUTHTOKEN`, убедитесь через `docker compose config --no-interpolate`, что в `command` сервиса `ngrok` нет `--url`, и пересоздайте контейнер через `--force-recreate`.
- **Сайт не открывается:** проверьте занятость `SITE_PORT` и `docker compose logs site`.
- **`/health` отвечает `200`, но бот молчит:** проверьте `webhook-admin.php info`, совпадение публичного URL, `TELEGRAM_BOT_TOKEN` и `TELEGRAM_WEBHOOK_SECRET`, а также что бот не занят другим процессом polling.
- **`403` от `/webhook`:** не совпадает секрет — пересоздайте `bot` и выполните `webhook-admin.php set` заново.
- **`500` от `/webhook`:** проверьте `docker compose logs bot`, доступность `api.telegram.org` и права на `/data`.
- **Повреждён `/data/wishlist.json`:** обработчик намеренно не перезаписывает файл; восстановите его из резервной копии.
