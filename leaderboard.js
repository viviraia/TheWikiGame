// Leaderboard System using GitHub Gist as backend
// This allows the leaderboard to work on GitHub Pages without a traditional backend

class LeaderboardManager {
    constructor(gistId, githubToken) {
        this.gistId = gistId; // Your GitHub Gist ID
        this.githubToken = githubToken; // Optional: GitHub Personal Access Token for write access
        this.apiUrl = `https://api.github.com/gists/${gistId}`;
        this.cache = null;
        this.cacheTime = 0;
        this.cacheDuration = 30000; // Cache for 30 seconds
    }

    // Fetch leaderboard data from Gist
    async fetchLeaderboard() {
        // Use cache if still valid
        if (this.cache && Date.now() - this.cacheTime < this.cacheDuration) {
            return this.cache;
        }

        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch leaderboard: ${response.status}`);
            }
            
            const gist = await response.json();
            const filename = Object.keys(gist.files)[0];
            const content = gist.files[filename].content;
            
            this.cache = JSON.parse(content);
            this.cacheTime = Date.now();
            
            return this.cache;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            // Return empty leaderboard on error
            return { entries: [] };
        }
    }

    // Submit a new score to the leaderboard
    async submitScore(playerName, startPage, targetPage, clicks, timeInSeconds) {
        try {
            // Fetch current leaderboard
            const leaderboard = await this.fetchLeaderboard();
            
            // Create new entry
            const newEntry = {
                id: Date.now().toString(),
                playerName: playerName.trim().substring(0, 20) || 'Anonymous',
                startPage,
                targetPage,
                clicks,
                time: timeInSeconds,
                score: this.calculateScore(clicks, timeInSeconds),
                timestamp: new Date().toISOString()
            };
            
            // Add new entry
            leaderboard.entries.push(newEntry);
            
            // Sort by score (lower is better) and keep top 100
            leaderboard.entries.sort((a, b) => a.score - b.score);
            leaderboard.entries = leaderboard.entries.slice(0, 100);
            
            // Update the Gist
            await this.updateGist(leaderboard);
            
            // Update cache
            this.cache = leaderboard;
            this.cacheTime = Date.now();
            
            // Find the rank of the new entry
            const rank = leaderboard.entries.findIndex(e => e.id === newEntry.id) + 1;
            
            return { success: true, rank, entry: newEntry };
        } catch (error) {
            console.error('Error submitting score:', error);
            return { success: false, error: error.message };
        }
    }

    // Update the Gist with new data
    async updateGist(data) {
        if (!this.githubToken) {
            throw new Error('GitHub token required to update leaderboard');
        }

        const response = await fetch(this.apiUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${this.githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                files: {
                    'leaderboard.json': {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to update leaderboard: ${response.status}`);
        }

        return await response.json();
    }

    // Calculate score (lower is better)
    // Formula: clicks * 10 + time_in_seconds
    calculateScore(clicks, timeInSeconds) {
        return clicks * 10 + timeInSeconds;
    }

    // Get top N entries
    async getTopScores(limit = 10) {
        const leaderboard = await this.fetchLeaderboard();
        return leaderboard.entries.slice(0, limit);
    }

    // Get player's rank and surrounding entries
    async getPlayerContext(playerName, limit = 5) {
        const leaderboard = await this.fetchLeaderboard();
        const playerEntries = leaderboard.entries.filter(
            e => e.playerName.toLowerCase() === playerName.toLowerCase()
        );
        
        if (playerEntries.length === 0) {
            return null;
        }

        // Get the best entry for this player
        const bestEntry = playerEntries[0];
        const rank = leaderboard.entries.findIndex(e => e.id === bestEntry.id) + 1;
        
        // Get surrounding entries
        const startIdx = Math.max(0, rank - Math.floor(limit / 2) - 1);
        const endIdx = Math.min(leaderboard.entries.length, startIdx + limit);
        
        return {
            rank,
            entry: bestEntry,
            surrounding: leaderboard.entries.slice(startIdx, endIdx).map((e, idx) => ({
                ...e,
                rank: startIdx + idx + 1
            }))
        };
    }

    // Format time for display
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

// Alternative: Simple localStorage-based leaderboard (for testing without Gist)
class LocalLeaderboard {
    constructor() {
        this.storageKey = 'wikiGameLeaderboard';
    }

    async fetchLeaderboard() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : { entries: [] };
    }

    async submitScore(playerName, startPage, targetPage, clicks, timeInSeconds) {
        const leaderboard = await this.fetchLeaderboard();
        
        const newEntry = {
            id: Date.now().toString(),
            playerName: playerName.trim().substring(0, 20) || 'Anonymous',
            startPage,
            targetPage,
            clicks,
            time: timeInSeconds,
            score: clicks * 10 + timeInSeconds,
            timestamp: new Date().toISOString()
        };
        
        leaderboard.entries.push(newEntry);
        leaderboard.entries.sort((a, b) => a.score - b.score);
        leaderboard.entries = leaderboard.entries.slice(0, 100);
        
        localStorage.setItem(this.storageKey, JSON.stringify(leaderboard));
        
        const rank = leaderboard.entries.findIndex(e => e.id === newEntry.id) + 1;
        return { success: true, rank, entry: newEntry };
    }

    async getTopScores(limit = 10) {
        const leaderboard = await this.fetchLeaderboard();
        return leaderboard.entries.slice(0, limit);
    }

    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}
