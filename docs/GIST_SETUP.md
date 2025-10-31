# GitHub Gist Leaderboard Setup Guide

This guide will help you set up a global leaderboard for your Wiki Game using GitHub Gist as a backend.

## 🎯 Overview

The leaderboard system now supports:
- ✅ **GitHub Gist Backend** - Global leaderboard shared across all users
- ✅ **LocalStorage Fallback** - Works without configuration
- ✅ **Automatic Caching** - Reduces API calls
- ✅ **Rate Limiting** - Prevents spam
- ✅ **Error Handling** - Graceful fallbacks

## 📋 Prerequisites

- A GitHub account
- Your game hosted on GitHub Pages

## 🚀 Setup Steps

### Step 1: Create a GitHub Personal Access Token

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a descriptive name (e.g., "Wiki Game Leaderboard")
4. Set expiration (recommend "No expiration" for production)
5. **Select scopes:**
   - ✅ Check **`gist`** (this is the only scope needed)
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't see it again!)

**⚠️ IMPORTANT:** Keep your token secret! Never commit it to git.

### Step 2: Create a GitHub Gist

1. Go to https://gist.github.com
2. Click **"Create new gist"**
3. Set filename: `leaderboard.json`
4. Set content:
```json
{
  "entries": []
}
```
5. Select **"Create public gist"** (must be public for GitHub Pages to read)
6. Copy the **Gist ID** from the URL
   - Example URL: `https://gist.github.com/username/abc123def456`
   - Gist ID: `abc123def456`

### Step 3: Configure Your Application

1. Open `config.js` in your project root
2. Replace the placeholder values:

```javascript
export const LEADERBOARD_CONFIG = {
    gistId: 'abc123def456',  // Your Gist ID here
    githubToken: 'ghp_xxxxxxxxxxxx',  // Your token here
    storageKey: 'wikiGameLeaderboard'
};
```

3. Save the file

**⚠️ SECURITY NOTE:** 
- `config.js` is already in `.gitignore` - it won't be committed
- Use `config.example.js` as a template for team members

### Step 4: Test Locally

1. Open your game in a browser (open `index.html`)
2. Play a game and submit a score
3. Check browser console - you should see: `"Score saved to GitHub Gist"`
4. Verify in your Gist - refresh the page and check for the new entry

### Step 5: Deploy to GitHub Pages

#### Option A: Manual Token Setup (Not Recommended for Production)

⚠️ **Security Risk:** Exposing your token in client-side code allows anyone to write to your Gist.

If you still want to do this:
1. Commit your changes (config.js is gitignored)
2. Push to GitHub
3. Users will see the global leaderboard

#### Option B: GitHub Actions with Secrets (Recommended) 🌟

This is more secure - the token stays secret on GitHub's servers.

1. **Store token as GitHub Secret:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GIST_TOKEN`
   - Value: Your GitHub token
   - Click "Add secret"

2. **Store Gist ID as secret:**
   - Add another secret
   - Name: `GIST_ID`
   - Value: Your Gist ID

3. **Create GitHub Actions workflow:**

Create `.github/workflows/inject-config.yml`:

```yaml
name: Inject Leaderboard Config

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Create config.js with secrets
        run: |
          cat > config.js << 'EOF'
          export const LEADERBOARD_CONFIG = {
              gistId: '${{ secrets.GIST_ID }}',
              githubToken: '${{ secrets.GIST_TOKEN }}',
              storageKey: 'wikiGameLeaderboard'
          };
          EOF
      
      - name: Setup Pages
        uses: actions/configure-pages@v5
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

5. **Push your changes:**
```bash
git add .
git commit -m "Add GitHub Gist leaderboard"
git push
```

The workflow will automatically inject your secrets and deploy!

#### Option C: Serverless Function Proxy (Most Secure) 🔒

For maximum security, use a serverless function to proxy requests:

1. Use Netlify Functions, Vercel Functions, or Cloudflare Workers
2. Store token in function environment variables
3. Client calls your function, function calls GitHub Gist
4. Token never exposed to client

*See `docs/SERVERLESS_PROXY.md` for detailed instructions (to be created).*

## 🧪 Testing

### Test the Implementation

1. **Test localStorage fallback:**
   - Don't configure `config.js` (leave null values)
   - Scores should save locally only

