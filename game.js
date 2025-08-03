// game.js - Main game logic
// Step 1: Canvas and basic game loop setup

let canvas;
let ctx;

// Initialize canvas and context after DOM loads
function initializeCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        return true;
    }
    console.error('Canvas element not found!');
    return false;
}

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameover'
let score = 0;
let lives = 3;

// Game constants
const TILE_SIZE = 32;
const GRAVITY = 0.5;
const FRICTION = 0.8;
const JUMP_POWER = -12;
const PLAYER_SPEED = 4;
const GAME_TIME = 300; // 5 minutes in seconds

// Camera/viewport
let camera = { x: 0, y: 0 };

// Game timer
let gameTimer = GAME_TIME;
let lastTimeUpdate = Date.now();

// Checkpoint system
let currentCheckpoint = { x: 64, y: 320 };

// Level design using 2D array (Extended for longer gameplay)
// 0 = empty, 1 = ground, 2 = platform, 3 = coin, 4 = enemy spawn, 5 = spikes, 6 = flag, 7 = flying enemy, 8 = mushroom, 9 = star, 10 = checkpoint
const level = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,3,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    // Second section starts here
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    // Third section with more challenges
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1]
];

// Character definitions with better sprites and superpowers
const characters = {
    mario: {
        name: "Mario",
        color: '#ff6b6b',
        hatColor: '#ff0000',
        shirtColor: '#0066ff',
        description: "Classic plumber hero",
        superpower: "Fireball",
        superpowerCooldown: 60, // frames
        superpowerDescription: "Shoots fireballs with SHIFT"
    },
    luigi: {
        name: "Luigi",
        color: '#90EE90',
        hatColor: '#00aa00',
        shirtColor: '#0066ff',
        description: "Mario's brave brother",
        superpower: "SuperJump",
        superpowerCooldown: 120,
        superpowerDescription: "Super high jump with SHIFT"
    },
    princess: {
        name: "Princess",
        color: '#FFB6C1',
        hatColor: '#FFD700',
        shirtColor: '#FF69B4',
        description: "Royal adventurer",
        superpower: "Float",
        superpowerCooldown: 180,
        superpowerDescription: "Float in air with SHIFT"
    },
    knight: {
        name: "Knight",
        color: '#C0C0C0',
        hatColor: '#696969',
        shirtColor: '#8B4513',
        description: "Armored warrior",
        superpower: "Shield",
        superpowerCooldown: 240,
        superpowerDescription: "Temporary invincibility with SHIFT"
    }
};

let selectedCharacter = 'mario';

// Game objects
let player = {
    x: 64,
    y: 320,
    width: 24,
    height: 32,
    vx: 0,
    vy: 0,
    onGround: false,
    character: selectedCharacter,
    invulnerable: false,
    invulnerabilityTimer: 0,
    superpowerCooldown: 0,
    superpowerActive: false,
    superpowerTimer: 0,
    // Power-up system
    powerups: {
        mushroom: { active: false, timer: 0 },
        star: { active: false, timer: 0 },
        fireball: { active: false, timer: 0 }
    },
    size: 1, // 1 = normal, 1.5 = big
    canDoubleJump: false,
    hasDoubleJumped: false
};

let projectiles = [];
let flyingEnemies = [];
let bossEnemies = [];
let powerups = [];
let checkpoints = [];
let movingPlatforms = [];
let breakableBlocks = [];

let coins = [];
let enemies = [];
let flag = null;

// Track collected items by their position
let collectedItems = new Set(); // Format: "row,col"

function getItemKey(row, col) {
    return `${row},${col}`;
}

function isItemCollected(row, col) {
    return collectedItems.has(getItemKey(row, col));
}

function collectItem(row, col) {
    collectedItems.add(getItemKey(row, col));
}

// Input handling
let keys = {};
let mobileInput = { left: false, right: false, jump: false, superpower: false };

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Mobile controls with safety checks
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');
const superpowerBtn = document.getElementById('superpowerBtn');

if (leftBtn) {
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileInput.left = true;
    });
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileInput.left = false;
    });
}

if (rightBtn) {
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileInput.right = true;
    });
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileInput.right = false;
    });
}

if (jumpBtn) {
    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileInput.jump = true;
    });
    jumpBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileInput.jump = false;
    });
}

if (superpowerBtn) {
    superpowerBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileInput.superpower = true;
    });
    superpowerBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileInput.superpower = false;
    });
}

// Initialize game objects from level array
function initializeLevel() {
    coins = [];
    enemies = [];
    flyingEnemies = [];
    bossEnemies = [];
    projectiles = [];
    powerups = [];
    checkpoints = [];
    movingPlatforms = [];
    breakableBlocks = [];
    flag = null;
    collectedItems.clear(); // Reset collected items
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    applyDifficulty(); // Set lives and timer based on difficulty
    lastTimeUpdate = Date.now();
    currentCheckpoint = { x: 64, y: 320 }; // Reset checkpoint
    
    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            const tileType = level[row][col];
            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;
            
            if (tileType === 3) { // Coin
                coins.push({
                    x: x + 8,
                    y: y + 8,
                    width: 16,
                    height: 16,
                    collected: false
                });
            } else if (tileType === 4) { // Ground enemy spawn
                enemies.push({
                    x: x,
                    y: y,
                    width: 24,
                    height: 24,
                    vx: 1,
                    direction: 1,
                    patrolDistance: 96,
                    startX: x,
                    color: '#ff4757',
                    type: 'ground'
                });
            } else if (tileType === 5) { // Flag
                flag = {
                    x: x,
                    y: y - 32, // Make flag taller
                    width: 32,
                    height: 64,
                    touched: false
                };
            } else if (tileType === 6) { // Flying enemy
                flyingEnemies.push({
                    x: x,
                    y: y,
                    width: 20,
                    height: 20,
                    vx: 0.5,
                    vy: 0,
                    direction: 1,
                    patrolDistance: 128,
                    startX: x,
                    startY: y,
                    floatOffset: 0,
                    color: '#9b59b6',
                    type: 'flying'
                });
            } else if (tileType === 7) { // Boss enemy
                bossEnemies.push({
                    x: x,
                    y: y - 16, // Taller boss
                    width: 48,
                    height: 48,
                    vx: 0.5,
                    direction: 1,
                    patrolDistance: 64,
                    startX: x,
                    color: '#e74c3c',
                    health: 3,
                    maxHealth: 3,
                    attackTimer: 0,
                    type: 'boss'
                });
            } else if (tileType === 8) { // Mushroom power-up
                powerups.push({
                    x: x + 8,
                    y: y + 8,
                    width: 16,
                    height: 16,
                    type: 'mushroom',
                    collected: false
                });
            } else if (tileType === 9) { // Star power-up
                powerups.push({
                    x: x + 8,
                    y: y + 8,
                    width: 16,
                    height: 16,
                    type: 'star',
                    collected: false
                });
            } else if (tileType === 10) { // Checkpoint
                checkpoints.push({
                    x: x,
                    y: y - 32,
                    width: 32,
                    height: 64,
                    activated: false
                });
            } else if (tileType === 11) { // Moving platform
                movingPlatforms.push({
                    x: x,
                    y: y,
                    width: TILE_SIZE * 2,
                    height: TILE_SIZE,
                    startX: x,
                    startY: y,
                    vx: 1,
                    vy: 0,
                    direction: 1,
                    range: 96,
                    type: 'horizontal' // or 'vertical'
                });
            } else if (tileType === 12) { // Breakable block
                breakableBlocks.push({
                    x: x,
                    y: y,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    broken: false,
                    health: 1
                });
            }
        }
    }
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function getTileAt(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row >= 0 && row < level.length && col >= 0 && col < level[0].length) {
        return level[row][col];
    }
    return 0;
}

