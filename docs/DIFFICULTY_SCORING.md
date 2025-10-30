# Real-Time Difficulty Scoring System

## Overview

The game now uses **real-time Wikipedia API data** to calculate accurate difficulty scores based on:
1. **Page Popularity** (pageviews) - How well-known the page is
2. **Page Connectivity** (backlinks) - How easy it is to reach the page

## Architecture

### 1. PageConnectivity Module (`src/js/modules/PageConnectivity.js`)

This module handles all Wikipedia API interactions for connectivity analysis:

#### Key Methods:

- **`getBacklinkCount(pageTitle)`** - Returns number of pages linking TO this page
  - More backlinks = easier to find = lower difficulty
  - Uses Wikipedia's backlinks API
  - Cached for 1 hour to reduce API calls

- **`getPageViews(pageTitle, days)`** - Returns pageview statistics
  - Fetches last 30 days of views by default
  - Uses Wikimedia Pageviews API
  - Cached for 1 hour

- **`calculateDifficulty(startPage, targetPage)`** - Combines metrics for final score
  - Returns difficulty from 1.0 (easy) to 4.0 (very hard)
  - Formula: `difficulty = 7 - (log10(views) + log10(backlinks))`
  - Most popular pages: ~6 ease score → 1.0 difficulty
  - Least popular pages: ~2 ease score → 4.0 difficulty

### 2. ScoringSystem Updates

The `ScoringSystem` now:
- **Only uses `PageConnectivity`** for real-time difficulty calculation
- No legacy/fallback modes - API-based scoring always
- Returns default difficulty (2.0) only on API errors
- Provides detailed metrics in console logs

### 3. Page Generation Enhancement

The `generate-popular-pages.js` script now:
- Fetches backlink counts for all selected pages
- Sorts pages by **combined score** (views + connectivity)
- Creates better difficulty tiers based on both metrics

## How It Works

### When a Game is Won:

1. Player completes a route (e.g., "Python" → "Albert Einstein")
2. Score is submitted with `submitScore()` in `leaderboard.js`
3. `ScoringSystem.calculateScore()` is called:
   ```javascript
   // Calculate difficulty using real-time API data
   const difficulty = await connectivity.calculateDifficulty(startPage, targetPage);
   
   // Example result for "Python" → "Quantum_Physics":
   // {
   //   difficulty: 2.85,
   //   metrics: {
   //     targetViews: 1234,        // Daily average views
   //     targetBacklinks: 456,     // Pages linking to target
   //     startBacklinks: 7890,     // Pages linking to start
   //     popularityScore: 3.09,
   //     connectivityScore: 2.66
   //   }
   // }
   ```

4. Score formula:
   ```javascript
   score = (1000 / clicks) × difficulty × timeBonus
   ```

5. Result displayed to player with difficulty rating

### Page Selection:

When you run `npm run generate:pages`:

1. Fetches top viewed pages from last 30 days
2. For each page, fetches backlink count
3. Calculates combined score: `log10(views) + log10(backlinks)`
4. Sorts pages by combined score
5. Creates three tiers:
   - **Normal Mode** (top 40%): High views + high connectivity
   - **Hard Mode** (middle 30%): Medium views + medium connectivity
   - **Ultra Mode** (bottom 30%): Low views + low connectivity

## API Endpoints Used

### Wikipedia API (Backlinks)
```
https://en.wikipedia.org/w/api.php?
  action=query&
  list=backlinks&
  bltitle=Page_Name&
  bllimit=500&
  blnamespace=0&
  format=json
```

### Wikimedia Pageviews API
```
https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/
  en.wikipedia/all-access/all-agents/Page_Name/
  daily/20251001/20251030
```

## Performance Optimizations

### Caching
- All API results cached for 1 hour
- Prevents duplicate requests
- Stored in-memory (Map)

### Rate Limiting
- 100ms delay between requests in page generation
- Batch processing (5 pages at a time)
- Respects Wikipedia's rate limits (200 req/sec)

### Error Handling
- If API fails, returns default difficulty of 2.0
- Errors logged to console
- No legacy fallback needed - system is resilient

## Configuration

### ScoringSystem

The `useAPI` parameter is deprecated - the system always uses API-based scoring:

```javascript
// Both of these do the same thing now
await this.scoringSystem.calculateScore(clicks, time, start, target, true);
await this.scoringSystem.calculateScore(clicks, time, start, target, false);
```

If you need to disable API calls temporarily, you can modify `PageConnectivity` directly.

### Enable/Disable Connectivity Fetching

In `scripts/generate-popular-pages.js`:
```javascript
const CONFIG = {
    FETCH_CONNECTIVITY: true,  // Set to false to skip backlink fetching
    // ... other config
};
```

## Example Difficulty Scores

Based on real Wikipedia data:

| Target Page | Daily Views | Backlinks | Difficulty | Rating |
|------------|-------------|-----------|------------|--------|
| United_States | 50,000 | 15,000 | 1.0 | Very Easy ⭐ |
| Python_(programming) | 8,000 | 3,500 | 1.5 | Easy ⭐⭐ |
| Quantum_mechanics | 2,000 | 800 | 2.3 | Hard ⭐⭐⭐ |
| Obscure_mathematician | 100 | 50 | 3.8 | Very Hard ⭐⭐⭐⭐ |

## Benefits

### For Players:
- **Fair scoring** - Reflects actual difficulty
- **Dynamic content** - Changes with Wikipedia trends
- **Transparent** - Difficulty shown with metrics

### For Game Balance:
- **Objective difficulty** - Not manually curated
- **Self-updating** - Regenerate pages monthly
- **Better tiers** - Based on real connectivity

### For Development:
- **Automated** - No manual page categorization
- **Scalable** - Easy to add more pages
- **Maintainable** - Single source of truth (Wikipedia)

## Troubleshooting

### High API Call Volume
- Increase cache expiry time
- Reduce `TARGET_PAGES` in generation script
- Disable connectivity fetching

### Slow Page Generation
- Set `FETCH_CONNECTIVITY: false` in config
- Reduce `DAYS_TO_FETCH`
- Increase `DELAY_MS` if hitting rate limits

### Inaccurate Scores
- Check if pages exist on Wikipedia
- Verify API responses in console
- Ensure cache hasn't gone stale
- Regenerate pages list

## Future Enhancements

### Potential Improvements:
1. **Shortest Path Distance** - Use graph algorithms
2. **Historical Trends** - Track difficulty changes over time
3. **Category Relationships** - Bonus for same-category routes
4. **Link Distance** - Calculate actual link separation
5. **Machine Learning** - Predict difficulty from past games

## References

- [Wikipedia API Documentation](https://www.mediawiki.org/wiki/API:Main_page)
- [Wikimedia Pageviews API](https://wikimedia.org/api/rest_v1/)
- [Wikipedia Backlinks](https://www.mediawiki.org/wiki/API:Backlinks)
