/* global navigator, URLSearchParams, URL */
'use strict';

var sdkFactory = require('./vpn-portal-sdk');
var QRCore = require('qrcode/lib/core/qrcode');
function createQrMatrix(text) {
  return QRCore.create(text, { errorCorrectionLevel: 'M' }).modules;
}
var sdk = sdkFactory.createVpnPortalSdk({ brandSlug: 'n1x' });
sdkFactory.syncAccountNavLinks(sdk);
var siteConfigPromise = sdk.getSiteConfig();
sdkFactory.bindPageBoot(siteConfigPromise);
var N1X_DEFAULT_PLANS = [
  { plan_code: 'trial', name: 'Trial - 1 month', price_minor: 100 },
  { plan_code: 'monthly', name: '1 Month', price_minor: 700 },
  { plan_code: 'quarterly', name: '3 Months', price_minor: 1500 },
  { plan_code: 'yearly', name: '12 Months', price_minor: 5500 }
];
var cachedPlans = N1X_DEFAULT_PLANS.slice();
var currentSiteConfig = null;
var cachedClientEmail = '';
function syncN1xWishlistBotUrls(cfg) {
  if (!cfg || !sdkFactory.isSiteInWishlistMode(cfg)) return;
  var lang = sdkFactory.getCurrentSiteLanguage();
  document.querySelectorAll('[data-wishlist-open], [data-select-plan]').forEach(function (el) {
    var planCode = el.getAttribute('data-select-plan') || '';
    el.setAttribute('data-wishlist-bot-url', sdkFactory.buildWishlistBotUrl(cfg, { planCode: planCode, language: lang }));
  });
}
siteConfigPromise.then(function (cfg) {
  currentSiteConfig = cfg;
  sdkFactory.syncAccountNavLinks(sdk);
  var isWishlist = sdkFactory.isSiteInWishlistMode(cfg);
  document.documentElement.dataset.launchMode = isWishlist ? 'wishlist_only' : 'live';
  if (isWishlist) {
    var openDlg = document.querySelector('dialog[data-wishlist]');
    if (openDlg && openDlg.open) openDlg.close();
    syncN1xWishlistBotUrls(cfg);
  }
});
document.addEventListener('languagechange', function () {
  if (currentSiteConfig) syncN1xWishlistBotUrls(currentSiteConfig);
});

