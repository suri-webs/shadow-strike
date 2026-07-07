// io is loaded from CDN (socket.io.min.js) in index.html — available as global
import { Player } from "./player.js";
import { Background, Level2Background, Level3Background, Level4Background, Level5Background, Level6Background, Level7Background, Level8Background, Level9Background, Level10Background } from "./background.js";
import { GroundEnemy } from "./groundEnemy.js";
import { BossEnemy } from "./Bossenemy.js";
import { MinoBoss } from "./minoBoss.js";
import { InputHandler } from "./input.js";
import { FlyingEnemy } from "./flyingEnemy.js";
import { Portal } from "./portal.js";
import { Dropbox } from "./dropbox.js";
import { KamehamehaBeam } from "./kamehameha.js";
import { RasenganVortex } from "./rasengan.js";
import { AudioManager } from "./audio.js";

const multiplayerArcherProjImage = new Image();
multiplayerArcherProjImage.src = 'asset/Arcane archer/projectile.png';

const sharedTintCanvas = document.createElement('canvas');
const sharedTintCtx = sharedTintCanvas.getContext('2d');

window.drawTintedSprite = function (ctx, img, srcX, srcY, srcW, srcH, destX, destY, destW, destH, color, alpha = 1.0) {
    if (srcW <= 0 || srcH <= 0 || destW <= 0 || destH <= 0) return;

    if (sharedTintCanvas.width < srcW) {
        sharedTintCanvas.width = srcW;
    }
    if (sharedTintCanvas.height < srcH) {
        sharedTintCanvas.height = srcH;
    }

    sharedTintCtx.clearRect(0, 0, srcW, srcH);

    sharedTintCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    sharedTintCtx.save();
    sharedTintCtx.globalCompositeOperation = 'source-atop';
    sharedTintCtx.fillStyle = color;
    sharedTintCtx.fillRect(0, 0, srcW, srcH);
    sharedTintCtx.restore();

    ctx.save();
    ctx.globalAlpha = alpha * ctx.globalAlpha;
    ctx.drawImage(sharedTintCanvas, 0, 0, srcW, srcH, destX, destY, destW, destH);
    ctx.restore();
};

// ── Safe HTML escaping helper (used for chat / toast text rendering) ──
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

