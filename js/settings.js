// Settings management
class Settings {
    constructor() {
        console.log('⚙️ Initializing Settings...');
        this.defaultSettings = {
            sound: true,
            animations: true,
            toastLevel: 'all',
            autoSave: 0 // 0 means off
        };
        console.log('⚙️ Default settings:', this.defaultSettings);
        this.settings = this.loadSettings();
        
        // Export settings instance before initialization
        window.gameSettings = this;
        console.log('⚙️ Settings exported to window.gameSettings');
        
        this.initializeUI();
        this.bindEvents();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        console.log('⚙️ Loading settings from localStorage:', savedSettings);
        const settings = savedSettings ? { ...this.defaultSettings, ...JSON.parse(savedSettings) } : { ...this.defaultSettings };
        console.log('⚙️ Loaded settings:', settings);
        return settings;
    }

    saveSettings() {
        console.log('⚙️ Saving settings:', this.settings);
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        console.log('⚙️ Settings saved to localStorage:', localStorage.getItem('gameSettings'));
        
        // Apply sound settings
        if (window.soundSystem) {
            console.log('⚙️ Applying sound setting to sound system. Muting:', !this.settings.sound);
            window.soundSystem.setMute(!this.settings.sound);
        } else {
            console.warn('⚙️ Sound system not available - sound settings will apply on next load');
        }

        // Apply other settings...
    }

    initializeUI() {
        console.log('⚙️ Initializing UI with settings:', this.settings);
        
        // Set sound toggle based on settings, not sound system
        const soundToggle = document.getElementById('mute-toggle');
        if (soundToggle) {
            console.log('⚙️ Setting sound toggle from settings:', this.settings.sound);
            soundToggle.checked = this.settings.sound;
        }
        
        // Initialize other settings...
        document.getElementById('animations-toggle').checked = this.settings.animations;
        document.getElementById('toast-level').value = this.settings.toastLevel;
        document.getElementById('auto-save').value = this.settings.autoSave.toString();
        console.log('⚙️ UI initialization complete');
    }

    bindEvents() {
        console.log('⚙️ Binding settings events...');
        // Settings button
        const settingsBtn = document.getElementById('settings-button');
        const settingsModal = document.getElementById('settings-modal');
        const closeBtn = document.querySelector('.close-settings-modal');
        const saveBtn = document.getElementById('save-settings');
        const cancelBtn = document.getElementById('cancel-settings');

        // Open settings modal
        settingsBtn.addEventListener('click', () => {
            console.log('⚙️ Opening settings modal');
            settingsModal.style.display = 'block';
            this.initializeUI(); // Reset to current settings
        });

        // Close modal handlers
        closeBtn.addEventListener('click', () => {
            console.log('⚙️ Closing settings modal (X button)');
            settingsModal.style.display = 'none';
        });
        
        cancelBtn.addEventListener('click', () => {
            console.log('⚙️ Canceling settings changes');
            settingsModal.style.display = 'none';
        });

        // Save settings
        saveBtn.addEventListener('click', () => {
            console.log('⚙️ Saving settings changes...');
            const oldSettings = { ...this.settings };
            
            this.settings.sound = document.getElementById('mute-toggle').checked;
            this.settings.animations = document.getElementById('animations-toggle').checked;
            this.settings.toastLevel = document.getElementById('toast-level').value;
            this.settings.autoSave = parseInt(document.getElementById('auto-save').value);

            console.log('⚙️ Settings changes:', {
                old: oldSettings,
                new: this.settings
            });

            this.saveSettings();
            settingsModal.style.display = 'none';

            // Show confirmation toast
            showToast('Settings saved successfully!', 'success');
        });
        console.log('⚙️ Events bound successfully');
    }

    applySettings() {
        // Apply sound setting
        if (!this.settings.sound) {
            // Implement sound muting logic here
        }

        // Apply animation setting
        document.body.classList.toggle('disable-animations', !this.settings.animations);

        // Apply auto-save setting
        if (this.settings.autoSave > 0) {
            this.setupAutoSave();
        } else {
            this.clearAutoSave();
        }
    }

    setupAutoSave() {
        if (this._autoSaveInterval) {
            clearInterval(this._autoSaveInterval);
        }
        this._autoSaveInterval = setInterval(() => {
            saveGame(); // Assuming saveGame() is a global function
            if (this.settings.toastLevel === 'all') {
                showToast('Game auto-saved', 'info');
            }
        }, this.settings.autoSave * 1000);
    }

    clearAutoSave() {
        if (this._autoSaveInterval) {
            clearInterval(this._autoSaveInterval);
            this._autoSaveInterval = null;
        }
    }

    // Getter methods for other parts of the game to access settings
    get isSoundEnabled() {
        return this.settings.sound;
    }

    get areAnimationsEnabled() {
        return this.settings.animations;
    }

    get toastLevel() {
        return this.settings.toastLevel;
    }

    get autoSaveInterval() {
        return this.settings.autoSave;
    }
}

// Initialize settings when the game loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('⚙️ DOM loaded, creating settings...');
    new Settings();
});

// Helper function to show toasts based on importance level
function showToast(message, type = 'info', important = false) {
    if (gameSettings) {
        const toastLevel = gameSettings.toastLevel;
        if (toastLevel === 'none' || (toastLevel === 'important' && !important)) {
            return;
        }
    }
    // Assuming there's an existing showToast function
    window.showToast(message, type);
} 