document.addEventListener('click', function (e) {
  var btn = e.target && e.target.closest && e.target.closest('[data-wishlist-open], [data-select-plan]');
  if (!btn) return;
  var explicitPlan = btn.getAttribute('data-select-plan') || '';
  if (currentSiteConfig) {
    if (!sdkFactory.isSiteInWishlistMode(currentSiteConfig)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    sdkFactory.openWishlistBot(currentSiteConfig, {
      planCode: explicitPlan,
      language: sdkFactory.getCurrentSiteLanguage()
    });
    return;
  }
  e.preventDefault();
  e.stopImmediatePropagation();
  siteConfigPromise.then(function (cfg) {
    if (sdkFactory.isSiteInWishlistMode(cfg)) {
      sdkFactory.openWishlistBot(cfg, {
        planCode: explicitPlan,
        language: sdkFactory.getCurrentSiteLanguage()
      });
    } else {
      btn.click();
    }
  });
}, true);
var orderWishlistCtrl = null;

function uiMsg() {
  return sdkFactory.getPortalUiMessages();
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
}

function maskKey(key) {
  return key && key.length > 12 ? key.slice(0, 10) + '••••••••••••' + key.slice(-4) : '••••••••';
}

function formatEur(minor) {
  var euros = (minor || 0) / 100;
  return '€' + (Number.isInteger(euros) ? String(euros) : euros.toFixed(2));
}

if (document.querySelector('#plans')) {
  document.querySelectorAll('[data-select-plan]').forEach(function (btn) {
    var code = btn.getAttribute('data-select-plan');
    var card = btn.closest('.plan-card, article');
    var titleEl = card && card.querySelector('h3');
    if (code) cachedPlans.push({ plan_code: code, name: titleEl ? titleEl.textContent.trim() : code });
  });

  if (sdk.mode === 'live') {
    sdk.getPublicPlans().then(function (res) {
      var plans = (res && res.plans) || [];
      if (plans.length) {
        cachedPlans = plans.map(function (p) { return { plan_code: p.plan_code, name: p.name || p.plan_code }; });
        if (orderWishlistCtrl) orderWishlistCtrl.update({ plans: cachedPlans });
      }
      plans.forEach(function (plan) {
        var btn = document.querySelector('[data-select-plan="' + plan.plan_code + '"]');
        var card = btn && btn.closest('.plan-card, article');
        var priceEl = card && card.querySelector('.plan-price, .price, strong');
        if (priceEl) priceEl.textContent = formatEur(plan.price_minor);
      });
    }).catch(function () { /* keep static fallback */ });
  }

  siteConfigPromise.then(function (cfg) {
    if (!sdkFactory.isSiteServersEnabled(cfg)) {
      var strip = document.querySelector('[data-live-servers-strip]');
      if (strip) strip.hidden = true;
      return;
    }
    if (sdk.mode !== 'live') return;
    sdk.getPublicServersCatalog().then(function (res) {
      var servers = (res && (res.servers || res.locations || res.data)) || [];
      var plansEl = document.querySelector('#plans');
      if (plansEl && servers.length) {
        plansEl.setAttribute('data-live-servers-count', String(servers.length));
        sdkFactory.renderLiveServersStrip(plansEl.querySelector('.container') || plansEl, servers);
      }
    }).catch(function () { /* optional */ });
  });
}

var isAccountPage = Boolean(document.querySelector('[data-portal-account]'));
if (!isAccountPage) {
  sdkFactory.initCheckoutReturnPolling(sdk);
}

var orderForm = document.querySelector('[data-order-form]');
function findN1xPlan(code) {
  var clean = String(code || '').trim();
  return cachedPlans.find(function (p) { return p.plan_code === clean; }) ||
    N1X_DEFAULT_PLANS.find(function (p) { return p.plan_code === clean; }) ||
    N1X_DEFAULT_PLANS[2];
}

if (orderForm) {
  sdkFactory.bindFormValidationClear(orderForm);
  var syncN1xDialogLabels = function () {
    var ui = sdkFactory.getWishlistUiText();
    var regBtn = orderForm.querySelector('[data-plan-action="register"] span');
    var wishBtn = orderForm.querySelector('[data-plan-action="wishlist"] span');
    var tgBtn = orderForm.querySelector('[data-plan-dialog-tg] span');
    if (regBtn) regBtn.textContent = ui.registerBtn;
    if (wishBtn) wishBtn.textContent = ui.wishlistBtn;
    if (tgBtn) tgBtn.textContent = ui.telegramBtn;
  };
  syncN1xDialogLabels();
  document.addEventListener('languagechange', syncN1xDialogLabels);

  window.__n1xPreparePlanDialog = function () {
    syncN1xDialogLabels();
    sdkFactory.clearFieldErrors(orderForm);
    var notice = orderForm.querySelector('[data-order-notice]');
    if (notice) sdkFactory.clearPortalStatus(notice);
    var tgLink = orderForm.querySelector('[data-plan-dialog-tg]');
    if (tgLink) tgLink.hidden = true;
    if (sdk.isAuthenticated() && orderForm.email && !orderForm.email.value) {
      if (cachedClientEmail) {
        orderForm.email.value = cachedClientEmail;
      } else {
        sdk.getMe().then(function (me) {
          if (me && me.client && me.client.email && !orderForm.email.value) {
            cachedClientEmail = me.client.email;
            orderForm.email.value = cachedClientEmail;
          }
        }).catch(function () {});
      }
    }
  };

  var regActionBtn = orderForm.querySelector('[data-plan-action="register"]');
  var wishActionBtn = orderForm.querySelector('[data-plan-action="wishlist"]');
  var noticeEl = orderForm.querySelector('[data-order-notice]');
  var tgEl = orderForm.querySelector('[data-plan-dialog-tg]');

  var submitN1xPlanDialog = function (intent, triggerBtn) {
    sdkFactory.clearFieldErrors(orderForm);
    var ui = sdkFactory.getWishlistUiText();
    var emailVal = orderForm.email ? orderForm.email.value.trim() : '';
    if (!isValidEmail(emailVal)) {
      var errMsg = ui.emailInvalid || uiMsg().invalidEmail;
      sdkFactory.setFieldErrors(orderForm, { email: errMsg });
      sdkFactory.setPortalStatus(noticeEl, errMsg, 'error', { scroll: false });
      return;
    }
    var selected = orderForm.querySelector('[name="order-plan"]:checked');
    var plan = findN1xPlan(selected ? selected.value : 'quarterly');
    var source = intent === 'register' ? 'plan_dialog_register' : 'plan_dialog_wishlist';
    var meta = {
      intent: intent,
      source_page: 'index',
      plan_name: plan.name,
      price_minor: plan.price_minor,
      currency: 'EUR'
    };

    if (intent === 'register') {
      sdkFactory.withFormBusy(orderForm, triggerBtn, function () {
        var timeout = new Promise(function (resolve) { window.setTimeout(resolve, 1500); });
        return Promise.race([
          sdk.joinWishlist({ email: emailVal, planCode: plan.plan_code, source: source, meta: meta }).catch(function () { return null; }),
          timeout
        ]).then(function () {
          if (sdk.isAuthenticated()) {
            window.location.href = './account.html?plan=' + encodeURIComponent(plan.plan_code);
            return;
          }
          sdk.savePlanSelectionHandoff({ email: emailVal, planCode: plan.plan_code });
          window.location.href = './create-account.html?plan=' + encodeURIComponent(plan.plan_code);
        });
      }, { loadingText: ui.submitting });
      return;
    }

    sdkFactory.setPortalStatus(noticeEl, ui.submitting, 'loading', { scroll: false });
    sdkFactory.withFormBusy(orderForm, triggerBtn, function () {
      return sdk.joinWishlist({
        email: emailVal,
        planCode: plan.plan_code,
        source: source,
        meta: meta
      }).then(function (res) {
        var msg = (res && res.already_registered) ? (ui.planUpdated || ui.successExisting) : ui.successNew;
        sdkFactory.setPortalStatus(noticeEl, msg, (res && res.already_registered) ? 'info' : 'success', { scroll: false });
        if (tgEl && currentSiteConfig && currentSiteConfig.wishlist_bot_url) {
          tgEl.href = currentSiteConfig.wishlist_bot_url;
          tgEl.hidden = false;
        }
      }).catch(function (err) {
        if (err && err.details) sdkFactory.setFieldErrors(orderForm, err.details);
        sdkFactory.setPortalStatus(noticeEl, sdkFactory.formatPortalApiError(err, ui.errorGeneric), 'error', { scroll: false });
      });
    }, { loadingText: ui.submitting });
  };

  if (regActionBtn) regActionBtn.addEventListener('click', function () { submitN1xPlanDialog('register', regActionBtn); });
  if (wishActionBtn) wishActionBtn.addEventListener('click', function () { submitN1xPlanDialog('wishlist', wishActionBtn); });
  orderForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitN1xPlanDialog('register', regActionBtn || wishActionBtn);
  });
}

