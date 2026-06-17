// Jotem's Q: Stone Boulder Projectile (Explodes on hit)
export class BoulderProjectile {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.facingLeft = facingLeft;
        this.width = 75;
        this.height = 75;
        this.speed = facingLeft ? -9 : 9;
        this.damage = 32; // Massive heavy Golem damage
        this.rotation = 0;
        this.markedForDeletion = false;
        this.exploding = false;
        this.explodeTimer = 0;
        this.particles = [];
    }

    update(deltaTime) {
        if (this.exploding) {
            this.explodeTimer += deltaTime;
            if (this.explodeTimer > 350) {
                this.markedForDeletion = true;
            }
            return;
        }

        this.x += this.speed;
        this.rotation += this.facingLeft ? -0.15 : 0.15;

        // Ground rolling lock
        const groundY = this.game.height - this.height - this.game.groundMargin;
        if (this.y < groundY) {
            this.y = Math.min(this.y + 6, groundY);
        }

        // Earth particles trail
        if (Math.random() < 0.45) {
            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height - 4,
                vx: (this.facingLeft ? 1 : -1) * (Math.random() * 2 + 1),
                vy: -Math.random() * 2,
                size: Math.random() * 6 + 3,
                alpha: 0.8,
                color: Math.random() > 0.4 ? '#8d6e63' : '#a1887f'
            });
        }

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.04;
            p.size *= 0.94;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        // Enemy collisions
        this.game.enemies.forEach(enemy => {
            if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;

            const hit =
                this.x < enemy.x + enemy.width &&
                this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height &&
                this.y + this.height > enemy.y;

            if (hit) {
                this.exploding = true;
                if (typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(this.damage);
                } else {
                    enemy.currentHP -= this.damage;
                }
                this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'gold');
                this.game.shake = Math.max(this.game.shake, 14);
            }
        });

        if (this.x < -150 || this.x > this.game.width + 150) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        this.particles.forEach(p => {
            context.save();
            context.globalAlpha = p.alpha;
            context.shadowColor = '#ffb74d';
            context.shadowBlur = 6;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fillStyle = p.color;
            context.fill();
            context.restore();
        });

        context.save();
        if (this.exploding) {
            const progress = this.explodeTimer / 350;
            // Shockwave ring
            context.save();
            context.shadowColor = '#ffa726';
            context.shadowBlur = 20;
            context.strokeStyle = '#ffcc80';
            context.lineWidth = 4 * (1 - progress);
            context.beginPath();
            const rx = progress * 90;
            context.ellipse(this.x + this.width / 2, this.y + this.height / 2, rx, rx * 0.4, 0, 0, Math.PI * 2);
            context.stroke();
            context.restore();
            // Exploding rock chunks
            for (let i = 0; i < 14; i++) {
                const angle = (i / 14) * Math.PI * 2 + progress * 0.5;
                const dist = progress * 80;
                const sx = this.x + this.width / 2 + Math.cos(angle) * dist;
                const sy = this.y + this.height / 2 + Math.sin(angle) * dist * 0.6;
                const chunkSize = (8 + i % 4 * 3) * (1 - progress);
                context.save();
                context.globalAlpha = 1 - progress;
                context.translate(sx, sy);
                context.rotate(angle + progress * 3);
                const cg = context.createLinearGradient(-chunkSize / 2, 0, chunkSize / 2, 0);
                cg.addColorStop(0, '#5d4037');
                cg.addColorStop(0.5, '#ffa726');
                cg.addColorStop(1, '#3e2723');
                context.fillStyle = cg;
                context.fillRect(-chunkSize / 2, -chunkSize / 2, chunkSize, chunkSize);
                context.restore();
            }
            context.restore();
            return;
        }

        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotation);

        // Outer glow
        context.shadowColor = '#ffb74d';
        context.shadowBlur = 18;

        // Layered rock surface
        const grad = context.createRadialGradient(0, 0, 3, 0, 0, this.width / 2);
        grad.addColorStop(0, '#ffe0b2');
        grad.addColorStop(0.3, '#ffa726');
        grad.addColorStop(0.6, '#5d4037');
        grad.addColorStop(1, '#3e2723');

        context.beginPath();
        context.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        context.fillStyle = grad;
        context.fill();

        // Molten crack lines
        context.strokeStyle = '#ff8f00';
        context.lineWidth = 1.8;
        context.shadowColor = '#ff6f00';
        context.shadowBlur = 6;
        for (let c = 0; c < 4; c++) {
            const a = (c / 4) * Math.PI * 2;
            context.beginPath();
            context.moveTo(Math.cos(a) * 5, Math.sin(a) * 5);
            context.lineTo(Math.cos(a) * (this.width / 2 - 4), Math.sin(a) * (this.width / 2 - 4));
            context.stroke();
        }

        // Outer rim
        context.shadowBlur = 0;
        context.strokeStyle = '#ffa726';
        context.lineWidth = 2.5;
        context.beginPath();
        context.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        context.stroke();

        context.restore();
    }
}

