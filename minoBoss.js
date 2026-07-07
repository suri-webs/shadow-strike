import { BossProjectile } from "./bossProjectile.js";
import { BossSlashProjectile } from "./bossSlashProjectile.js";

export class MinoBoss {

    constructor(game) {
        this.game = game;
        this.isBoss = true;
        this.enemyType = 'mino_boss';

        this.width = 320;
        this.height = 320;

        this.x = game.width + 200;
        this.hasEnteredScreen = this.game.isMultiplayer ? true : false;
        this.baseY = game.height - this.height - game.groundMargin + 37;
        this.y = this.baseY;

        this.maxHP = 400;
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
        this.fps = 12;
        this.frameInterval = 1000 / this.fps;

        this.frameCounts = {
            IDLE: 16,
            WALK: 12,
            ATTACK: 16,
            HURT: 16,
            DEATH: 16,
        };

        this.frames = {
            IDLE: this._loadFrames('minoIdle', 16),
            WALK: this._loadFrames('minoWalk', 12),
            ATTACK: this._loadFrames('minoAtk', 16),
            HURT: this._loadFrames('minoIdle', 16),
            DEATH: this._loadFrames('minoIdle', 16),
        };

        this.hpOver = document.getElementById('minoHpOver');
        this.hpProgress = document.getElementById('minoHpProgress');
        this.hpUnder = document.getElementById('minoHpUnder');

        this.projectiles = [];
        this.attackTimer = 0;
        this.attackCooldown = 1400;
        this.attackCooldownPhase2 = 800;

        this.pendingAttackType = 'melee';

        this.MELEE_FRAME = 9;
        this.PROJECTILE_FRAME = 8;
        this.hasMeleeHit = false;
        this.hasShot = false;

        this.meleeThreshold = 320;
        this.meleeDamage = 30;
        this.meleeDamagePhase2 = 45;
        this.projDamage = 18;
        this.projDamagePhase2 = 30;

        this.hurtTimer = 0;
        this.hurtDuration = 350;
        this.invuln = 0;
        this.invulnDuration = 700;
        this.comeCloserCooldown = 0;

        this.markedForDeletion = false;
        this.flashTimer = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.meleeRange = 220;

        this.deathAlpha = 1;
        this.deathFadeSpeed = 0.012;
        this.shadows = [];

        this.stompShake = 0;
    }

    _loadFrames(prefix, count) {
        const frames = [];
        for (let i = 1; i <= count; i++) {
            const img = document.getElementById(`${prefix}${i}`);
            if (img) frames.push(img);
        }
        return frames;
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
        const arr = this.frames[this.state];
        if (!arr || arr.length === 0) return null;
        return arr[Math.min(this.frameX, arr.length - 1)];
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
        // In multiplayer, measure distance to nearest player
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const bossCenter = this.x + this.width / 2;
        const playerCenter = player.x + player.width / 2;
        return Math.abs(bossCenter - playerCenter);
    }

