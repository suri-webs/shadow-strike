export class BossProjectile {
    constructor(game, x, y, dx, dy, speed = 10, damage = 15) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.radius = 14;
        this.markedForDeletion = false;
        this.damage = damage;
        this.particles = [];
    }

    update(deltaTime) {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Scroll with the camera
        this.x -= this.game.speed || 0;

        if (
            this.x < -150 ||
            this.x > this.game.width + 150 ||
            this.y < -150 ||
            this.y > this.game.height + 150
        ) {
            this.markedForDeletion = true;
        }

        const player = this.game.player;
        const pLeft = player.x + player.width * 0.25;
        const pRight = player.x + player.width * 0.75;
        const pTop = player.y;
        const pBottom = player.y + player.height;

        const closestX = Math.max(pLeft, Math.min(this.x, pRight));
        const closestY = Math.max(pTop, Math.min(this.y, pBottom));
        const dist = Math.hypot(this.x - closestX, this.y - closestY);

        if (dist < this.radius) {
            this.game.hurtPlayer(this.damage, true);
            this.markedForDeletion = true;
        }

        // Frost and snow particles trail
        for (let i = 0; i < 2; i++) {
            const angle = Math.atan2(this.dy, this.dx) + Math.PI;
            const spreadAngle = angle + (Math.random() - 0.5) * 0.8;
            const pSpeed = (Math.random() * 2) + 0.8;
            this.particles.push({
                x: this.x - this.dx * 12 + (Math.random() - 0.5) * 8,
                y: this.y - this.dy * 12 + (Math.random() - 0.5) * 8,
                vx: Math.cos(spreadAngle) * pSpeed,
                vy: Math.sin(spreadAngle) * pSpeed + (Math.random() - 0.5) * 0.5,
                size: 1.5 + Math.random() * 3,
                alpha: 0.85,
                colorType: Math.random() > 0.5 ? 'ice_blue' : 'snow_white'
            });
        }

        const scrollShift = this.game.speed || 0;
        this.particles.forEach(p => {
            p.x += p.vx - scrollShift;
            p.y += p.vy;
            p.alpha -= 0.03;
            p.size *= 0.94;
        });
        this.particles = this.particles.filter(p => p.alpha > 0 && p.size > 0.2);
    }

    draw(context) {
        if (this.isBlackHole) {
            const img = document.getElementById('amarjeetCustomProjectile');
            if (img && img.complete && img.naturalWidth > 0) {
                context.save();
                context.translate(this.x, this.y);
                const t = Date.now() * 0.002;
                context.rotate(t);
                context.globalAlpha = 0.9;
                const size = this.radius * 3.5;
                context.drawImage(img, -size/2, -size/2, size, size);
                context.restore();
                return;
            }
        }

        context.save();

        // Draw frost trail particles
        this.particles.forEach(p => {
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            if (this.game.level === 5) {
                if (p.colorType === 'ice_blue') {
                    context.fillStyle = `rgba(0, 230, 100, ${p.alpha})`; // Venom Green
                } else {
                    context.fillStyle = `rgba(220, 255, 220, ${p.alpha * 0.9})`; // Light Green-white
                }
            } else {
                if (p.colorType === 'ice_blue') {
                    context.fillStyle = `rgba(130, 224, 255, ${p.alpha})`;
                } else {
                    context.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.9})`;
                }
            }
            context.fill();
        });

        // Translate and rotate along flight path
        context.translate(this.x, this.y);
        const flightAngle = Math.atan2(this.dy, this.dx);
        context.rotate(flightAngle);

        // Frost ambient glow
        context.shadowColor = this.game.level === 5 ? '#00e676' : '#00e5ff';
        context.shadowBlur = 15;

        // Ice crystal spike gradient
        const iceGrad = context.createLinearGradient(-this.radius, 0, this.radius * 1.8, 0);
        if (this.game.level === 5) {
            iceGrad.addColorStop(0, '#00a152'); // Deep green
            iceGrad.addColorStop(0.4, '#69f0ae'); // Light green
            iceGrad.addColorStop(0.85, '#e8f5e9'); // Minty white
            iceGrad.addColorStop(1, '#ffffff'); // Snow white tip
        } else {
            iceGrad.addColorStop(0, '#0288d1'); // Deep ice blue
            iceGrad.addColorStop(0.4, '#80d8ff'); // Light ice blue
            iceGrad.addColorStop(0.85, '#e0f7fa'); // Frosty white
            iceGrad.addColorStop(1, '#ffffff'); // Snow white tip
        }

        // Draw sharp ice spike
        context.beginPath();
        context.moveTo(this.radius * 1.8, 0); // Tip
        context.lineTo(0, -this.radius * 0.45); // Top mid
        context.lineTo(-this.radius * 0.8, -this.radius * 0.2); // Top back
        context.lineTo(-this.radius * 1.1, 0); // Tail tip
        context.lineTo(-this.radius * 0.8, this.radius * 0.2); // Bottom back
        context.lineTo(0, this.radius * 0.45); // Bottom mid
        context.closePath();
        context.fillStyle = iceGrad;
        context.fill();

        context.shadowBlur = 0;

        // Specular highlight line along center ridge to make it look 3D and shiny!
        context.beginPath();
        context.moveTo(-this.radius * 0.9, 0);
        context.lineTo(this.radius * 1.7, 0);
        context.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        context.lineWidth = 1.2;
        context.stroke();

        // Shading lines for crystal facets
        context.beginPath();
        context.moveTo(0, -this.radius * 0.45);
        context.lineTo(this.radius * 0.6, 0);
        context.lineTo(0, this.radius * 0.45);
        context.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        context.lineWidth = 1.0;
        context.stroke();

        context.restore();
    }
}