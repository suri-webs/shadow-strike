export class PowerBurstProjectile {
    constructor(game, x, y, maxRadius = 180, damage = 30) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.radius = 10;
        this.damage = damage;
        this.type = 'PowerBurstProjectile';
        this.markedForDeletion = false;
        
        this.lifeTimer = 0;
        this.maxLife = 650; // duration in ms
        this.hitPlayers = new Set();
        this.particles = [];
        
        // Spawn initial burst particles with outward radial bias
        for (let i = 0; i < 24; i++) {
            this.spawnFlameParticle(true);
        }
    }

    spawnFlameParticle(isInitial = false) {
        const angle = Math.random() * Math.PI * 2;
        // Radial explosion velocity
        const speed = isInitial ? (3.5 + Math.random() * 5.5) : (1.5 + Math.random() * 3.5);
        const dist = isInitial ? 0 : Math.random() * this.radius;
        this.particles.push({
            x: this.x + Math.cos(angle) * dist,
            y: this.y + (Math.random() - 0.5) * 15,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed * 0.65 - (isInitial ? 0.5 : 1.5), // slight upward bias
            size: Math.random() * 12 + 6,
            alpha: 1.0,
            color: Math.random() > 0.45 ? '#39ff14' : '#00ff66', // Neon green / spring green
            swayTimer: Math.random() * 100,
            swaySpeed: Math.random() * 0.1 + 0.05,
            swayAmt: Math.random() * 2 + 1,
            decay: Math.random() * 0.03 + 0.02
        });
    }

    update(deltaTime) {
        this.lifeTimer += deltaTime;
        if (this.lifeTimer >= this.maxLife) {
            this.markedForDeletion = true;
            return;
        }

        const scrollShift = this.game.scrollSpeed || 0;
        this.x -= scrollShift;

        // Easing: ease-out radius
        const progress = this.lifeTimer / this.maxLife;
        this.radius = this.maxRadius * Math.sin(progress * Math.PI / 2);

        // Spawn more flame particles during the burst
        if (progress < 0.85 && Math.random() < 0.6) {
            this.spawnFlameParticle(false);
        }

        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx - scrollShift + Math.sin(p.swayTimer) * p.swayAmt;
            p.y += p.vy;
            p.swayTimer += p.swaySpeed;
            p.alpha -= p.decay;
            p.size *= 0.95;
        });
        this.particles = this.particles.filter(p => p.alpha > 0 && p.size > 1);

        // Handle collision
        const playersToCheck = (this.game.isMultiplayer && this.game.players && this.game.players.size > 1)
            ? [...this.game.players.values()]
            : [this.game.player];

        for (const player of playersToCheck) {
            if (!player || player.isDead) continue;
            
            const playerKey = player.id || player;
            if (this.hitPlayers.has(playerKey)) continue;

            // Simple distance check to player's center
            const px = player.x + player.width / 2;
            const py = player.y + player.height / 2;
            const dist = Math.hypot(px - this.x, py - this.y);

            // Add margin for player size
            const playerRadius = Math.max(player.width, player.height) / 3;
            if (dist < this.radius + playerRadius) {
                if (player === this.game.player) {
                    this.game.hurtPlayer(this.damage, true);
                }
                this.hitPlayers.add(playerKey);
            }
        }
    }

    draw(context) {
        context.save();

        const progress = this.lifeTimer / this.maxLife;
        const mainAlpha = 1.0 - Math.pow(progress, 2); // Fade out at the end

        // Draw background green aura glow
        context.globalAlpha = mainAlpha * 0.45;
        const glowGrad = context.createRadialGradient(this.x, this.y, 10, this.x, this.y, this.radius * 1.25);
        glowGrad.addColorStop(0, '#ffffff');
        glowGrad.addColorStop(0.3, '#39ff14'); // Neon green
        glowGrad.addColorStop(0.7, '#00ff66'); // Emerald green
        glowGrad.addColorStop(1, 'transparent');
        context.fillStyle = glowGrad;
        context.beginPath();
        context.arc(this.x, this.y, this.radius * 1.25, 0, Math.PI * 2);
        context.fill();

        // Draw concentric expanding shockwave strokes
        // Ring 1 (outer)
        context.globalAlpha = mainAlpha * 0.8;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.strokeStyle = '#39ff14';
        context.lineWidth = 6 * (1.0 - progress);
        context.shadowColor = '#00ff66';
        context.shadowBlur = 20;
        context.stroke();

        // Ring 2 (inner secondary ring)
        context.globalAlpha = mainAlpha * 0.45;
        context.beginPath();
        context.arc(this.x, this.y, this.radius * 0.72, 0, Math.PI * 2);
        context.strokeStyle = '#00ff66';
        context.lineWidth = 3 * (1.0 - progress);
        context.stroke();

        // Draw anime flame-like vertical energy spikes
        context.shadowBlur = 0;
        
        // Draw vertical energy spikes / aura shape (Super Saiyan style)
        const spikeCount = 6;
        for (let i = 0; i < spikeCount; i++) {
            const angleOffset = (i / spikeCount) * Math.PI - Math.PI; // semi-circle pointing up
            
            // Smooth time-based swaying instead of harsh Math.random() flickering
            const wave = Math.sin((this.lifeTimer + i * 200) * 0.012);
            const spikeLength = this.radius * (1.2 + wave * 0.18);
            
            const sway = Math.cos((this.lifeTimer + i * 300) * 0.007) * 0.06;
            const angle = angleOffset + sway;

            const targetX = this.x + Math.cos(angle) * this.radius * 0.8;
            const targetY = this.y + Math.sin(angle) * this.radius * 0.3 - spikeLength;

            const baseW = this.radius * 0.35;
            const leftBaseX = this.x + Math.cos(angle - Math.PI/2) * baseW;
            const leftBaseY = this.y + Math.sin(angle - Math.PI/2) * baseW * 0.5;
            const rightBaseX = this.x + Math.cos(angle + Math.PI/2) * baseW;
            const rightBaseY = this.y + Math.sin(angle + Math.PI/2) * baseW * 0.5;

            const spikeGrad = context.createLinearGradient(this.x, this.y, targetX, targetY);
            spikeGrad.addColorStop(0, 'rgba(0, 255, 100, 0.05)');
            spikeGrad.addColorStop(0.4, 'rgba(57, 255, 20, 0.7)');
            spikeGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.95)');
            spikeGrad.addColorStop(1, 'transparent');

            context.globalAlpha = mainAlpha * 0.75;
            context.fillStyle = spikeGrad;
            context.beginPath();
            context.moveTo(leftBaseX, leftBaseY);
            context.quadraticCurveTo(
                (leftBaseX + targetX) / 2 - baseW * 0.3,
                (leftBaseY + targetY) / 2,
                targetX, targetY
            );
            context.quadraticCurveTo(
                (rightBaseX + targetX) / 2 + baseW * 0.3,
                (rightBaseY + targetY) / 2,
                rightBaseX, rightBaseY
            );
            context.closePath();
            context.fill();
        }

        context.restore();

        // Draw individual flame particles rising
        this.particles.forEach(p => {
            context.save();
            context.globalAlpha = p.alpha;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fillStyle = p.color;
            context.shadowColor = '#00ff66';
            context.shadowBlur = 15;
            context.fill();
            context.restore();
        });
    }
}
