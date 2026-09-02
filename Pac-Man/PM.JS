const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");
const restartBtn = document.getElementById("restartBtn");
const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn")
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);


const tileSize = 33;
const radius = 13;




const levelInfo = [
     {
        title: "THE FIRST CHASE",
        message: "Collect the power pellets to fight back."
    },
    {
        title: "THE MAZE GROWS",
        message: "More ghosts have arrived."
    },
    {
        title: "NO SAFE PLACE",
        message: "Faster ghosts await."
    },
    {
        title: "POWER SURGE",
        message: "Power pellets change everything."
    },
    {
        title: "THE SECRET TUNNELS",
        message: "Hidden passages can save your life."
    },
    {
        title: "THE HUNTER",
        message: "Run... or become the hunted."
    },
    {
        title: "FRUIT RESCUE",
        message: "Collect the cherries to gain extra lives."
    },
    {
        title: "GHOST STORM",
        message: "Five ghosts, and nowhere to hide."
    },
    {
        title: "THE LOCKED TEMPLE",
        message: "Find the keys, open the gates, and escape."
    },
    {
        title: "THE FINAL ESCAPE",
        message: "Collect the crystals, activate the switches, and escape!"
    }
];


// --------------------
// Sound Effects (keep this — same as you had)
// --------------------
const sounds = {
    beep: new Audio("sounds/pelletEat.mp3"),
    power: new Audio("sounds/power.mp3"),
    eatGhost: new Audio("sounds/eatghost.mp3"),
    death: new Audio("sounds/death.mp3"),
    levelUp: new Audio("sounds/levelup.mp3"),
    hunter: new Audio("sounds/hunter.mp3"),
    lifeUp: new Audio("sounds/lifeup.mp3"),
    mainTheme: new Audio("sounds/main-theme.mp3")
};
 
sounds.beep.volume = 0.2;
sounds.power.volume = 0.4;
sounds.eatGhost.volume = 0.5;
sounds.death.volume = 0.5;
sounds.levelUp.volume = 0.5;
sounds.hunter.volume = 0.35;
sounds.lifeUp.volume = 0.45;
 
sounds.mainTheme.loop = true;
sounds.mainTheme.volume = 0.1;
sounds.mainTheme.preload = "auto";
 

// --------------------
// State
// --------------------
let soundEnabled = false;
let audioUnlocked = false;
let themePlayPromise = null;
 
const soundBtn = document.getElementById("sound-btn");
 
// --------------------
// Button label
// --------------------
function updateSoundButton() {
    if (!soundBtn) return;
    soundBtn.textContent = soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";
}
 
// --------------------
// Unlock audio on first user gesture
// (browsers block autoplay until a real click/tap happens)
// --------------------
// async function unlockAudio() {
//     if (audioUnlocked) return;
 
//     try {
//         sounds.mainTheme.muted = true;
//         await sounds.mainTheme.play();
 
//         sounds.mainTheme.pause();
//         sounds.mainTheme.currentTime = 0;
//         sounds.mainTheme.muted = false;
 
//         audioUnlocked = true;
//     } catch (error) {
//         console.warn("Audio unlock failed:", error);
//     }
// }
 
async function unlockAudio() {
    if (audioUnlocked) return;

    try {
        audioUnlocked = true;

        // Don't start the continuous main theme
        // sounds.mainTheme.muted = true;
        // await sounds.mainTheme.play();

    } catch (error) {
        console.log("Audio unlock failed:", error);
    }
}
// --------------------
// Background theme control
// --------------------
async function startMainTheme() {
    if (!soundEnabled) return;
 
    // Don't stack multiple play() calls
    if (themePlayPromise) return themePlayPromise;
 
    sounds.mainTheme.loop = true;
    sounds.mainTheme.volume = 0.1;
 
    // themePlayPromise = sounds.mainTheme.play();
 
    try {
        await themePlayPromise;
    } catch (error) {
        console.warn("Main theme play failed:", error);
    } finally {
        themePlayPromise = null;
    }
}
 
function stopMainTheme() {
    themePlayPromise = null;
    sounds.mainTheme.pause();
    sounds.mainTheme.currentTime = 0;
}
 
// --------------------
// Generic one-shot sound effect player
// Use this EVERYWHERE instead of repeating
// "sounds.x.currentTime = 0; sounds.x.play().catch(...)"
// --------------------
function playSound(name) {
    if (!soundEnabled) return;
 
    const sound = sounds[name];
    if (!sound) return;
 
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
}
 
// --------------------
// Looping sound control (used for the Hunter siren)
// --------------------
function startLoopSound(name) {
    if (!soundEnabled) return;
 
    const sound = sounds[name];
    if (!sound) return;
 
    sound.loop = true;
    sound.currentTime = 0;
    sound.play().catch(() => {});
}
 
function stopLoopSound(name) {
    const sound = sounds[name];
    if (!sound) return;
 
    sound.pause();
    sound.currentTime = 0;
    sound.loop = false;
}
 
// --------------------
// THE ONE AND ONLY click listener for the sound button
// --------------------
if (soundBtn) {
    soundBtn.addEventListener("click", async (event) => {
        event.preventDefault();
 
        soundEnabled = !soundEnabled;
 
        if (soundEnabled) {
            await unlockAudio();
            await startMainTheme();
        } else {
            stopMainTheme();
            stopLoopSound("hunter");
        }
 
        updateSoundButton();
    });
}
 
updateSoundButton();
 

const easyLevel = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,1,0,1,1,1,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,1,0,1],
  [1,0,1,0,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,1,0,1,0,1],
  [1,1,1,0,1,1,1,1,0,1,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1]


 
];

// Add power pellets to Level 1.
easyLevel[1][5] = 3;
easyLevel[7][5] = 3;
easyLevel[13][12] = 3;

// let map = easyLevel.map(row => [...row]);
let x = 0;
let y = 0;
let direction = 0;
let score = 0;

const urlParams = new URLSearchParams(window.location.search);
const requestedLevel = Number(urlParams.get("level"));

let currentLevel =
  requestedLevel >= 1 && requestedLevel <= 10
    ? requestedLevel - 1
    : 0;


let mouthOpen = 0.2;
let mouthGrowing = true;
let gameOver = false;
let animationID = null;
// Used for frame-rate-independent movement.
let lastTime = 0;
const normalFrameTime = 1000 / 60;
// Pac-Man base speed
let playerSpeed = 1;

let levelIntro = true;
let introTimer = currentLevel === 0 ? 1800 : 3000;

// -------------------------
// Hunter Mode (Level 6)
// -------------------------
let hunterTimer = 0;
let hunterChasing = false;

let ghostSlow = false;
let ghostSlowTimer = null;
// ----------------------------
// Power Pellet Variables
// ----------------------------
let ghostsVulnerable = false;

// Is Power Mode currently active?
let powerMode = false;


// How long should it last? (milliseconds)
const powerDuration = 8000;




// Used to store the timer
let powerTimer = null;
let win = false;
// Current number of lives
let lives = 1;


// Maximum lives allowed
let maxLives = 1;



let highScore = Number(localStorage.getItem("pacmanHighScore")) || 0;

let fireworks = [];
let fireworksActive = false;
let fireworksEndTime = 0;
let lastFireworkTime = 0;


const mediumLevel = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,1,0,1],
  [1,0,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,1,0,1,0,1],
  [1,1,1,0,1,1,1,1,0,1,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];


const hardLevel = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,2,0,0,0,1,0,0,0,1,0,0,0,1],
[1,0,1,1,0,1,0,1,0,1,0,1,0,1],
[1,0,1,0,0,0,0,1,0,0,0,1,0,1],
[1,0,1,0,1,1,0,1,1,1,0,1,0,1],
[1,0,0,0,1,0,0,0,0,1,0,0,0,1],
[1,1,1,0,1,0,1,1,0,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,0,1,1,1,0,1,1,0,1],
[1,0,0,0,1,0,0,0,1,0,0,0,0,1],
[1,1,1,0,1,1,1,0,1,1,1,0,1,1],
[1,0,0,0,0,0,1,0,0,0,0,0,0,1],
[1,0,1,1,1,0,1,1,1,1,1,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];