    _meleeHitCheck() {
        // Check against all players in multiplayer
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

            if (overlaps && this.game.hitCooldown <= 0) {
                const dmg = this.phase === 2 ? this.meleeDamagePhase2 : this.meleeDamage;
                if (typeof this.game.hurtTargetPlayer === 'function') {
                    this.game.hurtTargetPlayer(player, dmg, true);
                } else if (player === this.game.player) {
                    this.game.currentHP = Math.max(0, this.game.currentHP - dmg);
                    this.game.playerHit = true;
                    this.game.hitCooldown = this.game.hitCooldownMax;
                    player.takingDamage = true;
                    if (this.game.currentHP <= 0) {
                        player.killedByBoss = true;
                    }
                }
                break;
            }
        }
    }

    _fireBurst(dmg) {
        // Aim at nearest player in multiplayer
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = player.x + player.width / 2 - cx;
        const dy = player.y + player.height / 2 - cy;
        const angle = Math.atan2(dy, dx);
        const damage = dmg !== undefined ? dmg : (this.phase === 2 ? this.projDamagePhase2 : this.projDamage);
        const speed = this.phase === 2 ? 7 : 5;

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

        points.forEach(pt => {
            this.projectiles.push(
                new BossProjectile(
                    this.game,
                    pt.x, pt.y,
                    dirX, dirY,
                    speed,
                    damage
                )
            );
        });
    }

    _fireSlash() {
        // Aim at nearest player in multiplayer
        const player = this.game.getTargetPlayer
            ? this.game.getTargetPlayer(this.x + this.width / 2)
            : this.game.player;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = player.x + player.width / 2 - cx;
        const dy = player.y + player.height / 2 - cy;
        const angle = Math.atan2(dy, dx);
        const damage = this.phase === 2 ? 35 : 22;
        const speed = this.phase === 2 ? 28 : 22;

        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);

        this.projectiles.push(
            new BossSlashProjectile(
                this.game,
                cx + dirX * 30, cy + dirY * 30,
                dirX, dirY,
                speed,
                damage
            )
        );
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
            this._setState('DEATH');
            if (!this.game.gameOver) this.game.shake = 250;
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

        if (this.phase === 1 && this.currentHP <= this.maxHP / 2) {
            this.phase = 2;
            if (!this.game.gameOver) this.game.shake = 300;
            this._fireBurst(this.projDamagePhase2);
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
        if (this.stompShake > 0) this.stompShake -= deltaTime;
        if (this.surpriseCooldown > 0) this.surpriseCooldown -= deltaTime;
        if (this.comeCloserCooldown > 0) this.comeCloserCooldown -= deltaTime;

        this.shadows.forEach(s => s.alpha -= deltaTime * 0.0035);
        this.shadows = this.shadows.filter(s => s.alpha > 0);

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
            // Guest client collision checking (melee/dash damage is handled authoritatively by host)
            this.projectiles.forEach(p => p.update(deltaTime));
            this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
            return;
        }

        if (this.phase === 2 && this.state !== 'DEATH' && Math.random() < 0.12) {
            this.game.spawnHitSparks(this.x + this.width / 2 + (Math.random() - 0.5) * this.width * 0.4, this.y + this.height - 20, 'orange');
        }

        if (!this.hasEnteredScreen && this.x <= this.game.width - this.width * 0.95) {
            this.hasEnteredScreen = true;
        }

        // ── Boss Intro Sequence: dheere aao, 4 sec ruko, roar karo, tab attack ──
        if (this.introLocked) {
            // Boss dheere dheere chale screen mein
            if (this.x > this.game.width - this.width - 80) {
                this.x -= 1.5 * (deltaTime / 16.6); // slow walk speed
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

            this.projectiles.forEach(p => p.update(deltaTime));
            this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);

            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                this.frameX = (this.frameX + 1) % (this.frameCounts[this.state] || 1);
            }
            return;
        }

        this.projectiles.forEach(p => p.update(deltaTime));
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);


        if (this.state === 'TELEPORT') {
            // Teleport to nearest player in multiplayer
            const player = this.game.getTargetPlayer
                ? this.game.getTargetPlayer(this.x + this.width / 2)
                : this.game.player;
            const speed = deltaTime / 16.6; // normalize to 60fps

            if (this.teleportPhase === 0) {
                // Fade out + shrink
                this.teleportAlpha -= 0.07 * speed;
                this.scaleX += (0 - this.scaleX) * 0.18 * speed;
                this.scaleY += (0 - this.scaleY) * 0.18 * speed;

                if (this.teleportAlpha <= 0) {
                    this.teleportAlpha = 0;
                    this.teleportPhase = 1;

                    // Departure particle burst
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

                    // Reposition next to player
                    const offset = 150;
                    if (player.facingLeft) {
                        this.x = player.x + player.width + offset;
                    } else {
                        this.x = player.x - this.width - offset;
                    }
                    this.facingLeft = !player.facingLeft;

                    // Reset scale for appear animation
                    this.scaleX = 0;
                    this.scaleY = 0;

                    // Arrival particle burst
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
                    this.teleportTintTimer = 200; // tint flash on appear
                }
            } else if (this.teleportPhase === 1) {
                // Fade in + overshoot scale
                this.teleportAlpha += 0.10 * speed;
                // Overshoot: scale goes past 1.0 then settles
                const targetScale = 1.25;
                this.scaleX += (targetScale - this.scaleX) * 0.22 * speed;
                this.scaleY += (targetScale - this.scaleY) * 0.22 * speed;

                if (this.teleportAlpha >= 1) {
                    this.teleportAlpha = 1;
                    this.pendingAttackType = 'melee';
                    this._setState('ATTACK');
                    // scaleX/Y will ease back to 1.0 via normal easing in update
                }
            }

            // Tint timer for purple flash on arrival
            if (this.teleportTintTimer > 0) {
                this.teleportTintTimer -= deltaTime;
            }

            return;
        }

        if (this.state === 'DEATH') {
            this.deathAlpha -= this.deathFadeSpeed;
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.frameCounts.DEATH - 1) this.frameX++;
            }
            if (this.deathAlpha <= 0) {
                this.deathAlpha = 0;
                this.markedForDeletion = true;
            }
            return;
        }

        // Get nearest player for AI targeting (multiplayer-aware)
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
                    if (currentDist <= this.meleeThreshold) {
                        this.pendingAttackType = 'melee';
                    } else {
                        this.pendingAttackType = Math.random() < 0.5 ? 'slash' : 'dash';
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
                        if (!this.game.gameOver) this.game.shake = 100;
                        this.stompShake = 200;
                        this.scaleY = 0.72;
                        this.scaleX = 1.28;
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
                                color: 'rgba(120, 120, 120, 0.45)',
                                type: 'circle',
                                decay: 0.94,
                                gravity: 0.15
                            });
                        }
                    }
                } else if (this.pendingAttackType === 'dash') {
                    if (this.frameX === 0 && !this.hasShot) {
                        this.hasShot = true;
                        if (!this.game.gameOver) this.game.shake = 30;
                    }
                    if (this.frameX >= 5 && this.frameX <= 11) {
                        const dashSpeed = this.phase === 2 ? 38 : 28;
                        this.x += this.facingLeft ? -dashSpeed : dashSpeed;
                        this.x = Math.max(-100, Math.min(this.game.width - this.width + 100, this.x));

                        this.game.shake = Math.max(this.game.shake, 12);
                        this.scaleX = 1.35;
                        this.scaleY = 0.72;

                        this.shadows.push({
                            x: this.x,
                            y: this.y,
                            frameX: this.frameX,
                            alpha: 0.6,
                            facingLeft: this.facingLeft
                        });

                        // Check dash collision against ALL players in multiplayer
                        const dashTargets = (this.game.isMultiplayer && this.game.players && this.game.players.size > 1)
                            ? [...this.game.players.values()]
                            : [this.game.player];

                        for (const dashPlayer of dashTargets) {
                            if (!dashPlayer || dashPlayer.isDead) continue;
                            const overlaps = (this.x < dashPlayer.x + dashPlayer.width && this.x + this.width > dashPlayer.x &&
                                this.y < dashPlayer.y + dashPlayer.height && this.y + this.height > dashPlayer.y);
                            if (overlaps && this.game.hitCooldown <= 0) {
                                const dmg = this.phase === 2 ? 35 : 25;
                                if (typeof this.game.hurtTargetPlayer === 'function') {
                                    this.game.hurtTargetPlayer(dashPlayer, dmg, true);
                                } else if (dashPlayer === this.game.player) {
                                    this.game.currentHP = Math.max(0, this.game.currentHP - dmg);
                                    this.game.playerHit = true;
                                    this.game.hitCooldown = this.game.hitCooldownMax;
                                    dashPlayer.takingDamage = true;
                                    if (this.game.currentHP <= 0) {
                                        dashPlayer.killedByBoss = true;
                                    }
                                }
                                break;
                            }
                        }
                    }
                } else if (this.pendingAttackType === 'slash') {
                    if (this.frameX === this.PROJECTILE_FRAME && !this.hasShot) {
                        this.hasShot = true;
                        this._fireSlash();
                        if (!this.game.gameOver) this.game.shake = 120;
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
            this.velocityX += dir * 0.14;
        } else {
            this.velocityX *= 0.75;
        }
        this.velocityX *= 0.88;
        this.x += this.velocityX * deltaTime * 0.06;

        // ── Boundary clamp: MinoBoss screen se bahar nahi jayega (right edge only, left edge allows offscreen) ──
        const minX = -this.width - 50;
        const maxX = this.game.width - this.width * 0.7;
        if (this.x < minX) {
            this.x = minX;
            this.velocityX = Math.abs(this.velocityX) * 0.3;
        }
        if (this.x > maxX) {
            this.x = maxX;
            this.velocityX = -Math.abs(this.velocityX) * 0.3;
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
                const currentDist = this._distToPlayer();
                if (currentDist <= this.meleeThreshold) {
                    this.pendingAttackType = 'melee';
                } else {
                    this.pendingAttackType = Math.random() < 0.5 ? 'slash' : 'dash';
                }
                this._setState('ATTACK');
            }
        }

        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % (this.frameCounts[this.state] || 1);
            if (this.state === 'WALK' && !this.hasEnteredScreen) {
                if (this.frameX === 2 || this.frameX === 6 || this.frameX === 10) {
                    if (!this.game.gameOver) this.game.shake = 10;
                }
            }
        }
    }

    draw(context) {
        this.shadows.forEach(s => {
            context.save();
            const arr = this.frames[this.state];
            if (arr && arr.length > 0) {
                const shadowImg = arr[Math.min(s.frameX, arr.length - 1)];
                if (shadowImg && shadowImg.complete && shadowImg.naturalWidth > 0) {
                    const tintColor = this.game.level === 5 ? 'rgba(0, 230, 100, 0.4)' : 'rgba(255, 100, 0, 0.4)';
                    if (!s.facingLeft) {
                        context.scale(-1, 1);
                        window.drawTintedSprite(context, shadowImg, 0, 0, shadowImg.width, shadowImg.height, -(s.x + this.width), s.y, this.width, this.height, tintColor, s.alpha);
                    } else {
                        window.drawTintedSprite(context, shadowImg, 0, 0, shadowImg.width, shadowImg.height, s.x, s.y, this.width, this.height, tintColor, s.alpha);
                    }
                }
            }
            context.restore();
        });

        const img = this._currentImg;
        if (!img || !img.complete || img.naturalWidth === 0) return;

        context.save();

        if (this.state === 'DEATH') {
            context.globalAlpha = this.deathAlpha;
        } else if (this.state === 'TELEPORT') {
            context.globalAlpha = this.teleportAlpha;
        }

        context.translate(this.x + this.width / 2, this.y + this.height);
        context.scale(!this.facingLeft ? -this.scaleX : this.scaleX, this.scaleY);

        if (this.flashTimer > 0) {
            context.drawImage(img, -this.width / 2, -this.height, this.width, this.height);
            window.drawTintedSprite(context, img, 0, 0, img.width, img.height, -this.width / 2, -this.height, this.width, this.height, 'rgba(255, 255, 255, 0.95)', 1.0);
        } else if (this.teleportTintTimer > 0) {
            // Purple flash on teleport arrival
            const tintStrength = Math.min(0.85, this.teleportTintTimer / 200);
            context.drawImage(img, -this.width / 2, -this.height, this.width, this.height);
            window.drawTintedSprite(context, img, 0, 0, img.width, img.height, -this.width / 2, -this.height, this.width, this.height, `rgba(180, 60, 255, ${tintStrength})`, 1.0);
        } else if (this.state === 'HURT') {
            context.drawImage(img, -this.width / 2, -this.height, this.width, this.height);
            window.drawTintedSprite(context, img, 0, 0, img.width, img.height, -this.width / 2, -this.height, this.width, this.height, 'rgba(255, 0, 0, 0.45)', 1.0);
        } else if (this.game.level === 5) {
            context.drawImage(img, -this.width / 2, -this.height, this.width, this.height);
            window.drawTintedSprite(context, img, 0, 0, img.width, img.height, -this.width / 2, -this.height, this.width, this.height, 'rgba(0, 230, 100, 0.38)', 1.0);
        } else {
            context.drawImage(img, -this.width / 2, -this.height, this.width, this.height);
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
        context.fillText(this.game.level === 5 ? 'VENOM MINOTAUR' : 'MINO BOSS', barX - 4, barY - 12);

        context.font = '700 9px "Courier New"';
        context.fillStyle = this.phase === 2 ? '#ff5500' : '#666666';
        context.textAlign = 'right';
        context.fillText(this.phase === 2 ? 'ENRAGED' : 'PHASE  I', barX + barW + 4, barY - 12);

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

        this.projectiles.forEach(p => p.draw(context));
    }
}
