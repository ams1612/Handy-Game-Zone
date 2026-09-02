const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const gameWrapper = document.getElementById('gameWrapper');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const scoreVal = document.getElementById('scoreVal');
const levelVal = document.getElementById('levelVal');
const levelName = document.getElementById('levelName');
const healthBarInner = document.getElementById('healthBarInner');
const bossBarWrap = document.getElementById('bossBarWrap');
const bossBarInner = document.getElementById('bossBarInner');
const bossNameEl = document.getElementById('bossName');
const soundBtn = document.getElementById('soundBtn');
const powerBtn = document.getElementById('powerBtn');
const livesDisplay = document.getElementById('livesDisplay');
const moveZone = document.getElementById('moveZone');
const fireBtn = document.getElementById('fireBtn');
const levelCompleteOverlay = document.getElementById('levelCompleteOverlay');
const lcTitle = document.getElementById('lcTitle');
const lcStats = document.getElementById('lcStats');
const continueBtn = document.getElementById('continueBtn');
 
let W, H;
function resize() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  W = rect.width;
  H = rect.height;
}
window.addEventListener('resize', resize);
 
// ==========================================
// LOCAL SOUND TOGGLE (this game only)
// ==========================================
let soundOn = localStorage.getItem('skyStrikerSound') !== 'false';
soundBtn.textContent = soundOn ? '🔊' : '🔇';
 
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  localStorage.setItem('skyStrikerSound', soundOn);
  soundBtn.textContent = soundOn ? '🔊' : '🔇';
});
 
// ==========================================
// LOCAL POWER-UP TOGGLE (this game only)
// ==========================================
let powerupsOn = localStorage.getItem('skyStrikerPowerups') !== 'false';
powerBtn.textContent = powerupsOn ? '⚡ ON' : '⚡ OFF';
powerBtn.classList.toggle('off', !powerupsOn);
 
powerBtn.addEventListener('click', () => {
  powerupsOn = !powerupsOn;
  localStorage.setItem('skyStrikerPowerups', powerupsOn);
  powerBtn.textContent = powerupsOn ? '⚡ ON' : '⚡ OFF';
  powerBtn.classList.toggle('off', !powerupsOn);
});
 
function beep(freq, dur, type, vol) {
  if (!soundOn) return;
  try {
    const ac = beep.ctx || (beep.ctx = new (window.AudioContext || window.webkitAudioContext)());
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.value = vol || 0.06;
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.stop(ac.currentTime + dur);
  } catch (e) {}
}
const sfx = {
  shoot: () => beep(760, 0.08, 'square', 0.04),
  explode: () => beep(120, 0.25, 'sawtooth', 0.09),
  hit: () => beep(200, 0.15, 'triangle', 0.08),
  levelStart: () => beep(500, 0.35, 'sine', 0.08),
  levelWin: () => { beep(500, 0.15, 'sine', 0.09); setTimeout(() => beep(700, 0.2, 'sine', 0.09), 140); setTimeout(() => beep(900, 0.3, 'sine', 0.09), 280); },
  bossAlert: () => { beep(160, 0.3, 'sawtooth', 0.08); setTimeout(() => beep(120, 0.4, 'sawtooth', 0.08), 200); },
  powerup: () => beep(880, 0.15, 'sine', 0.07),
  gameover: () => beep(90, 0.6, 'sawtooth', 0.1)
};
 
// ==========================================
// LEVEL DEFINITIONS
// ==========================================
const LEVELS = [
  {
    name: 'Coastal Patrol',
    enemyCount: 14,
    spawnGap: 0.75,
    enemyTypes: ['drone'],
    speedMult: 1.0,
    bossHp: 26,
    bossFireGap: 0.5,
    bossBurstGap: 2.8,
    bossName: 'PATROL CRUISER',
    bossColor: '#f87171',
    theme: ['#0b1330', '#123a5e']
  },
  {
    name: 'Storm Front',
    enemyCount: 18,
    spawnGap: 0.62,
    enemyTypes: ['drone', 'jet'],
    speedMult: 1.15,
    bossHp: 42,
    bossFireGap: 0.42,
    bossBurstGap: 2.4,
    bossName: 'STORM RIDER',
    bossColor: '#fb923c',
    theme: ['#1a0e33', '#3a1e5e']
  },
  {
    name: 'Night Raid',
    enemyCount: 22,
    spawnGap: 0.5,
    enemyTypes: ['drone', 'jet', 'bomber'],
    speedMult: 1.3,
    bossHp: 60,
    bossFireGap: 0.36,
    bossBurstGap: 2.1,
    bossName: 'NIGHT REAPER',
    bossColor: '#c084fc',
    theme: ['#05050f', '#151530']
  },
  {
    name: 'Desert Storm',
    enemyCount: 26,
    spawnGap: 0.42,
    enemyTypes: ['jet', 'bomber'],
    speedMult: 1.45,
    bossHp: 80,
    bossFireGap: 0.3,
    bossBurstGap: 1.8,
    bossName: 'SANDSTORM TITAN',
    bossColor: '#facc15',
    theme: ['#331a0b', '#5e3a1e']
  },
  {
    name: 'Final Frontier',
    enemyCount: 32,
    spawnGap: 0.34,
    enemyTypes: ['drone', 'jet', 'bomber'],
    speedMult: 1.65,
    bossHp: 110,
    bossFireGap: 0.24,
    bossBurstGap: 1.5,
    bossName: 'VOID DESTROYER',
    bossColor: '#f43f5e',
    theme: ['#0b1330', '#2a0b4e']
  }
];
 
