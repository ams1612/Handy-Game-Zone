const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");
 
// Detect mobile once, use everywhere to skip expensive effects
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
 
// Game Mechanics Parameters
let playerScore = 0;
let aiScore = 0;
let currentPongDiff = 'easy';
let isBallPlaying = false;
 
let ballTrail = [];
const maxTrailLength = 12;
 
let playerHitFlash = 0;
let aiHitFlash = 0;
 
// ============================================
// TT / PONG SOUND CONTROL (Web Audio API)
// ============================================
 
let soundEnabled = true;
 
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const soundBuffers = {};
 
async function loadSound(name, url) {
    try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        soundBuffers[name] = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (err) {
        console.warn(`Failed to load sound "${name}":`, err);
    }
}
 
function playGameSound(name) {
    if (!soundEnabled || !soundBuffers[name]) return;
 
    // iOS/Safari suspends AudioContext until a user gesture resumes it
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
 
    const source = audioCtx.createBufferSource();
    source.buffer = soundBuffers[name];
    source.connect(audioCtx.destination);
    source.start(0);
}
 
// Load all sound effects once up front
loadSound("paddle", "sounds/paddle.mp3");
loadSound("score", "sounds/score.mp3");
loadSound("start", "sounds/start.mp3");
 
// ============================================
// SOUND ON / OFF BUTTON
// ============================================
 
const soundBtn = document.createElement("button");
 
soundBtn.id = "pong-sound-btn";
soundBtn.innerText = "🔊 Sound ON";
 
soundBtn.style.display = "block";
soundBtn.style.margin = "10px auto";
soundBtn.style.padding = "8px 16px";
soundBtn.style.fontSize = "14px";
soundBtn.style.fontWeight = "bold";
soundBtn.style.cursor = "pointer";
soundBtn.style.border = "none";
soundBtn.style.borderRadius = "8px";
soundBtn.style.backgroundColor = "#4e5cd8";
soundBtn.style.color = "white";
 
soundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
 
    if (soundEnabled) {
        soundBtn.innerText = "🔊 Sound ON";
    } else {
        soundBtn.innerText = "🔇 Sound OFF";
    }
 
    // Resume audio context on user gesture (needed for mobile browsers)
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
});
 
// Put button BELOW the game board
const soundContainer = document.createElement("div");
 
soundContainer.style.width = "100%";
soundContainer.style.textAlign = "center";
soundContainer.style.marginTop = "15px";
soundContainer.style.marginBottom = "15px";
 
soundContainer.appendChild(soundBtn);
 
canvas.parentElement.insertAdjacentElement("afterend", soundContainer);
 
// AI Reaction Speed Modifiers (Horizontal Tracking)
const difficulties = {
    easy: { aiSpeed: 4.5, ballIncrement: 0.25 },
    hard: { aiSpeed: 8.0, ballIncrement: 0.6 }
};
 
// Game Objects Layout Definitions (Paddles are now horizontal bars!)
const paddleWidth = 90;
const paddleHeight = 12;
 
const player = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: canvas.height - paddleHeight - 15,
    width: paddleWidth,
    height: paddleHeight,
    color: "#FFF"
};
 
const ai = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: 15,
    width: paddleWidth,
    height: paddleHeight,
    color: "#FFF"
};
 
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 6,
    velocityX: 0,
    velocityY: 0,
    color: "#00FF00" // Neon Green Ball
};
 
// ============================================
// CACHED STATIC RESOURCES (built once, not per-frame)
// ============================================
 
const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
bgGradient.addColorStop(0, "#050510");
bgGradient.addColorStop(0.5, "#101020");
bgGradient.addColorStop(1, "#050510");
 
// Net Drawing Function (Now horizontal!)
function drawNet() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    for (let i = 0; i <= canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height / 2 - 1.5, 12, 3);
    }
}
 
