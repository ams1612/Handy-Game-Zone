// Word lists for different difficulty levels
const wordData = {
    easy: {
        gridSize: 5,
        words: [
            { word: "CAT", clue: "A common pet animal" },
            { word: "DOG", clue: "A loyal four-legged friend" },
            { word: "SUN", clue: "The star at the center of our solar system" },
            { word: "MOON", clue: "Earth's natural satellite" },
            { word: "TREE", clue: "A tall plant with a trunk" },
            { word: "BOOK", clue: "Something you read" },
            { word: "FISH", clue: "Lives in water and swims" },
            { word: "BIRD", clue: "Has wings and can fly" },
            { word: "MILK", clue: "White drink from cows" },
            { word: "CAKE", clue: "Sweet dessert for celebrations" },
            { word: "HAT", clue: "Worn on your head" },
            { word: "CUP", clue: "Used for drinking" },
            { word: "PEN", clue: "Used for writing" },
            { word: "RED", clue: "A primary color" },
            { word: "BLUE", clue: "Color of the sky" }
        ]
    },
    medium: {
        gridSize: 8,
        words: [
            { word: "APPLE", clue: "A red or green fruit" },
            { word: "BEACH", clue: "Sandy shore by the ocean" },
            { word: "CHAIR", clue: "Something you sit on" },
            { word: "DANCE", clue: "Move rhythmically to music" },
            { word: "EAGLE", clue: "A large bird of prey" },
            { word: "FRUIT", clue: "Sweet edible plant product" },
            { word: "GHOST", clue: "Spirit of a dead person" },
            { word: "HOUSE", clue: "A place where people live" },
            { word: "ISLAND", clue: "Land surrounded by water" },
            { word: "JUICE", clue: "Liquid from fruits or vegetables" },
            { word: "KITE", clue: "Flies in the wind on a string" },
            { word: "LEMON", clue: "Sour yellow citrus fruit" },
            { word: "MUSIC", clue: "Pleasant sounds arranged in time" },
            { word: "NIGHT", clue: "The dark part of the day" },
            { word: "OCEAN", clue: "Vast body of salt water" },
            { word: "PARTY", clue: "Social gathering for celebration" },
            { word: "QUEEN", clue: "Female ruler of a kingdom" },
            { word: "RADIO", clue: "Device for listening to broadcasts" },
            { word: "SNAKE", clue: "Long legless reptile" },
            { word: "TIGER", clue: "Large striped wild cat" }
        ]
    },
    hard: {
        gridSize: 10,
        words: [
            { word: "ADVENTURE", clue: "An exciting or unusual experience" },
            { word: "BUTTERFLY", clue: "Colorful insect with large wings" },
            { word: "CHOCOLATE", clue: "Sweet treat made from cocoa beans" },
            { word: "DIAMOND", clue: "Precious gemstone, hardest natural substance" },
            { word: "ELEPHANT", clue: "Largest land animal with a trunk" },
            { word: "FESTIVAL", clue: "Special celebration or event" },
            { word: "GIRAFFE", clue: "Tall African animal with a long neck" },
            { word: "HARMONY", clue: "Pleasant combination of musical notes" },
            { word: "INVENTION", clue: "Something created for the first time" },
            { word: "JOURNEY", clue: "A long trip or voyage" },
            { word: "KANGAROO", clue: "Australian marsupial that hops" },
            { word: "LIBRARY", clue: "Place where books are kept" },
            { word: "MOUNTAIN", clue: "Very high hill" },
            { word: "NEPTUNE", clue: "Eighth planet from the sun" },
            { word: "ORCHESTRA", clue: "Large group of musicians" },
            { word: "PARADISE", clue: "Perfect place, heaven" },
            { word: "QUARTZ", clue: "Hard mineral used in watches" },
            { word: "RAINBOW", clue: "Colorful arc in the sky after rain" },
            { word: "SCULPTURE", clue: "Art made by shaping materials" },
            { word: "TELESCOPE", clue: "Instrument for viewing distant objects" },
            { word: "UMBRELLA", clue: "Used for protection from rain" },
            { word: "VOLCANO", clue: "Mountain that erupts lava" },
            { word: "WATERFALL", clue: "Water falling from a height" },
            { word: "XYLOPHONE", clue: "Musical instrument with wooden bars" },
            { word: "YELLOW", clue: "Color of sunshine and lemons" }
        ]
    }
};

