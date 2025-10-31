# Architecture Diagram

## 📐 Refactored Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      index-refactored.html                   │
│                     (UI/DOM Structure)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    app-refactored.js                         │
│                   (Main Orchestrator)                        │
│                                                               │
│  class WikiGame {                                            │
│    - gameState: GameState                                   │
│    - wikiAPI: WikipediaAPI                                  │
│    - ui: UIController                                        │
│    - pageSelector: PageSelector                             │
│    - leaderboard: LeaderboardManager                        │
│  }                                                            │
└───┬─────────┬─────────┬─────────┬─────────┬────────────────┘
    │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼
┌─────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────┐
│Game │ │Wiki  │ │UI    │ │Page  │ │Leaderboard   │
│State│ │API   │ │Ctrl  │ │Select│ │Manager       │
└──┬──┘ └───┬──┘ └───┬──┘ └───┬──┘ └──────┬───────┘
   │        │        │        │            │
   │        │        │        │            ▼
   │        │        │        │      ┌──────────┐
   │        │        │        │      │Scoring   │
   │        │        │        │      │System    │
   │        │        │        │      └────┬─────┘
   │        │        │        │           │
   │        │        │        ▼           │
   │        │        │   ┌────────┐       │
   │        │        │   │pages.js│       │
   │        │        │   │(Data)  │       │
   │        │        │   └────────┘       │
   │        │        │                    │
   │        ▼        ▼                    ▼
   │   ┌─────────────────────────────────────┐
   │   │    Wikipedia API                     │
   │   │    en.wikipedia.org                  │
   │   └─────────────────────────────────────┘
   │
   ▼
┌──────────────┐
│ LocalStorage │
│ (Game State) │
└──────────────┘
```

## 🔄 Data Flow

### Starting a New Game
```
User clicks "Start Game"
         ↓
    WikiGame.startNewGame()
         ↓
    ┌─────────────────────────┐
    │ 1. PageSelector         │
    │    - Get page pool      │
    │    - Select start/target│
    └────────┬────────────────┘
             ↓
    ┌─────────────────────────┐
    │ 2. GameState            │
    │    - Initialize pages   │
    │    - Reset counters     │
    │    - Start timer        │
    └────────┬────────────────┘
             ↓
    ┌─────────────────────────┐
    │ 3. UIController         │
    │    - Update display     │
    │    - Show loading       │
    └────────┬────────────────┘
             ↓
    ┌─────────────────────────┐
    │ 4. WikipediaAPI         │
    │    - Fetch page HTML    │
    │    - Parse content      │
    │    - Clean content      │
    └────────┬────────────────┘
             ↓
    ┌─────────────────────────┐
    │ 5. UIController         │
    │    - Display content    │
    │    - Build TOC          │
    │    - Setup link handlers│
    └─────────────────────────┘
```

### Navigating to a Page
```
User clicks Wikipedia link
         ↓
    WikiGame.navigateToPage()
         ↓
    ┌─────────────────────────┐
    │ 1. GameState            │
    │    - Increment clicks   │
    │    - Add to history     │
    │    - Check if target    │
    └────────┬────────────────┘
             ↓
         Is target?
         ↓        ↓
        Yes       No
         ↓        ↓
    winGame()  loadWikiPage()
         ↓
    ┌─────────────────────────┐
    │ WikipediaAPI            │
    │    - Fetch new page     │
    └────────┬────────────────┘
             ↓
    ┌─────────────────────────┐
    │ UIController            │
    │    - Display content    │
    │    - Update stats       │
    └─────────────────────────┘
```

### Submitting a Score
```
User wins and submits score
         ↓
    WikiGame.submitScore()
         ↓
    ┌─────────────────────────┐
    │ 1. LeaderboardManager   │
    │    - Get game stats     │
    └────────┬────────────────┘
             ↓
    ┌─────────────────────────┐
    │ 2. ScoringSystem        │
    │    - Calculate score    │
    │    - Estimate difficulty│
    │    - Apply time bonus   │
    └────────┬────────────────┘
             ↓
    ┌─────────────────────────┐
    │ 3. LeaderboardManager   │
    │    - Save to localStorage│
    │    - Sort entries       │
    │    - Return rank        │
    └────────┬────────────────┘
             ↓
    ┌─────────────────────────┐
    │ 4. UIController         │
    │    - Show success       │
    │    - Display rank       │
    └─────────────────────────┘
