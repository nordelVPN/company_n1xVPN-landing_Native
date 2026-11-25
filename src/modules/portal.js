/* global navigator, URLSearchParams, URL */
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

function formatEur(minor) {
  var euros = (minor || 0) / 100;
  return '€' + (Number.isInteger(euros) ? String(euros) : euros.toFixed(2));
}

if (sdk.mode === 'live' && document.querySelector('#plans')) {
  sdk.getPublicPlans().then(function (res) {
    ((res && res.plans) || []).forEach(function (plan) {
      var btn = document.querySelector('[data-select-plan="' + plan.plan_code + '"]');
      var card = btn && btn.closest('.plan-card, article');
      var priceEl = card && card.querySelector('.plan-price, .price, strong');
      if (priceEl) priceEl.textContent = formatEur(plan.price_minor);
    });
  }).catch(function () { /* keep static fallback */ });

  sdk.getPublicServersCatalog().then(function (res) {
    var servers = (res && (res.servers || res.locations || res.data)) || [];
    var plansEl = document.querySelector('#plans');
    if (plansEl && servers.length) {
      plansEl.setAttribute('data-live-servers-count', String(servers.length));
      sdkFactory.renderLiveServersStrip(plansEl.querySelector('.container') || plansEl, servers);
    }
  }).catch(function () { /* optional */ });
}

var isAccountPage = Boolean(document.querySelector('[data-portal-account]'));
if (!isAccountPage) {
  sdkFactory.initCheckoutReturnPolling(sdk);
}

var orderForm = document.querySelector('[data-order-form]');
if (orderForm && sdk.mode === 'live') {
  var getXProvider = function () { return null; };
  var xProviderHost = orderForm.querySelector('[data-payment-providers]');
  if (!xProviderHost) {
    xProviderHost = document.createElement('div');
    xProviderHost.className = 'payment-providers';
    xProviderHost.setAttribute('data-payment-providers', '');
    xProviderHost.hidden = true;
    var xSubmit = orderForm.querySelector('button[type="submit"]');
    if (xSubmit && xSubmit.parentNode) {
      xSubmit.parentNode.insertBefore(xProviderHost, xSubmit);
    } else {
      orderForm.appendChild(xProviderHost);
    }
  }
  sdkFactory.mountPaymentProviderSelector(sdk, xProviderHost).then(function (getter) {
    if (typeof getter === 'function') getXProvider = getter;
  });

  orderForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var notice = orderForm.querySelector('[data-order-notice]');
    var selected = orderForm.querySelector('[name="order-plan"]:checked');
    if (!sdk.isAuthenticated()) {
      window.location.href = './login.html';
      return;
    }
    var returnUrl = new URL('./account.html', window.location.href).href;
    var cancelUrl = new URL('./index.html?status=cancelled', window.location.href).href;
    sdk.checkout({
      plan_code: selected ? selected.value : 'quarterly',
      provider: getXProvider(),
      payment_method: (orderForm.payment && orderForm.payment.value) || 'card',
      return_url: returnUrl,
      cancel_url: cancelUrl
    }).then(function (res) {
      setStatus(notice, res && res.checkout && res.checkout.mode === 'mock' ? 'Confirm test payment to activate your VPN key.' : 'Redirecting to payment provider...');
      var dialog = orderForm.closest('dialog');
      if (dialog && dialog.open && res && res.checkout && res.checkout.mode === 'mock') {
        dialog.close();
      }
      sdkFactory.handleCheckoutResponse(sdk, res);
    }).catch(function (err) {
      setStatus(notice, (err && err.message) || 'Checkout failed.');
    });
  });
}