// ============================================
// GLOBAL SOUND CONTROL INTEGRATION
// Add this at the TOP of every game's script.js
// ============================================

// Get global sound state
let globalSoundEnabled = localStorage.getItem('globalSoundEnabled') !== 'false';

// Also check sessionStorage for real-time updates
const sessionSoundState = sessionStorage.getItem('globalSoundState');
if (sessionSoundState !== null) {
    globalSoundEnabled = sessionSoundState === 'true';
}

// Listen for sound changes from home page
window.addEventListener('globalSoundChange', (e) => {
    globalSoundEnabled = e.detail.enabled;
    console.log('Global sound changed:', globalSoundEnabled);
});

// Check for updates from other tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'globalSoundEnabled') {
        globalSoundEnabled = e.newValue !== 'false';
    }
});

// ============================================
// MODIFY YOUR EXISTING playSound FUNCTION
// ============================================

// Find your existing playSound function and modify it like this:
function playSound(type) {
    // CHECK GLOBAL SOUND FIRST
    if (!globalSoundEnabled) {
        return; // Don't play if globally disabled
    }
    
    // Then check local sound toggle (if you have one)
    if (typeof soundEnabled !== 'undefined' && !soundEnabled) {
        return;
    }
    
    // Your existing sound playing code...
    const sound = sounds[type];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

// Game state
let currentDifficulty = 'easy';
let grid = [];
let placedWords = [];
let selectedCell = null;
let currentDirection = 'across';
let clues = { across: [], down: [] };
let userGrid = [];
let soundEnabled = true; // Sound toggle state

// Audio context for generating sounds
let audioContext = null;

// Sound files - UPDATE THESE PATHS WITH YOUR FILES
const soundFiles = {
    click: '/sounds/click.mp3',      // General click sound
    correct: '/sounds/correct.mp3',  // Correct answer
    wrong: '/sounds/wrong.mp3',      // Wrong answer
    select: '/sounds/select.mp3',    // Cell selection
    win: '/sounds/win.mp3'           // Victory sound
};

// Preload audio files
const sounds = {};
Object.keys(soundFiles).forEach(key => {
    sounds[key] = new Audio(soundFiles[key]);
});


// Initialize audio context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play sound effect using Web Audio API
function playSound(type) {
    if (!soundEnabled) return;
    
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'click':
            // Pleasant click sound
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
            
        case 'correct':
            // Happy ding sound
            oscillator.frequency.value = 1200;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
            // Add second tone for harmony
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 1600;
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.1, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.3);
            }, 50);
            break;
            
        case 'wrong':
            // Error buzz sound
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
            
        case 'win':
            // Victory melody
            playWinSound();
            break;
            
        case 'select':
            // Selection sound
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.08);
            break;
    }
}

// Play win sound - victory melody
function playWinSound() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const duration = 0.15;
    
    notes.forEach((freq, index) => {
        setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + duration);
        }, index * duration * 1000);
    });
}

// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('sound-btn');
    
    if (soundEnabled) {
        soundBtn.textContent = '🔊';
        soundBtn.classList.remove('muted');
        playSound('click');
    } else {
        soundBtn.textContent = '🔇';
        soundBtn.classList.add('muted');
    }
}

// Initialize the game
function startGame(difficulty) {
    currentDifficulty = difficulty;
    document.getElementById('difficulty-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('difficulty-title').textContent = 
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ' Mode';
    
    generatePuzzle();
    renderGrid();
    renderClues();
    playSound('click');
}

function showDifficulty() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('difficulty-screen').classList.remove('hidden');
    document.getElementById('win-message').classList.add('hidden');
    playSound('click');
}

function newGame() {
    document.getElementById('win-message').classList.add('hidden');
    generatePuzzle();
    renderGrid();
    renderClues();
    playSound('click');
}

