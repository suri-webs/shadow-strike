
export class InputHandler {

    constructor() {
        this.keys = [];

        // Track which one-shot keys were "just pressed" this frame
        // They will be held in the array for exactly one game update cycle
        this._oneShot = new Set(); // keys that should be cleared after one game frame

        window.addEventListener('keydown', e => {

            if (e.repeat) return;

            const keyLower = e.key.toLowerCase();

            // Movement keys — held continuously
            if (
                keyLower === 'a' ||
                keyLower === 'd' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight'
            ) {
                e.preventDefault();
                const keyToPush = (keyLower === 'a' || keyLower === 'd') ? keyLower : e.key;
                if (!this.keys.includes(keyToPush)) {
                    this.keys.push(keyToPush);
                }
                return;
            }

            // Shift — held continuously
            if (e.key === 'Shift') {
                e.preventDefault();
                if (!this.keys.includes('Shift')) {
                    this.keys.push('Shift');
                }
                return;
            }

            // Q — held to charge, so keep in array while pressed
            if (keyLower === 'q') {
                e.preventDefault();
                if (!this.keys.includes('q')) {
                    this.keys.push('q');
                }
                return;
            }

            // R — one-shot ability (fire slash), keep until next update clears it
            if (keyLower === 'r') {
                e.preventDefault();
                if (!this.keys.includes('r')) {
                    this.keys.push('r');
                    this._oneShot.add('r');
                }
                return;
            }

            // E — one-shot ability (shield activate), keep until next update clears it
            if (keyLower === 'e') {
                e.preventDefault();
                if (!this.keys.includes('e')) {
                    this.keys.push('e');
                    this._oneShot.add('e');
                }
                return;
            }

            // Space — one-shot (jump), keep until next update clears it
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.keys.includes('Space')) {
                    this.keys.push('Space');
                    this._oneShot.add('Space');
                }
                return;
            }

            // Left mouse button click (melee) — one-shot
            if (e.key === 'F') {
                e.preventDefault();
                if (!this.keys.includes('MouseLeft')) {
                    this.keys.push('MouseLeft');
                    this._oneShot.add('MouseLeft');
                }
            }
        });

        window.addEventListener('keyup', e => {
            const keyLower = e.key.toLowerCase();

            // Remove held keys
            if (
                keyLower === 'a' ||
                keyLower === 'd' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight'
            ) {
                const keyToRemove = (keyLower === 'a' || keyLower === 'd') ? keyLower : e.key;
                const index = this.keys.indexOf(keyToRemove);
                if (index > -1) this.keys.splice(index, 1);
                return;
            }

            if (e.key === 'Shift') {
                const index = this.keys.indexOf('Shift');
                if (index > -1) this.keys.splice(index, 1);
                return;
            }

            if (keyLower === 'q') {
                const index = this.keys.indexOf('q');
                if (index > -1) this.keys.splice(index, 1);
                return;
            }
        });

        window.addEventListener('mousedown', e => {
            if (e.button === 0) {
                // Only register attack click if the target is the canvas (not HTML UI overlays)
                const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
                const isUIElement = (
                    tag === 'button' ||
                    tag === 'input' ||
                    tag === 'div' ||
                    tag === 'span' ||
                    tag === 'img' ||
                    tag === 'label'
                );
                if (isUIElement) return;

                if (!this.keys.includes('MouseLeft')) {
                    this.keys.push('MouseLeft');
                    this._oneShot.add('MouseLeft');
                }
            }
        });
    }

    /**
     * Called once per game update frame, AFTER the game has processed input.
     * Clears all one-shot keys so they don't repeat next frame.
     */
    clearOneShots() {
        for (const key of this._oneShot) {
            const index = this.keys.indexOf(key);
            if (index > -1) this.keys.splice(index, 1);
        }
        this._oneShot.clear();
    }

    /**
     * Simulates pressing a key programmatically from virtual touch controls.
     * @param {string} key
     */
    pressVirtualKey(key) {
        if (key === 'r' || key === 'e' || key === 'Space' || key === 'MouseLeft') {
            if (!this.keys.includes(key)) {
                this.keys.push(key);
                this._oneShot.add(key);
            }
        } else {
            // Continuous movement/charge keys
            if (!this.keys.includes(key)) {
                this.keys.push(key);
            }
        }
    }

    /**
     * Simulates releasing a key programmatically from virtual touch controls.
     * @param {string} key
     */
    releaseVirtualKey(key) {
        const index = this.keys.indexOf(key);
        if (index > -1) {
            this.keys.splice(index, 1);
        }
    }
}