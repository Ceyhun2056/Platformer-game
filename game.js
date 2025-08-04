/* ========================================
   SUPER MARIO PLATFORMER - GAME ENGINE
   Complete 2D platformer with all features
   ======================================== */

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 32;
const GRAVITY = 0.5;
const FRICTION = 0.8;
const JUMP_FORCE = -12;
const PLAYER_SPEED = 5;
const PLAYER_GROW_MULTIPLIER = 1.5;
const FIREBALL_SPEED = 8;

// Game state
let gameState = 'menu'; // menu, playing, paused, gameOver, victory
let canvas, ctx;
let camera = { x: 0, y: 0 };
let score = 0;
let lives = 3;
let coinsCollected = 0;
let totalCoins = 0;
let gameTimer = 180; // 3 minutes timer
let timerInterval = null;
let lastCheckpoint = null;

// Game objects
let player = null;
let enemies = [];
let coins = [];
let platforms = [];
let movingPlatforms = [];
let powerUps = [];
let fireballs = [];
let checkpoints = [];
let background = [];
let particles = [];
let flag = null;

// Input handling
const keys = {};
let touchControls = {
    left: false,
    right: false,
    jump: false
};

// Audio context for sound effects
let audioContext = null;

// Level data - 2D array representing the game world
// 0 = empty, 1 = ground, 2 = platform, 3 = coin, 4 = enemy spawn, 5 = flag
// 6 = Mushroom, 7 = Star, 8 = Checkpoint, 9 = Moving Platform
const levelData = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,2,2,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,3,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,2,2,0,2,2,0,2,2,0,2,2,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,3,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,4,0,4,0,4,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// ========================================
// INITIALIZATION
// ========================================

window.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Initializing Super Mario Platformer...');
    
    // Initialize canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    if (!canvas || !ctx) {
        console.error('❌ Failed to initialize canvas');
        return;
    }
    
    // Initialize audio
    initAudio();
    
    // Initialize input handlers
    initInputHandlers();
    
    // Initialize UI event handlers
    initUIHandlers();
    
    // Show start screen
    showScreen('startScreen');
    
    // Start game loop
    gameLoop();
    
    console.log('✅ Game initialized successfully!');
});

// ========================================
// AUDIO SYSTEM
// ========================================

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
        console.warn('Audio not available:', error);
    }
}

function playSound(frequency, duration = 0.2, type = 'square') {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.warn('Sound playback failed:', error);
    }
}

function playSoundEffect(effect) {
    switch (effect) {
        case 'jump':
            playSound(523, 0.1, 'square'); // C5 note
            break;
        case 'coin':
            playSound(800, 0.15, 'sine'); // High pitched coin sound
            break;
        case 'enemy':
            playSound(200, 0.3, 'square'); // Low thud
            break;
        case 'death':
            playSound(150, 0.5, 'triangle'); // Death sound
            break;
        case 'victory':
            playSound(660, 0.8, 'sine'); // Victory fanfare
            break;
        case 'power-down':
            playSound(300, 0.4, 'sawtooth');
            break;
    }
}

// ========================================
// INPUT HANDLING
// ========================================

function initInputHandlers() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        e.preventDefault();
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
        e.preventDefault();
    });
    
    // Mobile touch controls
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const jumpBtn = document.getElementById('jumpBtn');
    
    // Left button
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.left = true;
        leftBtn.classList.add('pressed');
    });
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.left = false;
        leftBtn.classList.remove('pressed');
    });
    leftBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        touchControls.left = true;
        leftBtn.classList.add('pressed');
    });
    leftBtn.addEventListener('mouseup', (e) => {
        e.preventDefault();
        touchControls.left = false;
        leftBtn.classList.remove('pressed');
    });
    
    // Right button
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.right = true;
        rightBtn.classList.add('pressed');
    });
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.right = false;
        rightBtn.classList.remove('pressed');
    });
    rightBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        touchControls.right = true;
        rightBtn.classList.add('pressed');
    });
    rightBtn.addEventListener('mouseup', (e) => {
        e.preventDefault();
        touchControls.right = false;
        rightBtn.classList.remove('pressed');
    });
    
    // Jump button
    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.jump = true;
        jumpBtn.classList.add('pressed');
    });
    jumpBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.jump = false;
        jumpBtn.classList.remove('pressed');
    });
    jumpBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        touchControls.jump = true;
        jumpBtn.classList.add('pressed');
    });
    jumpBtn.addEventListener('mouseup', (e) => {
        e.preventDefault();
        touchControls.jump = false;
        jumpBtn.classList.remove('pressed');
    });
}

