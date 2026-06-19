class FireProjectile {
    constructor(game, startX, startY) {
        this.game = game;
        this.markedForDeletion = false;
        this.damageDone = false;

        this.radius = 12;
        this.particles = [];
        this.x = startX;
        this.y = startY;

        const player = game.player;
        const tx = player.x + player.width / 2 - startX;
        const ty = player.y + player.height / 2 - startY;
        const dist = Math.sqrt(tx * tx + ty * ty) || 1;
        const spd = 6;

        this.speedX = (tx / dist) * spd;
        this.speedY = (ty / dist) * spd;

        this.exploding = false;
        this.explodeTimer = 0;
        this.explodeDuration = 300;
    }

    update(deltaTime) {
        if (this.exploding) {
            this.explodeTimer += deltaTime;
            if (this.explodeTimer > this.explodeDuration) {
                this.markedForDeletion = true;
            }
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.04;
                p.size *= 0.92;
            });
            return;
        }

        this.x += this.speedX;
        this.y += this.speedY;
        // Scroll ke saath move karo taaki dash par freeze na ho
        this.x -= this.game.scrollSpeed || 0;

        this.particles.push({
            x: this.x + (Math.random() - 0.5) * 6,
            y: this.y + (Math.random() - 0.5) * 6,
            vx: -this.speedX * 0.2 + (Math.random() - 0.5) * 1,
            vy: -this.speedY * 0.2 + (Math.random() - 0.5) * 1,
            size: this.radius * (0.5 + Math.random() * 0.5),
            alpha: 0.8,
            colorType: Math.random() > 0.5 ? 'orange' : 'red'
        });

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.05;
            p.size *= 0.9;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        const player = this.game.player;
        const hit =
            this.x - this.radius < player.x + player.width &&
            this.x + this.radius > player.x &&
            this.y - this.radius < player.y + player.height &&
            this.y + this.radius > player.y;

        if (hit && !this.damageDone) {
            this.exploding = true;
            this.damageDone = true;

            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 4 + 1;
                this.particles.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    size: this.radius * (0.8 + Math.random() * 0.5),
                    alpha: 1.0,
                    colorType: Math.random() > 0.5 ? 'yellow' : 'orange'
                });
            }

            if (this.game.hitCooldown <= 0 && !player.isDead) {
                this.game.hurtPlayer(10, false);
            }
        }

        if (
            this.x < -100 || this.x > this.game.width + 100 ||
            this.y < -100 || this.y > this.game.height + 100
        ) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();

        this.particles.forEach(p => {
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            if (p.colorType === 'yellow') {
                context.fillStyle = `rgba(255, 200, 0, ${p.alpha})`;
            } else if (p.colorType === 'orange') {
                context.fillStyle = `rgba(255, 100, 0, ${p.alpha})`;
            } else {
                context.fillStyle = `rgba(255, 30, 0, ${p.alpha})`;
            }
            context.fill();
        });

        if (!this.exploding) {
            const coreGrad = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.3, '#ffcc00');
            coreGrad.addColorStop(0.7, '#ff3300');
            coreGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');

            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fillStyle = coreGrad;
            context.shadowColor = '#ff3300';
            context.shadowBlur = 10;
            context.fill();
        }

        context.restore();
    }
}

export class FlyingEnemy {

