# Leaderboard Setup Guide

This guide will help you set up the leaderboard system for The Wiki Game on GitHub Pages.

## 🎯 Overview

The leaderboard system uses **GitHub Gist** as a free, serverless backend to store scores. This is perfect for GitHub Pages since it doesn't support traditional backends.

## 📋 Options

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

## 🚀 Setting Up GitHub Gist Leaderboard

### Step 1: Create a GitHub Gist

1. Go to https://gist.github.com/
2. Create a new Gist with:
   - **Filename:** `leaderboard.json`
   - **Content:**
   ```json
   {
     "entries": []
   }
   ```
3. Click "Create public gist" (or secret gist if you prefer)
4. Copy the **Gist ID** from the URL:
   - URL looks like: `https://gist.github.com/username/abc123def456...`
   - Gist ID is: `abc123def456...`

### Step 2: Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name like "Wiki Game Leaderboard"
4. Set expiration (recommend: No expiration or 1 year)
5. Select scopes: **Check only `gist`**
6. Click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)

### Step 3: Update Your Code

Open `app.js` and find this line (around line 72):

```javascript
// For local testing:
leaderboard = new LocalLeaderboard();
```

Replace it with:

```javascript
// For production with GitHub Gist:
leaderboard = new LeaderboardManager('YOUR_GIST_ID', 'YOUR_GITHUB_TOKEN');
```

Replace:
- `YOUR_GIST_ID` with the Gist ID from Step 1
- `YOUR_GITHUB_TOKEN` with the token from Step 2

**Example:**
```javascript
leaderboard = new LeaderboardManager('abc123def456', 'ghp_xxxxxxxxxxxxxxxxxxxx');
```

### Step 4: Deploy to GitHub Pages

⚠️ **IMPORTANT SECURITY NOTE:**

Since GitHub Pages is static, your token will be visible in the source code. To keep it more secure:

#### Option A: Use GitHub Actions (Recommended)

1. Store the token as a GitHub Secret:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GIST_TOKEN`
   - Value: Your GitHub token

2. Create `.github/workflows/deploy.yml`:
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
      
      - name: Inject token
        run: |
          sed -i "s/YOUR_GITHUB_TOKEN/${{ secrets.GIST_TOKEN }}/g" app.js
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

#### Option B: Accept Token Visibility (Simpler)

If you're okay with the token being public:
- The token only has `gist` scope (can't access your repos)
- You can revoke it anytime
- Anyone can submit scores, but they can't delete the Gist

Just commit and push your code with the token in it.

### Step 5: Test It!

1. Open your game
2. Play and win a game
3. Enter your name and click "Submit to Leaderboard"
4. Open the leaderboard modal to see your score!

## 🔧 Advanced: Using Environment Variables

For better security, you can use a build process:

1. Create `.env` file (add to `.gitignore`):
```
GIST_ID=your_gist_id
GIST_TOKEN=your_token
```

2. Use a bundler like Vite or Webpack to inject these at build time

3. Deploy only the built files

## 🎨 Customization

### Change Score Calculation

In `leaderboard.js`, find the `calculateScore` method:

```javascript
calculateScore(clicks, timeInSeconds) {
    return clicks * 10 + timeInSeconds;
}
```

Adjust the formula as you like! Lower scores are better.

### Change Leaderboard Size

In `leaderboard.js`, find:

```javascript
leaderboard.entries = leaderboard.entries.slice(0, 100);
```

Change `100` to any number you want.

### Add More Stats

Modify the `newEntry` object in `submitScore` to include more data:

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
    browser: navigator.userAgent,
    country: 'Unknown' // You'd need an IP geolocation API
};
```

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
- This shouldn't happen with GitHub's API
- If it does, the Gist might be deleted or private

## 🔒 Security Notes

1. **Token Scope:** Only grant `gist` scope - this limits damage if exposed
2. **Revoke Anytime:** You can revoke the token at https://github.com/settings/tokens
3. **Rate Limits:** GitHub API allows 60 requests/hour (unauthenticated) or 5000/hour (authenticated)
4. **Public Gist:** Anyone can view the leaderboard JSON
5. **Write Access:** With the token, anyone can submit scores (but they can't delete old ones)

## 🚀 Alternative Backends

If you outgrow GitHub Gist, consider:

### Firebase Realtime Database
- Free tier: 100 simultaneous connections
- Real-time updates
- Better for high-traffic games
- Setup: https://firebase.google.com/

### Supabase
- PostgreSQL database
- Free tier: 500MB database
- REST API
- Setup: https://supabase.com/

### JSONBin.io
- Simple JSON storage API
- Free tier: 100 requests/day
- Setup: https://jsonbin.io/

## 📊 Monitoring

Check your Gist directly to see all scores:
```
https://gist.github.com/YOUR_USERNAME/YOUR_GIST_ID
```

You can manually edit or delete entries if needed.

## 🎮 Ready to Play!

Once set up, your leaderboard will:
- ✅ Store scores globally
- ✅ Show top 10 players
- ✅ Display recent games
- ✅ Update in real-time
- ✅ Work on any device

Enjoy your global Wiki Game leaderboard! 🏆
