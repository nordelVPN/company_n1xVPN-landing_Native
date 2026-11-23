# Backend Telegram-вишлиста (PHP 8.4)

Документ задаёт архитектуру и требования к PHP-бэкенду Telegram-вишлиста **N1X VPN**, полностью унаследованные от проверенной реализации проекта-исходника [nordelVPN/company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native) (каталог `tg-bot/`).

## Архитектура и роль компонента

- Бэкенд вишлиста работает на **PHP 8.4** (`php:8.4-cli-alpine` в Docker), без сторонних зависимостей Composer.
- **Node.js** в проекте используется исключительно для сборки статического сайта и QA-скриптов, а не для бота.
- Текущая схема доставки обновлений в Docker-окружении:

```text
Telegram → публичный HTTPS-адрес /webhook → ngrok → bot:8080/webhook → PHP-обработчик (tg-bot/webhook.php)
```

- Сайт запускается отдельным сервисом; туннель `ngrok` публикует только HTTP-сервер бота.
- Инструкция по запуску в Docker Compose и ручному тестированию: [docker-compose.md](docker-compose.md).

## Структура файлов `tg-bot/`

| Файл | Назначение |
|---|---|
| `tg-bot/common.php` | Общий модуль: чтение `TELEGRAM_BOT_TOKEN` и валидация `TELEGRAM_WEBHOOK_SECRET`, вызовы Telegram Bot API (`telegram()`), атомарное сохранение пользователя (`saveUser()`), обработка команды `/start` (`handleUpdate()`) |
| `tg-bot/webhook.php` | HTTP-роутер для встроенного PHP-сервера: `GET /health` и `POST /webhook` с проверкой секрета, лимитом тела и валидацией JSON |
| `tg-bot/webhook-admin.php` | CLI-утилита регистрации, проверки и удаления webhook: `set <https-url>`, `info`, `delete` |
| `tg-bot/bot.php` | Альтернативный CLI-режим long polling (`getUpdates`); **нельзя запускать одновременно с webhook** |

## HTTP-контракт (`tg-bot/webhook.php`)

| Запрос | Ожидаемый ответ | Требование |
|---|---|---|
| `GET /health` | `200 ok` | Проверка живости HTTP-процесса (используется Docker `healthcheck`) |
| Любой другой путь / метод (включая `GET /webhook`, `GET /common.php`) | `404 not found` | Исходные PHP-файлы никогда не отдаются наружу |
| `POST /webhook` без корректного заголовка `X-Telegram-Bot-Api-Secret-Token` | `403 forbidden` | Сравнение через `hash_equals()` |
| `POST /webhook` с телом `> 65536` байт | `413 too large` | Чтение ограничено `65537` байтами |
| `POST /webhook` с невалидным JSON или без целого `update_id` | `400 invalid JSON` / `400 invalid update` | Строгий `JSON_THROW_ON_ERROR` |
| `POST /webhook` с валидным `update_id` (с `/start` или без сообщения) | `200 ok` | Нерелевантные сообщения безопасно игнорируются |
| Внутренняя ошибка обработки / записи / Telegram API | `500 processing failed` | Логируется без утечки токена; Telegram может повторить доставку |

### Валидация секрета и URL
- `TELEGRAM_WEBHOOK_SECRET`: 1–256 символов из набора `A–Z`, `a–z`, `0–9`, `_`, `-` (`^[A-Za-z0-9_-]{1,256}$`).
- `webhook-admin.php set <https-url>`: принимает только чистый HTTPS URL (без user/pass/query/fragment), автоматически добавляет `/webhook`, передаёт `secret_token`, `allowed_updates: ['message']`, `max_connections: 1`.
- Регистрация webhook выполняется вручную после старта туннеля, а не автоматически при запуске контейнера. Pending updates при `set`/`delete` намеренно не удаляются.

## Бизнес-логика `/start` и формат JSON-хранилища