// ==========================================
// GAME STATE
// ==========================================
let running = false;
let score = 0;
let levelIndex = 0;
let health = 100;
let maxHealth = 100;
let lives = 3;
const maxLives = 3;
let respawning = false;
 
// phase: 'spawning' -> normal enemies, 'boss' -> boss fight, 'clear' -> transitioning
let phase = 'spawning';
 
const player = {
  x: 0, y: 0, w: 40, h: 46, speed: 320, cooldown: 0,
  shieldTime: 0, rapidTime: 0, multiTime: 0, invulnTime: 0
};
let bullets = [];
let enemyBullets = [];
let enemies = [];
let boss = null;
let particles = [];
let stars = [];
let powerups = [];
let waveEnemiesLeft = 0;
let spawnTimer = 0;
 
// ==========================================
// INPUT
// ==========================================
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === ' ') e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
 
let touchMoveActive = false;
let touchTargetX = null, touchTargetY = null;
moveZone.addEventListener('pointerdown', handlePointerMove);
moveZone.addEventListener('pointermove', handlePointerMove);
moveZone.addEventListener('pointerup', () => { touchMoveActive = false; });
moveZone.addEventListener('pointerleave', () => { touchMoveActive = false; });
moveZone.addEventListener('pointercancel', () => { touchMoveActive = false; });
function handlePointerMove(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  touchTargetX = e.clientX - rect.left;
  touchTargetY = e.clientY - rect.top;
  touchMoveActive = true;
}
 
let firing = false;
fireBtn.addEventListener('pointerdown', e => { e.preventDefault(); firing = true; });
fireBtn.addEventListener('pointerup', e => { e.preventDefault(); firing = false; });
fireBtn.addEventListener('pointerleave', () => { firing = false; });
fireBtn.addEventListener('pointercancel', () => { firing = false; });
fireBtn.addEventListener('contextmenu', e => e.preventDefault());
 
// ==========================================
// SETUP / RESET
// ==========================================
function resetGame() {
  score = 0;
  levelIndex = 0;
  health = maxHealth;
  lives = maxLives;
  respawning = false;
  bullets = [];
  enemyBullets = [];
  enemies = [];
  particles = [];
  powerups = [];
  boss = null;
  player.x = W / 2 - player.w / 2;
  player.y = H - 90;
  player.cooldown = 0;
  player.shieldTime = 0;
  player.rapidTime = 0;
  player.multiTime = 0;
  player.invulnTime = 0;
  setupLevel();
  updateHUD();
}
 
function setupLevel() {
  const lvl = LEVELS[levelIndex];
  phase = 'spawning';
  waveEnemiesLeft = lvl.enemyCount;
  spawnTimer = 0;
  boss = null;
  levelVal.textContent = levelIndex + 1;
  levelName.textContent = lvl.name;
  bossBarWrap.classList.add('hidden');
  gameWrapper.style.background = `linear-gradient(180deg, ${lvl.theme[0]} 0%, ${lvl.theme[1]} 50%, ${lvl.theme[0]} 100%)`;
  sfx.levelStart();
}
 
function updateHUD() {
  scoreVal.textContent = score;
  healthBarInner.style.width = Math.max(0, (health / maxHealth) * 100) + '%';
  livesDisplay.textContent = '❤'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, maxLives - lives));
  if (health / maxHealth < 0.3) {
    healthBarInner.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
  } else if (health / maxHealth < 0.6) {
    healthBarInner.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
  } else {
    healthBarInner.style.background = 'linear-gradient(90deg, #34d399, #22c55e)';
  }
  if (boss) {
    bossBarInner.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%';
  }
}
 
