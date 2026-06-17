
const skeletonWhiteImages = {
    IDLE: new Image(),
    WALK: new Image(),
    ATTACK: new Image(),
    HURT: new Image(),
    DEATH: new Image(),
};
skeletonWhiteImages.IDLE.src = 'asset/Skeleton_White/Skeleton_01_White_Idle.png';
skeletonWhiteImages.WALK.src = 'asset/Skeleton_White/Skeleton_01_White_Walk.png';
skeletonWhiteImages.ATTACK.src = 'asset/Skeleton_White/Skeleton_01_White_Attack1.png';
skeletonWhiteImages.HURT.src = 'asset/Skeleton_White/Skeleton_01_White_Hurt.png';
skeletonWhiteImages.DEATH.src = 'asset/Skeleton_White/Skeleton_01_White_Die.png';

const skeletonYellowImages = {
    IDLE: new Image(),
    WALK: new Image(),
    ATTACK: new Image(),
    HURT: new Image(),
    DEATH: new Image(),
};
skeletonYellowImages.IDLE.src = 'asset/Skeleton-yellow/Skeleton_01_Yellow_Idle.png';
skeletonYellowImages.WALK.src = 'asset/Skeleton-yellow/Skeleton_01_Yellow_Walk.png';
skeletonYellowImages.ATTACK.src = 'asset/Skeleton-yellow/Skeleton_01_Yellow_Attack1.png';
skeletonYellowImages.HURT.src = 'asset/Skeleton-yellow/Skeleton_01_Yellow_Hurt.png';
skeletonYellowImages.DEATH.src = 'asset/Skeleton-yellow/Skeleton_01_Yellow_Die.png';

const archerImage = new Image();
archerImage.src = 'asset/Arcane archer/spritesheet.png';

const archerProjImage = new Image();
archerProjImage.src = 'asset/Arcane archer/projectile.png';

