/**
 * UI Controller Module
 * Handles all DOM manipulation and UI updates
 */

export class UIController {
    constructor() {
        this.elements = {};
        this.modals = {};
    }

    /**
     * Initialize all DOM element references
     */
    initializeElements() {
        // Screens
        this.elements.welcomeScreen = document.getElementById('welcomeScreen');
        this.elements.loadingScreen = document.getElementById('loadingScreen');
        this.elements.gameScreen = document.getElementById('gameScreen');
        this.elements.winScreen = document.getElementById('winScreen');

        // Buttons
        this.elements.startGameBtn = document.getElementById('startGameBtn');
        this.elements.instructionsBtn = document.getElementById('instructionsBtn');
        this.elements.playAgainBtn = document.getElementById('playAgainBtn');
        this.elements.homeBtn = document.getElementById('homeBtn');
        this.elements.backBtn = document.getElementById('backBtn');
        this.elements.giveUpBtn = document.getElementById('giveUpBtn');
        this.elements.leaderboardBtn = document.getElementById('leaderboardBtn');
        this.elements.submitScoreBtn = document.getElementById('submitScoreBtn');

        // Game info elements
        this.elements.startPageEl = document.getElementById('startPage');
        this.elements.targetPageEl = document.getElementById('targetPage');
        this.elements.clickCountEl = document.getElementById('clickCount');
        this.elements.timerEl = document.getElementById('timer');
        this.elements.wikiContent = document.getElementById('wikiContent');
        this.elements.wikiTOC = document.getElementById('wikiTOC');
        this.elements.gameModeSelect = document.getElementById('gameModeSelect');
        this.elements.gameModeLabel = document.getElementById('gameModeLabel');
        this.elements.playerNameInput = document.getElementById('playerNameInput');
        this.elements.hintBtn = document.getElementById('hintBtn');
        this.elements.hintMessage = document.getElementById('hintMessage');

        // Modals
        this.modals.instructions = document.getElementById('instructionsModal');
        this.modals.alert = document.getElementById('alertModal');
        this.modals.menu = document.getElementById('menuModal');
        this.modals.leaderboard = document.getElementById('leaderboardModal');

        // Modal controls
        this.elements.closeInstructions = document.getElementById('closeInstructions');
        this.elements.closeMenu = document.getElementById('closeMenu');
        this.elements.closeLeaderboard = document.getElementById('closeLeaderboard');
        this.elements.alertOkBtn = document.getElementById('alertOkBtn');
    }