const expertLevel = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,2,0,0,0,1,0,0,0,1,0,0,0,3,1],
[1,0,1,1,0,1,0,1,0,1,0,1,0,0,1],
[1,0,1,0,0,0,0,1,0,0,0,1,1,0,1],
[1,0,1,0,1,1,0,1,1,1,0,0,0,0,1],
[1,0,0,0,1,0,0,0,0,1,0,1,1,0,1],
[1,1,1,0,1,0,1,1,0,1,0,0,0,0,1],
[1,0,0,0,0,0,1,3,0,0,0,1,0,0,1],
[1,0,1,1,1,0,1,0,1,1,0,1,0,0,1],
[1,0,0,0,1,0,0,0,1,0,0,1,0,0,1],
[1,1,1,0,1,1,1,0,1,0,1,1,0,1,1],
[1,0,0,0,0,0,1,0,0,0,0,0,0,3,1],
[1,0,1,1,1,0,1,1,1,1,1,0,1,0,1],
[1,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const level5 = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,3,0,0,0,1,0,0,0,0,1,0,0,0,0,0,3,1],
[1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1,0,1],
[0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0], // LEFT & RIGHT TUNNELS
[1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
[1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
[1,0,1,1,1,0,1,0,0,1,0,1,1,1,0,1,0,1],
[1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,1],
[1,0,1,1,1,0,1,0,0,1,0,1,1,1,0,1,0,1],
[1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
[1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
[0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0], // LEFT & RIGHT TUNNELS
[1,3,0,0,0,1,0,0,0,0,1,0,0,0,0,0,3,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const playerSpawns = {
  0: { row: 1, col: 1 },  // Level 1
  1: { row: 1, col: 1 },  // Level 2
  2: { row: 1, col: 1 },  // Level 3
  3: { row: 1, col: 1 },  // Level 4
  4: { row: 9, col: 8 },  // Level 5
  5: { row: 13, col: 2 }, // Level 6
  6: { row: 13, col: 2 }, // Level 7
  7: { row: 13, col: 15 },// Level 8
  8: { row: 13, col: 12 }, // Level 9
  9: { row: 15, col: 1 } // Level 10
};

const level6 = level5.map(row => [...row]);

const level7 = level5.map(row => [...row]);

// 4 = fruit life item.
// These positions must be path tiles.
level7[3][4] = 4;
level7[11][13] = 4;

const level8 = level7.map(row => [...row]);

// Level 8 bonus cherries.
// These positions are walkable tiles.
level8[7][15] = 4;
level8[11][2] = 4;

const level9 = level8.map(row => [...row]);

// 5 = key
// 6 = locked gate
// 7 = exit portal

level9[3][3] = 5;
level9[7][15] = 5;
level9[13][10] = 5;

level9[5][2] = 6;
level9[9][6] = 6;
level9[13][13] = 6;

level9[13][15] = 7;



const level10 = [

  // 0 = path
  // 1 = wall
  // 8 = crystal
  // 7 = final exit

  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],

  [1,8,0,0,0,1,0,0,0,0,0,0,0,1,0,0,8,1],

  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1],

  [1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],

  [1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1,0,1],

  [1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1],

  [1,1,1,0,1,0,1,1,1,1,1,1,0,1,1,1,0,1],

  [1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1],

  [1,0,1,1,1,0,1,0,1,1,0,1,1,1,1,1,0,1],

  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],

  [1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,0,1],

  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],

  [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],

  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],

  [1,8,1,0,1,1,1,0,1,1,1,0,1,1,1,0,8,1],

  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

  [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],

  [1,1,1,1,1,1,1,1,1,7,0,0,1,1,1,1,1,1]

];

// =====================================
// LEVEL 10 - CRYSTAL TEMPLE
// =====================================

// 8 = Crystal
// 7 = Final Exit
// 6 = Final Gate

level10[1][1] = 8;     // Crystal 1
level10[1][16] = 8;    // Crystal 2
level10[14][1] = 8;    // Crystal 3
level10[14][16] = 8;   // Crystal 4

level10[17][9] = 11;    // Final exit
level10[16][9] = 6;    // Final gate

// =====================================================
// LEVEL 10 FINAL ESCAPE VARIABLES
// =====================================================



let finalGateOpened = false;


let switchesActivated = 0;
const totalSwitches = 2;

let finalGatesOpened = 0;
const totalFinalGates = 2;

let finalPortalUnlocked = false;

//let finalTimer = 60000; // 60 seconds
//let finalTimerActive = false;

let finalBossMode = false;

// =====================================
// LEVEL 10 FINAL CHALLENGE
// =====================================

const finalTimeLimit = 60;

let crystalsCollected = 0;
const totalCrystals = 4;

let finalTimerActive = false;
let finalTimeRemaining = finalTimeLimit; // 60 seconds

let finalWarningActive = false;
let finalWarningTimer = 0;

let finalGuardianSpawned = false;
let finalExitUnlocked = false;




let levels = [
    easyLevel,
    mediumLevel,
    hardLevel,
    expertLevel,
    level5,
    level6,
    level7,
    level8,
    level9,
    level10
];


//
let map = levels[currentLevel].map(row => [...row]);





const keys = {};
let pellets = [];
let ghosts = [];

let keysCollected = 0;
const totalKeys = 3;

let gatesOpened = 0;
const totalGates = 3;

let nextGateToOpen = 0;

let nextGate = 0;

let exitUnlocked = false;

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});


window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});



function releaseDirections(){

    keys["ArrowRight"] = false;
    keys["ArrowDown"] = false;
    keys["ArrowLeft"] = false;
    keys["ArrowUp"] = false;

}

// ===============================
// MOBILE TOUCH CONTROLS
// ===============================

function setupTouchButton(button, direction) {
    if (!button) return;

    const arrowKeys = [
        "ArrowRight",
        "ArrowDown",
        "ArrowLeft",
        "ArrowUp"
    ];

    const key = arrowKeys[direction];

    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();

        // Unlock sound after the user's first touch
        unlockAudio();

        // Stop any previous direction
        releaseDirections();

        // Use the same keyboard mechanism as PC
        keys[key] = true;

        if (button.setPointerCapture) {
            button.setPointerCapture(event.pointerId);
        }
    });

    button.addEventListener("pointerup", (event) => {
        event.preventDefault();
        keys[key] = false;
    });

    button.addEventListener("pointercancel", (event) => {
        event.preventDefault();
        keys[key] = false;
    });

    button.addEventListener("pointerleave", (event) => {
        if (event.buttons === 0) {
            keys[key] = false;
        }
    });
}

// Set up the four buttons
setupTouchButton(rightBtn, 0);
setupTouchButton(downBtn, 1);
setupTouchButton(leftBtn, 2);
setupTouchButton(upBtn, 3);

function getTileCenter(pos) {
  return Math.floor(pos / tileSize) * tileSize + tileSize / 2;
}

function configureLivesForLevel() {
  // Levels 1–3: one life.
  if (currentLevel < 3) {
    maxLives = 1;
  }

  // Levels 4–6: two lives.
  else if (currentLevel < 6) {
    maxLives = 2;
  }

  // Level 7 and later: maximum three lives.
  else {
    maxLives = 4;
  }

  // Give Pac-Man the second life when level 4 begins.
  if (currentLevel >= 3 && lives < 2) {
    lives = 2;
  }

  // Never allow lives to exceed the current maximum.
  if (lives > maxLives) {
    lives = maxLives;
  }
}

