/**
 * The Wiki Game - Main Application (Refactored)
 * A game where you navigate from one Wikipedia page to another
 */

import { GameState } from './modules/GameState.js';
import { WikipediaAPI } from './modules/WikipediaAPI.js';
import { UIController } from './modules/UIController.js';
import { PageSelector } from './modules/PageSelector.js';
import { LeaderboardManager } from './leaderboard-refactored.js';

class WikiGame {
    constructor() {
        this.gameState = new GameState();
        this.wikiAPI = new WikipediaAPI();
        this.ui = new UIController();
        this.pageSelector = new PageSelector();
        this.leaderboard = new LeaderboardManager();
    }

    /**
     * Initialize the game
     */
    init() {
        // Initialize UI elements
        this.ui.initializeElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('The Wiki Game loaded successfully!');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Game controls
        this.ui.elements.startGameBtn?.addEventListener('click', () => this.startNewGame());
        this.ui.elements.playAgainBtn?.addEventListener('click', () => this.startNewGame());
        this.ui.elements.backBtn?.addEventListener('click', () => this.goBack());
        this.ui.elements.giveUpBtn?.addEventListener('click', () => this.giveUp());
        
        // Modal controls
        this.ui.elements.instructionsBtn?.addEventListener('click', () => this.ui.showModal('instructions'));
        this.ui.elements.leaderboardBtn?.addEventListener('click', () => this.showLeaderboard());
        this.ui.elements.closeInstructions?.addEventListener('click', () => this.ui.hideModal('instructions'));
        this.ui.elements.closeLeaderboard?.addEventListener('click', () => this.ui.hideModal('leaderboard'));
        this.ui.elements.alertOkBtn?.addEventListener('click', () => this.ui.hideModal('alert'));
        
        // Game mode selector
        this.ui.elements.gameModeSelect?.addEventListener('change', (e) => {
            this.gameState.setMode(e.target.value);
            this.ui.updateGameModeLabel(e.target.value);
        });
        
        // Leaderboard submission
        this.ui.elements.submitScoreBtn?.addEventListener('click', () => this.submitScore());
        
        // Leaderboard tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const mode = e.target.dataset.mode;
                if (mode) this.loadLeaderboardData(mode);
            });
        });

        // Service worker registration
        this.registerServiceWorker();
    }

    /**
     * Start a new game
     */
    async startNewGame() {
        this.gameState.reset();
        this.ui.showScreen('loading');
        
        // Get game mode
        const mode = this.ui.getSelectedMode();
        this.gameState.setMode(mode);
        
        // Select pages
        const { startPage, targetPage } = this.pageSelector.selectGamePages(mode);
        this.gameState.initializePages(startPage, targetPage);
        
        // Update UI
        this.ui.updatePageInfo(this.gameState.startPage, this.gameState.targetPage);
        this.ui.updateGameStats({
            clicks: 0,
            canGoBack: false,
            formattedTime: '00:00'
        });
        
        // Load starting page
        setTimeout(async () => {
            await this.loadWikiPage(startPage);
            this.gameState.setState('playing');
            this.ui.showScreen('game');
            this.startGameTimer();
        }, 500);
    }

    /**
     * Load a Wikipedia page
     * @param {string} pageName - Page name to load
     */
    async loadWikiPage(pageName) {
        console.log('Loading page:', pageName);
        
        this.gameState.expectedPage = pageName;
        this.gameState.currentPage = pageName.replace(/_/g, ' ');
        this.ui.showWikiLoading();
        
        try {
            const html = await this.wikiAPI.fetchPage(pageName);
            const { title, content } = this.wikiAPI.parseContent(html, pageName);
            
            this.ui.displayWikiContent(content);
            
            // Clean content
            this.wikiAPI.cleanContent(this.ui.elements.wikiContent);
            
            // Build TOC
            const tocItems = this.wikiAPI.extractTableOfContents(this.ui.elements.wikiContent);
            this.ui.buildTableOfContents(tocItems);
            
            // Setup link handlers
            this.setupLinkHandlers();
            
            console.log('Wikipedia page loaded successfully');
        } catch (error) {
            console.error('Error loading Wikipedia:', error);
            this.ui.showWikiError(error.message);
        }
    }

    /**
     * Setup click handlers for Wikipedia links
     */
    setupLinkHandlers() {
        const links = this.wikiAPI.extractLinks(this.ui.elements.wikiContent);
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const href = link.getAttribute('href');
                const pageName = this.wikiAPI.isValidWikiLink(href);
                
                if (pageName) {
                    console.log('Navigating to:', pageName);
                    this.navigateToPage(pageName);
                }
            });
        });
    }

    /**
     * Navigate to a new page
     * @param {string} pageName - Page name to navigate to
     */
    async navigateToPage(pageName) {
        if (this.gameState.getState() !== 'playing') return;
        
        // Update game state
        this.gameState.navigateTo(pageName);
        
        // Update UI
        this.ui.updateGameStats({
            clicks: this.gameState.clickCount,
            canGoBack: this.gameState.canGoBack(),
            formattedTime: GameState.formatTime(this.gameState.elapsedTime)
        });
        
        // Check if target reached
        if (this.gameState.isTargetReached(pageName)) {
            console.log('TARGET REACHED - YOU WIN!');
            setTimeout(() => this.winGame(), 500);
            return;
        }
        
        // Load new page
        await this.loadWikiPage(pageName);
    }

    /**
     * Go back to previous page
     */
    async goBack() {
        const previousPage = this.gameState.goBack();
        
        if (previousPage) {
            console.log('Going back to:', previousPage);
            await this.loadWikiPage(previousPage);
            
            this.ui.updateGameStats({
                clicks: this.gameState.clickCount,
                canGoBack: this.gameState.canGoBack(),
                formattedTime: GameState.formatTime(this.gameState.elapsedTime)
            });
        }
    }

    /**
     * Give up the current game
     */
    giveUp() {
        this.gameState.stopTimer();
        this.ui.showAlert('Game Over', `You gave up! The target was '${this.gameState.targetPage}'. Try again?`);
        
        setTimeout(() => {
            this.gameState.setState('welcome');
            this.ui.showScreen('welcome');
        }, 2000);
    }

    /**
     * Win the game
     */
    winGame() {
        this.gameState.stopTimer();
        this.gameState.setState('won');
        
        const stats = this.gameState.getStats();
        this.ui.updateWinScreen({
            ...stats,
            formattedTime: GameState.formatTime(stats.time)
        });
        
        this.ui.showScreen('win');
    }

    /**
     * Start game timer
     */
    startGameTimer() {
        this.gameState.startTimer((elapsedTime) => {
            this.ui.updateGameStats({
                clicks: this.gameState.clickCount,
                canGoBack: this.gameState.canGoBack(),
                formattedTime: GameState.formatTime(elapsedTime)
            });
        });
    }

    /**
     * Submit score to leaderboard
     */
    async submitScore() {
        if (this.gameState.getState() !== 'won') return;
        
        const playerName = this.ui.getPlayerName();
        const stats = this.gameState.getStats();
        
        this.ui.updateSubmitButton('submitting');
        
        try {
            const result = await this.leaderboard.submitScore(
                playerName,
                stats.startPage,
                stats.targetPage,
                stats.clicks,
                stats.time,
                stats.mode
            );
            
            if (result.success) {
                const difficultyText = result.entry.difficulty >= 2.5 ? 'Very Hard ⭐⭐⭐⭐' :
                                       result.entry.difficulty >= 2.0 ? 'Hard ⭐⭐⭐' :
                                       result.entry.difficulty >= 1.5 ? 'Medium ⭐⭐' : 'Easy ⭐';
                
                const modeText = stats.mode === 'ultra' ? '\nMode: ⚡ ULTRA HARD MODE' :
                                 stats.mode === 'hard' ? '\nMode: 🔥 HARD MODE' : '\nMode: Normal';
                
                this.ui.showAlert(
                    '🎉 Score Submitted!',
                    `Rank: #${result.rank}\nScore: ${result.entry.score} points\nDifficulty: ${difficultyText}\n${result.entry.clicks} clicks in ${GameState.formatTime(result.entry.time)}${modeText}`
                );
                
                this.ui.updateSubmitButton('submitted');
            } else {
                throw new Error(result.error || 'Failed to submit score');
            }
        } catch (error) {
            console.error('Error submitting score:', error);
            this.ui.showAlert('Error', 'Failed to submit score. Please try again.');
            this.ui.updateSubmitButton('error');
        }
    }

    /**
     * Show leaderboard modal
     */
    async showLeaderboard() {
        this.ui.showModal('leaderboard');
        await this.loadLeaderboardData('normal');
    }

    /**
     * Load leaderboard data for a specific mode
     * @param {string} mode - Game mode
     */
    async loadLeaderboardData(mode = 'normal') {
        const loadingEl = document.getElementById('leaderboardLoading');
        const dataEl = document.getElementById('leaderboardData');
        const errorEl = document.getElementById('leaderboardError');
        
        loadingEl.style.display = 'flex';
        dataEl.style.display = 'none';
        errorEl.style.display = 'none';
        
        try {
            const entries = await this.leaderboard.getTopScores(10, mode);
            this.displayLeaderboardEntries(entries, mode);
            
            loadingEl.style.display = 'none';
            dataEl.style.display = 'block';
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            loadingEl.style.display = 'none';
            errorEl.style.display = 'flex';
        }
    }

    /**
     * Display leaderboard entries
     * @param {Array} entries - Leaderboard entries
     * @param {string} mode - Game mode
     */
    displayLeaderboardEntries(entries, mode = 'normal') {
        const tbody = document.getElementById('leaderboardEntries');
        tbody.innerHTML = '';
        
        // Update title
        const title = document.querySelector('#leaderboardModal h2');
        if (title) {
            title.textContent = mode === 'ultra' ? '⚡ Ultra Hard Mode Leaderboard' :
                               mode === 'hard' ? '🔥 Hard Mode Leaderboard' :
                               '🏆 Normal Mode Leaderboard';
        }
        
        if (entries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        No entries yet. Be the first!
                    </td>
                </tr>
            `;
            return;
        }
        
        entries.forEach((entry, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
            const difficulty = entry.difficulty || 1.5;
            const difficultyLabel = difficulty >= 2.5 ? '⭐⭐⭐⭐' :
                                   difficulty >= 2.0 ? '⭐⭐⭐' :
                                   difficulty >= 1.5 ? '⭐⭐' : '⭐';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="rank-badge ${rankClass}">${rank}</div></td>
                <td><strong>${UIController.escapeHtml(entry.playerName)}</strong></td>
                <td class="route-info">${UIController.escapeHtml(entry.startPage)} → ${UIController.escapeHtml(entry.targetPage)}</td>
                <td>${entry.clicks}</td>
                <td>${LeaderboardManager.formatTime(entry.time)}</td>
                <td><span class="difficulty-badge">${difficultyLabel}</span></td>
                <td><span class="score-badge">${entry.score}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Register service worker
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('src/js/service-worker.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new WikiGame();
    game.init();
});

// Make classes available globally for backward compatibility
window.GameState = GameState;
window.WikipediaAPI = WikipediaAPI;
window.UIController = UIController;
window.PageSelector = PageSelector;
window.LeaderboardManager = LeaderboardManager;
