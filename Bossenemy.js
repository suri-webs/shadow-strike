import { BossProjectile } from "./bossProjectile.js";
import { BossFireballProjectile, BossGiantFireball, FirePillar, FlameThrowerParticle } from "./bossFireballProjectile.js";
import { StoneProjectile } from "./stoneProjectile.js";

const level1Images = {
    IDLE: [],
    WALK: [],
    ATTACK: [],
    HURT: [],
    DEATH: [],
};

function preloadLevel1Images() {
    for (let i = 1; i <= 6; i++) {
        const img = new Image();
        img.src = `asset/boss-level1/idle/idle_${i}.png`;
        level1Images.IDLE.push(img);
    }
    for (let i = 1; i <= 10; i++) {
        const img = new Image();
        img.src = `asset/boss-level1/walk/walk_${i}.png`;
        level1Images.WALK.push(img);
    }
    for (let i = 1; i <= 14; i++) {
        const img = new Image();
        img.src = `asset/boss-level1/1_atk/1_atk_${i}.png`;
        level1Images.ATTACK.push(img);
    }
    for (let i = 1; i <= 7; i++) {
        const img = new Image();
        img.src = `asset/boss-level1/take_hit/take_hit_${i}.png`;
        level1Images.HURT.push(img);
    }
    for (let i = 1; i <= 16; i++) {
        const img = new Image();
        img.src = `asset/boss-level1/death/death_${i}.png`;
        level1Images.DEATH.push(img);
    }
}
if (typeof window !== 'undefined') {
    preloadLevel1Images();
}

const impalerImages = {
    IDLE: [],
    WALK: [],
    ATTACK1: [],
    ATTACK2: [],
    ATTACK3: [],
    ATTACK4: [],
    ATTACK5: [],
    ATTACK6: [],
    DEATH: [],
};

function preloadImpalerImages() {
    for (let i = 1; i <= 4; i++) {
        const img = new Image();
        img.src = `asset/level-5-bossImpaler/idle/idle${i}.png`;
        impalerImages.IDLE.push(img);
    }
    for (let i = 1; i <= 6; i++) {
        const img = new Image();
        img.src = `asset/level-5-bossImpaler/walk/walk${i}.png`;
        impalerImages.WALK.push(img);
    }
    for (let i = 1; i <= 25; i++) {
        const img = new Image();
        img.src = `asset/level-5-bossImpaler/attack1/atk${i}.png`;
        impalerImages.ATTACK1.push(img);
    }
    for (let i = 1; i <= 8; i++) {
        const img = new Image();
        img.src = `asset/level-5-bossImpaler/attack2/atk${i}.png`;
        impalerImages.ATTACK2.push(img);
    }
    for (let i = 1; i <= 21; i++) {
        const img = new Image();
        img.src = `asset/level-5-bossImpaler/attack3/atk${i}.png`;
        impalerImages.ATTACK3.push(img);
    }
    for (let i = 1; i <= 26; i++) {
        const img = new Image();
        img.src = `asset/level-5-bossImpaler/attack4/atk${i}.png`;
        impalerImages.ATTACK4.push(img);
    }
    for (let i = 1; i <= 29; i++) {
        const img = new Image();
        img.src = `asset/level-5-bossImpaler/attack5/atk${i}.png`;
        impalerImages.ATTACK5.push(img);
    }
    for (let i = 1; i <= 20; i++) {
        const img = new Image();
        img.src = `asset/level-5-bossImpaler/attack6/atk${i}.png`;
        impalerImages.ATTACK6.push(img);
    }
    for (let i = 1; i <= 25; i++) {
        const img = new Image();
        img.src = `asset/level-5-bossImpaler/death/dth${i}.png`;
        impalerImages.DEATH.push(img);
    }
}
if (typeof window !== 'undefined') {
    preloadImpalerImages();
}

export class BossEnemy {

