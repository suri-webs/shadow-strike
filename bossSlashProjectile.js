export class BossSlashProjectile {
    constructor(game, x, y, dx, dy, speed = 12, damage = 22) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.width = 35;
        this.height = 90;
        this.markedForDeletion = false;
        this.damage = damage;
        this.particles = [];
        this.history = [];
    }

    update(deltaTime) {

        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        const scrollShift = this.game.scrollSpeed || 0;
        this.x -= scrollShift;
        this.history.forEach(pos => pos.x -= scrollShift);

        if (
            this.x < -200 ||
            this.x > this.game.width + 200 ||
            this.y < -200 ||
            this.y > this.game.height + 200
        ) {
            this.markedForDeletion = true;
        }

        // Multiplayer-aware collision
        const playersToCheck = (this.game.isMultiplayer && this.game.players && this.game.players.size > 1)
            ? [...this.game.players.values()]
            : [this.game.player];

        const hitboxW = 30;
        const hitboxH = this.height * 0.8;
        for (const player of playersToCheck) {
            if (!player || player.isDead) continue;
            const overlaps = (
                this.x - hitboxW/2 < player.x + player.width * 0.8 &&
                this.x + hitboxW/2 > player.x + player.width * 0.2 &&
                this.y - hitboxH/2 < player.y + player.height &&
                this.y + hitboxH/2 > player.y
            );
            if (overlaps) {
                if (player === this.game.player) {
                    this.game.hurtPlayer(this.damage, true);
                }
                this.markedForDeletion = true;
                break;
            }
        }

        const angle = Math.atan2(this.dy, this.dx);
        this.history.push({ x: this.x, y: this.y, angle: angle });
        if (this.history.length > 5) this.history.shift();

        this.particles.forEach(p => {
            p.x += p.vx - scrollShift;
            p.y += p.vy;
            p.alpha -= 0.03;
            p.size *= 0.95;
        });
        this.particles = this.particles.filter(p => p.alpha > 0 && p.size > 0.2);

        const backAngle = angle + Math.PI;
        for (let i = 0; i < 2; i++) {
            const offsetDist = (Math.random() - 0.5) * this.height * 0.7;
            const px = this.x - this.dx * 10 + (-this.dy) * offsetDist;
            const py = this.y - this.dy * 10 + this.dx * offsetDist;
            
            this.particles.push({
                x: px,
                y: py,
                vx: Math.cos(backAngle) * (this.speed * 0.3) + (Math.random() - 0.5) * 1.0,
                vy: Math.sin(backAngle) * (this.speed * 0.3) + (Math.random() - 0.5) * 1.0,
                size: 2 + Math.random() * 3,
                alpha: 0.8,
                color: Math.random() > 0.4 ? 'rgba(0, 210, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)'
            });
        }
    }

    draw(context) {
        const angle = Math.atan2(this.dy, this.dx);

        this.particles.forEach(p => {
            context.save();
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            if (this.game.level === 5) {
                context.fillStyle = p.color.replace('0, 210, 255', '0, 230, 100');
            } else {
                context.fillStyle = p.color;
            }
            context.fill();
            context.restore();
        });

        this.history.forEach((pos, idx) => {
            const trailAlpha = (idx / this.history.length) * 0.22;
            context.save();
            context.translate(pos.x, pos.y);
            context.rotate(pos.angle);

            context.beginPath();
            context.moveTo(0, -this.height/2);
            context.quadraticCurveTo(this.width, 0, 0, this.height/2);
            context.quadraticCurveTo(this.width * 0.3, 0, 0, -this.height/2);
            context.closePath();
            
            if (this.game.level === 5) {
                context.fillStyle = `rgba(0, 230, 100, ${trailAlpha})`;
            } else {
                context.fillStyle = `rgba(0, 180, 255, ${trailAlpha})`;
            }
            context.fill();
            context.restore();
        });

        context.save();
        context.translate(this.x, this.y);
        context.rotate(angle);

        context.beginPath();
        context.moveTo(0, -this.height/2);
        context.quadraticCurveTo(this.width, 0, 0, this.height/2);
        context.quadraticCurveTo(this.width * 0.3, 0, 0, -this.height/2);
        context.closePath();

        const grad = context.createLinearGradient(0, 0, this.width, 0);
        if (this.game.level === 5) {
            grad.addColorStop(0, 'rgba(0, 230, 100, 0)');      
            grad.addColorStop(0.3, 'rgba(0, 230, 100, 0.6)');
            grad.addColorStop(0.7, 'rgba(180, 255, 200, 0.95)');
            grad.addColorStop(1, '#ffffff');                   
            context.shadowColor = '#00ff33';
        } else {
            grad.addColorStop(0, 'rgba(0, 80, 255, 0)');      
            grad.addColorStop(0.3, 'rgba(0, 180, 255, 0.6)');
            grad.addColorStop(0.7, 'rgba(160, 245, 255, 0.95)');
            grad.addColorStop(1, '#ffffff');                   
            context.shadowColor = '#00c8ff';
        }

        context.shadowBlur = 18;
        context.fillStyle = grad;
        context.fill();

        context.shadowBlur = 0;

        context.strokeStyle = 'rgba(230, 255, 255, 0.6)';
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(0, -this.height/2);
        context.quadraticCurveTo(this.width, 0, 0, this.height/2);
        context.stroke();

        context.restore();
    }
}