var loginForm = document.querySelector('[data-portal-login]');
if (loginForm && sdk.mode === 'live') {
  if (loginForm.email && loginForm.email.value === 'user@example.com') loginForm.email.value = '';
  if (loginForm.password && loginForm.password.value === 'demo-password') loginForm.password.value = '';
  var lStatus = loginForm.querySelector('[data-portal-status]');
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    sdk.login({ email: loginForm.email.value.trim(), password: loginForm.password.value }).then(function () {
      setStatus(lStatus, 'Signed in. Redirecting...');
      window.location.href = './account.html';
    }).catch(function (err) {
      setStatus(lStatus, (err && err.message) || 'Sign in failed.');
    });
  });
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
var resetForm = document.querySelector('[data-portal-reset]');
var params = new URLSearchParams(window.location.search || '');
var resetToken = params.get('token');
if (resetToken && resetForm) {
  if (forgotForm) forgotForm.hidden = true;
  resetForm.hidden = false;
  resetForm.token.value = resetToken;
  var rstStatus = resetForm.querySelector('[data-portal-status]');
  resetForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (resetForm.password.value !== resetForm.password_confirmation.value) {
      setStatus(rstStatus, 'Passwords do not match.');
      return;
    }
    sdk.resetPassword({
      token: resetForm.token.value,
      password: resetForm.password.value,
      password_confirmation: resetForm.password_confirmation.value
    }).then(function () {
      setStatus(rstStatus, 'Password updated. Redirecting...');
      window.location.href = './login.html';
    }).catch(function (err) {
      setStatus(rstStatus, (err && err.message) || 'Reset failed.');
    });
  });
} else if (forgotForm) {
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
  if (sdk.mode === 'live' && !sdk.isAuthenticated()) {
    window.location.href = './login.html';
  } else {
    var accessKey = '';
    var revealed = false;
    var statusEl = accountRoot.querySelector('[data-portal-status]');
    var keyEl = accountRoot.querySelector('[data-vpn-key]');
    var serversEl = accountRoot.querySelector('[data-servers-list]');
    var devicesEl = accountRoot.querySelector('[data-devices-list]');
    var devicesCountEl = accountRoot.querySelector('[data-devices-count]');
    var billingEl = accountRoot.querySelector('[data-billing-list]');

    if (sdk.mode === 'live' && statusEl) {
      statusEl.hidden = true;
      statusEl.textContent = '';
    }

    var renderDevices = function (data) {
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
          }).then(renderDevices).catch(function (err) {
            setStatus(statusEl, (err && err.message) || 'Could not revoke device.');
          });
        });
        devicesEl.appendChild(tr);
      });
    };

    var renderServers = function (servers) {
      if (!serversEl) return;
      serversEl.innerHTML = '';
      if (!servers || !servers.length) {
        serversEl.innerHTML = '<tr><td colspan="4">No servers available for this subscription.</td></tr>';
        return;
      }
      servers.forEach(function (srv) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td></td><td></td><td></td><td></td>';
        tr.children[0].textContent = sdkFactory.formatServerLocation(srv);
        tr.children[1].textContent = sdkFactory.formatServerStatusAndLoad(srv);
        tr.children[2].textContent = srv.ping_ms ? srv.ping_ms + ' ms' : '—';
        tr.children[3].textContent = sdkFactory.formatServerProtocolsAndTags(srv);
        serversEl.appendChild(tr);
      });
    };

    var loadAccountData = function () {
      var initialEmail = (accountRoot.querySelector('[data-profile-email]') && accountRoot.querySelector('[data-profile-email]').textContent.trim()) || 'user@example.com';
      var ready = (!sdk.isAuthenticated() && sdk.mode === 'demo')
        ? sdk.login({ email: initialEmail, password: 'demo-password' })
        : Promise.resolve();

      return ready.then(function () {
        return Promise.all([sdk.getMe(), sdk.getSubscription(), sdk.getBillingHistory()]);
      }).then(function (results) {
        var me = results[0];
        var sub = results[1] && results[1].subscription;
        var billing = results[2] && results[2].payments;
        if (me && me.client) {
          var emailEl = accountRoot.querySelector('[data-profile-email]');
          var nameInput = accountRoot.querySelector('[name="display_name"]');
          if (emailEl) emailEl.textContent = me.client.email;
          if (nameInput) nameInput.value = me.client.display_name || '';
        }
        if (sub) {
          var planEl = accountRoot.querySelector('[data-sub-plan]');
          var subStatusEl = accountRoot.querySelector('[data-sub-status]');
          var expEl = accountRoot.querySelector('[data-sub-expires]');
          if (planEl) planEl.textContent = sub.plan_name + ' (' + sub.access_tier + ')';
          if (subStatusEl) subStatusEl.textContent = sub.status;
          if (expEl) expEl.textContent = sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—';
          accessKey = sub.access_key || '';
          if (keyEl) keyEl.textContent = revealed ? accessKey : maskKey(accessKey);
          if (accessKey) {
            sdk.getBootstrap(accessKey).then(function (boot) {
              renderServers((boot && boot.servers) || []);
            }).catch(function (err) {
              if (err.code === 'KEY_EXPIRED') {
                setStatus(statusEl, 'Your VPN subscription has expired. Please renew your plan.');
              } else if (err.code === 'KEY_REVOKED') {
                setStatus(statusEl, 'Your VPN key has been revoked. Please contact support.');
              } else if (err.code === 'DEVICE_LIMIT_REACHED' || err.status === 409) {
                setStatus(statusEl, 'Device limit reached (5/5). Please revoke one of your connected devices below.');
                var errDevices = err.payload && err.payload.error && err.payload.error.devices;
                if (Array.isArray(errDevices)) renderDevices({ limit: 5, devices: errDevices });
              } else {
                setStatus(statusEl, (err && err.message) || 'Could not load VPN servers.');
              }
            });
            sdk.getDevices(accessKey).then(renderDevices).catch(function () { /* ignore */ });
          } else {
            renderServers([]);
            renderDevices({ limit: 5, devices: [] });
          }
        } else {
          renderServers([]);
          renderDevices({ limit: 5, devices: [] });
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
              tr.children[3].textContent = sdkFactory.formatPaymentProvider(p.provider) + ' · ' + sdkFactory.formatPaymentStatus(p.status);
              billingEl.appendChild(tr);
            });
          }
        }
      }).catch(function (err) {
        setStatus(statusEl, (err && err.message) || 'Could not load account data.');
      });
    };

    loadAccountData();
    sdkFactory.initCheckoutReturnPolling(sdk, {
      statusEl: statusEl,
      onPaid: function () {
        loadAccountData();
      }
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

    var logoutBtn = accountRoot.querySelector('[data-logout]');
    if (logoutBtn && sdk.mode === 'live') {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        sdk.logout().then(function () { window.location.href = './login.html'; });
      });
    }

    var logoutAllBtn = accountRoot.querySelector('[data-logout-all]');
    if (logoutAllBtn) {
      logoutAllBtn.addEventListener('click', function () {
        sdk.logoutAll().then(function () { window.location.href = './login.html'; });
      });
    }

    var profileForm = accountRoot.querySelector('[data-profile-form]');
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sdk.updateProfile({ display_name: profileForm.display_name.value.trim() }).then(function () {
          setStatus(statusEl, 'Profile updated.');
        }).catch(function (err) {
          setStatus(statusEl, (err && err.message) || 'Update failed.');
        });
      });
    }

    var passForm = accountRoot.querySelector('[data-password-form]');
    if (passForm) {
      passForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sdk.changePassword({
          current_password: passForm.current_password.value,
          password: passForm.password.value,
          password_confirmation: passForm.password_confirmation.value
        }).then(function () {
          passForm.reset();
          setStatus(statusEl, 'Password updated.');
        }).catch(function (err) {
          setStatus(statusEl, (err && err.message) || 'Password update failed.');
        });
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
        }).catch(function (err) {
          setStatus(statusEl, (err && err.message) || 'Support request failed.');
        });
      });
    }
  }
}
