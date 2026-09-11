let msgContainer = document.querySelector(".msg-container2");
let sudokumsg = document.querySelector("#msg");

var numSelected = null; // number variable
var tileSelected = null; // tile variable
var errors = 0; // error variable

// Global state variables for dynamic generation
var board = [];     // Dynamic puzzle board strings
var solution = [];  // Dynamic solution strings
var currentDifficulty = "easy"; // Tracking active level

window.onload = function () {
    // Generate an initial default easy game layout on load
    startNewGame("easy");
};

// --- CORE GENERATOR & SOLVER ENGINE ---

// Generates an entire randomized board, solves it, and masks it by difficulty
function startNewGame(difficulty) {
    currentDifficulty = difficulty;
    errors = 0;
    
    // Safety check for UI elements
    const errorEl = document.getElementById("errors");
    if (errorEl) errorEl.innerText = errors;

    // 1. Create a blank 9x9 matrix filled with '.'
    let rawBoard = Array(9).fill(null).map(() => Array(9).fill('.'));

    // 2. Randomly seed the first row to ensure a unique puzzle every reset
    let firstRowVals = ['1','2','3','4','5','6','7','8','9'].sort(() => Math.random() - 0.5);
    for(let c = 0; c < 9; c++) {
        rawBoard[0][c] = firstRowVals[c];
    }

    // 3. Solve the matrix completely to get our unique target solutions
    solveSudokuEngine(rawBoard);

    // 4. Save a deep copy as the master solution mapping array
    solution = rawBoard.map(row => row.join(""));

    // 5. Mask numbers out based on user difficulty
    // Easy mode leaves ~43 clues; Hard mode drops to ~26 clues
    let cluesToKeep = (difficulty === "hard") ? 26 : 43;
    let cellsToRemove = 81 - cluesToKeep;

    let puzzleMatrix = rawBoard.map(row => [...row]);
    while (cellsToRemove > 0) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (puzzleMatrix[r][c] !== '.') {
            puzzleMatrix[r][c] = '-';
            cellsToRemove--;
        }
    }

    // 6. Convert matrix array structures into strings to match your existing game loop
    board = puzzleMatrix.map(row => row.join(""));

    // 7. Refresh DOM interfaces
    setGame();
}

// Backtracking solver engine (Ported from your Java helper method)
function solveSudokuEngine(grid) {
    return helper(grid, 0, 0);
}

function helper(grid, row, col) {
    if (row === 9) return true;

    let nrow = (col === 8) ? row + 1 : row;
    let ncol = (col === 8) ? 0 : col + 1;

    if (grid[row][col] !== '.') {
        return helper(grid, nrow, ncol);
    } else {
        // Shuffle numbers 1-9 during generation to avoid repetitive structures
        let candidates = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 9; i++) {
            let num = candidates[i];
            if (isSafe(grid, row, col, num)) {
                grid[row][col] = num.toString();
                if (helper(grid, nrow, ncol)) {
                    return true;
                } else {
                    grid[row][col] = '.';
                }
            }
        }
    }
    return false;
}

function isSafe(grid, row, col, number) {
    let charNum = number.toString();
    for (let i = 0; i < 9; i++) {
        if (grid[i][col] === charNum || grid[row][i] === charNum) {
            return false;
        }
    }
    let sr = Math.floor(row / 3) * 3;
    let sc = Math.floor(col / 3) * 3;
    for (let i = sr; i < sr + 3; i++) {
        for (let j = sc; j < sc + 3; j++) {
            if (grid[i][j] === charNum) {
                return false;
            }
        }
    }
    return true;
}

// --- RENDERING & GAME INTERACTIONS ---

function setGame() {
    // Clear out old elements from prior sessions to avoid duplicate injection stacking
    document.getElementById("digits").innerHTML = "";
    document.getElementById("board").innerHTML = "";
    numSelected = null;

    // Render Digits Selector (1-9)
    for (let i = 1; i <= 9; i++) {
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.classList.add("number");
        number.addEventListener("click", selectNumber);
        document.getElementById("digits").appendChild(number);
    }

    // Render 9x9 Board Layout Grid
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            
            if (board[r][c] !== "-") {
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            }

            if (r == 2 || r == 5) {
                tile.classList.add("horizontal-line");
            }

            if (c == 2 || c == 5) {
                tile.classList.add("vertical-line");
            }
            
            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("board").append(tile);
        }
    }
}

function selectNumber() {
    if (numSelected != null) {
        numSelected.classList.remove("number-selected");
    }
    numSelected = this;
    numSelected.classList.add("number-selected");
}

function selectTile() {
    if (numSelected) {
        if (this.innerText != "") {
            return;
        }

        let coords = this.id.split("-");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if (solution[r][c] == numSelected.id) {
            this.innerText = numSelected.id;

            if (checkSudokuComplete()) {
                showWinner();
            }
        } else {
            errors += 1;
            document.getElementById("errors").innerText = errors;
        }
    }
}

function checkSudokuComplete() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.getElementById(`${r}-${c}`);
            if (tile.innerText !== solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}

function showWinner() {
    sudokumsg.innerText = "Congratulations! You solved the Sudoku!";
    msgContainer.classList.remove("hide");
    setTimeout(() => {
        msgContainer.classList.add("hide");
    }, 3000);
}