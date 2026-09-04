// Initialize chess.js
const game = new Chess();

let selectedSquare = null;
let selectedRow = null;
let selectedCol = null;
let legalMoves = [];

// ============================================
// CHESS SOUND CONTROL
// ============================================

let soundEnabled = true;

const sounds = {
    move: new Audio("sounds/move.mp3"),
    capture: new Audio("sounds/capture.mp3"),
    check: new Audio("sounds/check.mp3"),
    checkmate: new Audio("sounds/checkmate.mp3")
};

function playChessSound(sound) {
    if (!soundEnabled) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
}

document.addEventListener("DOMContentLoaded", function () {
    // Render the initial board configuration safely on load
    renderBoardUI();
});

// --- Game Status & Control Banner Initialization ---
let panel = document.getElementById("game-scoreboard-panel");
if (!panel) {
    panel = document.createElement("div");
    panel.id = "game-scoreboard-panel";
    document.body.appendChild(panel);
}

// --- Game Status Banner Initialization ---
let status = document.getElementById("game-status");
if (!status) {
    status = document.createElement("div");
    status.id = "game-status";
    panel.appendChild(status);
}

// Sound button
const soundBtn = document.createElement("button");

soundBtn.id = "chess-sound-btn";
soundBtn.innerText = "🔊 Sound ON";

soundBtn.style.display = "block";
soundBtn.style.margin = "6px auto";
soundBtn.style.padding = "8px 16px";
soundBtn.style.fontSize = "14px";
soundBtn.style.fontWeight = "bold";
soundBtn.style.cursor = "pointer";
soundBtn.style.border = "none";
soundBtn.style.borderRadius = "4px";
soundBtn.style.backgroundColor = "#4e5cd8";
soundBtn.style.color = "white";

soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    if (soundEnabled) {
        soundBtn.innerText = "🔊 Sound ON";
    } else {
        soundBtn.innerText = "🔇 Sound OFF";
    }

});

panel.appendChild(soundBtn);


// Reset Button Initialization pinned cleanly inside our scoreboard panel
let resetBtn = document.getElementById("reset-button");
if (!resetBtn) {
    resetBtn = document.createElement("button");
    resetBtn.id = "reset-button";
    resetBtn.innerText = "Reset Match";
    
    resetBtn.style.display = "block";
    resetBtn.style.margin = "4px auto";
    resetBtn.style.padding = "8px 16px";
    resetBtn.style.fontSize = "14px";
    resetBtn.style.fontWeight = "bold";
    resetBtn.style.cursor = "pointer";
    resetBtn.style.backgroundColor = "#4e5cd8"; 
    resetBtn.style.color = "white";
    resetBtn.style.border = "none";
    resetBtn.style.borderRadius = "4px";
    
    resetBtn.addEventListener("click", resetGame);
    panel.appendChild(resetBtn); // Injects button right underneath text status
}

function clearSelection() {
    selectedSquare = null;
    selectedRow = null;
    selectedCol = null;
    legalMoves = [];
}


