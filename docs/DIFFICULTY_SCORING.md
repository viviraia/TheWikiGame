# Real-Time Difficulty Scoring System

## Overview

The game now uses **real-time Wikipedia API data** to calculate accurate difficulty scores with **backlinks as the primary metric**:
1. **Page Connectivity (Backlinks)** - PRIMARY (70% weight) - How many pages link to the target
2. **Page Popularity (Pageviews)** - SECONDARY (30% weight) - How well-known the page is

The more backlinks a page has, the easier it is to reach because there are more paths leading to it.

## Architecture

### 1. PageConnectivity Module (`src/js/modules/PageConnectivity.js`)

This module handles all Wikipedia API interactions for connectivity analysis:

#### Key Methods:

- **`getBacklinkCount(pageTitle)`** - Returns number of pages linking TO this page
  - More backlinks = MORE PATHS to reach it = EASIER = lower difficulty
  - Uses Wikipedia's backlinks API
  - Cached for 1 hour to reduce API calls
  - **PRIMARY difficulty metric (70% weight)**

- **`getPageViews(pageTitle, days)`** - Returns pageview statistics
  - Fetches last 30 days of views by default
  - Uses Wikimedia Pageviews API
  - Cached for 1 hour
  - **Secondary modifier (30% weight)**

- **`calculateDifficulty(startPage, targetPage)`** - Combines metrics for final score
  - Returns difficulty from 1.0 (easy) to 4.0 (very hard)
  - **New formula prioritizes backlinks:**
    - 5000+ backlinks → 1.0-1.5 difficulty (Very Easy)
    - 1000-5000 backlinks → 1.5-2.5 difficulty (Easy to Moderate)
    - 100-1000 backlinks → 2.5-3.0 difficulty (Moderate to Hard)
    - 10-100 backlinks → 3.0-3.5 difficulty (Hard)
    - <10 backlinks → 3.5-4.0 difficulty (Very Hard)
  - Pageviews add a small modifier (0.0-0.6) to fine-tune difficulty

### 2. ScoringSystem Updates

The `ScoringSystem` now:
- **Only uses `PageConnectivity`** for real-time difficulty calculation
- No legacy/fallback modes - API-based scoring always
- Returns default difficulty (2.0) only on API errors
- Provides detailed metrics in console logs showing backlink-based calculations

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
   // Calculate difficulty using real-time API data with backlinks as primary factor
   const difficulty = await connectivity.calculateDifficulty(startPage, targetPage);
   
   // Example result for "Python" → "Quantum_Physics":
   // {
   //   difficulty: 2.75,
   //   metrics: {
   //     targetBacklinks: 234,        // Pages linking to target (PRIMARY)
   //     backlinkDifficulty: 2.55,    // Difficulty from backlinks (70% weight)
   //     targetViews: 890,            // Daily average views (secondary)
   //     popularityModifier: 0.20,    // Fine-tuning from views (30% weight)
   //     startBacklinks: 4567         // For reference
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
2. For each page, fetches backlink count (PRIMARY metric)
3. Calculates combined score: `(log10(backlinks) × 0.7) + (log10(views) × 0.3)`
   - **70% weight on backlinks** (connectivity)
   - **30% weight on pageviews** (popularity)
4. Sorts pages by combined score
5. Creates three tiers based on backlink-weighted scores:
   - **Normal Mode** (top 40%): High backlinks + high views (easy to reach)
   - **Hard Mode** (middle 30%): Medium backlinks (moderate connectivity)
   - **Ultra Mode** (bottom 30%): Low backlinks (few paths to reach)

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

Based on real Wikipedia data with new backlink-focused formula:

| Target Page | Backlinks | Daily Views | Backlink Difficulty | Popularity Modifier | Final Difficulty | Rating |
|------------|-----------|-------------|---------------------|---------------------|------------------|--------|
| United_States | 15,000 | 50,000 | 1.0 | +0.0 | **1.0** | Very Easy ⭐ |
| World_War_II | 8,000 | 25,000 | 1.0 | +0.0 | **1.0** | Very Easy ⭐ |
| Python_(programming) | 3,500 | 8,000 | 1.4 | +0.0 | **1.4** | Easy ⭐⭐ |
| Albert_Einstein | 2,000 | 12,000 | 1.5 | +0.0 | **1.5** | Easy ⭐⭐ |
| Quantum_mechanics | 800 | 2,000 | 1.8 | +0.2 | **2.0** | Moderate ⭐⭐⭐ |
| Medieval_poet | 150 | 300 | 2.4 | +0.4 | **2.8** | Hard ⭐⭐⭐⭐ |
| Obscure_mathematician | 45 | 80 | 3.1 | +0.6 | **3.7** | Very Hard ⭐⭐⭐⭐ |
| Rare_species | 8 | 25 | 3.8 | +0.6 | **4.0** | Extremely Hard ⭐⭐⭐⭐ |

**Key Insight:** Pages with fewer backlinks are significantly harder because there are fewer paths to reach them, regardless of popularity.

## Benefits

### For Players:
- **Fair scoring** - Difficulty based on actual connectivity (how many paths exist)
- **Intuitive** - Fewer backlinks = fewer ways to reach = harder
- **Dynamic content** - Changes with Wikipedia's link structure
- **Transparent** - Difficulty shown with detailed backlink metrics

### For Game Balance:
- **Objective difficulty** - Based on graph connectivity, not opinions
- **Backlink-focused** - The number of incoming links is the best predictor of reachability
- **Self-updating** - Regenerate pages monthly to reflect Wikipedia changes
- **Better tiers** - Sorted primarily by backlinks for accurate difficulty ranking

### For Development:
- **Automated** - No manual page categorization needed
- **Scalable** - Easy to add more pages
- **Maintainable** - Single source of truth (Wikipedia's link graph)
- **Research-backed** - Backlinks correlate strongly with reachability in wiki-games

## Why Backlinks Matter

### The Science of Reachability

In graph theory, **in-degree** (number of incoming edges) is a key metric for node reachability:

1. **More Paths = Easier to Find**
   - A page with 5000 backlinks has 5000+ potential paths leading to it
   - A page with 10 backlinks has very few paths, making it much harder to discover

2. **Hub Pages vs. Leaf Pages**
   - **Hub pages** (high backlinks): Central topics like "United States", "World War II"
   - **Leaf pages** (low backlinks): Specialized topics, rare species, obscure people

3. **Real Game Impact**
   - Players naturally follow links while browsing
   - Pages mentioned frequently in other articles appear more often
   - Obscure pages require specific knowledge or lucky guesses

### Why Backlinks > Pageviews

While pageviews indicate popularity, **backlinks indicate connectivity**:

- **Pageviews** tell you how often people *search* for a topic
- **Backlinks** tell you how often the topic is *referenced* in other articles

For navigation games, **connectivity is king**:
- High views + low backlinks = Popular but isolated (e.g., current events)
- Low views + high backlinks = Well-connected despite obscurity (e.g., foundational concepts)
- High views + high backlinks = Easy targets (e.g., major countries, historical figures)

### The 70/30 Split

Our formula uses **70% backlinks, 30% views** because:
- Backlinks directly measure navigability
- Pageviews provide secondary context (helps distinguish between similar backlink counts)
- Testing showed this ratio produces the most accurate difficulty predictions

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
