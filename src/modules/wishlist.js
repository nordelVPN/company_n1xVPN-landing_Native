const { t } = require('./i18n');
const plans = {
  trial: { index: 0, billing: 'checkout.once' },
  monthly: { index: 1, billing: 'checkout.recurring' },
  quarterly: { index: 2, billing: 'checkout.recurring' },
  yearly: { index: 3, billing: 'checkout.recurring' }
};
const dialog = document.querySelector('[data-wishlist]');
if (dialog) {
  let opener;
  let closing = false;
  const form = dialog.querySelector('[data-order-form]');
  const update = () => {
    const selected = form.querySelector('[name="order-plan"]:checked');
    const plan = plans[selected.value];
    dialog.querySelector('[data-order-plan]').textContent = t('pricing.plans.' + plan.index + '.name');
    dialog.querySelector('[data-order-billing]').textContent = t(plan.billing);
    dialog.querySelector('[data-order-total]').textContent = selected.dataset.price;
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
    const id = Object.prototype.hasOwnProperty.call(plans, button.dataset.selectPlan) ? button.dataset.selectPlan : 'trial';
    form.querySelector('[name="order-plan"][value="' + id + '"]').checked = true;
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
