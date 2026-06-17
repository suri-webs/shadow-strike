export class WindProjectile {

    constructor(game, startX, startY, facingLeft) {

        this.game = game;
        this.markedForDeletion = false;
        this.damageDone = false;
        this.facingLeft = facingLeft;
        this.breathImg = document.getElementById('windBreath');
        this.breathCols = 1;
        this.breathRows = 1;
        this.breathSW = 576 / this.breathCols;
        this.breathSH = 32;
        this.hitImg = document.getElementById('windHitEffect');
        this.hitCols = 2;
        this.hitRows = 2;
        this.hitSW = 66 / this.hitCols;
        this.hitSH = 64 / this.hitRows;
        this.width = 80;
        this.height = 40;
        this.hitDispW = 80;
        this.hitDispH = 80;
        this.x = startX;
        this.y = startY;
        this.speedX = facingLeft ? -14 : 14;
        this.travelCol = 0;
        this.travelRow = 0;
        this.frameTimer = 0;
        this.frameInterval = 40;
        this.exploding = false;
        this.explodeCol = 0;
        this.explodeRow = 0;
        this.explodeTimer = 0;
        this.explodeInterval = 70;
        this.hitX = 0;
        this.hitY = 0;
    }

    update(deltaTime) {

        const player = this.game.player;
        if (!this.exploding) {
            this.x += this.speedX;
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                this.travelCol =
                    (this.travelCol + 1) % this.breathCols;
            }
            // Note: Enemy hit detection for wind projectiles is handled in player.js
            if (
                this.x + this.width < 0 ||
                this.x > this.game.width ||
                this.y + this.height < 0 ||
                this.y > this.game.height
            ) {

                this.markedForDeletion = true;
            }

        } else {
            this.explodeTimer += deltaTime;
            if (this.explodeTimer > this.explodeInterval) {
                this.explodeTimer = 0;
                this.explodeCol++;
                if (this.explodeCol >= this.hitCols) {
                    this.explodeCol = 0;
                    this.explodeRow++;
                }
                if (this.explodeRow >= this.hitRows) {
                    this.markedForDeletion = true;
                }
            }
        }
    }

    draw(context) {

        if (!this.exploding) {
            if (this.facingLeft) {
                context.save();
                context.scale(-1, 1);
                context.drawImage(
                    this.breathImg,
                    this.travelCol * this.breathSW,
                    this.travelRow * this.breathSH,
                    this.breathSW,
                    this.breathSH,
                    -(this.x + this.width),
                    this.y,
                    this.width,
                    this.height
                );
                context.restore();
            } else {
                context.drawImage(
                    this.breathImg,
                    this.travelCol * this.breathSW,
                    this.travelRow * this.breathSH,
                    this.breathSW,
                    this.breathSH,
                    this.x,
                    this.y,
                    this.width,
                    this.height
                );
            }

        } else {
            context.drawImage(
                this.hitImg,
                this.explodeCol * this.hitSW,
                this.explodeRow * this.hitSH,
                this.hitSW,
                this.hitSH,
                this.hitX,
                this.hitY,
                this.hitDispW,
                this.hitDispH
            );
        }
    }
}