// Jotem's R: Fissure Spikes Projectile (Piercing spike trail)
export class FissureSpikesProjectile {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.facingLeft = facingLeft;
        this.width = 110;
        this.height = 80;
        this.speed = facingLeft ? -12 : 12;
        this.damage = 48; // Titan Fissure damage
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        this.x += this.speed;
        this.y = this.game.height - this.height - this.game.groundMargin;

        // Spawn a simple dust particle in the main game's shared particle array
        if (Math.random() < 0.25) {
            this.game.particles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * 30,
                y: this.y + this.height - 4,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2,
                radius: 4 + Math.random() * 5,
                alpha: 0.7,
                color: Math.random() > 0.5 ? '#8d6e63' : 'rgba(255, 145, 0, 0.6)'
            });
        }

        // Bounding check for piercing damage
        this.game.enemies.forEach(enemy => {
            if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;

            const hit =
                this.x < enemy.x + enemy.width &&
                this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height &&
                this.y + this.height > enemy.y;

            if (hit) {
                const hitKey = '_hitByFissure';
                if (enemy[hitKey]) return;
                enemy[hitKey] = true;

                if (typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(this.damage);
                } else {
                    enemy.currentHP -= this.damage;
                }
                this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height, 'orange');
                this.game.shake = Math.max(this.game.shake, 6);

                setTimeout(() => { if (enemy) enemy[hitKey] = false; }, 300);
            }
        });

        if (this.x < -200 || this.x > this.game.width + 200) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        if (this.facingLeft) {
            context.scale(-1, 1);
            context.translate(-this.width, 0);
        }

        // Draw a cluster of 3 jagged rock spikes
        // Spike 1 (Left/Back, smaller)
        context.fillStyle = '#4e342e';
        context.strokeStyle = '#1a0d0a';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(10, this.height);
        context.lineTo(25, this.height - 40);
        context.lineTo(40, this.height);
        context.closePath();
        context.fill();
        context.stroke();

        // Spike 2 (Right/Back, smaller)
        context.beginPath();
        context.moveTo(this.width - 40, this.height);
        context.lineTo(this.width - 25, this.height - 50);
        context.lineTo(this.width - 10, this.height);
        context.closePath();
        context.fill();
        context.stroke();

        // Spike 3 (Center, Main large spike)
        context.fillStyle = '#3e2723';
        context.beginPath();
        context.moveTo(25, this.height);
        context.lineTo(this.width / 2, this.height - this.height * 0.95);
        context.lineTo(this.width - 25, this.height);
        context.closePath();
        context.fill();
        context.stroke();

        // Glowing magma crack in the main spike
        context.fillStyle = '#ff9100';
        context.beginPath();
        context.moveTo(this.width / 2 - 4, this.height);
        context.lineTo(this.width / 2, this.height - this.height * 0.7);
        context.lineTo(this.width / 2 + 4, this.height);
        context.closePath();
        context.fill();

        context.restore();
    }
}

