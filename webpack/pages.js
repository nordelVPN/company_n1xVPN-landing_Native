const modules = ['i18n', 'navigation', 'wishlist'];
module.exports = {
  index: { template: './pages/index.hbs', data: './src/data/index.js', modules: ['i18n', 'navigation', 'app-preview', 'wishlist'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  account: { template: './pages/account.hbs', data: './src/data/account.js', modules: [...modules, 'demo-auth', 'portal'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  login: { template: './pages/login.hbs', data: './src/data/login.js', modules: [...modules, 'demo-auth', 'portal'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  'create-account': { template: './pages/create-account.hbs', data: './src/data/create-account.js', modules: [...modules, 'portal'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  'forgot-password': { template: './pages/forgot-password.hbs', data: './src/data/forgot-password.js', modules: [...modules, 'portal'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  privacy: { template: './pages/privacy.hbs', data: './src/data/privacy.js', modules, styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  terms: { template: './pages/terms.hbs', data: './src/data/terms.js', modules, styles: ['base', 'pages/index', 'pages/account', 'checkout'] }
};
