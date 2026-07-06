export class BossFireballProjectile {
    constructor(game, x, y, dx, dy, speed = 24, damage = 25) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.radius = 32;
        this.markedForDeletion = false;
        this.damage = damage;
        this.particles = [];
    }

    update(deltaTime) {

        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        const scrollShift = this.game.scrollSpeed || 0;
        this.x -= scrollShift;

        if (
            this.x < -150 ||
            this.x > this.game.width + 150 ||
            this.y < -150 ||
            this.y > this.game.height + 150
        ) {
            this.markedForDeletion = true;
        }

        // Multiplayer-aware collision
        const playersToCheck = (this.game.isMultiplayer && this.game.players && this.game.players.size > 1)
            ? [...this.game.players.values()]
            : [this.game.player];

        for (const player of playersToCheck) {
            if (!player || player.isDead) continue;
            const pLeft = player.x + player.width * 0.25;
            const pRight = player.x + player.width * 0.75;
            const pTop = player.y;
            const pBottom = player.y + player.height;
            const closestX = Math.max(pLeft, Math.min(this.x, pRight));
            const closestY = Math.max(pTop, Math.min(this.y, pBottom));
            const dist = Math.hypot(this.x - closestX, this.y - closestY);
            if (dist < this.radius) {
                if (player === this.game.player) {
                    this.game.hurtPlayer(this.damage, true);
                }
                this.markedForDeletion = true;
                break;
            }
        }

        // Black hole gravity only affects local player
        if (this.isBlackHole) {
            const player = this.game.player;
            const pdx = this.x - (player.x + player.width / 2);
            const pdy = this.y - (player.y + player.height / 2);
            const pdist = Math.max(1, Math.hypot(pdx, pdy));
            // Pull player towards black hole center with strong gravity force
            const pullStrength = 3.2 + (380 / pdist);
            player.x += (pdx / pdist) * pullStrength;
            player.y += (pdy / pdist) * pullStrength;

            // Keep player inside screen horizontal limits
            const leftLimit = (player.isDashing || !player.onGround()) ? 0 : 50;
            const rightLimit = this.game.width * 0.90 - player.width;
            player.x = Math.max(leftLimit, Math.min(player.x, rightLimit));

            // Keep player above ground limit
            const groundLimit = this.game.height - player.height - this.game.groundMargin - (player.bottomMargin || 0);
            if (player.y > groundLimit) {
                player.y = groundLimit;
            }

            // Spawn swirling/imploding matter particles
            if (Math.random() < 0.45) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 80 + Math.random() * 100;
                this.particles.push({
                    x: this.x + Math.cos(angle) * distance,
                    y: this.y + Math.sin(angle) * distance,
                    vx: 0,
                    vy: 0,
                    size: 2 + Math.random() * 5,
                    alpha: 1.0,
                    colorType: 'black_hole_matter',
                    angle: angle,
                    distance: distance
                });
            }

            // Update swirling particles (sucked into center)
            this.particles.forEach(p => {
                p.distance -= 2.8 * (deltaTime / 16.6); // move closer to center
                p.angle += 0.06 * (deltaTime / 16.6);   // spiral
                p.x = this.x + Math.cos(p.angle) * p.distance;
                p.y = this.y + Math.sin(p.angle) * p.distance;
                p.alpha -= 0.012 * (deltaTime / 16.6);
                if (p.distance <= 10) p.alpha = 0; // absorb into core
            });
            this.particles = this.particles.filter(p => p.alpha > 0);
        } else {
            this.particles.forEach(p => {
                p.x += p.vx - scrollShift;
                p.y += p.vy;
                p.alpha -= 0.035;
                p.size *= 0.95;
            });
            this.particles = this.particles.filter(p => p.alpha > 0 && p.size > 0.2);

            const angle = Math.atan2(this.dy, this.dx);
            const backAngle = angle + Math.PI;

            for (let i = 0; i < 3; i++) {
                const spreadAngle = backAngle + (Math.random() - 0.5) * 0.8;
                const pSpeed = (Math.random() * 3) + 1.0;
                this.particles.push({
                    x: this.x - this.dx * 15 + (Math.random() - 0.5) * 15,
                    y: this.y - this.dy * 15 + (Math.random() - 0.5) * 15,
                    vx: Math.cos(spreadAngle) * pSpeed + (Math.random() - 0.5) * 1.0,
                    vy: Math.sin(spreadAngle) * pSpeed - (Math.random() * 0.8),
                    size: this.radius * (0.4 + Math.random() * 0.6),
                    alpha: 0.8,
                    colorType: Math.random() > 0.4 ? 'red_fire' : 'yellow_flame'
                });
            }
        }
    }

    draw(context) {
        if (this.isBlackHole) {
            // Draw swirling/imploding matter particles first (behind the singularity) (optimized: single save/restore)
            if (this.particles.length > 0) {
                context.save();
                this.particles.forEach(p => {
                    if (p.colorType === 'black_hole_matter') {
                        context.beginPath();
                        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        // Glowing vibrant violet-purple color
                        context.fillStyle = `rgba(180, 0, 255, ${p.alpha})`;
                        context.fill();
                    }
                });
                context.restore();
            }

            context.save();
            context.translate(this.x, this.y);
            const time = Date.now() * 0.002;

            const outerRadius = this.radius * 4;
            const grad = context.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, outerRadius);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)'); // White-hot inner core edge
            grad.addColorStop(0.25, 'rgba(180, 0, 255, 0.85)'); // Glowing purple
            grad.addColorStop(0.65, 'rgba(40, 0, 90, 0.45)'); // Dark violet-blue outer glow
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            context.fillStyle = grad;
            context.beginPath();
            context.arc(0, 0, outerRadius, 0, Math.PI * 2);
            context.fill();

            context.rotate(time);
            context.strokeStyle = 'rgba(180, 0, 255, 0.55)'; // Deep purple orbiting ring
            context.lineWidth = 2;
            context.beginPath();
            context.ellipse(0, 0, outerRadius * 0.8, outerRadius * 0.3, time * 0.5, 0, Math.PI * 2);
            context.stroke();

            context.beginPath();
            context.ellipse(0, 0, outerRadius * 0.7, outerRadius * 0.4, -time * 0.3, 0, Math.PI * 2);
            context.stroke();

            // Event Horizon - pure black center
            context.fillStyle = '#000000';
            context.beginPath();
            context.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
            context.fill();

            // Outer glow edge rings of Event Horizon
            context.strokeStyle = 'rgba(230, 180, 255, 0.9)'; // Inner light violet highlight ring
            context.lineWidth = 4;
            context.beginPath();
            context.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
            context.stroke();
            context.strokeStyle = 'rgba(130, 0, 255, 0.85)'; // Outer intense purple ring
            context.lineWidth = 8;
            context.stroke();

            context.restore();
            return;
        }

        context.save();
        const t = Date.now();

        if (this.particles.length > 0) {
            context.save();
            this.particles.forEach(p => {
                context.beginPath();
                context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                if (p.colorType === 'red_fire') {
                    const grad = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    grad.addColorStop(0, `rgba(255, 69, 0, ${p.alpha})`);
                    grad.addColorStop(0.5, `rgba(255, 0, 0, ${p.alpha * 0.6})`);
                    grad.addColorStop(1, 'rgba(100, 0, 0, 0)');
                    context.fillStyle = grad;
                } else {
                    const grad = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    grad.addColorStop(0, `rgba(255, 215, 0, ${p.alpha})`);
                    grad.addColorStop(0.6, `rgba(255, 140, 0, ${p.alpha * 0.4})`);
                    grad.addColorStop(1, 'rgba(150, 50, 0, 0)');
                    context.fillStyle = grad;
                }
                context.fill();
            });
            context.restore();
        }

        const pulse = Math.sin(t * 0.015) * 3;
        const glowRadius = this.radius * 2.2 + pulse;
        const ambientGrad = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
        ambientGrad.addColorStop(0, 'rgba(255, 69, 0, 0.35)');
        ambientGrad.addColorStop(0.5, 'rgba(255, 0, 0, 0.15)');
        ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.beginPath();
        context.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        context.fillStyle = ambientGrad;
        context.fill();

        const numFlames = 3;
        for (let i = 0; i < numFlames; i++) {
            context.save();
            context.translate(this.x, this.y);
            const angle = Math.atan2(this.dy, this.dx);
            context.rotate(angle + Math.PI);

            const flickerScaleX = 1.0 + Math.sin(t * 0.02 + i) * 0.15;
            const flickerScaleY = 1.0 + Math.cos(t * 0.025 + i) * 0.1;
            context.scale(flickerScaleX, flickerScaleY);

            context.beginPath();

            context.moveTo(0, -this.radius);
            context.quadraticCurveTo(this.radius * 1.2, -this.radius * 0.3, this.radius * 2.2, 0);
            context.quadraticCurveTo(this.radius * 1.2, this.radius * 0.3, 0, this.radius);
            context.arc(0, 0, this.radius, Math.PI / 2, -Math.PI / 2, true);
            context.closePath();

            const flameGrad = context.createLinearGradient(0, 0, this.radius * 2, 0);
            if (i === 0) {
                flameGrad.addColorStop(0, 'rgba(255, 69, 0, 0.8)');
                flameGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.4)');
                flameGrad.addColorStop(1, 'rgba(250, 50, 0, 0)');
            } else if (i === 1) {
                flameGrad.addColorStop(0, 'rgba(255, 165, 0, 0.9)');
                flameGrad.addColorStop(0.4, 'rgba(255, 69, 0, 0.5)');
                flameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            } else {
                flameGrad.addColorStop(0, 'rgba(255, 255, 200, 0.95)');
                flameGrad.addColorStop(0.3, 'rgba(255, 215, 0, 0.6)');
                flameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            }
            context.fillStyle = flameGrad;
            context.shadowColor = '#ff4500';
            context.shadowBlur = 15;
            context.fill();
            context.restore();
        }

        context.save();
        context.beginPath();
        context.arc(this.x, this.y, this.radius * 0.55, 0, Math.PI * 2);
        const coreGrad = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 0.55);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, '#fff5d0');
        coreGrad.addColorStop(0.8, '#ff8c00');
        coreGrad.addColorStop(1, 'rgba(255, 69, 0, 0)');
        context.fillStyle = coreGrad;
        context.shadowColor = '#ffffff';
        context.shadowBlur = 10;
        context.fill();
        context.restore();

        context.restore();
    }
}