function getInput() {
    const input = {
        left: keys['ArrowLeft'] || keys['KeyA'] || touchControls.left,
        right: keys['ArrowRight'] || keys['KeyD'] || touchControls.right,
        jump: keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || touchControls.jump
    };
    return input;
}

// ========================================
// UI HANDLERS
// ========================================

function initUIHandlers() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('instructionsBtn').addEventListener('click', () => showScreen('instructionsScreen'));
    document.getElementById('backBtn').addEventListener('click', () => showScreen('startScreen'));
    document.getElementById('restartBtn').addEventListener('click', startGame);
    document.getElementById('mainMenuBtn').addEventListener('click', () => showScreen('startScreen'));
    document.getElementById('playAgainBtn').addEventListener('click', startGame);
    document.getElementById('victoryMenuBtn').addEventListener('click', () => showScreen('startScreen'));
}

function showScreen(screenId) {
    console.log(`[showScreen] Called with ID: '${screenId}'`);

    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        if (screen.classList.contains('active')) {
            console.log(`[showScreen] Hiding screen: #${screen.id}`);
            screen.classList.remove('active');
        }
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        console.log(`[showScreen] Showing screen: #${targetScreen.id}`);
        targetScreen.classList.add('active');
    } else {
        console.log(`[showScreen] No screen found with ID: '${screenId}'`);
    }
    
    // Show/hide game container
    const gameContainer = document.getElementById('gameContainer');
    if (screenId === 'game') {
        console.log('[showScreen] Attempting to show game container.');
        gameContainer.style.display = 'block';
        gameContainer.classList.remove('hidden');
    } else {
        console.log('[showScreen] Attempting to hide game container.');
        gameContainer.style.display = 'none';
    }

    // Use a timeout to allow the DOM to update before checking the computed style
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(gameContainer);
        console.log(`[showScreen] Computed display for #gameContainer: ${computedStyle.display}`);
        if (screenId === 'game' && computedStyle.display !== 'block') {
            console.error('[showScreen] CRITICAL: #gameContainer is not visible after trying to show it!');
        }
    }, 100);
}

function updateHUD() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('coinsCollected').textContent = coinsCollected;
    document.getElementById('totalCoins').textContent = totalCoins;
    document.getElementById('timer').textContent = gameTimer;
}

// ========================================
// GAME OBJECTS
// ========================================

class Platform {
    constructor(x, y, width, height, type = 'ground') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }
    
    draw() {
        const drawX = this.x - camera.x;
        const drawY = this.y;
        
        if (this.type === 'ground') {
            // Ground texture
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(drawX, drawY, this.width, this.height);
            
            // Grass on top
            ctx.fillStyle = '#228B22';
            ctx.fillRect(drawX, drawY, this.width, 4);
            
            // Dirt texture
            ctx.fillStyle = '#654321';
            for (let i = 0; i < this.width; i += 8) {
                for (let j = 4; j < this.height; j += 8) {
                    if (Math.random() > 0.7) {
                        ctx.fillRect(drawX + i, drawY + j, 2, 2);
                    }
                }
            }
        } else {
            // Platform texture
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(drawX, drawY, this.width, this.height);
            
            // Platform border
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX, drawY, this.width, this.height);
        }
    }
}

