// Game State
const gameState = {
    state: 'welcome', // welcome, loading, playing, won
    startPage: '',
    targetPage: '',
    currentPage: '',
    expectedPage: '',
    clickCount: 0,
    startTime: null,
    elapsedTime: 0,
    navigationHistory: [],
    timer: null
};

// Popular Wikipedia pages for random selection
const popularPages = [
    "United_States", "World_War_II", "Albert_Einstein", "DNA", "Solar_System",
    "William_Shakespeare", "Ancient_Egypt", "Internet", "Evolution", "Leonardo_da_Vinci",
    "The_Beatles", "Moon", "Computer", "France", "Barack_Obama",
    "Philosophy", "Mathematics", "Music", "Art", "Science",
    "History", "Geography", "Biology", "Physics", "Chemistry",
    "Literature", "Psychology", "Economics", "Politics", "Technology",
    "Renaissance", "Industrial_Revolution", "Ancient_Rome", "Ancient_Greece", "China",
    "India", "Japan", "Germany", "United_Kingdom", "Russia",
    "Space_exploration", "Artificial_intelligence", "Climate_change", "Democracy", "Religion",
    // Historical Figures
    "Napoleon", "Isaac_Newton", "Charles_Darwin", "Nikola_Tesla", "Marie_Curie",
    "Galileo_Galilei", "Julius_Caesar", "Cleopatra", "Martin_Luther_King_Jr.", "Mahatma_Gandhi",
    "Abraham_Lincoln", "George_Washington", "Queen_Victoria", "Alexander_the_Great", "Genghis_Khan",
    // Countries and Places
    "Brazil", "Australia", "Canada", "Mexico", "Egypt",
    "Italy", "Spain", "Greece", "Turkey", "South_Korea",
    "New_York_City", "London", "Paris", "Tokyo", "Rome",
    // Science and Nature
    "Black_hole", "Quantum_mechanics", "Theory_of_relativity", "Big_Bang", "Periodic_table",
    "Photosynthesis", "Dinosaur", "Human_brain", "Heart", "Ocean",
    "Earth", "Mars", "Jupiter", "Saturn", "Sun",
    "Gravity", "Electricity", "Magnetism", "Light", "Sound",
    // Arts and Culture
    "Pablo_Picasso", "Vincent_van_Gogh", "Michelangelo", "Mozart", "Beethoven",
    "Elvis_Presley", "Michael_Jackson", "Bob_Dylan", "The_Rolling_Stones", "Pink_Floyd",
    "Star_Wars", "Harry_Potter", "The_Lord_of_the_Rings", "Marvel_Comics", "DC_Comics",
    "Olympic_Games", "FIFA_World_Cup", "Basketball", "Football", "Tennis",
    // Technology and Innovation
    "Apple_Inc.", "Microsoft", "Google", "Tesla,_Inc.", "Amazon_(company)",
    "Smartphone", "Automobile", "Airplane", "Television", "Radio",
    "World_Wide_Web", "Social_media", "Bitcoin", "Programming_language", "Robotics",
    // History and Events
    "World_War_I", "Cold_War", "French_Revolution", "American_Civil_War", "Vietnam_War",
    "Great_Depression", "Holocaust", "Space_Race", "Moon_landing", "September_11_attacks",
    // Philosophy and Ideas
    "Socrates", "Plato", "Aristotle", "Confucius", "Buddhism",
    "Christianity", "Islam", "Hinduism", "Judaism", "Atheism",
    "Ethics", "Metaphysics", "Epistemology", "Logic", "Aesthetics",
    // Miscellaneous
    "Pizza", "Coffee", "Chocolate", "Beer", "Wine",
    "Cat", "Dog", "Tiger", "Elephant", "Whale",
    "Tree", "Mountain", "River", "Desert", "Forest",
    // Architecture and Landmarks
    "Eiffel_Tower", "Great_Wall_of_China", "Taj_Mahal", "Colosseum", "Statue_of_Liberty",
    "Pyramids_of_Giza", "Machu_Picchu", "Petra", "Stonehenge", "Big_Ben",
    // Literature and Authors
    "Jane_Austen", "Mark_Twain", "Ernest_Hemingway", "J._K._Rowling", "Stephen_King",
    "George_Orwell", "F._Scott_Fitzgerald", "Charles_Dickens", "Homer", "Dante_Alighieri",
    // Mythology and Folklore
    "Greek_mythology", "Norse_mythology", "Egyptian_mythology", "Zeus", "Odin",
    "King_Arthur", "Robin_Hood", "Dracula", "Vampire", "Dragon",
    // Medical and Health
    "Antibiotics", "Vaccine", "Cancer", "Diabetes", "Mental_health",
    "Immune_system", "Neuroscience", "Surgery", "Virus", "Bacteria",
    // Languages and Linguistics
    "English_language", "Spanish_language", "Mandarin_Chinese", "Latin", "Sanskrit",
    "Sign_language", "Alphabet", "Grammar", "Phonetics", "Etymology",
    // Economics and Business
    "Capitalism", "Socialism", "Stock_market", "Cryptocurrency", "Inflation",
    "Supply_and_demand", "Entrepreneurship", "Globalization", "Trade", "Banking",
    // Environmental Science
    "Ecosystem", "Biodiversity", "Endangered_species", "Deforestation", "Renewable_energy",
    "Greenhouse_gas", "Sustainability", "Conservation_biology", "Pollution", "Recycling",
    // Mathematics and Computing
    "Algorithm", "Calculus", "Geometry", "Statistics", "Probability",
    "Machine_learning", "Cybersecurity", "Database", "Compiler", "Operating_system",
    // Music Genres and Instruments
    "Jazz", "Rock_music", "Classical_music", "Hip_hop_music", "Electronic_music",
    "Piano", "Guitar", "Violin", "Drums", "Orchestra",
    // Film and Directors
    "Alfred_Hitchcock", "Steven_Spielberg", "Stanley_Kubrick", "Martin_Scorsese", "Quentin_Tarantino",
    "The_Godfather", "Citizen_Kane", "Pulp_Fiction", "The_Shawshank_Redemption", "Casablanca",
    // Astronomy and Cosmology
    "Galaxy", "Milky_Way", "Nebula", "Supernova", "Exoplanet",
    "Telescope", "NASA", "Hubble_Space_Telescope", "International_Space_Station", "Astronaut",
    // Ancient Civilizations
    "Mesopotamia", "Maya_civilization", "Inca_Empire", "Aztec", "Persian_Empire",
    "Byzantine_Empire", "Ottoman_Empire", "Mongol_Empire", "Holy_Roman_Empire", "Viking",
    // Human Rights and Social Movements
    "Human_rights", "Civil_rights_movement", "Feminism", "Abolition_of_slavery", "Suffrage",
    "Civil_disobedience", "Nonviolence", "Freedom_of_speech", "Equality", "Justice",
    // Sports and Athletes
    "Muhammad_Ali", "Michael_Jordan", "Pelé", "Serena_Williams", "Usain_Bolt",
    "Cricket", "Rugby", "Boxing", "Swimming", "Gymnastics",
    // Geology and Earth Science
    "Plate_tectonics", "Volcano", "Earthquake", "Mineral", "Rock_(geology)",
    "Fossil", "Geological_time_scale", "Weathering", "Erosion", "Glacier",
    // Psychology and Neuroscience
    "Consciousness", "Memory", "Learning", "Emotion", "Intelligence",
    "Cognitive_science", "Behaviorism", "Psychoanalysis", "Sigmund_Freud", "Carl_Jung",
    // Food and Cuisine
    "Sushi", "Pasta", "Hamburger", "Bread", "Cheese",
    "Italian_cuisine", "Chinese_cuisine", "French_cuisine", "Mexican_cuisine", "Indian_cuisine",
    // Transportation and Vehicles
    "Train", "Ship", "Bicycle", "Motorcycle", "Helicopter",
    "Submarine", "Rocket", "Spacecraft", "Aviation", "Maritime_transport",
    // Energy and Physics
    "Nuclear_power", "Solar_energy", "Wind_power", "Fossil_fuel", "Thermodynamics",
    "Wave", "Particle", "Atom", "Electron", "Proton"
];

