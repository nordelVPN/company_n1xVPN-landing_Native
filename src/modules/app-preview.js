const { t } = require('./i18n');
const preview = document.querySelector('[data-app-preview]');
if (preview) {
  const button = preview.querySelector('[data-connect]');
  let connected = false;
  const render = () => {
    button.setAttribute('aria-pressed', String(connected));
    [['[data-preview-status]', connected ? 'connectedStatus' : 'status'], ['[data-connect-label]', connected ? 'disconnect' : 'connect'], ['[data-server-label]', connected ? 'connectedServerLabel' : 'serverLabel'], ['[data-server-value]', connected ? 'connectedServerValue' : 'serverValue']].forEach(([selector, key]) => {
      preview.querySelector(selector).textContent = t('app.preview.' + key);
    });
  };
  button.addEventListener('click', () => { connected = !connected; render(); });
  preview.querySelectorAll('[data-demo-info]').forEach(item => item.addEventListener('click', () => { preview.querySelector('[data-demo-notice]').hidden = false; }));
  document.addEventListener('languagechange', render);
  render();
}
