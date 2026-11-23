const { t } = require('./i18n');
const dialog = document.querySelector('[data-wishlist]');
if (dialog) {
  let opener;
  let closing = false;
  const form = dialog.querySelector('[data-order-form]');
  const update = () => {
    const selected = form.querySelector('[name="order-plan"]:checked');
    dialog.querySelector('[data-order-plan]').textContent = t('checkout.' + selected.value);
  };
  const close = () => {
    if (closing || !dialog.open) return;
    closing = true;
    dialog.classList.add('is-closing');
    const finish = () => { dialog.close(); dialog.classList.remove('is-closing'); closing = false; opener?.focus(); };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else window.setTimeout(finish, 240);
  };
  document.querySelectorAll('[data-wishlist-open]').forEach(button => button.addEventListener('click', () => {
    if (dialog.open) return;
    opener = button;
    form.reset();
    dialog.querySelector('[data-order-notice]').hidden = true;
    update();
    dialog.showModal();
  }));
  dialog.querySelector('[data-wishlist-close]').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll('button:not(:disabled),a[href],input,select')].filter(el => el.getClientRects().length && (el.type !== 'radio' || el.checked));
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last) {
      event.preventDefault(); (event.shiftKey ? last : first).focus();
    }
  });
  form.addEventListener('change', update);
  form.addEventListener('submit', event => {
    event.preventDefault();
    dialog.querySelector('[data-order-notice]').hidden = false;
  });
  document.addEventListener('languagechange', update);
  update();
}
