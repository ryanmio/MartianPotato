// This file implements the exploration system for the Martian Potato game
// It defines exploration mechanics, resource discovery, and autonomous exploration features

// Global variables for exploration mechanics
window.totalExplorationRate = 0;
window.explorationResourceMultiplier = 1;
window.lastExploreTime = 0;
window.exploreDelay = 10000; // 10 seconds initial delay between manual explorations

// Add these global variables at the top of the file
window.waterExplorationMultiplier = 1;
window.polarCapBonusChance = 0;

function exploreMarsSurface() {
    const currentTime = Date.now();
    // Check if enough time has passed since last exploration
    if (currentTime - window.lastExploreTime < window.exploreDelay) {
        const waitTime = ((window.exploreDelay - (currentTime - window.lastExploreTime)) / 1000).toFixed(1);
        showToast("Exploration Cooldown", `You need to wait ${waitTime} seconds before exploring again.`, 'setback');
        return;
    }

    // Calculate rewards for manual exploration
    const waterReward = Math.floor(Math.random() * 5 + 1) * window.explorationResourceMultiplier * window.waterExplorationMultiplier;
    const nutrientReward = Math.floor(Math.random() * 10 + 1) * window.explorationResourceMultiplier;
    const iceReward = Math.floor(Math.random() * 10 + 1) * window.explorationResourceMultiplier;

    // Check for polar cap bonus
    if (Math.random() < window.polarCapBonusChance) {
        const bonusWater = Math.floor(Math.random() * 11 + 10); // 10-20 bonus water
        water += bonusWater;
        showToast("Polar Cap Bonus!", `You've extracted an additional ${bonusWater} water from the Martian polar caps!`, 'achievement');
    }

    // Add rewards to global resource counters
    water += waterReward;
    nutrients += nutrientReward;
    ice += iceReward;

    // Prepare reward message for user feedback
    const rewards = [];
    if (waterReward > 0) rewards.push(`${waterReward.toFixed(1)} water`);
    if (nutrientReward > 0) rewards.push(`${nutrientReward.toFixed(1)} nutrients`);
    if (iceReward > 0) rewards.push(`${iceReward.toFixed(1)} ice`);

    const rewardString = rewards.join(', ').replace(/,([^,]*)$/, ' and$1');

    showToast(
        "Resources Acquired",
        `An exploration of the martian surface yielded: ${rewardString}.`,
        'achievement'
    );

    window.lastExploreTime = currentTime;
    updateDisplay();
    updateExploreButton();
    checkAchievements();
}

// Function to handle autonomous exploration based on total exploration rate
function autonomousExploration() {
    if (window.totalExplorationRate > 0) {
        // Calculate rewards for autonomous exploration
        const waterReward = (Math.random() * 2.5 + 0.5) * window.totalExplorationRate * window.explorationResourceMultiplier * window.waterExplorationMultiplier;
        const nutrientReward = (Math.random() * 5 + 1) * window.totalExplorationRate * window.explorationResourceMultiplier;
        const iceReward = (Math.random() * 5 + 1) * window.totalExplorationRate * window.explorationResourceMultiplier;

        // Check for polar cap bonus
        if (Math.random() < window.polarCapBonusChance) {
            const bonusWater = Math.floor(Math.random() * 11 + 10); // 10-20 bonus water
            water += bonusWater;
        }

        // Add rewards to global resource counters
        water += waterReward;
        nutrients += nutrientReward;
        ice += iceReward;

        updateDisplay();
    }
}

// Function to start or stop autonomous exploration based on total exploration rate
function updateAutonomousExploration() {
    clearInterval(window.autonomousExplorationInterval);
    if (window.totalExplorationRate > 0) {
        window.autonomousExplorationInterval = setInterval(autonomousExploration, 1000);
    }
}

// Set up event listener for manual exploration and initialize autonomous exploration
document.addEventListener('DOMContentLoaded', () => {
    const exploreButton = document.getElementById('explore-button');
    if (exploreButton) {
        exploreButton.innerHTML = '👩‍🚀';
        exploreButton.addEventListener('click', exploreMarsSurface);
    }
    updateAutonomousExploration();
});