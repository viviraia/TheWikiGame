/**
 * Game State Manager
 * Handles all game state logic and transitions
 */

export class GameState {
    constructor() {
        this.state = 'welcome'; // welcome, loading, playing, won
        this.mode = 'normal'; // normal, hard, ultra
        this.startPage = '';
        this.targetPage = '';
        this.currentPage = '';
        this.expectedPage = '';
        this.clickCount = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.navigationHistory = [];
        this.timer = null;
    }

    // Reset game state for a new game
    reset() {
        this.state = 'loading';
        this.startPage = '';
        this.targetPage = '';
        this.currentPage = '';
        this.expectedPage = '';
        this.clickCount = 0;
        this.elapsedTime = 0;
        this.navigationHistory = [];
        this.stopTimer();
    }

    // Set the game mode
    setMode(mode) {
        if (['normal', 'hard', 'ultra'].includes(mode)) {
            this.mode = mode;
        }
    }

    // Get current game mode
    getMode() {
        return this.mode;
    }

    // Initialize pages for a new game
    initializePages(startPage, targetPage) {
        this.startPage = startPage.replace(/_/g, ' ');
        this.targetPage = targetPage.replace(/_/g, ' ');
        this.currentPage = this.startPage;
        this.navigationHistory = [startPage];
    }

    // Navigate to a new page
    navigateTo(pageName) {
        this.clickCount++;
        this.navigationHistory.push(pageName);
        this.currentPage = pageName.replace(/_/g, ' ');
    }

    // Go back to previous page
    goBack() {
        if (this.navigationHistory.length <= 1) return false;
        
        this.navigationHistory.pop();
        const previousPage = this.navigationHistory[this.navigationHistory.length - 1];
        this.currentPage = previousPage.replace(/_/g, ' ');
        
        return previousPage;
    }

    // Check if can go back
    canGoBack() {
        return this.navigationHistory.length > 1;
    }

    // Check if target reached
    isTargetReached(pageName) {
        const normalizedCurrent = pageName.toLowerCase().replace(/_/g, ' ');
        const normalizedTarget = this.targetPage.toLowerCase();
        return normalizedCurrent === normalizedTarget;
    }

    // Start the game timer
    startTimer(callback) {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            if (callback) callback(this.elapsedTime);
        }, 1000);
    }

    // Stop the game timer
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // Set game state
    setState(newState) {
        this.state = newState;
    }

    // Get game state
    getState() {
        return this.state;
    }

    // Get game statistics
    getStats() {
        return {
            clicks: this.clickCount,
            time: this.elapsedTime,
            startPage: this.startPage,
            targetPage: this.targetPage,
            mode: this.mode
        };
    }

    // Format time for display
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}
