# FRONT-001 — Реализация единого лендинга N1X VPN по дизайн-концептам

- **Исполнитель:** Frontend.
- **Статус:** ТЗ утверждено; выполняется после [`BOOTSTRAP-000`](../../tasks/000-project-bootstrap.md).
- **Проект-исходник (референс):** [nordelVPN/company_nordel-landing_Native](https://github.com/nordelVPN/company_nordel-landing_Native).
- **Цель:** реализовать единый статический лендинг **N1X VPN** (`index.html`) из 5 последовательных секций на стеке Webpack 5 + Handlebars + SCSS + vanilla JS в тёмной теме по дизайн-концептам из `docs/assets/images/concept/`, подключить общий `header`, `footer`, интерактивное демо-превью и модальное окно вишлиста.

> **Поправка [`FRONT-003`](003-corrections.md).** Для перечисленных там экранов выполняется FRONT-003. Модалка `[data-wishlist-open]` — экран `Complete your order.` из `05-checkout.png`: плавное открытие, кнопка `.dialog-close` — иконка. Добавляется `account.html` по `06-account.png`. Шрифты сверяются заново. В `.three-grid` иконки и размер текста приводятся к макетам. В `#plans` четыре тарифа таблицы владельца, оформление карточки по `04-plans.png`, `.brand-x` крупнее, у каждой цены знак `€`.

## Исходные материалы

Эталонные дизайн-концепты в [`docs/assets/images/concept/`](../../assets/images/concept/):
- `logo-lime-x-concept.png` — логотип `X N1X VPN`, фирменный знак `X`, иконка приложения (снять в inline SVG);
- `01-home.png` — секция 1 (`#home`);
- `02-the-app.png` — секция 2 (`#the-app`);
- `03-why-n1x.png` — секция 3 (`#why-n1x`);
- `04-plans.png` — визуальный стиль секции 4 (`#plans`);
- `07-support.png` — секция 5 (`#support`);
- `mobile/01-home.png`, `mobile/02-connected.png` — состояния `Not connected` / `Connected` для интерактивного демо-превью.

Связанная документация:
- [Задача-бутстрап BOOTSTRAP-000](../../tasks/000-project-bootstrap.md)
- [Архитектура проекта](../../architecture.md)
- [Компоненты и дизайн-система](../landing-components.md)
- [Спецификация текстов и локализации](../copy-and-locales.md)
- [Инструкция по разработке](../landing-development.md)
- [План проверок QA](../../qa/verification-plan.md)

> Эталонные PNG-файлы не подключаются на страницу вместо интерфейса — вся вёрстка, логотип `X N1X VPN`, декоративный знак `X`, иконки, карточки и макет приложения воспроизводятся HTML/SVG/CSS/JS-компонентами.

## Объём работ

### 1. Шрифты, бренд-графика и дизайн-токены
- **Выявить шрифт с фото концептов** (жирный наклонный геометрический гротеск для display-заголовков + прямой гротеск для текста) и подключить его в проект.
- **Снять с `logo-lime-x-concept.png` и концептов** векторные partials: `logo.hbs` (`X N1X VPN`), `brand-x.hbs` (крупный двухцветный `X`), `favicon.svg` (иконка `X`) и SVG-иконки для карточек секций `#the-app`, `#why-n1x`, `#support`.
- Реализовать **только тёмную тему** (`data-theme="dark"`, цвета `#0D0C12`–`#100F15`, `#CBF806`, `#F8F0E0`) через CSS custom properties в `src/styles/base.scss`. Светлую тему и `theme-toggle.js` не делать.

### 2. Реализация единого лендинга `pages/index.hbs` (5 секций + общий каркас)
Все EN-тексты переносить **в точности с фото** по [copy-and-locales.md](../copy-and-locales.md):

- **Header (`header.hbs`, `modules/navigation.js`):** логотип `X N1X VPN`, якорные ссылки `The app` (`#the-app`), `Why N1X` (`#why-n1x`), `Support` (`#support`), переключатель языка (см. `FRONT-002`), лаймовая кнопка `Get N1X` (`data-wishlist-open`), мобильное меню на `<= 900px`.
- **Секция 1 — Hero (`#home`, `hero.hbs`, `01-home.png`):** единственный `<h1>` (`Beyond / borders. / Beyond / limits.`), описание, лаймовая кнопка `Explore N1X` (**`href="#plans"`**), крупный SVG-знак `X`, нижняя 4-колоночная полоса (`Made for the way you play.` + `PRIVACY EVERYDAY`, `ACCESS MORE`, `STAY FLEXIBLE`).
- **Секция 2 — The App (`#the-app`, `app-preview.hbs`, `modules/app-preview.js`, `02-the-app.png`):** заголовок `Your / connection. / Your way.`, описание, `Get N1X` (`data-wishlist-open`), интерактивное демо-превью устройства (`Connect`/`Disconnect` между `Not connected`/`Automatic` и `Connected (preview)`/`Netherlands • Amsterdam`, уведомление `[data-demo-notice]` при клике на `View all servers`), нижняя 4-колоночная полоса (`Simple VPN for everyday online life.` + `SIMPLE TO USE`, `CHOOSE YOUR LOCATION`, `FOR EVERYDAY USE`).
- **Секция 3 — Why N1X (`#why-n1x`, `why-n1x.hbs`, `03-why-n1x.png`):** заголовок `A little more / freedom / online.`, описание, лаймовая кнопка `Explore N1X` (**`href="#plans"`**), крупный SVG-знак `X`, 3 карточки с SVG-иконками (`Made for everyday life`, `Designed for privacy`, `Ready when you are`).
- **Секция 4 — Plans (`#plans`, `pricing.hbs`, `plan-card.hbs`, стиль `04-plans.png`):** заголовок `Choose your plan.`, описание, знак `X`, **4 утверждённых тарифа** таблицы владельца, цена со знаком `€`:
  1. `Trial - 1 month` (`Триал - 1 мес`) — `€1`, `5 devices`, `Once for a new user`;
  2. `Next - 1 month` (`Далее - 1мес`) — `€7`, `5 devices`;
  3. `3 months` (`3 месяца`) — `€15`, `5 devices`, `€5 per month`;
  4. `12 months` (`12 месяцев`) — `€55`, `5 devices`, `€4.58 per month`.
  Сетка: `4` колонки (`> 1100px`) → `2` (`901–1100px`) → `1` (`<= 900px`). Выбор любого тарифа открывает модалку заказа (`data-wishlist-open`); оплата не реализуется. Подписи `Monthly`, `6 months`, `12 months` и `Price shown at checkout` не использовать. Подробности в [`FRONT-003`](003-corrections.md).
- **Секция 5 — Support (`#support`, `support.hbs`, `07-support.png`):** заголовок `How can we / help?`, описание, **рабочий `<input type="search">`** (`Search support` — без логики поиска на данном этапе), крупный знак `X`, 3 карточки (`Getting started`, `Account & subscription`, `Troubleshooting`), нижняя кнопка `Contact support` (`data-wishlist-open`) + подпись.
- **Wishlist Dialog (`wishlist.hbs`, `modules/wishlist.js`):** нативный `<dialog data-wishlist>`, открытие по `data-wishlist-open`, закрытие кнопкой / `Escape` / кликом по backdrop, возврат фокуса инициатору; при пустом `wishlist.telegramUrl` кнопка перехода отключена с честным пояснением. С [`FRONT-003`](003-corrections.md) видимое содержимое этого диалога — экран `Complete your order.`, текст вишлиста Telegram в нём не показывать. PHP-бот остаётся.
- **Footer (`footer.hbs`, `styles/base.scss`):** логотип `X N1X VPN`, якорные ссылки (`The app`, `Why N1X`, `Plans`, `Support`), кнопка `Get N1X` (`data-wishlist-open`), юридические заглушки `Privacy Policy` и `Terms of Use` (`href="#"`), копирайт `© {{year}} N1X VPN. All rights reserved.`.

### 3. Вне объёма задачи (не реализовывать в FRONT-001)
- Светлая тема и переключатель тем.
- Живое списание и платёжный API. Статический экран `05-checkout.png` в модалке — [задача `FRONT-003`](003-corrections.md).
- API личного кабинета. Статическая страница `account-page/06-account.png` — [задача `FRONT-003`](003-corrections.md).
- Поисковая логика по базе знаний в `#support`.
- Мобильные экраны `mobile/03..08.png`.

### 4. Адаптивность и доступность
- Корректная композиция на `375px`, `768px`, `1440px` и эталонной ширине `1672px` без горизонтального переполнения и обрезания текста.
- Единственный `<h1>`, `skip-link`, управление меню/превью/диалогом с клавиатуры, видимый `:focus-visible`, `aria-label` / `aria-expanded` / `aria-pressed`, `aria-hidden="true"` на декоративных SVG, поддержка `prefers-reduced-motion: reduce`.
- Сохранять термин «вишлист»; не выдумывать адрес бота, домен и валюту.

## Критерии приёмки

> Имена тарифов, знак `€` и содержимое диалога заказа — в [`FRONT-003`](003-corrections.md). В `#plans` четыре карточки таблицы владельца.

- [ ] Выявлен и подключён шрифт с фото концептов; логотип `X N1X VPN`, знак `X` и иконки сняты с `logo-lime-x-concept.png` и концептов в inline SVG.
- [ ] Все 5 секций собраны на единой странице `index.html`; EN-тексты точно соответствуют [copy-and-locales.md](../copy-and-locales.md).
- [ ] Реализованы 4 утверждённых тарифа без подстановки валюты; кнопки `Explore N1X` ведут на `#plans`; выбор тарифа, `Get N1X` и `Contact support` открывают вишлист.
- [ ] Поле поиска в `#support` — рабочий `<input>` (ввод, фокус, `placeholder`, `aria-label`).
- [ ] В `footer` присутствуют навигация, `Get N1X`, юридические заглушки `href="#"` и копирайт `{{year}}`.
- [ ] Подготовлены скриншоты на `375 / 768 / 1440 px` и сравнения наложением (`-overlay.png`, `-difference.png`) с эталонными PNG.
- [ ] Нет горизонтального скролла, ошибок JS/консоли и ошибок загрузки ресурсов (`status >= 400`).
- [ ] Успешно пройдены `npm run build:dev`, `npm run build:prod`, `npm run lint` и `scripts/verify-landing.cjs`; отчёт и артефакты сохранены в `docs/frontend/tasks/001-validation.md` и `docs/qa/front-001/`.
