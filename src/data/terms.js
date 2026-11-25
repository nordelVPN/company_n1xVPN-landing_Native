const index = require('./index');
module.exports = { ...index, landing: false, homeHref: './index.html#home', plansHref: './index.html#plans', title: 'Terms of Use — N1X VPN', description: 'N1X VPN Terms of Use.', nav: index.nav.map(item => ({ ...item, href: './index.html' + item.href })) };