### Обработка команды `/start`
- Распознаются команды `/start`, `/start@BotUsername` и `/start <payload>` (регулярное выражение `~^/start(?:@[A-Za-z0-9_]+)?(?:\s|$)~`).
- Проверяется наличие целого `message.from.id` и `message.chat.id`.
- Пользователь сохраняется в файл `WISHLIST_FILE` (по умолчанию `/data/wishlist.json` в Docker или `tg-bot/data/wishlist.json` локально).
- Пользователю отправляется приветствие через `sendMessage` (текст приветствия согласовать для бренда **N1X VPN**; базовая редакция: *«Здравствуйте, мы ещё не запустили наше приложение N1X VPN, но Вы добавлены в вишлист! Мы будем держать Вас в курсе!»*).

### Схема записи пользователя в `wishlist.json`
Файл хранит JSON-массив объектов (формат `JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE`):

```json
[
  {
    "telegramId": 123456789,
    "username": "example_user",
    "firstName": "Alex",
    "lastName": null,
    "lastStartAt": "2026-11-23T10:00:00+00:00",
    "createdAt": "2026-11-23T09:30:00+00:00"
  }
]
```

### Гарантии целостности данных
- **Отсутствие дублей:** повторный `/start` от того же `telegramId` обновляет `username`, `firstName`, `lastName` и `lastStartAt`, сохраняя исходное `createdAt`.
- **Блокировка записи:** эксклюзивная файловая блокировка `flock($lock, LOCK_EX)` по lock-файлу `<file>.lock`.
- **Атомарная запись:** сериализация во временный файл `tempnam()` в том же каталоге и атомарный `rename()` поверх целевого файла (с гарантированной очисткой временного файла в `finally`).
- **Защита от порчи:** если существующий JSON повреждён или содержит объект вместо массива / запись без `telegramId`, выбрасывается `RuntimeException` **без перезаписи** повреждённого файла пустым массивом.

## Переменные окружения

| Переменная | Обязательность | Описание |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Обязательна | Токен бота от BotFather (только в локальном `.env` / секретах сервера) |
| `TELEGRAM_WEBHOOK_SECRET` | Обязательна для webhook | Секретный токен проверки заголовка Telegram (1–256 символов `[A-Za-z0-9_-]`) |
| `WISHLIST_FILE` | Опциональна | Путь к JSON-хранилищу (в Docker: `/data/wishlist.json`) |

## Матрица обязательных проверок бэкенда

При реализации бэкенда должны быть проверены и зафиксированы:
1. `php -l` для `bot.php`, `common.php`, `webhook.php`, `webhook-admin.php`.
2. `docker compose config --quiet` и сборка образа `docker/bot.Dockerfile`.
3. Все HTTP-статусы: `GET /health` (200), `GET /webhook` (404), `GET /common.php` (404), `POST /webhook` без секрета (403), с некорректным JSON (400), без `update_id` (400), с `update_id` без сообщения (200), с телом `> 65536` байт (413).
4. Создание и обновление записи пользователя без дублей и с сохранением `createdAt`.
5. Отказ без перезаписи при повреждённом JSON или объекте вместо списка.
6. Запись/чтение JSON внутри PHP-контейнера от пользователя `bot` (UID 1000) и наличие HTTPS stream wrapper (`https` в `stream_get_wrappers()`).
7. Сквозной сценарий: сайт → переход в Telegram → `/start` → приветствие → запись в `/data/wishlist.json` → повторный `/start` (1 запись) → `docker compose restart bot` → сохранность данных.

## Ограничения MVP и требования для production

- Встроенный сервер `php -S 0.0.0.0:8080 webhook.php` предназначен **только для локального тестирования** через ngrok. Для production требуется **PHP-FPM + Nginx** (или иной production HTTP-сервер с TLS).
- Один экземпляр webhook последовательно обрабатывает запросы в JSON-файл. Для масштабирования (несколько инстансов), рассылок и администрирования необходимо перейти на реляционную БД с резервным копированием и миграцией из JSON.
- История обработанных `update_id` в MVP не хранится: при повторной доставке апдейта со стороны Telegram пользователь останется в единственном экземпляре, но приветственное сообщение может отправиться повторно.
- Единый API клиентских приложений, авторизация, личный кабинет (`06-account.png`), выдача VPN-конфигураций, тарифы и оплаты (`05-checkout.png`) в объём PHP-вишлиста **не входят**.
