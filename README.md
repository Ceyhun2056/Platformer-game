# 🍄 Super Mario Platformer

A complete 2D platformer game built using only HTML5 Canvas, CSS, and JavaScript. Experience classic platformer gameplay with modern web technologies!

## 🎮 Features

### Core Gameplay
- **Scrolling tile-based levels** with ground blocks and platforms
- **Player character** with keyboard and mobile touch controls
- **Physics system** with gravity and collision detection
- **Enemy AI** that patrols areas and damages the player
- **Collectible coins** for scoring
- **Level completion** with flag endpoint

### Advanced Features
- **Multiple screens**: Start screen, instructions, game over, and victory
- **Sound effects** for jump, coin collection, enemy defeat, and death
- **Smooth animations** using requestAnimationFrame
- **Parallax background** with clouds and mountains
- **Particle effects** for visual feedback
- **Lives system** with invulnerability frames
- **Mobile controls** with touch buttons
- **Responsive design** for different screen sizes

### Technical Implementation
- **Clean, modular code** with object-oriented design
- **Level data** stored as 2D arrays for easy modification
- **Camera system** that follows the player
- **Collision detection** for platforms, enemies, and collectibles
- **Audio system** using Web Audio API

## 🕹️ Controls

### Desktop
- **Arrow Keys** or **WASD** - Move left/right
- **Space** or **Up Arrow** - Jump

### Mobile
- **Touch buttons** at the bottom of the screen
- **Left/Right arrows** - Move
- **Up arrow** - Jump

## 🎯 How to Play

1. **Collect coins** (🪙) to increase your score
2. **Avoid enemies** (👹) or jump on them to defeat them
3. **Navigate platforms** and avoid falling
4. **Reach the flag** (🏁) to complete the level
5. **Don't lose all your lives!** (❤️)

## 🚀 Getting Started

1. Open `index.html` in your web browser
2. Click "Start Game" to begin
3. Enjoy the platformer adventure!

## 📁 File Structure

```
Platformer-game/
├── index.html          # Main HTML file with game structure
├── style.css           # Complete CSS styling and responsive design
├── game.js             # Full game engine and logic
└── README.md           # This documentation
```

## 🎨 Game Objects

### Player
- **Mario-like character** with hat, mustache, and overalls
- **Direction-based sprite** flipping
- **Invulnerability frames** after taking damage
- **Smooth movement** and jumping physics

### Enemies
- **Patrolling AI** that reverses direction at walls
- **Can be defeated** by jumping on them
- **Damage player** on contact
- **Particle effects** when destroyed

### Coins
- **Floating animation** with smooth bobbing
- **Sparkle particles** when collected
- **Score rewards** for collection

### Platforms
- **Ground tiles** with grass texture
- **Floating platforms** with wooden texture
- **Solid collision** detection

### Flag
- **Animated flag** with waving effect
- **Level completion** trigger
- **Victory celebration**

## 🔧 Technical Details

### Performance
- **60 FPS** game loop using requestAnimationFrame
- **Efficient rendering** with camera culling
- **Optimized collision detection**

### Browser Compatibility
- **Modern browsers** with HTML5 Canvas support
- **Mobile friendly** with touch controls
- **Web Audio API** for sound effects

### Customization
- **Level data** can be easily modified in the `levelData` array
- **Game constants** at the top of `game.js` for easy tweaking
- **Modular class structure** for extending gameplay

## 🎵 Sound Effects

- **Jump** - Classic platformer jump sound
- **Coin** - Satisfying collection chime
- **Enemy defeat** - Impact sound when jumping on enemies
- **Death** - Player damage/death sound
- **Victory** - Level completion fanfare

## 📱 Mobile Support

The game includes full mobile support with:
- **Touch controls** that appear on smaller screens
- **Responsive design** that adapts to different screen sizes
- **Optimized performance** for mobile devices

## 🎮 Level Design

The level is designed as a 2D array where:
- `0` = Empty space
- `1` = Ground block
- `2` = Platform
- `3` = Coin
- `4` = Enemy spawn point
- `5` = Flag (level end)

## 🏆 Scoring System

- **Coins**: 50 points each
- **Enemy defeat**: 100 points each
- **Level completion bonus**: 1000 points per remaining life

## 🚧 Future Enhancements

Potential additions for expanded gameplay:
- Multiple levels
- Power-ups and abilities
- Different enemy types
- Boss battles
- Local storage for high scores
- Additional characters

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy the game!** 🎮✨