// Generate crossword puzzle
function generatePuzzle() {
    const data = wordData[currentDifficulty];
    const gridSize = data.gridSize;
    
    // Initialize empty grid
    grid = [];
    userGrid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        userGrid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = null;
            userGrid[i][j] = '';
        }
    }
    
    placedWords = [];
    clues = { across: [], down: [] };
    
    // Shuffle words
    let words = [...data.words];
    shuffleArray(words);
    
    // Place words
    let placedCount = 0;
    const maxWords = Math.min(words.length, gridSize * 2);
    
    for (let wordObj of words) {
        if (placedCount >= maxWords) break;
        
        const word = wordObj.word.toUpperCase();
        const clue = wordObj.clue;
        
        if (placeWord(word, clue)) {
            placedCount++;
        }
    }
    
    // Number the clues
    numberClues();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function placeWord(word, clue) {
    const gridSize = wordData[currentDifficulty].gridSize;
    
    // First word - place in the middle
    if (placedWords.length === 0) {
        const startRow = Math.floor(gridSize / 2);
        const startCol = Math.floor((gridSize - word.length) / 2);
        
        if (startCol >= 0 && startCol + word.length <= gridSize) {
            for (let i = 0; i < word.length; i++) {
                grid[startRow][startCol + i] = word[i];
            }
            placedWords.push({
                word: word,
                clue: clue,
                startRow: startRow,
                startCol: startCol,
                direction: 'across',
                number: 1
            });
            return true;
        }
    }
    
    // Try to place subsequent words
    for (let placed of placedWords) {
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            
            // Find intersections with placed words
            for (let j = 0; j < placed.word.length; j++) {
                if (placed.word[j] === letter) {
                    // Try to place perpendicular
                    const newDirection = placed.direction === 'across' ? 'down' : 'across';
                    
                    let startRow, startCol;
                    if (newDirection === 'across') {
                        startRow = placed.startRow + j;
                        startCol = placed.startCol + j - i;
                    } else {
                        startRow = placed.startRow + j - i;
                        startCol = placed.startCol + j;
                    }
                    
                    if (canPlace(word, startRow, startCol, newDirection)) {
                        // Place the word
                        for (let k = 0; k < word.length; k++) {
                            if (newDirection === 'across') {
                                grid[startRow][startCol + k] = word[k];
                            } else {
                                grid[startRow + k][startCol] = word[k];
                            }
                        }
                        
                        placedWords.push({
                            word: word,
                            clue: clue,
                            startRow: startRow,
                            startCol: startCol,
                            direction: newDirection,
                            number: 0
                        });
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

function canPlace(word, startRow, startCol, direction) {
    const gridSize = wordData[currentDifficulty].gridSize;
    
    // Check bounds
    if (direction === 'across') {
        if (startCol < 0 || startCol + word.length > gridSize) return false;
    } else {
        if (startRow < 0 || startRow + word.length > gridSize) return false;
    }
    
    // Check for conflicts
    for (let i = 0; i < word.length; i++) {
        let row, col;
        if (direction === 'across') {
            row = startRow;
            col = startCol + i;
        } else {
            row = startRow + i;
            col = startCol;
        }
        
        // Check if cell is occupied by different letter
        if (grid[row][col] !== null && grid[row][col] !== word[i]) {
            return false;
        }
        
        // Check adjacent cells (to prevent words touching)
        if (grid[row][col] === null) {
            if (direction === 'across') {
                if ((row > 0 && grid[row - 1][col] !== null) || 
                    (row < gridSize - 1 && grid[row + 1][col] !== null)) {
                    return false;
                }
            } else {
                if ((col > 0 && grid[row][col - 1] !== null) || 
                    (col < gridSize - 1 && grid[row][col + 1] !== null)) {
                    return false;
                }
            }
        }
    }
    
    // Check ends
    if (direction === 'across') {
        if (startCol > 0 && grid[startRow][startCol - 1] !== null) return false;
        if (startCol + word.length < gridSize && grid[startRow][startCol + word.length] !== null) return false;
    } else {
        if (startRow > 0 && grid[startRow - 1][startCol] !== null) return false;
        if (startRow + word.length < gridSize && grid[startRow + word.length][startCol] !== null) return false;
    }
    
    return true;
}

function numberClues() {
    // Sort placed words by position
    placedWords.sort((a, b) => {
        if (a.startRow !== b.startRow) return a.startRow - b.startRow;
        return a.startCol - b.startCol;
    });
    
    let number = 1;
    for (let word of placedWords) {
        word.number = number++;
        
        if (word.direction === 'across') {
            clues.across.push(word);
        } else {
            clues.down.push(word);
        }
    }
}

// Render the grid
function renderGrid() {
    const gridSize = wordData[currentDifficulty].gridSize;
    const gridElement = document.getElementById('crossword-grid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            if (grid[i][j] === null) {
                cell.classList.add('black');
            } else {
                cell.textContent = '';
                cell.onclick = () => selectCell(i, j);
                
                // Add number if this is the start of a word
                const wordStart = placedWords.find(w => w.startRow === i && w.startCol === j);
                if (wordStart) {
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'cell-number';
                    numberSpan.textContent = wordStart.number;
                    cell.appendChild(numberSpan);
                }
            }
            
            gridElement.appendChild(cell);
        }
    }
}

function selectCell(row, col) {
    // Clear previous selection
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('selected', 'highlighted');
    });
    document.querySelectorAll('.clues-section li').forEach(c => {
        c.classList.remove('active');
    });
    
    selectedCell = { row, col };
    const cell = getCellElement(row, col);
    cell.classList.add('selected');
    
    // Highlight the word
    highlightWord(row, col);
    
    // Focus on game for keyboard input
    cell.focus();
    
    // Play select sound
    playSound('select');
}

function highlightWord(row, col) {
    const word = findWordAt(row, col);
    if (!word) return;
    
    currentDirection = word.direction;
    
    // Highlight cells
    for (let i = 0; i < word.word.length; i++) {
        let r, c;
        if (word.direction === 'across') {
            r = word.startRow;
            c = word.startCol + i;
        } else {
            r = word.startRow + i;
            c = word.startCol;
        }
        getCellElement(r, c).classList.add('highlighted');
    }
    
    // Highlight clue
    const clueList = word.direction === 'across' ? 'across-clues' : 'down-clues';
    const clueItems = document.getElementById(clueList).querySelectorAll('li');
    clueItems.forEach(item => {
        if (parseInt(item.dataset.number) === word.number) {
            item.classList.add('active');
        }
    });
}

function findWordAt(row, col) {
    for (let word of placedWords) {
        if (word.direction === 'across') {
            if (row === word.startRow && col >= word.startCol && col < word.startCol + word.word.length) {
                return word;
            }
        } else {
            if (col === word.startCol && row >= word.startRow && row < word.startRow + word.word.length) {
                return word;
            }
        }
    }
    return null;
}

function getCellElement(row, col) {
    return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

// Render clues
function renderClues() {
    const acrossList = document.getElementById('across-clues');
    const downList = document.getElementById('down-clues');
    acrossList.innerHTML = '';
    downList.innerHTML = '';
    
    clues.across.forEach(word => {
        const li = document.createElement('li');
        li.textContent = `${word.number}. ${word.clue}`;
        li.dataset.number = word.number;
        li.dataset.direction = 'across';
        li.onclick = () => {
            highlightClue(word);
            playSound('select');
        };
        acrossList.appendChild(li);
    });
    
    clues.down.forEach(word => {
        const li = document.createElement('li');
        li.textContent = `${word.number}. ${word.clue}`;
        li.dataset.number = word.number;
        li.dataset.direction = 'down';
        li.onclick = () => {
            highlightClue(word);
            playSound('select');
        };
        downList.appendChild(li);
    });
}

function highlightClue(word) {
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('selected', 'highlighted');
    });
    
    // Highlight cells
    for (let i = 0; i < word.word.length; i++) {
        let r, c;
        if (word.direction === 'across') {
            r = word.startRow;
            c = word.startCol + i;
        } else {
            r = word.startRow + i;
            c = word.startCol;
        }
        const cell = getCellElement(r, c);
        cell.classList.add('highlighted');
        if (i === 0) cell.classList.add('selected');
    }
    
    selectedCell = { row: word.startRow, col: word.startCol };
    currentDirection = word.direction;
}


