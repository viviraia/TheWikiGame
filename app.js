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

// Popular Wikipedia pages for random selection (Expanded to 400+ pages)
const popularPages = [
    // MEGA HUBS - Most connected Wikipedia pages
    "United_States", "World_War_II", "World_War_I", "Europe", "Asia", "Earth",
    "Science", "History", "Human", "Language", "Country", "City", "War",
    
    // GEOGRAPHY - Countries & Continents
    "France", "Germany", "China", "Japan", "India", "Russia", "United_Kingdom",
    "Brazil", "Canada", "Australia", "Mexico", "Italy", "Spain", "Egypt",
    "South_Africa", "Argentina", "Turkey", "Greece", "Portugal", "Netherlands",
    "Sweden", "Norway", "Denmark", "Finland", "Poland", "Ukraine", "Iran",
    "Iraq", "Israel", "Saudi_Arabia", "Pakistan", "Bangladesh", "Indonesia",
    "Thailand", "Vietnam", "Philippines", "South_Korea", "North_Korea", "Taiwan",
    "New_Zealand", "Chile", "Peru", "Colombia", "Venezuela", "Cuba",
    "Africa", "North_America", "South_America", "Antarctica", "Oceania",
    
    // GEOGRAPHY - Cities & Places
    "New_York_City", "London", "Paris", "Tokyo", "Rome", "Berlin", "Madrid",
    "Moscow", "Beijing", "Cairo", "Athens", "Jerusalem", "Istanbul", "Dubai",
    "Los_Angeles", "Chicago", "San_Francisco", "Miami", "Boston", "Washington,_D.C.",
    "Toronto", "Vancouver", "Montreal", "Sydney", "Melbourne", "Rio_de_Janeiro",
    "São_Paulo", "Buenos_Aires", "Mexico_City", "Mumbai", "Delhi", "Shanghai",
    "Hong_Kong", "Singapore", "Seoul", "Bangkok", "Amsterdam", "Vienna",
    "Prague", "Budapest", "Stockholm", "Copenhagen", "Lisbon", "Barcelona",
    
    // HISTORY - Major Events & Periods
    "Ancient_Rome", "Ancient_Egypt", "Ancient_Greece", "Renaissance", 
    "Industrial_Revolution", "Cold_War", "French_Revolution", "American_Revolution",
    "American_Civil_War", "Vietnam_War", "Korean_War", "Great_Depression",
    "Holocaust", "Space_Race", "Moon_landing", "September_11_attacks",
    "Fall_of_the_Berlin_Wall", "Pearl_Harbor", "D-Day", "Battle_of_Waterloo",
    "Crusades", "Age_of_Enlightenment", "Protestant_Reformation", "Black_Death",
    "Hundred_Years'_War", "Spanish_Inquisition", "Atlantic_slave_trade",
    
    // HISTORY - Ancient Civilizations
    "Byzantine_Empire", "Ottoman_Empire", "Mongol_Empire", "Roman_Empire",
    "Holy_Roman_Empire", "Mesopotamia", "Maya_civilization", "Inca_Empire",
    "Aztec", "Persian_Empire", "Babylonia", "Assyria", "Phoenicia",
    "Carthage", "Sumer", "Akkadian_Empire", "Hittites", "Olmec", "Viking",
    
    // PEOPLE - Scientists & Inventors
    "Albert_Einstein", "Isaac_Newton", "Charles_Darwin", "Galileo_Galilei",
    "Nikola_Tesla", "Marie_Curie", "Stephen_Hawking", "Carl_Sagan",
    "Richard_Feynman", "Niels_Bohr", "Max_Planck", "Erwin_Schrödinger",
    "Werner_Heisenberg", "James_Clerk_Maxwell", "Michael_Faraday",
    "Thomas_Edison", "Alexander_Graham_Bell", "Benjamin_Franklin",
    "Louis_Pasteur", "Alexander_Fleming", "Jonas_Salk", "Rosalind_Franklin",
    "Alan_Turing", "Ada_Lovelace", "Grace_Hopper", "Tim_Berners-Lee",
    
    // PEOPLE - Philosophers & Thinkers
    "Socrates", "Plato", "Aristotle", "Confucius", "Buddha", "Immanuel_Kant",
    "Friedrich_Nietzsche", "René_Descartes", "John_Locke", "David_Hume",
    "Jean-Jacques_Rousseau", "Karl_Marx", "Adam_Smith", "Sigmund_Freud",
    "Carl_Jung", "John_Stuart_Mill", "Thomas_Aquinas", "Baruch_Spinoza",
    
    // PEOPLE - Political Leaders
    "Napoleon", "Julius_Caesar", "Cleopatra", "Alexander_the_Great", "Genghis_Khan",
    "Martin_Luther_King_Jr.", "Mahatma_Gandhi", "Nelson_Mandela", "Winston_Churchill",
    "Abraham_Lincoln", "George_Washington", "Thomas_Jefferson", "Franklin_D._Roosevelt",
    "Theodore_Roosevelt", "John_F._Kennedy", "Barack_Obama", "Donald_Trump",
    "Vladimir_Lenin", "Joseph_Stalin", "Mao_Zedong", "Fidel_Castro",
    "Queen_Victoria", "Queen_Elizabeth_II", "Catherine_the_Great", "Peter_the_Great",
    
    // PEOPLE - Artists & Musicians
    "Leonardo_da_Vinci", "Michelangelo", "Pablo_Picasso", "Vincent_van_Gogh",
    "Rembrandt", "Claude_Monet", "Salvador_Dalí", "Frida_Kahlo", "Andy_Warhol",
    "Wolfgang_Amadeus_Mozart", "Ludwig_van_Beethoven", "Johann_Sebastian_Bach",
    "Frédéric_Chopin", "Pyotr_Ilyich_Tchaikovsky", "Antonio_Vivaldi",
    "The_Beatles", "Elvis_Presley", "Michael_Jackson", "Bob_Dylan", "Madonna",
    "David_Bowie", "Jimi_Hendrix", "Freddie_Mercury", "John_Lennon", "Paul_McCartney",
    "The_Rolling_Stones", "Pink_Floyd", "Led_Zeppelin", "Nirvana", "Radiohead",
    
    // PEOPLE - Writers & Poets
    "William_Shakespeare", "Jane_Austen", "Mark_Twain", "Ernest_Hemingway",
    "Charles_Dickens", "Leo_Tolstoy", "Fyodor_Dostoevsky", "Homer", "Dante_Alighieri",
    "Geoffrey_Chaucer", "Miguel_de_Cervantes", "Victor_Hugo", "Emily_Dickinson",
    "Edgar_Allan_Poe", "George_Orwell", "J._R._R._Tolkien", "J._K._Rowling",
    "Stephen_King", "Agatha_Christie", "Isaac_Asimov", "Ray_Bradbury",
    
    // PEOPLE - Film & Entertainment
    "Alfred_Hitchcock", "Steven_Spielberg", "Stanley_Kubrick", "Martin_Scorsese",
    "Quentin_Tarantino", "Christopher_Nolan", "Francis_Ford_Coppola",
    "Charlie_Chaplin", "Walt_Disney", "Marilyn_Monroe", "Audrey_Hepburn",
    
    // SCIENCE - Biology & Life Sciences
    "DNA", "Evolution", "Biology", "Cell_(biology)", "Genetics", "Ecology",
    "Photosynthesis", "Natural_selection", "Protein", "Enzyme", "Mitochondria",
    "Chloroplast", "Chromosome", "Gene", "RNA", "Biodiversity", "Taxonomy",
    "Botany", "Zoology", "Microbiology", "Bacterium", "Virus", "Fungus",
    
    // SCIENCE - Physics
    "Physics", "Quantum_mechanics", "Theory_of_relativity", "Gravity",
    "Electromagnetism", "Thermodynamics", "Atom", "Electron", "Proton", "Neutron",
    "Particle_physics", "Nuclear_physics", "Light", "Wave", "Energy", "Force",
    "Motion", "Velocity", "Acceleration", "Momentum", "String_theory",
    
    // SCIENCE - Chemistry
    "Chemistry", "Periodic_table", "Chemical_element", "Oxygen", "Hydrogen",
    "Carbon", "Nitrogen", "Chemical_reaction", "Acid", "Base_(chemistry)",
    "Organic_chemistry", "Inorganic_chemistry", "Molecule", "Ion", "pH",
    
    // SCIENCE - Earth & Environment
    "Climate_change", "Global_warming", "Greenhouse_effect", "Ozone_layer",
    "Earthquake", "Volcano", "Plate_tectonics", "Tsunami", "Hurricane",
    "Tornado", "Flood", "Drought", "Glacier", "Ice_age", "Fossil",
    "Renewable_energy", "Solar_energy", "Wind_power", "Nuclear_power",
    
    // SPACE & ASTRONOMY
    "Solar_System", "Sun", "Moon", "Mars", "Jupiter", "Saturn", "Venus", "Mercury",
    "Neptune", "Uranus", "Pluto", "Milky_Way", "Galaxy", "Black_hole", "Big_Bang",
    "Universe", "Star", "Planet", "Asteroid", "Comet", "Supernova", "Nebula",
    "Space_exploration", "NASA", "International_Space_Station", "Apollo_11",
    "Hubble_Space_Telescope", "James_Webb_Space_Telescope", "SpaceX",
    
    // TECHNOLOGY & COMPUTING
    "Computer", "Internet", "Artificial_intelligence", "World_Wide_Web",
    "Smartphone", "Social_media", "Google", "Apple_Inc.", "Microsoft", "Amazon_(company)",
    "Facebook", "Twitter", "Programming_language", "Algorithm", "Software",
    "Hardware", "Operating_system", "Database", "Cybersecurity", "Cloud_computing",
    "Bitcoin", "Blockchain", "Cryptocurrency", "Machine_learning", "Robotics",
    
    // MATHEMATICS
    "Mathematics", "Algebra", "Calculus", "Geometry", "Trigonometry",
    "Statistics", "Probability", "Number_theory", "Set_theory", "Logic",
    "Pi", "Euler's_number", "Golden_ratio", "Fibonacci_number", "Prime_number",
    
    // RELIGION & MYTHOLOGY
    "Christianity", "Islam", "Hinduism", "Buddhism", "Judaism", "Atheism",
    "God", "Jesus", "Muhammad", "Bible", "Quran", "Torah", "Karma", "Reincarnation",
    "Greek_mythology", "Norse_mythology", "Egyptian_mythology", "Roman_mythology",
    "Zeus", "Odin", "Ra", "Shiva", "Vishnu", "Thor", "Hades", "Poseidon",
    
    // ARTS & CULTURE
    "Art", "Music", "Literature", "Poetry", "Drama", "Theatre", "Cinema",
    "Painting", "Sculpture", "Architecture", "Photography", "Dance", "Opera",
    "Ballet", "Jazz", "Rock_music", "Classical_music", "Hip_hop_music",
    "Electronic_music", "Pop_music", "Blues", "Country_music", "Reggae",
    
    // PHILOSOPHY & IDEAS
    "Philosophy", "Ethics", "Metaphysics", "Aesthetics",
    "Existentialism", "Stoicism", "Utilitarianism", "Pragmatism", "Rationalism",
    "Empiricism", "Idealism", "Realism", "Nihilism", "Humanism",
    
    // SOCIAL SCIENCES
    "Psychology", "Sociology", "Anthropology", "Economics", "Politics",
    "Democracy", "Capitalism", "Socialism", "Communism", "Fascism", "Anarchism",
    "Human_rights", "Civil_rights_movement", "Feminism", "Equality", "Justice",
    "Freedom_of_speech", "Nationalism", "Colonialism", "Imperialism",
    
    // LANDMARKS & ARCHITECTURE
    "Eiffel_Tower", "Great_Wall_of_China", "Taj_Mahal", "Colosseum",
    "Statue_of_Liberty", "Pyramids_of_Giza", "Machu_Picchu", "Petra",
    "Stonehenge", "Big_Ben", "Notre-Dame_de_Paris", "Sagrada_Família",
    "Leaning_Tower_of_Pisa", "Parthenon", "Acropolis_of_Athens",
    
    // SPORTS & GAMES
    "Olympic_Games", "FIFA_World_Cup", "Football", "Basketball", "Baseball",
    "Tennis", "Cricket", "Rugby", "Golf", "Boxing", "Swimming", "Athletics",
    "Gymnastics", "Ice_hockey", "Volleyball", "Chess", "Poker", "Video_game",
    
    // NATURE & ANIMALS
    "Cat", "Dog", "Lion", "Tiger", "Elephant", "Whale", "Dolphin", "Shark",
    "Bear", "Wolf", "Eagle", "Penguin", "Dinosaur", "Tyrannosaurus",
    "Ocean", "Sea", "River", "Lake", "Mountain", "Forest", "Desert", "Jungle",
    "Tree", "Flower", "Rose", "Rainforest", "Coral_reef", "Savanna",
    
    // FOOD & DRINK
    "Pizza", "Pasta", "Sushi", "Hamburger", "Bread", "Cheese", "Chocolate",
    "Coffee", "Tea", "Beer", "Wine", "Water", "Milk", "Rice", "Wheat",
    "Italian_cuisine", "Chinese_cuisine", "French_cuisine", "Japanese_cuisine",
    
    // MEDICINE & HEALTH
    "Medicine", "Surgery", "Cancer", "Heart", "Brain", "Blood", "Vaccine",
    "Antibiotics", "Diabetes", "AIDS", "Mental_health", "Depression", "Anxiety",
    "Immune_system", "Neuroscience", "Anatomy", "Physiology", "Pharmacology",
    
    // BUSINESS & ECONOMICS
    "Stock_market", "Trade", "Banking", "Entrepreneurship", "Globalization",
    "Supply_and_demand", "Inflation", "Recession", "Monopoly", "Corporation",
    
    // MEDIA & ENTERTAINMENT
    "Television", "Radio", "Newspaper", "Magazine", "Book", "Novel", "Film",
    "Star_Wars", "Harry_Potter", "The_Lord_of_the_Rings", "Marvel_Comics",
    "The_Godfather", "Casablanca", "Gone_with_the_Wind",
    
    // TRANSPORTATION
    "Automobile", "Airplane", "Train", "Ship", "Bicycle", "Motorcycle",
    "Helicopter", "Submarine", "Rocket", "Spacecraft", "Aviation",
    
    // MODERN CULTURE & INTERNET
    "YouTube", "Instagram", "TikTok", "Reddit", "Wikipedia", "Netflix",
    "Spotify", "Minecraft", "Fortnite", "Grand_Theft_Auto", "Super_Mario",
    "Pokémon", "Dragon_Ball", "Naruto", "One_Piece", "Attack_on_Titan",
    "Game_of_Thrones", "Breaking_Bad", "The_Simpsons", "Friends_(TV_series)",
    "Seinfeld", "The_Office_(American_TV_series)", "Stranger_Things",
    
    // MORE SCIENTISTS & INVENTORS
    "Leonardo_da_Vinci", "Johannes_Gutenberg",
    "Robert_Boyle", "Antoine_Lavoisier",
    "Dmitri_Mendeleev", "Ernest_Rutherford", "Niels_Bohr",
    "Max_Born", "Enrico_Fermi", "J._Robert_Oppenheimer", "Richard_Feynman",
    "Murray_Gell-Mann", "Peter_Higgs", "Elon_Musk", "Steve_Jobs", "Bill_Gates",
    "Mark_Zuckerberg", "Jeff_Bezos", "Larry_Page", "Sergey_Brin",
    
    // MORE GEOGRAPHY
    "Amazon_rainforest", "Sahara", "Himalayas", "Mount_Everest", "Nile_River",
    "Pacific_Ocean", "Atlantic_Ocean", "Indian_Ocean",
    "Mediterranean_Sea", "Caribbean", "Great_Barrier_Reef", "Yellowstone_National_Park",
    "Grand_Canyon", "Niagara_Falls", "Victoria_Falls", "Angel_Falls",
    
    // MORE ANIMALS
    "Horse", "Cow", "Pig", "Chicken", "Sheep", "Goat", "Rabbit", "Mouse",
    "Rat", "Monkey", "Gorilla", "Chimpanzee", "Giraffe", "Zebra", "Hippopotamus",
    "Rhinoceros", "Crocodile", "Alligator", "Snake", "Lizard", "Frog", "Toad",
    "Turtle", "Tortoise", "Spider", "Ant", "Bee", "Butterfly", "Moth",
    
    // MORE SPORTS
    "NBA", "NFL", "UEFA_Champions_League", "Super_Bowl", "World_Series",
    "Wimbledon", "Tour_de_France", "Formula_One", "UFC", "WWE",
    "Lionel_Messi", "Cristiano_Ronaldo", "LeBron_James", "Michael_Jordan",
    "Tom_Brady", "Muhammad_Ali", "Mike_Tyson", "Serena_Williams", "Roger_Federer",
    
    // MORE INVENTIONS & DISCOVERIES
    "Wheel", "Fire", "Agriculture", "Writing", "Paper", "Compass", "Gunpowder",
    "Printing_press", "Steam_engine", "Telegraph", "Telephone",
    "X-ray", "Penicillin", "Transistor", "Laser", "GPS",
    
    // EVERYDAY CONCEPTS
    "Love", "Happiness", "Anger", "Fear", "Sadness", "Joy",
    "Stress", "Memory", "Dream", "Sleep", "Death", "Life", "Birth",
    "Marriage", "Family", "Friendship", "Education", "School", "University",
    "Money", "Gold", "Silver", "Diamond", "Oil", "Coal", "Iron", "Steel"
];