function initStars() {
  stars = [];
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 60 + 30
    });
  }
}
 
// ==========================================
// SPAWNING - NORMAL ENEMIES
// ==========================================
const ENEMY_CFG = {
  drone: { w: 30, h: 30, hp: 1, speed: 90, score: 10, color: '#f87171' },
  jet: { w: 34, h: 38, hp: 2, speed: 130, score: 20, color: '#fb923c' },
  bomber: { w: 46, h: 40, hp: 4, speed: 60, score: 40, color: '#c084fc' }
};
 
function spawnEnemy() {
  const lvl = LEVELS[levelIndex];
  const type = lvl.enemyTypes[Math.floor(Math.random() * lvl.enemyTypes.length)];
  const cfg = ENEMY_CFG[type];
  enemies.push({
    x: Math.random() * (W - cfg.w),
    y: -cfg.h,
    w: cfg.w, h: cfg.h,
    hp: cfg.hp, maxHp: cfg.hp,
    speed: cfg.speed * lvl.speedMult,
    scoreVal: cfg.score,
    color: cfg.color,
    type,
    fireTimer: Math.random() * 1.6 + 0.6,
    wobble: Math.random() * Math.PI * 2
  });
}
 
// ==========================================
// SPAWNING - BOSS
// ==========================================
function spawnBoss() {
  const lvl = LEVELS[levelIndex];
  phase = 'boss';
  boss = {
    x: W / 2 - 55,
    y: -100,
    w: 110, h: 90,
    hp: lvl.bossHp,
    maxHp: lvl.bossHp,
    color: lvl.bossColor,
    entering: true,
    targetY: 60,
    dir: 1,
    fireGap: lvl.bossFireGap,
    burstGap: lvl.bossBurstGap,
    fireTimer: 1.2,
    burstTimer: 2.5
  };
  bossNameEl.textContent = lvl.bossName;
  bossBarWrap.classList.remove('hidden');
  sfx.bossAlert();
}
 
// ==========================================
// POWER-UPS
// ==========================================
const POWERUP_TYPES = ['shield', 'rapid', 'multishot', 'heal'];
const POWERUP_META = {
  shield: { color: '#38bdf8', icon: '🛡' },
  rapid: { color: '#facc15', icon: '⚡' },
  multishot: { color: '#a78bfa', icon: '✳' },
  heal: { color: '#4ade80', icon: '❤' }
};
 
function maybeSpawnPowerup(x, y) {
  if (!powerupsOn) return;
  if (Math.random() < 0.16) {
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    powerups.push({ x, y, w: 22, h: 22, type, speed: 90 });
  }
}
 
function applyPowerup(type) {
  sfx.powerup();
  if (type === 'shield') player.shieldTime = 6;
  else if (type === 'rapid') player.rapidTime = 7;
  else if (type === 'multishot') player.multiTime = 8;
  else if (type === 'heal') { health = Math.min(maxHealth, health + 25); updateHUD(); }
}
 
function spawnExplosion(x, y, color) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 120 + 40;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.3,
      maxLife: 0.5 + Math.random() * 0.3,
      color: color || '#fbbf24',
      r: Math.random() * 3 + 1.5
    });
  }
}
 
// ==========================================
// MAIN LOOP
// ==========================================
let lastTime = 0;
function loop(t) {
  if (!running) return;
  if (!lastTime) lastTime = t;
  let dt = (t - lastTime) / 1000;
  dt = Math.min(dt, 0.033);
  lastTime = t;
 
  update(dt);
  draw();
 
  requestAnimationFrame(loop);
}
 
