# Wikipedia Vital Articles Fetcher

## Overview

The `fetch-vital-articles.js` script fetches Wikipedia's curated list of Vital Articles and categorizes them by difficulty level for use in the game.

## What are Wikipedia Vital Articles?

Wikipedia's Vital Articles are a carefully curated list of subjects for which Wikipedia should have corresponding high-quality articles. They represent the most important topics across all fields of human knowledge.

### Level Structure

- **Level 1**: ~10 articles - The absolute most fundamental topics (e.g., Earth, Human, Science, Mathematics)
- **Level 2**: ~100 articles - Very important general topics across major fields
- **Level 3**: ~1,000 articles - Important topics covering all major areas of knowledge
- **Level 4**: ~10,000 articles - More specialized important topics (organized in subpages)
- **Level 5**: ~50,000 articles - Comprehensive vital coverage (organized in subpages)

## Usage

```bash
npm run fetch:vital
```

## What the Script Does

1. **Fetches** Wikipedia's Vital Articles from Levels 1-4 using the Wikipedia API
2. **Discovers** Level 4 subpages automatically (organized by topic like People, History, Geography, etc.)
3. **Parses** the wikitext to extract clean article titles
4. **Filters** out special pages, categories, templates, and Wikipedia namespace pages
5. **Categorizes** articles into three difficulty tiers:
   - **Easy**: Levels 1-3 (~1,000 most fundamental articles)
   - **Medium**: Levels 1-4 (~10,000 articles including more specialized topics)
   - **Hard**: Levels 1-5 (currently same as medium, ready for future expansion)
6. **Saves** the data to `src/js/data/vital-articles.json`

## Output Format

The generated JSON file contains:

```json
{
  "timestamp": "2025-10-30T...",
  "levels": {
    "level1": ["Earth", "Human", "Science", ...],
    "level2": ["History", "Geography", "Art", ...],
    "level3": ["Astronomy", "Biology", "Literature", ...],
    "level4": ["100_metres", "1911_Revolution", "Aardvark", ...]
  },
  "categories": {
    "easy": [...],    // ~1,000 articles from levels 1-3
    "medium": [...],  // ~10,000 articles from levels 1-4
    "hard": [...]     // Currently same as medium
  }
}
```

## Configuration

Edit the `CONFIG` object in the script:

```javascript
const CONFIG = {
    API_URL: 'en.wikipedia.org',
    VITAL_PAGES: {
        level1: 'Wikipedia:Vital_articles/Level/1',
        level2: 'Wikipedia:Vital_articles/Level/2',
        level3: 'Wikipedia:Vital_articles/Level/3',
        level4: 'Wikipedia:Vital_articles/Level/4'
    },
    OUTPUT_FILE: '...',
    DELAY_MS: 500,  // Delay between API calls
    MAX_LEVEL4_SUBPAGES: 50  // Limit Level 4 subpages to fetch
};
```

## Why Only Levels 1-4?

Level 5 contains approximately 40,000-50,000 articles organized into hundreds of subpages. Fetching all of them would require:

1. Fetching the main level 5 page to discover subpages
2. Fetching hundreds of subpages individually
3. Much longer execution time (potentially 30+ minutes)
4. Risk of hitting Wikipedia's rate limits

The current implementation focuses on levels 1-4 which provide:
- **Level 1-3**: ~1,000 high-quality, essential articles (Easy difficulty)
- **Level 4**: ~10,000 more specialized but still important articles (Medium difficulty)
- Well-balanced difficulty progression
- Reasonable fetch time (under 1 minute)

## Example Output

```
============================================================
Wikipedia Vital Articles Fetcher
============================================================

Fetching level1...
✓ Found 11 articles in level1

Fetching level2...
✓ Found 101 articles in level2

Fetching level3...
✓ Found 1001 articles in level3

============================================================
Fetching Level 4 (organized in subpages)...
============================================================

Fetching main Level 4 page to discover subpages...
✓ Found 11 Level 4 subpages
  Sample subpages: Wikipedia:Vital articles/Level/4/People, ...
  Progress: 5/11 subpages fetched (5008 articles)
  Progress: 10/11 subpages fetched (9716 articles)

✓ Level 4 complete: 10012 articles from 11 subpages

============================================================
Summary:
============================================================
Level 1: 11 articles
Level 2: 101 articles
Level 3: 1001 articles
Level 4: 10012 articles
------------------------------------------------------------
Easy (Levels 1-3): 1003 articles
Medium (Levels 1-4): 10015 articles
Hard (Levels 1-5): 10015 articles

✓ Data saved to: src/js/data/vital-articles.json
============================================================

Level 1 Articles (Top 10 most fundamental):
The_arts, Earth, Human, Human_history, Life, Mathematics, 
Philosophy, Science, Society, Technology

Sample Medium-Only Articles (first 10 from Level 4):
100_metres, 14th_Dalai_Lama, 1556_Shaanxi_earthquake, ...
```

## Benefits for the Game

Using Wikipedia's Vital Articles provides:

1. **Quality**: Curated by Wikipedia editors for importance and quality
2. **Coverage**: Balanced representation across all major fields
3. **Difficulty Progression**: 
   - Easy: Well-known essential topics
   - Medium: More specialized but important topics
   - Hard: Ready for expansion with Level 5
4. **Connectivity**: Important articles tend to be well-connected in Wikipedia's link graph
5. **Stability**: These lists are maintained but change slowly over time
6. **Scale**: From 1,000 to 10,000 articles providing ample content

## Updating the Data

Run the script periodically to refresh the vital articles list:

```bash
npm run fetch:vital
```

Wikipedia's vital articles lists are updated occasionally but remain relatively stable, so monthly or quarterly updates should be sufficient.

## Troubleshooting

**Error: Invalid response from Wikipedia API**
- Check your internet connection
- The API might be temporarily unavailable
- Try running the script again after a few minutes

**Too few articles extracted**
- Check if Wikipedia's Vital Articles page format has changed
- Review the `extractTitles()` function's regex pattern
- Check the filtering logic for overly aggressive exclusions

## Future Enhancements

Potential improvements to the script:

1. **Fetch Level 5**: Discover and fetch all level 5 topic subpages (~40,000-50,000 articles)
2. **Caching**: Cache API responses to speed up subsequent runs
3. **Parallel Fetching**: Fetch multiple subpages concurrently (with rate limiting)
4. **Article Metadata**: Fetch additional information like article quality ratings
5. **Incremental Updates**: Only fetch changed pages since last run
6. **Progress Persistence**: Save progress and resume if interrupted