// Obscure topics for Hard Mode - 400+ challenging pages
const obscurePages = [
    // OBSCURE HISTORICAL FIGURES
    "Hypatia", "Sappho", "Herodotus", "Thucydides", "Livy", "Tacitus",
    "Petrarch", "Erasmus", "Thomas_More", "Francis_Bacon", "John_Milton",
    "Voltaire", "Denis_Diderot", "Mary_Wollstonecraft", "Edmund_Burke",
    "Maximilien_Robespierre", "Georges_Danton", "Jean-Paul_Marat",
    "Toussaint_Louverture", "Simon_Bolivar", "José_de_San_Martín",
    "Sun_Yat-sen", "Chiang_Kai-shek", "Ho_Chi_Minh", "Sukarno", "Kwame_Nkrumah",
    "Patrice_Lumumba", "Haile_Selassie", "Gamal_Abdel_Nasser", "Mustafa_Kemal_Atatürk",
    
    // OBSCURE SCIENTISTS & MATHEMATICIANS
    "Pythagoras", "Euclid", "Archimedes", "Ptolemy", "Al-Khwarizmi",
    "Fibonacci", "Copernicus", "Johannes_Kepler", "Tycho_Brahe", "Blaise_Pascal",
    "Pierre_de_Fermat", "Christiaan_Huygens", "Robert_Hooke", "Edmond_Halley",
    "Leonhard_Euler", "Carl_Friedrich_Gauss", "Pierre-Simon_Laplace",
    "Joseph_Fourier", "Augustin-Louis_Cauchy", "Bernhard_Riemann",
    "Georg_Cantor", "Henri_Poincaré", "David_Hilbert", "Emmy_Noether",
    "Kurt_Gödel", "John_von_Neumann", "Claude_Shannon", "Norbert_Wiener",
    "Linus_Pauling", "Dorothy_Hodgkin", "Barbara_McClintock", "Rachel_Carson",
    "Jane_Goodall", "Dian_Fossey", "Lynn_Margulis",
    
    // OBSCURE PHILOSOPHERS & THEOLOGIANS
    "Parmenides", "Heraclitus", "Zeno_of_Elea", "Protagoras", "Diogenes",
    "Epicurus", "Epictetus", "Marcus_Aurelius", "Plotinus", "Augustine_of_Hippo",
    "Boethius", "Avicenna", "Averroes", "Maimonides", "Duns_Scotus",
    "William_of_Ockham", "Giordano_Bruno", "Francisco_Suárez", "Hugo_Grotius",
    "Gottfried_Wilhelm_Leibniz", "George_Berkeley", "Thomas_Reid",
    "Jeremy_Bentham", "Georg_Wilhelm_Friedrich_Hegel", "Arthur_Schopenhauer",
    "Søren_Kierkegaard", "Friedrich_Engels", "William_James", "Henri_Bergson",
    "Edmund_Husserl", "Martin_Heidegger", "Jean-Paul_Sartre", "Simone_de_Beauvoir",
    "Hannah_Arendt", "Michel_Foucault", "Jacques_Derrida", "Jürgen_Habermas",
    
    // OBSCURE ARTISTS & COMPOSERS
    "Giotto", "Jan_van_Eyck", "Hieronymus_Bosch", "Pieter_Bruegel_the_Elder",
    "Caravaggio", "Diego_Velázquez", "Johannes_Vermeer", "Francisco_Goya",
    "Eugène_Delacroix", "Gustave_Courbet", "Édouard_Manet", "Edgar_Degas",
    "Paul_Cézanne", "Paul_Gauguin", "Henri_Matisse", "Wassily_Kandinsky",
    "Piet_Mondrian", "Marcel_Duchamp", "Giorgio_de_Chirico", "Max_Ernst",
    "Joan_Miró", "René_Magritte", "Jackson_Pollock", "Mark_Rothko",
    "Claudio_Monteverdi", "Henry_Purcell", "George_Frideric_Handel",
    "Joseph_Haydn", "Franz_Schubert", "Felix_Mendelssohn", "Robert_Schumann",
    "Johannes_Brahms", "Giuseppe_Verdi", "Richard_Wagner", "Anton_Bruckner",
    "Gustav_Mahler", "Claude_Debussy", "Maurice_Ravel", "Igor_Stravinsky",
    "Arnold_Schoenberg", "Béla_Bartók", "Dmitri_Shostakovich", "Benjamin_Britten",
    
    // OBSCURE WRITERS & POETS
    "Virgil", "Ovid", "Horace", "Catullus", "Juvenal", "Lucretius",
    "Beowulf", "The_Canterbury_Tales", "Edmund_Spenser", "Christopher_Marlowe",
    "Ben_Jonson", "John_Donne", "Andrew_Marvell", "Alexander_Pope",
    "Samuel_Richardson", "Laurence_Sterne", "William_Blake", "Samuel_Taylor_Coleridge",
    "Lord_Byron", "Percy_Bysshe_Shelley", "John_Keats", "Alfred,_Lord_Tennyson",
    "Robert_Browning", "Walt_Whitman", "Emily_Brontë", "Charlotte_Brontë",
    "George_Eliot", "Thomas_Hardy", "Oscar_Wilde", "Joseph_Conrad",
    "Henry_James", "Edith_Wharton", "Marcel_Proust", "James_Joyce",
    "Virginia_Woolf", "T._S._Eliot", "Ezra_Pound", "William_Butler_Yeats",
    "Robert_Frost", "W._H._Auden", "Dylan_Thomas", "Sylvia_Plath",
    "Franz_Kafka", "Hermann_Hesse", "Thomas_Mann", "Rainer_Maria_Rilke",
    "Italo_Calvino", "Umberto_Eco", "Gabriel_García_Márquez", "Jorge_Luis_Borges",
    "Octavio_Paz", "Pablo_Neruda", "Yasunari_Kawabata", "Kenzaburō_Ōe",
    
    // OBSCURE HISTORICAL EVENTS
    "Battle_of_Marathon", "Battle_of_Thermopylae", "Battle_of_Salamis",
    "Siege_of_Constantinople_(1453)", "Battle_of_Agincourt", "Battle_of_Crécy",
    "Battle_of_Lepanto", "Thirty_Years'_War", "War_of_the_Spanish_Succession",
    "Seven_Years'_War", "Opium_Wars", "Taiping_Rebellion", "Boxer_Rebellion",
    "Russo-Japanese_War", "Balkan_Wars", "Irish_War_of_Independence",
    "Spanish_Civil_War", "Winter_War", "Sino-Japanese_War", "Indo-Pakistani_War",
    "Yom_Kippur_War", "Iran–Iraq_War", "Soviet–Afghan_War", "Rwandan_genocide",
    
    // OBSCURE ANCIENT CIVILIZATIONS & CULTURES
    "Minoan_civilization", "Mycenaean_Greece", "Etruscan_civilization",
    "Nubia", "Kingdom_of_Kush", "Aksumite_Empire", "Kingdom_of_Punt",
    "Harappan_civilization", "Maurya_Empire", "Gupta_Empire", "Khmer_Empire",
    "Srivijaya", "Majapahit", "Toltec", "Teotihuacan", "Zapotec_civilization",
    "Nazca_culture", "Moche_culture", "Chimú_culture", "Tiwanaku", "Wari_culture",
    
    // OBSCURE GEOGRAPHY
    "Svalbard", "Faroe_Islands", "Greenland", "Iceland", "Azores", "Madeira",
    "Canary_Islands", "Malta", "Cyprus", "Crete", "Sicily", "Sardinia", "Corsica",
    "Zanzibar", "Madagascar", "Seychelles", "Maldives", "Mauritius", "Sri_Lanka",
    "Tasmania", "Fiji", "Samoa", "Tonga", "Vanuatu", "New_Caledonia",
    "Papua_New_Guinea", "Borneo", "Sumatra", "Java", "Sulawesi",
    "Ural_Mountains", "Caucasus_Mountains", "Pamir_Mountains", "Tian_Shan",
    "Kunlun_Mountains", "Hindu_Kush", "Karakoram", "Zagros_Mountains",
    "Atlas_Mountains", "Ethiopian_Highlands", "Drakensberg", "Great_Rift_Valley",
    "Amazon_River", "Nile", "Yangtze", "Mississippi_River", "Ganges",
    "Danube", "Rhine", "Volga", "Niger_River", "Congo_River", "Zambezi",
    
    // OBSCURE SCIENTIFIC CONCEPTS
    "Heisenberg_uncertainty_principle", "Schrödinger's_cat", "Quantum_entanglement",
    "Wave–particle_duality", "Photoelectric_effect", "Compton_scattering",
    "Bose–Einstein_condensate", "Pauli_exclusion_principle", "Fermi_level",
    "Maxwell's_equations", "Navier–Stokes_equations", "Schrödinger_equation",
    "Dirac_equation", "Klein–Gordon_equation", "Lagrangian_mechanics",
    "Hamiltonian_mechanics", "Special_relativity", "General_relativity",
    "Schwarzschild_metric", "Kerr_metric", "Event_horizon", "Hawking_radiation",
    "Cosmic_microwave_background", "Dark_matter", "Dark_energy", "Inflation_(cosmology)",
    "Riemann_hypothesis", "Goldbach's_conjecture", "Twin_prime_conjecture",
    "Collatz_conjecture", "P_versus_NP_problem", "Gödel's_incompleteness_theorems",
    "Chaos_theory", "Fractal", "Mandelbrot_set", "Julia_set", "Strange_attractor",
    "Cellular_automaton", "Conway's_Game_of_Life", "Turing_machine",
    
    // OBSCURE BIOLOGY & MEDICINE
    "Krebs_cycle", "Calvin_cycle", "Electron_transport_chain", "Glycolysis",
    "Oxidative_phosphorylation", "Fermentation", "Chemiosmosis",
    "Endosymbiotic_theory", "Horizontal_gene_transfer", "Epigenetics",
    "RNA_interference", "CRISPR", "Telomere", "Ribosome", "Golgi_apparatus",
    "Endoplasmic_reticulum", "Lysosome", "Peroxisome", "Cytoskeleton",
    "Neurotransmitter", "Synapse", "Action_potential", "Myelin", "Neuron",
    "Endocrine_system", "Hormone", "Thyroid", "Pituitary_gland", "Adrenal_gland",
    "Homeostasis", "Circadian_rhythm", "Apoptosis", "Autophagy", "Phagocytosis",
    
    // OBSCURE MYTHOLOGY & FOLKLORE
    "Gilgamesh", "Enkidu", "Inanna", "Marduk", "Tiamat", "Ishtar",
    "Osiris", "Isis", "Horus", "Anubis", "Set_(deity)", "Thoth", "Bastet",
    "Aphrodite", "Ares", "Artemis", "Athena", "Apollo", "Dionysus",
    "Hermes", "Hephaestus", "Demeter", "Persephone", "Hestia",
    "Freya", "Loki", "Baldur", "Tyr", "Heimdall", "Frigg",
    "Beowulf_(hero)", "Siegfried", "Sigurd", "Ragnarök", "Valhalla", "Yggdrasil",
    "Cú_Chulainn", "Finn_MacCool", "Bran_the_Blessed", "Morrigan",
    "Quetzalcoatl", "Tezcatlipoca", "Huitzilopochtli", "Tlaloc", "Xipe_Totec",
    "Viracocha", "Pachamama", "Inti", "Mama_Quilla",
    
    // OBSCURE ARCHITECTURE & LANDMARKS
    "Hagia_Sophia", "Pantheon,_Rome", "Dome_of_the_Rock", "Al-Aqsa_Mosque",
    "Blue_Mosque", "Süleymaniye_Mosque", "Mezquita", "Alhambra",
    "Mont_Saint-Michel", "Chartres_Cathedral", "Canterbury_Cathedral",
    "Westminster_Abbey", "St_Paul's_Cathedral", "Cologne_Cathedral",
    "Milan_Cathedral", "Florence_Cathedral", "St._Peter's_Basilica",
    "Sistine_Chapel", "Angkor_Wat", "Borobudur", "Prambanan",
    "Temple_of_Heaven", "Forbidden_City", "Potala_Palace", "Golden_Temple",
    "Meenakshi_Temple", "Kashi_Vishwanath_Temple", "Konark_Sun_Temple",
    "Chichen_Itza", "Tikal", "Copán", "Palenque", "Uxmal",
    "Moai", "Nazca_Lines", "Göbekli_Tepe", "Çatalhöyük",
    
    // OBSCURE PHILOSOPHICAL CONCEPTS
    "Ontology", "Epistemology", "Phenomenology", "Hermeneutics", "Dialectic",
    "Teleology", "Determinism", "Free_will", "Mind–body_problem", "Dualism",
    "Monism", "Pantheism", "Solipsism", "Skepticism", "Relativism",
    "Absurdism", "Logical_positivism", "Structuralism", "Poststructuralism",
    "Deconstruction", "Semiotics", "Linguistic_turn", "Social_contract",
    "Tabula_rasa", "Categorical_imperative", "Dialectical_materialism",
    "Historical_materialism", "Class_struggle", "Alienation",
    "Will_to_power", "Eternal_return", "Übermensch", "Master–slave_morality",
    
    // OBSCURE LITERATURE & TEXTS
    "Epic_of_Gilgamesh", "Iliad", "Odyssey", "Aeneid", "Metamorphoses_(Ovid)",
    "Divine_Comedy", "Decameron", "The_Prince", "Don_Quixote", "Paradise_Lost",
    "Gulliver's_Travels", "Candide", "Faust", "The_Sorrows_of_Young_Werther",
    "Pride_and_Prejudice", "Wuthering_Heights", "Moby-Dick", "Madame_Bovary",
    "Crime_and_Punishment", "The_Brothers_Karamazov", "War_and_Peace",
    "Anna_Karenina", "Thus_Spoke_Zarathustra", "The_Metamorphosis",
    "In_Search_of_Lost_Time", "Ulysses_(novel)", "Mrs_Dalloway",
    "The_Sound_and_the_Fury", "One_Hundred_Years_of_Solitude",
    
    // OBSCURE MUSIC THEORY & TERMS
    "Counterpoint", "Fugue", "Canon_(music)", "Sonata_form", "Rondo",
    "Minuet", "Scherzo", "Passacaglia", "Chaconne", "Toccata", "Prelude",
    "Étude", "Nocturne", "Impromptu", "Rhapsody", "Symphonic_poem",
    "Leitmotif", "Twelve-tone_technique", "Serialism", "Atonality",
    "Polytonality", "Chromaticism", "Dissonance", "Consonance",
    "Cadence_(music)", "Modulation_(music)", "Harmonic_progression",
    
    // OBSCURE ART MOVEMENTS & TERMS
    "Mannerism", "Baroque", "Rococo", "Neoclassicism", "Romanticism",
    "Realism_(art_movement)", "Naturalism_(art)", "Symbolism_(arts)",
    "Art_Nouveau", "Fauvism", "Expressionism", "Die_Brücke", "Der_Blaue_Reiter",
    "Futurism", "Vorticism", "Constructivism_(art)", "De_Stijl", "Bauhaus",
    "Dada", "Surrealism", "Abstract_expressionism", "Color_field",
    "Pop_art", "Op_art", "Minimalism", "Conceptual_art", "Performance_art",
    "Land_art", "Installation_art", "Video_art", "Digital_art",
    
    // MORE OBSCURE HISTORICAL FIGURES
    "Hannibal", "Attila", "Charlemagne", "Saladin", "Richard_the_Lionheart",
    "Joan_of_Arc", "Vlad_the_Impaler", "Ivan_the_Terrible", "Akbar", "Suleiman_the_Magnificent",
    "Frederick_the_Great", "Maria_Theresa", "Louis_XIV", "Louis_XVI", "Marie_Antoinette",
    "Robespierre", "Napoleon_Bonaparte", "Duke_of_Wellington", "Otto_von_Bismarck",
    "Cecil_Rhodes", "David_Livingstone", "Henry_Morton_Stanley", "Florence_Nightingale",
    
    // OBSCURE MEDIEVAL & RENAISSANCE
    "Hildegard_of_Bingen", "Thomas_Becket", "Eleanor_of_Aquitaine",
    "Frederick_Barbarossa", "Philip_II_of_France", "Edward_I_of_England",
    "Robert_the_Bruce", "William_Wallace", "Jan_Hus", "Girolamo_Savonarola",
    "Lorenzo_de'_Medici", "Cesare_Borgia", "Niccolò_Machiavelli",
    "Martin_Luther", "John_Calvin", "Ignatius_of_Loyola", "Teresa_of_Ávila",
    
    // MORE OBSCURE SCIENCE
    "Doppler_effect", "Bernoulli's_principle", "Ohm's_law", "Faraday's_law",
    "Ampère's_law", "Gauss's_law", "Snell's_law", "Hooke's_law", "Pascal's_law",
    "Archimedes'_principle", "Boyle's_law", "Charles's_law", "Avogadro's_law",
    "Le_Chatelier's_principle", "Hess's_law", "Fick's_laws_of_diffusion",
    
    // OBSCURE GEOGRAPHY & PLACES
    "Petra", "Angkor", "Machu_Picchu", "Chichen_Itza",
    "Great_Zimbabwe", "Timbuktu", "Samarkand", "Bukhara", "Persepolis",
    "Ctesiphon", "Palmyra", "Jerash", "Ephesus", "Troy", "Mycenae", "Knossos",
    "Delphi", "Olympia,_Greece", "Epidaurus", "Rhodes", "Corinth", "Thebes,_Greece",
    "Carthage", "Alexandria", "Antioch", "Byzantium",
    
    // MORE OBSCURE LITERATURE
    "The_Tale_of_Genji", "One_Thousand_and_One_Nights", "Romance_of_the_Three_Kingdoms",
    "Journey_to_the_West", "Water_Margin", "Dream_of_the_Red_Chamber",
    "The_Wealth_of_Nations", "The_Origin_of_Species", "Das_Kapital", "Mein_Kampf",
    "The_Communist_Manifesto", "Leviathan_(Hobbes)", "Two_Treatises_of_Government",
    "A_Vindication_of_the_Rights_of_Woman", "Common_Sense_(pamphlet)",
    
    // OBSCURE BIOLOGY & NATURE
    "Prokaryote", "Eukaryote", "Archaea", "Protist", "Lichen", "Algae", "Moss",
    "Fern", "Conifer", "Angiosperm", "Gymnosperm", "Bryophyte", "Pteridophyte",
    "Sponge", "Cnidaria", "Jellyfish", "Coral", "Sea_anemone", "Flatworm",
    "Roundworm", "Annelid", "Earthworm", "Leech", "Mollusca", "Gastropod",
    "Bivalvia", "Cephalopod", "Octopus", "Squid", "Nautilus", "Arthropod",
    "Crustacean", "Arachnid", "Insect", "Myriapod", "Echinoderm", "Starfish",
    
    // MORE OBSCURE WARS & CONFLICTS
    "Punic_Wars", "Peloponnesian_War", "Wars_of_the_Roses", "Eighty_Years'_War",
    "English_Civil_War", "War_of_the_Austrian_Succession",
    "Great_Northern_War", "War_of_1812", "Mexican–American_War", "Crimean_War",
    "First_Opium_War", "Second_Opium_War", "Franco-Prussian_War", "Boer_Wars",
    "Russo-Turkish_Wars", "Greek_War_of_Independence", "Italian_unification",
    "German_unification", "Scramble_for_Africa", "Partition_of_Africa"
];

