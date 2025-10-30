# Migration to Vital Articles System

## Overview

The game has been migrated from using pageview-based popular pages to using Wikipedia's curated Vital Articles. This provides better quality content and a more balanced difficulty progression.

## What Changed

### Before
- Pages were selected based on Wikipedia pageview statistics
- Generated from the top 3,000 most viewed pages
- Three tiers: Normal (~1,200), Hard (~900), Ultra (~900)

### After
- Pages are selected from Wikipedia's Vital Articles
- Curated, high-quality articles across all fields of knowledge
- Three tiers: Normal (1,003), Hard (6,308), Ultra (2,704)
- Total: 10,015 unique articles

## Page Distribution

### Easy/Normal Mode (1,003 pages)
- **Source**: Wikipedia Vital Articles Levels 1-3
- **Content**: Most important and well-known topics
- **Examples**: Earth, Human, Science, Mathematics, History, Art
- **Difficulty**: Beginner-friendly, universally recognized topics

### Hard Mode (6,308 pages)
- **Source**: Wikipedia Vital Articles Level 4 (excluding Level 1-3)
- **Content**: More specialized but still important topics
- **Examples**: 14th_Dalai_Lama, 1911_Revolution, Toshiro_Mifune
- **Difficulty**: Intermediate, requires broader knowledge

### Ultra Mode (2,704 pages)
- **Source**: Subset of Level 4 articles
- **Content**: Expert-level specialized topics
- **Examples**: Phosphoric_acid, Photometry, Phrase
- **Difficulty**: Advanced, niche topics

## Benefits

### 1. Quality Over Popularity
- Curated by Wikipedia editors for importance
- Balanced across all fields (history, science, arts, geography)
- Not influenced by temporary trends or current events

### 2. Better Difficulty Progression
- Clear progression from essential → specialized → expert
- More consistent difficulty within each tier
- Larger pool of pages for variety

### 3. Educational Value
- Encourages learning about important topics
- Balanced representation across domains
- Culturally and historically significant content

### 4. Stability
- Vital Articles lists change slowly over time
- Less maintenance required
- More predictable gameplay

## Files Modified

### New Files
- `scripts/fetch-vital-articles.js` - Fetches vital articles from Wikipedia
- `scripts/generate-pages-from-vital.js` - Converts JSON to game format
- `docs/VITAL_ARTICLES_SCRIPT.md` - Documentation for fetch script
- `src/js/data/vital-articles.json` - Raw vital articles data (10,015 articles)
- `src/js/data/pages.js` - Generated game pages module

### Modified Files
- `package.json` - Added new scripts
- `scripts/README.md` - Updated documentation
- `README.md` - Updated features description
- `tests/unit/validate-wikipedia-pages.test.js` - Updated to use new file location

### No Changes Required
- `src/js/modules/PageSelector.js` - Still uses same exports
- `src/js/app.js` - No changes needed
- Game logic and UI - Fully compatible

## Workflow

### Generating Fresh Pages

```bash
# Step 1: Fetch vital articles from Wikipedia (30-60 seconds)
npm run fetch:vital

# Step 2: Convert to game format (instant)
npm run generate:pages-vital
```

### When to Regenerate

- **Quarterly**: Wikipedia's Vital Articles are updated periodically
- **After feedback**: If certain pages prove problematic
- **For testing**: Generate fresh data for test scenarios

## Compatibility

### ✅ Fully Compatible
- All existing game code works without modification
- Same export structure (`popularPages`, `obscurePages`, `ultraObscurePages`)
- Same page name format (underscores, e.g., "New_York_City")
- PageSelector module unchanged
- UI and game logic unchanged

### ⚠️ Data Format
- Now using ES6 module exports (`export const`) instead of CommonJS
- Test file updated to read from new location
- All imports remain the same in application code

## Statistics Comparison

### Old System (Pageviews)
```
Normal:  1,200 pages (40% of top 3,000)
Hard:      900 pages (30% of top 3,000)
Ultra:     900 pages (30% of top 3,000)
Total:   3,000 pages
```

### New System (Vital Articles)
```
Easy:    1,003 pages (Levels 1-3, essential topics)
Hard:    6,308 pages (Level 4, specialized topics)
Ultra:   2,704 pages (Level 4 subset, expert topics)
Total:  10,015 unique pages
```

## Future Enhancements

### Level 5 Integration
Wikipedia Vital Articles Level 5 contains ~40,000-50,000 articles. To integrate:

1. Update `fetch-vital-articles.js` to discover Level 5 subpages
2. Add Level 5 fetching logic (similar to Level 4)
3. Update `generate-pages-from-vital.js` to use Level 5 for Ultra mode
4. Expected distribution:
   - Easy: 1,003 (Levels 1-3)
   - Hard: 10,015 (Levels 1-4)
   - Ultra: 50,000+ (Levels 1-5)

### Custom Difficulty Tiers
The system can be extended to support more granular difficulty levels:
- Beginner: Level 1-2 only
- Intermediate: Level 3 only
- Advanced: Level 4 only
- Expert: Level 5 only
- Custom: User-selected combination

## Troubleshooting

### Pages not loading after migration
```bash
# Regenerate pages module
npm run generate:pages-vital

# Verify module structure
node -e "import('./src/js/data/pages.js').then(m => console.log(Object.keys(m)))"
```

### Tests failing
```bash
# Check test file paths
# Ensure tests/unit/validate-wikipedia-pages.test.js points to correct location

# Run tests
npm test
```

### Want to revert to pageview-based system
```bash
# Use the old generate script (if it still exists)
npm run generate:pages

# Or manually restore old pages.js from git history
git checkout <old-commit> -- src/js/data/pages.js
```

## Migration Checklist

- [x] Fetch vital articles from Wikipedia
- [x] Generate pages.js from vital articles
- [x] Update documentation
- [x] Update tests to use new file location
- [x] Verify PageSelector compatibility
- [x] Test game functionality
- [x] Update README
- [ ] Deploy to production
- [ ] Monitor for any issues
- [ ] Collect user feedback

## Rollback Plan

If issues arise, rollback is simple:

1. Restore old `pages.js` from git history
2. Update tests to point to old location
3. Remove new scripts from package.json
4. Update documentation

The system is designed to be fully backwards compatible - only the data source changed, not the structure or interface.
