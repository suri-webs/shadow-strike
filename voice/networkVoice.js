// voice/networkVoice.js
export class NetworkVoice {
    constructor(socket, handlers) {
        this.socket = socket;
        this.handlers = handlers; // { onOffer, onAnswer, onICECandidate, onToggle, onVolume }
        this.bindEvents();
    }

    bindEvents() {
        if (!this.socket) return;

        this.socket.on('voice-offer', (data) => {
            if (this.handlers.onOffer) this.handlers.onOffer(data.sender, data.offer);
        });

        this.socket.on('voice-answer', (data) => {
            if (this.handlers.onAnswer) this.handlers.onAnswer(data.sender, data.answer);
        });

        this.socket.on('voice-ice-candidate', (data) => {
            if (this.handlers.onICECandidate) this.handlers.onICECandidate(data.sender, data.candidate);
        });

        this.socket.on('voice-toggle', (data) => {
            if (this.handlers.onToggle) this.handlers.onToggle(data.sender, data.isMuted);
        });

        this.socket.on('voice-volume', (data) => {
            if (this.handlers.onVolume) this.handlers.onVolume(data.sender, data.volume, data.isSpeaking);
        });
    }

    unbindEvents() {
        if (!this.socket) return;
        this.socket.off('voice-offer');
        this.socket.off('voice-answer');
        this.socket.off('voice-ice-candidate');
        this.socket.off('voice-toggle');
        this.socket.off('voice-volume');
    }

    sendOffer(targetPlayerId, offer) {
        if (this.socket) {
            this.socket.emit('voice-offer', { target: targetPlayerId, offer });
        }
    }

    sendAnswer(targetPlayerId, answer) {
        if (this.socket) {
            this.socket.emit('voice-answer', { target: targetPlayerId, answer });
        }
    }

    sendICECandidate(targetPlayerId, candidate) {
        if (this.socket) {
            this.socket.emit('voice-ice-candidate', { target: targetPlayerId, candidate });
        }
    }

    sendToggleMute(isMuted) {
        if (this.socket) {
            this.socket.emit('voice-toggle', { isMuted });
        }
    }

    sendVolume(volume, isSpeaking) {
        if (this.socket) {
            this.socket.emit('voice-volume', { volume, isSpeaking });
        }
    }
}