// Shaia's Q: Static Volt Projectile (Fast speed electro blast -> Golden Star)
export class StaticVoltProjectile {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.facingLeft = facingLeft;
        this.width = 60;
        this.height = 60;
        this.speed = facingLeft ? -14 : 14;
        this.damage = 18;
        this.markedForDeletion = false;
        this.particles = [];
        this.sparkTimer = 0;
    }

    update(deltaTime) {
        this.x += this.speed;

        this.sparkTimer += deltaTime;
        if (this.sparkTimer > 40) {
            this.sparkTimer = 0;
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 4 + 1;
                this.particles.push({
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    size: Math.random() * 5 + 2,
                    alpha: 0.9,
                    color: Math.random() > 0.4 ? '#ffd700' : '#ffea00' // Golden colors
                });
            }
        }

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.06;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        this.game.enemies.forEach(enemy => {
            if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;

            const hit =
                this.x < enemy.x + enemy.width &&
                this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height &&
                this.y + this.height > enemy.y;

            if (hit) {
                const hitKey = '_hitByVolt';
                if (enemy[hitKey]) return;
                enemy[hitKey] = true;

                if (typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(this.damage);
                } else {
                    enemy.currentHP -= this.damage;
                }
                this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'gold');
                this.game.shake = Math.max(this.game.shake, 8);

                setTimeout(() => { if (enemy) enemy[hitKey] = false; }, 200);
            }
        });

        if (this.x < -100 || this.x > this.game.width + 100) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();

        // Trail spark lines with glow (now golden)
        this.particles.forEach(p => {
            context.save();
            context.globalAlpha = p.alpha;
            context.shadowColor = '#ffb300';
            context.shadowBlur = 8;
            context.strokeStyle = p.color;
            context.lineWidth = 1.8;
            // Zigzag spark lines
            context.beginPath();
            context.moveTo(p.x - p.size, p.y - p.size * 0.5);
            context.lineTo(p.x, p.y + p.size * 0.5);
            context.lineTo(p.x + p.size, p.y - p.size * 0.3);
            context.stroke();
            context.restore();
        });

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Pulsing outer glow halo
        const pulse = 1.0 + 0.15 * Math.sin(Date.now() * 0.008);
        context.shadowColor = '#ffb300';
        context.shadowBlur = 25 * pulse;

        // Draw Golden Star
        const outerRadius = 22 * pulse;
        const innerRadius = 10 * pulse;
        const spikes = 5;

        // Make the star rotate
        const rotOffset = (Date.now() * 0.005) * (this.facingLeft ? -1 : 1);

        // Main star gradient (golden → bright yellow → white center)
        const grad = context.createRadialGradient(cx, cy, 1, cx, cy, outerRadius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ffea00');
        grad.addColorStop(0.7, '#ffd700');
        grad.addColorStop(1, '#ffb300');

        context.beginPath();
        let rot = Math.PI / 2 * 3 + rotOffset;
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        context.moveTo(x, y);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            context.lineTo(x, y);
            rot += Math.PI / spikes;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            context.lineTo(x, y);
            rot += Math.PI / spikes;
        }
        context.closePath();

        context.fillStyle = grad;
        context.fill();

        // Inner white star for brightness
        context.beginPath();
        rot = Math.PI / 2 * 3 + rotOffset;
        const smallOuter = outerRadius * 0.4;
        const smallInner = innerRadius * 0.4;

        x = cx + Math.cos(rot) * smallOuter;
        y = cy + Math.sin(rot) * smallOuter;
        context.moveTo(x, y);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * smallOuter;
            y = cy + Math.sin(rot) * smallOuter;
            context.lineTo(x, y);
            rot += Math.PI / spikes;

            x = cx + Math.cos(rot) * smallInner;
            y = cy + Math.sin(rot) * smallInner;
            context.lineTo(x, y);
            rot += Math.PI / spikes;
        }
        context.closePath();

        context.fillStyle = '#ffffff';
        context.shadowBlur = 0;
        context.fill();

        context.restore();
    }
}

// Shaia's R: Thunder Strike Projectile (Golden multi-bolt field, 50% width spread)
export class ThunderStrikeProjectile {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.facingLeft = facingLeft;
        this.markedForDeletion = false;
        this.timer = 0;
        this.activeDuration = 620;
        this.damage = 55;

        // Spread across 50% of game width
        const spreadWidth = this.game.width * 0.50;
        const startX = facingLeft
            ? x - spreadWidth         // spread to the left
            : x;                      // spread to the right

        // Generate 5 bolt columns evenly spaced across the spread
        this.bolts = [];
        const boltCount = 5;
        for (let b = 0; b < boltCount; b++) {
            const boltX = startX + (spreadWidth / (boltCount - 1)) * b;
            this.bolts.push(this._makeBolt(boltX));
        }

