# Code Reorganization - The Wiki Game

## Overview
The codebase has been reorganized into a modular, maintainable structure with clear separation of concerns.

## New Structure

```
src/js/
├── data/
│   └── pages.js                 # Wikipedia page data (649 + 578 + 950 pages)
├── modules/
│   ├── GameState.js            # Game state management
│   ├── WikipediaAPI.js         # Wikipedia API interactions
│   ├── UIController.js         # DOM manipulation & UI updates
│   ├── PageSelector.js         # Page selection logic
│   └── ScoringSystem.js        # Score calculation & difficulty estimation
├── app-refactored.js           # Main application (new modular version)
├── app.js                      # Original application (kept for compatibility)
├── leaderboard-refactored.js   # Refactored leaderboard manager
└── leaderboard.js              # Original leaderboard (kept for compatibility)
```

## Key Improvements

### 1. **Modular Architecture**
- **GameState Module**: Centralized game state management with clear methods
- **WikipediaAPI Module**: All Wikipedia API calls isolated in one place
- **UIController Module**: DOM manipulation separated from business logic
- **PageSelector Module**: Page selection logic extracted and reusable
- **ScoringSystem Module**: Complex scoring logic separated for testability

### 2. **Data Separation**
- All page data (2,177 pages total) moved to `data/pages.js`
- Easy to maintain and update page lists
- Clear export/import structure

### 3. **Reduced Code Duplication**
- Scoring logic unified in `ScoringSystem.js`
- No more duplicate code between `LeaderboardManager` and `LocalLeaderboard`
- Shared utilities across modules

### 4. **Better Maintainability**
- Each module has a single, clear responsibility
- Easy to find and fix bugs
- Simple to add new features
- Better code organization

### 5. **Improved Testability**
- Each module can be tested independently
- Clear interfaces between modules
- Mock-friendly architecture

## Module Descriptions

### GameState.js
Manages all game state including:
- Current game phase (welcome, playing, won)
- Navigation history
- Timer management
- Page tracking
- Game statistics

### WikipediaAPI.js
Handles Wikipedia interactions:
- Fetching page HTML
- Parsing content
- Extracting table of contents
- Link validation
- Content cleaning

### UIController.js
Manages UI updates:
- Screen transitions
- Modal management
- Statistics display
- Alert messages
- Table of contents rendering

### PageSelector.js
Handles page selection:
- Mode-based page pools
- Weighted random selection
- Difficulty-aware selection
- Page tier classification

### ScoringSystem.js
Calculates scores:
- Dynamic difficulty estimation
- Time bonus calculation
- Wikipedia API integration for categories
- Tier-based difficulty

### LeaderboardManager (Refactored)
Simplified leaderboard:
- LocalStorage-based persistence
- Score submission
- Top scores retrieval
- Mode filtering

## Migration Guide

### To use the refactored version:

1. **Update HTML imports**:
```html
<!-- Replace -->
<script src="src/js/leaderboard.js"></script>
<script src="src/js/app.js"></script>

<!-- With -->
<script type="module" src="src/js/app-refactored.js"></script>
```

2. **Module imports** (if extending):
```javascript
import { GameState } from './modules/GameState.js';
import { WikipediaAPI } from './modules/WikipediaAPI.js';
import { UIController } from './modules/UIController.js';
import { PageSelector } from './modules/PageSelector.js';
import { LeaderboardManager } from './leaderboard-refactored.js';
```

## Benefits

### For Development
- **Faster debugging**: Issues isolated to specific modules
- **Easier testing**: Each module independently testable
- **Better collaboration**: Team members can work on different modules
- **Clear APIs**: Well-defined interfaces between components

### For Performance
- **Code splitting ready**: Can be bundled with Webpack/Rollup
- **Tree shaking**: Unused code can be eliminated
- **Lazy loading**: Modules can be loaded on demand
- **Caching**: Individual modules can be cached separately

### For Maintenance
- **Single responsibility**: Each file has one job
- **Easy refactoring**: Changes isolated to specific modules
- **Clear dependencies**: Import statements show relationships
- **Better documentation**: Smaller, focused files easier to document

## Next Steps (Optional)

1. **Add Build Process**:
   - Set up Webpack or Rollup for bundling
   - Minification for production
   - Source maps for debugging

2. **Add TypeScript**:
   - Type safety
   - Better IDE support
   - Catch errors at compile time

3. **Add Testing**:
   - Unit tests for each module
   - Integration tests
   - E2E tests with Playwright

4. **Add Linting**:
   - ESLint for code quality
   - Prettier for formatting
   - Consistent code style

## Backward Compatibility

The original `app.js` and `leaderboard.js` files are preserved for backward compatibility. The refactored versions are in:
- `app-refactored.js`
- `leaderboard-refactored.js`
- `modules/` directory

This allows gradual migration without breaking existing functionality.

## File Sizes

### Original
- `app.js`: ~45KB (1,452 lines)
- `leaderboard.js`: ~47KB (1,452 lines)
- **Total**: ~92KB

### Refactored
- `app-refactored.js`: ~12KB (380 lines)
- `leaderboard-refactored.js`: ~3KB (88 lines)
- `modules/GameState.js`: ~4KB (124 lines)
- `modules/WikipediaAPI.js`: ~5KB (156 lines)
- `modules/UIController.js`: ~11KB (337 lines)
- `modules/PageSelector.js`: ~5KB (137 lines)
- `modules/ScoringSystem.js`: ~9KB (284 lines)
- `data/pages.js`: ~25KB (689 lines)
- **Total**: ~74KB (but better organized!)

## Summary

The refactored code is:
- ✅ More maintainable
- ✅ Easier to test
- ✅ Better organized
- ✅ More performant (with bundling)
- ✅ Scalable for future features
- ✅ Follows modern JavaScript best practices
