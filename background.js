class Layer {
    constructor(game, width, height, speedModifier, image, x = 0, y = 0) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.speedModifier = speedModifier;
        this.image = image;
        this.x = x;
        this.y = y;
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed * this.speedModifier;
        if (this.x <= -this.width) this.x = 0;
        if (this.x >= this.width) this.x = 0;
    }

    draw(context) {
        if (!this.image || !this.image.complete || this.image.naturalWidth === 0) return;
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
        context.drawImage(this.image, this.x - this.width, this.y, this.width, this.height);
    }
}

export class Background {
    constructor(game) {
        this.game = game;
        this._loadLayers();
    }

    _loadLayers() {
        const g = this.game;
        const W = g.width, H = g.height;

        const img = id => document.getElementById(id);

        this.backgroundLayers = [
            new Layer(g, 6060, 780, 0.2, img('layer1'), 0, 0),
            new Layer(g, 5000, 700, 0.4, img('layer2'), 0, 50),
            new Layer(g, 3000, 650, 0.6, img('layer3'), 0, 100),
            new Layer(g, 3000, 600, 0.8, img('layer4'), 0, 150),
            new Layer(g, 3500, 550, 0.8, img('layer5'), 0, 200),
        ];
    }

    _scrollSpeed() {
        if (this.game.isMultiplayer || this.game.enemies.some(e => e.isBoss && e.introLocked)) return 0;
        const threshold = this.game.width * 0.5;
        const playerX = this.game.player.x;
        const spd = this.game.speed;
        if (spd > 0 && playerX > threshold) return spd;
        if (spd < 0 && playerX <= 55) return spd;
        return 0;
    }

    update() {
        const s = this._scrollSpeed();
        this.backgroundLayers.forEach(l => l.update(s));
    }

    draw(context) {
        this.backgroundLayers.forEach(l => l.draw(context));
    }
}

export class Level2Background {
    constructor(game) {
        this.game = game;
        const W = Math.max(game.width, 1550), H = game.height;
        const img = id => document.getElementById(id);

        this.backgroundLayers = [
            new Layer(game, W, H, 0.10, img('city1'), 0, 0),
            new Layer(game, W, H, 0.25, img('city2'), 0, 0),
            new Layer(game, W, H, 0.45, img('city3'), 0, 0),
            new Layer(game, W, H, 0.65, img('city4'), 0, 0),
            new Layer(game, W, H, 0.85, img('city5'), 0, 0),
            new Layer(game, W, H, 1.00, img('city6'), 0, 0),
        ];
    }

    _scrollSpeed() {
        if (this.game.isMultiplayer || this.game.enemies.some(e => e.isBoss && e.introLocked)) return 0;
        const s = this.game.speed;
        const threshold = this.game.width * 0.5;
        if (s > 0 && this.game.player.x > threshold) return s;
        if (s < 0 && this.game.player.x <= 55) return s;
        return 0;
    }

    update() {
        const s = this._scrollSpeed();
        this.backgroundLayers.forEach(l => l.update(s));
    }

    draw(context) {
        this.backgroundLayers.forEach(l => l.draw(context));
    }
}

export class Level3Background {
    constructor(game) {
        this.game = game;
        this.W = Math.max(game.width, 1550);
        this.H = game.height;

        const img = id => document.getElementById(id);

        this.backgroundLayers = [
            new Layer(game, this.W, this.H, 0.05, img('l3_layer1'), 0, 0),
            new Layer(game, this.W, this.H, 0.18, img('l3_layer2'), 0, 0),
            new Layer(game, this.W, this.H, 0.32, img('l3_layer3'), 0, 0),
            new Layer(game, this.W, this.H, 0.48, img('l3_layer4'), 0, 0),
            new Layer(game, this.W, this.H, 0.64, img('l3_layer5'), 0, 0),
            new Layer(game, this.W, this.H, 0.80, img('l3_layer6'), 0, 0),
            new Layer(game, this.W, this.H, 0.95, img('l3_layer7'), 0, 0),
        ];

        this.embers = this._genEmbers(45);
    }

    _genEmbers(n) {
        return Array.from({ length: n }, () => ({
            x: Math.random() * this.W,
            y: this.H * 0.4 + Math.random() * this.H * 0.45,
            vx: -0.3 - Math.random() * 0.7,
            vy: -0.4 - Math.random() * 1.0,
            life: Math.random(),
            size: 1 + Math.random() * 2.5,
            color: Math.random() > 0.5 ? '#ff6600' : '#ff2200',
        }));
    }