// Handle keyboard input - FIXED
document.addEventListener('keydown', (e) => {
    if (!selectedCell || document.getElementById('game-screen').classList.contains('hidden')) return;
    
    const cell = getCellElement(selectedCell.row, selectedCell.col);
    if (cell.classList.contains('black')) return;
    
    // Handle letter input
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        cell.textContent = e.key.toUpperCase();
        userGrid[selectedCell.row][selectedCell.col] = e.key.toUpperCase();
        cell.classList.remove('correct', 'wrong');
        
        // Check if correct
        if (grid[selectedCell.row][selectedCell.col] === e.key.toUpperCase()) {
            cell.classList.add('correct');
            playSound('correct');
        } else {
            cell.classList.add('wrong');
            playSound('wrong');
        }
        
        // Move to next cell
        moveToNextCell();
        
        // Check win
        checkWin();
    }
    
    // Handle backspace
    if (e.key === 'Backspace') {
        cell.textContent = '';
        userGrid[selectedCell.row][selectedCell.col] = '';
        cell.classList.remove('correct', 'wrong');
        playSound('click');
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowRight') {
        moveSelection(0, 1);
    }
    if (e.key === 'ArrowLeft') {
        moveSelection(0, -1);
    }
    if (e.key === 'ArrowDown') {
        moveSelection(1, 0);
    }
    if (e.key === 'ArrowUp') {
        moveSelection(-1, 0);
    }
});


