# Quick Reference: Real-Time Difficulty Scoring

## 🚀 Quick Commands

```bash
# Test API connectivity
npm run test:connectivity

# Generate fresh page lists (with backlinks)
npm run generate:pages

# Run the game
npm start
```

## 📊 How Difficulty Works

### Score Formula
```
Difficulty = 7 - (log10(daily_views) + log10(backlinks))
```

### Difficulty Scale
- **1.0 - 1.5**: Very Easy ⭐ (Popular, well-connected)
- **1.5 - 2.5**: Easy/Medium ⭐⭐ 
- **2.5 - 3.5**: Hard ⭐⭐⭐
- **3.5 - 4.0**: Very Hard ⭐⭐⭐⭐ (Obscure, few links)

### Example Pages
```javascript
// Very Easy (1.0)
United_States       // 46,000 views/day, 1000+ backlinks

// Easy (1.5)
Python              // 8,000 views/day, 1000+ backlinks

// Medium (2.0)
Quantum_mechanics   // 4,000 views/day, 1000+ backlinks

// Hard (3.0)
Obscure_scientist   // 100 views/day, 50 backlinks

// Very Hard (3.8+)
Academic_paper      // 20 views/day, 10 backlinks
```

## 🎮 For Players

**Difficulty is automatically calculated when you:**
1. Win a game
2. Submit your score
3. View leaderboard

**No action needed** - it just works! ✨

## 🛠️ For Developers

### Check a Page's Difficulty

```javascript
import { PageConnectivity } from './src/js/modules/PageConnectivity.js';

const connectivity = new PageConnectivity();
const result = await connectivity.calculateDifficulty('Start_Page', 'Target_Page');

console.log(result);
// {
//   difficulty: 2.35,
//   metrics: {
//     targetViews: 1234,
//     targetBacklinks: 456,
//     startBacklinks: 7890,
//     popularityScore: 3.09,
//     connectivityScore: 2.66
//   }
// }
```

### Get Page Statistics

```javascript
// Get pageviews
const views = await connectivity.getPageViews('Python_(programming_language)');
// { total: 239398, average: 7980 }

// Get backlinks
const backlinks = await connectivity.getBacklinkCount('Python_(programming_language)');
// { count: 500, estimatedTotal: 1000, hasMore: true }
```

### Error Handling

If the API fails, the system returns a default difficulty of 2.0:

```javascript
// On error, you'll see this in console:
// "Error in API difficulty estimation: [error details]"
// System continues with difficulty = 2.0
```

## 📦 What's Cached

All API calls are cached for **1 hour** to optimize performance:

- Page views (30 days)
- Backlink counts
- Difficulty calculations

**Cache is cleared when:**
- Browser refreshed
- 1 hour expires
- Manually cleared: `connectivity.clearCache()`

## 🔧 Configuration

### Page Generation Config

Edit `scripts/generate-popular-pages.js`:

```javascript
const CONFIG = {
    TARGET_PAGES: 3000,         // Total pages to fetch
    DAYS_TO_FETCH: 30,          // Days of pageview data
    FETCH_CONNECTIVITY: true,    // Enable backlink fetching
    DELAY_MS: 100,              // API rate limit delay (ms)
};
```

### Tier Distribution

Modify in `generatePagesFile()`:

```javascript
// Current: 40% / 30% / 30%
const normalModePages = pageNames.slice(0, Math.floor(n * 0.4));
const hardModePages = pageNames.slice(Math.floor(n * 0.4), Math.floor(n * 0.7));
const ultraModePages = pageNames.slice(Math.floor(n * 0.7));
```

## 🐛 Troubleshooting

### API Not Working
```bash
# Test connectivity
npm run test:connectivity

# Check console for errors
# Common issues:
# - No internet connection
# - Wikipedia API down (rare)
# - Rate limited (wait 1 minute)
```

### Scores Seem Wrong
```javascript
// Check difficulty calculation in console
// Look for: "Difficulty calculation for X → Y"
// Shows: views, backlinks, final difficulty
```

### Page Generation Slow
```javascript
// Disable connectivity fetching for speed
const CONFIG = {
    FETCH_CONNECTIVITY: false,  // Faster but less accurate
    // ...
};
```

## 📈 Performance Tips

1. **Cache is your friend** - First calculation is slow, subsequent ones are instant
2. **Batch processing** - Use `batchGetConnectivity()` for multiple pages
3. **Rate limiting** - Respect 100ms delays between calls
4. **Fallback works** - Legacy mode still functional if API fails

## 🎯 Best Practices

### DO ✅
- Let the system cache API results
- Regenerate pages monthly for fresh data
- Test connectivity after Wikipedia changes
- Monitor console for API errors

### DON'T ❌
- Make rapid API calls (respect rate limits)
- Disable caching (it's there for a reason)
- Hardcode difficulty values
- Ignore API errors in production

## 📚 More Information

- Full docs: `docs/DIFFICULTY_SCORING.md`
- Implementation: `docs/IMPLEMENTATION_SUMMARY.md`
- API details: `docs/API_INTEGRATION.md`
- Setup guide: `docs/SETUP.md`

## 🎉 That's It!

The system is **automatic**, **intelligent**, and **self-maintaining**.

Just run `npm run generate:pages` monthly to keep it fresh! 🚀
