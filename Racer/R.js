(function () {
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d", { alpha: false });
  var W = canvas.width, H = canvas.height;
  var roadW = 260, roadX = (W - roadW) / 2;
  var laneCount = 3, laneW = roadW / laneCount;
  var playerLane = 1;
  var playerW = 42, playerH = 78;
  var obstacles = [], coins = [], fuels = [];
  var speed = 6.0;
  var score = 0, level = 1, fuel = 100;
  var running = true;
  var frame = 0;
  var lastLaneY = [-9999, -9999, -9999];
  var minGap = 190;
  var soundOn = true;
 
  var scoreEl = document.getElementById("score");
  var levelEl = document.getElementById("level");
  var statusEl = document.getElementById("status");
  var fuelbar = document.getElementById("fuelbar");
  var tablewrap = document.getElementById("tablewrap");
  var scoretable = document.getElementById("scoretable");
  var soundToggle = document.getElementById("soundToggle");
 
  var themes = [
    { grass: "#3B6D11", grassDark: "#27500A", road: "#444441" },
    { grass: "#854F0B", grassDark: "#633806", road: "#5F5E5A" },
    { grass: "#04342C", grassDark: "#04342C", road: "#2C2C2A" }
  ];
  var palette = ["#378ADD", "#1D9E75", "#D4537E", "#7F77DD", "#BA7517"];
  var bestScores = [];
 
  var PLAYER_BODY = "#E24B4A";
  var PLAYER_DARK = "#501313";
  var PLAYER_ACCENT = "#FCEBEB";
 
  var actx = null;
  function beep(freq, dur, type) {
    if (!soundOn) return;
    try {
      if (!actx) {
        actx = new (window.AudioContext || window.webkitAudioContext)();
      }
      var o = actx.createOscillator();
      var g = actx.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.value = 0.06;
      o.connect(g);
      g.connect(actx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
      o.stop(actx.currentTime + dur);
    } catch (e) {}
  }
 
  soundToggle.addEventListener("click", function () {
    soundOn = !soundOn;
    soundToggle.textContent = "Sound: " + (soundOn ? "On" : "Off");
    if (soundOn) beep(440, 0.08, "sine");
  });
 
  function laneX(lane) {
    return roadX + lane * laneW + laneW / 2;
  }
 
  function reset() {
    playerLane = 1;
    obstacles = [];
    coins = [];
    fuels = [];
    speed = 3.0;
    score = 0;
    level = 1;
    fuel = 100;
    running = true;
    frame = 0;
    lastLaneY = [-9999, -9999, -9999];
    statusEl.textContent = "Use arrow keys (PC) or swipe / buttons (mobile) to steer";
    scoreEl.textContent = "0";
    levelEl.textContent = "1";
    fuelbar.style.width = "100%";
    fuelbar.style.background = "#BA7517";
    tablewrap.style.display = "none";
  }
 
  function spawnObstacle() {
    var candidates = [0, 1, 2].filter(function (l) {
      return lastLaneY[l] > minGap;
    });
    if (candidates.length === 0) return;
    var lane = candidates[Math.floor(Math.random() * candidates.length)];
    var color = palette[Math.floor(Math.random() * palette.length)];
    obstacles.push({ lane: lane, y: -90, w: 42, h: 78, color: color });
    lastLaneY[lane] = 0;
  }
  function spawnCoin() {
    var lane = Math.floor(Math.random() * laneCount);
    coins.push({ lane: lane, y: -40, r: 9 });
  }
  function spawnFuel() {
    var lane = Math.floor(Math.random() * laneCount);
    fuels.push({ lane: lane, y: -50, w: 22, h: 30 });
  }
 
  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }
  function circleRectOverlap(cx, cy, cr, bx, by, bw, bh) {
    var nx = Math.max(bx - bw / 2, Math.min(cx, bx + bw / 2));
    var ny = Math.max(by - bh / 2, Math.min(cy, by + bh / 2));
    var dx = cx - nx, dy = cy - ny;
    return dx * dx + dy * dy < cr * cr;
  }
 
  function drawSportsCar(targetCtx, x, y, w, h, body, dark, accent, facingDown) {
    targetCtx.save();
    targetCtx.translate(x, y);
    if (!facingDown) targetCtx.scale(1, -1);
 
    targetCtx.fillStyle = dark;
    targetCtx.beginPath();
    targetCtx.moveTo(-w * 0.34, h * 0.5);
    targetCtx.lineTo(-w * 0.34, h * 0.56);
    targetCtx.lineTo(w * 0.34, h * 0.56);
    targetCtx.lineTo(w * 0.34, h * 0.5);
    targetCtx.fill();
 
    targetCtx.fillStyle = dark;
    targetCtx.beginPath();
    targetCtx.roundRect(-w * 0.44, h * 0.32, w * 0.1, h * 0.16, 2);
    targetCtx.roundRect(w * 0.34, h * 0.32, w * 0.1, h * 0.16, 2);
    targetCtx.fill();
 
    targetCtx.fillStyle = body;
    targetCtx.beginPath();
    targetCtx.moveTo(0, -h * 0.5);
    targetCtx.bezierCurveTo(-w * 0.34, -h * 0.46, -w * 0.42, -h * 0.1, -w * 0.4, h * 0.12);
    targetCtx.bezierCurveTo(-w * 0.5, h * 0.2, -w * 0.5, h * 0.4, -w * 0.32, h * 0.48);
    targetCtx.bezierCurveTo(-w * 0.16, h * 0.53, w * 0.16, h * 0.53, w * 0.32, h * 0.48);
    targetCtx.bezierCurveTo(w * 0.5, h * 0.4, w * 0.5, h * 0.2, w * 0.4, h * 0.12);
    targetCtx.bezierCurveTo(w * 0.42, -h * 0.1, w * 0.34, -h * 0.46, 0, -h * 0.5);
    targetCtx.closePath();
    targetCtx.fill();
 
    targetCtx.fillStyle = dark;
    targetCtx.beginPath();
    targetCtx.moveTo(-w * 0.05, -h * 0.44);
    targetCtx.lineTo(w * 0.05, -h * 0.44);
    targetCtx.lineTo(w * 0.08, h * 0.5);
    targetCtx.lineTo(-w * 0.08, h * 0.5);
    targetCtx.closePath();
    targetCtx.fill();
 
    targetCtx.fillStyle = dark;
    targetCtx.beginPath();
    targetCtx.moveTo(-w * 0.24, -h * 0.2);
    targetCtx.quadraticCurveTo(0, -h * 0.3, w * 0.24, -h * 0.2);
    targetCtx.lineTo(w * 0.18, h * 0.02);
    targetCtx.quadraticCurveTo(0, -h * 0.02, -w * 0.18, h * 0.02);
    targetCtx.closePath();
    targetCtx.fill();
 
    targetCtx.fillStyle = accent;
    targetCtx.beginPath();
    targetCtx.moveTo(-w * 0.2, -h * 0.17);
    targetCtx.quadraticCurveTo(0, -h * 0.25, w * 0.2, -h * 0.17);
    targetCtx.lineTo(w * 0.15, -h * 0.02);
    targetCtx.quadraticCurveTo(0, -h * 0.08, -w * 0.15, -h * 0.02);
    targetCtx.closePath();
    targetCtx.fill();
 
    targetCtx.fillStyle = dark;
    targetCtx.beginPath();
    targetCtx.roundRect(-w * 0.56, -h * 0.02, w * 0.12, h * 0.05, 2);
    targetCtx.roundRect(w * 0.44, -h * 0.02, w * 0.12, h * 0.05, 2);
    targetCtx.fill();
 
    targetCtx.strokeStyle = accent;
    targetCtx.lineWidth = Math.max(2, w * 0.05);
    targetCtx.beginPath();
    targetCtx.moveTo(0, -h * 0.46);
    targetCtx.lineTo(0, h * 0.3);
    targetCtx.stroke();
 
    targetCtx.restore();
  }
 
  var spritePad = 8;
  var spriteW = playerW + spritePad * 2;
  var spriteH = playerH + spritePad * 2;
  function buildCarSprite(body, dark, accent, facingDown) {
    var off = document.createElement("canvas");
    off.width = spriteW;
    off.height = spriteH;
    var octx = off.getContext("2d");
    drawSportsCar(octx, spriteW / 2, spriteH / 2, playerW, playerH, body, dark, accent, facingDown);
    return off;
  }
  var playerSprite = buildCarSprite(PLAYER_BODY, PLAYER_DARK, PLAYER_ACCENT, true);
  var obstacleSprites = palette.map(function (color) {
    return buildCarSprite(color, "#2C2C2A", "#EAF3DE", false);
  });
  function spriteForColor(color) {
    var idx = palette.indexOf(color);
    return obstacleSprites[idx >= 0 ? idx : 0];
  }
 
  function drawCoin(x, y, r, spin) {
    ctx.save();
    ctx.translate(x, y);
    var sx = Math.max(0.25, Math.abs(Math.cos(spin)));
    ctx.scale(sx, 1);
    ctx.fillStyle = "#EF9F27";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#854F0B";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
 
  function drawFuel(x, y, w, h) {
    ctx.fillStyle = "#639922";
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
    ctx.fill();
    ctx.fillStyle = "#173404";
    ctx.fillRect(x - w * 0.28, y - h / 2 - 6, w * 0.56, 7);
    ctx.fillStyle = "#EAF3DE";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("F", x, y + 2);
  }
 
  function updateFuelBar() {
    fuelbar.style.width = Math.max(0, fuel) + "%";
    fuelbar.style.background = fuel > 40 ? "#639922" : fuel > 15 ? "#BA7517" : "#A32D2D";
  }
 
  function addBestScore(s) {
    bestScores.push(s);
    bestScores.sort(function (a, b) {
      return b - a;
    });
    bestScores = bestScores.slice(0, 5);
    scoretable.innerHTML = "";
    for (var i = 0; i < bestScores.length; i++) {
      var tr = document.createElement("tr");
      var td1 = document.createElement("td");
      td1.textContent = "#" + (i + 1);
      var td2 = document.createElement("td");
      td2.textContent = bestScores[i];
      tr.appendChild(td1);
      tr.appendChild(td2);
      scoretable.appendChild(tr);
    }
    tablewrap.style.display = "block";
  }
 
  function gameOver() {
    running = false;
    statusEl.textContent = "Crashed! Score: " + score;
    beep(120, 0.4, "sawtooth");
    addBestScore(score);
  }
 
  function step() {
    if (!running) return;
    frame++;
    var lvl = 1 + Math.floor(score / 20);
    if (lvl !== level) {
      level = lvl;
      levelEl.textContent = level;
      beep(660, 0.15, "triangle");
      speed += 0.3;
    }
    fuel -= 0.045;
    updateFuelBar();
    if (fuel <= 0) gameOver();
 
    for (var li = 0; li < laneCount; li++) lastLaneY[li] += speed;
    if (frame % Math.max(34, 66 - level * 3) === 0) spawnObstacle();
    if (frame % 70 === 0) spawnCoin();
    if (frame % 260 === 0) spawnFuel();
 
    var theme = themes[Math.min(themes.length - 1, Math.floor((level - 1) / 3))];
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = theme.grass;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = theme.grassDark;
    for (var g = 0; g < H + 24; g += 24) {
      var off = (frame * speed * 0.6 + g) % 24;
      ctx.fillRect(0, g - off, 14, 12);
      ctx.fillRect(W - 14, g - off, 14, 12);
    }
    ctx.fillStyle = theme.road;
    ctx.fillRect(roadX, 0, roadW, H);
    ctx.fillStyle = "#FAC775";
    ctx.fillRect(roadX - 4, 0, 4, H);
    ctx.fillRect(roadX + roadW, 0, 4, H);
    ctx.strokeStyle = "#D3D1C7";
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 18]);
    ctx.lineDashOffset = -(frame * speed) % 36;
    for (var l = 1; l < laneCount; l++) {
      ctx.beginPath();
      ctx.moveTo(roadX + l * laneW, 0);
      ctx.lineTo(roadX + l * laneW, H);
      ctx.stroke();
    }
    ctx.setLineDash([]);
 
    var playerX = laneX(playerLane);
    var playerY = H - 80;
 
    for (var i = coins.length - 1; i >= 0; i--) {
      var c = coins[i];
      c.y += speed;
      var cx = laneX(c.lane);
      drawCoin(cx, c.y, c.r, frame * 0.2 + i);
      if (c.y > H + 30) {
        coins.splice(i, 1);
        continue;
      }
      if (circleRectOverlap(cx, c.y, c.r, playerX, playerY, playerW * 0.8, playerH * 0.8)) {
        coins.splice(i, 1);
        score += 5;
        scoreEl.textContent = score;
        beep(880, 0.1, "sine");
      }
    }
    for (var j = fuels.length - 1; j >= 0; j--) {
      var f = fuels[j];
      f.y += speed;
      var fx = laneX(f.lane);
      drawFuel(fx, f.y, f.w, f.h);
      if (f.y > H + 40) {
        fuels.splice(j, 1);
        continue;
      }
      if (rectsOverlap(playerX - playerW * 0.4, playerY - playerH * 0.4, playerW * 0.8, playerH * 0.8, fx - f.w / 2, f.y - f.h / 2, f.w, f.h)) {
        fuels.splice(j, 1);
        fuel = Math.min(100, fuel + 35);
        updateFuelBar();
        beep(440, 0.15, "sine");
      }
    }
    for (var k = obstacles.length - 1; k >= 0; k--) {
      var o = obstacles[k];
      o.y += speed;
      var ox = laneX(o.lane);
      var sprite = spriteForColor(o.color);
      ctx.drawImage(sprite, ox - spriteW / 2, o.y - spriteH / 2);
      if (o.y > H + 90) {
        obstacles.splice(k, 1);
        score++;
        scoreEl.textContent = score;
        continue;
      }
      if (rectsOverlap(playerX - playerW / 2, playerY - playerH / 2, playerW, playerH, ox - o.w / 2, o.y - o.h / 2, o.w, o.h)) {
        gameOver();
      }
    }
 
    ctx.drawImage(playerSprite, playerX - spriteW / 2, playerY - spriteH / 2);
 
    if (running) requestAnimationFrame(step);
  }
 
  function moveLeft() {
    if (running) {
      playerLane = Math.max(0, playerLane - 1);
      beep(300, 0.05, "square");
    }
  }
  function moveRight() {
    if (running) {
      playerLane = Math.min(laneCount - 1, playerLane + 1);
      beep(300, 0.05, "square");
    }
  }
 
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") moveLeft();
    if (e.key === "ArrowRight") moveRight();
  });
  document.getElementById("left").addEventListener("click", moveLeft);
  document.getElementById("right").addEventListener("click", moveRight);
  document.getElementById("restart").addEventListener("click", function () {
    reset();
    requestAnimationFrame(step);
  });
 
  var touchStartX = null;
  canvas.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  canvas.addEventListener("touchend", function (e) {
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 30) {
      if (dx > 0) moveRight();
      else moveLeft();
    }
    touchStartX = null;
  }, { passive: true });
 
  requestAnimationFrame(step);
})();