```

## 🎯 Module Responsibilities

```
┌──────────────────────────────────────────────────┐
│ GameState.js                                      │
├──────────────────────────────────────────────────┤
│ • Manages game state (welcome, playing, won)     │
│ • Tracks navigation history                      │
│ • Handles game timer                             │
│ • Provides game statistics                       │
│ • No UI, no API calls - pure state management   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ WikipediaAPI.js                                   │
├──────────────────────────────────────────────────┤
│ • Fetches Wikipedia pages via REST API          │
│ • Parses HTML content                            │
│ • Cleans unwanted elements                       │
│ • Extracts table of contents                     │
│ • Validates Wikipedia links                      │
│ • No state, no UI - pure API wrapper            │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ UIController.js                                   │
├──────────────────────────────────────────────────┤
│ • Manages all DOM elements                       │
│ • Handles screen transitions                     │
│ • Updates game statistics display                │
│ • Builds table of contents UI                    │
│ • Shows modals and alerts                        │
│ • No business logic - pure UI layer             │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ PageSelector.js                                   │
├──────────────────────────────────────────────────┤
│ • Selects pages based on difficulty mode         │
│ • Applies weighted randomization                 │
│ • Manages page pools (normal, hard, ultra)       │
│ • Determines page tiers                          │
│ • No UI, no state - pure selection logic        │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ ScoringSystem.js                                  │
├──────────────────────────────────────────────────┤
│ • Calculates dynamic scores                      │
│ • Estimates route difficulty                     │
│ • Applies time bonuses                           │
│ • Fetches Wikipedia categories (optional)        │
│ • Determines page tier and category              │
│ • No UI, no state - pure calculation            │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ LeaderboardManager.js                             │
├──────────────────────────────────────────────────┤
│ • Manages leaderboard storage (localStorage)     │
│ • Submits and retrieves scores                   │
│ • Filters by game mode                           │
│ • Uses ScoringSystem for calculations            │
│ • Simple and focused - no duplication           │
└──────────────────────────────────────────────────┘
```

## 🔌 Dependencies

```
pages.js (Data - no dependencies)
    ↓
PageSelector.js → pages.js
    ↓
ScoringSystem.js (independent)
    ↓
LeaderboardManager.js → ScoringSystem.js
    ↓
GameState.js (independent)
WikipediaAPI.js (independent)
UIController.js (independent)
    ↓
app-refactored.js → All of the above
```

## 📦 Bundle Size Comparison

### Original (Monolithic)
```
app.js:          45 KB  ████████████████████████████████
leaderboard.js:  47 KB  ██████████████████████████████████
─────────────────────────────────────────────────────────
Total:           92 KB  ██████████████████████████████████████████████████████████████
```

### Refactored (Modular)
```
app-refactored.js:         12 KB  ████████
leaderboard-refactored.js:  3 KB  ██
GameState.js:               4 KB  ███
WikipediaAPI.js:            5 KB  ████
UIController.js:           11 KB  ████████
PageSelector.js:            5 KB  ████
ScoringSystem.js:           9 KB  ██████
pages.js (data):           25 KB  █████████████████
─────────────────────────────────────────────────────────
Total:                     74 KB  ███████████████████████████████████████████████
```

**Result**: 20% smaller + infinitely more maintainable! 🎉

## 🧩 Module Interaction Example

```javascript
// In app-refactored.js
class WikiGame {
    async startNewGame() {
        // 1. Get pages
        const pages = this.pageSelector.selectGamePages(mode);
        
        // 2. Update state
        this.gameState.initializePages(pages.startPage, pages.targetPage);
        
        // 3. Update UI
        this.ui.updatePageInfo(
            this.gameState.startPage,
            this.gameState.targetPage
        );
        
        // 4. Fetch content
        const html = await this.wikiAPI.fetchPage(pages.startPage);
        
        // 5. Display
        const { content } = this.wikiAPI.parseContent(html);
        this.ui.displayWikiContent(content);
        
        // 6. Start timer
        this.gameState.startTimer((time) => {
            this.ui.updateGameStats({
                clicks: this.gameState.clickCount,
                formattedTime: GameState.formatTime(time)
            });
        });
    }
}
```

Each module does ONE thing well! 🎯
