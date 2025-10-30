# Testing Guide

Complete guide for testing The Wiki Game, including unit tests, integration tests, and manual testing.

## 🧪 Quick Start

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e
```

---

## 📋 Test Structure

```
tests/
├── setup.js                      # Test configuration
├── unit/                         # Unit tests
│   ├── game.test.js             # Game logic tests
│   ├── leaderboard.test.js      # Leaderboard tests
│   └── validate-wikipedia-pages.test.js
├── integration/                  # Integration tests
│   └── game-leaderboard.test.js
└── e2e/                         # End-to-end tests
    └── app.spec.js              # Full game flow tests
```

---

## 🎯 Test Coverage

Current coverage thresholds:
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

### View Coverage Report
```bash
npm test
# Open coverage/lcov-report/index.html in browser
```

---

## 🚀 Wikipedia API Testing

### Quick API Test

1. **Open the game** in your browser (`index.html`)
2. **Open Browser Console** (F12)
3. **Start a game** and watch for API logs:

```javascript
📚 Wikipedia API categories for Albert_Einstein: 20th-century physicists, german scientists, nobel laureates...
Categorized Albert_Einstein as: people (from API categories)
Estimated difficulty: 1.25x
```

### Manual API Testing

Open browser console and run:
```javascript
// Test individual page metadata
const metadata = await window.gameLeaderboard.getPageMetadata('Albert_Einstein', true);
console.log(metadata);
// Output: { tier: 1, category: 'people', popularity: 85 }

// Test difficulty calculation
const score = await window.gameLeaderboard.calculateScore(10, 60, 'France', 'Germany', true);
console.log(score);
```

### Disable API for Testing
```javascript
// Calculate score without API
const score = await window.gameLeaderboard.calculateScore(10, 60, 'Start_Page', 'End_Page', false);
```

---

## 📊 API Testing Details

### What Gets Tested
- ✅ Real Wikipedia category fetching
- ✅ Intelligent categorization (13 categories)
- ✅ Fallback to keyword matching
- ✅ Difficulty multiplier calculation
- ✅ Performance (API timing)

### API Categories Recognized
1. 🌍 **Geography** - countries, cities, regions
2. 📜 **History** - wars, events, periods
3. 🔬 **Science** - physics, chemistry, biology
4. 👤 **People** - biographies, historical figures
5. 🎨 **Culture** - arts, literature, music
6. 🚀 **Space** - astronomy, planets, cosmos
7. 💻 **Technology** - computing, engineering
8. 🌿 **Nature** - animals, plants, ecology
9. ⚽ **Sports** - athletes, teams, competitions
10. 🍕 **Food** - cuisine, cooking, recipes
11. 📺 **Media** - TV, films, entertainment
12. 🏛️ **Landmarks** - buildings, monuments
13. 🐉 **Mythology** - legends, deities, folklore

### Fallback System
1. **Wikipedia API** ← Try first
2. **Keyword Matching** ← Analyze page name
3. **Sample Database** ← Check known pages
4. **Unknown** ← Safe default

---

## 🎮 Manual Game Testing

### Basic Flow Test
1. Open `index.html` in browser
2. Click "Start Game"
3. Navigate using Wikipedia links
4. Click target page
5. Verify win screen appears
6. Submit score to leaderboard
7. Check leaderboard displays correctly

### Difficulty Mode Testing
1. Test Normal Mode (649 pages)
2. Test Hard Mode (1,227 pages, 1.5x multiplier)
3. Test Ultra Hard Mode (1,600+ pages, 2.0x multiplier)
4. Verify difficulty multiplier affects final score

### Features to Test
- ✅ Click counter increments
- ✅ Timer runs correctly
- ✅ Back button works
- ✅ Hints system (if implemented)
- ✅ Page navigation tracking
- ✅ Win detection
- ✅ Score calculation
- ✅ Leaderboard submission
- ✅ Mobile responsiveness

---

## 🔧 Validation Scripts

### Validate Page Data
```bash
node scripts/data/validate-pages.js
```
Checks for:
- Duplicate pages
- Invalid page names
- Proper formatting

### Validate Parenthesis in Pages
```bash
node scripts/data/validate-parenthesis-pages.js
```
Ensures all page names have balanced parentheses.

### Count Pages
```bash
node scripts/data/count-pages.js
```
Counts pages in each difficulty tier.

### Test Difficulty Balance
```bash
node scripts/validation/test-difficulty.js
```
Analyzes difficulty distribution across game modes.

### Verify Hard Mode
```bash
node scripts/validation/verify-hard-mode.js
```
Ensures hard mode pages meet obscurity criteria.

### Verify Tier Alignment
```bash
node scripts/validation/verify-tier-alignment.js
```
Checks consistency between tiers and page lists.

---

## 🐛 Troubleshooting Tests

### Tests Failing?

**Check Node.js version:**
```bash
node --version
# Should be 16.x or higher
```

**Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Clear Jest cache:**
```bash
npm test -- --clearCache
```

### E2E Tests Failing?

**Install Playwright browsers:**
```bash
npx playwright install
```

**Run E2E tests with UI:**
```bash
npx playwright test --ui
```

**Debug E2E tests:**
```bash
npx playwright test --debug
```

---

## 📈 Performance Testing

### API Performance
Watch console logs for:
```
⏱️ API call took 250ms
⏱️ Total metadata fetch: 500ms
```

Acceptable ranges:
- Single API call: 200-500ms
- Total game start: <1 second

### Game Performance
Monitor:
- Page load time (<2s)
- Navigation responsiveness (<100ms)
- Leaderboard load time (<1s)

---

## ✅ Pre-Deployment Checklist

Before deploying, verify:

- [ ] All tests pass: `npm test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Coverage meets threshold (70%)
- [ ] Manual game flow works
- [ ] All difficulty modes work
- [ ] Leaderboard submission works
- [ ] PWA installable
- [ ] Mobile responsive
- [ ] Console has no errors
- [ ] API integration working

---

## 🎉 Continuous Integration

Tests run automatically on:
- Every commit (via GitHub Actions)
- Pull requests
- Before deployment

See `.github/workflows/` for CI configuration.

---

## 📚 Additional Resources

- **Jest Documentation:** https://jestjs.io/
- **Playwright Documentation:** https://playwright.dev/
- **Testing Best Practices:** https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

**Happy Testing! 🧪✨**
