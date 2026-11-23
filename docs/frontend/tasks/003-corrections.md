# FRONT-003 — Правки лендинга, модалки заказа и страницы аккаунта

- **Исполнитель:** Frontend.
- **Статус:** к выполнению после `FRONT-001` и `FRONT-002`.
- **Приоритет:** если пункт этого файла расходится с `FRONT-001`, `FRONT-002`, [copy-and-locales.md](../copy-and-locales.md) или [landing-components.md](../landing-components.md) (таблица из 4 тарифов и пометки «Вне MVP» у `05-checkout.png` и `06-account.png`), для перечисленных здесь экранов выполняется этот файл. Порядок задач зафиксирован в [`BOOTSTRAP-000`](../../tasks/000-project-bootstrap.md).
- **Эталоны:** `docs/assets/images/concept/01-home.png`, `02-the-app.png`, `03-why-n1x.png`, `04-plans.png`, `05-checkout.png`, `07-support.png`, `account-page/06-account.png`.

Сверка делается на ширине макета `1672px` (у `04-plans.png` — `1671px`) наложением сверстанной страницы на PNG. PNG на страницу не вставлять: интерфейс остаётся HTML/SVG/CSS/JS.

Живой платёж, списание карты и реальный API аккаунта в эту задачу не входят. Нужны экраны по макетам и их клиентское поведение. Telegram-бот и PHP-вишлист не удалять.

## 1. Модалка `data-wishlist-open` — экран `Complete your order`

Сейчас любая кнопка `[data-wishlist-open]` вызывает `dialog.showModal()` без анимации и показывает текст вишлиста (`N1X VPN wishlist`, кнопка Telegram). Это не экран заказа.

Требуемое поведение `[data-wishlist-open]` (шапка, `#the-app`, карточки тарифов, `Contact support`, footer):

- Открывается существующий `<dialog data-wishlist aria-describedby="wishlist-description">`.
- Видимое содержимое диалога — экран из `05-checkout.png`, заголовок **`Complete your order.`**
- `aria-labelledby` указывает на этот заголовок. `aria-describedby="wishlist-description"` сохранить: атрибут остаётся на `<dialog>`, `id="wishlist-description"` — на кратком тексте экрана заказа.

Состав модалки по `05-checkout.png`:

| Блок | Текст EN |
|---|---|
| Заголовок | `Complete your order.` |
| Шаг 1 | `/ 1. Your email` |
| Поле email | placeholder `Enter your email address` |
| Шаг 2 | `/ 2. Choose a plan` |
| Варианты плана | `Monthly Plan` (выбран при открытии), `Annual Plan`, `Two-Year Plan` |
| Шаг 3 | `/ 3. Choose a payment method` |
| Способ оплаты | контрол с подписью `Select a payment method` |
| Сводка | заголовок `Order summary` |
| Plan | `Monthly Plan` (следует выбранному радио) |
| Billing | `Recurring` |
| Total | `Shown at checkout`, а если выводится сумма — со знаком `€` перед числом |
| Кнопка | `Continue` |

Верстка на широком экране: слева шаги, справа `Order summary` и декоративный знак `X`. Текущий `max-width: 520px` у `dialog` для этого экрана мал. На `<= 900px` колонки складываются, горизонтального скролла нет.

Поведение формы без бэкенда:

- email принимает ввод;
- смена радио меняет строку Plan в `Order summary`;
- способ оплаты — рабочий контрол с placeholder `Select a payment method`. Конкретные платёжные бренды на макете не подписаны — список брендов не выдумывать;
- `Continue` не отправляет платёж и не собирает номер карты. После нажатия модалка остаётся открытой, фокус не теряется;
- сумму, которой нет на `05-checkout.png`, не подставлять. Если сумма всё же показана, перед ней обязателен знак `€` (`€7`, без пробела).

Закрытие как сейчас: кнопка, `Escape`, клик по backdrop, возврат фокуса инициатору, цикл Tab внутри диалога.

### Плавное открытие

Диалог с `aria-describedby="wishlist-description"` открывается плавно, а не скачком.