class MovingPlatform extends Platform {
    constructor(x, y, width, height, range, speed) {
        super(x, y, width, height, 'moving');
        this.startX = x;
        this.range = range;
        this.speed = speed;
        this.direction = 1;
    }

    update() {
        this.x += this.speed * this.direction;
        if (this.x > this.startX + this.range || this.x < this.startX) {
            this.direction *= -1;
        }
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 32;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.direction = 1; // 1 = right, -1 = left
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.jumpsLeft = 2;
        this.isBig = false;
        this.canShoot = false;
    }
    
    update() {
        const input = getInput();
        
        // Horizontal movement
        if (input.left) {
            this.vx = -PLAYER_SPEED;
            this.direction = -1;
        } else if (input.right) {
            this.vx = PLAYER_SPEED;
            this.direction = 1;
        } else {
            this.vx *= FRICTION;
        }
        
        // Jumping
        if (input.jump && this.jumpsLeft > 0) {
            this.vy = JUMP_FORCE;
            this.onGround = false;
            this.jumpsLeft--;
            playSoundEffect('jump');
        }
        
        // Apply gravity
        this.vy += GRAVITY;
        
        // Limit falling speed
        if (this.vy > 15) this.vy = 15;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Collision detection
        this.checkCollisions();
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime--;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
                if (this.isBig) this.canShoot = false; // Lose star power
            }
        }
        
        // Keep player in world bounds
        if (this.x < 0) this.x = 0;
        if (this.x > levelData[0].length * TILE_SIZE - this.width) {
            this.x = levelData[0].length * TILE_SIZE - this.width;
        }
        
        // Death by falling
        if (this.y > CANVAS_HEIGHT + 100) {
            this.takeDamage();
        }
    }
    
    checkCollisions() {
        this.onGround = false;
        
        // Platform collisions
        const allPlatforms = [...platforms, ...movingPlatforms];
        for (let platform of allPlatforms) {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                // Landing on top
                if (this.vy > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    this.jumpsLeft = 2; // Reset jumps on ground
                }
                // Hitting from below
                else if (this.vy < 0 && this.y > platform.y) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
                // Side collisions
                else if (this.vx > 0) {
                    this.x = platform.x - this.width;
                    this.vx = 0;
                } else if (this.vx < 0) {
                    this.x = platform.x + platform.width;
                    this.vx = 0;
                }
            }
        }
    }
    
    takeDamage() {
        if (this.invulnerable) return;

        if (this.isBig) {
            this.isBig = false;
            this.width /= PLAYER_GROW_MULTIPLIER;
            this.height /= PLAYER_GROW_MULTIPLIER;
            this.invulnerable = true;
            this.invulnerabilityTime = 120; // 2 seconds of invulnerability after losing power-up
            playSoundEffect('power-down'); // A sound for losing a power-up
            return;
        }
        
        lives--;
        playSoundEffect('death');
        
        if (lives <= 0) {
            gameOver();
        } else {
            // Reset position and make invulnerable
            if (lastCheckpoint) {
                this.x = lastCheckpoint.x;
                this.y = lastCheckpoint.y;
            } else {
                this.x = 100;
                this.y = 400;
            }
            this.vx = 0;
            this.vy = 0;
            this.invulnerable = true;
            this.invulnerabilityTime = 120; // 2 seconds at 60fps
            this.isBig = false;
            this.canShoot = false;
            this.width = 24;
            this.height = 32;
        }
    }

    grow() {
        if (!this.isBig) {
            this.isBig = true;
            this.y -= this.height * (PLAYER_GROW_MULTIPLIER - 1);
            this.width *= PLAYER_GROW_MULTIPLIER;
            this.height *= PLAYER_GROW_MULTIPLIER;
        }
    }

    getStar() {
        this.invulnerable = true;
        this.invulnerabilityTime = 600; // 10 seconds
        this.canShoot = true;
    }
    
    draw() {
        ctx.save();
        
        // Flashing effect when invulnerable
        if (this.invulnerable && Math.floor(this.invulnerabilityTime / 5) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // Translate to player position
        ctx.translate(this.x - camera.x + this.width/2, this.y + this.height/2);
        
        // Flip horizontally if moving left
        if (this.direction === -1) {
            ctx.scale(-1, 1);
        }
        
        // Draw Mario-like character
        const centerX = -this.width/2;
        const centerY = -this.height/2;
        
        // Define colors based on state
        const bodyColor = this.isBig ? '#E67E22' : '#FF0000'; // Orange when big, red when small
        const hatColor = this.isBig ? '#D35400' : '#CC0000'; // Darker orange when big
        const overallsColor = '#0066CC';

        // Body
        ctx.fillStyle = this.canShoot ? '#FFFF00' : bodyColor;
        ctx.fillRect(centerX + 2, centerY + 8, this.width - 4, 16);
        
        // Head
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(centerX + 4, centerY, this.width - 8, 12);
        
        // Hat
        ctx.fillStyle = hatColor;
        ctx.fillRect(centerX + 2, centerY - 2, this.width - 4, 6);
        
        // Legs
        ctx.fillStyle = overallsColor;
        ctx.fillRect(centerX + 4, centerY + 24, 6, 8);
        ctx.fillRect(centerX + this.width - 10, centerY + 24, 6, 8);
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX + 6, centerY + 3, 2, 2);
        ctx.fillRect(centerX + this.width - 8, centerY + 3, 2, 2);
        
        // Mustache
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(centerX + 6, centerY + 7, this.width - 12, 2);
        
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.vx = -1;
        this.vy = 0;
        this.direction = -1;
        this.alive = true;
    }
    
    update() {
        if (!this.alive) return;
        
        // Move horizontally
        this.x += this.vx;
        
        // Apply gravity
        this.vy += GRAVITY;
        this.y += this.vy;
        
        // Check collisions
        this.checkCollisions();
        
        // Reverse direction at edges or walls
        if (this.x <= 0 || this.x >= levelData[0].length * TILE_SIZE - this.width) {
            this.vx *= -1;
            this.direction *= -1;
        }
        
        // Check collision with player
        if (player && this.alive && !player.invulnerable &&
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y) {
            
            // Player jumped on enemy
            if (player.vy > 0 && player.y < this.y) {
                this.destroy();
                player.vy = -8; // Bounce player up
                score += 100;
                playSoundEffect('enemy');
            } else {
                // Enemy damages player
                player.takeDamage();
            }
        }
    }
    
    checkCollisions() {
        this.onGround = false;
        
        for (let platform of platforms) {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                // Landing on top
                if (this.vy > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
                // Hit wall - reverse direction
                else if ((this.vx > 0 && this.x < platform.x) || 
                         (this.vx < 0 && this.x > platform.x)) {
                    this.vx *= -1;
                    this.direction *= -1;
                }
            }
        }
    }
    
    destroy() {
        this.alive = false;
        // Add death particle effect
        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(
                this.x + this.width/2,
                this.y + this.height/2,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                '#FF0000',
                30
            ));
        }
    }
    
    draw() {
        if (!this.alive) return;
        
        ctx.save();
        ctx.translate(this.x - camera.x + this.width/2, this.y + this.height/2);
        
        if (this.direction === 1) {
            ctx.scale(-1, 1);
        }
        
        const centerX = -this.width/2;
        const centerY = -this.height/2;
        
        // Body
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(centerX, centerY + 8, this.width, this.height - 8);
        
        // Head
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(centerX + 2, centerY, this.width - 4, 12);
        
        // Spikes
        ctx.fillStyle = '#660000';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(centerX + 2 + i * 6, centerY - 3, 4, 6);
        }
        
        // Eyes
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(centerX + 4, centerY + 2, 3, 3);
        ctx.fillRect(centerX + this.width - 7, centerY + 2, 3, 3);
        
        // Pupils
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX + 5, centerY + 3, 1, 1);
        ctx.fillRect(centerX + this.width - 6, centerY + 3, 1, 1);
        
        // Angry mouth
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX + 6, centerY + 7, this.width - 12, 2);
        
        ctx.restore();
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.type = type; // 'mushroom' or 'star'
        this.collected = false;
    }

    update() {
        if (this.collected) return;

        if (player &&
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y) {
            
            this.collect();
        }
    }

    collect() {
        this.collected = true;
        playSoundEffect('coin'); // Placeholder sound
        if (this.type === 'mushroom') {
            player.grow();
            score += 1000;
        } else if (this.type === 'star') {
            player.getStar();
            score += 2000;
        }
    }

    draw() {
        if (this.collected) return;
        const drawX = this.x - camera.x;
        const drawY = this.y;

        if (this.type === 'mushroom') {
            // Stem
            ctx.fillStyle = '#F0DBC0'; // Light beige
            ctx.fillRect(drawX + this.width * 0.25, drawY + this.height * 0.5, this.width * 0.5, this.height * 0.5);

            // Cap
            ctx.fillStyle = '#D9534F'; // Red cap
            ctx.beginPath();
            ctx.arc(drawX + this.width / 2, drawY + this.height * 0.5, this.width / 2, Math.PI, 2 * Math.PI);
            ctx.fill();

            // Spots
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(drawX + this.width * 0.3, drawY + this.height * 0.3, this.width * 0.1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(drawX + this.width * 0.7, drawY + this.height * 0.4, this.width * 0.12, 0, 2 * Math.PI);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = 'black';
            ctx.fillRect(drawX + this.width * 0.3, drawY + this.height * 0.6, 2, 4);
            ctx.fillRect(drawX + this.width * 0.6, drawY + this.height * 0.6, 2, 4);

        } else if (this.type === 'star') {
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(drawX + this.width / 2, drawY);
            ctx.lineTo(drawX + this.width * 0.6, drawY + this.height * 0.4);
            ctx.lineTo(drawX + this.width, drawY + this.height * 0.4);
            ctx.lineTo(drawX + this.width * 0.7, drawY + this.height * 0.6);
            ctx.lineTo(drawX + this.width * 0.8, drawY + this.height);
            ctx.lineTo(drawX + this.width / 2, drawY + this.height * 0.8);
            ctx.lineTo(drawX + this.width * 0.2, drawY + this.height);
            ctx.lineTo(drawX + this.width * 0.3, drawY + this.height * 0.6);
            ctx.lineTo(drawX, drawY + this.height * 0.4);
            ctx.lineTo(drawX + this.width * 0.4, drawY + this.height * 0.4);
            ctx.closePath();
            ctx.fill();
        }
    }
}

class Checkpoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE * 2;
        this.activated = false;
    }

    update() {
        if (!this.activated && player &&
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y) {
            
            this.activate();
        }
    }

    activate() {
        this.activated = true;
        lastCheckpoint = { x: this.x, y: this.y };
        playSoundEffect('victory'); // Placeholder sound
    }

    draw() {
        const drawX = this.x - camera.x;
        const drawY = this.y;
        ctx.fillStyle = this.activated ? 'gold' : 'grey';
        ctx.fillRect(drawX, drawY, this.width, this.height);
    }
}

class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.collected = false;
        this.animationFrame = 0;
        this.bobOffset = 0;
    }
    
    update() {
        if (this.collected) return;
        
        // Floating animation
        this.animationFrame++;
        this.bobOffset = Math.sin(this.animationFrame * 0.1) * 2;
        
        // Check collision with player
        if (player &&
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y + this.bobOffset < player.y + player.height &&
            this.y + this.bobOffset + this.height > player.y) {
            
            this.collect();
        }
    }
    
    collect() {
        this.collected = true;
        coinsCollected++;
        score += 50;
        playSoundEffect('coin');
        
        // Add sparkle particles
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(
                this.x + this.width/2,
                this.y + this.height/2,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                '#FFD700',
                20
            ));
        }
    }
    
    draw() {
        if (this.collected) return;
        
        const drawX = this.x - camera.x;
        const drawY = this.y + this.bobOffset;
        
        // Coin body
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(drawX + 2, drawY, this.width - 4, this.height);
        ctx.fillRect(drawX, drawY + 2, this.width, this.height - 4);
        
        // Inner shine
        ctx.fillStyle = '#FFF700';
        ctx.fillRect(drawX + 4, drawY + 2, this.width - 8, this.height - 4);
        
        // Dollar sign
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(drawX + 6, drawY + 3, 2, 10);
        ctx.fillRect(drawX + 4, drawY + 5, 6, 2);
        ctx.fillRect(drawX + 4, drawY + 9, 6, 2);
    }
}