        this.game.shake = Math.max(this.game.shake, 26);
        if (this.game.audio) this.game.audio.playSFX('game_start');
    }

    _makeBolt(boltX) {
        const segments = [];
        let curX = boltX;
        let curY = 0;
        const groundY = this.game.height - this.game.groundMargin;
        while (curY < groundY) {
            const nextY = Math.min(curY + 22 + Math.random() * 18, groundY);
            const nextX = curX + (Math.random() - 0.5) * 28;
            segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });
            curX = nextX;
            curY = nextY;
        }
        return { segments, groundX: curX, boltX };
    }

    _regenBolts() {
        // Randomly re-generate 2-3 bolts per frame for flickering
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * this.bolts.length);
            const bx = this.bolts[idx].boltX;
            this.bolts[idx] = this._makeBolt(bx);
        }
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.activeDuration) {
            this.markedForDeletion = true;
            return;
        }

        // Regenerate bolt shapes each frame for live flicker
        this._regenBolts();

        const gy = this.game.height - this.game.groundMargin;

        // Hit all enemies within any bolt column (first 180ms)
        if (this.timer < 180) {
            this.game.enemies.forEach(enemy => {
                if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;
                if (enemy._hitByThunder) return;

                // Check if enemy overlaps any bolt X position
                const hit = this.bolts.some(bolt =>
                    enemy.x < bolt.groundX + 70 && enemy.x + enemy.width > bolt.groundX - 70
                );

                if (hit) {
                    enemy._hitByThunder = true;
                    if (typeof enemy.takeDamage === 'function') enemy.takeDamage(this.damage);
                    else enemy.currentHP -= this.damage;
                    this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'gold');
                    this.game.shake = Math.max(this.game.shake, 16);
                    setTimeout(() => { if (enemy) enemy._hitByThunder = false; }, 300);
                }
            });
        }

        // Spawn golden ground sparks at each bolt landing point
        if (this.timer < 200) {
            this.bolts.forEach(bolt => {
                if (Math.random() < 0.5) {
                    for (let i = 0; i < 3; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const spd = Math.random() * 7 + 3;
                        this.game.particles.push({
                            x: bolt.groundX,
                            y: gy - 6,
                            vx: Math.cos(angle) * spd,
                            vy: Math.sin(angle) * spd - 2,
                            size: Math.random() * 9 + 4,
                            alpha: 1.0,
                            color: Math.random() > 0.45 ? '#ffd700' : Math.random() > 0.5 ? '#fff176' : '#ffab00',
                            type: 'spark',
                            decay: 0.9,
                            gravity: 0.05
                        });
                    }
                }
            });
        }
    }

    draw(context) {
        const progress = this.timer / this.activeDuration;
        const alpha = Math.max(0, 1.0 - progress * 1.1);
        const gy = this.game.height - this.game.groundMargin;

        context.save();
        context.globalAlpha = alpha;

        this.bolts.forEach((bolt, bi) => {
            // ── Thick outer golden glow bolt ──
            context.save();
            context.shadowColor = '#ffd700';
            context.shadowBlur = 28;
            context.strokeStyle = '#ffab00';
            context.lineWidth = 10 - bi % 2 * 2;  // vary widths slightly
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.beginPath();
            bolt.segments.forEach(s => {
                context.moveTo(s.x1, s.y1);
                context.lineTo(s.x2, s.y2);
            });
            context.stroke();

            // ── Mid yellow core bolt ──
            context.shadowColor = '#fff176';
            context.shadowBlur = 14;
            context.strokeStyle = '#ffd700';
            context.lineWidth = 5;
            context.beginPath();
            bolt.segments.forEach(s => {
                context.moveTo(s.x1, s.y1);
                context.lineTo(s.x2, s.y2);
            });
            context.stroke();

            // ── Bright white inner core ──
            context.shadowColor = '#ffffff';
            context.shadowBlur = 8;
            context.strokeStyle = '#ffffff';
            context.lineWidth = 2;
            context.beginPath();
            bolt.segments.forEach(s => {
                context.moveTo(s.x1, s.y1);
                context.lineTo(s.x2, s.y2);
            });
            context.stroke();

            // ── Ground impact ring at landing point ──
            const ringRadius = (1 - progress) * 55 + 10;
            const ringAlpha = (1 - progress) * 0.65;
            context.save();
            context.globalAlpha = ringAlpha;
            context.shadowColor = '#ffd700';
            context.shadowBlur = 20;
            context.strokeStyle = '#ffd700';
            context.lineWidth = 3;
            context.beginPath();
            context.ellipse(bolt.groundX, gy, ringRadius, ringRadius * 0.25, 0, 0, Math.PI * 2);
            context.stroke();
            // Inner bright ring
            context.strokeStyle = '#ffffff';
            context.lineWidth = 1;
            context.beginPath();
            context.ellipse(bolt.groundX, gy, ringRadius * 0.55, ringRadius * 0.14, 0, 0, Math.PI * 2);
            context.stroke();
            context.restore();

            context.restore();
        });

        // ── Golden sky flash aura across the whole spread ──
        if (progress < 0.18) {
            const flashAlpha = (0.18 - progress) / 0.18 * 0.22;
            context.globalAlpha = flashAlpha;
            const minBoltX = Math.min(...this.bolts.map(b => b.boltX)) - 40;
            const maxBoltX = Math.max(...this.bolts.map(b => b.boltX)) + 40;
            const auraGrad = context.createLinearGradient(minBoltX, 0, maxBoltX, 0);
            auraGrad.addColorStop(0, 'transparent');
            auraGrad.addColorStop(0.2, 'rgba(255, 215, 0, 0.35)');
            auraGrad.addColorStop(0.5, 'rgba(255, 255, 200, 0.55)');
            auraGrad.addColorStop(0.8, 'rgba(255, 215, 0, 0.35)');
            auraGrad.addColorStop(1, 'transparent');
            context.fillStyle = auraGrad;
            context.fillRect(minBoltX, 0, maxBoltX - minBoltX, gy);
        }

        context.restore();
    }
}

