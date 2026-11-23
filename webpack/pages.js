const modules = ['i18n', 'navigation', 'wishlist'];
module.exports = {
  index: { template: './pages/index.hbs', data: './src/data/index.js', modules: ['i18n', 'navigation', 'app-preview', 'wishlist'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  account: { template: './pages/account.hbs', data: './src/data/account.js', modules: [...modules, 'demo-auth'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] },
  login: { template: './pages/login.hbs', data: './src/data/login.js', modules: [...modules, 'demo-auth'], styles: ['base', 'pages/index', 'pages/account', 'checkout'] }
};
