# The Wiki Game

A Progressive Web App (PWA) where players navigate from one Wikipedia page to another using only article links. Compete globally on the leaderboard!

## ✨ Features

- 🎮 Navigate Wikipedia using only article links
- 🏆 Global leaderboard system with GitHub Gist backend
- 📱 Installable as mobile/desktop app (PWA)
- ⏱️ Track clicks and time with intelligent difficulty calculation
- 🎯 Multiple difficulty modes (Normal, Hard, Ultra)
- 📊 View top players worldwide
- 🧠 Wikipedia API integration for accurate categorization
- 🌙 Beautiful, modern UI with smooth animations
- ⚡ Fast and responsive

## 🚀 Quick Start

### Option 1: Play Immediately
Simply open `index.html` in your browser - no installation needed!

### Option 2: Run Tests
```bash
npm install
npm test
```

### Option 3: Install as Mobile/Desktop App

**iPhone/iPad:**
1. Open in Safari → Share → Add to Home Screen

**Android:**
1. Open in Chrome → Menu (⋮) → Add to Home Screen

**Windows/Mac:**
1. Open in Chrome/Edge → Install icon in address bar → Install

## 🎮 How to Play

1. **Start Game** - Begin with random Wikipedia pages
2. **Navigate** - Click only on links within articles
3. **Reach Target** - Find your way to the target page
4. **Track Stats** - Monitor your clicks and time
5. **Submit Score** - Add your score to the global leaderboard
6. **Compete** - Try to beat the top players!

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Configure the global leaderboard system
- **[Testing Guide](docs/TESTING.md)** - Run and write tests
- **[API Integration](docs/API_INTEGRATION.md)** - Wikipedia API usage details

## 🛠️ Technical Stack

- **HTML5** - Structure
- **CSS3** - Styling with modern features (flexbox, animations)
- **JavaScript (Vanilla)** - Game logic and Wikipedia API integration
- **GitHub Gist** - Serverless leaderboard backend
- **Service Worker** - PWA features and offline support
- **Jest** - Unit and integration testing
- **Playwright** - End-to-end testing

## 🎯 Game Modes

- **Normal Mode** (649 pages) - 95% popular topics, 1.0x multiplier
- **Hard Mode** (1,227 pages) - 80% obscure topics, 1.5x multiplier
- **Ultra Hard Mode** (1,600+ pages) - 80% ultra-obscure academic topics, 2.0x multiplier

## 📊 Intelligent Difficulty System

The game uses the **Wikipedia MediaWiki API** to fetch real category data:
- 13 smart categories (Geography, History, Science, People, etc.)
- Accurate difficulty calculation based on page relationships
- Automatic fallback to keyword matching if API fails
- <1 second performance impact at game start

See [API Integration docs](docs/API_INTEGRATION.md) for details.

## 🏆 Leaderboard Setup

The game uses **GitHub Gist** as a free backend for global scores.

**Quick Setup (5 minutes):**
1. Create a Gist with `leaderboard.json` and content `{"entries": []}`
2. Generate a GitHub token with `gist` scope
3. Update `src/js/app.js` with your Gist ID and token

**Full instructions:** See [docs/SETUP.md](docs/SETUP.md)

**Testing locally?** The game uses localStorage by default - no setup needed!

## 📁 Project Structure

```
Kawaa/
├── index.html              # Main entry point
├── manifest.json           # PWA manifest
├── src/
│   ├── js/                 # JavaScript source files
│   │   ├── app.js         # Main game logic
│   │   ├── leaderboard.js # Leaderboard system
│   │   └── service-worker.js # PWA service worker
│   └── css/
│       └── styles.css      # Game styles
├── docs/                   # Documentation
│   ├── SETUP.md           # Leaderboard setup guide
│   ├── TESTING.md         # Testing guide
│   └── API_INTEGRATION.md # Wikipedia API docs
├── tests/                  # Test suites
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
├── scripts/                # Utility scripts
│   ├── data/              # Data management
│   ├── fixes/             # One-time fix scripts
│   └── validation/        # Validation scripts
└── examples/               # Example files
```

## 🧪 Testing

Comprehensive test coverage with Jest and Playwright:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

**Coverage targets:** 70% (branches, functions, lines, statements)

See [docs/TESTING.md](docs/TESTING.md) for detailed testing guide.

## 🔧 Customization

### Add More Pages
Edit `src/js/app.js` and modify the page arrays:
```javascript
const popularPages = [
    "Your_Topic_Here",
    "Another_Topic",
    // ... add more
];
```

### Change Colors
Edit `src/css/styles.css`:
```css
:root {
    --primary-color: #6366f1;   /* Main theme color */
    --secondary-color: #8b5cf6; /* Accent color */
}
```

### Adjust Scoring
Edit `src/js/leaderboard.js` to modify the score calculation formula.

## 🚀 Deployment

### GitHub Pages (Recommended)
1. Push code to GitHub repository
2. Enable GitHub Pages in repo settings
3. Access at: `https://username.github.io/repo-name/`

### Other Options
- **Netlify**: Drag & drop deployment
- **Vercel**: Automatic deployment from Git
- **Any Web Host**: Upload via FTP (static files)

## 💡 Tips for Best Experience

1. **Modern browser** - Chrome, Edge, Safari (2020+)
2. **Good internet** - For fast Wikipedia loading
3. **Install as PWA** - App-like experience on mobile
4. **Portrait mode** - Recommended for mobile

## 🤝 Contributing

Contributions welcome!

**Before submitting PRs:**
- Run tests: `npm test`
- Ensure coverage ≥70%
- Add tests for new features
- Follow existing code style

## 📈 Future Ideas

- [ ] Multiplayer mode
- [ ] Daily challenges with leaderboard reset
- [ ] Social media sharing
- [ ] Achievement system
- [ ] Game statistics/history
- [ ] Dark mode toggle
- [ ] Multiple language support
- [ ] Sound effects
- [ ] Tutorial mode

## 📄 License

MIT License - Free for personal and educational use.

## 🎮 Have Fun!

Enjoy exploring Wikipedia in a whole new way! 🌐📚

---

**Made with ❤️ for curious minds everywhere!**
