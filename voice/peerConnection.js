// voice/peerConnection.js
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

export class PeerConnection {
    constructor(targetPlayerId, localStream, networkVoice) {
        this.targetPlayerId = targetPlayerId;
        this.localStream = localStream;
        this.networkVoice = networkVoice;
        this.pc = new RTCPeerConnection(rtcConfig);
        this.audioElement = null;
        this.isDeafened = false;
        
        this.setupPeerConnection();
    }

    setupPeerConnection() {
        // Add local tracks to peer connection
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.pc.addTrack(track, this.localStream);
            });
        }

        // Handle ICE candidates
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.networkVoice.sendICECandidate(this.targetPlayerId, event.candidate);
            }
        };

        // Handle incoming tracks
        this.pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                this.attachRemoteStream(event.streams[0]);
            }
        };

        this.pc.onconnectionstatechange = () => {
            console.log(`WebRTC State [${this.targetPlayerId}]: ${this.pc.connectionState}`);
        };
    }

    attachRemoteStream(stream) {
        if (!this.audioElement) {
            this.audioElement = document.createElement('audio');
            this.audioElement.autoplay = true;
            this.audioElement.id = `voice-audio-${this.targetPlayerId}`;
            // Mute locally if deafened
            this.audioElement.muted = this.isDeafened;
            document.body.appendChild(this.audioElement);
        }
        
        if (this.audioElement.srcObject !== stream) {
            this.audioElement.srcObject = stream;
        }
    }

    setVolume(volume) {
        if (this.audioElement) {
            this.audioElement.volume = volume;
        }
    }

    setDeafened(deafened) {
        this.isDeafened = deafened;
        if (this.audioElement) {
            this.audioElement.muted = deafened;
        }
    }

    async createOffer() {
        try {
            const offer = await this.pc.createOffer();
            await this.pc.setLocalDescription(offer);
            this.networkVoice.sendOffer(this.targetPlayerId, offer);
        } catch (err) {
            console.error("Error creating offer:", err);
        }
    }

    async handleOffer(offer) {
        try {
            await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);
            this.networkVoice.sendAnswer(this.targetPlayerId, answer);
        } catch (err) {
            console.error("Error handling offer:", err);
        }
    }

    async handleAnswer(answer) {
        try {
            await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
            console.error("Error handling answer:", err);
        }
    }

    async handleICECandidate(candidate) {
        try {
            if (this.pc.remoteDescription) {
                await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                console.warn("Received ICE candidate before remote description was set.");
            }
        } catch (err) {
            console.error("Error adding ICE candidate:", err);
        }
    }

    cleanup() {
        if (this.audioElement) {
            this.audioElement.srcObject = null;
            this.audioElement.remove();
            this.audioElement = null;
        }
        this.pc.close();
    }
}
