var board = [
    "#########################",
    "#                       #",
    "#                       #",
    "#     ####              #",
    "#                       #",
    "#                       #",
    "#                       #",
    "#                       #",
    "#                       #",
    "#                       #",
    "#                       #",
    "#########################"
];


// ============================================
// SNAKE GAME SOUND SYSTEM
// ============================================

let snakeSoundEnabled = true;

// Sound files - UPDATE THESE PATHS WITH YOUR FILES
const snakeSoundFiles = {
    eat: 'sounds/eat.mp3',        // Eating food
    crash: 'sounds/crash.mp3',    // Game over
    levelup: 'sounds/levelup.mp3' // Level up
};

// Preload audio files
const snakeSounds = {};
Object.keys(snakeSoundFiles).forEach(key => {
    snakeSounds[key] = new Audio(snakeSoundFiles[key]);
});

// Play snake game sound
function playSnakeSound(type) {
    if (!snakeSoundEnabled) {
        return;
    }
    
    const sound = snakeSounds[type];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

// Toggle sound on/off
function toggleSnakeSound() {
    snakeSoundEnabled = !snakeSoundEnabled;
    const btn = document.getElementById('snake-sound-btn');
    
    if (snakeSoundEnabled) {
        btn.textContent = '🔊';
        btn.classList.remove('muted');
        playSnakeSound('eat');
    } else {
        btn.textContent = '🔇';
        btn.classList.add('muted');
    }
}

// ============================================
// SNAKE GAME CODE
// ============================================



function getInitialSnake() {
    return { 
        parts: [ 
            {x: 4, y: 2}, 
            {x: 3, y: 2}, 
            {x: 2, y: 2} 
        ],
        direction: "right"
    };
}

var snake = getInitialSnake();
var food = { x: 10, y: 5 };

var gameLoop = null;
var isPlaying = false;
var score = 0; 
var currentLevel = 1;
var scoreToNextLevel = 50;
var baseSpeed = 300;

var foodTimerInterval = null;
var foodTimeLeft = 5;

var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
var scoreDisplay = document.getElementById("currentScore"); 
var levelDisplay = document.getElementById("currentLevel");
var timerDisplay = document.getElementById("foodTimer");

var graphics = { 
    canvas: document.getElementById("gameCanvas"), 
    squareSize: 18, 
 
    initCanvasSize: function() {
        this.canvas.width = 25 * this.squareSize;
        this.canvas.height = 12 * this.squareSize;
    },

    drawBoard: function(ctx) { 
        var y = 0; 
        board.forEach(function(line) { 
            var x = 0; 
            line.split("").forEach(function(ch) { 
                if (ch === "#") { 
                    ctx.fillStyle = "#1e293b"; 
                    ctx.fillRect(x, y, graphics.squareSize, graphics.squareSize);
                    ctx.strokeStyle = "#334155";
                    ctx.strokeRect(x, y, graphics.squareSize, graphics.squareSize);
                }
                x += graphics.squareSize; 
            });
            y += graphics.squareSize; 
        });
    },

    drawSnake: function(ctx) { 
        snake.parts.forEach(function(part, index) { 
            ctx.fillStyle = (index === 0) ? "#10b981" : "#059669"; 
            var pad = 2;
            ctx.fillRect(
                part.x * graphics.squareSize + pad, 
                part.y * graphics.squareSize + pad, 
                graphics.squareSize - (pad * 2), 
                graphics.squareSize - (pad * 2)
            );
        });
    },

    drawFood: function(ctx) { 
        ctx.fillStyle = "#f43f5e"; 
        var pad = 4;
        ctx.fillRect(
            food.x * graphics.squareSize + pad, 
            food.y * graphics.squareSize + pad, 
            graphics.squareSize - (pad * 2), 
            graphics.squareSize - (pad * 2)
        );
    },  

    drawGame: function() { 
        var ctx = this.canvas.getContext("2d"); 
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); 
        this.drawBoard(ctx); 
        this.drawSnake(ctx); 
        this.drawFood(ctx); 
    }
};