    constructor(game, bossType = 'demon_lord') {

        this.game = game;
        this.bossType = bossType;
        this.enemyType = bossType;
        this.isBoss = true;

        this.width = 320;
        this.height = 320;

        this.x = game.width + 200;
        this.hasEnteredScreen = this.game.isMultiplayer ? true : false;

        this.baseY =
            game.height -
            this.height -
            game.groundMargin + 10;
        this.y = this.baseY;

        const hpMap = {
            'impaler': 500,
            'mecha_stone': 450,
            'crystal_titan': 600,
            'storm_seraph': 750,
            'frost_wyrm': 900,
            'abyss_knight': 1200,
            'amarjeet': 3000
        };
        this.maxHP = hpMap[bossType] || 400;
        this.currentHP = this.maxHP;
        this.phase = 1;

        this.surpriseCooldown = 0;
        this.surpriseCooldownMax = 6000;
        this.teleportAlpha = 1;
        this.teleportPhase = 0;

        this.velocityX = 0;
        this.facingLeft = true;

        this.state = 'IDLE';
        this.frameX = 0;
        this.frameTimer = 0;
        this.fps = 14;
        this.frameInterval = 1000 / this.fps;

        this.useSpritesheet = (bossType === 'demon_lord' || bossType === 'mecha_stone' || bossType === 'crystal_titan' || bossType === 'storm_seraph');

        if (this.bossType === 'demon_lord') {
            this.frameCounts = {
                IDLE: 4,
                WALK: 8,
                ATTACK: 16,
                HURT: 5,
                DEATH: 36,
            };
            this.frameSizes = {
                IDLE: { w: 74, h: 74 },
                WALK: { w: 74, h: 74 },
                ATTACK: { w: 90, h: 70 },
                HURT: { w: 130, h: 130 },
                DEATH: { w: 160, h: 160 },
            };
            this.images = {
                IDLE: document.getElementById('dragonLordIdle'),
                WALK: document.getElementById('dragonLordWalk'),
                ATTACK: document.getElementById('dragonLordAttack'),
                HURT: document.getElementById('dragonLordHurt'),
                DEATH: document.getElementById('dragonLordDeath'),
            };
            this.deathAlpha = 1;
        } else if (this.bossType === 'mecha_stone') {
            this.frameCounts = {
                IDLE: 4,
                WALK: 8,
                ATTACK: 9,
                HURT: 7,
                DEATH: 8,
            };
            this.frameSizes = {
                IDLE: { w: 100, h: 100 },
                WALK: { w: 100, h: 100 },
                ATTACK: { w: 100, h: 100 },
                HURT: { w: 100, h: 100 },
                DEATH: { w: 100, h: 100 },
            };
            const mechaImg = document.getElementById('mechaStone');
            this.images = {
                IDLE: mechaImg,
                WALK: mechaImg,
                ATTACK: mechaImg,
                HURT: mechaImg,
                DEATH: mechaImg,
            };
            this.deathAlpha = 1;
        } else if (this.bossType === 'impaler') {
            this.frameCounts = {
                IDLE: 4,
                WALK: 6,
                ATTACK: 25,
                HURT: 4,
                DEATH: 25,
            };
            this.frames = {
                IDLE: impalerImages.IDLE,
                WALK: impalerImages.WALK,
                ATTACK: impalerImages.ATTACK1,
                HURT: impalerImages.IDLE,
                DEATH: impalerImages.DEATH,
            };
            this.deathAlpha = 1;
            this.MELEE_FRAME = 12;
            this.PROJECTILE_FRAME = 12;
            this.meleeRange = 380;
            this.meleeThreshold = 400;
            this.baseY = this.game.height - this.height - 95 + 30;
            this.y = this.baseY;
        } else if (this.bossType === 'crystal_titan') {
            this.frameCounts = { IDLE: 4, WALK: 8, ATTACK: 9, HURT: 7, DEATH: 8 };
            this.frameSizes = { IDLE: { w: 100, h: 100 }, WALK: { w: 100, h: 100 }, ATTACK: { w: 100, h: 100 }, HURT: { w: 100, h: 100 }, DEATH: { w: 100, h: 100 } };
            const mechaImg = document.getElementById('mechaStone');
            this.images = { IDLE: mechaImg, WALK: mechaImg, ATTACK: mechaImg, HURT: mechaImg, DEATH: mechaImg };
            this.deathAlpha = 1;
            this.bossColorTint = 'rgba(0, 255, 255, 0.6)';
            this.scale = 1.3;
            this.MELEE_FRAME = 6;
            this.PROJECTILE_FRAME = 5;
        } else if (this.bossType === 'storm_seraph') {
            this.frameCounts = { IDLE: 4, WALK: 8, ATTACK: 16, HURT: 5, DEATH: 36 };
            this.frameSizes = { IDLE: { w: 74, h: 74 }, WALK: { w: 74, h: 74 }, ATTACK: { w: 90, h: 70 }, HURT: { w: 130, h: 130 }, DEATH: { w: 160, h: 160 } };
            this.images = {
                IDLE: document.getElementById('dragonLordIdle'),
                WALK: document.getElementById('dragonLordWalk'),
                ATTACK: document.getElementById('dragonLordAttack'),
                HURT: document.getElementById('dragonLordHurt'),
                DEATH: document.getElementById('dragonLordDeath'),
            };
            this.deathAlpha = 1;
            this.bossColorTint = 'rgba(255, 180, 0, 0.5)';
            this.scale = 1.2;
        } else if (this.bossType === 'frost_wyrm') {
            this.frameCounts = { IDLE: 6, WALK: 12, ATTACK: 14, HURT: 7, DEATH: 16 };
            this.frames = level1Images;
            this.deathAlpha = 1;
            this.bossColorTint = 'rgba(100, 150, 255, 0.6)';
            this.scale = 1.4;
        } else if (this.bossType === 'abyss_knight') {
            this.frameCounts = { IDLE: 4, WALK: 6, ATTACK: 25, HURT: 4, DEATH: 25 };
            this.frames = {
                IDLE: impalerImages.IDLE,
                WALK: impalerImages.WALK,
                ATTACK: impalerImages.ATTACK4, // use a different attack animation
                HURT: impalerImages.IDLE,
                DEATH: impalerImages.DEATH,
            };
            this.deathAlpha = 1;
            this.bossColorTint = 'rgba(255, 0, 50, 0.6)';
            this.scale = 1.25;
            this.MELEE_FRAME = 12;
            this.PROJECTILE_FRAME = 12;
            this.meleeRange = 380;
            this.meleeThreshold = 400;
        } else if (this.bossType === 'amarjeet') {
            this.frameCounts = { IDLE: 6, WALK: 12, ATTACK: 14, HURT: 7, DEATH: 16 };
            this.frames = level1Images;
            this.deathAlpha = 1;
            this.bossColorTint = 'rgba(10, 0, 20, 0.9)'; // Dark singularity tint
            this.scale = 0.65;
            this.isAmarjeet = true;
            this.amarjeetPhase = 1; // 1: Broken Guardian, 2: Devourer, 3: Singularity
            this.attackCooldown = 3200;
            this.attackCooldownPhase2 = 2200;
        } else {
            this.frameCounts = {
                IDLE: 6,
                WALK: 12,
                ATTACK: 14,
                HURT: 7,
                DEATH: 16,
            };
            this.frames = level1Images;
            this.deathAlpha = 1;
        }

        this.projectiles = [];
        this.attackTimer = 0;
        this.attackCooldown = 1200;
        this.attackCooldownPhase2 = 700;

        this.pendingAttackType = 'melee';

        this.MELEE_FRAME = 9;
        this.PROJECTILE_FRAME = 8;
        this.hasMeleeHit = false;
        this.hasShot = false;

        this.meleeThreshold = 350;

        this.meleeDamage = 25;
        this.meleeDamagePhase2 = 40;
        this.projDamage = 15;
        this.projDamagePhase2 = 28;

        this.hurtTimer = 0;
        this.hurtDuration = 300;
        this.invuln = 0;
        this.invulnDuration = 700;
        this.comeCloserCooldown = 0;

        this.markedForDeletion = false;
        this.flashTimer = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.shadows = [];

        this.meleeRange = 240;

        // Re-apply impaler-specific overrides (global defaults above overwrite the per-boss values)
        if (this.bossType === 'impaler') {
            this.meleeThreshold = 280; // only attack when visually close
            this.meleeRange = 380;
            this.MELEE_FRAME = 12;
            this.PROJECTILE_FRAME = 12;
            this.baseY = game.height - this.height - game.groundMargin + 10;
            this.y = this.baseY;
        }

        // Override baseY and y for level 1 boss and frost wyrm to fix floating margin issue
        if (this.bossType === 'boss_level_1' || this.bossType === 'frost_wyrm') {
            this.baseY = game.height - this.height - game.groundMargin + 50;
            this.y = this.baseY;
        }
    }