- Анимация появления самого диалога и backdrop: прозрачность и небольшой сдвиг (`translateY` около `12px`), длительность `200–300ms`.
- Закрытие тоже плавное, без рывка фокуса и без зависания диалога в открытом состоянии.
- При `prefers-reduced-motion: reduce` анимации нет. Правило в `base.scss` уже обнуляет `transition` и `animation` — его сохранить.

### Кнопка `.dialog-close` — иконка

Сейчас кнопка содержит видимую надпись `Close` и подчёркивание (`src/styles/base.scss`, `.dialog-close`).

- Видимая часть — inline SVG-иконка закрытия (крестик), не слово.
- Доступное имя остаётся в `aria-label` (ключ локализации: EN `Close`, RU `Закрыть`). Видимого текста «Close» / «Закрыть» на кнопке нет.
- Класс кнопки остаётся `dialog-close`, атрибут закрытия — `data-wishlist-close`.

## 2. Страница аккаунта по `06-account.png`

В сборке сейчас только `pages/index.hbs`. Экрана из `docs/assets/images/concept/account-page/06-account.png` нет.

Сделать страницу `pages/account.hbs` → `account.html`:

- данные `src/data/account.js`;
- регистрация в `webpack/pages.js` (`i18n` первым, `wishlist` подключён, чтобы `Get N1X` открывал ту же модалку заказа);
- общий `header` / `footer` лендинга. В шапку лендинга пункт Account не добавлять: на `01-home.png` его нет.

Один экран по макету, без отдельных выдуманных страниц на каждый пункт бокового меню. Боковые пункты — навигация по этой странице. Видимое состояние — то, что на `06-account.png`.

| Зона | Текст EN |
|---|---|
| Заголовок страницы | `Your account` |
| Боковое меню | `Overview`, `Subscription`, `Devices`, `Settings`, `Support` |
| Пользователь | `user@example.com` |
| Карточка подписки | заголовок `Subscription`, статус `Active`, текст `Your subscription is active.`, кнопка `Manage subscription` |
| Карточка устройств | заголовок `Devices`, строка `3 devices`, текст `Using N1X on your devices.`, кнопка `Manage devices` |
| Quick actions | заголовок `Quick actions`; пункты `Open the app`, `View details`, `Choose location`, `Run connection test`, `Add device`, `Get setup help` |

На макете справа крупный знак `X`. Его повторить тем же `brand-x`, масштаб — как на `06-account.png`.

Кнопки карточек и пункты Quick actions в этой задаче ведут на якоря этой же страницы либо остаются кнопками без перехода во внешний сервис. Логин, реальный список устройств и смена тарифа не реализуются. Почта и статус на экране — демо-данные с макета (`user@example.com`, `Active`, `3 devices`).

## 3. Шрифты — повторная сверка всех ролей

Сейчас подключён только `src/assets/fonts/Archivo-Italic.ttf`. В `base.scss` заголовки, кнопки, логотип и навигация — `Archivo` italic, основной текст — `Arial`. Это приближение, ожидавшееся в `001-validation.md`. Для этой задачи его недостаточно.

Проверить заново каждый текстовый роль по всем пяти секциям, модалке заказа и странице аккаунта: display-заголовки, заголовки нижних полос, прописные подписи, основной текст, кнопки, навигация, цены. Подобрать и подключить лицензионно чистую пару (жирный наклонный геометрический гротеск для display и прямой гротеск для набора), файлы положить в `src/assets/fonts/`, лицензию сохранить рядом. Кириллица RU должна идти тем же семейством, а не случайным системным fallback.

Уже видные расхождения, их нужно закрыть в первую очередь:

| Место | Строка | Сейчас | Что сделать |
|---|---|---|---|
| `#home` `.feature-strip h3` | `Made for the` / `way you play.` | Archivo italic, `clamp(1.7rem, 3vw, 3rem)` | другое начертание и пропорции, как на `01-home.png` |
| `#home` `.feature-strip h4` | `PRIVACY EVERYDAY`, `ACCESS MORE`, `STAY FLEXIBLE` | `h4` = `1.2rem` | заметно крупнее, до масштаба прописных строк на `01-home.png` |
| `#the-app` `.feature-strip h3` | `Simple VPN` / `for everyday` / `online life.` | тот же кэп `3rem` и тот же Archivo italic | та же проблема лица и размера; увеличить и сменить лицо по `02-the-app.png` |
| `#the-app` `.feature-strip h4` | `SIMPLE TO USE`, `CHOOSE YOUR LOCATION`, `FOR EVERYDAY USE` | `1.2rem` | увеличить вместе с подписями `#home` |
| `#why-n1x` `.display` | `A little more` / `freedom` / `online.` | `.display`: Archivo italic, `clamp(3.5rem, 6vw, 6.3rem)` | лицо не совпадает с `03-why-n1x.png`; подобрать пару по начертанию и наклону этого заголовка и проверить им же остальные display (`Beyond`, `Your connection.`, `Choose your plan.`, `How can we help?`) |

Иконки нижней полосы `#home` скрыты (`#home .icon { display: none }`) — так и оставить, на `01-home.png` у этих подписей иконок нет.

## 4. `.three-grid`: иконки и размер текста

Класс стоит на сетках `#why-n1x` и `#support`.

- Иконки сейчас рисованы заново и не совпадают с макетом: у `#why-n1x` это устройства, щит с замком и геймпад; у `#support` — устройства, пользователь и гаечный ключ. Снять геометрию с `03-why-n1x.png` и `07-support.png` и заменить inline SVG. Растр из PNG не вставлять.
- Текст крупнее макета. Сейчас `h3` = `1.75rem`, `.three-grid p` = `1.1rem`. Уменьшить заголовки и абзацы до масштаба на `03-why-n1x.png` и `07-support.png`. Сами фразы не менять.

## 5. Секция `#plans`: тексты, `.plan-card`, `.brand-x`, знак евро

Сейчас в `src/data/index.js` четыре другие тарифа: `Trial — 1 month` / `1`, `1 month` / `7`, `3 months` / `15`, `12 months` / `55`, плюс `5 devices` и примечания. Под карточками стоит фраза `Currency and billing terms will be confirmed...`. Цена в `.price` — голое число `4.5rem` без знака валюты. На `04-plans.png` этого нет.

Тексты секции привести к макету:

- заголовок `Choose your plan.`
- лид `A universal VPN for play, work, and everyday online life.`
- три карточки `.plan-card`:
  1. `/ Monthly` — `Price shown at checkout` — кнопка `Choose Monthly`;
  2. `/ 6 months` — `Price shown at checkout` — кнопка `Choose 6 Months`;
  3. `/ 12 months` — `Price shown at checkout` — кнопка `Choose 12 Months`.
- нижнее примечание про валюту и вишлист убрать: на макете его нет.

Карточка повторяет конструкцию `04-plans.png`: контур, лаймовый `/` перед названием, строка цены, лаймовая скошенная кнопка. Текущий градиент, абзацы `5 devices` и четвёртая колонка к макету не относятся. Сетка: 3 колонки на широком экране, 1 колонка на `<= 900px`.

Кнопка карточки по-прежнему с `data-wishlist-open` и открывает модалку `Complete your order.` Подписи шагов модалки остаются те, что в таблице раздела 1 (`Monthly Plan`, `Annual Plan`, `Two-Year Plan`). Названия карточек лендинга ими не подменять.

**Знак евро обязателен у каждой числовой цены.** Голое `1`, `7`, `15`, `55` не выводить. Формат суммы: `€` сразу перед числом, без пробела (`€7`). На самой карточке макета числовой суммы нет — там строка `Price shown at checkout`. Её и показать. Если сумма всё же остаётся в `.price` или в `Total`, без `€` она не принимается. Новую сумму, которой нет на макете, не выдумывать.

`.brand-x` в `#plans` увеличить. Сейчас `.compact` ставит колонки `3fr 1fr`, а `.compact .art > .brand-x` ограничен `height: 280px`. На `04-plans.png` знак занимает правую часть шапки секции и крупнее этого.

## 6. Локализация