function update(dt) {
  for (const s of stars) {
    s.y += s.speed * dt;
    if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
  }
 
  // --- movement ---
  let dx = 0, dy = 0;
  if (keys['arrowleft'] || keys['a']) dx -= 1;
  if (keys['arrowright'] || keys['d']) dx += 1;
  if (keys['arrowup'] || keys['w']) dy -= 1;
  if (keys['arrowdown'] || keys['s']) dy += 1;
 
  if (touchMoveActive && touchTargetX !== null) {
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    const ddx = touchTargetX - cx;
    const ddy = touchTargetY - cy;
    const dist = Math.hypot(ddx, ddy);
    if (dist > 4) { dx = ddx / dist; dy = ddy / dist; }
  } else {
    const len = Math.hypot(dx, dy);
    if (len > 0) { dx /= len; dy /= len; }
  }
 
  player.x += dx * player.speed * dt;
  player.y += dy * player.speed * dt;
  player.x = Math.max(0, Math.min(W - player.w, player.x));
  player.y = Math.max(0, Math.min(H - player.h, player.y));
 
  // --- power-up timers ---
  if (player.shieldTime > 0) player.shieldTime -= dt;
  if (player.rapidTime > 0) player.rapidTime -= dt;
  if (player.multiTime > 0) player.multiTime -= dt;
  if (player.invulnTime > 0) player.invulnTime -= dt;
 
  // --- firing ---
  player.cooldown -= dt;
  const wantsFire = keys[' '] || firing;
  const fireRate = player.rapidTime > 0 ? 0.09 : 0.18;
  if (wantsFire && player.cooldown <= 0) {
    if (player.multiTime > 0) {
      bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 12, speed: 480, vx: 0 });
      bullets.push({ x: player.x + player.w / 2 - 2, y: player.y + 6, w: 4, h: 12, speed: 480, vx: -140 });
      bullets.push({ x: player.x + player.w / 2 - 2, y: player.y + 6, w: 4, h: 12, speed: 480, vx: 140 });
    } else {
      bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 12, speed: 480, vx: 0 });
    }
    player.cooldown = fireRate;
    sfx.shoot();
  }
 
  bullets.forEach(b => { b.y -= b.speed * dt; if (b.vx) b.x += b.vx * dt; });
  bullets = bullets.filter(b => b.y + b.h > 0 && b.x > -20 && b.x < W + 20);
 
  enemyBullets.forEach(b => b.y += b.speed * dt);
  enemyBullets = enemyBullets.filter(b => b.y < H);
 
  // --- power-up pickups falling ---
  powerups.forEach(p => p.y += p.speed * dt);
  powerups = powerups.filter(p => p.y < H);
  for (let i = powerups.length - 1; i >= 0; i--) {
    if (rectsOverlap(powerups[i], player)) {
      applyPowerup(powerups[i].type);
      powerups.splice(i, 1);
    }
  }
 
  // --- spawning normal enemies ---
  if (phase === 'spawning') {
    spawnTimer -= dt;
    if (waveEnemiesLeft > 0 && spawnTimer <= 0) {
      spawnEnemy();
      waveEnemiesLeft--;
      spawnTimer = LEVELS[levelIndex].spawnGap;
    }
    if (waveEnemiesLeft <= 0 && enemies.length === 0) {
      spawnBoss();
    }
  }
 
  // --- normal enemy behavior ---
  enemies.forEach(e => {
    e.wobble += dt * 2;
    e.x += Math.sin(e.wobble) * 18 * dt;
    e.y += e.speed * dt;
    e.fireTimer -= dt;
    if (e.fireTimer <= 0 && e.y > 0 && e.y < H - 100) {
      enemyBullets.push({ x: e.x + e.w / 2 - 2, y: e.y + e.h, w: 4, h: 10, speed: 220 });
      e.fireTimer = 1.6 + Math.random() * 1.4;
    }
  });
 
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.y > H) { enemies.splice(i, 1); continue; }
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (rectsOverlap(b, e)) {
        bullets.splice(j, 1);
        e.hp--;
        sfx.hit();
        if (e.hp <= 0) {
          spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, e.color);
          maybeSpawnPowerup(e.x + e.w / 2 - 11, e.y + e.h / 2);
          score += e.scoreVal;
          sfx.explode();
          enemies.splice(i, 1);
        }
        break;
      }
    }
  }
 
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (rectsOverlap(e, player)) {
      spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, e.color);
      enemies.splice(i, 1);
      takeDamage(20);
    }
  }
 
  // --- boss behavior ---
  if (boss) {
    if (boss.entering) {
      boss.y += 80 * dt;
      if (boss.y >= boss.targetY) { boss.y = boss.targetY; boss.entering = false; }
    } else {
      boss.x += boss.dir * 70 * dt;
      if (boss.x <= 10) { boss.x = 10; boss.dir = 1; }
      if (boss.x >= W - boss.w - 10) { boss.x = W - boss.w - 10; boss.dir = -1; }
 
      boss.fireTimer -= dt;
      boss.burstTimer -= dt;
 
      if (boss.fireTimer <= 0) {
        enemyBullets.push({ x: boss.x + boss.w / 2 - 3, y: boss.y + boss.h, w: 6, h: 12, speed: 230 });
        boss.fireTimer = boss.fireGap;
      }
      if (boss.burstTimer <= 0) {
        for (let a = -2; a <= 2; a++) {
          enemyBullets.push({ x: boss.x + boss.w / 2 - 3, y: boss.y + boss.h, w: 6, h: 12, speed: 240, vx: a * 60 });
        }
        boss.burstTimer = boss.burstGap;
      }
    }
 
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (rectsOverlap(b, boss)) {
        bullets.splice(j, 1);
        boss.hp--;
        sfx.hit();
        if (boss.hp <= 0) {
          spawnExplosion(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.color);
          spawnExplosion(boss.x + boss.w / 2 - 20, boss.y + boss.h / 2 - 10, boss.color);
          spawnExplosion(boss.x + boss.w / 2 + 20, boss.y + boss.h / 2 + 10, boss.color);
          score += 200 + levelIndex * 50;
          sfx.explode();
          boss = null;
          bossBarWrap.classList.add('hidden');
          winLevel();
        }
        break;
      }
    }
 
    if (boss && !boss.entering && rectsOverlap(boss, player)) {
      takeDamage(30);
    }
  }
 
  enemyBullets.forEach(b => { if (b.vx) b.x += b.vx * dt; });
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    if (rectsOverlap(b, player)) {
      enemyBullets.splice(i, 1);
      takeDamage(8);
    }
  }
 
  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
  particles = particles.filter(p => p.life > 0);
 
  updateHUD();
 
  if (health <= 0 && running && !respawning) {
    loseLife();
  }
}
 
