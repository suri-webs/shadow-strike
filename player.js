import {
    Standing,
    Running,
    Jumping,
    Falling,
    Attack,
    Sprint,
    Death,
    Damage
} from "./playerStates.js";

import { WindProjectile } from "./windProjectile.js";
import { SlashProjectile } from "./slashProjectile.js";
import {
    BoulderProjectile,
    FissureSpikesProjectile,
    StaticVoltProjectile,
    ThunderStrikeProjectile,
    HellfireProjectile,
    DragonShadowProjectile,
    DarkBallProjectile,
} from "./customProjectiles.js";

export class Player {

    constructor(game, characterType = 'shinobi') {

        this.game = game;
        this.characterType = characterType;

        this.width = 95;
        this.height = 96.1;
        this.srcWidth = 95;
        this.srcHeight = 96.1;
        this.maxSpeed = 5.2;
        this.maxHP = 100;
        this.weight = 0.16;
        this.image = document.getElementById('player');

        this.shieldColor = '86, 255, 255'; // Cyan
        this.shieldHex = '#56ffff';
        this.dashHex = '#ff2244'; // Red/Crimson to match character color
        this.qColor = '#ffffff'; // White
        this.eColor = '#56ffffff'; // Sky Blue
        this.rColor = '#ffea00'; // Yellow
        this.sprintFilter = 'sepia(1) hue-rotate(-40deg) saturate(4) brightness(1.2)';
        this.dashSpeed = 20; // Shinobi dash speed
        this.bottomMargin = 0;

        if (this.characterType === 'jotem') {
            this.width = 240;
            this.height = 240;
            this.srcWidth = 128;
            this.srcHeight = 128;
            this.maxSpeed = 2.5;
            this.maxHP = 130;
            this.weight = 0.25;
            this.image = document.getElementById('player2_jotem');
            this.shieldColor = '255, 171, 0';
            this.shieldHex = '#ffa726';
            this.dashHex = '#ffa726';
            this.qColor = '#ffa726'; // Amber
            this.eColor = '#ff6d00'; // Orange
            this.rColor = '#d50000'; // Red
            this.sprintFilter = 'sepia(1) hue-rotate(80deg) saturate(5) brightness(1.2)'; // Green
            this.dashSpeed = 26;
            this.bottomMargin = -5;
        } else if (this.characterType === 'shaia') {
            this.width = 210;
            this.height = 210;
            this.maxSpeed = 4.2;
            this.maxHP = 90;
            this.weight = 0.14;
            this.shieldColor = '204, 85, 255';
            this.shieldHex = '#ffee58';
            this.dashHex = '#ffee58';
            this.qColor = '#ffffff'; // White
            this.eColor = '#ffee58'; // Purple
            this.rColor = '#80d8ff'; // Light Blue
            this.sprintFilter = 'sepia(1) hue-rotate(20deg) saturate(6) brightness(1.5)'; // Yellow
            this.dashSpeed = 28;
            this.bottomMargin = -10;

            // Cache lists for frame arrays
            this.shaiaSprites = {
                STANDING: [], RUNNING: [], JUMPING: [], FALLING: [],
                ATTACK: [], DAMAGE: [], DEATH: [],
                ATTACK_COMBO1: [], ATTACK_COMBO2: [], ATTACK_COMBO3: [], ATTACK_COMBO4: [], ATTACK_COMBO5: [],
                ATTACK_CROUCH1: [], ATTACK_CROUCH2: [],
                ATTACK_JUMP: [], ATTACK_RUN_KICK: []
            };
            this._preloadShaiaAssets();
        } else if (this.characterType === 'archdemon') {
            this.width = 240;
            this.height = 240;
            this.srcWidth = 128;
            this.srcHeight = 128;
            this.maxSpeed = 5.0;
            this.maxHP = 110;
            this.weight = 0.16;
            this.shieldColor = '255, 255, 255';
            this.shieldHex = '#ffffff';
            this.dashHex = '#ffffff';
            this.qColor = '#ff9100'; // Orange
            this.eColor = '#ff2244'; // Crimson
            this.rColor = '#d500f9'; // Magenta
            this.sprintFilter = 'sepia(1) hue-rotate(-40deg) saturate(5) brightness(1.2)'; // Dark Red
            this.dashSpeed = 22;
            this.bottomMargin = -80; // Sinks Archdemon down so he only floats slightly above ground

            this.archDemonIdle = document.getElementById('player4_archdemon_idle');
            this.archDemonAtk = document.getElementById('player4_archdemon_atk');
            this.archDemonHurt = document.getElementById('player4_archdemon_hurt');

            this.archDemonDeath = document.getElementById('player4_archdemon_death');
            this.image = this.archDemonIdle;
        }

        this.x = 100;
        this.y = this.game.height - this.height - this.game.groundMargin;

        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 4;

        this.fps = 10;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.speed = 0;

        this.dashSpeed = this.dashSpeed || 30;
        this.dashDuration = 200;
        this.dashTimer = 0;
        this.dashCooldownMax = 800;
        this.dashCooldown = 0;
        this.isDashing = false;

        this.vy = 0;

        this.jumpCount = 0;
        this.maxJumps = 2;

        this.shadows = [];
        this.particles = [];
        this.wasInAir = false;

        this.facingLeft = false;
        this.isDead = false;
        this.hasDashed = false;
        this.hasLandedBeyondLimit = false;
        this.takingDamage = false;
        this.killedByBoss = false;

        this.scaleX = 1;
        this.scaleY = 1;
        this.flashTimer = 0;

        this.windProjImg = document.getElementById('windProjectile');
        this.windProjCols = 3;
        this.windProjRows = 2;
        this.windProjSW = 96 / this.windProjCols;
        this.windProjSH = 64 / this.windProjRows;

        this.windProjectiles = [];
        this.windCooldown = 0;
        this.windCooldownMax = 2200;
        this.windChargeTimer = 0;
        this.windChargeMax = 300;
        this.windCharging = false;
        this.windChargeCol = 0;
        this.windChargeRow = 0;
        this.windChargeAnim = 0;
        this.windChargeInterval = 70;

        this.slashProjectiles = [];
        this.slashCooldown = 0;
        this.slashCooldownMax = 14000;

        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldCooldown = 0;
        this.shieldCooldownMax = 10000;

        this.states = [
            new Standing(this),
            new Running(this),
            new Jumping(this),
            new Falling(this),
            new Attack(this),
            new Sprint(this),
            new Death(this),
            new Damage(this),
        ];

        this.currentState = this.states[0];
        this.currentState.enter();
    }

