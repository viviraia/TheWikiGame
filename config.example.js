/**
 * Configuration Example for GitHub Gist Leaderboard
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to 'config.js' (which is gitignored)
 * 2. Replace the values below with your actual GitHub Gist ID and token
 * 3. The app will automatically use GitHub Gist if configured
 */

export const LEADERBOARD_CONFIG = {
    // Your GitHub Gist ID (from the Gist URL)
    // Example: If your Gist URL is https://gist.github.com/username/abc123def456
    // Then your gistId is: abc123def456
    gistId: 'YOUR_GIST_ID_HERE',
    
    // Your GitHub Personal Access Token (with 'gist' scope)
    // Generate at: https://github.com/settings/tokens
    // Keep this secret! Never commit config.js to git
    githubToken: 'YOUR_GITHUB_TOKEN_HERE',
    
    // Optional: localStorage key for fallback
    storageKey: 'wikiGameLeaderboard'
};
