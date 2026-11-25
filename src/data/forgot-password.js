const index = require('./index');
module.exports = { ...index, landing: false, homeHref: './index.html#home', plansHref: './index.html#plans', title: 'Reset password — N1X VPN', description: 'Reset your N1X VPN password.', nav: index.nav.map(item => ({ ...item, href: './index.html' + item.href })) };