    _scrollSpeed() {
        if (this.game.isMultiplayer || this.game.enemies.some(e => e.isBoss && e.introLocked)) return 0;
        const s = this.game.speed;
        const threshold = this.W * 0.5;
        if (s > 0 && this.game.player.x > threshold) return s;
        if (s < 0 && this.game.player.x <= 55) return s;
        return 0;
    }

    update() {
        const scroll = this._scrollSpeed();

        this.backgroundLayers.forEach(l => l.update(scroll));

        this.embers.forEach(e => {
            e.x += e.vx - scroll * 0.6;
            e.y += e.vy;
            e.life -= 0.005;
            if (e.life <= 0 || e.x < -10) {
                e.x = this.W + Math.random() * 200;
                e.y = this.H * 0.4 + Math.random() * this.H * 0.5;
                e.life = 0.7 + Math.random() * 0.3;
                e.vy = -0.4 - Math.random() * 1.0;
                e.vx = -0.3 - Math.random() * 0.7;
            }
        });
    }

    draw(context) {
        context.save();

        this.backgroundLayers.forEach(l => l.draw(context));

        // Draw embers outer glow circles (low opacity, larger size)
        context.save();
        this.embers.forEach(e => {
            const alpha = Math.max(0, e.life);
            context.globalAlpha = alpha * 0.25;
            context.fillStyle = e.color;
            context.beginPath();
            context.arc(e.x, e.y, e.size * 2.2, 0, Math.PI * 2);
            context.fill();
        });
        context.restore();

        // Draw embers inner core circles
        context.save();
        this.embers.forEach(e => {
            const alpha = Math.max(0, e.life);
            context.globalAlpha = alpha;
            context.fillStyle = e.color;
            context.beginPath();
            context.arc(e.x, e.y, e.size, 0, Math.PI * 2);
            context.fill();
        });
        context.restore();

        const vig = context.createRadialGradient(this.W / 2, this.H / 2, this.H * 0.3, this.W / 2, this.H / 2, this.H * 0.85);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, 'rgba(4, 0, 1, 0.42)');
        context.fillStyle = vig;
        context.fillRect(0, 0, this.W, this.H);

        context.restore();
    }
}

export class Level4Background {
    constructor(game) {
        this.game = game;
        this.W = Math.max(game.width, 1550);
        this.H = game.height;

        const img = id => document.getElementById(id);

        this.backgroundLayers = [
            new Layer(game, this.W, this.H, 0.04, img('l4_layer1'), 0, 0),
            new Layer(game, this.W, this.H, 0.12, img('l4_layer2'), 0, 0),
            new Layer(game, this.W, this.H, 0.22, img('l4_layer3'), 0, 0),
            new Layer(game, this.W, this.H, 0.35, img('l4_layer4'), 0, 0),
            new Layer(game, this.W, this.H, 0.50, img('l4_layer5'), 0, 0),
            new Layer(game, this.W, this.H, 0.65, img('l4_layer6'), 0, 0),
            new Layer(game, this.W, this.H, 0.80, img('l4_layer7'), 0, 0),
            new Layer(game, this.W, this.H, 0.92, img('l4_layer8'), 0, 0),
            new Layer(game, this.W, this.H, 1.00, img('l4_layer9'), 0, 0),
        ];

        // Purple/dark mist particles for a cursed realm feel
        this.mist = Array.from({ length: 30 }, () => ({
            x: Math.random() * this.W,
            y: this.H * 0.5 + Math.random() * this.H * 0.4,
            vx: -0.2 - Math.random() * 0.4,
            vy: -0.1 - Math.random() * 0.2,
            life: Math.random(),
            size: 4 + Math.random() * 8,
            color: Math.random() > 0.5 ? '#aa00ff' : '#6600cc',
        }));
    }

    _scrollSpeed() {
        if (this.game.isMultiplayer || this.game.enemies.some(e => e.isBoss && e.introLocked)) return 0;
        const s = this.game.speed;
        const threshold = this.W * 0.5;
        if (s > 0 && this.game.player.x > threshold) return s;
        if (s < 0 && this.game.player.x <= 55) return s;
        return 0;
    }

    update() {
        const scroll = this._scrollSpeed();
        this.backgroundLayers.forEach(l => l.update(scroll));

        this.mist.forEach(e => {
            e.x += e.vx - scroll * 0.5;
            e.y += e.vy;
            e.life -= 0.004;
            if (e.life <= 0 || e.x < -20) {
                e.x = this.W + Math.random() * 200;
                e.y = this.H * 0.5 + Math.random() * this.H * 0.4;
                e.life = 0.6 + Math.random() * 0.4;
                e.vy = -0.1 - Math.random() * 0.2;
                e.vx = -0.2 - Math.random() * 0.4;
            }
        });
    }

