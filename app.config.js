module.exports = {
  expo: {
    name: 'Meal Tracker',
    slug: 'meal-tracker',
    version: '1.0.0',
    orientation: 'portrait',
    backgroundColor: '#000000',
    icon: './src/assets/icon.png',
    android: {
      adaptiveIcon: {
        foregroundImage: './src/assets/icon.png',
        backgroundColor: '#93C572',
      },
      softwareKeyboardLayoutMode: 'pan',
      package: 'com.ndricimpllana.mealtracker',
    },
    platforms: ['android', 'ios'],
    extra: {
      eas: {
        projectId: '75afe85f-97a5-4322-af0c-d1a157f2512b',
      },
      // Loaded from .env — never commit .env to git
      exerciseDbKey: process.env.EXERCISEDB_KEY ?? '',
    },
  },
};