function isCollidingWithTile(x, y, width, height) {
    // Check four corners of the rectangle
    const corners = [
        [x, y],
        [x + width - 1, y],
        [x, y + height - 1],
        [x + width - 1, y + height - 1]
    ];
    
    for (let [cx, cy] of corners) {
        const tile = getTileAt(cx, cy);
        if (tile === 1 || tile === 2) { // Ground or platform
            return true;
        }
    }
    return false;
}

// Player physics and movement
function updatePlayer() {
    // Update power-up timers
    for (let powerupType in player.powerups) {
        if (player.powerups[powerupType].active) {
            if (powerupType === 'star' && Date.now() > player.powerups[powerupType].endTime) {
                player.powerups[powerupType].active = false;
            } else if (powerupType === 'mushroom') {
                // Mushroom stays active until hit
                continue;
            }
        }
    }
    
    // Handle invulnerability timer
    if (player.invulnerable) {
        player.invulnerabilityTimer--;
        if (player.invulnerabilityTimer <= 0) {
            player.invulnerable = false;
        }
    }
    
    // Handle superpower cooldown
    if (player.superpowerCooldown > 0) {
        player.superpowerCooldown--;
    }
    
    // Handle superpower timer
    if (player.superpowerActive) {
        player.superpowerTimer--;
        if (player.superpowerTimer <= 0) {
            player.superpowerActive = false;
        }
    }
    
    // Handle input
    const isLeftPressed = keys['ArrowLeft'] || keys['KeyA'] || mobileInput.left;
    const isRightPressed = keys['ArrowRight'] || keys['KeyD'] || mobileInput.right;
    const isJumpPressed = keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || mobileInput.jump;
    const isSuperPressed = keys['ShiftLeft'] || keys['ShiftRight'] || mobileInput.superpower;
    
    // Use superpower
    if (isSuperPressed && player.superpowerCooldown <= 0) {
        useSuperpower();
    }
    
    // Horizontal movement
    let speed = PLAYER_SPEED;
    if (player.powerups.star.active) speed *= 1.5; // Star makes you faster
    
    if (isLeftPressed) {
        player.vx = -speed;
    } else if (isRightPressed) {
        player.vx = speed;
    } else {
        player.vx *= FRICTION;
    }
    
    // Jumping and double jump
    if (isJumpPressed) {
        if (player.onGround) {
            player.vy = JUMP_POWER;
            player.onGround = false;
            player.hasDoubleJumped = false;
            playSound('jump');
        } else if (player.canDoubleJump && !player.hasDoubleJumped) {
            player.vy = JUMP_POWER * 0.8;
            player.hasDoubleJumped = true;
            playSound('jump');
        }
    }
    
    // Reset double jump when landing
    if (player.onGround) {
        player.hasDoubleJumped = false;
    }
    
    // Apply gravity (except when floating)
    if (!(player.character === 'princess' && player.superpowerActive)) {
        player.vy += GRAVITY;
    } else {
        // Princess floating
        player.vy *= 0.95; // Slow fall
        if (isJumpPressed) {
            player.vy -= 0.3; // Gentle upward movement
        }
    }
    
    // Horizontal collision detection and movement
    player.x += player.vx;
    if (isCollidingWithTile(player.x, player.y, player.width, player.height * player.size)) {
        // Move back and stop horizontal velocity
        player.x -= player.vx;
        player.vx = 0;
    }
    
    // Vertical collision detection and movement
    player.y += player.vy;
    player.onGround = false;
    
    if (isCollidingWithTile(player.x, player.y, player.width, player.height * player.size)) {
        if (player.vy > 0) {
            // Falling - hit ground
            player.onGround = true;
            player.vy = 0;
            // Snap to tile grid
            player.y = Math.floor((player.y + player.height * player.size) / TILE_SIZE) * TILE_SIZE - player.height * player.size;
        } else {
            // Jumping - hit ceiling
            player.vy = 0;
            player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE;
        }
    }
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.y > canvas.height + 100) {
        // Player fell off the world - lose a life
        loseLife();
    }
}

function useSuperpower() {
    const char = characters[player.character];
    player.superpowerCooldown = char.superpowerCooldown;
    
    switch (char.superpower) {
        case 'Fireball':
            // Mario's fireball
            projectiles.push({
                x: player.x + player.width/2,
                y: player.y + player.height/2,
                vx: player.vx > 0 ? 6 : (player.vx < 0 ? -6 : 3),
                vy: -2,
                width: 8,
                height: 8,
                type: 'fireball',
                lifetime: 120
            });
            playSound('fireball');
            break;
            
        case 'SuperJump':
            // Luigi's super jump
            if (player.onGround) {
                player.vy = JUMP_POWER * 1.8;
                player.onGround = false;
                playSound('superjump');
            }
            break;
            
        case 'Float':
            // Princess's float
            player.superpowerActive = true;
            player.superpowerTimer = 300; // 5 seconds
            playSound('float');
            break;
            
        case 'Shield':
            // Knight's shield
            player.superpowerActive = true;
            player.superpowerTimer = 180; // 3 seconds
            player.invulnerable = true;
            player.invulnerabilityTimer = 180;
            playSound('shield');
            break;
    }
}