function moveSnake() { 
    // FIXED: Properly reading index [0] to extract the snake's head coordinates
    var head = { 
        x: snake.parts[0].x, 
        y: snake.parts[0].y  
    };
    
    switch (snake.direction) { 
        case "up":    head.y--; break; 
        case "down":  head.y++; break; 
        case "left":  head.x--; break; 
        case "right": head.x++; break; 
    }

    // FIXED: Use actual board dimensions
    var maxCols = board[0].length;
    var maxRows = board.length;
    
    if (head.x < 1 || head.x >= maxCols - 1 || head.y < 1 || head.y >= maxRows - 1) {  
        handleGameOver("Game Over: You hit the border!");
        return;
    }

    if (board[head.y] && board[head.y][head.x] === "#") {
        handleGameOver("Game Over: You hit an inner wall obstacle!");
        return;
    }

    for (var i = 1; i < snake.parts.length; i++) { 
        if (head.x === snake.parts[i].x && head.y === snake.parts[i].y) {  
            handleGameOver("Game Over: You crashed into yourself!");
            return;
        }
    }

    snake.parts.unshift(head); 

    if (head.x === food.x && head.y === food.y) { 
        score += 10; 
        scoreDisplay.innerText = score; 
        playSnakeSound('eat');  // 🔊 EAT SOUND
        checkLevelUp();
        placeFood(); 
    } else {
        snake.parts.pop(); 
    }
}

document.addEventListener("keydown", function (e) {

    switch (e.key) {
        case "ArrowUp":
            if (snake.direction !== "down")
                snake.direction = "up";
            break;

        case "ArrowDown":
            if (snake.direction !== "up")
                snake.direction = "down";
            break;

        case "ArrowLeft":
            if (snake.direction !== "right")
                snake.direction = "left";
            break;

        case "ArrowRight":
            if (snake.direction !== "left")
                snake.direction = "right";
            break;
    }

});

function changeDirection(dir) {

    if (dir === "up" && snake.direction !== "down")
        snake.direction = "up";

    if (dir === "down" && snake.direction !== "up")
        snake.direction = "down";

    if (dir === "left" && snake.direction !== "right")
        snake.direction = "left";

    if (dir === "right" && snake.direction !== "left")
        snake.direction = "right";
}

function placeFood() {
    var validPosition = false;
    while (!validPosition) {
        var newX = Math.floor(Math.random() * 13) + 1;
        var newY = Math.floor(Math.random() * 7) + 1;
        
        if (board[newY] && board[newY][newX] === "#") continue;
        
        var hitSnake = false;
        for (var i = 0; i < snake.parts.length; i++) {
            if (snake.parts[i].x === newX && snake.parts[i].y === newY) {
                hitSnake = true;
                break;
            }
        }
        if (hitSnake) continue;
        
        food.x = newX;
        food.y = newY;
        validPosition = true;
    }
    startFoodTimer();
}

function startFoodTimer() {
    clearInterval(foodTimerInterval);
    foodTimeLeft = 5;
    timerDisplay.innerText = foodTimeLeft;

    foodTimerInterval = setInterval(function() {
        foodTimeLeft--;
        timerDisplay.innerText = foodTimeLeft;

        if (foodTimeLeft <= 0) {
            placeFood();
            graphics.drawGame();
        }
    }, 1000);
}

function stopFoodTimer() {
    clearInterval(foodTimerInterval);
    foodTimerInterval = null;
}

function checkLevelUp() {
    if (score >= scoreToNextLevel) {
        playSnakeSound('levelup');  // 🔊 LEVEL UP SOUND
        currentLevel++;
        scoreToNextLevel += 50;
        levelDisplay.innerText = currentLevel;
        
        stopGame();
        
        setTimeout(function() {
            alert("Level Up! Welcome to Level " + currentLevel + ".\nClick RESUME to start the next level!");
            startBtn.innerText = "RESUME LEVEL " + currentLevel;
        }, 10);
    }
}

function handleGameOver(message) {
    playSnakeSound('crash');  // 🔊 CRASH SOUND
    stopGame(); 
    alert(message + " Final Score: " + score);
    
    snake = getInitialSnake();
    food = { x: 10, y: 5 };
    
    score = 0;
    currentLevel = 1;
    scoreToNextLevel = 50;
    foodTimeLeft = 5;
    
    scoreDisplay.innerText = score;
    levelDisplay.innerText = currentLevel;
    timerDisplay.innerText = foodTimeLeft;
    
    startBtn.innerText = "START";
    graphics.drawGame(); 
}

function startGame() {
    if (isPlaying) return;

    isPlaying = true;

    startBtn.disabled = true;
    stopBtn.disabled = false;
    startBtn.innerText = "RUNNING";

    // gameLoop = setInterval(function () {
    //     moveSnake();
    //     graphics.drawGame();
    // }, baseSpeed - ((currentLevel - 1) * 20));
    var speed = Math.max(120, baseSpeed - ((currentLevel - 1) * 30));

gameLoop = setInterval(function () {
    moveSnake();
    graphics.drawGame();
}, speed);
    startFoodTimer();
}

function stopGame() {
    clearInterval(gameLoop);
    gameLoop = null;

    stopFoodTimer();

    isPlaying = false;

    startBtn.disabled = false;
    stopBtn.disabled = true;
}

startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", stopGame);

// Initialize canvas
graphics.initCanvasSize();
graphics.drawGame();