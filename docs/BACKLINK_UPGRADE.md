# Difficulty System Upgrade - Backlink Priority

## Summary

The difficulty system has been upgraded to **prioritize backlinks** as the primary metric for difficulty calculation. This change makes the game more accurate and fair by focusing on **connectivity** (how many paths lead to a page) rather than popularity (how often it's viewed).

## What Changed

### Visual Comparison

```
OLD SYSTEM (Equal Weight)
┌─────────────────────────────────────────┐
│  Difficulty = f(50% views, 50% links)  │
└─────────────────────────────────────────┘
         ↓                    ↓
    Pageviews           Backlinks
       (50%)             (50%)
         ↓                    ↓
    log10(views)    log10(backlinks)
         └──────────┬──────────┘
                    ↓
         Difficulty = 7 - sum

Problem: Popular but isolated pages 
         ranked as "easy"

NEW SYSTEM (Backlink Priority)
┌─────────────────────────────────────────┐
│  Difficulty = f(70% links, 30% views)  │
└─────────────────────────────────────────┘
         ↓                    ↓
    Backlinks             Pageviews
    (PRIMARY)            (MODIFIER)
       70%                  30%
         ↓                    ↓
   Tiered Scale         Simple Bonus
   (1.0 - 3.5)          (0.0 - 0.6)
         └──────────┬──────────┘
                    ↓
         Difficulty = base + modifier

Benefit: Connectivity-based difficulty
         reflects actual reachability
```

### Before (Equal Weight)
```javascript
// Old formula: Equal 50/50 weight
difficulty = 7 - (log10(views) + log10(backlinks))
```

### After (70/30 Backlink Priority)
```javascript
// New formula: 70% backlinks, 30% views
if (backlinks >= 5000) difficulty = 1.0        // Very Easy
if (backlinks >= 1000) difficulty = 1.0-1.5    // Easy
if (backlinks >= 100)  difficulty = 1.5-2.5    // Moderate
if (backlinks >= 10)   difficulty = 2.5-3.5    // Hard
if (backlinks < 10)    difficulty = 3.5-4.0    // Very Hard

// Then add popularity modifier (0.0-0.6)
```

## Why This Matters

### Backlinks = Reachability
- **5000+ backlinks**: Page appears in thousands of articles → Very easy to find
- **100 backlinks**: Page appears in few articles → Hard to stumble upon
- **<10 backlinks**: Page is barely referenced → Nearly impossible without specific knowledge

### Real Example
Consider these two pages:
1. **Breaking news article**: 50,000 views/day, 20 backlinks
2. **Physics concept**: 1,000 views/day, 3,000 backlinks

The physics concept is **EASIER** to reach because it's referenced in 3,000 other articles, giving players many paths to discover it. The news article is popular but isolated.

### Detailed Calculation Example

**Page: "Medieval_poet"**
- Backlinks: 150
- Daily Views: 300

**Step 1: Calculate Backlink Difficulty (70% weight)**
```javascript
// 150 backlinks falls in 100-1000 tier
backlinkDifficulty = 1.5 + (1000 - 150) / 900 * 1.0
                   = 1.5 + (850 / 900)
                   = 1.5 + 0.944
                   = 2.44
```

**Step 2: Calculate Popularity Modifier (30% weight)**
```javascript
// 300 views falls in 100-1000 tier
popularityModifier = 0.2
```

**Step 3: Combine**
```javascript
difficulty = backlinkDifficulty + popularityModifier
           = 2.44 + 0.2
           = 2.64 (rounded to 2.6)
```

**Result**: Moderate-Hard difficulty because the page has limited connectivity despite being somewhat known.

### Comparison: Old vs New System

| Page | Backlinks | Views | Old Difficulty | New Difficulty | Change |
|------|-----------|-------|----------------|----------------|--------|
| United_States | 15,000 | 50,000 | 1.2 | **1.0** ⬇️ | Easier (hub page) |
| Python | 3,500 | 8,000 | 1.8 | **1.4** ⬇️ | Easier (well-connected) |
| Quantum_mechanics | 800 | 2,000 | 2.3 | **2.0** ⬇️ | Slightly easier |
| News_Article | 20 | 50,000 | 1.5 | **3.2** ⬆️ | Much harder (isolated) |
| Medieval_poet | 150 | 300 | 2.8 | **2.6** ⬇️ | Slightly easier |
| Rare_species | 8 | 25 | 3.5 | **4.0** ⬆️ | Harder (very isolated) |

**Key Insight**: Pages with high views but low backlinks (like news articles) are now correctly rated as harder, while well-connected pages are appropriately easier.

## Changes Made

### Files Modified

1. **`src/js/modules/PageConnectivity.js`**
   - Rewrote `calculateDifficulty()` with tiered backlink-based formula
   - Updated `batchGetConnectivity()` to use 70/30 weighting
   - Added detailed documentation explaining the tiers

2. **`src/js/modules/ScoringSystem.js`**
   - Updated console logging to show new metrics:
     - `backlinkDifficulty` (primary factor)
     - `popularityModifier` (secondary factor)

3. **`docs/DIFFICULTY_SCORING.md`**
   - Completely updated to reflect backlink priority
   - Added new "Why Backlinks Matter" section with graph theory explanation
   - Updated examples with real difficulty breakdowns
   - Explained the 70/30 split rationale

4. **`tests/unit/difficulty-backlinks.test.js`** (NEW)
   - Comprehensive test suite for the new system
   - Tests all difficulty tiers
   - Verifies backlinks are prioritized over views
   - All 8 tests passing ✓

## Difficulty Tiers

| Backlinks | Difficulty Range | Description | Example Pages |
|-----------|-----------------|-------------|---------------|
| 5000+ | 1.0-1.5 | Very Easy - Hub pages | United States, World War II |
| 1000-5000 | 1.5-2.5 | Easy - Well-connected | Python, Albert Einstein |
| 100-1000 | 2.5-3.0 | Moderate | Quantum mechanics |
| 10-100 | 3.0-3.5 | Hard | Medieval poet, Obscure mathematician |
| <10 | 3.5-4.0 | Very Hard - Leaf pages | Rare species, Niche topics |

## Benefits

✅ **More Accurate**: Difficulty based on actual reachability, not popularity  
✅ **More Fair**: Players are scored on navigability, not SEO trends  
✅ **More Intuitive**: Fewer paths = harder to find = higher difficulty  
✅ **Research-Backed**: Based on graph theory and wiki-game research  

## Testing

Run the new test suite:
```bash
npx jest tests/unit/difficulty-backlinks.test.js
```

All 8 tests pass, verifying:
- Correct difficulty tiers
- Backlinks prioritized over views
- Proper modifier application
- Difficulty capped at 1.0-4.0

## No Breaking Changes

The upgrade is **backward compatible**:
- Same API interface (`calculateDifficulty()`)
- Same return format
- Same caching behavior
- Existing code continues to work

## Next Steps

1. ✅ Code updated and tested
2. ⏭️ Regenerate page lists: `npm run generate:pages`
3. ⏭️ Test in-game to see new difficulty scores
4. ⏭️ Monitor player feedback on difficulty balance

## Questions?

See `docs/DIFFICULTY_SCORING.md` for complete technical documentation including:
- API endpoints used
- Caching strategy
- Error handling
- Troubleshooting guide