function loseLife() {
    if (player.invulnerable) return; // Don't lose life if already invulnerable
    
    // Check if player has mushroom power-up (gives one hit protection)
    if (player.powerups.mushroom.active) {
        player.powerups.mushroom.active = false;
        player.size = 1; // Return to normal size
        player.height = 32;
        playSound('powerdown');
        
        // Add brief invulnerability
        player.invulnerable = true;
        player.invulnerabilityTimer = 60; // 1 second
        return; // Don't lose a life
    }
    
    lives--;
    playSound('death');
    updateUI();
    
    if (lives <= 0) {
        showGameOver();
    } else {
        resetPlayerToCheckpoint();
        // Add invulnerability period after respawn
        player.invulnerable = true;
        player.invulnerabilityTimer = 120; // 2 seconds at 60fps
    }
}

function resetPlayerToCheckpoint() {
    player.x = currentCheckpoint.x;
    player.y = currentCheckpoint.y;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.character = selectedCharacter;
    player.superpowerCooldown = 0;
    player.superpowerActive = false;
    player.superpowerTimer = 0;
}

function resetPlayerPosition() {
    player.x = 64;
    player.y = 320;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.character = selectedCharacter;
    player.superpowerCooldown = 0;
    player.superpowerActive = false;
    player.superpowerTimer = 0;
    player.size = 1;
    player.height = 32;
    player.canDoubleJump = false;
    player.hasDoubleJumped = false;
    // Reset power-ups
    for (let powerupType in player.powerups) {
        player.powerups[powerupType].active = false;
        player.powerups[powerupType].timer = 0;
    }
}

// Power-up collection
function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        if (!powerup.collected && checkCollision(player, powerup)) {
            powerup.collected = true;
            
            switch (powerup.type) {
                case 'mushroom':
                    player.powerups.mushroom.active = true;
                    player.powerups.mushroom.timer = 1800; // 30 seconds
                    player.size = 1.5;
                    player.height = 48;
                    score += 500;
                    playSound('powerup');
                    break;
                    
                case 'star':
                    player.powerups.star.active = true;
                    player.powerups.star.timer = 600; // 10 seconds
                    player.invulnerable = true;
                    player.invulnerabilityTimer = 600;
                    score += 1000;
                    playSound('star');
                    break;
            }
            
            powerups.splice(i, 1);
            updateUI();
        }
    }
}

// Checkpoint system
function updateCheckpoints() {
    for (let checkpoint of checkpoints) {
        if (!checkpoint.activated && checkCollision(player, checkpoint)) {
            checkpoint.activated = true;
            currentCheckpoint.x = checkpoint.x + 16;
            currentCheckpoint.y = checkpoint.y + 32;
            score += 200;
            playSound('checkpoint');
            updateUI();
        }
    }
}

// Enemy AI and movement
function updateEnemies() {
    // Ground enemies
    for (let enemy of enemies) {
        // Simple patrol AI
        enemy.x += enemy.vx * enemy.direction;
        
        // Check if enemy should turn around
        const distanceFromStart = Math.abs(enemy.x - enemy.startX);
        if (distanceFromStart > enemy.patrolDistance) {
            enemy.direction *= -1;
        }
        
        // Check if enemy would fall off or hit wall
        const nextX = enemy.x + enemy.vx * enemy.direction;
        if (isCollidingWithTile(nextX, enemy.y, enemy.width, enemy.height) ||
            !isCollidingWithTile(nextX, enemy.y + enemy.height + 1, enemy.width, 1)) {
            enemy.direction *= -1;
        }
        
        // Check collision with player (only if not invulnerable)
        if (!player.invulnerable && checkCollision(player, enemy)) {
            loseLife();
        }
    }
    
    // Flying enemies
    for (let enemy of flyingEnemies) {
        enemy.floatOffset += 0.05;
        enemy.y = enemy.startY + Math.sin(enemy.floatOffset) * 20;
        
        enemy.x += enemy.vx * enemy.direction;
        
        const distanceFromStart = Math.abs(enemy.x - enemy.startX);
        if (distanceFromStart > enemy.patrolDistance) {
            enemy.direction *= -1;
        }
        
        if (!player.invulnerable && checkCollision(player, enemy)) {
            loseLife();
        }
    }
    
    // Boss enemies
    for (let boss of bossEnemies) {
        boss.x += boss.vx * boss.direction;
        
        const distanceFromStart = Math.abs(boss.x - boss.startX);
        if (distanceFromStart > boss.patrolDistance) {
            boss.direction *= -1;
        }
        
        // Boss attack pattern
        boss.attackTimer++;
        if (boss.attackTimer > 180) { // Attack every 3 seconds
            boss.attackTimer = 0;
            // Shoot projectile at player
            const dx = player.x - boss.x;
            const dy = player.y - boss.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 300) { // Only attack if player is close
                projectiles.push({
                    x: boss.x + boss.width/2,
                    y: boss.y + boss.height/2,
                    vx: (dx / distance) * 3,
                    vy: (dy / distance) * 3,
                    width: 12,
                    height: 12,
                    type: 'enemy_projectile',
                    lifetime: 180
                });
            }
        }
        
        if (!player.invulnerable && checkCollision(player, boss)) {
            loseLife();
        }
    }
}

