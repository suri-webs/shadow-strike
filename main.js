import { Player } from "./player.js";
import { Background, Level2Background, Level3Background, Level4Background, Level5Background, Level6Background, Level7Background, Level8Background, Level9Background, Level10Background } from "./background.js";
import { GroundEnemy } from "./groundEnemy.js";
import { BossEnemy } from "./Bossenemy.js";
import { MinoBoss } from "./minoBoss.js";
import { InputHandler } from "./input.js";
import { FlyingEnemy } from "./flyingEnemy.js";
import { Portal } from "./portal.js";
import { AudioManager } from "./audio.js";

// Global high-performance sprite tinting utility using offscreen canvas caching
const sharedTintCanvas = document.createElement('canvas');
const sharedTintCtx = sharedTintCanvas.getContext('2d');

window.drawTintedSprite = function (ctx, img, srcX, srcY, srcW, srcH, destX, destY, destW, destH, color, alpha = 1.0) {
    if (srcW <= 0 || srcH <= 0 || destW <= 0 || destH <= 0) return;
    sharedTintCanvas.width = srcW;
    sharedTintCanvas.height = srcH;
    sharedTintCtx.clearRect(0, 0, srcW, srcH);

    // Draw the original sprite
    sharedTintCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    // Overlay the tint color
    sharedTintCtx.save();
    sharedTintCtx.globalCompositeOperation = 'source-atop';
    sharedTintCtx.fillStyle = color;
    sharedTintCtx.fillRect(0, 0, srcW, srcH);
    sharedTintCtx.restore();

    // Draw the tinted sprite onto the destination context with opacity blending
    ctx.save();
    ctx.globalAlpha = alpha * ctx.globalAlpha;
    ctx.drawImage(sharedTintCanvas, destX, destY, destW, destH);
    ctx.restore();
};

