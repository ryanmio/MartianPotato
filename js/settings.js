// Settings management
class GameSettings {
    constructor() {
        this.settings = {
            sound: true,
            music: true,
            notifications: true,
            ads: false
        };

        // Load saved settings
        this.loadSettings();
        
        // Initialize settings UI
        this.initializeSettingsUI();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }

    initializeSettingsUI() {
        // Add event listener to settings button
        const settingsButton = document.getElementById('settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                const modal = document.getElementById('settings-modal');
                if (modal) {
                    // Update toggle states before showing
                    const soundToggle = document.getElementById('mute-toggle');
                    const animationsToggle = document.getElementById('animations-toggle');
                    const adsToggle = document.getElementById('ads-toggle');
                    
                    if (soundToggle) soundToggle.checked = this.settings.sound;
                    if (animationsToggle) animationsToggle.checked = this.settings.animations !== false;
                    if (adsToggle) adsToggle.checked = this.settings.ads === true;
                    
                    modal.style.display = 'block';
                }
            });
        }

        // Add event listeners for settings changes
        const soundToggle = document.getElementById('mute-toggle');
        const animationsToggle = document.getElementById('animations-toggle');
        const adsToggle = document.getElementById('ads-toggle');
        const saveSettingsBtn = document.getElementById('save-settings');
        const cancelSettingsBtn = document.getElementById('cancel-settings');

        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.settings.sound = e.target.checked;
            });
        }

        if (animationsToggle) {
            animationsToggle.addEventListener('change', (e) => {
                this.settings.animations = e.target.checked;
            });
        }

        if (adsToggle) {
            adsToggle.addEventListener('change', (e) => {
                this.settings.ads = e.target.checked;
                // Update ads manager immediately on toggle
                if (window.adsManager) {
                    window.adsManager.handleOptIn(e.target.checked);
                }
            });
        }

        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
                document.getElementById('settings-modal').style.display = 'none';
            });
        }

        if (cancelSettingsBtn) {
            cancelSettingsBtn.addEventListener('click', () => {
                this.loadSettings(); // Revert changes
                // Revert ads manager state
                if (window.adsManager) {
                    window.adsManager.handleOptIn(this.settings.ads);
                }
                document.getElementById('settings-modal').style.display = 'none';
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('settings-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameSettings = new GameSettings();
});
 