// Projectile system
function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.lifetime--;
        
        // Apply gravity to fireballs
        if (proj.type === 'fireball') {
            proj.vy += GRAVITY * 0.5;
        }
        
        // Remove if lifetime expired or out of bounds
        if (proj.lifetime <= 0 || proj.x < -50 || proj.x > level[0].length * TILE_SIZE + 50) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Check collision with tiles
        if (isCollidingWithTile(proj.x, proj.y, proj.width, proj.height)) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Player projectiles vs enemies
        if (proj.type === 'fireball') {
            // Check ground enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (checkCollision(proj, enemies[j])) {
                    enemies.splice(j, 1);
                    projectiles.splice(i, 1);
                    score += 200;
                    updateUI();
                    playSound('enemy_defeat');
                    break;
                }
            }
            
            // Check flying enemies
            for (let j = flyingEnemies.length - 1; j >= 0; j--) {
                if (checkCollision(proj, flyingEnemies[j])) {
                    flyingEnemies.splice(j, 1);
                    projectiles.splice(i, 1);
                    score += 300;
                    updateUI();
                    playSound('enemy_defeat');
                    break;
                }
            }
            
            // Check boss enemies
            for (let boss of bossEnemies) {
                if (checkCollision(proj, boss)) {
                    boss.health--;
                    projectiles.splice(i, 1);
                    score += 100;
                    updateUI();
                    playSound('enemy_hit');
                    
                    if (boss.health <= 0) {
                        const bossIndex = bossEnemies.indexOf(boss);
                        bossEnemies.splice(bossIndex, 1);
                        score += 1000;
                        updateUI();
                        playSound('boss_defeat');
                    }
                    break;
                }
            }
        }
        
        // Enemy projectiles vs player
        if (proj.type === 'enemy_projectile' && !player.invulnerable) {
            if (checkCollision(proj, player)) {
                projectiles.splice(i, 1);
                loseLife();
            }
        }
    }
}

// Coin collection
function updateCoins() {
    for (let coin of coins) {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            score += 100;
            playSound('coin');
            updateUI();
        }
    }
}

// Check level completion
function checkLevelCompletion() {
    if (flag && checkCollision(player, flag) && !flag.touched) {
        flag.touched = true;
        score += 1000;
        updateUI();
        // Show level complete screen
        setTimeout(() => {
            showLevelComplete();
        }, 500);
    }
}

// Sound effects (simple beep sounds using Web Audio API)
let audioContext = null;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function playSound(type) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
        case 'jump':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
            break;
        case 'coin':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            break;
        case 'death':
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
            break;
        case 'powerup':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.3);
            break;
        case 'star':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
            oscillator.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.4);
            break;
        case 'checkpoint':
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(700, audioContext.currentTime + 0.2);
            break;
        case 'fireball':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
            break;
        case 'superjump':
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
            break;
        case 'float':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
            break;
        case 'shield':
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.4);
            break;
        case 'enemy_defeat':
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
            break;
        case 'enemy_hit':
            oscillator.frequency.setValueAtTime(250, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.1);
            break;
        case 'boss_defeat':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
            break;
        case 'powerdown':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
            break;
        case 'level_complete':
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.4);
            oscillator.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.6);
            break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
}

// Camera system for scrolling
function updateCamera() {
    // Follow player with some offset
    const targetX = player.x - canvas.width / 2;
    const targetY = player.y - canvas.height / 2;
    
    // Smooth camera movement
    camera.x += (targetX - camera.x) * 0.1;
    camera.y += (targetY - camera.y) * 0.1;
    
    // Keep camera in level bounds
    const levelWidth = level[0].length * TILE_SIZE;
    const levelHeight = level.length * TILE_SIZE;
    
    camera.x = Math.max(0, Math.min(camera.x, levelWidth - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, levelHeight - canvas.height));
}