    _preloadShaiaAssets() {
        for (let i = 1; i <= 8; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_common/common_00_idle_stand_A0${i}.png`;
            this.shaiaSprites.STANDING.push(img);
        }
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_common/common_12_run0${i}.png`;
            this.shaiaSprites.RUNNING.push(img);
        }
        this.shaiaSprites.SPRINT = this.shaiaSprites.RUNNING; // Share sprint with running

        for (let i = 1; i <= 5; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_common/common_21_jump0${i}.png`;
            this.shaiaSprites.JUMPING.push(img);
        }
        for (let i = 1; i <= 3; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_common/common_21_jump_down0${i}.png`;
            this.shaiaSprites.FALLING.push(img);
        }

        // 1. Standing Attack Combo 1 (6 frames)
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_attack/attack_01_cobination010${i}.png`;
            this.shaiaSprites.ATTACK_COMBO1.push(img);
        }
        // 2. Standing Attack Combo 2 (6 frames)
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_attack/attack_02_cobination020${i}.png`;
            this.shaiaSprites.ATTACK_COMBO2.push(img);
        }
        // 3. Standing Attack Combo 3 (7 frames)
        for (let i = 1; i <= 7; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_attack/attack_03_cobination030${i}.png`;
            this.shaiaSprites.ATTACK_COMBO3.push(img);
        }
        // 4. Standing Attack Combo 4 (11 frames)
        for (let i = 1; i <= 11; i++) {
            const img = new Image();
            const frameStr = i < 10 ? `0${i}` : `${i}`;
            img.src = `/asset/players/player3-shaia/sprites_attack/attack_04_cobination04${frameStr}.png`;
            this.shaiaSprites.ATTACK_COMBO4.push(img);
        }
        // 5. Standing Attack Combo 5 Knee Strike (6 frames)
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_attack/attack_05_knee0${i}.png`;
            this.shaiaSprites.ATTACK_COMBO5.push(img);
        }

