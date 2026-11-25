const { createVpnPortalSdk } = require('./vpn-portal-sdk');
const sdk = createVpnPortalSdk({ brandSlug: 'n1x' });

const login = document.querySelector('[data-demo-login]');
if (login && sdk.mode === 'demo') {
  login.addEventListener('submit', event => {
    event.preventDefault();
    if (!login.reportValidity()) return;
    // A local demo marker only; no credentials are stored or sent.
    try { window.sessionStorage.setItem('n1x-demo-session', 'active'); } catch { /* Navigation also works without storage. */ }
    window.location.assign('./account.html');
  });
}
document.querySelector('[data-demo-logout]')?.addEventListener('click', () => {
  try { window.sessionStorage.removeItem('n1x-demo-session'); } catch { /* No persisted session. */ }
});
document.querySelectorAll('[data-account-action]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('[data-account-notice]').hidden = false;
}));
