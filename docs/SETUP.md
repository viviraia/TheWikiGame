# Leaderboard Setup Guide

Complete guide for setting up the global leaderboard system for The Wiki Game.

## 🎯 Overview

The leaderboard system uses **GitHub Gist** as a free, serverless backend to store scores. This is perfect for GitHub Pages since it doesn't support traditional backends.

## 📋 Storage Options

### Option 1: Local Leaderboard (Default - Testing)
**Currently Active** - Stores scores in browser's localStorage
- ✅ No setup required
- ✅ Works immediately
- ❌ Scores only visible on your device
- ❌ Scores lost if you clear browser data

### Option 2: GitHub Gist Leaderboard (Recommended)
**Production Ready** - Stores scores on GitHub
- ✅ Global leaderboard across all users
- ✅ Persistent storage
- ✅ Free forever
- ⚙️ Requires 5-minute setup

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create GitHub Gist
1. Go to https://gist.github.com/
2. Create a new Gist with:
   - **Filename:** `leaderboard.json`
   - **Content:** `{"entries": []}`
3. Click "Create public gist"
4. Copy the **Gist ID** from the URL
   - URL: `https://gist.github.com/username/abc123def456...`
   - Gist ID: `abc123def456...`

### Step 2: Create GitHub Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name like "Wiki Game Leaderboard"
4. Set expiration (recommend: No expiration or 1 year)
5. Select scopes: **Check only `gist`**
6. Click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)

### Step 3: Update Your Code
In `src/js/app.js` (around line 72), change:
```javascript
// For local testing:
leaderboard = new LocalLeaderboard();
```

To:
```javascript
// For production with GitHub Gist:
leaderboard = new LeaderboardManager('YOUR_GIST_ID', 'YOUR_GITHUB_TOKEN');
```

**Example:**
```javascript
leaderboard = new LeaderboardManager('abc123def456', 'ghp_xxxxxxxxxxxxxxxxxxxx');
```

### Step 4: Deploy
Commit and push to GitHub Pages!

---

## 🔐 Secure Setup (Recommended for Production)

### Using GitHub Actions

1. **Store credentials as GitHub Secrets:**
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Add two secrets:
     - `GIST_ID`: Your Gist ID
     - `GIST_TOKEN`: Your GitHub token

2. **GitHub Actions workflow** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Inject credentials
        run: |
          sed -i "s/YOUR_GIST_ID/${{ secrets.GIST_ID }}/g" src/js/app.js
          sed -i "s/YOUR_GITHUB_TOKEN/${{ secrets.GIST_TOKEN }}/g" src/js/app.js
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

3. **Push to main branch** - Auto-deploys with secrets injected!

---

## 📊 How Scoring Works

**Score Formula:** `(1000 / clicks) × difficulty_multiplier / (time_in_minutes)`

**Higher scores are better!**

- **Click Efficiency**: Fewer clicks = Higher score
- **Difficulty Multipliers**: 
  - Normal: 1.0x
  - Hard: 1.5x
  - Ultra: 2.0x
- **Time Factor**: Faster completion = Better score

**Examples:**
- 3 clicks + 45 seconds + Normal = **444 points** 🥉
- 3 clicks + 45 seconds + Hard = **666 points** 🥈
- 5 clicks + 32 seconds + Ultra = **750 points** 🥇

---

## 🧪 Testing Locally

The game uses `LocalLeaderboard` by default, which stores scores in your browser's localStorage.

**Perfect for testing!** When you're ready for production, switch to `LeaderboardManager`.

---

## 🎨 Customization

### Change Score Calculation
In `src/js/leaderboard.js`, modify the `calculateScore` method:

```javascript
calculateScore(clicks, timeInSeconds) {
    // Customize your formula here
    return clicks * 10 + timeInSeconds;
}
```

### Change Leaderboard Size
In `src/js/leaderboard.js`, find:
```javascript
leaderboard.entries = leaderboard.entries.slice(0, 100);
```
Change `100` to your desired limit.

### Add Custom Stats
Modify the `newEntry` object in `submitScore` to track additional data:
```javascript
const newEntry = {
    id: Date.now().toString(),
    playerName: playerName.trim().substring(0, 20) || 'Anonymous',
    startPage,
    targetPage,
    clicks,
    time: timeInSeconds,
    score: this.calculateScore(clicks, timeInSeconds),
    timestamp: new Date().toISOString(),
    // Add custom fields:
    difficulty: 'hard',
    hints_used: 2
};
```

---

## 🐛 Troubleshooting

### "Failed to update leaderboard: 401"
- Your token is invalid or expired
- Regenerate the token and update your code

### "Failed to fetch leaderboard"
- Check your Gist ID is correct
- Make sure the Gist is public (or your token has access)
- Check browser console for detailed errors

### Scores not appearing
- Check the browser console for errors
- Verify the Gist content at `https://gist.github.com/username/GIST_ID`
- Make sure you clicked "Submit to Leaderboard"

### CORS errors
- Shouldn't happen with GitHub's API
- If it does, the Gist might be deleted or private

---

## 🔒 Security Notes

1. **Token Scope:** Only grant `gist` scope - limits damage if exposed
2. **Revoke Anytime:** Revoke tokens at https://github.com/settings/tokens
3. **Rate Limits:** 
   - Unauthenticated: 60 requests/hour
   - Authenticated: 5,000 requests/hour
4. **Public Gist:** Anyone can view the leaderboard JSON
5. **Write Access:** With the token, anyone can submit scores

⚠️ **Important:** Since GitHub Pages is static, tokens in client code are visible. Use GitHub Actions for better security, or accept the limited risk (token only has `gist` scope).

---

## 🚀 Alternative Backends

If you outgrow GitHub Gist:

### Firebase Realtime Database
- Free tier: 100 simultaneous connections
- Real-time updates
- Better for high-traffic games
- Setup: https://firebase.google.com/

### Supabase
- PostgreSQL database
- Free tier: 500MB database, 50,000 requests/month
- REST API + real-time subscriptions
- Setup: https://supabase.com/

### JSONBin.io
- Simple JSON storage API
- Free tier: 100,000 requests/month
- Setup: https://jsonbin.io/

---

## 📊 Monitoring Your Leaderboard

Check your Gist directly to see all scores:
```
https://gist.github.com/YOUR_USERNAME/YOUR_GIST_ID
```

You can manually edit or delete entries if needed.

---

## 🎮 Features

✅ Global leaderboard across all players  
✅ Top 10 rankings  
✅ Recent games view  
✅ Player name submission  
✅ Automatic score calculation  
✅ Automatic sorting  
✅ Mobile responsive  
✅ Beautiful UI with medals (🥇🥈🥉)  

---

## 📝 Player Experience

1. Play the game
2. Win by reaching target page
3. Enter name (optional, defaults to "Anonymous")
4. Click "Submit to Leaderboard"
5. See rank immediately!
6. View leaderboard anytime from welcome screen

---

**Ready to compete globally? Set up your leaderboard and start playing!** 🏆

For more details, see the example leaderboard structure in `examples/leaderboard-example.json`.
