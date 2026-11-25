const index = require('./index');
module.exports = { ...index, landing: false, homeHref: './index.html#home', plansHref: './index.html#plans', title: 'Privacy Policy — N1X VPN', description: 'N1X VPN Privacy Policy.', nav: index.nav.map(item => ({ ...item, href: './index.html' + item.href })) };