class Flag {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 128;
        this.touched = false;
        this.animationFrame = 0;
    }
    
    update() {
        this.animationFrame++;
        
        // Check collision with player
        if (player && !this.touched &&
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y) {
            
            this.touched = true;
            victory();
        }
    }
    
    draw() {
        const drawX = this.x - camera.x;
        const drawY = this.y;
        
        // Flagpole
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(drawX + 14, drawY, 4, this.height);
        
        // Flag
        const flagWave = Math.sin(this.animationFrame * 0.1) * 3;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(drawX + 18, drawY + 10, 20 + flagWave, 15);
        
        // Flag pattern
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(drawX + 20, drawY + 12, 6, 3);
        ctx.fillRect(drawX + 20, drawY + 18, 6, 3);
        
        // Top ornament
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(drawX + 13, drawY - 5, 6, 6);
    }
}

class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // Gravity for particles
        this.life--;
    }
    
    draw() {
        if (this.life <= 0) return;
        
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camera.x, this.y, 3, 3);
        ctx.globalAlpha = 1;
    }
}

// ========================================
// LEVEL LOADING
// ========================================

function loadLevel() {
    // Clear existing objects
    enemies = [];
    coins = [];
    platforms = [];
    movingPlatforms = [];
    powerUps = [];
    checkpoints = [];
    particles = [];
    flag = null;
    totalCoins = 0;
    
    // Parse level data
    for (let row = 0; row < levelData.length; row++) {
        for (let col = 0; col < levelData[row].length; col++) {
            const tile = levelData[row][col];
            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;
            
            switch (tile) {
                case 1: // Ground
                    platforms.push(new Platform(x, y, TILE_SIZE, TILE_SIZE, 'ground'));
                    break;
                case 2: // Platform
                    platforms.push(new Platform(x, y, TILE_SIZE, TILE_SIZE, 'platform'));
                    break;
                case 3: // Coin
                    coins.push(new Coin(x + 8, y + 8));
                    totalCoins++;
                    break;
                case 4: // Enemy
                    enemies.push(new Enemy(x, y - TILE_SIZE));
                    break;
                case 5: // Flag
                    flag = new Flag(x, y - TILE_SIZE);
                    break;
                case 6: // Mushroom
                    powerUps.push(new PowerUp(x, y, 'mushroom'));
                    break;
                case 7: // Star
                    powerUps.push(new PowerUp(x, y, 'star'));
                    break;
                case 8: // Checkpoint
                    checkpoints.push(new Checkpoint(x, y - TILE_SIZE));
                    break;
                case 9: // Moving Platform
                    movingPlatforms.push(new MovingPlatform(x, y, TILE_SIZE * 3, TILE_SIZE / 2, 150, 1));
                    break;
            }
        }
    }
    
    console.log(`Level loaded: ${platforms.length} platforms, ${coins.length} coins, ${enemies.length} enemies`);
}

