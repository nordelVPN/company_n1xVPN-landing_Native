const modules = ['i18n', 'navigation', 'wishlist', 'portal', 'support-widget'];
module.exports = {
  index: { template: './pages/index.hbs', data: './src/data/index.js', modules: ['i18n', 'navigation', 'app-preview', 'wishlist', 'portal', 'support-widget'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  account: { template: './pages/account.hbs', data: './src/data/account.js', modules: ['i18n', 'navigation', 'wishlist', 'demo-auth', 'portal', 'support-widget'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  login: { template: './pages/login.hbs', data: './src/data/login.js', modules: ['i18n', 'navigation', 'wishlist', 'demo-auth', 'portal', 'support-widget'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  'create-account': { template: './pages/create-account.hbs', data: './src/data/create-account.js', modules, styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  'forgot-password': { template: './pages/forgot-password.hbs', data: './src/data/forgot-password.js', modules, styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  privacy: { template: './pages/privacy.hbs', data: './src/data/privacy.js', modules, styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  terms: { template: './pages/terms.hbs', data: './src/data/terms.js', modules, styles: ['base', 'pages/index', 'pages/account', 'checkout'] }
};
