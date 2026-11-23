const index = require('./index');
module.exports = { ...index, landing: false, homeHref: './index.html#home', plansHref: './index.html#plans', title: 'Your account — N1X VPN', titleKey: 'account.title', descriptionKey: 'account.description', description: 'Your N1X VPN demo account.', nav: index.nav.map(item => ({ ...item, href: './index.html' + item.href })) };