2. **Test Gist integration:**
   - Configure `config.js` with your credentials
   - Submit a score
   - Check console logs
   - Verify in your Gist

3. **Test error handling:**
   - Use an invalid Gist ID
   - Should fallback to localStorage gracefully

### Verify Leaderboard

```javascript
// In browser console:
const manager = new LeaderboardManager({
    gistId: 'YOUR_GIST_ID',
    githubToken: 'YOUR_TOKEN'
});

// Fetch leaderboard
manager.fetchLeaderboard().then(data => console.log(data));

// Submit test score
manager.submitScore('Test Player', 'Earth', 'Mars', 5, 60, 'normal')
    .then(result => console.log(result));
```

## 📊 Features

### Rate Limiting
- 2 second delay between score submissions
- Prevents spam and API abuse

### Caching
- 30 second cache for leaderboard data
- Reduces GitHub API calls
- Respects rate limits (5000 requests/hour)

### Fallback System
```
Primary: GitHub Gist ✅
   ↓ (if fails)
Fallback: localStorage 💾
```

### Top 1000 Limit
- Automatically keeps only top 1000 scores
- Prevents Gist from growing too large

## 🔧 Troubleshooting

### "GitHub API error: 401"
- Token is invalid or expired
- Generate a new token with `gist` scope

### "GitHub API error: 404"
- Gist ID is incorrect
- Gist was deleted
- Gist filename must be exactly `leaderboard.json`

### "Failed to save to Gist"
- Check browser console for details
- Verify token has `gist` scope
- Check if Gist is public
- Score still saved to localStorage

### Scores not syncing between users
- Verify Gist is public
- Check that all users use the same Gist ID
- Clear browser cache and reload

### Rate limit exceeded
- GitHub API limit: 5000 requests/hour (authenticated)
- Caching reduces API calls
- Wait an hour or use a different token

## 🎮 Usage

The leaderboard works automatically once configured:

1. **Player completes game**
2. **Clicks "Submit Score"**
3. **System:**
   - Calculates score with difficulty multiplier
   - Submits to GitHub Gist
   - Falls back to localStorage if Gist fails
   - Shows rank and confirmation

4. **Other players see the score:**
   - Leaderboard fetches from Gist
   - Displays global rankings
   - Updates every 30 seconds (cache expiry)

## 🔐 Security Best Practices

1. ✅ **Never commit `config.js`** - Already in `.gitignore`
2. ✅ **Use GitHub Secrets** - For Actions deployments
3. ✅ **Rotate tokens periodically** - Good security hygiene
4. ✅ **Monitor Gist activity** - Check for unusual edits
5. ✅ **Consider serverless proxy** - For production apps
6. ⚠️ **Accept the risk** - Client-side tokens can be extracted

## 🌐 Alternative Backends

If GitHub Gist doesn't fit your needs:

### Firebase Realtime Database
- Free tier: 10GB storage
- Real-time updates
- Better security rules
- More complex setup

### Supabase
- PostgreSQL database
- Row-level security
- Free tier: 500MB
- More features

### Netlify/Vercel Functions + KV Store
- Serverless functions
- Key-value storage
- Free tier available
- Custom logic possible

## 📚 API Reference

See the JSDoc comments in `leaderboard.js` for detailed API documentation.

### Key Methods

```javascript
// Fetch leaderboard
await leaderboard.fetchLeaderboard();

// Submit score
await leaderboard.submitScore(
    playerName, 
    startPage, 
    targetPage, 
    clicks, 
    timeInSeconds, 
    gameMode
);

// Get top scores
await leaderboard.getTopScores(limit, gameMode);

// Clear cache
leaderboard.clearCache();
```

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Verify your Gist is public
3. Test token with `curl`:
```bash
curl -H "Authorization: token YOUR_TOKEN" \
     https://api.github.com/gists/YOUR_GIST_ID
```

4. Open an issue on GitHub

## ✅ Checklist

Before going live:

- [ ] GitHub token generated with `gist` scope
- [ ] Gist created and is public
- [ ] `config.js` configured with correct values
- [ ] `config.js` in `.gitignore`
- [ ] Tested locally
- [ ] GitHub Secrets configured (if using Actions)
- [ ] Deployed to GitHub Pages
- [ ] Tested on live site
- [ ] Leaderboard shows global scores

---

**Ready to compete globally! 🎮🏆**
