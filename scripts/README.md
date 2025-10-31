# Scripts Documentation

## Recommended Workflow: Vital Articles

The recommended way to generate pages for the game is using Wikipedia's Vital Articles:

### 1. Fetch Vital Articles

```bash
npm run fetch:vital
```

This fetches Wikipedia's curated Vital Articles (Levels 1-4) and saves them to `src/js/data/vital-articles.json`.

### 2. Generate Pages Module

```bash
npm run generate:pages-vital
```

This converts the vital articles JSON into the JavaScript module format (`src/js/data/pages.js`) used by the game.

### Complete Workflow

```bash
# Step 1: Fetch fresh vital articles data from Wikipedia
npm run fetch:vital

# Step 2: Generate pages.js from the vital articles
npm run generate:pages-vital

# The game is now ready to use!
```

---

## Fetch Vital Articles

### Overview
The `fetch-vital-articles.js` script fetches Wikipedia's Vital Articles and categorizes them by difficulty level based on Wikipedia's classification system.

### Usage

```bash
npm run fetch:vital
```

### What it does

1. **Fetches Wikipedia's Vital Articles** from all 5 levels using the Wikipedia API
2. **Discovers Level 4 subpages** automatically (11 topic-based subpages like People, History, Geography)
3. **Categorizes articles** into three difficulty tiers:
   - **Easy**: Levels 1-3 (~1,000 most important and fundamental articles)
   - **Medium**: Levels 1-4 (~10,000 articles including more specialized topics)
   - **Hard**: Levels 1-5 (currently same as medium, ready for expansion with ~50,000 total articles)
4. **Outputs** to `src/js/data/vital-articles.json`

### Wikipedia Vital Articles

Wikipedia's Vital Articles are a curated list of subjects for which Wikipedia should have corresponding high-quality articles:

- **Level 1**: ~10 articles - The absolute most important topics
- **Level 2**: ~100 articles - Very important general topics
- **Level 3**: ~1,000 articles - Important topics in all major fields
- **Level 4**: ~10,000 articles - More specialized important topics (organized in 11 subpages)
- **Level 5**: ~50,000 articles - Comprehensive vital coverage (not fetched by default)

### Configuration

Edit the `CONFIG` object in `fetch-vital-articles.js`:

```javascript
const CONFIG = {
    VITAL_PAGES: {
        level1: 'Wikipedia:Vital_articles/Level/1',
        level2: 'Wikipedia:Vital_articles/Level/2',
        level3: 'Wikipedia:Vital_articles/Level/3',
        level4: 'Wikipedia:Vital_articles/Level/4'
    },
    OUTPUT_FILE: '...',        // Output file path
    DELAY_MS: 500,             // Delay between API calls
    MAX_LEVEL4_SUBPAGES: 50    // Limit Level 4 subpages
};
```

### Output Format

The generated `vital-articles.json` file contains:

```javascript
{
  "timestamp": "2025-10-30T...",
  "levels": {
    "level1": [...],  // Articles from level 1
    "level2": [...],  // Articles from level 2
    "level3": [...],  // Articles from level 3
    "level4": [...]   // Articles from level 4 (all subpages combined)
  },
  "categories": {
    "easy": [...],    // Combined levels 1-3 (~1,000 articles)
    "medium": [...],  // Combined levels 1-4 (~10,000 articles)
    "hard": [...]     // Combined levels 1-5 (currently same as medium)
  }
}
```

### Notes

- The script respects Wikipedia's rate limits with 500ms delays between requests
- Level 4 is automatically discovered and fetched from 11 topic-based subpages
- Articles are extracted from the actual vital articles pages
- Automatically excludes special pages, files, categories, and templates
- All article titles use underscores (e.g., "New_York_City")
- Fetch time: approximately 30-60 seconds for levels 1-4

### Example Output

```
============================================================
Wikipedia Vital Articles Fetcher
============================================================

Fetching level1...
Page: Wikipedia:Vital_articles/Level/1
✓ Found 10 articles in level1

Fetching level2...
Page: Wikipedia:Vital_articles/Level/2
✓ Found 104 articles in level2

...

============================================================
Summary:
============================================================
Level 1: 10 articles
Level 2: 104 articles
Level 3: 1001 articles
Level 4: 10000 articles
Level 5: 50000 articles
------------------------------------------------------------
Easy (Levels 1-3): 1115 articles
Medium (Levels 1-4): 11115 articles
Hard (Levels 1-5): 61115 articles

============================================================
✓ Data saved to: src/js/data/vital-articles.json
============================================================
```

### Troubleshooting

**Error: Invalid response from Wikipedia API**
- Check your internet connection
- The API might be temporarily unavailable
- Try running the script again

**Too few articles extracted**
- Check if the Wikipedia Vital Articles pages have changed format
- Review the regex pattern in `extractTitles()` function

---