// DuskBorne's Q: Hellfire Projectile (Demonic quick fire)
export class HellfireProjectile {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.facingLeft = facingLeft;
        this.width = 45;
        this.height = 45;
        this.speed = facingLeft ? -11 : 11;
        this.damage = 16;
        this.markedForDeletion = false;
        this.particles = [];
    }

    update(deltaTime) {
        this.x += this.speed;

        if (Math.random() < 0.6) {
            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2 + (Math.random() - 0.5) * 12,
                vx: -this.speed * 0.2 + (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1.5 - 0.5,
                size: Math.random() * 7 + 3,
                alpha: 1.0,
                color: Math.random() > 0.5 ? '#ff2244' : '#311b92'
            });
        }

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.06;
            p.size *= 0.94;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        this.game.enemies.forEach(enemy => {
            if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;

            const hit =
                this.x < enemy.x + enemy.width &&
                this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height &&
                this.y + this.height > enemy.y;

            if (hit) {
                const hitKey = '_hitByHellfire';
                if (enemy[hitKey]) return;
                enemy[hitKey] = true;

                if (typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(this.damage);
                } else {
                    enemy.currentHP -= this.damage;
                }
                this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'orange');
                this.game.shake = Math.max(this.game.shake, 6);

                setTimeout(() => { if (enemy) enemy[hitKey] = false; }, 200);
            }
        });

        if (this.x < -100 || this.x > this.game.width + 100) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        // Glowing particle trail
        this.particles.forEach(p => {
            context.save();
            context.globalAlpha = p.alpha;
            context.shadowColor = p.color;
            context.shadowBlur = 10;
            context.fillStyle = p.color;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });

        context.save();
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Outer demonic aura
        context.shadowColor = '#ff2244';
        context.shadowBlur = 25;

        // Flame lobe petals (4 flickering lobes)
        const now = Date.now();
        for (let lobe = 0; lobe < 4; lobe++) {
            const angle = (lobe / 4) * Math.PI * 2 + now * 0.005;
            const len = 14 + Math.sin(now * 0.01 + lobe * 2) * 5;
            context.save();
            context.translate(cx, cy);
            context.rotate(angle);
            const lobeGrad = context.createLinearGradient(0, 0, len, 0);
            lobeGrad.addColorStop(0, '#ff6e40');
            lobeGrad.addColorStop(0.5, '#ff2244');
            lobeGrad.addColorStop(1, 'transparent');
            context.fillStyle = lobeGrad;
            context.beginPath();
            context.ellipse(len / 2, 0, len / 2, 5 + Math.sin(now * 0.012 + lobe) * 2, 0, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }

        // Core fireball gradient
        const grad = context.createRadialGradient(cx, cy, 1, cx, cy, 20);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, '#ff8a65');
        grad.addColorStop(0.5, '#ff2244');
        grad.addColorStop(0.8, '#4a148c');
        grad.addColorStop(1, 'transparent');

        context.beginPath();
        context.arc(cx, cy, 20, 0, Math.PI * 2);
        context.fillStyle = grad;
        context.fill();

        // Rotating ember ring
        const ringRot = (now * 0.004) % (Math.PI * 2);
        context.save();
        context.translate(cx, cy);
        context.rotate(ringRot);
        context.strokeStyle = '#ff6e40';
        context.lineWidth = 1.5;
        context.shadowColor = '#ff6e40';
        context.shadowBlur = 8;
        context.beginPath();
        context.arc(0, 0, 15, 0, Math.PI * 0.6);
        context.stroke();
        context.beginPath();
        context.arc(0, 0, 15, Math.PI, Math.PI * 1.6);
        context.stroke();
        context.restore();

        // Bright white center
        context.shadowBlur = 0;
        context.beginPath();
        context.arc(cx, cy, 5, 0, Math.PI * 2);
        context.fillStyle = '#ffffff';
        context.fill();

        context.restore();
    }
}