function renderPong() {
 
    // ==========================================
    // DARK ARCADE BACKGROUND (cached gradient)
    // ==========================================
 
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
 
 
    // ==========================================
    // GLOWING BOARD BORDER
    // ==========================================
 
    ctx.save();
 
    if (!isMobile) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#00ffff";
    }
 
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 3;
 
    ctx.strokeRect(
        2,
        2,
        canvas.width - 4,
        canvas.height - 4
    );
 
    ctx.restore();
 
 
    // ==========================================
    // CENTRE LINE
    // ==========================================
 
    ctx.save();
 
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
 
    if (!isMobile) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffffff";
    }
 
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
 
    ctx.beginPath();
 
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
 
    ctx.stroke();
 
    ctx.restore();
 
 
    // ==========================================
    // CENTRE CIRCLE
    // ==========================================
 
    ctx.save();
 
    ctx.beginPath();
 
    ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        35,
        0,
        Math.PI * 2
    );
 
    ctx.strokeStyle = "rgba(0,255,255,0.25)";
    ctx.lineWidth = 2;
 
    if (!isMobile) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffff";
    }
 
    ctx.stroke();
 
    ctx.restore();
 
 
    // ==========================================
    // BALL TRAIL
    // ==========================================
 
    for (let i = 0; i < ballTrail.length; i++) {
 
        const trail = ballTrail[i];
 
        const alpha = i / ballTrail.length;
 
        const size =
            ball.radius * (0.3 + alpha * 0.7);
 
        ctx.beginPath();
 
        ctx.arc(
            trail.x,
            trail.y,
            size,
            0,
            Math.PI * 2
        );
 
        ctx.fillStyle =
            `rgba(0,255,0,${alpha * 0.25})`;
 
        ctx.fill();
    }
 
 
    // ==========================================
    // PLAYER PADDLE
    // ==========================================
 
    ctx.save();
 
    if (!isMobile) {
        ctx.shadowBlur = playerHitFlash > 0 ? 30 : 15;
        ctx.shadowColor = "#00ffff";
    }
 
    ctx.fillStyle =
        playerHitFlash > 0
            ? "#ffffff"
            : "#00ffff";
 
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );
 
    ctx.restore();
 
 
    // ==========================================
    // AI PADDLE
    // ==========================================
 
    ctx.save();
 
    if (!isMobile) {
        ctx.shadowBlur = aiHitFlash > 0 ? 30 : 15;
        ctx.shadowColor = "#ff00ff";
    }
 
    ctx.fillStyle =
        aiHitFlash > 0
            ? "#ffffff"
            : "#ff00ff";
 
    ctx.fillRect(
        ai.x,
        ai.y,
        ai.width,
        ai.height
    );
 
    ctx.restore();
 
 
    // ==========================================
    // GLOWING BALL
    // ==========================================
 
    ctx.save();
 
    ctx.beginPath();
 
    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );
 
    ctx.fillStyle = "#00ff00";
 
    if (!isMobile) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#00ff00";
    }
 
    ctx.fill();
 
    ctx.restore();
 
 
    // ==========================================
    // UPDATE VISUAL EFFECT TIMERS
    // ==========================================
 
    if (playerHitFlash > 0) {
        playerHitFlash--;
    }
 
    if (aiHitFlash > 0) {
        aiHitFlash--;
    }
}
 
// This action fires to serve the ball vertically
function startPongBall() {
    if (isBallPlaying) return;
 
    document.getElementById("pong-start-overlay").style.display = "none";
    isBallPlaying = true;
    playGameSound("start");
 
    ball.speed = 6;
    ball.velocityX = (Math.random() * 2 - 1) * 4;
    // Serve up toward AI or down toward player randomly
    ball.velocityY = Math.random() < 0.5 ? 6 : -6;
}
 
// Suspend movement and restore display canvas menu overlays
function stopAndResetBallState() {
    isBallPlaying = false;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = 0;
    ball.velocityY = 0;
 
    ballTrail = [];
 
    document.getElementById("pong-start-overlay").style.display = "flex";
}
 
