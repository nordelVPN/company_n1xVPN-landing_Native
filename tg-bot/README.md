# N1X VPN вишлист

PHP 8.4, без Composer. Настройки и запуск: [Telegram](../docs/backend/telegram-wishlist.md), [Compose](../docs/backend/docker-compose.md).

`php tg-bot/bot.php` — long polling (предварительно удалить webhook).
`php tg-bot/webhook-admin.php set https://YOUR_HOST/webhook` — регистрация webhook.
Секреты передаются через окружение; JSON-хранилище в Docker сохраняется на volume wishlist.
