# Валидация N1X VPN — 23 ноября 2026

Реализованы BOOTSTRAP-000, FRONT-001 и FRONT-002: единый лендинг из пяти секций, четыре тарифа, EN/RU, интерактивное демо, диалог вишлиста, PHP webhook/polling, Docker и workflow Pages.

## Фактически выполнено

- npm install: успешно, package-lock.json создан. Локально Node 24.21.0; production Docker-сборка проверена на Node 22.
- npm run lint, npm run build:dev, npm run build:prod: успешно.
- Chromium 159.0.8154.6, Firefox 159.0, WebKit 27.2: по шесть сценариев (375/768/1440 × EN/RU), без горизонтального переполнения и ошибок загрузки/JS/консоли.
- Проверены все переводы текста и атрибутов, восстановление языка, недоступность localStorage, HTML без JS, меню, демо и сохранение его состояния при переводе, тарифы, поиск, CTA, диалог (Tab, Escape, backdrop, кнопка, возврат фокуса).
- Сохранены скриншоты и диагностические overlay/difference для пяти секций на эталонных размерах.
- PHP 8.4: lint четырёх файлов; HTTP 200/400/403/404/413; исходный common.php не выдаётся; создание/обновление записи без дублей, сохранение createdAt, защита повреждённого JSON.
- docker compose config --no-interpolate --quiet: успешно. Образы n1x-site:qa и n1x-bot:qa собраны. В bot проверены UID 1000, HTTPS wrapper и запись/чтение /data.
- Dev-server: порт 3000 занят сторонним процессом; его не останавливали. Webpack Dev Server отдельно проверен на свободном порту: HTTP 200 с HTML N1X VPN. Для запуска используйте npm run start -- --port 3001.

## Артефакты

- [Chromium](../../qa/front-001/chromium/report.json)
- [Firefox](../../qa/front-001/firefox/report.json)
- [WebKit](../../qa/front-001/webkit/report.json)
- [Backend](../../qa/backend/report.json)

## Визуальные отличия и ограничения

Использован локальный Archivo Italic (SIL OFL, лицензия в src/assets/fonts/OFL.txt) как близкий свободный аналог. Точный исходный шрифт по PNG не установлен; кириллица использует системный fallback. Отличаются метрики текста, отступы и размер декоративного X. Шумовая фактура концепта не воспроизводится. Вместо группы фотореалистичных устройств — свёрстанное интерактивное демо телефона. Иконки перерисованы в SVG. Карточек тарифов четыре по утверждённому решению вместо трёх на фото. Полное пиксельное совпадение не заявляется; meanChannelDifference — диагностика, не критерий приёмки. Требуется визуальная приёмка владельцем.

Webpack предупреждает о размере локального variable TTF (724 KiB); следующий этап оптимизации — WOFF2/subsetting.
npm audit для заданного документацией набора зависимостей выявил 6 проблем dev-инструментов (5 moderate, 1 high): serialize-javascript, uuid и зависящие от них плагины/dev-server. Мажорные версии пакетов из ТЗ автоматически не менялись; требуется отдельное обновление и повторная проверка. В production nginx нет node_modules.

Реальный Safari/iOS не проверен (WebKit automation не заменяет устройство). GitHub Actions и публикация не запускались: workflow подготовлен локально, без push.
.env отсутствует. Сквозной Telegram/ngrok тест отложен до предоставления TELEGRAM_BOT_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET и NGROK_AUTHTOKEN. Домен/canonical и валюта не выдуманы. Оплата, VPN-соединение и поиск по базе знаний отсутствуют согласно MVP.
