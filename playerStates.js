

const states = {
    STANDING: 0,
    RUNNING: 1,
    JUMPING: 2,
    FALLING: 3,
    ATTACK: 4,
    SPRINT: 5,
    DEATH: 6,
    DAMAGE: 7,
};

class State {
    constructor(state) {
        this.state = state;
    }
}


export class Standing extends State {

    constructor(player) {
        super('STANDING');
        this.player = player;
    }

    enter() {
        this.player.frameY = 0;
        this.player.frameX = 0;
        this.player.maxFrame = 1;
        this.player.fps = 9;
        this.player.frameInterval = 1000 / this.player.fps;

        this.player.speed = 0;
        this.player.game.speed = 0;
    }

    handleInput(input) {

        if (input.includes('MouseLeft')) {
            this.player.setState(states.ATTACK);
            return;
        }

        if (input.includes('Space')) {
            this.player.jump();
            this.player.setState(states.JUMPING);
            return;
        }

        const moving =
            input.includes('a') ||
            input.includes('d') ||
            input.includes('ArrowLeft') ||
            input.includes('ArrowRight');

        if (moving) {
            if (input.includes('Shift')) {
                this.player.setState(states.SPRINT);
            } else {
                this.player.setState(states.RUNNING);
            }
        }
    }
}


export class Running extends State {

    constructor(player) {
        super('RUNNING');
        this.player = player;
    }

    enter() {
        this.player.frameY = 2;
        this.player.frameX = 0;
        this.player.maxFrame = 3;
        this.player.fps = 14;
        this.player.frameInterval = 1000 / this.player.fps;
    }

    handleInput(input) {

        if (input.includes('MouseLeft')) {
            this.player.setState(states.ATTACK);
            return;
        }

        if (input.includes('Shift')) {
            this.player.setState(states.SPRINT);
            return;
        }

        if (input.includes('Space')) {
            this.player.jump();
            this.player.setState(states.JUMPING);
            return;
        }

        const moving =
            input.includes('a') ||
            input.includes('d') ||
            input.includes('ArrowLeft') ||
            input.includes('ArrowRight');

        if (!moving) {
            this.player.speed = 0;
            this.player.game.speed = 0;
            this.player.setState(states.STANDING);
        }
    }
}


export class Jumping extends State {

    constructor(player) {
        super('JUMPING');
        this.player = player;
    }

    enter() {
        this.player.frameY = 5;
        this.player.frameX = 0;
        this.player.maxFrame = 7;
        this.player.fps = 12;
        this.player.frameInterval = 1000 / this.player.fps;
    }

    handleInput(input) {

        if (input.includes('MouseLeft')) {
            this.player.setState(states.ATTACK);
            return;
        }

        if (
            input.includes('Space') &&
            this.player.jumpCount < this.player.maxJumps
        ) {
            this.player.jump();
            return;
        }

        if (this.player.vy > 0) {
            this.player.setState(states.FALLING);
        }
    }
}


export class Falling extends State {

    constructor(player) {
        super('FALLING');
        this.player = player;
    }

    enter() {
        this.player.frameY = 5;
        this.player.frameX = 0;
        this.player.maxFrame = 5;
        this.player.fps = 12;
        this.player.frameInterval = 1000 / this.player.fps;
    }

    handleInput(input) {

        if (input.includes('MouseLeft')) {
            this.player.setState(states.ATTACK);
            return;
        }

        if (
            input.includes('Space') &&
            this.player.jumpCount < this.player.maxJumps
        ) {
            this.player.jump();
            this.player.setState(states.JUMPING);
            return;
        }

        if (this.player.onGround()) {

            if (input.includes('Shift')) {
                this.player.setState(states.SPRINT);
            } else if (
                input.includes('a') ||
                input.includes('d') ||
                input.includes('ArrowLeft') ||
                input.includes('ArrowRight')
            ) {
                this.player.setState(states.RUNNING);
            } else {
                this.player.speed = 0;
                this.player.game.speed = 0;
                this.player.setState(states.STANDING);
            }
        }
    }
}


