export class AudioManager {
    constructor() {
        this.bgmVolume = parseFloat(localStorage.getItem('bgmVolume') ?? '0.5');
        this.sfxVolume = parseFloat(localStorage.getItem('sfxVolume') ?? '0.5');

        // Preload background music
        this.bgmTracks = {
            1: 'asset/music/freesound_community-cyber-town-simcity-style-music-22907.mp3',
            2: 'asset/music/dziiten-adventures-loop-music-226836.mp3',
            3: 'asset/music/dziiten-adventures-loop-music-226836.mp3',
            4: 'asset/music/delon_boomkin-creepy-female-choir-singing-396575.mp3',
            5: 'asset/music/delon_boomkin-creepy-female-choir-singing-396575.mp3'
        };

        this.bgm = null;
        this.currentBgmLevel = null;
        this.currentBgmPath = '';

        // Preload sound effects
        this.sfxPaths = {
            ground_death: 'asset/music/mixkit-game-blood-pop-slide-2363.wav',
            flying_death: 'asset/music/mixkit-creature-cry-of-hurt-2208.wav',
            punch: 'asset/music/mixkit-martial-arts-punch-2052.wav',
            level_complete: 'asset/music/mixkit-completion-of-a-level-2063.wav',
            game_start: 'asset/music/freesound_community-game-start-6104.mp3',
            game_over: 'asset/music/game-over.mp3',
            oni_voice: 'asset/music/phatphrogstudio-oni-demon-voice-demonic-laughter-477923.mp3',
            kamehameha_voice: 'asset/music/kame-hame-ha.mp3',
            rasengan_voice: 'asset/music/naruto-rasenganshippuden.mp3',
            come_closer: 'asset/music/come-closer.mp3',
            wind_attack: 'asset/music/wind-attack.mp3',
            flame_slash: 'asset/music/flame-slash.mp3',
            player_hurt: 'asset/music/player-hurt-sound.mp3',
            shaia_hurt: 'asset/music/freesound_community-female-hurt-2-94301.mp3',
            shaia_attack: 'asset/music/freesound_gamestudio-female-character-attack-vocal-6-408474.mp3',
            sprint: 'asset/music/sprint.mp3',
            jump: 'asset/music/jump.mp3',
            boss_intro: 'asset/music/freesound_community-boss-intro-02-72039.mp3',
            boss_roar: 'asset/music/freesound_community-monster-roar-02-102957.mp3',
            coin_collect: 'asset/music/ribhavagrawal-coin-recieved-230517.mp3'
        };

        this.preloadedSFX = {};
        for (const [key, path] of Object.entries(this.sfxPaths)) {
            this.preloadedSFX[key] = new Audio(path);
            this.preloadedSFX[key].load();
        }
    }

    playBGMForLevel(level) {
        const path = this.bgmTracks[level];
        if (!path) return;

        // If BGM is already playing for this level, just keep playing it
        if (this.currentBgmLevel === level && this.bgm && !this.bgm.paused) {
            return;
        }

        this.stopBGM();

        this.currentBgmLevel = level;
        this.currentBgmPath = path;
        this.bgm = new Audio(path);
        this.bgm.loop = true;
        this.bgm.volume = this.bgmVolume;

        this.bgm.play().catch(err => {
            console.log("BGM play deferred until user interaction:", err.message);
        });
    }

    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm = null;
        }
        this.currentBgmLevel = null;
        this.currentBgmPath = '';
    }

    pauseBGM() {
        if (this.bgm && !this.bgm.paused) {
            this.bgm.pause();
        }
    }

    resumeBGM() {
        if (this.bgm && this.bgm.paused) {
            this.bgm.play().catch(err => {
                console.log("BGM resume deferred:", err.message);
            });
        }
    }

    setBGMVolume(volume) {
        this.bgmVolume = volume;
        localStorage.setItem('bgmVolume', volume.toString());
        if (this.bgm) {
            this.bgm.volume = volume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume;
        localStorage.setItem('sfxVolume', volume.toString());
    }

    playSFX(type) {
        const original = this.preloadedSFX[type];
        if (!original) {
            console.warn(`SFX type "${type}" not preloaded.`);
            return;
        }

        // Clone the audio node so overlapping triggers work perfectly
        const clone = original.cloneNode(true);

        let volume = this.sfxVolume;
        // Scale player SFX down to 30% to keep them from overpowering BGM
        const playerSFX = ['punch', 'wind_attack', 'flame_slash', 'sprint', 'jump', 'shaia_hurt', 'shaia_attack'];
        if (playerSFX.includes(type)) {
            volume *= 0.3;
        }

        clone.volume = volume;
        clone.play().catch(err => {
            console.log(`SFX "${type}" play deferred:`, err.message);
        });
    }

    // Boss intro ko track karo taaki baad mein band kar sako
    playBossIntro() {
        this.stopBossIntro(); // pehle se chal raha ho toh band karo
        const path = this.sfxPaths['boss_intro'];
        if (!path) return;
        this._bossIntroAudio = new Audio(path);
        this._bossIntroAudio.volume = this.sfxVolume;
        this._bossIntroAudio.play().catch(err => {
            console.log('Boss intro play deferred:', err.message);
        });
    }

    // Boss intro ko dheere dheere fade out karke band karo
    stopBossIntro() {
        if (!this._bossIntroAudio) return;
        const audio = this._bossIntroAudio;
        this._bossIntroAudio = null;
        // Smooth fade out (200ms)
        const fadeStep = audio.volume / 10;
        const fadeInterval = setInterval(() => {
            if (audio.volume > fadeStep) {
                audio.volume = Math.max(0, audio.volume - fadeStep);
            } else {
                audio.pause();
                audio.currentTime = 0;
                clearInterval(fadeInterval);
            }
        }, 20);
    }

    // SFX bajao aur khatam hone par callback chalao
    playSFXWithEnded(type, onEndedCallback) {
        const original = this.preloadedSFX[type];
        if (!original) {
            console.warn(`SFX type "${type}" not preloaded.`);
            if (onEndedCallback) onEndedCallback();
            return;
        }
        const clone = original.cloneNode(true);
        clone.volume = this.sfxVolume;
        if (onEndedCallback) {
            clone.addEventListener('ended', onEndedCallback, { once: true });
        }
        clone.play().catch(err => {
            console.log(`SFX "${type}" play deferred:`, err.message);
            if (onEndedCallback) onEndedCallback();
        });
    }
}
