# Инструкция и требования к разработке фронтенда N1X VPN

## Назначение и стек

Фронтенд проекта — статический единый лендинг **N1X VPN** (`index.html`), собираемый Webpack 5 без SPA-фреймворков. Архитектура унаследована от проекта-исходника [nordelVPN/company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native).

Используемые технологии:
- **Webpack 5** (`webpack`, `webpack-cli`, `webpack-dev-server`);
- **Handlebars 4** для HTML-шаблонов и переиспользуемых partials;
- **SCSS** для стилей и дизайн-токенов тёмной палитры (светлая тема не реализуется);
- **PostCSS + Autoprefixer** (конфигурация `browserslist` в `package.json`);
- **Vanilla JavaScript** (ESNext/CommonJS через Babel) — независимые модули по ответственности;
- **ESLint 9** (`eslint.config.js`) для статического анализа `src/` и `webpack/`;
- раздельные сборки для `dev` и `prod`.

## Системные требования

- **Node.js 22** (целевая версия для CI и Docker; Node 18 не является гарантированно поддерживаемой базой);
- **npm 9** или новее.

Установка зависимостей из корня проекта:

```bash
npm install
```

## Команды запуска, сборки и линтинга

| Команда | Назначение | Результат |
|---|---|---|
| `npm run start` | Запуск `webpack-dev-server` с HMR и source-map | `http://localhost:3000` (в памяти) |
| `npm run build:dev` | Development-сборка на диск | `build/dev/` |
| `npm run build:prod` | Production-сборка (минификация JS/CSS, `contenthash`, очистка) | `build/prod/` |
| `npm run build` | Алиас для `npm run build:prod` | `build/prod/` |
| `npm run lint` | Проверка JS-кода ESLint (`eslint src webpack`) | Отчёт об ошибках/предупреждениях |

> После добавления новых страниц в `webpack/pages.js` или добавления новых partials в `src/templates/partials/` перезапускайте `npm run start`. Изменения SCSS и JS подхватываются watcher'ом Webpack автоматически.

## Структура фронтенда

```text
pages/
  index.hbs                    единый лендинг (5 секций: hero, app-preview, why-n1x, pricing, support)
src/
  assets/                      дополнительные статические ассеты (favicon, шрифты при локальном подключении)
  data/
    index.js                   данные и SEO-поля главной страницы (см. copy-and-locales.md)
    locales.json               словарь переводов { "en": {...}, "ru": {...} }
  modules/
    i18n.js                    переключение EN/RU без перезагрузки
    navigation.js              адаптивная навигация и мобильное меню
    app-preview.js             интерактивное демо-превью приложения
    wishlist.js                модальное окно вишлиста (<dialog>)
  styles/
    base.scss                  дизайн-токены N1X (:root), базовые стили, header, footer, dialog
    pages/
      index.scss               стили 5 секций главной страницы
  templates/
    layouts/
      main.hbs                 общий HTML-каркас страницы (data-theme="dark")
    partials/                  переиспользуемые компоненты и inline SVG
webpack/
  pages.js                     манифест страниц и их зависимостей
  webpack.common.js            общая конфигурация Webpack
  webpack.dev.js               dev-конфигурация
  webpack.prod.js              prod-конфигурация
```

> Эталонные изображения в `docs/assets/images/concept/` служат исключительно дизайн-ориентирами и не подключаются в продакшен-код вместо свёрстанных компонентов. Шрифт выявляется по концептам; логотип, знак `X` и иконки снимаются с `logo-lime-x-concept.png` и экранов концепта в inline SVG.

## Добавление переиспользуемого компонента (partial)

1. Создайте partial в `src/templates/partials/`, например `plan-card.hbs`.
2. Все partials верхнего уровня из `src/templates/partials/` автоматически регистрируются в `webpack/webpack.common.js` по имени файла без расширения.
3. Подключите его в шаблоне через `{{> plan-card}}`.
4. Интерактивную логику выносите в отдельный модуль `src/modules/<component>.js`, а стили — в `src/styles/base.scss` (если компонент общий) или `src/styles/pages/index.scss`.

## Добавление новой страницы (при развитии проекта)

Архитектура `webpack/pages.js` остаётся многостраничной. Если в будущем потребуется отдельная страница:
1. Создайте шаблон в `pages/<name>.hbs` и данные в `src/data/<name>.js` (с передачей `wishlist: require('./index').wishlist`).
2. Зарегистрируйте её в `webpack/pages.js` (модуль `i18n` всегда первым, `wishlist` — обязательно для работы кнопок в header и footer).
3. Добавьте ключи перевода в `src/data/locales.json` и проверьте `npm run build:prod` и `npm run lint`.

## Функциональные модули и контракты

### 1. Локализация (`src/modules/i18n.js`)
- Полная спецификация: [tasks/002-localization.md](tasks/002-localization.md).
- Готовые тексты и словарь: [copy-and-locales.md](copy-and-locales.md).
- Язык по умолчанию — **EN** (точные тексты с фото концептов); доступно переключение **EN / RU** без перезагрузки.
- Хранение выбора — `localStorage['n1x-language']`; при ошибке/отсутствии storage переключение в рамках сессии продолжает работать.
- Разметка переводится через `data-i18n` (`textContent`) и `data-i18n-aria-label`, `data-i18n-placeholder`, `data-i18n-title`, `data-i18n-content`. HTML из JSON не вставляется.
- Событие `languagechange` отправляется на `document` с `event.detail.language` — `app-preview.js` обязан обновлять надписи без сброса состояния подключения.

