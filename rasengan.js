export class RasenganVortex {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.player = game.player;
        this.facingLeft = facingLeft;
        
        // Coordinates of the Rasengan orb (locks to player's hand during charging/leaping)
        this.x = x;
        this.y = y;
        this.width = 110;
        this.height = 110;
        this.radius = 55;

        this.chargeTimer = 0;
        this.chargeDuration = 1000; // 1s charge phase

        this.state = 'charging'; // 'charging' | 'leaping' | 'slamming' | 'exploding'
        this.markedForDeletion = false;
        
        this.particles = [];
        this.angle = 0;

        // Explosion phase timers
        this.explodeTimer = 0;
        this.explodeDuration = 1000; // 1s visual explosion dome
        this.damageInterval = 100;
        this.damageTimer = 0;

        this.targetEnemy = null;

        // Lock player inputs & reset custom speed
        this.player.rasenganActive = true;
        this.player.rasenganVx = 0;

        this.chargeSound = new Audio('asset/music/naruto-rasenganshippuden.mp3');
        this.chargeSound.volume = this.game.audio ? this.game.audio.sfxVolume * 0.45 : 0.5;
        this.chargeSound.play().catch(e => console.log(e));
    }

    update(deltaTime) {
        this.angle += 0.35; // fast spin

        // Coordinates lock to player's hand during charge, leap, and dive
        if (this.state === 'charging' || this.state === 'leaping' || this.state === 'slamming') {
            const handX = this.player.x + (this.player.facingLeft ? -10 : this.player.width - 15);
            const handY = this.player.y + this.player.height * 0.4;
            this.x = handX;
            this.y = handY;
        }

        // Clean up if player dies
        if (this.player.isDead) {
            if (this.chargeSound) {
                this.chargeSound.pause();
                this.chargeSound = null;
            }
            this.player.rasenganActive = false;
            this.markedForDeletion = true;
            return;
        }

        if (this.state === 'charging') {
            // MUST hold T key to charge! If released early, cancel without consuming the charge
            if (!this.game.input.keys.includes('t')) {
                if (this.chargeSound) {
                    this.chargeSound.pause();
                    this.chargeSound = null;
                }
                this.player.rasenganActive = false;
                this.markedForDeletion = true;
                return;
            }

            this.chargeTimer += deltaTime;
            
            // Keep player locked in position
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.rasenganVx = 0;

            // Swirly charging particles
            if (Math.random() < 0.8) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 70 + Math.random() * 30;
                this.particles.push({
                    x: this.x + Math.cos(angle) * dist,
                    y: this.y + Math.sin(angle) * dist,
                    vx: -Math.cos(angle) * 4.5,
                    vy: -Math.sin(angle) * 4.5,
                    size: Math.random() * 5 + 2,
                    alpha: 1.0,
                    color: '#4fc3f7',
                    mode: 'charge'
                });
            }

            // Once fully charged, consume charge and launch!
            if (this.chargeTimer >= this.chargeDuration) {
                this.state = 'leaping';

                // Consume the special move charge now
                this.game.specialMoveUses = 0;
                this.game.activeSpecialMove = null;
                const specialBtn = document.getElementById('vbtn-special');
                if (specialBtn) specialBtn.style.display = 'none';

                // Find nearest enemy to target
                let targetEnemy = null;
                let minDist = 700;
                this.game.enemies.forEach(enemy => {
                    if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;
                    const dx = (enemy.x + enemy.width / 2) - this.player.x;
                    const distance = Math.abs(dx);
                    if (distance < minDist) {
                        minDist = distance;
                        targetEnemy = enemy;
                    }
                });

                this.targetEnemy = targetEnemy;
                this.player.vy = -14; // leap upwards
                
                if (this.game.audio) {
                    this.game.audio.playSFX('sprint');
                }
            }
        } else if (this.state === 'leaping') {
            // Homing tracking towards target enemy's horizontal position
            if (this.targetEnemy && !this.targetEnemy.markedForDeletion) {
                const gravity = this.player.weight || 0.16;
                const ticksRemaining = Math.max(1, Math.abs(this.player.vy) / gravity);
                const dx = (this.targetEnemy.x + this.targetEnemy.width / 2) - (this.player.x + this.player.width / 2);
                this.player.rasenganVx = dx / ticksRemaining;
                this.player.facingLeft = dx < 0;
            } else {
                this.player.rasenganVx = this.player.facingLeft ? -7 : 7;
            }

            // Check if player reaches peak of the jump and starts falling down
            if (this.player.vy >= -1) {
                // Align player horizontal position exactly to target's center for precise slam
                if (this.targetEnemy && !this.targetEnemy.markedForDeletion) {
                    this.player.x = (this.targetEnemy.x + this.targetEnemy.width / 2) - this.player.width / 2;
                }
                this.state = 'slamming';
                this.player.rasenganVx = 0; // stop horizontal movement
                this.player.vy = 18; // fast downward dive slam

                // Skip voice to 4.0s for the climax dive shout!
                if (this.chargeSound) {
                    this.chargeSound.currentTime = 4.0;
                }
            }

            // Air friction trails
            if (Math.random() < 0.6) {
                this.particles.push({
                    x: this.x + (Math.random() - 0.5) * 30,
                    y: this.y + (Math.random() - 0.5) * 30,
                    vx: -this.player.rasenganVx * 0.3,
                    vy: 2,
                    size: Math.random() * 8 + 3,
                    alpha: 1.0,
                    color: '#e0f7fa',
                    mode: 'trail'
                });
            }
        } else if (this.state === 'slamming') {
            // Force dive velocities
            this.player.rasenganVx = 0;
            this.player.vy = 18;

            if (this.player.onGround()) {
                this.triggerExplosion();
            }

            // Dive speed particles
            if (Math.random() < 0.8) {
                this.particles.push({
                    x: this.x + (Math.random() - 0.5) * 40,
                    y: this.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -9 - Math.random() * 6,
                    size: Math.random() * 9 + 4,
                    alpha: 1.0,
                    color: '#ffffff',
                    mode: 'slam'
                });
            }
        } else if (this.state === 'exploding') {
            this.explodeTimer += deltaTime;
            
            // Keep player locked in place during impact
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.rasenganVx = 0;

            // Spawn massive ground impact explosion particles swirling upwards
            if (Math.random() < 0.9) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 8;
                this.particles.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y + this.player.height - 15,
                    vx: Math.cos(angle) * speed,
                    vy: -Math.random() * 6 - 2, // upwards bias
                    size: Math.random() * 16 + 5,
                    alpha: 1.0,
                    color: Math.random() > 0.45 ? '#00b0ff' : '#ffffff',
                    mode: 'explode'
                });
            }

            // Continuous ticks of damage inside the chakra dome
            this.damageTimer += deltaTime;
            if (this.damageTimer >= this.damageInterval) {
                this.damageTimer = 0;

                const rx = this.player.x + this.player.width / 2;
                const ry = this.player.y + this.player.height - 15;
                const radius = 170;

                this.game.enemies.forEach(enemy => {
                    if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;
                    const dx = (enemy.x + enemy.width / 2) - rx;
                    const dy = (enemy.y + enemy.height / 2) - ry;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < radius) {
                        // Boss health shred: entire explosion (10 ticks over 1s) deals exactly 35% of boss max health.
                        // Standard enemies take 7 damage per tick.
                        const finalDamage = enemy.isBoss ? Math.ceil((0.35 * enemy.maxHP) / 10) : 7;

                        if (typeof enemy.takeDamage === 'function') {
                            enemy.takeDamage(finalDamage);
                        } else {
                            enemy.currentHP -= finalDamage;
                        }
                        this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#4fc3f7');
                    }
                });
            }

            if (this.explodeTimer >= this.explodeDuration) {
                this.cleanup();
            }
        }

        // Update active particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.mode === 'charge') {
                const dx = p.x - this.x;
                const dy = p.y - this.y;
                if (Math.sqrt(dx * dx + dy * dy) < 8) {
                    p.alpha = 0;
                }
            } else {
                p.alpha -= 0.04;
                p.size *= 0.94;
            }
        });
        this.particles = this.particles.filter(p => p.alpha > 0);
    }

    triggerExplosion() {
        this.state = 'exploding';
        this.explodeTimer = 0;
        this.game.shake = Math.max(this.game.shake, 24);
        if (this.game.audio) {
            this.game.audio.playSFX('punch');
        }
        if (this.chargeSound) {
            this.chargeSound.pause();
            this.chargeSound = null;
        }
    }

    cleanup() {
        if (this.chargeSound) {
            this.chargeSound.pause();
            this.chargeSound = null;
        }
        this.player.rasenganActive = false;
        this.player.rasenganVx = 0;
        this.markedForDeletion = true;
    }

    draw(context) {
        context.save();

        // 1. Draw particles
        this.particles.forEach(p => {
            context.save();
            context.globalAlpha = Math.max(0, Math.min(1, p.alpha));
            context.shadowColor = '#00b0ff';
            context.shadowBlur = 10;
            context.fillStyle = p.color;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });

        // 2. Draw core Rasengan sphere or the massive swirling chakra dome
        if (this.state === 'charging' || this.state === 'leaping' || this.state === 'slamming') {
            const cx = this.x;
            const cy = this.y;

            context.shadowColor = '#00b0ff';
            context.shadowBlur = 20;

            const grad = context.createRadialGradient(cx, cy, 0, cx, cy, this.radius);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#e0f7fa');
            grad.addColorStop(0.7, '#00b0ff');
            grad.addColorStop(1, 'rgba(0, 176, 255, 0)');

            context.beginPath();
            context.arc(cx, cy, this.radius, 0, Math.PI * 2);
            context.fillStyle = grad;
            context.fill();

            // Swirling orbiting rings
            context.shadowBlur = 0;
            context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            context.lineWidth = 1.8;
            context.translate(cx, cy);
            context.rotate(this.angle);
            for (let i = 0; i < 4; i++) {
                context.beginPath();
                context.arc(0, 0, this.radius * (0.35 + i * 0.15), i * Math.PI / 2, i * Math.PI / 2 + Math.PI / 1.4);
                context.stroke();
            }
        } else if (this.state === 'exploding') {
            const cx = this.player.x + this.player.width / 2;
            const cy = this.player.y + this.player.height - 15;
            const progress = this.explodeTimer / this.explodeDuration;
            const maxExplodeRadius = 180;
            const radius = maxExplodeRadius * Math.sin(progress * Math.PI / 2); // expand fast, then slow down
            const alpha = 1.0 - progress;

            context.shadowColor = '#00b0ff';
            context.shadowBlur = 25;
            context.globalAlpha = alpha;

            // Draw expanding radial chakra dome
            const grad = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, 'rgba(128, 222, 234, 0.8)');
            grad.addColorStop(0.6, 'rgba(0, 176, 255, 0.55)');
            grad.addColorStop(1, 'rgba(0, 176, 255, 0)');

            context.beginPath();
            context.arc(cx, cy, radius, 0, Math.PI * 2);
            context.fillStyle = grad;
            context.fill();

            // Draw swirling wind rings (like Naruto image)
            context.shadowBlur = 0;
            context.strokeStyle = 'rgba(255, 255, 255, 0.95)';
            context.lineWidth = 3.5;
            context.translate(cx, cy);
            context.rotate(this.angle * 1.5);
            
            for (let i = 0; i < 4; i++) {
                context.beginPath();
                // Draw 3D-angled swirling ellipses
                context.ellipse(0, 0, radius * (0.45 + i * 0.13), radius * (0.28 + i * 0.08), (i * Math.PI) / 4, 0, Math.PI * 2);
                context.stroke();
            }
        }

        context.restore();
    }
}