function loseLife() {
  lives--;
  updateHUD();
  if (lives <= 0) {
    endGame();
    return;
  }
  respawning = true;
  sfx.gameover();
  bullets = [];
  enemyBullets = [];
  particles.length = 0;
  spawnExplosion(player.x + player.w / 2, player.y + player.h / 2, '#38bdf8');
  setTimeout(() => {
    health = maxHealth;
    player.x = W / 2 - player.w / 2;
    player.y = H - 90;
    player.invulnTime = 2.5;
    respawning = false;
    updateHUD();
  }, 700);
}
 
function takeDamage(amount) {
  if (player.shieldTime > 0 || player.invulnTime > 0 || respawning) return;
  health -= amount;
  if (health < 0) health = 0;
}
 
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
 
// ==========================================
// LEVEL WIN / GAME FLOW
// ==========================================
function winLevel() {
  running = false;
  phase = 'clear';
  sfx.levelWin();
  const lvl = LEVELS[levelIndex];
 
  if (levelIndex >= LEVELS.length - 1) {
    lcTitle.textContent = '🏆 ALL LEVELS CLEARED!';
    lcStats.textContent = `Final Score: ${score}`;
    continueBtn.textContent = 'PLAY AGAIN';
    continueBtn.dataset.mode = 'restart';
  } else {
    lcTitle.textContent = `LEVEL ${levelIndex + 1} COMPLETE`;
    lcStats.textContent = `${lvl.name} cleared — Score: ${score}`;
    continueBtn.textContent = 'NEXT LEVEL';
    continueBtn.dataset.mode = 'next';
  }
  levelCompleteOverlay.classList.remove('hidden');
}
 
continueBtn.addEventListener('click', () => {
  levelCompleteOverlay.classList.add('hidden');
  if (continueBtn.dataset.mode === 'restart') {
    resetGame();
  } else {
    levelIndex++;
    bullets = [];
    enemyBullets = [];
    powerups = [];
    setupLevel();
  }
  running = true;
  lastTime = 0;
  requestAnimationFrame(loop);
});
 