// Rendering functions
function renderBackground() {
    if (!ctx || !canvas) return;
    
    // Simple gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#98fb98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simple parallax clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
        const x = (i * 200 - camera.x * 0.2) % (canvas.width + 100);
        const y = 50 + i * 20;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

function renderLevel() {
    if (!ctx) return;
    
    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            const tileType = level[row][col];
            if (tileType === 0) continue;
            
            const x = col * TILE_SIZE - camera.x;
            const y = row * TILE_SIZE - camera.y;
            
            // Only render tiles that are visible
            if (x < -TILE_SIZE || x > canvas.width || y < -TILE_SIZE || y > canvas.height) {
                continue;
            }
            
            // Skip rendering items that are managed by separate systems
            if (tileType === 3 || tileType === 8 || tileType === 9) {
                continue; // Coins, mushrooms, and stars are rendered by their respective systems
            }
            
            switch (tileType) {
                case 1: // Ground
                    // Main ground block
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    
                    // Grass on top
                    ctx.fillStyle = '#90EE90';
                    ctx.fillRect(x, y, TILE_SIZE, 6);
                    
                    // Add texture details
                    ctx.fillStyle = '#654321';
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            if (Math.random() > 0.7) {
                                ctx.fillRect(x + i * 10 + 2, y + j * 10 + 8, 2, 2);
                            }
                        }
                    }
                    
                    // Border highlight
                    ctx.strokeStyle = '#A0522D';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                    break;
                    
                case 2: // Platform
                    // Wood platform
                    ctx.fillStyle = '#D2691E';
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    
                    // Wood grain effect
                    ctx.fillStyle = '#CD853F';
                    for (let i = 0; i < 4; i++) {
                        ctx.fillRect(x + i * 8, y, 6, TILE_SIZE);
                    }
                    
                    // Platform border
                    ctx.strokeStyle = '#8B4513';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                    break;
                    
                case 3: // Coin
                    // Spinning coin animation
                    const spinPhase = (Date.now() / 200) % (Math.PI * 2);
                    const coinScale = Math.abs(Math.sin(spinPhase));
                    
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.ellipse(x + TILE_SIZE/2, y + TILE_SIZE/2, 10 * coinScale, 10, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Inner circle
                    ctx.fillStyle = '#FFA500';
                    ctx.beginPath();
                    ctx.ellipse(x + TILE_SIZE/2, y + TILE_SIZE/2, 6 * coinScale, 6, 0, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 4: // Enemy (Goomba)
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(x + 6, y + 16, 20, 16);
                    
                    // Head
                    ctx.fillStyle = '#A0522D';
                    ctx.beginPath();
                    ctx.arc(x + 16, y + 12, 10, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Eyes
                    ctx.fillStyle = '#000';
                    ctx.fillRect(x + 11, y + 8, 3, 3);
                    ctx.fillRect(x + 18, y + 8, 3, 3);
                    
                    // Angry eyebrows
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x + 10, y + 6);
                    ctx.lineTo(x + 14, y + 8);
                    ctx.moveTo(x + 18, y + 8);
                    ctx.lineTo(x + 22, y + 6);
                    ctx.stroke();
                    break;
                    
                case 5: // Spikes
                    ctx.fillStyle = '#696969';
                    ctx.fillRect(x, y + 24, TILE_SIZE, 8);
                    
                    // Spike points
                    ctx.fillStyle = '#2F2F2F';
                    for (let i = 0; i < 4; i++) {
                        ctx.beginPath();
                        ctx.moveTo(x + i * 8, y + 24);
                        ctx.lineTo(x + i * 8 + 4, y + 8);
                        ctx.lineTo(x + i * 8 + 8, y + 24);
                        ctx.fill();
                    }
                    break;
                    
                case 6: // Flag
                    // Flag pole
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(x + 14, y, 4, TILE_SIZE);
                    
                    // Flag
                    ctx.fillStyle = '#FF6B6B';
                    ctx.fillRect(x + 18, y + 4, 12, 8);
                    
                    // Flag pattern
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x + 20, y + 5, 2, 2);
                    ctx.fillRect(x + 24, y + 5, 2, 2);
                    ctx.fillRect(x + 22, y + 7, 2, 2);
                    ctx.fillRect(x + 26, y + 7, 2, 2);
                    break;
                    
                case 7: // Flying Enemy (Koopa)
                    ctx.fillStyle = '#228B22';
                    
                    // Shell
                    ctx.beginPath();
                    ctx.ellipse(x + 16, y + 20, 12, 10, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Head
                    ctx.fillStyle = '#FFFF99';
                    ctx.beginPath();
                    ctx.arc(x + 16, y + 10, 8, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Beak
                    ctx.fillStyle = '#FFA500';
                    ctx.beginPath();
                    ctx.moveTo(x + 20, y + 10);
                    ctx.lineTo(x + 26, y + 8);
                    ctx.lineTo(x + 26, y + 12);
                    ctx.fill();
                    
                    // Wings (animated)
                    const wingPhase = Math.sin(Date.now() / 100) * 0.3;
                    ctx.fillStyle = '#fff';
                    ctx.save();
                    ctx.translate(x + 8, y + 15);
                    ctx.rotate(wingPhase);
                    ctx.fillRect(-4, -6, 8, 12);
                    ctx.restore();
                    
                    ctx.save();
                    ctx.translate(x + 24, y + 15);
                    ctx.rotate(-wingPhase);
                    ctx.fillRect(-4, -6, 8, 12);
                    ctx.restore();
                    break;
                    
                case 8: // Mushroom Power-up
                    // Stem
                    ctx.fillStyle = '#F5DEB3';
                    ctx.fillRect(x + 12, y + 18, 8, 14);
                    
                    // Cap
                    ctx.fillStyle = '#FF4444';
                    ctx.beginPath();
                    ctx.arc(x + 16, y + 16, 12, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // White spots
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(x + 12, y + 12, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x + 20, y + 10, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x + 22, y + 18, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 9: // Star Power-up
                    const starRotation = Date.now() / 500;
                    ctx.save();
                    ctx.translate(x + TILE_SIZE/2, y + TILE_SIZE/2);
                    ctx.rotate(starRotation);
                    
                    // Draw star
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    for (let i = 0; i < 10; i++) {
                        const angle = (i / 10) * Math.PI * 2;
                        const radius = i % 2 === 0 ? 12 : 6;
                        const x_star = Math.cos(angle) * radius;
                        const y_star = Math.sin(angle) * radius;
                        if (i === 0) ctx.moveTo(x_star, y_star);
                        else ctx.lineTo(x_star, y_star);
                    }
                    ctx.closePath();
                    ctx.fill();
                    
                    // Glow effect
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                    ctx.beginPath();
                    ctx.arc(0, 0, 18, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.restore();
                    break;
                    
                case 10: // Checkpoint
                    // Pole
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(x + 14, y, 4, TILE_SIZE);
                    
                    // Banner
                    ctx.fillStyle = '#4169E1';
                    ctx.fillRect(x + 18, y + 8, 12, 16);
                    
                    // Banner end (triangular)
                    ctx.beginPath();
                    ctx.moveTo(x + 30, y + 8);
                    ctx.lineTo(x + 30, y + 24);
                    ctx.lineTo(x + 26, y + 16);
                    ctx.fill();
                    
                    // Checkpoint symbol
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x + 20, y + 12, 2, 8);
                    ctx.fillRect(x + 19, y + 14, 4, 2);
                    break;
            }
        }
    }
}

function renderPlayer() {
    if (!ctx) return;
    
    const x = player.x - camera.x;
    const y = player.y - camera.y;
    const char = characters[player.character];
    const height = player.height * player.size;
    
    // Add invulnerability flashing effect
    if (player.invulnerable && Math.floor(Date.now() / 100) % 2) {
        return; // Skip rendering for flashing effect
    }
    
    // Star power-up glow effect
    if (player.powerups.star.active) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x + player.width/2, y + height/2, player.width + 10, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Main body
    ctx.fillStyle = char.color;
    ctx.fillRect(x + 2, y + 8, player.width - 4, height - 8);
    
    // Head (larger and rounder, scaled with size)
    ctx.fillStyle = char.color;
    ctx.beginPath();
    ctx.arc(x + player.width/2, y + 8 * player.size, 8 * player.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Hat/Hair
    ctx.fillStyle = char.hatColor;
    ctx.beginPath();
    ctx.arc(x + player.width/2, y + 6 * player.size, 9 * player.size, Math.PI, 2 * Math.PI);
    ctx.fill();
    
    // Shirt/Overalls
    ctx.fillStyle = char.shirtColor;
    ctx.fillRect(x + 4, y + 12 * player.size, player.width - 8, 12 * player.size);
    
    // Arms (scaled)
    ctx.fillStyle = char.color;
    ctx.fillRect(x - 2, y + 14 * player.size, 4, 8 * player.size);
    ctx.fillRect(x + player.width - 2, y + 14 * player.size, 4, 8 * player.size);
    
    // Legs (scaled)
    ctx.fillStyle = char.shirtColor;
    ctx.fillRect(x + 6, y + 24 * player.size, 4, 8 * player.size);
    ctx.fillRect(x + 14, y + 24 * player.size, 4, 8 * player.size);
    
    // Eyes (scaled)
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 6 * player.size, 3 * player.size, 3 * player.size);
    ctx.fillRect(x + 13, y + 6 * player.size, 3 * player.size, 3 * player.size);
    
    // Pupils
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 9, y + 7 * player.size, 1 * player.size, 1 * player.size);
    ctx.fillRect(x + 14, y + 7 * player.size, 1 * player.size, 1 * player.size);
    
    // Mouth (happy when on ground, worried when in air)
    ctx.fillStyle = '#000';
    if (player.onGround) {
        // Happy smile
        ctx.beginPath();
        ctx.arc(x + player.width/2, y + 10 * player.size, 3 * player.size, 0, Math.PI);
        ctx.stroke();
    } else {
        // Worried expression
        ctx.fillRect(x + 10, y + 11 * player.size, 4 * player.size, 1 * player.size);
    }
    
    // Character-specific features (scaled)
    if (player.character === 'mario' || player.character === 'luigi') {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 8, y + 9 * player.size, 8 * player.size, 2 * player.size);
    }
    
    if (player.character === 'princess') {
        ctx.fillStyle = char.hatColor;
        ctx.fillRect(x + 6, y + 2 * player.size, 12 * player.size, 4 * player.size);
        // Crown points
        ctx.fillRect(x + 7, y, 2 * player.size, 2 * player.size);
        ctx.fillRect(x + 11, y - 1 * player.size, 2 * player.size, 3 * player.size);
        ctx.fillRect(x + 15, y, 2 * player.size, 2 * player.size);
    }
    
    if (player.character === 'knight') {
        ctx.fillStyle = char.hatColor;
        ctx.fillRect(x + 4, y + 3 * player.size, 16 * player.size, 8 * player.size);
        // Visor
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 6, y + 6 * player.size, 12 * player.size, 2 * player.size);
    }
}

