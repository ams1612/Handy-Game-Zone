const gridContainer = document.querySelector("#grid");
const movesDisplay = document.querySelector("#moves-count");
const levelDisplay = document.querySelector("#level-count");
const resetBtn = document.querySelector("#reset-btn");
const flipSound = new Audio("Sounds/flip.mp3");
flipSound.volume = 0.35;
const matchSound = new Audio("Sounds/match.mp3");
const wrongSound = new Audio("Sounds/wrong.mp3");
const levelUpSound = new Audio("Sounds/levelup.mp3");
const timeoutSound = new Audio("Sounds/timeout.mp3");

let soundEnabled = localStorage.getItem('memoryGameSound') !== 'false';

const soundToggleBtn = document.querySelector("#sound-toggle-btn");

function updateSoundBtnIcon() {
    soundToggleBtn.innerText = soundEnabled ? "🔊" : "🔇";
}

soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('memoryGameSound', soundEnabled);
    updateSoundBtnIcon();
});

updateSoundBtnIcon();

// ==========================================
// AVAILABLE FRUIT
// ==========================================

const items = [
    '🍎',
    '🍌',
    '🍇',
    '🍉',
    '🍓',
    '🍒',
    '🍍',
    '🥝',
    '🥭',
    '🍑',
    '🍊',
    '🍋',
    '🍐',
    '🍈',
    '🫐',
    '🥥',
    '🥭',
    '🍏',
    '🍅',
    '🌽',
    '🥕',
    '🍆',
    '🥑',
    '🌶️',
    '🥒',
    '🥔',
    '🍄',
    '🥦',
    '🧅',
    '🫑'
];


// ==========================================
// LEVEL SETTINGS
// ==========================================

const levels = [

    {
        level: 1,
        name: "Easy",
        pairs: 4,
        time: 0
    },

    {
        level: 2,
        name: "Easy",
        pairs: 6,
        time: 0
    },

    {
        level: 3,
        name: "Medium",
        pairs: 8,
        time: 90
    },

    {
        level: 4,
        name: "Medium",
        pairs: 10,
        time: 90
    },

    {
        level: 5,
        name: "Hard",
        pairs: 12,
        time: 75
    },

    {
        level: 6,
        name: "Hard",
        pairs: 15,
        time: 75
    },

    {
        level: 7,
        name: "Expert",
        pairs: 18,
        time: 60
    },

    {
        level: 8,
        name: "Expert",
        pairs: 20,
        time: 60
    },

    {
        level: 9,
        name: "Master",
        pairs: 24,
        time: 50
    },

    {
        level: 10,
        name: "Ultimate",
        pairs: 30,
        time: 45
    }

];


// ==========================================
// GAME VARIABLES
// ==========================================

let currentLevel = 1;

let deck = [];

let flippedCards = [];

let matchedCount = 0;

let moves = 0;

let isLockBoard = false;


// ==========================================
// TIMER VARIABLES
// ==========================================

let timerInterval = null;

let timeRemaining = 0;

let timerStarted = false;

let levelFinished = false;


// ==========================================
// SHUFFLE DECK
// ==========================================

function shuffleDeck() {

    for (let i = deck.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [deck[i], deck[j]] =
            [deck[j], deck[i]];
    }
}


// ==========================================
// INITIALISE GAME / LEVEL
// ==========================================

function initGame() {

    // Stop any previous timer
    stopTimer();


    // Reset game variables
    gridContainer.innerHTML = "";

    flippedCards = [];

    matchedCount = 0;

    moves = 0;

    isLockBoard = false;

    timerStarted = false;

    levelFinished = false;


    movesDisplay.innerText = moves;

    levelDisplay.innerText = currentLevel;


    // Get current level settings
    const levelSettings =
        levels[currentLevel - 1];


    const numberOfPairs =
        levelSettings.pairs;


    // Set timer
    timeRemaining =
        levelSettings.time;


    updateTimerDisplay();


    // Select fruit for this level
    const selectedItems =
        items.slice(0, numberOfPairs);


    // Create pairs
    deck = [
        ...selectedItems,
        ...selectedItems
    ];


    // Shuffle
    shuffleDeck();


    // Create cards
    deck.forEach((emoji, index) => {

        const card =
            document.createElement("div");

        card.classList.add("card");

        card.dataset.value = emoji;

        card.dataset.index = index;

        card.innerText = "";


        card.addEventListener(
            "click",
            handleCardClick
        );


        gridContainer.appendChild(card);

    });


    // Adjust grid
    updateGridLayout();

}



function updateGridLayout() {
    // Let CSS control the responsive number and width of columns.
    gridContainer.style.removeProperty("grid-template-columns");
}

// ==========================================
// CARD CLICK
// ==========================================