// Physics & Game Evaluation Loop
function updatePongMechanics() {
    // AI Tracks the ball horizontally (X-axis)
    let aiTargetX = ball.x - (ai.width / 2);
    ai.x += (aiTargetX - ai.x) * 0.14;
 
    if (ai.x < 0) ai.x = 0;
    if (ai.x + ai.width > canvas.width) ai.x = canvas.width - ai.width;
 
    if (!isBallPlaying) return;
 
    // Move ball displacement matrix vectors
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
 
    // Store ball position for trail effect
    ballTrail.push({
        x: ball.x,
        y: ball.y
    });
 
    if (ballTrail.length > maxTrailLength) {
        ballTrail.shift();
    }
 
    // Bounce off Left and Right side walls — clamp position to prevent tunneling/sticking
if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.velocityX = Math.abs(ball.velocityX);
} else if (ball.x + ball.radius > canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.velocityX = -Math.abs(ball.velocityX);
}
 
    // Determine target paddle strike zone bounding box checks (Top/Bottom checks now)
    let targetPaddle = (ball.y > canvas.height / 2) ? player : ai;
 
   if (collisionCheck(ball, targetPaddle)) {

    if (targetPaddle === player) {
        playerHitFlash = 6;
        ball.y = targetPaddle.y - ball.radius; // push above player paddle
    } else {
        aiHitFlash = 6;
        ball.y = targetPaddle.y + targetPaddle.height + ball.radius; // push below AI paddle
    }

    playGameSound("paddle");

    let collidePoint = (ball.x - (targetPaddle.x + targetPaddle.width / 2));
    collidePoint = collidePoint / (targetPaddle.width / 2);

    let angleRad = (Math.PI / 4) * collidePoint;
    let direction = (ball.y > canvas.height / 2) ? -1 : 1;

    ball.speed += difficulties[currentPongDiff].ballIncrement;
    ball.velocityX = ball.speed * Math.sin(angleRad);
    ball.velocityY = direction * ball.speed * Math.cos(angleRad);
}
 
    // Score Tracking Conditions (Top and Bottom out-of-bounds)
    if (ball.y - ball.radius < 0) {
        // Ball went past AI -> Player Scores!
        playerScore++;
 
        playGameSound("score");
        updatePongScoreboardUI();
        stopAndResetBallState();
    } else if (ball.y + ball.radius > canvas.height) {
        // Ball went past Player -> AI Scores!
        aiScore++;
 
        playGameSound("score");
        updatePongScoreboardUI();
        stopAndResetBallState();
    }
}
 
// AABB Collision utility engine updated for Top/Bottom interaction
function collisionCheck(b, p) {
    return b.x + b.radius > p.x && b.x - b.radius < p.x + p.width &&
           b.y + b.radius > p.y && b.y - b.radius < p.y + p.height;
}
 
function updatePongScoreboardUI() {
    document.getElementById("pong-score").innerHTML = `Player: ${playerScore} | AI: ${aiScore}`;
}
 
// --- CONTROLLER EVENTS (MOUSE & MOBILE TOUCH SWIPE) ---
 
function handlePaddleMovement(clientX) {
    let rect = canvas.getBoundingClientRect();
    let rootX = clientX - rect.left - (paddleWidth / 2);
    let scaleX = canvas.width / rect.width;
 
    player.x = rootX * scaleX;
 
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}
 
// Desktop Tracking Listener (X-Axis tracking)
canvas.addEventListener("mousemove", (evt) => {
    handlePaddleMovement(evt.clientX);
});
 
// Mobile Fluid Swipe Listener (X-Axis tracking)
function touchMoveHandler(evt) {
    if (evt.touches && evt.touches.length > 0) {
        handlePaddleMovement(evt.touches[0].clientX);
    }
    evt.preventDefault();
}
 
canvas.addEventListener("touchmove", touchMoveHandler, { passive: false });
canvas.addEventListener("touchstart", touchMoveHandler, { passive: false });
 
// --- GAMESTATE CONTROLS ---
 
function changePongDifficulty(level) {
    currentPongDiff = level;
    document.getElementById("pong-btn-easy").classList.remove("active");
    document.getElementById("pong-btn-hard").classList.remove("active");
 
    document.getElementById(`pong-btn-${level}`).classList.add("active");
    resetPongMatch();
}
 
function resetPongMatch() {
    playerScore = 0;
    aiScore = 0;
    updatePongScoreboardUI();
    stopAndResetBallState();
}
 
// Primary Master Heartbeat Clock Tick Frame Runner
function gameLoop() {
    updatePongMechanics();
    renderPong();
    requestAnimationFrame(gameLoop);
}
 
// Boot setup script execution loop
gameLoop();
