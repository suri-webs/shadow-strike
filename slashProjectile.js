export class SlashProjectile {

    constructor(game, startX, startY, facingLeft) {
        this.game = game;
        this.facingLeft = facingLeft;
        this.markedForDeletion = false;

        this.x = startX;
        this.y = startY;
        this.width = 90;
        this.height = 30;

        this.speed = 40;
        this.damage = 50;


        this.age = 0;
        this.maxAge = 350;

        this.particles = [];
        this.embers = [];

        for (let i = 0; i < 8; i++) {
            this.embers.push(this._newEmber());
        }
    }

    _newEmber() {
        return {
            ox: (Math.random() - 0.5) * 40,
            oy: (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -(Math.random() * 1.5 + 0.5),
            size: Math.random() * 5 + 2,
            alpha: 0.9,
            hue: Math.random() > 0.5 ? 20 : 45
        };
    }

    update(deltaTime) {
        this.x += this.facingLeft ? -this.speed : this.speed;
        this.age += deltaTime;

        for (let i = 0; i < 4; i++) {
            const dir = this.facingLeft ? -1 : 1;
            this.particles.push({
                x: this.x + (Math.random() - 0.5) * this.width * 0.6,
                y: this.y + (Math.random() - 0.5) * this.height * 0.6,
                vx: dir * (Math.random() * 1.5 + 0.5) * -0.3,
                vy: -(Math.random() * 2.5 + 1),
                size: Math.random() * 10 + 4,
                alpha: 1.0,
                hue: Math.random() > 0.6 ? 15 : Math.random() > 0.3 ? 35 : 55
            });
        }

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy -= 0.08;
            p.alpha -= 0.045;
            p.size *= 0.93;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        this.embers.forEach(e => {
            e.vy -= 0.05;
            e.alpha -= 0.025;
            if (e.alpha <= 0) {
                Object.assign(e, this._newEmber());
                e.alpha = 0.9;
            }
        });

        if (this.age > this.maxAge || this.x < -150 || this.x > this.game.width + 150) {
            this.markedForDeletion = true;
        }

        this.game.enemies.forEach(enemy => {
            if (enemy.markedForDeletion) return;
            if (!enemy.hasEnteredScreen) return;
            if (enemy._hitBySlash) return;

            const hit =
                this.x < enemy.x + enemy.width &&
                this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height &&
                this.y + this.height > enemy.y;

            if (hit) {
                if (typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(this.damage);
                } else {
                    enemy.currentHP -= this.damage;
                }
                enemy._hitBySlash = true;
                setTimeout(() => { if (enemy) enemy._hitBySlash = false; }, 200);
            }
        });
    }

    draw(context) {
        context.save();

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dir = this.facingLeft ? -1 : 1;
        // Apply slight rotation to give a blade-like slash curvature
        const angle = this.facingLeft ? -0.2 : 0.2; // radians
        context.translate(cx, cy);
        context.rotate(angle);
        context.translate(-cx, -cy);

        const outerGlow = context.createRadialGradient(cx, cy, 0, cx, cy, this.width * 0.7);
        outerGlow.addColorStop(0, 'rgba(255, 200, 50, 0.25)');
        outerGlow.addColorStop(0.5, 'rgba(255, 100, 30, 0.15)');
        outerGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
        context.beginPath();
        context.ellipse(cx, cy, this.width * 0.7, this.height * 1.5, 0, 0, Math.PI * 2);
        context.fillStyle = outerGlow;
        context.fill();

        this.particles.forEach(p => {
            const grad = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            grad.addColorStop(0, `hsla(${p.hue}, 100%, 95%, ${p.alpha})`);
            grad.addColorStop(0.35, `hsla(${p.hue}, 100%, 65%, ${p.alpha * 0.8})`);
            grad.addColorStop(0.7, `hsla(${p.hue - 10}, 100%, 40%, ${p.alpha * 0.4})`);
            grad.addColorStop(1, `hsla(0, 100%, 20%, 0)`);
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fillStyle = grad;
            context.fill();
        });

        // --- New stylized slash ---
        const slashLen = this.width * 0.9;
        const bladeWidth = this.width * 0.12;
        const xStart = cx - dir * slashLen * 0.5;
        const xEnd = cx + dir * slashLen * 0.5;
        const yCenter = cy;

        // Blade shape using quadratic curves for a curved sword effect
        context.beginPath();
        context.moveTo(xStart, yCenter - bladeWidth);
        context.quadraticCurveTo(cx, yCenter - bladeWidth - 10, xEnd, yCenter);
        context.quadraticCurveTo(cx, yCenter + bladeWidth + 10, xStart, yCenter + bladeWidth);
        context.closePath();

        // Gradient fill for blade
        const bladeGrad = context.createLinearGradient(xStart, yCenter - bladeWidth, xEnd, yCenter + bladeWidth);
        bladeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        bladeGrad.addColorStop(0.5, 'rgba(255, 200, 50, 0.8)');
        bladeGrad.addColorStop(1, 'rgba(255, 80, 0, 0.7)');
        context.fillStyle = bladeGrad;
        context.shadowColor = 'rgba(255, 150, 0, 0.9)';
        context.shadowBlur = 20;
        context.fill();

        // Blade outline for sharp look
        context.lineWidth = 2;
        context.strokeStyle = 'rgba(255, 200, 30, 0.9)';
        context.stroke();

        // Add a rounded tip at the start of the blade for visual polish
        const tipRadius = 12;
        context.beginPath();
        context.arc(xStart, yCenter - bladeWidth, tipRadius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 220, 80, 0.8)';
        context.fill();

        // Optional inner glow
        const innerGlow = context.createRadialGradient(cx, cy, 0, cx, cy, this.width * 0.4);
        innerGlow.addColorStop(0, 'rgba(255, 255, 150, 0.6)');
        innerGlow.addColorStop(1, 'rgba(255, 120, 0, 0)');
        context.globalCompositeOperation = 'lighter';
        context.fillStyle = innerGlow;
        context.fillRect(xStart - bladeWidth, yCenter - bladeWidth * 2, slashLen + bladeWidth * 2, bladeWidth * 4);
        context.globalCompositeOperation = 'source-over';

        context.shadowColor = '#ffffff';
        context.shadowBlur = 8;
        context.beginPath();
        context.moveTo(xStart, yCenter);
        context.quadraticCurveTo(cx, yCenter - 8, xEnd, yCenter);
        context.strokeStyle = 'rgba(255, 255, 220, 0.85)';
        context.lineWidth = 1.5;
        context.stroke();

        const tipX = this.facingLeft ? xStart : xEnd;
        const tipY = yCenter;
        const tipGrad = context.createRadialGradient(tipX, tipY, 0, tipX, tipY, 14);
        tipGrad.addColorStop(0, 'rgba(255, 255, 200, 1)');
        tipGrad.addColorStop(0.4, 'rgba(255, 140, 0, 0.7)');
        tipGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
        context.shadowBlur = 0;
        context.beginPath();
        context.arc(tipX, tipY, 14, 0, Math.PI * 2);
        context.fillStyle = tipGrad;
        context.fill();

        context.restore();
    }
}
