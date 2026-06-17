export class Portal {
    constructor(game, x, y) {
        this.game = game;
        this.width = 100;
        this.height = 130;
        this.x = x;

        this.y = y - this.height;
        this.image = document.getElementById('dimensionalPortal');

        this.frameX = 0;
        this.maxFrame = 5;
        this.fps = 10;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.markedForDeletion = false;
        this.activated = false;
        this.activationTimer = 0;
        this.activationDelay = 1000;
    }

    update(deltaTime) {

        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
        }

        if (this.activated) {
            this.activationTimer += deltaTime;
            if (this.activationTimer >= this.activationDelay) {
                this.markedForDeletion = true;
                this.game.levelComplete = true;
                this.game.coins += 100;
                localStorage.setItem('gameCoins', this.game.coins.toString());
            }
            return;
        }

        const player = this.game.player;
        const playerCenter = player.x + player.width / 2;
        const portalCenter = this.x + this.width / 2;
        const dist = Math.abs(playerCenter - portalCenter);

        const vertOverlap = (player.y + player.height > this.y) && (player.y < this.y + this.height);

        if (dist < 40 && vertOverlap && !player.isDead) {
            this.activated = true;
            this.activationTimer = 0;

            player.x = this.x + (this.width - player.width) / 2;
            player.speed = 0;
            player.vy = 0;
            this.game.shake = 150;

            if (this.game.audio) {
                this.game.audio.stopBGM();
                this.game.audio.playSFX('level_complete');
            }
        }
    }

    draw(context) {
        if (!this.image || !this.image.complete || this.image.naturalWidth === 0) return;

        const col = this.frameX % 3;
        const row = Math.floor(this.frameX / 3);
        const sx = col * 32;
        const sy = row * 32;
        const sw = 32;
        const sh = 32;

        context.save();
        if (this.activated) {
            const glow = 1 + 0.1 * Math.sin(Date.now() * 0.01);
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.scale(glow, glow);
            context.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
            context.globalAlpha = Math.max(0, 1 - this.activationTimer / this.activationDelay);
        }
        context.drawImage(
            this.image,
            sx, sy, sw, sh,
            this.x, this.y, this.width, this.height
        );
        context.restore();
    }
}
