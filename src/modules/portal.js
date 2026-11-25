/* global navigator */
'use strict';

var sdkFactory = require('./vpn-portal-sdk');
var sdk = sdkFactory.createVpnPortalSdk({ brandSlug: 'n1x' });

function setStatus(el, msg) {
  if (!el) return;
  el.hidden = false;
  el.textContent = msg;
}

function maskKey(key) {
  return key && key.length > 12 ? key.slice(0, 10) + '••••••••••••' + key.slice(-4) : '••••••••';
}

var registerForm = document.querySelector('[data-portal-register]');
if (registerForm) {
  var rStatus = registerForm.querySelector('[data-portal-status]');
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (registerForm.password.value !== registerForm.password_confirmation.value) {
      setStatus(rStatus, 'Passwords do not match.');
      return;
    }
    sdk.register({
      email: registerForm.email.value.trim(),
      password: registerForm.password.value,
      password_confirmation: registerForm.password_confirmation.value,
      display_name: registerForm.display_name ? registerForm.display_name.value.trim() : ''
    }).then(function () {
      setStatus(rStatus, 'Account created. Redirecting...');
      window.location.href = './account.html';
    }).catch(function (err) {
      setStatus(rStatus, (err && err.message) || 'Registration failed.');
    });
  });
}

var forgotForm = document.querySelector('[data-portal-forgot]');
if (forgotForm) {
  var fStatus = forgotForm.querySelector('[data-portal-status]');
  forgotForm.addEventListener('submit', function (e) {
    e.preventDefault();
    sdk.forgotPassword(forgotForm.email.value.trim()).then(function (res) {
      setStatus(fStatus, (res && res.message) || 'If an account exists, reset instructions have been sent.');
    }).catch(function (err) {
      setStatus(fStatus, (err && err.message) || 'Request failed.');
    });
  });
}

var accountRoot = document.querySelector('[data-portal-account]');
if (accountRoot) {
  var accessKey = '';
  var revealed = false;
  var statusEl = accountRoot.querySelector('[data-portal-status]');
  var keyEl = accountRoot.querySelector('[data-vpn-key]');
  var serversEl = accountRoot.querySelector('[data-servers-list]');
  var devicesEl = accountRoot.querySelector('[data-devices-list]');
  var devicesCountEl = accountRoot.querySelector('[data-devices-count]');
  var billingEl = accountRoot.querySelector('[data-billing-list]');

  function renderDevices(data) {
    var devices = (data && data.devices) || [];
    var limit = (data && data.limit) || 5;
    if (devicesCountEl) devicesCountEl.textContent = devices.length + ' / ' + limit + ' devices';
    if (!devicesEl) return;
    devicesEl.innerHTML = '';
    if (!devices.length) {
      devicesEl.innerHTML = '<tr><td colspan="4">No devices connected.</td></tr>';
      return;
    }
    devices.forEach(function (dev) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td></td><td></td><td></td><td><button type="button" class="outline-button">Revoke</button></td>';
      tr.children[0].textContent = dev.device_name || dev.device_uid;
      tr.children[1].textContent = dev.platform || 'unknown';
      tr.children[2].textContent = dev.last_seen_at ? new Date(dev.last_seen_at).toLocaleDateString() : '—';
      tr.querySelector('button').addEventListener('click', function () {
        sdk.revokeDevice(accessKey, dev.device_uid).then(function () {
          return sdk.getDevices(accessKey);
        }).then(renderDevices);
      });
      devicesEl.appendChild(tr);
    });
  }

  var ready = (!sdk.isAuthenticated() && sdk.mode === 'demo')
    ? sdk.login({ email: (accountRoot.querySelector('[data-profile-email]') && accountRoot.querySelector('[data-profile-email]').textContent.trim()) || 'user@example.com', password: 'demo-password' })
    : Promise.resolve();

  ready.then(function () {
    return Promise.all([sdk.getMe(), sdk.getSubscription(), sdk.getBillingHistory()]);
  }).then(function (results) {
    var me = results[0];
    var sub = results[1] && results[1].subscription;
    var billing = results[2] && results[2].payments;
    if (me && me.client) {
      var emailEl = accountRoot.querySelector('[data-profile-email]');
      if (emailEl) emailEl.textContent = me.client.email;
    }
    if (sub) {
      var planEl = accountRoot.querySelector('[data-sub-plan]');
      var expEl = accountRoot.querySelector('[data-sub-expires]');
      if (planEl) planEl.textContent = sub.plan_name + ' (' + sub.access_tier + ')';
      if (expEl) expEl.textContent = sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—';
      accessKey = sub.access_key || '';
      if (keyEl) keyEl.textContent = maskKey(accessKey);
      sdk.getBootstrap(accessKey).then(function (boot) {
        if (!serversEl) return;
        serversEl.innerHTML = '';
        ((boot && boot.servers) || []).forEach(function (srv) {
          var tr = document.createElement('tr');
          tr.innerHTML = '<td></td><td></td><td></td><td></td>';
          tr.children[0].textContent = srv.country_code + ' — ' + srv.name + (srv.is_recommended ? ' ★' : '');
          tr.children[1].textContent = srv.status;
          tr.children[2].textContent = srv.ping_ms ? srv.ping_ms + ' ms' : '—';
          tr.children[3].textContent = (srv.protocols || []).map(function (p) { return p.type; }).join(', ');
          serversEl.appendChild(tr);
        });
      });
      sdk.getDevices(accessKey).then(renderDevices);
    }
    if (billingEl) {
      billingEl.innerHTML = '';
      if (!billing || !billing.length) {
        billingEl.innerHTML = '<tr><td colspan="4">No payments yet.</td></tr>';
      } else {
        billing.forEach(function (p) {
          var tr = document.createElement('tr');
          tr.innerHTML = '<td></td><td></td><td></td><td></td>';
          tr.children[0].textContent = p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—';
          tr.children[1].textContent = p.plan_code;
          tr.children[2].textContent = '€' + ((p.final_amount_minor || 0) / 100).toFixed(2);
          tr.children[3].textContent = p.status;
          billingEl.appendChild(tr);
        });
      }
    }
  }).catch(function (err) {
    setStatus(statusEl, (err && err.message) || 'Could not load account data.');
  });

  var revealBtn = accountRoot.querySelector('[data-key-reveal]');
  if (revealBtn) {
    revealBtn.addEventListener('click', function () {
      revealed = !revealed;
      if (keyEl) keyEl.textContent = revealed ? accessKey : maskKey(accessKey);
      revealBtn.textContent = revealed ? 'Hide' : 'Show';
    });
  }

  var copyBtn = accountRoot.querySelector('[data-key-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && accessKey) {
        navigator.clipboard.writeText(accessKey).then(function () { setStatus(statusEl, 'VPN key copied.'); });
      }
    });
  }

  var logoutAllBtn = accountRoot.querySelector('[data-logout-all]');
  if (logoutAllBtn) {
    logoutAllBtn.addEventListener('click', function () {
      sdk.logoutAll().then(function () { window.location.href = './login.html'; });
    });
  }

  var supportForm = accountRoot.querySelector('[data-support-form]');
  if (supportForm) {
    supportForm.addEventListener('submit', function (e) {
      e.preventDefault();
      sdk.createSupportTicket({
        subject: supportForm.subject.value.trim(),
        message: supportForm.message.value.trim()
      }).then(function () {
        supportForm.reset();
        setStatus(statusEl, 'Support request sent.');
      });
    });
  }
}
