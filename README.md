# Meal Tracker

Personal weekly meal plan tracker — 82 kg body recomposition plan.

## Stack

- React + Vite
- CSS Modules
- localStorage for persistence

## Local dev

```bash
npm install
npm run dev
```

## Deploy to Vercel (recommended — free)

1. Push this folder to a GitHub repository
2. Go to vercel.com and import the repo
3. Vercel auto-detects Vite — just click Deploy
4. Open the URL on your phone and tap Share → Add to Home Screen

## Deploy to Netlify (alternative)

```bash
npm run build
# drag and drop the dist/ folder to netlify.com/drop
```

## Add to phone home screen

iPhone (Safari): Open the deployed URL → tap Share → "Add to Home Screen"
Android (Chrome): Open the URL → tap the 3-dot menu → "Add to Home Screen"

Meal checks are saved in localStorage and persist across sessions.