// Primary Render Engine: Reads live layout states directly from chess.js
function renderBoardUI() {
    // Clear out any old existing board elements if present
    const existingBoard = document.getElementById("chess-board-container");
    if (existingBoard) existingBoard.remove();

    // FIXED: Swapped hardcoded px heights for a responsive max-width layout structure
    const board = document.createElement("div");
    board.id = "chess-board-container";
    board.style.width = "80vw";             // Board scales up to fill 90% of available mobile viewport width
    board.style.height = "80vw";            // Forces perfect 1:1 square aspect ratio box scaling
    board.style.maxWidth = "480px";         // Caps desktop size so it won't stretch awkwardly huge
    board.style.maxHeight = "480px";        // Caps desktop height constraint aspect ratio
    board.style.boxSizing = "border-box";
    board.style.display = "grid";
    board.style.gridTemplateColumns = "repeat(8, 1fr)"; // Automatically sizes cells to 12.5% width
    board.style.gridTemplateRows = "repeat(8, 1fr)";    // Automatically sizes cells to 12.5% height
    board.style.margin = "10px auto";       // Centers the board horizontally cleanly on small screens

    // Ensure page container flows sequentially instead of forcing absolute screen centering
    document.body.style.display = "flex";
    document.body.style.flexDirection = "column"; // Stacks status banner, captured areas, and board vertically
    document.body.style.alignItems = "center";
    document.body.style.minHeight = "100vh";
    document.body.style.margin = "0";
    document.body.style.padding = "10px";
    document.body.style.boxSizing = "border-box";

    // Grab the exact 8x8 virtual piece representation array from chess.js
    const liveMatrix = game.board();

    // Map unique internal keys to match asset files
    const typeMap = { 'p': 'pawn', 'r': 'rook', 'n': 'knight', 'b': 'bishop', 'q': 'queen', 'k': 'king' };

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement("div");
            square.dataset.row = row;
            square.dataset.col = col;
            
            // FIXED: Removed absolute "60px" dimensions. Grid fractions handling sizing now.
            square.style.width = "100%";
            square.style.height = "100%";
            square.style.boxSizing = "border-box";

            const squareName = toChessSquare(row, col);
            const canMoveHere = legalMoves.some(move => move.to === squareName);

            if (canMoveHere) {
                // FIXED: Changed inset thickness slightly to adapt to narrow screens elegantly
                square.style.boxShadow = "inset 0 0 0 3px gold";
            }
            
            // Generate checkered square colors
            if ((row + col) % 2 === 0) {
                square.style.backgroundColor = "#eeeed2";
            } else {
                square.style.backgroundColor = "#4e5cd8";
            }

            // Restore red border highlight if square matches active selection
            if (selectedRow === row && selectedCol === col) {
                square.style.outline = "3px solid red";
                square.style.outlineOffset = "-3px"; // Forces outline inside the box boundaries
            }

            // Read live piece data at index
            const pieceData = liveMatrix[row][col];

            if (pieceData) {
                const colorWord = pieceData.color === 'w' ? 'white' : 'black';
                const typeWord = typeMap[pieceData.type];
                
                const img = document.createElement("img");
                img.src = `Chess/images/${colorWord}-${typeWord}.png`;
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.display = "block";
                img.draggable = false;
                square.appendChild(img);
            }

            // Click interaction listener
            square.addEventListener("click", function() {
                const activePiece = game.board()[row][col];

                // First selection click execution
                if (selectedSquare === null) {
                    if (!activePiece) return;
                    
                    // Human player restriction lock: Block selection of Black pieces
                    if (activePiece.color === 'b') return;

                    selectedSquare = square;
                    selectedRow = row;
                    selectedCol = col;
                    
                    const from = toChessSquare(row, col);

                    legalMoves = game.moves({
                        square: from,
                        verbose: true
                    });

                    renderBoardUI(); // Refresh UI to apply the outline highlight
                } 
                else {
                    const fromSquare = toChessSquare(selectedRow, selectedCol);
                    const toSquare = toChessSquare(row, col);

                    // Execute human move validation check
                    const move = game.move({ from: fromSquare, to: toSquare, promotion: "q" });

                    // Handle move failures securely
                    if (move === null) {
                        clearSelection();
                        renderBoardUI();
                        return;
                    }
                    
                    // Play sound
                    if (move.captured) {
                       playChessSound(sounds.capture);
                    } else {
                       playChessSound(sounds.move);
                    }

                    // Capture logic: check what color made the move
                    if (move.captured) {
                        if (move.color === "w") {
                            // White captured a black piece
                            capturedBlack.push(move.captured);
                        } else {
                            // Black captured a white piece
                            capturedWhite.push(move.captured);
                        }
                    }

                    // Complete human move sequence, clear state flags
                    clearSelection();

                    // Re-render UI and immediately refresh captured piece displays
                    renderBoardUI();
                    checkGameStatus();
                    updateCapturedPieces();

                    // Fire computer turn if game loop remains active
                    if (!game.game_over()) {
                        setTimeout(makeComputerMove, 300);
                    }
                }
            }); // End click listener

            board.appendChild(square);
        }
    } // End loops

    // Insert board layout into the main document body context
    // Locating placement index to slot nicely right beneath the tracking banners
    document.body.appendChild(board);
    checkGameStatus();
} // End renderBoardUI

let capturedWhite = [];
let capturedBlack = [];

