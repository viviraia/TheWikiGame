# Quick Reference: Vital Articles System

## Commands

```bash
# Fetch fresh vital articles from Wikipedia
npm run fetch:vital

# Generate pages.js from vital articles
npm run generate:pages-vital

# Run tests
npm test

# Start development server
npm run dev
```

## File Structure

```
src/js/data/
├── vital-articles.json    # Raw data from Wikipedia (10,015 articles)
└── pages.js               # Generated module for game

scripts/
├── fetch-vital-articles.js        # Fetch from Wikipedia API
└── generate-pages-from-vital.js   # Convert JSON → pages.js

docs/
├── VITAL_ARTICLES_SCRIPT.md       # Detailed fetch script docs
└── MIGRATION_TO_VITAL_ARTICLES.md # Migration guide
```

## Page Distribution

| Difficulty | Source | Count | Description |
|------------|--------|-------|-------------|
| **Easy** | Levels 1-3 | 1,003 | Essential, well-known topics |
| **Hard** | Level 4 only | 6,308 | Specialized important topics |
| **Ultra** | Level 4 subset | 2,704 | Expert-level topics |
| **Total** | All unique | 10,015 | Combined pool |

## Import Structure

```javascript
// In game modules
import { 
  popularPages,      // Easy: 1,003 pages
  obscurePages,      // Hard: 6,308 pages  
  ultraObscurePages, // Ultra: 2,704 pages
  allPages,          // All: 10,015 pages
  pageStats          // Metadata
} from '../data/pages.js';
```

## Wikipedia Vital Articles Levels

| Level | Count | Description |
|-------|-------|-------------|
| 1 | 11 | Most fundamental (Earth, Human, Science...) |
| 2 | 101 | Very important general topics |
| 3 | 1,001 | Important across all fields |
| 4 | 10,012 | Specialized important topics |
| 5* | ~50,000 | Comprehensive coverage (not fetched) |

\* Level 5 not currently used but can be integrated

## Page Selection Logic

```javascript
// PageSelector.js automatically uses the imported arrays
Normal Mode  → Uses popularPages (weighted 95%)
Hard Mode    → Uses popularPages + obscurePages (weighted 15%/80%)
Ultra Mode   → Uses all three arrays (weighted 5%/15%/80%)
```

## Common Tasks

### Update Pages Data

```bash
# When Wikipedia vital articles are updated (quarterly)
npm run fetch:vital
npm run generate:pages-vital
```

### Verify Data

```bash
# Check module loads correctly
node -e "import('./src/js/data/pages.js').then(m => console.log('Pages:', m.allPages.length))"

# Verify structure
node -e "import('./src/js/data/pages.js').then(m => console.log(m.pageStats))"
```

### Debug Issues

```bash
# Check vital articles data
cat src/js/data/vital-articles.json | grep "timestamp"

# Verify pages.js format
head -50 src/js/data/pages.js
```

## Key Features

### ✅ Compatibility
- No changes needed to game code
- Same export structure as before
- Drop-in replacement for old system

### ✅ Quality
- Curated by Wikipedia editors
- Balanced across all fields
- Culturally significant content

### ✅ Scalability
- Easy to add Level 5 (~50k articles)
- Can create custom difficulty tiers
- Extensible for future features

## Integration Points

The system integrates with:

1. **PageSelector.js** - Selects pages based on mode
2. **GameState.js** - Stores selected pages
3. **UIController.js** - Displays page information
4. **Tests** - Validates page data

No modifications needed to any of these files!

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Pages not loading | Run `npm run generate:pages-vital` |
| Import errors | Check file exists at `src/js/data/pages.js` |
| Wrong difficulty | Verify PageSelector mode selection |
| Test failures | Update test paths to new location |

## Performance

- **Fetch vital articles**: 30-60 seconds
- **Generate pages.js**: < 1 second
- **Game page load**: Same as before
- **Page selection**: Same as before

## Maintenance

### Regular (Quarterly)
- Fetch fresh vital articles
- Regenerate pages module
- Verify game functionality

### As Needed
- Update filtering logic
- Adjust difficulty distribution
- Add Level 5 support