    _rr(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    get _currentImg() {
        if (this.useSpritesheet) {
            return this.images[this.state];
        } else {
            const arr = this.frames[this.state];
            return arr ? arr[Math.min(this.frameX, arr.length - 1)] : null;
        }
    }

    _setState(next) {
        if (this.state === next) return;
        this.state = next;
        this.frameX = 0;
        this.frameTimer = 0;
        this.hasShot = false;
        this.hasMeleeHit = false;
    }

    get _cooldown() {
        return this.phase === 2 ? this.attackCooldownPhase2 : this.attackCooldown;
    }

    get _isOnScreen() {
        return this.x < this.game.width && this.x + this.width > 0;
    }

    _distToPlayer() {
        // Nearest player in multiplayer
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const bossCenter = this.x + this.width / 2;
        const playerCenter = player.x + player.width / 2;
        return Math.abs(bossCenter - playerCenter);
    }

    _prepareImpalerAttack(currentDist) {
        this.pendingAttackType = 'melee'; // always melee (no canvas projectiles)
        const rand = Math.floor(Math.random() * 6) + 1;
        if (rand === 1) {
            this.frames.ATTACK = impalerImages.ATTACK1;
            this.frameCounts.ATTACK = 25;
            this.MELEE_FRAME = 12;
        } else if (rand === 2) {
            this.frames.ATTACK = impalerImages.ATTACK2;
            this.frameCounts.ATTACK = 8;
            this.MELEE_FRAME = 4;
        } else if (rand === 3) {
            this.frames.ATTACK = impalerImages.ATTACK3;
            this.frameCounts.ATTACK = 21;
            this.MELEE_FRAME = 10;
        } else if (rand === 4) {
            this.frames.ATTACK = impalerImages.ATTACK4;
            this.frameCounts.ATTACK = 26;
            this.MELEE_FRAME = 13;
        } else if (rand === 5) {
            this.frames.ATTACK = impalerImages.ATTACK5;
            this.frameCounts.ATTACK = 29;
            this.MELEE_FRAME = 14;
        } else {
            this.frames.ATTACK = impalerImages.ATTACK6;
            this.frameCounts.ATTACK = 20;
            this.MELEE_FRAME = 10;
        }
    }

    _meleeHitCheck() {
        // In multiplayer, check against all players
        const playersToCheck = (this.game.isMultiplayer && this.game.players && this.game.players.size > 1)
            ? [...this.game.players.values()]
            : [this.game.player];

        const hitX = this.facingLeft
            ? this.x - this.meleeRange + this.width * 0.3
            : this.x + this.width * 0.7;
        const hitW = this.meleeRange;
        const hitY = this.y + this.height * 0.3;
        const hitH = this.height * 0.5;

        for (const player of playersToCheck) {
            if (!player || player.isDead) continue;
            const overlaps =
                hitX < player.x + player.width &&
                hitX + hitW > player.x &&
                hitY < player.y + player.height &&
                hitY + hitH > player.y;

            if (overlaps) {
                const dmg = this.phase === 2 ? this.meleeDamagePhase2 : this.meleeDamage;
                if (typeof this.game.hurtTargetPlayer === 'function') {
                    this.game.hurtTargetPlayer(player, dmg, true);
                } else if (player === this.game.player) {
                    this.game.hurtPlayer(dmg, true);
                }
                break;
            }
        }
    }

    _fireBurst(dmg) {
        // Aim at nearest player in multiplayer
        const player = (this.game.getTargetPlayer)
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = player.x + player.width / 2 - cx;
        const dy = player.y + player.height / 2 - cy;
        const angle = Math.atan2(dy, dx);
        const damage = dmg !== undefined ? dmg : (this.phase === 2 ? this.projDamagePhase2 : this.projDamage);
        let speed = this.phase === 2 ? 16 : 16;

        if (this.isAmarjeet) {
            speed = this.phase === 2 ? 3.5 : 2.5;
        }

        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);

        const forward = 32;
        const spread = 28;
        const points = [
            { x: cx + dirX * forward, y: cy + dirY * forward },
            { x: cx - dirX * forward + perpX * spread, y: cy - dirY * forward + perpY * spread },
            { x: cx - dirX * forward - perpX * spread, y: cy - dirY * forward - perpY * spread }
        ];

        // mecha_stone fires stones; other bosses fire energy projectiles (impaler never calls this)
        const ProjClass = this.bossType === 'mecha_stone' ? StoneProjectile : BossProjectile;

        points.forEach(pt => {
            const proj = new ProjClass(
                this.game,
                pt.x, pt.y,
                dirX, dirY,
                speed,
                damage
            );
            if (this.isAmarjeet) {
                proj.isBlackHole = true;
                proj.radius = 15;
            }
            this.projectiles.push(proj);
        });
    }

    _fireFireball(dmg) {
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = player.x + player.width / 2 - cx;
        const dy = player.y + player.height / 2 - cy;
        const angle = Math.atan2(dy, dx);
        const damage = dmg !== undefined ? dmg : (this.phase === 2 ? this.projDamagePhase2 + 5 : this.projDamage + 5);
        let speed = this.phase === 2 ? 28 : 22;

        if (this.isAmarjeet) {
            speed = this.phase === 2 ? 2.8 : 2.0;
        }

        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);