// ========================================
// CAMERA SYSTEM
// ========================================

function updateCamera() {
    if (!player) return;
    
    // Follow player with offset
    const targetX = player.x - CANVAS_WIDTH / 2;
    camera.x = Math.max(0, Math.min(targetX, levelData[0].length * TILE_SIZE - CANVAS_WIDTH));
    
    // Smooth camera movement
    camera.x = camera.x * 0.1 + camera.x * 0.9;
}

// ========================================
// BACKGROUND RENDERING
// ========================================

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Parallax clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
        const cloudX = (i * 200 - camera.x * 0.5) % (CANVAS_WIDTH + 100) - 50;
        const cloudY = 50 + i * 30;
        
        // Simple cloud shape
        ctx.fillRect(cloudX, cloudY, 60, 20);
        ctx.fillRect(cloudX + 10, cloudY - 10, 40, 20);
        ctx.fillRect(cloudX + 20, cloudY - 15, 20, 20);
    }
    
    // Distant mountains (parallax)
    ctx.fillStyle = 'rgba(34, 139, 34, 0.6)';
    for (let i = 0; i < 10; i++) {
        const mountainX = (i * 100 - camera.x * 0.3) % (CANVAS_WIDTH + 200) - 100;
        const mountainHeight = 100 + Math.sin(i) * 50;
        
        ctx.beginPath();
        ctx.moveTo(mountainX, CANVAS_HEIGHT);
        ctx.lineTo(mountainX + 50, CANVAS_HEIGHT - mountainHeight);
        ctx.lineTo(mountainX + 100, CANVAS_HEIGHT);
        ctx.closePath();
        ctx.fill();
    }
}

