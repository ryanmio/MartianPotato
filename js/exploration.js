// This file implements the exploration system for the Martian Potato game
// It defines exploration mechanics, resource discovery, and autonomous exploration features

// Global variables for exploration mechanics
window.explorationResourceMultiplier = 1;
window.lastExploreTime = 0;
window.exploreDelay = 10000; // 10 seconds initial delay between manual explorations
window.waterExplorationMultiplier = 1;

function calculateRandomReward(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function exploreMarsSurface() {
    const exploreCard = document.getElementById('exploration-container');
    if (exploreCard.hasAttribute('disabled')) {
        return;
    }

    const currentTime = Date.now();
    // Check if enough time has passed since last exploration
    if (currentTime - window.lastExploreTime < window.exploreDelay) {
        const waitTime = ((window.exploreDelay - (currentTime - window.lastExploreTime)) / 1000).toFixed(1);
        showToast("Exploration Cooldown", `You need to wait ${waitTime} seconds before exploring again.`, 'setback');
        return;
    }

    // Define reward ranges
    const nutrientMin = 1;
    const nutrientMax = 10;
    const iceMin = 1;
    const iceMax = 10;

    // Calculate rewards for manual exploration with independent randomness
    const nutrientReward = calculateRandomReward(nutrientMin, nutrientMax);
    const iceReward = calculateRandomReward(iceMin, iceMax);

    // Apply multipliers
    const scaledNutrientReward = nutrientReward * window.explorationResourceMultiplier;
    const scaledIceReward = iceReward * window.explorationResourceMultiplier * window.waterExplorationMultiplier;

    // Add rewards to global resource counters
    nutrients += scaledNutrientReward;
    ice += scaledIceReward;

    // Prepare reward message for user feedback
    const rewards = [];
    if (scaledNutrientReward > 0) rewards.push(`${scaledNutrientReward.toFixed(1)} nutrients`);
    if (scaledIceReward > 0) rewards.push(`${scaledIceReward} ice`);

    const rewardString = rewards.join(', ').replace(/,([^,]*)$/, ' and$1');

    showToast(
        "Resources Acquired",
        `An exploration of the Martian surface yielded: ${rewardString}.`,
        'achievement'
    );

    window.lastExploreTime = currentTime;
    updateDisplay();
    updateExploreButton();
    checkAchievements();
}

function initializeExploration() {
    const exploreButton = document.getElementById('explore-button');
    if (exploreButton) {
        exploreButton.innerHTML = '👩‍🚀';
        exploreButton.addEventListener('click', exploreMarsSurface, { passive: true });
    }
}

document.addEventListener('DOMContentLoaded', initializeExploration);