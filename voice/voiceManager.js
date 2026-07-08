// voice/voiceManager.js
import { AudioSettings } from './audioSettings.js';
import { MicrophoneHandler } from './microphone.js';
import { PeerConnection } from './peerConnection.js';
import { NetworkVoice } from './networkVoice.js';
import { VoiceUI } from './voiceUI.js';

export class VoiceManager {
    constructor() {
        this.microphone = new MicrophoneHandler();
        this.ui = new VoiceUI();
        this.peers = new Map(); // targetPlayerId -> PeerConnection
        this.networkVoice = null;
        this.localPlayerId = null;
        this.socket = null;
        
        // Settings
        this.isDeafened = false;
        
        // PTT State
        this.pttActive = false;

        this.setupUIBindings();
        this.setupKeyboard();
    }

    setupUIBindings() {
        this.ui.onToggleMic = () => {
            // If we are in Open Mic mode, this toggles it. 
            // In PTT mode, this does nothing directly unless we switch modes (optional).
            // For now, let's just let it toggle the hardware mute, independent of PTT.
            const isMuted = this.microphone.toggleMute();
            this.ui.setMicState(isMuted, false);
            if (this.networkVoice) {
                this.networkVoice.sendToggleMute(isMuted);
            }
        };

        this.ui.onToggleDeafen = () => {
            this.isDeafened = !this.isDeafened;
            this.ui.setDeafenState(this.isDeafened);
            
            // Apply to all active peer connections
            for (let [_, peer] of this.peers) {
                peer.setDeafened(this.isDeafened);
            }
        };

        this.microphone.onVADStateChange = (isTalking, volume) => {
            this.ui.setMicState(this.microphone.isMuted, isTalking);
            if (this.networkVoice && !this.microphone.isMuted) {
                this.networkVoice.sendVolume(volume, isTalking);
            }
        };
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === AudioSettings.pushToTalkKey && !AudioSettings.openMic) {
                if (!this.pttActive && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                    this.pttActive = true;
                    this.microphone.setMuted(false);
                    this.ui.setMicState(false, true);
                    if (this.networkVoice) this.networkVoice.sendToggleMute(false);
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key.toLowerCase() === AudioSettings.pushToTalkKey && !AudioSettings.openMic) {
                if (this.pttActive) {
                    this.pttActive = false;
                    this.microphone.setMuted(true);
                    this.ui.setMicState(true, false);
                    if (this.networkVoice) this.networkVoice.sendToggleMute(true);
                }
            }
        });
    }

    async init(socket, localPlayerId) {
        this.socket = socket;
        this.localPlayerId = localPlayerId;
        // Don't show UI until joined a room
        this.ui.setStatus('Connecting...', 'normal');

        this.networkVoice = new NetworkVoice(this.socket, {
            onOffer: async (sender, offer) => {
                let peer = this.getOrCreatePeer(sender);
                await peer.handleOffer(offer);
            },
            onAnswer: async (sender, answer) => {
                let peer = this.peers.get(sender);
                if (peer) await peer.handleAnswer(answer);
            },
            onICECandidate: async (sender, candidate) => {
                let peer = this.peers.get(sender);
                if (peer) await peer.handleICECandidate(candidate);
            },
            onToggle: (sender, isMuted) => {
                this.handleRemoteMuteToggle(sender, isMuted);
            },
            onVolume: (sender, volume, isSpeaking) => {
                this.handleRemoteVolume(sender, volume, isSpeaking);
            }
        });

        try {
            const stream = await this.microphone.requestMicrophone();
            if (stream) {
                this.ui.setStatus('Ready', 'normal');
                // Mute by default, use PTT
                this.microphone.setMuted(true);
                this.ui.setMicState(true, false);
            } else {
                this.ui.setStatus('Mic Error', 'error');
            }
        } catch (err) {
            console.error('Microphone access denied or error:', err);
            this.ui.setStatus('Mic Error', 'error');
        }
    }

    connectToRoomMembers(roomMembers) {
        if (!roomMembers) return;
        
        // Show UI only when connected to a room
        this.ui.show();
        this.ui.setStatus('Connected', 'connected');

        roomMembers.forEach(member => {
            if (member.playerId !== this.localPlayerId) {
                const peer = this.getOrCreatePeer(member.playerId);
                peer.createOffer();
            }
        });
    }

    getOrCreatePeer(targetPlayerId) {
        if (this.peers.has(targetPlayerId)) {
            return this.peers.get(targetPlayerId);
        }

        const peer = new PeerConnection(targetPlayerId, this.microphone.stream, this.networkVoice);
        peer.setDeafened(this.isDeafened);
        this.peers.set(targetPlayerId, peer);
        return peer;
    }

    removePeer(targetPlayerId) {
        const peer = this.peers.get(targetPlayerId);
        if (peer) {
            peer.cleanup();
            this.peers.delete(targetPlayerId);
        }
    }

    handleRemoteMuteToggle(sender, isMuted) {
        console.log(`Player ${sender} is now ${isMuted ? 'muted' : 'unmuted'}`);
        // Dispatch event so UI can update
        const event = new CustomEvent('voice-speaking-update', {
            detail: { playerId: sender, isSpeaking: false, isMuted: isMuted }
        });
        window.dispatchEvent(event);
    }

    handleRemoteVolume(sender, volume, isSpeaking) {
        const event = new CustomEvent('voice-speaking-update', {
            detail: { playerId: sender, isSpeaking }
        });
        window.dispatchEvent(event);
    }

    updateSpatialAudio(players) {
        // Debounce or rate-limit the UI update to avoid heavy DOM manipulation every frame
        const now = Date.now();
        if (!this._lastUiUpdate || now - this._lastUiUpdate > 250) {
            this.ui.updateTeamList(players, this.localPlayerId);
            this._lastUiUpdate = now;
        }

        if (!AudioSettings.spatial.enabled || this.isDeafened) return;

        let localPlayer = null;
        const remotePlayers = [];

        // Distinguish local player from remote players
        players.forEach(p => {
            if (p.playerId === this.localPlayerId || p.id === this.localPlayerId) {
                localPlayer = p;
                p.isMuted = this.microphone.isMuted; // Sync local mute state for the UI list
            } else {
                remotePlayers.push(p);
            }
        });

        if (!localPlayer) return;

        remotePlayers.forEach(p => {
            const peer = this.peers.get(p.playerId || p.id);
            if (peer) {
                const volume = AudioSettings.calculateSpatialVolume(localPlayer, p);
                peer.setVolume(volume);
            }
        });
    }

    cleanup() {
        if (this.networkVoice) this.networkVoice.unbindEvents();
        this.microphone.cleanup();
        for (let [_, peer] of this.peers) {
            peer.cleanup();
        }
        this.peers.clear();
        this.ui.hide();
    }
}

// Global singleton instance
export const voiceManager = new VoiceManager();