    draw(context) {
        context.save();
        this.backgroundLayers.forEach(l => l.draw(context));

        // Draw mist particles outer glow (low opacity, larger size)
        context.save();
        this.mist.forEach(e => {
            const alpha = Math.max(0, e.life * 0.5);
            context.globalAlpha = alpha * 0.3;
            context.fillStyle = e.color;
            context.beginPath();
            context.arc(e.x, e.y, e.size * 2.5, 0, Math.PI * 2);
            context.fill();
        });
        context.restore();

        // Draw mist particles inner core
        context.save();
        this.mist.forEach(e => {
            const alpha = Math.max(0, e.life * 0.5);
            context.globalAlpha = alpha;
            context.fillStyle = e.color;
            context.beginPath();
            context.arc(e.x, e.y, e.size, 0, Math.PI * 2);
            context.fill();
        });
        context.restore();

        // Dark vignette for ominous atmosphere
        const vig = context.createRadialGradient(this.W / 2, this.H / 2, this.H * 0.25, this.W / 2, this.H / 2, this.H * 0.9);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, 'rgba(10, 0, 20, 0.5)');
        context.fillStyle = vig;
        context.fillRect(0, 0, this.W, this.H);

        context.restore();
    }
}

export class Level5Background {
    constructor(game) {
        this.game = game;
        this.W = Math.max(game.width, 1550);
        this.H = game.height;

        const img = id => document.getElementById(id);

        // Aspect ratio scaled widths to prevent stretching:
        // BG_3: 2048x400 -> 3584x700
        // BG_2: 1817x400 -> 3180x700
        // BG_1: 1929x400 -> 3376x700
        this.backgroundLayers = [
            new Layer(game, 3584, this.H, 0.15, img('l5_layer3'), 0, 0),
            new Layer(game, 3180, this.H, 0.50, img('l5_layer2'), 0, 0),
            new Layer(game, 3376, this.H, 1.00, img('l5_layer1'), 0, 0),
        ];

        // Tiled ground parameters (from Forest_GroundTileSet.png)
        this.groundImage = img('l5_ground');
        this.groundX = 0;
        this.groundTileWidth = 64; // Seamless repeating middle tile width
        this.groundTileHeight = 228; // Tile height
        this.groundY = this.H - 95; // aligned to player ground margin (55px)

        // Glowing mushroom spores particles
        this.spores = Array.from({ length: 35 }, () => ({
            x: Math.random() * this.W,
            y: Math.random() * this.H,
            vx: (Math.random() - 0.5) * 0.4 - 0.2, // drifts left-ish
            vy: (Math.random() - 0.5) * 0.3 - 0.15, // drifts up/down
            life: Math.random(),
            size: 1.5 + Math.random() * 3,
            color: Math.random() > 0.5 ? '#00ffd2' : '#76ff03', // Cyan or neon green
        }));
    }

    _scrollSpeed() {
        if (this.game.isMultiplayer || this.game.enemies.some(e => e.isBoss && e.introLocked)) return 0;
        const s = this.game.speed;
        const threshold = this.W * 0.5;
        if (s > 0 && this.game.player.x > threshold) return s;
        if (s < 0 && this.game.player.x <= 55) return s;
        return 0;
    }

    update() {
        const scroll = this._scrollSpeed();
        this.backgroundLayers.forEach(l => l.update(scroll));

        this.groundX -= scroll * 1.00;
        if (this.groundX <= -this.groundTileWidth) this.groundX = 0;
        if (this.groundX >= this.groundTileWidth) this.groundX = 0;

        this.spores.forEach(e => {
            e.x += e.vx - scroll * 0.5;
            e.y += e.vy;
            e.life -= 0.003;
            if (e.life <= 0 || e.x < -10 || e.y < -10 || e.y > this.H + 10) {
                e.x = this.W + Math.random() * 150;
                e.y = Math.random() * this.H;
                e.life = 0.6 + Math.random() * 0.4;
                e.vy = (Math.random() - 0.5) * 0.3 - 0.15;
                e.vx = (Math.random() - 0.5) * 0.4 - 0.2;
            }
        });
    }