// Ultra-obscure topics for Ultra Hard Mode - 400+ extremely challenging pages
const ultraObscurePages = [
    // ULTRA OBSCURE HISTORICAL FIGURES
    "Anaximander", "Anaximenes", "Empedocles", "Democritus", "Leucippus",
    "Anaxagoras", "Gorgias", "Antisthenes", "Aristippus", "Pyrrho",
    "Carneades", "Posidonius", "Porphyry_(philosopher)", "Proclus", "Iamblichus",
    "Alcuin", "Anselm_of_Canterbury", "Peter_Abelard", "Bernard_of_Clairvaux",
    "Hildegard_of_Bingen", "Meister_Eckhart", "Ramon_Llull", "John_of_Salisbury",
    "Roger_Bacon", "Albertus_Magnus", "Nicholas_of_Cusa", "Marsilio_Ficino",
    "Pico_della_Mirandola", "Tommaso_Campanella",
    "Pierre_Gassendi", "Antoine_Arnauld", "Nicolas_Malebranche", "Pierre_Bayle",
    "Marquis_de_Condorcet", "Claude_Henri_de_Rouvroy", "Charles_Fourier",
    "Pierre-Joseph_Proudhon", "Mikhail_Bakunin", "Peter_Kropotkin",
    
    // ULTRA OBSCURE SCIENTISTS
    "Aristarchus_of_Samos", "Eratosthenes", "Hipparchus", "Hero_of_Alexandria",
    "Diophantus", "Hypatia_of_Alexandria", "Aryabhata", "Brahmagupta",
    "Muhammad_ibn_Musa_al-Khwarizmi", "Omar_Khayyam", "Nasir_al-Din_al-Tusi",
    "Nicole_Oresme", "Jean_Buridan", "William_Gilbert_(physicist)",
    "Santorio_Santorio", "Marin_Mersenne", "Pierre_de_Fermat",
    "Evangelista_Torricelli", "Blaise_Pascal", "Christiaan_Huygens",
    "Ole_Rømer", "Jakob_Bernoulli", "Johann_Bernoulli", "Brook_Taylor",
    "Colin_Maclaurin", "Daniel_Bernoulli", "Leonhard_Euler",
    "Joseph-Louis_Lagrange", "Pierre-Simon_Laplace",
    "Adrien-Marie_Legendre", "Joseph_Fourier", "Siméon_Denis_Poisson",
    "Augustin-Louis_Cauchy", "Niels_Henrik_Abel", "Évariste_Galois",
    "Carl_Gustav_Jacob_Jacobi", "Peter_Gustav_Lejeune_Dirichlet", "Ernst_Kummer",
    "Leopold_Kronecker", "Richard_Dedekind", "Georg_Cantor",
    "Gottlob_Frege", "Giuseppe_Peano", "Ernst_Zermelo", "Thoralf_Skolem",
    "Abraham_Fraenkel", "Alfred_Tarski", "Alonzo_Church", "Stephen_Cole_Kleene",
    "Haskell_Curry", "Emil_Post", "Andrey_Kolmogorov", "Paul_Erdős",
    
    // ULTRA OBSCURE MEDIEVAL & RENAISSANCE FIGURES
    "Boethius", "Cassiodorus", "Isidore_of_Seville", "Bede",
    "John_Scotus_Eriugena", "Al-Kindi", "Al-Farabi", "Al-Ghazali",
    "Ibn_Rushd", "Ibn_Arabi", "Moses_Maimonides", "Judah_Halevi",
    "Hasdai_Crescas", "Gemistus_Pletho", "Johannes_Reuchlin", "Paracelsus",
    "Gerolamo_Cardano", "Niccolò_Fontana_Tartaglia", "Lodovico_Ferrari",
    "François_Viète", "Simon_Stevin", "John_Napier", "Henry_Briggs_(mathematician)",
    "Galileo_Galilei", "Johannes_Kepler",
    
    // ULTRA OBSCURE ENLIGHTENMENT THINKERS
    "Anthony_Ashley-Cooper,_3rd_Earl_of_Shaftesbury", "Bernard_Mandeville",
    "Francis_Hutcheson_(philosopher)", "Richard_Price", "Joseph_Priestley",
    "Thomas_Paine", "William_Godwin", "Mary_Wollstonecraft",
    "Johann_Gottfried_Herder", "Friedrich_Schleiermacher", "Johann_Gottlieb_Fichte",
    "Friedrich_Wilhelm_Joseph_Schelling", "Ludwig_Feuerbach", "Max_Stirner",
    "Moses_Hess", "Pierre_Leroux", "Louis_Blanc", "Auguste_Blanqui",
    
    // ULTRA OBSCURE 19TH CENTURY THINKERS
    "Arthur_Schopenhauer", "Søren_Kierkegaard",
    "Friedrich_Nietzsche", "William_James",
    "Charles_Sanders_Peirce", "Josiah_Royce", "F._H._Bradley", "Bernard_Bosanquet_(philosopher)",
    "Ernst_Mach", "Henri_Poincaré", "Gottlob_Frege",
    "Franz_Brentano", "Alexius_Meinong", "Edmund_Husserl",
    "Wilhelm_Dilthey", "Georg_Simmel", "Ferdinand_Tönnies", "Émile_Durkheim",
    "Max_Weber_(sociologist)", "Vilfredo_Pareto", "Gaetano_Mosca", "Robert_Michels",
    
    // ULTRA OBSCURE 20TH CENTURY PHILOSOPHERS
    "Bertrand_Russell", "G._E._Moore", "Ludwig_Wittgenstein",
    "Rudolf_Carnap", "Otto_Neurath", "Moritz_Schlick", "Hans_Reichenbach",
    "Carl_Hempel", "W._V._O._Quine", "Donald_Davidson_(philosopher)", "Saul_Kripke",
    "Hilary_Putnam", "John_Searle", "Jerry_Fodor", "Daniel_Dennett",
    "Martin_Heidegger", "Karl_Jaspers", "Gabriel_Marcel", "Maurice_Merleau-Ponty",
    "Jean-Paul_Sartre", "Simone_de_Beauvoir",
    "Emmanuel_Levinas", "Paul_Ricœur", "Gilles_Deleuze", "Félix_Guattari",
    "Jean_Baudrillard", "Jacques_Lacan", "Louis_Althusser", "Antonio_Gramsci",
    "György_Lukács", "Ernst_Bloch", "Walter_Benjamin", "Theodor_W._Adorno",
    "Max_Horkheimer", "Herbert_Marcuse", "Jürgen_Habermas",
    "Karl_Popper", "Imre_Lakatos", "Paul_Feyerabend", "Thomas_Kuhn",
    
    // ULTRA OBSCURE ARTISTS
    "Cimabue", "Duccio", "Simone_Martini", "Gentile_da_Fabriano", "Masaccio",
    "Fra_Angelico", "Piero_della_Francesca", "Andrea_Mantegna", "Giovanni_Bellini",
    "Sandro_Botticelli", "Domenico_Ghirlandaio", "Pietro_Perugino", "Luca_Signorelli",
    "Matthias_Grünewald", "Albrecht_Altdorfer", "Hans_Holbein_the_Younger",
    "Lucas_Cranach_the_Elder", "Pieter_Bruegel_the_Younger", "El_Greco",
    "Annibale_Carracci", "Guido_Reni", "Guercino", "Jusepe_de_Ribera",
    "Francisco_de_Zurbarán", "Bartolomé_Esteban_Murillo", "Nicolas_Poussin",
    "Claude_Lorrain", "Georges_de_La_Tour", "Antoine_Watteau", "François_Boucher",
    "Jean-Honoré_Fragonard", "Jean-Baptiste-Siméon_Chardin", "Canaletto",
    "Francesco_Guardi", "Giovanni_Battista_Tiepolo", "Thomas_Gainsborough",
    "Joshua_Reynolds", "John_Constable", "J._M._W._Turner", "Caspar_David_Friedrich",
    "Philipp_Otto_Runge", "Théodore_Géricault", "Jean-Auguste-Dominique_Ingres",
    "Honoré_Daumier", "Jean-François_Millet", "Camille_Corot", "Gustave_Moreau",
    "Pierre_Puvis_de_Chavannes", "Odilon_Redon", "James_McNeill_Whistler",
    "John_Singer_Sargent", "Winslow_Homer", "Thomas_Eakins", "Mary_Cassatt",
    
    // ULTRA OBSCURE COMPOSERS
    "Guillaume_de_Machaut", "John_Dunstable", "Guillaume_Dufay", "Johannes_Ockeghem",
    "Josquin_des_Prez", "Giovanni_Pierluigi_da_Palestrina", "Orlando_di_Lasso",
    "William_Byrd", "Thomas_Tallis", "Carlo_Gesualdo", "Claudio_Monteverdi",
    "Heinrich_Schütz", "Jean-Baptiste_Lully", "Arcangelo_Corelli", "Alessandro_Scarlatti",
    "Domenico_Scarlatti", "François_Couperin", "Jean-Philippe_Rameau",
    "Tomaso_Albinoni", "Giuseppe_Tartini", "Giovanni_Battista_Pergolesi",
    "Carl_Philipp_Emanuel_Bach", "Johann_Christian_Bach", "Christoph_Willibald_Gluck",
    "Luigi_Boccherini", "Muzio_Clementi", "Luigi_Cherubini", "Gaspare_Spontini",
    "Carl_Maria_von_Weber", "Gaetano_Donizetti", "Vincenzo_Bellini",
    "Hector_Berlioz", "Franz_Liszt", "César_Franck", "Camille_Saint-Saëns",
    "Léo_Delibes", "Emmanuel_Chabrier", "Gabriel_Fauré", "Vincent_d'Indy",
    "Ernest_Chausson", "Erik_Satie", "Darius_Milhaud", "Francis_Poulenc",
    "Arthur_Honegger", "Max_Reger", "Hugo_Wolf", "Hans_Pfitzner",
    "Alexander_Scriabin", "Sergei_Rachmaninoff", "Karol_Szymanowski",
    "Leoš_Janáček", "Carl_Nielsen", "Jean_Sibelius", "Ralph_Vaughan_Williams",
    
    // ULTRA OBSCURE WRITERS
    "Hesiod", "Pindar", "Aeschylus", "Sophocles", "Euripides", "Aristophanes",
    "Menander", "Apollonius_of_Rhodes", "Theocritus", "Callimachus", "Lucian",
    "Apuleius", "Petronius", "Martial", "Statius", "Claudian",
    "Boethius", "Chrétien_de_Troyes", "Wolfram_von_Eschenbach",
    "Gottfried_von_Strassburg", "Hartmann_von_Aue", "Walther_von_der_Vogelweide",
    "Guillaume_de_Lorris", "Jean_de_Meun", "François_Villon", "Pietro_Bembo",
    "Ludovico_Ariosto", "Torquato_Tasso", "Luis_de_Camões", "Pierre_de_Ronsard",
    "Joachim_du_Bellay", "Maurice_Scève", "Thomas_Wyatt_(poet)", "Henry_Howard",
    "Philip_Sidney", "Robert_Herrick_(poet)", "George_Herbert", "Henry_Vaughan",
    "Thomas_Traherne", "Richard_Crashaw", "Abraham_Cowley", "John_Wilmot",
    "Aphra_Behn", "John_Dryden", "Jonathan_Swift", "Daniel_Defoe",
    "Samuel_Richardson", "Henry_Fielding", "Tobias_Smollett",
    "Oliver_Goldsmith", "Laurence_Sterne", "Horace_Walpole",
    "Ann_Radcliffe", "Matthew_Lewis_(writer)", "Maria_Edgeworth",
    "William_Wordsworth", "Samuel_Taylor_Coleridge_(poet)", "Robert_Southey",
    "Walter_Scott", "Lord_Byron", "Percy_Bysshe_Shelley",
    "John_Keats", "Thomas_De_Quincey", "William_Hazlitt", "Charles_Lamb",
    
    // MORE ULTRA OBSCURE WRITERS & POETS
    "Alcaeus_of_Mytilene", "Anacreon", "Simonides_of_Ceos",
    "Bacchylides", "Archilochus", "Mimnermus", "Tyrtaeus", "Solon",
    "Theognis_of_Megara", "Ibycus", "Stesichorus", "Alcman", "Corinna",
    "Erinna", "Nossis", "Anyte", "Moero", "Hedylus", "Leonidas_of_Tarentum",
    
    // ULTRA OBSCURE MATHEMATICIANS & SCIENTISTS
    "Thales_of_Miletus", "Heraclides_Ponticus", "Aristarchus",
    "Eudoxus_of_Cnidus", "Menaechmus", "Theaetetus_(mathematician)",
    "Hippocrates_of_Chios", "Theodorus_of_Cyrene", "Archytas", "Philolaus",
    "Apollonius_of_Perga", "Pappus_of_Alexandria", "Proclus",
    "Theon_of_Alexandria", "Hypatia", "Bhaskara_I", "Bhaskara_II",
    "Madhava_of_Sangamagrama", "Nilakantha_Somayaji", "Jyeshthadeva",
    
    // ULTRA OBSCURE MEDIEVAL SCHOLARS
    "Rabanus_Maurus", "Notker_the_Stammerer", "Hrotsvitha", "Gerbert_of_Aurillac",
    "Fulbert_of_Chartres", "Lanfranc", "Roscellinus", "William_of_Champeaux",
    "Gilbert_de_la_Porrée", "Peter_Lombard", "Hugh_of_Saint_Victor",
    "Richard_of_Saint_Victor", "Alan_of_Lille", "Joachim_of_Fiore",
    "Robert_Grosseteste", "Alexander_of_Hales", "Bonaventure", "Siger_of_Brabant",
    
    // ULTRA OBSCURE RENAISSANCE FIGURES
    "Coluccio_Salutati", "Leonardo_Bruni", "Poggio_Bracciolini", "Lorenzo_Valla",
    "Angelo_Poliziano", "Giovanni_Pico_della_Mirandola",
    "Pietro_Pomponazzi", "Jacopo_Zabarella", "Francisco_de_Vitoria",
    "Domingo_de_Soto", "Luis_de_Molina", "Francisco_Suárez",
    "Robert_Bellarmine", "Cardinal_Cajetan", "Reginald_Pole", "John_Fisher",
    
    // MORE ULTRA OBSCURE BATTLES
    "Battle_of_Marathon", "Battle_of_Plataea", "Battle_of_Mycale",
    "Battle_of_the_Eurymedon", "Battle_of_Mantinea_(418_BC)", "Battle_of_Leuctra",
    "Battle_of_Mantinea_(362_BC)", "Battle_of_Chaeronea_(338_BC)",
    "Battle_of_the_Granicus", "Battle_of_Issus", "Battle_of_Ipsus",
    "Battle_of_Corupedium", "Battle_of_Raphia", "Battle_of_Magnesia",
    "Battle_of_Pydna", "Battle_of_Cynoscephalae", "Battle_of_Ilipa",
    "Battle_of_the_Metaurus", "Battle_of_Lake_Trasimene", "Battle_of_Trebia",
    
    // ULTRA OBSCURE ANCIENT KINGDOMS & DYNASTIES
    "Hyksos", "Mitanni", "Kassites", "Hurrians", "Urartu", "Phrygia", "Lydia",
    "Caria", "Lycia", "Cilicia", "Commagene", "Pontus_(kingdom)", "Bithynia",
    "Galatia", "Cappadocia_(Roman_province)", "Osroene", "Adiabene", "Characene",
    "Elam", "Mannaea", "Media_(region)", "Bactria", "Sogdiana", "Margiana",
    "Chorasmia", "Fergana_Valley", "Tokharistan", "Gandhara", "Kamboja",
    
    // ULTRA OBSCURE PHILOSOPHY CONCEPTS
    "Monad_(philosophy)", "Demiurge", "Nous", "Logos", "Apeiron",
    "Arche", "Physis", "Nomos", "Techne", "Episteme", "Doxa", "Aletheia",
    "Eudaimonia", "Arete", "Phronesis", "Ataraxia", "Apatheia", "Akrasia",
    "Aidos", "Thumos", "Kairos", "Kronos", "Pneuma", "Psyche_(psychology)",
    "Anamnesis_(philosophy)", "Hypostasis_(philosophy)", "Ousia", "Parousia",
    
    // ULTRA OBSCURE THEOLOGY & MYSTICISM
    "Gnosticism", "Neoplatonism", "Manichaeism", "Zoroastrianism", "Mithraism",
    "Orphism_(religion)", "Pythagoreanism", "Hermeticism", "Theurgy", "Kabbalah",
    "Sufism", "Tantra", "Vajrayana", "Mahayana", "Theravada", "Zen", "Pure_Land_Buddhism",
    "Tiantai", "Huayan", "Yogacara", "Madhyamaka", "Abhidharma", "Vinaya",
    
    // ULTRA OBSCURE ARTISTIC TECHNIQUES
    "Chiaroscuro", "Sfumato", "Tenebrism", "Impasto", "Scumbling", "Glazing",
    "Alla_prima", "Grisaille", "Trompe-l'œil", "Anamorphosis", "Quadratura",
    "Fresco", "Tempera", "Encaustic_painting", "Gouache", "Casein_paint",
    "Buon_fresco", "Fresco-secco", "Sgraffito", "Cloisonné", "Champlevé",
    
    // ULTRA OBSCURE MUSIC TECHNIQUES
    "Isorhythm", "Cantus_firmus", "Fauxbourdon", "Hocket", "Musica_ficta",
    "Solmization", "Hexachord", "Gamut", "Mode_(music)", "Church_mode",
    "Dorian_mode", "Phrygian_mode", "Lydian_mode", "Mixolydian_mode",
    "Aeolian_mode", "Locrian_mode", "Plagal_mode", "Authentic_mode",
    
    // ULTRA OBSCURE SCIENTIFIC TERMS
    "Soliton", "Kink", "Instanton", "Skyrmion", "Monopole",
    "Dyon", "Tachyon", "Axion", "Majorana_fermion", "Weyl_fermion", "Dirac_fermion",
    "Anyon", "Plekton", "Holon_(physics)", "Spinon", "Orbiton", "Phonon",
    "Magnon", "Polariton", "Plasmon", "Roton", "Exciton", "Trion", "Biexciton",
    
    // ULTRA OBSCURE BIOLOGY TERMS
    "Plasmid", "Transposon", "Retrotransposon", "Intron", "Exon", "Promoter_(genetics)",
    "Enhancer_(genetics)", "Silencer_(genetics)", "Transcription_factor",
    "Spliceosome", "Proteasome", "Chaperone_(protein)", "Heat_shock_protein",
    "Ubiquitin", "SUMO_protein", "Autophagosome", "Phagolysosome",
    "Endosome", "Caveola", "Lipid_raft", "Focal_adhesion", "Tight_junction",
    
    // MORE ULTRA OBSCURE ANCIENT SITES
    "Hattusa", "Gordium", "Sardis", "Miletus", "Priene", "Didyma", "Halicarnassus",
    "Aphrodisias", "Pergamon", "Nemrut_Dağ", "Çatalhöyük",
    "Derinkuyu", "Cappadocia", "Göreme", "Zelve", "Ihlara_Valley",
    "Sumela_Monastery", "Trabzon", "Ani", "Kars", "Mount_Ararat"
];

