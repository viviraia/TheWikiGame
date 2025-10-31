# 🚀 Quick Setup - GitHub Gist Leaderboard

## 3-Minute Setup

### 1. Create GitHub Token
```
GitHub Settings → Developer Settings → Personal Access Tokens → 
Generate New Token (classic) → Check "gist" → Generate → Copy Token
```

### 2. Create Gist
```
gist.github.com → New Gist → 
Filename: leaderboard.json
Content: {"entries": []}
Create Public Gist → Copy Gist ID from URL
```

### 3. Configure App
Edit `config.js`:
```javascript
export const LEADERBOARD_CONFIG = {
    gistId: 'YOUR_GIST_ID_HERE',
    githubToken: 'YOUR_TOKEN_HERE',
    storageKey: 'wikiGameLeaderboard'
};
```

### 4. Test
```
Open index.html → Play game → Submit score → 
Check console for "Score saved to GitHub Gist"
```

### 5. Deploy
```bash
git add .
git commit -m "Configure leaderboard"
git push
```

## That's it! 🎉

Your leaderboard is now global and shared across all players.

---

**Need help?** See `docs/GIST_SETUP.md` for detailed instructions.

**Security concerns?** The token is visible in client code. For production, consider:
- GitHub Actions with secrets
- Serverless function proxy
- Alternative backend (Firebase, Supabase)
