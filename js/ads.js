class AdsManager {
    constructor() {
        this.isOptedIn = false;
        this.lastAdTime = 0;
        this.adFreeHours = 1; // One hour ad-free period
        this.isInitialized = false;
        this.publisherId = 'ca-pub-2199417995068387';
        this.rewardedAdUnit = null; // Will be set once we get the ad unit ID
        this.isAdLoading = false;
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.handleOptIn = this.handleOptIn.bind(this);
        this.showRewardedAd = this.showRewardedAd.bind(this);
        this.distributeReward = this.distributeReward.bind(this);
        this.createOptInModal = this.createOptInModal.bind(this);
        
        // Load opt-in state from game settings
        const gameSettings = localStorage.getItem('gameSettings');
        if (gameSettings) {
            const settings = JSON.parse(gameSettings);
            this.isOptedIn = settings.ads || false;
        }

        // Initialize when DOM is ready
        if (document.readyState === 'complete') {
            this.initialize();
        } else {
            window.addEventListener('load', this.initialize);
        }
    }

    initialize() {
        if (this.isInitialized) return;
        
        // Show or hide the existing ad container based on opt-in status
        const watchAdCard = document.getElementById('watch-ad-container');
        if (watchAdCard) {
            watchAdCard.style.display = this.isOptedIn ? 'block' : 'none';
            watchAdCard.addEventListener('click', () => this.showRewardedAd());
        }
        
        // Create opt-in modal only if not previously opted in
        if (!this.isOptedIn) {
            this.createOptInModal();
        }
        
        // Initialize AdSense API when it's ready
        window.adsbygoogle = window.adsbygoogle || [];
        
        this.isInitialized = true;
        console.log('Ads Manager initialized');
    }

    handleOptIn(accepted) {
        this.isOptedIn = accepted;
        const modal = document.getElementById('ad-optin-modal');
        const watchAdCard = document.getElementById('watch-ad-container');
        
        if (modal) {
            modal.style.display = 'none';
        }
        
        if (watchAdCard) {
            watchAdCard.style.display = accepted ? 'block' : 'none';
        }

        // Save to game settings
        const gameSettings = localStorage.getItem('gameSettings');
        const settings = gameSettings ? JSON.parse(gameSettings) : {};
        settings.ads = accepted;
        localStorage.setItem('gameSettings', JSON.stringify(settings));
        
        // Show appropriate toast message
        if (accepted) {
            window.showToast('Ads Enabled', 'You can now watch ads to earn bonus resources!', 'success');
        } else {
            window.showToast('Ads Disabled', 'You can enable ads later in settings if you change your mind.', 'info');
        }
    }

    createOptInModal() {
        const modal = document.createElement('div');
        modal.id = 'ad-optin-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Martian Potato</h2>
                <div class="modal-note">
                    <p>Hi there, Martian farmer!</p>
                    <p>I'm Ryan, the developer of Martian Potato. To keep the game free and running smoothly, would you consider enabling optional video ads?</p>
                    <p>You'll get bonus resources for each ad you watch, and they'll only play when you choose. Every view helps keep our servers running and potatoes growing! 🥔</p>
                </div>
                <div class="modal-buttons">
                    <button id="ad-optin-accept">Enable Ads & Support</button>
                    <button id="ad-optin-decline">Not Now</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('ad-optin-accept').addEventListener('click', () => this.handleOptIn(true));
        document.getElementById('ad-optin-decline').addEventListener('click', () => this.handleOptIn(false));

        // Show modal
        modal.style.display = 'block';
    }

    async loadRewardedAd() {
        if (this.isAdLoading) return false;
        this.isAdLoading = true;

        try {
            // For now, simulate ad loading
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.isAdLoading = false;
            return true;
        } catch (error) {
            console.error('Error loading rewarded ad:', error);
            this.isAdLoading = false;
            return false;
        }
    }

    async showRewardedAd() {
        // Check cooldown
        const now = Date.now();
        const cooldown = 5 * 60 * 1000; // 5 minutes
        if (now - this.lastAdTime < cooldown) {
            const remainingTime = Math.ceil((cooldown - (now - this.lastAdTime)) / 1000);
            window.showToast('Ad Cooldown', `Please wait ${remainingTime} seconds before watching another ad.`, 'warning');
            
            // Update cooldown display
            const cooldownElement = document.getElementById('ad-cooldown');
            if (cooldownElement) {
                cooldownElement.textContent = `${Math.ceil(remainingTime / 60)}m ${remainingTime % 60}s`;
            }
            return;
        }

        // Update cooldown display
        const cooldownElement = document.getElementById('ad-cooldown');
        if (cooldownElement) {
            cooldownElement.textContent = 'Loading...';
        }

        // Show loading message
        window.showToast('Loading Ad', 'Preparing your reward video...', 'info');

        // TODO: Replace this with actual AdSense rewarded ad implementation
        if (window.adsbygoogle && this.rewardedAdUnit) {
            try {
                const adLoaded = await this.loadRewardedAd();
                if (!adLoaded) {
                    window.showToast('Ad Error', 'No ads available right now. Please try again later.', 'error');
                    if (cooldownElement) {
                        cooldownElement.textContent = 'Ready';
                    }
                    return;
                }
                
                // The ad will handle its own display and callbacks
                this.lastAdTime = now;
            } catch (error) {
                console.error('Error showing rewarded ad:', error);
                window.showToast('Ad Error', 'There was a problem loading the ad. Please try again later.', 'error');
                if (cooldownElement) {
                    cooldownElement.textContent = 'Ready';
                }
            }
        } else {
            // Simulation mode for testing
            setTimeout(() => {
                this.distributeReward();
                this.lastAdTime = now;
                if (cooldownElement) {
                    cooldownElement.textContent = 'Ready';
                }
            }, 1000);
        }
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

// Initialize AdsManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adsManager = new AdsManager();
}); 