// DOM Elements - will be initialized when DOM loads
let welcomeScreen, loadingScreen, gameScreen, winScreen;
let startGameBtn, instructionsBtn, playAgainBtn, backBtn, giveUpBtn;
let startPageEl, targetPageEl, clickCountEl, timerEl, wikiContent, wikiTOC;
let instructionsModal, alertModal, menuModal, closeInstructions, closeMenu, alertOkBtn;

// Initialize DOM elements and event listeners when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get all DOM elements
    welcomeScreen = document.getElementById('welcomeScreen');
    loadingScreen = document.getElementById('loadingScreen');
    gameScreen = document.getElementById('gameScreen');
    winScreen = document.getElementById('winScreen');

    startGameBtn = document.getElementById('startGameBtn');
    instructionsBtn = document.getElementById('instructionsBtn');
    playAgainBtn = document.getElementById('playAgainBtn');
    backBtn = document.getElementById('backBtn');
    giveUpBtn = document.getElementById('giveUpBtn');

    startPageEl = document.getElementById('startPage');
    targetPageEl = document.getElementById('targetPage');
    clickCountEl = document.getElementById('clickCount');
    timerEl = document.getElementById('timer');
    wikiContent = document.getElementById('wikiContent');
    wikiTOC = document.getElementById('wikiTOC');

    instructionsModal = document.getElementById('instructionsModal');
    alertModal = document.getElementById('alertModal');
    menuModal = document.getElementById('menuModal');
    closeInstructions = document.getElementById('closeInstructions');
    closeMenu = document.getElementById('closeMenu');
    alertOkBtn = document.getElementById('alertOkBtn');

    // Event Listeners
    startGameBtn.addEventListener('click', startNewGame);
    playAgainBtn.addEventListener('click', startNewGame);
    instructionsBtn.addEventListener('click', () => showModal(instructionsModal));
    closeInstructions.addEventListener('click', () => hideModal(instructionsModal));
    closeMenu.addEventListener('click', () => hideModal(menuModal));
    alertOkBtn.addEventListener('click', () => hideModal(alertModal));
    backBtn.addEventListener('click', goBack);
    giveUpBtn.addEventListener('click', giveUp);

    document.getElementById('newGameBtn').addEventListener('click', () => {
        hideModal(menuModal);
        startNewGame();
    });

    document.getElementById('viewInstructionsBtn').addEventListener('click', () => {
        hideModal(menuModal);
        showModal(instructionsModal);
    });

    document.getElementById('resumeGameBtn').addEventListener('click', () => {
        hideModal(menuModal);
    });

    console.log('✅ The Wiki Game loaded successfully!');
});