// ========================================
// GAME LOOP
// ========================================

function gameLoop() {
    if (gameState === 'playing') {
        update();
        render();
    }
    
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update player
    if (player) {
        player.update();
    }
    
    // Update enemies
    enemies.forEach(enemy => enemy.update());
    
    // Update coins
    coins.forEach(coin => coin.update());

    // Update powerups
    powerUps.forEach(powerUp => powerUp.update());

    // Update moving platforms
    movingPlatforms.forEach(p => p.update());

    // Update checkpoints
    checkpoints.forEach(c => c.update());
    
    // Update flag
    if (flag) {
        flag.update();
    }
    
    // Update particles
    particles = particles.filter(particle => {
        particle.update();
        return particle.life > 0;
    });
    
    // Update camera
    updateCamera();
    
    // Update HUD
    updateHUD();
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw background
    drawBackground();
    
    // Draw platforms
    platforms.forEach(platform => platform.draw());
    movingPlatforms.forEach(platform => platform.draw());
    
    // Draw coins
    coins.forEach(coin => coin.draw());
    
    // Draw powerups
    powerUps.forEach(powerUp => powerUp.draw());

    // Draw checkpoints
    checkpoints.forEach(c => c.draw());

    // Draw enemies
    enemies.forEach(enemy => enemy.draw());
    
    // Draw flag
    if (flag) {
        flag.draw();
    }
    
    // Draw player
    if (player) {
        player.draw();
    }
    
    // Draw particles
    particles.forEach(particle => particle.draw());
}

// ========================================
// GAME STATE MANAGEMENT
// ========================================

function startGame() {
    console.log('🎮 Starting new game...');
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    lives = 3;
    coinsCollected = 0;
    camera = { x: 0, y: 0 };
    lastCheckpoint = null;
    gameTimer = 180;
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        gameTimer--;
        if (gameTimer <= 0) {
            player.takeDamage();
            gameTimer = 180;
        }
    }, 1000);
    
    // Create player
    player = new Player(100, 400);
    
    // Load level
    loadLevel();
    
    // Show game screen
    showScreen('game');
    
    // Update HUD
    updateHUD();
    
    playSoundEffect('jump');
    console.log('✅ Game started successfully!');
}

function gameOver() {
    gameState = 'gameOver';
    showScreen('gameOverScreen');
    if(timerInterval) clearInterval(timerInterval);
}

function victory() {
    gameState = 'victory';
    score += gameTimer * 10; // Bonus points for time left
    showScreen('victoryScreen');
    playSoundEffect('victory');
    if(timerInterval) clearInterval(timerInterval);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

console.log('🎮 Super Mario Platformer loaded successfully!');
