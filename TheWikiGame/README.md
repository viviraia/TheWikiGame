# The Wiki Game 🌐 - Web Version

A Progressive Web App (PWA) where players navigate from one Wikipedia page to another using only article links!

## 🚀 Quick Start

### Option 1: Open Locally (Simple)

1. Open `index.html` directly in your browser:
   - **Windows**: Double-click `index.html` OR right-click → Open with → Chrome/Edge/Firefox
   - **Mac/Linux**: Double-click `index.html`

2. Start playing! 🎮

> **Note**: Some browsers may have CORS restrictions when opening files directly. If the Wikipedia pages don't load, use Option 2 below.

### Option 2: Use a Local Server (Recommended)

#### Using Python (if installed):
```bash
# Navigate to the web folder
cd web

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

#### Using Node.js (if installed):
```bash
# Install http-server globally (one time)
npm install -g http-server

# Navigate to the web folder
cd web

# Start server
http-server -p 8000
```

Then open: `http://localhost:8000`

#### Using PHP (if installed):
```bash
cd web
php -S localhost:8000
```

Then open: `http://localhost:8000`

#### Using VS Code:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 📱 Install as Mobile App

### On iPhone/iPad:
1. Open the game in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. The game icon will appear on your home screen!

### On Android:
1. Open the game in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen" or "Install app"
4. Tap "Add" or "Install"
5. The game icon will appear on your home screen!

### On Windows:
1. Open the game in Chrome or Edge
2. Click the install icon (➕ or computer icon) in the address bar
3. Click "Install"

### On Mac:
1. Open the game in Chrome or Safari
2. Click the install icon in the address bar
3. Click "Install"

## 🎮 How to Play

1. **Start Game** - Begin with random Wikipedia pages
2. **Navigate** - Click only on links within articles
3. **Reach Target** - Find your way to the target page
4. **Track Stats** - Monitor your clicks and time
5. **Use Hints** - Get help when stuck
6. **Challenge Yourself** - Beat your best time!

## ✨ Features

- ✅ **Works Everywhere**: Windows, Mac, Linux, iOS, Android
- ✅ **No Installation Required**: Play in any browser
- ✅ **Installable as App**: Add to home screen on mobile
- ✅ **Offline Support**: Core app works without internet (Wikipedia needs connection)
- ✅ **Responsive Design**: Works on phones, tablets, and desktops
- ✅ **Beautiful UI**: Modern, gradient backgrounds, smooth animations
- ✅ **Game Stats**: Track clicks and time
- ✅ **Hints System**: Get help when stuck
- ✅ **History Navigation**: Back button to undo moves

## 🛠️ Technical Details

### Built With:
- **HTML5** - Structure
- **CSS3** - Styling with flexbox, animations
- **JavaScript (Vanilla)** - No frameworks needed!
- **PWA** - Progressive Web App features
- **Service Worker** - Offline support and caching

### Browser Support:
- ✅ Chrome/Edge (Windows, Mac, Linux, Android)
- ✅ Safari (Mac, iOS)
- ✅ Firefox (Windows, Mac, Linux)
- ✅ Opera
- ✅ Samsung Internet

### Requirements:
- Modern web browser (2020+)
- Internet connection (for Wikipedia content)
- JavaScript enabled

## 📂 Project Structure

```
web/
├── index.html          # Main HTML file
├── styles.css          # All styles
├── app.js              # Game logic
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline support
└── README.md           # This file
```

## 🎯 Game Features

### Gameplay:
- **45+ Wikipedia topics** for variety
- **Smart navigation tracking** - Detects page changes
- **Click counter** - Track your efficiency
- **Timer** - Challenge yourself
- **Back button** - Undo mistakes
- **Hints** - Get helpful clues
- **Win detection** - Automatic target recognition

### UI/UX:
- **Beautiful gradient backgrounds**
- **Smooth animations**
- **Responsive design** - Mobile-first approach
- **Touch-friendly buttons**
- **Clear game states** - Welcome, Loading, Playing, Won
- **Modal dialogs** - Instructions, hints, alerts
- **Menu system** - Easy navigation

## 🔧 Customization

### Add More Starting Pages:
Edit `app.js` and modify the `popularPages` array:

```javascript
const popularPages = [
    "Your_Topic_Here",
    "Another_Topic",
    // ... add more
];
```

### Change Colors:
Edit `styles.css` and modify the CSS variables:

```css
:root {
    --primary-color: #6366f1;  /* Change this */
    --secondary-color: #8b5cf6; /* And this */
    /* ... */
}
```

### Adjust Difficulty:
Edit `app.js` to change how pages are selected or add filtering logic.

## 🐛 Known Issues & Limitations

1. **Cross-Origin Restrictions**: 
   - Due to browser security, we can't intercept clicks inside Wikipedia's iframe perfectly
   - The game detects URL changes to track navigation
   - Some clicks may not register immediately

2. **Mobile Wikipedia**:
   - Uses `en.m.wikipedia.org` for better mobile experience
   - Some advanced features may not work on mobile version

3. **External Links**:
   - Links to external sites are blocked
   - Only Wikipedia article links work

## 🚀 Deployment Options

### Deploy to Hosting:
1. **GitHub Pages** (Free):
   - Upload files to a GitHub repo
   - Enable GitHub Pages in settings
   - Access at: `https://username.github.io/repo-name/`

2. **Netlify** (Free):
   - Drag and drop the `web` folder to netlify.com
   - Get instant HTTPS URL

3. **Vercel** (Free):
   - Upload to Vercel.com
   - Automatic deployment

4. **Any Web Host**:
   - Upload all files via FTP
   - Works on any static hosting

## 📈 Future Improvements

- [ ] Multiplayer mode
- [ ] Daily challenges
- [ ] Global leaderboards
- [ ] Share results on social media
- [ ] Different difficulty levels
- [ ] Multiple language support
- [ ] Dark mode toggle
- [ ] Game history/statistics
- [ ] Achievement system
- [ ] Sound effects
- [ ] Better Wikipedia integration
- [ ] Tutorial mode

## 💡 Tips for Best Experience

1. **Use a modern browser** (Chrome, Edge, Safari)
2. **Run from a local server** for best compatibility
3. **Install as PWA** on mobile for app-like experience
4. **Good internet connection** for fast Wikipedia loading
5. **Portrait mode** recommended on mobile

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit improvements
- Share with friends!

## 📄 License

Free to use for personal and educational purposes.

## 🎮 Have Fun!

Enjoy exploring Wikipedia in a whole new way! 🌐📚

---

**Made with ❤️ for curious minds everywhere!**