### 2. Дизайн-система (только тёмная тема)
- Все цвета, поверхности, границы и акценты задаются CSS custom properties в `:root` (`src/styles/base.scss`): глубокий тёмный фон `#0D0C12`–`#100F15`, неоново-лаймовый акцент `#CBF806`, кремово-белый текст `#F8F0E0`.
- В `main.hbs` задаётся `<html lang="{{lang}}" data-theme="dark">` и `<meta name="color-scheme" content="dark">`.
- **Светлая тема и `theme-toggle.js` не реализуются.**

### 3. Адаптивная навигация (`src/modules/navigation.js`)
- На desktop (`> 900px`) ссылки навигации (`The app` → `#the-app`, `Why N1X` → `#why-n1x`, `Support` → `#support`) отображаются в строку в шапке.
- Кнопки `Explore N1X` в секциях Hero и Why N1X ведут на `#plans`.
- На ширине `<= 900px` активируется кнопка `[data-menu-toggle]` с `aria-expanded` и раскрываемый список `#main-nav` (`.is-open`).
- Меню закрывается при клике по ссылке, нажатии `Escape` (с возвратом фокуса на `[data-menu-toggle]`) и расширении viewport выше `900px`.

### 4. Интерактивное превью приложения (`src/modules/app-preview.js`)
- В секции `#the-app` (`02-the-app.png`) макет устройства содержит интерактивное локальное демо на базе `mobile/01-home.png` и `mobile/02-connected.png`.
- Кнопка `[data-connect]` переключает состояние (`aria-pressed="true" | "false"`):
  - отключено: `Not connected`, сервер `Automatic`, кнопка `Connect`;
  - подключено (демо): `Connected (preview)`, сервер `Netherlands • Amsterdam`, кнопка `Disconnect`, пояснение «Demo only — your network connection has not changed.».
- Кнопки просмотра серверов/меню внутри превью (`[data-demo-info]`) показывают уведомление `[data-demo-notice]` о демо-режиме. Реальное VPN-соединение не создаётся.

### 5. Блок поддержки (`#support`, `07-support.png`)
- Поле `Search support` реализуется как полноценный рабочий `<input type="search">` (принимает ввод, фокус, перевод `placeholder`/`aria-label`), но логика фильтрации/поиска пока не требуется (искать на данном этапе нечего).
- 3 карточки категорий (`Getting started`, `Account & subscription`, `Troubleshooting`) и кнопка `Contact support` (`data-wishlist-open`).

### 6. Модальное окно вишлиста (`src/modules/wishlist.js`, `src/templates/partials/wishlist.hbs`)
- Реализуется через нативный элемент `<dialog data-wishlist>`, подключённый один раз в `main.hbs`.
- Открывается по любой кнопке с `data-wishlist-open` (в header, секции приложения, карточках тарифов, `Contact support` и footer).
- Закрывается по кнопке `[data-wishlist-close]`, клавише `Escape` и клику по backdrop (вне границ диалога). При закрытии фокус возвращается на инициатор.
- `wishlist.telegramUrl` берётся из `process.env.TELEGRAM_BOT_URL || ''` (адрес бота будет добавлен в `.env` позже). Пока URL пуст, кнопка перехода отключена с честным пояснением. После задания URL ссылка получает `target="_blank" rel="noopener noreferrer"`.

### 7. Общий `footer` (`src/templates/partials/footer.hbs`)
- Подключается в `src/templates/layouts/main.hbs`.
- Состав: логотип `X N1X VPN` со ссылкой на верх страницы, якорная навигация (`The app`, `Why N1X`, `Plans`, `Support`), кнопка `Get N1X` (`data-wishlist-open`), юридические ссылки-заглушки `Privacy Policy` и `Terms of Use` (`href="#"`), копирайт `© {{year}} N1X VPN. All rights reserved.`.
- Мобильное меню footer остаётся открытым и не зависит от раскрываемого меню header.

## Правила поддержки кода

- Не дублируйте общий HTML — используйте `main.hbs` и partials.
- Не помещайте интерактивную логику в Handlebars.
- Каждый JS-модуль обязан безопасно работать при отсутствии своих DOM-элементов на странице.
- Не редактируйте содержимое `build/` вручную.
- Не храните секреты, токены и реальные доступы в шаблонах, данных и JS.
- Для всех внешних ссылок с `target="_blank"` обязательно добавляйте `rel="noopener noreferrer"`.
- Сохраняйте `skip-link`, единственный `<h1>` на странице, видимый `:focus-visible` outline и уважение `prefers-reduced-motion: reduce`.
- Проверяйте сборку через HTTP (`npm run build:dev`, `npm run build:prod`, `npm run lint` и `scripts/verify-landing.cjs` — см. [../qa/verification-plan.md](../qa/verification-plan.md)).