    draw(context) {
        context.save();
        this.backgroundLayers.forEach(l => l.draw(context));

        // Draw tiled ground
        if (this.groundImage && this.groundImage.complete && this.groundImage.naturalWidth > 0) {
            const gy = this.groundY;

            let tx = this.groundX - this.groundTileWidth;
            while (tx < this.W + this.groundTileWidth) {
                context.drawImage(
                    this.groundImage,
                    64, 0, this.groundTileWidth, this.groundTileHeight, // Source seamless center tile (64x128)
                    tx, gy, this.groundTileWidth, this.groundTileHeight // Destination aligned to player's feet
                );
                tx += this.groundTileWidth;
            }
        }

        // Draw glowing spores (Optimized: draws outer soft glow circle and inner core, avoiding expensive shadowBlur)
        // Draw outer glow circles
        context.save();
        this.spores.forEach(e => {
            const alpha = Math.max(0, e.life);
            context.globalAlpha = alpha * 0.25;
            context.fillStyle = e.color;
            context.beginPath();
            context.arc(e.x, e.y, e.size * 2.2, 0, Math.PI * 2);
            context.fill();
        });
        context.restore();

        // Draw inner spore core
        context.save();
        this.spores.forEach(e => {
            const alpha = Math.max(0, e.life);
            context.globalAlpha = alpha;
            context.fillStyle = e.color;
            context.beginPath();
            context.arc(e.x, e.y, e.size, 0, Math.PI * 2);
            context.fill();
        });
        context.restore();

        // Soft green/cyan vignette for toxic jungle atmosphere
        const vig = context.createRadialGradient(this.W / 2, this.H / 2, this.H * 0.3, this.W / 2, this.H / 2, this.H * 0.9);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, 'rgba(0, 20, 15, 0.35)');
        context.fillStyle = vig;
        context.fillRect(0, 0, this.W, this.H);

        context.restore();
    }
}

// ─────────────────────────────────────────────────────────────────
// NEW CHAPTER II BACKGROUNDS (LEVELS 6 - 10)
// Using existing assets but with heavy color overlays and effects
// ─────────────────────────────────────────────────────────────────

export class Level6Background extends Level5Background {
    // Crystal Caverns (Cyan tint, glowing particles)
    draw(context) {
        super.draw(context);
        context.save();
        context.globalCompositeOperation = 'overlay';
        context.fillStyle = 'rgba(0, 255, 255, 0.15)'; // Cyan crystal tint
        context.fillRect(0, 0, this.W, this.H);
        context.restore();
    }
}

export class Level7Background extends Level2Background {
    // Sky Temple (Amber/Stormy tint)
    draw(context) {
        super.draw(context);
        context.save();
        context.globalCompositeOperation = 'multiply';
        context.fillStyle = 'rgba(255, 200, 100, 0.3)'; // Amber storm tint
        context.fillRect(0, 0, this.game.width, this.game.height);
        context.globalCompositeOperation = 'overlay';
        context.fillStyle = 'rgba(255, 255, 255, 0.1)'; // Lightning flashes
        if (Math.random() > 0.98) context.fillRect(0, 0, this.game.width, this.game.height);
        context.restore();
    }
}

export class Level8Background extends Level4Background {
    // Frozen Abyss (Deep Blue/White tint)
    draw(context) {
        super.draw(context);
        context.save();
        context.globalCompositeOperation = 'hard-light';
        context.fillStyle = 'rgba(0, 100, 255, 0.2)'; // Frost tint
        context.fillRect(0, 0, this.W, this.H);
        context.restore();
    }
}

export class Level9Background extends Level3Background {
    // Void Kingdom (Crimson/Purple glitchy tint)
    update() {
        super.update();
        // Erratic scroll speeds to simulate reality bending
        this.backgroundLayers.forEach(l => l.x += (Math.random() - 0.5) * 2);
    }
    draw(context) {
        super.draw(context);
        context.save();
        context.globalCompositeOperation = 'color-burn';
        context.fillStyle = 'rgba(255, 0, 50, 0.3)'; // Void crimson tint
        context.fillRect(0, 0, this.W, this.H);
        context.restore();
    }
}

export class Level10Background extends Background {
    // Edge of Reality (Black hole aesthetic, everything collapsing)
    draw(context) {
        super.draw(context);
        context.save();
        
        // Deep void darkness
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, this.game.width, this.game.height);

        // Black Hole Accretion Disk glow
        context.globalCompositeOperation = 'screen';
        const bhGlow = context.createRadialGradient(this.game.width/2, this.game.height/2, 50, this.game.width/2, this.game.height/2, 600);
        bhGlow.addColorStop(0, 'rgba(255, 50, 50, 0.5)');
        bhGlow.addColorStop(0.5, 'rgba(50, 0, 100, 0.2)');
        bhGlow.addColorStop(1, 'transparent');
        context.fillStyle = bhGlow;
        context.fillRect(0, 0, this.game.width, this.game.height);
        
        // Center singularity
        context.globalCompositeOperation = 'source-over';
        context.beginPath();
        context.arc(this.game.width/2, this.game.height/2, 80, 0, Math.PI * 2);
        context.fillStyle = '#000000';
        context.fill();
        context.lineWidth = 4;
        context.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        context.stroke();
        
        context.restore();
    }
}