window.addEventListener('load', function () {

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = 1550;
    canvas.height = 700;

    const LEVEL_CONFIG = {
        1: {
            waves: [
                { type: 'skeleton_white', count: 4 },
                { type: 'mixed_level1', count: 4 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 3000,
            groundMargin: 45,
            bgClass: 'Background',
        },
        2: {
            waves: [
                { type: 'demon', count: 3 },
                { type: 'skeleton_yellow', count: 3 },
                { type: 'mixed_level2', count: 4 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 2500,
            groundMargin: 55,
            bgClass: 'Level2Background',
        },
        3: {
            waves: [
                { type: 'skeleton_white', count: 4 },
                { type: 'arcane_archer', count: 3 },
                { type: 'mixed_level3', count: 5 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 2000,
            groundMargin: 55,
            bgClass: 'Level3Background',
        },
        4: {
            waves: [
                { type: 'skeleton_yellow', count: 5 },
                { type: 'arcane_archer', count: 4 },
                { type: 'mixed_level3', count: 6 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1800,
            groundMargin: 55,
            bgClass: 'Level4Background',
        },
        5: {
            waves: [
                { type: 'demon', count: 4 },
                { type: 'arcane_archer', count: 4 },
                { type: 'mixed_level3', count: 6 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1600,
            groundMargin: 55,
            bgClass: 'Level5Background',
        },
        6: {
            waves: [
                { type: 'skeleton_yellow', count: 5 },
                { type: 'mixed_level2', count: 5 },
                { type: 'mixed_level3', count: 6 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1500,
            groundMargin: 55,
            bgClass: 'Level6Background',
        },
        7: {
            waves: [
                { type: 'flying', count: 6 },
                { type: 'arcane_archer', count: 5 },
                { type: 'mixed_level3', count: 7 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1400,
            groundMargin: 55,
            bgClass: 'Level7Background',
        },
        8: {
            waves: [
                { type: 'skeleton_white', count: 6 },
                { type: 'demon', count: 5 },
                { type: 'mixed_level3', count: 8 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1300,
            groundMargin: 55,
            bgClass: 'Level8Background',
        },
        9: {
            waves: [
                { type: 'skeleton_yellow', count: 6 },
                { type: 'arcane_archer', count: 6 },
                { type: 'mixed_level3', count: 9 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1200,
            groundMargin: 55,
            bgClass: 'Level9Background',
        },
        10: {
            waves: [
                { type: 'mixed_level3', count: 8 },
                { type: 'boss', count: 1 }, // Amarjeet final encounter
            ],
            enemyInterval: 1000,
            groundMargin: 55,
            bgClass: 'Level10Background',
        },
    };

    function rr(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    class StoryDialogueManager {
        constructor(game) {
            this.game = game;
            this.active = false;
            this.type = null; // 'narrative' or 'dialogue'
            this._onNarrativeClose = null; // callback for prologue close

            // Typewriter typing state
            this.fullText = "";
            this.typedText = "";
            this.charIndex = 0;
            this.typeTimer = 0;
            this.typeSpeed = 22; // ms per character

            // Dialogue cutscene state
            this.dialogueList = [];
            this.dialogueIndex = 0;
            this.onCompleteCallback = null;

            // DOM Elements
            this.storyOverlay = document.getElementById('story-intro-overlay');
            this.storyLevelTitle = document.getElementById('story-level-title');
            this.storyTextContainer = document.getElementById('story-text-container');

            this.dialogueOverlay = document.getElementById('dialogue-overlay');
            this.dialogueBox = document.querySelector('.dialogue-box');
            this.portraitLeft = document.getElementById('dialogue-portrait-left');
            this.avatarLeft = document.getElementById('dialogue-avatar-left');
            this.portraitRight = document.getElementById('dialogue-portrait-right');
            this.avatarRight = document.getElementById('dialogue-avatar-right');
            this.speakerName = document.getElementById('dialogue-speaker-name');
            this.dialogueText = document.getElementById('dialogue-text');

            // Amarjeet — The Devourer of Reality (shared avatar across all levels)
            this.amarjeetAvatar = "asset/main-villan-of-stoory/amarjeet-da-blackhole.png";

            // Databases
            this.narratives = {
                prologue: "🌌 PROLOGUE — THE BEGINNING OF THE BLACK HOLE\n\nLong before time had a name, the universe was protected by Ten Dimensional Realms. Each realm contained a fragment of the Core of Creation, an energy that kept reality stable.\n\nAt the center of these realms stood a guardian:\n\nAMARJEET\n\n\"The Keeper of Infinity\"\n\nHe was not evil.\n\nHe protected worlds for millions of years.\n\nBut one day...\n\nA cosmic entity known as THE VOID EMPEROR attacked reality from beyond existence.\n\nTo save the universe, Amarjeet sealed the Void Emperor using forbidden cosmic energy.\n\nThe ritual succeeded.\n\nBut the energy transformed Amarjeet himself.\n\nA black singularity was born inside his chest.\n\nOver centuries the singularity consumed his mind.\n\nHe became—\n\nAMARJEET DA BLACK HOLE\nThe Devourer of Reality\n\nNow he seeks to merge all realms into one infinite black hole.\n\nOnly four heroes remain:\n\nSHINOBI\nJOTEM\nSHAIA\nARCHDEMON\n\nAncient prophecy says:\n\n\"When darkness consumes the stars,\nthe branch of creation shall pierce infinity.\"\n\nOnly the World Tree Stick can destroy Amarjeet's singularity.",
                1: "LEVEL 1 — SHADOW CITY\n\nA once-glorious metropolis consumed by Amarjeet's darkness. The city of eternal night — overrun by corrupted guardians he once commanded.\n\nNeon towers gone dark. Streets ruled by shadow. At its heart waits the SHADOW LORD, Amarjeet's first corrupted lieutenant.\n\nDefeat the Shadow Lord. Prove your worth. Your journey across the realms begins here.",
                2: "LEVEL 2 — SPIDER FOREST\n\nThe ancient forest is wrapped in living webs. Amarjeet's corruption has reached the trees — they no longer grow, they only consume.\n\nDeep within this arachnid nightmare stands MECHA-STONE, an ancient runic titan reprogrammed by Amarjeet's gravitational force into a weapon of destruction.\n\nCut through the webs. Shatter the machine. Move forward.",
                3: "LEVEL 3 — HALLOWEEN HOUSE\n\nWithin the witch's cursed cabin, gravity behaves strangely and ghosts wander endlessly. Amarjeet's black hole energy has trapped the spirits here — unable to pass on. Their suffering fuels his power.\n\nDRAGON LORD guards this cursed place, feeding on the agony of the trapped souls.\n\nFree the spirits. Break the curse. Move forward.",
                4: "LEVEL 4 — HAUNTED GRAVEYARD\n\nYou tread on sacred, desecrated ground. The ancient spirits of this graveyard have a secret — one Amarjeet does not want you to hear.\n\nMINO BOSS guards the portal jealously. Defeat him, and the spirits will finally speak.\n\nWhat they reveal... will change everything.",
                5: "LEVEL 5 — MUSHROOM GROVE\n\nThe final fragment of the first chapter. A beautiful, toxic forest of glowing fungi — and at its heart grows something Amarjeet fears above all else.\n\nTHE IMPALER stands between you and destiny. Defeat him.\n\nThe World Tree Stick awaits.\nAnd with it... the first real confrontation with Amarjeet Da Black Hole himself.",
                6: "LEVEL 6 — CRYSTAL CAVERNS\n\nAmarejeet has fled into a forgotten dimension. You follow.\n\nThe Crystal Caverns glow with corrupted energy — the crystals alive with fractured light, whispering from deep within their shattered hearts:\n\n\"The Void Emperor awakens...\"\n\nAmarejeet fears something greater than himself. CRYSTAL TITAN guards these caverns. Discover the truth hidden in the crystal dark.",
                7: "LEVEL 7 — SKY TEMPLE\n\nFloating islands drift through endless storms. This ancient temple stands at the crossroads of dimensions — and Amarjeet is beginning to reveal his past.\n\nSomething broke him. Something he refuses to say.\n\nSTORM SERAPH, guardian of the skies, has been twisted by Amarjeet's singularity. Strike through the storms and reach the truth.",
                8: "LEVEL 8 — FROZEN ABYSS\n\nBeneath frozen oceans, an ancient dragon sleeps. FROST WYRM guards secrets frozen in time.\n\nBut something far more terrifying is stirring. The sky is cracking. A giant eye appears in space.\n\nThe seal Amarjeet created is weakening. Something unimaginable is about to break free. Defeat Frost Wyrm... before the abyss opens completely.",
                9: "LEVEL 9 — VOID KINGDOM\n\nThe realm itself bends. Reality collapses and rebuilds in real time.\n\nIn the fragments of broken space, you see memories — Amarjeet's memories. A guardian. A sacrifice. A tragedy that spans eternity.\n\nTHE ABYSS KNIGHT stands as the final guardian before the end. And when he falls... you will finally understand everything.",
                10: "LEVEL 10 — EDGE OF REALITY\n\nThis is where it all ends.\n\nThe universe is collapsing. Stars disappear. Gravity breaks. Entire planets are swallowed.\n\nAmarjeet Da Black Hole stands before you — not as a monster, but as a broken guardian waiting for someone strong enough to end his suffering.\n\nThe World Tree Stick pulses with ancient light.\n\nThis is the final battle for all of reality."
            };

            this.heroAvatars = {
                shinobi: "asset/players/player-banner/player1-banner.png",
                jotem: "asset/players/player-banner/player2-banner.png",
                shaia: "asset/players/player-banner/player3-banner.png",
                archdemon: "asset/players/player-banner/player4-banner.png"
            };

            this.heroNames = {
                shinobi: "SHINOBI",
                jotem: "JOTEM",
                shaia: "SHAIA",
                archdemon: "ARCHDEMON"
            };

            this.bossAvatars = {
                1: "asset/boss-level1/idle/idle_0.png",
                2: "asset/MECHA-stone/Character_sheet.png",
                3: "asset/demon-lord-bosslevel2/dragon_lord_idle_basic_74x74.png",
                4: "asset/mino/idle/idle_1.png",
                5: "asset/level-5-bossImpaler/idle/idle1.png",
                6: "asset/boss-level1/idle/idle_0.png",
                7: "asset/demon-lord-bosslevel2/dragon_lord_idle_basic_74x74.png",
                8: "asset/mino/idle/idle_1.png",
                9: "asset/level-5-bossImpaler/idle/idle1.png",
                10: "asset/main-villan-of-stoory/amarjeet-da-blackhole.png"
            };

            this.bossNames = {
                1: "SHADOW LORD",
                2: "MECHA-STONE",
                3: "DRAGON LORD",
                4: "MINO BOSS",
                5: "THE IMPALER",
                6: "CRYSTAL TITAN",
                7: "STORM SERAPH",
                8: "FROST WYRM",
                9: "THE ABYSS KNIGHT",
                10: "AMARJEET DA BLACK HOLE"
            };
        }

        startLevelIntro(level) {
            this.active = true;
            this.type = 'narrative';
            this.fullText = this.narratives[level] || `LEVEL ${level}\n\nPrepare for battle. Defeat the enemies and advance!`;
            this.typedText = "";
            this.charIndex = 0;
            this.typeTimer = 0;

            if (this.storyLevelTitle) {
                const titles = {
                    prologue: "PROLOGUE: THE KEEPER OF INFINITY",
                    1: "LEVEL 1: SHADOW CITY",
                    2: "LEVEL 2: SPIDER FOREST",
                    3: "LEVEL 3: HALLOWEEN HOUSE",
                    4: "LEVEL 4: HAUNTED GRAVEYARD",
                    5: "LEVEL 5: MUSHROOM GROVE",
                    6: "LEVEL 6: CRYSTAL CAVERNS",
                    7: "LEVEL 7: SKY TEMPLE",
                    8: "LEVEL 8: FROZEN ABYSS",
                    9: "LEVEL 9: VOID KINGDOM",
                    10: "LEVEL 10: EDGE OF REALITY"
                };
                this.storyLevelTitle.innerText = titles[level] || `LEVEL ${level}`;
            }

            if (this.storyOverlay) {
                this.storyOverlay.classList.add('active');
            }
        }

        startPrologue(callback) {
            this._onNarrativeClose = callback;
            this.startLevelIntro('prologue');
        }

        startPreBossDialogue(level) {
            this.active = true;
            this.type = 'dialogue';
            this.dialogueIndex = 0;
            this.onCompleteCallback = null;

            const hero = this.game.player.characterType;
            const H = this.heroNames[hero];
            const bName = this.bossNames[level];

            // Amarjeet appears remotely before each boss fight (levels 1-9).
            // Level 10: direct confrontation with Amarjeet himself.
            const dialogueDb = {
                1: [
                    { speaker: 'hero', name: H, text: "Show yourself, Amarjeet!" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "I am what remains after stars die. Face my Shadow Lord." }
                ],
                2: [
                    { speaker: 'hero', name: H, text: "You destroyed this world." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "No. Time destroyed it. I merely accelerate destiny." },
                    { speaker: 'hero', name: H, text: "Destiny can be changed." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Then change the inevitable." }
                ],
                3: [
                    { speaker: 'hero', name: H, text: "Why spread suffering?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Suffering creates strength." },
                    { speaker: 'hero', name: H, text: "Then your strength is built on corpses." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Empires always are." }
                ],
                4: [
                    { speaker: 'hero', name: H, text: "This graveyard is restless." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Dead whispers. Meaningless noise." }
                ],
                5: [
                    { speaker: 'hero', name: H, text: "The final fragment of this chapter." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "The Impaler awaits." }
                ],
                6: [
                    { speaker: 'hero', name: H, text: "These crystals... they are whispering." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Do not listen to them. Destroy the Crystal Titan." }
                ],
                7: [
                    { speaker: 'hero', name: H, text: "Tell me the truth." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "I became a monster so reality could survive." },
                    { speaker: 'hero', name: H, text: "Millions died because of you." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Millions died so trillions may live." }
                ],
                8: [
                    { speaker: 'hero', name: H, text: "An ancient dragon sleeps here." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Let us see if you can wake it." }
                ],
                9: [
                    { speaker: 'hero', name: H, text: "You were a guardian..." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "I was." },
                    { speaker: 'hero', name: H, text: "Then return." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "There is no return for singularities." }
                ],
                10: [
                    { speaker: 'hero', name: H, text: "This ends now." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "I prayed someone strong enough would come." },
                    { speaker: 'hero', name: H, text: "Then stop fighting." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "If I fall... the Void Emperor awakens." },
                    { speaker: 'hero', name: H, text: "We'll face him together." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "You still believe in hope..." },
                    { speaker: 'hero', name: H, text: "Always." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Then show me... that hope is stronger than infinity." }
                ],
            };

            this.dialogueList = dialogueDb[level] || [
                { speaker: 'amarjeet', name: "AMARJEET", text: "Another realm falls to your blade." },
                { speaker: 'hero', name: H, text: "And so will you." }
            ];

            this.showDialogueStep();
        }

        startPostBossDialogue(level, callback) {
            this.active = true;
            this.type = 'dialogue';
            this.dialogueIndex = 0;
            this.onCompleteCallback = callback;

            const hero = this.game.player.characterType;
            const H = this.heroNames[hero];
            const bName = this.bossNames[level];

            // Post-boss: the defeated boss's last words, then Amarjeet reacts
            const dialogueDb = {
                1: [
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Another guardian falls." },
                    { speaker: 'hero', name: H, text: "Who are you?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "I am what remains after stars die." },
                    { speaker: 'hero', name: H, text: "Then I will become your end." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Brave words. Let us see if they survive gravity." },
                ],
                2: [
                    { speaker: 'boss', name: bName, text: "SYSTEM ERROR..." },
                    { speaker: 'hero', name: H, text: "The machine is destroyed." }
                ],
                3: [
                    { speaker: 'boss', name: bName, text: "No... the spirits..." },
                    { speaker: 'hero', name: H, text: "They are free." }
                ],
                4: [
                    { speaker: 'boss', name: "SPIRIT", text: "Seek the World Tree. Wood is the enemy of infinity." },
                    { speaker: 'hero', name: H, text: "Wood can defeat a black hole?" },
                    { speaker: 'boss', name: "SPIRIT", text: "Creation defeats destruction." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "..." } // Watches silently
                ],
                5: [
                    { speaker: 'hero', name: H, text: "[Obtained WORLD TREE STICK]" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Impossible... The branch still exists." },
                    { speaker: 'hero', name: H, text: "Your reign ends now." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "No. This is only the beginning." },
                ],
                6: [
                    { speaker: 'hero', name: H, text: "Who is the Void Emperor?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "The one even I fear." },
                    { speaker: 'hero', name: H, text: "You fear someone?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Fear created me." },
                ],
                7: [
                    { speaker: 'boss', name: bName, text: "The storms... quiet..." },
                    { speaker: 'hero', name: H, text: "We press on." }
                ],
                8: [
                    { speaker: 'boss', name: "UNKNOWN VOICE", text: "Amarjeet... your seal weakens." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Stay back. You cannot fight what comes." }
                ],
                9: [
                    { speaker: 'boss', name: bName, text: "The void reclaims me..." },
                    { speaker: 'hero', name: H, text: "To the Edge of Reality." }
                ],
                10: [
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Thank you... Guardian..." },
                    { speaker: 'hero', name: H, text: "Guardian?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "You are the new protector of reality." },
                ],
            };

            this.dialogueList = dialogueDb[level] || [
                { speaker: 'boss', name: bName, text: "No! I have been defeated!" },
                { speaker: 'hero', name: H, text: "Victory is mine!" }
            ];

            this.showDialogueStep();
        }

        showDialogueStep() {
            if (this.dialogueIndex >= this.dialogueList.length) {
                this.closeDialogue();
                return;
            }

            const step = this.dialogueList[this.dialogueIndex];
            this.speakerName.innerText = step.name;

            if (step.speaker === 'hero') {
                this.dialogueBox.className = "dialogue-box speaker-left";
                this.avatarLeft.src = this.heroAvatars[this.game.player.characterType];
                this.portraitLeft.classList.add('active');
                this.portraitRight.classList.remove('active');
            } else if (step.speaker === 'amarjeet') {
                // Amarjeet appears in the right slot with his special avatar
                this.dialogueBox.className = "dialogue-box speaker-right";
                this.avatarRight.src = this.amarjeetAvatar;
                this.portraitRight.classList.remove('mecha-stone');
                this.portraitRight.classList.add('active');
                this.portraitLeft.classList.remove('active');
            } else {
                this.dialogueBox.className = "dialogue-box speaker-right";
                this.avatarRight.src = this.bossAvatars[this.game.level] || this.amarjeetAvatar;

                if (this.game.level === 2) {
                    this.portraitRight.classList.add('mecha-stone');
                } else {
                    this.portraitRight.classList.remove('mecha-stone');
                }

                this.portraitRight.classList.add('active');
                this.portraitLeft.classList.remove('active');
            }

            this.fullText = step.text;
            this.typedText = "";
            this.charIndex = 0;
            this.typeTimer = 0;

            if (this.dialogueOverlay) {
                this.dialogueOverlay.classList.add('active');
            }
        }

        nextStep() {
            if (this.charIndex < this.fullText.length) {
                this.charIndex = this.fullText.length;
                this.typedText = this.fullText;
                if (this.type === 'narrative') {
                    this.storyTextContainer.innerText = this.typedText;
                } else {
                    this.dialogueText.innerText = this.typedText;
                }
                return;
            }

            if (this.type === 'narrative') {
                this.closeNarrative();
            } else {
                this.dialogueIndex++;
                this.showDialogueStep();
            }
        }

        closeNarrative() {
            this.active = false;
            if (this.storyOverlay) {
                this.storyOverlay.classList.remove('active');
            }
            // If a callback is set (e.g. prologue → open char select), fire it
            if (this._onNarrativeClose) {
                const cb = this._onNarrativeClose;
                this._onNarrativeClose = null;
                cb();
            } else if (this.game.audio && this.game.gameStarted) {
                this.game.audio.playBGMForLevel(this.game.level);
            }
        }

        closeDialogue() {
            this.active = false;
            if (this.dialogueOverlay) {
                this.dialogueOverlay.classList.remove('active');
            }
            this.portraitLeft.classList.remove('active');
            this.portraitRight.classList.remove('active');

            if (this.onCompleteCallback) {
                this.onCompleteCallback();
                this.onCompleteCallback = null;
            }
        }

        bindEvents() {
            window.addEventListener('keydown', (e) => {
                if (this.active && (e.key === ' ' || e.key === 'Spacebar')) {
                    e.preventDefault();
                    this.nextStep();
                }
            });

            if (this.storyOverlay) {
                this.storyOverlay.addEventListener('click', () => {
                    if (this.active && this.type === 'narrative') this.nextStep();
                });
            }

            if (this.dialogueOverlay) {
                this.dialogueOverlay.addEventListener('click', () => {
                    if (this.active && this.type === 'dialogue') this.nextStep();
                });
            }
        }

        update(deltaTime) {
            if (!this.active) return;

            if (this.charIndex < this.fullText.length) {
                this.typeTimer += deltaTime;
                if (this.typeTimer >= this.typeSpeed) {
                    this.typeTimer = 0;
                    this.charIndex++;
                    this.typedText = this.fullText.substring(0, this.charIndex);

                    if (this.type === 'narrative') {
                        this.storyTextContainer.innerText = this.typedText;
                    } else {
                        this.dialogueText.innerText = this.typedText;
                    }
                }
            }
        }
    }

    class Game {

        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.groundMargin = 40;
            this.speed = 0;
            this.maxSpeed = 6;
            this.input = new InputHandler();
            this.gameStarted = false;
            this.selectedCharacter = 'shinobi';
            this.coins = parseInt(localStorage.getItem('gameCoins') || '0');

            this.startTransition = false;
            this.startTransitionTimer = 0;
            this.startTransitionDuration = 1200;
            this.levelSelectMode = false; // true when launching from level select (not start screen)

            this.level = 1;
            this.audio = new AudioManager();
            this.paused = false;
            this.storyDialogueManager = new StoryDialogueManager(this);
            this.storyDialogueManager.bindEvents();
            this._init();

        }

        get currentHP() {
            return this._currentHP;
        }
        set currentHP(value) {
            if (this.player && this.player.shieldActive && value < this._currentHP) {
                this.spawnHitSparks(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 'cyan');
                this.shake = Math.max(this.shake, 12);
                return;
            }
            this._currentHP = value;
        }

        get playerHit() {
            return this._playerHit;
        }
        set playerHit(value) {
            if (this.player && this.player.shieldActive && value === true) {
                return;
            }
            this._playerHit = value;
        }

        _init() {
            const bgMap = {
                Background,
                Level2Background,
                Level3Background,
                Level4Background,
                Level5Background,
                Level6Background,
                Level7Background,
                Level8Background,
                Level9Background,
                Level10Background
            };
            const cfg = LEVEL_CONFIG[this.level];
            this.background = new bgMap[cfg.bgClass](this);
            this.player = new Player(this, this.selectedCharacter);

            if (this.audio && (this.gameStarted || this.startTransition)) {
                this.audio.playBGMForLevel(this.level);
            }

            this.groundMargin = cfg.groundMargin ?? 50;

            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = cfg.enemyInterval;

            this.particles = [];
            this.coinPickups = [];
            this.coinHUDFlash = 0;

            this.waveIndex = 0;
            this.waveDef = [...cfg.waves];
            if (this.level < 10) {
                const bossIdx = this.waveDef.findIndex(w => w.type === 'boss');
                if (bossIdx !== -1) {
                    this.waveDef.splice(bossIdx + 1, 0, { type: 'amarjeet_timed' });
                }
            }
            this.waveSpawnedCount = 0;
            this.waveComplete = false;
            this.waveTransTimer = 0;
            this.waveTransDelay = 1800;

            this._playerHit = false;
            this.shake = 0;
            this.maxHP = 100;
            this._currentHP = 100;
            this.hitCooldown = 0;
            this.hitCooldownMax = 800;

            this.score = 0;
            this.combo = 0;
            this.comboTimer = 0;
            this.comboMax = 3000;
            this.multiplier = 1;

            this.gameOver = false;
            this.gameOverTimer = 0;
            this.gameOverDelay = 0;
            this.levelComplete = false;
            this.levelCompleteTimer = 0;

            this.waveAnnounce = null;
            this.waveAnnTimer = 0;
            this.waveAnnDur = 2500;

            this.floatingTexts = [];
            this.damageTexts = [];

            this.portal = null;
            this.portalSpawned = false;
            this.postBossDialoguePlayed = false;
        }

        restart() { this._init(); }

        nextLevel() {
            const savedHP = this.currentHP;
            const savedScore = this.score;
            if (this.level >= 5) { this.level = 1; this._init(); return; }
            this.level++;

            const maxUnlocked = parseInt(localStorage.getItem('maxUnlockedLevel') || '1');
            if (this.level > maxUnlocked) {
                localStorage.setItem('maxUnlockedLevel', this.level.toString());
            }

            this._init();
            this.currentHP = Math.min(100, savedHP + 20);
            this.score = savedScore;
        }

        get currentWave() { return this.waveDef[this.waveIndex] || null; }

        _spawnFromWave() {
            const wave = this.currentWave;
            if (!wave) return;

            if (wave.type === 'flying') {
                this.enemies.push(new FlyingEnemy(this));
                this.waveSpawnedCount++;
                this.shake = 100;

            } else if (wave.type === 'skeleton_white') {
                this.enemies.push(new GroundEnemy(this, 'skeleton_white'));
                this.waveSpawnedCount++;
                this.shake = 100;

            } else if (wave.type === 'demon') {
                this.enemies.push(new GroundEnemy(this, 'demon'));
                this.waveSpawnedCount++;
                this.shake = 100;

            } else if (wave.type === 'skeleton_yellow') {
                this.enemies.push(new GroundEnemy(this, 'skeleton_yellow'));
                this.waveSpawnedCount++;
                this.shake = 100;

            } else if (wave.type === 'arcane_archer') {
                this.enemies.push(new GroundEnemy(this, 'arcane_archer'));
                this.waveSpawnedCount++;
                this.shake = 100;

            } else if (wave.type === 'mixed_level1') {
                const rand = Math.random();
                if (rand < 0.6) {
                    this.enemies.push(new GroundEnemy(this, 'skeleton_white'));
                } else {
                    this.enemies.push(new FlyingEnemy(this));
                }
                this.waveSpawnedCount++;
                this.shake = 100;

            } else if (wave.type === 'mixed_level2') {
                const rand = Math.random();
                if (rand < 0.4) {
                    this.enemies.push(new GroundEnemy(this, 'demon'));
                } else if (rand < 0.75) {
                    this.enemies.push(new GroundEnemy(this, 'skeleton_yellow'));
                } else {
                    this.enemies.push(new FlyingEnemy(this));
                }
                this.waveSpawnedCount++;
                this.shake = 100;

            } else if (wave.type === 'mixed_level3') {
                const rand = Math.random();
                if (rand < 0.3) {
                    this.enemies.push(new GroundEnemy(this, 'demon'));
                } else if (rand < 0.55) {
                    this.enemies.push(new GroundEnemy(this, 'skeleton_yellow'));
                } else if (rand < 0.8) {
                    this.enemies.push(new GroundEnemy(this, 'arcane_archer'));
                } else {
                    this.enemies.push(new FlyingEnemy(this));
                }
                this.waveSpawnedCount++;
                this.shake = 100;

            } else if (wave.type === 'amarjeet_timed') {
                this.enemies = this.enemies.filter(e => e.isBoss);
                const amarjeet = new BossEnemy(this, 'amarjeet');
                amarjeet.isTimedEncounter = true;
                amarjeet.timedDuration = 15000 + (this.level - 1) * 2000;
                this.enemies.push(amarjeet);
                this.waveSpawnedCount++;
                this.waveAnnounce = 'THE DEVOURER APPROACHES...';
                this.waveAnnTimer = 0;
                this.enemyInterval = 999999;
                this.shake = 450;
            } else if (wave.type === 'boss') {
                this.enemies = this.enemies.filter(e => e.isBoss);
                if (this.level === 10) {
                    this.enemies.push(new BossEnemy(this, 'amarjeet')); // Level 10: Final Boss
                } else if (this.level === 9) {
                    this.enemies.push(new BossEnemy(this, 'abyss_knight')); // Level 9: Abyss Knight
                } else if (this.level === 8) {
                    this.enemies.push(new BossEnemy(this, 'frost_wyrm')); // Level 8: Frost Wyrm
                } else if (this.level === 7) {
                    this.enemies.push(new BossEnemy(this, 'storm_seraph')); // Level 7: Storm Seraph
                } else if (this.level === 6) {
                    this.enemies.push(new BossEnemy(this, 'crystal_titan')); // Level 6: Crystal Titan
                } else if (this.level === 5) {
                    this.enemies.push(new BossEnemy(this, 'impaler')); // Level 5: Impaler
                } else if (this.level === 4) {
                    this.enemies.push(new MinoBoss(this));         // Level 4: Mino boss
                } else if (this.level === 3) {
                    this.enemies.push(new BossEnemy(this, 'demon_lord')); // Level 3: Demon Lord
                } else if (this.level === 2) {
                    this.enemies.push(new BossEnemy(this, 'mecha_stone')); // Level 2: Mecha Stone
                } else {
                    this.enemies.push(new BossEnemy(this, 'boss_level_1')); // Level 1: default
                }
                this.waveSpawnedCount++;
                this.waveAnnounce = 'BOSS INCOMING!';
                this.waveAnnTimer = 0;
                this.enemyInterval = 999999;
                this.shake = 450;

                // Trigger Pre-Boss Dialogue cutscene!
                if (this.storyDialogueManager) {
                    this.storyDialogueManager.startPreBossDialogue(this.level);
                }
            }
        }

        _waveTotal() {
            const wave = this.currentWave;
            if (!wave) return 0;
            return wave.count || 1;
        }

        _advanceWave() {
            this.waveIndex++;
            this.waveSpawnedCount = 0;
            this.waveComplete = false;
            this.enemyTimer = 0;

            this.enemyInterval = LEVEL_CONFIG[this.level].enemyInterval;
            const wave = this.currentWave;
            if (wave) {
                const waveNames = {
                    skeleton_white: ' SKELETON HORDE',
                    flying: ' AERIAL ASSAULT',
                    demon: ' DEMON FORCE',
                    skeleton_yellow: ' GOLDEN SKELETONS',
                    arcane_archer: ' ARCANE ARCHERS',
                    mixed_level1: ' COMBINED ASSAULT',
                    mixed_level2: ' COMBINED ASSAULT',
                    mixed_level3: ' ALL FORCES',
                    sub_boss: ' SUB-BOSS INCOMING',
                    boss: ' BOSS FIGHT',
                };
                this.waveAnnounce = waveNames[wave.type] || 'WAVE ' + (this.waveIndex + 1);
                this.waveAnnTimer = 0;
            }
        }

        _addFloatingText(x, y, text, color = '#ffffff') {
            this.floatingTexts.push({ x, y, text, color, life: 1.0, vy: -0.8 });
        }

        spawnDamageText(x, y, amount) {
            // RPG-style scale calculation: display value is around amount * 85 + random variance
            const baseMultiplier = 85;
            const displayVal = Math.round(amount * baseMultiplier + (Math.random() - 0.5) * 60);

            // Determine if it is a critical / special hit
            const isCrit = amount > 12 || Math.random() < 0.3;

            // Random horizontal velocity to scatter numbers slightly
            const vx = (Math.random() - 0.5) * 4;
            // Upward initial velocity for the bounce
            const vy = -7 - Math.random() * 4;
            // Gravity to pull it back down
            const gravity = 0.38;
            // Slight starting angle (tilt)
            const angle = (Math.random() - 0.5) * 0.28;

            // Optional badge text like "DOUBLE", "CRIT", "MAX"
            let badgeText = null;
            if (isCrit) {
                const r = Math.random();
                if (r < 0.35) badgeText = 'DOUBLE';
                else if (r < 0.7) badgeText = 'CRIT';
                else badgeText = 'MAX';
            }

            this.damageTexts.push({
                x: x + (Math.random() - 0.5) * 12,
                y: y + (Math.random() - 0.5) * 12,
                text: displayVal.toString(),
                isCrit: isCrit,
                badgeText: badgeText,
                vx: vx,
                vy: vy,
                gravity: gravity,
                angle: angle,
                scale: 1.8, // starts large (pop)
                life: 900,  // life in milliseconds
                maxLife: 900
            });
        }

        spawnHitSparks(x, y, colorType = 'gold') {
            const count = 12 + Math.floor(Math.random() * 6);
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 3;
                let color = 'rgba(255, 215, 0, 0.85)';
                let size = Math.random() * 6 + 3;
                let type = 'spark';
                let decay = 0.94;
                let gravity = 0.05;

                if (colorType === 'cyan') {
                    color = Math.random() > 0.4 ? 'rgba(200, 245, 255, 0.9)' : 'rgba(100, 210, 255, 0.8)';
                    type = 'spark';
                    size = Math.random() * 7 + 4;
                    decay = 0.93;
                    gravity = 0.03;
                } else if (colorType === 'orange') {
                    color = Math.random() > 0.4 ? 'rgba(255, 120, 0, 0.9)' : 'rgba(255, 60, 0, 0.8)';
                    type = Math.random() > 0.5 ? 'spark' : 'circle';
                    size = Math.random() * 8 + 3;
                    decay = 0.92;
                    gravity = -0.04;
                } else if (colorType === 'green') {
                    color = Math.random() > 0.4 ? 'rgba(0, 255, 200, 0.9)' : 'rgba(118, 255, 3, 0.8)';
                    type = Math.random() > 0.5 ? 'spark' : 'circle';
                    size = Math.random() * 8 + 3;
                    decay = 0.92;
                    gravity = 0.04;
                }

                this.particles.push({
                    x: x + (Math.random() - 0.5) * 15,
                    y: y + (Math.random() - 0.5) * 15,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: size,
                    alpha: 1.0,
                    color: color,
                    type: type,
                    decay: decay,
                    gravity: gravity,
                    angle: angle,
                    va: (Math.random() - 0.5) * 0.3
                });
            }
        }

        /**
         * Central damage handler for all sources that damage the player.
         * Returns true if damage was actually applied (not blocked by shield).
         */
        hurtPlayer(damage, isBossKill = false) {
            if (this.hitCooldown > 0) return false;
            const player = this.player;
            if (!player || player.isDead) return false;

            // Shield blocks all damage
            if (player.shieldActive) {
                // Show a blocked-hit effect so player feels the shield working
                this.spawnHitSparks(
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    'cyan'
                );
                this.hitCooldown = this.hitCooldownMax;
                return false;
            }

            this.currentHP = Math.max(0, this.currentHP - damage);
            this.playerHit = true;
            this.hitCooldown = this.hitCooldownMax;
            player.takingDamage = true;
            if (this.currentHP <= 0 && isBossKill) {
                player.killedByBoss = true;
            }
            return true;
        }

        spawnDissolveParticles(enemy) {
            const count = enemy.isBoss ? 45 : 20 + Math.floor(Math.random() * 10);
            let colors = ['rgba(240,240,240,0.85)', 'rgba(190,190,190,0.7)'];
            let isGolden = false;
            let isVolcanic = false;
            let isShadow = false;
            let isIce = false;

            if (enemy.enemyType === 'skeleton_white') {
                colors = ['rgba(245, 245, 240, 0.85)', 'rgba(170, 170, 160, 0.7)', 'rgba(100, 100, 100, 0.4)'];
            } else if (enemy.enemyType === 'skeleton_yellow') {
                colors = ['rgba(255, 223, 0, 0.85)', 'rgba(218, 165, 32, 0.7)', 'rgba(255, 255, 255, 0.5)'];
                isGolden = true;
            } else if (enemy.enemyType === 'demon') {
                colors = ['rgba(138, 43, 226, 0.85)', 'rgba(75, 0, 130, 0.75)', 'rgba(255, 0, 128, 0.6)'];
                isShadow = true;
            } else if (enemy.enemyType === 'arcane_archer') {
                colors = ['rgba(186, 85, 211, 0.85)', 'rgba(147, 112, 219, 0.75)', 'rgba(255, 255, 255, 0.6)'];
                isShadow = true;
            } else if (enemy.enemyType === 'flying') {
                colors = ['rgba(255, 99, 71, 0.85)', 'rgba(255, 140, 0, 0.75)', 'rgba(255, 69, 0, 0.6)'];
                isVolcanic = true;
            } else if (enemy.isBoss) {
                if (enemy.bossType === 'boss_level_1') {
                    colors = ['rgba(200, 245, 255, 0.9)', 'rgba(100, 210, 255, 0.85)', 'rgba(255, 255, 255, 0.6)'];
                    isIce = true;
                } else if (enemy.bossType === 'mecha_stone') {
                    colors = ['rgba(150, 120, 100, 0.85)', 'rgba(110, 90, 80, 0.75)', 'rgba(200, 200, 200, 0.5)'];
                } else if (enemy.bossType === 'demon_lord') {
                    colors = ['rgba(255, 69, 0, 0.9)', 'rgba(128, 0, 0, 0.8)', 'rgba(50, 50, 50, 0.6)'];
                    isVolcanic = true;
                } else {
                    colors = ['rgba(50, 50, 60, 0.85)', 'rgba(30, 30, 30, 0.8)', 'rgba(255, 69, 0, 0.7)'];
                    isShadow = true;
                }
            }

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 2.8 + 0.6;
                const color = colors[Math.floor(Math.random() * colors.length)];

                let size = Math.random() * 6 + 3;
                let decay = 0.96;
                let gravity = -0.02;
                let type = 'circle';

                if (isGolden || isIce) {
                    type = 'spark';
                    size = Math.random() * 8 + 4;
                    decay = 0.95;
                } else if (isVolcanic) {
                    type = Math.random() > 0.4 ? 'circle' : 'rect';
                    size = Math.random() * 7 + 3;
                }

                this.particles.push({
                    x: enemy.x + enemy.width / 2 + (Math.random() - 0.5) * enemy.width * 0.7,
                    y: enemy.y + enemy.height / 2 + (Math.random() - 0.5) * enemy.height * 0.7,
                    vx: Math.cos(angle) * speed + (this.speed * -0.2),
                    vy: Math.sin(angle) * speed - 0.5,
                    size: size,
                    alpha: 1.0,
                    color: color,
                    type: type,
                    decay: decay,
                    gravity: gravity,
                    angle: angle,
                    va: (Math.random() - 0.5) * 0.15,
                    fadeSpeedMultiplier: enemy.isBoss ? 0.6 : 1.0
                });
            }
        }

        /**
         * Spawns animated coin objects that arc from (fromX, fromY) to the HUD coin panel.
         * count controls how many coin tokens fly (capped at 8 for perf).
         */
        spawnCoinPickup(fromX, fromY, count) {
            // Ground level where coins land (canvas ground)
            const groundY = this.height - this.groundMargin - 10;
            // HUD coin panel centre: hx=16, hh+hy = 86, cy = 94 => target ~(86, 110)
            const hudX = 86;
            const hudY = 110;
            const numTokens = Math.min(count, 8);
            for (let i = 0; i < numTokens; i++) {
                // Initial scatter so coins don't all overlap
                const sx = fromX + (Math.random() - 0.5) * 60;
                const sy = fromY;
                // Random horizontal drift while falling
                const vx = (Math.random() - 0.5) * 3.5;
                const vy = -(Math.random() * 3 + 1); // small upward pop first
                const value = Math.floor(count / numTokens) + (i < (count % numTokens) ? 1 : 0);

                this.coinPickups.push({
                    // position
                    x: sx, y: sy,
                    // physics (phase 1: fall)
                    vx, vy,
                    gravity: 0.55,
                    bounced: false,
                    groundY,
                    // phase 3 bezier
                    sx: 0, sy: 0,   // filled on pickup
                    cpx: 0, cpy: 0,
                    hudX, hudY,
                    // state
                    phase: 1,   // 1 = falling, 2 = waiting on ground, 3 = flying to hud
                    value,
                    flyDelay: 120 + i * 80, // ms to wait after pickup before flying
                    flyDelayTimer: 0,
                    t: 0,
                    flySpeed: 0.026 + Math.random() * 0.01,
                    // visuals
                    size: 7 + Math.random() * 4,
                    alpha: 1,
                    done: false,
                });
            }
        }

        /**
         * Draws animated coin pickups in pure screen-space (outside shake transform).
         */
        drawCoinPickups(context) {
            if (!this.coinPickups || this.coinPickups.length === 0) return;
            this.coinPickups.forEach(c => {
                if (c.done) return;
                context.save();
                context.globalAlpha = Math.max(0, Math.min(1, c.alpha));

                // Outer glow
                context.shadowColor = '#ffd700';
                context.shadowBlur = 10;

                // Coin body gradient
                const grad = context.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size);
                grad.addColorStop(0, '#fff7a0');
                grad.addColorStop(0.4, '#ffd700');
                grad.addColorStop(1, '#b8860b');
                context.beginPath();
                context.arc(c.x, c.y, c.size, 0, Math.PI * 2);
                context.fillStyle = grad;
                context.fill();

                // Inner shine
                context.shadowBlur = 0;
                context.beginPath();
                context.arc(c.x - c.size * 0.25, c.y - c.size * 0.3, c.size * 0.35, 0, Math.PI * 2);
                context.fillStyle = 'rgba(255,255,255,0.55)';
                context.fill();

                context.restore();
            });
        }

        update(deltaTime) {
            if (this.paused) return;
            if (this.storyDialogueManager && this.storyDialogueManager.active) {
                this.storyDialogueManager.update(deltaTime);
                return;
            }
            if (!this.gameStarted && !this.startTransition) return;

            if (this.startTransition) {

                this.startTransitionTimer += deltaTime;

                if (
                    this.startTransitionTimer >=
                    this.startTransitionDuration
                ) {

                    this.startTransition = false;
                    this.gameStarted = true;
                    this.levelSelectMode = false; // reset after transition completes
                    if (this.storyDialogueManager) {
                        this.storyDialogueManager.startLevelIntro(this.level);
                    }
                } else {
                    // Don't update game objects during the transition fade
                    return;
                }
            }

            this.floatingTexts.forEach(t => { t.y += t.vy; t.life -= deltaTime * 0.001; });
            this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);

            this.damageTexts.forEach(t => {
                t.life -= deltaTime;
                t.x += t.vx;
                t.y += t.vy;
                t.vy += t.gravity * (deltaTime / 16.6); // Scale physics to frame rate

                // Interpolate scale down to 1.0 from 1.8 over the first 150ms of life
                const elapsed = t.maxLife - t.life;
                if (elapsed < 150) {
                    t.scale = 1.8 - (elapsed / 150) * 0.8;
                } else {
                    t.scale = 1.0;
                }
            });
            this.damageTexts = this.damageTexts.filter(t => t.life > 0);

            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.gravity !== undefined) p.vy += p.gravity * (deltaTime / 16.6);
                p.alpha -= deltaTime * 0.002 * (p.fadeSpeedMultiplier || 1.0);
                p.size *= (p.decay !== undefined ? p.decay : 0.95);
                if (p.angle !== undefined) p.angle += (p.va || 0) * (deltaTime / 16.6);
            });
            this.particles = this.particles.filter(p => p.alpha > 0 && p.size > 0.1);

            // Update coin pickup animations
            if (this.coinHUDFlash > 0) this.coinHUDFlash -= deltaTime;
            const scrollSpeed = (this.background && typeof this.background._scrollSpeed === 'function') ? this.background._scrollSpeed() : 0;

            this.coinPickups.forEach(c => {
                if (c.done) return;

                if (c.phase === 1) {
                    // Phase 1: fall with gravity
                    const dt = deltaTime / 16.6;
                    c.vy += c.gravity * dt;
                    c.x += c.vx * dt - scrollSpeed;
                    c.y += c.vy * dt;

                    // Check ground landing
                    if (c.y >= c.groundY) {
                        c.y = c.groundY;
                        if (!c.bounced) {
                            c.bounced = true;
                            c.vy = -Math.abs(c.vy) * 0.45; // bounce
                            c.vx *= 0.6;
                        } else {
                            // Second bounce: settle and wait for collection
                            c.vy = 0;
                            c.vx = 0;
                            c.phase = 2;
                        }
                    }
                } else if (c.phase === 2) {
                    // Phase 2: wait on ground (scrolls with background)
                    c.x -= scrollSpeed;
                }

                // Proximity pickup detection for Phase 1 & Phase 2
                if (c.phase === 1 || c.phase === 2) {
                    const playerLeft = this.player.x;
                    const playerRight = this.player.x + this.player.width;
                    const playerTop = this.player.y;
                    const playerBottom = this.player.y + this.player.height;

                    // Box collision with 45px buffer
                    const inRange = c.x >= playerLeft - 45 && c.x <= playerRight + 45 &&
                        c.y >= playerTop - 45 && c.y <= playerBottom + 45;

                    if (inRange) {
                        c.phase = 3;
                        c.sx = c.x;
                        c.sy = c.y;
                        c.cpx = c.x * 0.5 + c.hudX * 0.5 + (Math.random() - 0.5) * 120;
                        c.cpy = Math.min(c.y, c.hudY) - 120 - Math.random() * 80;
                    }
                } else if (c.phase === 3) {
                    // Phase 3: wait then fly to HUD via bezier
                    c.flyDelayTimer += deltaTime;
                    if (c.flyDelayTimer < c.flyDelay) return;

                    c.t = Math.min(1, c.t + c.flySpeed * (deltaTime / 16.6));
                    const mt = 1 - c.t;
                    c.x = mt * mt * c.sx + 2 * mt * c.t * c.cpx + c.t * c.t * c.hudX;
                    c.y = mt * mt * c.sy + 2 * mt * c.t * c.cpy + c.t * c.t * c.hudY;
                    // Fade out in last 20%
                    if (c.t > 0.8) c.alpha = 1 - (c.t - 0.8) / 0.2;
                    if (c.t >= 1) {
                        c.done = true;
                        this.coins += c.value;
                        localStorage.setItem('gameCoins', this.coins.toString());
                        this.coinHUDFlash = Math.max(this.coinHUDFlash, 350);
                    }
                }
            });
            this.coinPickups = this.coinPickups.filter(c => !c.done && c.x > -100);

            if (this.levelComplete || this.gameOver) {
                if (this.gameOver) {
                    this.audio.stopBGM();
                }
                if (this.gameOverTimer < this.gameOverDelay) this.gameOverTimer += deltaTime;
                this.shake = 0;
                this.speed = 0; // Stop background scrolling on game over / level complete
                this.background.update();
                // keep updating player so death animation finishes rendering
                if (this.player.isDead) this.player.update(this.input.keys, deltaTime);
                return;
            }

            this.playerHit = false;
            this.background.update();
            this.player.update(this.input.keys, deltaTime);

            if (this.hitCooldown > 0) this.hitCooldown -= deltaTime;

            if (this.shake > 0) {
                this.shake = Math.max(0, this.shake - deltaTime * 0.4);
            }

            if (this.combo > 0) {
                this.comboTimer += deltaTime;
                if (this.comboTimer > this.comboMax) { this.combo = 0; this.multiplier = 1; }
            }

            if (this.waveAnnounce) {
                this.waveAnnTimer += deltaTime;
                if (this.waveAnnTimer > this.waveAnnDur) this.waveAnnounce = null;
            }

            if (!this.player.isDead) {
                const wave = this.currentWave;
                if (wave && this.waveSpawnedCount < this._waveTotal()) {
                    this.enemyTimer += deltaTime;
                    if (this.enemyTimer > this.enemyInterval) { this._spawnFromWave(); this.enemyTimer = 0; }
                }

                const allSpawned = this.waveSpawnedCount >= this._waveTotal();
                // Boss is considered defeated as soon as HP hits 0 (don't wait for full death fade)
                const allDead = this.enemies.every(e => e.markedForDeletion || (e.isBoss && e.currentHP <= 0));
                if (allSpawned && allDead && wave && !this.waveComplete) {
                    this.waveComplete = true;
                    this.waveTransTimer = 0;
                    this.currentHP = Math.min(this.maxHP, this.currentHP + 8);
                }

                if (this.waveComplete) {
                    this.waveTransTimer += deltaTime;
                    // Use short 400ms delay after boss wave; longer 1800ms between mid-waves
                    const transDelay = (this.waveIndex === this.waveDef.length - 1) ? 400 : this.waveTransDelay;
                    if (this.waveTransTimer > transDelay) {
                        if (this.waveIndex < this.waveDef.length - 1) {
                            this._advanceWave();
                        } else {
                            if (this.storyDialogueManager && !this.postBossDialoguePlayed) {
                                this.storyDialogueManager.startPostBossDialogue(this.level, () => {
                                    this.postBossDialoguePlayed = true;
                                });
                            } else if (!this.portal && !this.portalSpawned && !this.levelComplete) {
                                this.portalSpawned = true;
                                this.portal = new Portal(this, 1200, this.height - this.groundMargin);
                            }
                        }
                    }
                }

                this.enemies.forEach(enemy => {
                    enemy.update(deltaTime);
                    if (!enemy.markedForDeletion) {
                        if (!enemy.hasEnteredScreen) return;

                        let attackRange = 65;
                        if (this.player.characterType === 'jotem') attackRange = 35;
                        else if (this.player.characterType === 'archdemon') attackRange = 100;
                        else if (this.player.characterType === 'shaia') attackRange = 80;

                        const centerX = this.player.x + this.player.width / 2;
                        let minX, maxX;
                        if (this.player.facingLeft) {
                            minX = centerX - (this.player.width * 0.4) - attackRange;
                            maxX = centerX;
                        } else {
                            minX = centerX;
                            maxX = centerX + (this.player.width * 0.4) + attackRange;
                        }

                        const attackHit =
                            enemy.x < maxX && enemy.x + enemy.width > minX &&
                            enemy.y < this.player.y + this.player.height && enemy.y + enemy.height > this.player.y;

                        // Melee hits halfway through the animation
                        const hitFrame = Math.max(1, Math.floor(this.player.maxFrame / 2));
                        if (attackHit && this.player.currentState.state === 'ATTACK' && this.player.frameX >= hitFrame) {
                            if (!enemy._hitByPlayerThisSwing) {
                                enemy._hitByPlayerThisSwing = true;
                                const dmg = this.player.characterType === 'archdemon' || this.player.characterType === 'jotem' ? 18 : 12;
                                if (typeof enemy.takeDamage === 'function') enemy.takeDamage(dmg);
                                else enemy.currentHP -= dmg;

                                this.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'gold');
                                this.shake = Math.max(this.shake, 8);

                                setTimeout(() => { enemy._hitByPlayerThisSwing = false; }, 300);
                            }
                        }
                    }
                });

                this.enemies.forEach(e => {
                    if (e.markedForDeletion && !e._scored) {
                        e._scored = true;
                        this.combo++;
                        this.comboTimer = 0;
                        this.multiplier = Math.min(5, 1 + Math.floor(this.combo / 3));
                        const pts = 10 * this.multiplier * (e.isBoss ? 10 : 1);
                        this.score += pts;

                        const coinsEarned = Math.max(1, Math.floor(pts / 10));
                        this._addFloatingText(e.x + e.width / 2, e.y - 10, '+' + pts, this.multiplier > 1 ? '#ffd700' : '#ffffff');
                        // Spawn animated coin pickups that drop on the ground for player collection
                        this.spawnCoinPickup(e.x + e.width / 2, e.y + e.height * 0.4, coinsEarned);
                    }
                });

                this.enemies = this.enemies.filter(e => !e.markedForDeletion && e.x + e.width > -400);

                if (this.portal) {
                    this.portal.update(deltaTime);
                    if (this.portal.markedForDeletion) {
                        this.portal = null;
                    }
                }
            }
        }

        draw(context) {
            // --- Start / Transition screens ---
            if (!this.gameStarted) {
                this.background.draw(context);

                if (this.startTransition) {
                    const progress = Math.min(1, this.startTransitionTimer / this.startTransitionDuration);

                    if (this.levelSelectMode) {
                        // Launching from level select: clean background fade-to-black (no start screen)
                        context.save();
                        context.globalAlpha = progress;
                        context.fillStyle = 'black';
                        context.fillRect(0, 0, this.width, this.height);
                        context.restore();
                    } else {
                        // Launching from canvas START GAME button: start screen fades out
                        context.save();
                        context.globalAlpha = Math.max(0, 1 - progress);
                        context.translate(0, progress * -40);
                        this._drawStartScreen(context);
                        context.restore();

                        context.save();
                        context.globalAlpha = progress;
                        context.fillStyle = 'black';
                        context.fillRect(0, 0, this.width, this.height);
                        context.restore();
                    }
                } else {
                    this._drawStartScreen(context);
                }
                return;
            }

            // If transition is active while game is running (e.g. level change),
            // draw the game background first then fade to black on top for a cinematic look
            if (this.startTransition) {
                const progress = Math.min(1, this.startTransitionTimer / this.startTransitionDuration);
                // Draw background so it's visible under the fade
                this.background.draw(context);
                // Then draw black overlay that fades IN (0 → 1)
                context.save();
                context.globalAlpha = progress;
                context.fillStyle = 'black';
                context.fillRect(0, 0, this.width, this.height);
                context.restore();
                return;
            }

            context.save();
            if (this.shake > 0 && !this.gameOver && !this.levelComplete) {
                const dx = (Math.random() - 0.5) * (this.shake * 0.05);
                const dy = (Math.random() - 0.5) * (this.shake * 0.05);
                context.translate(dx, dy);
            }

            this.background.draw(context);
            if (this.portal) this.portal.draw(context);
            this.player.draw(context);
            this.enemies.forEach(e => e.draw(context));

            this.particles.forEach(p => {
                context.save();
                context.globalAlpha = Math.max(0, Math.min(1, p.alpha));
                context.beginPath();
                if (p.type === 'rect') {
                    context.translate(p.x, p.y);
                    context.rotate(p.angle || 0);
                    context.fillStyle = p.color;
                    context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else if (p.type === 'spark') {
                    context.translate(p.x, p.y);
                    context.rotate(p.angle || 0);
                    context.strokeStyle = p.color;
                    context.lineWidth = p.lineWidth || 2;
                    context.beginPath();
                    context.moveTo(-p.size, 0);
                    context.lineTo(p.size, 0);
                    context.moveTo(0, -p.size * 0.45);
                    context.lineTo(0, p.size * 0.45);
                    context.stroke();
                } else {
                    context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    context.fillStyle = p.color;
                    context.fill();
                }
                context.restore();
            });

            this.floatingTexts.forEach(t => {
                context.save();
                context.globalAlpha = Math.max(0, t.life);
                context.font = 'bold 22px "Poppins"';
                context.fillStyle = t.color;
                context.textAlign = 'center';
                context.shadowColor = 'rgba(0,0,0,0.8)';
                context.shadowBlur = 6;
                context.fillText(t.text, t.x, t.y);
                context.restore();
            });

            this.damageTexts.forEach(t => {
                context.save();

                // Fade out in the last 250ms of life
                let alpha = 1.0;
                if (t.life < 250) {
                    alpha = t.life / 250;
                }
                context.globalAlpha = Math.max(0, Math.min(1, alpha));

                // Translate, rotate and scale for dynamic pop-up effect
                context.translate(t.x, t.y);
                context.rotate(t.angle);
                context.scale(t.scale, t.scale);

                // Text alignment
                context.textAlign = 'center';
                context.textBaseline = 'middle';

                // Stylized font
                const fontSize = t.isCrit ? 34 : 26;
                context.font = `900 ${fontSize}px "Orbitron", "Impact", sans-serif`;

                // Thick black border/outline (important to pop out against chaotic backgrounds)
                context.lineJoin = 'round';
                context.strokeStyle = '#000000';
                context.lineWidth = t.isCrit ? 8 : 6;
                context.strokeText(t.text, 0, 0);

                // Vertical gradient for body fill
                const grad = context.createLinearGradient(0, -fontSize / 2, 0, fontSize / 2);
                if (t.isCrit) {
                    // Premium Rainbow/Critical color (Yellow top, magenta/purple bottom)
                    grad.addColorStop(0, '#ffff55');
                    grad.addColorStop(0.4, '#ff33aa');
                    grad.addColorStop(1, '#8800ff');
                } else {
                    // Regular hit: Orange/Red gradient (White top, yellow middle, orange/red bottom)
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(0.3, '#ffea00');
                    grad.addColorStop(1, '#ff3d00');
                }
                context.fillStyle = grad;
                context.fillText(t.text, 0, 0);

                // If there's badge text like "DOUBLE" or "CRIT", draw it above the number
                if (t.badgeText) {
                    context.save();
                    context.translate(0, -fontSize * 0.95);
                    // Add slight bounce/wiggle using sinus based on lifetime
                    const wiggle = Math.sin(t.life * 0.035) * 2;
                    context.translate(0, wiggle);

                    context.font = '900 13px "Orbitron", "Poppins", sans-serif';
                    context.strokeStyle = '#000000';
                    context.lineWidth = 4;
                    context.strokeText(t.badgeText, 0, 0);

                    // Create a badge gradient (e.g. bright yellow to orange/red)
                    const badgeGrad = context.createLinearGradient(0, -6, 0, 6);
                    if (t.badgeText === 'DOUBLE') {
                        badgeGrad.addColorStop(0, '#ff9100');
                        badgeGrad.addColorStop(1, '#ff3d00');
                    } else if (t.badgeText === 'CRIT') {
                        badgeGrad.addColorStop(0, '#ffea00');
                        badgeGrad.addColorStop(1, '#ff9100');
                    } else {
                        badgeGrad.addColorStop(0, '#00e5ff');
                        badgeGrad.addColorStop(1, '#d500f9');
                    }
                    context.fillStyle = badgeGrad;
                    context.fillText(t.badgeText, 0, 0);

                    // Draw a tiny red pointer arrow below the badge just like the screenshot!
                    context.fillStyle = '#ff0000';
                    context.beginPath();
                    context.moveTo(-5, 6);
                    context.lineTo(5, 6);
                    context.lineTo(0, 11);
                    context.closePath();
                    context.fill();

                    context.restore();
                }

                context.restore();
            });

            if (this.playerHit) {
                context.save();
                context.globalAlpha = 0.28;
                context.fillStyle = 'red';
                context.fillRect(0, 0, this.width, this.height);
                context.restore();
            }

            this.drawHUD(context);

            if (this.waveAnnounce) {
                const alpha = this.waveAnnTimer < 400 ? this.waveAnnTimer / 400 : this.waveAnnTimer > 2000 ? 1 - (this.waveAnnTimer - 2000) / 500 : 1;
                context.save();
                context.globalAlpha = Math.max(0, alpha);
                const bw = 420, bh = 44, bx = this.width / 2 - bw / 2, by = 175;
                context.fillStyle = 'rgba(120,0,0,0.2)';
                rr(context, bx, by, bw, bh, 6); context.fill();
                context.strokeStyle = 'rgba(255,60,60,0.45)';
                context.lineWidth = 1;
                rr(context, bx, by, bw, bh, 6); context.stroke();
                context.fillStyle = '#cc2200';
                rr(context, bx, by + 10, 3, bh - 20, 2); context.fill();
                rr(context, bx + bw - 3, by + 10, 3, bh - 20, 2); context.fill();
                context.font = '700 15px "Poppins"';
                context.fillStyle = '#ff6655';
                context.textAlign = 'center';
                context.fillText(this.waveAnnounce, this.width / 2, by + 27);
                context.restore();
            }

            if (this.waveComplete && this.waveTransTimer < 1000 && this.waveIndex < this.waveDef.length - 1) {
                context.save();
                const alpha = this.waveTransTimer < 400 ? this.waveTransTimer / 400 : 1 - (this.waveTransTimer - 600) / 400;
                context.globalAlpha = Math.max(0, alpha);
                const bw = 380, bh = 40, bx = this.width / 2 - bw / 2, by = this.height - 100;
                context.fillStyle = 'rgba(0,120,50,0.2)';
                rr(context, bx, by, bw, bh, 6); context.fill();
                context.strokeStyle = 'rgba(0,200,90,0.45)';
                context.lineWidth = 1;
                rr(context, bx, by, bw, bh, 6); context.stroke();
                context.font = '700 13px "Poppins"';
                context.fillStyle = '#00e676';
                context.textAlign = 'center';
                context.fillText('WAVE CLEARED   +8 HP', this.width / 2, by + 25);
                context.restore();
            }

            if (this.levelComplete) { this._drawLevelComplete(context); context.restore(); return; }
            if (this.gameOver && this.gameOverTimer >= this.gameOverDelay) { this._drawGameOver(context); context.restore(); return; }

            context.restore();
            // Draw coin pickups in pure screen-space (outside shake transform)
            this.drawCoinPickups(context);
        }

        _drawStartScreen(context) {
            const W = this.width, H = this.height;
            context.save();

            context.fillStyle = 'rgba(10, 8, 20, 0.72)';
            context.fillRect(0, 0, W, H);

            const vignette = context.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
            vignette.addColorStop(0, 'rgba(0,0,0,0)');
            vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
            context.fillStyle = vignette;
            context.fillRect(0, 0, W, H);


            context.font = '700 80px "Poppins"';
            context.textAlign = 'center';
            context.fillStyle = 'rgba(0,0,0,0.6)';
            context.fillText('SHADOW STRIKE', W / 2 + 4, H / 2 - 154 + 4);

            context.fillStyle = '#f0f0f0';
            context.fillText('SHADOW STRIKE', W / 2, H / 2 - 154);

            context.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(W / 2 - 340, H / 2 - 136);
            context.lineTo(W / 2 + 340, H / 2 - 136);
            context.stroke();

            context.font = '700 16px "Poppins"';
            context.fillStyle = 'rgba(240, 239, 240, 0.7)';
            context.fillText('a pixel survival game', W / 2, H / 2 - 110);

            context.font = '700 12px "Poppins"';
            context.fillStyle = 'rgba(255, 255, 255, 0.75)';
            context.fillText('Day 0 — The Siege Begins', W / 2, H / 2 - 78);

            const btnW = 220, btnH = 50, btnX = W / 2 - btnW / 2, btnY = H / 2 - 52;

            context.fillStyle = 'rgba(230, 227, 227, 0.04)';
            rr(context, btnX + 3, btnY + 3, btnW, btnH, 8); context.fill();

            context.fillStyle = '#21202012';
            rr(context, btnX, btnY, btnW, btnH, 8); context.fill();

            context.fillStyle = 'rgba(0, 0, 0, 0.01)';
            context.beginPath();
            context.roundRect(btnX, btnY, btnW, btnH / 2, [8, 8, 0, 0]);
            context.fill();

            context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            context.lineWidth = 1.5;
            rr(context, btnX, btnY, btnW, btnH, 8); context.stroke();

            context.fillStyle = '#ffffff';
            context.beginPath();
            context.moveTo(btnX + 36, btnY + btnH / 2 - 9);
            context.lineTo(btnX + 36, btnY + btnH / 2 + 9);
            context.lineTo(btnX + 54, btnY + btnH / 2);
            context.closePath();
            context.fill();

            context.font = '700 18px "Poppins"';
            context.fillStyle = '#f8f8f8ba';
            context.textAlign = 'center';
            context.fillText('START GAME', btnX + btnW / 2 + 10, btnY + btnH / 2 + 7);

            const blinkAlpha = 0.45 + 0.35 * Math.sin(Date.now() * 0.003);
            context.font = '12px "Poppins"';
            context.fillStyle = `rgba(180,170,200,${blinkAlpha})`;
            context.textAlign = 'center';
            context.fillText('click to start', W / 2, H / 2 + 22);

            const ctrlY = H / 2 + 60;
            context.fillStyle = 'rgba(255, 255, 255, 0)';
            rr(context, W / 2 - 300, ctrlY, 600, 100, 8); context.fill();
            context.strokeStyle = 'rgba(255,255,255,0.06)';
            context.lineWidth = 1;
            rr(context, W / 2 - 300, ctrlY, 600, 100, 8); context.stroke();

            context.font = '11px "Poppins"';
            context.fillStyle = 'rgb(255, 255, 255)';
            context.fillText('A / D  ←/→  Move       SPACE  Jump (double jump)', W / 2, ctrlY + 22);
            context.fillText('SHIFT + dir  Dash       CLICK  Melee Attack', W / 2, ctrlY + 42);
            context.fillText('Hold Q  Wind Blast      E  Energy Shield      R  Slash Projectile', W / 2, ctrlY + 62);
            context.fillText('3 waves per level — defeat all to advance', W / 2, ctrlY + 82);

            context.restore();
        }

        _drawLevelComplete(context) {
            const W = this.width, H = this.height;
            context.save();

            const themes = {
                1: { accent: '#00ffb3', accentDim: 'rgba(0,255,179,0.15)', glow: '#00cc88', dark: 'rgba(0,18,10,0.94)', next: 'SPIDER FOREST', label: 'ENTER LEVEL 2' },
                2: { accent: '#ff8c00', accentDim: 'rgba(255,140,0,0.15)', glow: '#ff5500', dark: 'rgba(20,6,0,0.95)', next: 'HALLOWEEN HOUSE', label: 'ENTER LEVEL 3' },
                3: { accent: '#cc55ff', accentDim: 'rgba(180,60,255,0.15)', glow: '#9922cc', dark: 'rgba(12,0,20,0.96)', next: 'HAUNTED GRAVEYARD', label: 'ENTER LEVEL 4' },
                4: { accent: '#ff2244', accentDim: 'rgba(255,34,68,0.15)', glow: '#cc0022', dark: 'rgba(20,0,4,0.97)', next: 'MUSHROOM GROVE', label: 'ENTER LEVEL 5' },
                5: { accent: '#00ffd2', accentDim: 'rgba(0,255,210,0.15)', glow: '#00b395', dark: 'rgba(0,18,15,0.98)', next: 'CRYSTAL CAVERNS', label: 'ENTER LEVEL 6' },
                6: { accent: '#00ffff', accentDim: 'rgba(0,255,255,0.15)', glow: '#00cccc', dark: 'rgba(0,10,20,0.95)', next: 'SKY TEMPLE', label: 'ENTER LEVEL 7' },
                7: { accent: '#ffcc00', accentDim: 'rgba(255,204,0,0.15)', glow: '#cc9900', dark: 'rgba(20,15,0,0.95)', next: 'FROZEN ABYSS', label: 'ENTER LEVEL 8' },
                8: { accent: '#cc88ff', accentDim: 'rgba(204,136,255,0.15)', glow: '#9933ff', dark: 'rgba(10,0,20,0.95)', next: 'VOID KINGDOM', label: 'ENTER LEVEL 9' },
                9: { accent: '#ff0033', accentDim: 'rgba(255,0,51,0.15)', glow: '#cc0022', dark: 'rgba(20,0,0,0.95)', next: 'EDGE OF REALITY', label: 'ENTER LEVEL 10' },
                10: { accent: '#ff0000', accentDim: 'rgba(255,0,0,0.15)', glow: '#cc0000', dark: 'rgba(10,0,0,0.98)', next: '', label: 'WATCH CREDITS' },
            };
            const th = themes[this.level] || themes[10];

            context.fillStyle = th.dark;
            context.fillRect(0, 0, W, H);

            const centerGlow = context.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 500);
            centerGlow.addColorStop(0, th.accentDim);
            centerGlow.addColorStop(1, 'transparent');
            context.fillStyle = centerGlow;
            context.fillRect(0, 0, W, H);

            const now = Date.now();
            for (let i = 0; i < 100; i++) {
                const t2 = (now * 0.018 + i * 63.7) % H;
                const x2 = (i * 157 + Math.sin(now * 0.001 + i) * 30 + W) % W;
                const a = 0.08 + 0.1 * Math.sin(now * 0.003 + i * 2.1);
                context.fillStyle = th.accent.replace(')', `,${a})`).replace('#', 'rgba(').replace('rgba(', 'rgba(') || `rgba(255,255,255,${a})`;

                context.globalAlpha = Math.max(0, a);
                context.beginPath();
                context.arc(x2, t2, 1.5 + Math.sin(i) * 1, 0, Math.PI * 2);
                context.fillStyle = th.accent;
                context.fill();
            }
            context.globalAlpha = 1;

            context.font = '700 15px "Poppins"';
            context.textAlign = 'center';
            context.fillStyle = th.accent;
            context.shadowColor = th.glow;
            context.shadowBlur = 4;
            context.fillText(`— LEVEL ${this.level} CLEARED —`, W / 2, H / 2 - 130);
            context.shadowBlur = 0;

            const titles = { 1: 'SHADOW CITY', 2: 'SPIDER FOREST', 3: 'HALLOWEEN HOUSE', 4: 'HAUNTED GRAVEYARD', 5: 'MUSHROOM GROVE', 6: 'CRYSTAL CAVERNS', 7: 'SKY TEMPLE', 8: 'FROZEN ABYSS', 9: 'VOID KINGDOM', 10: 'EDGE OF REALITY' };
            const subTitles = { 1: 'UNLOCKED', 2: 'UNLOCKED', 3: 'UNLOCKED', 4: 'UNLOCKED', 5: 'UNLOCKED', 6: 'UNLOCKED', 7: 'UNLOCKED', 8: 'UNLOCKED', 9: 'UNLOCKED', 10: 'YOU SAVED REALITY!' };

            context.font = '800 58px "Poppins"';
            context.fillStyle = th.accent;
            context.shadowColor = th.glow;
            context.shadowBlur = 8;
            context.fillText(titles[this.level], W / 2, H / 2 - 70);
            context.shadowBlur = 0;

            context.font = '700 24px "Poppins"';
            context.fillStyle = 'rgba(255,255,255,0.55)';
            context.fillText(subTitles[this.level], W / 2, H / 2 - 25);

            const statY = H / 2 + 50;

            context.font = '700 13px "Poppins"';
            context.fillStyle = 'rgba(255,255,255,0.4)';
            context.textAlign = 'center';
            context.fillText('FINAL SCORE', W / 2 - 220, statY);

            context.font = '800 38px "Poppins"';
            context.fillStyle = '#ffffff';
            context.fillText(this.score.toLocaleString(), W / 2 - 220, statY + 45);

            context.font = '700 13px "Poppins"';
            context.fillStyle = 'rgba(255,255,255,0.4)';
            context.textAlign = 'center';
            context.fillText('TOTAL COINS', W / 2, statY);

            context.font = '800 38px "Poppins"';
            context.fillStyle = '#ffd700';
            context.fillText('🪙 ' + this.coins.toLocaleString(), W / 2, statY + 45);

            context.font = '700 13px "Poppins"';
            context.fillStyle = 'rgba(255,255,255,0.4)';
            context.textAlign = 'center';
            context.fillText('HP LEFT', W / 2 + 220, statY);

            const hpColor = this.currentHP > 60 ? '#00ffd0' : this.currentHP > 30 ? '#ffaa00' : '#ff2200';
            context.font = '800 38px "Poppins"';
            context.fillStyle = hpColor;
            context.fillText(`${this.currentHP}/${this.maxHP}`, W / 2 + 220, statY + 45);

            if (this.level < 10) {
                context.font = '700 14px "Poppins"';
                context.fillStyle = 'rgba(255,255,255,0.5)';
                context.textAlign = 'center';
                context.fillText(`NEXT AREA  ›  ${th.next}`, W / 2, H / 2 + 155);
            }

            const btnW = 280;
            const btnH = 54;
            const btnX = W / 2 - btnW / 2;
            const btnY = H / 2 + 190;
            const pulse = 0.94 + Math.sin(now * 0.006) * 0.06;

            context.save();
            context.translate(W / 2, btnY + btnH / 2);
            context.scale(pulse, pulse);
            context.translate(-W / 2, -(btnY + btnH / 2));

            context.shadowColor = th.glow;
            context.shadowBlur = 10;
            const btnGrad = context.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
            btnGrad.addColorStop(0, th.accent);
            btnGrad.addColorStop(1, th.glow);
            context.fillStyle = btnGrad;
            rr(context, btnX, btnY, btnW, btnH, 12); context.fill();

            context.shadowBlur = 0;

            context.fillStyle = 'rgba(255,255,255,0.18)';
            context.beginPath();
            context.roundRect(btnX + 3, btnY + 3, btnW - 6, btnH / 2 - 3, [10, 10, 0, 0]);
            context.fill();

            context.strokeStyle = 'rgba(255,255,255,0.22)';
            context.lineWidth = 1.5;
            rr(context, btnX, btnY, btnW, btnH, 12); context.stroke();

            context.font = '800 18px "Poppins"';
            context.fillStyle = '#ffffff';
            context.textAlign = 'center';
            context.fillText(th.label, W / 2, btnY + 33);
            context.restore();

            context.font = '11px "Poppins"';
            context.fillStyle = 'rgba(255,255,255,0.25)';
            context.textAlign = 'center';
            context.fillText('Click button to continue', W / 2, H - 24);

            context.restore();
        }

        _drawGameOver(context) {
            const W = this.width, H = this.height;
            context.save();

            context.fillStyle = 'rgba(10, 8, 20, 0.76)';
            context.fillRect(0, 0, W, H);

            const vignette = context.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
            vignette.addColorStop(0, 'rgba(0,0,0,0)');
            vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
            context.fillStyle = vignette;
            context.fillRect(0, 0, W, H);


            context.font = '700 80px "Poppins"';
            context.textAlign = 'center';
            context.fillStyle = 'rgba(0,0,0,0.6)';
            context.fillText('GAME OVER', W / 2 + 4, H / 2 - 154 + 4);

            context.fillStyle = '#f0f0f0';
            context.fillText('GAME OVER', W / 2, H / 2 - 154);

            context.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(W / 2 - 250, H / 2 - 136);
            context.lineTo(W / 2 + 250, H / 2 - 136);
            context.stroke();

            context.font = '700 16px "Poppins"';
            context.fillStyle = 'rgba(240, 239, 240, 0.7)';
            context.fillText(`Defeated at Level ${this.level}`, W / 2, H / 2 - 110);

            const panW = 400, panH = 80, panX = W / 2 - panW / 2, panY = H / 2 - 80;
            context.fillStyle = 'rgba(255, 255, 255, 0.02)';
            rr(context, panX, panY, panW, panH, 10); context.fill();
            context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            context.lineWidth = 1;
            rr(context, panX, panY, panW, panH, 10); context.stroke();

            context.font = '700 11px "Poppins"';
            context.fillStyle = 'rgba(255, 255, 255, 0.4)';
            context.fillText('FINAL SCORE', W / 2, panY + 24);

            context.font = '800 36px "Poppins"';
            context.fillStyle = '#ffffff';
            context.fillText(this.score.toLocaleString(), W / 2, panY + 60);

            const btnW = 240, btnH = 50, btnX = W / 2 - btnW / 2, btnY = H / 2 + 62;

            context.fillStyle = 'rgba(230, 227, 227, 0.04)';
            rr(context, btnX + 3, btnY + 3, btnW, btnH, 8); context.fill();

            context.fillStyle = '#21202012';
            rr(context, btnX, btnY, btnW, btnH, 8); context.fill();

            context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            context.lineWidth = 1.5;
            rr(context, btnX, btnY, btnW, btnH, 8); context.stroke();

            context.fillStyle = '#ffffff';
            context.beginPath();
            context.moveTo(btnX + 46, btnY + btnH / 2 - 9);
            context.lineTo(btnX + 46, btnY + btnH / 2 + 9);
            context.lineTo(btnX + 64, btnY + btnH / 2);
            context.closePath();
            context.fill();

            context.font = '700 18px "Poppins"';
            context.fillStyle = '#f8f8f8ba';
            context.textAlign = 'center';
            context.fillText('PLAY AGAIN', btnX + btnW / 2 + 10, btnY + btnH / 2 + 7);

            const blinkAlpha = 0.45 + 0.35 * Math.sin(Date.now() * 0.003);
            context.font = '12px "Poppins"';
            context.fillStyle = `rgba(180, 170, 200, ${blinkAlpha})`;
            context.textAlign = 'center';
            context.fillText('click to restart', W / 2, btnY + btnH + 30);

            context.restore();
        }

        _drawButton(context, label, x, y, w, h, bg = '#1a0050', border = '#7744ff') {
            context.fillStyle = bg;
            rr(context, x, y, w, h, 10); context.fill();
            context.fillStyle = 'rgba(255,255,255,0.07)';
            context.beginPath();
            context.roundRect(x, y, w, h / 2, [10, 10, 0, 0]);
            context.fill();
            context.strokeStyle = border;
            context.lineWidth = 1;
            rr(context, x, y, w, h, 10); context.stroke();
            context.font = '700 16px "Poppins"';
            context.fillStyle = '#ffffff';
            context.textAlign = 'center';
            context.shadowBlur = 0;
            context.fillText(label, x + w / 2, y + h / 2 + 6);
        }

        drawHUD(context) {
            const W = this.width, H = this.height;
            context.save();

            const lvlAccent = this.level === 1 ? '#00e5ff'
                : this.level === 2 ? '#ff8c00'
                    : '#cc44ff';
            const lvlAccentDim = this.level === 1 ? 'rgba(0,229,255,0.18)'
                : this.level === 2 ? 'rgba(255,140,0,0.18)'
                    : 'rgba(204,68,255,0.18)';

            const hx = 16, hy = 12, hw = 300, hh = 74;
            const hpRatio = this.currentHP / this.maxHP;

            const hpColor = hpRatio > 0.6 ? '#00ffd0' : hpRatio > 0.3 ? '#ffaa00' : '#ff2200';
            const hpDark = hpRatio > 0.6 ? '#007760' : hpRatio > 0.3 ? '#884400' : '#770000';
            const hpStatus = hpRatio > 0.6 ? 'STABLE' : hpRatio > 0.3 ? 'WARNING' : 'CRITICAL';

            context.save();
            context.shadowColor = 'rgba(0,0,0,0.6)';
            context.shadowBlur = 16;

            const panelGrad = context.createLinearGradient(hx, hy, hx, hy + hh);
            panelGrad.addColorStop(0, 'rgba(18, 16, 28, 0.88)');
            panelGrad.addColorStop(1, 'rgba(8, 6, 12, 0.96)');
            context.fillStyle = panelGrad;
            rr(context, hx, hy, hw, hh, 14);
            context.fill();
            context.shadowBlur = 0;

            context.fillStyle = hpColor;
            context.beginPath();
            context.roundRect(hx + 1, hy + 4, 3, hh - 8, 2);
            context.fill();

            context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            context.lineWidth = 1;
            rr(context, hx, hy, hw, hh, 14);
            context.stroke();

            if (hpRatio < 0.25) {
                const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
                context.shadowColor = '#ff2200';
                context.shadowBlur = 10 * pulse;
                context.strokeStyle = `rgba(255, 34, 0, ${0.15 + 0.35 * pulse})`;
                context.lineWidth = 1.5;
                rr(context, hx, hy, hw, hh, 14);
                context.stroke();
                context.shadowBlur = 0;
            }


            context.save();
            context.font = '15px sans-serif';
            context.fillStyle = hpColor;
            context.shadowColor = hpColor;
            context.shadowBlur = 8;
            context.textAlign = 'left';
            context.fillText('', hx + 18, hy + 24);
            context.restore();

            context.font = '800 10px "Poppins"';
            context.fillStyle = 'rgba(255, 255, 255, 0.45)';
            context.textAlign = 'left';
            context.fillText('VITAL SIGNS', hx + 36, hy + 23);

            context.font = '800 8px "Poppins"';
            context.fillStyle = hpColor;
            context.fillText(hpStatus, hx + 114, hy + 23);

            context.font = '800 13px "Poppins"';
            context.fillStyle = '#ffffff';
            context.textAlign = 'right';
            context.shadowColor = hpColor;
            context.shadowBlur = hpRatio < 0.25 ? 8 : 0;
            context.fillText(`${this.currentHP} / ${this.maxHP}`, hx + hw - 18, hy + 24);
            context.shadowBlur = 0;

            const bx = hx + 18, by2 = hy + 38, bw = hw - 36, bh = 18;

            context.fillStyle = 'rgba(0, 0, 0, 0.45)';
            rr(context, bx, by2, bw, bh, 6);
            context.fill();
            context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            context.lineWidth = 1;
            rr(context, bx, by2, bw, bh, 6);
            context.stroke();

            if (hpRatio > 0) {
                const fillWidth = Math.max(6, bw * hpRatio);

                context.save();
                context.beginPath();
                rr(context, bx, by2, fillWidth, bh, 6);
                context.clip();

                const barGrad = context.createLinearGradient(bx, 0, bx + fillWidth, 0);
                barGrad.addColorStop(0, hpColor);
                barGrad.addColorStop(1, hpDark);
                context.fillStyle = barGrad;
                context.fillRect(bx, by2, fillWidth, bh);

                context.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                context.lineWidth = 3;
                for (let offset = -bh; offset < fillWidth + bh; offset += 12) {
                    context.beginPath();
                    context.moveTo(bx + offset, by2);
                    context.lineTo(bx + offset + 8, by2 + bh);
                    context.stroke();
                }

                const specGrad = context.createLinearGradient(0, by2, 0, by2 + bh);
                specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
                specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.06)');
                specGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0)');
                specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                context.fillStyle = specGrad;
                context.fillRect(bx, by2, fillWidth, bh);

                context.restore();

                context.save();
                context.fillStyle = '#ffffff';
                context.beginPath();
                context.roundRect(bx + fillWidth - 2.5, by2 + 1, 2, bh - 2, 1);
                context.fill();
                context.restore();
            }

            context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            context.lineWidth = 1.2;
            for (let i = 1; i < 10; i++) {
                const nx = bx + (bw / 10) * i;
                context.beginPath();
                context.moveTo(nx, by2);
                context.lineTo(nx, by2 + bh);
                context.stroke();
            }

            context.restore();

            // Draw Coin Display Panel under HP panel
            const cx = hx, cy = hy + hh + 8;
            context.save();
            context.shadowColor = 'rgba(0,0,0,0.4)';
            context.shadowBlur = 8;
            context.fillStyle = 'rgba(12, 10, 20, 0.9)';
            rr(context, cx, cy, 140, 32, 8); context.fill();
            context.strokeStyle = 'rgba(255,215,0,0.3)';
            context.lineWidth = 1.2;
            rr(context, cx, cy, 140, 32, 8); context.stroke();

            context.font = '800 12px "Poppins"';
            context.fillStyle = '#ffd700';
            context.textAlign = 'left';
            context.fillText('🪙 ' + this.coins.toLocaleString() + ' COINS', cx + 12, cy + 20);
            context.restore();

            // Flash glow when coins arrive
            if (this.coinHUDFlash > 0) {
                const flashAlpha = Math.min(1, this.coinHUDFlash / 200) * 0.75;
                context.save();
                context.globalAlpha = flashAlpha;
                context.shadowColor = '#ffd700';
                context.shadowBlur = 22;
                context.strokeStyle = '#ffd700';
                context.lineWidth = 2;
                rr(context, cx, cy, 140, 32, 8); context.stroke();
                context.restore();
            }

            const sw = 240, sh = 72, sx = W - sw - 16, sy = 12;
            context.shadowColor = 'rgba(0,0,0,0.5)';
            context.shadowBlur = 12;
            context.fillStyle = 'rgba(5,5,14,0.92)';
            rr(context, sx, sy, sw, sh, 12); context.fill();
            context.shadowBlur = 0;

            context.fillStyle = lvlAccent;
            context.beginPath();
            context.roundRect(sx, sy, sw, 2.5, [12, 12, 0, 0]);
            context.fill();
            context.strokeStyle = 'rgba(255,255,255,0.07)';
            context.lineWidth = 1;
            rr(context, sx, sy, sw, sh, 12); context.stroke();

            context.font = '13px sans-serif';
            context.fillStyle = lvlAccent;
            context.textAlign = 'right';
            context.fillText('', sx + sw - 14, sy + 24);
            context.font = '700 10px "Poppins"';
            context.fillStyle = 'rgba(255,255,255,0.42)';
            context.fillText('SCORE', sx + sw - 30, sy + 24);

            context.font = '800 36px "Poppins"';
            context.fillStyle = '#ffffff';
            context.fillText(this.score.toLocaleString(), sx + sw - 14, sy + 62);

            const lw = 160, lh = 32, lx = W / 2 - lw / 2, ly = 12;
            context.shadowColor = 'rgba(0,0,0,0.4)';
            context.shadowBlur = 10;
            context.fillStyle = 'rgba(5,5,14,0.92)';
            rr(context, lx, ly, lw, lh, 10); context.fill();
            context.shadowBlur = 0;
            context.strokeStyle = lvlAccent + '55';
            context.lineWidth = 1.5;
            rr(context, lx, ly, lw, lh, 10); context.stroke();

            context.font = '800 13px "Poppins"';
            context.fillStyle = lvlAccent;
            context.textAlign = 'center';
            context.fillText(`LEVEL  ${this.level}`, W / 2, ly + 21);

            const wy = ly + lh + 6;
            const dotW = 32, dotH = 6, dotGap = 4;
            const totalDotW = this.waveDef.length * dotW + (this.waveDef.length - 1) * dotGap;
            const ddx = W / 2 - totalDotW / 2;
            for (let i = 0; i < this.waveDef.length; i++) {
                const px = ddx + i * (dotW + dotGap);
                const isCurrent = i === this.waveIndex;
                const isDone = i < this.waveIndex;

                context.fillStyle = 'rgba(255,255,255,0.06)';
                rr(context, px, wy, dotW, dotH, 3); context.fill();

                if (isDone) {
                    context.fillStyle = lvlAccent;
                    rr(context, px, wy, dotW, dotH, 3); context.fill();
                } else if (isCurrent) {
                    const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.006);
                    context.fillStyle = lvlAccentDim;
                    rr(context, px, wy, dotW, dotH, 3); context.fill();
                    context.fillStyle = lvlAccent;
                    rr(context, px, wy, dotW * pulse, dotH, 3); context.fill();
                }
            }
            context.font = '700 9px "Poppins"';
            context.fillStyle = 'rgba(255,255,255,0.35)';
            context.textAlign = 'center';
            context.fillText(`WAVE  ${this.waveIndex + 1} / ${this.waveDef.length}`, W / 2, wy + dotH + 13);

            if (this.multiplier > 1) {
                const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.05;
                context.save();
                context.translate(W / 2, H - 72);
                context.scale(pulse, pulse);
                const cbw = 185, cbh = 40;

                context.shadowColor = '#ffab40';
                context.shadowBlur = 4;
                context.fillStyle = 'rgba(255,140,0,0.16)';
                rr(context, -cbw / 2, -cbh / 2, cbw, cbh, 10); context.fill();
                context.strokeStyle = 'rgba(255,160,0,0.55)';
                context.lineWidth = 1.5;
                rr(context, -cbw / 2, -cbh / 2, cbw, cbh, 10); context.stroke();
                context.shadowBlur = 0;
                context.font = '700 20px "Poppins"';
                context.fillStyle = '#ffcc44';
                context.textAlign = 'center';
                context.fillText(` x${this.multiplier} COMBO`, 0, 7);
                context.restore();
            }

            if (hpRatio < 0.25) {
                const alpha = 0.4 + 0.4 * Math.sin(Date.now() * 0.008);
                context.save();
                context.globalAlpha = alpha;

                const warnVig = context.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
                warnVig.addColorStop(0, 'transparent');
                warnVig.addColorStop(1, 'rgba(200,0,0,0.22)');
                context.fillStyle = warnVig;
                context.fillRect(0, 0, W, H);
                context.restore();

                const warnW = 280, warnH = 38;
                context.save();
                context.shadowColor = '#ff0000';
                context.shadowBlur = 6;
                context.fillStyle = 'rgba(140,0,0,0.28)';
                rr(context, W / 2 - warnW / 2, H - 60, warnW, warnH, 10); context.fill();
                context.strokeStyle = 'rgba(255,30,30,0.6)';
                context.lineWidth = 1.5;
                rr(context, W / 2 - warnW / 2, H - 60, warnW, warnH, 10); context.stroke();
                context.shadowBlur = 0;
                context.font = '700 15px "Poppins"';
                context.fillStyle = '#ff4444';
                context.textAlign = 'center';
                context.fillText('  CRITICAL HP  ', W / 2, H - 34);
                context.restore();
            }
            // ── Premium Glassmorphic Ability Icons (bottom-right) ────────────
            const player = this.player;
            const iconSize = 52;
            const iconGap = 14;
            const iconY = H - iconSize - 18;
            const r = iconSize / 2;

            // ── Q ability (Blast) ───────────────────────────────────────────
            const qX = W - iconSize * 3 - iconGap * 2 - 24;
            const qCd = player.windCooldown;
            const qMax = player.windCooldownMax;
            const qReady = qCd <= 0;
            const qCX = qX + r;
            const qCY = iconY + r;

            context.save();
            // 1. Radial graded glass backing
            context.shadowColor = qReady ? player.qColor : 'transparent';
            context.shadowBlur = qReady ? 14 : 0;
            const qBgGrad = context.createRadialGradient(qCX, qCY, 0, qCX, qCY, r);
            qBgGrad.addColorStop(0, 'rgba(24, 28, 22, 0.72)');
            qBgGrad.addColorStop(1, 'rgba(10, 12, 8, 0.94)');
            context.fillStyle = qBgGrad;
            context.beginPath();
            context.arc(qCX, qCY, r, 0, Math.PI * 2);
            context.fill();

            // 2. Translucent border
            context.shadowBlur = 0; // reset
            context.strokeStyle = qReady ? player.qColor : 'rgba(255, 255, 255, 0.08)';
            context.lineWidth = qReady ? 2.0 : 1.5;
            context.beginPath();
            context.arc(qCX, qCY, r, 0, Math.PI * 2);
            context.stroke();

            // 3. Cooldown Sector sweep dial
            if (!qReady) {
                const qProg = qCd / qMax;
                context.beginPath();
                context.moveTo(qCX, qCY);
                context.arc(qCX, qCY, r - 1, -Math.PI / 2, -Math.PI / 2 + qProg * Math.PI * 2);
                context.closePath();
                context.fillStyle = 'rgba(12, 10, 16, 0.72)';
                context.fill();
            }

            // 4. Q Icon vector graphics
            context.save();
            context.translate(qCX, qCY);
            context.strokeStyle = qReady ? player.qColor : 'rgba(120, 120, 120, 0.45)';
            context.lineWidth = 2.5; context.lineCap = 'round';
            context.shadowColor = qReady ? player.qColor : 'transparent';
            context.shadowBlur = qReady ? 6 : 0;

            if (player.characterType === 'jotem') {
                // Boulder Icon: Draw a rough boulder circle with cracks
                context.beginPath();
                context.arc(0, 0, 10, 0, Math.PI * 2);
                context.stroke();
                context.beginPath();
                context.moveTo(-5, -5); context.lineTo(5, 5);
                context.moveTo(5, -5); context.lineTo(-3, 3);
                context.stroke();
            } else if (player.characterType === 'shaia') {
                // Electro Orb: Draw a spark star
                context.beginPath();
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    const r1 = i % 2 === 0 ? 11 : 4;
                    context.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
                }
                context.closePath();
                context.stroke();
            } else if (player.characterType === 'archdemon') {
                // Fireball: Draw a flame teardrop
                context.beginPath();
                context.moveTo(0, -11);
                context.quadraticCurveTo(7, 0, 4, 9);
                context.quadraticCurveTo(0, 12, -4, 9);
                context.quadraticCurveTo(-7, 0, 0, -11);
                context.closePath();
                context.stroke();
            } else {
                // Shinobi: Wind spiral
                for (let wi = 0; wi < 3; wi++) {
                    const wa = (wi / 3) * Math.PI * 2;
                    context.beginPath();
                    context.arc(Math.cos(wa) * 7, Math.sin(wa) * 7, 7, wa, wa + Math.PI * 1.1);
                    context.stroke();
                }
            }
            context.restore();

            // 5. Cooldown countdown text
            if (!qReady) {
                const secLeft = Math.ceil(qCd / 1000);
                context.font = '700 13px "Poppins"';
                context.fillStyle = '#ffffff';
                context.textAlign = 'center';
                context.fillText(`${secLeft}s`, qCX, qCY + 5);
            }

            // 6. Label letter Q
            context.font = '800 11px "Poppins"';
            context.fillStyle = qReady ? player.qColor : 'rgba(120, 120, 120, 0.55)';
            context.textAlign = 'center';
            context.fillText('Q', qCX, iconY + iconSize + 14);

            // 7. Outer pulsating halo
            if (qReady) {
                const pulse = 1.0 + 0.04 * Math.sin(Date.now() * 0.008);
                context.save();
                context.translate(qCX, qCY);
                context.scale(pulse, pulse);
                context.globalAlpha = 0.22;
                context.strokeStyle = player.qColor;
                context.lineWidth = 1.5;
                context.beginPath();
                context.arc(0, 0, r + 4, 0, Math.PI * 2);
                context.stroke();
                context.restore();
            }
            context.restore();

            // ── E ability (Shield) ───────────────────────────────────────────
            const eX = W - iconSize * 2 - iconGap - 24;
            const eCd = player.shieldCooldown;
            const eMax = player.shieldCooldownMax;
            const eReady = eCd <= 0;
            const eCX = eX + r;
            const eCY = iconY + r;

            context.save();
            // 1. Radial graded glass backing
            context.shadowColor = eReady ? player.eColor : 'transparent';
            context.shadowBlur = eReady ? 14 : 0;
            const eBgGrad = context.createRadialGradient(eCX, eCY, 0, eCX, eCY, r);
            eBgGrad.addColorStop(0, 'rgba(18, 24, 32, 0.72)');
            eBgGrad.addColorStop(1, 'rgba(8, 10, 14, 0.94)');
            context.fillStyle = eBgGrad;
            context.beginPath();
            context.arc(eCX, eCY, r, 0, Math.PI * 2);
            context.fill();

            // 2. Translucent border
            context.shadowBlur = 0; // reset
            context.strokeStyle = eReady ? player.eColor : 'rgba(255, 255, 255, 0.08)';
            context.lineWidth = eReady ? 2.0 : 1.5;
            context.beginPath();
            context.arc(eCX, eCY, r, 0, Math.PI * 2);
            context.stroke();

            // 3. Cooldown Sector sweep dial
            if (!eReady) {
                const eProg = eCd / eMax;
                context.beginPath();
                context.moveTo(eCX, eCY);
                context.arc(eCX, eCY, r - 1, -Math.PI / 2, -Math.PI / 2 + eProg * Math.PI * 2);
                context.closePath();
                context.fillStyle = 'rgba(12, 10, 16, 0.72)';
                context.fill();
            }

            // 4. Shield Icon vector graphics
            context.save();
            context.translate(eCX, eCY);
            context.strokeStyle = eReady ? player.eColor : 'rgba(120, 120, 120, 0.45)';
            context.lineWidth = 2.5; context.lineCap = 'round'; context.lineJoin = 'round';
            context.shadowColor = eReady ? player.eColor : 'transparent';
            context.shadowBlur = eReady ? 6 : 0;

            if (player.characterType === 'jotem') {
                // Earth Aegis: Brick Shield
                context.beginPath();
                context.moveTo(-8, -10); context.lineTo(8, -10);
                context.lineTo(8, 5); context.quadraticCurveTo(0, 11, -8, 5);
                context.closePath();
                context.stroke();
                context.beginPath();
                context.moveTo(-8, -2); context.lineTo(8, -2);
                context.stroke();
            } else if (player.characterType === 'shaia') {
                // Static Barrier: Ring with outward discharges
                context.beginPath();
                context.arc(0, 0, 9, 0, Math.PI * 2);
                context.stroke();
                context.beginPath();
                context.moveTo(-13, 0); context.lineTo(-9, 0);
                context.moveTo(13, 0); context.lineTo(9, 0);
                context.moveTo(0, -13); context.lineTo(0, -9);
                context.moveTo(0, 13); context.lineTo(0, 9);
                context.stroke();
            } else if (player.characterType === 'archdemon') {
                // Void Rift: Concentric swirling arcs
                context.beginPath();
                context.arc(0, 0, 10, 0, Math.PI * 1.35);
                context.stroke();
                context.beginPath();
                context.arc(0, 0, 6, Math.PI * 0.7, Math.PI * 2);
                context.stroke();
            } else {
                // Shinobi Plasma Shield
                context.beginPath();
                context.moveTo(-8, -10);
                context.lineTo(8, -10);
                context.lineTo(8, -2);
                context.quadraticCurveTo(8, 6, 0, 11);
                context.quadraticCurveTo(-8, 6, -8, -2);
                context.closePath();
                context.stroke();
                context.beginPath();
                context.moveTo(0, -6);
                context.lineTo(0, 5);
                context.moveTo(-4, -1);
                context.lineTo(4, -1);
                context.stroke();
            }
            context.restore();

            // 5. Cooldown countdown text
            if (!eReady) {
                const secLeft = Math.ceil(eCd / 1000);
                context.font = '700 13px "Poppins"';
                context.fillStyle = '#ffffff';
                context.textAlign = 'center';
                context.fillText(`${secLeft}s`, eCX, eCY + 5);
            }

            // 6. Label letter E
            context.font = '800 11px "Poppins"';
            context.fillStyle = eReady ? player.eColor : 'rgba(120, 120, 120, 0.55)';
            context.textAlign = 'center';
            context.fillText('E', eCX, iconY + iconSize + 14);

            // 7. Outer pulsating halo
            if (eReady) {
                const pulse = 1.0 + 0.04 * Math.sin(Date.now() * 0.008);
                context.save();
                context.translate(eCX, eCY);
                context.scale(pulse, pulse);
                context.globalAlpha = 0.22;
                context.strokeStyle = player.eColor;
                context.lineWidth = 1.5;
                context.beginPath();
                context.arc(0, 0, r + 4, 0, Math.PI * 2);
                context.stroke();
                context.restore();
            }
            context.restore();

            // ── R ability (Slash/Ultimate) ───────────────────────────────────
            const rX = W - iconSize - 24;
            const rCd = player.slashCooldown;
            const rMax = player.slashCooldownMax;
            const rReady = rCd <= 0;
            const rCX = rX + r;
            const rCY = iconY + r;

            context.save();
            // 1. Radial graded glass backing
            context.shadowColor = rReady ? player.rColor : 'transparent';
            context.shadowBlur = rReady ? 14 : 0;
            const rBgGrad = context.createRadialGradient(rCX, rCY, 0, rCX, rCY, r);
            rBgGrad.addColorStop(0, 'rgba(32, 26, 18, 0.72)');
            rBgGrad.addColorStop(1, 'rgba(14, 11, 8, 0.94)');
            context.fillStyle = rBgGrad;
            context.beginPath();
            context.arc(rCX, rCY, r, 0, Math.PI * 2);
            context.fill();

            // 2. Translucent border
            context.shadowBlur = 0; // reset
            context.strokeStyle = rReady ? player.rColor : 'rgba(255, 255, 255, 0.08)';
            context.lineWidth = rReady ? 2.0 : 1.5;
            context.beginPath();
            context.arc(rCX, rCY, r, 0, Math.PI * 2);
            context.stroke();

            // 3. Cooldown Sector sweep dial
            if (!rReady) {
                const rProg = rCd / rMax;
                context.beginPath();
                context.moveTo(rCX, rCY);
                context.arc(rCX, rCY, r - 1, -Math.PI / 2, -Math.PI / 2 + rProg * Math.PI * 2);
                context.closePath();
                context.fillStyle = 'rgba(12, 10, 16, 0.72)';
                context.fill();
            }

            // 4. Slash/Ultimate Icon vector graphics
            context.save();
            context.translate(rCX, rCY);
            context.strokeStyle = rReady ? player.rColor : 'rgba(120, 120, 120, 0.45)';
            context.lineWidth = 3; context.lineCap = 'round';
            context.shadowColor = rReady ? player.rColor : 'transparent';
            context.shadowBlur = rReady ? 6 : 0;

            if (player.characterType === 'jotem') {
                // Spikes Ultimate: Ground jagged lines
                context.beginPath();
                context.moveTo(-11, 8); context.lineTo(-6, -4); context.lineTo(-1, 8);
                context.lineTo(4, -9); context.lineTo(9, 8);
                context.stroke();
            } else if (player.characterType === 'shaia') {
                // Thunderstrike: Zig-zag lightning bolt
                context.beginPath();
                context.moveTo(5, -11);
                context.lineTo(-4, 0);
                context.lineTo(2, 0);
                context.lineTo(-5, 11);
                context.stroke();
            } else if (player.characterType === 'archdemon') {
                // Chaos rift: Curved crescent crescent wave
                context.beginPath();
                context.arc(-5, 0, 10, -Math.PI * 0.45, Math.PI * 0.45);
                context.stroke();
            } else {
                // Shinobi Flame Slash
                context.beginPath();
                context.moveTo(-10, 10);
                context.quadraticCurveTo(0, -2, 10, -10);
                context.stroke();
            }
            context.restore();

            // 5. Cooldown countdown text
            if (!rReady) {
                const secLeft = Math.ceil(rCd / 1000);
                context.font = '700 13px "Poppins"';
                context.fillStyle = '#ffffff';
                context.textAlign = 'center';
                context.fillText(`${secLeft}s`, rCX, rCY + 5);
            }

            // 6. Label letter R
            context.font = '800 11px "Poppins"';
            context.fillStyle = rReady ? player.rColor : 'rgba(120, 120, 120, 0.55)';
            context.textAlign = 'center';
            context.fillText('R', rCX, iconY + iconSize + 14);

            // 7. Outer pulsating halo
            if (rReady) {
                const pulse = 1.0 + 0.04 * Math.sin(Date.now() * 0.008);
                context.save();
                context.translate(rCX, rCY);
                context.scale(pulse, pulse);
                context.globalAlpha = 0.22;
                context.strokeStyle = player.rColor;
                context.lineWidth = 1.5;
                context.beginPath();
                context.arc(0, 0, r + 4, 0, Math.PI * 2);
                context.stroke();
                context.restore();
            }
            context.restore();
            // ─────────────────────────────────────────────────────────────────

            context.restore();
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    // ── Setup Premium Settings UI and Volume Controllers ───────────────
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOverlay = document.getElementById('settings-overlay');
    const closeSettings = document.getElementById('close-settings');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backBtn = document.getElementById('back-btn');
    const bgmVolumeSlider = document.getElementById('bgm-volume');
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    const bgmVolTxt = document.getElementById('bgm-vol-txt');
    const sfxVolTxt = document.getElementById('sfx-vol-txt');

    // Initialize values from localStorage / defaults
    const savedBgmVol = Math.round(game.audio.bgmVolume * 100);
    const savedSfxVol = Math.round(game.audio.sfxVolume * 100);

    bgmVolumeSlider.value = savedBgmVol;
    sfxVolumeSlider.value = savedSfxVol;
    bgmVolTxt.innerText = `${savedBgmVol}%`;
    sfxVolTxt.innerText = `${savedSfxVol}%`;

    // Dynamic slider track fill coloration
    function updateSliderBackground(slider) {
        const value = slider.value;
        slider.style.background = `linear-gradient(to right, #00e5ff 0%, #00e5ff ${value}%, rgba(255, 255, 255, 0.09) ${value}%, rgba(255, 255, 255, 0.09) 100%)`;
    }

    updateSliderBackground(bgmVolumeSlider);
    updateSliderBackground(sfxVolumeSlider);

    function toggleSettings(show) {
        if (show) {
            game.paused = true;
            if (game.audio) game.audio.pauseBGM();
            settingsOverlay.classList.add('active');
        } else {
            game.paused = false;
            if (game.audio) game.audio.resumeBGM();
            settingsOverlay.classList.remove('active');
        }
    }

    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSettings(true);
    });

    closeSettings.addEventListener('click', () => {
        toggleSettings(false);
    });

    resumeBtn.addEventListener('click', () => {
        toggleSettings(false);
    });

    restartBtn.addEventListener('click', () => {
        toggleSettings(false);
        game.restart();
        game.startTransition = true;
        game.startTransitionTimer = 0;
        if (game.audio) {
            game.audio.playSFX('game_start');
        }
    });

    backBtn.addEventListener('click', () => {
        // Toggle settings overlay off, but keep game paused/music paused
        settingsOverlay.classList.remove('active');
        if (game.audio) {
            game.audio.pauseBGM();
        }
        const overlay = document.getElementById('char-selection-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    });

    // Reset Progress button — wipes maxUnlockedLevel and re-locks all levels beyond Level 1
    const resetProgressBtn = document.getElementById('reset-progress-btn');
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener('click', () => {
            // Confirm before wiping (simple native confirm)
            const ok = window.confirm(
                '⚠️ Reset all progress?\n\nAll unlocked levels will be locked again. Only Level 1 will remain available.'
            );
            if (!ok) return;

            // Wipe the saved unlock state
            localStorage.removeItem('maxUnlockedLevel');

            // Reset selected level back to 1
            selectedLevel = 1;

            // Re-render level cards so locks are applied immediately
            renderLevelSelectionUI();

            // Visual confirmation on the button
            const orig = resetProgressBtn.innerHTML;
            resetProgressBtn.innerHTML = '✓ PROGRESS RESET!';
            resetProgressBtn.style.background = 'linear-gradient(135deg, #003300, #1a7a1a)';
            resetProgressBtn.style.borderColor = '#2ecc71';
            setTimeout(() => {
                resetProgressBtn.innerHTML = orig;
                resetProgressBtn.style.background = 'linear-gradient(135deg, #7b0000, #c0392b)';
                resetProgressBtn.style.borderColor = '#e74c3c';
            }, 2000);
        });
    }

    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
            toggleSettings(false);
        }
    });

    bgmVolumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        bgmVolTxt.innerText = `${val}%`;
        updateSliderBackground(e.target);
        if (game.audio) game.audio.setBGMVolume(val / 100);
    });

    sfxVolumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        sfxVolTxt.innerText = `${val}%`;
        updateSliderBackground(e.target);
        if (game.audio) game.audio.setSFXVolume(val / 100);
    });

    // Play preview SFX when releasing volume thumb
    sfxVolumeSlider.addEventListener('change', () => {
        if (game.audio) game.audio.playSFX('punch');
    });
    // ─────────────────────────────────────────────────────────────────

    canvas.addEventListener('click', function (e) {

        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        if (!game.gameStarted && !game.startTransition) {
            // Check if click is within the START GAME button area
            const W = canvas.width, H = canvas.height;
            const btnW = 220, btnH = 50;
            const btnX = W / 2 - btnW / 2;
            const btnY = H / 2 - 52;
            const onButton = mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH;
            if (onButton) {
                // Open character selection overlay
                const overlay = document.getElementById('char-selection-overlay');
                if (overlay) {
                    overlay.classList.add('active');
                    updateCharacterSelectionUI();
                }
            }
            return;
        }

        if (game.levelComplete) {

            const bW = 280;
            const bH = 54;
            const bX = canvas.width / 2 - bW / 2;
            const bY = canvas.height / 2 + 190;

            if (
                mx >= bX &&
                mx <= bX + bW &&
                my >= bY &&
                my <= bY + bH
            ) {

                if (game.level >= 10) {
                    // Trigger Post-Credits Scene instead of going back to Level 1
                    document.getElementById('post-credit-overlay').style.display = 'flex';
                    const textContainer = document.getElementById('post-credit-text-container');
                    textContainer.innerHTML = `
                        <div class="void-text">Deep in the void—</div>
                        <div class="void-text" style="animation-delay: 2s;">A colossal throne awakens.</div>
                        <div class="void-text" style="animation-delay: 4s;">Billions of red eyes open.</div>
                        <div class="void-text" style="animation-delay: 6s;">"Amarjeet has fallen."</div>
                        <div class="void-text" style="animation-delay: 8s;">"Good."</div>
                        <div class="void-text" style="animation-delay: 10s;">"Open the gates."</div>
                        <div class="void-title void-shake">THE VOID EMPEROR RISES</div>
                        <div class="void-subtitle">REALM BREAKER II: THE END OF INFINITY</div>
                    `;
                } else {

                    game.nextLevel();

                    game.startTransition = true;
                    game.startTransitionTimer = 0;
                }
            }

            return;
        }

        if (
            game.gameOver &&
            game.gameOverTimer >= game.gameOverDelay
        ) {

            const bX = canvas.width / 2 - 120;
            const bY = canvas.height / 2 + 62;
            const bW = 240;
            const bH = 50;

            if (
                mx >= bX &&
                mx <= bX + bW &&
                my >= bY &&
                my <= bY + bH
            ) {

                game._init();
                game.gameStarted = true;

                game.startTransition = true;
                game.startTransitionTimer = 0;
            }
        }
    });

    // ── Setup Premium Character Selection Screen Interactions ──────────
    const charOverlay = document.getElementById('char-selection-overlay');
    const charCards = document.querySelectorAll('.char-card');
    const confirmCharBtn = document.getElementById('confirm-char-btn');

    const CHARACTER_DB = {
        shinobi: {
            name: "SHINOBI",
            title: "Wind Swiftblade",
            desc: "An elite ninja wielding the raw power of vacuum and plasma slashes. Relies on speed and precision to slice through hordes of skeletal foes.",
            themeClass: "theme-cyan",
            accentColor: "#00e5ff",
            textClass: "text-cyan",
            stats: { hp: 80, speed: 85, power: 70, defense: 60 },
            skills: {
                q: { name: "Wind Blast", desc: "Charges a compressed vacuum projectile." },
                e: { name: "Plasma Shield", desc: "Deflects all damage with cyan kinetic fields." },
                r: { name: "Flame Slash", desc: "Releases crescent wave slashes of sword heat." }
            },
            portraitClass: "",
            portraitSrc: "/asset/players/player-banner/player1-banner.png"
        },
        jotem: {
            name: "JOTEM",
            title: "The Stone Giant",
            desc: "An ancient stone colossus awakened from subterranean depths. Wields immense kinetic force, summoning boulders and ground fissures to crush foes.",
            themeClass: "theme-amber",
            accentColor: "#ffa726",
            textClass: "text-amber",
            stats: { hp: 100, speed: 45, power: 90, defense: 85 },
            skills: {
                q: { name: "Stone Boulder", desc: "Launches a massive rolling and shattering boulder." },
                e: { name: "Earth Aegis", desc: "Summons runic stones that absorb all incoming hits." },
                r: { name: "Fissure Shatter", desc: "Shatters the ground with high-velocity stone spikes." }
            },
            portraitClass: "",
            portraitSrc: "/asset/players/player-banner/player2-banner.png"
        },
        shaia: {
            name: "SHAIA",
            title: "Electro-Martial Artist",
            desc: "A swift electro-combat specialist charged with high-frequency currents. Utilizes rapid combo kicks, lightning orbs, and devastating thunder strikes.",
            themeClass: "theme-purple",
            accentColor: "#cc55ff",
            textClass: "text-purple",
            stats: { hp: 70, speed: 100, power: 75, defense: 50 },
            skills: {
                q: { name: "Static Volt", desc: "Shoots a high-velocity lightning-infused sphere." },
                e: { name: "Overcharge", desc: "Emits lightning static sparks that damage nearby enemies." },
                r: { name: "Thunder Strike", desc: "Summons crackling vertical lightning bolts from above." }
            },
            portraitClass: "",
            portraitSrc: "/asset/players/player-banner/player3-banner.png"
        },
        archdemon: {
            name: "DUSKBORNE",
            title: "Arch-Demon of Abyssal Fire",
            desc: "A floating demonic ruler fueled by chaos and hellfire. Fires continuous streams of abyssal flames and opens rifts of dark void energy to wipe the screen clean.",
            themeClass: "theme-crimson",
            accentColor: "#ff2244",
            textClass: "text-crimson",
            stats: { hp: 90, speed: 65, power: 85, defense: 70 },
            skills: {
                q: { name: "Hellfire Stream", desc: "Fires a continuous spray of burning hellfire orbs." },
                e: { name: "Void Rift", desc: "Summons a swirling dark purple vortex shield." },
                r: { name: "Chaos Cataclysm", desc: "Launches a giant volcanic crescent rift slash." }
            },
            portraitClass: "",
            portraitSrc: "/asset/players/player-banner/player4-banner.png"
        }
    };

    let currentlySelected = 'shinobi';

    const CHAR_PRICES = {
        shinobi: 0,
        jotem: 200,
        shaia: 350,
        archdemon: 500
    };

    function updateCharacterSelectionUI() {
        const userCoinsDisplay = document.getElementById('user-coins-display');
        if (userCoinsDisplay) {
            userCoinsDisplay.innerText = game.coins;
        }

        charCards.forEach(card => {
            const charType = card.getAttribute('data-char');
            const isUnlocked = charType === 'shinobi' || localStorage.getItem('unlocked_char_' + charType) === 'true';
            const price = CHAR_PRICES[charType];

            let priceTag = card.querySelector('.char-price-tag');
            if (!priceTag) {
                priceTag = document.createElement('span');
                priceTag.className = 'char-price-tag';
                priceTag.style.cssText = "font-size: 11px; font-weight: 700; color: #ffd700; margin-top: 4px; display: block;";
                card.querySelector('.card-info').appendChild(priceTag);
            }

            if (isUnlocked) {
                card.classList.remove('char-locked');
                priceTag.innerText = "UNLOCKED";
                priceTag.style.color = "#00ffd0";
                const arrow = card.querySelector('.card-arrow');
                if (arrow) arrow.style.display = 'block';
            } else {
                card.classList.add('char-locked');
                priceTag.innerText = `🪙 ${price} COINS`;
                priceTag.style.color = "#ffd700";
                const arrow = card.querySelector('.card-arrow');
                if (arrow) arrow.style.display = 'none';
            }
        });

        const isUnlocked = currentlySelected === 'shinobi' || localStorage.getItem('unlocked_char_' + currentlySelected) === 'true';
        const confirmBtn = document.getElementById('confirm-char-btn');
        if (confirmBtn) {
            if (isUnlocked) {
                confirmBtn.innerText = "CONFIRM CHAMPION";
                confirmBtn.style.background = "";
                confirmBtn.style.borderColor = "";
                confirmBtn.style.color = "";
            } else {
                const price = CHAR_PRICES[currentlySelected];
                confirmBtn.innerText = `UNLOCK CHAMPION (🪙 ${price} Coins)`;
                if (game.coins >= price) {
                    confirmBtn.style.background = "linear-gradient(135deg, #ffd700, #ffaa00)";
                    confirmBtn.style.borderColor = "#ffea00";
                    confirmBtn.style.color = "#000000";
                } else {
                    confirmBtn.style.background = "linear-gradient(135deg, #444, #222)";
                    confirmBtn.style.borderColor = "#555";
                    confirmBtn.style.color = "rgba(255,255,255,0.4)";
                }
            }
        }
    }

    charCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const charType = card.getAttribute('data-char');
            currentlySelected = charType;

            // Remove active classes from all cards
            charCards.forEach(c => c.classList.remove('active-card'));
            card.classList.add('active-card');



            // Update details preview panel dynamically
            const db = CHARACTER_DB[charType];
            if (db) {
                const previewPanel = document.getElementById('char-preview-panel');
                const pName = document.getElementById('preview-name');
                const pTitle = document.getElementById('preview-title');
                const pDesc = document.getElementById('preview-desc');
                const pImg = document.getElementById('preview-portrait-img');

                // Toggle dynamic glowing borders
                if (previewPanel) {
                    previewPanel.className = `char-preview-panel ${db.themeClass}`;
                }

                // Text updates
                if (pName) {
                    pName.innerText = db.name;
                    pName.className = `preview-name ${db.textClass}`;
                }
                if (pTitle) pTitle.innerText = db.title;
                if (pDesc) pDesc.innerText = db.desc;

                // Stats bars update
                const hpBar = document.getElementById('stat-fill-hp');
                const spdBar = document.getElementById('stat-fill-speed');
                const pwrBar = document.getElementById('stat-fill-power');
                const defBar = document.getElementById('stat-fill-defense');

                if (hpBar) { hpBar.style.width = `${db.stats.hp}%`; hpBar.style.background = db.accentColor; }
                if (spdBar) { spdBar.style.width = `${db.stats.speed}%`; spdBar.style.background = db.accentColor; }
                if (pwrBar) { pwrBar.style.width = `${db.stats.power}%`; pwrBar.style.background = db.accentColor; }
                if (defBar) { defBar.style.width = `${db.stats.defense}%`; defBar.style.background = db.accentColor; }

                // Skills updates
                document.getElementById('skill-q-name').innerText = db.skills.q.name;
                document.getElementById('skill-q-desc').innerText = db.skills.q.desc;
                document.getElementById('skill-e-name').innerText = db.skills.e.name;
                document.getElementById('skill-e-desc').innerText = db.skills.e.desc;
                document.getElementById('skill-r-name').innerText = db.skills.r.name;
                document.getElementById('skill-r-desc').innerText = db.skills.r.desc;

                // Large Portrait Update
                if (pImg) {
                    pImg.src = db.portraitSrc;
                    pImg.className = `portrait-img-large ${db.portraitClass}`;
                }
            }

            updateCharacterSelectionUI();
        });
    });

    // ── Setup Premium Level Selection Interactions ───────────────────────
    const LEVELS_DATA = [
        { id: 1, name: "SHADOW CITY", desc: "Fight the skeletal white horde in the silhouette metropolis. Defeat the final Boss.", playable: true, theme: "cyan" },
        { id: 2, name: "SPIDER FOREST", desc: "Brave the infested spider woods. Battle Mecha-Stone Boss.", playable: true, theme: "amber" },
        { id: 3, name: "HALLOWEEN HOUSE", desc: "Fight through the witch's haunted cabin. Defeat the Dragon Lord.", playable: true, theme: "purple" },
        { id: 4, name: "HAUNTED GRAVEYARD", desc: "Confront the spirits of the damned in the cemetery. Battle the Mino Boss.", playable: true, theme: "crimson" },
        { id: 5, name: "MUSHROOM GROVE", desc: "Navigate the fungal grove. Defeat the Impaler.", playable: true, theme: "neon-green" },
        { id: 6, name: "CRYSTAL CAVERNS", desc: "Follow Amarjeet into the broken dimensions. Defeat the Crystal Titan.", playable: true, theme: "cyan" },
        { id: 7, name: "SKY TEMPLE", desc: "Discover Amarjeet's past. Defeat the Storm Seraph.", playable: true, theme: "amber" },
        { id: 8, name: "FROZEN ABYSS", desc: "The seal is cracking. The Void Emperor watches. Defeat the Frost Wyrm.", playable: true, theme: "purple" },
        { id: 9, name: "VOID KINGDOM", desc: "Walk through Amarjeet's fractured memories. Face the Abyss Knight.", playable: true, theme: "crimson" },
        { id: 10, name: "EDGE OF REALITY", desc: "The final battle. Break Amarjeet Da Black Hole.", playable: true, theme: "neon-green" }
    ];

    let selectedLevel = Math.min(10, parseInt(localStorage.getItem('maxUnlockedLevel') || '1'));

    function renderLevelSelectionUI() {
        const container = document.getElementById('level-list-container');
        if (!container) return;

        const maxUnlocked = parseInt(localStorage.getItem('maxUnlockedLevel') || '1');

        container.innerHTML = '';

        LEVELS_DATA.forEach(lvl => {
            const card = document.createElement('div');
            card.className = 'level-card';
            card.setAttribute('data-level', lvl.id);

            const isLocked = !lvl.playable || lvl.id > maxUnlocked;
            const isComingSoon = !lvl.playable;

            if (isLocked) {
                card.classList.add('locked');
            }
            if (lvl.id === selectedLevel && !isLocked) {
                card.classList.add('active-card');
            }

            // Theme class for glows
            let themeClass = 'text-cyan';
            if (lvl.theme === 'amber') themeClass = 'text-amber';
            else if (lvl.theme === 'purple') themeClass = 'text-purple';
            else if (lvl.theme === 'crimson') themeClass = 'text-crimson';
            else if (lvl.theme === 'grey') themeClass = 'text-grey';
            else if (lvl.theme === 'neon-green') themeClass = 'text-neon-green';

            card.innerHTML = `
                <div class="char-card-glow ${themeClass}"></div>
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px;">LEVEL ${lvl.id}</h3>
                <span class="${themeClass}" style="font-size: 11px; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px; display: block;">${lvl.name}</span>
                <p style="font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.4; margin-bottom: 0;">${lvl.desc}</p>
            `;

            if (isComingSoon) {
                const badge = document.createElement('div');
                badge.className = 'level-coming-soon-badge';
                badge.innerText = 'COMING SOON';
                card.appendChild(badge);
            } else if (isLocked) {
                const badge = document.createElement('div');
                badge.className = 'level-lock-badge';
                badge.innerHTML = '🔒 LOCKED';
                card.appendChild(badge);
            }

            // Click listener
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isLocked) {
                    // Play error/locked SFX
                    if (game.audio) {
                        game.audio.playSFX('player_hurt');
                    }
                    return;
                }

                selectedLevel = lvl.id;

                // Refresh active styles
                const cards = container.querySelectorAll('.level-card');
                cards.forEach(c => c.classList.remove('active-card'));
                card.classList.add('active-card');

                if (game.audio) {
                    game.audio.playSFX('punch');
                }
            });

            container.appendChild(card);
        });
    }

    // Wire up the Confirm button to open level selection
    const levelOverlay = document.getElementById('level-selection-overlay');
    if (confirmCharBtn) {
        confirmCharBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            const isUnlocked = currentlySelected === 'shinobi' || localStorage.getItem('unlocked_char_' + currentlySelected) === 'true';
            if (isUnlocked) {
                game.selectedCharacter = currentlySelected;

                // Render Level selection cards dynamically with correct lock status
                renderLevelSelectionUI();

                if (charOverlay) {
                    charOverlay.classList.remove('active');
                }
                if (levelOverlay) {
                    levelOverlay.classList.add('active');
                }
            } else {
                // Try to purchase
                const price = CHAR_PRICES[currentlySelected];
                if (game.coins >= price) {
                    game.coins -= price;
                    localStorage.setItem('gameCoins', game.coins.toString());
                    localStorage.setItem('unlocked_char_' + currentlySelected, 'true');

                    if (game.audio) {
                        game.audio.playSFX('game_start');
                    }

                    updateCharacterSelectionUI();
                } else {
                    if (game.audio) {
                        game.audio.playSFX('player_hurt');
                    }
                    const coinsDisplay = document.getElementById('user-coins-display');
                    if (coinsDisplay) {
                        coinsDisplay.style.color = '#ff3333';
                        setTimeout(() => { coinsDisplay.style.color = '#ffd700'; }, 500);
                    }
                }
            }
        });
    }

    // Wire up the Back button inside character selection
    const charSelectBackBtn = document.getElementById('char-select-back-btn');
    if (charSelectBackBtn) {
        charSelectBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (charOverlay) {
                charOverlay.classList.remove('active');
            }
            if (game.gameStarted) {
                // If a game session was active, return to the paused settings overlay
                if (settingsOverlay) {
                    settingsOverlay.classList.add('active');
                }
            }
        });
    }

    const confirmLevelBtn = document.getElementById('confirm-level-btn');
    const levelSelectBackBtn = document.getElementById('level-select-back-btn');

    if (confirmLevelBtn) {
        confirmLevelBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            game.level = selectedLevel;
            game.selectedCharacter = currentlySelected;
            game.paused = false;
            // DON'T set gameStarted=true here — let the transition handler do it
            // so that draw() shows the background fade-to-black instead of pure black
            game.gameStarted = false;
            game.levelSelectMode = true; // flag for clean background-fade transition
            game._init();

            game.startTransition = true;
            game.startTransitionTimer = 0;

            if (game.audio) {
                game.audio.playSFX('game_start');
            }

            if (levelOverlay) {
                levelOverlay.classList.remove('active');
            }
        });
    }

    if (levelSelectBackBtn) {
        levelSelectBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (levelOverlay) {
                levelOverlay.classList.remove('active');
            }
            if (charOverlay) {
                charOverlay.classList.add('active');
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // QTE Logic for Final Boss
    // ─────────────────────────────────────────────────────────────────
    let qteActive = false;
    let qteProgress = 0;
    const qteMax = 100;
    let qteDrainInterval;

    window.addEventListener('amarjeet-qte-start', () => {
        qteActive = true;
        qteProgress = 0;
        document.getElementById('qte-bar-fill').style.width = '0%';

        // Slowly drain QTE progress so the player has to actually mash
        if (qteDrainInterval) clearInterval(qteDrainInterval);
        qteDrainInterval = setInterval(() => {
            if (qteActive) {
                qteProgress = Math.max(0, qteProgress - 5);
                document.getElementById('qte-bar-fill').style.width = qteProgress + '%';
            }
        }, 100);
    });

    window.addEventListener('keydown', (e) => {
        if (qteActive && (e.key === 'e' || e.key === 'E' || e.code === 'Space')) {
            qteProgress += 12;
            document.getElementById('qte-bar-fill').style.width = Math.min(100, qteProgress) + '%';

            if (qteProgress >= qteMax) {
                qteProgress = qteMax;
                qteActive = false;
                if (qteDrainInterval) clearInterval(qteDrainInterval);

                document.getElementById('qte-overlay').style.display = 'none';

                const boss = game.enemies.find(en => en.isBoss && en.isAmarjeet);
                if (boss) {
                    boss.currentHP = 0;
                    boss.qteTriggered = false; // Prevent re-trigger
                    boss.invuln = 0;
                    boss.takeDamage(1); // Force into death state
                }
            }
        }
    });

    function Animate(timeStamp) {
        const deltaTime = Math.min(timeStamp - lastTime, 50);
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        if (game.screenDistort) {
            const time = timeStamp / 1000;
            const distortionAmount = Math.sin(time * 5) * 15;
            ctx.translate(distortionAmount, Math.cos(time * 3) * 10);
            ctx.filter = `hue-rotate(${Math.sin(time) * 40}deg) blur(${Math.abs(Math.sin(time * 2)) * 2}px)`;
        }

        game.update(deltaTime);
        game.draw(ctx);

        ctx.restore();

        // Clear one-shot keys AFTER game has processed them this frame
        game.input.clearOneShots();
        requestAnimationFrame(Animate);
    }

    Animate(0);
});