Все новые фразы — в `src/data/locales.json`, ключи `en` и `ru` совпадают. EN в HTML совпадает с таблицами выше. `innerHTML` из JSON не использовать. Знак `€` в обоих языках один и тот же, перед числом.

Рабочая RU-редакция до вычитки маркетологом:

| EN | RU |
|---|---|
| `Complete your order.` | `Завершите заказ.` |
| `1. Your email` | `1. Ваша почта` |
| `Enter your email address` | `Введите адрес почты` |
| `2. Choose a plan` | `2. Выберите тариф` |
| `Monthly Plan` | `Месячный тариф` |
| `Annual Plan` | `Годовой тариф` |
| `Two-Year Plan` | `Тариф на два года` |
| `3. Choose a payment method` | `3. Выберите способ оплаты` |
| `Select a payment method` | `Выберите способ оплаты` |
| `Order summary` | `Сводка заказа` |
| `Plan` | `Тариф` |
| `Billing` | `Оплата` |
| `Recurring` | `Регулярная` |
| `Total` | `Итого` |
| `Shown at checkout` | `Показывается при заказе` |
| `Continue` | `Продолжить` |
| `Monthly` | `Месяц` |
| `6 months` | `6 месяцев` |
| `12 months` | `12 месяцев` |
| `Price shown at checkout` | `Цена при заказе` |
| `Choose Monthly` | `Выбрать месяц` |
| `Choose 6 Months` | `Выбрать 6 месяцев` |
| `Choose 12 Months` | `Выбрать 12 месяцев` |
| `Your account` | `Ваш аккаунт` |
| `Overview` | `Обзор` |
| `Subscription` | `Подписка` |
| `Devices` | `Устройства` |
| `Settings` | `Настройки` |
| `Active` | `Активна` |
| `Your subscription is active.` | `Подписка активна.` |
| `Manage subscription` | `Управлять подпиской` |
| `3 devices` | `3 устройства` |
| `Using N1X on your devices.` | `N1X на ваших устройствах.` |
| `Manage devices` | `Управлять устройствами` |
| `Quick actions` | `Быстрые действия` |
| `Open the app` | `Открыть приложение` |
| `View details` | `Подробнее` |
| `Choose location` | `Выбрать локацию` |
| `Run connection test` | `Проверить соединение` |
| `Add device` | `Добавить устройство` |
| `Get setup help` | `Помощь с настройкой` |

Старые ключи четырёх тарифов (`pricing.plans.0` … `pricing.plans.3`, включая `5 devices` и примечание про валюту) убрать из словаря вместе с разметкой, чтобы наборы `en` и `ru` остались зеркальными.

## Критерии приёмки

- [ ] `[data-wishlist-open]` открывает модалку с заголовком `Complete your order.` и составом из раздела 1, а не текст вишлиста Telegram.
- [ ] Диалог с `aria-describedby="wishlist-description"` появляется и закрывается плавно; при `prefers-reduced-motion: reduce` анимации нет.
- [ ] `.dialog-close` показывает иконку. Видимой надписи `Close` нет, `aria-label` есть.
- [ ] Собрана страница `account.html` по `06-account.png`: боковое меню, `user@example.com`, карточки подписки и устройств, Quick actions, знак `X`.
- [ ] Шрифты сверены с макетами по всем ролям. `Made for the`, `Simple VPN` и `A little more` совпадают по лицу. `PRIVACY EVERYDAY` и `Simple VPN` крупнее текущих `1.2rem` / `3rem`.
- [ ] В `.three-grid` иконки сняты с `03-why-n1x.png` и `07-support.png`, заголовки и абзацы меньше текущих `1.75rem` и `1.1rem`.
- [ ] В `#plans` три карточки с текстами раздела 5, `.plan-card` повторяет макет, `.brand-x` крупнее текущих `280px`.
- [ ] Ни одна числовая цена не отображается без `€`.
- [ ] EN/RU переключаются без перезагрузки на лендинге, в модалке и на `account.html`. Ключи `en` и `ru` совпадают.
- [ ] `npm run build:dev`, `npm run build:prod` и `npm run lint` проходят. На `375 / 768 / 1440 px` нет горизонтального скролла.
