export class StoneProjectile {
    constructor(game, x, y, dx, dy, speed = 10, damage = 20) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.damage = damage;
        this.radius = 16;
        this.markedForDeletion = false;
        this.particles = [];
        this.rotation = 0;
    }

    update(deltaTime) {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        this.rotation += 0.15;

        const scrollShift = this.game.scrollSpeed || 0;
        this.x -= scrollShift;

        // Sparkling diamond shards trail
        if (Math.random() < 0.6) {
            const angle = Math.atan2(this.dy, this.dx) + Math.PI;
            const spreadAngle = angle + (Math.random() - 0.5) * 0.8;
            const pSpeed = (Math.random() * 2) + 1;
            this.particles.push({
                x: this.x - this.dx * 12 + (Math.random() - 0.5) * 10,
                y: this.y - this.dy * 12 + (Math.random() - 0.5) * 10,
                vx: Math.cos(spreadAngle) * pSpeed,
                vy: Math.sin(spreadAngle) * pSpeed,
                size: 2 + Math.random() * 4,
                alpha: 0.9,
            });
        }

        this.particles.forEach(p => {
            p.x += p.vx - scrollShift;
            p.y += p.vy;
            p.alpha -= 0.04;
            p.size *= 0.93;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

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
    }

    draw(context) {
        context.save();

        // Draw trails
        this.particles.forEach(p => {
            context.beginPath();
            // Draw a diamond particle
            context.moveTo(p.x, p.y - p.size);
            context.lineTo(p.x + p.size, p.y);
            context.lineTo(p.x, p.y + p.size);
            context.lineTo(p.x - p.size, p.y);
            context.closePath();
            if (this.game.level === 5) {
                context.fillStyle = `rgba(105, 240, 174, ${p.alpha})`; // green
            } else {
                context.fillStyle = `rgba(255, 215, 0, ${p.alpha})`; // gold
            }
            context.fill();
        });

        // Translate to projectile center and rotate along flight path
        context.translate(this.x, this.y);
        const flightAngle = Math.atan2(this.dy, this.dx);
        context.rotate(flightAngle);

        // Outer crystal diamond glow
        context.shadowColor = this.game.level === 5 ? '#00c853' : '#ffab40';
        context.shadowBlur = 18;

        // Glowing golden-amber diamond gradient
        const diamondGrad = context.createLinearGradient(-this.radius * 1.5, 0, this.radius * 1.5, 0);
        if (this.game.level === 5) {
            diamondGrad.addColorStop(0, '#b9f6ca'); // Glowing light green
            diamondGrad.addColorStop(0.5, '#69f0ae'); // Rich green
            diamondGrad.addColorStop(1, '#00c853'); // Intense dark green
        } else {
            diamondGrad.addColorStop(0, '#ffd54f'); // Glowing yellow
            diamondGrad.addColorStop(0.5, '#ffa726'); // Rich amber
            diamondGrad.addColorStop(1, '#e65100'); // Intense orange-red
        }

        context.beginPath();
        context.moveTo(0, -this.radius);
        context.lineTo(this.radius * 1.5, 0);
        context.lineTo(0, this.radius);
        context.lineTo(-this.radius * 1.5, 0);
        context.closePath();
        context.fillStyle = diamondGrad;
        context.fill();

        context.shadowBlur = 0;

        // Inner white crystal core
        context.beginPath();
        context.moveTo(0, -this.radius * 0.4);
        context.lineTo(this.radius * 0.7, 0);
        context.lineTo(0, this.radius * 0.4);
        context.lineTo(-this.radius * 0.7, 0);
        context.closePath();
        context.fillStyle = '#ffffff';
        context.fill();

        context.restore();
    }
}