function loadLevel() {
   clearTimeout(ghostSlowTimer);
  clearTimeout(powerTimer);

if (currentLevel === 9) {
  crystalsCollected = 0;

  finalGateOpened = false;
  finalExitUnlocked = false;

  finalTimerActive = false;
  finalTimeRemaining = finalTimeLimit;

  finalWarningActive = false;
  finalWarningTimer = 0;

  finalGuardianSpawned = false;
}

  // =====================================================
// LEVEL 10 - FINAL GHOST STORM
// =====================================================

if (currentLevel === 9) {

    ghosts.push({
        x: 14 * tileSize + tileSize / 2,
        y: 3 * tileSize + tileSize / 2,

        homeX: 14 * tileSize + tileSize / 2,
        homeY: 3 * tileSize + tileSize / 2,

        direction: 2,
        speed: 2.0,
        originalSpeed: 2.0,

        color: "orange",
        originalColor: "orange",

        isHunter: true,
        chaseMode: true,
        forceFleeTurn: false
    });

    ghosts.push({
        x: 8 * tileSize + tileSize / 2,
        y: 7 * tileSize + tileSize / 2,

        homeX: 8 * tileSize + tileSize / 2,
        homeY: 7 * tileSize + tileSize / 2,

        direction: 0,
        speed: 2.2,
        originalSpeed: 2.2,

        color: "pink",
        originalColor: "pink",

        isHunter: false,
        chaseMode: false,
        forceFleeTurn: false
    });

    ghosts.push({
        x: 3 * tileSize + tileSize / 2,
        y: 9 * tileSize + tileSize / 2,

        homeX: 3 * tileSize + tileSize / 2,
        homeY: 9 * tileSize + tileSize / 2,

        direction: 1,
        speed: 2.3,
        originalSpeed: 2.3,

        color: "cyan",
        originalColor: "cyan",

        isHunter: false,
        chaseMode: false,
        forceFleeTurn: false
    });loadLevel

    ghosts.push({
        x: 12 * tileSize + tileSize / 2,
        y: 11 * tileSize + tileSize / 2,

        homeX: 12 * tileSize + tileSize / 2,
        homeY: 11 * tileSize + tileSize / 2,

        direction: 2,
        speed: 2.5,
        originalSpeed: 2.5,

        color: "lime",
        originalColor: "lime",

        isHunter: false,
        chaseMode: false,
        forceFleeTurn: false
    });

    ghosts.push({
        x: 7 * tileSize + tileSize / 2,
        y: 3 * tileSize + tileSize / 2,

        homeX: 7 * tileSize + tileSize / 2,
        homeY: 3 * tileSize + tileSize / 2,

        direction: 1,
        speed: 2.7,
        originalSpeed: 2.7,

        color: "purple",
        originalColor: "purple",

        isHunter: false,
        chaseMode: false,
        forceFleeTurn: false
    });
}

if (currentLevel === 8) {

  keysCollected = 0;

  gatesOpened = 0;
  nextGateToOpen = 0;

  exitUnlocked = false;

  pellets.forEach((item) => {

    if (item.gate) {
      item.opened = false;
    }

    if (item.key) {
      item.eaten = false;
    }

    if (item.exit) {
      item.eaten = false;
    }

  });

}

  ghostsVulnerable = false;
  powerMode = false;

  pellets = [];
  // ghosts = [];

   const spawn = playerSpawns[currentLevel];

   x = spawn.col * tileSize + tileSize / 2;
  y = spawn.row * tileSize + tileSize / 2;


  

  configureLivesForLevel();
 
  canvas.width = map[0].length * tileSize;
  canvas.height = map.length * tileSize; // Extra space for HUD


  // Increase Pac-Man speed each level
// ---------------------------------
 if (currentLevel === 0) {
  playerSpeed = 1.25;
} else if (currentLevel === 7) {
  playerSpeed = 1.5;
}  
else {
  playerSpeed = 1 + currentLevel * 0.15;
}
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 2) {
  map[row][col] = 0;
}


const tile = map[row][col];

if (
  tile === 0 ||
  tile === 3 ||
  tile === 4 ||
  tile === 5 ||
  tile === 6 ||
  tile === 7 ||
  tile === 8 ||
  tile === 11
) {
pellets.push({
  x: col * tileSize + tileSize / 2,
  y: row * tileSize + tileSize / 2,
  eaten: false,
  opened: false,
  activated: false,

  power: tile === 3,
  fruit: tile === 4,
  key: tile === 5,
  gate: tile === 6,
  exit: tile === 7,
  crystal: tile === 8,
  finalGate: currentLevel === 9 && tile === 6,
  finalPortal: tile === 11
});
}
    }
  }


  // initialize game/player state
  gameOver = false;
  win = false;


  // ---------------------------------------
// Set lives depending on current level
// ---------------------------------------


direction = 0;
mouthOpen = 0.2;
mouthGrowing = true;

// Starting a new game
// if (lives === 0) {


     //lives = maxLives;


// }
  direction = 0;
  mouthOpen = 0.2;
  mouthGrowing = true;


  ghosts = [];


ghosts.push({
    x: 12 * tileSize + tileSize/2,
    y: 1 * tileSize + tileSize/2,

    homeX: 12 * tileSize + tileSize/2,
    homeY: 1 * tileSize + tileSize/2,

    direction: 2,

    speed: currentLevel === 0 ? 1.15 : 1 + currentLevel * 0.4,
    originalSpeed: currentLevel === 0 ? 1.15 : 1 + currentLevel * 0.4,


    color: "red",
    originalColor: "red",

    // ---------- Level 6 ----------
    isHunter: false,
    chaseMode: false,
    forceFleeTurn: false
});

if (currentLevel >= 1) {
    ghosts.push({
        x: 11 * tileSize + tileSize / 2,
        y: 11 * tileSize + tileSize / 2,

    homeX: 12 * tileSize + tileSize/2,
    homeY: 1 * tileSize + tileSize/2,

        direction: 0,
        speed: 1.2 + currentLevel * 0.5,
        originalSpeed: 1.2 + currentLevel * 0.5,
        color: "pink",
        originalColor: "pink",

         isHunter: false,
          chaseMode: false,
          forceFleeTurn: false
    });
}


if (currentLevel >= 2) {
    ghosts.push({
        x: 1 * tileSize + tileSize / 2,
        y: 7 * tileSize + tileSize / 2,

        homeX: 1 * tileSize + tileSize/2,
        homeY: 7 * tileSize + tileSize/2,

        direction: 1,
        speed: 1 + currentLevel * 0.5,
        originalSpeed: 1 + currentLevel * 0.5,
        color: "cyan",
        originalColor: "cyan",

         isHunter: false,
          chaseMode: false,
          forceFleeTurn: false
    });
}


if (currentLevel >= 3) {


    ghosts.push({


        x: 7 * tileSize + tileSize / 2,
        y: 7 * tileSize + tileSize / 2,

        homeX: 1 * tileSize + tileSize/2,
        homeY: 7 * tileSize + tileSize/2,

        direction: 0,
        speed: 2.4,
        originalSpeed: 2.4,
        color: "orange",
        originalColor: "orange",

         isHunter: false,
    chaseMode: false,
    forceFleeTurn: false


    });


} 
// -------------------------
// LEVEL 8 EXTRA GHOST
// -------------------------
if (currentLevel === 7) {
  ghosts.push({
    x: 9 * tileSize + tileSize / 2,
    y: 3 * tileSize + tileSize / 2,

    homeX: 9 * tileSize + tileSize / 2,
    homeY: 3 * tileSize + tileSize / 2,

    direction: 2,
    speed: 2.2,
    originalSpeed: 2.2,
    color: "lime",
    originalColor: "lime",

    isHunter: false,
    chaseMode: false,
    forceFleeTurn: false
  });
}

// -------------------------
// LEVEL 6 HUNTER
// -------------------------
if (currentLevel === 5) {

    ghosts[0].isHunter = true;

}
hunterTimer = 0;
hunterChasing = false;

// -----------------------------------
// Show level announcement
// -----------------------------------
levelIntro = true;
introTimer = currentLevel === 0 ? 1800 : 3000;

}


function updateMouth() {
  if (mouthGrowing) {
    mouthOpen += 0.01;
    if (mouthOpen >= 0.35) mouthGrowing = false;
  } else {
    mouthOpen -= 0.01;
    if (mouthOpen <= 0.05) mouthGrowing = true;
  }
}



function isWall(r, c) {

  // ==========================================
  // LEVEL 5+ TUNNELS
  // ==========================================

  if (currentLevel >= 4) {

    if (r === 5 || r === 13) {

      if (c < 0 || c >= map[0].length) {
        return false;
      }

    }

  }


  // ==========================================
  // OUTSIDE MAP
  // ==========================================

  if (
    r < 0 ||
    c < 0 ||
    r >= map.length ||
    c >= map[0].length
  ) {

    return true;

  }


  // ==========================================
  // NORMAL WALL
  // ==========================================

return map[r][c] === 1 ||
       (map[r][c] === 6 && currentLevel === 9 && !finalGateOpened);


  // Level 10 locked gates
if (currentLevel === 9 && map[r][c] === 10) {

    const gate = pellets.find(
        p =>
            p.finalGate &&
            Math.floor(p.x / tileSize) === c &&
            Math.floor(p.y / tileSize) === r
    );

    if (gate && !gate.opened) {
        return true;
    }
}

return false;
}

function spawnFinalGuardian() {
  if (finalGuardianSpawned) return;

  finalGuardianSpawned = true;

  ghosts.push({
    x: 14 * tileSize + tileSize / 2,
    y: 3 * tileSize + tileSize / 2,

    homeX: 14 * tileSize + tileSize / 2,
    homeY: 3 * tileSize + tileSize / 2,

    direction: 2,
    speed: 2.8,
    originalSpeed: 2.8,

    color: "white",
    originalColor: "white",

    isHunter: true,
    chaseMode: true,
    forceFleeTurn: false
  });
}