// DuskBorne's R: Chaos Cataclysm Projectile (Giant demonic rift slash — redesigned)
export class ChaosCataclysmProjectile {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.x = x;
        this.y = y - 50;
        this.facingLeft = facingLeft;
        this.width = 130;
        this.height = 200;
        this.speed = facingLeft ? -13 : 13;
        this.damage = 55;
        this.markedForDeletion = false;
        this.particles = [];
        this.sparkTimer = 0;
        this.rotation = 0;
        this.age = 0;

        this.game.shake = Math.max(this.game.shake, 24);
    }

    update(deltaTime) {
        this.x += this.speed;
        this.age += deltaTime;
        this.rotation += (this.facingLeft ? -0.08 : 0.08) * (deltaTime / 16.6);

        this.sparkTimer += deltaTime;
        if (this.sparkTimer > 20) {
            this.sparkTimer = 0;
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * this.height * 0.4;
                const cx = this.x + this.width / 2 + Math.cos(angle) * dist;
                const cy = this.y + this.height / 2 + Math.sin(angle) * dist;
                this.particles.push({
                    x: cx,
                    y: cy,
                    vx: -this.speed * 0.3 + (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    size: Math.random() * 10 + 4,
                    alpha: 1.0,
                    color: Math.random() > 0.5 ? '#ff2244' : Math.random() > 0.4 ? '#311b92' : '#ff6e40'
                });
            }
        }

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.04;
            p.size *= 0.95;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        this.game.enemies.forEach(enemy => {
            if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;

            const hit =
                this.x < enemy.x + enemy.width &&
                this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height &&
                this.y + this.height > enemy.y;

            if (hit) {
                const hitKey = '_hitByChaosUltimate';
                if (enemy[hitKey]) return;
                enemy[hitKey] = true;

                if (typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(this.damage);
                } else {
                    enemy.currentHP -= this.damage;
                }
                this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'orange');

                setTimeout(() => { if (enemy) enemy[hitKey] = false; }, 300);
            }
        });

        if (this.x < -300 || this.x > this.game.width + 300) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        // Swirling void particles trail
        this.particles.forEach(p => {
            context.save();
            context.globalAlpha = p.alpha;
            context.shadowColor = '#ff2244';
            context.shadowBlur = 8;
            context.fillStyle = p.color;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });

        context.save();
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        context.translate(cx, cy);
        context.rotate(this.rotation);

        // Outer dark void aura
        context.shadowColor = '#ff2244';
        context.shadowBlur = 35;
        const outerGrad = context.createRadialGradient(0, 0, 20, 0, 0, this.height / 2);
        outerGrad.addColorStop(0, 'rgba(49, 27, 146, 0.6)');
        outerGrad.addColorStop(0.4, 'rgba(255, 34, 68, 0.35)');
        outerGrad.addColorStop(0.7, 'rgba(180, 0, 50, 0.15)');
        outerGrad.addColorStop(1, 'transparent');
        context.beginPath();
        context.arc(0, 0, this.height / 2, 0, Math.PI * 2);
        context.fillStyle = outerGrad;
        context.fill();

        // Spinning crimson ring arcs
        const now = Date.now();
        for (let ring = 0; ring < 3; ring++) {
            const r = 25 + ring * 22;
            const angle = (now * (0.002 + ring * 0.001)) % (Math.PI * 2);
            context.save();
            context.rotate(angle * (ring % 2 === 0 ? 1 : -1));
            context.strokeStyle = ring === 0 ? '#ff2244' : ring === 1 ? '#ff6e40' : '#e040fb';
            context.lineWidth = 3 - ring * 0.5;
            context.shadowColor = context.strokeStyle;
            context.shadowBlur = 12;
            context.beginPath();
            context.arc(0, 0, r, 0, Math.PI * (0.5 + ring * 0.25));
            context.stroke();
            context.beginPath();
            context.arc(0, 0, r, Math.PI, Math.PI * (1.5 + ring * 0.25));
            context.stroke();
            context.restore();
        }

        // Crescent blade shape (the rift slash)
        if (this.facingLeft) context.scale(-1, 1);
        context.shadowColor = '#ff2244';
        context.shadowBlur = 20;

        const bladeGrad = context.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
        bladeGrad.addColorStop(0, '#ffffff');
        bladeGrad.addColorStop(0.2, '#ff2244');
        bladeGrad.addColorStop(0.55, '#d50000');
        bladeGrad.addColorStop(0.8, '#311b92');
        bladeGrad.addColorStop(1, 'transparent');

        context.fillStyle = bladeGrad;
        context.beginPath();
        context.arc(0, 0, this.height / 2.2, -Math.PI * 0.38, Math.PI * 0.38);
        context.quadraticCurveTo(-this.width * 0.35, 0,
            Math.cos(-Math.PI * 0.38) * (this.height / 2.2),
            Math.sin(-Math.PI * 0.38) * (this.height / 2.2));
        context.closePath();
        context.fill();

        // Bright energy core
        context.shadowBlur = 0;
        const coreGrad = context.createRadialGradient(0, 0, 2, 0, 0, 16);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, '#ff8a80');
        coreGrad.addColorStop(1, 'transparent');
        context.beginPath();
        context.arc(0, 0, 16, 0, Math.PI * 2);
        context.fillStyle = coreGrad;
        context.fill();

        context.restore();
    }
}