// Add this function for mobile keyboard
function showMobileKeyboard() {
    // Create a hidden input to trigger mobile keyboard
    let hiddenInput = document.getElementById('mobile-keyboard-input');
    
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'text';
        hiddenInput.id = 'mobile-keyboard-input';
        hiddenInput.style.position = 'fixed';
        hiddenInput.style.top = '-1000px';
        hiddenInput.style.opacity = '0';
        hiddenInput.maxLength = 1;
        hiddenInput.autocomplete = 'off';
        hiddenInput.autocorrect = 'off';
        hiddenInput.autocapitalize = 'characters';
        hiddenInput.inputMode = 'text';
        document.body.appendChild(hiddenInput);
        
        hiddenInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && selectedCell) {
                const cell = getCellElement(selectedCell.row, selectedCell.col);
                if (!cell.classList.contains('black')) {
                    cell.textContent = value.toUpperCase();
                    userGrid[selectedCell.row][selectedCell.col] = value.toUpperCase();
                    cell.classList.remove('correct', 'wrong');
                    
                    // Check if correct
                    if (grid[selectedCell.row][selectedCell.col] === value.toUpperCase()) {
                        cell.classList.add('correct');
                        playSound('correct');
                    } else {
                        cell.classList.add('wrong');
                        playSound('wrong');
                    }
                    
                    moveToNextCell();
                    checkWin();
                }
            }
            e.target.value = '';
        });
    }
    
    hiddenInput.focus();
    hiddenInput.click();
}

// Update selectCell to trigger mobile keyboard
function selectCell(row, col) {
    // Clear previous selection
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('selected', 'highlighted');
    });
    document.querySelectorAll('.clues-section li').forEach(c => {
        c.classList.remove('active');
    });
    
    selectedCell = { row, col };
    const cell = getCellElement(row, col);
    cell.classList.add('selected');
    
    // Highlight the word
    highlightWord(row, col);
    
    // Show mobile keyboard on tap
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        showMobileKeyboard();
    }
    
    // Play select sound
    playSound('select');
}


function moveToNextCell() {
    if (!selectedCell) return;
    
    let { row, col } = selectedCell;
    
    if (currentDirection === 'across') {
        col++;
    } else {
        row++;
    }
    
    const gridSize = wordData[currentDifficulty].gridSize;
    if (row < gridSize && col < gridSize) {
        const nextCell = getCellElement(row, col);
        if (nextCell && !nextCell.classList.contains('black')) {
            selectCell(row, col);
        }
    }
}

function moveSelection(rowDelta, colDelta) {
    if (!selectedCell) return;
    
    const gridSize = wordData[currentDifficulty].gridSize;
    let { row, col } = selectedCell;
    
    row += rowDelta;
    col += colDelta;
    
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        const cell = getCellElement(row, col);
        if (cell && !cell.classList.contains('black')) {
            selectCell(row, col);
        }
    }
}

// Check win condition
function checkWin() {
    const gridSize = wordData[currentDifficulty].gridSize;
    let allCorrect = true;
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] !== null) {
                const cell = getCellElement(i, j);
                if (cell.textContent !== grid[i][j]) {
                    allCorrect = false;
                    break;
                }
            }
        }
    }
    
    if (allCorrect) {
        document.getElementById('win-message').classList.remove('hidden');
        playSound('win');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Crossword Game Ready!');
});