class ArcherProjectile {
    constructor(game, x, y, facingLeft, damage = 8) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 8;
        this.facingLeft = facingLeft;
        this.speed = 8;
        this.damage = damage;
        this.markedForDeletion = false;
        this.image = archerProjImage;
    }

    update(deltaTime) {
        this.x += this.facingLeft ? -this.speed : this.speed;
        if (this.x < -100 || this.x > this.game.width + 100) {
            this.markedForDeletion = true;
        }

        if (Math.random() < 0.35) {
            this.game.particles.push({
                x: this.x + (this.facingLeft ? this.width : 0),
                y: this.y + this.height / 2 + (Math.random() - 0.5) * 4,
                vx: (this.facingLeft ? 1 : -1) * (Math.random() * 0.5 + 0.1),
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 3 + 1.5,
                alpha: 0.8,
                color: Math.random() > 0.4 ? 'rgba(186, 85, 211, 0.7)' : 'rgba(255, 255, 255, 0.65)',
                type: 'circle',
                decay: 0.94
            });
        }

        const player = this.game.player;
        const hit =
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y;

        if (hit && !player.isDead && this.game.hitCooldown <= 0) {
            this.game.hurtPlayer(this.damage, false);
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (!this.image.complete) return;
        context.save();
        if (!this.facingLeft) {
            context.scale(-1, 1);
            context.drawImage(this.image, -(this.x + this.width), this.y, this.width, this.height);
        } else {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        context.restore();
    }
}

export class GroundEnemy {

    constructor(game, enemyType = 'demon') {
        this.game = game;
        this.enemyType = enemyType;
        this.projectiles = [];

        const lvl = game.level || 1;

        if (enemyType === 'skeleton_white') {
            this.frameCounts = { IDLE: 8, WALK: 10, ATTACK: 10, HURT: 5, DEATH: 13 };
            this.frames = skeletonWhiteImages;
            this.width = 100;
            this.height = 120;
            this.maxHP = 40 + (lvl - 1) * 15;
            this.attackRange = 60;
            this.attackDamage = 5 + (lvl - 1) * 3;
            this.fps = 10;
            this.moveSpeed = (1 + Math.random() * 0.8) * (1 + (lvl - 1) * 0.1);
            this.DAMAGE_ON_FRAME = 6;
            this.yOffset = 0;
        } else if (enemyType === 'skeleton_yellow') {
            this.frameCounts = { IDLE: 8, WALK: 10, ATTACK: 10, HURT: 5, DEATH: 13 };
            this.frames = skeletonYellowImages;
            this.width = 100;
            this.height = 120;
            this.maxHP = 70 + (lvl - 1) * 20;
            this.attackRange = 60;
            this.attackDamage = 10 + (lvl - 1) * 4;
            this.fps = 12;
            this.moveSpeed = (1.3 + Math.random() * 0.8) * (1 + (lvl - 1) * 0.08) * 1.2;
            this.DAMAGE_ON_FRAME = 6;
            this.yOffset = 0;
        } else if (enemyType === 'arcane_archer') {
            this.frameCounts = { IDLE: 4, WALK: 8, ATTACK: 7, HURT: 6, DEATH: 8 };
            this.frames = archerImage;
            this.width = 90;
            this.height = 120;
            this.maxHP = 50 + (lvl - 1) * 18;
            this.attackRange = 350;
            this.attackDamage = 7 + (lvl - 1) * 3;
            this.fps = 10;
            this.moveSpeed = (1 + Math.random() * 0.7) * (1 + (lvl - 1) * 0.08);
            this.DAMAGE_ON_FRAME = 4;
            this.yOffset = 32;
        } else {

            this.frameCounts = { IDLE: 6, WALK: 12, ATTACK: 15, HURT: 5, DEATH: 18 };
            this.frames = {
                IDLE: [
                    document.getElementById('demonIdle1'),
                    document.getElementById('demonIdle2'),
                    document.getElementById('demonIdle3'),
                    document.getElementById('demonIdle4'),
                    document.getElementById('demonIdle5'),
                    document.getElementById('demonIdle6'),
                ],
                WALK: [
                    document.getElementById('demonWalk1'),
                    document.getElementById('demonWalk2'),
                    document.getElementById('demonWalk3'),
                    document.getElementById('demonWalk4'),
                    document.getElementById('demonWalk5'),
                    document.getElementById('demonWalk6'),
                    document.getElementById('demonWalk7'),
                    document.getElementById('demonWalk8'),
                    document.getElementById('demonWalk9'),
                    document.getElementById('demonWalk10'),
                    document.getElementById('demonWalk11'),
                    document.getElementById('demonWalk12'),
                ],
                ATTACK: [
                    document.getElementById('demonCleave1'),
                    document.getElementById('demonCleave2'),
                    document.getElementById('demonCleave3'),
                    document.getElementById('demonCleave4'),
                    document.getElementById('demonCleave5'),
                    document.getElementById('demonCleave6'),
                    document.getElementById('demonCleave7'),
                    document.getElementById('demonCleave8'),
                    document.getElementById('demonCleave9'),
                    document.getElementById('demonCleave10'),
                    document.getElementById('demonCleave11'),
                    document.getElementById('demonCleave12'),
                    document.getElementById('demonCleave13'),
                    document.getElementById('demonCleave14'),
                    document.getElementById('demonCleave15'),
                ],
                HURT: [
                    document.getElementById('demonHurt1'),
                    document.getElementById('demonHurt2'),
                    document.getElementById('demonHurt3'),
                    document.getElementById('demonHurt4'),
                    document.getElementById('demonHurt5'),
                ],
                DEATH: [
                    document.getElementById('demonDeath1'),
                    document.getElementById('demonDeath2'),
                    document.getElementById('demonDeath3'),
                    document.getElementById('demonDeath4'),
                    document.getElementById('demonDeath5'),
                    document.getElementById('demonDeath6'),
                    document.getElementById('demonDeath7'),
                    document.getElementById('demonDeath8'),
                    document.getElementById('demonDeath9'),
                    document.getElementById('demonDeath10'),
                    document.getElementById('demonDeath11'),
                    document.getElementById('demonDeath12'),
                    document.getElementById('demonDeath13'),
                    document.getElementById('demonDeath14'),
                    document.getElementById('demonDeath15'),
                    document.getElementById('demonDeath16'),
                    document.getElementById('demonDeath17'),
                    document.getElementById('demonDeath18'),
                ],
            };
            this.width = 200;
            this.height = 180;
            this.maxHP = 60 + (lvl - 1) * 25;
            this.attackRange = 80;
            this.attackDamage = 8 + (lvl - 1) * 6;
            this.fps = 12;
            this.moveSpeed = (1 + Math.random() * 1) * (1 + (lvl - 1) * 0.12);
            this.DAMAGE_ON_FRAME = 8;
            this.yOffset = 0;
        }

        this.currentHP = this.maxHP;
        this.x = this.game.width + 50;
        this.y = this.game.height - this.height - this.game.groundMargin + (this.yOffset || 0);

        this.state = 'WALK';
        this.frameX = 0;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;

        this.attackTimer = 0;
        this.attackCooldown = Math.max(700, 1000 - (lvl - 1) * 100) + Math.random() * 800;
        this.hasHitThisAttack = false;

        this.hurtTimer = 0;
        this.hurtDuration = 400;
        this.facingLeft = false;

        this.scaleX = 1;
        this.scaleY = 1;
        this.flashTimer = 0;

        this.markedForDeletion = false;
        this.hasEnteredScreen = false;
    }

    get _currentImg() {
        if (this.enemyType === 'arcane_archer') {
            return this.frames;
        } else if (this.enemyType === 'skeleton_white' || this.enemyType === 'skeleton_yellow') {
            return this.frames[this.state];
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
        this.hasHitThisAttack = false;
    }

    takeDamage(amount) {
        if (this.state === 'DEATH') return;
        if (!this.hasEnteredScreen) return;
        this.currentHP -= amount;
        this.flashTimer = 150;
        this.scaleX = 1.25;
        this.scaleY = 0.75;

        if (this.game && typeof this.game.spawnDamageText === 'function') {
            this.game.spawnDamageText(this.x + this.width / 2, this.y + this.height * 0.3, amount);
        }

        if (this.currentHP <= 0) {
            this.currentHP = 0;
            this._setState('DEATH');
            this.game.spawnDissolveParticles(this);
            if (this.game.audio) {
                this.game.audio.playSFX('ground_death');
            }
            return;
        }

        // Don't interrupt an attack in progress — enemy keeps attacking even when hit
        if (this.state === 'ATTACK') return;
        this._setState('HURT');
        this.hurtTimer = 0;
    }

    update(deltaTime) {
        if (this.flashTimer > 0) this.flashTimer -= deltaTime;

        const easeSpd = 0.12 * (deltaTime / 16.6);
        this.scaleX += (1 - this.scaleX) * easeSpd;
        this.scaleY += (1 - this.scaleY) * easeSpd;

        if (this.state === 'WALK') {
            this.scaleY = 1 + 0.035 * Math.sin(Date.now() * 0.012);
            this.scaleX = 1 / this.scaleY;
        }

        this.projectiles.forEach(p => p.update(deltaTime));
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);

        if (!this.hasEnteredScreen && this.x <= this.game.width - this.width * 0.95) {
            this.hasEnteredScreen = true;
        }

        if (this.state === 'DEATH') {
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.frameCounts.DEATH - 1) {
                    this.frameX++;
                } else {
                    this.markedForDeletion = true;
                }
            }
            return;
        }

        const player = this.game.player;
        const dist = Math.abs(
            (this.x + this.width / 2) -
            (player.x + player.width / 2)
        );

        this.facingLeft = player.x + player.width / 2 > this.x + this.width / 2;

        if (this.state === 'HURT') {
            this.hurtTimer += deltaTime;
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.frameCounts.HURT - 1) this.frameX++;
            }
            if (this.hurtTimer >= this.hurtDuration) {
                this._setState('WALK');
            }
            return;
        }

        if (this.state === 'ATTACK') {
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;

                if (this.frameX === this.DAMAGE_ON_FRAME && !this.hasHitThisAttack) {
                    this.hasHitThisAttack = true;

                    if (this.enemyType === 'arcane_archer') {

                        const fireX = !this.facingLeft ? this.x : this.x + this.width;
                        const fireY = this.y + this.height * 0.4;
                        this.projectiles.push(
                            new ArcherProjectile(this.game, fireX, fireY, !this.facingLeft, this.attackDamage)
                        );
                    } else {

                        if (dist <= this.attackRange + 30) {
                            this.game.hurtPlayer(this.attackDamage, false);
                        }
                    }
                }

                if (this.frameX < this.frameCounts.ATTACK - 1) {
                    this.frameX++;
                } else {
                    this._setState('WALK');
                    this.attackTimer = 0;
                }
            }
            return;
        }

        if (dist > this.attackRange) {

            const dir = player.x + player.width / 2 < this.x + this.width / 2 ? -1 : 1;
            const chase = this.moveSpeed;

            this.x += dir * chase;

            if (!this.hasEnteredScreen) {
                this.x -= this.game.speed || 0;
            }

            this.x = Math.max(-200, this.x);

            this._setState('WALK');

            if (Math.random() < 0.15) {
                const dustColor = this.enemyType === 'skeleton_white' ? 'rgba(200, 200, 200, 0.3)' :
                    this.enemyType === 'skeleton_yellow' ? 'rgba(255, 215, 0, 0.25)' :
                        this.enemyType === 'arcane_archer' ? 'rgba(180, 100, 255, 0.25)' :
                            'rgba(180, 80, 80, 0.3)';
                this.game.particles.push({
                    x: this.x + this.width / 2 + (this.facingLeft ? 10 : -10),
                    y: this.y + this.height - 4,
                    vx: (this.facingLeft ? 1 : -1) * (Math.random() * 0.4 + 0.1),
                    vy: -Math.random() * 0.3,
                    size: Math.random() * 3 + 2,
                    alpha: 0.5,
                    color: dustColor,
                    type: 'circle',
                    decay: 0.94
                });
            }
        } else {
            this._setState('IDLE');
        }

        this.attackTimer += deltaTime;

        if (
            dist <= this.attackRange &&
            this.attackTimer >= this.attackCooldown
        ) {
            this._setState('ATTACK');
        }

        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % this.frameCounts[this.state];
        }

        this.y = this.game.height - this.height - this.game.groundMargin + (this.yOffset || 0);
    }

    draw(context) {

        this.projectiles.forEach(p => p.draw(context));

        const img = this._currentImg;
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const isSpritesheet = (this.enemyType === 'skeleton_white' || this.enemyType === 'skeleton_yellow' || this.enemyType === 'arcane_archer');

        if (isSpritesheet) {
            context.save();
            let size, srcX, srcY, srcW, srcH;
            if (this.enemyType === 'arcane_archer') {
                size = { w: 64, h: 64 };
                const rowMap = { IDLE: 5, WALK: 0, ATTACK: 3, HURT: 4, DEATH: 1 };
                const row = rowMap[this.state];
                srcX = this.frameX * size.w;
                srcY = row * size.h;
                srcW = size.w;
                srcH = size.h;
            } else {
                size = { w: 96, h: 64 };
                srcX = this.frameX * size.w;
                srcY = 0;
                srcW = size.w;
                srcH = size.h;
            }

            const scale = 2.5;
            const drawW = size.w * scale;
            const drawH = size.h * scale;

            const flip = !this.facingLeft;
            context.translate(this.x + this.width / 2, this.y + this.height);
            context.scale(flip ? -this.scaleX : this.scaleX, this.scaleY);
            if (this.flashTimer > 0) {
                window.drawTintedSprite(context, img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH, drawW, drawH, 'rgba(255, 255, 255, 0.95)', 1.0);
            } else {
                context.drawImage(img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH, drawW, drawH);
            }
            context.restore();
        } else {
            context.save();
            context.translate(this.x + this.width / 2, this.y + this.height);
            context.scale(this.facingLeft ? -this.scaleX : this.scaleX, this.scaleY);
            if (this.flashTimer > 0) {
                window.drawTintedSprite(context, img, 0, 0, img.width, img.height, -this.width / 2, -this.height, this.width, this.height, 'rgba(255, 255, 255, 0.95)', 1.0);
            } else {
                context.drawImage(img, -this.width / 2, -this.height, this.width, this.height);
            }
            context.restore();
        }

        if (!this.hasEnteredScreen) return;

        const ratio = this.currentHP / this.maxHP;
        const barWidth = this.width * 0.7;
        const barHeight = 7;
        const barX = this.x + (this.width - barWidth) / 2;
        const barY = this.y - 12;

        context.fillStyle = '#2b2b2b';
        context.fillRect(barX, barY, barWidth, barHeight);

        context.fillStyle = '#ff0000';
        context.fillRect(barX, barY, barWidth * ratio, barHeight);

        context.strokeStyle = '#ffffff';
        context.lineWidth = 1;
        context.strokeRect(barX, barY, barWidth, barHeight);
    }
}