## Generate Pages from Vital Articles

### Overview
The `generate-pages-from-vital.js` script converts the vital articles JSON data into the JavaScript module format expected by the game application.

### Usage

```bash
npm run generate:pages-vital
```

### What it does

1. **Reads** `src/js/data/vital-articles.json`
2. **Distributes** articles across three difficulty levels:
   - **Easy (Normal Mode)**: Levels 1-3 (~1,000 pages) - Essential, well-known topics
   - **Hard Mode**: Level 4 only (~6,300 pages) - More specialized important topics
   - **Ultra Mode**: Subset of Level 4 (~2,700 pages) - Expert-level articles
3. **Generates** `src/js/data/pages.js` with proper ES6 module exports
4. **Creates** page statistics for tracking

### Output Format

The generated `pages.js` file exports:

```javascript
export const popularPages = [...];      // Easy/Normal mode pages
export const obscurePages = [...];      // Hard mode pages  
export const ultraObscurePages = [...]; // Ultra mode pages
export const allPages = [...];          // All pages combined
export const pageStats = {...};         // Metadata
```

### Distribution Logic

- **Easy (popularPages)**: All articles from Levels 1-3
- **Hard (obscurePages)**: Articles from Level 4 that aren't in Easy
- **Ultra (ultraObscurePages)**: Subset of Level 4 for expert difficulty

### Notes

- Automatically removes duplicates across difficulty levels
- Maintains compatibility with existing game code
- Preserves article titles with underscores (e.g., "New_York_City")
- Generates statistics for tracking and debugging

---

## Generate Popular Pages

### Overview
The `generate-popular-pages.js` script fetches the most viewed Wikipedia pages using the Pageviews API and generates a data file for the game.

### Usage

```bash
npm run generate:pages
```

### What it does

1. **Fetches pageview data** from the last 30 days using Wikipedia's Pageviews API
2. **Aggregates views** across all days to identify consistently popular pages
3. **Filters out** special pages, disambiguation pages, and non-content articles
4. **Generates** three difficulty tiers:
   - **Normal Mode**: Top 40% most viewed pages (~1,200 pages)
   - **Hard Mode**: Middle 30% pages (~900 pages)
   - **Ultra Mode**: Bottom 30% pages (~900 pages)
5. **Outputs** to `src/js/data/pages.js`
6. **Creates** statistics file at `src/js/data/page-stats.json`

### Configuration

Edit the `CONFIG` object in `generate-popular-pages.js`:

```javascript
const CONFIG = {
    TARGET_PAGES: 3000,        // Total pages to fetch
    DAYS_TO_FETCH: 30,         // Days of data to analyze
    OUTPUT_FILE: '...',        // Output file path
    DELAY_MS: 100,             // Delay between API calls
    EXCLUDE_PATTERNS: [...]    // Patterns to exclude
};
```

### Output Format

The generated `pages.js` file exports:

```javascript
export const popularPages = [...];      // Normal mode pages
export const obscurePages = [...];      // Hard mode pages
export const veryObscurePages = [...];  // Ultra mode pages
export const allPages = [...];          // All pages combined
export const pageStats = {...};         // Metadata
```

### Notes

- The script respects Wikipedia's rate limits with 100ms delays between requests
- Data has a ~2 day delay, so it fetches from 2-32 days ago
- Pages are sorted by total views across all fetched days
- The script automatically excludes:
  - Main Page and special pages
  - Disambiguation pages
  - Lists and portals
  - Template and category pages
  - Very short titles

### Example Output

```
Wikipedia Popular Pages Generator
==================================

Target: 3000 pages
Period: Last 30 days
Output: src/js/data/pages.js

Fetching data from Wikipedia Pageviews API...

Fetching top articles for 2025-10-28...
Fetching top articles for 2025-10-27...
...

✓ Fetched 5432 unique articles
✓ Top article: "United_States" with 2,340,123 views

✓ Generated: src/js/data/pages.js
✓ Statistics saved to: src/js/data/page-stats.json

✅ Successfully generated popular pages list!

Page distribution:
  - Normal Mode:  1200 pages (most popular)
  - Hard Mode:    900 pages (moderately popular)
  - Ultra Mode:   900 pages (less popular)
```

### Updating the Data

It's recommended to regenerate the pages list periodically to keep it fresh:

- **Weekly**: For trending topics and current events
- **Monthly**: For general maintenance
- **After major events**: To capture spikes in interest

### Troubleshooting

**Error: HTTP error! status: 429**
- You're hitting rate limits. Increase `DELAY_MS` in the config.

**Error: No data fetched**
- Check your internet connection
- The API might be temporarily unavailable
- Try increasing the date offset (API has ~2 day delay)

**Too few pages generated**
- Increase `DAYS_TO_FETCH` to get more diverse pages
- Adjust `EXCLUDE_PATTERNS` if too many pages are being filtered
