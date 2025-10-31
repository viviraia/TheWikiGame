# ⚡ GitHub Gist Leaderboard - Quick Reference

## 🎯 Implementation Complete!

Your leaderboard now supports **global score sharing** via GitHub Gist.

---

## 📝 Quick Setup (5 Minutes)

### 1. Get GitHub Token
```
https://github.com/settings/tokens/new
→ Note: "Wiki Game Leaderboard"
→ Expiration: No expiration
→ ✅ Check "gist" scope ONLY
→ Generate token → COPY IT
```

### 2. Create Gist
```
https://gist.github.com/new
→ Filename: leaderboard.json
→ Content: {"entries": []}
→ Create PUBLIC gist
→ Copy ID from URL (e.g., abc123def456)
```

### 3. Configure
Edit `config.js`:
```javascript
export const LEADERBOARD_CONFIG = {
    gistId: 'abc123def456',
    githubToken: 'ghp_xxxx...',
    storageKey: 'wikiGameLeaderboard'
};
```

### 4. Test
```bash
# Open in browser
start index.html

# Play game → Submit score
# Check console: "Score saved to GitHub Gist" ✅
```

### 5. Deploy

#### Option A: Simple Deploy (Token visible in code)
```bash
git add .
git commit -m "Enable global leaderboard"
git push
```

#### Option B: Secure Deploy (Recommended)
```bash
# Add secrets to GitHub:
# Repository → Settings → Secrets and variables → Actions
# Add: GIST_ID = abc123def456
# Add: GIST_TOKEN = ghp_xxxx...

# Push code (config.js is gitignored)
git add .
git commit -m "Setup leaderboard infrastructure"
git push

# Workflow auto-injects secrets during deployment
```

---

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `src/js/leaderboard.js` | Main leaderboard logic (Gist + localStorage) |
| `config.js` | Your secrets (gitignored!) |
| `config.example.js` | Template for team members |
| `docs/GIST_SETUP.md` | Full setup guide |
| `docs/QUICK_GIST_SETUP.md` | 3-min quickstart |
| `test-leaderboard-config.js` | Test your setup |
| `.github/workflows/deploy.yml` | Auto-deploy with secrets |

---

## 🧪 Test Your Setup

### In Browser Console:
```javascript
// Load test script
testLeaderboard();

// Or manually test:
const { LeaderboardManager } = await import('./src/js/leaderboard.js');
const { LEADERBOARD_CONFIG } = await import('./config.js');
const lb = new LeaderboardManager(LEADERBOARD_CONFIG);

// Fetch scores
await lb.fetchLeaderboard();

// Submit test
await lb.submitScore('Test', 'Earth', 'Mars', 5, 60, 'normal', false);
```

---

## ✨ Features

- ✅ **Global Leaderboard** - All players see same scores
- ✅ **Automatic Fallback** - Uses localStorage if Gist fails
- ✅ **Smart Caching** - 30s cache reduces API calls
- ✅ **Rate Limiting** - 2s delay prevents spam
- ✅ **Top 1000** - Automatically keeps best scores
- ✅ **Zero Config** - Works without setup (localStorage mode)

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Using localStorage fallback" | Normal! Edit config.js to enable Gist |
| "GitHub API error: 401" | Token invalid - regenerate with "gist" scope |
| "GitHub API error: 404" | Wrong Gist ID or Gist deleted |
| Scores not syncing | All users must use same Gist ID |
| Rate limit exceeded | Wait 1 hour or use different token |

---

## 🔐 Security Notes

**⚠️ Client-Side Warning:**
- Token is visible in browser DevTools
- Anyone can submit scores
- OK for hobby projects

**🔒 For Production:**
- Use GitHub Actions with secrets (see deploy.yml)
- Or use serverless proxy function
- Or switch to Firebase/Supabase

---

## 📊 How It Works

```
User submits score
       ↓
Calculate score + difficulty
       ↓
Try GitHub Gist API
       ↓
   Success? ━━━━┓
       ↓        ↓
      YES      NO
       ↓        ↓
   Save to  → localStorage
    Gist       (fallback)
       ↓        ↓
       └────────┘
       ↓
  Return rank
```

---

## 🆘 Get Help

1. **Full docs:** `docs/GIST_SETUP.md`
2. **Quick start:** `docs/QUICK_GIST_SETUP.md`
3. **Test script:** `test-leaderboard-config.js`
4. **Check console** for detailed error messages
5. **Verify Gist manually:**
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" \
        https://api.github.com/gists/YOUR_GIST_ID
   ```

---

## ✅ Pre-Deploy Checklist

- [ ] GitHub token created with "gist" scope
- [ ] Gist created (public, named leaderboard.json)
- [ ] config.js configured with credentials
- [ ] config.js in .gitignore
- [ ] Tested locally (see console logs)
- [ ] GitHub Secrets added (if using Actions)
- [ ] Deployed and tested live

---

## 🎮 You're Ready!

Your leaderboard is now **production-ready** and will work globally for all players.

**Happy coding! 🚀**

---

*For more details, see `IMPLEMENTATION_SUMMARY.md`*