export class BossGiantFireball extends BossFireballProjectile {
    constructor(game, x, y, dx, dy, speed = 6, damage = 40) {
        super(game, x, y, dx, dy, speed, damage);
        this.radius = 70;
    }
}

export class FirePillar {
    constructor(game, x, y, delay = 800, damage = 25) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = game.height - y + 100;
        this.delay = delay;
        this.activeTime = 1200;
        this.timer = 0;
        this.markedForDeletion = false;
        this.damage = damage;
        this.hasDealtDamage = false;
        this.particles = [];
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.delay + this.activeTime) {
            this.markedForDeletion = true;
            return;
        }

        const isErupting = this.timer >= this.delay;

        if (isErupting) {
            const playersToCheck = (this.game.isMultiplayer && this.game.players && this.game.players.size > 1)
                ? [...this.game.players.values()]
                : [this.game.player];

            for (const player of playersToCheck) {
                if (!player || player.isDead) continue;
                const px = player.x + player.width / 2;
                const overlaps = Math.abs(px - this.x) < (this.width / 2 + player.width * 0.3);
                if (overlaps && !this.hasDealtDamage) {
                    if (player === this.game.player) {
                        if (this.game.hitCooldown <= 0) {
                            this.game.currentHP = Math.max(0, this.game.currentHP - this.damage);
                            this.game.playerHit = true;
                            this.game.hitCooldown = this.game.hitCooldownMax;
                            this.hasDealtDamage = true;
                            player.takingDamage = true;
                            if (this.game.currentHP <= 0) {
                                player.killedByBoss = true;
                            }
                        }
                    } else {
                        // Mark damage dealt so it doesn't double-hit other client simulations
                        this.hasDealtDamage = true;
                    }
                }
            }
            for (let i = 0; i < 3; i++) {
                this.particles.push({
                    x: this.x + (Math.random() - 0.5) * this.width,
                    y: this.y - Math.random() * (this.game.height - this.y),
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: -Math.random() * 4 - 2,
                    size: Math.random() * 16 + 8,
                    alpha: 0.9,
                    color: Math.random() > 0.5 ? 'rgba(255, 69, 0, 0.85)' : 'rgba(255, 215, 0, 0.85)'
                });
            }
        } else {
            if (Math.random() < 0.3) {
                this.particles.push({
                    x: this.x + (Math.random() - 0.5) * this.width,
                    y: this.y - 2,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: -Math.random() * 2 - 0.5,
                    size: Math.random() * 6 + 3,
                    alpha: 0.6,
                    color: 'rgba(255, 0, 0, 0.5)'
                });
            }
        }

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;
            p.size *= 0.97;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);
    }

    draw(context) {
        context.save();

        const isErupting = this.timer >= this.delay;

        if (isErupting) {
            const grad = context.createLinearGradient(this.x - this.width / 2, 0, this.x + this.width / 2, 0);
            grad.addColorStop(0, 'rgba(255, 0, 0, 0)');
            grad.addColorStop(0.3, 'rgba(255, 69, 0, 0.7)');
            grad.addColorStop(0.5, 'rgba(255, 230, 100, 0.9)');
            grad.addColorStop(0.7, 'rgba(255, 69, 0, 0.7)');
            grad.addColorStop(1, 'rgba(255, 0, 0, 0)');

            context.fillStyle = grad;
            context.fillRect(this.x - this.width / 2, 0, this.width, this.y);

            context.fillStyle = 'rgba(255, 255, 255, 0.35)';
            context.fillRect(this.x - 6, 0, 12, this.y);
        } else {
            const warningAlpha = 0.25 + 0.25 * Math.sin(Date.now() * 0.015);
            const grad = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.width);
            grad.addColorStop(0, `rgba(255, 0, 0, ${warningAlpha * 0.9})`);
            grad.addColorStop(0.6, `rgba(255, 100, 0, ${warningAlpha * 0.4})`);
            grad.addColorStop(1, 'rgba(255, 0, 0, 0)');

            context.beginPath();
            context.ellipse(this.x, this.y, this.width * 1.2, 10, 0, 0, Math.PI * 2);
            context.fillStyle = grad;
            context.fill();
        }

        this.particles.forEach(p => {
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fillStyle = p.color;
            context.fill();
        });

        context.restore();
    }
}