    constructor(game) {

        this.game = game;

        this.images = {
            IDLE: document.getElementById('enemyIdle'),
            FLYING: document.getElementById('enemyFlying'),
            ATTACK: document.getElementById('enemyAttack'),
            HURT: document.getElementById('enemyHurt'),
            EXPLOSION: document.getElementById('enemyDeath'),
        };

        this.frameCounts = {
            IDLE: 4,
            FLYING: 4,
            ATTACK: 8,
            HURT: 4,
            DEATH: 6,
        };

        this.width = 82;
        this.height = 82;

        this.x = this.game.width + Math.random() * 200;

        // Keep enemy in the reachable mid-height zone (y 200–370)
        // so the player can hit it with jumps, melee and projectiles
        this.baseY = 200 + Math.random() * 170;
        this.y = this.baseY;

        this.moveSpeed = 1 + Math.random() * 0.1;

        this.state = 'IDLE';
        this.frameX = 0;
        this.fps = 12;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.attackTimer = Math.random() * 2000;
        this.attackCooldown = 2500 + Math.random() * 1500;
        this.hasFiredThisAttack = false;
        this.FIRE_ON_FRAME = 3;

        this.hurtTimer = 0;
        this.hurtDuration = 300;

        this.maxHP = 40;
        this.currentHP = 40;

        this.facingLeft = false;

        this.scaleX = 1;
        this.scaleY = 1;
        this.flashTimer = 0;

        this.markedForDeletion = false;
        this.hasEnteredScreen = false;

        this.bobTimer = Math.random() * Math.PI * 4;
        this.bobSpeed = 0.0018;
        this.bobAmplitude = 28;

        this.projectiles = [];
    }

    get _img() { return this.images[this.state] ?? this.images.IDLE; }
    get _frames() { return this.frameCounts[this.state]; }
    get _spriteW() { return this._img.naturalWidth / this._frames; }
    get _spriteH() { return this._img.naturalHeight; }

    _setState(next) {
        if (this.state === next) return;
        this.state = next;
        this.frameX = 0;
        this.frameTimer = 0;
        this.hasFiredThisAttack = false;
    }

    takeDamage(amount) {
        if (this.state === 'DEATH') return;
        if (!this.hasEnteredScreen) return;

        this.currentHP -= amount;
        this.flashTimer = 150;
        this.scaleX = 1.25;
        this.scaleY = 0.75;

        if (this.game && typeof this.game.spawnDamageText === 'function') {
            this.game.spawnDamageText(this.x + this.width / 2, this.y + this.height * 0.2, amount);
        }

        if (this.currentHP <= 0) {
            this.currentHP = 0;
            this.state = 'DEATH';
            this.frameX = 1;
            this.frameTimer = 0;
            this.game.spawnDissolveParticles(this);
            if (this.game.audio) {
                this.game.audio.playSFX('flying_death');
            }
            return;
        }

        // Don't interrupt an attack in progress — enemy keeps firing even when hit
        if (this.state === 'ATTACK') return;
        this._setState('HURT');
        this.hurtTimer = 0;
    }

    update(deltaTime) {
        this.x -= this.game.scrollSpeed || 0;
        if (this.flashTimer > 0) this.flashTimer -= deltaTime;

        const easeSpd = 0.12 * (deltaTime / 16.6);
        this.scaleX += (1 - this.scaleX) * easeSpd;
        this.scaleY += (1 - this.scaleY) * easeSpd;

        if (this.state !== 'ATTACK' && this.state !== 'DEATH') {
            this.scaleY = 1 + 0.05 * Math.sin(Date.now() * 0.016);
            this.scaleX = 1 / this.scaleY;
        }

        if (!this.hasEnteredScreen && this.x <= this.game.width - this.width * 0.95) {
            this.hasEnteredScreen = true;
        }

        if (this.state === 'DEATH') {
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                this.frameX++;
                if (this.frameX > this.frameCounts.DEATH) {
                    this.markedForDeletion = true;
                }
            }
            return;
        }

        const player = this.game.player;
        const enemyCX = this.x + this.width / 2;
        const playerCX = player.x + player.width / 2;
        const diff = enemyCX - playerCX;
        const absDiff = Math.abs(diff);

        this.facingLeft = diff < 0;