var loginForm = document.querySelector('[data-portal-login]');
if (loginForm && sdk.mode === 'live') {
  sdkFactory.bindFormValidationClear(loginForm);
  if (loginForm.email && loginForm.email.value === 'user@example.com') loginForm.email.value = '';
  if (loginForm.password && loginForm.password.value === 'demo-password') loginForm.password.value = '';
  var lStatus = loginForm.querySelector('[data-portal-status]');
  var lBtn = loginForm.querySelector('button[type="submit"]');
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    sdkFactory.clearFieldErrors(loginForm);
    var email = loginForm.email ? loginForm.email.value.trim() : '';
    var password = loginForm.password ? loginForm.password.value : '';
    var fieldErrs = {};
    if (!isValidEmail(email)) fieldErrs.email = uiMsg().invalidEmail;
    if (!password) fieldErrs.password = uiMsg().requiredField;
    if (Object.keys(fieldErrs).length) {
      sdkFactory.setFieldErrors(loginForm, fieldErrs);
      sdkFactory.setPortalStatus(lStatus, Object.values(fieldErrs)[0], 'error');
      return;
    }
    sdkFactory.setPortalStatus(lStatus, uiMsg().loading, 'loading', { scroll: false });
    sdkFactory.withFormBusy(loginForm, lBtn, function () {
      return sdk.login({ email: email, password: password }).then(function () {
        sdkFactory.setPortalStatus(lStatus, 'Signed in. Redirecting...', 'success');
        window.location.href = './account.html';
      }).catch(function (err) {
        if (err && err.details) {
          sdkFactory.setFieldErrors(loginForm, err.details);
        } else if (err && err.status === 401) {
          sdkFactory.setFieldErrors(loginForm, {
            email: sdkFactory.formatPortalApiError(err, uiMsg().unauthorized),
            password: ' '
          }, { focus: false });
        }
        sdkFactory.setPortalStatus(lStatus, sdkFactory.formatPortalApiError(err, 'Sign in failed.'), 'error');
      });
    });
  });
}

