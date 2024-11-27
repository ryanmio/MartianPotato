// Sound System
class SoundSystem {
    constructor() {
        console.log('🔊 Initializing Sound System...');
        // Use settings if available, otherwise use default
        if (window.gameSettings) {
            console.log('🔊 Using game settings for initial state');
            this.isMuted = !window.gameSettings.settings.sound;
        } else {
            console.log('🔊 No game settings found, using localStorage');
            const storedMute = localStorage.getItem('soundMuted');
            console.log('🔊 Stored mute state:', storedMute);
            this.isMuted = storedMute === 'true';
        }
        console.log('🔊 Initial mute state:', this.isMuted);
        this.initialize();
    }

    initialize() {
        this.updateMuteToggle();
    }

    updateMuteToggle() {
        const muteToggle = document.getElementById('mute-toggle');
        if (muteToggle) {
            console.log('🔊 Setting toggle state to match sound enabled:', !this.isMuted);
            muteToggle.checked = !this.isMuted;
        } else {
            console.log('🔊 Mute toggle element not found');
        }
    }

    setMute(muted) {
        console.log('🔊 Setting mute state to:', muted);
        this.isMuted = muted;
        this.updateMuteToggle();
        // Only save to localStorage if settings system isn't available
        if (!window.gameSettings) {
            localStorage.setItem('soundMuted', muted);
            console.log('🔊 Saved mute state to localStorage:', muted);
        }
    }

    // Placeholder methods for future sound effects
    playPlantSound() {
        if (this.isMuted) {
            console.log('🔊 Plant sound suppressed (muted)');
            return;
        }
        console.log('🔊 Would play plant sound');
    }

    playHarvestSound() {
        if (this.isMuted) {
            console.log('🔊 Harvest sound suppressed (muted)');
            return;
        }
        console.log('🔊 Would play harvest sound');
    }

    playUpgradeSound() {
        if (this.isMuted) {
            console.log('🔊 Upgrade sound suppressed (muted)');
            return;
        }
        console.log('🔊 Would play upgrade sound');
    }

    playAchievementSound() {
        if (this.isMuted) {
            console.log('🔊 Achievement sound suppressed (muted)');
            return;
        }
        console.log('🔊 Would play achievement sound');
    }
}

// Initialize sound system
let soundSystem;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔊 DOM loaded, creating sound system...');
    soundSystem = new SoundSystem();
    // Export for use in other files
    window.soundSystem = soundSystem;
    console.log('🔊 Sound system exported to window.soundSystem');
}); 