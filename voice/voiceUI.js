// voice/voiceUI.js
export class VoiceUI {
    constructor() {
        this.container = null;
        this.micBtn = null;
        this.deafenBtn = null;
        this.statusText = null;
        this.pttHint = null;
        this.onToggleMic = null;
        this.onToggleDeafen = null;

        this.injectCSS();
        this.createUI();
    }

    injectCSS() {
        if (document.getElementById('voice-ui-styles')) return;
        const style = document.createElement('style');
        style.id = 'voice-ui-styles';
        style.innerHTML = `
            #voice-controls {
                position: absolute;
                top: 76px; /* Added gap below score box */
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 10px;
                pointer-events: none;
            }
            #voice-team-list {
                position: absolute;
                top: 106px; /* Added gap below coin box */
                left: 15px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 6px;
                pointer-events: none;
                font-family: 'Rajdhani', sans-serif;
            }
            .team-member {
                display: flex;
                align-items: center;
                background: linear-gradient(90deg, rgba(30, 30, 40, 0.95), rgba(15, 15, 20, 0.8));
                padding: 4px 12px 4px 4px;
                border-radius: 6px;
                border-left: 4px solid #00e5ff; /* Default, will be overridden */
                border-top: 1px solid rgba(255,255,255,0.08);
                border-right: 1px solid rgba(255,255,255,0.08);
                border-bottom: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                gap: 12px;
                width: 170px;
                transition: all 0.2s ease;
            }
            .team-member .avatar {
                width: 26px;
                height: 26px;
                border-radius: 4px;
                background-color: rgba(0,0,0,0.6);
                border: 1px solid rgba(255,255,255,0.15);
                background-size: cover;
                background-position: top center;
                flex-shrink: 0;
            }
            .team-member .name {
                color: #fff;
                font-size: 13px;
                font-weight: 600;
                font-family: 'Poppins', sans-serif;
                text-shadow: 1px 1px 2px #000;
                flex-grow: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .team-member .mic-icon {
                width: 16px;
                height: 16px;
                color: #fff;
                opacity: 0.5;
                flex-shrink: 0;
            }
            .team-member.speaking .mic-icon {
                color: #00ff00 !important;
                opacity: 1;
                filter: drop-shadow(0 0 4px #00ff00);
            }
            .team-member.speaking {
                border-left-color: #00ff00 !important;
                background: linear-gradient(90deg, rgba(0, 255, 0, 0.15), rgba(15, 15, 20, 0.8));
                box-shadow: 0 0 15px rgba(0, 255, 0, 0.2);
            }
            .team-member.muted .mic-icon {
                color: #ff3366 !important;
                opacity: 1;
            }
            .team-member.muted {
                border-left-color: #ff3366 !important;
            }
            .voice-btn-row {
                display: flex;
                gap: 10px;
                pointer-events: auto;
            }
            .voice-btn {
                background: rgba(0, 0, 0, 0.6);
                border: 1px solid #00e5ff;
                border-radius: 50%;
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #00e5ff;
                transition: all 0.2s ease;
                box-shadow: 0 0 10px rgba(0,229,255,0.2);
            }
            .voice-btn:hover {
                background: rgba(0, 229, 255, 0.2);
                box-shadow: 0 0 15px rgba(0,229,255,0.4);
            }
            .voice-btn.muted {
                border-color: #ff3366;
                color: #ff3366;
                box-shadow: 0 0 10px rgba(255,51,102,0.2);
            }
            .voice-btn.muted:hover {
                background: rgba(255,51,102, 0.2);
            }
            .voice-btn.speaking {
                border-color: #00ff00;
                color: #00ff00;
                box-shadow: 0 0 20px rgba(0,255,0,0.6);
            }
            .voice-status {
                background: rgba(0,0,0,0.5);
                padding: 4px 10px;
                border-radius: 4px;
                font-family: 'Orbitron', sans-serif;
                font-size: 10px;
                color: #aaa;
                pointer-events: none;
            }
            .voice-status.connected {
                color: #00ff00;
            }
            .voice-status.error {
                color: #ff3366;
            }
            .player-speaking-indicator {
                position: absolute;
                border: 2px solid #00ff00;
                border-radius: 50%;
                box-shadow: 0 0 10px #00ff00;
                pointer-events: none;
                transition: all 0.1s;
                opacity: 0;
            }
            .player-speaking-indicator.active {
                opacity: 1;
                animation: pulse 1s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.id = 'voice-controls';

        const btnRow = document.createElement('div');
        btnRow.className = 'voice-btn-row';

        // Mic Button
        this.micBtn = document.createElement('div');
        this.micBtn.className = 'voice-btn muted';
        this.micBtn.innerHTML = this.getMicIcon(true);
        this.micBtn.title = "Toggle Microphone (Press V for PTT)";
        this.micBtn.onclick = () => {
            if (this.onToggleMic) this.onToggleMic();
        };

        // Deafen Button
        this.deafenBtn = document.createElement('div');
        this.deafenBtn.className = 'voice-btn';
        this.deafenBtn.innerHTML = this.getSpeakerIcon(false);
        this.deafenBtn.title = "Toggle Deafened";
        this.deafenBtn.onclick = () => {
            if (this.onToggleDeafen) this.onToggleDeafen();
        };

        btnRow.appendChild(this.micBtn);
        btnRow.appendChild(this.deafenBtn);

        this.statusText = document.createElement('div');
        this.statusText.className = 'voice-status';
        this.statusText.innerText = 'Voice: Disconnected';

        this.pttHint = document.createElement('div');
        this.pttHint.className = 'voice-status';
        this.pttHint.innerText = 'Hold [V] to Talk';
        this.pttHint.style.color = '#00e5ff';
        this.pttHint.style.display = 'none';

        this.container.appendChild(this.statusText);
        this.container.appendChild(this.pttHint);
        this.container.appendChild(btnRow);

        this.teamListContainer = document.createElement('div');
        this.teamListContainer.id = 'voice-team-list';

        // Hide initially until in room
        this.container.style.display = 'none';
        this.teamListContainer.style.display = 'none';

        document.body.appendChild(this.container);
        document.body.appendChild(this.teamListContainer);
    }

    show() {
        if (this.container && this.container.style.display !== 'flex') this.container.style.display = 'flex';
        if (this.teamListContainer && this.teamListContainer.style.display !== 'flex') this.teamListContainer.style.display = 'flex';
    }

    hide() {
        if (this.container && this.container.style.display !== 'none') this.container.style.display = 'none';
        if (this.teamListContainer && this.teamListContainer.style.display !== 'none') this.teamListContainer.style.display = 'none';
    }

    updateTeamList(players, localPlayerId) {
        if (!this.teamListContainer) return;
        this.teamListContainer.innerHTML = '';

        // Deduplicate players by playerId (or id)
        const uniquePlayers = new Map();
        players.forEach(p => {
            const id = p.playerId || p.id;
            if (id && !uniquePlayers.has(id)) {
                uniquePlayers.set(id, p);
            }
        });

        uniquePlayers.forEach(p => {
            const el = document.createElement('div');
            let classes = 'team-member';
            if (p.isSpeaking) classes += ' speaking';
            if (p.isMuted) classes += ' muted';
            el.className = classes;

            // Name
            const nameSpan = document.createElement('span');
            nameSpan.className = 'name';
            nameSpan.innerText = p.username || 'Player';
            if ((p.playerId || p.id) === localPlayerId) {
                nameSpan.innerText += ' (You)';
            }

            // Mic Icon
            const micSpan = document.createElement('span');
            micSpan.className = 'mic-icon';
            micSpan.innerHTML = this.getMicIcon(p.isMuted);

            // Avatar
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'avatar';
            let charType = p.characterType || 'shinobi'; // fallback

            // Map character to an approximate image/color to simulate the mockup
            let themeColor = '#00e5ff';
            
            if (charType === 'shinobi') {
                // Red hood
                themeColor = '#ff3366';
                avatarDiv.style.backgroundImage = "url('/asset/players/player-banner/player1-banner.png')";
                avatarDiv.style.backgroundPosition = "center";
                avatarDiv.style.backgroundSize = "cover";
            } else if (charType === 'jotem') {
                // Green hood
                themeColor = '#33ff66';
                avatarDiv.style.backgroundImage = "url('/asset/players/player-banner/player2-banner.png')";
                avatarDiv.style.backgroundPosition = "center";
                avatarDiv.style.backgroundSize = "cover";
            } else if (charType === 'shaia') {
                themeColor = '#33ccff';
                avatarDiv.style.backgroundImage = "url('/asset/players/player-banner/player3-banner.png')";
                avatarDiv.style.backgroundPosition = "center";
                avatarDiv.style.backgroundSize = "cover";
            } else if (charType === 'archdemon') {
                themeColor = '#9933ff';
                avatarDiv.style.backgroundImage = "url('/asset/players/player-banner/player4-banner.png')";
                avatarDiv.style.backgroundPosition = "center";
                avatarDiv.style.backgroundSize = "cover";
            }
            
            el.style.borderLeftColor = themeColor;

            el.appendChild(avatarDiv);
            el.appendChild(nameSpan);
            el.appendChild(micSpan);

            this.teamListContainer.appendChild(el);
        });
    }

    setStatus(status, type = 'normal') {
        if (!this.statusText) return;
        this.statusText.innerText = `Voice: ${status}`;
        this.statusText.className = `voice-status ${type}`;

        if (status === 'Connected') {
            this.pttHint.style.display = 'block';
        } else {
            this.pttHint.style.display = 'none';
        }
    }

    setMicState(isMuted, isSpeaking = false) {
        if (!this.micBtn) return;
        this.micBtn.className = `voice-btn ${isMuted ? 'muted' : (isSpeaking ? 'speaking' : '')}`;
        this.micBtn.innerHTML = this.getMicIcon(isMuted);
    }

    setDeafenState(isDeafened) {
        if (!this.deafenBtn) return;
        this.deafenBtn.className = `voice-btn ${isDeafened ? 'muted' : ''}`;
        this.deafenBtn.innerHTML = this.getSpeakerIcon(isDeafened);
    }

    // SVG Icons
    getMicIcon(muted) {
        if (muted) {
            return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
        }
        return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
    }

    getSpeakerIcon(muted) {
        if (muted) {
            return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
        }
        return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    }
}
