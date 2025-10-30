const fs = require('fs');

// Read the file
let content = fs.readFileSync('app.js', 'utf8');

// List of all invalid pages with their fixes
const fixes = [
    // Popular (3)
    ['Leonardo_da_Vinci_(inventor)', 'Leonardo_da_Vinci'],
    ['Niels_Bohr_(physicist)', 'Niels_Bohr'],
    ['Richard_Feynman_(physicist)', 'Richard_Feynman'],
    
    // Obscure (10)
    ['Alienation_(Marx)', 'Alienation'],
    ['Hildegard_of_Bingen_(composer)', 'Hildegard_of_Bingen'],
    ['Niccolò_Machiavelli_(author)', 'Niccolò_Machiavelli'],
    ['Martin_Luther_(reformer)', 'Martin_Luther'],
    ['Petra_(Jordan)', 'Petra'],
    ['Angkor_(region)', 'Angkor'],
    ['Machu_Picchu_(site)', 'Machu_Picchu'],
    ['Chichen_Itza_(site)', 'Chichen_Itza'],
    ['Carthage_(ancient)', 'Carthage'],
    ['Alexandria_(ancient)', 'Alexandria'],
    
    // Ultra Obscure (50)
    ['Pierre_de_Fermat_(mathematician)', 'Pierre_de_Fermat'],
    ['Blaise_Pascal_(mathematician)', 'Blaise_Pascal'],
    ['Christiaan_Huygens_(scientist)', 'Christiaan_Huygens'],
    ['Leonhard_Euler_(mathematician)', 'Leonhard_Euler'],
    ['Pierre-Simon_Laplace_(mathematician)', 'Pierre-Simon_Laplace'],
    ['Joseph_Fourier_(mathematician)', 'Joseph_Fourier'],
    ['Augustin-Louis_Cauchy_(mathematician)', 'Augustin-Louis_Cauchy'],
    ['Georg_Cantor_(mathematician)', 'Georg_Cantor'],
    ['Boethius_(philosopher)', 'Boethius'],
    ['Galileo_Galilei_(scientist)', 'Galileo_Galilei'],
    ['Johannes_Kepler_(astronomer)', 'Johannes_Kepler'],
    ['Joseph_Priestley_(philosopher)', 'Joseph_Priestley'],
    ['Thomas_Paine_(writer)', 'Thomas_Paine'],
    ['Mary_Wollstonecraft_(writer)', 'Mary_Wollstonecraft'],
    ['Arthur_Schopenhauer_(philosopher)', 'Arthur_Schopenhauer'],
    ['Søren_Kierkegaard_(philosopher)', 'Søren_Kierkegaard'],
    ['Friedrich_Nietzsche_(philosopher)', 'Friedrich_Nietzsche'],
    ['William_James_(philosopher)', 'William_James'],
    ['Henri_Poincaré_(mathematician)', 'Henri_Poincaré'],
    ['Gottlob_Frege_(philosopher)', 'Gottlob_Frege'],
    ['Edmund_Husserl_(philosopher)', 'Edmund_Husserl'],
    ['Émile_Durkheim_(sociologist)', 'Émile_Durkheim'],
    ['Bertrand_Russell_(philosopher)', 'Bertrand_Russell'],
    ['Ludwig_Wittgenstein_(philosopher)', 'Ludwig_Wittgenstein'],
    ['Martin_Heidegger_(philosopher)', 'Martin_Heidegger'],
    ['Jean-Paul_Sartre_(philosopher)', 'Jean-Paul_Sartre'],
    ['Simone_de_Beauvoir_(philosopher)', 'Simone_de_Beauvoir'],
    ['Jürgen_Habermas_(philosopher)', 'Jürgen_Habermas'],
    ['Claudio_Monteverdi_(composer)', 'Claudio_Monteverdi'],
    ['Franz_Liszt_(composer)', 'Franz_Liszt'],
    ['Boethius_(writer)', 'Boethius'],
    ['Jonathan_Swift_(writer)', 'Jonathan_Swift'],
    ['Samuel_Richardson_(novelist)', 'Samuel_Richardson'],
    ['Laurence_Sterne_(writer)', 'Laurence_Sterne'],
    ['Lord_Byron_(poet)', 'Lord_Byron'],
    ['Percy_Bysshe_Shelley_(poet)', 'Percy_Bysshe_Shelley'],
    ['John_Keats_(poet)', 'John_Keats'],
    ['Solon_(poet)', 'Solon'],
    ['Aristarchus_(astronomer)', 'Aristarchus'],
    ['Proclus_(mathematician)', 'Proclus'],
    ['Hypatia_(mathematician)', 'Hypatia'],
    ['Giovanni_Pico_della_Mirandola_(philosopher)', 'Giovanni_Pico_della_Mirandola'],
    ['Francisco_Suárez_(philosopher)', 'Francisco_Suárez'],
    ['Battle_of_Marathon_(490_BC)', 'Battle_of_Marathon'],
    ['Logos_(philosophy)', 'Logos'],
    ['Kink_(physics)', 'Kink'],
    ['Monopole_(physics)', 'Monopole'],
    ['Çatalhöyük_(site)', 'Çatalhöyük'],
    ['Cappadocia_(region)', 'Cappadocia'],
    ['Ani_(city)', 'Ani']
];

console.log(`🔧 Fixing ${fixes.length} invalid Wikipedia pages...\n`);

let fixCount = 0;
for (const [invalid, valid] of fixes) {
    const pattern = `"${invalid}"`;
    const replacement = `"${valid}"`;
    
    if (content.includes(pattern)) {
        content = content.replace(new RegExp(pattern.replace(/[()]/g, '\\$&'), 'g'), replacement);
        fixCount++;
        console.log(`  ✅ ${invalid} → ${valid}`);
    } else {
        console.log(`  ⚠️  ${invalid} not found (may already be fixed)`);
    }
}

// Write back
fs.writeFileSync('app.js', content, 'utf8');

console.log(`\n✨ Fixed ${fixCount} pages!`);
console.log('\n💡 Run "node validate-parenthesis-pages.js" to verify all fixes.');
