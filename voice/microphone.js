// voice/microphone.js
import { AudioSettings } from './audioSettings.js';

export class MicrophoneHandler {
    constructor() {
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.microphoneNode = null;
        this.dataArray = null;
        this.vadInterval = null;
        this.onVADStateChange = null; // Callback when talking state changes
        this.isTalking = false;
        this.isMuted = true; // Start muted
    }

    async requestMicrophone() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia(AudioSettings.constraints);
            this.setupVAD();
            this.setMuted(this.isMuted); // Apply initial mute state
            return this.stream;
        } catch (err) {
            console.error("Microphone access denied or error:", err);
            return null;
        }
    }

    setupVAD() {
        if (!this.stream) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphoneNode = this.audioContext.createMediaStreamSource(this.stream);
            
            this.analyser.smoothingTimeConstant = 0.8;
            this.analyser.fftSize = 1024;
            this.microphoneNode.connect(this.analyser);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            this.vadInterval = setInterval(() => {
                if (this.isMuted) {
                    this.updateTalkingState(false, 0);
                    return;
                }

                this.analyser.getByteFrequencyData(this.dataArray);
                let sum = 0;
                for (let i = 0; i < this.dataArray.length; i++) {
                    sum += this.dataArray[i];
                }
                let average = sum / this.dataArray.length;
                
                // Volume threshold for talking
                const threshold = 10;
                const talking = average > threshold;
                
                this.updateTalkingState(talking, average);
            }, 100);
        } catch (e) {
            console.warn("VAD setup failed (AudioContext may be restricted before user interaction).", e);
        }
    }

    updateTalkingState(isTalking, volume) {
        if (this.isTalking !== isTalking) {
            this.isTalking = isTalking;
            if (this.onVADStateChange) {
                this.onVADStateChange(isTalking, volume);
            }
        } else if (isTalking && this.onVADStateChange) {
            // Send volume updates if still talking
            this.onVADStateChange(isTalking, volume);
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.stream) {
            this.stream.getAudioTracks().forEach(track => {
                track.enabled = !muted;
            });
        }
        if (muted) {
            this.updateTalkingState(false, 0);
        }
    }

    toggleMute() {
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }

    cleanup() {
        if (this.vadInterval) clearInterval(this.vadInterval);
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.microphoneNode = null;
    }
}