        if (this.state === 'HURT') {
            this.hurtTimer += deltaTime;
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this._frames - 1) this.frameX++;
            }
            if (this.hurtTimer >= this.hurtDuration) {
                this._setState('FLYING');
            }
            // Projectiles HURT mein bhi update hote rahenge — early return se pehle
            this.projectiles.forEach(p => p.update(deltaTime));
            this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
            return;
        }

        if (this.state !== 'ATTACK') {
            if (absDiff > 140) {
                this.x += diff > 0 ? -this.moveSpeed : this.moveSpeed;
                this._setState('FLYING');
            } else {
                this._setState('IDLE');
            }
            this.bobTimer += this.bobSpeed * deltaTime;
            this.y = this.baseY + Math.sin(this.bobTimer) * this.bobAmplitude;
        }

        this.attackTimer += deltaTime;

        if (
            absDiff <= this.game.width * 0.90 &&
            this.attackTimer >= this.attackCooldown &&
            this.state !== 'ATTACK'
        ) {
            this._setState('ATTACK');
            this.attackTimer = 0;
        }

        this.frameTimer += deltaTime;

        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;

            if (this.state === 'ATTACK') {
                if (this.frameX < this.FIRE_ON_FRAME) {
                    const mouthX = this.facingLeft ? this.x + this.width * 0.82 : this.x + this.width * 0.18;
                    const mouthY = this.y + this.height * 0.62;
                    if (Math.random() < 0.4) {
                        this.game.particles.push({
                            x: mouthX + (Math.random() - 0.5) * 8,
                            y: mouthY + (Math.random() - 0.5) * 8,
                            vx: (Math.random() - 0.5) * 0.5,
                            vy: (Math.random() - 0.5) * 0.5,
                            size: Math.random() * 4 + 2,
                            alpha: 0.9,
                            color: 'rgba(255, 120, 0, 0.8)',
                            type: 'circle',
                            decay: 0.94
                        });
                    }
                }

                if (this.frameX < this._frames - 1) {
                    this.frameX++;

                    if (this.frameX === this.FIRE_ON_FRAME && !this.hasFiredThisAttack) {
                        this.hasFiredThisAttack = true;

                        const fireX = this.facingLeft ? this.x + this.width * 0.82 : this.x + this.width * 0.18;
                        const fireY = this.y + this.height * 0.62;

                        this.projectiles.push(
                            new FireProjectile(
                                this.game,
                                fireX,
                                fireY
                            )
                        );
                    }
                } else {
                    this._setState('FLYING');
                }
            } else {
                this.frameX = (this.frameX + 1) % this._frames;
            }
        }

        this.projectiles.forEach(p => p.update(deltaTime));
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
    }

    draw(context) {

        if (this.state === 'DEATH') {
            const img = this.images.EXPLOSION;
            const totalFrames = this.frameCounts.DEATH + 1;
            const sw = img.naturalWidth / totalFrames;
            const sh = img.naturalHeight;
            context.drawImage(
                img,
                this.frameX * sw, 0, sw, sh,
                this.x, this.y, this.width, this.height
            );
            return;
        }

        const img = this._img;
        const sw = this._spriteW;
        const sh = this._spriteH;

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height);
        context.scale(this.facingLeft ? -this.scaleX : this.scaleX, this.scaleY);
        if (this.flashTimer > 0) {
            window.drawTintedSprite(
                context, img,
                this.frameX * sw, 0, sw, sh,
                -this.width / 2, -this.height,
                this.width, this.height,
                'rgba(255, 255, 255, 0.95)', 1.0
            );
        } else {
            context.drawImage(
                img,
                this.frameX * sw, 0, sw, sh,
                -this.width / 2, -this.height,
                this.width, this.height
            );
        }
        context.restore();

        if (!this.hasEnteredScreen) return;
        const ratio = this.currentHP / this.maxHP;

        context.fillStyle = '#333';
        context.fillRect(this.x, this.y - 12, this.width, 5);

        context.fillStyle =
            ratio > 0.5 ? '#22cc44' :
                ratio > 0.25 ? '#ffaa00' : '#ee2222';
        context.fillRect(this.x, this.y - 12, this.width * ratio, 5);

        context.strokeStyle = '#fff';
        context.strokeRect(this.x, this.y - 12, this.width, 5);

        this.projectiles.forEach(p => p.draw(context));
    }
}