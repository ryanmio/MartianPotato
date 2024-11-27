// Settings management
class Settings {
    constructor() {
        this.defaultSettings = {
            sound: true,
            animations: true,
            toastLevel: 'all',
            autoSave: 0 // 0 means off
        };
        this.settings = this.loadSettings();
        this.initializeUI();
        this.bindEvents();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        return savedSettings ? { ...this.defaultSettings, ...JSON.parse(savedSettings) } : { ...this.defaultSettings };
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }

    initializeUI() {
        // Initialize UI elements with current settings
        document.getElementById('mute-toggle').checked = this.settings.sound;
        document.getElementById('animations-toggle').checked = this.settings.animations;
        document.getElementById('toast-level').value = this.settings.toastLevel;
        document.getElementById('auto-save').value = this.settings.autoSave.toString();
    }

    bindEvents() {
        // Settings button
        const settingsBtn = document.getElementById('settings-button');
        const settingsModal = document.getElementById('settings-modal');
        const closeBtn = document.querySelector('.close-settings-modal');
        const saveBtn = document.getElementById('save-settings');
        const cancelBtn = document.getElementById('cancel-settings');

        // Open settings modal
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'block';
            this.initializeUI(); // Reset to current settings
        });

        // Close modal handlers
        closeBtn.addEventListener('click', () => settingsModal.style.display = 'none');
        cancelBtn.addEventListener('click', () => settingsModal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });

        // Save settings
        saveBtn.addEventListener('click', () => {
            this.settings.sound = document.getElementById('mute-toggle').checked;
            this.settings.animations = document.getElementById('animations-toggle').checked;
            this.settings.toastLevel = document.getElementById('toast-level').value;
            this.settings.autoSave = parseInt(document.getElementById('auto-save').value);

            this.saveSettings();
            this.applySettings();
            settingsModal.style.display = 'none';

            // Show confirmation toast
            showToast('Settings saved successfully!', 'success');
        });
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
let gameSettings;
document.addEventListener('DOMContentLoaded', () => {
    gameSettings = new Settings();
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