    /**
     * Show a specific screen
     * @param {string} screenName - Name of the screen to show
     */
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = this.elements[`${screenName}Screen`];
        if (screen) {
            screen.classList.add('active');
        }
    }

    /**
     * Show a modal
     * @param {string} modalName - Name of the modal
     */
    showModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Hide a modal
     * @param {string} modalName - Name of the modal
     */
    hideModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Show alert modal with custom message
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     */
    showAlert(title, message) {
        document.getElementById('alertTitle').textContent = title;
        document.getElementById('alertMessage').textContent = message;
        this.showModal('alert');
    }

    /**
     * Update game stats display
     * @param {Object} stats - Game statistics
     */
    updateGameStats(stats) {
        if (this.elements.clickCountEl) {
            this.elements.clickCountEl.textContent = `${stats.clicks} clicks`;
        }
        if (this.elements.timerEl && stats.formattedTime) {
            this.elements.timerEl.textContent = stats.formattedTime;
        }
        if (this.elements.backBtn) {
            this.elements.backBtn.disabled = !stats.canGoBack;
        }
    }

    /**
     * Update page info display
     * @param {string} startPage - Start page name
     * @param {string} targetPage - Target page name
     */
    updatePageInfo(startPage, targetPage) {
        if (this.elements.startPageEl) {
            this.elements.startPageEl.textContent = startPage;
        }
        if (this.elements.targetPageEl) {
            this.elements.targetPageEl.textContent = targetPage;
        }
    }

    /**
     * Update game mode label
     * @param {string} mode - Game mode (normal, hard, ultra)
     */
    updateGameModeLabel(mode) {
        if (!this.elements.gameModeLabel) return;
        
        switch (mode) {
            case 'ultra':
                this.elements.gameModeLabel.textContent = 'ULTRA HARD MODE';
                this.elements.gameModeLabel.style.color = '#000000ff';
                this.elements.gameModeLabel.style.fontWeight = '700';
                break;
            case 'hard':
                this.elements.gameModeLabel.textContent = 'HARD MODE';
                this.elements.gameModeLabel.style.color = '#ff6b6b';
                this.elements.gameModeLabel.style.fontWeight = '600';
                break;
            default:
                this.elements.gameModeLabel.textContent = 'Normal Mode';
                this.elements.gameModeLabel.style.color = '#6c757d';
                this.elements.gameModeLabel.style.fontWeight = '500';
        }
    }

    /**
     * Show loading state in wiki content
     */
    showWikiLoading() {
        if (this.elements.wikiContent) {
            this.elements.wikiContent.innerHTML = '<div class="wiki-loading">Loading Wikipedia...</div>';
        }
    }

    /**
     * Show error in wiki content
     * @param {string} error - Error message
     */
    showWikiError(error) {
        if (this.elements.wikiContent) {
            this.elements.wikiContent.innerHTML = `
                <div class="wiki-loading">
                    <p>Failed to load Wikipedia page.</p>
                    <p style="font-size: 0.9rem; color: #666;">Error: ${error}</p>
                    <p style="font-size: 0.9rem; color: #666;">Try the back button or give up to restart.</p>
                </div>
            `;
        }
    }

    /**
     * Display Wikipedia content
     * @param {string} content - HTML content
     */
    displayWikiContent(content) {
        if (this.elements.wikiContent) {
            this.elements.wikiContent.innerHTML = content;
            this.elements.wikiContent.scrollTop = 0;
        }
    }

    /**
     * Build and display table of contents
     * @param {Array} tocItems - Array of TOC items {id, text, level}
     */
    buildTableOfContents(tocItems) {
        if (!this.elements.wikiTOC) return;
        
        this.elements.wikiTOC.innerHTML = '';
        
        if (tocItems.length === 0) return;
        
        let lastLevel = 2;
        
        tocItems.forEach(item => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${item.id}`;
            link.textContent = item.text;
            link.className = item.level === 3 ? 'toc-sub-item' : 'toc-item';
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const heading = document.getElementById(item.id);
                if (heading) {
                    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
            
            li.appendChild(link);
            
            if (item.level === 3 && lastLevel === 2) {
                let nestedUl = this.elements.wikiTOC.querySelector('li:last-child ul');
                if (!nestedUl) {
                    nestedUl = document.createElement('ul');
                    const lastLi = this.elements.wikiTOC.querySelector('li:last-child');
                    if (lastLi) {
                        lastLi.appendChild(nestedUl);
                    }
                }
                if (nestedUl) {
                    nestedUl.appendChild(li);
                } else {
                    this.elements.wikiTOC.appendChild(li);
                }
            } else if (item.level === 2) {
                this.elements.wikiTOC.appendChild(li);
            }
            
            lastLevel = item.level;
        });
    }

    /**
     * Update win screen with game results
     * @param {Object} stats - Game statistics
     */
    updateWinScreen(stats) {
        document.getElementById('winTargetPage').textContent = stats.targetPage;
        document.getElementById('winClicks').textContent = stats.clicks;
        document.getElementById('winTime').textContent = stats.formattedTime;
        
        // Reset submit button
        if (this.elements.submitScoreBtn) {
            this.elements.submitScoreBtn.disabled = false;
            this.elements.submitScoreBtn.textContent = 'Submit to Leaderboard';
            this.elements.submitScoreBtn.style.background = '';
        }
        
        // Clear player name
        if (this.elements.playerNameInput) {
            this.elements.playerNameInput.value = '';
        }
    }

    /**
     * Update submit button state
     * @param {string} state - Button state (submitting, submitted, error)
     * @param {string} message - Optional message
     */
    updateSubmitButton(state, message = '') {
        if (!this.elements.submitScoreBtn) return;
        
        switch (state) {
            case 'submitting':
                this.elements.submitScoreBtn.disabled = true;
                this.elements.submitScoreBtn.textContent = 'Submitting...';
                break;
            case 'submitted':
                this.elements.submitScoreBtn.textContent = '✓ Submitted';
                this.elements.submitScoreBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                break;
            case 'error':
                this.elements.submitScoreBtn.disabled = false;
                this.elements.submitScoreBtn.textContent = 'Submit to Leaderboard';
                break;
        }
    }

    /**
     * Get player name from input
     * @returns {string} - Player name or "Anonymous"
     */
    getPlayerName() {
        const name = this.elements.playerNameInput?.value.trim();
        return name || 'Anonymous';
    }

    /**
     * Get selected game mode
     * @returns {string} - Selected game mode
     */
    getSelectedMode() {
        return this.elements.gameModeSelect?.value || 'normal';
    }

    /**
     * Show hint button for hard/ultra modes
     */
    showHintButton() {
        if (this.elements.hintBtn) {
            this.elements.hintBtn.style.display = 'block';
        }
    }

    /**
     * Hide hint button
     */
    hideHintButton() {
        if (this.elements.hintBtn) {
            this.elements.hintBtn.style.display = 'none';
        }
        this.hideHintMessage();
    }

    /**
     * Display hint message
     * @param {string} message - Hint message to display
     */
    showHintMessage(message) {
        if (this.elements.hintMessage) {
            this.elements.hintMessage.innerHTML = message;
            this.elements.hintMessage.style.display = 'block';
        }
    }

    /**
     * Hide hint message
     */
    hideHintMessage() {
        if (this.elements.hintMessage) {
            this.elements.hintMessage.style.display = 'none';
        }
    }

    /**
     * Escape HTML for safe display
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}