function renderCoins() {
    if (!ctx) return;
    for (let coin of coins) {
        if (coin.collected) continue;
        
        const x = coin.x - camera.x;
        const y = coin.y - camera.y;
        
        // Animated coin
        const time = Date.now() * 0.01;
        const bounce = Math.sin(time) * 2;
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + coin.width/2, y + coin.height/2 + bounce, coin.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner shine
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(x + coin.width/2 - 2, y + coin.height/2 + bounce - 2, coin.width/4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function renderPowerups() {
    if (!ctx) return;
    for (let powerup of powerups) {
        if (powerup.collected) continue;
        
        const x = powerup.x - camera.x;
        const y = powerup.y - camera.y;
        
        if (powerup.type === 'mushroom') {
            // Mushroom stem
            ctx.fillStyle = '#F5DEB3';
            ctx.fillRect(x + 4, y + 10, 8, 6);
            
            // Mushroom cap
            ctx.fillStyle = '#FF4444';
            ctx.beginPath();
            ctx.arc(x + 8, y + 8, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // White spots
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x + 5, y + 5, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 11, y + 7, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (powerup.type === 'star') {
            const starRotation = Date.now() / 500;
            ctx.save();
            ctx.translate(x + 8, y + 8);
            ctx.rotate(starRotation);
            
            // Draw star
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2;
                const radius = i % 2 === 0 ? 8 : 4;
                const x_star = Math.cos(angle) * radius;
                const y_star = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x_star, y_star);
                else ctx.lineTo(x_star, y_star);
            }
            ctx.closePath();
            ctx.fill();
            
            // Glow effect
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
}

function renderCheckpoints() {
    if (!ctx) return;
    for (let checkpoint of checkpoints) {
        const x = checkpoint.x - camera.x;
        const y = checkpoint.y - camera.y;
        
        // Checkpoint flag pole
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 14, y + 16, 4, 48);
        
        // Flag
        if (checkpoint.activated) {
            ctx.fillStyle = '#00FF00'; // Green when activated
        } else {
            ctx.fillStyle = '#0066FF'; // Blue when not activated
        }
        
        // Flag triangle
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 16);
        ctx.lineTo(x + 32, y + 24);
        ctx.lineTo(x + 18, y + 32);
        ctx.closePath();
        ctx.fill();
        
        // Flag pole top
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function renderEnemies() {
    // Ground enemies
    for (let enemy of enemies) {
        const x = enemy.x - camera.x;
        const y = enemy.y - camera.y;
        
        // Main body (round/blob shape)
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(x + enemy.width/2, y + enemy.height/2 + 4, enemy.width/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Face area
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(x + enemy.width/2, y + enemy.height/2, enemy.width/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes (angry)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + 6, y + 6, 3, 0, Math.PI * 2);
        ctx.arc(x + 18, y + 6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils (looking direction)
        ctx.fillStyle = '#000';
        const pupilOffset = enemy.direction > 0 ? 1 : -1;
        ctx.beginPath();
        ctx.arc(x + 6 + pupilOffset, y + 6, 1, 0, Math.PI * 2);
        ctx.arc(x + 18 + pupilOffset, y + 6, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry eyebrows
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 2, y + 2, 6, 2);
        ctx.fillRect(x + 16, y + 2, 6, 2);
        
        // Spikes on top
        ctx.fillStyle = '#8B0000';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + 4 + i * 6, y);
            ctx.lineTo(x + 6 + i * 6, y - 3);
            ctx.lineTo(x + 8 + i * 6, y);
            ctx.fill();
        }
    }
    
    // Flying enemies
    for (let enemy of flyingEnemies) {
        const x = enemy.x - camera.x;
        const y = enemy.y - camera.y;
        
        // Wings
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        const wingFlap = Math.sin(Date.now() * 0.02) * 0.3;
        ctx.ellipse(x + 5, y + 8 + wingFlap, 8, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 15, y + 8 - wingFlap, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(x + enemy.width/2, y + enemy.height/2, enemy.width/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + 6, y + 8, 2, 0, Math.PI * 2);
        ctx.arc(x + 14, y + 8, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 6, y + 8, 1, 0, Math.PI * 2);
        ctx.arc(x + 14, y + 8, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Boss enemies
    for (let boss of bossEnemies) {
        const x = boss.x - camera.x;
        const y = boss.y - camera.y;
        
        // Main body (larger and more intimidating)
        ctx.fillStyle = boss.color;
        ctx.fillRect(x, y, boss.width, boss.height);
        
        // Health bar
        const healthBarWidth = boss.width;
        const healthPercentage = boss.health / boss.maxHealth;
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y - 10, healthBarWidth, 6);
        ctx.fillStyle = healthPercentage > 0.5 ? '#0f0' : (healthPercentage > 0.25 ? '#ff0' : '#f00');
        ctx.fillRect(x + 1, y - 9, (healthBarWidth - 2) * healthPercentage, 4);
        
        // Face
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 8, y + 8, 6, 6);
        ctx.fillRect(x + 34, y + 8, 6, 6);
        
        // Mouth (angry)
        ctx.fillRect(x + 16, y + 28, 16, 4);
        
        // Horns
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(x + 8, y);
        ctx.lineTo(x + 12, y - 8);
        ctx.lineTo(x + 16, y);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + 32, y);
        ctx.lineTo(x + 36, y - 8);
        ctx.lineTo(x + 40, y);
        ctx.fill();
        
        // Damage flash effect
        if (boss.health < boss.maxHealth && Math.floor(Date.now() / 100) % 2) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(x, y, boss.width, boss.height);
        }
    }
}

function renderProjectiles() {
    for (let proj of projectiles) {
        const x = proj.x - camera.x;
        const y = proj.y - camera.y;
        
        if (proj.type === 'fireball') {
            // Fireball with flame effect
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.arc(x + proj.width/2, y + proj.height/2, proj.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner flame
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x + proj.width/2, y + proj.height/2, proj.width/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Flame particles
            for (let i = 0; i < 3; i++) {
                const particleX = x + Math.random() * proj.width;
                const particleY = y + Math.random() * proj.height;
                ctx.fillStyle = '#FF6347';
                ctx.fillRect(particleX, particleY, 1, 1);
            }
        } else if (proj.type === 'enemy_projectile') {
            // Dark energy ball
            ctx.fillStyle = '#8B008B';
            ctx.beginPath();
            ctx.arc(x + proj.width/2, y + proj.height/2, proj.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Dark center
            ctx.fillStyle = '#4B0082';
            ctx.beginPath();
            ctx.arc(x + proj.width/2, y + proj.height/2, proj.width/3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function renderFlag() {
    if (!flag) return;
    
    const x = flag.x - camera.x;
    const y = flag.y - camera.y;
    
    // Flag pole
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 28, y, 4, flag.height);
    
    // Flag
    ctx.fillStyle = flag.touched ? '#32CD32' : '#FF6347';
    ctx.fillRect(x, y, 28, 20);
    
    // Flag pattern
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillRect(x + i * 8, y + j * 8, 8, 8);
            }
        }
    }
}

// Main game loop using requestAnimationFrame
function gameLoop() {
    if (gameState === 'playing' && ctx && canvas) {
        // Update timer
        const now = Date.now();
        if (now - lastTimeUpdate >= 1000) {
            gameTimer--;
            lastTimeUpdate = now;
            if (gameTimer <= 0) {
                showGameOver();
                return;
            }
        }
        
        // Update game logic
        updatePlayer();
        updateEnemies();
        updateProjectiles();
        updateCoins();
        updatePowerups();
        updateCheckpoints();
        updateCamera();
        checkLevelCompletion();
        updateUI();
        
        // Render everything
        renderBackground();
        renderLevel();
        renderCoins();
        renderPowerups();
        renderCheckpoints();
        renderEnemies();
        renderProjectiles();
        renderPlayer();
        renderFlag();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop(); // Start the loop

// Character selection logic
function setupCharacterSelection() {
    const characterOptions = document.querySelectorAll('.character-option');
    
    // Render character previews
    characterOptions.forEach(option => {
        const canvas = option.querySelector('.character-preview');
        const ctx = canvas.getContext('2d');
        const charType = option.dataset.character;
        const char = characters[charType];
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render character preview
        renderCharacterPreview(ctx, char, 24, 32, 24, 32);
        
        // Add click handler
        option.onclick = () => {
            // Remove selected class from all options
            characterOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            // Update selected character
            selectedCharacter = charType;
        };
    });
    
    // Select first character by default
    characterOptions[0].classList.add('selected');
    
    // Setup start button event listener
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.onclick = () => {
            // Initialize canvas first
            if (!initializeCanvas()) {
                console.error('Failed to initialize canvas');
                return;
            }
            
            // Apply difficulty settings
            applyDifficulty();
            
            gameState = 'playing';
            
            // Hide all screens and show game container
            const screens = ['startScreen', 'instructionsScreen', 'settingsScreen', 'creditsScreen', 'characterScreen', 'levelCompleteScreen', 'gameOverScreen'];
            screens.forEach(screen => {
                const element = document.getElementById(screen);
                if (element) element.style.display = 'none';
            });
            
            const gameContainer = document.getElementById('gameContainer');
            gameContainer.style.display = 'block';
            
            score = 0;
            initAudio();
            initializeLevel();
            resetPlayerPosition();
            camera.x = 0;
            camera.y = 0;
            updateUI();
        };
    }
}

function renderCharacterPreview(ctx, char, x, y, width, height) {
    // Scale factor for preview
    const scale = 1.5;
    
    // Main body
    ctx.fillStyle = char.color;
    ctx.fillRect(x + 2*scale, y + 8*scale, (width - 4)*scale, (height - 8)*scale);
    
    // Head
    ctx.fillStyle = char.color;
    ctx.beginPath();
    ctx.arc(x + width/2*scale, y + 8*scale, 8*scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Hat/Hair
    ctx.fillStyle = char.hatColor;
    ctx.beginPath();
    ctx.arc(x + width/2*scale, y + 6*scale, 9*scale, Math.PI, 2 * Math.PI);
    ctx.fill();
    
    // Shirt
    ctx.fillStyle = char.shirtColor;
    ctx.fillRect(x + 4*scale, y + 12*scale, (width - 8)*scale, 12*scale);
    
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8*scale, y + 6*scale, 3*scale, 3*scale);
    ctx.fillRect(x + 13*scale, y + 6*scale, 3*scale, 3*scale);
    
    // Pupils
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 9*scale, y + 7*scale, 1*scale, 1*scale);
    ctx.fillRect(x + 14*scale, y + 7*scale, 1*scale, 1*scale);
}

// Initialize the game directly when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting game initialization...');
    
    // Set default character
    selectedCharacter = 'mario';
    console.log('✅ Character set to:', selectedCharacter);
    
    // Initialize canvas
    if (!initializeCanvas()) {
        console.error('❌ Failed to initialize canvas!');
        return;
    }
    console.log('✅ Canvas initialized successfully');
    
    // Update player character after setting selectedCharacter
    player.character = selectedCharacter;
    console.log('✅ Player character updated to:', player.character);
    
    // Start the game directly
    gameState = 'playing';
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        gameContainer.style.display = 'block';
        console.log('✅ Game container visible');
    }
    
    // Initialize game
    score = 0;
    lives = 3;
    gameTimer = 300; // 5 minutes
    console.log('✅ Game variables initialized');
    
    applyDifficulty();
    console.log('✅ Difficulty applied');
    
    initializeLevel();
    console.log('✅ Level initialized - Coins:', coins.length, 'Enemies:', enemies.length);
    
    resetPlayerPosition();
    console.log('✅ Player position reset to:', player.x, player.y);
    
    camera.x = 0;
    camera.y = 0;
    updateUI();
    console.log('✅ UI updated');
    
    // Start game loop
    gameLoop();
    console.log('✅ Game loop started');
    
    // Setup restart button
    setupRestartButton();
    console.log('✅ Restart button setup');
    
    // Add character selection
    addCharacterSelector();
    console.log('✅ Character selector added');
    
    console.log('🎉 Game started successfully!');
});

function setupRestartButton() {
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.onclick = () => {
            // Initialize canvas first
            if (!initializeCanvas()) {
                console.error('Failed to initialize canvas');
                return;
            }
            
            gameState = 'playing';
            const gameOverScreen = document.getElementById('gameOverScreen');
            const gameContainer = document.getElementById('gameContainer');
            if (gameOverScreen) gameOverScreen.style.display = 'none';
            if (gameContainer) gameContainer.style.display = 'block';
            score = 0;
            lives = 3;
            gameTimer = 300;
            applyDifficulty();
            initializeLevel();
            resetPlayerPosition();
            camera.x = 0;
            camera.y = 0;
            updateUI();
        };
    }
}

function updateUI() {
    const scoreSpan = document.getElementById('score');
    const livesSpan = document.getElementById('lives');
    
    if (scoreSpan) scoreSpan.textContent = 'Score: ' + score;
    if (livesSpan) livesSpan.textContent = 'Lives: ' + lives;
    
    // Update timer
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        const minutes = Math.floor(gameTimer / 60);
        const seconds = gameTimer % 60;
        timerElement.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update power-up indicators
    const powerUpElement = document.getElementById('powerUpStatus');
    if (powerUpElement) {
        let status = '';
        if (player.powerups.mushroom.active) {
            status += '🍄 BIG ';
        }
        if (player.powerups.star.active) {
            const remaining = Math.ceil((player.powerups.star.endTime - Date.now()) / 1000);
            status += `⭐ STAR (${remaining}s) `;
        }
        powerUpElement.textContent = status || 'No Power-ups';
    }
}

function showGameOver() {
    gameState = 'gameover';
    const gameContainer = document.getElementById('gameContainer');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScore = document.getElementById('finalScore');
    
    if (gameContainer) gameContainer.style.display = 'none';
    if (gameOverScreen) gameOverScreen.style.display = 'flex';
    if (finalScore) finalScore.textContent = 'Final Score: ' + score;
}

function showLevelComplete() {
    gameState = 'complete';
    gameContainer.style.display = 'none';
    const levelCompleteScreen = document.getElementById('levelCompleteScreen');
    levelCompleteScreen.style.display = 'flex';
    
    // Calculate completion stats
    const timeBonus = gameTimer * 10; // 10 points per second remaining
    const finalScore = score + timeBonus;
    let rank = 'Bronze Adventurer';
    
    if (finalScore >= 15000) rank = '🏆 Legendary Hero!';
    else if (finalScore >= 10000) rank = '🥇 Master Platformer!';
    else if (finalScore >= 5000) rank = '🥈 Skilled Player!';
    else if (finalScore >= 2000) rank = '🥉 Bronze Adventurer!';
    
    document.getElementById('completionScore').textContent = `Final Score: ${finalScore}`;
    document.getElementById('completionTime').textContent = `Time Remaining: ${Math.floor(gameTimer/60)}:${(gameTimer%60).toString().padStart(2,'0')}`;
    document.getElementById('completionCoins').textContent = `Coins Collected: ${Math.floor(score/100)}`;
    document.getElementById('completionBonus').textContent = `Time Bonus: ${timeBonus}`;
    document.getElementById('completionRank').textContent = rank;
    
    playSound('level_complete');
}

// Game settings
let gameSettings = {
    soundEnabled: true,
    difficulty: 'normal'
};

function applyDifficulty() {
    switch(gameSettings.difficulty) {
        case 'easy':
            lives = 4;
            gameTimer = 360; // 6 minutes
            break;
        case 'normal':
            lives = 3;
            gameTimer = 300; // 5 minutes
            break;
        case 'hard':
            lives = 2;
            gameTimer = 240; // 4 minutes
            break;
    }
    GAME_TIME = gameTimer;
}

function addCharacterSelector() {
    // Add character selector to the UI
    const ui = document.getElementById('ui');
    if (ui) {
        const characterSelector = document.createElement('div');
        characterSelector.innerHTML = `
            <div style="margin-top: 10px;">
                <label style="color: white; font-weight: bold;">Character: </label>
                <select id="characterSelect" style="padding: 5px; margin-left: 5px;">
                    <option value="mario">Mario (Red)</option>
                    <option value="luigi">Luigi (Green)</option>
                    <option value="princess">Princess (Pink)</option>
                    <option value="knight">Knight (Silver)</option>
                </select>
            </div>
        `;
        ui.appendChild(characterSelector);
        
        const select = document.getElementById('characterSelect');
        select.value = selectedCharacter;
        select.addEventListener('change', (e) => {
            selectedCharacter = e.target.value;
            player.character = selectedCharacter;
            console.log('Character changed to:', selectedCharacter);
        });
    }
}

// Game is now streamlined without menu system