// Shaia's Normal Attack: Golden Star Projectile
export class GoldenStarProjectile {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.facingLeft = facingLeft;
        this.width = 45;
        this.height = 45;
        this.speed = facingLeft ? -13 : 13;
        this.damage = 18;
        this.markedForDeletion = false;
        this.particles = [];
        this.age = 0;
        this.rotation = 0;
    }

    update(deltaTime) {
        this.x += this.speed;
        this.age += deltaTime;
        this.rotation += 0.2 * (deltaTime / 16.6);

        // Trail particles
        if (Math.random() < 0.6) {
            this.particles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * 10,
                y: this.y + this.height / 2 + (Math.random() - 0.5) * 10,
                vx: -this.speed * 0.1 + (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                size: Math.random() * 5 + 2,
                alpha: 1.0,
                color: Math.random() > 0.5 ? '#ffd54f' : '#fff59d'
            });
        }

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.05;
            p.size *= 0.95;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        this.game.enemies.forEach(enemy => {
            if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;
            const hit = this.x < enemy.x + enemy.width && this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height && this.y + this.height > enemy.y;

            if (hit) {
                const hitKey = '_hitByGoldenStar';
                if (enemy[hitKey]) return;
                enemy[hitKey] = true;

                if (typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(this.damage);
                } else {
                    enemy.currentHP -= this.damage;
                }
                this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'yellow');
                setTimeout(() => { if (enemy) enemy[hitKey] = false; }, 200);
            }
        });

        if (this.x < -100 || this.x > this.game.width + 100) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();
        this.particles.forEach(p => {
            context.save();
            context.globalAlpha = p.alpha;
            context.shadowColor = '#fbc02d';
            context.shadowBlur = 5;
            context.fillStyle = p.color;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        context.translate(cx, cy);
        context.rotate(this.rotation);

        context.shadowColor = '#fbc02d';
        context.shadowBlur = 15;

        const pulse = 1 + 0.1 * Math.sin(this.age * 0.02);
        context.scale(pulse, pulse);

        context.beginPath();
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const r = i % 2 === 0 ? 20 : 8;
            context.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        context.closePath();
        context.fillStyle = '#fff9c4';
        context.fill();
        context.strokeStyle = '#fbc02d';
        context.lineWidth = 2;
        context.stroke();

        context.restore();
    }
}

