export class Dropbox {
    constructor(game, x, y) {
        this.game = game;
        this.width = 64;
        this.height = 48;
        this.x = x;
        this.y = y;
        this.vy = 1.5; // fall slowly
        this.groundY = game.height - game.groundMargin - this.height;
        this.image = new Image();
        this.image.src = 'asset/dropboxs/Chests_Snow.png';
        
        this.frameX = 0;
        this.frameY = (game.level - 1) % 8; // one row per level
        this.maxFrame = 4;
        
        this.fps = 6;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        
        this.broken = false; // hit by player
        this.opening = false;
        this.opened = false;
        this.markedForDeletion = false;

        this.popupTimer = 0;
        this.popupDelay = 500; // wait 500ms after opening completes before popup
        this.popupTriggered = false;
    }

    update(deltaTime) {
        // Scroll with the game world (background scroll)
        this.x -= this.game.scrollSpeed || 0;

        // Fall down until ground is reached
        if (this.y < this.groundY) {
            this.y = Math.min(this.y + this.vy, this.groundY);
        }

        // Check proximity to player to allow opening with F key
        const player = this.game.player;
        const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
        const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.nearPlayer = distance < 120;

        // Toggle virtual F touch button
        const interactBtn = document.getElementById('vbtn-interact');
        if (interactBtn) {
            if (this.nearPlayer && !this.broken) {
                interactBtn.style.display = 'flex';
            } else {
                interactBtn.style.display = 'none';
            }
        }

        // If player is close and presses F key, break/open the chest!
        if (this.nearPlayer && !this.broken && this.game.input.keys.includes('f')) {
            this.break();
        }

        // Check melee attack collision
        if (!this.broken && this.game.player.currentState && (this.game.player.currentState.state === 'ATTACK' || this.game.player.currentState.state === 'SPINNING')) {
            const hitFrame = Math.max(1, Math.floor(this.game.player.maxFrame / 2));
            if (this.game.player.frameX >= hitFrame) {
                let attackRange = 45;
                if (this.game.player.characterType === 'jotem') attackRange = 30;
                else if (this.game.player.characterType === 'archdemon') attackRange = 65;

                let minX, maxX;
                if (this.game.player.facingLeft) {
                    minX = this.game.player.x - attackRange;
                    maxX = this.game.player.x + this.game.player.width * 0.3;
                } else {
                    minX = this.game.player.x + this.game.player.width * 0.7;
                    maxX = this.game.player.x + this.game.player.width + attackRange;
                }

                const attackHit =
                    this.x < maxX && this.x + this.width > minX &&
                    this.y < this.game.player.y + this.game.player.height && this.y + this.height > this.game.player.y;

                if (attackHit) {
                    this.break();
                }
            }
        }

        // Check projectile collisions
        if (!this.broken) {
            const projectiles = [
                ...(this.game.player.windProjectiles || []),
                ...(this.game.player.slashProjectiles || [])
            ];
            projectiles.forEach(p => {
                if (p.markedForDeletion) return;
                const hit =
                    p.x < this.x + this.width &&
                    p.x + (p.width || 30) > this.x &&
                    p.y < this.y + this.height &&
                    p.y + (p.height || 30) > this.y;
                if (hit) {
                    p.markedForDeletion = true;
                    this.break();
                }
            });
        }

        // Opening animation
        if (this.opening && !this.opened) {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.maxFrame) {
                    this.frameX++;
                } else {
                    this.opened = true;
                }
            }
        }

        // Delay popup until animation is completely done and visible to player
        if (this.opened && !this.popupTriggered) {
            this.popupTimer += deltaTime;
            if (this.popupTimer >= this.popupDelay) {
                this.popupTriggered = true;
                if (typeof this.game.showDropboxCards === 'function') {
                    this.game.showDropboxCards();
                }
            }
        }
    }

    break() {
        this.broken = true;
        this.opening = true;
        this.frameTimer = 0;
        this.game.shake = Math.max(this.game.shake, 10);
        if (this.game.audio) {
            this.game.audio.playSFX('punch');
        }
        const interactBtn = document.getElementById('vbtn-interact');
        if (interactBtn) interactBtn.style.display = 'none';
    }

    draw(context) {
        if (!this.image || !this.image.complete || this.image.naturalWidth === 0) return;

        // Chests_Snow.png grid: 5 columns (48px wide), 8 rows (32px high)
        const sw = 48;
        const sh = 32;
        const sx = this.frameX * sw;
        const sy = this.frameY * sh;

        context.save();
        context.drawImage(
            this.image,
            sx, sy, sw, sh,
            this.x, this.y, this.width, this.height
        );
        context.restore();

        // Draw interaction prompt if player is near
        if (this.nearPlayer && !this.broken) {
            context.save();
            context.font = '800 12px "Orbitron", sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            const text = "PRESS [F] TO OPEN";
            const tw = context.measureText(text).width + 16;
            const th = 22;
            const px = this.x + this.width / 2;
            const py = this.y - 20;

            context.shadowColor = '#00e5ff';
            context.shadowBlur = 8;
            context.fillStyle = 'rgba(18, 16, 28, 0.85)';
            context.strokeStyle = '#00e5ff';
            context.lineWidth = 1.5;

            context.beginPath();
            if (typeof context.roundRect === 'function') {
                context.roundRect(px - tw / 2, py - th / 2, tw, th, 6);
            } else {
                context.rect(px - tw / 2, py - th / 2, tw, th);
            }
            context.fill();
            context.stroke();

            context.shadowBlur = 0;
            context.fillStyle = '#ffffff';
            context.fillText(text, px, py);
            context.restore();
        }
    }
}
