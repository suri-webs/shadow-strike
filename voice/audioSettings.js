// voice/audioSettings.js
export const AudioSettings = {
    // Default MediaTrackConstraints
    constraints: {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        },
        video: false
    },
    
    // Spatial Audio Settings
    spatial: {
        enabled: true,
        maxDistance: 800, // Distance at which volume becomes 0
        refDistance: 100, // Distance at which volume starts decreasing
        rolloffFactor: 1.5 // How quickly volume drops
    },

    // Default Voice System States
    openMic: false, // false = Push-To-Talk (V key)
    pushToTalkKey: 'v',
    
    // Configurable Volumes
    masterVolume: 1.0,
    
    // Returns volume scalar [0, 1] based on distance between two coordinates
    calculateSpatialVolume(localPlayerCoords, remotePlayerCoords) {
        if (!this.spatial.enabled) return this.masterVolume;
        if (!localPlayerCoords || !remotePlayerCoords) return this.masterVolume;

        const dx = localPlayerCoords.x - remotePlayerCoords.x;
        const dy = localPlayerCoords.y - remotePlayerCoords.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.spatial.refDistance) return this.masterVolume;
        if (distance >= this.spatial.maxDistance) return 0;

        // Inverse distance rolloff model
        let volume = this.spatial.refDistance / (this.spatial.refDistance + this.spatial.rolloffFactor * (distance - this.spatial.refDistance));
        
        // Clamp 0 to 1
        volume = Math.max(0, Math.min(1, volume));
        return volume * this.masterVolume;
    }
};
