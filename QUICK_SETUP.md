# Quick Leaderboard Setup (5 minutes)

## 🚀 Quick Start

### 1. Create GitHub Gist
- Go to: https://gist.github.com/
- Filename: `leaderboard.json`
- Content: `{"entries": []}`
- Click "Create public gist"
- Copy the **Gist ID** from URL

### 2. Get GitHub Token
- Go to: https://github.com/settings/tokens
- "Generate new token (classic)"
- Check only: `gist` scope
- Copy the token

### 3. Update Code
In `app.js` line ~72, change:
```javascript
leaderboard = new LocalLeaderboard();
```
To:
```javascript
leaderboard = new LeaderboardManager('PASTE_GIST_ID', 'PASTE_TOKEN');
```

### 4. Deploy
Commit and push to GitHub Pages!

---

## 🔐 Secure Setup (Recommended)

### Add Secrets to GitHub
1. Repository → Settings → Secrets and variables → Actions
2. Add two secrets:
   - `GIST_ID`: Your Gist ID
   - `GIST_TOKEN`: Your GitHub token

### Use GitHub Actions
The `.github/workflows/deploy.yml` file is already set up!

Just push to main branch and it will auto-deploy with secrets injected.

---

## 📊 How It Works

**Score Formula:** `(1000 / clicks) × difficulty / (time_in_minutes)`

**Higher scores are better!**

- **Click Efficiency**: Fewer clicks = Higher score
- **Difficulty Bonus**: Hard routes get 2.0x multiplier
- **Time Factor**: Faster is better

Example:
- 3 clicks + 45 seconds + medium difficulty = **666 points** 🏆
- 5 clicks + 32 seconds + hard difficulty = **566 points** 🥇
- 10 clicks + 120 seconds + easy difficulty = **50 points** 😅

**See full explanation:** `SCORING_EXPLAINED.md`

---

## 🧪 Testing Locally

The game currently uses `LocalLeaderboard` which stores scores in your browser.

This is perfect for testing! When you're ready, switch to `LeaderboardManager`.

---

## 📝 Features

✅ Global leaderboard across all players  
✅ Top 10 rankings  
✅ Recent games view  
✅ Player name submission  
✅ Score calculation (clicks + time)  
✅ Automatic sorting  
✅ Mobile responsive  
✅ Beautiful UI with medals (🥇🥈🥉)  

---

## 🎮 Player Experience

1. Play the game
2. Win by reaching target page
3. Enter name (optional, defaults to "Anonymous")
4. Click "Submit to Leaderboard"
5. See rank immediately!
6. View leaderboard anytime from welcome screen

---

## 🛠️ Need Help?

See full guide: `LEADERBOARD_SETUP.md`

Common issues:
- **401 Error**: Invalid or expired token
- **404 Error**: Wrong Gist ID
- **CORS Error**: Gist might be deleted

---

Made with ❤️ for The Wiki Game