// ArchDemon's Normal Attack: Dragon Shadow Projectile
export class DragonShadowProjectile {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.facingLeft = facingLeft;
        this.width = 160;
        this.height = 110;
        this.speed = facingLeft ? -14 : 14;
        this.damage = 45;
        this.markedForDeletion = false;
        this.particles = [];
        this.age = 0;
    }

    update(deltaTime) {
        this.x += this.speed;
        this.age += deltaTime;

        // Spawn trailing dark energy smoke
        if (Math.random() < 0.7) {
            this.particles.push({
                x: this.x + this.width / 2 + (this.facingLeft ? 40 : -40) + (Math.random() - 0.5) * 20,
                y: this.y + this.height / 2 + (Math.random() - 0.5) * 25,
                vx: -this.speed * 0.3 + (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                size: Math.random() * 12 + 6,
                alpha: 1.0,
                color: Math.random() > 0.5 ? '#110022' : '#311b92' // Deep shadow / dark purple
            });
        }

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.04;
            p.size *= 0.95;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        this.game.enemies.forEach(enemy => {
            if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;

            const hit =
                this.x < enemy.x + enemy.width &&
                this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height &&
                this.y + this.height > enemy.y;

            if (hit) {
                const hitKey = '_hitByDragonShadow';
                if (enemy[hitKey]) return;
                enemy[hitKey] = true;

                if (typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(this.damage);
                } else {
                    enemy.currentHP -= this.damage;
                }
                this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'purple');
                this.game.shake = Math.max(this.game.shake, 12);

                setTimeout(() => { if (enemy) enemy[hitKey] = false; }, 200);
            }
        });

        if (this.x < -150 || this.x > this.game.width + 150) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();

        // Trail smoke particles
        this.particles.forEach(p => {
            context.save();
            context.globalAlpha = p.alpha;
            context.shadowColor = '#6a1b9a';
            context.shadowBlur = 10;
            context.fillStyle = p.color;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        context.translate(cx, cy);
        if (this.facingLeft) context.scale(-1, 1);
        context.scale(2.2, 2.2);

        // Dark aura behind the dragon head
        context.shadowColor = '#6a1b9a';
        context.shadowBlur = 20;

        // Dragon head shape (facing right)
        context.fillStyle = '#0a001a'; // Almost black/deep purple
        context.beginPath();
        context.moveTo(-35, 5); // Neck base
        context.lineTo(-20, -15); // Back of head
        context.lineTo(-10, -30); // Horn start
        context.lineTo(0, -45); // Horn tip (longer, sharper)
        context.lineTo(5, -25); // Forehead
        context.lineTo(25, -20); // Snout top
        context.lineTo(40, -5); // Nose tip
        context.lineTo(25, 5); // Upper jaw
        context.lineTo(10, 5); // Mouth corner
        context.lineTo(25, 20); // Lower jaw tip (open mouth)
        context.lineTo(0, 25); // Chin
        context.lineTo(-25, 20); // Bottom neck
        context.closePath();
        context.fill();

        // Inner glowing highlights on the edges for depth
        context.strokeStyle = 'rgba(106, 27, 154, 0.6)';
        context.lineWidth = 2;
        context.stroke();

        // Glowing Eye (red/purple)
        context.shadowColor = '#ff2244';
        context.shadowBlur = 15;
        context.fillStyle = '#ff2244';
        context.beginPath();
        context.ellipse(10, -10, 6, 2.5, Math.PI / 6, 0, Math.PI * 2);
        context.fill();

        // Secondary small eye glow
        context.fillStyle = '#ffffff';
        context.shadowBlur = 0;
        context.beginPath();
        context.arc(11, -10, 1.5, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }
}

// ArchDemon's Normal Attack: Dark Ball Projectile
export class DarkBallProjectile {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.facingLeft = facingLeft;
        this.width = 45;
        this.height = 45;
        this.speed = facingLeft ? -12 : 12;
        this.damage = 15;
        this.markedForDeletion = false;
        this.particles = [];
        this.age = 0;
    }

    update(deltaTime) {
        this.x += this.speed;
        this.age += deltaTime;

        // Spawn trailing dark energy particles
        if (Math.random() < 0.5) {
            this.particles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * 15,
                y: this.y + this.height / 2 + (Math.random() - 0.5) * 15,
                vx: -this.speed * 0.2 + (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 6 + 2,
                alpha: 1.0,
                color: Math.random() > 0.5 ? '#1a0033' : '#4a0080' // Dark void / deep purple
            });
        }

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.05;
            p.size *= 0.95;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        this.game.enemies.forEach(enemy => {
            if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;

            const hit =
                this.x < enemy.x + enemy.width &&
                this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height &&
                this.y + this.height > enemy.y;

            if (hit) {
                const hitKey = '_hitByDarkBall';
                if (enemy[hitKey]) return;
                enemy[hitKey] = true;

                if (typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(this.damage);
                } else {
                    enemy.currentHP -= this.damage;
                }
                this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'purple');

                setTimeout(() => { if (enemy) enemy[hitKey] = false; }, 200);
            }
        });

        if (this.x < -100 || this.x > this.game.width + 100) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();

        // Trail particles
        this.particles.forEach(p => {
            context.save();
            context.globalAlpha = p.alpha;
            context.shadowColor = '#8e24aa';
            context.shadowBlur = 5;
            context.fillStyle = p.color;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Dark aura
        context.shadowColor = '#6a1b9a';
        context.shadowBlur = 15;
        const aura = context.createRadialGradient(cx, cy, 5, cx, cy, 22);
        aura.addColorStop(0, '#000000');
        aura.addColorStop(0.5, '#4a0080');
        aura.addColorStop(1, 'transparent');

        context.beginPath();
        context.arc(cx, cy, 22, 0, Math.PI * 2);
        context.fillStyle = aura;
        context.fill();

        // Core pulsating energy
        const pulse = 1 + 0.2 * Math.sin(this.age * 0.015);
        context.beginPath();
        context.arc(cx, cy, 10 * pulse, 0, Math.PI * 2);
        context.fillStyle = '#1a0033';
        context.fill();

        context.beginPath();
        context.arc(cx, cy, 4, 0, Math.PI * 2);
        context.fillStyle = '#ab47bc';
        context.fill();

        context.restore();
    }
}
