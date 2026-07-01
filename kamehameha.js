export class KamehamehaBeam {
    constructor(game, x, y, facingLeft) {
        this.game = game;
        this.player = game.player;
        this.facingLeft = facingLeft;
        
        // Initial coordinates (will lock to player's hands)
        this.x = x;
        this.y = y;
        
        this.chargeTimer = 0;
        this.chargeDuration = 1200; // 1.2s charge phase
        
        this.fireTimer = 0;
        this.fireDuration = 1500; // 1.5s fire phase
        
        this.state = 'charging'; // 'charging' | 'firing'
        this.orbRadius = 5;
        this.maxOrbRadius = 40;
        
        this.damage = 28; // Standard tick damage for regular enemies
        this.damageInterval = 100;
        this.damageTimer = 0;
        
        this.markedForDeletion = false;
        this.particles = [];

        this.chargeSound = new Audio('asset/music/kame-hame-ha.mp3');
        this.chargeSound.volume = this.game.audio ? this.game.audio.sfxVolume * 0.45 : 0.5;
        this.chargeSound.play().catch(e => console.log(e));
    }

    update(deltaTime) {
        // Keep beam locked to player's hand
        const handX = this.player.x + (this.player.facingLeft ? 10 : this.player.width - 25);
        const handY = this.player.y + this.player.height * 0.45;
        this.x = handX;
        this.y = handY;
        this.facingLeft = this.player.facingLeft; // follow player direction dynamically

        // If player is dead, cancel beam
        if (this.player.isDead) {
            if (this.chargeSound) {
                this.chargeSound.pause();
                this.chargeSound = null;
            }
            this.markedForDeletion = true;
            return;
        }

        if (this.state === 'charging') {
            // MUST hold T key to charge! If released early, cancel without consuming the special move use
            if (!this.game.input.keys.includes('t')) {
                if (this.chargeSound) {
                    this.chargeSound.pause();
                    this.chargeSound = null;
                }
                this.markedForDeletion = true;
                return;
            }

            this.chargeTimer += deltaTime;
            const progress = Math.min(1, this.chargeTimer / this.chargeDuration);
            this.orbRadius = 5 + (this.maxOrbRadius - 5) * progress;

            // Lock player in place while charging
            if (this.player.vy === 0) {
                this.player.vx = 0;
            }

            // Spawn inward-pulling particles
            if (Math.random() < 0.7) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 60 + Math.random() * 40;
                this.particles.push({
                    x: this.x + Math.cos(angle) * dist,
                    y: this.y + Math.sin(angle) * dist,
                    vx: -Math.cos(angle) * 3.5,
                    vy: -Math.sin(angle) * 3.5,
                    size: Math.random() * 6 + 2,
                    alpha: 1.0,
                    color: '#00e5ff',
                    mode: 'charge'
                });
            }

            // Once fully charged, transition to firing and consume the special move use!
            if (this.chargeTimer >= this.chargeDuration) {
                this.state = 'firing';
                
                // Consume the special move charge now
                this.game.specialMoveUses = 0;
                this.game.activeSpecialMove = null;
                const specialBtn = document.getElementById('vbtn-special');
                if (specialBtn) specialBtn.style.display = 'none';

                this.game.shake = Math.max(this.game.shake, 15);
                if (this.game.audio) {
                    this.game.audio.playSFX('laser');
                }
            }
        } else if (this.state === 'firing') {
            this.fireTimer += deltaTime;
            
            // Screen shake while firing
            this.game.shake = Math.max(this.game.shake, 10);

            // Lock player in place while firing
            if (this.player.vy === 0) {
                this.player.vx = 0;
            }

            // Spawn fire blast particles going forward from the hand
            const directionMultiplier = this.facingLeft ? -1 : 1;
            if (Math.random() < 0.9) {
                this.particles.push({
                    x: this.x,
                    y: this.y + (Math.random() - 0.5) * 40,
                    vx: directionMultiplier * (12 + Math.random() * 8),
                    vy: (Math.random() - 0.5) * 4,
                    size: Math.random() * 15 + 5,
                    alpha: 1.0,
                    color: Math.random() > 0.4 ? '#00e5ff' : '#ffffff',
                    mode: 'fire'
                });
            }

            // Ticking damage on enemies caught in the beam span
            this.damageTimer += deltaTime;
            if (this.damageTimer >= this.damageInterval) {
                this.damageTimer = 0;

                const beamHeight = 80;
                const beamTop = this.y - beamHeight / 2;
                const beamBottom = this.y + beamHeight / 2;

                this.game.enemies.forEach(enemy => {
                    if (enemy.markedForDeletion || !enemy.hasEnteredScreen) return;

                    // Horizontal check
                    let inBeamRange = false;
                    const beamLength = this.game.width * 0.8;
                    if (this.facingLeft) {
                        inBeamRange = enemy.x + enemy.width >= this.x - beamLength && enemy.x <= this.x;
                    } else {
                        inBeamRange = enemy.x >= this.x && enemy.x <= this.x + beamLength;
                    }

                    // Vertical overlap check
                    const verticalOverlap = enemy.y < beamBottom && enemy.y + enemy.height > beamTop;

                    if (inBeamRange && verticalOverlap) {
                        // Boss health shred: entire beam (15 ticks over 1.5s) deals exactly 35% of boss max health.
                        // Standard enemies take 28 damage per tick.
                        const finalDamage = enemy.isBoss ? Math.ceil((0.35 * enemy.maxHP) / 15) : this.damage;

                        if (typeof enemy.takeDamage === 'function') {
                            enemy.takeDamage(finalDamage);
                        } else {
                            enemy.currentHP -= finalDamage;
                        }
                        this.game.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#00e5ff');
                    }
                });
            }

            if (this.fireTimer >= this.fireDuration) {
                if (this.chargeSound) {
                    this.chargeSound.pause();
                    this.chargeSound = null;
                }
                this.markedForDeletion = true;
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
                p.alpha -= 0.05;
                p.size *= 0.95;
            }
        });
        this.particles = this.particles.filter(p => p.alpha > 0);
    }

    draw(context) {
        context.save();

        // 1. Draw particles
        this.particles.forEach(p => {
            context.save();
            context.globalAlpha = Math.max(0, Math.min(1, p.alpha));
            context.shadowColor = '#00e5ff';
            context.shadowBlur = 10;
            context.fillStyle = p.color;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });

        // 2. Draw Charging Orb or Beam
        if (this.state === 'charging') {
            context.shadowColor = '#00e5ff';
            context.shadowBlur = 25;

            const grad = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.orbRadius);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#b2ebf2');
            grad.addColorStop(0.6, '#00e5ff');
            grad.addColorStop(1, 'rgba(0, 229, 255, 0)');

            context.beginPath();
            context.arc(this.x, this.y, this.orbRadius, 0, Math.PI * 2);
            context.fillStyle = grad;
            context.fill();
        } else if (this.state === 'firing') {
            const startX = this.x;
            const beamLength = this.game.width * 0.8;
            const direction = this.facingLeft ? -1 : 1;
            const endX = startX + direction * beamLength;
            
            // Pulsing beam height
            const beamHeight = 65 + Math.sin(Date.now() * 0.06) * 8;

            context.shadowColor = '#00e5ff';
            context.shadowBlur = 25;

            // --- DRAW LAYER 1: Cyan outer glow path ---
            context.fillStyle = 'rgba(0, 229, 255, 0.25)';
            context.beginPath();
            // Start at top of starting dome
            context.arc(startX, this.y, (beamHeight / 2) * 1.25, Math.PI * 0.5, Math.PI * 1.5, this.facingLeft);
            // Draw to the end (tapering slightly at the last 15% of length)
            const taperStartX = startX + direction * (beamLength * 0.85);
            context.lineTo(taperStartX, this.y - (beamHeight / 2) * 1.25);
            context.lineTo(endX, this.y); // taper to point
            context.lineTo(taperStartX, this.y + (beamHeight / 2) * 1.25);
            context.closePath();
            context.fill();

            // --- DRAW LAYER 2: Bright cyan core beam ---
            const beamGrad = context.createLinearGradient(startX, this.y - beamHeight / 2, startX, this.y + beamHeight / 2);
            beamGrad.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
            beamGrad.addColorStop(0.2, '#00e5ff');
            beamGrad.addColorStop(0.5, '#e0f7fa');
            beamGrad.addColorStop(0.8, '#00e5ff');
            beamGrad.addColorStop(1, 'rgba(0, 229, 255, 0.4)');

            context.fillStyle = beamGrad;
            context.beginPath();
            context.arc(startX, this.y, beamHeight / 2, Math.PI * 0.5, Math.PI * 1.5, this.facingLeft);
            const bodyTaperStartX = startX + direction * (beamLength * 0.88);
            context.lineTo(bodyTaperStartX, this.y - beamHeight / 2);
            context.lineTo(endX, this.y);
            context.lineTo(bodyTaperStartX, this.y + beamHeight / 2);
            context.closePath();
            context.fill();

            // --- DRAW LAYER 3: Pure white inner core ---
            context.shadowBlur = 10;
            context.strokeStyle = '#ffffff';
            context.lineWidth = beamHeight * 0.25;
            context.lineCap = 'round';
            context.beginPath();
            context.moveTo(startX, this.y);
            context.lineTo(startX + direction * (beamLength * 0.92), this.y);
            context.stroke();

            // --- DRAW LAYER 4: Vertical Energy Rings (Ellipses) ---
            // 3 rings spaced along the beam that scale down in size
            const ringDistances = [160, 320, 480];
            const ringHeights = [beamHeight * 1.45, beamHeight * 1.15, beamHeight * 0.85];
            const ringWidths = [18, 14, 10];

            context.shadowColor = '#00e5ff';
            context.strokeStyle = '#ffffff';
            context.lineWidth = 3.5;

            ringDistances.forEach((dist, idx) => {
                const ringX = startX + direction * dist;
                // Only draw if within bounds of the 80% beam
                if ((this.facingLeft && ringX > endX) || (!this.facingLeft && ringX < endX)) {
                    context.save();
                    context.shadowBlur = 15;
                    context.beginPath();
                    // Draw a vertical ellipse
                    context.ellipse(ringX, this.y, ringWidths[idx], ringHeights[idx], 0, 0, Math.PI * 2);
                    context.stroke();
                    context.restore();
                }
            });
        }

        context.restore();
    }
}
