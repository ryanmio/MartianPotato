// Sound System
class SoundSystem {
    constructor() {
        this.isMuted = localStorage.getItem('soundMuted') === 'true';
        this.initialize();
    }

    initialize() {
        // Initialize with stored mute state
        this.setMute(this.isMuted);
        
        // Update mute toggle in settings if it exists
        const muteToggle = document.getElementById('mute-toggle');
        if (muteToggle) {
            muteToggle.checked = !this.isMuted;
        }
    }

    setMute(muted) {
        this.isMuted = muted;
        localStorage.setItem('soundMuted', muted);
    }

    // Placeholder methods for future sound effects
    playPlantSound() {
        if (this.isMuted) return;
        // Future: Play planting sound
    }

    playHarvestSound() {
        if (this.isMuted) return;
        // Future: Play harvesting sound
    }

    playUpgradeSound() {
        if (this.isMuted) return;
        // Future: Play upgrade purchase sound
    }

    playAchievementSound() {
        if (this.isMuted) return;
        // Future: Play achievement unlock sound
    }
}

// Initialize sound system
let soundSystem;
document.addEventListener('DOMContentLoaded', () => {
    soundSystem = new SoundSystem();
});

// Export for use in other files
window.soundSystem = soundSystem; 