        // 6. Crouch Attack 1 (6 frames)
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_attack/attack_11_crounch_attack010${i}.png`;
            this.shaiaSprites.ATTACK_CROUCH1.push(img);
        }

        // 7. Crouch Attack 2 (9 frames)
        for (let i = 1; i <= 9; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_attack/attack_11_crounch_attack020${i}.png`;
            this.shaiaSprites.ATTACK_CROUCH2.push(img);
        }

        // 8. Jump Attack (7 frames)
        for (let i = 1; i <= 7; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_attack/attack_21_jump_attack0${i}.png`;
            this.shaiaSprites.ATTACK_JUMP.push(img);
        }

        // 9. Run Kick Attack (9 frames)
        const runKickPaths = [
            '/asset/players/player3-shaia/sprites_attack/attack_06_run_kick_begin01.png',
            '/asset/players/player3-shaia/sprites_attack/attack_06_run_kick_begin02.png',
            '/asset/players/player3-shaia/sprites_attack/attack_06_run_kick_01.png',
            '/asset/players/player3-shaia/sprites_attack/attack_06_run_kick_02.png',
            '/asset/players/player3-shaia/sprites_attack/attack_06_run_kick_end01.png',
            '/asset/players/player3-shaia/sprites_attack/attack_06_run_kick_end02.png',
            '/asset/players/player3-shaia/sprites_attack/attack_06_run_kick_end03.png',
            '/asset/players/player3-shaia/sprites_attack/attack_06_run_kick_end04.png',
            '/asset/players/player3-shaia/sprites_attack/attack_06_run_kick_end05.png'
        ];
        runKickPaths.forEach(path => {
            const img = new Image();
            img.src = path;
            this.shaiaSprites.ATTACK_RUN_KICK.push(img);
        });

        // Default ATTACK points to Combo 1
        this.shaiaSprites.ATTACK = this.shaiaSprites.ATTACK_COMBO1;

        const hurt1 = new Image(); hurt1.src = `/asset/players/player3-shaia/sprites_damage/damage_01_damage_head.png`;
        const hurt2 = new Image(); hurt2.src = `/asset/players/player3-shaia/sprites_damage/damage_02_damage_body.png`;
        this.shaiaSprites.DAMAGE.push(hurt1, hurt2);

        for (let i = 1; i <= 3; i++) {
            const img = new Image();
            img.src = `/asset/players/player3-shaia/sprites_damage/damage_11_blow_begin0${i}.png`;
            this.shaiaSprites.DEATH.push(img);
        }
        const flat = new Image(); flat.src = `/asset/players/player3-shaia/sprites_damage/damage_11_blow_lying_A01.png`;
        this.shaiaSprites.DEATH.push(flat);
    }

    update(input, deltaTime) {
        if (this.rasenganActive) {
            input = [];
        }
        if (this.game.storyDialogueManager && this.game.storyDialogueManager.active) {
            input = [];
        }

        // If boss is introducing/roaring (introLocked is active), block player attacks
        if (this.game.enemies.some(e => e.isBoss && e.introLocked)) {
            input = input.filter(key => key !== 'MouseLeft' && key !== 'q' && key !== 'Q' && key !== 'r' && key !== 'R');
        }

        if (this.flashTimer > 0) this.flashTimer -= deltaTime;

        if (this.characterType === 'jotem') {
            const jotemMaxFrames = {
                'STANDING': 5,
                'RUNNING': 7,
                'JUMPING': 5,
                'FALLING': 5,
                'ATTACK': 9,
                'SPRINT': 7,
                'DEATH': 5,
                'DAMAGE': 3
            };
            const jotemFps = {
                'STANDING': 24,
                'RUNNING': 38,
                'JUMPING': 32,
                'FALLING': 28,
                'ATTACK': 42,
                'SPRINT': 65,
                'DEATH': 20,
                'DAMAGE': 26
            };
            const st = this.currentState.state;
            this.maxFrame = jotemMaxFrames[st] ?? 5;
            // Override fps for Jotem to animate faster
            const targetFps = jotemFps[st] ?? 28;
            if (this.fps !== targetFps) {
                this.fps = targetFps;
                this.frameInterval = 1000 / this.fps;
            }
        } else if (this.characterType === 'shaia') {
            let shaiaSpriteList;
            if (this.currentState.state === 'ATTACK') {
                shaiaSpriteList = this.shaiaSprites['ATTACK_' + (this.activeShaiaAttackCombo || 'COMBO1')];
            } else {
                shaiaSpriteList = this.shaiaSprites[this.currentState.state] || this.shaiaSprites.STANDING;
            }
            this.maxFrame = Math.max(0, shaiaSpriteList.length - 1);
        } else if (this.characterType === 'archdemon') {
            if (this.currentState.state === 'ATTACK') {
                this.image = this.archDemonAtk;
                this.maxFrame = 5;
            } else if (this.currentState.state === 'DEATH') {
                this.image = this.archDemonDeath;
                this.maxFrame = 7;
            } else if (this.currentState.state === 'DAMAGE') {
                this.image = this.archDemonHurt;
                this.maxFrame = 3;
            } else {
                this.image = this.archDemonIdle;
                this.maxFrame = 5;
            }
        }

        const easeSpd = 0.14 * (deltaTime / 16.6);
        this.scaleX += (1 - this.scaleX) * easeSpd;
        this.scaleY += (1 - this.scaleY) * easeSpd;



        if (this.game.portal && this.game.portal.activated) {
            this.x = this.game.portal.x + (this.game.portal.width - this.width) / 2;
            this.y = this.game.portal.y + this.game.portal.height - this.height;
            this.vy = 0;
            this.isDashing = false;
            this.windCharging = false;

            this.windProjectiles.forEach(p => p.update(deltaTime));
            this.windProjectiles = this.windProjectiles.filter(p => !p.markedForDeletion);

            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
            }
            return;
        }

        if (this.game.currentHP <= 0 && !this.isDead) {
            this.isDead = true;
            this.deathAnimDone = false;
            this.deathFadeTimer = 0;
            this.setState(6);
            if (this.game.audio) {
                this.game.audio.stopBGM();
            }
        }

        if (this.isDead) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX < this.maxFrame) {
                    this.frameX++;
                } else {
                    // animation finished — wait then trigger game over
                    if (!this.deathAnimDone) this.deathAnimDone = true;
                }
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            if (this.deathAnimDone) {
                this.deathFadeTimer += deltaTime;
                if (this.deathFadeTimer >= 1000) {
                    if (!this.game.gameOver) {
                        this.game.gameOver = true;
                        if (this.game.audio) {
                            this.game.audio.playSFX('game_over');
                        }
                    }
                }
            }

            // Apply gravity and update y position so player falls down naturally when dead
            if (!this.onGround()) {
                this.vy += this.weight;
                this.y += this.vy;
            } else {
                this.vy = 0;
                this.y = this.game.height - this.height - this.game.groundMargin;
            }
            return;
        }

        if (this.takingDamage &&
            this.currentState.state !== 'DAMAGE' &&
            this.currentState.state !== 'DEATH') {
            this.takingDamage = false;
            this.flashTimer = 220;
            this.scaleX = 1.15;
            this.scaleY = 0.85;
            this.setState(7);
        }

        this.currentState.handleInput(input);

        if (this.windCooldown > 0) this.windCooldown -= deltaTime;

        const pressingQ = input.includes('q') || input.includes('Q');

        if (pressingQ && !this.isDead &&
            this.currentState.state !== 'DEATH' &&
            this.currentState.state !== 'DAMAGE') {

            this.windCharging = true;
            this.windChargeTimer += deltaTime;

            this.windChargeAnim += deltaTime;
            if (this.windChargeAnim > this.windChargeInterval) {
                this.windChargeAnim = 0;
                this.windChargeCol++;
                if (this.windChargeCol >= this.windProjCols) {
                    this.windChargeCol = 0;
                    this.windChargeRow = (this.windChargeRow + 1) % this.windProjRows;
                }
            }

            if (this.windChargeTimer >= this.windChargeMax && this.windCooldown <= 0) {
                this.fireWind();
                this.windChargeTimer = 0;
                this.windCharging = false;
            }

        } else {
            this.windCharging = false;
            this.windChargeTimer = 0;
            this.windChargeCol = 0;
            this.windChargeRow = 0;
        }

        this.windProjectiles.forEach(p => p.update(deltaTime));
        this.windProjectiles = this.windProjectiles.filter(p => !p.markedForDeletion);

        if (this.slashCooldown > 0) this.slashCooldown -= deltaTime;
        const pressingR = input.includes('r') || input.includes('R');
        if (pressingR && this.slashCooldown <= 0 && !this.isDead &&
            this.currentState.state !== 'DEATH' && this.currentState.state !== 'DAMAGE') {
            this.fireSlash();
            this.slashCooldown = this.slashCooldownMax;
        }
        this.slashProjectiles.forEach(p => p.update(deltaTime));
        this.slashProjectiles = this.slashProjectiles.filter(p => !p.markedForDeletion);

        // ── Update Shield (E) ────────────────────────────────────────────
        if (this.shieldCooldown > 0) this.shieldCooldown -= deltaTime;
        if (this.shieldActive) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
                this.shieldTimer = 0;
                // Notify the player shield expired
                if (this.game.audio) this.game.audio.playSFX('player_hurt');
            }
        }
        const pressingE = input.includes('e') || input.includes('E');
        if (pressingE && this.shieldCooldown <= 0 && !this.isDead &&
            this.currentState.state !== 'DEATH' && this.currentState.state !== 'DAMAGE') {
            this.shieldActive = true;
            this.shieldTimer = 6000; // 3.5 seconds active duration
            this.shieldCooldown = this.shieldCooldownMax; // 5 seconds cooldown

            // Audio feedback
            if (this.game.audio) this.game.audio.playSFX('sprint');

            // Visual burst: outward expanding energy particles
            for (let i = 0; i < 24; i++) {
                const angle = (i / 24) * Math.PI * 2;
                const spd = Math.random() * 4 + 5;
                this.particles.push({
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    radius: 4 + Math.random() * 5,
                    alpha: 1.0,
                    color: Math.random() > 0.4 ? `rgba(${this.shieldColor}, 0.9)` : `rgba(${this.shieldColor}, 0.75)`
                });
            }
            this.game.shake = Math.max(this.game.shake, 18);
        }

        this.windProjectiles.forEach(proj => {
            if (proj.exploding) return;
            this.game.enemies.forEach(enemy => {
                if (enemy.markedForDeletion) return;
                if (!enemy.hasEnteredScreen) return;
                const hit =
                    proj.x < enemy.x + enemy.width &&
                    proj.x + proj.width > enemy.x &&
                    proj.y < enemy.y + enemy.height &&
                    proj.y + proj.height > enemy.y;

                if (hit) {
                    proj.exploding = true;
                    proj.explodeCol = 0;
                    proj.explodeRow = 0;
                    proj.hitX = enemy.x + enemy.width / 2 - proj.hitDispW / 2;
                    proj.hitY = enemy.y + enemy.height / 2 - proj.hitDispH / 2;

                    if (typeof enemy.takeDamage === 'function') {
                        enemy.takeDamage(20);
                    } else {
                        enemy.currentHP -= 20;
                    }
                }
            });
        });

        let right = input.includes('d') || input.includes('ArrowRight');
        let left = input.includes('a') || input.includes('ArrowLeft');

        if (this.game.reverseControls) {
            const temp = right;
            right = left;
            left = temp;
        }

        const shift = input.includes('Shift');

        if (this.dashCooldown > 0) this.dashCooldown -= deltaTime;

        if (!shift) this.hasDashed = false;

        if (shift && !this.hasDashed && !this.isDashing && this.dashCooldown <= 0) {
            if (right || left) {
                this.isDashing = true;
                this.dashTimer = this.dashDuration;
                this.facingLeft = left;
                this.hasDashed = true;
                this.dashCooldown = this.dashCooldownMax;
                this.scaleX = 1.35;
                this.scaleY = 0.72;
                if (this.game.audio) this.game.audio.playSFX('sprint');
                this.setState(5);
            }
        }

        let move = 0;

        if (this.isDashing) {
            this.dashTimer -= deltaTime;
            move = this.facingLeft ? -this.dashSpeed : this.dashSpeed;

            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.dashTimer = 0;

                this.setState(0);
            }
        } else if (right) {
            move = this.maxSpeed; this.facingLeft = false;
        } else if (left) {
            move = -this.maxSpeed; this.facingLeft = true;
        }

        if (this.currentState.state === 'DAMAGE') move = 0;
        if (this.rasenganActive) {
            move = this.rasenganVx || 0;
        }

        const inAir = !this.onGround();
        const leftLimit = (this.isDashing || inAir) ? 0 : 50;
        // rightLimit same for both SP and MP since background now scrolls in MP too
        const rightLimit = this.game.width * 0.90 - this.width;

        this.x += move;

        if (this.game.gravityPullActive && this.game.gravityTargetX !== undefined) {
            const pullSpd = 0.1;
            if (this.x < this.game.gravityTargetX) this.x += pullSpd;
            else if (this.x > this.game.gravityTargetX) this.x -= pullSpd;
        }

        this.x = Math.max(leftLimit, Math.min(this.x, rightLimit));
        this.game.speed = move;

        this.y += this.vy;

        const currentlyOnGround = this.onGround();

        if (currentlyOnGround && move !== 0) {
            if (Math.random() < 0.25) {
                this.particles.push({
                    x: this.x + this.width / 2 + (this.facingLeft ? 15 : -15),
                    y: this.y + this.height - 4,
                    vx: (this.facingLeft ? 1 : -1) * (Math.random() * 0.5 + 0.2),
                    vy: -Math.random() * 0.5,
                    radius: 3 + Math.random() * 3,
                    alpha: 0.6,
                    color: 'rgba(160, 160, 160, 0.4)'
                });
            }
        }

        if (this.wasInAir && currentlyOnGround) {
            this.scaleY = 0.72;
            this.scaleX = 1.28;
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    x: this.x + this.width / 2 + (Math.random() - 0.5) * 20,
                    y: this.y + this.height - 4,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -Math.random() * 1.5,
                    radius: 4 + Math.random() * 4,
                    alpha: 0.8,
                    color: 'rgba(160, 160, 160, 0.55)'
                });
            }
            this.game.shake = Math.max(this.game.shake, 6);
        }
        this.wasInAir = !currentlyOnGround;

        // 🏎️ Record dash trails
        if (this.isDashing) {
            this.shadows.push({
                x: this.x,
                y: this.y,
                frameX: this.frameX,
                frameY: this.frameY,
                alpha: 0.65,
                facingLeft: this.facingLeft,
                stateName: this.currentState.state
            });
        }

        if (!currentlyOnGround) {
            this.vy += this.weight;
            if (this.vy > 1.5) {
                this.scaleY = Math.min(1.12, this.scaleY + 0.015 * (deltaTime / 16.6));
                this.scaleX = Math.max(0.88, this.scaleX - 0.015 * (deltaTime / 16.6));
            }
        } else {
            this.vy = 0;
            this.y = this.game.height - this.height - this.game.groundMargin - this.bottomMargin;
            this.jumpCount = 0;
        }

        if (this.y < 0) { this.y = 0; this.vy = 0; }

        const animDelta = this.game.isMultiplayer ? deltaTime * 0.7 : deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameX = this.frameX < this.maxFrame ? this.frameX + 1 : 0;
            this.frameTimer = 0;
        } else {
            this.frameTimer += animDelta;
        }

        // Update and fade out dash shadow trails
        this.shadows.forEach(s => s.alpha -= deltaTime * 0.0035);
        this.shadows = this.shadows.filter(s => s.alpha > 0);

        // Update and fade out player particles
        this.particles.forEach(p => {
            p.x += (p.vx || 0) * (deltaTime / 16.6);
            p.y += (p.vy || 0) * (deltaTime / 16.6);
            p.alpha -= deltaTime * 0.0022;
            p.radius *= 0.96;
        });
        this.particles = this.particles.filter(p => p.alpha > 0 && p.radius > 0.5);
    }

    fireWind() {
        if (this.windCooldown > 0) return;
        const startX = this.facingLeft ? this.x - 80 : this.x + this.width;
        // ArchDemon floats (bottomMargin = -80), adjust spawn Y to match visible body center
        const startY = this.characterType === 'archdemon'
            ? this.y + this.height * 0.35
            : this.y + this.height / 2 - 20;

        if (this.characterType === 'jotem') {
            this.windProjectiles.push(new BoulderProjectile(this.game, startX, startY, this.facingLeft));
            if (this.game.audio) this.game.audio.playSFX('punch');
        } else if (this.characterType === 'shaia') {
            this.windProjectiles.push(new StaticVoltProjectile(this.game, startX, startY, this.facingLeft));
            if (this.game.audio) this.game.audio.playSFX('shaia_attack');
        } else if (this.characterType === 'archdemon') {
            this.windProjectiles.push(new HellfireProjectile(this.game, startX, startY, this.facingLeft));
            if (this.game.audio) this.game.audio.playSFX('flame_slash');
        } else {
            this.windProjectiles.push(new WindProjectile(this.game, startX, startY, this.facingLeft));
            if (this.game.audio) this.game.audio.playSFX('wind_attack');
        }

        this.windCooldown = this.windCooldownMax;
    }

    fireSlash() {
        const startX = this.facingLeft ? this.x - 40 : this.x + this.width;
        // ArchDemon floats (bottomMargin = -80), adjust spawn Y to match visible body center
        const startY = this.characterType === 'archdemon'
            ? this.y + this.height * 0.35
            : this.y + this.height / 2 - 10;

        if (this.characterType === 'jotem') {
            this.slashProjectiles.push(new FissureSpikesProjectile(this.game, startX, startY, this.facingLeft));
        } else if (this.characterType === 'shaia') {
            this.slashProjectiles.push(new ThunderStrikeProjectile(this.game, startX, startY, this.facingLeft));
            if (this.game.audio) this.game.audio.playSFX('shaia_attack');
        } else if (this.characterType === 'archdemon') {
            this.slashProjectiles.push(new DragonShadowProjectile(this.game, startX, startY, this.facingLeft));
            if (this.game.audio) this.game.audio.playSFX('flame_slash');
        } else {
            this.slashProjectiles.push(new SlashProjectile(this.game, startX, startY, this.facingLeft));
            if (this.game.audio) this.game.audio.playSFX('flame_slash');
        }
    }

    fireNormalAttack() {
        if (this.characterType === 'archdemon') {
            const startX = this.facingLeft ? this.x - 40 : this.x + this.width;
            const startY = this.y + this.height * 0.35;
            this.slashProjectiles.push(new DarkBallProjectile(this.game, startX, startY, this.facingLeft));
        }
    }

    draw(context) {
        context.save();
        if (this.game.portal && this.game.portal.activated) {
            context.globalAlpha = Math.max(0, 1 - this.game.portal.activationTimer / this.game.portal.activationDelay);
        }

        // Draw shadow trails
        this.shadows.forEach(s => {
            context.save();
            if (this.characterType === 'shaia') {
                let shaiaSpriteList;
                if (s.stateName === 'ATTACK') {
                    shaiaSpriteList = this.shaiaSprites['ATTACK_' + (this.activeShaiaAttackCombo || 'COMBO1')];
                } else {
                    shaiaSpriteList = this.shaiaSprites[s.stateName || 'RUNNING'] || this.shaiaSprites.RUNNING;
                }
                const activeFrameImg = shaiaSpriteList[s.frameX] || shaiaSpriteList[0];
                if (s.facingLeft) {
                    context.save();
                    context.scale(-1, 1);
                    window.drawTintedSprite(
                        context, activeFrameImg,
                        0, 0, activeFrameImg.width, activeFrameImg.height,
                        -(s.x + this.width), s.y,
                        this.width, this.height,
                        this.dashHex, s.alpha
                    );
                    context.restore();
                } else {
                    window.drawTintedSprite(
                        context, activeFrameImg,
                        0, 0, activeFrameImg.width, activeFrameImg.height,
                        s.x, s.y,
                        this.width, this.height,
                        this.dashHex, s.alpha
                    );
                }
            } else {
                let drawFrameY = s.frameY;
                if (this.characterType === 'jotem') {
                    const jotemRowMap = { 0: 0, 2: 1, 5: 3, 8: 2, 3: 1, 7: 5, 4: 4 };
                    drawFrameY = jotemRowMap[s.frameY] ?? 0;
                } else if (this.characterType === 'archdemon') {
                    drawFrameY = 0;
                }

                if (s.facingLeft) {
                    context.save();
                    context.scale(-1, 1);
                    window.drawTintedSprite(
                        context, this.image,
                        s.frameX * this.srcWidth, drawFrameY * this.srcHeight,
                        this.srcWidth, this.srcHeight,
                        -(s.x + this.width), s.y,
                        this.width, this.height,
                        this.dashHex, s.alpha
                    );
                    context.restore();
                } else {
                    window.drawTintedSprite(
                        context, this.image,
                        s.frameX * this.srcWidth, drawFrameY * this.srcHeight,
                        this.srcWidth, this.srcHeight,
                        s.x, s.y,
                        this.width, this.height,
                        this.dashHex, s.alpha
                    );
                }
            }
            context.restore();
        });

        // Draw particles (optimized: single save/restore around the loop)
        if (this.particles.length > 0) {
            context.save();
            this.particles.forEach(p => {
                context.globalAlpha = Math.max(0, Math.min(1, p.alpha * context.globalAlpha));
                context.beginPath();
                context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                context.fillStyle = p.color;
                context.fill();
            });
            context.restore();
        }

        this.windProjectiles.forEach(p => p.draw(context));
        this.slashProjectiles.forEach(p => p.draw(context));

        if (this.windCharging && this.windProjImg && this.characterType === 'shinobi') {
            const glowX = this.facingLeft ? this.x - 36 : this.x + this.width - 12;
            const glowY = this.y + this.height / 2 - 24;
            const progress = Math.min(this.windChargeTimer / this.windChargeMax, 1);
            context.save();
            context.globalAlpha = (0.5 + progress * 0.5) * context.globalAlpha;
            context.drawImage(
                this.windProjImg,
                this.windChargeCol * this.windProjSW,
                this.windChargeRow * this.windProjSH,
                this.windProjSW, this.windProjSH,
                glowX, glowY, 48, 48
            );
            context.restore();
        }

        if (this.shieldActive) {
            this._drawShield(context);
        }

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height);
        context.scale(this.facingLeft ? -this.scaleX : this.scaleX, this.scaleY);

        if (this.characterType === 'shaia') {
            let shaiaSpriteList;
            if (this.currentState.state === 'ATTACK') {
                shaiaSpriteList = this.shaiaSprites['ATTACK_' + (this.activeShaiaAttackCombo || 'COMBO1')];
            } else {
                shaiaSpriteList = this.shaiaSprites[this.currentState.state] || this.shaiaSprites.STANDING;
            }
            const activeFrameImg = shaiaSpriteList[this.frameX] || shaiaSpriteList[0];

            if (this.flashTimer > 0) {
                context.drawImage(activeFrameImg, -this.width / 2, -this.height, this.width, this.height);
                window.drawTintedSprite(context, activeFrameImg, 0, 0, activeFrameImg.width, activeFrameImg.height, -this.width / 2, -this.height, this.width, this.height, 'rgba(255, 255, 255, 0.85)', 0.85);
            } else {
                context.drawImage(activeFrameImg, -this.width / 2, -this.height, this.width, this.height);
            }
        } else {
            let drawFrameY = this.frameY;
            if (this.characterType === 'jotem') {
                const jotemRowMap = { 0: 0, 2: 2, 5: 3, 8: 7, 3: 3, 7: 5, 4: 4 };
                drawFrameY = jotemRowMap[this.frameY] ?? 0;
            } else if (this.characterType === 'archdemon') {
                drawFrameY = 0;
            }

            if (this.flashTimer > 0) {
                context.drawImage(this.image, this.frameX * this.srcWidth, drawFrameY * this.srcHeight, this.srcWidth, this.srcHeight, -this.width / 2, -this.height, this.width, this.height);
                window.drawTintedSprite(context, this.image, this.frameX * this.srcWidth, drawFrameY * this.srcHeight, this.srcWidth, this.srcHeight, -this.width / 2, -this.height, this.width, this.height, 'rgba(255, 255, 255, 0.85)', 0.85);
            } else {
                context.drawImage(this.image, this.frameX * this.srcWidth, drawFrameY * this.srcHeight, this.srcWidth, this.srcHeight, -this.width / 2, -this.height, this.width, this.height);
            }
        }
        context.restore();

        context.restore();
    }

    // ── Shield drawing helper — drawn BEFORE sprite so player is inside ──────────
    _drawShield(context) {
        const now = Date.now();

        // Each character: center the shield around the ACTUAL visible body area
        // (sprites are drawn from bottom-up, so body center is roughly 45% from top)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height * 0.42;

        context.save();

        if (this.characterType === 'jotem') {
            // ╔══════════════════════════════════════════╗
            // ║  JOTEM — Stone Fortress Hexagonal Wall   ║
            // ║  Radius: 115 (fits 280×280 body)         ║
            // ╚══════════════════════════════════════════╝
            const r = 115;
            const spin = (now * 0.0006) % (Math.PI * 2);
            const pulse = 1 + 0.04 * Math.sin(now * 0.004);

            context.save();
            context.translate(centerX, centerY);

            // Outer hex glow halo
            context.shadowColor = '#ff8f00';
            context.shadowBlur = 32;
            context.strokeStyle = 'rgba(255, 167, 38, 0.18)';
            context.lineWidth = 18;
            context.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
                const px = Math.cos(a) * (r + 12) * pulse;
                const py = Math.sin(a) * (r + 12) * pulse;
                i === 0 ? context.moveTo(px, py) : context.lineTo(px, py);
            }
            context.closePath();
            context.stroke();

            // Main hex body fill
            context.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 - Math.PI / 6 + spin * 0.12;
                const px = Math.cos(a) * r * pulse;
                const py = Math.sin(a) * r * pulse;
                i === 0 ? context.moveTo(px, py) : context.lineTo(px, py);
            }
            context.closePath();
            const earthGrad = context.createRadialGradient(0, 0, 20, 0, 0, r);
            earthGrad.addColorStop(0, 'rgba(255, 167, 38, 0.06)');
            earthGrad.addColorStop(0.55, 'rgba(109, 76, 65, 0.12)');
            earthGrad.addColorStop(1, 'rgba(255, 143, 0, 0.40)');
            context.fillStyle = earthGrad;
            context.fill();

            // Glowing amber hex border
            context.shadowColor = '#ffab00';
            context.shadowBlur = 22;
            context.strokeStyle = '#ffa726';
            context.lineWidth = 4;
            context.stroke();

            // Inner spinning amber ring
            context.rotate(-spin * 1.8);
            context.shadowBlur = 10;
            context.strokeStyle = 'rgba(255, 193, 7, 0.65)';
            context.lineWidth = 2;
            context.beginPath();
            context.arc(0, 0, r * 0.68, 0, Math.PI * 1.4);
            context.stroke();
            context.beginPath();
            context.arc(0, 0, r * 0.68, Math.PI, Math.PI * 2.4);
            context.stroke();

            // 6 radial cracks from center
            context.shadowBlur = 0;
            context.strokeStyle = 'rgba(255, 130, 0, 0.45)';
            context.lineWidth = 1.5;
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
                context.stroke();
            }
            context.restore();

            // Ground ellipse pulse
            const gAlpha = 0.3 * (0.6 + 0.4 * Math.sin(now * 0.005));
            context.save();
            context.globalAlpha = gAlpha;
            context.shadowColor = '#ff8f00';
            context.shadowBlur = 14;
            context.strokeStyle = '#ffa726';
            context.lineWidth = 2.5;
            context.beginPath();
            context.ellipse(centerX, this.y + this.height, r * 1.6, 22, 0, 0, Math.PI * 2);
            context.stroke();
            context.restore();

        } else if (this.characterType === 'shaia') {
            // ╔══════════════════════════════════════════╗
            // ║  SHAIA — Electric Lightning Cage         ║
            // ║  Radius: 72 (fits 185×185 body)          ║
            // ╚══════════════════════════════════════════╝
            const r = 72;
            const spin = (now * 0.003) % (Math.PI * 2);
            const pulse = 1 + 0.06 * Math.sin(now * 0.009);

            context.save();
            context.translate(centerX, centerY);

            // Electric haze core
            const elecGrad = context.createRadialGradient(0, 0, 12, 0, 0, r);
            elecGrad.addColorStop(0, 'rgba(255, 238, 88, 0.06)');
            elecGrad.addColorStop(0.65, 'rgba(255, 238, 88, 0.13)');
            elecGrad.addColorStop(1, 'rgba(255, 238, 88, 0.38)');
            context.beginPath();
            context.arc(0, 0, r * pulse, 0, Math.PI * 2);
            context.fillStyle = elecGrad;
            context.fill();

            // Outer pulsing ring
            context.shadowColor = '#ffee58';
            context.shadowBlur = 28;
            context.strokeStyle = '#ffee58';
            context.lineWidth = 3;
            context.beginPath();
            context.arc(0, 0, r * pulse, 0, Math.PI * 2);
            context.stroke();

            // Inner dashed ring
            context.shadowBlur = 8;
            context.strokeStyle = 'rgba(255, 249, 196, 0.7)';
            context.lineWidth = 1.5;
            context.setLineDash([8, 6]);
            context.lineDashOffset = -spin * 30;
            context.beginPath();
            context.arc(0, 0, r * 0.78, 0, Math.PI * 2);
            context.stroke();
            context.setLineDash([]);

            // 5 zigzag lightning bolts orbiting the ring
            context.shadowBlur = 16;
            context.strokeStyle = '#fff9c4';
            context.lineWidth = 1.8;
            for (let i = 0; i < 5; i++) {
                const base = spin + (i / 5) * Math.PI * 2;
                const x1 = Math.cos(base) * r;
                const y1 = Math.sin(base) * r;
                const mx = Math.cos(base + 0.28) * (r + 18 * pulse);
                const my = Math.sin(base + 0.28) * (r + 18 * pulse);
                const x2 = Math.cos(base + 0.56) * r;
                const y2 = Math.sin(base + 0.56) * r;
                context.beginPath();
                context.moveTo(x1, y1);
                context.lineTo(mx, my);
                context.lineTo(x2, y2);
                context.stroke();
            }
            context.restore();

        } else if (this.characterType === 'archdemon') {
            // ╔══════════════════════════════════════════╗
            // ║  ARCHDEMON — Void Rift Crimson Barrier   ║
            // ║  Radius: 88 (fits 240×240 body)          ║
            // ╚══════════════════════════════════════════╝
            const r = 88;
            const spin = (now * 0.0018) % (Math.PI * 2);
            const pulse = 1 + 0.05 * Math.sin(now * 0.006);

            context.save();
            context.translate(centerX, centerY);

            // Dark void fill
            const voidGrad = context.createRadialGradient(0, 0, 10, 0, 0, r);
            voidGrad.addColorStop(0, 'rgba(200, 0, 40, 0.06)');
            voidGrad.addColorStop(0.5, 'rgba(90, 0, 20, 0.14)');
            voidGrad.addColorStop(1, 'rgba(255, 34, 68, 0.38)');
            context.beginPath();
            context.arc(0, 0, r * pulse, 0, Math.PI * 2);
            context.fillStyle = voidGrad;
            context.fill();

            // Outer crimson ring
            context.shadowColor = '#ff1744';
            context.shadowBlur = 30;
            context.strokeStyle = '#ff2244';
            context.lineWidth = 3.5;
            context.beginPath();
            context.arc(0, 0, r * pulse, 0, Math.PI * 2);
            context.stroke();

            // 3 counter-rotating inner arcs
            context.rotate(spin);
            context.shadowBlur = 12;
            context.strokeStyle = 'rgba(255, 80, 120, 0.7)';
            context.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const start = (i / 3) * Math.PI * 2;
                context.beginPath();
                context.arc(0, 0, r * 0.74, start, start + Math.PI * 0.6);
                context.stroke();
            }

            // Dark inner ring (counter-direction)
            context.rotate(-spin * 2.5);
            context.shadowBlur = 6;
            context.strokeStyle = 'rgba(255, 34, 68, 0.4)';
            context.lineWidth = 1.5;
            context.setLineDash([5, 8]);
            context.beginPath();
            context.arc(0, 0, r * 0.5, 0, Math.PI * 2);
            context.stroke();
            context.setLineDash([]);
            context.restore();

        } else {
            // ╔══════════════════════════════════════════╗
            // ║  SHINOBI — Plasma Energy Bubble          ║
            // ║  Radius: 58 (fits 95×96 body)            ║
            // ╚══════════════════════════════════════════╝
            const r = 58;
            const pulse = 1 + 0.08 * Math.sin(now * 0.007);
            const spin1 = (now * 0.0018) % (Math.PI * 2);
            const spin2 = -(now * 0.0028) % (Math.PI * 2);

            context.save();
            context.translate(centerX, centerY);

            // Outer halo glow (wide soft ring)
            context.shadowColor = this.shieldHex;
            context.shadowBlur = 40;
            context.strokeStyle = `rgba(${this.shieldColor}, 0.25)`;
            context.lineWidth = 10;
            context.beginPath();
            context.arc(0, 0, (r + 14) * pulse, 0, Math.PI * 2);
            context.stroke();

            // Plasma haze fill
            context.shadowBlur = 0;
            const plasmaGrad = context.createRadialGradient(0, 0, 8, 0, 0, r);
            plasmaGrad.addColorStop(0, `rgba(${this.shieldColor}, 0.10)`);
            plasmaGrad.addColorStop(0.65, `rgba(${this.shieldColor}, 0.22)`);
            plasmaGrad.addColorStop(1, `rgba(${this.shieldColor}, 0.55)`);
            context.beginPath();
            context.arc(0, 0, r * pulse, 0, Math.PI * 2);
            context.fillStyle = plasmaGrad;
            context.fill();

            // Outer glow ring
            context.shadowColor = this.shieldHex;
            context.shadowBlur = 36;
            context.strokeStyle = `rgba(${this.shieldColor}, 0.95)`;
            context.lineWidth = 3.5;
            context.beginPath();
            context.arc(0, 0, r * pulse, 0, Math.PI * 2);
            context.stroke();

            // Inner spinning arc pair (CW)
            context.shadowBlur = 10;
            context.strokeStyle = `rgba(${this.shieldColor}, 0.65)`;
            context.lineWidth = 2.0;
            context.beginPath();
            context.arc(0, 0, r * 0.75, spin1, spin1 + Math.PI * 0.7);
            context.stroke();
            context.beginPath();
            context.arc(0, 0, r * 0.75, spin1 + Math.PI, spin1 + Math.PI * 1.7);
            context.stroke();

            // Outer spinning arc pair (CCW)
            context.strokeStyle = `rgba(${this.shieldColor}, 0.65)`;
            context.beginPath();
            context.arc(0, 0, r + 7, spin2, spin2 + Math.PI * 0.4);
            context.stroke();
            context.beginPath();
            context.arc(0, 0, r + 7, spin2 + Math.PI, spin2 + Math.PI * 1.4);
            context.stroke();

            context.restore();
        }

        context.restore();
    }

    jump() {
        if (this.jumpCount < this.maxJumps) {
            if (this.game.audio) this.game.audio.playSFX('jump');
            this.vy = -8.0;
            this.jumpCount++;
            this.scaleY = 1.18;
            this.scaleX = 0.82;

            // Double jump air ripple
            if (this.jumpCount === 2) {
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    this.particles.push({
                        x: this.x + this.width / 2,
                        y: this.y + this.height - 10,
                        vx: Math.cos(angle) * 3.5,
                        vy: Math.sin(angle) * 1.5,
                        radius: 3 + Math.random() * 2,
                        alpha: 0.9,
                        color: `rgba(${this.shieldColor}, 0.65)`
                    });
                }
            }
        }
    }

    onGround() {
        return this.y >= this.game.height - this.height - this.game.groundMargin - this.bottomMargin;
    }

    setState(state) {
        if (typeof state === 'string') {
            const stringToNum = {
                'STANDING': 0,
                'IDLE': 0,
                'RUNNING': 1,
                'JUMPING': 2,
                'FALLING': 3,
                'ATTACK': 4,
                'SPRINT': 5,
                'DEATH': 6,
                'DAMAGE': 7
            };
            state = stringToNum[state.toUpperCase()] ?? 0;
        }
        this.currentState = this.states[state];
        this.currentState.enter();

        if (this.characterType === 'shaia' && this.currentState.state === 'ATTACK') {
            if (!this.onGround()) {
                this.activeShaiaAttackCombo = 'JUMP';
            } else if (this.speed !== 0 && (this.game.input.keys && this.game.input.keys.includes('Shift'))) {
                this.activeShaiaAttackCombo = 'RUN_KICK';
            } else {
                const pool = ['COMBO1', 'COMBO2', 'COMBO3', 'COMBO4', 'COMBO5', 'CROUCH1', 'CROUCH2'];
                const randIndex = Math.floor(Math.random() * pool.length);
                this.activeShaiaAttackCombo = pool[randIndex];
            }
            this.frameX = 0;
            const currentList = this.shaiaSprites['ATTACK_' + this.activeShaiaAttackCombo] || this.shaiaSprites.STANDING;
            this.maxFrame = Math.max(0, currentList.length - 1);
        } else if ((this.characterType === 'archdemon' || this.characterType === 'jotem') && this.currentState.state === 'ATTACK') {
            this.frameX = 0;
        }
    }

    get takingDamage() {
        return this._takingDamage;
    }
    set takingDamage(value) {
        if (this.shieldActive && value === true) {
            return;
        }
        this._takingDamage = value;
    }
}