function checkLevel10Items() {
  if (currentLevel !== 9) return;

  pellets.forEach((item) => {
    if (item.eaten) return;

    const distance = Math.hypot(
      x - item.x,
      y - item.y
    );

    if (distance > radius + 8) return;

    if (item.crystal) {
      item.eaten = true;
      crystalsCollected++;

      score += 500;
      scoreBoard.textContent = "Score: " + score;

      console.log(
        "Crystal collected:",
        crystalsCollected,
        "/",
        totalCrystals
      );

      // Start the escape challenge after crystal 2.
      if (
        crystalsCollected === 2 &&
        !finalTimerActive
      ) {
        finalTimerActive = true;
        finalTimeRemaining = finalTimeLimit;

        spawnFinalGuardian();

       playSound("beep");

        console.log(
          "Final guardian spawned. Timer started."
        );
      }

      // Unlock the exit after all crystals.
      if (crystalsCollected >= totalCrystals) {
        finalExitUnlocked = true;

        console.log("Final exit unlocked.");
      }
    }

    if (item.exit) {
      if (finalExitUnlocked) {
        gameOver = true;
        win = true;

        startFireworks();
      }
    }
  });
}

function drawSwitch(x, y, activated = false) {

    ctx.save();

    ctx.fillStyle = activated
        ? "#00FF66"
        : "#FF3333";

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;

    ctx.shadowColor = activated
        ? "#00FF66"
        : "#FF3333";

    ctx.shadowBlur = 12;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function updateFinalTimer(deltaTime) {


  // Keep the warning active while the timer is running.
  finalWarningTimer += deltaTime;

  // Warning starts immediately after crystal #2.
  finalWarningActive = true;

  // Time is up.
  if (finalTimeRemaining <= 0) {

    finalTimeRemaining = 0;
    finalTimerActive = false;
    finalWarningActive = false;

    gameOver = true;
    win = false;

    if (soundEnabled) {
      sounds.hunter.pause();
      sounds.hunter.currentTime = 0;
    }

    return;
  }
}

function drawFinalGate(x, y, opened = false) {

    ctx.save();

    if (opened) {

        ctx.strokeStyle = "#00FF66";
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.35;

        ctx.shadowColor = "#00FF66";
        ctx.shadowBlur = 15;

        ctx.strokeRect(
            x - tileSize / 2,
            y - tileSize / 2,
            tileSize,
            tileSize
        );

    } else {

        ctx.fillStyle = "#AA00FF";
        ctx.strokeStyle = "#FF66FF";
        ctx.lineWidth = 3;

        ctx.shadowColor = "#FF00FF";
        ctx.shadowBlur = 15;

        for (let i = -10; i <= 10; i += 8) {

            ctx.fillRect(
                x + i - 2,
                y - tileSize / 2,
                4,
                tileSize
            );
        }

        ctx.strokeRect(
            x - tileSize / 2,
            y - tileSize / 2,
            tileSize,
            tileSize
        );
    }

    ctx.restore();
}
function drawFinalTimer() {
  if (currentLevel !== 9) return;
  if (!finalTimerActive) return;

  const seconds = Math.ceil(finalTimeRemaining);

  ctx.save();

  ctx.textAlign = "center";
  ctx.font = "bold 24px Arial";

  if (seconds <= 15) {
    ctx.fillStyle =
      Math.floor(performance.now() / 180) % 2 === 0
        ? "#FF0000"
        : "#FFFFFF";

    ctx.shadowColor = "#FF0000";
    ctx.shadowBlur = 18;
  } else {
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 10;
  }

  ctx.fillText(
    `ESCAPE TIME: ${seconds}`,
    canvas.width / 2,
    canvas.height - 15
  );

  ctx.restore();
}

function drawCrystal(x, y) {

    ctx.save();

    const pulse =
        1 + Math.sin(performance.now() / 150) * 0.15;

    ctx.translate(x, y);
    ctx.scale(pulse, pulse);

    ctx.fillStyle = "#00FFFF";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;

    ctx.shadowColor = "#00FFFF";
    ctx.shadowBlur = 18;

    ctx.beginPath();

    ctx.moveTo(0, -11);
    ctx.lineTo(8, -4);
    ctx.lineTo(6, 8);
    ctx.lineTo(0, 12);
    ctx.lineTo(-6, 8);
    ctx.lineTo(-8, -4);

    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function canMoveTo(newX, newY) {

  const left =
    Math.floor((newX - radius) / tileSize);

  const right =
    Math.floor((newX + radius) / tileSize);

  const top =
    Math.floor((newY - radius) / tileSize);

  const bottom =
    Math.floor((newY + radius) / tileSize);


  // ==========================================
  // LEVEL 5+ TUNNELS
  // ==========================================

  if (currentLevel >= 4) {

    if (
      top === 5 ||
      bottom === 5 ||
      top === 13 ||
      bottom === 13
    ) {

      if (
        right < 0 ||
        left >= map[0].length
      ) {

        return true;

      }

    }

  }


  return !(
    isWall(top, left) ||
    isWall(top, right) ||
    isWall(bottom, left) ||
    isWall(bottom, right)
  );
}

function getAvailableDirections(ghost) {
    const directions = [];


    const moves = [
        { dir: 0, dx: ghost.speed, dy: 0 },   // Right
        { dir: 1, dx: 0, dy: ghost.speed },   // Down
        { dir: 2, dx: -ghost.speed, dy: 0 },  // Left
        { dir: 3, dx: 0, dy: -ghost.speed }   // Up
    ];


    for (const move of moves) {
        if (canMoveTo(ghost.x + move.dx, ghost.y + move.dy)) {
            directions.push(move.dir);
        }
    }


    return directions;
}


function oppositeDirection(dir) {
    return [2, 3, 0, 1][dir];
}


function isCentered(entity) {
  return (
    Math.abs(entity.x - getTileCenter(entity.x)) <= entity.speed &&
    Math.abs(entity.y - getTileCenter(entity.y)) <= entity.speed
  );
}

function checkPelletCollision() {

  pellets.forEach((pellet) => {

    if (pellet.eaten) return;

    // ==========================================
    // LEVEL 9 ADVENTURE ITEMS
    // ==========================================
    // Keys, gates and exit are NOT normal pellets.
    // They are handled by checkAdventureItems().
    if (
      pellet.key ||
      pellet.gate ||
      pellet.exit
    ) {
      return;
    }

    const dx = x - pellet.x;
    const dy = y - pellet.y;
    const distance = Math.hypot(dx, dy);


    // ==========================================
    // CHERRY / EXTRA LIFE
    // ==========================================
    if (pellet.fruit) {

      if (distance < radius + 10) {

        pellet.eaten = true;

        lives = Math.min(lives + 1, maxLives);

        score += 500;

        scoreBoard.textContent = "Score: " + score;

        if (soundEnabled && sounds.lifeUp) {

          sounds.lifeUp.currentTime = 0;

          sounds.lifeUp.play().catch(() => {});
        }
      }

      return;
    }


    // ==========================================
    // NORMAL / POWER PELLET
    // ==========================================
    if (
      distance <
      radius + (pellet.power ? 8 : 4)
    ) {

      pellet.eaten = true;

      score += pellet.power ? 50 : 10;

      scoreBoard.textContent =
        "Score: " + score;


      if (!pellet.power && soundEnabled) {
        playPelletSound();
      }


      if (pellet.power) {
        startPowerMode();
      }
    }

  });
}

let lastPelletSoundTime = 0;
const pelletSoundCooldown = 140;

function playPelletSound() {
  const now = performance.now();

  // Prevent too many sounds from playing close together on mobile.
  if (now - lastPelletSoundTime < pelletSoundCooldown) {
    return;
  }

  lastPelletSoundTime = now;

  sounds.beep.pause();
  sounds.beep.currentTime = 0;
  sounds.beep.play().catch(() => {});
}

function startPowerMode() {
  powerMode = true;
  ghostsVulnerable = true;

  const activePowerDuration =
    currentLevel === 7 ? 6000 : powerDuration;

playSound("beep");

  ghosts.forEach((ghost) => {
    ghost.speed = ghost.originalSpeed * 0.5;
    ghost.color = "blue";

    // Force every ghost to reconsider its direction.
    ghost.forceFleeTurn = true;
  });

  clearTimeout(ghostSlowTimer);
  clearTimeout(powerTimer);

  ghostSlowTimer = setTimeout(() => {
    ghostsVulnerable = false;

    ghosts.forEach((ghost) => {
      ghost.speed = ghost.originalSpeed;
      ghost.color = ghost.originalColor;
      ghost.forceFleeTurn = false;
    });
  }, activePowerDuration);

  powerTimer = setTimeout(() => {
    powerMode = false;
  }, activePowerDuration);
}


function drawMap() {

  if (currentLevel === 7) {
    // Level 8: green ghost-storm maze.
    ctx.fillStyle = "#00A86B";
    ctx.shadowColor = "#00FFAA";
  } else if (currentLevel === 9) {
    // Level 10: blue maze.
    ctx.fillStyle = "#e1f00f";
    ctx.shadowColor = "#f5f104";
  } else if (currentLevel === 6) {
    // Level 7: red maze.
    ctx.fillStyle = "#D60000";
    ctx.shadowColor = "#FF3333";
  } else if (currentLevel === 5) {
    // Level 6: dark red maze.
    ctx.fillStyle = "#8B0000";
    ctx.shadowColor = "#FF4444";
  } else if (currentLevel === 4) {
    // Level 5: purple maze.
    ctx.fillStyle = "#8A2BE2";
    ctx.shadowColor = "#C77DFF";
  } else {
    // Earlier levels: blue maze.
    ctx.fillStyle = "#0066FF";
    ctx.shadowColor = "#00BFFF";
  }

ctx.shadowBlur = isMobile ? 0 : 20;

    for(let row=0; row<map.length; row++){
        for(let col=0; col<map[row].length; col++){

            if(map[row][col] === 1){
                ctx.fillRect(
                    col*tileSize,
                    row*tileSize,
                    tileSize,
                    tileSize
                );
            }

        }
    }
}

ctx.shadowBlur = 0;

function drawCherry(x, y) {
  ctx.save();

  // Use a small glow only on desktop.
  if (!isMobile) {
    ctx.shadowColor = "red";
    ctx.shadowBlur = 10;
  }

  // Draw the two red cherries.
  ctx.fillStyle = "#ff1744";

  ctx.beginPath();
  ctx.arc(x - 5, y + 3, 6, 0, Math.PI * 2);
  ctx.arc(x + 5, y + 3, 6, 0, Math.PI * 2);
  ctx.fill();

  // Draw the cherry highlights.
  ctx.fillStyle = "#ff8a80";

  ctx.beginPath();
  ctx.arc(x - 7, y + 1, 2, 0, Math.PI * 2);
  ctx.arc(x + 3, y + 1, 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw the stems.
  ctx.strokeStyle = "#66bb6a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 2);
  ctx.quadraticCurveTo(x - 4, y - 10, x, y - 13);
  ctx.moveTo(x + 5, y - 2);
  ctx.quadraticCurveTo(x + 4, y - 10, x, y - 13);
  ctx.stroke();

  // Draw the leaf.
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.ellipse(x + 4, y - 11, 5, 2.5, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
function drawGate(x, y, opened = false) {

  ctx.save();

  // ==========================================
  // OPEN GATE
  // ==========================================

  if (opened) {

    ctx.strokeStyle = "#00FF66";
    ctx.lineWidth = 3;

    ctx.globalAlpha = 0.35;

    ctx.shadowColor = "#00FF66";
    ctx.shadowBlur = isMobile ? 0 : 12;

    ctx.strokeRect(
      x - tileSize / 2,
      y - tileSize / 2,
      tileSize,
      tileSize
    );

    ctx.globalAlpha = 1;

    ctx.restore();

    return;
  }


  // ==========================================
  // CLOSED GATE
  // ==========================================

  ctx.fillStyle = "#777777";

  ctx.strokeStyle = "#FFFFFF";

  ctx.lineWidth = 3;

  ctx.shadowColor = "#AAAAAA";

  ctx.shadowBlur = isMobile ? 0 : 8;


  // Bars

  for (
    let offset = -12;
    offset <= 12;
    offset += 8
  ) {

    ctx.fillRect(
      x + offset - 2,
      y - tileSize / 2,
      4,
      tileSize
    );

  }


  // Border

  ctx.strokeRect(
    x - tileSize / 2,
    y - tileSize / 2,
    tileSize,
    tileSize
  );


  // Lock

  ctx.fillStyle = "#FFD700";

  ctx.fillRect(
    x - 4,
    y - 2,
    8,
    9
  );


  ctx.restore();

}

function drawLevel10HUD() {

  if (currentLevel !== 9) return;

  ctx.save();

  ctx.textAlign = "right";
  ctx.font = "bold 16px Arial";

  ctx.fillStyle = "#00FFFF";

  ctx.fillText(
    `Crystals: ${crystalsCollected}/${totalCrystals}`,
    canvas.width - 15,
    canvas.height - 38
  );

  ctx.fillStyle =
    finalExitUnlocked
      ? "#00FF66"
      : "#FF4444";

  ctx.fillText(
    finalExitUnlocked
      ? "EXIT OPEN"
      : "EXIT LOCKED",
    canvas.width - 15,
    canvas.height - 16
  );

  ctx.restore();
}
function drawPellets() {

  pellets.forEach((item) => {

    if (item.eaten) return;

    // =========================
    // LEVEL 10 CRYSTAL
    // =========================
    if (item.crystal) {
      drawCrystal(item.x, item.y);
      return;
    }

    // =========================
    // LEVEL 9 KEY
    // =========================
    if (item.key) {
      drawKey(item.x, item.y);
      return;
    }

    // =========================
    // GATE
    // =========================
 if (item.finalGate) {
  drawFinalGate(item.x, item.y, item.opened);
  return;
}

if (item.gate) {
  drawGate(item.x, item.y, item.opened);
  return;
}

    // =========================
    // EXIT
    // =========================
    if (item.exit) {
      drawExitPortal(item.x, item.y);
      return;
    }

    // =========================
    // CHERRY
    // =========================
    if (item.fruit) {
      drawCherry(item.x, item.y);
      return;
    }


    if (item.finalPortal) {
  drawFinalPortal(
    item.x,
    item.y,
    finalExitUnlocked
  );
  return;
}

    // =========================
    // NORMAL / POWER PELLET
    // =========================
    ctx.fillStyle = "white";

    if (!isMobile) {
      ctx.shadowColor = "white";
      ctx.shadowBlur = item.power ? 18 : 8;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();

    ctx.arc(
      item.x,
      item.y,
      item.power ? 8 : 4,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

  });
}

function drawFinalPortal(x, y, unlocked = false) {
  ctx.save();

  ctx.strokeStyle = unlocked
    ? "#00FF66"
    : "#FF3333";

  ctx.lineWidth = 5;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = isMobile ? 0 : 18;

  ctx.beginPath();
  ctx.arc(
    x,
    y,
    13 + Math.sin(performance.now() / 150) * 3,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.restore();
}

function checkFinalAdventureItems() {
  if (currentLevel !== 9) return;

  pellets.forEach((item) => {
    if (item.eaten) return;

    const distance = Math.hypot(
      x - item.x,
      y - item.y
    );

    if (distance > radius + 8) return;

    // -------------------------
    // Collect crystal
    // -------------------------
    if (item.crystal) {
      item.eaten = true;
      crystalsCollected++;

      score += 500;
      scoreBoard.textContent = "Score: " + score;

      console.log(
        "Crystal collected:",
        crystalsCollected,
        "/",
        totalCrystals
      );

      // Start the 90-second escape challenge after crystal 2.
      if (
        crystalsCollected === 2 &&
        !finalTimerActive
      ) {
        finalTimerActive = true;
        finalTimeRemaining = finalTimeLimit;

        // spawnFinalGuardian();

        console.log(
          "Final guardian spawned. Timer started."
        );

       playSound("beep");
      }

      // Open the exit after all crystals.
     if (crystalsCollected >= totalCrystals) {
  finalExitUnlocked = true;
  finalGateOpened = true;

  // Open all final gates.
  pellets.forEach((gate) => {
    if (gate.finalGate) {
      gate.opened = true;

      const col = Math.floor(gate.x / tileSize);
      const row = Math.floor(gate.y / tileSize);

      map[row][col] = 0;
    }
  });

  finalGatesOpened = totalFinalGates;

  console.log("Final gate opened.");
  console.log("Final exit unlocked.");
}
      return;
    }

    

    if (item.finalPortal && finalExitUnlocked) {
      item.eaten = true;
      gameOver = true;
      win = true;
      finalTimerActive = false;
      startFireworks();
    }
  });
}

function openNextFinalGate() {

    if (currentLevel !== 9) return;

    const gate = pellets.find(
        item =>
            item.finalGate &&
            !item.opened
    );

    if (!gate) return;

    gate.opened = true;

    finalGatesOpened++;

    // Make the corresponding map tile walkable.
    const col = Math.floor(gate.x / tileSize);
    const row = Math.floor(gate.y / tileSize);

    map[row][col] = 0;

   playSound("beep");

    if (
        finalGatesOpened >= totalFinalGates
    ) {
        finalPortalUnlocked = true;
    }
}

function drawKey(x, y) {
  ctx.save();

  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 4;
  ctx.shadowColor = "#FFD700";
  ctx.shadowBlur = 12;

  // Key ring.
  ctx.beginPath();
  ctx.arc(x - 5, y, 6, 0, Math.PI * 2);
  ctx.stroke();

  // Key shaft.
  ctx.beginPath();
  ctx.moveTo(x + 1, y);
  ctx.lineTo(x + 13, y);
  ctx.lineTo(x + 13, y + 5);
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + 8, y + 4);
  ctx.stroke();

  ctx.restore();
}


function drawExitPortal(x, y) {

  ctx.save();

  const portalOpen =
    keysCollected >= totalKeys &&
    gatesOpened >= totalGates;

  const pulse =
    Math.sin(performance.now() / 150) * 3;

  ctx.strokeStyle = portalOpen
    ? "#00FF66"
    : "#FF3333";

  ctx.lineWidth = portalOpen ? 6 : 5;

  ctx.shadowColor = portalOpen
    ? "#00FF66"
    : "#FF3333";

  ctx.shadowBlur = portalOpen ? 25 : 18;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    12 + pulse,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  // Show locked/unlocked centre.
  ctx.fillStyle = portalOpen
    ? "rgba(0,255,100,0.25)"
    : "rgba(255,50,50,0.15)";

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    7,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}
function drawGhost(ghost) {

    // Body
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y, radius, Math.PI, 0);
    ctx.lineTo(ghost.x + radius, ghost.y + radius);
    ctx.lineTo(ghost.x - radius, ghost.y + radius);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ghost.x - 5, ghost.y - 2, 3, 0, Math.PI * 2);
    ctx.arc(ghost.x + 5, ghost.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(ghost.x - 5, ghost.y - 2, 1.5, 0, Math.PI * 2);
    ctx.arc(ghost.x + 5, ghost.y - 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

function spawnFinalGuardian() {

  if (finalGuardianSpawned) return;

  finalGuardianSpawned = true;

  ghosts.push({

    // Starting position
    x: 8 * tileSize + tileSize / 2,
    y: 7 * tileSize + tileSize / 2,

    homeX: 8 * tileSize + tileSize / 2,
    homeY: 7 * tileSize + tileSize / 2,

    direction: 2,

    speed: 2.8,
    originalSpeed: 2.8,

    color: "white",
    originalColor: "white",

    isHunter: true,
    chaseMode: true,
    forceFleeTurn: false

  });
}

function drawLives(){

    let hearts="";

    for(let i=0;i<lives;i++){
        hearts += "🟡 ";
    }

    ctx.textAlign="left";
    ctx.font="20px Arial";
    ctx.fillStyle="white";
    ctx.fillText(hearts,10,25);

    // Ghost counter
    ctx.textAlign="right";
    ctx.fillStyle="#66ccff";
    ctx.font="18px Arial";
    // ctx.fillText("👻 x"+ghosts.length,canvas.width-15,82);

}

// ===========================
// Draw HUD
// ===========================
function drawHUD(){

    // Background
    ctx.fillStyle = "#050505";
    ctx.fillRect(0,0,canvas.width,60);

    // Neon top line
    ctx.strokeStyle = "#00ccff";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0,58);
    ctx.lineTo(canvas.width,58);
    ctx.stroke();

    // ---------- SCORE ----------
    ctx.textAlign="left";

    ctx.font="bold 13px Arial";
    ctx.fillStyle="#66ccff";
    ctx.fillText("SCORE",15,18);

    ctx.font="bold 22px Arial";
    ctx.fillStyle="yellow";
    ctx.fillText(score.toLocaleString(),15,45);

    // ---------- HIGH SCORE ----------
    ctx.textAlign="center";

    ctx.font="bold 13px Arial";
    ctx.fillStyle="#66ccff";
    ctx.fillText("HIGH SCORE",canvas.width/2,18);

    ctx.font="bold 22px Arial";
    ctx.fillStyle="#00ff66";
    ctx.fillText(highScore.toLocaleString(),canvas.width/2,45);

    // ---------- LEVEL ----------
    ctx.textAlign="right";

    ctx.font="bold 13px Arial";
    ctx.fillStyle="#66ccff";
    ctx.fillText("LEVEL",canvas.width-15,18);

    ctx.font="bold 22px Arial";
    ctx.fillStyle="#ff66ff";
    ctx.fillText(currentLevel+1,canvas.width-15,45);

}

function drawLevelIntro() {

    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";

    ctx.font = "42px Arial";
    ctx.fillText(
        "LEVEL " + (currentLevel + 1),
        canvas.width / 2,
        170
    );

    ctx.font = "34px Arial";
    ctx.fillText(
        levelInfo[currentLevel].title,
        canvas.width / 2,
        240
    );

    ctx.fillStyle = "white";
    ctx.font = "22px Arial";
    ctx.fillText(
        levelInfo[currentLevel].message,
        canvas.width / 2,
        300
    );
}

function getRandomDirection() {
  const directions = [0, 1, 2, 3];
  return directions[Math.floor(Math.random() * directions.length)];
}

function hunterDirection(ghost) {

    const choices = [];

    const moves = [
        { dir:0, dx: ghost.speed, dy:0 },     // Right
        { dir:1, dx:0, dy: ghost.speed },     // Down
        { dir:2, dx:-ghost.speed, dy:0 },     // Left
        { dir:3, dx:0, dy:-ghost.speed }      // Up
    ];

    for(const move of moves){

        const nx = ghost.x + move.dx;
        const ny = ghost.y + move.dy;

        if(canMoveTo(nx, ny)){

            const distance = Math.hypot(x - nx, y - ny);

            choices.push({
                dir: move.dir,
                distance: distance
            });

        }
    }

    if(choices.length === 0)
        return ghost.direction;

    choices.sort((a,b)=>a.distance-b.distance);

    return choices[0].dir;

}

function isPathTile(level, row, col) {
  return (
    level[row] &&
    level[row][col] !== undefined &&
    level[row][col] !== 1
  );
}

function isOppositeDirection(dir1, dir2) {
  return oppositeDirection(dir1) === dir2;
}
function fleeingDirection(ghost) {
  const choices = [];

  const moves = [
    { dir: 0, dx: ghost.speed, dy: 0 },
    { dir: 1, dx: 0, dy: ghost.speed },
    { dir: 2, dx: -ghost.speed, dy: 0 },
    { dir: 3, dx: 0, dy: -ghost.speed }
  ];

  for (const move of moves) {
    const nextX = ghost.x + move.dx;
    const nextY = ghost.y + move.dy;

    if (!canMoveTo(nextX, nextY)) {
      continue;
    }

    const distance = Math.hypot(x - nextX, y - nextY);

    choices.push({
      dir: move.dir,
      distance
    });
  }

  if (choices.length === 0) {
    return oppositeDirection(ghost.direction);
  }

  // Prefer the reverse route when power mode begins.
  if (ghost.forceFleeTurn) {
    const reverse = choices.find(
      (choice) => choice.dir === oppositeDirection(ghost.direction)
    );

    if (reverse) {
      ghost.forceFleeTurn = false;
      return reverse.dir;
    }

    ghost.forceFleeTurn = false;
  }

  // Otherwise choose the route farthest from Pac-Man.
  choices.sort((a, b) => b.distance - a.distance);

  return choices[0].dir;
}
function updateGhost(ghost, timeScale) {
  const movement = ghost.speed * timeScale;

  // Keep Hunter state updated.
  if (ghost.isHunter) {
    ghost.chaseMode = hunterChasing;
  }

  // Choose a new direction only at tile centers.
  if (isCentered(ghost)) {
    if (ghostsVulnerable) {
      // Frightened ghosts run away.
      ghost.direction = fleeingDirection(ghost);
    } else if (ghost.isHunter && ghost.chaseMode) {
      // Hunter chases only when Hunter mode is active.
      ghost.direction = hunterDirection(ghost);
    }
  }

  let nextX = ghost.x;
  let nextY = ghost.y;

  if (ghost.direction === 0) {
    nextX += movement;
  } else if (ghost.direction === 1) {
    nextY += movement;
  } else if (ghost.direction === 2) {
    nextX -= movement;
  } else if (ghost.direction === 3) {
    nextY -= movement;
  }

  // Continue moving if the selected direction is valid.
  if (canMoveTo(nextX, nextY)) {
    ghost.x = nextX;
    ghost.y = nextY;
  } else {
    // The current direction is blocked.
    const possibleDirections = [0, 1, 2, 3].filter((dir) => {
      let testX = ghost.x;
      let testY = ghost.y;

      if (dir === 0) {
        testX += movement;
      } else if (dir === 1) {
        testY += movement;
      } else if (dir === 2) {
        testX -= movement;
      } else if (dir === 3) {
        testY -= movement;
      }

      return canMoveTo(testX, testY);
    });

    if (possibleDirections.length > 0) {
      if (ghostsVulnerable) {
        // Choose a valid fleeing direction.
        const fleeDirection = fleeingDirection(ghost);

        if (possibleDirections.includes(fleeDirection)) {
          ghost.direction = fleeDirection;
        } else {
          // Fall back to any valid direction.
          const randomIndex = Math.floor(
            Math.random() * possibleDirections.length
          );

          ghost.direction = possibleDirections[randomIndex];
        }
      } else {
        const randomIndex = Math.floor(
          Math.random() * possibleDirections.length
        );

        ghost.direction = possibleDirections[randomIndex];
      }
    }
  }

  // Tunnel wrapping for Levels 5 and later.
  if (currentLevel >= 4) {
    if (ghost.x < -radius) {
      ghost.x = canvas.width + radius;
    }

    if (ghost.x > canvas.width + radius) {
      ghost.x = -radius;
    }
  }
}

function checkGhostCollision() {
  for(const ghost of ghosts) {
  const dx = x - ghost.x;
  const dy = y - ghost.y;
  const distance = Math.sqrt(dx * dx + dy * dy);


if(distance < radius + 10){

    if(ghostsVulnerable){

 playSound("beep");

        if (currentLevel === 0) {
  score += 300;
} else {
  score += 200;
}

        if (score > highScore) {
    highScore = score;
    localStorage.setItem("pacmanHighScore", highScore);
}

        scoreBoard.textContent = "Score: " + score;

        // Send ghost back to its starting position
        ghost.x = ghost.homeX;
        ghost.y = ghost.homeY;

        ghost.direction = 2;
        ghost.color = ghost.originalColor;
        ghost.speed = ghost.originalSpeed;

    }
    else{

        lives--;

        playSound("beep");

        if(lives <= 0){

            gameOver = true;

        }
        else{

            resetPlayer();

        }

    }

    return;

}
}
}
function checkAdventureItems() {

  if (currentLevel !== 8) return;

  // ==========================================
  // COLLECT KEYS
  // ==========================================

  pellets.forEach((item) => {

    if (!item.key || item.eaten) return;

    const distance = Math.hypot(
      x - item.x,
      y - item.y
    );

    if (distance <= radius + 8) {

      item.eaten = true;

      keysCollected++;

      score += 250;

      scoreBoard.textContent = "Score: " + score;

      playSound("beep");

    }

  });


  // ==========================================
  // OPEN GATES
  // ==========================================

  // Number of gates that should be open
  // is equal to number of keys collected.

  const gatesThatShouldBeOpen =
    Math.min(keysCollected, totalGates);


  pellets.forEach((item) => {

    if (!item.gate) return;

    // Determine which gate this is.
    const gateIndex =
      pellets
        .filter(p => p.gate)
        .indexOf(item);


    // Open this gate if enough keys
    // have been collected.
    if (
      gateIndex < gatesThatShouldBeOpen &&
      !item.opened
    ) {

      item.opened = true;

      gatesOpened++;

      score += 500;

      scoreBoard.textContent =
        "Score: " + score;

     playSound("beep");

    }

  });


  // ==========================================
  // EXIT
  // ==========================================

  if (
    keysCollected >= totalKeys &&
    gatesOpened >= totalGates
  ) {

    exitUnlocked = true;

  }


  // ==========================================
  // ENTER EXIT
  // ==========================================

  pellets.forEach((item) => {

    if (!item.exit) return;

    const distance = Math.hypot(
      x - item.x,
      y - item.y
    );

    if (
      exitUnlocked &&
      distance <= radius + 10
    ) {

      currentLevel++;
map = levels[currentLevel].map(row => [...row]);
loadLevel();
      

    }

  });

}

function resetPlayer() {
  const spawn = playerSpawns[currentLevel];

  x = spawn.col * tileSize + tileSize / 2;
  y = spawn.row * tileSize + tileSize / 2;
  direction = 0;
}

function createFirework(centerX, centerY) {
  const colors = [
    "#ff1744",
    "#ffea00",
    "#00e5ff",
    "#76ff03",
    "#ff66ff",
    "#ffffff"
  ];

  const color = colors[Math.floor(Math.random() * colors.length)];
  const particleCount = 55;

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount;
    const speed = 1.5 + Math.random() * 3.5;

    fireworks.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.5 + Math.random() * 2,
      alpha: 1,
      color: color
    });
  }
}


function startFireworks() {
  fireworks = [];
  fireworksActive = true;

  const now = performance.now();

  fireworksEndTime = now + 7000;
  lastFireworkTime = 0;

  // Create the first fireworks immediately.
  createFirework(canvas.width * 0.25, canvas.height * 0.35);
  createFirework(canvas.width * 0.75, canvas.height * 0.35);
  createFirework(canvas.width * 0.5, canvas.height * 0.2);
}


function updateFireworks(currentTime) {
  if (!fireworksActive) return;

  // Add more fireworks every 400 milliseconds.
  if (
    currentTime - lastFireworkTime > 400 &&
    currentTime < fireworksEndTime
  ) {
    const fireworkX = 40 + Math.random() * (canvas.width - 80);
    const fireworkY = 80 + Math.random() * (canvas.height * 0.45);

    createFirework(fireworkX, fireworkY);
    lastFireworkTime = currentTime;
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const particle = fireworks[i];

    particle.x += particle.vx;
    particle.y += particle.vy;

    particle.vy += 0.045;
    particle.alpha -= 0.012;

    if (particle.alpha <= 0) {
      fireworks.splice(i, 1);
    }
  }

  if (
    currentTime >= fireworksEndTime &&
    fireworks.length === 0
  ) {
    fireworksActive = false;
  }
}


function drawFireworks() {
  fireworks.forEach((particle) => {
    ctx.save();

    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(
      particle.x,
      particle.y,
      particle.size,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  });

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function checkWinCondition() {

    console.log(
        "checkWinCondition called, currentLevel:",
        currentLevel
    );

    // ==========================================
    // LEVEL 9 - ADVENTURE MODE
    // ==========================================
    // Level 9 does NOT finish by eating all pellets.
    // It finishes by reaching the unlocked exit.
    if (currentLevel === 8) {
        return;
    }

    // ==========================================
    // LEVEL 10 - FINAL ESCAPE
    // ==========================================
    // Level 10 has its own crystal + final portal
    // completion logic.
    if (currentLevel === 9) {
        return;
    }

    // ==========================================
    // NORMAL LEVELS 1-8
    // ==========================================

    const allEaten = pellets.every(
        pellet => pellet.eaten
    );

    if (!allEaten) {
        return;
    }

    // Move to next level if available.
    if (currentLevel < levels.length - 1) {

        currentLevel++;

        map = levels[currentLevel].map(
            row => [...row]
        );

        loadLevel();

        return;
    }

    // This should only happen after Level 10
    // is truly completed.
    gameOver = true;
    win = true;

    startFireworks();
}


function drawAdventureHUD() {
  if (currentLevel !== 8) return;

  ctx.save();

  ctx.textAlign = "right";
  ctx.font = "bold 16px Arial";

  ctx.fillStyle = "#FFD700";
  ctx.fillText(
    `Keys: ${keysCollected}/${totalKeys}`,
    canvas.width - 15,
    canvas.height - 38
  );

  ctx.fillStyle = "#66FFAA";
  ctx.fillText(
    `Gates: ${gatesOpened}/${totalGates}`,
    canvas.width - 15,
    canvas.height - 16
  );

  ctx.restore();
}

function drawFinalHUD() {
  if (currentLevel !== 9) return;

  ctx.save();

  ctx.textAlign = "left";
  ctx.font = "bold 15px Arial";

  ctx.fillStyle = "#00FFFF";
  ctx.fillText(
    `Crystals: ${crystalsCollected}/${totalCrystals}`,
    15,
    canvas.height - 38
  );

  ctx.fillStyle = finalExitUnlocked
    ? "#00FF66"
    : "#FF4444";

  ctx.fillText(
    finalExitUnlocked
      ? "EXIT OPEN"
      : "EXIT LOCKED",
    15,
    canvas.height - 16
  );

  if (finalTimerActive) {
    const seconds = Math.max(
      0,
      Math.ceil(finalTimeRemaining)
    );

    ctx.textAlign = "right";

    ctx.fillStyle = seconds <= 15
      ? (
          Math.floor(performance.now() / 180) % 2 === 0
            ? "#FF0000"
            : "#FFFFFF"
        )
      : "#FFD700";

    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12;

    ctx.fillText(
      `TIME: ${seconds}`,
      canvas.width - 15,
      canvas.height - 16
    );
  }

  ctx.restore();
}

// function drawCrystal(x, y) {

//   ctx.save();

//   ctx.translate(x, y);

//   ctx.fillStyle = "#00FFFF";
//   ctx.strokeStyle = "#FFFFFF";
//   ctx.lineWidth = 2;

//   ctx.shadowColor = "#00FFFF";
//   ctx.shadowBlur = isMobile ? 0 : 18;

//   ctx.beginPath();

//   ctx.moveTo(0, -12);
//   ctx.lineTo(8, -4);
//   ctx.lineTo(5, 10);
//   ctx.lineTo(0, 14);
//   ctx.lineTo(-5, 10);
//   ctx.lineTo(-8, -4);

//   ctx.closePath();

//   ctx.fill();
//   ctx.stroke();

//   ctx.restore();
// }
function drawFinalWarning() {

  if (currentLevel !== 9) return;
  if (!finalTimerActive) return;
  if (!finalWarningActive) return;

  // Flash approximately every 500ms.
  if (Math.floor(performance.now() / 500) % 2 !== 0) {
    return;
  }

  ctx.save();

  ctx.textAlign = "center";

  // Make the warning stronger when time is running low.
  let message = "⚠ ESCAPE! YOU HAVE LIMITED TIME! ⚠";
  let fontSize = 21;

  if (finalTimeRemaining <= 30) {
    message = "⚠ HURRY! GET TO THE EXIT! ⚠";
    fontSize = 24;
  }

  if (finalTimeRemaining <= 15) {
    message = "🚨 RUN! TIME IS RUNNING OUT! 🚨";
    fontSize = 26;
  }

  ctx.font = `bold ${fontSize}px Arial`;

  ctx.fillStyle =
    finalTimeRemaining <= 15
      ? "#FF0000"
      : "#ff1e00";

  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 18;

  ctx.fillText(
    message,
    canvas.width / 2,
    30
  );

  ctx.restore();
}

function update(currentTime) {
  if (!lastTime) {
    lastTime = currentTime;
  }

  let deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Prevent a large jump after the phone sleeps or changes tabs.
  deltaTime = Math.min(deltaTime, 50);

  // 1.0 means normal 60-FPS movement.
  const timeScale = deltaTime / normalFrameTime;

    ctx.shadowBlur = 0;
    
  if (levelIntro) {
  // startMainTheme();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawMap();
  drawPellets();
  ghosts.forEach(drawGhost);
  drawLevelIntro();

  introTimer -= deltaTime;

  if (introTimer <= 0) {
    levelIntro = false;
  }

  animationID = requestAnimationFrame(update);
  return;
}
 
 
if (gameOver) {
  stopMainTheme();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (win) {
    // Dark celebration background.
    ctx.fillStyle = "rgba(0, 0, 20, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateFireworks(currentTime);
    drawFireworks();

    ctx.textAlign = "center";

    ctx.fillStyle = "#ffff00";
    ctx.font = "bold 34px Arial";
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 15;

    ctx.fillText(
      "HURRAY! You are the Champion!",
      canvas.width / 2,
      canvas.height / 2
    );

    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "white";
    ctx.shadowBlur = 0;

    ctx.fillText(
      "Pac-Man: The BOSS!",
      canvas.width / 2,
      canvas.height / 2 + 40
    );
  } else {
    drawMap();
    drawPellets();
    ghosts.forEach(drawGhost);
    drawLives();

    drawLevel10HUD();
    drawFinalHUD();
    drawFinalTimer();
    drawFinalWarning();

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      "OH NO! GAME OVER",
      canvas.width / 2,
      canvas.height / 2
    );
  }

  // Keep the fireworks animation running.
  animationID = requestAnimationFrame(update);
  return;
}

  let nextX = x;
  let nextY = y;


  if (keys["ArrowRight"]) direction = 0;
  if (keys["ArrowDown"]) direction = 1;
  if (keys["ArrowLeft"]) direction = 2;
  if (keys["ArrowUp"]) direction = 3;


  if (direction === 0 || direction === 2) nextY = getTileCenter(y);
  if (direction === 1 || direction === 3) nextX = getTileCenter(x);


// Movement adjusted for the actual frame time.
const playerMovement = playerSpeed * timeScale;

if (direction === 0) nextX += playerMovement;
if (direction === 1) nextY += playerMovement;
if (direction === 2) nextX -= playerMovement;
if (direction === 3) nextY -= playerMovement;

// ---------- LEVEL 5 TUNNEL ----------
if (canMoveTo(nextX, nextY)) {
    x = nextX;
    y = nextY;
}

if (currentLevel === 4) {

    if (x < -radius)
        x = canvas.width + radius;

    if (x > canvas.width + radius)
        x = -radius;

}



if (currentLevel >= 4) {

    if (x < -radius) {
        x = canvas.width + radius;
    }

    if (x > canvas.width + radius) {
        x = -radius;
    }

}


updateMouth();
checkPelletCollision();
checkAdventureItems();
checkFinalAdventureItems();
// checkLevel10Items();
updateFinalTimer(deltaTime);



if (gameOver) {
  animationID = requestAnimationFrame(update);
  return;
}

// -------------------------
// LEVEL 6 Hunter Timer
// -------------------------
if (currentLevel === 5) {
  hunterTimer += deltaTime;

  // Hunter starts after five seconds.
  if (!hunterChasing && hunterTimer >= 5000) {
    hunterChasing = true;
    hunterTimer = 0;

    startLoopSound("hunter");
  }

  // Hunter stops after three seconds.
  if (hunterChasing && hunterTimer >= 3000) {
    hunterChasing = false;
    hunterTimer = 0;

    stopLoopSound("hunter");
  }
}

ghosts.forEach((ghost) => updateGhost(ghost, timeScale));
checkGhostCollision();
checkWinCondition();


ctx.clearRect(0,0,canvas.width,canvas.height);


drawMap();
drawPellets();
ghosts.forEach(drawGhost);
drawLives();
drawAdventureHUD();
drawLevel10HUD();

drawFinalHUD();
drawFinalWarning();


  ctx.save();
  ctx.translate(x, y);


  if (direction === 0) ctx.rotate(0);
  if (direction === 1) ctx.rotate(Math.PI / 2);
  if (direction === 2) ctx.rotate(Math.PI);
  if (direction === 3) ctx.rotate(-Math.PI / 2);


  ctx.shadowColor = "yellow";
  ctx.shadowBlur = isMobile ? 0 : 20;
  ctx.beginPath();
  ctx.arc(0, 0, radius, mouthOpen * Math.PI, (2 - mouthOpen) * Math.PI);
  ctx.lineTo(0, 0);
  ctx.fill();
  ctx.restore();


  animationID = requestAnimationFrame(update);
  
}

ctx.shadowBlur = 0;



restartBtn.addEventListener("click", () => {
  // enableSound();

  // stopMainTheme();

  fireworks = [];
  fireworksActive = false;

  cancelAnimationFrame(animationID);
  animationID = null;

  clearTimeout(ghostSlowTimer);
  clearTimeout(powerTimer);

  sounds.hunter.pause();
  sounds.hunter.currentTime = 0;
  sounds.hunter.loop = false;

  // Decide which level to restart.
  const restartLevel =
    requestedLevel >= 1 && requestedLevel <= 10
      ? requestedLevel - 1
      : 0;

  gameOver = false;
  win = false;

  currentLevel = restartLevel;
  score = 0;
  lives = 1;
  lastTime = 0;

  levelIntro = true;
  introTimer = currentLevel === 0 ? 1800 : 3000;

  scoreBoard.textContent = "Score: 0";

  map = levels[currentLevel].map(row => [...row]);

  loadLevel();


  // startMainTheme();
  if (soundEnabled) startMainTheme();

  animationID = requestAnimationFrame(update);
});

// loadLevel();
// lastTime = 0;
// animationID = requestAnimationFrame(update);

function startGame() {
  if (animationID !== null) return;

  loadLevel();
  lastTime = 0;
  animationID = requestAnimationFrame(update);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startGame, { once: true });
} else {
  startGame();
}