export class Attack extends State {

    constructor(player) {
        super('ATTACK');
        this.player = player;
    }

    enter() {
        this.player.frameY = 8;
        this.player.frameX = 4;
        this.player.maxFrame = 7;
        this.player.fps = 18;
        this.player.frameInterval = 1000 / this.player.fps;

        this.player.speed = 0;
        this.player.game.speed = 0;

        if (this.player.game.audio) {
            if (this.player.characterType === 'shaia') {
                this.player.game.audio.playSFX('shaia_attack');
            } else {
                this.player.game.audio.playSFX('punch');
            }
        }

        if (this.player.fireNormalAttack) {
            this.player.fireNormalAttack();
        }
    }

    handleInput(input) {

        if (this.player.frameX >= this.player.maxFrame) {

            if (!this.player.onGround()) {
                this.player.setState(states.FALLING);
                return;
            }

            if (input.includes('Shift')) {
                this.player.setState(states.SPRINT);
            } else if (
                input.includes('a') ||
                input.includes('d') ||
                input.includes('ArrowLeft') ||
                input.includes('ArrowRight')
            ) {
                this.player.setState(states.RUNNING);
            } else {
                this.player.speed = 0;
                this.player.game.speed = 0;
                this.player.setState(states.STANDING);
            }
        }
    }
}


export class Sprint extends State {

    constructor(player) {
        super('SPRINT');
        this.player = player;
    }

    enter() {
        this.player.frameY = 3;
        this.player.frameX = 0;
        this.player.maxFrame = 5;
        this.player.fps = 16;
        this.player.frameInterval = 1000 / this.player.fps;
    }

    handleInput(input) {

        if (input.includes('MouseLeft')) {
            this.player.setState(states.ATTACK);
            return;
        }

        if (input.includes('Space')) {
            this.player.jump();
            this.player.setState(states.JUMPING);
            return;
        }

        const moving =
            input.includes('a') ||
            input.includes('d') ||
            input.includes('ArrowLeft') ||
            input.includes('ArrowRight');

        if (!input.includes('Shift')) {
            if (moving) {
                this.player.setState(states.RUNNING);
            } else {
                this.player.setState(states.STANDING);
            }
            return;
        }

        if (!moving) {
            this.player.speed = 0;
            this.player.game.speed = 0;
            this.player.setState(states.STANDING);
        }
    }
}


export class Death extends State {

    constructor(player) {
        super('DEATH');
        this.player = player;
    }

    enter() {
        this.player.frameY = 7;
        this.player.frameX = 0;
        this.player.maxFrame = 7;
        this.player.fps = 10;
        this.player.frameInterval = 1000 / this.player.fps;

        this.player.speed = 0;
        this.player.vy = 0;
        this.player.game.speed = 0;
    }

    handleInput(input) {

    }
}


export class Damage extends State {

    constructor(player) {
        super('DAMAGE');
        this.player = player;
    }

    enter() {
        this.player.frameY = 4;
        this.player.frameX = 0;
        this.player.maxFrame = 6;
        this.player.fps = 12;
        this.player.frameInterval = 1000 / this.player.fps;

        this.player.speed = 0;
        this.player.game.speed = 0;

        if (this.player.game.audio) {
            if (this.player.characterType === 'shaia') {
                this.player.game.audio.playSFX('shaia_hurt');
            } else {
                this.player.game.audio.playSFX('player_hurt');
            }
        }
    }

    handleInput(input) {

        if (this.player.frameX >= this.player.maxFrame) {

            if (!this.player.onGround()) {
                this.player.setState(states.FALLING);
                return;
            }

            const moving =
                input.includes('a') ||
                input.includes('d') ||
                input.includes('ArrowLeft') ||
                input.includes('ArrowRight');

            if (input.includes('Shift')) {
                this.player.setState(states.SPRINT);
            } else if (moving) {
                this.player.setState(states.RUNNING);
            } else {
                this.player.speed = 0;
                this.player.game.speed = 0;
                this.player.setState(states.STANDING);
            }
        }
    }
}