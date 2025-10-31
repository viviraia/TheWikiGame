# The Wiki Game

A Progressive Web App (PWA) where players navigate from one Wikipedia page to another using only article links. Compete globally on the leaderboard!

## ✨ Features

- 🎮 Navigate Wikipedia using only article links
- 🏆 Global leaderboard system with GitHub Gist backend
- 📱 Installable as mobile/desktop app (PWA)
- ⏱️ Track clicks and time with intelligent difficulty calculation
- 🎯 Multiple difficulty modes (Normal, Hard, Ultra)
- 📊 View top players worldwide
- 🧠 **Real-time difficulty scoring** using Wikipedia API (pageviews + backlinks)
- 🔗 **Connectivity-based page selection** for balanced gameplay
- � **Curated content from Wikipedia Vital Articles** (~10,000 quality articles)
- 🎯 **Progressive difficulty**: Easy (1,000), Hard (6,300), Ultra (2,700) pages
- 🌙 Beautiful, modern UI with smooth animations
- ⚡ Fast and responsive with intelligent caching

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
- **[Difficulty Scoring](docs/DIFFICULTY_SCORING.md)** - Real-time scoring system explained
- **[Hybrid Approach](docs/HYBRID_APPROACH.md)** - Page selection methodology

## 🛠️ Technical Stack

- **HTML5** - Structure
- **CSS3** - Styling with modern features (flexbox, animations)
- **JavaScript (Vanilla)** - Game logic and Wikipedia API integration
- **GitHub Gist** - Serverless leaderboard backend
- **Service Worker** - PWA features and offline support
- **Jest** - Unit and integration testing
- **Playwright** - End-to-end testing

## 🎯 Game Modes

Pages are automatically selected and categorized based on **real Wikipedia data**:

- **Normal Mode** (~1,200 pages) - Top 40% by popularity + connectivity, 1.0x base difficulty
- **Hard Mode** (~900 pages) - Middle 30% by combined metrics, 1.5-2.5x difficulty  
- **Ultra Hard Mode** (~900 pages) - Bottom 30% (obscure pages), 2.5-4.0x difficulty

Page difficulty is calculated in real-time using:
- **Pageviews API** - How popular the page is (last 30 days)
- **Backlinks API** - How many pages link to it (connectivity)

## 📊 Intelligent Difficulty System

The game uses **real-time Wikipedia API data** for accurate scoring:

### Real-Time Scoring (Default)
- Fetches live pageview statistics (30-day average)
- Counts incoming backlinks (connectivity metric)
- Combines metrics: `difficulty = 7 - (log10(views) + log10(backlinks))`
- Results cached for 1 hour to optimize performance
- Difficulty range: 1.0 (very easy) to 4.0 (very hard)

### Page Generation
Run `npm run generate:pages` to create fresh page lists:
- Fetches top 3000 Wikipedia pages by views
- Enriches with backlink counts for each page
- Sorts by combined popularity + connectivity score
- Creates balanced difficulty tiers automatically

See [docs/DIFFICULTY_SCORING.md](docs/DIFFICULTY_SCORING.md) for detailed explanation.

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

# Test Wikipedia API connectivity
npm run test:connectivity  # Test pageviews & backlinks APIs

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

**Coverage targets:** 70% (branches, functions, lines, statements)

See [docs/TESTING.md](docs/TESTING.md) for detailed testing guide.

## 🔧 Customization

### Page Generation
Run `npm run generate:pages` to create fresh page lists:
- Fetches top 3000 Wikipedia pages using **Hybrid Approach**:
  - 73% from Pageviews API (popular, trending)
  - 17% from Vital Articles (curated, important)
  - 10% from diverse categories (topic balance)
- Gets backlink counts for connectivity analysis
- Sorts by combined popularity + connectivity
- Generates `src/js/data/pages.js` with three difficulty tiers
- Creates statistics in `src/js/data/page-stats.json`

**Note:** This takes ~5-12 minutes due to API rate limiting.

### Customize Page Selection

Edit `scripts/generate-popular-pages.js`:

```javascript
const CONFIG = {
    TARGET_PAGES: 3000,         // Number of pages to fetch
    DAYS_TO_FETCH: 30,          // Days of pageview data
    FETCH_CONNECTIVITY: true,    // Include backlink analysis
    DELAY_MS: 100,              // API rate limiting delay
    // ... more options
};
```

### Adjust Difficulty Tiers

Modify tier percentages in `generate-popular-pages.js`:

```javascript
const normalModePages = pageNames.slice(0, Math.floor(CONFIG.TARGET_PAGES * 0.4));  // 40%
const hardModePages = pageNames.slice(/* 40-70% */);
const ultraModePages = pageNames.slice(/* 70-100% */);
```
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

The game is fully configured for GitHub Pages deployment:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository Settings
   - Navigate to "Pages" section
   - Under "Source", select branch: `main` (or `master`)
   - Select folder: `/ (root)`
   - Click "Save"

3. **Access your game:**
   - URL: `https://username.github.io/repository-name/`
   - Wait 1-2 minutes for deployment to complete

**✅ Already configured:**
- `.nojekyll` file (allows all files to be served)
- Relative paths in all files
- Service worker with relative URLs
- PWA manifest with relative start URL

### Other Hosting Options
- **Netlify**: Drag & drop the folder → Instant deployment
- **Vercel**: Connect GitHub repo → Automatic deployment
- **Cloudflare Pages**: Fast CDN with automatic builds
- **Any Web Host**: Upload files via FTP (100% static)

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
