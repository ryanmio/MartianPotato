/**
 * Martian Potato Ads System
 * Handles ad integration, opt-in flow, and reward distribution
 */

class AdsManager {
    constructor() {
        this.isOptedIn = false;
        this.lastAdTime = 0;
        this.adFreeHours = 1; // One hour ad-free period
        this.isInitialized = false;
        this.publisherId = 'ca-pub-2199417995068387';
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.showOptInPrompt = this.showOptInPrompt.bind(this);
        this.handleOptIn = this.handleOptIn.bind(this);
        this.showRewardedAd = this.showRewardedAd.bind(this);
        this.distributeReward = this.distributeReward.bind(this);
        
        // Initialize when DOM is ready
        if (document.readyState === 'complete') {
            this.initialize();
        } else {
            window.addEventListener('load', this.initialize);
        }
    }

    initialize() {
        if (this.isInitialized) return;
        
        // Create opt-in modal
        this.createOptInModal();
        
        // Add watch ad button to the game UI
        this.createWatchAdButton();
        
        // Start checking for the one-hour mark
        this.startAdFreeTimer();
        
        this.isInitialized = true;
        console.log('Ads Manager initialized');
    }

    createOptInModal() {
        const modal = document.createElement('div');
        modal.id = 'ad-optin-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Support Martian Potato</h2>
                <p>Would you like to enable optional video ads? Watch them to earn bonus resources!</p>
                <p>You'll only see ads when you choose to watch them.</p>
                <div class="modal-buttons">
                    <button id="ad-optin-accept" class="settings-button">Enable Ads</button>
                    <button id="ad-optin-decline" class="settings-button">No Thanks</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('ad-optin-accept').addEventListener('click', () => this.handleOptIn(true));
        document.getElementById('ad-optin-decline').addEventListener('click', () => this.handleOptIn(false));
    }

    createWatchAdButton() {
        const button = document.createElement('button');
        button.id = 'watch-ad-button';
        button.className = 'watch-ad-button';
        button.innerHTML = '📺 Watch Ad for Resources';
        button.style.display = 'none';
        button.addEventListener('click', this.showRewardedAd);
        
        // Add to game header buttons
        const gameButtons = document.querySelector('.game-buttons');
        if (gameButtons) {
            gameButtons.appendChild(button);
        }
    }

    startAdFreeTimer() {
        const gameStartTime = window.gameStartTime || Date.now();
        const checkTime = () => {
            const elapsedTime = Date.now() - gameStartTime;
            const hourInMs = this.adFreeHours * 60 * 60 * 1000;
            
            if (elapsedTime >= hourInMs && !this.hasShownOptIn) {
                this.showOptInPrompt();
                this.hasShownOptIn = true;
            }
        };
        
        // Check every minute
        setInterval(checkTime, 60000);
        checkTime(); // Initial check
    }

    showOptInPrompt() {
        const modal = document.getElementById('ad-optin-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    handleOptIn(accepted) {
        this.isOptedIn = accepted;
        const modal = document.getElementById('ad-optin-modal');
        const watchAdButton = document.getElementById('watch-ad-button');
        
        if (modal) {
            modal.style.display = 'none';
        }
        
        if (watchAdButton) {
            watchAdButton.style.display = accepted ? 'block' : 'none';
        }

        // Save preference
        localStorage.setItem('adOptIn', accepted.toString());
        
        // Show appropriate toast message
        if (accepted) {
            window.showToast('Ads Enabled', 'You can now watch ads to earn bonus resources!', 'success');
        } else {
            window.showToast('Ads Disabled', 'You can enable ads later in settings if you change your mind.', 'info');
        }
    }

    showRewardedAd() {
        // Check cooldown
        const now = Date.now();
        const cooldown = 5 * 60 * 1000; // 5 minutes
        if (now - this.lastAdTime < cooldown) {
            const remainingTime = Math.ceil((cooldown - (now - this.lastAdTime)) / 1000);
            window.showToast('Ad Cooldown', `Please wait ${remainingTime} seconds before watching another ad.`, 'warning');
            return;
        }

        // TODO: Replace with actual AdSense rewarded ad implementation
        // For now, simulate ad viewing
        window.showToast('Loading Ad', 'Preparing your reward video...', 'info');
        
        setTimeout(() => {
            // Simulate successful ad completion
            this.distributeReward();
            this.lastAdTime = now;
        }, 1000);
    }

    distributeReward() {
        // Define rewards
        const rewards = {
            potatoes: 100,
            water: 50,
            nutrients: 50,
            ice: 50
        };

        // Add resources
        window.potatoCount += rewards.potatoes;
        window.water += rewards.water;
        window.nutrients += rewards.nutrients;
        window.ice += rewards.ice;

        // Update display
        window.updateDisplay();

        // Show reward message
        window.showToast('Reward Collected!', 
            `You received: ${rewards.potatoes} potatoes, ${rewards.water} water, ${rewards.nutrients} nutrients, and ${rewards.ice} ice!`, 
            'achievement'
        );
    }
}

// Initialize ads manager
window.adsManager = new AdsManager(); 