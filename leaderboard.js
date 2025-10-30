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
    async submitScore(playerName, startPage, targetPage, clicks, timeInSeconds, gameMode = 'normal', useAPI = true) {
        try {
            // Fetch current leaderboard
            const leaderboard = await this.fetchLeaderboard();
            
            // Calculate score with difficulty adjustment (using Wikipedia API for accurate categories)
            const score = await this.calculateScore(clicks, timeInSeconds, startPage, targetPage, useAPI);
            
            // Mode multipliers: Normal (1.0x), Hard (1.5x), Ultra (2.0x)
            let modeMultiplier = 1.0;
            if (gameMode === 'hard') {
                modeMultiplier = 1.5;
            } else if (gameMode === 'ultra') {
                modeMultiplier = 2.0;
            }
            const finalScore = Math.round(score * modeMultiplier);
            
            // Create new entry
            const newEntry = {
                id: Date.now().toString(),
                playerName: playerName.trim().substring(0, 20) || 'Anonymous',
                startPage,
                targetPage,
                clicks,
                time: timeInSeconds,
                score: finalScore,
                difficulty: await this.estimateDifficulty(startPage, targetPage, useAPI),
                gameMode: gameMode,  // Store game mode
                timestamp: new Date().toISOString()
            };
            
            // Add new entry
            leaderboard.entries.push(newEntry);
            
            // Sort by score (HIGHER is better now!)
            leaderboard.entries.sort((a, b) => b.score - a.score);
            leaderboard.entries = leaderboard.entries.slice(0, 200); // Keep more entries for two modes
            
            // Update the Gist
            await this.updateGist(leaderboard);
            
            // Update cache
            this.cache = leaderboard;
            this.cacheTime = Date.now();
            
            // Find the rank of the new entry within its game mode
            const modeEntries = leaderboard.entries.filter(e => (e.gameMode || 'normal') === gameMode);
            const rank = modeEntries.findIndex(e => e.id === newEntry.id) + 1;
            
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

    // Calculate score with dynamic difficulty-adjusted efficiency rating
    // Higher scores are better with this new system!
    // Formula: Efficiency Score = (1000 / clicks) × difficulty_multiplier × time_bonus
    async calculateScore(clicks, timeInSeconds, startPage = '', targetPage = '', useAPI = true) {
        // Base efficiency: fewer clicks = higher score (exponential curve)
        const clickEfficiency = 1000 / Math.max(clicks, 1);
        
        // Dynamic time bonus: Rewards speed with diminishing returns
        const timeBonus = this.calculateTimeBonus(clicks, timeInSeconds);
        
        // Dynamic difficulty: Based on semantic distance and page characteristics
        // Use Wikipedia API to get real categories for accurate difficulty
        const difficulty = await this.estimateDifficulty(startPage, targetPage, useAPI);
        
        // Final score: efficiency × difficulty × time_bonus
        // Higher is better!
        const score = Math.round(clickEfficiency * difficulty * timeBonus);
        
        return score;
    }
    
    // Calculate dynamic time bonus (1.0 to 3.0 multiplier)
    // Rewards speed but accounts for route complexity
    calculateTimeBonus(clicks, timeInSeconds) {
        // Expected time: More clicks = more expected time
        // Baseline: ~15 seconds per click for reading + thinking
        const expectedTime = clicks * 15;
        
        // Calculate speed ratio
        const speedRatio = expectedTime / Math.max(timeInSeconds, 1);
        
        // Apply bonuses with diminishing returns
        let timeBonus;
        
        if (speedRatio >= 2.0) {
            // Extremely fast: 2.5x-3.0x bonus (but diminishing)
            timeBonus = 2.5 + Math.min(0.5, (speedRatio - 2.0) * 0.2);
        } else if (speedRatio >= 1.5) {
            // Very fast: 2.0x-2.5x bonus
            timeBonus = 2.0 + (speedRatio - 1.5) * 1.0;
        } else if (speedRatio >= 1.0) {
            // Good speed: 1.5x-2.0x bonus
            timeBonus = 1.5 + (speedRatio - 1.0) * 1.0;
        } else if (speedRatio >= 0.5) {
            // Average speed: 1.0x-1.5x
            timeBonus = 1.0 + (speedRatio - 0.5) * 1.0;
        } else {
            // Slow: 0.5x-1.0x (penalty for being too slow)
            timeBonus = Math.max(0.5, speedRatio * 2.0);
        }
        
        return timeBonus;
    }
    
    // Redesigned difficulty system using tier-based approach (with Wikipedia API integration)
    // Returns difficulty multiplier: 0.7 (Easy) to 3.0 (Expert)
    async estimateDifficulty(startPage, targetPage, useAPI = true) {
        console.log(`\n🎮 Analyzing route difficulty: "${startPage}" → "${targetPage}"`);
        
        // Normalize page names for comparison
        const normalizePageName = (page) => page.toLowerCase().replace(/_/g, ' ').trim();
        const start = normalizePageName(startPage);
        const target = normalizePageName(targetPage);
        
        // Get page metadata (with optional API usage for real Wikipedia categories)
        const startInfo = await this.getPageMetadata(start, useAPI);
        const targetInfo = await this.getPageMetadata(target, useAPI);
        
        console.log(`📊 Start: ${startInfo.tier} (${startInfo.category}), Popularity: ${startInfo.popularity}`);
        console.log(`📊 Target: ${targetInfo.tier} (${targetInfo.category}), Popularity: ${targetInfo.popularity}`);
        
        // Calculate base difficulty from tier combination
        let baseDifficulty = this.calculateTierDifficulty(startInfo.tier, targetInfo.tier);
        
        // Apply category relationship modifier
        const categoryModifier = this.getCategoryRelationship(startInfo.category, targetInfo.category);
        baseDifficulty *= categoryModifier;
        
        // Apply popularity modifier (popular pages are easier to find)
        const popularityModifier = this.getPopularityModifier(startInfo.popularity, targetInfo.popularity);
        baseDifficulty *= popularityModifier;
        
        // Clamp final difficulty between 0.7 and 3.0
        const finalDifficulty = Math.max(0.7, Math.min(3.0, baseDifficulty));
        
        console.log(`🎯 Final difficulty: ${finalDifficulty.toFixed(2)}x`);
        console.log(`   Base: ${this.calculateTierDifficulty(startInfo.tier, targetInfo.tier).toFixed(2)}x | Category: ${categoryModifier.toFixed(2)}x | Popularity: ${popularityModifier.toFixed(2)}x\n`);
        
        return finalDifficulty;
    }
    
    // Fetch Wikipedia page categories from API
    async fetchWikipediaCategories(pageName) {
        try {
            const normalizedPage = pageName.replace(/ /g, '_');
            const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(normalizedPage)}&prop=categories&cllimit=50&format=json&origin=*`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) {
                console.warn(`Failed to fetch categories for ${pageName}`);
                return [];
            }
            
            const data = await response.json();
            const pages = data.query?.pages;
            
            if (!pages) return [];
            
            const pageId = Object.keys(pages)[0];
            const categories = pages[pageId]?.categories || [];
            
            // Extract category names (remove "Category:" prefix)
            return categories.map(cat => cat.title.replace('Category:', '').toLowerCase());
        } catch (error) {
            console.warn(`Error fetching categories for ${pageName}:`, error);
            return [];
        }
    }
    
    // Determine category from Wikipedia API categories
    determineCategoryFromAPI(apiCategories) {
        if (!apiCategories || apiCategories.length === 0) {
            return 'unknown';
        }
        
        const categoriesStr = apiCategories.join(' ');
        
        // Geography
        if (categoriesStr.match(/\b(countries|cities|geography|continents|rivers|mountains|islands|regions|states|provinces)\b/)) {
            return 'geography';
        }
        
        // History
        if (categoriesStr.match(/\b(history|historical|wars|battles|empires|dynasties|revolutions|ancient|medieval)\b/)) {
            return 'history';
        }
        
        // Science
        if (categoriesStr.match(/\b(science|physics|chemistry|biology|mathematics|scientific|theories|scientists)\b/)) {
            return 'science';
        }
        
        // People (biographical)
        if (categoriesStr.match(/\b(births|deaths|people|politicians|artists|writers|musicians|philosophers|scientists|leaders)\b/)) {
            return 'people';
        }
        
        // Culture
        if (categoriesStr.match(/\b(culture|art|music|literature|religion|philosophy|architecture|painting|sculpture)\b/)) {
            return 'culture';
        }
        
        // Space
        if (categoriesStr.match(/\b(astronomy|planets|stars|galaxies|space|solar system|celestial)\b/)) {
            return 'space';
        }
        
        // Technology
        if (categoriesStr.match(/\b(technology|computing|computers|software|internet|engineering)\b/)) {
            return 'technology';
        }
        
        // Nature
        if (categoriesStr.match(/\b(animals|plants|nature|wildlife|fauna|flora|biology)\b/)) {
            return 'nature';
        }
        
        // Sports
        if (categoriesStr.match(/\b(sports|athletes|football|basketball|tennis|olympic|competitions)\b/)) {
            return 'sports';
        }
        
        // Food
        if (categoriesStr.match(/\b(food|cuisine|dishes|ingredients|cooking|culinary)\b/)) {
            return 'food';
        }
        
        // Media
        if (categoriesStr.match(/\b(films|movies|television|books|novels|media|entertainment)\b/)) {
            return 'media';
        }
        
        // Landmarks
        if (categoriesStr.match(/\b(buildings|monuments|landmarks|structures|towers|temples|palaces)\b/)) {
            return 'landmarks';
        }
        
        // Mythology
        if (categoriesStr.match(/\b(mythology|mythological|deities|gods|goddesses)\b/)) {
            return 'mythology';
        }
        
        return 'unknown';
    }
    
    // Get metadata for a Wikipedia page (enhanced with API support)
    // This method determines which tier a page belongs to by checking the actual game arrays
    async getPageMetadata(pageName, useAPI = true) {
        let category = 'unknown';
        
        // Fetch real Wikipedia categories if API usage is enabled
        if (useAPI) {
            const apiCategories = await this.fetchWikipediaCategories(pageName);
            if (apiCategories.length > 0) {
                category = this.determineCategoryFromAPI(apiCategories);
                console.log(`📚 Wikipedia API categories for "${pageName}":`, apiCategories.slice(0, 5).join(', '));
                console.log(`📁 Determined category: ${category}`);
            }
        }
        
        // If API didn't work or returned unknown, fall back to keyword guessing
        if (category === 'unknown') {
            category = this.guessCategory(pageName);
        }
        
        // First, try to get the actual arrays from the game (if available in global scope)
        if (typeof popularPages !== 'undefined' && typeof obscurePages !== 'undefined' && typeof ultraObscurePages !== 'undefined') {
            const normalizedPage = pageName.replace(/ /g, '_');
            
            // Check if page is in any of the actual game arrays
            if (popularPages.includes(normalizedPage)) {
                return { tier: 'easy', category: category, popularity: 85 };
            }
            if (obscurePages.includes(normalizedPage)) {
                return { tier: 'hard', category: category, popularity: 35 };
            }
            if (ultraObscurePages.includes(normalizedPage)) {
                return { tier: 'expert', category: category, popularity: 15 };
            }
        }
        
        // Fallback: Check against knowledge base samples (for backwards compatibility)
        const pageData = this.getWikipediaKnowledge();
        
        for (const [tier, data] of Object.entries(pageData.tiers)) {
            for (const [categoryName, pages] of Object.entries(data.categories)) {
                const found = pages.some(p => {
                    const normalizedP = p.toLowerCase().replace(/_/g, ' ');
                    return normalizedP === pageName || 
                           pageName.includes(normalizedP) || 
                           normalizedP.includes(pageName);
                });
                
                if (found) {
                    return {
                        tier: tier,
                        category: category !== 'unknown' ? category : categoryName,
                        popularity: data.popularity
                    };
                }
            }
        }
        
        // Default for unknown pages (fallback to easy tier)
        return {
            tier: 'easy',
            category: category,
            popularity: 50
        };
    }
    
    // Guess category based on page name keywords
    guessCategory(pageName) {
        const normalized = pageName.toLowerCase();
        
        // Geography keywords
        if (normalized.match(/\b(country|city|state|province|river|mountain|ocean|sea|continent|island|desert|forest|lake)\b/) ||
            normalized.match(/\b(africa|asia|europe|america|oceania|antarctica)\b/)) {
            return 'geography';
        }
        
        // History keywords
        if (normalized.match(/\b(war|battle|empire|dynasty|revolution|age|period|era|ancient|medieval|civilization)\b/) ||
            normalized.match(/\b(treaty|kingdom|republic)\b/)) {
            return 'history';
        }
        
        // Science keywords
        if (normalized.match(/\b(physics|chemistry|biology|mathematics|science|theory|atom|molecule|cell|evolution|quantum)\b/) ||
            normalized.match(/\b(equation|formula|law|principle)\b/)) {
            return 'science';
        }
        
        // Culture keywords
        if (normalized.match(/\b(art|music|literature|philosophy|religion|culture|painting|sculpture|architecture)\b/) ||
            normalized.match(/\b(christianity|islam|buddhism|hinduism|judaism|democracy|capitalism|socialism)\b/)) {
            return 'culture';
        }
        
        // Space keywords
        if (normalized.match(/\b(planet|star|galaxy|moon|sun|solar|space|universe|asteroid|comet|nebula)\b/) ||
            normalized.match(/\b(mars|jupiter|saturn|venus|mercury|neptune|uranus|pluto|nasa)\b/)) {
            return 'space';
        }
        
        // Technology keywords
        if (normalized.match(/\b(computer|internet|technology|software|hardware|programming|algorithm|artificial|intelligence)\b/)) {
            return 'technology';
        }
        
        // Nature keywords
        if (normalized.match(/\b(animal|plant|tree|flower|dog|cat|lion|tiger|elephant|whale|dinosaur|bird|fish)\b/)) {
            return 'nature';
        }
        
        // Sports keywords
        if (normalized.match(/\b(sport|football|basketball|tennis|olympic|soccer|baseball|cricket|rugby|golf)\b/)) {
            return 'sports';
        }
        
        // Food keywords
        if (normalized.match(/\b(food|cuisine|pizza|pasta|bread|cheese|coffee|tea|beer|wine|rice|wheat)\b/)) {
            return 'food';
        }
        
        // Media keywords
        if (normalized.match(/\b(film|movie|television|tv|book|novel|newspaper|radio|magazine|star wars|harry potter)\b/)) {
            return 'media';
        }
        
        // Landmarks keywords
        if (normalized.match(/\b(tower|palace|temple|pyramid|monument|statue|cathedral|building)\b/)) {
            return 'landmarks';
        }
        
        // Mythology keywords
        if (normalized.match(/\b(mythology|myth|god|goddess|zeus|odin|thor|athena|apollo|poseidon)\b/)) {
            return 'mythology';
        }
        
        // Check if it's a person (contains common name patterns)
        if (normalized.match(/\b(king|queen|president|emperor|saint|sir|lord|prince|princess)\b/) ||
            normalized.split('_').length >= 2) {  // Most people have at least first and last name
            return 'people';
        }
        
        return 'unknown';
    }
    
    // Wikipedia knowledge base organized by tiers (Based on actual 2,177 validated pages)
    getWikipediaKnowledge() {
        return {
            tiers: {
                // MEGA HUBS: Extremely well-connected, core Wikipedia articles (13 pages)
                mega: {
                    popularity: 100,
                    categories: {
                        core: ['United_States', 'World_War_II', 'World_War_I', 'Europe', 'Asia', 'Earth', 
                               'Science', 'History', 'Human', 'Language', 'Country', 'City', 'War']
                    }
                },
                // EASY: Popular pages from app.js popularPages array (797 pages total)
                easy: {
                    popularity: 85,
                    categories: {
                        geography: [
                            // 31 geography pages - major countries, cities, continents
                            'France', 'Germany', 'China', 'Japan', 'India', 'Russia', 'United_Kingdom',
                            'Brazil', 'Canada', 'Australia', 'Mexico', 'Italy', 'Spain', 'Africa',
                            'Antarctica', 'North_America', 'South_America', 'Oceania', 'Asia', 'Europe',
                            'London', 'Paris', 'New_York_City', 'Tokyo', 'Berlin', 'Moscow', 'Beijing',
                            'Rome', 'Los_Angeles', 'Chicago', 'San_Francisco'
                        ],
                        history: [
                            // 31 history pages - major events, periods, movements
                            'Ancient_Rome', 'Ancient_Egypt', 'Ancient_Greece', 'Renaissance',
                            'Industrial_Revolution', 'Cold_War', 'Vietnam_War', 'French_Revolution',
                            'American_Revolution', 'American_Civil_War', 'Great_Depression',
                            'The_Holocaust', 'Space_Race', 'Age_of_Enlightenment', 'Crusades',
                            'Protestant_Reformation', 'Middle_Ages', 'Roman_Empire', 'Byzantine_Empire',
                            'Ottoman_Empire', 'Mongol_Empire', 'Persian_Empire', 'Viking_Age',
                            'Mesopotamia', 'Maya_civilization', 'Inca_Empire', 'Aztec', 'Colonialism',
                            'Imperialism', 'Fascism', 'Communism'
                        ],
                        people: [
                            // 245 people - scientists, leaders, artists, philosophers
                            'Albert_Einstein', 'Isaac_Newton', 'Charles_Darwin', 'Galileo_Galilei',
                            'Leonardo_da_Vinci', 'William_Shakespeare', 'Napoleon', 'Julius_Caesar',
                            'Cleopatra', 'Alexander_the_Great', 'Genghis_Khan', 'Winston_Churchill',
                            'Abraham_Lincoln', 'George_Washington', 'Martin_Luther_King_Jr.',
                            'Mahatma_Gandhi', 'Nelson_Mandela', 'Adolf_Hitler', 'Joseph_Stalin',
                            'Mao_Zedong', 'Karl_Marx', 'Socrates', 'Plato', 'Aristotle',
                            'Confucius', 'Sigmund_Freud', 'Nikola_Tesla', 'Thomas_Edison',
                            'Marie_Curie', 'Stephen_Hawking', 'Pablo_Picasso', 'Vincent_van_Gogh',
                            'Michelangelo', 'Wolfgang_Amadeus_Mozart', 'Ludwig_van_Beethoven',
                            'Johann_Sebastian_Bach', 'The_Beatles', 'Elvis_Presley', 'Bob_Dylan',
                            'Michael_Jackson', 'Queen_Victoria', 'Elizabeth_II', 'Catherine_the_Great'
                        ],
                        science: [
                            // 26 science pages - physics, chemistry, biology, mathematics
                            'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Evolution', 'DNA',
                            'Gravity', 'Atom', 'Quantum_mechanics', 'Theory_of_relativity',
                            'Photosynthesis', 'Natural_selection', 'Periodic_table', 'Ecology',
                            'Genetics', 'Cell_(biology)', 'Energy', 'Force', 'Thermodynamics',
                            'Electromagnetism', 'Black_hole', 'Big_Bang', 'Climate_change',
                            'Nuclear_fission', 'Nuclear_fusion', 'Vaccine'
                        ],
                        culture: [
                            // 48 culture pages - religion, art, philosophy, social movements
                            'Religion', 'Christianity', 'Islam', 'Buddhism', 'Hinduism', 'Judaism',
                            'Philosophy', 'Art', 'Music', 'Literature', 'Architecture', 'Theatre',
                            'Cinema', 'Painting', 'Sculpture', 'Democracy', 'Capitalism', 'Socialism',
                            'Feudalism', 'Monarchy', 'Republic', 'Poetry', 'Drama', 'Novel',
                            'Opera', 'Ballet', 'Classical_music', 'Rock_music', 'Jazz', 'Hip_hop',
                            'Existentialism', 'Stoicism', 'Ethics', 'Metaphysics', 'Logic',
                            'Feminism', 'Civil_rights_movement', 'Human_rights', 'Freedom_of_speech',
                            'Impressionism', 'Surrealism', 'Expressionism', 'Modernism',
                            'Postmodernism', 'Cubism', 'Abstract_art', 'Pop_art'
                        ],
                        space: [
                            // 19 space pages - solar system, space exploration
                            'Solar_System', 'Sun', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Venus',
                            'Mercury_(planet)', 'Neptune', 'Uranus', 'Pluto', 'Galaxy', 'Milky_Way',
                            'Universe', 'Star', 'Planet', 'NASA', 'Apollo_11', 'International_Space_Station'
                        ],
                        technology: [
                            // 4 technology pages - computing, internet
                            'Computer', 'Internet', 'Artificial_intelligence', 'World_Wide_Web'
                        ],
                        nature: [
                            // 9 nature pages - animals, ecosystems
                            'Dog', 'Cat', 'Lion', 'Tiger', 'Elephant', 'Whale', 'Dinosaur',
                            'Tree', 'Flower'
                        ],
                        sports: [
                            // 5 sports pages - major sports, events, athletes
                            'Olympic_Games', 'FIFA_World_Cup', 'Football', 'Basketball', 'Tennis'
                        ],
                        food: [
                            // 14 food pages - major cuisines, ingredients
                            'Pizza', 'Bread', 'Cheese', 'Chocolate', 'Coffee', 'Tea', 'Beer',
                            'Wine', 'Rice', 'Wheat', 'Italian_cuisine', 'Chinese_cuisine',
                            'French_cuisine', 'Japanese_cuisine'
                        ],
                        media: [
                            // 9 media pages - famous works, franchises
                            'Star_Wars', 'Harry_Potter', 'The_Lord_of_the_Rings', 'Marvel_Comics',
                            'The_Godfather', 'Television', 'Newspaper', 'Radio', 'Book'
                        ],
                        landmarks: [
                            // 6 landmarks - famous structures
                            'Eiffel_Tower', 'Great_Wall_of_China', 'Taj_Mahal', 'Colosseum',
                            'Statue_of_Liberty', 'Pyramids_of_Giza'
                        ],
                        mythology: [
                            // 9 mythology pages - gods, mythological systems
                            'Greek_mythology', 'Norse_mythology', 'Egyptian_mythology',
                            'Roman_mythology', 'Zeus', 'Odin', 'Thor', 'Poseidon', 'Hades'
                        ],
                        philosophy: [
                            // 2 philosophy pages
                            'Rationalism', 'Empiricism'
                        ]
                        // misc: 339 additional pages covering various topics
                    }
                },
                // HARD: Obscure pages from app.js obscurePages array (731 pages total)
                hard: {
                    popularity: 35,
                    categories: {
                        geography: [
                            // 24 geography pages - smaller countries, specific cities
                            'Portugal', 'Norway', 'Denmark', 'Finland', 'Greece', 'Ireland',
                            'New_Zealand', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela',
                            'Thailand', 'Vietnam', 'Philippines', 'Pakistan', 'Bangladesh',
                            'Amsterdam', 'Vienna', 'Prague', 'Budapest', 'Stockholm', 'Lisbon', 'Dublin'
                        ],
                        history: [
                            // 51 history pages - specific battles, lesser-known periods
                            'Pearl_Harbor', 'D-Day', 'Battle_of_Waterloo', 'Korean_War',
                            'Hundred_Years\'_War', 'Thirty_Years\'_War', 'War_of_the_Roses',
                            'Opium_Wars', 'Spanish_Inquisition', 'Black_Death', 'Atlantic_slave_trade',
                            'Suffrage', 'Abolitionism', 'Babylonia', 'Assyria', 'Phoenicia',
                            'Carthage', 'Sumer', 'Akkadian_Empire', 'Hittites', 'Olmec',
                            'Holy_Roman_Empire', 'Meiji_Restoration', 'Qing_dynasty', 'Ming_dynasty',
                            'Tang_dynasty', 'Han_dynasty', 'Mughal_Empire', 'Safavid_dynasty',
                            'Umayyad_Caliphate', 'Abbasid_Caliphate', 'Edo_period', 'Tokugawa_shogunate',
                            'Reconquista', 'Spanish_Empire', 'British_Empire', 'French_colonial_empire',
                            'Russian_Empire', 'Austro-Hungarian_Empire', 'Kingdom_of_Prussia',
                            'Republic_of_Venice', 'Dutch_Golden_Age', 'Age_of_Discovery',
                            'Scientific_Revolution', 'Reformation', 'Counter-Reformation',
                            'Treaty_of_Versailles', 'League_of_Nations', 'United_Nations',
                            'Berlin_Wall', 'Cuban_Missile_Crisis'
                        ],
                        people: [
                            // 318 people - specific scientists, artists, philosophers, leaders
                            'Niels_Bohr', 'Max_Planck', 'Erwin_Schrödinger', 'Werner_Heisenberg',
                            'James_Clerk_Maxwell', 'Michael_Faraday', 'Benjamin_Franklin',
                            'Rosalind_Franklin', 'Jonas_Salk', 'Ada_Lovelace', 'Grace_Hopper',
                            'Alan_Turing', 'John_von_Neumann', 'Kurt_Gödel', 'Pythagoras',
                            'Euclid', 'Archimedes', 'Carl_Friedrich_Gauss', 'Leonhard_Euler',
                            'Pierre_de_Fermat', 'René_Descartes', 'Blaise_Pascal', 'Gottfried_Wilhelm_Leibniz',
                            'Frédéric_Chopin', 'Pyotr_Ilyich_Tchaikovsky', 'Antonio_Vivaldi',
                            'Franz_Schubert', 'Robert_Schumann', 'Johannes_Brahms', 'Gustav_Mahler',
                            'Claude_Monet', 'Rembrandt', 'Salvador_Dalí', 'Frida_Kahlo',
                            'Andy_Warhol', 'Jackson_Pollock', 'Henri_Matisse', 'Paul_Cézanne',
                            'Fyodor_Dostoevsky', 'Victor_Hugo', 'Emily_Dickinson', 'Edgar_Allan_Poe',
                            'J._R._R._Tolkien', 'J._K._Rowling', 'Stephen_King', 'Agatha_Christie',
                            'Isaac_Asimov', 'Ray_Bradbury', 'Miguel_de_Cervantes', 'Geoffrey_Chaucer'
                        ],
                        science: [
                            // 33 science pages - specific fields, phenomena
                            'Magnetism', 'Electricity', 'Neuroscience', 'Biochemistry',
                            'Organic_chemistry', 'Inorganic_chemistry', 'Particle_physics',
                            'Nuclear_physics', 'String_theory', 'Electron', 'Proton', 'Neutron',
                            'Molecule', 'Ion', 'pH', 'Acid', 'Base_(chemistry)', 'Enzyme',
                            'Mitochondrion', 'Chloroplast', 'RNA', 'Taxonomy_(biology)',
                            'Botany', 'Zoology', 'Microbiology', 'Fungus', 'Plate_tectonics',
                            'Glacier', 'Fossil', 'Tornado', 'Tsunami', 'Earthquake', 'Volcano'
                        ],
                        culture: [
                            // 57 culture pages - art movements, musical genres, ideologies
                            'Romanticism', 'Realism', 'Naturalism', 'Symbolism', 'Dadaism',
                            'Futurism', 'Constructivism', 'Minimalism', 'Baroque', 'Renaissance_art',
                            'Gothic_architecture', 'Neoclassicism', 'Art_Nouveau', 'Art_Deco',
                            'Blues', 'Reggae', 'Country_music', 'Electronic_music', 'Folk_music',
                            'Gospel_music', 'Soul_music', 'Punk_rock', 'Heavy_metal_music',
                            'Utilitarianism', 'Pragmatism', 'Idealism', 'Nihilism', 'Humanism',
                            'Nationalism', 'Anarchism', 'Liberalism', 'Conservatism',
                            'Libertarianism', 'Totalitarianism', 'Authoritarianism', 'Theocracy',
                            'Oligarchy', 'Meritocracy', 'Bureaucracy', 'Diplomacy', 'Propaganda',
                            'Censorship', 'Press_freedom', 'Academic_freedom', 'Religious_freedom',
                            'Separation_of_church_and_state', 'Secularism', 'Atheism', 'Agnosticism',
                            'Pantheism', 'Deism', 'Polytheism', 'Monotheism', 'Animism', 'Shamanism'
                        ],
                        landmarks: [
                            // 15 landmarks - famous structures and monuments
                            'Machu_Picchu', 'Petra', 'Stonehenge', 'Big_Ben', 'Notre-Dame_de_Paris',
                            'Sagrada_Família', 'Leaning_Tower_of_Pisa', 'Parthenon',
                            'Acropolis_of_Athens', 'Hagia_Sophia', 'Angkor_Wat', 'Forbidden_City',
                            'Alhambra', 'Tower_of_London', 'Westminster_Abbey'
                        ],
                        mythology: [
                            // 2 mythology pages
                            'Shiva', 'Vishnu'
                        ],
                        philosophy: [
                            // 4 philosophy pages
                            'Immanuel_Kant', 'Friedrich_Nietzsche', 'John_Locke', 'David_Hume'
                        ],
                        sports: [
                            // 1 sports page
                            'Cricket'
                        ],
                        media: [
                            // 4 media pages
                            'Casablanca_(film)', 'Gone_with_the_Wind_(film)', 'Citizen_Kane', 'The_Wizard_of_Oz_(1939_film)'
                        ]
                        // misc: 218 additional pages covering various specific topics
                    }
                },
                // EXPERT: Ultra obscure pages from app.js ultraObscurePages array (649 pages total)
                expert: {
                    popularity: 15,
                    categories: {
                        geography: [
                            // 7 geography pages - very small countries, obscure regions
                            'Luxembourg', 'Monaco', 'Andorra', 'Liechtenstein', 'San_Marino',
                            'Bhutan', 'Montenegro'
                        ],
                        history: [
                            // 22 history pages - very specific events, obscure periods
                            'War_of_the_Spanish_Succession', 'War_of_the_Austrian_Succession',
                            'Seven_Years\'_War', 'Crimean_War', 'Russo-Turkish_War_(1877–1878)',
                            'First_Balkan_War', 'Second_Balkan_War', 'Boxer_Rebellion',
                            'Taiping_Rebellion', 'Meiji_era', 'Taishō_period', 'Shōwa_period',
                            'Heian_period', 'Kamakura_period', 'Muromachi_period', 'Azuchi–Momoyama_period',
                            'Sengoku_period', 'Ashikaga_shogunate', 'Siege_of_Vienna', 'Battle_of_Hastings',
                            'Battle_of_Thermopylae', 'Battle_of_Marathon'
                        ],
                        people: [
                            // 379 people - very specific historical figures, niche academics
                            'Thomas_Aquinas', 'Baruch_Spinoza', 'John_Stuart_Mill', 'Carl_Jung',
                            'Arthur_Schopenhauer', 'Søren_Kierkegaard', 'Martin_Heidegger',
                            'Jean-Paul_Sartre', 'Albert_Camus', 'Michel_Foucault', 'Jacques_Derrida',
                            'Ludwig_Wittgenstein', 'Bertrand_Russell', 'Edmund_Husserl',
                            'Georg_Wilhelm_Friedrich_Hegel', 'Johann_Gottlieb_Fichte',
                            'Friedrich_Wilhelm_Joseph_Schelling', 'Gotthold_Ephraim_Lessing',
                            'Theodor_W._Adorno', 'Max_Horkheimer', 'Walter_Benjamin', 'Hannah_Arendt',
                            'Peter_the_Great', 'Frederick_the_Great', 'Charles_V,_Holy_Roman_Emperor',
                            'Philip_II_of_Spain', 'Louis_XIV', 'Maria_Theresa', 'Charles_XII_of_Sweden',
                            'Gustavus_Adolphus', 'Suleiman_the_Magnificent', 'Mehmed_II',
                            'Akbar', 'Shah_Jahan', 'Aurangzeb', 'Babur', 'Timur', 'Saladin',
                            'Richard_I_of_England', 'Henry_VIII', 'Mary_I_of_England',
                            'Edward_I_of_England', 'William_the_Conqueror', 'Charlemagne',
                            'Otto_von_Bismarck', 'Klemens_von_Metternich', 'Cardinal_Richelieu'
                        ],
                        science: [
                            // 10 science pages - advanced mathematical/scientific concepts
                            'Fibonacci_number', 'Golden_ratio', 'Prime_number', 'Set_theory',
                            'Number_theory', 'Topology', 'Group_theory', 'Game_theory',
                            'Information_theory', 'Chaos_theory'
                        ],
                        culture: [
                            // 30 culture pages - niche movements, specific ideologies
                            'Mannerism', 'Rococo', 'Pre-Raphaelite_Brotherhood', 'Fauvism',
                            'Orphism_(art)', 'Suprematism', 'De_Stijl', 'Bauhaus', 'Dada',
                            'Fluxus', 'Arte_Povera', 'Land_art', 'Video_art', 'Performance_art',
                            'Swing_music', 'Bebop', 'Cool_jazz', 'Free_jazz', 'Modal_jazz',
                            'Syndicalism', 'Mutualism_(economic_theory)', 'Distributism',
                            'Corporatism', 'Technocracy', 'Plutocracy', 'Kleptocracy',
                            'Ochlocracy', 'Timocracy', 'Stratocracy', 'Gerontocracy'
                        ],
                        space: [
                            // 5 space pages - specific celestial objects/phenomena
                            'Asteroid_belt', 'Kuiper_belt', 'Oort_cloud', 'Supernova',
                            'Neutron_star'
                        ],
                        technology: [
                            // 3 technology pages - specific innovations
                            'Transistor', 'Integrated_circuit', 'Microprocessor'
                        ],
                        nature: [
                            // 1 nature page
                            'Platypus'
                        ],
                        food: [
                            // 2 food pages
                            'Sushi', 'Pasta'
                        ],
                        mythology: [
                            // 4 mythology pages
                            'Hermes', 'Athena', 'Apollo', 'Artemis'
                        ]
                        // misc: 186 additional pages covering highly specialized topics
                    }
                }
            }
        };
    }
    
    // Calculate difficulty based on tier combination (Updated for 3-tier system: mega/easy/hard/expert)
    calculateTierDifficulty(startTier, targetTier) {
        const tierValues = {
            'mega': 0,
            'easy': 1,
            'hard': 2,
            'expert': 3
        };
        
        const startValue = tierValues[startTier] || 1;
        const targetValue = tierValues[targetTier] || 1;
        
        // Average tier distance (both directions matter)
        const avgTier = (startValue + targetValue) / 2;
        
        // Difficulty mapping for 3-tier system:
        // 0.0 = Both mega hubs → 0.7x (very easy)
        // 0.5 = One mega, one easy → 0.8x
        // 1.0 = Both easy → 0.9x
        // 1.5 = Easy + hard → 1.2x
        // 2.0 = Both hard → 1.5x (baseline)
        // 2.5 = Hard + expert → 2.0x
        // 3.0 = Both expert → 3.0x (very hard)
        
        if (avgTier <= 0.5) return 0.7;
        if (avgTier <= 1.0) return 0.9;
        if (avgTier <= 1.5) return 1.2;
        if (avgTier <= 2.0) return 1.5;
        if (avgTier <= 2.5) return 2.0;
        if (avgTier <= 3.0) return 2.0;
        if (avgTier <= 3.5) return 2.4;
        return 2.8;
    }
    
    // Get relationship between categories (affects path-finding difficulty)
    getCategoryRelationship(cat1, cat2) {
        // Same category = easier
        if (cat1 === cat2) return 0.85;
        
        // Define related category clusters
        const clusters = [
            ['geography', 'history', 'people'],  // Human-centric topics
            ['science', 'space', 'people'],      // Scientific topics
            ['culture', 'people', 'history'],    // Cultural topics
            ['history', 'geography', 'culture'], // Historical context
            ['science', 'culture', 'history']    // Knowledge topics
        ];
        
        // Check if categories are in the same cluster
        const inSameCluster = clusters.some(cluster => 
            cluster.includes(cat1) && cluster.includes(cat2)
        );
        
        if (inSameCluster) return 0.95; // Slightly easier
        if (cat1 === 'core' || cat2 === 'core') return 0.90; // Core connects everything
        if (cat1 === 'unknown' || cat2 === 'unknown') return 1.10; // Unknown is harder
        
        return 1.05; // Unrelated but not too hard
    }
    
    // Popularity modifier based on how well-known the pages are
    getPopularityModifier(startPop, targetPop) {
        const avgPopularity = (startPop + targetPop) / 2;
        
        // High popularity (>75) → easier (0.90x)
        // Medium popularity (40-75) → normal (1.00x)
        // Low popularity (<40) → harder (1.15x)
        
        if (avgPopularity >= 75) return 0.90;
        if (avgPopularity >= 50) return 0.95;
        if (avgPopularity >= 40) return 1.00;
        if (avgPopularity >= 25) return 1.08;
        return 1.15;
    }

    // Get top N entries filtered by game mode
    async getTopScores(limit = 10, gameMode = 'normal') {
        const leaderboard = await this.fetchLeaderboard();
        // Filter by game mode (entries without gameMode are considered 'normal')
        const filtered = leaderboard.entries.filter(e => (e.gameMode || 'normal') === gameMode);
        return filtered.slice(0, limit);
    }

    // Get player's rank and surrounding entries
    async getPlayerContext(playerName, limit = 5, gameMode = 'normal') {
        const leaderboard = await this.fetchLeaderboard();
        // Filter by game mode first
        const filtered = leaderboard.entries.filter(e => (e.gameMode || 'normal') === gameMode);
        const playerEntries = filtered.filter(
            e => e.playerName.toLowerCase() === playerName.toLowerCase()
        );
        
        if (playerEntries.length === 0) {
            return null;
        }

        // Get the best entry for this player
        const bestEntry = playerEntries[0];
        const rank = filtered.findIndex(e => e.id === bestEntry.id) + 1;
        
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

    async submitScore(playerName, startPage, targetPage, clicks, timeInSeconds, gameMode = 'normal', useAPI = true) {
        const leaderboard = await this.fetchLeaderboard();
        
        // Calculate score with difficulty adjustment (using Wikipedia API for accurate categories)
        const score = await this.calculateScore(clicks, timeInSeconds, startPage, targetPage, useAPI);
        
        // Mode multipliers: Normal (1.0x), Hard (1.5x), Ultra (2.0x)
        let modeMultiplier = 1.0;
        if (gameMode === 'hard') {
            modeMultiplier = 1.5;
        } else if (gameMode === 'ultra') {
            modeMultiplier = 2.0;
        }
        const finalScore = Math.round(score * modeMultiplier);
        
        const newEntry = {
            id: Date.now().toString(),
            playerName: playerName.trim().substring(0, 20) || 'Anonymous',
            startPage,
            targetPage,
            clicks,
            time: timeInSeconds,
            score: finalScore,
            difficulty: await this.estimateDifficulty(startPage, targetPage, useAPI),
            gameMode: gameMode,  // Store game mode
            timestamp: new Date().toISOString()
        };
        
        leaderboard.entries.push(newEntry);
        // Sort by score (HIGHER is better!)
        leaderboard.entries.sort((a, b) => b.score - a.score);
        leaderboard.entries = leaderboard.entries.slice(0, 200); // Keep more entries for two modes
        
        localStorage.setItem(this.storageKey, JSON.stringify(leaderboard));
        
        // Find the rank within the game mode
        const modeEntries = leaderboard.entries.filter(e => (e.gameMode || 'normal') === gameMode);
        const rank = modeEntries.findIndex(e => e.id === newEntry.id) + 1;
        return { success: true, rank, entry: newEntry };
    }

    async getTopScores(limit = 10, gameMode = 'normal') {
        const leaderboard = await this.fetchLeaderboard();
        // Filter by game mode (entries without gameMode are considered 'normal')
        const filtered = leaderboard.entries.filter(e => (e.gameMode || 'normal') === gameMode);
        return filtered.slice(0, limit);
    }
    
    // Dynamic scoring methods - same as LeaderboardManager (with API support)
    async calculateScore(clicks, timeInSeconds, startPage = '', targetPage = '', useAPI = true) {
        const clickEfficiency = 1000 / Math.max(clicks, 1);
        const timeBonus = this.calculateTimeBonus(clicks, timeInSeconds);
        const difficulty = await this.estimateDifficulty(startPage, targetPage, useAPI);
        const score = Math.round(clickEfficiency * difficulty * timeBonus);
        return score;
    }
    
    calculateTimeBonus(clicks, timeInSeconds) {
        const expectedTime = clicks * 15;
        const speedRatio = expectedTime / Math.max(timeInSeconds, 1);
        
        let timeBonus;
        
        if (speedRatio >= 2.0) {
            timeBonus = 2.5 + Math.min(0.5, (speedRatio - 2.0) * 0.2);
        } else if (speedRatio >= 1.5) {
            timeBonus = 2.0 + (speedRatio - 1.5) * 1.0;
        } else if (speedRatio >= 1.0) {
            timeBonus = 1.5 + (speedRatio - 1.0) * 1.0;
        } else if (speedRatio >= 0.5) {
            timeBonus = 1.0 + (speedRatio - 0.5) * 1.0;
        } else {
            timeBonus = Math.max(0.5, speedRatio * 2.0);
        }
        
        return timeBonus;
    }
    
    // Use the same new difficulty system as LeaderboardManager (with Wikipedia API)
    async estimateDifficulty(startPage, targetPage, useAPI = true) {
        const normalizePageName = (page) => page.toLowerCase().replace(/_/g, ' ').trim();
        const start = normalizePageName(startPage);
        const target = normalizePageName(targetPage);
        
        const startInfo = await this.getPageMetadata(start, useAPI);
        const targetInfo = await this.getPageMetadata(target, useAPI);
        
        let baseDifficulty = this.calculateTierDifficulty(startInfo.tier, targetInfo.tier);
        const categoryModifier = this.getCategoryRelationship(startInfo.category, targetInfo.category);
        baseDifficulty *= categoryModifier;
        
        const popularityModifier = this.getPopularityModifier(startInfo.popularity, targetInfo.popularity);
        baseDifficulty *= popularityModifier;
        
        return Math.max(0.7, Math.min(3.0, baseDifficulty));
    }
    
    // Fetch Wikipedia categories - same as LeaderboardManager
    async fetchWikipediaCategories(pageName) {
        try {
            const normalizedPage = pageName.replace(/ /g, '_');
            const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(normalizedPage)}&prop=categories&cllimit=50&format=json&origin=*`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) return [];
            
            const data = await response.json();
            const pages = data.query?.pages;
            if (!pages) return [];
            
            const pageId = Object.keys(pages)[0];
            const categories = pages[pageId]?.categories || [];
            
            return categories.map(cat => cat.title.replace('Category:', '').toLowerCase());
        } catch (error) {
            console.warn(`Error fetching categories for ${pageName}:`, error);
            return [];
        }
    }
    
    // Determine category from API - same as LeaderboardManager
    determineCategoryFromAPI(apiCategories) {
        if (!apiCategories || apiCategories.length === 0) return 'unknown';
        
        const categoriesStr = apiCategories.join(' ');
        
        if (categoriesStr.match(/\b(countries|cities|geography|continents|rivers|mountains|islands|regions|states|provinces)\b/)) return 'geography';
        if (categoriesStr.match(/\b(history|historical|wars|battles|empires|dynasties|revolutions|ancient|medieval)\b/)) return 'history';
        if (categoriesStr.match(/\b(science|physics|chemistry|biology|mathematics|scientific|theories|scientists)\b/)) return 'science';
        if (categoriesStr.match(/\b(births|deaths|people|politicians|artists|writers|musicians|philosophers|scientists|leaders)\b/)) return 'people';
        if (categoriesStr.match(/\b(culture|art|music|literature|religion|philosophy|architecture|painting|sculpture)\b/)) return 'culture';
        if (categoriesStr.match(/\b(astronomy|planets|stars|galaxies|space|solar system|celestial)\b/)) return 'space';
        if (categoriesStr.match(/\b(technology|computing|computers|software|internet|engineering)\b/)) return 'technology';
        if (categoriesStr.match(/\b(animals|plants|nature|wildlife|fauna|flora|biology)\b/)) return 'nature';
        if (categoriesStr.match(/\b(sports|athletes|football|basketball|tennis|olympic|competitions)\b/)) return 'sports';
        if (categoriesStr.match(/\b(food|cuisine|dishes|ingredients|cooking|culinary)\b/)) return 'food';
        if (categoriesStr.match(/\b(films|movies|television|books|novels|media|entertainment)\b/)) return 'media';
        if (categoriesStr.match(/\b(buildings|monuments|landmarks|structures|towers|temples|palaces)\b/)) return 'landmarks';
        if (categoriesStr.match(/\b(mythology|mythological|deities|gods|goddesses)\b/)) return 'mythology';
        
        return 'unknown';
    }
    
    async getPageMetadata(pageName, useAPI = true) {
        let category = 'unknown';
        
        // Fetch real Wikipedia categories if API usage is enabled
        if (useAPI) {
            const apiCategories = await this.fetchWikipediaCategories(pageName);
            if (apiCategories.length > 0) {
                category = this.determineCategoryFromAPI(apiCategories);
            }
        }
        
        // If API didn't work or returned unknown, fall back to keyword guessing
        if (category === 'unknown') {
            category = this.guessCategory(pageName);
        }
        
        // First, try to get the actual arrays from the game (if available in global scope)
        if (typeof popularPages !== 'undefined' && typeof obscurePages !== 'undefined' && typeof ultraObscurePages !== 'undefined') {
            const normalizedPage = pageName.replace(/ /g, '_');
            
            // Check if page is in any of the actual game arrays
            if (popularPages.includes(normalizedPage)) {
                return { tier: 'easy', category: category, popularity: 85 };
            }
            if (obscurePages.includes(normalizedPage)) {
                return { tier: 'hard', category: category, popularity: 35 };
            }
            if (ultraObscurePages.includes(normalizedPage)) {
                return { tier: 'expert', category: category, popularity: 15 };
            }
        }
        
        // Fallback: Check against knowledge base samples
        const pageData = this.getWikipediaKnowledge();
        
        for (const [tier, data] of Object.entries(pageData.tiers)) {
            for (const [categoryName, pages] of Object.entries(data.categories)) {
                const found = pages.some(p => {
                    const normalizedP = p.toLowerCase().replace(/_/g, ' ');
                    return normalizedP === pageName || 
                           pageName.includes(normalizedP) || 
                           normalizedP.includes(pageName);
                });
                
                if (found) {
                    return { tier: tier, category: category !== 'unknown' ? category : categoryName, popularity: data.popularity };
                }
            }
        }
        
        return { tier: 'easy', category: category, popularity: 50 };
    }
    
    // Guess category based on page name keywords (same as LeaderboardManager)
    guessCategory(pageName) {
        const normalized = pageName.toLowerCase();
        
        if (normalized.match(/\b(country|city|state|province|river|mountain|ocean|sea|continent|island|desert|forest|lake)\b/) ||
            normalized.match(/\b(africa|asia|europe|america|oceania|antarctica)\b/)) {
            return 'geography';
        }
        if (normalized.match(/\b(war|battle|empire|dynasty|revolution|age|period|era|ancient|medieval|civilization)\b/) ||
            normalized.match(/\b(treaty|kingdom|republic)\b/)) {
            return 'history';
        }
        if (normalized.match(/\b(physics|chemistry|biology|mathematics|science|theory|atom|molecule|cell|evolution|quantum)\b/) ||
            normalized.match(/\b(equation|formula|law|principle)\b/)) {
            return 'science';
        }
        if (normalized.match(/\b(art|music|literature|philosophy|religion|culture|painting|sculpture|architecture)\b/) ||
            normalized.match(/\b(christianity|islam|buddhism|hinduism|judaism|democracy|capitalism|socialism)\b/)) {
            return 'culture';
        }
        if (normalized.match(/\b(planet|star|galaxy|moon|sun|solar|space|universe|asteroid|comet|nebula)\b/) ||
            normalized.match(/\b(mars|jupiter|saturn|venus|mercury|neptune|uranus|pluto|nasa)\b/)) {
            return 'space';
        }
        if (normalized.match(/\b(computer|internet|technology|software|hardware|programming|algorithm|artificial|intelligence)\b/)) {
            return 'technology';
        }
        if (normalized.match(/\b(animal|plant|tree|flower|dog|cat|lion|tiger|elephant|whale|dinosaur|bird|fish)\b/)) {
            return 'nature';
        }
        if (normalized.match(/\b(sport|football|basketball|tennis|olympic|soccer|baseball|cricket|rugby|golf)\b/)) {
            return 'sports';
        }
        if (normalized.match(/\b(food|cuisine|pizza|pasta|bread|cheese|coffee|tea|beer|wine|rice|wheat)\b/)) {
            return 'food';
        }
        if (normalized.match(/\b(film|movie|television|tv|book|novel|newspaper|radio|magazine|star wars|harry potter)\b/)) {
            return 'media';
        }
        if (normalized.match(/\b(tower|palace|temple|pyramid|monument|statue|cathedral|building)\b/)) {
            return 'landmarks';
        }
        if (normalized.match(/\b(mythology|myth|god|goddess|zeus|odin|thor|athena|apollo|poseidon)\b/)) {
            return 'mythology';
        }
        if (normalized.match(/\b(king|queen|president|emperor|saint|sir|lord|prince|princess)\b/) ||
            normalized.split('_').length >= 2) {
            return 'people';
        }
        
        return 'unknown';
    }
    
    // Use the same expanded knowledge base as LeaderboardManager
    getWikipediaKnowledge() {
        // Return the same 3-tier structure for consistency with main LeaderboardManager
        return {
            tiers: {
                mega: {
                    popularity: 100,
                    categories: {
                        core: ['United_States', 'World_War_II', 'World_War_I', 'Europe', 'Asia', 'Earth', 
                               'Science', 'History', 'Human', 'Language', 'Country', 'City', 'War']
                    }
                },
                easy: {
                    popularity: 85,
                    categories: {
                        geography: [
                            'France', 'Germany', 'China', 'Japan', 'India', 'Russia', 'United_Kingdom',
                            'Brazil', 'Canada', 'Australia', 'Mexico', 'Italy', 'Spain', 'Africa',
                            'Antarctica', 'North_America', 'South_America', 'Oceania', 'Asia', 'Europe',
                            'London', 'Paris', 'New_York_City', 'Tokyo', 'Berlin', 'Moscow', 'Beijing',
                            'Rome', 'Los_Angeles', 'Chicago', 'San_Francisco'
                        ],
                        history: [
                            'Ancient_Rome', 'Ancient_Egypt', 'Ancient_Greece', 'Renaissance',
                            'Industrial_Revolution', 'Cold_War', 'Vietnam_War', 'French_Revolution',
                            'American_Revolution', 'American_Civil_War', 'Great_Depression',
                            'The_Holocaust', 'Space_Race', 'Age_of_Enlightenment', 'Crusades',
                            'Protestant_Reformation', 'Middle_Ages', 'Roman_Empire', 'Byzantine_Empire',
                            'Ottoman_Empire', 'Mongol_Empire', 'Persian_Empire', 'Viking_Age',
                            'Mesopotamia', 'Maya_civilization', 'Inca_Empire', 'Aztec', 'Colonialism',
                            'Imperialism', 'Fascism', 'Communism'
                        ],
                        people: [
                            'Albert_Einstein', 'Isaac_Newton', 'Charles_Darwin', 'Galileo_Galilei',
                            'Leonardo_da_Vinci', 'William_Shakespeare', 'Napoleon', 'Julius_Caesar',
                            'Cleopatra', 'Alexander_the_Great', 'Genghis_Khan', 'Winston_Churchill',
                            'Abraham_Lincoln', 'George_Washington', 'Martin_Luther_King_Jr.',
                            'Mahatma_Gandhi', 'Nelson_Mandela', 'Adolf_Hitler', 'Joseph_Stalin',
                            'Mao_Zedong', 'Karl_Marx', 'Socrates', 'Plato', 'Aristotle',
                            'Confucius', 'Sigmund_Freud', 'Nikola_Tesla', 'Thomas_Edison',
                            'Marie_Curie', 'Stephen_Hawking', 'Pablo_Picasso', 'Vincent_van_Gogh',
                            'Michelangelo', 'Wolfgang_Amadeus_Mozart', 'Ludwig_van_Beethoven',
                            'Johann_Sebastian_Bach', 'The_Beatles', 'Elvis_Presley', 'Bob_Dylan',
                            'Michael_Jackson', 'Queen_Victoria', 'Elizabeth_II', 'Catherine_the_Great'
                        ],
                        science: [
                            'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Evolution', 'DNA',
                            'Gravity', 'Atom', 'Quantum_mechanics', 'Theory_of_relativity',
                            'Photosynthesis', 'Natural_selection', 'Periodic_table', 'Ecology',
                            'Genetics', 'Cell_(biology)', 'Energy', 'Force', 'Thermodynamics',
                            'Electromagnetism', 'Black_hole', 'Big_Bang', 'Climate_change',
                            'Nuclear_fission', 'Nuclear_fusion', 'Vaccine'
                        ],
                        culture: [
                            'Religion', 'Christianity', 'Islam', 'Buddhism', 'Hinduism', 'Judaism',
                            'Philosophy', 'Art', 'Music', 'Literature', 'Architecture', 'Theatre',
                            'Cinema', 'Painting', 'Sculpture', 'Democracy', 'Capitalism', 'Socialism',
                            'Feudalism', 'Monarchy', 'Republic', 'Poetry', 'Drama', 'Novel',
                            'Opera', 'Ballet', 'Classical_music', 'Rock_music', 'Jazz', 'Hip_hop',
                            'Existentialism', 'Stoicism', 'Ethics', 'Metaphysics', 'Logic',
                            'Feminism', 'Civil_rights_movement', 'Human_rights', 'Freedom_of_speech',
                            'Impressionism', 'Surrealism', 'Expressionism', 'Modernism',
                            'Postmodernism', 'Cubism', 'Abstract_art', 'Pop_art'
                        ],
                        space: [
                            'Solar_System', 'Sun', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Venus',
                            'Mercury_(planet)', 'Neptune', 'Uranus', 'Pluto', 'Galaxy', 'Milky_Way',
                            'Universe', 'Star', 'Planet', 'NASA', 'Apollo_11', 'International_Space_Station'
                        ],
                        technology: [
                            'Computer', 'Internet', 'Artificial_intelligence', 'World_Wide_Web'
                        ],
                        nature: [
                            'Dog', 'Cat', 'Lion', 'Tiger', 'Elephant', 'Whale', 'Dinosaur',
                            'Tree', 'Flower'
                        ],
                        sports: [
                            'Olympic_Games', 'FIFA_World_Cup', 'Football', 'Basketball', 'Tennis'
                        ],
                        food: [
                            'Pizza', 'Bread', 'Cheese', 'Chocolate', 'Coffee', 'Tea', 'Beer',
                            'Wine', 'Rice', 'Wheat', 'Italian_cuisine', 'Chinese_cuisine',
                            'French_cuisine', 'Japanese_cuisine'
                        ],
                        media: [
                            'Star_Wars', 'Harry_Potter', 'The_Lord_of_the_Rings', 'Marvel_Comics',
                            'The_Godfather', 'Television', 'Newspaper', 'Radio', 'Book'
                        ],
                        landmarks: [
                            'Eiffel_Tower', 'Great_Wall_of_China', 'Taj_Mahal', 'Colosseum',
                            'Statue_of_Liberty', 'Pyramids_of_Giza'
                        ],
                        mythology: [
                            'Greek_mythology', 'Norse_mythology', 'Egyptian_mythology',
                            'Roman_mythology', 'Zeus', 'Odin', 'Thor', 'Poseidon', 'Hades'
                        ],
                        philosophy: [
                            'Rationalism', 'Empiricism'
                        ]
                    }
                },
                hard: {
                    popularity: 35,
                    categories: {
                        geography: [
                            'Portugal', 'Norway', 'Denmark', 'Finland', 'Greece', 'Ireland',
                            'New_Zealand', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela',
                            'Thailand', 'Vietnam', 'Philippines', 'Pakistan', 'Bangladesh',
                            'Amsterdam', 'Vienna', 'Prague', 'Budapest', 'Stockholm', 'Lisbon', 'Dublin'
                        ],
                        history: [
                            'Pearl_Harbor', 'D-Day', 'Battle_of_Waterloo', 'Korean_War',
                            'Hundred_Years\'_War', 'Thirty_Years\'_War', 'War_of_the_Roses',
                            'Opium_Wars', 'Spanish_Inquisition', 'Black_Death', 'Atlantic_slave_trade',
                            'Suffrage', 'Abolitionism', 'Babylonia', 'Assyria', 'Phoenicia',
                            'Carthage', 'Sumer', 'Akkadian_Empire', 'Hittites', 'Olmec',
                            'Holy_Roman_Empire', 'Meiji_Restoration', 'Qing_dynasty', 'Ming_dynasty',
                            'Tang_dynasty', 'Han_dynasty', 'Mughal_Empire', 'Safavid_dynasty',
                            'Umayyad_Caliphate', 'Abbasid_Caliphate', 'Edo_period', 'Tokugawa_shogunate',
                            'Reconquista', 'Spanish_Empire', 'British_Empire', 'French_colonial_empire',
                            'Russian_Empire', 'Austro-Hungarian_Empire', 'Kingdom_of_Prussia',
                            'Republic_of_Venice', 'Dutch_Golden_Age', 'Age_of_Discovery',
                            'Scientific_Revolution', 'Reformation', 'Counter-Reformation',
                            'Treaty_of_Versailles', 'League_of_Nations', 'United_Nations',
                            'Berlin_Wall', 'Cuban_Missile_Crisis'
                        ],
                        people: [
                            'Niels_Bohr', 'Max_Planck', 'Erwin_Schrödinger', 'Werner_Heisenberg',
                            'James_Clerk_Maxwell', 'Michael_Faraday', 'Benjamin_Franklin',
                            'Rosalind_Franklin', 'Jonas_Salk', 'Ada_Lovelace', 'Grace_Hopper',
                            'Alan_Turing', 'John_von_Neumann', 'Kurt_Gödel', 'Pythagoras',
                            'Euclid', 'Archimedes', 'Carl_Friedrich_Gauss', 'Leonhard_Euler',
                            'Pierre_de_Fermat', 'René_Descartes', 'Blaise_Pascal', 'Gottfried_Wilhelm_Leibniz',
                            'Frédéric_Chopin', 'Pyotr_Ilyich_Tchaikovsky', 'Antonio_Vivaldi',
                            'Franz_Schubert', 'Robert_Schumann', 'Johannes_Brahms', 'Gustav_Mahler',
                            'Claude_Monet', 'Rembrandt', 'Salvador_Dalí', 'Frida_Kahlo',
                            'Andy_Warhol', 'Jackson_Pollock', 'Henri_Matisse', 'Paul_Cézanne',
                            'Fyodor_Dostoevsky', 'Victor_Hugo', 'Emily_Dickinson', 'Edgar_Allan_Poe',
                            'J._R._R._Tolkien', 'J._K._Rowling', 'Stephen_King', 'Agatha_Christie',
                            'Isaac_Asimov', 'Ray_Bradbury', 'Miguel_de_Cervantes', 'Geoffrey_Chaucer'
                        ],
                        science: [
                            'Magnetism', 'Electricity', 'Neuroscience', 'Biochemistry',
                            'Organic_chemistry', 'Inorganic_chemistry', 'Particle_physics',
                            'Nuclear_physics', 'String_theory', 'Electron', 'Proton', 'Neutron',
                            'Molecule', 'Ion', 'pH', 'Acid', 'Base_(chemistry)', 'Enzyme',
                            'Mitochondrion', 'Chloroplast', 'RNA', 'Taxonomy_(biology)',
                            'Botany', 'Zoology', 'Microbiology', 'Fungus', 'Plate_tectonics',
                            'Glacier', 'Fossil', 'Tornado', 'Tsunami', 'Earthquake', 'Volcano'
                        ],
                        culture: [
                            'Romanticism', 'Realism', 'Naturalism', 'Symbolism', 'Dadaism',
                            'Futurism', 'Constructivism', 'Minimalism', 'Baroque', 'Renaissance_art',
                            'Gothic_architecture', 'Neoclassicism', 'Art_Nouveau', 'Art_Deco',
                            'Blues', 'Reggae', 'Country_music', 'Electronic_music', 'Folk_music',
                            'Gospel_music', 'Soul_music', 'Punk_rock', 'Heavy_metal_music',
                            'Utilitarianism', 'Pragmatism', 'Idealism', 'Nihilism', 'Humanism',
                            'Nationalism', 'Anarchism', 'Liberalism', 'Conservatism',
                            'Libertarianism', 'Totalitarianism', 'Authoritarianism', 'Theocracy',
                            'Oligarchy', 'Meritocracy', 'Bureaucracy', 'Diplomacy', 'Propaganda',
                            'Censorship', 'Press_freedom', 'Academic_freedom', 'Religious_freedom',
                            'Separation_of_church_and_state', 'Secularism', 'Atheism', 'Agnosticism',
                            'Pantheism', 'Deism', 'Polytheism', 'Monotheism', 'Animism', 'Shamanism'
                        ],
                        landmarks: [
                            'Machu_Picchu', 'Petra', 'Stonehenge', 'Big_Ben', 'Notre-Dame_de_Paris',
                            'Sagrada_Família', 'Leaning_Tower_of_Pisa', 'Parthenon',
                            'Acropolis_of_Athens', 'Hagia_Sophia', 'Angkor_Wat', 'Forbidden_City',
                            'Alhambra', 'Tower_of_London', 'Westminster_Abbey'
                        ],
                        mythology: [
                            'Shiva', 'Vishnu'
                        ],
                        philosophy: [
                            'Immanuel_Kant', 'Friedrich_Nietzsche', 'John_Locke', 'David_Hume'
                        ],
                        sports: [
                            'Cricket'
                        ],
                        media: [
                            'Casablanca_(film)', 'Gone_with_the_Wind_(film)', 'Citizen_Kane', 'The_Wizard_of_Oz_(1939_film)'
                        ]
                    }
                },
                expert: {
                    popularity: 15,
                    categories: {
                        geography: [
                            'Luxembourg', 'Monaco', 'Andorra', 'Liechtenstein', 'San_Marino',
                            'Bhutan', 'Montenegro'
                        ],
                        history: [
                            'War_of_the_Spanish_Succession', 'War_of_the_Austrian_Succession',
                            'Seven_Years\'_War', 'Crimean_War', 'Russo-Turkish_War_(1877–1878)',
                            'First_Balkan_War', 'Second_Balkan_War', 'Boxer_Rebellion',
                            'Taiping_Rebellion', 'Meiji_era', 'Taishō_period', 'Shōwa_period',
                            'Heian_period', 'Kamakura_period', 'Muromachi_period', 'Azuchi–Momoyama_period',
                            'Sengoku_period', 'Ashikaga_shogunate', 'Siege_of_Vienna', 'Battle_of_Hastings',
                            'Battle_of_Thermopylae', 'Battle_of_Marathon'
                        ],
                        people: [
                            'Thomas_Aquinas', 'Baruch_Spinoza', 'John_Stuart_Mill', 'Carl_Jung',
                            'Arthur_Schopenhauer', 'Søren_Kierkegaard', 'Martin_Heidegger',
                            'Jean-Paul_Sartre', 'Albert_Camus', 'Michel_Foucault', 'Jacques_Derrida',
                            'Ludwig_Wittgenstein', 'Bertrand_Russell', 'Edmund_Husserl',
                            'Georg_Wilhelm_Friedrich_Hegel', 'Johann_Gottlieb_Fichte',
                            'Friedrich_Wilhelm_Joseph_Schelling', 'Gotthold_Ephraim_Lessing',
                            'Theodor_W._Adorno', 'Max_Horkheimer', 'Walter_Benjamin', 'Hannah_Arendt',
                            'Peter_the_Great', 'Frederick_the_Great', 'Charles_V,_Holy_Roman_Emperor',
                            'Philip_II_of_Spain', 'Louis_XIV', 'Maria_Theresa', 'Charles_XII_of_Sweden',
                            'Gustavus_Adolphus', 'Suleiman_the_Magnificent', 'Mehmed_II',
                            'Akbar', 'Shah_Jahan', 'Aurangzeb', 'Babur', 'Timur', 'Saladin',
                            'Richard_I_of_England', 'Henry_VIII', 'Mary_I_of_England',
                            'Edward_I_of_England', 'William_the_Conqueror', 'Charlemagne',
                            'Otto_von_Bismarck', 'Klemens_von_Metternich', 'Cardinal_Richelieu'
                        ],
                        science: [
                            'Fibonacci_number', 'Golden_ratio', 'Prime_number', 'Set_theory',
                            'Number_theory', 'Topology', 'Group_theory', 'Game_theory',
                            'Information_theory', 'Chaos_theory'
                        ],
                        culture: [
                            'Mannerism', 'Rococo', 'Pre-Raphaelite_Brotherhood', 'Fauvism',
                            'Orphism_(art)', 'Suprematism', 'De_Stijl', 'Bauhaus', 'Dada',
                            'Fluxus', 'Arte_Povera', 'Land_art', 'Video_art', 'Performance_art',
                            'Swing_music', 'Bebop', 'Cool_jazz', 'Free_jazz', 'Modal_jazz',
                            'Syndicalism', 'Mutualism_(economic_theory)', 'Distributism',
                            'Corporatism', 'Technocracy', 'Plutocracy', 'Kleptocracy',
                            'Ochlocracy', 'Timocracy', 'Stratocracy', 'Gerontocracy'
                        ],
                        space: [
                            'Asteroid_belt', 'Kuiper_belt', 'Oort_cloud', 'Supernova',
                            'Neutron_star'
                        ],
                        technology: [
                            'Transistor', 'Integrated_circuit', 'Microprocessor'
                        ],
                        nature: [
                            'Platypus'
                        ],
                        food: [
                            'Sushi', 'Pasta'
                        ],
                        mythology: [
                            'Hermes', 'Athena', 'Apollo', 'Artemis'
                        ]
                    }
                }
            }
        };
    }
    
    calculateTierDifficulty(startTier, targetTier) {
        const tierValues = {
            'mega': 0,
            'easy': 1,
            'hard': 2,
            'expert': 3
        };
        
        const startValue = tierValues[startTier] || 1;
        const targetValue = tierValues[targetTier] || 1;
        const avgTier = (startValue + targetValue) / 2;
        
        if (avgTier <= 0.5) return 0.7;
        if (avgTier <= 1.0) return 0.9;
        if (avgTier <= 1.5) return 1.2;
        if (avgTier <= 2.0) return 1.5;
        if (avgTier <= 2.5) return 2.0;
        if (avgTier <= 3.0) return 2.0;
        if (avgTier <= 3.5) return 2.4;
        return 2.8;
    }
    
    getCategoryRelationship(cat1, cat2) {
        if (cat1 === cat2) return 0.85;
        
        const clusters = [
            ['geography', 'history', 'people'],
            ['science', 'space', 'people'],
            ['culture', 'people', 'history'],
            ['history', 'geography', 'culture'],
            ['science', 'culture', 'history']
        ];
        
        const inSameCluster = clusters.some(cluster => 
            cluster.includes(cat1) && cluster.includes(cat2)
        );
        
        if (inSameCluster) return 0.95;
        if (cat1 === 'core' || cat2 === 'core') return 0.90;
        if (cat1 === 'unknown' || cat2 === 'unknown') return 1.10;
        
        return 1.05;
    }
    
    getPopularityModifier(startPop, targetPop) {
        const avgPopularity = (startPop + targetPop) / 2;
        
        if (avgPopularity >= 75) return 0.90;
        if (avgPopularity >= 50) return 0.95;
        if (avgPopularity >= 40) return 1.00;
        if (avgPopularity >= 25) return 1.08;
        return 1.15;
    }

    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

// Export for testing (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LeaderboardManager, LocalLeaderboard };
}