window.addEventListener('load', function () {

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = 1550;
    canvas.height = 700;

    const LEVEL_CONFIG = {
        1: {
            waves: [
                { type: 'skeleton_white', count: 3 },
                { type: 'flying', count: 3 },
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
                { type: 'skeleton_yellow', count: 4 },
                { type: 'mixed_level2', count: 6 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 2500,
            groundMargin: 55,
            bgClass: 'Level2Background',
        },
        3: {
            waves: [
                { type: 'skeleton_white', count: 4 },
                { type: 'arcane_archer', count: 2 },
                { type: 'mixed_level3', count: 6 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 2000,
            groundMargin: 55,
            bgClass: 'Level3Background',
        },
        4: {
            waves: [
                { type: 'skeleton_yellow', count: 4 },
                { type: 'arcane_archer', count: 4 },
                { type: 'mixed_level3', count: 8 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1800,
            groundMargin: 55,
            bgClass: 'Level4Background',
        },
        5: {
            waves: [
                { type: 'demon', count: 7 },
                { type: 'arcane_archer', count: 6 },
                { type: 'mixed_level3', count: 10 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1600,
            groundMargin: 55,
            bgClass: 'Level5Background',
        },
        6: {
            waves: [
                { type: 'skeleton_yellow', count: 6 },
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
                { type: 'flying', count: 3 },
                { type: 'arcane_archer', count: 6 },
                { type: 'mixed_level3', count: 7 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1400,
            groundMargin: 55,
            bgClass: 'Level7Background',
        },
        8: {
            waves: [
                { type: 'skeleton_white', count: 7 },
                { type: 'demon', count: 6 },
                { type: 'mixed_level3', count: 5 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1300,
            groundMargin: 55,
            bgClass: 'Level8Background',
        },
        9: {
            waves: [
                { type: 'skeleton_yellow', count: 5 },
                { type: 'arcane_archer', count: 7 },
                { type: 'mixed_level3', count: 8 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1200,
            groundMargin: 55,
            bgClass: 'Level9Background',
        },
        10: {
            waves: [
                { type: 'skeleton_yellow', count: 11 },
                { type: 'arcane_archer', count: 8 },
                { type: 'mixed_level3', count: 13 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1000,
            groundMargin: 55,
            bgClass: 'Level10Background',
        },
        11: {
            waves: [
                { type: 'skeleton_white', count: 7 },
                { type: 'flying', count: 8 },
                { type: 'mixed_level1', count: 5 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 2200,
            groundMargin: 45,
            bgClass: 'Background',
        },
        12: {
            waves: [
                { type: 'demon', count: 9 },
                { type: 'skeleton_yellow', count: 10 },
                { type: 'mixed_level2', count: 11 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 2000,
            groundMargin: 55,
            bgClass: 'Level2Background',
        },
        13: {
            waves: [
                { type: 'skeleton_white', count: 11 },
                { type: 'arcane_archer', count: 9 },
                { type: 'mixed_level3', count: 12 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1800,
            groundMargin: 55,
            bgClass: 'Level3Background',
        },
        14: {
            waves: [
                { type: 'skeleton_yellow', count: 16 },
                { type: 'arcane_archer', count: 12 },
                { type: 'mixed_level3', count: 10 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1600,
            groundMargin: 55,
            bgClass: 'Level4Background',
        },
        15: {
            waves: [
                { type: 'demon', count: 15 },
                { type: 'arcane_archer', count: 15 },
                { type: 'mixed_level3', count: 17 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1400,
            groundMargin: 55,
            bgClass: 'Level5Background',
        },
        16: {
            waves: [
                { type: 'skeleton_yellow', count: 16 },
                { type: 'mixed_level2', count: 16 },
                { type: 'mixed_level3', count: 17 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1300,
            groundMargin: 55,
            bgClass: 'Level6Background',
        },
        17: {
            waves: [
                { type: 'flying', count: 12 },
                { type: 'arcane_archer', count: 9 },
                { type: 'mixed_level3', count: 13 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1200,
            groundMargin: 55,
            bgClass: 'Level7Background',
        },
        18: {
            waves: [
                { type: 'skeleton_white', count: 17 },
                { type: 'demon', count: 21 },
                { type: 'mixed_level3', count: 13 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1100,
            groundMargin: 55,
            bgClass: 'Level8Background',
        },
        19: {
            waves: [
                { type: 'skeleton_yellow', count: 17 },
                { type: 'arcane_archer', count: 17 },
                { type: 'mixed_level3', count: 14 },
                { type: 'boss', count: 1 },
            ],
            enemyInterval: 1000,
            groundMargin: 55,
            bgClass: 'Level9Background',
        },
        20: {
            waves: [
                { type: 'mixed_level3', count: 25 },
                { type: 'boss', count: 1 }, // Amarjeet final-final encounter
            ],
            enemyInterval: 800,
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
                prologue: "🌌 PROLOGUE — SINGULARITY KI SHURUWAAT\n\nSamay shuru hone se pehle, brahmand ki raksha Ten Dimensional Realms karte the. Har ek realm me brahmand ke core ka ek tukda tha jo reality ko control me rakhta tha.\n\nIn realms ke beech me ek rakshak khada tha:\n\nAMARJEET\n\n\"The Keeper of Infinity\"\n\nWoh bura nahi tha. Usne lakho saalo tak duniya ko bachaya.\n\nLekin ek din...\n\nEk shaktishali dushman THE VOID EMPEROR ne reality par hamla kar diya.\n\nBrahmand ko bachane ke liye, Amarjeet ne apne andar ki forbidden energy se use seal kar diya.\n\nSeal toh ho gaya, par is energy ne Amarjeet ko badal diya.\n\nUske seene me ek black singularity ban gayi, jo dheere dheere uske dimaag ko khane lagi.\n\nAur woh ban gaya—\n\nAMARJEET DA BLACK HOLE\nReality ko nigalne wala\n\nAb woh saare realms ko ek bade black hole me milana chahta hai.\n\nSirf 4 heroes bache hain:\n\nSHINOBI\nJOTEM\nSHAIA\nARCHDEMON\n\nPurani bhavishyavani kehti hai:\n\n\"Jab andhera taaro ko nigal lega,\ntoh srishti ki shakh anantata ko chir degi.\"\n\nSirf World Tree Stick hi Amarjeet ki singularity ko khatam kar sakti hai.",
                1: "LEVEL 1 — SHADOW CITY\n\nEk pyara shahar jo ab Amarjeet ke andhere me doob chuka hai. Neon lights band ho gayi hain aur har gali me chhaya ka raj hai. Iske beech me khada hai SHADOW LORD, Amarjeet ka pehla senapati. Use harao aur aage badho.",
                2: "LEVEL 2 — SPIDER FOREST\n\nYeh jungle purana hai par ab yahan sirf makdi ke jale hain. Trees ab ugte nahi, sirf consume karte hain. Yahan MECHA-STONE khada hai, jise Amarjeet ne reprogram kiya hai. Jalo ko kaato aur aage badho.",
                3: "LEVEL 3 — HALLOWEEN HOUSE\n\nEk purani bhootaha jhopdi jahan gravity ajeeb tarike se behave karti hai. Amarjeet ki energy ne yahan ki aatmao ko qaid kar rakha hai. DRAGON LORD yahan ka pehra de raha hai. Aatmao ko aazad karo aur aage badho.",
                4: "LEVEL 4 — HAUNTED GRAVEYARD\n\nTum ek kabristan me ho. Yahan ki aatmao ke paas ek raaz hai jo Amarjeet chhupana chahta hai. MINO BOSS is portal ka pehredar hai. Use harao taaki aatmaein sach bol sakein.",
                5: "LEVEL 5 — MUSHROOM GROVE\n\nPehle chapter ka aakhri hissa. Chamakdar kukurmutto ka jungle jahan THE IMPALER tumhara rasta rok raha hai. Use harao, World Tree Stick ko haasil karo, aur Amarjeet se pehli baar samna karo.",
                6: "LEVEL 6 — CRYSTAL CAVERNS\n\nAmarjeet dusre dimension me bhaag gaya hai. Tum bhi uske peeche aaye ho. Yeh gufaayein chamak rahi hain par crystals keh rahe hain: 'Void Emperor jaag raha hai...' CRYSTAL TITAN ko harao aur sach dhoondo.",
                7: "LEVEL 7 — SKY TEMPLE\n\nHawa me tairte islands aur tufan. Yeh mandir sabhi dimensions ke beech me hai. Amarjeet ke past ke baare me kuch pata chal raha hai. STORM SERAPH ko harao aur aage badho.",
                8: "LEVEL 8 — FROZEN ABYSS\n\nBaraf ke neeche ek dragon so raha hai. FROST WYRM iske raaz ki raksha karta hai. Aasman me ek badi aankh khul rahi hai. Amarjeet ka seal kamzor ho raha hai. Frost Wyrm ko jald se jald harao.",
                9: "LEVEL 9 — VOID KINGDOM\n\nSpace toot raha hai aur ban raha hai. Tumhe Amarjeet ki yaadein dikh rahi hain—ek sachha rakshak jo ab shaitan ban chuka hai. ABYSS KNIGHT ko harao taaki aakhri rasta khul sake.",
                10: "LEVEL 10 — EDGE OF REALITY\n\nYahan sab khatam hoga. Brahmand toot raha hai, taare gayab ho rahe hain. Amarjeet Da Black Hole tumhara intezar kar raha hai taaki koi use is dard se aazad kar sake. World Tree Stick taiyar hai. Chalo shuru karein.",
                11: "LEVEL 11 — SHADOW CITY II\n\nAndhera aur gehra ho gaya hai. Purane raste ab aur mushkil hain. Shadow Lord ka naya roop tumhara rasta rok raha hai. Himmat mat harna!",
                12: "LEVEL 12 — SPIDER FOREST II\n\nJungle ki makdiyan ab aur aakramak ho gayi hain. Mecha-Stone firse khada ho gaya hai naye upgrades ke sath. Is lohe ke pahad ko tod do!",
                13: "LEVEL 13 — HALLOWEEN HOUSE II\n\nHunted house me aatmao ka rona aur tez ho gaya hai. Dragon Lord ki taqat dugni ho gayi hai. Uske gusse se bacho!",
                14: "LEVEL 14 — HAUNTED GRAVEYARD II\n\nKabristan me ab tufan chal raha hai. Mino Boss naye hathiyar ke sath wapas aa gaya hai. Apne dhal ko taiyar rakho!",
                15: "LEVEL 15 — MUSHROOM GROVE II\n\nToxic spores hawa me phaile hain. Impaler is baar bina kisi reham ke hamla karega. Stick ki taqat ka istemal karo!",
                16: "LEVEL 16 — CRYSTAL CAVERNS II\n\nCrystals ab laal rang me chamak rahe hain. Crystal Titan ka gussa brahmand ko hila raha hai. Uske crystals ko shattered kar do!",
                17: "LEVEL 17 — SKY TEMPLE II\n\nTufan ab out of control hai. Storm Seraph bijliyo ke sath aage badh raha hai. Aasman ki taqat ko chunauti do!",
                18: "LEVEL 18 — FROZEN ABYSS II\n\nBaraf ka tapman ab absolute zero tak pahunch gaya hai. Frost Wyrm tumhe jamane ke liye taiyar hai. Apni aag ko jalaye rakho!",
                19: "LEVEL 19 — VOID KINGDOM II\n\nReality ab khatam hone ki kagar par hai. Space me glitch chal rahe hain. Abyss Knight aakhri deewar ban kar khada hai.",
                20: "LEVEL 20 — ULTIMATE SHOWDOWN\n\nBrahmand ka aakhri pal. Amarjeet apni puri taqat se reality ko black hole me khinch raha hai. World Tree Stick ko uski singularity me dalo aur sab kuch bachao!"
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
                10: "asset/main-villan-of-stoory/amarjeet-da-blackhole.png",
                11: "asset/boss-level1/idle/idle_0.png",
                12: "asset/MECHA-stone/Character_sheet.png",
                13: "asset/demon-lord-bosslevel2/dragon_lord_idle_basic_74x74.png",
                14: "asset/mino/idle/idle_1.png",
                15: "asset/level-5-bossImpaler/idle/idle1.png",
                16: "asset/boss-level1/idle/idle_0.png",
                17: "asset/demon-lord-bosslevel2/dragon_lord_idle_basic_74x74.png",
                18: "asset/mino/idle/idle_1.png",
                19: "asset/level-5-bossImpaler/idle/idle1.png",
                20: "asset/main-villan-of-stoory/amarjeet-da-blackhole.png"
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
                10: "AMARJEET DA BLACK HOLE",
                11: "SHADOW LORD",
                12: "MECHA-STONE",
                13: "DRAGON LORD",
                14: "MINO BOSS",
                15: "THE IMPALER",
                16: "CRYSTAL TITAN",
                17: "STORM SERAPH",
                18: "FROST WYRM",
                19: "THE ABYSS KNIGHT",
                20: "AMARJEET DA BLACK HOLE"
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
                    10: "LEVEL 10: EDGE OF REALITY",
                    11: "LEVEL 11: SHADOW CITY II",
                    12: "LEVEL 12: SPIDER FOREST II",
                    13: "LEVEL 13: HALLOWEEN HOUSE II",
                    14: "LEVEL 14: HAUNTED GRAVEYARD II",
                    15: "LEVEL 15: MUSHROOM GROVE II",
                    16: "LEVEL 16: CRYSTAL CAVERNS II",
                    17: "LEVEL 17: SKY TEMPLE II",
                    18: "LEVEL 18: FROZEN ABYSS II",
                    19: "LEVEL 19: VOID KINGDOM II",
                    20: "LEVEL 20: ULTIMATE SHOWDOWN"
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
                    { speaker: 'hero', name: H, text: "Samne aao, Amarjeet!" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Main woh hoon jo taaro ke marne ke baad bachta hai. Mere Shadow Lord ka samna karo." }
                ],
                2: [
                    { speaker: 'hero', name: H, text: "Tumne is duniya ko barbad kar diya." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Nahi. Samay ne ise barbad kiya. Main toh bas anjam ko tez kar raha hoon." },
                    { speaker: 'hero', name: H, text: "Kismat ko badla ja sakta hai." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Toh phir badal kar dikhao." }
                ],
                3: [
                    { speaker: 'hero', name: H, text: "Logon ko itna dard kyun de rahe ho?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Dard se hi asli taqat aati hai." },
                    { speaker: 'hero', name: H, text: "Toh tumhari taqat laashon par bani hai." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Samrajya hamesha aise hi bante hain." }
                ],
                4: [
                    { speaker: 'hero', name: H, text: "Yeh kabristan shant nahi hai." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Murdo ki aawazein. Fuzul ka shor." }
                ],
                5: [
                    { speaker: 'hero', name: H, text: "Is kahani ka aakhri tukda." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Impaler tumhara intezar kar raha hai." }
                ],
                6: [
                    { speaker: 'hero', name: H, text: "Yeh crystals ajeeb aawazein nikal rahe hain." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Unhe mat suno. Crystal Titan ko khatam karo." }
                ],
                7: [
                    { speaker: 'hero', name: H, text: "Mujhe sach batao." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Main monster isliye bana taaki reality zinda reh sake." },
                    { speaker: 'hero', name: H, text: "Tumhari wajah se lakho log mare." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Lakho mare taaki karodo zinda reh sakein." }
                ],
                8: [
                    { speaker: 'hero', name: H, text: "Yahan ek purana dragon so raha hai." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Dekhte hain tum use jaga pate ho ya nahi." }
                ],
                9: [
                    { speaker: 'hero', name: H, text: "Tum ek rakshak the..." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Haan, tha." },
                    { speaker: 'hero', name: H, text: "Toh wapas aa jao." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Singularities ka koi wapas aana nahi hota." }
                ],
                10: [
                    { speaker: 'hero', name: H, text: "Yeh abhi khatam hoga." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Maine prarthana ki thi ki koi mere jitna shaktishali aaye jo mujhe rok sake." },
                    { speaker: 'hero', name: H, text: "Toh ladna band karo." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Agar main gira... toh Void Emperor jaag jayega." },
                    { speaker: 'hero', name: H, text: "We'll face him together." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Tumhe abhi bhi umeed par bharosa hai..." },
                    { speaker: 'hero', name: H, text: "Always." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Toh dikhao mujhe... ki umeed anantata se zyada shaktishali hai." }
                ],
                11: [
                    { speaker: 'hero', name: H, text: "Shadows firse wapas aa gayi hain!" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Andhera kabhi puri tarah khatam nahi hota." }
                ],
                12: [
                    { speaker: 'hero', name: H, text: "Yeh machine abhi bhi chal rahi hai?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Koshish karte raho, loha aur pathar dard nahi maante." }
                ],
                13: [
                    { speaker: 'hero', name: H, text: "Dragon Lord abhi bhi gussa hai." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Uski aag ko bujhana aasan nahi hoga." }
                ],
                14: [
                    { speaker: 'hero', name: H, text: "Mino Boss, tumne pehli baar me sabak nahi seekha?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Kuch seekhne ke liye zinda rehna zaroori hai." }
                ],
                15: [
                    { speaker: 'hero', name: H, text: "Stick mere sath hai, Impaler!" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Par kya tum iski puri taqat use kar paoge?" }
                ],
                16: [
                    { speaker: 'hero', name: H, text: "Crystal Titan, tumhara naya rang ajeeb hai." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Yeh rang aakhri tabahi ka hai." }
                ],
                17: [
                    { speaker: 'hero', name: H, text: "Is tufan ko main rok ke rahunga!" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Tufan ko rokna matlab hawa ko qaid karna." }
                ],
                18: [
                    { speaker: 'hero', name: H, text: "Yahan thand bohot badh gayi hai." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Yeh tumhari aakhri thand hogi." }
                ],
                19: [
                    { speaker: 'hero', name: H, text: "Reality toot rahi hai, Amarjeet!" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Toh chalo is toote hue jahan me aakhri baar ladein." }
                ],
                20: [
                    { speaker: 'hero', name: H, text: "Yeh aakhri jung hai!" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "World Tree Stick ko mere dil me dalo... is singularity ko shant karo!" }
                ]
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

            const dialogueDb = {
                1: [
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Ek aur rakshak gir gaya." },
                    { speaker: 'hero', name: H, text: "Tum kaun ho?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Main woh hoon jo taaro ke marne ke baad bachta hai." },
                    { speaker: 'hero', name: H, text: "Toh main tumhara anth banunga." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Badi baatein. Dekhte hain kya yeh gravity ke samne tik pati hain." },
                ],
                2: [
                    { speaker: 'boss', name: bName, text: "SYSTEM ERROR..." },
                    { speaker: 'hero', name: H, text: "Machine barbad ho gayi." }
                ],
                3: [
                    { speaker: 'boss', name: bName, text: "Nahi... aatmaein..." },
                    { speaker: 'hero', name: H, text: "Woh ab aazad hain." }
                ],
                4: [
                    { speaker: 'boss', name: "SPIRIT", text: "World Tree ko dhoondo. Lakdi hi infinity ki dushman hai." },
                    { speaker: 'hero', name: H, text: "Lakdi ek black hole ko hara sakti hai?" },
                    { speaker: 'boss', name: "SPIRIT", text: "Srishti hi tabahi ko hara sakti hai." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "..." }
                ],
                5: [
                    { speaker: 'hero', name: H, text: "[WORLD TREE STICK mil gayi]" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Asambhav... Woh shakh abhi bhi zinda hai." },
                    { speaker: 'hero', name: H, text: "Tumhara raj ab khatam." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Nahi. Yeh toh bas shuruwaat hai." },
                ],
                6: [
                    { speaker: 'hero', name: H, text: "Void Emperor kaun hai?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Woh jisse main bhi darta hoon." },
                    { speaker: 'hero', name: H, text: "Tum kisi se darte ho?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Dar ne hi mujhe aisa banaya." },
                ],
                7: [
                    { speaker: 'boss', name: bName, text: "Tufan... shant..." },
                    { speaker: 'hero', name: H, text: "Hum aage badhenge." }
                ],
                8: [
                    { speaker: 'boss', name: "UNKNOWN VOICE", text: "Amarjeet... tumhara seal kamzor ho raha hai." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Peeche hato. Jo aa raha hai tum usse nahi lad sakte." }
                ],
                9: [
                    { speaker: 'boss', name: bName, text: "Void mujhe wapas bula raha hai..." },
                    { speaker: 'hero', name: H, text: "Edge of Reality ki taraf." }
                ],
                10: [
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Shukriya... Rakshak..." },
                    { speaker: 'hero', name: H, text: "Rakshak?" },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Ab tum reality ke naye protector ho." },
                ],
                11: [
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Kamyabi... par kab tak?" },
                    { speaker: 'hero', name: H, text: "Jab tak main zinda hoon." }
                ],
                12: [
                    { speaker: 'boss', name: bName, text: "SYSTEM REBOOT FAILED..." },
                    { speaker: 'hero', name: H, text: "Firse kooda ban gaya." }
                ],
                13: [
                    { speaker: 'boss', name: bName, text: "Aag... thandi..." },
                    { speaker: 'hero', name: H, text: "Apne papo ke sath thande ho jao." }
                ],
                14: [
                    { speaker: 'boss', name: "SPIRIT", text: "Singularity ki core ko target karna." },
                    { speaker: 'hero', name: H, text: "Samajh gaya." }
                ],
                15: [
                    { speaker: 'hero', name: H, text: "World Tree Stick ab aur chamak rahi hai." },
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Yeh iski aakhri chamak hogi." },
                ],
                16: [
                    { speaker: 'boss', name: bName, text: "Crystals... shattered..." },
                    { speaker: 'hero', name: H, text: "Ab aage ki baari." }
                ],
                17: [
                    { speaker: 'boss', name: bName, text: "Storm clear..." },
                    { speaker: 'hero', name: H, text: "Brahmand ab saaf dikh raha hai." }
                ],
                18: [
                    { speaker: 'boss', name: "UNKNOWN VOICE", text: "Seal tootne wala hai..." },
                    { speaker: 'hero', name: H, text: "Hum use bachayenge." }
                ],
                19: [
                    { speaker: 'boss', name: bName, text: "Rasta khul gaya..." },
                    { speaker: 'hero', name: H, text: "Aakhri samna." }
                ],
                20: [
                    { speaker: 'amarjeet', name: "AMARJEET", text: "Shukriya... tumne brahmand ko bacha liya... ab main chain se so sakta hoon..." },
                    { speaker: 'hero', name: H, text: "Alvida, Amarjeet..." },
                ]
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
                if (
                    e.target.tagName === 'INPUT' ||
                    e.target.tagName === 'TEXTAREA' ||
                    e.target.isContentEditable
                ) {
                    return;
                }
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

            // Multiplayer Properties
            this.isMultiplayer = false;
            this.playerId = null;
            this.username = null;
            this.players = new Map();
            this.projectiles = [];
            this.loot = [];
            this.pvpWinnerId = null;
            this.serverState = null;
            this.cameraX = 0;

            this._init();

        }

        get currentHP() {
            return this._currentHP;
        }
        set currentHP(value) {
            if (this.player && this.player.shieldActive && value < this._currentHP) {
                this.spawnHitSparks(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 'cyan');
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
            if (this.playerId) {
                this.player.id = this.playerId;
            }
            this.cameraX = 0;

            // Update virtual gamepad theme colors matching selected player character
            const vContainer = document.getElementById('virtual-controls');
            if (vContainer && this.player) {
                vContainer.style.setProperty('--q-color', this.player.qColor || '#00e5ff');
                vContainer.style.setProperty('--e-color', this.player.eColor || '#00e5ff');
                vContainer.style.setProperty('--r-color', this.player.rColor || '#00e5ff');

                const hexToRgb = (hex) => {
                    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
                    return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : '0, 229, 255';
                };
                vContainer.style.setProperty('--q-color-rgb', hexToRgb(this.player.qColor || '#00e5ff'));
                vContainer.style.setProperty('--e-color-rgb', hexToRgb(this.player.eColor || '#00e5ff'));
                vContainer.style.setProperty('--r-color-rgb', hexToRgb(this.player.rColor || '#00e5ff'));
            }

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
            this.hpPickups = [];
            this.hpTimer = 0;
            this.dropbox = null;
            this.dropboxSpawned = false;
            this.dropboxTimer = 0;
            this.activeSpecialMove = null;
            this.specialMoveUses = 0;

            const dboxOverlay = document.getElementById('dropbox-overlay');
            if (dboxOverlay) dboxOverlay.style.display = 'none';
            const sBtn = document.getElementById('vbtn-special');
            if (sBtn) sBtn.style.display = 'none';

            this.waveIndex = 0;
            this.waveDef = [...cfg.waves];
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
            this.scrollSpeed = 0;
        }

        restart() { this._init(); }

        nextLevel() {
            const savedHP = this.currentHP;
            const savedScore = this.score;
            if (this.level >= 20) { this.level = 1; this._init(); return; }
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
                this.waveSpawnedCount++;
                this.waveAnnounce = 'BOSS INCOMING!';
                this.waveAnnTimer = 0;
                this.enemyInterval = 999999;

                // ── Boss dialogue khatam hone ke BAAD hi boss spawn hoga ──
                const spawnBossNow = () => {
                    // Screen shake jab dialogue khatam ho
                    this.shake = 450;

                    // BGM band karo, boss intro music bajao
                    if (this.audio) {
                        this.audio.stopBGM();
                        this.audio.playBossIntro();
                    }

                    const lvlMod = this.level % 10 || 10;
                    let newBoss;
                    if (lvlMod === 10) {
                        newBoss = new BossEnemy(this, 'amarjeet'); // Level 10 & 20: Final Boss
                    } else if (lvlMod === 9) {
                        newBoss = new BossEnemy(this, 'abyss_knight'); // Level 9 & 19: Abyss Knight
                    } else if (lvlMod === 8) {
                        newBoss = new BossEnemy(this, 'frost_wyrm'); // Level 8 & 18: Frost Wyrm
                    } else if (lvlMod === 7) {
                        newBoss = new BossEnemy(this, 'storm_seraph'); // Level 7 & 17: Storm Seraph
                    } else if (lvlMod === 6) {
                        newBoss = new BossEnemy(this, 'crystal_titan'); // Level 6 & 16: Crystal Titan
                    } else if (lvlMod === 5) {
                        newBoss = new BossEnemy(this, 'impaler'); // Level 5 & 15: Impaler
                    } else if (lvlMod === 4) {
                        newBoss = new MinoBoss(this);         // Level 4 & 14: Mino boss
                    } else if (lvlMod === 3) {
                        newBoss = new BossEnemy(this, 'demon_lord'); // Level 3 & 13: Demon Lord
                    } else if (lvlMod === 2) {
                        newBoss = new BossEnemy(this, 'mecha_stone'); // Level 2 & 12: Mecha Stone
                    } else {
                        newBoss = new BossEnemy(this, 'boss_level_1'); // Level 1 & 11: default
                    }

                    // Boss ko introLocked mode mein spawn karo
                    newBoss.introLocked = true;
                    newBoss.introTimer = 0;
                    // FIX: comment said "2 sec khada raho" but value was 100ms — bumped to a real 2000ms
                    newBoss.introDuration = 2000; // 2 sec khada raho, phir roar
                    newBoss.introRoarPlayed = false;
                    this.enemies.push(newBoss);
                };

                // Trigger Pre-Boss Dialogue cutscene — boss spawn dialogue ke baad!
                if (this.storyDialogueManager) {
                    this.storyDialogueManager.startPreBossDialogue(this.level);
                    this.storyDialogueManager.onCompleteCallback = spawnBossNow;
                } else {
                    // Agar dialogue manager nahi hai to seedha spawn karo
                    spawnBossNow();
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
            const baseMultiplier = 85;
            const displayVal = Math.round(amount * baseMultiplier + (Math.random() - 0.5) * 60);

            const isCrit = amount > 12 || Math.random() < 0.3;

            const vx = (Math.random() - 0.5) * 4;
            const vy = -7 - Math.random() * 4;
            const gravity = 0.38;
            const angle = (Math.random() - 0.5) * 0.28;

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
                scale: 1.8,
                life: 900,
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

        hurtPlayer(damage, isBossKill = false) {
            if (this.hitCooldown > 0) return false;
            const player = this.player;
            if (!player || player.isDead) return false;

            if (player.shieldActive) {
                this.spawnHitSparks(
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    'cyan'
                );
                if (this.audio) this.audio.playSFX('punch');
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

        // Hurt a specific player object (used in multiplayer to hurt nearest target)
        hurtTargetPlayer(targetPlayer, damage, isBossKill = false) {
            if (!targetPlayer || targetPlayer.isDead) return false;
            // If the target is our local player, use standard hurtPlayer
            if (targetPlayer === this.player) {
                return this.hurtPlayer(damage, isBossKill);
            }
            // Remote player — send damage via server
            if (this.isMultiplayer && this.socket) {
                this.socket.emit('playerTakeDamage', { playerId: targetPlayer.id, damage: damage });
                return true;
            }
            return false;
        }

        // Check if a circular projectile hits any player; hurt the first one it touches
        // Returns true if a player was hit
        checkPlayerHit(projX, projY, radius, damage, isBossKill = false) {
            // Always check local player first
            const localHit = (() => {
                const pl = this.player;
                if (!pl || pl.isDead) return false;
                const pLeft = pl.x + pl.width * 0.25;
                const pRight = pl.x + pl.width * 0.75;
                const pTop = pl.y;
                const pBottom = pl.y + pl.height;
                const cx = Math.max(pLeft, Math.min(projX, pRight));
                const cy = Math.max(pTop, Math.min(projY, pBottom));
                const dist = Math.hypot(projX - cx, projY - cy);
                if (dist < radius) {
                    this.hurtPlayer(damage, isBossKill);
                    return true;
                }
                return false;
            })();
            return localHit;
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

        // Returns nearest living player — in multiplayer this considers all players so enemies target any player
        getTargetPlayer(enemyX) {
            if (!this.isMultiplayer || !this.players || this.players.size <= 1) {
                return this.player;
            }
            let nearest = this.player;
            let minDist = Infinity;
            this.players.forEach(p => {
                if (p.isDead) return;
                const dist = Math.abs((p.x + (p.width || 0) / 2) - enemyX);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = p;
                }
            });
            return nearest || this.player;
        }

        spawnEnemyFromType(type, x, y) {
            let enemy;
            if (type === 'flying') {
                enemy = new FlyingEnemy(this);
            } else if (type === 'skeleton_white' || type === 'demon' || type === 'skeleton_yellow' || type === 'arcane_archer') {
                enemy = new GroundEnemy(this, type);
            } else if (type === 'mino_boss' || type === 'mino' || type === 'minoboss') {
                enemy = new MinoBoss(this);
            } else {
                const bossTypeMap = {
                    'boss_level_1': 'boss_level_1',
                    'mecha_stone': 'mecha_stone',
                    'demon_lord': 'demon_lord',
                    'impaler': 'impaler',
                    'crystal_titan': 'crystal_titan',
                    'storm_seraph': 'storm_seraph',
                    'frost_wyrm': 'frost_wyrm',
                    'abyss_knight': 'abyss_knight',
                    'amarjeet': 'amarjeet',
                    'boss': 'boss_level_1'
                };
                const bossType = bossTypeMap[type] || 'boss_level_1';
                enemy = new BossEnemy(this, bossType);
            }
            if (enemy) {
                enemy.x = x;
                enemy.y = y;
            }
            return enemy;
        }

        spawnCoinPickup(fromX, fromY, count) {
            const groundY = this.height - this.groundMargin - 10;
            const hudX = 86;
            const hudY = 110;
            const numTokens = Math.min(count, 8);
            for (let i = 0; i < numTokens; i++) {
                const sx = fromX + (Math.random() - 0.5) * 60;
                const sy = fromY;
                const vx = (Math.random() - 0.5) * 3.5;
                const vy = -(Math.random() * 3 + 1);
                const value = Math.floor(count / numTokens) + (i < (count % numTokens) ? 1 : 0);

                this.coinPickups.push({
                    x: sx, y: sy,
                    vx, vy,
                    gravity: 0.55,
                    bounced: false,
                    groundY,
                    sx: 0, sy: 0,
                    cpx: 0, cpy: 0,
                    hudX, hudY,
                    phase: 1,
                    value,
                    flyDelay: 120 + i * 80,
                    flyDelayTimer: 0,
                    t: 0,
                    flySpeed: 0.026 + Math.random() * 0.01,
                    size: 7 + Math.random() * 4,
                    alpha: 1,
                    done: false,
                });
            }
        }

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

        spawnHpPickup(fromX, fromY) {
            const groundY = this.height - this.groundMargin - 10;
            const hudX = 166;
            const hudY = 49;
            const sx = fromX;
            const sy = fromY;
            const vx = (Math.random() - 0.5) * 3.5;
            const vy = -(Math.random() * 3.5 + 2);

            this.hpPickups.push({
                x: sx, y: sy,
                vx, vy,
                gravity: 0.55,
                bounced: false,
                groundY,
                sx: 0, sy: 0,
                cpx: 0, cpy: 0,
                hudX, hudY,
                phase: 1,
                value: 20,
                flyDelay: 120,
                flyDelayTimer: 0,
                t: 0,
                flySpeed: 0.024 + Math.random() * 0.008,
                size: 9 + Math.random() * 3,
                alpha: 1,
                life: 5000,
                done: false,
            });
        }

        drawHpPickups(context) {
            if (!this.hpPickups || this.hpPickups.length === 0) return;
            this.hpPickups.forEach(c => {
                if (c.done) return;
                context.save();
                context.globalAlpha = Math.max(0, Math.min(1, c.alpha));

                // Outer glow
                context.shadowColor = '#ff2b55';
                context.shadowBlur = 12;

                // Heart body gradient
                const grad = context.createRadialGradient(c.x, c.y - c.size * 0.2, 0, c.x, c.y - c.size * 0.2, c.size * 1.2);
                grad.addColorStop(0, '#ff9ebb');
                grad.addColorStop(0.4, '#ff2b55');
                grad.addColorStop(1, '#990022');

                context.beginPath();
                const topY = c.y - c.size * 0.2;
                context.moveTo(c.x, topY);
                // Top-left arc
                context.bezierCurveTo(c.x - c.size * 0.6, topY - c.size * 0.6, c.x - c.size * 1.3, topY + c.size * 0.1, c.x, c.y + c.size * 0.9);
                // Top-right arc
                context.bezierCurveTo(c.x + c.size * 1.3, topY + c.size * 0.1, c.x + c.size * 0.6, topY - c.size * 0.6, c.x, topY);
                context.fillStyle = grad;
                context.fill();

                // Inner shine
                context.shadowBlur = 0;
                context.beginPath();
                context.arc(c.x - c.size * 0.3, c.y - c.size * 0.3, c.size * 0.2, 0, Math.PI * 2);
                context.fillStyle = 'rgba(255,255,255,0.6)';
                context.fill();

                context.restore();
            });
        }

        showDropboxCards() {
            this.paused = true;
            const overlay = document.getElementById('dropbox-overlay');
            if (!overlay) return;
            overlay.style.display = 'flex';

            const cardCoins = document.getElementById('card-coins');
            const cardKam = document.getElementById('card-kamehameha');
            const cardRas = document.getElementById('card-rasengan');

            const closeCardOverlay = () => {
                overlay.style.display = 'none';
                this.paused = false;
                if (this.dropbox) this.dropbox.markedForDeletion = true;
            };

            if (cardCoins) {
                cardCoins.onclick = () => {
                    this.coins += 50;
                    localStorage.setItem('gameCoins', this.coins.toString());
                    this.coinHUDFlash = Math.max(this.coinHUDFlash, 350);
                    if (this.audio) {
                        this.audio.playSFX('coin_collect');
                    }
                    this._addFloatingText(this.player.x + this.player.width / 2, this.player.y - 10, '+500 COINS', '#ffd700');
                    closeCardOverlay();
                };
            }

            if (cardKam) {
                cardKam.onclick = () => {
                    this.activeSpecialMove = 'kamehameha';
                    this.specialMoveUses = 1;
                    this._addFloatingText(this.player.x + this.player.width / 2, this.player.y - 10, 'KAMEHAMEHA UNLOCKED', '#00e5ff');

                    const specialBtn = document.getElementById('vbtn-special');
                    const specialLabel = document.getElementById('vbtn-special-label');
                    if (specialBtn && specialLabel) {
                        specialBtn.style.display = 'flex';
                        specialBtn.style.background = 'linear-gradient(135deg, #00b0ff 0%, #120e1c 100%)';
                        specialBtn.style.borderColor = '#00e5ff';
                        specialBtn.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.4)';
                        specialLabel.innerText = 'KAMEHAMEHA';
                    }
                    closeCardOverlay();
                };
            }

            if (cardRas) {
                cardRas.onclick = () => {
                    this.activeSpecialMove = 'rasengan';
                    this.specialMoveUses = 1;
                    this._addFloatingText(this.player.x + this.player.width / 2, this.player.y - 10, 'RASENGAN UNLOCKED', '#ea80fc');

                    const specialBtn = document.getElementById('vbtn-special');
                    const specialLabel = document.getElementById('vbtn-special-label');
                    if (specialBtn && specialLabel) {
                        specialBtn.style.display = 'flex';
                        specialBtn.style.background = 'linear-gradient(135deg, #7b1fa2 0%, #120e1c 100%)';
                        specialBtn.style.borderColor = '#ea80fc';
                        specialBtn.style.boxShadow = '0 0 15px rgba(234, 128, 252, 0.4)';
                        specialLabel.innerText = 'RASENGAN';
                    }
                    closeCardOverlay();
                };
            }
        }

        update(deltaTime) {
            if (this.paused) return;

            if (this.storyDialogueManager && this.storyDialogueManager.active) {
                this.storyDialogueManager.update(deltaTime);
                // FIX: multiplayer remote players still need to keep interpolating
                // even while a dialogue/cutscene is active, otherwise they visibly
                // freeze mid-motion for everyone else during cutscenes.
                if (this.isMultiplayer) {
                    this.updateMultiplayerEntities(deltaTime);
                }
                if (!this.isMultiplayer) {
                    return;
                }
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
                    this.levelSelectMode = false;
                    if (this.storyDialogueManager) {
                        this.storyDialogueManager.startLevelIntro(this.level);
                    }
                } else {
                    return;
                }
            }

            // Spawn HP drop every 20 seconds (20000 milliseconds)
            if (!this.levelComplete && !this.gameOver) {
                this.hpTimer += deltaTime;
                if (this.hpTimer >= 20000) {
                    this.hpTimer = 0;
                    const minX = Math.max(50, this.player.x - 100);
                    const maxX = Math.min(this.width - 50, this.player.x + 400);
                    const rx = minX + Math.random() * (maxX - minX);
                    this.spawnHpPickup(rx, -20);
                }
            }

            // Spawn Dropbox after 8 seconds (8000 milliseconds) in each level
            if (!this.levelComplete && !this.gameOver && this.gameStarted) {
                if (!this.dropboxSpawned) {
                    this.dropboxTimer += deltaTime;
                    if (this.dropboxTimer >= 8000) {
                        this.dropboxSpawned = true;
                        const spawnX = Math.min(this.width - 150, Math.max(150, this.player.x + 300));
                        this.dropbox = new Dropbox(this, spawnX, -100);
                    }
                }
            }

            this.scrollSpeed = (this.background && typeof this.background._scrollSpeed === 'function') ? this.background._scrollSpeed() : 0;
            if (this.enemies.some(e => e.isBoss && e.introLocked)) {
                this.scrollSpeed = 0;
            }

            // FIX: this call used to happen at the very top of update(), before
            // this.scrollSpeed was computed for the current frame — meaning remote
            // players were always offset using LAST frame's scroll value, causing a
            // visible one-frame desync/jitter (especially noticeable whenever scroll
            // suddenly changes, e.g. boss intro lock). Moved here so it always uses
            // the freshly computed scrollSpeed.
            if (this.isMultiplayer) {
                this.updateMultiplayerEntities(deltaTime);
            }

            const scrollSpeed = this.scrollSpeed;
            this.cameraX += scrollSpeed;

            this.floatingTexts.forEach(t => { t.x -= scrollSpeed; t.y += t.vy; t.life -= deltaTime * 0.001; });
            this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);

            this.damageTexts.forEach(t => {
                t.life -= deltaTime;
                t.x += t.vx - scrollSpeed;
                t.y += t.vy;
                t.vy += t.gravity * (deltaTime / 16.6);
                const elapsed = t.maxLife - t.life;
                if (elapsed < 150) {
                    t.scale = 1.8 - (elapsed / 150) * 0.8;
                } else {
                    t.scale = 1.0;
                }
            });
            this.damageTexts = this.damageTexts.filter(t => t.life > 0);

            this.particles.forEach(p => {
                p.x += p.vx - scrollSpeed;
                p.y += p.vy;
                if (p.gravity !== undefined) p.vy += p.gravity * (deltaTime / 16.6);
                p.alpha -= deltaTime * 0.002 * (p.fadeSpeedMultiplier || 1.0);
                p.size *= (p.decay !== undefined ? p.decay : 0.95);
                if (p.angle !== undefined) p.angle += (p.va || 0) * (deltaTime / 16.6);
            });
            this.particles = this.particles.filter(p => p.alpha > 0 && p.size > 0.1);

            // Update coin pickup animations
            if (this.coinHUDFlash > 0) this.coinHUDFlash -= deltaTime;

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
                        if (this.audio) {
                            this.audio.playSFX('coin_collect');
                        }
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

            // Update HP pickup animations
            this.hpPickups.forEach(c => {
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

                // 5 seconds lifetime decay while on the ground or falling
                if (c.phase === 1 || c.phase === 2) {
                    c.life -= deltaTime;
                    if (c.life <= 1000) {
                        c.alpha = Math.max(0, c.life / 1000); // fade out in the last 1 second
                    }
                    if (c.life <= 0) {
                        c.done = true;
                    }
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
                        if (this.audio) {
                            this.audio.playSFX('coin_collect');
                        }
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
                        this.currentHP = Math.min(this.maxHP, this.currentHP + c.value);
                    }
                }
            });
            this.hpPickups = this.hpPickups.filter(c => !c.done && c.x > -100);

            if (this.levelComplete || this.gameOver) {
                if (this.gameOver) {
                    this.audio.stopBGM();
                }
                if (this.gameOverTimer < this.gameOverDelay) this.gameOverTimer += deltaTime;
                this.shake = 0;
                this.speed = 0;
                this.background.update();
                if (this.player.isDead) this.player.update(this.input.keys, deltaTime);
                return;
            }

            this.playerHit = false;
            this.background.update();

            // Trigger special drop attack if T is pressed and available
            if (this.input.keys.includes('t') && this.activeSpecialMove && this.specialMoveUses > 0) {
                if (this.activeSpecialMove === 'kamehameha') {
                    // Spawn beam if not already spawning (holding T charges it)
                    if (!this.player.windProjectiles.some(p => p instanceof KamehamehaBeam)) {
                        const startX = this.player.x + (this.player.facingLeft ? -80 : this.player.width + 10);
                        const startY = this.player.y + this.player.height * 0.25;
                        this.player.windProjectiles.push(new KamehamehaBeam(this, startX, startY, this.player.facingLeft));
                    }
                } else if (this.activeSpecialMove === 'rasengan') {
                    // Spawn rasengan if not already spawning (holding T charges it)
                    if (!this.player.windProjectiles.some(p => p instanceof RasenganVortex)) {
                        const startX = this.player.x + (this.player.facingLeft ? -100 : this.player.width + 10);
                        const startY = this.player.y + this.player.height * 0.25;
                        this.player.windProjectiles.push(new RasenganVortex(this, startX, startY, this.player.facingLeft));
                    }
                }
            }

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
                if (wave && this.waveSpawnedCount < this._waveTotal() && (!this.isMultiplayer || this.isHost)) {
                    this.enemyTimer += deltaTime;
                    if (this.enemyTimer > this.enemyInterval) { this._spawnFromWave(); this.enemyTimer = 0; }
                }

                const allSpawned = this.waveSpawnedCount >= this._waveTotal();
                const allDead = this.enemies.every(e => e.markedForDeletion);
                const dialogueActive = this.storyDialogueManager && this.storyDialogueManager.active;
                if (allSpawned && allDead && wave && !this.waveComplete && !dialogueActive && (!this.isMultiplayer || this.isHost)) {
                    this.waveComplete = true;
                    this.waveTransTimer = 0;
                    this.currentHP = Math.min(this.maxHP, this.currentHP + 8);
                }

                if (this.waveComplete && (!this.isMultiplayer || this.isHost)) {
                    this.waveTransTimer += deltaTime;
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

                        let attackRange = 35;
                        if (this.player.characterType === 'jotem') attackRange = 25;
                        else if (this.player.characterType === 'archdemon') attackRange = 55;
                        else if (this.player.characterType === 'shaia') attackRange = 45;

                        let minX, maxX;
                        if (this.player.facingLeft) {
                            minX = this.player.x - attackRange;
                            maxX = this.player.x + this.player.width * 0.3;
                        } else {
                            minX = this.player.x + this.player.width * 0.7;
                            maxX = this.player.x + this.player.width + attackRange;
                        }

                        const attackHit =
                            enemy.x < maxX && enemy.x + enemy.width > minX &&
                            enemy.y < this.player.y + this.player.height && enemy.y + enemy.height > this.player.y;

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
                        this.spawnCoinPickup(e.x + e.width / 2, e.y + e.height * 0.4, coinsEarned);

                    }
                });

                this.enemies = this.enemies.filter(e => !e.markedForDeletion && (e.isBoss || e.x + e.width > -400));

                if (this.portal) {
                    this.portal.update(deltaTime);
                    if (this.portal.markedForDeletion) {
                        this.portal = null;
                    }
                }

                if (this.dropbox) {
                    this.dropbox.update(deltaTime);
                    if (this.dropbox.markedForDeletion) {
                        this.dropbox = null;
                    }
                }
            }
        }

        updateMultiplayerEntities(deltaTime) {
            if (this.players) {
                this.players.forEach(p => {
                    if (p.id === this.playerId) return;

                    // If the camera scrolls, offset remote player target coordinates to stay synchronized
                    if (this.scrollSpeed !== 0) {
                        p.x -= this.scrollSpeed;
                        if (p.targetX !== undefined) p.targetX -= this.scrollSpeed;
                    }

                    const animDelta = this.isMultiplayer ? deltaTime * 0.7 : deltaTime;
                    p.frameTimer += animDelta;
                    if (p.frameTimer >= p.frameInterval) {
                        p.frameTimer = 0;

                        const isDeathState = p.currentState && p.currentState.state === 'DEATH';

                        if (isDeathState) {
                            // One-shot: advance until the last frame, then freeze there
                            if (p.frameX < p.maxFrame) p.frameX++;
                            // else: stay at maxFrame — do NOT reset to 0
                        } else if (p.frameX < p.maxFrame) {
                            p.frameX++;
                        } else {
                            p.frameX = 0; // normal animations (walk, attack, etc.) still loop
                        }
                    }


                    // Smooth interpolate remote players towards target coordinates
                    if (p.targetX !== undefined) {
                        p.x += (p.targetX - p.x) * 0.25;
                        p.y += (p.targetY - p.y) * 0.25;
                    }
                });
            }
        }

        draw(context) {
            if (!this.gameStarted) {
                this.background.draw(context);

                if (this.startTransition) {
                    const progress = Math.min(1, this.startTransitionTimer / this.startTransitionDuration);

                    if (this.levelSelectMode) {
                        context.save();
                        context.globalAlpha = progress;
                        context.fillStyle = 'black';
                        context.fillRect(0, 0, this.width, this.height);
                        context.restore();
                    } else {
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

            if (this.startTransition) {
                const progress = Math.min(1, this.startTransitionTimer / this.startTransitionDuration);
                this.background.draw(context);
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

            // Draw PVP loot items
            if (this.isMultiplayer && this.loot) {
                this.loot.forEach(l => {
                    if (l.pickedUp) return;
                    context.save();
                    context.shadowColor = l.type === 'weapon' ? '#00e5ff' : '#00ff80';
                    context.shadowBlur = 12;
                    context.fillStyle = l.type === 'weapon' ? 'rgba(0, 229, 255, 0.4)' : 'rgba(0, 255, 128, 0.4)';
                    context.strokeStyle = l.type === 'weapon' ? '#00e5ff' : '#00ff80';
                    context.lineWidth = 1.5;
                    context.beginPath();
                    context.roundRect(l.x - 15, l.y - 15, 30, 30, 4);
                    context.fill();
                    context.stroke();

                    context.font = '900 9px "Orbitron"';
                    context.fillStyle = '#fff';
                    context.textAlign = 'center';
                    context.fillText(l.type === 'weapon' ? 'WEAPON' : 'HEAL', l.x, l.y + 3);
                    context.restore();
                });
            }

            if (this.portal) this.portal.draw(context);
            if (this.dropbox) this.dropbox.draw(context);

            if (this.isMultiplayer && this.players) {
                this.players.forEach(p => {
                    p.draw(context);

                    context.save();
                    context.font = 'bold 12px "Orbitron", sans-serif';
                    context.fillStyle = '#00e5ff';
                    context.textAlign = 'center';
                    context.shadowColor = 'rgba(0,0,0,0.8)';
                    context.shadowBlur = 4;
                    let displayName = p.username;
                    if (p.id === this.playerId) {
                        displayName = this.username || 'GUEST';
                    }
                    context.fillText(displayName ? displayName.toUpperCase() : 'GUEST', p.x + p.width / 2, p.y - 12);

                    const barW = 50;
                    const barH = 4;
                    const bx = p.x + p.width / 2 - barW / 2;
                    const by = p.y - 25;
                    context.fillStyle = 'rgba(0,0,0,0.5)';
                    context.fillRect(bx, by, barW, barH);
                    context.fillStyle = p.id === this.playerId ? '#00ff80' : '#ff2244';
                    context.fillRect(bx, by, barW * (p.currentHP / p.maxHP), barH);
                    context.restore();
                });
            } else {
                this.player.draw(context);

                // Draw name above the player in Single-Player
                context.save();
                context.font = 'bold 12px "Orbitron", sans-serif';
                context.fillStyle = '#00e5ff';
                context.textAlign = 'center';
                context.shadowColor = 'rgba(0,0,0,0.85)';
                context.shadowBlur = 4;

                let displayName = 'GUEST';
                if (this.username) {
                    displayName = this.username;
                } else {
                    const savedUser = localStorage.getItem('shadowStrikeUser');
                    if (savedUser) {
                        try {
                            const parsed = JSON.parse(savedUser);
                            if (parsed && parsed.username) displayName = parsed.username;
                        } catch (e) { }
                    }
                }
                context.fillText(displayName.toUpperCase(), this.player.x + this.player.width / 2, this.player.y - 12);
                context.restore();
            }

            this.enemies.forEach(e => e.draw(context));

            // Draw PvP/Coop server-side projectiles
            if (this.isMultiplayer && this.projectiles) {
                this.projectiles.forEach(p => {
                    context.save();
                    if (p.type === 'kamehameha') {
                        context.shadowColor = '#00e5ff';
                        context.shadowBlur = 15;
                        context.fillStyle = '#00e5ff';
                        context.fillRect(p.x, p.y - 10, 120, 20);
                    } else if (p.type === 'rasengan') {
                        context.shadowColor = '#ea80fc';
                        context.shadowBlur = 15;
                        context.fillStyle = '#ea80fc';
                        context.beginPath();
                        context.arc(p.x, p.y, 20, 0, Math.PI * 2);
                        context.fill();
                    } else {
                        context.shadowColor = '#ffa726';
                        context.shadowBlur = 10;
                        context.fillStyle = '#ffa726';
                        context.beginPath();
                        context.arc(p.x, p.y, 8, 0, Math.PI * 2);
                        context.fill();
                    }
                    context.restore();
                });
            }

            if (this.particles.length > 0) {
                this.particles.forEach(p => {
                    const alpha = Math.max(0, Math.min(1, p.alpha));
                    context.globalAlpha = alpha;

                    if (p.type === 'rect') {
                        context.fillStyle = p.color;
                        if (p.angle) {
                            context.save();
                            context.beginPath();
                            context.translate(p.x, p.y);
                            context.rotate(p.angle);
                            context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                            context.restore();
                        } else {
                            context.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                        }
                    } else if (p.type === 'spark') {
                        context.strokeStyle = p.color;
                        context.lineWidth = p.lineWidth || 2;
                        if (p.angle) {
                            context.save();
                            context.beginPath();
                            context.translate(p.x, p.y);
                            context.rotate(p.angle);
                            context.moveTo(-p.size, 0);
                            context.lineTo(p.size, 0);
                            context.moveTo(0, -p.size * 0.45);
                            context.lineTo(0, p.size * 0.45);
                            context.stroke();
                            context.restore();
                        } else {
                            context.beginPath();
                            context.moveTo(p.x - p.size, p.y);
                            context.lineTo(p.x + p.size, p.y);
                            context.moveTo(p.x, p.y - p.size * 0.45);
                            context.lineTo(p.x, p.y + p.size * 0.45);
                            context.stroke();
                        }
                    } else {
                        context.beginPath();
                        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        context.fillStyle = p.color;
                        context.fill();
                    }
                });
                context.globalAlpha = 1.0;
            }

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

                context.lineJoin = 'round';
                context.strokeStyle = '#000000';
                context.lineWidth = t.isCrit ? 8 : 6;
                context.strokeText(t.text, 0, 0);

                const grad = context.createLinearGradient(0, -fontSize / 2, 0, fontSize / 2);
                if (t.isCrit) {
                    grad.addColorStop(0, '#ffff55');
                    grad.addColorStop(0.4, '#ff33aa');
                    grad.addColorStop(1, '#8800ff');
                } else {
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(0.3, '#ffea00');
                    grad.addColorStop(1, '#ff3d00');
                }
                context.fillStyle = grad;
                context.fillText(t.text, 0, 0);

                if (t.badgeText) {
                    context.save();
                    context.translate(0, -fontSize * 0.95);
                    const wiggle = Math.sin(t.life * 0.035) * 2;
                    context.translate(0, wiggle);

                    context.font = '900 13px "Orbitron", "Poppins", sans-serif';
                    context.strokeStyle = '#000000';
                    context.lineWidth = 4;
                    context.strokeText(t.badgeText, 0, 0);

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

            // Draw PvP roster list
            if (this.isMultiplayer && this.serverState && this.serverState.mode === 'pvp') {
                context.save();
                context.font = 'bold 12px "Orbitron", sans-serif';
                context.fillStyle = 'rgba(10, 8, 24, 0.8)';
                context.strokeStyle = 'rgba(0,229,255,0.2)';
                context.lineWidth = 1.5;
                const sx = this.width - 240, sy = 80, sw = 220, sh = 120;
                context.beginPath();
                context.roundRect(sx, sy, sw, sh, 6);
                context.fill();
                context.stroke();

                context.fillStyle = '#00e5ff';
                context.fillText('ARENA PVP ROSTER', sx + 15, sy + 25);

                let idx = 0;
                if (this.players) {
                    this.players.forEach(p => {
                        const py = sy + 48 + idx * 20;
                        context.fillStyle = p.isDead ? 'rgba(255,255,255,0.35)' : '#fff';
                        context.font = p.id === this.playerId ? '900 11px "Orbitron"' : '11px "Poppins"';
                        context.fillText(`${p.username}${p.isDead ? ' (DEAD)' : ''}`, sx + 15, py);

                        context.save();
                        context.textAlign = 'right';
                        context.fillStyle = '#ffd700';
                        context.fillText(`HP: ${Math.round(p.currentHP)}`, sx + sw - 15, py);
                        context.restore();
                        idx++;
                    });
                }
                context.restore();
            }

            context.restore();
            // Draw coin pickups in pure screen-space (outside shake transform)
            this.drawCoinPickups(context);
            this.drawHpPickups(context);
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
            if (this.isMultiplayer) {
                this._drawMultiplayerEnd(context, true);
                return;
            }
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

            const hexToRgba = (hex, alpha) => {
                hex = hex.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };

            // Modern gradient background
            const bgGrad = context.createLinearGradient(0, 0, W, H);
            bgGrad.addColorStop(0, th.dark);
            bgGrad.addColorStop(1, '#020205');
            context.fillStyle = bgGrad;
            context.fillRect(0, 0, W, H);

            // Subtle center glow
            const centerGlow = context.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 500);
            centerGlow.addColorStop(0, th.accentDim);
            centerGlow.addColorStop(1, 'transparent');
            context.fillStyle = centerGlow;
            context.fillRect(0, 0, W, H);

            // Tech grid lines for premium game feel
            context.strokeStyle = 'rgba(255, 255, 255, 0.015)';
            context.lineWidth = 1;
            for (let x = 0; x < W; x += 80) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, H);
                context.stroke();
            }
            for (let y = 0; y < H; y += 80) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(W, y);
                context.stroke();
            }

            // Glowing dust/particles float upwards
            const now = Date.now();
            for (let i = 0; i < 60; i++) {
                const t2 = (now * 0.018 + i * 63.7) % H;
                const x2 = (i * 157 + Math.sin(now * 0.001 + i) * 30 + W) % W;
                const a = 0.1 + 0.18 * Math.sin(now * 0.003 + i * 2.1);
                if (a > 0) {
                    context.save();
                    context.fillStyle = hexToRgba(th.accent, a);
                    context.shadowColor = th.glow;
                    context.shadowBlur = 6;
                    context.beginPath();
                    context.arc(x2, t2, 1.5 + Math.sin(i) * 1.5, 0, Math.PI * 2);
                    context.fill();
                    context.restore();
                }
            }

            // LEVEL CLEARED capsule badge
            const badgeText = `LEVEL ${this.level} CLEARED`;
            context.font = '700 13px "Poppins"';
            const badgeTextW = context.measureText(badgeText).width;
            const badgeW = badgeTextW + 36;
            const badgeH = 30;
            const badgeX = W / 2 - badgeW / 2;
            const badgeY = H / 2 - 146;

            context.save();
            context.fillStyle = hexToRgba(th.accent, 0.07);
            context.shadowColor = th.glow;
            context.shadowBlur = 10;
            rr(context, badgeX, badgeY, badgeW, badgeH, 15);
            context.fill();
            context.shadowBlur = 0;

            context.strokeStyle = hexToRgba(th.accent, 0.45);
            context.lineWidth = 1.5;
            rr(context, badgeX, badgeY, badgeW, badgeH, 15);
            context.stroke();

            context.fillStyle = th.accent;
            context.textAlign = 'center';
            context.fillText(badgeText, W / 2, badgeY + 19);
            context.restore();

            // Large Area Title
            const titles = { 1: 'SHADOW CITY', 2: 'SPIDER FOREST', 3: 'HALLOWEEN HOUSE', 4: 'HAUNTED GRAVEYARD', 5: 'MUSHROOM GROVE', 6: 'CRYSTAL CAVERNS', 7: 'SKY TEMPLE', 8: 'FROZEN ABYSS', 9: 'VOID KINGDOM', 10: 'EDGE OF REALITY' };
            const subTitles = { 1: 'UNLOCKED', 2: 'UNLOCKED', 3: 'UNLOCKED', 4: 'UNLOCKED', 5: 'UNLOCKED', 6: 'UNLOCKED', 7: 'UNLOCKED', 8: 'UNLOCKED', 9: 'UNLOCKED', 10: 'YOU SAVED REALITY!' };

            const levelTitle = titles[this.level] || 'UNKNOWN AREA';
            context.font = '800 60px "Poppins"';
            context.textAlign = 'center';

            const textGrad = context.createLinearGradient(W / 2 - 250, H / 2 - 65, W / 2 + 250, H / 2 - 65);
            textGrad.addColorStop(0, '#ffffff');
            textGrad.addColorStop(0.3, '#ffffff');
            textGrad.addColorStop(0.7, th.accent);
            textGrad.addColorStop(1, th.accent);

            context.save();
            context.shadowColor = th.glow;
            context.shadowBlur = 12;
            context.fillStyle = textGrad;
            context.fillText(levelTitle, W / 2, H / 2 - 65);
            context.restore();

            // UNLOCKED subtitle with framing line accents
            const subText = subTitles[this.level] || 'UNLOCKED';
            context.font = '800 15px "Poppins"';
            context.fillStyle = 'rgba(255, 255, 255, 0.75)';
            context.textAlign = 'center';

            const subTextW = context.measureText(subText).width;
            const lineLength = 60;
            const lineGap = 16;
            const subY = H / 2 - 20;

            context.fillText(subText, W / 2, subY);

            context.strokeStyle = hexToRgba(th.accent, 0.4);
            context.lineWidth = 2;

            // Left horizontal line
            context.beginPath();
            context.moveTo(W / 2 - subTextW / 2 - lineGap - lineLength, subY - 5);
            context.lineTo(W / 2 - subTextW / 2 - lineGap, subY - 5);
            context.stroke();

            // Right horizontal line
            context.beginPath();
            context.moveTo(W / 2 + subTextW / 2 + lineGap, subY - 5);
            context.lineTo(W / 2 + subTextW / 2 + lineGap + lineLength, subY - 5);
            context.stroke();

            // Glassmorphism stats cards
            const hpColor = this.currentHP > 60 ? '#00ffd0' : this.currentHP > 30 ? '#ffaa00' : '#ff2200';
            const cards = [
                { label: 'FINAL SCORE', value: this.score.toLocaleString(), color: '#ffffff', icon: '🏆', cx: W / 2 - 230 },
                { label: 'TOTAL COINS', value: this.coins.toLocaleString(), color: '#ffd700', icon: '🪙', cx: W / 2 },
                { label: 'HP LEFT', value: `${this.currentHP}/${this.maxHP}`, color: hpColor, icon: '❤️', cx: W / 2 + 230 }
            ];

            const cardW = 200;
            const cardH = 100;
            const cardY = H / 2 + 25;

            cards.forEach(c => {
                const cardX = c.cx - cardW / 2;

                // Shadow and base glass card
                context.save();
                context.fillStyle = 'rgba(255, 255, 255, 0.02)';
                context.shadowColor = 'rgba(0, 0, 0, 0.6)';
                context.shadowBlur = 15;
                rr(context, cardX, cardY, cardW, cardH, 14);
                context.fill();
                context.shadowBlur = 0;

                // Subtle inner gradient overlay
                const innerGrad = context.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
                innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
                innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0.005)');
                context.fillStyle = innerGrad;
                rr(context, cardX, cardY, cardW, cardH, 14);
                context.fill();

                // Glowing card border
                context.strokeStyle = hexToRgba(th.accent, 0.22);
                context.lineWidth = 1.5;
                rr(context, cardX, cardY, cardW, cardH, 14);
                context.stroke();

                // Bottom accent line highlight
                context.fillStyle = hexToRgba(th.accent, 0.5);
                rr(context, cardX + 30, cardY + cardH - 4, cardW - 60, 3, 1.5);
                context.fill();

                // Label
                context.font = '700 11px "Poppins"';
                context.fillStyle = 'rgba(255, 255, 255, 0.4)';
                context.textAlign = 'center';
                context.fillText(c.label, c.cx, cardY + 28);

                // Icon and Value
                context.font = '800 22px "Poppins"';
                context.fillStyle = c.color;
                context.shadowColor = hexToRgba(c.color, 0.3);
                context.shadowBlur = 6;
                context.fillText(`${c.icon}  ${c.value}`, c.cx, cardY + 66);
                context.restore();
            });

            // Next area badge
            if (this.level < 10) {
                const nextAreaText = `NEXT LEVEL  ›  ${th.next.toUpperCase()}`;
                context.font = '700 11px "Poppins"';
                const nW = context.measureText(nextAreaText).width + 24;
                const nH = 26;
                const nX = W / 2 - nW / 2;
                const nY = H / 2 + 150;

                context.save();
                context.fillStyle = 'rgba(255, 255, 255, 0.02)';
                rr(context, nX, nY, nW, nH, 6);
                context.fill();

                context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                context.lineWidth = 1;
                rr(context, nX, nY, nW, nH, 6);
                context.stroke();

                context.fillStyle = 'rgba(255, 255, 255, 0.6)';
                context.textAlign = 'center';
                context.fillText(nextAreaText, W / 2, nY + 16);
                context.restore();
            }

            // Pulsing next button
            const btnW = 280;
            const btnH = 54;
            const btnX = W / 2 - btnW / 2;
            const btnY = H / 2 + 190;
            const pulse = 0.96 + Math.sin(now * 0.006) * 0.04;

            context.save();
            context.translate(W / 2, btnY + btnH / 2);
            context.scale(pulse, pulse);
            context.translate(-W / 2, -(btnY + btnH / 2));

            // Outline glow for button
            context.shadowColor = th.glow;
            context.shadowBlur = 18;
            const btnGrad = context.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
            btnGrad.addColorStop(0, th.accent);
            btnGrad.addColorStop(1, th.glow);
            context.fillStyle = btnGrad;
            rr(context, btnX, btnY, btnW, btnH, 14);
            context.fill();
            context.shadowBlur = 0;

            // Highlight glare overlay on button top
            context.fillStyle = 'rgba(255, 255, 255, 0.15)';
            context.beginPath();
            context.roundRect(btnX + 4, btnY + 4, btnW - 8, btnH / 2 - 2, [10, 10, 0, 0]);
            context.fill();

            // Shiny border
            context.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            context.lineWidth = 1.5;
            rr(context, btnX, btnY, btnW, btnH, 14);
            context.stroke();

            // Label text
            context.font = '800 17px "Poppins"';
            context.fillStyle = '#ffffff';
            context.shadowColor = 'rgba(0,0,0,0.3)';
            context.shadowBlur = 4;
            context.textAlign = 'center';
            context.fillText(th.label + '  →', W / 2, btnY + 33);
            context.restore();

            // Footer instructions
            context.font = '11px "Poppins"';
            context.fillStyle = 'rgba(255, 255, 255, 0.25)';
            context.textAlign = 'center';
            context.fillText('Click button to continue', W / 2, H - 24);

            context.restore();
        }

        _drawGameOver(context) {
            if (this.isMultiplayer) {
                this._drawMultiplayerEnd(context, false);
                return;
            }
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

        _drawMultiplayerEnd(context, success) {
            const W = this.width, H = this.height;
            context.save();
            context.fillStyle = 'rgba(10, 8, 20, 0.88)';
            context.fillRect(0, 0, W, H);

            // Title
            context.font = '900 48px "Orbitron", sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            if (this.serverState && this.serverState.mode === 'pvp') {
                context.fillStyle = '#ea80fc';
                context.fillText('ARENA PVP MATCH ENDED', W / 2, H / 2 - 120);

                // Draw winner
                const winner = this.players.get(this.pvpWinnerId);
                const winnerName = winner ? winner.username : (this.pvpWinnerId || 'NOBODY');
                context.font = 'bold 24px "Orbitron", sans-serif';
                context.fillStyle = '#ffd700';
                context.fillText(`🏆 WINNER: ${winnerName.toUpperCase()} 🏆`, W / 2, H / 2 - 50);
            } else {
                context.fillStyle = success ? '#00ff80' : '#ff2244';
                context.fillText(success ? 'MISSION COMPLETE' : 'SQUAD DEFEATED', W / 2, H / 2 - 120);

                context.font = 'bold 20px "Orbitron", sans-serif';
                context.fillStyle = '#fff';
                context.fillText(success ? 'ALL PLAYERS COMPLETED THE RUN!' : 'ALL PLAYERS DIED IN THE FIELD.', W / 2, H / 2 - 50);
            }

            // Draw Scoreboard
            context.font = 'bold 14px "Orbitron", sans-serif';
            context.fillStyle = '#00e5ff';
            context.fillText('SQUAD RESULTS', W / 2, H / 2 + 10);

            let idx = 0;
            if (this.players) {
                this.players.forEach(p => {
                    const py = H / 2 + 35 + idx * 25;
                    context.font = '13px "Poppins"';
                    context.fillStyle = p.id === this.playerId ? '#00ffd0' : '#ffffff';
                    context.fillText(`${p.username}  —  Score: ${p.score}  —  Coins: ${p.coins}`, W / 2, py);
                    idx++;
                });
            }

            // Return to lobby button
            const btnW = 280, btnH = 54, btnX = W / 2 - btnW / 2, btnY = H / 2 + 160;
            context.fillStyle = 'rgba(230, 227, 227, 0.05)';
            rr(context, btnX + 3, btnY + 3, btnW, btnH, 8); context.fill();

            context.fillStyle = 'rgba(0, 229, 255, 0.15)';
            context.strokeStyle = '#00e5ff';
            context.lineWidth = 1.5;
            rr(context, btnX, btnY, btnW, btnH, 8); context.fill();
            rr(context, btnX, btnY, btnW, btnH, 8); context.stroke();

            context.font = '800 16px "Orbitron"';
            context.fillStyle = '#ffffff';
            context.fillText('RETURN TO LOBBY', W / 2, btnY + btnH / 2 + 5);
            context.restore();
        }

        exitMultiplayerMatch() {
            // Leave current socket room
            if (this.socket) {
                this.socket.emit('leaveRoom');
            }
            this.isMultiplayer = false;
            this.gameStarted = false;
            this.levelComplete = false;
            this.gameOver = false;
            this.pvpWinnerId = null;

            // Show settings panel as navigation hub
            document.getElementById('settings-overlay').classList.add('active');
            document.getElementById('html-lobby-overlay').classList.remove('active');
            document.getElementById('lobby-room-view').style.display = 'none';
            document.getElementById('lobby-selection-view').style.display = 'block';

            // Reset local stats
            this._init();
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

            // Draw Special Move Display Panel if active
            if (this.activeSpecialMove && this.specialMoveUses > 0) {
                const sx = cx + 140 + 8;
                const sy = cy;
                const moveColor = this.activeSpecialMove === 'kamehameha' ? '#00e5ff' : '#ea80fc';
                const moveIcon = this.activeSpecialMove === 'kamehameha' ? '🌀' : '🔮';
                const moveLabel = this.activeSpecialMove.toUpperCase();

                context.save();
                context.shadowColor = moveColor;
                context.shadowBlur = 6;
                context.fillStyle = 'rgba(12, 10, 20, 0.9)';
                rr(context, sx, sy, 195, 32, 8); context.fill();
                context.strokeStyle = moveColor + '88';
                context.lineWidth = 1.2;
                rr(context, sx, sy, 195, 32, 8); context.stroke();

                context.font = '800 11px "Poppins"';
                context.fillStyle = moveColor;
                context.textAlign = 'left';
                context.fillText(moveIcon + ' ' + moveLabel + ' [T]', sx + 12, sy + 20);
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
            if (localStorage.getItem('shadowStrike_osControls') !== 'true') {
                const player = this.player;
                const iconSize = 52;
                const iconGap = 14;
                const iconY = H - iconSize - 18;
                const r = iconSize / 2;

                const hexToRgb = (hex) => {
                    if (!hex) return '0, 229, 255';
                    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
                    return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : '0, 229, 255';
                };

                // ── Q ability (Blast) ───────────────────────────────────────────
                const qX = W - iconSize * 3 - iconGap * 2 - 24;
                const qCd = player.windCooldown;
                const qMax = player.windCooldownMax;
                const qReady = qCd <= 0;
                const qCX = qX + r;
                const qCY = iconY + r;
                const qRgb = hexToRgb(player.qColor);

                context.save();
                // 1. Radial/Linear premium backing gradient (matching controls button styling)
                context.shadowColor = qReady ? player.qColor : 'transparent';
                context.shadowBlur = qReady ? 14 : 0;

                const qBgGrad = context.createLinearGradient(qCX - r, qCY - r, qCX + r, qCY + r);
                qBgGrad.addColorStop(0, `rgba(${qRgb}, 0.25)`);
                qBgGrad.addColorStop(1, 'rgba(8, 6, 16, 0.95)');
                context.fillStyle = qBgGrad;
                context.beginPath();
                context.arc(qCX, qCY, r, 0, Math.PI * 2);
                context.fill();

                // Highlight radial overlay
                const qHighlight = context.createRadialGradient(qCX, qCY - r * 0.4, 0, qCX, qCY - r * 0.4, r);
                qHighlight.addColorStop(0, `rgba(${qRgb}, 0.15)`);
                qHighlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
                context.fillStyle = qHighlight;
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

                // 3. Inset highlight arc for glass look
                context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                context.lineWidth = 1.0;
                context.beginPath();
                context.arc(qCX, qCY, r - 2, Math.PI * 1.1, Math.PI * 1.9);
                context.stroke();

                // 4. Cooldown Sector sweep dial
                if (!qReady) {
                    const qProg = qCd / qMax;
                    context.beginPath();
                    context.moveTo(qCX, qCY);
                    context.arc(qCX, qCY, r - 1, -Math.PI / 2, -Math.PI / 2 + qProg * Math.PI * 2);
                    context.closePath();
                    context.fillStyle = 'rgba(12, 10, 16, 0.72)';
                    context.fill();
                }

                // 5. Q Icon vector graphics
                context.save();
                context.translate(qCX, qCY);
                context.strokeStyle = qReady ? player.qColor : 'rgba(120, 120, 120, 0.45)';
                context.lineWidth = 2.5; context.lineCap = 'round';
                context.shadowColor = qReady ? player.qColor : 'transparent';
                context.shadowBlur = qReady ? 6 : 0;

                if (player.characterType === 'jotem') {
                    context.beginPath();
                    context.arc(0, 0, 10, 0, Math.PI * 2);
                    context.stroke();
                    context.beginPath();
                    context.moveTo(-5, -5); context.lineTo(5, 5);
                    context.moveTo(5, -5); context.lineTo(-3, 3);
                    context.stroke();
                } else if (player.characterType === 'shaia') {
                    context.beginPath();
                    for (let i = 0; i < 8; i++) {
                        const a = (i / 8) * Math.PI * 2;
                        const r1 = i % 2 === 0 ? 11 : 4;
                        context.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
                    }
                    context.closePath();
                    context.stroke();
                } else if (player.characterType === 'archdemon') {
                    context.beginPath();
                    context.moveTo(0, -11);
                    context.quadraticCurveTo(7, 0, 4, 9);
                    context.quadraticCurveTo(0, 12, -4, 9);
                    context.quadraticCurveTo(-7, 0, 0, -11);
                    context.closePath();
                    context.stroke();
                } else {
                    for (let wi = 0; wi < 3; wi++) {
                        const wa = (wi / 3) * Math.PI * 2;
                        context.beginPath();
                        context.arc(Math.cos(wa) * 7, Math.sin(wa) * 7, 7, wa, wa + Math.PI * 1.1);
                        context.stroke();
                    }
                }
                context.restore();

                // 6. Cooldown countdown text
                if (!qReady) {
                    const secLeft = Math.ceil(qCd / 1000);
                    context.font = '700 13px "Poppins"';
                    context.fillStyle = '#ffffff';
                    context.textAlign = 'center';
                    context.fillText(`${secLeft}s`, qCX, qCY + 5);
                }

                // 7. Premium Badge Overlay (matching controls style)
                const qBadgeW = 16;
                const qBadgeH = 13;
                const qBadgeX = qCX + r * 0.45;
                const qBadgeY = qCY - r * 1.05;
                const qBadgeRadius = 3;

                context.save();
                context.shadowColor = 'rgba(0, 0, 0, 0.5)';
                context.shadowBlur = 4;
                context.shadowOffsetY = 1.5;

                // Fill badge
                context.fillStyle = qReady ? `rgba(${qRgb}, 0.22)` : 'rgba(20, 20, 20, 0.85)';
                rr(context, qBadgeX, qBadgeY, qBadgeW, qBadgeH, qBadgeRadius);
                context.fill();
                context.shadowBlur = 0;
                context.shadowOffsetY = 0;

                // Stroke badge
                context.strokeStyle = qReady ? player.qColor : 'rgba(120, 120, 120, 0.4)';
                context.lineWidth = 1.2;
                rr(context, qBadgeX, qBadgeY, qBadgeW, qBadgeH, qBadgeRadius);
                context.stroke();

                // Key label text
                context.font = '900 8.5px "Orbitron"';
                context.fillStyle = qReady ? player.qColor : 'rgba(120, 120, 120, 0.6)';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                if (qReady) {
                    context.shadowColor = player.qColor;
                    context.shadowBlur = 3;
                }
                context.fillText('Q', qBadgeX + qBadgeW / 2, qBadgeY + qBadgeH / 2 + 0.5);
                context.restore();

                // 8. Outer pulsating halo
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
                const eRgb = hexToRgb(player.eColor);

                context.save();
                // 1. Radial/Linear premium backing gradient
                context.shadowColor = eReady ? player.eColor : 'transparent';
                context.shadowBlur = eReady ? 14 : 0;

                const eBgGrad = context.createLinearGradient(eCX - r, eCY - r, eCX + r, eCY + r);
                eBgGrad.addColorStop(0, `rgba(${eRgb}, 0.25)`);
                eBgGrad.addColorStop(1, 'rgba(8, 6, 16, 0.95)');
                context.fillStyle = eBgGrad;
                context.beginPath();
                context.arc(eCX, eCY, r, 0, Math.PI * 2);
                context.fill();

                // Highlight radial overlay
                const eHighlight = context.createRadialGradient(eCX, eCY - r * 0.4, 0, eCX, eCY - r * 0.4, r);
                eHighlight.addColorStop(0, `rgba(${eRgb}, 0.15)`);
                eHighlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
                context.fillStyle = eHighlight;
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

                // 3. Inset highlight arc for glass look
                context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                context.lineWidth = 1.0;
                context.beginPath();
                context.arc(eCX, eCY, r - 2, Math.PI * 1.1, Math.PI * 1.9);
                context.stroke();

                // 4. Cooldown Sector sweep dial
                if (!eReady) {
                    const eProg = eCd / eMax;
                    context.beginPath();
                    context.moveTo(eCX, eCY);
                    context.arc(eCX, eCY, r - 1, -Math.PI / 2, -Math.PI / 2 + eProg * Math.PI * 2);
                    context.closePath();
                    context.fillStyle = 'rgba(12, 10, 16, 0.72)';
                    context.fill();
                }

                // 5. Shield Icon vector graphics
                context.save();
                context.translate(eCX, eCY);
                context.strokeStyle = eReady ? player.eColor : 'rgba(120, 120, 120, 0.45)';
                context.lineWidth = 2.5; context.lineCap = 'round'; context.lineJoin = 'round';
                context.shadowColor = eReady ? player.eColor : 'transparent';
                context.shadowBlur = eReady ? 6 : 0;

                if (player.characterType === 'jotem') {
                    context.beginPath();
                    context.moveTo(-8, -10); context.lineTo(8, -10);
                    context.lineTo(8, 5); context.quadraticCurveTo(0, 11, -8, 5);
                    context.closePath();
                    context.stroke();
                    context.beginPath();
                    context.moveTo(-8, -2); context.lineTo(8, -2);
                    context.stroke();
                } else if (player.characterType === 'shaia') {
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
                    context.beginPath();
                    context.arc(0, 0, 10, -Math.PI * 0.45, Math.PI * 1.35);
                    context.stroke();
                    context.beginPath();
                    context.arc(0, 0, 6, Math.PI * 0.7, Math.PI * 2);
                    context.stroke();
                } else {
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

                // 6. Cooldown countdown text
                if (!eReady) {
                    const secLeft = Math.ceil(eCd / 1000);
                    context.font = '700 13px "Poppins"';
                    context.fillStyle = '#ffffff';
                    context.textAlign = 'center';
                    context.fillText(`${secLeft}s`, eCX, eCY + 5);
                }

                // 7. Premium Badge Overlay (matching controls style)
                const eBadgeW = 16;
                const eBadgeH = 13;
                const eBadgeX = eCX + r * 0.45;
                const eBadgeY = eCY - r * 1.05;
                const eBadgeRadius = 3;

                context.save();
                context.shadowColor = 'rgba(0, 0, 0, 0.5)';
                context.shadowBlur = 4;
                context.shadowOffsetY = 1.5;

                // Fill badge
                context.fillStyle = eReady ? `rgba(${eRgb}, 0.22)` : 'rgba(20, 20, 20, 0.85)';
                rr(context, eBadgeX, eBadgeY, eBadgeW, eBadgeH, eBadgeRadius);
                context.fill();
                context.shadowBlur = 0;
                context.shadowOffsetY = 0;

                // Stroke badge
                context.strokeStyle = eReady ? player.eColor : 'rgba(120, 120, 120, 0.4)';
                context.lineWidth = 1.2;
                rr(context, eBadgeX, eBadgeY, eBadgeW, eBadgeH, eBadgeRadius);
                context.stroke();

                // Key label text
                context.font = '900 8.5px "Orbitron"';
                context.fillStyle = eReady ? player.eColor : 'rgba(120, 120, 120, 0.6)';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                if (eReady) {
                    context.shadowColor = player.eColor;
                    context.shadowBlur = 3;
                }
                context.fillText('E', eBadgeX + eBadgeW / 2, eBadgeY + eBadgeH / 2 + 0.5);
                context.restore();

                // 8. Outer pulsating halo
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
                const rRgb = hexToRgb(player.rColor);

                context.save();
                // 1. Radial/Linear premium backing gradient
                context.shadowColor = rReady ? player.rColor : 'transparent';
                context.shadowBlur = rReady ? 14 : 0;

                const rBgGrad = context.createLinearGradient(rCX - r, rCY - r, rCX + r, rCY + r);
                rBgGrad.addColorStop(0, `rgba(${rRgb}, 0.25)`);
                rBgGrad.addColorStop(1, 'rgba(8, 6, 16, 0.95)');
                context.fillStyle = rBgGrad;
                context.beginPath();
                context.arc(rCX, rCY, r, 0, Math.PI * 2);
                context.fill();

                // Highlight radial overlay
                const rHighlight = context.createRadialGradient(rCX, rCY - r * 0.4, 0, rCX, rCY - r * 0.4, r);
                rHighlight.addColorStop(0, `rgba(${rRgb}, 0.15)`);
                rHighlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
                context.fillStyle = rHighlight;
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

                // 3. Inset highlight arc for glass look
                context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                context.lineWidth = 1.0;
                context.beginPath();
                context.arc(rCX, rCY, r - 2, Math.PI * 1.1, Math.PI * 1.9);
                context.stroke();

                // 4. Cooldown Sector sweep dial
                if (!rReady) {
                    const rProg = rCd / rMax;
                    context.beginPath();
                    context.moveTo(rCX, rCY);
                    context.arc(rCX, rCY, r - 1, -Math.PI / 2, -Math.PI / 2 + rProg * Math.PI * 2);
                    context.closePath();
                    context.fillStyle = 'rgba(12, 10, 16, 0.72)';
                    context.fill();
                }

                // 5. Slash/Ultimate Icon vector graphics
                context.save();
                context.translate(rCX, rCY);
                context.strokeStyle = rReady ? player.rColor : 'rgba(120, 120, 120, 0.45)';
                context.lineWidth = 3; context.lineCap = 'round';
                context.shadowColor = rReady ? player.rColor : 'transparent';
                context.shadowBlur = rReady ? 6 : 0;

                if (player.characterType === 'jotem') {
                    context.beginPath();
                    context.moveTo(-11, 8); context.lineTo(-6, -4); context.lineTo(-1, 8);
                    context.lineTo(4, -9); context.lineTo(9, 8);
                    context.stroke();
                } else if (player.characterType === 'shaia') {
                    context.beginPath();
                    context.moveTo(5, -11);
                    context.lineTo(-4, 0);
                    context.lineTo(2, 0);
                    context.lineTo(-5, 11);
                    context.stroke();
                } else if (player.characterType === 'archdemon') {
                    context.beginPath();
                    context.arc(-5, 0, 10, -Math.PI * 0.45, Math.PI * 0.45);
                    context.stroke();
                } else {
                    context.beginPath();
                    context.moveTo(-10, 10);
                    context.quadraticCurveTo(0, -2, 10, -10);
                    context.stroke();
                }
                context.restore();

                // 6. Cooldown countdown text
                if (!rReady) {
                    const secLeft = Math.ceil(rCd / 1000);
                    context.font = '700 13px "Poppins"';
                    context.fillStyle = '#ffffff';
                    context.textAlign = 'center';
                    context.fillText(`${secLeft}s`, rCX, rCY + 5);
                }

                // 7. Premium Badge Overlay (matching controls style)
                const rBadgeW = 16;
                const rBadgeH = 13;
                const rBadgeX = rCX + r * 0.45;
                const rBadgeY = rCY - r * 1.05;
                const rBadgeRadius = 3;

                context.save();
                context.shadowColor = 'rgba(0, 0, 0, 0.5)';
                context.shadowBlur = 4;
                context.shadowOffsetY = 1.5;

                // Fill badge
                context.fillStyle = rReady ? `rgba(${rRgb}, 0.22)` : 'rgba(20, 20, 20, 0.85)';
                rr(context, rBadgeX, rBadgeY, rBadgeW, rBadgeH, rBadgeRadius);
                context.fill();
                context.shadowBlur = 0;
                context.shadowOffsetY = 0;

                // Stroke badge
                context.strokeStyle = rReady ? player.rColor : 'rgba(120, 120, 120, 0.4)';
                context.lineWidth = 1.2;
                rr(context, rBadgeX, rBadgeY, rBadgeW, rBadgeH, rBadgeRadius);
                context.stroke();

                // Key label text
                context.font = '900 8.5px "Orbitron"';
                context.fillStyle = rReady ? player.rColor : 'rgba(120, 120, 120, 0.6)';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                if (rReady) {
                    context.shadowColor = player.rColor;
                    context.shadowBlur = 3;
                }
                context.fillText('R', rBadgeX + rBadgeW / 2, rBadgeY + rBadgeH / 2 + 0.5);
                context.restore();

                // 8. Outer pulsating halo
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
            }
            context.restore();
            // ─────────────────────────────────────────────────────────────────

            context.restore();
        }
    }

    const game = new Game(canvas.width, canvas.height);

    // ── Setup Multiplayer and Auth UI ──
    const SERVER_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://twod-game-server-rndp.onrender.com'; // Replace with production URL on deploy

    // ── Toast Notification System ──
    (function initToastSystem() {
        if (document.getElementById('toast-container')) return;
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    })();

    // FIX (XSS): build the toast entirely with safe DOM APIs / textContent
    // instead of interpolating the message straight into innerHTML. A
    // malicious/error message containing HTML could otherwise execute in
    // every viewer's browser.
    function showToast(message, type = 'error', duration = 3500) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            error: '⛔',
            success: '✅',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'toast-icon';
        iconSpan.textContent = icons[type] || icons.error;

        const msgSpan = document.createElement('span');
        msgSpan.className = 'toast-msg';
        msgSpan.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.title = 'Dismiss';
        closeBtn.textContent = '✕';

        const progressDiv = document.createElement('div');
        progressDiv.className = 'toast-progress';

        toast.appendChild(iconSpan);
        toast.appendChild(msgSpan);
        toast.appendChild(closeBtn);
        toast.appendChild(progressDiv);

        // Close button
        closeBtn.addEventListener('click', () => dismissToast(toast));

        container.appendChild(toast);

        // Trigger slide-in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('toast-show'));
        });

        // Auto dismiss
        const timer = setTimeout(() => dismissToast(toast), duration);
        toast._toastTimer = timer;
    }

    function dismissToast(toast) {
        clearTimeout(toast._toastTimer);
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 350);
    }

    async function makeRequest(route, method, body) {
        try {
            const headers = { 'Content-Type': 'application/json' };
            const token = localStorage.getItem('shadowStrikeToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(`${SERVER_URL}${route}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined
            });
            return await res.json();
        } catch (err) {
            console.error('Request error:', err);
            return { error: 'Connection failed.' };
        }
    }

    function setupMultiplayerAndAuth(game) {
        const mainMenu = document.getElementById('html-main-menu');
        const authOverlay = document.getElementById('html-auth-overlay');
        const lobbyOverlay = document.getElementById('html-lobby-overlay');
        const leaderboardOverlay = document.getElementById('html-leaderboard-overlay');

        const spBtn = document.getElementById('btn-sp');
        const mpBtn = document.getElementById('btn-mp');
        const authActionBtn = document.getElementById('btn-auth-action');
        const menuUserStatus = document.getElementById('menu-user-status');

        const closeLobbyBtn = document.getElementById('btn-close-lobby');
        const closeLeaderboardBtn = document.getElementById('btn-close-leaderboard');

        // Auth form
        const authForm = document.getElementById('auth-form');
        const authTitle = document.getElementById('auth-title');
        const groupUsername = document.getElementById('group-username');
        const labelEmailLogin = document.getElementById('label-email-login');
        const authUsernameInput = document.getElementById('auth-username');
        const authEmailInput = document.getElementById('auth-email');
        const authPasswordInput = document.getElementById('auth-password');
        const authSubmitBtn = document.getElementById('btn-auth-submit');
        const authToggleLink = document.getElementById('auth-toggle-link');
        const authGuestBtn = document.getElementById('btn-auth-guest');

        // Lobby elements
        const lobbySelectionView = document.getElementById('lobby-selection-view');
        const lobbyRoomView = document.getElementById('lobby-room-view');
        const btnCreateRoom = document.getElementById('btn-create-room');
        const btnJoinRoom = document.getElementById('btn-join-room');
        const createModeSelect = document.getElementById('lobby-create-mode');
        const createSizeSelect = document.getElementById('lobby-create-size');
        const createLevelSelect = document.getElementById('lobby-create-level');
        const joinCodeInput = document.getElementById('lobby-join-code');

        // Room View elements
        const roomCodeDisplay = document.getElementById('room-code-display');
        const roomModeDisplay = document.getElementById('room-mode-display');
        const roomLevelDisplay = document.getElementById('room-level-display');
        const roomMembersList = document.getElementById('room-members-list');
        const lobbyChatMessages = document.getElementById('lobby-chat-messages');
        const lobbyChatInput = document.getElementById('lobby-chat-input');
        const btnSendChat = document.getElementById('btn-send-chat');
        const lobbyCharSelect = document.getElementById('lobby-char-select');
        const btnToggleReady = document.getElementById('btn-toggle-ready');
        const btnStartMatch = document.getElementById('btn-start-match');
        const btnLeaveRoom = document.getElementById('btn-leave-room');

        let isSignupMode = false;
        let currentRoomCode = null;

        // Try to verify token on startup
        const token = localStorage.getItem('shadowStrikeToken');
        if (token) {
            verifyTokenAndConnect();
        } else {
            updateUserUI(null);
        }

        function openLobbyDirectly() {
            if (!game.socket) {
                const savedToken = localStorage.getItem('shadowStrikeToken');
                connectSocket(savedToken || null);
            }
            mainMenu.classList.remove('active');
            lobbySelectionView.style.display = 'block';
            lobbyRoomView.style.display = 'none';
            lobbyOverlay.classList.add('active');
        }

        async function verifyTokenAndConnect() {
            const data = await makeRequest('/auth/me', 'GET');
            if (data && data.user) {
                updateUserUI(data.user);
                connectSocket(localStorage.getItem('shadowStrikeToken'));
                authOverlay.classList.remove('active');
                openLobbyDirectly();
            } else {
                localStorage.removeItem('shadowStrikeToken');
                localStorage.removeItem('shadowStrikeUser');
                updateUserUI(null);
            }
        }

        function updateUserUI(user) {
            if (user) {
                menuUserStatus.innerText = `LOGGED IN: ${user.username.toUpperCase()} (🪙 ${user.coins} COINS)`;
                authActionBtn.innerText = 'LOG OUT';
            } else {
                menuUserStatus.innerText = 'PLAYING AS GUEST';
                authActionBtn.innerText = 'LOG IN';
            }
            updateProfileUI(user);
        }

        function updateProfileUI(user) {
            const profileUsername = document.getElementById('profile-username');
            const profileStatus = document.getElementById('profile-status');
            const profileCoins = document.getElementById('profile-coins');
            const profileLevels = document.getElementById('profile-levels');
            if (user) {
                if (profileUsername) profileUsername.innerText = user.username.toUpperCase();
                if (profileStatus) profileStatus.innerText = 'LOGGED IN';
                if (profileCoins) profileCoins.innerText = user.coins ?? 0;
                if (profileLevels) profileLevels.innerText = user.levelsCompleted ?? 0;
            } else {
                if (profileUsername) profileUsername.innerText = 'GUEST PLAYER';
                if (profileStatus) profileStatus.innerText = 'PLAYING AS GUEST';
                if (profileCoins) profileCoins.innerText = '0';
                if (profileLevels) profileLevels.innerText = '0';
            }
        }

        function connectSocket(authToken) {
            if (game.socket) {
                game.socket.disconnect();
            }

            game.socket = io(SERVER_URL, {
                auth: { token: authToken }
            });

            game.socket.on('authSuccess', ({ playerId, username, isGuest }) => {
                game.playerId = playerId;
                game.username = username;
                console.log(`Socket authentication successful. PlayerId: ${playerId}, Username: ${username}`);
            });

            // Room Update handler
            game.socket.on('roomUpdate', (room) => {
                game.isHost = (room.hostId === game.playerId);
                currentRoomCode = room.code;
                roomCodeDisplay.innerText = room.code;
                roomModeDisplay.innerText = room.mode === 'coop' ? 'Co-op Adventure' : 'Arena PvP';
                roomLevelDisplay.innerText = room.level;

                // Sync local player selected character from room roster
                const localMember = room.members.find(m => m.playerId === game.playerId);
                if (localMember) {
                    game.selectedCharacter = localMember.characterType;
                }


                // Render roster
                roomMembersList.innerHTML = '';
                let allReady = true;
                room.members.forEach(m => {
                    const item = document.createElement('div');
                    item.className = `room-member-item ${m.isReady ? 'ready' : ''}`;
                    item.innerHTML = `
                        <span style="font-weight:700;">${escapeHtml(m.username.toUpperCase())} (${escapeHtml(m.characterType.toUpperCase())}) ${m.playerId === room.hostId ? '👑' : ''}</span>
                        <span class="ready-badge ${m.isReady ? 'is-ready' : 'not-ready'}">${m.isReady ? 'READY' : 'NOT READY'}</span>
                    `;
                    roomMembersList.appendChild(item);

                    if (m.playerId !== room.hostId && !m.isReady) {
                        allReady = false;
                    }
                });

                // Show start match button if host
                if (room.hostId === game.playerId) {
                    btnStartMatch.style.display = 'block';
                    btnStartMatch.disabled = !allReady && room.members.length > 1;
                } else {
                    btnStartMatch.style.display = 'none';
                }
            });

            // Chat Messages handler
            // FIX (XSS): previously built with innerHTML and raw `sender`/`message`
            // values from other players — this let any player inject executable
            // HTML into everyone else's chat window. Now built with safe DOM
            // nodes + textContent so any HTML in the message is shown as plain text.
            game.socket.on('chatMessage', ({ sender, message, time }) => {
                const msgEl = document.createElement('div');
                msgEl.className = 'chat-msg';

                const senderSpan = document.createElement('span');
                senderSpan.className = 'sender';
                senderSpan.textContent = sender + ':';

                const msgSpan = document.createElement('span');
                msgSpan.textContent = message;

                const timeSpan = document.createElement('span');
                timeSpan.className = 'time';
                timeSpan.textContent = time;

                msgEl.appendChild(senderSpan);
                msgEl.appendChild(msgSpan);
                msgEl.appendChild(timeSpan);

                lobbyChatMessages.appendChild(msgEl);
                lobbyChatMessages.scrollTop = lobbyChatMessages.scrollHeight;
            });

            // Match Start handler
            game.socket.on('gameStarted', (data) => {
                lobbyOverlay.classList.remove('active');
                game.isMultiplayer = true;
                game.gameStarted = true;
                game.paused = false;
                if (data) {
                    game.level = data.level || 1;
                    game.mode = data.mode || 'coop';
                }
                game._init();
                if (game.storyDialogueManager) {
                    game.storyDialogueManager.startLevelIntro(game.level);
                }
            });

            // Apply damage to enemies sent by guest clients (only host runs this authoritative logic)
            if (!game.processedDamageIds) {
                game.processedDamageIds = new Set();
            }

            const handleGuestEnemyDamage = ({ enemyId, damage, damageId }) => {
                if (game.isHost && game.enemies) {
                    if (damageId) {
                        if (game.processedDamageIds.has(damageId)) return;
                        game.processedDamageIds.add(damageId);
                        if (game.processedDamageIds.size > 1000) {
                            const first = game.processedDamageIds.values().next().value;
                            game.processedDamageIds.delete(first);
                        }
                    }
                    const enemy = game.enemies.find(e => String(e.id) === String(enemyId));
                    if (enemy) {
                        if (typeof enemy.takeDamage === 'function') {
                            enemy.invuln = 0;
                            enemy.takeDamage(damage);
                        } else {
                            const isDead = enemy.state === 'DEATH' || enemy.markedForDeletion;
                            if (!isDead) {
                                const curHP = enemy.currentHP !== undefined ? enemy.currentHP : (enemy.maxHP || 100);
                                const newHP = Math.max(0, curHP - damage);
                                enemy.currentHP = newHP;
                                if (enemy.hp !== undefined) enemy.hp = newHP;

                                // Visual feedback: flash and squash like a real hit
                                if (enemy.flashTimer !== undefined) enemy.flashTimer = 150;
                                if (enemy.scaleX !== undefined) { enemy.scaleX = 1.15; enemy.scaleY = 0.85; }

                                // Spawn damage text
                                if (typeof game.spawnDamageText === 'function') {
                                    game.spawnDamageText(
                                        enemy.x + (enemy.width || 80) / 2,
                                        enemy.y + (enemy.height || 100) * 0.3,
                                        damage
                                    );
                                }
                                game.spawnHitSparks && game.spawnHitSparks(
                                    enemy.x + (enemy.width || 80) / 2,
                                    enemy.y + (enemy.height || 100) / 2, 'gold'
                                );
                                game.shake = Math.max(game.shake || 0, 6);

                                // Trigger DEATH or HURT state
                                if (newHP <= 0) {
                                    if (typeof enemy._setState === 'function') enemy._setState('DEATH');
                                    else if (typeof enemy.setState === 'function') enemy.setState('DEATH');
                                } else {
                                    // Only switch to HURT if not already in attack/hurt/death
                                    const curState = enemy.state || (enemy.currentState && enemy.currentState.state);
                                    if (curState !== 'ATTACK' && curState !== 'DEATH') {
                                        if (typeof enemy._setState === 'function') enemy._setState('HURT');
                                        if (enemy.hurtTimer !== undefined) enemy.hurtTimer = 0;
                                    }
                                }
                            }
                        }

                        // Immediately push updated enemy state to server so guest sees HP drop without waiting for next tick
                        if (game.socket && game.player) {
                            const updatedEnemies = game.enemies.map(e => {
                                if (!e.id) e.id = Math.random().toString();
                                return {
                                    id: e.id,
                                    type: e.enemyType || (e.isBoss ? 'boss' : 'skeleton_white'),
                                    x: e.x + game.cameraX,
                                    y: e.y,
                                    hp: e.currentHP !== undefined ? e.currentHP : (e.hp || 0),
                                    maxHp: e.maxHP !== undefined ? e.maxHP : (e.maxHp || 100),
                                    facingLeft: e.facingLeft,
                                    state: e.state || (e.currentState && e.currentState.state) || 'WALK',
                                    isBoss: e.isBoss || false
                                };
                            });
                            game.socket.emit('playerStateUpdate', {
                                x: game.player.x + game.cameraX,
                                y: game.player.y,
                                vy: game.player.vy,
                                animState: game.player.currentState ? game.player.currentState.state : 'IDLE',
                                facingLeft: game.player.facingLeft,
                                hp: game.currentHP,
                                maxHp: game.maxHP,
                                score: game.score,
                                coins: game.coins,
                                shieldActive: game.player.shieldActive || false,
                                isDead: game.player.isDead,
                                enemies: updatedEnemies
                            });
                        }
                    }
                }
            };

            game.socket.on('applyEnemyDamage', handleGuestEnemyDamage);


            // Game state Tick sync
            game.socket.on('gameState', (state) => {
                game.serverState = state;
                if (state.projectiles) {
                    game.projectiles = state.projectiles;
                }

                // Rebuild players map
                if (!game.players) game.players = new Map();

                // Keep local player in game.players
                if (game.player) {
                    if (!game.player.id) {
                        game.player.id = game.playerId;
                    }
                    if (!game.players.has(game.playerId)) {
                        game.players.set(game.playerId, game.player);
                    }
                    // Sync local player HP if changed by server (e.g. damaged by enemies/boss on host)
                    if (state.players && state.players[game.playerId]) {
                        const sLocalPlayer = state.players[game.playerId];
                        if (sLocalPlayer.hp !== undefined && sLocalPlayer.hp !== game.currentHP) {
                            const oldHP = game.currentHP;
                            game.currentHP = sLocalPlayer.hp;
                            if (game.player) {
                                if (game.currentHP <= 0) {
                                    game.player.isDead = true;
                                    if (game.player.currentState && game.player.currentState.state !== 'DEATH') {
                                        game.player.setState('DEATH');
                                    }
                                } else if (sLocalPlayer.hp < oldHP) {
                                    if (game.player.currentState && game.player.currentState.state !== 'DAMAGE') {
                                        game.player.setState('DAMAGE');
                                        game.player.takingDamage = true;
                                    }
                                }
                            }
                        }
                    }
                }

                // Clear old players
                for (const [id] of game.players.entries()) {
                    if (id !== game.playerId && !state.players[id]) {
                        game.players.delete(id);
                    }
                }

                // Update remote players
                for (const id in state.players) {
                    if (id === game.playerId) continue;

                    const sPlayer = state.players[id];
                    let pInstance = game.players.get(id);
                    if (!pInstance) {
                        pInstance = new Player(game, sPlayer.characterType);
                        pInstance.id = id;
                        pInstance.username = sPlayer.username;
                        pInstance.x = sPlayer.x - game.cameraX;
                        pInstance.y = sPlayer.y;
                        pInstance.vy = sPlayer.vy;
                        game.players.set(id, pInstance);
                    }
                    pInstance.targetX = sPlayer.x - game.cameraX;
                    pInstance.targetY = sPlayer.y;
                    pInstance.vy = sPlayer.vy;
                    pInstance.currentHP = sPlayer.hp;
                    pInstance.maxHP = sPlayer.maxHp;
                    pInstance.coins = sPlayer.coins;
                    pInstance.isDashing = sPlayer.isDashing;
                    pInstance.facingLeft = sPlayer.facingLeft;
                    pInstance.isDead = sPlayer.isDead;
                    pInstance.score = sPlayer.score;
                    pInstance.frameX = sPlayer.frameX || 0;

                    if (pInstance.currentState && pInstance.currentState.state !== sPlayer.animState) {
                        pInstance.setState(sPlayer.animState);
                    }
                    pInstance.shieldActive = sPlayer.shieldActive;

                    // Sync remote player's projectiles for visual rendering on this client
                    if (sPlayer.slashProjectiles) {
                        pInstance.slashProjectiles = sPlayer.slashProjectiles.map(sp => ({
                            x: sp.x - game.cameraX,
                            y: sp.y,
                            vx: sp.vx,
                            vy: sp.vy || 0,
                            facingLeft: sp.facingLeft,
                            width: sp.width || 90,
                            height: sp.height || 30,
                            type: sp.type,
                            particles: [],
                            embers: [],
                            markedForDeletion: false,
                            draw(ctx) {
                                ctx.save();
                                ctx.shadowColor = '#ff8800';
                                ctx.shadowBlur = 18;
                                ctx.fillStyle = 'rgba(255, 140, 0, 0.75)';
                                const drawX = this.facingLeft ? this.x - this.width : this.x;
                                ctx.fillRect(drawX, this.y - this.height / 2, this.width, this.height);
                                ctx.restore();
                            }
                        }));
                    } else {
                        pInstance.slashProjectiles = [];
                    }
                    if (sPlayer.windProjectiles) {
                        pInstance.windProjectiles = sPlayer.windProjectiles.map(wp => ({
                            x: wp.x - game.cameraX,
                            y: wp.y,
                            vx: wp.vx,
                            vy: wp.vy || 0,
                            facingLeft: wp.facingLeft,
                            width: wp.width || 40,
                            height: wp.height || 40,
                            type: wp.type,
                            markedForDeletion: false,
                            draw(ctx) {
                                ctx.save();
                                ctx.shadowColor = '#00e5ff';
                                ctx.shadowBlur = 14;
                                ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
                                ctx.beginPath();
                                ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
                                ctx.fill();
                                ctx.restore();
                            }
                        }));
                    } else {
                        pInstance.windProjectiles = [];
                    }
                }


                // Sync enemies and wave progression if not host
                if (!game.isHost && state.enemies) {
                    // Create a map of server enemies for quick lookup
                    const serverEnemiesMap = new Map();
                    state.enemies.forEach(se => serverEnemiesMap.set(se.id, se));

                    // Remove local enemies that are no longer on the server
                    game.enemies = game.enemies.filter(le => {
                        let stillExists = false;
                        for (let key of serverEnemiesMap.keys()) {
                            if (String(key) === String(le.id)) {
                                stillExists = true;
                                break;
                            }
                        }
                        return stillExists;
                    });

                    // Update or spawn enemies
                    state.enemies.forEach(se => {
                        let le = game.enemies.find(e => String(e.id) === String(se.id));
                        const screenX = se.x - game.cameraX; // convert absolute to screen
                        if (!le) {
                            le = game.spawnEnemyFromType(se.type, screenX, se.y);
                            if (le) {
                                le.id = se.id;
                                le.hasEnteredScreen = true;
                                game.enemies.push(le);
                            }
                        }
                        if (le) {
                            le.x = screenX;
                            le.y = se.y;
                            // Grace period: if this guest just hit the enemy, don't overwrite HP with
                            // the server's still-stale value — wait for the host to confirm the new HP.
                            // Always sync on death so enemies never get stuck alive on the guest.
                            const sinceLastHit = Date.now() - (le._guestHitTime || 0);
                            if (se.hp <= 0 || sinceLastHit > 400) {
                                le.currentHP = se.hp;
                                le.hp = se.hp;
                            }
                            le.facingLeft = se.facingLeft;
                            le.hasEnteredScreen = true;
                            if (se.hp <= 0) {
                                if (le.state !== 'DEATH') {
                                    le._setState('DEATH');
                                }
                            } else {
                                // Only update state if not in a recent-hit visual state
                                if (sinceLastHit > 200 || se.state === 'DEATH') {
                                    if (typeof le._setState === 'function') {
                                        le._setState(se.state);
                                    } else {
                                        le.state = se.state;
                                    }
                                }
                            }
                            // Sync enemy's projectiles
                            if (se.projectiles) {
                                const oldProjectiles = le.projectiles || [];
                                le.projectiles = se.projectiles.map((sp, index) => {
                                    const projX = sp.x - game.cameraX;
                                    // Match with existing projectile to keep particles/trails
                                    const oldProj = oldProjectiles.find(op => op.type === sp.type && Math.hypot(op.x - projX, op.y - sp.y) < 120) || oldProjectiles[index];
                                    const particles = oldProj ? oldProj.particles || [] : [];
                                    const history = oldProj ? oldProj.history || [] : [];
                                    const rotation = oldProj ? oldProj.rotation || 0 : 0;

                                    return {
                                        game: game,
                                        x: projX,
                                        y: sp.y,
                                        radius: sp.radius || 12,
                                        damage: sp.damage || 10,
                                        type: sp.type,
                                        vx: sp.vx,
                                        vy: sp.vy,
                                        isBlackHole: sp.isBlackHole || false,
                                        facingLeft: sp.facingLeft,
                                        particles: particles,
                                        history: history,
                                        rotation: rotation + 0.15,
                                        timer: sp.timer || 0,
                                        delay: sp.delay || 0,
                                        life: sp.life || 1000,
                                        update: function (dt) {
                                            this.x += this.vx - (this.game.scrollSpeed || 0);
                                            this.y += this.vy;

                                            const localPlayer = this.game.player;
                                            if (localPlayer && !localPlayer.isDead && this.game.hitCooldown <= 0) {
                                                const pLeft = localPlayer.x + localPlayer.width * 0.25;
                                                const pRight = localPlayer.x + localPlayer.width * 0.75;
                                                const pTop = localPlayer.y;
                                                const pBottom = localPlayer.y + localPlayer.height;
                                                const cx = Math.max(pLeft, Math.min(this.x, pRight));
                                                const cy = Math.max(pTop, Math.min(this.y, pBottom));
                                                const dist = Math.hypot(this.x - cx, this.y - cy);
                                                if (dist < this.radius) {
                                                    this.game.hurtPlayer(this.damage, this.type.includes('Boss') || this.type.includes('Giant'));
                                                }
                                            }

                                            // Particle trails local simulation
                                            if (this.type === 'FireProjectile') {
                                                if (Math.random() < 0.8) {
                                                    this.particles.push({
                                                        x: this.x + (Math.random() - 0.5) * 6,
                                                        y: this.y + (Math.random() - 0.5) * 6,
                                                        vx: -this.vx * 0.2 + (Math.random() - 0.5) * 1,
                                                        vy: -this.vy * 0.2 + (Math.random() - 0.5) * 1,
                                                        size: this.radius * (0.5 + Math.random() * 0.5),
                                                        alpha: 0.8,
                                                        colorType: Math.random() > 0.5 ? 'orange' : 'red'
                                                    });
                                                }
                                                this.particles.forEach(p => {
                                                    p.x += p.vx - (this.game.scrollSpeed || 0);
                                                    p.y += p.vy;
                                                    p.alpha -= 0.05;
                                                    p.size *= 0.9;
                                                });
                                                this.particles = this.particles.filter(p => p.alpha > 0);
                                            } else if (this.type === 'BossFireballProjectile' || this.type === 'BossGiantFireball') {
                                                if (this.isBlackHole) {
                                                    if (Math.random() < 0.45) {
                                                        const angle = Math.random() * Math.PI * 2;
                                                        const distance = 80 + Math.random() * 100;
                                                        this.particles.push({
                                                            x: this.x + Math.cos(angle) * distance,
                                                            y: this.y + Math.sin(angle) * distance,
                                                            size: 2 + Math.random() * 5,
                                                            alpha: 1.0,
                                                            colorType: 'black_hole_matter',
                                                            angle: angle,
                                                            distance: distance
                                                        });
                                                    }
                                                    this.particles.forEach(p => {
                                                        p.distance -= 2.8;
                                                        p.angle += 0.06;
                                                        p.x = this.x + Math.cos(p.angle) * p.distance;
                                                        p.y = this.y + Math.sin(p.angle) * p.distance;
                                                        p.alpha -= 0.012;
                                                    });
                                                    this.particles = this.particles.filter(p => p.alpha > 0 && p.distance > 10);
                                                } else {
                                                    const angle = Math.atan2(this.vy, this.vx);
                                                    const backAngle = angle + Math.PI;
                                                    for (let i = 0; i < 2; i++) {
                                                        const spreadAngle = backAngle + (Math.random() - 0.5) * 0.8;
                                                        const pSpeed = (Math.random() * 3) + 1.0;
                                                        this.particles.push({
                                                            x: this.x - (this.vx / Math.hypot(this.vx, this.vy) || 0) * 15 + (Math.random() - 0.5) * 15,
                                                            y: this.y - (this.vy / Math.hypot(this.vx, this.vy) || 0) * 15 + (Math.random() - 0.5) * 15,
                                                            vx: Math.cos(spreadAngle) * pSpeed + (Math.random() - 0.5) * 1.0,
                                                            vy: Math.sin(spreadAngle) * pSpeed - (Math.random() * 0.8),
                                                            size: this.radius * (0.4 + Math.random() * 0.6),
                                                            alpha: 0.8,
                                                            colorType: Math.random() > 0.4 ? 'red_fire' : 'yellow_flame'
                                                        });
                                                    }
                                                    this.particles.forEach(p => {
                                                        p.x += p.vx - (this.game.scrollSpeed || 0);
                                                        p.y += p.vy;
                                                        p.alpha -= 0.035;
                                                        p.size *= 0.95;
                                                    });
                                                    this.particles = this.particles.filter(p => p.alpha > 0 && p.size > 0.2);
                                                }
                                            } else if (this.type === 'BossSlashProjectile') {
                                                const angle = Math.atan2(this.vy, this.vx);
                                                this.history.push({ x: this.x, y: this.y, angle: angle });
                                                if (this.history.length > 5) this.history.shift();

                                                const backAngle = angle + Math.PI;
                                                const speed = Math.hypot(this.vx, this.vy) || 12;
                                                for (let i = 0; i < 2; i++) {
                                                    const offsetDist = (Math.random() - 0.5) * 90 * 0.7;
                                                    const dx = this.vx / speed;
                                                    const dy = this.vy / speed;
                                                    const px = this.x - dx * 10 + (-dy) * offsetDist;
                                                    const py = this.y - dy * 10 + dx * offsetDist;

                                                    this.particles.push({
                                                        x: px,
                                                        y: py,
                                                        vx: Math.cos(backAngle) * (speed * 0.3) + (Math.random() - 0.5) * 1.0,
                                                        vy: Math.sin(backAngle) * (speed * 0.3) + (Math.random() - 0.5) * 1.0,
                                                        size: 2 + Math.random() * 3,
                                                        alpha: 0.8,
                                                        color: Math.random() > 0.4 ? 'rgba(0, 210, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)'
                                                    });
                                                }
                                                this.particles.forEach(p => {
                                                    p.x += p.vx - (this.game.scrollSpeed || 0);
                                                    p.y += p.vy;
                                                    p.alpha -= 0.03;
                                                    p.size *= 0.95;
                                                });
                                                this.particles = this.particles.filter(p => p.alpha > 0 && p.size > 0.2);
                                            } else if (this.type === 'StoneProjectile') {
                                                const speed = Math.hypot(this.vx, this.vy) || 10;
                                                const dx = this.vx / speed;
                                                const dy = this.vy / speed;
                                                if (Math.random() < 0.6) {
                                                    const angle = Math.atan2(dy, dx) + Math.PI;
                                                    const spreadAngle = angle + (Math.random() - 0.5) * 0.8;
                                                    const pSpeed = (Math.random() * 2) + 1;
                                                    this.particles.push({
                                                        x: this.x - dx * 12 + (Math.random() - 0.5) * 10,
                                                        y: this.y - dy * 12 + (Math.random() - 0.5) * 10,
                                                        vx: Math.cos(spreadAngle) * pSpeed,
                                                        vy: Math.sin(spreadAngle) * pSpeed,
                                                        size: 2 + Math.random() * 4,
                                                        alpha: 0.9
                                                    });
                                                }
                                                this.particles.forEach(p => {
                                                    p.x += p.vx - (this.game.scrollSpeed || 0);
                                                    p.y += p.vy;
                                                    p.alpha -= 0.04;
                                                    p.size *= 0.93;
                                                });
                                                this.particles = this.particles.filter(p => p.alpha > 0);
                                            } else if (this.type === 'ArcherProjectile') {
                                                if (Math.random() < 0.35) {
                                                    this.particles.push({
                                                        x: this.x + (this.facingLeft ? 40 : 0),
                                                        y: this.y + 4 + (Math.random() - 0.5) * 4,
                                                        vx: (this.facingLeft ? 1 : -1) * (Math.random() * 0.5 + 0.1),
                                                        vy: (Math.random() - 0.5) * 0.4,
                                                        size: Math.random() * 3 + 1.5,
                                                        alpha: 0.9
                                                    });
                                                }
                                                this.particles.forEach(p => {
                                                    p.x += p.vx - (this.game.scrollSpeed || 0);
                                                    p.y += p.vy;
                                                    p.alpha -= 0.035;
                                                });
                                                this.particles = this.particles.filter(p => p.alpha > 0);
                                            } else if (this.type === 'FirePillar') {
                                                this.timer += dt;
                                                const isErupting = this.timer >= this.delay;
                                                if (isErupting) {
                                                    for (let i = 0; i < 3; i++) {
                                                        this.particles.push({
                                                            x: this.x + (Math.random() - 0.5) * 80,
                                                            y: this.y - Math.random() * (this.game.height - this.y),
                                                            vx: (Math.random() - 0.5) * 1.5,
                                                            vy: -Math.random() * 4 - 2,
                                                            size: Math.random() * 16 + 8,
                                                            alpha: 0.9,
                                                            color: Math.random() > 0.5 ? 'rgba(255, 69, 0, 0.85)' : 'rgba(255, 215, 0, 0.85)'
                                                        });
                                                    }
                                                } else {
                                                    if (Math.random() < 0.3) {
                                                        this.particles.push({
                                                            x: this.x + (Math.random() - 0.5) * 80,
                                                            y: this.y - 2,
                                                            vx: (Math.random() - 0.5) * 0.5,
                                                            vy: -Math.random() * 2 - 0.5,
                                                            size: Math.random() * 6 + 3,
                                                            alpha: 0.6,
                                                            color: 'rgba(255, 0, 0, 0.5)'
                                                        });
                                                    }
                                                }
                                                this.particles.forEach(p => {
                                                    p.x += p.vx - (this.game.scrollSpeed || 0);
                                                    p.y += p.vy;
                                                    p.alpha -= 0.02;
                                                    p.size *= 0.97;
                                                });
                                                this.particles = this.particles.filter(p => p.alpha > 0);
                                            } else if (this.type === 'FlameThrowerParticle') {
                                                this.timer += dt;
                                                this.radius = 16 + (60 - 16) * Math.min(1.0, this.timer / (this.life || 1000));
                                            }
                                        },
                                        draw: function (ctx) {
                                            if (this.type === 'FireProjectile') {
                                                ctx.save();
                                                this.particles.forEach(p => {
                                                    ctx.beginPath();
                                                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                                                    if (p.colorType === 'yellow') {
                                                        ctx.fillStyle = `rgba(255, 200, 0, ${p.alpha})`;
                                                    } else if (p.colorType === 'orange') {
                                                        ctx.fillStyle = `rgba(255, 100, 0, ${p.alpha})`;
                                                    } else {
                                                        ctx.fillStyle = `rgba(255, 30, 0, ${p.alpha})`;
                                                    }
                                                    ctx.fill();
                                                });
                                                ctx.restore();
                                            } else if (this.type === 'BossFireballProjectile' || this.type === 'BossGiantFireball') {
                                                if (this.isBlackHole) {
                                                    if (this.particles.length > 0) {
                                                        ctx.save();
                                                        this.particles.forEach(p => {
                                                            if (p.colorType === 'black_hole_matter') {
                                                                ctx.beginPath();
                                                                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                                                                ctx.fillStyle = `rgba(180, 0, 255, ${p.alpha})`;
                                                                ctx.fill();
                                                            }
                                                        });
                                                        ctx.restore();
                                                    }
                                                    ctx.save();
                                                    ctx.translate(this.x, this.y);
                                                    const outerRadius = this.radius * 4;
                                                    const grad = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, outerRadius);
                                                    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                                                    grad.addColorStop(0.25, 'rgba(180, 0, 255, 0.85)');
                                                    grad.addColorStop(0.65, 'rgba(40, 0, 90, 0.45)');
                                                    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                                                    ctx.fillStyle = grad;
                                                    ctx.beginPath();
                                                    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
                                                    ctx.fill();
                                                    ctx.beginPath();
                                                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                                                    ctx.fillStyle = '#050010';
                                                    ctx.shadowColor = '#8a00e6';
                                                    ctx.shadowBlur = 24;
                                                    ctx.fill();
                                                    ctx.restore();
                                                } else {
                                                    ctx.save();
                                                    this.particles.forEach(p => {
                                                        ctx.beginPath();
                                                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                                                        ctx.fillStyle = p.colorType === 'red_fire'
                                                            ? `rgba(255, 60, 0, ${p.alpha})`
                                                            : `rgba(255, 200, 0, ${p.alpha})`;
                                                        ctx.fill();
                                                    });
                                                    ctx.restore();

                                                    ctx.save();
                                                    ctx.translate(this.x, this.y);
                                                    ctx.shadowColor = '#ff3d00';
                                                    ctx.shadowBlur = 12;
                                                    const sizeMultiplier = this.type === 'BossGiantFireball' ? 1.5 : 1.0;
                                                    const fireGrad = ctx.createRadialGradient(0, 0, this.radius * 0.2 * sizeMultiplier, 0, 0, this.radius * sizeMultiplier);
                                                    fireGrad.addColorStop(0, '#ffffff');
                                                    fireGrad.addColorStop(0.2, '#ffd54f');
                                                    fireGrad.addColorStop(0.5, '#ffa726');
                                                    fireGrad.addColorStop(1, 'rgba(230, 81, 0, 0)');
                                                    ctx.fillStyle = fireGrad;
                                                    ctx.beginPath();
                                                    ctx.arc(0, 0, this.radius * sizeMultiplier, 0, Math.PI * 2);
                                                    ctx.fill();
                                                    ctx.restore();
                                                }
                                            } else if (this.type === 'BossSlashProjectile') {
                                                const angle = Math.atan2(this.vy, this.vx);
                                                ctx.save();
                                                this.particles.forEach(p => {
                                                    ctx.beginPath();
                                                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                                                    ctx.fillStyle = (this.game.level === 5)
                                                        ? p.color.replace('0, 210, 255', '0, 230, 100')
                                                        : p.color;
                                                    ctx.fill();
                                                });
                                                ctx.restore();

                                                this.history.forEach((pos, idx) => {
                                                    const trailAlpha = (idx / this.history.length) * 0.22;
                                                    ctx.save();
                                                    ctx.translate(pos.x, pos.y);
                                                    ctx.rotate(pos.angle);
                                                    ctx.beginPath();
                                                    ctx.moveTo(0, -90 / 2);
                                                    ctx.quadraticCurveTo(35, 0, 0, 90 / 2);
                                                    ctx.quadraticCurveTo(35 * 0.3, 0, 0, -90 / 2);
                                                    ctx.closePath();
                                                    ctx.fillStyle = (this.game.level === 5)
                                                        ? `rgba(0, 230, 100, ${trailAlpha})`
                                                        : `rgba(0, 180, 255, ${trailAlpha})`;
                                                    ctx.fill();
                                                    ctx.restore();
                                                });

                                                ctx.save();
                                                ctx.translate(this.x, this.y);
                                                ctx.rotate(angle);
                                                ctx.beginPath();
                                                ctx.moveTo(0, -90 / 2);
                                                ctx.quadraticCurveTo(35, 0, 0, 90 / 2);
                                                ctx.quadraticCurveTo(35 * 0.3, 0, 0, -90 / 2);
                                                ctx.closePath();
                                                const grad = ctx.createLinearGradient(0, 0, 35, 0);
                                                if (this.game.level === 5) {
                                                    grad.addColorStop(0, 'rgba(0, 230, 100, 0)');
                                                    grad.addColorStop(0.3, 'rgba(0, 230, 100, 0.6)');
                                                    grad.addColorStop(0.7, 'rgba(180, 255, 200, 0.95)');
                                                    grad.addColorStop(1, '#ffffff');
                                                    ctx.shadowColor = '#00ff33';
                                                } else {
                                                    grad.addColorStop(0, 'rgba(0, 80, 255, 0)');
                                                    grad.addColorStop(0.3, 'rgba(0, 180, 255, 0.6)');
                                                    grad.addColorStop(0.7, 'rgba(160, 245, 255, 0.95)');
                                                    grad.addColorStop(1, '#ffffff');
                                                    ctx.shadowColor = '#00c8ff';
                                                }
                                                ctx.shadowBlur = 18;
                                                ctx.fillStyle = grad;
                                                ctx.fill();
                                                ctx.shadowBlur = 0;
                                                ctx.strokeStyle = 'rgba(230, 255, 255, 0.6)';
                                                ctx.lineWidth = 1.5;
                                                ctx.beginPath();
                                                ctx.moveTo(0, -90 / 2);
                                                ctx.quadraticCurveTo(35, 0, 0, 90 / 2);
                                                ctx.stroke();
                                                ctx.restore();
                                            } else if (this.type === 'StoneProjectile') {
                                                ctx.save();
                                                this.particles.forEach(p => {
                                                    ctx.beginPath();
                                                    ctx.moveTo(p.x, p.y - p.size);
                                                    ctx.lineTo(p.x + p.size, p.y);
                                                    ctx.lineTo(p.x, p.y + p.size);
                                                    ctx.lineTo(p.x - p.size, p.y);
                                                    ctx.closePath();
                                                    ctx.fillStyle = (this.game.level === 5)
                                                        ? `rgba(105, 240, 174, ${p.alpha})`
                                                        : `rgba(255, 215, 0, ${p.alpha})`;
                                                    ctx.fill();
                                                });
                                                ctx.translate(this.x, this.y);
                                                const flightAngle = Math.atan2(this.vy, this.vx);
                                                ctx.rotate(flightAngle);
                                                ctx.shadowColor = (this.game.level === 5) ? '#00c853' : '#ffab40';
                                                ctx.shadowBlur = 18;
                                                const diamondGrad = ctx.createLinearGradient(-this.radius * 1.5, 0, this.radius * 1.5, 0);
                                                if (this.game.level === 5) {
                                                    diamondGrad.addColorStop(0, '#b9f6ca');
                                                    diamondGrad.addColorStop(0.5, '#69f0ae');
                                                    diamondGrad.addColorStop(1, '#00c853');
                                                } else {
                                                    diamondGrad.addColorStop(0, '#ffd54f');
                                                    diamondGrad.addColorStop(0.5, '#ffa726');
                                                    diamondGrad.addColorStop(1, '#e65100');
                                                }
                                                ctx.beginPath();
                                                ctx.moveTo(0, -this.radius);
                                                ctx.lineTo(this.radius * 1.5, 0);
                                                ctx.lineTo(0, this.radius);
                                                ctx.lineTo(-this.radius * 1.5, 0);
                                                ctx.closePath();
                                                ctx.fillStyle = diamondGrad;
                                                ctx.fill();
                                                ctx.shadowBlur = 0;
                                                ctx.beginPath();
                                                ctx.moveTo(0, -this.radius * 0.4);
                                                ctx.lineTo(this.radius * 0.7, 0);
                                                ctx.lineTo(0, this.radius * 0.4);
                                                ctx.lineTo(-this.radius * 0.7, 0);
                                                ctx.closePath();
                                                ctx.fillStyle = '#ffffff';
                                                ctx.fill();
                                                ctx.restore();
                                            } else if (this.type === 'ArcherProjectile') {
                                                ctx.save();
                                                this.particles.forEach(p => {
                                                    ctx.beginPath();
                                                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                                                    ctx.fillStyle = `rgba(138, 43, 226, ${p.alpha})`; // purple energy trail
                                                    ctx.fill();
                                                });
                                                ctx.restore();

                                                if (multiplayerArcherProjImage.complete) {
                                                    ctx.save();
                                                    if (!this.facingLeft) {
                                                        ctx.scale(-1, 1);
                                                        ctx.drawImage(multiplayerArcherProjImage, -(this.x + 40), this.y, 40, 8);
                                                    } else {
                                                        ctx.drawImage(multiplayerArcherProjImage, this.x, this.y, 40, 8);
                                                    }
                                                    ctx.restore();
                                                }
                                            } else if (this.type === 'FirePillar') {
                                                ctx.save();
                                                const isErupting = this.timer >= this.delay;
                                                if (isErupting) {
                                                    const grad = ctx.createLinearGradient(this.x - 40, 0, this.x + 40, 0);
                                                    grad.addColorStop(0, 'rgba(255, 0, 0, 0)');
                                                    grad.addColorStop(0.3, 'rgba(255, 69, 0, 0.7)');
                                                    grad.addColorStop(0.5, 'rgba(255, 230, 100, 0.9)');
                                                    grad.addColorStop(0.7, 'rgba(255, 69, 0, 0.7)');
                                                    grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
                                                    ctx.fillStyle = grad;
                                                    ctx.fillRect(this.x - 40, 0, 80, this.y);
                                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                                                    ctx.fillRect(this.x - 6, 0, 12, this.y);
                                                } else {
                                                    const warningAlpha = 0.25 + 0.25 * Math.sin(Date.now() * 0.015);
                                                    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 80);
                                                    grad.addColorStop(0, `rgba(255, 0, 0, ${warningAlpha * 0.9})`);
                                                    grad.addColorStop(0.6, `rgba(255, 100, 0, ${warningAlpha * 0.4})`);
                                                    grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
                                                    ctx.beginPath();
                                                    ctx.ellipse(this.x, this.y, 80 * 1.2, 10, 0, 0, Math.PI * 2);
                                                    ctx.fillStyle = grad;
                                                    ctx.fill();
                                                }
                                                this.particles.forEach(p => {
                                                    ctx.beginPath();
                                                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                                                    ctx.fillStyle = p.color;
                                                    ctx.fill();
                                                });
                                                ctx.restore();
                                            } else if (this.type === 'FlameThrowerParticle') {
                                                ctx.save();
                                                const ratio = Math.min(1.0, this.timer / (this.life || 1000));
                                                const alpha = 1.0 - ratio;
                                                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                                                if (ratio < 0.4) {
                                                    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                                                    grad.addColorStop(0.3, `rgba(255, 215, 0, ${alpha * 0.85})`);
                                                    grad.addColorStop(0.8, `rgba(255, 69, 0, ${alpha * 0.4})`);
                                                } else if (ratio < 0.75) {
                                                    grad.addColorStop(0, `rgba(255, 140, 0, ${alpha * 0.9})`);
                                                    grad.addColorStop(0.5, `rgba(255, 0, 0, ${alpha * 0.5})`);
                                                    grad.addColorStop(1, 'rgba(120, 0, 0, 0)');
                                                } else {
                                                    grad.addColorStop(0, `rgba(130, 30, 0, ${alpha * 0.6})`);
                                                    grad.addColorStop(0.6, `rgba(40, 40, 40, ${alpha * 0.3})`);
                                                    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                                                }
                                                ctx.beginPath();
                                                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                                                ctx.fillStyle = grad;
                                                ctx.fill();
                                                ctx.restore();
                                            } else if (this.type === 'BossProjectile') {
                                                ctx.save();
                                                ctx.beginPath();
                                                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                                                ctx.fillStyle = '#ff3d00';
                                                ctx.shadowColor = '#ff3d00';
                                                ctx.shadowBlur = 12;
                                                ctx.fill();
                                                ctx.restore();
                                            } else {
                                                ctx.save();
                                                ctx.beginPath();
                                                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                                                ctx.fillStyle = '#00e5ff';
                                                ctx.shadowColor = '#00e5ff';
                                                ctx.shadowBlur = 8;
                                                ctx.fill();
                                                ctx.restore();
                                            }
                                        }
                                    };
                                });
                            }
                            if (se.attackType) {
                                le.pendingAttackType = se.attackType;
                            }
                        }
                    });
                }

                // Sync wave & portal states if not host
                if (!game.isHost) {
                    if (state.waveIndex !== undefined) game.waveIndex = state.waveIndex;
                    if (state.waveSpawnedCount !== undefined) game.waveSpawnedCount = state.waveSpawnedCount;
                    if (state.waveComplete !== undefined) game.waveComplete = state.waveComplete;

                    // Portal spawning sync
                    if (state.portal && !game.portal) {
                        const portalScreenX = state.portal.x - game.cameraX;
                        game.portal = new Portal(game, portalScreenX, state.portal.y);
                        game.portalSpawned = true;
                    } else if (!state.portal && game.portal) {
                        game.portal = null;
                        game.portalSpawned = false;
                    }
                }
            });
        }

        // SP Action
        spBtn.onclick = () => {
            mainMenu.classList.remove('active');
            // Trigger selection screen
            const selectionOverlay = document.getElementById('char-selection-overlay');
            if (selectionOverlay) selectionOverlay.classList.add('active');
            updateCharacterSelectionUI();
        };

        // Multiplayer Action — hide main menu, open lobby
        mpBtn.onclick = () => {
            // Auto-connect guest socket if not already connected (fixes join room for guests)
            if (!game.socket) {
                const savedToken = localStorage.getItem('shadowStrikeToken');
                connectSocket(savedToken || null);
            }
            mainMenu.classList.remove('active');
            lobbySelectionView.style.display = 'block';
            lobbyRoomView.style.display = 'none';
            lobbyOverlay.classList.add('active');
        };

        // Close buttons
        closeLobbyBtn.onclick = () => {
            window.location.href = 'index.html';
        };
        closeLeaderboardBtn.onclick = () => leaderboardOverlay.classList.remove('active');

        // Auth Toggle Link
        authToggleLink.onclick = () => {
            isSignupMode = !isSignupMode;
            if (isSignupMode) {
                authTitle.innerText = 'Sign Up';
                groupUsername.style.display = 'flex';
                labelEmailLogin.innerText = 'Email';
                authEmailInput.placeholder = 'Enter email';
                authSubmitBtn.innerText = 'Sign Up';
                authToggleLink.innerHTML = 'Already have an account? <span>Log In</span>';
            } else {
                authTitle.innerText = 'Log In';
                groupUsername.style.display = 'none';
                labelEmailLogin.innerText = 'Username or Email';
                authEmailInput.placeholder = 'Enter username or email';
                authSubmitBtn.innerText = 'Log In';
                authToggleLink.innerHTML = 'Need an account? <span>Sign Up</span>';
            }
        };

        // Auth Submit Form
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const route = isSignupMode ? '/auth/signup' : '/auth/login';
            const body = isSignupMode
                ? { username: authUsernameInput.value, email: authEmailInput.value, password: authPasswordInput.value }
                : { loginId: authEmailInput.value, password: authPasswordInput.value };

            authSubmitBtn.innerText = isSignupMode ? 'Registering...' : 'Authenticating...';
            const data = await makeRequest(route, 'POST', body);

            if (data && data.token) {
                localStorage.setItem('shadowStrikeToken', data.token);
                localStorage.setItem('shadowStrikeUser', JSON.stringify(data.user));
                updateUserUI(data.user);
                connectSocket(data.token);
                authOverlay.classList.remove('active');
                openLobbyDirectly();

                authUsernameInput.value = '';
                authEmailInput.value = '';
                authPasswordInput.value = '';
            } else {
                showToast(data.error || 'Authentication failed.', 'error');
            }
            authSubmitBtn.innerText = isSignupMode ? 'Sign Up' : 'Log In';
        };

        // Play as Guest — skip login, go to start screen
        authGuestBtn.onclick = () => {
            authOverlay.classList.remove('active');
            connectSocket(null);
            updateUserUI(null);
            openLobbyDirectly();
        };

        // Auth Action — LOG OUT: go back to login screen
        authActionBtn.onclick = () => {
            const token = localStorage.getItem('shadowStrikeToken');
            if (token || game.socket) {
                // Logged in → log out and show login screen
                localStorage.removeItem('shadowStrikeToken');
                localStorage.removeItem('shadowStrikeUser');
                updateUserUI(null);
                if (game.socket) {
                    game.socket.disconnect();
                    game.socket = null;
                }
                mainMenu.classList.remove('active');
                authOverlay.classList.add('active');
            }
        };

        // Create Room Action
        btnCreateRoom.onclick = () => {
            if (!game.socket || !game.socket.connected) {
                showToast('Connecting to server... Please wait and try again.', 'warning');
                return;
            }
            const mode = createModeSelect.value;
            const maxPlayers = createSizeSelect.value;
            const level = createLevelSelect.value;

            game.socket.emit('createRoom', { mode, maxPlayers, level }, (res) => {
                if (res.success) {
                    lobbySelectionView.style.display = 'none';
                    lobbyRoomView.style.display = 'grid';
                    lobbyChatMessages.innerHTML = '';
                } else {
                    showToast(res.error || 'Failed to create room.', 'error');
                }
            });
        };

        // Join Room Action
        btnJoinRoom.onclick = () => {
            if (!game.socket || !game.socket.connected) {
                showToast('Connecting to server... Please wait and try again.', 'warning');
                return;
            }
            const code = joinCodeInput.value.trim().toUpperCase();
            if (code.length !== 6) { showToast('Room Code must be 6 characters.', 'warning'); return; }

            game.socket.emit('joinRoom', { code }, (res) => {
                if (res.success) {
                    lobbySelectionView.style.display = 'none';
                    lobbyRoomView.style.display = 'grid';
                    lobbyChatMessages.innerHTML = '';
                    joinCodeInput.value = '';
                } else {
                    showToast(res.error || 'Room joining failed.', 'error');
                }
            });
        };

        // Roster Options Change
        lobbyCharSelect.onchange = () => {
            if (!game.socket || !currentRoomCode) return;
            game.socket.emit('selectCharacter', { code: currentRoomCode, characterType: lobbyCharSelect.value });
        };

        btnToggleReady.onclick = () => {
            if (!game.socket || !currentRoomCode) return;
            game.socket.emit('toggleReady', { code: currentRoomCode });
        };

        btnStartMatch.onclick = () => {
            if (!game.socket || !currentRoomCode) return;
            game.socket.emit('startGame', { code: currentRoomCode }, (res) => {
                if (!res.success) {
                    showToast(res.error || 'Failed to start match.', 'error');
                }
            });
        };

        // Chat Box send message
        btnSendChat.onclick = () => {
            sendChat();
        };

        lobbyChatInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                sendChat();
            }
        };

        function sendChat() {
            if (!game.socket || !currentRoomCode) return;
            const msg = lobbyChatInput.value.trim();
            if (msg.length === 0) return;

            game.socket.emit('sendChatMessage', { code: currentRoomCode, message: msg });
            lobbyChatInput.value = '';
        }

        // Leave Room Action
        btnLeaveRoom.onclick = () => {
            if (!game.socket) return;
            game.socket.emit('leaveRoom');
            lobbySelectionView.style.display = 'block';
            lobbyRoomView.style.display = 'none';
            currentRoomCode = null;
        };

        // Profile Modal Events
        const profileBtn = document.getElementById('profile-btn');
        const profileOverlay = document.getElementById('profile-overlay');
        const closeProfileBtn = document.getElementById('close-profile');
        const btnProfileLogout = document.getElementById('btn-profile-logout');

        if (profileBtn && profileOverlay) {
            profileBtn.onclick = (e) => {
                e.stopPropagation();
                // Close settings if open
                const settingsOverlay = document.getElementById('settings-overlay');
                if (settingsOverlay) settingsOverlay.classList.remove('active');
                profileOverlay.classList.add('active');
            };
        }

        if (closeProfileBtn && profileOverlay) {
            closeProfileBtn.onclick = () => {
                profileOverlay.classList.remove('active');
            };
        }

        if (profileOverlay) {
            profileOverlay.addEventListener('click', (e) => {
                if (e.target === profileOverlay) {
                    profileOverlay.classList.remove('active');
                }
            });
        }

        if (btnProfileLogout) {
            btnProfileLogout.onclick = () => {
                localStorage.removeItem('shadowStrikeToken');
                localStorage.removeItem('shadowStrikeUser');
                updateUserUI(null);
                if (game.socket) {
                    game.socket.disconnect();
                    game.socket = null;
                }
                if (profileOverlay) profileOverlay.classList.remove('active');
                authOverlay.classList.add('active');
            };
        }

        // Mode Selection Overlay Events
        const modeSelectionOverlay = document.getElementById('mode-selection-overlay');
        const closeModeSelectionBtn = document.getElementById('close-mode-selection');
        const btnModeSP = document.getElementById('btn-mode-sp');
        const btnModeMP = document.getElementById('btn-mode-mp');

        if (closeModeSelectionBtn && modeSelectionOverlay) {
            closeModeSelectionBtn.onclick = () => {
                modeSelectionOverlay.classList.remove('active');
            };
        }

        if (modeSelectionOverlay) {
            modeSelectionOverlay.addEventListener('click', (e) => {
                if (e.target === modeSelectionOverlay) {
                    modeSelectionOverlay.classList.remove('active');
                }
            });
        }

        if (btnModeSP && modeSelectionOverlay) {
            btnModeSP.onclick = () => {
                modeSelectionOverlay.classList.remove('active');
                const charOv = document.getElementById('char-selection-overlay');
                if (charOv) charOv.classList.add('active');
                updateCharacterSelectionUI();
            };
        }

        if (btnModeMP && modeSelectionOverlay) {
            btnModeMP.onclick = () => {
                modeSelectionOverlay.classList.remove('active');
                lobbySelectionView.style.display = 'block';
                lobbyRoomView.style.display = 'none';
                lobbyOverlay.classList.add('active');
            };
        }

        // Copy Room Code Action
        const btnCopyCode = document.getElementById('btn-copy-code');
        if (btnCopyCode) {
            btnCopyCode.onclick = () => {
                const code = roomCodeDisplay.innerText;
                if (!code || code === 'XXXXXX') return;

                navigator.clipboard.writeText(code).then(() => {
                    const origText = btnCopyCode.innerText;
                    btnCopyCode.innerText = '✓ COPIED';
                    btnCopyCode.style.borderColor = '#2ecc71';
                    btnCopyCode.style.color = '#2ecc71';
                    setTimeout(() => {
                        btnCopyCode.innerText = origText;
                        btnCopyCode.style.borderColor = '#00e5ff';
                        btnCopyCode.style.color = '#00e5ff';
                    }, 1500);
                }).catch(err => {
                    console.error('Failed to copy room code:', err);
                });
            };
        }
    }

    setupMultiplayerAndAuth(game);

    let lastTime = 0;

    let osControlsEnabled = localStorage.getItem('shadowStrike_osControls') === 'true';
    let lastShowControls = null;

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
        if (isCustomizingLayout) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
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

    // ── Settings: Single Player, Multiplayer, Logout buttons ──────────
    const settingsSPBtn = document.getElementById('btn-settings-sp');
    if (settingsSPBtn) {
        settingsSPBtn.addEventListener('click', () => {
            settingsOverlay.classList.remove('active');
            game.paused = false;
            const charOv = document.getElementById('char-selection-overlay');
            if (charOv) { charOv.classList.add('active'); updateCharacterSelectionUI(); }
        });
    }
    const settingsMPBtn = document.getElementById('btn-settings-mp');
    if (settingsMPBtn) {
        settingsMPBtn.addEventListener('click', () => {
            settingsOverlay.classList.remove('active');
            game.paused = false;
            const lobbyEl = document.getElementById('html-lobby-overlay');
            const lobbySelView = document.getElementById('lobby-selection-view');
            const lobbyRoomView = document.getElementById('lobby-room-view');
            if (lobbySelView) lobbySelView.style.display = 'block';
            if (lobbyRoomView) lobbyRoomView.style.display = 'none';
            if (lobbyEl) lobbyEl.classList.add('active');
        });
    }
    const settingsLogoutBtn = document.getElementById('btn-settings-logout');
    if (settingsLogoutBtn) {
        settingsLogoutBtn.addEventListener('click', () => {
            settingsOverlay.classList.remove('active');
            game.paused = false;
            localStorage.removeItem('shadowStrikeToken');
            localStorage.removeItem('shadowStrikeUser');
            if (game.socket) { game.socket.disconnect(); game.socket = null; }
            document.getElementById('html-auth-overlay').classList.add('active');
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

    // ── Fullscreen Toggle ──────────────────────────────────────────────
    const fullscreenFloatingBtn = document.getElementById('fullscreen-btn');
    const fullscreenSettingsBtn = document.getElementById('fullscreen-settings-btn');
    const fsIconExpand = document.getElementById('fs-icon-expand');
    const fsIconExit = document.getElementById('fs-icon-exit');
    const fsSettIconExpand = document.getElementById('fs-settings-icon-expand');
    const fsSettIconExit = document.getElementById('fs-settings-icon-exit');
    const fsSettLabel = document.getElementById('fs-settings-label');

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Fullscreen request failed:', err.message);
            });
        } else {
            // Exit fullscreen
            document.exitFullscreen();
        }
    }

    function updateFsIcons() {
        const isFs = !!document.fullscreenElement;
        // Floating button icons
        if (fsIconExpand) fsIconExpand.style.display = isFs ? 'none' : 'block';
        if (fsIconExit) fsIconExit.style.display = isFs ? 'block' : 'none';
        // Settings panel icons + label
        if (fsSettIconExpand) fsSettIconExpand.style.display = isFs ? 'none' : 'inline';
        if (fsSettIconExit) fsSettIconExit.style.display = isFs ? 'inline' : 'none';
        if (fsSettLabel) fsSettLabel.textContent = isFs ? 'EXIT FULLSCREEN' : 'FULLSCREEN';
    }

    if (fullscreenFloatingBtn) {
        fullscreenFloatingBtn.addEventListener('click', (e) => {
            if (isCustomizingLayout) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            e.stopPropagation();
            toggleFullscreen();
        });
    }
    if (fullscreenSettingsBtn) fullscreenSettingsBtn.addEventListener('click', () => toggleFullscreen());
    document.addEventListener('fullscreenchange', updateFsIcons);


    const osControlsToggle = document.getElementById('os-controls-toggle');
    const controlsToggleTxt = document.getElementById('controls-toggle-txt');
    const virtualControlsContainer = document.getElementById('virtual-controls');

    // Load initial preference from local storage
    const showVirtualControls = localStorage.getItem('shadowStrike_osControls') === 'true';
    osControlsToggle.checked = showVirtualControls;
    if (showVirtualControls) {
        controlsToggleTxt.innerText = 'ON';
        controlsToggleTxt.style.color = '#00e5ff';
        controlsToggleTxt.style.textShadow = '0 0 10px rgba(0, 229, 255, 0.6)';
    } else {
        controlsToggleTxt.innerText = 'OFF';
        controlsToggleTxt.style.color = 'rgba(255, 255, 255, 0.45)';
        controlsToggleTxt.style.textShadow = 'none';
    }

    osControlsToggle.addEventListener('change', (e) => {
        const active = e.target.checked;
        localStorage.setItem('shadowStrike_osControls', active ? 'true' : 'false');
        osControlsEnabled = active;
        if (active) {
            controlsToggleTxt.innerText = 'ON';
            controlsToggleTxt.style.color = '#00e5ff';
            controlsToggleTxt.style.textShadow = '0 0 10px rgba(0, 229, 255, 0.6)';
        } else {
            controlsToggleTxt.innerText = 'OFF';
            controlsToggleTxt.style.color = 'rgba(255, 255, 255, 0.45)';
            controlsToggleTxt.style.textShadow = 'none';
        }
    });

    // ── Layout Customizer Variables & Functions ──────────────────────
    let isCustomizingLayout = false;
    let selectedElement = null;
    let layoutConfig = JSON.parse(localStorage.getItem('shadowStrike_layoutConfig') || '{}');

    function updateButtonPositions() {
        if (!settingsBtn || !fullscreenFloatingBtn) return;

        const isSettingsCustomized = (layoutConfig && layoutConfig['settings-btn']) || isCustomizingLayout;
        const isFsCustomized = (layoutConfig && layoutConfig['fullscreen-btn']) || isCustomizingLayout;

        if (!isSettingsCustomized || !isFsCustomized) {
            const canvasRect = canvas.getBoundingClientRect();
            const canvasWidth = canvas.width || 1550;
            const scale = canvasRect.width > 0 ? (canvasRect.width / canvasWidth) : 1;

            const hx = 16;
            const hy = 12;
            const hw = 300;
            const hh = 74;

            const btnSize = Math.max(32, Math.min(48, 48 * scale));

            const hudCenterY = canvasRect.top + (hy + hh / 2) * scale;
            const btnY = hudCenterY - btnSize / 2;

            const hudRightX = canvasRect.left + (hx + hw) * scale;
            const gap = 15 * scale;

            const settingsX = hudRightX + gap;
            const fullscreenX = settingsX + btnSize + 10 * scale;

            if (!isSettingsCustomized) {
                settingsBtn.style.position = 'fixed';
                settingsBtn.style.bottom = 'auto';
                settingsBtn.style.top = `${btnY}px`;
                settingsBtn.style.left = `${settingsX}px`;
                settingsBtn.style.width = `${btnSize}px`;
                settingsBtn.style.height = `${btnSize}px`;
                settingsBtn.style.transition = 'none';
            }
            if (!isFsCustomized) {
                fullscreenFloatingBtn.style.position = 'fixed';
                fullscreenFloatingBtn.style.bottom = 'auto';
                fullscreenFloatingBtn.style.top = `${btnY}px`;
                fullscreenFloatingBtn.style.left = `${fullscreenX}px`;
                fullscreenFloatingBtn.style.width = `${btnSize}px`;
                fullscreenFloatingBtn.style.height = `${btnSize}px`;
                fullscreenFloatingBtn.style.transition = 'none';
            }
        }

        if (isSettingsCustomized && layoutConfig && layoutConfig['settings-btn'] && !isCustomizingLayout) {
            const conf = layoutConfig['settings-btn'];
            settingsBtn.style.position = 'absolute';
            settingsBtn.style.left = `${conf.left}%`;
            settingsBtn.style.top = `${conf.top}%`;
            settingsBtn.style.width = `${conf.size}px`;
            settingsBtn.style.height = `${conf.size}px`;
            settingsBtn.style.opacity = conf.opacity;
            settingsBtn.style.bottom = 'auto';
            settingsBtn.style.right = 'auto';
            settingsBtn.style.transform = 'none';
            settingsBtn.style.transition = 'none';
        }
        if (isFsCustomized && layoutConfig && layoutConfig['fullscreen-btn'] && !isCustomizingLayout) {
            const conf = layoutConfig['fullscreen-btn'];
            fullscreenFloatingBtn.style.position = 'absolute';
            fullscreenFloatingBtn.style.left = `${conf.left}%`;
            fullscreenFloatingBtn.style.top = `${conf.top}%`;
            fullscreenFloatingBtn.style.width = `${conf.size}px`;
            fullscreenFloatingBtn.style.height = `${conf.size}px`;
            fullscreenFloatingBtn.style.opacity = conf.opacity;
            fullscreenFloatingBtn.style.bottom = 'auto';
            fullscreenFloatingBtn.style.right = 'auto';
            fullscreenFloatingBtn.style.transform = 'none';
            fullscreenFloatingBtn.style.transition = 'none';
        }
    }

    window.addEventListener('resize', () => {
        const showControls = (game.gameStarted && !game.paused && !game.levelComplete && !game.gameOver && osControlsEnabled) || isCustomizingLayout;
        if (showControls) {
            updateButtonPositions();
        }
    });

    function applyLayout() {
        const buttons = [
            ...virtualControlsContainer.querySelectorAll('.vbtn'),
            settingsBtn,
            fullscreenFloatingBtn
        ].filter(Boolean);
        // Clear all inline styles first to revert to CSS defaults
        buttons.forEach(btn => {
            btn.style.position = '';
            btn.style.left = '';
            btn.style.top = '';
            btn.style.width = '';
            btn.style.height = '';
            btn.style.opacity = '';
            btn.style.bottom = '';
            btn.style.right = '';
            btn.style.transform = '';
        });

        const hasSavedConfig = Object.keys(layoutConfig).length > 0;
        if (hasSavedConfig) {
            virtualControlsContainer.classList.add('has-custom-layout');
        } else {
            virtualControlsContainer.classList.remove('has-custom-layout');
        }

        for (const id in layoutConfig) {
            const btn = document.getElementById(id);
            if (btn) {
                let conf = layoutConfig[id];

                // Validate coordinates to prevent NaN / null coordinates piling bugs
                if (!conf || isNaN(conf.left) || isNaN(conf.top) || conf.left === null || conf.top === null) {
                    conf = getBtnDefaultLayout(btn);
                    layoutConfig[id] = conf;
                }

                btn.style.position = 'absolute';
                btn.style.left = `${conf.left}%`;
                btn.style.top = `${conf.top}%`;
                btn.style.width = `${conf.size}px`;
                btn.style.height = `${conf.size}px`;
                btn.style.opacity = conf.opacity;
                btn.style.bottom = 'auto';
                btn.style.right = 'auto';
                btn.style.transform = 'none';
            }
        }
        updateButtonPositions();
    }

    function getBtnDefaultLayout(btn) {
        const rect = btn.getBoundingClientRect();
        const parentRect = virtualControlsContainer.getBoundingClientRect();

        let leftPercent = 0;
        let topPercent = 0;

        if (parentRect.width > 0 && parentRect.height > 0 && rect.width > 0) {
            leftPercent = ((rect.left - parentRect.left) / parentRect.width) * 100;
            topPercent = ((rect.top - parentRect.top) / parentRect.height) * 100;
        }

        // Fallback robust coordinates if dimensions are not laid out/computed yet (hidden screen or page load)
        if (isNaN(leftPercent) || !isFinite(leftPercent) || leftPercent <= 0 || parentRect.width === 0) {
            const fallbacks = {
                'vbtn-left': { left: 4, top: 80 },
                'vbtn-right': { left: 11, top: 80 },
                'vbtn-q': { left: 78, top: 62 },
                'vbtn-e': { left: 84, top: 56 },
                'vbtn-r': { left: 90, top: 62 },
                'vbtn-dash': { left: 74, top: 80 },
                'vbtn-jump': { left: 82, top: 72 },
                'vbtn-attack': { left: 90, top: 80 },
                'vbtn-special': { left: 86, top: 68 },
                'vbtn-interact': { left: 80, top: 76 },
                'settings-btn': { left: 21.5, top: 6 },
                'fullscreen-btn': { left: 25.2, top: 6 }
            };
            const f = fallbacks[btn.id] || { left: 50, top: 50 };
            leftPercent = f.left;
            topPercent = f.top;
        }

        const style = window.getComputedStyle(btn);
        return {
            left: leftPercent,
            top: topPercent,
            size: parseFloat(style.width) || 60,
            opacity: parseFloat(style.opacity) || 0.85
        };
    }

    function resetLayoutToDefault() {
        localStorage.removeItem('shadowStrike_layoutConfig');
        layoutConfig = {};
        const buttons = [
            ...virtualControlsContainer.querySelectorAll('.vbtn'),
            settingsBtn,
            fullscreenFloatingBtn
        ].filter(Boolean);
        buttons.forEach(btn => {
            btn.style.position = '';
            btn.style.left = '';
            btn.style.top = '';
            btn.style.width = '';
            btn.style.height = '';
            btn.style.opacity = '';
            btn.style.bottom = '';
            btn.style.right = '';
            btn.style.transform = '';
            btn.classList.remove('selected-el');
        });

        // Repopulate with safe defaults inside customizer memory so subsequent drags don't crash
        if (isCustomizingLayout) {
            buttons.forEach(btn => {
                layoutConfig[btn.id] = getBtnDefaultLayout(btn);
            });
        }

        layoutElementEditor.classList.remove('active');
        selectedElement = null;
        applyLayout();
    }

    // Initialize layout positions
    applyLayout();



    // Customizer UI Element Selectors
    const customizeLayoutBtn = document.getElementById('customize-layout-btn');
    const layoutElementEditor = document.getElementById('layout-element-editor');
    const elSizeSlider = document.getElementById('el-size-slider');
    const elOpacitySlider = document.getElementById('el-opacity-slider');
    const elSizeTxt = document.getElementById('el-size-txt');
    const elOpacityTxt = document.getElementById('el-opacity-txt');
    const selectedElName = document.getElementById('selected-el-name');

    function selectElement(btn) {
        if (selectedElement) {
            selectedElement.classList.remove('selected-el');
        }
        selectedElement = btn;
        selectedElement.classList.add('selected-el');
        layoutElementEditor.classList.add('active');

        const id = btn.id;
        const config = layoutConfig[id];
        let displayName = btn.innerText || btn.id.replace('vbtn-', '').toUpperCase();
        if (displayName === '←') displayName = 'LEFT';
        if (displayName === '→') displayName = 'RIGHT';
        if (btn.id === 'settings-btn') displayName = 'SETTINGS';
        if (btn.id === 'fullscreen-btn') displayName = 'FULLSCREEN';
        selectedElName.innerText = `Edit: ${displayName}`;

        elSizeSlider.value = config.size;
        elSizeTxt.innerText = `${Math.round(config.size)}px`;

        elOpacitySlider.value = Math.round(config.opacity * 100);
        elOpacityTxt.innerText = `${Math.round(config.opacity * 100)}%`;
    }

    customizeLayoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsOverlay.classList.remove('active');
        isCustomizingLayout = true;
        virtualControlsContainer.classList.add('active');
        virtualControlsContainer.classList.add('layout-customizing');

        // Show special and interact buttons during customization so they are visible and editable!
        const specialBtn = document.getElementById('vbtn-special');
        if (specialBtn) specialBtn.style.display = 'flex';
        const interactBtn = document.getElementById('vbtn-interact');
        if (interactBtn) interactBtn.style.display = 'flex';

        const buttons = [
            ...virtualControlsContainer.querySelectorAll('.vbtn'),
            settingsBtn,
            fullscreenFloatingBtn
        ].filter(Boolean);
        buttons.forEach(btn => {
            const id = btn.id;
            if (!layoutConfig[id]) {
                layoutConfig[id] = getBtnDefaultLayout(btn);
            }
        });
        applyLayout();
    });

    elSizeSlider.addEventListener('input', (e) => {
        if (!selectedElement) return;
        const size = parseInt(e.target.value);
        elSizeTxt.innerText = `${size}px`;
        selectedElement.style.width = `${size}px`;
        selectedElement.style.height = `${size}px`;
        layoutConfig[selectedElement.id].size = size;
    });

    elOpacitySlider.addEventListener('input', (e) => {
        if (!selectedElement) return;
        const val = parseInt(e.target.value);
        elOpacityTxt.innerText = `${val}%`;
        selectedElement.style.opacity = val / 100;
        layoutConfig[selectedElement.id].opacity = val / 100;
    });

    const layoutResetBtn = document.getElementById('layout-reset-btn');
    layoutResetBtn.addEventListener('click', () => {
        const ok = window.confirm("Reset layout to default console positions?");
        if (ok) {
            resetLayoutToDefault();
        }
    });

    const layoutCloseBtn = document.getElementById('layout-close-btn');
    function exitCustomizer() {
        isCustomizingLayout = false;
        virtualControlsContainer.classList.remove('layout-customizing');
        layoutElementEditor.classList.remove('active');
        if (selectedElement) {
            selectedElement.classList.remove('selected-el');
            selectedElement = null;
        }

        // Hide F and T buttons on exit customization unless active in game
        const specialBtn = document.getElementById('vbtn-special');
        if (specialBtn) {
            const hasSpecial = game && game.activeSpecialMove && game.specialMoveUses > 0;
            specialBtn.style.display = hasSpecial ? 'flex' : 'none';
        }
        const interactBtn = document.getElementById('vbtn-interact');
        if (interactBtn) {
            interactBtn.style.display = 'none'; // toggled dynamically in game loop
        }

        const show = localStorage.getItem('shadowStrike_osControls') === 'true';
        if (!show) {
            virtualControlsContainer.classList.remove('active');
        }
    }

    layoutCloseBtn.addEventListener('click', () => {
        // Reload layout
        layoutConfig = JSON.parse(localStorage.getItem('shadowStrike_layoutConfig') || '{}');
        applyLayout();
        exitCustomizer();
        settingsOverlay.classList.add('active');
    });

    const layoutSaveBtn = document.getElementById('layout-save-btn');
    layoutSaveBtn.addEventListener('click', () => {
        localStorage.setItem('shadowStrike_layoutConfig', JSON.stringify(layoutConfig));
        exitCustomizer();
        settingsOverlay.classList.add('active');
    });

    // Deselect elements on backdrop click
    virtualControlsContainer.addEventListener('mousedown', (e) => {
        if (isCustomizingLayout && e.target === virtualControlsContainer) {
            if (selectedElement) {
                selectedElement.classList.remove('selected-el');
                selectedElement = null;
            }
            layoutElementEditor.classList.remove('active');
        }
    });
    virtualControlsContainer.addEventListener('touchstart', (e) => {
        if (isCustomizingLayout && e.target === virtualControlsContainer) {
            if (selectedElement) {
                selectedElement.classList.remove('selected-el');
                selectedElement = null;
            }
            layoutElementEditor.classList.remove('active');
        }
    });

    // Bind virtual buttons gameplay key events
    const vButtons = virtualControlsContainer.querySelectorAll('.vbtn');
    vButtons.forEach(btn => {
        const key = btn.getAttribute('data-key');
        if (!key) return;

        // Touch handlers for mobile devices
        btn.addEventListener('touchstart', (e) => {
            if (isCustomizingLayout) return;
            e.preventDefault();
            game.input.pressVirtualKey(key);

            // Dialogue / narrative advancement on Jump touch
            if (game.storyDialogueManager && game.storyDialogueManager.active && key === 'Space') {
                game.storyDialogueManager.nextStep();
            }

            // QTE trigger integration (Space or E keys)
            if (qteActive && (key === 'e' || key === 'Space')) {
                qteProgress += 12;
                document.getElementById('qte-bar-fill').style.width = Math.min(100, qteProgress) + '%';
                if (qteProgress >= qteMax) {
                    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
                }
            }
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            if (isCustomizingLayout) return;
            e.preventDefault();
            game.input.releaseVirtualKey(key);
        }, { passive: false });

        btn.addEventListener('touchcancel', (e) => {
            if (isCustomizingLayout) return;
            e.preventDefault();
            game.input.releaseVirtualKey(key);
        }, { passive: false });

        // Mouse handlers for desktop / testing
        btn.addEventListener('mousedown', (e) => {
            if (isCustomizingLayout) return;
            if (e.button === 0) {
                game.input.pressVirtualKey(key);

                // Dialogue / narrative advancement on Jump click
                if (game.storyDialogueManager && game.storyDialogueManager.active && key === 'Space') {
                    game.storyDialogueManager.nextStep();
                }

                // QTE trigger integration on click
                if (qteActive && (key === 'e' || key === 'Space')) {
                    qteProgress += 12;
                    document.getElementById('qte-bar-fill').style.width = Math.min(100, qteProgress) + '%';
                    if (qteProgress >= qteMax) {
                        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
                    }
                }
            }
        });

        btn.addEventListener('mouseup', (e) => {
            if (isCustomizingLayout) return;
            if (e.button === 0) {
                game.input.releaseVirtualKey(key);
            }
        });

        btn.addEventListener('mouseleave', (e) => {
            if (isCustomizingLayout) return;
            game.input.releaseVirtualKey(key);
        });
    });

    // Bind layout customizer drag events for all customizable elements
    const customizableButtons = [
        ...virtualControlsContainer.querySelectorAll('.vbtn'),
        settingsBtn,
        fullscreenFloatingBtn
    ].filter(Boolean);

    customizableButtons.forEach(btn => {
        let isDragging = false;
        let startX, startY;
        let startLeft, startTop;

        const onDragStart = (clientX, clientY) => {
            if (!isCustomizingLayout) return;
            isDragging = true;
            selectElement(btn);

            startX = clientX;
            startY = clientY;

            const id = btn.id;
            startLeft = layoutConfig[id].left;
            startTop = layoutConfig[id].top;

            btn.style.transition = 'none'; // prevents transitions from delaying drag
        };

        const onDragMove = (clientX, clientY) => {
            if (!isDragging || !isCustomizingLayout) return;

            const dx = clientX - startX;
            const dy = clientY - startY;

            const parentRect = virtualControlsContainer.getBoundingClientRect();
            const dxPercent = (dx / parentRect.width) * 100;
            const dyPercent = (dy / parentRect.height) * 100;

            const newLeft = Math.max(0, Math.min(100 - (btn.offsetWidth / parentRect.width) * 100, startLeft + dxPercent));
            const newTop = Math.max(0, Math.min(100 - (btn.offsetHeight / parentRect.height) * 100, startTop + dyPercent));

            btn.style.left = `${newLeft}%`;
            btn.style.top = `${newTop}%`;

            const id = btn.id;
            layoutConfig[id].left = newLeft;
            layoutConfig[id].top = newTop;
        };

        const onDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            btn.style.transition = '';
        };

        btn.addEventListener('touchstart', (e) => {
            if (isCustomizingLayout) {
                e.preventDefault();
                const touch = e.touches[0];
                onDragStart(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (isDragging && isCustomizingLayout) {
                e.preventDefault();
                const touch = e.touches[0];
                onDragMove(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        window.addEventListener('touchend', () => {
            onDragEnd();
        });

        btn.addEventListener('mousedown', (e) => {
            if (isCustomizingLayout && e.button === 0) {
                e.preventDefault();
                onDragStart(e.clientX, e.clientY);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging && isCustomizingLayout) {
                onDragMove(e.clientX, e.clientY);
            }
        });

        window.addEventListener('mouseup', () => {
            onDragEnd();
        });
    });
    // ─────────────────────────────────────────────────────────────────

    canvas.addEventListener('click', function (e) {

        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        if (game.isMultiplayer && (game.gameOver || game.levelComplete)) {
            const bW = 280;
            const bH = 54;
            const bX = canvas.width / 2 - bW / 2;
            const bY = canvas.height / 2 + 160;
            if (mx >= bX && mx <= bX + bW && my >= bY && my <= bY + bH) {
                game.exitMultiplayerMatch();
            }
            return;
        }

        if (!game.gameStarted && !game.startTransition) {
            const W = canvas.width, H = canvas.height;
            const btnW = 220, btnH = 50;
            const btnX = W / 2 - btnW / 2;
            const btnY = H / 2 - 52;
            const onButton = mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH;

            if (onButton) {
                const modeSel = document.getElementById('mode-selection-overlay');
                if (modeSel && !modeSel.classList.contains('active')) {
                    modeSel.classList.add('active');
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

                if (game.level >= 20) {
                    // Trigger Post-Credits Scene instead of going back to Level 1
                    document.getElementById('post-credit-overlay').style.display = 'flex';
                    const textContainer = document.getElementById('post-credit-text-container');
                    textContainer.innerHTML = `
                        <div class="void-text">Void ke bohot andar—</div>
                        <div class="void-text" style="animation-delay: 2s;">Ek bada sa takht jaag utha hai.</div>
                        <div class="void-text" style="animation-delay: 4s;">Lakhon laal aakhein khul gayi hain.</div>
                        <div class="void-text" style="animation-delay: 6s;">"Amarjeet har chuka hai."</div>
                        <div class="void-text" style="animation-delay: 8s;">"Sahi hai."</div>
                        <div class="void-text" style="animation-delay: 10s;">"Saare darwaze khol do."</div>
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
        { id: 10, name: "EDGE OF REALITY", desc: "The final battle. Break Amarjeet Da Black Hole.", playable: true, theme: "neon-green" },
        { id: 11, name: "SHADOW CITY II", desc: "The shadows return. Confront the upgraded Shadow Lord.", playable: true, theme: "cyan" },
        { id: 12, name: "SPIDER FOREST II", desc: "The spider forest grows more hostile. Battle Mecha-Stone V2.", playable: true, theme: "amber" },
        { id: 13, name: "HALLOWEEN HOUSE II", desc: "The Dragon Lord awakens with twice the fury in the haunted cabin.", playable: true, theme: "purple" },
        { id: 14, name: "HAUNTED GRAVEYARD II", desc: "The spirits scream in anger. Defeat the Mino Boss once more.", playable: true, theme: "crimson" },
        { id: 15, name: "MUSHROOM GROVE II", desc: "The Impaler has reclaimed the grove. Strike him down.", playable: true, theme: "neon-green" },
        { id: 16, name: "CRYSTAL CAVERNS II", desc: "The crystals glow in warning. Shatter the Crystal Titan.", playable: true, theme: "cyan" },
        { id: 17, name: "SKY TEMPLE II", desc: "A localized storm rages in the sky. Challenge the Storm Seraph.", playable: true, theme: "amber" },
        { id: 18, name: "FROZEN ABYSS II", desc: "Temperature drops to absolute zero. Defeat the Frost Wyrm.", playable: true, theme: "purple" },
        { id: 19, name: "VOID KINGDOM II", desc: "Reality collapses completely. Confront the Abyss Knight.", playable: true, theme: "crimson" },
        { id: 20, name: "ULTIMATE SHOWDOWN", desc: "The final showdown. Defeat Amarjeet Da Black Hole once and for all.", playable: true, theme: "neon-green" }
    ];

    let selectedLevel = Math.min(20, parseInt(localStorage.getItem('maxUnlockedLevel') || '1'));

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
                // In-game: return to the paused settings overlay
                if (settingsOverlay) {
                    settingsOverlay.classList.add('active');
                }
            } else {
                // Pre-game: show mode selection panel
                const modeSel = document.getElementById('mode-selection-overlay');
                if (modeSel) {
                    modeSel.classList.add('active');
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

    function gatherInterpolatableObjects(game) {
        const list = [];
        function add(obj, props = ['x', 'y']) {
            if (!obj) return;
            list.push({ obj, props });
        }
        if (game.player) {
            add(game.player);
            if (game.player.windProjectiles) game.player.windProjectiles.forEach(p => add(p));
            if (game.player.slashProjectiles) game.player.slashProjectiles.forEach(p => add(p));
        }
        if (game.isMultiplayer && game.players) {
            game.players.forEach(p => {
                if (p.id !== game.playerId) {
                    add(p);
                }
            });
        }
        if (game.enemies) {
            game.enemies.forEach(enemy => {
                add(enemy);
                if (enemy.projectiles) enemy.projectiles.forEach(p => add(p));
            });
        }
        if (game.coinPickups) game.coinPickups.forEach(c => add(c));
        if (game.hpPickups) game.hpPickups.forEach(c => add(c));
        if (game.dropbox) add(game.dropbox);
        if (game.portal) add(game.portal);

        return list;
    }

    let accumulator = 0;
    const timestep = 1000 / 60; // 16.666ms (60 Hz fixed timestep)

    function Animate(timeStamp) {
        if (!lastTime) lastTime = timeStamp;
        let elapsed = timeStamp - lastTime;
        lastTime = timeStamp;

        // Cap elapsed time to avoid "spiral of death" during heavy lag
        if (elapsed > 100) elapsed = 100;

        accumulator += elapsed;

        // Toggle virtual controls container display state
        const showControls = (game.gameStarted && !game.paused && !game.levelComplete && !game.gameOver && osControlsEnabled) || isCustomizingLayout;
        const vContainer = document.getElementById('virtual-controls');
        if (vContainer && showControls !== lastShowControls) {
            lastShowControls = showControls;
            if (showControls) {
                vContainer.classList.add('active');
                updateButtonPositions();
            } else {
                vContainer.classList.remove('active');

                // Reset settings and fullscreen buttons to default CSS positions
                if (settingsBtn) {
                    settingsBtn.style.position = '';
                    settingsBtn.style.bottom = '';
                    settingsBtn.style.top = '';
                    settingsBtn.style.left = '';
                    settingsBtn.style.width = '';
                    settingsBtn.style.height = '';
                    settingsBtn.style.transition = '';
                }
                if (fullscreenFloatingBtn) {
                    fullscreenFloatingBtn.style.position = '';
                    fullscreenFloatingBtn.style.bottom = '';
                    fullscreenFloatingBtn.style.top = '';
                    fullscreenFloatingBtn.style.left = '';
                    fullscreenFloatingBtn.style.width = '';
                    fullscreenFloatingBtn.style.height = '';
                    fullscreenFloatingBtn.style.transition = '';
                }
            }
        }

        // Update user profile floating button visibility dynamically in the game loop
        const pBtn = document.getElementById('profile-btn');
        if (pBtn) {
            if (game.gameStarted || game.startTransition) {
                pBtn.style.display = 'none';
            } else {
                pBtn.style.display = 'flex';
            }
        }

        // ── Cooldown Arc HUD update (runs every render frame for smoothness) ──
        if (game.player && showControls) {
            const p = game.player;

            // Shield (E) cooldown arc
            const arcE = document.getElementById('cd-arc-e');
            if (arcE) {
                const cdE = Math.max(0, p.shieldCooldown || 0);
                const maxE = p.shieldCooldownMax || 10000;
                if (cdE > 0) {
                    const pct = (cdE / maxE) * 100;
                    arcE.style.setProperty('--cd-pct', pct.toFixed(2));
                    arcE.style.setProperty('--cd-glow', p.eColor || '#a060ff');
                    if (!arcE.classList.contains('active')) arcE.classList.add('active');
                    arcE._wasCoolingDown = true;
                } else {
                    arcE.classList.remove('active');
                    arcE.style.setProperty('--cd-pct', '0');
                    if (arcE._wasCoolingDown) {
                        arcE._wasCoolingDown = false;
                        const btnE = document.getElementById('vbtn-e');
                        if (btnE) {
                            btnE.classList.remove('cd-ready-flash');
                            void btnE.offsetWidth; // force reflow to restart animation
                            btnE.classList.add('cd-ready-flash');
                            setTimeout(() => btnE.classList.remove('cd-ready-flash'), 600);
                        }
                    }
                }
            }

            // R Attack cooldown arc
            const arcR = document.getElementById('cd-arc-r');
            if (arcR) {
                const cdR = Math.max(0, p.slashCooldown || 0);
                const maxR = p.slashCooldownMax || 14000;
                if (cdR > 0) {
                    const pct = (cdR / maxR) * 100;
                    arcR.style.setProperty('--cd-pct', pct.toFixed(2));
                    arcR.style.setProperty('--cd-glow', p.rColor || '#ff6000');
                    if (!arcR.classList.contains('active')) arcR.classList.add('active');
                    arcR._wasCoolingDown = true;
                } else {
                    arcR.classList.remove('active');
                    arcR.style.setProperty('--cd-pct', '0');
                    if (arcR._wasCoolingDown) {
                        arcR._wasCoolingDown = false;
                        const btnR = document.getElementById('vbtn-r');
                        if (btnR) {
                            btnR.classList.remove('cd-ready-flash');
                            void btnR.offsetWidth;
                            btnR.classList.add('cd-ready-flash');
                            setTimeout(() => btnR.classList.remove('cd-ready-flash'), 600);
                        }
                    }
                }
            }
        }


        // Run updates at a fixed logical frequency (60Hz)
        let gameUpdated = false;
        while (accumulator >= timestep) {
            // Save previous positions of all moving objects before we update
            const objects = gatherInterpolatableObjects(game);
            objects.forEach(entry => {
                const { obj, props } = entry;
                props.forEach(prop => {
                    obj['_prev_' + prop] = obj[prop];
                });
            });

            game.update(timestep);
            // Clear one-shot keys at the end of each logical update tick
            game.input.clearOneShots();
            accumulator -= timestep;
            gameUpdated = true;
        }

        // Throttle player coordinates broadcast to 60Hz (once per render frame) to avoid socket network flooding
        if (gameUpdated && game.isMultiplayer && game.socket && game.player) {
            const playerState = {
                x: game.player.x + game.cameraX,
                y: game.player.y,
                vy: game.player.vy,
                animState: game.player.currentState.state,
                facingLeft: game.player.facingLeft,
                hp: game.currentHP,
                maxHp: game.maxHP,
                score: game.score,
                coins: game.coins,
                shieldActive: game.player.shieldActive || false,
                isDead: game.player.isDead,
                // Sync player projectiles so remote client can see them
                slashProjectiles: (game.player.slashProjectiles || []).map(p => ({
                    x: p.x + game.cameraX,
                    y: p.y,
                    vx: p.facingLeft ? -(p.speed || 40) : (p.speed || 40),
                    vy: 0,
                    type: p.constructor ? p.constructor.name : 'SlashProjectile',
                    facingLeft: p.facingLeft,
                    width: p.width || 90,
                    height: p.height || 30
                })),
                windProjectiles: (game.player.windProjectiles || []).map(p => ({
                    x: p.x + game.cameraX,
                    y: p.y,
                    vx: p.vx || (p.facingLeft ? -8 : 8),
                    vy: p.vy || 0,
                    type: p.constructor ? p.constructor.name : 'WindProjectile',
                    facingLeft: p.facingLeft,
                    width: p.width || 40,
                    height: p.height || 40
                }))
            };

            if (game.isHost) {
                playerState.enemies = game.enemies.map(e => {
                    if (!e.id) e.id = Math.random().toString();
                    const enemyData = {
                        id: e.id,
                        type: e.enemyType || (e.isBoss ? 'boss' : 'skeleton_white'),
                        x: e.x + game.cameraX,
                        y: e.y,
                        hp: e.currentHP !== undefined ? e.currentHP : e.hp,
                        maxHp: e.maxHP !== undefined ? e.maxHP : e.maxHp,
                        facingLeft: e.facingLeft,
                        state: e.currentState ? e.currentState.state : (e.state || 'WALK'),
                        isBoss: e.isBoss || false
                    };
                    if (e.projectiles) {
                        enemyData.projectiles = e.projectiles.map(p => {
                            let vx = 0;
                            let vy = 0;
                            if (p.vx !== undefined) vx = p.vx;
                            else if (p.speedX !== undefined) vx = p.speedX;
                            else if (p.dx !== undefined) vx = p.dx * (p.speed || 1);
                            else if (p.speed !== undefined) vx = (p.facingLeft ? -1 : 1) * p.speed;

                            if (p.vy !== undefined) vy = p.vy;
                            else if (p.speedY !== undefined) vy = p.speedY;
                            else if (p.dy !== undefined) vy = p.dy * (p.speed || 1);

                            return {
                                x: p.x + game.cameraX,
                                y: p.y,
                                vx: vx,
                                vy: vy,
                                type: p.type || p.constructor.name,
                                radius: p.radius || p.width || 12,
                                damage: p.damage || 10,
                                isBlackHole: p.isBlackHole || false,
                                facingLeft: p.facingLeft !== undefined ? p.facingLeft : (p.dx !== undefined ? p.dx < 0 : false),
                                timer: p.timer !== undefined ? p.timer : 0,
                                delay: p.delay !== undefined ? p.delay : 0,
                                life: p.life !== undefined ? p.life : 1000
                            };
                        });
                    }
                    if (e.pendingAttackType) {
                        enemyData.attackType = e.pendingAttackType;
                    }
                    return enemyData;
                });
                playerState.waveIndex = game.waveIndex;
                playerState.waveSpawnedCount = game.waveSpawnedCount;
                playerState.waveComplete = game.waveComplete;
                playerState.portalSpawned = game.portalSpawned;
                if (game.portal) {
                    playerState.portalX = game.portal.x + game.cameraX;
                    playerState.portalY = game.portal.y;
                }
            }
            game.socket.emit('playerStateUpdate', playerState);
        }

        // Apply interpolated positions for smooth drawing at any refresh rate
        const alpha = accumulator / timestep;
        const objects = gatherInterpolatableObjects(game);
        objects.forEach(entry => {
            const { obj, props } = entry;
            props.forEach(prop => {
                const prev = obj['_prev_' + prop] !== undefined ? obj['_prev_' + prop] : obj[prop];
                const curr = obj[prop];
                obj['_phys_' + prop] = curr;
                const diff = curr - prev;
                // If there's a big teleport/jump (like wrapping around backgrounds or respawning), don't interpolate
                if (Math.abs(diff) > 150) {
                    obj[prop] = curr;
                } else {
                    obj[prop] = prev + diff * alpha;
                }
            });
        });

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        if (game.screenDistort) {
            const time = timeStamp / 1000;
            const distortionAmount = Math.sin(time * 5) * 15;
            ctx.translate(distortionAmount, Math.cos(time * 3) * 10);
            ctx.filter = `hue-rotate(${Math.sin(time) * 40}deg) blur(${Math.abs(Math.sin(time * 2)) * 2}px)`;
        }

        game.draw(ctx);

        ctx.restore();

        // Restore true physical values immediately after drawing
        objects.forEach(entry => {
            const { obj, props } = entry;
            props.forEach(prop => {
                if (obj['_phys_' + prop] !== undefined) {
                    obj[prop] = obj['_phys_' + prop];
                }
            });
        });

        requestAnimationFrame(Animate);
    }

    Animate(0);
});