export class FlameThrowerParticle {
    constructor(game, x, y, dx, dy, speed = 8, damage = 3) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.dx = dx + (Math.random() - 0.5) * 0.35;
        this.dy = dy + (Math.random() - 0.5) * 0.35;
        const len = Math.hypot(this.dx, this.dy);
        this.dx /= len;
        this.dy /= len;
        this.speed = speed * (0.85 + Math.random() * 0.3);
        this.radius = 16;
        this.maxRadius = 60;
        this.markedForDeletion = false;
        this.damage = damage;
        this.life = 1000;
        this.timer = 0;
    }

    update(deltaTime) {
        this.timer += deltaTime;
        const ratio = this.timer / this.life;
        if (ratio >= 1.0) {
            this.markedForDeletion = true;
            return;
        }

        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        const scrollShift = this.game.scrollSpeed || 0;
        this.x -= scrollShift;

        this.radius = 16 + (this.maxRadius - 16) * ratio;

        const playersToCheck = (this.game.isMultiplayer && this.game.players && this.game.players.size > 1)
            ? [...this.game.players.values()]
            : [this.game.player];

        for (const player of playersToCheck) {
            if (!player || player.isDead) continue;
            const pLeft = player.x + player.width * 0.25;
            const pRight = player.x + player.width * 0.75;
            const pTop = player.y;
            const pBottom = player.y + player.height;

            const closestX = Math.max(pLeft, Math.min(this.x, pRight));
            const closestY = Math.max(pTop, Math.min(this.y, pBottom));
            const dist = Math.hypot(this.x - closestX, this.y - closestY);

            if (dist < this.radius) {
                if (player === this.game.player) {
                    if (this.game.hitCooldown <= 0) {
                        this.game.currentHP = Math.max(0, this.game.currentHP - this.damage);
                        this.game.playerHit = true;
                        this.game.hitCooldown = 250;
                        player.takingDamage = true;
                        if (this.game.currentHP <= 0) {
                            player.killedByBoss = true;
                        }
                    }
                }
                break;
            }
        }
    }

    draw(context) {
        context.save();
        const ratio = this.timer / this.life;
        const alpha = 1.0 - ratio;

        const grad = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        if (ratio < 0.4) {
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            grad.addColorStop(0.3, `rgba(255, 215, 0, ${alpha * 0.85})`);
            grad.addColorStop(0.8, `rgba(255, 69, 0, ${alpha * 0.4})`);
        } else if (ratio < 0.75) {
            grad.addColorStop(0, `rgba(255, 140, 0, ${alpha * 0.9})`);
            grad.addColorStop(0.5, `rgba(255, 0, 0, ${alpha * 0.5})`);
            grad.addColorStop(1, 'rgba(120, 0, 0, 0)');
        } else {
            grad.addColorStop(0, `rgba(130, 30, 0, ${alpha * 0.6})`);
            grad.addColorStop(0.6, `rgba(40, 40, 40, ${alpha * 0.3})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = grad;
        context.fill();
        context.restore();
    }
}