// --- FIXED: Unified Captured Pieces Function ---
function updateCapturedPieces() {
    const symbols = {
        w: { p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔" },
        b: { p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" }
    };

    let panel = document.getElementById("game-scoreboard-panel");

    // Initialize tracking rows inside our structural info panel
    let blackArea = document.getElementById("black-captured");
    if (!blackArea) {
        blackArea = document.createElement("div");
        blackArea.id = "black-captured";
        panel.appendChild(blackArea); // FIXED: Sits right alongside the white area
    }

    let whiteArea = document.getElementById("white-captured");
    if (!whiteArea) {
        whiteArea = document.createElement("div");
        whiteArea.id = "white-captured";
        panel.appendChild(whiteArea); // FIXED: Sits right alongside the black area
    }

    // Render using proper text assignments group side-by-side
    blackArea.innerHTML = "<b>Black Pieces Captured:</b> " + capturedBlack.map(p => symbols.b[p]).join(" ");
    whiteArea.innerHTML = "<b>White Pieces Captured:</b> " + capturedWhite.map(p => symbols.w[p]).join(" ");
}

function checkGameStatus() {
    const status = document.getElementById("game-status");

    if (game.in_checkmate()) {
        const winner = game.turn() === "w" ? "Black" : "White";
        status.innerHTML = "♔ Checkmate! " + winner + " wins!";
    }
    else if (game.in_stalemate()) {
        status.innerHTML = "Draw by Stalemate";
    }
    else if (game.in_draw()) {
        status.innerHTML = "Draw";
    }
    else if (game.in_check()) {
        const player = game.turn() === "w" ? "White" : "Black";
        status.innerHTML = player + " is in Check!";
    }
    else {
        const player = game.turn() === "w" ? "White" : "Black";
        status.innerHTML = player + "'s Turn";
    }
}

// Map matrix indexing pairs back into classic alphanumeric algebraic values
function toChessSquare(row, col) {
    const files = "abcdefgh";
    return files[col] + (8 - row);
}

// AI Engine Turn Move Generation (Smart Minimax Edition)
function makeComputerMove() {
    const depth = 3; // Looks 3 moves ahead (higher numbers make it stronger but slower)
    const bestMove = getBestMove(game, depth);

    if (!bestMove) return;

    // Execute the calculated best move
    const move = game.move(bestMove);
    if (move) {
    if (move.captured) {
        playChessSound(sounds.capture);
    } else {
        playChessSound(sounds.move);
    }
    }
    
    if (move && move.captured) {
        if (move.color === "w") {
            capturedBlack.push(move.captured);
        } else {
            capturedWhite.push(move.captured);
        }
    }

    renderBoardUI();
    checkGameStatus();
    updateCapturedPieces();
}

// Looks at all legal moves and uses minimax to find the absolute best one
function getBestMove(game, depth) {
    const legalMoves = game.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    let bestMove = null;
    // Since the computer plays Black ('b'), it wants the lowest evaluation score possible
    let bestValue = Infinity; 

    // Sort moves roughly: captures first to improve alpha-beta efficiency
    legalMoves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

    for (let i = 0; i < legalMoves.length; i++) {
        const move = legalMoves[i];
        game.move(move);
        
        // Evaluate the outcome of this move down the tree
        const boardValue = minimax(game, depth - 1, -Infinity, Infinity, true);
        game.undo();

        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
    return bestMove;
}

// Core Minimax algorithm with Alpha-Beta pruning
function minimax(game, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || game.game_over()) {
        return evaluateBoard(game.board());
    }

    const legalMoves = game.moves({ verbose: true });

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let i = 0; i < legalMoves.length; i++) {
            game.move(legalMoves[i]);
            let evaluation = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, alpha);
            if (beta <= alpha) break; // Prune branch
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < legalMoves.length; i++) {
            game.move(legalMoves[i]);
            let evaluation = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break; // Prune branch
        }
        return minEval;
    }
}

// Basic evaluation function: Assigns points to pieces
// White wants a high positive score; Black wants a low negative score
function evaluateBoard(board) {
    const pieceValues = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 9000 };
    let totalEvaluation = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                const value = pieceValues[piece.type];
                // Add value if White, subtract if Black
                totalEvaluation += (piece.color === 'w') ? value : -value;
            }
        }
    }
    return totalEvaluation;
}

// Reset the entire game state back to move 1
function resetGame() {
    game.reset();              // Resets internal chess.js state
    clearSelection();          // Clears active user clicks/highlights
    capturedWhite = [];        // Clears white's captured pile
    capturedBlack = [];        // Clears black's captured pile
    
    renderBoardUI();           // Redraws starting board positions
    checkGameStatus();         // Updates the turn status banner
    updateCapturedPieces();    // Clears the captured pieces displays
}