// Screen Management
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function showModal(modal) {
    modal.classList.add('active');
}

function hideModal(modal) {
    modal.classList.remove('active');
}

function showAlert(title, message) {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    showModal(alertModal);
}

// Game Functions
function startNewGame() {
    gameState.state = 'loading';
    showScreen(loadingScreen);

    // Reset game state
    gameState.clickCount = 0;
    gameState.elapsedTime = 0;
    gameState.navigationHistory = [];

    // Select two different random pages
    const shuffled = [...popularPages].sort(() => Math.random() - 0.5);
    const startPageName = shuffled[0];
    const targetPageName = shuffled[1];

    gameState.startPage = startPageName.replace(/_/g, ' ');
    gameState.targetPage = targetPageName.replace(/_/g, ' ');
    gameState.currentPage = gameState.startPage;
    gameState.navigationHistory.push(startPageName);

    // Update UI
    startPageEl.textContent = gameState.startPage;
    targetPageEl.textContent = gameState.targetPage;
    clickCountEl.textContent = `0 clicks`;
    timerEl.textContent = `00:00`;
    backBtn.disabled = true;

    // Load the starting Wikipedia page
    setTimeout(() => {
        loadWikiPage(startPageName);
        gameState.state = 'playing';
        showScreen(gameScreen);
        startTimer();
    }, 500);
}

