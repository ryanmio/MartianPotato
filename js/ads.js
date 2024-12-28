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
        this.rewardedAdUnit = null; // Will be set once we get the ad unit ID
        this.isAdLoading = false;
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.showOptInPrompt = this.showOptInPrompt.bind(this);
        this.handleOptIn = this.handleOptIn.bind(this);
        this.showRewardedAd = this.showRewardedAd.bind(this);
        this.distributeReward = this.distributeReward.bind(this);
        this.loadRewardedAd = this.loadRewardedAd.bind(this);
        
        // Initialize when DOM is ready
        if (document.readyState === 'complete') {
            this.initialize();
        } else {
            window.addEventListener('load', this.initialize);
        }

        // Restore opt-in preference
        const savedOptIn = localStorage.getItem('adOptIn');
        if (savedOptIn === 'true') {
            this.isOptedIn = true;
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
        
        // Initialize AdSense API when it's ready
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Show watch ad button if previously opted in
        if (this.isOptedIn) {
            const watchAdButton = document.getElementById('watch-ad-button');
            if (watchAdButton) {
                watchAdButton.style.display = 'block';
            }
        }
        
        this.isInitialized = true;
        console.log('Ads Manager initialized');
    }

    async loadRewardedAd() {
        if (!this.rewardedAdUnit || this.isAdLoading) return false;
        
        this.isAdLoading = true;
        try {
            // TODO: Replace with actual rewarded ad unit ID once received
            await window.adsbygoogle.push({
                type: 'rewarded',
                client: this.publisherId,
                slot: 'YOUR_REWARDED_AD_SLOT_ID', // We'll replace this with actual slot ID
            });
            this.isAdLoading = false;
            return true;
        } catch (error) {
            console.error('Error loading rewarded ad:', error);
            this.isAdLoading = false;
            return false;
        }
    }

    createOptInModal() {
        const modal = document.createElement('div');
        modal.id = 'ad-optin-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Hi there, Martian farmer!</h2>
                <p>I'm Ryan, the developer of Martian Potato. To keep the game free and running smoothly, would you consider enabling optional video ads?</p>
                <p>You'll get bonus resources for each ad you watch, and they'll only play when you choose. Every view helps keep our servers running and potatoes growing! 🥔</p>
                <div class="modal-buttons">
                    <button id="ad-optin-accept" class="settings-button">Enable Ads & Support</button>
                    <button id="ad-optin-decline" class="settings-button">Not Now</button>
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

    async showRewardedAd() {
        // Check cooldown
        const now = Date.now();
        const cooldown = 5 * 60 * 1000; // 5 minutes
        if (now - this.lastAdTime < cooldown) {
            const remainingTime = Math.ceil((cooldown - (now - this.lastAdTime)) / 1000);
            window.showToast('Ad Cooldown', `Please wait ${remainingTime} seconds before watching another ad.`, 'warning');
            return;
        }

        // Show loading message
        window.showToast('Loading Ad', 'Preparing your reward video...', 'info');

        // TODO: Replace this with actual AdSense rewarded ad implementation
        if (window.adsbygoogle && this.rewardedAdUnit) {
            try {
                const adLoaded = await this.loadRewardedAd();
                if (!adLoaded) {
                    window.showToast('Ad Error', 'No ads available right now. Please try again later.', 'error');
                    return;
                }
                
                // The ad will handle its own display and callbacks
                this.lastAdTime = now;
            } catch (error) {
                console.error('Error showing rewarded ad:', error);
                window.showToast('Ad Error', 'There was a problem loading the ad. Please try again later.', 'error');
            }
        } else {
            // Simulation mode for testing
            setTimeout(() => {
                this.distributeReward();
                this.lastAdTime = now;
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

        // Track reward distribution
        if (window.gtag) {
            window.gtag('event', 'reward_collected', {
                'event_category': 'Ads',
                'event_label': 'Rewarded Ad',
                'value': rewards.potatoes + rewards.water + rewards.nutrients + rewards.ice
            });
        }
    }

    // Method to set the rewarded ad unit ID once we receive it
    setRewardedAdUnit(unitId) {
        this.rewardedAdUnit = unitId;
        console.log('Rewarded ad unit ID set:', unitId);
    }
}

// Initialize ads manager
window.adsManager = new AdsManager(); 