// Game mode - normal, hard, or ultra
let gameMode = 'normal'; // 'normal', 'hard', or 'ultra'

// DOM Elements - will be initialized when DOM loads
let welcomeScreen, loadingScreen, gameScreen, winScreen;
let startGameBtn, instructionsBtn, playAgainBtn, backBtn, giveUpBtn;
let startPageEl, targetPageEl, clickCountEl, timerEl, wikiContent, wikiTOC;
let instructionsModal, alertModal, menuModal, leaderboardModal, closeInstructions, closeMenu, closeLeaderboard, alertOkBtn;
let leaderboardBtn, submitScoreBtn, playerNameInput;
let gameModeSelect, gameModeLabel;

// Leaderboard Manager
// For testing, we'll use LocalLeaderboard. Switch to LeaderboardManager for production
let leaderboard = null;

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
    leaderboardModal = document.getElementById('leaderboardModal');
    closeInstructions = document.getElementById('closeInstructions');
    closeMenu = document.getElementById('closeMenu');
    closeLeaderboard = document.getElementById('closeLeaderboard');
    alertOkBtn = document.getElementById('alertOkBtn');

    leaderboardBtn = document.getElementById('leaderboardBtn');
    submitScoreBtn = document.getElementById('submitScoreBtn');
    playerNameInput = document.getElementById('playerNameInput');
    gameModeSelect = document.getElementById('gameModeSelect');
    gameModeLabel = document.getElementById('gameModeLabel');

    // Initialize leaderboard
    // For production with GitHub Gist, use:
    // leaderboard = new LeaderboardManager('YOUR_GIST_ID', 'YOUR_GITHUB_TOKEN');
    // For local testing:
    leaderboard = new LocalLeaderboard();

    // Event Listeners
    startGameBtn.addEventListener('click', startNewGame);
    playAgainBtn.addEventListener('click', startNewGame);
    instructionsBtn.addEventListener('click', () => showModal(instructionsModal));
    leaderboardBtn.addEventListener('click', showLeaderboard);
    closeInstructions.addEventListener('click', () => hideModal(instructionsModal));
    closeMenu.addEventListener('click', () => hideModal(menuModal));
    closeLeaderboard.addEventListener('click', () => hideModal(leaderboardModal));
    alertOkBtn.addEventListener('click', () => hideModal(alertModal));
    backBtn.addEventListener('click', goBack);
    giveUpBtn.addEventListener('click', giveUp);
    submitScoreBtn.addEventListener('click', submitScore);
    
    // Game mode selector
    if (gameModeSelect) {
        gameModeSelect.addEventListener('change', (e) => {
            gameMode = e.target.value;
            updateGameModeLabel();
            console.log('Game mode changed to:', gameMode);
        });
    }

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

    // Leaderboard mode tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const mode = e.target.dataset.mode;
            if (mode) {
                loadLeaderboardData(mode);
            }
        });
    });

    document.getElementById('retryLeaderboard').addEventListener('click', () => {
        loadLeaderboardData('global');
    });

    console.log('The Wiki Game loaded successfully!');
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