var registerForm = document.querySelector('[data-portal-register]');
if (registerForm) {
  sdkFactory.bindFormValidationClear(registerForm);
  var regParams = new URLSearchParams(window.location.search || '');
  var handoff = sdk.consumePlanSelectionHandoff() || {};
  var selectedPlanCode = String(regParams.get('plan') || handoff.planCode || '').trim();
  if (handoff.email && registerForm.email && !registerForm.email.value) {
    registerForm.email.value = handoff.email;
  }
  if (selectedPlanCode) {
    sdkFactory.mountSelectedPlanBanner(registerForm, findN1xPlan(selectedPlanCode));
  }
  // TASK-027: Pre-launch / Join Wishlist banner intentionally omitted on create-account.html.
  var rStatus = registerForm.querySelector('[data-portal-status]');
  var rBtn = registerForm.querySelector('button[type="submit"]');
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    sdkFactory.clearFieldErrors(registerForm);
    var email = registerForm.email ? registerForm.email.value.trim() : '';
    var password = registerForm.password ? registerForm.password.value : '';
    var confirm = registerForm.password_confirmation ? registerForm.password_confirmation.value : '';
    var terms = registerForm.accept_terms;
    var fieldErrs = {};
    if (!isValidEmail(email)) fieldErrs.email = uiMsg().invalidEmail;
    if (password.length < 8) fieldErrs.password = uiMsg().passwordTooShort;
    if (password !== confirm) fieldErrs.password_confirmation = uiMsg().passwordsMismatch;
    if (terms && !terms.checked) fieldErrs.accept_terms = uiMsg().acceptTermsRequired;
    if (Object.keys(fieldErrs).length) {
      sdkFactory.setFieldErrors(registerForm, fieldErrs);
      sdkFactory.setPortalStatus(rStatus, Object.values(fieldErrs)[0], 'error');
      return;
    }
    sdkFactory.setPortalStatus(rStatus, uiMsg().loading, 'loading', { scroll: false });
    sdkFactory.withFormBusy(registerForm, rBtn, function () {
      return sdk.register({
        email: email,
        password: password,
        password_confirmation: confirm,
        display_name: registerForm.display_name ? registerForm.display_name.value.trim() : '',
        plan_code: selectedPlanCode || undefined
      }).then(function () {
        sdkFactory.setPortalStatus(rStatus, 'Account created. Redirecting...', 'success');
        window.location.href = selectedPlanCode
          ? ('./account.html?plan=' + encodeURIComponent(selectedPlanCode))
          : './account.html';
      }).catch(function (err) {
        if (err && err.details) sdkFactory.setFieldErrors(registerForm, err.details);
        sdkFactory.setPortalStatus(rStatus, sdkFactory.formatPortalApiError(err, 'Registration failed.'), 'error');
      });
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
  sdkFactory.bindFormValidationClear(resetForm);
  var rstStatus = resetForm.querySelector('[data-portal-status]');
  var rstBtn = resetForm.querySelector('button[type="submit"]');
  resetForm.addEventListener('submit', function (e) {
    e.preventDefault();
    sdkFactory.clearFieldErrors(resetForm);
    var password = resetForm.password ? resetForm.password.value : '';
    var confirm = resetForm.password_confirmation ? resetForm.password_confirmation.value : '';
    var fieldErrs = {};
    if (password.length < 8) fieldErrs.password = uiMsg().passwordTooShort;
    if (password !== confirm) fieldErrs.password_confirmation = uiMsg().passwordsMismatch;
    if (Object.keys(fieldErrs).length) {
      sdkFactory.setFieldErrors(resetForm, fieldErrs);
      sdkFactory.setPortalStatus(rstStatus, Object.values(fieldErrs)[0], 'error');
      return;
    }
    sdkFactory.setPortalStatus(rstStatus, uiMsg().loading, 'loading', { scroll: false });
    sdkFactory.withFormBusy(resetForm, rstBtn, function () {
      return sdk.resetPassword({
        token: resetForm.token.value,
        password: password,
        password_confirmation: confirm
      }).then(function () {
        sdkFactory.setPortalStatus(rstStatus, 'Password updated. Redirecting...', 'success');
        window.location.href = './login.html';
      }).catch(function (err) {
        if (err && err.details) sdkFactory.setFieldErrors(resetForm, err.details);
        sdkFactory.setPortalStatus(rstStatus, sdkFactory.formatPortalApiError(err, 'Reset failed. Request a new reset link.'), 'error');
      });
    });
  });
} else if (forgotForm) {
  sdkFactory.bindFormValidationClear(forgotForm);
  var fStatus = forgotForm.querySelector('[data-portal-status]');
  var fBtn = forgotForm.querySelector('button[type="submit"]');
  forgotForm.addEventListener('submit', function (e) {
    e.preventDefault();
    sdkFactory.clearFieldErrors(forgotForm);
    var email = forgotForm.email ? forgotForm.email.value.trim() : '';
    if (!isValidEmail(email)) {
      sdkFactory.setFieldErrors(forgotForm, { email: uiMsg().invalidEmail });
      sdkFactory.setPortalStatus(fStatus, uiMsg().invalidEmail, 'error');
      return;
    }
    sdkFactory.setPortalStatus(fStatus, uiMsg().loading, 'loading', { scroll: false });
    sdkFactory.withFormBusy(forgotForm, fBtn, function () {
      return sdk.forgotPassword(email).then(function (res) {
        sdkFactory.setPortalStatus(fStatus, (res && res.message) || 'If an account exists, reset instructions have been sent.', 'success');
      }).catch(function (err) {
        if (err && err.details) sdkFactory.setFieldErrors(forgotForm, err.details);
        sdkFactory.setPortalStatus(fStatus, sdkFactory.formatPortalApiError(err, 'Request failed.'), 'error');
      });
    });
  });
}

var accountRoot = document.querySelector('[data-portal-account]');
if (accountRoot) {
  if (sdk.mode === 'live' && !sdk.isAuthenticated()) {
    window.location.replace('./login.html');
  } else {
    var accountTabs = sdkFactory.initAccountTabs(accountRoot, { defaultTab: 'overview' });
    var accessKey = '';
    var revealed = false;
    var statusEl = accountRoot.querySelector('.account-heading [data-portal-status]') || accountRoot.querySelector('[data-portal-status]');
    var devicesStatusEl = accountRoot.querySelector('[data-devices-status]');
    var vpnStatusEl = accountRoot.querySelector('[data-vpn-status]');
    var keyEl = accountRoot.querySelector('[data-vpn-key]');
    var serversEl = accountRoot.querySelector('[data-servers-list]');
    var devicesEl = accountRoot.querySelector('[data-devices-list]');
    var devicesCountEl = accountRoot.querySelector('[data-devices-count]');
    var billingEl = accountRoot.querySelector('[data-billing-list]');

    if (sdk.mode === 'live' && statusEl) {
      sdkFactory.clearPortalStatus(statusEl);
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
        var revokeBtn = tr.querySelector('button');
        revokeBtn.addEventListener('click', function () {
          if (revokeBtn.disabled) return;
          revokeBtn.disabled = true;
          revokeBtn.dataset.loading = 'true';
          sdk.revokeDevice(accessKey, dev.device_uid).then(function () {
            return sdk.getDevices(accessKey);
          }).then(function (res) {
            renderDevices(res);
            sdkFactory.setPortalStatus(devicesStatusEl || statusEl, 'Device revoked.', 'success', { scroll: false });
          }).catch(function (err) {
            revokeBtn.disabled = false;
            delete revokeBtn.dataset.loading;
            sdkFactory.setPortalStatus(devicesStatusEl || statusEl, sdkFactory.formatPortalApiError(err, 'Could not revoke device.'), 'error');
          });
        });
        devicesEl.appendChild(tr);
      });
    };

    var vpnConnectCtrl = null;

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
        sdkFactory.appendServerVlessActions(tr.children[3], srv, {
          statusEl: vpnStatusEl || statusEl,
          onSelectQr: function (selectedSrv) {
            if (vpnConnectCtrl && typeof vpnConnectCtrl.selectServerVless === 'function') {
              vpnConnectCtrl.selectServerVless(selectedSrv);
            }
          }
        });
        serversEl.appendChild(tr);
      });
    };

    var loadAccountData = function () {
      var rawEmail = accountRoot.querySelector('[data-profile-email]') ? accountRoot.querySelector('[data-profile-email]').textContent.trim() : '';
      var initialEmail = (rawEmail && rawEmail.indexOf('@') > 0) ? rawEmail : 'user@example.com';
      var ready = (!sdk.isAuthenticated() && sdk.mode === 'demo')
        ? sdk.login({ email: initialEmail, password: 'demo-password' })
        : Promise.resolve();

      return ready.then(function () {
        return Promise.all([sdk.getMe(), sdk.getSubscription(), Promise.resolve({ payments: [] }), siteConfigPromise]);
      }).then(function (results) {
        var me = results[0];
        var sub = results[1] && results[1].subscription;
        var billing = results[2] && results[2].payments;
        var siteCfg = results[3];
        var serversAllowed = sdkFactory.isSiteServersEnabled(siteCfg);
        sdkFactory.revealAuthGate();
        if (me && me.client) {
          accountRoot.querySelectorAll('[data-profile-email]').forEach(function (el) {
            el.textContent = me.client.email;
          });
          var nameInput = accountRoot.querySelector('[name="display_name"]');
          if (nameInput) nameInput.value = me.client.display_name || '';
        }
        var accCheckoutForm = accountRoot.querySelector('[data-account-checkout-form]');
        if (accCheckoutForm && sdkFactory.isSiteCheckoutEnabled(siteCfg)) {
          accCheckoutForm.hidden = false;
          var urlPlan = new URLSearchParams(window.location.search || '').get('plan');
          var planSelect = accCheckoutForm.querySelector('[data-account-plan-select]');
          if (planSelect && urlPlan && planSelect.querySelector('option[value="' + urlPlan + '"]')) {
            planSelect.value = urlPlan;
          }
          var providerHost = accCheckoutForm.querySelector('[data-payment-providers]');
          if (providerHost && !accCheckoutForm.__providersMounted) {
            accCheckoutForm.__providersMounted = true;
            var getAccProvider = function () { return null; };
            sdkFactory.mountPaymentProviderSelector(sdk, providerHost).then(function (getter) {
              if (typeof getter === 'function') getAccProvider = getter;
            });
            var chkStatus = accCheckoutForm.querySelector('[data-account-checkout-status]') || statusEl;
            var chkBtn = accCheckoutForm.querySelector('button[type="submit"]');
            accCheckoutForm.addEventListener('submit', function (ev) {
              ev.preventDefault();
              var chosenPlan = (planSelect && planSelect.value) || 'quarterly';
              var returnUrl = new URL('./account.html', window.location.href).href;
              var cancelUrl = new URL('./account.html?status=cancelled', window.location.href).href;
              sdkFactory.setPortalStatus(chkStatus, uiMsg().loading, 'loading', { scroll: false });
              sdkFactory.withFormBusy(accCheckoutForm, chkBtn, function () {
                return sdk.checkout({
                  plan_code: chosenPlan,
                  provider: getAccProvider(),
                  return_url: returnUrl,
                  cancel_url: cancelUrl
                }).then(function (res) {
                  sdkFactory.handleCheckoutResponse(sdk, res);
                }).catch(function (err) {
                  sdkFactory.setPortalStatus(chkStatus, sdkFactory.formatPortalApiError(err, 'Checkout failed.'), 'error');
                });
              });
            });
          }
        }
        var tabVpn = accountRoot.querySelector('#tab-vpn-access');
        var panelVpn = accountRoot.querySelector('#panel-vpn-access');
        var tabDev = accountRoot.querySelector('#tab-devices');
        var panelDev = accountRoot.querySelector('#panel-devices');
        if (!serversAllowed) {
          if (tabVpn) tabVpn.hidden = true;
          if (panelVpn) panelVpn.hidden = true;
          if (tabDev) tabDev.hidden = true;
          if (panelDev) panelDev.hidden = true;
          if (accountTabs && typeof accountTabs.refresh === 'function') {
            accountTabs.refresh();
          }
          var overviewPanel = accountRoot.querySelector('#panel-overview');
          var contentHost = accountRoot.querySelector('.account-content');
          if (overviewPanel) {
            sdkFactory.mountAccountWaitlistCard(overviewPanel, siteCfg, { className: 'account-card' });
          } else {
            sdkFactory.mountAccountWaitlistCard(contentHost || accountRoot, siteCfg, { prepend: true, className: 'account-card' });
          }
        } else {
          if (tabVpn) tabVpn.hidden = false;
          if (tabDev) tabDev.hidden = false;
          if (accountTabs && typeof accountTabs.refresh === 'function') {
            accountTabs.refresh();
          }
        }
        if (sub) {
          accountRoot.querySelectorAll('[data-sub-plan]').forEach(function (el) {
            el.textContent = sub.plan_name + ' (' + sub.access_tier + ')';
          });
          accountRoot.querySelectorAll('[data-sub-status]').forEach(function (el) {
            el.textContent = sub.status;
          });
          accountRoot.querySelectorAll('[data-sub-expires]').forEach(function (el) {
            el.textContent = sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—';
          });
          accessKey = sub.access_key || '';
          if (keyEl) keyEl.textContent = revealed ? accessKey : maskKey(accessKey);
          if (accessKey && serversAllowed) {
            sdk.getBootstrap(accessKey).then(function (boot) {
              var connectAnchor = (keyEl && keyEl.parentElement) || accountRoot.querySelector('#vpn-access');
              vpnConnectCtrl = sdkFactory.mountVpnConnectPanel(connectAnchor, boot, {
                createQrMatrix: createQrMatrix,
                placement: 'after'
              });
              renderServers((boot && boot.servers) || []);
            }).catch(function (err) {
              if (vpnConnectCtrl) { vpnConnectCtrl.hide(); vpnConnectCtrl = null; }
              if (err.code === 'KEY_EXPIRED') {
                sdkFactory.setPortalStatus(statusEl, uiMsg().keyExpired, 'warning');
              } else if (err.code === 'KEY_REVOKED') {
                sdkFactory.setPortalStatus(statusEl, uiMsg().keyRevoked, 'error');
              } else if (err.code === 'DEVICE_LIMIT_REACHED' || err.status === 409) {
                sdkFactory.setPortalStatus(statusEl, uiMsg().deviceLimitReached, 'warning');
                var errDevices = err.payload && err.payload.error && err.payload.error.devices;
                if (Array.isArray(errDevices)) renderDevices({ limit: 5, devices: errDevices });
              } else {
                sdkFactory.setPortalStatus(statusEl, sdkFactory.formatPortalApiError(err, 'Could not load VPN servers.'), 'error');
              }
            });
            sdk.getDevices(accessKey).then(renderDevices).catch(function () { /* ignore */ });
          } else {
            if (vpnConnectCtrl) { vpnConnectCtrl.hide(); vpnConnectCtrl = null; }
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
        if (sdk.mode === 'live' && (!sdk.isAuthenticated() || (err && (err.status === 401 || err.code === 'UNAUTHORIZED')))) {
          sdk.clearSession();
          window.location.replace('./login.html');
          return;
        }
        sdkFactory.revealAuthGate();
        sdkFactory.setPortalStatus(statusEl, sdkFactory.formatPortalApiError(err, 'Could not load account data.'), 'error');
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
        if (!accessKey) {
          sdkFactory.setPortalStatus(vpnStatusEl || statusEl, 'VPN key is not available yet.', 'warning', { scroll: false });
          return;
        }
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(accessKey).then(function () {
            sdkFactory.setPortalStatus(vpnStatusEl || statusEl, 'VPN key copied.', 'success', { scroll: false });
          }).catch(function () {
            sdkFactory.setPortalStatus(vpnStatusEl || statusEl, 'Could not copy VPN key. Please copy it manually.', 'error', { scroll: false });
          });
        } else {
          sdkFactory.setPortalStatus(vpnStatusEl || statusEl, 'Clipboard is unavailable. Please copy the key manually.', 'warning', { scroll: false });
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
      sdkFactory.bindFormValidationClear(profileForm);
      var pStatus = profileForm.querySelector('[data-profile-status]') || statusEl;
      var pBtn = profileForm.querySelector('button[type="submit"]');
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sdkFactory.clearFieldErrors(profileForm);
        var displayName = profileForm.display_name ? profileForm.display_name.value.trim() : '';
        if (!displayName) {
          sdkFactory.setFieldErrors(profileForm, { display_name: uiMsg().requiredField });
          sdkFactory.setPortalStatus(pStatus, uiMsg().requiredField, 'error');
          return;
        }
        sdkFactory.setPortalStatus(pStatus, uiMsg().loading, 'loading', { scroll: false });
        sdkFactory.withFormBusy(profileForm, pBtn, function () {
          return sdk.updateProfile({ display_name: displayName }).then(function () {
            sdkFactory.setPortalStatus(pStatus, 'Profile updated.', 'success');
          }).catch(function (err) {
            if (err && err.details) sdkFactory.setFieldErrors(profileForm, err.details);
            sdkFactory.setPortalStatus(pStatus, sdkFactory.formatPortalApiError(err, 'Update failed.'), 'error');
          });
        });
      });
    }

    var passForm = accountRoot.querySelector('[data-password-form]');
    if (passForm) {
      sdkFactory.bindFormValidationClear(passForm);
      var pwStatus = passForm.querySelector('[data-password-status]') || statusEl;
      var pwBtn = passForm.querySelector('button[type="submit"]');
      passForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sdkFactory.clearFieldErrors(passForm);
        var cur = passForm.current_password ? passForm.current_password.value : '';
        var nextPw = passForm.password ? passForm.password.value : '';
        var confirmPw = passForm.password_confirmation ? passForm.password_confirmation.value : '';
        var fieldErrs = {};
        if (!cur) fieldErrs.current_password = uiMsg().requiredField;
        if (nextPw.length < 8) fieldErrs.password = uiMsg().passwordTooShort;
        if (nextPw !== confirmPw) fieldErrs.password_confirmation = uiMsg().passwordsMismatch;
        if (Object.keys(fieldErrs).length) {
          sdkFactory.setFieldErrors(passForm, fieldErrs);
          sdkFactory.setPortalStatus(pwStatus, Object.values(fieldErrs)[0], 'error');
          return;
        }
        sdkFactory.setPortalStatus(pwStatus, uiMsg().loading, 'loading', { scroll: false });
        sdkFactory.withFormBusy(passForm, pwBtn, function () {
          return sdk.changePassword({
            current_password: cur,
            password: nextPw,
            password_confirmation: confirmPw
          }).then(function () {
            passForm.reset();
            sdkFactory.setPortalStatus(pwStatus, 'Password updated.', 'success');
          }).catch(function (err) {
            if (err && err.details) sdkFactory.setFieldErrors(passForm, err.details);
            sdkFactory.setPortalStatus(pwStatus, sdkFactory.formatPortalApiError(err, 'Password update failed.'), 'error');
          });
        });
      });
    }

    var supportForm = accountRoot.querySelector('[data-support-form]');
    if (supportForm) {
      sdkFactory.bindFormValidationClear(supportForm);
      var sStatus = supportForm.querySelector('[data-support-status]') || statusEl;
      var sBtn = supportForm.querySelector('button[type="submit"]');
      supportForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sdkFactory.clearFieldErrors(supportForm);
        var subject = supportForm.subject ? supportForm.subject.value.trim() : '';
        var message = supportForm.message ? supportForm.message.value.trim() : '';
        var fieldErrs = {};
        if (subject.length < 3) fieldErrs.subject = uiMsg().subjectTooShort;
        if (message.length < 5) fieldErrs.message = uiMsg().messageTooShort;
        if (Object.keys(fieldErrs).length) {
          sdkFactory.setFieldErrors(supportForm, fieldErrs);
          sdkFactory.setPortalStatus(sStatus, Object.values(fieldErrs)[0], 'error');
          return;
        }
        sdkFactory.setPortalStatus(sStatus, uiMsg().loading, 'loading', { scroll: false });
        sdkFactory.withFormBusy(supportForm, sBtn, function () {
          return sdk.createSupportTicket({
            subject: subject,
            message: message
          }).then(function () {
            supportForm.reset();
            sdkFactory.setPortalStatus(sStatus, 'Support request sent.', 'success');
          }).catch(function (err) {
            if (err && err.details) sdkFactory.setFieldErrors(supportForm, err.details);
            sdkFactory.setPortalStatus(sStatus, sdkFactory.formatPortalApiError(err, 'Support request failed.'), 'error');
          });
        });
      });
    }
  }
}