function handleCardClick() {

    // Do nothing if board is locked
    if (isLockBoard) {
        return;
    }


    // Do nothing if level is finished
    if (levelFinished) {
        return;
    }


    // Do nothing if card already selected
    if (
        this.classList.contains("flipped") ||
        this.classList.contains("matched")
    ) {
        return;
    }


    // Start timer on first card click
    if (!timerStarted) {

        startTimer();

    }


    // Flip card
    this.classList.add("flipped");

    this.innerText =
        this.dataset.value;

        // 🔊 Play flip sound
playSound(flipSound);


    flippedCards.push(this);


    // Two cards selected
    if (flippedCards.length === 2) {

        moves++;

        movesDisplay.innerText = moves;

        checkMatch();

    }

}


// ==========================================
// CHECK MATCH
// ==========================================

function checkMatch() {

    const [card1, card2] =
        flippedCards;


    // ======================================
    // MATCH
    // ======================================

    if (
        card1.dataset.value ===
        card2.dataset.value
    ) {

        card1.classList.replace(
            "flipped",
            "matched"
        );

        card2.classList.replace(
            "flipped",
            "matched"
        );

          // 🔊 Play match sound
   playSound(matchSound);


        matchedCount += 2;

        flippedCards = [];


        // Check if entire level is complete
        if (
            matchedCount ===
            deck.length
        ) {

            completeLevel();

        }


        return;
    }


    // 🔊 Play wrong sound
playSound(wrongSound);

    // ======================================
    // NO MATCH
    // ======================================

    isLockBoard = true;


    setTimeout(() => {

        card1.classList.remove("flipped");

        card2.classList.remove("flipped");

        card1.innerText = "";

        card2.innerText = "";


        flippedCards = [];

        isLockBoard = false;

    }, 1000);

}


// ==========================================
// START TIMER
// ==========================================

function startTimer() {

    const levelSettings =
        levels[currentLevel - 1];


    // Levels 1 and 2 have no timer
    if (levelSettings.time === 0) {
        return;
    }


    // Prevent timer starting twice
    if (timerStarted) {
        return;
    }


    timerStarted = true;


    timerInterval =
        setInterval(() => {

            timeRemaining--;

            updateTimerDisplay();


            // Time has run out
            if (timeRemaining <= 0) {

                timeRemaining = 0;

                updateTimerDisplay();

                stopTimer();

                failLevel();

            }

        }, 1000);

}


// ==========================================
// STOP TIMER
// ==========================================

function stopTimer() {

    if (timerInterval !== null) {

        clearInterval(timerInterval);

        timerInterval = null;

    }

}


// ==========================================
// TIMER DISPLAY
// ==========================================

function updateTimerDisplay() {

    let timerElement =
        document.querySelector("#timer");


    // Create timer display if it doesn't exist
    if (!timerElement) {

        timerElement =
            document.createElement("div");

        timerElement.id = "timer";

        timerElement.classList.add(
            "timer-display"
        );


        const scoreBoard =
            document.querySelector(
                ".score-board"
            );


        scoreBoard.insertAdjacentElement(
            "afterend",
            timerElement
        );

    }


    const levelSettings =
        levels[currentLevel - 1];


    // No timer for Level 1 and 2
    if (levelSettings.time === 0) {

        timerElement.innerText =
            "Time: Unlimited";

        timerElement.style.color =
            "#333";

        return;
    }


    const minutes =
        Math.floor(timeRemaining / 60);

    const seconds =
        timeRemaining % 60;


    const formattedTime =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    timerElement.innerText =
        `Time: ${formattedTime}`;


    // Warning colours
    if (timeRemaining <= 10) {

        timerElement.style.color =
            "#dc2626";

    }

    else if (timeRemaining <= 20) {

        timerElement.style.color =
            "#f59e0b";

    }

    else {

        timerElement.style.color =
            "#333";

    }

}


// ==========================================
// LEVEL COMPLETED
// ==========================================

function completeLevel() {

    levelFinished = true;

    isLockBoard = true;

    stopTimer();

    // 🔊 Play level up sound
playSound(levelUpSound);

    // More levels available
    if (
        currentLevel <
        levels.length
    ) {

        setTimeout(() => {

            currentLevel++;

            initGame();

        }, 1000);


        return;
    }


    // ======================================
    // ALL 10 LEVELS COMPLETED
    // ======================================

    setTimeout(() => {

        alert(
            `🏆 AMAZING!\n\nYou completed all 10 levels!\n\nTotal Moves: ${moves}`
        );

    }, 500);

}

function playSound(sound) {
    if (!soundEnabled) return;
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

// ==========================================
// LEVEL FAILED
// ==========================================

function failLevel() {

    levelFinished = true;
    isLockBoard = true;

    stopTimer();

     // 🔊 Play timeout sound
  playSound(timeoutSound);

    // Show Game Over message
    const message = document.createElement("div");

    message.id = "timeUpMessage";

    message.innerHTML = `
        <div class="time-up-box">

            <div class="time-up-icon">⏰</div>

            <h1>TIME'S UP!</h1>

            <p>Level ${currentLevel} was not completed.</p>

            <button id="retryLevelBtn">
                TRY AGAIN
            </button>

        </div>
    `;

    document.body.appendChild(message);

    document
        .getElementById("retryLevelBtn")
        .addEventListener("click", () => {

            message.remove();

            initGame();

        });

}


// ==========================================
// START GAME
// ==========================================

initGame();