function loadWikiPage(pageName) {
    console.log('Loading page:', pageName);
    console.log('Starting game...');
    console.log('Target is:', gameState.targetPage);
    
    // Start with first page
    
    // Store the current page we're loading
    gameState.expectedPage = pageName;
    gameState.currentPage = pageName.replace(/_/g, ' ');
    
    // Show loading state
    wikiContent.innerHTML = '<div class="wiki-loading">Loading Wikipedia...</div>';
    
    // Use Wikipedia's REST API with proper headers
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(pageName)}`;
    
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'text/html; charset=utf-8; profile="https://www.mediawiki.org/wiki/Specs/HTML/2.1.0"',
            'Api-User-Agent': 'TheWikiGame/1.0 (Educational Project)'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log('Wikipedia HTML loaded');
            displayWikiPageFromHTML(html, pageName);
        })
        .catch(error => {
            console.error('Error loading Wikipedia:', error);
            wikiContent.innerHTML = `
                <div class="wiki-loading">
                    <p>Failed to load Wikipedia page.</p>
                    <p style="font-size: 0.9rem; color: #666;">Error: ${error.message}</p>
                    <p style="font-size: 0.9rem; color: #666;">Try the back button or give up to restart.</p>
                </div>
            `;
        });
}

function displayWikiPageFromHTML(html, pageName) {
    const title = pageName.replace(/_/g, ' ');
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get the title if available
    const titleElement = tempDiv.querySelector('h1, .mw-page-title');
    const displayTitle = titleElement ? titleElement.textContent : title;
    
    // Build cleaner HTML content
    let content = `<h1>${displayTitle}</h1>`;
    
    // Get the main content
    const bodyContent = tempDiv.querySelector('body') || tempDiv;
    content += bodyContent.innerHTML;
    
    wikiContent.innerHTML = content;
    
    // Remove edit links and other unwanted elements
    wikiContent.querySelectorAll('.mw-editsection, .mw-cite-backlink, sup.reference').forEach(el => {
        el.remove();
    });
    
    // Remove the last section of the Wikipedia page
    const allSections = wikiContent.querySelectorAll('h2');
    if (allSections.length > 0) {
        const lastSection = allSections[allSections.length - 1];
        // Remove the last h2 and all content until the next h2 or end of content
        let currentElement = lastSection;
        while (currentElement) {
            const nextElement = currentElement.nextElementSibling;
            currentElement.remove();
            currentElement = nextElement;
            // Stop if we hit another h2 (which shouldn't happen as it's the last section)
            if (currentElement && currentElement.tagName === 'H2') {
                break;
            }
        }
    }
    
    // Build table of contents
    buildTableOfContents();
    
    // Intercept all link clicks
    const links = wikiContent.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const href = link.getAttribute('href');
            console.log('Link clicked:', href);
            
            if (href && href.startsWith('./')) {
                // Wikipedia REST API returns relative links like ./Article_Name
                const newPageName = href.replace('./', '').split('#')[0];
                
                // Ignore special pages
                if (!newPageName.includes(':') && newPageName !== 'Main_Page' && newPageName) {
                    console.log(' Navigating to:', newPageName);
                    navigateToPage(newPageName);
                } else {
                    console.log('Ignoring special page');
                }
            } else if (href && href.startsWith('/wiki/')) {
                const newPageName = href.replace('/wiki/', '').split('#')[0];
                
                // Ignore special pages
                if (!newPageName.includes(':') && newPageName !== 'Main_Page' && newPageName) {
                    console.log('Navigating to:', newPageName);
                    navigateToPage(newPageName);
                } else {
                    console.log('Ignoring special page');
                }
            } else if (href && href.includes('wikipedia.org/wiki/')) {
                // Handle full URLs
                const match = href.match(/\/wiki\/([^#?]+)/);
                if (match) {
                    const newPageName = decodeURIComponent(match[1]);
                    if (!newPageName.includes(':') && newPageName !== 'Main_Page' && newPageName) {
                        console.log('Navigating to:', newPageName);
                        navigateToPage(newPageName);
                    }
                }
            }
        });
    });
    
    // Scroll to top
    wikiContent.scrollTop = 0;
}

function buildTableOfContents() {
    if (!wikiContent || !wikiTOC) return;
    
    console.log('Building table of contents...');
    
    // Clear existing TOC
    wikiTOC.innerHTML = '';
    
    // Find all h2 and h3 headings in the content
    const headings = wikiContent.querySelectorAll('h2, h3');
    
    if (headings.length === 0) {
        console.log('No headings found for TOC');
        return;
    }
    
    let currentList = wikiTOC;
    let lastLevel = 2;
    
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.substring(1)); // 2 or 3
        const text = heading.textContent.trim();
        
        // Skip empty headings
        if (!text) return;
        
        // Add ID to heading if it doesn't have one
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        // Create list item
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = text;
        link.className = level === 3 ? 'toc-sub-item' : 'toc-item';
        
        // Handle click to scroll to heading
        link.addEventListener('click', (e) => {
            e.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        li.appendChild(link);
        
        // Handle nesting for h3 (sub-items under h2)
        if (level === 3 && lastLevel === 2) {
            // Create nested ul for h3 items under the last h2
            let nestedUl = currentList.querySelector('li:last-child ul');
            if (!nestedUl) {
                nestedUl = document.createElement('ul');
                const lastLi = currentList.querySelector('li:last-child');
                if (lastLi) {
                    lastLi.appendChild(nestedUl);
                }
            }
            if (nestedUl) {
                nestedUl.appendChild(li);
            } else {
                currentList.appendChild(li);
            }
        } else if (level === 2) {
            // Add h2 items to the main list
            wikiTOC.appendChild(li);
            currentList = wikiTOC;
        }
        
        lastLevel = level;
    });
    
    console.log(`Built TOC with ${headings.length} headings`);
}

function navigateToPage(pageName) {
    if (gameState.state !== 'playing') return;
    
    console.log('navigateToPage called:', pageName);
    console.log('Target:', gameState.targetPage);
    
    // Update game state
    gameState.clickCount++;
    gameState.navigationHistory.push(pageName);
    
    console.log('Click count:', gameState.clickCount);
    console.log('History:', gameState.navigationHistory);
    
    // Update UI
    clickCountEl.textContent = `${gameState.clickCount} clicks`;
    backBtn.disabled = false;
    
    // Check if we reached the target
    const normalizedCurrent = pageName.toLowerCase().replace(/_/g, ' ');
    const normalizedTarget = gameState.targetPage.toLowerCase();
    
    console.log('   COMPARISON:');
    console.log('   Current:', normalizedCurrent);
    console.log('   Target:', normalizedTarget);
    console.log('   Match?', normalizedCurrent === normalizedTarget);
    
    if (normalizedCurrent === normalizedTarget) {
        console.log('WIN');
        setTimeout(() => winGame(), 500);
        return;
    }
    
    // Load the new page
    loadWikiPage(pageName);
}

function goBack() {
    if (gameState.navigationHistory.length <= 1) return;

    gameState.navigationHistory.pop();
    const previousPage = gameState.navigationHistory[gameState.navigationHistory.length - 1];
    gameState.currentPage = previousPage.replace(/_/g, ' ');
    
    console.log(' Going back to:', previousPage);
    
    loadWikiPage(previousPage);
    backBtn.disabled = gameState.navigationHistory.length <= 1;
}

function giveUp() {
    stopTimer();
    showAlert('Game Over', `You gave up! The target was '${gameState.targetPage}'. Try again?`);
    setTimeout(() => {
        gameState.state = 'welcome';
        showScreen(welcomeScreen);
    }, 2000);
}

function winGame() {
    stopTimer();
    gameState.state = 'won';
    
    // Update win screen
    document.getElementById('winTargetPage').textContent = gameState.targetPage;
    document.getElementById('winClicks').textContent = gameState.clickCount;
    document.getElementById('winTime').textContent = formatTime(gameState.elapsedTime);
    
    showScreen(winScreen);
}

// Timer Functions
function startTimer() {
    gameState.startTime = Date.now();
    gameState.timer = setInterval(() => {
        gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        timerEl.textContent = `${formatTime(gameState.elapsedTime)}`;
    }, 1000);
}

function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install prompt
    const installPrompt = document.createElement('div');
    installPrompt.className = 'install-prompt show';
    installPrompt.innerHTML = `
        <span>📱 Install The Wiki Game as an app!</span>
        <button id="installBtn">Install</button>
        <button id="dismissBtn" style="background: transparent; color: #666;">Dismiss</button>
    `;
    document.body.appendChild(installPrompt);
    
    document.getElementById('installBtn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            installPrompt.remove();
        }
    });
    
    document.getElementById('dismissBtn').addEventListener('click', () => {
        installPrompt.remove();
    });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
}
