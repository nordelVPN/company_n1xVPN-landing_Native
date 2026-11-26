module.exports = {
  lang: 'en',
  homeHref: '#home',
  plansHref: '#plans',
  titleKey: 'index.title',
  descriptionKey: 'index.description',
  title: 'N1X VPN — Beyond borders. Beyond limits.',
  description: 'A versatile VPN for everyday life and play, giving you a more private, open, and flexible online experience.',
  canonical: '',
  landing: true,
  nav: [
    { href: '#the-app', label: 'The app', key: 'nav.theApp' },
    { href: '#why-n1x', label: 'Why N1X', key: 'nav.whyN1x' },
    { href: '#support', label: 'Support', key: 'nav.support' }
  ],
  header: {
    cta: 'Get N1X'
  },
  hero: {
    lines: ['Beyond', 'borders.', 'Beyond', 'limits.'],
    description: 'A versatile VPN for everyday life and play, giving you a more private, open, and flexible online experience.',
    button: 'Explore N1X',
    buttonHref: '#plans',
    stripHeadingLines: ['Made for the', 'way you play.'],
    features: [
      {
        title: 'PRIVACY EVERYDAY',
        description: 'Keep your online activity more private and secure.'
      },
      {
        title: 'ACCESS MORE',
        description: 'Enjoy a freer internet with fewer restrictions.'
      },
      {
        title: 'STAY FLEXIBLE',
        description: 'Use it at home, on the go, or wherever you play.'
      }
    ]
  },
  app: {
    lines: ['Your', 'connection.', 'Your way.'],
    description: 'A universal VPN app for gaming and everyday online life. Keep your connection private, access more of the internet and stay in control across your devices.',
    button: 'Get N1X',
    preview: {
      headingLines: ['Ready when', 'you are.'],
      status: 'Not connected',
      connectedStatus: 'Connected',
      connect: 'Connect',
      disconnect: 'Disconnect',
      serverLabel: 'Selected server',
      connectedServerLabel: 'Connected server',
      serverValue: 'Automatic',
      connectedServerValue: 'Netherlands • Amsterdam',
      viewServers: 'View all servers',
      connectedNote: 'Interactive interface preview — download the N1X VPN app to connect your device.',
      demoNotice: 'Download the N1X VPN app or open your account to view live servers.'
    },
    stripHeadingLines: ['Simple VPN', 'for everyday', 'online life.'],
    features: [
      {
        title: 'SIMPLE TO USE',
        description: 'Get started quickly with a clean, straightforward app across your devices.'
      },
      {
        title: 'CHOOSE YOUR LOCATION',
        description: 'Connect through locations across the globe to access more of the internet.'
      },
      {
        title: 'FOR EVERYDAY USE',
        description: 'A flexible VPN for gaming, streaming, browsing and staying private online.'
      }
    ]
  },
  why: {
    lines: ['A little more', 'freedom', 'online.'],
    description: "A universal VPN for a safer, more open and flexible online experience, whether you're gaming, streaming, working or browsing.",
    button: 'Explore N1X',
    buttonHref: '#plans',
    items: [
      {
        titleLines: ['Made for', 'everyday life'],
        description: 'A versatile VPN that fits seamlessly into your daily routine, at home, at work or on the go.'
      },
      {
        titleLines: ['Designed', 'for privacy'],
        description: 'Help keep your online activity more private with a secure, encrypted connection.'
      },
      {
        titleLines: ['Ready', 'when you are'],
        description: 'A reliable, flexible VPN that keeps up with how you play, watch, work and explore online.'
      }
    ]
  },
  pricing: {
    title: 'Choose your plan.',
    description: 'A universal VPN for play, work, and everyday online life.',
    plans: [
      { id: 'trial', price: '€1', name: 'Trial - 1 month', nameKey: 'pricing.plans.0.name', devices: '5 devices', devicesKey: 'pricing.plans.0.devices', note: 'Once for a new user', noteKey: 'pricing.plans.0.note', button: 'Choose Trial', buttonKey: 'pricing.plans.0.button' },
      { id: 'monthly', price: '€7', name: 'Next - 1 month', nameKey: 'pricing.plans.1.name', devices: '5 devices', devicesKey: 'pricing.plans.1.devices', note: '', noteKey: 'pricing.plans.1.note', button: 'Choose Next', buttonKey: 'pricing.plans.1.button' },
      { id: 'quarterly', price: '€15', name: '3 months', nameKey: 'pricing.plans.2.name', devices: '5 devices', devicesKey: 'pricing.plans.2.devices', note: '€5 per month', noteKey: 'pricing.plans.2.note', button: 'Choose 3 Months', buttonKey: 'pricing.plans.2.button' },
      { id: 'yearly', price: '€55', name: '12 months', nameKey: 'pricing.plans.3.name', devices: '5 devices', devicesKey: 'pricing.plans.3.devices', note: '€4.58 per month', noteKey: 'pricing.plans.3.note', button: 'Choose 12 Months', buttonKey: 'pricing.plans.3.button' }
    ]
  },
  support: {
    lines: ['How can we', 'help?'],
    description: 'Find answers, set up N1X, manage your account, and get help when you need it.',
    searchPlaceholder: 'Search support',
    categories: [
      {
        title: 'Getting started',
        description: 'Set up N1X, install the app, and connect for the first time.'
      },
      {
        title: 'Account & subscription',
        description: 'Manage your account, subscription, and billing details.'
      },
      {
        title: 'Troubleshooting',
        description: 'Fix common issues and get back to gaming.'
      }
    ],
    contactButton: 'Contact support',
    contactNote: 'Still need help? Get in touch with the N1X support team.'
  },
  footer: {
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    copyright: 'N1X VPN. All rights reserved.'
  },
  wishlist: {
    title: 'N1X VPN wishlist',
    description: 'Our Telegram wishlist is not available yet. Please check back soon.',
    telegramUrl: (/^https:\/\/t\.me\/[A-Za-z0-9_]+$/.test(process.env.TELEGRAM_BOT_URL || '') ? process.env.TELEGRAM_BOT_URL : ''),
    buttonText: 'Open Telegram',
    close: 'Close'
  }
};