// Update game mode label
function updateGameModeLabel() {
    if (gameModeLabel) {
        if (gameMode === 'ultra') {
            gameModeLabel.textContent = '⚡ ULTRA HARD MODE';
            gameModeLabel.style.color = '#9333ea';
            gameModeLabel.style.fontWeight = '700';
        } else if (gameMode === 'hard') {
            gameModeLabel.textContent = '🔥 HARD MODE';
            gameModeLabel.style.color = '#ff6b6b';
            gameModeLabel.style.fontWeight = '600';
        } else {
            gameModeLabel.textContent = 'Normal Mode';
            gameModeLabel.style.color = '#6c757d';
            gameModeLabel.style.fontWeight = '500';
        }
    }
}

// Get page pool based on game mode
function getPagePool() {
    if (gameMode === 'ultra') {
        // Ultra mode: combine all three pools
        return [...popularPages, ...obscurePages, ...ultraObscurePages];
    } else if (gameMode === 'hard') {
        // Hard mode: combine normal and obscure pages
        return [...popularPages, ...obscurePages];
    }
    return popularPages;
}

// Game Functions
function startNewGame() {
    gameState.state = 'loading';
    showScreen(loadingScreen);

    // Reset game state
    gameState.clickCount = 0;
    gameState.elapsedTime = 0;
    gameState.navigationHistory = [];

    // Reset submit button for next game
    submitScoreBtn.disabled = false;
    submitScoreBtn.textContent = 'Submit to Leaderboard';
    submitScoreBtn.style.background = '';
    
    // Clear player name input
    playerNameInput.value = '';

    // Get the appropriate page pool based on game mode
    const pagePool = getPagePool();
    
    // Select two different random pages
    const shuffled = [...pagePool].sort(() => Math.random() - 0.5);
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

// Leaderboard Functions
async function showLeaderboard() {
    showModal(leaderboardModal);
    loadLeaderboardData('normal');
}

async function loadLeaderboardData(mode = 'normal') {
    const loadingEl = document.getElementById('leaderboardLoading');
    const dataEl = document.getElementById('leaderboardData');
    const errorEl = document.getElementById('leaderboardError');
    
    // Show loading
    loadingEl.style.display = 'flex';
    dataEl.style.display = 'none';
    errorEl.style.display = 'none';
    
    try {
        let entries = [];
        
        // Get entries filtered by mode
        entries = await leaderboard.getTopScores(10, mode);
        
        // Display entries
        displayLeaderboardEntries(entries, mode);
        
        // Show data
        loadingEl.style.display = 'none';
        dataEl.style.display = 'block';
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'flex';
    }
}

function displayLeaderboardEntries(entries, mode = 'normal') {
    const tbody = document.getElementById('leaderboardEntries');
    tbody.innerHTML = '';
    
    // Update leaderboard title
    const leaderboardTitle = document.querySelector('#leaderboardModal h2');
    if (leaderboardTitle) {
        if (mode === 'ultra') {
            leaderboardTitle.textContent = '⚡ Ultra Hard Mode Leaderboard';
        } else if (mode === 'hard') {
            leaderboardTitle.textContent = '🔥 Hard Mode Leaderboard';
        } else {
            leaderboardTitle.textContent = '🏆 Normal Mode Leaderboard';
        }
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
        const rankBadge = `<div class="rank-badge ${rankClass}">${rank}</div>`;
        
        // Dynamic difficulty display
        const difficulty = entry.difficulty || 1.5;
        let difficultyLabel = '⭐';
        if (difficulty >= 2.5) difficultyLabel = '⭐⭐⭐⭐';
        else if (difficulty >= 2.0) difficultyLabel = '⭐⭐⭐';
        else if (difficulty >= 1.5) difficultyLabel = '⭐⭐';
        else if (difficulty >= 1.0) difficultyLabel = '⭐';
        else difficultyLabel = '✓'; // Very easy
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rankBadge}</td>
            <td><strong>${escapeHtml(entry.playerName)}</strong></td>
            <td class="route-info">${escapeHtml(entry.startPage)} → ${escapeHtml(entry.targetPage)}</td>
            <td>${entry.clicks}</td>
            <td>${formatTime(entry.time)}</td>
            <td><span class="difficulty-badge">${difficultyLabel}</span></td>
            <td><span class="score-badge">${entry.score}</span></td>
        `;
        tbody.appendChild(row);
    });
}

async function submitScore() {
    if (gameState.state !== 'won') return;
    
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    
    // Disable button and show loading
    submitScoreBtn.disabled = true;
    submitScoreBtn.textContent = 'Submitting...';
    
    try {
        const result = await leaderboard.submitScore(
            playerName,
            gameState.startPage,
            gameState.targetPage,
            gameState.clickCount,
            gameState.elapsedTime,
            gameMode  // Pass game mode to leaderboard
        );
        
        if (result.success) {
            const difficultyText = result.entry.difficulty >= 2.5 ? 'Very Hard ⭐⭐⭐⭐' :
                                   result.entry.difficulty >= 2.0 ? 'Hard ⭐⭐⭐' :
                                   result.entry.difficulty >= 1.5 ? 'Medium ⭐⭐' : 'Easy ⭐';
            
            // Calculate time bonus for display
            const expectedTime = result.entry.clicks * 15;
            const speedRatio = expectedTime / Math.max(result.entry.time, 1);
            let speedText = '';
            if (speedRatio >= 2.0) speedText = ' (Lightning fast! ⚡)';
            else if (speedRatio >= 1.5) speedText = ' (Very fast! 🚀)';
            else if (speedRatio >= 1.0) speedText = ' (Good speed! ✓)';
            
            const modeText = gameMode === 'ultra' ? '\nMode: ⚡ ULTRA HARD MODE' :
                             gameMode === 'hard' ? '\nMode: 🔥 HARD MODE' : '\nMode: Normal';
            
            showAlert(
                '🎉 Score Submitted!',
                `Rank: #${result.rank}\nScore: ${result.entry.score} points (Higher is better!)\nDifficulty: ${difficultyText}\n${result.entry.clicks} clicks in ${formatTime(result.entry.time)}${speedText}${modeText}`
            );
            submitScoreBtn.textContent = '✓ Submitted';
            submitScoreBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else {
            throw new Error(result.error || 'Failed to submit score');
        }
    } catch (error) {
        console.error('Error submitting score:', error);
        showAlert('Error', 'Failed to submit score. Please try again.');
        submitScoreBtn.disabled = false;
        submitScoreBtn.textContent = 'Submit to Leaderboard';
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