// ==========================================
// DRAWING
// ==========================================
function draw() {
  ctx.clearRect(0, 0, W, H);
 
  ctx.fillStyle = '#cfe0ff';
  stars.forEach(s => {
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
 
  ctx.fillStyle = '#ffd54d';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
 
  ctx.fillStyle = '#ff5566';
  enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
 
  powerups.forEach(p => drawPowerup(p));
 
  enemies.forEach(e => drawEnemy(e));
 
  if (boss) drawBoss(boss);
 
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
 
  drawPlayer();
}
 
function drawPowerup(p) {
  const meta = POWERUP_META[p.type];
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.fillStyle = meta.color;
  ctx.beginPath();
  ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '13px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(meta.icon, 0, 1);
  ctx.restore();
}
 
function drawPlayer() {
  if (respawning) return;
  const x = player.x, y = player.y, w = player.w, h = player.h;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
 
  if (player.invulnTime > 0 && Math.floor(player.invulnTime * 8) % 2 === 0) {
    ctx.restore();
    return;
  }
 
  if (player.shieldTime > 0) {
    ctx.strokeStyle = 'rgba(56,189,248,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, w / 2 + 8, 0, Math.PI * 2);
    ctx.stroke();
  }
 
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, h / 2 - 4);
  ctx.lineTo(w / 4, h / 2);
  ctx.lineTo(-w / 4, h / 2);
  ctx.lineTo(-w / 2, h / 2 - 4);
  ctx.closePath();
  ctx.fill();
 
  ctx.fillStyle = '#0ea5e9';
  ctx.beginPath();
  ctx.moveTo(-w / 2 - 6, h / 2 - 2);
  ctx.lineTo(-w / 4, 2);
  ctx.lineTo(-w / 4, h / 2 - 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w / 2 + 6, h / 2 - 2);
  ctx.lineTo(w / 4, 2);
  ctx.lineTo(w / 4, h / 2 - 2);
  ctx.closePath();
  ctx.fill();
 
  ctx.fillStyle = player.multiTime > 0 ? '#c4b5fd' : '#e0f2fe';
  ctx.beginPath();
  ctx.ellipse(0, -h / 6, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
 
  ctx.fillStyle = `rgba(255,180,60,${0.5 + Math.random() * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 4, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
 
  ctx.restore();
}
 
function drawEnemy(e) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  ctx.fillStyle = e.color;
 
  if (e.type === 'drone') {
    ctx.beginPath();
    ctx.moveTo(0, e.h / 2);
    ctx.lineTo(e.w / 2, -e.h / 2);
    ctx.lineTo(0, -e.h / 4);
    ctx.lineTo(-e.w / 2, -e.h / 2);
    ctx.closePath();
    ctx.fill();
  } else if (e.type === 'jet') {
    ctx.beginPath();
    ctx.moveTo(0, e.h / 2);
    ctx.lineTo(e.w / 2, -e.h / 3);
    ctx.lineTo(e.w / 4, -e.h / 2);
    ctx.lineTo(0, -e.h / 4);
    ctx.lineTo(-e.w / 4, -e.h / 2);
    ctx.lineTo(-e.w / 2, -e.h / 3);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, e.w / 2, e.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, e.h / 4, e.w / 3, e.h / 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
 
  if (e.maxHp > 1) {
    const barW = e.w;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(-barW / 2, -e.h / 2 - 8, barW, 3);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(-barW / 2, -e.h / 2 - 8, barW * (e.hp / e.maxHp), 3);
  }
 
  ctx.restore();
}
 
function drawBoss(b) {
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.fillStyle = b.color;
 
  ctx.beginPath();
  ctx.moveTo(0, b.h / 2);
  ctx.lineTo(b.w / 2, -b.h / 4);
  ctx.lineTo(b.w / 3, -b.h / 2);
  ctx.lineTo(0, -b.h / 3);
  ctx.lineTo(-b.w / 3, -b.h / 2);
  ctx.lineTo(-b.w / 2, -b.h / 4);
  ctx.closePath();
  ctx.fill();
 
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, b.h / 8, b.w / 3, b.h / 6, 0, 0, Math.PI * 2);
  ctx.fill();
 
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(0, -b.h / 6, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
 
  ctx.restore();
}
 
// ==========================================
// GAME OVER
// ==========================================
function endGame() {
  running = false;
  sfx.gameover();
  overlay.querySelector('h1').textContent = 'MISSION OVER';
  overlay.querySelectorAll('p').forEach(p => p.remove());
  let stat = overlay.querySelector('.bigStat');
  if (!stat) {
    stat = document.createElement('p');
    stat.className = 'bigStat';
    overlay.insertBefore(stat, startBtn);
  }
  stat.textContent = `Score: ${score}  |  Level reached: ${levelIndex + 1}  |  Lives: 0`;
  startBtn.textContent = 'FLY AGAIN';
  overlay.classList.remove('hidden');
}
 
// ==========================================
// START
// ==========================================
startBtn.addEventListener('click', () => {
  startBtn.blur();
  overlay.classList.add('hidden');
  resize();
  initStars();
  resetGame();
  running = true;
  lastTime = 0;
  requestAnimationFrame(loop);
});
 
resize();
initStars();
player.x = W / 2 - player.w / 2;
player.y = H - 90;