        const proj = new BossFireballProjectile(
            this.game,
            cx + dirX * 40, cy + dirY * 40,
            dirX, dirY,
            speed,
            damage
        );
        if (this.isAmarjeet) {
            proj.isBlackHole = true;
            proj.radius = 15;
        }
        this.projectiles.push(proj);
    }

    _fireGiantFireball() {
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const scale = this.isAmarjeet ? (this.scale || 1) : 1;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height - (this.height * scale) / 2;
        const dx = player.x + player.width / 2 - cx;
        const dy = player.y + player.height / 2 - cy;
        const angle = Math.atan2(dy, dx);
        const damage = this.phase === 2 ? 45 : 35;
        let speed = this.phase === 2 ? 14 : 10;

        if (this.isAmarjeet) {
            speed = this.phase === 2 ? 2.8 : 2.0; // Slow down the black hole projectile speed for Amarjeet!
        }

        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);

        const proj = new BossGiantFireball(
            this.game,
            cx + dirX * (this.width * scale * 0.25), cy + dirY * (this.height * scale * 0.25),
            dirX, dirY,
            speed,
            damage
        );
        if (this.isAmarjeet) {
            proj.isBlackHole = true;
            proj.radius = 15; // Scale down the black hole radius for Amarjeet to make it smaller (from 40 to 15)!
        }
        this.projectiles.push(proj);
    }

    _summonFirePillars() {
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const px = player.x + player.width / 2;
        const groundY = this.game.height - this.game.groundMargin;

        this.projectiles.push(new FirePillar(this.game, px, groundY, 700, 20));
        this.projectiles.push(new FirePillar(this.game, px - 180, groundY, 900, 20));
        this.projectiles.push(new FirePillar(this.game, px + 180, groundY, 900, 20));
    }

    _fireSingleBlue() {
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = player.x + player.width / 2 - cx;
        const dy = player.y + player.height / 2 - cy;
        const angle = Math.atan2(dy, dx);
        const damage = this.phase === 2 ? this.projDamagePhase2 : this.projDamage;
        const speed = this.phase === 2 ? 24 : 18;

        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);

        this.projectiles.push(
            new BossProjectile(
                this.game,
                cx + dirX * 35, cy + dirY * 35,
                dirX, dirY,
                speed,
                damage
            )
        );
    }

    _fireSingleDiamond() {
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = player.x + player.width / 2 - cx;
        const dy = player.y + player.height / 2 - cy;
        const angle = Math.atan2(dy, dx);
        const damage = this.phase === 2 ? this.projDamagePhase2 + 5 : this.projDamage + 5;
        const speed = this.phase === 2 ? 25 : 19;

        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);

        this.projectiles.push(
            new StoneProjectile(
                this.game,
                cx + dirX * 35, cy + dirY * 35,
                dirX, dirY,
                speed,
                damage
            )
        );
    }

    _fireFlameThrower() {
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const cx = this.x + (this.facingLeft ? this.width * 0.2 : this.width * 0.8);
        const cy = this.y + this.height * 0.38;
        const dx = this.facingLeft ? -1 : 1;
        const dy = (player.y + player.height / 2 - cy) / (Math.abs(player.x - cx) || 1);

        for (let i = 0; i < 2; i++) {
            this.projectiles.push(
                new FlameThrowerParticle(
                    this.game,
                    cx, cy,
                    dx, dy,
                    this.phase === 2 ? 18.0 : 14.0,
                    this.phase === 2 ? 4 : 3
                )
            );
        }
    }

    takeDamage(amount) {
        if (this.state === 'DEATH' || this.invuln > 0) return;
        if (!this.hasEnteredScreen && !this.game.isMultiplayer) return;

        const dist = this._distToPlayer();
        if (dist > 350 && this.comeCloserCooldown <= 0) {
            this.comeCloserCooldown = 4000; // 4 seconds cooldown
            if (this.game.audio) {
                this.game.audio.playSFX('come_closer');
            }
        }

        this.invuln = this.invulnDuration;
        this.currentHP -= amount;
        this.flashTimer = 150;
        this.scaleX = 1.15;
        this.scaleY = 0.85;

        if (this.game && typeof this.game.spawnDamageText === 'function') {
            this.game.spawnDamageText(this.x + this.width / 2, this.y + this.height * 0.3, amount);
        }

        if (this.game && this.game.isMultiplayer && !this.game.isHost && this.game.socket) {
            const damageId = Math.random().toString(36).substring(2, 11);
            this.game.socket.emit('enemyDamage', { enemyId: this.id, damage: amount, damageId });
            this.game.socket.emit('applyEnemyDamage', { enemyId: this.id, damage: amount, damageId });
        }

        if (this.currentHP <= 0) {
            this.currentHP = 0;

            if (this.isAmarjeet && !this.qteTriggered) {
                this.qteTriggered = true;
                this.currentHP = 1; // Keep alive at 1 HP during QTE
                this.invuln = 999999;
                this._setState('IDLE');

                // Show QTE Overlay
                const qteOverlay = document.getElementById('qte-overlay');
                if (qteOverlay) {
                    qteOverlay.style.display = 'flex';
                    window.dispatchEvent(new CustomEvent('amarjeet-qte-start'));
                }
                return;
            }

            this._setState('DEATH');
            if (!this.game.gameOver) this.game.shake = 300;
            this.game.spawnDissolveParticles(this);
            return;
        }

        if (this.surpriseCooldown <= 0 && this.state !== 'TELEPORT' && this.state !== 'ATTACK') {
            const dist = this._distToPlayer();
            if (dist > 400) {
                this.surpriseCooldown = this.surpriseCooldownMax;
                this._setState('TELEPORT');
                this.teleportPhase = 0;
                this.teleportAlpha = 1;
                return;
            }
        }

        if (this.isAmarjeet) {
            if (this.amarjeetPhase === 1 && this.currentHP <= 1800) {
                this.amarjeetPhase = 2;
                this.phase = 2;
                this.game.shake = 300;
                this.bossColorTint = 'rgba(255, 0, 0, 0.8)'; // Crimson Devourer
                this.scale = 0.8;
                this._summonFirePillars();
                this._fireGiantFireball();
            } else if (this.amarjeetPhase === 2 && this.currentHP <= 900) {
                this.amarjeetPhase = 3;
                this.game.shake = 400;
                this.bossColorTint = 'rgba(0, 0, 0, 1.0)'; // Singularity pure black
                this.scale = 0.95;
                this.projDamagePhase2 = 45; // Singularity hits hard
                this._summonFirePillars();
                this._fireBurst(this.projDamagePhase2);
            }
        } else if (this.phase === 1 && this.currentHP <= this.maxHP / 2) {
            this.phase = 2;
            this.game.shake = 250;
            if (this.bossType === 'demon_lord') {
                this._fireGiantFireball();
                this._summonFirePillars();
            } else {
                this._fireBurst(this.projDamagePhase2);
            }
        }

        if (this.state !== 'ATTACK') {
            this._setState('HURT');
            this.hurtTimer = 0;
        }
    }

    update(deltaTime) {
        this.x -= this.game.scrollSpeed || 0;
        if (this.invuln > 0) this.invuln -= deltaTime;
        if (this.flashTimer > 0) this.flashTimer -= deltaTime;
        if (this.surpriseCooldown > 0) this.surpriseCooldown -= deltaTime;
        if (this.comeCloserCooldown > 0) this.comeCloserCooldown -= deltaTime;

        this.shadows.forEach(s => s.alpha -= deltaTime * 0.0035);
        this.shadows = this.shadows.filter(s => s.alpha > 0);

        if (this.phase === 2 && this.state === 'WALK' && Math.abs(this.velocityX) > 1.2 && Math.random() < 0.3) {
            this.shadows.push({
                x: this.x,
                y: this.y,
                frameX: this.frameX,
                alpha: 0.5,
                facingLeft: this.facingLeft
            });
        }

        const easeSpd = 0.08 * (deltaTime / 16.6);
        this.scaleX += (1 - this.scaleX) * easeSpd;
        this.scaleY += (1 - this.scaleY) * easeSpd;

        if (this.game.isMultiplayer && !this.game.isHost) {
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                const totalFrames = this.frameCounts[this.state] || 1;
                this.frameX = (this.frameX + 1) % totalFrames;
            }
            // Guest client collision checking (Melee damage is handled authoritatively by host)
            if (this.bossType !== 'impaler') {
                this.projectiles.forEach(p => p.update(deltaTime));
                this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
            }
            return;
        }

        if (this.phase === 2 && this.state !== 'DEATH' && Math.random() < 0.12) {
            const colorType = this.bossType === 'demon_lord' ? 'orange' : (this.bossType === 'impaler' ? 'green' : 'cyan');
            this.game.spawnHitSparks(this.x + this.width / 2 + (Math.random() - 0.5) * this.width * 0.4, this.y + this.height - 20, colorType);
        }

        if (!this.hasEnteredScreen && this.x <= this.game.width * 0.95) {
            this.hasEnteredScreen = true;
            if (this.bossType === 'demon_lord' && this.game.audio) {
                this.game.audio.playSFX('oni_voice');
            }
        }

        // Impaler (level 5) uses no canvas projectiles — only melee
        if (this.bossType !== 'impaler') {
            this.projectiles.forEach(p => p.update(deltaTime));
            this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        }

        // ── Boss Intro Sequence: dheere aao, 4 sec ruko, roar karo, tab attack ──
        if (this.introLocked) {
            // Boss dheere dheere chale screen mein (slow walk)
            if (this.x > this.game.width - this.width - 80) {
                this.x -= 1.5 * (deltaTime / 16.6);
                this._setState('WALK');
                // Jab tak boss walk kar raha hai, shake hoti rahe
                this.game.shake = Math.max(this.game.shake, 18);
            } else {
                // Position par aa gaya, ab IDLE mein ruko
                this._setState('IDLE');
                this.introTimer = (this.introTimer || 0) + deltaTime;

                if (!this.introRoarPlayed && this.introTimer >= this.introDuration) {
                    this.introRoarPlayed = true;
                    if (this.game.audio) {
                        // Roar bajao — khatam hote hi boss intro music band karo aur attack shuru
                        this.game.audio.playSFXWithEnded('boss_roar', () => {
                            this.game.audio.stopBossIntro();
                            this.introLocked = false;
                            this.attackTimer = 0;
                        });
                    } else {
                        // Audio nahi hai toh seedha unlock
                        this.introLocked = false;
                        this.attackTimer = 0;
                    }
                    this.game.shake = 300;
                }
            }

            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                this.frameX = (this.frameX + 1) % (this.frameCounts[this.state] || 1);
            }
            return;
        }

        if (this.state === 'TELEPORT') {
            // Target nearest player in multiplayer
            const player = this.game.getTargetPlayer
                ? this.game.getTargetPlayer(this.x + this.width / 2)
                : this.game.player;
            const speed = deltaTime / 16.6;

            if (this.teleportPhase === 0) {
                // Fade out + shrink
                this.teleportAlpha -= 0.07 * speed;
                this.scaleX += (0 - this.scaleX) * 0.18 * speed;
                this.scaleY += (0 - this.scaleY) * 0.18 * speed;

                if (this.teleportAlpha <= 0) {
                    this.teleportAlpha = 0;
                    this.teleportPhase = 1;

                    // Departure particles
                    for (let i = 0; i < 18; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const spd = Math.random() * 8 + 3;
                        this.game.particles.push({
                            x: this.x + this.width / 2 + (Math.random() - 0.5) * 60,
                            y: this.y + this.height / 2 + (Math.random() - 0.5) * 60,
                            vx: Math.cos(angle) * spd,
                            vy: Math.sin(angle) * spd - 2,
                            size: Math.random() * 9 + 4,
                            alpha: 0.9,
                            color: 'rgba(160, 60, 255, 0.85)',
                            type: 'spark',
                            decay: 0.88,
                            gravity: 0.05
                        });
                    }

                    // Reposition
                    const offset = 150;
                    if (player.facingLeft) {
                        this.x = player.x + player.width + offset;
                    } else {
                        this.x = player.x - this.width - offset;
                    }
                    this.facingLeft = !player.facingLeft;

                    this.scaleX = 0;
                    this.scaleY = 0;

                    // Arrival particles
                    for (let i = 0; i < 22; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const spd = Math.random() * 10 + 4;
                        this.game.particles.push({
                            x: this.x + this.width / 2 + (Math.random() - 0.5) * 40,
                            y: this.y + this.height / 2 + (Math.random() - 0.5) * 40,
                            vx: Math.cos(angle) * spd,
                            vy: Math.sin(angle) * spd - 3,
                            size: Math.random() * 11 + 5,
                            alpha: 1.0,
                            color: 'rgba(200, 100, 255, 0.9)',
                            type: 'spark',
                            decay: 0.87,
                            gravity: 0.04
                        });
                    }
                    this.game.shake = Math.max(this.game.shake, 80);
                    this.teleportTintTimer = 200;
                }
            } else if (this.teleportPhase === 1) {
                // Fade in + overshoot scale
                this.teleportAlpha += 0.10 * speed;
                const targetScale = 1.25;
                this.scaleX += (targetScale - this.scaleX) * 0.22 * speed;
                this.scaleY += (targetScale - this.scaleY) * 0.22 * speed;

                if (this.teleportAlpha >= 1) {
                    this.teleportAlpha = 1;
                    // Pick the attack animation AFTER reappearing so it attacks immediately
                    if (this.isAmarjeet) {
                        this.pendingAttackType = 'giant_fireball';
                    } else if (this.bossType === 'impaler') {
                        this._prepareImpalerAttack(0);
                    } else {
                        this.pendingAttackType = 'melee';
                    }
                    this.attackTimer = 0;
                    this._setState('ATTACK');
                }
            }

            if (this.teleportTintTimer > 0) this.teleportTintTimer -= deltaTime;
            return;
        }

        if (this.state === 'DEATH') {
            // Both spritesheet and frame-by-frame: fade out after last frame
            if (this.frameX >= this.frameCounts.DEATH - 1) {
                this.deathAlpha -= 0.015;
                if (this.deathAlpha <= 0) {
                    this.deathAlpha = 0;
                    this.markedForDeletion = true;
                }
                return;
            }

            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.frameCounts.DEATH - 1) {
                    this.frameX++;
                }
            }
            return;
        }

        // Get nearest player for AI facing and movement (multiplayer-aware)
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;

        this.facingLeft = player.x + player.width / 2 < this.x + this.width / 2;

        if (this.state === 'HURT') {
            this.hurtTimer += deltaTime;
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.frameCounts.HURT - 1) this.frameX++;
            }
            if (this.hasEnteredScreen) {
                this.attackTimer += deltaTime;
                if (this.attackTimer >= this._cooldown) {
                    const currentDist = this._distToPlayer();
                    if (this.isAmarjeet) {
                        this.pendingAttackType = 'giant_fireball';
                    } else if (this.bossType === 'impaler') {
                        this._prepareImpalerAttack(currentDist);
                    } else if (currentDist <= this.meleeThreshold) {
                        this.pendingAttackType = 'melee';
                    } else {
                        if (this.bossType === 'demon_lord') {
                            const r = Math.random();
                            if (r < 0.28) this.pendingAttackType = 'fireball';
                            else if (r < 0.52) this.pendingAttackType = 'giant_fireball';
                            else if (r < 0.75) this.pendingAttackType = 'fire_pillars';
                            else this.pendingAttackType = 'flamethrower';
                        } else if (this.bossType === 'mecha_stone') {
                            this.pendingAttackType = Math.random() < 0.5 ? 'single_diamond' : 'triangle_diamond';
                        } else {
                            this.pendingAttackType = Math.random() < 0.5 ? 'single_blue' : 'triangle_blue';
                        }
                    }
                    this._setState('ATTACK');
                    return;
                }
            }
            if (this.hurtTimer >= this.hurtDuration) this._setState('IDLE');
            return;
        }

        if (this.state === 'ATTACK') {
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;

                if (this.pendingAttackType === 'melee') {

                    if (this.frameX === this.MELEE_FRAME && !this.hasMeleeHit) {
                        this.hasMeleeHit = true;
                        this._meleeHitCheck();
                        this.game.shake = 70;
                        this.scaleY = 0.75;
                        this.scaleX = 1.25;
                        for (let i = 0; i < 15; i++) {
                            const angle = Math.PI + Math.random() * Math.PI;
                            const speed = Math.random() * 6 + 2;
                            this.game.particles.push({
                                x: this.x + this.width / 2 + (Math.random() - 0.5) * 80,
                                y: this.y + this.height - 20,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed - 2,
                                size: Math.random() * 6 + 3,
                                alpha: 0.8,
                                color: 'rgba(150, 150, 150, 0.45)',
                                type: 'circle',
                                decay: 0.94,
                                gravity: 0.15
                            });
                        }
                    }
                } else if (this.pendingAttackType === 'single_blue') {

                    if (this.frameX === this.PROJECTILE_FRAME && !this.hasShot) {
                        this.hasShot = true;
                        this._fireSingleBlue();
                        this.game.shake = 60;
                    }
                } else if (this.pendingAttackType === 'triangle_blue') {

                    if (this.frameX === this.PROJECTILE_FRAME && !this.hasShot) {
                        this.hasShot = true;
                        this._fireBurst();
                        this.game.shake = 95;
                    }
                } else if (this.pendingAttackType === 'single_diamond') {

                    if (this.frameX === this.PROJECTILE_FRAME && !this.hasShot) {
                        this.hasShot = true;
                        this._fireSingleDiamond();
                        this.game.shake = 70;
                    }
                } else if (this.pendingAttackType === 'triangle_diamond') {

                    if (this.frameX === this.PROJECTILE_FRAME && !this.hasShot) {
                        this.hasShot = true;
                        this._fireBurst();
                        this.game.shake = 100;
                    }
                } else if (this.pendingAttackType === 'fireball') {

                    if (this.frameX === this.PROJECTILE_FRAME && !this.hasShot) {
                        this.hasShot = true;
                        this._fireFireball();
                        this.game.shake = 130;
                    }
                } else if (this.pendingAttackType === 'giant_fireball') {

                    if (this.frameX === this.PROJECTILE_FRAME && !this.hasShot) {
                        this.hasShot = true;
                        this._fireGiantFireball();
                        this.game.shake = 220;
                    }
                } else if (this.pendingAttackType === 'fire_pillars') {

                    if (this.frameX === this.PROJECTILE_FRAME && !this.hasShot) {
                        this.hasShot = true;
                        this._summonFirePillars();
                        this.game.shake = 160;
                    }
                } else if (this.pendingAttackType === 'flamethrower') {
                    if (this.frameX >= 6 && this.frameX <= 12) {
                        this._fireFlameThrower();
                        if (this.frameX === 6 && !this.hasShot) {
                            this.hasShot = true;
                            this.game.shake = 100;
                        }
                    }
                }

                if (this.frameX < this.frameCounts.ATTACK - 1) {
                    this.frameX++;
                } else {
                    this._setState('IDLE');
                    this.attackTimer = 0;
                }
            }
            return;
        }


        const dist = this._distToPlayer();
        const isClose = dist < this.meleeThreshold;

        const targetX = player.x + player.width / 2 - this.width / 2 - (isClose ? 200 : 250);
        const gap = targetX - this.x;
        const dir = gap > 0 ? 1 : -1;

        if (Math.abs(gap) > 25) {
            this.velocityX += dir * 0.12;
        } else {
            this.velocityX *= 0.75;
        }
        this.velocityX *= 0.88;
        this.x += this.velocityX * deltaTime * 0.06;

        // ── Boundary clamp: boss screen se bahar nahi jayega (right edge only, left edge allows offscreen) ──
        const minX = -this.width - 50;                 // allow fully offscreen left
        const maxX = this.game.width - this.width * 0.7; // right edge: thoda andar
        if (this.x < minX) {
            this.x = minX;
            this.velocityX = Math.abs(this.velocityX) * 0.3; // bounce back
        }
        if (this.x > maxX) {
            this.x = maxX;
            this.velocityX = -Math.abs(this.velocityX) * 0.3; // bounce back
        }

        if (Math.abs(this.velocityX) > 0.5) {
            if (this.state !== 'WALK') this._setState('WALK');
        } else {
            if (this.state !== 'IDLE') this._setState('IDLE');
        }

        this.y = this.baseY;

        if (this.hasEnteredScreen) {
            this.attackTimer += deltaTime;
            if (this.attackTimer >= this._cooldown) {
                this.attackTimer = 0;
                const currentDist = this._distToPlayer();

                if (this.isAmarjeet) {
                    this.pendingAttackType = 'giant_fireball';
                    this._setState('ATTACK');
                } else if (this.bossType === 'impaler') {
                    // Impaler: only attack when close. If far → teleport first, then attack.
                    if (currentDist <= this.meleeThreshold) {
                        this._prepareImpalerAttack(currentDist);
                        this._setState('ATTACK');
                    } else {
                        // Teleport next to player, attack will fire after reappearing
                        this.teleportPhase = 0;
                        this.teleportAlpha = 1;
                        this._setState('TELEPORT');
                    }
                } else if (currentDist <= this.meleeThreshold) {
                    this.pendingAttackType = 'melee';
                    this._setState('ATTACK');
                } else {
                    if (this.bossType === 'demon_lord') {
                        const r = Math.random();
                        if (r < 0.28) this.pendingAttackType = 'fireball';
                        else if (r < 0.52) this.pendingAttackType = 'giant_fireball';
                        else if (r < 0.75) this.pendingAttackType = 'fire_pillars';
                        else this.pendingAttackType = 'flamethrower';
                    } else if (this.bossType === 'mecha_stone') {
                        this.pendingAttackType = Math.random() < 0.5 ? 'single_diamond' : 'triangle_diamond';
                    } else {
                        this.pendingAttackType = Math.random() < 0.5 ? 'single_blue' : 'triangle_blue';
                    }
                    this._setState('ATTACK');
                }
            }
        }

        if (this.isAmarjeet) {
            if (this.isTimedEncounter) {
                this.invuln = 999999;
                this.timedTimer = (this.timedTimer || 0) + deltaTime;
                if (this.timedTimer >= this.timedDuration) {
                    this.markedForDeletion = true;
                    this.game.shake = 50;
                    this.game.gravityPullActive = false;
                    this.game.reverseControls = false;
                    this.game.screenDistort = false;
                    for (let i = 0; i < 40; i++) {
                        this.game.particles.push({
                            x: this.x + this.width / 2 + (Math.random() - 0.5) * 200,
                            y: this.y + this.height / 2 + (Math.random() - 0.5) * 200,
                            vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
                            size: Math.random() * 20 + 5, alpha: 1.0,
                            color: 'rgba(120, 0, 255, 0.9)', decay: 0.92
                        });
                    }
                    return;
                }
            }
        }

        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % (this.frameCounts[this.state] || 1);
            if (this.state === 'WALK' && !this.hasEnteredScreen) {
                if (this.frameX === 2 || this.frameX === 6 || this.frameX === 10) {
                    this.game.shake = 10;
                }
            }
        }
    }

    draw(context) {
        this.shadows.forEach(s => {
            context.save();
            let tintColor = 'rgba(180, 0, 255, 0.4)';
            if (this.bossType === 'mecha_stone') {
                tintColor = 'rgba(255, 100, 0, 0.4)';
            } else if (this.bossColorTint) {
                tintColor = this.bossColorTint;
            } else if (this.bossType === 'boss_level_1') {
                tintColor = 'rgba(255, 0, 0, 0.4)';
            } else if (this.bossType === 'impaler') {
                tintColor = 'rgba(0, 255, 50, 0.4)';
            }

            if (this.useSpritesheet) {
                const size = this.frameSizes[this.state];
                const srcX = s.frameX * size.w;
                let srcY = 0;
                if (this.bossType === 'mecha_stone' || this.bossType === 'crystal_titan') {
                    const rowMap = { IDLE: 0, WALK: 1, ATTACK: 2, DEATH: 3, HURT: 4 };
                    srcY = (rowMap[this.state] || 0) * size.h;
                } else if (this.bossType === 'forest_golem') {
                    let row = 0;
                    if (this.state === 'IDLE') row = 0;
                    else if (this.state === 'WALK') row = 1;
                    else if (this.state === 'HURT') row = 4;
                    else if (this.state === 'DEATH') row = 5;
                    else if (this.state === 'ATTACK') {
                        row = (this.pendingAttackType === 'melee') ? 2 : 3;
                    }
                    srcY = row * size.h;
                }
                const scale = this.bossType === 'forest_golem' ? 2.8 : 3.8;
                const drawW = size.w * scale;
                const drawH = size.h * scale;

                context.translate(s.x + this.width / 2, s.y + this.height);
                context.scale(s.facingLeft ? -1 : 1, 1);
                window.drawTintedSprite(context, this.images[this.state], srcX, srcY, size.w, size.h, -drawW / 2, -drawH, drawW, drawH, tintColor, s.alpha);
            } else {
                const arr = this.frames[this.state];
                if (arr && arr.length > 0) {
                    const shadowImg = arr[Math.min(s.frameX, arr.length - 1)];
                    if (shadowImg && shadowImg.complete && shadowImg.naturalWidth > 0) {
                        context.translate(s.x + this.width / 2, s.y + this.height);
                        const flip = (this.bossType === 'impaler') ? s.facingLeft : !s.facingLeft;
                        context.scale(flip ? -1 : 1, 1);

                        let drawW = this.width;
                        let drawH = this.height;
                        if (this.bossType === 'impaler' || this.bossType === 'abyss_knight') {
                            drawW = 640 * 1.2;
                            drawH = 265 * 1.2;
                        }
                        if (this.isAmarjeet) {
                            drawW *= (this.scale || 1);
                            drawH *= (this.scale || 1);
                        }
                        window.drawTintedSprite(context, shadowImg, 0, 0, shadowImg.width, shadowImg.height, -drawW / 2, -drawH, drawW, drawH, tintColor, s.alpha);
                    }
                }
            }
            context.restore();
        });

        let img = this._currentImg;
        if (this.isAmarjeet) {
            img = document.getElementById('amarjeetBlackHoleImg');
            this.useSpritesheet = false;
        }

        if (!img || !img.complete || img.naturalWidth === 0) return;

        context.save();

        if (this.state === 'TELEPORT') {
            context.globalAlpha = this.teleportAlpha;
        } else if (this.state === 'DEATH') {
            context.globalAlpha = this.deathAlpha;
        }

        if (this.useSpritesheet) {
            const size = this.frameSizes[this.state];
            const srcX = this.frameX * size.w;
            let srcY = 0;
            if (this.bossType === 'mecha_stone' || this.bossType === 'crystal_titan') {
                const rowMap = {
                    IDLE: 0,
                    WALK: 1,
                    ATTACK: 2,
                    DEATH: 3,
                    HURT: 4
                };
                srcY = (rowMap[this.state] || 0) * size.h;
            } else if (this.bossType === 'forest_golem') {
                let row = 0;
                if (this.state === 'IDLE') row = 0;
                else if (this.state === 'WALK') row = 1;
                else if (this.state === 'HURT') row = 4;
                else if (this.state === 'DEATH') row = 5;
                else if (this.state === 'ATTACK') {
                    row = (this.pendingAttackType === 'melee') ? 2 : 3;
                }
                srcY = row * size.h;
            }
            const srcW = size.w;
            const srcH = size.h;

            const scale = this.bossType === 'forest_golem' ? 2.8 : 3.8;
            const drawW = size.w * scale;
            const drawH = size.h * scale;

            context.translate(this.x + this.width / 2, this.y + this.height);
            context.scale(this.facingLeft ? -this.scaleX : this.scaleX, this.scaleY);

            if (this.flashTimer > 0) {
                context.drawImage(img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH, drawW, drawH);
                window.drawTintedSprite(context, img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH, drawW, drawH, 'rgba(255, 255, 255, 0.95)', 1.0);
            } else if (this.teleportTintTimer > 0) {
                const tintStrength = Math.min(0.85, this.teleportTintTimer / 200);
                context.drawImage(img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH, drawW, drawH);
                window.drawTintedSprite(context, img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH, drawW, drawH, `rgba(180, 60, 255, ${tintStrength})`, 1.0);
            } else {
                context.drawImage(img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH, drawW, drawH);
            }
        } else {
            context.translate(this.x + this.width / 2, this.y + this.height);
            const flip = (this.bossType === 'impaler') ? this.facingLeft : !this.facingLeft;
            context.scale(flip ? -this.scaleX : this.scaleX, this.scaleY);

            let drawW = this.width;
            let drawH = this.height;
            if (this.bossType === 'impaler' || this.bossType === 'abyss_knight') {
                drawW = 640 * 1.2;
                drawH = 265 * 1.2;
            }
            if (this.isAmarjeet) {
                drawW *= (this.scale || 1);
                drawH *= (this.scale || 1);
            }

            if (this.flashTimer > 0) {
                context.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
                window.drawTintedSprite(context, img, 0, 0, img.width, img.height, -drawW / 2, -drawH, drawW, drawH, 'rgba(255, 255, 255, 0.95)', 1.0);
            } else if (this.teleportTintTimer > 0) {
                const tintStrength = Math.min(0.85, this.teleportTintTimer / 200);
                context.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
                window.drawTintedSprite(context, img, 0, 0, img.width, img.height, -drawW / 2, -drawH, drawW, drawH, `rgba(180, 60, 255, ${tintStrength})`, 1.0);
            } else {
                context.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
            }
        }
        context.restore();

        if (!this.hasEnteredScreen) return;

        const ratio = this.currentHP / this.maxHP;
        const W = this.game.width;
        const barW = W * 0.48;
        const barH = 16;
        const barX = (W - barW) / 2;
        const barY = 118;

        context.save();

        context.fillStyle = 'rgba(6,4,14,0.92)';
        this._rr(context, barX - 16, barY - 30, barW + 32, barH + 48, 10);
        context.fill();
        context.strokeStyle = 'rgba(180,20,20,0.45)';
        context.lineWidth = 1;
        this._rr(context, barX - 16, barY - 30, barW + 32, barH + 48, 10);
        context.stroke();

        context.fillStyle = '#cc2200';
        this._rr(context, barX - 16, barY - 14, 3, barH + 2, 2); context.fill();
        this._rr(context, barX + barW + 13, barY - 14, 3, barH + 2, 2); context.fill();

        context.font = '700 9px "Courier New"';
        context.fillStyle = 'rgba(255,255,255,0.32)';
        context.textAlign = 'left';
        let bossName = 'BOSS';
        if (this.bossType === 'demon_lord') bossName = 'DEMON LORD';
        else if (this.bossType === 'mecha_stone') bossName = 'MECHA STONE';
        else if (this.bossType === 'impaler') bossName = 'IMPALER';
        else if (this.bossType === 'boss_level_1') bossName = 'SHADOW BOSS';
        context.fillText(bossName, barX - 4, barY - 12);

        context.font = '700 9px "Courier New"';
        context.fillStyle = this.phase === 2 ? '#ff5500' : '#666666';
        context.textAlign = 'right';
        context.fillText(this.phase === 2 ? 'PHASE  II' : 'PHASE  I', barX + barW + 4, barY - 12);

        context.font = '700 10px "Courier New"';
        context.fillStyle = 'rgba(255,255,255,0.45)';
        context.textAlign = 'right';
        context.fillText(`${this.currentHP} / ${this.maxHP}`, barX + barW, barY + barH + 14);

        context.fillStyle = 'rgba(255,255,255,0.05)';
        this._rr(context, barX, barY, barW, barH, 5); context.fill();

        context.strokeStyle = 'rgba(0,0,0,0.38)';
        context.lineWidth = 1;
        const segs = 20;
        for (let i = 1; i < segs; i++) {
            const nx = barX + (barW / segs) * i;
            context.beginPath(); context.moveTo(nx, barY); context.lineTo(nx, barY + barH); context.stroke();
        }

        context.strokeStyle = 'rgba(255,100,0,0.65)';
        context.lineWidth = 2;
        const midX = barX + barW * 0.5;
        context.beginPath(); context.moveTo(midX, barY - 5); context.lineTo(midX, barY + barH + 5); context.stroke();

        const hpColor = ratio > 0.5 ? '#00e676' : ratio > 0.25 ? '#ffab40' : '#ff3d00';
        const hpDark = ratio > 0.5 ? '#006638' : ratio > 0.25 ? '#995000' : '#8a1a00';
        const fillGrad = context.createLinearGradient(barX, 0, barX + barW, 0);
        fillGrad.addColorStop(0, hpColor);
        fillGrad.addColorStop(1, hpDark);
        context.fillStyle = fillGrad;
        this._rr(context, barX, barY, barW * ratio, barH, 5); context.fill();

        context.fillStyle = 'rgba(255,255,255,0.14)';
        context.beginPath();
        context.roundRect(barX, barY, barW * ratio, 5, [5, 5, 0, 0]);
        context.fill();

        if (this.phase === 2) {
            const pulse = 0.25 + 0.2 * Math.sin(Date.now() * 0.008);
            context.strokeStyle = `rgba(255,80,0,${pulse})`;
            context.lineWidth = 2;
            this._rr(context, barX, barY, barW * ratio, barH, 5);
            context.stroke();
        }

        context.restore();

        // Never draw projectiles for impaler — it uses only melee attacks
        if (this.bossType !== 'impaler') {
            this.projectiles.forEach(p => p.draw(context));
        }
    }
}