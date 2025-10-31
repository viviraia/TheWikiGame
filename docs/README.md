# The Wiki Game - Documentation

A Progressive Web App (PWA) where players navigate from one Wikipedia page to another using only article links.

## 📚 Documentation Overview

This folder contains all technical documentation for The Wiki Game project.

### Core Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and module organization
- **[API_INTEGRATION.md](API_INTEGRATION.md)** - Wikipedia API integration details
- **[DIFFICULTY_SCORING.md](DIFFICULTY_SCORING.md)** - Real-time difficulty scoring system
- **[SETUP.md](SETUP.md)** - Leaderboard and deployment setup guide
- **[TESTING.md](TESTING.md)** - Testing guide and coverage information
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference for common tasks

## Quick Start

### For Users

Simply open `index.html` in your browser to play!

### Install as App (PWA)

**On iPhone/iPad:**
1. Open in Safari → Share button → "Add to Home Screen"

**On Android:**
1. Open in Chrome → Menu (⋮) → "Add to Home Screen"

**On Desktop:**
1. Open in Chrome/Edge → Install icon in address bar → "Install"

## 🎮 How to Play

1. **Start** - Click "Start Game" to begin with random Wikipedia pages
2. **Navigate** - Click only on links within articles to navigate
3. **Reach Target** - Find your way to the target page
4. **Track Progress** - Monitor your clicks and time
5. **Submit Score** - Add your score to the leaderboard
6. **Compete** - Try to beat the top players!

## 🛠️ For Developers

### Quick Commands

```bash
# Run tests
npm test

# Generate fresh page lists
npm run generate:pages

# Test API connectivity
npm run test:connectivity

# Start development server
npm run dev
```

### Project Structure

```
src/
├── js/
│   ├── data/
│   │   ├── pages.js              # Wikipedia page lists
│   │   └── vital-articles.json   # Curated vital articles
│   ├── modules/
│   │   ├── GameState.js          # Game state management
│   │   ├── WikipediaAPI.js       # Wikipedia API wrapper
│   │   ├── UIController.js       # UI updates
│   │   ├── PageSelector.js       # Page selection logic
│   │   ├── PageConnectivity.js   # Difficulty calculation
│   │   └── ScoringSystem.js      # Score calculation
│   ├── app.js                    # Main application
│   ├── leaderboard.js            # Leaderboard manager
│   └── service-worker.js         # PWA functionality
└── css/
    └── styles.css                # Styling
```

### Key Features

- **10,000+ Wikipedia pages** from curated Vital Articles
- **Real-time difficulty scoring** using Wikipedia API
- **Three difficulty modes** - Normal, Hard, Ultra
- **Progressive Web App** - Installable on any device
- **Offline support** - Service worker caching
- **Local leaderboard** - Browser localStorage
- **Responsive design** - Mobile-first approach

## 📖 Documentation Guide

### Architecture & Design
**[ARCHITECTURE.md](ARCHITECTURE.md)** - Learn about the modular architecture, data flow, and how components interact

### API & Integration
**[API_INTEGRATION.md](API_INTEGRATION.md)** - Understand Wikipedia API integration, category detection, and data fetching

### Difficulty & Scoring
**[DIFFICULTY_SCORING.md](DIFFICULTY_SCORING.md)** - Deep dive into real-time difficulty calculation using pageviews and backlinks

### Setup & Deployment
**[SETUP.md](SETUP.md)** - Complete guide for setting up GitHub Gist leaderboard and deploying to production

### Testing
**[TESTING.md](TESTING.md)** - Comprehensive testing guide covering unit, integration, and E2E tests

### Quick Reference
**[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick commands and examples for common development tasks

## 🔧 Configuration

### Add Custom Pages

Edit `src/js/data/pages.js` or regenerate from Wikipedia:

```bash
npm run fetch:vital        # Fetch from Wikipedia
npm run generate:pages     # Generate pages.js
```

### Customize UI

Edit CSS variables in `src/css/styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
}
```

### Configure Leaderboard

See **[SETUP.md](SETUP.md)** for detailed leaderboard configuration.

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
npm run test:watch    # Watch mode
```

Current test coverage: 70%+ across all metrics.

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Access at `https://username.github.io/repo-name/`

### Other Platforms
- **Netlify** - Drag & drop deployment
- **Vercel** - Git integration
- **Any static host** - Upload files via FTP

## 📈 Performance

- **Lightweight** - No framework dependencies
- **Fast** - Vanilla JavaScript
- **Cached** - Service worker for offline support
- **Optimized** - Lazy loading and efficient DOM updates

## 🤝 Contributing

1. Run tests before submitting: `npm test`
2. Maintain test coverage above 70%
3. Follow existing code style
4. Add tests for new features

## 📄 License

Free to use for personal and educational purposes.

---

**Made with Love**
