module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm start',
      startServerReadyTimeout: 20000,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      assertions: {
        'categories.performance': ['warn', { minScore: 0.9 }],
        'categories.accessibility': ['error', { minScore: 1 }],
        'categories.best-practices': ['warn', { minScore: 0.9 }],
        'categories.seo': ['warn', { minScore: 0.9 }],
        'categories.pwa': ['warn', { minScore: 0.9 }],
      },
    },
  },
};