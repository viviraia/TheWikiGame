# Hybrid Page Selection Approach

## Overview

The **Hybrid Approach** combines three data sources to create an optimal, balanced page list for the game:

1. **Pageviews API** (73%) - Popular, trending pages
2. **Vital Articles** (17%) - Curated, important pages
3. **Diverse Categories** (10%) - Topic balance

## Why Hybrid?

### Problems with Single-Source Approaches:

**Pageviews Only:**
- ❌ Heavy bias toward current events/celebrities
- ❌ May miss important historical/scientific topics
- ❌ Can be dominated by pop culture

**Curated Lists Only:**
- ❌ Static, not updated frequently
- ❌ May include obscure "important" topics
- ❌ Doesn't reflect current interest

**Categories Only:**
- ❌ Inconsistent page quality
- ❌ Hard to control difficulty
- ❌ No popularity metric

### Hybrid Solution:

✅ **Balance** - Mix of popular, important, and diverse topics  
✅ **Fresh** - Majority from real-time pageviews  
✅ **Quality** - Vital Articles ensure important topics  
✅ **Diversity** - Categories prevent topic clustering  

## Configuration

```javascript
// In scripts/generate-popular-pages.js
const CONFIG = {
    USE_HYBRID_APPROACH: true,
    
    HYBRID_CONFIG: {
        popularPages: 2200,      // 73% from pageviews
        vitalArticles: 500,      // 17% from curated lists
        categoryPages: 300,      // 10% from diverse categories
    },
    
    DIVERSE_CATEGORIES: [
        'Countries',
        'Scientists',
        '21st-century_films',
        'Sports',
        'Programming_languages',
        'Mammals',
        'Chemical_elements',
        'Musical_instruments',
        'Artists',
        'Philosophers'
    ]
};
```

## How It Works

### Step 1: Fetch Popular Pages (73%)
```javascript
// Get top 2200 pages by pageviews over last 30 days
const popularSet = await aggregateTopArticles(30);
// Example: Donald_Trump, United_States, Taylor_Swift...
```

### Step 2: Fetch Vital Articles (17%)
```javascript
// Get 500 pages from Wikipedia's curated Vital Articles
const vitalSet = await fetchVitalArticles(500);
// Example: Quantum_mechanics, Albert_Einstein, Ancient_Rome...
```

### Step 3: Fetch Category Pages (10%)
```javascript
// Get ~30 pages from each of 10 diverse categories
const categorySet = await fetchDiverseCategories(categories, 30);
// Example: Giant_panda, Piano, Socrates, Carbon...
```

### Step 4: Merge & Deduplicate
```javascript
// Combine all sources, removing duplicates
// Priority: Popular > Vital > Category
const mergedPages = deduplicateAndMerge(popularSet, vitalSet, categorySet);
```

### Step 5: Enrich with Connectivity
```javascript
// Add backlink counts for all pages
const enriched = await enrichWithConnectivity(mergedPages);
```

### Step 6: Sort & Tier
```javascript
// Sort by combined score: log10(views) + log10(backlinks)
// Split into Normal (40%), Hard (30%), Ultra (30%)
```

## Benefits by Source

### Popular Pages (73%)
- **High quality gameplay** - players know these pages
- **Easy to find** - lots of links
- **Current relevance** - what people care about now

### Vital Articles (17%)
- **Educational value** - important topics
- **Topic balance** - not just pop culture
- **Wikipedia-endorsed** - curated by editors

### Category Pages (10%)
- **Diversity guarantee** - 10 different topics
- **Interesting connections** - unique navigation paths
- **Underrepresented topics** - animals, elements, instruments

## Example Distribution

After running `npm run generate:pages` with hybrid approach:

```
Total: 3000 pages

By Source:
  ✓ Pageviews:      2198 pages (73%)
  ✓ Vital Articles:  492 pages (16%)
  ✓ Categories:      310 pages (10%)

By Difficulty Tier:
  ✓ Normal Mode:    1200 pages (40%)
  ✓ Hard Mode:       900 pages (30%)
  ✓ Ultra Mode:      900 pages (30%)

Top Pages:
  1. United_States (48,234 views/day, 1000+ backlinks) [Popular]
  2. Python_(programming_language) (8,456 views/day, 1000+ backlinks) [Popular]
  3. Photosynthesis (3,234 views/day, 845 backlinks) [Vital]
  4. Piano (2,156 views/day, 623 backlinks) [Category: Musical_instruments]
  ...
```

## Comparison

| Metric | Pageviews Only | Hybrid Approach |
|--------|---------------|-----------------|
| **Popular topics** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Important topics** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Topic diversity** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Educational value** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Freshness** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Gameplay balance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Customization

### Change Source Ratios

```javascript
HYBRID_CONFIG: {
    popularPages: 2500,      // More trending content
    vitalArticles: 400,      // Less curated
    categoryPages: 100,      // Less diversity
}
```

### Add/Remove Categories

```javascript
DIVERSE_CATEGORIES: [
    'Countries',
    'Scientists',
    // Add your own:
    'Video_games',
    'Novels',
    'Architectural_styles',
    // Remove ones you don't want
]
```

### Disable Hybrid Approach

```javascript
USE_HYBRID_APPROACH: false,  // Back to pageviews only
```

## Performance

**Pageviews Only:**
- Time: ~5-10 minutes
- API Calls: ~3030 (30 days + 3000 backlinks)

**Hybrid Approach:**
- Time: ~5-12 minutes
- API Calls: ~3060 (adds ~30 for vital + categories)
- Slightly slower but much better quality

## Best Practices

1. **Run monthly** - Keep content fresh
2. **Adjust ratios** based on your audience:
   - Educational: More vital articles
   - Casual: More popular pages
   - Challenge: More category diversity

3. **Review categories** - Ensure they're active and populated
4. **Check statistics** - Review `page-stats.json` after generation

## Troubleshooting

### Too Many Duplicates
```javascript
// Increase category diversity
DIVERSE_CATEGORIES: [/* add more categories */]
```

### Not Enough Diversity
```javascript
// Increase category proportion
HYBRID_CONFIG: {
    popularPages: 2000,
    vitalArticles: 500,
    categoryPages: 500,  // 17% instead of 10%
}
```

### Slow Generation
```javascript
// Reduce connectivity fetching or disable vital articles
HYBRID_CONFIG: {
    vitalArticles: 0,  // Skip vital articles
}
```

## Summary

The Hybrid Approach gives you:
- ✅ Best of all worlds
- ✅ Balanced gameplay
- ✅ Educational value
- ✅ Fresh content
- ✅ Topic diversity

**Recommended for production use!** 🚀
