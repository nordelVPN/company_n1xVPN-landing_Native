const index = require('./index');
module.exports = { ...index, landing: false, homeHref: './index.html#home', plansHref: './index.html#plans', title: 'Create account — N1X VPN', description: 'Create your N1X VPN account.', nav: index.nav.map(item => ({ ...item, href: './index.html' + item.href })) };
